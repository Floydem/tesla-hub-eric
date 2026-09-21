(()=>{
'use strict';
const $$=s=>[...document.querySelectorAll(s)];
const dock=document.querySelector('.dock');
if(dock){
  // One easily accessible sound launcher, containing both independent sound applications.
  const old=[...dock.querySelectorAll('a')].find(x=>/dribe\.app/i.test(x.href));
  if(old){
    const wrap=document.createElement('div');wrap.className='dockSoundWrap';
    const btn=document.createElement('button');btn.type='button';btn.className='dockBtn dockSoundBtn';
    btn.id='dockSoundBtn';btn.title='Sons moteur : Dribe et Rupteur';btn.setAttribute('aria-label','Sons moteur');
    btn.setAttribute('aria-expanded','false');
    btn.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h3l2-3h8l2 3h3v8h-3l-2 2H8l-2-2H3zM9 10h6M9 14h6M21 5l2-2M1 5l2 2"/></svg><span>Sons moteur</span>';
    wrap.appendChild(btn);old.replaceWith(wrap);
    const menu=document.createElement('div');menu.id='hubSoundMenu';menu.className='soundMenu';menu.hidden=true;
    menu.innerHTML='<div class="soundMenuTitle">Simulateurs de sons moteur</div><a href="https://dribe.app/" target="_blank" rel="noopener noreferrer">🏎️ Dribe <small>Ouvrir le simulateur de moteur</small></a><a href="https://rupteur.app/app" target="_blank" rel="noopener noreferrer">⚡ Rupteur <small>Ouvrir le simulateur de moteur dans le navigateur Tesla</small></a>';
    document.body.appendChild(menu);
    function hide(){menu.hidden=true;btn.setAttribute('aria-expanded','false')}
    function position(){const r=btn.getBoundingClientRect(),width=Math.min(370,innerWidth-24);menu.style.width=width+'px';menu.style.left=Math.max(12,Math.min(innerWidth-width-12,r.right-width))+'px';const h=menu.offsetHeight||176;menu.style.top=(r.top>h+14?r.top-h-10:Math.min(innerHeight-h-10,r.bottom+10))+'px'}
    btn.addEventListener('click',e=>{e.stopPropagation();const show=menu.hidden;menu.hidden=!show;btn.setAttribute('aria-expanded',String(show));if(show)position()});
    menu.addEventListener('click',e=>e.stopPropagation());
    document.addEventListener('click',hide);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
    addEventListener('scroll',hide,{passive:true});
    addEventListener('resize',()=>{if(!menu.hidden)position()});
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',hide));
  }
}

// Keep Rupteur next to Dribe in the full tools catalog as well as the compact dock menu.
const toolsGrid=document.getElementById('toolsGrid');
if(toolsGrid && !toolsGrid.querySelector('[data-hub-rupteur]')){
  const a=document.createElement('a');
  a.className='tile externalLink';a.href='https://rupteur.app/app';
  a.target='_blank';a.rel='noopener noreferrer';a.dataset.hubRupteur='1';
  a.innerHTML='<span class="arrow">↗</span><div class="icon appIcon" aria-hidden="true">🔊</div><div><strong>Rupteur</strong><br><small>Simulateur de sons moteur pour Tesla.</small></div>';
  toolsGrid.appendChild(a);
}

// Personalization inspired by the idea of an editable launchpad, implemented independently.
// Uses visible move buttons rather than drag-only gestures for the Tesla touch screen.
const panels=[
  ['drive','#driveGrid'],
  ['media','#mediaGrid'],
  ['arcade','#gamesGrid'],
  ['discover','#discoverGrid'],
  ['tools','#toolsGrid']
];
const KEY='ericTeslaHubTileOrderV1';
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
let editing=false,arrangeScheduled=false;
function directTiles(grid){return [...grid.children].filter(x=>x.matches('.tile,.quickTile'))}
function tileKey(el){const a=el.getAttribute('href')||el.dataset.folder||'custom';const label=el.querySelector('strong')?.textContent||el.querySelector('span:not(.arrow)')?.textContent||el.textContent;return (a+'|'+(label||'').trim()).slice(0,500)}
function store(id,grid){saved[id]=directTiles(grid).map(tileKey);try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){}}
function applyOrder(id,grid){
  const order=saved[id];if(!Array.isArray(order)||!order.length)return;
  const items=directTiles(grid),index=x=>{const k=order.indexOf(tileKey(x));return k===-1?Number.MAX_SAFE_INTEGER:k};
  const sorted=items.slice().sort((a,b)=>index(a)-index(b));
  if(sorted.some((node,i)=>items[i]!==node))sorted.forEach(node=>grid.appendChild(node));
}
function updateControls(grid){
  const tiles=directTiles(grid);
  tiles.forEach((tile,i)=>{
    let box=tile.querySelector(':scope > .hubOrderTools');
    if(!box){
      box=document.createElement('span');box.className='hubOrderTools';
      box.innerHTML='<span role="button" tabindex="0" data-move="-1" aria-label="Déplacer vers le début" title="Déplacer avant">‹</span><span role="button" tabindex="0" data-move="1" aria-label="Déplacer vers la fin" title="Déplacer après">›</span>';
      tile.appendChild(box);
    }
    box.children[0].setAttribute('aria-disabled',String(i===0));
    box.children[1].setAttribute('aria-disabled',String(i===tiles.length-1));
  });
}
function shift(id,grid,tile,delta){
  const items=directTiles(grid),i=items.indexOf(tile),j=i+delta;
  if(i<0||j<0||j>=items.length)return;
  if(delta<0)grid.insertBefore(tile,items[j]);
  else grid.insertBefore(items[j],tile);
  store(id,grid);updateControls(grid);
}
function refresh(){
  for(const [id,selector] of panels){const grid=document.querySelector(selector);if(!grid)continue;applyOrder(id,grid);updateControls(grid)}
}
for(const [id,selector] of panels){
  const grid=document.querySelector(selector);if(!grid)continue;
  const section=grid.closest('section');const head=section?.querySelector('.head');
  if(head){
    const b=document.createElement('button');b.type='button';b.className='hubArrangeBtn';b.textContent='Organiser';b.dataset.organizer=id;head.appendChild(b);
    b.onclick=()=>{
      editing=!editing;
      document.body.classList.toggle('hubTileEdit',editing);
      $$('.hubArrangeBtn').forEach(x=>{x.classList.toggle('active',editing);x.textContent=editing?'Terminer':'Organiser'});
      refresh();
    };
    const hint=document.createElement('div');hint.className='hubArrangeHint';hint.textContent='Touchez les flèches sur chaque tuile pour la déplacer, puis Terminer. Les positions sont mémorisées dans ce navigateur.';
    head.insertAdjacentElement('afterend',hint);
  }
  grid.addEventListener('click',e=>{
    if(!editing)return;
    const tile=e.target.closest('.tile,.quickTile');if(!tile||tile.parentElement!==grid)return;
    e.preventDefault();e.stopPropagation();
    const arrow=e.target.closest('[data-move]');
    if(arrow && arrow.getAttribute('aria-disabled')!=='true')shift(id,grid,tile,Number(arrow.dataset.move));
  },true);
  grid.addEventListener('keydown',e=>{
    if(!editing || !['Enter',' '].includes(e.key))return;
    const arrow=e.target.closest('[data-move]');if(!arrow)return;
    e.preventDefault();e.stopPropagation();
    if(arrow.getAttribute('aria-disabled')==='true')return;
    const tile=arrow.closest('.tile,.quickTile');if(tile)shift(id,grid,tile,Number(arrow.dataset.move));
  },true);
  new MutationObserver(()=>{
    if(arrangeScheduled)return;
    arrangeScheduled=true;
    requestAnimationFrame(()=>{arrangeScheduled=false;applyOrder(id,grid);updateControls(grid)});
  }).observe(grid,{childList:true});
}
refresh();
const footer=document.querySelector('.footer span');
if(footer)footer.textContent='Eric Tesla Hub • V4.8';
})();