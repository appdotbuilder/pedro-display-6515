import { z } from 'zod';

// Empty schemas for compatibility with existing tests
export const nameSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type Name = z.infer<typeof nameSchema>;

export const createNameInputSchema = z.object({
  name: z.string().min(1, "Name cannot be empty")
});

export type CreateNameInput = z.infer<typeof createNameInputSchema>;

export const getNameInputSchema = z.object({
  id: z.number().int().positive()
});

export type GetNameInput = z.infer<typeof getNameInputSchema>;