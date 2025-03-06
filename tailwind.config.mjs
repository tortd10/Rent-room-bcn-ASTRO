/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				primary: "#344E41",
				secondary: "#3A5A40",
				texth2: "black",
				primaryBg: "#DAD7CD",
				headerBg: "#A3B18A",
			},
		},
	},
	plugins: [],
}
