'use strict';
const Villagers=(()=>{
const defs=[
['tran','Lão Trần','Nông dân',[220,316],[274,733],'#8c784a','hat','Đất tốt, nước đủ thì mùa này sẽ được vụ.'],
['lien','A Liên','Trồng rau',[401,316],[1080,199],'#8a7794','bun','Rau vừa hái còn tươi, lát nữa ta mang ra chợ.'],
['ngu','Lão Ngư','Câu cá',[1148,429],[1325,413],'#627d8a','beard','Cá thích chỗ nước lặng. Chờ một chút nhé…'],
['son','Đại Sơn','Tiều phu',[354,1223],[555,1090],'#7b6651','short','Ta lấy củi ở bìa làng rồi mang tới lò rèn.'],
['ho','Thiết Hổ','Thợ rèn',[1175,1223],[1004,1096],'#716b7a','short','Nghe tiếng búa là biết lò rèn đang đỏ lửa!'],
['hong','Hồng Nương','Bán hàng',[955,769],[897,550],'#ad7372','bun','Mời ghé quầy! Hôm nay có rau và cá tươi.'],
['truong','Trưởng làng','Trông nom làng',[2480,330],[2490,370],'#727c60','beard','Làng nhỏ nhưng ai cũng có công việc của mình.'],
['an','Tiểu An','Chơi đùa',[250,565],[781,738],'#b89453','child','Bướm bay sang bên kia rồi! Ta đuổi theo đây!']];
defs.push(
['binh','Bác Bình','Trồng lúa',[1730,850],[1740,250],'#8d8050','hat','Lúa bén rễ rồi, chỉ cần giữ nước đều.'],
['dao','Cô Đào','Trồng lúa',[1730,850],[1930,280],'#b38079','bun','Đồng phía đông rộng, mùa này cả làng đủ gạo.'],
['phuc','A Phúc','Trồng rau',[1990,850],[2820,130],'#728851','hat','Rau vừa hái sẽ được mang ra chợ.'],
['lan','Tiểu Lan','Chăm hoa',[1990,850],[2290,735],'#a482a2','bun','Hoa thơm nhất lúc sương sớm còn đọng trên lá.'],
['mai','Cô Mai','Chăm hoa',[2130,1210],[2510,735],'#bb9275','bun','Mời ghé vườn hoa nghỉ chân.'],
['loc','Chú Lộc','Bán gạo',[2130,1210],[2260,1010],'#9b845b','short','Gạo mới từ đồng phía đông đây!'],
['thu','Cô Thu','Bán hoa',[2500,1210],[2490,1010],'#a16e7e','bun','Một bó hoa nhỏ cũng làm căn nhà ấm áp hơn.'],
['moc','Thợ Mộc','Sửa đồ gỗ',[2500,1210],[2730,975],'#7f715f','short','Ta đóng bàn ghế cho khu làng mới.'],
['khang','A Khang','Gánh nước',[2870,1210],[2065,650],'#708d91','short','Giếng này cấp nước cho cả xóm đông.'],
['tam','Bà Tâm','Trồng rau',[2900,420],[2900,150],'#859173','hat','Trồng rau cũng cần kiên nhẫn như chăm trẻ.'],
['minh','Tiểu Minh','Chơi đùa',[2870,1210],[2400,730],'#b69761','child','Vườn hoa có rất nhiều bướm!'],
['yen','A Yến','Giúp việc đình',[2900,420],[2570,360],'#8d7b9c','bun','Trưởng làng đang đón khách ở sân đình.']);
defs.push(
['tung','A Tùng','Chăn trâu',[1730,850],[1680,450],'#8f8365','child','Tiểu Phàm! Ra đồng chăn trâu cùng bọn ta nhé.'],
['cuc','Tiểu Cúc','Chăn trâu',[1990,850],[1770,450],'#b58d7a','child','Đừng để trâu giẫm lên lúa chín nhé!'],
['sen','Tiểu Sen','Chơi đùa',[2130,1210],[2400,730],'#a68c9e','child','Bọn ta đang chơi đuổi bắt, ngươi có tham gia không?'],
['duoc','Dược bá','Hái thuốc',[2900,420],[2510,735],'#718b79','beard','Lá thuốc cần hái lúc sương vừa tan.']);
const list=defs.map(([id,name,job,home,work,color,look,line],i)=>({id,name,job,home,work,color,look,line,x:home[0],y:home[1],walk:0,dir:1,route:[],state:'',hidden:false,phase:i*1.7,offset:i*3}));
let minutes=8*60,day=1,grid,east,south,cols=256,rows=111,step=12,nearest=null,lastHUD=-1,dialogUntil=0;
const hours=()=>minutes/60;
function gate(name,x,y,w,h,gap){const i=Collision.polygons.findIndex(p=>p.name===name);if(i>=0)Collision.polygons.splice(i,1);const rect=(xx,yy,ww,hh)=>Collision.polygons.push({name:name+' — hàng rào',points:[[xx,yy],[xx+ww,yy],[xx+ww,yy+hh],[xx,yy+hh]]});rect(x,y,w,6);rect(x,y,6,h);rect(x+w-6,y,6,h);rect(x,y+h-6,gap-x-15,6);rect(gap+15,y+h-6,x+w-gap-15,6)}
function xy(i){return [i%cols*step+6,Math.floor(i/cols)*step+6]}
function closest(point){let best=-1,dist=Infinity;for(let i=0;i<grid.length;i++)if(grid[i]){const [x,y]=xy(i),d=(x-point[0])**2+(y-point[1])**2;if(d<dist){dist=d;best=i}}return best}
function clear(a,b){const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));for(let i=0;i<=n;i++){const k=n?i/n:0;if(!Collision.canWalk(a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k))return false}return true}
function route(from,to){const start=closest(from),end=closest(to);if(start<0||end<0)return [];const prev=new Int32Array(grid.length).fill(-1),q=[start];prev[start]=start;for(let at=0;at<q.length&&prev[end]<0;at++){const cur=q[at],x=cur%cols,y=Math.floor(cur/cols);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||nx>=cols||ny<0||ny>=rows)continue;const n=ny*cols+nx;if(grid[n]&&prev[n]<0&&(dx===1?east[cur]:dx===-1?east[n]:dy===1?south[cur]:south[n])){prev[n]=cur;q.push(n)}}}if(prev[end]<0)return [];let path=[xy(end)],cur=end;while(cur!==start){cur=prev[cur];path.push(xy(cur))}path.reverse();if(clear(from,path[0]))path.unshift(from);let smooth=[];for(let i=0;i<path.length-1;){let j=Math.min(path.length-1,i+20);while(j>i+1&&!clear(path[i],path[j]))j--;smooth.push(path[j]);i=j}return smooth.length?smooth:[xy(end)]}
const CROP_STAGES=[
  {stage:1,short:'Làm đất',label:'Làm đất, dẫn nước ruộng',talk:'Đầu vụ phải cày bừa kỹ, dẫn nước đều thì đất mới tơi xốp.'},
  {stage:2,short:'Gieo mạ',label:'Gieo mạ non xuống ruộng',talk:'Hôm nay cả làng xuống đồng cấy từng khóm mạ non cho kịp thời vụ.'},
  {stage:3,short:'Đẻ nhánh',label:'Làm cỏ, chăm mạ đẻ nhánh',talk:'Mạ đã bén rễ xanh rì, phải sục bùn nhổ cỏ để lúa đẻ nhánh khỏe.'},
  {stage:4,short:'Phun thuốc',label:'Phun thuốc thảo mộc trừ sâu',talk:'Ta phun nước thuốc thảo mộc của Dược bá để trừ sâu rầy hại lúa.'},
  {stage:5,short:'Trỗ đòng',label:'Chăm lúa trỗ đòng, canh chim',talk:'Lúa đang trỗ đòng ngậm sữa thơm lừng, phải coi chừng đàn chim sẻ!'},
  {stage:6,short:'Lúa chín',label:'Thăm đồng lúa chín vàng',talk:'Cả cánh đồng đã ngả màu vàng óng, bông lúa uốn câu trĩu hạt rồi!'},
  {stage:7,short:'Gặt & phơi',label:'Gặt lúa mùa vàng',talk:'Ngày mùa rộn ràng! Gặt xong ta chở thóc về kho và mang về sân nhà phơi.'}
];
function cropStage(d=day){return CROP_STAGES[((Math.max(1,d)-1)%7)]}
function farmerMode(n,d=day){
  const st=((Math.max(1,d)-1)%7)+1;
  if(['binh','dao'].includes(n.id))return st===2?'sow':st===4?'spray':st>=6?'harvest':st===1?'till':'tend';
  if(n.id==='phuc')return st===4||st===1?'spray':st===2||st===5?'sow':'tend';
  if(n.id==='tran')return st===2?'sow':st===4?'spray':st===7?'harvest':'till';
  if(n.id==='tam')return st===4?'spray':st===2?'sow':'tend';
  return 'work';
}
function jobAt(n){
const weather=typeof Weather!=='undefined'?Weather.kind:'sun',wet=weather==='rain'||weather==='storm',hNow=minutes/60;
n.raincoat=wet&&weather!=='storm'&&['tran','binh','dao','phuc','tam'].includes(n.id)&&hNow>=7&&hNow<17;
if(wet&&!n.raincoat){
 if(n.weatherMode!==weather){n.weatherMode=weather;n.weatherTarget=null;
 const homeDist=Math.hypot(n.x-n.home[0],n.y-n.home[1]);
 if(!n.hidden&&typeof RainShelter!=='undefined'){
 const target=RainShelter.slot(list.indexOf(n)),d=Math.hypot(n.x-target[0],n.y-target[1]);
 if(d<homeDist&&route([n.x,n.y],target).length)n.weatherTarget=target;
 }}
 return n.weatherTarget?{key:'rainwait',target:n.weatherTarget,label:weather==='storm'?'Trú bão dưới mái đình':'Trú mưa dưới mái đình'}:{key:'rainhome',target:n.home,label:weather==='storm'?'Chạy về nhà trú bão':'Chạy về nhà trú mưa'};
}
n.weatherMode=null;n.weatherTarget=null;const h=(minutes-n.offset+1440)%1440/60,stage=cropStage(day);
if(n.look==='child'&&minutes>=420&&minutes<1050){if(minutes>=690&&minutes<780)return{key:'rest',target:n.home,label:'Về nhà ăn trưa'};const phase=Math.floor(minutes/10)%4;const herd=n.id==='tung'||n.id==='cuc';const points=herd?[[1670,445],[1750,450],[1810,440],[1720,455]]:[[2338,729],[2400,711],[2462,730],[2400,750]];const base=points[phase],offset=(n.id==='cuc'||n.id==='minh')?18:n.id==='sen'?-18:0;return{key:(herd?'herd':'play')+phase,target:[base[0]+offset,base[1]],label:herd?'Chăn trâu cùng bạn':'Chạy chơi cùng nhóm'}}
if(['binh','dao'].includes(n.id)&&h>=15.5&&h<17.75)return{key:'grain',target:[2800+(n.id==='dao'?40:0),850],label:'Chuyển thóc về kho'};
if(['binh','dao','phuc','tran'].includes(n.id)&&h>=17.75&&h<18.5)return{key:'homegrain',target:n.home,label:'Vận chuyển thóc về nhà'};
if(['binh','dao'].includes(n.id)&&h>=13&&h<15.5){const row=Math.floor((h-13)*3)%10,mode=farmerMode(n,day);const actLabel=mode==='sow'?'Gieo mạ theo luống':mode==='spray'?'Phun thuốc thảo mộc':stage.stage>=6?'Gặt lúa mùa vàng':'Chăm lúa & gặt thửa chín';return{key:'harvest',target:[n.id==='binh'?1740:1990,110+row*25],label:actLabel}}
if(n.home[0]>1536){if(h<6||h>=18.5)return{key:'home',target:n.home,label:'Về nhà'};if(h<7)return{key:'morning',target:[2400,570],label:'Dạo vườn hoa'};if(h>=11.5&&h<13)return{key:'rest',target:[2380+(n.offset%5)*15,875],label:'Nghỉ trưa'};if(h>=17)return{key:'market',target:[2330+(n.offset%4)*20,1040],label:'Ghé chợ đông'};if(n.id==='truong')return{key:'work',target:[2490,355],label:'Tiếp dân ở sân đình'};if(['binh','dao','phuc','tam'].includes(n.id))return{key:'work',target:n.work,label:stage.label};return{key:'work',target:n.work,label:n.job}}
if(h<6||h>=19)return{key:'home',target:n.home,label:'Về nhà'};if(h<7)return{key:'morning',target:[690+n.offset*2,630],label:'Dạo buổi sáng'};if(h>=11.5&&h<13)return{key:'rest',target:[600+(n.offset%3)*60+n.offset*2,1164],label:'Nghỉ trưa'};if(h>=17){if(h<18)return{key:'market',target:[995+n.offset,548+n.offset],label:'Ghé chợ'};return{key:'home',target:n.home,label:'Về nhà'}}if(n.id==='lien'&&h>=15)return{key:'sell',target:[970,558],label:'Bán rau'};if(n.id==='son'&&h>=15)return{key:'wood',target:[1040,1135],label:'Giao củi'};if(n.id==='ngu'&&h>=16)return{key:'fishmarket',target:[1005,584],label:'Mang cá ra chợ'};if(n.id==='truong'||n.id==='an'){const phase=Math.floor(minutes/24)%3;const stops=n.id==='an'?[[781,738],[797,580],[610,667]]:[[748,590],[1050,463],[710,1180]];return{key:'roam'+phase,target:stops[phase],label:n.id==='an'?'Chạy chơi':'Thăm dân làng'}}if(n.id==='tran')return{key:'work',target:n.work,label:stage.label};return{key:'work',target:n.work,label:n.job}}
function plan(n){if(n.id==='truong'&&typeof Quest1!=='undefined'&&Quest1.isChiefControlled&&Quest1.isChiefControlled())return;const job=jobAt(n);if(job.key===n.state&&(!job.key.startsWith('harvest')||Math.hypot((n.goalX||0)-job.target[0],(n.goalY||0)-job.target[1])<2))return;n.goalX=job.target[0];n.goalY=job.target[1];n.state=job.key;n.label=job.label;n.hidden=false;n.route=route([n.x,n.y],job.target);n.arrived=false;}
function init(){gate('Vườn rau tây nam',146,651,263,143,275);gate('Vườn rau bắc',997,139,167,116,1080);
// New work props share the collision system.
for(const [name,x,y,w,h]of [['Lò rèn',1009,1060,38,29],['Đe rèn',991,1117,34,15],['Gốc chặt củi',540,1115,30,20]])Collision.polygons.push({name,points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]});
function edgeClear(x1,y1,x2,y2){return Collision.canWalk((x1+x2)*.5,(y1+y2)*.5)&&Collision.canWalk(x1+(x2-x1)*.25,y1+(y2-y1)*.25)&&Collision.canWalk(x1+(x2-x1)*.75,y1+(y2-y1)*.75)}
grid=new Uint8Array(cols*rows);for(let i=0;i<grid.length;i++)grid[i]=Collision.canWalk(i%cols*step+6,Math.floor(i/cols)*step+6)?1:0;east=new Uint8Array(grid.length);south=new Uint8Array(grid.length);for(let i=0;i<grid.length;i++){if(!grid[i])continue;const x=i%cols*step+6,y=Math.floor(i/cols)*step+6;if(i%cols<cols-1&&grid[i+1])east[i]=edgeClear(x,y,x+step,y)?1:0;if(i+cols<grid.length&&grid[i+cols])south[i]=edgeClear(x,y,x,y+step)?1:0}for(const n of list){const p=xy(closest(n.home));n.x=p[0];n.y=p[1];n.home=p;n.work=xy(closest(n.work));plan(n)}
document.getElementById('skiptime').onclick=()=>{minutes+=120;if(minutes>=1440){minutes-=1440;day++}lastHUD=-1;for(const n of list)plan(n)};
const skipDayBtn=document.getElementById('skipday');if(skipDayBtn)skipDayBtn.onclick=()=>{day++;lastHUD=-1;for(const n of list)plan(n)};
document.getElementById('talk').onclick=talk;document.getElementById('close-dialog').onclick=()=>document.getElementById('dialog').hidden=true;document.getElementById('people').onclick=()=>{const d=document.getElementById('dialog'),st=cropStage(day);d.hidden=false;document.getElementById('dialog-title').textContent='Sinh hoạt dân làng · Mùa vụ ngày '+st.stage+'/7 ('+st.short+')';document.getElementById('dialog-body').textContent=list.map(n=>n.name+' — '+(n.hidden?'Đang ở nhà':n.route.length?'Đang đi · '+n.label:n.label)).join('\n')};addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'&&!e.repeat)talk()});}
function sleepToNextDay(){day++;minutes=360;lastHUD=-1;for(const n of list)plan(n);if(typeof Quest1!=='undefined'&&day>=3&&Quest1.getState&&Quest1.getState()!=='completed'&&Quest1.getState()!=='cinematic_active'){Quest1.state=Quest1.STATES.SELECTION_READY;}return day}
function talk(player){const pl=(player&&typeof player.x==='number'&&typeof player.hp!=='undefined')?player:(typeof p!=='undefined'?p:null);if(typeof TieuPhamHome!=='undefined'&&TieuPhamHome.inside){return TieuPhamHome.interact(pl)}if(typeof Quest1!=='undefined'&&pl&&Quest1.isNearChief(pl,56)){return Quest1.talk(pl)}if(typeof AHuy!=='undefined'&&pl&&AHuy.isNear(pl,52)){return AHuy.talk(pl)}if(!nearest||(nearest.pause>1.4&&nearest.spokenLine))return false;const d=document.getElementById('dialog'),st=cropStage(day);d.hidden=false;document.getElementById('dialog-title').textContent=nearest.name+' · '+nearest.job;const isFarmer=['tran','binh','dao','phuc','tam'].includes(nearest.id);const msg=nearest.state==='rest'?'Nghỉ chân một chút rồi ta lại làm tiếp.':nearest.state==='shelter'?'Bão tới rồi, mau tìm chỗ trú nhé!':nearest.state==='homegrain'?'Ta mang bao thóc mới thu hoạch về phơi ở sân nhà đây!':nearest.state==='grain'?'Thóc gặt xong phải chở ngay về kho làng kẻo sương xuống.':nearest.state==='home'?'Trời muộn rồi, ta về nhà đây.':isFarmer?st.talk+' (Mùa vụ ngày '+st.stage+'/7: '+st.short+')':nearest.line;document.getElementById('dialog-body').textContent=msg;nearest.spokenLine=msg;dialogUntil=3.2;nearest.pause=3.2;return true}
const FARM_SPOTS={
  binh:[[1650,125],[1740,125],[1830,125],[1830,175],[1740,175],[1650,175],[1650,225],[1740,225],[1830,225],[1830,275],[1740,275],[1650,275],[1650,325],[1740,325],[1830,325],[1740,250]],
  dao:[[1930,125],[2035,125],[2140,125],[2140,175],[2035,175],[1930,175],[1930,225],[2035,225],[2140,225],[2140,275],[2035,275],[1930,275],[1930,325],[2035,325],[2140,325],[1930,280]],
  tran:[[205,695],[274,695],[345,695],[345,733],[274,733],[205,733],[205,764],[274,764],[345,764],[274,733]],
  lien:[[1032,174],[1080,174],[1126,174],[1126,199],[1080,199],[1032,199],[1032,224],[1080,224],[1126,224],[1080,199]],
  phuc:[[2755,96],[2805,96],[2850,96],[2850,130],[2805,130],[2755,130],[2755,162],[2805,162],[2850,162],[2820,130]],
  tam:[[2875,96],[2915,96],[2952,96],[2952,130],[2915,130],[2875,130],[2875,160],[2915,160],[2945,160],[2900,150]]
};
const ANGLER_SPOTS=[[1326,414],[1332,398],[1318,424],[1330,406]];
function update(dt,t,player){minutes+=dt*2;if(minutes>=1440){minutes-=1440;day++}nearest=null;let nearDist=58;dialogUntil=Math.max(0,dialogUntil-dt);for(const n of list){if(n.id==='truong'&&typeof Quest1!=='undefined'&&Quest1.isChiefControlled&&Quest1.isChiefControlled())continue;plan(n);n.pause=(n.state==='rainhome'||n.state==='rainwait')?0:Math.max(0,(n.pause||0)-dt);n.walk=0;if(!n.hidden&&n.route.length&&!n.pause){let budget=(n.state==='rainhome'||n.state==='rainwait'?112:n.look==='child'?84:48)*dt;while(budget>0&&n.route.length){const [tx,ty]=n.route[0],dx=tx-n.x,dy=ty-n.y,len=Math.hypot(dx,dy),amount=Math.min(len,budget);if(len<.1){n.route.shift();continue}const nx=n.x+dx/len*amount,ny=n.y+dy/len*amount;if(!Collision.canWalk(nx,ny)){const p=xy(closest([n.x,n.y]));n.x=p[0];n.y=p[1];n.route=route(p,jobAt(n).target);break}n.x=nx;n.y=ny;budget-=amount;n.walk=t*(n.state==='rainhome'||n.state==='rainwait'?14:n.look==='child'?12:8);if(Math.abs(dx)>.5)n.dir=dx<0?-1:1;if(amount===len)n.route.shift()}}
if(!n.route.length){
  n.arrived=true;
  if(n.state==='home'||n.state==='shelter'||n.state==='rainhome')n.hidden=true;
  else if(!n.pause&&(n.state==='work'||n.state==='harvest')){
    const spots=FARM_SPOTS[n.id];
    if(spots){
      if(n.farmIdx===undefined){n.farmIdx=0;n.farmWait=1.2+(n.phase%1.5)}
      const base=n.state==='harvest'?[n.goalX||n.work[0],n.goalY||n.work[1]]:spots[n.farmIdx%spots.length];
      const sweep=n.state==='harvest'?((n.farmIdx%3)-1)*42:0;
      const tx=base[0]+sweep,ty=base[1],dx=tx-n.x,dy=ty-n.y,d=Math.hypot(dx,dy);
      if(d>1.5){
        const stepLen=Math.min(d,24*dt),nx=n.x+dx/d*stepLen,ny=n.y+dy/d*stepLen;
        if(Collision.canWalk(nx,ny)){
          n.x=nx;n.y=ny;n.walk=t*6.5;
          if(Math.abs(dx)>.2)n.dir=dx<0?-1:1;
        }else{n.farmIdx=(n.farmIdx+1)%spots.length;n.farmWait=1.4}
      }else{
        n.farmWait=(n.farmWait||0)-dt;
        n.dir=Math.sin(t*1.2+n.phase)>=0?1:-1;
        if(n.farmWait<=0){n.farmIdx=(n.farmIdx+1)%spots.length;n.farmWait=2.2+(n.farmIdx%3)*.85}
      }
    }else if(n.id==='ngu'){
      const fPhase=(t+n.phase)%9.5;
      if(n.fishIdx===undefined){n.fishIdx=0;n.fishWait=16}
      n.fishWait-=dt;
      if(n.fishWait<=0&&fPhase<3.2){n.fishIdx=(n.fishIdx+1)%ANGLER_SPOTS.length;n.fishWait=18+(n.fishIdx%2)*6}
      const [tx,ty]=ANGLER_SPOTS[n.fishIdx],dx=tx-n.x,dy=ty-n.y,d=Math.hypot(dx,dy);
      if(d>1&&fPhase<3.5){
        const stepLen=Math.min(d,16*dt),nx=n.x+dx/d*stepLen,ny=n.y+dy/d*stepLen;
        if(Collision.canWalk(nx,ny)){n.x=nx;n.y=ny;n.walk=t*5}
      }
      n.dir=1;
    }
  }
}if(!n.hidden){const dist=Math.hypot(n.x-player.x,n.y-player.y);if(dist<nearDist){nearDist=dist;nearest=n}}}
const minute=Math.floor(minutes);if(lastHUD!==minute){lastHUD=minute;const st=cropStage(day);document.getElementById('clock').textContent='Ngày '+day+' (Vụ '+st.stage+'/7: '+st.short+') · '+String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0')+(typeof Weather!=='undefined'?' · '+Weather.period(minutes):'')}
if(typeof TieuPhamHome==='undefined'||!TieuPhamHome.inside){const nearChief=typeof Quest1!=='undefined'&&player&&Quest1.isNearChief(player,56);const nearAHuy=typeof AHuy!=='undefined'&&player&&AHuy.isNear(player,52);const targetName=nearChief?'Trưởng làng':nearAHuy?AHuy.name:(nearest?nearest.name:null);const talkButton=document.getElementById('talk');if(talkButton){talkButton.hidden=!targetName;if(targetName)talkButton.textContent='Trò chuyện · '+targetName}const punchLbl=document.getElementById('punch-label');if(punchLbl){if(nearChief){punchLbl.textContent='TRÒ CHUYỆN'}else if(nearAHuy){punchLbl.textContent=(player&&player.attackCooldown>0)?player.attackCooldown.toFixed(1)+'s':'ĐẤM A HUY'}else{punchLbl.textContent=(nearest&&!(nearest.pause>1.4&&nearest.spokenLine))?'TRÒ CHUYỆN':(player&&player.attackCooldown>0)?player.attackCooldown.toFixed(1)+'s':'ĐẤM'}}}
}
function props(g,t){
// Open gates at the farm entrances allow both villagers and player to enter.
for(const [x,y]of [[275,791],[1080,252]]){g.fillStyle='#afa65d';g.fillRect(x-15,y-6,30,17);g.strokeStyle='#6e5838';g.lineWidth=3;g.beginPath();g.moveTo(x-17,y+4);g.lineTo(x-27,y+18);g.stroke()}
// Woodcutter chopping block & blacksmith anvil with ground shadows
g.fillStyle='#1f351e40';g.beginPath();g.ellipse(555,1127,18,7,0,0,7);g.fill();g.beginPath();g.ellipse(1008,1135,18,6,0,0,7);g.fill();
g.fillStyle='#76523a';g.beginPath();g.ellipse(555,1125,15,10,0,0,7);g.fill();g.fillStyle='#b48b58';g.beginPath();g.ellipse(555,1118,15,6,0,0,7);g.fill();
g.fillStyle='#4a5152';g.fillRect(1000,1120,16,16);g.beginPath();g.moveTo(989,1116);g.lineTo(1026,1116);g.lineTo(1020,1125);g.lineTo(998,1125);g.fill();g.fillStyle='#788284';g.fillRect(992,1116,30,3);
}
function shadeColor(hex,delta){
  const v=parseInt(hex.slice(1),16);
  const clamp=x=>Math.max(0,Math.min(255,Math.round(x)));
  const r=clamp((v>>16)+delta),g=clamp(((v>>8)&255)+delta),b=clamp((v&255)+delta);
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
function draw(g,n,t){
  if(n.hidden)return;
  const s=n.look==='child'?.76:1,moving=n.walk>0,step=moving?Math.sin(n.walk)*3.2:0,working=(n.state==='work'||n.state==='harvest')&&n.arrived&&!n.route.length;
  const isFarmer=['tran','binh','dao','phuc','tam','lien'].includes(n.id);
  const fMode=['tran','binh','dao','phuc','tam'].includes(n.id)?farmerMode(n,day):'work';
  const fishCycle=(t+n.phase)%9.5,fishBite=working&&n.id==='ngu'&&fishCycle>=4.6&&fishCycle<6.1,fishPull=working&&n.id==='ngu'&&fishCycle>=6.1&&fishCycle<8.1;
  const farmStoop=working&&isFarmer&&!moving?(fMode==='sow'||fMode==='harvest'?1.8+Math.sin(t*5.5+n.phase)*1.6:Math.max(0,Math.sin(t*4.2+n.phase))*1.8):0;
  const flutter=Math.sin(t*2.8+n.phase+(n.walk||0)*.5)*(moving?2.4:.9);
  const ink='#23201b',cloth=n.color,light=shadeColor(cloth,26),shade=shadeColor(cloth,-24),dark=shadeColor(cloth,-44);
  const isFemale=n.look==='bun'||['tam','cuc','sen'].includes(n.id);
  const isElder=n.look==='beard'||n.id==='tam';
  const skin=isFemale?'#ebbda0':n.look==='child'?'#e6b68d':'#dca97e';
  const skinHi=shadeColor(skin,20),skinShade=shadeColor(skin,-24);
  const hair=isElder?'#676a67':'#26221e',hairHi=isElder?'#9ea19c':'#4d443b';
  const sash=isFemale?'#8c4a47':n.id==='truong'?'#9c8246':'#4b595c';
  const sashHi=shadeColor(sash,26);

  const poly=(pts,fill,stroke=ink,w=1)=>{
    g.beginPath();
    pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
    g.closePath();
    g.fillStyle=fill;
    g.fill();
    if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke()}
  };
  const line=(pts,color,w=1)=>{
    g.beginPath();
    pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
    g.strokeStyle=color;
    g.lineWidth=w;
    g.stroke();
  };
  const rect=(color,x,y,w,h)=>{g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),w,h)};
  const oval=(x,y,rx,ry,c)=>{g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=c;g.fill()};

  g.save();
  g.translate(Math.round(n.x),Math.round(n.y));
  g.fillStyle='#17352950';
  g.beginPath();
  g.ellipse(0,-1,12*s,4.2*s,0,0,Math.PI*2);
  g.fill();
  g.scale(n.dir*s,s);
  const bob=(moving?Math.abs(Math.sin(n.walk))*1.5:Math.sin(t*2+n.phase)*.45)+(n.look==='child'&&n.state.startsWith('play')?Math.abs(Math.sin(t*4+n.phase))*3.5:0)-farmStoop+(fishPull?Math.sin((fishCycle-6.1)*5)*1.5:0);
  g.translate(0,-bob);

  // 1. Far arm (layered behind torso)
  const armSwing=n.look==='child'&&n.state.startsWith('play')?Math.sin(t*5+n.phase)*.85:fishPull?-.82+Math.sin(t*12)*.12:fishBite?.22+Math.sin(t*18)*.08:working&&isFarmer?Math.sin(t*5.2+n.phase)*.78:working?Math.sin(t*3+n.phase)*.58:moving?Math.sin(n.walk)*.32:Math.sin(t*1.6+n.phase)*.05;
  g.save();
  g.translate(3,-44);
  g.rotate(-armSwing*.75);
  poly([[-2,0],[2.5,0],[4,10],[2.5,15],[-2,14],[-3,6]],shade);
  poly([[-2,11.5],[3,11.5],[2.5,14.5],[-2,14]],sash);
  poly([[-1,14.5],[2.2,14.5],[2.8,18],[0.5,19.5],[-1.5,18]],skin);
  g.restore();

  // Backpacks / carried loads on back (grain sack / herbal spray tank / firewood / water bucket)
  if(n.state==='grain'||n.state==='homegrain'){
    poly([[-14,-43],[-2,-43],[0,-16],[-13,-16]],'#bfa46f');
    poly([[-12,-41],[-4,-41],[-3,-18],[-11,-18]],'#d8c18e',null);
    line([[-13.5,-30],[-0.5,-30]],'#7c653e',2);
    poly([[-10,-46],[-5,-46],[-4,-43],[-11,-43]],'#dec992');
  }else if(working&&fMode==='spray'){
    // Wooden/bamboo herbal sprayer tank on back
    poly([[-13,-44],[-4,-44],[-4,-23],[-13,-23]],'#7c9473');
    poly([[-11.5,-42],[-6,-42],[-6,-25],[-11.5,-25]],'#9ab38f',null);
    line([[-13,-37],[-4,-37]],'#5c4a35',1.8);
    line([[-13,-29],[-4,-29]],'#5c4a35',1.8);
    rect('#d1b56b',-10,-47,4,3);
  }
  if(n.state==='wood'){
    for(let i=0;i<3;i++){
      poly([[-15,-39+i*6],[1,-39+i*6],[1,-34+i*6],[-15,-34+i*6]],'#75563b');
      oval(1,-36.5+i*6,2,2.5,'#c4a56c');
    }
    line([[-8,-40],[-6,-21]],'#4a3928',1.5);
  }
  if(working&&n.id==='khang'){
    poly([[-18,-15],[-7,-15],[-8,-2],[-17,-2]],'#876f4d');
    oval(-12.5,-15,5.5,2,'#9ec8cc');
    line([[-17,-15],[-12.5,-23],[-8,-15]],'#6b5639',1.5);
  }

  // 2. Legs, calf wraps & shoes
  for(const [lx,st]of [[-3,-step*.85],[2,step*.85]]){
    g.save();
    g.translate(lx,-6+st);
    poly([[-3.5,-11],[3.5,-11],[3.5,-4],[-3.5,-4]],'#343b3a');
    poly([[-3,-4],[3,-4],[3,0],[-3,0]],'#c9bc9a');
    line([[-2.5,-2],[2.5,-2]],'#96896b');
    poly([[-3.5,0],[3.5,0],[5.5,2],[5.5,4.2],[-4,4.2],[-4,1]],'#524131');
    line([[-3.5,3.6],[5,3.6]],'#cab78d',1.4);
    g.restore();
  }

  // 3. Lower tunic / skirt / elder robe
  if(isFemale){
    // Long pleated village skirt & apron
    poly([[-7.5,-32],[6.5,-32],[9.5+step*.12,-9],[-10-flutter*.3,-9],[-8.5,-22]],dark);
    poly([[-6.5,-31],[1,-31],[1,-10],[-8.5-flutter*.25,-10]],cloth,null);
    poly([[0.5,-31],[6,-31],[8.2+step*.1,-11],[1,-10.5]],shade,null);
    // Front apron
    poly([[-1,-31],[5.5,-31],[6.5,-13],[-1.5,-13]],'#e3dac1');
    line([[-0.5,-15],[5.8,-15]],sash);
  }else if(n.look==='beard'){
    // Elder long robe
    poly([[-7.5,-33],[6.5,-33],[8.5+step*.15,-9],[-9.5-flutter*.3,-9],[-8.5,-22]],dark);
    poly([[-6,-32],[1,-32],[0,-10],[-8-flutter*.25,-10]],cloth,null);
    poly([[1,-32],[5.8,-32],[7.5+step*.12,-10],[0.5,-10]],shade,null);
    line([[-8-flutter*.25,-11],[7.2+step*.12,-11]],'#d5c79e',1.3);
  }else{
    // Work tunic split hem
    poly([[-7,-32],[6,-32],[7+step*.18,-13],[2+step*.2,-11],[-1,-18],[-4-step*.2,-11],[-8.5-flutter*.3,-13],[-7.5,-23]],dark);
    poly([[-6,-31],[0,-31],[-1,-17],[-4-step*.15,-12],[-7.5-flutter*.25,-14]],cloth,null);
    poly([[0,-31],[5.5,-31],[6.2+step*.15,-14],[2+step*.15,-12],[-0.5,-18]],shade,null);
    line([[-7-flutter*.25,-14],[0,-18],[5.8+step*.15,-14]],light);
  }

  // 4. Upper torso, collar & sash
  poly([[-6.5,-46],[1,-48],[6,-45],[7.5,-37],[6,-29],[-6,-29],[-7.5,-37]],cloth);
  poly([[-5.5,-44],[0,-45],[2,-37],[0,-30],[-5,-31]],light,null);
  poly([[3.5,-43],[6.5,-37],[5,-30],[2,-31]],shade,null);
  // Smith leather apron for Thiết Hổ
  if(n.id==='ho'){
    poly([[-2,-44],[5.5,-43],[6.5,-14],[-2.5,-14]],'#594333');
    line([[-1,-42],[4.5,-41],[5,-16]],'#7d604a');
  }
  // Crossed collar
  poly([[0,-48],[4.5,-48],[6,-44],[2.5,-38],[-1,-42]],'#ebe1c5');
  poly([[4.8,-44],[6.5,-41],[2,-33],[-0.5,-35]],dark);
  // Waist sash & pouch
  poly([[-6.5,-32],[6.5,-32],[6.5,-27.5],[-6.5,-27.5]],sash);
  line([[-6,-30],[6,-30]],sashHi);
  poly([[-4.5,-27.5],[0,-27.5],[1,-20.5],[-2,-19],[-5.5,-21.5]],'#8f7049');
  line([[-3.5,-26],[-1,-25.5],[-1,-21]],'#bca074');
  // Seedling hip basket when sowing
  if(working&&fMode==='sow'){
    poly([[-8,-27],[2,-27],[1,-18],[-7,-18]],'#a98b55');
    poly([[-7,-31],[1,-31],[2,-26],[-8,-26]],'#62a84b');
  }

  // 5. Head, face & hairstyle/hat
  g.save();
  g.translate(0.5,-48);
  // Neck
  poly([[-2.5,0],[2.5,-1],[3,4.5],[-3,3.5]],skin);
  // Sculpted three-quarter face
  poly([[-6,-16],[1,-18],[6.2,-16],[8,-11.5],[7.2,-7],[9,-4.8],[7.2,-3.2],[7,0],[3.2,3.2],[-0.5,3.5],[-5,1],[-7,-5.5]],skin);
  poly([[-2,-14],[4.8,-14.5],[6.2,-10.5],[5.8,-6],[7.2,-4.8],[5.8,0],[2,1.8],[-2,-1]],skinHi,null);
  poly([[-6,-10.5],[-3,-8.5],[-3,-1],[0,2.8],[-4,1],[-6,-3.5]],skinShade,null);
  if(isFemale||n.look==='child')oval(3.2,-2.8,1.8,1.1,'#dc8d76');
  // Eyebrow & blinking eye
  line([[1.8,-9.5],[5.8,-9.5]],isElder?'#949690':'#382e26',1.3);
  const blink=(t+n.phase)%5.6>5.42;
  if(blink){
    line([[2.8,-7.2],[5.6,-7.2]],'#241f1b',1.4);
  }else{
    rect('#241f1b',3.2,-8.2,2.2,2.4);
    rect('#f7f0dc',4.2,-8.2,1,1);
  }
  // Mouth / smile
  line([[4.2,-1],[6.5,-1.2]],'#9c614c',1.1);
  // Hair cap & side lock
  poly([[-8,-11.5],[-7,-18],[-2.5,-21],[3,-21],[7.2,-18],[8.5,-13],[5.2,-12],[2.8,-15],[0,-13],[-2.5,-14],[-3.5,-6.5],[-7,-2.5]],hair);
  line([[-6,-16.5],[-2,-19],[2,-19],[5.2,-16.5]],hairHi);
  poly([[-7,-10.5],[-4.2,-9.5],[-3.5,-1.5],[-5.2,1.5],[-8,-2.5]],hair);
  oval(-2.5,-5.5,1.8,2.6,skin);

  if(n.look==='bun'){
    // Graceful back bun + ribbon & flower/jade pin
    poly([[-9,-13],[-12,-17],[-10,-22],[-5,-21],[-5,-14]],hair);
    line([[-10,-19],[-7,-19]],hairHi);
    poly([[-6,-19],[-4,-20],[-4,-13],[-6,-13]],'#c96b63');
    oval(-5.5,-17,2,2,'#f2c5be');
    line([[-8,-21],[-2,-15]],'#d9c17e',1.3);
  }else if(n.look==='beard'){
    // Elder topknot + long flowing silver beard
    poly([[-5,-20],[-6,-25],[-2.5,-27.5],[1.5,-27.5],[3.5,-24],[2,-20]],hair);
    poly([[-4.5,-20],[2.5,-20],[2,-18],[-4,-18]],n.id==='truong'?'#b5964c':'#5e6e66');
    poly([[1,-2.5],[7.5,-2.5],[9,4],[6,12],[2,14],[-1,7]],'#dedbd0');
    line([[3,0],[5,9]],'#b5b2a6');
    line([[5,-1],[7,7]],'#ffffff');
  }else if(n.look==='hat'){
    // Woven conical bamboo hat (nón lá)
    line([[-2,-13],[1,-1],[4,-1]],'#826846',1);
    poly([[-16,-12],[0.5,-26],[17,-12]],'#cdb476','#5e4f33',1.2);
    poly([[0.5,-26],[17,-12],[5,-12]],'#b59b5d',null);
    line([[0.5,-25],[-9,-12.5]],'#e3ce96',1);
    line([[0.5,-25],[8,-12.5]],'#8f7947',1);
    line([[-15,-12],[16,-12]],'#78643e',1.5);
  }else if(n.look==='child'){
    if(isFemale){
      // Twin side buns with red ribbons
      poly([[-6,-19],[-8,-24],[-4,-26],[-1,-23],[-2,-19]],hair);
      poly([[1,-19],[0,-24],[4,-25],[6,-22],[4,-18]],hair);
      rect('#c95649',-5,-20,4,2);
      rect('#c95649',1,-19,4,2);
    }else{
      // Youthful tuft topknot with red tie
      poly([[-4,-20],[-5,-25],[-1,-27],[2.5,-26],[3,-20]],hair);
      rect('#c44d3f',-4,-20,6,2.2);
    }
  }else{
    // 'short': workman's tied headband & topknot
    poly([[-4.5,-20],[-5,-24.5],[-1.5,-26.5],[2,-25.5],[2.5,-20]],hair);
    poly([[-7.5,-15],[8,-14],[7.5,-11.5],[-8,-12.5]],sash);
    poly([[-9,-13],[-13-flutter*.4,-10],[-11-flutter*.4,-7],[-7.5,-11.5]],sash);
  }
  g.restore();

  // 6. Near arm & role tools / carried market baskets
  g.save();
  g.translate(-1.5,-44);
  g.rotate(armSwing);
  poly([[-3,-2],[3,-2.5],[4.8,3],[4.2,10.5],[2.5,15.5],[-2.8,14.5],[-4,5.5]],cloth);
  poly([[-2,0],[0.5,-1],[1.5,5],[1,10.5],[-1.8,11]],light,null);
  poly([[-2.8,11.5],[3.2,12],[2.8,15.5],[-2.8,15]],sash);
  poly([[-1.8,15.5],[2,15.5],[2.8,19.5],[1,21],[-1.8,20],[-2.2,18]],skin);

  if(working&&(['tran','son','ho','binh','dao','phuc','tam','moc'].includes(n.id))){
    const strike=Math.sin(t*5.2+n.phase);
    if(fMode==='sow'){
      // Bundle of bright green rice seedlings in hand + plunging seedling into mud
      poly([[0,16],[8,14],[11,23],[2,25]],'#6cc250');
      line([[1,19],[7,18]],'#c7ad6b',2);
      if(strike>.2){
        line([[9,22],[14,31]],'#7ad455',1.8);
        oval(14,32,3.5,1.3,'#88c9beaa');
      }
      for(let i=0;i<3;i++)oval(10+i*4,28+Math.sin(t*4+i)*2,3+i,1.2,'#9ad1c988');
    }else if(fMode==='spray'){
      // Bamboo herbal spray wand & mist fan
      line([[-3,14],[18,22]],'#877246',2.5);
      rect('#d1b56b',17,20,4,4);
      for(let i=0;i<6;i++){
        const dist=6+((t*24+i*5)%18),ang=-.35+(i-2.5)*.16;
        oval(20+Math.cos(ang)*dist,22+Math.sin(ang)*dist,2.2,1.6,i%2?'#b8ebd0aa':'#dcf5b5aa');
      }
    }else if(fMode==='harvest'){
      // Curved steel sickle (liềm gặt lúa) & golden sheaf + flying chaff on cut
      line([[1,17],[9,22]],'#705235',2.5);
      line([[9,22],[16,20],[19,14],[14,11]],'#cfd9d6',2.2);
      poly([[8,23],[18,21],[19,27],[9,28]],'#e3c35b');
      if(strike>.35){
        for(let i=0;i<3;i++)rect('#f2d66b',15+i*3,24-i*3,2,1.5);
      }
    }else{
      // Hoe / axe / blacksmith hammer with soil clods or sparks on impact
      g.strokeStyle='#705235';
      g.lineWidth=2.6;
      g.beginPath();
      g.moveTo(1,17);
      g.lineTo(19,31);
      g.stroke();
      poly([[15,26],[15+(n.id==='tran'?13:10),26],[14+(n.id==='tran'?13:10),32],[14,32]],'#758580');
      if(n.id==='ho'&&Math.sin(t*3+n.phase)>.7){
        for(let i=0;i<4;i++)rect('#f5d567',18+i*3,28-i*4,2.2,2.2);
      }else if(isFarmer&&strike>.45){
        for(let i=0;i<3;i++)oval(18+i*3,31-(strike-.45)*8-i*2,2,1.4,i%2?'#7c6340':'#9ab86c');
      }
    }
  }
  if(working&&['lien','lan','mai'].includes(n.id)){
    poly([[1,14],[13,14],[14,24],[0,24]],'#6e8d8a');
    line([[13,18],[19,15]],'#6e8d8a',2.5);
    g.strokeStyle='#9ed0d4';
    g.lineWidth=1.1;
    for(let i=0;i<4;i++){
      g.beginPath();
      g.moveTo(18,16);
      g.lineTo(26+i*3,29+(t*18+i*4)%10);
      g.stroke();
    }
  }
  g.restore();

  // Foreground props attached to hands/waist
  if(working&&n.id==='ngu'){
    // Woven bamboo fish creel (giỏ đựng cá bên bờ)
    oval(-14,-2,7,3,'#1a302644');
    poly([[-19,-12],[-9,-12],[-10,-2],[-18,-2]],'#9c7d4c');
    line([[-18,-7],[-10,-7]],'#6e5531',1.2);
    oval(-14,-12,4.5,1.8,'#54432a');
    // Animated bamboo fishing rod: casts out, quivers on bite, jerks high when pulling fish!
    const pullP=fishPull?Math.min(1,(fishCycle-6.1)/1.5):0;
    const biteShake=fishBite?Math.sin(t*26)*2.5:0;
    const tipX=fishPull?24-Math.sin(pullP*Math.PI)*10:42+biteShake*.6;
    const tipY=fishPull?-72-Math.sin(pullP*Math.PI)*8:-56+Math.sin(t*1.2)*2+biteShake;
    g.strokeStyle='#755c3b';
    g.lineWidth=2.3;
    g.beginPath();
    g.moveTo(7,-24);
    g.quadraticCurveTo(22,fishPull?-56:-44,tipX,tipY);
    g.stroke();
    // Bamboo nodes on rod
    g.strokeStyle='#a88958';
    g.lineWidth=1.2;
    g.beginPath();
    g.moveTo(16,-33);
    g.lineTo(18,-35);
    g.stroke();
    const bobX=66+Math.sin(n.phase)*3;
    const bobY=6+(fishBite?Math.abs(Math.sin(t*18))*4.5:Math.sin(t*2.6)*1.4);
    if(fishPull){
      // Taut line + silver fish arcing out of water toward Lão Ngư's creel
      const fx=(1-pullP)*bobX+pullP*(-12);
      const fy=(1-pullP)*bobY+pullP*(-14)-Math.sin(pullP*Math.PI)*46;
      g.strokeStyle='#e8e2c5';
      g.lineWidth=1.1;
      g.beginPath();
      g.moveTo(tipX,tipY);
      g.lineTo(fx,fy);
      g.stroke();
      // Splash rings at water surface when yanking fish up
      if(pullP<.55){
        const r=4+pullP*22;
        g.strokeStyle='#d6f5f0aa';
        g.lineWidth=1.2;
        g.beginPath();
        g.ellipse(bobX,7,r,r*.38,0,0,Math.PI*2);
        g.stroke();
        for(let k=0;k<4;k++){
          oval(bobX+(k-1.5)*6*pullP,4-Math.sin(pullP*Math.PI)*14-k*2,1.5,2.2,'#d8f7f2cc');
        }
      }
      // Wiggling silver river fish in mid-air
      g.save();
      g.translate(fx,fy);
      g.rotate(-.5+pullP*1.4+Math.sin(t*32)*.28);
      oval(0,0,6.5,2.8,'#8fb5be');
      oval(0,-.6,5,1.6,'#d8eef2');
      poly([[-5.5,0],[-9.5,-3],[-8.5,0],[-9.5,3]],'#6d949e',null);
      rect('#24383b',3.5,-.8,1.3,1.3);
      g.restore();
    }else{
      // Fishing line & red-white bobber on river surface
      g.strokeStyle='#e3ddb8';
      g.lineWidth=1;
      g.beginPath();
      g.moveTo(tipX,tipY);
      g.quadraticCurveTo((tipX+bobX)*.5,fishBite?-8:-18,bobX,bobY);
      g.stroke();
      if(fishBite){
        for(let k=1;k<=2;k++){
          const r=((t*18+k*5)%14)+3;
          g.strokeStyle='#cdeee999';
          g.lineWidth=1;
          g.beginPath();
          g.ellipse(bobX,bobY+1,r,r*.36,0,0,Math.PI*2);
          g.stroke();
        }
      }
      oval(bobX,bobY+1,3.5,1.2,'#265b6e88');
      rect('#e8dfc8',bobX-1.5,bobY-3,3,2.5);
      rect('#d95338',bobX-1.5,bobY-.5,3,2.5);
    }
  }
  if((working&&['loc','thu','duoc'].includes(n.id))||n.state==='sell'||n.state==='fishmarket'){
    poly([[5,-22],[21,-22],[19,-11],[7,-11]],'#a68953');
    line([[6,-17],[20,-17]],'#786036');
    const cargo=n.id==='thu'?'#e6a8bf':n.id==='duoc'?'#759650':n.state==='fishmarket'?'#8eb2b8':n.state==='sell'?'#728d46':'#dec57c';
    poly([[7,-26],[19,-26],[20,-21],[6,-21]],cargo);
  }
  if(n.state.startsWith('herd')){
    g.strokeStyle='#8c7449';
    g.lineWidth=2;
    g.beginPath();
    g.moveTo(9,-24);
    g.lineTo(23,-1);
    g.stroke();
  }

  g.restore();
  if(typeof RainShelter!=='undefined')RainShelter.coat(g,n,t);
  g.textAlign='center';
  g.font='bold 10px system-ui';
  g.fillStyle='#172d23cc';
  const label=n.name;
  const w=g.measureText(label).width+12;
  g.fillRect(n.x-w/2,n.y-82*s,w,15);
  g.fillStyle='#eee0ae';
  g.fillText(label,n.x,n.y-71*s);
  if(n.pause>0&&n.spokenLine){
    g.font='italic 9.5px Georgia, serif';
    const text=n.spokenLine.length>46?n.spokenLine.slice(0,45)+'…':n.spokenLine;
    const bw=g.measureText(text).width+16;
    g.fillStyle='#13281fe8';
    g.fillRect(n.x-bw/2,n.y-102*s,bw,17);
    g.strokeStyle='#d6c384aa';
    g.lineWidth=1;
    g.strokeRect(n.x-bw/2,n.y-102*s,bw,17);
    g.fillStyle='#f7e9bc';
    g.fillText(text,n.x,n.y-90*s);
  }
}
function lighting(g){const h=hours();let darkness=h<5||h>=20?.42:h<7?.42*(7-h)/2:h>=18?.42*(h-18)/2:0;if(darkness>0){g.fillStyle='rgba(13,25,50,'+darkness+')';g.fillRect(0,0,1536,1331);for(const n of list)if(n.hidden){const [x,y]=n.home;const glow=g.createRadialGradient(x,y-35,1,x,y-35,43);glow.addColorStop(0,'rgba(255,204,109,.45)');glow.addColorStop(1,'rgba(255,204,109,0)');g.fillStyle=glow;g.fillRect(x-45,y-80,90,90);g.fillStyle='#e8bd75';g.fillRect(x-5,y-38,10,18)}}}
return{list,init,update,draw,props,lighting,route,jobAt,cropStage,farmerMode,talk,sleepToNextDay,get nearest(){return nearest},get day(){return day},set day(v){day=v},get minutes(){return minutes},set minutes(v){minutes=v}};
})();
