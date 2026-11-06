// Einblick: interaktive Vorschau des Game-VPN-Tabs (nur Anzeige, verbindet nichts).
// Punkte, Flaggen und Geo-Fence-Aufbau wie in der App.
(function () {
  var root = document.getElementById("vpDemo");
  if (!root || !window.VPD_WELT) return;
  var X = function (l) { return (l + 180) * 2 }, Y = function (b) { return (85 - b) * 2 };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] }) };

  var vpH = function (a) { return a.map(function (c, i) { return '<rect y="' + i * 20 / a.length + '" width="30" height="' + (20 / a.length + .1) + '" fill="' + c + '"/>' }).join("") };
  var vpV = function (a) { return a.map(function (c, i) { return '<rect x="' + i * 10 + '" width="10.1" height="20" fill="' + c + '"/>' }).join("") };
  var vpX = function (bg, c, x, w, c2, w2) { return '<rect width="30" height="20" fill="' + bg + '"/><rect x="' + (x - w / 2) + '" width="' + w + '" height="20" fill="' + c + '"/><rect y="' + (10 - w / 2) + '" width="30" height="' + w + '" fill="' + c + '"/>' + (c2 ? '<rect x="' + (x - w2 / 2) + '" width="' + w2 + '" height="20" fill="' + c2 + '"/><rect y="' + (10 - w2 / 2) + '" width="30" height="' + w2 + '" fill="' + c2 + '"/>' : "") };
  var FLAG = { DE: vpH(["#000", "#dd0000", "#ffce00"]), NL: vpH(["#ae1c28", "#fff", "#21468b"]), LU: vpH(["#ed2939", "#fff", "#00a1de"]), AT: vpH(["#c8102e", "#fff", "#c8102e"]), PL: vpH(["#fff", "#dc143c"]),
    ES: '<rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/>',
    FR: vpV(["#0055a4", "#fff", "#ef4135"]), IT: vpV(["#009246", "#fff", "#ce2b37"]), BE: vpV(["#000", "#fdda24", "#ef3340"]), IE: vpV(["#169b62", "#fff", "#ff883e"]),
    SE: vpX("#006aa7", "#fecc00", 11, 4), DK: vpX("#c8102e", "#fff", 11, 4), FI: vpX("#fff", "#002f6c", 11, 5), NO: vpX("#ba0c2f", "#fff", 11, 5, "#00205b", 2.4),
    CH: '<rect width="30" height="20" fill="#d52b1e"/><rect x="13" y="4" width="4" height="12" fill="#fff"/><rect x="9" y="8" width="12" height="4" fill="#fff"/>',
    CZ: vpH(["#fff", "#d7141a"]) + '<path d="M0 0L15 10L0 20Z" fill="#11457e"/>',
    PT: '<rect width="30" height="20" fill="#da291c"/><rect width="12" height="20" fill="#046a38"/><circle cx="12" cy="10" r="4" fill="#ffe900"/><circle cx="12" cy="10" r="2.4" fill="#da291c"/>',
    GB: '<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6"/><path d="M15 0V20M0 10H30" stroke="#c8102e" stroke-width="3.4"/>',
    AE: vpH(["#00732f", "#fff", "#000"]) + '<rect width="8" height="20" fill="#ff0000"/>',
    US: vpH(["#b22234", "#fff", "#b22234", "#fff", "#b22234", "#fff", "#b22234"]) + '<rect width="13" height="11" fill="#3c3b6e"/>',
    JP: '<rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/>',
    IN: vpH(["#ff9933", "#fff", "#138808"]) + '<circle cx="15" cy="10" r="2.4" fill="none" stroke="#000080" stroke-width=".8"/>' };
  var flag = function (c) { return FLAG[c] ? '<svg class="vd-fl" viewBox="0 0 30 20" aria-hidden="true">' + FLAG[c] + "</svg>" : "" };
  var FILE = {}; (window.VPD_FILE || []).forEach(function (c) { FILE[c] = 1 });
  var uid = 0;
  function rund(c, x, y, d) {
    var id = "vdc" + (++uid), r = d / 2, inner;
    if (FLAG[c]) inner = '<svg x="' + (x - r * 1.5) + '" y="' + (y - r) + '" width="' + d * 1.5 + '" height="' + d + '" viewBox="0 0 30 20" preserveAspectRatio="none">' + FLAG[c] + "</svg>";
    else if (FILE[c]) inner = '<image href="img/flags/' + c.toLowerCase() + '.svg" x="' + (x - r * 1.34) + '" y="' + (y - r) + '" width="' + d * 1.34 + '" height="' + d + '" preserveAspectRatio="none"/>';
    else return "";
    return '<clipPath id="' + id + '"><circle cx="' + x + '" cy="' + y + '" r="' + r + '"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="#0b1324" stroke-width="' + d * .08 + '"/>';
  }

  var NAME = { NL: "Niederlande", GB: "Großbritannien", FR: "Frankreich", SE: "Schweden", PL: "Polen", ES: "Spanien", IT: "Italien", AT: "Österreich", CH: "Schweiz",
    BE: "Belgien", DK: "Dänemark", NO: "Norwegen", FI: "Finnland", IE: "Irland", CZ: "Tschechien", PT: "Portugal", LU: "Luxemburg" };
  var EINZEL = ["NL", "GB", "FR", "SE", "PL", "ES", "IT", "AT", "CH", "BE", "DK", "NO", "FI", "IE", "CZ", "PT", "LU"];
  var GRUPPEN = [{ id: "eu", name: "Europa", cc: ["AT", "BE", "CH", "CZ", "DK", "ES", "FI", "FR", "GB", "IE", "IT", "LU", "NL", "NO", "PL", "PT", "SE"] },
    { id: "west", name: "Westeuropa", cc: ["AT", "BE", "CH", "FR", "GB", "LU", "NL"] }];
  var FENCES = GRUPPEN.concat(EINZEL.map(function (c) { return { id: c, name: NAME[c], cc: [c] } }));
  var NACHT = [["Indien", "IN", 5.5], ["Naher Osten", "AE", 4], ["USA Ost", "US", -5], ["Japan / Korea", "JP", 9]];

  var MID = {};
  window.VPD_WELT.forEach(function (w) { if (w[3] != null) MID[w[0]] = [w[3], w[4]] });
  var DU = MID.DE || [9.68, 50.96], SV = MID.IN || [79.36, 22.69];
  var st = { on: false, fence: false, reg: "eu" };
  var $ = function (s) { return root.querySelector(s) };

  var KC = { Eu: "#2b4f9c", As: "#6b5320", Af: "#1f3d73", No: "#245a51", Se: "#333" };
  var land = window.VPD_WELT.map(function (w) { return '<path data-c="' + w[0] + '" style="--kc:' + (KC[w[2]] || "#333") + '" d="' + w[1] + '"/>' }).join("");
  var flr = function (cc) { return '<span class="vd-flr">' + cc.slice(0, 9).map(flag).join("") + (cc.length > 9 ? "<em>+" + (cc.length - 9) + "</em>" : "") + "</span>" };

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
        '<rect x="0" y="0" width="720" height="300" fill="#0b1325"/><g class="vd-land">' + land + '</g><g class="vd-fls"></g><g class="vd-dyn"></g></svg>' +
        '<div class="vd-leg"><span><i class="b"></i>Region · Lobby &amp; Matchmaking über Mumbai</span><span><i class="g"></i>Spielserver · bleibt nah, Ping bleibt niedrig</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="vd-row">' +
      '<div class="vd-card"><div class="vd-ch"><div><b>Game-VPN</b><small>CoD sieht die Region deines Servers – Spiel, Matchmaking und deine IP bleiben direkt, der Ping bleibt niedrig</small></div>' +
        '<button type="button" class="vd-sw" id="vdOn" role="switch" aria-checked="false" aria-label="Game-VPN"><i></i></button></div>' +
        '<small class="vd-lab">Server</small><div class="vd-srv"><b>' + flag("IN") + 'Mumbai</b><small>Indien · läuft immer</small></div>' +
        '<div class="vd-zg"><small class="vd-lab">Dein Zugang</small><b>Das hier ist nur die Vorschau</b><small>In der App schaltest du den Game-VPN mit deinem Zugang genauso ein – für PC, PS5 und Xbox.</small><a class="vd-go" href="index.html#preise">Zugang holen</a></div></div>' +
      '<div class="vd-card"><div class="vd-ch"><div><b>Geo-Fence</b><small>Ping-Tests nur zu Rechenzentren in der gewählten Region – Spielserver bleiben nah</small></div>' +
        '<button type="button" class="vd-sw" id="vdFe" role="switch" aria-checked="false" aria-label="Geo-Fence"><i></i></button></div>' +
        '<small class="vd-lab">Region</small><div class="vd-grp">' +
          '<button type="button" class="vd-o cust" disabled><b>Eigene Auswahl</b><small>Länder selbst wählen, mit Ping und Ortszeit · in der App</small></button>' +
          GRUPPEN.map(function (g) { return '<button type="button" class="vd-o" data-r="' + g.id + '"><b>' + esc(g.name) + "</b>" + flr(g.cc) + "<small>" + g.cc.length + " Länder</small></button>" }).join("") +
        '</div><small class="vd-lab">Einzelnes Land</small><div class="vd-chips">' +
          EINZEL.map(function (c) { return '<button type="button" class="vd-o vd-c" data-r="' + c + '">' + flag(c) + esc(NAME[c]) + "</button>" }).join("") +
        '</div></div>' +
    '</div>';

  var paths = {};
  root.querySelectorAll(".vd-land path").forEach(function (p) { (paths[p.getAttribute("data-c")] = paths[p.getAttribute("data-c")] || []).push(p) });
  var cls = function (cc, c, an) { (paths[cc] || []).forEach(function (p) { p.classList.toggle(c, an) }) };
  cls("DE", "me", true);

  function pill(x, y, txt, k, fl, unten) {
    var w = txt.length * 3.15 + 9 + (fl ? 6 : 0), gx = x - w / 2, gy = unten ? y + 4.5 : y - 14;
    return '<rect x="' + gx + '" y="' + gy + '" width="' + w + '" height="9" rx="3" class="vd-pb ' + k + '"/>' + (fl ? rund(fl, gx + 5.5, gy + 4.5, 5.4) : "") +
      '<text x="' + (gx + (fl ? 10.5 : 4.5)) + '" y="' + (gy + 6.4) + '">' + esc(txt) + "</text>";
  }
  function bogen(a, b, k, h) {
    var x1 = X(a[0]), y1 = Y(a[1]), x2 = X(b[0]), y2 = Y(b[1]), cx = (x1 + x2) / 2, cy = Math.min(y1, y2) - Math.hypot(x2 - x1, y2 - y1) * h - 4;
    var d = "M" + x1 + "," + y1 + " Q" + cx + "," + cy + " " + x2 + "," + y2;
    return '<path class="vd-arcg ' + k + '" d="' + d + '"/><path class="vd-arc ' + k + '" d="' + d + '"/>';
  }

  function zeichnen() {
    var reg = FENCES.filter(function (f) { return f.id === st.reg })[0], eins = st.fence && reg.cc.length === 1 ? reg.cc[0] : null;
    FENCES.forEach(function (f) { f.cc.forEach(function (c) { cls(c, "fz", false) }) });
    if (st.fence) reg.cc.forEach(function (c) { cls(c, "fz", true) });
    cls("IN", "hl", st.on);
    var ohne = { DE: 1, IN: 1 }; if (eins) ohne[eins] = 1;
    $(".vd-fls").innerHTML = window.VPD_WELT.filter(function (w) { return w[5] != null && w[5] <= 3 && !ohne[w[0]] })
      .map(function (w) { return rund(w[0], X(w[3]), Y(w[4]), w[5] <= 2 ? 4.2 : 3.4) }).join("");
    var g = "", sx = X(SV[0]), sy = Y(SV[1]), dx = X(DU[0]), dy = Y(DU[1]);
    if (st.on) g += bogen(DU, SV, "b", .25) + '<circle class="vd-ring" cx="' + sx + '" cy="' + sy + '" r="3"/><circle class="vd-pt b" cx="' + sx + '" cy="' + sy + '" r="2.2"/>' + pill(sx, sy, "Lobby · Mumbai", "g", "IN");
    else g += rund("IN", sx, sy, 4.2);
    if (eins && MID[eins]) {
      var p = MID[eins], px = X(p[0]), py = Y(p[1]);
      g += bogen(DU, p, "a", .3) + '<circle class="vd-pt a" cx="' + px + '" cy="' + py + '" r="2"/>' + pill(px, py, "Spielserver · " + NAME[eins], "a", eins, true);
    } else if (st.fence) g += pill(X(-6), Y(73), "Spielserver: " + reg.name, "a");
    g += '<circle class="vd-pt me" cx="' + dx + '" cy="' + dy + '" r="2.4"/>' + pill(dx, dy, "Du", "b", "DE");
    $(".vd-dyn").innerHTML = g;

    root.classList.toggle("on", st.on);
    $(".vd-t1").textContent = st.on ? "Game-VPN aktiv" : "Game-VPN aus";
    $(".vd-t2").textContent = st.on ? "Matchsuche läuft über Mumbai" : "Schalte ihn unten ein und sieh, was passiert";
    $(".vd-reg").innerHTML = st.on ? flag("IN") + "Mumbai" : flag("DE") + "Deutschland";
    $(".vd-ping").textContent = st.on ? "142 ms" : "–";
    $(".vd-geo").innerHTML = st.fence ? (eins ? flag(eins) : "") + esc(reg.name) : "Aus";
    $("#vdOn").setAttribute("aria-checked", st.on); $("#vdFe").setAttribute("aria-checked", st.fence);
    root.querySelectorAll(".vd-o[data-r]").forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-r") === st.reg); b.classList.toggle("dim", !st.fence) });
  }

  function uhr() {
    var utc = Date.now(), hm = function (o) { var d = new Date(utc + o * 36e5); return [d.getUTCHours(), ("0" + d.getUTCMinutes()).slice(-2)] };
    var m = hm(5.5); $(".vd-uhr").innerHTML = flag("IN") + m[0] + ":" + m[1];
    var n = NACHT.filter(function (r) { return hm(r[2])[0] < 7 });
    $(".vd-nacht").innerHTML = n.length ? n.map(function (r) { return flag(r[1]) + esc(r[0]) }).join(" · ") : "nirgends gerade";
  }

  $("#vdOn").onclick = function () { st.on = !st.on; zeichnen() };
  $("#vdFe").onclick = function () { st.fence = !st.fence; zeichnen() };
  root.querySelectorAll(".vd-o[data-r]").forEach(function (b) { b.onclick = function () { st.reg = b.getAttribute("data-r"); st.fence = true; zeichnen() } });
  zeichnen(); uhr(); setInterval(uhr, 30000);
})();
