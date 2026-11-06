'use strict';
const VillageExpansion=(()=>{
const width=1536,height=1331,oldHeight=1024,topY=oldHeight-140;
const houses=[{x:258,y:1064},{x:1080,y:1064}];
const trees=[{x:100,y:1140},{x:470,y:1175},{x:930,y:1175},{x:1400,y:1135},{x:80,y:1280},{x:220,y:1300},{x:1320,y:1100},{x:1460,y:1080}];
let layer;
function houseOutline(x,y){return [[x+5,y+68],[x+97,y],[x+174,y+59],[x+170,y+89],[x+162,y+90],[x+161,y+145],[x+22,y+144],[x+21,y+91],[x+5,y+95]]}
function path(g,points){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath()}
function drawCleanTree(g,bg,x,y,s=1){
  if(typeof EastVillage!=='undefined'&&EastVillage.drawTreeSprite){
    EastVillage.drawTreeSprite(g,bg,x,y,s);
    return;
  }
  g.save();g.translate(x,y);g.scale(s,s);
  g.fillStyle='#1f381c55';g.beginPath();g.ellipse(0,-2,44,15,0,0,Math.PI*2);g.fill();
  g.beginPath();
  g.moveTo(-26,10);g.quadraticCurveTo(-32,-8,-28,-24);g.quadraticCurveTo(-58,-26,-59,-56);
  g.quadraticCurveTo(-60,-90,-34,-102);g.quadraticCurveTo(0,-112,34,-102);
  g.quadraticCurveTo(60,-90,59,-56);g.quadraticCurveTo(58,-26,28,-24);
  g.quadraticCurveTo(32,-8,26,10);g.quadraticCurveTo(0,15,-26,10);g.closePath();
  g.clip();g.drawImage(bg,874,276,120,124,-60,-108,120,124);g.restore();
}
function init(bg){
  layer=document.createElement('canvas');
  layer.width=width;
  layer.height=height-topY;
  const g=layer.getContext('2d');
  g.imageSmoothingEnabled=false;
  g.translate(0,-topY);

  const grassPat=TerrainTexture.pattern(g,'grass');
  const dirtPat=TerrainTexture.pattern(g,'dirt');
  g.fillStyle=grassPat;
  g.fillRect(0,oldHeight,width,height-oldHeight);

  let seed=813;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};

  // 1. Feather grass across y=1004..1026 over truncated dark tree-top slivers at the bottom edge of map.webp
  // (Leaving the main road x=615..785 and stream x=1340..1460 untouched)
  for(let x=0;x<width;x+=3){
    if((x>=615&&x<=785)||(x>=1340&&x<=1460))continue;
    const isSliver=(x>=295&&x<=405)||(x>=870&&x<=960)||(x>=1165&&x<=1265);
    const reach=(isSliver?22:6)+Math.round(Math.sin(x*.06)*3+Math.cos(x*.13)*2);
    g.fillStyle=grassPat;
    g.fillRect(x,oldHeight-reach,4,reach+6);
  }

  // 2. Natural stream pool termination at x=1350..1448, y=1016..1050 so the river doesn't end in a flat horizontal cut
  g.fillStyle='#5a635c';
  g.beginPath();g.ellipse(1400,1030,54,24,0,0,Math.PI*2);g.fill();
  g.fillStyle='#2b76a8';
  g.beginPath();g.ellipse(1400,1027,46,19,0,0,Math.PI*2);g.fill();
  g.fillStyle='#4999c7';
  g.beginPath();g.ellipse(1400,1025,38,14,0,0,Math.PI*2);g.fill();
  g.fillStyle='#9adcf0';
  g.fillRect(1382,1024,16,2);g.fillRect(1404,1029,14,2);
  // Riverbank stones around the southern stream pool
  for(const [sx,sy,rx,ry,col]of [[1352,1028,9,6,'#7a7e76'],[1366,1040,10,6,'#8d9188'],[1386,1045,11,6,'#757972'],[1410,1045,10,6,'#8e9289'],[1432,1040,10,6,'#7a7e76'],[1446,1028,9,6,'#8d9188']]){
    g.fillStyle='#3d423d';g.beginPath();g.ellipse(sx,sy+1,rx+1.5,ry+1.5,0,0,Math.PI*2);g.fill();
    g.fillStyle=col;g.beginPath();g.ellipse(sx,sy,rx,ry,0,0,Math.PI*2);g.fill();
  }

  // 3. Organic multi-tone meadow patches & grass tufts matching map.webp
  for(let i=0;i<180;i++){
    const gx=rand()*width,gy=oldHeight+rand()*307;
    g.fillStyle=i%3===0?'#59843555':i%3===1?'#7da64644':'#486e2b44';
    g.beginPath();g.ellipse(gx,gy,14+rand()*24,8+rand()*12,0,0,Math.PI*2);g.fill();
  }
  for(let i=0;i<2400;i++){
    const x=rand()*width,y=oldHeight+rand()*307;
    g.fillStyle=['#4e7830','#68943c','#86b04b','#9ec45a'][i%4];
    g.fillRect(x,y,2,2);
    if(i%5===0)g.fillRect(x+2,y-2,2,2);
  }

  // 4. Natural winding dirt roads, courtyard aprons & blacksmith dirt yard (each ellipse in its own beginPath!)
  const roadSegs=[
    [[701,1012],[704,1095],[708,1190],[710,1331],72],
    [[345,1225],[530,1223],[710,1225],[995,1224],[1260,1226],[1536,1225],38],
    [[348,1192],[348,1225],34],
    [[1170,1192],[1170,1225],34],
    [[1014,1072],[1014,1155],[1015,1224],40],
    [[740,1186],[998,1142],30]
  ];
  const yards=[
    [710,1192,112,62],
    [1018,1106,62,50],
    [348,1198,40,18],
    [1170,1198,40,18]
  ];
  const paintRoads=(pad,col)=>{
    g.strokeStyle=col;
    g.fillStyle=col;
    g.lineCap='round';
    g.lineJoin='round';
    for(const pts of roadSegs){
      const w=pts[pts.length-1];
      g.lineWidth=w+pad*2;
      g.beginPath();
      for(let i=0;i<pts.length-1;i++)i?g.lineTo(pts[i][0],pts[i][1]):g.moveTo(pts[i][0],pts[i][1]);
      g.stroke();
    }
    for(const [cx,cy,rx,ry]of yards){
      g.beginPath();
      g.ellipse(cx,cy,rx+pad,ry+pad*.75,0,0,Math.PI*2);
      g.fill();
    }
  };
  paintRoads(5,'#7a8f4288');
  paintRoads(2,'#c8a36a99');
  paintRoads(0,dirtPat);
  // Seamless dirt blend over the top road join at (701,1012) so round lineCaps don't leave a curved border line across the road
  g.strokeStyle=dirtPat;g.lineWidth=72;g.lineCap='butt';
  g.beginPath();g.moveTo(700,998);g.lineTo(704,1095);g.stroke();

  // Irregular pixel-art grass & pebble nibbling along road edges
  for(const pts of roadSegs){
    const half=pts[pts.length-1]*.5;
    for(let k=0;k<pts.length-2;k++){
      const [x1,y1]=pts[k],[x2,y2]=pts[k+1],len=Math.hypot(x2-x1,y2-y1),nx=-(y2-y1)/len,ny=(x2-x1)/len;
      for(let d=rand()*5;d<len;d+=3+rand()*6){
        const x=x1+(x2-x1)*d/len,y=y1+(y2-y1)*d/len;
        for(const side of [-1,1]){
          const jitter=(rand()-.45)*6;
          const ex=x+nx*side*(half+jitter),ey=y+ny*side*(half+jitter);
          g.fillStyle=rand()>.35?(rand()>.5?'#68943c':'#7da646'):'#cfa972';
          g.fillRect(ex-2,ey-1,2+rand()*3,2+rand()*2);
        }
      }
    }
  }
  // Feather the oval edges of the southern plaza & blacksmith yard
  for(const [cx,cy,rx,ry,cnt]of [[710,1192,112,62,95],[1018,1106,62,50,65]]){
    for(let i=0;i<cnt;i++){
      const a=(i/cnt)*Math.PI*2+rand()*.08,dr=(rand()-.45)*7;
      const ex=cx+Math.cos(a)*(rx+dr),ey=cy+Math.sin(a)*(ry+dr*.7);
      g.fillStyle=i%3===0?'#cfa972':i%2?'#68943c':'#86b04b';
      g.fillRect(ex-2,ey-2,3+rand()*2,2+rand()*2);
    }
  }
  // Cobblestone & flagstone paving under the blacksmith forge & southern meeting plaza
  for(let i=0;i<26;i++){
    const a=rand()*Math.PI*2,r=Math.sqrt(rand());
    const sx=1016+Math.cos(a)*46*r,sy=1100+Math.sin(a)*36*r;
    g.fillStyle=i%2?'#a6a291':'#8e8c7c';
    g.beginPath();g.ellipse(sx,sy,5+rand()*3,3+rand()*1.5,0,0,Math.PI*2);g.fill();
    g.fillStyle='#c4c0af';g.fillRect(sx-2,sy-1,3,1.5);
  }

  // 5. Complete the half-cropped border trees & bamboo along y=1024 of map.webp (drawn before southern houses so roofs overlap naturally)
  if(typeof EastVillage!=='undefined'){
    for(const [bx,by,cnt]of [[205,1030,5],[982,1022,5],[1275,1028,5]])EastVillage.drawBambooCluster?.(g,bx,by,cnt);
  }
  for(const [tx,ty,ts]of [[68,1032,.96],[145,1038,.94],[1128,1018,.96],[1368,1045,.92],[1478,1028,.98]]){
    drawCleanTree(g,bg,tx,ty,ts);
  }

  for(const h of houses){
    g.fillStyle='#1f361d44';g.beginPath();g.ellipse(h.x+90,h.y+146,82,12,0,0,Math.PI*2);g.fill();
    g.save();path(g,houseOutline(h.x,h.y));g.clip();g.drawImage(bg,155,399,180,151,h.x,h.y,180,151);g.restore();
  }
  // Decorative bamboo groves, mossy rocks & wildflower bushes matching map.webp (non-blocking)
  if(typeof EastVillage!=='undefined'){
    for(const [bx,by,cnt]of [[42,1085,4],[445,1095,4],[1255,1090,5],[1485,1190,4]])EastVillage.drawBambooCluster?.(g,bx,by,cnt);
    for(const [rx,ry,rs]of [[215,1185,.9],[535,1148,.85],[885,1148,.9],[1062,1152,.8],[1270,1180,.9]])EastVillage.drawRock?.(g,rx,ry,rs);
    for(const [ux,uy,us,fl]of [[195,1115,.95,true],[355,1022,.95,true],[452,1122,.9,true],[915,1024,.95,false],[958,1080,.85,false],[1285,1135,1,true],[615,1275,.9,true],[815,1275,.9,true]])EastVillage.drawBush?.(g,ux,uy,us,fl);
  }
  for(const tree of trees){
    drawCleanTree(g,bg,tree.x,tree.y,1);
  }
  // Low stone seats around the southern meeting ground.
  for(const [x,y]of [[574,1123],[802,1123]]){g.fillStyle='#485d50';g.fillRect(x+5,y+10,8,14);g.fillRect(x+47,y+10,8,14);g.fillStyle='#a6aa8a';g.fillRect(x,y,60,12);g.fillStyle='#c1c1a1';g.fillRect(x+2,y,56,3);g.fillStyle='#727d69';g.fillRect(x,y+10,60,4)}
  for(let i=0;i<28;i++){const x=595+(i%10)*24+(rand()-.5)*6,y=1176+Math.floor(i/10)*18+(rand()-.5)*5;g.fillStyle=i%2?'#b7b39b':'#a4a68e';g.beginPath();g.ellipse(x,y,7+rand()*2,4.5+rand(),0,0,7);g.fill();g.fillStyle='#cfccb8';g.fillRect(x-2,y-1,3,1.5)}
  // Flowers leave all paths unobstructed.
  for(const [x,y]of [[215,1210],[960,1065],[850,1290],[545,1280],[1275,1165]])for(let i=0;i<12;i++){let xx=x+rand()*35,yy=y+rand()*22;g.fillStyle='#527539';g.fillRect(xx,yy,2,6);g.fillStyle=i%2?'#e8dca2':'#d6acc0';g.fillRect(xx-2,yy-2,5,3)}
  for(const h of houses)Collision.polygons.push({name:'Nhà khu nam',points:houseOutline(h.x,h.y)});
  for(const t of trees)Collision.circles.push({name:'Cây khu nam',x:t.x,y:t.y-45,rx:52,ry:40});
  for(const [x,y]of [[574,1123],[802,1123]])Collision.polygons.push({name:'Ghế đá',points:[[x,y],[x+60,y],[x+60,y+24],[x,y+24]]});
}
function draw(g){if(layer)g.drawImage(layer,0,topY)}
return{width,height,init,draw};})();
