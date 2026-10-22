// COPY SEM PERSONIFICAÇÃO E SEM MARCA SOLTA
// v2.2 (audit, section 5): the copy spoke of "a pessoa", named eight fictional people (Ana, Bia Souza, Rafael Lima,
// Davi, Bruno, Carla, Lia and one more) and put third-party brands where the category belonged (measured on 8187680). On
// the rendered home and the five product pages: no personification, no fictional person, and every third-party brand
// only inside brackets, as an example of its category.
// v3 (F1): the last contact with a name left the scenes (a contact is its record id), so the names come from the one
// list of copy-rules.json, the known failures included, with no tolerance.
import { expect, test } from "@playwright/test";
import rules from "../lib/content/copy-rules.json";

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
// The names of the old copy plus the shared list; a unicode word edge, since \b breaks on an accented letter
const PEOPLE = new RegExp(
  `(?:^|[^\\p{L}])(${["Bia", "Souza", "Lima", "Lia", ...rules.persons].join("|")})(?=[^\\p{L}]|$)`,
  "u",
);
// v3 (F1 review): the third-party brands come from the one list of copy-rules.json
const BRANDS = rules.vendors;

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
    const person = text.match(PEOPLE)?.[1] ?? null;
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
