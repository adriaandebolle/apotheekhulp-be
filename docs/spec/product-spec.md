# Apotheekhulp — Product Specification

**Versie:** 1.0  
**Datum:** 31 mei 2026  
**Opgesteld door:** Adriaan De Bolle — Manengo  
**Voor:** Lieselot Van De Velde & Carolien Van der Sypt — Apotheekhulp bv

---

## 1. Projectoverzicht

**Apotheekhulp bv** bemiddelt tussen freelance apotheekassistenten en apotheken. Het platform verzorgt alle operationele processen: matchmaking, planning, uren-registratie en maandelijkse facturatie. Apotheekhulp neemt een marge op elke geplaatste shift.

### Waarom herbouwen?

De huidige website werd ontwikkeld door een externe partij die de broncode achterhoudt. Dit levert twee directe risico's op:

1. **Bedrijfscontinuïteit** — de vorige ontwikkelaar kan op elk moment de toegang blokkeren.
2. **Beveiliging** — de vorige ontwikkelaar ontvangt kopieën van alle contactformulier-inzendingen.

Het platform wordt volledig herbouwd zodat Apotheekhulp bv vanaf dag één volledige, onafhankelijke controle heeft over code en infrastructuur.

---

## 2. Partijen

| Rol | Persoon | Organisatie |
|-----|---------|-------------|
| Opdrachtgever | Lieselot Van De Velde | Apotheekhulp bv |
| Zaakvoerder | Carolien Van der Sypt | Apotheekhulp bv |
| Ontwikkelaar | Adriaan De Bolle | Manengo |

**Apotheekhulp bv**

| | |
|-|-|
| KBO | 1010.352.295 |
| BTW | BE 1010.352.295 |
| Rechtsvorm | BV |
| Adres | Wanzelesteenweg 98, 9260 Wichelen |

---

## 3. Samenwerking

| | |
|-|-|
| Facturatie | Uurtarief — zie bijlage WBS & Raming |
| Streefdatum lancering | **1 juli 2026** *(aansluiting bij maandelijkse facturatiecyclus)* |
| Code-eigendom | Apotheekhulp bv is eigenaar van alle code |
| Hosting | AWS — account op naam Apotheekhulp bv; Adriaan als medewerker |
| Code | GitHub — account op naam Apotheekhulp bv; Adriaan als medewerker |
| NDA | Wederzijdse NDA vóór aanvang werk |

---

## 4. Gebruikersrollen

| Rol | Wie | Toegang |
|-----|-----|---------|
| **Beheerder** | Carolien, Lieselot | Volledig platform |
| **Assistent** | Freelance apotheekassistenten | Eigen kalender, beschikbaarheid, profiel, maandoverzichten |
| **Apotheek** | Contactpersoon apotheek | Eigen kalender, eigen prestaties, tarificaties |

---

## 5. Functionele Specificaties

### 5.1 Publieke Website

Vier pagina's, inhoud overgenomen van de huidige site:

| Pagina | Inhoud |
|--------|--------|
| **Home** | Hero, diensten voor apotheken & assistenten, intro oprichters, contact-CTA |
| **Over ons** | Lieselot & Carolien — achtergrond en visie |
| **Wat we doen** | Flexibele inzet, IMV, bereidingen; voordelen voor assistenten |
| **Contact** | Contactformulier, info@apotheekhulp.be, telefoonnummers |

Het contactformulier stuurt uitsluitend naar info@apotheekhulp.be (huidig e-mailadres van externe partij wordt verwijderd).

---

### 5.2 Login & Toegangsbeheer

- Login via e-mail + wachtwoord
- **Nieuw:** "Wachtwoord vergeten"-flow (ontbreekt op huidig platform)
- Na login automatisch doorgestuurd naar het juiste portaal op basis van rol
- Beheerder kan wachtwoorden van assistenten en apotheken instellen

---

### 5.3 Dashboard (beheerder)

Overzichtspagina met alle belangrijke cijfers in één oogopslag:

**Cijferkaarten:**
- Aantal actieve assistenten en apotheken
- Shifts deze maand (vergelijking vorige maand)
- Openstaande maandoverzichten
- Omzet en kosten (betaald / openstaand)
- Vervallen openstaande bedragen (>30 dagen)

**Grafieken:**
- Omzet, kosten en winst per maand
- Shifts per maand
- Verdeling status shifts

**Overzichtstabellen:**
- Meest actieve assistenten deze maand
- Top apotheken op omzet
- Recentste shifts met status

**Snelle acties:** nieuwe assistent aanmaken, nieuwe apotheek aanmaken, shift inplannen, naar kalender, naar prestaties, naar facturen.

---

### 5.4 Kalender

Interactieve kalender met vier weergaven: maand, week, dag en lijst.

- Elke assistent heeft een vaste kleur
- Filteren per assistent via zijbalk (vinkjes)
- Klik op een dag → shift aanmaken (assistent, apotheek, locatie, datum en uren)
- Klik op een shift → details bekijken, bewerken, goedkeuren of verwijderen
- Kleurlegende zichtbaar

---

### 5.5 Beschikbaarheid

Weekraster met alle assistenten. Per dag zichtbaar:
- Beschikbaar ✅
- Shift ingepland 🔵
- Onbeschikbaar 🔴

Assistenten passen hun eigen beschikbaarheid aan via hun portaal.

---

### 5.6 Shifts Bulk Inplannen

Dezelfde shift aanmaken voor meerdere datums tegelijk: selecteer data, vul uren en assistent/apotheek/locatie in, bevestig. Overzicht ter controle vóór aanmaken.

---

### 5.7 Berichten

Beheerder kan berichten publiceren voor assistenten (bijv. tariefwijzigingen, sector-updates):
- Rijke teksteditor (opmaak, lijsten, links)
- Optie om het recentste bericht als popup te tonen op de homepagina na login
- Berichten beheren: aanmaken, bewerken, verwijderen

---

### 5.8 Gebruikersbeheer — Assistenten

**Overzicht:** gesorteerde lijst van actieve en inactieve assistenten, met zoekfunctie.

**Assistent aanmaken:** naam, e-mail, telefoonnummer invullen → systeem stuurt uitnodigingsmail met wachtwoordlink.

**Assistent detail — 6 tabbladen:**

| Tabblad | Inhoud |
|---------|--------|
| Persoonsgegevens | Naam, e-mail, telefoon, profielfoto, account actief/inactief |
| Bedrijfsgegevens | BTW-nummer, bedrijfsnaam, adres, IBAN-rekeningnummer |
| Verbonden Apotheken | Per apotheek-locatie: uurtarief assistent, uurtarief apotheek, km-vergoeding, afstand |
| Prestaties | Shifts per status voor deze assistent |
| Maandoverzichten | Downloadbare PDF's per maand |
| Wachtwoord | Wachtwoord instellen |

---

### 5.9 Gebruikersbeheer — Apotheken

**Overzicht:** lijst van alle apotheken met zoekfunctie en status.

**Apotheek aanmaken:** e-mail, naam, telefoonnummer → uitnodigingsmail.

**Apotheek detail — 6 tabbladen:**

| Tabblad | Inhoud |
|---------|--------|
| Contactgegevens | E-mail, telefoon, profielfoto, account actief/inactief |
| Bedrijfsgegevens | BTW-nummer, bedrijfsnaam, facturatieadres |
| Locaties | Vestigingen beheren (naam, adres) — apotheekgroepen kunnen meerdere locaties hebben |
| Verbonden Assistenten | Zelfde tarieventabel als bij assistenten |
| Prestaties | Shifts voor deze apotheek |
| Wachtwoord | Wachtwoord instellen |

---

### 5.10 Prestaties & Workflow

Centrale pagina voor het opvolgen en goedkeuren van alle shifts. Vier stappen:

| Stap | Beschrijving | Acties |
|------|-------------|--------|
| **1. Wacht op assistent** | Shift aangemaakt, assistent heeft nog niet bevestigd | Bewerken, verwijderen |
| **2. Wacht op beheerder** | Assistent bevestigd, beheerder keurt goed | Goedkeuren, wijzigen, verwijderen |
| **3. Goedgekeurd** | Volledig goedgekeurd — assistent- en apotheekkost zichtbaar | — |
| **4. Klaar voor maandoverzicht** | Selecteer shifts → genereer PDF voor apotheek of assistent | PDF aanmaken |

---

### 5.11 Maandelijkse Overzichten (PDF)

Aan het einde van elke maand genereert het systeem downloadbare PDF-overzichten:

- **Per assistent:** gewerkte shifts, uren, uurtarief, totaalbedrag — gebruikt als basis voor betaling via extern boekhoudpakket (Octopus)
- **Per apotheek:** zelfde structuur, eigen tarief

Geen volledig factuurbeheersysteem — de verdere boekhouding blijft in Octopus.

---

### 5.12 Dagelijkse E-maildigest

Assistenten ontvangen elke ochtend één gebundelde e-mail met alle shift-updates van de vorige dag (nieuwe shifts, wijzigingen, annuleringen). Geen afzonderlijke mails per event.

---

### 5.13 Assistent Portaal

Eigen omgeving voor elke assistent na login:

- Dashboard met komende shifts
- Kalender (eigen shifts, read-only)
- Beschikbaarheid instellen per dag
- Shifts bevestigen of weigeren
- Eigen profiel en bedrijfsgegevens beheren
- Maandoverzichten downloaden

---

### 5.14 Apotheek Portaal

Eigen omgeving voor elke apotheek na login:

- Dashboard met komende shifts voor hun locatie(s)
- Kalender (shifts voor hun locaties, read-only)
- Prestaties: overzicht shifts per maand per locatie
- Tarificaties: tariefinformatie gepubliceerd door beheerder

---

## 6. Verbeteringen t.o.v. Huidig Platform

| Gebied | Verbetering |
|--------|------------|
| **Beveiliging** | Veilige, niet-gissbare URL's voor alle entiteiten |
| **Toegang** | Volledige eigendom code en infrastructuur bij Apotheekhulp bv |
| **Wachtwoorden** | "Wachtwoord vergeten"-flow + beheerder kan wachtwoorden instellen |
| **Meldingen** | Dagelijkse digest — één mail per dag, geen inbox-overlast |
| **Berichten** | Berichten aanmaken, bewerken én verwijderen |
| **Gebruikersbeheer** | Nieuwe assistent/apotheek correct aanmaken |
| **Dashboard** | Correcte omzetberekening huidige maand |
| **Contactformulier** | Alleen naar info@apotheekhulp.be, externe partij verwijderd |

---

## 7. Buiten Scope

- PEPPOL/e-invoicing (handmatig via Octopus)
- Data-migratie historische shifts en facturen *(nader te bepalen)*
- Marketing, SEO en analytics
- Apotheek-portaal: enkel-voor-eigen-shifts read-only weergave (geen beheer)
- Boekhouding- of ERP-koppeling

---

## 8. Infrastructuur & Eigendom

| Component | Details |
|-----------|---------|
| Hosting | AWS — eigendom Apotheekhulp bv |
| Database | Supabase / AWS — eigendom Apotheekhulp bv |
| Code | GitHub — eigendom Apotheekhulp bv |
| Domein | apotheekhulp.be — geregistreerd bij Combell |
| E-mail | info@apotheekhulp.be — routing geconfigureerd door Adriaan |

---

## 9. Volgende Stappen

- [x] Adriaan levert NDA-sjabloon aan Lieselot
- [x] Lieselot stuurt inloggegevens huidig platform
- [x] Adriaan reviewt huidig platform
- [x] Product spec en urenraming opgesteld
- [ ] NDA ondertekend door beide partijen
- [ ] AWS- en GitHub-accounts opzetten op naam Apotheekhulp bv
- [ ] Ontwikkeling opgestart
- [ ] Testomgeving online
- [ ] Validatie met Lieselot & Carolien
- [ ] DNS- en e-mailmigratie
- [ ] Go-live 1 juli 2026

---

*Bijlage: zie `docs/spec/wbs-estimate.md` voor de volledige urenraming en het budget.*

---

*Opgesteld door Adriaan De Bolle (Manengo) — 31 mei 2026*
