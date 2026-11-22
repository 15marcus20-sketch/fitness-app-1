let exercises = [];
let history = [];
let profiles = [];
let userEquipment = [];
let session = { 
  targetMinutes: 20, 
  targetCount: 6, 
  intensity: 'balanced', // 'steady', 'balanced', 'hiit'
  circuit: false,
  circuitRounds: 3,
  warmup: true,
  warmupSeconds: 60,
  cooldown: true,
  cooldownSeconds: 120,
  categories: [], 
  items: [] 
};
let libraryTab = 'all'; // 'all' or 'back'
let backFilter = 'all'; // 'all', 'spine-friendly', 'stabilizer', 'decompression', 'requires-mod'
let editingExerciseId = null;
let exerciseFormEquipment = [];
let editingProfileId = null;
let profileFormOpen = false;
let profileFormMode = 'random';
let profileFormCount = 6;
let profileFormTargetMinutes = 20;
let profileFormIntensity = 'balanced';
let profileFormCircuit = false;
let profileFormCircuitRounds = 3;
let profileFormName = '';
let profileFormCategories = [];
let profileFormExerciseIds = [];

function makeWarmupItem(seconds){
  return {
    id: 'warmup-' + uid(),
    baseId: 'warmup',
    name: 'Warm-Up: Jumping Jacks',
    category: 'cardio',
    duration: Math.max(1, Math.round(seconds/60)),
    workSeconds: seconds,
    restSeconds: 10,
    setsReps: `${seconds}s light pace`,
    equipment: ['Bodyweight'],
    pattern: 'jumpingjack',
    backClass: 'spine-friendly',
    backMod: 'Land lightly on balls of feet with knees soft.',
    isWarmup: true,
    done: false
  };
}

function makeCooldownItem(seconds){
  return {
    id: 'cooldown-' + uid(),
    baseId: 'cooldown',
    name: 'Warm-Down: Yoga Stretch & Mobility',
    category: 'mobility',
    duration: Math.max(1, Math.round(seconds/60)),
    workSeconds: seconds,
    restSeconds: 0,
    setsReps: `${Math.round(seconds/60)} min full-body stretch`,
    equipment: ['Bodyweight'],
    pattern: 'catcow',
    backClass: 'decompression',
    backMod: 'Gentle spinal decompression. Breathe deeply into the lower back and chest.',
    isCooldown: true,
    done: false
  };
}

function makeDrinksBreakItem(roundJustCompleted, nextRound, seconds = 45){
  return {
    id: 'drinks-' + roundJustCompleted + '-' + uid(),
    baseId: 'drinks',
    name: 'Drinks Break & Catch Breath',
    category: 'mobility',
    duration: Math.max(1, Math.round(seconds / 60)),
    workSeconds: seconds,
    restSeconds: 0,
    setsReps: `${seconds}s hydration pause`,
    equipment: ['Bodyweight'],
    pattern: 'stretch',
    isDrinksBreak: true,
    roundJustCompleted: roundJustCompleted,
    nextRound: nextRound,
    done: false
  };
}

function getDrinksBreakSeconds(intensity){
  if(intensity === 'steady') return 60;
  if(intensity === 'hiit') return 30;
  return 45; // balanced
}

function getTimingForSlot(slotSec, intensity){
  let restRatio, minRest, maxRest;
  if(intensity === 'steady'){
    restRatio = 0.35;
    minRest = 15;
    maxRest = 60;
  } else if(intensity === 'hiit'){
    restRatio = 0.12;
    minRest = 8;
    maxRest = 20;
  } else {
    // balanced default
    restRatio = 0.22;
    minRest = 12;
    maxRest = 35;
  }
  const rest = Math.max(minRest, Math.min(maxRest, Math.round(slotSec * restRatio)));
  const work = Math.max(12, slotSec - rest);
  return { work, rest };
}

function getWorkoutFormula(targetMins, targetCount, isCircuit, rounds, intensity, hasWarmup, warmupSec, hasCooldown, cdSec){
  const wSec = hasWarmup ? (warmupSec + 10) : 0;
  const cSec = hasCooldown ? cdSec : 0;
  const drinksSec = getDrinksBreakSeconds(intensity);
  const totalDrinksTime = (isCircuit && rounds > 1) ? ((rounds - 1) * drinksSec) : 0;
  const availSec = Math.max(60, (targetMins * 60) - wSec - cSec - totalDrinksTime);
  const intLabel = intensity === 'steady' ? 'Steady' : intensity === 'hiit' ? 'HIIT' : 'Balanced';

  if(isCircuit){
    const totalSlots = Math.max(1, targetCount * rounds);
    const slotSec = Math.floor(availSec / totalSlots);
    const { work, rest } = getTimingForSlot(slotSec, intensity);
    return `🔄 Circuit (${intLabel}): ${rounds} Rounds × ${targetCount} Moves · ~${work}s work / ${rest}s rest · ${drinksSec}s Drinks Break`;
  } else {
    const totalSlots = Math.max(1, targetCount);
    const slotSec = Math.floor(availSec / totalSlots);
    const { work, rest } = getTimingForSlot(slotSec, intensity);
    if(work >= 60){
      const m = Math.floor(work / 60), s = work % 60;
      const timeStr = s > 0 ? `${m}m ${s}s` : `${m}m`;
      return `⚡ Standard (${intLabel}): ${targetCount} Moves · ~${timeStr} work / ${rest}s rest each`;
    }
    return `⚡ Standard (${intLabel}): ${targetCount} Moves · ~${work}s work / ${rest}s rest each`;
  }
}

/* ---------------- Toast ---------------- */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2000);
}

/* ---------------- Navigation ---------------- */
function setView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>{
    t.classList.toggle('active', t.dataset.view===name);
    if(t.dataset.view===name) t.setAttribute('aria-current','page'); else t.removeAttribute('aria-current');
  });
  window.scrollTo(0,0);
}

/* ---------------- Equipment / pool helpers ---------------- */
function equipmentOk(ex){
  return (ex.equipment||[]).every(tag => userEquipment.includes(tag));
}
function poolFor(categories){
  return exercises.filter(e => (categories.length===0 || categories.includes(e.category)) && equipmentOk(e));
}

function generateItemsFor(cfg){
  const pool = poolFor(cfg.categories || []);
  if(pool.length === 0) return [];

  const shuffled = [...pool].sort(()=>Math.random()-0.5);
  const picked = shuffled.slice(0, cfg.targetCount);
  if(picked.length === 0) return [];

  const warmupSec = cfg.warmup ? (cfg.warmupSeconds + 10) : 0;
  const cooldownSec = cfg.cooldown ? cfg.cooldownSeconds : 0;
  const intensity = cfg.intensity || 'balanced';

  if(cfg.circuit){
    const rounds = cfg.circuitRounds || 3;
    const drinksSec = getDrinksBreakSeconds(intensity);
    const totalDrinksTime = (rounds > 1) ? ((rounds - 1) * drinksSec) : 0;
    const availSec = Math.max(60, (cfg.targetMinutes * 60) - warmupSec - cooldownSec - totalDrinksTime);
    const totalSlots = picked.length * rounds;
    const slotSec = Math.floor(availSec / totalSlots);
    const { work, rest } = getTimingForSlot(slotSec, intensity);

    const result = [];
    for(let r = 1; r <= rounds; r++){
      picked.forEach((ex, exIdx) => {
        result.push({
          ...ex,
          id: 'circuit-' + r + '-' + ex.id,
          baseId: ex.id,
          round: r,
          totalRounds: rounds,
          exerciseIndex: exIdx,
          exerciseTotal: picked.length,
          workSeconds: work,
          restSeconds: rest,
          duration: +(slotSec / 60).toFixed(2),
          setsReps: `Round ${r}/${rounds}`,
          isCircuit: true,
          done: false
        });
      });
      // Insert Drinks Break between rounds (not after final round)
      if(r < rounds){
        result.push(makeDrinksBreakItem(r, r + 1, drinksSec));
      }
    }
    return result;
  } else {
    const totalSlots = picked.length;
    const availSec = Math.max(60, (cfg.targetMinutes * 60) - warmupSec - cooldownSec);
    const slotSec = Math.floor(availSec / totalSlots);
    const { work, rest } = getTimingForSlot(slotSec, intensity);

    return picked.map((ex, exIdx) => ({
      ...ex,
      id: uid(),
      baseId: ex.id,
      exerciseIndex: exIdx,
      exerciseTotal: picked.length,
      workSeconds: work,
      restSeconds: rest,
      duration: +(slotSec / 60).toFixed(2),
      setsReps: `${work}s work / ${rest}s rest`,
      isCircuit: false,
      done: false
    }));
  }
}

/* ---------------- Session actions ---------------- */
function generateSession(){
  const coreItems = generateItemsFor(session);
  if(coreItems.length === 0){ 
    session.items = []; 
    lastBuildFailed = true;
    renderToday(); 
    showToast('Nothing matches — check your gear or focus filters'); 
    return; 
  }
  const fullSession = [];
  if(session.warmup){
    fullSession.push(makeWarmupItem(session.warmupSeconds));
  }
  fullSession.push(...coreItems);
  if(session.cooldown){
    fullSession.push(makeCooldownItem(session.cooldownSeconds));
  }
  session.items = fullSession;
  lastBuildFailed = false;
  renderToday();
}

function rescaleIfNeeded(){
  if(session.items.length === 0) return;
  const coreItems = session.items.filter(i => !i.isWarmup && !i.isCooldown && !i.isDrinksBreak);
  if(coreItems.length === 0) return;

  const warmupSec = session.items.some(i => i.isWarmup) ? session.warmupSeconds + 10 : 0;
  const cooldownSec = session.items.some(i => i.isCooldown) ? session.cooldownSeconds : 0;
  const drinksBreaks = session.items.filter(i => i.isDrinksBreak);
  const drinksSec = getDrinksBreakSeconds(session.intensity || 'balanced');
  const totalDrinksTime = drinksBreaks.length * drinksSec;

  const availSec = Math.max(60, (session.targetMinutes * 60) - warmupSec - cooldownSec - totalDrinksTime);
  const slotSec = Math.floor(availSec / coreItems.length);
  const { work, rest } = getTimingForSlot(slotSec, session.intensity || 'balanced');

  session.items = session.items.map(item => {
    if(item.isWarmup || item.isCooldown) return item;
    if(item.isDrinksBreak){
      return {
        ...item,
        workSeconds: drinksSec,
        setsReps: `${drinksSec}s hydration pause`,
        duration: +(drinksSec / 60).toFixed(2)
      };
    }
    return {
      ...item,
      workSeconds: work,
      restSeconds: rest,
      duration: +(slotSec / 60).toFixed(2),
      setsReps: item.isCircuit ? `Round ${item.round}/${item.totalRounds}` : `${work}s work / ${rest}s rest`
    };
  });
}

function swapExercise(index){
  const current = session.items[index];
  if(!current || current.isDrinksBreak) return;

  if(current.isWarmup){
    const altWarmups = [
      { name: 'Warm-Up: Jumping Jacks', pattern: 'jumpingjack' },
      { name: 'Warm-Up: High Knees (Light)', pattern: 'highknees' },
      { name: 'Warm-Up: Step-ups (Light)', pattern: 'stepup' }
    ];
    const currIdx = altWarmups.findIndex(w => w.pattern === current.pattern);
    const next = altWarmups[(currIdx + 1) % altWarmups.length];
    current.name = next.name;
    current.pattern = next.pattern;
    renderToday();
    return;
  }
  if(current.isCooldown){
    const altCooldowns = [
      { name: 'Warm-Down: Cat-Cow Flow', pattern: 'catcow' },
      { name: "Warm-Down: Child's Pose & Breathing", pattern: 'childspose' },
      { name: 'Warm-Down: Seated Hamstring Stretch', pattern: 'hamstring' },
      { name: 'Warm-Down: Cobra & Spinal Extension', pattern: 'cobra' }
    ];
    const currIdx = altCooldowns.findIndex(c => c.pattern === current.pattern);
    const next = altCooldowns[(currIdx + 1) % altCooldowns.length];
    current.name = next.name;
    current.pattern = next.pattern;
    renderToday();
    return;
  }

  const usedBaseIds = new Set(session.items.map(i => i.baseId || i.id));
  const candidates = exercises.filter(e => e.category === current.category && equipmentOk(e) && !usedBaseIds.has(e.id));
  if(candidates.length === 0){ 
    showToast('No alternate exercise available for your gear'); 
    return; 
  }
  const replacement = candidates[Math.floor(Math.random() * candidates.length)];

  if(current.isCircuit){
    // Swap all instances of this base exercise across all rounds
    const oldBaseId = current.baseId;
    session.items.forEach(item => {
      if(item.baseId === oldBaseId && !item.isDrinksBreak){
        item.baseId = replacement.id;
        item.name = replacement.name;
        item.category = replacement.category;
        item.equipment = replacement.equipment;
        item.pattern = replacement.pattern;
        item.backClass = replacement.backClass;
        item.backMod = replacement.backMod;
      }
    });
  } else {
    session.items[index] = { ...replacement, id: uid(), baseId: replacement.id, done: false };
  }
  rescaleIfNeeded();
  renderToday();
}

function removeSessionItem(index){
  const current = session.items[index];
  if(!current) return;

  if(current.isDrinksBreak){
    session.items.splice(index, 1);
  } else if(current.isCircuit && current.baseId){
    session.items = session.items.filter(i => i.baseId !== current.baseId);
    session.targetCount = Math.max(2, session.targetCount - 1);
  } else {
    session.items.splice(index, 1);
    if(!current.isWarmup && !current.isCooldown){
      session.targetCount = Math.max(2, session.targetCount - 1);
    }
  }
  rescaleIfNeeded();
  renderToday();
}

function addToSession(exId){
  const ex = exercises.find(e => e.id === exId);
  if(!ex) return;

  if(session.circuit){
    const rounds = session.circuitRounds || 3;
    const cooldownItem = session.items.find(i => i.isCooldown);
    session.items = session.items.filter(i => !i.isCooldown);

    for(let r = 1; r <= rounds; r++){
      session.items.push({
        ...ex,
        id: 'circuit-' + r + '-' + ex.id,
        baseId: ex.id,
        round: r,
        totalRounds: rounds,
        setsReps: `Round ${r}/${rounds}`,
        isCircuit: true,
        done: false
      });
    }
    if(cooldownItem) session.items.push(cooldownItem);
    session.targetCount++;
  } else {
    const cooldownItem = session.items.find(i => i.isCooldown);
    session.items = session.items.filter(i => !i.isCooldown);
    session.items.push({ ...ex, id: uid(), baseId: ex.id, done: false });
    if(cooldownItem) session.items.push(cooldownItem);
    session.targetCount++;
  }
  rescaleIfNeeded();
  renderToday();
  showToast(ex.name + ' added to today');
}

function addRandomToSession(){
  const pool = poolFor(session.categories);
  const usedBaseIds = new Set(session.items.map(i => i.baseId || i.id));
  const candidates = pool.filter(e => !usedBaseIds.has(e.id));
  if(candidates.length === 0){ 
    showToast('No more matching exercises to add'); 
    return; 
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  addToSession(pick.id);
}

function toggleDone(index){ 
  session.items[index].done = !session.items[index].done; 
  renderToday(); 
}

async function finishSession(){
  if(session.items.length === 0){ showToast('Generate or add exercises first'); return; }
  const actual = session.items.reduce((s,e)=>s+e.duration,0);
  const completed = session.items.filter(e=>e.done).length;
  history.unshift({
    id: uid(), 
    date: new Date().toISOString(),
    targetMinutes: session.targetMinutes, 
    actualMinutes: Math.round(actual),
    categories: [...session.categories],
    circuit: session.circuit,
    intensity: session.intensity,
    completedCount: completed, 
    totalCount: session.items.length,
    exercises: session.items.map(e=>({name:e.name, category:e.category, duration:e.duration, setsReps:e.setsReps, done:e.done}))
  });
  await saveHistory();
  session.items = [];
  renderToday(); renderHistory();
  showToast('Session logged');
  logTab = 'sessions'; renderHistory();
  setView('history');
}

async function saveCurrentAsProfile(){
  if(session.items.length === 0){ showToast('Generate a session first'); return; }
  const name = await promptSheet({ title: 'Save as profile', label: 'Name', placeholder: 'e.g. Morning circuit', ok: 'Save',
    text: `Keeps ${session.targetMinutes} min, ${INT_LABEL[session.intensity] || 'Balanced'}${session.circuit ? ', ' + session.circuitRounds + ' rounds' : ''} and these ${uniqueCore().length} moves, so you can run it again from Profiles.` });
  if(!name || !name.trim()) return;
  profiles.push({
    id: uid(), 
    name: name.trim(), 
    mode: 'fixed',
    targetMinutes: session.targetMinutes,
    targetCount: session.targetCount,
    intensity: session.intensity,
    circuit: session.circuit,
    circuitRounds: session.circuitRounds,
    categories: [...session.categories],
    exerciseIds: session.items.filter(i=>!i.isWarmup && !i.isCooldown && !i.isDrinksBreak).map(e=>e.baseId || e.id)
  });
  await saveProfiles();
  renderProfiles();
  showToast('Saved profile "' + name.trim() + '"');
}

/* ---------------- Profiles: run / edit / delete ---------------- */
function runProfile(id){
  const p = profiles.find(x=>x.id===id);
  if(!p) return;
  session.targetMinutes = p.targetMinutes || 20;
  session.targetCount = p.targetCount || 6;
  session.intensity = p.intensity || 'balanced';
  session.circuit = !!p.circuit;
  session.circuitRounds = p.circuitRounds || 3;
  session.categories = [...(p.categories || [])];

  if(p.mode === 'fixed'){
    const uniqueIds = [...new Set(p.exerciseIds || [])];
    const picked = uniqueIds.map(id => exercises.find(e => e.id === id)).filter(Boolean);
    if(picked.length === 0){
      showToast('Exercises in this profile could not be found');
      return;
    }
    const warmupSec = session.warmup ? (session.warmupSeconds + 10) : 0;
    const cooldownSec = session.cooldown ? session.cooldownSeconds : 0;
    const intensity = session.intensity || 'balanced';

    const fullSession = [];
    if(session.warmup) fullSession.push(makeWarmupItem(session.warmupSeconds));

    if(session.circuit){
      const rounds = session.circuitRounds || 3;
      const drinksSec = getDrinksBreakSeconds(intensity);
      const totalDrinksTime = (rounds > 1) ? ((rounds - 1) * drinksSec) : 0;
      const availSec = Math.max(60, (session.targetMinutes * 60) - warmupSec - cooldownSec - totalDrinksTime);
      const totalSlots = picked.length * rounds;
      const slotSec = Math.floor(availSec / totalSlots);
      const { work, rest } = getTimingForSlot(slotSec, intensity);

      for(let r = 1; r <= rounds; r++){
        picked.forEach((ex, exIdx) => {
          fullSession.push({
            ...ex,
            id: 'circuit-' + r + '-' + ex.id,
            baseId: ex.id,
            round: r,
            totalRounds: rounds,
            exerciseIndex: exIdx,
            exerciseTotal: picked.length,
            workSeconds: work,
            restSeconds: rest,
            duration: +(slotSec / 60).toFixed(2),
            setsReps: `Round ${r}/${rounds}`,
            isCircuit: true,
            done: false
          });
        });
        if(r < rounds){
          fullSession.push(makeDrinksBreakItem(r, r + 1, drinksSec));
        }
      }
    } else {
      const availSec = Math.max(60, (session.targetMinutes * 60) - warmupSec - cooldownSec);
      const slotSec = Math.floor(availSec / picked.length);
      const { work, rest } = getTimingForSlot(slotSec, intensity);

      picked.forEach((ex, exIdx) => {
        fullSession.push({
          ...ex,
          id: uid(),
          baseId: ex.id,
          exerciseIndex: exIdx,
          exerciseTotal: picked.length,
          workSeconds: work,
          restSeconds: rest,
          duration: +(slotSec / 60).toFixed(2),
          setsReps: `${work}s work / ${rest}s rest`,
          isCircuit: false,
          done: false
        });
      });
    }

    if(session.cooldown) fullSession.push(makeCooldownItem(session.cooldownSeconds));
    session.items = fullSession;
  } else {
    generateSession();
  }
  renderToday();
  setView('today');
}

async function deleteProfile(id){
  const pr = profiles.find(p=>p.id===id);
  const ok = await confirmSheet({ title: `Delete ${pr ? pr.name : 'this profile'}?`, text: 'The profile goes. Your moves and your log stay as they are.',
    primary: { label: 'Delete', value: true }, secondary: { label: 'Keep it', value: false } });
  if(!ok) return;
  profiles = profiles.filter(p=>p.id!==id);
  await saveProfiles();
  renderProfiles();
}

function startEditProfile(id){
  const p = profiles.find(x=>x.id===id);
  editingProfileId = id;
  profileFormOpen = true;
  profileFormMode = p.mode || 'random';
  profileFormCount = p.targetCount || 6;
  profileFormTargetMinutes = p.targetMinutes || 20;
  profileFormIntensity = p.intensity || 'balanced';
  profileFormCircuit = !!p.circuit;
  profileFormCircuitRounds = p.circuitRounds || 3;
  profileFormName = p.name || '';
  profileFormCategories = [...(p.categories || [])];
  profileFormExerciseIds = [...(p.exerciseIds || [])];
  renderProfiles();
  window.scrollTo(0,0);
}

function startNewProfile(){
  editingProfileId = null;
  profileFormOpen = true;
  profileFormMode = 'random';
  profileFormCount = 6;
  profileFormTargetMinutes = 20;
  profileFormIntensity = 'balanced';
  profileFormCircuit = false;
  profileFormCircuitRounds = 3;
  profileFormName = '';
  profileFormCategories = [];
  profileFormExerciseIds = [];
  renderProfiles();
  window.scrollTo(0,0);
}

function cancelProfileForm(){
  profileFormOpen = false; 
  editingProfileId = null;
  renderProfiles();
}

async function saveProfileForm(){
  const name = profileFormName.trim();
  if(!name){ showToast('Give the profile a name'); return; }
  if(profileFormMode==='fixed' && profileFormExerciseIds.length===0){ 
    showToast('Pick at least one exercise for a fixed profile'); 
    return; 
  }

  const data = {
    name, 
    mode: profileFormMode, 
    targetMinutes: profileFormTargetMinutes, 
    targetCount: profileFormCount, 
    intensity: profileFormIntensity,
    circuit: profileFormCircuit,
    circuitRounds: profileFormCircuitRounds,
    categories: [...profileFormCategories], 
    exerciseIds: [...profileFormExerciseIds]
  };
  if(editingProfileId){
    const p = profiles.find(x=>x.id===editingProfileId);
    Object.assign(p, data);
    showToast('Profile updated');
  }else{
    profiles.push({id:uid(), ...data});
    showToast('Profile saved');
  }
  await saveProfiles();
  profileFormOpen = false; editingProfileId = null;
  renderProfiles();
}

/* ==========================================================================
   UI layer (Round 8 look, Round 9 "Scrub" controls). Rendering only: every
   action below calls the original session/profile/library/log functions.
   ========================================================================== */
const BACK_WORDS = { 'spine-friendly': 'Easy on the back', 'stabilizer': 'Builds the brace', 'decompression': 'Takes pressure off', 'requires-mod': 'Needs a tweak' };
const BACK_DESC = {
  'spine-friendly': 'No load down the spine and very little shear on the lower back.',
  'stabilizer': 'Endurance all the way round the spine, without bending it.',
  'decompression': 'Eases disc pressure, loosens the upper back and opens the hips.',
  'requires-mod': 'Can bend or shear the lower back. Use the cue if your back is sensitive.'
};
const BACK_NONE = { 'spine-friendly': 'are easy on the back', 'stabilizer': 'build the brace', 'decompression': 'take pressure off the back', 'requires-mod': 'need a tweak' };
const GEAR_COPY = {
  "Bodyweight": ["Bodyweight", "No kit needed"], "Dumbbells": ["Dumbbells", "Free weights"], "Kettlebell": ["Kettlebell", "Cast iron"],
  "Resistance Band": ["Resistance band", "Tension bands"], "Chair/Bench": ["Chair or bench", "Anything sturdy"], "Wall": ["Wall", "A clear bit of wall"],
  "Jump rope": ["Jump rope", "Speed rope"], "Stairs": ["Stairs", "A flight or a step"], "Pull-up Bar": ["Pull-up bar", "Doorframe bar"]
};
const INT_LABEL = { steady: 'Steady', balanced: 'Balanced', hiit: 'HIIT' };
const INT_KEYS = ['steady', 'balanced', 'hiit'];
const INT_SUB = ['Longer rest', 'Moderate pace', 'Max burn'];
const GAIT = ['stepup', 'jumpingjack', 'highknees'];
const WU_SECS = [30, 45, 60, 90];
const WD_SECS = [60, 120, 180];
const FOCUS = CATEGORIES.filter(c => c !== 'yoga');
const LOW_PATTERNS = ['pushup','plank','sideplank','catcow','childspose','cobra','downdog','legraise','bridge','situp','mountainclimber','twist','hamstring'];
const BUILTIN_NAMES = new Set(DEFAULT_EXERCISES.map(e => e.name));
let todayView = 'ready';        // 'ready' | 'list'
let lastBuildFailed = false;    // "Nothing fits" state on Today
let libraryFormOpen = false;
let installAvailable = false;
let uiReady = false;

const gearName = eq => (GEAR_COPY[eq] || [eq])[0];
function mmss(sec){ sec = Math.max(0, Math.round(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); }
function listJoin(a){ return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
function lc1(s){ return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function uc1(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
// Built-in names read in sentence case ("Bodyweight squats"); the user's own names are left alone.
function disp(name){
  const n = String(name || '');
  const builtin = BUILTIN_NAMES.has(n) || /^(Warm-Up|Warm-Down|Drinks Break)/.test(n);
  return builtin ? n.charAt(0) + n.slice(1).toLowerCase() : n;
}
function moveName(name){ return disp(String(name).replace(/^Warm-(Up|Down):\s*/i, '')); }
function firstSentence(t){ return String(t || '').split(/(?<=\.)\s/)[0].replace(/\.$/, ''); }
function greeting(){ const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }
function fig(pattern, size, style, id = '', cls = ''){
  return `<div class="fig ${cls}" ${id ? `id="${id}"` : ''} style="${style}" aria-hidden="true">${buildFigureSVG(pattern, size)}</div>`;
}
function mfig(pattern){ return `<div class="mf" aria-hidden="true"><div class="fig">${buildFigureSVG(pattern, 'mini')}</div></div>`; }
function band(h, inner, extra = ''){ return `<div class="band" style="height:${h}px;${extra}"><div class="in">${inner}</div></div>`; }
function holdBtn(id, label, cls = ''){
  return `<button class="hold ${cls}" id="${id}" aria-label="${label}" aria-describedby="holdHint"><span class="fb"></span><span class="lb"><span class="D">${label}</span></span></button>
  <span class="sr" id="holdHint">Press and hold for a second to start.</span>`;
}
function itemSeconds(i){ return (i.workSeconds || Math.max(i.duration, 1) * 60) + (i.restSeconds || 0); }
function coreItems(){ return session.items.filter(i => !i.isWarmup && !i.isCooldown && !i.isDrinksBreak); }
function uniqueCore(){ const seen = new Set(); return coreItems().filter(i => { const k = i.baseId || i.id; if(seen.has(k)) return false; seen.add(k); return true; }); }
function focusText(cats){ return cats.length ? uc1(listJoin(cats.map(c => CAT_LABEL[c].toLowerCase()))) : 'Full body mix'; }
function gearSentence(){
  if(!userEquipment.length) return 'No gear picked yet.';
  return uc1(listJoin(userEquipment.map(e => gearName(e).toLowerCase()))) + '.';
}
// Display-only summary, same arithmetic as generateItemsFor()
function planSummary(){
  const s = session, rounds = s.circuit ? (s.circuitRounds || 3) : 1;
  const drinks = getDrinksBreakSeconds(s.intensity);
  const avail = Math.max(60, s.targetMinutes * 60 - (s.warmup ? s.warmupSeconds + 10 : 0) - (s.cooldown ? s.cooldownSeconds : 0) - (s.circuit && rounds > 1 ? (rounds - 1) * drinks : 0));
  const { work, rest } = getTimingForSlot(Math.floor(avail / Math.max(1, s.targetCount * rounds)), s.intensity);
  return s.circuit
    ? `${rounds} rounds of ${s.targetCount} moves, ${mmss(work)} work and ${mmss(rest)} rest. ${mmss(drinks)} drinks break between rounds.`
    : `${s.targetCount} moves of ${mmss(work)}, with ${mmss(rest)} rest between.`;
}

/* ---------------- Sheets: confirm, prompt, adjust, gear, install ---------------- */
let sheetOnClose = null, sheetReturnFocus = null;
function openSheet(html, { cls = '', onClose } = {}){
  closeSheet(true);
  sheetReturnFocus = document.activeElement;
  const root = document.getElementById('sheetRoot');
  root.innerHTML = `<div class="scrim" data-scrim></div><div class="sheet ${cls}" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">${html}</div>`;
  const sh = root.querySelector('.sheet');
  sheetOnClose = onClose || null;
  root.querySelector('[data-scrim]').addEventListener('click', () => closeSheet());
  sh.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeSheet()));
  sh.addEventListener('keydown', e => {
    if(e.key === 'Escape'){ e.stopPropagation(); closeSheet(); return; }
    if(e.key !== 'Tab') return;
    const f = [...sh.querySelectorAll('button,input,select,[tabindex="0"]')].filter(x => !x.disabled && x.offsetParent !== null && !x.closest('[inert]'));
    if(!f.length) return;
    if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
    else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
  });
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const a = sh.querySelector('[autofocus]') || sh.querySelector('button,input,[tabindex="0"]'); if(a) a.focus({ preventScroll: true }); }, 0);
  return sh;
}
function closeSheet(silent){
  const root = document.getElementById('sheetRoot');
  if(!root || !root.firstChild) return;
  root.innerHTML = '';
  if(!document.getElementById('playerOverlay').classList.contains('show')) document.body.style.overflow = '';
  const cb = sheetOnClose; sheetOnClose = null;
  if(!silent && cb) cb();
  if(sheetReturnFocus && document.contains(sheetReturnFocus)) sheetReturnFocus.focus({ preventScroll: true });
}
// Replaces window.confirm(). Resolves to the chosen button's value.
function confirmSheet({ title, text, primary, secondary, cancelValue = false }){
  return new Promise(resolve => {
    let done = false;
    const finish = v => { if(done) return; done = true; resolve(v); };
    const sh = openSheet(`<div class="bar"></div>
      <h2 class="D stitle" id="sheetTitle">${escapeHtml(title)}</h2>
      <p class="body" style="margin-top:14px">${escapeHtml(text)}</p>
      <button class="b1" data-a="p"><span>${primary.label}</span></button>
      <button class="b2" data-a="s">${secondary.label}</button>`, { onClose: () => finish(cancelValue) });
    sh.querySelector('[data-a="p"]').addEventListener('click', () => { finish(primary.value); closeSheet(true); });
    sh.querySelector('[data-a="s"]').addEventListener('click', () => { finish(secondary.value); closeSheet(true); });
  });
}
// Replaces window.prompt(). Resolves to the text, or null on cancel.
function promptSheet({ title, text, label, placeholder, ok }){
  return new Promise(resolve => {
    let done = false;
    const finish = v => { if(done) return; done = true; resolve(v); };
    const sh = openSheet(`<div class="bar"></div>
      <h2 class="D stitle" id="sheetTitle">${escapeHtml(title)}</h2>
      <p class="body" style="margin-top:14px">${escapeHtml(text)}</p>
      <label class="fl"><span class="lab">${label}</span><input class="inp" id="promptInput" placeholder="${escapeAttr(placeholder || '')}" autofocus autocomplete="off"></label>
      <button class="b1" data-a="p"><span>${ok}</span></button>
      <button class="b2" data-close>Cancel</button>`, { onClose: () => finish(null) });
    const inp = sh.querySelector('#promptInput');
    const go = () => { finish(inp.value); closeSheet(true); };
    sh.querySelector('[data-a="p"]').addEventListener('click', go);
    inp.addEventListener('keydown', e => { if(e.key === 'Enter'){ e.preventDefault(); go(); } });
  });
}

function openGearSheet(){
  const tiles = () => EQUIPMENT_OPTIONS.map(eq => {
    const [n, sub] = GEAR_COPY[eq] || [eq, ''];
    return `<button aria-pressed="${userEquipment.includes(eq)}" data-geq="${escapeAttr(eq)}"><span class="D2">${n}</span><small>${sub}</small></button>`;
  }).join('');
  const sh = openSheet(`<div class="hdr lab" style="padding-left:0;padding-right:0;padding-top:56px" id="gearCount">Set up · ${userEquipment.length} picked</div>
    <h2 class="D" id="sheetTitle" style="font-size:96px;padding-top:8px">Your gear</h2>
    <p class="body muted" style="margin-top:10px">Tap what you have at home. You can change it any time from Today.</p>
    <div class="gear" role="group" aria-label="Your gear">${tiles()}</div>
    <button class="b1 tall" data-close style="margin-top:22px"><span>Done</span></button>`, { cls: 'full', onClose: () => renderToday() });
  sh.querySelectorAll('[data-geq]').forEach(card => card.addEventListener('click', async () => {
    const eq = card.dataset.geq;
    const idx = userEquipment.indexOf(eq);
    if(idx > -1) userEquipment.splice(idx, 1);
    else userEquipment.push(eq);
    card.setAttribute('aria-pressed', userEquipment.includes(eq));
    sh.querySelector('#gearCount').textContent = `Set up · ${userEquipment.length} picked`;
    await saveUserEquipment();
  }));
}

function onInstallAvailable(flag){ installAvailable = !!flag; if(uiReady) renderToday(); }
function openInstallSheet(){
  const sh = openSheet(`<div class="hdr lab" style="padding:56px 0 0">Optional</div>
    <h2 class="D" id="sheetTitle" style="font-size:100px;padding-top:8px">Keep it<br>close</h2>
    ${band(290, `${fig('tree', 'small', 'right:16px;top:10px;width:190px;height:260px')}
      <div class="lab abs" style="left:22px;bottom:30px;line-height:1.5">Works offline<br>Opens full screen<br>Keeps the screen on</div>`, 'margin:22px -22px 0')}
    <p class="body" style="padding-top:24px">Add On Track to your home screen so it opens like an app, straight into today's workout.</p>
    <button class="b1" id="installGo" style="margin-top:22px"><span>Add to home screen</span></button>
    <button class="b2" data-close>Not now</button>`, { cls: 'full' });
  sh.querySelector('#installGo').addEventListener('click', async () => {
    closeSheet(true);
    if(typeof triggerPwaInstall === 'function') await triggerPwaInstall();
  });
}

/* ---------------- Setup page: every builder setting on one snapping page ----------------
   T-Bone (20 Nov 2026): all the setup on one screen, "bang bang bang go", scrolling like
   the original app. Each section is one screen and snaps into place (CSS scroll-snap);
   the Scrub controls are the Round 9 ones, unchanged, and take touch-action:none so a
   sideways drag on them never scrolls the page. Hold to go sits at the bottom. */
const SETUP_SECTIONS = ['time', 'moves', 'intensity', 'circuit', 'warm', 'focus', 'gear', 'go'];
const SETUP_NAMES = ['Total time', 'Moves', 'Intensity', 'Circuit', 'Warm-up and down', 'Focus', 'Your gear', 'Go'];
let setupOpen = false;   // the Today tab shows the setup page even before a workout is built
let setupDraw = null;    // repaints the controls from `session`

function prefersReducedMotion(){ return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
function scrollToSection(name, instant){
  const el = document.getElementById('sec-' + name);
  if(!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: instant || prefersReducedMotion() ? 'instant' : 'smooth' });
}
// Old entry point (list view, Nothing fits, landing): open the setup page at the top.
function openAdjust(){
  setupOpen = true; todayView = 'ready';
  if(session.items.length === 0) generateSession(); else renderToday();
  setView('today');
  scrollToSection('time', true);
}

function setupHtml(){
  const N = SETUP_SECTIONS.length;
  const tks = [5, 15, 30, 45, 60].map(v => `<span style="left:${(v - 5) / 55 * 100}%">${v}</span>`).join('');
  const stairs = Array.from({ length: 15 }, (_, k) => `<i data-lv="${k + 1}" style="height:${(22 + 78 * k / 14).toFixed(0)}%"></i>`).join('');
  const plate = (id, lab) => `<button class="plt" id="${id}" role="switch" aria-label="${lab}"><span class="pi"><span class="fa f1"><span>On</span></span><span class="fa f2"><span>Off</span></span></span></button>`;
  const gear = EQUIPMENT_OPTIONS.map(eq => {
    const [n, sub] = GEAR_COPY[eq] || [eq, ''];
    return `<button aria-pressed="${userEquipment.includes(eq)}" data-geq="${escapeAttr(eq)}"><span class="D2">${n}</span><small>${sub}</small></button>`;
  }).join('');
  const sec = (i, body) => `<section class="snap" id="sec-${SETUP_SECTIONS[i]}" aria-label="${SETUP_NAMES[i]}">${body}
    ${i < N - 1 ? `<button class="lnk nx" data-goto="${SETUP_SECTIONS[i + 1]}">Next: ${SETUP_NAMES[i + 1]} <span aria-hidden="true">&darr;</span></button>` : ''}</section>`;
  const hd = (i, title, right = '') => `<div class="hdr row lab"><span>Set up · ${i + 1} of ${N}</span>${right}</div><h2 class="D title l">${title}</h2>`;
  return [
    sec(0, `<div class="hdr row lab"><span>${greeting()}</span><span id="instSlot"></span></div><h1 class="D title xl">Today</h1>
      <div class="row" style="margin-top:22px"><span class="lab">Total time</span><span class="hint">Drag the number</span></div>
      <div class="scr" id="ctlTime"><div class="tk"></div><div class="fb"></div><div class="ed"></div><div class="D num" aria-hidden="true"><span id="valTime"></span><small> min</small></div></div>
      <div class="tks" aria-hidden="true">${tks}</div>`),
    sec(1, `${hd(1, 'Moves')}
      <div class="row" style="margin-top:22px"><span class="lab">How many</span><span class="hint">Run your thumb up the steps</span></div>
      <div class="row" style="gap:16px;margin-top:6px;align-items:flex-end"><div style="width:84px" aria-hidden="true"><div class="D" style="font-size:96px" id="valMoves"></div></div>
        <div class="stairs" id="ctlMoves">${stairs}</div></div>`),
    sec(2, `${hd(2, 'Intensity')}
      <div class="row" style="margin-top:22px"><span class="lab">How hard</span><span class="hint">Push him up the ramp</span></div>
      <div class="ramp" id="ctlInt"><div class="w"></div><div class="wf"></div><div class="fig live" id="fint" aria-hidden="true"></div>
        ${INT_KEYS.map((k, i) => `<div class="cap" style="left:${i * 33.33}%" aria-hidden="true"><b>${INT_LABEL[k]}</b>${INT_SUB[i]}</div>`).join('')}</div>`),
    sec(3, `${hd(3, 'Circuit')}
      <div class="row" style="margin-top:22px"><div><div class="t17">Circuit</div><div class="s14">Rounds, drinks break between</div></div>${plate('tgCirc', 'Circuit')}</div>
      <div class="row" id="ifCirc" style="gap:14px;margin-top:18px;align-items:flex-end"><div style="width:84px" aria-hidden="true"><div class="D" style="font-size:76px" id="valRounds"></div><div class="lab">rounds</div></div>
        <div class="stk" id="ctlRounds">${[2, 3, 4, 5].map(n => `<button data-val="${n}" aria-label="${n} rounds"><i><b>${n}</b></i></button>`).join('')}</div></div>`),
    sec(4, `${hd(4, 'Warm up')}
      <div class="row" style="margin-top:22px"><div><div class="t17">Warm-up</div><div class="s14">Jumping jacks, light pace</div></div>${plate('tgWu', 'Warm-up')}</div>
      <div class="row" id="ifWu" style="gap:14px;margin-top:10px"><div class="D" style="font-size:52px;width:84px" id="valWu" aria-hidden="true"></div>
        <div class="notch" id="ctlWu">${WU_SECS.map((s, i) => `<i data-lv="${i}"><span>${mmss(s)}</span></i>`).join('')}</div></div>
      <div class="row" style="margin-top:28px"><div><div class="t17">Warm-down</div><div class="s14">Yoga stretch and mobility</div></div>${plate('tgWd', 'Warm-down')}</div>
      <div class="row" id="ifWd" style="gap:14px;margin-top:10px"><div class="D" style="font-size:40px;width:84px;white-space:nowrap" id="valWd" aria-hidden="true"></div>
        <div class="notch" id="ctlWd">${WD_SECS.map((s, i) => `<i data-lv="${i}"><span>${s / 60} min</span></i>`).join('')}</div></div>`),
    sec(5, `${hd(5, 'Focus')}
      <div class="t17" style="margin-top:22px" id="lblFocus">Focus <span class="s14" style="font-weight:400">optional, pick any</span></div>
      <div class="tiles" role="group" aria-labelledby="lblFocus">${FOCUS.map(c => `<button role="checkbox" data-cat="${c}"><span>${CAT_LABEL[c]}</span></button>`).join('')}</div>
      <p class="body muted" id="sumPlan" aria-live="polite" style="margin-top:12px;font-size:15px"></p>`),
    sec(6, `${hd(6, 'Your gear', `<span id="gearCount">${userEquipment.length} picked</span>`)}
      <p class="body muted" style="margin-top:10px">Tap what you have at home.</p>
      <div class="gear" role="group" aria-label="Your gear" style="margin-top:12px">${gear}</div>`),
    sec(7, `<div id="setupGo" style="display:contents"></div>`)
  ].join('');
}

function bindSetup(sh){
  const regen = () => { if(session.items.length > 0 || lastBuildFailed) generateSession(); else renderToday(); };
  let figPat = null;
  const draw = () => {
    if(!sh.isConnected || !sh.querySelector('#ctlTime')) return;
    const t = (session.targetMinutes - 5) / 55;
    const scr = sh.querySelector('#ctlTime');
    scr.style.setProperty('--v', t);
    sh.querySelector('#valTime').textContent = session.targetMinutes;
    const num = scr.querySelector('.num'), W = scr.clientWidth, ex = 22 + t * (W - 44), nw = num.offsetWidth;
    num.style.left = (ex - nw - 16 >= 10 ? ex - nw - 16 : ex + 16) + 'px';
    sh.querySelector('#valMoves').textContent = session.targetCount;
    sh.querySelectorAll('#ctlMoves i').forEach(i => i.classList.toggle('lit', session.targetCount >= +i.dataset.lv));
    const ii = Math.max(0, INT_KEYS.indexOf(session.intensity)), f = [1 / 6, .5, 5 / 6][ii];
    const rp = sh.querySelector('#ctlInt'), fe = sh.querySelector('#fint'), RW = rp.clientWidth;
    fe.style.left = f * RW + 'px'; fe.style.bottom = (46 + 64 * f - 14) + 'px';
    rp.querySelector('.wf').style.width = (f * 100 + 8) + '%';
    rp.querySelectorAll('.cap').forEach((c, i) => c.classList.toggle('on', i === ii));
    if(figPat !== GAIT[ii]){ figPat = GAIT[ii]; fe.innerHTML = buildFigureSVG(figPat, 'small'); }
    sh.querySelector('#tgCirc').setAttribute('aria-checked', !!session.circuit);
    sh.querySelector('#tgWu').setAttribute('aria-checked', !!session.warmup);
    sh.querySelector('#tgWd').setAttribute('aria-checked', !!session.cooldown);
    [['#ifCirc', session.circuit], ['#ifWu', session.warmup], ['#ifWd', session.cooldown]].forEach(([s, on]) => {
      const el = sh.querySelector(s); el.classList.toggle('dim', !on); el.inert = !on;
    });
    sh.querySelector('#valRounds').textContent = session.circuitRounds;
    sh.querySelectorAll('#ctlRounds button').forEach(b => {
      const n = +b.dataset.val;
      b.classList.toggle('lit', n <= session.circuitRounds);
      b.querySelector('i').style.height = (n <= session.circuitRounds ? 28 + 12 * (n - 2) + (n === session.circuitRounds ? 14 : 0) : 24 + 12 * (n - 2)) + 'px';
    });
    const wu = Math.max(0, WU_SECS.indexOf(session.warmupSeconds)), wd = Math.max(0, WD_SECS.indexOf(session.cooldownSeconds));
    sh.querySelector('#valWu').textContent = mmss(WU_SECS[wu]);
    sh.querySelector('#valWd').textContent = (WD_SECS[wd] / 60) + ' min';
    sh.querySelectorAll('#ctlWu i').forEach(i => { i.classList.toggle('lit', +i.dataset.lv <= wu); i.classList.toggle('on', +i.dataset.lv === wu); });
    sh.querySelectorAll('#ctlWd i').forEach(i => { i.classList.toggle('lit', +i.dataset.lv <= wd); i.classList.toggle('on', +i.dataset.lv === wd); });
    sh.querySelectorAll('.tiles [data-cat]').forEach(b => b.setAttribute('aria-checked', session.categories.includes(b.dataset.cat)));
    sh.querySelectorAll('[data-geq]').forEach(b => b.setAttribute('aria-pressed', userEquipment.includes(b.dataset.geq)));
    sh.querySelector('#gearCount').textContent = `${userEquipment.length} picked`;
    sh.querySelector('#sumPlan').textContent = planSummary();
  };
  const sliders = [];
  sliders.push(bindScrub(sh.querySelector('#ctlTime'), { label: 'Total time', min: 5, max: 60,
    get: () => session.targetMinutes, set: v => { session.targetMinutes = v; rescaleIfNeeded(); draw(); },
    map: (e, r) => Math.round(5 + clampN((e.clientX - r.left - 22) / (r.width - 44), 0, 1) * 55),
    text: v => v + ' minutes', onEnd: () => renderToday() }));
  sliders.push(bindScrub(sh.querySelector('#ctlMoves'), { label: 'Moves', min: 2, max: 15,
    get: () => session.targetCount, set: v => { session.targetCount = v; draw(); },
    map: (e, r) => Math.max(2, Math.ceil(fracX(e, r) * 15)), text: v => v + ' moves', onEnd: regen }));
  sliders.push(bindScrub(sh.querySelector('#ctlInt'), { label: 'Intensity', min: 0, max: 2,
    get: () => Math.max(0, INT_KEYS.indexOf(session.intensity)), set: v => { session.intensity = INT_KEYS[v]; draw(); },
    map: (e, r) => Math.floor(fracX(e, r) * 3), text: v => INT_LABEL[INT_KEYS[v]] + ', ' + INT_SUB[v].toLowerCase(),
    onEnd: () => { if(session.items.length > 0) rescaleIfNeeded(); renderToday(); } }));
  sliders.push(bindScrub(sh.querySelector('#ctlWu'), { label: 'Warm-up length', min: 0, max: 3,
    get: () => Math.max(0, WU_SECS.indexOf(session.warmupSeconds)), set: v => { session.warmupSeconds = WU_SECS[v]; draw(); },
    map: (e, r) => Math.floor(fracX(e, r) * 4), text: v => mmss(WU_SECS[v]) + ' warm-up', onEnd: regen }));
  sliders.push(bindScrub(sh.querySelector('#ctlWd'), { label: 'Warm-down length', min: 0, max: 2,
    get: () => Math.max(0, WD_SECS.indexOf(session.cooldownSeconds)), set: v => { session.cooldownSeconds = WD_SECS[v]; draw(); },
    map: (e, r) => Math.floor(fracX(e, r) * 3), text: v => (WD_SECS[v] / 60) + ' minute warm-down', onEnd: regen }));
  const rounds = bindRadios(sh.querySelector('#ctlRounds'), { label: 'Rounds', get: () => session.circuitRounds,
    set: v => { session.circuitRounds = parseInt(v); draw(); regen(); } });
  sh.querySelector('#tgCirc').addEventListener('click', () => { session.circuit = !session.circuit; draw(); regen(); });
  sh.querySelector('#tgWu').addEventListener('click', () => { session.warmup = !session.warmup; draw(); if(session.items.length > 0) generateSession(); else renderToday(); });
  sh.querySelector('#tgWd').addEventListener('click', () => { session.cooldown = !session.cooldown; draw(); if(session.items.length > 0) generateSession(); else renderToday(); });
  sh.querySelectorAll('.tiles [data-cat]').forEach(b => b.addEventListener('click', () => {
    const cat = b.dataset.cat, idx = session.categories.indexOf(cat);
    if(idx > -1) session.categories.splice(idx, 1); else session.categories.push(cat);
    draw(); renderToday();
  }));
  sh.querySelectorAll('[data-geq]').forEach(card => card.addEventListener('click', async () => {
    const eq = card.dataset.geq, idx = userEquipment.indexOf(eq);
    if(idx > -1) userEquipment.splice(idx, 1); else userEquipment.push(eq);
    draw();
    await saveUserEquipment();
    regen();
  }));
  sh.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', () => scrollToSection(b.dataset.goto)));
  // Values can change from outside (a profile run, Clear focus): keep the ARIA state in step too.
  setupDraw = () => { draw(); sliders.forEach(s => s.sync()); rounds.sync(); };
  // Positions depend on layout (and the view may be hidden when first built).
  if(window.ResizeObserver) new ResizeObserver(() => draw()).observe(sh.querySelector('#ctlTime'));
  draw();
  requestAnimationFrame(draw);
}

// The last section: the ready summary and Hold to go (or what to do when nothing is built).
function renderSetupGo(go){
  const N = SETUP_SECTIONS.length;
  const hdr = right => `<div class="hdr row lab"><span>Set up · ${N} of ${N}</span>${right || ''}</div>`;
  if(session.items.length === 0){
    const cats = session.categories.map(c => CAT_LABEL[c]);
    go.innerHTML = lastBuildFailed ? `${hdr()}
      ${band(290, `<div class="D wht abs" style="left:22px;top:30px;font-size:84px">Nothing<br>fits</div>
        ${fig('forwardfold', 'small', 'right:-6px;top:40px;width:160px;height:230px')}`)}
      <p class="pad body" style="padding-top:26px">No moves match. Your gear is ${escapeHtml(listJoin(userEquipment.map(e => gearName(e).toLowerCase())) || 'nothing yet')}${cats.length ? `, and the focus is ${escapeHtml(listJoin(cats))}` : ''}.</p>
      <div class="actions push">
        <button class="b1" id="changeGearBtn"><span>Change gear</span></button>
        ${cats.length ? `<button class="b2" id="clearFocusBtn">Clear focus</button>` : `<button class="b2" id="genBtn">Try again</button>`}
      </div>` : `${hdr()}
      ${band(290, `<div class="D wht abs" style="left:22px;top:30px;font-size:76px">Ready<br>when<br>you are</div>
        ${fig('warrior', 'small', 'right:-24px;top:90px;width:170px;height:200px')}`)}
      <p class="pad body muted" style="padding-top:26px">${escapeHtml(gearSentence())}</p>
      <div class="actions push"><button class="b1" id="genBtn"><span>Build my workout</span></button></div>`;
  } else {
    const totalSec = session.items.reduce((s, e) => s + itemSeconds(e), 0);
    const uniq = uniqueCore();
    const tweaks = uniq.filter(e => e.backClass === 'requires-mod').length;
    const lines = [`${uniq.length} moves`];
    if(session.circuit) lines.push(`${session.circuitRounds} rounds`);
    if(tweaks) lines.push(`${tweaks} back tweak${tweaks > 1 ? 's' : ''}`);
    const names = uniq.map(e => lc1(disp(e.name)));
    go.innerHTML = `${hdr(`<button class="lnk" id="seeListTop">See the list</button>`)}
      ${band(330, `<div class="abs" style="left:22px;top:30px"><div class="D wht" id="readyTime" style="font-size:110px">${mmss(totalSec)}</div><div class="lab wht" style="margin-top:8px">${escapeHtml(focusText(session.categories))}</div></div>
        ${fig('jumpingjack', 'small', 'right:-6px;top:40px;width:210px;height:280px', 'readyFig')}
        <div class="lab abs" style="left:22px;bottom:30px;line-height:1.5">${lines.join('<br>')}</div>`)}
      <p class="pad body muted" style="padding-top:26px">${escapeHtml(uc1(names.join(', ')))}. <button class="lnk u" id="seeListBtn" style="color:var(--ink)">See the list</button></p>
      <div class="actions push">${holdBtn('holdGo', 'Hold to go')}</div>`;
  }
  const on = (id, fn) => { const el = go.querySelector('#' + id); if(el) el.addEventListener('click', fn); };
  on('genBtn', () => { generateSession(); });
  on('changeGearBtn', () => scrollToSection('gear'));
  on('clearFocusBtn', () => { session.categories = []; lastBuildFailed = false; renderToday(); });
  const list = () => { todayView = 'list'; renderToday(); window.scrollTo(0, 0); };
  on('seeListBtn', list); on('seeListTop', list);
  bindGo(go, 'readyFig');
}

/* ---------------- Render: Today ---------------- */
function bindGo(root, figId){
  const btn = root.querySelector('#holdGo');
  if(!btn) return;
  const timeEl = root.querySelector('#readyTime');
  const timeText = timeEl ? timeEl.textContent : '';
  let posed = false;
  bindHold(btn, {
    ms: 1200,
    onTap: () => showToast('Press and hold to start'),
    onProgress: v => {
      btn.querySelector('.lb .D').textContent = v >= 1 ? 'Go' : btn.getAttribute('aria-label');
      if(timeEl) timeEl.textContent = v >= 1 ? 'Go' : v > 0 ? ['3', '2', '1'][Math.min(2, Math.floor(v * 3))] : timeText;
      const f = figId && root.querySelector('#' + figId);
      if(!f) return;
      if(v > 0 && !posed){ f.innerHTML = buildFigureSVG('squat', 'small'); posed = true; }
      if(v === 0 && posed){ f.innerHTML = buildFigureSVG('jumpingjack', 'small'); posed = false; }
      if(posed) for(const a of f.getAnimations({ subtree: true })){ a.pause(); a.currentTime = v * 950; }
    },
    onDone: () => setTimeout(startWorkout, 150)
  });
}

function renderToday(){
  const root = document.getElementById('view-today');
  const installLink = installAvailable ? `<button class="lnk" id="installLink">Install</button>` : '';
  const head = (right = '') => `<div class="hdr row lab"><span>${greeting()}</span>${right}${installLink}</div><h1 class="D title xl">Today</h1>`;

  const showSetup = session.items.length > 0 ? todayView !== 'list' : setupOpen;
  if(showSetup){
    if(!root.classList.contains('setup') || !root.querySelector('#setupGo')){
      root.innerHTML = setupHtml();
      root.classList.add('setup');
      bindSetup(root);
    } else if(setupDraw) setupDraw();
    const slot = root.querySelector('#instSlot');
    slot.innerHTML = installLink;
    const il = slot.querySelector('#installLink'); if(il) il.addEventListener('click', openInstallSheet);
    renderSetupGo(root.querySelector('#setupGo'));
    return;
  }
  root.classList.remove('setup');
  setupDraw = null;

  if(session.items.length === 0){
    const cats = session.categories.map(c => CAT_LABEL[c]);
    root.innerHTML = lastBuildFailed ? `${head()}
      ${band(290, `<div class="D wht abs" style="left:22px;top:30px;font-size:84px">Nothing<br>fits</div>
        ${fig('forwardfold', 'small', 'right:-6px;top:40px;width:160px;height:230px')}`)}
      <p class="pad body" style="padding-top:26px">No moves match. Your gear is ${escapeHtml(listJoin(userEquipment.map(e => gearName(e).toLowerCase())) || 'nothing yet')}${cats.length ? `, and the focus is ${escapeHtml(listJoin(cats))}` : ''}.</p>
      <div class="actions push">
        <button class="b1" id="changeGearBtn"><span>Change gear</span></button>
        ${cats.length ? `<button class="b2" id="clearFocusBtn">Clear focus</button>` : `<button class="b2" id="adjustBtn">Adjust</button>`}
      </div>` : `${head()}
      ${band(290, `<div class="D wht abs" style="left:22px;top:30px;font-size:76px">Ready<br>when<br>you are</div>
        ${fig('warrior', 'small', 'right:-24px;top:90px;width:170px;height:200px')}`)}
      <p class="pad body muted" style="padding-top:26px">${escapeHtml(gearSentence())} <button class="lnk u" id="changeGearBtn" style="color:var(--ink)">Change gear</button></p>
      <div class="actions push">
        <button class="b1" id="genBtn"><span>Build my workout</span></button>
        <button class="b2" id="adjustBtn">Adjust first</button>
      </div>`;
  } else if(todayView === 'list'){
    const core = coreItems();
    const totalMin = session.items.reduce((s, e) => s + e.duration, 0);
    const target = session.targetMinutes;
    const filled = Math.round(Math.min(totalMin, target) / Math.max(target, 1) * 20);
    const over = totalMin > target ? Math.round((totalMin - target) / totalMin * 20) : 0;
    const meter = Array.from({ length: 20 }, (_, k) => `<i class="${k >= 20 - over ? 'x' : k < filled ? 'f' : ''}"></i>`).join('');
    let round = 0;
    const rows = session.items.map((e, i) => {
      let banner = '';
      if(e.isCircuit && e.round !== round){ round = e.round; banner = `<div class="rbanner"><h2 class="D2">Round ${e.round} of ${e.totalRounds}</h2><i></i></div>`; }
      const ck = `<label class="ckin"><input type="checkbox" data-toggle="${i}" ${e.done ? 'checked' : ''} aria-label="Done: ${escapeAttr(disp(e.name))}"><span class="ck" aria-hidden="true"></span></label>`;
      if(e.isDrinksBreak){
        return `<div class="rw">${ck}${mfig('shoulderroll')}<div class="grow"><div class="t ${e.done ? 'done' : ''}">Drinks break · ${mmss(e.workSeconds)}</div><div class="m">Catch your breath and drink before round ${e.nextRound}</div></div>
          <div class="acts"><button class="lnk" data-remove="${i}" aria-label="Remove drinks break">Remove</button></div></div>`;
      }
      const meta = e.isWarmup ? `${mmss(e.workSeconds)} light pace` : e.isCooldown ? `${Math.round(e.workSeconds / 60)} min stretch`
        : `${mmss(e.workSeconds)} work${e.restSeconds > 0 ? `, ${mmss(e.restSeconds)} rest` : ''}`;
      const back = e.backClass && BACK_WORDS[e.backClass] ? `<div class="k"><b>${BACK_WORDS[e.backClass]}</b>${e.backClass === 'requires-mod' && e.backMod ? ': ' + escapeHtml(lc1(firstSentence(e.backMod))) : ''}</div>` : '';
      return banner + `<div class="rw">${ck}${mfig(patternForExercise(e))}<div class="grow"><div class="t ${e.done ? 'done' : ''}">${escapeHtml(disp(e.name))}</div><div class="m">${meta}</div>${back}</div>
        <div class="acts" style="flex-direction:column;gap:0;align-items:flex-end"><button class="lnk" data-swap="${i}" aria-label="Swap ${escapeAttr(disp(e.name))}">Swap</button><button class="lnk" data-remove="${i}" aria-label="Remove ${escapeAttr(disp(e.name))}">Remove</button></div></div>`;
    }).join('');
    root.innerHTML = `<div class="hdr row lab"><span>Today · ${INT_LABEL[session.intensity] || 'Balanced'}</span><span>${Math.round(totalMin)} of ${target} min</span></div>
      <h1 class="D title l">${session.circuit ? (session.circuitRounds + ' rounds') : (core.length + ' moves')}</h1>
      <div class="meter" role="img" aria-label="${Math.round(totalMin)} of ${target} minutes planned">${meter}</div>
      <div class="pad" id="sessionList" style="margin-top:8px">${rows}</div>
      <div class="pad row" style="margin-top:12px"><button class="lnk" id="addRandomBtn">+ Add a move</button><button class="lnk" id="saveProfileBtn">Save as profile</button></div>
      <div class="actions push">
        ${holdBtn('holdGo', 'Hold to start', 'sm')}
        <div class="row" style="justify-content:space-between"><button class="lnk" id="hideListBtn">Back</button><button class="lnk" id="finishBtn">Already did it? Log it</button><button class="lnk" id="adjustBtn">Adjust</button></div>
      </div>`;
  }

  const on = (id, fn) => { const el = root.querySelector('#' + id); if(el) el.addEventListener('click', fn); };
  // Build my workout: straight to the bottom of the setup page, ready to hold and go
  on('genBtn', () => { setupOpen = true; todayView = 'ready'; generateSession(); scrollToSection('go', true); });
  on('adjustBtn', openAdjust);
  on('changeGearBtn', openGearSheet);
  on('installLink', openInstallSheet);
  on('clearFocusBtn', () => { session.categories = []; lastBuildFailed = false; renderToday(); });
  on('seeListBtn', () => { todayView = 'list'; renderToday(); window.scrollTo(0, 0); });
  on('hideListBtn', () => { todayView = 'ready'; renderToday(); scrollToSection('go', true); });
  on('finishBtn', finishSession);
  on('saveProfileBtn', saveCurrentAsProfile);
  on('addRandomBtn', addRandomToSession);
  bindGo(root, 'readyFig');
  root.querySelectorAll('[data-toggle]').forEach(el => el.addEventListener('change', () => toggleDone(parseInt(el.dataset.toggle))));
  root.querySelectorAll('[data-swap]').forEach(el => el.addEventListener('click', () => swapExercise(parseInt(el.dataset.swap))));
  root.querySelectorAll('[data-remove]').forEach(el => el.addEventListener('click', () => removeSessionItem(parseInt(el.dataset.remove))));
}

/* ---------------- Render: Library ---------------- */
function renderLibrary(){
  const root = document.getElementById('view-library');
  const editing = editingExerciseId ? exercises.find(e => e.id === editingExerciseId) : null;

  if(libraryFormOpen || editing){
    const cat = editing ? editing.category : 'strength';
    const pat = editing ? editing.pattern : PATTERN_FALLBACK_BY_CATEGORY['strength'];
    root.innerHTML = `<div class="hdr row lab"><span>Library</span><button class="lnk" id="cancelEditBtn">Cancel</button></div>
      <h1 class="D title l">${editing ? 'Edit move' : 'New move'}</h1>
      <div class="pad">
        <label class="fl"><span class="lab">Name</span><input class="inp" type="text" id="f-name" placeholder="e.g. Kettlebell swings" value="${editing ? escapeAttr(editing.name) : ''}" autocomplete="off"></label>
        <div class="lab muted" style="margin-top:14px;margin-bottom:6px" id="lblType">Type</div>
        <input type="hidden" id="f-cat" value="${cat}">
        <div class="opts fit" id="fCatGroup">${CATEGORIES.map(c => `<button data-val="${c}">${CAT_LABEL[c]}</button>`).join('')}</div>
        <div class="row" style="gap:16px;align-items:flex-end">
          <label class="fl" style="flex:1"><span class="lab">Minutes</span><input class="inp" type="number" inputmode="numeric" id="f-dur" min="1" max="60" value="${editing ? editing.duration : 5}"></label>
          <label class="fl" style="flex:1.4"><span class="lab">Sets and reps</span><input class="inp" type="text" id="f-sr" placeholder="e.g. 3 x 12" value="${editing ? escapeAttr(editing.setsReps || '') : ''}"></label>
        </div>
        <div class="row" style="gap:12px;align-items:flex-end">
          <label class="fl" style="flex:1"><span class="lab">Figure moves like</span>
            <select class="inp" id="f-pattern">${PATTERN_OPTIONS.map(p => `<option value="${p.key}" ${p.key === pat ? 'selected' : ''}>${p.label}</option>`).join('')}</select></label>
          <div id="fPatFig">${mfig(pat)}</div>
        </div>
        <label class="fl"><span class="lab">Back note</span>
          <select class="inp" id="f-backClass">${Object.keys(BACK_WORDS).map(k => `<option value="${k}" ${editing && editing.backClass === k ? 'selected' : ''}>${BACK_WORDS[k]}</option>`).join('')}</select></label>
        <label class="fl"><span class="lab">Back cue</span><input class="inp sm" type="text" id="f-backMod" placeholder="e.g. Keep your spine long, don't round the lower back" value="${editing ? escapeAttr(editing.backMod || '') : ''}"></label>
        <div class="lab muted" style="margin-top:14px" id="lblGear">Gear</div>
        <div class="opts sm" id="f-equip-grid" role="group" aria-labelledby="lblGear" style="margin-top:6px">${EQUIPMENT_OPTIONS.map(eq => `<button aria-pressed="${exerciseFormEquipment.includes(eq)}" class="${exerciseFormEquipment.includes(eq) ? 'on' : ''}" data-eq="${escapeAttr(eq)}">${gearName(eq)}</button>`).join('')}</div>
        ${editing ? `<button class="lnk" id="delExBtn" style="margin-top:14px">Remove this move</button>` : ''}
      </div>
      <div class="actions push"><button class="b1" id="saveExBtn"><span>${editing ? 'Save changes' : 'Add to library'}</span></button></div>`;
    bindRadios(root.querySelector('#fCatGroup'), { label: 'Type', get: () => root.querySelector('#f-cat').value, set: v => { root.querySelector('#f-cat').value = v; } });
    root.querySelector('#f-pattern').addEventListener('change', e => { root.querySelector('#fPatFig').innerHTML = mfig(e.target.value); });
    root.querySelectorAll('#f-equip-grid [data-eq]').forEach(chip => chip.addEventListener('click', () => {
      const eq = chip.dataset.eq, idx = exerciseFormEquipment.indexOf(eq);
      if(idx > -1) exerciseFormEquipment.splice(idx, 1); else exerciseFormEquipment.push(eq);
      chip.classList.toggle('on'); chip.setAttribute('aria-pressed', exerciseFormEquipment.includes(eq));
    }));
    root.querySelector('#saveExBtn').addEventListener('click', () => {
      if(root.querySelector('#f-name').value.trim()) libraryFormOpen = false;
      saveExerciseForm();
    });
    root.querySelector('#cancelEditBtn').addEventListener('click', () => { editingExerciseId = null; exerciseFormEquipment = []; libraryFormOpen = false; renderLibrary(); });
    const del = root.querySelector('#delExBtn');
    if(del) del.addEventListener('click', () => deleteExercise(editing.id));
    return;
  }

  const head = `<div class="hdr row lab"><span>${exercises.length} moves</span><button class="lnk" id="newMoveBtn">+ New move</button></div>
    <h1 class="D title" style="padding-bottom:0">Library</h1>
    <div class="sub2" role="tablist" aria-label="Library">
      <button role="tab" aria-selected="${libraryTab === 'all'}" class="${libraryTab === 'all' ? 'on' : ''}" data-dtab="all">All moves</button>
      <button role="tab" aria-selected="${libraryTab === 'back'}" class="${libraryTab === 'back' ? 'on' : ''}" data-dtab="back">Back care</button></div>`;
  const row = (e, acts, cue) => `<div class="rw">${mfig(patternForExercise(e))}<div class="grow"><div class="t">${escapeHtml(disp(e.name))}</div>
      <div class="m">${[e.duration + ' min', e.setsReps ? escapeHtml(e.setsReps) : '', (e.equipment || []).map(gearName).map(escapeHtml).join(', ')].filter(Boolean).join(' · ')}</div>
      <div class="k"><b>${BACK_WORDS[e.backClass || 'spine-friendly']}</b>${cue && e.backMod ? ': ' + escapeHtml(lc1(firstSentence(e.backMod))) : ''}</div></div>
      <div class="acts">${acts}</div></div>`;
  const add = e => `<button class="lnk" data-add="${e.id}" aria-label="Add ${escapeAttr(disp(e.name))} to today">Add</button>`;
  const empty = (title, text) => `${band(title.length > 9 ? 330 : 260, `<div class="D wht abs" style="left:22px;top:28px;font-size:${title.length > 9 ? 84 : 72}px">${title}</div>
      ${fig(title.length > 9 ? 'lunge' : 'childspose', 'small', title.length > 9 ? 'right:6px;top:30px;width:200px;height:280px' : 'right:0;top:80px;width:220px;height:170px')}`, 'margin-top:30px')}
      <p class="pad body" style="padding-top:26px">${text}</p>
      <div class="actions push"><button class="b1" id="newMoveBtn2"><span>New move</span></button></div>`;

  let body = '';
  if(libraryTab === 'back'){
    const chips = `<div class="chips" id="backFilterChips" role="radiogroup" aria-label="Back care filter">${[['all', 'All'], ...Object.entries(BACK_WORDS)].map(([k, l]) => `<button data-val="${k}">${l}</button>`).join('')}</div>`;
    const filtered = backFilter === 'all' ? exercises : exercises.filter(e => e.backClass === backFilter);
    if(filtered.length === 0){
      body = chips + empty('None<br>here', `None of your moves ${BACK_NONE[backFilter] || 'match'}. Add your own, or bring one back from the defaults.`);
    } else {
      const classes = backFilter === 'all' ? Object.keys(BACK_CLASSES) : [backFilter];
      body = chips + `<div class="pad" id="backList">${classes.map(k => {
        const g = filtered.filter(e => (e.backClass || 'spine-friendly') === k);
        if(!g.length) return '';
        return `<h2 class="D2 gh" style="font-size:40px">${BACK_WORDS[k]}</h2><p class="body muted" style="margin-top:4px">${BACK_DESC[k]}</p>` + g.map(e => row(e, add(e), true)).join('');
      }).join('')}</div>`;
    }
  } else if(exercises.length === 0){
    body = empty('Empty<br>library', 'Add your first move. Give it a name, the gear it needs and a back cue.');
  } else {
    body = `<div class="pad" id="libList">${CATEGORIES.map(cat => {
      const items = exercises.filter(e => e.category === cat);
      if(!items.length) return '';
      return `<h2 class="D2 gh">${CAT_LABEL[cat]}</h2>` + items.map(e => row(e, add(e) + `<button class="lnk" data-edit="${e.id}" aria-label="Edit ${escapeAttr(disp(e.name))}">Edit</button>`, false)).join('');
    }).join('')}</div>`;
  }
  root.innerHTML = head + body;

  root.querySelectorAll('[data-dtab]').forEach(tab => tab.addEventListener('click', () => { libraryTab = tab.dataset.dtab; renderLibrary(); }));
  const chipsEl = root.querySelector('#backFilterChips');
  if(chipsEl){
    bindRadios(chipsEl, { get: () => backFilter, set: v => { backFilter = v; renderLibrary(); const c = document.querySelector('#backFilterChips [aria-checked="true"]'); if(c){ c.focus(); c.scrollIntoView({ inline: 'center', block: 'nearest' }); } } });
  }
  const openNew = () => { editingExerciseId = null; exerciseFormEquipment = []; libraryFormOpen = true; renderLibrary(); window.scrollTo(0, 0); };
  ['newMoveBtn', 'newMoveBtn2'].forEach(id => { const b = root.querySelector('#' + id); if(b) b.addEventListener('click', openNew); });
  root.querySelectorAll('[data-add]').forEach(el => el.addEventListener('click', () => addToSession(el.dataset.add)));
  root.querySelectorAll('[data-edit]').forEach(el => el.addEventListener('click', () => {
    editingExerciseId = el.dataset.edit;
    const ex = exercises.find(e => e.id === editingExerciseId);
    exerciseFormEquipment = ex ? [...ex.equipment] : [];
    libraryFormOpen = true;
    renderLibrary(); window.scrollTo(0, 0);
  }));
}

/* ---------------- Render: Profiles ---------------- */
function profileLine(p){
  const cats = (p.categories && p.categories.length) ? p.categories.map(c => CAT_LABEL[c]).join(', ').toLowerCase() : 'any focus';
  const moves = p.mode === 'fixed' ? `${(p.exerciseIds || []).length} moves, fixed` : `${p.targetCount || 6} moves, random`;
  return `${p.targetMinutes} min · ${INT_LABEL[p.intensity] || 'Balanced'} · ${uc1(cats)} · ${moves}${p.circuit ? ` · ${p.circuitRounds || 3} rounds` : ''}`;
}
function renderProfiles(){
  const root = document.getElementById('view-profiles');
  const editing = editingProfileId ? profiles.find(p => p.id === editingProfileId) : null;

  if(!profileFormOpen){
    let html = `<div class="hdr row lab"><span>${profiles.length} saved</span><button class="lnk" id="newProfileBtn">+ New profile</button></div><h1 class="D title">Profiles</h1>`;
    if(profiles.length === 0){
      html += `${band(320, `<div class="D wht abs" style="left:22px;top:28px;font-size:84px">None<br>saved</div>
        ${fig('warrior', 'small', 'right:-24px;top:110px;width:170px;height:200px')}`)}
        <p class="pad body" style="padding-top:26px">Save today's workout as a profile, or make one here. Run it again in one tap.</p>
        <div class="actions push"><button class="b1" id="newProfileBtn2"><span>New profile</span></button></div>`;
    } else {
      const [first, ...rest] = profiles;
      const n = first.mode === 'fixed' ? (first.exerciseIds || []).length : (first.targetCount || 6);
      html += `${band(250, `<div class="abs" style="left:22px;top:26px;width:62%"><h2 class="D wht" style="font-size:64px">${escapeHtml(first.name)}</h2></div>
          ${fig('jumpingjack', 'small', 'right:-6px;top:6px;width:130px;height:170px')}
          <div class="lab abs" style="left:22px;bottom:34px">${n} moves · ${first.mode === 'fixed' ? 'fixed' : 'random'} · ${first.targetMinutes} min</div>
          <button class="b1 sm abs" style="right:22px;bottom:18px" data-run="${first.id}" aria-label="Start ${escapeAttr(first.name)}"><span>Start</span></button>`, 'margin-top:14px')}
        <div class="pad row" style="justify-content:flex-start;gap:16px;margin-top:14px"><button class="lnk" data-editp="${first.id}" aria-label="Edit ${escapeAttr(first.name)}">Edit</button><button class="lnk" data-delp="${first.id}" aria-label="Delete ${escapeAttr(first.name)}">Delete</button></div>
        <div class="pad">${rest.map(p => `<div style="border-bottom:1px solid var(--rule);padding:14px 0">
            <h2 class="D2" style="font-size:38px">${escapeHtml(p.name)}</h2>
            <div class="s14" style="margin-top:4px">${escapeHtml(profileLine(p))}</div>
            ${p.note ? `<p class="body" style="font-size:15px;margin-top:4px">${escapeHtml(p.note)}</p>` : ''}
            <div class="row" style="justify-content:flex-start;gap:16px;margin-top:10px"><button class="b1 sm" data-run="${p.id}" aria-label="Start ${escapeAttr(p.name)}"><span>Start</span></button>
              <button class="lnk" data-editp="${p.id}" aria-label="Edit ${escapeAttr(p.name)}">Edit</button><button class="lnk" data-delp="${p.id}" aria-label="Delete ${escapeAttr(p.name)}">Delete</button></div></div>`).join('')}</div>`;
    }
    root.innerHTML = html;
    ['newProfileBtn', 'newProfileBtn2'].forEach(id => { const b = root.querySelector('#' + id); if(b) b.addEventListener('click', startNewProfile); });
    root.querySelectorAll('[data-run]').forEach(el => el.addEventListener('click', async () => {
      const p = profiles.find(x => x.id === el.dataset.run);
      if(p && p.mode === 'fixed' && !(p.exerciseIds || []).some(id => exercises.some(e => e.id === id))){
        const edit = await confirmSheet({ title: `Can't start ${p.name}`, text: 'Every move in this profile has been removed from your library. Edit it to pick new ones.',
          primary: { label: 'Edit profile', value: true }, secondary: { label: 'Close', value: false } });
        if(edit) startEditProfile(p.id);
        return;
      }
      todayView = 'ready'; lastBuildFailed = false; runProfile(el.dataset.run);
    }));
    root.querySelectorAll('[data-editp]').forEach(el => el.addEventListener('click', () => startEditProfile(el.dataset.editp)));
    root.querySelectorAll('[data-delp]').forEach(el => el.addEventListener('click', () => deleteProfile(el.dataset.delp)));
    return;
  }

  const stepper = (id, lbl, v, min, max) => `<div class="fl" style="flex:1"><label class="lab" for="${id}">${lbl}</label><div class="stepper">
      <button class="b2" data-step="${id}:-1" aria-label="Fewer ${lbl.toLowerCase()}">&minus;</button>
      <input class="D" type="number" inputmode="numeric" id="${id}" min="${min}" max="${max}" value="${v}">
      <button class="b2" data-step="${id}:1" aria-label="More ${lbl.toLowerCase()}">+</button></div></div>`;
  root.innerHTML = `<div class="hdr row lab"><span>Profiles</span><button class="lnk" id="cancelProfileFormBtn">Cancel</button></div>
    <h1 class="D title l">${editing ? 'Edit profile' : 'New profile'}</h1>
    <div class="pad">
      <label class="fl"><span class="lab">Name</span><input class="inp" type="text" id="pf-name" placeholder="e.g. Morning circuit" value="${escapeAttr(profileFormName)}" autocomplete="off"></label>
      <div class="lab muted" style="margin-top:16px;margin-bottom:6px">Moves</div>
      <div class="seg" role="radiogroup" aria-label="Moves">
        <button role="radio" id="pf-mode-random" class="${profileFormMode === 'random' ? 'on' : ''}" aria-checked="${profileFormMode === 'random'}"><b>Pick for me</b><i>New mix each time</i></button>
        <button role="radio" id="pf-mode-fixed" class="${profileFormMode === 'fixed' ? 'on' : ''}" aria-checked="${profileFormMode === 'fixed'}"><b>Fixed list</b><i>Same moves</i></button></div>
      <div class="row" style="gap:22px;align-items:flex-start">${stepper('pf-target', 'Minutes', profileFormTargetMinutes, 5, 60)}${stepper('pf-count', 'Moves', profileFormCount, 2, 15)}</div>
      <div class="lab muted" style="margin-top:16px;margin-bottom:6px">Intensity</div>
      <div class="seg" id="pf-intensity-grid">${INT_KEYS.map(k => `<button data-val="${k}" data-pintensity="${k}"><b>${INT_LABEL[k]}</b></button>`).join('')}</div>
      <div class="row" style="margin-top:18px"><div><div class="t17" id="lblPfCirc">Circuit</div><div class="s14">${profileFormCircuitRounds} rounds, drinks break between</div></div>
        <button class="sw" id="pf-circuit" role="switch" aria-labelledby="lblPfCirc" aria-checked="${!!profileFormCircuit}"></button></div>
      <div id="pf-fixed-wrap" style="display:${profileFormMode === 'fixed' ? 'block' : 'none'};margin-top:14px">
        <div class="lab" id="pf-fixed-total" aria-live="polite"></div>
        ${CATEGORIES.map(cat => {
          const items = exercises.filter(e => e.category === cat);
          if(!items.length) return '';
          return `<h2 class="D2 gh" style="font-size:30px;margin-top:8px">${CAT_LABEL[cat]}</h2>` + items.map(e => `<label class="rw" style="padding:9px 0;cursor:pointer">
              <span class="ckin"><input type="checkbox" data-pickex="${e.id}" ${profileFormExerciseIds.includes(e.id) ? 'checked' : ''}><span class="ck" aria-hidden="true"></span></span>
              <span style="flex:1;font-size:17px">${escapeHtml(disp(e.name))}</span><span class="muted" style="font-size:14px">${e.duration} min</span></label>`).join('');
        }).join('')}
      </div>
    </div>
    <div class="actions push"><button class="b1" id="saveProfileFormBtn"><span>${editing ? 'Save changes' : 'Save profile'}</span></button></div>`;

  const updateFixedTotal = () => {
    const total = profileFormExerciseIds.reduce((s, id) => { const e = exercises.find(x => x.id === id); return s + (e ? e.duration : 0); }, 0);
    root.querySelector('#pf-fixed-total').textContent = profileFormExerciseIds.length ? `${profileFormExerciseIds.length} picked · ${total} min` : 'None picked yet';
  };
  updateFixedTotal();
  root.querySelector('#pf-name').addEventListener('input', e => { profileFormName = e.target.value; });
  root.querySelector('#pf-target').addEventListener('input', e => { profileFormTargetMinutes = parseInt(e.target.value) || 20; });
  root.querySelector('#pf-count').addEventListener('input', e => { profileFormCount = parseInt(e.target.value) || 6; });
  root.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => {
    const [id, d] = b.dataset.step.split(':');
    const inp = root.querySelector('#' + id);
    inp.value = clampN((parseInt(inp.value) || 0) + parseInt(d), +inp.min, +inp.max);
    inp.dispatchEvent(new Event('input'));
  }));
  const circ = root.querySelector('#pf-circuit');
  circ.addEventListener('click', () => { profileFormCircuit = !profileFormCircuit; circ.setAttribute('aria-checked', profileFormCircuit); });
  bindRadios(root.querySelector('#pf-intensity-grid'), { label: 'Intensity', get: () => profileFormIntensity, set: v => { profileFormIntensity = v; } });
  const setMode = m => {
    profileFormMode = m;
    [['random', '#pf-mode-random'], ['fixed', '#pf-mode-fixed']].forEach(([k, s]) => { const b = root.querySelector(s); b.classList.toggle('on', m === k); b.setAttribute('aria-checked', m === k); });
    root.querySelector('#pf-fixed-wrap').style.display = m === 'fixed' ? 'block' : 'none';
  };
  root.querySelector('#pf-mode-random').addEventListener('click', () => setMode('random'));
  root.querySelector('#pf-mode-fixed').addEventListener('click', () => setMode('fixed'));
  root.querySelectorAll('[data-pickex]').forEach(cb => cb.addEventListener('change', () => {
    const id = cb.dataset.pickex;
    if(cb.checked){ if(!profileFormExerciseIds.includes(id)) profileFormExerciseIds.push(id); }
    else profileFormExerciseIds = profileFormExerciseIds.filter(x => x !== id);
    updateFixedTotal();
  }));
  root.querySelector('#saveProfileFormBtn').addEventListener('click', saveProfileForm);
  root.querySelector('#cancelProfileFormBtn').addEventListener('click', cancelProfileForm);
}

/* ---------------- Render: History (Log) ---------------- */
let logTab = 'sessions';   // 'sessions' | 'progress'
const dayKey = d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const isNonMove = n => /^(Warm-(Up|Down)|Drinks Break)/i.test(String(n || ''));
// Everything on the Progress tab comes from the saved log, nothing else.
function progressStats(now = new Date()){
  const inMonth = (d, y, m) => d.getFullYear() === y && d.getMonth() === m;
  const dated = history.map(h => ({ h, d: new Date(h.date) })).filter(x => !isNaN(x.d));
  const month = dated.filter(x => inMonth(x.d, now.getFullYear(), now.getMonth()));
  const minutes = month.reduce((t, x) => t + (Number(x.h.actualMinutes) || 0), 0);
  // best month yet: strictly more than every earlier month that has sessions
  const perMonth = {};
  dated.forEach(x => { const k = x.d.getFullYear() * 12 + x.d.getMonth(); perMonth[k] = (perMonth[k] || 0) + 1; });
  const cur = now.getFullYear() * 12 + now.getMonth();
  const earlier = Object.keys(perMonth).map(Number).filter(k => k < cur);
  const best = month.length > 0 && earlier.length > 0 && earlier.every(k => perMonth[k] < month.length);
  // streak: consecutive days with a session, ending today (or yesterday if today has none yet)
  const days = new Set(dated.map(x => dayKey(x.d)));
  const c = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if(!days.has(dayKey(c))) c.setDate(c.getDate() - 1);
  let streak = 0;
  while(days.has(dayKey(c))){ streak++; c.setDate(c.getDate() - 1); }
  // most done: the move ticked off most often this month (warm-ups and drinks breaks don't count)
  const count = {};
  month.forEach(x => (x.h.exercises || []).forEach(e => { if(e.done && !isNonMove(e.name)) count[e.name] = (count[e.name] || 0) + 1; }));
  const top = Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  // sessions per week, last 7 weeks (Monday starts), oldest first
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
  const weeks = Array.from({ length: 7 }, (_, i) => {
    const a = new Date(monday); a.setDate(a.getDate() - 7 * (6 - i));
    const b = new Date(a); b.setDate(b.getDate() + 7);
    return dated.filter(x => x.d >= a && x.d < b).length;
  });
  return { done: month.length, minutes, best, streak, mostDone: top ? top[0] : null, weeks };
}
function progressHtml(){
  const st = progressStats();
  const xs = [0, 60, 120, 180, 240, 300, 390];
  const max = Math.max(1, ...st.weeks);
  const ys = st.weeks.map(n => Math.round(225 - n / max * 107));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const row = (k, v, last) => `<div class="rw" style="justify-content:space-between;padding:4px 0${last ? ';border:0' : ''}"><span>${k}</span><span class="D" style="font-size:34px" data-stat="${k}">${v}</span></div>`;
  return `<div class="D" style="font-size:130px;padding:14px 14px 0" id="progDone">${st.done}<span style="font-size:48px"> done</span></div>
    <div class="lab muted" style="padding:4px 22px 0">${st.done === 1 ? 'session' : 'sessions'} finished${st.best ? ', best month yet' : ' this month'}</div>
    <div style="position:relative;margin-top:44px;height:250px" role="img" aria-label="Sessions per week, last 7 weeks: ${st.weeks.join(', ')}">
      <svg viewBox="0 0 390 250" preserveAspectRatio="none" style="display:block;position:absolute;left:0;top:0;width:100%;height:250px" aria-hidden="true">
        <defs><linearGradient id="pg" x1="0" y1="1" x2=".35" y2="0"><stop offset="0" stop-color="#B3200C"/><stop offset=".38" stop-color="#E2401A"/><stop offset=".72" stop-color="#F2762A"/><stop offset="1" stop-color="#F9A63C"/></linearGradient></defs>
        <polygon points="0,250 ${pts} 390,250" fill="url(#pg)"/>
        <polyline points="${pts}" fill="none" stroke="#0B0B0B" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg>
      ${fig('tree', 'mini', `left:calc(${(xs[5] - 70) / 390 * 100}%);top:${ys[5] - 152}px;width:118px;height:160px`)}
      <div class="lab wht abs" style="left:22px;bottom:12px">Sessions per week</div></div>
    <div class="pad" style="padding-top:2px">
      ${row('Minutes', st.minutes)}
      ${row('Streak', st.streak === 1 ? '1 day' : `${st.streak} days`, !st.mostDone)}
      ${st.mostDone ? row('Most done', escapeHtml(disp(st.mostDone)), true) : ''}</div>`;
}

/* ---------------- Render: Welcome (first run only) ---------------- */
function renderWelcome(){
  const root = document.getElementById('view-welcome');
  root.innerHTML = `<div class="hdr lab">On Track</div><h1 class="D title" style="font-size:100px">Build it.<br>Run it.</h1>
    ${band(380, `${fig('highknees', '', 'right:0;top:20px;width:240px;height:330px')}
      <div class="lab abs" style="left:22px;bottom:34px;line-height:1.5">5 to 60 min<br>${exercises.length} moves<br>A back note<br>on every one</div>`)}
    <p class="pad body" style="padding-top:26px">Tell it your gear and how long you've got. It builds the workout and counts you through every move.</p>
    <div class="actions push"><button class="b1 tall" id="getStartedBtn"><span>Get started</span></button></div>`;
  setView('welcome');
  root.querySelector('#getStartedBtn').addEventListener('click', () => {
    markWelcomed();
    document.getElementById('tabbar').style.display = 'flex';
    setView('today');
    renderToday();
    openGearSheet();
  });
}

function logDate(iso){ return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
function renderHistory(){
  const root = document.getElementById('view-history');
  const now = new Date();
  const month = history.filter(h => { const d = new Date(h.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length;
  const head = `<div class="hdr lab">${logTab === 'progress' ? 'This month' : !history.length ? 'Nothing yet' : `${month} this month`}</div><h1 class="D title">Log</h1>
    <div class="sub2" role="tablist" aria-label="Log">
      <button role="tab" aria-selected="${logTab === 'sessions'}" class="${logTab === 'sessions' ? 'on' : ''}" data-ltab="sessions">Sessions</button>
      <button role="tab" aria-selected="${logTab === 'progress'}" class="${logTab === 'progress' ? 'on' : ''}" data-ltab="progress">Progress</button></div>`;
  const bindTabs = () => root.querySelectorAll('[data-ltab]').forEach(t => t.addEventListener('click', () => { logTab = t.dataset.ltab; renderHistory(); }));
  if(logTab === 'progress'){ root.innerHTML = head + progressHtml(); bindTabs(); return; }
  if(history.length === 0){
    root.innerHTML = `${head}${band(320, `<div class="D wht abs" style="left:22px;top:28px;font-size:76px">No<br>sessions<br>yet</div>
        ${fig('jumprope', 'small', 'right:-16px;top:60px;width:170px;height:230px')}`, 'margin-top:30px')}
      <p class="pad body" style="padding-top:26px">Finish a workout and it lands here, with every move you did.</p>
      <div class="actions push"><button class="b1" id="goTodayBtn"><span>Go to today</span></button></div>`;
    root.querySelector('#goTodayBtn').addEventListener('click', () => setView('today'));
    bindTabs();
    return;
  }
  root.innerHTML = head + `<div class="pad">${history.map(h => {
    const d = new Date(h.date);
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
    return `<div class="rw" style="padding:12px 0"><div class="grow"><h2 class="D2" style="font-size:34px">${logDate(h.date)}</h2>
        <div class="m">${time} · ${h.actualMinutes} min · ${h.completedCount} of ${h.totalCount} · ${INT_LABEL[h.intensity] || 'Balanced'}${h.circuit ? ' · Circuit' : ''}</div></div>
        <button class="lnk" data-toggle-hist="${h.id}" aria-expanded="false" aria-controls="hb-${h.id}">Open</button></div>
      <div id="hb-${h.id}" hidden style="border-bottom:1px solid var(--rule);padding:4px 0 12px">
        ${h.exercises.map(e => `<div class="row" style="padding:7px 0;font-size:16px;${e.done ? '' : 'color:var(--ink2)'}"><span>${e.done ? '&#10003; ' : 'Skipped: '}${escapeHtml(disp(e.name))}</span><span class="muted">${Math.max(1, Math.round(e.duration))} min</span></div>`).join('')}
        <button class="lnk" data-delhist="${h.id}" style="margin-top:6px">Delete this session</button></div>`;
  }).join('')}</div>`;
  bindTabs();
  root.querySelectorAll('[data-toggle-hist]').forEach(el => el.addEventListener('click', () => {
    const b = document.getElementById('hb-' + el.dataset.toggleHist);
    b.hidden = !b.hidden;
    el.setAttribute('aria-expanded', !b.hidden);
    el.textContent = b.hidden ? 'Open' : 'Close';
  }));
  root.querySelectorAll('[data-delhist]').forEach(el => el.addEventListener('click', ev => { ev.stopPropagation(); deleteHistoryEntry(el.dataset.delhist); }));
}
async function deleteHistoryEntry(id){
  const h = history.find(x => x.id === id);
  const ok = await confirmSheet({ title: 'Delete this session?', text: `${h ? logDate(h.date) + ', ' + h.actualMinutes + ' min. ' : ''}It comes off your log and out of your progress.`,
    primary: { label: 'Delete', value: true }, secondary: { label: 'Keep it', value: false } });
  if(!ok) return;
  history = history.filter(h => h.id !== id);
  await saveHistory();
  renderHistory();
}

async function saveExerciseForm(){
  const name = document.getElementById('f-name').value.trim();
  const category = document.getElementById('f-cat').value;
  const duration = parseInt(document.getElementById('f-dur').value) || 5;
  const setsReps = document.getElementById('f-sr').value.trim();
  const pattern = document.getElementById('f-pattern').value;
  const backClass = document.getElementById('f-backClass').value;
  const backMod = document.getElementById('f-backMod').value.trim();
  const equipment = [...exerciseFormEquipment];
  if(!name){ showToast('Give it a name first'); return; }

  if(editingExerciseId){
    const ex = exercises.find(e=>e.id===editingExerciseId);
    if(ex){
      ex.name = name;
      ex.category = category;
      ex.duration = duration;
      ex.setsReps = setsReps;
      ex.pattern = pattern;
      ex.backClass = backClass;
      ex.backMod = backMod;
      ex.equipment = equipment;
      showToast('Updated "'+name+'"');
    }
    editingExerciseId = null;
  }else{
    exercises.push({
      id: uid(),
      name,
      category,
      duration,
      setsReps,
      pattern,
      backClass,
      backMod,
      equipment
    });
    showToast('Added "'+name+'" to library');
  }
  await saveExercises();
  exerciseFormEquipment = [];
  renderLibrary();
}

async function deleteExercise(id){
  const ex = exercises.find(e=>e.id===id);
  const ok = await confirmSheet({ title: `Remove ${ex ? disp(ex.name) : 'this move'}?`, text: 'It comes out of your library. Saved profiles that list it will run without it.',
    primary: { label: 'Remove', value: true }, secondary: { label: 'Keep it', value: false } });
  if(!ok) return;
  if(editingExerciseId === id){ editingExerciseId = null; libraryFormOpen = false; exerciseFormEquipment = []; }
  exercises = exercises.filter(e=>e.id!==id);
  await saveExercises();
  renderLibrary();
}

/* ---------------- Workout Player (Timer + Voice + Drinks Break + Circuit) ---------------- */
const PREP_SECONDS = 3;
let player = { active:false, index:0, phase:'idle', remaining:0, paused:false, timerId:null };
let lastIllustrationIndex = -1;

function fmtClock(totalSeconds){
  const m = Math.floor(totalSeconds/60), s = totalSeconds%60;
  return m + ':' + String(s).padStart(2,'0');
}

function startWorkout(){
  if(session.items.length===0){ showToast('Generate a session first'); return; }
  session.items.forEach(e=> e.done=false);
  player.active = true; player.index = 0; player.paused = false;
  lastIllustrationIndex = -1;
  requestScreenWakeLock();
  playBeep(880, 0.15);
  buildPlayerSkeleton();
  document.getElementById('playerOverlay').classList.add('show');
  beginPrep();
}

function closePlayerOverlay(){
  clearTimeout(player.timerId);
  try{ window.speechSynthesis.cancel(); }catch(e){}
  releaseScreenWakeLock();
  player.active = false;
  document.getElementById('playerOverlay').classList.remove('show');
  closeSheet(true);
  document.body.style.overflow = '';
  renderToday();
}

async function finishAndClosePlayer(){
  closePlayerOverlay();
  await finishSession();
}

function beginPrep(){
  if(!player.active) return;
  const ex = session.items[player.index];

  if(ex.isDrinksBreak){
    player.phase = 'work'; // Drinks break begins immediately as active countdown
    player.remaining = ex.workSeconds || 45;
    speak(`Drinks break! Round ${ex.roundJustCompleted} complete. Grab some water and reset for Round ${ex.nextRound}.`);
    renderPlayer();
    clearTimeout(player.timerId);
    player.timerId = setTimeout(workTick, 1000);
    return;
  }

  player.phase = 'prep';
  player.remaining = ex.restSeconds || PREP_SECONDS;

  if(ex.isCircuit && ex.exerciseIndex === 0 && ex.round > 1){
    speak(`Round ${ex.round}. First up: ${ex.name}`);
  } else {
    speak((player.index===0 ? 'First up: ' : 'Next up: ') + ex.name);
  }

  renderPlayer();
  clearTimeout(player.timerId);
  player.timerId = setTimeout(prepTick, 1400);
}

function prepTick(){
  if(!player.active) return;
  if(player.paused){ player.timerId = setTimeout(prepTick, 300); return; }
  if(player.remaining > 0){
    if(player.remaining <= 3){
      speak(String(player.remaining));
      playBeep(750, 0.12);
      vibrateDevice([60]);
    }
    renderPlayer();
    player.remaining--;
    player.timerId = setTimeout(prepTick, 1000);
  }else{
    speak('Go!');
    playBeep(1100, 0.25, 'triangle');
    vibrateDevice([200]);
    beginWork();
  }
}

function beginWork(){
  if(!player.active) return;
  player.phase = 'work';
  const ex = session.items[player.index];
  player.remaining = ex.workSeconds || (Math.max(ex.duration,1) * 60);
  renderPlayer();
  clearTimeout(player.timerId);
  player.timerId = setTimeout(workTick, 1000);
}

function workTick(){
  if(!player.active) return;
  if(player.paused){ player.timerId = setTimeout(workTick, 300); return; }
  const ex = session.items[player.index];
  const totalWork = ex.workSeconds || (Math.max(ex.duration,1) * 60);

  if(player.remaining > 0){
    if(ex.isDrinksBreak){
      // Special voice and chime alerts during Drinks Break
      if(player.remaining === 10){
        speak(`10 seconds. Get ready for Round ${ex.nextRound}`);
        playBeep(920, 0.18);
        vibrateDevice([100, 50, 100]);
      } else if(player.remaining <= 3){
        speak(String(player.remaining));
        playBeep(800, 0.12);
        vibrateDevice([60]);
      }
    } else {
      // Standard exercise mid-set cues
      if(player.remaining === 30 && totalWork >= 45){
        speak('30 seconds left');
        playBeep(880, 0.18);
        vibrateDevice([100, 50, 100]);
      }else if(player.remaining === 15 && totalWork >= 60){
        speak('15 seconds');
        playBeep(880, 0.12);
        vibrateDevice([80]);
      }else if(player.remaining === 10){
        playBeep(920, 0.15);
        vibrateDevice([80]);
      }else if(player.remaining <= 3){
        speak(String(player.remaining));
        playBeep(800, 0.12);
        vibrateDevice([60]);
      }
    }

    renderPlayer();
    player.remaining--;
    player.timerId = setTimeout(workTick, 1000);
  }else{
    playBeep(1150, 0.3, 'triangle');
    vibrateDevice([250, 80, 250]);
    finishCurrentExercise();
  }
}

function finishCurrentExercise(){
  session.items[player.index].done = true;
  if(player.index < session.items.length - 1){
    player.index++;
    beginPrep();
  }else{
    completeWorkout();
  }
}

function skipExercise(){
  clearTimeout(player.timerId);
  if(player.index < session.items.length - 1){
    player.index++;
    beginPrep();
  }else{
    completeWorkout();
  }
}

function togglePause(){
  player.paused = !player.paused;
  if(player.paused){ try{ window.speechSynthesis.cancel(); }catch(e){} }
  else if(player.phase==='prep'){ speak('Resuming'); }
  renderPlayer();
}

function completeWorkout(){
  player.phase = 'done';
  clearTimeout(player.timerId);
  releaseScreenWakeLock();
  speak('Workout complete. Fantastic job!');
  playBeep(1200, 0.4, 'sine');
  vibrateDevice([150, 80, 150, 80, 300]);
  renderPlayer();
}

async function endWorkoutEarly(){
  // window.confirm() used to block the clock while it was open; hold it the same way.
  const wasPaused = player.paused;
  player.paused = true;
  renderPlayer();
  const done = session.items.filter(e => e.done).length;
  const end = await confirmSheet({ title: 'End now?', text: `You've done ${done} of ${session.items.length}. This session won't be logged unless you finish it.`,
    primary: { label: 'Keep going', value: false }, secondary: { label: 'End workout', value: true } });
  if(!end){ player.paused = wasPaused; if(player.active) renderPlayer(); return; }
  player.paused = wasPaused;
  closePlayerOverlay();
}

let playerCtlMode = null, playerSkip = null, playerFigIndex = -1;
function buildPlayerSkeleton(){
  const ov = document.getElementById('playerOverlay');
  ov.innerHTML = `<div class="wrap" id="pLive">
      <div class="ptop lab"><span id="pStepLabel"></span><span id="pPhaseLabel" aria-live="polite"></span></div>
      <div class="segs" id="pSegs" aria-hidden="true"></div>
      <div class="band"><div class="in">
        <div class="D wht p-big" id="pTimerLabel" role="timer" aria-atomic="true"></div>
        <div class="lab wht p-sub" id="pSubLabel"></div>
        <div class="D p-count" id="pCount" aria-hidden="true"></div>
        <div class="fig p-fig" id="pIllustration" aria-hidden="true"></div>
        <h2 class="D p-name" id="pNameLabel" aria-live="polite"></h2>
      </div></div>
      <p class="p-cue" id="pSetsRepsLabel"></p>
      <div class="p-next lab muted" id="pNextLabel"></div>
      <div class="p-ctl" id="pBottomControls"></div>
    </div>
    <div class="wrap p-done" id="pDone" hidden></div>`;
  playerCtlMode = null; playerSkip = null; playerFigIndex = -1;
  if(!ov.dataset.keys){
    ov.dataset.keys = '1';
    ov.addEventListener('keydown', e => {
      if(e.key === 'Escape' && player.active && player.phase !== 'done' && !document.querySelector('#sheetRoot .sheet')){ e.preventDefault(); endWorkoutEarly(); }
    });
  }
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const b = ov.querySelector('#pPauseBtn'); if(b) b.focus({ preventScroll: true }); }, 50);
}

const ROUND_WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
function renderPlayer(){
  const ov = document.getElementById('playerOverlay');
  if(!ov.querySelector('#pLive')) buildPlayerSkeleton();
  const live = ov.querySelector('#pLive'), donePane = ov.querySelector('#pDone');
  const $ = id => ov.querySelector('#' + id);
  ov.classList.toggle('is-paused', !!player.paused);

  if(player.phase === 'done'){
    const completed = session.items.filter(e => e.done).length;
    const doneSec = session.items.filter(e => e.done).reduce((s, e) => s + itemSeconds(e), 0);
    const doneRounds = session.items.filter(e => e.done && e.isCircuit).reduce((m, e) => Math.max(m, e.round), 0);
    const totalRounds = (session.items.find(e => e.isCircuit) || {}).totalRounds;
    live.hidden = true; donePane.hidden = false;
    donePane.innerHTML = `<div class="hdr lab">Workout complete</div><h2 class="D title" id="pDoneTitle">Done</h2>
      ${band(330, `<div class="abs" style="left:22px;top:28px"><div class="D wht" style="font-size:104px">${completed}/${session.items.length}</div><div class="lab wht" style="margin-top:8px">Moves finished</div></div>
        ${fig('tree', 'small', 'right:6px;top:40px;width:150px;height:260px')}`)}
      <div class="pad" style="padding-top:22px">
        <div class="rw"><span>Time</span><span class="D">${mmss(doneSec)}</span></div>
        ${totalRounds ? `<div class="rw" style="border:0"><span>Rounds</span><span class="D">${doneRounds} of ${totalRounds}</span></div>` : ''}</div>
      <div class="actions push"><button class="b1" id="pFinishBtn"><span>Log it</span></button><button class="b2" id="pCloseBtn">Close without logging</button></div>`;
    donePane.querySelector('#pFinishBtn').addEventListener('click', finishAndClosePlayer);
    donePane.querySelector('#pCloseBtn').addEventListener('click', closePlayerOverlay);
    donePane.querySelector('#pFinishBtn').focus({ preventScroll: true });
    playerCtlMode = 'done';
    return;
  }
  live.hidden = false; donePane.hidden = true;

  const ex = session.items[player.index];
  const n = session.items.length, prep = player.phase === 'prep';
  const roundStart = ex.isCircuit && ex.exerciseIndex === 0 && ex.round > 1 && prep;
  const next = session.items[player.index + 1];

  // top line + progress segments
  let step;
  if(ex.isDrinksBreak) step = `Round ${ex.roundJustCompleted} complete`;
  else if(ex.isWarmup) step = `Warm-up · ${player.index + 1} / ${n}`;
  else if(ex.isCooldown) step = `Warm-down · ${player.index + 1} / ${n}`;
  else if(ex.isCircuit) step = `Round ${ex.round}${roundStart ? ` of ${ex.totalRounds}` : ''} · move ${(ex.exerciseIndex || 0) + 1} of ${ex.exerciseTotal || session.targetCount}`;
  else step = `Move ${player.index + 1} of ${n}`;
  $('pStepLabel').textContent = step;
  $('pPhaseLabel').textContent = player.paused ? 'Paused' : ex.isDrinksBreak ? 'Drinks break' : prep ? 'Get ready' : 'Work';
  const segs = $('pSegs');
  if(segs.children.length !== n) segs.innerHTML = '<i></i>'.repeat(n);
  [...segs.children].forEach((s, k) => s.className = k < player.index ? 'd' : k === player.index ? 'c' : '');

  // figure: rebuilt only when the move changes, so his loop never restarts mid-set
  const pat = ex.isDrinksBreak ? 'shoulderroll' : patternForExercise(ex);
  const fe = $('pIllustration');
  if(playerFigIndex !== player.index){ fe.innerHTML = buildFigureSVG(pat, 'small'); playerFigIndex = player.index; }
  fe.className = 'fig p-fig' + (player.paused ? ' paused' : LOW_PATTERNS.includes(pat) ? ' low' : roundStart ? ' round' : '');

  // the big number
  const big = $('pTimerLabel'), sub = $('pSubLabel'), cnt = $('pCount');
  big.className = 'D wht p-big'; big.style.fontSize = ''; sub.textContent = ''; cnt.textContent = '';
  if(player.paused){
    big.classList.add('paused'); big.textContent = 'Paused';
    sub.textContent = `${mmss(player.remaining)} left on this ${prep ? 'count-in' : 'move'}`;
  } else if(roundStart){
    big.classList.add('round'); big.innerHTML = `Round<br>${ROUND_WORDS[ex.round] || ex.round}`;
    cnt.textContent = player.remaining > 0 ? player.remaining : 'Go';
  } else {
    const t = prep ? (player.remaining > 0 ? String(player.remaining) : 'Go') : (player.remaining >= 60 ? fmtClock(player.remaining) : String(player.remaining));
    big.textContent = t;
    big.style.fontSize = (prep && t.length === 1 ? 300 : t.length <= 2 ? 220 : t.length === 4 ? 180 : 150) + 'px';
  }
  $('pNameLabel').textContent = ex.isDrinksBreak ? 'Drinks break' : moveName(ex.name);

  // cue + next
  let cue;
  if(player.paused) cue = 'Take your time. The clock waits for you.';
  else if(ex.isDrinksBreak){
    const first = session.items.find(i => i.isCircuit && i.round === ex.nextRound);
    cue = `Take a sip of water and get your breath back. Round ${ex.nextRound}${first ? ` starts with ${escapeHtml(lc1(moveName(first.name)))}` : ' is next'}.`;
  } else if(ex.isWarmup || !ex.backClass || !BACK_WORDS[ex.backClass]) cue = escapeHtml(ex.backMod || '');
  else cue = `<b>${BACK_WORDS[ex.backClass]}:</b> ${escapeHtml(lc1(ex.backMod || ''))}`;
  $('pSetsRepsLabel').innerHTML = cue;
  const nextText = !next ? 'Last one' : next.isDrinksBreak ? `${prep ? 'Then' : 'Next'}: drinks break` :
    (next.isCircuit && ex.isDrinksBreak) ? `Next: round ${next.round}` : `${prep ? 'Then' : 'Next'}: ${lc1(moveName(next.name))}`;
  const nextEl = $('pNextLabel');

  // controls: built once per mode so a drag on the skip plate survives the clock ticking
  const mode = player.paused ? 'paused' : 'run';
  const bottom = $('pBottomControls');
  if(playerCtlMode !== mode){
    const hadFocus = bottom.contains(document.activeElement) ? document.activeElement.id : null;
    bottom.innerHTML = `<div class="rail" id="pSkipRail"><span class="fb"></span><span class="tx lab" id="pSkipText"></span><span class="th" aria-hidden="true"><span>&raquo;</span></span></div>
      <button class="b1" id="pPauseBtn"><span>${player.paused ? 'Resume' : 'Pause'}</span></button>`;
    playerSkip = bindSlide(bottom.querySelector('#pSkipRail'), { label: 'Slide to skip', text: () => bottom.querySelector('#pSkipText').textContent, onDone: skipExercise });
    bottom.querySelector('#pPauseBtn').addEventListener('click', togglePause);
    playerCtlMode = mode;
    if(hadFocus){ const f = bottom.querySelector('#' + hadFocus); if(f) f.focus({ preventScroll: true }); }
  }
  bottom.querySelector('#pSkipText').textContent = `Slide to skip · ${nextText.replace(/^(Then|Next): /, 'next: ')}`;
  if(playerSkip) playerSkip.refresh();
  if(player.paused){
    if(!nextEl.querySelector('#pEndBtn')){
      nextEl.innerHTML = `<button class="lnk" id="pEndBtn" style="color:var(--ink)">End workout</button>`;
      nextEl.querySelector('#pEndBtn').addEventListener('click', endWorkoutEarly);
    }
  } else {
    nextEl.textContent = nextText;
  }
}

/* ---------------- Utils ---------------- */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function escapeAttr(str){ return escapeHtml(str); }

/* ---------------- Init ---------------- */
async function init(){
  await loadData();
  document.getElementById('main').innerHTML = `
    <div class="view active" id="view-today"></div>
    <div class="view" id="view-library"></div>
    <div class="view" id="view-profiles"></div>
    <div class="view" id="view-history"></div>
    <div class="view" id="view-welcome"></div>
  `;
  document.getElementById('tabbar').style.display = firstRun ? 'none' : 'flex';
  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click', ()=>{
      // Tapping Today again goes back from the list to the ready screen
      if(t.dataset.view==='today' && todayView==='list' && document.getElementById('view-today').classList.contains('active')){ todayView='ready'; renderToday(); }
      setView(t.dataset.view);
    });
  });
  uiReady = true;
  renderToday();
  renderLibrary();
  renderProfiles();
  renderHistory();
  if(firstRun) renderWelcome();
}
init();
