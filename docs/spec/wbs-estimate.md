# Apotheekhulp — WBS & Urenraming

**Versie:** 3.1  
**Datum:** 5 juni 2026  
**Uurtarief:** €90/uur  
**Aanpak:** Vibe coding — bestaande HTML als blueprint, data model 100% gekend

---

## Samenvatting

| Fase | Omschrijving | Uren | Status |
|------|-------------|------|--------|
| 0 | Meetings & Analyse | 4 | ✅ Afgerond |
| 1 | Fundament & Auth | 5 | ✅ Afgerond |
| 2 | Design System | 3 | ✅ Afgerond |
| 3 | Data model & API | 5 | ✅ Afgerond |
| 4 | Gebruikersbeheer | 5 | ✅ Afgerond |
| 5 | Kalender & Planning | 4 | ✅ Afgerond |
| 6 | Prestaties Workflow | 6 | ✅ Afgerond |
| 7 | Dashboard | 4 | ✅ Afgerond |
| 8 | Maandelijkse PDF-berekening + Factuurbeheersysteem | 4 | ✅ Afgerond |
| 9 | Berichten & E-mail | 4 | ✅ Afgerond |
| 10 | Publieke website | 1 | ✅ Pagina's afgerond — enkel contactformulier e-mail resterend |
| 11 | Assistent portaal | 5 | |
| 12 | Apotheek portaal | 3 | |
| 13 | Migratie & deployment | 6 | |


| | **Totaal** | **59** | |

**Budget: 59u × €90 = €5.310 excl. BTW (€6.425 incl. BTW)**

> Vergeleken met v2.3: −2u. Fase 10 verlaagd van 3u naar 1u (pagina's reeds gebouwd als neveneffect van Fase 2).

---

## Fase 0 — Meetings & Analyse (4u) ✅

| # | Taak | Uren |
|---|------|------|
| 0.1 | Opstartmeeting: scope, stack, planning bevestigen | 1 |
| 0.2 | Review bestaand platform, open vragen (portalen, PDF-formaat, migratie) | 1.5 |
| 0.3 | Tussentijdse reviews en feedbackronden | 1.5 |
| | **Subtotaal** | **4** |

---

## Fase 1 — Fundament & Auth (5u) ✅

| # | Taak | Uren |
|---|------|------|
| 1.1 | Project setup: repo, AWS Amplify, Supabase, CI/CD | 2 |
| 1.2 | Auth: login, logout, rollen (admin/assistent/apotheek), wachtwoord vergeten | 3 |
| | **Subtotaal** | **5** |

---

## Fase 2 — Design System (3u) ✅

Bestaande HTML/CSS van live site als basis. Tokens en componenten overnemen, niet herontwerpen.

| # | Taak | Uren |
|---|------|------|
| 2.1 | Kleur- en typografietokens overnemen van bestaande site | 0.5 |
| 2.2 | Base layout: nav, sidebar — structuur kopiëren van bestaande HTML | 1 |
| 2.3 | Herbruikbare componenten: Table, Card, Badge, Modal, Tabs, Form inputs | 1.5 |
| | **Subtotaal** | **3** |

---

## Fase 3 — Data Model & API (5u) ✅

Schema volledig gekend vanuit audit. **Alle tabel- en veldnamen in het Engels** (bv. `pharmacy`, `assistant`, `shift`, `hourly_rate_assistant`).

| # | Taak | Uren |
|---|------|------|
| 3.1 | DB schema + migraties (users, assistant_profiles, pharmacy_profiles, locations, links, shifts, messages) | 2 |
| 3.2 | CRUD server actions voor alle entiteiten | 3 |
| | **Subtotaal** | **5** |

---

## Fase 4 — Gebruikersbeheer (5u) ✅

Rechttoe rechtaan CRUD — formuliervelden volledig gekend vanuit audit. Lijstpagina's voor assistenten en apotheken zijn reeds gebouwd (neveneffect van Fase 3).

| # | Taak | Uren |
|---|------|------|
| 4.1 | Assistent aanmaken (nieuw-pagina) | 0.5 |
| 4.2 | Assistent detail: Persoonsgegevens, Bedrijfsgegevens, Wachtwoord | 1 |
| 4.3 | Assistent detail: Verbonden Apotheken (koppelingstabel, dual pricing, kaskade) | 1.5 |
| 4.4 | Apotheek aanmaken (nieuw-pagina) | 0.5 |
| 4.5 | Apotheek detail: Persoonsgegevens, Bedrijfsgegevens, Locaties | 1.5 |
| | **Subtotaal** | **5** |

---

## Fase 5 — Kalender & Planning (4u) 🟡

| # | Taak | Uren |
|---|------|------|
| 5.1 | ~~Kalender (FullCalendar): maand/week/dag/lijst, kleurcodering per assistent, filter sidebar~~ | ~~2~~ ✅ |
| 5.2 | ~~Modal shift aanmaken (assistent → apotheek → locatie kaskade, datum/uren/pauze)~~ | ~~1~~ ✅ |
| 5.3 | ~~Modal shift bewerken / goedkeuren / weigeren / verwijderen~~ | ~~0.5~~ ✅ |
| 5.4 | ~~Beschikbaarheid weekraster (alle assistenten × 7 dagen)~~ | ~~0.5~~ ✅ |
| | **Subtotaal** | **4** |

---

## Fase 6 — Prestaties Workflow (6u) ✅

| # | Taak | Uren |
|---|------|------|
| 6.1 | Statusmachine shifts (pending_assistant → pending_apotheek → approved) | 1 |
| 6.2 | Sectie 1 & 2: te bevestigen door assistent / goed te keuren door apotheek (beheerder namens apotheek) | 2 |
| 6.3 | Sectie 3: goedgekeurd met bedragen + selectie voor PDF-generatie | 2 |
| 6.4 | Bulk shifts aanmaken (multi-date formulier) | 1 |
| | **Subtotaal** | **6** |

---

## Fase 7 — Dashboard (4u)

Zinvol pas na Fase 4–6: KPI's en grafieken vereisen echte shifts en gebruikers.

| # | Taak | Uren |
|---|------|------|
| 7.1 | ~~KPI-kaarten (8 stuks) + DB queries~~ | ~~2~~ ✅ |
| 7.2 | ~~Grafieken: omzet/kost per maand, shifts per maand, status donut~~ | ~~2~~ ✅ |
| | **Subtotaal** | **4** |

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
| 9.2 | Dagelijkse e-mail digest shift-updates (Supabase Edge Function cron + AWS SES) | 1 |
| 9.2 | Andere email zoals optionele welkom e-mail bij creatie apotheek/assistent (Supabase Edge Function cron + AWS SES) | 1 |
| | **Subtotaal** | **4** |

---

## Fase 10 — Publieke Website (1u)

Pagina's (Home, Over ons, Wat we doen, Contact) zijn reeds gebouwd als neveneffect van Fase 2. Enkel contactformulier e-mail resterend.

| # | Taak | Uren |
|---|------|------|
| 10.1 | ~~Bestaande pagina's kopiëren: Home, Over ons, Wat we doen~~ | ~~2~~ ✅ |
| 10.2 | Contactformulier → info@apotheekhulp.be en Email ter bevestiging van contactontvangst | 1 |
| | **Subtotaal** | **1** |

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

## Fase 12 — Apotheek Portaal (3u)

| # | Apotheek portaal | Uren |
|---|------|------|
| 12.1 | Dashboard + kalender (read-only eigen shifts per locatie) | 1.5 |
| 12.2 | Prestaties: maandoverzicht per locatie | 1 |
| 12.3 | Tarificaties: tariefinformatie van beheerder | 0.5 |
| | **Subtotaal** | **3** |

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
| Reeds uitgevoerd (fase 0–7 + fase 10 pagina's) | ~35.5u | ~€3.195 |
| Resterend (fase 8–13) | ~23.5u | ~€2.115 |
| **Totaal excl. BTW** | **59u** | **€5.310** |
| BTW 21% | | €1.115 |
| **Totaal incl. BTW** | | **€6.425** |

---

## Betalingsplan (voorstel)

| Mijlpaal | % | Bedrag excl. BTW |
|---|---|---|
| Opstart | 25% | €1.328 |
| Fase 4–7 (gebruikersbeheer + kalender + workflow + dashboard) | 40% | €2.124 |
| Fase 8–13 (PDF + portalen + deployment) | 35% | €1.859 |

---

## Planning

Streefdatum: **1 juli 2026** (27 resterende kalenderdagen)

| Week | Fases | Focus |
|------|-------|-------|
| ~~Week 1 (5–8 jun)~~ | ~~4~~ | ~~Gebruikersbeheer~~ ✅ afgerond (incl. fase 5 + 6) |
| ~~Week 2 (9–15 jun)~~ | ~~7 + 5.4~~ | ~~Dashboard + Beschikbaarheid weekraster~~ ✅ afgerond |
| Week 3 (16–22 jun) | 8 + 9 | PDF-berekening + Berichten & E-mail |
| Week 4 (23–29 jun) | 11 + 12 | Assistent portaal + Apotheek portaal |
| Week 5 (30 jun) | 10.2 + 13 | Contact e-mail + Deployment |

---

## Opmerkingen

| | |
|---|---|
| **Volgorde rationale** | Fase 4 (Gebruikersbeheer) eerst: zodra echte assistenten en apotheken bestaan, kunnen shifts worden aangemaakt via de kalender. Dashboard (Fase 7) wordt pas zinvol nadat er echte shift-data is. |
| **Seed data** | Na Fase 4: korte dev-migratie toevoegen met testshifts en -koppelingen zodat Fase 5 en 7 direct iets tonen. |
| **DB schema** | Alle tabel- en veldnamen in het Engels (`shift`, `pharmacy`, `assistant`, `hourly_rate_assistant`, …). |
| **Scope facturatie** | Enkel PDF-generatie per maand. Geen factuurbeheersysteem. Extern boekhoudpakket (Octopus) verwerkt verder. |
| **Apotheek portaal** | Read-only portaal in v1: kalender, prestaties, tarificaties. Geen beheerfunctionaliteit. |
| **Niet in raming** | Content Hub: +6u. Drag-and-drop kalender: +4u. Export CSV: +2u. |

---

*Opgesteld door Adriaan De Bolle (Manengo) — v3.1 op 5 juni 2026*
