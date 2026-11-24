let exercises = [];
let history = [];
let profiles = [];
let userEquipment = [];
const EQUIPMENT_ICONS = {
  "Bodyweight": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.2"/><path d="M12 7v6.5M8 9.5l4 2 4-2M9 20.5l3-7 3 7"/></svg>`,
    sub: "Calisthenics"
  },
  "Dumbbells": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14M3 7.5v9M9 7.5v9M6 12h12M18 5v14M15 7.5v9M21 7.5v9"/></svg>`,
    sub: "Free weights"
  },
  "Kettlebell": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8a4 4 0 0 1 8 0M7 8h10a5 5 0 0 1 5 5c0 4-3 7-7 7H9c-4 0-7-3-7-7a5 5 0 0 1 5-5z"/></svg>`,
    sub: "Cast iron"
  },
  "Resistance Band": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="4.5" transform="rotate(-25 12 12)"/><ellipse cx="12" cy="12" rx="6" ry="2.5" transform="rotate(-25 12 12)"/></svg>`,
    sub: "Tension bands"
  },
  "Chair/Bench": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="10" width="18" height="3" rx="1.5"/><line x1="6" y1="13" x2="4" y2="20"/><line x1="18" y1="13" x2="20" y2="20"/><line x1="5" y1="16.5" x2="19" y2="16.5"/></svg>`,
    sub: "Flat bench"
  },
  "Wall": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3.5" width="16" height="17" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="12" y1="3.5" x2="12" y2="9"/><line x1="8" y1="9" x2="8" y2="15"/><line x1="16" y1="9" x2="16" y2="15"/><line x1="12" y1="15" x2="12" y2="20.5"/></svg>`,
    sub: "Vertical plane"
  },
  "Jump rope": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3.5" width="3" height="7" rx="1"/><rect x="17" y="3.5" width="3" height="7" rx="1"/><path d="M5.5 10.5c0 7.5 13 7.5 13 0"/></svg>`,
    sub: "Speed rope"
  },
  "Stairs": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h4.5v-4h4.5v-4H17.5V7H21"/></svg>`,
    sub: "Step incline"
  },
  "Pull-up Bar": {
    svg: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="6" x2="22" y2="6"/><line x1="6" y1="6" x2="6" y2="16"/><line x1="18" y1="6" x2="18" y2="16"/><circle cx="6" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>`,
    sub: "Bar rig"
  }
};
const FOCUS_OPTIONS = [
  { 
    key: "strength", 
    label: "Strength", 
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16M2 7v10M10 7v10M6 12h12M18 4v16M14 7v10M22 7v10"/></svg>` 
  },
  { 
    key: "cardio", 
    label: "Cardio", 
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/><path d="M8 12h2.5l1.5 -3l2 6l1.5 -3h2"/></svg>` 
  },
  { 
    key: "core", 
    label: "Core", 
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a12 12 0 0 0 8.5 3A12 12 0 0 1 12 21 12 12 0 0 1 3.5 6 12 12 0 0 0 12 3z"/><path d="M12 7.5v9M8.5 11h7M9.5 14.5h5"/></svg>` 
  },
  { 
    key: "mobility", 
    label: "Mobility", 
    svg: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c3-4 6-4 9 0s6 4 9 0M2 7c3-3 6-3 9 0s6 3 9 0M2 17c3-3 6-3 9 0s6 3 9 0"/></svg>` 
  }
];
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
  categories: ["strength", "cardio", "core", "mobility"], 
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
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===name));
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
  setView('history');
}

async function saveCurrentAsProfile(){
  if(session.items.length === 0){ showToast('Generate a session first'); return; }
  const name = prompt('Name this profile:', '');
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
  if(!confirm('Delete this profile?')) return;
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

/* ---------------- Render: Today ---------------- */
function renderToday(){
  const root = document.getElementById('view-today');
  if(!root) return;

  const coreCount = session.items.filter(i => !i.isWarmup && !i.isCooldown && !i.isDrinksBreak).length;
  const totalDuration = session.items.reduce((s,e) => s + e.duration, 0);

  const intensityVal = session.intensity === 'steady' ? 1 : session.intensity === 'hiit' ? 3 : 2;

  root.innerHTML = `
    <!-- 1. Equipment Selection at the Top -->
    <div class="section-title">Equipment Available</div>
    <div class="equipment-grid" id="gearGrid">
      ${EQUIPMENT_OPTIONS.map(eq => {
        const isSelected = userEquipment.includes(eq);
        const meta = EQUIPMENT_ICONS[eq] || { svg: "", sub: "" };
        return `
          <button type="button" class="equipment-tile ${isSelected ? 'active' : ''}" data-geq="${escapeAttr(eq)}">
            <span class="tile-dot"></span>
            <div class="tile-icon-svg">${meta.svg}</div>
            <span class="tile-label">${escapeHtml(eq)}</span>
          </button>
        `;
      }).join('')}
    </div>

    <!-- 7. Focus Area: Prominent 4-Tile Selection -->
    <div class="section-title">Focus Area</div>
    <div class="focus-grid" id="focusGrid">
      ${FOCUS_OPTIONS.map(f => {
        const isActive = session.categories.includes(f.key);
        return `
          <button type="button" class="focus-card ${isActive ? 'active' : ''}" data-cat="${f.key}">
            <div class="focus-icon-wrap">${f.svg}</div>
            <div class="focus-name">${f.label}</div>
            <div class="focus-check">✓</div>
          </button>
        `;
      }).join('')}
    </div>

    <!-- 3 & 4. Main Adjusters: Time & Exercises Sliders -->
    <div class="section-title">Workout Adjusters</div>
    <div class="slider-metric-card">
      <div class="slider-metric-header">
        <span class="slider-metric-label">Total Time</span>
        <span class="slider-metric-value"><span id="timeValDisplay">${session.targetMinutes}</span><small>min</small></span>
      </div>
      <div class="slider-stepper-row">
        <button type="button" class="stepper-btn" id="timeDecBtn" aria-label="Decrease time">−</button>
        <input type="range" min="5" max="60" step="1" value="${session.targetMinutes}" id="timeSlider" class="studio-slider">
        <button type="button" class="stepper-btn" id="timeIncBtn" aria-label="Increase time">+</button>
      </div>
    </div>

    <div class="slider-metric-card">
      <div class="slider-metric-header">
        <span class="slider-metric-label">Exercises</span>
        <span class="slider-metric-value"><span id="countValDisplay">${session.targetCount}</span><small>moves</small></span>
      </div>
      <div class="slider-stepper-row">
        <button type="button" class="stepper-btn" id="countDecBtn" aria-label="Decrease exercises">−</button>
        <input type="range" min="2" max="15" step="1" value="${session.targetCount}" id="countSlider" class="studio-slider">
        <button type="button" class="stepper-btn" id="countIncBtn" aria-label="Increase exercises">+</button>
      </div>
    </div>

    <!-- 5. Workout Intensity: 3 Clean Interactive Stops (No Slider) -->
    <div class="intensity-card">
      <div class="intensity-header">
        <span class="intensity-label">Intensity</span>
        <span class="intensity-tag" id="intensityLabel">${session.intensity.toUpperCase()}</span>
      </div>
      <div class="intensity-stops" id="intensityStops">
        <button type="button" class="intensity-stop-btn ${session.intensity==='steady'?'active':''}" data-intensity="steady">
          <div class="stop-name">Steady</div>
          <div class="stop-rest">Longer Rest</div>
        </button>
        <button type="button" class="intensity-stop-btn ${session.intensity==='balanced'?'active':''}" data-intensity="balanced">
          <div class="stop-name">Balanced</div>
          <div class="stop-rest">Moderate Pace</div>
        </button>
        <button type="button" class="intensity-stop-btn ${session.intensity==='hiit'?'active':''}" data-intensity="hiit">
          <div class="stop-name">HIIT</div>
          <div class="stop-rest">Max Burn</div>
        </button>
      </div>
    </div>

    <!-- 6 & 2. Circuit Mode & Discreet Warm-Up / Cool-Down -->
    <div class="options-row-card">
      <div class="circuit-toggle-wrap">
        <span class="circuit-label">Circuit Mode</span>
        <label class="circuit-switch">
          <input type="checkbox" id="circuitToggle" ${session.circuit ? 'checked' : ''}>
          <span class="circuit-slider-ui"></span>
        </label>
      </div>
      <div class="circuit-rounds-selector" id="circuitRoundsChips" style="${session.circuit ? '' : 'display:none;'}">
        ${[2, 3, 4, 5].map(r => `<button type="button" class="round-chip ${session.circuitRounds===r?'active':''}" data-crounds="${r}">${r} Rounds</button>`).join('')}
      </div>
      <div class="warmup-discreet-row">
        <label class="discreet-check-label">
          <input type="checkbox" id="warmupToggle" ${session.warmup ? 'checked' : ''}>
          <span>Warm-Up</span>
        </label>
        <label class="discreet-check-label">
          <input type="checkbox" id="cooldownToggle" ${session.cooldown ? 'checked' : ''}>
          <span>Warm-Down</span>
        </label>
      </div>
    </div>

    <!-- 8. Single Elegant Summary Bar + Generate Workout Button -->
    <div class="summary-bar" id="summaryBar">
      <span id="sumTime">${session.targetMinutes} MIN</span>
      <span class="summary-dot"></span>
      <span id="sumMoves">${session.circuit ? `${session.circuitRounds} ROUNDS` : `${session.targetCount} MOVES`}</span>
      <span class="summary-dot"></span>
      <span id="sumIntensity">${session.intensity.toUpperCase()}</span>
    </div>
    <button type="button" class="btn-black-pill" id="genBtn">Generate Workout</button>
    <div style="text-align:center; margin:8px 0 4px;">
      <button type="button" class="btn-link-builder" id="openBuilderLink">Or build custom routine &rarr;</button>
    </div>

    <!-- 9 & 10. Generated Workout (Ultra-Clean Minimalist List) -->
    ${session.items.length > 0 ? `
      <div class="session-summary-card">
        <div class="session-summary-title">Today's Workout</div>
        <div class="session-summary-meta">${Math.round(totalDuration)} MIN · ${coreCount} MOVES</div>
      </div>
      <div id="sessionList"></div>
      <button type="button" class="btn-black-pill" id="startWorkoutBtn" style="margin-top:14px;">Start Workout</button>
      <button type="button" class="btn-ghost-pill" id="addRandomBtn">+ Add Exercise</button>
      <button type="button" class="btn-ghost-pill" id="finishBtn">Finish &amp; Log Session</button>
      <button type="button" class="btn-ghost-pill" id="saveProfileBtn">Save As Profile</button>
    ` : `
      <div style="text-align:center; padding:32px 16px; color:var(--ink-secondary); font-size:14px; font-weight:500;">
        Set your workout parameters above and tap Generate Workout.
      </div>
    `}
  `;

  // Render Workout List Items (Minimalist: Stick Figure + Name + Swap + Check)
  if(session.items.length > 0){
    const list = document.getElementById('sessionList');
    if(list){
      let currentRenderRound = 0;
      list.innerHTML = session.items.map((e, i) => {
        let roundBanner = '';
        if(e.isCircuit && e.round !== currentRenderRound && !e.isDrinksBreak){
          currentRenderRound = e.round;
          roundBanner = `<div class="circuit-round-badge">ROUND ${e.round} OF ${e.totalRounds}</div>`;
        }

        if(e.isDrinksBreak){
          return `
            <div class="drinks-break-row">
              <span class="drinks-break-icon">💧</span>
              <div class="drinks-break-text">Drinks Break · ${e.workSeconds}s</div>
              <div class="check-circle-clean ${e.done ? 'done' : ''}" data-toggle="${i}" style="margin-left:auto;">✓</div>
            </div>
          `;
        }

        return roundBanner + `
          <div class="ex-row-clean">
            <div class="ex-fig-clean">${buildFigureSVG(patternForExercise(e), 'small mini')}</div>
            <div class="ex-name-clean ${e.done ? 'done' : ''}">${escapeHtml(e.name)}</div>
            <div class="ex-controls-clean">
              <button type="button" class="btn-swap-clean" data-swap="${i}" title="Swap exercise">↻</button>
              <div class="check-circle-clean ${e.done ? 'done' : ''}" data-toggle="${i}">✓</div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Summary Bar live updater
  const updateSummaryBar = () => {
    const sumTime = document.getElementById('sumTime');
    const sumMoves = document.getElementById('sumMoves');
    const sumIntensity = document.getElementById('sumIntensity');
    if(sumTime) sumTime.textContent = `${session.targetMinutes} MIN`;
    if(sumMoves) sumMoves.textContent = session.circuit ? `${session.circuitRounds} ROUNDS` : `${session.targetCount} MOVES`;
    if(sumIntensity) sumIntensity.textContent = session.intensity.toUpperCase();
  };

  // 1. Equipment Selection
  root.querySelectorAll('#gearGrid .equipment-tile').forEach(tile => {
    tile.addEventListener('click', async () => {
      const eq = tile.dataset.geq;
      const idx = userEquipment.indexOf(eq);
      if(idx > -1) userEquipment.splice(idx, 1);
      else userEquipment.push(eq);
      tile.classList.toggle('active');
      await saveUserEquipment();
    });
  });

  // 7. Focus Area Selection
  root.querySelectorAll('#focusGrid .focus-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.cat;
      const idx = session.categories.indexOf(cat);
      if(idx > -1){
        session.categories.splice(idx, 1);
      } else {
        session.categories.push(cat);
      }
      card.classList.toggle('active');
    });
  });

  // 3. Time Slider & Steppers
  const timeSlider = document.getElementById('timeSlider');
  if(timeSlider){
    timeSlider.addEventListener('input', (e) => {
      session.targetMinutes = parseInt(e.target.value, 10);
      const valDisp = document.getElementById('timeValDisplay');
      if(valDisp) valDisp.textContent = session.targetMinutes;
      updateSummaryBar();
      rescaleIfNeeded();
    });
  }
  const timeDecBtn = document.getElementById('timeDecBtn');
  if(timeDecBtn){
    timeDecBtn.addEventListener('click', () => {
      session.targetMinutes = Math.max(5, session.targetMinutes - 1);
      const s = document.getElementById('timeSlider');
      if(s) s.value = session.targetMinutes;
      const valDisp = document.getElementById('timeValDisplay');
      if(valDisp) valDisp.textContent = session.targetMinutes;
      updateSummaryBar();
      rescaleIfNeeded();
    });
  }
  const timeIncBtn = document.getElementById('timeIncBtn');
  if(timeIncBtn){
    timeIncBtn.addEventListener('click', () => {
      session.targetMinutes = Math.min(60, session.targetMinutes + 1);
      const s = document.getElementById('timeSlider');
      if(s) s.value = session.targetMinutes;
      const valDisp = document.getElementById('timeValDisplay');
      if(valDisp) valDisp.textContent = session.targetMinutes;
      updateSummaryBar();
      rescaleIfNeeded();
    });
  }

  // 4. Exercise Count Slider & Steppers
  const countSlider = document.getElementById('countSlider');
  if(countSlider){
    countSlider.addEventListener('input', (e) => {
      session.targetCount = parseInt(e.target.value, 10);
      const valDisp = document.getElementById('countValDisplay');
      if(valDisp) valDisp.textContent = session.targetCount;
      updateSummaryBar();
    });
    countSlider.addEventListener('change', () => {
      if(session.items.length > 0) generateSession();
    });
  }
  const countDecBtn = document.getElementById('countDecBtn');
  if(countDecBtn){
    countDecBtn.addEventListener('click', () => {
      session.targetCount = Math.max(2, session.targetCount - 1);
      const s = document.getElementById('countSlider');
      if(s) s.value = session.targetCount;
      const valDisp = document.getElementById('countValDisplay');
      if(valDisp) valDisp.textContent = session.targetCount;
      updateSummaryBar();
      if(session.items.length > 0) generateSession();
    });
  }
  const countIncBtn = document.getElementById('countIncBtn');
  if(countIncBtn){
    countIncBtn.addEventListener('click', () => {
      session.targetCount = Math.min(15, session.targetCount + 1);
      const s = document.getElementById('countSlider');
      if(s) s.value = session.targetCount;
      const valDisp = document.getElementById('countValDisplay');
      if(valDisp) valDisp.textContent = session.targetCount;
      updateSummaryBar();
      if(session.items.length > 0) generateSession();
    });
  }

  // 5. Workout Intensity (3 Clean Stop Buttons)
  root.querySelectorAll('.intensity-stop-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      session.intensity = btn.dataset.intensity;
      const label = document.getElementById('intensityLabel');
      if(label) label.textContent = session.intensity.toUpperCase();
      root.querySelectorAll('.intensity-stop-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.intensity === session.intensity);
      });
      updateSummaryBar();
      if(session.items.length > 0) rescaleIfNeeded();
    });
  });

  // 6. Circuit Mode & Rounds
  const circuitToggle = document.getElementById('circuitToggle');
  if(circuitToggle){
    circuitToggle.addEventListener('change', (e) => {
      session.circuit = e.target.checked;
      const roundsWrap = document.getElementById('circuitRoundsChips');
      if(roundsWrap) roundsWrap.style.display = session.circuit ? 'flex' : 'none';
      updateSummaryBar();
      if(session.items.length > 0) generateSession();
    });
  }
  root.querySelectorAll('#circuitRoundsChips .round-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      session.circuitRounds = parseInt(chip.dataset.crounds, 10);
      root.querySelectorAll('#circuitRoundsChips .round-chip').forEach(c => {
        c.classList.toggle('active', c === chip);
      });
      updateSummaryBar();
      if(session.items.length > 0) generateSession();
    });
  });

  // 2. Discreet Warm-Up / Cool-Down
  const warmupToggle = document.getElementById('warmupToggle');
  if(warmupToggle){
    warmupToggle.addEventListener('change', (e) => {
      session.warmup = e.target.checked;
      if(session.items.length > 0) generateSession();
    });
  }
  const cooldownToggle = document.getElementById('cooldownToggle');
  if(cooldownToggle){
    cooldownToggle.addEventListener('change', (e) => {
      session.cooldown = e.target.checked;
      if(session.items.length > 0) generateSession();
    });
  }

  // 8. Generate Button & Builder link
  const genBtn = document.getElementById('genBtn');
  if(genBtn) genBtn.addEventListener('click', generateSession);
  const openBLink = document.getElementById('openBuilderLink');
  if(openBLink) openBLink.addEventListener('click', openBuilder);

  // Bottom action buttons
  const finishBtn = document.getElementById('finishBtn');
  if(finishBtn) finishBtn.addEventListener('click', finishSession);
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if(saveProfileBtn) saveProfileBtn.addEventListener('click', saveCurrentAsProfile);
  const addRandomBtn = document.getElementById('addRandomBtn');
  if(addRandomBtn) addRandomBtn.addEventListener('click', addRandomToSession);
  const startWorkoutBtn = document.getElementById('startWorkoutBtn');
  if(startWorkoutBtn) startWorkoutBtn.addEventListener('click', startWorkout);

  // 10. List row item interactions (check & swap)
  root.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => toggleDone(parseInt(el.dataset.toggle, 10)));
  });
  root.querySelectorAll('[data-swap]').forEach(el => {
    el.addEventListener('click', () => swapExercise(parseInt(el.dataset.swap, 10)));
  });
}

/* ---------------- Render: Library ---------------- */
function renderLibrary(){
  const root = document.getElementById('view-library');
  const editing = editingExerciseId ? exercises.find(e=>e.id===editingExerciseId) : null;

  root.innerHTML = `
    <div class="dir-selector">
      <div class="dir-tab ${libraryTab==='all'?'active':''}" data-dtab="all">All Exercises</div>
      <div class="dir-tab ${libraryTab==='back'?'active':''}" data-dtab="back">Back &amp; Spine Directory</div>
    </div>

    ${libraryTab==='back' ? `
      <div class="panel">
        <div class="eyebrow">Back Health &amp; Spine Classifications</div>
        <div class="panel-sub">Targeted directory detailing spine-safe alternatives, core stabilization, and modification cues for lower back protection.</div>
        
        <div class="chip-grid" id="backFilterChips" style="margin-top:12px;">
          <div class="chip ${backFilter==='all'?'on':''}" data-bfilter="all">All Movements</div>
          <div class="chip ${backFilter==='spine-friendly'?'on':''}" data-bfilter="spine-friendly" style="border-color:#6fcf7c; color:#6fcf7c;">Spine Friendly</div>
          <div class="chip ${backFilter==='stabilizer'?'on':''}" data-bfilter="stabilizer" style="border-color:#2fd8ff; color:#2fd8ff;">Core Stabilizer</div>
          <div class="chip ${backFilter==='decompression'?'on':''}" data-bfilter="decompression" style="border-color:#9fe0ff; color:#9fe0ff;">Decompression</div>
          <div class="chip ${backFilter==='requires-mod'?'on':''}" data-bfilter="requires-mod" style="border-color:#e5a13d; color:#e5a13d;">Needs Mod</div>
        </div>
      </div>
      <div id="backList"></div>
    ` : `
      <div class="panel">
        <div class="eyebrow">${editing ? 'Edit exercise' : 'Add exercise'}</div>
        <div class="field">
          <label>Name</label>
          <input type="text" id="f-name" placeholder="e.g. Kettlebell Swings" value="${editing?escapeAttr(editing.name):''}">
        </div>
        <div class="field-row">
          <div class="field">
            <label>Category</label>
            <select id="f-cat">
              ${CATEGORIES.map(c=>`<option value="${c}" ${editing&&editing.category===c?'selected':''}>${CAT_LABEL[c]}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label>Duration (min)</label>
            <input type="number" id="f-dur" min="1" max="60" value="${editing?editing.duration:5}">
          </div>
        </div>
        <div class="field">
          <label>Sets / reps (optional)</label>
          <input type="text" id="f-sr" placeholder="e.g. 3 x 12" value="${editing?escapeAttr(editing.setsReps||''):''}">
        </div>
        <div class="field">
          <label>Movement style (for the animation)</label>
          <select id="f-pattern">
            ${PATTERN_OPTIONS.map(p=>`<option value="${p.key}" ${editing?(editing.pattern===p.key?'selected':''):(p.key===PATTERN_FALLBACK_BY_CATEGORY[editing?editing.category:'strength']?'selected':'')}>${p.label}</option>`).join('')}
          </select>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Back Classification</label>
            <select id="f-backClass">
              <option value="spine-friendly" ${editing&&editing.backClass==='spine-friendly'?'selected':''}>Spine Friendly</option>
              <option value="stabilizer" ${editing&&editing.backClass==='stabilizer'?'selected':''}>Core Stabilizer</option>
              <option value="decompression" ${editing&&editing.backClass==='decompression'?'selected':''}>Decompression</option>
              <option value="requires-mod" ${editing&&editing.backClass==='requires-mod'?'selected':''}>Caution / Requires Mod</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label>Back Modification &amp; Safety Cue</label>
          <input type="text" id="f-backMod" placeholder="e.g. Keep spine neutral, avoid rounding lower back" value="${editing?escapeAttr(editing.backMod||''):''}">
        </div>
        <div class="field">
          <label>Equipment needed (tap all that apply)</label>
          <div class="chip-grid" id="f-equip-grid">
            ${EQUIPMENT_OPTIONS.map(eq=>`<div class="chip teal ${exerciseFormEquipment.includes(eq)?'on':''}" data-eq="${escapeAttr(eq)}">${eq}</div>`).join('')}
          </div>
        </div>
        <button class="btn btn-primary" id="saveExBtn" style="margin-top:6px;">${editing?'Update exercise':'Add to library'}</button>
        ${editing?'<button class="btn btn-ghost" id="cancelEditBtn">Cancel</button>':''}
      </div>
      <div id="libList"></div>
    `}
  `;

  // Directory switcher tab listeners
  root.querySelectorAll('.dir-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      libraryTab = tab.dataset.dtab;
      renderLibrary();
    });
  });

  if(libraryTab === 'back'){
    root.querySelectorAll('#backFilterChips .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        backFilter = chip.dataset.bfilter;
        renderLibrary();
      });
    });

    const backListRoot = document.getElementById('backList');
    let filtered = exercises;
    if(backFilter !== 'all'){
      filtered = exercises.filter(e => e.backClass === backFilter);
    }

    if(filtered.length === 0){
      backListRoot.innerHTML = `<div class="empty"><p>No exercises match this back classification filter.</p></div>`;
    }else{
      const classesToRender = backFilter === 'all' ? Object.keys(BACK_CLASSES) : [backFilter];
      backListRoot.innerHTML = classesToRender.map(clsKey => {
        const bInfo = BACK_CLASSES[clsKey];
        const groupExercises = filtered.filter(e => (e.backClass || 'spine-friendly') === clsKey);
        if(groupExercises.length === 0) return '';
        return `
          <div style="margin:20px 0 10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="tag back-badge" style="border:1px solid ${bInfo.color}; color:${bInfo.color}; font-size:11px; padding:3px 8px;">
                ${bInfo.label}
              </span>
            </div>
            <div class="panel-sub" style="margin-top:4px;">${bInfo.desc}</div>
          </div>
          ${groupExercises.map(e => `
            <div class="ex-card" style="align-items:flex-start; margin-bottom:12px;">
              <div class="ex-illustration" style="margin-top:8px;">${buildFigureSVG(patternForExercise(e), 'small mini')}</div>
              <div class="ex-body">
                <div class="ex-name" style="font-size:16px;">${escapeHtml(e.name)}</div>
                <div class="ex-meta">
                  <span class="tag">${CAT_LABEL[e.category]||'Exercise'}</span>
                  <span>${e.duration} min</span>
                  ${(e.equipment||[]).map(eq=>`<span class="tag gear">${escapeHtml(eq)}</span>`).join('')}
                </div>
                <div class="back-mod-box">
                  <strong>Spine Cue / Modification:</strong>
                  ${escapeHtml(e.backMod || 'Maintain neutral spine alignment throughout the set.')}
                </div>
              </div>
              <div class="ex-actions" style="margin-top:6px;">
                <button class="icon-btn" data-add="${e.id}" title="Add to today">+</button>
              </div>
            </div>
          `).join('')}
        `;
      }).join('');
    }

    backListRoot.querySelectorAll('[data-add]').forEach(el => el.addEventListener('click', () => addToSession(el.dataset.add)));
    return;
  }

  // All Exercises view handlers
  root.querySelectorAll('#f-equip-grid .chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const eq = chip.dataset.eq;
      const idx = exerciseFormEquipment.indexOf(eq);
      if(idx>-1) exerciseFormEquipment.splice(idx,1); else exerciseFormEquipment.push(eq);
      chip.classList.toggle('on');
    });
  });

  const listRoot = document.getElementById('libList');
  if(exercises.length===0){
    listRoot.innerHTML = `<div class="empty"><div class="glyph">&#9776;</div><p>Your library is empty.<br>Add your first exercise above.</p></div>`;
  }else{
    listRoot.innerHTML = CATEGORIES.map(cat=>{
      const items = exercises.filter(e=>e.category===cat);
      if(items.length===0) return '';
      return `<div class="cat-group-title">${CAT_LABEL[cat]}</div>` + items.map(e=>`
        <div class="ex-card">
          <div class="ex-illustration">${buildFigureSVG(patternForExercise(e), 'small mini')}</div>
          <div class="ex-body">
            <div class="ex-name">${escapeHtml(e.name)}</div>
            <div class="ex-meta">
              <span>${e.duration} min</span>
              ${e.setsReps?`<span>${escapeHtml(e.setsReps)}</span>`:''}
              ${(e.equipment||[]).map(eq=>`<span class="tag gear">${escapeHtml(eq)}</span>`).join('')}
            </div>
          </div>
          <div class="ex-actions">
            <button class="icon-btn" data-add="${e.id}" title="Add to today">+</button>
            <button class="icon-btn" data-edit="${e.id}" title="Edit">&#9998;</button>
            <button class="icon-btn" data-del="${e.id}" title="Delete">&#10005;</button>
          </div>
        </div>
      `).join('');
    }).join('');
  }

  document.getElementById('saveExBtn').addEventListener('click', saveExerciseForm);
  const cancelBtn = document.getElementById('cancelEditBtn');
  if(cancelBtn) cancelBtn.addEventListener('click', ()=>{ editingExerciseId=null; exerciseFormEquipment=[]; renderLibrary(); });
  listRoot.querySelectorAll('[data-add]').forEach(el=>el.addEventListener('click', ()=>addToSession(el.dataset.add)));
  listRoot.querySelectorAll('[data-edit]').forEach(el=>el.addEventListener('click', ()=>{
    editingExerciseId = el.dataset.edit;
    const ex = exercises.find(e=>e.id===editingExerciseId);
    exerciseFormEquipment = ex ? [...ex.equipment] : [];
    renderLibrary(); window.scrollTo(0,0);
  }));
  listRoot.querySelectorAll('[data-del]').forEach(el=>el.addEventListener('click', ()=>deleteExercise(el.dataset.del)));
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
  if(!confirm('Remove this exercise from your library?')) return;
  exercises = exercises.filter(e=>e.id!==id);
  await saveExercises();
  renderLibrary();
}

/* ---------------- Render: Profiles ---------------- */
function renderProfiles(){
  const root = document.getElementById('view-profiles');
  const editing = editingProfileId ? profiles.find(p=>p.id===editingProfileId) : null;

  let html = `<div class="eyebrow" style="margin-bottom:12px;">Saved Profiles</div>`;

  if(!profileFormOpen){
    if(profiles.length===0){
      html += `<div class="empty"><div class="glyph">&#9881;</div><p>No profiles yet.<br>Save today's workout as a profile or create one below.</p></div>`;
    }else{
      html += profiles.map(p=>{
        const catText = (p.categories&&p.categories.length) ? p.categories.map(c=>CAT_LABEL[c]).join(', ') : 'All focuses';
        const exCount = p.mode==='fixed' ? (p.exerciseIds||[]).length + ' exercises' : 'Random selection';
        const circuitText = p.circuit ? ` · Circuit (${p.circuitRounds || 3} Rnds)` : '';
        const intBadge = p.intensity === 'steady' ? '🟢 Steady' : p.intensity === 'hiit' ? '🔴 HIIT' : '🟡 Balanced';
        return `
        <div class="profile-card">
          <div class="profile-top">
            <div class="profile-name">${escapeHtml(p.name)}</div>
            <div class="mode-badge ${p.mode}">${p.mode==='fixed'?'Fixed':'Random'}</div>
          </div>
          <div class="profile-sub">${p.targetMinutes} min · ${intBadge} · ${catText} · ${exCount}${circuitText}</div>
          ${p.note?`<div class="panel-sub">${escapeHtml(p.note)}</div>`:''}
          <div class="profile-actions">
            <button class="btn btn-primary btn-sm" data-run="${p.id}">Start</button>
            <button class="btn btn-ghost btn-sm" data-editp="${p.id}">Edit</button>
            <button class="btn btn-danger btn-sm" data-delp="${p.id}">Delete</button>
          </div>
        </div>`;
      }).join('');
    }
    html += `<button class="btn btn-primary" id="newProfileBtn" style="margin-top:12px;">+ New Profile</button>`;
  }else{
    const fixedDisplay = profileFormMode==='fixed' ? 'block' : 'none';
    html += `
    <div class="panel">
      <div class="eyebrow">${editing?'Edit Profile':'New Profile'}</div>
      <div class="field" style="margin-top:12px;">
        <label>Name</label>
        <input type="text" id="pf-name" placeholder="e.g. Morning Circuit" value="${escapeAttr(profileFormName)}">
      </div>
      <div class="field">
        <label>Mode</label>
        <div class="chip-grid">
          <div class="chip ${profileFormMode==='random'?'on':''}" id="pf-mode-random">Random Each Time</div>
          <div class="chip ${profileFormMode==='fixed'?'on':''}" id="pf-mode-fixed">Fixed List</div>
        </div>
      </div>
      <div class="field-row">
        <div class="field">
          <label>Target Time (min)</label>
          <input type="number" id="pf-target" min="5" max="60" value="${profileFormTargetMinutes}">
        </div>
        <div class="field">
          <label>Exercises</label>
          <input type="number" id="pf-count" min="2" max="15" value="${profileFormCount}">
        </div>
      </div>
      <div class="field">
        <label>Intensity</label>
        <div class="chip-grid" id="pf-intensity-grid">
          <div class="chip ${profileFormIntensity==='steady'?'on':''}" data-pintensity="steady">Steady</div>
          <div class="chip ${profileFormIntensity==='balanced'?'on':''}" data-pintensity="balanced">Balanced</div>
          <div class="chip ${profileFormIntensity==='hiit'?'on':''}" data-pintensity="hiit">HIIT</div>
        </div>
      </div>
      <div class="field">
        <label class="toggle-label">
          <input type="checkbox" id="pf-circuit" ${profileFormCircuit?'checked':''}>
          <span>Circuit Mode</span>
        </label>
      </div>

      <div class="field" id="pf-fixed-wrap" style="display:${fixedDisplay}; margin-top:14px;">
        <label>Pick Exercises <span id="pf-fixed-total" style="color:var(--accent);"></span></label>
        ${CATEGORIES.map(cat=>{
          const items = exercises.filter(e=>e.category===cat);
          if(items.length===0) return '';
          return `<div class="cat-group-title" style="font-size:14px; margin:14px 0 6px;">${CAT_LABEL[cat]}</div>` +
            items.map(e=>`
              <div class="pick-row">
                <input type="checkbox" data-pickex="${e.id}" ${profileFormExerciseIds.includes(e.id)?'checked':''}>
                <div class="pick-name">${escapeHtml(e.name)}</div>
                <div class="pick-dur">${e.duration} min</div>
              </div>
            `).join('');
        }).join('')}
      </div>
      <button class="btn btn-primary" id="saveProfileFormBtn" style="margin-top:16px;">${editing?'Update Profile':'Save Profile'}</button>
      <button class="btn btn-ghost" id="cancelProfileFormBtn">Cancel</button>
    </div>
    `;
  }

  root.innerHTML = html;

  if(!profileFormOpen){
    const newBtn = document.getElementById('newProfileBtn');
    if(newBtn) newBtn.addEventListener('click', startNewProfile);
    root.querySelectorAll('[data-run]').forEach(el=>el.addEventListener('click', ()=>runProfile(el.dataset.run)));
    root.querySelectorAll('[data-editp]').forEach(el=>el.addEventListener('click', ()=>startEditProfile(el.dataset.editp)));
    root.querySelectorAll('[data-delp]').forEach(el=>el.addEventListener('click', ()=>deleteProfile(el.dataset.delp)));
  }else{
    const updateFixedTotal = ()=>{
      const total = profileFormExerciseIds.reduce((s,id)=>{ const e=exercises.find(x=>x.id===id); return s+(e?e.duration:0); },0);
      const el = document.getElementById('pf-fixed-total');
      if(el) el.textContent = profileFormExerciseIds.length ? `(${total} min total)` : '';
    };
    updateFixedTotal();

    document.getElementById('pf-name').addEventListener('input', (e)=>{ profileFormName = e.target.value; });
    const pfTarget = document.getElementById('pf-target');
    if(pfTarget) pfTarget.addEventListener('input', (e)=>{ profileFormTargetMinutes = parseInt(e.target.value)||20; });
    const pfCount = document.getElementById('pf-count');
    if(pfCount) pfCount.addEventListener('input', (e)=>{ profileFormCount = parseInt(e.target.value)||6; });
    const pfCircuit = document.getElementById('pf-circuit');
    if(pfCircuit) pfCircuit.addEventListener('change', (e)=>{ profileFormCircuit = e.target.checked; });

    root.querySelectorAll('#pf-intensity-grid .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        profileFormIntensity = chip.dataset.pintensity;
        root.querySelectorAll('#pf-intensity-grid .chip').forEach(c => c.classList.toggle('on', c.dataset.pintensity === profileFormIntensity));
      });
    });

    document.getElementById('pf-mode-random').addEventListener('click', ()=>{
      profileFormMode='random';
      document.getElementById('pf-mode-random').classList.add('on');
      document.getElementById('pf-mode-fixed').classList.remove('on');
      document.getElementById('pf-fixed-wrap').style.display='none';
    });
    document.getElementById('pf-mode-fixed').addEventListener('click', ()=>{
      profileFormMode='fixed';
      document.getElementById('pf-mode-fixed').classList.add('on');
      document.getElementById('pf-mode-random').classList.remove('on');
      document.getElementById('pf-fixed-wrap').style.display='block';
    });
    root.querySelectorAll('[data-pickex]').forEach(cb=>{
      cb.addEventListener('change', ()=>{
        const id = cb.dataset.pickex;
        if(cb.checked){ if(!profileFormExerciseIds.includes(id)) profileFormExerciseIds.push(id); }
        else{ profileFormExerciseIds = profileFormExerciseIds.filter(x=>x!==id); }
        updateFixedTotal();
      });
    });
    document.getElementById('saveProfileFormBtn').addEventListener('click', saveProfileForm);
    document.getElementById('cancelProfileFormBtn').addEventListener('click', cancelProfileForm);
  }
}

/* ---------------- Render: History ---------------- */
function renderHistory(){
  const root = document.getElementById('view-history');
  if(history.length===0){
    root.innerHTML = `<div class="empty"><div class="glyph">&#9202;</div><p>No sessions logged yet.<br>Finish a workout to see your history here.</p></div>`;
    return;
  }
  root.innerHTML = history.map(h=>{
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'});
    const timeStr = d.toLocaleTimeString(undefined, {hour:'numeric', minute:'2-digit'});
    const circuitTag = h.circuit ? ' · CIRCUIT' : '';
    const intBadge = h.intensity === 'steady' ? ' · 🟢 STEADY' : h.intensity === 'hiit' ? ' · 🔴 HIIT' : ' · 🟡 BALANCED';
    return `
    <div class="hist-card">
      <div class="hist-head" data-toggle-hist="${h.id}">
        <div>
          <div class="hist-date">${dateStr}</div>
          <div class="hist-sub">${timeStr} &middot; ${h.actualMinutes} MIN &middot; ${h.completedCount}/${h.totalCount} DONE${intBadge}${circuitTag}</div>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <button class="icon-btn" data-delhist="${h.id}" title="Delete">&#10005;</button>
          <div class="icon-btn" style="border:none;">&#9662;</div>
        </div>
      </div>
      <div class="hist-body" id="hb-${h.id}">
        ${h.exercises.map(e=>`
          <div class="hist-ex ${e.done?'was-done':''}">
            <span>${e.done?'&#10003; ':''}${escapeHtml(e.name)}</span>
            <span>${e.duration} min</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }).join('');

  root.querySelectorAll('[data-toggle-hist]').forEach(el=>{
    el.addEventListener('click', ()=>{
      document.getElementById('hb-'+el.dataset.toggleHist).classList.toggle('open');
    });
  });
  root.querySelectorAll('[data-delhist]').forEach(el=>{
    el.addEventListener('click', (ev)=>{
      ev.stopPropagation();
      deleteHistoryEntry(el.dataset.delhist);
    });
  });
}
async function deleteHistoryEntry(id){
  if(!confirm('Delete this logged session?')) return;
  history = history.filter(h=>h.id!==id);
  await saveHistory();
  renderHistory();
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
  document.getElementById('playerOverlay').classList.add('show');
  beginPrep();
}

function closePlayerOverlay(){
  clearTimeout(player.timerId);
  try{ window.speechSynthesis.cancel(); }catch(e){}
  releaseScreenWakeLock();
  player.active = false;
  document.getElementById('playerOverlay').classList.remove('show');
  renderToday();
}

function endWorkoutEarly(){
  if(!confirm('End this workout now?')) return;
  closePlayerOverlay();
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

function renderPlayer(){
  const ex = session.items[player.index];
  const stepLabel = document.getElementById('pStepLabel');
  const phaseLabel = document.getElementById('pPhaseLabel');
  const nameLabel = document.getElementById('pNameLabel');
  const timerLabel = document.getElementById('pTimerLabel');
  const srLabel = document.getElementById('pSetsRepsLabel');
  const nextLabel = document.getElementById('pNextLabel');
  const bottom = document.getElementById('pBottomControls');

  if(player.phase === 'done'){
    const completed = session.items.filter(e=>e.done).length;
    stepLabel.textContent = 'WORKOUT COMPLETE';
    phaseLabel.textContent = '';
    phaseLabel.className = 'player-phase done';
    nameLabel.textContent = '';
    document.getElementById('pIllustration').innerHTML = '';
    timerLabel.textContent = '';
    srLabel.textContent = '';
    nextLabel.textContent = '';
    bottom.innerHTML = `
      <div class="player-done-summary">
        <div class="big">${completed} / ${session.items.length}</div>
        <div class="lbl">EXERCISES COMPLETED</div>
      </div>
      <button class="btn btn-primary" id="pFinishBtn">Finish &amp; log session</button>
      <button class="btn btn-ghost" id="pCloseBtn">Close</button>
    `;
    document.getElementById('pFinishBtn').addEventListener('click', finishAndClosePlayer);
    document.getElementById('pCloseBtn').addEventListener('click', closePlayerOverlay);
    return;
  }

  if(ex.isDrinksBreak){
    stepLabel.textContent = `DRINKS BREAK · ROUND ${ex.roundJustCompleted} COMPLETE`;
    phaseLabel.className = 'player-phase break';
    phaseLabel.textContent = 'Hydrate & Recover';
    nameLabel.textContent = 'Drinks Break';
    srLabel.textContent = `Take a sip of water · Next: Round ${ex.nextRound}`;
    document.getElementById('pIllustration').innerHTML = `
      <div style="font-size:72px; line-height:1; display:flex; align-items:center; justify-content:center; height:100%; filter:drop-shadow(0 0 16px rgba(47,216,255,0.4));">💧</div>
    `;
    lastIllustrationIndex = -1;
  } else if(ex.isCircuit){
    stepLabel.textContent = `ROUND ${ex.round} OF ${ex.totalRounds} · MOVE ${(ex.exerciseIndex || 0) + 1} OF ${ex.exerciseTotal || session.targetCount}`;
    srLabel.textContent = `Round ${ex.round} of ${ex.totalRounds}`;
    phaseLabel.className = 'player-phase ' + player.phase;
    phaseLabel.textContent = player.phase==='prep' ? 'Get ready' : 'Work';
    nameLabel.textContent = ex.name;

    if(player.index !== lastIllustrationIndex){
      document.getElementById('pIllustration').innerHTML = buildFigureSVG(patternForExercise(ex), 'small');
      lastIllustrationIndex = player.index;
    }
  } else {
    stepLabel.textContent = `EXERCISE ${player.index+1} OF ${session.items.length}`;
    srLabel.textContent = ex.setsReps || '';
    phaseLabel.className = 'player-phase ' + player.phase;
    phaseLabel.textContent = player.phase==='prep' ? 'Get ready' : 'Work';
    nameLabel.textContent = ex.name;

    if(player.index !== lastIllustrationIndex){
      document.getElementById('pIllustration').innerHTML = buildFigureSVG(patternForExercise(ex), 'small');
      lastIllustrationIndex = player.index;
    }
  }

  if(player.phase==='prep'){
    timerLabel.className = 'player-timer prep';
    timerLabel.textContent = player.remaining>0 ? player.remaining : 'GO';
  }else{
    timerLabel.className = 'player-timer work';
    timerLabel.textContent = fmtClock(player.remaining);
  }

  const next = session.items[player.index+1];
  if(next){
    if(next.isDrinksBreak){
      nextLabel.textContent = `Next: 💧 Drinks Break (${next.workSeconds}s)`;
    } else if(next.isCircuit){
      nextLabel.textContent = `Next: ${next.name} (Rnd ${next.round})`;
    } else {
      nextLabel.textContent = `Next: ${next.name}`;
    }
  } else {
    nextLabel.textContent = 'Last exercise';
  }

  bottom.innerHTML = `
    <div class="player-controls">
      <button class="btn btn-ghost btn-sm" id="pPauseBtn">${player.paused?'Resume':'Pause'}</button>
      <button class="btn btn-ghost btn-sm" id="pSkipBtn">Skip</button>
    </div>
    <button class="btn btn-danger" id="pEndBtn">End workout</button>
  `;
  document.getElementById('pPauseBtn').addEventListener('click', togglePause);
  document.getElementById('pSkipBtn').addEventListener('click', skipExercise);
  document.getElementById('pEndBtn').addEventListener('click', endWorkoutEarly);
}

/* ---------------- Utils ---------------- */
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function escapeAttr(str){ return escapeHtml(str); }

/* ==========================================================================
   ROUTINE BUILDER MODE
   ========================================================================== */
let builderRoutine = {
  name: '',
  circuit: false,
  circuitRounds: 3,
  intensity: 'balanced',
  activeCategory: 'all',
  searchQuery: '',
  items: []
};

function openBuilder(){
  builderRoutine = {
    name: '',
    circuit: session.circuit || false,
    circuitRounds: session.circuitRounds || 3,
    intensity: session.intensity || 'balanced',
    activeCategory: 'all',
    searchQuery: '',
    items: session.items.filter(i => !i.isWarmup && !i.isCooldown && !i.isDrinksBreak).map(i => ({...i}))
  };
  renderBuilderOverlay();
  const overlay = document.getElementById('builderOverlay');
  if(overlay){
    overlay.classList.add('show');
    overlay.scrollTop = 0;
  }
}

function closeBuilder(){
  const overlay = document.getElementById('builderOverlay');
  if(overlay) overlay.classList.remove('show');
}

function renderBuilderOverlay(){
  const overlay = document.getElementById('builderOverlay');
  if(!overlay) return;

  const totalMoves = builderRoutine.items.length;
  const timing = getTimingForSlot(45, builderRoutine.intensity);
  const totalMins = builderRoutine.circuit 
    ? Math.max(1, Math.round((totalMoves * builderRoutine.circuitRounds * (timing.work + timing.rest)) / 60))
    : Math.max(1, Math.round((totalMoves * (timing.work + timing.rest)) / 60));

  const filteredExercises = exercises.filter(e => {
    const matchesCat = builderRoutine.activeCategory === 'all' || e.category === builderRoutine.activeCategory;
    const matchesSearch = !builderRoutine.searchQuery || e.name.toLowerCase().includes(builderRoutine.searchQuery.toLowerCase()) || (e.equipment||[]).some(eq => eq.toLowerCase().includes(builderRoutine.searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  overlay.innerHTML = `
    <!-- Topbar Navigation -->
    <div class="builder-topbar">
      <button type="button" class="builder-back-btn" id="bCloseBtn">
        <span>←</span> Today
      </button>
      <div class="builder-title">Routine Builder</div>
      <button type="button" class="builder-clear-btn" id="bClearBtn">Clear</button>
    </div>

    <!-- Routine Config Shaded Card -->
    <div class="builder-card">
      <input type="text" id="bNameInput" class="builder-input" placeholder="Routine Name (e.g. Morning Full-Body)" value="${escapeAttr(builderRoutine.name)}">

      <div class="circuit-toggle-wrap">
        <span class="circuit-label">Circuit Mode</span>
        <label class="circuit-switch">
          <input type="checkbox" id="bCircuitToggle" ${builderRoutine.circuit ? 'checked' : ''}>
          <span class="circuit-slider-ui"></span>
        </label>
      </div>
      <div class="circuit-rounds-selector" id="bRoundsWrap" style="${builderRoutine.circuit ? '' : 'display:none;'}">
        ${[2, 3, 4, 5].map(r => `<button type="button" class="round-chip ${builderRoutine.circuitRounds===r?'active':''}" data-bcrounds="${r}">${r} Rounds</button>`).join('')}
      </div>

      <div style="margin-top:14px; padding-top:14px; border-top:1px solid #F1F5F9;">
        <div class="section-title" style="margin:0 0 8px;">Pace &amp; Intensity</div>
        <div class="intensity-stops">
          <button type="button" class="intensity-stop-btn ${builderRoutine.intensity==='steady'?'active':''}" data-bintensity="steady">
            <div class="stop-name">Steady</div>
            <div class="stop-rest">Longer Rest</div>
          </button>
          <button type="button" class="intensity-stop-btn ${builderRoutine.intensity==='balanced'?'active':''}" data-bintensity="balanced">
            <div class="stop-name">Balanced</div>
            <div class="stop-rest">Moderate</div>
          </button>
          <button type="button" class="intensity-stop-btn ${builderRoutine.intensity==='hiit'?'active':''}" data-bintensity="hiit">
            <div class="stop-name">HIIT</div>
            <div class="stop-rest">Max Burn</div>
          </button>
        </div>
      </div>

      <div class="builder-calc-pill">
        ${totalMoves} MOVES · ~${totalMins} MIN ${builderRoutine.circuit ? `(${builderRoutine.circuitRounds} ROUNDS)` : ''} · ${builderRoutine.intensity.toUpperCase()}
      </div>
    </div>

    <!-- Selected Moves List -->
    <div class="section-title">Your Selected Moves (${totalMoves})</div>
    <div class="builder-items-list" id="bSelectedList">
      ${totalMoves > 0 ? builderRoutine.items.map((e, idx) => `
        <div class="builder-item-row">
          <div class="ex-fig-clean">${buildFigureSVG(patternForExercise(e), 'small mini')}</div>
          <div class="builder-item-name">
            <div>${escapeHtml(e.name)}</div>
            <div class="builder-item-sub">${CAT_LABEL[e.category]||'Move'} · ${(e.equipment||[]).join(', ')||'Bodyweight'}</div>
          </div>
          <div class="builder-item-actions">
            <button type="button" class="builder-mini-btn" data-bmoveup="${idx}" title="Move up">▲</button>
            <button type="button" class="builder-mini-btn" data-bmovedown="${idx}" title="Move down">▼</button>
            <button type="button" class="builder-mini-btn del" data-bdel="${idx}" title="Remove">✕</button>
          </div>
        </div>
      `).join('') : `
        <div class="builder-card builder-empty-hint">
          No exercises added yet.<br>Filter and tap <strong>+ Add</strong> below to build your custom routine.
        </div>
      `}
    </div>

    <!-- Bottom Action Controls -->
    ${totalMoves > 0 ? `
      <div style="margin: 16px 0 20px;">
        <button type="button" class="btn-black-pill" id="bStartNowBtn">▶ Load &amp; Start Workout</button>
        <button type="button" class="btn-ghost-pill" id="bSaveProfileBtn">Save as Profile</button>
      </div>
    ` : ''}

    <!-- Exercise Library Picker -->
    <div class="section-title" style="margin-top:20px;">Add From Exercise Library (${filteredExercises.length})</div>
    <input type="text" id="bSearchInput" class="builder-search-input" placeholder="Search exercises or equipment..." value="${escapeAttr(builderRoutine.searchQuery)}">

    <div class="builder-filter-chips">
      ${['all', 'strength', 'cardio', 'core', 'mobility'].map(c => `
        <button type="button" class="builder-filter-chip ${builderRoutine.activeCategory===c?'active':''}" data-bcat="${c}">
          ${c === 'all' ? 'All Moves' : CAT_LABEL[c]}
        </button>
      `).join('')}
    </div>

    <div id="bLibraryList">
      ${filteredExercises.map(e => `
        <div class="builder-lib-row">
          <div class="ex-fig-clean">${buildFigureSVG(patternForExercise(e), 'small mini')}</div>
          <div class="builder-lib-info">
            <div class="builder-lib-name">${escapeHtml(e.name)}</div>
            <div class="builder-lib-meta">
              <span>${CAT_LABEL[e.category]||'Exercise'}</span>
              <span>·</span>
              <span>${(e.equipment||[]).join(', ')||'Bodyweight'}</span>
            </div>
          </div>
          <button type="button" class="btn-add-lib" data-badd="${e.id}">+ Add</button>
        </div>
      `).join('')}
    </div>
  `;

  // Bind Builder Events
  document.getElementById('bCloseBtn').addEventListener('click', closeBuilder);
  document.getElementById('bClearBtn').addEventListener('click', () => {
    builderRoutine.items = [];
    renderBuilderOverlay();
  });
  document.getElementById('bNameInput').addEventListener('input', (e) => {
    builderRoutine.name = e.target.value;
  });

  const bCircuitToggle = document.getElementById('bCircuitToggle');
  if(bCircuitToggle){
    bCircuitToggle.addEventListener('change', (e) => {
      builderRoutine.circuit = e.target.checked;
      renderBuilderOverlay();
    });
  }

  overlay.querySelectorAll('#bRoundsWrap .round-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      builderRoutine.circuitRounds = parseInt(chip.dataset.bcrounds, 10);
      renderBuilderOverlay();
    });
  });

  overlay.querySelectorAll('.intensity-stops .intensity-stop-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      builderRoutine.intensity = btn.dataset.bintensity;
      renderBuilderOverlay();
    });
  });

  // Reorder & Remove
  overlay.querySelectorAll('[data-bmoveup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.bmoveup, 10);
      if(idx > 0){
        const temp = builderRoutine.items[idx];
        builderRoutine.items[idx] = builderRoutine.items[idx - 1];
        builderRoutine.items[idx - 1] = temp;
        renderBuilderOverlay();
      }
    });
  });

  overlay.querySelectorAll('[data-bmovedown]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.bmovedown, 10);
      if(idx < builderRoutine.items.length - 1){
        const temp = builderRoutine.items[idx];
        builderRoutine.items[idx] = builderRoutine.items[idx + 1];
        builderRoutine.items[idx + 1] = temp;
        renderBuilderOverlay();
      }
    });
  });

  overlay.querySelectorAll('[data-bdel]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.bdel, 10);
      builderRoutine.items.splice(idx, 1);
      renderBuilderOverlay();
    });
  });

  // Add from Library
  overlay.querySelectorAll('[data-badd]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ex = exercises.find(x => x.id === btn.dataset.badd);
      if(ex){
        builderRoutine.items.push({ ...ex, id: uid(), baseId: ex.id });
        renderBuilderOverlay();
        showToast(ex.name + ' added');
      }
    });
  });

  // Search & Filter
  const bSearch = document.getElementById('bSearchInput');
  if(bSearch){
    bSearch.addEventListener('input', (e) => {
      builderRoutine.searchQuery = e.target.value;
      const bLib = document.getElementById('bLibraryList');
      if(bLib){
        const matches = exercises.filter(x => {
          const matchesCat = builderRoutine.activeCategory === 'all' || x.category === builderRoutine.activeCategory;
          const matchesSearch = !builderRoutine.searchQuery || x.name.toLowerCase().includes(builderRoutine.searchQuery.toLowerCase()) || (x.equipment||[]).some(eq => eq.toLowerCase().includes(builderRoutine.searchQuery.toLowerCase()));
          return matchesCat && matchesSearch;
        });
        bLib.innerHTML = matches.map(e => `
          <div class="builder-lib-row">
            <div class="ex-fig-clean">${buildFigureSVG(patternForExercise(e), 'small mini')}</div>
            <div class="builder-lib-info">
              <div class="builder-lib-name">${escapeHtml(e.name)}</div>
              <div class="builder-lib-meta">
                <span>${CAT_LABEL[e.category]||'Exercise'}</span>
                <span>·</span>
                <span>${(e.equipment||[]).join(', ')||'Bodyweight'}</span>
              </div>
            </div>
            <button type="button" class="btn-add-lib" data-badd="${e.id}">+ Add</button>
          </div>
        `).join('');
        bLib.querySelectorAll('[data-badd]').forEach(b => {
          b.addEventListener('click', () => {
            const ex = exercises.find(x => x.id === b.dataset.badd);
            if(ex){
              builderRoutine.items.push({ ...ex, id: uid(), baseId: ex.id });
              renderBuilderOverlay();
              showToast(ex.name + ' added');
            }
          });
        });
      }
    });
  }

  overlay.querySelectorAll('.builder-filter-chips .builder-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      builderRoutine.activeCategory = chip.dataset.bcat;
      renderBuilderOverlay();
    });
  });

  // Action Buttons: Load & Start, Save as Profile
  const bStartNowBtn = document.getElementById('bStartNowBtn');
  if(bStartNowBtn){
    bStartNowBtn.addEventListener('click', () => {
      loadBuilderRoutineToToday(true);
    });
  }

  const bSaveProfileBtn = document.getElementById('bSaveProfileBtn');
  if(bSaveProfileBtn){
    bSaveProfileBtn.addEventListener('click', async () => {
      const name = (builderRoutine.name || '').trim() || 'Custom Routine ' + new Date().toLocaleDateString(undefined, {month:'short', day:'numeric'});
      profiles.push({
        id: uid(),
        name: name,
        mode: 'fixed',
        targetMinutes: totalMins,
        targetCount: builderRoutine.items.length,
        intensity: builderRoutine.intensity,
        circuit: builderRoutine.circuit,
        circuitRounds: builderRoutine.circuitRounds,
        categories: [...new Set(builderRoutine.items.map(i => i.category))],
        exerciseIds: builderRoutine.items.map(i => i.baseId || i.id)
      });
      await saveProfiles();
      renderProfiles();
      showToast('Profile "' + name + '" saved!');
      closeBuilder();
    });
  }
}

function loadBuilderRoutineToToday(autoStart = false){
  if(builderRoutine.items.length === 0){
    showToast('Add at least one move to your routine');
    return;
  }
  session.circuit = builderRoutine.circuit;
  session.circuitRounds = builderRoutine.circuitRounds;
  session.intensity = builderRoutine.intensity;
  session.targetCount = builderRoutine.items.length;

  const warmupSec = session.warmup ? (session.warmupSeconds + 10) : 0;
  const cooldownSec = session.cooldown ? session.cooldownSeconds : 0;
  const intensity = session.intensity || 'balanced';

  let fullSession = [];
  if(session.warmup) fullSession.push(makeWarmupItem(session.warmupSeconds));

  if(session.circuit){
    const rounds = session.circuitRounds || 3;
    const drinksSec = getDrinksBreakSeconds(intensity);
    const totalDrinksTime = (rounds > 1) ? ((rounds - 1) * drinksSec) : 0;
    const availSec = Math.max(60, (session.targetMinutes * 60) - warmupSec - cooldownSec - totalDrinksTime);
    const totalSlots = builderRoutine.items.length * rounds;
    const slotSec = Math.floor(availSec / totalSlots);
    const { work, rest } = getTimingForSlot(slotSec, intensity);

    for(let r = 1; r <= rounds; r++){
      builderRoutine.items.forEach((ex, exIdx) => {
        fullSession.push({
          ...ex,
          id: 'circuit-' + r + '-' + ex.id,
          baseId: ex.baseId || ex.id,
          round: r,
          totalRounds: rounds,
          exerciseIndex: exIdx,
          exerciseTotal: builderRoutine.items.length,
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
    const totalSlots = builderRoutine.items.length;
    const availSec = Math.max(60, (session.targetMinutes * 60) - warmupSec - cooldownSec);
    const slotSec = Math.floor(availSec / totalSlots);
    const { work, rest } = getTimingForSlot(slotSec, intensity);

    builderRoutine.items.forEach((ex, exIdx) => {
      fullSession.push({
        ...ex,
        id: uid(),
        baseId: ex.baseId || ex.id,
        exerciseIndex: exIdx,
        exerciseTotal: builderRoutine.items.length,
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
  closeBuilder();
  renderToday();

  if(autoStart){
    startWorkout();
  } else {
    showToast('Loaded custom routine into Today!');
  }
}

/* ---------------- Init ---------------- */
async function init(){
  await loadData();
  document.getElementById('main').innerHTML = `
    <div class="view active" id="view-today"></div>
    <div class="view" id="view-library"></div>
    <div class="view" id="view-profiles"></div>
    <div class="view" id="view-history"></div>
  `;
  document.getElementById('tabbar').style.display = 'flex';
  document.querySelectorAll('.tab').forEach(t=>{
    t.addEventListener('click', ()=>setView(t.dataset.view));
  });

  const openBBtn = document.getElementById('openBuilderBtn');
  if(openBBtn) openBBtn.addEventListener('click', openBuilder);

  renderToday();
  renderLibrary();
  renderProfiles();
  renderHistory();
}
init();
