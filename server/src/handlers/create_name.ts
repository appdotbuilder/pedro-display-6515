import { type CreateNameInput, type Name } from '../schema';

export const createName = async (input: CreateNameInput): Promise<Name> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is creating a new name entry and persisting it in the database.
    return Promise.resolve({
        id: 1, // Placeholder ID
        name: input.name,
        created_at: new Date() // Placeholder date
    } as Name);
};