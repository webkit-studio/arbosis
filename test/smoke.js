/* Smoke test: ověří, že bundle běží bez chyb a že klíčové moduly reagují na
   markup, jaký generuje Webflow. Spuštění: node test/smoke.js

   Kostry níž jsou zkrácené kopie skutečné stránky — hook atributy
   (data-nav, data-count, data-gtm…) musí sedět, jinak test nic nechytí.
   Právě proto se testuje proti atributům a ne proti třídám. */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const bundle = fs.readFileSync(path.join(__dirname, '..', 'dist', 'arbosis.js'), 'utf8');

let pass = 0;
let fail = 0;
const ok = (name, condition) => {
  if (condition) {
    pass += 1;
    console.log('  ✅ ' + name);
  } else {
    fail += 1;
    console.log('  ❌ ' + name);
  }
};

/** Počká na dokreslení snímku — moduly navázané na scroll počítají uvnitř
    requestAnimationFrame, takže hned po dispatchi ještě nic nezměnily. */
const frame = () => new Promise((resolve) => setTimeout(resolve, 30));

/** Obrázek uvnitř obalu — hook je na obalu, ne na <img> (viz 00-core.js). */
const $img = (wrap) => wrap.querySelector('img');

const PAGE = `
<div class="nav_component" data-nav>
  <a class="nav_link" data-nl="sluzby" href="#sluzby">Služby</a>
  <a class="nav_link" data-nl="kontakt" href="#kontakt">Kontakt</a>
  <a class="btn is-small" data-ncta href="#kontakt">Poptat zahradu</a>
</div>

<section id="hero" data-hero data-plx="0.04">
  <img src="hero.webp" alt="">
  <div data-hveil></div>
  <div data-hsub>Zahrady</div>
  <h1><span><span data-hwi>Návrh</span></span><span><span data-hwi>Realizace</span></span></h1>
  <span data-count="35" data-suffix="">35</span>
  <span data-count="500" data-suffix="+">500+</span>
</section>

<section id="sluzby">
  <div data-slist>
    <div class="sluzby_row" data-srow>
      <span class="sluzby_number" data-sn>01</span>
      <div class="sluzby_media" data-smedia><img class="sluzby_photo" src="navrhy.webp" alt=""></div>
    </div>
    <div class="sluzby_row" data-srow data-photos="a.webp, b.webp">
      <span class="sluzby_number" data-sn>02</span>
      <div class="sluzby_media" data-smedia><img class="sluzby_photo" src="realizace.webp" alt=""></div>
    </div>
  </div>
  <div class="sluzby_panel" data-spanel><img src="navrhy.webp" alt=""></div>
  <a class="link_big" data-gtm="cta" href="#kontakt">Chci méně starostí</a>
</section>

<section id="postup" data-psec>
  <div data-pline></div><div data-pline2></div>
  <span class="postup_step" data-pstep>01</span>
  <span class="postup_step" data-pstep>02</span>
  <span class="postup_step" data-pstep>03</span>
  <span class="postup_step" data-pstep>04</span>
</section>

<section id="reference"><div data-rv="0">Reference</div></section>

<section id="kontakt">
  <div data-glow><div></div></div>
  <div data-fwrap>
    <div data-ring></div><div data-ring-b></div>
    <div class="w-form">
      <form id="form-poptavka"><input name="E-mail"><button type="submit">Odeslat</button></form>
      <div class="w-form-done" style="display:none">Děkujeme</div>
      <div class="w-form-fail" style="display:none">Chyba</div>
    </div>
  </div>
  <a class="kontakt_email" data-gtm="email" href="mailto:info@arbosis.cz">info@arbosis.cz</a>
  <a class="kontakt_phone" data-gtm="phone" href="tel:+420604481767">604 481 767</a>
</section>

<section id="faq">
  <details class="faq_item" open>
    <summary class="faq_question"><h3 class="faq_title">Kolik zahrada stojí?</h3><span class="faq_icon">+</span></summary>
    <div class="faq_answer"><p class="faq_text">Odpověď</p></div>
  </details>
  <details class="faq_item">
    <summary class="faq_question"><h3 class="faq_title">Kam jezdíte?</h3><span class="faq_icon">+</span></summary>
    <div class="faq_answer"><p class="faq_text">Odpověď</p></div>
  </details>
</section>`;

function run(name, { reducedMotion = false, desktop = true } = {}) {
  console.log('\n' + name);

  const dom = new JSDOM(`<!DOCTYPE html><html lang="cs"><body>${PAGE}</body></html>`, {
    url: 'https://arbosis.cz/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });

  const { window } = dom;

  /* jsdom nemá matchMedia — dosadíme minimální náhradu, ať se dá otestovat
     i větev s vypnutými animacemi. */
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion')
      ? reducedMotion
      : query.includes('min-width')
        ? desktop
        : true,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  });

  /* jsdom neumí window.scrollTo — plynulý skok na kotvu ho volá, takže by
     bez záslepky test zaplavily hlášky „Not implemented". */
  window.scrollTo = () => {};

  const errors = [];
  window.addEventListener('error', (e) => errors.push(e.message));

  try {
    window.eval(bundle);
    window.document.dispatchEvent(new window.Event('DOMContentLoaded'));
    window.dispatchEvent(new window.Event('load'));
  } catch (e) {
    errors.push(e.message);
  }

  ok('bundle proběhl bez výjimky', errors.length === 0);
  if (errors.length) console.log('     ' + errors.join('\n     '));

  return window;
}

async function main() {
// --- 1. běžný provoz ------------------------------------------------------
{
  const win = run('BĚŽNÝ PROVOZ');
  const doc = win.document;

  win.dataLayer = [];

  doc.querySelector('[data-nl="sluzby"]').dispatchEvent(new win.Event('click', { bubbles: true }));
  doc.querySelector('[data-gtm="cta"]').dispatchEvent(new win.Event('click', { bubbles: true }));
  doc.querySelector('[data-gtm="email"]').dispatchEvent(new win.Event('click', { bubbles: true }));
  doc.querySelector('[data-gtm="phone"]').dispatchEvent(new win.Event('click', { bubbles: true }));

  const events = win.dataLayer.map((e) => e.event);
  ok('menu_click se odeslal', events.includes('menu_click'));
  ok('cta_click se odeslal se sekcí', win.dataLayer.some((e) => e.event === 'cta_click' && e.section === 'sluzby'));
  ok('contact_click zná e-mail i telefon',
    win.dataLayer.filter((e) => e.event === 'contact_click').length === 2);

  /* Lišta reaguje na polohu stránky. */
  Object.defineProperty(win, 'pageYOffset', { value: 400, configurable: true });
  win.dispatchEvent(new win.Event('scroll'));
  await frame();
  ok('navigace dostala .is-scrolled', doc.querySelector('[data-nav]').classList.contains('is-scrolled'));
  ok('CTA v liště se přepnulo na obrys', doc.querySelector('[data-ncta]').classList.contains('is-outline'));

  /* FAQ: klik na druhou otázku zavře první. */
  const items = doc.querySelectorAll('.faq_item');
  doc.querySelectorAll('.faq_question')[1].dispatchEvent(new win.Event('click', { bubbles: true, cancelable: true }));
  ok('otevřená otázka se rozbalila', items[1].open === true);
  ok('faq_open se odeslal s textem otázky',
    win.dataLayer.some((e) => e.event === 'faq_open' && e.question === 'Kam jezdíte?'));

  /* Náhled u služeb bere fotku z řádku, ne z pevného seznamu v kódu. */
  const panel = doc.querySelector('[data-spanel] img');
  doc.querySelectorAll('[data-srow]')[1].dispatchEvent(new win.Event('mouseenter'));
  /* Adresa se v prohlížeči i v jsdom ukládá jako absolutní — porovnává se
     proto konec, ne celý řetězec. */
  ok('náhled ukazuje fotku najetého řádku', /realizace\.webp$/.test(panel.getAttribute('src')));
  ok('náhled se otevřel', doc.querySelector('[data-spanel]').style.opacity === '1');
}

// --- 2. mobil: fotku u služeb otevírá scroll ------------------------------
{
  const win = run('MOBIL (bez hoveru)', { desktop: false });
  const doc = win.document;

  Object.defineProperty(win, 'innerHeight', { value: 800, configurable: true });
  win.dispatchEvent(new win.Event('scroll'));
  await frame();

  const media = [...doc.querySelectorAll('[data-smedia]')];
  const otevrene = media.filter((m) => m.style.height && m.style.height !== '0px');
  ok('otevřený je právě jeden řádek', otevrene.length === 1);
  ok('fotka otevřeného řádku je vidět',
    otevrene.length === 1 && $img(otevrene[0]).style.opacity === '1');
  ok('ostatní fotky zůstaly skryté',
    media.filter((m) => m !== otevrene[0]).every((m) => !$img(m).style.opacity || $img(m).style.opacity === '0'));

  /* Náhled u kurzoru se na mobilu nesmí otevřít. */
  doc.querySelectorAll('[data-srow]')[1].dispatchEvent(new win.Event('mouseenter'));
  const panel = doc.querySelector('[data-spanel]');
  ok('náhled u kurzoru zůstal zavřený', panel.style.opacity !== '1');
}

// --- 3. vypnuté animace ---------------------------------------------------
{
  const win = run('VYPNUTÉ ANIMACE (prefers-reduced-motion)', { reducedMotion: true });
  const doc = win.document;

  const counters = doc.querySelectorAll('[data-count]');
  ok('čísla jsou hned na cílové hodnotě', counters[0].textContent === '35');
  ok('číslo nad tisíc má mezeru a příponu', counters[1].textContent === '500+');

  const words = doc.querySelectorAll('[data-hwi]');
  ok('claim není schovaný pod maskou', words[0].style.transform === '');

  const reveal = doc.querySelector('[data-rv]');
  ok('sekce nezůstala neviditelná', reveal.style.opacity !== '0');
}

console.log(`\n${pass} prošlo, ${fail} selhalo`);
process.exit(fail === 0 ? 0 : 1);
}

main();
