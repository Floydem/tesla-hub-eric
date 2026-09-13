(()=>{
'use strict';

const byId=id=>document.getElementById(id);
const WX45={
  0:['Ciel dégagé','sun'],1:['Éclaircies','part'],2:['Partiellement nuageux','part'],3:['Couvert','cloud'],
  45:['Brouillard','fog'],48:['Brouillard givrant','fog'],
  51:['Bruine','rain'],53:['Bruine','rain'],55:['Bruine forte','rain'],
  56:['Bruine verglaçante','ice'],57:['Bruine verglaçante','ice'],
  61:['Pluie faible','rain'],63:['Pluie','rain'],65:['Pluie forte','rain'],
  66:['Pluie verglaçante','ice'],67:['Pluie verglaçante','ice'],
  71:['Neige faible','snow'],73:['Neige','snow'],75:['Neige forte','snow'],77:['Grains de neige','snow'],
  80:['Averses','rain'],81:['Averses','rain'],82:['Fortes averses','rain'],
  85:['Averses de neige','snow'],86:['Fortes averses de neige','snow'],
  95:['Orage','storm'],96:['Orage avec grêle','hail'],99:['Orage violent avec grêle','hail']
};

function svg(kind){
  const map={
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    part:'<path d="M7 16a4 4 0 0 1 .8-7.9A5 5 0 0 1 17.5 10 3.5 3.5 0 0 1 18 17H7z"/><path d="M11 3v3M5.5 5.5 7.5 7.5"/>',
    cloud:'<path d="M6 17a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 11a3.5 3.5 0 0 1-.2 7H6z"/>',
    fog:'<path d="M4 8h16M3 12h18M5 16h14M7 20h10"/>',
    rain:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 8a3.5 3.5 0 0 1-.2 7H6z"/><path d="m8 18-1 3m5-3-1 3m5-3-1 3"/>',
    snow:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 8a3.5 3.5 0 0 1-.2 7H6z"/><path d="M8 18h2M9 17v2M14 18h2M15 17v2"/>',
    ice:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 8a3.5 3.5 0 0 1-.2 7H6z"/><path d="M8 18h8M10 16l4 4M14 16l-4 4"/>',
    storm:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 8a3.5 3.5 0 0 1-.2 7H6z"/><path d="m12 16-2 4h2l-1 2 4-5h-2l1-3z"/>',
    hail:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 8a3.5 3.5 0 0 1-.2 7H6z"/><path d="m12 16-2 4h2l-1 2 4-5h-2l1-3z"/><circle cx="7" cy="19" r="1"/><circle cx="17" cy="19" r="1"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${map[kind]||map.cloud}</svg>`;
}

function ensureUi(){
  const clockPanel=document.querySelector('.clockPanel');
  if(clockPanel && !byId('clockWeatherWidget')){
    const el=document.createElement('div');
    el.id='clockWeatherWidget';
    el.className='clockWeatherWidget';
    el.innerHTML='<div class="cwIcon" id="cwIcon"></div><div><div class="cwTop"><span class="cwTemp" id="cwTemp">--°</span><span class="cwCond" id="cwCond">Météo</span></div><div class="cwSub" id="cwSub">Prévision locale</div></div>';
    clockPanel.appendChild(el);
  }
  const weatherCard=document.querySelector('.weatherCard');
  if(weatherCard && !byId('weatherTimeline')){
    const timeline=document.createElement('div');
    timeline.id='weatherTimeline';
    timeline.className='weatherTimeline';
    timeline.innerHTML='<div class="wtLabel">Prochaine évolution</div><strong id="weatherEvent">Analyse des prochaines heures...</strong><div class="wtSub" id="weatherEventSub"></div>';
    const hourly=byId('hourly');
    if(hourly) hourly.insertAdjacentElement('afterend',timeline);
    else weatherCard.appendChild(timeline);

    const hint=document.createElement('div');
    hint.id='weatherHourlyHint';
    hint.textContent='Prévisions horaires calculées depuis l’heure actuelle de la voiture.';
    timeline.insertAdjacentElement('afterend',hint);
  }
  const footer=document.querySelector('.footer span');
  if(footer) footer.innerHTML='Eric Tesla Hub • <span class="v45mark">V4.5.1</span>';
}

function typeFor(code,rain,snow,pp){
  if([56,57,66,67].includes(code)) return 'Verglas';
  if([96,99].includes(code)) return 'Orage / grêle';
  if(code===95) return 'Orage';
  if((snow||0)>0.05 || [71,73,75,77,85,86].includes(code)) return 'Neige';
  if((rain||0)>0.05 || [51,53,55,61,63,65,80,81,82].includes(code)) return 'Pluie';
  if((pp||0)>=45) return 'Précipitations';
  return '';
}

function inText(ms){
  if(ms<=0) return 'maintenant';
  const min=Math.round(ms/60000);
  if(min<60) return `dans ${min} min`;
  const h=Math.floor(min/60), m=min%60;
  return m?`dans ${h} h ${m} min`:`dans ${h} h`;
}

function formatTime(iso){
  const d=new Date(iso);
  return d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
}

function nextEvent(d,ix){
  const end=Math.min(ix+18,d.hourly.time.length);
  for(let i=ix;i<end;i++){
    const code=d.hourly.weather_code[i];
    const rain=Number(d.hourly.rain?.[i]||0);
    const snow=Number(d.hourly.snowfall?.[i]||0);
    const pp=Number(d.hourly.precipitation_probability?.[i]||0);
    const typ=typeFor(code,rain,snow,pp);
    if(typ){
      const t=new Date(d.hourly.time[i]).getTime();
      return {i,typ,t,pp,rain,snow,code};
    }
  }
  return null;
}

function renderDetailed(d){
  ensureUi();
  const c=d.current;
  const info=WX45[c.weather_code]||['Conditions','cloud'];
  const mn=Math.round(d.daily.temperature_2m_min[0]);
  const mx=Math.round(d.daily.temperature_2m_max[0]);
  byId('cwIcon').innerHTML=svg(info[1]);
  byId('cwTemp').textContent=Math.round(c.temperature_2m)+'°';
  byId('cwCond').textContent=info[0];
  byId('cwSub').textContent=`Aujourd’hui ${mn}° / ${mx}°`;

  const now=new Date();
  let ix=d.hourly.time.findIndex(t=>new Date(t)>=now);
  if(ix<0) ix=0;

  const hourly=byId('hourly');
  if(hourly){
    hourly.innerHTML='';
    for(let i=ix;i<Math.min(ix+8,d.hourly.time.length);i++){
      const code=d.hourly.weather_code[i];
      const inf=WX45[code]||['Conditions','cloud'];
      const pp=Number(d.hourly.precipitation_probability[i]||0);
      const rain=Number(d.hourly.rain?.[i]||0);
      const snow=Number(d.hourly.snowfall?.[i]||0);
      const typ=typeFor(code,rain,snow,pp) || inf[0];
      hourly.insertAdjacentHTML('beforeend',
        `<div class="hour richHour"><div class="rhTime">${formatTime(d.hourly.time[i])}</div><div class="rhIcon">${svg(inf[1])}</div><div class="rhTemp">${Math.round(d.hourly.temperature_2m[i])}°</div><div class="rhRain">${pp}%</div><div class="rhType">${typ}</div></div>`
      );
    }
  }

  const ev=nextEvent(d,ix);
  const eventEl=byId('weatherEvent'), sub=byId('weatherEventSub');
  if(ev){
    const when=formatTime(d.hourly.time[ev.i]);
    eventEl.textContent=`${ev.typ} ${inText(ev.t-Date.now())} • vers ${when}`;
    const details=[];
    if(ev.pp) details.push(`probabilité ${ev.pp}%`);
    if(ev.rain>0) details.push(`${ev.rain.toFixed(1)} mm de pluie`);
    if(ev.snow>0) details.push(`${ev.snow.toFixed(1)} cm de neige`);
    sub.textContent=details.join(' • ') || 'Évolution détectée dans les prochaines heures.';
  }else{
    eventEl.textContent='Pas de précipitations significatives détectées dans les 18 prochaines heures.';
    sub.textContent='La prévision se met à jour automatiquement.';
  }
}

async function fetchDetailed(lat,lon){
  try{
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`+
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m`+
      `&hourly=temperature_2m,precipitation_probability,precipitation,rain,snowfall,weather_code,wind_speed_10m,wind_gusts_10m`+
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,rain_sum,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max`+
      `&forecast_days=2&timezone=auto`;
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok) throw new Error('weather');
    const d=await r.json();
    renderDetailed(d);
  }catch(e){
    ensureUi();
    if(byId('weatherEvent')) byId('weatherEvent').textContent='Prévision horaire indisponible.';
  }
}

function getSavedPos(){
  try{
    const s=JSON.parse(localStorage.getItem('ericTeslaHubV44')||'{}');
    return s.pos||null;
  }catch(e){ return null; }
}

function refresh(){
  const saved=getSavedPos();
  if(saved) fetchDetailed(saved.lat,saved.lon);
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      p=>fetchDetailed(p.coords.latitude,p.coords.longitude),
      ()=>{},
      {enableHighAccuracy:false,maximumAge:600000,timeout:7000}
    );
  }
}

ensureUi();
setTimeout(ensureUi,500);
setTimeout(refresh,900);
setInterval(refresh,10*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) setTimeout(refresh,300);});

// V4.5.1: météo recalée automatiquement après ~3 km de déplacement.
let movementAnchor=getSavedPos(), lastMovementRefresh=0;
function distanceKm(a,b,c,d){
  const R=6371, rad=x=>x*Math.PI/180;
  const p=rad(c-a), q=rad(d-b);
  const h=Math.sin(p/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(q/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}
function saveBasePosition(lat,lon){
  try{
    const key='ericTeslaHubV44', s=JSON.parse(localStorage.getItem(key)||'{}');
    s.pos={lat,lon}; localStorage.setItem(key,JSON.stringify(s));
  }catch(e){}
}
function movedPosition(p){
  const lat=p.coords.latitude, lon=p.coords.longitude, now=Date.now();
  if(!movementAnchor){movementAnchor={lat,lon};return;}
  const moved=distanceKm(movementAnchor.lat,movementAnchor.lon,lat,lon);
  if(moved>=3 && now-lastMovementRefresh>90000){
    movementAnchor={lat,lon}; lastMovementRefresh=now;
    saveBasePosition(lat,lon);
    const b=byId('refreshWeather'); if(b) b.click();
    fetchDetailed(lat,lon);
  }
}
if(navigator.geolocation){
  navigator.geolocation.watchPosition(movedPosition,()=>{},
    {enableHighAccuracy:true,maximumAge:10000,timeout:15000});
}

// Barre cockpit flottante légèrement agrandie pour l'écran Tesla.
const bigBar=document.createElement('style');
bigBar.id='v451FloatingBar';
bigBar.textContent=`
.floatingCockpit{padding:15px 22px!important;gap:26px!important;border-radius:22px!important;top:14px!important}
.floatingCockpit>div{min-width:116px!important}
.floatingCockpit strong{font-size:31px!important}
.floatingCockpit .fcLabel{font-size:11px!important;margin-bottom:4px!important}
.floatingCockpit small{font-size:13px!important}
@media(max-width:1200px){.floatingCockpit{gap:20px!important;padding:14px 20px!important}.floatingCockpit strong{font-size:28px!important}}
@media(max-width:820px){.floatingCockpit{left:10px!important;right:10px!important;gap:14px!important;padding:13px 16px!important}.floatingCockpit>div{min-width:auto!important}.floatingCockpit strong{font-size:24px!important}}
`;
document.head.appendChild(bigBar);

})();
