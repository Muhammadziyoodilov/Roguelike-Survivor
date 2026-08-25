/**
 * Hybrid Sound Engine & Dynamic Audio Director
 * - Баланс громкости (микширование): BGM на заднем плане (0.32), SFX на переднем плане (0.75-0.90)
 * - Audio Ducking (приглушение музыки при повышении уровня, сирене босса, сундуках, смерти)
 * - Троттлинг и анти-клиппинг (ограничение частоты ударов и выстрелов от толпы монстров)
 * - Мелодичный рост тональности кристаллов опыта при цепочке сбора (Harmonic Gem Chime)
 * - Микро-детюнинг звуков атак (живой органичный звук без роботизированного спама)
 * - Переключение между меню, обычным боем и эпической музыкой босса
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.currentTrack = null; // 'menu' | 'battle' | 'boss' | null
        this.activeSound = null;  // Phaser Sound instance
        this.bgmTimer = null;
        this.initialized = false;

        // Базовые уровни громкости
        this.volumes = {
            bgmNormal: 0.32,
            bgmBoss: 0.40,
            bgmMenu: 0.35,
            bgmDucked: 0.12,
            sfxDefault: 0.80,
            sfxHit: 0.70,
            sfxSlash: 0.75,
            sfxShoot: 0.75,
            sfxBomb: 0.90,
            sfxDeath: 0.95,
            sfxLevelUp: 0.90,
            sfxJackpot: 0.90,
            sfxChest: 0.85,
            sfxBoss: 0.90
        };

        // Кулдауны для троттлинга SFX (миллисекунды)
        this.sfxCooldowns = {
            sfx_hit: 50,
            sfx_slash: 45,
            sfx_shoot: 45,
            sfx_coin: 65,
            sfx_gem: 45,
            sfx_bomb: 100,
            sfx_boss: 500,
            sfx_levelup: 300,
            sfx_chest: 300,
            sfx_jackpot: 400
        };
        this.lastPlayedMap = {};

        // Система гармоничного сбора гемов (pitch streak)
        this.gemStreak = 0;
        this.lastGemTime = 0;

        // Таймер восстановления после ducking
        this.duckTimer = null;
        this.isDucked = false;
        this.isPausedDucked = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.isMuted;
    }

    startBGM() {
        if (this.currentTrack === 'menu') this.playMenuBGM();
        else if (this.currentTrack === 'boss') this.playBossBGM();
        else this.playBattleBGM();
    }

    setVolume(volume = 1.0) {
        if (window.game && window.game.sound) {
            window.game.sound.volume = volume;
        }
    }

    play(key, config = {}) {
        if (this.isMuted) return;
        if (typeof this[key] === 'function') {
            this[key]();
        } else {
            this.playSoundFile(key, typeof config === 'number' ? config : (config.volume || 0.8), config);
        }
    }

    // --- SFX THROTTLING & PLAYBACK ---

    canPlaySFX(key) {
        if (this.isMuted) return false;
        const now = Date.now();
        const minInterval = this.sfxCooldowns[key] || 30;
        const lastTime = this.lastPlayedMap[key] || 0;
        if (now - lastTime < minInterval) {
            return false;
        }
        this.lastPlayedMap[key] = now;
        return true;
    }

    playSoundFile(key, volume = 0.8, config = {}) {
        if (this.isMuted) return true;
        if (window.game && window.game.sound && window.game.cache && window.game.cache.audio) {
            if (window.game.cache.audio.has(key)) {
                try {
                    const finalConfig = Object.assign({ volume: volume }, config);
                    window.game.sound.play(key, finalConfig);
                    return true;
                } catch (e) {
                    console.warn('Error playing sound file:', key, e);
                }
            }
        }
        return false;
    }

    // --- AUDIO DUCKING (Приглушение музыки) ---

    duckBGM(duckVolume = 0.12, durationMs = 1800) {
        if (this.isMuted || !this.activeSound || !this.activeSound.isPlaying) return;
        this.isDucked = true;

        if (this.duckTimer) {
            clearTimeout(this.duckTimer);
            this.duckTimer = null;
        }

        // Плавное снижение громкости BGM
        this.tweenBGMVolume(duckVolume, 150);

        // Автоматическое плавное восстановление
        this.duckTimer = setTimeout(() => {
            if (this.isDucked && !this.isPausedDucked) {
                this.restoreBGM();
            }
        }, durationMs);
    }

    restoreBGM() {
        this.isDucked = false;
        if (this.isMuted || !this.activeSound || !this.activeSound.isPlaying) return;
        let targetVol = this.volumes.bgmNormal;
        if (this.currentTrack === 'boss') targetVol = this.volumes.bgmBoss;
        if (this.currentTrack === 'menu') targetVol = this.volumes.bgmMenu;

        this.tweenBGMVolume(targetVol, 400);
    }

    setPauseDucking(isPaused) {
        this.isPausedDucked = isPaused;
        if (isPaused) {
            this.tweenBGMVolume(0.10, 200);
        } else {
            this.restoreBGM();
        }
    }

    tweenBGMVolume(targetVol, durationMs = 300) {
        if (!this.activeSound || !this.activeSound.isPlaying) return;
        if (window.game && window.game.tweens) {
            window.game.tweens.add({
                targets: this.activeSound,
                volume: targetVol,
                duration: durationMs
            });
        } else {
            this.activeSound.setVolume(targetVol);
        }
    }

    // --- BGM TRACK MANAGERS ---

    playMenuBGM() {
        this.currentTrack = 'menu';
        this.switchBGM('bgm_menu', 80, this.volumes.bgmMenu);
    }

    playBattleBGM() {
        this.currentTrack = 'battle';
        this.switchBGM('bgm_main', 140, this.volumes.bgmNormal);
    }

    playBossBGM() {
        this.currentTrack = 'boss';
        this.switchBGM('bgm_boss', 160, this.volumes.bgmBoss);
    }

    switchBGM(trackKey, fallbackTempo = 140, targetVolume = 0.35) {
        if (this.isMuted) return;
        this.init();
        this.resume();

        // 1. Если загружен реальный MP3 файл в Phaser Sound Manager
        if (window.game && window.game.sound && window.game.cache && window.game.cache.audio && window.game.cache.audio.has(trackKey)) {
            if (this.activeSound && this.activeSound.key === trackKey && this.activeSound.isPlaying) {
                // Если трек уже играет, просто обновляем целевую громкость
                if (!this.isDucked && !this.isPausedDucked) {
                    this.tweenBGMVolume(targetVolume, 400);
                }
                return;
            }

            // Плавное затухание старого трека и запуск нового
            this.fadeOutActiveSound(400, () => {
                if (this.isMuted) return;
                try {
                    this.activeSound = window.game.sound.add(trackKey, { loop: true, volume: 0 });
                    this.activeSound.play();

                    // Плавное нарастание громкости нового трека (Fade In)
                    this.tweenBGMVolume(targetVolume, 500);
                } catch (e) {
                    console.warn('Error starting BGM:', e);
                }
            });

            this.stopProceduralBGM();
            return;
        }

        // 2. Фоллбэк: процедурный чиптюн
        this.fadeOutActiveSound(300, () => {
            this.startProceduralBGM(fallbackTempo);
        });
    }

    fadeOutBGM(durationMs = 500, onComplete = null) {
        this.fadeOutActiveSound(durationMs, onComplete);
        this.stopProceduralBGM();
    }

    fadeOutActiveSound(durationMs = 400, callback = null) {
        if (this.activeSound && this.activeSound.isPlaying) {
            const snd = this.activeSound;
            this.activeSound = null;
            if (window.game && window.game.tweens) {
                window.game.tweens.add({
                    targets: snd,
                    volume: 0,
                    duration: durationMs,
                    onComplete: () => {
                        snd.stop();
                        snd.destroy();
                        if (callback) callback();
                    }
                });
            } else {
                snd.stop();
                snd.destroy();
                if (callback) callback();
            }
        } else {
            if (callback) callback();
        }
    }

    stopBGM() {
        this.fadeOutBGM(250);
    }

    // --- PROCEDURAL CHIPTUNE GENERATOR (Фоллбэк) ---
    startProceduralBGM(tempo = 140) {
        this.stopProceduralBGM();
        if (this.isMuted || !this.ctx) return;
        this.resume();

        let step = 0;
        const bassNotes = [110, 110, 130.81, 146.83, 98, 98, 123.47, 130.81];
        const intervalMs = Math.round(60000 / tempo);

        this.bgmTimer = setInterval(() => {
            if (this.isMuted || !this.ctx) return;
            const now = this.ctx.currentTime;

            const bass = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bass.type = 'triangle';
            const note = bassNotes[step % bassNotes.length];
            bass.frequency.setValueAtTime(note, now);
            bassGain.gain.setValueAtTime(0.04, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
            bass.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bass.start(now);
            bass.stop(now + 0.15);

            if (step % 2 === 1) {
                const tick = this.ctx.createOscillator();
                const tickGain = this.ctx.createGain();
                tick.type = 'square';
                tick.frequency.setValueAtTime(1200, now);
                tickGain.gain.setValueAtTime(0.015, now);
                tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                tick.connect(tickGain);
                tickGain.connect(this.ctx.destination);
                tick.start(now);
                tick.stop(now + 0.04);
            }
            step++;
        }, intervalMs);
    }

    stopProceduralBGM() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    // --- SFX METHODS (Сбалансированные и защищенные от перегруза) ---

    playSlash() {
        if (!this.canPlaySFX('sfx_slash')) return;
        const detune = Math.floor((Math.random() - 0.5) * 80);
        if (this.playSoundFile('sfx_slash', this.volumes.sfxSlash, { detune: detune })) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    playDashSlash() {
        if (!this.canPlaySFX('sfx_slash')) return;
        if (this.playSoundFile('sfx_slash', 0.9, { rate: 1.2, detune: 120 })) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
    }

    playThunderCrit() {
        if (!this.canPlaySFX('sfx_bomb')) return;
        this.duckBGM(0.12, 1100);
        if (this.playSoundFile('sfx_bomb', 0.95, { detune: -150 }) || this.playSoundFile('sfx_boss', 0.85)) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;

        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(170, now);
        sub.frequency.exponentialRampToValueAtTime(30, now + 0.55);
        subGain.gain.setValueAtTime(0.4, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 0.55);

        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.35, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
            noise.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(now);
        } catch (e) {}
    }

    playShoot() {
        if (!this.canPlaySFX('sfx_shoot')) return;
        const detune = Math.floor((Math.random() - 0.5) * 70);
        if (this.playSoundFile('sfx_shoot', this.volumes.sfxShoot, { detune: detune })) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    playHit() {
        if (!this.canPlaySFX('sfx_hit')) return;
        const rate = 0.95 + Math.random() * 0.1;
        if (this.playSoundFile('sfx_hit', this.volumes.sfxHit, { rate: rate })) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    playExplosion() {
        if (!this.canPlaySFX('sfx_bomb')) return;
        this.duckBGM(0.10, 800);

        if (this.playSoundFile('sfx_bomb', this.volumes.sfxBomb) || this.playSoundFile('sfx_hit', 0.8)) return;
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
    }

    playBomb() {
        this.playExplosion();
    }

    playGem() {
        if (!this.canPlaySFX('sfx_gem')) return;
        const now = Date.now();
        if (now - this.lastGemTime < 380) {
            this.gemStreak = Math.min(this.gemStreak + 1, 6);
        } else {
            this.gemStreak = 0;
        }
        this.lastGemTime = now;

        // Постепенное повышение тональности при сборе цепочки кристаллов
        const rate = 1.0 + (this.gemStreak * 0.05);
        if (this.playSoundFile('sfx_gem', 0.68, { rate: rate })) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const freqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77];
        const pitch = freqs[Math.min(this.gemStreak, freqs.length - 1)];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, t);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.4, t + 0.08);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
    }

    playCoin() {
        if (!this.canPlaySFX('sfx_coin')) return;
        if (this.playSoundFile('sfx_coin', 0.78)) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now);
        osc1.frequency.setValueAtTime(1318.51, now + 0.06);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc1.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.23);
    }

    playLevelUp() {
        if (!this.canPlaySFX('sfx_levelup')) return;
        // Приглушаем фоновую музыку, чтобы победная мелодия уровня звучала сочно
        this.duckBGM(0.10, 2000);

        if (this.playSoundFile('sfx_levelup', this.volumes.sfxLevelUp)) return;
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, index) => {
            const now = this.ctx.currentTime + index * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.26);
        });
    }

    playChest() {
        if (!this.canPlaySFX('sfx_chest')) return;
        this.duckBGM(0.10, 2200);

        if (this.playSoundFile('sfx_chest', this.volumes.sfxChest)) return;
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const notes = [330, 440, 550, 660, 880, 1100];
        notes.forEach((freq, index) => {
            const now = this.ctx.currentTime + index * 0.07;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        });
    }

    playDeath() {
        // Мгновенная остановка любой музыки при смерти
        this.stopBGM();

        if (this.playSoundFile('sfx_death', this.volumes.sfxDeath)) return;
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.9);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.88);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);

        try {
            const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
            noise.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(now);
        } catch (e) {}
    }

    playHeartbeat() {
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        for (let i = 0; i < 2; i++) {
            const t = now + i * 0.18;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(i === 0 ? 80 : 65, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.13);
        }
    }

    playFreeze() {
        this.duckBGM(0.12, 1200);
        if (this.playSoundFile('sfx_freeze', 0.85)) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const notes = [1200, 1600, 2100, 2800];
        notes.forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.04;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        });
    }

    playRage() {
        this.duckBGM(0.12, 1400);
        if (this.playSoundFile('sfx_rage', 0.85)) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);
    }

    playPowerup() {
        this.duckBGM(0.12, 1200);
        if (this.playSoundFile('sfx_levelup', this.volumes.sfxLevelUp)) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        const chords = [523.25, 659.25, 783.99, 1046.50];
        chords.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            gain.gain.setValueAtTime(0.18, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.25);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.26);
        });
    }

    playJackpot() {
        if (!this.canPlaySFX('sfx_jackpot')) return;
        this.duckBGM(0.08, 2500);
        if (this.playSoundFile('sfx_jackpot', this.volumes.sfxJackpot)) return;

        if (!this.ctx || this.isMuted) return;
        this.resume();
        const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        fanfare.forEach((freq, i) => {
            const now = this.ctx.currentTime + i * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        });
    }

    playBossWarning() {
        if (!this.canPlaySFX('sfx_boss')) return;
        // При сирене босса приглушаем музыку для максимального эпического эффекта
        this.duckBGM(0.10, 2600);

        if (this.playSoundFile('sfx_boss', this.volumes.sfxBoss)) return;
        if (!this.ctx || this.isMuted) return;
        this.resume();
        const now = this.ctx.currentTime;
        
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(55, now);
        sub.frequency.linearRampToValueAtTime(110, now + 0.8);
        sub.frequency.linearRampToValueAtTime(45, now + 1.6);
        subGain.gain.setValueAtTime(0.35, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 1.55);
        sub.connect(subGain);
        subGain.connect(this.ctx.destination);
        sub.start(now);
        sub.stop(now + 1.6);

        [220, 277.18, 329.63].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(0.18, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.5);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.55);
        });
    }

    playTsunamiHorn() {
        this.playBossWarning();
    }
}

window.Sound = new SoundEngine();

// Авто-разблокировка при первом взаимодействии с экраном
const unlockAudio = () => {
    if (window.Sound) {
        window.Sound.init();
        window.Sound.resume();
        if (!window.Sound.isMuted) {
            if (window.Sound.currentTrack === 'menu' && (!window.Sound.activeSound || !window.Sound.activeSound.isPlaying)) {
                window.Sound.playMenuBGM();
            }
        }
    }
};
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);
window.addEventListener('touchstart', unlockAudio);
