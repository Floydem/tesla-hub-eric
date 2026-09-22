/* V5.1: Unified cockpit engine + six styles. Legacy V4.9 single-view scripts are no longer loaded. */
(()=>{
'use strict';
// Separate cockpit: the existing home and floating display remain the defaults.
const byId=id=>document.getElementById(id);
const host=document.createElement('section');
host.id='immersiveCockpit';host.setAttribute('aria-label','Cockpit plein écran');
host.innerHTML=`
  <div id="cockpitFallback" aria-hidden="true"></div><div id="cockpitMap" aria-hidden="true"></div><div id="cockpitTint" aria-hidden="true"></div>
  <header class="cockpitTop"><div class="cockpitBrand"><strong>COCKPIT</strong><small>Vue immersive • GPS estimé</small></div>
    <div class="cockpitTopBtns"><button type="button" class="cockpitBtn" id="cockpitReset">↻ Réinitialiser trajet</button><button type="button" class="cockpitBtn" id="cockpitClose">✕ Retour au Hub</button></div>
  </header>
  <div class="cockpitMain">
    <div class="cockpitDial" aria-label="Compteur analogique et vitesse numérique">
      <svg id="cockpitGauge" viewBox="0 0 320 320" role="img" aria-label="Cadran de vitesse">
        <path id="cockpitTrack" class="dialTrack"></path><path id="cockpitProgress" class="dialProgress"></path><g id="cockpitTicks"></g>
        <line class="needle" id="cockpitNeedle" x1="160" y1="160" x2="160" y2="70"/><circle cx="160" cy="160" r="6" fill="#fd5960"/>
      </svg>
      <div class="cockpitCenter"><div class="cockpitCurrentLabel">Vitesse actuelle</div>
        <div class="cockpitCurrentNum" id="cockpitSpeed">--</div><div class="cockpitCurrentUnit">km/h</div></div>
    </div>
    <div class="cockpitInfo">
      <div class="cockpitInfoCard"><div class="infoLabel">Vitesse moyenne</div><div class="infoValue"><span id="cockpitAverage">--</span> <small>km/h</small></div><div class="infoSub">Depuis l'ouverture de cette vue, arrêts compris</div></div>
      <div class="cockpitInfoCard"><div class="infoLabel">Trajet en cours</div><div class="infoValue"><span id="cockpitDistance">0,0</span> <small>km</small></div><div class="infoSub" id="cockpitElapsed">00:00 écoulées</div></div>
      <div class="cockpitInfoCard"><div class="infoLabel">Heure</div><div class="infoValue" id="cockpitTime">--:--</div><div class="infoSub" id="cockpitDate">Carte centrée sur votre position GPS</div></div>
    </div>
  </div>
  <div class="cockpitFooter"><div class="cockpitStatus" id="cockpitStatus" aria-live="polite">En attente de la position GPS…</div>
    <div class="cockpitAttribution">Carte de localisation • pas de guidage d'itinéraire Tesla</div></div>
`;
document.body.appendChild(host);
const maxSpeed=220, cx=160,cy=160;
function point(a,r){const rad=a*Math.PI/180;return [cx+Math.cos(rad)*r,cy+Math.sin(rad)*r]}
function arc(fraction,r){const amount=Math.max(0,Math.min(1,fraction)),n=Math.max(1,Math.ceil(70*amount));let s='';for(let i=0;i<=n;i++){const a=140+260*amount*i/n,[x,y]=point(a,r);s+=(i?' L':'M')+x.toFixed(2)+' '+y.toFixed(2)}return s}
byId('cockpitTrack').setAttribute('d',arc(1,131));
const ticks=byId('cockpitTicks');
for(let i=0;i<=44;i++){
  const angle=140+i*260/44,major=i%4===0;
  const p1=point(angle,major?113:121),p2=point(angle,130);
  const line=document.createElementNS('http://www.w3.org/2000/svg','line');
  line.setAttribute('x1',p1[0]);line.setAttribute('y1',p1[1]);
  line.setAttribute('x2',p2[0]);line.setAttribute('y2',p2[1]);
  line.setAttribute('class',major?'dialTick major':'dialTick');ticks.appendChild(line);
  if(major){
    const [x,y]=point(angle,97),label=document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x',x);label.setAttribute('y',y);label.setAttribute('class','dialNumber');
    label.textContent=String(i*5);ticks.appendChild(label);
  }
}
const status=byId('cockpitStatus');
let opened=false,watchId=null,timer=null,map=null,marker=null,mapPromise=null,mapFailed=false;
let firstFix=0,lastFix=null,tripMeters=0,instant=null,lastMapAt=0,lastMapPos=null;
function updateGauge(kmh){
  if(kmh===null||!Number.isFinite(kmh)){byId('cockpitSpeed').textContent='--';byId('cockpitProgress').setAttribute('d',arc(0,131));const n=byId('cockpitNeedle');const pt=point(140,112);n.setAttribute('x2',pt[0]);n.setAttribute('y2',pt[1]);return}
  const v=Math.max(0,Math.round(kmh)),f=Math.min(v/maxSpeed,1);
  byId('cockpitSpeed').textContent=String(v);
  byId('cockpitProgress').setAttribute('d',arc(f,131));
  const [x,y]=point(140+260*f,112),needle=byId('cockpitNeedle');
  needle.setAttribute('x2',x);needle.setAttribute('y2',y);

}
function haversine(a,b){
  const r=Math.PI/180, dlat=(b.lat-a.lat)*r,dlon=(b.lon-a.lon)*r;
  const q=Math.sin(dlat/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dlon/2)**2;
  return 12742000*Math.asin(Math.min(1,Math.sqrt(q)));
}
function reset(){
  firstFix=0;lastFix=null;tripMeters=0;instant=null;
  byId('cockpitAverage').textContent='--';byId('cockpitDistance').textContent='0,0';
  byId('cockpitElapsed').textContent='00:00 écoulées';updateGauge(null);
  status.textContent='En attente de la position GPS…';
}
function clock(){
  if(!opened)return;
  const d=new Date();
  byId('cockpitTime').textContent=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  byId('cockpitDate').textContent=d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  if(firstFix){
    const elapsed=Math.max(0,(Date.now()-firstFix)/1000);
    byId('cockpitAverage').textContent=(tripMeters/Math.max(elapsed,1)*3.6).toLocaleString('fr-FR',{maximumFractionDigits:1});
    byId('cockpitDistance').textContent=(tripMeters/1000).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1});
    const mm=Math.floor(elapsed/60),ss=Math.floor(elapsed%60);
    byId('cockpitElapsed').textContent=String(mm).padStart(2,'0')+':'+String(ss).padStart(2,'0')+' écoulées';
    if(lastFix && Date.now()-lastFix.received>15000){
      updateGauge(null);status.textContent='Signal GPS ancien : vitesse non disponible';
    }
  }
}
function iconFor(heading){
  const h=Number.isFinite(heading)&&heading>=0?heading:0;
  return L.divIcon({className:'cockpitCarMarker',iconSize:[36,40],iconAnchor:[18,20],html:
    '<svg viewBox="0 0 36 40" style="transform:rotate('+h+'deg)" aria-hidden="true"><path d="M18 2 33 36 18 29 3 36Z" fill="#e82127" stroke="#fff" stroke-width="2"/><path d="M18 9 24 26 18 23 12 26Z" fill="#f9fbfc"/></svg>'});
}
function showPosition(lat,lon,heading){
  if(!map||!opened)return;
  const coords=[lat,lon];
  if(!marker){marker=L.marker(coords,{icon:iconFor(heading),interactive:false}).addTo(map)}
  else{marker.setLatLng(coords);marker.setIcon(iconFor(heading))}
  const t=Date.now(),p={lat,lon};
  if(!lastMapPos||t-lastMapAt>3500&&haversine(p,lastMapPos)>12){
    map.setView(coords,Math.max(map.getZoom(),15),{animate:false});
    lastMapPos=p;lastMapAt=t;
  }
}
function setupMap(){
  if(!opened||map||mapFailed||typeof window.L==='undefined')return;
  try{
    const saved=(()=>{try{return JSON.parse(localStorage.getItem('ericTeslaHubV44')||'{}').pos}catch(e){return null}})();
    if(!lastFix&&!(saved&&Number.isFinite(+saved.lat)&&Number.isFinite(+saved.lon)))return;
    const center=lastFix?[lastFix.lat,lastFix.lon]:[+saved.lat,+saved.lon];
    map=L.map('cockpitMap',{zoomControl:false,attributionControl:true,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false,keyboard:false,boxZoom:false,preferCanvas:true}).setView(center,15);
    // V6.9.1: standard OpenStreetMap tiles do not need a CARTO API key.
    // The previous CARTO endpoint returned a valid image containing
    // "API KEY REQUIRED", so Leaflet's tileerror fallback never triggered.
    // Dark-map appearance is applied in CSS to genuine OSM raster tiles.
    const mapHost=byId('cockpitMap');
    const osmattribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
    const options={minZoom:4,maxZoom:19,attribution:osmattribution,updateWhenIdle:true,keepBuffer:1};
    let tilesLoaded=false,tileErrors=0;
    mapHost.dataset.mapState='loading';
    const original=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',options).addTo(map);
    original.on('tileload',()=>{
      tilesLoaded=true;
      mapHost.removeAttribute('data-map-state');
    });
    original.on('tileerror',()=>{
      if(!tilesLoaded&&++tileErrors>=2)mapHost.dataset.mapState='unavailable';
    });
    setTimeout(()=>{
      if(opened&&!tilesLoaded)mapHost.dataset.mapState='unavailable';
    },13000);
    byId('cockpitFallback').style.display='none';
    setTimeout(()=>{if(map){map.invalidateSize(false);if(lastFix)showPosition(lastFix.lat,lastFix.lon,lastFix.heading)}},120);
  }catch(e){mapFailed=true;byId('cockpitMap').dataset.mapState='unavailable';status.textContent='Carte indisponible • compteur GPS toujours actif'}
}
function loadMap(){
  if(map||mapFailed)return;
  if(window.L){setupMap();return}
  if(!mapPromise){
    mapPromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
      const js=document.createElement('script');js.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';js.onload=resolve;js.onerror=()=>reject(new Error('Carte indisponible'));document.head.appendChild(js);
    });
  }
  mapPromise.then(()=>{if(opened)setupMap()}).catch(()=>{mapFailed=true;byId('cockpitMap').dataset.mapState='unavailable';if(opened)status.textContent='Carte non chargée • compteur GPS actif'});
}
function onFix(p){
  if(!opened)return;
  const c=p.coords;
  if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude))return;
  const now=Date.now(),fix={lat:c.latitude,lon:c.longitude,t:Number(p.timestamp)||now,received:now,accuracy:c.accuracy||99,heading:c.heading};
  if(!firstFix)firstFix=now;
  const dt=lastFix?(fix.t-lastFix.t)/1000:0;
  const dist=lastFix?haversine(lastFix,fix):0;
  const givenSpeed=Number.isFinite(c.speed)&&c.speed>=0?c.speed:null;
  let mps=givenSpeed;
  if(mps===null&&lastFix&&dt>=.5&&dt<=20&&dist>Math.max(6,Math.min(25,fix.accuracy*.55)))mps=dist/dt;
  if(mps!==null && mps>=0 && mps<70)instant=mps*3.6;
  if(mps===null&&lastFix&&dt>=.5&&dt<=20&&dist<Math.max(6,Math.min(25,fix.accuracy*.55)))instant=0;
  if(lastFix&&dt>.5&&dt<20&&fix.accuracy<85&&lastFix.accuracy<85){
    const credible=dist>Math.max(5,Math.min(24,(fix.accuracy+lastFix.accuracy)*.25))&&dist/dt<65;
    if(credible)tripMeters+=dist;
    else if(givenSpeed!==null&&givenSpeed>1.4&&givenSpeed<65)tripMeters+=givenSpeed*dt;
  }
  lastFix=fix;
  updateGauge(instant);
  status.textContent=fix.accuracy>80?'Position GPS peu précise • vitesse indicative':'Vitesse GPS indicative • données GPS du navigateur';
  if(!host.classList.contains('v71Cluster')){if(map)showPosition(fix.lat,fix.lon,fix.heading);else if(window.L)setupMap();}
  clock();
}
function onError(error){
  if(!opened)return;
  status.textContent=error&&error.code===1?'Autorise la localisation pour afficher la vitesse GPS':'GPS indisponible : vitesse indicative en attente';
}
function open(){
  if(opened)return;
  opened=true;host.classList.add('isOpen');document.body.classList.add('cockpitOpen');
  reset();lastMapAt=0;lastMapPos=null;
  clock();timer=setInterval(clock,1000);
  if(navigator.geolocation)watchId=navigator.geolocation.watchPosition(onFix,onError,{enableHighAccuracy:true,maximumAge:2000,timeout:15000});
  else status.textContent='Ce navigateur ne fournit pas de localisation GPS';
  // This AERION cockpit deliberately has no map: do not download Leaflet or map tiles.
  if(!host.classList.contains('v71Cluster')){
    if(map){map.invalidateSize(false);if(lastFix)showPosition(lastFix.lat,lastFix.lon,lastFix.heading)}
    else loadMap();
  }
  if(host.requestFullscreen){try{const p=host.requestFullscreen({navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{})}catch(e){}}
}
function close(){
  if(!opened)return;
  opened=false;host.classList.remove('isOpen');document.body.classList.remove('cockpitOpen');
  if(watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(watchId);watchId=null}
  if(timer!==null){clearInterval(timer);timer=null}
  if(document.fullscreenElement===host&&document.exitFullscreen){try{const p=document.exitFullscreen();if(p&&p.catch)p.catch(()=>{})}catch(e){}}
}
byId('cockpitClose').onclick=close;
byId('cockpitReset').onclick=reset;
document.addEventListener('keydown',e=>{if(opened&&e.key==='Escape'&&document.fullscreenElement!==host)close()});
document.addEventListener('fullscreenchange',()=>{if(opened&&!document.fullscreenElement&&!host.classList.contains('isOpen'))close()});
function addButton(parent,reference,klass,id,label){
  if(!parent||byId(id))return;
  const b=document.createElement('button');b.type='button';b.className=klass;b.id=id;b.textContent=label;
  if(reference)parent.insertBefore(b,reference);else parent.appendChild(b);
  b.onclick=open;
}
const actions=document.querySelector('.cockpitActions');
addButton(actions,actions?.firstElementChild,'cockpitAction','openImmersiveCockpit','◉ Cockpit plein écran');
const dock=document.querySelector('.dock');
addButton(dock,dock?.children[1],'dockBtn','dockCockpit','◉ Cockpit');
const footer=document.querySelector('.footer span');
window.HUB_OPEN_COCKPIT=open;
window.HUB_CLOSE_COCKPIT=close;
})();
(()=>{
'use strict';
const root=document.getElementById('immersiveCockpit');
if(!root)return;
const $=s=>root.querySelector(s);
const styles=[
  ['J','DIGITAL','Compteur GPS numérique · cadrans superposés · fond animé']
];
const KEY='ericTeslaHubCockpitStyleV2';
function saved(){try{return localStorage.getItem(KEY)||'J'}catch(e){return 'J'}}
function keep(value){try{localStorage.setItem(KEY,value)}catch(e){}}
const titles=new Map(styles.map(([id,name,description])=>[id,{name,description}]));
let current='J';
const brand=$('.cockpitBrand');
if(brand)brand.innerHTML='<strong>COCKPIT</strong><small id="cockpitStyleCaption">Compteur digital • vitesse GPS indicative</small>';
const title=document.createElement('div');
title.className='cockpitThemeTitle';title.innerHTML='<span id="cockpitThemeHeading"></span><i></i>';
root.appendChild(title);
const subtitle=document.createElement('div');
subtitle.className='cockpitStyleDescription';
subtitle.id='cockpitStyleDescription';
root.appendChild(subtitle);
// These controls are placed beside the existing reset/close controls: the old default full-screen skin is not a choice.
const topButtons=$('.cockpitTopBtns');
const chooser=document.createElement('div');
chooser.className='cockpitStyleChooser';
chooser.setAttribute('role','group');chooser.setAttribute('aria-label','Choisir le style du cockpit');
chooser.innerHTML='<span>Styles</span>'+styles.map(([id,name,desc])=>'<button type="button" data-style="'+id+'" title="'+name+' : '+desc+'" aria-label="Style '+id+' : '+name+'" aria-pressed="false">'+id+'</button>').join('');
if(topButtons)topButtons.insertBefore(chooser,topButtons.firstChild);
const phoneStyle=document.createElement('select');
phoneStyle.id='cockpitMobileStyle';
phoneStyle.setAttribute('aria-label','Choisir le style du cockpit');
phoneStyle.innerHTML=styles.map(([id,name,desc])=>'<option value="'+id+'">Style '+id+' · '+name+'</option>').join('');
chooser.appendChild(phoneStyle);

function changeStyle(id){
  const t=titles.get(id);
  if(!t)return;
  current=id;keep(id);
  phoneStyle.value=id;
  root.dataset.cockpitStyle=id;
  const label=$('#cockpitThemeHeading');
  if(label)label.textContent=id+'  /  '+t.name;
  if(subtitle)subtitle.textContent=t.description;
  const caption=$('#cockpitStyleCaption');
  if(caption)caption.textContent=t.name+' • vitesse GPS indicative';
  chooser.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===id)));
  root.dispatchEvent(new CustomEvent('hub:cockpit-style',{detail:{id,name:t.name}}));
  const map=root.querySelector('#cockpitMap .leaflet-container');
  if(map)map.setAttribute('aria-hidden','true');
}
phoneStyle.addEventListener('change',()=>changeStyle(phoneStyle.value));
chooser.addEventListener('click',e=>{
  const b=e.target.closest('button[data-style]');
  if(b)changeStyle(b.dataset.style);
});
changeStyle(current);

// Original scenic vector graphic: a perspective road, skyline and a simplified electric crossover.
// It is decor, not a rendering of nearby lanes, traffic or Tesla Autopilot.
const scene=document.createElement('div');
scene.className='cockpitScene';
scene.setAttribute('aria-hidden','true');
scene.innerHTML=`<svg viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
<defs>
 <linearGradient id="v50sky" x2="0" y2="1"><stop stop-color="#4d6371" stop-opacity=".1"/><stop offset=".7" stop-color="#1b2a39" stop-opacity=".73"/><stop offset="1" stop-color="#040810"/></linearGradient>
 <linearGradient id="v50road" x2=".5" y2="0" x1=".5" y1="1"><stop stop-color="#03060c"/><stop offset=".62" stop-color="#1c2630"/><stop offset="1" stop-color="#26313a"/></linearGradient>
 <linearGradient id="v50car" x2=".95" y2=".82"><stop stop-color="#121921"/><stop offset=".44" stop-color="#5d6b74"/><stop offset=".8" stop-color="#0d141a"/><stop offset="1" stop-color="#020408"/></linearGradient>
 <linearGradient id="v50wind" x2="0" y2="1"><stop stop-color="#0d1620"/><stop offset="1" stop-color="#344454"/></linearGradient>
 <radialGradient id="v50horizon"><stop stop-color="#a9c5cc" stop-opacity=".53"/><stop offset="1" stop-color="#7695aa" stop-opacity="0"/></radialGradient>
 <filter id="v50blur"><feGaussianBlur stdDeviation="10"/></filter>
 <filter id="v50glow"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect width="1600" height="520" fill="url(#v50sky)"/>
<ellipse cx="800" cy="260" rx="640" ry="160" fill="url(#v50horizon)"/>
<path d="M0 229 90 204 200 235 328 165 426 216 541 172 670 236 768 189 862 224 948 176 1070 224 1197 173 1330 241 1455 200 1600 224V330H0Z" fill="#1f3039" opacity=".74"/>
<path d="M0 277 150 237 316 289 452 239 571 290 682 259 788 300 921 254 1088 289 1200 250 1350 280 1490 247 1600 269V339H0Z" fill="#0a1722" opacity=".93"/>
<g opacity=".48" fill="#566e7e">
<rect x="650" y="261" width="12" height="48"/><rect x="670" y="246" width="18" height="63"/><rect x="695" y="269" width="12" height="40"/>
<rect x="720" y="256" width="21" height="53"/><rect x="749" y="231" width="17" height="78"/><rect x="772" y="259" width="13" height="50"/><rect x="798" y="235" width="28" height="74"/>
<rect x="832" y="266" width="12" height="43"/><rect x="852" y="251" width="17" height="58"/><rect x="878" y="267" width="20" height="42"/><rect x="904" y="247" width="17" height="62"/>
</g>
<g fill="#b7cfd5" opacity=".53"><circle cx="657" cy="275" r="1.2"/><circle cx="678" cy="262" r="1.2"/><circle cx="752" cy="245" r="1.2"/><circle cx="806" cy="252" r="1.2"/><circle cx="853" cy="261" r="1.2"/><circle cx="902" cy="265" r="1.2"/></g>
<path d="M720 283H880L1900 600H-300Z" fill="url(#v50road)"/>
<path d="M720 282 0 520" stroke="#aec6d0" stroke-width="3" opacity=".63"/><path d="M880 282 1600 520" stroke="#aec6d0" stroke-width="3" opacity=".63"/>
<path d="M750 284 620 520" stroke="#ffffff" stroke-width="4" stroke-dasharray="13 25" opacity=".74"/>
<path d="M850 284 980 520" stroke="#ffffff" stroke-width="4" stroke-dasharray="13 25" opacity=".74"/>
<path d="M800 287 800 520" stroke="#dfe7ed" stroke-width="3" stroke-dasharray="18 27" opacity=".14"/>
<path d="M720 283 0 490 M880 283 1600 490" stroke="var(--ui-accent)" stroke-width="5" opacity=".58" filter="url(#v50glow)"/>
<path d="M720 283 0 490 M880 283 1600 490" stroke="var(--ui-accent)" stroke-width="2.3" opacity=".68"/>
<ellipse cx="800" cy="416" rx="136" ry="24" fill="#06090f" opacity=".65" filter="url(#v50blur)"/>
<!-- simplified EV crossover from the rear -->
<g transform="translate(800 380)">
 <path d="M-98 19-91-5-72-22-50-34Q0-46 50-34L72-22 91-5 98 19 88 45Q0 59-88 45Z" fill="url(#v50car)" stroke="#9caebb" stroke-opacity=".59" stroke-width="1.7"/>
 <path d="M-57-26Q0-43 57-26L72-6Q0-15-72-6Z" fill="url(#v50wind)" stroke="#c0d4de" stroke-opacity=".55" stroke-width="1.4"/>
 <path d="M-96 7Q0 17 96 7" stroke="#e9f2f7" stroke-opacity=".36" stroke-width="1.1" fill="none"/>
 <path d="M-90 14Q-36 20 0 20T90 14" stroke="#fd364a" stroke-width="3.8" fill="none" filter="url(#v50glow)"/>
 <path d="M-90 14Q-36 20 0 20T90 14" stroke="#ff4051" stroke-width="2.6" fill="none"/>
 <path d="M-72 28Q0 35 72 28" stroke="#141b22" stroke-width="5" fill="none"/>
 <path d="M-43 42Q0 48 43 42" stroke="#dbe5eb" stroke-opacity=".43" stroke-width="1" fill="none"/>
 <path d="M-96 17-100 43-79 47-74 24ZM96 17 100 43 79 47 74 24Z" fill="#03060a"/>
</g>
</svg>`;
root.insertBefore(scene,root.querySelector('.cockpitMain'));
const wx=document.createElement('aside');
wx.className='cockpitWeather';
wx.innerHTML='<div class="wxTitle">Météo locale actuelle</div><div class="wxRow"><span class="wxIcon" id="v50wxIcon" aria-hidden="true">☁</span><div><div class="wxTemp" id="v50wxTemp">--°</div><div class="wxCond" id="v50wxCond">Météo en attente</div></div></div><div class="wxNext"><span id="v50wxNext">Prévision à +1 h : en attente</span></div>';
root.appendChild(wx);
const gps=document.createElement('div');
gps.className='cockpitMapTitle';
gps.textContent='CARTE GPS • LOCALISATION INDICATIVE · Aucun itinéraire Tesla importé';
root.appendChild(gps);
function weatherIcon(str){
  const s=String(str||'').toLowerCase();
  if(s.includes('orage'))return '⛈';
  if(s.includes('neige'))return '❄';
  if(s.includes('verglas')||s.includes('givr'))return '🧊';
  if(s.includes('pluie')||s.includes('averse')||s.includes('bruine'))return '🌧';
  if(s.includes('brouillard'))return '🌫';
  if(s.includes('dégag')||s.includes('soleil'))return '☀';
  if(s.includes('éclaircie')||s.includes('partiellement'))return '⛅';
  return '☁';
}
function weather(){
  // Reuse the weather engine already present in the Hub, so no extra polling is needed.
  const temp=document.getElementById('fcWxNow')?.textContent?.trim()
    ||document.getElementById('weatherTemp')?.textContent?.trim()||'--°';
  const condition=document.getElementById('fcWxCond')?.textContent?.trim()
    ||document.getElementById('weatherLabel')?.textContent?.trim()||'Météo en attente';
  const next=document.getElementById('fcWxNext')?.textContent?.trim()||'+1 h : en attente';
  const known=/\d/.test(temp);
  $('#v50wxTemp').textContent=known?temp:'--°';
  $('#v50wxCond').textContent=condition==='--'?'Météo en attente':condition;
  $('#v50wxNext').textContent=next.startsWith('+1 h')?'Prévision '+next:next;
  $('#v50wxIcon').textContent=weatherIcon(condition+' '+next);
}
weather();
setInterval(weather,15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)weather()});
const footer=document.querySelector('.footer span');
if(footer)footer.textContent='AERION • V7.0';
})();

// The multistyle cockpit is the starting view, even on a phone.
// The Hub remains accessible through the explicit Retour au Hub control.
(()=>{'use strict';
if((window.HUB_V6_DEFAULT_HOME&&!location.search.includes('view=cockpit'))||location.search.includes('view=hub')||location.hash==='#hub')return;
const start=()=>window.HUB_OPEN_COCKPIT?.();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
})();
