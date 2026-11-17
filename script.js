// Phone menu: close it after choosing a section, or when tapping elsewhere.
(function () {
  var menu = document.querySelector('.menu');
  if (!menu) return;
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { menu.open = false; });
  });
  document.addEventListener('click', function (e) {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
})();


// Light/dark switch. Follows the device setting until the visitor chooses,
// then remembers the choice. The <head> script applies a saved choice before
// the page is drawn, so there is no flash of the wrong theme.
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var paper = { light: '#f3f5f4', dark: '#111816' };

  function current() { return root.dataset.theme || (media.matches ? 'dark' : 'light'); }
  function sync() {
    var t = current();
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (root.dataset.theme) {
      document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', paper[t]); });
    }
  }
  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
  });
  if (media.addEventListener) media.addEventListener('change', sync);
  sync();
})();
