# Apotheekhulp — Styling Guide

**Status:** Draft — kleurwaarden te bevestigen via browser DevTools op live site  
**Referentie:** https://www.apotheekhulp.be/

---

## Kleurpalet

> Exacte hexwaarden zijn TBC — open de live site, inspecteer elementen via DevTools → Computed en vul hier de waarden in.

| Token | Omschrijving | Waarde |
|-------|-------------|--------|
| `color-primary` | Groen/teal — hoofdkleur, buttons, accenten | TBC |
| `color-primary-dark` | Donkerdere variant voor hover-states | TBC |
| `color-background` | Paginaachtergrond | `#ffffff` of lichtgrijs TBC |
| `color-surface` | Alternatieve sectie-achtergrond (afwisselend) | TBC |
| `color-text` | Hoofdtekst | Donkergrijs / near-black TBC |
| `color-text-muted` | Subtekst, labels | TBC |
| `color-border` | Lijnen, formulierranden | TBC |

---

## Typografie

> Lettertype te bevestigen via DevTools → Computed → font-family

| Element | Stijl |
|---------|-------|
| Lettertype | Clean sans-serif — TBC (vermoedelijk Google Fonts) |
| h1 | Bold, groot — hero-koptekst |
| h2 | Bold, sectiekoptekst, vaak gecentreerd |
| h3 | Semi-bold, kaarttitels / tabkoppen |
| Body | Normale gewicht, comfortabele leesgrootte |
| Taal | Nederlands (nl-BE) |

---

## Layout

- **Max breedte container:** ~1200px met horizontale padding
- **Navigatiebalk:** vast bovenaan — logo links, links rechts, login-knop uiterst rechts
- **Secties:** afwisselende achtergrondkleur (wit / lichtgrijs)
- **Responsive:** mobiel-vriendelijk

---

## Componenten

### Navigatiebalk
- Logo (klikbaar naar `/`)
- Navigatielinks: Home · Over ons · Wat we doen · Contact
- Login-knop: pill/outline stijl, rechts uitgelijnd

### Hero
- Volledige breedte, achtergrondafbeelding
- Gecentreerde h1-koptekst
- Korte subtekst
- Primaire CTA-knop ("Contacteer ons")

### Servicetabs
- Tabbladen: "Voor apotheken" / "Voor apotheekassistenten"
- Elk paneel toont 4 diensten als kaarten of lijstitems

### Oprichterskaarten
- Ronde avatarfoto
- Naam + korte bio
- Warme, persoonlijke toon

### Contactformulier
- Velden: Naam, E-mail, Telefoonnummer, Bericht
- Primaire verstuurknop
- Koptekst: "Laten we samenwerken!"

### Footer
- Minimaal
- Contactgegevens: info@apotheekhulp.be · +32 472 57 91 16 · +32 494 99 61 82

---

## Huisstijlnoten

- Professionele, warme toon — zorgzaam en betrouwbaar
- Farmaceutische context — geen klinische koelheid, maar menselijk
- Geen overdadig gebruik van iconen of decoratieve elementen
- Foto's van echte oprichters — geen stockfoto's voor de persoonlijke secties
