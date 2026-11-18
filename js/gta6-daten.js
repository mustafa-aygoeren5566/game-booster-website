// GTA 6 Leonida: eigene Datensammlung aus öffentlichen Angaben (Trailer, Rockstar-Webseite, Editionstexte).
// x/y beziehen sich auf die eigene Karte (viewBox 0 0 600 700). genau:false = Lage nur ungefähr.
window.GTA6 = {
  stand: "18.11.2026",
  regionen: [
    { id: "kalaga", name: "Mount Kalaga", text: "Nationalpark und Berge im Norden an der Staatsgrenze." },
    { id: "ambrosia", name: "Ambrosia", text: "Ländlich und industriell im Landesinneren, rund um den Lake Leonida. Hier steht die Zuckerraffinerie." },
    { id: "gellhorn", name: "Port Gellhorn", text: "Heruntergekommene Hafenstadt an der Golfküste im Westen." },
    { id: "grass", name: "Grassrivers", text: "Riesiges Sumpfgebiet mit Airboats und abgelegenen Siedlungen." },
    { id: "vice", name: "Vice City", text: "Größte und reichste Stadt von Leonida, mit Strand, Hochhäusern und Kanälen." },
    { id: "keys", name: "Leonida Keys", text: "Inselkette im Süden, verbunden über lange Brücken. Hier beginnt die Story." }
  ],
  kategorien: [
    { id: "ort", name: "Orte" },
    { id: "geschaeft", name: "Geschäfte" },
    { id: "garage", name: "Garagen" },
    { id: "sammel", name: "Sammelobjekte" }
  ],
  punkte: [
    { n: "Ocean Beach", k: "ort", r: "vice", x: 503, y: 492, genau: false, t: "Strandviertel von Vice City." },
    { n: "Shore Drive", k: "ort", r: "vice", x: 498, y: 512, genau: false, t: "Straße entlang von Ocean Beach." },
    { n: "Shore Court", k: "garage", r: "vice", x: 490, y: 500, genau: false, t: "Garage aus dem Vintage-Vice-City-Paket, wenige Schritte von Ocean Beach." },
    { n: "Little Cuba", k: "ort", r: "vice", x: 462, y: 505, genau: false, t: "Viertel mit kubanischen Bäckereien." },
    { n: "VC Port", k: "ort", r: "vice", x: 478, y: 478, genau: false, t: "Kreuzfahrthafen von Vice City." },
    { n: "Southside Vice City", k: "ort", r: "vice", x: 458, y: 535, genau: false, t: "Stadtteil im Süden der Stadt." },
    { n: "Stockyard", k: "geschaeft", r: "vice", x: 448, y: 486, genau: false, t: "Einkaufsviertel mit Stock 305 und Electric Fang Tattoo. Zuordnung zu Vice City noch nicht sicher." },
    { n: "Paradise Garage", k: "garage", r: "vice", x: 470, y: 462, genau: false, t: "In Watson Bay. Zuordnung zu Vice City noch nicht sicher." },
    { n: "Allied Crystal Raffinerie", k: "ort", r: "ambrosia", x: 300, y: 292, genau: false, t: "Zuckerraffinerie, größter Arbeitgeber in Ambrosia." },
    { n: "Lake Leonida", k: "ort", r: "ambrosia", x: 350, y: 238, genau: false, t: "Großer See zwischen Ambrosia und Mount Kalaga." },
    { n: "One-Eyed Willie's", k: "geschaeft", r: "ambrosia", x: 385, y: 222, genau: false, t: "Offroad-Werkstatt am Lake Leonida." }
  ],
  missionen: {
    text: "Laut Leaks gibt es einen Prolog, 5 Kapitel, fast 100 Story-Missionen und 2 große Heists. Die Namen sind noch nicht bestätigt und kommen nach dem Release.",
    kapitel: [
      { name: "Prolog", liste: [] },
      { name: "Kapitel 1", liste: [] },
      { name: "Kapitel 2", liste: [] },
      { name: "Kapitel 3", liste: [] },
      { name: "Kapitel 4", liste: [] },
      { name: "Kapitel 5", liste: [] }
    ]
  }
};
