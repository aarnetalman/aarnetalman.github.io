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
