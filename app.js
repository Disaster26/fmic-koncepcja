/* FMIC.PL - wizualizacja. Koszyk, wyszukiwarka i filtry działają tylko jako podgląd (bez płatności i backendu). */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var zl = function (v) { return v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' zł'; };

  /* panel mobilny */
  var panel = $('#panel');
  function panelOtw(o) {
    if (!panel) return;
    panel.classList.toggle('otw', o);
    panel.setAttribute('aria-hidden', String(!o));
    $$('[data-otworz]').forEach(function (b) { b.setAttribute('aria-expanded', String(o)); });
    document.body.style.overflow = o ? 'hidden' : '';
  }
  $$('[data-otworz]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); panelOtw(true); }); });
  $$('[data-zamknij]').forEach(function (b) { b.addEventListener('click', function () { panelOtw(false); }); });
  if (panel) panel.addEventListener('click', function (e) { if (e.target === panel || e.target.closest('.panel-in a')) panelOtw(false); });

  /* mega menu */
  var mega = $('#mega'), mb = $('[data-mega]');
  if (mega && mb) {
    mb.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = !mega.classList.contains('otw');
      mega.classList.toggle('otw', o); mb.setAttribute('aria-expanded', String(o));
    });
    document.addEventListener('click', function (e) { if (!mega.contains(e.target)) { mega.classList.remove('otw'); mb.setAttribute('aria-expanded', 'false'); } });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { panelOtw(false); if (mega) mega.classList.remove('otw'); var f = $('#filtry'); if (f) f.classList.remove('otw'); }
  });

  /* koszyk (podgląd) */
  var licz = 0, suma = 0, toast = $('#toast'), tt;
  function dodaj(cena, ile) {
    licz += ile; suma += cena * ile;
    $('#licz').textContent = licz;
    $('#kwota').textContent = zl(suma);
    if (toast) {
      $('span', toast).textContent = 'Dodano do koszyka (' + zl(suma) + ')';
      toast.classList.add('widac'); clearTimeout(tt);
      tt = setTimeout(function () { toast.classList.remove('widac'); }, 2200);
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.dodaj, [data-dodaj]');
    if (!b) return;
    var c = parseFloat(b.getAttribute('data-dodaj') || b.getAttribute('data-cena')) || 0;
    var il = 1, inp = $('#il');
    if (inp && (b.hasAttribute('data-ilosc') || b.closest('.mob-pr'))) il = Math.max(1, parseInt(inp.value, 10) || 1);
    dodaj(c, il);
  });
  $$('[data-il]').forEach(function (b) {
    b.addEventListener('click', function () {
      var inp = $('#il'); inp.value = Math.max(1, (parseInt(inp.value, 10) || 1) + parseInt(b.getAttribute('data-il'), 10));
    });
  });

  /* marki - na telefonie rozwijane */
  var mw = $('[data-marki]');
  if (mw) mw.addEventListener('click', function () { $('#marki-l').classList.add('wszystkie'); });

  /* galeria */
  var duze = $('#duze');
  $$('.miniatury button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('.miniatury button').forEach(function (x) { x.classList.remove('akt'); });
      b.classList.add('akt'); duze.src = b.getAttribute('data-src');
    });
  });

  /* newsletter (podgląd) */
  $$('[data-news]').forEach(function (f) {
    f.addEventListener('submit', function () {
      var m = f.parentNode.querySelector('.news-msg');
      m.textContent = 'W wizualizacji zapis nie jest wysyłany.';
    });
  });

  /* filtry i sortowanie na liście kategorii */
  var lista = $('#lista');
  if (lista) {
    var karty = $$('.karta', lista), pusto = $('.pusto', lista);
    karty.forEach(function (k, i) { k.dataset.poz = i; });
    function filtruj() {
      var marki = $$('[data-f]:checked').map(function (c) { return c.value; });
      var od = parseFloat($('[data-od]').value), d0 = parseFloat($('[data-do]').value), n = 0;
      karty.forEach(function (k) {
        var c = parseFloat(k.dataset.cena), ok = (!marki.length || marki.indexOf(k.dataset.marka) > -1) && (isNaN(od) || c >= od) && (isNaN(d0) || c <= d0);
        k.hidden = !ok; if (ok) n++;
      });
      pusto.hidden = n > 0; $('#ile').textContent = n;
    }
    function sortuj() {
      var v = $('#sort').value;
      karty.slice().sort(function (a, b) {
        if (v === 'rosn') return a.dataset.cena - b.dataset.cena;
        if (v === 'mal') return b.dataset.cena - a.dataset.cena;
        return a.dataset.poz - b.dataset.poz;
      }).forEach(function (k) { lista.insertBefore(k, pusto); });
    }
    $$('[data-f],[data-od],[data-do]').forEach(function (x) { x.addEventListener('input', filtruj); });
    $('#sort').addEventListener('change', sortuj);
    var fb = $('[data-filtry]'), fp = $('#filtry');
    fb.addEventListener('click', function () { fp.classList.add('otw'); });
    $('[data-filtry-zamknij]').addEventListener('click', function () { fp.classList.remove('otw'); });
  }

  /* dolny pasek na telefonie - dopiero po przewinięciu za główny przycisk */
  var mob = $('#mob'), cel = $('.hero-cta') || $('#kup') || $('.kat-head');
  function pokaz(w) {
    if (!mob) return;
    mob.classList.toggle('widac', w);
    mob.setAttribute('aria-hidden', String(!w));
    $$('a,button', mob).forEach(function (a) { a.tabIndex = w ? 0 : -1; });
  }
  if (mob && cel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var e = en[0]; pokaz(!e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(cel);
  }
})();
