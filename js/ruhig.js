// Animationen ausserhalb des sichtbaren Bereichs pausieren (spart Leistung auf schwachen Handys)
(function () {
  if (!("IntersectionObserver" in window)) return;
  function los() {
    var box = new Set();
    document.querySelectorAll("section,footer,svg").forEach(function (el) {
      if (!el.closest("section,footer") || el.tagName !== "svg") box.add(el);
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle("gb-off", !e.isIntersecting); });
    }, { rootMargin: "300px 0px" });
    box.forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", los); else los();
})();

// Beim Scrollen die aufwendigen Animationen im Sicherheits-Bereich kurz anhalten (verhindert Ruckler)
(function () {
  var t = 0, an = false;
  window.addEventListener("scroll", function () {
    var s = document.getElementById("sicher");
    if (!s) return;
    if (!an) { s.classList.add("gb-scr"); an = true; }
    clearTimeout(t);
    t = setTimeout(function () { s.classList.remove("gb-scr"); an = false; }, 160);
  }, { passive: true });
})();
