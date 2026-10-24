// DESTINO DO CONTATO
// The contact destination is still to be decided by the operator: the call to action points to the contact section of
// the home (a site path without locale prefix; the components put the prefix of the page on it, `href` of
// lib/i18n/i18n.ts, so it also works from a product page and from /en and /es).
// v3 (F1): that section is where every button lands, so it carries no button of its own (it would lead to itself); its
// way out is the products band (components/template/Home.tsx, HomeContact) until the destination is decided.
export const CONTACT_PATH = "/#contact";
