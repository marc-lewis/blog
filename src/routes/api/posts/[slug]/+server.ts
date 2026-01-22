import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { posts, postTags, postHashes, tags } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from '$lib/server/api-response';

/**
 * GET /api/posts/:slug - Get a single published post by slug.
 */
export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;

	// Get the post
	const result = await db
		.select()
		.from(posts)
		.where(and(eq(posts.slug, slug), eq(posts.published, true)))
		.limit(1);

	const post = result[0];

	if (!post) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Post not found'), { status: 404 });
	}

	// Get tags for the post
	const postTagsResult = await db
		.select({ slug: tags.slug })
		.from(postTags)
		.innerJoin(tags, eq(postTags.tagSlug, tags.slug))
		.where(eq(postTags.postId, post.id));

	// Get hashes (related todos) for the post
	const hashesResult = await db
		.select({ hash: postHashes.hash })
		.from(postHashes)
		.where(eq(postHashes.postId, post.id));

	return json(
		successResponse({
			id: post.id,
			slug: post.slug,
			title: post.title,
			description: post.description,
			content: post.content,
			tags: postTagsResult.map((t) => t.slug),
			hashes: hashesResult.map((h) => h.hash),
			publishedAt: post.publishedAt
		})
	);
};
