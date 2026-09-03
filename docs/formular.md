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

## Nastavení notifikačního e-mailu

Site settings → Forms. Tři pole, hodnoty k překopírování:

### Form notification email

```
info@arbosis.cz
```

Bez toho chodí poptávky na e-mail majitele účtu Webflow. Dokud to nesedí,
formulář **neodesílat do světa**. Test: odeslat poptávku a zkontrolovat,
že přišla na info@arbosis.cz.

Webflow u tohohle pole varuje, že adresy typu `info@` bývají blokované
doručovacími systémy. U Google Workspace, kde `info@arbosis.cz` běží, to
problém není — jde o vlastní doménu s nastaveným SPF a DKIM, ne o veřejnou
freemailovou schránku.

### Subject line

Použitelné proměnné jsou tady jenom **`siteName`** a **`formName`**.
Jméno zákazníka do předmětu dostat nejde.

```
Nová poptávka z webu {{siteName}}
```

### Reply to address

```
{{ E-mail }}
```

Tohle je ta nejužitečnější položka z celého nastavení: Šimon dá v Gmailu
Odpovědět a píše rovnou zákazníkovi, nemusí adresu vypisovat z těla zprávy.

**Pozor na diakritiku.** Pole snese jenom ASCII. Vypadá lákavě napsat
`{{ Jméno a příjmení }} <{{ E-mail }}>`, jenže `é` a `í` to rozbijí.
Název pole `E-mail` je čistě ASCII, takže projde.

### Email template

Tělo zprávy. Použitelné proměnné: `siteName`, `formName`, `formData`
a `formDashboardUrl`. `{{formData}}` vyrenderuje tabulku všech vyplněných
polí, takže se sem nevypisují jednotlivě — přibude-li do formuláře pole,
objeví se v e-mailu samo.

E-mailoví klienti neumí externí CSS ani flexbox, proto je šablona postavená
na tabulkách a stylech psaných rovnou u prvků. Vypadá stejně v Gmailu,
v Outlooku i na telefonu.

```html
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f2ec;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #d9d2c4;">

        <tr>
          <td style="background-color:#1b3a2d;padding:24px 28px;">
            <div style="color:#ffb199;font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;">Nová poptávka</div>
            <div style="color:#f5f2ec;font-size:22px;font-weight:600;padding-top:6px;">Někdo chce zahradu</div>
            <div style="color:rgba(245,242,236,0.6);font-size:13px;padding-top:8px;">Přišlo z formuláře {{formName}} na webu {{siteName}}.</div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 28px 8px 28px;color:#2a3b32;font-size:15px;line-height:1.6;">
            {{formData}}
          </td>
        </tr>

        <tr>
          <td style="padding:8px 28px 24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ede8de;border-radius:8px;">
              <tr>
                <td style="padding:16px 18px;color:#2a3b32;font-size:14px;line-height:1.6;">
                  <strong style="color:#1b3a2d;">Co teď</strong><br>
                  1. Odpovědět do 24 hodin — na tuhle zprávu stačí dát Odpovědět, míří rovnou zákazníkovi.<br>
                  2. Najít adresu na mapách a odhadnout rozsah.<br>
                  3. Domluvit schůzku na místě.
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 28px 28px 28px;">
            <a href="{{formDashboardUrl}}" style="display:inline-block;background-color:#c4491f;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:6px;">Otevřít všechny poptávky</a>
          </td>
        </tr>

        <tr>
          <td style="background-color:#f5f2ec;padding:14px 28px;color:#5e7368;font-size:12px;line-height:1.5;border-top:1px solid #d9d2c4;">
            Arbosis Plants s.r.o. · Xaverov 29, 285 06 Xaverov · info@arbosis.cz<br>
            Automatická zpráva z webu. Údaje ze zprávy patří mezi osobní údaje — nepřeposílat dál, než je potřeba.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
```

### Název formuláře

Formulář se ve Webflow jmenoval `Html Form`, což je výchozí název a v seznamu
odeslání se od ničeho nedá odlišit. Přejmenovaný je na **`Poptávka zahrady`**
a pod tímhle názvem se objeví i v předmětu přes `{{formName}}`.

### Co ověřit před spuštěním

Webflow u předmětu píše, že notifikace mají prefix `[Webflow Forms]` a že se
odstraní na placeném plánu. Prefix v předmětu vypadá amatérsky, takže se to
musí zkontrolovat na skutečné doručené zprávě, ne ve varování v UI. Když
prefix opravdu přijde, je to otázka plánu, ne nastavení.

### Ostatní

Text tlačítka během odesílání (Designer → tlačítko → Settings → Waiting text)
je dnes anglické „Please wait…" — ukáže se na zlomek vteřiny mezi kliknutím
a potvrzením. V markupu se přepsat nedá, Webflow si tohle pole drží sám.

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
