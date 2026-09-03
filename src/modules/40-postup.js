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
