# Analytika, GTM, Search Console a heatmapy

Shrnutí pro netrpělivé: **účty musí založit Šimon pod svým Google účtem**,
já je založit nemůžu a ani nechci. Jakmile pošle tři identifikátory a přístup
pro `lukas@webkit.studio`, zbytek je otázka jednoho zápisu do custom kódu —
měřicí kód na webu už je hotový a čeká.

---

## Proč účty nezakládám já

Nabídka i zápis z callu to mají takhle schválené: *„na váš Google účet, ať
data i účty zůstanou vaše, potřebuji jen dát přístup na lukas@webkit.studio."*
Důvod je praktický, ne formální — účet založený pode mnou by se při předání
musel migrovat, a u Search Console se historie dat nepřenáší vůbec.

Technicky navíc: Google nemá API na zakládání GA4 property ani GTM
kontejneru „z ničeho" — vždycky se to váže na přihlášený Google účet.

## Co potřebuju od Šimona

| # | Co | Kde to vzniká | Jak to vypadá |
|---|---|---|---|
| 1 | **GTM kontejner** | tagmanager.google.com → nový účet „Arbosis Plants" → kontejner `arbosis.cz`, typ Web | `GTM-XXXXXXX` |
| 2 | **GA4 property** | analytics.google.com → Admin → Create property → datový stream Web pro `arbosis.cz` | `G-XXXXXXXXXX` |
| 3 | **Přístup** | v obou nástrojích Admin → Access management → přidat `lukas@webkit.studio` | GTM: Publish · GA4: Editor |

Search Console **nepotřebuje nic od Šimona** — ověřím ji přes DNS záznam na
Webglobe, kam mám přístup (viz níž).

Google Business Profile je samostatná věc, ověření trvá až 14 dnů. Čím dřív
se rozjede, tím líp — pro zahradnickou firmu na doporučení dělá mapa
a recenze víc než web samotný.

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

## Postup napojení, až identifikátory dorazí

1. **GTM loader do webu.** Do Site settings → Custom Code → Head přibude blok
   níž. Píše se přes API a **vždy se posílá celý obsah pole**, ne jen nový
   blok — jinak zmizí to, co tam už je.

   ```html
   <!-- Google Tag Manager -->
   <script>
     (function (w, d, s, l, i) {
       w[l] = w[l] || [];
       w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
       var f = d.getElementsByTagName(s)[0],
         j = d.createElement(s),
         dl = l != 'dataLayer' ? '&l=' + l : '';
       j.async = true;
       j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
       f.parentNode.insertBefore(j, f);
     })(window, document, 'script', 'dataLayer', 'GTM-XXXXXXX');
   </script>
   <!-- End Google Tag Manager -->
   ```

   Webflow má i nativní pole pro Google Tag (Site settings → Integrations).
   **Nepoužívat souběžně s GTM** — GA4 by se načetlo dvakrát a všechno
   se počítalo dvojmo. Buď nativní pole, nebo GTM. Jdeme přes GTM.

2. **GA4 v GTM.** Tag „Google Tag" s měřicím ID `G-XXXXXXXXXX`, trigger
   All Pages. Pak pět tagů GA4 Event navázaných na Custom Event triggery
   podle tabulky výš.

3. **Konverze.** V GA4 → Admin → Events označit `contact_form_submit` jako
   klíčovou událost. To je jediné číslo, které v tomhle projektu opravdu
   rozhoduje.

4. **Search Console.** Ověření přes DNS TXT záznam na Webglobe (mám přístup).
   Ověřuju **doménovou property** `arbosis.cz` — pokrývá www i bez www,
   http i https, na rozdíl od ověření přes HTML tag. Pak přidat sitemapu:
   Webflow ji generuje sám na `https://arbosis.cz/sitemap.xml`.

5. **Propojení.** GA4 → Admin → Product links → Search Console. Bez toho se
   v GA4 nezobrazí, na jaké dotazy web lidi našli.

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

Pozor na rozsah: **texty a právní posouzení nejsou součástí nabídky**
(bod 6 cenové nabídky). Lišta a technické napojení ano, obsah zásad
zpracování osobních údajů dodá Šimon nebo jeho právník. Odkaz na stránku
`/ochrana-osobnich-udaju` je v patičce už teď a míří na stránku, která
zatím neexistuje — musí vzniknout před spuštěním.

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
