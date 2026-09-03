# arbosis.cz

Vlastní kód webu [arbosis.cz](https://arbosis.cz) — zahradnická firma
Arbosis Plants s.r.o. Web se spravuje ve **Webflow**, tenhle repozitář je
doplněk: nese jen chování a styly, které se v Designeru naklikat nedají.

## Co je uvnitř

```
src/modules/     číslované moduly, build.js je slévá do jednoho IIFE
src/arbosis.css  styly mimo možnosti Designeru (viz komentáře v souboru)
dist/            sloučený výstup — commituje se, servíruje ho jsDelivr
test/smoke.js    smoke test na jsdom
docs/            nasazení custom kódu a napojení měření
```

## Příkazy

```sh
npm run build    # src/ → dist/
npm run test     # smoke test
npm run lint
npm run check    # vše dohromady
```

## Nasazení

Bundle jede z jsDelivr připnutý na konkrétní commit — podrobnosti
a přesné bloky kódu jsou v [docs/webflow-custom-code.md](docs/webflow-custom-code.md).

Pravidla práce na projektu jsou v [CLAUDE.md](CLAUDE.md).
