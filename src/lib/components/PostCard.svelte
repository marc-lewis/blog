<script lang="ts">
	import type { PostMeta } from '$utils/posts';
	import Chip from '$components/Chip.svelte';

	interface Props {
		post: PostMeta;
	}

	let { post }: Props = $props();
</script>

<article class="flex flex-col gap-1 p-1">
	<a href="/blog/{post.slug}" class="block">
		<h3 class="font-bold text-sm p-1 hover:underline">
			{post.title}
		</h3>
	</a>

	<p class="text-sm p-1">
		{post.description}
	</p>

	{#if post.tags.length > 0}
		<div class="flex flex-wrap gap-2 p-1">
			{#each post.tags as tag}
				<Chip label={tag} />
			{/each}
		</div>
	{/if}
</article>
