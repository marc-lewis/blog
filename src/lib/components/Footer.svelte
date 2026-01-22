<script lang="ts">
	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-black">
	<div class="flex items-center justify-between p-4">
		<p class="text-xs italic">
			&copy; {currentYear} marc lewis
		</p>

		<div class="flex items-center gap-4">
			<a
				href="https://github.com/marclewis"
				target="_blank"
				rel="noopener noreferrer"
				class="text-xs hover:underline"
				aria-label="GitHub"
			>
				github
			</a>
			<a
				href="https://linkedin.com/in/marclewis"
				target="_blank"
				rel="noopener noreferrer"
				class="text-xs hover:underline"
				aria-label="LinkedIn"
			>
				linkedin
			</a>
			<a
				href="/rss.xml"
				class="text-xs hover:underline"
				aria-label="RSS Feed"
			>
				rss
			</a>
		</div>
	</div>
</footer>
