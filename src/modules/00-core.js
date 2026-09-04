/* ==========================================================================
   Jádro — sdílené pomocné funkce a mapa selektorů
   --------------------------------------------------------------------------
   Web stojí na Webflow. Tenhle bundle přidává jen chování, které se
   v Designeru naklikat nedá. Vzhled (barvy, rozměry, hover stavy,
   breakpointy) patří na třídy ve Webflow, ne sem.

   HOOK ATRIBUTY: moduly cílí na data-atributy, ne na názvy tříd. Třídu
   ve Webflow kdokoliv přejmenuje bez varování, data-atribut ne — je vidět
   v panelu nastavení prvku a nikdo ho omylem nepřepíše stylováním.

   POZOR — prvek Image ve Webflow vlastní data-atributy ZAHAZUJE. Ověřeno
   na publikované stránce: data-plx i data-spimg z markupu zmizely, zatímco
   stejné atributy na obalových divech zůstaly. Hook proto nikdy nepatří na
   <img>; dává se na obal a obrázek se uvnitř najde strukturálně ($1('img', obal)).
   Uvnitř náhledu i hera je jediný obrázek, takže je výběr jednoznačný.
   ========================================================================== */

var SEL = {
  /* navigace */
  nav: '[data-nav]',
  navCta: '[data-ncta]',
  navLink: '[data-nl]',

  /* hero */
  hero: '[data-hero]',
  heroWord: '[data-hwi]',
  heroFade: '[data-hsub]',
  heroVeil: '[data-hveil]',
  counter: '[data-count]',

  /* služby */
  sluzbyList: '[data-slist]',
  sluzbyRow: '[data-srow]',
  sluzbyNumber: '[data-sn]',
  sluzbyMedia: '[data-smedia]',
  sluzbyPanel: '[data-spanel]',
  /* skrytý Collection List s fotkami z CMS, viz 30-sluzby.js */
  sluzbyItem: '[data-sitem]',
  sluzbyName: '[data-sname]',
  sluzbyCycle: '[data-scycle]',
  sluzbyFeedPhoto: '[data-sphoto]',

  /* postup */
  postupSection: '[data-psec]',
  postupLine: '[data-pline]',
  postupLineDone: '[data-pline2]',
  postupStep: '[data-pstep]',

  /* ostatní */
  reveal: '[data-rv]',
  glow: '[data-glow]',
  quote: '[data-quote]',
  /* symbol v rohu stránky 404, viz 70-e404.js */
  e404Symbol: '[data-e404sym]',
  form: '#form-poptavka',

  /* měření — hook atribut data-gtm, viz 90-gtm.js */
  gtm: '[data-gtm]'
};

/* Kotvy, na které reaguje zvýraznění v navigaci. */
var SECTIONS = ['sluzby', 'postup', 'reference', 'kontakt'];

/** Výška fixní lišty — o kolik se odsazuje skok na kotvu. */
var NAV_OFFSET = 80;

/** Vrátí pole prvků pro daný selektor. */
function $$(sel, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(sel));
}

/** Vrátí první prvek nebo null. */
function $1(sel, root) {
  return (root || document).querySelector(sel);
}

/** Spustí callback po DOMContentLoaded (nebo hned, pokud už proběhl). */
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

/** Je na stránce alespoň jeden prvek daného selektoru? Modul se pak spustí. */
function has(sel) {
  return !!$1(sel);
}

/* --- Pohyb ----------------------------------------------------------------
   Jediný zdroj pravdy pro celý bundle. Když má návštěvník v systému vypnuté
   animace, moduly nic neanimují — rovnou dosadí koncový stav. Nikdy se
   nesmí stát, že obsah zůstane skrytý jen proto, že animace neproběhla. */
var ANIM = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

var EASE = 'cubic-bezier(0.16,1,0.3,1)';

/** Odloží práci na další snímek — dvakrát, aby prohlížeč stihl vykreslit
    výchozí stav dřív, než se na něj pustí přechod. */
function nextFrame(fn) {
  requestAnimationFrame(function () {
    requestAnimationFrame(fn);
  });
}

/** Přišpendlí posluchač scrollu tak, aby se počítalo nejvýš jednou za snímek. */
function onScroll(fn) {
  var pending = false;
  function tick() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      fn();
    });
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
  fn();
}

/** Text prvku bez okolních mezer. */
function text(el) {
  return el ? (el.textContent || '').trim() : '';
}

/** Číslo s pevnou mezerou po tisících — 7 000, ne 7000. */
function formatNumber(n) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Zápis do dataLayeru. Když GTM na stránce není, jen se založí pole. */
function push(payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}
