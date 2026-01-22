import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { todos, todoTags, tags } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { successResponse } from '$lib/server/api-response';

/**
 * GET /api/todos - List uncompleted todos (public view).
 */
export const GET: RequestHandler = async () => {
	// Get all todos with their IDs for tag lookup
	const todosWithIds = await db
		.select({
			id: todos.id,
			hash: todos.hash,
			emoji: todos.emoji,
			description: todos.description
		})
		.from(todos)
		.where(eq(todos.completed, false))
		.orderBy(asc(todos.createdAt));

	// Get tags for each todo
	const todosWithTags = await Promise.all(
		todosWithIds.map(async (todo) => {
			const todoTagsResult = await db
				.select({ slug: tags.slug })
				.from(todoTags)
				.innerJoin(tags, eq(todoTags.tagSlug, tags.slug))
				.where(eq(todoTags.todoId, todo.id));

			return {
				hash: todo.hash,
				emoji: todo.emoji,
				description: todo.description,
				tags: todoTagsResult.map((t) => t.slug)
			};
		})
	);

	return json(successResponse(todosWithTags));
};
