import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { registeredToolNames } from "../src/tools.js";

const root = process.cwd();
const docsRoot = resolve(root, "docs");

function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(path);
    return entry.isFile() && extname(entry.name) === ".md" ? [path] : [];
  });
}

function links(source: string): string[] {
  const clean = source.replace(/^```[\s\S]*?^```\s*$/gm, "").replace(/`[^`]*`/g, "");
  return Array.from(clean.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g), (match) => (match[1] ?? "").trim().split(/[?#]/, 1)[0] ?? "");
}

describe("MCP documentation", () => {
  it("generates the tool reference deterministically and documents every registered tool", () => {
    execFileSync(process.execPath, ["--import", "tsx", "scripts/generate-docs-reference.ts"], { cwd: root });
    const reference = readFileSync(resolve(docsRoot, "reference/tools.md"), "utf8");
    for (const name of registeredToolNames) expect(reference).toContain(`## ${name}`);
    const before = reference;
    execFileSync(process.execPath, ["--import", "tsx", "scripts/generate-docs-reference.ts"], { cwd: root });
    expect(readFileSync(resolve(docsRoot, "reference/tools.md"), "utf8")).toBe(before);
  });

  it("resolves all local Markdown links", () => {
    const broken: string[] = [];
    for (const page of markdownFiles(docsRoot)) {
      for (const link of links(readFileSync(page, "utf8"))) {
        if (!link || /^(https?:|mailto:|tel:|#)/i.test(link)) continue;
        const target = link.startsWith("/")
          ? resolve(docsRoot, link.slice(1) + (extname(link) ? "" : ".md"))
          : resolve(dirname(page), link + (extname(link) ? "" : ".md"));
        if (!existsSync(target)) broken.push(`${relative(docsRoot, page)} -> ${link}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("includes every documentation page in the VitePress sidebar", () => {
    const config = readFileSync(resolve(docsRoot, ".vitepress/config.mts"), "utf8");
    const pages = markdownFiles(docsRoot).map((path) => relative(docsRoot, path).split(sep).join("/"));
    for (const page of pages) {
      if (page === "index.md") continue;
      const route = "/" + page.replace(/\.md$/, "");
      expect(config).toContain(route);
    }
  });
});
