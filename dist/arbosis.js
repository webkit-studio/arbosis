/*!
 * Arbosis — sloučený skript webu arbosis.cz
 * Sestaveno z src/modules/ — needituj tento soubor, uprav zdroj a spusť `node build.js`.
 * Moduly: 00-core.js, 10-nav.js, 20-hero.js, 30-sluzby.js, 40-postup.js, 50-faq.js, 60-reveal.js, 70-glow.js, 90-gtm.js
 */
(function () {
'use strict';

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

  /* postup */
  postupSection: '[data-psec]',
  postupLine: '[data-pline]',
  postupLineDone: '[data-pline2]',
  postupStep: '[data-pstep]',

  /* ostatní */
  reveal: '[data-rv]',
  glow: '[data-glow]',
  quote: '[data-quote]',
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

/* ==========================================================================
   Navigace — stav po odscrollování a zvýraznění aktivní sekce
   --------------------------------------------------------------------------
   Proč JS a ne Webflow: obojí reaguje na polohu stránky, ne na stav prvku.
   Interakce (IX2) by to uměly naklikat, ale scroll trigger v IX2 se váže na
   konkrétní prvek a jeho procenta — tady potřebujeme prostou prahovou
   hodnotu a průsečík se sekcí. Třída .is-scrolled i .is-current jsou přitom
   normální třídy ve Webflow, takže vzhled zůstává v Designeru.
   ========================================================================== */

(function () {
  if (!has(SEL.nav)) return;

  var THRESHOLD = 80;

  onReady(function () {
    var nav = $1(SEL.nav);
    var cta = $1(SEL.navCta);

    onScroll(function () {
      var scrolled = window.pageYOffset > THRESHOLD;
      nav.classList.toggle('is-scrolled', scrolled);
      /* CTA v liště se po odscrollování obtáhne místo výplně — na tmavém
         pruhu by plná oranžová byla druhá plocha vedle sebe. */
      if (cta) cta.classList.toggle('is-outline', scrolled);
    });

    /* Zvýraznění položky menu podle sekce uprostřed okna. */
    if (!('IntersectionObserver' in window)) return;

    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = $1('[data-nl="' + entry.target.id + '"]');
          if (link) link.classList.toggle('is-current', entry.isIntersecting);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    SECTIONS.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  });
})();

/* ==========================================================================
   Hero — nájezd claimu a počítadla
   --------------------------------------------------------------------------
   Tři slova claimu vyjedou zpod masky, zbytek sekce se prolne, čísla
   dopočítají. Výchozí (skrytý) stav nastavuje skript, ne CSS — kdyby se
   bundle nenačetl, hero se vykreslí normálně a nic nezmizí.

   Čeká se na dokreslení fotky na pozadí (max 1,2 s), aby animace nezačala
   nad prázdným tmavým obdélníkem.
   ========================================================================== */

(function () {
  if (!has(SEL.hero)) return;

  var IMAGE_TIMEOUT = 1200;
  var IMAGE_DELAY = 500;
  var COUNTER_DURATION = 1100;
  var COUNTER_DELAY = 950;
  var DEFAULT_PARALLAX = 0.04;

  function setCounters(counters, animated) {
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';

      if (!animated) {
        el.textContent = formatNumber(target) + suffix;
        return;
      }

      el.textContent = '0' + suffix;
      setTimeout(function () {
        var start = performance.now();
        (function step() {
          var p = Math.min(1, (performance.now() - start) / COUNTER_DURATION);
          el.textContent = formatNumber(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })();
      }, COUNTER_DELAY);
    });
  }

  onReady(function () {
    var hero = $1(SEL.hero);
    var words = $$(SEL.heroWord, hero);
    var fades = $$(SEL.heroFade, hero);
    var veil = $1(SEL.heroVeil, hero);
    var counters = $$(SEL.counter, hero);

    if (!ANIM) {
      setCounters(counters, false);
      return;
    }

    words.forEach(function (w) {
      w.style.transition = 'none';
      w.style.transform = 'translateY(112%)';
    });
    fades.forEach(function (f) {
      f.style.transition = 'none';
      f.style.opacity = '0';
      f.style.transform = 'translateY(14px)';
    });
    if (veil) {
      veil.style.transition = 'none';
      veil.style.opacity = '0';
    }
    setCounters(counters, true);

    function play() {
      nextFrame(function () {
        if (veil) {
          veil.style.transition = 'opacity 600ms ' + EASE;
          veil.style.opacity = '1';
        }
        words.forEach(function (w, i) {
          w.style.transition = 'transform 750ms ' + EASE + ' ' + (180 + i * 120) + 'ms';
          w.style.transform = 'translateY(0)';
        });
        fades.forEach(function (f, i) {
          var d = 620 + i * 110;
          f.style.transition = 'opacity 650ms ' + EASE + ' ' + d + 'ms,transform 650ms ' + EASE + ' ' + d + 'ms';
          f.style.opacity = '1';
          f.style.transform = 'translateY(0)';
        });
      });
    }

    var fired = false;
    function go(delay) {
      if (fired) return;
      fired = true;
      setTimeout(play, delay);
    }

    var image = $1('img', hero);
    if (image && !image.complete) {
      image.addEventListener('load', function () { go(IMAGE_DELAY); }, { once: true });
      image.addEventListener('error', function () { go(0); }, { once: true });
      setTimeout(function () { go(0); }, IMAGE_TIMEOUT);
    } else {
      go(IMAGE_DELAY);
    }

    /* Jemný paralax fotky na pozadí. Rychlost sedí na sekci, ne na obrázku —
       prvek Image ve Webflow vlastní atributy zahazuje (viz 00-core.js). */
    if (image) {
      var rate = parseFloat(hero.getAttribute('data-plx')) || DEFAULT_PARALLAX;
      onScroll(function () {
        image.style.transform = 'translateY(' + window.pageYOffset * rate + 'px)';
      });
    }
  });
})();

/* ==========================================================================
   Služby — náhled fotky, který sleduje kurzor
   --------------------------------------------------------------------------
   Na počítači se u seznamu služeb ukáže fotka řádku pod kurzorem. Jedna
   fotka na jeden řádek — obrázek se bere přímo z prvku ve Webflow
   (.sluzby_photo uvnitř řádku), takže se ve Designeru vyměňuje jako každá
   jiná fotka a skript se o nic nestará.

   PODHOUBÍ PRO STŘÍDÁNÍ: když řádek dostane atribut data-photos se seznamem
   dalších URL oddělených čárkou, nákled je začne po PHOTO_INTERVAL střídat.
   Bez atributu (dnešní stav) drží jednu fotku. Zapíná se tedy obsahem, ne
   zásahem do kódu.

   Na tabletu a mobilu se nic z toho nespouští — fotka je tam pod řádkem
   natvrdo v layoutu (řídí Webflow) a kurzor neexistuje.
   ========================================================================== */

(function () {
  if (!has(SEL.sluzbyList) || !has(SEL.sluzbyPanel)) return;

  var PHOTO_INTERVAL = 500;
  var DESKTOP_MIN = 992;

  function photosOf(row) {
    var list = [];
    var main = $1('img', $1(SEL.sluzbyMedia, row) || row);
    if (main && main.currentSrc) list.push(main.currentSrc);
    else if (main && main.src) list.push(main.src);

    var extra = row.getAttribute('data-photos');
    if (extra) {
      extra.split(',').forEach(function (url) {
        var trimmed = url.trim();
        if (trimmed) list.push(trimmed);
      });
    }
    return list;
  }

  onReady(function () {
    var list = $1(SEL.sluzbyList);
    var panel = $1(SEL.sluzbyPanel);
    var image = $1('img', panel);
    var rows = $$(SEL.sluzbyRow, list);
    if (!image || !rows.length) return;

    var desktop = window.matchMedia('(min-width: ' + DESKTOP_MIN + 'px)');
    var timer = null;
    var frames = [];
    var index = 0;

    function show() {
      var url = frames[index % frames.length];
      if (url && image.getAttribute('src') !== url) image.setAttribute('src', url);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start(row) {
      stop();
      frames = photosOf(row);
      index = 0;
      if (!frames.length) return;
      show();
      /* Střídání se pouští jen když je fotek víc — jinak by interval běžel
         naprázdno a jen budil prohlížeč. */
      if (frames.length > 1 && ANIM) {
        timer = setInterval(function () {
          index += 1;
          show();
        }, PHOTO_INTERVAL);
      }
    }

    function active() {
      return desktop.matches && ANIM;
    }

    function open() {
      panel.style.opacity = '1';
      panel.style.transform = 'scale(1)';
    }

    function close() {
      stop();
      panel.style.opacity = '0';
      panel.style.transform = 'scale(0.94)';
    }

    list.addEventListener('mouseleave', close);

    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        if (!active()) return;
        start(row);
        open();
      });
    });

    list.addEventListener('mousemove', function (e) {
      if (!active()) return;
      var w = panel.offsetWidth;
      var h = panel.offsetHeight;
      panel.style.left = Math.max(8, Math.min(e.clientX - w / 2, window.innerWidth - w - 8)) + 'px';
      panel.style.top = Math.max(8, Math.min(e.clientY - h / 2, window.innerHeight - h - 8)) + 'px';
    });

    /* Přepnutí na užší okno musí náhled schovat, jinak by zůstal viset. */
    var onChange = function () {
      if (!desktop.matches) close();
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  });
})();

/* ==========================================================================
   Postup — čára, která dojíždí spolu se scrollem
   --------------------------------------------------------------------------
   Čtyři kroky spojuje linka. Jak sekce projíždí oknem, linka se plní
   oranžovou a čísla kroků se rozsvěcují. Poslední úsek (od SPLIT dál) je
   zelený — je to krok „a udržujeme", který na rozdíl od zbytku nikdy
   nekončí.

   Proč JS: hodnota se počítá z polohy sekce v okně. Šířka i výška se řídí
   stejným číslem, protože na mobilu je linka svislá (breakpoint řeší CSS
   ve Webflow, skript jen dosadí procenta do správné vlastnosti).
   ========================================================================== */

(function () {
  if (!has(SEL.postupSection)) return;

  /* Podíl dráhy, kde oranžová končí a začíná zelená. Sedí na střed kroku 04. */
  var SPLIT = 69;
  var STEP_AT = [3, 36, 69, 100];
  var MOBILE_MAX = 767;

  onReady(function () {
    var section = $1(SEL.postupSection);
    var line = $1(SEL.postupLine, section);
    var lineDone = $1(SEL.postupLineDone, section);
    var steps = $$(SEL.postupStep, section);
    if (!line) return;

    onScroll(function () {
      var progress = 100;

      if (ANIM) {
        var rect = section.getBoundingClientRect();
        var from = window.innerHeight * 0.75;
        var to = window.innerHeight * 0.45 - rect.height / 2;
        progress = Math.max(0, Math.min(1, (from - rect.top) / Math.max(1, from - to))) * 100;
      }

      var run = Math.min(progress, SPLIT);
      var done = Math.max(0, progress - SPLIT);
      var vertical = window.innerWidth <= MOBILE_MAX;

      if (vertical) {
        line.style.height = run + '%';
        line.style.width = '';
        if (lineDone) {
          lineDone.style.height = done + '%';
          lineDone.style.width = '';
        }
      } else {
        line.style.width = run + '%';
        line.style.height = '';
        if (lineDone) {
          lineDone.style.width = done + '%';
          lineDone.style.height = '';
        }
      }

      steps.forEach(function (step, i) {
        step.classList.toggle('is-reached', progress >= STEP_AT[i]);
        step.classList.toggle('is-final', i === steps.length - 1 && progress >= STEP_AT[i]);
      });
    });
  });
})();

/* ==========================================================================
   FAQ — plynulé rozbalení a jen jedna otevřená otázka
   --------------------------------------------------------------------------
   Značka <details> umí rozbalování sama, ale skokem a bez omezení na jednu
   položku. Skript proto přebírá kliknutí: dopočítá výšku odpovědi (auto
   se animovat nedá) a ostatní položky zavře.

   Bez JS zůstává accordion plně funkční — jen skáče. To je záměr: obsah
   musí být dostupný i když se bundle nenačte.
   ========================================================================== */

(function () {
  if (!has('.faq_item')) return;

  var DURATION = 400;

  onReady(function () {
    var items = $$('.faq_item');

    items.forEach(function (item) {
      var summary = $1('summary', item);
      var body = $1('.faq_answer', item);
      if (!summary || !body) return;

      body.style.overflow = 'hidden';
      body.style.transition = ANIM ? 'height ' + DURATION + 'ms ' + EASE : 'none';
      body.style.height = item.open ? 'auto' : '0px';

      function collapse() {
        if (!item.open) return;
        body.style.height = body.scrollHeight + 'px';
        nextFrame(function () {
          body.style.height = '0px';
        });
        window.setTimeout(function () {
          item.open = false;
        }, ANIM ? DURATION : 0);
      }

      function expand() {
        item.open = true;
        body.style.height = '0px';
        nextFrame(function () {
          body.style.height = body.scrollHeight + 'px';
        });
        window.setTimeout(function () {
          if (item.open) body.style.height = 'auto';
        }, ANIM ? DURATION : 0);
      }

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        var willOpen = !item.open;

        items.forEach(function (other) {
          if (other !== item && other.open) {
            var otherBody = $1('.faq_answer', other);
            if (otherBody) {
              otherBody.style.height = otherBody.scrollHeight + 'px';
              nextFrame(function () {
                otherBody.style.height = '0px';
              });
            }
            window.setTimeout(function () {
              other.open = false;
            }, ANIM ? DURATION : 0);
          }
        });

        if (willOpen) {
          expand();
          push({ event: 'faq_open', question: text($1('.faq_title', item)) });
        } else {
          collapse();
        }
      });
    });
  });
})();

/* ==========================================================================
   Nájezd sekcí a plynulý skok na kotvu
   --------------------------------------------------------------------------
   Nájezd: prvky s data-rv se při vstupu do okna prolnou zdola. Číslo
   v atributu je prodleva v ms, takže se dá skládat pořadí uvnitř sekce.
   Prvky, které jsou vidět hned po načtení, se nikdy neskrývají — jinak by
   nad ohybem chvíli blikalo prázdno.

   Kotvy: skok odsazený o výšku fixní lišty. Bez skriptu kotva funguje taky,
   jen bez dojezdu — proto je v arbosis.css ještě scroll-margin-top.
   ========================================================================== */

(function () {
  onReady(function () {
    var items = $$(SEL.reveal);

    if (items.length && ANIM && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var delay = el.getAttribute('data-rv') || 0;
            el.style.transition =
              'opacity 600ms ' + EASE + ' ' + delay + 'ms,transform 600ms ' + EASE + ' ' + delay + 'ms';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            observer.unobserve(el);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
      );

      items.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        observer.observe(el);
      });
    }

    /* Plynulý skok na kotvu uvnitř stránky. */
    $$('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;

        var target = document.getElementById(id.slice(1));
        if (!target) return;

        e.preventDefault();
        var to = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;

        if (!ANIM || !('requestAnimationFrame' in window)) {
          window.scrollTo(0, to);
          return;
        }

        var from = window.pageYOffset;
        var start = performance.now();
        var duration = Math.min(900, 400 + Math.abs(to - from) * 0.2);

        (function step() {
          var p = Math.min(1, (performance.now() - start) / duration);
          var eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          window.scrollTo(0, from + (to - from) * eased);
          if (p < 1) requestAnimationFrame(step);
        })();
      });
    });
  });
})();

/* ==========================================================================
   Kontakt — světlo, které jde za kurzorem
   --------------------------------------------------------------------------
   Za formulářem se v tmavé sekci pohybuje měkké zelené světlo. Poloha se
   předává do CSS proměnných --gx / --gy, samotný gradient je v arbosis.css.
   Dojezd je tlumený (9 % rozdílu na snímek), aby světlo kurzor sledovalo
   líně a nešlo s ním přesně.

   Nad formulářem se ztlumí — čitelnost polí je přednější než efekt.
   ========================================================================== */

(function () {
  if (!has(SEL.glow)) return;

  var IDLE = '0.62';
  var HOVER = '0.78';
  var BEHIND_FORM = '0.4';
  var FOLLOW = 0.09;

  onReady(function () {
    var glow = $1(SEL.glow);
    var section = glow.closest('section') || document.getElementById('kontakt');
    var inner = glow.firstElementChild;
    if (!section || !inner || !ANIM) return;

    var targetX = 50;
    var targetY = 42;
    var currentX = 50;
    var currentY = 42;
    var raf = null;

    function paint() {
      currentX += (targetX - currentX) * FOLLOW;
      currentY += (targetY - currentY) * FOLLOW;
      inner.style.setProperty('--gx', currentX.toFixed(2) + '%');
      inner.style.setProperty('--gy', currentY.toFixed(2) + '%');
      raf =
        Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1
          ? requestAnimationFrame(paint)
          : null;
    }

    function aim(e) {
      var rect = section.getBoundingClientRect();
      targetX = Math.max(-8, Math.min(108, ((e.clientX - rect.left) / rect.width) * 100));
      targetY = Math.max(-8, Math.min(108, ((e.clientY - rect.top) / rect.height) * 100));
      if (!raf) raf = requestAnimationFrame(paint);
    }

    function setOpacity(value) {
      glow.style.setProperty('--g', value);
    }

    section.addEventListener('mousemove', aim);
    section.addEventListener('mouseenter', function () { setOpacity(HOVER); });
    section.addEventListener('mouseleave', function () {
      setOpacity(IDLE);
      targetX = 50;
      targetY = 42;
      if (!raf) raf = requestAnimationFrame(paint);
    });

    var card = $1('[data-fwrap]', section);
    if (card) {
      card.addEventListener('mouseenter', function () { setOpacity(BEHIND_FORM); });
      card.addEventListener('mouseleave', function () { setOpacity(HOVER); });
      card.addEventListener('focusin', function () { setOpacity(BEHIND_FORM); });
      card.addEventListener('focusout', function () { setOpacity(HOVER); });
    }
  });
})();

/* ==========================================================================
   Měření do Google Tag Manageru
   --------------------------------------------------------------------------
   Události se posílají do dataLayeru, odkud si je GTM přebírá jako vlastní
   triggery. Bez GTM na stránce se jen plní pole a nic se neděje — bundle
   na kontejneru nezávisí.

   HOOK: prvky nesou data-gtm="cta|email|phone". Je to atribut, ne třída —
   přejmenování třídy ve Webflow tak měření nerozbije. Nová tlačítka stačí
   označit atributem, do kódu se nesahá.

   Události:
   | event                | kdy                          | parametry            |
   |----------------------|------------------------------|----------------------|
   | menu_click           | klik v hlavní navigaci       | button_text          |
   | cta_click            | klik na tlačítko s data-gtm  | button_text, section |
   | contact_click        | klik na e-mail nebo telefon  | method, value        |
   | faq_open             | rozbalení otázky (50-faq.js) | question             |
   | contact_form_submit  | odeslání poptávky            | form_id              |

   Konverze je contact_form_submit. Odpaluje se na události Webflow
   formuláře (w-form-done), ne na kliknutí — kliknutí se počítá i když
   odeslání selže nebo neprojde validací.
   ========================================================================== */

(function () {
  onReady(function () {
    $$(SEL.navLink).forEach(function (link) {
      link.addEventListener('click', function () {
        push({ event: 'menu_click', button_text: text(link) });
      });
    });

    $$(SEL.gtm).forEach(function (el) {
      var kind = el.getAttribute('data-gtm');

      if (kind === 'email' || kind === 'phone') {
        el.addEventListener('click', function () {
          push({ event: 'contact_click', method: kind, value: text(el) });
        });
        return;
      }

      el.addEventListener('click', function () {
        var section = el.closest('section');
        push({
          event: 'cta_click',
          button_text: text(el),
          section: (section && section.id) || 'bez sekce'
        });
      });
    });

    /* Konverze. Webflow po úspěšném odeslání skryje formulář a odkryje
       .w-form-done — na to se dá navázat bez jQuery přes MutationObserver.
       Fallback na submit tu záměrně není: odeslání může selhat. */
    var form = $1(SEL.form);
    if (!form || !('MutationObserver' in window)) return;

    var wrapper = form.closest('.w-form');
    var done = wrapper && $1('.w-form-done', wrapper);
    if (!done) return;

    var fired = false;
    new MutationObserver(function () {
      if (fired) return;
      var visible = window.getComputedStyle(done).display !== 'none';
      if (!visible) return;
      fired = true;
      push({ event: 'contact_form_submit', form_id: form.getAttribute('id') || 'form-poptavka' });
    }).observe(done, { attributes: true, attributeFilter: ['style', 'class'] });
  });
})();

})();
