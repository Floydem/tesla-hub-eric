(()=>{
'use strict';
const H=window.HUB_HOLIDAYS;
if(!H)return;
const floating=document.getElementById('floatingCockpit');
if(!floating)return;

function nextHoliday(){
  const now=new Date();
  const today=H.iso(now);
  const years=[now.getFullYear(),now.getFullYear()+1];
  const all=years.flatMap(y=>[...H.fr(y),...H.ch(y)]).filter(x=>x.date>=today);
  all.sort((a,b)=>a.date.localeCompare(b.date));
  if(!all.length)return null;
  const date=all[0].date;
  const same=all.filter(x=>x.date===date);
  return {date,events:same};
}
function niceDate(iso){
  const [y,m,d]=iso.split('-').map(Number);
  return new Date(y,m-1,d).toLocaleDateString('fr-FR',{day:'numeric',month:'short'}).replace('.','');
}
function render(){
  let box=document.getElementById('floatHoliday');
  if(!box){
    box=document.createElement('button');
    box.type='button';
    box.id='floatHoliday';
    box.className='fcHoliday';
    box.title='Jours fériés officiels du canton de Neuchâtel et de France. Ouvrir l’agenda.';
    floating.appendChild(box);
    box.onclick=()=>document.getElementById('openAgenda')?.click();
  }
  const n=nextHoliday();
  if(!n){box.style.display='none';return;}
  box.style.display='flex';
  const hasFR=n.events.some(x=>x.type==='fr');
  const hasCH=n.events.some(x=>x.type==='ch');
  const titles=[...new Set(n.events.map(x=>x.title.replace(/\s*\(NE\)\s*/g,'').trim()))];
  const badges=(hasFR?'<span class="holidayBadge fr">FR</span>':'')+(hasCH?'<span class="holidayBadge ch">NE</span>':'');
  box.innerHTML=`<span class="fcLabel">Prochain férié</span><strong><span class="holidayDate">${niceDate(n.date)}</span>${badges}</strong><small>${titles.slice(0,2).join(' • ')}</small>`;
}
render();
setInterval(render,30*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
const footer=document.querySelector('.footer span');if(footer)footer.innerHTML='Eric Tesla Hub • <span style="color:#ff8b8f">V5.0</span>';
})();