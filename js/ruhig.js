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
