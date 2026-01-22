<script lang="ts">
	import type { PostMeta } from '$utils/posts';
	import { formatDate } from '$utils/posts';

	interface Props {
		post: PostMeta;
	}

	let { post }: Props = $props();
</script>

<article class="group">
	<a href="/blog/{post.slug}" class="block">
		<div class="rounded-lg border border-zinc-200 p-6 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700">
			<time class="text-sm text-zinc-500 dark:text-zinc-500" datetime={post.date}>
				{formatDate(post.date)}
			</time>

			<h2 class="mt-2 text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
				{post.title}
			</h2>

			<p class="mt-2 text-zinc-600 dark:text-zinc-400">
				{post.description}
			</p>

			{#if post.tags.length > 0}
				<div class="mt-4 flex flex-wrap gap-2">
					{#each post.tags as tag}
						<span class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{tag}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	</a>
</article>
