// HIGH-FIDELITY AUDIO SYNTHESIZER
// Generates premium UI sounds using Web Audio API Physics
// No external files, no downloads, 100% reliable.

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let ctx: AudioContext | null = null;

// Initialize context lazily on first interaction
const getCtx = () => {
    if (!ctx) ctx = new AudioContext();
    return ctx;
};

// --- SYNTHESIS MODELS ---

const createPop = (startTime: number) => {
    // "Water Droplet" Model
    // 600Hz -> 100Hz sine wave with tight envelope
    const c = getCtx();
    const t = startTime;
    const osc = c!.createOscillator();
    const gain = c!.createGain();

    osc.connect(gain);
    gain.connect(c!.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.start(t);
    osc.stop(t + 0.15);
};

const createSwipe = (startTime: number) => {
    // "Air Whoosh" Model
    // Filtered White Noise
    const c = getCtx();
    const t = startTime;

    // Create noise buffer
    const bufferSize = c!.sampleRate * 0.5;
    const buffer = c!.createBuffer(1, bufferSize, c!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = c!.createBufferSource();
    noise.buffer = buffer;

    const filter = c!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 1;

    const gain = c!.createGain();

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(c!.destination);

    // Automation
    filter.frequency.setValueAtTime(100, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.1); // Open up
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.2);  // Close down

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.2);

    noise.start(t);
    noise.stop(t + 0.2);
};

const createSmash = (startTime: number) => {
    // "Deep Impact" Model
    // Low Square + Low Sine + Distortion
    const c = getCtx();
    const t = startTime;

    const osc = c!.createOscillator();
    const gain = c!.createGain();

    // Optional: Add some distortion/noise for "crunch"
    // For now, pure massive sub-bass
    osc.connect(gain);
    gain.connect(c!.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.start(t);
    osc.stop(t + 0.3);
};

const createSuccess = (startTime: number) => {
    // "Fairy Glass" Model
    // Multiple high sine waves spread apart
    const c = getCtx();
    const t = startTime;

    // C Major 7th chord: C5, E5, G5, B5
    const freqs = [523.25, 659.25, 783.99, 987.77];

    freqs.forEach((f, i) => {
        const osc = c!.createOscillator();
        const gain = c!.createGain();

        osc.connect(gain);
        gain.connect(c!.destination);

        osc.type = 'sine';
        osc.frequency.value = f;

        // Stagger entries
        const start = t + (i * 0.05);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 1.5); // Long sustain

        osc.start(start);
        osc.stop(start + 1.5);
    });
};

export const AudioEngine = {
    pop: () => createPop(getCtx()!.currentTime),
    swipe: () => createSwipe(getCtx()!.currentTime),
    smash: () => createSmash(getCtx()!.currentTime),
    success: () => createSuccess(getCtx()!.currentTime),
    click: () => createPop(getCtx()!.currentTime),
    resume: () => {
        if (ctx && ctx.state === 'suspended') ctx.resume();
    }
};
