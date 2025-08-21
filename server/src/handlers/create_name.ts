import { db } from '../db';
import { namesTable } from '../db/schema';
import { type CreateNameInput, type Name } from '../schema';

export const createName = async (input: CreateNameInput): Promise<Name> => {
  // Stub implementation - not used by frontend
  const result = await db.insert(namesTable)
    .values({
      name: input.name,
    })
    .returning()
    .execute();

  return result[0];
};