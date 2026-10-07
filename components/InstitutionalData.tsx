"use client";

export function InstitutionalData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Welabs",
    description:
      "Produtos próprios para gestão, conhecimento, relacionamento e automação.",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
    />
  );
}
