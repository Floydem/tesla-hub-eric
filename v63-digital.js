/* V6.3 Digital cockpit only: one genuine daily weather forecast card.
   Does not modify the other nine cockpit styles or Hub tiles. */
(() => {
  'use strict';
  const root=document.getElementById('immersiveCockpit');
  const stage=root?.querySelector('#v52Stage');
  if(!root||!stage||stage.querySelector('.v63ForecastCard'))return;
  const card=document.createElement('section');
  card.className='v52Card v63ForecastCard';
  card.setAttribute('aria-label','Prévisions météo du jour');
  card.innerHTML='<header><span class="v52MiniIcon" aria-hidden="true">☁</span><span class="v52Eyebrow">Prévisions du jour</span></header>'+
    '<div class="v63DayLine"><span id="v63WeatherIcon" aria-hidden="true">☁</span><strong id="v63WeatherCond">Météo en attente</strong></div>'+
    '<div class="v63Temperatures"><span>Min <strong id="v63WeatherMin">--°</strong></span><span>Max <strong id="v63WeatherMax">--°</strong></span></div>'+
    '<div class="v63ForecastDetails"><span id="v63WeatherRain">Pluie : --</span><span id="v63WeatherWind">Vent : --</span></div>'+
    '<small class="v63ForecastSource" id="v63WeatherSource">Prévisions locales · Open-Meteo</small>';
  stage.appendChild(card);

  const el=id=>card.querySelector('#'+id);
  const labels={
    0:['Ciel dégagé','☀'],1:['Éclaircies','🌤'],2:['Partiellement nuageux','⛅'],3:['Couvert','☁'],
    45:['Brouillard','🌫'],48:['Brouillard givrant','🌫'],
    51:['Bruine','🌦'],53:['Bruine','🌦'],55:['Bruine forte','🌧'],
    56:['Verglas','🧊'],57:['Verglas','🧊'],61:['Pluie faible','🌦'],63:['Pluie','🌧'],
    65:['Pluie forte','🌧'],66:['Verglas','🧊'],67:['Verglas','🧊'],
    71:['Neige faible','🌨'],73:['Neige','❄'],75:['Neige forte','❄'],77:['Neige','❄'],
    80:['Averses','🌦'],81:['Averses','🌧'],82:['Fortes averses','🌧'],
    85:['Averses de neige','🌨'],86:['Neige forte','❄'],95:['Orages','⛈'],
    96:['Orages et grêle','⛈'],99:['Orages et grêle','⛈']
  };
  const parsePos=()=>{
    try{
      const p=JSON.parse(localStorage.getItem('ericTeslaHubV44')||'{}').pos;
      const lat=Number(p?.lat),lon=Number(p?.lon);
      return p&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon}:null;
    }catch(e){return null;}
  };
  const setText=(id,value)=>{el(id).textContent=value;};
  let lastKey='',lastFetch=0,loading=false;
  const describeError=message=>{setText('v63WeatherCond',message);setText('v63WeatherSource','Prévisions indisponibles pour le moment');};
  function refresh(force=false){
    if(!root.classList.contains('isOpen')||root.dataset.cockpitStyle!=='J'||loading)return;
    const p=parsePos();
    if(!p){
      describeError('Autorise la localisation');
      return;
    }
    const key=p.lat.toFixed(2)+','+p.lon.toFixed(2)+','+new Date().toLocaleDateString('en-CA');
    if(!force&&key===lastKey&&Date.now()-lastFetch<15*60*1000)return;
    loading=true;
    const url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(p.lat)+
      '&longitude='+encodeURIComponent(p.lon)+
      '&daily=weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,wind_speed_10m_max'+
      '&forecast_days=1&timezone=auto';
    fetch(url).then(response=>{
      if(!response.ok)throw Error('Météo indisponible');
      return response.json();
    }).then(data=>{
      const daily=data?.daily;
      const min=Number(daily?.temperature_2m_min?.[0]);
      const max=Number(daily?.temperature_2m_max?.[0]);
      if(!Number.isFinite(min)||!Number.isFinite(max))throw Error('Prévisions incomplètes');
      const code=Number(daily.weather_code?.[0]);
      const info=labels[code]||['Prévisions locales','☁'];
      setText('v63WeatherIcon',info[1]);
      setText('v63WeatherCond',info[0]);
      setText('v63WeatherMin',Math.round(min)+'°');
      setText('v63WeatherMax',Math.round(max)+'°');
      const rain=Number(daily.precipitation_probability_max?.[0]);
      const wind=Number(daily.wind_speed_10m_max?.[0]);
      setText('v63WeatherRain',Number.isFinite(rain)?'Pluie : '+Math.round(rain)+' %':'Pluie : indisponible');
      setText('v63WeatherWind',Number.isFinite(wind)?'Vent max : '+Math.round(wind)+' km/h':'Vent : indisponible');
      setText('v63WeatherSource','Prévisions du jour · Open-Meteo');
      lastKey=key;lastFetch=Date.now();
    }).catch(()=>{describeError('Prévisions indisponibles');lastFetch=Date.now();lastKey=key;}).finally(()=>{loading=false;});
  }
  root.addEventListener('hub:cockpit-style',()=>refresh());
  new MutationObserver(()=>{if(root.classList.contains('isOpen'))refresh();}).observe(root,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh(true);});
  setInterval(()=>refresh(),5*60*1000);
  const footer=document.querySelector('.footer span');if(footer)footer.textContent='Eric Tesla Hub • V6.4';
})();