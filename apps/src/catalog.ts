import { App, applyDocumentTheme } from "@modelcontextprotocol/ext-apps";

const root = document.querySelector<HTMLElement>("[data-mcp-app]");
const appName = root?.dataset.appName ?? "Central Macatuba";
const toolName = root?.dataset.tool ?? "";
const status = document.querySelector<HTMLElement>("#status");
const results = document.querySelector<HTMLElement>("#results");
const raw = document.querySelector<HTMLElement>("#raw");
const button = document.querySelector<HTMLButtonElement>("#load");
const app = new App({ name: appName, version: "1.1.0" });

const paginatedTools = new Set([
  "tempo.listar", "servicos.listar", "mapa.listar",
  "jornal.listar", "informacoes.listar", "servicos_cursos.pesquisar", "sos.listar"
]);
const supportsPagination = paginatedTools.has(toolName);
const supportsSosConsent = toolName === "sos.listar";

let paginationControls: HTMLElement | undefined;
let pageInput: HTMLInputElement | undefined;
let limitInput: HTMLInputElement | undefined;
let pageInfo: HTMLElement | undefined;
let previousButton: HTMLButtonElement | undefined;
let nextButton: HTMLButtonElement | undefined;
let consentInput: HTMLInputElement | undefined;

if (root && supportsPagination) {
  const controls = document.createElement("div");
  paginationControls = controls;
  controls.className = "pagination";
  controls.setAttribute("aria-label", "Paginação");
  controls.style.cssText = "display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin:16px 0";

  const makeNumberField = (labelText: string, id: string, min: number, max?: number) => {
    const label = document.createElement("label");
    label.style.cssText = "display:grid;gap:4px;min-width:100px;font-size:.9rem";
    label.textContent = labelText;
    const input = document.createElement("input");
    input.id = id;
    input.type = "number";
    input.min = String(min);
    if (max !== undefined) input.max = String(max);
    input.value = id === "cm-page" ? "1" : "20";
    input.style.cssText = "max-width:130px;padding:8px;border:1px solid var(--color-border,#888);border-radius:8px;background:transparent;color:inherit;font:inherit";
    label.append(input);
    controls.append(label);
    return input;
  };

  pageInput = makeNumberField("Página", "cm-page", 1);
  limitInput = makeNumberField("Itens por página", "cm-limit", 1, 100);
  previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.textContent = "Anterior";
  previousButton.disabled = true;
  nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.textContent = "Próxima";
  pageInfo = document.createElement("span");
  pageInfo.className = "muted";
  pageInfo.setAttribute("aria-live", "polite");
  controls.append(previousButton, nextButton, pageInfo);
  if (status) root.insertBefore(controls, status);
  else if (button) root.insertBefore(controls, button);
  limitInput.addEventListener("change", () => { if (pageInput) pageInput.value = "1"; });
}

if (root && supportsSosConsent) {
  const consentLabel = document.createElement("label");
  consentLabel.style.cssText = "display:flex;gap:9px;align-items:flex-start;margin:14px 0;font-size:.9rem";
  consentInput = document.createElement("input");
  consentInput.type = "checkbox";
  consentInput.id = "sos-notification-consent";
  consentInput.style.cssText = "margin-top:4px";
  const consentText = document.createElement("span");
  consentText.textContent = "Confirmo que o usuário declarou aceitar a preferência de notificações SOS. Isso apenas informa a preferência nesta consulta; não realiza inscrição.";
  consentLabel.append(consentInput, consentText);
  if (status) root.insertBefore(consentLabel, status);
  else if (button) root.insertBefore(consentLabel, button);
}

/** Updates the status text and state when the status element exists. */
function setStatus(message: string, state: "idle" | "success" | "error" = "idle"): void {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

/**
 * Uses structured content when present, otherwise returns the response itself.
 * Throws for tool error responses, using their text content or a fallback message.
 */
function extractPayload(response: any): unknown {
  if (response?.isError) {
    const message = response.content?.filter((item: any) => item.type === "text").map((item: any) => item.text).join("\n");
    throw new Error(message || "A ferramenta retornou um erro.");
  }
  return response?.structuredContent ?? response;
}

/**
 * Builds a detached text-only view, limiting expanded collections to 100 entries.
 * depth counts nesting from zero; objects at depth five or greater become JSON text.
 */
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

/** Updates the pagination summary when the endpoint returns body pagination metadata. */
function updatePagination(payload: any): void {
  if (!supportsPagination || !pageInput || !limitInput || !pageInfo || !previousButton || !nextButton) return;
  const metadata = payload?.paginacao ?? payload?.pagination;
  const currentPage = Number(metadata?.pagina ?? metadata?.page ?? pageInput.value);
  const limit = Number(metadata?.limite ?? metadata?.limit ?? limitInput.value);
  const total = metadata?.total;
  const totalPages = metadata?.total_paginas ?? metadata?.totalPages;
  const hasPrevious = metadata?.hasPreviousPage ?? currentPage > 1;
  const hasNext = metadata?.hasNextPage ?? (typeof totalPages === "number" ? currentPage < totalPages : true);
  pageInput.value = String(currentPage);
  if (Number.isFinite(limit) && limit > 0) limitInput.value = String(limit);
  pageInfo.textContent = typeof total === "number" && typeof totalPages === "number"
    ? `Página ${currentPage} de ${totalPages} · ${total} registros`
    : `Página ${currentPage} · ${limit} itens por página`;
  previousButton.disabled = !hasPrevious;
  nextButton.disabled = !hasNext;
}

/** Renders the API collection and keeps pagination metadata visible without discarding the raw response. */
function render(response: unknown): void {
  if (!results) return;
  const structured = extractPayload(response) as any;
  const payload = structured && typeof structured === "object" && !Array.isArray(structured) && Object.hasOwn(structured, "result")
    ? structured.result
    : structured;
  const collection = payload && typeof payload === "object" && !Array.isArray(payload)
    ? ["data", "dados", "itens", "eventos", "alertas", "registros", "noticias", "pontos", "informacoes", "items", "results"].map((key) => payload[key]).find(Array.isArray) ?? payload
    : payload;
  results.replaceChildren(renderValue(collection));
  if (raw) raw.textContent = JSON.stringify(structured, null, 2) ?? String(structured);
  updatePagination(payload);
  setStatus("Consulta concluída.", "success");
}

/**
 * Calls the configured tool with nonempty trimmed form values and numeric pagination.
 * SOS consent is included only when the user explicitly checks the consent control.
 */
async function runTool(): Promise<void> {
  if (!toolName || !button) return;
  button.disabled = true;
  if (paginationControls) paginationControls.hidden = false;
  if (previousButton) previousButton.disabled = true;
  if (nextButton) nextButton.disabled = true;
  setStatus("Consultando dados…");
  results?.replaceChildren();
  const args: Record<string, string | number | boolean> = {};
  root?.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-param]").forEach((field) => {
    const value = field.value.trim();
    if (!value) return;
    args[field.dataset.param!] = field.dataset.type === "number" ? Number(value) : value;
  });
  if (supportsPagination && pageInput && limitInput) {
    args.page = Math.max(1, Number(pageInput.value || 1));
    args.limit = Math.min(100, Math.max(1, Number(limitInput.value || 20)));
  }
  if (supportsSosConsent && consentInput?.checked) args.notificacaoAceita = true;
  try {
    render(await app.callServerTool({ name: toolName, arguments: args }));
  } catch {
    setStatus("Não foi possível consultar os dados. Tente novamente pelo host MCP.", "error");
  } finally {
    button.disabled = false;
  }
}

const verifyButton = document.querySelector<HTMLButtonElement>("#verify");
const verifySlug = document.querySelector<HTMLInputElement>("#slug");
verifyButton?.addEventListener("click", async () => {
  const slug = verifySlug?.value.trim();
  if (!slug) {
    setStatus("Informe o slug do curso para consultar.", "error");
    return;
  }
  verifyButton.disabled = true;
  if (paginationControls) paginationControls.hidden = true;
  setStatus("Consultando curso por slug…");
  results?.replaceChildren();
  try {
    render(await app.callServerTool({ name: "servicos_cursos.verificar", arguments: { slug } }));
  } catch {
    setStatus("Não foi possível consultar o curso. Verifique o slug e tente novamente.", "error");
  } finally {
    verifyButton.disabled = false;
  }
});

previousButton?.addEventListener("click", () => {
  if (!pageInput) return;
  pageInput.value = String(Math.max(1, Number(pageInput.value || 1) - 1));
  void runTool();
});
nextButton?.addEventListener("click", () => {
  if (!pageInput) return;
  pageInput.value = String(Number(pageInput.value || 1) + 1);
  void runTool();
});

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
