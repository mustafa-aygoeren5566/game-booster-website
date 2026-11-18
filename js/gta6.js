(function () {
  var D = window.GTA6; if (!D) return;
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("karte");
  var VW = 700, VH = 1050;
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }

  // ---------- eigene Karte: weiche Küste aus Stützpunkten + leichtes Rauschen ----------
  function rausch(i, s) { return Math.sin(i * .37 + s) * .9 + Math.sin(i * 1.13 + s * 2.1) * .5 + Math.sin(i * 2.9 + s * 3.7) * .25; }
  function kueste(pts, stark, seed, schritte) {
    var out = [], n = pts.length;
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (var t = 0; t < 1; t += 1 / schritte) {
        var t2 = t * t, t3 = t2 * t;
        var x = .5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        var y = .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        var k = out.length;
        out.push([x + rausch(k * .9, seed) * stark, y + rausch(k * .9, seed + 5) * stark]);
      }
    }
    return "M" + out.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("L") + "Z";
  }
  function oval(cx, cy, rx, ry, rot, seed, stark) {
    var p = []; for (var i = 0; i < 10; i++) { var a = i / 10 * 6.283; var c = Math.cos(rot), s = Math.sin(rot); var x = Math.cos(a) * rx, y = Math.sin(a) * ry; p.push([cx + x * c - y * s, cy + x * s + y * c]); }
    return kueste(p, stark || 1.2, seed, 6);
  }
  var FESTLAND = [[250,-40],[420,-40],[470,60],[520,140],[555,240],[585,350],[600,450],[590,540],[575,640],[560,730],[530,810],[480,870],[420,915],[360,935],[300,920],[250,880],[210,820],[170,740],[130,660],[100,580],[75,500],[52,420],[45,340],[60,270],[95,200],[140,130],[190,40]];
  var karte = document.getElementById("land");
  var wellen = el("path", { d: kueste(FESTLAND, 2.2, 1, 14), class: "ufer2" }, karte);
  el("path", { d: kueste(FESTLAND, 2.2, 1, 14), class: "ufer" }, karte);
  el("path", { d: kueste(FESTLAND, 2.2, 1, 14), class: "fest" }, karte);
  // Nehrungsinseln vor Vice City (Ocean Beach) und Inseln in der Bucht
  [[640, 520, 12, 70, .15], [650, 640, 9, 45, .1], [612, 455, 8, 30, .3], [590, 600, 14, 10, 0], [605, 560, 10, 8, 0], [575, 650, 12, 9, .4]].forEach(function (o, i) {
    el("path", { d: oval(o[0], o[1], o[2], o[3], o[4], 20 + i), class: "fest insel" }, karte);
  });
  // Leonida Keys
  var kx = [[330, 945], [295, 965], [258, 982], [222, 996], [186, 1010], [150, 1022], [116, 1032]];
  kx.forEach(function (p, i) { el("path", { d: oval(p[0], p[1], 20 - i, 6, -.35, 40 + i), class: "fest insel" }, karte); });
  el("polyline", { points: [[350, 930]].concat(kx).map(function (p) { return p.join(","); }).join(" "), class: "bruecke" }, karte);
  // Sumpf (Grassrivers): hellere Flächen + Wasserläufe
  [[300, 760, 120, 90, .2], [380, 830, 70, 50, -.3], [230, 700, 60, 70, .5]].forEach(function (o, i) { el("path", { d: oval(o[0], o[1], o[2], o[3], o[4], 60 + i, 6), class: "sumpf" }, karte); });
  ["M230 690q40 30 60 70t70 60q30 20 60 70", "M300 720q-20 40 10 80t-10 70", "M360 760q30-10 50 20t40 10"].forEach(function (d) { el("path", { d: d, class: "fluss" }, karte); });
  // Berge (Mount Kalaga): Schattierung
  [[260, 120, 90, 50, .2], [400, 150, 80, 45, -.2], [330, 60, 110, 40, 0]].forEach(function (o, i) { el("path", { d: oval(o[0], o[1], o[2], o[3], o[4], 80 + i, 5), class: "berg" }, karte); });
  // Lake Leonida
  el("path", { d: oval(395, 300, 55, 34, .1, 90, 3), class: "see" }, karte);
  // Stadtfläche Vice City
  el("path", { d: oval(560, 590, 55, 120, .05, 95, 5), class: "stadt" }, karte);
  // Straßen
  ["M545 700C560 600 575 450 545 300S470 80 460 -20", "M545 700C470 640 380 600 300 560S160 420 130 360", "M545 600C470 520 420 420 395 340", "M130 360C200 300 300 260 360 270", "M300 560C320 640 340 700 350 930"].forEach(function (d) { el("path", { d: d, class: "strasse" }, karte); });
  // Regionsnamen
  var namen = document.getElementById("namen");
  D.regionen.forEach(function (r) {
    var t = el("text", { x: r.x, y: r.y, class: "rname", "data-r": r.id }, namen); t.textContent = r.name.toUpperCase();
  });

  // ---------- Zoom + Verschieben (viewBox) ----------
  var vb = { x: 0, y: 0, w: VW, h: VH };
  var pins = document.getElementById("pins");
  function setzen() {
    var min = 70, m = .35;
    vb.w = Math.max(min, Math.min(VW * 1.15, vb.w)); vb.h = vb.w * VH / VW;
    vb.x = Math.max(-VW * m, Math.min(VW * (1 + m) - vb.w, vb.x)); vb.y = Math.max(-VH * .2, Math.min(VH * 1.2 - vb.h, vb.y));
    svg.setAttribute("viewBox", vb.x + " " + vb.y + " " + vb.w + " " + vb.h);
    var s = vb.w / VW;
    Array.prototype.forEach.call(pins.children, function (g) { g.setAttribute("transform", "translate(" + g.dataset.x + "," + g.dataset.y + ") scale(" + s + ")"); });
    namen.setAttribute("font-size", Math.max(9, 17 * s));
    namen.style.setProperty("--sw", (3 * s) + "px");
  }
  function zoom(f, cx, cy) {
    var r = svg.getBoundingClientRect();
    var px = vb.x + (cx - r.left) / r.width * vb.w, py = vb.y + (cy - r.top) / r.height * vb.h;
    var nw = Math.max(70, Math.min(VW * 1.15, vb.w * f)); f = nw / vb.w;
    vb.x = px - (px - vb.x) * f; vb.y = py - (py - vb.y) * f; vb.w = nw; setzen();
  }
  svg.addEventListener("wheel", function (e) { e.preventDefault(); zoom(e.deltaY > 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); }, { passive: false });
  var zeiger = {}, start = null, bewegt = false;
  svg.addEventListener("pointerdown", function (e) { zeiger[e.pointerId] = [e.clientX, e.clientY]; start = null; bewegt = false; });
  svg.addEventListener("pointermove", function (e) {
    if (!zeiger[e.pointerId]) return;
    var ids = Object.keys(zeiger), alt = zeiger[e.pointerId];
    if (ids.length === 1) {
      var r = svg.getBoundingClientRect(), dx = e.clientX - alt[0], dy = e.clientY - alt[1];
      if (Math.abs(dx) + Math.abs(dy) > 2) { bewegt = true; svg.setPointerCapture(e.pointerId); svg.classList.add("zieht"); }
      vb.x -= dx / r.width * vb.w; vb.y -= dy / r.height * vb.h;
      zeiger[e.pointerId] = [e.clientX, e.clientY]; setzen();
    } else if (ids.length === 2) {
      zeiger[e.pointerId] = [e.clientX, e.clientY];
      var a = zeiger[ids[0]], b = zeiger[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (start) zoom(start / d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      start = d; bewegt = true;
    }
  });
  function los(e) { delete zeiger[e.pointerId]; start = null; svg.classList.remove("zieht"); }
  svg.addEventListener("pointerup", los); svg.addEventListener("pointercancel", los);
  function mitte(f) { var r = svg.getBoundingClientRect(); zoom(f, r.left + r.width / 2, r.top + r.height / 2); }
  document.getElementById("zplus").onclick = function () { mitte(1 / 1.4); };
  document.getElementById("zminus").onclick = function () { mitte(1.4); };
  document.getElementById("zreset").onclick = function () { vb = { x: 0, y: 0, w: VW, h: VH }; setzen(); };
  function fliegen(x, y, w) {
    var z0 = { x: vb.x, y: vb.y, w: vb.w }, z1 = { w: w, x: x - w / 2, y: y - w * VH / VW / 2 }, t0 = performance.now();
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
    var u = document.createElement("div"); u.className = "unter"; u.textContent = k.name + " · " + (re ? re.name : "") + " · Lage ungefähr";
    tt.appendChild(h); tt.appendChild(u); kopf.appendChild(tt);
    var x = document.createElement("button"); x.className = "izu"; x.setAttribute("aria-label", "Schließen");
    x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    x.onclick = function () { info.hidden = true; }; kopf.appendChild(x);
    var p = document.createElement("p"); p.textContent = pt.t;
    var b = document.createElement("button"); b.className = "hak" + (erledigt["p" + i] ? " ok" : "");
    b.textContent = erledigt["p" + i] ? "Erledigt" : "Als erledigt markieren";
    b.onclick = function () { erledigt["p" + i] = !erledigt["p" + i]; speichern(); zeichnen(); zeige(pt, i); };
    info.appendChild(kopf); info.appendChild(p); info.appendChild(b);
  }
  function zeichnen() {
    pins.innerHTML = "";
    D.punkte.forEach(function (pt, i) {
      if (aus[pt.k]) return;
      if (suche && pt.n.toLowerCase().indexOf(suche) < 0) return;
      var k = KAT[pt.k];
      var g = el("g", { class: "pin" + (erledigt["p" + i] ? " ok" : ""), tabindex: "0", role: "button", "aria-label": pt.n }, pins);
      g.dataset.x = pt.x; g.dataset.y = pt.y;
      el("title", {}, g).textContent = pt.n;
      el("path", { d: "M0 0C-4-6-13-12-13-22a13 13 0 0 1 26 0C13-12 4-6 0 0z", fill: k.farbe, class: "pform" }, g);
      el("path", { d: k.icon, transform: "translate(-8,-30) scale(.667)", class: "pico" }, g);
      function wahl() { if (bewegt) return; zeige(pt, i); }
      g.addEventListener("click", wahl);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter") zeige(pt, i); });
    });
    // Seitenleiste-Zahlen
    D.kategorien.forEach(function (k) {
      var alle = D.punkte.map(function (p, i) { return [p, i]; }).filter(function (x) { return x[0].k === k.id; });
      var fertig = alle.filter(function (x) { return erledigt["p" + x[1]]; }).length;
      var z = document.getElementById("z-" + k.id); if (z) z.textContent = alle.length ? fertig + "/" + alle.length : "bald";
    });
    setzen();
  }
  var liste = document.getElementById("kats");
  D.kategorien.forEach(function (k) {
    var n = D.punkte.filter(function (p) { return p.k === k.id; }).length;
    var b = document.createElement("button"); b.type = "button";
    b.className = "kat" + (aus[k.id] ? "" : " an") + (n ? "" : " leer");
    b.innerHTML = '<span class="ic" style="background:' + k.farbe + '"><svg viewBox="0 0 24 24"><path d="' + k.icon + '"/></svg></span><span class="kn"></span><span class="kz" id="z-' + k.id + '"></span>';
    b.querySelector(".kn").textContent = k.name;
    b.onclick = function () { aus[k.id] = !aus[k.id]; b.classList.toggle("an", !aus[k.id]); speichern(); zeichnen(); };
    liste.appendChild(b);
  });
  document.getElementById("alle").onclick = function () {
    var irgendAus = D.kategorien.some(function (k) { return aus[k.id]; });
    D.kategorien.forEach(function (k) { aus[k.id] = !irgendAus; });
    Array.prototype.forEach.call(liste.children, function (b) { b.classList.toggle("an", irgendAus); });
    speichern(); zeichnen();
  };
  var such = document.getElementById("suche");
  such.addEventListener("input", function () {
    suche = such.value.trim().toLowerCase(); zeichnen();
    if (suche) { var t = D.punkte.filter(function (p) { return p.n.toLowerCase().indexOf(suche) >= 0 && !aus[p.k]; }); if (t.length === 1) { fliegen(t[0].x, t[0].y, 220); zeige(t[0], D.punkte.indexOf(t[0])); } }
  });
  // Regionen: Liste in der Seitenleiste, Klick = hinfliegen
  var rl = document.getElementById("regs");
  D.regionen.forEach(function (r) {
    var b = document.createElement("button"); b.type = "button"; b.className = "reg"; b.textContent = r.name; b.title = r.text;
    b.onclick = function () { fliegen(r.x, r.y, r.id === "vice" ? 260 : 380); }; rl.appendChild(b);
  });
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
