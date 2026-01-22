<script lang="ts">
	interface Props {
		label: string;
		href?: string;
	}

	let { label, href }: Props = $props();
</script>

{#if href}
	<a
		{href}
		class="border border-black px-1 py-0.5 text-xs italic hover:bg-black hover:text-white transition-colors"
	>
		{label}
	</a>
{:else}
	<span class="border border-black px-1 py-0.5 text-xs italic">
		{label}
	</span>
{/if}
