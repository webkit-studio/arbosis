# Arbosis — pokyny pro práci na tomhle projektu

## Nejdůležitější pravidlo: nejdřív Webflow, teprve pak kód

Web se spravuje ve Webflow (site ID `6a6b7231752a8f185fa37625`, domovská
stránka `6a6b7234752a8f185fa3767c`). Tenhle repozitář je doplněk, ne náhrada.

**Než cokoliv napíšeš do `src/arbosis.css` nebo `src/modules/`, ověř, jestli
to nejde nastavit přímo ve Webflow.** Neptej se sám sebe „umím to napsat
v CSS" — ptej se „umí to Webflow". Ověřuj to nástrojem, ne odhadem.

| Nástroj | Co umí |
|---|---|
| `data_style_tool` | číst i **zapisovat** styly na třídách, včetně `hover`, `focus`, `active`, po breakpointech a na kombo třídách |
| `data_variable_tool` | číst i zakládat proměnné (barvy, velikosti, fonty) |
| `data_whtml_builder` | vložit celou sekci z HTML + CSS; mapuje se na nativní prvky Webflow |
| `data_element_tool` | číst i měnit strukturu, texty, odkazy, atributy |
| `data_pages_tool` | nastavení stránek, SEO, JSON-LD |
| `data_sites_tool` | detail webu a **publikace** |

### Co patří do Webflow

Vzhled. Barvy, rozměry, odsazení, zaoblení, přechody, hover a active stavy
jednoho prvku, breakpointy. Když to jde nastavit na třídě v Designeru, patří
to do Designeru — i kdyby to v CSS byl jeden řádek.

Override v custom kódu je horší ze dvou důvodů: pere se s tím, co je
nastavené na třídě, a kdo pak na tu třídu ve Webflow sáhne, nevidí důvod,
proč se prvek chová jinak, než jak ho nastavil.

### Co patří do repozitáře

- **Chování závislé na JS** — nájezd hera, počítadla, náhled fotek u služeb,
  dojezd linky v Postupu, accordion FAQ, měření do GTM.
- **Selektory, které Webflow ve style panelu neumí zapsat** — vztahy
  rodič→potomek (`.sluzby_row:hover .sluzby_number`), stav `[open]`
  u `<details>`, `::-webkit-details-marker`, `@keyframes`,
  `@media (prefers-reduced-motion)`, `scroll-margin-top`.
- **Failsafe** — když má něco fungovat i při výpadku JS.

Když do custom kódu něco přidáváš, napiš do komentáře **proč to nešlo ve
Webflow**. Pokud to zdůvodnit nedokážeš, patří to do Webflow.

### Čeho se API nedotkne

- **Interakce (IX2)** API neumí číst ani zapisovat. Vstupní a hover animace
  navázané na jiný prvek se musí naklikat v Designeru. Neobcházej to custom
  kódem bez domluvy — kdyby to někdo přidal i ve Webflow, obojí by se pralo.
- **Nastavení formuláře** (název formuláře, cílový e-mail notifikace)
  je v Site settings → Forms a přes API se nemění. Viz `docs/formular.md`.

## Hook atributy — nestylovat, nemazat

Moduly cílí na **data-atributy**, ne na názvy tříd. Třídu ve Webflow kdokoliv
přejmenuje bez varování, data-atribut ne — je vidět v panelu nastavení prvku
a nikdo ho omylem nepřepíše stylováním.

Kompletní mapa je v `src/modules/00-core.js` v objektu `SEL`. Nejdůležitější:

| Atribut | K čemu |
|---|---|
| `data-nav`, `data-ncta`, `data-nl` | lišta, její CTA, položky menu (zvýraznění aktivní sekce) |
| `data-hero`, `data-hwi`, `data-hsub`, `data-hveil`, `data-plx` | nájezd hera a paralax fotky |
| `data-count`, `data-suffix` | počítadlo (cílová hodnota a přípona, např. `+`) |
| `data-slist`, `data-srow`, `data-smedia`, `data-spanel`, `data-spimg` | náhled fotky u služeb |
| `data-psec`, `data-pline`, `data-pline2`, `data-pstep` | dojíždějící linka v Postupu |
| `data-rv` | nájezd sekce; hodnota je prodleva v ms |
| `data-glow`, `data-fwrap`, `data-ring`, `data-ring-b` | světlo a prstenec v sekci Kontakt |
| **`data-gtm`** | měření: `cta`, `email`, `phone` — viz `src/modules/90-gtm.js` |

Nové tlačítko se měří tím, že dostane `data-gtm="cta"`. Do kódu se nesahá.

### Prvek Image vlastní atributy zahazuje

**Na `<img>` hook nikdy nedávej.** Ověřeno na publikované stránce: atributy
`data-plx` a `data-spimg` zapsané přes `data_whtml_builder` na obrázek
v markupu nebyly, zatímco stejné atributy na obalových divech zůstaly.
Prvek Image má ve Webflow vlastní model nastavení (zdroj, alt) a cokoliv
navíc při ukládání odpadne.

Hook proto patří na obal a obrázek se uvnitř najde strukturálně —
`$1('img', obal)`. V náhledu služeb i v heru je jediný obrázek, takže je
výběr jednoznačný a nezávisí ani na třídě, ani na atributu.

### Střídání fotek u služeb („podhoubí")

Dnes drží každý řádek služeb jednu fotku — bere se z prvku `.sluzby_photo`
uvnitř řádku, takže se ve Webflow vyměňuje jako každý jiný obrázek.

Když řádek dostane atribut `data-photos` se seznamem dalších adres oddělených
čárkou, náhled je začne střídat po 500 ms. Zapíná se tedy obsahem, ne
zásahem do kódu. Bez atributu se žádný interval nespouští.

## Nasazení

Bundle se servíruje z jsDelivr, připnutý na konkrétní commit:

```
https://cdn.jsdelivr.net/gh/webkit-studio/arbosis@<commit>/dist/arbosis.min.css
https://cdn.jsdelivr.net/gh/webkit-studio/arbosis@<commit>/dist/arbosis.min.js
```

CSS je v **Site settings → Custom Code → Head**, JS ve **Footer**.
`.min.` soubory v repu nejsou — jsDelivr minifikuje sám.

Změna v repu se na web nedostane, dokud se v Custom Code nepřepne připnutý
commit. Po publikaci vždy ověř, co se doopravdy načítá — stáhni si živou
stránku a najdi v ní ten commit.

**Proč se pinuje commit a ne větev.** jsDelivr posílá na `@main` i na
`@<commit>` stejné hlavičky: `s-maxage=43200` (12 h na CDN) a `max-age=604800`
(**7 dní v prohlížeči návštěvníka**). U větve se URL nemění, takže by
vracející se návštěvník měl týden starý bundle a nešlo by s tím nic dělat.
U commitu se URL změní a stáhne se hned. Nenavrhuj přechod na `@main` ani na
plovoucí tag.

### Head a footer číst, ne psát z hlavy

Vždycky nejdřív `data_scripts_tool > get_site_freeform_code`, v načteném textu
vyměň **jen hash** a pošli zpátky **celý obsah pole**. Nikdy neskládej obsah
z paměti — takhle se na jiném projektu smazal z produkce GTM loader.

### Publikace pouští ven i cizí rozdělanou práci

Webflow publikuje **celý web**, ne jen tvoje změny. Před publikací si vytáhni
`data_sites_tool > get_site`: když je `lastUpdated` výrazně novější než
`lastPublished`, má někdo něco rozdělaného. Pak se zeptej, nepublikuj naslepo.
**„Kdy publikovat" je rozhodnutí Lukáše**, ne tvoje.

## Obsah a texty

- **Čeština.** En dash „–" (U+2013), nikdy em dash. „e-mail" se spojovníkem.
- **Claim se nepřepisuje:** Zahrady. Návrh. Realizace. Údržba.
- **Nevymýšlet fakta.** Co není v Notionu, v nabídce nebo v transkriptu, je
  otevřená otázka — zeptat se, ne dopsat. Platí hlavně pro čísla a lhůty.
- **Bez cen na webu.** Vše individuálně.
- **Fotky:** dokud nedorazí reálné, šedé placeholdery se správným poměrem
  stran a popiskem, co tam bude.

## Ověřování před nasazením

```sh
npm run check
```

Smoke test běží na jsdom proti zkrácené kopii skutečné stránky a hlídá obě
větve — s animacemi i s vypnutými (`prefers-reduced-motion`). Když měníš hook
atribut, uprav i kostru v `test/smoke.js`, jinak test přestane cokoliv chytat.

Po publikaci zkontroluj živou stránku: načtený commit v custom kódu, dataLayer
v konzoli (`window.dataLayer`) a odeslání formuláře.
