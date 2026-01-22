import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { PostMeta } from '$utils/posts';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const post = await import(`../../../lib/posts/${params.slug}.md`);

		return {
			content: post.default,
			meta: {
				...post.metadata,
				slug: params.slug
			} as PostMeta
		};
	} catch {
		throw error(404, `Post not found: ${params.slug}`);
	}
};
