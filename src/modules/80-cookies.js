/* ==========================================================================
   Cookie lišta a souhlas s měřením
   --------------------------------------------------------------------------
   PROČ TO NENÍ VE WEBFLOW. Lišta se sem vykresluje z JS, ne z Designeru,
   a je to jediné místo v projektu, kde se markup skládá v kódu. Důvod je
   právní, ne technický: lišta musí být na KAŽDÉ stránce, včetně těch, které
   teprve vzniknou. Kdyby to byl komponent, který se ručně vkládá, stačí ho
   jednou zapomenout a na té stránce se měří bez souhlasu. Tohle zapomenout
   nejde. Ze stejného důvodu je i vzhled v arbosis.css — třídy .cc_* ve
   Webflow neexistují, takže se na ně v Designeru nedá kliknout.

   JAK TO NAVAZUJE NA MĚŘENÍ. V hlavičce webu běží Consent Mode v2, který
   všechno nastaví na 'denied' ještě před načtením GTM. Tenhle modul posílá
   jen 'consent update'. Do souhlasu tedy GA4 neuloží nic — a bez GTM na
   stránce se lišta chová stejně, jen nemá komu poslat výsledek.

   ROZSAH SOUHLASU. Web má dvě skupiny cookies: nezbytné (bez souhlasu,
   výjimka podle § 89 odst. 3 zák. č. 127/2005 Sb.) a analytické. Reklamní
   kategorie tu vědomě není — web žádnou reklamu neměří. Až přibude, přidá
   se sem i do zásad, ne jenom sem.

   VOLBA SE PAMATUJE 6 MĚSÍCŮ. Pak se lišta zeptá znovu. Neomezená platnost
   souhlasu je věc, kterou ÚOOÚ vytýká.
   ========================================================================== */

var CC_KEY = 'arbosis_cc';
var CC_VERSION = 1;
var CC_MAX_AGE = 182 * 24 * 60 * 60 * 1000; /* 6 měsíců v ms */
var CC_FADE = 260; /* musí sedět s přechodem v .cc v arbosis.css */

/** gtag z hlavičky webu; když tam není, spadne se na plnění dataLayeru. */
function ccGtag() {
  if (typeof window.gtag === 'function') return window.gtag.apply(window, arguments);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

/** Uložená volba, nebo null když chybí, je stará nebo je z jiné verze. */
function ccStored() {
  try {
    var raw = window.localStorage.getItem(CC_KEY);
    if (!raw) return null;
    var saved = JSON.parse(raw);
    if (!saved || saved.v !== CC_VERSION) return null;
    if (typeof saved.analytics !== 'boolean') return null;
    if (Date.now() - saved.ts > CC_MAX_AGE) return null;
    return saved;
  } catch (e) {
    /* Soukromé okno nebo zakázané úložiště. Chováme se, jako by souhlas
       nebyl — tedy se zeptáme a nic se neměří. */
    return null;
  }
}

function ccApply(analytics) {
  ccGtag('consent', 'update', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: analytics ? 'granted' : 'denied'
  });
  push({ event: 'cookie_consent', consent_analytics: analytics ? 'granted' : 'denied' });
}

function ccSave(analytics) {
  try {
    window.localStorage.setItem(
      CC_KEY,
      JSON.stringify({ v: CC_VERSION, analytics: analytics, ts: Date.now() })
    );
  } catch (e) {
    /* Neuložilo se — souhlas platí aspoň pro tuhle návštěvu. */
  }
  ccApply(analytics);
}

var CC_HTML =
  '<div class="cc_bar" data-cc-bar role="dialog" aria-live="polite" aria-label="Souhlas s cookies">' +
  '<div class="cc_inner">' +
  '<div class="cc_text">' +
  '<strong class="cc_title">Měříme návštěvnost webu</strong>' +
  '<p class="cc_desc">Zajímá nás jen souhrnně, které sekce lidi zaujmou. Bez vašeho souhlasu se neuloží nic a web funguje úplně stejně. Podrobnosti jsou v <a href="/ochrana-osobnich-udaju" class="cc_link">zásadách ochrany osobních údajů</a>.</p>' +
  '</div>' +
  '<div class="cc_actions">' +
  '<a href="#" class="cc_ghost" data-cc-settings role="button">Nastavení</a>' +
  '<a href="#" class="cc_btn cc_btn-outline" data-cc-reject role="button">Jen nezbytné</a>' +
  '<a href="#" class="cc_btn" data-cc-accept role="button">Přijmout vše</a>' +
  '</div>' +
  '</div>' +
  '</div>' +
  '<div class="cc_panel" data-cc-panel role="dialog" aria-modal="true" aria-label="Nastavení cookies">' +
  '<div class="cc_panel-inner">' +
  '<strong class="cc_panel-title">Nastavení cookies</strong>' +
  '<div class="cc_cat">' +
  '<div class="cc_cat-head"><strong class="cc_cat-name">Nezbytné</strong><span class="cc_always">Vždy zapnuto</span></div>' +
  '<p class="cc_cat-desc">Drží web pohromadě — odeslání formuláře a zapamatování téhle volby. Bez nich web nefunguje, proto se na ně ptát nemusíme.</p>' +
  '</div>' +
  '<div class="cc_cat">' +
  '<div class="cc_cat-head"><strong class="cc_cat-name">Analytické</strong>' +
  '<a href="#" class="cc_switch" data-cc-toggle role="switch" aria-checked="false"><span class="cc_knob"></span></a>' +
  '</div>' +
  '<p class="cc_cat-desc">Google Analytics. Ukazuje, kolik lidí web navštívilo a odkud přišli. Nesbírá nic, podle čeho by šlo poznat konkrétního člověka.</p>' +
  '</div>' +
  '<div class="cc_panel-actions">' +
  '<a href="#" class="cc_btn cc_btn-outline" data-cc-save role="button">Uložit volbu</a>' +
  '<a href="#" class="cc_btn" data-cc-accept role="button">Přijmout vše</a>' +
  '</div>' +
  '</div>' +
  '</div>';

(function () {
  onReady(function () {
    var saved = ccStored();

    /* Souhlas už padl — jen se obnoví stav a lišta se vůbec nevykreslí. */
    if (saved) {
      ccApply(saved.analytics);
      return;
    }

    var root = document.createElement('div');
    root.className = 'cc';
    root.setAttribute('data-cc', '');
    root.innerHTML = CC_HTML;
    document.body.appendChild(root);

    var bar = $1('[data-cc-bar]', root);
    var panel = $1('[data-cc-panel]', root);
    var toggle = $1('[data-cc-toggle]', root);
    var analytics = false;

    function close() {
      root.classList.add('is-gone');
      window.setTimeout(function () {
        if (root.parentNode) root.parentNode.removeChild(root);
      }, ANIM ? CC_FADE : 0);
    }

    function decide(value) {
      ccSave(value);
      close();
    }

    function on(selector, handler) {
      $$(selector, root).forEach(function (el) {
        el.addEventListener('click', function (event) {
          event.preventDefault();
          handler();
        });
      });
    }

    on('[data-cc-accept]', function () { decide(true); });
    on('[data-cc-reject]', function () { decide(false); });
    on('[data-cc-save]', function () { decide(analytics); });

    on('[data-cc-settings]', function () {
      bar.classList.add('is-hidden');
      panel.classList.add('is-open');
    });

    on('[data-cc-toggle]', function () {
      analytics = !analytics;
      toggle.setAttribute('aria-checked', analytics ? 'true' : 'false');
      toggle.classList.toggle('is-on', analytics);
    });

    /* Lišta nedostane fokus násilím — jen se vysune. Vysunutí je v CSS,
       tady se přidá třída až po prvním snímku, aby přechod naběhl. */
    nextFrame(function () { root.classList.add('is-ready'); });
  });

  /* Odkaz kdekoliv na webu (v zásadách, v patičce) volbu vrátí zpátky:
     smaže uloženou volbu a přenačte stránku, takže se lišta ukáže znovu. */
  onReady(function () {
    $$('[data-cc-open]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        try { window.localStorage.removeItem(CC_KEY); } catch (e) {}
        window.location.reload();
      });
    });
  });
})();
