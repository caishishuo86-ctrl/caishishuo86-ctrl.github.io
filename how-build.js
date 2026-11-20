'use strict';
(()=>{
const section=document.querySelector('.how-section');if(!section)return;
const steps=[...section.querySelectorAll('.how-step')],nodes=[...section.querySelectorAll('.how-node')];
const trace=section.querySelector('#how-trace'),label=section.querySelector('.how-progress-label');
const rail=section.querySelector('.how-rail'), heading=section.querySelector('.how-heading');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ease=n=>n*n*(3-2*n);
let running=false, last=-1;
function draw(){running=false;
 const mobile=innerWidth<=900||reduced.matches;
 if(mobile){
   section.style.setProperty('--journey-enter','1');
   steps.forEach(s=>{s.style.opacity='';s.style.transform='';s.style.visibility='';s.style.pointerEvents='';s.removeAttribute('aria-hidden');s.classList.add('is-current')});
   nodes.forEach(n=>n.classList.remove('active'));
   trace.style.strokeDasharray='100 0';
   rail.style.transform='';return;
 }
 const rect=section.getBoundingClientRect();
 const total=Math.max(1,section.offsetHeight-innerHeight);
 const p=clamp(-rect.top/total,0,1);
 // The first 11% is a dedicated entry / reading hold: the previous bridge is fully gone.
 const enter=ease(clamp(p/.095,0,1));
 section.style.setProperty('--journey-enter',enter.toFixed(4));
 const t=clamp((p-.095)/.905,0,1);
 // Each station gets a long stationary reading hold, followed by a brief transfer.
 const position=t*4;
 let index=clamp(Math.floor(position),0,3);
 const within=position-index;
 const mix=index<3?ease(clamp((within-.75)/.25,0,1)):0;
 steps.forEach((step,i)=>{
  let alpha=0,move=40;
  if(i===index){alpha=1-mix;move=-22*mix;}
  else if(i===index+1){alpha=mix;move=32*(1-mix);}
  alpha*=enter;
  step.style.opacity=alpha.toFixed(4);
  step.style.visibility=alpha>.015?'visible':'hidden';
  step.style.pointerEvents=(i===index&&mix<.5&&enter>.92)?'auto':'none';
  step.style.transform=`translate3d(${(1-enter)*35}px,calc(-50% + ${move}px),0)`;
  step.classList.toggle('is-current',alpha>.015);
  step.setAttribute('aria-hidden',alpha>.015?'false':'true');
 });
 const nodeIndex=Math.min(3,index+(mix>.5?1:0));
 nodes.forEach((node,i)=>node.classList.toggle('active',nodeIndex===i));
 const traceAmount=clamp((position+.1)/3.7,0,1)*100;
 trace.style.strokeDasharray=`${traceAmount.toFixed(3)} 100`;
 // A restrained lateral/perspective camera drift, without displacing reading text.
 rail.style.transform=`translate3d(${(-12*t).toFixed(1)}px,${(-6*t).toFixed(1)}px,0) scale(${(1.08+.12*t).toFixed(4)}) rotate(${(-2.7*t).toFixed(2)}deg)`;
 label.textContent=`${String(nodeIndex+1).padStart(2,'0')} / 04`;
 if(nodeIndex!==last){last=nodeIndex;section.dataset.station=String(nodeIndex+1)}
}
function schedule(){if(!running){running=true;requestAnimationFrame(draw)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener?.('change',schedule);schedule();
})();
