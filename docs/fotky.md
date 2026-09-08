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
stohovaných koleček zůstalo jedno. Fotka je mobilní portrét proti
béžové zdi, ale v kolečku 52 px to nevadí a zelené polo s logem tomu
pomáhá.

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

## Co zůstalo na Designer

Prvek Image ve Webflow nepřijímá vlastní atributy (viz `CLAUDE.md`),
takže dva alt texty zapsané na prvku přes API přepsat nejdou:

- Reference → pořád „Zahrada ve svahu – fotografii doplníme",
  má být „Zahrada ve svahu, kterou jsme zpevnili a osázeli"
- Avatar → pořád „Tým Arbosis", má být „Šimon Havlata, Arbosis"

Na assetech je správný alt už nastavený, jde jen o přepis na prvku.
