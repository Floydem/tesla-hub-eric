/* AERION V7.1: fit the circular gauges to the ACTUAL browser viewport.
   The vehicle's native chrome/dock cannot be hidden by a web page. */
(()=>{
  'use strict';
  const root=document.getElementById('immersiveCockpit');
  if(!root||!root.classList.contains('v69Ready')||root.classList.contains('v71Cluster'))return;
  root.classList.add('v71Cluster');
  const stage=root.querySelector('#v52Stage');
  const speed=root.querySelector('.cockpitMain');
  if(!stage||!speed)return;
  function fit(){
    if(!root.classList.contains('isOpen'))return;
    const box=root.getBoundingClientRect();
    const w=box.width,h=box.height;
    if(!w||!h)return;
    if(w<=h||w<600){root.style.removeProperty('--a71-big');return;}
    const header=root.querySelector('.cockpitTop');
    const head=header?.getBoundingClientRect().height||46;
    const safeTop=Math.max(72,head+18);
    const bottomBar=root.querySelector('.v69ForecastBar');
    const safeBottom=Math.max(66,(bottomBar?.getBoundingClientRect().height||42)+36);
    const center=.48*h;
    // Big dial at center. Side rings extend down about 0.485 big-dial
    // diameters; keep header, ticker and at least 10px breathing room.
    const topRoom=(center-safeTop-10)*2;
    const bottomRoom=(h-safeBottom-center-10)/.485;
    const diameter=Math.max(108,Math.floor(Math.min(330,w/3.08,h*.53,topRoom,bottomRoom)));
    const next=diameter+'px';
    if(root.style.getPropertyValue('--a71-big')!==next)root.style.setProperty('--a71-big',next);
  }
  if(typeof ResizeObserver==='function')new ResizeObserver(fit).observe(root);
  else window.addEventListener('resize',fit,{passive:true});
  new MutationObserver(fit).observe(root,{attributes:true,attributeFilter:['class']});
  root.addEventListener('hub:cockpit-style',fit);
  document.addEventListener('fullscreenchange',fit);
  fit();
})();