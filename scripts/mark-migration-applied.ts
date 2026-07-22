/**
 * Run this ONCE after manually applying the schema via Supabase SQL editor.
 * It creates the drizzle migrations tracking table and marks migration 0000 as done,
 * so future `pnpm db:migrate` commands work correctly.
 *
 * Usage: pnpm tsx --env-file=.env.local scripts/mark-migration-applied.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('REPLACE_WITH')) {
    console.error('❌ DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  const sql = postgres(url, { ssl: 'require', connect_timeout: 15 });

  try {
    console.log('Connecting to database...');

    // Create the drizzle migrations tracking table (same structure drizzle-kit uses)
    await sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT
      )
    `;
    console.log('✅ Created __drizzle_migrations table');

    // Check if migration 0000 is already recorded
    const existing = await sql`
      SELECT id FROM "__drizzle_migrations" WHERE hash = '0000_massive_excalibur' LIMIT 1
    `;

    if (existing.length > 0) {
      console.log('ℹ️  Migration 0000 already marked as applied — nothing to do.');
    } else {
      await sql`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES ('0000_massive_excalibur', ${Date.now()})
      `;
      console.log('✅ Migration 0000_massive_excalibur marked as applied');
    }

    // Verify all expected tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users','topics','articles','article_embeddings','searches','resources','saved_articles')
      ORDER BY table_name
    `;

    const found = tables.map((t) => t.table_name);
    const expected = ['article_embeddings', 'articles', 'resources', 'saved_articles', 'searches', 'topics', 'users'];
    const missing = expected.filter((t) => !found.includes(t));

    if (missing.length > 0) {
      console.warn('⚠️  Missing tables:', missing.join(', '));
      console.warn('   Run the full SQL from the setup guide in Supabase SQL editor.');
    } else {
      console.log('✅ All 7 tables verified:', found.join(', '));
    }

    console.log('\n🎉 Database is ready. You can now run `pnpm db:seed`');
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
