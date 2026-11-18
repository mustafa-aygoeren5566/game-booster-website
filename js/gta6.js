(function () {
  var D = window.GTA6; if (!D) return;
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("karte"), g = document.getElementById("punkte");
  var info = document.getElementById("info"), filt = document.getElementById("filter");
  var aus = {}, erledigt = {};
  try { erledigt = JSON.parse(localStorage.getItem("gta6_erledigt") || "{}"); } catch (e) {}
  function speichern() { try { localStorage.setItem("gta6_erledigt", JSON.stringify(erledigt)); } catch (e) {} }
  function reg(id) { for (var i = 0; i < D.regionen.length; i++) if (D.regionen[i].id === id) return D.regionen[i]; }
  function zeige(titel, unter, text) {
    info.innerHTML = "";
    var h = document.createElement("h3"); h.textContent = titel;
    var s = document.createElement("div"); s.className = "unter"; s.textContent = unter;
    var p = document.createElement("p"); p.textContent = text;
    info.appendChild(h); info.appendChild(s); info.appendChild(p);
  }
  function zeichnen() {
    g.innerHTML = "";
    D.punkte.forEach(function (pt, i) {
      if (aus[pt.k]) return;
      var c = document.createElementNS(NS, "g");
      c.setAttribute("class", "pk k-" + pt.k + (erledigt["p" + i] ? " ok" : ""));
      c.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ")");
      c.setAttribute("tabindex", "0");
      var r = document.createElementNS(NS, "circle"); r.setAttribute("r", "6");
      var t = document.createElementNS(NS, "title"); t.textContent = pt.n;
      c.appendChild(t); c.appendChild(r);
      function wahl() {
        var re = reg(pt.r);
        zeige(pt.n, (re ? re.name : "") + (pt.genau ? "" : " · Lage ungefähr"), pt.t);
        var b = document.createElement("button"); b.className = "hak";
        b.textContent = erledigt["p" + i] ? "Als offen markieren" : "Als erledigt markieren";
        b.onclick = function () { erledigt["p" + i] = !erledigt["p" + i]; speichern(); zeichnen(); wahl(); };
        info.appendChild(b);
      }
      c.addEventListener("click", wahl);
      c.addEventListener("keydown", function (e) { if (e.key === "Enter") wahl(); });
      g.appendChild(c);
    });
  }
  D.kategorien.forEach(function (k) {
    var n = D.punkte.filter(function (p) { return p.k === k.id; }).length;
    var b = document.createElement("button");
    b.className = "chip k-" + k.id + " an"; b.type = "button";
    b.innerHTML = '<i></i>';
    b.appendChild(document.createTextNode(k.name + " " + n));
    b.onclick = function () { aus[k.id] = !aus[k.id]; b.classList.toggle("an", !aus[k.id]); zeichnen(); };
    filt.appendChild(b);
  });
  Array.prototype.forEach.call(svg.querySelectorAll("[data-r]"), function (el) {
    el.addEventListener("click", function () {
      var re = reg(el.getAttribute("data-r"));
      if (re) zeige(re.name, "Region", re.text);
    });
  });
  zeichnen();
  // Missionen
  var m = document.getElementById("missionen");
  document.getElementById("mtext").textContent = D.missionen.text;
  D.missionen.kapitel.forEach(function (k, ki) {
    var box = document.createElement("div"); box.className = "kap";
    var h = document.createElement("h3"); h.textContent = k.name; box.appendChild(h);
    if (!k.liste.length) {
      var p = document.createElement("p"); p.className = "leer"; p.textContent = "Missionen folgen nach dem Release.";
      box.appendChild(p);
    }
    k.liste.forEach(function (name, mi) {
      var id = "m" + ki + "_" + mi, l = document.createElement("label");
      var c = document.createElement("input"); c.type = "checkbox"; c.checked = !!erledigt[id];
      c.onchange = function () { erledigt[id] = c.checked; speichern(); };
      l.appendChild(c); l.appendChild(document.createTextNode(name)); box.appendChild(l);
    });
    m.appendChild(box);
  });
  document.getElementById("stand").textContent = D.stand;
})();
