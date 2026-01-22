<script lang="ts">
	import { page } from '$app/stores';
</script>

<header class="border-b border-black">
	<nav class="flex items-center gap-4 p-4">
		<a href="/" class="font-bold text-sm hover:underline">
			marclewis.io
		</a>

		<div class="flex items-center gap-4">
			<a
				href="/"
				class="text-sm hover:underline"
				class:font-bold={$page.url.pathname === '/'}
			>
				home
			</a>
			<a
				href="/blog"
				class="text-sm hover:underline"
				class:font-bold={$page.url.pathname.startsWith('/blog')}
			>
				blog
			</a>
			<a
				href="/about"
				class="text-sm hover:underline"
				class:font-bold={$page.url.pathname === '/about'}
			>
				about
			</a>
		</div>
	</nav>
</header>
