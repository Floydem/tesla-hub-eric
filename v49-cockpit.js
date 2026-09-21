(()=>{
'use strict';
// Separate cockpit: the existing home and floating display remain the defaults.
const byId=id=>document.getElementById(id);
const host=document.createElement('section');
host.id='immersiveCockpit';host.setAttribute('aria-label','Cockpit plein écran');
host.innerHTML=`
  <div id="cockpitFallback" aria-hidden="true"></div><div id="cockpitMap" aria-hidden="true"></div><div id="cockpitTint" aria-hidden="true"></div>
  <div class="cockpitRoad" aria-hidden="true"><div class="cockpitCenterLine" id="cockpitRoadLine"></div></div>
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
  if(kmh===null||!Number.isFinite(kmh)){byId('cockpitSpeed').textContent='--';byId('cockpitProgress').setAttribute('d',arc(0,131));return}
  const v=Math.max(0,Math.round(kmh)),f=Math.min(v/maxSpeed,1);
  byId('cockpitSpeed').textContent=String(v);
  byId('cockpitProgress').setAttribute('d',arc(f,131));
  const [x,y]=point(140+260*f,112),needle=byId('cockpitNeedle');
  needle.setAttribute('x2',x);needle.setAttribute('y2',y);
  const line=byId('cockpitRoadLine');
  line.style.animationPlayState=v>3?'running':'paused';
  line.style.animationDuration=Math.max(.28,1.5-v/180)+'s';
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
    const center=lastFix?[lastFix.lat,lastFix.lon]:saved&&Number.isFinite(+saved.lat)&&Number.isFinite(+saved.lon)?[+saved.lat,+saved.lon]:[47.1,6.6];
    map=L.map('cockpitMap',{zoomControl:false,attributionControl:true,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false,keyboard:false,boxZoom:false,preferCanvas:true}).setView(center,15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{minZoom:4,maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',updateWhenIdle:true,keepBuffer:1}).addTo(map);
    byId('cockpitFallback').style.display='none';
    setTimeout(()=>{if(map){map.invalidateSize(false);if(lastFix)showPosition(lastFix.lat,lastFix.lon,lastFix.heading)}},120);
  }catch(e){mapFailed=true;status.textContent='Carte indisponible • compteur GPS toujours actif'}
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
  mapPromise.then(()=>{if(opened)setupMap()}).catch(()=>{mapFailed=true;if(opened)status.textContent='Carte non chargée • compteur GPS actif'});
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
  status.textContent=fix.accuracy>80?'Position GPS peu précise • vitesse indicative':'Vitesse GPS indicative • carte de localisation (sans itinéraire)';
  if(map)showPosition(fix.lat,fix.lon,fix.heading);else if(window.L)setupMap();
  clock();
}
function onError(error){
  if(!opened)return;
  status.textContent=error&&error.code===1?'Autorise la localisation pour afficher la vitesse et la carte':'GPS indisponible : vitesse et moyenne en attente';
}
function open(){
  if(opened)return;
  opened=true;host.classList.add('isOpen');document.body.classList.add('cockpitOpen');
  reset();lastMapAt=0;lastMapPos=null;
  clock();timer=setInterval(clock,1000);
  if(navigator.geolocation)watchId=navigator.geolocation.watchPosition(onFix,onError,{enableHighAccuracy:true,maximumAge:2000,timeout:15000});
  else status.textContent='Ce navigateur ne fournit pas de localisation GPS';
  if(map){map.invalidateSize(false);if(lastFix)showPosition(lastFix.lat,lastFix.lon,lastFix.heading)}
  else loadMap();
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
if(footer)footer.textContent='Eric Tesla Hub • V4.9';
})();