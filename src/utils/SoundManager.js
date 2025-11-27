class SoundManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.3; // Default volume
    }

    playTone(freq, type, duration) {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.context.currentTime);

        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.context.currentTime + duration);
    }

    playClick() {
        this.playTone(800, 'sine', 0.1);
    }

    playHover() {
        this.playTone(400, 'triangle', 0.05);
    }

    playWin() {
        // Arpeggio
        const now = this.context.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'square', 0.2), i * 100);
        });
    }

    playLose() {
        const now = this.context.currentTime;
        [300, 200, 100].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sawtooth', 0.3), i * 150);
        });
    }

    playPoint() {
        this.playTone(1200, 'sine', 0.1);
    }
}

export default new SoundManager();
