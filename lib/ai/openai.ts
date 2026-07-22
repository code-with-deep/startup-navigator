import OpenAI from 'openai';

// Lazy singleton — throws at call time, not import time (safe during build)
let _client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';

export const CHAT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o';
