# Fotky na webu

Kdo je na kterém místě, odkud fotka je a co se s ní dělalo. Zdroj je
sdílená složka na Google Disku, kterou Šimon 7. 9. 2026 přejmenoval
podle služeb.

## Mapa slotů

Rozměry slotů jsou změřené v prohlížeči, ne odhadnuté. Všechny mají
`object-fit: cover`, takže jeden soubor musí přežít oba ořezy.

| Místo | Desktop | Mobil | Fotka | Původ |
|---|---|---|---|---|
| Hero | 1440×1008 (1,43) | 390×812 (**0,48**) | `hero-zahrada-trvalky` | stock, upravený (viz níž) |
| Pro firmy | 1440×660 (**2,18**) | 390×560 (0,70) | `b2b-realizace-siroka` | Šimon „B2B 1", roztažený |
| Reference | 476×357 (1,33) | 351×263 (1,33) | `reference-zahrada-lantovi` | Šimon „Zahrada Lantovi 3" |
| Avatar | 52×52 | 44×44 | `tym-simon-havlata` | Šimon „Fotografie ŠH" |
| Služby (panel) | 433×289 (1,50) | 343×354 (0,97) | 7 × `sluzba-*` | 4 od Šimona, 3 AI |

Hero má nejtvrdší zadání: od portrétu 0,48 po šířku 1,43. Proto je
zdroj 2560 px široký — na mobilu se z něj bere jen úzký pruh uprostřed.

## Služby

| # | Služba | Fotka | Původ |
|---|---|---|---|
| 01 | Návrhy a projektová dokumentace | `sluzba-navrhy` | Šimon |
| 02 | Realizace zahrad na klíč | `sluzba-realizace` | Šimon |
| 03 | Pokládka travního koberce | `sluzba-travnik` | Šimon |
| 04 | Zavlažovací systémy | `sluzba-zavlazovani` | Šimon |
| 05 | Profesionální řez stromů | `sluzba-rez-stromu` | **AI** |
| 06 | Rizikové kácení | `sluzba-rizikove-kaceni` | **AI** |
| 07 | Údržba a sezónní péče | `sluzba-udrzba` | **AI** |

Šimon pojmenoval čtyři fotky, zbylé tři služby zbyly na AI — přesně ty
„cca tři kategorie" z nabídky.

**AI fotky jsou v Službách, ne v Referencích.** Je v tom rozdíl, na
kterém stojí celá strategie webu: sekce Služby ilustruje, co firma
umí, kdežto Reference a Realizace dokazují, co firma udělala. Vymyšlená
fotka v důkazní sekci by web poškodila. V ilustrační sekci je to
běžná praxe. Na fotkách proto není vidět obličej ani žádné logo —
nikdo si je nespojí s konkrétním člověkem z Arbosis.

## Co se s fotkami dělalo

**Hero.** Šimonovi vadilo, že „na počítačové verzi je vidět, jak
zahradník něco sází, což mi nedává úplně smysl", a ptal se, jestli tam
místo toho můžou být trvalky. Holý záhon se sázejícím zahradníkem je
tedy přemalovaný na hotový trvalkový záhon (okrasné traviny, echinacea,
rudbekie, šalvěj). Zbytek kompozice — cesty, pruhy v trávníku, sekačka
vlevo, kolečko vpravo — zůstal.

**Pro firmy.** Slot je 2,18 široký, Šimonova fotka 1,33. Ověřoval jsem
obojí: čistý ořez i roztažení. **Ořez funguje, ale ubere celou oblohu
a z kompozice zbude pruh.** Roztažení nechá původní snímek celý a
dokreslí jen boky — plot vlevo, dům a zahradu vpravo. Proto roztažení.
Původní pixely zůstaly nedotčené, přibyly jen strany.

**Reference.** „Zahrada Lantovi 3" je nativně 4:3, takže stačil ořez
a jemné doladění. Sedí ke citaci o svahu doslova — na fotce je ten
zpevněný svah s protierozní rohoží.

**Tým.** Šimon napsal, že kluci na web nechtějí a bude tam sám. Ze tří
stohovaných koleček zůstalo jedno — a pak celý blok skrytý. Jeden avatar
sám nepodporoval narativ firmy s 35 lety za sebou. `.kontakt_team` má
`display: none`, prvek zůstal, takže se tým dá kdykoliv vrátit.

## Město a rok u fotky

Kolekce **Fotografie** má pole `Město` (text) a `Rok` (číslo). Náhled u služby
je skládá do popisku `ÚVALY · 2024` u spodní hrany.

**Hodnoty jsou zatím zástupné.** Šimon je před spuštěním přepíše.

| Služba | Město | Rok |
|---|---|---|
| Návrhy a projektová dokumentace | Úvaly | 2024 |
| Realizace zahrad na klíč | Říčany | 2023 |
| Pokládka travního koberce | Čelákovice | 2025 |
| Zavlažovací systémy | Brandýs nad Labem | 2024 |
| Profesionální řez stromů | Mnichovice | 2023 |
| Rizikové kácení | Kostelec nad Černými lesy | 2024 |
| Údržba a sezónní péče | Xaverov | 2025 |

### Pozor u tří dogenerovaných fotek

Město a rok mění ilustraci v **tvrzení o konkrétní zakázce**. U čtyř fotek
od Šimona je to v pořádku — jsou to skutečné realizace, jen je potřeba
doplnit skutečné údaje. U tří dogenerovaných (řez stromů, rizikové kácení,
údržba) žádná zakázka za fotkou nestojí, takže je není čím vyplnit pravdivě.

Pole se dají nechat prázdná — modul si s tím poradí a popisek u těch tří
prostě nebude. Rozhodnutí je na Šimonovi.

## Střídání fotek je vypnuté

Přepínač **Střídat fotky** je v CMS u všech sedmi položek vypnutý,
protože každá služba má zatím jednu fotku a střídat není co. Jakmile
Šimon pošle druhou fotku k některé službě, stačí ji v CMS přidat
a přepínač zapnout. Do kódu se nesahá.

## Nepoužité, ale připravené

- `b2b-svah-siroka-rezerva` — druhá B2B fotka (dům ve svahu
  s protierozní rohoží), roztažená stejně jako ta první. Náhradník,
  kdyby se Šimonovi ta první nelíbila.
- Zahrada Lantovi 1, 2 a 4. Jednička je staveniště, ne hotová zahrada.
  Dvojka a čtyřka jsou na výšku — dobré, ale žádný slot na webu je
  v tomhle poměru nepotřebuje.

## Náhled u služeb se předehřívá

Skrytý feed je `1 × 1 px`, `opacity: 0` a odsunutý na `left: -9999px`.
Prohlížeč obrázky v takovém kontejneru odkládá — adresu z něj modul přečte
hned, ale bitmapa se stahovala až při přiřazení viditelnému panelu, což
bylo na prvním najetí vidět jako bliknutí prázdného panelu.

Modul je proto sériově stáhne do cache, a to až v nečinné chvíli, aby to
nesoupeřilo s vykreslením stránky. Viz `warmPhotos()`
v `src/modules/30-sluzby.js`.

**Spouští to první pohyb návštěvníka, ne vzdálenost sekce.** Původně se
čekalo, až bude sekce Služby 1 200 px od okna. Měření na publikované stránce
ukázalo, že Služby začínají 117 px (1920 × 1080) až 296 px (1440 × 900) pod
spodní hranou okna — jakákoliv rezerva, která dá scrollujícímu návštěvníkovi
předstih, proto zabírá i první obrazovku a předehřívání se spustilo hned po
načtení. Dnes to spustí dřívější ze dvou věcí: první scroll, nebo sekce
v zorném poli (kvůli příchodu na odkaz `#sluzby`, kde se nescrolluje).

Co to udělalo se stahováním při načtení stránky:

| Okno | Před | Po |
|---|---|---|
| 1440 × 900 | 3 242 kB | 1 113 kB |
| 1920 × 1080 | 3 242 kB | 1 113 kB |
| 390 × 844 | 5 121 kB | 2 992 kB |

Náhled je po najetí pořád načtený okamžitě, i při příchodu přímo na
`#sluzby`.

**Na mobilu zbývá 1,9 MB navíc a je to tak správně.** Na malých oknech má
`.sluzby_media` `display: block` (fotka se otevírá scrollem, ne najetím),
takže Webflow stahuje fotku každého řádku. Návštěvník, který seznam
proscrolluje, všech sedm opravdu uvidí — není to tedy stahování naprázdno.

Panel má `clamp(420px, 42vw, 680px)`, tedy na běžném notebooku zhruba
600 px místo původních 433.

## Co zůstalo na Designer

### 1. Navázat Město a Rok na CMS

Ve skrytém feedu u služeb je blok `.sluzby_feed-meta` a v něm dva prázdné
divy. Do každého patří jedno CMS pole:

| Div (v Navigatoru pod `.sluzby_feed-meta`) | Co do něj přetáhnout |
|---|---|
| první, má atribut `data-scity` | pole **Město** |
| druhý, má atribut `data-syear` | pole **Rok** |

Postup u obou stejný: klikni na ten div, v panelu vpravo otevři nastavení
textu a zvol **Get text from → Město** (resp. **Rok**). Nepřidávej dovnitř
nový prvek, text patří přímo do toho divu.

Dokud to není navázané, stojí v obou divech zástupný text „Město" a „Rok".
**Na webu to nic nerozbije** — modul zástupný text pozná a popisek nechá
prázdný. Po navázání naskočí sám, do kódu se nesahá.

### 2. Dva alt texty

Prvek Image ve Webflow nepřijímá vlastní atributy (viz `CLAUDE.md`),
takže dva alt texty zapsané na prvku přes API přepsat nejdou:

- Reference → pořád „Zahrada ve svahu – fotografii doplníme",
  má být „Zahrada ve svahu, kterou jsme zpevnili a osázeli"
- Avatar → pořád „Tým Arbosis", má být „Šimon Havlata, Arbosis"

Na assetech je správný alt už nastavený, jde jen o přepis na prvku.
