'use strict';
// The traveller renderer and sprite stay available in data, but are not selectable in chapter one.
const PlayerRoster={tieuPham:{id:'tieuPham',name:'Tiểu Phàm',age:14,origin:'Làng Du Lãm',outfit:'Áo vải thô',hp:100,maxHp:100,mp:0,maxMp:0,realm:'Phàm Nhân',level:1,playable:true},traveller:{id:'traveller',name:'Lữ khách',renderer:Character,sprite:'hero.png',playable:false}};
const TieuPham=(()=>{
const sprite=document.createElement('canvas');sprite.width=96;sprite.height=112;const g=sprite.getContext('2d');
const C={
  ink:'#23201b',
  dark:'#5c4d3c',
  shade:'#786650',
  cloth:'#988368',
  light:'#b5a082',
  collar:'#e8dec3',
  sash:'#47585c',
  sashHi:'#6c8387',
  pouch:'#8c6d46',
  pouchHi:'#b89668',
  pants:'#3a3d3b',
  pantsHi:'#525754',
  wrap:'#c9bc9c',
  shoe:'#544332',
  shoeSole:'#cbb88e',
  skin:'#dfb188',
  skinHi:'#f4cfa8',
  skinShade:'#bf8c67',
  hair:'#25211d',
  hairHi:'#4a423a',
  tie:'#9e493b',
  tieHi:'#c96b59'
};
function poly(points,fill,stroke=C.ink,w=1){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke()}}
function line(points,color,width=1){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.strokeStyle=color;g.lineWidth=width;g.stroke()}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}
function oval(x,y,rx,ry,c){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=c;g.fill()}

function shoe(x,step,side){
  g.save();
  g.translate(x,-7+step);
  // Trousers & calf wrap (xà cạp)
  poly([[-4,-12],[4,-12],[4,-5],[-4,-5]],C.pants);
  poly([[-3,-12],[1,-12],[1,-5],[-3,-5]],C.pantsHi,null);
  poly([[-3.5,-5],[3.5,-5],[3.5,0],[-3.5,0]],C.wrap);
  line([[-3,-3],[3,-3]],'#9e9072',1);
  line([[-3,-1],[3,-1]],'#9e9072',1);
  // Village cloth/straw shoe
  poly([[-4,0],[4,0],[side?6:5,2],[side?6:5,4.5],[-4.5,4.5],[-4.5,1]],C.shoe);
  line([[-4,3.8],[side?5.5:4.5,3.8]],C.shoeSole,1.6);
  g.restore();
}

function arm(x,phase,near){
  g.save();
  g.translate(x,-45);
  g.rotate(phase*.14);
  // Sleeve
  poly([[-3,-2],[3.5,-2],[5.5,10],[3.5,16],[-3,15],[-4.5,6]],near?C.cloth:C.shade);
  poly([[-2.5,-1],[0.5,0],[1.5,10],[-1,13],[-2.5,8]],near?C.light:C.cloth,null);
  // Rolled cuff / wrist wrap
  poly([[-3,13],[4,13.5],[3.5,17.5],[-3,17]],C.sash);
  line([[-2.5,14.5],[3.5,15]],C.sashHi);
  // Hand
  poly([[-2,17.5],[2.5,17.5],[3,21.5],[0.5,23.5],[-2,22]],C.skin);
  line([[-1,18.5],[1,19],[1,21.5]],C.skinHi);
  g.restore();
}

function head(back,t,flutter){
  g.save();
  g.translate(0,-50);
  if(back){
    // Full back hair
    poly([[-9,-18],[9,-18],[11,-11],[9,5],[5,11],[-5,11],[-9,5],[-11,-11]],C.hair);
    line([[-6,-14],[-7,2],[-4,9]],C.hairHi);
    line([[6,-14],[7,2],[4,9]],C.hairHi);
    line([[0,-15],[0,9]],'#171411');
  }else{
    // Neck
    poly([[-3,1],[3,1],[3.5,6],[-3.5,6]],C.skinShade);
    poly([[-2,1],[2,1],[2,5],[-2,5]],C.skin,null);
    // Ears
    oval(-9.5,-6,2,3,C.skin);
    oval(9.5,-6,2,3,C.skin);
    // Symmetrical youthful face
    poly([[-8.5,-16],[8.5,-16],[9.5,-8],[8,-1],[3,4],[-3,4],[-8,-1],[-9.5,-8]],C.skin);
    poly([[-6,-14],[6,-14],[7,-7],[5,-1],[2,2.5],[-2,2.5],[-5,-1],[-7,-7]],C.skinHi,null);
    // Warm cheek blush
    oval(-5.5,-3.5,2,1.2,'#d99278');
    oval(5.5,-3.5,2,1.2,'#d99278');
    // Brows
    line([[-6.5,-10],[-2.5,-10.5]],'#382e26',1.3);
    line([[2.5,-10.5],[6.5,-10]],'#382e26',1.3);
    // Eyes with natural blink
    const blink=t%5.4>5.22;
    if(blink){
      line([[-6,-7.5],[-2.5,-7.5]],'#2a231d',1.5);
      line([[2.5,-7.5],[6,-7.5]],'#2a231d',1.5);
    }else{
      rect(-6,-9,3,3,'#241f1b');
      rect(3,-9,3,3,'#241f1b');
      rect(-5,-9,1.2,1.2,'#f7f0dc');
      rect(4,-9,1.2,1.2,'#f7f0dc');
    }
    // Nose & youthful smile
    line([[0,-6.5],[-0.8,-3.5],[0.8,-3.5]],C.skinShade,1.1);
    line([[-2,-0.5],[0,0.3],[2,-0.5]],'#9e624d',1.2);
    // Symmetrical hair crown, parted bangs, and side locks
    poly([[-10,-12],[-9,-19],[-3,-22],[3,-22],[9,-19],[10,-12],[7,-9],[5,-15],[1,-12],[0,-16],[-1,-12],[-5,-15],[-7,-9]],C.hair);
    line([[-6,-17],[-2,-19],[2,-19],[6,-17]],C.hairHi);
    poly([[-10,-12],[-7.5,-11],[-7,1],[-9.5,-1]],C.hair);
    poly([[10,-12],[7.5,-11],[7,1],[9.5,-1]],C.hair);
  }
  // Topknot (búi tóc thiếu niên) & red-brown cloth tie
  poly([[-4.5,-21],[-5.5,-26],[-2,-29],[2,-29],[5.5,-26],[4.5,-21]],C.hair);
  line([[-2.5,-26],[0,-27.5],[2.5,-26]],C.hairHi);
  poly([[-5,-21],[5,-21],[4.5,-18.5],[-4.5,-18.5]],C.tie);
  line([[-4,-20],[4,-20]],C.tieHi,1.2);
  if(back){
    poly([[-1,-20],[-4+flutter*.4,-10],[-1.5+flutter*.4,-9],[0.5,-19]],C.tie);
    poly([[1,-20],[4+flutter*.4,-11],[1.5+flutter*.4,-10],[-0.5,-19]],C.tie);
  }
  g.restore();
}

function profile(step,flutter,t,fast,atkPhase=0,combo=0){
  // Compute 3-phase punch kinematics when attacking (atkPhase in 0..1)
  // Phase 1 (0..0.22): wind-up coil back; Phase 2 (0.22..0.58): explosive snap thrust; Phase 3 (0.58..1): retract
  let coil=0,thrust=0;
  if(atkPhase>0){
    if(atkPhase<0.22){
      coil=Math.sin((atkPhase/0.22)*(Math.PI/2));
    }else if(atkPhase<0.58){
      const u=(atkPhase-0.22)/0.36;
      coil=1-u;
      thrust=Math.sin(u*(Math.PI/2));
    }else{
      const u=(atkPhase-0.58)/0.42;
      thrust=Math.cos(u*(Math.PI/2));
    }
  }
  const isHeavy=combo===2;
  const stride=atkPhase>0?(thrust*6.2-coil*2.2):step*(fast?6.5:4.5);
  // Trailing hair tie ribbon behind head (whips backward during punch thrust)
  const ribbonWhip=thrust*5.5-coil*1.5;
  poly([[-5,-69],[-9-flutter*.4-ribbonWhip,-61-thrust*2],[-8-flutter*.5-ribbonWhip*1.1,-54-thrust*1.5],[-4,-67]],C.tie);
  // Far leg planted firmly behind body in martial arts bow stance (tấn pháp)
  g.save();
  g.translate(-stride*.68-thrust*2.5,-Math.max(0,step)*1.8);
  shoe(1,0,true);
  g.restore();
  // Far arm (chambered guard fist or alternate combo punch)
  g.save();
  if(atkPhase>0){
    if(combo===1){
      // Combo 2: far arm is the striking lead hand!
      g.translate(4+thrust*8-coil*3,-45-thrust*1.5);
      g.rotate(-1.48*thrust+0.35*coil);
    }else{
      // Guard / chambered fist pulled back to hip
      g.translate(-3-thrust*3.5+coil*2,-44+thrust*2);
      g.rotate(0.55*thrust-0.3*coil);
    }
  }else{
    g.translate(3,-46);
    g.rotate(step*(fast?.42:.3));
  }
  poly([[-2,0],[2.5,0],[4,11],[2.5,16],[-2,15],[-3,7]],C.shade);
  poly([[-2,12],[3,12],[2.5,15.5],[-2,15]],C.sash);
  poly([[-1.5,15.5],[2.8,15.5],[3.4,19.8],[0.5,21.2],[-2,19.8]],C.skin);
  g.restore();
  // Near leg lunging forward in bow stance
  g.save();
  g.translate(stride*.85+thrust*2.2,-Math.max(0,-step)*1.8);
  shoe(-1,0,true);
  g.restore();
  // Lower tunic skirt in profile (flares dynamically with stance lunge)
  poly([[-7-thrust*1.5,-34],[6+thrust*1.5,-34],[7+stride*.18+thrust*2.5,-13],[2+stride*.2,-11],[-1,-19],[-4-stride*.2,-11],[-9-flutter*.35-thrust*2,-13],[-8,-24]],C.dark);
  poly([[-6,-33],[0,-32],[-1,-18],[-4-stride*.15,-12],[-8-flutter*.3-thrust*1.5,-14]],C.cloth,null);
  poly([[0,-33],[5.5,-33],[6.5+stride*.15+thrust*2,-14],[2+stride*.15,-12],[-0.5,-19]],C.shade,null);
  line([[-7.5-flutter*.3-thrust*1.5,-14],[0,-19],[6+stride*.15+thrust*2,-14]],C.light);
  // Upper torso in profile (twists into the punch)
  g.save();
  g.translate(thrust*1.8-coil*1.2,thrust*0.8);
  poly([[-6.5,-48],[1,-50],[6,-47],[8,-39],[6,-30],[-6,-30],[-8,-39]],C.cloth);
  poly([[-5.5,-46],[0,-47],[2,-38],[0,-31],[-5.5,-32]],C.light,null);
  poly([[4,-45],[7,-39],[5,-31],[2,-32]],C.shade,null);
  // Cross collar wrapping shoulder in profile
  poly([[0,-50],[4.5,-50],[6.5,-46],[3,-40],[-1,-44]],C.collar);
  poly([[5,-46],[7,-43],[2.5,-34],[0,-36]],C.dark);
  line([[4.5,-46],[1.5,-35]],C.light);
  // Cloth waist sash
  poly([[-6.5,-33],[6.5,-33],[6.5,-28.5],[-6.5,-28.5]],C.sash);
  line([[-6,-31.5],[6,-31.5]],C.sashHi);
  // Small village pouch at hip
  poly([[-5,-28.5],[0,-28.5],[1,-21],[-2.5,-19.5],[-6,-22]],C.pouch);
  line([[-4,-27],[-1,-26.5],[-1,-21.5]],C.pouchHi);
  g.restore();
  // Near arm: either chambers at waist (when combo===1) or snaps out in a horizontal martial-arts punch
  g.save();
  if(atkPhase>0){
    if(combo===1){
      // Chambered near fist at waist while far arm strikes
      g.translate(-5.5-thrust*2,-42+thrust*3);
      g.rotate(0.68*thrust-0.25*coil);
      poly([[-3.5,-2],[3,-2.5],[5,3],[4.5,11],[2.5,16.5],[-3,15.5],[-4.5,6]],C.cloth);
      poly([[-3,12.5],[3.5,13],[3,17],[-3,16.5]],C.sash);
      poly([[-2.5,17],[3,17],[3.5,21],[0.5,22],[-2.5,21]],C.skin);
    }else{
      // Explosive horizontal punch thrust with clenched fist
      const reachX=3+thrust*(isHeavy?10.5:8.5)-coil*4.5;
      const reachY=-45-thrust*2.2+coil*1.5;
      g.translate(reachX,reachY);
      g.rotate(-1.52*thrust+0.48*coil);
      // Billowing sleeve & forearm bracer
      poly([[-3.5,-2],[3.2,-2.5],[5.2,3],[4.8,11.5],[2.8,16.5],[-3,15.5],[-4.5,6]],C.cloth);
      poly([[-2.5,0],[0.8,-1],[1.8,5],[1.2,11.5],[-2,12]],C.light,null);
      poly([[-3.2,12.2],[3.8,12.8],[3.3,17],[-3.2,16.5]],C.sash);
      line([[-2.5,14],[3.2,14.5]],C.sashHi);
      // Clenched martial arts fist (nắm đấm siết chặt) with knuckle highlights
      const fScale=1+thrust*(isHeavy?0.28:0.16);
      g.scale(fScale,fScale);
      poly([[-3.2,16.8],[3.6,16.8],[4.2,21.8],[1.5,23.4],[-2.8,22.8],[-3.6,19.5]],C.skin);
      line([[-2,18.2],[2.5,18.2]],C.skinHi,1.2);
      line([[-1.8,20.5],[2.2,20.5]],C.skinShade,1);
    }
  }else{
    g.translate(-2,-45);
    g.rotate(-step*(fast?.46:.32)-.05);
    poly([[-3.5,-2],[3,-2.5],[5,3],[4.5,11],[2.5,16.5],[-3,15.5],[-4.5,6]],C.cloth);
    poly([[-2.5,0],[0.5,-1],[1.5,5],[1,11.5],[-2,12]],C.light,null);
    poly([[-3,12.5],[3.5,13],[3,17],[-3,16.5]],C.sash);
    line([[-2.5,14],[3,14.5]],C.sashHi);
    poly([[-2.5,17],[3,17],[3.8,21.5],[1,23],[-2.5,21.5],[-3,19.5]],C.skin);
    line([[-1,18],[1.5,18.5],[1.5,21]],C.skinHi);
  }
  g.restore();
  // Youthful three-quarter profile head (leans forward with fierce brow during punch)
  g.save();
  g.translate(0.5+thrust*2.4-coil*1.0,-50+thrust*0.8);
  // Neck
  poly([[-2.5,0],[2.5,-1],[3,5],[-3,4]],C.skin);
  // Head & jawline with small nose
  poly([[-6,-17],[1,-19],[6.5,-17],[8.5,-12],[7.5,-7.5],[9.5,-5],[7.5,-3.5],[7.5,0],[3.5,3.5],[-0.5,4],[-5,1],[-7.5,-6]],C.skin);
  poly([[-2,-15],[5,-15.5],[6.5,-11],[6,-6.5],[7.5,-5],[6,0],[2,2],[-2,-1]],C.skinHi,null);
  poly([[-6,-11],[-3,-9],[-3,-1],[0,3],[-4,1],[-6,-4]],C.skinShade,null);
  oval(3.5,-3,1.8,1.1,'#d99278');
  // Eyebrow (angled sharply when punching) & eye
  line([[2,-10-thrust*0.6],[6,-10+thrust*0.7]],'#382e26',1.4);
  const blink=atkPhase<=0&&t%5.4>5.22;
  if(blink){
    line([[3,-7.5],[6,-7.5]],'#241f1b',1.5);
  }else{
    rect(3.5,-8.5,2.2,2.6,'#241f1b');
    rect(4.5,-8.5,1,1,'#f7f0dc');
  }
  // Determined mouth during punch vs gentle smile at rest
  if(atkPhase>0.15){
    line([[4.2,-1.2],[6.8,-0.8]],'#7a4432',1.4);
  }else{
    line([[4.5,-1],[6.8,-1.2]],'#9e624d',1.2);
  }
  // Hair cap, bangs & sideburn around ear
  poly([[-8.5,-12],[-7.5,-19],[-3,-22],[3,-22],[7.5,-19],[9,-14],[5.5,-12.5],[3,-16],[0,-13.5],[-2.5,-14.5],[-3.5,-7],[-7.5,-3]],C.hair);
  line([[-6.5,-17.5],[-2.5,-20],[2,-20],[5.5,-17.5]],C.hairHi);
  poly([[-7.5,-11],[-4.5,-10],[-3.5,-2],[-5.5,1.5],[-8.5,-3]],C.hair);
  // Ear
  oval(-2.5,-6,2,2.8,C.skin);
  line([[-2.5,-7],[-1.8,-6],[-2.5,-4.5]],C.skinShade);
  // Topknot & tie
  poly([[-5,-21],[-6,-26],[-3,-29],[1.5,-29],[4,-25.5],[2,-21]],C.hair);
  line([[-3.5,-26],[-1,-27.5],[1.5,-25.5]],C.hairHi);
  poly([[-4.5,-21],[3,-21],[2.5,-18.5],[-4,-18.5]],C.tie);
  line([[-4,-19.8],[2.5,-19.8]],C.tieHi,1.2);
  g.restore();
}

const OUTFIT_PALETTES=[
  {name:'Áo vải thô mộc',dark:'#5c4d3c',shade:'#786650',cloth:'#988368',light:'#b5a082',sash:'#47585c',sashHi:'#6c8387'},
  {name:'Áo vải chàm',dark:'#33444f',shade:'#465d6b',cloth:'#5c7887',light:'#7b98a8',sash:'#6b533b',sashHi:'#8f7255'},
  {name:'Áo nâu sồng',dark:'#4f3829',shade:'#6b4d39',cloth:'#87634b',light:'#a67f65',sash:'#425949',sashHi:'#61806a'}
];
let outfitIdx=0;
function applyOutfit(idx){
  outfitIdx=((idx%OUTFIT_PALETTES.length)+OUTFIT_PALETTES.length)%OUTFIT_PALETTES.length;
  const pal=OUTFIT_PALETTES[outfitIdx];
  C.dark=pal.dark;C.shade=pal.shade;C.cloth=pal.cloth;C.light=pal.light;C.sash=pal.sash;C.sashHi=pal.sashHi;
  if(PlayerRoster&&PlayerRoster.tieuPham)PlayerRoster.tieuPham.outfit=pal.name;
  return pal;
}

const ATTACK_DURATION=0.38;
const ATTACK_COOLDOWN=0.85;

function triggerAttack(p){
  if(!p||(p.attackCooldown||0)>0)return false;
  p.attackTimer=ATTACK_DURATION;
  p.attackCooldown=ATTACK_COOLDOWN;
  p.attackCooldownMax=ATTACK_COOLDOWN;
  p.attackCombo=((p.attackCombo||0)+1)%3;
  return true;
}

function draw(ctx,p,t){
  const moving=p.walk>0,fast=!!p.sprinting,step=moving?Math.sin(p.walk):0,side=p.dir==='right'||p.dir==='left',back=p.dir==='up';
  const atkPhase=p.attackTimer>0?Math.max(0,Math.min(1,1-p.attackTimer/ATTACK_DURATION)):0;
  // Envelope of strike extension (peaks sharply at atkPhase ~ 0.48)
  const atk=atkPhase>0?(atkPhase<0.22?-0.25*Math.sin((atkPhase/0.22)*(Math.PI/2)):atkPhase<0.58?Math.sin(((atkPhase-0.22)/0.36)*(Math.PI/2)):Math.cos(((atkPhase-0.58)/0.42)*(Math.PI/2))):0;
  const strike=Math.max(0,atk);
  const combo=p.attackCombo||0;
  const isHeavy=combo===2;
  const bob=atkPhase>0?-strike*1.8:(moving?Math.abs(Math.sin(p.walk))*(fast?2.1:1.3):Math.sin(t*2.2)*.4);
  g.clearRect(0,0,96,112);
  g.save();
  g.translate(48,103);
  if(p.dir==='left')g.scale(-1,1);
  g.translate((fast&&moving?1.5:0)+(side?atk*(isHeavy?5.2:3.8):0),-bob);
  if(side)g.rotate((fast&&moving?.05:0)+atk*(isHeavy?.11:.08));
  const flutter=Math.sin(t*3+p.walk*.6)*(moving?3.2:1.1)+strike*2.5;
  if(side){
    profile(step,flutter,t,fast,atkPhase,combo);
  }else{
    const stride=atkPhase>0?strike*3.2:step*(fast?3.8:2.8);
    // Legs & village shoes (widen into horse/bow stance when punching)
    shoe(-4.5-strike*1.5,stride,false);
    shoe(4.5+strike*1.5,-stride,false);
    // Left arm
    g.save();
    if(atkPhase>0&&combo===1){
      g.translate(-1,back?-strike*11:strike*8);
      g.scale(1+strike*0.22,1+strike*0.22);
    }else if(atkPhase>0){
      g.translate(-1.5,-strike*3);
    }
    arm(-10.5,step*(fast?1.3:1),false);
    g.restore();
    // Lower tunic skirt
    poly([[-9-strike,-34],[9+strike,-34],[11+flutter*.25+strike,-13],[4,-11],[0,-17],[-4,-11],[-11+flutter*.25-strike,-13]],C.dark);
    poly([[-8,-33],[-1,-31],[-2,-15],[-8.5,-12.5],[-10,-14]],C.cloth,null);
    poly([[1,-33],[8,-33],[10,-14],[8.5,-12.5],[2,-15]],C.shade,null);
    line([[-9.5,-13.5],[-3.5,-12],[0,-16.5],[3.5,-12],[9.5,-13.5]],C.light);
    // Upper torso tunic
    poly([[-8.5,-49],[8.5,-49],[10.5,-43],[9,-31],[-9,-31],[-10.5,-43]],C.cloth);
    poly([[-7.5,-47],[-2,-46],[-1.5,-32],[-7.5,-32],[-9,-42]],C.light,null);
    poly([[3,-47],[8,-46],[9,-42],[7.5,-32],[2,-32]],C.shade,null);
    if(back){
      poly([[-5,-50],[5,-50],[6,-47],[-6,-47]],C.dark);
      line([[0,-47],[0,-33]],C.dark);
      poly([[-9,-33],[9,-33],[9,-28.5],[-9,-28.5]],C.sash);
      line([[-8.5,-31],[8.5,-31]],C.sashHi);
    }else{
      poly([[-5.5,-50],[0,-43],[5.5,-50],[3,-50],[0,-45.5],[-3,-50]],C.collar);
      line([[-4.5,-49],[1.5,-38]],C.dark,2);
      line([[4.5,-49],[-1,-42]],C.dark,2);
      poly([[-9,-33],[9,-33],[9,-28.5],[-9,-28.5]],C.sash);
      line([[-8.5,-31],[8.5,-31]],C.sashHi);
      poly([[-2,-33],[2,-33],[2.5,-27.5],[-2.5,-27.5]],C.sashHi);
      poly([[-2,-28],[1.5,-28],[2.5+flutter*.3,-19],[-0.5+flutter*.3,-18],[-2,-23]],C.sash);
      poly([[4.5,-28.5],[9,-28.5],[10,-21],[6.5,-19.5],[4,-22]],C.pouch);
      line([[5.5,-27],[8.5,-26.5],[8.5,-21.5]],C.pouchHi);
    }
    // Right arm
    g.save();
    if(atkPhase>0&&combo!==1){
      g.translate(1,back?-strike*11:strike*8);
      g.scale(1+strike*0.24,1+strike*0.24);
    }else if(atkPhase>0){
      g.translate(1.5,-strike*3);
    }
    arm(10.5,-step*(fast?1.3:1),true);
    g.restore();
    // Head
    head(back,t,flutter);
  }
  g.restore();
  ctx.save();
  ctx.translate(Math.round(p.x),Math.round(p.y));
  ctx.fillStyle='#152d244b';
  ctx.beginPath();
  ctx.ellipse(0,-1,13+strike*3,4.5,0,0,Math.PI*2);
  ctx.fill();

  // Ground dust puff behind planted foot during punch lunge
  if(atkPhase>0.18&&atkPhase<0.85){
    const dustP=(atkPhase-0.18)/0.67;
    const dustAlpha=(1-dustP)*0.55;
    const dustDir=p.dir==='left'?1:p.dir==='right'?-1:0;
    ctx.fillStyle=`rgba(218, 198, 152, ${dustAlpha.toFixed(2)})`;
    for(let i=0;i<3;i++){
      const dx=dustDir*(8+dustP*16+i*5)+(i-1)*3;
      const dy=-1-dustP*(4+i*2.5);
      const r=(3.8-i*0.7)*(1-dustP*0.4);
      ctx.beginPath();
      ctx.arc(dx,dy,Math.max(0.8,r),0,Math.PI*2);
      ctx.fill();
    }
  }

  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(sprite,-43,-93,86,100);

  // Martial arts fist shockwave & wind streaks when attacking (kình phong nắm đấm)
  if(strike>0.06){
    ctx.save();
    const ang=p.dir==='left'?Math.PI:p.dir==='up'?-Math.PI/2:p.dir==='down'?Math.PI/2:0;
    const yOff=p.dir==='up'?-44:p.dir==='down'?-24:-35;
    ctx.translate(0,yOff);
    ctx.rotate(ang);
    const reach=14+strike*(isHeavy?25:20);
    // 1. High-velocity wind streaks trailing from shoulder to fist
    ctx.strokeStyle=`rgba(255, 245, 210, ${(0.72*strike).toFixed(2)})`;
    ctx.lineWidth=1.5;
    for(const [oy,len]of [[-8,12],[-3,16],[3,16],[8,12]]){
      ctx.beginPath();
      ctx.moveTo(reach-len,oy);
      ctx.lineTo(reach+2,oy*0.65);
      ctx.stroke();
    }
    // 2. Inner & outer crescent shockwave arcs (kình phong vòng cung kép)
    ctx.strokeStyle=isHeavy?`rgba(255, 215, 110, ${(0.95*strike).toFixed(2)})`:`rgba(255, 240, 185, ${(0.9*strike).toFixed(2)})`;
    ctx.lineWidth=isHeavy?3.8:3.0;
    ctx.beginPath();
    ctx.arc(reach-5,0,isHeavy?16:13,-0.92,0.92);
    ctx.stroke();

    ctx.strokeStyle=`rgba(245, 165, 75, ${(0.68*strike).toFixed(2)})`;
    ctx.lineWidth=1.8;
    ctx.beginPath();
    ctx.arc(reach-1,0,isHeavy?20:16.5,-0.72,0.72);
    ctx.stroke();

    // 3. Glowing impact fist core & radial sparks on peak extension
    const coreGrad=ctx.createRadialGradient(reach,0,0.5,reach,0,isHeavy?11:8.5);
    coreGrad.addColorStop(0,`rgba(255, 252, 225, ${(0.95*strike).toFixed(2)})`);
    coreGrad.addColorStop(0.5,`rgba(255, 205, 105, ${(0.65*strike).toFixed(2)})`);
    coreGrad.addColorStop(1,'rgba(255, 170, 60, 0)');
    ctx.fillStyle=coreGrad;
    ctx.beginPath();
    ctx.arc(reach,0,isHeavy?11:8.5,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // Subtle cooldown recharge bar right under Tiểu Phàm's feet while recovering between punches
  if((p.attackCooldown||0)>0&&(p.attackTimer||0)<=0.04){
    const ratio=1-Math.min(1,p.attackCooldown/(p.attackCooldownMax||ATTACK_COOLDOWN));
    ctx.fillStyle='#10221acc';
    ctx.fillRect(-13,5,26,3.5);
    ctx.fillStyle='#e5c165';
    ctx.fillRect(-12,6,Math.round(24*ratio),1.5);
  }
  ctx.restore();
  ctx.textAlign='center';
  ctx.font='bold 10px system-ui';
  ctx.fillStyle='#183025df';
  ctx.fillRect(p.x-49,p.y-88,98,16);
  ctx.fillStyle='#f0e0b6';
  ctx.fillText('Tiểu Phàm · 14 tuổi',p.x,p.y-76);
}

// Draw Tiểu Phàm seated on the wooden stool behind the table
function drawSitting(ctx,p,t){
  g.clearRect(0,0,96,112);
  g.save();
  g.translate(48,100);
  const flutter=Math.sin(t*2.2)*.6;
  // Bent seated legs on stool
  shoe(-5.5,-3,false);
  shoe(5.5,-3,false);
  // Seated lower tunic draped over knees
  poly([[-10,-32],[10,-32],[11,-15],[-11,-15]],C.dark);
  poly([[-9,-31],[9,-31],[9.5,-17],[-9.5,-17]],C.cloth,null);
  // Upper torso
  poly([[-8.5,-48],[8.5,-48],[10.5,-42],[9,-30],[-9,-30],[-10.5,-42]],C.cloth);
  poly([[-5.5,-49],[0,-42],[5.5,-49],[3,-49],[0,-44.5],[-3,-49]],C.collar);
  poly([[-9,-32],[9,-32],[9,-28],[-9,-28]],C.sash);
  // Relaxed arms resting forward toward the tea table
  arm(-10,-0.4,false);
  arm(10,0.4,true);
  head(false,t,flutter);
  g.restore();

  ctx.save();
  ctx.translate(Math.round(p.x),Math.round(p.y));
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(sprite,-43,-86,86,96);
  ctx.restore();
  ctx.textAlign='center';
  ctx.font='bold 10px system-ui';
  ctx.fillStyle='#183025df';
  ctx.fillRect(p.x-58,p.y-84,116,16);
  ctx.fillStyle='#f0e0b6';
  ctx.fillText('Tiểu Phàm · Đang ngồi',p.x,p.y-72);
}

// Draw Tiểu Phàm lying horizontally on the wooden bed under the coarse patchwork blanket
function drawSleeping(ctx,x,y,t){
  ctx.save();
  ctx.translate(x,y);
  // Head & hair resting horizontally on the pillow (right side of bed, facing slightly left/up)
  const breathe=Math.sin(t*2.1)*0.8;
  // Topknot & dark hair on pillow
  ctx.fillStyle=C.hair;
  ctx.beginPath();
  ctx.arc(46,-14,6.5,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle=C.tie;
  ctx.fillRect(39,-17,3,7);
  ctx.fillStyle=C.hair;
  ctx.beginPath();
  ctx.ellipse(32,-13,11,9.5,0,0,Math.PI*2);
  ctx.fill();
  // Peaceful sleeping face
  ctx.fillStyle=C.skin;
  ctx.beginPath();
  ctx.ellipse(29,-12,8.5,7.5,0,0,Math.PI*2);
  ctx.fill();
  // Closed sleeping eyes & calm brow
  ctx.strokeStyle='#2a231d';
  ctx.lineWidth=1.4;
  ctx.beginPath();
  ctx.moveTo(26,-15);ctx.lineTo(29,-15);
  ctx.moveTo(26,-10);ctx.lineTo(29,-10);
  ctx.stroke();
  // Shoulders in current tunic cloth peeking out from top of blanket
  ctx.fillStyle=C.cloth;
  ctx.beginPath();
  ctx.roundRect(8,-21+breathe*.3,16,18,4);
  ctx.fill();
  ctx.strokeStyle=C.collar;
  ctx.lineWidth=1.6;
  ctx.beginPath();
  ctx.moveTo(21,-17);ctx.lineTo(13,-11);
  ctx.stroke();
  // Coarse patchwork blanket pulled snugly over Tiểu Phàm's body
  ctx.fillStyle='#6e7f78';
  ctx.beginPath();
  ctx.roundRect(-56,-34-breathe*.5,68,68,5);
  ctx.fill();
  ctx.strokeStyle='#36403c';
  ctx.lineWidth=1.2;
  ctx.stroke();
  ctx.fillStyle='#889991';
  ctx.fillRect(-51,-29-breathe*.5,56,58);
  // Cloth patch on blanket rising with breathing
  ctx.fillStyle='#9e8768';
  ctx.fillRect(-36,-14-breathe*.5,18,16);
  ctx.strokeStyle='#544533';
  ctx.strokeRect(-36,-14-breathe*.5,18,16);
  // Village shoes neatly placed by the sandals below the bed
  // Floating 'Zzz...' sleep bubbles
  ctx.fillStyle='#f7efc2';
  ctx.font='bold 11px Georgia, serif';
  ctx.textAlign='center';
  for(let i=0;i<3;i++){
    const zPhase=((t*0.75+i*0.33)%1);
    const zx=34+i*8+Math.sin(t*2+i)*3;
    const zy=-28-zPhase*26;
    ctx.globalAlpha=Math.sin(zPhase*Math.PI)*0.9;
    ctx.fillText(i===2?'Z':'z',zx,zy);
  }
  ctx.globalAlpha=1;
  ctx.restore();
}

  let hudMsg='',hudTimer=0;
  const avatarImg=(typeof Image!=='undefined')?new Image():null;
  if(avatarImg)avatarImg.src='tieu-pham-avatar.webp';
  function showHUDInfo(msg){hudMsg=msg;hudTimer=3.6;}
  function handleClickHUD(cx,cy,W,p){
    const hx=12,hy=12;
    const isNarrow=W<430;
    const barW=isNarrow?116:132;
    const panelW=barW+58;
    const panelH=50;
    if(cx>=hx&&cx<=hx+panelW&&cy>=hy&&cy<=hy+panelH){
      let qInfo='';
      if(typeof Quest1!=='undefined'){
        const qs=Quest1.getState();
        if(qs==='registered'||qs==='awaiting_selection'){
          const dPassed=typeof Villagers!=='undefined'?(Villagers.day-(Quest1.registeredDay||Villagers.day)):0;
          qInfo='\nNhiệm vụ: Tiên Duyên Khởi Đầu (Ngày '+Math.min(3,dPassed)+'/3)';
        }else if(qs==='selection_ready'){
          qInfo='\nNhiệm vụ: Tiên Duyên Khởi Đầu · Đã tới ngày tuyển chọn!';
        }else if(qs==='completed'){
          qInfo='\nNhiệm vụ: Tiên Duyên Đã Định';
        }
      }
      showHUDInfo('Trương Tiểu Phàm (14 tuổi) · Phàm Nhân\nKhí Huyết: '+Math.round(p.hp||100)+'/'+(p.maxHp||100)+' HP\nLinh Lực: 0/0 MP (Chưa ngưng khí)'+qInfo);
      return true;
    }
    return false;
  }

  function drawHUD(ctx,p,W,H,t,dt=0.016){
    if(!ctx||!p)return;
    if(hudTimer>0)hudTimer=Math.max(0,hudTimer-dt);
    ctx.save();
    const hx=12,hy=12;
    const isNarrow=W<430;
    const barW=isNarrow?116:132;
    const panelW=barW+58;
    const panelH=50;

    // 1. Lacquer & jade background plaque
    ctx.beginPath();
    ctx.roundRect(hx,hy,panelW,panelH,8);
    ctx.fillStyle='#0f221ae8';
    ctx.fill();
    ctx.strokeStyle='#bfa35b';
    ctx.lineWidth=1.4;
    ctx.stroke();

    // Subtle inner jade border
    ctx.beginPath();
    ctx.roundRect(hx+2,hy+2,panelW-4,panelH-4,6);
    ctx.strokeStyle='#32584488';
    ctx.lineWidth=1;
    ctx.stroke();

    // Corner brass rivets
    ctx.fillStyle='#d6c07a';
    for(const [rx,ry] of [
      [hx+4.5,hy+4.5],
      [hx+panelW-4.5,hy+4.5],
      [hx+4.5,hy+panelH-4.5],
      [hx+panelW-4.5,hy+panelH-4.5]
    ]){
      ctx.beginPath();
      ctx.arc(rx,ry,1.4,0,Math.PI*2);
      ctx.fill();
    }

    // 2. Avatar aperture
    const ax=hx+24,ay=hy+25,ar=20;

    // Outer carved antique bronze rim
    const rimGrad=ctx.createLinearGradient(ax-ar,ay-ar,ax+ar,ay+ar);
    rimGrad.addColorStop(0,'#e5ca78');
    rimGrad.addColorStop(0.5,'#9e7939');
    rimGrad.addColorStop(1,'#573d18');
    ctx.beginPath();
    ctx.arc(ax,ay,ar+2.5,0,Math.PI*2);
    ctx.fillStyle=rimGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ax,ay,ar+0.5,0,Math.PI*2);
    ctx.fillStyle='#22150a';
    ctx.fill();

    // Clipped portrait of Tiểu Phàm
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax,ay,ar-0.5,0,Math.PI*2);
    ctx.clip();

    // Celadon / Jade backdrop inside avatar
    const bgGrad=ctx.createRadialGradient(ax,ay-6,2,ax,ay,ar);
    bgGrad.addColorStop(0,'#2f5b47');
    bgGrad.addColorStop(1,'#13281e');
    ctx.fillStyle=bgGrad;
    ctx.fillRect(ax-ar,ay-ar,ar*2,ar*2);

    // Soft sunbeam beam through aperture
    ctx.fillStyle='rgba(255,248,220,0.12)';
    ctx.beginPath();
    ctx.moveTo(ax-ar,ay-ar);
    ctx.lineTo(ax+5,ay-ar);
    ctx.lineTo(ax+ar,ay+ar);
    ctx.lineTo(ax-5,ay+ar);
    ctx.closePath();
    ctx.fill();

    if(avatarImg&&avatarImg.complete&&avatarImg.naturalWidth>0){
      ctx.imageSmoothingEnabled=true;
      const sz=(ar+2.5)*2;
      ctx.drawImage(avatarImg,ax-sz/2,ay-sz/2+1,sz,sz);
    }else{
    // Draw Tiểu Phàm bust (shoulders, collar, face, eyes, hair, topknot)
    ctx.fillStyle=C.cloth;
    ctx.beginPath();
    ctx.roundRect(ax-13,ay+7,26,16,[4,4,0,0]);
    ctx.fill();

    // Crossed rustic collar
    ctx.fillStyle=C.collar;
    ctx.beginPath();
    ctx.moveTo(ax-4.5,ay+6);
    ctx.lineTo(ax,ay+12);
    ctx.lineTo(ax+4.5,ay+6);
    ctx.lineTo(ax+2.5,ay+6);
    ctx.lineTo(ax,ay+9.5);
    ctx.lineTo(ax-2.5,ay+6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle=C.dark;
    ctx.lineWidth=1.2;
    ctx.beginPath();
    ctx.moveTo(ax-3.8,ay+6.5);
    ctx.lineTo(ax+1,ay+11);
    ctx.moveTo(ax+3.8,ay+6.5);
    ctx.lineTo(ax-0.8,ay+9.5);
    ctx.stroke();

    // Neck
    ctx.fillStyle=C.skinShade;
    ctx.fillRect(ax-3,ay+2,6,6);
    ctx.fillStyle=C.skin;
    ctx.fillRect(ax-2.2,ay+2,4.4,5);

    // Ears
    ctx.fillStyle=C.skin;
    ctx.beginPath();
    ctx.ellipse(ax-8.5,ay-3,1.8,2.5,0,0,Math.PI*2);
    ctx.ellipse(ax+8.5,ay-3,1.8,2.5,0,0,Math.PI*2);
    ctx.fill();

    // Face contour
    ctx.fillStyle=C.skin;
    ctx.beginPath();
    ctx.ellipse(ax,ay-3,7.8,8.2,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle=C.skinHi;
    ctx.beginPath();
    ctx.ellipse(ax,ay-4,6.2,6.8,0,0,Math.PI*2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle='rgba(217,146,120,0.45)';
    ctx.beginPath();
    ctx.ellipse(ax-4.5,ay-1.5,1.8,1.1,0,0,Math.PI*2);
    ctx.ellipse(ax+4.5,ay-1.5,1.8,1.1,0,0,Math.PI*2);
    ctx.fill();

    // Brows
    ctx.strokeStyle='#382e26';
    ctx.lineWidth=1.1;
    ctx.beginPath();
    ctx.moveTo(ax-5.5,ay-7);
    ctx.lineTo(ax-2,ay-7.5);
    ctx.moveTo(ax+2,ay-7.5);
    ctx.lineTo(ax+5.5,ay-7);
    ctx.stroke();

    // Eyes with natural gentle blink
    const isBlink=(t%5.4>5.2);
    if(isBlink){
      ctx.strokeStyle='#241f1b';
      ctx.lineWidth=1.3;
      ctx.beginPath();
      ctx.moveTo(ax-5.2,ay-5);
      ctx.lineTo(ax-2.2,ay-5);
      ctx.moveTo(ax+2.2,ay-5);
      ctx.lineTo(ax+5.2,ay-5);
      ctx.stroke();
    }else{
      ctx.fillStyle='#241f1b';
      ctx.fillRect(ax-5.2,ay-6.2,2.6,2.6);
      ctx.fillRect(ax+2.6,ay-6.2,2.6,2.6);
      ctx.fillStyle='#f7f0dc';
      ctx.fillRect(ax-4.4,ay-6.2,1,1);
      ctx.fillRect(ax+3.4,ay-6.2,1,1);
    }

    // Nose and gentle smile
    ctx.strokeStyle=C.skinShade;
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(ax,ay-4.2);
    ctx.lineTo(ax-0.5,ay-2);
    ctx.lineTo(ax+0.5,ay-2);
    ctx.stroke();

    ctx.strokeStyle='#9e624d';
    ctx.lineWidth=1.1;
    ctx.beginPath();
    ctx.moveTo(ax-1.8,ay+0.5);
    ctx.lineTo(ax,ay+1.2);
    ctx.lineTo(ax+1.8,ay+0.5);
    ctx.stroke();

    // Hair bangs & side locks
    ctx.fillStyle=C.hair;
    ctx.beginPath();
    ctx.moveTo(ax-8,ay-8);
    ctx.quadraticCurveTo(ax,ay-14,ax+8,ay-8);
    ctx.lineTo(ax+8.5,ay-1);
    ctx.lineTo(ax+6.5,ay-1);
    ctx.lineTo(ax+6.5,ay-6);
    ctx.lineTo(ax+1,ay-8.5);
    ctx.lineTo(ax,ay-11);
    ctx.lineTo(ax-1,ay-8.5);
    ctx.lineTo(ax-6.5,ay-6);
    ctx.lineTo(ax-6.5,ay-1);
    ctx.lineTo(ax-8.5,ay-1);
    ctx.closePath();
    ctx.fill();

    // Hair highlight
    ctx.strokeStyle=C.hairHi;
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(ax-5,ay-10.5);
    ctx.lineTo(ax-1.5,ay-12);
    ctx.moveTo(ax+1.5,ay-12);
    ctx.lineTo(ax+5,ay-10.5);
    ctx.stroke();

    // High topknot & red ribbon tie
    ctx.fillStyle=C.hair;
    ctx.beginPath();
    ctx.arc(ax,ay-14.5,4.2,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle=C.tie;
    ctx.beginPath();
    ctx.roundRect(ax-3.8,ay-13.5,7.6,2.6,1);
    ctx.fill();
    ctx.strokeStyle=C.tieHi;
    ctx.lineWidth=1;
    ctx.strokeRect(ax-3.8,ay-13.5,7.6,2.6);
    }

    ctx.restore(); // end clip

    // Level badge pinned at bottom of avatar circle
    const badgeW=28,badgeH=11;
    const bx=ax-badgeW/2,by=ay+ar-5;
    ctx.fillStyle='#2e1c10';
    ctx.beginPath();
    ctx.roundRect(bx,by,badgeW,badgeH,2.5);
    ctx.fill();
    ctx.strokeStyle='#d6b567';
    ctx.lineWidth=1.1;
    ctx.stroke();
    ctx.fillStyle='#ffefc6';
    ctx.font='bold 7.5px system-ui';
    ctx.textAlign='center';
    ctx.fillText('LV. 1',ax,by+8.2);

    // 3. Right Info Area (Name, Realm, HP, MP)
    const tx=hx+49;
    const row1Y=hy+11;

    // Name: Tiểu Phàm
    ctx.save();
    ctx.font='bold 11px "Noto Serif", Georgia, serif';
    ctx.textBaseline='middle';
    ctx.textAlign='left';
    ctx.fillStyle='#000000aa';
    ctx.fillText('Tiểu Phàm',tx+0.5,row1Y+0.5);
    ctx.fillStyle='#fef4d8';
    ctx.fillText('Tiểu Phàm',tx,row1Y);
    const nameW=ctx.measureText('Tiểu Phàm').width;

    // Realm badge: [Phàm Nhân] (perfectly aligned with name)
    const rw=isNarrow?50:54,rh=13;
    const rx=tx+nameW+6;
    const ry=row1Y-rh/2;
    ctx.fillStyle='#142c22';
    ctx.beginPath();
    ctx.roundRect(rx,ry,rw,rh,3);
    ctx.fill();
    ctx.strokeStyle='#5a8f6e';
    ctx.lineWidth=0.9;
    ctx.stroke();

    // Inner subtle glow
    ctx.fillStyle='rgba(90,160,120,0.18)';
    ctx.beginPath();
    ctx.roundRect(rx+0.5,ry+0.5,rw-1,rh-1,2.5);
    ctx.fill();

    ctx.fillStyle='#b5ecc3';
    ctx.font='bold 8px system-ui';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText('Phàm Nhân',rx+rw/2,row1Y);
    ctx.restore();

    // 4. HP Bar (Khí huyết phàm nhân: 100 HP)
    const hpY=hy+18;
    const hpMax=p.maxHp||100;
    const hpCur=Math.max(0,Math.min(hpMax,p.hp??100));
    const hpRatio=hpMax>0?hpCur/hpMax:1;

    // Background slot
    ctx.fillStyle='#1b0606';
    ctx.beginPath();
    ctx.roundRect(tx,hpY,barW,11,2);
    ctx.fill();
    ctx.strokeStyle='#592525';
    ctx.lineWidth=0.9;
    ctx.stroke();

    // Filled HP bar
    if(hpRatio>0){
      const curW=Math.max(2,Math.round((barW-1.6)*hpRatio));
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(tx+0.8,hpY+0.8,curW,9.4,1.5);
      ctx.clip();
      const hpGrad=ctx.createLinearGradient(tx,hpY,tx,hpY+11);
      hpGrad.addColorStop(0,'#ff5252');
      hpGrad.addColorStop(0.45,'#c91616');
      hpGrad.addColorStop(1,'#690b0b');
      ctx.fillStyle=hpGrad;
      ctx.fillRect(tx,hpY,barW,11);

      // Specular top gloss
      ctx.fillStyle='rgba(255,255,255,0.32)';
      ctx.fillRect(tx,hpY+1,curW,3.2);
      ctx.restore();
    }

    // 10% tick marks across HP bar
    ctx.strokeStyle='#2d0a0a88';
    ctx.lineWidth=1;
    for(let i=1;i<10;i++){
      const tickX=Math.round(tx+(barW*i)/10);
      ctx.beginPath();
      ctx.moveTo(tickX,hpY+1.2);
      ctx.lineTo(tickX,hpY+9.8);
      ctx.stroke();
    }

    // HP Label: "HP  100 / 100" (vertically centered)
    ctx.font='bold 8px system-ui';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    const hpText=`HP  ${Math.round(hpCur)} / ${hpMax}`;
    ctx.fillStyle='#000000cc';
    ctx.fillText(hpText,tx+barW/2+0.5,hpY+6);
    ctx.fillStyle='#ffffff';
    ctx.fillText(hpText,tx+barW/2,hpY+5.5);

    // 5. MP Bar (Năng lượng / Linh lực: 0 / 0)
    const mpY=hy+32;
    const mpMax=p.maxMp||0;
    const mpCur=Math.max(0,Math.min(mpMax,p.mp||0));
    const mpRatio=mpMax>0?mpCur/mpMax:0;

    // Background slot
    ctx.fillStyle='#0a131a';
    ctx.beginPath();
    ctx.roundRect(tx,mpY,barW,9.5,2);
    ctx.fill();
    ctx.strokeStyle='#253b4c';
    ctx.lineWidth=0.9;
    ctx.stroke();

    if(mpRatio>0){
      const curW=Math.max(2,Math.round((barW-1.6)*mpRatio));
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(tx+0.8,mpY+0.8,curW,7.9,1.5);
      ctx.clip();
      const mpGrad=ctx.createLinearGradient(tx,mpY,tx,mpY+9.5);
      mpGrad.addColorStop(0,'#4da8ff');
      mpGrad.addColorStop(0.5,'#1e6bc2');
      mpGrad.addColorStop(1,'#0e3968');
      ctx.fillStyle=mpGrad;
      ctx.fillRect(tx,mpY,barW,9.5);
      ctx.fillStyle='rgba(255,255,255,0.3)';
      ctx.fillRect(tx,mpY+1,curW,2.8);
      ctx.restore();
    }

    // MP Label: Phàm nhân mana = 0 (vertically centered)
    ctx.font='bold 7px system-ui';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    const mpText=mpMax>0?`MP  ${Math.round(mpCur)} / ${mpMax}`:'MP  0 / 0 · Chưa ngưng khí';
    ctx.fillStyle='#000000cc';
    ctx.fillText(mpText,tx+barW/2+0.5,mpY+5.5);
    ctx.fillStyle='#a5bfd2';
    ctx.fillText(mpText,tx+barW/2,mpY+5);

    // 6. Floating popover if avatar was tapped
    if(hudTimer>0&&hudMsg){
      const infoW=Math.min(270,W-24);
      const lines=hudMsg.split('\n');
      const boxH=lines.length*14+12;
      const questBoardShowing=typeof Quest1!=='undefined'&&Quest1.isQuestBoardVisible&&Quest1.isQuestBoardVisible();
      const popY=questBoardShowing?hy+panelH+42+10:hy+panelH+6;
      ctx.fillStyle='#13271fee';
      ctx.beginPath();
      ctx.roundRect(hx,popY,infoW,boxH,5);
      ctx.fill();
      ctx.strokeStyle='#d9bc73';
      ctx.lineWidth=1;
      ctx.stroke();
      ctx.font='10px system-ui';
      ctx.textAlign='left';
      ctx.fillStyle='#fceecb';
      lines.forEach((line,idx)=>{
        ctx.fillText(line,hx+8,popY+14+idx*14);
      });
    }

    ctx.restore();
  }

  return{draw,drawSitting,drawSleeping,drawHUD,handleClickHUD,showHUDInfo,triggerAttack,applyOutfit,get outfitIdx(){return outfitIdx}};})();

const TieuPhamHome=(()=>{
  // Room dimensions enlarged by 10% (704x462 vs previous 640x420)
  const W=704,H=462;
  // Exterior door of the first house (Nhà dân tây bắc: x=138..298, y=158..294, door at x=207..236, y=256..290)
  const EXT_DOOR={x:221,y:295};
  const EXT_SPAWN={x:221,y:314};
  const INT_SPAWN={x:352,y:392};
  let inside=false,cooldown=0,nearProp=null,pose='none',poseCooldown=0,sleepTimer=0,sleptDayAdvanced=false,bannerText='',bannerTimer=0;

  // Solid furniture collision boxes inside the 704x462 cottage (+10% room scale)
  const BOXES=[
    // Tủ đồ gỗ (Wardrobe)
    [80,94,98,102],
    // Giá treo quần áo & rương quần áo xếp gọn (Clothes rack & folded clothes chest)
    [190,106,134,84],
    // Giường gỗ đơn sơ (Wooden bed)
    [470,114,156,106],
    // Bàn gỗ & ghế đẩu (Wooden table & stools)
    [268,258,146,74],
    // Chum nước góc nhà (Corner water jar)
    [570,358,52,50]
  ];

  const PROPS=[
    {id:'clothes',name:'Tủ đồ & Quần áo',actionLabel:'Thay đồ (Nhấn ✊ / E)',x:205,y:182,labelY:86,r:78},
    {id:'bed',name:'Giường gỗ đơn sơ',actionLabel:'Nằm ngủ qua ngày mới (Nhấn ✊ / E)',x:548,y:198,labelY:90,r:54},
    {id:'table',name:'Bàn gỗ mộc',actionLabel:'Ngồi vào bàn gỗ (Nhấn ✊ / E)',x:341,y:296,labelY:234,r:82}
  ];

  function pointBlocked(x,y){
    // Allow walking into the bottom doorway alcove (x: 316..388, y: 384..432)
    const inDoorAlcove=x>=316&&x<=388&&y>=384&&y<=432;
    if(!inDoorAlcove&&(x<74||x>630||y<158||y>408))return true;
    for(const [bx,by,bw,bh]of BOXES){
      if(x>=bx&&x<=bx+bw&&y>=by&&y<=by+bh)return true;
    }
    return false;
  }

  function canWalk(x,y){
    if(pose!=='none')return false;
    return !(pointBlocked(x,y)||pointBlocked(x+4,y)||pointBlocked(x-4,y)||pointBlocked(x,y+4)||pointBlocked(x,y-4));
  }

  function showToast(msg){
    bannerText=msg;
    bannerTimer=3.8;
    const el=document.getElementById('toast');
    if(!el)return;
    el.textContent=msg;
    el.style.opacity=1;
    clearTimeout(el._hideTimer);
    el._hideTimer=setTimeout(()=>{el.style.opacity=0},3600);
  }

  function resolvePlayer(pArg){
    if(pArg&&typeof pArg.hp!=='undefined'&&typeof pArg.x==='number')return pArg;
    if(typeof p!=='undefined'&&p&&typeof p.hp!=='undefined')return p;
    return pArg;
  }

  function enter(pArg){
    const pl=resolvePlayer(pArg);
    inside=true;
    cooldown=0.45;
    pose='none';
    poseCooldown=0;
    sleepTimer=0;
    if(pl){
      pl.x=INT_SPAWN.x;
      pl.y=INT_SPAWN.y;
      pl.dir='up';
      pl.walk=0;
    }
    const d=document.getElementById('dialog');
    if(d)d.hidden=true;
    showToast('Nhà Tiểu Phàm — Nhấn vào bàn gỗ để ngồi, giường gỗ để nằm ngủ qua ngày mới.');
  }

  function exit(pArg){
    const pl=resolvePlayer(pArg);
    inside=false;
    cooldown=0.45;
    pose='none';
    poseCooldown=0;
    sleepTimer=0;
    if(pl){
      pl.x=EXT_SPAWN.x;
      pl.y=EXT_SPAWN.y;
      pl.dir='down';
      pl.walk=0;
    }
    nearProp=null;
    const d=document.getElementById('dialog');
    if(d)d.hidden=true;
    showToast('Ra sân làng — Xóm nhà Tiểu Phàm.');
  }

  function sitAtTable(pArg){
    const pl=resolvePlayer(pArg);
    if(!pl)return;
    pose='sitting';
    poseCooldown=0.35;
    pl.x=341;
    pl.y=268;
    pl.dir='down';
    pl.walk=0;
    showToast('Tiểu Phàm ngồi xuống bàn gỗ mộc, thưởng thức chén trà ấm.');
  }

  function standFromTable(pArg){
    const pl=resolvePlayer(pArg);
    if(!pl)return;
    pose='none';
    poseCooldown=0.25;
    pl.x=341;
    pl.y=342;
    pl.dir='down';
    pl.walk=0;
    showToast('Tiểu Phàm đứng dậy khỏi bàn gỗ.');
  }

  function sleepInBed(pArg){
    const pl=resolvePlayer(pArg);
    if(!pl)return;
    const curDay=typeof Villagers!=='undefined'&&Villagers.day?Villagers.day:1;
    const isExamReady=curDay>=3||(typeof Quest1!=='undefined'&&(Quest1.getState()==='selection_ready'||Quest1.getState()==='cinematic_active'));
    if(isExamReady){
      showToast('Hôm nay là Ngày Khảo Nghiệm Linh Căn! Tiên nhân đang ở quảng trường làng, mau tới dự tuyển chọn!');
      return;
    }
    if(poseCooldown>0)return;
    pose='sleeping';
    poseCooldown=0.45;
    sleepTimer=0;
    sleptDayAdvanced=false;
    pl.x=548;
    pl.y=160;
    pl.dir='left';
    pl.walk=0;
    pl.hp=pl.maxHp||100;
    showToast('Tiểu Phàm nằm xuống chiếc giường gỗ đơn sơ, ngủ một giấc qua ngày hôm sau...');
  }

  function wakeFromBed(pArg){
    const pl=resolvePlayer(pArg);
    if(!pl)return;
    if(!sleptDayAdvanced&&typeof Villagers!=='undefined'&&Villagers.sleepToNextDay){
      Villagers.sleepToNextDay();
      sleptDayAdvanced=true;
    }
    pose='none';
    poseCooldown=1.0;
    sleepTimer=0;
    pl.x=532;
    pl.y=232;
    pl.dir='down';
    pl.walk=0;
    pl.hp=pl.maxHp||100;
    const d=typeof Villagers!=='undefined'?Villagers.day:2;
    const isExamDay=d>=3||(typeof Quest1!=='undefined'&&Quest1.getState()==='selection_ready');
    if(isExamDay){
      showToast('☀️ Trời đã sáng! Hôm nay chính là Ngày Khảo Nghiệm Linh Căn! Mau ra quảng trường tham gia tuyển chọn!');
      const dEl=document.getElementById('dialog'),title=document.getElementById('dialog-title'),body=document.getElementById('dialog-body');
      if(dEl&&title&&body){
        dEl.hidden=false;
        title.textContent='🔔 Ngày Khảo Nghiệm Linh Căn Đã Đến!';
        body.innerHTML='Tiếng chuông ngân vang dội khắp Làng Du Lãm! Tiên nhân phái Thanh Vân đã ngự kiếm giáng lâm.<br><br>Trưởng làng và các thiếu niên đã tề tựu đông đủ tại Quảng Trường Làng.<br><br><button id="go-square-modal-btn" style="display:block;width:100%;margin-top:14px;padding:12px 16px;background:linear-gradient(135deg,#c48c3a,#96621e);color:#fff;font-weight:bold;font-size:14px;border:1px solid #fed285;border-radius:6px;cursor:pointer;">Đến Quảng Trường Làng Ngay ➔</button>';
        const goBtn=document.getElementById('go-square-modal-btn');
        if(goBtn){
          goBtn.onclick=()=>{
            dEl.hidden=true;
            exit(pl);
            if(pl){pl.x=800;pl.y=550;}
            if(typeof Quest1!=='undefined'&&Quest1.update&&typeof Villagers!=='undefined'){
              Quest1.update(0.1,0,pl,Villagers);
            }
          };
        }
      }
    }else{
      showToast('Tiểu Phàm thức dậy khỏe khoắn — Chào buổi sáng Ngày '+d+'!');
    }
  }

  function checkTransition(p,dx,dy,dt){
    cooldown=Math.max(0,cooldown-(dt||0.016));
    if(cooldown>0)return false;
    if(!inside){
      // Enter when Tiểu Phàm walks up to the front door of the first house (x: 202..241, y <= 302)
      if(p.x>=202&&p.x<=241&&p.y>=284&&p.y<=302&&(dy<-0.05||p.y<=298)){
        enter(p);
        return true;
      }
    }else{
      if(pose!=='none')return false;
      // Exit when Tiểu Phàm walks down into the open front door threshold (x: 300..400, y >= 410)
      if(p.x>=300&&p.x<=400&&p.y>=410&&(dy>0.05||p.y>=416)){
        exit(p);
        const curDay=typeof Villagers!=='undefined'&&Villagers.day?Villagers.day:1;
        const isExamDay=curDay>=3||(typeof Quest1!=='undefined'&&Quest1.getState()==='selection_ready');
        if(isExamDay){
          showToast('Đến Quảng Trường Làng tham gia khảo nghiệm!');
          p.x=800;p.y=550;
          if(typeof Quest1!=='undefined'&&Quest1.update&&typeof Villagers!=='undefined'){
            Quest1.update(0.1,0,p,Villagers);
          }
        }
        return true;
      }
    }
    return false;
  }

  function updateInterior(pArg,dt=0.016,movingInput=false){
    if(!inside){nearProp=null;return}
    const pl=resolvePlayer(pArg);
    poseCooldown=Math.max(0,poseCooldown-dt);
    bannerTimer=Math.max(0,bannerTimer-dt);

    if(pose==='sleeping'){
      sleepTimer+=dt;
      // At the middle of the night fade (0.6s), advance village time to 06:00 AM of the next day
      if(sleepTimer>=0.6&&!sleptDayAdvanced){
        sleptDayAdvanced=true;
        const newDay=(typeof Villagers!=='undefined'&&Villagers.sleepToNextDay)?Villagers.sleepToNextDay():2;
        const isExamDay=newDay>=3||(typeof Quest1!=='undefined'&&Quest1.getState()==='selection_ready');
        if(isExamDay){
          showToast('🔔 Chuông làng vang lên! Hôm nay chính là Ngày Khảo Nghiệm Linh Căn! Mau dậy đến quảng trường!');
        }else{
          const st=(typeof Villagers!=='undefined'&&Villagers.cropStage)?Villagers.cropStage(newDay):{stage:1,short:'Mùa mới'};
          showToast('Trời đã sáng! Bước sang Ngày '+newDay+' (Vụ '+st.stage+'/7: '+st.short+') — Chào buổi sáng!');
        }
      }
      // Auto-wake up when night-to-morning curtain fade finishes (sleepTimer >= 1.2s)
      // Or early wake up on movement input (after 0.2s)
      if((sleepTimer>=1.2||(movingInput&&sleepTimer>=0.2))&&poseCooldown<=0){
        wakeFromBed(pl);
      }
    }else if(pose==='sitting'){
      if(movingInput&&poseCooldown<=0){
        standFromTable(pl);
      }
    }

    nearProp=null;
    if(pose==='none'&&pl){
      let best=Infinity;
      for(const item of PROPS){
        const d=Math.hypot(pl.x-item.x,pl.y-item.y);
        if(d<item.r&&d<best){best=d;nearProp=item}
      }
    }

    const talkBtn=document.getElementById('talk');
    if(talkBtn){
      talkBtn.hidden=pose==='none'&&!nearProp;
      if(pose==='sitting')talkBtn.textContent='Đứng dậy khỏi bàn';
      else if(pose==='sleeping')talkBtn.textContent='Thức dậy';
      else if(nearProp){
        talkBtn.textContent=nearProp.id==='clothes'?'Thay đồ / Xem tủ đồ':nearProp.id==='bed'?'Nằm ngủ qua ngày mới':'Ngồi vào bàn gỗ';
      }
    }
    const punchLbl=document.getElementById('punch-label');
    if(punchLbl){
      if(pose==='sitting')punchLbl.textContent='ĐỨNG DẬY';
      else if(pose==='sleeping')punchLbl.textContent='THỨC DẬY';
      else if(nearProp){
        punchLbl.textContent=nearProp.id==='clothes'?'THAY ĐỒ':nearProp.id==='bed'?'NẰM NGỦ':'NGỒI BÀN';
      }else{
        punchLbl.textContent=(pl&&pl.attackCooldown>0)?pl.attackCooldown.toFixed(1)+'s':'ĐẤM';
      }
    }
  }

  function interact(pArg){
    if(!inside)return false;
    const pl=resolvePlayer(pArg);
    if(pose==='sitting'){
      standFromTable(pl);
      return true;
    }
    if(pose==='sleeping'){
      if(sleepTimer>=0.2)wakeFromBed(pl);
      return true;
    }
    if(!nearProp)return false;
    if(nearProp.id==='clothes'){
      const pal=TieuPham.applyOutfit(TieuPham.outfitIdx+1);
      const d=document.getElementById('dialog'),title=document.getElementById('dialog-title'),body=document.getElementById('dialog-body');
      if(d&&title&&body){
        d.hidden=false;
        title.textContent='Tủ đồ gỗ & Mấy bộ quần áo';
        body.textContent='Trong chiếc tủ gỗ mộc và trên giá trúc treo mấy bộ quần áo vải thô giản dị được giặt giũ sạch sẽ, xếp gọn gàng.\n\nTiểu Phàm vừa khoác thử: '+pal.name+'.';
      }
      showToast('Đã thay trang phục: '+pal.name);
      return true;
    }
    if(nearProp.id==='bed'){
      sleepInBed(pl);
      return true;
    }
    if(nearProp.id==='table'){
      sitAtTable(pl);
      return true;
    }
    return false;
  }

  function handleCanvasClick(rx,ry,pArg){
    if(!inside)return false;
    const pl=resolvePlayer(pArg);
    // Clicking/tapping anywhere on screen while sleeping wakes Tiểu Phàm up immediately!
    if(pose==='sleeping'){
      if(sleepTimer>=0.2)wakeFromBed(pl);
      return true;
    }
    // Click on wooden table or stools (x: 244..438, y: 235..346) -> sit / stand
    if(rx>=244&&rx<=438&&ry>=235&&ry<=346){
      if(pose==='sitting')standFromTable(pl);
      else sitAtTable(pl);
      return true;
    }
    // Click on wooden bed (x: 468..632, y: 95..228) -> lie down & sleep to next day / wake up
    if(rx>=468&&rx<=632&&ry>=95&&ry<=228){
      if(pose==='sleeping'&&sleepTimer>=0.2)wakeFromBed(pl);
      else if(pose!=='sleeping')sleepInBed(pl);
      return true;
    }
    // Click on wardrobe or clothes rack (x: 78..328, y: 65..195) -> change outfit
    if(rx>=78&&rx<=328&&ry>=65&&ry<=195){
      if(pose!=='none')pose='none';
      if(pl){pl.x=226;pl.y=204;pl.dir='up';pl.walk=0;}
      const pal=TieuPham.applyOutfit(TieuPham.outfitIdx+1);
      showToast('Đã thay trang phục: '+pal.name);
      return true;
    }
    // Click on bottom open door threshold (x: 280..420, y: 370..460) -> exit to village
    if(rx>=280&&rx<=420&&ry>=370&&ry<=460){
      exit(pl);
      const curDay=typeof Villagers!=='undefined'&&Villagers.day?Villagers.day:1;
      const isExamDay=curDay>=3||(typeof Quest1!=='undefined'&&Quest1.getState()==='selection_ready');
      if(isExamDay&&pl){
        showToast('Đến Quảng Trường Làng tham gia khảo nghiệm!');
        pl.x=800;pl.y=550;
        if(typeof Quest1!=='undefined'&&Quest1.update&&typeof Villagers!=='undefined'){
          Quest1.update(0.1,0,pl,Villagers);
        }
      }
      return true;
    }
    return false;
  }

  // Draw exterior doormat & subtle doorway cue in front of Tiểu Phàm's house on the village map
  function drawExteriorDoor(g,p,t){
    // Woven straw threshold mat right outside the door at (207..236, 290..300)
    g.save();
    g.fillStyle='#5c452d88';
    g.beginPath();
    g.roundRect(206,291,31,10,3);
    g.fill();
    g.fillStyle='#c4a468';
    g.beginPath();
    g.roundRect(208,292,27,8,2);
    g.fill();
    g.strokeStyle='#8f7242';
    g.lineWidth=1;
    for(let x=211;x<233;x+=4){
      g.beginPath();
      g.moveTo(x,293);
      g.lineTo(x,299);
      g.stroke();
    }
    // Warm bobbing arrow / label when player is near their front door
    if(p&&Math.hypot(p.x-EXT_DOOR.x,p.y-EXT_DOOR.y)<62){
      const pulse=Math.sin(t*4)*1.8;
      g.fillStyle='#162d23e6';
      g.beginPath();
      g.roundRect(169,204+pulse,104,16,4);
      g.fill();
      g.strokeStyle='#d8c383aa';
      g.lineWidth=1;
      g.stroke();
      g.fillStyle='#f5e6b8';
      g.font='bold 9.5px system-ui';
      g.textAlign='center';
      g.fillText('▲ Nhà của Tiểu Phàm',221,215+pulse);
    }
    g.restore();
  }

  function drawHangerShirt(g,x,y,mainCol,trimCol,sway=0){
    g.save();
    g.translate(x,y);
    g.rotate(sway);
    // Wooden hanger bar
    g.strokeStyle='#5e432a';
    g.lineWidth=1.5;
    g.beginPath();
    g.moveTo(-11,0);
    g.lineTo(11,0);
    g.stroke();
    // Coarse cloth sleeves & tunic body
    g.fillStyle=mainCol;
    g.beginPath();
    g.moveTo(-8,0);
    g.lineTo(8,0);
    g.lineTo(15,10);
    g.lineTo(12,15);
    g.lineTo(8,10);
    g.lineTo(9,31);
    g.lineTo(-9,31);
    g.lineTo(-8,10);
    g.lineTo(-12,15);
    g.lineTo(-15,10);
    g.closePath();
    g.fill();
    g.strokeStyle='#241e18';
    g.lineWidth=1;
    g.stroke();
    // Crossed collar & waist sash
    g.strokeStyle=trimCol;
    g.lineWidth=1.6;
    g.beginPath();
    g.moveTo(-4.5,1);
    g.lineTo(2,11);
    g.moveTo(4.5,1);
    g.lineTo(-1,8);
    g.stroke();
    g.fillStyle=trimCol;
    g.fillRect(-8,16.5,16,3.2);
    g.restore();
  }

  function drawFoldedClothes(g,x,y,topCol,botCol,sashCol){
    // Bottom folded trousers/shirt stack
    g.fillStyle='#1f1a1438';
    g.beginPath();
    g.ellipse(x+13,y+14,15,4.5,0,0,Math.PI*2);
    g.fill();
    g.fillStyle=botCol;
    g.beginPath();
    g.roundRect(x,y+5,26,8,2);
    g.fill();
    g.strokeStyle='#262019';
    g.lineWidth=1;
    g.stroke();
    // Top folded shirt
    g.fillStyle=topCol;
    g.beginPath();
    g.roundRect(x+1,y,24,6.5,2);
    g.fill();
    g.stroke();
    // Collar fold band
    g.fillStyle=sashCol;
    g.fillRect(x+9,y,8,6.5);
  }

  function drawInterior(ctx,p,t,minutes){
    const nightAmt=typeof VillageLighting!=='undefined'?VillageLighting.night(minutes):0;
    const weatherKind=typeof Weather!=='undefined'?Weather.kind:'sun';

    // 1. Outer timber & shadow frame around the 10% larger cottage room (612x392)
    ctx.fillStyle='#10211b';
    ctx.fillRect(-1000,-1000,3000,3000);

    // Exterior porch garden strip visible just outside the open front door
    ctx.fillStyle='#4a6e32';
    ctx.fillRect(276,412,152,46);
    ctx.fillStyle='#c4a36e';
    ctx.fillRect(306,412,92,46);

    // Cottage outer timber walls (thick hewn wood & mud-plaster frame: 612x392)
    ctx.fillStyle='#3b2a1d';
    ctx.beginPath();
    ctx.roundRect(46,36,612,392,9);
    ctx.fill();
    ctx.strokeStyle='#22170f';
    ctx.lineWidth=3;
    ctx.stroke();

    // 2. Back & side walls (vách đất nện khung gỗ mộc đơn sơ: 588x104)
    ctx.fillStyle='#634932';
    ctx.fillRect(58,48,588,104);
    // Warm mud-plaster panels between timber posts
    for(const [wx,ww]of [[72,162],[248,208],[470,162]]){
      ctx.fillStyle='#9c8462';
      ctx.fillRect(wx,58,ww,84);
      ctx.fillStyle='#8c7453';
      ctx.fillRect(wx,124,ww,18);
      // Subtle plaster texture lines
      ctx.fillStyle='#ab9370';
      ctx.fillRect(wx+14,74,40,3);
      ctx.fillRect(wx+ww-60,98,32,3);
    }
    // Baseboard & top wall beam
    ctx.fillStyle='#4d3724';
    ctx.fillRect(58,48,588,10);
    ctx.fillRect(58,140,588,12);
    // Vertical timber pillars along the back wall
    for(const px of [58,235,457,633]){
      ctx.fillStyle='#4a3422';
      ctx.fillRect(px,48,13,104);
      ctx.fillStyle='#694c34';
      ctx.fillRect(px+2,50,4,100);
    }

    // 3. Wooden lattice window on back wall (showing sky/daylight/night/weather)
    const wx=344,wy=66,ww=84,wh=55;
    ctx.fillStyle='#3d2b1c';
    ctx.fillRect(wx-4,wy-4,ww+8,wh+8);
    ctx.save();
    ctx.beginPath();
    ctx.rect(wx,wy,ww,wh);
    ctx.clip();
    // Sky color behind window based on time of day & weather
    const skyCol=nightAmt>.5?'#192844':weatherKind==='rain'||weatherKind==='storm'?'#5c7885':'#8ecae6';
    ctx.fillStyle=skyCol;
    ctx.fillRect(wx,wy,ww,wh);
    // Distant green bamboo/tree silhouette outside the window
    ctx.fillStyle=nightAmt>.5?'#1c332e':'#4d7c38';
    ctx.beginPath();
    ctx.arc(wx+20,wy+48,20,0,Math.PI*2);
    ctx.arc(wx+64,wy+50,17,0,Math.PI*2);
    ctx.fill();
    if(weatherKind==='rain'||weatherKind==='storm'){
      ctx.strokeStyle='#cbe3f088';
      ctx.lineWidth=1;
      for(let i=0;i<6;i++){
        const rx=wx+8+((i*15+t*40)%68),ry=wy+4+((i*17+t*90)%42);
        ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-3,ry+7);ctx.stroke();
      }
    }else if(nightAmt>.5){
      ctx.fillStyle='#f7efc2';
      ctx.fillRect(wx+30,wy+13,2,2);
      ctx.fillRect(wx+58,wy+20,2,2);
    }
    ctx.restore();
    // Wooden window lattice bars (chấn song gỗ)
    ctx.fillStyle='#593f29';
    for(let lx=wx+16.5;lx<wx+ww-4;lx+=16.5)ctx.fillRect(lx,wy,3,wh);
    ctx.fillRect(wx,wy+wh/2-1.5,ww,3);
    ctx.fillStyle='#78583c';
    ctx.fillRect(wx-5,wy+wh,ww+10,5);

    // 4. Rustic wooden plank floor (sàn ván gỗ mộc: 584x262, +10% larger)
    ctx.fillStyle='#8c6b48';
    ctx.fillRect(60,152,584,262);
    for(let row=0,fy=152;fy<414;fy+=19,row++){
      const ph=Math.min(18,414-fy);
      ctx.fillStyle=row%2===0?'#8c6b48':'#826240';
      ctx.fillRect(60,fy,584,ph);
      ctx.fillStyle='#61482e';
      ctx.fillRect(60,fy+ph,584,1);
      // Plank vertical joints & wood grain
      for(let fx=86+(row%3)*50;fx<595;fx+=120){
        ctx.fillStyle='#594129';
        ctx.fillRect(fx,fy,2,ph);
        ctx.fillStyle='#9e7b56';
        ctx.fillRect(fx+15,fy+4,32,2);
      }
    }
    // Doorway alcove floor
    ctx.fillStyle='#7d5e3d';
    ctx.fillRect(312,410,80,20);

    // Sunlight / moonlight beam slanting from the window onto the floor
    ctx.save();
    ctx.fillStyle=nightAmt>.5?'rgba(150,185,235,0.08)':'rgba(255,238,185,0.16)';
    ctx.beginPath();
    ctx.moveTo(wx,wy+wh);
    ctx.lineTo(wx+ww,wy+wh);
    ctx.lineTo(wx+ww+28,252);
    ctx.lineTo(wx-20,252);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Woven straw mat (chiếu cói giữa nhà: 194x114) under the wooden table
    ctx.fillStyle='#5c452d55';
    ctx.beginPath();
    ctx.roundRect(244,242,194,114,6);
    ctx.fill();
    ctx.fillStyle='#c9b079';
    ctx.beginPath();
    ctx.roundRect(246,244,190,110,5);
    ctx.fill();
    ctx.strokeStyle='#8c5a3c';
    ctx.lineWidth=2;
    ctx.strokeRect(248,246,186,106);
    ctx.strokeStyle='#b39860';
    ctx.lineWidth=1;
    for(let mx=258;mx<428;mx+=8){
      ctx.beginPath();ctx.moveTo(mx,248);ctx.lineTo(mx,350);ctx.stroke();
    }

    // 5. FURNITURE #1: 1 TỦ ĐỒ GỖ (Rustic Wooden Wardrobe at x=84, y=72, 90x118)
    ctx.save();
    // Ground shadow
    ctx.fillStyle='#24180e55';
    ctx.beginPath();
    ctx.ellipse(129,192,50,11,0,0,Math.PI*2);
    ctx.fill();
    // Cabinet body
    ctx.fillStyle='#4a321e';
    ctx.beginPath();
    ctx.roundRect(84,72,90,118,3);
    ctx.fill();
    ctx.fillStyle='#6e4d30';
    ctx.fillRect(88,76,82,108);
    // Top cornice
    ctx.fillStyle='#3d2817';
    ctx.fillRect(80,68,98,7);
    ctx.fillStyle='#876240';
    ctx.fillRect(82,70,94,3);
    // Left closed door & Right slightly-ajar door showing folded clothes inside
    ctx.fillStyle='#5c3f26';
    ctx.fillRect(91,81,37,95);
    ctx.fillStyle='#7d5938';
    ctx.fillRect(93,83,33,91);
    // Right door interior gap with visible stacked cloth inside wardrobe
    ctx.fillStyle='#2e1f12';
    ctx.fillRect(130,81,37,95);
    ctx.fillStyle='#a89068';
    ctx.fillRect(132,114,14,9);
    ctx.fillStyle='#5c7887';
    ctx.fillRect(132,123,15,9);
    ctx.fillStyle='#8c6248';
    ctx.fillRect(132,149,14,10);
    // Right door panel
    ctx.fillStyle='#5c3f26';
    ctx.fillRect(141,81,26,95);
    ctx.fillStyle='#7d5938';
    ctx.fillRect(143,83,22,91);
    // Brass ring handles
    ctx.fillStyle='#d4b263';
    ctx.fillRect(120,122,3,8);
    ctx.fillRect(145,122,3,8);
    // Small cloth bundle (tay nải) on top of wardrobe
    ctx.fillStyle='#8c7355';
    ctx.beginPath();
    ctx.ellipse(115,62,15,8,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#b59b78';
    ctx.beginPath();
    ctx.ellipse(114,60,12,5.5,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // 6. FURNITURE #2: MẤY BỘ QUẦN ÁO (Wooden Clothes Rack with 3 hanging outfits + 2 folded sets on chest)
    ctx.save();
    // Shadow under clothes rack & chest
    ctx.fillStyle='#24180e44';
    ctx.beginPath();
    ctx.ellipse(236,186,42,9,0,0,Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(301,186,25,8,0,0,Math.PI*2);
    ctx.fill();
    // Wooden/bamboo standing clothes rack (giá gỗ treo quần áo)
    ctx.fillStyle='#4f3722';
    ctx.fillRect(198,100,5,86);
    ctx.fillRect(267,100,5,86);
    ctx.fillRect(192,182,17,4);
    ctx.fillRect(261,182,17,4);
    // Top horizontal rail & bottom shoe/cloth shelf
    ctx.fillStyle='#7a5838';
    ctx.fillRect(193,104,84,5);
    ctx.fillRect(200,171,69,4);
    // 3 hanging sets of rustic village clothes on the rack
    const gentleSway=Math.sin(t*1.6)*.025;
    drawHangerShirt(ctx,215,109,'#988368','#e6dbc2',gentleSway);
    drawHangerShirt(ctx,236,109,'#5c7887','#d8c9a8',-gentleSway*.8);
    drawHangerShirt(ctx,257,109,'#87634b','#decbb0',gentleSway*.6);
    // Folded trousers on the lower rack shelf
    ctx.fillStyle='#3b4240';
    ctx.fillRect(208,163,20,8);
    ctx.fillStyle='#4d4339';
    ctx.fillRect(236,163,20,8);
    // Low wooden storage chest beside the rack with 2 neatly folded sets of clothes on top
    ctx.fillStyle='#543b24';
    ctx.beginPath();
    ctx.roundRect(280,152,42,34,2);
    ctx.fill();
    ctx.fillStyle='#785636';
    ctx.fillRect(283,155,36,28);
    ctx.fillStyle='#c9ab62';
    ctx.fillRect(299,165,4,5);
    drawFoldedClothes(ctx,286,138,'#a38d70','#3e4240','#e6dcc4');
    drawFoldedClothes(ctx,288,126,'#688291','#4a3d33','#d9ccb2');
    ctx.restore();

    // 7. FURNITURE #3: 1 GIƯỜNG GỖ ĐƠN SƠ (Rustic Wooden Bed at x=474, y=108, 150x106)
    ctx.save();
    ctx.fillStyle='#22170e55';
    ctx.beginPath();
    ctx.ellipse(549,216,80,15,0,0,Math.PI*2);
    ctx.fill();
    // Bed legs & solid wooden frame
    ctx.fillStyle='#47311e';
    ctx.fillRect(474,108,150,106);
    // Raised wooden headboard (right side) & footboard (left side)
    ctx.fillStyle='#5e4229';
    ctx.fillRect(611,97,13,117);
    ctx.fillRect(474,103,11,111);
    // Woven straw sleeping mat (chiếu cói trải giường)
    ctx.fillStyle='#ccb37c';
    ctx.fillRect(485,115,126,90);
    ctx.strokeStyle='#b59a62';
    ctx.lineWidth=1;
    for(let bx=494;bx<606;bx+=8){
      ctx.beginPath();ctx.moveTo(bx,115);ctx.lineTo(bx,205);ctx.stroke();
    }
    // Red-brown cloth mat border
    ctx.fillStyle='#8c4f3a';
    ctx.fillRect(485,115,126,4);
    ctx.fillRect(485,201,126,4);
    // Rustic pillow (gối vải thô)
    ctx.fillStyle='#dfd3b6';
    ctx.beginPath();
    ctx.roundRect(582,126,22,42,4);
    ctx.fill();
    ctx.strokeStyle='#6e5b43';
    ctx.stroke();
    ctx.fillStyle='#967856';
    ctx.fillRect(590,127,6,40);
    if(pose==='sleeping'){
      // Tiểu Phàm lying down on the wooden bed under the blanket
      TieuPham.drawSleeping(ctx,548,160,t);
    }else{
      // Folded coarse patchwork blanket (chăn vải thô đơn sơ)
      ctx.fillStyle='#6e7f78';
      ctx.beginPath();
      ctx.roundRect(492,121,62,78,4);
      ctx.fill();
      ctx.strokeStyle='#36403c';
      ctx.stroke();
      ctx.fillStyle='#889991';
      ctx.fillRect(496,125,50,70);
      // Rustic cloth patch on blanket
      ctx.fillStyle='#9e8768';
      ctx.fillRect(510,141,18,16);
      ctx.strokeStyle='#544533';
      ctx.strokeRect(510,141,18,16);
    }
    // Wooden front bed rail
    ctx.fillStyle='#6e4e32';
    ctx.fillRect(474,205,150,9);
    // Pair of straw sandals (dép rơm) tucked beside the bed
    for(const [sx,sy]of [[525,221],[539,222]]){
      ctx.fillStyle='#bfa36a';
      ctx.beginPath();
      ctx.ellipse(sx,sy,5.5,3,0.15,0,Math.PI*2);
      ctx.fill();
      ctx.strokeStyle='#6e5632';
      ctx.lineWidth=1;
      ctx.stroke();
    }
    ctx.restore();

    // 8. Corner earthenware water jar (chum nước góc nhà)
    ctx.save();
    ctx.fillStyle='#24180e44';
    ctx.beginPath();
    ctx.ellipse(596,396,24,9,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#7a5238';
    ctx.beginPath();
    ctx.ellipse(596,381,20,18,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#996b4c';
    ctx.beginPath();
    ctx.ellipse(593,378,13,12,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#5c3d28';
    ctx.beginPath();
    ctx.ellipse(596,364,13,4.5,0,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle='#588694';
    ctx.beginPath();
    ctx.ellipse(596,364,10,3,0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();

    // 9. FURNITURE #4: 1 BÀN GỖ ĐƠN SƠ & GHẾ ĐẨU (Rustic Wooden Table & Stools at center: 128x48)
    const drawTableAndProps=()=>{
      ctx.save();
      // Stools around the table (ghế đẩu gỗ)
      for(const [sx,sy]of [[259,294],[423,294],[341,250]]){
        if(pose==='sitting'&&sy===250)continue; // drawn inside TieuPham.drawSitting
        ctx.fillStyle='#24180e44';
        ctx.beginPath();
        ctx.ellipse(sx,sy+7,13,5,0,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle='#543a23';
        ctx.fillRect(sx-9,sy,4,9);
        ctx.fillRect(sx+5,sy,4,9);
        ctx.fillStyle='#7d5938';
        ctx.beginPath();
        ctx.roundRect(sx-11,sy-6,22,9,2);
        ctx.fill();
        ctx.strokeStyle='#382616';
        ctx.lineWidth=1;
        ctx.stroke();
      }
      // Table shadow
      ctx.fillStyle='#22170e55';
      ctx.beginPath();
      ctx.ellipse(341,326,66,14,0,0,Math.PI*2);
      ctx.fill();
      // Table legs
      ctx.fillStyle='#4a321e';
      for(const [lx,ly]of [[284,306],[390,306],[290,275],[383,275]]){
        ctx.fillRect(lx,ly,8,22);
      }
      // Rustic solid wooden tabletop (mặt bàn gỗ ghép ván mộc)
      ctx.fillStyle='#593d25';
      ctx.beginPath();
      ctx.roundRect(277,264,128,48,4);
      ctx.fill();
      ctx.fillStyle='#825d3b';
      ctx.beginPath();
      ctx.roundRect(280,266,122,42,3);
      ctx.fill();
      // Plank lines on tabletop
      ctx.strokeStyle='#63452a';
      ctx.lineWidth=1;
      for(const ty of [280,294]){
        ctx.beginPath();ctx.moveTo(281,ty);ctx.lineTo(401,ty);ctx.stroke();
      }
      // Bamboo tea tray, clay teapot & two coarse ceramic cups
      ctx.fillStyle='#a88b56';
      ctx.beginPath();
      ctx.roundRect(304,275,46,24,3);
      ctx.fill();
      ctx.strokeStyle='#6e5732';
      ctx.stroke();
      // Clay teapot (ấm trà đất nung)
      ctx.fillStyle='#784830';
      ctx.beginPath();
      ctx.ellipse(319,286,7.5,6,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#9c6346';
      ctx.beginPath();
      ctx.ellipse(318,284,4.5,3.2,0,0,Math.PI*2);
      ctx.fill();
      // Two small clay teacups (chén sành)
      for(const [cx,cy]of [[336,282],[340,291]]){
        ctx.fillStyle='#c9be9f';
        ctx.beginPath();
        ctx.ellipse(cx,cy,3.8,2.8,0,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle='#75946b';
        ctx.fillRect(cx-1.5,cy-1,3,1.5);
      }
      // Warm rising tea steam when sitting at the wooden table
      if(pose==='sitting'){
        ctx.strokeStyle='rgba(255,248,230,0.58)';
        ctx.lineWidth=1.2;
        for(let i=0;i<2;i++){
          const sy=278-((t*10+i*6)%11);
          const sx=336+Math.sin(t*3+i)*1.8;
          ctx.beginPath();
          ctx.moveTo(sx,sy);
          ctx.quadraticCurveTo(sx+2,sy-3,sx-1,sy-6);
          ctx.stroke();
        }
      }
      // Small oil lamp on right side of table (đèn dầu nhỏ)
      ctx.fillStyle='#594a33';
      ctx.beginPath();
      ctx.ellipse(374,288,6.5,4,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#b59854';
      ctx.fillRect(372,280,4,8);
      // Flame on oil lamp
      const flameH=4.2+Math.sin(t*9)*1;
      ctx.fillStyle='#ff9d3b';
      ctx.beginPath();
      ctx.ellipse(374,278,2.6,flameH,0,0,Math.PI*2);
      ctx.fill();
      ctx.fillStyle='#fff0a8';
      ctx.beginPath();
      ctx.ellipse(374,279,1.3,flameH*.55,0,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    };

    // Depth-sort Tiểu Phàm against the central wooden table (y = 302)
    if(pose==='sitting'){
      TieuPham.drawSitting(ctx,p,t);
      drawTableAndProps();
    }else if(pose==='sleeping'){
      drawTableAndProps();
    }else if(p.y<302){
      TieuPham.draw(ctx,p,t);
      drawTableAndProps();
    }else{
      drawTableAndProps();
      TieuPham.draw(ctx,p,t);
    }

    // 10. Front wall bottom timber frame & open double wooden door at (312..392, 410..428)
    ctx.fillStyle='#3b2a1d';
    ctx.fillRect(46,412,266,16);
    ctx.fillRect(392,412,266,16);
    // Open wooden door leaves swung inward on left & right of threshold
    ctx.fillStyle='#5c4028';
    ctx.fillRect(298,380,13,36);
    ctx.fillRect(393,380,13,36);
    ctx.fillStyle='#7d5838';
    ctx.fillRect(300,382,9,32);
    ctx.fillRect(395,382,9,32);
    // Threshold mat & exit label
    ctx.fillStyle='#bfa065';
    ctx.beginPath();
    ctx.roundRect(320,408,64,15,3);
    ctx.fill();
    ctx.strokeStyle='#7a6136';
    ctx.lineWidth=1;
    ctx.stroke();
    ctx.fillStyle='#f5e6b8';
    ctx.font='bold 10.5px system-ui';
    ctx.textAlign='center';
    ctx.fillText('▼ Cửa ra sân làng',352,442);

    // Subtle labels on furniture when player is inside
    if(pose==='sitting'){
      ctx.font='bold 10.5px system-ui';
      const lbl='Đang ngồi bên bàn gỗ mộc (Nhấn ✊ / di chuyển để đứng dậy)';
      const lw=ctx.measureText(lbl).width+18;
      ctx.fillStyle='#142920e6';
      ctx.beginPath();
      ctx.roundRect(341-lw/2,332,lw,19,5);
      ctx.fill();
      ctx.strokeStyle='#e2c97eaa';
      ctx.stroke();
      ctx.fillStyle='#f9ebbf';
      ctx.fillText(lbl,341,345);
    }else if(pose==='sleeping'&&sleepTimer>=2.2){
      ctx.font='bold 10.5px system-ui';
      const lbl='Đang nằm nghỉ trên giường gỗ (Nhấn ✊ / di chuyển để thức dậy)';
      const lw=ctx.measureText(lbl).width+18;
      const bx=Math.min(642-lw/2,548);
      ctx.fillStyle='#142920e6';
      ctx.beginPath();
      ctx.roundRect(bx-lw/2,76,lw,19,5);
      ctx.fill();
      ctx.strokeStyle='#e2c97eaa';
      ctx.stroke();
      ctx.fillStyle='#f9ebbf';
      ctx.fillText(lbl,bx,89);
    }else if(pose==='none'&&nearProp){
      ctx.font='bold 10.5px system-ui';
      const act=nearProp.id==='table'?'Nhấn ✊ hoặc chạm để ngồi':nearProp.id==='bed'?'Nhấn ✊ hoặc chạm để ngủ qua ngày':'Nhấn ✊ hoặc chạm để thay đồ';
      const lbl=nearProp.name+' · '+act;
      const lw=ctx.measureText(lbl).width+16;
      const ly=nearProp.labelY||(nearProp.y-58);
      ctx.fillStyle='#142920dd';
      ctx.beginPath();
      ctx.roundRect(nearProp.x-lw/2,ly,lw,18,4);
      ctx.fill();
      ctx.strokeStyle='#d6c384aa';
      ctx.stroke();
      ctx.fillStyle='#f7e8ba';
      ctx.fillText(lbl,nearProp.x,ly+12);
    }

    // Warm indoor evening/night lighting & oil lamp halo
    if(nightAmt>.05){
      ctx.save();
      ctx.fillStyle=`rgba(12, 20, 38, ${nightAmt*0.42})`;
      ctx.fillRect(46,36,612,392);
      ctx.globalCompositeOperation='screen';
      const glow=ctx.createRadialGradient(374,279,4,374,279,195);
      glow.addColorStop(0,`rgba(255, 195, 95, ${0.45*nightAmt})`);
      glow.addColorStop(0.5,`rgba(255, 170, 70, ${0.18*nightAmt})`);
      glow.addColorStop(1,'rgba(255, 160, 60, 0)');
      ctx.fillStyle=glow;
      ctx.fillRect(56,48,592,366);
      ctx.restore();
    }

    // Top-right Day & Clock wood-plaque indicator inside the cottage
    const curDay=typeof Villagers!=='undefined'?Villagers.day:1;
    const totMin=Math.floor(minutes||390);
    const hh=String(Math.floor(totMin/60)%24).padStart(2,'0');
    const mm=String(totMin%60).padStart(2,'0');
    ctx.save();
    ctx.fillStyle='#1c2f24e6';
    ctx.beginPath();
    ctx.roundRect(536,11,122,20,5);
    ctx.fill();
    ctx.strokeStyle='#c9b072aa';
    ctx.lineWidth=1;
    ctx.stroke();
    ctx.fillStyle='#f5e6b8';
    ctx.font='bold 10.5px system-ui';
    ctx.textAlign='center';
    ctx.fillText(`Ngày ${curDay} · ${hh}:${mm}`,597,24.5);
    ctx.restore();

    // Sleep night-to-morning curtain transition when lying down on the bed
    if(pose==='sleeping'&&sleepTimer<1.3){
      const pFade=Math.min(1,sleepTimer/1.2);
      const alpha=Math.sin(pFade*Math.PI)*0.86;
      ctx.save();
      ctx.fillStyle=`rgba(8, 14, 26, ${alpha.toFixed(3)})`;
      ctx.fillRect(46,36,612,392);
      if(alpha>0.25){
        ctx.fillStyle=`rgba(249, 235, 192, ${Math.min(1,alpha*1.2).toFixed(3)})`;
        ctx.font='bold 15px system-ui';
        const isExamDay=typeof Quest1!=='undefined'&&(Quest1.getState()==='selection_ready'||curDay>=3);
        const msg=sleepTimer<0.6
          ?'🌙 Tiểu Phàm nằm trên giường gỗ, ngủ say qua đêm...'
          :(isExamDay
            ?`☀️ Bình minh Ngày ${curDay} (06:00 sáng) — Ngày Khảo Nghiệm Linh Căn!`
            :`☀️ Bình minh Ngày ${curDay} (06:00 sáng) — Trời đã sáng!`);
        ctx.fillText(msg,352,226);
      }
      ctx.restore();
    }

    // Status banner at top-center of room
    if(bannerTimer>0&&bannerText){
      ctx.save();
      ctx.font='bold 10.5px system-ui';
      const bw=Math.min(460,ctx.measureText(bannerText).width+24);
      ctx.fillStyle='#162d23ee';
      ctx.beginPath();
      ctx.roundRect(290-bw/2,11,bw,20,5);
      ctx.fill();
      ctx.strokeStyle='#dec57eaa';
      ctx.lineWidth=1;
      ctx.stroke();
      ctx.fillStyle='#ffe9b3';
      ctx.textAlign='center';
      ctx.fillText(bannerText,290,24.5);
      ctx.restore();
    }
  }

  return{
    W,H,
    get inside(){return inside},
    set inside(v){inside=!!v},
    get pose(){return pose},
    get nearProp(){return nearProp},
    canWalk,
    enter,
    exit,
    sitAtTable,
    standFromTable,
    sleepInBed,
    wakeFromBed,
    checkTransition,
    updateInterior,
    interact,
    handleCanvasClick,
    drawExteriorDoor,
    drawInterior
  };
})();

