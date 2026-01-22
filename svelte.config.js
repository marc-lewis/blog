import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { mdsvexConfig } from './mdsvex.config.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],

	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],

	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true
		}),

		alias: {
			$components: 'src/lib/components',
			$utils: 'src/lib/utils',
			$posts: 'src/lib/posts'
		}
	}
};

export default config;
