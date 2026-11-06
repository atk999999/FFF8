'use strict';
const Weather=(()=>{
const names={sun:'Nắng',rain:'Mưa',storm:'Bão',snow:'Tuyết'};
let mode='auto',kind='sun',rain=0,snow=0,storm=0,elapsed=0,lastSlot=-1;
const drops=Array.from({length:180},(_,i)=>({x:((i*73.317)%179)/179,y:((i*29.713)%181)/181,s:.6+(i%7)/10}));
function period(minutes){const h=minutes/60;return h<5?'Đêm khuya':h<7?'Bình minh':h<11?'Buổi sáng':h<14?'Buổi trưa':h<17?'Buổi chiều':h<19?'Hoàng hôn':'Buổi tối'}
function choose(value){mode=value;lastSlot=-1;if(mode!=='auto')kind=value;refresh()}
function refresh(){const el=document.getElementById('weather-label');if(el)el.textContent=names[kind]+(mode==='auto'?' · Tự nhiên':'');}
function init(){document.getElementById('weather-select').onchange=e=>choose(e.target.value);refresh()}
function getAutoWeather(day,minutes){const d=(((day-1)%7)+7)%7+1,h=minutes/60;if(d===1){if(h>=13.5&&h<17.5)return'storm';if(h>=17.5&&h<19)return'rain';return'sun'}if(d===2){if(h>=15&&h<18.5)return'rain';return'sun'}if(d===3)return'sun';if(d===4){if(h>=6&&h<14)return'rain';return'sun'}if(d===5)return'sun';if(d===6){if(h>=21||h<4.5)return'rain';return'sun'}if(h>=6&&h<21)return'snow';return'sun'}
function update(dt,minutes,day){elapsed+=dt;if(mode==='auto'){const slot=(day-1)*48+Math.floor(minutes/30);if(slot!==lastSlot){lastSlot=slot;kind=getAutoWeather(day,minutes);refresh()}}const approach=(a,b)=>a+(b-a)*Math.min(1,dt*.7);rain=approach(rain,kind==='rain'||kind==='storm'?1:0);snow=approach(snow,kind==='snow'?1:0);storm=approach(storm,kind==='storm'?1:0);}
function ground(g,t){if(rain>.05){g.save();g.globalAlpha=rain*.25;for(const [x,y,rx]of [[1845,510,24],[2630,945,22],[2490,370,20],[750,670,25],[520,579,18],[1015,566,23],[719,1076,20],[850,1230,22]]){g.fillStyle='#88a9a5';g.beginPath();g.ellipse(x,y,rx,rx*.28,0,0,7);g.fill();g.strokeStyle='#c6dce0';g.lineWidth=1;const r=((t*10+x)%rx);g.beginPath();g.ellipse(x,y,r,r*.3,0,0,7);g.stroke()}g.restore()}
}

function daylight(g,minutes){const h=minutes/60;let color=null,alpha=0;if(h>=5&&h<8){color='255,193,115';alpha=.12*Math.sin((h-5)/3*Math.PI)}else if(h>=11&&h<14){color='255,246,190';alpha=.035}else if(h>=16&&h<19){color='231,135,79';alpha=.16*Math.sin((h-16)/3*Math.PI)}if(color){g.fillStyle='rgba('+color+','+alpha+')';g.fillRect(0,0,3072,1331)}}
function screen(g,w,h,covered){g.save();if(rain>.02){g.fillStyle='rgba(24,43,65,'+(rain*.1+storm*.15)+')';g.fillRect(0,0,w,h)}if(snow>.02){g.fillStyle='rgba(200,218,227,'+snow*.12+')';g.fillRect(0,0,w,h)}
if(covered){g.beginPath();g.rect(0,0,w,h);g.rect(covered.x,covered.y,covered.w,covered.h);g.clip('evenodd')}
const count=Math.min(180,Math.round(w*h/6000)+55);
if(rain>.02){g.strokeStyle='rgba(180,213,225,'+rain*.48+')';g.lineWidth=1;g.beginPath();for(let i=0;i<count;i++){const d=drops[i],velocity=300*d.s+storm*160,x=((d.x*w+elapsed*(35+storm*130)*d.s)%(w+80))-40,y=(d.y*h+elapsed*velocity)%(h+40)-20;g.moveTo(x,y);g.lineTo(x+3+storm*10,y+9+storm*9)}g.stroke()}
if(snow>.02){g.fillStyle='rgba(245,250,251,'+snow*.9+')';for(let i=0;i<Math.min(count,110);i++){const d=drops[i],x=((d.x*w+elapsed*14*d.s+Math.sin(elapsed*.8+i)*17)%(w+40)+w+40)%(w+40)-20,y=(d.y*h+elapsed*(19+22*d.s))%(h+20)-10;g.beginPath();g.arc(x,y,1+(i%3)*.65,0,7);g.fill()}}
// One soft distant flash per storm interval, never a strobe.
const phase=elapsed%11;if(storm>.5&&phase<.16){g.fillStyle='rgba(224,235,251,'+(.13*storm*(1-phase/.16))+')';g.fillRect(0,0,w,h)}g.restore()}
return{init,update,ground,daylight,screen,choose,period,get kind(){return kind},get storm(){return kind==='storm'},get rainIntensity(){return rain},get snowIntensity(){return snow},get stormIntensity(){return storm}};
})();
