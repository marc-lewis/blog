import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { tags, todoTags, postTags } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from '$lib/server/api-response';

/**
 * GET /api/admin/tags/:slug - Get a single tag by slug.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { slug } = params;

	const result = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);

	const tag = result[0];

	if (!tag) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Tag not found'), { status: 404 });
	}

	// Get counts
	const todoCountResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(todoTags)
		.where(eq(todoTags.tagSlug, slug));

	const postCountResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(postTags)
		.where(eq(postTags.tagSlug, slug));

	return json(
		successResponse({
			...tag,
			todoCount: Number(todoCountResult[0]?.count ?? 0),
			postCount: Number(postCountResult[0]?.count ?? 0)
		})
	);
};

/**
 * PUT /api/admin/tags/:slug - Update a tag.
 */
export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { slug } = params;
	const body = await request.json();

	const existing = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);

	if (!existing[0]) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Tag not found'), { status: 404 });
	}

	const updateData: Partial<typeof tags.$inferInsert> = {
		updatedAt: new Date()
	};

	if (body.name !== undefined) updateData.name = body.name;
	if (body.description !== undefined) updateData.description = body.description;
	if (body.colour !== undefined) updateData.colour = body.colour;

	const [updated] = await db.update(tags).set(updateData).where(eq(tags.slug, slug)).returning();

	return json(successResponse(updated));
};

/**
 * DELETE /api/admin/tags/:slug - Delete a tag.
 */
export const DELETE: RequestHandler = async ({ locals, params, url }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { slug } = params;
	const force = url.searchParams.get('force') === 'true';

	const existing = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);

	if (!existing[0]) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Tag not found'), { status: 404 });
	}

	// Check if tag is in use
	const todoCountResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(todoTags)
		.where(eq(todoTags.tagSlug, slug));

	const postCountResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(postTags)
		.where(eq(postTags.tagSlug, slug));

	const todoCount = Number(todoCountResult[0]?.count ?? 0);
	const postCount = Number(postCountResult[0]?.count ?? 0);

	if ((todoCount > 0 || postCount > 0) && !force) {
		return json(
			errorResponse(
				ErrorCodes.CONFLICT,
				`Tag is in use by ${todoCount} todo(s) and ${postCount} post(s). Use force=true to delete anyway.`
			),
			{ status: 409 }
		);
	}

	// Delete associations first
	await db.delete(todoTags).where(eq(todoTags.tagSlug, slug));
	await db.delete(postTags).where(eq(postTags.tagSlug, slug));
	await db.delete(tags).where(eq(tags.slug, slug));

	return new Response(null, { status: 204 });
};
