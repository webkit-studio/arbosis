/* ==========================================================================
   Reference — citace se vybarvuje se scrollem
   --------------------------------------------------------------------------
   Text začíná světle a jak sekce projíždí oknem, slovo po slovu tmavne do
   plné zelené. Čte se to jako by to někdo právě říkal.

   PROČ JS. Efekt potřebuje polohu odstavce v okně přepočítanou na každém
   snímku a barvu nastavenou zvlášť každému slovu. Ve Webflow se nedá udělat
   ani interakcí — IX2 umí hýbat celým prvkem, ne jednotlivými slovy uvnitř
   textu.

   FAILSAFE. Slova rozděluje a barví teprve skript. Bez JS zůstane citace
   tak, jak ji nastavil Designer, tedy plnou barvou a čitelná. Totéž při
   vypnutých animacích — dosadí se rovnou konečný stav.

   HOOK data-quote je v mapě selektorů od začátku, chování k němu ale nikdy
   nevzniklo. Markup ho na blockquote nese, takže se nic nemusí přidávat.
   ========================================================================== */

/* Zelená z proměnné Les. Nevybarvené slovo je stejná barva s nízkou
   průhledností, ne šedá — na kostěném podkladu to drží tón sekce. */
var QUOTE_RGB = '27, 58, 45';
var QUOTE_FROM = 0.2;

/* Jak velký kus dráhy trvá přechod jednoho slova. Vyšší číslo = měkčí
   vlna přes víc slov najednou, nižší = slova naskakují po jednom. */
var QUOTE_FADE = 0.16;

(function () {
  if (!has(SEL.quote)) return;

  onReady(function () {
    var quote = $1(SEL.quote);
    var raw = text(quote);
    if (!raw) return;

    var parts = raw.split(/\s+/);
    var words = [];

    quote.textContent = '';
    parts.forEach(function (word, i) {
      var span = document.createElement('span');
      span.className = 'quote_w';
      span.textContent = word + (i < parts.length - 1 ? ' ' : '');
      quote.appendChild(span);
      words.push(span);
    });

    function paint(value) {
      var alpha = QUOTE_FROM + value * (1 - QUOTE_FROM);
      return 'rgba(' + QUOTE_RGB + ', ' + alpha.toFixed(3) + ')';
    }

    onScroll(function () {
      var progress = 1;

      if (ANIM) {
        var rect = quote.getBoundingClientRect();
        var from = window.innerHeight * 0.85;
        var to = window.innerHeight * 0.4 - rect.height;
        progress = (from - rect.top) / Math.max(1, from - to);
        progress = Math.max(0, Math.min(1, progress));
      }

      words.forEach(function (span, i) {
        /* Poslední slovo musí stihnout dojet dřív, než dráha skončí —
           proto se prahy vejdou do (1 - QUOTE_FADE). */
        var start = (i / words.length) * (1 - QUOTE_FADE);
        var value = Math.max(0, Math.min(1, (progress - start) / QUOTE_FADE));
        span.style.color = paint(value);
      });
    });
  });
})();
