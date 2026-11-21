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
  var HERZ = { clothing: 1, footwear: 1, haircut: 1, tattoo: 1, bar: 1, nightclub: 1, cinema: 1, "food-and-drink": 1 };
  D.kategorien.forEach(function (k) { if (HERZ[k.id]) { k.herz = 1; k.pfarbe = "#1b1620"; k.ifarbe = "#fff"; k.farbe = "#ff5fa2"; } });
  var PFORM = "M-8 -31h16a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4h-4.5L0 0l-3.5-8H-8a4 4 0 0 1-4-4v-15a4 4 0 0 1 4-4z";
  var HERZD = "M9.5 -26.2c-2.6-1.9-4.4-3.4-4.4-5.3a2.3 2.3 0 0 1 4.4-1 2.3 2.3 0 0 1 4.4 1c0 1.9-1.8 3.4-4.4 5.3z";
  var HERZP = '<path d="' + HERZD + '" fill="#ff5fa2" stroke="#fff" stroke-width="1"/>';
  function pinSvg(k) {
    var st = k.ifarbe === "#fff" ? "#fff" : "#2a1c24";
    return '<svg viewBox="-14 -35 30 37"><path d="' + PFORM + '" fill="' + k.pfarbe + '" stroke="' + st + '" stroke-width="1.6" stroke-linejoin="round"/><path d="' + k.icon + '" transform="translate(-8,-27.5) scale(.667)" style="fill:' + k.ifarbe + '"/>' + (k.herz ? HERZP : "") + '</svg>';
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
  function pinBild(k) {
    var w = Math.ceil(30 * PS * PR), h = Math.ceil(37 * PS * PR), c = document.createElement("canvas"); c.width = w; c.height = h;
    var g = c.getContext("2d"); g.translate(14 * PS * PR, 35 * PS * PR); g.scale(PS * PR, PS * PR);
    var p = new Path2D(PFORM); g.fillStyle = k.pfarbe; g.fill(p);
    g.lineWidth = 1.6; g.lineJoin = "round"; g.strokeStyle = k.ifarbe === "#fff" ? "#fff" : "#2a1c24"; g.stroke(p);
    g.save(); g.translate(-8, -27.5); g.scale(.667, .667); g.fillStyle = k.ifarbe; g.fill(new Path2D(k.icon)); g.restore();
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
  var RAST = { "raster-saturation": -.62, "raster-brightness-max": .93, "raster-contrast": .05, "raster-fade-duration": 120 };
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
    var x0 = 214, x1 = 586, y0 = 218, y1 = 747;
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
      f.push({ type: "Feature", id: i, geometry: { type: "Point", coordinates: ll(pt.x, pt.y) }, properties: { i: i, k: "p-" + pt.k, ok: erledigt["p" + i] ? 1 : 0 } });
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
    D.kategorien.forEach(function (k) { map.addImage("p-" + k.id, pinBild(k), { pixelRatio: PR }); });
    map.addSource("bez", { type: "geojson", data: bezirkeGeo() });
    map.addLayer({ id: "bez-fl", type: "fill", source: "bez", paint: { "fill-color": "#fff", "fill-opacity": ["case", ["boolean", ["feature-state", "an"], false], .06, 0] } });
    map.addLayer({ id: "bez-rand", type: "line", source: "bez", paint: { "line-color": "#fff", "line-width": 1.4, "line-opacity": ["case", ["boolean", ["feature-state", "an"], false], .9, .22] } });
    map.addSource("orte", { type: "geojson", data: punkteGeo(), cluster: true, clusterRadius: 42, clusterMaxZoom: 3, clusterMinPoints: 3 });
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
    map.setMaxBounds([ll(60, 1000), ll(1000, 0)]);
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
  map.on("mousemove", function (ev) {
    if (!bereit || zieht) return;
    var f = map.queryRenderedFeatures(ev.point, { layers: ["pins", "haufen"] })[0], e = ev.originalEvent;
    map.getCanvas().style.cursor = f ? "pointer" : "";
    if (f && f.layer.id === "pins") { var pt = D.punkte[f.properties.i], k = KAT[pt.k]; hervor(-1); return tipZeig("p" + f.properties.i, pt.n, k.name, k.farbe, e); }
    if (f) { hervor(-1); return tipZeig("h" + f.properties.cluster_id, f.properties.point_count + " Orte", "Klicken zum Hineinzoomen", "", e); }
    var w = xy(ev.lngLat), j = bezirkBei(w[0], w[1]); hervor(j);
    if (j >= 0) tipZeig("b" + j, D.bezirke[j].name, "", "", e); else tipWeg();
  });
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
    kopf.innerHTML = '<span class="ic iic gp">' + pinSvg(k) + '</span>';
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
    D.missionen.kapitel.forEach(function (k, ki) {
      var bx = document.createElement("div"); bx.className = "kap";
      var h = document.createElement("h3"); h.textContent = k.name; bx.appendChild(h);
      if (!k.liste.length) { var p = document.createElement("p"); p.className = "leer"; p.textContent = "Folgt nach dem Release."; bx.appendChild(p); }
      k.liste.forEach(function (name, mi) {
        var id = "m" + ki + "_" + mi, l = document.createElement("label");
        var c = document.createElement("input"); c.type = "checkbox"; c.checked = !!erledigt[id];
        c.onchange = function () { erledigt[id] = c.checked; speichern(); };
        l.appendChild(c); l.appendChild(document.createTextNode(name)); bx.appendChild(l);
      });
      m.appendChild(bx);
    });
  }
  var standEl = document.getElementById("stand"); if (standEl) standEl.textContent = D.stand;
})();
