(function(){var w=document.querySelector(".v0b");if(!w)return;
var pw=w.querySelector('button[aria-label^="VPN"]');if(!pw)return;var box=pw.closest("div.flex-col");
var st=box.querySelector('[aria-live] span'),sub=box.querySelectorAll('[aria-live] span')[1],ring=pw.querySelector(".animate-ping-soft"),bg=pw.children[ring?1:0],ic=pw.querySelector("svg");
var on=true,reg="Europa";function draw(){pw.setAttribute("aria-pressed",on);pw.setAttribute("aria-label",on?"VPN trennen":"VPN verbinden");st.textContent=on?"Verbunden":"Getrennt";sub.textContent=on?reg+" · 24 ms":"Direkte Leitung";
 if(ring)ring.style.display=on?"":"none";bg.style.cssText=on?"":"border-color:var(--border);background:var(--muted);box-shadow:none";ic.style.color=on?"":"var(--muted-foreground)"}
pw.addEventListener("click",function(){on=!on;draw()});
box.querySelectorAll('[role=group] button').forEach(function(b){b.addEventListener("click",function(){reg=b.textContent;box.querySelectorAll('[role=group] button').forEach(function(x){var a=x===b;x.setAttribute("aria-pressed",a);x.classList.toggle("bg-primary",a);x.classList.toggle("text-primary-foreground",a);x.classList.toggle("text-muted-foreground",!a)});draw()})});
w.querySelectorAll("article").forEach(function(c){c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();c.style.setProperty("--x",e.clientX-r.left+"px");c.style.setProperty("--y",e.clientY-r.top+"px")})})})();
(function(){var box=document.querySelector(".v0b .lkm"),src=document.getElementById("vzSvg");if(!box||!src)return;
// Einmal kopieren, sobald die grosse Karte auf dein Land gezoomt hat - danach bleibt die Kachel so (kein Rauszoomen)
var done=false,t,mo;box.style.opacity=0;box.style.transition="opacity .8s";
function zoomed(){var v=(src.getAttribute("viewBox")||"").split(/[ ,]+/).map(Number);return v.length===4&&v[2]<700}
function copy(){if(done||!zoomed())return;done=true;if(mo)mo.disconnect();
 var c=src.cloneNode(true);c.removeAttribute("id");c.querySelectorAll("[id]").forEach(function(e){if(e.tagName!=="clipPath"&&e.tagName!=="linearGradient"&&e.tagName!=="radialGradient")e.removeAttribute("id")});
 var me=c.querySelector('circle[fill="#93c5fd"]'),mx=me?+me.getAttribute("cx"):250,my=me?+me.getAttribute("cy"):70,sx=520,sy=127;
 var bw=box.clientWidth||360,bh=box.clientHeight||256,x0=Math.min(mx,sx)-28,x1=Math.max(mx,sx)+62,y0=Math.min(my,sy)-36,y1=Math.max(my,sy)+30,w=x1-x0,h=y1-y0,cx=(x0+x1)/2,cy=(y0+y1)/2;
 if(w/h>bw/bh)h=w*bh/bw;else w=h*bw/bh;c.setAttribute("viewBox",[cx-w/2,cy-h/2,w,h].join(" "));
 c.setAttribute("preserveAspectRatio","xMidYMid slice");c.style.pointerEvents="none";box.innerHTML="";box.appendChild(c);box.style.opacity=1}
mo=new MutationObserver(function(){clearTimeout(t);t=setTimeout(copy,700)});mo.observe(src,{attributes:true,attributeFilter:["viewBox"]});
setTimeout(function(){if(!done)copy()},4000);})();
