import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
	themes: ['github-dark', 'github-light'],
	langs: ['javascript', 'typescript', 'svelte', 'html', 'css', 'bash', 'json', 'go', 'python', 'sql']
});

/** @type {import('mdsvex').MdsvexOptions} */
export const mdsvexConfig = {
	extensions: ['.md'],
	highlight: {
		highlighter: (code, lang) => {
			const html = highlighter.codeToHtml(code, {
				lang: lang || 'text',
				themes: {
					light: 'github-light',
					dark: 'github-dark'
				}
			});
			// Use JSON.stringify to safely escape the HTML string
			const escaped = JSON.stringify(html);
			return `{@html ${escaped}}`;
		}
	},
	remarkPlugins: [],
	rehypePlugins: []
};
