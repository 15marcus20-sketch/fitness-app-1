/* ---------------- Data Storage & Persistence ---------------- */
function uid(){ 
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); 
}

async function loadData(){
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
    if (p) {
      profiles = JSON.parse(p);
    } else {
      // Seed built-in 7-Minute Workout profile
      const ids = (typeof SEVEN_MIN_ORDER !== 'undefined' ? SEVEN_MIN_ORDER : [])
        .map(n => { const f = exercises.find(x => x.name === n); return f ? f.id : null; })
        .filter(Boolean);
      profiles = ids.length === 12 ? [{
        id: uid(), 
        name: "7 Minute Workout", 
        mode: "fixed",
        targetMinutes: 12, 
        categories: [], 
        exerciseIds: ids,
        note: "Classic 12-station bodyweight circuit. ~7 min of work at 30s/station with brief rests."
      }] : [];
      saveProfiles();
    }
  } catch(e) {
    profiles = [];
  }

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
    if (typeof showToast === 'function') showToast('Could not save — storage error'); 
  }
}

function saveHistory(){
  try { 
    localStorage.setItem('on_track_history', JSON.stringify(history)); 
  } catch(e) { 
    console.error('Save history failed:', e); 
    if (typeof showToast === 'function') showToast('Could not save — storage error'); 
  }
}

function saveProfiles(){
  try { 
    localStorage.setItem('on_track_profiles', JSON.stringify(profiles)); 
  } catch(e) { 
    console.error('Save profiles failed:', e); 
    if (typeof showToast === 'function') showToast('Could not save — storage error'); 
  }
}

function saveUserEquipment(){
  try { 
    localStorage.setItem('on_track_userEquipment', JSON.stringify(userEquipment)); 
  } catch(e) { 
    console.error('Save equipment failed:', e); 
    if (typeof showToast === 'function') showToast('Could not save — storage error'); 
  }
}
