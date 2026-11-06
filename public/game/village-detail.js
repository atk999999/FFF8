'use strict';
const VillageDetail=(()=>{
let floor,decor;const fences=[],solids=[],trees=[];
const roads=[[[1536,510],[3000,510]],[[1536,1225],[2975,1225]],[[1845,430],[1845,1225]],[[2630,430],[2630,1225]],[[1725,860],[2630,860]],[[1845,950],[2970,950]],[[2490,320],[2490,510]],[[2905,420],[2905,510]]];
let seed=51823;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function distance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],v=dx*dx+dy*dy,k=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/v));return Math.hypot(x-a[0]-k*dx,y-a[1]-k*dy)}
function roadDistance(x,y){return Math.min(...roads.map(([a,b])=>distance(x,y,a,b)))}
function ellipse(g,x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()}
function rectangle(name,x,y,w,h){const o={name,points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]};Collision.polygons.push(o);solids.push(o)}
function fence(g,a,b){fences.push({a,b});Collision.segments.push({a,b,r:2});const d=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.max(1,Math.ceil(d/18));g.strokeStyle='#70553b';g.lineWidth=3;for(const lift of [4,12]){g.beginPath();g.moveTo(a[0],a[1]-lift);g.lineTo(b[0],b[1]-lift);g.stroke()}for(let i=0;i<=count;i++){const x=a[0]+(b[0]-a[0])*i/count,y=a[1]+(b[1]-a[1])*i/count;g.fillStyle='#896e49';g.fillRect(x-2,y-19,5,22);g.fillStyle='#d0b782';g.fillRect(x-1,y-20,4,3)}}
function pot(g,x,y,plant=false){ellipse(g,x,y+1,10,4,'#283e2938');g.fillStyle='#916d46';g.beginPath();g.moveTo(x-9,y-15);g.lineTo(x+9,y-15);g.lineTo(x+7,y);g.lineTo(x-6,y);g.closePath();g.fill();ellipse(g,x,y-15,10,4,'#c1a172');ellipse(g,x,y-15,6,2,'#534e35');if(plant)for(let i=0;i<5;i++){g.strokeStyle='#5d813e';g.lineWidth=2;g.beginPath();g.moveTo(x,y-15);g.lineTo(x+(i-2)*4,y-29+Math.abs(i-2)*3);g.stroke();ellipse(g,x+(i-2)*4,y-27+Math.abs(i-2)*3,3,2,i%2?'#c79aaf':'#ded0a0')}rectangle('Chum / chậu cây',x-8,y-9,16,12)}
function crate(g,x,y,w=22){g.fillStyle='#8c704c';g.fillRect(x,y-17,w,20);g.strokeStyle='#c1a575';g.lineWidth=2;g.strokeRect(x+1,y-16,w-2,18);g.beginPath();g.moveTo(x+1,y-15);g.lineTo(x+w-1,y+1);g.moveTo(x+1,y-7);g.lineTo(x+w-1,y-7);g.stroke();rectangle('Thùng hàng',x,y-10,w,13)}
const leftX=1480;
function init(bg){seed=51823;floor=document.createElement('canvas');decor=document.createElement('canvas');floor.width=1536;decor.width=3072-leftX;floor.height=decor.height=1331;const g=floor.getContext('2d'),p=decor.getContext('2d');g.translate(-1536,0);p.translate(-leftX,0);g.imageSmoothingEnabled=p.imageSmoothingEnabled=false;
const grass=TerrainTexture.pattern(g,'grass');
// Subtle pixel-art wildflowers & clover tufts in open meadows (never cluttering road surfaces)
for(let i=0;i<1400;i++){
  const x=1546+rand()*1516,y=15+rand()*1300,d=roadDistance(x,y);
  if(d<40||!Collision.canWalk(x,y))continue;
  if(i%7===0){
    g.fillStyle='#4a742c';
    g.fillRect(x,y,4,2);
    g.fillRect(x+1,y-1,2,4);
    if(i%21===0){
      g.fillStyle=i%2?'#f5eed6':'#f2d57e';
      g.fillRect(x+1,y-1,2,2);
    }
  }
}
// Flower garden with winding sandy path and lush island beds (no sharp rectangular lawn box)
if(grass){
  g.save();
  g.beginPath();
  g.roundRect(2192,606,402,232,28);
  g.clip();
  g.fillStyle=grass;
  g.fillRect(2188,603,410,238);
  g.restore();
}
for(const [lw,col]of [[34,'#7a8f4288'],[28,'#c8a36a99'],[22,TerrainTexture.pattern(g,'dirt')||'#d6b181'],[14,'#e3c49866']]){
  g.strokeStyle=col;g.lineWidth=lw;g.lineCap='round';
  g.beginPath();
  g.moveTo(2190,730);g.bezierCurveTo(2280,715,2350,753,2420,730);g.bezierCurveTo(2510,700,2540,741,2595,730);
  g.moveTo(2400,602);g.bezierCurveTo(2370,665,2430,770,2400,841);
  g.stroke();
}
for(const [x,y,rx,ry]of [[2288,657,78,36],[2500,655,70,38],[2287,790,80,32],[2500,788,72,34]]){ellipse(g,x,y,rx+6,ry+5,'#486e2d');ellipse(g,x,y,rx+3,ry+2,'#8f774d');ellipse(g,x,y,rx,ry,'#4d7539');for(let j=0;j<110;j++){const ang=rand()*7,r=Math.sqrt(rand()),xx=x+Math.cos(ang)*rx*r,yy=y+Math.sin(ang)*ry*r;g.fillStyle='#6f934b';g.fillRect(xx,yy,2,5);ellipse(g,xx,yy-3,2+rand()*2,2,['#efb9c2','#f0d584','#c4a8d9','#f5eed8'][j%4])}for(let j=0;j<24;j++){const a=j/24*Math.PI*2;ellipse(g,x+Math.cos(a)*(rx+3),y+Math.sin(a)*(ry+3),3.5,2.5,'#678f3d')}}
// Each courtyard has an open gate on the house's approach, with small domestic props to its sides.
EastVillage.houses.forEach((h,i)=>{const left=h.x-13,right=h.x+h.w+12,bottom=h.y+h.h+10,gate=h.x+h.w*.5;g.fillStyle='#cfa876';g.beginPath();g.ellipse(gate,h.y+h.h+4,32,12,0,0,Math.PI*2);g.fill();fence(p,[left,h.y+h.h-35],[left,bottom]);fence(p,[right,h.y+h.h-35],[right,bottom]);fence(p,[left,bottom],[gate-32,bottom]);fence(p,[gate+32,bottom],[right,bottom]);pot(p,h.x-1,h.y+h.h-11,i%2===1);if(i%2===0){for(let j=0;j<5;j++){p.fillStyle='#78583c';p.fillRect(right-23,h.y+h.h-20+j*3,18,3);ellipse(p,right-22,h.y+h.h-19+j*3,2,1.5,'#bda06b')}}else crate(p,right-28,h.y+h.h-12,18)});
// Kitchen garden, bee boxes, grain sacks, market cart and a small chicken shelter.
for(const [x,y,w,h]of [[1640,902,120,66],[1920,1012,72,76],[2955,1010,76,64]]){g.fillStyle='#5c452d';g.fillRect(x-3,y-3,w+6,h+6);g.fillStyle='#7d6242';g.fillRect(x,y,w,h);for(let yy=y+8;yy<y+h;yy+=14)for(let xx=x+7;xx<x+w;xx+=14){ellipse(g,xx,yy,5.5,3.5,'#3d662c');ellipse(g,xx,yy-1,4,2.5,'#689643');ellipse(g,xx+1,yy-2,2.5,1.5,'#9ec45a')}for(let xx=x;xx<x+w;xx+=12){p.fillStyle='#a88958';p.fillRect(xx,y+h,8,3)}}
for(const [x,y]of [[2163,1000],[2385,1004],[2938,834]]){crate(p,x,y);crate(p,x+24,y+5,18);pot(p,x-13,y+4)}
p.fillStyle='#866a49';p.fillRect(2670,1040,65,29);p.strokeStyle='#c5a875';p.lineWidth=2;for(let y=1043;y<1068;y+=7){p.beginPath();p.moveTo(2671,y);p.lineTo(2734,y);p.stroke()}p.strokeStyle='#584d39';p.lineWidth=3;for(const x of [2680,2726]){ellipse(p,x,1070,8,8,'#6b6248');p.stroke();p.beginPath();p.moveTo(x-7,1070);p.lineTo(x+7,1070);p.moveTo(x,1063);p.lineTo(x,1077);p.stroke()}p.beginPath();p.moveTo(2735,1051);p.lineTo(2759,1059);p.stroke();rectangle('Xe kéo hàng',2670,1043,68,34);for(let i=0;i<4;i++)ellipse(p,2680+i*12,1044,7,11,'#b9a16a');
p.fillStyle='#876b46';p.fillRect(2990,1115,48,36);p.fillStyle='#bba678';p.fillRect(2995,1120,38,29);p.fillStyle='#716248';p.beginPath();p.moveTo(2984,1118);p.lineTo(3013,1097);p.lineTo(3044,1118);p.closePath();p.fill();p.fillStyle='#3c4634';p.fillRect(3005,1134,15,17);rectangle('Chuồng gà',2990,1118,48,33);
// Landscape clusters use the clean multi-lobed tree silhouette without grass box artifacts.
for(const [x,y,s]of [[1660,1090,.65],[1740,1130,.8],[2310,168,.62],[2682,270,.7],[2990,220,.62],[2980,576,.65],[2080,580,.55],[2190,1188,.58],[2685,1155,.65],[1560,760,.62]]){
  if(EastVillage.drawTreeSprite)EastVillage.drawTreeSprite(p,bg,x,y,s);
  const o={name:'Cây cảnh xóm đông',x,y:y-45*s,rx:52*s,ry:40*s};Collision.circles.push(o);trees.push(o);
}
for(const [cx,cy]of [[1560,220],[1560,950],[2270,60],[2660,170],[3000,450],[3040,800],[2100,650],[2140,1265],[2780,1280],[1600,1170]])for(let i=0;i<14;i++){const x=cx+(rand()-.5)*60,y=cy+(rand()-.5)*35;if(roadDistance(x,y)<50||!Collision.canWalk(x,y))continue;if(EastVillage.drawBush&&i%4===0)EastVillage.drawBush(p,x,y,.55,i%8===0);else{ellipse(p,x,y,6+rand()*4,3.5+rand()*2.5,'#3b6329');ellipse(p,x-1,y-2,4+rand()*3,2.5,'#6d9942')}}
// Courtyard paving, planters, a low notice board and a vine frame outside the garden.
for(let i=0;i<100;i++){const x=2330+rand()*315,y=307+rand()*82;g.strokeStyle='#7d8a6c55';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+5,y+2);g.stroke()}
pot(p,2340,365,true);pot(p,2639,365,true);p.fillStyle='#705739';p.fillRect(2306,406,4,31);p.fillRect(2350,406,4,31);p.fillStyle='#947b54';p.fillRect(2303,390,55,30);p.fillStyle='#d9c99d';p.fillRect(2310,395,14,18);p.fillRect(2332,395,16,16);rectangle('Bảng tin làng',2303,414,55,23);
for(const x of [2185,2245]){p.fillStyle='#7f6946';p.fillRect(x,574,4,43)}p.fillStyle='#a48b5a';p.fillRect(2180,573,75,5);for(let x=2183;x<2255;x+=9){p.fillStyle='#577a3e';p.fillRect(x,570,7,8);p.fillStyle='#ccb1c1';p.fillRect(x+2,577,3,4)}rectangle('Cột giàn hoa',2185,605,4,12);rectangle('Cột giàn hoa',2245,605,4,12);
}
function ground(g){if(floor)g.drawImage(floor,1536,0)}
function farm(g,t){
  // Natural earthen field embankments (bờ thửa ruộng đất cỏ mọc) instead of harsh geometric stripes
  for(const [a,b]of [[[1604,185],[2236,185]],[[1604,286],[2236,286]],[[1798,84],[1798,386]],[[2040,84],[2040,386]]]){
    g.strokeStyle='#6e583b';g.lineWidth=8;g.lineCap='round';
    g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();
    g.strokeStyle='#9c8256';g.lineWidth=5;
    g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]);
    g.fillStyle='#628c3a';
    for(let d=10;d<len-10;d+=22){
      const gx=a[0]+(b[0]-a[0])*(d/len),gy=a[1]+(b[1]-a[1])*(d/len);
      g.fillRect(gx-2,gy-2,4,3);
    }
  }
  // Wooden plank crossings over field dikes
  for(const [x,y]of [[1740,185],[1990,286],[1798,235],[2040,335]]){
    g.fillStyle='#59432b';g.fillRect(x-15,y-7,30,15);
    g.fillStyle='#b59461';g.fillRect(x-14,y-6,28,13);
    g.strokeStyle='#755a3b';g.lineWidth=1;
    for(let yy=y-4;yy<y+6;yy+=4){g.beginPath();g.moveTo(x-13,yy);g.lineTo(x+13,yy);g.stroke()}
  }
  // Scarecrow (bù nhìn rơm)
  g.fillStyle='#87714c';g.fillRect(2225,315,3,35);g.strokeStyle='#9d8052';g.lineWidth=3;g.beginPath();g.moveTo(2211,325);g.lineTo(2241,325);g.stroke();g.fillStyle='#b28c6e';g.beginPath();g.moveTo(2220,321);g.lineTo(2234,321);g.lineTo(2237+Math.sin(t*2)*3,339);g.lineTo(2218,339);g.closePath();g.fill();ellipse(g,2227,315,5,6,'#c3ab79');g.fillStyle='#9d895c';g.fillRect(2219,308,16,3);
  // Bamboo waterwheel (guồng nước) alongside the channel
  g.save();g.translate(2258,209);g.strokeStyle='#72583a';g.lineWidth=4;g.beginPath();g.arc(0,0,20,0,7);g.stroke();g.rotate(t*.4);for(let i=0;i<8;i++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(0,0);g.lineTo(20,0);g.stroke();g.fillStyle='#ac9360';g.fillRect(17,-5,6,10)}g.restore();g.fillStyle='#726346';g.fillRect(2255,206,6,28);g.fillStyle='#528082';g.fillRect(2240,232,39,5);for(let i=0;i<6;i++){g.fillStyle='#b3d9d6aa';g.fillRect(2240+(t*14+i*7)%38,233,5,2)}
}
function props(g,t){if(decor)g.drawImage(decor,leftX,0);for(const [x,y]of [[2173,1005],[2400,1009],[2952,839]]){g.fillStyle='#c8af77';g.beginPath();g.ellipse(x,y-12,8,12,0,0,7);g.fill();g.strokeStyle='#877349';g.lineWidth=1;g.beginPath();g.moveTo(x-6,y-17);g.lineTo(x+6,y-17);g.stroke()}}
function registerFarm(){rectangle('Trụ bù nhìn',2225,343,3,7);rectangle('Guồng tưới',2240,192,38,42)}
return{init(bg){init(bg);registerFarm()},ground,farm,props,fences,solids,trees};})();
