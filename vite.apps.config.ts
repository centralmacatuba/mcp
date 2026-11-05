import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: "apps",
  plugins: [viteSingleFile()],
  build: {
    rollupOptions: { input: "tempo.html" },
    outDir: "../dist/apps",
    emptyOutDir: false,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false
  }
});
