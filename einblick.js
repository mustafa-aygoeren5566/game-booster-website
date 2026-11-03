(function(){var c=document.querySelectorAll('.fc');if(!('IntersectionObserver'in window)){c.forEach(function(e){e.classList.add('in')});return}
var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}})},{threshold:.2});c.forEach(function(e){o.observe(e)})})();
