import { build } from "vite";
import { fileURLToPath } from "node:url";
import { viteSingleFile } from "vite-plugin-singlefile";

const appRoot = fileURLToPath(new URL("../apps/", import.meta.url));
const outputDirectory = fileURLToPath(new URL("../dist/apps/", import.meta.url));
const appNames = ["tempo", "servicos", "mapa", "jornal", "informacoes", "cursos", "sos"] as const;

for (const [index, appName] of appNames.entries()) {
  await build({
    configFile: false,
    root: appRoot,
    plugins: [viteSingleFile()],
    build: {
      target: "esnext",
      rollupOptions: {
        input: { [appName]: fileURLToPath(new URL(`../apps/${appName}.html`, import.meta.url)) }
      },
      outDir: outputDirectory,
      emptyOutDir: index === 0,
      assetsInlineLimit: 100_000_000,
      cssCodeSplit: false
    }
  });
}
