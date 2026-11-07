import { build } from "vite";
import { fileURLToPath } from "node:url";
import { viteSingleFile } from "vite-plugin-singlefile";

const appRoot = fileURLToPath(new URL("../apps/", import.meta.url));
const outputDirectory = fileURLToPath(new URL("../dist/apps/", import.meta.url));
const appFiles = [
  "tempo.html",
  "servicos.html",
  "mapa.html",
  "jornal.html",
  "informacoes.html",
  "servicos/cursos.html",
  "sos.html",
  "calendario.html",
  "novidades.html",
  "servicos/docs.html",
  "servicos/jogos.html",
  "servicos/streaming.html"
] as const;

for (const [index, appFile] of appFiles.entries()) {
  await build({
    configFile: false,
    root: appRoot,
    plugins: [viteSingleFile()],
    build: {
      target: "esnext",
      rollupOptions: {
        input: fileURLToPath(new URL(`../apps/${appFile}`, import.meta.url))
      },
      outDir: outputDirectory,
      emptyOutDir: index === 0,
      assetsInlineLimit: 100_000_000,
      cssCodeSplit: false
    }
  });
}
