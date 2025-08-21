import { db } from '../db';
import { namesTable } from '../db/schema';
import { type Name } from '../schema';
import { eq } from 'drizzle-orm';

export const getPedro = async (): Promise<Name> => {
  // First try to find existing Pedro
  const existingPedro = await db.select()
    .from(namesTable)
    .where(eq(namesTable.name, 'Pedro'))
    .execute();

  if (existingPedro.length > 0) {
    return existingPedro[0];
  }

  // If Pedro doesn't exist, create him
  const result = await db.insert(namesTable)
    .values({
      name: 'Pedro',
    })
    .returning()
    .execute();

  return result[0];
};