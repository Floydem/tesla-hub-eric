const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORE_KEY = 'ericTeslaHubV4';
const weatherIcons = {
  0:{label:'Ciel dégagé',svg:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>'},
  1:{label:'Peu nuageux',svg:'<path d="M6 15a4 4 0 0 1 1-7.9A5 5 0 0 1 17.5 9 3.5 3.5 0 0 1 18 16H7"/><path d="M12 3v2M6 5l1.4 1.4M18 5l-1.4 1.4"/>'},
  2:{label:'Partiellement nuageux',svg:'<path d="M6 15a4 4 0 0 1 1-7.9A5 5 0 0 1 17.5 9 3.5 3.5 0 0 1 18 16H7"/><path d="M9 4v2M5 6l1.2 1.2"/>'},
  3:{label:'Couvert',svg:'<path d="M6 16a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 10a3.5 3.5 0 0 1-.2 7H6z"/>'},
  45:{label:'Brouillard',svg:'<path d="M4 10h16M3 14h18M5 18h14"/>'},
  48:{label:'Brouillard givrant',svg:'<path d="M4 10h16M3 14h18M5 18h14"/><path d="m10 18-1 2m5-2-1 2"/>'},
  51:{label:'Bruine',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m9 17-1 2m5-2-1 2"/>'},
  53:{label:'Bruine',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m9 17-1 2m5-2-1 2"/>'},
  55:{label:'Bruine forte',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m8 17-1 2m4-2-1 2m4-2-1 2"/>'},
  61:{label:'Pluie faible',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m9 17-1 3m5-3-1 3"/>'},
  63:{label:'Pluie',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m8 17-1 3m4-3-1 3m4-3-1 3"/>'},
  65:{label:'Pluie forte',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m7 17-1 3m4-3-1 3m4-3-1 3m4-3-1 3"/>'},
  71:{label:'Neige faible',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m9 17 0 3m-1.5-1.5h3m4-1.5 0 3m-1.5-1.5h3"/>'},
  73:{label:'Neige',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m8 18 2 0m-1-1v2m4-1 2 0m-1-1v2"/>'},
  75:{label:'Neige forte',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="M8 18h2M9 17v2M13 18h2M14 17v2M18 18h2M19 17v2"/>'},
  80:{label:'Averses',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m9 17-1 3m5-3-1 3"/>'},
  81:{label:'Averses',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m8 17-1 3m4-3-1 3m4-3-1 3"/>'},
  82:{label:'Fortes averses',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m7 17-1 3m4-3-1 3m4-3-1 3m4-3-1 3"/>'},
  95:{label:'Orage',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m12 16-2 4h2l-1 2 4-5h-2l1-3z"/>'},
  96:{label:'Orage & grêle',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m12 16-2 4h2l-1 2 4-5h-2l1-3z"/><circle cx="8" cy="19" r="1"/>'},
  99:{label:'Orage violent',svg:'<path d="M6 13a4 4 0 0 1 .8-7.9A5.5 5.5 0 0 1 18 7a3.5 3.5 0 0 1-.2 7H6z"/><path d="m12 16-2 4h2l-1 2 4-5h-2l1-3z"/><circle cx="8" cy="19" r="1"/><circle cx="16" cy="19" r="1"/>'}
};
function store(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch(e){return {}}}
function saveStore(data){localStorage.setItem(STORE_KEY, JSON.stringify(data))}
function ensureStore(){const s = store();if(!s.custom) s.custom=[];if(!s.mode) s.mode='drive';if(!s.themePulse) s.themePulse='normal';saveStore(s)}
ensureStore();
function updateClock(){const now = new Date();$('#clock').textContent = now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});$('#date').textContent = now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
updateClock(); setInterval(updateClock, 1000);
function updateOnline(){$('#onlineText').textContent = navigator.onLine ? 'En ligne' : 'Hors ligne';$('.dot').style.background = navigator.onLine ? 'var(--green)' : '#f6b04d'}
window.addEventListener('online', updateOnline); window.addEventListener('offline', updateOnline); updateOnline();
function setMode(mode){const s = store(); s.mode = mode; saveStore(s);document.body.classList.toggle('drive-mode', mode==='drive');$$('.modeBtn').forEach(btn=>btn.classList.toggle('active', btn.dataset.mode===mode));const summary = $('#modeSummary');if(summary) summary.textContent = mode==='drive' ? 'Conduite' : 'Détente'}
const modeState = store().mode || 'drive'; setMode(modeState);$$('.modeBtn').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));
function setThemePulse(){const s = store();document.body.classList.toggle('pulse-mode', s.themePulse==='boost')}
$('#themePulse').addEventListener('click', ()=>{const s = store(); s.themePulse = s.themePulse==='boost' ? 'normal' : 'boost'; saveStore(s); setThemePulse()});setThemePulse();
function updateCharge(){const soc = +$('#soc').value, target = +$('#target').value, power = +$('#power').value, kwh = +$('#kwh').value;if(target<=soc || power<=0 || kwh<=0){$('#estimate').textContent = 'Entre une cible supérieure au niveau actuel pour obtenir une estimation.';$('#miniCharge').textContent = '--';return}const energy = ((target-soc)/100)*kwh;const totalHours = energy/power;const h = Math.floor(totalHours);const m = Math.round((totalHours-h)*60);$('#estimate').innerHTML = `≈ <strong>${energy.toFixed(1)} kWh</strong> à ajouter • environ <strong>${h} h ${String(m).padStart(2,'0')}</strong> à ${power.toFixed(1)} kW`;$('#miniCharge').textContent = `${h}h${String(m).padStart(2,'0')}`}
['soc','target','power','kwh'].forEach(id=>$('#'+id).addEventListener('input', updateCharge));updateCharge();
function weatherIcon(code){return weatherIcons[code] || weatherIcons[0]}
function renderWeatherGlyph(svg, el){el.innerHTML = svg}
async function fetchWeather(lat, lon){try{const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=2&timezone=auto`;const res = await fetch(url); const data = await res.json();const cur = data.current; const info = weatherIcon(cur.weather_code);$('#weatherTemp').textContent = Math.round(cur.temperature_2m) + '°';$('#weatherLabel').textContent = info.label;$('#weatherLocation').textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;$('#weatherFeel').textContent = Math.round(cur.apparent_temperature) + '°';$('#weatherWind').textContent = Math.round(cur.wind_speed_10m) + ' km/h';renderWeatherGlyph(info.svg, $('#weatherGlyphSvg').parentElement);const now = new Date();let idx = 0;for(let i=0;i<data.hourly.time.length;i++){if(new Date(data.hourly.time[i]) >= now){idx=i;break}}const rain = data.hourly.precipitation_probability[idx] ?? 0;$('#weatherRain').textContent = rain + '%';$('#miniWeather').textContent = Math.round(cur.temperature_2m) + '°';$('#miniWind').textContent = Math.round(cur.wind_speed_10m) + ' km/h';$('#miniRain').textContent = rain + '%';const hourly = [];for(let i=idx;i<Math.min(idx+6, data.hourly.time.length);i++){const d = new Date(data.hourly.time[i]);const inf = weatherIcon(data.hourly.weather_code[i]);hourly.push(`<div class="hour"><div>${d.getHours()}h</div><div class="ic"><svg viewBox="0 0 24 24">${inf.svg}</svg></div><strong>${Math.round(data.hourly.temperature_2m[i])}°</strong><span>${data.hourly.precipitation_probability[i]}%</span></div>`)}$('#hourly').innerHTML = hourly.join('');const s = store(); s.lastPos = {lat,lon}; saveStore(s)}catch(e){$('#weatherLocation').textContent = 'Météo indisponible'}}
function updateWeather(){const fallback = ()=>{const s=store();if(s.lastPos) fetchWeather(s.lastPos.lat, s.lastPos.lon);else $('#weatherLocation').textContent='Autorise la localisation pour la météo locale'};if(!navigator.geolocation){fallback();return}navigator.geolocation.getCurrentPosition(pos=>fetchWeather(pos.coords.latitude,pos.coords.longitude), fallback, {timeout:8000,maximumAge:600000})}
$('#refreshWeather').addEventListener('click', updateWeather);updateWeather();
function openModal(id){ $('#'+id).classList.add('show') }
function closeModals(){ $$('.modal').forEach(m=>m.classList.remove('show')) }
$$('[data-close]').forEach(btn=>btn.addEventListener('click', closeModals));$$('.modal').forEach(m=>m.addEventListener('click', e=>{if(e.target===m) closeModals()}));$('#addQuick').addEventListener('click', ()=>openModal('addModal'));$('#openAdd').addEventListener('click', ()=>{closeModals(); openModal('addModal')});
function escapeHtml(str){return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
function sectionNames(){return {drive:'Conduite', media:'Médias', games:'Jeux', discover:'Découvrir', tools:'Tesla & outils'}}
function sectionTargets(){return {drive:'.quickGrid', media:'#mediaGrid', games:'#gamesGrid', discover:'#discoverGrid', tools:'#toolsGrid'}}
function tileTemplate(item){return item.section==='drive'?`<a class="quickTile userTile" href="${item.url}" target="_blank" rel="noopener"><span>${escapeHtml(item.name)}</span><small>Raccourci personnalisé</small></a>`:`<a class="tile userTile" href="${item.url}" target="_blank" rel="noopener"><span class="arrow">↗</span><div class="icon"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></div><div><strong>${escapeHtml(item.name)}</strong><br><small>Raccourci personnalisé.</small></div></a>`}
function renderCustom(){$$('.userTile').forEach(el=>el.remove());const s = store();s.custom.forEach(item=>{const target = document.querySelector(sectionTargets()[item.section] || '#toolsGrid');if(target){ target.insertAdjacentHTML('beforeend', tileTemplate(item)) }})}
function renderManageList(){const s = store();const html = s.custom.length ? s.custom.map((item, idx)=>`<div class="customItem"><div class="meta"><strong>${escapeHtml(item.name)}</strong><span>${sectionNames()[item.section] || item.section} • ${escapeHtml(item.url)}</span></div><button data-del="${idx}">Supprimer</button></div>`).join('') : `<div class="customItem"><div class="meta"><strong>Aucun raccourci personnalisé</strong><span>Ajoute tes propres sites dans la section de ton choix.</span></div></div>`;$('#customList').innerHTML = html;$$('#customList [data-del]').forEach(btn=>btn.addEventListener('click',()=>{const st=store(); st.custom.splice(+btn.dataset.del,1); saveStore(st); renderCustom(); renderManageList()}))}
function openManage(){ renderManageList(); openModal('manageModal') }
$$('[data-manage]').forEach(btn=>btn.addEventListener('click', openManage));
$('#saveCustom').addEventListener('click', ()=>{const name = $('#newName').value.trim();const url = $('#newUrl').value.trim();const section = $('#newSection').value;if(!name || !/^https?:\/\//i.test(url)){ alert('Ajoute un nom et une adresse commençant par https://'); return }const s = store(); s.custom.push({name, url, section}); saveStore(s);$('#newName').value=''; $('#newUrl').value=''; $('#newSection').value='drive';renderCustom(); closeModals()});
renderCustom();
function goTo(id){if(['media','arcade','discover'].includes(id) && document.body.classList.contains('drive-mode')){setMode('lounge')}const el = document.getElementById(id);if(el) el.scrollIntoView({behavior:'smooth',block:'start'});$$('.nav').forEach(btn=>btn.classList.toggle('active', btn.dataset.go===id))}
$$('[data-go]').forEach(btn=>btn.addEventListener('click', ()=>goTo(btn.dataset.go)));
const sectionObserver = new IntersectionObserver(entries=>{const vis = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!vis) return;const id = vis.target.id;$$('.nav').forEach(btn=>btn.classList.toggle('active', btn.dataset.go===id))}, {threshold:[0.3,0.55,0.8]});
['home','drive','media','arcade','discover','tools'].forEach(id=>{ const el=document.getElementById(id); if(el) sectionObserver.observe(el) });
