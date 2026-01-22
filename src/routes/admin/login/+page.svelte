<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	interface Props {
		form: ActionData;
	}

	let { form }: Props = $props();
</script>

<svelte:head>
	<title>Admin Login - Marc Lewis</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<h1 class="text-xl font-bold mb-6">Admin Login</h1>

		{#if form?.error}
			<div class="border border-red-500 text-red-700 p-3 mb-4 text-sm">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance class="flex flex-col gap-4">
			<div class="flex flex-col gap-1">
				<label for="email" class="text-sm font-bold">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					required
					autocomplete="email"
					class="border border-black p-2 text-sm"
					value={form?.email ?? ''}
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for="password" class="text-sm font-bold">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					autocomplete="current-password"
					class="border border-black p-2 text-sm"
				/>
			</div>

			<button
				type="submit"
				class="border border-black p-2 text-sm font-bold hover:bg-black hover:text-white transition-colors"
			>
				Login
			</button>
		</form>

		<p class="mt-6 text-xs text-center">
			<a href="/" class="hover:underline">Back to site</a>
		</p>
	</div>
</div>
