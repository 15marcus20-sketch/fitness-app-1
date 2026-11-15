/* ---------------- Audio, Voice & Haptics Engine ---------------- */
let audioCtx = null;
let wakeLockSentinel = null;

function getAudioContext(){
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synthesize clean workout beeps without needing external mp3 files
function playBeep(freq = 880, duration = 0.15, type = 'sine'){
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(e) {
    // Audio context may be blocked before first user interaction
  }
}

// Android haptic vibration feedback
function vibrateDevice(pattern = [80]){
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch(e) {}
}

// Text-to-speech voice cue
function speak(text){
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; 
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  } catch(e) { 
    console.warn('Speech synthesis failed:', e); 
  }
}

// Screen Wake Lock API (keeps screen awake during active workout sets)
async function requestScreenWakeLock(){
  try {
    if ('wakeLock' in navigator) {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
    }
  } catch(e) {
    console.log('Wake Lock unavailable or permission denied:', e);
  }
}

function releaseScreenWakeLock(){
  try {
    if (wakeLockSentinel) {
      wakeLockSentinel.release();
      wakeLockSentinel = null;
    }
  } catch(e) {}
}
