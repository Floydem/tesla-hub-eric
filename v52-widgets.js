/* Cockpit v5.2 : nine named styles, intuitive ‹ / › navigation and functional G/H/I layouts. */
(()=>{
'use strict';
const root=document.getElementById('immersiveCockpit');
if(!root)return;
const $=(s,scope=root)=>scope.querySelector(s);
const styles=[['A','Épure'],['B','Néon'],['C','Piste'],['D','Glacier'],['E','Vortex'],['F','Horizon'],['G','Panorama'],['H','Ion'],['I','Atelier']];
const ids=styles.map(x=>x[0]);
const chooser=$('.cockpitStyleChooser');
if(!chooser)return;
const menu=$('#cockpitMobileStyle');
const prev=document.createElement('button'),next=document.createElement('button');
prev.type=next.type='button';
prev.id='v52Prev';next.id='v52Next';
prev.className=next.className='v52Switch';
prev.textContent='‹';next.textContent='›';
prev.title='Style précédent';next.title='Style suivant';
prev.setAttribute('aria-label','Style précédent');next.setAttribute('aria-label','Style suivant');
const name=document.createElement('button');
name.id='v52Current';name.className='v52Current';name.type='button';
name.title='Choisir un style';name.setAttribute('aria-label','Choisir le style de cockpit');
chooser.insertBefore(prev,chooser.firstChild);
chooser.insertBefore(name,prev.nextSibling);
chooser.insertBefore(next,name.nextSibling);
name.onclick=()=>{
  // On compact screens the native selector is always accessible; on larger screens focus the existing choices.
  if(menu && getComputedStyle(menu).display!=='none'){menu.focus();menu.click()}
  else {const active=chooser.querySelector('button[data-style][aria-pressed="true"]');active?.focus()}
};
function go(direction){
  const i=ids.indexOf(root.dataset.cockpitStyle||'A');
  const id=ids[(i+direction+ids.length)%ids.length];
  // Reuse the original cockpit's changeStyle event handler, saved selection and native phone menu.
  const b=chooser.querySelector('button[data-style="'+id+'"]');
  if(b)b.click();
  else if(menu){menu.value=id;menu.dispatchEvent(new Event('change',{bubbles:true}))}
}
prev.onclick=()=>go(-1);next.onclick=()=>go(1);
function updateTitle(){
  const id=root.dataset.cockpitStyle||'A';
  const item=styles.find(x=>x[0]===id)||styles[0];
  name.textContent=item[0]+' · '+item[1];
  name.setAttribute('aria-label','Vue '+item[0]+' '+item[1]);
  const bar=$('.cockpitStyleChooser > span');
  if(bar)bar.textContent='9 styles';
}
root.addEventListener('hub:cockpit-style',updateTitle);updateTitle();

// The three new designs use true browser-available data only. No simulated vehicle battery,
// tire pressure, acceleration, driver assistance, audio playback or Tesla navigation directions.
const stage=document.createElement('div');stage.id='v52Stage';stage.className='v52Stage';
stage.innerHTML=`
  <section class="v52Card v52Journey" aria-label="Trajet GPS">
    <header><span class="v52MiniIcon">↗</span><span class="v52Eyebrow">Trajet GPS</span><span class="v52Live">● LIVE</span></header>
    <div class="v52Distance"><b data-bind="distance">0,0</b> <small>km</small></div>
    <div class="v52GridStats">
      <div><span>Moyenne</span><strong><span data-bind="average">--</span> <small>km/h</small></strong></div>
      <div><span>Durée</span><strong data-bind="elapsed">00:00</strong></div>
    </div>
    <div class="v52Quiet">Depuis l’ouverture du cockpit · GPS indicatif</div>
  </section>
  <section class="v52Card v52Conditions" aria-label="Météo réelle">
    <header><span class="v52MiniIcon">☀</span><span class="v52Eyebrow">Conditions locales</span></header>
    <div class="v52ConditionsMain"><span class="v52WeatherIcon" data-bind="wxIcon">☁</span><strong data-bind="temperature">--°</strong><span class="v52ConditionsLabel" data-bind="condition">En attente</span></div>
    <div class="v52Forecast"><span>Dans une heure</span><strong data-bind="forecast">Prévision en attente</strong></div>
  </section>
  <section class="v52Card v52Today" aria-label="Date et prochain jour férié">
    <header><span class="v52MiniIcon">▦</span><span class="v52Eyebrow">Aujourd’hui</span></header>
    <strong class="v52Time" data-bind="time">--:--</strong>
    <span class="v52Date" data-bind="date">Date en attente</span>
    <div class="v52Holiday"><span>Prochain jour férié</span><strong data-bind="holiday">Chargement…</strong><small data-bind="holidayCountry">France / Neuchâtel</small></div>
  </section>
  <section class="v52Card v52Agenda" aria-label="Prochain rendez-vous de mon agenda">
    <header><span class="v52MiniIcon">◷</span><span class="v52Eyebrow">Agenda personnel</span></header>
    <strong class="v52Appointment" data-bind="appointment">Aucun rendez-vous à venir</strong>
    <span data-bind="appointmentDate" class="v52AgendaDate">Enregistré localement dans ce navigateur</span>
    <button type="button" id="v52AgendaBtn" class="v52Action">Ouvrir l’agenda ↗</button>
  </section>
  <section class="v52Card v52MapTile" aria-label="Carte de localisation GPS">
    <header><span class="v52MiniIcon">⌖</span><span class="v52Eyebrow">Localisation GPS</span></header>
    <div class="v52MapArt" aria-hidden="true"><i></i><span>⌖</span></div>
    <strong>Carte en arrière-plan</strong>
    <small>Position GPS du navigateur · sans itinéraire Tesla</small>
  </section>
  <section class="v52Card v52Essentials" aria-label="Raccourcis utiles">
    <header><span class="v52MiniIcon">✦</span><span class="v52Eyebrow">Accès rapides</span></header>
    <div class="v52Quick">
      <button type="button" id="v52OpenHub">Accueil Hub</button>
      <button type="button" id="v52OpenCalendar">Mon agenda</button>
      <button type="button" id="v52ResetTrip">Remise à zéro trajet</button>
    </div>
    <small>Fonctions disponibles dans Eric Tesla Hub</small>
  </section>
  <section class="v52Card v52Status" aria-label="Qualité des données du cockpit">
    <header><span class="v52MiniIcon">◉</span><span class="v52Eyebrow">État des données</span></header>
    <strong data-bind="gpsStatus">En attente du GPS…</strong>
    <small>Le compteur GPS ne remplace pas celui de la voiture.</small>
  </section>
`;
root.appendChild(stage);
function openAgenda(){
  // While the cockpit uses browser fullscreen, outside-body overlays cannot be displayed.
  // Move the existing calendar modal into the cockpit temporarily, then restore it on close.
  const overlay=document.getElementById('agendaOverlay');
  if(overlay && !root.contains(overlay)){
    root.appendChild(overlay);
    const observer=new MutationObserver(()=>{
      if(!overlay.classList.contains('show')){
        observer.disconnect();
        if(root.contains(overlay))document.body.appendChild(overlay);
      }
    });
    observer.observe(overlay,{attributes:true,attributeFilter:['class']});
  }
  const trigger=document.getElementById('openAgenda');
  if(trigger){trigger.click();return}
  const tile=document.getElementById('openAgendaTile');
  if(tile)tile.click();
}
$('#v52AgendaBtn').onclick=$('#v52OpenCalendar').onclick=openAgenda;
$('#v52OpenHub').onclick=()=>document.getElementById('cockpitClose')?.click();
$('#v52ResetTrip').onclick=()=>document.getElementById('cockpitReset')?.click();

function txt(selector,fallback){
  const value=document.querySelector(selector)?.textContent?.trim();
  return value&&value!=='--'&&value!=='--°'?value:fallback;
}
function write(key,value){stage.querySelectorAll('[data-bind="'+key+'"]').forEach(x=>{if(x.textContent!==value)x.textContent=value})}
const pad=n=>String(n).padStart(2,'0');
function dateIso(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
const countryLabel={fr:'France',ch:'Neuchâtel'};
function showHoliday(){
  const H=window.HUB_HOLIDAYS;
  if(!H)return;
  const now=new Date(),today=dateIso(now),entries=[];
  for(const y of [now.getFullYear(),now.getFullYear()+1]){
    entries.push(...H.fr(y),...H.ch(y));
  }
  entries.sort((a,b)=>a.date.localeCompare(b.date));
  const upcoming=entries.find(e=>e.date>=today);
  if(!upcoming){write('holiday','À venir');write('holidayCountry','');return}
  const same=entries.filter(e=>e.date===upcoming.date);
  const d=new Date(upcoming.date+'T12:00:00');
  const day=d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
  write('holiday',day+' · '+upcoming.title.replace(/\s*\(NE\)\s*/g,''));
  const types=[...new Set(same.map(e=>e.type))];
  write('holidayCountry',types.map(type=>countryLabel[type]||type).join(' + '));
  const box=stage.querySelector('.v52Holiday');
  box.dataset.origin=types.length>1?'both':types[0]||'';
}
function showAppointment(){
  let appointments=[];
  try{const data=JSON.parse(localStorage.getItem('ericTeslaHubCalendarV1')||'[]');if(Array.isArray(data))appointments=data}catch(e){}
  const now=new Date();
  const next=appointments.filter(a=>a&&/^\d{4}-\d{2}-\d{2}$/.test(a.date))
    .map(a=>({...a,_date:new Date(a.date+'T'+(/^\d{2}:\d{2}$/.test(a.time||'')?a.time:'23:59')+':00')}))
    .filter(a=>a._date.getTime()>=now.getTime()-60000)
    .sort((a,b)=>a._date-b._date)[0];
  if(!next){write('appointment','Aucun rendez-vous à venir');write('appointmentDate','Ajoute tes RDV dans l’agenda du Hub');return}
  write('appointment',String(next.title||'Rendez-vous').slice(0,95));
  write('appointmentDate',new Date(next.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})+(next.time?' · '+next.time:' · journée'));
}
function refresh(){
  write('distance',txt('#cockpitDistance','0,0'));
  write('average',txt('#cockpitAverage','--'));
  write('elapsed',txt('#cockpitElapsed','00:00').replace(/ écoulées.*/,''));
  write('time',txt('#cockpitTime','--:--'));
  write('date',txt('#cockpitDate',new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})));
  write('temperature',txt('#v50wxTemp','--°'));
  write('condition',txt('#v50wxCond','En attente de la météo'));
  write('forecast',txt('#v50wxNext','Prévisions indisponibles').replace(/^Prévision /,''));
  write('wxIcon',txt('#v50wxIcon','☁'));
  write('gpsStatus',txt('#cockpitStatus','En attente de la position GPS…'));
  showHoliday();showAppointment();
}
refresh();
const timer=setInterval(()=>{if(root.classList.contains('isOpen'))refresh()},2500);
root.addEventListener('hub:cockpit-style',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
const footer=document.querySelector('.footer span');if(footer)footer.textContent='Eric Tesla Hub • V5.2';
})();