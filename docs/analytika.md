# Analytika, GTM, Search Console a heatmapy

Stav k 3. 9. 2026: **identifikátory dorazily a web je napojený.**
GTM kontejner `GTM-KSXFM72X` se načítá ze Site settings → Custom Code → Head,
před ním běží Consent Mode v2 s výchozím „zamítnuto". Zbývá naimportovat do
kontejneru tagy — hotový soubor leží v `docs/gtm-arbosis-kontejner.json`.

| Co | Hodnota |
|---|---|
| GTM kontejner | `GTM-KSXFM72X` |
| GA4 měřicí ID | `G-788G7VTDM6` |

---

## Přístupy: co doopravdy potřebuju

**Do GTM ani do GA4 se přihlásit neumím a nepotřebuju.** Nemám Google účet,
kterému by šlo dát oprávnění, a přístup přes API tady k dispozici není.
Dělá se to obráceně — já připravím konfiguraci jako soubor, ty ji naimportuješ.

Takže od tebe potřebuju jen dvě věci, obojí je veřejný identifikátor, nic
citlivého: **GTM-KSXFM72X** a **G-788G7VTDM6**. Oboje už mám. Hotovo.

Co zůstává na klikání v prohlížeči (a dá se to celé za deset minut):

1. **Import tagů do GTM.** tagmanager.google.com → kontejner `arbosis.cz` →
   Admin → **Import Container** → nahraj `docs/gtm-arbosis-kontejner.json` →
   Workspace: *Existing → Default Workspace* → **Merge**, ne Overwrite →
   Confirm. Pak nahoře **Submit** a **Publish**.
   Import založí Google tag pro GA4 a pět tagů pro události z webu.
2. **Konverze v GA4.** analytics.google.com → Admin → Events → u události
   `contact_form_submit` přepnout **Mark as key event**.
   Ta se objeví až potom, co ji web poprvé pošle.
3. **Search Console** neřeš, ověřím ji přes DNS na Webglobe.

Když import spadne na chybu, pošli screenshot — soubor opravím. Nesestavuju
ho naslepo, ale formát GTM exportu se občas mění a nemám jak ho tady odzkoušet.

### Proč účty nezakládám já

Nabídka i zápis z callu to mají takhle schválené: *„na váš Google účet, ať
data i účty zůstanou vaše."* Důvod je praktický — účet založený pode mnou by
se při předání musel migrovat a u Search Console se historie dat nepřenáší
vůbec.

## Co je na webu už hotové

Bundle `src/modules/90-gtm.js` plní `window.dataLayer`. GTM si z něj bere
vlastní triggery. Bez GTM se jen plní pole a nic se neděje, takže se nic
nerozbije, dokud kontejner nedorazí.

| Událost | Kdy | Parametry |
|---|---|---|
| `menu_click` | klik v hlavní navigaci | `button_text` |
| `cta_click` | klik na tlačítko „Poptat zahradu" a spol. | `button_text`, `section` |
| `contact_click` | klik na e-mail nebo telefon | `method` (`email`/`phone`), `value` |
| `faq_open` | rozbalení otázky | `question` |
| `contact_form_submit` | **konverze** — úspěšně odeslaná poptávka | `form_id` |

Nové tlačítko se začne měřit tím, že ve Webflow dostane atribut
`data-gtm="cta"`. Do kódu se nesahá.

### „Aby se měřilo každé kliknutí"

Dá se to, ale nedoporučuju. GA4 má strop 500 různých názvů událostí na
property a report, ve kterém je všechno, neodpovídá na nic. Užitečná otázka
zní „kolik lidí došlo k formuláři a odkud přišli", ne „kolikrát kdo klikl na
patičku".

Nad rámec událostí výš měří GA4 samo (Enhanced measurement): zobrazení
stránky, scroll do 90 %, odchozí odkazy, stažení souborů, vyhledávání na webu.
To stačí. Když bude po pár týdnech vidět, že něco chybí, doplní se cíleně.

## Co je napojené a co zbývá

**Hotovo v Site settings → Custom Code → Head** (v tomhle pořadí, na pořadí
záleží):

1. `Consent Mode v2` — výchozí stav všech kategorií je `denied`,
   `wait_for_update: 500`. Musí běžet **před** GTM, jinak by se stihlo
   odeslat měření dřív, než se návštěvník k souhlasu dostane.
2. GTM loader s `GTM-KSXFM72X`.
3. Bundle z jsDelivr.

**Přímý gtag.js s `G-788G7VTDM6` jsem z hlavičky odstranil.** Byl tam
z dřívějška a vedle GTM by měřil každou návštěvu dvakrát. GA4 teď posílá
jedině kontejner.

`noscript` iframe od GTM tam **záměrně není**. Gate na souhlas je postavený
na JavaScriptu; návštěvník bez JS by přes iframe načetl kontejner mimo něj.
GA4 se bez JS stejně nezměří, takže se tím o nic nepřichází.

**Zbývá:**

- import `docs/gtm-arbosis-kontejner.json` do GTM (viz Přístupy výš),
- v GA4 označit `contact_form_submit` jako klíčovou událost,
- **Search Console** — ověření přes DNS TXT záznam na Webglobe (mám přístup).
  Ověřuju **doménovou property** `arbosis.cz`; pokrývá www i bez www, http
  i https, na rozdíl od ověření přes HTML tag. Pak sitemapa, kterou Webflow
  generuje sám na `https://arbosis.cz/sitemap.xml`.
- **Propojení** GA4 → Admin → Product links → Search Console. Bez toho není
  v GA4 vidět, na jaké dotazy web lidi našli.

Webflow má i nativní pole pro Google Tag (Site settings → Integrations).
**Nepoužívat souběžně s GTM** — zase dvojí měření. Jdeme přes GTM.

## Cookie lišta — bez ní se měřit nesmí

Od 1. 1. 2022 platí v Česku **opt-in**: ukládat cookies a číst z zařízení jde
až po prokazatelném aktivním souhlasu (§ 89 odst. 3 zákona č. 127/2005 Sb.,
o elektronických komunikacích). Předzaškrtnuté políčko ani „pokračováním
souhlasíte" neplatí. Do souhlasu tedy GA4 ani Clarity běžet nesmí.

Řešení, které na Webflow funguje a nic nestojí:

- **Finsweet Cookie Consent** v režimu `opt-in` — lišta, kategorie,
  zapamatování volby.
- **Google Consent Mode v2** v GTM — tagy čekají na souhlas a po jeho
  udělení se dopočítá modelovaný provoz.

Stránka `/ochrana-osobnich-udaju` už existuje (zatím jako draft) a text
na ní je napsaný — správce, údaje z formuláře, lhůty, zpracovatelé, cookies,
práva, ÚOOÚ. **Není to právní posudek.** Texty ani právní posouzení nejsou
součástí nabídky (bod 6), takže než se web spustí, měl by přes to přejet
Šimonův právník. Dvě věci se navíc musí potvrdit, ne odhadnout:

- **3 roky** u poptávek, ze kterých nevznikla zakázka — je to obhajitelná
  lhůta odvozená od promlčecí doby, ne fakt z firmy.
- Zda poptávky nekončí ještě někde jinde než v Google Workspace (CRM,
  sdílený disk, tabulka). Každé takové místo patří do seznamu zpracovatelů.

## Heatmapy

GA4 heatmapy **neumí** a nikdy neumělo. Potřebuje se druhý nástroj:

| Nástroj | Cena | Poznámka |
|---|---|---|
| **Microsoft Clarity** | zdarma, bez limitu relací | doporučuju — heatmapy, nahrávky relací, rage clicks, propojí se s GA4 |
| Hotjar | free tier omezený počtem relací | pro jednostránku zbytečné platit |

Clarity se nasazuje jako tag v GTM, takže se stejně jako GA4 řídí souhlasem
z cookie lišty. Na jednostránce s pár stovkami návštěv měsíčně dá heatmapa
odpověď na jedinou užitečnou otázku: **kam lidé doscrollují a kde přestanou**.
To se hodí hlavně u sekce Postup a formuláře.

## Co zatím nedělat

- **Neposílat do GA4 obsah formuláře.** Jméno, adresa a e-mail jsou osobní
  údaje, do analytiky nepatří. Měří se jen fakt odeslání.
- **Nespouštět měření před cookie lištou.** Sbírala by se data bez souhlasu.
- **Nezapínat Webflow Analyze souběžně s GA4**, pokud pro to nebude důvod —
  jsou to dvě čísla o tomtéž a nikdy nesedí.
