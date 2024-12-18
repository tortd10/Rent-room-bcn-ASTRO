import { defineDb } from "astro:db";

// https://astro.build/db/config
export default defineDb({
  tables: {
    flats: {
      flat_id: "string", // Primary key for flats
      title: "string",
      mapImage: "string",
    },
    rooms: {
      slug: "string",         // Primary key for rooms
      name: "string",
      description: "string",
      imageSrc: "string",
      imageAlt: "string",
      roomFlat: "string",     // Foreign key linking to flats.flat_id
      available: "boolean",
    },
  },
});
