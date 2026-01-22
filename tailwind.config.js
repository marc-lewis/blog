/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Courier Prime', 'Courier', 'monospace'],
				mono: ['Courier Prime', 'Courier', 'monospace']
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '75ch',
						code: {
							backgroundColor: 'rgb(var(--tw-prose-pre-bg))',
							padding: '0.25rem 0.375rem',
							borderRadius: '0.25rem',
							fontWeight: '400'
						},
						'code::before': {
							content: '""'
						},
						'code::after': {
							content: '""'
						}
					}
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
