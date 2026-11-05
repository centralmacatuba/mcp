import { App, applyDocumentTheme } from "@modelcontextprotocol/ext-apps";

const root = document.querySelector<HTMLElement>("[data-mcp-app]");
const appName = root?.dataset.appName ?? "Central Macatuba";
const toolName = root?.dataset.tool ?? "";
const status = document.querySelector<HTMLElement>("#status");
const results = document.querySelector<HTMLElement>("#results");
const raw = document.querySelector<HTMLElement>("#raw");
const button = document.querySelector<HTMLButtonElement>("#load");
const app = new App({ name: appName, version: "1.0.0" });

function setStatus(message: string, state: "idle" | "success" | "error" = "idle"): void {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function extractPayload(response: any): unknown {
  if (response?.isError) {
    const message = response.content?.filter((item: any) => item.type === "text").map((item: any) => item.text).join("\n");
    throw new Error(message || "A ferramenta retornou um erro.");
  }
  return response?.structuredContent ?? response;
}

function renderValue(value: unknown, depth = 0): HTMLElement {
  if (value === null || value === undefined) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Não informado.";
    return empty;
  }
  if (typeof value !== "object") {
    const output = document.createElement("p");
    output.className = "value";
    output.textContent = String(value);
    return output;
  }
  if (depth >= 5) {
    const output = document.createElement("pre");
    output.textContent = JSON.stringify(value);
    return output;
  }
  if (Array.isArray(value)) {
    const list = document.createElement("div");
    list.className = "list";
    if (!value.length) { list.textContent = "Nenhum item retornado."; return list; }
    value.slice(0, 100).forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "item";
      const heading = document.createElement("h2");
      heading.textContent = `Item ${index + 1}`;
      card.append(heading, renderValue(item, depth + 1));
      list.append(card);
    });
    if (value.length > 100) {
      const more = document.createElement("p");
      more.className = "muted";
      more.textContent = `Exibindo os primeiros 100 de ${value.length} itens.`;
      list.append(more);
    }
    return list;
  }
  const object = document.createElement("dl");
  object.className = "object";
  Object.entries(value).slice(0, 100).forEach(([key, item]) => {
    const row = document.createElement("div");
    row.className = "field";
    const label = document.createElement("dt");
    label.textContent = key.replace(/[_-]+/g, " ");
    const detail = document.createElement("dd");
    detail.append(renderValue(item, depth + 1));
    row.append(label, detail);
    object.append(row);
  });
  return object;
}

function render(response: unknown): void {
  if (!results) return;
  const value = extractPayload(response);
  results.replaceChildren(renderValue(value));
  if (raw) raw.textContent = JSON.stringify(value, null, 2) ?? String(value);
  setStatus("Consulta concluída.", "success");
}

async function runTool(): Promise<void> {
  if (!toolName || !button) return;
  button.disabled = true;
  setStatus("Consultando dados…");
  results?.replaceChildren();
  const args: Record<string, string | number> = {};
  root?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-param]").forEach((field) => {
    const value = field.value.trim();
    if (!value) return;
    args[field.dataset.param!] = field.dataset.type === "number" ? Number(value) : value;
  });
  try {
    render(await app.callServerTool({ name: toolName, arguments: args }));
  } catch {
    setStatus("Não foi possível consultar os dados. Tente novamente pelo host MCP.", "error");
  } finally {
    button.disabled = false;
  }
}

app.ontoolinput = () => { if (button) button.disabled = true; setStatus("Consultando dados…"); };
app.ontoolresult = (response) => {
  try { render(response); }
  catch { setStatus("A ferramenta retornou uma resposta inválida.", "error"); }
  finally { if (button) button.disabled = false; }
};
app.ontoolcancelled = () => { setStatus("Consulta cancelada."); if (button) button.disabled = false; };
app.onhostcontextchanged = (context) => { if (context?.theme) applyDocumentTheme(context.theme); };
app.onerror = () => { setStatus("Falha na comunicação com o host MCP Apps.", "error"); if (button) button.disabled = false; };
button?.addEventListener("click", () => void runTool());

try {
  await app.connect();
  const context = app.getHostContext();
  if (context?.theme) applyDocumentTheme(context.theme);
  setStatus("Conectado ao host. Use o botão para consultar os dados.");
} catch {
  setStatus("Abra esta interface em um host compatível com MCP Apps.", "error");
}
