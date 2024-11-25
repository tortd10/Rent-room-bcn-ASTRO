/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#1E1B4B',
				secondary: '#4F46E5',
				texth2: '#3730A3',
				primaryBg: '#EEF2FF',
				headerBg: '#D0D9F9'
			},
			
		},
	},
	plugins: [],
}
