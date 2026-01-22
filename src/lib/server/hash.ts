import { db } from './db';
import { todos } from './db/schema';
import { desc } from 'drizzle-orm';

/**
 * Generates a unique 6-digit hash for a new todo.
 * Sequential numbering starting from 000001, zero-padded.
 */
export async function generateHash(): Promise<string> {
	const lastTodo = await db
		.select({ hash: todos.hash })
		.from(todos)
		.orderBy(desc(todos.hash))
		.limit(1);

	const lastNumber = lastTodo.length > 0 ? parseInt(lastTodo[0].hash, 10) : 0;
	const nextNumber = lastNumber + 1;

	return nextNumber.toString().padStart(6, '0');
}

/**
 * Validates that a hash is in the correct format (6 digits).
 */
export function isValidHash(hash: string): boolean {
	return /^\d{6}$/.test(hash);
}

/**
 * Formats a hash for display with the # prefix.
 */
export function formatHash(hash: string): string {
	return `#${hash}`;
}

/**
 * Parses a display hash (with or without #) to the storage format.
 */
export function parseHash(displayHash: string): string {
	return displayHash.replace(/^#/, '');
}
