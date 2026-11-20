'use strict';

const gallery = document.querySelector('.spatial-showcase');
const stage = gallery.querySelector('.spatial-layout');
const sticky = gallery.querySelector('.spatial-inner');
const counter = gallery.querySelector('.gallery-counter span');
const canvas = document.querySelector('#rail-grid');
const ctx = canvas.getContext('2d');
const scenes = [...gallery.querySelectorAll('.project-scene')];
const videos = scenes.map(scene => scene.querySelector('video'));
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const modal = document.querySelector('#modal');
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const smooth = n => n * n * (3 - 2 * n);
const colors = ['#b273ed', '#5f86e7', '#d167b4'];
const blues = ['#70c9ef', '#74e4ff', '#86c6ff'];
const caseNotes = [
  "面向智能实验室的产品概念：从自然语言实验任务到规划、工具调用、执行状态与数据记录。7×24 小时为目标运行场景，视频为概念演示，不代表所有功能已完成部署。",
  "将实验步骤、设备资源、先后依赖和时间条件转化为排程约束，生成可行解并优化总完成时间等目标。短片为可视化示意，不代表真实产线优化百分比。",
  "以运动智能镜为产品概念，展示人体关键点感知、动作反馈与个性化训练指导的交互思路。当前短片为视觉示意，不代表产品已完成临床或专业训练效果验证。"
];
let enabled = false;
let active = -1;
let position = 0;
let goal = 0;
let frame = 0;
let previousTime = 0;
let galleryVisible = false;
let gridWidth = 0;
let gridHeight = 0;
let modalTrigger;
const pauseRequested = new Set();
const playRequested = new Set();

function drawRoom(progress) {
  if (!ctx || !gridWidth || !gridHeight) return;
  const w = gridWidth;
  const h = gridHeight;
  ctx.clearRect(0, 0, w, h);

  // A single camera samples the curved tunnel and its track at different depths.
  const phase = progress * 5.3;
  const bend = z => Math.sin(z * .28) * 1.05;
  const project = (angle, distance, radius = 1) => {
    const z = phase + distance;
    const scale = 1.68 / (distance + .68);
    const x = Math.cos(angle) * 1.55 * radius + bend(z) - bend(phase);
    const y = Math.sin(angle) * radius;
    return [w * (.57 + x * scale * .43), h * (.61 + y * scale * .43)];
  };

  function stroke(points, color, width = 1) {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  for (let spoke = 0; spoke < 14; spoke++) {
    const angle = spoke * Math.PI * 2 / 14;
    stroke(Array.from({length: 64}, (_, i) => project(angle, .15 + i * .14)), '#bd9dea21');
  }
  for (let ring = Math.ceil(phase / .86); ring * .86 < phase + 9; ring++) {
    const distance = ring * .86 - phase;
    const opacity = clamp((1 - distance / 10) * .15, .02, .14);
    stroke(Array.from({length: 61}, (_, i) => project(i * Math.PI / 30, distance)), `rgba(206,164,255,${opacity})`);
  }
  for (const angle of [1.05, 2.09]) {
    const points = Array.from({length: 64}, (_, i) => project(angle, .25 + i * .14, 1.08));
    stroke(points, '#bd75ef16', 5);
    stroke(points, '#efd2ff55', 1.2);
  }
}

function inView(el) {
  const rect = el.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < innerHeight;
}

function showVideoFallback(scene) {
  const media = scene.querySelector('.scene-media');
  const toggle = scene.querySelector('.scene-toggle');
  media.classList.add('playback-blocked', 'controls-open');
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', '隐藏视频控制');
}

function syncVideos() {
  videos.forEach((video, i) => {
    const visibleScene = enabled ? i === active && galleryVisible : inView(scenes[i]);
    const permitted = !motion.matches || playRequested.has(i);
    if (visibleScene && permitted && !pauseRequested.has(i) && !document.hidden) {
      if (video.paused) {
        try {
          const result = video.play();
          if (result && typeof result.catch === 'function') result.catch(() => showVideoFallback(scenes[i]));
        } catch (error) {
          showVideoFallback(scenes[i]);
        }
      }
    } else if (!video.paused) {
      video.pause();
    }
  });
}

function setActive(index) {
  if (index === active) return;
  active = index;
  counter.textContent = String(index + 1).padStart(2, '0');
  gallery.style.setProperty('--scene-glow', colors[index]);
  gallery.style.setProperty('--scene-blue', blues[index]);
}

function tick(time) {
  frame = 0;
  const dt = previousTime ? clamp(time - previousTime, 8, 48) : 16;
  previousTime = time;
  position += (goal - position) * (1 - Math.exp(-dt / 66));
  if (Math.abs(goal - position) < .002) position = goal;
  if (enabled) {
    setActive(Math.min(scenes.length - 1, Math.floor(position + .22)));
    const narrow = stage.clientWidth < 800;
    scenes.forEach((scene, i) => {
      const delta = i - position;
      const incoming = delta > 0;
      // Each interval uses 55% for reading, 23% for departure, and 22% for arrival.
      const travel = incoming
        ? smooth(clamp(delta / .22, 0, 1))
        : smooth(clamp((-delta - .55) / .23, 0, 1));
      const curve = travel;
      const side = Math.sign(delta) * (narrow ? 84 : 103) * travel;
      const depth = -(incoming ? 1520 : 1100) * travel;
      const lift = (incoming ? -92 : 62) * curve;
      const yaw = Math.sign(-delta) * 49 * travel;
      const pitch = 12 * curve;
      const opacity = 1 - smooth(clamp((travel - .44) / .56, 0, 1));
      scene.style.visibility = opacity === 0 ? 'hidden' : 'visible';
      scene.style.transform = `translate3d(${side}%,calc(-50% + ${lift}px),${depth}px) rotateY(${yaw}deg) rotateX(${pitch}deg)`;
      scene.style.opacity = String(opacity);
      scene.style.zIndex = i === active ? '3' : '2';
      scene.inert = i !== active;
    });
    drawRoom(position);
    // Last 19% of gallery scroll is dedicated to retiring the entire scene before the bridge.
    const tail = clamp((galleryScrollFraction() - .81) / .19, 0, 1);
    const leaving = smooth(tail);
    gallery.style.setProperty("--gallery-leave", leaving.toFixed(4));
    sticky.style.opacity = (1 - leaving).toFixed(4);
    if (tail > .01) {
      const last = scenes[scenes.length - 1];
      last.style.transform += ` translateZ(${-620 * leaving}px) rotateX(${12*leaving}deg) scale(${1-.16*leaving})`;
      last.style.opacity = String(Math.min(Number(last.style.opacity||1),1-leaving));
      if (tail > .75) last.inert = true;
    }
  } else {
    const nearest = scenes.map(scene => Math.abs(scene.getBoundingClientRect().top + scene.offsetHeight / 2 - innerHeight / 2));
    setActive(nearest.indexOf(Math.min(...nearest)));
  }
  syncVideos();
  if (position !== goal) frame = requestAnimationFrame(tick);
  else previousTime = 0;
}

function galleryScrollFraction() {
  const bounds=gallery.getBoundingClientRect();
  return clamp(-bounds.top / Math.max(1,gallery.offsetHeight-innerHeight),0,1);
}

function measureScroll() {
  const bounds = gallery.getBoundingClientRect();
  galleryVisible = bounds.top < innerHeight * .72 && bounds.bottom > innerHeight * .3;
  const travel = Math.max(1, gallery.offsetHeight - sticky.offsetHeight);
  const linear = clamp(-bounds.top / travel, 0, 1) * (scenes.length - .45);
  goal = enabled ? Math.min(scenes.length - 1, linear) : 0;
  if (!frame) frame = requestAnimationFrame(tick);
}

function resize() {
  enabled = !motion.matches && innerHeight >= (innerWidth <= 800 ? 740 : 600);
  gallery.classList.toggle('rail-enabled', enabled);
  if (enabled && scenes.some(scene => scene.offsetHeight + 12 > stage.clientHeight)) {
    enabled = false;
    gallery.classList.remove('rail-enabled');
  }
  if (!enabled) { sticky.style.opacity = ""; gallery.style.removeProperty("--gallery-leave"); }
  if (!enabled) scenes.forEach(scene => {
    scene.removeAttribute('style');
    scene.inert = false;
  });
  const bounds = canvas.getBoundingClientRect();
  gridWidth = bounds.width;
  gridHeight = enabled ? bounds.height : Math.min(bounds.height, 720);
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  if (ctx) {
    canvas.width = Math.round(gridWidth * ratio);
    canvas.height = Math.round(gridHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawRoom(position);
  }
  measureScroll();
}

scenes.forEach((scene, i) => {
  const video = videos[i];
  const toggle = scene.querySelector('.scene-toggle');
  const media = scene.querySelector('.scene-media');
  function showControls(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '隐藏视频控制' : '显示视频控制');
    media.classList.toggle('controls-open', open);
  }
  toggle.addEventListener('click', () => showControls(!media.classList.contains('controls-open')));
  media.addEventListener('keydown', event => {
    if (event.key === 'Escape' && media.classList.contains('controls-open')) {
      showControls(false);
      toggle.focus();
    }
  });
  const play = scene.querySelector('.scene-play');
  const time = scene.querySelector('.scene-time');
  const meter = scene.querySelector('.showcase-progress span');
  const stamp = seconds => {
    const whole = Math.floor(seconds);
    return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
  };
  video.style.setProperty('--poster', `url("${video.poster}")`);
  function updateControls() {
    play.textContent = video.paused ? '▶' : '❚❚';
    play.setAttribute('aria-label', video.paused ? '播放视频' : '暂停视频');
    const duration = video.duration;
    time.textContent = Number.isFinite(duration)
      ? `${stamp(video.currentTime)} / ${stamp(duration)}`
      : stamp(video.currentTime);
    meter.style.width = duration > 0 ? `${video.currentTime / duration * 100}%` : '0%';
  }
  ['play', 'pause', 'timeupdate', 'loadedmetadata'].forEach(event => video.addEventListener(event, updateControls));
  video.addEventListener('play', () => scene.querySelector('.scene-media').classList.remove('playback-blocked'));
  video.addEventListener('error', () => showVideoFallback(scene));
  play.addEventListener('click', () => {
    if (video.paused) {
      playRequested.add(i);
      pauseRequested.delete(i);
      video.play().catch(() => {});
    } else {
      pauseRequested.add(i);
      video.pause();
    }
  });
  scene.querySelector('.scene-fullscreen').addEventListener('click', () => {
    if (typeof video.webkitEnterFullscreen === 'function' && video.webkitSupportsFullscreen) {
      video.webkitEnterFullscreen();
    } else if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
  });
  scene.querySelector('.scene-case').addEventListener('click', event => {
    modalTrigger = event.currentTarget;
    document.querySelector('#modal-tag').textContent = `PROJECT 0${i + 1} · CONCEPT CASE`;
    document.querySelector('#modal-title').textContent = scene.querySelector('h3').textContent;
    document.querySelector('#modal-body').textContent = caseNotes[i];
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    document.querySelector('#close-modal').focus();
  });
});

new MutationObserver(() => {
  if (!modal.classList.contains('visible')) modalTrigger?.focus({preventScroll: true});
}).observe(modal, {attributes: true, attributeFilter: ['class']});

addEventListener('scroll', measureScroll, {passive: true});
addEventListener('resize', resize, {passive: true});
addEventListener('pageshow', resize);
document.addEventListener('visibilitychange', syncVideos);
if (typeof motion.addEventListener === 'function') motion.addEventListener('change', resize);
else if (typeof motion.addListener === 'function') motion.addListener(resize);
resize();
if (document.fonts) document.fonts.ready.then(resize);
