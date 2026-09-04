/* ==========================================================================
   Tichá ochrana formuláře proti botům
   --------------------------------------------------------------------------
   PROČ NE reCAPTCHA. Webflow nativně nabízí jen reCAPTCHA v2 se
   zaškrtávacím políčkem. To je práce navíc pro každého člověka a občas
   z toho vypadne hledání semaforů na fotkách — u poptávky zahrady je to
   nejjistější způsob, jak přijít o zákazníka. Tohle je neviditelné: kdo
   formulář vyplní rukou, nepozná, že tu něco je.

   DVĚ SÍTA. Obě chytají jiný druh robota:

   1. Past (honeypot). Ve formuláři je pole Website, odsunuté mimo obrazovku
      a vyřazené z tabulátoru. Člověk ho nevidí a nevyplní. Skript, který
      formulář načte a vyplní všechna pole, ho vyplní vždycky. Pole se
      záměrně jmenuje anglicky — roboti hledají známé názvy.

   2. Čas. Odeslání dřív než MIN_TIME od načtení stránky. Vyplnit šest polí
      včetně adresy a zprávy pod tři vteřiny člověk nestihne, robot ano.

   Obojí se dá obejít cíleně mířeným botem. Na běžný plošný spam, o který
   tady jde, to stačí, a nestojí to návštěvníka ani jedno kliknutí.

   Zachycené odeslání se do GA4 neposílá — konverze se počítá až na
   .w-form-done (viz 90-gtm.js), a ta se v tomhle případě nikdy neukáže.

   PROČ SE PASTI PŘED ODESLÁNÍM BERE NÁZEV. Webflow posílá do notifikačního
   e-mailu tabulku všech polí formuláře a v těle se dá použít jenom
   {{formData}} — jednotlivá pole ne. Past by se tak Šimonovi objevila
   v každé poptávce jako prázdný řádek „Website“. Prohlížeč do odeslání
   nezahrne pole bez atributu name, takže se past těsně před serializací
   odjmenuje. Čte se ještě předtím, past tím nepřestane fungovat.

   Bez JS se past odešle prázdná a v e-mailu zůstane prázdný řádek. Je to
   kosmetika, ne chyba — poptávka dojde celá.
   ========================================================================== */

var HP_FIELD = 'input[name="Website"]';
var HP_NAME = 'Website';
var MIN_TIME = 3000;

(function () {
  onReady(function () {
    var form = $1(SEL.form);
    if (!form) return;

    var loaded = Date.now();
    /* Odkaz se drží z načtení stránky: po odjmenování už past přes
       [name="Website"] nenajdeme. */
    var trap = $1(HP_FIELD, form);

    /* Capture fáze: posluchač na stejném prvku v capture běží dřív než ten,
       kterým si Webflow obsluhuje odeslání. stopImmediatePropagation ho pak
       vůbec nepustí ke slovu. */
    form.addEventListener(
      'submit',
      function (event) {
        var trapped = !!trap && trap.value.trim() !== '';
        var tooFast = Date.now() - loaded < MIN_TIME;

        /* Poptávka od člověka: past je prázdná a do e-mailu nemá co přidat. */
        if (!trapped && trap) trap.removeAttribute('name');
        if (!trapped && !tooFast) return;

        /* Odeslání neprojde, past se vrací zpátky pro další pokus. */
        if (trap) trap.setAttribute('name', HP_NAME);

        event.preventDefault();
        event.stopImmediatePropagation();
        push({ event: 'form_blocked', reason: trapped ? 'honeypot' : 'too_fast' });
      },
      true
    );
  });
})();
