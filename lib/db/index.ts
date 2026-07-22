import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var _pgClient: postgres.Sql | undefined;
  // eslint-disable-next-line no-var
  var _db: PostgresJsDatabase<typeof schema> | undefined;
}

function createClient(url: string): postgres.Sql {
  return postgres(url, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15,
    // Always require SSL — Supabase mandates it in all environments
    ssl: 'require',
    onnotice: () => {}, // suppress NOTICE messages
  });
}

function clearDbCache() {
  global._pgClient = undefined;
  global._db = undefined;
}

function getDb(): PostgresJsDatabase<typeof schema> {
  if (global._db) return global._db;

  const url = process.env.DATABASE_URL;
  if (!url || url.startsWith('REPLACE_WITH')) {
    throw new Error(
      'DATABASE_URL is not configured. Please fill in your .env.local file with a valid Supabase connection string.'
    );
  }

  const client = global._pgClient ?? createClient(url);

  if (process.env.NODE_ENV !== 'production') {
    global._pgClient = client;
  }

  const db = drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

  if (process.env.NODE_ENV !== 'production') {
    global._db = db;
  }

  return db;
}

// Lazy proxy — DB connection is only established when a query is actually made.
// On ENOTFOUND / connection errors, the global cache is cleared so the next
// request will create a fresh connection (important when Supabase resumes).
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof PostgresJsDatabase<typeof schema>];

    // Wrap functions to intercept connection errors and clear stale pool
    if (typeof value === 'function') {
      return (...args: unknown[]) => {
        const result = (value as (...a: unknown[]) => unknown).apply(instance, args);
        if (result instanceof Promise) {
          return result.catch((err: unknown) => {
            // Clear cached client if DB is unreachable so it reconnects next time
            if (
              err instanceof Error &&
              (err.message.includes('ENOTFOUND') ||
                err.message.includes('ECONNREFUSED') ||
                err.message.includes('ECONNRESET') ||
                err.message.includes('connection timeout'))
            ) {
              clearDbCache();
            }
            throw err;
          });
        }
        return result;
      };
    }

    return value;
  },
});
