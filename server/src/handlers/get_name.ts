import { type GetNameInput, type Name } from '../schema';

export const getName = async (input: GetNameInput): Promise<Name | null> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching a specific name by ID from the database.
    // For the Pedro display app, we'll return Pedro as a default response.
    if (input.id === 1) {
        return {
            id: 1,
            name: "Pedro",
            created_at: new Date()
        } as Name;
    }
    return null;
};