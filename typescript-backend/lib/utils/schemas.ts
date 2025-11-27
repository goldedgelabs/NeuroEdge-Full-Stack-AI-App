import { z } from 'zod';

export const UpsertVectorSchema = z.object({
  id: z.string().min(1),
  vector: z.array(z.number()).min(1),
  shared: z.boolean().optional()
});

export const ProactiveRequestSchema = z.object({
  type: z.string().min(1),
  params: z.record(z.any()).optional()
});
