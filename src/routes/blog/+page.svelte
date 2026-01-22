<script lang="ts">
	import PostCard from '$components/PostCard.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Blog - Marc Lewis</title>
	<meta name="description" content="All blog posts from Marc Lewis" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<h1 class="text-4xl font-bold tracking-tight">Blog</h1>
	<p class="mt-4 text-zinc-600 dark:text-zinc-400">
		Thoughts, learnings, and the occasional rant about software.
	</p>

	{#if data.posts.length > 0}
		<div class="mt-12 space-y-6">
			{#each data.posts as post}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<p class="mt-12 text-zinc-600 dark:text-zinc-400">
			No posts yet. Check back soon!
		</p>
	{/if}
</div>
