<script lang="ts">
	import PostCard from '$components/PostCard.svelte';
	import Chip from '$components/Chip.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Placeholder todos - can be replaced with real data source later
	const todos = [
		{ id: '000001', emoji: '🤖', description: 'set up blog', tags: ['blog', 'infra'] },
		{ id: '000002', emoji: '📝', description: 'write first post', tags: ['content', 'blog'] }
	];
</script>

<svelte:head>
	<title>Marc Lewis</title>
	<meta name="description" content="Learnings and thoughts on software engineering from Marc Lewis" />
</svelte:head>

<div class="p-5">
	<!-- Todos Section -->
	<section class="mb-8">
		<h2 class="font-bold text-base p-1 mb-2">todos</h2>

		<div class="flex flex-col gap-1 p-1">
			{#each todos as todo}
				<div class="flex gap-1 items-center p-1">
					<span class="italic text-sm">#{todo.id}</span>
					<span class="text-xs">{todo.emoji}</span>
					<span class="text-sm">{todo.description}</span>
					{#each todo.tags as tag}
						<Chip label={tag} />
					{/each}
				</div>
			{/each}
		</div>
	</section>

	<!-- Posts Section -->
	<section>
		<h2 class="font-bold text-base p-1 mb-2">posts</h2>

		{#if data.posts.length > 0}
			<div class="flex gap-4 p-3">
				{#each data.posts.slice(0, 4) as post}
					<PostCard {post} />
				{/each}
			</div>
		{:else}
			<p class="p-1 text-sm">
				No posts yet. Check back soon!
			</p>
		{/if}
	</section>
</div>
