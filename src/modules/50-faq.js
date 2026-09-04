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
