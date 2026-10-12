// TAMANHOS MEDIDOS
// The three windows every acceptance criterion of the site is measured at.
export const VIEWPORTS = [
  { name: "1024", width: 1024, height: 768 },
  { name: "1440", width: 1440, height: 900 },
  { name: "375", width: 375, height: 812 },
] as const;

export const ROUTES = [
  { name: "home", path: "/" },
  { name: "domus", path: "/products/domus" },
] as const;
