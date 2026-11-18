// GTA 6 Leonida: eigene Datensammlung aus öffentlichen Angaben (Trailer, Rockstar-Webseite, Editionstexte).
// x/y auf der eigenen Karte (viewBox 0 0 700 1050). Lage = ungefähr, bis genaue Positionen bekannt sind.
window.GTA6 = {
  stand: "18.11.2026",
  regionen: [
    { id: "kalaga", name: "Mount Kalaga", x: 330, y: 130, text: "Nationalpark und Berge im Norden an der Staatsgrenze." },
    { id: "ambrosia", name: "Ambrosia", x: 400, y: 410, text: "Ländlich und industriell im Landesinneren, rund um den Lake Leonida. Hier steht die Zuckerraffinerie." },
    { id: "gellhorn", name: "Port Gellhorn", x: 135, y: 360, text: "Heruntergekommene Hafenstadt an der Golfküste im Westen." },
    { id: "grass", name: "Grassrivers", x: 320, y: 770, text: "Riesiges Sumpfgebiet mit Airboats und abgelegenen Siedlungen." },
    { id: "vice", name: "Vice City", x: 545, y: 590, text: "Größte und reichste Stadt von Leonida, mit Strand, Hochhäusern und Kanälen." },
    { id: "keys", name: "Leonida Keys", x: 215, y: 1000, text: "Inselkette im Süden, verbunden über lange Brücken. Hier beginnt die Story." }
  ],
  kategorien: [
    { id: "ort", name: "Orte", farbe: "#ec4899", icon: "M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" },
    { id: "geschaeft", name: "Geschäfte", farbe: "#f59e0b", icon: "M6 7V6a6 6 0 0 1 12 0v1h3l-1 15H4L3 7zm2 0h8V6a4 4 0 0 0-8 0z" },
    { id: "garage", name: "Garagen", farbe: "#3b82f6", icon: "M3 10l9-6 9 6v11h-3v-8H6v8H3zm5 5h8v2H8zm0 3h8v2H8z" },
    { id: "mission", name: "Missionen", farbe: "#8b5cf6", icon: "M5 2h2v20H5zm3 1h11l-3 4.5L19 12H8z" },
    { id: "sammel", name: "Sammelobjekte", farbe: "#eab308", icon: "M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z" },
    { id: "sprung", name: "Stunt-Sprünge", farbe: "#06b6d4", icon: "M2 20h20v2H2zm1-3l9-9 3 3 6-6v4l-6 6-3-3-7 7z" },
    { id: "waffe", name: "Waffen", farbe: "#ef4444", icon: "M2 9h15l2-2h3v4h-4l-1 2h-4l-1 3H8l1-3H5l-1 3H2z" },
    { id: "fahrzeug", name: "Fahrzeuge", farbe: "#10b981", icon: "M5 11l2-5h10l2 5h1a1 1 0 0 1 1 1v5h-2v2h-3v-2H8v2H5v-2H3v-5a1 1 0 0 1 1-1zm2.5 0h9l-1.2-3H8.7zM6.5 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" }
  ],
  punkte: [
    { n: "Ocean Beach", k: "ort", r: "vice", x: 640, y: 560, t: "Strandviertel von Vice City." },
    { n: "Shore Drive", k: "ort", r: "vice", x: 642, y: 600, t: "Straße entlang von Ocean Beach." },
    { n: "Shore Court", k: "garage", r: "vice", x: 632, y: 530, t: "Garage aus dem Vintage-Vice-City-Paket, wenige Schritte von Ocean Beach." },
    { n: "Little Cuba", k: "ort", r: "vice", x: 545, y: 625, t: "Viertel mit kubanischen Bäckereien." },
    { n: "VC Port", k: "ort", r: "vice", x: 590, y: 585, t: "Kreuzfahrthafen von Vice City." },
    { n: "Southside Vice City", k: "ort", r: "vice", x: 535, y: 690, t: "Stadtteil im Süden der Stadt." },
    { n: "Stockyard", k: "geschaeft", r: "vice", x: 515, y: 560, t: "Einkaufsviertel mit Stock 305 und Electric Fang Tattoo. Zuordnung zu Vice City noch nicht sicher." },
    { n: "Paradise Garage", k: "garage", r: "vice", x: 560, y: 505, t: "In Watson Bay. Zuordnung zu Vice City noch nicht sicher." },
    { n: "Allied Crystal Raffinerie", k: "ort", r: "ambrosia", x: 330, y: 420, t: "Zuckerraffinerie, größter Arbeitgeber in Ambrosia." },
    { n: "Lake Leonida", k: "ort", r: "ambrosia", x: 395, y: 300, t: "Großer See zwischen Ambrosia und Mount Kalaga." },
    { n: "One-Eyed Willie's", k: "geschaeft", r: "ambrosia", x: 445, y: 275, t: "Offroad-Werkstatt am Lake Leonida." }
  ],
  missionen: {
    text: "Laut Leaks gibt es einen Prolog, 5 Kapitel, fast 100 Story-Missionen und 2 große Heists. Die Namen sind noch nicht bestätigt und kommen nach dem Release.",
    kapitel: [
      { name: "Prolog", liste: [] }, { name: "Kapitel 1", liste: [] }, { name: "Kapitel 2", liste: [] },
      { name: "Kapitel 3", liste: [] }, { name: "Kapitel 4", liste: [] }, { name: "Kapitel 5", liste: [] }
    ]
  }
};
