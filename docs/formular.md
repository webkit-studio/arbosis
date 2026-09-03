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

Zbývá jediná věc, kterou API nenastaví:

**Cílový e-mail notifikace** — Site settings → Forms → Form notification
email → **info@arbosis.cz**. Bez toho chodí poptávky na e-mail majitele účtu
Webflow. Dokud to nesedí, formulář **neodesílat do světa**. Test: odeslat
poptávku a zkontrolovat, že přišla na info@arbosis.cz.

Volitelně ještě text tlačítka během odesílání (Designer → tlačítko → Settings
→ Waiting text). Dnes je tam anglické „Please wait…" — ukáže se na zlomek
vteřiny mezi kliknutím a potvrzením. V markupu se přepsat nedá, Webflow si
tohle pole drží sám.

## Čeho si všimnout při úpravách

Prvky formuláře mají ve Webflow vlastní model nastavení a **část z něj přes
API zapsat nejde**:

| Vlastnost | Přes API | Jak to obejít |
|---|---|---|
| `placeholder` | ne (atribut se odmítne) | zapsat rovnou do markupu při vkládání přes WHTML; prázdná hodnota `placeholder=""` projde a pole zůstane čisté |
| popisek tlačítka (`value`) | ne | totéž — `<input type="submit" value="…">` v markupu |
| `data-wait` | ne | jen v Designeru |
| `for` u popisku | ano (`set_attributes`) | bez něj Webflow vyrenderuje `for=""` a klik na popisek nefunguje |

Když se pole doplňuje, vkládej ho přes WHTML s kompletním markupem. Založit
prázdné pole a dosypat vlastnosti atributy nefunguje.

## Měření

Konverze `contact_form_submit` se odpaluje až na úspěšném odeslání — modul
`src/modules/90-gtm.js` hlídá, kdy Webflow odkryje `.w-form-done`.
Na `submit` se záměrně neváže: odeslání může selhat a konverze by se
počítala i tak.
