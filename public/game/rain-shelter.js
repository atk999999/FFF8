'use strict';
const RainShelter=(()=>{
const pavilion={x:1918,y:410,w:174,h:72};
function ellipse(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
function line(g,pts,c,w=1){g.strokeStyle=c;g.lineWidth=w;g.beginPath();pts.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.stroke()}
function init(){for(const x of [1924,2080])for(const y of [422,476])Collision.polygons.push({name:'Cột đình trú mưa',points:[[x-3,y-4],[x+4,y-4],[x+4,y+4],[x-3,y+4]]});}
function slot(i){return[1946+(i%6)*22,444+Math.floor(i/6)*8]}
function ground(g){g.fillStyle='#c3aa77';g.fillRect(1876,468,137,16);g.fillStyle='#726c53';g.fillRect(1916,409,178,76);g.fillStyle='#afa58a';g.fillRect(1918,411,174,71);for(let y=414;y<481;y+=12)for(let x=1920;x<2090;x+=23){g.fillStyle=(x+y)%3?'#c0b69b':'#a59f83';g.fillRect(x,y,21,10)}g.fillStyle='#263c3035';g.fillRect(1928,414,150,62)}
function well(g,t){
// Broad stone apron, round masonry well, winding drum and weathered wooden canopy.
ellipse(g,2001,651,53,18,'#394d3733');ellipse(g,2001,648,48,16,'#9d9d80');
for(let i=0;i<20;i++){let a=i*Math.PI/10;ellipse(g,2001+Math.cos(a)*45,648+Math.sin(a)*13,5,2.5,i%2?'#b8b398':'#777e65')}
g.fillStyle='#676e5c';g.fillRect(1970,626,62,23);ellipse(g,2001,648,31,10,'#6a7363');
for(let row=0;row<3;row++)for(let x=1972;x<2030;x+=12){g.fillStyle=(x+row)%3?'#a4a88e':'#838d76';g.fillRect(x+(row%2)*3,630+row*6,10,5)}
ellipse(g,2001,625,34,13,'#c4c1a3');ellipse(g,2001,625,25,8,'#343f38');ellipse(g,2001,627,20,5,'#4f7770');line(g,[[1989,628],[1997+Math.sin(t)*3,627],[2009,628]],'#a5c9ad',1);
for(const x of [1967,2034]){g.fillStyle='#594631';g.fillRect(x,587,7,62);g.fillStyle='#a58a5b';g.fillRect(x+1,588,2,57);g.fillStyle='#8e9179';g.fillRect(x-2,645,11,6)}
line(g,[[1969,601],[2038,601]],'#5c4b33',6);line(g,[[1970,598],[2035,598]],'#bf9d63',2);g.fillStyle='#937644';g.fillRect(1992,594,19,12);for(let x=1993;x<2011;x+=3)line(g,[[x,595],[x,606]],'#d1b782');line(g,[[2002,607],[2002,625]],'#c6b37e',1.5);line(g,[[2040,600],[2047,600],[2047,610]],'#635337',3);
g.fillStyle='#594b35';g.beginPath();g.moveTo(1952,590);g.lineTo(2001,560);g.lineTo(2052,590);g.lineTo(2047,596);g.lineTo(1956,596);g.closePath();g.fill();
for(let y=569;y<593;y+=5){const half=(y-560)*1.65;line(g,[[2001-half,y],[2001+half,y]],'#b59c6a',3)}line(g,[[1953,590],[2001,559],[2051,590]],'#d0ba88',2);
g.fillStyle='#94784c';g.fillRect(2036,640,13,13);ellipse(g,2042.5,640,7,3,'#c5ac74');ellipse(g,2042.5,640,5,1.7,'#4b6253');line(g,[[2037,641],[2038,634],[2047,634],[2049,641]],'#625744',1.5);
}
function back(g,t){well(g,t);for(const x of [1924,2080]){g.fillStyle='#604932';g.fillRect(x-3,350,7,72);g.fillStyle='#b08e5a';g.fillRect(x-2,352,2,69)}line(g,[[1924,358],[2080,358]],'#72583c',7);}
function front(g,t){
for(const x of [1924,2080]){g.fillStyle='#6d5136';g.fillRect(x-3,405,7,71);g.fillStyle='#c09c67';g.fillRect(x-2,406,2,66);g.fillStyle='#878673';g.fillRect(x-5,473,11,6)}
g.fillStyle='#4d4937';g.beginPath();g.moveTo(1903,404);g.lineTo(2004,322);g.lineTo(2107,404);g.lineTo(2101,414);g.lineTo(1910,414);g.closePath();g.fill();
g.save();g.beginPath();g.moveTo(1905,403);g.lineTo(2004,325);g.lineTo(2105,403);g.closePath();g.clip();for(let y=329;y<407;y+=7){line(g,[[1903,y],[2106,y]],y%2?'#a28c62':'#8e7753',4);for(let x=1905;x<2106;x+=12)line(g,[[x,y],[x-2,y+6]],'#554b36')}g.restore();line(g,[[1903,403],[2004,322],[2107,403]],'#cbb17c',3);line(g,[[1910,411],[2100,411]],'#b69862',3);
if(Weather.kind==='rain'||Weather.kind==='storm')for(let i=0;i<16;i++){const x=1915+i*12,y=416+(t*65+i*17)%48;line(g,[[x,y],[x-1,y+4]],'#bfd5d077')}
}
function coat(g,n,t){if(!n.raincoat||n.hidden)return;const sc=n.look==='child'?.76:1;g.save();g.translate(n.x,n.y);g.scale(n.dir*sc,sc);const bob=n.walk?Math.abs(Math.sin(n.walk))*1.5:0;g.translate(0,-bob);
// Layered palm-fibre cape, tied at the collar; the hem follows each stride.
g.fillStyle='#786b40';g.beginPath();g.moveTo(-10,-52);g.lineTo(8,-52);g.lineTo(16,-19);g.lineTo(-17,-18);g.closePath();g.fill();for(let row=0;row<5;row++){const y=-48+row*6,spread=10+row;for(let x=-spread;x<spread;x+=3){line(g,[[x,y],[x+Math.sin(t*3+x)*1.2,y+9]],(x+row)%2?'#b0a069':'#8b804e',2)}}line(g,[[-8,-50],[0,-45],[8,-50]],'#d0bc7f',1.5);
g.fillStyle='#b5a16a';g.beginPath();g.moveTo(-20,-65);g.lineTo(0,-80);g.lineTo(20,-65);g.quadraticCurveTo(0,-59,-20,-65);g.fill();for(let x=-16;x<20;x+=5)line(g,[[0,-78],[x,-64]],'#786c43');line(g,[[-19,-65],[0,-61],[19,-65]],'#ddc88b',1.5);g.restore()}
return{init,slot,ground,back,front,coat,pavilion};})();
