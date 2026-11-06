'use strict';
// Large deterministic textures: no small mirrored tile, visible grid or repeated hedge border.
const TerrainTexture=(()=>{
let grass,dirt;
function texture(kind){let c=document.createElement('canvas');c.width=kind==='grass'?1536:512;c.height=kind==='grass'?1331:512;const g=c.getContext('2d');let seed=kind==='grass'?919:712;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const base=kind==='grass'?[124,162,53]:[233,190,127],w=c.width,h=c.height;
const img=typeof g.createImageData==='function'?g.createImageData(w,h):null;
if(img&&img.data&&img.data.length===w*h*4){
  const data=img.data;
  for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){
    const wave=Math.sin(x*.017+y*.013)*2+Math.sin(x*.041-y*.029)*1.5;
    const n=(rnd()-.5)*(kind==='grass'?22:13)+wave;
    const r=Math.round(base[0]+n),gg=Math.round(base[1]+n),b=Math.round(base[2]+n*.6);
    for(let dy=0;dy<2&&y+dy<h;dy++)for(let dx=0;dx<2&&x+dx<w;dx++){
      const idx=((y+dy)*w+(x+dx))*4;
      data[idx]=r;data[idx+1]=gg;data[idx+2]=b;data[idx+3]=255;
    }
  }
  g.putImageData(img,0,0);
}else{
  for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const wave=Math.sin(x*.017+y*.013)*2+Math.sin(x*.041-y*.029)*1.5;let n=(rnd()-.5)*(kind==='grass'?22:13)+wave;
  g.fillStyle=`rgb(${Math.round(base[0]+n)},${Math.round(base[1]+n)},${Math.round(base[2]+n*.6)})`;g.fillRect(x,y,2,2)}
}
if(kind==='grass')for(let i=0;i<16000;i++){const x=rnd()*c.width,y=rnd()*c.height;g.fillStyle=i%3?'#73982e66':'#adc65c66';g.fillRect(x,y,1,2+rnd()*3)}
else for(let i=0;i<1900;i++){g.fillStyle=i%2?'#b995633b':'#f7d79f66';g.fillRect(rnd()*512,rnd()*512,1+rnd()*2,1)}return c}
function pattern(g,kind){if(kind==='grass'){grass=grass||texture(kind);return g.createPattern(grass,'repeat')}dirt=dirt||texture(kind);return g.createPattern(dirt,'repeat')}
return{pattern};})();
