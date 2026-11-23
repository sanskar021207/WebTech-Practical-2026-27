/**
 * TechFest 2026 - Web Audio API Sound Generator
 * Generates UI sounds programmatically - no external files needed
 */

class SoundGenerator {
    constructor() {
        this.audioContext = null;
        this.enabled = false;
        this.masterGain = null;
    }

    init() {
        // Create audio context on first user interaction
        const resumeAudio = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.audioContext.createGain();
                this.masterGain.connect(this.audioContext.destination);
                this.masterGain.gain.value = 0.3;
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.enabled = true;
            document.removeEventListener('click', resumeAudio);
            document.removeEventListener('keydown', resumeAudio);
        };

        document.addEventListener('click', resumeAudio, { once: true });
        document.addEventListener('keydown', resumeAudio, { once: true });
    }

    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }

    playClick() {
        this.playTone(800, 0.08, 'square', 0.15);
    }

    playHover() {
        this.playTone(1200, 0.04, 'sine', 0.05);
    }

    playSuccess() {
        this.playSequence([
            { freq: 523.25, dur: 0.1 },   // C5
            { freq: 659.25, dur: 0.1 },   // E5
            { freq: 783.99, dur: 0.15 },  // G5
            { freq: 1046.50, dur: 0.2 }   // C6
        ], 'triangle', 0.2);
    }

    playError() {
        this.playSequence([
            { freq: 300, dur: 0.15 },
            { freq: 250, dur: 0.15 },
            { freq: 200, dur: 0.2 }
        ], 'sawtooth', 0.25);
    }

    playTransition() {
        this.playTone(600, 0.1, 'sine', 0.1);
    }

    playTone(frequency, duration, type = 'sine', volume = 1) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.masterGain.gain.value, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playSequence(notes, type = 'sine', volume = 1) {
        if (!this.enabled || !this.audioContext) return;

        let time = this.audioContext.currentTime;

        notes.forEach(note => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(note.freq, time);

            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(volume * this.masterGain.gain.value, time + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + note.dur);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start(time);
            oscillator.stop(time + note.dur);

            time += note.dur * 0.9; // Slight overlap for smoothness
        });
    }
}

// Export for use in main script
window.SoundGenerator = SoundGenerator;