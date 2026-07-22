import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  index,
  uniqueIndex,
  serial,
  jsonb,
  customType,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── pgvector custom type ────────────────────────────────────────────────────
const vector = customType<{ data: number[]; driverData: string; config: { length: number } }>({
  dataType(config) {
    return `vector(${config?.length ?? 1536})`;
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value) as number[];
  },
});

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    name: text('name'),
    imageUrl: text('image_url'),
    passwordHash: text('password_hash').notNull(),
    refreshTokenHash: text('refresh_token_hash'),
    role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
    isBanned: boolean('is_banned').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [index('idx_users_email').on(t.email)]
);

// ─── TOPICS ──────────────────────────────────────────────────────────────────
export const topics = pgTable('topics', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── ARTICLES ────────────────────────────────────────────────────────────────
export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: integer('topic_id').references(() => topics.id, { onDelete: 'set null' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    summary: text('summary'),
    content: text('content').notNull(),
    tags: text('tags').array().default([]).notNull(),
    difficulty: text('difficulty', {
      enum: ['beginner', 'intermediate', 'advanced'],
    })
      .default('beginner')
      .notNull(),
    stage: text('stage', { enum: ['idea', 'early', 'growth', 'scale'] })
      .default('idea')
      .notNull(),
    readingTime: integer('reading_time'),
    isPublished: boolean('is_published').default(false).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    index('idx_articles_topic').on(t.topicId),
    index('idx_articles_slug').on(t.slug),
    index('idx_articles_published').on(t.isPublished),
  ]
);

// ─── ARTICLE EMBEDDINGS ──────────────────────────────────────────────────────
export const articleEmbeddings = pgTable(
  'article_embeddings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    chunkText: text('chunk_text').notNull(),
    embedding: vector('embedding', { length: 1536 }),
    tokenCount: integer('token_count'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('idx_embeddings_unique').on(t.articleId, t.chunkIndex)]
);

// ─── SEARCHES ────────────────────────────────────────────────────────────────
export const searches = pgTable(
  'searches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    sessionId: text('session_id'),
    query: text('query').notNull(),
    response: text('response'),
    sources: jsonb('sources')
      .$type<{ articleId: string; title: string; similarity: number }[]>()
      .default([]),
    tokensUsed: integer('tokens_used'),
    responseTime: integer('response_time'),
    isCached: boolean('is_cached').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    index('idx_searches_user').on(t.userId),
    index('idx_searches_created').on(t.createdAt),
  ]
);

// ─── RESOURCES ───────────────────────────────────────────────────────────────
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: integer('topic_id').references(() => topics.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  type: text('type', { enum: ['tool', 'template', 'guide', 'video'] })
    .default('tool')
    .notNull(),
  tags: text('tags').array().default([]).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── SAVED ARTICLES ──────────────────────────────────────────────────────────
export const savedArticles = pgTable(
  'saved_articles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    articleId: uuid('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    savedAt: timestamp('saved_at').defaultNow().notNull(),
  },
  (t) => [index('idx_saved_user').on(t.userId)]
);

// ─── RELATIONS ───────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  searches: many(searches),
  savedArticles: many(savedArticles),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  articles: many(articles),
  resources: many(resources),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  topic: one(topics, { fields: [articles.topicId], references: [topics.id] }),
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
  embeddings: many(articleEmbeddings),
  savedBy: many(savedArticles),
}));

export const articleEmbeddingsRelations = relations(articleEmbeddings, ({ one }) => ({
  article: one(articles, { fields: [articleEmbeddings.articleId], references: [articles.id] }),
}));

export const searchesRelations = relations(searches, ({ one }) => ({
  user: one(users, { fields: [searches.userId], references: [users.id] }),
}));

export const savedArticlesRelations = relations(savedArticles, ({ one }) => ({
  user: one(users, { fields: [savedArticles.userId], references: [users.id] }),
  article: one(articles, { fields: [savedArticles.articleId], references: [articles.id] }),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  topic: one(topics, { fields: [resources.topicId], references: [topics.id] }),
}));
