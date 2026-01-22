<script lang="ts">
	import { formatDate } from '$utils/posts';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const Content = $derived(data.content);
</script>

<svelte:head>
	<title>{data.meta.title} - Marc Lewis</title>
	<meta name="description" content={data.meta.description} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:type" content="article" />
</svelte:head>

<article class="mx-auto max-w-3xl px-6 py-16">
	<header class="mb-12">
		<time class="text-sm text-zinc-500" datetime={data.meta.date}>
			{formatDate(data.meta.date)}
		</time>

		<h1 class="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
			{data.meta.title}
		</h1>

		<p class="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
			{data.meta.description}
		</p>

		{#if data.meta.tags.length > 0}
			<div class="mt-6 flex flex-wrap gap-2">
				{#each data.meta.tags as tag}
					<span class="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
						{tag}
					</span>
				{/each}
			</div>
		{/if}
	</header>

	<div class="prose prose-zinc dark:prose-invert max-w-none">
		<Content />
	</div>

	<footer class="mt-16 border-t border-zinc-200 pt-8 dark:border-zinc-800">
		<a
			href="/blog"
			class="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
		>
			<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
			</svg>
			Back to all posts
		</a>
	</footer>
</article>
