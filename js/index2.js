// Server-Status: fragt den Shop-Server (Mumbai) – antwortet er, laeuft auch der Dienst
async function srvCheck(){const e=document.getElementById("srv");if(!e)return;let ok=false;
  try{const c=new AbortController();setTimeout(()=>c.abort(),8000);const r=await fetch(SHOP_API+"/api/health",{signal:c.signal,cache:"no-store"});ok=r.ok&&(await r.json()).ok}catch(x){}
  e.className="srv "+(ok?"ok":"bad");const h=document.getElementById("srvHero");if(h){h.querySelector("b").textContent=ok?"Online":"Störung";h.querySelector(".dot").style.background=ok?"":"#f87171"}e.title=ok?"Server Mumbai läuft":"Server Mumbai: Störung – wir sind dran"}
srvCheck();setInterval(srvCheck,60000);
