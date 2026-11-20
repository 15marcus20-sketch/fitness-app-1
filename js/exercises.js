/* ---------------- Exercise Database & Back Classifications ---------------- */
const CATEGORIES = ["strength", "cardio", "core", "mobility", "yoga"];
const CAT_LABEL = { strength: "Strength", cardio: "Cardio", core: "Core", mobility: "Mobility", yoga: "Yoga" };
const EQUIPMENT_OPTIONS = ["Bodyweight", "Dumbbells", "Kettlebell", "Resistance Band", "Chair/Bench", "Wall", "Jump rope", "Stairs", "Pull-up Bar"];

// Spine and Back Health Classifications (Requirement 4)
const BACK_CLASSES = {
  "spine-friendly": { 
    key: "spine-friendly",
    label: "Spine Friendly", 
    badge: "SAFE",
    desc: "Zero axial spinal compression with low lumbar shear forces.",
    color: "#6fcf7c"
  },
  "stabilizer": { 
    key: "stabilizer",
    label: "Core Stabilizer", 
    badge: "STABILIZE",
    desc: "Builds 360-degree muscular endurance around the spine without flexion.",
    color: "#2fd8ff"
  },
  "decompression": { 
    key: "decompression",
    label: "Decompression", 
    badge: "DECOMPRESS",
    desc: "Relieves disc pressure, articulates thoracic spine, and unlocks hips.",
    color: "#9fe0ff"
  },
  "requires-mod": { 
    key: "requires-mod",
    label: "Caution / Requires Mod", 
    badge: "MOD NEEDED",
    desc: "Poses lumbar flexion or shear risk. Use modification cues if back sensitive.",
    color: "#e5a13d"
  }
};

const DEFAULT_EXERCISES = [
  // Strength
  {
    name: "Push-ups", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Bodyweight"], 
    pattern: "pushup",
    backClass: "spine-friendly",
    backMod: "Brace abs and squeeze glutes to stop lumbar spine from sagging. Elevate hands on a bench if your hips drop."
  },
  {
    name: "Bodyweight Squats", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 15", 
    equipment: ["Bodyweight"], 
    pattern: "squat",
    backClass: "requires-mod",
    backMod: "Squat onto a box or chair to prevent lumbar tuck ('butt wink'). Keep chest proud and weight balanced across mid-foot."
  },
  {
    name: "Walking Lunges", 
    category: "strength", 
    duration: 6, 
    setsReps: "3 x 10/side", 
    equipment: ["Bodyweight"], 
    pattern: "lunge",
    backClass: "spine-friendly",
    backMod: "Keep torso upright with a slight forward lean from the hip, not the waist. Avoid over-striding which pulls on the lower back."
  },
  {
    name: "Dumbbell Rows", 
    category: "strength", 
    duration: 6, 
    setsReps: "3 x 12", 
    equipment: ["Dumbbells"], 
    pattern: "rowArm",
    backClass: "spine-friendly",
    backMod: "Support opposite hand and knee on a bench or chair to eliminate lower back spinal shear load."
  },
  {
    name: "Shoulder Press", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 10", 
    equipment: ["Dumbbells"], 
    pattern: "pressArm",
    backClass: "requires-mod",
    backMod: "Do seated with back support or tall kneeling. Avoid arching lower back as dumbbells go overhead."
  },
  {
    name: "Glute Bridges", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 15", 
    equipment: ["Bodyweight"], 
    pattern: "bridge",
    backClass: "spine-friendly",
    backMod: "Drive through heels and squeeze glutes at top. Keep ribs pulled down to avoid hyperextending lower back."
  },
  {
    name: "Bicep Curls", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 12", 
    equipment: ["Dumbbells"], 
    pattern: "curlArm",
    backClass: "spine-friendly",
    backMod: "Stand tall with knees soft. Do not swing hips or lean back to move the weights."
  },
  {
    name: "Tricep Dips", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Chair/Bench"], 
    pattern: "dip",
    backClass: "spine-friendly",
    backMod: "Keep hips close to the chair/bench edge to maintain neutral posture and avoid shoulder forward roll."
  },
  {
    name: "Goblet Squats", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Kettlebell"], 
    pattern: "squat",
    backClass: "spine-friendly",
    backMod: "Holding weight at chest acts as a counterbalance, naturally keeping spine upright and reducing lower back shear."
  },
  {
    name: "Banded Rows", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 15", 
    equipment: ["Resistance Band"], 
    pattern: "rowArm",
    backClass: "spine-friendly",
    backMod: "Anchor band at chest height. Squeeze shoulder blades back; builds upper thoracic back strength safely."
  },
  {
    name: "Pull-ups", 
    category: "strength", 
    duration: 5, 
    setsReps: "4 x max", 
    equipment: ["Pull-up Bar"], 
    pattern: "pullup",
    backClass: "decompression",
    backMod: "Hanging provides natural traction and disc decompression for the lumbar and thoracic spine."
  },

  // Cardio
  {
    name: "Jumping Jacks", 
    category: "cardio", 
    duration: 4, 
    setsReps: "3 min steady", 
    equipment: ["Bodyweight"], 
    pattern: "jumpingjack",
    backClass: "spine-friendly",
    backMod: "Land softly on balls of feet with knees bent to absorb impact before it reaches the spine."
  },
  {
    name: "Burpees", 
    category: "cardio", 
    duration: 6, 
    setsReps: "4 x 10", 
    equipment: ["Bodyweight"], 
    pattern: "burpee",
    backClass: "requires-mod",
    backMod: "Modify: Step feet back into plank rather than jumping. Avoid letting hips sag when feet land back."
  },
  {
    name: "Mountain Climbers", 
    category: "cardio", 
    duration: 4, 
    setsReps: "3 x 30s", 
    equipment: ["Bodyweight"], 
    pattern: "mountainclimber",
    backClass: "requires-mod",
    backMod: "Slow down the pace. Place hands on a sturdy bench or chair to reduce hip flexion pinch and lower back rounding."
  },
  {
    name: "High Knees", 
    category: "cardio", 
    duration: 3, 
    setsReps: "3 x 30s", 
    equipment: ["Bodyweight"], 
    pattern: "highknees",
    backClass: "requires-mod",
    backMod: "Keep knees at hip height; don't round upper back forward to meet the knees. March in place if sensitive."
  },
  {
    name: "Jump Rope", 
    category: "cardio", 
    duration: 8, 
    setsReps: "Continuous", 
    equipment: ["Jump rope"], 
    pattern: "jumprope",
    backClass: "spine-friendly",
    backMod: "Keep jumps tiny (1-2 inches). Land with soft ankles to prevent repetitive shock up the spine."
  },
  {
    name: "Step-up onto Chair",
    category: "strength",
    duration: 4,
    setsReps: "3 x 10/side",
    equipment: ["Chair/Bench"],
    pattern: "chairstep",
    backClass: "spine-friendly",
    backMod: "Use a sturdy chair pushed against a wall. Drive through the whole front foot and stand tall on top; hinge slightly from the hips, never round the lower back."
  },
  {
    name: "Stair Climbs", 
    category: "cardio", 
    duration: 8, 
    setsReps: "Continuous", 
    equipment: ["Stairs"], 
    pattern: "stepup",
    backClass: "spine-friendly",
    backMod: "Drive through whole foot on each step. Avoid hunching forward over the handrail."
  },

  // Core & Back Stabilizers
  {
    name: "Bird Dog", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 8/side", 
    equipment: ["Bodyweight"], 
    pattern: "catcow",
    backClass: "stabilizer",
    backMod: "McGill Big 3 spine stabilizer. Reach opposite arm and leg without twisting hips or sagging lower back."
  },
  {
    name: "Dead Bug", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 10/side", 
    equipment: ["Bodyweight"], 
    pattern: "legraise",
    backClass: "stabilizer",
    backMod: "Press lower back firmly into the floor. Lower opposite arm and leg only as far as back stays glued flat."
  },
  {
    name: "Plank Hold", 
    category: "core", 
    duration: 3, 
    setsReps: "3 x 45s", 
    equipment: ["Bodyweight"], 
    pattern: "plank",
    backClass: "stabilizer",
    backMod: "Tuck pelvis into posterior tilt. Rest knees on floor if hips begin to sag into lumbar lordosis."
  },
  {
    name: "Side Plank", 
    category: "core", 
    duration: 3, 
    setsReps: "3 x 30s/side", 
    equipment: ["Bodyweight"], 
    pattern: "sideplank",
    backClass: "stabilizer",
    backMod: "Best exercise for Quadratus Lumborum (deep lower back muscle) with minimal lumbar compressive load."
  },
  {
    name: "Sit-ups", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 15", 
    equipment: ["Bodyweight"], 
    pattern: "situp",
    backClass: "requires-mod",
    backMod: "High lumbar disc pressure. Swap for McGill Curl-up (hands under lumbar arch, only head & shoulders lift)."
  },
  {
    name: "Russian Twists", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 20", 
    equipment: ["Bodyweight"], 
    pattern: "twist",
    backClass: "requires-mod",
    backMod: "Spinal rotation combined with flexion stresses discs. Keep feet on floor and sit upright, or swap for Pallof press."
  },
  {
    name: "Bicycle Crunches", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 20", 
    equipment: ["Bodyweight"], 
    pattern: "twist",
    backClass: "requires-mod",
    backMod: "High shear stress. Substitute with Dead-Bugs or Bird-Dogs for equal abdominal stimulus with zero spine risk."
  },
  {
    name: "Leg Raises", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 12", 
    equipment: ["Bodyweight"], 
    pattern: "legraise",
    backClass: "requires-mod",
    backMod: "Place hands under glutes to support pelvis. Bend knees to 90 degrees if lower back arches off floor."
  },

  // Mobility & Decompression
  {
    name: "Cat-Cow Flow", 
    category: "mobility", 
    duration: 3, 
    setsReps: "10 slow breaths", 
    equipment: ["Bodyweight"], 
    pattern: "catcow",
    backClass: "decompression",
    backMod: "Gently articulates each vertebra. Focus on moving through the mid-back (thoracic) rather than jamming lumbar."
  },
  {
    name: "Child's Pose", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 45s", 
    equipment: ["Bodyweight"], 
    pattern: "childspose",
    backClass: "decompression",
    backMod: "Gently decompresses lumbar discs. Widen knees outwards if hips pinch or back is stiff."
  },
  {
    name: "Hamstring Stretch", 
    category: "mobility", 
    duration: 3, 
    setsReps: "Hold 30s x 2", 
    equipment: ["Bodyweight"], 
    pattern: "hamstring",
    backClass: "decompression",
    backMod: "Tight hamstrings pull the pelvis into posterior tilt. Hinge at hips with a neutral spine; do not round forward."
  },
  {
    name: "Hip Flexor Stretch", 
    category: "mobility", 
    duration: 3, 
    setsReps: "Hold 30s x 2/side", 
    equipment: ["Bodyweight"], 
    pattern: "hipflexor",
    backClass: "decompression",
    backMod: "Tight psoas pulls lumbar spine forward. Squeeze back glute and tuck pelvis to release anterior hip tension."
  },
  {
    name: "Shoulder Rolls & Circles", 
    category: "mobility", 
    duration: 2, 
    setsReps: "2 min", 
    equipment: ["Bodyweight"], 
    pattern: "shoulderroll",
    backClass: "decompression",
    backMod: "Relieves upper back and neck tension, opening thoracic cage to reduce compensatory lower back stress."
  },
  {
    name: "Cobra Pose", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 20-30s x 2", 
    equipment: ["Bodyweight"], 
    pattern: "cobra",
    backClass: "decompression",
    backMod: "Spinal extension restores disc space. Keep hips down; stop before any pinching sensation in lumbar."
  },
  {
    name: "Downward Dog", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 45s", 
    equipment: ["Bodyweight"], 
    pattern: "downdog",
    backClass: "decompression",
    backMod: "Bend knees slightly to keep spine completely long and straight from wrists to tailbone."
  },
  {
    name: "Forward Fold", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 30s", 
    equipment: ["Bodyweight"], 
    pattern: "forwardfold",
    backClass: "requires-mod",
    backMod: "Keep knees bent generously. Rest belly on thighs to decompress back without hanging from lumbar ligaments."
  },
  {
    name: "Wall Sit", 
    category: "strength", 
    duration: 2, 
    setsReps: "30-45s hold", 
    equipment: ["Wall"], 
    pattern: "wallsit",
    backClass: "spine-friendly",
    backMod: "Press entire back flat against wall. Builds leg strength with zero spinal shear and supported posture."
  }
];

const SEVEN_MIN_ORDER = [
  "Jumping Jacks", "Wall Sit", "Push-ups", "Sit-ups", "Step-up onto Chair",
  "Bodyweight Squats", "Tricep Dips", "Plank Hold", "High Knees",
  "Walking Lunges", "Bird Dog", "Side Plank"
];
