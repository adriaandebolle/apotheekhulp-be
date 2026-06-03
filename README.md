# Apotheekhulp

Platform voor het beheren van interim-apotheekassistenten in België. Admins plannen shifts, assistenten bevestigen hun prestaties, en het systeem genereert maandelijkse PDF-overzichten voor de boekhouding.

**Status:** Rebuild in uitvoering — target live **1 juli 2026**

---

## Stack

| Laag | Technologie |
|------|-------------|
| Frontend | Next.js 16 (App Router, React 19, TypeScript) |
| Styling | Tailwind CSS 4 |
| Database & Auth | Supabase (PostgreSQL + Row Level Security) |
| Hosting | AWS Amplify |
| PDF generatie | Server-side (fase 8) |
| E-mail | AWS SES + Supabase Edge Functions |

---

## Rollen

| Rol | Toegang |
|-----|---------|
| **Admin** | Volledig beheer — shifts, gebruikers, factuuroverzichten |
| **Assistent** | Eigen kalender, beschikbaarheid, profiel, PDF-overzichten |
| **Apotheek** | Enkel backend in v1 — geen eigen frontend |

---

## Mappenstructuur

```
apotheekhulp/
├── src/
│   └── app/                  # Next.js App Router
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── supabase/
│   ├── config.toml
│   └── migrations/           # DB migraties (aangemaakt in fase 3)
├── public/                   # Statische assets
├── docs/
│   ├── spec/
│   │   ├── product-spec.md   # Volledig functionele spec (audit mei 2026)
│   │   ├── wbs-estimate.md   # WBS + urenraming (v2.3)
│   │   └── styling-guide.md  # Design tokens
│   ├── as-is/                # Screenshots bestaand platform
│   └── legal/                # NDA + vertrouwelijkheidsovereenkomst
├── .env.local.example        # Voorbeeld omgevingsvariabelen
├── .env.local                # Lokale secrets (niet in git)
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts        # Aangemaakt in fase 2
```

---

## Setup

### Vereisten

- Node.js 20+
- Supabase CLI — `brew install supabase/tap/supabase`

### Lokaal opstarten

```bash
# 1. Kloon de repo
git clone https://github.com/manengo/apotheekhulp.git
cd apotheekhulp

# 2. Installeer dependencies
npm install

# 3. Kopieer environment variabelen en vul in
cp .env.local.example .env.local

# 4. Start Supabase lokaal
supabase start

# 5. Voer migraties uit
supabase db push

# 6. Start de dev server
npm run dev
```

App draait op [http://localhost:3000](http://localhost:3000).  
Supabase Studio: [http://localhost:54323](http://localhost:54323)

### Environment variabelen

Zie [.env.local.example](.env.local.example). Kopieer naar `.env.local` en vul de waarden in vanuit je Supabase project dashboard.

| Variabele | Beschrijving |
|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (public) |
| `SUPABASE_SECRET_KEY` | Supabase secret key (server-only) |
| `AWS_SES_REGION` | AWS regio voor e-mailversturing |
| `AWS_ACCESS_KEY_ID` | AWS access key (fase 9) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (fase 9) |

---

## Ontwikkelplanning

| Week | Fases | Onderwerp |
|------|-------|-----------|
| Week 1 (2–8 jun) | 0–4 | Meetings, fundament, auth, design system, dashboard |
| Week 2 (9–15 jun) | 5–6 | Kalender & gebruikersbeheer |
| Week 3 (16–22 jun) | 7–10 | Workflow, PDF, berichten, publieke site |
| Week 4 (23–29 jun) | 11 + 13 | Assistent portaal & deployment |

Zie [docs/spec/wbs-estimate.md](docs/spec/wbs-estimate.md) voor de volledige raming (58u — €5.220 excl. BTW).

---

*Ontwikkeld door [Manengo](https://manengo.be) voor Apotheekhulp bv*
