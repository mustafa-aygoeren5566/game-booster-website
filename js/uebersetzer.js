// GB Übersetzer: Oberfläche, Sprachwege und eigene Verbesserungen (bleiben im Browser).
const SPRACHEN = { de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", ru: "Russisch", es: "Spanisch", fr: "Französisch", pl: "Polnisch" };
const NACH_EN = (s) => ({ netz: `Xenova/opus-mt-${s}-en`, vorsatz: "" });
const VON_EN = (s) => s === "tr" ? { netz: "Xenova/opus-mt-en-mul", vorsatz: ">>tur<< " }
  : s === "pl" ? { netz: "Xenova/opus-mt-en-mul", vorsatz: ">>pol<< " }
  : { netz: `Xenova/opus-mt-en-${s}`, vorsatz: "" };

const $ = (id) => document.getElementById(id);
const ein = $("ein"), aus = $("aus"), von = $("von"), nach = $("nach"), status = $("status");

function speicher(k, w) {
  try { if (w === undefined) return localStorage.getItem(k); localStorage.setItem(k, w); } catch (e) { return null; }
}

for (const [k, v] of Object.entries(SPRACHEN)) { von.add(new Option(v, k)); nach.add(new Option(v, k)); }
von.value = speicher("ue_von") || "de";
nach.value = speicher("ue_nach") || "en";
if (von.value === nach.value) nach.value = von.value === "en" ? "de" : "en";

// ---- eigene Verbesserungen ----
let gedaechtnis = {};
try { gedaechtnis = JSON.parse(speicher("ue_gedaechtnis") || "{}"); } catch (e) { gedaechtnis = {}; }
const norm = (t) => t.trim().toLowerCase().replace(/\s+/g, " ");
const schl = (a, b, t) => `${a}|${b}|${norm(t)}`;

function weg(a, b) {
  if (a === "en") return [VON_EN(b)];
  if (b === "en") return [NACH_EN(a)];
  return [NACH_EN(a), VON_EN(b)];
}

// ---- Hintergrund-Rechner ----
const rechner = new Worker(new URL("./uebersetzer-worker.js?v=2", import.meta.url), { type: "module" });
let auftrag = 0, letzt = null;
const dateien = {};
rechner.onmessage = (e) => {
  const d = e.data;
  if (d.art === "laden") {
    dateien[d.datei] = [d.geladen, d.gesamt];
    const [g, t] = Object.values(dateien).reduce((s, x) => [s[0] + x[0], s[1] + x[1]], [0, 0]);
    $("laden").hidden = false;
    $("ladebalken").style.width = Math.round((g / t) * 100) + "%";
    $("ladetext").textContent = `Sprachnetz wird einmalig geladen … ${Math.round(g / 1048576)} von ${Math.round(t / 1048576)} MB`;
  } else if (d.art === "bereit") {
    $("laden").hidden = true;
    for (const k in dateien) delete dateien[k];
  } else if (d.id === auftrag) {
    if (d.art === "fehler") { status.textContent = "Fehler: " + d.text; return; }
    zeigen(d.saetze);
  }
};

let plan = null, teile = [], offen = [];
function los() {
  clearTimeout(plan);
  const text = ein.value, a = von.value, b = nach.value;
  $("zeichen").textContent = `${text.length} / 5000`;
  if (!text.trim()) { aus.value = ""; status.textContent = "Bereit"; letzt = null; return; }
  const ganz = gedaechtnis[schl(a, b, text)];
  if (ganz) { aus.value = ganz; status.textContent = "Deine gemerkte Version"; letzt = { text, a, b, maschine: ganz }; return; }
  // Zeilen und Sätze einzeln übersetzen; gemerkte Sätze direkt einsetzen
  teile = text.split("\n").map((z) => z.trim() ? z.trim().split(/(?<=[.!?])\s+/) : []);
  offen = [];
  teile.forEach((z) => z.forEach((s) => { if (!gedaechtnis[schl(a, b, s)]) offen.push(s); }));
  auftrag++;
  letzt = { text, a, b, maschine: null };
  status.textContent = "Übersetze …";
  if (!offen.length) return zeigen([]);
  rechner.postMessage({ id: auftrag, schritte: weg(a, b), saetze: offen });
}

function zeigen(neu) {
  const { a, b } = letzt;
  let i = 0;
  aus.value = teile.map((z) => z.map((s) => gedaechtnis[schl(a, b, s)] || neu[i++]).join(" ")).join("\n");
  letzt.maschine = aus.value;
  status.textContent = "Fertig";
}

ein.addEventListener("input", () => { clearTimeout(plan); plan = setTimeout(los, 500); $("zeichen").textContent = `${ein.value.length} / 5000`; });
for (const s of [von, nach]) s.addEventListener("change", () => {
  if (von.value === nach.value) (s === von ? nach : von).value = s.value === "en" ? "de" : "en";
  speicher("ue_von", von.value); speicher("ue_nach", nach.value); los();
});
$("tausch").addEventListener("click", () => {
  [von.value, nach.value] = [nach.value, von.value];
  if (aus.value.trim()) ein.value = aus.value;
  speicher("ue_von", von.value); speicher("ue_nach", nach.value); los();
});
$("leeren").addEventListener("click", () => { ein.value = ""; los(); ein.focus(); });

function kurz(knopf, text) {
  const alt = knopf.innerHTML;
  knopf.classList.add("ok"); knopf.lastChild.textContent = text;
  setTimeout(() => { knopf.innerHTML = alt; knopf.classList.remove("ok"); }, 1600);
}
$("kopieren").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(aus.value); status.textContent = "Kopiert"; } catch (e) { aus.select(); document.execCommand("copy"); }
});
$("merken").addEventListener("click", () => {
  const richtig = aus.value.trim();
  if (!letzt || !richtig) { status.textContent = "Erst etwas übersetzen."; return; }
  if (richtig === (letzt.maschine || "").trim()) { status.textContent = "Erst die Übersetzung rechts verbessern, dann merken."; return; }
  gedaechtnis[schl(letzt.a, letzt.b, letzt.text)] = richtig;
  // Gleich viele Sätze? Dann auch Satz für Satz merken, damit es in anderen Texten greift
  const q = letzt.text.trim().split(/(?<=[.!?])\s+/), r = richtig.split(/(?<=[.!?])\s+/);
  if (q.length > 1 && q.length === r.length) q.forEach((s, i) => { gedaechtnis[schl(letzt.a, letzt.b, s)] = r[i]; });
  speicher("ue_gedaechtnis", JSON.stringify(gedaechtnis));
  letzt.maschine = richtig;
  kurz($("merken"), "Gemerkt");
  status.textContent = "Gemerkt. Beim nächsten Mal kommt deine Version.";
});

ein.focus();
