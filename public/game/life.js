'use strict';
// All motion is drawn in world coordinates so it stays attached to the map.
const Life=(()=>{
let seed=31415;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
const grass=[],leaves=[],butterflies=[],animals=[];let waterMask,waterLayer,waterCtx,waterTime=-1;
const grassZones=[[1700,570,80,35],[2150,800,50,35],[2700,900,70,40],[2850,600,60,35],[215,1230,55,25],[850,1280,50,20],[1010,1100,40,22],[440,693,85,48],[815,729,55,37],[1047,847,90,38],[324,857,64,35],[1050,365,40,30],[470,310,35,20],[1195,610,48,25],[530,676,42,22],[1146,178,21,34],[350,686,22,37],[870,835,60,25],[538,898,35,26]];
for(const [x,y,w,h]of grassZones)for(let i=0;i<20;i++)grass.push({x:x+(rand()-.5)*w*2,y:y+(rand()-.5)*h*2,h:4+rand()*8,s:rand()*6,c:rand()});
for(let i=0;i<23;i++)leaves.push({x:rand()*1536,y:rand()*1024,s:rand()*6,v:18+rand()*22});
for(const [x,y]of [[2290,680],[2510,780],[1700,580],[2800,930],[545,1260],[1000,1120],[420,680],[800,696],[1100,180],[1180,622],[478,323],[355,855],[1000,820],[568,757],[1050,382]])butterflies.push({x,y,s:rand()*7,c:['#f7c95b','#b8dfff','#edb5db'][Math.floor(rand()*3)]});
for(const [type,x,y]of [['chicken',460,570],['chicken',500,600],['chick',477,585],['cat',1030,560],['rabbit',438,736],['rabbit',1052,828],['bird',765,787],['bird',800,794]])animals.push({type,x,y,homeX:x,homeY:y,phase:rand()*9,angle:rand()*6.28,timer:rand()*3,walking:false,dir:1});
function init(image){const c=document.createElement('canvas');c.width=400;c.height=1024;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,-1136,0);const d=g.getImageData(0,0,400,1024);for(let i=0;i<d.data.length;i+=4){const [r,gg,b]=d.data.slice(i,i+3);d.data[i+3]=b>r*1.25&&gg>r*1.12&&b>75?255:0;d.data[i]=d.data[i+1]=d.data[i+2]=255}g.putImageData(d,0,0);waterMask=c;waterLayer=document.createElement('canvas');waterLayer.width=400;waterLayer.height=1024;waterCtx=waterLayer.getContext('2d');}
function water(ctx,t){if(!waterMask)return;if(t-waterTime>1/30){waterTime=t;const g=waterCtx;g.clearRect(0,0,400,1024);g.globalCompositeOperation='source-over';for(let i=0;i<160;i++){let y=(i*73.71+t*(16+i%7))%1024,x=(i*47.31+Math.sin(t*.8+i)*6)%400;g.fillStyle=i%3?'#c8f4ee65':'#225d9060';g.fillRect(x,y,5+i%13,1+i%2);g.fillRect(x+2,y+3,4,1)}for(let i=0;i<15;i++){g.fillStyle='#f0fff0a0';g.fillRect(169+i*3,86+(t*70+i*9)%45,1,5+i%5)}g.globalCompositeOperation='destination-in';g.drawImage(waterMask,0,0);g.globalCompositeOperation='source-over'}ctx.drawImage(waterLayer,1136,0);}
function ground(ctx,t){water(ctx,t);const gust=.5+.5*Math.sin(t*.8);for(const a of grass){let bend=Math.sin(t*2.5+a.s+a.x*.006)*(1.5+gust*2.5);ctx.strokeStyle=a.c>.5?'#87a846':'#548433';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x-3,a.y);ctx.quadraticCurveTo(a.x-4+bend*.5,a.y-a.h*.5,a.x-3+bend,a.y-a.h*.8);ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(a.x+bend*.4,a.y-a.h*.65,a.x+bend,a.y-a.h);ctx.moveTo(a.x+3,a.y);ctx.quadraticCurveTo(a.x+4+bend*.5,a.y-a.h*.5,a.x+3+bend,a.y-a.h*.7);ctx.stroke()}}
const animalPace={chicken:[14,100],chick:[17,108],cat:[19,140],rabbit:[22,155],bird:[20,145]};
function isNight(minutes){const hour=((minutes%1440)+1440)%1440/60;return hour<6||hour>=18}
function activeAt(type,minutes){return type==='cat'||!isNight(minutes)}
function update(dt,t,player,minutes=480){for(const a of animals){
 a.hidden=!activeAt(a.type,minutes);
 if(a.hidden){a.walking=false;a.fleeing=false;a.returning=false;a.fear=0;a.steerWait=0;continue;}

 const distanceToPlayer=Math.hypot(a.x-player.x,a.y-player.y),trigger=player.sprinting?125:95;
 a.fear=Math.max(0,(a.fear||0)-dt);
 if(distanceToPlayer<trigger){a.fleeing=true;a.fear=1.25}
 if(a.fleeing&&distanceToPlayer>165&&a.fear===0){a.fleeing=false;a.returning=true;a.timer=0}
 a.timer-=dt;const homeDistance=Math.hypot(a.x-a.homeX,a.y-a.homeY);
 if(a.fleeing){a.angle=Math.atan2(a.y-player.y,a.x-player.x);a.walking=true}
 else if(a.returning||homeDistance>55){a.returning=homeDistance>16;a.walking=a.returning;a.angle=Math.atan2(a.homeY-a.y,a.homeX-a.x);if(!a.returning)a.timer=1+rand()*2}
 else if(a.timer<=0){a.walking=rand()>.35;a.timer=1.5+rand()*3;a.angle=rand()*Math.PI*2}
 if(!a.walking)continue;
 const amount=animalPace[a.type][a.fleeing?1:0]*Math.min(dt,.05),lookAhead=Math.max(10,amount+5);
 let selected=null,best=-Infinity;a.steerWait=(a.steerWait||0)-dt;
 if(a.steerWait>0&&a.heading!==undefined){const dx=Math.cos(a.heading),dy=Math.sin(a.heading);if(canWalk(a.x+dx*amount,a.y+dy*amount))selected={angle:a.heading,dx,dy}}
 if(!selected){a.steerWait=.14;
 for(const offset of [0,.45,-.45,.9,-.9,1.4,-1.4,2,-2,Math.PI]){
 const angle=a.angle+offset,dx=Math.cos(angle),dy=Math.sin(angle);
 if(!canWalk(a.x+dx*lookAhead,a.y+dy*lookAhead)||!canWalk(a.x+dx*amount,a.y+dy*amount))continue;
 let score=-Math.abs(offset)*2;
 if(a.fleeing)score+=Math.hypot(a.x+dx*lookAhead-player.x,a.y+dy*lookAhead-player.y)-distanceToPlayer;
 else if(a.returning)score+=homeDistance-Math.hypot(a.x+dx*lookAhead-a.homeX,a.y+dy*lookAhead-a.homeY);
 if(score>best){best=score;selected={angle,dx,dy}}
 }}
 if(selected){a.heading=selected.angle;const oldX=a.x,oldY=a.y,steps=Math.max(1,Math.ceil(amount/2));
 for(let i=0;i<steps;i++){const nx=a.x+selected.dx*amount/steps,ny=a.y+selected.dy*amount/steps;if(!canWalk(nx,ny))break;a.x=nx;a.y=ny}
 a.walking=Math.hypot(a.x-oldX,a.y-oldY)>.001;
 if(a.walking){if(Math.abs(selected.dx)>.05)a.dir=selected.dx<0?-1:1;a.phase+=dt*(a.fleeing?23:9);a.angle=selected.angle}
 }else{a.walking=false;a.timer=0}
}}
function box(ctx,color,x,y,w,h){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function actor(ctx,player,t){Character.draw(ctx,player,t)}
function animal(ctx,a,t){if(a.hidden)return;ctx.save();ctx.translate(Math.round(a.x),Math.round(a.y));ctx.fillStyle='#17382940';ctx.beginPath();ctx.ellipse(0,0,a.type==='cat'?11:8,3,0,0,7);ctx.fill();ctx.scale(a.dir*1.5,1.5);const step=a.walking?Math.sin(a.phase)*1.8:0;const hop=a.type==='rabbit'&&a.walking?-Math.abs(Math.sin(a.phase))*(a.fleeing?7:3):0;ctx.translate(0,hop);const b=(c,x,y,w,h)=>box(ctx,c,x,y,w,h);
if(a.type==='cat'){b('#b8824e',-7,-8,13,6);b('#e6be83',-5,-7,8,4);b('#c18a50',4,-12,6,7);b('#825637',4,-14,2,3);b('#825637',8,-14,2,3);b('#293d30',8,-10,1,1);b('#8a5b3c',-5,-3+step,2,4);b('#8a5b3c',4,-3-step,2,4);ctx.strokeStyle='#b8824e';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-6,-7);ctx.quadraticCurveTo(-14,-9,-12+Math.sin(t*3)*2,-14);ctx.stroke()}
else if(a.type==='rabbit'){b('#d7cfb8',-6,-7,11,6);b('#f3e6ca',1,-11,6,7);b('#dfd5c0',1,-18,2,8);b('#f2ddc9',5,-17,2,7);b('#393830',5,-9,1,1);b('#fff3d9',-8,-6,3,3);b('#acaa95',-4,-2,4,2);b('#acaa95',3,-2,3,2)}
else if(a.type==='bird'){b('#577a81',-5,-7,8,5);b('#a7c5b8',-3,-5,5,3);b('#45646a',2,-10,4,5);b('#d2ac61',6,-7,3,1);b('#263f40',4,-9,1,1);b('#385356',-8,-7,4,2);b('#806f4b',-2,-1+step,1,2);b('#806f4b',2,-1-step,1,2)}
else{const chick=a.type==='chick';ctx.scale(chick?.65:1,chick?.65:1);b(chick?'#ecd168':'#eee4c3',-6,-9,11,7);b(chick?'#f8df82':'#fff0d1',2,-14+(a.walking?0:Math.sin(t*3+a.phase)>0?2:0),5,8);b('#ccad78',-5,-7,6,3);if(!chick){b('#ba5140',3,-16,4,3);b('#bc4c37',6,-7,2,3)}b('#dfac52',7,-10,3,2);b('#303c30',5,-12,1,1);b('#d39a45',-3,-2+step,1,4);b('#d39a45',3,-2-step,1,4);b('#d3c6a0',-8,-11,3,5)}ctx.restore()}
function air(ctx,t,minutes=480){if(!isNight(minutes))for(const a of butterflies){const x=a.x+Math.sin(t*.67+a.s)*30,y=a.y+Math.sin(t*1.1+a.s)*18,wing=1+Math.abs(Math.sin(t*15+a.s))*5;ctx.fillStyle='#182e2922';ctx.fillRect(x,y+13,4,2);ctx.fillStyle=a.c;ctx.beginPath();ctx.ellipse(x-wing/2-1,y,wing/2,3,Math.sin(t*3)*.3,0,7);ctx.ellipse(x+wing/2+1,y,wing/2,3,-Math.sin(t*3)*.3,0,7);ctx.fill();box(ctx,'#655b42',x,y-2,1,4)}for(const a of leaves){const x=(a.x+t*a.v)%1600-32,y=(a.y+t*8+Math.sin(t+a.s)*15)%1060-18;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(t*2+a.s)*1.5);ctx.fillStyle=a.s>3?'#c5c565aa':'#93b552aa';ctx.fillRect(-3,-1,6,2);ctx.fillRect(-1,-2,3,4);ctx.restore()}}
function nocturnalAir(ctx,t,minutes,weather){if(!isNight(minutes)||weather==='storm'||weather==='rain'||weather==='snow')return;ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<18;i++){const a=butterflies[i%butterflies.length],x=a.x+Math.sin(t*.43+i*2)*31,y=a.y-8+Math.cos(t*.57+i)*17;const glow=.25+.65*Math.pow(.5+.5*Math.sin(t*1.6+i*2.1),2);const gradient=ctx.createRadialGradient(x,y,0,x,y,9);gradient.addColorStop(0,`rgba(210,238,120,${glow*.5})`);gradient.addColorStop(1,'rgba(190,230,104,0)');ctx.fillStyle=gradient;ctx.fillRect(x-9,y-9,18,18);ctx.fillStyle=`rgba(239,255,167,${glow})`;ctx.fillRect(x,y,2,2)}ctx.restore()}
return{init,ground,update,actor,animal,air,animals,isNight,activeAt,nocturnalAir};})();
