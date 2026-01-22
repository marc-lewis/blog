<script lang="ts">
	import PostCard from '$components/PostCard.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Marc Lewis - Software Engineer</title>
	<meta name="description" content="Learnings and thoughts on software engineering from Marc Lewis" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<section class="mb-16">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
			Hey, I'm Marc
		</h1>
		<p class="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
			I'm a software engineer who writes about things I've learnt. This is where I document
			my journey through code, systems, and the occasional existential crisis caused by
			YAML indentation.
		</p>
	</section>

	<section>
		<div class="flex items-center justify-between">
			<h2 class="text-2xl font-semibold">Recent Posts</h2>
			<a
				href="/blog"
				class="text-sm text-blue-600 hover:underline dark:text-blue-400"
			>
				View all &rarr;
			</a>
		</div>

		{#if data.posts.length > 0}
			<div class="mt-8 space-y-6">
				{#each data.posts.slice(0, 3) as post}
					<PostCard {post} />
				{/each}
			</div>
		{:else}
			<p class="mt-8 text-zinc-600 dark:text-zinc-400">
				No posts yet. Check back soon!
			</p>
		{/if}
	</section>
</div>
