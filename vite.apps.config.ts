import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  root: "apps",
  plugins: [viteSingleFile()],
  build: {
    rollupOptions: {
      input: {
        tempo: "tempo.html",
        servicos: "servicos.html",
        mapa: "mapa.html",
        jornal: "jornal.html",
        informacoes: "informacoes.html",
        cursos: "cursos.html",
        sos: "sos.html"
      }
    },
    outDir: "../dist/apps",
    emptyOutDir: false,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false
  }
});
