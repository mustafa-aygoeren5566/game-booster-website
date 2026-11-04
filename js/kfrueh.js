// Rueckkehrer schon vor dem ersten Anzeigen erkennen, damit "Dein Zugang" nicht erst nachtraeglich ueber das Video springt
try { if (new URLSearchParams(location.search).get("t") || localStorage.getItem("gbKonsole")) document.documentElement.classList.add("krueck0") } catch (e) {}
