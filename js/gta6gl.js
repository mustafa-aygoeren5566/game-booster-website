(function () {
  // GTA-6-Karte mit WebGL (MapLibre GL): Kacheln und Pins zeichnet die Grafikkarte in einem Durchgang.
  // Weltkoordinaten der Daten: 0..1024. Diese Welt füllt das ganze Mercator-Quadrat.
  var D = window.GTA6; if (!D || !window.maplibregl) return;
  maplibregl.setWorkerUrl("js/maplibre-gl-csp-worker.js?v=471");
  var W = 1024;
  function ll(x, y) { var v = y / W; return [x / W * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * v))) * 180 / Math.PI]; }
  function xy(l) { var x = (l.lng + 180) / 360 * W, s = Math.sin(l.lat * Math.PI / 180), v = .5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI); return [x, v * W]; }

  // ---------- Farben wie im Spiel ----------
  var STIL = { "Style": "#f9a8d4", "Essen und Trinken": "#f9a8d4", "Waffen": "#f9a8d4", "Überfälle": "#4ade80", "Sammeln": "#fbbf24",
    "Fahrzeuge": "#60a5fa", "Dienste": "#cbd5e1", "Freizeit": "#5eead4", "Orte": "#c4b5fd", "Story": "#c4b5fd" };
  D.kategorien.forEach(function (k) { k.pfarbe = STIL[k.gruppe] || "#e5e7eb"; k.ifarbe = "#15111c"; k.farbe = k.pfarbe; });
  // wie im Spiel: Gang-Operationen und Gang-Hauptquartiere gelb (Geld-Orte bleiben gruen)
  // Farben aus ~2000 Stream-Kartenbildern gemessen (Pin-Farbe je Kategorie, aufgehellt)
  var KFARBE = { "gang-operation": "#facc15", "gang-compound": "#facc15", "ammu-nation": "#f1e0e2", "electronics": "#f1e0e2",
    "pay-n-spray": "#f1e0e2", "basketball": "#f1e0e2", "gym": "#b4c2ee", "fence": "#e88cb0", "collectible-card": "#c9b0f5",
    "vehicle-request": "#c9b0f5", "shooting-range": "#a6bde0", "gas-station": "#d6e0ea", "vehicle-mod-shop": "#f1e0e2", "playlist": "#b4c2ee", "story-v": "#a9c4f5" };
  D.kategorien.forEach(function (k) { if (KFARBE[k.id]) { k.pfarbe = KFARBE[k.id]; k.farbe = k.pfarbe; } });
  var HERZ = { clothing: 1, footwear: 1, haircut: 1, tattoo: 1, bar: 1, nightclub: 1, cinema: 1, "food-and-drink": 1 };
  D.kategorien.forEach(function (k) { if (HERZ[k.id]) { k.herz = 1; k.pfarbe = "#f1e0e2"; k.ifarbe = "#15111c"; k.farbe = "#ff5fa2"; } });
  // Motive nach Spiel-Vorbild selbst gezeichnet (24er-Raster)
  var MOTIV = {
    "ammu-nation": "M2.5 6.5h19v5h-9.5v2.2h-3.4L7.6 19.5H2.5zM8.8 11.5v1.4h1.6v-1.4z",
    "shooting-range": "M1.5 5.5h14v4h-7v2H6l-.8 5.5H1.5zM17.5 10.5a5 5 0 1 1-5 5h2.2a2.8 2.8 0 1 0 2.8-2.8z",
    "pay-n-spray": "M4 9.5h7.5V21H4zM5.5 6h4.5v3.5H5.5zM6.8 3.5h3V6h-3zM13 6.2l8-3.2v2.6l-6.6 2zM13 8.4l8 .4v2.6zM13 10.4l7 4.2-1.2 2.1z",
    "footwear": "M2 18v-5.2c0-.9.8-1.5 1.7-1.3L8 12.4l3.2-4.2 3 2.6c2 1.6 4.4 2.2 6.8 2.5.6.1 1 .6 1 1.2V18zM2 19.2h20V21H2z",
    "vehicle-mod-shop": "M12 3.2a8.8 8.8 0 1 1 0 17.6 8.8 8.8 0 1 1 0-17.6zM12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10zM10.8 1h2.4v3h-2.4zM10.8 20h2.4v3h-2.4zM1 10.8h3v2.4H1zM20 10.8h3v2.4h-3zM3.6 5.3l1.7-1.7 2.1 2.1-1.7 1.7zM16.6 18.3l1.7-1.7 2.1 2.1-1.7 1.7zM18.7 3.6l1.7 1.7-2.1 2.1-1.7-1.7zM5.7 16.6l1.7 1.7-2.1 2.1-1.7-1.7zM9.2 15v-2.3l1-2h3.6l1 2V15z",
    "vehicle-request": "M3.5 19.5v-6.2l2.2-6.3h12.6l2.2 6.3v6.2h-3.2v-2H6.7v2zM7.6 9l-1.3 4h11.4l-1.3-4zM5.6 15a1.3 1.3 0 1 0 2.6 0 1.3 1.3 0 1 0-2.6 0zM15.8 15a1.3 1.3 0 1 0 2.6 0 1.3 1.3 0 1 0-2.6 0z",
    "payday-loan": "M2 14.5h3.5l4.6 1.8h4.4c1.2 0 1.2 2 0 2H10.4v.6h5l5.2-3c1-.6 2.1.6 1.3 1.5L17 21.5H2zM13.5 2.5a5 5 0 1 1 0 10 5 5 0 1 1 0-10zM12.9 4.2v1.1c-1.1.2-1.8.9-1.8 1.8 0 1.1 1 1.5 2 1.7.7.2 1 .3 1 .7s-.4.6-1 .6c-.6 0-1-.2-1.4-.6l-.7.9c.5.4 1.1.6 1.9.7v1.1h1.3v-1.1c1.1-.2 1.8-.9 1.8-1.9 0-1.1-1-1.5-2-1.7-.7-.2-1-.3-1-.6s.3-.5.9-.5c.5 0 .9.1 1.2.4l.7-.9c-.5-.4-1-.6-1.6-.7V4.2z",
    "car-meet": "M3 21.5L7.2 8h9.6L21 21.5zM8.2 9.4v2.8h2.6V9.4zM13.2 9.4v2.8h2.6V9.4zM10.8 12.2V15h2.4v-2.8zM7.6 15v2.8h3.2V15zM13.2 15v2.8h3.4V15zM8 2.5h8V4l-2.8 2 2.8 2H8l2.8-2L8 4z"
  };
  D.kategorien.forEach(function (k) { if (MOTIV[k.id]) k.icon = MOTIV[k.id]; });
  D.kategorien.forEach(function (k) { if (k.id === "vehicle-request") { k.form = "rund"; k.pfarbe = "#c9b0f5"; }
    if (k.id === "meditation") { k.form = "rund"; k.pfarbe = "#c9b0f5"; k.farbe = k.pfarbe; }
    if (k.id === "garage") { k.pfarbe = "#4fd8b8"; k.farbe = k.pfarbe; k.icon = "M3.5 3.5h17v17h-17zM6 6v12h12V6zM8 8h8v2.2H8zM8 11h8v2.2H8zM8 14h8v2.2H8z"; }
    if (k.id === "safehouse") { k.pfarbe = "#5eead4"; k.farbe = k.pfarbe; }
    if (k.id === "car-meet") { k.pfarbe = "#2a2230"; k.ifarbe = "#ff8cc0"; k.farbe = "#ff8cc0"; }
    if (k.id === "gang-operation" || k.id === "gang-compound" || k.id === "payday-loan" || k.id === "smash-n-grab" || k.id === "bank") k.form = "okt"; });
  // wie im Spiel: Gang-Operationen mit "?" oben rechts (offen), abgehakt mit Haken
  D.kategorien.forEach(function (k) { if (k.id === "gang-operation" || k.id === "gang-compound") k.frage = 1; if (k.id === "fence") k.dollar = 1; });
  // Gang-Logos wie im Spiel (selbst gezeichnet): je Pin-ID ein Motiv, sonst Maske
  var GLOGO = {
    hahn: { d: "M13.5 4.5c.8-1 2-1.2 2.6-.4.8-.6 1.9-.2 1.7.8l-.6.6c.9.5 1.2 1.4 1 2.3l2 1-2 .7c-.2 1.6-.8 3-1.8 4.2.6 2-1 4.4-3.6 5.1l.4 2.4h1.6v1h-3.2l-.4-3.2h-.8l.2 3.2H7.6v-1h1.6l-.2-2.4C5.6 18 3.6 15.6 3.4 12.6 3 9.8 3.8 7.4 5.4 6c-.2 1.6.2 3 1 4 .2-2.2 1.2-4 2.8-5-.4 1.4-.2 2.8.4 3.8.4-1.4 1.2-2.4 2.4-3 .2.4.2 1 0 1.6.8-.6 1.4-1.4 1.5-2.9z", s: 1.05 },
    sense: { d: "M12 2.5c-3.8 2.2-6.5 6.6-6.5 11.5v7.5h13V14c0-4.9-2.7-9.3-6.5-11.5z", loch: "M12 8.6c-2.3 0-3.9 1.8-3.9 4.1 0 1.6.8 2.8 1.9 3.4v1.7h4v-1.7c1.1-.6 1.9-1.8 1.9-3.4 0-2.3-1.6-4.1-3.9-4.1z", d2: "M10.5 11.4a1.1 1.2 0 1 0 .01 0zM13.5 11.4a1.1 1.2 0 1 0 .01 0zM11.3 14.6h1.4l-.7 1z", s: 1.05 },
    kx: { kreis: 1, t: "Kx", f: 11, font: "italic 700 11px Georgia,serif" },
    kroko: { d: "M.5 15.5C2 10.8 6 8 11.5 8H16l2.4-3 2.4 3 3.2 1.2v3.6l-4.6.6-1.6 2.2H16l-1.2 3h-3.4l-1.2-3H8.4l-1.2 3H3.8l-1-3z", s: 1.1 },
    falter: { d: "M12 7.5c-.8 0-1 .9-1 1.7v8.3c0 .9.4 1.8 1 1.8s1-.9 1-1.8V9.2c0-.8-.2-1.7-1-1.7zM10.6 10.2C8.4 5.4 3.6 4.4 2.6 6.8S4.4 12.8 10.6 13zM13.4 10.2c2.2-4.8 7-5.8 8-3.4S19.6 12.8 13.4 13zM10.6 14.2c-3 0-6.2 1.4-5.2 3.8s4.2.8 5.2-2zM13.4 14.2c3 0 6.2 1.4 5.2 3.8s-4.2.8-5.2-2zM10.7 7.4L9 4.6M13.3 7.4L15 4.6", s: 1.18 },
    ptt: { t: "PTT", f: 11.5, w: 23 },
    tr: { t: "TR", f: 14, rund: 1 }, mw: { t: "MW", f: 13, rund: 1 }, kr: { t: "KR", f: 13, rund: 1 }, rk: { t: "RK", f: 13, rund: 1 }, yc: { t: "YC", f: 13, rund: 1 }, m7: { t: "M7", f: 15 }, s4s: { t: "S$", f: 15 }
  };
  var GANG = { "gang-operation-001": "kroko", "gang-operation-002": "kroko", "gang-operation-011": "falter", "gang-operation-042": "falter",
    "gang-compound-001": "ptt", "gang-operation-020": "ptt", "gang-operation-021": "ptt", "gang-operation-039": "ptt",
    "gang-operation-022": "hahn", "gang-operation-023": "hahn", "gang-operation-024": "hahn", "gang-operation-012": "sense", "gang-operation-013": "sense", "gang-operation-004": "kx", "gang-operation-005": "kx", "gang-operation-006": "kx", "gang-operation-008": "kx", "gang-operation-006": "kx", "gang-operation-007": "kx", "gang-operation-008": "kx",
    "fence-012": "tr", "fence-007": "mw", "fence-014": "kr", "fence-009": "rk", "fence-013": "yc",
    "gang-operation-009": "m7", "gang-operation-010": "m7",
    "gang-operation-015": "s4s", "gang-operation-016": "s4s", "gang-operation-017": "s4s", "gang-operation-018": "s4s", "gang-operation-019": "s4s" };
  function logoK(k, lg) { var o = Object.create(k); o.logo = GLOGO[lg]; if (o.logo.d) o.icon = o.logo.d; if (o.logo.rund) { o.pfarbe = "#c3efc0"; o.ifarbe = "#15111c"; o.herz = 0; } return o; }
  var PFORM = "M-8 -31h16a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4h-4.5L0 0l-3.5-8H-8a4 4 0 0 1-4-4v-15a4 4 0 0 1 4-4z";
  var RUNDF = "M0 0L4.3 -4.8A11.5 11.5 0 1 0 -4.3 -4.8z";
  var OKTF = "M-6.5 -33h13l5.5 5.5v11.5l-5.5 5.5h-3L0 0l-3.5-10.5h-3l-5.5-5.5v-11.5z";
  function formP(k) { return k.form === "okt" ? OKTF : (k.form === "rund" || (k.logo && k.logo.rund)) ? RUNDF : PFORM; }
  function formY(k) { return k.form === "okt" ? -30.6 : (k.form === "rund" || (k.logo && k.logo.rund)) ? -24.6 : -28.6; }
  var HERZD = "M9.5 -26.2c-2.6-1.9-4.4-3.4-4.4-5.3a2.3 2.3 0 0 1 4.4-1 2.3 2.3 0 0 1 4.4 1c0 1.9-1.8 3.4-4.4 5.3z";
  var HERZP = '<path d="' + HERZD + '" fill="#ff5fa2" stroke="#fff" stroke-width="1"/>';
  function pinSvg(k) {
    var st = k.ifarbe === "#fff" ? "#fff" : "#1a1216";
    return '<svg viewBox="-14 -35 30 37"><path d="' + formP(k) + '" fill="' + k.pfarbe + '" stroke="' + st + '" stroke-width="1.8" stroke-linejoin="round"/><path d="' + k.icon + '" transform="translate(-9.1,' + formY(k) + ') scale(.76)" style="fill:' + k.ifarbe + '"/>' + (k.herz ? HERZP : "") + (k.frage ? '<circle cx="10" cy="-30" r="4.6" fill="#1b1620" stroke="#fff" stroke-width="1"/><text x="10" y="-27.6" font-size="7" font-weight="900" text-anchor="middle" fill="#fff" font-family="Arial">?</text>' : "") + '</svg>';
  }
  var RICON = {
    kalaga: "M2 20l7-12 4 6 3-4 6 10z",
    ambrosia: "M3 21V11l5 3v-3l5 3V5h3v16zM18 21V8h3v13z",
    gellhorn: "M12 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM11 7h2v12c2.5-.4 4.5-2 5.4-4.2l-2.4.6 3.5-4.4 1.2 5.6-1.6-1.2C18 19 15.5 21 12 21s-6-2-7.1-5.6L3.3 16.6l1.2-5.6L8 15.4l-2.4-.6C6.5 17 8.5 18.6 11 19z",
    grass: "M11 3h2v12h-2zM6 7h2v8H6zM16 6h2v9h-2zM2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0 2 0 2 0v3c-2-2-4-2-6 0s-4 2-6 0-4-2-6 0-2 0-2 0z",
    vice: "M2 21V12h4V7h4v4h3V3h4v8h3v4h2v6z",
    keys: "M11 21c0-4 .6-8 2.2-11.2l1.7.7C13.5 13.6 13 17 13 21zM13.4 9.5C10.5 6.5 6.5 6 3 8c3.4-.4 6.6.4 9.6 2.6zM14 9c1-3.4 4.4-5.6 8.4-4.6-3.4.4-6.4 2-8 5zM2 21h20v1.5H2z"
  };

  // Pin-Bild für die Grafikkarte: gleiche Form wie das SVG, doppelte Auflösung
  var PR = 2, PS = 1.3;
  function abzeichen(g, ok) {
    g.beginPath(); g.arc(10, -30, 4.6, 0, 7); g.fillStyle = ok ? "#22c55e" : "#1b1620"; g.fill(); g.lineWidth = 1; g.strokeStyle = "#fff"; g.stroke();
    if (ok) { g.beginPath(); g.moveTo(7.8, -30); g.lineTo(9.4, -28.3); g.lineTo(12.3, -31.8); g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); }
    else { g.fillStyle = "#fff"; g.font = "900 7px Arial"; g.textAlign = "center"; g.fillText("?", 10, -27.6); }
  }
  function pinBild(k, ok) {
    var w = Math.ceil(30 * PS * PR), h = Math.ceil(37 * PS * PR), c = document.createElement("canvas"); c.width = w; c.height = h;
    var g = c.getContext("2d"); g.translate(14 * PS * PR, 35 * PS * PR); g.scale(PS * PR, PS * PR);
    var rund = k.logo && k.logo.rund, p = new Path2D(formP(k)); g.fillStyle = k.pfarbe; g.fill(p);
    g.lineWidth = 1.8; g.lineJoin = "round"; g.strokeStyle = k.ifarbe === "#fff" ? "#fff" : "#1a1216"; g.stroke(p);
    g.save(); g.translate(-9.1, formY(k)); g.scale(.76, .76); g.fillStyle = k.ifarbe; if (k.logo && k.logo.kreis) { g.beginPath(); g.arc(12, 12.5, 10.5, 0, 7); g.fill(); g.fillStyle = k.pfarbe; } if (k.logo && k.logo.t) { g.font = k.logo.font || ("900 " + k.logo.f + "px Arial"); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(k.logo.t, 12, 13, k.logo.w || 24); } else { if (k.logo && k.logo.s) { g.translate(12, 12); g.scale(k.logo.s, k.logo.s); g.translate(-12, -12); } g.fill(new Path2D(k.icon)); if (k.logo) { g.strokeStyle = k.ifarbe; g.lineWidth = 1.8; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(new Path2D(k.icon)); if (k.logo.loch) { g.fillStyle = k.pfarbe; g.fill(new Path2D(k.logo.loch)); g.fillStyle = k.ifarbe; g.fill(new Path2D(k.logo.d2)); } } } g.restore();
    if (k.frage) abzeichen(g, ok); else if (ok) { var hx = (rund || k.dollar || k.herz) ? -18.5 : 0; g.save(); g.translate(hx, 0); g.beginPath(); g.arc(10, -30, 4.6, 0, 7); g.fillStyle = "#22c55e"; g.fill(); g.lineWidth = 1; g.strokeStyle = "#fff"; g.stroke(); g.beginPath(); g.moveTo(7.8, -30); g.lineTo(9.4, -28.3); g.lineTo(12.3, -31.8); g.lineWidth = 1.5; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); g.restore(); }
    if (rund || (k.dollar && !k.logo)) { g.beginPath(); g.arc(8.5, -30, 4.4, 0, 7); g.fillStyle = "#86efac"; g.fill(); g.lineWidth = 1; g.strokeStyle = "#15111c"; g.stroke(); g.fillStyle = "#15111c"; g.font = "900 7px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", 8.5, -29.7); }
    if (k.herz) { var hz = new Path2D(HERZD); g.fillStyle = "#ff5fa2"; g.fill(hz); g.lineWidth = 1; g.strokeStyle = "#fff"; g.stroke(hz); }
    return g.getImageData(0, 0, w, h);
  }
  // Zahlen-Kreis für Bündel
  function farbe(n) { var t = Math.min(1, Math.log(n) / Math.log(150)); return "hsl(" + Math.round(95 - t * 70) + ",95%," + Math.round(62 - t * 4) + "%)"; }
  function haufenBild(n) {
    var rad = 13 + Math.min(12, Math.log(n) * 2.6), R = rad + 7, s = Math.ceil(R * 2 * PR) + 2, c = document.createElement("canvas"); c.width = c.height = s;
    var g = c.getContext("2d"); g.translate(s / 2, s / 2); g.scale(PR, PR);
    g.globalAlpha = .35; g.fillStyle = farbe(n); g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill();
    g.globalAlpha = 1; g.beginPath(); g.arc(0, 0, rad, 0, 7); g.fill(); g.lineWidth = 1.5; g.strokeStyle = "rgba(26,11,46,.55)"; g.stroke();
    g.fillStyle = "#1a0b2e"; g.font = "800 13px Inter, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(n), 0, 1);
    return g.getImageData(0, 0, s, s);
  }

  // ---------- Kacheln ----------
  // Daten-Stufe z (0..5, 256 px) = Kachel-Stufe z+2 der Grafikkarte. Stufe 6 = 512-px-Kacheln im Raster der Stufe 5.
  var HAT = {}; Object.keys(D.kacheln).forEach(function (z) { HAT[z] = {}; D.kacheln[z].forEach(function (k) { HAT[z][k] = 1; }); });
  function gibt(z, x, y) { if (z <= 3) return !!(HAT[z] && HAT[z][x + "_" + y]); var f = Math.pow(2, z - 3); return !!HAT[3][Math.floor(x / f) + "_" + Math.floor(y / f)]; }
  var LEER = null;
  function leer() {
    if (LEER) return Promise.resolve(LEER.slice(0));
    var c = document.createElement("canvas"); c.width = c.height = 1;
    return new Promise(function (ok) { c.toBlob(function (b) { b.arrayBuffer().then(function (a) { LEER = a; ok(a.slice(0)); }); }, "image/png"); });
  }
  maplibregl.addProtocol("gta", function (p, ab) {
    var m = p.url.split("://")[1].split("/"), z = +m[0], x = +m[1], y = +m[2], dz, u;
    if (m.length === 4) { dz = 6; if (!gibt(5, x, y)) return leer().then(function (a) { return { data: a }; }); u = "img/gta6/6/" + x + "_" + y + ".jpg?k=2"; }
    else { dz = z - 2; if (dz < 0 || !gibt(dz, x, y)) return leer().then(function (a) { return { data: a }; }); u = "img/gta6/" + dz + "/" + x + "_" + y + ".jpg?k=2"; }
    return fetch(u, { signal: ab.signal }).then(function (r) { return r.ok ? r.arrayBuffer() : leer(); }).then(function (a) { return { data: a }; });
  });

  // ---------- Zustand ----------
  var aus = {}, erledigt = {}, suche = "";
  try { erledigt = JSON.parse(localStorage.getItem("gta6_erledigt") || "{}"); } catch (e) {}
  try { aus = JSON.parse(localStorage.getItem("gta6_aus") || "{}"); } catch (e) {}
  function speichern() { try { localStorage.setItem("gta6_erledigt", JSON.stringify(erledigt)); localStorage.setItem("gta6_aus", JSON.stringify(aus)); } catch (e) {} }
  var KAT = {}; D.kategorien.forEach(function (k) { KAT[k.id] = k; });
  function reg(id) { for (var i = 0; i < D.regionen.length; i++) if (D.regionen[i].id === id) return D.regionen[i]; }

  // ---------- Karte ----------
  var box = document.getElementById("karte");
  var RAST = { "raster-saturation": -.62, "raster-brightness-max": .93, "raster-contrast": .05, "raster-fade-duration": 0 };
  var map = new maplibregl.Map({
    container: box, attributionControl: false, renderWorldCopies: false, dragRotate: false, pitchWithRotate: false, touchPitch: false,
    minZoom: 1, maxZoom: 9, fadeDuration: 0, refreshExpiredTiles: false, cancelPendingTileRequestsWhileZooming: false, maxTileCacheSize: 4000,
    center: ll(512, 560), zoom: 2.4,
    style: {
      version: 8,
      sources: {
        grund: { type: "raster", tiles: ["gta://{z}/{x}/{y}"], tileSize: 256, minzoom: 2, maxzoom: 7 },
        fein: { type: "raster", tiles: ["gta://6/{x}/{y}/512"], tileSize: 512, minzoom: 7, maxzoom: 7 }
      },
      layers: [
        { id: "meer", type: "background", paint: { "background-color": "#577985" } },
        { id: "grund", type: "raster", source: "grund", paint: RAST },
        { id: "fein", type: "raster", source: "fein", minzoom: 6.3, paint: RAST }
      ]
    }
  });
  map.touchZoomRotate.disableRotation(); map.keyboard.disableRotation();
  // fein = Kachel-Stufe 7 mit 512 px: Adresse "gta://6/x/y/512" (eigener Zweig im Protokoll)
  window.gtaKarte = map; window.gtaFliegen = function (x, y, w) { fliegen(x, y, w); };
  // weiches Mausrad-Zoomen: Zielzoom sammeln, pro Frame sanft annähern, Punkt unter Maus bleibt fest
  map.scrollZoom.disable();
  var zZiel = null, zPunkt = null, zLL = null, zRaf = 0;
  box.addEventListener("wheel", function (e) {
    e.preventDefault();
    var r = box.getBoundingClientRect();
    zPunkt = [e.clientX - r.left, e.clientY - r.top]; zLL = map.unproject(zPunkt);
    var d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    d = Math.max(-300, Math.min(300, d));
    var basis = zZiel == null ? map.getZoom() : zZiel;
    zZiel = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), basis - d / 220));
    if (!zRaf) zRaf = requestAnimationFrame(radSchritt);
  }, { passive: false });
  function radSchritt() {
    zRaf = 0; if (zZiel == null) return;
    var z = map.getZoom(), n = z + (zZiel - z) * 0.3;
    if (Math.abs(zZiel - n) < 0.003) n = zZiel;
    map.jumpTo({ zoom: n });
    var p = map.project(zLL), c = map.project(map.getCenter());
    map.jumpTo({ center: map.unproject([c.x + p.x - zPunkt[0], c.y + p.y - zPunkt[1]]) });
    if (n !== zZiel) zRaf = requestAnimationFrame(radSchritt); else zZiel = null;
  }
  map.on("mousedown", function () { zZiel = null; });

  function zoomFuer(w) { var b = box.getBoundingClientRect().width || 1000; return Math.log2(2 * b / w); }
  function fliegen(x, y, w) {
    zZiel = null; map.stop();
    var zz = Math.min(map.getMaxZoom(), zoomFuer(w)), ziel = ll(x, y);
    var r = box.getBoundingClientRect(), p = map.project(ziel), weit = Math.hypot(p.x - r.width / 2, p.y - r.height / 2) / Math.max(r.width, 1);
    if (weit > 1.2) {
      // weite Strecke: kurz raus, rüber, rein (gezoomt über die Karte schieben würde nur ungeladene Kacheln zeigen)
      map.flyTo({ center: ziel, zoom: zz, curve: 1.5, speed: 2.2, essential: true });
    } else {
      var dz = Math.abs(zz - map.getZoom());
      map.easeTo({ center: ziel, zoom: zz, duration: Math.min(900, 380 + dz * 110), easing: function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }, essential: true });
    }
  }
  function ganz(sofort) {
    // Landfläche aus den Kacheln gemessen (inkl. Inseln), damit die Insel mittig sitzt
    var x0 = 214, x1 = 584, y0 = 218, y1 = 747;
    var r = box.getBoundingClientRect(), offen = !kbox.classList.contains("zu") && r.width > 700;
    var a = ll(x0, y1), b = ll(x1, y0);
    map.fitBounds([a, b], { padding: { top: 20, bottom: 20, right: 20, left: offen ? 336 : 20 }, duration: sofort ? 0 : 600 });
  }

  // ---------- Daten für die Grafikkarte ----------
  function punkteGeo() {
    var f = [];
    D.punkte.forEach(function (pt, i) {
      if (aus[pt.k]) return;
      if (suche && pt.n.toLowerCase().indexOf(suche) < 0) return;
      f.push({ type: "Feature", id: i, geometry: { type: "Point", coordinates: ll(pt.x, pt.y) }, properties: { i: i, k: "p-" + pt.k + (GANG[pt.id] ? "~" + GANG[pt.id] : "") + (erledigt["p" + i] && KAT[pt.k] ? "-ok" : ""), ok: erledigt["p" + i] ? 1 : 0 } });
    });
    return { type: "FeatureCollection", features: f };
  }
  function bezirkeGeo() {
    return { type: "FeatureCollection", features: (D.bezirke || []).map(function (b, j) {
      return { type: "Feature", id: j, properties: { name: b.name }, geometry: { type: "MultiPolygon", coordinates: b.ringe.map(function (r) { return [r.map(function (p) { return ll(p[0], p[1]); })]; }) } };
    }) };
  }
  var bereit = false, gestartet = false;
  map.on("styleimagemissing", function (e) {
    var id = e.id;
    if (id.indexOf("n-") === 0) map.addImage(id, haufenBild(+id.slice(2)), { pixelRatio: PR });
  });
  function init() {
    if (gestartet || !map.isStyleLoaded()) return; gestartet = true;
    D.kategorien.forEach(function (k) { map.addImage("p-" + k.id, pinBild(k), { pixelRatio: PR }); map.addImage("p-" + k.id + "-ok", pinBild(k, true), { pixelRatio: PR }); });
    Object.keys(GLOGO).forEach(function (lg) { ["gang-operation", "gang-compound", "fence"].forEach(function (kid) { if (!KAT[kid]) return; var kk = logoK(KAT[kid], lg); map.addImage("p-" + kid + "~" + lg, pinBild(kk), { pixelRatio: PR }); map.addImage("p-" + kid + "~" + lg + "-ok", pinBild(kk, true), { pixelRatio: PR }); }); });
    map.addSource("bez", { type: "geojson", data: bezirkeGeo() });
    map.addLayer({ id: "bez-fl", type: "fill", source: "bez", paint: { "fill-color": "#fff", "fill-opacity": ["case", ["boolean", ["feature-state", "an"], false], .06, 0] } });
    map.addLayer({ id: "bez-rand", type: "line", source: "bez", paint: { "line-color": "#fff", "line-width": 1.4, "line-opacity": ["case", ["boolean", ["feature-state", "an"], false], .9, .22] } });
    map.addSource("orte", { type: "geojson", data: punkteGeo(), cluster: true, clusterRadius: 30, clusterMaxZoom: 8, clusterMinPoints: 4 });
    map.addLayer({ id: "haufen", type: "symbol", source: "orte", filter: ["has", "point_count"],
      layout: { "icon-image": ["concat", "n-", ["to-string", ["get", "point_count"]]], "icon-allow-overlap": true, "icon-ignore-placement": true } });
    map.addLayer({ id: "pins", type: "symbol", source: "orte", filter: ["!", ["has", "point_count"]],
      layout: { "icon-image": ["get", "k"], "icon-anchor": "bottom", "icon-allow-overlap": true, "icon-ignore-placement": true,
        "icon-size": ["interpolate", ["linear"], ["zoom"], 3, .5, 4.5, .62, 6, .75, 7.5, .9],
        "symbol-sort-key": ["-", 0, ["get", "i"]] },
      paint: { "icon-opacity": ["case", ["==", ["get", "ok"], 1], .45, 1] } });
    bereit = true; zahlen();
    ganz(true);
    // Zoomgrenzen fest aus der Kartenwelt (nicht aus der Ansicht): raus bis knapp über Gesamtansicht, rein bis feinste Kachel
    // keine harte maxBounds (würde die Gesamtansicht nach links drücken): Mitte nach dem Verschieben sanft zurück aufs Land
    map.on("moveend", function () {
      if (map.isEasing && map.isEasing()) return;
      var c = map.getCenter(), x = (c.lng + 180) / 360 * 1024, y = 1024 * (1 - Math.log(Math.tan(Math.PI / 4 + c.lat * Math.PI / 360)) / Math.PI) / 2;
      var nx = Math.max(214, Math.min(586, x)), ny = Math.max(218, Math.min(747, y));
      if (nx !== x || ny !== y) map.easeTo({ center: ll(nx, ny), duration: 350 });
    });
    var cam = map.cameraForBounds([ll(280, 1000), ll(780, 40)], { padding: 20 });
    map.setMinZoom(Math.max(1, ((cam && cam.zoom) || 2.5) - 0.4));
    map.setMaxZoom(7.6);
    regionsMarken();
    // Grundstufen in den Browser-Cache holen (klein), damit Rauszoomen nie lädt
    setTimeout(function () { [0, 1, 2, 3, 4].forEach(function (z) { cachen(z); }); }, 800);
  }
  map.on("style.load", init); map.on("styledata", init); map.on("load", init);
  function cachen(z) {
    if (!window.fetch || (navigator.connection && navigator.connection.saveData)) return;
    var liste = [];
    if (z <= 3) liste = D.kacheln[z] ? D.kacheln[z].slice() : [];
    else D.kacheln["3"].forEach(function (k) { var p = k.split("_"); for (var a = 0; a < 2; a++) for (var b = 0; b < 2; b++) liste.push((p[0] * 2 + a) + "_" + (p[1] * 2 + b)); });
    var aktiv = 0;
    (function weiter() { while (aktiv < 3 && liste.length) { aktiv++; fetch("img/gta6/" + z + "/" + liste.shift() + ".jpg?k=2", { priority: "low" }).catch(function () {}).then(function () { aktiv--; weiter(); }); } })();
  }
  // Kacheln rund um die Ansicht vorladen, damit beim Ziehen nichts leer nachkommt
  var vorGes = {}, vorT = 0;
  function vorladen() {
    if (!window.fetch || (navigator.connection && navigator.connection.saveData)) return;
    var b = map.getBounds(), zm = map.getZoom(), dl = (b.getEast() - b.getWest()) * .6, dn = (b.getNorth() - b.getSouth()) * .6;
    function tx(lon, z) { return Math.floor((lon + 180) / 360 * Math.pow(2, z)); }
    function ty(lat, z) { var r = lat * Math.PI / 180; return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z)); }
    function ring(z, url, ok) {
      var x0 = tx(b.getWest() - dl, z), x1 = tx(b.getEast() + dl, z), y0 = ty(Math.min(85, b.getNorth() + dn), z), y1 = ty(Math.max(-85, b.getSouth() - dn), z), n = 0;
      for (var x = x0; x <= x1; x++) for (var y = y0; y <= y1; y++) { if (n > 60) return; if (!ok(x, y)) continue; var u = url(x, y); if (vorGes[u]) continue; vorGes[u] = 1; n++; fetch(u, { priority: "low" }).catch(function () {}); }
    }
    var z = Math.min(7, Math.max(2, Math.floor(zm) + 1));
    ring(z, function (x, y) { return "img/gta6/" + (z - 2) + "/" + x + "_" + y + ".jpg?k=2"; }, function (x, y) { return gibt(z - 2, x, y); });
    if (zm >= 6) ring(7, function (x, y) { return "img/gta6/6/" + x + "_" + y + ".jpg?k=2"; }, function (x, y) { return gibt(5, x, y); });
  }
  map.on("move", function () { var t = Date.now(); if (t - vorT > 250) { vorT = t; vorladen(); } });
  map.on("moveend", vorladen);
  function neuDaten() { if (bereit) map.getSource("orte").setData(punkteGeo()); zahlen(); }
  function zahlen() {
    D.kategorien.forEach(function (k) {
      var alle = 0, ok = 0; D.punkte.forEach(function (p, i) { if (p.k === k.id) { alle++; if (erledigt["p" + i]) ok++; } });
      var z = document.getElementById("z-" + k.id); if (z) z.textContent = alle ? (ok ? ok + "/" : "") + alle : "bald";
    });
  }

  // ---------- Regions-Icons (wenige, als HTML über der Karte) ----------
  function imPoly(x, y, r) { var drin = false; for (var i = 0, k = r.length - 1; i < r.length; k = i++) if ((r[i][1] > y) !== (r[k][1] > y) && x < (r[k][0] - r[i][0]) * (y - r[i][1]) / (r[k][1] - r[i][1]) + r[i][0]) drin = !drin; return drin; }
  function bezirkBei(x, y) { var B = D.bezirke || []; for (var i = 0; i < B.length; i++) for (var j = 0; j < B[i].ringe.length; j++) if (imPoly(x, y, B[i].ringe[j])) return i; return -1; }
  var hell = -1;
  function hervor(j) { if (j === hell || !bereit) return; if (hell >= 0) map.setFeatureState({ source: "bez", id: hell }, { an: false }); hell = j; if (j >= 0) map.setFeatureState({ source: "bez", id: j }, { an: true }); }
  var marken = [];
  function regionsMarken() {
    D.regionen.forEach(function (r) {
      var e = document.createElement("button"); e.type = "button"; e.className = "glrm"; e.setAttribute("aria-label", "Region " + r.name);
      e.innerHTML = '<span class="rb"><svg viewBox="0 0 24 24"><path d="' + (RICON[r.id] || RICON.vice) + '"/></svg></span><span class="rt"></span>';
      e.querySelector(".rt").textContent = r.name; e.dataset.tip = r.name; e.dataset.tip2 = r.text;
      var bz = bezirkBei(r.x, r.y);
      e.addEventListener("mouseenter", function () { hervor(bz); }); e.addEventListener("mouseleave", function () { hervor(-1); });
      e.addEventListener("click", function () { fliegen(r.x, r.y, r.id === "vice" ? 120 : 200); });
      marken.push(new maplibregl.Marker({ element: e, anchor: "top", offset: [0, -17] }).setLngLat(ll(r.x, r.y)).addTo(map));
    });
    function sicht() { var z = map.getZoom(), weg = z > 4.6; marken.forEach(function (m) { m.getElement().classList.toggle("weg", weg); }); }
    map.on("zoom", sicht); sicht();
  }

  // ---------- Tooltip ----------
  var tip = document.createElement("div"); tip.id = "tip"; tip.innerHTML = "<b></b><span></span>"; document.body.appendChild(tip);
  var tipKey = null, zieht = false;
  function tipZeig(key, a, b, f, e) {
    if (key !== tipKey) { tipKey = key; tip.firstChild.textContent = a; tip.lastChild.textContent = b || ""; tip.lastChild.style.display = b ? "" : "none"; tip.lastChild.style.color = f || ""; tip.classList.add("an"); }
    var x = e.clientX + 14, y = e.clientY + 16, w = tip.offsetWidth, h = tip.offsetHeight;
    if (x + w > innerWidth - 8) x = e.clientX - w - 14; if (y + h > innerHeight - 8) y = e.clientY - h - 12;
    tip.style.transform = "translate(" + x + "px," + y + "px)";
  }
  function tipWeg() { if (tipKey !== null) { tip.classList.remove("an"); tipKey = null; } }
  map.on("dragstart", function () { zieht = true; tipWeg(); }); map.on("dragend", function () { zieht = false; });
  var mmEv = null, mmAn = false;
  map.on("mousemove", function (ev) { mmEv = ev; if (!mmAn) { mmAn = true; requestAnimationFrame(function () { mmAn = false; mausBei(mmEv); }); } });
  function mausBei(ev) {
    if (!bereit || zieht || map.isMoving()) return;
    var f = map.queryRenderedFeatures(ev.point, { layers: ["pins", "haufen"] })[0], e = ev.originalEvent;
    map.getCanvas().style.cursor = f ? "pointer" : "";
    if (f && f.layer.id === "pins") { var pt = D.punkte[f.properties.i], k = KAT[pt.k]; hervor(-1); return tipZeig("p" + f.properties.i, pt.n, k.name, k.farbe, e); }
    if (f) { hervor(-1); return tipZeig("h" + f.properties.cluster_id, f.properties.point_count + " Orte", "Klicken zum Hineinzoomen", "", e); }
    var w = xy(ev.lngLat), j = bezirkBei(w[0], w[1]); hervor(j);
    if (j >= 0) tipZeig("b" + j, D.bezirke[j].name, "", "", e); else tipWeg();
  }
  map.getCanvas().addEventListener("mouseleave", function () { tipWeg(); hervor(-1); });
  document.addEventListener("pointermove", function (e) {
    var t = e.target.closest && e.target.closest("[data-tip]");
    if (!t) { if (tipKey && tipKey.charAt(0) === "d") tipWeg(); return; }
    tipZeig("d" + (t.dataset.tip || ""), t.dataset.tip, t.dataset.tip2, t.dataset.tipf, e);
  }, { passive: true });
  map.on("click", function (ev) {
    var f = map.queryRenderedFeatures(ev.point, { layers: ["pins", "haufen"] })[0];
    if (!f) return;
    if (f.layer.id === "pins") { var i = f.properties.i; zeige(D.punkte[i], i); return; }
    map.getSource("orte").getClusterExpansionZoom(f.properties.cluster_id).then(function (z) { map.easeTo({ center: f.geometry.coordinates, zoom: Math.max(z, map.getZoom() + 1.2), duration: 450 }); });
  });

  // ---------- Infobox ----------
  var info = document.getElementById("info");
  function zeige(pt, i) {
    var k = KAT[pt.k], re = reg(pt.r), ok = !!erledigt["p" + i];
    info.hidden = false; info.innerHTML = ""; info.style.setProperty("--kf", k.farbe);
    info.classList.remove("pop"); void info.offsetWidth; info.classList.add("pop");
    var kopf = document.createElement("div"); kopf.className = "ikopf";
    var kb = GANG[pt.id] ? logoK(k, GANG[pt.id]) : k, cv = document.createElement("canvas"), bd = pinBild(kb, ok); cv.width = bd.width; cv.height = bd.height; cv.getContext("2d").putImageData(bd, 0, 0);
    kopf.innerHTML = '<span class="ic iic gp"><img alt="" style="width:100%;height:100%;object-fit:contain" src="' + cv.toDataURL() + '"></span>';
    var tt = document.createElement("div"); var h = document.createElement("h3"); h.textContent = pt.n;
    var chips = document.createElement("div"); chips.className = "chips";
    var c1 = document.createElement("span"); c1.className = "chip kc"; c1.textContent = k.name; chips.appendChild(c1);
    if (re) { var c2 = document.createElement("span"); c2.className = "chip"; c2.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + (RICON[re.id] || "") + '"/></svg>'; c2.appendChild(document.createTextNode(re.name)); chips.appendChild(c2); }
    tt.appendChild(h); tt.appendChild(chips); kopf.appendChild(tt);
    var x = document.createElement("button"); x.className = "izu"; x.setAttribute("aria-label", "Schließen");
    x.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
    x.onclick = function () { info.hidden = true; }; kopf.appendChild(x);
    var p = document.createElement("p"); p.textContent = pt.t || ""; if (!pt.t) p.hidden = true;
    var akt = document.createElement("div"); akt.className = "iakt";
    var b = document.createElement("button"); b.className = "hak" + (ok ? " ok" : "");
    b.innerHTML = '<svg class="bi" viewBox="0 0 24 24"><path class="bo" d="M12 2.5c-3.9 0-7 3-7 6.9 0 5.1 7 12.1 7 12.1s7-7 7-12.1c0-3.9-3.1-6.9-7-6.9z"/></svg><span>Besucht</span>';
    b.setAttribute("role", "switch"); b.setAttribute("aria-checked", ok ? "true" : "false");
    b.onclick = function () { erledigt["p" + i] = !erledigt["p" + i]; speichern(); neuDaten(); zeige(pt, i); };
    var z = document.createElement("button"); z.className = "hin"; z.setAttribute("aria-label", "Hinzoomen");
    z.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg><span>Hinzoomen</span>';
    z.onclick = function () { fliegen(pt.x, pt.y, 30); };
    akt.appendChild(b); akt.appendChild(z); tt.appendChild(akt);
    info.appendChild(kopf); info.appendChild(p);
  }

  // ---------- Seitenleiste ----------
  var liste = document.getElementById("kats"), letzteGr = "";
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
        syncKat(); speichern(); neuDaten();
      };
      liste.appendChild(h);
    }
    var n = D.punkte.filter(function (p) { return p.k === k.id; }).length;
    var b = document.createElement("button"); b.type = "button"; b.dataset.k = k.id;
    b.className = "kat" + (aus[k.id] ? "" : " an") + (n ? "" : " leer");
    b.innerHTML = '<span class="ic gp">' + pinSvg(k) + '</span><span class="kn"></span><span class="kz" id="z-' + k.id + '"></span>';
    b.querySelector(".kn").textContent = k.name;
    b.onclick = function () { aus[k.id] = !aus[k.id]; syncKat(); speichern(); neuDaten(); };
    liste.appendChild(b);
  });
  function syncKat() {
    Array.prototype.forEach.call(liste.querySelectorAll(".kat"), function (b) { b.classList.toggle("an", !aus[b.dataset.k]); });
    Array.prototype.forEach.call(liste.querySelectorAll(".tg"), function (t) {
      var an = D.kategorien.some(function (x) { return x.gruppe === t.dataset.g && !aus[x.id]; });
      t.setAttribute("aria-checked", an ? "true" : "false");
    });
  }
  syncKat(); zahlen();
  document.getElementById("alle").onclick = function () {
    var irgendAus = D.kategorien.some(function (k) { return aus[k.id]; });
    D.kategorien.forEach(function (k) { aus[k.id] = !irgendAus; });
    syncKat(); speichern(); neuDaten();
  };
  var kbox = document.getElementById("kbox"), klapp = document.getElementById("klapp");
  function klappen(zu) { kbox.classList.toggle("zu", zu); klapp.setAttribute("aria-expanded", zu ? "false" : "true"); try { localStorage.setItem("gta6_zu", zu ? "1" : "0"); } catch (e) {} }
  var gemerkt = null; try { gemerkt = localStorage.getItem("gta6_zu"); } catch (e) {}
  klappen(gemerkt === null ? window.innerWidth < 860 : gemerkt === "1");
  klapp.onclick = function () { klappen(!kbox.classList.contains("zu")); };
  var such = document.getElementById("suche"), suchT = 0;
  such.addEventListener("input", function () {
    clearTimeout(suchT); suchT = setTimeout(function () {
      suche = such.value.trim().toLowerCase(); neuDaten();
      if (suche) { var t = D.punkte.filter(function (p) { return p.n.toLowerCase().indexOf(suche) >= 0 && !aus[p.k]; }); if (t.length === 1) { fliegen(t[0].x, t[0].y, 40); zeige(t[0], D.punkte.indexOf(t[0])); } }
    }, 120);
  });
  var rl = document.getElementById("regs");
  D.regionen.forEach(function (r) {
    var b = document.createElement("button"); b.type = "button"; b.className = "kat an";
    var anz = D.punkte.filter(function (p) { return p.r === r.id; }).length;
    b.innerHTML = '<span class="ic" style="color:#ffd166"><svg viewBox="0 0 24 24"><path d="' + (RICON[r.id] || "") + '"/></svg></span><span class="kn"></span><span class="kz">' + anz + '</span>';
    b.querySelector(".kn").textContent = r.name; b.dataset.tip = r.name; b.dataset.tip2 = r.text;
    b.onclick = function () { fliegen(r.x, r.y, r.id === "vice" ? 120 : 200); };
    var bz = bezirkBei(r.x, r.y);
    b.addEventListener("mouseenter", function () { hervor(bz); }); b.addEventListener("mouseleave", function () { hervor(-1); });
    rl.appendChild(b);
  });
  document.getElementById("zplus").onclick = function () { map.zoomIn({ duration: 300 }); };
  document.getElementById("zminus").onclick = function () { map.zoomOut({ duration: 300 }); };
  document.getElementById("zreset").onclick = function () { ganz(false); };

  // ---------- Countdown ----------
  var cd = document.getElementById("countdown"), releaseZeit = Date.parse("2026-11-19T00:00:00+01:00");
  function tick() {
    if (!cd) return;
    var r = releaseZeit - Date.now();
    if (r <= 0) { cd.innerHTML = "<b>Jetzt erhältlich</b>"; cd.classList.add("raus"); var rl2 = document.querySelector(".rel"); if (rl2) rl2.remove(); return; }
    var s = Math.floor(r / 1000), z = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    Array.prototype.forEach.call(cd.querySelectorAll("b"), function (b, i) { b.textContent = String(z[i]).padStart(2, "0"); });
    setTimeout(tick, 1000);
  }
  tick();

  // ---------- Missionen ----------
  var m = document.getElementById("missionen");
  if (m) {
    document.getElementById("mtext").textContent = D.missionen.text;
    var alleM = [], MB = {}, ov = null, ovKap = -1;
    function mStand() {
      var g = 0, n = 0;
      alleM.forEach(function (k) {
        var z = k.boxen.filter(function (c) { return c.checked; }).length; g += z; n += k.boxen.length;
        k.z.textContent = z + "/" + k.boxen.length; k.bar.style.width = (k.boxen.length ? 100 * z / k.boxen.length : 0) + "%";
        k.bx.classList.toggle("voll", k.boxen.length > 0 && z === k.boxen.length);
      });
      document.getElementById("mgesz").textContent = g + "/" + n;
      document.getElementById("mgesbar").style.width = (n ? 100 * g / n : 0) + "%";
      if (ov) ovMalen();
    }
    D.missionen.kapitel.forEach(function (k, ki) {
      var bx = document.createElement("div"); bx.className = "kap";
      var teil = k.name.split(": "), kopf = document.createElement("div"); kopf.className = "mkopf";
      var nr = document.createElement("div"); nr.className = "mnr"; nr.textContent = ki + 1;
      var t = document.createElement("div"); t.className = "mkt";
      var sm = document.createElement("small"); sm.textContent = teil.length > 1 ? teil[0] : "Kapitel " + (ki + 1);
      var h = document.createElement("h3"); h.textContent = teil.length > 1 ? teil.slice(1).join(": ") : k.name;
      t.appendChild(sm); t.appendChild(h);
      var z = document.createElement("span"); z.className = "mz";
      kopf.appendChild(nr); kopf.appendChild(t); kopf.appendChild(z); bx.appendChild(kopf);
      var bar = document.createElement("div"); bar.className = "mbar"; var bi = document.createElement("i"); bar.appendChild(bi); bx.appendChild(bar);
      var li = document.createElement("div"); li.className = "mliste"; bx.appendChild(li);
      var eintrag = { bx: bx, z: z, bar: bi, boxen: [] };
      if (!k.liste.length) { var p = document.createElement("p"); p.className = "leer"; p.textContent = "Folgt nach dem Release."; li.appendChild(p); }
      k.liste.forEach(function (name, mi) {
        var id = "m" + ki + "_" + mi, l = document.createElement("label"), opt = / \(optional\)$/.test(name);
        var c = document.createElement("input"); c.type = "checkbox"; c.checked = !!erledigt[id];
        var sp = document.createElement("span"); sp.className = "mn"; sp.textContent = name.replace(/ \(optional\)$/, "");
        l.classList.toggle("ok", c.checked);
        c.onchange = function () { erledigt[id] = c.checked; l.classList.toggle("ok", c.checked); speichern(); mStand(); };
        l.appendChild(c); l.appendChild(sp);
        if (opt) { var o = document.createElement("span"); o.className = "mopt"; o.textContent = "Optional"; l.appendChild(o); }
        li.appendChild(l); eintrag.boxen.push(c); MB[id] = { c: c, l: l, name: sp.textContent, opt: opt };
      });
      alleM.push(eintrag); m.appendChild(bx);
    });
    mStand();
    // ---------- Overlay (Bild-im-Bild-Fenster, bleibt über dem Spiel im randlosen Fenstermodus) ----------
    var ovBtn = document.getElementById("movl");
    var OVCSS = "*{box-sizing:border-box;margin:0}body{background:#12081f;color:#fdf2ff;font:13px/1.4 Inter,system-ui,sans-serif;display:flex;flex-direction:column;height:100vh;overflow:hidden}" +
      ".ok{display:flex;align-items:center;gap:10px;padding:10px 12px 8px}.ok b{font:italic 800 18px 'Barlow Condensed',sans-serif;text-transform:uppercase;color:#ffd166;flex:1}.ok span{font-weight:700;color:#ffd166;font-variant-numeric:tabular-nums}" +
      ".bar{height:5px;margin:0 12px 8px;border-radius:9px;background:rgba(255,255,255,.08);overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,#ff3d8b,#ff9a3c,#ffd166)}" +
      ".tabs{display:flex;gap:5px;padding:0 12px 8px}.tabs button{flex:1;height:30px;border-radius:9px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#fdf2ff;font:italic 800 16px 'Barlow Condensed',sans-serif;cursor:pointer}.tabs button.an{background:linear-gradient(135deg,#ff3d8b,#8b5cf6);border-color:transparent}.tabs button.voll{color:#2ee6a0}" +
      ".kn{padding:0 12px 6px;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#b9a6cf;font-weight:700}" +
      ".li{flex:1;overflow:auto;padding:0 6px 10px;scrollbar-width:thin;scrollbar-color:#5a3d80 transparent}label{display:flex;gap:9px;align-items:center;padding:6px;border-radius:8px;cursor:pointer}label:hover{background:rgba(255,255,255,.06)}label.ja{color:#b9a6cf}label.ja s{text-decoration-color:rgba(255,61,139,.6)}s{text-decoration:none}" +
      "input{appearance:none;flex:none;width:17px;height:17px;border-radius:6px;border:1.5px solid rgba(255,255,255,.28);display:grid;place-items:center;cursor:pointer}input:checked{background:linear-gradient(135deg,#ff3d8b,#c46bff);border-color:transparent}input:checked::after{content:'';width:9px;height:5px;border:2px solid #fff;border-top:0;border-right:0;transform:translateY(-1px) rotate(-45deg)}" +
      "em{margin-left:auto;font-style:normal;font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#2ee6f0;border:1px solid rgba(46,230,240,.35);border-radius:99px;padding:0 6px}";
    function ovMalen() {
      var d = ov.document, b = d.body, g = 0, n = 0; b.innerHTML = "";
      if (ovKap < 0) { ovKap = 0; for (var q = 0; q < alleM.length; q++) { if (alleM[q].boxen.some(function (c) { return !c.checked; })) { ovKap = q; break; } } }
      alleM.forEach(function (k) { n += k.boxen.length; g += k.boxen.filter(function (c) { return c.checked; }).length; });
      var kopf = d.createElement("div"); kopf.className = "ok"; kopf.innerHTML = "<b>GTA 6 Missionen</b><span>" + g + "/" + n + "</span>"; b.appendChild(kopf);
      var bar = d.createElement("div"); bar.className = "bar"; bar.innerHTML = '<i style="width:' + (n ? 100 * g / n : 0) + '%"></i>'; b.appendChild(bar);
      var tabs = d.createElement("div"); tabs.className = "tabs";
      alleM.forEach(function (k, ki) {
        var t = d.createElement("button"); t.textContent = ki + 1; t.title = D.missionen.kapitel[ki].name;
        if (ki === ovKap) t.className = "an"; else if (k.bx.classList.contains("voll")) t.className = "voll";
        t.onclick = function () { ovKap = ki; ovMalen(); }; tabs.appendChild(t);
      });
      b.appendChild(tabs);
      var kn = d.createElement("div"); kn.className = "kn"; kn.textContent = D.missionen.kapitel[ovKap].name + " · " + alleM[ovKap].z.textContent; b.appendChild(kn);
      var li = d.createElement("div"); li.className = "li";
      D.missionen.kapitel[ovKap].liste.forEach(function (_, mi) {
        var id = "m" + ovKap + "_" + mi, e = MB[id], l = d.createElement("label"), c = d.createElement("input"), s = d.createElement("s");
        c.type = "checkbox"; c.checked = e.c.checked; s.textContent = e.name; if (c.checked) l.className = "ja";
        c.onchange = function () { e.c.checked = c.checked; e.c.onchange(); };
        l.appendChild(c); l.appendChild(s);
        if (e.opt) { var o = d.createElement("em"); o.textContent = "Optional"; l.appendChild(o); }
        li.appendChild(l);
      });
      b.appendChild(li);
    }
    if (ovBtn) {
      if (!("documentPictureInPicture" in window)) ovBtn.hidden = true;
      ovBtn.onclick = function () {
        if (ov) { ov.close(); return; }
        documentPictureInPicture.requestWindow({ width: 320, height: 520 }).then(function (w) {
          ov = w; var st = w.document.createElement("style"); st.textContent = OVCSS; w.document.head.appendChild(st);
          var f = w.document.createElement("link"); f.rel = "stylesheet"; f.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,800&display=swap"; w.document.head.appendChild(f);
          w.document.title = "GTA 6 Missionen"; ovMalen();
          w.addEventListener("pagehide", function () { ov = null; });
        }).catch(function () {});
      };
    }
  }
  var standEl = document.getElementById("stand"); if (standEl) standEl.textContent = D.stand;
})();
