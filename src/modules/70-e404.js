/* ==========================================================================
   Symbol na stránce 404 reaguje na kurzor
   --------------------------------------------------------------------------
   PROČ NE VE WEBFLOW. Interakce se váže na pozici kurzoru kdekoliv na
   stránce a přepočítává posun i světlost symbolu. IX2 umí „mouse move over
   element", ale symbol má pointer-events: none (nesmí brát kliknutí) a leze
   mimo viewport, takže by se najíždění chytalo jen na jeho viditelném rohu.
   Navíc IX2 přes API nejde ani přečíst, natož zapsat.

   CO TO DĚLÁ. Strom se za kurzorem naklání, a čím je kurzor blíž pravému
   spodnímu rohu, tím je vidět víc. Návštěvník, který přišel na chybu, má
   aspoň co osahat, než klikne zpátky.

   Vypnuté animace i dotykové ovládání interakci přeskočí — na telefonu není
   kurzor, který by ji spustil, a symbol zůstane v základní poloze.
   ========================================================================== */

var E404_SHIFT = 34; /* px, maximální posun symbolu */
var E404_TILT = 2.4; /* deg, maximální naklonění */
var E404_DIM = 0.07; /* výchozí světlost, drží ji i .e404_symbol */
var E404_LIT = 0.2; /* světlost, když je kurzor u symbolu */

(function () {
  onReady(function () {
    var wrap = $1(SEL.e404Symbol);
    if (!wrap || !ANIM) return;

    var img = $1('img', wrap);
    if (!img) return;

    /* Dotykové ovládání nemá kurzor, kterým by se dalo mířit. */
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;

    var px = 0;
    var py = 0;
    var queued = false;

    function paint() {
      queued = false;

      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;

      /* -1 vlevo nahoře, +1 vpravo dole. */
      var x = (px / w) * 2 - 1;
      var y = (py / h) * 2 - 1;

      wrap.style.transform =
        'translate3d(' + (-x * E404_SHIFT).toFixed(1) + 'px,' +
        (-y * E404_SHIFT).toFixed(1) + 'px,0) rotate(' +
        (x * E404_TILT).toFixed(2) + 'deg)';

      /* Vzdálenost kurzoru od pravého spodního rohu, kde symbol sedí.
         0 = kurzor je v rohu, 1 = je nejdál, co jde. */
      var dx = 1 - px / w;
      var dy = 1 - py / h;
      var far = Math.min(1, Math.sqrt(dx * dx + dy * dy));

      img.style.opacity = (E404_DIM + (E404_LIT - E404_DIM) * (1 - far)).toFixed(3);
    }

    window.addEventListener(
      'pointermove',
      function (event) {
        px = event.clientX;
        py = event.clientY;
        if (queued) return;
        queued = true;
        window.requestAnimationFrame(paint);
      },
      { passive: true }
    );
  });
})();
