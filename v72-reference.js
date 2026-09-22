/* AERION V7.2 · Adapt the approved concept to EXISTING live Hub/cockpit values. */
(()=>{
 'use strict';
 const hub=document.getElementById('v6Dashboard');
 const root=document.getElementById('immersiveCockpit');
 if(!hub||!root||!root.classList.contains('v69Ready')||root.classList.contains('v72Layout'))return;
 document.body.classList.add('a72Reference');
 hub.classList.add('a72ReferenceHub');
 root.classList.add('v72Layout');
 const value=document.getElementById('v6Speed');
 const ring=hub.querySelector('.v6BannerCenter>div');
 if(ring&&value){
   ring.setAttribute('aria-label','Vitesse GPS indicative, mesurée par le navigateur.');
   const update=()=>{
     const raw=value.textContent?.trim()||'';
     const v=Number(raw.replace(',','.'));
     const valid=raw!=='--'&&raw!==''&&Number.isFinite(v)&&v>=0;
     ring.style.setProperty('--a72-progress',valid?Math.min(100,v/220*100)+'%':'0%');
   };
   new MutationObserver(update).observe(value,{childList:true,subtree:true,characterData:true});
   update();
 }
 const forecast=root.querySelector('.v69ForecastBar');
 if(forecast&&!forecast.querySelector('.v72ForecastTitle')){
   const title=document.createElement('div');
   title.className='v72ForecastTitle';
   title.innerHTML='<span aria-hidden="true">✧</span> Prévisions heure par heure';
   forecast.insertBefore(title,forecast.firstChild);
 }
 const risk=root.querySelector('.v70RiskHeading');
 if(risk)risk.textContent='Évolution météo';
 const footer=document.querySelector('.footer span');
 if(footer)footer.textContent='AERION • V7.2';
})();