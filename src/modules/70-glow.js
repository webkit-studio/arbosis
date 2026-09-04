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
