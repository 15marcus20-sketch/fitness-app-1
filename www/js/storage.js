/* ---------------- Data Storage & Persistence ---------------- */
function uid(){ 
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); 
}

// One-off data migrations, each run at most once per install (ids kept in
// on_track_migrations). A fresh install runs them too, so the seed and the
// upgrade share one path. They only ever ADD what is missing: a move or profile
// the user has since edited, renamed or deleted is left alone.
const SEVEN_MIN_NAME = "7 Minute Workout";
const MIGRATIONS = [
  ['chair-stepup-1', () => {
    // "Step-up onto Chair" was missing from the library, which stopped the 7 Minute profile seeding.
    const def = DEFAULT_EXERCISES.find(x => x.name === "Step-up onto Chair");
    if (!def || exercises.some(x => x.name === def.name)) return false;
    exercises.push({...def, equipment: [...def.equipment], id: uid()});
    saveExercises();
    return true;
  }],
  ['seven-min-1', () => {
    if (profiles.some(p => p.builtin === 'seven-min' || p.name === SEVEN_MIN_NAME)) return false;
    const ids = SEVEN_MIN_ORDER
      .map(n => { const f = exercises.find(x => x.name === n); return f ? f.id : null; })
      .filter(Boolean);
    if (!ids.length) return false;
    profiles.push({
      id: uid(),
      builtin: 'seven-min',
      name: SEVEN_MIN_NAME,
      mode: "fixed",
      targetMinutes: 12,
      categories: [],
      exerciseIds: ids,
      note: "Classic 12-station bodyweight circuit. ~7 min of work at 30s/station with brief rests."
    });
    saveProfiles();
    return true;
  }]
];
function runMigrations(){
  let done = [];
  try { done = JSON.parse(localStorage.getItem('on_track_migrations') || '[]'); } catch(e) { done = []; }
  if (!Array.isArray(done)) done = [];
  let changed = false;
  for (const [id, fn] of MIGRATIONS) {
    if (done.includes(id)) continue;
    try { fn(); } catch(e) { console.warn('Migration ' + id + ' failed:', e); continue; }
    done.push(id); changed = true;
  }
  if (changed) {
    try { localStorage.setItem('on_track_migrations', JSON.stringify(done)); } catch(e) {}
  }
}

// First run: true until the Welcome screen has been passed once. Anyone who
// already had data before Welcome existed is not a first-run user.
let firstRun = false;
function markWelcomed(){
  firstRun = false;
  try { localStorage.setItem('on_track_welcomed', '1'); } catch(e) {}
}

async function loadData(){
  const hadData = localStorage.getItem('on_track_exercises') !== null || localStorage.getItem('on_track_history') !== null;
  firstRun = localStorage.getItem('on_track_welcomed') === null && !hadData;
  if (!firstRun && localStorage.getItem('on_track_welcomed') === null) markWelcomed();
  // 1. Exercises
  try {
    const raw = localStorage.getItem('on_track_exercises');
    if (raw) {
      exercises = JSON.parse(raw);
    } else {
      exercises = DEFAULT_EXERCISES.map(x => ({...x, id: uid()}));
      saveExercises();
    }
    // Migrate legacy string equipment -> array & verify patterns
    exercises.forEach(e => {
      if (typeof e.equipment === 'string') e.equipment = e.equipment ? [e.equipment] : [];
      if (!Array.isArray(e.equipment)) e.equipment = [];
      if (!e.pattern) e.pattern = (typeof PATTERN_FALLBACK_BY_CATEGORY !== 'undefined' ? PATTERN_FALLBACK_BY_CATEGORY[e.category] : 'squat') || 'squat';
      if (typeof PATTERN_MIGRATE_BY_NAME !== 'undefined') {
        const mig = PATTERN_MIGRATE_BY_NAME[e.name];
        if (mig && e.pattern === mig[0]) e.pattern = mig[1];
      }
    });
  } catch(e) {
    console.warn('Loading exercises fell back to defaults:', e);
    exercises = DEFAULT_EXERCISES.map(x => ({...x, id: uid()}));
    saveExercises();
  }

  // 2. History
  try {
    const h = localStorage.getItem('on_track_history');
    history = h ? JSON.parse(h) : [];
  } catch(e) {
    history = [];
  }

  // 3. Profiles
  try {
    const p = localStorage.getItem('on_track_profiles');
    profiles = p ? JSON.parse(p) : [];
    if (!Array.isArray(profiles)) profiles = [];
  } catch(e) {
    profiles = [];
  }

  runMigrations();

  // 4. User Equipment
  try {
    const ue = localStorage.getItem('on_track_userEquipment');
    if (ue) {
      userEquipment = JSON.parse(ue);
    } else {
      // Default to Bodyweight so workouts generate out-of-the-box
      userEquipment = ["Bodyweight"];
      saveUserEquipment();
    }
  } catch(e) {
    userEquipment = ["Bodyweight"];
    saveUserEquipment();
  }
}

function saveExercises(){
  try { 
    localStorage.setItem('on_track_exercises', JSON.stringify(exercises)); 
  } catch(e) { 
    console.error('Save exercises failed:', e); 
    if (typeof showToast === 'function') showToast("Couldn't save. Your phone's storage is full or blocked for this app."); 
  }
}

function saveHistory(){
  try { 
    localStorage.setItem('on_track_history', JSON.stringify(history)); 
  } catch(e) { 
    console.error('Save history failed:', e); 
    if (typeof showToast === 'function') showToast("Couldn't save. Your phone's storage is full or blocked for this app."); 
  }
}

function saveProfiles(){
  try { 
    localStorage.setItem('on_track_profiles', JSON.stringify(profiles)); 
  } catch(e) { 
    console.error('Save profiles failed:', e); 
    if (typeof showToast === 'function') showToast("Couldn't save. Your phone's storage is full or blocked for this app."); 
  }
}

function saveUserEquipment(){
  try { 
    localStorage.setItem('on_track_userEquipment', JSON.stringify(userEquipment)); 
  } catch(e) { 
    console.error('Save equipment failed:', e); 
    if (typeof showToast === 'function') showToast("Couldn't save. Your phone's storage is full or blocked for this app."); 
  }
}
