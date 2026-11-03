(function(){var c=document.querySelectorAll('.fc');if(!('IntersectionObserver'in window)){c.forEach(function(e){e.classList.add('in')});return}
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{threshold:.2});c.forEach(function(e){o.observe(e)})})();
// Videoende: Button springt mit Animation ins Video
document.querySelectorAll('.yt video').forEach(function(v){
  var box=v.parentNode,a=document.createElement('div');a.className='vEnd';
  a.innerHTML='<b>Bereit für bessere Matches?</b><a class="btn pr" href="index.html#preise">Jetzt starten</a><button type="button">Nochmal ansehen</button>';
  box.appendChild(a);
  a.querySelector('button').onclick=function(){a.classList.remove('an');v.currentTime=0;v.play()};
  v.addEventListener('ended',function(){a.classList.add('an')});
  v.addEventListener('play',function(){a.classList.remove('an')});
});
