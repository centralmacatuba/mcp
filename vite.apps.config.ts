import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const appRoot = fileURLToPath(new URL("./apps/", import.meta.url));

export default defineConfig({
  root: appRoot,
  plugins: [viteSingleFile()],
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        tempo: fileURLToPath(new URL("./apps/tempo.html", import.meta.url)),
        servicos: fileURLToPath(new URL("./apps/servicos.html", import.meta.url)),
        mapa: fileURLToPath(new URL("./apps/mapa.html", import.meta.url)),
        jornal: fileURLToPath(new URL("./apps/jornal.html", import.meta.url)),
        informacoes: fileURLToPath(new URL("./apps/informacoes.html", import.meta.url)),
        cursos: fileURLToPath(new URL("./apps/cursos.html", import.meta.url)),
        sos: fileURLToPath(new URL("./apps/sos.html", import.meta.url))
      }
    },
    outDir: fileURLToPath(new URL("./dist/apps/", import.meta.url)),
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false
  }
});
