import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prepareSequence, playSequence, finishSequence } from './sequences.js';

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The page doesn't scroll. Each frame is a full-screen layer; a swipe (or
// wheel / arrow key) plays a fixed-length transition to the next one, so the
// motion is always smooth regardless of how the guest's finger moves.
//
// Each frame has one paused timeline running 0 → 1:
//   0    – 0.2   enter veil clears
//   0.12 – 0.5   content steps appear in order
//   HOLD         the frame at rest
//   0.78 – 1     content leaves and the exit veil covers the screen
const HOLD = 0.64;
const ENTER_S = 2.9; // seconds to play 0 → HOLD
const EXIT_S = 1.4; // seconds to play HOLD → 1
// The mist veil is 2.6 screens tall, solid between 30% and 70% of its height.
const MIST_COVER = -30;
const MIST_BELOW = 38.5;

function veilTweens(tl, veil, type, role) {
  const enter = role === 'enter';
  const at = enter ? 0 : 0.78;
  const dur = 0.22;
  switch (type) {
    case 'mist':
      gsap.set(veil, { visibility: 'visible' });
      return enter
        ? tl.fromTo(veil, { yPercent: MIST_COVER }, { yPercent: -100, duration: dur, ease: 'power1.in' }, at)
        : tl.fromTo(veil, { yPercent: MIST_BELOW }, { yPercent: MIST_COVER, duration: dur, ease: 'power1.out' }, at);
    case 'light':
      return enter
        ? tl.fromTo(veil, { autoAlpha: 1 }, { autoAlpha: 0, duration: dur, ease: 'power1.in' }, at)
        : tl.fromTo(veil, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: 'power2.in' }, at);
    default: // paper, dusk
      return tl.fromTo(veil, { autoAlpha: enter ? 1 : 0 }, { autoAlpha: enter ? 0 : 1, duration: dur }, at);
  }
}

function stepTween(tl, el, at) {
  const d = el.dataset;
  if (d.rise !== undefined) return tl.fromTo(el, { yPercent: 105 }, { yPercent: 0, duration: 0.12, ease: 'power2.out' }, at);
  if (d.grow !== undefined) return tl.fromTo(el, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 0.16 }, at);
  if (d.draw !== undefined) {
    return tl.fromTo(el.querySelectorAll('path'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.2, stagger: 0.012 }, at);
  }
  const from = { autoAlpha: 0 };
  if (d.from === 'left') from.x = -48;
  else if (d.from === 'right') from.x = 48;
  else if (d.from === 'below') from.y = 80;
  else from.y = 24;
  return tl.fromTo(el, from, { autoAlpha: 1, x: 0, y: 0, duration: 0.13, ease: 'power2.out' }, at);
}

function buildTimeline(scene, isLast) {
  const { enter, exit } = scene.dataset;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  const bg = scene.querySelector('.scene__bg img');
  if (bg) tl.fromTo(bg, { scale: 1.1 }, { scale: 1.0, duration: 0.5, ease: 'power2.out' }, 0)
    .to(bg, { scale: 1.06, duration: 0.5 }, 0.5);

  if (enter) veilTweens(tl, scene.querySelector('.veil--enter'), enter, 'enter');

  const arch = scene.querySelector('[data-arch]');
  if (arch) {
    tl.fromTo(arch, { clipPath: 'inset(34% 30% 30% 30% round 200px 200px 0px 0px)' },
      { clipPath: 'inset(0% 0% 0% 0% round 200px 200px 0px 0px)', duration: 0.32, ease: 'power2.out' }, 0.04)
      .fromTo(arch.querySelector('img'), { scale: 1.3 }, { scale: 1, duration: 0.5, ease: 'power1.out' }, 0.04);
  }

  const steps = [...scene.querySelectorAll('[data-step]')];
  const start = enter ? 0.14 : 0.04;
  const gap = steps.length > 1 ? (0.48 - start) / (steps.length - 1) : 0;
  steps.forEach((el, k) => stepTween(tl, el, start + k * Math.min(gap, 0.07)));

  if (!isLast) {
    tl.to(scene.querySelector('.scene__content'), { y: -40, autoAlpha: 0, duration: 0.16, ease: 'power1.in' }, 0.8);
    if (exit) veilTweens(tl, scene.querySelector('.veil--exit'), exit, 'exit');
  }
  tl.to({}, { duration: Math.max(0, 1 - tl.duration()) }); // pad to exactly 1
  return tl;
}

export default function useFrames(rootRef, opened) {
  const [index, setIndex] = useState(0);
  const state = useRef({ tls: [], scenes: [], index: 0, busy: false, queued: 0 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const s = state.current;
    const ctx = gsap.context(() => {
      s.scenes = [...root.querySelectorAll('[data-scene]')];
      s.tls = s.scenes.map((scene, i) => buildTimeline(scene, i === s.scenes.length - 1));
      s.scenes.forEach((scene, i) => gsap.set(scene, { autoAlpha: i === 0 ? 1 : 0 }));
      s.scenes.forEach((scene) => prepareSequence(scene, prefersReducedMotion()));
    }, root);
    return () => ctx.revert();
  }, [rootRef]);

  const go = useCallback((target) => {
    const s = state.current;
    if (target < 0 || target >= s.scenes.length || target === s.index) return;
    if (s.busy) { s.queued = Math.sign(target - s.index); return; }
    s.busy = true;
    gsap.killTweensOf(s.tls[s.index]); // e.g. the intro, if the guest swipes early
    finishSequence(s.scenes[s.index]);
    const from = s.index, dir = Math.sign(target - from);
    s.index = target;
    setIndex(target);
    const reduced = prefersReducedMotion();

    // The guest can swipe on once the new frame's content is mostly in;
    // the rest of its entrance then hands over to the next transition.
    const release = () => {
      if (!s.busy) return;
      s.busy = false;
      const q = s.queued; s.queued = 0;
      if (q) go(s.index + q);
    };
    const tl = gsap.timeline({ onComplete: release });
    // Frames passed over keep the state they'd have if visited in order.
    s.tls.forEach((t, i) => {
      if (i !== from && i !== target) t.progress(i < target ? 1 : 0);
    });
    if (reduced) {
      s.tls[target].progress(HOLD);
      tl.to(s.scenes[from], { autoAlpha: 0, duration: 0.35 })
        .set(s.tls[from], { progress: dir > 0 ? 1 : 0 })
        .to(s.scenes[target], { autoAlpha: 1, duration: 0.35 });
      return;
    }
    tl.to(s.tls[from], { progress: dir > 0 ? 1 : 0, duration: dir > 0 ? EXIT_S : 1.2, ease: dir > 0 ? 'power1.in' : 'power2.in' })
      .set(s.scenes[from], { autoAlpha: 0 })
      .set(s.scenes[target], { autoAlpha: 1 })
      .addLabel('in')
      .call(() => playSequence(s.scenes[target]), null, 'in+=0.8')
      .call(release, null, 'in+=1.5')
      .fromTo(s.tls[target], { progress: dir > 0 ? 0 : 1 },
        { progress: HOLD, duration: dir > 0 ? ENTER_S : 1.5, ease: 'power2.out' }, 'in');
  }, []);

  // First frame plays in as the cover dissolves.
  const intro = useCallback(() => {
    const s = state.current;
    if (prefersReducedMotion()) { s.tls[0].progress(HOLD); return; }
    gsap.to(s.tls[0], { progress: HOLD, duration: 3.6, ease: 'power2.out', delay: 0.4 });
  }, []);

  // Input: swipe, mouse wheel / trackpad, keyboard.
  useEffect(() => {
    if (!opened) return;
    const s = state.current;
    let y0 = null, x0 = 0, wheelAcc = 0, wheelT = 0;

    const onTouchStart = (e) => { y0 = e.touches[0].clientY; x0 = e.touches[0].clientX; };
    const onTouchMove = (e) => { if (e.cancelable) e.preventDefault(); }; // no rubber-banding / pull-to-refresh
    const onTouchEnd = (e) => {
      if (y0 === null) return;
      const t = e.changedTouches[0];
      const dy = y0 - t.clientY, dx = x0 - t.clientX;
      y0 = null;
      if (Math.abs(dy) > 36 && Math.abs(dy) > Math.abs(dx)) go(s.index + (dy > 0 ? 1 : -1));
    };
    const onWheel = (e) => {
      e.preventDefault();
      const now = performance.now();
      if (now - wheelT > 250) wheelAcc = 0;
      wheelT = now;
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) > 40 && !s.busy) { go(s.index + Math.sign(wheelAcc)); wheelAcc = 0; }
    };
    const onKey = (e) => {
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(s.index + 1); }
      if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); go(s.index - 1); }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
    };
  }, [opened, go]);

  return { index, count: state.current.scenes.length || 7, go, intro };
}
