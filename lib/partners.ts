// LOGOS DOS CARROSSÉIS
// Third-party logos only: the ones the Imagine site already shows in its section of the companies it serves
// (imagine/public/brands, lib/emphasis.json). Stant, Tabe.la and WeGO are Imagine systems and stay out.
export const CLIENT_LOGOS = [
  { name: "Light", src: "/clients/light.png", h: 44 },
  { name: "Neoenergia", src: "/clients/neoenergia.png", h: 36 },
  { name: "Enel", src: "/clients/enel.png", h: 32 },
  { name: "Report", src: "/clients/report.svg", h: 36 },
  { name: "Kiosk Brands", src: "/clients/kiosk-brands.svg", h: 40 },
  { name: "IMA", src: "/clients/ima.svg", h: 44 },
  { name: "AVSI", src: "/clients/avsi.png", h: 44 },
] as const;

// PLATAFORMAS DE INFRA E DESENVOLVIMENTO
// Monochrome official marks: simple-icons 16.34.0 (CC0) for everything it carries; AWS (official logo SVG) and HostDime
// (official logo PNG from hostdime.com.br) are not in that package. `evidence` records why each one is listed; the
// first four were asked for by the operator, the rest are in the code or the infra we run.
export const PLATFORM_LOGOS = [
  { name: "AWS", src: "/platforms/aws.svg", h: 40, evidence: "operator" },
  {
    name: "DigitalOcean",
    src: "/platforms/digitalocean.svg",
    h: 36,
    evidence: "operator",
  },
  {
    name: "HostDime",
    src: "/platforms/hostdime.png",
    h: 20,
    evidence: "operator",
  },
  {
    name: "Google Cloud",
    src: "/platforms/googlecloud.svg",
    h: 36,
    evidence: "operator",
  },
  {
    name: "Cloudflare",
    src: "/platforms/cloudflare.svg",
    h: 36,
    evidence:
      "skill imagine-infra-operations: create-app-hostname.sh, Cloudflare for SaaS on welabs.cloud; imagine-infra-authentik-oidc: public instance behind Cloudflare",
  },
  {
    name: "Kubernetes",
    src: "/platforms/kubernetes.svg",
    h: 36,
    evidence:
      "skill imagine-infra-argocd-kubectl; erp-platform .k8s/workflows (publish-erp-*.workflow.yaml)",
  },
  {
    name: "Argo CD",
    src: "/platforms/argo.svg",
    h: 36,
    evidence:
      "skills imagine-infra-argocd-kubectl and imagine-infra-gitops-runtime",
  },
  {
    name: "Vault",
    src: "/platforms/vault.svg",
    h: 32,
    evidence: "skill imagine-infra-vault-runtime (Vault and ExternalSecrets)",
  },
  {
    name: "PostgreSQL",
    src: "/platforms/postgresql.svg",
    h: 36,
    evidence: "skill imagine-infra-postgres-temporal (external Postgres)",
  },
  {
    name: "Temporal",
    src: "/platforms/temporal.svg",
    h: 36,
    evidence: "skill imagine-infra-postgres-temporal (Temporal persistence)",
  },
  {
    name: "Authentik",
    src: "/platforms/authentik.svg",
    h: 36,
    evidence: "skill imagine-infra-authentik-oidc (OIDC providers)",
  },
  {
    name: "Docker",
    src: "/platforms/docker.svg",
    h: 36,
    evidence:
      "erp-platform infra/compose.yaml and docker-bake.hcl (frappe_docker); local runners use docker/buildkit",
  },
  {
    name: "GitHub",
    src: "/platforms/github.svg",
    h: 36,
    evidence: "repositories and PRs on github.com (welabs-io org)",
  },
] as const;

export const CLIENTS_LABEL = "Quem atendemos";
export const PLATFORMS_LABEL = "Infraestrutura e ferramentas";
