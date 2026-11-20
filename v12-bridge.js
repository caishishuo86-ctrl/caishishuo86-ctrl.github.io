'use strict';
(()=>{
 const bridge=document.querySelector('.relay-bridge');if(!bridge)return;
 let requested=false;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const ease=x=>x*x*(3-2*x);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function update(){requested=false;
  const b=bridge.getBoundingClientRect();
  if(b.top>innerHeight*1.5||b.bottom< -innerHeight*.5)return;
  const p=clamp(-b.top/Math.max(1,bridge.offsetHeight-innerHeight),0,1);
  const gather=ease(clamp(p/.5,0,1));
  const copy=ease(clamp((p-.24)/.39,0,1));
  const leave=ease(clamp((p-.80)/.20,0,1));
  bridge.style.setProperty('--bridge-shift',(-innerHeight*.04*gather).toFixed(1)+'px');
  bridge.style.setProperty('--bridge-scale',(1+.14*gather).toFixed(4));
  bridge.style.setProperty('--bridge-lift',`calc(-34% + ${(45*(1-copy)).toFixed(1)}px)`);
  bridge.style.setProperty('--bridge-copy-scale',(.92+.08*copy).toFixed(4));
  bridge.style.setProperty('--bridge-gather',String(gather));
  bridge.style.setProperty('--bridge-copy',String(copy*(1-leave)));
  bridge.style.setProperty('--bridge-exit',String(leave));
 }
 function request(){if(!requested){requested=true;requestAnimationFrame(update)}}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});request();
})();
