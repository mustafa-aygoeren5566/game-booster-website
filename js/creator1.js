const SHOP_API = "https://65-20-95-163.sslip.io";
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
const eur = v => (+v || 0).toFixed(2).replace(".", ",") + " €";
const datum = s => s.slice(0, 10).split("-").reverse().join(".") + (s.length > 10 ? " " + s.slice(11, 16) : "");
const copy = (t, b) => { navigator.clipboard.writeText(t).then(() => { const o = b.textContent; b.textContent = "Kopiert ✓"; setTimeout(() => b.textContent = o, 1500) }) };
// Token steht hinter # - wird nicht an Cloudflare geschickt und landet in keinem Server-Log
const TOK = (location.hash.match(/^#t=([A-Za-z0-9_-]{30,40})$/) || [])[1];

$("f").onsubmit = async e => {
  e.preventDefault();
  const m = $("fMsg"), b = $("fGo"); m.className = "msg";
  const d = { name: $("fName").value.trim(), kanal: $("fKanal").value.trim(), code: $("fCode").value.trim().toUpperCase(), paypal: $("fPp").value.trim(), bed: $("fBed").checked };
  if (!d.bed) { m.className = "msg no"; m.textContent = "Bitte die Partnerbedingungen akzeptieren."; return }
  b.disabled = true; m.textContent = "Wird gesendet …";
  try {
    const r = await (await fetch(SHOP_API + "/api/partner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) })).json();
    if (!r.ok) { m.className = "msg no"; m.textContent = r.msg || "Fehler – bitte nochmal"; b.disabled = false; return }
    const link = location.origin + location.pathname + "#t=" + r.token;
    $("f").classList.add("hide"); $("done").classList.remove("hide");
    $("dLink").textContent = link; $("dGo").href = link; $("dGo").onclick = () => setTimeout(() => location.reload(), 0);
    $("dCopy").onclick = () => copy(link, $("dCopy"));
  } catch (x) { m.className = "msg no"; m.textContent = "Server nicht erreichbar – bitte später nochmal."; b.disabled = false }
};

async function dash() {
  $("info").classList.add("hide"); $("dash").classList.remove("hide");
  let r;
  try { r = await (await fetch(SHOP_API + "/api/partner?t=" + TOK)).json() } catch (x) { r = { ok: false, msg: "Server nicht erreichbar – bitte später nochmal." } }
  if (!r.ok) { $("sName").textContent = ""; $("sLead").textContent = r.msg || "Link ungültig."; return }
  $("sName").textContent = r.name;
  $("sLead").textContent = { wartet: "Deine Anmeldung wird geprüft. Sobald dein Code freigeschaltet ist, siehst du hier deine Verkäufe.",
    aktiv: `Dein Code ist aktiv. Du bekommst ${r.prov} % von jedem Kauf.`, abgelehnt: "Deine Anmeldung wurde leider abgelehnt.",
    beendet: "Diese Partnerschaft ist beendet, der Code ist nicht mehr gültig." }[r.status] || "";
  if (r.status !== "aktiv" && !r.list.length && !r.bezahlt) return;
  $("sKp").innerHTML = `<div><b class="gr">${r.list.filter(x => x.st !== "storniert").length}</b><span>Verkäufe</span></div><div><b class="gr">${eur(r.verdient)}</b><span>verdient gesamt</span></div><div><b class="gr">${eur(r.offen)}</b><span>auszahlbar · ${eur(r.bezahlt)} schon ausgezahlt</span></div>`;
  if (r.status === "aktiv") {
    const ref = location.origin + "/?c=" + r.code;
    $("sLinkBox").classList.remove("hide"); $("sCode").textContent = r.code; $("sRab").textContent = r.rabatt; $("sRef").textContent = ref;
    $("sCopy").onclick = () => copy(ref, $("sCopy"));
    $("sTop").classList.remove("hide"); const tg = $("sTopOn"); tg.checked = !r.versteckt;
    tg.onchange = async () => { tg.disabled = true;
      try { const q = await (await fetch(SHOP_API + "/api/partner/sicht", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: TOK, zeigen: tg.checked }) })).json(); if (!q.ok) tg.checked = !tg.checked }
      catch (x) { tg.checked = !tg.checked } tg.disabled = false };
  }
  $("sList").innerHTML = r.list.length ? `<table><tr><th>Datum</th><th>Abo</th><th class="r">Kauf</th><th class="r">Deins</th><th></th></tr>` +
    r.list.map(x => `<tr><td>${esc(datum(x.zeit))}</td><td>${esc(x.dauer)}</td><td class="r">${eur(x.betrag)}</td><td class="r"><b>${eur(x.prov)}</b></td><td class="r"><span class="st ${esc(x.st)}">${esc(x.st)}</span></td></tr>`).join("") + "</table>"
    : "<p>Noch keine Verkäufe. Teil deinen Code in deinem nächsten Video!</p>";
  if (r.zahlungen.length) { $("sPay").classList.remove("hide");
    $("sPayList").innerHTML = "<table>" + r.zahlungen.slice().reverse().map(z => `<tr><td>${esc(datum(z.zeit))}</td><td class="r"><b>${eur(z.betrag)}</b></td></tr>`).join("") + "</table>" }
}
if (TOK) dash();
async function ranking() {
  let r; const demo = /[?&]demo=top/.test(location.search);
  if (demo) r = { list: [{code:"SUNNY",n:42},{code:"KILLERX",n:31},{code:"WZ_PRO",n:18},{code:"LUCAA",n:9},{code:"NOVA",n:4}] };
  else try { r = await (await fetch(SHOP_API + "/api/partner/top")).json() } catch (x) { return }
  if (!r || !r.list || r.list.length < 3) return;
  $("top").classList.remove("hide");
  $("tMon").textContent = new Date().toLocaleDateString("de-DE", { month: "long" });
  const cr = '<svg class="cr" viewBox="0 0 24 24" fill="currentColor"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/></svg>';
  const pd = (x, k) => x ? `<div class="pd p${k}"><div class="av">${k == 1 ? cr : ""}${esc(x.code[0])}</div><b>${esc(x.code)}</b><small>${x.n} Verkäufe</small><div class="bl">${k}</div></div>` : "<div></div>";
  $("tPod").innerHTML = pd(r.list[1], 2) + pd(r.list[0], 1) + pd(r.list[2], 3);
  $("tRest").innerHTML = r.list.slice(3).map((x, i) => `<div><i>${i + 4}</i><b>${esc(x.code)}</b><span>${x.n} Verkäufe</span></div>`).join("");
  const io = new IntersectionObserver(e => { if (!e[0].isIntersecting) return; io.disconnect(); $("tPod").classList.add("on"); $("tRest").classList.add("on") }, { threshold: .3 });
  io.observe($("tPod"));
}
if (!TOK && "IntersectionObserver" in window) ranking();
const cN = $("cN"), cO = $("cOut"); let cCur = 0, cRaf = 0, cAuto = 0;
const cTo = (v) => { const a = cCur, t0 = performance.now(); cancelAnimationFrame(cRaf);
  (function f(n){ const k = Math.min(1,(n-t0)/600); cCur = a + (v-a)*(1-Math.pow(1-k,3)); cO.textContent = eur(cCur); if (k<1) cRaf = requestAnimationFrame(f) })(t0);
  cO.classList.remove("pop"); void cO.offsetWidth; cO.classList.add("pop");
};
const cTick = () => { $("cNv").textContent = cN.value; cN.style.setProperty("--p", (cN.value/2)+"%"); cTo(cN.value * 4.49 * .25) };
cN.oninput = () => { cAuto = -1; cTick() }; cTick();
if ("IntersectionObserver" in window) { const io = new IntersectionObserver(e => { if (!e[0].isIntersecting) return; io.disconnect();
  let v = 0; (function run(){ if (cAuto < 0) return; cN.value = v; cTick(); v += 10; if (v <= 200) setTimeout(run, 650); else setTimeout(() => { if (cAuto >= 0) { cN.value = 20; cTick() } }, 2500) })() }, {threshold:.5}); io.observe(cO) }
