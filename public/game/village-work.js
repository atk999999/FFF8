'use strict';
const VillageWork=(()=>{
const roofs=[{x:138,y:158,w:160,h:85},{x:327,y:156,w:153,h:86},{x:613,y:29,w:298,h:150},{x:160,y:399,w:169,h:95},{x:1068,y:267,w:155,h:92},{x:873,y:605,w:163,h:94},{x:1064,y:605,w:166,h:94},{x:258,y:1064,w:180,h:95},{x:1080,y:1064,w:180,h:95},...EastVillage.houses.map(h=>({x:h.x,y:h.y,w:h.w||180,h:(h.h||151)*.63})),{x:2330,y:90,w:298,h:150},{x:2710,y:650,w:220,h:70}];
const styles=['#b8924c','#6b8983','#795b4c','#a06c55','#70899a','#8b6349','#978563','#6f8776','#776779','#b6a263','#ab765c','#698278','#a58771','#776788','#738397','#a2634e'];
let facade;const delivered=new Set(),homeDelivered=new Set();let grain=36,homeGrain=12,lastStrike=-1,audio=null,enabled=false;
const buffalo=[{type:'buffalo',x:1680,y:445,dir:1,phase:0},{type:'buffalo',x:1740,y:450,dir:-1,phase:1}];
const sparrows=Array.from({length:6},(_,i)=>({x:1680+i*85,y:140+(i%3)*80,vx:0,vy:0,air:0,phase:i*1.3}));
const STAGE_INFO=[
  {stage:1,title:'NGÀY 1/7 · LÀM ĐẤT & DẪN NƯỚC'},
  {stage:2,title:'NGÀY 2/7 · GIEO MẠ NON'},
  {stage:3,title:'NGÀY 3/7 · MẠ ĐẺ NHÁNH'},
  {stage:4,title:'NGÀY 4/7 · PHUN THUỐC THẢO MỘC'},
  {stage:5,title:'NGÀY 5/7 · LÚA TRỖ ĐÒNG'},
  {stage:6,title:'NGÀY 6/7 · LÚA CHÍN VÀNG'},
  {stage:7,title:'NGÀY 7/7 · GẶT LÚA & CHUYỂN THÓC'}
];
function shape(g,r){g.beginPath();g.moveTo(r.x,r.y+r.h*.72);g.lineTo(r.x+r.w*.54,r.y);g.lineTo(r.x+r.w,r.y+r.h*.65);g.lineTo(r.x+r.w*.96,r.y+r.h);g.lineTo(r.x+r.w*.06,r.y+r.h);g.closePath()}
function init(){facade=document.createElement('canvas');facade.width=3072;facade.height=1331;const g=facade.getContext('2d');roofs.forEach((r,i)=>{if(i===roofs.length-1)return;g.save();shape(g,r);g.clip();g.globalAlpha=.28;g.fillStyle=styles[i%styles.length];g.fillRect(r.x,r.y,r.w,r.h);g.globalAlpha=.38;g.strokeStyle=i%3===0?'#d3bb78':'#384d4a';g.lineWidth=i%3===0?1:2;for(let v=12;v<r.h;v+=i%3===0?6:11){g.beginPath();g.moveTo(r.x,r.y+v);g.lineTo(r.x+r.w,r.y+v);g.stroke()}g.restore();const x=r.x+r.w*.5,y=r.y+r.h+22;g.fillStyle=styles[(i+4)%styles.length];g.fillRect(x-17,y-6,34,4);g.fillStyle='#d2c193';g.fillRect(x-12,y-4,24,2);
if(i%4===0){g.fillStyle='#9c8052';for(let k=0;k<3;k++){g.beginPath();g.ellipse(r.x+r.w*.86+k*5,y+22,6,9,0,0,7);g.fill()}g.strokeStyle='#665437';g.beginPath();g.moveTo(r.x+r.w*.82,y+5);g.lineTo(r.x+r.w*.82,y+30);g.stroke()}
else if(i%4===1){g.fillStyle='#916c4f';g.fillRect(r.x+r.w*.2,y+19,15,9);for(let k=0;k<4;k++){g.fillStyle=k%2?'#efc7b0':'#c5cda1';g.fillRect(r.x+r.w*.2+k*4,y+13,4,7)}}
else if(i%4===2){g.strokeStyle='#8b5747';g.lineWidth=3;g.beginPath();g.moveTo(x-35,y+15);g.lineTo(x+30,y+15);g.stroke();for(let k=0;k<3;k++){g.fillStyle=['#ad9d79','#7b9c92','#bc8d79'][k];g.fillRect(x-28+k*18,y+15,12,12)}}
else {g.fillStyle='#77684e';g.fillRect(r.x+r.w*.85,y+12,5,22);g.fillStyle='#a6a089';g.fillRect(r.x+r.w*.85-5,y+9,16,5)}
});
// Doors retain their exact openings but have individual timber, shutters and handles.
VillageLighting.houses.forEach((house,i)=>{const[x,y,w,h]=house.door;g.fillStyle=['#72513b','#8e6a4c','#526e67','#8c6e55','#635147'][i%5];g.fillRect(x,y,w,h);g.strokeStyle='#3e3a30';g.lineWidth=1;for(let xx=x+3;xx<x+w;xx+=i%2?6:9){g.beginPath();g.moveTo(xx,y);g.lineTo(xx,y+h);g.stroke()}g.fillStyle='#c4aa6c';g.fillRect(x+w*.65,y+h*.53,2,4);if(i%3===0){g.strokeStyle='#b3a17c';g.beginPath();g.moveTo(x+2,y+h-3);g.lineTo(x+w-2,y+3);g.stroke()}});
for(const [name,x,y,w,h]of [['Lò nung',1005,1038,46,33],['Ống khói',1036,1005,11,33],['Bàn rèn',993,1141,40,19],['Bàn thợ mộc',2698,925,64,29]])Collision.polygons.push({name,points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]});
Collision.polygons.push({name:'Kho thóc',points:[[2710,720],[2820,650],[2930,720],[2920,820],[2720,820]]});
const button=document.getElementById('sound');button.onclick=async()=>{enabled=!enabled;if(enabled){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){enabled=false;button.textContent='Không hỗ trợ âm thanh';return}audio=audio||new AC();await audio.resume()}button.textContent=enabled?'♪ Âm thanh: Bật':'♪ Âm thanh: Tắt';button.setAttribute('aria-pressed',String(enabled))};
}
function strike(volume){if(!enabled||!audio||audio.state!=='running'||volume<.01)return;const now=audio.currentTime;for(const [freq,decay]of [[740,.12],[1180,.18],[2370,.08]]){const o=audio.createOscillator(),v=audio.createGain();o.type='triangle';o.frequency.value=freq;v.gain.setValueAtTime(volume*.12,now);v.gain.exponentialRampToValueAtTime(.0001,now+decay);o.connect(v);v.connect(audio.destination);o.start(now);o.stop(now+decay+.01)}}
function update(dt,t,minutes,day,p){const smith=Villagers.list.find(n=>n.id==='ho'),active=smith&&!smith.hidden&&smith.arrived&&smith.state==='work';const beat=Math.floor(t*3/(Math.PI*2));if(active&&beat!==lastStrike&&Math.sin(t*3+smith.phase)>.65){lastStrike=beat;strike(Math.max(0,1-Math.hypot(p.x-1010,p.y-1100)/650))}
const hour=minutes/60;for(const n of Villagers.list){const key=day+':'+n.id;if(n.state==='grain'&&n.arrived&&!delivered.has(key)){grain+=4;delivered.add(key)}const hKey=day+':home:'+n.id;if(n.state==='homegrain'&&n.arrived&&!homeDelivered.has(hKey)){homeGrain+=2;grain+=2;homeDelivered.add(hKey)}}
for(let i=0;i<buffalo.length;i++){const b=buffalo[i];b.hidden=hour<6||hour>=18||Weather.storm;if(b.hidden)continue;const target=[1690+i*70+Math.sin(t*.05+i)*50,443+Math.cos(t*.04+i)*10],dx=target[0]-b.x,dy=target[1]-b.y,d=Math.hypot(dx,dy);b.grazing=Math.sin(t*.22+i*2)>.2;b.walking=d>2&&!b.grazing;if(b.walking){const nx=b.x+dx/d*dt*13,ny=b.y+dy/d*dt*13;if(Collision.canWalk(nx,ny)){b.x=nx;b.y=ny;b.dir=dx<0?-1:1}}b.phase+=dt*3}
for(let i=0;i<sparrows.length;i++){const sp=sparrows[i];sp.phase+=dt*6;let scared=p&&Math.hypot(p.x-sp.x,p.y-sp.y)<85;if(!scared){for(const n of Villagers.list)if(!n.hidden&&['binh','dao'].includes(n.id)&&Math.hypot(n.x-sp.x,n.y-sp.y)<70){scared=true;break}}if(scared&&sp.air<=0){sp.air=1.8;sp.vx=(Math.cos(i*2.1+t)*42);sp.vy=-28-Math.sin(i+t)*12}if(sp.air>0){sp.air=Math.max(0,sp.air-dt);sp.x+=sp.vx*dt;sp.y+=sp.vy*dt;if(sp.x<1620||sp.x>2210)sp.vx*=-1;if(sp.y<95||sp.y>370)sp.vy*=-1}}
}
function drawSheaf(g,x,y){
  g.fillStyle='#d8b855';
  g.beginPath();
  g.ellipse(x,y,7,4,0,0,7);
  g.fill();
  g.fillStyle='#edd274';
  g.fillRect(x-5,y-3,10,2);
  g.fillStyle='#9e523c';
  g.fillRect(x-1,y-4,2,7);
}
function drawDryingMat(g,x,y,covered,t){
  // Woven bamboo mat (nong tre phơi thóc)
  g.fillStyle='#23382940';
  g.beginPath();
  g.ellipse(x,y+2,19,10,0,0,7);
  g.fill();
  g.fillStyle='#9e8252';
  g.beginPath();
  g.ellipse(x,y,18,9,0,0,7);
  g.fill();
  if(covered){
    // Covered with straw tarp during rain/storm
    g.fillStyle='#8c7d57';
    g.beginPath();
    g.ellipse(x,y-1,16,7.5,0,0,7);
    g.fill();
    g.strokeStyle='#635639';
    g.lineWidth=1;
    g.beginPath();
    g.moveTo(x-12,y-1);
    g.lineTo(x+12,y-1);
    g.stroke();
  }else{
    // Golden drying paddy grain with sun shimmer
    g.fillStyle='#e2c15a';
    g.beginPath();
    g.ellipse(x,y,15,7,0,0,7);
    g.fill();
    g.fillStyle='#f7df88';
    for(let i=0;i<5;i++){
      const gx=x-9+i*4.5+Math.sin(t*2+i)*1,gy=y-2+(i%2)*3;
      g.fillRect(gx,gy,2,2);
    }
  }
}
function drawHaystack(g,x,y){
  g.fillStyle='#20362844';
  g.beginPath();
  g.ellipse(x,y+2,16,6,0,0,7);
  g.fill();
  g.fillStyle='#b8994c';
  g.beginPath();
  g.moveTo(x-15,y);
  g.quadraticCurveTo(x-12,y-24,x,y-28);
  g.quadraticCurveTo(x+12,y-24,x+15,y);
  g.closePath();
  g.fill();
  g.fillStyle='#d6b865';
  g.beginPath();
  g.moveTo(x-9,y-2);
  g.quadraticCurveTo(x-6,y-21,x,y-25);
  g.quadraticCurveTo(x+5,y-20,x+7,y-2);
  g.closePath();
  g.fill();
  g.fillStyle='#755c38';
  g.fillRect(x-1,y-33,2.5,7);
}
function farms(g,t,minutes,dayArg){
  const curDay=dayArg||(typeof Villagers!=='undefined'?Villagers.day:1);
  const mainStage=((Math.max(1,curDay)-1)%7)+1;
  const dayFrac=Math.max(0,Math.min(1,(minutes-360)/720));

  for(let fidx=0;fidx<EastVillage.fields.length;fidx++){
    const f=EastVillage.fields[fidx];
    // Main field follows 7-day cycle; secondary field is staggered by +2 days so multiple stages are visible
    const st=fidx===0?mainStage:((mainStage+1)%7)+1;

    // Outer grass-tufted earthen berm (bờ ruộng đắp đất & cỏ)
    g.fillStyle='#5c8236';
    g.fillRect(f.x-10,f.y-10,f.w+20,f.h+20);
    g.fillStyle='#9e7d4e';
    g.fillRect(f.x-7,f.y-7,f.w+14,f.h+14);
    g.fillStyle='#b89562';
    g.fillRect(f.x-5,f.y-5,f.w+10,f.h+10);
    g.fillStyle='#684f30';
    g.fillRect(f.x-2,f.y-2,f.w+4,f.h+4);

    // Paddy bed color changes by stage (flooded mud -> young green -> lush green -> golden ripe)
    const bedColors=['#5d513b','#4c6b63','#4e7350','#48704b','#557544','#756c3e','#73673f'];
    g.fillStyle=bedColors[st-1];
    g.fillRect(f.x,f.y,f.w,f.h);

    // Subtle organic soil & shallow water patches inside paddy
    g.fillStyle=st<=3?'#3b575255':'#3f4f3338';
    for(let py=f.y+6;py<f.y+f.h-12;py+=25){
      for(let px=f.x+10;px<f.x+f.w-28;px+=36){
        g.beginPath();
        g.ellipse(px+((py*7)%11),py+6,12,4,0,0,7);
        g.fill();
      }
    }

    // Water shimmer on flooded stages (Stages 1, 2, 3)
    if(st<=3){
      g.fillStyle='#a8dbd644';
      for(let wy=f.y+10;wy<f.y+f.h-10;wy+=25){
        for(let wx=f.x+16;wx<f.x+f.w-24;wx+=42){
          g.fillRect(wx+Math.sin(t*1.8+wy)*4,wy+4,12,1.5);
        }
      }
    }

    const totalRows=Math.ceil((f.h-24)/25);
    const harvested=st===7?Math.max(0.15,Math.min(1,(minutes-480)/450)):Math.max(0,Math.min(1,(minutes-840)/180));
    const sownFrac=st===2?Math.max(0.25,dayFrac):1;

    for(let row=0,y=f.y+14;y<f.y+f.h-10;y+=25,row++){
      // Soft earthen furrow ridge instead of flat grey-brown bars
      g.fillStyle='#786544';
      g.fillRect(f.x+3,y+11,f.w-6,4);
      g.fillStyle='#968057';
      g.fillRect(f.x+6,y+11,f.w-12,2);
      // Grass tufts along left/right paddy bunds
      g.fillStyle='#638c38';
      g.fillRect(f.x-6,y+8,4,4);
      g.fillRect(f.x+f.w+2,y+8,4,4);

      const rowRatio=row/Math.max(1,totalRows);

      for(let x=f.x+12;x<f.x+f.w-12;x+=18){
        const sway=Math.sin(t*2.2+x*.05+row)*2;
        if(st===1){
          // Stage 1: Tilled mud mounds & water furrows
          g.fillStyle='#6b593d';
          g.beginPath();
          g.ellipse(x,y+8,4.5,2,0,0,7);
          g.fill();
        }else if(st===2){
          // Stage 2: Sowing tender green seedlings (mạ non)
          if(rowRatio<=sownFrac){
            g.strokeStyle='#7ad455';
            g.lineWidth=1.6;
            g.beginPath();
            g.moveTo(x,y+9);
            g.lineTo(x+sway*.5,y+1);
            g.moveTo(x,y+9);
            g.lineTo(x-3+sway*.4,y+3);
            g.stroke();
          }
        }else if(st===3){
          // Stage 3: Tillering lush green clumps (đẻ nhánh)
          g.strokeStyle='#4ca33b';
          g.lineWidth=1.9;
          g.beginPath();
          g.moveTo(x,y+9);
          g.lineTo(x+sway,y-2);
          g.moveTo(x,y+8);
          g.lineTo(x-4+sway*.7,y);
          g.moveTo(x,y+8);
          g.lineTo(x+4+sway*.7,y);
          g.stroke();
        }else if(st===4){
          // Stage 4: Herbal pest control spraying (phun thuốc thảo mộc)
          g.strokeStyle='#429136';
          g.lineWidth=2;
          g.beginPath();
          g.moveTo(x,y+9);
          g.lineTo(x+sway,y-4);
          g.moveTo(x,y+8);
          g.lineTo(x-5+sway*.8,y-1);
          g.moveTo(x,y+8);
          g.lineTo(x+5+sway*.8,y-1);
          g.stroke();
          if((x+row)%3===0){
            g.fillStyle='#ccf5c666';
            g.fillRect(x+Math.sin(t*3+x)*3,y-5-Math.abs(Math.cos(t*2+row))*4,2.5,2.5);
          }
        }else if(st===5){
          // Stage 5: Heading & milk grain stage (lúa trỗ đòng)
          g.strokeStyle='#5d993e';
          g.lineWidth=2;
          g.beginPath();
          g.moveTo(x,y+9);
          g.lineTo(x+sway,y-5);
          g.moveTo(x,y+8);
          g.lineTo(x-4,y-1);
          g.moveTo(x,y+8);
          g.lineTo(x+5,y-2);
          g.stroke();
          g.fillStyle='#c9d868';
          g.fillRect(x+sway+1,y-6,3.5,3);
        }else if(st===6){
          // Stage 6: Golden ripe paddy (lúa chín vàng rực)
          g.strokeStyle='#c9ab42';
          g.lineWidth=2;
          g.beginPath();
          g.moveTo(x,y+9);
          g.lineTo(x+sway*1.2,y-5);
          g.moveTo(x,y+8);
          g.lineTo(x-4,y-1);
          g.moveTo(x,y+8);
          g.lineTo(x+6,y-2);
          g.stroke();
          g.fillStyle='#f0cf5b';
          g.fillRect(x+sway+2,y-6,4.5,3.5);
        }else{
          // Stage 7: Harvesting & golden sheaves
          const cut=rowRatio<harvested;
          g.strokeStyle=cut?'#bca45f':'#c9ab42';
          g.lineWidth=2;
          g.beginPath();
          g.moveTo(x,y+9);
          g.lineTo(x+sway,y+(cut?5:-4));
          if(!cut){
            g.moveTo(x,y+8);
            g.lineTo(x-4,y);
            g.moveTo(x,y+8);
            g.lineTo(x+6,y-2);
          }
          g.stroke();
          if(!cut){
            g.fillStyle='#ebca57';
            g.fillRect(x+3,y-4,4,3);
          }
        }
      }
      // Tied golden sheaves on field banks during harvest (Stage 7 or late afternoon)
      if((st===7||minutes>=810)&&row%2===0){
        drawSheaf(g,f.x+24+row*18,y+11);
      }
    }

    // Stage-specific bank props: woven bamboo seedling baskets (Stage 2) & herbal barrels (Stage 4)
    if(fidx===0){
      for(let k=0;k<3;k++){
        const bx=f.x-22,by=f.y+48+k*26;
        g.fillStyle='#24381c44';
        g.beginPath();
        g.ellipse(bx,by+2,9,5,0,0,7);
        g.fill();
        g.fillStyle='#8c683a';
        g.beginPath();
        g.ellipse(bx,by,8,6,0,0,7);
        g.fill();
        g.fillStyle='#b88e58';
        g.beginPath();
        g.ellipse(bx,by-1,6.5,4.5,0,0,7);
        g.fill();
        g.fillStyle=st<=2?'#6cc24a':'#55963c';
        g.beginPath();
        g.ellipse(bx,by-1.5,5,3.2,0,0,7);
        g.fill();
      }
      // Herbal medicine barrels on south bank (Dược bá's pest control brew)
      for(let k=0;k<2;k++){
        const bx=f.x+310+k*24,by=f.y+f.h+14;
        g.fillStyle='#785d3c';
        g.fillRect(bx-7,by-14,14,15);
        g.fillStyle='#82b889';
        g.beginPath();
        g.ellipse(bx,by-14,6,2.5,0,0,7);
        g.fill();
      }
    }

    // Stone-lined shallow irrigation channel matching map.webp stream palette
    g.fillStyle='#5c5f58';
    g.fillRect(f.x-10,f.y-10,f.w+18,9);
    g.fillRect(f.x-10,f.y-10,9,f.h+18);
    g.fillStyle='#3b7d9c';
    g.fillRect(f.x-8,f.y-8,f.w+14,6);
    g.fillRect(f.x-8,f.y-8,6,f.h+14);
    g.fillStyle='#85c1dc';
    for(let x=f.x;x<f.x+f.w;x+=24)g.fillRect(x+(t*7)%14,f.y-6,8,1.2);
    for(let y=f.y;y<f.y+f.h;y+=28)g.fillRect(f.x-6,y+(t*7)%14,1.2,7);
    // River pebbles along channel rim
    g.fillStyle='#8e9188';
    for(let x=f.x-4;x<f.x+f.w;x+=22){
      g.beginPath();
      g.ellipse(x,f.y-9,3.5,2,0,0,7);
      g.fill();
    }
    for(let y=f.y+4;y<f.y+f.h;y+=22){
      g.beginPath();
      g.ellipse(f.x-9,y,2,3.5,0,0,7);
      g.fill();
    }
    // Wooden plank footbridge across west irrigation ditch
    const brY=f.y+f.h/2-12;
    g.fillStyle='#6b4928';
    g.fillRect(f.x-13,brY,16,24);
    g.fillStyle='#b88954';
    for(let p=0;p<4;p++)g.fillRect(f.x-12,brY+1+p*6,14,4.5);
  }

  // Animated paddy sparrows (chim sẻ đồng lúa)
  if(typeof Weather==='undefined'||!Weather.storm){
    for(const sp of sparrows){
      const lift=sp.air>0?Math.sin(sp.air*5)*18+12:Math.abs(Math.sin(sp.phase))*2;
      g.save();
      g.translate(sp.x,sp.y-lift);
      g.fillStyle='#1f2e2438';
      g.beginPath();
      g.ellipse(0,lift,4,1.5,0,0,7);
      g.fill();
      g.fillStyle='#7a5c43';
      g.beginPath();
      g.ellipse(0,0,4.5,3,0,0,7);
      g.fill();
      g.fillStyle='#a68667';
      g.beginPath();
      g.ellipse(2,-2,2.5,2,0,0,7);
      g.fill();
      if(sp.air>0){
        const wing=Math.sin(t*28+sp.phase)*4;
        g.strokeStyle='#5e4531';
        g.lineWidth=1.5;
        g.beginPath();
        g.moveTo(-1,0);
        g.lineTo(-4,-3+wing);
        g.moveTo(1,0);
        g.lineTo(4,-3-wing);
        g.stroke();
      }
      g.restore();
    }
  }

  // Courtyard grain-drying bamboo mats (nong phơi thóc) & golden haystacks (cây rơm)
  const wet=typeof Weather!=='undefined'&&(Weather.kind==='rain'||Weather.kind==='storm');
  for(const [mx,my]of [[1685,838],[1945,838],[2762,835],[208,325]]){
    drawDryingMat(g,mx,my,wet,t);
  }
  drawHaystack(g,1622,820);
  drawHaystack(g,2702,812);

  // Village Granary (Kho thóc)
  g.fillStyle='#866b45';
  g.fillRect(2718,716,204,104);
  g.fillStyle='#bca479';
  g.fillRect(2726,728,188,82);
  g.fillStyle='#6c5741';
  for(let x=2730;x<2920;x+=17)g.fillRect(x,725,3,88);
  g.fillStyle='#7c725b';
  g.beginPath();
  g.moveTo(2704,721);
  g.lineTo(2820,646);
  g.lineTo(2936,721);
  g.closePath();
  g.fill();
  g.strokeStyle='#c2b280';
  g.lineWidth=3;
  g.stroke();
  g.fillStyle='#4c4234';
  g.fillRect(2790,752,50,68);
  const sackCount=Math.min(12,6+Math.floor((grain-36)/4));
  g.fillStyle='#d4bf7e';
  for(let i=0;i<sackCount;i++){
    const sx=i<6?2744+(i%3)*15:2855+((i-6)%3)*15;
    const sy=798-Math.floor((i%6)/3)*14;
    g.beginPath();
    g.ellipse(sx,sy,9,13,0,0,7);
    g.fill();
  }
}
function props(g,t){if(facade)g.drawImage(facade,0,0);const smith=Villagers.list.find(n=>n.id==='ho'),active=smith&&!smith.hidden&&smith.arrived&&smith.state==='work';
// Blacksmith stone furnace, chimney & timber workbench crafted to match map.webp pixel-art style (no flat gray box straddling y=1024)
g.fillStyle='#1f351e44';g.beginPath();g.ellipse(1028,1076,32,9,0,0,7);g.fill();g.beginPath();g.ellipse(1013,1156,26,7,0,0,7);g.fill();
// Stone chimney & arched masonry kiln
g.fillStyle='#59584f';g.beginPath();g.roundRect(1034,1006,14,34,3);g.fill();
g.fillStyle='#7c7b6f';g.fillRect(1036,1008,9,30);g.fillStyle='#45443c';g.fillRect(1033,1004,16,4);
g.fillStyle='#5c5a50';g.beginPath();g.roundRect(1003,1036,50,36,6);g.fill();
g.fillStyle='#858376';g.beginPath();g.roundRect(1005,1038,46,32,5);g.fill();
// Individual stone blocks on furnace body
for(const [bx,by,bw,bh,bc]of [[1007,1040,14,7,'#a19e8e'],[1023,1040,12,7,'#949182'],[1037,1040,11,7,'#a8a494'],[1007,1049,10,8,'#918e7f'],[1039,1049,10,8,'#9e9b8b'],[1006,1059,11,9,'#9c9989'],[1039,1059,11,9,'#8c897a']]){g.fillStyle=bc;g.fillRect(bx,by,bw,bh)}
// Arched hearth opening & glowing coal bed
g.fillStyle='#2b241f';g.beginPath();g.arc(1028,1058,12,Math.PI,0);g.lineTo(1040,1069);g.lineTo(1016,1069);g.closePath();g.fill();
g.fillStyle=active?'#a83c1e':'#59382a';g.beginPath();g.ellipse(1028,1066,10,3.5,0,0,7);g.fill();
// Blacksmith workbench & water quench barrel
g.fillStyle='#59422b';g.fillRect(997,1145,5,14);g.fillRect(1025,1145,5,14);
g.fillStyle='#8c6b45';g.beginPath();g.roundRect(992,1139,42,8,2);g.fill();
g.fillStyle='#bd9968';g.fillRect(994,1140,38,4);
g.fillStyle='#8e9696';g.fillRect(999,1136,18,3);g.fillStyle='#634932';g.fillRect(1017,1136,6,3);
// Quench barrel beside anvil
g.fillStyle='#6e5236';g.beginPath();g.roundRect(1038,1114,15,17,3);g.fill();
g.fillStyle='#497882';g.beginPath();g.ellipse(1045.5,1115,6,2.5,0,0,7);g.fill();
if(active){for(let i=0;i<5;i++){const h=9+Math.sin(t*9+i*2)*5;g.fillStyle=i%2?'#ffcf6f':'#ea7a32';g.beginPath();g.moveTo(1019+i*4,1067);g.lineTo(1021.5+i*4,1067-h);g.lineTo(1024+i*4,1067);g.fill()}if(Math.sin(t*3+smith.phase)>.7){g.fillStyle='#ffe295';for(let i=0;i<7;i++)g.fillRect(1006+Math.sin(i*4+t)*i*3,1118-i*3,2,2)}g.fillStyle='#bcbba555';for(let i=0;i<4;i++){g.beginPath();g.ellipse(1041+Math.sin(t+i)*4,1001-((t*12+i*9)%35),5+i,3+i,0,0,7);g.fill()}}
// Carpenter's workbench, hanging tools, and water buckets make professions legible.
g.fillStyle='#1f351e40';g.beginPath();g.ellipse(2730,952,36,8,0,0,7);g.fill();
g.fillStyle='#68523a';g.fillRect(2704,936,6,17);g.fillRect(2750,936,6,17);
g.fillStyle='#8a6b44';g.beginPath();g.roundRect(2697,924,66,14,3);g.fill();
g.fillStyle='#b89462';g.fillRect(2699,925,62,9);
g.fillStyle='#dec08e';g.fillRect(2709,920,34,5);g.fillStyle='#86938c';g.fillRect(2733,914,16,4);
}
function animal(g,b,t){
if(b.hidden)return;g.save();g.translate(b.x,b.y);g.scale(b.dir*(b===buffalo[1]?.91:1),b===buffalo[1]?.91:1);
const oval=(x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()};
const line=(pts,c,w)=>{g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();pts.forEach((v,i)=>i?g.lineTo(...v):g.moveTo(...v));g.stroke()};
oval(0,0,31,7,'#162c2845');
// Far legs, muscular barrel, shoulder and bent near legs.
for(let i=0;i<4;i++){const x=[-20,15,-13,22][i],step=b.walking?Math.sin(b.phase+(i%2)*Math.PI)*4:0;
if(i===2){oval(-2,-23,29,17,'#333d3c');oval(-5,-28,24,10,'#596563');oval(-12,-31,14,5,'#6e7970');oval(19,-24,12,15,'#424e4b');line([[-24,-20],[-17,-13],[9,-11]],'#293432',2)}
line([[x,-20],[x+step*.6,-10],[x+step,-2]],i<2?'#293331':'#49534f',6);line([[x+step-2,-1],[x+step+3,-1]],'#202a29',4)}
line([[-28,-26],[-34,-20],[-35+Math.sin(t*2.5)*5,-6]],'#36423d',2);oval(-35+Math.sin(t*2.5)*5,-5,2,4,'#202b29');
// The muzzle lowers to crop grass during pauses; ears twitch independently.
g.save();g.translate(24,-28);g.rotate(b.grazing?.35+Math.sin(t*3)*.025:Math.sin(t*.9)*.035);
oval(3,2,12,14,'#45524d');oval(8,8,9,10,'#536159');oval(12,14,10,5,'#737c69');oval(17,13,2,1.2,'#28332e');
for(const side of [-1,1]){g.save();g.translate(side<0?-5:8,-6);g.rotate(Math.sin(t*2+side)*.12);oval(side*6,1,7,3,'#3a4943');oval(side*6,1,4,1.3,'#a18d77');g.restore()}
g.strokeStyle='#303b35';g.lineWidth=6;g.beginPath();g.moveTo(-3,-7);g.bezierCurveTo(-14,-12,-18,-24,-11,-27);g.moveTo(8,-8);g.bezierCurveTo(19,-14,22,-25,17,-29);g.stroke();g.strokeStyle='#c0b998';g.lineWidth=3;g.stroke();
oval(9,0,2.3,2,'#202b27');oval(9.5,-.6,.7,.7,'#e4dbbc');line([[4,10],[18,8]],'#9e7551',1.2);line([[7,18],[16,18]],'#414c42',1);
if(b.grazing){line([[15,18],[22,13],[20,21]],'#7b9e42',1.2)}g.restore();g.restore()}
return{init,update,farms,props,animal,buffalo,sparrows,roofs,get grain(){return grain},get homeGrain(){return homeGrain}};
})();
