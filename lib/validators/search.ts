import { z } from 'zod';

export const searchSchema = z.object({
  query: z
    .string()
    .min(3, 'Query must be at least 3 characters')
    .max(500, 'Query is too long — keep it under 500 characters')
    .trim()
    .refine(
      (val) => !/<script|javascript:|on\w+=/i.test(val),
      'Query contains invalid characters'
    ),
});

export type SearchInput = z.infer<typeof searchSchema>;
