<script lang="ts">
	import { formatDate } from '$utils/posts';
	import Chip from '$components/Chip.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const Content = $derived(data.content);
</script>

<svelte:head>
	<title>{data.meta.title} - marc lewis</title>
	<meta name="description" content={data.meta.description} />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:type" content="article" />
</svelte:head>

<article class="p-5 max-w-3xl">
	<header class="mb-8">
		<time class="text-xs italic" datetime={data.meta.date}>
			{formatDate(data.meta.date)}
		</time>

		<h1 class="mt-2 text-base font-bold">
			{data.meta.title}
		</h1>

		<p class="mt-2 text-sm">
			{data.meta.description}
		</p>

		{#if data.meta.tags.length > 0}
			<div class="mt-4 flex flex-wrap gap-2">
				{#each data.meta.tags as tag}
					<Chip label={tag} />
				{/each}
			</div>
		{/if}
	</header>

	<div class="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-sm prose-p:text-sm prose-a:underline prose-code:text-xs prose-pre:border prose-pre:border-black">
		<Content />
	</div>

	<footer class="mt-8 border-t border-black pt-4">
		<a href="/blog" class="text-sm hover:underline">
			&larr; back to all posts
		</a>
	</footer>
</article>
