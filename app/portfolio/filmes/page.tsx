import { permanentRedirect } from "next/navigation";

// ÍNDICE DE FILMES APOSENTADO
// The mixed Imagine/Welabs film list left on 2026-10-05; films now live on each product page.
export default function Page() {
  permanentRedirect("/portfolio");
}
