# Kontaktní formulář

Formulář je nativní Webflow form, ne custom kód. Odeslání, validaci, stav
„odesláno" i chybovou hlášku obsluhuje Webflow sám.

## Pole

| Pole | Název (chodí do e-mailu) | Typ | Povinné |
|---|---|---|---|
| Jméno a příjmení | `Jméno a příjmení` | text | ano |
| E-mail | `E-mail` | email | ano |
| Telefon | `Telefon` | tel | ne |
| Ulice a číslo popisné | `Ulice a číslo popisné` | text | ano |
| Město | `Město` | text | ano |
| PSČ | `PSČ` | text, `inputmode="numeric"` | ano |
| S čím vám pomůžeme | `S čím vám pomůžeme` | textarea | ano |

Adresa je záměr z callu 30. 7. — Šimon si zahradu předem najde na mapách
a odhadne rozsah.

## Co se musí doklikat ručně

API tyhle dvě věci nenastaví, jsou v Designeru a v nastavení webu:

1. **Název formuláře** — dnes „Html Form", má být **„Poptávka"**.
   Designer → vybrat Form Block → panel Settings → Name.
   Název jde do předmětu notifikačního e-mailu.
2. **Cílový e-mail notifikace** — Site settings → Forms → Form notification
   email → **info@arbosis.cz**. Bez toho chodí poptávky na e-mail majitele
   účtu Webflow.

Dokud obojí nesedí, formulář **neodesílat do světa**. Test: odeslat poptávku
a zkontrolovat, že přišla na info@arbosis.cz a má rozumný předmět.

## Měření

Konverze `contact_form_submit` se odpaluje až na úspěšném odeslání — modul
`src/modules/90-gtm.js` hlídá, kdy Webflow odkryje `.w-form-done`.
Na `submit` se záměrně neváže: odeslání může selhat a konverze by se
počítala i tak.
