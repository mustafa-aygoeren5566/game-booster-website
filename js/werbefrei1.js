// GB Werbefrei: Paket waehlen, mit PayPal zahlen, Code vom Server holen und anzeigen
const API = "https://65-20-95-163.sslip.io/api/werbefrei";
const PP_CLIENT = "BAAcQ0JuzYeVDaFygLlRZzAYNTOyEa737GmkxfFiO_MYI8ObnTcNwJhYyfMPdY1ycl6m1yeFBpYTcSmJQQ";
const $ = id => document.getElementById(id);
let plan = { v: "4.99", n: "12 Monate" }, sdk = null, btn = null;

document.querySelectorAll(".plans button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".plans button").forEach(x => x.classList.toggle("on", x === b));
  plan = { v: b.dataset.v, n: b.dataset.n };
  $("kPlan").textContent = plan.n; $("kHin").textContent = "einmal zahlen · " + plan.n + " werbefrei"; $("kPreis").textContent = plan.v.replace(".", ",") + " €";
  zeichne();
}));

function ppSdk() {
  return sdk ||= new Promise((ok, err) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${PP_CLIENT}&currency=EUR&intent=capture`;
    s.onload = ok; s.onerror = err; document.head.appendChild(s);
  });
}
addEventListener("load", () => setTimeout(() => ppSdk().catch(() => { sdk = null }), 1200));

function gate() {
  const ok = $("wOk").checked;
  $("ppBox").style.display = ok ? "" : "none";
  $("ppGeist").style.display = ok ? "none" : "";
  $("wOk").closest(".chk").classList.toggle("warte", !ok);
  $("ppMsg").textContent = ok ? "Wähle deine Zahlungsart:" : "Haken oben setzen, dann werden die Zahlungsarten freigeschaltet:";
}
$("wOk").addEventListener("change", () => { gate(); zeichne() });

async function zeichne() {
  if (!$("wOk").checked) return;
  if (!window.paypal) $("ppMsg").textContent = "PayPal lädt …";
  try { await ppSdk(); $("ppMsg").textContent = "Wähle deine Zahlungsart:" }
  catch (e) { $("ppMsg").textContent = "PayPal konnte nicht geladen werden."; return }
  try { btn && btn.close() } catch (e) {}
  $("ppBox").innerHTML = "";
  btn = paypal.Buttons({
    style: { layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 46 },
    createOrder: (d, a) => a.order.create({
      purchase_units: [{ description: "GB Werbefrei Premium – " + plan.n, custom_id: "WERBEFREI", amount: { currency_code: "EUR", value: plan.v } }],
      application_context: { shipping_preference: "NO_SHIPPING", brand_name: "Game Booster" }
    }),
    onApprove: (d, a) => a.order.capture().then(async o => {
      $("ppMsg").textContent = "Danke! Dein Code wird erstellt …";
      for (let i = 0; i < 4; i++) {
        try {
          const r = await (await fetch(API + "/kauf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order: o.id }) })).json();
          if (r.ok) {
            $("wCodeT").textContent = r.code; $("wCode").classList.add("zeigen"); $("ppBox").innerHTML = "";
            $("ppMsg").textContent = "Fertig! Bestell-Nr.: " + o.id;
            try { localStorage.setItem("gbWerbefreiCode", r.code) } catch (e) {}
            $("wCode").scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        } catch (e) {}
        await new Promise(z => setTimeout(z, 2500));
      }
      $("ppMsg").textContent = "Zahlung ist da, der Code konnte nicht sofort erstellt werden. Schreib uns mit der Bestell-Nr. " + o.id + " an kontakt@lobbycontrolvpn.de.";
    }),
    onCancel: () => { $("ppMsg").textContent = "Zahlung abgebrochen – es wurde nichts abgebucht." },
    onError: () => { $("ppMsg").textContent = "Die Zahlung hat nicht geklappt. Es wurde nichts abgebucht." }
  });
  btn.render("#ppBox");
}

$("wCopy").addEventListener("click", () => navigator.clipboard.writeText($("wCodeT").textContent).then(() => {
  $("wCopy").textContent = "Kopiert ✓"; setTimeout(() => $("wCopy").textContent = "Kopieren", 1600);
}));

// schon gekaufter Code auf diesem Geraet wieder anzeigen
try { const c = localStorage.getItem("gbWerbefreiCode"); if (c) { $("wCodeT").textContent = c; $("wCode").classList.add("zeigen") } } catch (e) {}
gate();

// ?plan=0|1|2 von der Startseite: Paket vorauswählen
{ const n = new URLSearchParams(location.search).get("plan"), b = n !== null && document.querySelectorAll(".plans button")[+n]; if (b) { b.click(); setTimeout(() => b.scrollIntoView({ block: "center" }), 300); } }
