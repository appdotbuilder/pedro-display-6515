import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { namesTable } from '../db/schema';
import { getPedro } from '../handlers/get_pedro';
import { eq } from 'drizzle-orm';

describe('getPedro', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create Pedro when he does not exist', async () => {
    // Verify Pedro doesn't exist initially
    const existingPedros = await db.select()
      .from(namesTable)
      .where(eq(namesTable.name, 'Pedro'))
      .execute();
    expect(existingPedros).toHaveLength(0);

    // Call the handler
    const result = await getPedro();

    // Verify the returned result
    expect(result.name).toEqual('Pedro');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify Pedro was actually saved to the database
    const savedPedros = await db.select()
      .from(namesTable)
      .where(eq(namesTable.name, 'Pedro'))
      .execute();
    expect(savedPedros).toHaveLength(1);
    expect(savedPedros[0].name).toEqual('Pedro');
    expect(savedPedros[0].id).toEqual(result.id);
  });

  it('should return existing Pedro when he already exists', async () => {
    // Create Pedro first
    const createResult = await db.insert(namesTable)
      .values({
        name: 'Pedro'
      })
      .returning()
      .execute();

    const originalPedro = createResult[0];

    // Call the handler
    const result = await getPedro();

    // Should return the existing Pedro, not create a new one
    expect(result.id).toEqual(originalPedro.id);
    expect(result.name).toEqual('Pedro');
    expect(result.created_at).toEqual(originalPedro.created_at);

    // Verify only one Pedro exists in the database
    const allPedros = await db.select()
      .from(namesTable)
      .where(eq(namesTable.name, 'Pedro'))
      .execute();
    expect(allPedros).toHaveLength(1);
  });

  it('should return first Pedro when multiple Pedros exist', async () => {
    // Create multiple Pedros (edge case)
    const firstPedro = await db.insert(namesTable)
      .values({
        name: 'Pedro'
      })
      .returning()
      .execute();

    // Add a small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(namesTable)
      .values({
        name: 'Pedro'
      })
      .execute();

    // Call the handler
    const result = await getPedro();

    // Should return the first Pedro due to limit(1)
    expect(result.id).toEqual(firstPedro[0].id);
    expect(result.name).toEqual('Pedro');
    expect(result.created_at).toEqual(firstPedro[0].created_at);

    // Verify multiple Pedros still exist
    const allPedros = await db.select()
      .from(namesTable)
      .where(eq(namesTable.name, 'Pedro'))
      .execute();
    expect(allPedros).toHaveLength(2);
  });

  it('should not interfere with other names in the database', async () => {
    // Create some other names first
    await db.insert(namesTable)
      .values([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' }
      ])
      .execute();

    // Call the handler
    const result = await getPedro();

    // Verify Pedro was created
    expect(result.name).toEqual('Pedro');

    // Verify all names exist in the database
    const allNames = await db.select()
      .from(namesTable)
      .execute();
    expect(allNames).toHaveLength(4);

    const nameList = allNames.map(n => n.name).sort();
    expect(nameList).toEqual(['Alice', 'Bob', 'Charlie', 'Pedro']);
  });

  it('should handle case sensitivity correctly', async () => {
    // Create a name with different casing
    await db.insert(namesTable)
      .values({
        name: 'pedro' // lowercase
      })
      .execute();

    // Call the handler
    const result = await getPedro();

    // Should create a new "Pedro" (capital P) because SQL is case-sensitive
    expect(result.name).toEqual('Pedro');

    // Verify both names exist
    const allNames = await db.select()
      .from(namesTable)
      .execute();
    expect(allNames).toHaveLength(2);

    const nameList = allNames.map(n => n.name).sort();
    expect(nameList).toEqual(['Pedro', 'pedro']);
  });
});