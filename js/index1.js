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
try { const f = localStorage.getItem("gbPF"); const an = document.querySelector(".ann"); if (f && an && /^[a-z]+$/.test(f)) an.className = "ann wait pa pf-" + f; } catch (e) { }
const promoBereit = (SHOP_API ? fetch(SHOP_API + "/api/aktion", { signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined }).then(r => r.json()).then(r => { if (r.ok) { PROMO = r.aktion || PROMO0; BALD = r.bald || null; try { localStorage.setItem("gbPromo", JSON.stringify(PROMO)); localStorage.setItem("gbBald", JSON.stringify(BALD)); } catch (e) { } zeigeBald(); } }).catch(() => { }) : Promise.resolve()).then(zeigePromo).finally(() => { const n = document.querySelector(".ann"); n && n.classList.remove("wait"); });
// Teaser: naechste Aktion startet in 1-3 Tagen (Code erst am Starttag)
let BALD = null; try { BALD = JSON.parse(localStorage.getItem("gbBald") || "null") } catch (e) {}
function zeigeBald() {
  const e = document.getElementById("prBald"); if (!e) return;
  clearInterval(zeigeBald.t);
  const start = BALD && new Date(BALD.ab + "T00:00:00");
  if (!BALD || !(start > new Date()) || start - new Date() > 4 * 864e5) { e.hidden = true; return; }
  const tag = start.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
  e.className = "bald promo pf-" + (BALD.farbe || "blau"); e.hidden = false;
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
  el.className = "promo pf-" + (PROMO.farbe || "gruen"); el.hidden = false;
  el.classList.add("hm");
  const MK = { xmas: ["img/maskottchen-xmas.webp?v=1", "25.2%", "46.1%", "16.4deg", "39.87,45.78 40.19,46.20 40.16,46.63 40.12,47.05 40.06,47.47 39.98,47.89 39.88,48.30 39.69,48.70 39.56,49.11 39.41,49.51 39.25,49.91 39.07,50.30 38.87,50.69 38.73,51.11 38.50,51.48 38.26,51.85 38.00,52.22 37.72,52.57 37.43,52.92 37.00,53.17 36.62,53.46 36.17,53.68 35.77,53.93 35.31,54.12 34.30,53.78 33.64,53.70 32.95,53.55 32.33,53.42 31.68,53.20 31.19,53.14 30.72,53.05 30.22,52.89 29.78,52.77 29.35,52.63 29.00,52.60 28.68,52.63 28.40,52.71 27.95,52.32 27.63,52.25 27.31,52.09 27.03,52.07 26.75,51.97 26.49,51.99 26.23,52.01 25.97,51.89 25.71,51.75 25.47,51.68 25.22,51.67 24.98,51.58 24.74,51.55 24.50,51.52 24.27,51.48 24.03,51.44 23.79,51.39 23.56,51.33 23.30,51.32 23.08,51.25 22.85,51.17 22.63,51.08 22.37,51.05 22.07,51.07 21.85,50.96 21.59,50.90 21.38,50.78 21.12,50.70 20.87,50.62 20.62,50.53 20.31,50.47 19.99,50.41 19.68,50.33 19.24,50.33 18.86,50.27 18.55,50.15 18.09,50.09 17.78,49.94 17.04,49.98 16.36,49.95 15.74,49.86 15.27,49.68 14.58,49.55 13.96,49.36 12.88,49.28 12.74,48.90 11.41,48.77 10.97,48.41 10.87,47.97 9.89,47.64 9.49,47.21 9.20,46.75 9.16,46.26 9.15,45.78 9.16,45.29 9.20,44.81 9.25,44.33 9.48,43.86 9.57,43.39 9.76,42.93 9.97,42.48 10.11,42.03 10.36,41.59 10.54,41.15 10.74,40.70 10.96,40.27 11.20,39.84 11.46,39.42 11.73,39.01 12.30,38.75 12.95,38.55 13.39,38.27 13.77,37.95 14.49,37.88 15.31,37.92 16.54,38.35 17.43,38.58 18.23,38.81 18.95,39.02 19.49,39.10 19.97,39.15 20.57,39.39 21.11,39.59 21.49,39.64 21.86,39.71 22.26,39.85 22.61,39.94 22.98,40.11 23.28,40.17 23.56,40.23 23.82,40.24 24.09,40.32 24.37,40.48 24.60,40.51 24.84,40.55 25.07,40.67 25.29,40.72 25.50,40.71 25.71,40.78 25.92,40.85 26.12,40.86 26.32,40.94 26.51,41.03 26.70,41.06 26.90,41.09 27.09,41.13 27.29,41.17 27.48,41.22 27.66,41.28 27.85,41.34 28.03,41.40 28.25,41.41 28.43,41.49 28.65,41.51 28.83,41.60 29.00,41.69 29.21,41.73 29.43,41.78 29.65,41.84 29.92,41.86 30.14,41.93 30.42,41.97 30.63,42.06 30.85,42.16 31.06,42.27 31.40,42.31 31.75,42.36 32.10,42.43 32.52,42.48 32.80,42.62 33.15,42.73 33.58,42.84 34.31,42.86 34.73,43.02 34.92,43.27 35.58,43.40 36.63,43.49 36.80,43.80 37.70,44.01 38.50,44.27 39.05,44.60 39.25,44.98 39.44,45.38", "gold"], rot: ["img/maskottchen-rot.webp?v=1", "27.8%", "53.9%", "15deg", "44.42,53.83 44.50,54.28 44.65,54.74 44.69,55.20 44.80,55.68 44.88,56.16 45.03,56.67 45.06,57.17 45.16,57.69 45.32,58.25 45.28,58.77 45.38,59.34 45.53,59.95 45.65,60.58 45.33,61.06 44.99,61.53 44.63,61.99 44.25,62.45 43.77,62.85 42.15,62.55 40.84,62.35 39.64,62.14 38.41,61.83 37.54,61.72 36.58,61.46 35.82,61.33 35.14,61.21 34.48,61.07 33.85,60.91 33.33,60.83 32.78,60.68 32.34,60.63 31.87,60.50 31.46,60.42 31.05,60.33 30.72,60.35 30.34,60.23 29.98,60.10 29.65,60.02 29.33,59.94 29.03,59.91 28.73,59.81 28.46,59.83 28.18,59.78 27.90,59.65 27.64,59.59 27.38,59.52 27.12,59.51 26.87,59.42 26.62,59.40 26.37,59.36 26.12,59.33 25.89,59.22 25.62,59.23 25.38,59.17 25.14,59.11 24.90,59.04 24.63,59.03 24.39,58.94 24.16,58.85 23.89,58.82 23.62,58.77 23.40,58.66 23.02,58.71 22.75,58.64 22.47,58.56 22.14,58.52 21.87,58.42 21.53,58.36 21.27,58.24 20.93,58.15 20.38,58.19 19.97,58.11 19.48,58.06 19.14,57.91 18.73,57.78 18.07,57.74 17.42,57.66 16.75,57.55 16.09,57.41 15.34,57.27 14.42,57.13 13.50,56.95 12.40,56.75 11.31,56.50 11.11,56.07 10.57,55.67 9.78,55.27 9.54,54.80 9.51,54.31 9.50,53.83 9.60,53.34 9.63,52.86 9.69,52.37 9.76,51.89 9.86,51.41 9.98,50.94 10.12,50.46 10.29,50.00 10.38,49.51 10.51,49.03 10.57,48.52 10.74,48.03 10.85,47.52 11.14,47.08 11.46,46.64 11.79,46.21 12.52,45.98 13.25,45.78 13.70,45.45 14.16,45.12 15.36,45.32 16.54,45.58 17.48,45.73 18.40,45.93 19.23,46.11 19.91,46.22 20.53,46.30 21.23,46.51 21.75,46.58 22.31,46.73 22.81,46.83 23.25,46.90 23.71,47.04 24.12,47.13 24.49,47.17 24.85,47.22 25.22,47.35 25.54,47.36 25.87,47.44 26.20,47.53 26.51,47.64 26.81,47.75 27.08,47.73 27.36,47.79 27.64,47.85 27.91,47.93 28.17,48.01 28.43,48.02 28.68,48.12 28.94,48.15 29.19,48.19 29.45,48.23 29.70,48.28 29.95,48.34 30.20,48.41 30.48,48.42 30.72,48.50 31.00,48.52 31.28,48.55 31.56,48.59 31.80,48.70 32.08,48.76 32.36,48.82 32.75,48.79 33.03,48.88 33.25,49.03 33.66,49.03 34.00,49.10 34.34,49.18 34.69,49.27 35.11,49.34 35.60,49.38 35.94,49.51 36.52,49.56 37.02,49.66 37.52,49.78 38.02,49.93 38.69,50.04 39.44,50.16 40.27,50.29 40.94,50.50 41.87,50.69 42.00,51.07 42.38,51.41 42.84,51.76 43.64,52.10 44.33,52.47 44.38,52.92 44.41,53.37", "rot"], normal: ["img/maskottchen.webp?v=2", "27.8%", "53.9%", "15deg", "44.52,53.78 44.69,54.23 44.84,54.70 44.79,55.15 44.90,55.63 44.89,56.10 45.13,56.62 44.99,57.08 45.00,57.58 44.82,58.05 44.78,58.55 44.81,59.08 44.72,59.59 44.45,60.05 44.15,60.49 43.84,60.93 42.97,61.10 42.48,61.43 42.12,61.82 40.82,61.64 40.11,61.77 39.47,61.91 38.38,61.69 37.39,61.47 36.68,61.41 35.86,61.22 35.29,61.22 34.53,60.97 34.00,60.91 33.43,60.78 32.93,60.69 32.48,60.64 31.97,60.45 31.56,60.37 31.19,60.34 30.79,60.24 30.44,60.18 30.10,60.12 29.77,60.04 29.45,59.96 29.15,59.93 28.84,59.83 28.56,59.78 28.27,59.66 28.00,59.60 27.74,59.54 27.48,59.47 27.22,59.46 26.96,59.44 26.72,59.35 26.48,59.25 26.24,59.21 25.99,59.17 25.75,59.12 25.51,59.06 25.27,59.00 25.03,58.93 24.80,58.85 24.53,58.83 24.31,58.74 24.08,58.65 23.82,58.60 23.55,58.55 23.28,58.49 22.96,58.48 22.69,58.40 22.42,58.32 22.16,58.22 21.83,58.16 21.50,58.10 21.10,58.06 20.77,57.96 20.36,57.90 19.88,57.85 19.39,57.79 19.06,57.63 18.57,57.52 17.76,57.52 17.18,57.39 16.52,57.26 15.95,57.08 14.95,56.97 14.03,56.80 12.94,56.61 11.58,56.42 11.38,55.99 11.29,55.55 11.22,55.11 11.17,54.67 11.14,54.22 11.13,53.78 11.50,53.34 11.53,52.90 12.03,52.50 12.10,52.08 12.18,51.66 12.55,51.29 12.68,50.89 12.82,50.48 10.66,49.50 10.69,49.00 10.92,48.55 11.17,48.10 11.43,47.66 11.72,47.22 12.03,46.80 12.35,46.38 12.70,45.97 13.43,45.77 13.87,45.44 15.36,45.78 16.47,45.97 18.00,46.54 18.90,46.73 19.58,46.81 20.31,46.97 20.63,46.77 21.53,47.20 22.09,47.33 22.38,47.18 23.90,48.66 24.14,48.56 24.37,48.47 24.62,48.38 24.86,48.30 25.14,48.29 25.39,48.23 25.65,48.17 25.90,48.11 26.16,48.07 26.44,48.10 26.71,48.14 26.97,48.18 27.23,48.16 27.48,48.15 27.74,48.22 27.99,48.22 28.23,48.30 28.47,48.39 28.72,48.41 28.96,48.44 29.20,48.48 29.44,48.52 29.68,48.57 29.91,48.62 30.15,48.68 30.41,48.69 30.64,48.76 30.90,48.78 31.17,48.81 31.44,48.84 31.71,48.89 31.98,48.94 32.30,48.94 32.57,49.01 32.84,49.09 33.17,49.13 33.57,49.13 33.78,49.29 34.24,49.27 34.65,49.31 35.06,49.37 35.48,49.45 35.82,49.58 36.39,49.62 36.80,49.75 37.38,49.83 37.96,49.94 38.70,50.02 39.37,50.16 39.95,50.35 40.87,50.49 41.71,50.69 42.01,51.04 42.39,51.38 42.85,51.72 43.56,52.06 44.34,52.43 44.39,52.88 44.51,53.32"], orange: ["img/maskottchen-orange.webp?v=1", "26%", "46.6%", "14deg", "41.55,46.58 41.54,46.99 41.41,47.41 41.26,47.81 41.20,48.22 41.12,48.63 41.01,49.04 40.79,49.42 40.66,49.82 40.60,50.24 40.53,50.65 40.33,51.04 40.22,51.46 40.08,51.87 40.02,52.33 39.67,52.66 38.86,52.77 38.23,52.93 37.77,53.16 37.38,53.42 37.15,53.77 36.36,53.75 35.36,53.52 34.54,53.36 33.81,53.22 33.11,53.06 32.43,52.86 31.90,52.77 31.45,52.72 30.89,52.52 30.47,52.44 30.05,52.34 29.70,52.30 29.32,52.17 28.99,52.10 28.67,52.03 28.39,52.02 28.06,51.84 27.82,51.89 27.54,51.78 27.28,51.73 27.04,51.68 26.80,51.62 26.56,51.56 26.34,51.57 26.11,51.41 25.90,51.41 25.68,51.40 25.47,51.30 25.28,51.20 25.07,51.18 24.86,51.15 24.66,51.11 24.46,51.07 24.26,51.02 24.06,50.97 23.86,50.91 23.63,50.92 23.43,50.85 23.24,50.77 23.01,50.76 22.82,50.68 22.58,50.65 22.34,50.62 22.16,50.51 21.92,50.46 21.61,50.47 21.36,50.40 21.12,50.33 20.80,50.30 20.48,50.25 20.23,50.15 19.91,50.08 19.58,50.00 19.17,49.95 18.84,49.84 18.34,49.79 17.82,49.72 17.50,49.56 16.89,49.47 16.38,49.33 15.77,49.19 15.16,49.02 14.35,48.86 13.44,48.67 12.23,48.48 11.23,48.20 10.66,47.84 10.50,47.42 10.48,47.00 9.95,46.58 9.34,46.12 8.64,45.63 8.90,45.17 9.08,44.71 9.28,44.27 9.39,43.81 9.62,43.38 9.78,42.93 9.95,42.49 10.14,42.06 10.26,41.59 10.49,41.17 10.65,40.71 10.93,40.30 11.04,39.81 11.17,39.32 11.42,38.87 11.95,38.57 12.89,38.54 13.57,38.39 14.02,38.11 14.41,37.79 15.46,38.00 16.48,38.25 17.39,38.49 18.20,38.70 18.99,38.95 19.57,39.03 20.18,39.20 20.73,39.32 21.30,39.53 21.71,39.55 22.15,39.66 22.62,39.85 23.00,39.91 23.36,39.98 23.71,40.07 24.06,40.16 24.39,40.27 24.69,40.31 25.00,40.43 25.29,40.48 25.57,40.55 25.85,40.62 26.11,40.69 26.38,40.70 26.63,40.79 26.88,40.89 27.12,40.99 27.39,40.94 27.62,41.06 27.87,41.10 28.11,41.15 28.36,41.21 28.59,41.27 28.83,41.35 29.06,41.42 29.34,41.43 29.57,41.52 29.79,41.62 30.12,41.59 30.34,41.70 30.62,41.75 30.90,41.81 31.18,41.88 31.45,41.96 31.73,42.05 32.15,42.04 32.43,42.15 32.86,42.17 33.14,42.31 33.58,42.36 33.85,42.52 34.37,42.56 34.91,42.63 35.26,42.79 35.80,42.90 36.34,43.04 36.88,43.19 37.70,43.30 38.33,43.49 39.26,43.64 39.99,43.89 40.20,44.25 40.40,44.62 40.58,44.99 41.06,45.35 41.93,45.72 41.86,46.15", "orange"], taktik: ["img/maskottchen-taktik.webp?v=1", "25.6%", "46.7%", "16.5deg", "41.19,47.63 41.09,48.02 40.98,48.40 40.94,48.79 40.79,49.16 40.62,49.53 40.53,49.90 40.50,50.29 40.29,50.64 40.23,51.02 40.15,51.41 39.98,51.77 39.86,52.15 39.73,52.53 39.58,52.91 39.11,53.15 38.55,53.34 38.06,53.54 37.64,53.76 37.08,53.88 36.38,53.88 36.22,54.23 35.73,54.34 35.05,54.28 34.38,54.19 33.62,53.96 33.00,53.82 32.45,53.70 31.98,53.62 31.47,53.46 31.07,53.41 30.64,53.27 30.22,53.13 29.86,53.03 29.59,53.04 29.25,52.92 28.98,52.92 28.69,52.84 28.39,52.69 28.13,52.59 27.89,52.56 27.65,52.52 27.42,52.47 27.20,52.41 26.98,52.42 26.77,52.29 26.56,52.28 26.35,52.21 26.16,52.12 25.97,52.03 25.76,52.08 25.57,51.98 25.36,52.01 25.19,51.91 24.97,51.93 24.77,51.88 24.58,51.82 24.40,51.76 24.25,51.63 23.99,51.68 23.81,51.60 23.63,51.52 23.36,51.55 23.19,51.45 22.96,51.41 22.68,51.41 22.45,51.35 22.22,51.28 22.00,51.20 21.71,51.16 21.41,51.12 21.19,51.01 20.82,50.98 20.53,50.90 20.16,50.83 19.70,50.79 19.41,50.67 18.95,50.59 18.42,50.51 17.96,50.39 17.34,50.29 16.71,50.17 16.09,50.01 15.29,49.85 14.41,49.67 13.35,49.47 12.21,49.22 11.53,48.87 11.57,48.46 11.27,48.05 11.00,47.63 10.47,47.19 9.96,46.72 9.48,46.23 9.64,45.77 9.74,45.31 10.03,44.88 10.16,44.42 10.31,43.98 10.40,43.51 10.68,43.10 10.90,42.66 11.05,42.21 11.22,41.76 11.42,41.31 11.63,40.86 11.80,40.38 12.28,40.06 12.99,39.88 13.63,39.68 14.21,39.46 14.65,39.18 15.42,39.14 16.43,39.34 17.47,39.63 18.24,39.76 19.04,39.97 19.81,40.22 20.40,40.32 21.02,40.51 21.57,40.66 22.06,40.77 22.49,40.83 22.90,40.91 23.34,41.07 23.70,41.11 24.11,41.29 24.44,41.36 24.77,41.43 25.09,41.52 25.38,41.55 25.68,41.65 25.96,41.69 26.24,41.81 26.51,41.94 26.77,42.01 27.02,42.01 27.27,42.02 27.52,42.11 27.75,42.20 28.00,42.23 28.24,42.27 28.46,42.38 28.69,42.43 28.90,42.55 29.16,42.54 29.38,42.61 29.65,42.62 29.87,42.70 30.09,42.79 30.13,43.12 30.33,43.22 30.88,42.91 31.14,42.97 31.40,43.04 31.66,43.11 31.98,43.14 32.24,43.24 32.57,43.29 32.89,43.36 33.22,43.44 33.47,43.57 34.02,43.55 34.34,43.67 34.75,43.77 35.15,43.88 35.55,44.01 36.19,44.07 36.75,44.19 37.32,44.33 37.97,44.47 38.61,44.65 39.26,44.86 39.72,45.13 39.83,45.48 40.09,45.81 40.43,46.14 40.85,46.49 41.34,46.84 41.27,47.24"] }, mk = MK[PROMO.maskottchen] || MK.normal;
  document.getElementById("prMk").src = mk[0]; el.classList.remove("mk-gold", "mk-rot", "mk-orange"); if (mk[5]) el.classList.add("mk-" + mk[5]); const c2 = document.getElementById("prCode2").style; c2.setProperty("--x", mk[1]); c2.setProperty("--y", mk[2]); c2.setProperty("--r", mk[3]); { const q = mk[4].split(" ").map(p => p.split(",").map(Number)); c2.setProperty("--x", (q.reduce((s, p) => s + p[0], 0) / q.length).toFixed(1) + "%"); c2.setProperty("--y", (q.reduce((s, p) => s + p[1], 0) / q.length).toFixed(1) + "%"); } c2.fontSize = PROMO.code.length > 7 ? (9.5 * 7 / PROMO.code.length).toFixed(1) + "px" : ""; document.getElementById("prQ").setAttribute("points", mk[4]);
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
      gold: "radial-gradient(120% 120% at 30% 0%,#2a2010,#0b0904 75%)", weihnacht: "radial-gradient(120% 120% at 30% 20%,#ef4444,#b91c1c 55%,#7f1d1d)" };
    r.style.setProperty("--akP", P[PROMO.farbe] || "linear-gradient(160deg," + c[1] + "," + c[0] + ")"); r.classList.toggle("akt-gold", PROMO.farbe === "gold"); }
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
