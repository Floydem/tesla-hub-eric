/* AERION V9: isolated presentation. All original data providers remain alive. */
(()=>{'use strict';
const root=document.getElementById('immersiveCockpit'),hub=document.getElementById('v6Dashboard');if(!root||!hub)return;
root.classList.add('v9Cockpit');hub.classList.add('v9Hub');
const view=document.createElement('section');view.className='v9View';view.setAttribute('aria-label','Cockpit AERION');
view.innerHTML='<header class="v9Head"><div class="v9Identity"><strong>AERION</strong><button type="button" class="v9Back">← Retour au Hub</button></div><div class="v9Clock"><strong id="v9Clock">--:--</strong><span id="v9Date">Date</span></div><div class="v9Weather"><span>MÉTÉO LOCALE</span><strong id="v9Weather">--°</strong><small id="v9WeatherDesc">Chargement…</small></div></header><div class="v9Instrument"><div class="v9Ticks"></div><div class="v9Needle"></div><div class="v9SpeedInfo"><span>VITESSE GPS INDICATIVE</span><strong id="v9Speed">0</strong><small>km/h</small></div><div class="v9Scale"><span>0</span><span>220</span></div></div><footer class="v9Foot"><div><small>HEURE LOCALE</small><strong id="v9FootTime">--:--</strong></div><a href="https://web.telegram.org/" target="_blank" rel="noopener noreferrer">✈ Telegram <span>Ouvrir les messages ↗</span></a><div><small>DONNÉES GPS</small><strong>Indicatives</strong></div></footer>';
root.appendChild(view);
view.querySelector('.v9Back').addEventListener('click',()=>document.getElementById('cockpitClose')?.click());
const ticks=view.querySelector('.v9Ticks');for(let i=0;i<=44;i++){const t=document.createElement('i');t.style.transform='rotate('+(-130+i*260/44)+'deg) translateY(-50%)';t.className=i%5===0?'major':'';ticks.appendChild(t)}
const speedNode=document.getElementById('cockpitSpeed');
const weatherNode=root.querySelector('.v65Weather');
const clockNode=root.querySelector('.v52Today');
const weatherText=()=>weatherNode?.innerText||'';
function sync(){
 const raw=(speedNode?.textContent||'0').trim();const n=Number(raw.replace(',','.'));const speed=Number.isFinite(n)?Math.max(0,Math.round(n)):0;
 view.querySelector('#v9Speed').textContent=String(speed);
 view.querySelector('.v9Needle').style.transform='rotate('+(-130+Math.min(speed,220)*260/220)+'deg)';
 const date=new Date();const fmt=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit'}).format(date);view.querySelector('#v9Clock').textContent=fmt;view.querySelector('#v9FootTime').textContent=fmt;
 view.querySelector('#v9Date').textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(date);
 const w=weatherText();const temp=w.match(/-?\d{1,2}\s*°/);view.querySelector('#v9Weather').textContent=temp?temp[0]:'--°';
 const desc=weatherNode?.querySelector('.v65WeatherDesc,.v65Condition,.v65WeatherLabel');view.querySelector('#v9WeatherDesc').textContent=desc?.textContent?.trim()||'Conditions locales';
}
sync();setInterval(sync,2000);
const logo=hub.querySelector('.velomBrand');if(logo){logo.setAttribute('aria-label','AERION');}
const foot=document.querySelector('.footer span');if(foot)foot.textContent='AERION • V9';
})();