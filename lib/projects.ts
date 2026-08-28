export const projects = [
  { id: 'kiosk', image: '/portfolio/kiosk-brands.png', alt: 'Kiosk Brands' },
  { id: 'tabela', image: '/portfolio/tabela.png', alt: 'Tabela Gestão' },
  { id: 'stant', image: '/portfolio/stant.png', alt: 'Stant' },
  { id: 'report', image: '/portfolio/report.png', alt: 'Report ESG' },
  { id: 'avsi', image: '/portfolio/avsi.png', alt: 'AVSI Brasil' },
  { id: 'eco-enel', image: '/portfolio/eco-enel.png', alt: 'EcoEnel' },
  { id: 'light', image: '/portfolio/light.png', alt: 'Light' },
  { id: 'ima', image: '/portfolio/ima.png', alt: 'IMA Alagoas' },
  { id: 'central', image: '/portfolio/central.png', alt: 'Central ESG' },
  { id: 'loquei', image: '/portfolio/loquei.png', alt: 'Loquei' },
  { id: 'avsi-acec', image: '/portfolio/avsi-acec.png', alt: 'AVSI ACEC' },
] as const;

export type ProjectId = (typeof projects)[number]['id'];

export function getProject(id: ProjectId) {
  return projects.find((project) => project.id === id)!;
}
