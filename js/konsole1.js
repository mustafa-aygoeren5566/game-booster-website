// Konsolen-Seite: Zugang pruefen / Mumbai-Lobbys an-aus (IP dieses Netzes) / Kauf ohne App
const API = "https://65-20-95-163.sslip.io";
const PP_CLIENT = "BAAcQ0JuzYeVDaFygLlRZzAYNTOyEa737GmkxfFiO_MYI8ObnTcNwJhYyfMPdY1ycl6m1yeFBpYTcSmJQQ";
const $ = id => document.getElementById(id);
const store = { get: () => { try { return localStorage.getItem("gbKonsole") || "" } catch (e) { return "" } }, set: v => { try { localStorage.setItem("gbKonsole", v) } catch (e) {} } };
const datum = d => new Date(d).toLocaleDateString("de-DE");

async function frei(an) {
  const tok = $("kTok").value.trim();
  if (!/^(K[A-Z0-9]{11}|GB-[A-Za-z0-9+/]{43}=)$/.test(tok)) { msg("Der Code sieht nicht richtig aus (K… oder GB-…).", "bad"); return }
  msg("Einen Moment …");
  try {
    const r = await (await fetch(API + "/api/konsole/frei", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(an === undefined ? { token: tok } : { token: tok, an }) })).json();
    if (!r.ok) { $("kBox").hidden = true; msg(r.msg === "Zugang abgelaufen" ? "Dein Zugang ist am " + datum(r.bis) + " abgelaufen – unten verlängern." : r.msg === "Code unbekannt" ? "Diesen Code kennen wir nicht." : r.msg, "bad"); return }
    store.set(tok); $("kBox").hidden = false;
    karte(r.an); $("kOn").hidden = r.an; $("kOff").hidden = !r.an;
    const rest = Math.round((new Date(r.bis + "T23:59:59") - Date.now()) / 864e5);
    $("kStS").innerHTML = "bis " + datum(r.bis) + " · <b>" + (rest <= 0 ? "läuft heute ab" : "noch " + rest + (rest === 1 ? " Tag" : " Tage")) + "</b>";
    msg(an === true ? "Eingeschaltet. Jetzt das Spiel neu starten." : an === false ? "Ausgeschaltet. Spiel neu starten, dann bist du wieder normal unterwegs." : !r.an && r.ip_alt && r.ip_alt !== r.ip ? "Zuletzt in einem anderen Netz eingeschaltet – hier einfach nochmal einschalten." : "", "good");
  } catch (e) { msg("Server nicht erreichbar – bitte gleich nochmal.", "bad") }
}
function karte(an) {
  $("kMap").classList.toggle("off", !an);
  $("kMs").textContent = an ? "Mumbai-Lobbys an" : "Aus · normale Lobbys";
}
function msg(t, k) { $("kMsg").textContent = t; $("kMsg").className = "msg" + (k ? " " + k : "") }
$("kCheck").onclick = () => frei();
$("kOn").onclick = () => frei(true);
$("kOff").onclick = () => frei(false);
$("kTok").onkeydown = e => { if (e.key === "Enter") frei() };
const q = new URLSearchParams(location.search).get("t") || store.get();
if (q) { $("kTok").value = q; frei() }

// Kauf
let plan = { v: "4.99", n: "1 Monat" }, sdk = null, btn = null;
document.querySelectorAll(".plans button").forEach(b => b.onclick = () => {
  document.querySelectorAll(".plans button").forEach(x => x.classList.toggle("on", x === b)); plan = { v: b.dataset.v, n: b.dataset.n }; zeichne();
});
function gate() { const ok = $("kOk").checked; $("ppBox").style.display = ok ? "" : "none"; $("ppMsg").textContent = ok ? "Wähle deine Zahlungsart:" : "Bitte noch den Haken setzen." }
$("kOk").onchange = () => { gate(); zeichne() };
async function zeichne() {
  if (!$("kOk").checked) return;
  try { await (sdk ||= new Promise((ok, err) => { const s = document.createElement("script"); s.src = `https://www.paypal.com/sdk/js?client-id=${PP_CLIENT}&currency=EUR&intent=capture`; s.onload = ok; s.onerror = err; document.head.appendChild(s) })) }
  catch (e) { $("ppMsg").textContent = "PayPal konnte nicht geladen werden."; return }
  try { btn && btn.close() } catch (e) {}
  $("ppBox").innerHTML = "";
  btn = paypal.Buttons({
    style: { layout: "vertical", color: "blue", shape: "rect", label: "pay", height: 44 },
    createOrder: (d, a) => a.order.create({ purchase_units: [{ description: "Game-VPN Konsole – " + plan.n, custom_id: "KONSOLE", amount: { currency_code: "EUR", value: plan.v } }], application_context: { shipping_preference: "NO_SHIPPING", brand_name: "Game Booster" } }),
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
