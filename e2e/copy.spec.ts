// COPY SEM PERSONIFICAÇÃO E SEM MARCA SOLTA
// v2.2 (audit, section 5): the copy spoke of "a pessoa", named eight fictional people (Marina, Ana, Bia Souza, Rafael
// Lima, Davi, Bruno, Carla, Lia) and put third-party brands where the category belonged (measured on 8187680). On the
// rendered home and the five product pages: no personification, no fictional person but the one contact (Marina), and
// every third-party brand only inside brackets, as an example of its category.
import { expect, test } from "@playwright/test";

const PATHS = [
  "/",
  "/products/domus",
  "/products/relloo",
  "/products/magneto",
  "/products/tuner",
  "/products/knowly",
];
const PERSONIFIED =
  /\b(?:a pessoa|cada pessoa|uma pessoa|1 pessoa|pessoa certa|pessoa inteira)\b/i;
const PEOPLE = /\b(?:Ana|Bia|Souza|Rafael|Lima|Davi|Bruno|Carla|Lia)\b/;
const BRANDS = [
  "WhatsApp",
  "Discord",
  "Google Agenda",
  "Banco Inter",
  "Asaas",
  "Omie",
];

for (const path of PATHS)
  test(`copy of ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path, { waitUntil: "load" });
    // Every text of the page, the drawn screens included (textContent: also what a state shows later)
    const text = await page.evaluate(() =>
      [...document.querySelectorAll("main, header, footer")]
        .map((el) => el.textContent ?? "")
        .join(" ")
        .replace(/\s+/g, " "),
    );
    const personified = text.match(PERSONIFIED)?.[0] ?? null;
    const person = text.match(PEOPLE)?.[0] ?? null;
    // A brand is loose when it is not inside brackets
    const loose = BRANDS.flatMap((brand) =>
      [...text.matchAll(new RegExp(brand, "g"))]
        .filter((m) => {
          const before = text.slice(0, m.index);
          return before.lastIndexOf("(") <= before.lastIndexOf(")");
        })
        .map(
          (m) =>
            `${brand}: …${text.slice(Math.max(0, m.index! - 30), m.index! + 30)}…`,
        ),
    );
    console.log(
      `${path}: personified=${personified} person=${person} loose brands=${loose.length}`,
    );
    expect(personified).toBeNull();
    expect(person).toBeNull();
    expect(loose).toEqual([]);
  });
