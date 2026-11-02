// Weltkarte wie auf der Startseite (Kopie aus index1.js), hier ohne Geo-Fence
(function () {
  const svg = document.getElementById("vzSvg"), land = document.getElementById("vzLand"), fl = document.getElementById("vzFl"), top = document.getElementById("vzTop"), tip = document.getElementById("vzTip");
  const SRV = { iso: "IN", x: 520, y: 127 }, lang = document.documentElement.lang === "en" ? 4 : 3;
  const TZ = { Berlin: "DE", Vienna: "AT", Zurich: "CH", London: "GB", Paris: "FR", Amsterdam: "NL", Brussels: "BE", Rome: "IT", Madrid: "ES", Warsaw: "PL", Prague: "CZ", Istanbul: "TR", Stockholm: "SE", Oslo: "NO", Copenhagen: "DK", Helsinki: "FI", Lisbon: "PT", Athens: "GR", Budapest: "HU", Bucharest: "RO", Sofia: "BG", Belgrade: "RS", Zagreb: "HR", Dublin: "IE", Kiev: "UA", Kyiv: "UA", Moscow: "RU", Dubai: "AE", Riyadh: "SA", Kolkata: "IN", New_York: "US", Chicago: "US", Los_Angeles: "US", Toronto: "CA", Sydney: "AU", Tokyo: "JP" };
  let me = "DE";   // Land grob aus Zeitzone/Sprache, nichts wird verschickt
  try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop(); if (TZ[z]) me = TZ[z]; else { const l = (navigator.language || "").split("-")[1]; if (l) me = l.toUpperCase() } } catch (e) { }
  if (!WORLD.some(w => w[0] === me) || me === SRV.iso) me = "DE";
  function main(d) {
    let best = null, ba = -1;
    d.split("M").filter(Boolean).forEach(s => {
      const n = s.match(/-?[\d.]+/g).map(Number); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); y0 = Math.min(y0, n[i + 1]); y1 = Math.max(y1, n[i + 1]) }
      const a = (x1 - x0) * (y1 - y0); if (a > ba) { ba = a; best = [x0, y0, x1, y1] }
    });
    return best
  }
  const BOX = WORLD.map(w => main(w[1])), CEN = WORLD.map((w, i) => LABEL[w[0]] || [(BOX[i][0] + BOX[i][2]) / 2, (BOX[i][1] + BOX[i][3]) / 2]);
  land.innerHTML = WORLD.map((w, i) => `<path data-i="${i}" class="ct" d="${w[1]}"/>`).join("");
  const P = [...land.children];
  fl.innerHTML = WORLD.map((w, i) => {
    const b = BOX[i], c = w[0].toLowerCase(); if (Math.max(b[2] - b[0], b[3] - b[1]) < 6 || c.length > 2) return "";   // keine Flagge fuer Gebiete ohne ISO-Code (z. B. Somaliland)
    const r = Math.min(5, Math.max(3.2, Math.sqrt((b[2] - b[0]) * (b[3] - b[1])) / 8));
    return `<g class="fl" data-i="${i}" transform="translate(${CEN[i][0]} ${CEN[i][1]})"><clipPath id="k${c}"><circle r="${r}"/></clipPath><image href="flags/${c}.svg" x="${-r * 1.4}" y="${-r}" width="${r * 2.8}" height="${r * 2}" clip-path="url(#k${c})" preserveAspectRatio="xMidYMid slice"/><circle class="fr" r="${r}" stroke-width=".5"/></g>`
  }).join("");
  const FLG = {}; fl.querySelectorAll(".fl").forEach(g => FLG[g.dataset.i] = g);
  const H = 560, WELT = [0, (330 - H) / 2, 720, H];   // etwas höher als die Startseiten-Karte
  let ME, vb = WELT.slice();
  function pins(s) {
    const mx = (ME.x + SRV.x) / 2, my = Math.min(ME.y, SRV.y) - Math.hypot(SRV.x - ME.x, SRV.y - ME.y) * .25 - 6 * s, R = `M${ME.x} ${ME.y} Q ${mx} ${my} ${SRV.x} ${SRV.y}`;
    const flag = (c, x, y, col, lbl, cls) => `<g transform="translate(${x} ${y - 22 * s}) scale(${s})"><clipPath id="f${c}"><circle r="10"/></clipPath><image href="flags/${c}.svg" x="-14" y="-10" width="28" height="20" clip-path="url(#f${c})" preserveAspectRatio="xMidYMid slice"/><circle r="10.5" stroke="${col}" stroke-width="2"/>
      <g transform="translate(15 -9)"><rect width="${lbl.length * 6.4 + 14}" height="18" rx="6" class="${cls}"/><text x="7" y="12.5" font-family="Inter" font-size="10.5" font-weight="700" fill="#e9eef8">${lbl}</text></g></g>`;
    top.innerHTML = `<circle cx="${ME.x}" cy="${ME.y}" r="${40 * s}" fill="url(#gl)"/><circle cx="${SRV.x}" cy="${SRV.y}" r="${48 * s}" fill="url(#gg)"/>
      <path class="kglow" d="${R}" stroke="url(#rt)" stroke-width="7" vector-effect="non-scaling-stroke"/><path class="route" d="${R}" stroke="url(#rt)" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
      <circle r="${3.5 * s}" fill="#fff"><animateMotion dur="2.4s" repeatCount="indefinite" path="${R}"/></circle>
      <circle class="pin" cx="${ME.x}" cy="${ME.y}" r="${5 * s}" fill="#60a5fa"/><circle cx="${ME.x}" cy="${ME.y}" r="${4.5 * s}" fill="#93c5fd" stroke="#fff" stroke-width="${1.4 * s}"/>
      <circle class="pin" cx="${SRV.x}" cy="${SRV.y}" r="${5 * s}" fill="#34d399"/><circle cx="${SRV.x}" cy="${SRV.y}" r="${4.5 * s}" fill="#34d399" stroke="#fff" stroke-width="${1.4 * s}"/>
      ${flag(me.toLowerCase(), ME.x, ME.y, "#fff", "Du", "vlb")}<g class="kpin">${flag("in", SRV.x, SRV.y, "#34d399", "Lobby · Mumbai", "vlg")}</g>`
  }
  // Flaggen bleiben auf dem Bildschirm gleich gross, egal wie weit gezoomt ist
  const FG = [...fl.querySelectorAll(".fl")].map(g => [g, CEN[g.dataset.i]]);
  function flz(s) { const k = Math.min(1, s * 1.5); FG.forEach(([g, c]) => g.setAttribute("transform", `translate(${c[0]} ${c[1]}) scale(${k})`)) }
  let anim = 0;
  function zoomTo(T, ms) {
    const F = vb.slice(), t0 = performance.now(), id = ++anim;
    (function step(n) {
      if (id !== anim) return;
      const k = Math.min(1, (n - t0) / ms), e = 1 - Math.pow(1 - k, 3); vb = F.map((f, i) => f + (T[i] - f) * e);
      svg.setAttribute("viewBox", vb.join(" ")); pins(vb[2] / 720); flz(vb[2] / 720); if (k < 1) requestAnimationFrame(step)
    })(t0)
  }
  // Realistischer Ping: Luftlinie zum naechsten grossen Spiele-Rechenzentrum, Glasfaser ~200 km/ms, Umwege x1.6, +20 ms Heimanschluss (abgeglichen mit echten Messungen aus DE: NL 25, FR 26, GB 30, PL 36 ms)
  const DC = [[50.1, 8.7], [51.5, -0.1], [48.9, 2.4], [52.4, 4.9], [59.3, 18.1], [52.2, 21], [40.4, -3.7], [45.5, 9.2], [25.2, 55.3], [19.1, 72.9],
    [1.35, 103.8], [35.7, 139.7], [22.3, 114.2], [-33.9, 151.2], [-26.2, 28], [-23.5, -46.6], [39, -77.5], [41.9, -87.6], [32.8, -96.8], [34, -118.2], [45.6, -122.7]];
  function pingAt(x, y) {
    const la = 85 - y / 2, lo = x / 2 - 180, r = Math.PI / 180;
    const km = Math.min(...DC.map(([a, b]) => 6371 * 2 * Math.asin(Math.sqrt(Math.sin((a - la) * r / 2) ** 2 + Math.cos(la * r) * Math.cos(a * r) * Math.sin((b - lo) * r / 2) ** 2))));
    return Math.round(20 + km * 2 * 1.6 / 200);
  }
  // Land waehlen: Farben, Sperren, Ping, Zoom
  function setMe(iso, ms) {
    me = iso; const i0 = WORLD.findIndex(w => w[0] === iso); ME = { x: CEN[i0][0], y: CEN[i0][1] };
    let n = 0;
    P.forEach((p, i) => {
      const [x, y] = CEN[i], far = Math.hypot(x - ME.x, y - ME.y) > 170 && Math.hypot(x - SRV.x, y - SRV.y) > 140;
      const cls = i === i0 ? "me" : WORLD[i][0] === SRV.iso ? "srv" : far ? "blk" : "ok"; if (cls === "blk") n++;
      p.setAttribute("class", "ct " + cls);
      const g = FLG[i]; if (g) g.setAttribute("class", "fl" + (cls === "blk" ? " off" : "") + (cls === "me" || cls === "srv" ? " hid" : ""))
    });
    const ping = iso === "DE" ? 25 : pingAt(ME.x, ME.y);          // DE: echt gemessen (naechster CoD-Server NL)
    const st = document.querySelectorAll(".vz-st b");
    if (st[0]) st[0].innerHTML = ping + "<small>ms</small>";
    if (st[2]) st[2].innerHTML = n + "<small>Länder</small>";
    const bar = document.querySelector(".vz-bar i"); if (bar) bar.style.width = Math.min(100, ping / 2.5) + "%";
    const nm = document.getElementById("vzWho"); if (nm) nm.textContent = WORLD[i0][lang];
    // eng auf dich zoomen, Server bleibt im Bild
    const x0 = Math.min(ME.x, SRV.x) - 60, x1 = Math.max(ME.x, SRV.x) + 90, y0 = Math.min(ME.y, SRV.y) - 50, y1 = Math.max(ME.y, SRV.y) + 40;
    const w = Math.max(x1 - x0, (y1 - y0) * 720 / H, 300), h = w * H / 720;
    zoomTo([(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h], ms)
  }
  // Echt gemessen aus Deutschland (Game Booster, Geo-Fence aufs Land)
  const REAL_DE = { NL: "25", FR: "26", CH: "26", IT: "28", BE: "28", GB: "30", PL: "31–36", SE: "42", ES: "42", FI: "53" };
  // Tooltip + Klick
  // Nächstes Land zur Maus (Flagge/Mittelpunkt im Umkreis von 12 px), sonst das Land darunter – so treffen auch kleine Länder
  const ziel = e => {
    const r = svg.getBoundingClientRect(), k = vb[2] / r.width, x = vb[0] + (e.clientX - r.left) * k, y = vb[1] + (e.clientY - r.top) * k;
    let best = -1, bd = (12 * k) ** 2;
    CEN.forEach((c, i) => { const d = (c[0] - x) ** 2 + (c[1] - y) ** 2; if (d < bd) { bd = d; best = i } });
    if (best >= 0) return land.querySelector(`.ct[data-i="${best}"]`);
    const f = e.target.closest(".fl"); return f ? land.querySelector(`.ct[data-i="${f.dataset.i}"]`) : e.target.closest(".ct")
  };
  svg.addEventListener("mousemove", e => zeig(e));
  svg.addEventListener("mouseleave", () => tip.style.opacity = 0);
  svg.addEventListener("click", e => wahl(e));
  function zeig(e) {
    const p = ziel(e); if (!p) { tip.style.opacity = 0; return }
    const w = WORLD[p.dataset.i], r = svg.parentNode.getBoundingClientRect(), c = p.classList;
    const st = c.contains("blk") ? '<em class="x">gesperrt</em>' : c.contains("me") ? "<em>Du</em>" : c.contains("srv") ? '<em class="g">Lobby-Server</em>' : '<em class="g">erlaubt</em>';
    const rp = me === "DE" && REAL_DE[w[0]] ? `<small class="rp">Server dort: ${REAL_DE[w[0]]} ms aus DE · gemessen</small>` : "";
    tip.innerHTML = `<img src="flags/${w[0].toLowerCase()}.svg" alt="" >${w[lang]}${st}${rp}${c.contains("me") || c.contains("srv") ? "" : '<small>Klick: von hier spielen</small>'}`;
    const fi = tip.querySelector("img"); if (fi) fi.onerror = () => fi.remove();
    tip.style.cssText = `opacity:1;left:${Math.min(e.clientX - r.left + 14, r.width - 230)}px;top:${e.clientY - r.top + 14}px`
  }
  function wahl(e) { const p = ziel(e); if (p && WORLD[p.dataset.i][0] !== SRV.iso) { tip.style.opacity = 0; setMe(WORLD[p.dataset.i][0], 1100) } }
  // Zoom: Mausrad, Doppelklick
  function zoomBei(f, px, py) {
    anim++; const w = Math.min(720, Math.max(60, vb[2] * f)), h = w * H / 720;
    vb = [px - (px - vb[0]) * w / vb[2], py - (py - vb[1]) * h / vb[3], w, h];
    svg.setAttribute("viewBox", vb.join(" ")); pins(w / 720); flz(w / 720)
  }
  function punkt(e) { const r = svg.getBoundingClientRect(); return [vb[0] + (e.clientX - r.left) / r.width * vb[2], vb[1] + (e.clientY - r.top) / r.height * vb[3]] }
  svg.addEventListener("wheel", e => { e.preventDefault(); const [x, y] = punkt(e); zoomBei(e.deltaY < 0 ? .8 : 1.25, x, y) }, { passive: false });
  svg.addEventListener("dblclick", e => { const [x, y] = punkt(e); zoomBei(.5, x, y) });
  document.getElementById("vzReset").onclick = () => { anim++; vb = WELT.slice(); svg.setAttribute("viewBox", vb.join(" ")); pins(1); flz(1) };
  ME = { x: 380, y: 68 }; pins(1);
  setTimeout(() => setMe(me, 1800), 700);
})();
