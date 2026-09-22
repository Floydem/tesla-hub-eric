/* AERION V7: unchanged navigation and personal services, new visual identity. */
(function(){
'use strict';
var doc=document, byId=function(id){return doc.getElementById(id);};
var main=doc.querySelector('.main');
if(!main || !byId('mediaGrid') || !byId('immersiveCockpit'))return;
/* V6.1 leaves all existing grids, local storage and modal handlers intact. */
var KEY='ericTeslaHubV6Drawers';
var cache={};try{cache=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
var initial={media:true,games:false,travel:true,tools:false,discover:false};
function icon(kind){
 var paths={
 media:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 games:'<path d="M7 8h10a4 4 0 0 1 4 4v3a3 3 0 0 1-5 2l-2-2h-4l-2 2a3 3 0 0 1-5-2v-3a4 4 0 0 1 4-4Z"/><path d="M7 11v4m-2-2h4m7-1h.01M18 14h.01"/>',
 travel:'<path d="m12 2 3 8 7 2-7 2-3 8-3-8-7-2 7-2z"/>',
 tools:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 discover:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-4 1 2-5z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 bolt:'<path d="m13 2-8 12h7l-1 8 8-12h-7z"/>',
 shield:'<path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/>'
 };
 return '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">'+(paths[kind]||paths.tools)+'</svg>';
}
function button(text,id,cls){var b=doc.createElement('button');b.type='button';b.textContent=text;if(id)b.id=id;if(cls)b.className=cls;return b;}
var dashboard=doc.createElement('section');dashboard.id='v6Dashboard';dashboard.setAttribute('aria-label','AERION');
dashboard.innerHTML=
 '<header class="v6Banner" id="v6Banner">'+
 '<div class="v6Sky" aria-hidden="true"><i class="v6Mountains"></i><i class="v6Road"></i></div>'+
 '<div class="v6BannerLeft"><strong id="v6Clock">--:--</strong><small id="v6Date">Date en attente</small>'+
 '<div class="v6BannerWeather"><span aria-hidden="true">☁</span><div><strong id="v6Weather">--°</strong><small id="v6Condition">Météo locale indisponible</small></div></div></div>'+
 '<div class="v6BannerCenter"><span>VITESSE GPS INDICATIVE</span><div><strong id="v6Speed">--</strong><small>km/h</small></div><small id="v6SpeedState">En attente du GPS</small></div>'+
 '<div class="v6BannerRight"><div class="v6Journey v72Holiday"><small>PROCHAIN JOUR FÉRIÉ</small><strong id="v72Holiday">Recherche du calendrier…</strong><span id="v72HolidayPlace">France · Neuchâtel</span></div><div class="v6Next v72Gps"><small>POSITION GPS</small><strong id="v72GpsState">En attente de la localisation</strong></div></div>'+
 '<div class="v6BannerNote">Vitesse GPS indicative du navigateur · ne remplace pas le compteur du véhicule.</div>'+
 '</header>'+
 '<div class="v6Titlebar"><div><div class="v6Eyebrow">AERION · HUB PERSONNEL</div><h1 class="velomBrand"><img src="assets/aerion-wordmark.svg?v=7.0" width="610" height="120" alt="AERION"></h1><p>Vos applications, contenus et outils. Pensé pour la route et les pauses.</p></div>'+
 '<div class="v6TitleActions"><button type="button" id="v6CockpitBtn">'+icon('shield')+' Cockpit digital</button><button type="button" id="v6AgendaBtn">'+icon('calendar')+' Agenda</button><button type="button" id="v6SettingsBtn">'+icon('tools')+' Paramètres</button></div></div>'+
 '<div class="v6Intro"><article class="v6Widget v6WeatherWidget"><div class="v6WidgetHead">'+icon('travel')+' <span>Météo locale</span><button type="button" id="v6RefreshWx" aria-label="Actualiser la météo">↻</button></div><div class="v6WidgetNumber" id="v6WeatherLarge">--°</div><span id="v6WeatherDescription">Prévisions indisponibles</span><div class="v6SmallLine" id="v6WeatherDetails">Mini / maxi : --</div></article>'+
 '<article class="v6Widget v6AgendaWidget"><div class="v6WidgetHead">'+icon('calendar')+' <span>Agenda</span><button type="button" id="v6CalendarOpen">Ouvrir ↗</button></div><div id="v6Appointment" class="v6Appointment">Aucun rendez-vous à venir</div><div id="v6AppointmentWhen" class="v6SmallLine">Mes rendez-vous enregistrés dans ce navigateur</div></article>'+
 '<article class="v6Widget v7NextHourWidget"><div class="v6WidgetHead">'+icon('travel')+' <span>Dans une heure</span></div><div class="v6WidgetNumber" id="v7NextHourWeather">Prévisions en attente</div><span class="v6SmallLine">Prévisions météo locales · actualisées automatiquement</span></article>'+
 '</div>'+
 '<div class="v6DrawerList" id="v6DrawerList"></div>'+
 '<p class="v6Safety">Vidéos et jeux sont réservés aux moments où le véhicule est à l’arrêt. Ce site ne commande pas les fonctions de sécurité du véhicule.</p>';
main.insertBefore(dashboard,main.firstChild);
var drawers=byId('v6DrawerList');
var groups=[
 {id:'media',name:'Multimédia',desc:'Musique, vidéos et contenus en streaming',source:'media',symbol:'media'},
 {id:'games',name:'Jeux',desc:'Family Arcade, Finger Drift et tous vos jeux',source:'arcade',symbol:'games'},
 {id:'travel',name:'Voyage',desc:'Navigation, météo, agenda et infos en temps réel',source:'drive',symbol:'travel'},
 {id:'tools',name:'Outils',desc:'Utilitaires, voiture et personnalisations',source:'tools',symbol:'tools'},
 {id:'discover',name:'Découvrir',desc:'Actualités, curiosités et expériences web',source:'discover',symbol:'discover'}
];
var sections={};
groups.forEach(function(g){
 var old=byId(g.source);if(!old)return;
 var container=doc.createElement('article');container.className='v6Drawer';container.dataset.drawer=g.id;
 var head=button('',null,'v6DrawerHead');head.setAttribute('aria-controls','v6DrawerContent-'+g.id);
 head.innerHTML='<span class="v6DrawerIcon">'+icon(g.symbol)+'</span><span class="v6DrawerLabel"><strong>'+g.name+'</strong><small>'+g.desc+'</small></span><span class="v6DrawerFlag">Fermé</span><span class="v6Chevron" aria-hidden="true">⌄</span>';
 var body=doc.createElement('div');body.className='v6DrawerContent';body.id='v6DrawerContent-'+g.id;
 if(g.id==='travel'){
  var links=doc.createElement('div');links.className='v6TravelLinks';
  links.innerHTML='<a href="https://www.waze.com/live-map" target="_blank" rel="noopener noreferrer">'+icon('travel')+' Waze</a>'+
   '<a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">↗ Google Maps</a>'+
   '<a href="https://www.tesla.com/findus" target="_blank" rel="noopener noreferrer">⚡ Bornes de recharge</a>'+
   '<button type="button" id="v6TravelAgenda">'+icon('calendar')+' Mon agenda</button>'+
   '<button type="button" id="v6TravelWeather">☁ Prévisions détaillées</button>';
  body.appendChild(links);
 }
 body.appendChild(old);
 container.appendChild(head);container.appendChild(body);drawers.appendChild(container);
 sections[g.id]=container;
 head.onclick=function(){setOpen(g.id,!container.classList.contains('is-open'))};
 setOpen(g.id,Object.prototype.hasOwnProperty.call(cache,g.id)?!!cache[g.id]:!!initial[g.id],false);
});
function setOpen(which,open,persist){
 var node=sections[which];if(!node)return;
 node.classList.toggle('is-open',!!open);
 node.querySelector('.v6DrawerHead').setAttribute('aria-expanded',String(!!open));
 node.querySelector('.v6DrawerFlag').textContent=open?'Ouvert':'Fermé';
 node.querySelector('.v6DrawerContent').hidden=!open;
 if(persist!==false){cache[which]=!!open;try{localStorage.setItem(KEY,JSON.stringify(cache));}catch(e){}}
}
function jump(which,selector){
 setOpen(which,true);
 requestAnimationFrame(function(){(doc.querySelector(selector)||sections[which])?.scrollIntoView({behavior:'smooth',block:'start'});});
}
function openAgenda(){var b=byId('openAgenda')||byId('openAgendaTile');if(b)b.click();}
byId('v6CockpitBtn').onclick=function(){
 var root=byId('immersiveCockpit');
 var selector=root?.querySelector('.cockpitStyleChooser button[data-style="J"]');
 if(selector)selector.click();
 else {var menu=byId('cockpitMobileStyle');if(menu){menu.value='J';menu.dispatchEvent(new Event('change',{bubbles:true}));}}
 window.HUB_OPEN_COCKPIT?.();
};
byId('v6AgendaBtn').onclick=byId('v6CalendarOpen').onclick=openAgenda;
byId('v6SettingsBtn').onclick=function(){jump('tools','#tools')};
byId('v6TravelAgenda').onclick=openAgenda;
byId('v6TravelWeather').onclick=function(){byId('refreshWeather')?.click();jump('travel','#v6DrawerList');byId('v6WeatherLarge')?.scrollIntoView({behavior:'smooth'});};
byId('v6RefreshWx').onclick=function(){byId('refreshWeather')?.click();};
function displayClock(){
 var n=new Date();
 byId('v6Clock').textContent=n.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
 byId('v6Date').textContent=n.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long'});
}
displayClock();setInterval(displayClock,10000);
function field(source,dest,fallback){var t=doc.querySelector(source)?.textContent?.trim();var target=byId(dest);if(target)target.textContent=t&&t!=='--'&&t!=='--°'?t:fallback;}
function appointment(){
 var list=[];try{list=JSON.parse(localStorage.getItem('ericTeslaHubCalendarV1')||'[]');}catch(e){}
 var now=Date.now();
 var next=(Array.isArray(list)?list:[]).filter(function(a){return a&&/^\d{4}-\d{2}-\d{2}$/.test(a.date);})
 .map(function(a){var time=/^\d{2}:\d{2}$/.test(a.time||'')?a.time:'23:59';return {a:a,ms:new Date(a.date+'T'+time+':00').getTime()};})
 .filter(function(x){return x.ms>=now-60000;}).sort(function(a,b){return a.ms-b.ms;})[0];
 byId('v6Appointment').textContent=next?String(next.a.title||'Rendez-vous').slice(0,90):'Aucun rendez-vous à venir';
 byId('v6AppointmentWhen').textContent=next?new Date(next.a.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long'})+(next.a.time?' · '+next.a.time:' · Journée'):'Ajoutez vos rendez-vous dans l’agenda du Hub';

}
function refreshData(){
 field('#floatSpeed','v6Speed','--');
 field('#fcWxNow','v6Weather','--°');field('#fcWxNow','v6WeatherLarge','--°');
 field('#fcWxCond','v6Condition','Météo indisponible');field('#weatherLabel','v6WeatherDescription','Prévisions indisponibles');
field('#fcWxNext','v7NextHourWeather','Prévision indisponible');field('#miniRange','v6WeatherDetails','Mini / maxi indisponibles');
 byId('v6SpeedState').textContent=byId('gpsStateHero')?.textContent?.trim()||'GPS en attente';
 var gps=byId('v72GpsState');if(gps){var g=byId('gpsStateHero')?.textContent?.trim();gps.textContent=g||'Localisation du navigateur en attente';}
 var H=window.HUB_HOLIDAYS,upcoming=null,types=[];
 if(H&&typeof H.fr==='function'&&typeof H.ch==='function'){
  var n=new Date(),today=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
  var holidays=[];for(var y of [n.getFullYear(),n.getFullYear()+1]){holidays.push(...H.fr(y),...H.ch(y));}
  holidays.sort(function(a,b){return a.date.localeCompare(b.date);});upcoming=holidays.find(function(h){return h.date>=today;});
  if(upcoming)types=[...new Set(holidays.filter(function(h){return h.date===upcoming.date;}).map(function(h){return h.type;}))];
 }
 var hlabel=byId('v72Holiday'),hplace=byId('v72HolidayPlace');
 if(hlabel)hlabel.textContent=upcoming?new Date(upcoming.date+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})+' · '+String(upcoming.title||'Jour férié').replace(/\s*\(NE\)\s*/g,''):'Calendrier des jours fériés indisponible';
 if(hplace)hplace.textContent=types.length?types.map(function(x){return x==='fr'?'France':x==='ch'?'Neuchâtel':x;}).join(' · '):'France · Neuchâtel';
 appointment();
}
refreshData();setInterval(refreshData,2500);doc.addEventListener('visibilitychange',function(){if(!doc.hidden)refreshData();});
/* Existing navigation remains wired to original sections; open their new drawer first. */
doc.addEventListener('click',function(e){
 var el=e.target.closest('[data-go],[data-jump]');if(!el || !doc.contains(el))return;
 var dest=el.dataset.go||el.dataset.jump, mapping={drive:'travel',media:'media',arcade:'games',tools:'tools',discover:'discover'};
 if(dest==='home'){
  e.preventDefault();e.stopImmediatePropagation();
  dashboard.scrollIntoView({behavior:'smooth',block:'start'});
 }else if(mapping[dest])setOpen(mapping[dest],true);
},true);
doc.querySelectorAll('.sidebar [data-go]').forEach(function(btn){
 var dest=btn.dataset.go;
 btn.addEventListener('click',function(){
  doc.querySelectorAll('.sidebar [data-go]').forEach(function(n){n.classList.toggle('active',n===btn);});
 });
});
/* V6.2: Hub banner stays on the Hub. The Digital cockpit already has its own GPS
   speedometer and widgets, so no duplicate banner is moved over it. */
var footer=doc.querySelector('.footer span');if(footer)footer.textContent='AERION • V7.0';
doc.body.classList.add('v6-ready');
})();
