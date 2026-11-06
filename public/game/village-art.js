'use strict';
// Decorative layers never register invisible obstacles. Buildings keep their existing footprints.
const VillageArt=(()=>{
let masonry;const blooms=[];let seed=715;
function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function oval(g,x,y,a,b,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,a,b,0,0,Math.PI*2);g.fill()}
function line(g,x,y,xx,yy,c,w=1){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(xx,yy);g.stroke()}
function init(){seed=715;blooms.length=0;masonry=document.createElement('canvas');masonry.width=1536;masonry.height=1331;const g=masonry.getContext('2d');g.translate(-1536,0);
EastVillage.houses.forEach((h,i)=>{
 const bottom=h.y+h.h,roof=h.y+h.h*.64;
 // Mortar-jointed stone plinths, individual corner posts and timber carving.
 g.fillStyle='#554d3b';g.fillRect(h.x+12,bottom-10,h.w-24,9);
 for(let row=0;row<2;row++)for(let x=h.x+14+row*7;x<h.x+h.w-18;x+=17){g.fillStyle=['#a59c7c','#8c8d71','#b1a580'][(Math.floor(x)+row)%3];g.fillRect(x,bottom-9+row*4,15,3)}
 for(const x of [h.x+18,h.x+h.w-21]){g.fillStyle=['#725040','#56685a','#79563d'][i%3];g.fillRect(x,roof+8,5,bottom-roof-19);g.fillStyle='#c6ab76';g.fillRect(x+1,roof+9,1,bottom-roof-22)}
 const wy=bottom-47,wx=h.x+h.w*.22;g.fillStyle='#453f30';g.fillRect(wx-14,wy-15,28,25);g.fillStyle='#a78c5e';g.fillRect(wx-17,wy+10,34,4);
 for(let j=-9;j<=9;j+=6)line(g,wx+j,wy-13,wx+j,wy+8,'#b9a273',1);line(g,wx-13,wy-3,wx+13,wy-3,'#b9a273');
 // Rolled woven blinds / carved fascia vary between households.
 if(i%2===0){g.fillStyle='#b29b64';g.fillRect(wx-16,wy-20,32,5);for(let x=wx-15;x<wx+16;x+=3)line(g,x,wy-20,x,wy-15,'#746442')}
 for(let x=h.x+28;x<h.x+h.w-25;x+=13){g.fillStyle='#aa8955';g.fillRect(x,roof+3,3,4)}
 // Moss stays at the foundation, leaving entrances visually clear.
 for(let k=0;k<16;k++){const x=h.x+15+rnd()*(h.w-30);if(Math.abs(x-(h.x+h.w*.5))<26)continue;oval(g,x,bottom-2,2+rnd()*3,1.3,'#687845')}
});
// Granary: overlapping clay shingles, timber beams and woven storage baskets.
g.save();g.beginPath();g.moveTo(2704,721);g.lineTo(2820,646);g.lineTo(2936,721);g.closePath();g.clip();
g.fillStyle='#776449';g.fillRect(2704,646,232,75);
for(let y=650;y<724;y+=8){line(g,2700,y,2940,y,'#b49a6a',2);for(let x=2704+((y/8)%2)*9;x<2940;x+=18){line(g,x,y,x-3,y+7,'#493d2d',1);line(g,x+2,y+1,x+12,y+1,'#c4ac7d',1)}}g.restore();
line(g,2707,720,2820,648,'#d4bb86',3);line(g,2820,648,2933,720,'#d4bb86',3);
for(let x=2730;x<2920;x+=16){line(g,x,731,x,811,'#766043');line(g,x+2,735,x+2,808,'#c4a879')}
for(const y of [738,808])line(g,2727,y,2915,y,'#59472f',5);
for(const [x,y]of [[2756,803],[2772,802],[2864,803],[2880,803],[2872,784]]){oval(g,x,y,9,4,'#5d5037');g.fillStyle='#b89b62';g.fillRect(x-9,y-18,18,18);oval(g,x,y-18,9,3,'#d7bc7e');for(let yy=y-15;yy<y;yy+=4)line(g,x-8,yy,x+8,yy,'#80663f');for(let xx=x-6;xx<x+8;xx+=5)line(g,xx,y-16,xx,y,'#dec18a')}
// Petal shapes vary by bed: marigolds, lotus-pink, lavender and white daisies.
for(const [cx,cy,rx,ry,col]of [[2288,657,70,28,'#e8ba50'],[2500,655,62,30,'#e7a3b4'],[2287,790,72,24,'#b39bcc'],[2500,788,64,26,'#f0ead2']])for(let i=0;i<55;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd());blooms.push({x:cx+Math.cos(a)*rx*r,y:cy+Math.sin(a)*ry*r,h:5+rnd()*9,p:rnd()*7,c:col})}
}
function ground(g,t){
 // Thin water glints trace the open irrigation channel beside the main paddy.
 for(let i=0;i<18;i++){let y=89+(i*17+t*10)%294;line(g,2244,y,2251,y+2,'#c2e4cc77',1);}
 // Pebbles, reeds and moist edges around the existing field borders.
 for(let i=0;i<43;i++){const x=1606+i*15;oval(g,x,398+Math.sin(i*3)*2,3,1.5,i%3?'#9c9268':'#c4b184');if(i%3===0){line(g,x,404,x+Math.sin(t*1.7+i)*2,396,'#668b39');line(g,x,404,x+4,398,'#8ba644')}}
 // Chalk hopscotch and a small pebble game in the garden's open crossing.
 g.save();g.globalAlpha=.42;g.strokeStyle='#f3e6b4';g.lineWidth=1;
 for(let i=0;i<4;i++){g.strokeRect(2388,714+i*9,12,9);if(i===1||i===3)g.strokeRect(2400,714+i*9,12,9)}g.restore();
}
function props(g,t){if(masonry)g.drawImage(masonry,1536,0);
 for(const b of blooms){const sway=Math.sin(t*1.8+b.p)*1.8,xx=b.x+sway,yy=b.y-b.h;line(g,b.x,b.y,xx,yy,'#446b36');oval(g,b.x-2,b.y-3,3,1,'#789d4c');for(let k=0;k<5;k++){const a=k*Math.PI*2/5;oval(g,xx+Math.cos(a)*2,yy+Math.sin(a)*1.4,1.8,1.2,b.c)}oval(g,xx,yy,1,1,'#a87937')}
 // Cloth tied beneath existing porch eaves ripples with the breeze.
 for(const [i,h]of EastVillage.houses.entries()){if(i%2===0)continue;const x=h.x+h.w*.76,y=h.y+h.h*.7;g.fillStyle=['#ae7860','#698879','#c2ae72'][i%3];g.beginPath();g.moveTo(x,y);g.lineTo(x+19,y);g.lineTo(x+18+Math.sin(t*2+i)*3,y+15);g.lineTo(x+Math.sin(t*2+i)*2,y+12);g.fill();line(g,x,y,x+20,y,'#594b36',2)}
}
function air(g,t){if(Villagers.minutes<390||Villagers.minutes>1060||Weather.kind!=='sun')return;
for(let i=0;i<9;i++){const x=2290+(i%3)*95+Math.sin(t*.45+i*2)*23,y=648+Math.floor(i/3)*60+Math.cos(t*.7+i)*14,w=1+Math.abs(Math.sin(t*13+i))*3;oval(g,x-w,y,w,2,i%2?'#edc475':'#d8c5e9');oval(g,x+w,y,w,2,i%2?'#f2daa2':'#b5a7d0');line(g,x,y-2,x,y+3,'#565841')}
// A small red shuttlecock hops between children who have reached the play area.
const kids=Villagers.list.filter(n=>n.look==='child'&&!n.hidden&&n.state.startsWith('play')&&n.x>2300);
if(kids.length>1){const a=kids[0],b=kids[1],u=(t*.45)%1,x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u-8-Math.sin(u*Math.PI)*30;oval(g,x,y,2,2,'#bd6448');for(let j=-1;j<=1;j++)line(g,x,y,x+j*3,y-7,'#e4d5ac')}
}
return{init,ground,props,air,blooms};})();
