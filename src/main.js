import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';

window.gsap = gsap; window.ScrollTrigger = ScrollTrigger;

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

  /* ---- counters ---- */
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  var counted = new WeakSet();
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting || counted.has(e.target)) return; counted.add(e.target);
    var el = e.target, end = +el.getAttribute('data-count'), t0 = null;
    if (reduce) return;
    function step(t){ if(!t0) t0=t; var k = Math.min(1,(t-t0)/1400); var v = end*(1-Math.pow(1-k,3)); el.textContent = fmt(v); if(k<1) requestAnimationFrame(step); else el.textContent = fmt(end); }
    requestAnimationFrame(step); }); }, {threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ io.observe(el); });

  /* ---- persona tabs ---- */
  document.querySelectorAll('[data-persona]').forEach(function(card){
    var btns = card.querySelectorAll('.seg button');
    btns.forEach(function(b){ b.addEventListener('click', function(){ btns.forEach(function(x){ x.setAttribute('aria-selected', x===b?'true':'false'); });
      card.querySelectorAll('[data-panel]').forEach(function(p){ p.hidden = p.getAttribute('data-panel') !== b.getAttribute('data-view'); }); }); }); });

  /* ---- flow tabs ---- */
  var ftabs = document.querySelectorAll('[data-flow]');
  ftabs.forEach(function(b){ b.addEventListener('click', function(){ ftabs.forEach(function(x){ x.setAttribute('aria-selected', x===b?'true':'false'); document.getElementById(x.getAttribute('data-flow')).hidden = x!==b; });
    if (window.gsap && !reduce) gsap.from('#'+b.getAttribute('data-flow')+' .flow > *', {y:16, duration:.45, stagger:.05, ease:'power2.out'}); }); });

  /* ---- draggable stickies ---- */
  document.querySelectorAll('.sticky').forEach(function(s, i){
    var rot = ((i*37)%7)-3; s.style.transform = 'rotate('+rot+'deg)'; var ox=0, oy=0, sx, sy, on=false;
    s.addEventListener('pointerdown', function(e){ on=true; s.setPointerCapture(e.pointerId); sx=e.clientX/Z-ox; sy=e.clientY/Z-oy; s.classList.add('drag'); });
    s.addEventListener('pointermove', function(e){ if(!on) return; ox=e.clientX/Z-sx; oy=e.clientY/Z-sy; s.style.transform='translate('+ox+'px,'+oy+'px) rotate('+(rot*0.3)+'deg) scale(1.04)'; });
    function up(){ if(!on) return; on=false; s.classList.remove('drag'); s.style.transform='translate('+ox+'px,'+oy+'px) rotate('+rot+'deg)'; }
    s.addEventListener('pointerup', up); s.addEventListener('pointercancel', up);
    s.addEventListener('dblclick', function(){ ox=oy=0; s.style.transition='transform .4s'; s.style.transform='rotate('+rot+'deg)'; setTimeout(function(){ s.style.transition=''; }, 420); });
  });

  /* ---- compare slider ---- */
  var cmp = document.getElementById('compare'), rng = document.getElementById('compareRange');
  rng.addEventListener('input', function(){ cmp.style.setProperty('--x', rng.value+'%'); });

  /* ---- hi-fi switcher ---- */
  var data = [
    {u:'iot-dashboard-snowy.vercel.app/#/login', c:[['Circuit backdrop','The board pattern ties the login to the network the operator watches.'],['One focused card','User ID, password with show/hide, and a clear error message.'],['Version tag','“SIM Applet Operations v2.1” tells support which build is live.']]},
    {u:'iot-dashboard-snowy.vercel.app/#/', c:[['Five KPI cards','Each colored underline maps to one status and links to its list.'],['Blue-only charts','Status and type use tonal blues so they never read as alerts.'],['Security donut','99.3% whitelisted, with 702 blacklisted devices one click away.']]},
    {u:'iot-dashboard-snowy.vercel.app/#/devices', c:[['Virtualized table','Only visible rows render, so 100K devices scroll smoothly.'],['Search, filter, export','Every filter carries into the CSV, so export matches the screen.'],['Tabs, not pages','Onboarding and Security live here as tabs; old links redirect.']]},
    {u:'iot-dashboard-snowy.vercel.app/#/sim-applet', c:[['Version at a glance','Installed v2.1.0 vs target, 63,026 up to date, 37,088 waiting.'],['Disabled, not hidden','Import and Rollout stay visible for the future workflow.'],['Safe bulk update','Capped at 1,000 devices per session with compatibility shown.']]},
    {u:'iot-dashboard-snowy.vercel.app/#/analytics', c:[['Four instant filters','Customer, device type, location and time drive all nine cards.'],['Circle → BTS drill','Click a circle to see each BTS, its problem and affected meters.'],['AI insights tab','A natural-language box that says honestly it is a preview.']]}
  ];
  var sbtn = [].slice.call(document.querySelectorAll('[data-shot]')), imgs = document.querySelectorAll('#shots img'), url = document.getElementById('shotUrl'), co = document.getElementById('callouts'), cur = 0, timer;
  function show(i, user){ cur = i; sbtn.forEach(function(b,k){ b.setAttribute('aria-selected', k===i?'true':'false'); var t=b.querySelector('.tick'); t.style.transition='none'; t.style.width='0';
      if(k===i && !user && !reduce){ void t.offsetWidth; t.style.transition='width 5s linear'; t.style.width='100%'; } });
    imgs.forEach(function(im,k){ im.classList.toggle('on', k===i); }); url.textContent = data[i].u;
    co.innerHTML = data[i].c.map(function(c){ return '<div><b>'+c[0]+'</b>'+c[1]+'</div>'; }).join(''); }
  sbtn.forEach(function(b,k){ b.addEventListener('click', function(){ clearInterval(timer); show(k, true); }); });
  show(0); if(!reduce) timer = setInterval(function(){ show((cur+1)%data.length); }, 5000);

  /* ---- copy swatches ---- */
  var toast = document.getElementById('toast'), tt;
  function say(m){ toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function(){ toast.classList.remove('show'); }, 1600); }
  document.querySelectorAll('.sw-c').forEach(function(b){ b.addEventListener('click', function(){ var hx = b.getAttribute('data-hex');
    try { navigator.clipboard.writeText(hx).then(function(){ say('Copied '+hx); }, function(){ say(hx); }); } catch(e){ say(hx); } }); });

  /* ---- GSAP motion (enhancement only: everything is visible at rest) ---- */
  if (window.gsap && window.ScrollTrigger && !reduce){
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero h1', {y:40, duration:1.1, ease:'power3.out'});
    gsap.from('.hero .meta div', {y:18, duration:.8, stagger:.08, delay:.2, ease:'power2.out'});
    gsap.fromTo('#laptop', {rotateX:22, scale:.94}, {rotateX:0, scale:1, ease:'none', scrollTrigger:{trigger:'.stage', start:'top 85%', end:'center 40%', scrub:true}});
    gsap.fromTo('#wireFill', {scaleX:0}, {scaleX:1, ease:'none', scrollTrigger:{trigger:'#processRow', start:'top 80%', end:'bottom 55%', scrub:true}});
    gsap.utils.toArray('.sec-head h2, .statement').forEach(function(el){ gsap.from(el, {y:36, duration:1, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 88%'}}); });
    gsap.utils.toArray('.bento .tile, .step, .ps-card, .chart, .qual .card, .persona, .sw, .cluster, .hmw > div, .ia-col, .learn .card, .out-grid .tile').forEach(function(el, i){
      gsap.from(el, {y:42, duration:.9, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 92%'}}); });
    gsap.utils.toArray('.track i').forEach(function(el){ gsap.from(el, {scaleX:0, duration:1.1, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 92%'}}); });
    gsap.utils.toArray('.cols i').forEach(function(el, i){ gsap.from(el, {scaleY:0, duration:1, delay:i%4*0.08, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 95%'}}); });
    gsap.utils.toArray('.donut').forEach(function(el){ gsap.from(el, {rotate:-120, scale:.8, duration:1.2, ease:'power3.out', scrollTrigger:{trigger:el, start:'top 90%'}}); });
    gsap.from('.thanks h2', {y:60, duration:1.2, ease:'power3.out', scrollTrigger:{trigger:'.thanks', start:'top 80%'}});
    /* tilt on hover for the browser mockup */
    var br = document.querySelector('.browser');
    br.addEventListener('pointermove', function(e){ var r = br.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; gsap.to(br,{rotateY:x*6, rotateX:-y*6, transformPerspective:1400, duration:.5}); });
    br.addEventListener('pointerleave', function(){ gsap.to(br,{rotateY:0, rotateX:0, duration:.6}); });
  }
})();
