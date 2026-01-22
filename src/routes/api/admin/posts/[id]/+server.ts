import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, postTags, postHashes, tags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from '$lib/server/api-response';

/**
 * GET /api/admin/posts/:id - Get a single post by ID.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { id } = params;

	const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

	const post = result[0];

	if (!post) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Post not found'), { status: 404 });
	}

	// Get tags
	const postTagsResult = await db
		.select({ slug: tags.slug })
		.from(postTags)
		.innerJoin(tags, eq(postTags.tagSlug, tags.slug))
		.where(eq(postTags.postId, id));

	// Get hashes
	const hashesResult = await db
		.select({ hash: postHashes.hash })
		.from(postHashes)
		.where(eq(postHashes.postId, id));

	return json(
		successResponse({
			...post,
			tags: postTagsResult.map((t) => t.slug),
			hashes: hashesResult.map((h) => h.hash)
		})
	);
};

/**
 * PUT /api/admin/posts/:id - Update a post.
 */
export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { id } = params;
	const body = await request.json();

	const existing = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

	if (!existing[0]) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Post not found'), { status: 404 });
	}

	const updateData: Partial<typeof posts.$inferInsert> = {
		updatedAt: new Date()
	};

	if (body.title !== undefined) updateData.title = body.title;
	if (body.slug !== undefined) updateData.slug = body.slug;
	if (body.description !== undefined) updateData.description = body.description;
	if (body.content !== undefined) updateData.content = body.content;
	if (body.published !== undefined) {
		updateData.published = body.published;
		if (body.published && !existing[0].publishedAt) {
			updateData.publishedAt = new Date();
		}
	}

	const [updated] = await db.update(posts).set(updateData).where(eq(posts.id, id)).returning();

	// Update tags if provided
	if (body.tags !== undefined) {
		await db.delete(postTags).where(eq(postTags.postId, id));

		if (body.tags.length > 0) {
			await db.insert(postTags).values(
				body.tags.map((tag: string) => ({
					postId: id,
					tagSlug: tag
				}))
			);
		}
	}

	// Update hashes if provided
	if (body.hashes !== undefined) {
		await db.delete(postHashes).where(eq(postHashes.postId, id));

		if (body.hashes.length > 0) {
			await db.insert(postHashes).values(
				body.hashes.map((hash: string) => ({
					postId: id,
					hash
				}))
			);
		}
	}

	// Get updated tags and hashes
	const postTagsResult = await db
		.select({ slug: tags.slug })
		.from(postTags)
		.innerJoin(tags, eq(postTags.tagSlug, tags.slug))
		.where(eq(postTags.postId, id));

	const hashesResult = await db
		.select({ hash: postHashes.hash })
		.from(postHashes)
		.where(eq(postHashes.postId, id));

	return json(
		successResponse({
			...updated,
			tags: postTagsResult.map((t) => t.slug),
			hashes: hashesResult.map((h) => h.hash)
		})
	);
};

/**
 * DELETE /api/admin/posts/:id - Delete a post.
 */
export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { id } = params;

	const existing = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

	if (!existing[0]) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Post not found'), { status: 404 });
	}

	// Delete associated tags and hashes first (cascade should handle this, but being explicit)
	await db.delete(postTags).where(eq(postTags.postId, id));
	await db.delete(postHashes).where(eq(postHashes.postId, id));
	await db.delete(posts).where(eq(posts.id, id));

	return new Response(null, { status: 204 });
};
