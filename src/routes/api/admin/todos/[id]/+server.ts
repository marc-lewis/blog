import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { todos, todoTags, tags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from '$lib/server/api-response';

/**
 * GET /api/admin/todos/:id - Get a single todo by ID.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { id } = params;

	const result = await db.select().from(todos).where(eq(todos.id, id)).limit(1);

	const todo = result[0];

	if (!todo) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Todo not found'), { status: 404 });
	}

	// Get tags
	const todoTagsResult = await db
		.select({ slug: tags.slug })
		.from(todoTags)
		.innerJoin(tags, eq(todoTags.tagSlug, tags.slug))
		.where(eq(todoTags.todoId, id));

	return json(
		successResponse({
			...todo,
			tags: todoTagsResult.map((t) => t.slug)
		})
	);
};

/**
 * PUT /api/admin/todos/:id - Update a todo.
 */
export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { id } = params;
	const body = await request.json();

	// Check todo exists
	const existing = await db.select().from(todos).where(eq(todos.id, id)).limit(1);

	if (!existing[0]) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Todo not found'), { status: 404 });
	}

	// Build update object
	const updateData: Partial<typeof todos.$inferInsert> = {
		updatedAt: new Date()
	};

	if (body.emoji !== undefined) updateData.emoji = body.emoji;
	if (body.description !== undefined) updateData.description = body.description;
	if (body.completed !== undefined) {
		updateData.completed = body.completed;
		if (body.completed && !existing[0].completedAt) {
			updateData.completedAt = new Date();
		} else if (!body.completed) {
			updateData.completedAt = null;
		}
	}

	const [updated] = await db.update(todos).set(updateData).where(eq(todos.id, id)).returning();

	// Update tags if provided
	if (body.tags !== undefined) {
		// Remove existing tags
		await db.delete(todoTags).where(eq(todoTags.todoId, id));

		// Add new tags
		if (body.tags.length > 0) {
			await db.insert(todoTags).values(
				body.tags.map((tag: string) => ({
					todoId: id,
					tagSlug: tag
				}))
			);
		}
	}

	// Get updated tags
	const todoTagsResult = await db
		.select({ slug: tags.slug })
		.from(todoTags)
		.innerJoin(tags, eq(todoTags.tagSlug, tags.slug))
		.where(eq(todoTags.todoId, id));

	return json(
		successResponse({
			...updated,
			tags: todoTagsResult.map((t) => t.slug)
		})
	);
};

/**
 * DELETE /api/admin/todos/:id - Soft delete a todo.
 */
export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { id } = params;

	// Check todo exists
	const existing = await db.select().from(todos).where(eq(todos.id, id)).limit(1);

	if (!existing[0]) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Todo not found'), { status: 404 });
	}

	// Soft delete by marking as completed
	await db
		.update(todos)
		.set({
			completed: true,
			completedAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(todos.id, id));

	return new Response(null, { status: 204 });
};
