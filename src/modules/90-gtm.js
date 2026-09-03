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
