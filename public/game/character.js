'use strict';
// Articulated, shaded character rendered to a small pixel canvas.
const Character=(()=>{
const sprite=document.createElement('canvas');sprite.width=96;sprite.height=112;const g=sprite.getContext('2d');
const C={ink:'#202c31',dark:'#24464b',shade:'#356367',cloth:'#51888a',light:'#79a8a1',edge:'#abd0bb',gold:'#b39457',goldHi:'#ead49a',skin:'#d1a17a',skinHi:'#f0c7a0',hair:'#202b33',hairHi:'#52606a'};
function poly(points,fill,stroke=C.ink,w=1){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke()}}
function line(points,color,width=1){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.strokeStyle=color;g.lineWidth=width;g.stroke()}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}
function oval(x,y,rx,ry,c){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=c;g.fill()}
function sword(step){g.save();g.translate(-9,-47);g.rotate(-.38+step*.025);poly([[-3,-29],[3,-29],[3,25],[0,29],[-3,25]],'#354651');rect(-2,-25,2,47,'#6e7b78');rect(-3,20,6,4,C.gold);rect(-2,25,4,2,C.goldHi);poly([[-5,-27],[5,-27],[5,-23],[-5,-23]],C.gold);rect(-4,-27,7,1,C.goldHi);rect(-2,-39,4,12,'#3e4a4d');for(let y=-37;y<-27;y+=3)line([[-2,y],[2,y+1]],'#bda16a');oval(0,-41,3,2,C.goldHi);g.restore()}
function boot(x,step,side){g.save();g.translate(x,-8+step);poly([[-4,-11],[4,-10],[4,-1],[side?7:5,2],[side?7:5,5],[-5,5],[-5,1]],'#303e43');poly([[-3,-10],[1,-10],[1,0],[-3,0]],'#65716d',null);line([[-4,1],[4,1]],'#a6946d',2);line([[-4,4],[side?6:4,4]],'#141f25',2);for(let y=-8;y<-1;y+=3)line([[-3,y],[2,y+1]],'#94a09a');g.restore()}
function arm(x,phase,near){g.save();g.translate(x,-49);g.rotate(phase*.13);poly([[-3,-3],[4,-2],[7,12],[4,20],[-3,18],[-5,7]],near?C.cloth:C.shade);poly([[-3,-1],[0,0],[2,13],[-1,16],[-3,10]],near?C.light:C.cloth,null);line([[3,3],[4,12],[2,15]],C.dark);poly([[-3,15],[5,16],[4,21],[-3,20]],C.dark);line([[-3,16],[5,17]],C.goldHi);poly([[-2,21],[3,21],[4,25],[1,28],[-2,26]],C.skin);line([[-1,22],[1,23],[1,26]],C.skinHi);g.restore()}
function head(back,side,t,sway){g.save();g.translate(0,-55);if(back){poly([[-9,-19],[7,-20],[11,-13],[8,8],[4,18],[-7,16],[-11,5]],C.hair);line([[-7,-14],[-8,3],[-4,13]],C.hairHi);line([[4,-14],[6,1],[3,13]],'#384852');line([[-1,-12],[-2,13]],'#101f29');}else{
poly([[-8,-18],[5,-19],[10,-13],[side?12:9,-5],[side?8:6,3],[1,6],[-6,2],[-9,-6]],C.skin);poly([[-5,-14],[4,-16],[7,-11],[6,-3],[2,2],[-3,0]],C.skinHi,null);poly([[-8,-11],[-5,-8],[-5,0],[-7,-2]],'#ad7c5f',null);if(side){poly([[8,-9],[12,-5],[8,-3]],C.skinHi,null);line([[2,-10],[7,-10]],'#534039');rect(5,-8,2,2,'#26323a');rect(6,-8,1,1,'#f2e5c5');line([[6,0],[9,0]],'#9d6252');}else{line([[-6,-10],[-2,-11]],'#473b36');line([[2,-11],[6,-10]],'#473b36');const blink=t%5.7>5.52;rect(-5,-8,3,blink?1:2,'#354047');rect(3,-8,3,blink?1:2,'#354047');if(!blink){rect(-4,-8,1,1,'#e5e2c7');rect(4,-8,1,1,'#e5e2c7')}line([[0,-6],[-1,-2],[1,-2]],'#bb8c6a');line([[-1,1],[3,1]],'#a76e5b')}
poly([[-10,-16],[-7,-23],[1,-25],[8,-21],[11,-14],[7,-10],[4,-17],[0,-13],[-4,-16],[-8,-8]],C.hair);line([[-7,-18],[-3,-21],[2,-21],[6,-18]],C.hairHi);line([[-6,-19],[-1,-22],[3,-21]],'#6b7274');poly([[-10,-13],[-7,-12],[-6,3],[-9,-1]],'#28333b');if(!side)poly([[8,-13],[10,-12],[9,2],[7,4]],'#26303a');}
poly([[-5,-25],[-6,-30],[-2,-34],[4,-33],[7,-29],[4,-24]],'#28343b');line([[-3,-30],[1,-32],[4,-29]],'#626a6b');line([[-6,-25],[6,-25]],C.gold,2);rect(-1,-27,3,3,C.goldHi);line([[-8,-29],[9,-27]],'#c9c5a6',1);oval(9,-27,1.5,1.5,C.goldHi);g.restore()}
// Dedicated three-quarter side silhouette: rear limbs, robe, near arm, then face.
function profile(step,flutter,t,fast){
const stride=step*(fast?7:5);
// Scabbard stays close to the back instead of projecting beside the face.
g.save();g.translate(-10,-46);g.rotate(.15+step*.018);poly([[-2,-24],[2,-24],[3,24],[0,28],[-2,25]],'#33464e');line([[-1,-21],[0,22]],'#809087');rect(-2,19,5,3,C.gold);rect(-4,-24,8,3,C.gold);rect(-1,-35,3,11,'#39474c');for(let y=-33;y<-24;y+=3)line([[-1,y],[2,y+1]],'#c6ae79');oval(0,-36,2,2,C.goldHi);g.restore();
// Back hair and ribbon follow the motion of the coat.
poly([[-7,-71],[-11,-59],[-12+flutter*.4,-43],[-8+flutter*.4,-39],[-6,-53],[-2,-65]],C.hair);line([[-7,-65],[-9,-51],[-8+flutter*.4,-44]],'#50626a');
g.save();g.translate(2,-1);boot(-stride*.7,-Math.max(0,step)*2,true);g.restore();
// Far sleeve and hand peek ahead of the chest on the return swing.
g.save();g.translate(4,-51);g.rotate(step*(fast?.44:.32));poly([[-2,0],[3,0],[5,13],[3,20],[-2,19],[-4,8]],C.shade);poly([[-1,19],[3,19],[4,24],[1,26],[-1,24]],C.skin);line([[-2,17],[4,17]],C.gold);g.restore();
// Tunic is narrower in profile; the rear hem trails, the front opens over the boot.
poly([[-8,-40],[7,-39],[8,-27],[10+stride*.2,-13],[4+stride*.3,-10],[0,-18],[-5-stride*.3,-10],[-14-flutter*.5,-13],[-10,-25]],C.dark);
poly([[-6,-36],[0,-34],[-2,-21],[-6-stride*.2,-12],[-11-flutter*.4,-14]],C.cloth,null);line([[-11-flutter*.4,-14],[-6-stride*.2,-12],[-2,-18]],C.gold);line([[-6,-30],[-7,-20]],'#81a99f');
g.save();g.translate(stride,-Math.max(0,-step)*2);boot(2,0,true);g.restore();
poly([[1,-34],[7,-35],[8,-23],[9+stride*.2,-13],[4+stride*.2,-11],[0,-19]],C.shade);line([[4+stride*.2,-12],[8+stride*.2,-14]],C.gold);line([[4,-29],[5,-21]],'#80a39a');
poly([[-7,-54],[1,-56],[7,-52],[10,-44],[7,-32],[-6,-31],[-10,-42]],C.cloth);poly([[-6,-52],[-1,-53],[2,-43],[0,-33],[-6,-34]],C.light,null);poly([[6,-50],[9,-43],[6,-34],[3,-35]],C.shade,null);
// Collar wraps the visible shoulder, rather than a frontal V pasted on the side.
poly([[0,-56],[5,-56],[7,-52],[3,-46],[-1,-50]],'#ded9bc');poly([[6,-52],[8,-48],[3,-38],[0,-41]],C.dark);line([[6,-51],[2,-40]],C.goldHi);
line([[-8,-49],[5,-37]],'#354b4e',3);line([[-8,-50],[5,-38]],'#b49a66');
poly([[-7,-35],[7,-35],[7,-30],[-7,-30]],'#4d4437');line([[-7,-34],[7,-34]],C.gold);rect(4,-35,4,5,C.goldHi);rect(5,-34,2,3,'#739582');
poly([[-9,-29],[-4,-29],[-3,-21],[-7,-19],[-11,-22]],'#8c7552');line([[-9,-27],[-5,-26],[-5,-22]],'#b6a171');
line([[5,-29],[6,-22]],'#dbc48b');oval(6,-21,2,3,'#91b9a0');rect(6,-22,1,2,'#e1ebcf');
poly([[-2,-30],[1,-30],[-3-flutter,-20],[-8-flutter,-15],[-7-flutter,-20]],'#cbbc94',null);
// Near sleeve pivots at the shoulder, bent naturally at the elbow.
g.save();g.translate(-3,-50);g.rotate(-step*(fast?.48:.34)-.06);poly([[-4,-2],[3,-3],[6,3],[5,12],[3,19],[-3,18],[-5,7]],C.cloth);poly([[-3,0],[0,-1],[2,5],[1,13],[-2,14]],C.light,null);line([[3,3],[3,10],[1,14]],C.dark);poly([[-3,15],[4,16],[3,20],[-3,19]],C.dark);line([[-3,16],[4,17]],C.goldHi);poly([[-2,20],[2,20],[3,24],[1,26],[-2,25],[-3,23]],C.skin);line([[-1,21],[1,22],[1,24]],C.skinHi);poly([[-4,-1],[-2,-4],[2,-4],[4,-1],[2,2],[-3,2]],'#547b7b',C.gold);g.restore();
// Compact three-quarter face: small nose, one clear eye and a shaded far eye.
g.save();g.translate(1,-56);poly([[-3,0],[3,-1],[4,5],[0,7],[-4,4]],C.skin);poly([[-6,-19],[1,-22],[7,-19],[9,-14],[8,-9],[10,-6],[8,-5],[8,-1],[4,3],[0,4],[-5,1],[-8,-6]],C.skin);poly([[-2,-16],[5,-17],[7,-12],[6,-7],[8,-5],[6,0],[2,2],[-2,-1]],C.skinHi,null);poly([[-6,-12],[-3,-10],[-3,-2],[0,3],[-4,1],[-6,-4]],'#b78263',null);
line([[2,-11],[6,-11]],'#534039');const blink=t%5.7>5.52;rect(4,-9,2,blink?1:2,'#29343b');if(!blink)rect(5,-9,1,1,'#f3e7c9');line([[7,-4],[8,-4]],'#b78665');line([[5,-1],[7,-1]],'#9c6655');
// Hair curves around the skull and ear with a short, clean fringe.
poly([[-9,-14],[-8,-21],[-3,-25],[3,-25],[8,-21],[10,-16],[6,-14],[3,-18],[0,-15],[-3,-16],[-4,-8],[-8,-4]],C.hair);line([[-7,-20],[-3,-23],[2,-23],[6,-20]],'#58666e');line([[-6,-19],[-2,-21],[2,-21]],'#717a7b');poly([[-8,-13],[-5,-12],[-4,-3],[-6,1],[-9,-4]],'#2b3740');oval(-3,-7,2,3,C.skin);line([[-3,-8],[-2,-7],[-3,-5]],'#a36e54');poly([[-6,-24],[-7,-29],[-4,-33],[1,-33],[4,-29],[2,-25]],'#27333b');line([[-4,-29],[-1,-31],[1,-28]],'#59676d');line([[-6,-25],[3,-25]],C.gold,2);rect(-2,-27,3,2,C.goldHi);line([[-9,-28],[5,-27]],'#d0c7a5');oval(5,-27,1,1,C.goldHi);g.restore();
}

function draw(ctx,p,t){const moving=p.walk>0,fast=!!p.sprinting,step=moving?Math.sin(p.walk):0,bob=moving?Math.abs(Math.sin(p.walk))*(fast?2.4:1.4):Math.sin(t*2)*.45,side=p.dir==='right'||p.dir==='left',back=p.dir==='up';g.clearRect(0,0,96,112);g.save();g.translate(48,103);if(p.dir==='left')g.scale(-1,1);g.translate(fast&&moving?2:0,-bob);if(side)g.rotate(fast&&moving?.06:0);
const flutter=Math.sin(t*3+p.walk*.6)*(moving?4:1.5);
if(side){profile(step,flutter,t,fast)}else{
// Rear hair ribbon and coat tails.
poly([[-6,-67],[-11+flutter,-49],[-9+flutter,-33],[-4+flutter,-30],[-5,-48]],'#283b40');line([[-6,-61],[-7+flutter,-43],[-6+flutter,-35]],'#607274');
sword(step);if(side)arm(-5,-step, false);
boot(side?-3:-5,step*(fast?4:3),side);boot(side?3:5,-step*(fast?4:3),side);
poly([[-10,-40],[10,-40],[12+flutter*.3,-22],[17+flutter,-10],[5+flutter*.4,-8],[0,-15],[-7,-8],[-17+flutter*.5,-12],[-12,-26]],C.dark);
poly([[-9,-36],[-1,-33],[-3,-14],[-9,-10],[-13,-13]],C.cloth,null);poly([[2,-36],[9,-36],[12+flutter*.6,-14],[5,-11],[1,-17]],C.shade,null);
line([[-12,-13],[-7,-11],[-2,-16]],C.gold);line([[3,-13],[6,-11],[13+flutter*.5,-13]],C.gold);line([[-8,-30],[-9,-17]],'#82a99d');line([[7,-27],[9,-17]],'#668e85');
if(!side)arm(-12,step,false);
poly([[-9,-55],[7,-55],[12,-49],[10,-34],[4,-29],[-8,-31],[-12,-43]],C.cloth);
poly([[-8,-53],[-3,-51],[-2,-36],[-7,-33],[-10,-43]],C.light,null);poly([[5,-52],[10,-48],[8,-35],[4,-33]],C.shade,null);
if(back){line([[-1,-52],[-1,-36]],'#86ada4');poly([[-5,-46],[0,-49],[5,-46],[0,-41]],'#416d72',C.gold);line([[-3,-46],[0,-44],[3,-46]],C.goldHi);}
else{poly([[-7,-55],[-1,-58],[4,-55],[0,-48],[-2,-43]],'#e0d9bc');poly([[5,-55],[8,-52],[-1,-39],[-4,-41]],C.dark);line([[5,-54],[-2,-41]],C.goldHi);line([[-7,-53],[-3,-46]],'#b7c9b4');}
// Shoulder binding, belt, buckle, jade ornament and small pouch.
poly([[-12,-50],[-9,-54],[-5,-53],[-7,-48]],'#45686b',C.gold);line([[-11,-51],[-7,-51]],C.goldHi);
poly([[-10,-35],[10,-35],[10,-30],[-9,-29]],'#4e4237');line([[-9,-34],[9,-34]],C.gold);rect(-2,-35,5,5,C.goldHi);rect(-1,-34,3,3,'#698a75');
poly([[7,-28],[13,-28],[15,-20],[11,-18],[7,-21]],'#8b7251');line([[8,-27],[12,-26],[12,-21]],'#b49c6b');line([[5,-30],[6,-23]],'#c1ae7c');oval(6,-22,2,3,'#8cb9a0');rect(6,-23,1,2,'#deead0');
if(!side)arm(12,-step,true);else arm(7,step,true);
// Trailing cloth is light, articulated, and never hides the face.
poly([[2,-30],[5,-30],[7+flutter,-18],[12+flutter,-13],[8+flutter,-13],[3,-20]],'#d6c395',null);line([[4,-29],[5+flutter,-19]],'#f0dfb4');
head(back,side,t,flutter);if(back){g.save();g.translate(4,-25);g.rotate(-.3);rect(-2,-39,4,39,'#394d58');rect(-1,-36,1,32,'#82918a');rect(-3,-35,6,2,C.gold);rect(-2,-3,4,3,C.goldHi);g.restore()}
}
g.restore();ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));ctx.fillStyle='#132b244b';ctx.beginPath();ctx.ellipse(0,-1,15,5,0,0,Math.PI*2);ctx.fill();ctx.imageSmoothingEnabled=false;ctx.drawImage(sprite,-43,-93,86,100);ctx.restore();ctx.textAlign='center';ctx.font='bold 10px system-ui';ctx.fillStyle='#10261ed9';ctx.fillRect(p.x-28,p.y-99,56,15);ctx.fillStyle='#fff1bb';ctx.fillText('Lữ khách',p.x,p.y-88);}
return{draw};})();
