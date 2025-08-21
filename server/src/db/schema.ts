import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const namesTable = pgTable('names', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Name = typeof namesTable.$inferSelect; // For SELECT operations
export type NewName = typeof namesTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { names: namesTable };