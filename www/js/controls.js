/* ---------------- Scrub controls (design/v9/direction-1) ----------------
   The type is the control: drag the giant number, run a thumb up the steps,
   push T-Bone up the ramp. Every control is also a proper ARIA widget:
   sliders take arrows / Page / Home / End, holds take a held Space or Enter,
   and the skip plate takes ArrowRight / End. */

const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
const fracX = (e, r) => clampN((e.clientX - r.left) / r.width, 0, 0.9999);

// Slider-like scrub. map(event, rect) -> value. set(v) is called only on change.
function bindScrub(el, { min, max, step = 1, page, get, set, map, text, label, onEnd }){
  el.tabIndex = 0;
  el.dataset.ctl = 'scrub';
  el.setAttribute('role', 'slider');
  el.setAttribute('aria-label', label);
  el.setAttribute('aria-valuemin', min);
  el.setAttribute('aria-valuemax', max);
  const sync = () => {
    const v = get();
    el.setAttribute('aria-valuenow', v);
    el.setAttribute('aria-valuetext', text ? text(v) : String(v));
  };
  const apply = v => {
    v = clampN(v, min, max);
    if(v !== get()) set(v);
    sync();
  };
  el.addEventListener('pointerdown', e => {
    if(e.button > 0) return;
    e.preventDefault();
    el.focus({ preventScroll: true });
    try { el.setPointerCapture(e.pointerId); } catch(_){}
    el.classList.add('grab');
    const mv = ev => apply(map(ev, el.getBoundingClientRect()));
    const up = () => {
      el.removeEventListener('pointermove', mv);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.classList.remove('grab');
      if(onEnd) onEnd(get());
    };
    mv(e);
    el.addEventListener('pointermove', mv);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });
  el.addEventListener('keydown', e => {
    let v = get();
    const big = page || step * 5;
    switch(e.key){
      case 'ArrowRight': case 'ArrowUp': v += step; break;
      case 'ArrowLeft': case 'ArrowDown': v -= step; break;
      case 'PageUp': v += big; break;
      case 'PageDown': v -= big; break;
      case 'Home': v = min; break;
      case 'End': v = max; break;
      default: return;
    }
    e.preventDefault();
    apply(v);
    if(onEnd) onEnd(get());
  });
  sync();
  return { sync };
}

// Hold-to-go. A tap does nothing but explain; only a full hold fires onDone.
function bindHold(el, { ms = 1200, onProgress, onDone, onTap }){
  let v = 0, down = false, raf = 0, t0 = 0, fired = false, pressedAt = 0;
  el.dataset.ctl = 'hold';
  const paint = () => { el.style.setProperty('--hold', v); if(onProgress) onProgress(v); };
  const step = now => {
    const dt = now - t0; t0 = now;
    v = down ? Math.min(1, v + dt / ms) : Math.max(0, v - dt / 250);
    paint();
    if(v >= 1){ down = false; fired = true; onDone(); return; }
    if(down || v > 0) raf = requestAnimationFrame(step);
  };
  const run = d => {
    if(fired) return;
    down = d;
    cancelAnimationFrame(raf);
    t0 = performance.now();
    raf = requestAnimationFrame(step);
  };
  el.addEventListener('pointerdown', e => { if(e.button > 0) return; e.preventDefault(); pressedAt = performance.now(); run(true); });
  ['pointerup','pointerleave','pointercancel'].forEach(t => el.addEventListener(t, () => { if(down) run(false); }));
  el.addEventListener('contextmenu', e => e.preventDefault());
  el.addEventListener('keydown', e => {
    if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); if(!e.repeat){ pressedAt = performance.now(); run(true); } }
  });
  el.addEventListener('keyup', e => { if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); if(down) run(false); } });
  el.addEventListener('click', e => {
    e.preventDefault();
    if(!fired && onTap && performance.now() - pressedAt < 400) onTap();
  });
  return { reset(){ fired = false; v = 0; paint(); } };
}

// Slide-the-plate. Must be dragged from the thumb, so a stray tap never fires.
function bindSlide(el, { label, onDone, text }){
  let v = 0, busy = false;
  el.tabIndex = 0;
  el.dataset.ctl = 'slide';
  el.setAttribute('role', 'slider');
  el.setAttribute('aria-label', label);
  el.setAttribute('aria-valuemin', 0);
  el.setAttribute('aria-valuemax', 100);
  const paint = () => {
    el.style.setProperty('--v', v);
    el.setAttribute('aria-valuenow', Math.round(v * 100));
    el.setAttribute('aria-valuetext', v >= 1 ? 'Skipped' : (text ? text() : label));
  };
  const finish = () => {
    if(v >= 0.85){
      v = 1; paint(); busy = true;
      setTimeout(() => { v = 0; el.classList.add('spring'); paint(); busy = false; onDone(); }, 120);
    } else {
      v = 0; el.classList.add('spring'); paint();
    }
  };
  el.addEventListener('pointerdown', e => {
    if(e.button > 0 || busy) return;
    const r = el.getBoundingClientRect();
    const thumbRight = r.left + 4 + v * (r.width - 80) + 76;
    if(e.clientX > thumbRight + 8) return; // not on the plate
    e.preventDefault();
    el.focus({ preventScroll: true });
    try { el.setPointerCapture(e.pointerId); } catch(_){}
    el.classList.remove('spring');
    const startX = e.clientX, startV = v;
    const mv = ev => { v = clampN(startV + (ev.clientX - startX) / (r.width - 80), 0, 1); paint(); };
    const up = () => {
      el.removeEventListener('pointermove', mv);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      finish();
    };
    el.addEventListener('pointermove', mv);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });
  el.addEventListener('keydown', e => {
    if(busy) return;
    if(e.key === 'ArrowRight' || e.key === 'ArrowUp'){ v = clampN(v + 0.34, 0, 1); }
    else if(e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'Home'){ v = 0; }
    else if(e.key === 'End'){ v = 1; }
    else return;
    e.preventDefault();
    el.classList.add('spring');
    paint();
    if(v >= 1){ v = 0.99; finish(); }
  });
  paint();
  return { refresh: paint };
}

// Radio group with roving tabindex and arrow keys.
function bindRadios(group, { get, set, label }){
  group.setAttribute('role', 'radiogroup');
  if(label) group.setAttribute('aria-label', label);
  const items = [...group.querySelectorAll('[data-val]')];
  const sync = () => items.forEach(b => {
    const on = String(get()) === b.dataset.val;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', on);
    b.classList.toggle('on', on);
    b.tabIndex = on ? 0 : -1;
  });
  items.forEach((b, i) => {
    b.addEventListener('click', () => { set(b.dataset.val); sync(); });
    b.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if(!d) return;
      e.preventDefault();
      const n = items[(i + d + items.length) % items.length];
      set(n.dataset.val); sync(); n.focus();
    });
  });
  sync();
  if(!items.some(b => String(get()) === b.dataset.val) && items[0]) items[0].tabIndex = 0;
  return { sync };
}
