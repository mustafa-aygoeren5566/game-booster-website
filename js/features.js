(function(){var w=document.querySelector(".v0b");if(!w)return;
var pw=w.querySelector('button[aria-label^="VPN"]');if(!pw)return;var box=pw.closest("div.flex-col");
var st=box.querySelector('[aria-live] span'),sub=box.querySelectorAll('[aria-live] span')[1],ring=pw.querySelector(".animate-ping-soft"),bg=pw.children[ring?1:0],ic=pw.querySelector("svg");
var on=true,reg="Europa";function draw(){pw.setAttribute("aria-pressed",on);pw.setAttribute("aria-label",on?"VPN trennen":"VPN verbinden");st.textContent=on?"Verbunden":"Getrennt";sub.textContent=on?reg+" · 24 ms":"Direkte Leitung";
 if(ring)ring.style.display=on?"":"none";bg.style.cssText=on?"":"border-color:var(--border);background:var(--muted);box-shadow:none";ic.style.color=on?"":"var(--muted-foreground)"}
pw.addEventListener("click",function(){on=!on;draw()});
box.querySelectorAll('[role=group] button').forEach(function(b){b.addEventListener("click",function(){reg=b.textContent;box.querySelectorAll('[role=group] button').forEach(function(x){var a=x===b;x.setAttribute("aria-pressed",a);x.classList.toggle("bg-primary",a);x.classList.toggle("text-primary-foreground",a);x.classList.toggle("text-muted-foreground",!a)});draw()})});
w.querySelectorAll("article").forEach(function(c){c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();c.style.setProperty("--x",e.clientX-r.left+"px");c.style.setProperty("--y",e.clientY-r.top+"px")})})})();
(function(){var box=document.querySelector(".v0b .lkm"),src=document.getElementById("vzSvg");if(!box||!src)return;
function copy(){var c=src.cloneNode(true);c.removeAttribute("id");c.querySelectorAll("[id]").forEach(function(e){if(e.tagName!=="clipPath"&&e.tagName!=="linearGradient"&&e.tagName!=="radialGradient")e.removeAttribute("id")});
 c.setAttribute("preserveAspectRatio","xMidYMid slice");c.style.pointerEvents="none";box.innerHTML="";box.appendChild(c)}
var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(copy,350)}).observe(src,{attributes:true,childList:true,subtree:true,attributes:true,attributeFilter:["viewBox"]});setTimeout(copy,600);})();
