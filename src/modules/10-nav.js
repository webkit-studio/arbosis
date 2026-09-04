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
