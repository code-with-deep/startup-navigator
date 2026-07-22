import { z } from 'zod';

export const resourceSchema = z.object({
  topicId: z.number().int().positive().optional().nullable(),
  title: z.string().min(3, 'Title too short').max(200),
  description: z.string().max(500).optional().nullable(),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['tool', 'template', 'guide', 'video']).default('tool'),
  tags: z.array(z.string().max(50)).default([]),
  isFeatured: z.boolean().default(false),
});

export const resourceUpdateSchema = resourceSchema.partial();

export type ResourceInput = z.infer<typeof resourceSchema>;
export type ResourceUpdateInput = z.infer<typeof resourceUpdateSchema>;
