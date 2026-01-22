import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, postTags, tags } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { successResponse, getPaginationParams } from '$lib/server/api-response';

/**
 * GET /api/posts - List published blog posts.
 */
export const GET: RequestHandler = async ({ url }) => {
	const { page, limit, offset } = getPaginationParams(url);
	const tagFilter = url.searchParams.get('tag');

	// Build query for published posts
	let postsQuery = db
		.select({
			id: posts.id,
			slug: posts.slug,
			title: posts.title,
			description: posts.description,
			publishedAt: posts.publishedAt
		})
		.from(posts)
		.where(eq(posts.published, true))
		.orderBy(desc(posts.publishedAt))
		.limit(limit)
		.offset(offset);

	// If tag filter, need to join with post_tags
	if (tagFilter) {
		postsQuery = db
			.select({
				id: posts.id,
				slug: posts.slug,
				title: posts.title,
				description: posts.description,
				publishedAt: posts.publishedAt
			})
			.from(posts)
			.innerJoin(postTags, eq(posts.id, postTags.postId))
			.where(and(eq(posts.published, true), eq(postTags.tagSlug, tagFilter)))
			.orderBy(desc(posts.publishedAt))
			.limit(limit)
			.offset(offset);
	}

	const results = await postsQuery;

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

	// Get total count
	const countResult = await db
		.select({ id: posts.id })
		.from(posts)
		.where(eq(posts.published, true));

	return json(
		successResponse(postsWithTags, {
			total: countResult.length,
			page,
			limit
		})
	);
};
