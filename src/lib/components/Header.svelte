<script lang="ts">
	import { page } from '$app/stores';

	let isDark = $state(true);

	function toggleTheme() {
		isDark = !isDark;
		if (typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', isDark);
		}
	}
</script>

<header class="border-b border-zinc-200 dark:border-zinc-800">
	<nav class="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
		<a href="/" class="text-xl font-semibold hover:text-zinc-600 dark:hover:text-zinc-400">
			Marc Lewis
		</a>

		<div class="flex items-center gap-6">
			<a
				href="/"
				class="text-sm transition-colors hover:text-zinc-600 dark:hover:text-zinc-400"
				class:font-medium={$page.url.pathname === '/'}
			>
				Home
			</a>
			<a
				href="/blog"
				class="text-sm transition-colors hover:text-zinc-600 dark:hover:text-zinc-400"
				class:font-medium={$page.url.pathname.startsWith('/blog')}
			>
				Blog
			</a>
			<a
				href="/about"
				class="text-sm transition-colors hover:text-zinc-600 dark:hover:text-zinc-400"
				class:font-medium={$page.url.pathname === '/about'}
			>
				About
			</a>

			<button
				onclick={toggleTheme}
				class="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
				aria-label="Toggle theme"
			>
				{#if isDark}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
					</svg>
				{/if}
			</button>
		</div>
	</nav>
</header>
