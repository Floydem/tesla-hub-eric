/* AERION V7.0: instrument-cluster presentation, using existing real GPS,
   local calendar and Open-Meteo values. No invented navigation or vehicle data. */
(()=>{
  'use strict';
  const root=document.getElementById('immersiveCockpit');
  const stage=root?.querySelector('#v52Stage');
  const weather=stage?.querySelector('.v65Weather');
  const journey=stage?.querySelector('.v52Journey');
  const today=stage?.querySelector('.v52Today');
  const agenda=stage?.querySelector('.v52Agenda');
  const speed=root?.querySelector('#cockpitSpeed');
  if(!root||!stage||!weather||!today||!agenda||!speed||root.classList.contains('v69Ready'))return;
  root.classList.add('v69Ready');
  [weather,today,agenda].filter(Boolean).forEach((item)=>{
    item.classList.add('v69Gauge');
    if(item===weather)item.dataset.gauge='weather';
    if(item===journey)item.dataset.gauge='journey';
    if(item===today)item.dataset.gauge='today';
    if(item===agenda)item.dataset.gauge='agenda';
  });
  const brand=root.querySelector('.cockpitBrand');
  if(brand){
    const title=brand.querySelector('strong');
    const note=brand.querySelector('small');
    if(title)title.textContent='AERION';
    if(note)note.textContent='Cockpit Digital · données GPS indicatives';
  }
  root.classList.add('v70Aerion');
  // Keep original data sources unchanged; remove broken journey readout.
  if(journey)journey.hidden=true;
  const ambient=document.createElement('div');
  ambient.className='v70Ambient';
  ambient.setAttribute('aria-hidden','true');
  ambient.innerHTML='<span class="v70Wave v70WaveA"></span><span class="v70Wave v70WaveB"></span><span class="v70Wave v70WaveC"></span>';
  root.prepend(ambient);
  const risk=document.createElement('section');
  risk.className='v52Card v70RiskCard';
  risk.setAttribute('aria-label','Évolution météorologique locale');
  risk.innerHTML='<header><span class="v70RiskSymbol" aria-hidden="true">✧</span><span class="v70RiskHeading">À surveiller</span></header><strong id="v70RiskTitle">Prévisions en attente</strong><span id="v70RiskText">Les informations météo seront affichées ici.</span>';
  stage.appendChild(risk);
  function updateRisk(){
    const t=weather.querySelector('#v65AlertTitle')?.textContent?.trim();
    const b=weather.querySelector('#v65AlertText')?.textContent?.trim();
    risk.querySelector('#v70RiskTitle').textContent=t||'Prévisions en attente';
    risk.querySelector('#v70RiskText').textContent=b||'Les informations météo seront affichées ici.';
  }
  const riskSource=weather.querySelector('#v65WeatherAlert');
  if(riskSource)new MutationObserver(updateRisk).observe(riskSource,{attributes:true,childList:true,subtree:true,characterData:true});
  updateRisk();
  const dial=root.querySelector('.cockpitDial');
  if(dial){
    dial.classList.add('v69SpeedDial');
    dial.setAttribute('aria-label','Vitesse GPS indicative. Ne remplace pas le compteur du véhicule.');
  }
  const foot=document.createElement('aside');
  foot.className='v69ForecastBar';
  foot.setAttribute('aria-label','Évolution météo locale et prévisions heure par heure');
  const summary=document.createElement('span');
  summary.className='v69ForecastSummary';
  summary.textContent='Prévisions météo en attente…';
  const hourly=document.createElement('div');
  hourly.className='v69ForecastHours';
  hourly.setAttribute('role','list');
  hourly.setAttribute('aria-label','Prévisions des douze prochaines heures');
  foot.append(summary,hourly);
  root.appendChild(foot);
  const originalHours=weather.querySelector('#v65Hours');
  const alertTitle=weather.querySelector('#v65AlertTitle');
  const alertBody=weather.querySelector('#v65AlertText');
  const getText=n=>n?.textContent?.trim()||'';
  let lastSummary='',lastHours='';
  function renderForecast(){
    const title=getText(alertTitle),body=getText(alertBody);
    const update=[title,body].filter(Boolean).join(' · ')||'Prévisions météo en attente…';
    if(update!==lastSummary){summary.textContent=update;lastSummary=update;}
    const rows=[...originalHours?.querySelectorAll('.v65Hour')||[]].slice(0,12);
    const signature=rows.map(e=>getText(e)).join('|');
    if(signature===lastHours)return;
    lastHours=signature;hourly.replaceChildren();
    if(!rows.length){
      const wait=document.createElement('span');wait.className='v69ForecastPending';
      wait.textContent='Prévisions horaires en attente';hourly.appendChild(wait);return;
    }
    for(const item of rows){
      const chunk=document.createElement('span');chunk.className='v69ForecastHour';chunk.setAttribute('role','listitem');
      const hour=getText(item.querySelector('strong'));
      const temp=getText(item.querySelector('b'));
      const icon=getText(item.querySelector('.v65HourIcon'));
      const rain=getText(item.querySelector('small'));
      chunk.textContent=[hour,icon,temp,rain].filter(Boolean).join('  ');
      hourly.appendChild(chunk);
    }
  }
  const observers=[];
  if(originalHours){
    const obs=new MutationObserver(renderForecast);
    obs.observe(originalHours,{childList:true,subtree:true,characterData:true});observers.push(obs);
  }
  if(alertTitle&&alertBody){
    const obs=new MutationObserver(renderForecast);
    obs.observe(weather.querySelector('#v65WeatherAlert'),{childList:true,subtree:true,characterData:true});
    observers.push(obs);
  }
  function updateSpeed(){
    const value=Number(getText(speed));
    const valid=getText(speed)!=='--'&&Number.isFinite(value)&&value>=0;
    root.dataset.v69Gps=valid?'ready':'waiting';
    if(dial)dial.style.setProperty('--v69-speed',valid?String(Math.min(100,value/220*100))+'%':'0%');
  }
  const speedObserver=new MutationObserver(updateSpeed);
  speedObserver.observe(speed,{childList:true,subtree:true,characterData:true});
  renderForecast();updateSpeed();
  // Leave original v52/v65 widgets in place: their update loops and calendar
  // button work without modification, even after the rectangular styling goes.
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden){renderForecast();updateSpeed();}
  });
})();
