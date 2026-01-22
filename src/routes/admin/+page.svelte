<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Admin Dashboard - Marc Lewis</title>
</svelte:head>

<div class="p-5">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-bold">Admin Dashboard</h1>

		<form method="POST" action="/admin/logout" use:enhance>
			<button
				type="submit"
				class="border border-black px-3 py-1 text-sm hover:bg-black hover:text-white transition-colors"
			>
				Logout
			</button>
		</form>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		<a
			href="/admin/todos"
			class="border border-black p-4 hover:bg-black hover:text-white transition-colors"
		>
			<h2 class="font-bold text-base mb-1">Todos</h2>
			<p class="text-sm">Manage your task list</p>
		</a>

		<a
			href="/admin/posts"
			class="border border-black p-4 hover:bg-black hover:text-white transition-colors"
		>
			<h2 class="font-bold text-base mb-1">Posts</h2>
			<p class="text-sm">Write and edit blog posts</p>
		</a>

		<a
			href="/admin/tags"
			class="border border-black p-4 hover:bg-black hover:text-white transition-colors"
		>
			<h2 class="font-bold text-base mb-1">Tags</h2>
			<p class="text-sm">Organise your content</p>
		</a>
	</div>

	<div class="mt-8">
		<p class="text-sm">
			<a href="/" class="hover:underline">View site</a>
		</p>
	</div>
</div>
