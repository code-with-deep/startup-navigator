import { sql, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { articleEmbeddings, articles, searches } from '@/lib/db/schema';
import { generateEmbedding } from './embeddings';
import { getOpenAI, CHAT_MODEL } from './openai';
import { buildMessages, type SourceRef } from './prompts';
import { redis, CACHE_TTL } from '@/lib/cache/redis';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hashQuery(query: string): string {
  return crypto
    .createHash('sha256')
    .update(query.toLowerCase().trim())
    .digest('hex')
    .slice(0, 24);
}

function cacheKey(query: string): string {
  return `rag:v1:${hashQuery(query)}`;
}

// ─── Vector search ────────────────────────────────────────────────────────────

export interface SearchChunk {
  chunkText: string;
  chunkIndex: number;
  similarity: number;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
}

export async function vectorSearch(
  queryEmbedding: number[],
  limit = 5,
  minSimilarity = 0.3
): Promise<SearchChunk[]> {
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  // pgvector cosine similarity: 1 - (embedding <=> query)
  const rows = await db
    .select({
      chunkText: articleEmbeddings.chunkText,
      chunkIndex: articleEmbeddings.chunkIndex,
      articleId: articleEmbeddings.articleId,
      articleTitle: articles.title,
      articleSlug: articles.slug,
      similarity: sql<number>`1 - (${articleEmbeddings.embedding} <=> ${embeddingStr}::vector)`,
    })
    .from(articleEmbeddings)
    .innerJoin(articles, sql`${articles.id} = ${articleEmbeddings.articleId}`)
    .where(
      sql`1 - (${articleEmbeddings.embedding} <=> ${embeddingStr}::vector) > ${minSimilarity}`
    )
    .orderBy(
      desc(sql`1 - (${articleEmbeddings.embedding} <=> ${embeddingStr}::vector)`)
    )
    .limit(limit);

  return rows as SearchChunk[];
}

// ─── Cached RAG response ──────────────────────────────────────────────────────

interface CachedEntry {
  response: string;
  sources: SourceRef[];
}

// ─── Main RAG function (returns a streaming ReadableStream) ───────────────────

export async function ragSearch(
  query: string,
  userId?: string,
  sessionId?: string
): Promise<{ stream: ReadableStream<Uint8Array>; cached: boolean }> {
  const startTime = Date.now();
  const key = cacheKey(query);

  // ── 1. Cache check ──────────────────────────────────────────────────────────
  let cached: CachedEntry | null = null;
  try {
    cached = await redis.get<CachedEntry>(key);
  } catch {
    // Redis not configured — skip cache
  }

  if (cached) {
    // Log cached search
    void db.insert(searches).values({
      userId: userId ?? null,
      sessionId,
      query,
      response: cached.response,
      sources: cached.sources,
      isCached: true,
      responseTime: Date.now() - startTime,
    });

    // Return as a stream so the client doesn't need special handling
    const text = cached.response;
    return {
      cached: true,
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(text));
          controller.close();
        },
      }),
    };
  }

  // ── 2. Generate query embedding ─────────────────────────────────────────────
  const queryEmbedding = await generateEmbedding(query);

  // ── 3. Vector search ────────────────────────────────────────────────────────
  const chunks = await vectorSearch(queryEmbedding, 6);

  // De-duplicate articles (keep best chunk per article)
  const seenArticles = new Set<string>();
  const topChunks = chunks.filter((c) => {
    if (seenArticles.has(c.articleId)) return false;
    seenArticles.add(c.articleId);
    return true;
  });

  const sources: SourceRef[] = topChunks.map((c) => ({
    articleId: c.articleId,
    title: c.articleTitle,
    slug: c.articleSlug,
    similarity: c.similarity,
    chunkIndex: c.chunkIndex,
  }));

  const contextChunks = topChunks.map((c) => ({
    text: c.chunkText,
    articleTitle: c.articleTitle,
    index: c.chunkIndex,
  }));

  const messages = buildMessages(query, contextChunks);

  // ── 4. Stream GPT-4o ────────────────────────────────────────────────────────
  const openai = getOpenAI();
  const openaiStream = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    stream: true,
    max_tokens: 1024,
    temperature: 0.3,
  });

  // ── 5. Build our own ReadableStream that also collects the full response ─────
  let fullResponse = '';

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of openaiStream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            fullResponse += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        // ── 6. Cache the complete response ──────────────────────────────────
        const entry: CachedEntry = { response: fullResponse, sources };
        try {
          await redis.set(key, entry, { ex: CACHE_TTL.ragResponse });
        } catch {
          // Redis not configured — skip caching
        }

        // ── 7. Persist search record ─────────────────────────────────────────
        await db.insert(searches).values({
          userId: userId ?? null,
          sessionId,
          query,
          response: fullResponse,
          sources,
          isCached: false,
          responseTime: Date.now() - startTime,
          tokensUsed: Math.ceil(fullResponse.length / 4),
        });

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return { stream, cached: false };
}

// ─── Source helpers ───────────────────────────────────────────────────────────

/**
 * Given a completed streamed response, extract source references from the
 * most recently saved search record for this query+user combination.
 */
export async function getSearchSources(query: string, userId?: string): Promise<SourceRef[]> {
  const rows = await db.query.searches.findFirst({
    where: (s, { and, eq: deq, isNotNull }) =>
      userId
        ? and(deq(s.query, query), deq(s.userId, userId))
        : deq(s.query, query),
    orderBy: (s) => desc(s.createdAt),
    columns: { sources: true },
  });
  return (rows?.sources as SourceRef[]) ?? [];
}
