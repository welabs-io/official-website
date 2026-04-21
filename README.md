# Imagine Apps

Site institucional da Imagine Apps — landing page com portfólio de projetos, página "Sobre" e formulário de contato.

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- CSS global (`app/globals.css`)
- Resend para envio de e-mails do formulário de contato

## Requisitos

- Node.js 18.18+ (recomendado 20+)
- npm

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm start` — sobe o build de produção
- `npm run lint` — lint

## Variáveis de ambiente

Crie um `.env.local` na raiz:

```
RESEND_API_KEY=sua_chave_resend
CONTACT_TO_EMAIL=destinatario@exemplo.com
CONTACT_FROM_EMAIL=no-reply@seudominio.com
```

O endpoint do formulário fica em `app/api/contact`.

## Estrutura

```
app/
  api/contact/       # endpoint do formulário
  sobre/             # página Sobre
  HomeClient.tsx     # home (hero, métricas, portfólio, contato)
  layout.tsx
  page.tsx
  globals.css
components/
  WorkCarousel.tsx   # carrossel de projetos da home
  ProjectModal.tsx   # modal de detalhes do projeto
  LangProvider.tsx   # i18n (pt/en)
  ContactForm.tsx
  Header.tsx / Footer.tsx / Chrome.tsx
public/
  portfolio/         # imagens dos projetos
```

## Internacionalização

Os textos passam por `useT()` do `LangProvider`. Para adicionar idiomas ou chaves, edite `components/LangProvider.tsx`.

## Portfólio

A lista de projetos do carrossel está em `components/WorkCarousel.tsx`. Para adicionar um novo projeto:

1. Coloque a imagem em `public/portfolio/`.
2. Adicione uma entrada no array `projects`.
3. Cadastre as chaves `portfolio-<id>-cat`, `portfolio-<id>-title`, `portfolio-<id>-desc` no `LangProvider`.
4. Se tiver página de detalhes no modal, registre em `ProjectModal.tsx`.

## Deploy

Qualquer plataforma que suporte Next.js 15 (Vercel, Netlify, Node self-hosted). Lembre de configurar as variáveis de ambiente do Resend.
