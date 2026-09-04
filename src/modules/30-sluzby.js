/* ==========================================================================
   Služby — fotka u řádku
   --------------------------------------------------------------------------
   POČÍTAČ: náhled sleduje kurzor a ukazuje fotku řádku pod ním.
   MOBIL A TABLET: kurzor neexistuje, takže fotku otevírá scroll — vždycky
   jen u jednoho řádku, u toho nejblíž ke čtené části obrazovky.

   Jedna fotka na jeden řádek. Obrázek se bere přímo z prvku ve Webflow
   (.sluzby_photo uvnitř řádku), takže se v Designeru vyměňuje jako každá
   jiná fotka a skript se o nic nestará.

   FOTKY CHODÍ Z CMS. V sekci je skrytý Collection List (třída .sluzby_feed,
   položky nesou data-sitem) s kolekcí Fotografie. Každá položka veze název
   služby (data-sname), všechny fotky (data-sphoto) a přepínač Střídat fotky.
   Řádek se spáruje podle nadpisu, takže se v CMS nic nečísluje ani neindexuje
   — Šimon jen založí položku se stejným názvem, jaký má služba na webu.

   PŘEPÍNAČ SE ČTE Z PODMÍNĚNÉ VIDITELNOSTI. Boolean pole se přes API na
   atribut navázat nedá (vrací prázdný seznam cílů), zato na viditelnost ano.
   Webflow vypnutý prvek nemaže, jen mu přidá třídu w-condition-invisible —
   a to se z JS pozná spolehlivě.

   Bez CMS položky si řádek vezme fotku, kterou má nastavenou přímo ve Webflow.
   Web tedy funguje i s prázdnou kolekcí.
   Bez atributu (dnešní stav) drží jednu fotku.

   Proč to na mobilu nepřeskakuje:
   1. Přepne se, až je jiný řádek blíž o SWITCH_MARGIN. Bez toho by stačil
      pixel scrollu a otevřený řádek by se měnil sem a tam.
   2. Zavírá se BEZ animace a se srovnáním scrollu, když je zavíraný řádek
      nad viewportem. Jinak by se obsah pod prstem posunul o výšku fotky.
   3. Poslední otevřený řádek zůstává otevřený, i když seznam odscrolluje
      pryč — jinak by se stránka zkrátila a scroll uskočil.
   ========================================================================== */

(function () {
  if (!has(SEL.sluzbyList)) return;

  var PHOTO_INTERVAL = 500;
  var DESKTOP_MIN = 992;

  /* Kam v okně míří „čtená" linka. 0.4 = o kus nad středem, kde oko sedí. */
  var FOCUS_LINE = 0.4;

  /* O kolik pixelů musí být nový řádek blíž, aby se přepnulo. */
  var SWITCH_MARGIN = 64;

  /* Podíl výšky okna, který zabere otevřená fotka. */
  var OPEN_RATIO = 0.42;

  /* Název služby z řádku i z CMS položky ve stejném tvaru, ať se dají
     porovnat. Webflow kolem textu nechává mezery a nezalomitelné mezery. */
  function key(value) {
    return String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  /* Přečte skrytý Collection List do mapy název → { photos, cycle }. */
  function readFeed() {
    var map = {};
    $$(SEL.sluzbyItem).forEach(function (item) {
      var nameEl = $1(SEL.sluzbyName, item);
      var name = key(nameEl && text(nameEl));
      if (!name) return;

      var photos = [];
      $$(SEL.sluzbyFeedPhoto, item).forEach(function (img) {
        var src = img.currentSrc || img.getAttribute('src');
        if (src) photos.push(src);
      });

      var flag = $1(SEL.sluzbyCycle, item);
      map[name] = {
        photos: photos,
        cycle: !!flag && !flag.classList.contains('w-condition-invisible')
      };
    });
    return map;
  }

  function entryFor(feed, row) {
    return feed[key(text($1('h3', row)))] || null;
  }

  function photosOf(feed, row) {
    var entry = entryFor(feed, row);
    if (entry && entry.photos.length) return entry.photos;

    /* Bez CMS položky zůstává fotka nastavená přímo na řádku ve Webflow. */
    var main = $1('img', $1(SEL.sluzbyMedia, row) || row);
    return main ? [main.currentSrc || main.src] : [];
  }

  function cyclesOf(feed, row) {
    var entry = entryFor(feed, row);
    return !!entry && entry.cycle;
  }

  onReady(function () {
    var list = $1(SEL.sluzbyList);
    var rows = $$(SEL.sluzbyRow, list);
    if (!rows.length) return;

    var feed = readFeed();

    var desktop = window.matchMedia('(min-width: ' + DESKTOP_MIN + 'px)');

    /* ---- náhled u kurzoru (počítač) ------------------------------------ */
    var panel = $1(SEL.sluzbyPanel);
    var panelImage = panel && $1('img', panel);
    var timer = null;
    var frames = [];
    var index = 0;

    function show() {
      var url = frames[index % frames.length];
      if (url && panelImage.getAttribute('src') !== url) panelImage.setAttribute('src', url);
    }

    function stopRotation() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startRotation(row) {
      stopRotation();
      frames = photosOf(feed, row);
      index = 0;
      if (!frames.length) return;
      show();
      /* Střídá se jen když si to služba v CMS vyžádala a fotek je víc. */
      if (cyclesOf(feed, row) && frames.length > 1 && ANIM) {
        timer = setInterval(function () {
          index += 1;
          show();
        }, PHOTO_INTERVAL);
      }
    }

    function hoverActive() {
      return desktop.matches && ANIM;
    }

    function closePanel() {
      stopRotation();
      if (!panel) return;
      panel.style.opacity = '0';
      panel.style.transform = 'scale(0.94)';
    }

    if (panel && panelImage) {
      list.addEventListener('mouseleave', closePanel);

      rows.forEach(function (row) {
        row.addEventListener('mouseenter', function () {
          if (!hoverActive()) return;
          startRotation(row);
          panel.style.opacity = '1';
          panel.style.transform = 'scale(1)';
        });
      });

      list.addEventListener('mousemove', function (e) {
        if (!hoverActive()) return;
        var w = panel.offsetWidth;
        var h = panel.offsetHeight;
        panel.style.left = Math.max(8, Math.min(e.clientX - w / 2, window.innerWidth - w - 8)) + 'px';
        panel.style.top = Math.max(8, Math.min(e.clientY - h / 2, window.innerHeight - h - 8)) + 'px';
      });
    }

    /* ---- otevírání scrollem (mobil a tablet) --------------------------- */
    var open = null;

    function mediaOf(row) {
      return $1(SEL.sluzbyMedia, row);
    }

    function openHeight() {
      return Math.round(window.innerHeight * OPEN_RATIO);
    }

    /** Zavře řádek. Když je nad viewportem, udělá to bez animace a o stejný
        kus posune scroll — změna výšky tak zůstane pro oko neviditelná. */
    function collapse(row) {
      var media = mediaOf(row);
      if (!media) return;

      var above = row.getBoundingClientRect().bottom < 0;
      var height = media.offsetHeight;

      if (above) {
        media.style.transition = 'none';
        media.style.height = '0px';
        window.scrollBy(0, -height);
        /* Přechod se vrací až po dokreslení, jinak by ho prohlížeč sloučil. */
        requestAnimationFrame(function () {
          media.style.transition = '';
        });
      } else {
        media.style.height = '0px';
      }

      var photo = $1('img', media);
      if (photo) photo.style.opacity = '0';
    }

    function expand(row) {
      var media = mediaOf(row);
      if (!media) return;
      media.style.height = openHeight() + 'px';
      var photo = $1('img', media);
      if (photo) photo.style.opacity = '1';
    }

    /** Řádek nejblíž čtené lince, s hysterezí proti přeblikávání. */
    function pick() {
      var line = window.innerHeight * FOCUS_LINE;
      var best = null;
      var bestDistance = Infinity;

      rows.forEach(function (row) {
        var title = $1('h3', row) || row;
        var rect = title.getBoundingClientRect();
        var distance = Math.abs(rect.top + rect.height / 2 - line);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = row;
        }
      });

      if (!best || best === open) return open;
      if (!open) return best;

      var openTitle = $1('h3', open) || open;
      var openRect = openTitle.getBoundingClientRect();
      var openDistance = Math.abs(openRect.top + openRect.height / 2 - line);

      /* Zůstává otevřený, dokud není jiný řádek zřetelně blíž. */
      return bestDistance < openDistance - SWITCH_MARGIN ? best : open;
    }

    function sync() {
      if (desktop.matches) return;

      var next = pick();
      if (!next || next === open) return;

      if (open) collapse(open);
      open = next;
      expand(open);
    }

    function reset() {
      rows.forEach(function (row) {
        var media = mediaOf(row);
        if (!media) return;
        media.style.transition = 'none';
        media.style.height = '';
        var photo = $1('img', media);
        if (photo) photo.style.opacity = '';
        requestAnimationFrame(function () {
          media.style.transition = '';
        });
      });
      open = null;
    }

    onScroll(sync);

    var onChange = function () {
      closePanel();
      reset();
      sync();
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  });
})();
