(()=>{
  const grid=document.getElementById('gamesGrid');
  if(grid){
    const root=location.origin+location.pathname.replace(/\/[^/]*$/,'/');
    const games=[
      {name:'Family Arcade',url:root+'family-arcade/',desc:'Quiz, Petit Bac, dessin, Timeline, réflexes et Pixel Reveal.',icon:'🎉'},
      {name:'Volt Runner',url:root+'finger-drift/',desc:'Endless runner tactile : saute les obstacles et bats ton record.',icon:'⚡'}
    ];
    const exists=name=>[...grid.querySelectorAll('strong')].some(x=>x.textContent.trim()===name);
    games.slice().reverse().forEach(g=>{
      if(exists(g.name))return;
      const a=document.createElement('a');
      a.className='tile';
      a.href=g.url;
      a.innerHTML=`<span class="arrow">→</span><div class="icon appIcon" style="font-size:24px">${g.icon}</div><div><strong>${g.name}</strong><br><small>${g.desc}</small></div>`;
      grid.prepend(a);
    });
  }

  const arcade=document.querySelector('#arcade .head p');
  if(arcade)arcade.textContent='Family Arcade, Volt Runner et les meilleurs jeux web.';

  // GPS-based G force is not reliable enough in the Tesla browser, so remove it from the UI.
  const gTile=document.querySelector('.gMain');
  if(gTile)gTile.remove();

  const floating=document.getElementById('floatingCockpit');
  if(floating){
    [...floating.children].forEach(child=>{
      const label=child.querySelector('.fcLabel');
      if(label && /force\s*g/i.test(label.textContent)) child.remove();
    });
  }

  // Rebalance the cockpit around the useful information: speed, clock/weather and conditions.
  const style=document.createElement('style');
  style.id='v462NoGLayout';
  style.textContent=`
    .driveHeroLayout{grid-template-columns:1.08fr .92fr 1.45fr!important;gap:14px!important;align-items:stretch!important}
    .driveStatsPatch{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
    .driveStatsPatch div{min-height:58px;display:flex;flex-direction:column;justify-content:center}
    .gpsMain{display:flex;flex-direction:column;justify-content:center}
    .clockPanel{display:flex;flex-direction:column;justify-content:center}
    .floatingCockpit{gap:30px!important;padding-left:24px!important;padding-right:24px!important}
    .floatingCockpit>div:first-child{min-width:150px!important}
    .floatingCockpit>div:nth-child(2){min-width:125px!important}
    .floatingCockpit .fcWeather{margin-left:auto!important;min-width:180px!important;text-align:right}
    @media(max-width:1200px){
      .driveHeroLayout{grid-template-columns:1fr 1fr!important}
      .driveStatsPatch{grid-column:1/-1!important;grid-template-columns:repeat(4,minmax(0,1fr))!important}
      .floatingCockpit{gap:22px!important}
    }
    @media(max-width:820px){
      .driveHeroLayout{grid-template-columns:1fr 1fr!important}
      .driveStatsPatch{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .floatingCockpit>div:first-child,.floatingCockpit>div:nth-child(2){min-width:auto!important}
    }
  `;
  document.head.appendChild(style);

  const footer=document.querySelector('.footer span');
  if(footer)footer.innerHTML='Eric Tesla Hub • <span style="color:#ff8b8f">V4.6.2</span>';
})();