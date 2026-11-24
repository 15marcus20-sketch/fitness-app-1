/* ---------------- Exercise Database & Back Classifications ---------------- */
const CATEGORIES = ["strength", "cardio", "core", "mobility", "yoga"];
const CAT_LABEL = { strength: "Strength", cardio: "Cardio", core: "Core", mobility: "Mobility", yoga: "Yoga" };
const EQUIPMENT_OPTIONS = ["Bodyweight", "Dumbbells", "Kettlebell", "Resistance Band", "Chair/Bench", "Wall", "Jump rope", "Stairs", "Pull-up Bar"];

// Spine and Back Health Classifications
const BACK_CLASSES = {
  "spine-friendly": { 
    key: "spine-friendly",
    label: "Spine Friendly", 
    badge: "SAFE",
    desc: "Zero axial spinal compression with low lumbar shear forces.",
    color: "#0D9488"
  },
  "stabilizer": { 
    key: "stabilizer",
    label: "Core Stabilizer", 
    badge: "STABILIZE",
    desc: "Builds 360-degree muscular endurance around the spine without flexion.",
    color: "#10B981"
  },
  "decompression": { 
    key: "decompression",
    label: "Decompression", 
    badge: "DECOMPRESS",
    desc: "Relieves disc pressure, articulates thoracic spine, and unlocks hips.",
    color: "#0284C7"
  },
  "requires-mod": { 
    key: "requires-mod",
    label: "Caution / Requires Mod", 
    badge: "MOD NEEDED",
    desc: "Poses lumbar flexion or shear risk. Use modification cues if back sensitive.",
    color: "#F59E0B"
  }
};

const DEFAULT_EXERCISES = [
  /* ==========================================================================
     BODYWEIGHT MOVEMENTS
     ========================================================================== */
  // Strength
  {
    name: "Push-ups", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Bodyweight"], 
    pattern: "pushup",
    backClass: "spine-friendly",
    backMod: "Brace abs and squeeze glutes to stop lumbar spine from sagging. Elevate hands on a bench if hips drop."
  },
  {
    name: "Bodyweight Squats", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 15", 
    equipment: ["Bodyweight"], 
    pattern: "squat",
    backClass: "requires-mod",
    backMod: "Squat onto a box or chair to prevent lumbar tuck. Keep chest proud and weight balanced across mid-foot."
  },
  {
    name: "Walking Lunges", 
    category: "strength", 
    duration: 6, 
    setsReps: "3 x 10/side", 
    equipment: ["Bodyweight"], 
    pattern: "lunge",
    backClass: "spine-friendly",
    backMod: "Keep torso upright with a slight forward hip hinge. Avoid over-striding which pulls on the lower back."
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
    name: "Single-Leg Glute Bridge", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 10/side", 
    equipment: ["Bodyweight"], 
    pattern: "bridge",
    backClass: "spine-friendly",
    backMod: "Keep hips square to prevent pelvic rotation. Squeeze glute at top without arching lower back."
  },
  {
    name: "Reverse Lunges", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 10/side", 
    equipment: ["Bodyweight"], 
    pattern: "lunge",
    backClass: "spine-friendly",
    backMod: "Stepping backwards reduces anterior knee shearing and helps maintain vertical spine alignment."
  },
  {
    name: "Diamond Push-ups", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 8-10", 
    equipment: ["Bodyweight"], 
    pattern: "pushup",
    backClass: "spine-friendly",
    backMod: "Keep elbows tucked close to ribcage. Maintain rigid hollow-body plank alignment."
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
    backMod: "Step feet back into plank rather than jumping. Avoid letting hips sag when landing back."
  },
  {
    name: "Mountain Climbers", 
    category: "cardio", 
    duration: 4, 
    setsReps: "3 x 30s", 
    equipment: ["Bodyweight"], 
    pattern: "mountainclimber",
    backClass: "requires-mod",
    backMod: "Slow the pace. Elevate hands on a bench if you feel lower back rounding during knee drives."
  },
  {
    name: "High Knees", 
    category: "cardio", 
    duration: 3, 
    setsReps: "3 x 30s", 
    equipment: ["Bodyweight"], 
    pattern: "highknees",
    backClass: "requires-mod",
    backMod: "Keep knees at hip height. Maintain tall posture; do not round upper back forward to meet knees."
  },
  {
    name: "Skater Hops", 
    category: "cardio", 
    duration: 4, 
    setsReps: "3 x 30s", 
    equipment: ["Bodyweight"], 
    pattern: "lunge",
    backClass: "spine-friendly",
    backMod: "Bound laterally and absorb landing through bent hip and knee. Keep spine neutral."
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
    backMod: "McGill Big 3 spine stabilizer. Reach opposite arm and leg without twisting hips or sagging spine."
  },
  {
    name: "Dead Bug", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 10/side", 
    equipment: ["Bodyweight"], 
    pattern: "legraise",
    backClass: "stabilizer",
    backMod: "Press lower back firmly into floor. Lower limbs only as far as back stays glued flat."
  },
  {
    name: "Plank Hold", 
    category: "core", 
    duration: 3, 
    setsReps: "3 x 45s", 
    equipment: ["Bodyweight"], 
    pattern: "plank",
    backClass: "stabilizer",
    backMod: "Tuck pelvis into posterior tilt. Rest knees on floor if hips begin to sag into lordosis."
  },
  {
    name: "Side Plank", 
    category: "core", 
    duration: 3, 
    setsReps: "3 x 30s/side", 
    equipment: ["Bodyweight"], 
    pattern: "sideplank",
    backClass: "stabilizer",
    backMod: "Best exercise for Quadratus Lumborum with minimal compressive load. Stack feet or drop bottom knee."
  },
  {
    name: "Hollow Body Hold", 
    category: "core", 
    duration: 3, 
    setsReps: "3 x 20-30s", 
    equipment: ["Bodyweight"], 
    pattern: "situp",
    backClass: "stabilizer",
    backMod: "Keep lower back anchored against floor. Bend knees toward chest if lumbar lifts."
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
    backMod: "Spinal rotation with flexion stresses discs. Keep heels on floor and sit tall."
  },
  {
    name: "Bicycle Crunches", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 20", 
    equipment: ["Bodyweight"], 
    pattern: "twist",
    backClass: "requires-mod",
    backMod: "Rotate through thoracic spine rather than cranking neck and lumbar spine."
  },
  {
    name: "Leg Raises", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 12", 
    equipment: ["Bodyweight"], 
    pattern: "legraise",
    backClass: "requires-mod",
    backMod: "Place hands under glutes to support pelvis. Bend knees if lower back arches off floor."
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
    backMod: "Gently articulates each vertebra. Focus movement through mid-back rather than jamming lumbar."
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
    backMod: "Tight hamstrings pull pelvis into posterior tilt. Hinge at hips with a neutral spine."
  },
  {
    name: "Hip Flexor Stretch", 
    category: "mobility", 
    duration: 3, 
    setsReps: "Hold 30s x 2/side", 
    equipment: ["Bodyweight"], 
    pattern: "hipflexor",
    backClass: "decompression",
    backMod: "Tight psoas pulls lumbar spine forward. Squeeze rear glute and tuck pelvis."
  },
  {
    name: "Shoulder Rolls & Circles", 
    category: "mobility", 
    duration: 2, 
    setsReps: "2 min", 
    equipment: ["Bodyweight"], 
    pattern: "shoulderroll",
    backClass: "decompression",
    backMod: "Relieves upper thoracic and neck tension, opening ribcage to reduce compensatory back stress."
  },
  {
    name: "Cobra Pose", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 20-30s x 2", 
    equipment: ["Bodyweight"], 
    pattern: "cobra",
    backClass: "decompression",
    backMod: "Spinal extension restores disc space. Keep hips down; stop before any lumbar pinch."
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
    name: "Standing Forward Fold", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 30s", 
    equipment: ["Bodyweight"], 
    pattern: "forwardfold",
    backClass: "requires-mod",
    backMod: "Bend knees generously. Rest belly on thighs to decompress back without hanging from lumbar."
  },

  /* ==========================================================================
     DUMBBELL MOVEMENTS
     ========================================================================== */
  {
    name: "Dumbbell Rows", 
    category: "strength", 
    duration: 6, 
    setsReps: "3 x 12", 
    equipment: ["Dumbbells"], 
    pattern: "rowArm",
    backClass: "spine-friendly",
    backMod: "Hinge at hips with flat back. Pull elbows toward hips to engage lats and protect lumbar."
  },
  {
    name: "Dumbbell Overhead Press", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 10", 
    equipment: ["Dumbbells"], 
    pattern: "pressArm",
    backClass: "requires-mod",
    backMod: "Perform seated with back support or tall kneeling to eliminate lower back arching."
  },
  {
    name: "Dumbbell Bicep Curls", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 12", 
    equipment: ["Dumbbells"], 
    pattern: "curlArm",
    backClass: "spine-friendly",
    backMod: "Stand tall with knees soft. Do not swing hips or lean back to move weights."
  },
  {
    name: "Dumbbell Goblet Squat", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Dumbbells"], 
    pattern: "squat",
    backClass: "spine-friendly",
    backMod: "Holding weight at chest counterbalances the torso, naturally keeping spine upright."
  },
  {
    name: "Dumbbell Romanian Deadlift", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 10", 
    equipment: ["Dumbbells"], 
    pattern: "forwardfold",
    backClass: "requires-mod",
    backMod: "Push hips back with soft knees and flat back. Lower dumbbells only to mid-shin level."
  },
  {
    name: "Dumbbell Floor Press", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Dumbbells"], 
    pattern: "pushup",
    backClass: "spine-friendly",
    backMod: "Lying on floor provides natural lumbar support and limits shoulder hyperextension."
  },
  {
    name: "Dumbbell Thrusters", 
    category: "cardio", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Dumbbells"], 
    pattern: "squat",
    backClass: "requires-mod",
    backMod: "Use legs to drive weights overhead in one smooth rhythm. Keep core braced throughout."
  },
  {
    name: "Dumbbell Renegade Rows", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 8/side", 
    equipment: ["Dumbbells"], 
    pattern: "plank",
    backClass: "stabilizer",
    backMod: "Widen feet to shoulder-width to prevent hip rotation while rowing dumbbell to hip."
  },
  {
    name: "Dumbbell Farmer's March", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 45s", 
    equipment: ["Dumbbells"], 
    pattern: "highknees",
    backClass: "stabilizer",
    backMod: "Walk tall with shoulders back and abs braced. Outstanding anti-lateral flexion exercise."
  },

  /* ==========================================================================
     KETTLEBELL MOVEMENTS
     ========================================================================== */
  {
    name: "Kettlebell Goblet Squats", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Kettlebell"], 
    pattern: "squat",
    backClass: "spine-friendly",
    backMod: "Keep horns pinned to chest. Counterbalance reduces lumbar spinal compressive stress."
  },
  {
    name: "Kettlebell Deadlift", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Kettlebell"], 
    pattern: "squat",
    backClass: "spine-friendly",
    backMod: "Place kettlebell between feet. Hinge back, grip handle, and stand by driving through heels."
  },
  {
    name: "Kettlebell Single-Arm Row", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 10/side", 
    equipment: ["Kettlebell"], 
    pattern: "rowArm",
    backClass: "spine-friendly",
    backMod: "Rest non-working hand on thigh or bench. Keep spine rigid without twisting shoulders."
  },
  {
    name: "Kettlebell Swings", 
    category: "cardio", 
    duration: 5, 
    setsReps: "4 x 15", 
    equipment: ["Kettlebell"], 
    pattern: "bridge",
    backClass: "spine-friendly",
    backMod: "Hip hinge, not a squat. Snap hips forward to float bell to chest height without leaning back."
  },
  {
    name: "Kettlebell Clean & Press", 
    category: "cardio", 
    duration: 5, 
    setsReps: "3 x 8/side", 
    equipment: ["Kettlebell"], 
    pattern: "pressArm",
    backClass: "requires-mod",
    backMod: "Catch bell softly in rack position against chest before pressing vertically."
  },
  {
    name: "Kettlebell Halos", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 8 each way", 
    equipment: ["Kettlebell"], 
    pattern: "shoulderroll",
    backClass: "stabilizer",
    backMod: "Circle bell around crown of head while keeping ribs down, glutes tight, and spine stationary."
  },
  {
    name: "Kettlebell Suitcase Carry", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 30s/side", 
    equipment: ["Kettlebell"], 
    pattern: "highknees",
    backClass: "stabilizer",
    backMod: "Hold heavy bell in one hand. Walk smoothly without leaning toward or away from the weight."
  },
  {
    name: "Kettlebell Windmill", 
    category: "mobility", 
    duration: 4, 
    setsReps: "3 x 6/side", 
    equipment: ["Kettlebell"], 
    pattern: "stretch",
    backClass: "stabilizer",
    backMod: "Turn feet 45 degrees away from bell. Hinge deeply into rear hip while looking up at weight."
  },

  /* ==========================================================================
     RESISTANCE BAND MOVEMENTS
     ========================================================================== */
  {
    name: "Banded Rows", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 15", 
    equipment: ["Resistance Band"], 
    pattern: "rowArm",
    backClass: "spine-friendly",
    backMod: "Anchor band at chest height. Squeeze shoulder blades back; strengthens thoracic posture."
  },
  {
    name: "Banded Overhead Press", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 12", 
    equipment: ["Resistance Band"], 
    pattern: "pressArm",
    backClass: "requires-mod",
    backMod: "Step on band center with soft knees. Press overhead without hyperextending lumbar spine."
  },
  {
    name: "Banded Bicep Curls", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 15", 
    equipment: ["Resistance Band"], 
    pattern: "curlArm",
    backClass: "spine-friendly",
    backMod: "Keep elbows glued to sides. Smooth tension curve protects joints and spine."
  },
  {
    name: "Banded Lateral Squat Walk", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 12/side", 
    equipment: ["Resistance Band"], 
    pattern: "squat",
    backClass: "spine-friendly",
    backMod: "Place loop band above knees. Maintain quarter squat and step sideways with toes straight."
  },
  {
    name: "Banded Glute Kickbacks", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 12/side", 
    equipment: ["Resistance Band"], 
    pattern: "bridge",
    backClass: "spine-friendly",
    backMod: "Loop band around ankles. Kick back from glute without extending lower back."
  },
  {
    name: "Banded Speed Jabs", 
    category: "cardio", 
    duration: 4, 
    setsReps: "3 x 45s", 
    equipment: ["Resistance Band"], 
    pattern: "pressArm",
    backClass: "spine-friendly",
    backMod: "Anchor band behind back. Punch out rapidly against elastic resistance in athletic stance."
  },
  {
    name: "Banded Pallof Press", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 10/side", 
    equipment: ["Resistance Band"], 
    pattern: "twist",
    backClass: "stabilizer",
    backMod: "Premier anti-rotation exercise. Press band straight out from chest and resist rotational pull."
  },
  {
    name: "Banded Pull-Aparts", 
    category: "mobility", 
    duration: 3, 
    setsReps: "3 x 15", 
    equipment: ["Resistance Band"], 
    pattern: "shoulderroll",
    backClass: "decompression",
    backMod: "Pull band across chest with straight arms. Squeeze rhomboids to reverse rounded shoulders."
  },

  /* ==========================================================================
     CHAIR / BENCH MOVEMENTS
     ========================================================================== */
  {
    name: "Tricep Dips", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 12", 
    equipment: ["Chair/Bench"], 
    pattern: "dip",
    backClass: "spine-friendly",
    backMod: "Keep hips close to bench edge to maintain neutral posture and avoid forward shoulder roll."
  },
  {
    name: "Incline Push-ups", 
    category: "strength", 
    duration: 4, 
    setsReps: "3 x 12", 
    equipment: ["Chair/Bench"], 
    pattern: "pushup",
    backClass: "spine-friendly",
    backMod: "Hands on bench. Decreases spinal shear compared to standard floor push-ups."
  },
  {
    name: "Bulgarian Split Squats", 
    category: "strength", 
    duration: 5, 
    setsReps: "3 x 8/side", 
    equipment: ["Chair/Bench"], 
    pattern: "lunge",
    backClass: "spine-friendly",
    backMod: "Rest rear foot on chair. Keep torso upright and lower back knee straight toward floor."
  },
  {
    name: "Step-ups onto Bench", 
    category: "cardio", 
    duration: 5, 
    setsReps: "3 x 12/side", 
    equipment: ["Chair/Bench"], 
    pattern: "stepup",
    backClass: "spine-friendly",
    backMod: "Drive through whole foot on bench. Squeeze top glute and step down softly."
  },
  {
    name: "Bench Mountain Climbers", 
    category: "cardio", 
    duration: 4, 
    setsReps: "3 x 30s", 
    equipment: ["Chair/Bench"], 
    pattern: "mountainclimber",
    backClass: "spine-friendly",
    backMod: "Incline angle significantly reduces hip flexion impingement and lower back strain."
  },
  {
    name: "Seated Knee Tucks", 
    category: "core", 
    duration: 3, 
    setsReps: "3 x 12", 
    equipment: ["Chair/Bench"], 
    pattern: "situp",
    backClass: "requires-mod",
    backMod: "Hold bench edge for support. Draw knees to chest without slumping into lumbar spine."
  },
  {
    name: "Seated Glute Stretch", 
    category: "mobility", 
    duration: 3, 
    setsReps: "Hold 30s/side", 
    equipment: ["Chair/Bench"], 
    pattern: "hamstring",
    backClass: "decompression",
    backMod: "Sit tall and cross ankle over opposite knee. Lean forward from hips to release deep piriformis."
  },

  /* ==========================================================================
     WALL MOVEMENTS
     ========================================================================== */
  {
    name: "Wall Sit", 
    category: "strength", 
    duration: 3, 
    setsReps: "3 x 30-45s", 
    equipment: ["Wall"], 
    pattern: "wallsit",
    backClass: "spine-friendly",
    backMod: "Press entire back flat against wall. Builds leg endurance with zero spinal shear."
  },
  {
    name: "Wall Push-ups", 
    category: "strength", 
    duration: 3, 
    setsReps: "3 x 15", 
    equipment: ["Wall"], 
    pattern: "pushup",
    backClass: "spine-friendly",
    backMod: "Gentle regression for shoulder and chest strengthening with minimal axial load."
  },
  {
    name: "Wall Angels", 
    category: "mobility", 
    duration: 3, 
    setsReps: "3 x 10 slow reps", 
    equipment: ["Wall"], 
    pattern: "shoulderroll",
    backClass: "decompression",
    backMod: "Back, elbows, and wrists against wall. Slide arms up and down to restore thoracic extension."
  },
  {
    name: "Wall Calf & Achilles Stretch", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 30s/side", 
    equipment: ["Wall"], 
    pattern: "stretch",
    backClass: "decompression",
    backMod: "Hands on wall, back leg straight with heel flat. Relieves lower chain tension."
  },

  /* ==========================================================================
     JUMP ROPE MOVEMENTS
     ========================================================================== */
  {
    name: "Jump Rope", 
    category: "cardio", 
    duration: 8, 
    setsReps: "Continuous bounce", 
    equipment: ["Jump rope"], 
    pattern: "jumprope",
    backClass: "spine-friendly",
    backMod: "Keep jumps 1-2 inches off floor. Land softly on balls of feet with knees springy."
  },
  {
    name: "Jump Rope High Knees", 
    category: "cardio", 
    duration: 6, 
    setsReps: "3 x 45s", 
    equipment: ["Jump rope"], 
    pattern: "jumprope",
    backClass: "requires-mod",
    backMod: "Alternate knee lifts with rope pass. Maintain upright torso."
  },

  /* ==========================================================================
     STAIR MOVEMENTS
     ========================================================================== */
  {
    name: "Stair Climbs", 
    category: "cardio", 
    duration: 8, 
    setsReps: "Continuous climb", 
    equipment: ["Stairs"], 
    pattern: "stepup",
    backClass: "spine-friendly",
    backMod: "Drive through mid-foot and heel on every step. Avoid hunching forward over handrail."
  },
  {
    name: "Stair Skip-Step Lunges", 
    category: "strength", 
    duration: 6, 
    setsReps: "3 flights", 
    equipment: ["Stairs"], 
    pattern: "stepup",
    backClass: "spine-friendly",
    backMod: "Take stairs two at a time in deep controlled step-ups. Squeeze glute at top of each stride."
  },
  {
    name: "Stair Calf Drop Stretch", 
    category: "mobility", 
    duration: 2, 
    setsReps: "Hold 30s/side", 
    equipment: ["Stairs"], 
    pattern: "stretch",
    backClass: "decompression",
    backMod: "Balls of feet on step edge, lower heels below step level to open calves and plantar fascia."
  },

  /* ==========================================================================
     PULL-UP BAR MOVEMENTS
     ========================================================================== */
  {
    name: "Pull-ups", 
    category: "strength", 
    duration: 5, 
    setsReps: "4 x max reps", 
    equipment: ["Pull-up Bar"], 
    pattern: "pullup",
    backClass: "decompression",
    backMod: "Hanging provides natural traction and disc decompression for lumbar and thoracic spine."
  },
  {
    name: "Chin-ups", 
    category: "strength", 
    duration: 5, 
    setsReps: "4 x max reps", 
    equipment: ["Pull-up Bar"], 
    pattern: "pullup",
    backClass: "decompression",
    backMod: "Supinated grip recruits biceps and lats while giving gentle spinal traction."
  },
  {
    name: "Hanging Knee Raises", 
    category: "core", 
    duration: 4, 
    setsReps: "3 x 10", 
    equipment: ["Pull-up Bar"], 
    pattern: "legraise",
    backClass: "stabilizer",
    backMod: "Draw knees to chest while hanging. Completely unloads lumbar spine compared to floor crunches."
  },
  {
    name: "Active Dead Hang", 
    category: "mobility", 
    duration: 3, 
    setsReps: "3 x 30-45s hold", 
    equipment: ["Pull-up Bar"], 
    pattern: "stretch",
    backClass: "decompression",
    backMod: "Hang with arms straight, grip firm, and body relaxed. Unrivaled spinal decompression."
  }
];

const SEVEN_MIN_ORDER = [
  "Jumping Jacks", "Wall Sit", "Push-ups", "Sit-ups", "Step-ups onto Bench",
  "Bodyweight Squats", "Tricep Dips", "Plank Hold", "High Knees",
  "Walking Lunges", "Bird Dog", "Side Plank"
];
