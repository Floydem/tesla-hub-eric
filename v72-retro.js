/* AERION V7.2: visual re-layout only. Preserve the genuine, working
   speed/weather/calendar sources, existing shortcut handlers and app name. */
(()=>{
'use strict';
const doc=document,dashboard=doc.getElementById('v6Dashboard'),root=doc.getElementById('immersiveCockpit');
if(!dashboard||dashboard.classList.contains('v72Retro')||!root)return;
dashboard.classList.add('v72Retro');
root.classList.add('v72Retro');
const banner=dashboard.querySelector('.v6Banner');
const weather=banner?.querySelector('.v6BannerWeather');
const right=banner?.querySelector('.v6BannerRight');
if(weather&&right)right.insertBefore(weather,right.firstChild);
const legacy=dashboard.querySelector('.v6Intro');
if(legacy){
  // Keep all legacy IDs and event handlers alive but display no repeated data.
  legacy.classList.add('v72LegacyIntro');
  const extras=doc.createElement('section');
  extras.className='v72DashboardExtras';
  extras.setAttribute('aria-label','Prévisions, événements météo et raccourcis');
  extras.innerHTML=
   '<article class="v72Panel v72HourlyPanel"><header><span class="v72PanelGlyph" aria-hidden="true">◷</span><strong>Prévisions heure par heure</strong><small>6 prochaines heures</small></header><div class="v72HourlyItems" id="v72Hours" aria-live="polite">Localisation et prévisions en attente…</div><small class="v72Source">Prévisions indicatives Open-Meteo.</small></article>'+
   '<article class="v72Panel v72WatchPanel"><header><span class="v72PanelGlyph" aria-hidden="true">✦</span><strong>Météo à surveiller</strong></header><strong class="v72WatchTitle" id="v72WatchTitle">Analyse météo en attente</strong><span class="v72WatchText" id="v72WatchText">Les événements prévus pour les 24 prochaines heures s’afficheront ici.</span><small class="v72Source">Prévisions indicatives, pas une vigilance officielle.</small></article>'+
   '<article class="v72Panel v72LinksPanel"><header><span class="v72PanelGlyph" aria-hidden="true">↗</span><strong>Accès rapides</strong></header><div class="v72QuickButtons">'+
   '<a href="https://www.waze.com/live-map" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir Waze dans un nouvel onglet">Waze ↗</a>'+
   '<a href="https://web.telegram.org/" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir Telegram Web dans un nouvel onglet">Telegram ↗</a>'+
   '<button type="button" id="v72Games">Jeux et loisirs ↗</button>'+
   '</div><small class="v72Source">Consulter les services et jouer uniquement à l’arrêt.</small></article>';
  legacy.insertAdjacentElement('afterend',extras);
  const games=doc.getElementById('v72Games');
  if(games)games.addEventListener('click',()=>{const target=doc.querySelector('.sidebar [data-go="arcade"]');if(target)target.click();else doc.getElementById('arcade')?.scrollIntoView({behavior:'smooth'});});
}
const h=doc.getElementById('v72Hours'),title=doc.getElementById('v72WatchTitle'),desc=doc.getElementById('v72WatchText');
const wx={0:['Dégagé','☀'],1:['Éclaircies','🌤'],2:['Nuageux','⛅'],3:['Couvert','☁'],45:['Brouillard','🌫'],48:['Brouillard givrant','🌫'],51:['Bruine','🌦'],53:['Bruine','🌦'],55:['Bruine forte','🌧'],56:['Pluie verglaçante','🧊'],57:['Pluie verglaçante','🧊'],61:['Pluie faible','🌦'],63:['Pluie','🌧'],65:['Pluie forte','🌧'],66:['Pluie verglaçante','🧊'],67:['Pluie verglaçante','🧊'],71:['Neige','🌨'],73:['Neige','❄'],75:['Neige forte','❄'],77:['Neige','❄'],80:['Averses','🌦'],81:['Averses','🌧'],82:['Fortes averses','🌧'],85:['Neige','🌨'],86:['Neige forte','❄'],95:['Orage','⛈'],96:['Orage et grêle','⛈'],99:['Orage et grêle','⛈']};
const pick=(o,k,i)=>Number(o?.[k]?.[i]??0);
function pos(){
 try{const p=JSON.parse(localStorage.getItem('ericTeslaHubV44')||'{}').pos;const lat=Number(p?.lat),lon=Number(p?.lon);return p&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;}catch(e){return null;}
}
function eventAt(h,i){
 const code=pick(h,'weather_code',i),temp=pick(h,'temperature_2m',i),snow=pick(h,'snowfall',i),rain=pick(h,'rain',i)+pick(h,'showers',i),gust=pick(h,'wind_gusts_10m',i);
 if([56,57,66,67].includes(code))return [0,'Pluie verglaçante prévue'];
 if([96,99].includes(code))return [0,'Orage et grêle prévus'];
 if(snow>=.1||[71,73,75,77,85,86].includes(code))return [1,'Neige prévue'];
 if(code===95)return [1,'Orage prévu'];
 if((rain>=.2||[61,63,65,80,81,82].includes(code))&&temp<=.5)return [1,'Risque de chaussée glissante (à confirmer)'];
 if(rain>=3||[65,82].includes(code))return [2,'Fortes pluies prévues'];
 if(gust>=80)return [2,'Fortes rafales prévues, jusqu’à '+Math.round(gust)+' km/h'];
 if(rain>=.2||[51,53,55,61,63,80,81].includes(code))return [3,'Pluie prévue'];
 return null;
}
let lastKey='',lastAt=0,pending=false;
function render(data){
 if(!data?.hourly?.time||!Array.isArray(data.hourly.time))throw Error('Prévisions incomplètes');
 const wxh=data.hourly,now=Date.now();
 let first=wxh.time.findIndex(t=>new Date(t).getTime()>=now-45*60000);
 if(first<0)first=0;
 h.replaceChildren();
 for(let i=first;i<Math.min(first+6,wxh.time.length);i++){
   const code=pick(wxh,'weather_code',i),w=wx[code]||['Conditions locales','☁'];
   const item=doc.createElement('div');item.className='v72Hour';item.setAttribute('aria-label',wxh.time[i].slice(11,16)+' : '+w[0]);
   const hour=doc.createElement('b');hour.textContent=wxh.time[i].slice(11,16);
   const icon=doc.createElement('span');icon.textContent=w[1];icon.setAttribute('aria-hidden','true');
   const temp=doc.createElement('strong');temp.textContent=Math.round(pick(wxh,'temperature_2m',i))+'°';
   const rain=doc.createElement('small');rain.textContent='☂ '+Math.round(pick(wxh,'precipitation_probability',i))+' %';
   item.append(hour,icon,temp,rain);h.appendChild(item);
 }
 if(!h.children.length)h.textContent='Prévisions horaires indisponibles';
 const hazards=[];
 for(let i=first;i<wxh.time.length;i++){
   const at=new Date(wxh.time[i]).getTime();if(at>now+24*3600000)break;
   const signal=eventAt(wxh,i);if(signal)hazards.push({priority:signal[0],name:signal[1],time:wxh.time[i].slice(11,16),at});
 }
 hazards.sort((a,b)=>a.priority-b.priority||a.at-b.at);
 if(hazards.length){
   const e=hazards[0];title.textContent=e.name;
   desc.textContent=(e.at<=now+45*60000?'Conditions possibles actuellement':'Événement prévu vers '+e.time)+'. Consulte les bulletins météorologiques officiels avant de prendre la route.';
 }else{
   title.textContent='Aucun événement notable détecté';
   desc.textContent='Pas de pluie forte, neige, grêle ou rafale importante prévue dans les 24 prochaines heures, selon les données disponibles.';
 }
}
async function request(p){
 if(!p||pending)return;
 const key=p.lat.toFixed(2)+','+p.lon.toFixed(2);
 if(key===lastKey&&Date.now()-lastAt<15*60000)return;
 pending=true;lastKey=key;
 try{
   const url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(p.lat)+'&longitude='+encodeURIComponent(p.lon)+'&hourly=temperature_2m,precipitation_probability,weather_code,rain,showers,snowfall,wind_gusts_10m&forecast_days=2&timezone=auto';
   const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Prévisions indisponibles');
   render(await response.json());lastAt=Date.now();
 }catch(e){if(!lastAt){h.textContent='Prévisions horaires indisponibles';title.textContent='Informations météo indisponibles';desc.textContent='Réessaie lorsque la localisation et la connexion sont disponibles.';}lastKey='';}
 finally{pending=false;}
}
function refresh(){
 if(doc.hidden)return;
 const saved=pos();
 if(saved)request(saved);
 else if(navigator.geolocation)navigator.geolocation.getCurrentPosition(p=>request({lat:p.coords.latitude,lon:p.coords.longitude}),()=>{if(!lastAt){h.textContent='Autorise la localisation pour les prévisions';title.textContent='Localisation nécessaire';desc.textContent='Active le GPS dans ton navigateur pour consulter la météo locale.';}},{maximumAge:300000,timeout:5500,enableHighAccuracy:false});
}
refresh();
setTimeout(refresh,6500);
setInterval(refresh,15*60*1000);
doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)refresh();});
const footer=doc.querySelector('.footer span');if(footer)footer.textContent='AERION • V7.2';
})();