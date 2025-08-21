import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { namesTable } from '../db/schema';
import { type GetNameInput } from '../schema';
import { getName } from '../handlers/get_name';
import { eq } from 'drizzle-orm';

describe('getName', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return name when ID exists', async () => {
    // Create a test name record
    const insertResult = await db.insert(namesTable)
      .values({
        name: 'Test Name'
      })
      .returning()
      .execute();

    const createdName = insertResult[0];

    // Test input
    const testInput: GetNameInput = {
      id: createdName.id
    };

    const result = await getName(testInput);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdName.id);
    expect(result!.name).toEqual('Test Name');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.created_at).toEqual(createdName.created_at);
  });

  it('should return null when ID does not exist', async () => {
    const testInput: GetNameInput = {
      id: 999 // Non-existent ID
    };

    const result = await getName(testInput);

    expect(result).toBeNull();
  });

  it('should return correct name when multiple names exist', async () => {
    // Create multiple test name records
    const names = await db.insert(namesTable)
      .values([
        { name: 'First Name' },
        { name: 'Second Name' },
        { name: 'Third Name' }
      ])
      .returning()
      .execute();

    // Get the second name
    const testInput: GetNameInput = {
      id: names[1].id
    };

    const result = await getName(testInput);

    // Verify we got the correct name
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(names[1].id);
    expect(result!.name).toEqual('Second Name');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should handle database query correctly', async () => {
    // Create a test name with specific properties
    const testNameData = {
      name: 'Database Test Name'
    };

    const insertResult = await db.insert(namesTable)
      .values(testNameData)
      .returning()
      .execute();

    const createdName = insertResult[0];

    // Query using the handler
    const testInput: GetNameInput = {
      id: createdName.id
    };

    const result = await getName(testInput);

    // Verify all fields match
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdName.id);
    expect(result!.name).toEqual(testNameData.name);
    expect(result!.created_at).toBeInstanceOf(Date);

    // Verify the record still exists in database
    const dbCheck = await db.select()
      .from(namesTable)
      .where(eq(namesTable.id, createdName.id))
      .execute();

    expect(dbCheck).toHaveLength(1);
    expect(dbCheck[0].name).toEqual(testNameData.name);
  });

  it('should handle edge case with ID 1', async () => {
    // Create a name record
    const insertResult = await db.insert(namesTable)
      .values({
        name: 'Edge Case Name'
      })
      .returning()
      .execute();

    const createdName = insertResult[0];

    // Test with the actual created ID (should be 1 if it's the first record)
    const testInput: GetNameInput = {
      id: createdName.id
    };

    const result = await getName(testInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdName.id);
    expect(result!.name).toEqual('Edge Case Name');
  });
});