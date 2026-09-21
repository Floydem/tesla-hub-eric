/* V5.3: Nine genuinely different scene/layout treatments. Real-data widgets only. */
(()=>{
'use strict';
const root=document.getElementById('immersiveCockpit');
const stage=document.getElementById('v52Stage');
if(!root||!stage)return;
const $=(s,r=root)=>r.querySelector(s),text=(id,value)=>{stage.querySelectorAll('[data-v53="'+id+'"]').forEach(e=>e.textContent=value)};
const decor=document.createElement('div');decor.className='v53Backdrop';decor.setAttribute('aria-hidden','true');
decor.innerHTML='<div class="v53Landscape"></div><div class="v53Light"></div><div class="v53Road"></div>';
root.insertBefore(decor,root.querySelector('.cockpitScene'));
const media=document.createElement('section');media.className='v52Card v53Media';
media.innerHTML='<header><span class="v52MiniIcon">♫</span><span class="v52Eyebrow">En cours d’écoute</span></header><div class="v53MusicBody"><div class="v53Cover" aria-hidden="true">♪</div><div class="v53MusicDetails"><strong id="v53Track">Lecture Tesla non accessible</strong><span id="v53Artist">Le navigateur ne voit pas la musique de la voiture.</span></div></div><button type="button" id="v53MediaLink" class="v52Action">Ouvrir mes médias ↗</button>';
stage.appendChild(media);
const sun=document.createElement('section');sun.className='v52Card v53Sun';
sun.innerHTML='<header><span class="v52MiniIcon">☀</span><span class="v52Eyebrow">Lumière du jour</span></header><div class="v53SunRow"><span id="v53SunIcon">☀</span><div><strong id="v53SunTitle">Lever et coucher du soleil</strong><small id="v53SunData">Position GPS et horaires en attente</small></div></div>';
stage.appendChild(sun);
const journey=stage.querySelector('.v52Journey');
if(journey){journey.querySelector('.v52Quiet').textContent='Estimation du navigateur GPS · trajet commencé à l’ouverture';}
const mapTile=stage.querySelector('.v52MapTile');
if(mapTile){mapTile.querySelector('strong').textContent='Carte de localisation';mapTile.querySelector('small').textContent='Position GPS uniquement, pas de guidage Tesla';}
const mediaButton=$('#v53MediaLink');
mediaButton.onclick=()=>{document.getElementById('cockpitClose')?.click();document.querySelector('[data-go="media"]')?.click()};
const cap=document.createElement('div');cap.className='v53Caption';cap.setAttribute('aria-hidden','true');root.appendChild(cap);
const labels={
 A:['ÉPURE','Une ligne, une route, l’essentiel.'],
 B:['NÉON','La route, en lumière.'],
 C:['PISTE','Le mouvement à l’état pur.'],
 D:['GLACIER','Clarté et horizon.'],
 E:['VORTEX','Une autre intensité.'],
 F:['HORIZON','La route est à vous.'],
 G:['PANORAMA','Le voyage commence ici.'],
 H:['ION','L’énergie du mouvement.'],
 I:['ATELIER','Chaque information à sa place.'],
 J:['DIGITAL','La route en toute simplicité.']
};
function apply(){
 const id=root.dataset.cockpitStyle||'A',m=labels[id]||labels.A;
 cap.textContent=m[0]+' / '+m[1];
 root.querySelector('.cockpitCurrentLabel').textContent=id==='J'?'Vitesse GPS indicative':id==='I'?'Vitesse GPS':id==='E'?'VITESSE INSTANTANÉE':'Vitesse';
 // Never show an invented value for vehicle status, gear selection or a fictitious route.
 const footer=$('.cockpitAttribution');if(footer)footer.textContent='Décor illustratif · GPS estimé · pas de données véhicule';
}
root.addEventListener('hub:cockpit-style',apply);apply();
function mediaRefresh(){
 // This origin can read only metadata published by a player hosted in this same web page.
 // It cannot inspect Tesla native media, Spotify in a separate tab or an external app.
 const meta=navigator.mediaSession?.metadata;
 const track=$('#v53Track'),artist=$('#v53Artist');
 if(meta&&meta.title){
   track.textContent=meta.title;
   artist.textContent=[meta.artist,meta.album].filter(Boolean).join(' · ')||'Lecture dans cette page';
 }else{
   track.textContent='Lecture Tesla non accessible';
   artist.textContent='Morceau en cours indisponible dans le navigateur.';
 }
}
mediaRefresh();setInterval(()=>{if(root.classList.contains('isOpen'))mediaRefresh()},6000);
function sunRefresh(){
  // Open-Meteo sunrise/sunset is fetched only if a known GPS position exists; no invented times.
  const p=(()=>{try{return JSON.parse(localStorage.getItem('ericTeslaHubV44')||'{}').pos}catch(e){return null}})();
  if(!p||!Number.isFinite(+p.lat)||!Number.isFinite(+p.lon))return;
  const key=(+p.lat).toFixed(2)+','+(+p.lon).toFixed(2)+','+new Date().toISOString().slice(0,10);
  if(sunRefresh.key===key)return;sunRefresh.key=key;
  const url='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(p.lat)+'&longitude='+encodeURIComponent(p.lon)+'&daily=sunrise,sunset&timezone=auto&forecast_days=1';
  fetch(url).then(r=>{if(!r.ok)throw Error('sun');return r.json()}).then(d=>{
    const sunrise=d.daily?.sunrise?.[0],sunset=d.daily?.sunset?.[0];
    if(sunrise&&sunset){
      $('#v53SunTitle').textContent='Lever '+sunrise.slice(11,16)+' · Coucher '+sunset.slice(11,16);
      $('#v53SunData').textContent='Horaires estimés pour ta position';
    }
  }).catch(()=>{$('#v53SunData').textContent='Horaires indisponibles'});
}
sunRefresh();
document.addEventListener('visibilitychange',()=>{if(!document.hidden){mediaRefresh();sunRefresh()}});
const current=document.querySelector('.footer span');if(current)current.textContent='Eric Tesla Hub • V5.3';
})();