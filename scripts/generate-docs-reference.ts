import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { registeredToolDefinitions } from "../src/tools.js";
import { z } from "zod/v4";

const output = resolve("docs/reference/tools.md");
const lines = [
  "# Referência de ferramentas",
  "",
  "Esta página é gerada a partir das definições registradas em `src/tools.ts`. Não edite manualmente; altere a definição da ferramenta e execute `pnpm docs:generate`.",
  "",
  `Total de ferramentas: **${registeredToolDefinitions.length}**.`,
  ""
];

for (const tool of registeredToolDefinitions) {
  lines.push(`## ${tool.name}`, "");
  lines.push(tool.description, "");
  lines.push(`- **Rota pública:** \`${tool.endpoint}\``);
  if (tool.fixedQuery) lines.push(`- **Parâmetros fixos:** \`${JSON.stringify(tool.fixedQuery)}\``);
  if (tool.appUri) lines.push(`- **MCP App:** \`${tool.appUri}\``);
  lines.push("", "### Schema de entrada", "", "```json");
  lines.push(JSON.stringify(z.toJSONSchema(tool.inputSchema), null, 2));
  lines.push("```", "");
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, lines.join("\n") + "\n", "utf8");
console.log(`Referência gerada: ${registeredToolDefinitions.length} ferramentas.`);
