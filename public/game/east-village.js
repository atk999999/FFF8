'use strict';
const EastVillage=(()=>{
const houses=[{x:1640,y:680},{x:1900,y:680},{x:2040,y:1040},{x:2410,y:1040},{x:2780,y:1040},{x:2810,y:250}];
const fields=[{x:1600,y:80,w:640,h:310},{x:2720,y:60,w:275,h:130}];
const trees=[[1585,80],[2290,60],[3010,100],[3020,680],[3000,950],[1575,1070],[2250,1060],[1570,1320],[2340,1320],[3010,1320],[2130,680],[2690,60],[2745,420],[1620,650]];
const beds=[[2220,620,155,82],[2425,620,155,82],[2220,752,155,82],[2425,752,155,82]];
houses.forEach((h,i)=>{h.w=[166,190,178,202,164,184][i];h.h=[141,155,151,158,143,149][i]});
let layer,seamLayer;
const rect=(name,x,y,w,h)=>Collision.polygons.push({name,points:[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]});

function makeSeamlessPattern(g,bg,sx,sy,sw=32,sh=32){
  const c=document.createElement('canvas');
  c.width=sw*2;c.height=sh*2;
  const cg=c.getContext('2d');
  cg.imageSmoothingEnabled=false;
  for(const [ox,oy,fx,fy]of [[0,0,1,1],[sw,0,-1,1],[0,sh,1,-1],[sw,sh,-1,-1]]){
    cg.save();
    cg.translate(ox+(fx<0?sw:0),oy+(fy<0?sh:0));
    cg.scale(fx,fy);
    cg.drawImage(bg,sx,sy,sw,sh,0,0,sw,sh);
    cg.restore();
  }
  return g.createPattern(c,'repeat');
}

function drawTreeSprite(g,bg,x,y,s=1){
  const drawY=Math.max(Math.round(106*s),y);
  g.save();
  g.translate(x,drawY);
  g.scale(s,s);
  // Soft ground shadow matching map.webp
  g.fillStyle='#1f381c55';
  g.beginPath();
  g.ellipse(0,-2,44,15,0,0,Math.PI*2);
  g.fill();
  // Single smooth non-intersecting contour around the standalone tree at (874,276,120,124) in map.webp
  g.beginPath();
  g.moveTo(-26,10);
  g.quadraticCurveTo(-32,-8,-28,-24);
  g.quadraticCurveTo(-58,-26,-59,-56);
  g.quadraticCurveTo(-60,-90,-34,-102);
  g.quadraticCurveTo(0,-112,34,-102);
  g.quadraticCurveTo(60,-90,59,-56);
  g.quadraticCurveTo(58,-26,28,-24);
  g.quadraticCurveTo(32,-8,26,10);
  g.quadraticCurveTo(0,15,-26,10);
  g.closePath();
  g.clip();
  g.drawImage(bg,874,276,120,124,-60,-108,120,124);
  g.restore();
  // Small grass tufts around roots to ground the trunk into the meadow
  g.fillStyle='#4b752c';
  for(const dx of [-12,-4,5,11]){
    g.fillRect(x+dx*s,drawY+2*s,3*s,3*s);
  }
}

function drawBush(g,x,y,scale=1,flowers=false){
  g.save();
  g.translate(x,y);
  g.scale(scale,scale);
  g.fillStyle='#1f381c45';
  g.beginPath();
  g.ellipse(0,3,18,6,0,0,Math.PI*2);
  g.fill();
  for(const [bx,by,rx,ry,col]of [
    [0,-6,17,11,'#294a22'],
    [-9,-5,11,8,'#3b662c'],
    [9,-5,11,8,'#3b662c'],
    [0,-8,13,9,'#548537'],
    [-5,-10,7,5,'#78a646'],
    [5,-9,6,4,'#78a646'],
    [0,-12,6,4,'#93bd56']
  ]){
    g.fillStyle=col;
    g.beginPath();
    g.ellipse(bx,by,rx,ry,0,0,Math.PI*2);
    g.fill();
  }
  if(flowers){
    for(const [fx,fy,fc]of [[-7,-8,'#f7f2dc'],[4,-11,'#f7f2dc'],[8,-5,'#f5d97e'],[-2,-4,'#f5d97e']]){
      g.fillStyle=fc;
      g.fillRect(fx-1.5,fy-1.5,3,3);
    }
  }
  g.restore();
}

function drawRock(g,x,y,s=1){
  g.save();
  g.translate(x,y);
  g.scale(s,s);
  g.fillStyle='#22382044';
  g.beginPath();
  g.ellipse(0,3,15,6,0,0,Math.PI*2);
  g.fill();
  g.fillStyle='#4a4d46';
  g.beginPath();
  g.moveTo(-14,2);
  g.lineTo(-12,-8);
  g.lineTo(-3,-13);
  g.lineTo(9,-11);
  g.lineTo(14,-3);
  g.lineTo(12,3);
  g.closePath();
  g.fill();
  g.fillStyle='#7c8075';
  g.beginPath();
  g.moveTo(-11,0);
  g.lineTo(-9,-7);
  g.lineTo(-2,-11);
  g.lineTo(8,-9);
  g.lineTo(11,-2);
  g.lineTo(8,2);
  g.closePath();
  g.fill();
  g.fillStyle='#a3a69b';
  g.fillRect(-5,-9,8,4);
  g.restore();
}

function drawBambooCluster(g,x,y,count=5){
  g.save();
  g.translate(x,y);
  g.fillStyle='#21381e44';
  g.beginPath();
  g.ellipse(0,3,18,6,0,0,Math.PI*2);
  g.fill();
  for(let i=0;i<count;i++){
    const bx=(i-(count-1)/2)*6,bh=42+(i%2)*12;
    g.fillStyle='#355e28';
    g.fillRect(bx-2,-bh,4,bh);
    g.fillStyle='#6fa142';
    g.fillRect(bx-1,-bh,2,bh);
    g.fillStyle='#99c45e';
    for(let ny=-8;ny>-bh;ny-=9){
      g.fillRect(bx-2,ny,4,1.5);
    }
    // Bamboo leaves at top
    for(const [lx,ly,ang]of [[-6,-bh+6,-.4],[6,-bh+8,.4],[0,-bh-2,0],[-5,-bh+16,-.5],[5,-bh+18,.5]]){
      g.save();
      g.translate(bx+lx,ly);
      g.rotate(ang);
      g.fillStyle='#487831';
      g.beginPath();
      g.ellipse(0,0,7,2.2,0,0,Math.PI*2);
      g.fill();
      g.fillStyle='#7eb049';
      g.beginPath();
      g.ellipse(0,-0.5,5,1.4,0,0,Math.PI*2);
      g.fill();
      g.restore();
    }
  }
  g.restore();
}

const leftX=1456;
function init(bg){
  layer=document.createElement('canvas');
  layer.width=3072-leftX;
  layer.height=1331;
  const g=layer.getContext('2d');
  g.translate(-leftX,0);
  g.imageSmoothingEnabled=false;
  seamLayer=null;

  // 1. Seamless meadow base for x >= 1536 plus organic feathered transition over x = 1518..1536
  const grassPat=TerrainTexture.pattern(g,'grass');
  g.fillStyle=grassPat;
  g.fillRect(1536,0,1536,1331);

  let seed=571;
  const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};

  // Feather grass left across x=1518..1536 (skipping the bridge road y=476..538) so no vertical black seam line appears
  for(let y=0;y<1024;y+=3){
    if(y>=476&&y<=538)continue;
    const reach=14+Math.round(Math.sin(y*.05)*5+Math.cos(y*.11)*4);
    g.fillStyle=grassPat;
    g.fillRect(1536-reach,y,reach+4,4);
  }

  // Organic multi-tone pixel-art meadow patches & grass blades matching map.webp
  for(let i=0;i<420;i++){
    const gx=1536+rand()*1536,gy=rand()*1331;
    g.fillStyle=i%3===0?'#59843555':i%3===1?'#7da64644':'#486e2b44';
    g.beginPath();
    g.ellipse(gx,gy,14+rand()*26,8+rand()*14,0,0,Math.PI*2);
    g.fill();
  }
  for(let i=0;i<5500;i++){
    const gx=1536+rand()*1536,gy=rand()*1331;
    g.fillStyle=['#4e7830','#68943c','#86b04b','#9ec45a'][i%4];
    g.fillRect(gx,gy,2,2);
    if(i%6===0){
      g.fillRect(gx+2,gy-2,2,2);
    }
  }

  // 2. Natural pixel-art dirt roads matching map.webp's sandy-ochre palette & bridge connection at y=495..510
  const roadPaths=[
    [[1516,506],[1595,506],[1690,510],[2240,509],[2630,510],[3000,510]],
    [[1516,1225],[1845,1224],[2360,1226],[2975,1225]],
    [[1845,425],[1844,720],[1845,1225]],
    [[2630,425],[2631,820],[2630,1225]],
    [[1725,860],[2180,859],[2630,860]],
    [[1845,950],[2360,951],[2970,950]],
    [[2490,320],[2490,510]],
    [[2905,410],[2905,510]],
    [[2130,1195],[2130,1225]],
    [[2500,1195],[2500,1225]],
    [[2870,1195],[2870,1225]],
    [[1723,820],[1723,860]],
    [[1995,825],[1995,860]]
  ];
  const plazas=[[1845,510,56,38],[2490,415,62,36],[2360,950,74,34],[1845,860,42,30],[2630,510,46,32],[2630,950,48,32],[1845,1225,44,26],[2630,1225,44,26]];
  const strokeRoad=(w,col,rPad=0)=>{
    g.strokeStyle=col;
    g.fillStyle=col;
    g.lineWidth=w;
    g.lineCap='round';
    g.lineJoin='round';
    for(const pts of roadPaths){
      g.beginPath();
      pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));
      g.stroke();
    }
    for(const [cx,cy,rx,ry]of plazas){
      g.beginPath();
      g.ellipse(cx,cy,rx+rPad,ry+rPad*.7,0,0,Math.PI*2);
      g.fill();
    }
  };
  // Multi-stage road border matching map.webp: olive grass-earth halo -> warm ochre rim -> textured sandy dirt
  const dirtPat=TerrainTexture.pattern(g,'dirt');
  strokeRoad(46,'#7a8f4288',5);
  strokeRoad(40,'#c8a36a99',2);
  strokeRoad(36,dirtPat,0);
  // Seamless dirt blend over the bridge road join at (1516,506) so round lineCaps don't leave a curved line across the road
  g.strokeStyle=dirtPat;g.lineWidth=38;g.lineCap='butt';
  g.beginPath();g.moveTo(1504,506);g.lineTo(1595,506);g.stroke();

  // Dense irregular pixel-art grass & sandy pebble nibbling so no road edge looks like a straight vector stroke
  for(const pts of roadPaths)for(let k=0;k<pts.length-1;k++){
    const [x1,y1]=pts[k],[x2,y2]=pts[k+1],len=Math.hypot(x2-x1,y2-y1),nx=-(y2-y1)/len,ny=(x2-x1)/len;
    for(let d=rand()*5;d<len;d+=3+rand()*6){
      const x=x1+(x2-x1)*d/len,y=y1+(y2-y1)*d/len;
      for(const side of [-1,1]){
        const jitter=(rand()-.45)*6;
        const ex=x+nx*side*(18+jitter),ey=y+ny*side*(18+jitter);
        g.fillStyle=rand()>.35?(rand()>.5?'#68943c':'#7da646'):'#cfa972';
        g.fillRect(ex-1.5,ey-1.5,2+rand()*2.5,2+rand()*2.5);
      }
    }
  }
  for(const [cx,cy,rx,ry]of plazas){
    for(let i=0;i<42;i++){
      const a=(i/42)*Math.PI*2+rand()*.1,dr=(rand()-.45)*6;
      const ex=cx+Math.cos(a)*(rx+dr),ey=cy+Math.sin(a)*(ry+dr*.7);
      g.fillStyle=i%3===0?'#cfa972':i%2?'#68943c':'#86b04b';
      g.fillRect(ex-1.5,ey-1.5,2.5+rand()*2,2+rand()*2);
    }
  }

  // Cobblestone plaza rings at key intersections (matching map.webp's central well plaza)
  for(const [cx,cy,rx,ry]of [[1845,510,44,28],[2490,415,54,28],[2360,950,66,26],[2001,648,54,22]]){
    for(let i=0;i<34;i++){
      const a=rand()*Math.PI*2,r=Math.sqrt(rand());
      const sx=cx+Math.cos(a)*rx*r,sy=cy+Math.sin(a)*ry*r;
      g.fillStyle=i%2?'#b5b19b':'#9fa18d';
      g.beginPath();
      g.ellipse(sx,sy,4.5+rand()*3,2.8+rand()*1.5,0,0,Math.PI*2);
      g.fill();
      g.fillStyle='#cfccb8';
      g.fillRect(sx-2,sy-1,3,1.5);
    }
  }

  // 3. Flower beds with wooden timber borders matching map.webp
  for(const [x,y,w,h]of beds){
    g.fillStyle='#6b5035';
    g.fillRect(x-5,y-5,w+10,h+10);
    g.fillStyle='#a88858';
    g.fillRect(x-3,y-3,w+6,h+6);
    g.fillStyle='#4a7036';
    g.fillRect(x,y,w,h);
    for(let i=0;i<130;i++){
      const xx=x+5+rand()*(w-10),yy=y+5+rand()*(h-10);
      g.fillStyle='#729947';
      g.fillRect(xx,yy,2,5);
      g.fillStyle=['#efc5c8','#e9d78d','#c1a9d6','#f1e8d0'][i%4];
      g.fillRect(xx-2,yy-3,6,4);
      g.fillRect(xx,yy-5,2,8);
    }
  }

  // 4. Buildings & courtyard stone terrace
  function building(name,outline,source,x,y,w,h){
    const points=outline.map(([a,b])=>[x+a*w/source[2],y+b*h/source[3]]);
    g.fillStyle='#1f361d44';
    g.beginPath();
    g.ellipse(x+w*.5,y+h-4,w*.46,12,0,0,Math.PI*2);
    g.fill();
    g.save();
    g.beginPath();
    points.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));
    g.closePath();
    g.clip();
    g.drawImage(bg,...source,x,y,w,h);
    g.restore();
    Collision.polygons.push({name,points});
  }
  for(const h of houses){
    building('Nhà xóm đông',[[5,68],[97,0],[174,59],[170,89],[162,90],[161,145],[22,144],[21,91],[5,95]],[155,399,180,151],h.x,h.y,h.w,h.h);
  }
  // Stone courtyard in front of Village Chief's Hall
  g.fillStyle='#7b7d6b';
  g.fillRect(2318,283,344,116);
  g.fillStyle='#aba78e';
  g.fillRect(2320,285,340,112);
  for(let y=292;y<390;y+=18)for(let x=2328;x<2655;x+=27){
    g.fillStyle=(x+y)%3?'#c2bca0':'#989e88';
    g.fillRect(x,y,24,15);
    g.fillStyle='#d6d1b8';
    g.fillRect(x+1,y+1,22,2);
  }
  building('Dinh trưởng làng',[[0,113],[157,0],[298,110],[291,149],[274,149],[274,209],[27,209],[26,149],[4,149]],[613,29,298,209],2330,90,298,209);

  // Well & Market Stalls (clipped cleanly without rectangular grass halos)
  rect('Thành giếng xóm đông',1962,620,79,35);
  for(const x of [2200,2430]){
    g.save();
    g.beginPath();
    g.roundRect(x+6,886,145,108,12);
    g.clip();
    g.drawImage(bg,819,416,157,113,x,884,157,113);
    g.restore();
    rect('Quầy chợ đông',x+15,898,125,90);
  }

  // Decorative bamboo groves, rocks & wildflower bushes matching map.webp
  for(const [bx,by,cnt]of [[1526,285,5],[1610,390,4],[2270,390,5],[2680,350,4],[2980,360,5],[1610,960,4],[3015,810,5]]){
    drawBambooCluster(g,bx,by,cnt);
  }
  for(const [rx,ry,rs]of [[1635,445,.9],[2265,425,1],[2665,435,.85],[1890,625,.8],[2960,640,.95]]){
    drawRock(g,rx,ry,rs);
  }
  for(const [ux,uy,us,fl]of [[1530,340,.95,false],[1528,700,.9,true],[1530,835,.95,false],[1665,615,1,true],[1865,620,.9,true],[2160,585,1,true],[2615,585,1,true],[2755,620,.9,false],[1780,1010,1,true]]){
    drawBush(g,ux,uy,us,fl);
  }

  // Complete the half-cropped border trees along x=1536 of map.webp so no trees look sliced or missing
  for(const [bx,by,bs]of [[1518,95,.92],[1518,195,.95],[1522,455,.92],[1518,618,.95],[1524,768,.88],[1518,935,.95],[1505,1022,1]]){
    drawTreeSprite(g,bg,bx,by,bs);
  }

  // 5. East Village trees with full unclipped canopies
  for(const [x,y]of trees){
    drawTreeSprite(g,bg,x,y,1);
    Collision.circles.push({name:'Cây xóm đông',x,y:y-45,rx:52,ry:40});
  }

  for(const [x,y]of [[2260,570],[2510,570],[2225,850],[2480,850]]){
    g.fillStyle='#576450';
    g.fillRect(x+5,y+8,6,13);
    g.fillRect(x+49,y+8,6,13);
    g.fillStyle='#b2ad8b';
    g.fillRect(x,y,60,10);
    rect('Ghế vườn hoa',x,y,60,21);
  }
}

function draw(g,t){
  if(layer)g.drawImage(layer,leftX,0);
}
return{init,draw,houses,fields,drawTreeSprite,drawBush,drawRock,drawBambooCluster,makeSeamlessPattern};})();

