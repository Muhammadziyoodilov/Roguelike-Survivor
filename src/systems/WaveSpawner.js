/**
 * Wave Spawner - 10 минут выживания с 5 Эпическими Цунами монстров и боссами
 */
class WaveSpawner {
    constructor(scene) {
        this.scene = scene;
        this.timer = 0;
        this.spawnCooldown = 0;
        this.tsunamisTriggered = new Set();
        this.isRedMinuteActive = false;
        this.initialSpawnDone = false;
    }

    getTargetPlayer() {
        if (this.scene.player && this.scene.player.active) return this.scene.player;
        if (this.scene.player1 && this.scene.player1.active) return this.scene.player1;
        if (this.scene.player2 && this.scene.player2.active) return this.scene.player2;
        return null;
    }

    getMapConfig() {
        const mapId = this.scene.selectedMapId || this.scene.mapId || 'dark_castle';
        return (CONFIG.MAPS && CONFIG.MAPS[mapId]) ? CONFIG.MAPS[mapId] : CONFIG.MAPS.dark_castle;
    }

    update(time, delta) {
        this.timer += delta / 1000;
        this.spawnCooldown += delta;

        const currentSec = Math.floor(this.timer);
        const player = this.getTargetPlayer();
        if (!player || !player.active) return;

        const mapConfig = this.getMapConfig();

        // Мгновенный спавн стартовой пачки монстров (0-я секунда)
        if (!this.initialSpawnDone) {
            this.initialSpawnDone = true;
            const starterType = (mapConfig.waves && mapConfig.waves[0] && mapConfig.waves[0].types) 
                ? mapConfig.waves[0].types[0] : 'slime';
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const dist = 320 + Math.random() * 60;
                const x = player.x + Math.cos(angle) * dist;
                const y = player.y + Math.sin(angle) * dist;
                this.scene.poolManager.spawnEnemy(x, y, starterType, 1.0);
            }
        }

        // Проверка запуска 5 цунами по расписанию выбранной карты
        this.checkTsunamiSchedule(currentSec, mapConfig);

        // Стандартный фоновый спавн
        const waveConfig = this.getWaveConfig(currentSec, mapConfig);
        if (this.spawnCooldown >= waveConfig.interval) {
            this.spawnCooldown = 0;
            this.spawnPack(waveConfig.types, waveConfig.count, waveConfig.multiplier);
        }
    }

    getWaveConfig(sec, mapConfig) {
        const hpMultiplier = 1.0 + (sec * 0.004);
        const waves = (mapConfig && mapConfig.waves) ? mapConfig.waves : CONFIG.MAPS.dark_castle.waves;

        // Ищем текущую активную волну по таймкоду
        let activeWave = waves[0];
        for (let i = waves.length - 1; i >= 0; i--) {
            if (sec >= waves[i].sec) {
                activeWave = waves[i];
                break;
            }
        }

        return {
            interval: activeWave.interval,
            count: activeWave.count,
            types: activeWave.types,
            multiplier: hpMultiplier * (sec >= 570 ? 1.3 : 1.0)
        };
    }

    checkTsunamiSchedule(sec, mapConfig) {
        const tsunamis = (mapConfig && mapConfig.tsunamis) ? mapConfig.tsunamis : CONFIG.MAPS.dark_castle.tsunamis;

        tsunamis.forEach((tsunami, index) => {
            const tsunamiId = index + 1;
            if (sec >= tsunami.sec && !this.tsunamisTriggered.has(tsunamiId)) {
                this.tsunamisTriggered.add(tsunamiId);
                this.triggerTsunami({
                    index: tsunamiId,
                    title: tsunami.title,
                    subtitle: tsunami.subtitle,
                    color: tsunami.color,
                    bossId: tsunami.bossId,
                    monsterTypes: tsunami.monsterTypes,
                    floodCount: tsunami.floodCount,
                    multiplier: tsunami.multiplier
                });
            }
        });
    }

    triggerTsunami(config) {
        const player = this.getTargetPlayer();
        if (!player) return;

        // Звуковая сирена цунами
        if (window.Sound.playTsunamiHorn) {
            window.Sound.playTsunamiHorn();
        } else {
            window.Sound.playBossWarning();
        }

        // Тряска экрана и визуальный баннер
        this.scene.cameras.main.shake(1200, 0.02);
        if (this.scene.showTsunamiAlert) {
            this.scene.showTsunamiAlert(config.index, config.title, config.subtitle, config.color);
        } else if (this.scene.showBossAlert) {
            this.scene.showBossAlert(config.bossId);
        }

        // Спавн Большого Босса
        this.spawnBoss(config.bossId);

        // Запуск потока (Цунами из монстров) несколькими волнами
        this.spawnTsunamiFlood(config.monsterTypes, config.floodCount, config.multiplier);
    }

    spawnTsunamiFlood(types, totalCount, multiplier) {
        const waves = 5;
        const countPerWave = Math.ceil(totalCount / waves);

        for (let w = 0; w < waves; w++) {
            this.scene.time.delayedCall(w * 700, () => {
                const player = this.getTargetPlayer();
                if (!player || !player.active) return;

                const baseRadius = 550;
                for (let i = 0; i < countPerWave; i++) {
                    const angle = (i / countPerWave) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
                    const dist = baseRadius + Math.random() * 80;
                    const x = player.x + Math.cos(angle) * dist;
                    const y = player.y + Math.sin(angle) * dist;

                    const type = types[Math.floor(Math.random() * types.length)];
                    this.scene.poolManager.spawnEnemy(x, y, type, multiplier);
                }
            });
        }
    }

    spawnPack(types, count, multiplier) {
        const player = this.getTargetPlayer();
        if (!player) return;
        const radius = 440;
        const baseAngle = Math.random() * Math.PI * 2;

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (Math.random() - 0.5) * 0.8;
            const dist = radius + Math.random() * 80;
            const x = player.x + Math.cos(angle) * dist;
            const y = player.y + Math.sin(angle) * dist;
            
            const type = types[Math.floor(Math.random() * types.length)];
            this.scene.poolManager.spawnEnemy(x, y, type, multiplier);
        }
    }

    spawnBoss(bossId) {
        const player = this.getTargetPlayer();
        if (!player) return;
        const angle = Math.random() * Math.PI * 2;
        const x = player.x + Math.cos(angle) * 500;
        const y = player.y + Math.sin(angle) * 500;

        const boss = this.scene.poolManager.spawnEnemy(x, y, bossId, 1.0);
        this.scene.setCurrentBoss(boss);
    }
}

window.WaveSpawner = WaveSpawner;
