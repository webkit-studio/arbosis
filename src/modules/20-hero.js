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
