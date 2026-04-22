import { ROOMS } from "@/data/rooms"
import type { APIRoute } from "astro"

export const GET: APIRoute = (): Response => {
	const baseUrl = "https://www.rentroombcn.com"
	const langs = ["es", "en"]

	const staticPages = ["", "/Rooms", "/Flats", "/About", "/Faq"]

	const staticUrls = langs.flatMap((lang) =>
		staticPages.map(
			(page) => `
  <url>
    <loc>${baseUrl}/${lang}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`
		)
	)

	const roomUrls = langs.flatMap((lang) =>
		ROOMS.map(
			(room) => `
  <url>
    <loc>${baseUrl}/${lang}/${room.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
		)
	)

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("")}
${roomUrls.join("")}
</urlset>`

	return new Response(sitemap, {
		headers: { "Content-Type": "application/xml" },
	})
}
