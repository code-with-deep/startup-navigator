/**
 * Embeds all published articles into pgvector.
 * Run: pnpm tsx --env-file=.env.local scripts/embed-articles.ts
 */
import { db } from '../lib/db/index';
import { articles } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { embedArticle } from '../lib/ai/embeddings';

async function main() {
  console.log('🤖 Starting article embedding...\n');

  const allArticles = await db
    .select({ id: articles.id, title: articles.title, content: articles.content })
    .from(articles)
    .where(eq(articles.isPublished, true));

  console.log(`Found ${allArticles.length} published articles\n`);

  let success = 0;
  let failed = 0;

  for (const article of allArticles) {
    process.stdout.write(`  Embedding: ${article.title.slice(0, 60)}... `);
    try {
      const result = await embedArticle(article.id, article.content);
      console.log(`✅ ${result.chunksCreated} chunks`);
      success++;
      // Rate limit protection: ~200ms between articles
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.log(`❌ ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n✅ Embedded: ${success} articles`);
  if (failed > 0) console.log(`❌ Failed: ${failed} articles`);
  console.log('\n🎉 Done! Articles are now searchable via AI.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
