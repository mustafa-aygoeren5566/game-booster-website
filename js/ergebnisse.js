(function(){var g=document.querySelector(".resg"),f=g.querySelectorAll(".res"),d=document.querySelector(".rsdots"),i=0;
f.forEach(function(_,k){var b=document.createElement("button");b.type="button";b.setAttribute("aria-label","Bild "+(k+1));b.onclick=function(){go(k)};d.appendChild(b)});
function go(k){i=(k+f.length)%f.length;g.scrollTo({left:f[i].offsetLeft-g.offsetLeft,behavior:"smooth"})}
function mark(){i=Math.round(g.scrollLeft/(g.clientWidth+20));d.querySelectorAll("button").forEach(function(b,k){b.classList.toggle("on",k===i)})}
g.addEventListener("scroll",function(){clearTimeout(g._t);g._t=setTimeout(mark,60)});mark();
document.querySelector(".rsl .ar.l").onclick=function(){go(i-1)};document.querySelector(".rsl .ar.r").onclick=function(){go(i+1)};})();
