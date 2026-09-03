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
