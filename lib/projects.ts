import { portfolio } from "./portfolio";

export const projects = portfolio.filter((product) => product.brand === "Imagine").map((product) => ({
  id: product.legacyId!, image: product.cover, alt: `${product.title} — recriação ilustrativa com dados fictícios`, product,
}));

export type ProjectId = NonNullable<(typeof portfolio)[number]["legacyId"]>;
export function getProject(id: ProjectId) {
  const project = projects.find((entry) => entry.id === id);
  if (!project) throw new Error(`Unknown project: ${id}`);
  return project;
}
