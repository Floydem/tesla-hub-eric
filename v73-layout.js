/* AERION V7.3: rearrange existing Digital cockpit, preserving its sources.
   No Telegram token/login/messages are requested or stored by this shortcut. */
(()=>{
 'use strict';
 const root=document.getElementById('immersiveCockpit');
 const stage=root?.querySelector('#v52Stage');
 const today=stage?.querySelector('.v52Today');
 const agenda=stage?.querySelector('.v52Agenda');
 const weather=stage?.querySelector('.v65Weather');
 const watch=stage?.querySelector('.v70RiskCard');
 if(!root||!stage||!today||!agenda||!weather||!watch||root.classList.contains('v73Layout'))return;
 root.classList.add('v73Layout');
 const brand=root.querySelector('.cockpitBrand');
 if(brand){
   const title=brand.querySelector('strong');
   const subtitle=brand.querySelector('small');
   if(title)title.textContent='AERION';
   if(subtitle)subtitle.textContent='Cockpit Digital · vitesse GPS indicative';
 }
 const back=root.querySelector('#cockpitClose');
 if(back)back.textContent='← Retour au Hub';
 const dateSource=today.querySelector('.v52Date');
 const dateDisplay=document.createElement('span');
 dateDisplay.className='v73AgendaToday';
 dateDisplay.setAttribute('aria-label','Date actuelle');
 const agendaHeader=agenda.querySelector('header');
 if(agendaHeader)agendaHeader.insertAdjacentElement('afterend',dateDisplay);
 else agenda.prepend(dateDisplay);
 function syncDate(){
   const value=dateSource?.textContent?.trim();
   dateDisplay.textContent=value&&value!=='Date en attente'?value:'Date en attente';
 }
 if(dateSource)new MutationObserver(syncDate).observe(dateSource,{childList:true,characterData:true,subtree:true});
 syncDate();
 const telegram=document.createElement('a');
 telegram.className='v73Telegram';
 telegram.href='https://web.telegram.org/';
 telegram.target='_blank';
 telegram.rel='noopener noreferrer';
 telegram.setAttribute('aria-label','Ouvrir Telegram Web dans un nouvel onglet, à l’arrêt');
 telegram.innerHTML='<span class="v73TelegramIcon" aria-hidden="true">➤</span><span class="v73TelegramBody"><strong>Telegram</strong><small>Ouvrir mes messages ↗</small></span>';
 stage.appendChild(telegram);
 const footer=document.querySelector('.footer span');
 if(footer)footer.textContent='AERION • V7.3';
})();