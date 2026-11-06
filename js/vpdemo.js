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
  // Flaggen-Inhalt fuer ein Rechteck (eigene SVG oder Datei)
  var fin = function (c, x, y, w, h) {
    if (FLAG[c]) return '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" viewBox="0 0 30 20" preserveAspectRatio="none">' + FLAG[c] + "</svg>";
    if (FILE[c]) return '<image href="img/flags/' + c.toLowerCase() + '.svg" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"/>';
    return "";
  };
  var uid = 0;
  // kleine runde Kartenflagge wie in der App (viewBox 0 0 3 3, Kreis r 1.4)
  function mf(c, x, y, f) {
    var inner = fin(c, -.5, 0, 4, 3); if (!inner) return "";
    var id = "vdm" + (++uid);
    return '<svg class="vd-mf" x="' + (x - f * .6).toFixed(2) + '" y="' + (y - f * .6).toFixed(2) + '" width="' + (f * 1.2).toFixed(2) + '" height="' + (f * 1.2).toFixed(2) + '" viewBox="0 0 3 3"><clipPath id="' + id + '"><circle cx="1.5" cy="1.5" r="1.4"/></clipPath><g clip-path="url(#' + id + ')">' + inner + '</g><circle cx="1.5" cy="1.5" r="1.4" fill="none" stroke="#0a1224" stroke-width=".22"/></svg>';
  }
  var tc = document.createElement("canvas").getContext("2d");
  var TW = function (t) { tc.font = '700 10.5px Inter,system-ui,"Segoe UI",sans-serif'; return Math.ceil(tc.measureText(t).width) };
  // Pin wie in der App: runde Flagge ueber dem Punkt + Namensschild daneben
  function pin(c, x, y, col, t, cl, q, op, links) {
    var id = "vdp" + (++uid), w = TW(t) + 14, lx = links ? -15 - w : 15;
    return '<g opacity="' + op + '" transform="translate(' + x + " " + (y - 26 * q) + ") scale(" + q * 1.2 + ')"><clipPath id="' + id + '"><circle r="10"/></clipPath><g clip-path="url(#' + id + ')">' + fin(c, -15, -10, 30, 20) + '</g><circle r="10.5" fill="none" stroke="' + col + '" stroke-width="2"/>' +
      '<g transform="translate(' + lx + ' -9)"><rect width="' + w + '" height="18" rx="6" class="vd-pb ' + cl + '"/><text x="7" y="12.5" font-family="Inter,system-ui" font-size="10.5" font-weight="700" fill="#e9eef8">' + esc(t) + "</text></g></g>";
  }

  var NAME = { NL: "Niederlande", GB: "Großbritannien", FR: "Frankreich", SE: "Schweden", PL: "Polen", ES: "Spanien", IT: "Italien", AT: "Österreich", CH: "Schweiz",
    BE: "Belgien", DK: "Dänemark", NO: "Norwegen", FI: "Finnland", IE: "Irland", CZ: "Tschechien", PT: "Portugal", LU: "Luxemburg" };
  var EINZEL = ["NL", "GB", "FR", "SE", "PL", "ES", "IT", "AT", "CH", "BE", "DK", "NO", "FI", "IE", "CZ", "PT", "LU"];
  var GRUPPEN = [{ id: "eu", name: "Europa", cc: ["AT", "BE", "CH", "CZ", "DK", "ES", "FI", "FR", "GB", "IE", "IT", "LU", "NL", "NO", "PL", "PT", "SE"] },
    { id: "west", name: "Westeuropa", cc: ["AT", "BE", "CH", "FR", "GB", "LU", "NL"] }];
  var FENCES = GRUPPEN.concat(EINZEL.map(function (c) { return { id: c, name: NAME[c], cc: [c] } }));
  var NACHT = [["Indien","IN","Asia/Kolkata"],["Naher Osten","AE","Asia/Jerusalem"],["Südafrika","ZA","Africa/Johannesburg"],["Singapur","SG","Asia/Singapore"],["Japan / Korea","JP","Asia/Tokyo"],["Australien","AU","Australia/Sydney"],["USA Ost","US","America/New_York"],["USA West","US","America/Los_Angeles"],["Brasilien","BR","America/Sao_Paulo"]];   // wie in der App (gamevpn.REGIONS)

  var MID = {};
  window.VPD_WELT.forEach(function (w) { if (w[3] != null) MID[w[0]] = [w[3], w[4]] });
  var DU = MID.DE || [9.68, 50.96], SV = MID.IN || [79.36, 22.69];
  var st = { on: false, fence: false, reg: "AT" };
  var $ = function (s) { return root.querySelector(s) };

  var KC = { Eu: "#2b4f9c", As: "#6b5320", Af: "#1f3d73", No: "#245a51", Se: "#333" };
  var land = window.VPD_WELT.map(function (w) { return '<path data-c="' + w[0] + '" style="--kc:' + (KC[w[2]] || "#333") + '" d="' + w[1] + '"/>' }).join("");
  var ff = function (c) { return FLAG[c] ? flag(c) : '<img class="vd-fl" src="img/flags/' + c.toLowerCase() + '.svg" alt="">' };
  var flr = function (cc) { return '<span class="vd-flr">' + cc.slice(0, 9).map(flag).join("") + (cc.length > 9 ? "<em>+" + (cc.length - 9) + "</em>" : "") + "</span>" };

  root.innerHTML =
    '<div class="vd-hint"><span class="vd-dot"></span>Vorschau zum Ausprobieren – schalte Game-VPN und Geo-Fence unten an</div>' +
    '<div class="vd-zg"><div><small class="vd-lab">Dein Zugang</small><b>Das hier ist nur die Vorschau</b><small>In der App schaltest du den Game-VPN mit deinem Zugang genauso ein – für PC, PS5 und Xbox.</small></div><a class="vd-go" href="index.html#preise">Zugang holen</a></div>' +
    '<div class="vd-top">' +
      '<div class="vd-card vd-st">' +
        '<div class="vd-orb"><i></i></div><div class="vd-ht"><b class="vd-t1"></b><small class="vd-t2"></small></div>' +
        '<div class="vd-chs"></div>' +
        '<div class="vd-tiles">' +
          '<div><small>Region für CoD</small><b class="vd-reg"></b></div>' +
          '<div><small>Ping zum Server</small><b class="vd-ping"></b></div>' +
          '<div><small>Geo-Fence</small><b class="vd-geo"></b></div>' +
          '<div><small>Uhrzeit Mumbai</small><b class="vd-uhr"></b></div>' +
          '<div class="w"><small>Gerade Nacht</small><b class="vd-nacht"></b></div>' +
        '</div>' +
      '</div>' +
      '<div class="vd-card vd-map"><svg class="vd-svg" viewBox="0 0 720 286" aria-label="Karte: Du in Deutschland, Lobby über Mumbai">' +
        '<defs><linearGradient id="vdRt" x1="0" x2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#34d399"/></linearGradient>' +
        '<radialGradient id="vdGlB"><stop offset="0" stop-color="#3b82f6" stop-opacity=".55"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="vdGlG"><stop offset="0" stop-color="#10b981" stop-opacity=".45"/><stop offset="1" stop-color="#10b981" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="vdVig" cx="50%" cy="50%" r="70%"><stop offset=".65" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>' +
        '<rect x="0" y="0" width="720" height="286" fill="#0b1325"/><g class="vd-land">' + land + '</g><g class="vd-fls"></g><rect width="720" height="286" fill="url(#vdVig)" opacity=".5" pointer-events="none"/><g class="vd-dyn"></g></svg>' +
        '<div class="vd-leg"><span><i class="b"></i>Region · Lobby &amp; Matchmaking über Mumbai</span><span><i class="g"></i>Spielserver · erscheint, wenn der VPN an ist</span></div>' +
      '</div>' +
    '</div>' +
    '<div class="vd-row">' +
      '<div class="vd-card"><div class="vd-ch"><div><div class="vd-ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5" opacity=".45"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.2 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.2-3.6-8.5S9.6 5.8 12 3.5" opacity=".45"/><path d="M6.2 15.2C8.6 9.6 13.4 7.4 18 8.6" stroke-width="2.1" stroke-dasharray="2.6 2.2"/><circle cx="6.2" cy="15.6" r="2" fill="currentColor" stroke="none"/><circle cx="18.2" cy="8.4" r="2.3" stroke-width="2"/></svg></div><b>Game-VPN</b><small>CoD sieht die Region deines Servers – Spiel, Matchmaking und deine IP bleiben direkt, der Ping bleibt niedrig</small></div>' +
        '<button type="button" class="vd-sw" id="vdOn" role="switch" aria-checked="false" aria-label="Game-VPN"><i></i></button></div>' +
        '<small class="vd-lab">Server</small><div class="vd-srv"><b>' + flag("IN") + 'Mumbai</b><small>Indien · läuft immer</small></div>' +
        '<small class="vd-lab">Bei Bedarf · startet in ~1–2 Min, kostet nur solange die VPN an ist</small><div class="vd-bed">' +'<div class="vd-srv bed"><b>' + ff("SG") + 'Singapur</b><small>Singapur · bei Bedarf</small></div>' +'<div class="vd-srv bed"><b>' + ff("JP") + 'Tokio</b><small>Japan · bei Bedarf</small></div>' +'<div class="vd-srv bed"><b>' + ff("KR") + 'Seoul</b><small>Südkorea · bei Bedarf</small></div>' +'<div class="vd-srv bed"><b>' + ff("AU") + 'Sydney</b><small>Australien · bei Bedarf</small></div>' +'<div class="vd-srv bed"><b>' + ff("ZA") + 'Johannesburg</b><small>Südafrika · bei Bedarf</small></div>' +'<div class="vd-srv bed"><b>' + ff("BR") + 'São Paulo</b><small>Brasilien · bei Bedarf</small></div>' +'<div class="vd-srv bed"><b>' + ff("MX") + 'Mexiko-Stadt</b><small>Mexiko · bei Bedarf</small></div>' +'</div></div>' +
      '<div class="vd-card"><div class="vd-ch"><div><div class="vd-ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5V6z"/><path d="M9 12l2 2 4-4"/></svg></div><b>Geo-Fence</b><small>Ping-Tests nur zu Rechenzentren in der gewählten Region – Spielserver bleiben nah</small></div>' +
        '<button type="button" class="vd-sw" id="vdFe" role="switch" aria-checked="false" aria-label="Geo-Fence"><i></i></button></div>' +
        '<small class="vd-lab">Region</small><div class="vd-grp">' +
          '<button type="button" class="vd-o cust" disabled><b>Eigene Auswahl</b><small>Länder selbst wählen, mit Ping und Ortszeit · in der App</small></button>' +
          GRUPPEN.map(function (g) { return '<button type="button" class="vd-o" data-r="' + g.id + '"><b>' + esc(g.name) + "</b>" + flr(g.cc) + "<small>" + g.cc.length + " Länder</small></button>" }).join("") +
        '</div><small class="vd-lab">Einzelnes Land</small><div class="vd-chips">' +
          EINZEL.map(function (c) { return '<button type="button" class="vd-o vd-c" data-r="' + c + '">' + flag(c) + esc(NAME[c]) + "</button>" }).join("") +
        '</div></div>' +
    '</div>' +
    '<div class="vd-card vd-mt"><div class="vd-mh"><b>Letzte Matches</b><span class="vd-btn">Aktualisieren</span></div>' +
      '<small class="vd-sub">Welcher Spielserver es wirklich war – so siehst du, ob VPN und Geo-Fence wirken. (Beispieldaten)</small>' +
      '<div class="vd-tw"><table class="vd-tb"><thead><tr><th>Zeit</th><th>Spielserver</th><th>Dauer</th><th>VPN</th><th>Geo-Fence</th></tr></thead><tbody>' +
      '<tr><td>06.11. 21:42</td><td>' + flag("NL") + '<b>Niederlande</b> <small>35.204.88.17</small></td><td>24 min</td><td class="ok">an</td><td class="ok">Niederlande</td></tr><tr><td>06.11. 21:10</td><td>' + flag("NL") + '<b>Niederlande</b> <small>35.204.61.230</small></td><td>18 min</td><td class="ok">an</td><td class="ok">Niederlande</td></tr><tr><td>06.11. 20:47</td><td>' + flag("GB") + '<b>Großbritannien</b> <small>95.179.228.96</small></td><td>12 min</td><td class="ok">an</td><td class="ok">Großbritannien</td></tr><tr><td>06.11. 20:21</td><td>' + flag("GB") + '<b>Großbritannien</b> <small>78.141.236.38</small></td><td>21 min</td><td class="ok">an</td><td class="ok">Großbritannien</td></tr><tr><td>05.11. 23:05</td><td>' + flag("PL") + '<b>Polen</b> <small>70.34.246.245</small></td><td>16 min</td><td class="ok">an</td><td class="ok">Polen</td></tr><tr><td>05.11. 22:38</td><td>' + flag("DE") + '<b>Deutschland</b> <small>35.207.159.144</small></td><td>27 min</td><td>aus</td><td>aus</td></tr><tr><td>05.11. 22:02</td><td>' + flag("IT") + '<b>Italien</b> <small>72.146.29.233</small></td><td>9 min</td><td>aus</td><td>aus</td></tr><tr><td>05.11. 21:40</td><td>' + flag("FR") + '<b>Frankreich</b> <small>95.179.217.175</small></td><td>14 min</td><td class="ok">an</td><td>aus</td></tr>' +
      '</tbody></table></div></div>' +
    '<div class="vd-card vd-mt"><b class="vd-h3">VPN-Zugang freischalten</b><small class="vd-sub">Dein Schlüssel bleibt verschlüsselt auf diesem PC.</small>' +
      '<div class="vd-step"><span class="vd-num">1</span><div><b>Code eingeben</b><small>Tester-Code, Bestell-Nr. aus der Kaufbestätigung oder Freischalt-Code (GBZ1:) – der Server prüft ihn und schaltet diesen PC frei.</small>' +
      '<div class="vd-code"><span>Tester-Code, Bestell-Nr. oder GBZ1:…</span><a class="vd-fs" href="index.html#preise">Freischalten</a></div></div></div>' +
      '<small class="vd-sub vd-imp">Hier gibst du in der App nach dem Kauf deine Bestell-Nr. ein – fertig.</small></div>';

  var paths = {};
  root.querySelectorAll(".vd-land path").forEach(function (p) { (paths[p.getAttribute("data-c")] = paths[p.getAttribute("data-c")] || []).push(p) });
  var cls = function (cc, c, an) { (paths[cc] || []).forEach(function (p) { p.classList.toggle(c, an) }) };
  cls("DE", "me", true);

  var VB = null, ZA = 0, svg = null;
  function zoom(t) {               // weicher Zoom wie in der App (700 ms, ease-out)
    svg = svg || $(".vd-svg");
    if (!VB) { VB = t; svg.setAttribute("viewBox", t.join(" ")); return }
    var a = VB.slice(), t0 = performance.now(), id = ++ZA;
    (function st() { if (id !== ZA) return; var p = Math.min((performance.now() - t0) / 700, 1), k = 1 - Math.pow(1 - p, 3);
      VB = a.map(function (v, i) { return v + (t[i] - v) * k }); svg.setAttribute("viewBox", VB.join(" ")); if (p < 1) setTimeout(st, 16) })();
  }

  function zeichnen() {
    var reg = FENCES.filter(function (f) { return f.id === st.reg })[0], eins = st.fence && reg.cc.length === 1 ? reg.cc[0] : null;
    FENCES.forEach(function (f) { f.cc.forEach(function (c) { cls(c, "fz", false) }) });
    if (st.fence) reg.cc.forEach(function (c) { cls(c, "fz", true) });
    cls("IN", "hl", st.on);
    var hx = X(DU[0]), hy = Y(DU[1]), x2 = X(SV[0]), y2 = Y(SV[1]), gp = eins && MID[eins] ? MID[eins] : null;
    var zc = !st.fence && reg.cc.length === 1 ? reg.cc[0] : null, zp = zc && MID[zc] ? MID[zc] : null;   // Geo-Fence aus: Ziel gedimmt als Vorschau
    var tz = gp || zp, PX = [hx, x2].concat(tz ? [X(tz[0])] : []), PY = [hy, y2].concat(tz ? [Y(tz[1])] : []);
    var AR = 720 / 286, x0 = Math.min.apply(0, PX), x9 = Math.max.apply(0, PX), y0 = Math.min.apply(0, PY), y9 = Math.max.apply(0, PY);
    var zw = Math.min(Math.max((x9 - x0) * 1.35, (y9 - y0 + 40) * 1.35 * AR, 200), 720), zh = zw / AR, cx = (x0 + x9) / 2, cy = (y0 + y9) / 2 - zh * .06;
    zoom([Math.min(Math.max(cx - zw / 2, 0), 720 - zw), Math.min(Math.max(cy - zh / 2, 0), 286 - zh), zw, zh]);
    var q = zw / 720, s16 = q * 1.6, tcc = eins || zc;
    var PN = { DE: 1, IN: 1 }; if (tcc) PN[tcc] = 1;
    $(".vd-fls").innerHTML = window.VPD_WELT.filter(function (w) { return w[3] != null && !PN[w[0]] && (w[5] <= 2 || (w[5] === 3 && w[1].length > 2500)) })
      .map(function (w) { return mf(w[0], X(w[3]), Y(w[4]), (w[5] <= 2 ? 9 : 7) * s16) }).join("");
    var bog = function (a, b, c, h) { return "M" + a + "," + b + " Q" + (a + c[0]) / 2 + "," + (Math.min(b, c[1]) - Math.hypot(c[0] - a, c[1] - b) * h - 6 * s16) + " " + c[0] + "," + c[1] };
    var RT = bog(hx, hy, [x2, y2], .25), g = "", GR = "";
    g += '<g class="vd-fade' + (st.on ? "" : " vd-pre") + '"><path class="vd-arcg" d="' + RT + '"/><path class="vd-arc" d="' + RT + '"/><circle class="vd-pt" cx="' + x2 + '" cy="' + y2 + '" r="' + 5 * s16 + '" fill="#4f8ff7"/></g>';
    if (tz) { GR = bog(hx, hy, [X(tz[0]), Y(tz[1])], .3);
      g += '<g' + (gp ? "" : ' opacity=".8"') + '><path class="vd-garcg" d="' + GR + '"/><path class="vd-garc" d="' + GR + '"/><circle class="vd-gpt"' + (gp ? "" : ' style="opacity:.55"') + ' cx="' + X(tz[0]) + '" cy="' + Y(tz[1]) + '" r="' + 4.5 * s16 + '"/></g>' }
    g += '<circle cx="' + hx + '" cy="' + hy + '" r="' + 30 * s16 + '" fill="url(#vdGlB)" pointer-events="none"/><circle cx="' + x2 + '" cy="' + y2 + '" r="' + 36 * s16 + '" fill="url(#vdGlG)" pointer-events="none" opacity="' + (st.on ? 1 : .5) + '"/>';
    g += '<circle r="' + 3.5 * s16 + '" fill="#fff" opacity="' + (st.on ? 1 : .45) + '"><animateMotion dur="2.4s" repeatCount="indefinite" path="' + RT + '"/></circle>';
    if (gp) g += '<circle r="' + 1.9 * s16 + '" fill="#fde68a"><animateMotion dur="1.6s" repeatCount="indefinite" path="' + GR + '"/></circle>';
    g += '<circle class="vd-pt" cx="' + hx + '" cy="' + hy + '" r="' + 4.5 * s16 + '" fill="#93c5fd"/>';
    if (tz) g += pin(tcc, X(tz[0]), Y(tz[1]), "#f59e0b", NAME[tcc], "a", q, gp ? 1 : .8, X(tz[0]) < hx);
    var nah = tz && Math.hypot(X(tz[0]) - hx, Y(tz[1]) - (hy - 26 * q)) < 16 * q;
    g += pin("IN", x2, y2, "#34d399", "Lobby · Mumbai", "g", q, st.on ? 1 : .6) + pin("DE", hx, hy, "#fff", "Du", "b", nah ? q * .62 : q, 1, !!tz && X(tz[0]) > hx);
    $(".vd-dyn").innerHTML = g;

    root.classList.toggle("on", st.on);
    $(".vd-t1").textContent = st.on ? "Aktiv – Region Mumbai" : "Aus – alles direkt";
    $(".vd-t2").textContent = st.on ? "CoD sieht Mumbai, Spiel und Ping bleiben bei dir" : "Alles läuft direkt über deine Leitung";
    var ch = [];
    if (st.on) ch.push('<span><i style="background:#4f8ff7"></i>Server Mumbai</span>', "<span>Ping zum Server: 142 ms</span>");
    if (st.fence) ch.push('<span><i style="background:#3ddc84"></i>Spielserver: ' + esc(reg.name) + "</span>");
    ch.push('<span><i style="background:#3ddc84"></i>Spiel: direkt</span>');
    $(".vd-chs").innerHTML = ch.join("");
    $(".vd-reg").innerHTML = st.on ? flag("IN") + "Mumbai" : flag("DE") + "Deutschland";
    $(".vd-ping").textContent = st.on ? "142 ms" : "–";
    $(".vd-geo").innerHTML = st.fence ? (eins ? flag(eins) : "") + esc(reg.name) : "Aus";
    $("#vdOn").setAttribute("aria-checked", st.on); $("#vdFe").setAttribute("aria-checked", st.fence);
    root.querySelectorAll(".vd-o[data-r]").forEach(function (b) { b.classList.toggle("sel", b.getAttribute("data-r") === st.reg); b.classList.toggle("dim", !st.fence) });
  }

  function uhr() {
    var utc = Date.now(), hm = function (o) { var d = new Date(utc + o * 36e5); return [d.getUTCHours(), ("0" + d.getUTCMinutes()).slice(-2)] };
    var m = hm(5.5); $(".vd-uhr").innerHTML = flag("IN") + m[0] + ":" + m[1];
    var n = NACHT.filter(function (r) { var h = +new Intl.DateTimeFormat("en-GB", { timeZone: r[2], hour: "2-digit", hourCycle: "h23" }).format(utc); return h >= 2 && h < 8 });   // Nacht = 2–8 Uhr wie in der App
    var fl2 = function (c) { return FLAG[c] ? flag(c) : '<img class="vd-fl" src="img/flags/' + c.toLowerCase() + '.svg" alt="">' };
    $(".vd-nacht").innerHTML = n.length ? n.map(function (r) { return fl2(r[1]) + esc(r[0]) }).join(" · ") : "Nirgends";
  }

  $("#vdOn").onclick = function () { st.on = !st.on; zeichnen() };
  $("#vdFe").onclick = function () { st.fence = !st.fence; zeichnen() };
  root.querySelectorAll(".vd-o[data-r]").forEach(function (b) { b.onclick = function () { st.reg = b.getAttribute("data-r"); st.fence = true; zeichnen() } });
  zeichnen(); uhr(); setInterval(uhr, 30000);
})();
