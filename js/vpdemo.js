// Einblick: interaktive Vorschau des Game-VPN-Tabs (nur Anzeige, verbindet nichts)
(function () {
  var root = document.getElementById("vpDemo");
  if (!root || !window.VPD_WELT) return;
  var X = function (l) { return (l + 180) * 2 }, Y = function (b) { return (85 - b) * 2 };
  var DU = [8.7, 50.1], MUM = [72.88, 19.08];
  var CITY = { GB: ["London", -0.13, 51.5], FR: ["Paris", 2.35, 48.86], NL: ["Amsterdam", 4.9, 52.37], IT: ["Mailand", 9.19, 45.46], PL: ["Warschau", 21, 52.23],
    ES: ["Madrid", -3.7, 40.42], SE: ["Stockholm", 18.07, 59.33], IE: ["Dublin", -6.26, 53.35], BE: ["Brüssel", 4.35, 50.85], AT: ["Wien", 16.37, 48.21],
    CH: ["Zürich", 8.54, 47.37], DK: ["Kopenhagen", 12.57, 55.68], NO: ["Oslo", 10.75, 59.91], FI: ["Helsinki", 24.94, 60.17], CZ: ["Prag", 14.42, 50.08],
    PT: ["Lissabon", -9.14, 38.72], LU: ["Luxemburg", 6.13, 49.61] };
  var FENCES = [
    { id: "eu", name: "Europa", cc: ["AT", "BE", "CH", "CZ", "DK", "ES", "FI", "FR", "GB", "IE", "IT", "LU", "NL", "NO", "PL", "PT", "SE"] },
    { id: "west", name: "Westeuropa", cc: ["AT", "BE", "CH", "FR", "GB", "LU", "NL"] },
    { id: "NL", name: "Niederlande" }, { id: "GB", name: "Großbritannien" }, { id: "FR", name: "Frankreich" }, { id: "SE", name: "Schweden" },
    { id: "PL", name: "Polen" }, { id: "ES", name: "Spanien" }, { id: "IT", name: "Italien" }, { id: "AT", name: "Österreich" },
    { id: "CH", name: "Schweiz" }, { id: "BE", name: "Belgien" }, { id: "DK", name: "Dänemark" }, { id: "NO", name: "Norwegen" },
    { id: "FI", name: "Finnland" }, { id: "IE", name: "Irland" }, { id: "CZ", name: "Tschechien" }, { id: "PT", name: "Portugal" }, { id: "LU", name: "Luxemburg" }];
  FENCES.forEach(function (f) { if (!f.cc) f.cc = [f.id] });
  var NACHT = [["Indien", 5.5, "Ping wenn dort gespielt: 120–160 ms"], ["Naher Osten", 4, "Ping wenn dort gespielt: 80–100 ms"],
    ["USA Ost", -5, "Ping wenn dort gespielt: 90–100 ms"], ["Japan / Korea", 9, "Ping wenn dort gespielt: 230+ ms"]];
  var st = { on: false, fence: false, reg: "eu" };
  var $ = function (s) { return root.querySelector(s) };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) };

  var KC = { Eu: "#2b4f9c", As: "#6b5320", Af: "#1f3d73", No: "#245a51", Se: "#333" };
  var land = window.VPD_WELT.map(function (w) {
    return '<path data-c="' + w[0] + '" style="--kc:' + (KC[w[2]] || "#333") + '" d="' + w[1] + '"/>';
  }).join("");

  root.innerHTML =
    '<div class="vd-hint"><span class="vd-dot"></span>Vorschau zum Ausprobieren – schalte Game-VPN und Geo-Fence unten an</div>' +
    '<div class="vd-top">' +
      '<div class="vd-card vd-st">' +
        '<div class="vd-sh"><span class="vd-led"></span><div><b class="vd-t1"></b><small class="vd-t2"></small></div></div>' +
        '<span class="vd-pill">Spiel: direkt</span>' +
        '<div class="vd-tiles">' +
          '<div><small>Region für CoD</small><b class="vd-reg"></b></div>' +
          '<div><small>Ping zum Server</small><b class="vd-ping"></b></div>' +
          '<div><small>Geo-Fence</small><b class="vd-geo"></b></div>' +
          '<div><small>Uhrzeit Mumbai</small><b class="vd-uhr"></b></div>' +
          '<div class="w"><small>Gerade Nacht</small><b class="vd-nacht"></b></div>' +
        '</div>' +
      '</div>' +
      '<div class="vd-card vd-map"><svg viewBox="300 24 280 150" preserveAspectRatio="xMidYMid meet" aria-label="Karte: Du in Deutschland, Lobby über Mumbai">' +
        '<rect x="0" y="0" width="720" height="300" fill="#0b1325"/><g class="vd-land">' + land + '</g><g class="vd-dyn"></g></svg>' +
        '<div class="vd-leg"><span><i class="b"></i>Region · Lobby &amp; Matchmaking über Mumbai</span><span><i class="g"></i>Spielserver · bleibt nah, Ping bleibt niedrig</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="vd-row">' +
      '<div class="vd-card"><div class="vd-ch"><div><b>Game-VPN</b><small>CoD sieht die Region deines Servers – Spiel, Matchmaking und deine IP bleiben direkt, der Ping bleibt niedrig</small></div>' +
        '<button type="button" class="vd-sw" id="vdOn" role="switch" aria-checked="false" aria-label="Game-VPN"><i></i></button></div>' +
        '<small class="vd-lab">Server</small><div class="vd-srv"><b>Mumbai</b><small>Indien · läuft immer</small></div>' +
        '<div class="vd-zg"><small class="vd-lab">Dein Zugang</small><b>Das hier ist nur die Vorschau</b><small>In der App schaltest du den Game-VPN mit deinem Zugang genauso ein – für PC, PS5 und Xbox.</small><a class="vd-go" href="index.html#preise">Zugang holen</a></div></div>' +
      '<div class="vd-card"><div class="vd-ch"><div><b>Geo-Fence</b><small>Ping-Tests nur zu Rechenzentren in der gewählten Region – Spielserver bleiben nah</small></div>' +
        '<button type="button" class="vd-sw" id="vdFe" role="switch" aria-checked="false" aria-label="Geo-Fence"><i></i></button></div>' +
        '<small class="vd-lab">Region</small><div class="vd-chips">' +
        FENCES.map(function (f) { return '<button type="button" class="vd-chip' + (f.cc.length > 1 ? " big" : "") + '" data-r="' + f.id + '">' + esc(f.name) + (f.cc.length > 1 ? "<small>" + f.cc.length + " Länder</small>" : "") + "</button>" }).join("") +
        '</div></div>' +
    '</div>';

  var paths = {};
  root.querySelectorAll(".vd-land path").forEach(function (p) { (paths[p.getAttribute("data-c")] = paths[p.getAttribute("data-c")] || []).push(p) });
  var cls = function (cc, c, an) { (paths[cc] || []).forEach(function (p) { p.classList.toggle(c, an) }) };
  cls("DE", "me", true);

  function pill(x, y, txt, k, links) {
    var w = txt.length * 3.3 + 9;
    return '<g transform="translate(' + (links ? x - w - 5 : x + 5) + " " + (y - 13) + ')"><rect width="' + w + '" height="9" rx="3" class="vd-pb ' + k + '"/><text x="4.5" y="6.4">' + esc(txt) + "</text></g>";
  }
  function pillU(x, y, txt, k) {             // Schild mittig unter dem Punkt
    var w = txt.length * 3.3 + 9;
    return '<g transform="translate(' + (x - w / 2) + " " + (y + 4) + ')"><rect width="' + w + '" height="9" rx="3" class="vd-pb ' + k + '"/><text x="4.5" y="6.4">' + esc(txt) + "</text></g>";
  }
  function bogen(a, b, k) {
    var x1 = X(a[0]), y1 = Y(a[1]), x2 = X(b[0]), y2 = Y(b[1]), cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - Math.hypot(x2 - x1, y2 - y1) * .25 - 4;
    var d = "M" + x1 + "," + y1 + " Q" + cx + "," + cy + " " + x2 + "," + y2;
    return '<path class="vd-arcg ' + k + '" d="' + d + '"/><path class="vd-arc ' + k + '" d="' + d + '"/>';
  }

  function zeichnen() {
    var reg = FENCES.filter(function (f) { return f.id === st.reg })[0];
    FENCES.forEach(function (f) { f.cc.forEach(function (c) { cls(c, "fz", false) }) });
    if (st.fence) reg.cc.forEach(function (c) { cls(c, "fz", true) });
    cls("IN", "hl", st.on);
    var g = "";
    if (st.on) g += bogen(DU, MUM, "b") + '<circle class="vd-ring" cx="' + X(MUM[0]) + '" cy="' + Y(MUM[1]) + '" r="3"/><circle class="vd-pt b" cx="' + X(MUM[0]) + '" cy="' + Y(MUM[1]) + '" r="2.2"/>' + pill(X(MUM[0]), Y(MUM[1]) + 1, "Lobby · Mumbai", "g");
    if (st.fence) {
      if (reg.cc.length === 1 && CITY[reg.cc[0]]) {
        var c = CITY[reg.cc[0]], p = [c[1], c[2]];
        g += bogen(DU, p, "a") + '<circle class="vd-pt a" cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="2"/>' + pillU(X(p[0]), Y(p[1]), "Spielserver · " + c[0], "a");
      } else g += pill(X(-14), Y(66), "Spielserver: " + reg.name, "a");
    }
    g += '<circle class="vd-pt me" cx="' + X(DU[0]) + '" cy="' + Y(DU[1]) + '" r="2.4"/>' + pill(X(DU[0]), Y(DU[1]) + 1, "Du", "b");
    $(".vd-dyn").innerHTML = g;

    root.classList.toggle("on", st.on);
    $(".vd-t1").textContent = st.on ? "Game-VPN aktiv" : "Game-VPN aus";
    $(".vd-t2").textContent = st.on ? "Matchsuche läuft über Mumbai" : "Schalte ihn unten ein und sieh, was passiert";
    $(".vd-reg").textContent = st.on ? "Mumbai" : "Deutschland";
    $(".vd-ping").textContent = st.on ? "142 ms" : "–";
    $(".vd-geo").textContent = st.fence ? reg.name : "Aus";
    $("#vdOn").setAttribute("aria-checked", st.on); $("#vdFe").setAttribute("aria-checked", st.fence);
    root.querySelectorAll(".vd-chip").forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-r") === st.reg); b.classList.toggle("dim", !st.fence) });
  }

  function uhr() {
    var utc = Date.now();
    var hm = function (o) { var d = new Date(utc + o * 36e5); return [d.getUTCHours(), ("0" + d.getUTCMinutes()).slice(-2)] };
    var m = hm(5.5); $(".vd-uhr").textContent = m[0] + ":" + m[1];
    var n = NACHT.filter(function (r) { var h = hm(r[1])[0]; return h < 7 }).map(function (r) { return r[0] });
    $(".vd-nacht").textContent = n.length ? n.join(" · ") : "nirgends gerade";
  }

  $("#vdOn").onclick = function () { st.on = !st.on; zeichnen() };
  $("#vdFe").onclick = function () { st.fence = !st.fence; zeichnen() };
  root.querySelectorAll(".vd-chip").forEach(function (b) { b.onclick = function () { st.reg = b.getAttribute("data-r"); st.fence = true; zeichnen() } });
  zeichnen(); uhr(); setInterval(uhr, 30000);
})();
