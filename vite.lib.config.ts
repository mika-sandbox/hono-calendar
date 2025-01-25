import { resolve } from "node:path";
import { defineConfig } from "vite";
// import dts from "vite-plugin-dts";

export default defineConfig({
  // plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, "app/lib/calendar.tsx"),
      name: "HonoCalendar",
      fileName: "hono-calendar",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "hono", "hono/jsx", "@internationalized/date"],
    },
  },
});
