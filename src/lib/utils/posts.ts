export interface PostMeta {
	title: string;
	description: string;
	date: string;
	tags: string[];
	published: boolean;
	slug: string;
}

export interface Post {
	meta: PostMeta;
	content: string;
}

export async function getPosts(): Promise<PostMeta[]> {
	const modules = import.meta.glob('/src/lib/posts/*.md', { eager: true });

	const posts: PostMeta[] = [];

	for (const path in modules) {
		const module = modules[path] as { metadata: Omit<PostMeta, 'slug'> };
		const slug = path.split('/').pop()?.replace('.md', '') ?? '';

		if (module.metadata?.published) {
			posts.push({
				...module.metadata,
				slug
			});
		}
	}

	// Sort by date, newest first
	return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

export function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const words = content.trim().split(/\s+/).length;
	return Math.ceil(words / wordsPerMinute);
}
