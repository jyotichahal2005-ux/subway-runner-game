// Simple Web Audio API Synthesizer for procedural satisfying game sounds
let audioCtx: AudioContext | null = null;
let isMusicPlaying = false;
let bgMusic: HTMLAudioElement | null = null;

function getContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

export const AudioEngine = {
    init: () => {
        getContext();
    },
    
    playCoinCollect: () => {
        const ctx = getContext();
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.3);
    },
    
    playGlassShatter: () => {
        const ctx = getContext();
        const t = ctx.currentTime;
        
        // Use noise for shatter
        const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, t);
        filter.frequency.exponentialRampToValueAtTime(100, t + 0.5);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noiseSource.start(t);
    },
    
    playJump: () => {
        const ctx = getContext();
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.2);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.2, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.3);
    },
    
    playMagnetActivate: () => {
        const ctx = getContext();
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.4);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        
        // Add a slight filter effect
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, t);
        filter.frequency.linearRampToValueAtTime(3000, t + 0.4);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.5);
    },

    playGameOver: () => {
        const ctx = getContext();
        const t = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 0.8);
    },
    
    startMusic: () => {
        if (isMusicPlaying) return;
        isMusicPlaying = true;
        
        try {
            if (!bgMusic) {
                bgMusic = new Audio("/subway_surfer.mp3");
                bgMusic.loop = true;
                bgMusic.volume = 0.35; // Standard pleasant volume
            }
            bgMusic.play().catch(err => {
                console.warn("Background music autoplay was blocked or failed:", err);
                isMusicPlaying = false;
            });
        } catch (e) {
            console.error("Failed to start music:", e);
            isMusicPlaying = false;
        }
    },
    
    stopMusic: () => {
        isMusicPlaying = false;
        if (bgMusic) {
            try {
                bgMusic.pause();
            } catch (e) {
                console.error("Failed to stop music:", e);
            }
        }
    }
};
