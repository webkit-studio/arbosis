# Nasazení custom kódu do Webflow

Bundle jede z jsDelivr **připnutý na konkrétní commit**. Změna v repu se na
web nedostane, dokud se v Custom Code nepřepne hash. Proč commit a ne větev
vysvětluje [CLAUDE.md](../CLAUDE.md#nasazení).

## Kam co patří

| Blok | Umístění ve Webflow |
|---|---|
| CSS + (později) GTM loader | Site settings → Custom Code → **Head** |
| JS bundle | Site settings → Custom Code → **Footer** |

Přepnutí jde přes API (`data_scripts_tool > set_site_freeform_code`), ruční
cesta přes Designer existuje jen jako záloha — panel Custom Code má vlastní
tlačítko Save Changes, bez něj se publikuje stará verze.

## Head

```html
<!-- Theme Color -->
<meta name="theme-color" content="#1B3A2D" />
<!-- End Theme Color -->

<!-- Webkit Studio Code -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/webkit-studio/arbosis@<commit>/dist/arbosis.min.css" />
<!-- End Webkit Studio Code -->
```

## Footer

```html
<!-- Webkit Studio Code -->
<script defer src="https://cdn.jsdelivr.net/gh/webkit-studio/arbosis@<commit>/dist/arbosis.min.js"></script>
<!-- End Webkit Studio Code -->
```

## Postup při změně

1. `npm run check` — build, smoke test, lint.
2. Commit a push do `main`.
3. `data_scripts_tool > get_site_freeform_code` — načíst **aktuální** obsah.
4. V načteném textu vyměnit **jen hash**, poslat zpátky **celý obsah pole**.
5. Publikovat (rozhoduje Lukáš, ne agent).
6. Ověřit na živé stránce, že se načítá právě ten commit.

Nikdy neskládej obsah head/footer z paměti ani ze zálohy — přepsal bys tím
GTM loader a cokoliv dalšího, co tam mezitím přibylo.

## Fonty

Outfit se načítá **nativně přes Webflow** (Site settings → Fonts → Google
Fonts, řezy 200/400/600/800). Do custom kódu se font nepřidává — byl by
načtený dvakrát.
