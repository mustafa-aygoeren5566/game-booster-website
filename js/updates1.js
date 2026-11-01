// Server-Status (Mumbai)
(async()=>{const e=document.getElementById("status");let ok=false;try{const r=await fetch("https://65-20-95-163.sslip.io/api/health",{cache:"no-store"});ok=r.ok&&(await r.json()).ok}catch(x){}
  e.classList.add(ok?"ok":"bad");e.querySelector("em").textContent=ok?"Online":"Störung – wir sind dran"})();
// Neueste Version markieren + neue App-Versionen automatisch aus den GitHub-Releases (deutscher Teil der Notizen) ergaenzen
const TL=document.getElementById("tl"),ICON=TL.querySelector(".app .ic").outerHTML;
function markNew(){const f=TL.querySelector(".it");TL.querySelectorAll(".tag").forEach(t=>t.remove());TL.querySelectorAll(".it").forEach(x=>x.classList.remove("new"));
  if(f){f.classList.add("new");f.querySelector(".hd").insertAdjacentHTML("beforeend",'<span class="tag">Neu</span>')}}
markNew();
// GitHub-API: frische Antwort, sonst letzte gespeicherte (Limit 60 Abrufe/Std. pro IP) – sonst bliebe nur der alte feste Stand stehen
async function gh(u){let c=null;try{c=JSON.parse(localStorage.getItem("gh:"+u))}catch(e){}
  try{const r=await fetch(u,{cache:"no-cache"});if(r.ok){const j=await r.json();try{localStorage.setItem("gh:"+u,JSON.stringify(j))}catch(e){}return j}}catch(e){}return c}
// Eintrag nach Datum einsortieren (neueste oben), egal welcher Abruf zuerst fertig ist
function place(el){const ts=x=>+(x.dataset.t||0)||Date.parse((x.querySelector("time")||{}).textContent?.split(".").reverse().join("-"));
  const after=[...TL.querySelectorAll(".it")].find(x=>ts(x)<+el.dataset.t);after?TL.insertBefore(el,after):TL.append(el)}
(async()=>{try{
  const l=await gh("https://api.github.com/repos/mustafa-aygoeren5566/game-booster-releases/releases?per_page=20");if(!l)return;
  const known=new Set([...TL.querySelectorAll("[data-v]")].map(x=>x.dataset.v));
  const esc=t=>t.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
  let n=0;l.filter(x=>!x.draft&&!known.has(x.tag_name)).forEach(x=>{
    const de=(x.body||"").split(/^## English/m)[0],li=de.split("\n").filter(z=>/^\s*-\s/.test(z)).map(z=>`<li>${esc(z.replace(/^\s*-\s/,""))}</li>`).join("");
    const d=new Date(x.published_at).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});
    if(!li)return;const el=document.createElement("div");el.className="it app";el.dataset.v=x.tag_name;el.dataset.t=Date.parse(x.published_at);
    el.innerHTML=`<div class="hd">${ICON}<h2>${x.tag_name}</h2><time>${d}</time></div><ul>${li}</ul>`;place(el);n++});
  if(n)markNew()
}catch(e){}})();
// Webseiten-Aenderungen automatisch: Commits im Webseiten-Repo, deren Titel mit "Webseite:" beginnt.
// Titel = Ueberschrift, Zeilen "- ..." im Text = Punkte. Aeltere Eintraege stehen fest oben im HTML.
(async()=>{try{
  const l=await gh("https://api.github.com/repos/mustafa-aygoeren5566/game-booster-website/commits?per_page=30&since=2026-11-01T05:05:00Z");if(!l)return;
  const WEB=TL.querySelector(".web .ic").outerHTML;
  const esc=t=>t.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]);
  const items=l.map(c=>{const m=c.commit.message.split("\n"),t=m[0];if(!/^Webseite:/i.test(t))return null;
    const li=m.slice(1).filter(z=>/^\s*-\s/.test(z)).map(z=>`<li>${esc(z.replace(/^\s*-\s/,""))}</li>`).join("")||`<li>${esc(t.replace(/^Webseite:\s*/i,""))}</li>`;
    return{d:new Date(c.commit.author.date),li}}).filter(Boolean);
  const byDay={};items.forEach(x=>{const k=x.d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric"});(byDay[k]=byDay[k]||{d:x.d,li:""}).li+=x.li});
  Object.entries(byDay).forEach(([k,v])=>{const el=document.createElement("div");el.className="it web";el.dataset.t=+v.d;
    el.innerHTML=`<div class="hd">${WEB}<h2>Webseite</h2><time>${k}</time></div><ul>${v.li}</ul>`;
    place(el)});
  if(items.length)markNew();
}catch(e){}})();
