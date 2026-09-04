# Potvrzení zákazníkovi a ochrana proti spamu

## Potvrzovací e-mail

### Co Webflow neumí

Nativní notifikace umí poslat zprávu **jenom nám**. Zákazníkovi, který
formulář vyplnil, se z Webflow odpovědět nedá — a nedá se to obejít
nastavením, je to hranice produktu. Cokoliv, co má odejít na adresu
z formuláře, potřebuje službu vedle.

### Doporučená sestava

```
Webflow formulář
      │  webhook form_submission
      ▼
Make.com  (jeden scénář)
      ├─► Resend: poptávka pro Šimona     → info@arbosis.cz
      └─► Resend: potvrzení pro zákazníka → adresa z formuláře
```

Proč takhle:

- **Resend je zadarmo v rozsahu, který Arbosis nikdy nevyčerpá.** Free
  plán je 3 000 zpráv měsíčně a 100 denně na jedné doméně. Poptávek
  chodí jednotky týdně.
- **Make je už ve stacku** a free plán dává 1 000 operací měsíčně. Jedna
  poptávka spotřebuje tři.
- **Získáme zpátky kontrolu nad vzhledem obou e-mailů.** Skončí omezení
  `{{formData}}` — v Resendu se skládá HTML pole po poli, takže
  hierarchie „šedý popisek, pod ním hodnota" je otázka dvou řádků CSS.
- **Notifikace pro Šimona se přesune tam taky.** Dva systémy na jednu věc
  jsou zbytečné a Webflow verze je ta slabší.

### Účet a přístupy

Šimonův vlastní účet dává smysl — je to jeho doména a jeho zprávy.
Pozvánka do účtu ale možná bude až na placeném plánu; **není to problém,
protože pro Make je potřeba jenom API klíč, ne přístup do rozhraní.**
Šimon klíč vygeneruje a pošle, dál se do Resendu nemusí přihlašovat.

### DNS

Resend chce doménu ověřit. Přidají se tři záznamy u Webglobe:

| Typ | Co to dělá |
|---|---|
| `TXT` na `resend._domainkey` | DKIM podpis Resendu |
| `MX` + `TXT` na `send` | návratová adresa (subdoména, ne kořen) |
| `TXT` na `_dmarc` | jen pokud tam ještě není |

Google Workspace tím **nijak netrpí**: Resend si bere vlastní selektor
i vlastní subdoménu, takže se s `google._domainkey` ani s kořenovým SPF
nepotká. Odesílatel může zůstat `Arbosis <info@arbosis.cz>`.

### Co je potřeba, aby se to dalo postavit

1. API klíč z Resendu (zakládá Šimon).
2. Přístup k DNS `arbosis.cz` — má Lukáš, stačí pokyn.
3. Text obou e-mailů — hotový, odsouhlasený 4. 9. 2026. Náhled je
   v `docs/emaily/nahled.html`, stačí otevřít v prohlížeči.

### Lhůta odpovědi

**48 hodin.** Stejné číslo, jaké slibuje web — jinak by si zákazník
přečetl dva různé sliby na dvou místech.

### Nadpisy

| E-mail | Nadřazený řádek | Nadpis |
|---|---|---|
| Šimonovi | Nová poptávka | Někdo právě vyplnil formulář na webu Arbosis. |
| Zákazníkovi | Děkujeme | Vaši zprávu jsme dostali a už se jí věnujeme. |

## reCAPTCHA

### Co na webu je teď

Dvě tichá síta, obě bez jediného kliknutí navíc (`src/modules/85-antispam.js`):

1. **Past.** Skryté pole `Website`, které člověk nevidí. Robot, který
   vyplňuje všechno, do něj napíše a odeslání se zastaví.
2. **Čas.** Odeslání dřív než tři vteřiny po načtení stránky neprojde.
   Sedm polí včetně adresy člověk pod tři vteřiny nevyplní.

### Doporučení: zatím nepřidávat

- **Webflow nativně nabízí jen v2 se zaškrtávacím políčkem.** To je
  klikání navíc a občas hledání semaforů na fotkách. U poptávky zahrady
  je to nejjistější způsob, jak přijít o zákazníka, který už byl
  rozhodnutý napsat.
- **Tichá varianta jde, ale je to obcházení.** Invisible v2 se dělá tak,
  že se prvku reCAPTCHA dá atribut `data-size="invisible"`. Funguje to,
  ale je to mimo podporovanou cestu Webflow.
- **Google tím do stránky přidá cookies.** Znamená to řádek navíc
  v cookie liště a v zásadách ochrany osobních údajů, plus odznak
  v rohu obrazovky na webu, který má být vzdušný.
- **Zatím není co řešit.** Spam se počítá — každé zachycené odeslání
  posílá do GTM událost `form_blocked`. Až v ní něco bude, bude i důvod.

### Kdyby se přidávala

Potřeba by bylo tohle:

1. V účtu Google (Šimonově) založit reCAPTCHA v2 → **Invisible badge**
   pro doménu `arbosis.cz`.
2. Poslat **site key** a **secret key**.
3. Klíče se vloží v Site settings → Apps & Integrations. **Pozor:**
   jakmile se reCAPTCHA v nastavení zapne, ověřování se stane povinným
   pro všechny formuláře na webu — dokud není prvek ve formuláři
   a nastavení hotové, formulář neodešle nic.
4. Prvek reCAPTCHA se do formuláře přetáhne v Designeru, přes API to
   nejde. Atribut `data-size="invisible"` už doplním sám.
5. Doplnit řádek do cookie lišty a do zásad ochrany osobních údajů.
