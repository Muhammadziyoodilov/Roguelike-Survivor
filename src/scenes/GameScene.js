/**
 * Game Scene - Основная боевая сцена выживания (10 минут)
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.selectedHeroId = (data && (data.heroId || data.hero)) || window.SaveManager.data.selectedHero || 'knight';
        this.selectedMapId = (data && data.mapId) || window.SaveManager.data.selectedMap || 'dark_castle';
        this.mapConfig = (CONFIG.MAPS && CONFIG.MAPS[this.selectedMapId]) ? CONFIG.MAPS[this.selectedMapId] : CONFIG.MAPS.dark_castle;
        
        window.SaveManager.data.selectedHero = this.selectedHeroId;
        window.SaveManager.data.selectedMap = this.selectedMapId;

        this.gameTimeSec = 0;
        this.kills = 0;
        this.goldEarned = 0;
        this.currentBoss = null;
        this.joystickVector = { x: 0, y: 0 };
    }

    create() {
        const { WIDTH, HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } = CONFIG.GAME;

        // Настройка физического мира
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        // Генерация пола арены в зависимости от карты
        this.createArena(WORLD_WIDTH, WORLD_HEIGHT);

        // Менеджер пулов объектов
        this.poolManager = new PoolManager(this);
        this.dropPool = this.poolManager;

        // Спавн игрока в центре арены
        this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2, this.selectedHeroId);

        // Интерактивные разбиваемые бочки
        this.createBarrels(WORLD_WIDTH, WORLD_HEIGHT);

        // Системы
        this.weaponSystem = new WeaponSystem(this, this.player);
        this.waveSpawner = new WaveSpawner(this);

        // Камера
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // Коллизии снарядов с врагами
        this.physics.add.overlap(this.poolManager.projectileGroup, this.poolManager.enemyGroup, (proj, enemy) => {
            if (proj.active && enemy.active) {
                proj.onHitEnemy(enemy);
            }
        });

        // Коллизии снарядов с бочками
        this.physics.add.overlap(this.poolManager.projectileGroup, this.barrelGroup, (proj, barrel) => {
            if (proj.active && barrel.active) {
                this.breakBarrel(barrel);
            }
        });

        this.physics.add.overlap(this.player, this.poolManager.enemyGroup, (player, enemy) => {
            if (player.active && enemy.active) {
                player.takeDamage(enemy.damage);
            }
        });

        this.physics.add.overlap(this.player, this.poolManager.enemyBulletGroup, (player, bullet) => {
            if (player.active && bullet.active) {
                player.takeDamage(bullet.damage);
                bullet.expire();
            }
        });

        // Графика для стрелок-указателей за экраном
        this.indicatorGraphics = this.add.graphics().setScrollFactor(0).setDepth(90);
        this.indicatorTexts = [];

        // Создание верхнего HUD
        this.createHUD();

        // Клавиша ESC для паузы
        this.input.keyboard.on('keydown-ESC', () => this.openPause());

        // Обработка поворота экрана и ресайза
        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
        });
        this.events.once('destroy', () => {
            this.scale.off('resize', this.handleResize, this);
        });

        // Мобильный тач-джойстик
        this.setupMobileJoystick();

        // Запуск таймера игры
        this.gameActive = true;

        // Плавное появление экрана и запуск боевой музыки
        this.cameras.main.fadeIn(600, 0, 0, 0);
        window.Sound.playBattleBGM();

        // Эффект появления героя
        this.createPlayerSpawnEffect(this.player.x, this.player.y);

        // Атмосферные частицы локации
        this.createAmbientAtmosphere(WORLD_WIDTH, WORLD_HEIGHT);
    }

    createPlayerSpawnEffect(x, y) {
        const ring = this.add.circle(x, y, 40, 0x00f5d4, 0.7).setDepth(25);
        this.tweens.add({
            targets: ring,
            scale: 2.0,
            alpha: 0,
            duration: 650,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });

        for (let i = 0; i < 12; i++) {
            const spark = this.add.circle(x, y, 3, 0xffffff).setDepth(26);
            const angle = (Math.PI * 2 / 12) * i;
            const dist = 50;
            this.tweens.add({
                targets: spark,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                duration: 500,
                ease: 'Back.easeOut',
                onComplete: () => spark.destroy()
            });
        }
    }

    handleResize(gameSize) {
        if (!this.cameras || !this.cameras.main) return;
        this.cameras.main.setSize(gameSize.width, gameSize.height);
        if (typeof this.layoutHUD === 'function') {
            this.layoutHUD(gameSize.width, gameSize.height);
        }
    }

    createArena(w, h) {
        const floorKey = this.mapConfig.tileFloor || 'tile_floor_castle';
        const floorAltKey = this.mapConfig.tileFloorAlt || 'tile_floor_castle_alt';
        const wallKey = this.mapConfig.tileWall || 'tile_wall_castle';
        const obstacleKey = this.mapConfig.tileObstacle || 'tile_pillar_castle';
        const brazierKey = this.mapConfig.propBrazier || 'prop_brazier_castle';

        // 1. Тайлы пола (Чистый, спокойный темный фон без ряби)
        for (let x = 0; x < w; x += 64) {
            for (let y = 0; y < h; y += 64) {
                if (x === 0 || y === 0 || x >= w - 64 || y >= h - 64) {
                    this.add.image(x + 32, y + 32, wallKey).setDepth(0);
                } else {
                    const isAlt = ((x * 17 + y * 11) % 100) < 6;
                    const tileKey = isAlt ? floorAltKey : floorKey;
                    this.add.image(x + 32, y + 32, tileKey).setDepth(0);
                }
            }
        }

        // 2. Препятствия локации (Колонны, Деревья, Пилоны)
        for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(160, w - 160);
            const ry = Phaser.Math.Between(160, h - 160);
            this.add.image(rx, ry, obstacleKey).setDepth(5);
        }

        // 3. Декоративные источники света/магии (Факелы, Грибы, Гейзеры, Кристаллы)
        for (let i = 0; i < 20; i++) {
            const bx = Phaser.Math.Between(140, w - 140);
            const by = Phaser.Math.Between(140, h - 140);
            const prop = this.add.image(bx, by, brazierKey).setDepth(5);
            this.tweens.add({
                targets: prop,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 300 + Math.random() * 250,
                yoyo: true,
                repeat: -1
            });
        }
    }

    createAmbientAtmosphere(w, h) {
        const theme = this.mapConfig.ambientParticle || 'dungeon_dust';
        let color = 0x475569;
        let count = 40;

        if (theme === 'forest_spores') {
            color = 0x10b981;
            count = 50;
        } else if (theme === 'lava_embers') {
            color = 0xf97316;
            count = 55;
        } else if (theme === 'snow_blizzard') {
            color = 0xe0f2fe;
            count = 60;
        }

        for (let i = 0; i < count; i++) {
            const px = Phaser.Math.Between(100, w - 100);
            const py = Phaser.Math.Between(100, h - 100);
            const size = Math.random() * 2.5 + 1.5;
            const p = this.add.circle(px, py, size, color, Math.random() * 0.4 + 0.3).setDepth(6);

            this.tweens.add({
                targets: p,
                x: px + (Math.random() - 0.5) * 80,
                y: py - (30 + Math.random() * 60),
                alpha: 0.1,
                duration: 2000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    createStepDust(x, y) {
        const dust = this.add.circle(x + (Math.random() - 0.5) * 8, y, 3, 0x475569, 0.6).setDepth(4);
        this.tweens.add({
            targets: dust,
            scale: 1.8,
            alpha: 0,
            y: y - 4,
            duration: 300,
            ease: 'Cubic.easeOut',
            onComplete: () => dust.destroy()
        });
    }

    createEnemyDeathEffect(x, y, enemyType) {
        let color = 0x55a630; // slime green
        if (enemyType === 'bat') color = 0x7b2cbf;
        else if (enemyType === 'skeleton') color = 0xe2e8f0;
        else if (enemyType === 'skull' || enemyType === 'fire_elem') color = 0xf97316;
        else if (enemyType === 'ghost' || enemyType === 'necro_mage') color = 0x00f5d4;
        else if (enemyType === 'orc') color = 0x15803d;

        for (let i = 0; i < 7; i++) {
            const angle = (Math.PI * 2 / 7) * i + (Math.random() - 0.5) * 0.4;
            const speed = 40 + Math.random() * 60;
            const p = this.add.circle(x, y, 3 + Math.random() * 2, color).setDepth(25);
            this.tweens.add({
                targets: p,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                scale: 0.2,
                alpha: 0,
                duration: 350 + Math.random() * 150,
                ease: 'Cubic.easeOut',
                onComplete: () => p.destroy()
            });
        }
    }

    createHUD() {
        const { width, height } = this.scale;
        const isPortrait = height > width;

        // 1. Полоса опыта (EXP BAR) на самом верху экрана
        this.xpBarBg = this.add.rectangle(width / 2, 6, width, 12, 0x090d16).setScrollFactor(0).setDepth(100);
        this.xpBarFill = this.add.rectangle(0, 6, 0, 10, 0x10b981).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101);

        // 2. Док героя и здоровья (Слева сверху)
        this.heroDockBg = this.add.rectangle(110, 42, 200, 48, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100);
        this.heroDockBg.setStrokeStyle(1.5, 0x334155);

        const heroId = this.heroId || (this.player ? this.player.heroId : 'knight');
        this.heroPortrait = this.add.image(28, 42, `hero_${heroId}`).setDisplaySize(38, 38).setScrollFactor(0).setDepth(102);

        this.lvlText = this.add.text(56, 26, 'LVL 1', {
            fontFamily: "'Cinzel', serif", fontSize: '13px', fontStyle: 'bold', color: '#ffd166'
        }).setScrollFactor(0).setDepth(102);

        // Полоса здоровья героя
        this.playerHpBg = this.add.rectangle(130, 46, 140, 14, 0x1e1b4b).setScrollFactor(0).setDepth(101);
        this.playerHpFill = this.add.rectangle(60, 46, 140, 12, 0xef4444).setScrollFactor(0).setOrigin(0, 0.5).setDepth(102);
        this.playerHpText = this.add.text(130, 46, '120 / 120', {
            fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(103);

        // 3. Готический таймер обратного отсчета по центру
        this.timerBg = this.add.rectangle(width / 2, 42, 130, 38, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100);
        this.timerBg.setStrokeStyle(1.5, 0x38bdf8);
        this.timerIcon = this.add.image(width / 2 - 40, 42, 'ui_clock').setScrollFactor(0).setScale(0.85).setDepth(101);
        this.timerText = this.add.text(width / 2 + 10, 42, '10:00', {
            fontFamily: "'Rajdhani', monospace", fontSize: '22px', fontStyle: 'bold', color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(101);

        // 4. Блок убийств и золота (Справа сверху)
        this.statsPillBg = this.add.rectangle(width - 150, 42, 170, 38, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100);
        this.statsPillBg.setStrokeStyle(1.5, 0x334155);

        this.killsIcon = this.add.image(width - 215, 42, 'ui_skull').setScrollFactor(0).setScale(0.85).setDepth(101);
        this.killsText = this.add.text(width - 198, 42, '0', {
            fontFamily: "'Rajdhani', sans-serif", fontSize: '16px', fontStyle: 'bold', color: '#f87171'
        }).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101);

        this.goldIcon = this.add.image(width - 145, 42, 'ui_coin').setScrollFactor(0).setScale(0.85).setDepth(101);
        this.goldText = this.add.text(width - 128, 42, '0', {
            fontFamily: "'Rajdhani', sans-serif", fontSize: '16px', fontStyle: 'bold', color: '#ffd166'
        }).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101);

        // Кнопка Паузы
        this.pauseBtn = this.add.image(width - 35, 42, 'btn_close_circle').setScrollFactor(0).setScale(1.0).setInteractive({ useHandCursor: true }).setDepth(101);
        this.pauseIcon = this.add.image(width - 35, 42, 'ui_pause').setScrollFactor(0).setScale(0.8).setDepth(102);
        this.pauseBtn.on('pointerdown', () => this.openPause());

        // Виньетка критически низкого здоровья (<25% HP)
        this.lowHpVignette = this.add.rectangle(width / 2, height / 2, width, height, 0x880000, 0)
            .setScrollFactor(0)
            .setDepth(85);

        // Контейнер для иконок инвентаря
        this.inventoryGroup = this.add.group();
        this.updateInventoryHUD();

        // Полоса здоровья босса (скрыта по умолчанию)
        this.bossBarBg = this.add.rectangle(width / 2, 85, 380, 16, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100).setVisible(false);
        this.bossBarBg.setStrokeStyle(1.5, 0xef4444);
        this.bossBarFill = this.add.rectangle(width / 2 - 185, 85, 370, 12, 0xef4444).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101).setVisible(false);
        this.bossNameText = this.add.text(width / 2, 70, '', {
            fontFamily: "'Cinzel', serif", fontSize: '14px', fontStyle: 'bold', color: '#ffd166'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(101).setVisible(false);

        this.layoutHUD(width, height);
    }

    layoutHUD(width, height) {
        if (!this.xpBarBg) return;

        this.xpBarBg.setPosition(width / 2, 6).setSize(width, 12);
        if (this.player) {
            const xpRatio = Math.min(1.0, this.player.xp / this.player.nextLevelXp);
            this.xpBarFill.width = width * xpRatio;
        }

        const isPortrait = height > width;

        if (isPortrait) {
            this.heroDockBg.setPosition(width / 2, 42);
            this.timerBg.setPosition(width / 2, 90);
            this.pauseBtn.setPosition(width - 25, 42);
            this.pauseIcon.setPosition(width - 25, 42);
        } else {
            this.heroDockBg.setPosition(110, 42);
            this.timerBg.setPosition(width / 2, 42);
            this.timerIcon.setPosition(width / 2 - 40, 42);
            this.timerText.setPosition(width / 2 + 10, 42);

            this.statsPillBg.setPosition(width - 150, 42);
            this.killsIcon.setPosition(width - 215, 42);
            this.killsText.setPosition(width - 198, 42);
            this.goldIcon.setPosition(width - 145, 42);
            this.goldText.setPosition(width - 128, 42);

            this.pauseBtn.setPosition(width - 35, 42);
            this.pauseIcon.setPosition(width - 35, 42);
        }

        this.lowHpVignette.setPosition(width / 2, height / 2).setSize(width, height);
        this.bossBarBg.setPosition(width / 2, 85);
        this.bossBarFill.setPosition(width / 2 - 185, 85);
        this.bossNameText.setPosition(width / 2, 70);
    }

    updateInventoryHUD() {
        this.inventoryGroup.clear(true, true);
        if (!this.player) return;

        const romanLevels = ['I', 'II', 'III', 'IV', 'V'];
        const startX = 26;
        const wepY = 82;
        const pasY = 118;
        const slotSize = 32;
        const maxSlots = 4;

        // 1. РЯД ОРУЖИЯ (Верхний ряд)
        const weaponEntries = Object.entries(this.player.weapons);
        for (let i = 0; i < maxSlots; i++) {
            const sx = startX + (i * 38);
            const slotBg = this.add.rectangle(sx, wepY, slotSize, slotSize, 0x0b1120, 0.9).setScrollFactor(0).setDepth(100);
            slotBg.setStrokeStyle(1, 0x1e293b);
            this.inventoryGroup.add(slotBg);

            if (i < weaponEntries.length) {
                const [wId, lvl] = weaponEntries[i];
                const config = CONFIG.WEAPONS[wId];
                if (config) {
                    slotBg.setStrokeStyle(1.5, 0x0284c7);
                    const icon = this.add.image(sx, wepY, config.icon).setScale(0.6).setScrollFactor(0).setDepth(101);
                    const lvlBadge = this.add.text(sx + 6, wepY + 6, romanLevels[lvl - 1] || `${lvl}`, {
                        fontFamily: "'Rajdhani', monospace", fontSize: '11px', fontStyle: 'bold', color: '#38bdf8'
                    }).setScrollFactor(0).setDepth(102);
                    this.inventoryGroup.add(icon);
                    this.inventoryGroup.add(lvlBadge);
                }
            }
        }

        // Супер оружия (Эволюции)
        this.player.superWeapons.forEach((supId, sIdx) => {
            const sx = startX + (sIdx * 38);
            const config = CONFIG.SUPER_WEAPONS[supId];
            if (config) {
                const evoBg = this.add.rectangle(sx, wepY, slotSize + 2, slotSize + 2, 0x1e1b4b, 0.95).setScrollFactor(0).setDepth(102);
                evoBg.setStrokeStyle(2, 0xffd166);
                const icon = this.add.image(sx, wepY, config.icon).setScale(0.65).setTint(0xffd166).setScrollFactor(0).setDepth(103);
                this.inventoryGroup.add(evoBg);
                this.inventoryGroup.add(icon);
            }
        });

        // 2. РЯД ПАССИВОК (Нижний ряд)
        const passiveEntries = Object.entries(this.player.passives);
        for (let i = 0; i < maxSlots; i++) {
            const sx = startX + (i * 38);
            const slotBg = this.add.rectangle(sx, pasY, slotSize, slotSize, 0x0b1120, 0.9).setScrollFactor(0).setDepth(100);
            slotBg.setStrokeStyle(1, 0x1e293b);
            this.inventoryGroup.add(slotBg);

            if (i < passiveEntries.length) {
                const [pId, lvl] = passiveEntries[i];
                const config = CONFIG.PASSIVES[pId];
                if (config) {
                    slotBg.setStrokeStyle(1.5, 0x10b981);
                    const icon = this.add.image(sx, pasY, config.icon).setScale(0.55).setScrollFactor(0).setDepth(101);
                    const lvlBadge = this.add.text(sx + 6, pasY + 6, romanLevels[lvl - 1] || `${lvl}`, {
                        fontFamily: "'Rajdhani', monospace", fontSize: '11px', fontStyle: 'bold', color: '#34d399'
                    }).setScrollFactor(0).setDepth(102);
                    this.inventoryGroup.add(icon);
                    this.inventoryGroup.add(lvlBadge);
                }
            }
        }
    }

    update(time, delta) {
        if (!this.gameActive || !this.player.active) return;

        this.gameTimeSec += delta / 1000;

        // Обновление таймера 10 минут
        const remainingSec = Math.max(0, CONFIG.GAME.GAME_DURATION_SEC - Math.floor(this.gameTimeSec));
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

        // Обновление полосы опыта
        const xpRatio = Math.min(1.0, this.player.xp / this.player.nextLevelXp);
        this.xpBarFill.width = this.scale.width * xpRatio;
        this.lvlText.setText(`LVL ${this.player.level}`);

        // Обновление полосы здоровья героя в HUD
        if (this.playerHpFill && this.playerHpText) {
            const hpRatio = Math.max(0, Math.min(1.0, this.player.hp / this.player.stats.maxHp));
            this.playerHpFill.width = 140 * hpRatio;
            this.playerHpText.setText(`${Math.ceil(this.player.hp)} / ${this.player.stats.maxHp}`);
        }

        // Обновление киллов и золота
        if (this.killsText) this.killsText.setText(`${this.player.kills || 0}`);
        if (this.goldText) this.goldText.setText(`${this.player.goldCollected || 0}`);

        // Эффект критически низкого здоровья (Heartbeat & Red Vignette < 25% HP)
        if (this.player.hp / this.player.stats.maxHp <= 0.25) {
            this.heartbeatTimer = (this.heartbeatTimer || 0) + delta;
            this.lowHpVignette.alpha = 0.22 + Math.sin(time / 180) * 0.16;
            if (this.heartbeatTimer >= 680) {
                this.heartbeatTimer = 0;
                window.Sound.playHeartbeat();
                if (navigator.vibrate) navigator.vibrate(25);
            }
        } else if (this.lowHpVignette && this.lowHpVignette.alpha > 0) {
            this.lowHpVignette.alpha = 0;
        }

        // Обновление систем
        this.player.update(time, delta);
        this.weaponSystem.update(time, delta);
        this.waveSpawner.update(time, delta);
        this.poolManager.updateAll(time, delta, this.player);

        // Проверка прогресса квестов по времени
        QuestManager.checkProgress(this, 'time', Math.floor(this.gameTimeSec));

        // Обновление стрелок-указателей на боссов и сундуки
        this.updateOffscreenIndicators();

        // Обновление полоски босса
        if (this.currentBoss && this.currentBoss.active) {
            const bossHpPercent = Math.max(0, this.currentBoss.hp / this.currentBoss.maxHp);
            this.bossBarFill.width = 390 * bossHpPercent;
        } else if (this.bossBarBg.visible) {
            this.bossBarBg.setVisible(false);
            this.bossBarFill.setVisible(false);
            this.bossNameText.setVisible(false);
            this.currentBoss = null;
        }
    }

    triggerHitstop(durationMs = 45) {
        if (this.isHitstopActive) return;
        this.isHitstopActive = true;
        this.physics.world.timeScale = 0.05;
        this.time.delayedCall(durationMs, () => {
            this.physics.world.timeScale = 1.0;
            this.isHitstopActive = false;
        });
    }

    // --- БОЕВАЯ МАТЕМАТИКА ---
    damageArea(x, y, radius, damage, isCrit = false, isPoison = false, knockback = 0) {
        this.poolManager.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active) {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist <= radius) {
                    const angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
                    enemy.takeDamage(damage, isCrit, knockback, angle);
                }
            }
        });
    }

    damageCone(x, y, radius, centerAngle, damage, critChance = 0.05, knockback = 0, arcAngle = Math.PI * 0.5) {
        this.poolManager.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active) {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist <= radius) {
                    const angle = Phaser.Math.Angle.Between(x, y, enemy.x, enemy.y);
                    let diff = Math.abs(Phaser.Math.Angle.Wrap(angle - centerAngle));
                    if (diff <= arcAngle) {
                        const isCrit = Math.random() < critChance;
                        enemy.takeDamage(damage, isCrit, knockback, centerAngle);
                    }
                }
            }
        });
    }

    getClosestEnemy(x, y, exclude = null) {
        let closest = null;
        let minDist = Infinity;
        this.poolManager.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active && enemy !== exclude) {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist < minDist) {
                    minDist = dist;
                    closest = enemy;
                }
            }
        });
        return closest;
    }

    getClosestEnemies(x, y, count = 1, maxDist = 600) {
        const enemies = [];
        this.poolManager.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active) {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist <= maxDist) {
                    enemies.push({ enemy, dist });
                }
            }
        });
        enemies.sort((a, b) => a.dist - b.dist);
        return enemies.slice(0, count).map(e => e.enemy);
    }

    getRandomEnemies(x, y, count = 1, maxDist = 600) {
        const list = [];
        this.poolManager.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active) {
                const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
                if (dist <= maxDist) list.push(enemy);
            }
        });
        Phaser.Utils.Array.Shuffle(list);
        return list.slice(0, count);
    }

    getRandomEnemy(x, y, maxDist = 600) {
        const enemies = this.getRandomEnemies(x, y, 1, maxDist);
        return enemies.length > 0 ? enemies[0] : null;
    }

    showDamageText(x, y, amount, isCrit = false) {
        const color = isCrit ? '#ffd166' : '#ffffff';
        const size = isCrit ? '24px' : '15px';
        const stroke = isCrit ? '#7f1d1d' : '#000000';
        const strokeThick = isCrit ? 5 : 3;
        const textVal = isCrit ? `КРИТ ${amount}!` : `${amount}`;

        const txt = this.add.text(x, y, textVal, {
            fontFamily: 'sans-serif',
            fontSize: size,
            fontStyle: 'bold',
            color: color,
            stroke: stroke,
            strokeThickness: strokeThick
        }).setOrigin(0.5).setDepth(35);

        this.tweens.add({
            targets: txt,
            y: y - (isCrit ? 50 : 30),
            alpha: 0,
            scale: isCrit ? 1.45 : 1.0,
            duration: isCrit ? 650 : 450,
            ease: isCrit ? 'Back.easeOut' : 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });
    }

    showFloatingText(x, y, message, color = 0x00f5d4) {
        const txt = this.add.text(x, y, message, {
            fontFamily: 'sans-serif',
            fontSize: '18px',
            fontStyle: 'bold',
            color: '#' + color.toString(16).padStart(6, '0'),
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: txt,
            y: y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => txt.destroy()
        });
    }

    spawnEnemyBullet(x, y, angle, damage) {
        if (this.poolManager) {
            return this.poolManager.spawnEnemyBullet(x, y, angle, damage);
        }
    }

    attractAllGems() {
        this.poolManager.dropGroup.children.iterate((drop) => {
            if (drop && drop.active) {
                drop.attracted = true;
            }
        });
    }

    openChest(isEvolution = 0) {
        this.scene.pause();
        this.scene.launch('UpgradeScene', { player: this.player, isChest: true, forceEvolution: isEvolution === 1, sceneKey: 'GameScene' });
        this.scene.bringToTop('UpgradeScene');
    }

    showLevelUpOverlay(player) {
        this.scene.pause();
        this.scene.launch('UpgradeScene', { player: player, sceneKey: 'GameScene' });
        this.scene.bringToTop('UpgradeScene');
    }

    onEnemyKilled(enemy) {
        this.kills++;
        this.killsText.setText(`${this.kills}`);
        this.player.kills++;

        QuestManager.checkProgress(this, 'kills', 1);

        if (enemy.isBoss) {
            QuestManager.checkProgress(this, 'boss', 1);

            let remainingBoss = null;
            this.poolManager.enemyGroup.children.iterate((e) => {
                if (e && e.active && e.isBoss && e !== enemy) {
                    remainingBoss = e;
                }
            });

            if (remainingBoss) {
                this.setCurrentBoss(remainingBoss);
            } else {
                this.currentBoss = null;
                this.bossBarBg.setVisible(false);
                this.bossBarFill.setVisible(false);
                this.bossNameText.setVisible(false);

                // Возврат к боевой музыке только если больше нет боссов
                this.time.delayedCall(1200, () => {
                    if (this.gameActive && !this.currentBoss) {
                        window.Sound.playBattleBGM();
                    }
                });
            }
        }

        const isFinalBoss = enemy.isBoss && CONFIG.BOSSES[enemy.enemyType] && CONFIG.BOSSES[enemy.enemyType].isFinal;
        if (isFinalBoss) {
            // ПОБЕДА НАД ФИНАЛЬНЫМ БОССОМ КАРТЫ!
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', {
                    isVictory: true,
                    timeSec: Math.floor(this.gameTimeSec),
                    kills: this.kills,
                    gold: this.goldEarned,
                    level: this.player.level,
                    heroId: this.selectedHeroId,
                    mapId: this.selectedMapId
                });
            });
        }
    }

    updateGoldHUD() {
        this.goldEarned = this.player.goldCollected;
        this.goldText.setText(`${this.goldEarned}`);
    }

    setCurrentBoss(boss) {
        this.currentBoss = boss;
        const config = CONFIG.BOSSES[boss.enemyType];
        this.bossNameText.setText(config ? config.name : 'БОСС');
        this.bossBarBg.setVisible(true);
        this.bossBarFill.setVisible(true);
        this.bossNameText.setVisible(true);

        // Включение эпической музыки босса
        window.Sound.playBossBGM();
    }

    showBossAlert(bossId) {
        const { width, height } = this.scale;
        const alertBg = this.add.rectangle(width / 2, height / 2 - 100, width, 60, 0xef4444, 0.7).setScrollFactor(0);
        const alertTxt = this.add.text(width / 2, height / 2 - 100, 'ВНИМАНИЕ: ПРИБЛИЖАЕТСЯ БОСС!', {
            fontFamily: 'sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5);

        this.tweens.add({
            targets: [alertBg, alertTxt],
            alpha: 0,
            duration: 2500,
            onComplete: () => {
                alertBg.destroy();
                alertTxt.destroy();
            }
        });
    }

    showTsunamiAlert(index, title, subtitle, color = 0x00f5d4) {
        const { width, height } = this.scale;
        
        // Полноэкранный импульс волны
        const waveFlash = this.add.rectangle(width / 2, height / 2, width, height, color, 0.25).setScrollFactor(0);
        this.tweens.add({
            targets: waveFlash,
            alpha: 0,
            duration: 900,
            onComplete: () => waveFlash.destroy()
        });

        // Главный баннер цунами
        const banner = this.add.rectangle(width / 2, height / 2 - 80, width, 84, 0x0f172a, 0.92).setScrollFactor(0);
        banner.setStrokeStyle(3, color);

        const titleText = this.add.text(width / 2, height / 2 - 95, title, {
            fontFamily: 'sans-serif',
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#' + color.toString(16).padStart(6, '0'),
            stroke: '#000000',
            strokeThickness: 5
        }).setScrollFactor(0).setOrigin(0.5);

        const subText = this.add.text(width / 2, height / 2 - 65, subtitle, {
            fontFamily: 'sans-serif',
            fontSize: '15px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5);

        // Пульсация и затухание
        this.tweens.add({
            targets: [banner, titleText, subText],
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 350,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                this.tweens.add({
                    targets: [banner, titleText, subText],
                    alpha: 0,
                    duration: 600,
                    onComplete: () => {
                        banner.destroy();
                        titleText.destroy();
                        subText.destroy();
                    }
                });
            }
        });
    }

    showRedMinuteWarning() {
        const { width, height } = this.scale;
        const alertBg = this.add.rectangle(width / 2, height / 2, width, height, 0xd90429, 0.35).setScrollFactor(0);
        const alertTxt = this.add.text(width / 2, height / 2, 'КРАСНАЯ МИНУТА: ВЫЖИВАЙ!', {
            fontFamily: 'sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setScrollFactor(0).setOrigin(0.5);

        this.tweens.add({
            targets: alertTxt,
            scale: 1.3,
            duration: 300,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                alertTxt.destroy();
                this.tweens.add({ targets: alertBg, alpha: 0.15, duration: 1000 });
            }
        });
    }

    createBarrels(w, h) {
        this.barrelGroup = this.physics.add.staticGroup();
        for (let i = 0; i < 40; i++) {
            const bx = Phaser.Math.Between(200, w - 200);
            const by = Phaser.Math.Between(200, h - 200);
            const barrel = this.barrelGroup.create(bx, by, 'prop_barrel');
            barrel.setDepth(6);
            barrel.body.setCircle(14, 2, 4);
        }
    }

    breakBarrel(barrel) {
        if (!barrel.active) return;
        barrel.setActive(false);
        barrel.setVisible(false);
        barrel.disableBody(true, true);

        // Звук и частицы щепок
        window.Sound.playHit();
        for (let i = 0; i < 6; i++) {
            const chip = this.add.rectangle(barrel.x + (Math.random() - 0.5) * 16, barrel.y + (Math.random() - 0.5) * 16, 4, 4, 0x8b5a2b);
            this.tweens.add({
                targets: chip,
                x: chip.x + (Math.random() - 0.5) * 60,
                y: chip.y + (Math.random() - 0.5) * 60,
                alpha: 0,
                duration: 350,
                onComplete: () => chip.destroy()
            });
        }

        // Лут из бочки: монеты, зелья, магнит, заморозка, святая бомба, зелье ярости
        const roll = Math.random();
        if (roll < 0.45) {
            this.dropPool.spawnDrop(barrel.x, barrel.y, 'coin', 15);
        } else if (roll < 0.65) {
            this.dropPool.spawnDrop(barrel.x, barrel.y, 'potion', 30);
        } else if (roll < 0.78) {
            this.dropPool.spawnDrop(barrel.x, barrel.y, 'magnet', 0);
        } else if (roll < 0.86) {
            this.dropPool.spawnDrop(barrel.x, barrel.y, 'powerup_freeze', 0);
        } else if (roll < 0.93) {
            this.dropPool.spawnDrop(barrel.x, barrel.y, 'powerup_bomb', 0);
        } else if (roll < 0.97) {
            this.dropPool.spawnDrop(barrel.x, barrel.y, 'powerup_rage', 0);
        } else {
            this.dropPool.spawnDrop(barrel.x, barrel.y, 'gem_large', 10);
        }
    }

    openPause() {
        if (!this.gameActive) return;
        this.scene.pause();
        this.scene.launch('PauseScene', { player: this.player, sceneKey: 'GameScene' });
        this.scene.bringToTop('PauseScene');
    }

    updateOffscreenIndicators() {
        this.indicatorGraphics.clear();
        this.indicatorTexts.forEach(t => t.destroy());
        this.indicatorTexts = [];

        const cam = this.cameras.main;
        const viewRect = new Phaser.Geom.Rectangle(cam.scrollX, cam.scrollY, cam.width, cam.height);

        // 1. Индикатор Босса
        if (this.currentBoss && this.currentBoss.active) {
            if (!Phaser.Geom.Rectangle.Contains(viewRect, this.currentBoss.x, this.currentBoss.y)) {
                this.drawPointer(this.currentBoss.x, this.currentBoss.y, 'ui_boss_skull', 0xef4444);
            }
        }

        // 2. Индикатор Сундуков
        this.poolManager.dropGroup.children.iterate((item) => {
            if (item && item.active && (item.itemType === 'pickup_chest' || item.itemType === 'chest')) {
                if (!Phaser.Geom.Rectangle.Contains(viewRect, item.x, item.y)) {
                    this.drawPointer(item.x, item.y, 'ui_chest', 0xffd166);
                }
            }
        });
    }

    drawPointer(targetX, targetY, iconKey, color) {
        const cam = this.cameras.main;
        const centerX = cam.scrollX + cam.width / 2;
        const centerY = cam.scrollY + cam.height / 2;
        const angle = Phaser.Math.Angle.Between(centerX, centerY, targetX, targetY);

        const edgeX = Phaser.Math.Clamp(cam.width / 2 + Math.cos(angle) * (cam.width / 2 - 50), 50, cam.width - 50);
        const edgeY = Phaser.Math.Clamp(cam.height / 2 + Math.sin(angle) * (cam.height / 2 - 50), 50, cam.height - 50);

        this.indicatorGraphics.fillStyle(color, 0.85);
        this.indicatorGraphics.fillCircle(edgeX, edgeY, 18);
        this.indicatorGraphics.lineStyle(2, 0xffffff, 0.9);
        this.indicatorGraphics.strokeCircle(edgeX, edgeY, 18);

        const iconSprite = this.add.image(edgeX, edgeY - 4, iconKey).setScrollFactor(0).setScale(0.8).setDepth(91);
        const dist = Math.round(Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY) / 10);
        const t = this.add.text(edgeX, edgeY + 10, `${dist}m`, {
            fontFamily: 'sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 2
        }).setScrollFactor(0).setOrigin(0.5).setDepth(91);

        this.indicatorTexts.push(iconSprite);
        this.indicatorTexts.push(t);
    }

    onPlayerDied(player) {
        if (!this.gameActive) return;
        this.gameActive = false;

        // 1. Полная заморозка физического мира (время останавливается)
        this.physics.pause();
        if (window.Sound) {
            window.Sound.stopBGM();
            window.Sound.playDeath();
        }

        // 2. Яркая вспышка белого света
        this.cameras.main.flash(500, 255, 255, 255);

        // 3. Тряска экрана и кинематографичный зум на павшего героя
        this.cameras.main.shake(500, 0.025);
        this.cameras.main.zoomTo(1.25, 900, 'Sine.easeOut');

        // 4. Тёмно-красная виньетка смерти
        const deathVignette = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x880000, 0)
            .setScrollFactor(0)
            .setDepth(200);
        this.tweens.add({
            targets: deathVignette,
            fillAlpha: 0.45,
            duration: 700,
            ease: 'Power2'
        });

        // 5. Анимация падения и растворения героя
        player.setTint(0x555555);
        this.tweens.add({
            targets: player,
            rotation: (player.flipX ? -1 : 1) * Math.PI * 0.45,
            alpha: 0.6,
            duration: 600,
            ease: 'Back.easeIn'
        });

        // 6. Затухание экрана и плавный переход в меню GameOver
        this.time.delayedCall(1300, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('GameOverScene', {
                    isVictory: false,
                    timeSec: Math.floor(this.gameTimeSec),
                    kills: this.kills,
                    gold: this.goldEarned,
                    level: this.player.level,
                    heroId: this.selectedHeroId,
                    mapId: this.selectedMapId
                });
            });
        });
    }

    setupMobileJoystick() {
        const zone = document.getElementById('joystick-zone');
        const knob = document.getElementById('joystick-knob');
        const base = document.getElementById('joystick-base');
        if (!zone || !knob || !base) return;

        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            zone.style.display = 'block';
            let startX = 0, startY = 0;
            const maxRadius = 45;

            zone.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                // Динамическое появление джойстика под пальцем
                startX = touch.clientX;
                startY = touch.clientY;
                base.style.left = `${startX}px`;
                base.style.top = `${startY}px`;
                base.style.transform = 'translate(-50%, -50%)';
            }, { passive: false });

            zone.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const dx = touch.clientX - startX;
                const dy = touch.clientY - startY;
                const dist = Math.min(maxRadius, Math.sqrt(dx * dx + dy * dy));
                const angle = Math.atan2(dy, dx);

                const knobX = Math.cos(angle) * dist;
                const knobY = Math.sin(angle) * dist;
                knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

                this.joystickVector = {
                    x: knobX / maxRadius,
                    y: knobY / maxRadius
                };
            }, { passive: false });

            const resetJoy = () => {
                knob.style.transform = 'translate(0px, 0px)';
                this.joystickVector = { x: 0, y: 0 };
            };

            zone.addEventListener('touchend', resetJoy);
            zone.addEventListener('touchcancel', resetJoy);
        }
    }
}

window.GameScene = GameScene;
