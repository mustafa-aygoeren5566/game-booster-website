// Weltkarte wie in der App: alle Laender + Flaggen, Zoom auf dein Land, Land anklickbar (Vorschau "so waere es bei dir")
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
  let ME, vb = [0, 0, 720, 330];
  function pins(s) {
    const mx = (ME.x + SRV.x) / 2, my = Math.min(ME.y, SRV.y) - Math.hypot(SRV.x - ME.x, SRV.y - ME.y) * .25 - 6 * s, R = `M${ME.x} ${ME.y} Q ${mx} ${my} ${SRV.x} ${SRV.y}`;
    const flag = (c, x, y, col, lbl, cls) => `<g transform="translate(${x} ${y - 22 * s}) scale(${s})"><clipPath id="f${c}"><circle r="10"/></clipPath><image href="flags/${c}.svg" x="-14" y="-10" width="28" height="20" clip-path="url(#f${c})" preserveAspectRatio="xMidYMid slice"/><circle r="10.5" stroke="${col}" stroke-width="2"/>
      <g transform="translate(15 -9)"><rect width="${lbl.length * 6.4 + 14}" height="18" rx="6" class="${cls}"/><text x="7" y="12.5" font-family="Inter" font-size="10.5" font-weight="700" fill="#e9eef8">${lbl}</text></g></g>`;
    top.innerHTML = `<circle cx="${ME.x}" cy="${ME.y}" r="${40 * s}" fill="url(#gl)"/><circle cx="${SRV.x}" cy="${SRV.y}" r="${48 * s}" fill="url(#gg)"/>
      <path d="${R}" stroke="url(#rt)" stroke-width="${6 * s}" opacity=".3"/><path class="route" d="${R}" stroke="url(#rt)" stroke-width="${2.2 * s}" stroke-linecap="round" style="stroke-dasharray:${5 * s} ${7 * s}"/>
      <circle r="${3.5 * s}" fill="#fff"><animateMotion dur="2.4s" repeatCount="indefinite" path="${R}"/></circle>
      <circle class="pin" cx="${ME.x}" cy="${ME.y}" r="${5 * s}" fill="#60a5fa"/><circle cx="${ME.x}" cy="${ME.y}" r="${4.5 * s}" fill="#93c5fd" stroke="#fff" stroke-width="${1.4 * s}"/>
      <circle class="pin" cx="${SRV.x}" cy="${SRV.y}" r="${5 * s}" fill="#34d399"/><circle cx="${SRV.x}" cy="${SRV.y}" r="${4.5 * s}" fill="#34d399" stroke="#fff" stroke-width="${1.4 * s}"/>
      ${flag(me.toLowerCase(), ME.x, ME.y, "#fff", "Du", "lb")}${flag("in", SRV.x, SRV.y, "#34d399", "Lobby · Mumbai", "lg")}`
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
    const w = Math.max(x1 - x0, (y1 - y0) * 720 / 330, 300), h = w * 330 / 720;
    zoomTo([(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h], ms)
  }
  // Echt gemessen aus Deutschland (Game Booster, Geo-Fence aufs Land)
  const REAL_DE = { NL: "25", FR: "26", CH: "26", IT: "28", BE: "28", GB: "30", PL: "31–36", SE: "42", ES: "42", FI: "53" };
  // Tooltip + Klick
  land.addEventListener("mousemove", e => {
    const p = e.target.closest(".ct"); if (!p) { tip.style.opacity = 0; return }
    const w = WORLD[p.dataset.i], r = svg.parentNode.getBoundingClientRect(), c = p.classList;
    const st = c.contains("blk") ? '<em class="x">gesperrt</em>' : c.contains("me") ? "<em>Du</em>" : c.contains("srv") ? '<em class="g">Lobby-Server</em>' : '<em class="g">erlaubt</em>';
    const rp = me === "DE" && REAL_DE[w[0]] ? `<small class="rp">Server dort: ${REAL_DE[w[0]]} ms aus DE · gemessen</small>` : "";
    tip.innerHTML = `<img src="flags/${w[0].toLowerCase()}.svg" alt="" >${w[lang]}${st}${rp}${c.contains("me") || c.contains("srv") ? "" : '<small>Klick: von hier spielen</small>'}`;
    const fi = tip.querySelector("img"); if (fi) fi.onerror = () => fi.remove();
    tip.style.cssText = `opacity:1;left:${Math.min(e.clientX - r.left + 14, r.width - 230)}px;top:${e.clientY - r.top + 14}px`
  });
  land.addEventListener("mouseleave", () => tip.style.opacity = 0);
  land.addEventListener("click", e => { const p = e.target.closest(".ct"); if (p && WORLD[p.dataset.i][0] !== SRV.iso) { tip.style.opacity = 0; setMe(WORLD[p.dataset.i][0], 1100) } });
  document.getElementById("vzReset").onclick = () => { anim++; vb = [0, 0, 720, 330]; svg.setAttribute("viewBox", vb.join(" ")); pins(1); flz(1) };
  ME = { x: 380, y: 68 }; pins(1);
  setMe(me, 1);   // sofort fertig gezoomt anzeigen (kein Reinzoomen beim Laden)
})();

// Shop-Karten (eigene Grafiken, keine fremden Logos)
const ART = {
  vpn: '<circle cx="80" cy="95" r="56" fill="#0f1d3a" stroke="#3b82f6" stroke-width="2.5"/><path d="M24 95h112M80 39c18 16 26 35 26 56s-8 40-26 56c-18-16-26-35-26-56s8-40 26-56z" stroke="#60a5fa" stroke-width="2" opacity=".7"/><path d="M50 70 Q90 40 118 92" stroke="#93c5fd" stroke-width="3" stroke-dasharray="5 6" stroke-linecap="round"/><circle cx="50" cy="70" r="6" fill="#93c5fd"/><circle cx="118" cy="92" r="6" fill="#34d399"/>',
  geo: '<path d="M80 30c-26 0-46 20-46 45 0 34 46 80 46 80s46-46 46-80c0-25-20-45-46-45z" fill="#0f1d3a" stroke="#3b82f6" stroke-width="2.5"/><circle cx="80" cy="75" r="17" fill="none" stroke="#93c5fd" stroke-width="3"/><path d="M20 160h120" stroke="#3b82f6" stroke-width="2" opacity=".5"/><path d="M110 120l30 30M140 120l-30 30" stroke="#f87171" stroke-width="4" stroke-linecap="round"/>',
  snd: '<path d="M30 110v-20a50 50 0 0 1 100 0v20" stroke="#60a5fa" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="18" y="100" width="30" height="50" rx="12" fill="#0f1d3a" stroke="#3b82f6" stroke-width="2.5"/><rect x="112" y="100" width="30" height="50" rx="12" fill="#0f1d3a" stroke="#3b82f6" stroke-width="2.5"/>',
  perf: '<path d="M22 140a58 58 0 1 1 116 0" stroke="#1e3a6e" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M22 140a58 58 0 0 1 98-42" stroke="#3b82f6" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M80 140l30-34" stroke="#93c5fd" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="140" r="8" fill="#93c5fd"/>',
  col: '<circle cx="62" cy="80" r="38" fill="#3b82f6" opacity=".55"/><circle cx="100" cy="80" r="38" fill="#34d399" opacity=".45"/><circle cx="81" cy="112" r="38" fill="#a78bfa" opacity=".45"/>',
  map: '<path d="M20 50l40-16 40 16 40-16v104l-40 16-40-16-40 16z" fill="#0f1d3a" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round"/><path d="M60 34v104M100 50v104" stroke="#3b82f6" stroke-width="2" opacity=".6"/><circle cx="82" cy="88" r="7" fill="#fbbf24"/><path d="M30 120l20-14 18 10" stroke="#93c5fd" stroke-width="2.5" fill="none" stroke-dasharray="4 4"/>'
};
const SHOP = [["vpn", "Game-VPN", "Lobby", "Game-VPN", 1]];
const shield = '<svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z"/></svg>';
// fertige Thumbnails (Bild ersetzt die gezeichnete Karte)
const IMG = { "Game-VPN": "img/game-vpn.webp?v=3" };
document.getElementById("shopGrid").innerHTML = SHOP.map(([a, t, s, p, on]) => IMG[t] ? `<div class="sp-w"><a class="sc" href="#preise"><img class="bgx" src="${IMG[t]}" alt="${p}" style="object-fit:cover"><span class="st2" style="top:10px;bottom:auto">Verfügbar</span></a><div class="sp-t">Game-VPN Lobby Control <em>MW4 / BO7 / Warzone etc.</em></div></div>` : `<a class="sc ${on ? "" : "soon2"}" href="${on ? "#preise" : "#shop"}">
  <svg class="bgx" viewBox="0 0 320 200" preserveAspectRatio="none"><path d="M0 200L120 0h40L40 200z" fill="#1e3a8a" opacity=".35"/><path d="M60 200L180 0h18L78 200z" fill="#3b82f6" opacity=".25"/><path d="M0 170l60 30H0z" fill="#3b82f6" opacity=".7"/><path d="M320 0v26L290 0z" fill="#3b82f6" opacity=".6"/></svg>
  <svg class="art" viewBox="0 0 160 170" fill="none">${ART[a]}</svg>
  <div class="brand">${shield}GAME BOOSTER</div>
  <div class="ttl">${t}<small>${s}</small></div>
  <span class="pill">${p}</span><span class="st2">${on ? "Verfügbar" : "Bald"}</span></a>`).join("");
// Gratis-Tool: DMZ-Karte (Kartendaten von DMZ Codex, mit deren Erlaubnis und Link)
{ const g = document.getElementById("shopGrid"); g.classList.add("zwei");
  g.insertAdjacentHTML("beforeend", `<div class="sp-w"><div style="position:relative"><a class="sp-cr2" href="https://dmzcodex.com" target="_blank" rel="noopener" title="Kartendaten von DMZ Codex"><svg viewBox="0 0 20 24" width="15" height="18"><path d="M2 3a2 2 0 0 1 2-2h8l6 6v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" fill="#f5c518"/><circle cx="6" cy="6" r="1.6" fill="#111"/><path d="M5 15l5-3.5 5 3.5M5 19.5l5-3.5 5 3.5" stroke="#111" stroke-width="2.2" fill="none"/></svg><span><small>Kartendaten</small><b>DMZ</b> CODEX</span></a><a class="sc" href="https://github.com/mustafa-aygoeren5566/game-booster-releases/releases/latest/download/GameBooster-Setup.exe"><img class="bgx" src="img/dmz-karte.webp?v=1" alt="DMZ-Karte" style="object-fit:cover" loading="lazy"><span class="st2" style="top:10px;bottom:auto">Gratis</span></a></div>
  <div class="sp-t">DMZ-Karte <em>Schlüssel, Loot &amp; Infos</em></div></div>`) }

// PayPal direkt im Kauf-Fenster (Kunde bleibt auf der Seite).
// PP_CLIENT: "sb" = PayPal-Testmodus. Fuer echte Zahlungen hier die Client-ID aus developer.paypal.com eintragen (die ist oeffentlich, kein Geheimnis).
const PP_CLIENT = "BAAcQ0JuzYeVDaFygLlRZzAYNTOyEa737GmkxfFiO_MYI8ObnTcNwJhYyfMPdY1ycl6m1yeFBpYTcSmJQQ";   // Live-App
const buy = document.getElementById("buy"), bOk = document.getElementById("bOk"), bCode = document.getElementById("bCode"), ppBox = document.getElementById("ppBox"), ppMsg = document.getElementById("ppMsg");
let plan = null, ppLoad = null;
let isNew = true;
const codeOk = () => isNew || /^GB-[A-Za-z0-9+/=_-]{6,}$/.test(bCode.value.trim());
document.querySelectorAll("[data-hv]").forEach(x => x.onclick = () => {
  isNew = x.dataset.hv === "0"; document.querySelectorAll("[data-hv]").forEach(y => y.classList.toggle("on", y === x));
  document.getElementById("cfHave").hidden = isNew; document.getElementById("cfNew").hidden = !isNew; gate();
});
function sdk() {
  return ppLoad ||= new Promise((ok, err) => { const s = document.createElement("script"); s.src = `https://www.paypal.com/sdk/js?client-id=${PP_CLIENT}&currency=EUR&intent=capture`; s.onload = ok; s.onerror = err; document.head.appendChild(s) });
}
// PayPal im Hintergrund vorladen, damit die Zahlungsarten beim ersten Klick sofort da sind
addEventListener("load", () => setTimeout(() => sdk().catch(() => { ppLoad = null }), 1200));
// Server-Check: bei Stoerung oder Wartung keine Zahlung annehmen (sonst bezahlt, aber nicht freischaltbar)
let srvOk = true, srvMsg = "", srvArt = "";
async function kaufCheck() {
  if (typeof SHOP_API === "undefined" || !SHOP_API) return;
  try { const r = await (await fetch(SHOP_API + "/api/health", { cache: "no-store", signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined })).json();
    const s = r.status; srvOk = !!r.ok && !s; srvArt = s ? s.art : "";
    srvMsg = s ? (s.art === "stoerung" ? "Störung" : "Wartung") + (s.bis ? " bis ca. " + new Date(s.bis * 1000).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) + " Uhr" : "") + (s.text ? ": " + s.text : ".") : "";
  } catch (e) { srvOk = false; srvMsg = ""; srvArt = ""; }
  gate();
}
function gate() {
  const ready = srvOk && bOk.checked && codeOk();
  ppBox.classList.toggle("dis", !ready);
  ppMsg.classList.toggle("ppstoer", !srvOk); ppMsg.classList.toggle("ppwart", !srvOk && srvArt === "wartung");
  ppMsg.textContent = !srvOk ? (srvMsg ? srvMsg + " Kauf ist gleich wieder möglich, es wurde nichts abgebucht." : "Unser Server ist gerade nicht erreichbar. Bitte versuch es in ein paar Minuten erneut, es wurde nichts abgebucht.") : !codeOk() ? "Trag deinen GB-Code ein." : !bOk.checked ? "Bitte noch den Haken setzen." : "Wähle deine Zahlungsart:";
  ppMsg.classList.toggle("go", ready);
}
bOk.onchange = gate; bCode.oninput = gate;
let ppRun = 0, ppBtn = null;
async function render() {
  const my = ++ppRun;   // bei schnellen Mehrfachaufrufen (z. B. Rabattcode) nur den letzten zeichnen – sonst doppelte Knoepfe
  try { await sdk() } catch (e) { ppMsg.textContent = "PayPal konnte nicht geladen werden. Bitte später erneut versuchen."; return }
  if (my !== ppRun) return;
  try { ppBtn && ppBtn.close() } catch (e) {}
  ppBox.innerHTML = "";
  ppBtn = paypal.Buttons({
    style: { layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 44 },
    onClick: (d, actions) => { if (!(srvOk && bOk.checked && codeOk())) { gate(); return actions.reject() } return actions.resolve() },
    createOrder: (d, actions) => actions.order.create({
      purchase_units: [{ description: "Game-VPN – " + plan.name, custom_id: ((isNew ? "NEU" : bCode.value.trim()) + (plan.rab ? "|" + plan.rab : "")).slice(0, 127), amount: { currency_code: "EUR", value: plan.rab ? plan.pay : plan.value } }],
      application_context: { shipping_preference: "NO_SHIPPING", brand_name: "Game Booster" }
    }),
    onApprove: (d, actions) => actions.order.capture().then(async o => {
      document.getElementById("bOid").textContent = o.id; lastOid = o.id;
      if (SHOP_API) fetch(SHOP_API + "/api/paid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: o.id, zust: "2026-11-01" }) }).catch(() => {});
      document.getElementById("bForm").hidden = true; document.getElementById("bDone").hidden = false;
      const txt = document.getElementById("bDoneTxt");
      document.getElementById("bRd").hidden = true; document.getElementById("bZ").hidden = true;
      if (isNew) {
                txt.innerHTML = 'Danke! Lade jetzt <a href="https://github.com/mustafa-aygoeren5566/game-booster-releases/releases/latest/download/GameBooster-Setup.exe">Game Booster</a> herunter. Danach in der App unter <b>Game-VPN → Code eingeben</b> diese Bestell-Nr. eintragen, fertig. <b>Schreib sie dir auf.</b>';
        return;
      }
      if (!SHOP_API) { txt.textContent = "Danke! Dein Freischalt-Code kommt in den nächsten Stunden per E-Mail an deine PayPal-Adresse."; return }
      txt.textContent = "Danke! Du wirst gerade freigeschaltet …";
      const r = await redeem(o.id, bCode.value.trim());
      if (r.ok) { txt.textContent = "Fertig – dein Zugang ist aktiv bis " + new Date(r.bis).toLocaleDateString("de-DE") + "."; showCode("bZ", "bZc", r.code) }
      else { document.getElementById("bRd").hidden = false; document.getElementById("bRd").textContent = "Nochmal versuchen" }
      if (!r.ok) txt.innerHTML = "Zahlung ist da, die Freischaltung hat aber nicht sofort geklappt (" + r.msg + "). Versuch es gleich unter <a href=\"#einloesen\">Bestellung einlösen</a> oder schreib an <a href=\"mailto:mustafa-aygoeren@web.de\">mustafa-aygoeren@web.de</a>.";
    }),
    onCancel: () => { ppMsg.textContent = "Zahlung abgebrochen – es wurde nichts abgebucht und nichts gekauft."; ppMsg.classList.remove("go") },
    onError: () => { ppMsg.textContent = "Die Zahlung hat nicht geklappt. Es wurde nichts abgebucht."; ppMsg.classList.remove("go") }
  });
  ppBtn.render("#ppBox");
}
// SHOP_API: Adresse des Shop-Dienstes auf dem VPN-Server (prueft die Zahlung direkt bei PayPal). Leer = Freischaltung per Hand.
const SHOP_API = "https://65-20-95-163.sslip.io";
let lastOid = "";
async function redeem(order, code) {
  if (!SHOP_API) return { ok: false, msg: "automatische Freischaltung ist noch nicht aktiv" };
  try {
    const r = await fetch(SHOP_API + "/api/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order, code }) });
    return await r.json();
  } catch (e) { return { ok: false, msg: "Server nicht erreichbar" } }
}
function showCode(box, el, code) { document.getElementById(el).textContent = code; document.getElementById(box).hidden = false }
document.addEventListener("click", e => {
  const c = e.target.closest("[data-copy]"); if (!c) return;
  navigator.clipboard.writeText(document.getElementById(c.dataset.copy).textContent).then(() => { c.textContent = "Kopiert ✓"; setTimeout(() => c.textContent = "Kopieren", 1600) });
});
const rdm = document.getElementById("rdm"), rMsg = document.getElementById("rMsg");
function openRdm() {
  buy.classList.remove("on"); rdm.classList.add("on");
  document.getElementById("rOid").value = lastOid; document.getElementById("rCode").value = isNew ? "" : bCode.value.trim(); document.getElementById("rZ").hidden = true;
  rMsg.textContent = SHOP_API ? "" : "Die automatische Einlösung ist noch nicht aktiv – schick Bestell-Nr. und Code an mustafa-aygoeren@web.de.";
}
window.addEventListener("hashchange", () => { if (location.hash === "#einloesen") { openRdm(); history.replaceState(null, "", location.pathname) } });
if (location.hash === "#einloesen") openRdm();
document.getElementById("bRd").onclick = openRdm;
document.getElementById("rX").onclick = () => rdm.classList.remove("on");
rdm.onclick = e => { if (e.target === rdm) rdm.classList.remove("on") };
document.getElementById("rGo").onclick = async () => {
  const go = document.getElementById("rGo"); go.disabled = true; rMsg.classList.remove("go"); rMsg.textContent = "Prüfe Zahlung bei PayPal …";
  const r = await redeem(document.getElementById("rOid").value.trim(), document.getElementById("rCode").value.trim());
  go.disabled = false;
  if (r.ok) { rMsg.textContent = "Bezahlt ✓ – Zugang aktiv bis " + new Date(r.bis).toLocaleDateString("de-DE") + "."; rMsg.classList.add("go"); showCode("rZ", "rZc", r.code) }
  else rMsg.textContent = r.msg;
};
document.querySelectorAll("[data-plan]").forEach(b => b.onclick = () => {
  plan = { name: b.dataset.plan, value: b.dataset.price.replace(/[^0-9,]/g, "").replace(",", "."), rab: "", pay: "" };
  document.getElementById("bT").textContent = "Abo: " + plan.name;
  document.getElementById("bRab").value = ""; document.getElementById("bRabMsg").textContent = ""; document.getElementById("bRabTag").hidden = true; document.getElementById("bRabTag").parentNode.classList.remove("on");
  rabShow();
  document.getElementById("bForm").hidden = false; document.getElementById("bDone").hidden = true;
  bOk.checked = false; gate(); buy.classList.add("on"); render(); kaufCheck();
  autoRab();
});
// Link-Code (?c=, z. B. Tagesbonus aus der App) und laufende Aktion: den hoeheren Rabatt eintragen, nicht beide gegeneinander
async function autoRab() {
  if (!REF && promoOn()) { document.getElementById("bRab").value = PROMO.code; document.getElementById("bRabGo").click(); return }
  await promoBereit;
  const cs = [...new Set([REF, promoOn() ? PROMO.code : ""].filter(Boolean))];
  if (!cs.length) return;
  let best = cs[0];
  if (cs.length > 1 && SHOP_API) {
    const pct = await Promise.all(cs.map(c => fetch(SHOP_API + "/api/rabatt?c=" + encodeURIComponent(c)).then(r => r.json()).then(r => r.ok ? r.pct : 0).catch(() => 0)));
    best = cs[pct.indexOf(Math.max(...pct))];
  }
  document.getElementById("bRab").value = best; document.getElementById("bRabGo").click();
}
// Aktion oben bei den Preisen: kommt vom Shop-Server (in der Admin-App geplant, erscheint am Starttag von selbst).
// Ohne geplante Aktion gilt die Start-Aktion als Rueckfall; nach Ablauf blendet sich das Banner selbst aus.
const PROMO0 = { titel: "Start-Aktion", text: "", code: "START10", pct: 10, bis: "2026-11-22", farbe: "blau" };
let PROMO = PROMO0, PROMO_C = null;
try { const c = JSON.parse(localStorage.getItem("gbPromo") || "null"); if (c && c.code && c.bis) PROMO = PROMO_C = c; } catch (e) { }
const promoOn = () => PROMO && PROMO.code && new Date() <= new Date(PROMO.bis + "T23:59:59");
try { const f = (PROMO_C && promoOn() && PROMO_C.farbe) || ""; const an = document.querySelector(".ann"); if (f && an && /^[a-z0-9]+$/.test(f)) an.className = "ann wait pa pf-" + f; } catch (e) { }
const promoBereit = (SHOP_API ? fetch(SHOP_API + "/api/aktion", { signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined }).then(r => r.json()).then(r => { if (r.ok) { PROMO = r.aktion || PROMO0; BALD = r.bald || null; try { localStorage.setItem("gbPromo", JSON.stringify(PROMO)); localStorage.setItem("gbBald", JSON.stringify(BALD)); } catch (e) { } zeigeBald(); } }).catch(() => { }) : Promise.resolve()).then(zeigePromo).finally(() => { const n = document.querySelector(".ann"); n && n.classList.remove("wait"); });
// Teaser: naechste Aktion startet in 1-3 Tagen (Code erst am Starttag)
let BALD = null; try { BALD = JSON.parse(localStorage.getItem("gbBald") || "null") } catch (e) {}
function zeigeBald() {
  const e = document.getElementById("prBald"); if (!e) return;
  clearInterval(zeigeBald.t);
  const start = BALD && new Date(BALD.ab + "T00:00:00");
  if (!BALD || !(start > new Date()) || start - new Date() > 4 * 864e5) { e.hidden = true; return; }
  const tag = start.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
  e.className = "bald promo pf-" + (BALD.farbe || "blau"); e.hidden = false; requestAnimationFrame(() => { const v = e.querySelector(".pv"); v && e.style.setProperty("--pvw", v.offsetWidth + "px"); });
  e.innerHTML = `<div class="pv"><em>−${+BALD.pct} %</em><span>Rabatt</span></div><div class="bl"><span class="pk">Demnächst</span><span class="bt">${esc(BALD.titel)}</span><span class="bd"><b>Start: ${tag} · 00:00 Uhr</b> −${+BALD.pct} % auf alle Abos</span></div>`
    + '<div class="bc"><span class="bs">startet in</span><span class="bz"><u></u><s>:</s><u></u><s>:</s><u></u></span><span class="bn" hidden></span></div>';
  const u = e.querySelectorAll(".bz u"), bz = e.querySelector(".bz"), bn = e.querySelector(".bn");
  const tick = () => { const s = Math.max(0, Math.floor((start - new Date()) / 1000)), z = n => String(n).padStart(2, "0");
    if (!s) { clearInterval(zeigeBald.t); e.hidden = true; return; }
    const tg = s >= 86400; bz.hidden = tg; bn.hidden = !tg;
    if (tg) { bn.textContent = Math.ceil(s / 86400) + " Tagen"; return; }
    u[0].textContent = z(Math.floor(s / 3600)); u[1].textContent = z(Math.floor(s / 60) % 60); u[2].textContent = z(s % 60); };
  tick(); zeigeBald.t = setInterval(tick, 1000);
}
function zeigePromo() {
  if (!promoOn()) return;
  const tage = Math.ceil((new Date(PROMO.bis + "T23:59:59") - new Date()) / 864e5), rest = tage <= 1 ? "nur noch heute" : `nur noch ${tage} Tage`;
  const at = document.getElementById("annTxt"), el = document.getElementById("promo");
  if (at) { at.innerHTML = `<span class="ap">−${PROMO.pct} %</span><span class="at">${esc(PROMO.titel)}</span><span class="ac">${esc(PROMO.code)}</span><span class="ar">${rest}</span><span class="ap">−${PROMO.pct} %</span>`; at.closest(".ann").className = "ann pa pf-" + (PROMO.farbe || "gruen"); try { localStorage.setItem("gbPF", PROMO.farbe || "gruen"); } catch (e) { } at.style.display = "contents"; }
  document.getElementById("prTitel").textContent = PROMO.titel;
  document.getElementById("prPct").textContent = `−${PROMO.pct} %`;
  document.getElementById("prBis").textContent = PROMO.bis.split("-").reverse().join(".") + " (" + rest + ")";
  document.getElementById("prInfo").textContent = PROMO.text || "Auf alle Abos, einmalig, kein Auto-Abo";
  clearInterval(zeigePromo.t);
  if (tage <= 1) {   // letzter Tag: laufender Countdown statt "nur noch heute"
    const ende = new Date(PROMO.bis + "T23:59:59"), bis = PROMO.bis.split("-").reverse().join(".");
    const tick = () => { const s = Math.max(0, Math.floor((ende - new Date()) / 1000)), z = n => String(n).padStart(2, "0");
      const t = "endet in " + z(Math.floor(s / 3600)) + ":" + z(Math.floor(s / 60) % 60) + ":" + z(s % 60);
      const ar = document.querySelector(".ann .ar"); if (ar) ar.textContent = t;
      document.getElementById("prBis").textContent = bis + " (" + t + ")"; };
    tick(); zeigePromo.t = setInterval(tick, 1000);
  }
  document.getElementById("prTxt").textContent = PROMO.code;
  el.className = "promo pf-" + (PROMO.farbe || "gruen"); el.hidden = false; const pvw = () => { const v = el.querySelector(".pv"); v && el.style.setProperty("--pvw", v.offsetWidth + "px"); }; requestAnimationFrame(pvw); if (!zeigePromo.rs) { zeigePromo.rs = 1; addEventListener("resize", pvw); }
  el.classList.add("hm");
  const MK = { xmas: ["img/maskottchen-xmas.webp?v=1", "25.2%", "46.1%", "16.8deg", "13.00,37.18 40.22,44.05 41.31,45.75 38.35,53.99 36.33,54.90 9.11,48.03 8.03,46.34 10.98,38.09", "gold"], rot: ["img/maskottchen-rot.webp?v=1", "27.8%", "53.9%", "14.8deg", "13.52,44.62 45.73,51.14 47.08,52.92 44.03,61.81 41.73,62.84 9.51,56.31 8.17,54.54 11.21,45.65", "rot"], normal: ["img/maskottchen.webp?v=2", "27.8%", "53.9%", "15.2deg", "15.59,44.90 46.19,51.32 47.52,53.10 44.37,61.98 42.05,63.00 11.45,56.58 10.12,54.80 13.27,45.92"], mw4: ["img/maskottchen-mw4.webp?v=1", "26%", "46%", "16.5deg", "13.95,37.43 41.91,44.04 43.03,45.69 40.04,53.74 37.97,54.64 10.01,48.03 8.89,46.39 11.88,38.33", "mw4"], orange: ["img/maskottchen-orange.webp?v=1", "26%", "46.6%", "16.5deg", "13.15,37.36 41.60,43.91 42.75,45.56 39.69,53.59 37.57,54.48 9.12,47.93 7.97,46.28 11.03,38.25", "orange"], taktik: ["img/maskottchen-taktik.webp?v=1", "25.6%", "46.7%", "16.8deg", "13.51,38.26 41.59,44.81 42.74,46.47 39.61,54.53 37.48,55.42 9.39,48.87 8.24,47.21 11.37,39.15"] }, mk = MK[PROMO.maskottchen] || MK.normal;
  document.getElementById("prMk").src = mk[0]; el.classList.remove("mk-gold", "mk-rot", "mk-orange", "mk-mw4"); if (mk[5]) el.classList.add("mk-" + mk[5]); const c2 = document.getElementById("prCode2").style; c2.setProperty("--x", mk[1]); c2.setProperty("--y", mk[2]); c2.setProperty("--r", mk[3]); { const q = mk[4].split(" ").map(p => p.split(",").map(Number)); c2.setProperty("--x", (q.reduce((s, p) => s + p[0], 0) / q.length).toFixed(1) + "%"); c2.setProperty("--y", (q.reduce((s, p) => s + p[1], 0) / q.length).toFixed(1) + "%"); } c2.fontSize = PROMO.code.length > 7 ? (9.5 * 7 / PROMO.code.length).toFixed(1) + "px" : ""; document.getElementById("prQ").setAttribute("points", mk[4]);
  const kop = async e => {
    try { await navigator.clipboard.writeText(PROMO.code) } catch (x) { }
    document.getElementById("prCode2").classList.add("ok"); document.getElementById("prCode").classList.add("ok"); document.getElementById("prTxt").textContent = "Kopiert!";
    setTimeout(() => { for (const [b, t] of [["prCode", "prTxt"], ["prCode2", "prTxt2"]]) { document.getElementById(b).classList.remove("ok"); document.getElementById(t).textContent = PROMO.code; } }, 1500);
  };
  document.getElementById("prTxt2").textContent = PROMO.code;
  document.getElementById("prCode").onclick = kop; document.getElementById("prCode2").onclick = kop;
}
// Rabattcode: Server prueft und nennt den Prozentsatz, PayPal bekommt den reduzierten Betrag + Code (Server prueft beim Einloesen nochmal)
const eur = v => (+v).toFixed(2).replace(".", ",") + " €";
let RABC = {}; try { RABC = JSON.parse(localStorage.getItem("gbRab") || "{}") || {} } catch (e) {}
function rabAp(c, pct) {
  const m = document.getElementById("bRabMsg"), tag = document.getElementById("bRabTag");
  plan.rab = c; plan.pay = (Math.round(+plan.value * (100 - pct) + 1e-7) / 100).toFixed(2); m.textContent = ""; tag.textContent = `−${pct} %`; tag.hidden = false; tag.parentNode.classList.add("on"); const ak = promoOn() && c.toUpperCase() === PROMO.code; tag.classList.toggle("akt-tag", ak); tag.parentNode.classList.toggle("akt-rb", ak);  }
function rabShow() {
  const p = document.getElementById("bP");
  p.innerHTML = plan.rab ? `Preis: <s>${eur(plan.value)}</s><b>${eur(plan.pay)}</b>, einmalig, kein Auto-Abo.` : `Preis: ${eur(plan.value)}, einmalig, kein Auto-Abo.`;
}
document.getElementById("bRabGo").onclick = async () => {
  const c = document.getElementById("bRab").value.trim().toUpperCase(), m = document.getElementById("bRabMsg");
  const tag = document.getElementById("bRabTag"); m.className = "rbm"; plan.rab = ""; plan.pay = ""; tag.hidden = true; tag.parentNode.classList.remove("on");
  if (!c) { rabShow(); render(); m.textContent = ""; return }
  if (!SHOP_API) { m.className = "rbm no"; m.textContent = "Rabattcodes gerade nicht möglich."; return }
  // bekannter Rabatt (Cache oder laufende Aktion): sofort anzeigen, im Hintergrund still pruefen
  const kp = RABC[c] || (promoOn() && c === PROMO.code && PROMO.pct) || 0;
  if (kp) { rabAp(c, kp); rabShow(); render(); }
  else m.textContent = "Wird geprüft …";
  try {
    const r = await (await fetch(SHOP_API + "/api/rabatt?c=" + encodeURIComponent(c))).json();
    if (r.ok) { RABC[c] = r.pct; try { localStorage.setItem("gbRab", JSON.stringify(RABC)) } catch (e) {} if (kp === r.pct) return; rabAp(c, r.pct); }
    else { delete RABC[c]; try { localStorage.setItem("gbRab", JSON.stringify(RABC)) } catch (e) {} plan.rab = ""; plan.pay = ""; tag.hidden = true; tag.parentNode.classList.remove("on"); m.className = "rbm no"; m.textContent = r.msg || "Code ungültig"; }
  } catch (e) { if (kp) return; m.textContent = ""; srvOk = false; gate(); }   // Hinweis steht einmal unten beim Bezahlen
  rabShow(); render();
};
// Creator-Link (?c=CODE): Code merken und beim Kauf automatisch eintragen
const REF = (() => { try { const c = (new URLSearchParams(location.search).get("c") || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);
  if (c) sessionStorage.setItem("gbRef", c); return c || sessionStorage.getItem("gbRef") || "" } catch (e) { return "" } })();
document.getElementById("bRab").onkeydown = e => { if (e.key === "Enter") document.getElementById("bRabGo").click() };
const close = () => buy.classList.remove("on");
document.getElementById("bX").onclick = close; document.getElementById("bClose").onclick = close;
buy.onclick = e => { if (e.target === buy) close() };
// Bewertungen: freigegebene vom Shop-Server laden, schreiben nur mit Bestellung + Code
const STAR = '<svg viewBox="0 0 24 24"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/></svg>';
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
const stars = n => { const s = STAR.repeat(5); return `<span class="bg">${s}</span><span class="fg" style="width:${Math.max(0, Math.min(5, n)) * 20}%">${s}</span>` };
const QUOTE = '<svg class="q" viewBox="0 0 24 24"><path d="M10 7H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v3l3-3V9a2 2 0 0 0-1-2zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v3l3-3V9a2 2 0 0 0-1-2z"/></svg>';
const rvCard = x => `<div class="rv-c">${QUOTE}<div class="rv-hd"><span class="rv-av im"><img src="op-${x.av === "w" ? "w" : "m"}.webp" alt="" loading="lazy"></span><div><b>${esc(x.name)}</b>
  ${x.gratis ? `<span class="rv-ok rv-gr"><svg viewBox="0 0 24 24"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg>Gratis-Tester</span>` : `<span class="rv-ok"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Verifizierter Kauf</span>`}</div></div>
  <span class="rv-st">${stars(x.stars)}</span><p>${esc(x.text)}</p>
  <footer>${PLAN[x.tage] ? `<em>${PLAN[x.tage]}</em>` : "<span></span>"}<span>${new Date(x.zeit).toLocaleDateString("de-DE")}</span></footer></div>`;
const rvBars = l => [5, 4, 3, 2, 1].map(s => { const c = l.filter(x => x.stars === s).length;
  return `<div class="rv-bar"><span>${s}</span><i><b style="width:${l.length ? c / l.length * 100 : 0}%"></b></i><span>${c}</span></div>` }).join("");
const PLAN = {1: "1 Tag", 30: "30 Tage", 90: "90 Tage", 365: "365 Tage"};
async function rvLoad() {
  if (!SHOP_API) return;
  try {
    const r = await (await fetch(SHOP_API + "/api/reviews")).json();
    if (!r.ok || !r.n) return;
    document.getElementById("rvAvg").classList.remove("rv-new");
    document.getElementById("rvAvg").textContent = r.avg.toLocaleString("de-DE");
    document.getElementById("rvStars").innerHTML = stars(r.avg);
    document.getElementById("rvN").textContent = r.n === 1 ? "aus 1 Bewertung" : `aus ${r.n} Bewertungen`;
    document.getElementById("rvList").innerHTML = r.list.map(rvCard).join("");
    document.getElementById("rvBars").innerHTML = rvBars(r.list);
    try {                                             // echte, freigegebene Bewertungen auch fuer Google (Sterne im Suchergebnis)
      const ld = JSON.parse(document.getElementById("ldp").textContent);
      ld.aggregateRating = { "@type": "AggregateRating", ratingValue: String(r.avg), reviewCount: String(r.n), bestRating: "5", worstRating: "1" };
      ld.review = r.list.slice(0, 5).map(x => ({ "@type": "Review", author: { "@type": "Person", name: x.name }, datePublished: x.zeit, reviewBody: x.text, reviewRating: { "@type": "Rating", ratingValue: String(x.stars), bestRating: "5" } }));
      document.getElementById("ldp").textContent = JSON.stringify(ld);
    } catch (e) { }
  } catch (e) { }
}
rvLoad();
const rvm = document.getElementById("rvm"), rvMsg = document.getElementById("rvMsg");
let rvS = 0, rvA = "m";
document.getElementById("rvAvp").onclick = e => { const b = e.target.closest("button"); if (!b) return; rvA = b.dataset.a;
  document.querySelectorAll("#rvAvp button").forEach(x => x.classList.toggle("on", x === b)) };
const rvPaint = n => document.querySelectorAll("#rvPick button").forEach(b => b.classList.toggle("on", +b.dataset.s <= n));
document.getElementById("rvPick").onclick = e => { const b = e.target.closest("button"); if (b) { rvS = +b.dataset.s; rvPaint(rvS) } };
document.getElementById("rvOpen").onclick = () => {
  rvm.classList.add("on"); rvMsg.textContent = ""; rvMsg.classList.remove("go");
  if (lastOid) document.getElementById("rvOid").value = lastOid;
};
document.getElementById("rvX").onclick = () => rvm.classList.remove("on");
rvm.onclick = e => { if (e.target === rvm) rvm.classList.remove("on") };
document.getElementById("rvGo").onclick = async () => {
  const go = document.getElementById("rvGo");
  if (!rvS) { rvMsg.textContent = "Bitte Sterne wählen."; return }
  if (!SHOP_API) { rvMsg.textContent = "Bewertungen sind gerade nicht möglich."; return }
  go.disabled = true; rvMsg.classList.remove("go"); rvMsg.textContent = "Wird geprüft …";
  try {
    const r = await (await fetch(SHOP_API + "/api/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      order: document.getElementById("rvOid").value.trim(),
      stars: rvS, av: rvA, name: document.getElementById("rvName").value.trim(), text: document.getElementById("rvText").value.trim() }) })).json();
    rvMsg.textContent = r.msg || (r.ok ? "Danke!" : "Bewertungen sind gerade nicht möglich – bitte später nochmal."); if (r.ok) { rvMsg.classList.add("go"); document.getElementById("rvText").value = "" }
  } catch (e) { rvMsg.textContent = "Server nicht erreichbar – bitte später nochmal." }
  go.disabled = false;
};
// Aus der App ("Zugang holen"/"Verlaengern"): ?code=GB-... -> direkt zu den Abos, Code schon eingetragen
(() => {
  const c = new URLSearchParams(location.search).get("code");
  if (!c || !/^GB-[A-Za-z0-9+/=_-]{6,}$/.test(c)) return;
  bCode.value = c; document.querySelector('[data-hv="1"]').click(); document.querySelector(".hv").hidden = false;
  history.replaceState(null, "", location.pathname + "#preise");
  setTimeout(() => document.getElementById("preise").scrollIntoView({ behavior: "smooth" }), 150);
})();
// gespeicherte Aktion sofort zeigen (kein Warten auf den Server beim Neuladen)
if (PROMO_C) { try { zeigePromo(); const n = document.querySelector(".ann"); n && n.classList.remove("wait"); } catch (e) { console.warn("promo früh", e); } }
try { zeigeBald(); } catch (e) { }
// Preise passen sich der laufenden Aktion an: Aktionsfarbe an Karten und Button, alter Preis durchgestrichen
function aktPreise() {
  const F = { blau: ["#60a5fa", "#2563eb"], rot: ["#f87171", "#dc2626"], gold: ["#fbbf24", "#d97706"], weihnacht: ["#f87171", "#b91c1c"], gruen: ["#34d399", "#059669"], lila: ["#c084fc", "#7c3aed"] };
  const on = promoOn(), c = F[PROMO.farbe] || F.blau, r = document.documentElement;
  r.classList.toggle("akt", !!on);
  if (on) { r.style.setProperty("--akA", c[0]); r.style.setProperty("--akB", c[1]);
    const P = { blau: "radial-gradient(120% 120% at 25% 15%,#3b82f6,#1d4ed8 60%,#172554)", rot: "radial-gradient(120% 120% at 50% 110%,#ef4444,#991b1b 55%,#1a0505)",
      gold: "radial-gradient(120% 120% at 30% 0%,#2a2010,#0b0904 75%)", weihnacht: "radial-gradient(120% 120% at 30% 20%,#ef4444,#b91c1c 55%,#7f1d1d)", orange: "radial-gradient(120% 120% at 30% 15%,#f97316,#c2410c 60%,#431407)", mw4: "radial-gradient(120% 90% at 30% 20%,#2a2a2a,#1b1b1b 60%,#171717)" };
    r.style.setProperty("--akP", P[PROMO.farbe] || "linear-gradient(160deg," + c[1] + "," + c[0] + ")"); r.classList.toggle("akt-gold", PROMO.farbe === "gold" || PROMO.farbe === "mw4");r.classList.toggle("akt-mw4", PROMO.farbe === "mw4"); }
  document.querySelectorAll(".pc .p").forEach(p => {
    if (!p.dataset.alt) p.dataset.alt = p.firstChild.textContent.trim();
    const alt = parseFloat(p.dataset.alt.replace(",", ".")), neu = (Math.floor(alt * (100 - PROMO.pct) + 1e-7 + 0.5) / 100).toFixed(2).replace(".", ",");
    p.firstChild.textContent = on ? neu : p.dataset.alt;
    let s = p.previousElementSibling && p.previousElementSibling.classList.contains("palt") ? p.previousElementSibling : null;
    if (on) { if (!s) { s = document.createElement("div"); s.className = "palt"; p.before(s); } s.innerHTML = `<s>${p.dataset.alt} €</s><b>−${PROMO.pct} %</b>`; }
    else if (s) s.remove();
    const per = p.parentNode.querySelector(".per");   // "pro Tag/Monat" mit dem Aktionspreis neu rechnen
    if (per) { if (!per.dataset.alt) per.dataset.alt = per.textContent;
      const m = per.dataset.alt.match(/([\d,]+) € pro (Tag|Monat)/), n = { "1 Monat": [30, "Tag"], "3 Monate": [3, "Monat"], "1 Jahr": [12, "Monat"] }[p.parentNode.querySelector("h3").textContent];
      per.textContent = on && m && n ? per.dataset.alt.replace(m[1], (parseFloat(neu.replace(",", ".")) / n[0]).toFixed(2).replace(".", ",")) : per.dataset.alt; }
  });
}
try { aktPreise(); } catch (e) { }
promoBereit.then(() => { try { aktPreise(); } catch (e) { } });
// Endlos-Animationen nur laufen lassen, wenn der Bereich im Bild ist (spart Leistung beim Scrollen, v. a. auf Handys)
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("offv", !e.isIntersecting)), { rootMargin: "200px 0px" });
  document.querySelectorAll("main > section, body > section, section[id], footer").forEach(s => io.observe(s));
}
// Nach-oben-Button: erscheint nach etwas Scrollen
(() => { const b = document.getElementById("toTop"); if (!b) return; let on = false;
  const f = () => { const s = scrollY > 900; if (s !== on) { on = s; b.classList.toggle("on", s); } };
  addEventListener("scroll", f, { passive: true }); f();
  b.addEventListener("click", () => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })); })();
