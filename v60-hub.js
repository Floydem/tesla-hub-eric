/* Tesla Hub V6.0: new presentation around existing, untouched feature sections. */
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
var dashboard=doc.createElement('section');dashboard.id='v6Dashboard';dashboard.setAttribute('aria-label','Tesla Hub version 6');
dashboard.innerHTML=
 '<header class="v6Banner" id="v6Banner">'+
 '<div class="v6Sky" aria-hidden="true"><i class="v6Mountains"></i><i class="v6Road"></i></div>'+
 '<div class="v6BannerLeft"><strong id="v6Clock">--:--</strong><small id="v6Date">Date en attente</small>'+
 '<div class="v6BannerWeather"><span aria-hidden="true">☁</span><div><strong id="v6Weather">--°</strong><small id="v6Condition">Météo locale indisponible</small></div></div></div>'+
 '<div class="v6BannerCenter"><span>VITESSE GPS INDICATIVE</span><div><strong id="v6Speed">--</strong><small>km/h</small></div><small id="v6SpeedState">En attente du GPS</small></div>'+
 '<div class="v6BannerRight"><div class="v6Journey"><small>TRAJET DEPUIS L’OUVERTURE</small><strong><span id="v6Distance">0,0</span> km</strong><span id="v6TripState">En attente du GPS</span></div><div class="v6Next"><small>PRÉVISION +1 H</small><strong id="v6NextWeather">En attente de la météo</strong></div></div>'+
 '<div class="v6BannerNote">Navigation et données Tesla non accessibles au navigateur. Vitesse et distance GPS indicatives.</div>'+
 '</header>'+
 '<div class="v6Titlebar"><div><div class="v6Eyebrow">FLOYDEM · ÉDITION V6.0</div><h1>Tesla Hub</h1><p>Vos applications, contenus et outils. Pensé pour la route et les pauses.</p></div>'+
 '<div class="v6TitleActions"><button type="button" id="v6CockpitBtn">'+icon('shield')+' Cockpit digital</button><button type="button" id="v6AgendaBtn">'+icon('calendar')+' Agenda</button><button type="button" id="v6SettingsBtn">'+icon('tools')+' Paramètres</button></div></div>'+
 '<div class="v6Intro"><article class="v6Widget v6WeatherWidget"><div class="v6WidgetHead">'+icon('travel')+' <span>Météo locale</span><button type="button" id="v6RefreshWx" aria-label="Actualiser la météo">↻</button></div><div class="v6WidgetNumber" id="v6WeatherLarge">--°</div><span id="v6WeatherDescription">Prévisions indisponibles</span><div class="v6SmallLine" id="v6WeatherDetails">Mini / maxi : --</div></article>'+
 '<article class="v6Widget v6AgendaWidget"><div class="v6WidgetHead">'+icon('calendar')+' <span>Agenda</span><button type="button" id="v6CalendarOpen">Ouvrir ↗</button></div><div id="v6Appointment" class="v6Appointment">Aucun rendez-vous à venir</div><div id="v6AppointmentWhen" class="v6SmallLine">Mes rendez-vous enregistrés dans ce navigateur</div></article>'+
 '<article class="v6Widget v6TripWidget"><div class="v6WidgetHead">'+icon('bolt')+' <span>Mon trajet</span><button type="button" id="v6TripReset">Réinitialiser</button></div><div class="v6WidgetNumber"><span id="v6TripCard">0,0</span><small> km</small></div><span id="v6TripCardState">Distance GPS depuis l’ouverture</span><div class="v6SmallLine">Le navigateur n’accède pas à la batterie ou à l’autonomie Tesla.</div></article></div>'+
 '<div class="v6DrawerList" id="v6DrawerList"></div>'+
 '<p class="v6Safety">Vidéos et jeux sont réservés aux moments où le véhicule est à l’arrêt. Ce site ne commande pas les fonctions de sécurité du véhicule.</p>';
main.insertBefore(dashboard,main.firstChild);
var drawers=byId('v6DrawerList');
var groups=[
 {id:'media',name:'Multimédia',desc:'Musique, vidéos et contenus en streaming',source:'media',symbol:'media'},
 {id:'games',name:'Jeux',desc:'Family Arcade, Finger Drift et tous vos jeux',source:'arcade',symbol:'games'},
 {id:'travel',name:'Voyage',desc:'Navigation, météo, agenda et infos en temps réel',source:'drive',symbol:'travel'},
 {id:'tools',name:'Outils',desc:'Utilitaires, Tesla et personnalisations',source:'tools',symbol:'tools'},
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
   '<a href="https://www.tesla.com/findus" target="_blank" rel="noopener noreferrer">⚡ Bornes Tesla</a>'+
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
byId('v6TripReset').onclick=resetTrip;
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
 field('#fcWxNext','v6NextWeather','Prévision indisponible');field('#miniRange','v6WeatherDetails','Mini / maxi indisponibles');
 byId('v6SpeedState').textContent=byId('gpsStateHero')?.textContent?.trim()||'GPS en attente';
 appointment();
}
refreshData();setInterval(refreshData,2500);doc.addEventListener('visibilitychange',function(){if(!doc.hidden)refreshData();});
/* Separate trip display, GPS only. Reject inaccurate fixes, stale fixes and implausible jumps. */
var last=null,meters=0,fixAt=0,watch=null;
function resetTrip(){last=null;meters=0;fixAt=0;drawTrip();}
function drawTrip(){
 var km=(meters/1000).toLocaleString('fr-FR',{minimumFractionDigits:1,maximumFractionDigits:1});
 byId('v6Distance').textContent=km;byId('v6TripCard').textContent=km;
 var state=fixAt?Date.now()-fixAt>20000?'GPS interrompu':'Trajet GPS indicatif':'En attente du GPS';
 byId('v6TripState').textContent=state;byId('v6TripCardState').textContent=state;
}
function metres(a,b){
 var R=6371000,r=Math.PI/180,dp=(b.lat-a.lat)*r,dl=(b.lon-a.lon)*r;
 var v=Math.sin(dp/2)*Math.sin(dp/2)+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dl/2)*Math.sin(dl/2);
 return 2*R*Math.asin(Math.min(1,Math.sqrt(v)));
}
function gps(p){
 var c=p.coords,now=Date.now();
 if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude))return;
 var fix={lat:c.latitude,lon:c.longitude,t:p.timestamp||now,accuracy:c.accuracy||999};
 if(last){
  var dt=(fix.t-last.t)/1000,dist=metres(last,fix);
  if(dt>.5&&dt<30&&fix.accuracy<70&&last.accuracy<70&&dist>Math.max(7,(fix.accuracy+last.accuracy)*.32)&&dist/dt<55){meters+=dist;}
 }
 last=fix;fixAt=now;drawTrip();
}
if(navigator.geolocation){watch=navigator.geolocation.watchPosition(gps,function(e){
 byId('v6TripState').textContent=e.code===1?'Localisation non autorisée':'Signal GPS indisponible';
 byId('v6TripCardState').textContent=byId('v6TripState').textContent;
 },{enableHighAccuracy:true,maximumAge:2000,timeout:15000});}
else {byId('v6TripState').textContent='GPS non disponible';byId('v6TripCardState').textContent='GPS non disponible';}
setInterval(drawTrip,10000);
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
/* One shared banner element, not two lookalikes: it moves into Digital cockpit
   and returns to the Hub on close or when another existing cockpit theme is chosen. */
var digitalRoot=byId('immersiveCockpit'),sharedBanner=byId('v6Banner');
function placeSharedBanner(){
 if(!digitalRoot||!sharedBanner)return;
 var inDigital=digitalRoot.classList.contains('isOpen')&&digitalRoot.dataset.cockpitStyle==='J';
 if(inDigital){
  if(sharedBanner.parentElement!==digitalRoot)digitalRoot.appendChild(sharedBanner);
  if(!digitalRoot.classList.contains('v6SharedBannerOpen'))digitalRoot.classList.add('v6SharedBannerOpen');
 }else{
  if(digitalRoot.classList.contains('v6SharedBannerOpen'))digitalRoot.classList.remove('v6SharedBannerOpen');
  if(sharedBanner.parentElement!==dashboard)dashboard.insertBefore(sharedBanner,dashboard.firstChild);
 }
}
if(digitalRoot&&sharedBanner){
 new MutationObserver(placeSharedBanner).observe(digitalRoot,{attributes:true,attributeFilter:['class','data-cockpit-style']});
 digitalRoot.addEventListener('hub:cockpit-style',placeSharedBanner);
 placeSharedBanner();
}
var footer=doc.querySelector('.footer span');if(footer)footer.textContent='Eric Tesla Hub • V6.1';
doc.body.classList.add('v6-ready');
})();
