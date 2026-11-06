'use strict';

// A flat assembly court. All paving is cached and walkable.
const VillageSquare = (() => {
  let paving;
  const left = 468, top = 382, cx = 680, cy = 510;
  function ringPoint(radius, angle) {
    return [cx + radius * Math.cos(angle), cy + radius * .62 * Math.sin(angle)];
  }
  function polygon(g, points, color) {
    g.fillStyle = color;
    g.beginPath();
    points.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y));
    g.closePath();
    g.fill();
  }
  function init() {
    paving = document.createElement('canvas');
    paving.width = 430; paving.height = 262;
    const g = paving.getContext('2d');
    g.translate(-left, -top);
    // Leave the market stall and its baskets on their original ground.
    g.beginPath();
    g.rect(left, top, 430, 262);
    const stall = [[817,448],[822,425],[877,421],[921,414],[969,442],[970,464],[959,464],[961,529],[844,530],[831,524],[824,522],[825,508],[839,499],[839,465],[820,465]];
    stall.forEach(([x,y], i) => i ? g.lineTo(x,y) : g.moveTo(x,y));
    g.closePath();
    g.clip('evenodd');
    const stone = ['#b9b39b','#c0baa1','#adae96','#c9c0a5','#b4ad94','#c1b99f'];
    let seed = 419;
    function random() { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }
    for (let row=0; row<10; row++) {
      const inner=row*19, outer=inner+19, blocks=8+row*5;
      const offset=(row%2)*Math.PI/blocks;
      for (let i=0;i<blocks;i++) {
        const a=offset+i*2*Math.PI/blocks, b=a+2*Math.PI/blocks;
        const block=[ringPoint(inner,a),ringPoint(outer,a),ringPoint(outer,(a+b)/2),ringPoint(outer,b),ringPoint(inner,b)];
        polygon(g,block,'#827f67');
        const inset=[ringPoint(inner+1,a+.005),ringPoint(outer-1,a+.004),ringPoint(outer-1,(a+b)/2),ringPoint(outer-1,b-.004),ringPoint(inner+1,b-.005)];
        polygon(g,inset,stone[Math.floor(random()*stone.length)]);
        const [x,y]=ringPoint(inner+9,(a+b)/2);
        g.fillStyle='#e2d9b966';g.fillRect(x,y,2+random()*4,1);
      }
    }
    // A jade lotus set into the central stone; slim ochre borders are flush with the paving.
    for(const [r,color] of [[65,'#776f50'],[62,'#d6c399'],[58,'#72827b'],[55,'#93a296']]){
      g.fillStyle=color;g.beginPath();g.ellipse(cx,cy,r,r*.62,0,0,Math.PI*2);g.fill();
    }
    for(let i=0;i<8;i++){
      g.save();g.translate(cx,cy);g.scale(1,.62);g.rotate(i*Math.PI/4);
      g.beginPath();g.moveTo(4,0);g.quadraticCurveTo(22,-14,48,0);g.quadraticCurveTo(22,14,4,0);
      g.fillStyle='#d9ceaa';g.fill();g.beginPath();g.moveTo(9,0);g.quadraticCurveTo(29,-4,44,0);
      g.strokeStyle='#8c967d';g.stroke();g.restore();
    }
    g.fillStyle='#586e62';g.beginPath();g.ellipse(cx,cy,9,5,0,0,7);g.fill();
  }
  function draw(g) { if(paving)g.drawImage(paving,left,top); }
  return {init,draw};
})();
