import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    http: "src/http.ts",
    stdio: "src/stdio.ts",
    cli: "src/cli.ts"
  },
  format: ["esm"],
  target: "node20",
  platform: "node",
  clean: true,
  sourcemap: true,
  dts: true,
  splitting: false,
  treeshake: true,
  banner: { js: "#!/usr/bin/env node" },
  external: ["@centralmacatuba/api", "@modelcontextprotocol/sdk", "zod"]
});
