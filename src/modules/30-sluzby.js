/* ==========================================================================
   Služby — náhled fotky, který sleduje kurzor
   --------------------------------------------------------------------------
   Na počítači se u seznamu služeb ukáže fotka řádku pod kurzorem. Jedna
   fotka na jeden řádek — obrázek se bere přímo z prvku ve Webflow
   (.sluzby_photo uvnitř řádku), takže se ve Designeru vyměňuje jako každá
   jiná fotka a skript se o nic nestará.

   PODHOUBÍ PRO STŘÍDÁNÍ: když řádek dostane atribut data-photos se seznamem
   dalších URL oddělených čárkou, nákled je začne po PHOTO_INTERVAL střídat.
   Bez atributu (dnešní stav) drží jednu fotku. Zapíná se tedy obsahem, ne
   zásahem do kódu.

   Na tabletu a mobilu se nic z toho nespouští — fotka je tam pod řádkem
   natvrdo v layoutu (řídí Webflow) a kurzor neexistuje.
   ========================================================================== */

(function () {
  if (!has(SEL.sluzbyList) || !has(SEL.sluzbyPanel)) return;

  var PHOTO_INTERVAL = 500;
  var DESKTOP_MIN = 992;

  function photosOf(row) {
    var list = [];
    var main = $1('img', $1(SEL.sluzbyMedia, row) || row);
    if (main && main.currentSrc) list.push(main.currentSrc);
    else if (main && main.src) list.push(main.src);

    var extra = row.getAttribute('data-photos');
    if (extra) {
      extra.split(',').forEach(function (url) {
        var trimmed = url.trim();
        if (trimmed) list.push(trimmed);
      });
    }
    return list;
  }

  onReady(function () {
    var list = $1(SEL.sluzbyList);
    var panel = $1(SEL.sluzbyPanel);
    var image = $1('img', panel);
    var rows = $$(SEL.sluzbyRow, list);
    if (!image || !rows.length) return;

    var desktop = window.matchMedia('(min-width: ' + DESKTOP_MIN + 'px)');
    var timer = null;
    var frames = [];
    var index = 0;

    function show() {
      var url = frames[index % frames.length];
      if (url && image.getAttribute('src') !== url) image.setAttribute('src', url);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start(row) {
      stop();
      frames = photosOf(row);
      index = 0;
      if (!frames.length) return;
      show();
      /* Střídání se pouští jen když je fotek víc — jinak by interval běžel
         naprázdno a jen budil prohlížeč. */
      if (frames.length > 1 && ANIM) {
        timer = setInterval(function () {
          index += 1;
          show();
        }, PHOTO_INTERVAL);
      }
    }

    function active() {
      return desktop.matches && ANIM;
    }

    function open() {
      panel.style.opacity = '1';
      panel.style.transform = 'scale(1)';
    }

    function close() {
      stop();
      panel.style.opacity = '0';
      panel.style.transform = 'scale(0.94)';
    }

    list.addEventListener('mouseleave', close);

    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        if (!active()) return;
        start(row);
        open();
      });
    });

    list.addEventListener('mousemove', function (e) {
      if (!active()) return;
      var w = panel.offsetWidth;
      var h = panel.offsetHeight;
      panel.style.left = Math.max(8, Math.min(e.clientX - w / 2, window.innerWidth - w - 8)) + 'px';
      panel.style.top = Math.max(8, Math.min(e.clientY - h / 2, window.innerHeight - h - 8)) + 'px';
    });

    /* Přepnutí na užší okno musí náhled schovat, jinak by zůstal viset. */
    var onChange = function () {
      if (!desktop.matches) close();
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  });
})();
