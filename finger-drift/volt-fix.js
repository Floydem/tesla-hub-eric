(()=>{
// Volt Runner v2.1 patch: input, jump physics and a more Model Y-like crossover silhouette.
car.w=108;
car.h=44;

// The Tesla browser can emit pointer + touch events for one tap. The old code listened to both,
// which could consume both jumps on the first tap. Keep one input path only.
try{c.removeEventListener('pointerdown',handle);c.removeEventListener('touchstart',handle)}catch(e){}
const voltTap=e=>{e.preventDefault();jump()};
if('PointerEvent' in window)c.addEventListener('pointerdown',voltTap,{passive:false});
else c.addEventListener('touchstart',voltTap,{passive:false});

// Higher, longer first jump + useful second jump.
jump=function(){
  if(!running)return;
  if(car.jumps===0){
    car.vy=-850;
    car.jumps=1;
  }else if(car.jumps===1){
    car.vy=-760;
    car.jumps=2;
  }else return;
  for(let i=0;i<9;i++)particles.push({x:car.x+25,y:car.y+car.h,vx:rand(-105,-25),vy:rand(-95,25),life:1});
};

// Side silhouette inspired by a modern fastback electric crossover, with Model Y-like proportions.
drawCar=function(){
  const gy=groundY(),air=(gy-car.h)-car.y;
  ctx.save();
  ctx.translate(car.x+car.w/2,car.y+car.h/2);
  ctx.rotate(car.tilt);

  // ground/body shadow
  ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=13;ctx.shadowOffsetY=7;

  // main QuickSilver body
  const grad=ctx.createLinearGradient(-54,-22,54,20);
  grad.addColorStop(0,'#9fa7ad');grad.addColorStop(.35,'#e0e4e7');grad.addColorStop(.72,'#bcc4ca');grad.addColorStop(1,'#8e979e');
  ctx.fillStyle=grad;
  ctx.beginPath();
  ctx.moveTo(-52,7);
  ctx.quadraticCurveTo(-52,-5,-42,-10);
  ctx.lineTo(-27,-15);
  ctx.quadraticCurveTo(-12,-34,15,-34);
  ctx.quadraticCurveTo(35,-33,48,-17);
  ctx.quadraticCurveTo(54,-10,54,4);
  ctx.quadraticCurveTo(52,13,42,15);
  ctx.lineTo(-41,15);
  ctx.quadraticCurveTo(-50,13,-52,7);
  ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;

  // dark panoramic glass / fastback roof
  ctx.fillStyle='#162430';
  ctx.beginPath();
  ctx.moveTo(-22,-16);
  ctx.quadraticCurveTo(-9,-30,14,-29);
  ctx.quadraticCurveTo(28,-28,39,-16);
  ctx.lineTo(18,-15);
  ctx.lineTo(-4,-15);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.moveTo(-3,-28);ctx.lineTo(-3,-15);ctx.stroke();

  // black lower trim / wheel arches
  ctx.fillStyle='#20252a';ctx.fillRect(-47,10,94,7);
  ctx.strokeStyle='#15191d';ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(-30,15,12,Math.PI,0);ctx.arc(31,15,12,Math.PI,0);ctx.stroke();

  // Juniper-ish thin lamps
  ctx.fillStyle='#e82127';roundRect(-51,-4,9,4,2,true);
  ctx.fillStyle='#f6fbff';roundRect(43,-5,9,3,2,true);
  ctx.fillStyle='rgba(255,255,255,.85)';roundRect(35,-10,16,2,1,true);

  // wheels
  for(const wx of [-30,31]){
    ctx.fillStyle='#101418';ctx.beginPath();ctx.arc(wx,16,11,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#69737b';ctx.beginPath();ctx.arc(wx,16,6,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#aab2b8';ctx.lineWidth=1.2;
    for(let a=0;a<5;a++){ctx.beginPath();ctx.moveTo(wx,16);ctx.lineTo(wx+Math.cos(a*Math.PI*2/5)*5,16+Math.sin(a*Math.PI*2/5)*5);ctx.stroke()}
  }

  // door line + handle
  ctx.strokeStyle='rgba(60,70,78,.42)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(-2,-14);ctx.lineTo(-2,10);ctx.stroke();
  ctx.fillStyle='#7f888f';roundRect(13,-6,10,2,1,true);

  ctx.restore();

  if(air<3){ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(car.x+54,gy+5,52,8,0,0,Math.PI*2);ctx.fill()}
};
})();