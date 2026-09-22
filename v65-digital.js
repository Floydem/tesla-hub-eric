/* V6.5: one useful Digital weather dashboard, hourly local forecasts and
   upcoming conditions derived from Open-Meteo (not official vigilance alerts). */
(() => {
  'use strict';
  const root=document.getElementById('immersiveCockpit');
  const stage=root?.querySelector('#v52Stage');
  if(!root||!stage||stage.querySelector('.v65Weather'))return;
  const card=document.createElement('section');
  card.className='v52Card v65Weather';
  card.setAttribute('aria-label','Météo actuelle, prévisions heure par heure et événements à venir');
  card.innerHTML=
    '<header class="v65WeatherHead"><span>☁</span><strong>Météo locale</strong><small id="v65WeatherStatus">Prévisions en attente</small></header>'+
    '<div class="v65WeatherSummary"><span class="v65WeatherIcon" id="v65WeatherIcon">☁</span>'+
      '<strong class="v65WeatherTemp" id="v65WeatherTemp">--°</strong>'+
      '<span class="v65WeatherCondition" id="v65WeatherCondition">Météo en attente</span>'+
      '<span class="v65WeatherMinMax">Min <b id="v65WeatherMin">--°</b> · Max <b id="v65WeatherMax">--°</b></span></div>'+
    '<div class="v65HourlyLabel">Heure par heure <small>12 prochaines heures · défiler →</small></div>'+
    '<div class="v65Hours" id="v65Hours" role="list" aria-label="Prévisions horaires"><span class="v65Loading">Chargement des prévisions…</span></div>'+
    '<div class="v65WeatherAlert is-pending" id="v65WeatherAlert" role="status" aria-live="polite">'+
      '<strong id="v65AlertTitle">Évolution météo</strong><span id="v65AlertText">Analyse des 24 prochaines heures…</span></div>'+
    '<small class="v65WeatherFoot">Prévisions indicatives Open-Meteo · ne remplace pas les alertes officielles.</small>';
  stage.appendChild(card);

  const el=id=>card.querySelector('#'+id);
  const put=(id,text)=>{const n=el(id);if(n&&n.textContent!==text)n.textContent=text;};
  const weather={
    0:['Dégagé','☀️'],1:['Éclaircies','🌤️'],2:['Partiellement nuageux','⛅'],
    3:['Couvert','☁️'],45:['Brouillard','🌫️'],48:['Brouillard givrant','🌫️'],
    51:['Bruine','🌦️'],53:['Bruine','🌦️'],55:['Bruine forte','🌧️'],
    56:['Pluie verglaçante','🧊'],57:['Pluie verglaçante','🧊'],
    61:['Pluie faible','🌦️'],63:['Pluie','🌧️'],65:['Pluie forte','🌧️'],
    66:['Pluie verglaçante','🧊'],67:['Pluie verglaçante','🧊'],
    71:['Neige faible','🌨️'],73:['Neige','❄️'],75:['Neige forte','❄️'],77:['Neige','❄️'],
    80:['Averses','🌦️'],81:['Averses','🌧️'],82:['Fortes averses','🌧️'],
    85:['Averses de neige','🌨️'],86:['Fortes averses de neige','❄️'],
    95:['Orage','⛈️'],96:['Orage et grêle','⛈️'],99:['Orage et grêle','⛈️']
  };
  const fmt=n=>Number.isFinite(+n)?Math.round(+n)+'°':'--°';
  const getPos=()=>{
    try{
      const p=JSON.parse(localStorage.getItem('ericTeslaHubV44')||'{}').pos;
      const lat=Number(p?.lat),lon=Number(p?.lon);
      return p&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;
    }catch(e){return null;}
  };
  const stamp=s=>new Date(s).getTime();
  const time=s=>String(s||'').slice(11,16);
  const chance=(h,i)=>Number(h.precipitation_probability?.[i]??0);
  const val=(h,k,i)=>Number(h[k]?.[i]??0);
  const hasCode=(arr,c)=>arr.includes(c);
  function hazard(h,i){
    const c=val(h,'weather_code',i),rain=val(h,'rain',i)+val(h,'showers',i);
    const snow=val(h,'snowfall',i),temp=val(h,'temperature_2m',i),prob=chance(h,i);
    const gust=val(h,'wind_gusts_10m',i);
    if(hasCode([56,57,66,67],c))return {priority:0,title:'Prudence · pluie verglaçante',event:'Pluie verglaçante'};
    if(hasCode([96,99],c))return {priority:0,title:'Prudence · orage et grêle',event:'Orage et grêle'};
    if(snow>=0.1||hasCode([71,73,75,77,85,86],c))return {priority:1,title:'Prudence · neige prévue',event:'Neige'};
    if(hasCode([95],c))return {priority:1,title:'Attention · orage prévu',event:'Orage'};
    if((rain>=0.2||hasCode([51,53,55,61,63,65,80,81,82],c))&&temp<=0.5)
      return {priority:1,title:'Prudence · chaussée possiblement glissante',event:'Précipitations près de 0°C (verglas possible, non confirmé)'};
    if(rain>=3||hasCode([65,82],c))return {priority:2,title:'Attention · fortes pluies prévues',event:'Fortes pluies'};
    if(gust>=80)return {priority:2,title:'Prudence · fortes rafales prévues',event:'Rafales autour de '+Math.round(gust)+' km/h'};
    if((rain>=0.2&&prob>=35)||hasCode([51,53,55,61,63,80,81],c))
      return {priority:3,title:'Pluie prévue',event:'Pluie'+(prob>=20?' · probabilité '+Math.round(prob)+' %':'')};
    return null;
  }
  function render(data){
    if(!data?.current||!data?.daily||!Array.isArray(data?.hourly?.time))throw Error('Météo incomplète');
    const current=data.current,daily=data.daily,h=data.hourly;
    const w=weather[current.weather_code]||['Conditions locales','☁️'];
    put('v65WeatherIcon',w[1]);put('v65WeatherTemp',fmt(current.temperature_2m));
    put('v65WeatherCondition',w[0]);put('v65WeatherMin',fmt(daily.temperature_2m_min?.[0]));
    put('v65WeatherMax',fmt(daily.temperature_2m_max?.[0]));
    const now=Date.now(),duration=24*3600000;
    let first=h.time.findIndex(t=>stamp(t)>=now-35*60000);
    if(first<0)first=0;
    const hours=el('v65Hours');hours.replaceChildren();
    for(let i=first;i<Math.min(first+12,h.time.length);i++){
      const code=val(h,'weather_code',i),w=weather[code]||['Conditions','☁️'];
      const block=document.createElement('div');block.className='v65Hour';block.setAttribute('role','listitem');
      const hour=document.createElement('strong');hour.textContent=time(h.time[i]);
      const ico=document.createElement('span');ico.className='v65HourIcon';ico.textContent=w[1];ico.setAttribute('aria-label',w[0]);
      const temp=document.createElement('b');temp.textContent=fmt(h.temperature_2m?.[i]);
      const prob=document.createElement('small');prob.textContent='☂ '+Math.round(chance(h,i))+' %';
      block.append(hour,ico,temp,prob);hours.appendChild(block);
    }
    if(!hours.children.length){const n=document.createElement('span');n.textContent='Prévisions horaires indisponibles';hours.appendChild(n);}
    const events=[];
    for(let i=first;i<h.time.length;i++){
      const at=stamp(h.time[i]);if(!Number.isFinite(at)||at>now+duration)break;
      if(at<now-35*60000)continue;
      const event=hazard(h,i);
      if(event)events.push({...event,at,i});
    }
    events.sort((a,b)=>a.priority-b.priority||a.at-b.at);
    const box=el('v65WeatherAlert');
    box.className='v65WeatherAlert';
    if(events.length){
      const event=events[0],when=time(h.time[event.i]);
      const soon=event.at<=now+45*60000;
      box.classList.add(event.priority<=1?'is-serious':'is-event');
      put('v65AlertTitle',event.title);
      put('v65AlertText',event.event+(soon?' actuellement / imminente':' vers '+when)+
        (event.priority<=1?' · Prévision indicative, vérifie les bulletins officiels.':''));
    }else{
      box.classList.add('is-calm');
      put('v65AlertTitle','Pas d’événement météo notable détecté');
      put('v65AlertText','Sur les 24 prochaines heures, selon la prévision disponible.');
    }
    put('v65WeatherStatus','Actualisée '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}));
  }
  let last='',updated=0,busy=false,requestId=0;
  function showFailure(){
    if(!updated){
      put('v65WeatherCondition','Prévisions indisponibles');
      put('v65WeatherStatus','Météo indisponible');
      put('v65AlertTitle','Évolution météo non disponible');
      put('v65AlertText','Réessayer plus tard. Aucune vigilance officielle affichée.');
      el('v65WeatherAlert').className='v65WeatherAlert is-pending';
    }else put('v65WeatherStatus','Données météo à actualiser');
  }
  async function fetchAt(pos,force=false){
    if(!pos||busy||!root.classList.contains('isOpen')||root.dataset.cockpitStyle!=='J')return;
    const key=pos.lat.toFixed(2)+','+pos.lon.toFixed(2);
    if(!force&&key===last&&Date.now()-updated<10*60*1000)return;
    busy=true;const rid=++requestId;
    put('v65WeatherStatus','Actualisation…');
    const url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(pos.lat)+
      '&longitude='+encodeURIComponent(pos.lon)+
      '&current=temperature_2m,weather_code'+
      '&hourly=temperature_2m,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,wind_gusts_10m'+
      '&daily=temperature_2m_min,temperature_2m_max'+
      '&forecast_days=2&timezone=auto';
    try{
      const response=await fetch(url,{cache:'no-store'});
      if(!response.ok)throw Error('Erreur météo '+response.status);
      const data=await response.json();
      if(rid!==requestId)return;
      render(data);
      last=key;updated=Date.now();
    }catch(e){showFailure();}
    finally{busy=false;}
  }
  function refresh(force=false){
    if(!root.classList.contains('isOpen')||root.dataset.cockpitStyle!=='J')return;
    const saved=getPos();if(saved)fetchAt(saved,force);
    if((!saved||force||Date.now()-updated>10*60*1000)&&navigator.geolocation){
      navigator.geolocation.getCurrentPosition(p=>{
        const lat=p.coords.latitude,lon=p.coords.longitude;
        if(Number.isFinite(lat)&&Number.isFinite(lon))fetchAt({lat,lon},force);
      },()=>{if(!saved)showFailure();},{maximumAge:300000,timeout:6500,enableHighAccuracy:false});
    }else if(!saved)showFailure();
  }
  root.addEventListener('hub:cockpit-style',()=>refresh());
  new MutationObserver(()=>{if(root.classList.contains('isOpen'))refresh();}).observe(root,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
  setInterval(()=>refresh(),3*60*1000);
  refresh();
  const footer=document.querySelector('.footer span');
  if(footer)footer.textContent='Eric Tesla Hub • V6.5';
  const edition=document.querySelector('#v6Dashboard .v6Eyebrow');
  if(edition)edition.textContent='FLOYDEM · ÉDITION V6.5';
})();