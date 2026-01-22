import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { tags, todoTags, postTags } from '$lib/server/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from '$lib/server/api-response';
import { validateTagCreate } from '$lib/server/validation';
import { generateSlug } from '$lib/server/slug';

/**
 * GET /api/admin/tags - List all tags with usage counts.
 */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const results = await db.select().from(tags).orderBy(asc(tags.name));

	// Get counts for each tag
	const tagsWithCounts = await Promise.all(
		results.map(async (tag) => {
			const todoCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(todoTags)
				.where(eq(todoTags.tagSlug, tag.slug));

			const postCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(postTags)
				.where(eq(postTags.tagSlug, tag.slug));

			return {
				...tag,
				todoCount: Number(todoCountResult[0]?.count ?? 0),
				postCount: Number(postCountResult[0]?.count ?? 0)
			};
		})
	);

	return json(successResponse(tagsWithCounts));
};

/**
 * POST /api/admin/tags - Create a new tag.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const body = await request.json();
	const validation = validateTagCreate(body);

	if (!validation.valid) {
		return json(
			errorResponse(ErrorCodes.VALIDATION_ERROR, validation.errors[0].message, {
				field: validation.errors[0].field
			}),
			{ status: 400 }
		);
	}

	const slug = generateSlug(body.name);

	// Check slug uniqueness
	const existingSlug = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);

	if (existingSlug[0]) {
		return json(errorResponse(ErrorCodes.CONFLICT, 'A tag with this name already exists'), {
			status: 409
		});
	}

	const id = crypto.randomUUID();

	const [tag] = await db
		.insert(tags)
		.values({
			id,
			slug,
			name: body.name,
			description: body.description ?? null,
			colour: body.colour ?? null
		})
		.returning();

	return json(successResponse(tag), { status: 201 });
};
