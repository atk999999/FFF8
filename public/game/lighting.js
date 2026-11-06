'use strict';
const VillageLighting=(()=>{
// World-space lamps: the four painted lanterns, covered house lamps and roadside torches.
const lamps=[
{x:607,y:205,r:100},{x:920,y:205,r:100},{x:628,y:866,r:112},{x:748,y:866,r:112},
{x:280,y:280,r:83,fixture:true},{x:456,y:280,r:83,fixture:true},
{x:315,y:520,r:85,fixture:true},{x:1193,y:390,r:85,fixture:true},
{x:1005,y:722,r:85,fixture:true},{x:1192,y:722,r:85,fixture:true},
{x:401,y:1183,r:90,fixture:true},{x:1218,y:1183,r:90,fixture:true},
{x:555,y:587,r:125,torch:true},{x:1080,y:480,r:125,torch:true},
{x:1261,y:471,r:115,torch:true},{x:1413,y:471,r:115,torch:true},
{x:585,y:1110,r:125,torch:true},{x:940,y:1110,r:125,torch:true}];
// Apertures follow the painted house windows and doors, including both southern homes.
// House lights follow dusk, independent of whether an NPC has reached home.
const houses=[
{windows:[[675,177,24,22],[830,176,22,22]],door:[736,179,43,45]},
{windows:[[171,255,15,15],[253,255,15,15]],door:[207,256,29,34]},
{windows:[[348,255,15,15],[432,255,15,15]],door:[386,255,29,35]},
{windows:[[199,504,16,16],[290,504,16,16]],door:[235,505,30,33]},
{windows:[[1095,370,14,14],[1178,370,14,14]],door:[1130,370,28,33]},
{windows:[[907,703,16,15],[991,703,16,15]],door:[942,702,29,35]},
{windows:[[1096,703,16,15],[1179,703,16,15]],door:[1132,702,29,35]},
{windows:[[302,1169,16,16],[393,1169,16,16]],door:[338,1170,30,33]},
{windows:[[1124,1169,16,16],[1215,1169,16,16]],door:[1160,1170,30,33]}];
function houseLights(g,t,n){
 g.save();
 for(let i=0;i<houses.length;i++){
  const house=houses[i],strength=n*(.94+.025*Math.sin(t*1.4+i));
  const [dx,dy,dw,dh]=house.door;
  // Warm spill on the doorstep and a softly widening pool along the path.
  g.globalCompositeOperation='screen';
  const spill=g.createLinearGradient(dx,dy+dh,dx,dy+dh+70);
  spill.addColorStop(0,`rgba(255,191,94,${strength*.27})`);
  spill.addColorStop(1,'rgba(255,191,94,0)');
  g.fillStyle=spill;g.beginPath();g.moveTo(dx,dy+dh);g.lineTo(dx+dw,dy+dh);g.lineTo(dx+dw+20,dy+dh+70);g.lineTo(dx-20,dy+dh+70);g.closePath();g.fill();
  for(const [x,y,w,h]of [...house.windows,house.door]){
   halo(g,x+w/2,y+h/2,44,'255,185,84',strength*.22);
   // Bright panes with dark wooden dividers, rather than a glow floating on the wall.
   g.globalCompositeOperation='source-over';g.globalAlpha=strength;
   const pane=g.createLinearGradient(x,y,x,y+h);pane.addColorStop(0,'#e9a544');pane.addColorStop(.55,'#ffe2a0');pane.addColorStop(1,'#ffc76a');g.fillStyle=pane;g.fillRect(x,y,w,h);
   g.strokeStyle='#77532d';g.lineWidth=1.5;g.strokeRect(x+.5,y+.5,w-1,h-1);
   g.fillStyle='#76512b';g.fillRect(x+w/2-1,y,2,h);g.fillRect(x,y+h*.52,w,2);
   if(h>25){g.fillRect(x+w*.25,y,1.5,h);g.fillRect(x+w*.75,y,1.5,h);g.fillRect(x,y+h*.78,w,1.5)}
   g.globalAlpha=1;g.globalCompositeOperation='screen';
  }
 }
 g.restore();
}
for(const h of EastVillage.houses){const sx=h.w/180,sy=h.h/151;houses.push({windows:[[h.x+44*sx,h.y+105*sy,16*sx,16*sy],[h.x+135*sx,h.y+105*sy,16*sx,16*sy]],door:[h.x+80*sx,h.y+106*sy,30*sx,33*sy]});lamps.push({x:h.x+146*sx,y:h.y+119*sy,r:90,fixture:true})}
houses.push({windows:[[2392,238,24,22],[2547,237,22,22]],door:[2453,240,43,45]});
for(const [x,y]of [[2324,266],[2637,266],[1800,520],[2100,520],[2630,570],[2200,725],[2600,725],[2100,1225],[2480,1225],[2900,1225]])lamps.push({x,y,r:105,fixture:true});
const mask=document.createElement('canvas');mask.width=1536;mask.height=666;
const m=mask.getContext('2d');let cloud=1;
const clamp=v=>Math.max(0,Math.min(1,v));
function night(minutes){const h=minutes/60;return h<5?1:h<7?(7-h)/2:h<17.5?0:h<20?(h-17.5)/2.5:1}
function halo(g,x,y,r,color,a){const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,`rgba(${color},${a})`);q.addColorStop(.32,`rgba(${color},${a*.55})`);q.addColorStop(1,`rgba(${color},0)`);g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2)}
function flicker(t,i){return .92+.045*Math.sin(t*5.7+i*2)+.035*Math.sin(t*11.3+i)}
function fixtures(g,t,minutes){const n=night(minutes);for(let i=0;i<lamps.length;i++){const l=lamps[i];if(!l.fixture&&!l.torch)continue;g.save();g.translate(l.x,l.y);if(l.torch){g.fillStyle='#33271f';g.fillRect(-2,0,4,24);g.fillStyle='#786044';g.fillRect(-5,-3,10,5);if(n>.02){const sway=Math.sin(t*5+i)*2;g.fillStyle='#e67b30';g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(-7,-7,sway,-18*flicker(t,i));g.quadraticCurveTo(8,-5,4,0);g.fill();g.fillStyle='#ffe09a';g.beginPath();g.moveTo(-2,0);g.quadraticCurveTo(-3,-5,sway,-10);g.quadraticCurveTo(4,-3,2,0);g.fill();for(let j=0;j<2;j++){const age=(t*.6+i*.37+j*.5)%1;g.globalAlpha=(1-age)*n*.65;g.fillStyle='#ffcc6e';g.fillRect(sway+Math.sin(age*5+i)*3,-8-age*21,1.3,1.3)}}}else{g.fillStyle='#443623';g.fillRect(-6,-9,12,3);g.fillRect(-5,5,10,3);g.fillStyle=n>.02?'#efbf68':'#a38d58';g.fillRect(-4,-6,8,11);g.fillStyle='#77552d';g.fillRect(-1,-7,2,14)}g.restore()}}
function draw(g,t,minutes,dt,weather,villagers){const n=night(minutes);const target=weather==='storm'?.12:weather==='rain'?.3:weather==='snow'?.58:1;cloud+=(target-cloud)*Math.min(1,dt*.8);if(n<=0)return;
// Half-resolution darkness mask keeps soft light pools inexpensive on phones.
m.setTransform(1,0,0,1,0,0);m.clearRect(0,0,1536,666);m.save();m.scale(.5,.5);m.fillStyle=`rgba(9,19,44,${n*(.60-.08*cloud)})`;m.fillRect(0,0,3072,1332);m.globalCompositeOperation='destination-out';
for(let i=0;i<lamps.length;i++){const l=lamps[i];halo(m,l.x,l.y+12,l.r*flicker(t,i),'0,0,0',.83)}
for(const h of houses){const[x,y,w,hh]=h.door;halo(m,x+w/2,y+hh,75,'0,0,0',.55)}m.restore();g.save();g.drawImage(mask,0,0,3072,1332);
// Cool broad moonlight falls from the northeast, softened by rain clouds.
g.globalCompositeOperation='screen';halo(g,1150,270,660,'142,177,224',n*cloud*.12);halo(g,790,830,470,'133,171,219',n*cloud*.07);halo(g,2450,550,780,'142,177,224',n*cloud*.12);
for(const [x,y,w,h]of [[930,30,200,700],[1240,60,145,620],[720,680,110,560]]){const grad=g.createLinearGradient(x,y,x-230,y+h);grad.addColorStop(0,`rgba(166,196,234,${n*cloud*.045})`);grad.addColorStop(1,'rgba(166,196,234,0)');g.fillStyle=grad;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.lineTo(x+w-310,y+h);g.lineTo(x-370,y+h);g.closePath();g.fill()}
// Broken silver reflection, placed only on the river south of the bridge.
g.strokeStyle=`rgba(189,218,247,${n*cloud*.32})`;g.lineWidth=1.5;g.beginPath();for(let j=0;j<28;j++){const y=572+j*8.5,x=1387+Math.sin(j*.35)*16+Math.sin(t*.7+j)*4,w=5+Math.sin(j*1.7+t)*3;g.moveTo(x-w,y);g.lineTo(x+w,y)}g.stroke();
for(let i=0;i<lamps.length;i++){const l=lamps[i],f=flicker(t,i);halo(g,l.x,l.y+9,l.r*f,'255,169,67',n*.27);halo(g,l.x,l.y,20,'255,218,141',n*.5);g.fillStyle=`rgba(255,231,162,${n*.78})`;g.fillRect(l.x-2,l.y-3,4,6)}
g.restore();}
return{fixtures,draw,night,lamps,houses,houseLights};
})();
