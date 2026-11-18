// GB Übersetzer: Oberfläche, Sprachwege und eigene Verbesserungen (bleiben im Browser).
const SPRACHEN = { de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", ru: "Russisch", es: "Spanisch", fr: "Französisch", pl: "Polnisch" };
// Deutsch <-> Englisch: eigene, nachtrainierte Netze (verstehen Umgangssprache, Tippfehler, Tonlage)
const EIGEN = "gamebooster-vpn/gb-uebersetzer-";
const NACH_EN = (s) => ({ netz: s === "de" ? EIGEN + "de-en" : `Xenova/opus-mt-${s}-en`, vorsatz: "" });
const VON_EN = (s) => s === "de" ? { netz: EIGEN + "en-de", vorsatz: `<${ton}> ` }
  : s === "tr" ? { netz: "Xenova/opus-mt-en-mul", vorsatz: ">>tur<< " }
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
const rechner = new Worker(new URL("./uebersetzer-worker.js?v=4", import.meta.url), { type: "module" });
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
  aus.value = tonfall(teile.map((z) => z.map((s) => gedaechtnis[schl(a, b, s)] || neu[i++]).join(" ")).join("\n"), b);
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

const FLAGGE = {de:'<svg class="flagge" viewBox="0 0 24 18"><rect width="24" height="6" fill="#111"/><rect y="6" width="24" height="6" fill="#dd0000"/><rect y="12" width="24" height="6" fill="#ffce00"/></svg>',en:'<svg class="flagge" viewBox="0 0 24 18"><rect width="24" height="18" fill="#012169"/><path d="M0 0l24 18M24 0L0 18" stroke="#fff" stroke-width="3.6"/><path d="M0 0l24 18M24 0L0 18" stroke="#c8102e" stroke-width="1.4"/><path d="M12 0v18M0 9h24" stroke="#fff" stroke-width="5"/><path d="M12 0v18M0 9h24" stroke="#c8102e" stroke-width="3"/></svg>',tr:'<svg class="flagge" viewBox="0 0 24 18"><rect width="24" height="18" fill="#e30a17"/><circle cx="9.5" cy="9" r="4.4" fill="#fff"/><circle cx="10.6" cy="9" r="3.5" fill="#e30a17"/><path d="M15.2 9l3.2-1.1-2 2.7V7.4l2 2.7z" fill="#fff"/></svg>',ar:'<svg class="flagge" viewBox="0 0 24 18"><rect width="24" height="18" fill="#006c35"/><path d="M5 7.5h14M5 9.5h14" stroke="#fff" stroke-width=".9" stroke-dasharray="1.6 .8"/><path d="M6 13h11l1.5-1" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/></svg>',ru:'<svg class="flagge" viewBox="0 0 24 18"><rect width="24" height="6" fill="#fff"/><rect y="6" width="24" height="6" fill="#0039a6"/><rect y="12" width="24" height="6" fill="#d52b1e"/></svg>',es:'<svg class="flagge" viewBox="0 0 24 18"><rect width="24" height="18" fill="#aa151b"/><rect y="4.5" width="24" height="9" fill="#f1bf00"/></svg>',fr:'<svg class="flagge" viewBox="0 0 24 18"><rect width="8" height="18" fill="#0055a4"/><rect x="8" width="8" height="18" fill="#fff"/><rect x="16" width="8" height="18" fill="#ef4135"/></svg>',pl:'<svg class="flagge" viewBox="0 0 24 18"><rect width="24" height="9" fill="#fff"/><rect y="9" width="24" height="9" fill="#dc143c"/></svg>'};
// ---- eigene Glas-Auswahl statt der Browser-Liste ----
function glasAuswahl(sel) {
  const box = document.createElement("div"); box.className = "wahl";
  const knopf = document.createElement("button"); knopf.type = "button"; knopf.className = "wahl-k";
  knopf.setAttribute("aria-haspopup", "listbox"); knopf.setAttribute("aria-label", sel.getAttribute("aria-label"));
  const liste = document.createElement("div"); liste.className = "wahl-l"; liste.setAttribute("role", "listbox"); liste.hidden = true;
  sel.after(box); box.append(sel, knopf, liste); sel.classList.add("versteckt"); sel.tabIndex = -1;
  const malen = () => {
    knopf.innerHTML = `<span>${FLAGGE[sel.value]}${sel.options[sel.selectedIndex].text}</span><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    liste.innerHTML = "";
    for (const o of sel.options) {
      const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "option");
      b.className = o.value === sel.value ? "an" : ""; b.innerHTML = `${FLAGGE[o.value]}${o.text}`;
      b.addEventListener("click", () => { sel.value = o.value; zu(); sel.dispatchEvent(new Event("change")); });
      liste.append(b);
    }
  };
  const zu = () => { liste.hidden = true; box.classList.remove("offen"); };
  knopf.addEventListener("click", (e) => { e.stopPropagation(); const war = liste.hidden; document.querySelectorAll(".wahl-l").forEach((l) => { l.hidden = true; l.parentNode.classList.remove("offen"); }); if (war) { malen(); liste.hidden = false; box.classList.add("offen"); } });
  document.addEventListener("click", (e) => { if (!box.contains(e.target)) zu(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") zu(); });
  sel.addEventListener("change", malen);
  new MutationObserver(malen).observe(sel, { childList: true });
  malen();
  return malen;
}
const neuMalen = [glasAuswahl(von), glasAuswahl(nach)];
$("tausch").addEventListener("click", () => neuMalen.forEach((f) => f()));

// ---- Tonfall: Locker / Formell (Regeln für Deutsch und Englisch) ----
let ton = speicher("ue_ton") || "normal";
const ersetze = (t, liste) => liste.reduce((x, [r, w]) => x.replace(r, w), t);
const wort = (w) => new RegExp(`\\b${w}\\b`, "g");
const beide = (liste) => liste.flatMap(([a, b]) => [[wort(a.replace("'", "['’]")), b], [wort(a[0].toUpperCase() + a.slice(1).replace("'", "['’]")), b[0].toUpperCase() + b.slice(1)]]);
const EN_LOCKER = beide([["I am", "I'm"], ["you are", "you're"], ["we are", "we're"], ["they are", "they're"], ["it is", "it's"], ["that is", "that's"], ["do not", "don't"], ["does not", "doesn't"], ["did not", "didn't"], ["is not", "isn't"], ["are not", "aren't"], ["cannot", "can't"], ["will not", "won't"], ["I will", "I'll"], ["you will", "you'll"], ["I have", "I've"], ["would not", "wouldn't"], ["going to", "gonna"], ["want to", "wanna"], ["hello", "hey"], ["goodbye", "bye"], ["how are you", "what's up"]]);
const EN_FORMELL = beide([["I'm", "I am"], ["you're", "you are"], ["we're", "we are"], ["they're", "they are"], ["it's", "it is"], ["that's", "that is"], ["don't", "do not"], ["doesn't", "does not"], ["didn't", "did not"], ["isn't", "is not"], ["aren't", "are not"], ["can't", "cannot"], ["won't", "will not"], ["I'll", "I will"], ["you'll", "you will"], ["I've", "I have"], ["wouldn't", "would not"], ["gonna", "going to"], ["wanna", "want to"], ["yeah", "yes"], ["hey", "hello"], ["hi", "hello"], ["bye", "goodbye"], ["you coming", "are you coming"], ["thanks", "thank you"], ["how's", "how is"], ["what's", "what is"], ["there's", "there is"], ["let's", "let us"]]);
const SIE_VERB = { bist: "sind", hast: "haben", willst: "wollen", kannst: "können", musst: "müssen", sollst: "sollen", darfst: "dürfen", weißt: "wissen", magst: "mögen", wirst: "werden", möchtest: "möchten", isst: "essen", gibst: "geben", nimmst: "nehmen", siehst: "sehen", liest: "lesen", fährst: "fahren", läufst: "laufen", hältst: "halten", triffst: "treffen", sprichst: "sprechen", hilfst: "helfen", vergisst: "vergessen" };
const gross1 = (w) => w[0].toUpperCase() + w.slice(1);
const wieVorher = (alt, neu) => (alt[0] === alt[0].toUpperCase() ? gross1(neu) : neu);
const sieVerb = (v) => { const k = v.toLowerCase(); return SIE_VERB[k] || (k.endsWith("est") ? k.slice(0, -3) + "en" : k.slice(0, -2) + "en"); };
function deFormell(t) {
  t = t.replace(/\b(\p{L}+st) du\b/gu, (m, v) => wieVorher(v, sieVerb(v)) + " Sie");
  t = t.replace(/\b[Dd]u (\p{L}+st)\b/gu, (m, v) => "Sie " + sieVerb(v));
  t = t.replace(/([Ww])ie geht['’]?s\b/g, (m, w) => w + "ie geht es Ihnen");
  return ersetze(t, [[/\bdich\b/g, "Sie"], [/\bdir\b/g, "Ihnen"], [/\b[Dd]ein(e|en|em|er|es)?\b/g, (m, e) => "Ihr" + (e || "")], [/\b[Dd]u\b/g, "Sie"], [/\beuch\b/g, "Sie"], [/\bHallo\b/g, "Guten Tag"], [/\bHey\b/g, "Guten Tag"], [/\bTschüss\b/g, "Auf Wiedersehen"]]);
}
const DU_VERB = Object.fromEntries(Object.entries(SIE_VERB).map(([a, b]) => [b, a]));
const duVerb = (v) => { const k = v.toLowerCase(); return DU_VERB[k] || (/[td]en$/.test(k) ? k.slice(0, -2) + "est" : k.slice(0, -2) + "st"); };
function deLocker(t) {
  t = t.replace(/\b(\p{L}+en) Sie\b/gu, (m, v) => wieVorher(v, duVerb(v)) + " du");
  t = t.replace(/(^|[.!?]\s+|\n)Sie (\p{L}+en)\b/gu, (m, a, v) => a + "Du " + duVerb(v));
  t = t.replace(/([Ww])ie geht es (dir|Ihnen)\b/g, (m, w) => w + "ie geht's");
  return ersetze(t, [[/\bIhnen\b/g, "dir"], [/\bIhr(e|en|em|er|es)?\b/g, (m, e) => "dein" + (e || "")], [/\bGuten Tag\b/g, "Hey"], [/\bHallo\b/g, "Hey"], [/\bAuf Wiedersehen\b/g, "Tschüss"]]);
}
function tonfall(t, sprache) {
  if (ton === "normal") return t;
  if (sprache === "en") return ersetze(t, ton === "locker" ? EN_LOCKER : EN_FORMELL);
  // Deutsch: Tonlage macht das eigene Netz selbst (Steuerwort), nur als Absicherung nachbessern
  if (sprache === "de") return ton === "formell" ? deFormell(t) : deLocker(t);
  return t;
}
const tonW = $("tonwahl"), tonBox = document.querySelector(".ton"), tonKnoepfe = tonBox.querySelectorAll("button");
function tonZeigen() {
  tonKnoepfe.forEach((k) => k.classList.toggle("an", k.dataset.ton === ton));
  const geht = nach.value === "de" || nach.value === "en";
  tonW.classList.toggle("aus", !geht);
  $("tonN").textContent = { normal: "Normal", locker: "Locker", formell: "Formell" }[ton];
  tonW.title = geht ? "" : "Tonfall gibt es für Deutsch und Englisch als Zielsprache";
}
tonKnoepfe.forEach((k) => k.addEventListener("click", () => { tonBox.hidden = true; tonW.classList.remove("offen"); ton = k.dataset.ton; speicher("ue_ton", ton); tonZeigen(); los(); }));
nach.addEventListener("change", tonZeigen);
$("tausch").addEventListener("click", tonZeigen);
tonZeigen();
$("tonK").addEventListener("click", (e) => { e.stopPropagation(); tonBox.hidden = !tonBox.hidden; tonW.classList.toggle("offen", !tonBox.hidden); });
document.addEventListener("click", (e) => { if (!tonW.contains(e.target)) { tonBox.hidden = true; tonW.classList.remove("offen"); } });
