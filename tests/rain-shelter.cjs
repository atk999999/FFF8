const fs=require('fs'),vm=require('vm'),assert=require('assert');const nodes=new Map();const g=new Proxy({measureText:()=>({width:80})},{get(o,k){if(k in o)return o[k];return (...a)=>{for(const n of a)if(typeof n==='number')assert(Number.isFinite(n),k);if(k.includes('Gradient'))return{addColorStop(){}};return {}}},set(o,k,v){o[k]=v;return true}});const c={window:{},addEventListener(){},document:{createElement:()=>({getContext:()=>g}),getElementById:id=>{if(!nodes.has(id))nodes.set(id,{setAttribute(){}});return nodes.get(id)}}};vm.createContext(c);for(const f of ['collision','terrain-texture','expansion','east-village','character','tieu-pham','weather','npcs','lighting','village-work','snow-cover','village-detail','rain-shelter'])vm.runInContext(fs.readFileSync('public/game/'+f+'.js','utf8'),c);vm.runInContext('VillageExpansion.init({});EastVillage.init({});VillageWork.init();VillageDetail.init({});RainShelter.init();Villagers.init();SnowCover.init();this.v=Villagers;this.w=Weather;this.work=VillageWork;this.snow=SnowCover;this.col=Collision;this.roster=PlayerRoster;this.hero=TieuPham;this.light=VillageLighting',c);
c.v.minutes=480;const kid=c.v.list.find(n=>n.id==='minh');Object.assign(kid,{x:2400,y:730,hidden:false,state:'play0',route:[]});
c.w.choose('rain');
assert.equal(c.v.jobAt(kid).key,'rainwait');
const farmer=c.v.list.find(n=>n.id==='binh');assert.notEqual(c.v.jobAt(farmer).key,'rainhome');assert(farmer.raincoat);
for(let i=0;i<1400;i++)c.v.update(.05,i*.05,{x:220,y:316});
assert.equal(kid.state,'rainwait');assert(kid.arrived&&!kid.hidden,'child must stay visible inside shelter');assert(kid.x>1935&&kid.x<2080&&kid.y>430&&kid.y<480);
for(const n of c.v.list)assert(n.arrived||n.raincoat,'villager failed to reach rain shelter: '+n.id);
c.w.choose('storm');for(const n of c.v.list){const j=c.v.jobAt(n);assert(!n.raincoat);assert(['rainhome','rainwait'].includes(j.key))}
c.w.choose('sun');c.v.update(.05,100,{x:220,y:316});assert(!kid.state.startsWith('rain'));assert(!farmer.raincoat);
vm.runInContext('RainShelter.ground(this.g);',Object.assign(c,{g}));vm.runInContext('RainShelter.back(this.g,1);RainShelter.front(this.g,1);RainShelter.coat(this.g,{x:2000,y:450,dir:1,walk:1,raincoat:true},1)',c);
console.log('PASS: rain refuge selection, visible pavilion arrival, farmer coats, storm evacuation, dry-weather resumption, well/pavilion render');
