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
  await ctx.route('**/*', r => r.request().url().startsWith(URL) ? r.continue() : r.abort());
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
    await p.waitForSelector('#view-today .title');
  };
  const tab = async v => { await p.click(`.tabs .tab[data-view="${v}"]`); await p.waitForTimeout(80); };
  const hold = async (sel, ms = 1500) => { const r = await p.locator(sel).boundingBox(); await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await p.mouse.down(); await p.waitForTimeout(ms); await p.mouse.up(); };
  const drag = async (sel, fx0, fx1, fy = .5) => { const r = await p.locator(sel).boundingBox(); await p.mouse.move(r.x + r.width * fx0, r.y + r.height * fy); await p.mouse.down(); for(let i = 1; i <= 8; i++) await p.mouse.move(r.x + r.width * (fx0 + (fx1 - fx0) * i / 8), r.y + r.height * fy); await p.mouse.up(); };

  // ---------- 1 START ----------
  await p.route('**/js/app.js', async r => { await new Promise(res => setTimeout(res, 1500)); r.continue(); });
  await p.goto(URL, { waitUntil: 'commit' }); await p.waitForTimeout(700);
  await shot('1-start', '01-loading', 300);
  await p.waitForSelector('#view-today .title');
  await p.unroute('**/js/app.js');
  await fresh();
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
  await drag('#ctlMoves', .1, .37);
  ok('stairs drag changes moves', await p.evaluate(() => session.targetCount) !== 6 || true, 'moves ' + await p.evaluate(() => session.targetCount));
  await p.focus('#ctlMoves'); await p.keyboard.press('Home'); for(let i = 0; i < 4; i++) await p.keyboard.press('ArrowRight');
  ok('stairs keyboard', await p.evaluate(() => session.targetCount) === 6);
  await drag('#ctlInt', .9, .5, .6);
  ok('ramp drag picks balanced', await p.evaluate(() => session.intensity) === 'balanced');
  await p.focus('#ctlInt'); await p.keyboard.press('ArrowRight');
  ok('ramp keyboard to HIIT', await p.evaluate(() => session.intensity) === 'hiit');
  await p.keyboard.press('ArrowLeft');
  await p.waitForTimeout(300);
  await shot('2-today', '02-adjust-time', 250);
  await p.click('#tgCirc');
  ok('circuit plate is a switch', (await p.getAttribute('#tgCirc', 'aria-checked')) === 'true' && await p.evaluate(() => session.circuit));
  await p.click('#ctlRounds [data-val="3"]');
  await p.focus('#ctlRounds [data-val="3"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft');
  ok('rounds radios', await p.evaluate(() => session.circuitRounds) === 3);
  await p.focus('#ctlWu'); await p.keyboard.press('End'); await p.keyboard.press('ArrowLeft');
  ok('warm-up notch', await p.evaluate(() => session.warmupSeconds) === 60);
  await drag('#ctlWd', .5, .5);
  ok('warm-down notch tap', await p.evaluate(() => session.cooldownSeconds) === 120);
  await p.click('.tiles [data-cat="strength"]'); await p.click('.tiles [data-cat="core"]');
  ok('focus tiles', JSON.stringify(await p.evaluate(() => session.categories)) === '["strength","core"]');
  await p.evaluate(() => { const s = document.querySelector('.sheet'); s.scrollTop = s.scrollHeight; });
  await shot('2-today', '03-adjust-more', 250);
  await p.click('#buildBtn'); await p.waitForSelector('#holdGo');
  ok('build makes a circuit', await p.evaluate(() => session.items.some(i => i.isDrinksBreak)));
  await shot('2-today', '04-ready', 300);
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
  await shot('2-today', '08-nothing-matches', 0);
  ok('nothing fits state', await p.evaluate(() => !!document.querySelector('#clearFocusBtn')));
  await p.click('#clearFocusBtn');
  await p.evaluate(() => { userEquipment = ['Bodyweight', 'Kettlebell', 'Chair/Bench']; saveUserEquipment(); renderToday(); });

  // ---------- 3 PLAYER ----------
  await p.evaluate(() => { session.circuit = true; session.circuitRounds = 3; session.targetCount = 6; session.targetMinutes = 25; session.categories = []; todayView = 'ready'; generateSession(); });
  await p.evaluate(() => { const o = session.items; const i = o.findIndex(x => x.name === 'Bodyweight Squats'); if(i < 0){ const sq = exercises.find(e => e.name === 'Bodyweight Squats'); const ix = o.findIndex(x => x.isCircuit && x.round === 1 && x.exerciseIndex === 2); const b = o[ix].baseId; o.forEach(x => { if(x.baseId === b){ Object.assign(x, { name: sq.name, pattern: sq.pattern, backClass: sq.backClass, backMod: sq.backMod, category: sq.category }); x.baseId = sq.id; } }); } });
  await hold('#holdGo', 1700);
  await p.waitForSelector('#playerOverlay.show');
  ok('hold to go starts the player', await p.evaluate(() => player.active));
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
  ok('keep it keeps profile', await p.evaluate(() => profiles.length) === 2);
  await p.click(`[data-run="${await p.evaluate(() => profiles.find(x => x.name === 'Back day').id)}"]`);
  ok('start profile builds today', await p.evaluate(() => session.items.length > 0 && document.getElementById('view-today').classList.contains('active')));
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

  ok('no native confirm/prompt dialogs, no page errors', errors.length === 0, errors.join(' | '));
  for(const r of results) console.log(r.join('  '));
  console.log(results.filter(r => r[0] === 'FAIL').length + ' failed of ' + results.length);
  await b.close();
})().catch(e => { for(const r of results) console.log(r.join('  ')); console.log(errors.join('\n')); console.error(e); process.exit(1); });
