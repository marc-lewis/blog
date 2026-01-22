import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { todos, todoTags, tags } from '$lib/server/db/schema';
import { eq, desc, and, like } from 'drizzle-orm';
import {
	successResponse,
	errorResponse,
	ErrorCodes,
	getPaginationParams
} from '$lib/server/api-response';
import { generateHash } from '$lib/server/hash';
import { validateTodoCreate } from '$lib/server/validation';

/**
 * GET /api/admin/todos - List all todos (including completed).
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { page, limit, offset } = getPaginationParams(url, { page: 1, limit: 50 });
	const completedFilter = url.searchParams.get('completed');
	const tagFilter = url.searchParams.get('tag');
	const searchQuery = url.searchParams.get('search');

	// Build base query conditions
	const conditions = [];

	if (completedFilter !== null) {
		conditions.push(eq(todos.completed, completedFilter === 'true'));
	}

	if (searchQuery) {
		conditions.push(like(todos.description, `%${searchQuery}%`));
	}

	// Get todos
	let results;
	if (tagFilter) {
		results = await db
			.select({
				id: todos.id,
				hash: todos.hash,
				emoji: todos.emoji,
				description: todos.description,
				completed: todos.completed,
				createdAt: todos.createdAt,
				updatedAt: todos.updatedAt,
				completedAt: todos.completedAt
			})
			.from(todos)
			.innerJoin(todoTags, eq(todos.id, todoTags.todoId))
			.where(conditions.length > 0 ? and(...conditions, eq(todoTags.tagSlug, tagFilter)) : eq(todoTags.tagSlug, tagFilter))
			.orderBy(desc(todos.createdAt))
			.limit(limit)
			.offset(offset);
	} else {
		results = await db
			.select()
			.from(todos)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(todos.createdAt))
			.limit(limit)
			.offset(offset);
	}

	// Get tags for each todo
	const todosWithTags = await Promise.all(
		results.map(async (todo) => {
			const todoTagsResult = await db
				.select({ slug: tags.slug })
				.from(todoTags)
				.innerJoin(tags, eq(todoTags.tagSlug, tags.slug))
				.where(eq(todoTags.todoId, todo.id));

			return {
				...todo,
				tags: todoTagsResult.map((t) => t.slug)
			};
		})
	);

	// Get total count
	const countResult = await db.select({ id: todos.id }).from(todos);

	return json(
		successResponse(todosWithTags, {
			total: countResult.length,
			page,
			limit
		})
	);
};

/**
 * POST /api/admin/todos - Create a new todo.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const body = await request.json();
	const validation = validateTodoCreate(body);

	if (!validation.valid) {
		return json(
			errorResponse(ErrorCodes.VALIDATION_ERROR, validation.errors[0].message, {
				field: validation.errors[0].field
			}),
			{ status: 400 }
		);
	}

	const hash = await generateHash();
	const id = crypto.randomUUID();

	const [todo] = await db
		.insert(todos)
		.values({
			id,
			hash,
			emoji: body.emoji,
			description: body.description
		})
		.returning();

	// Add tags if provided
	if (body.tags?.length) {
		await db.insert(todoTags).values(
			body.tags.map((tag: string) => ({
				todoId: id,
				tagSlug: tag
			}))
		);
	}

	return json(
		successResponse({
			...todo,
			tags: body.tags ?? []
		}),
		{ status: 201 }
	);
};
