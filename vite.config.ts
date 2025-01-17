import honox from "honox/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [honox({ client: { input: ["/app/globals.css"] } })],
});
