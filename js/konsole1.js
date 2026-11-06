// Konsolen-Seite: Zugang pruefen / Mumbai-Lobbys an-aus (IP dieses Netzes) / Kauf ohne App
const API = "https://65-20-95-163.sslip.io";
const PP_CLIENT = "BAAcQ0JuzYeVDaFygLlRZzAYNTOyEa737GmkxfFiO_MYI8ObnTcNwJhYyfMPdY1ycl6m1yeFBpYTcSmJQQ";
const $ = id => document.getElementById(id);
const store = { get: () => { try { return localStorage.getItem("gbKonsole") || "" } catch (e) { return "" } }, set: v => { try { localStorage.setItem("gbKonsole", v) } catch (e) {} }, del: () => { try { localStorage.removeItem("gbKonsole") } catch (e) {} } };
const datum = d => new Date(d).toLocaleDateString("de-DE");

async function frei(an) {
  let tok = $("kTok").value.trim();
  if (!tok) { vergessen(); return }
  if (!/^GB-/.test(tok)) tok = tok.replace(/[\s-]+/g, "").toUpperCase();   // GAMEBOOSTERVPN-7T-XXXXX geht auch mit Strichen
  if (!/^(K[A-Z0-9]{11}|GB-[A-Za-z0-9+/]{43}=|GAMEBOOSTERVPN\d+[TM][A-Z0-9]{5}|TEST[A-Z0-9]{8})$/.test(tok)) { msg("Der Code sieht nicht richtig aus.", "bad"); return }
  msg("Einen Moment …");
  try {
    const r = await (await fetch(API + "/api/konsole/frei", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(an === undefined ? { token: tok } : { token: tok, an }) })).json();
    if (!r.ok) { $("kBox").hidden = true; msg(r.msg === "Zugang abgelaufen" ? "Dein Zugang ist am " + datum(r.bis) + " abgelaufen – unten verlängern." : r.msg === "Code unbekannt" ? "Diesen Code kennen wir nicht." : r.msg, "bad"); return }
    if (r.token && r.token !== tok) { tok = r.token; $("kTok").value = tok.replace(/^(GAMEBOOSTERVPN)(\d+[TM])([A-Z0-9]+)$/, "$1-$2-$3") }   // alter K-Code -> neuer Code
    store.set(tok); $("kBox").hidden = false;
    karte(r.an); $("kOn").hidden = r.an; $("kOff").hidden = !r.an;
    const rest = Math.round((new Date(r.bis + "T23:59:59") - Date.now()) / 864e5);
    $("kStS").innerHTML = "bis " + datum(r.bis) + " · <b>" + (rest <= 0 ? "läuft heute ab" : "noch " + rest + (rest === 1 ? " Tag" : " Tage")) + "</b>";
    msg(an === true ? "Eingeschaltet. Jetzt das Spiel neu starten." : an === false ? "Ausgeschaltet. Spiel neu starten, dann bist du wieder normal unterwegs." : !r.an && r.ip_alt && r.ip_alt !== r.ip ? "Zuletzt in einem anderen Netz eingeschaltet – hier einfach nochmal einschalten." : "", "good");
  } catch (e) { msg("Server nicht erreichbar – bitte gleich nochmal.", "bad") }
}
// Feld geleert -> Code auf diesem Geraet vergessen
function vergessen() { store.del(); $("kBox").hidden = true; document.documentElement.classList.remove("krueck0"); msg("Code von diesem Gerät entfernt.") }
function karte(an) {
  $("kMap").classList.toggle("off", !an);
  $("kMs").textContent = an ? "Mumbai-Lobbys an" : "Aus · normale Lobbys";
}
function msg(t, k) { $("kMsg").textContent = t; $("kMsg").className = "msg" + (k ? " " + k : "") }
$("kCheck").onclick = () => frei();
$("kOn").onclick = () => frei(true);
$("kOff").onclick = () => frei(false);
$("kTok").onkeydown = e => { if (e.key === "Enter") frei() };
$("kTok").oninput = () => { if (!$("kTok").value.trim() && store.get()) vergessen() };
const q = new URLSearchParams(location.search).get("t") || store.get();
if (q) { $("kTok").value = q; frei() }

// Kauf
let plan = { v: "4.99", n: "1 Monat" }, sdk = null, btn = null;
// Rabatt: bei jedem Tarif alter Preis durchgestrichen + neuer Preis, PayPal bekommt den reduzierten Betrag samt Code
let rab = { c: "", pct: 0 };
const rabPreis = v => (Math.round(+v * (100 - rab.pct) + 1e-7) / 100).toFixed(2), eur = v => v.replace(".", ",") + " €";
function preiseZeigen() {
  document.querySelectorAll(".plans button").forEach(b => {
    const p = b.querySelector("b"); p.querySelector("s")?.remove();
    p.lastChild.textContent = eur(rab.pct ? rabPreis(b.dataset.v) : b.dataset.v); p.classList.toggle("neu", !!rab.pct);
    if (rab.pct) p.insertAdjacentHTML("afterbegin", `<s>${eur(b.dataset.v)}</s>`);
    const t = { "4.99": 30, "12.99": 90, "39.99": 365 }[b.dataset.v], sm = b.querySelector("small");   // ≈ €/Tag mit dem echten (rabattierten) Preis
    if (t && sm) sm.textContent = "≈ " + ((rab.pct ? +rabPreis(b.dataset.v) : +b.dataset.v) / t).toFixed(2).replace(".", ",") + " € / Tag";
  });
}
async function rabattPruefen() {
  const c = $("kRab").value.trim().toUpperCase(), m = $("kRabMsg"); m.className = "krabm"; rab = { c: "", pct: 0 };
  if (c) {
    m.textContent = "Wird geprüft …";
    try {
      const r = await (await fetch(API + "/api/rabatt?c=" + encodeURIComponent(c))).json();
      if (r.ok) { rab = { c, pct: r.pct }; m.textContent = `Rabattcode ${c} aktiv: −${r.pct} % auf alle Tarife` }
      else { m.className = "krabm no"; m.textContent = r.msg || "Code ungültig" }
    } catch (e) { m.className = "krabm no"; m.textContent = "Server nicht erreichbar – bitte später nochmal." }
  } else m.textContent = "";
  preiseZeigen(); zeichne();
}
$("kRabGo").onclick = rabattPruefen;
$("kRab").onkeydown = e => { if (e.key === "Enter") rabattPruefen() };
try { const c = (new URLSearchParams(location.search).get("c") || sessionStorage.getItem("gbRef") || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
  autoRab(c) } catch (e) {}
// Laufende Aktion wie auf der Startseite (gleicher Code/Zeitraum) automatisch eintragen; mit Link-Code den hoeheren nehmen
async function autoRab(ref) {
  const P = { code: "START10", bis: "2026-11-22" };
  const cs = [...new Set([ref, new Date() <= new Date(P.bis + "T23:59:59") ? P.code : ""].filter(Boolean))];
  if (!cs.length) return;
  let best = cs[0];
  if (cs.length > 1) {
    const pct = await Promise.all(cs.map(c => fetch(API + "/api/rabatt?c=" + encodeURIComponent(c)).then(r => r.json()).then(r => r.ok ? r.pct : 0).catch(() => 0)));
    best = cs[pct.indexOf(Math.max(...pct))];
  }
  $("kRab").value = best; rabattPruefen();
}
document.querySelectorAll(".plans button").forEach(b => b.onclick = () => {
  document.querySelectorAll(".plans button").forEach(x => x.classList.toggle("on", x === b)); plan = { v: b.dataset.v, n: b.dataset.n }; zeichne();
});
function gate() { const ok = $("kOk").checked; $("ppBox").style.display = ok ? "" : "none"; $("ppMsg").textContent = ok ? "Wähle deine Zahlungsart:" : "Bitte noch den Haken setzen." }
$("kOk").onchange = () => { gate(); zeichne() };
function ppSdk() { return sdk ||= new Promise((ok, err) => { const s = document.createElement("script"); s.src = `https://www.paypal.com/sdk/js?client-id=${PP_CLIENT}&currency=EUR&intent=capture`; s.onload = ok; s.onerror = err; document.head.appendChild(s) }) }
// PayPal schon im Hintergrund vorladen, damit die Zahlungsarten beim Haken sofort da sind
addEventListener("load", () => setTimeout(() => ppSdk().catch(() => { sdk = null }), 1200));
async function zeichne() {
  if (!$("kOk").checked) return;
  if (!window.paypal) $("ppMsg").textContent = "PayPal lädt …";
  try { await ppSdk(); $("ppMsg").textContent = "Wähle deine Zahlungsart:" }
  catch (e) { $("ppMsg").textContent = "PayPal konnte nicht geladen werden."; return }
  try { btn && btn.close() } catch (e) {}
  $("ppBox").innerHTML = "";
  btn = paypal.Buttons({
    style: { layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 44 },
    createOrder: (d, a) => a.order.create({ purchase_units: [{ description: "Game-VPN Konsole – " + plan.n + (rab.pct ? ` (Rabatt ${rab.c} −${rab.pct} %)` : ""), custom_id: "KONSOLE" + (rab.pct ? "|" + rab.c : ""), amount: { currency_code: "EUR", value: rab.pct ? rabPreis(plan.v) : plan.v } }], application_context: { shipping_preference: "NO_SHIPPING", brand_name: "Game Booster" } }),
    onApprove: (d, a) => a.order.capture().then(async o => {
      fetch(API + "/api/paid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: o.id, zust: "2026-11-01" }) }).catch(() => {});
      $("ppMsg").textContent = "Danke! Dein Zugang wird erstellt …";
      for (let i = 0; i < 3; i++) {
        try {
          const r = await (await fetch(API + "/api/konsole/kauf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: o.id }) })).json();
          if (r.ok) {
            store.set(r.token); $("kNewC").textContent = r.token; $("kNew").hidden = false; $("ppBox").innerHTML = "";
            $("ppMsg").textContent = "Fertig – Zugang bis " + datum(r.bis) + ". Bestell-Nr.: " + o.id;
            $("kTok").value = r.token; frei(true); $("zugang").scrollIntoView({ behavior: "smooth" }); return;
          }
        } catch (e) {}
        await new Promise(z => setTimeout(z, 2500));
      }
      $("ppMsg").textContent = "Zahlung ist da, der Zugang konnte nicht sofort erstellt werden. Schreib uns mit der Bestell-Nr. " + o.id + " an mustafa-aygoeren@web.de.";
    }),
    onCancel: () => { $("ppMsg").textContent = "Zahlung abgebrochen – es wurde nichts abgebucht." },
    onError: () => { $("ppMsg").textContent = "Die Zahlung hat nicht geklappt. Es wurde nichts abgebucht." }
  });
  btn.render("#ppBox");
}
gate();
$("kCopy").onclick = () => navigator.clipboard.writeText($("kNewC").textContent).then(() => { $("kCopy").textContent = "Kopiert ✓"; setTimeout(() => $("kCopy").textContent = "Kopieren", 1600) });

// Server-Status oben links in der Karte: grün = läuft, gelb = langsam, rot = Wartung / nicht erreichbar
async function serverStatus() {
  const el = $("kSrv"); if (!el) return;
  const t0 = performance.now(); let st = "wartung";
  try {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 6000);
    const r = await (await fetch(API + "/api/health", { cache: "no-store", signal: ctl.signal })).json(); clearTimeout(to);
    if (r.ok) st = performance.now() - t0 > 1500 ? "langsam" : "ok";
  } catch (e) {}
  el.className = "dots ksrv " + st;
  el.title = { ok: "Server läuft", langsam: "Server antwortet langsam", wartung: "Server in Wartung – bitte später nochmal" }[st];
}
serverStatus(); setInterval(serverStatus, 60000);

// Schritte oben klickbar; wer schon einen Code gespeichert hat, bekommt "Einschalten" gleich nach oben
["kaufen", "anleitung", "zugang"].forEach((id, i) => { const d = document.querySelectorAll(".st3 > div")[i];
  if (d) { d.dataset.go = id; d.onclick = () => $(id).scrollIntoView({ behavior: "smooth", block: "start" }) } });
if (q) {   // Rueckkehrer: Zugang ganz oben, keine Schritt-Nummern, passende Titel
  const z = $("zugang"), k = $("video"); k.parentNode.insertBefore(z, k);
  document.body.classList.add("krueck");
  document.querySelectorAll("h2 [data-alt]").forEach(s => s.textContent = s.dataset.alt);
  const st3 = document.querySelector(".st3"); if (st3) st3.style.display = "none";
}

// Waehrend das Anleitungsvideo laeuft, alle Seiten-Animationen (Karte, Route, Leuchten) anhalten - sonst stockt das Video auf schwaecheren PCs
(() => { const v = document.querySelector("#video video"); if (!v) return;
  const svgs = () => document.querySelectorAll("svg");
  const an = on => { document.body.classList.toggle("vplay", on); svgs().forEach(s => { try { on ? s.pauseAnimations() : s.unpauseAnimations() } catch (e) {} }) };
  v.addEventListener("play", () => an(true)); ["pause", "ended"].forEach(e => v.addEventListener(e, () => an(false))); })();


// Endeinblendung nach dem Video: naechster Schritt + nochmal ansehen
(() => { const v = document.querySelector("#video video"); if (!v) return;
  const zurueck = !!q, ziel = zurueck ? "zugang" : "kaufen";
  const e = document.createElement("div"); e.className = "kEnd";
  e.innerHTML = `<span class="ke-tag">Game Booster VPN</span><b>${zurueck ? "Alles eingerichtet? <em>Jetzt einschalten</em>" : "Bereit für <em>Mumbai-Lobbys?</em>"}</b>`
    + `<span class="ke-sub">${zurueck ? "Schalter an, Spiel neu starten, fertig." : "Zugang holen, DNS eintragen, einschalten – in wenigen Minuten auf PS5 und Xbox."}</span>`
    + `<button type="button" class="ke-go">${zurueck ? "Zum Schalter" : "Zugang holen"}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button>`
    + `<button type="button" class="ke-re"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>Nochmal ansehen</button>`;
  v.parentNode.appendChild(e);
  v.addEventListener("ended", () => { e.classList.add("an"); try { document.fullscreenElement && document.exitFullscreen() } catch (_) {} });
  v.addEventListener("play", () => e.classList.remove("an"));
  e.querySelector(".ke-go").onclick = () => $(ziel).scrollIntoView({ behavior: "smooth", block: "start" });
  e.querySelector(".ke-re").onclick = () => { v.currentTime = 0; v.play() }; })();
