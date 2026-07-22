import { config } from 'dotenv';
config({ path: '.env.local' });

import postgres from 'postgres';

const url = process.env.DATABASE_URL;
console.log('Connecting to:', url?.replace(/:([^:@]+)@/, ':***@'));

const sql = postgres(url!, { ssl: 'require', connect_timeout: 15 });

async function main() {
  try {
    const result = await sql`SELECT current_database(), version()`;
    console.log('✅ Connected successfully!');
    console.log('Database:', result[0].current_database);
    
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('\nTables in DB:');
    tables.forEach(t => console.log(' -', t.table_name));
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    await sql.end();
  }
}

main();
