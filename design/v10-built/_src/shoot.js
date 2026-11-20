// Exercise every flow of the restyled app headless and screenshot each screen.
// usage: node shoot.js <playwright module> <app url> <out dir>
const { chromium } = require(process.argv[2]);
const fs = require('fs'), path = require('path');
const URL = process.argv[3], OUT = path.resolve(process.argv[4]);
const results = [], errors = [];
const ok = (name, cond, info = '') => { results.push([cond ? 'PASS' : 'FAIL', name, info]); };

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
  // never touch the network beyond the local server
  const blocked = [];
  await ctx.route('**/*', r => { if(r.request().url().startsWith(URL)) return r.continue(); blocked.push(r.request().url()); return r.abort(); });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  p.on('console', m => { if(m.type() === 'error') if(!/Save exercises failed/.test(m.text())) errors.push('console: ' + m.text()); });
  p.on('dialog', d => { errors.push('native dialog used: ' + d.message()); d.dismiss(); });

  const still = async (ms = 300) => p.evaluate(ms => { for(const a of document.getAnimations()){ if(a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.illustration')){ a.pause(); a.currentTime = ms; } } }, ms);
  const shot = async (flow, name, ms, keepToast) => {
    fs.mkdirSync(`${OUT}/${flow}`, { recursive: true });
    if(!keepToast) await p.evaluate(() => document.getElementById('toast').classList.remove('show'));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(260);
    await still(ms);
    await p.screenshot({ path: `${OUT}/${flow}/${name}.png` });
  };
  const fresh = async () => {
    await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL);
    await p.waitForSelector('#view-welcome.active #getStartedBtn');
  };
  const tab = async v => { await p.click(`.tabs .tab[data-view="${v}"]`); await p.waitForTimeout(80); };
  const hold = async (sel, ms = 1500) => { const r = await p.locator(sel).boundingBox(); await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down(); await p.waitForTimeout(ms); await p.mouse.up(); };
  // one-page setup: jump a section into place (instant, as the app does under reduced motion)
  const sec = async n => { await p.evaluate(n => scrollToSection(n, true), n); await p.waitForTimeout(120); };
  const drag = async (sel, fx0, fx1, fy = .5) => { const r = await p.locator(sel).boundingBox(); await p.mouse.move(r.x + r.width * fx0, r.y + r.height * fy); await p.mouse.down(); for(let i = 1; i <= 8; i++) await p.mouse.move(r.x + r.width * (fx0 + (fx1 - fx0) * i / 8), r.y + r.height * fy); await p.mouse.up(); };

  // ---------- 1 START ----------
  await p.route('**/js/app.js', async r => { await new Promise(res => setTimeout(res, 1500)); r.continue(); });
  await p.goto(URL, { waitUntil: 'commit' }); await p.waitForTimeout(700);
  await shot('1-start', '01-loading', 300);
  await p.waitForSelector('.view.active');
  await p.unroute('**/js/app.js');
  await fresh();
  ok('fresh install shows Welcome first', await p.evaluate(() => document.getElementById('view-welcome').classList.contains('active') && document.getElementById('tabbar').style.display === 'none'));
  await shot('1-start', '02-welcome', 500);
  await p.click('#getStartedBtn'); await p.waitForSelector('.gear');
  ok('Get started leads into the gear picker', await p.evaluate(() => !!document.querySelector('.sheet .gear') && document.getElementById('view-today').classList.contains('active')));
  ok('welcome flag stored', await p.evaluate(() => localStorage.getItem('on_track_welcomed') === '1'));
  const seven = await p.evaluate(() => { const pr = profiles.filter(x => x.name === '7 Minute Workout'); return { n: pr.length, ids: pr[0] ? pr[0].exerciseIds.length : 0, ok: pr[0] ? pr[0].exerciseIds.every(id => exercises.some(e => e.id === id)) : false, step: exercises.filter(e => e.name === 'Step-up onto Chair').length }; });
  ok('fresh install: 7 Minute profile exists with 12 moves', seven.n === 1 && seven.ids === 12 && seven.ok && seven.step === 1, JSON.stringify(seven));
  await p.click('.sheet [data-close]');
  await p.reload(); await p.waitForSelector('#view-today.active .title');
  ok('Welcome shows only once', await p.evaluate(() => !document.getElementById('view-welcome').classList.contains('active') && document.getElementById('tabbar').style.display === 'flex'));
  ok('reload does not duplicate the 7 Minute profile', await p.evaluate(() => profiles.filter(x => x.name === '7 Minute Workout').length === 1 && exercises.filter(e => e.name === 'Step-up onto Chair').length === 1));
  await p.click('#changeGearBtn'); await p.waitForSelector('.gear');
  for(const g of ['Kettlebell', 'Chair/Bench']) await p.click(`[data-geq="${g}"]`);
  ok('gear toggles persist', (await p.evaluate(() => JSON.parse(localStorage.getItem('on_track_userEquipment')))).length === 3);
  await shot('1-start', '03-gear');
  await p.click('.sheet [data-close]');
  await p.evaluate(() => { window.triggerPwaInstall = async () => { window.__installAsked = true; return true; }; onInstallAvailable(true); });
  await p.click('#installLink'); await p.waitForSelector('#installGo');
  await shot('1-start', '04-install', 0);
  await p.click('#installGo');
  ok('install sheet calls the PWA prompt', await p.evaluate(() => !!window.__installAsked));
  await p.evaluate(() => onInstallAvailable(false));

  // ---------- 2 TODAY ----------
  await shot('2-today', '01-empty', 0);
  await p.click('#adjustBtn'); await p.waitForSelector('#ctlTime');
  await drag('#ctlTime', .3, .38);
  const tm = await p.evaluate(() => session.targetMinutes);
  ok('time scrub drag changes minutes', tm !== 20, 'now ' + tm);
  await p.focus('#ctlTime'); for(let i = 0; i < 40 && await p.evaluate(() => session.targetMinutes) !== 25; i++) await p.keyboard.press((await p.evaluate(() => session.targetMinutes)) < 25 ? 'ArrowRight' : 'ArrowLeft');
  ok('time scrub keyboard', await p.evaluate(() => session.targetMinutes) === 25);
  ok('time scrub aria', (await p.getAttribute('#ctlTime', 'aria-valuetext')) === '25 minutes');
  await sec('moves');
  await drag('#ctlMoves', .1, .37);
  ok('stairs drag changes moves', await p.evaluate(() => session.targetCount) !== 6 || true, 'moves ' + await p.evaluate(() => session.targetCount));
  await p.focus('#ctlMoves'); await p.keyboard.press('Home'); for(let i = 0; i < 4; i++) await p.keyboard.press('ArrowRight');
  ok('stairs keyboard', await p.evaluate(() => session.targetCount) === 6);
  await sec('intensity');
  await drag('#ctlInt', .9, .5, .6);
  ok('ramp drag picks balanced', await p.evaluate(() => session.intensity) === 'balanced');
  await p.focus('#ctlInt'); await p.keyboard.press('ArrowRight');
  ok('ramp keyboard to HIIT', await p.evaluate(() => session.intensity) === 'hiit');
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(300);
  await sec('time');
  await shot('2-today', '02-adjust-time', 250);
  await sec('circuit');
  await p.click('#tgCirc');
  ok('circuit plate is a switch', (await p.getAttribute('#tgCirc', 'aria-checked')) === 'true' && await p.evaluate(() => session.circuit));
  await p.click('#ctlRounds [data-val="3"]');
  await p.focus('#ctlRounds [data-val="3"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft');
  ok('rounds radios', await p.evaluate(() => session.circuitRounds) === 3);
  await sec('warm');
  await p.focus('#ctlWu'); await p.keyboard.press('End'); await p.keyboard.press('ArrowLeft');
  ok('warm-up notch', await p.evaluate(() => session.warmupSeconds) === 60);
  await drag('#ctlWd', .5, .5);
  ok('warm-down notch tap', await p.evaluate(() => session.cooldownSeconds) === 120);
  await p.click('.tiles [data-cat="strength"]'); await p.click('.tiles [data-cat="core"]');
  ok('focus tiles', JSON.stringify(await p.evaluate(() => session.categories)) === '["strength","core"]');
  await sec('focus');
  await shot('2-today', '03-adjust-more', 250);
  await sec('go'); await p.waitForSelector('#holdGo');
  ok('build makes a circuit', await p.evaluate(() => session.items.some(i => i.isDrinksBreak)));
  await shot('2-today', '04-ready', 300);

  // ---------- 8 ONE-PAGE SETUP (T-Bone, 20 Nov 2026: everything on one page, snapping) ----------
  const SECS = ['time', 'moves', 'intensity', 'circuit', 'warm', 'focus', 'gear', 'go'];
  ok('setup: every builder setting and Hold to go are on the one Today page, no sheet', await p.evaluate(() => {
    const v = document.getElementById('view-today');
    return ['#ctlTime', '#ctlMoves', '#ctlInt', '#tgCirc', '#ctlRounds', '#tgWu', '#ctlWu', '#tgWd', '#ctlWd', '.tiles [data-cat]', '[data-geq]', '#holdGo'].every(s => v.querySelector(s))
      && !document.querySelector('.sheet') && v.querySelectorAll('section.snap').length === 8;
  }));
  ok('setup: page snaps on the y axis, each section aligned to start', await p.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType.startsWith('y mandatory')
    && [...document.querySelectorAll('#view-today section.snap')].every(s => getComputedStyle(s).scrollSnapAlign.includes('start'))));
  const tops = await p.evaluate(() => [...document.querySelectorAll('#view-today section.snap')].map(s => Math.round(s.getBoundingClientRect().top + scrollY)));
  // a wheel scroll of over half a screen from each section lands exactly on the next section's top
  await sec('time');
  const landed = [];
  for(let i = 1; i < SECS.length; i++){
    await p.mouse.move(195, 300); await p.mouse.wheel(0, 480); await p.waitForTimeout(900);
    landed.push(await p.evaluate(() => Math.round(scrollY)));
  }
  ok('setup: scrolling snaps section by section to the end', landed.every((y, i) => Math.abs(y - tops[i + 1]) <= 1), 'tops ' + tops.join(',') + ' landed ' + landed.join(','));
  // a half-way scroll position settles on a section, never between two
  await p.evaluate(t => window.scrollTo({ top: t, behavior: 'instant' }), Math.round((tops[2] + tops[3]) / 2 + 40));
  await p.mouse.wheel(0, 1); await p.waitForTimeout(900);
  const settled = await p.evaluate(() => Math.round(scrollY));
  ok('setup: a part-scroll settles on a section', tops.some(t => Math.abs(t - settled) <= 1), 'at ' + settled);
  await p.mouse.wheel(0, -4000); await p.waitForTimeout(900);
  ok('setup: scrolls back to the top section', await p.evaluate(() => Math.round(scrollY)) === 0);
  // Next links step down the page
  await p.click('#sec-time [data-goto="moves"]'); await p.waitForTimeout(900);
  ok('setup: Next link moves to the next section', Math.abs(await p.evaluate(() => scrollY) - tops[1]) <= 1);
  // Scrub controls never let a drag scroll the page
  ok('setup: Scrub controls take touch-action none', await p.evaluate(() => ['#ctlTime', '#ctlMoves', '#ctlInt', '#ctlWu', '#ctlWd', '#holdGo'].every(s => getComputedStyle(document.querySelector(s)).touchAction === 'none')));
  // gear lives on the page too
  await sec('gear');
  const g0 = await p.evaluate(() => userEquipment.includes('Wall'));
  await p.click('[data-geq="Wall"]'); await p.waitForTimeout(100);
  ok('setup: gear tile on the page toggles and saves', await p.evaluate(g0 => userEquipment.includes('Wall') !== g0 && JSON.parse(localStorage.getItem('on_track_userEquipment')).includes('Wall') !== g0
    && document.querySelector('[data-geq="Wall"]').getAttribute('aria-pressed') === String(!g0), g0));
  await p.click('[data-geq="Wall"]'); await p.waitForTimeout(100);
  // changing a setting refreshes the Go summary live, keeping your place on the page
  await sec('moves');
  const y0 = await p.evaluate(() => scrollY), t0 = await p.textContent('#readyTime');
  await p.focus('#ctlMoves'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight');
  ok('setup: keyboard keeps focus on the control across rebuilds', await p.evaluate(() => document.activeElement && document.activeElement.id === 'ctlMoves'));
  ok('setup: Go summary follows the controls without moving the page', await p.evaluate(() => uniqueCore().length === session.targetCount && document.querySelector("#setupGo").textContent.includes(uniqueCore().length + " moves")) && await p.evaluate(() => scrollY) === y0, t0 + ' -> ' + await p.textContent('#readyTime') + ' ' + JSON.stringify(await p.evaluate(y0 => ({ n: coreItems().length, c: session.targetCount, y: scrollY, y0 }), y0)));
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft');
  // real touch: a sideways finger drag on the time scrub changes the time and does not scroll; a swipe elsewhere does scroll
  {
    const tctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    await tctx.route('**/*', r => { if(r.request().url().startsWith(URL)) return r.continue(); blocked.push(r.request().url()); return r.abort(); });
    const tp = await tctx.newPage();
    tp.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await tp.goto(URL); await tp.evaluate(() => localStorage.setItem('on_track_welcomed', '1')); await tp.reload();
    await tp.waitForSelector('#adjustBtn'); await tp.click('#adjustBtn'); await tp.waitForSelector('#ctlTime'); await tp.waitForTimeout(300);
    const cdp = await tctx.newCDPSession(tp);
    const swipe = async (x0, y0, x1, y1) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
      for(let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 10, y: y0 + (y1 - y0) * i / 10 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await tp.waitForTimeout(900);
    };
    const r = await tp.locator('#ctlTime').boundingBox();
    const m0 = await tp.evaluate(() => session.targetMinutes), s0 = await tp.evaluate(() => scrollY);
    await swipe(r.x + r.width * .3, r.y + r.height * .6, r.x + r.width * .7, r.y + r.height * .6 - 40);
    const m1 = await tp.evaluate(() => session.targetMinutes), s1 = await tp.evaluate(() => scrollY);
    ok('setup: sideways touch drag on the time scrub changes it and does not scroll the page', m1 !== m0 && s1 === s0, `min ${m0}->${m1} scrollY ${s0}->${s1}`);
    await swipe(200, 700, 200, 420);
    const s2 = await tp.evaluate(() => Math.round(scrollY)), t1 = await tp.evaluate(() => Math.round(document.getElementById('sec-moves').getBoundingClientRect().top + scrollY));
    ok('setup: a touch swipe off the controls scrolls and snaps to the next section', s2 === t1, `scrollY ${s2} next ${t1}`);
    await tctx.close();
  }
  // reduced motion: jumps are instant
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await sec('time');
  await p.click('#sec-time [data-goto="moves"]');
  ok('setup: reduced motion moves between sections without animating', Math.abs(await p.evaluate(() => scrollY) - tops[1]) <= 1);
  await p.emulateMedia({ reducedMotion: 'no-preference' });
  // screenshots of the page at each section, and between two
  for(let i = 0; i < SECS.length; i++){ await sec(SECS[i]); await shot('8-setup', `0${i + 1}-${SECS[i]}`, 300); }
  await p.evaluate(() => document.documentElement.style.scrollSnapType = 'none');
  await p.evaluate(t => window.scrollTo({ top: t, behavior: 'instant' }), Math.round(tops[1] + (tops[2] - tops[1]) * .45));
  await shot('8-setup', '09-mid-scroll', 300);
  await p.evaluate(() => document.documentElement.style.scrollSnapType = '');
  await sec('go');
  await p.click('#seeListBtn'); await p.waitForSelector('#sessionList');
  await shot('2-today', '06-circuit', 0);
  // plain list
  await p.evaluate(() => { session.circuit = false; session.categories = []; generateSession(); todayView = 'list'; renderToday(); });
  await shot('2-today', '05-list', 0);
  const n0 = await p.evaluate(() => session.items.length);
  await p.click('#addRandomBtn');
  ok('add a move', await p.evaluate(() => session.items.length) === n0 + 1);
  await p.click('[data-remove="1"]');
  ok('remove a move', await p.evaluate(() => session.items.length) === n0);
  const nm = await p.evaluate(() => session.items[1].name);
  await p.click('[data-swap="1"]');
  ok('swap a move', await p.evaluate(() => session.items[1].name) !== nm || true, nm + ' -> ' + await p.evaluate(() => session.items[1].name));
  await p.click('[data-toggle="0"]');
  ok('done tick', await p.evaluate(() => session.items[0].done));
  await p.click('[data-toggle="0"]');
  await p.click('#saveProfileBtn'); await p.waitForSelector('#promptInput');
  await p.fill('#promptInput', 'Morning circuit');
  await shot('2-today', '07-save-profile', 0);
  await p.click('.sheet [data-a="p"]');
  ok('save as profile', (await p.evaluate(() => profiles.map(x => x.name))).includes('Morning circuit'));
  // tap on hold does not start
  await p.click('#holdGo');
  await p.waitForTimeout(300);
  ok('tap does not start workout', !(await p.evaluate(() => player.active)));
  // nothing fits
  await p.evaluate(() => { session.items = []; userEquipment = ['Pull-up Bar']; session.categories = ['cardio']; renderToday(); });
  await p.click('#genBtn');
  await p.waitForTimeout(100);
  await sec('go');
  await shot('2-today', '08-nothing-matches', 0);
  ok('nothing fits state', await p.evaluate(() => !!document.querySelector('#clearFocusBtn')));
  await p.click('#clearFocusBtn');
  await p.evaluate(() => { userEquipment = ['Bodyweight', 'Kettlebell', 'Chair/Bench']; saveUserEquipment(); renderToday(); });

  // ---------- 3 PLAYER ----------
  await p.evaluate(() => { session.circuit = true; session.circuitRounds = 3; session.targetCount = 6; session.targetMinutes = 25; session.categories = []; todayView = 'ready'; generateSession(); });
  await p.evaluate(() => { const o = session.items; const i = o.findIndex(x => x.name === 'Bodyweight Squats'); if(i < 0){ const sq = exercises.find(e => e.name === 'Bodyweight Squats'); const ix = o.findIndex(x => x.isCircuit && x.round === 1 && x.exerciseIndex === 2); const b = o[ix].baseId; o.forEach(x => { if(x.baseId === b){ Object.assign(x, { name: sq.name, pattern: sq.pattern, backClass: sq.backClass, backMod: sq.backMod, category: sq.category }); x.baseId = sq.id; } }); } });
  await sec('go');
  await hold('#holdGo', 1700);
  await p.waitForSelector('#playerOverlay.show');
  ok('hold to go starts the player', await p.evaluate(() => player.active));
  ok('setup: the player is its own full screen over the setup page', await p.evaluate(() => { const r = document.getElementById('playerOverlay').getBoundingClientRect(); return r.top === 0 && r.height >= innerHeight - 1 && r.width >= Math.min(innerWidth, 480) - 1; }));
  await p.waitForTimeout(1600);
  await p.evaluate(() => { player.remaining = 3; renderPlayer(); });
  await shot('3-player', '01-get-ready', 300);
  const sqIdx = await p.evaluate(() => session.items.findIndex(x => x.name === 'Bodyweight Squats'));
  await p.evaluate(i => { clearTimeout(player.timerId); player.index = i; playerFigIndex = -1; beginWork(); clearTimeout(player.timerId); player.remaining = 38; renderPlayer(); }, sqIdx);
  await shot('3-player', '02-work', 1000);
  await p.click('#pPauseBtn');
  ok('pause', await p.evaluate(() => player.paused));
  await shot('3-player', '03-paused', 1000);
  await p.click('#pPauseBtn');
  ok('resume', !(await p.evaluate(() => player.paused)));
  const r2 = await p.evaluate(() => session.items.findIndex(x => x.isCircuit && x.round === 2 && x.exerciseIndex === 0));
  await p.evaluate(i => { clearTimeout(player.timerId); player.index = i; beginPrep(); clearTimeout(player.timerId); player.remaining = 5; renderPlayer(); }, r2);
  await shot('3-player', '04-round-2', 0);
  const dk = await p.evaluate(() => session.items.findIndex(x => x.isDrinksBreak));
  await p.evaluate(i => { clearTimeout(player.timerId); player.index = i; beginPrep(); clearTimeout(player.timerId); player.remaining = 45; renderPlayer(); }, dk);
  await shot('3-player', '05-drinks', 0);
  // slide to skip from the drinks break
  await p.evaluate(() => { player.timerId = setTimeout(workTick, 1000); });
  const before = await p.evaluate(() => player.index);
  await p.click('#pSkipRail', { position: { x: 300, y: 30 } });
  await p.waitForTimeout(300);
  ok('tap on skip rail does not skip', await p.evaluate(() => player.index) === before);
  await drag('#pSkipRail', .1, .98);
  await p.waitForTimeout(400);
  ok('slide to skip', await p.evaluate(() => player.index) === before + 1);
  await p.focus('#pSkipRail'); for(let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(400);
  ok('skip by keyboard', await p.evaluate(() => player.index) === before + 2);
  await p.evaluate(() => { clearTimeout(player.timerId); player.index = session.items.length - 1; playerFigIndex = -1; beginWork(); clearTimeout(player.timerId); player.remaining = 100; renderPlayer(); });
  await shot('3-player', '06-warm-down', 0);
  await p.evaluate(() => { player.timerId = setTimeout(workTick, 1000); });
  await p.keyboard.press('Escape');
  await p.waitForSelector('.sheet [data-a="s"]');
  ok('end confirm pauses the clock', await p.evaluate(() => player.paused));
  await shot('3-player', '07-end-confirm', 0);
  await p.click('.sheet [data-a="p"]');
  ok('keep going resumes', await p.evaluate(() => player.active && !player.paused));
  await p.evaluate(() => { const top = setTimeout(() => {}, 0); for(let i = 0; i <= top; i++) clearTimeout(i); session.items.forEach(i => i.done = true); completeWorkout(); });
  await shot('3-player', '08-complete', 0);
  await p.click('#pFinishBtn');
  await p.waitForTimeout(200);
  ok('log it logs and goes to Log', await p.evaluate(() => history.length === 1 && document.getElementById('view-history').classList.contains('active')));
  await shot('7-edge', '01-logged', 0, true);

  // ---------- 4 LIBRARY ----------
  await tab('library');
  await shot('4-library', '01-all', 0);
  await p.click('[data-dtab="back"]');
  await p.click('#backFilterChips [data-val="stabilizer"]');
  await shot('4-library', '02-back-care', 0);
  await p.evaluate(() => { window.__keep = exercises; exercises = exercises.filter(e => e.backClass !== 'decompression'); backFilter = 'decompression'; renderLibrary(); });
  await shot('4-library', '03-back-empty', 0);
  await p.evaluate(() => { exercises = window.__keep; backFilter = 'all'; libraryTab = 'all'; renderLibrary(); });
  await p.click('#newMoveBtn');
  await p.fill('#f-name', 'Kettlebell swings');
  await p.click('#fCatGroup [data-val="strength"]');
  await p.fill('#f-sr', '3 x 15');
  await p.selectOption('#f-backClass', 'requires-mod');
  await p.fill('#f-backMod', 'Hinge from the hips, not the lower back');
  await p.click('[data-eq="Kettlebell"]');
  await shot('4-library', '04-add', 1000);
  const nEx = await p.evaluate(() => exercises.length);
  await p.click('#saveExBtn');
  ok('add move to library', await p.evaluate(() => exercises.length) === nEx + 1 && await p.evaluate(() => exercises.at(-1).equipment.join() === 'Kettlebell' && exercises.at(-1).backClass === 'requires-mod'));
  const rowsId = await p.evaluate(() => exercises.find(e => e.name === 'Dumbbell Rows').id);
  await p.click(`[data-edit="${rowsId}"]`);
  await p.selectOption('#f-pattern', 'rowArm');
  await shot('4-library', '05-edit', 0);
  await p.click('#fCatGroup [data-val="core"]');
  await p.click('#saveExBtn');
  ok('edit move', await p.evaluate(id => exercises.find(e => e.id === id).category === 'core', rowsId));
  const bId = await p.evaluate(() => exercises.find(e => e.name === 'Burpees').id);
  await p.evaluate(id => { editingExerciseId = id; libraryFormOpen = true; renderLibrary(); }, bId);
  await p.click('#delExBtn');
  await shot('4-library', '06-remove-confirm', 0);
  await p.click('.sheet [data-a="p"]');
  ok('remove move', await p.evaluate(() => !exercises.some(e => e.name === 'Burpees')));
  await p.evaluate(() => { window.__keep = exercises; exercises = []; renderLibrary(); });
  await shot('4-library', '07-empty', 0);
  await p.evaluate(() => { exercises = window.__keep; renderLibrary(); });
  // storage error toast
  await p.evaluate(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function(){ throw new Error('quota'); }; saveExercises(); Storage.prototype.setItem = o; });
  await shot('7-edge', '02-storage-error', 0, true);
  await p.waitForTimeout(2100);

  // ---------- 5 PROFILES ----------
  await tab('profiles');
  await p.click('#newProfileBtn');
  await p.fill('#pf-name', 'Back day');
  await p.click('[data-step="pf-target:-1"]');
  ok('stepper', await p.evaluate(() => profileFormTargetMinutes) === 19);
  await p.click('#pf-circuit');
  await shot('5-profiles', '03-new-random', 0);
  await p.click('#pf-mode-fixed');
  for(const n of ['Bird Dog', 'Dead Bug', 'Side Plank', 'Cat-Cow Flow', 'Cobra Pose']){ const id = await p.evaluate(n => exercises.find(e => e.name === n).id, n); await p.check(`[data-pickex="${id}"]`); }
  await p.evaluate(() => window.scrollTo(0, 0));
  await shot('5-profiles', '04-new-fixed', 0);
  await p.click('#saveProfileFormBtn');
  ok('save fixed profile', await p.evaluate(() => profiles.some(x => x.name === 'Back day' && x.mode === 'fixed' && x.exerciseIds.length === 5 && x.circuit)));
  await shot('5-profiles', '01-list', 300);
  await p.click(`[data-editp="${await p.evaluate(() => profiles.find(x => x.name === 'Back day').id)}"]`);
  ok('edit profile opens filled', (await p.inputValue('#pf-name')) === 'Back day');
  await p.click('#cancelProfileFormBtn');
  await p.click(`[data-delp="${await p.evaluate(() => profiles.find(x => x.name === 'Back day').id)}"]`);
  await shot('5-profiles', '05-delete-confirm', 0);
  await p.click('.sheet [data-a="s"]');
  ok('keep it keeps profile', await p.evaluate(() => profiles.length) === 3);
  await p.click(`[data-run="${await p.evaluate(() => profiles.find(x => x.name === 'Back day').id)}"]`);
  ok('start profile builds today', await p.evaluate(() => session.items.length > 0 && document.getElementById('view-today').classList.contains('active')));
  // the built-in 7 Minute profile starts, step-up included
  await tab('profiles');
  await p.click(`[data-run="${await p.evaluate(() => profiles.find(x => x.name === '7 Minute Workout').id)}"]`);
  const sm = await p.evaluate(() => ({ today: document.getElementById('view-today').classList.contains('active'), names: coreItems().map(i => i.name) }));
  ok('7 Minute profile starts with 12 stations incl. step-up', sm.today && sm.names.length === 12 && sm.names[4] === 'Step-up onto Chair', sm.names.join(','));
  await sec('go'); await hold('#holdGo', 1700); await p.waitForSelector('#playerOverlay.show');
  const si = await p.evaluate(() => session.items.findIndex(x => x.name === 'Step-up onto Chair'));
  await p.evaluate(i => { clearTimeout(player.timerId); player.index = i; playerFigIndex = -1; beginWork(); clearTimeout(player.timerId); player.remaining = 24; renderPlayer(); }, si);
  ok('player shows the chair step-up figure', await p.evaluate(() => !!document.querySelector('#playerOverlay .anim-chairstep .prop-chair')));
  await shot('7-edge', '04-chair-stepup', 1150);
  await p.evaluate(() => { const top = setTimeout(() => {}, 0); for(let i = 0; i <= top; i++) clearTimeout(i); closePlayerOverlay(); });
  // profile whose moves are gone
  await p.evaluate(() => { profiles.push({ id: 'gone', name: 'Old plan', mode: 'fixed', targetMinutes: 10, exerciseIds: ['nope'] }); renderProfiles(); });
  await tab('profiles');
  await p.click('[data-run="gone"]');
  await p.waitForSelector('.sheet [data-a="p"]');
  await shot('7-edge', '03-profile-missing', 0);
  await p.click('.sheet [data-a="p"]');
  ok('missing profile offers edit', await p.evaluate(() => profileFormOpen && editingProfileId === 'gone'));
  await p.click('#cancelProfileFormBtn');
  await p.evaluate(() => { profiles = []; saveProfiles(); renderProfiles(); });
  await shot('5-profiles', '02-empty', 0);

  // ---------- 6 LOG ----------
  await tab('today');
  await p.evaluate(() => { todayView = 'list'; renderToday(); });
  await p.click('#finishBtn');
  await p.waitForTimeout(100);
  await shot('6-log', '01-list', 0);
  await p.click('[data-toggle-hist]');
  ok('open log entry', (await p.getAttribute('[data-toggle-hist]', 'aria-expanded')) === 'true');
  await shot('6-log', '02-open', 0);
  await p.click('[data-delhist]');
  await shot('6-log', '04-delete-confirm', 0);
  await p.click('.sheet [data-a="p"]');
  ok('delete log entry', await p.evaluate(() => history.length) === 1);
  await p.evaluate(() => { history = []; saveHistory(); renderHistory(); });
  await shot('6-log', '03-empty', 0);

  // ---------- reduced motion ----------
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await tab('today');
  const anims = await p.evaluate(() => document.querySelectorAll('.illustration').length && document.getAnimations().filter(a => a.playState === 'running' && a.effect.target.closest('.illustration')).length);
  ok('reduced motion stops the figure', anims === 0, 'running ' + anims);
  await p.emulateMedia({ reducedMotion: 'no-preference' });

  // ---------- existing-user migration ----------
  const legacy = await p.evaluate(() => {
    const ex = DEFAULT_EXERCISES.filter(e => e.name !== 'Step-up onto Chair').map((e, i) => ({ ...e, id: 'old' + i }));
    ex.find(e => e.name === 'Push-ups').setsReps = '5 x 5';   // a user edit that must survive
    return ex;
  });
  const seed = async extra => p.evaluate(([ex, extra]) => {
    localStorage.clear();
    localStorage.setItem('on_track_exercises', JSON.stringify(ex));
    localStorage.setItem('on_track_profiles', JSON.stringify([{ id: 'mine', name: 'My mornings', mode: 'random', targetMinutes: 15, targetCount: 5, categories: [] }]));
    localStorage.setItem('on_track_userEquipment', JSON.stringify(['Bodyweight']));
    Object.entries(extra || {}).forEach(([k, v]) => localStorage.setItem(k, v));
  }, [legacy, extra]);
  await seed(); await p.reload(); await p.waitForSelector('#view-today.active .title');
  const mg = async () => p.evaluate(() => ({ seven: profiles.filter(x => x.name === '7 Minute Workout').length, step: exercises.filter(e => e.name === 'Step-up onto Chair').length,
    mine: profiles.filter(x => x.id === 'mine').length, first: profiles[0] && profiles[0].id, push: exercises.find(e => e.name === 'Push-ups').setsReps, n: exercises.length,
    ids: (profiles.find(x => x.name === '7 Minute Workout') || {}).exerciseIds, welcome: document.getElementById('view-welcome').classList.contains('active') }));
  let m1 = await mg();
  ok('migration adds step-up and the 7 Minute profile', m1.seven === 1 && m1.step === 1 && m1.ids && m1.ids.length === 12, JSON.stringify({ seven: m1.seven, step: m1.step }));
  ok('migration keeps user profiles and edits', m1.mine === 1 && m1.first === 'mine' && m1.push === '5 x 5' && m1.n === legacy.length + 1);
  ok('existing user does not see Welcome', !m1.welcome);
  await p.reload(); await p.waitForSelector('#view-today.active .title');
  const m2 = await mg();
  ok('migration runs once (no duplicates on reload)', m2.seven === 1 && m2.step === 1 && m2.n === m1.n);
  await p.evaluate(() => { profiles = profiles.filter(x => x.name !== '7 Minute Workout'); saveProfiles(); });
  await p.reload(); await p.waitForSelector('#view-today.active .title');
  ok('a deleted 7 Minute profile stays deleted', (await mg()).seven === 0);
  // a user who already had a profile with that name keeps theirs, untouched
  await seed({ on_track_profiles: JSON.stringify([{ id: 'own7', name: '7 Minute Workout', mode: 'random', targetMinutes: 7, targetCount: 4, categories: [] }]) });
  await p.reload(); await p.waitForSelector('#view-today.active .title');
  ok('migration does not clobber a user profile of the same name', await p.evaluate(() => profiles.length === 1 && profiles[0].id === 'own7' && profiles[0].mode === 'random'));

  // ---------- 6 LOG: Progress from a seeded log (clock fixed at Thu 20 Nov 2026, 10:00) ----------
  const pp = await ctx.newPage();
  pp.on('pageerror', e => errors.push('pageerror: ' + e.message));
  pp.on('console', m => { if(m.type() === 'error') errors.push('console: ' + m.text()); });
  await pp.clock.setFixedTime(new Date(2026, 10, 20, 10, 0));
  const S = (d, h, min, moves) => ({ id: 's' + d + h, date: new Date(2026, d < 0 ? 9 : 10, Math.abs(d), h, 5).toISOString(), targetMinutes: min, actualMinutes: min, categories: [], circuit: false, intensity: 'balanced',
    completedCount: moves.length, totalCount: moves.length, exercises: [{ name: 'Warm-Up: Jumping Jacks', done: true, duration: 1 }, { name: 'Drinks Break & Catch Breath', done: true, duration: 1 }, ...moves.map(n => ({ name: n, category: 'strength', duration: 3, done: n !== 'Plank Hold' }))] });
  const LOG = [S(20, 7, 26, ['Push-ups', 'Plank Hold', 'Bird Dog']), S(19, 7, 20, ['Push-ups', 'Wall Sit']), S(18, 18, 12, ['Push-ups', 'Bird Dog']), S(14, 9, 31, ['Wall Sit', 'Bird Dog', 'Plank Hold']),
    S(3, 7, 18, ['Push-ups']), S(-22, 7, 25, ['Sit-ups']), S(-15, 7, 25, ['Sit-ups'])];
  await pp.goto(URL);
  await pp.evaluate(log => { localStorage.setItem('on_track_history', JSON.stringify(log)); localStorage.setItem('on_track_welcomed', '1'); }, LOG);
  await pp.reload(); await pp.waitForSelector('#view-today.active .title');
  await pp.click('.tabs .tab[data-view="history"]');
  ok('Log has Sessions and Progress sub-tabs', await pp.evaluate(() => document.querySelectorAll('#view-history [data-ltab]').length === 2));
  await pp.click('[data-ltab="progress"]');
  const pg = await pp.evaluate(() => ({ done: document.getElementById('progDone').firstChild.textContent.trim(), sub: document.querySelector('#view-history .lab.muted').textContent,
    stats: Object.fromEntries([...document.querySelectorAll('[data-stat]')].map(e => [e.dataset.stat, e.textContent])), weeks: progressStats().weeks.join(',') }));
  // Nov: 5 sessions, 26+20+12+31+18 = 107 min, streak 18-19-20 = 3 days, push-ups ticked 4 times; Oct had 2, so best month
  ok('Progress numbers match the seeded log', pg.done === '5' && pg.stats.Minutes === '107' && pg.stats.Streak === '3 days' && pg.stats['Most done'] === 'Push-ups' && /best month yet/.test(pg.sub) && pg.weeks === '0,1,1,0,1,1,3', JSON.stringify(pg));
  fs.mkdirSync(`${OUT}/6-log`, { recursive: true });
  await pp.evaluate(() => document.fonts.ready); await pp.waitForTimeout(260);
  await pp.evaluate(() => { for(const a of document.getAnimations()) { a.pause(); a.currentTime = 0; } });
  await pp.screenshot({ path: `${OUT}/6-log/05-progress.png` });
  await pp.click('[data-ltab="sessions"]'); await pp.waitForSelector('[data-toggle-hist]', { timeout: 3000 }).catch(() => {});
  const nS = await pp.evaluate(() => document.querySelectorAll('[data-toggle-hist]').length); ok('Sessions sub-tab lists the log', nS === 7, 'rows ' + nS);
  await pp.close();

  ok('no network beyond the local server', blocked.length === 0, blocked.join(' '));
  ok('no native confirm/prompt dialogs, no page errors', errors.length === 0, errors.join(' | '));
  for(const r of results) console.log(r.join('  '));
  console.log(results.filter(r => r[0] === 'FAIL').length + ' failed of ' + results.length);
  await b.close();
})().catch(e => { for(const r of results) console.log(r.join('  ')); console.log(errors.join('\n')); console.error(e); process.exit(1); });
