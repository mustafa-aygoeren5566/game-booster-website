// Läuft im Hintergrund, damit die Seite beim Übersetzen nicht hängt.
import { pipeline, env } from "../tf/transformers.min.js";

env.allowLocalModels = false;
env.useBrowserCache = true;
env.backends.onnx.wasm.wasmPaths = "/tf/";
env.backends.onnx.wasm.numThreads = 1;

const netze = {};

function netz(name) {
  if (!netze[name]) {
    netze[name] = pipeline("translation", name, {
      dtype: "q8",
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
        const [a] = await t(s.vorsatz + x, { num_beams: 2, max_new_tokens: Math.min(400, 20 + x.length), no_repeat_ngram_size: 4, repetition_penalty: 1.2 });
        neu.push(a.translation_text.replace(/([.!?,\-])\1{2,}.*$/s, "$1").trim());
      }
      akt = neu;
    }
    postMessage({ art: "fertig", id, saetze: akt });
  } catch (err) {
    postMessage({ art: "fehler", id, text: String(err && err.message || err) });
  }
};
