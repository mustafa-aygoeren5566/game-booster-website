// Alle CSS-Animationen auf einen gemeinsamen Startpunkt setzen, damit Mauszeiger, Klick und Schalter immer im Takt sind
(function(){if(!document.getAnimations)return;
function sync(){try{document.getAnimations().forEach(function(a){if(a instanceof CSSAnimation)a.startTime=0})}catch(e){}}
window.addEventListener("load",function(){sync();setTimeout(sync,500)});
document.addEventListener("visibilitychange",function(){if(!document.hidden)sync()});
setInterval(sync,30000);})();
