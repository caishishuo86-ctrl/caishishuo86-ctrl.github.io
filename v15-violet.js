"use strict";
(()=>{
 const finale=document.querySelector('.finale');if(!finale)return;
 const stage=finale.querySelector('.stellar-stage');const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n));let frame=0;
 function arrival(){frame=0;const r=finale.getBoundingClientRect();finale.style.setProperty('--enter',reduced.matches?'1':clamp((innerHeight*.95-r.top)/(innerHeight*.65)).toFixed(3));}
 const update=()=>{if(!frame)frame=requestAnimationFrame(arrival)};
 addEventListener('scroll',update,{passive:true});addEventListener('resize',update,{passive:true});arrival();
 const links=Array.from(finale.querySelectorAll('[data-preview]'));
 const panels=Array.from(finale.querySelectorAll('[data-panel]'));
 function choose(name){const active=['email','github','resume'].includes(name)?name:'';stage.classList.toggle('has-preview',!!active);for(const a of links)a.classList.toggle('is-active',a.dataset.preview===active);for(const p of panels){const show=p.dataset.panel===active;p.classList.toggle('is-visible',show);p.setAttribute('aria-hidden',String(!show));}}
 for(const a of links){a.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')choose(a.dataset.preview)});a.addEventListener('focus',()=>choose(a.dataset.preview));a.addEventListener('pointerdown',()=>choose(a.dataset.preview));}
 finale.querySelector('.finale-links')?.addEventListener('pointerleave',()=>{if(!finale.querySelector('.finale-link:focus-visible'))choose('')});
 finale.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch'||innerWidth<701)return;const r=stage.getBoundingClientRect();const x=clamp((e.clientX-r.left)/r.width)*2-1,y=clamp((e.clientY-r.top)/r.height)*2-1;stage.style.setProperty('--stage-x',(x*5).toFixed(1)+'px');stage.style.setProperty('--stage-y',(y*4).toFixed(1)+'px')},{passive:true});
 const cfg=window.PORTFOLIO_CONTACT||{};const email=String(cfg.email||'').trim().replace(/^mailto:/i,'');const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);const gh=String(cfg.github||'').trim(),resume=String(cfg.resume||'').trim();
 const allowUrl=s=>/^https:\/\/[^\s]+$/i.test(s)||(/^(?:\.\/)?assets\/[\w.\-/]+$/i.test(s)&&!s.includes('..'));let count=0;
 function link(id,href,blank){const a=document.getElementById(id);if(!a||!href)return;a.href=href;a.classList.remove('is-unset');a.removeAttribute('aria-disabled');if(blank){a.target='_blank';a.rel='noopener noreferrer'}count++;}
 if(validEmail)link('finale-email','mailto:'+email,false);if(allowUrl(gh))link('finale-github',gh,true);if(allowUrl(resume))link('finale-resume',resume,true);else{const pending=document.getElementById('finale-resume');if(pending)pending.setAttribute('aria-label','Resume — Coming Soon，简历即将上线');}
 for(const a of finale.querySelectorAll('.finale-link.is-unset')){a.tabIndex=0;a.title=a.id==='finale-resume'?'简历 PDF 稍后上线':'该入口尚未配置';a.addEventListener('click',e=>{e.preventDefault();choose(a.dataset.preview)})}
 const canvas=document.getElementById('stellar-canvas'),ctx=canvas?.getContext('2d');if(!ctx)return;
 const rand=(()=>{let s=20261120;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}})();
 const stars=Array.from({length:115},()=>({x:rand(),y:rand(),r:.2+rand()*1.1,alpha:.17+rand()*.62,phase:rand()*6.283,gold:rand()>.95}));let w=0,h=0,dpr=1,visible=true,running=false;
 function resizeCanvas(){dpr=Math.min(devicePixelRatio||1,2);w=Math.max(1,canvas.clientWidth);h=Math.max(1,canvas.clientHeight);canvas.width=Math.floor(w*dpr);canvas.height=Math.floor(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function draw(t){if(!visible){running=false;return}ctx.clearRect(0,0,w,h);for(const s of stars){const a=s.alpha*(reduced.matches?1:.75+.25*Math.sin(t*.00036+s.phase));const x=s.x*w,y=s.y*h;ctx.beginPath();ctx.arc(x,y,s.r,0,Math.PI*2);ctx.fillStyle=s.gold?`rgba(255,212,169,${a})`:`rgba(238,202,255,${a})`;ctx.fill();if(s.gold){ctx.strokeStyle=`rgba(251,203,240,${a*.32})`;ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke()}}if(!reduced.matches)requestAnimationFrame(draw);else running=false}
 resizeCanvas();addEventListener('resize',()=>{resizeCanvas();if(reduced.matches)draw(0)},{passive:true});const io=new IntersectionObserver(entries=>{const was=visible;visible=entries[0]?.isIntersecting??true;if(visible&&!was&&!running){running=true;requestAnimationFrame(draw)}},{rootMargin:'80px'});io.observe(finale);running=true;requestAnimationFrame(draw);
})();
