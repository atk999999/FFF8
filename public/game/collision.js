'use strict';
// Open terrain is walkable by default. Only mapped visible objects block feet.
const Collision=(()=>{
const polygons=[];const circles=[];const segments=[];
const add=(name,points)=>polygons.push({name,points});
const rect=(name,x,y,w,h)=>add(name,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]);
add('Nhà dân tây bắc',[[138,222],[219,158],[298,218],[293,292],[151,294]]);
add('Nhà dân bắc',[[327,222],[403,156],[480,218],[472,295],[334,294]]);
add('Nhà trưởng làng',[[613,143],[770,29],[911,139],[904,179],[887,179],[887,238],[640,238],[639,179],[617,179]]);
add('Nhà dân tây',[[160,467],[252,399],[329,458],[325,488],[317,489],[316,544],[177,543],[176,490],[160,494]]);
add('Nhà dân ven suối',[[1068,330],[1148,267],[1222,326],[1223,355],[1208,356],[1207,408],[1085,407],[1084,358],[1068,359]]);
add('Nhà dân nam',[[873,671],[960,605],[1036,664],[1033,694],[1022,697],[1022,746],[892,746],[892,698],[876,699]]);
add('Nhà dân đông nam',[[1064,668],[1149,605],[1230,664],[1229,693],[1215,695],[1215,746],[1079,746],[1078,697],[1066,698]]);
add('Quầy hàng',[[825,427],[877,424],[922,418],[965,443],[968,457],[956,457],[957,524],[843,526],[841,464],[828,465]]);
rect('Vườn rau tây nam',146,651,263,143);rect('Vườn rau bắc',997,139,167,116);
// Tree crowns and trunks use individual shapes, not invisible corridor limits.
for(const [x,y,rx,ry]of [[230,79,51,62],[528,102,48,38],[568,302,58,43],[934,341,57,45],[1286,314,55,43],[454,680,59,42],[500,862,67,48],[367,921,57,45],[899,889,59,44],[1158,955,48,48],[1397,914,53,54],[344,442,42,44],[1178,591,32,25],[1295,712,39,36],[74,525,52,39],[36,668,51,45],[50,239,47,39],[953,65,44,37]])circles.push({name:'Cây',x,y,rx,ry});
for(const [x,y,w,h]of [[222,121,14,22],[522,126,16,18],[559,329,19,20],[925,370,21,19],[1275,344,22,20],[441,704,22,22],[491,895,20,22],[358,954,19,20],[886,925,26,17],[1148,985,22,22],[1386,956,20,22]])rect('Thân cây',x,y,w,h);
// Solid props visible at ground level.
for(const [x,y,rx,ry]of [[573,751,24,13],[622,335,16,9],[151,381,24,14],[305,137,21,14],[1218,822,22,13],[1230,557,12,8],[973,271,13,8],[592,969,24,15],[823,970,27,14],[127,727,21,25],[1232,746,15,17],[1202,757,13,10],[850,743,12,12],[874,736,13,16],[340,529,13,18],[366,537,12,12],[319,298,12,13],[175,299,12,11],[838,515,13,15],[960,515,14,14],[1066,405,13,12],[1054,387,12,11],[1236,386,12,12],[1260,403,12,12]])circles.push({name:'Vật dụng / đá',x,y,rx,ry});
for(const [a,b]of [[[116,558],[174,558]],[[1026,404],[1081,404]],[[1198,417],[1270,417]],[[438,940],[592,924]],[[787,926],[952,940]],[[601,836],[602,942]],[[777,837],[777,942]],[[1256,479],[1417,479]],[[1256,544],[1417,544]]])segments.push({a,b,r:3});
const river=[[1360,0],[1313,47],[1271,87],[1220,126],[1204,178],[1213,216],[1260,241],[1314,270],[1346,306],[1368,346],[1354,399],[1321,435],[1292,462],[1275,541],[1277,590],[1302,633],[1342,677],[1358,724],[1341,775],[1302,813],[1260,848],[1240,902],[1357,891],[1410,834],[1450,784],[1431,728],[1392,681],[1394,658],[1431,637],[1419,601],[1392,572],[1396,540],[1417,462],[1454,435],[1494,401],[1501,347],[1461,303],[1410,265],[1362,226],[1342,195],[1356,146],[1393,106],[1403,55],[1447,0]];
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
function distance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],v=dx*dx+dy*dy,t=v?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/v)):0;return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy)}
let cacheKey='',polyGrid,circGrid,segGrid;
const BSIZE=64,BCOLS=48,BROWS=21;
function rebuildBuckets(){
  cacheKey=polygons.length+':'+circles.length+':'+segments.length;
  polyGrid=Array.from({length:BCOLS*BROWS},()=>[]);
  circGrid=Array.from({length:BCOLS*BROWS},()=>[]);
  segGrid=Array.from({length:BCOLS*BROWS},()=>[]);
  for(let i=0;i<polygons.length;i++){
    const o=polygons[i],pts=o.points;
    let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
    for(let k=0;k<pts.length;k++){const px=pts[k][0],py=pts[k][1];if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py}
    o.minX=x0;o.maxX=x1;o.minY=y0;o.maxY=y1;
    const c0=Math.max(0,x0>>6),c1=Math.min(BCOLS-1,x1>>6),r0=Math.max(0,y0>>6),r1=Math.min(BROWS-1,y1>>6);
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)polyGrid[r*BCOLS+c].push(o);
  }
  for(let i=0;i<circles.length;i++){
    const o=circles[i],x0=o.x-o.rx,x1=o.x+o.rx,y0=o.y-o.ry,y1=o.y+o.ry;
    o.invRx2=1/(o.rx*o.rx);o.invRy2=1/(o.ry*o.ry);
    const c0=Math.max(0,x0>>6),c1=Math.min(BCOLS-1,x1>>6),r0=Math.max(0,y0>>6),r1=Math.min(BROWS-1,y1>>6);
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)circGrid[r*BCOLS+c].push(o);
  }
  for(let i=0;i<segments.length;i++){
    const o=segments[i],a=o.a,b=o.b,rad=o.r;
    const x0=Math.min(a[0],b[0])-rad,x1=Math.max(a[0],b[0])+rad,y0=Math.min(a[1],b[1])-rad,y1=Math.max(a[1],b[1])+rad;
    o.minX=x0;o.maxX=x1;o.minY=y0;o.maxY=y1;
    const c0=Math.max(0,x0>>6),c1=Math.min(BCOLS-1,x1>>6),r0=Math.max(0,y0>>6),r1=Math.min(BROWS-1,y1>>6);
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++)segGrid[r*BCOLS+c].push(o);
  }
}
function pointBlocked(x,y){
  if(x<8||y<8||x>3064||y>1323)return true;
  const onBridge=x>=1257&&x<=1420&&y>=490&&y<=534;
  if(!onBridge&&x>=1204&&x<=1501&&y>=0&&y<=902&&inside(x,y,river))return true;
  if(cacheKey!==polygons.length+':'+circles.length+':'+segments.length)rebuildBuckets();
  const cell=(y>>6)*BCOLS+(x>>6);
  const pg=polyGrid[cell];
  if(pg)for(let i=0;i<pg.length;i++){
    const o=pg[i];
    if(x>=o.minX&&x<=o.maxX&&y>=o.minY&&y<=o.maxY&&inside(x,y,o.points))return true;
  }
  const cg=circGrid[cell];
  if(cg)for(let i=0;i<cg.length;i++){
    const o=cg[i],dx=x-o.x,dy=y-o.y;
    if(dx*dx*o.invRx2+dy*dy*o.invRy2<1)return true;
  }
  const sg=segGrid[cell];
  if(sg)for(let i=0;i<sg.length;i++){
    const o=sg[i];
    if(x>=o.minX&&x<=o.maxX&&y>=o.minY&&y<=o.maxY&&distance(x,y,o.a,o.b)<o.r)return true;
  }
  return false;
}
function canWalk(x,y){return !(pointBlocked(x,y)||pointBlocked(x+4,y)||pointBlocked(x-4,y)||pointBlocked(x,y+4)||pointBlocked(x,y-4))}
return{canWalk,pointBlocked,polygons,circles,segments,river};})();
