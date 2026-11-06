// Aktionsfarbe der Leiste sofort aus dem Zwischenspeicher setzen (kein blaues Aufblitzen beim Neuladen)
try { var c = JSON.parse(localStorage.getItem("gbPromo") || "null"), an = document.querySelector(".ann");
  if (c && c.farbe && c.bis && new Date() <= new Date(c.bis + "T23:59:59") && /^[a-z0-9]+$/.test(c.farbe) && an) an.className = "ann wait pa pf-" + c.farbe; } catch (e) { }
