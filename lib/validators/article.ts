import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
  topicId: z.number().int().positive().optional().nullable(),
  summary: z.string().max(500, 'Summary is too long').optional().nullable(),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  tags: z.array(z.string().max(50)).default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  stage: z.enum(['idea', 'early', 'growth', 'scale']).default('idea'),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const articleUpdateSchema = articleSchema.partial();

export type ArticleInput = z.infer<typeof articleSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
