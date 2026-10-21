// TESTES DAS REGRAS DO TEXTO
// One list (copy-rules.json) feeds the tests and scripts/check-portfolio.mjs. The closed list of allowed expressions lets
// the noun "entrega" through only inside them; the slogans and the banned words are caught with or without quotes.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import rules from "./copy-rules.json";
import {
  KNOWN_PERSONS,
  KNOWN_STACK,
  copyViolation,
  personViolation,
  stackViolation,
} from "./rules";

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

  it.each([
    ["Responder Marina", "Marina"],
    ["Ligação de João às 10:05", "João"],
    ["Perfil: José", "José"],
    ["Ana pediu a troca", "Ana"],
  ])("finds the person in %s", (text, found) => {
    expect(personViolation(text, [])).toBe(found);
  });

  it.each([
    "Análise de crédito",
    "a marina do porto",
    "Pedido 1234 · Financeiro",
    "Joãozinho",
  ])("finds no person in %s", (text) => {
    expect(personViolation(text, [])).toBeNull();
  });

  // v3 (F1): the known lists are empty, so a name is caught by default; a tolerated value still hides only itself
  it("a tolerated value hides only itself, and nothing is tolerated by default", () => {
    const tolerated = [{ value: "Marina", phase: "F1", todo: "" }];
    expect(personViolation("Responder Marina", tolerated)).toBeNull();
    expect(personViolation("Responder Marina e Pedro", tolerated)).toBe("Pedro");
    expect(personViolation("Responder Marina")).toBe("Marina");
    expect(stackViolation("Roda em Kubernetes")).toBe("Kubernetes");
  });

  it.each([
    ["Roda em Kubernetes", "Kubernetes"],
    ["Argo CD e Vault", "Argo CD"],
    ["Base em Frappe", "Frappe"],
  ])("finds the internal stack in %s", (text, found) => {
    expect(stackViolation(text, [])).toBe(found);
  });

  it("every known failure names a value of its list and the phase that removes it", () => {
    for (const k of KNOWN_PERSONS) {
      expect(rules.persons).toContain(k.value);
      expect(k.phase).toMatch(/^F[1-6]$/);
    }
    for (const k of KNOWN_STACK) {
      expect(rules.stack).toContain(k.value);
      expect(k.phase).toMatch(/^F[1-6]$/);
    }
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
