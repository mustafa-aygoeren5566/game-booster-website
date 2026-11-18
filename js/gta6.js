(function () {
  var D = window.GTA6; if (!D) return;
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("karte");
  var VW = 1024, VH = 1024;
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  // ---------- Kartenkacheln (gtabase.com, mit Erlaubnis) ----------
  var kach = document.getElementById("kacheln"), HAT = {};
  Object.keys(D.kacheln).forEach(function (z) { HAT[z] = {}; D.kacheln[z].forEach(function (k) { HAT[z][k] = 1; }); });
  var basis = el("g", {}, kach), fein = el("g", {}, kach), feinZ = -1, feinKey = "", altZ = null, altT = 0, offen = 0;
  function weg() { if (altZ) { altZ.remove(); altZ = null; } }
  function fertig() { if (--offen <= 0) { offen = 0; clearTimeout(altT); altT = setTimeout(weg, 80); } }
  D.kacheln["0"].forEach(function (k) { var p = k.split("_"); el("image", { href: "img/gta6/0/" + k + ".jpg", x: p[0] * 256, y: p[1] * 256, width: 256.6, height: 256.6 }, basis); });
  function kacheln() {
    var r = rect(); if (!r.width) return;
    var px = r.width / vb.w * (window.devicePixelRatio || 1);
    var z = Math.max(1, Math.min(5, Math.ceil(Math.log2(px) - .2)));
    var g = 256 / Math.pow(2, z);
    var x0 = Math.floor(vb.x / g), x1 = Math.floor((vb.x + vb.w) / g), y0 = Math.floor(vb.y / g), y1 = Math.floor((vb.y + vb.h) / g);
    var key = z + ":" + x0 + ":" + x1 + ":" + y0 + ":" + y1; if (key === feinKey) return; feinKey = key;
    if (z !== feinZ) {
      // alte Stufe als Platzhalter behalten, bis die neue geladen ist (kein Blur-Flackern)
      var altG = fein; altG.removeAttribute("id");
      fein = el("g", {}, kach); feinZ = z; offen = 0;
      if (altZ) altZ.remove(); altZ = altG; kach.insertBefore(altG, fein);
      clearTimeout(altT); altT = setTimeout(weg, 2500);
    }
    var da = {}; Array.prototype.forEach.call(fein.children, function (i) { da[i.dataset.k] = i; });
    var soll = {};
    for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) {
      var k = x + "_" + y; if (z <= 3 ? !HAT[z][k] : !HAT[3][Math.floor(x / Math.pow(2, z - 3)) + "_" + Math.floor(y / Math.pow(2, z - 3))]) continue; soll[k] = 1;
      if (!da[k]) { var im = el("image", { href: "img/gta6/" + z + "/" + k + ".jpg", x: x * g, y: y * g, width: g * 1.004, height: g * 1.004 }, fein); im.dataset.k = k; offen++; im.addEventListener("load", fertig); im.addEventListener("error", function () { this.style.display = "none"; fertig(); }); }
    }
    Object.keys(da).forEach(function (k) { if (!soll[k]) da[k].remove(); });
  }

  // ---------- Zoom + Verschieben (viewBox) ----------
  var START = { x: 150, y: 190, w: 560 };
  var vb = { x: START.x, y: START.y, w: START.w, h: START.w };
  var pins = document.getElementById("pins");
  function verh() { var r = svg.getBoundingClientRect(); return r.width ? r.height / r.width : 1; }
  var plan = 0, altS = -1, rc = null;
  function rect() { if (!rc || !rc.width) rc = svg.getBoundingClientRect(); return rc; }
  window.addEventListener("resize", function () { rc = null; });
  window.addEventListener("scroll", function () { rc = null; }, { passive: true });
  var vbC = null, live = false, ruhe = 0;
  function setzen(schnell) {
    if (schnell) { live = true; clearTimeout(ruhe); ruhe = setTimeout(function () { live = false; setzen(); }, 160); }
    else live = false;
    if (!plan) plan = requestAnimationFrame(jetzt);
  }
  function jetzt() {
    plan = 0;
    var r = rect(), A = r.width ? r.height / r.width : 1;
    if (!isFinite(vb.x + vb.y + vb.w)) { vb.x = START.x; vb.y = START.y; vb.w = START.w; ziel = null; }
    vb.w = Math.max(12, Math.min(900, vb.w)); vb.h = vb.w * A;
    vb.x = Math.max(-100, Math.min(VW + 100 - vb.w, vb.x)); vb.y = Math.max(-100, Math.min(VH + 100 - vb.h, vb.y));
    if (live && vbC && r.width) {
      var k = vbC.w / vb.w, tx = (vbC.x - vb.x) / vb.w * r.width, ty = (vbC.y - vb.y) / vb.h * r.height;
      svg.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + k + ")"; return;
    }
    svg.style.transform = ""; vbC = { x: vb.x, y: vb.y, w: vb.w, h: vb.h };
    svg.setAttribute("viewBox", vb.x + " " + vb.y + " " + vb.w + " " + vb.h);
    var s = (r.width ? vb.w / r.width : 1) * (vb.w > 300 ? .62 : vb.w > 120 ? .8 : 1);
    if (Math.abs(s - altS) > 1e-9) { altS = s; Array.prototype.forEach.call(pins.children, function (g) { g.setAttribute("transform", "translate(" + g.dataset.x + "," + g.dataset.y + ") scale(" + s + ")"); }); }
    kacheln(); buendeln(r);
  }
  // ---------- Bündeln beim Rauszoomen (Zahlen-Kreise statt Icon-Haufen) ----------
  var haufen = document.getElementById("haufen"), bundKey = "", pinVer = 0;
  function farbe(n) { var t = Math.min(1, Math.log(n) / Math.log(150)); return "hsl(" + Math.round(95 - t * 70) + ",95%," + Math.round(62 - t * 4) + "%)"; }
  function buendeln(r) {
    if (!r.width) return;
    var proPx = vb.w / r.width, an = vb.w > 210;
    var zelle = an ? Math.pow(2, Math.ceil(Math.log2(78 * proPx))) : 0;
    var key = pinVer + ":" + zelle + ":" + (an ? Math.round(proPx * 1000) : 0);
    if (key === bundKey) return; bundKey = key;
    haufen.innerHTML = ""; pins.classList.toggle("bund", an);
    if (!an) return;
    var zellen = {};
    Array.prototype.forEach.call(pins.children, function (g) {
      g.classList.remove("solo");
      var x = +g.dataset.x, y = +g.dataset.y, k = Math.floor(x / zelle) + "_" + Math.floor(y / zelle);
      (zellen[k] = zellen[k] || []).push(g);
    });
    Object.keys(zellen).forEach(function (k) {
      var l = zellen[k];
      if (l.length < 3) { l.forEach(function (g) { g.classList.add("solo"); }); return; }
      var sx = 0, sy = 0; l.forEach(function (g) { sx += +g.dataset.x; sy += +g.dataset.y; });
      var cx = sx / l.length, cy = sy / l.length, rad = 13 + Math.min(12, Math.log(l.length) * 2.6), f = farbe(l.length);
      var g = el("g", { class: "hf", transform: "translate(" + cx + "," + cy + ") scale(" + proPx + ")", role: "button", tabindex: "0", "aria-label": l.length + " Orte, hineinzoomen" }, haufen);
      el("circle", { r: rad + 7, fill: f, class: "ha" }, g);
      el("circle", { r: rad, fill: f, stroke: "rgba(26,11,46,.55)", "stroke-width": 1.5, class: "hk" }, g);
      el("text", {}, g).textContent = l.length;
      function rein() { if (bewegt) return; fliegen(cx, cy, Math.max(60, vb.w / 3)); }
      g.addEventListener("click", rein);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") rein(); });
    });
  }
  window.addEventListener("resize", setzen);
  function zoom(f, cx, cy, schnell) {
    var r = rect();
    var px = vb.x + (cx - r.left) / r.width * vb.w, py = vb.y + (cy - r.top) / r.height * vb.h;
    var nw = Math.max(12, Math.min(900, vb.w * f)); f = nw / vb.w;
    vb.x = px - (px - vb.x) * f; vb.y = py - (py - vb.y) * f; vb.w = nw; setzen(schnell);
  }
  // weiches Zoomen: Ziel setzen, pro Frame hingleiten
  var ziel = null, animiert = 0;
  function weich(f, cx, cy) {
    var r = rect(); if (!r.width || !r.height) return;
    var b = ziel || { x: vb.x, y: vb.y, w: vb.w };
    var px = b.x + (cx - r.left) / r.width * b.w, py = b.y + (cy - r.top) / r.height * b.w * (r.height / r.width);
    var nw = Math.max(12, Math.min(900, b.w * f)); f = nw / b.w;
    ziel = { x: px - (px - b.x) * f, y: py - (py - b.y) * f, w: nw };
    if (!animiert) animiert = requestAnimationFrame(gleiten);
  }
  function gleiten() {
    animiert = 0; if (!ziel) return;
    var k = 0.2;
    vb.w += (ziel.w - vb.w) * k; vb.x += (ziel.x - vb.x) * k; vb.y += (ziel.y - vb.y) * k;
    if (Math.abs(ziel.w - vb.w) / ziel.w < 0.003) { vb.w = ziel.w; vb.x = ziel.x; vb.y = ziel.y; ziel = null; setzen(true); return; }
    setzen(true); animiert = requestAnimationFrame(gleiten);
  }
  svg.addEventListener("wheel", function (e) {
    e.preventDefault();
    var d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
    weich(Math.pow(1.0018, Math.max(-300, Math.min(300, d))), e.clientX, e.clientY);
  }, { passive: false });
  var zeiger = {}, start = null, bewegt = false;
  svg.addEventListener("pointerdown", function (e) { ziel = null; zeiger[e.pointerId] = [e.clientX, e.clientY]; start = null; bewegt = false; });
  svg.addEventListener("pointermove", function (e) {
    if (!zeiger[e.pointerId]) return;
    var ids = Object.keys(zeiger), alt = zeiger[e.pointerId];
    if (ids.length === 1) {
      var r = rect(), dx = e.clientX - alt[0], dy = e.clientY - alt[1];
      if (Math.abs(dx) + Math.abs(dy) > 2) { bewegt = true; svg.setPointerCapture(e.pointerId); svg.classList.add("zieht"); }
      vb.x -= dx / r.width * vb.w; vb.y -= dy / r.height * vb.h;
      zeiger[e.pointerId] = [e.clientX, e.clientY]; setzen(true);
    } else if (ids.length === 2) {
      zeiger[e.pointerId] = [e.clientX, e.clientY];
      var a = zeiger[ids[0]], b = zeiger[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (start) zoom(start / d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, true);
      start = d; bewegt = true;
    }
  });
  function los(e) { delete zeiger[e.pointerId]; start = null; svg.classList.remove("zieht"); clearTimeout(ruhe); setzen(); }
  svg.addEventListener("pointerup", los); svg.addEventListener("pointercancel", los);
  function mitte(f) { var r = rect(); weich(f, r.left + r.width / 2, r.top + r.height / 2); }
  document.getElementById("zplus").onclick = function () { mitte(1 / 1.4); };
  document.getElementById("zminus").onclick = function () { mitte(1.4); };
  document.getElementById("zreset").onclick = function () { vb.x = START.x; vb.y = START.y; vb.w = START.w; setzen(); };
  function fliegen(x, y, w) {
    var A = verh(), z0 = { x: vb.x, y: vb.y, w: vb.w }, z1 = { w: w, x: x - w / 2, y: y - w * A / 2 }, t0 = performance.now();
    (function schritt(t) {
      var k = Math.min(1, (t - t0) / 450); k = 1 - Math.pow(1 - k, 3);
      vb.w = z0.w + (z1.w - z0.w) * k; vb.x = z0.x + (z1.x - z0.x) * k; vb.y = z0.y + (z1.y - z0.y) * k; setzen();
      if (k < 1) requestAnimationFrame(schritt);
    })(t0);
  }

  // ---------- Punkte, Seitenleiste, Fortschritt ----------
  var aus = {}, erledigt = {}, suche = "";
  try { erledigt = JSON.parse(localStorage.getItem("gta6_erledigt") || "{}"); } catch (e) {}
  try { aus = JSON.parse(localStorage.getItem("gta6_aus") || "{}"); } catch (e) {}
  function speichern() { try { localStorage.setItem("gta6_erledigt", JSON.stringify(erledigt)); localStorage.setItem("gta6_aus", JSON.stringify(aus)); } catch (e) {} }
  var KAT = {}; D.kategorien.forEach(function (k) { KAT[k.id] = k; });
  function reg(id) { for (var i = 0; i < D.regionen.length; i++) if (D.regionen[i].id === id) return D.regionen[i]; }
  var info = document.getElementById("info");
  function zeige(pt, i) {
    var k = KAT[pt.k], re = reg(pt.r);
    info.hidden = false; info.innerHTML = "";
    var kopf = document.createElement("div"); kopf.className = "ikopf";
    kopf.innerHTML = '<span class="ic" style="background:' + k.farbe + '"><svg viewBox="0 0 24 24"><path d="' + k.icon + '"/></svg></span>';
    var tt = document.createElement("div"); var h = document.createElement("h3"); h.textContent = pt.n;
    var u = document.createElement("div"); u.className = "unter"; u.textContent = k.name + " · " + (re ? re.name : "");
    tt.appendChild(h); tt.appendChild(u); kopf.appendChild(tt);
    var x = document.createElement("button"); x.className = "izu"; x.setAttribute("aria-label", "Schließen");
    x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    x.onclick = function () { info.hidden = true; }; kopf.appendChild(x);
    var p = document.createElement("p"); p.textContent = pt.t || ""; if (!pt.t) p.hidden = true;
    var b = document.createElement("button"); b.className = "hak" + (erledigt["p" + i] ? " ok" : "");
    b.textContent = erledigt["p" + i] ? "Erledigt" : "Als erledigt markieren";
    b.onclick = function () { erledigt["p" + i] = !erledigt["p" + i]; speichern(); zeichnen(); zeige(pt, i); };
    info.appendChild(kopf); info.appendChild(p); info.appendChild(b);
  }
  function zeichnen() {
    pins.innerHTML = ""; altS = -1; pinVer++;
    D.punkte.forEach(function (pt, i) {
      if (aus[pt.k]) return;
      if (suche && pt.n.toLowerCase().indexOf(suche) < 0) return;
      var k = KAT[pt.k];
      var g = el("g", { class: "pin" + (erledigt["p" + i] ? " ok" : ""), tabindex: "0", role: "button", "aria-label": pt.n }, pins);
      g.dataset.x = pt.x; g.dataset.y = pt.y;
      el("title", {}, g).textContent = pt.n;
      el("rect", { x: -13, y: -13, width: 26, height: 26, rx: 7, stroke: k.farbe, class: "pform" }, g);
      el("rect", { x: -11, y: -11.5, width: 22, height: 9, rx: 5, fill: "rgba(255,255,255,.13)", "pointer-events": "none" }, g);
      el("path", { d: k.icon, transform: "translate(-8,-8) scale(.667)", class: "pico" }, g);
      function wahl() { if (bewegt) return; zeige(pt, i); }
      g.addEventListener("click", wahl);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") zeige(pt, i); });
    });
    // Seitenleiste-Zahlen
    D.kategorien.forEach(function (k) {
      var alle = D.punkte.map(function (p, i) { return [p, i]; }).filter(function (x) { return x[0].k === k.id; });
      var fertig = alle.filter(function (x) { return erledigt["p" + x[1]]; }).length;
      var z = document.getElementById("z-" + k.id); if (z) z.textContent = alle.length ? (fertig ? fertig + "/" : "") + alle.length : "bald";
    });
    setzen();
  }
  var liste = document.getElementById("kats");
  var letzteGr = "";
  D.kategorien.forEach(function (k) {
    if (k.gruppe !== letzteGr) {
      letzteGr = k.gruppe; var gname = letzteGr;
      var h = document.createElement("div"); h.className = "gr";
      h.innerHTML = '<span></span><button type="button" class="tg" role="switch"><i></i></button>';
      h.firstChild.textContent = gname;
      var tg = h.querySelector(".tg"); tg.setAttribute("aria-label", gname + " an oder aus"); tg.dataset.g = gname;
      tg.onclick = function () {
        var an = this.getAttribute("aria-checked") !== "true";
        D.kategorien.forEach(function (x) { if (x.gruppe === gname) aus[x.id] = !an; });
        syncKat(); speichern(); zeichnen();
      };
      liste.appendChild(h);
    }
    var n = D.punkte.filter(function (p) { return p.k === k.id; }).length;
    var b = document.createElement("button"); b.type = "button"; b.dataset.k = k.id;
    b.className = "kat" + (aus[k.id] ? "" : " an") + (n ? "" : " leer");
    b.innerHTML = '<span class="ic" style="color:' + k.farbe + '"><svg viewBox="0 0 24 24"><path d="' + k.icon + '"/></svg></span><span class="kn"></span><span class="kz" id="z-' + k.id + '"></span>';
    b.querySelector(".kn").textContent = k.name;
    b.onclick = function () { aus[k.id] = !aus[k.id]; syncKat(); speichern(); zeichnen(); };
    liste.appendChild(b);
  });
  function syncKat() {
    Array.prototype.forEach.call(liste.querySelectorAll(".kat"), function (b) { b.classList.toggle("an", !aus[b.dataset.k]); });
    Array.prototype.forEach.call(liste.querySelectorAll(".tg"), function (t) {
      var an = D.kategorien.some(function (x) { return x.gruppe === t.dataset.g && !aus[x.id]; });
      t.setAttribute("aria-checked", an ? "true" : "false");
    });
  }
  syncKat();
  document.getElementById("alle").onclick = function () {
    var irgendAus = D.kategorien.some(function (k) { return aus[k.id]; });
    D.kategorien.forEach(function (k) { aus[k.id] = !irgendAus; });
    syncKat(); speichern(); zeichnen();
  };
  var kbox = document.getElementById("kbox"), klapp = document.getElementById("klapp");
  function klappen(zu) { kbox.classList.toggle("zu", zu); klapp.setAttribute("aria-expanded", zu ? "false" : "true"); try { localStorage.setItem("gta6_zu", zu ? "1" : "0"); } catch (e) {} }
  var gemerkt = null; try { gemerkt = localStorage.getItem("gta6_zu"); } catch (e) {}
  klappen(gemerkt === null ? window.innerWidth < 860 : gemerkt === "1");
  klapp.onclick = function () { klappen(!kbox.classList.contains("zu")); };
  var such = document.getElementById("suche");
  such.addEventListener("input", function () {
    suche = such.value.trim().toLowerCase(); zeichnen();
    if (suche) { var t = D.punkte.filter(function (p) { return p.n.toLowerCase().indexOf(suche) >= 0 && !aus[p.k]; }); if (t.length === 1) { fliegen(t[0].x, t[0].y, 40); zeige(t[0], D.punkte.indexOf(t[0])); } }
  });
  // Regionen: Liste in der Seitenleiste, Klick = hinfliegen
  var rl = document.getElementById("regs");
  D.regionen.forEach(function (r) {
    var b = document.createElement("button"); b.type = "button"; b.className = "reg"; b.textContent = r.name; b.title = r.text;
    b.onclick = function () { fliegen(r.x, r.y, r.id === "vice" ? 120 : 200); }; rl.appendChild(b);
  });
  var A0 = verh(); if (A0 > 1) { START.w = 560 / A0 * 1.1; START.x = 430 - START.w / 2; } START.y = 480 - START.w * A0 / 2;
  vb.x = START.x; vb.y = START.y; vb.w = START.w;
  zeichnen();

  // ---------- Countdown ----------
  var cd = document.getElementById("countdown"), ziel = new Date(2026, 10, 19, 0, 0, 0).getTime();
  function tick() {
    var r = ziel - Date.now();
    if (r <= 0) { cd.innerHTML = "<b>GTA 6 ist draußen</b>"; return; }
    var s = Math.floor(r / 1000), z = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    Array.prototype.forEach.call(cd.querySelectorAll("b"), function (b, i) { b.textContent = String(z[i]).padStart(2, "0"); });
    setTimeout(tick, 1000);
  }
  tick();

  // ---------- Missionen ----------
  var m = document.getElementById("missionen");
  document.getElementById("mtext").textContent = D.missionen.text;
  D.missionen.kapitel.forEach(function (k, ki) {
    var box = document.createElement("div"); box.className = "kap";
    var h = document.createElement("h3"); h.textContent = k.name; box.appendChild(h);
    if (!k.liste.length) { var p = document.createElement("p"); p.className = "leer"; p.textContent = "Folgt nach dem Release."; box.appendChild(p); }
    k.liste.forEach(function (name, mi) {
      var id = "m" + ki + "_" + mi, l = document.createElement("label");
      var c = document.createElement("input"); c.type = "checkbox"; c.checked = !!erledigt[id];
      c.onchange = function () { erledigt[id] = c.checked; speichern(); };
      l.appendChild(c); l.appendChild(document.createTextNode(name)); box.appendChild(l);
    });
    m.appendChild(box);
  });
  document.getElementById("stand").textContent = D.stand;
})();
