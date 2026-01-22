import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, postTags, postHashes, tags } from '$lib/server/db/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import {
	successResponse,
	errorResponse,
	ErrorCodes,
	getPaginationParams
} from '$lib/server/api-response';
import { validatePostCreate } from '$lib/server/validation';
import { generateSlug } from '$lib/server/slug';

/**
 * GET /api/admin/posts - List all posts (including drafts).
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const { page, limit, offset } = getPaginationParams(url, { page: 1, limit: 20 });
	const publishedFilter = url.searchParams.get('published');
	const tagFilter = url.searchParams.get('tag');
	const searchQuery = url.searchParams.get('search');

	const conditions = [];

	if (publishedFilter !== null) {
		conditions.push(eq(posts.published, publishedFilter === 'true'));
	}

	if (searchQuery) {
		conditions.push(
			or(like(posts.title, `%${searchQuery}%`), like(posts.content, `%${searchQuery}%`))
		);
	}

	let results;
	if (tagFilter) {
		results = await db
			.select({
				id: posts.id,
				slug: posts.slug,
				title: posts.title,
				description: posts.description,
				published: posts.published,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				publishedAt: posts.publishedAt
			})
			.from(posts)
			.innerJoin(postTags, eq(posts.id, postTags.postId))
			.where(
				conditions.length > 0
					? and(...conditions, eq(postTags.tagSlug, tagFilter))
					: eq(postTags.tagSlug, tagFilter)
			)
			.orderBy(desc(posts.createdAt))
			.limit(limit)
			.offset(offset);
	} else {
		results = await db
			.select({
				id: posts.id,
				slug: posts.slug,
				title: posts.title,
				description: posts.description,
				published: posts.published,
				createdAt: posts.createdAt,
				updatedAt: posts.updatedAt,
				publishedAt: posts.publishedAt
			})
			.from(posts)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(posts.createdAt))
			.limit(limit)
			.offset(offset);
	}

	// Get tags for each post
	const postsWithTags = await Promise.all(
		results.map(async (post) => {
			const postTagsResult = await db
				.select({ slug: tags.slug })
				.from(postTags)
				.innerJoin(tags, eq(postTags.tagSlug, tags.slug))
				.where(eq(postTags.postId, post.id));

			return {
				...post,
				tags: postTagsResult.map((t) => t.slug)
			};
		})
	);

	const countResult = await db.select({ id: posts.id }).from(posts);

	return json(
		successResponse(postsWithTags, {
			total: countResult.length,
			page,
			limit
		})
	);
};

/**
 * POST /api/admin/posts - Create a new post.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.session) {
		return json(errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required'), { status: 401 });
	}

	const body = await request.json();
	const validation = validatePostCreate(body);

	if (!validation.valid) {
		return json(
			errorResponse(ErrorCodes.VALIDATION_ERROR, validation.errors[0].message, {
				field: validation.errors[0].field
			}),
			{ status: 400 }
		);
	}

	// Generate slug if not provided
	const slug = body.slug || generateSlug(body.title);

	// Check slug uniqueness
	const existingSlug = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);

	if (existingSlug[0]) {
		return json(errorResponse(ErrorCodes.CONFLICT, 'A post with this slug already exists'), {
			status: 409
		});
	}

	const id = crypto.randomUUID();

	const [post] = await db
		.insert(posts)
		.values({
			id,
			slug,
			title: body.title,
			description: body.description,
			content: body.content,
			published: body.published ?? false,
			publishedAt: body.published ? new Date() : null
		})
		.returning();

	// Add tags if provided
	if (body.tags?.length) {
		await db.insert(postTags).values(
			body.tags.map((tag: string) => ({
				postId: id,
				tagSlug: tag
			}))
		);
	}

	// Add hashes if provided
	if (body.hashes?.length) {
		await db.insert(postHashes).values(
			body.hashes.map((hash: string) => ({
				postId: id,
				hash
			}))
		);
	}

	return json(
		successResponse({
			...post,
			tags: body.tags ?? [],
			hashes: body.hashes ?? []
		}),
		{ status: 201 }
	);
};
