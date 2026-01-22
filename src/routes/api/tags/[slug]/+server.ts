import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { tags, todos, todoTags, posts, postTags } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, errorResponse, ErrorCodes } from '$lib/server/api-response';

/**
 * GET /api/tags/:slug - Get tag with associated content.
 */
export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;

	// Get the tag
	const result = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);

	const tag = result[0];

	if (!tag) {
		return json(errorResponse(ErrorCodes.NOT_FOUND, 'Tag not found'), { status: 404 });
	}

	// Get todos with this tag (uncompleted only for public)
	const todosResult = await db
		.select({
			hash: todos.hash,
			emoji: todos.emoji,
			description: todos.description
		})
		.from(todoTags)
		.innerJoin(todos, eq(todoTags.todoId, todos.id))
		.where(eq(todoTags.tagSlug, slug));

	// Get posts with this tag (published only for public)
	const postsResult = await db
		.select({
			slug: posts.slug,
			title: posts.title,
			description: posts.description,
			publishedAt: posts.publishedAt
		})
		.from(postTags)
		.innerJoin(posts, eq(postTags.postId, posts.id))
		.where(eq(postTags.tagSlug, slug));

	return json(
		successResponse({
			slug: tag.slug,
			name: tag.name,
			description: tag.description,
			colour: tag.colour,
			todos: todosResult,
			posts: postsResult.filter((p) => p.publishedAt !== null)
		})
	);
};
