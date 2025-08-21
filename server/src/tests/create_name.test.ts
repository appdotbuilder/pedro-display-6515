import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { namesTable } from '../db/schema';
import { type CreateNameInput } from '../schema';
import { createName } from '../handlers/create_name';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateNameInput = {
  name: 'Test Name'
};

describe('createName', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a name', async () => {
    const result = await createName(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Name');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save name to database', async () => {
    const result = await createName(testInput);

    // Query using proper drizzle syntax
    const names = await db.select()
      .from(namesTable)
      .where(eq(namesTable.id, result.id))
      .execute();

    expect(names).toHaveLength(1);
    expect(names[0].name).toEqual('Test Name');
    expect(names[0].id).toEqual(result.id);
    expect(names[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different name values', async () => {
    const testCases = [
      'Simple Name',
      'Name with Numbers 123',
      'Name-with-dashes',
      'Name_with_underscores',
      'A very long name that contains multiple words and should still work correctly'
    ];

    for (const nameValue of testCases) {
      const input: CreateNameInput = { name: nameValue };
      const result = await createName(input);

      expect(result.name).toEqual(nameValue);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);

      // Verify it was saved to database
      const savedNames = await db.select()
        .from(namesTable)
        .where(eq(namesTable.id, result.id))
        .execute();

      expect(savedNames).toHaveLength(1);
      expect(savedNames[0].name).toEqual(nameValue);
    }
  });

  it('should create multiple names with unique IDs', async () => {
    const names = ['First Name', 'Second Name', 'Third Name'];
    const results = [];

    // Create multiple names
    for (const name of names) {
      const result = await createName({ name });
      results.push(result);
    }

    // Verify all have unique IDs
    const ids = results.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toEqual(ids.length);

    // Verify all are saved in database
    for (const result of results) {
      const savedNames = await db.select()
        .from(namesTable)
        .where(eq(namesTable.id, result.id))
        .execute();

      expect(savedNames).toHaveLength(1);
      expect(savedNames[0].name).toEqual(result.name);
    }
  });

  it('should handle special characters in names', async () => {
    const specialNames = [
      "Name with 'single quotes'",
      'Name with "double quotes"',
      'Name with symbols: @#$%^&*()',
      'Accented characters: café résumé',
      'Unicode characters: 👋 Hello World! 🌍'
    ];

    for (const nameValue of specialNames) {
      const input: CreateNameInput = { name: nameValue };
      const result = await createName(input);

      expect(result.name).toEqual(nameValue);
      expect(result.id).toBeDefined();

      // Verify database persistence
      const savedNames = await db.select()
        .from(namesTable)
        .where(eq(namesTable.id, result.id))
        .execute();

      expect(savedNames).toHaveLength(1);
      expect(savedNames[0].name).toEqual(nameValue);
    }
  });

  it('should set created_at timestamp correctly', async () => {
    const beforeCreation = new Date();
    const result = await createName(testInput);
    const afterCreation = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());

    // Verify timestamp is also saved correctly in database
    const savedNames = await db.select()
      .from(namesTable)
      .where(eq(namesTable.id, result.id))
      .execute();

    expect(savedNames[0].created_at).toBeInstanceOf(Date);
    expect(savedNames[0].created_at.getTime()).toEqual(result.created_at.getTime());
  });
});