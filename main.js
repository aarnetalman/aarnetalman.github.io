// Mobile menu: close on link click
document.querySelectorAll(".nav-mobile .menu a").forEach(a => {
  a.addEventListener("click", () => {
    const details = a.closest("details");
    if (details) details.open = false;
  });
});


