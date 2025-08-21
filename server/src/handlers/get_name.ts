import { db } from '../db';
import { namesTable } from '../db/schema';
import { type GetNameInput, type Name } from '../schema';
import { eq } from 'drizzle-orm';

export const getName = async (input: GetNameInput): Promise<Name | null> => {
  // Stub implementation - not used by frontend
  const results = await db.select()
    .from(namesTable)
    .where(eq(namesTable.id, input.id))
    .execute();

  return results[0] || null;
};