import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { articleEmbeddings } from '@/lib/db/schema';
import { getOpenAI, EMBEDDING_MODEL } from './openai';

// ─── Chunking ────────────────────────────────────────────────────────────────

const CHUNK_SIZE_CHARS = 3200; // ~800 tokens
const CHUNK_OVERLAP_CHARS = 600;

export interface TextChunk {
  text: string;
  index: number;
}

export function chunkText(content: string): TextChunk[] {
  const paragraphs = content.split(/\n\n+/);
  const chunks: TextChunk[] = [];
  let current = '';
  let index = 0;

  for (const para of paragraphs) {
    if ((current + para).length > CHUNK_SIZE_CHARS && current) {
      chunks.push({ text: current.trim(), index: index++ });
      // Overlap: keep the tail of the previous chunk
      current = current.slice(-CHUNK_OVERLAP_CHARS) + '\n\n' + para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }

  if (current.trim()) {
    chunks.push({ text: current.trim(), index });
  }

  return chunks;
}

// ─── Embedding generation ────────────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const { data } = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, ' ').slice(0, 8000),
  });
  return data[0]!.embedding;
}

/**
 * Generate embeddings for multiple texts in a single API call (batched).
 * OpenAI supports up to 2048 inputs per request.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI();
  const { data } = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map((t) => t.replace(/\n/g, ' ').slice(0, 8000)),
  });
  // Sort by index to ensure order
  return data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

// ─── Article embedding ───────────────────────────────────────────────────────

export interface EmbedResult {
  articleId: string;
  chunksCreated: number;
  tokensEstimate: number;
}

export async function embedArticle(
  articleId: string,
  content: string
): Promise<EmbedResult> {
  const chunks = chunkText(content);
  if (chunks.length === 0) {
    return { articleId, chunksCreated: 0, tokensEstimate: 0 };
  }

  // Batch-embed all chunks in one OpenAI call
  const embeddings = await generateEmbeddingsBatch(chunks.map((c) => c.text));

  await db.transaction(async (tx) => {
    // Delete old embeddings for this article
    await tx
      .delete(articleEmbeddings)
      .where(eq(articleEmbeddings.articleId, articleId));

    // Insert fresh embeddings
    await tx.insert(articleEmbeddings).values(
      chunks.map((chunk, i) => ({
        articleId,
        chunkIndex: chunk.index,
        chunkText: chunk.text,
        embedding: embeddings[i]!,
        tokenCount: Math.ceil(chunk.text.length / 4),
      }))
    );
  });

  return {
    articleId,
    chunksCreated: chunks.length,
    tokensEstimate: chunks.reduce((sum, c) => sum + Math.ceil(c.text.length / 4), 0),
  };
}
