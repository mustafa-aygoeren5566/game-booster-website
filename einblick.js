(function(){var c=document.querySelectorAll('.fc');if(!('IntersectionObserver'in window)){c.forEach(function(e){e.classList.add('in')});return}
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{threshold:.2});c.forEach(function(e){o.observe(e)})})();
// Videoende: Button springt mit Animation ins Video
document.querySelectorAll('.yt video').forEach(function(v){
  var box=v.parentNode,a=document.createElement('div');a.className='vEnd';
  a.innerHTML='<span class="ve-tag">Game Booster VPN</span><b>Bereit für <em>bessere Matches?</em></b><div class="ve-pts"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="2"/><path d="M8 12.5l3 3 5-6"/></svg>Matchsuche über Mumbai</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="2"/><path d="M8 12.5l3 3 5-6"/></svg>Niedriger Ping</span><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke-width="2"/><path d="M8 12.5l3 3 5-6"/></svg>PC, PS5 &amp; Xbox</span></div><a class="btn pr ve-go" href="index.html#preise">Jetzt starten<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg></a><i class="ve-code">-10 % mit Code <strong>START10</strong></i><button type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/></svg>Nochmal ansehen</button>';
  box.appendChild(a);
  a.querySelector('button').onclick=function(){a.classList.remove('an');v.currentTime=0;v.play()};
  v.addEventListener('ended',function(){a.classList.add('an')});
  v.addEventListener('play',function(){a.classList.remove('an')});
});
