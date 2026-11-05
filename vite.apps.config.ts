import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    rollupOptions: { input: "apps/tempo.html" },
    outDir: "dist/apps",
    emptyOutDir: false,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false
  }
});
