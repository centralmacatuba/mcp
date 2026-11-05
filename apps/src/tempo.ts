import { App } from "@modelcontextprotocol/ext-apps";

const statusElement = document.querySelector<HTMLElement>("#status");
const resultElement = document.querySelector<HTMLElement>("#result");
const refreshButton = document.querySelector<HTMLButtonElement>("#refresh");

const app = new App({ name: "Central Macatuba — Tempo", version: "0.1.0" });

function showResult(value: unknown): void {
  if (resultElement) resultElement.textContent = JSON.stringify(value, null, 2) ?? String(value);
  if (statusElement) statusElement.textContent = "Dados recebidos do Tempo Macatuba.";
}

app.ontoolresult = (result) => {
  const text = result.content?.filter((item) => item.type === "text").map((item) => item.text).join("\n");
  if (!text) {
    showResult(result);
    return;
  }
  try { showResult(JSON.parse(text) as unknown); }
  catch { showResult(text); }
};

app.onerror = (error) => {
  if (statusElement) statusElement.textContent = "Não foi possível atualizar os dados.";
  if (resultElement) resultElement.textContent = error.message;
};

refreshButton?.addEventListener("click", async () => {
  if (statusElement) statusElement.textContent = "Consultando Tempo Macatuba…";
  try {
    const result = await app.callServerTool({ name: "tempo.listar", arguments: {} });
    const text = result.content?.filter((item) => item.type === "text").map((item) => item.text).join("\n");
    if (text) {
      try { showResult(JSON.parse(text) as unknown); }
      catch { showResult(text); }
    } else {
      showResult(result);
    }
  } catch (error) {
    if (statusElement) statusElement.textContent = "Falha ao consultar o serviço.";
    if (resultElement) resultElement.textContent = error instanceof Error ? error.message : "Erro desconhecido.";
  }
});

await app.connect();
