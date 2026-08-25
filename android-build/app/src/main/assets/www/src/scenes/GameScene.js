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

        // Камера с улучшенным обзором на смартфонах
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        const { width, height } = this.scale;
        const isPortrait = height > width;
        this.cameras.main.setZoom(isPortrait ? 0.92 : 1.0);
        this.cameras.main.setFollowOffset(0, isPortrait ? 40 : 0);
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

        // Скрытие джойстика при открытии модальных окон паузы / выбора улучшений
        this.events.on('pause', () => {
            const zone = document.getElementById('joystick-zone');
            if (zone) zone.style.display = 'none';
        });

        this.events.on('resume', () => {
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
            const zone = document.getElementById('joystick-zone');
            if (zone && isTouch) zone.style.display = 'block';
        });

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
        const width = gameSize.width;
        const height = gameSize.height;
        this.cameras.main.setSize(width, height);

        const isPortrait = height > width;
        if (document.body) {
            document.body.classList.toggle('is-portrait', isPortrait);
            document.body.classList.toggle('is-landscape', !isPortrait);
        }

        // Автоматическая оптимизация обзора и угла камеры
        this.cameras.main.setZoom(isPortrait ? 0.92 : 1.0);
        this.cameras.main.setFollowOffset(0, isPortrait ? 40 : 0);

        if (typeof this.layoutHUD === 'function') {
            this.layoutHUD(width, height);
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
        const isNarrow = width < 680;

        // 1. Полоса опыта (EXP BAR) на самом верху экрана
        this.xpBarBg = this.add.rectangle(width / 2, 5, width, 10, 0x090d16).setScrollFactor(0).setDepth(100);
        this.xpBarFill = this.add.rectangle(0, 5, 0, 8, 0x10b981).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101);

        // 2. Док героя и здоровья (Слева сверху)
        this.heroDockBg = this.add.rectangle(110, 38, 200, 44, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100);
        this.heroDockBg.setStrokeStyle(1.5, 0x334155);

        const heroId = this.heroId || (this.player ? this.player.heroId : 'knight');
        this.heroPortrait = this.add.image(26, 38, `hero_${heroId}`).setDisplaySize(34, 34).setScrollFactor(0).setDepth(102);

        this.lvlText = this.add.text(50, 24, 'LVL 1', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#ffd166'
        }).setScrollFactor(0).setDepth(102);

        // Полоса здоровья героя
        this.playerHpBg = this.add.rectangle(120, 42, 130, 12, 0x1e1b4b).setScrollFactor(0).setDepth(101);
        this.playerHpFill = this.add.rectangle(55, 42, 130, 10, 0xef4444).setScrollFactor(0).setOrigin(0, 0.5).setDepth(102);
        this.playerHpText = this.add.text(120, 42, '120 / 120', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '10px', fontStyle: 'bold', color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(103);

        // 3. Таймер по центру
        this.timerBg = this.add.rectangle(width / 2, 38, 130, 36, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100);
        this.timerBg.setStrokeStyle(1.5, 0x38bdf8);
        this.timerIcon = this.add.image(width / 2 - 40, 38, 'ui_clock').setScrollFactor(0).setScale(0.8).setDepth(101);
        this.timerText = this.add.text(width / 2 + 10, 38, '10:00', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(101);

        // 4. Блок убийств и золота
        this.statsPillBg = this.add.rectangle(width - 150, 38, 160, 36, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100);
        this.statsPillBg.setStrokeStyle(1.5, 0x334155);

        this.killsIcon = this.add.image(width - 210, 38, 'ui_skull').setScrollFactor(0).setScale(0.8).setDepth(101);
        this.killsText = this.add.text(width - 194, 38, '0', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '15px', fontStyle: 'bold', color: '#f87171'
        }).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101);

        this.goldIcon = this.add.image(width - 140, 38, 'ui_coin').setScrollFactor(0).setScale(0.8).setDepth(101);
        this.goldText = this.add.text(width - 124, 38, '0', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '15px', fontStyle: 'bold', color: '#ffd166'
        }).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101);

        // Кнопка Паузы
        this.pauseBtn = this.add.image(width - 35, 38, 'btn_close_circle').setScrollFactor(0).setDisplaySize(32, 32).setInteractive({ useHandCursor: true }).setDepth(101);
        this.pauseIcon = this.add.image(width - 35, 38, 'ui_pause').setScrollFactor(0).setDisplaySize(24, 24).setDepth(102);
        this.pauseBtn.on('pointerdown', () => this.openPause());

        // Виньетка критически низкого здоровья (<25% HP)
        this.lowHpVignette = this.add.rectangle(width / 2, height / 2, width, height, 0x880000, 0)
            .setScrollFactor(0)
            .setDepth(85);

        // Контейнер для иконок инвентаря
        this.inventoryGroup = this.add.group();

        // Полоса здоровья босса (скрыта по умолчанию)
        this.bossBarBg = this.add.rectangle(width / 2, 85, 380, 16, 0x0b1120, 0.95).setScrollFactor(0).setDepth(100).setVisible(false);
        this.bossBarBg.setStrokeStyle(1.5, 0xef4444);
        this.bossBarFill = this.add.rectangle(width / 2 - 185, 85, 370, 12, 0xef4444).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101).setVisible(false);
        this.bossNameText = this.add.text(width / 2, 70, '', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '14px', fontStyle: 'bold', color: '#ffd166'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(101).setVisible(false);

        this.layoutHUD(width, height);
    }

    layoutHUD(width, height) {
        if (!this.xpBarBg) return;

        this.xpBarBg.setPosition(width / 2, 5).setSize(width, 10);
        if (this.player) {
            const xpRatio = Math.min(1.0, this.player.xp / this.player.nextLevelXp);
            this.xpBarFill.setPosition(0, 5).setSize(width * xpRatio, 8);
        }

        const isPortrait = height > width;
        const isNarrow = width < 680;

        if (isPortrait || isNarrow) {
            // === МОБИЛЬНЫЙ / ПОРТРЕТНЫЙ 2-РЯДНЫЙ HUD ===
            const dockW = Math.min(width - 70, 190);
            this.heroDockBg.setPosition(dockW / 2 + 10, 30).setSize(dockW, 34);
            this.heroPortrait.setPosition(24, 30).setDisplaySize(26, 26);
            this.lvlText.setPosition(42, 20).setFontSize('10px');
            
            const hpW = dockW - 52;
            this.playerHpBg.setPosition(42 + hpW / 2, 34).setSize(hpW, 10);
            this.playerHpFill.setPosition(42, 34);
            this.playerHpText.setPosition(42 + hpW / 2, 34).setFontSize('9px');

            this.pauseBtn.setPosition(width - 24, 30).setDisplaySize(28, 28);
            this.pauseIcon.setPosition(width - 24, 30).setDisplaySize(20, 20);

            // Второй ряд: Объединенная плашка (Таймер + Убийства + Золото)
            const pillW = Math.min(width - 20, 280);
            const pillY = 58;
            this.timerBg.setPosition(width / 2, pillY).setSize(pillW, 24).setStrokeStyle(1, 0x38bdf8);
            this.timerIcon.setPosition(width / 2 - pillW / 2 + 16, pillY).setScale(0.55);
            this.timerText.setPosition(width / 2 - pillW / 2 + 50, pillY).setFontSize('13px');

            this.statsPillBg.setVisible(false);
            this.killsIcon.setPosition(width / 2 - 8, pillY).setScale(0.6);
            this.killsText.setPosition(width / 2 + 8, pillY).setFontSize('12px');

            this.goldIcon.setPosition(width / 2 + pillW / 2 - 50, pillY).setScale(0.6);
            this.goldText.setPosition(width / 2 + pillW / 2 - 34, pillY).setFontSize('12px');

            this.inventoryStartY = 82;
        } else {
            // === ДЕСКТОПНЫЙ / ШИРОКИЙ ГОРИЗОНТАЛЬНЫЙ HUD ===
            this.heroDockBg.setPosition(110, 38).setSize(200, 44);
            this.heroPortrait.setPosition(26, 38).setDisplaySize(34, 34);
            this.lvlText.setPosition(50, 24).setFontSize('12px');

            this.playerHpBg.setPosition(120, 42).setSize(130, 12);
            this.playerHpFill.setPosition(55, 42);
            this.playerHpText.setPosition(120, 42).setFontSize('10px');

            this.timerBg.setPosition(width / 2, 38).setSize(130, 36).setStrokeStyle(1.5, 0x38bdf8);
            this.timerIcon.setPosition(width / 2 - 40, 38).setScale(0.8);
            this.timerText.setPosition(width / 2 + 10, 38).setFontSize('20px');

            this.statsPillBg.setVisible(true).setPosition(width - 150, 38).setSize(160, 36);
            this.killsIcon.setPosition(width - 210, 38).setScale(0.8);
            this.killsText.setPosition(width - 194, 38).setFontSize('15px');
            this.goldIcon.setPosition(width - 140, 38).setScale(0.8);
            this.goldText.setPosition(width - 124, 38).setFontSize('15px');

            this.pauseBtn.setPosition(width - 35, 38).setDisplaySize(32, 32);
            this.pauseIcon.setPosition(width - 35, 38).setDisplaySize(24, 24);

            this.inventoryStartY = 70;
        }

        this.updateInventoryHUD();
        this.lowHpVignette.setPosition(width / 2, height / 2).setSize(width, height);
        this.bossBarBg.setPosition(width / 2, (isPortrait || isNarrow) ? 88 : 85);
        this.bossBarFill.setPosition(width / 2 - 185, (isPortrait || isNarrow) ? 88 : 85);
        this.bossNameText.setPosition(width / 2, (isPortrait || isNarrow) ? 74 : 70);
    }

    updateInventoryHUD() {
        this.inventoryGroup.clear(true, true);
        if (!this.player) return;

        const { width, height } = this.scale;
        const isPortrait = height > width;
        const isNarrow = width < 680;

        const romanLevels = ['I', 'II', 'III', 'IV', 'V'];
        const startX = (isNarrow || isPortrait) ? 16 : 24;
        const wepY = this.inventoryStartY ? this.inventoryStartY : ((isNarrow || isPortrait) ? 82 : 70);
        const pasY = wepY + ((isNarrow || isPortrait) ? 26 : 34);
        const slotSize = (isNarrow || isPortrait) ? 22 : 30;
        const slotSpacing = (isNarrow || isPortrait) ? 26 : 36;
        const maxSlots = 4;

        // 1. РЯД ОРУЖИЯ (Верхний ряд)
        const weaponEntries = Object.entries(this.player.weapons);
        for (let i = 0; i < maxSlots; i++) {
            const sx = startX + (i * slotSpacing);
            const slotBg = this.add.rectangle(sx, wepY, slotSize, slotSize, 0x0b1120, 0.9).setScrollFactor(0).setDepth(100);
            slotBg.setStrokeStyle(1, 0x1e293b);
            this.inventoryGroup.add(slotBg);

            if (i < weaponEntries.length) {
                const [wId, lvl] = weaponEntries[i];
                const config = CONFIG.WEAPONS[wId];
                if (config) {
                    slotBg.setStrokeStyle(1.5, 0x0284c7);
                    const icon = this.add.image(sx, wepY, config.icon).setScale((isNarrow || isPortrait) ? 0.42 : 0.58).setScrollFactor(0).setDepth(101);
                    const lvlBadge = this.add.text(sx + ((isNarrow || isPortrait) ? 3 : 6), wepY + ((isNarrow || isPortrait) ? 3 : 6), romanLevels[lvl - 1] || `${lvl}`, {
                        fontFamily: CONFIG.FONTS.MONO, fontSize: (isNarrow || isPortrait) ? '8px' : '11px', fontStyle: 'bold', color: '#38bdf8'
                    }).setScrollFactor(0).setDepth(102);
                    this.inventoryGroup.add(icon);
                    this.inventoryGroup.add(lvlBadge);
                }
            }
        }

        // Супер оружия (Эволюции)
        this.player.superWeapons.forEach((supId, sIdx) => {
            const sx = startX + (sIdx * slotSpacing);
            const config = CONFIG.SUPER_WEAPONS[supId];
            if (config) {
                const evoBg = this.add.rectangle(sx, wepY, slotSize + 2, slotSize + 2, 0x1e1b4b, 0.95).setScrollFactor(0).setDepth(102);
                evoBg.setStrokeStyle(2, 0xffd166);
                const icon = this.add.image(sx, wepY, config.icon).setScale((isNarrow || isPortrait) ? 0.46 : 0.62).setTint(0xffd166).setScrollFactor(0).setDepth(103);
                this.inventoryGroup.add(evoBg);
                this.inventoryGroup.add(icon);
            }
        });

        // 2. РЯД ПАССИВОК (Нижний ряд)
        const passiveEntries = Object.entries(this.player.passives);
        for (let i = 0; i < maxSlots; i++) {
            const sx = startX + (i * slotSpacing);
            const slotBg = this.add.rectangle(sx, pasY, slotSize, slotSize, 0x0b1120, 0.9).setScrollFactor(0).setDepth(100);
            slotBg.setStrokeStyle(1, 0x1e293b);
            this.inventoryGroup.add(slotBg);

            if (i < passiveEntries.length) {
                const [pId, lvl] = passiveEntries[i];
                const config = CONFIG.PASSIVES[pId];
                if (config) {
                    slotBg.setStrokeStyle(1.5, 0x10b981);
                    const icon = this.add.image(sx, pasY, config.icon).setScale((isNarrow || isPortrait) ? 0.4 : 0.52).setScrollFactor(0).setDepth(101);
                    const lvlBadge = this.add.text(sx + ((isNarrow || isPortrait) ? 3 : 6), pasY + ((isNarrow || isPortrait) ? 3 : 6), romanLevels[lvl - 1] || `${lvl}`, {
                        fontFamily: CONFIG.FONTS.MONO, fontSize: (isNarrow || isPortrait) ? '8px' : '11px', fontStyle: 'bold', color: '#34d399'
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
            const totalHpW = this.playerHpBg ? this.playerHpBg.width : 130;
            this.playerHpFill.width = totalHpW * hpRatio;
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
                        enemy.takeDamage(damage, isCrit, knockback, angle);
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
        const size = isCrit ? '22px' : '15px';
        const stroke = isCrit ? '#7f1d1d' : '#000000';
        const strokeThick = isCrit ? 5 : 3;
        const textVal = isCrit ? `КРИТ ${amount}!` : `${amount}`;

        if (isCrit) {
            // Золотой звездный взрыв при критическом ударе
            const starFlash = this.add.circle(x, y, 14, 0xffd166, 0.7).setDepth(34);
            this.tweens.add({
                targets: starFlash,
                radius: 32,
                alpha: 0,
                duration: 200,
                ease: 'Cubic.easeOut',
                onComplete: () => starFlash.destroy()
            });

            for (let i = 0; i < 5; i++) {
                const spk = this.add.circle(x, y, 3, i % 2 === 0 ? 0xffd166 : 0xff7b00).setDepth(34);
                const a = (i * Math.PI * 2) / 5 + (Math.random() - 0.5) * 0.4;
                const dist = 26 + Math.random() * 18;
                this.tweens.add({
                    targets: spk,
                    x: x + Math.cos(a) * dist,
                    y: y + Math.sin(a) * dist,
                    scale: 0.2,
                    alpha: 0,
                    duration: 260,
                    ease: 'Cubic.easeOut',
                    onComplete: () => spk.destroy()
                });
            }
        }

        const txt = this.add.text(x, y, textVal, {
            fontFamily: CONFIG.FONTS.MONO,
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
            fontFamily: CONFIG.FONTS.TITLE,
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
            fontFamily: CONFIG.FONTS.TITLE,
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
            fontFamily: CONFIG.FONTS.TITLE,
            fontSize: '24px',
            fontStyle: 'bold',
            color: '#' + color.toString(16).padStart(6, '0'),
            stroke: '#000000',
            strokeThickness: 5
        }).setScrollFactor(0).setOrigin(0.5);

        const subText = this.add.text(width / 2, height / 2 - 65, subtitle, {
            fontFamily: CONFIG.FONTS.UI,
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
            fontFamily: CONFIG.FONTS.TITLE,
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

        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
        
        const isPortrait = this.scale.height > this.scale.width;
        if (document.body) {
            document.body.classList.toggle('is-portrait', isPortrait);
            document.body.classList.toggle('is-landscape', !isPortrait);
        }

        if (isTouch) {
            zone.style.display = 'block';
        }

        const maxRadius = 45;
        let activeTouchId = null;

        const updateJoystickFromTouch = (touch) => {
            const rect = base.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = touch.clientX - centerX;
            const dy = touch.clientY - centerY;
            const dist = Math.min(maxRadius, Math.sqrt(dx * dx + dy * dy));
            const angle = Math.atan2(dy, dx);

            const knobX = Math.cos(angle) * dist;
            const knobY = Math.sin(angle) * dist;
            knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

            this.joystickVector = {
                x: knobX / maxRadius,
                y: knobY / maxRadius
            };
        };

        const onTouchStart = (e) => {
            e.preventDefault();
            if (activeTouchId === null) {
                const touch = e.changedTouches[0];
                activeTouchId = touch.identifier;
                updateJoystickFromTouch(touch);
            }
        };

        const onTouchMove = (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeTouchId) {
                    updateJoystickFromTouch(touch);
                    break;
                }
            }
        };

        const onTouchEnd = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === activeTouchId) {
                    activeTouchId = null;
                    knob.style.transform = 'translate(0px, 0px)';
                    this.joystickVector = { x: 0, y: 0 };
                    break;
                }
            }
        };

        zone.addEventListener('touchstart', onTouchStart, { passive: false });
        zone.addEventListener('touchmove', onTouchMove, { passive: false });
        zone.addEventListener('touchend', onTouchEnd, { passive: false });
        zone.addEventListener('touchcancel', onTouchEnd, { passive: false });

        // Очистка при завершении сцены
        const cleanupJoy = () => {
            zone.removeEventListener('touchstart', onTouchStart);
            zone.removeEventListener('touchmove', onTouchMove);
            zone.removeEventListener('touchend', onTouchEnd);
            zone.removeEventListener('touchcancel', onTouchEnd);
            zone.style.display = 'none';
            knob.style.transform = 'translate(0px, 0px)';
            this.joystickVector = { x: 0, y: 0 };
        };

        this.events.once('shutdown', cleanupJoy);
        this.events.once('destroy', cleanupJoy);
    }
}

window.GameScene = GameScene;
