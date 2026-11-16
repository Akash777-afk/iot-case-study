import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // page-level CSS zoom: pointer coords are in screen px, element px are zoomed
  var Z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

  /* ---- hero signal network ---- */
  var cv = document.getElementById('net'), ctx = cv.getContext('2d'), nodes = [], packets = [], W, H, dpr;
  function size(){ dpr = Math.min(window.devicePixelRatio||1,2); W = cv.offsetWidth; H = cv.offsetHeight; cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    var n = Math.round(Math.min(90, W*H/16000)); nodes = [];
    for (var i=0;i<n;i++) nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()<.12?3.2:1.6,hub:Math.random()<.12}); }
  var mouse = {x:-999,y:-999};
  cv.parentElement.addEventListener('pointermove', function(e){ var r = cv.getBoundingClientRect(); mouse.x = (e.clientX-r.left)/Z; mouse.y = (e.clientY-r.top)/Z; });
  cv.parentElement.addEventListener('pointerleave', function(){ mouse.x = mouse.y = -999; });
  function frame(){
    ctx.clearRect(0,0,W,H);
    var D = 150;
    for (var i=0;i<nodes.length;i++){ var a = nodes[i];
      if(!reduce){ a.x += a.vx; a.y += a.vy; if(a.x<0||a.x>W) a.vx*=-1; if(a.y<0||a.y>H) a.vy*=-1; }
      for (var j=i+1;j<nodes.length;j++){ var b = nodes[j], dx=a.x-b.x, dy=a.y-b.y, d=Math.sqrt(dx*dx+dy*dy);
        if (d<D){ ctx.strokeStyle = 'rgba(147,197,253,'+(0.16*(1-d/D))+')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          if(!reduce && Math.random()<0.0009 && packets.length<26) packets.push({a:a,b:b,t:0}); } }
      var md = Math.hypot(a.x-mouse.x,a.y-mouse.y);
      if (md<170){ ctx.strokeStyle='rgba(108,182,255,'+(0.5*(1-md/170))+')'; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mouse.x,mouse.y); ctx.stroke(); }
      ctx.fillStyle = a.hub ? '#6CB6FF' : 'rgba(147,197,253,.55)'; ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,7); ctx.fill();
      if (a.hub){ ctx.strokeStyle='rgba(108,182,255,.25)'; ctx.beginPath(); ctx.arc(a.x,a.y,a.r+6,0,7); ctx.stroke(); }
    }
    for (var k=packets.length-1;k>=0;k--){ var p = packets[k]; p.t += 0.012; if(p.t>=1){ packets.splice(k,1); continue; }
      var x = p.a.x+(p.b.x-p.a.x)*p.t, y = p.a.y+(p.b.y-p.a.y)*p.t; ctx.fillStyle='#6CB6FF'; ctx.shadowColor='#6CB6FF'; ctx.shadowBlur=10; ctx.beginPath(); ctx.arc(x,y,2.4,0,7); ctx.fill(); ctx.shadowBlur=0; }
    if(!reduce) requestAnimationFrame(frame);
  }
  size(); frame(); window.addEventListener('resize', function(){ size(); if(reduce) frame(); });

  /* ---- scroll progress + active nav ---- */
  var prog = document.getElementById('progress'), links = [].slice.call(document.querySelectorAll('.nav-links a'));
  function onScroll(){ var h = document.documentElement; var p = h.scrollTop/(h.scrollHeight-h.clientHeight||1); prog.style.transform='scaleX('+p+')';
    var cur = null; links.forEach(function(l){ var s = document.querySelector(l.getAttribute('href')); if(s && s.getBoundingClientRect().top < 160) cur = l; });
    links.forEach(function(l){ l.classList.toggle('on', l===cur); }); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---- GSAP motion (enhancement only: everything is visible at rest) ---- */
  if (!reduce){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero h1', {y:40, duration:1.1, ease:'power3.out'});
    gsap.from('.hero .meta div', {y:18, duration:.8, stagger:.08, delay:.2, ease:'power2.out'});
    gsap.fromTo('#laptop', {rotateX:22, scale:.94}, {rotateX:0, scale:1, ease:'none', scrollTrigger:{trigger:'.stage', start:'top 85%', end:'center 40%', scrub:true}});
    gsap.utils.toArray('.sec-head h2, .statement').forEach(function(el){ gsap.from(el, {y:28, duration:.9, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%'}}); });
    gsap.utils.toArray('.track i').forEach(function(el){ gsap.from(el, {scaleX:0, duration:1, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 95%'}}); });
    gsap.utils.toArray('.cols i').forEach(function(el, i){ gsap.from(el, {scaleY:0, duration:.9, delay:i%5*0.06, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 95%'}}); });
    gsap.from('.thanks h2', {y:60, duration:1.2, ease:'power3.out', scrollTrigger:{trigger:'.thanks', start:'top 80%'}});
  }
})();
