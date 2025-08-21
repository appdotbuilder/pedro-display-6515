import { type Name } from '../schema';

export const getPedro = async (): Promise<Name> => {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is returning the name "Pedro" for display on the screen.
    // In a real implementation, this would fetch Pedro from the database or return a default.
    return Promise.resolve({
        id: 1,
        name: "Pedro",
        created_at: new Date()
    } as Name);
};