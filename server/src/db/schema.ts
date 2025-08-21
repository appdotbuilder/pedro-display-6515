import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

// Keep minimal schema for test compatibility
export const namesTable = pgTable('names', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type Name = typeof namesTable.$inferSelect;
export type NewName = typeof namesTable.$inferInsert;

export const tables = { names: namesTable };