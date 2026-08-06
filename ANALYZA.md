# Analýza webu SILENTUM° (izolace)

Statický web (8 stránek + dashboard), HTML/CSS/JS, GSAP animace. Design je nadprůměrný — silná typografie, promyšlený vizuální systém, konzistentní jazyk značky. Níže konkrétní nálezy podle tří oblastí, seřazené podle priority.

---

## 🔴 Kritické (řeš první — přímo brzdí poptávky)

**1. Kontaktní formulář nikam neodesílá.**
`kontakt.html` má `<form action="#">` a v `script.js` není žádná obsluha odeslání. Zákazník vyplní formulář, klikne „Odeslat poptávku" → stránka se jen znovu načte a data zmizí. Toto je nejzávažnější problém celého webu — hlavní konverzní kanál nefunguje. Potřebuje napojení (např. Formspree/Web3Forms, vlastní endpoint, nebo e-mail služba) + poděkovací stav po odeslání.

**2. Klíčová tlačítka vedou na `#` (mrtvé odkazy).**
- `index.html` — hlavní CTA „Poslat poptávku" v kontaktní sekci → `href="#"`
- `produkt.html` — „Vzorek zdarma" + všechny 4 odkazy na dokumenty (technický list, protokol o útlumu, montážní návod, CAD) → `href="#"`

Návštěvník, který chce jednat, narazí do zdi.

**3. Web nemá jediné reálné foto — vše jsou placeholdery.**
46 prázdných `.ph` boxů s popiskem typu „Akustický panel — produktová fotka". U řemeslné firmy, kde zákazník kupuje důvěru a řemeslo, jsou fotky realizací to nejdůležitější. Bez nich působí web jako šablona/demo, ne jako reálná firma. Doplnit fotky z realizací, produktů a týmu je největší obsahová priorita.

---

## 🟠 Důležité (poškozují důvěryhodnost nebo dohledatelnost)

**4. Nekonzistentní čísla a kontakty — riziko pro důvěru.**
- E-mail: web střídá `audit@silentum.cz` (homepage) a `info@silentum.cz` (schema + 4×). Sjednotit na jeden.
- Reference: homepage uvádí „79 hodnocení na Google", ale `schema.org` v hlavičce má `reviewCount: 847`. 847 je zároveň počet realizací — vypadá to, že se počet zakázek omylem vydává za počet recenzí. Nejednotná čísla snižují věrohodnost a mohou porušovat pravidla Google pro rich snippets.
- „98 % spokojených klientů (NPS 76)" — NPS a „% spokojených" jsou dvě různé metriky spojené do jedné; působí to zaměněně.

**5. Homepage nemá `<h1>`.**
Titulek „Vrátíme ticho" je jen `<div class="hero__giant">`. Stránka tak nemá hlavní nadpis — horší pro čtečky i pro Google. Podstránky `<h1>` mají, homepage jako jediná ne.

**6. Chybí meta description na 3 stránkách.**
`katalog.html`, `produkt.html` a `galerie.html` nemají `<meta name="description">`. Google si pak text vytáhne náhodně.

---

## 🟡 UX a design (vylepšení)

**7. Formulář bez zpětné vazby.** I po napojení chybí stavy: úspěch, chyba, „odesílám…". Validace běží jen přes `required` (prohlížeč), bez vlastních hlášek.

**8. Kotvy vs. samostatné stránky.** Navigace na homepage míří na podstránky (`sluzby.html`), ale patička a menu jinde míří na kotvy (`index.html#sluzby`, `#reference`, `#faq`). Uživatel narazí na dvojí logiku. `_nav.html` (sdílená šablona) má navíc jiné položky než reálná menu — buď ji sladit, nebo smazat, ať nikoho nemate.

**9. Mobilní menu závisí čistě na JS.** Hamburger i menu se vytváří v `script.js`. Funguje, ale když se JS nenačte, na mobilu (≤960 px) zmizí veškerá navigace — desktopové odkazy jsou tam skryté přes `display:none`. Drobné riziko.

**10. `dashboard.html` je ve veřejné složce.** Vypadá jako interní/klientský panel. Pokud se web nasadí, nemá tam co dělat (nebo aspoň ne bez ochrany).

---

## 🟢 Kvalita kódu

Celkově čistý, čitelný kód se smysluplným pojmenováním (BEM), CSS proměnnými a rozumnou strukturou. Poznámky:

- **Hodně inline stylů** (dashboard 56×, ostatní stránky 2–16×). Fungují, ale ztěžují údržbu a konzistenci — postupně přesouvat do `styles.css`.
- **Duplicitní `<nav>` na každé stránce.** U statického webu bez buildu je to běžné, ale při každé změně menu musíš upravit 7 souborů. `_nav.html` naznačuje záměr sdílet — ale používá se? Zvážit jednoduchý include (SSI/build krok) nebo aspoň držet všechny navy identické.
- **Přístupnost:** placeholdery nemají alt text (zatím nejsou obrázky), FAQ toggle a compare slider by uvítaly `aria`/klávesovou obsluhu. `novalidate` na formuláři vypíná i nativní validaci — po napojení řešit vlastní.
- **Závislost na CDN GSAP** — pro tenhle rozsah animací možná zbytečně těžké, ale není to problém.

---

## Shrnutí priorit

1. Zprovoznit formulář (napojit odesílání + potvrzení) — **bez toho web nevydělává**
2. Opravit mrtvá `#` tlačítka (poptávka, vzorek, dokumenty)
3. Doplnit reálné fotky realizací a produktů
4. Sjednotit e-mail a čísla recenzí/realizací, opravit schema
5. Přidat `<h1>` na homepage + chybějící meta descriptions

Body 1, 2, 4 a 5 zvládnu opravit hned, pokud chceš. U formuláře jen potřebuju vědět, kam mají poptávky chodit (e-mail / která služba).
