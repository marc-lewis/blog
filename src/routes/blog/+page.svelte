<script lang="ts">
	import PostCard from '$components/PostCard.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>blog - marc lewis</title>
	<meta name="description" content="All blog posts from Marc Lewis" />
</svelte:head>

<div class="p-5">
	<h1 class="font-bold text-base p-1 mb-4">blog</h1>

	{#if data.posts.length > 0}
		<div class="flex flex-wrap gap-4">
			{#each data.posts as post}
				<PostCard {post} />
			{/each}
		</div>
	{:else}
		<p class="text-sm p-1">
			No posts yet. Check back soon!
		</p>
	{/if}
</div>
