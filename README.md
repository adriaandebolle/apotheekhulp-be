# Apotheekhulp

Platform voor het beheren van interim-apotheekassistenten in België. Admins plannen shifts, assistenten bevestigen hun prestaties, en het systeem genereert maandelijkse PDF-overzichten voor de boekhouding.

**Status:** Rebuild in uitvoering — target live **1 juli 2026**

---

## Stack

| Laag | Technologie |
|------|-------------|
| Frontend | Next.js (App Router) |
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
├── docs/
│   ├── spec/
│   │   ├── product-spec.md       # volledig functionele spec (audit mei 2026)
│   │   ├── wbs-estimate.md       # WBS + urenraming (v2.3)
│   │   └── styling-guide.md      # design tokens (in opbouw)
│   ├── as-is/                    # screenshots bestaand platform
│   └── legal/                    # NDA + vertrouwelijkheidsovereenkomst
├── src/                          # Next.js applicatie (aangemaakt in fase 1)
└── supabase/                     # migrations + edge functions (aangemaakt in fase 1)
```

---

## Setup

### Vereisten

- Node.js 20+
- Supabase CLI (`npm install -g supabase`)
- AWS CLI (voor Amplify deployment)

### Lokaal opstarten

```bash
# 1. Kloon de repo
git clone https://github.com/manengo/apotheekhulp.git
cd apotheekhulp

# 2. Installeer dependencies
npm install

# 3. Kopieer environment variabelen
cp .env.example .env.local
# Vul NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in

# 4. Start Supabase lokaal
supabase start

# 5. Voer migraties uit
supabase db push

# 6. Start de dev server
npm run dev
```

App draait op [http://localhost:3000](http://localhost:3000).

### Environment variabelen

| Variabele | Beschrijving |
|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `AWS_SES_REGION` | AWS regio voor e-mailversturing |

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
