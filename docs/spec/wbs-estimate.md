# Apotheekhulp — WBS & Urenraming

**Versie:** 2.3  
**Datum:** 31 mei 2026  
**Uurtarief:** €90/uur  
**Aanpak:** Vibe coding — bestaande HTML als blueprint, data model 100% gekend

---

## Samenvatting

| Fase | Omschrijving | Uren |
|------|-------------|------|
| 0 | Meetings & Analyse | 4 |
| 1 | Fundament & Auth | 5 |
| 2 | Design System | 3 |
| 3 | Data model & API | 5 |
| 4 | Dashboard | 4 |
| 5 | Kalender & Planning | 4 |
| 6 | Gebruikersbeheer | 5 |
| 7 | Prestaties Workflow | 6 |
| 8 | Maandelijkse PDF-berekening | 4 |
| 9 | Berichten & E-mail | 4 |
| 10 | Publieke website | 3 |
| 11 | Assistent portaal | 5 |
| 12 | ~~Apotheek portaal~~ *(backend only, geen frontend)* | — |
| 13 | Migratie & deployment | 6 |


| | **Totaal** | **58** |

**Budget: 58u × €90 = €5.220 excl. BTW (€6.316 incl. BTW)**

---

## Fase 0 — Meetings & Analyse (4u)

| # | Taak | Uren |
|---|------|------|
| 0.1 | Opstartmeeting: scope, stack, planning bevestigen | 1 |
| 0.2 | Review bestaand platform, open vragen (portalen, PDF-formaat, migratie) | 1.5 |
| 0.3 | Tussentijdse reviews en feedbackronden | 1.5 |
| | **Subtotaal** | **4** |

---

## Fase 1 — Fundament & Auth (5u)

| # | Taak | Uren |
|---|------|------|
| 1.1 | Project setup: repo, AWS Amplify, Supabase, CI/CD | 2 |
| 1.2 | Auth: login, logout, rollen (admin/assistent/apotheek), wachtwoord vergeten | 3 |
| | **Subtotaal** | **5** |

---

## Fase 2 — Design System (3u)

Bestaande HTML/CSS van live site als basis. Tokens en componenten overnemen, niet herontwerpen.

| # | Taak | Uren |
|---|------|------|
| 2.1 | Kleur- en typografietokens overnemen van bestaande site | 0.5 |
| 2.2 | Base layout: nav, sidebar — structuur kopiëren van bestaande HTML | 1 |
| 2.3 | Herbruikbare componenten: Table, Card, Badge, Modal, Tabs, Form inputs | 1.5 |
| | **Subtotaal** | **3** |

---

## Fase 3 — Data Model & API (5u)

Schema volledig gekend vanuit audit. **Alle tabel- en veldnamen in het Engels** (bv. `pharmacy`, `assistant`, `shift`, `hourly_rate_assistant`).

| # | Taak | Uren |
|---|------|------|
| 3.1 | DB schema + migraties (users, assistant_profiles, pharmacy_profiles, locations, links, shifts, messages) | 2 |
| 3.2 | CRUD server actions / API routes voor alle entiteiten | 3 |
| | **Subtotaal** | **5** |

---

## Fase 4 — Dashboard (4u)

| # | Taak | Uren |
|---|------|------|
| 4.1 | KPI-kaarten (8 stuks) + DB queries | 2 |
| 4.2 | Grafieken: omzet/kost per maand, shifts per maand, status donut | 2 |
| | **Subtotaal** | **4** |

---

## Fase 5 — Kalender & Planning (4u)

| # | Taak | Uren |
|---|------|------|
| 5.1 | Kalender (FullCalendar): maand/week/dag/lijst, kleurcodering per assistent, filter sidebar | 2 |
| 5.2 | Modal shift aanmaken (assistent → apotheek → locatie kaskade, datum/uren/pauze) | 1 |
| 5.3 | Modal shift bewerken / goedkeuren / weigeren / verwijderen | 0.5 |
| 5.4 | Beschikbaarheid weekraster (alle assistenten × 7 dagen) | 0.5 |
| | **Subtotaal** | **4** |

---

## Fase 6 — Gebruikersbeheer (5u)

Rechttoe rechtaan CRUD — formuliervelden volledig gekend vanuit audit.

| # | Taak | Uren |
|---|------|------|
| 6.1 | Assistenten overzicht (actief/inactief, zoeken) + aanmaken | 1 |
| 6.2 | Assistent detail: Persoonsgegevens, Bedrijfsgegevens, Wachtwoord | 1 |
| 6.3 | Assistent detail: Verbonden Apotheken (koppelingstabel, dual pricing, kaskade) | 1.5 |
| 6.4 | Apotheken overzicht + aanmaken | 0.5 |
| 6.5 | Apotheek detail: Persoonsgegevens, Bedrijfsgegevens, Locaties | 1 |
| | **Subtotaal** | **5** |

---

## Fase 7 — Prestaties Workflow (6u)

| # | Taak | Uren |
|---|------|------|
| 7.1 | Statusmachine shifts (pending_assistant → confirmed → pending_admin → approved) | 1 |
| 7.2 | Sectie 1 & 2: te bevestigen door assistent / te goedkeuren door beheerder | 2 |
| 7.3 | Sectie 3 & 4: goedgekeurd met bedragen + selectie voor PDF-generatie | 2 |
| 7.4 | Bulk shifts aanmaken (multi-date formulier) | 1 |
| | **Subtotaal** | **6** |

---

## Fase 8 — Maandelijkse PDF-berekening (4u)

Geen factuurbeheersysteem. Enkel maandelijkse berekening van gewerkte uren → PDF downloaden. Gebruikt in extern boekhoudpakket (Octopus).

| # | Taak | Uren |
|---|------|------|
| 8.1 | Berekeningslogica: uren × uurtarief per assistent per maand, per apotheek per maand | 1 |
| 8.2 | PDF template assistent (naam, bedrijfsgegevens, maand, shifts, totaalbedrag) | 1.5 |
| 8.3 | PDF template apotheek (zelfde structuur, andere tarieven) | 1 |
| 8.4 | Download-actie per maand per persoon | 0.5 |
| | **Subtotaal** | **4** |

---

## Fase 9 — Berichten & E-mail (4u)

| # | Taak | Uren |
|---|------|------|
| 9.1 | Tarificatieberichten CRUD + rich text editor | 2 |
| 9.2 | Dagelijkse e-mail digest shift-updates (Supabase Edge Function cron + AWS SES) | 2 |
| | **Subtotaal** | **4** |

---

## Fase 10 — Publieke Website (3u)

| # | Taak | Uren |
|---|------|------|
| 10.1 | Bestaande pagina's kopiëren: Home, Over ons, Wat we doen | 2 |
| 10.2 | Contactformulier → info@apotheekhulp.be | 1 |
| | **Subtotaal** | **3** |

---

## Fase 11 — Assistent Portaal (5u)

| # | Taak | Uren |
|---|------|------|
| 11.1 | Eigen dashboard + kalender (read-only eigen shifts) | 1.5 |
| 11.2 | Beschikbaarheid instellen (eigen rij in weekraster) | 1 |
| 11.3 | Shifts bevestigen / weigeren | 1 |
| 11.4 | Eigen profiel + bedrijfsgegevens bewerken | 1 |
| 11.5 | Eigen PDF's downloaden | 0.5 |
| | **Subtotaal** | **5** |

---

## Fase 12 — Apotheek Portaal *(uitgesloten uit v1)*

Apotheek-rol bestaat in de backend (auth, data model, rollen) maar krijgt geen eigen frontend. Apotheken worden beheerd via het admin-portaal. Frontend uitwerking volgt in een latere fase.

---

## Fase 13 — Migratie & Deployment (6u)

Testing gebeurt geïntegreerd per onderdeel tijdens de ontwikkeling.

| # | Taak | Uren |
|---|------|------|
| 13.1 | Data migratie (scripts op basis van gekend schema) | 2 |
| 13.2 | Production deployment + SSL + DNS migratie | 2 |
| 13.3 | Post-launch monitoring (1e week) | 2 |
| | **Subtotaal** | **6** |

---

## Budgetoverzicht

| | Uren | Bedrag |
|---|---|---|
| 
| 
| **Totaal excl. BTW** | **58u** | **€5.220** |
| BTW 21% | | €1.096 |
| **Totaal incl. BTW** | | **€6.316** |

---

## Betalingsplan (voorstel)

| Mijlpaal | % | Bedrag excl. BTW |
|---|---|---|
| Opstart | 25% | €1.305 |
| Fase 1–7 (fundament + kalender + gebruikersbeheer + workflow) | 40% | €2.088 |
| Fase 8–13 (PDF + portalen + deployment) | 35% | €1.827 |

---

## Planning

Streefdatum: **1 juli 2026** (31 kalenderdagen)

| Week | Fases | Focus |
|------|-------|-------|
| Week 1 (2–8 jun) | 0 + 1 + 2 + 3 + 4 | Meetings, fundament, design system, dashboard |
| Week 2 (9–15 jun) | 5 + 6 | Kalender + gebruikersbeheer |
| Week 3 (16–22 jun) | 7 + 8 + 9 + 10 | Workflow + PDF + berichten + website |
| Week 4 (23–29 jun) | 11 + 13 | Assistent portaal + deployment |

**~17u/week — comfortabel haalbaar naast andere projecten.**

---

## Opmerkingen

| | |
|---|---|
| **DB schema** | Alle tabel- en veldnamen in het Engels (`shift`, `pharmacy`, `assistant`, `hourly_rate_assistant`, …). |
| **Scope facturatie** | Enkel PDF-generatie per maand. Geen factuurbeheersysteem. Extern boekhoudpakket (Octopus) verwerkt verder. |
| **Design system** | Overnemen van bestaande HTML/CSS — geen herontwerp. |
| **Apotheek portaal** | Geen frontend in v1. Rol en data aanwezig in backend. |
| **Niet in raming** | Content Hub: +6u. Drag-and-drop kalender: +4u. Export CSV: +2u. Apotheek portaal frontend: +3u. |

---

*Opgesteld door Adriaan De Bolle (Manengo) — v2.3 op 31 mei 2026*
