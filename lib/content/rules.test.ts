// TESTES DAS REGRAS DO TEXTO
// One list (copy-rules.json) feeds the tests and scripts/check-portfolio.mjs. The closed list of allowed expressions lets
// the noun "entrega" through only inside them; the slogans and the banned words are caught with or without quotes.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copyViolation } from "./rules";

describe("copy rules", () => {
  it.each([
    "Alteração de entrega",
    "alteração de entrega · Pedido 1234",
    "Janela de entrega",
    "Política de entregas",
    "Sábado: entregas até 12h",
    "Entregas",
  ])("allows %s", (text) => {
    expect(copyViolation(text)).toBeNull();
  });

  it.each([
    ["A entrega do pedido", "entrega"],
    ["Entrega em 24 horas", "Entrega"],
    ["Entrega de valor", "Entrega"],
    ["cliente", "cliente"],
    ["Clientes que voltam", "Clientes"],
    ["ERP completo", "ERP"],
    ["do primeiro oi ao fechamento", "do primeiro oi ao fechamento"],
    ['"Do primeiro oi ao fechamento"', "Do primeiro oi ao fechamento"],
    ["Relloo: do primeiro oi ao fechamento.", "do primeiro oi ao fechamento"],
    ["Ele automatiza tudo", "automatiza"],
  ])("rejects %s", (text, found) => {
    expect(copyViolation(text)).toBe(found);
  });

  it("an allowed expression does not hide a violation next to it", () => {
    expect(copyViolation("Alteração de entrega e a entrega do cliente")).toBe(
      "entrega",
    );
  });

  it("check-portfolio reads the same list and carries no list of its own", () => {
    const script = readFileSync(
      path.resolve(__dirname, "../../scripts/check-portfolio.mjs"),
      "utf8",
    );
    expect(script).toContain("copy-rules.json");
    expect(script).not.toMatch(/automatiza|um só fluxo|\(\?<!/);
  });
});
