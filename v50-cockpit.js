(()=>{
'use strict';
const root=document.getElementById('immersiveCockpit');
if(!root)return;
const $=s=>root.querySelector(s);
const styles=[
  ['A','MINIMAL','Élégant · carbone et rouge'],
  ['B','NEON','Technologie · cyan et carte'],
  ['C','SPORT','Performance · rouge et acier'],
  ['D','FLOW','Tech · argent et bleu glacier'],
  ['E','PERFORMANCE','Sport · noir et rouge intense'],
  ['F','HORIZON','Futuriste · bleu panoramique']
];
const KEY='ericTeslaHubCockpitStyleV2';
function saved(){try{return localStorage.getItem(KEY)||'A'}catch(e){return 'A'}}
function keep(value){try{localStorage.setItem(KEY,value)}catch(e){}}
const titles=new Map(styles.map(([id,name,description])=>[id,{name,description}]));
let current=titles.has(saved())?saved():'A';
const brand=$('.cockpitBrand');
if(brand)brand.innerHTML='<strong>COCKPIT</strong><small id="cockpitStyleCaption">Six univers • affichage GPS indicatif</small>';
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
function changeStyle(id){
  const t=titles.get(id);
  if(!t)return;
  current=id;keep(id);
  root.dataset.cockpitStyle=id;
  const label=$('#cockpitThemeHeading');
  if(label)label.textContent=id+'  /  '+t.name;
  if(subtitle)subtitle.textContent=t.description;
  const caption=$('#cockpitStyleCaption');
  if(caption)caption.textContent=t.name+' • vitesse GPS indicative';
  chooser.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===id)));
  const map=root.querySelector('#cockpitMap .leaflet-container');
  if(map)map.setAttribute('aria-hidden','true');
}
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
if(footer)footer.textContent='Eric Tesla Hub • V5.0';
})();