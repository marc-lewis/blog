import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { tags } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import { successResponse } from '$lib/server/api-response';

/**
 * GET /api/tags - List all tags.
 */
export const GET: RequestHandler = async () => {
	const results = await db
		.select({
			slug: tags.slug,
			name: tags.name,
			colour: tags.colour
		})
		.from(tags)
		.orderBy(asc(tags.name));

	return json(successResponse(results));
};
