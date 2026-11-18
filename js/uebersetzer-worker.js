// Läuft im Hintergrund, damit die Seite beim Übersetzen nicht hängt.
import { pipeline, env } from "../tf/transformers.min.js?v=2";

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.wasmPaths = "/tf/";
env.backends.onnx.wasm.numThreads = 1;

const netze = {};
// Eigene Netze auf eine feste Version binden: neue Version = neue Adresse, alter Browser-Speicher wird nicht benutzt
const VERSION = {
  "gamebooster-vpn/gb-uebersetzer-de-en": "4e5eb0c1bb82f9f311512d8cd763eb82ff0e19a2",
  "gamebooster-vpn/gb-uebersetzer-en-de": "637204ba4010546a9477aa1215e2419095c9aadb",
};
// Satzanfang groß: kleingeschriebene Eingaben liefern sonst kleingeschriebene Sätze
const gross = (t) => t.replace(/^(\s*["„»(]?)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());

function netz(name) {
  if (!netze[name]) {
    netze[name] = pipeline("translation", name, {
      dtype: "q8",
      revision: VERSION[name] || "main",
      progress_callback: (p) => {
        if (p.status === "progress" && p.total) postMessage({ art: "laden", datei: p.file, geladen: p.loaded, gesamt: p.total });
      },
    }).catch((e) => { delete netze[name]; throw e; });
  }
  return netze[name];
}

onmessage = async (e) => {
  const { id, schritte, saetze } = e.data;
  try {
    let akt = saetze;
    for (const s of schritte) {
      const t = await netz(s.netz);
      postMessage({ art: "bereit" });
      // Satz für Satz: verhindert, dass kurze Sätze im Stapel mit Füllzeichen „auslaufen“
      const neu = [];
      for (const x of akt) {
        const [a] = await t(s.vorsatz + gross(x), { num_beams: 2, max_new_tokens: Math.min(400, 20 + x.length), no_repeat_ngram_size: 4, repetition_penalty: 1.2 });
        neu.push(gross(a.translation_text.replace(/([.!?,\-])\1{2,}.*$/s, "$1").trim()));
      }
      akt = neu;
    }
    postMessage({ art: "fertig", id, saetze: akt });
  } catch (err) {
    postMessage({ art: "fehler", id, text: String(err && err.message || err) });
  }
};
