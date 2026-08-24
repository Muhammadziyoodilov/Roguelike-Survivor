/**
 * Coop Game Scene - Полноценный Split-Screen режим на двоих!
 * Две независимые камеры, 2 виртуальных джойстика для мобильных,
 * индивидуальный HUD (HP, XP, инвентарь) и независимый Real-time Level Up без остановки игры!
 */
class CoopGameScene extends Phaser.Scene {
    constructor() {
        super('CoopGameScene');
    }

    init(data) {
        this.hero1Id = (data && (data.hero1 || data.hero1Id || data.heroId1)) ? (data.hero1 || data.hero1Id || data.heroId1) : 'knight';
        this.hero2Id = (data && (data.hero2 || data.hero2Id || data.heroId2)) ? (data.hero2 || data.hero2Id || data.heroId2) : 'archer';
        this.selectedMapId = (data && data.mapId) || window.SaveManager.data.selectedMap || 'dark_castle';
        this.mapConfig = (CONFIG.MAPS && CONFIG.MAPS[this.selectedMapId]) ? CONFIG.MAPS[this.selectedMapId] : CONFIG.MAPS.dark_castle;
        
        this.gameTimeSec = 0;
        this.kills = 0;
        this.goldEarned = 0;
        this.gameActive = true;
        this.currentBoss = null;
        this.isHitstopActive = false;

        // Векторы мобильных джойстиков
        this.joystickVector1 = { x: 0, y: 0 };
        this.joystickVector2 = { x: 0, y: 0 };

        // Очередь левелапов
        this.p1LevelUpQueue = 0;
        this.p2LevelUpQueue = 0;
        this.isP1LevelingUp = false;
        this.isP2LevelingUp = false;
        this.p1LevelUpCards = [];
        this.p2LevelUpCards = [];
    }

    create() {
        const { WORLD_WIDTH, WORLD_HEIGHT } = CONFIG.GAME;
        const { width, height } = this.scale;

        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        // Группы для разделения объектов мира и HUD
        this.worldGroup = this.add.group();
        this.hudGroup = this.add.group();

        const floorKey = this.mapConfig.tileFloor || 'tile_floor_castle';
        const floorAltKey = this.mapConfig.tileFloorAlt || 'tile_floor_castle_alt';
        const wallKey = this.mapConfig.tileWall || 'tile_wall_castle';
        const obstacleKey = this.mapConfig.tileObstacle || 'tile_pillar_castle';
        const brazierKey = this.mapConfig.propBrazier || 'prop_brazier_castle';

        // 1. Тайлы пола и стен
        for (let x = 0; x < WORLD_WIDTH; x += 64) {
            for (let y = 0; y < WORLD_HEIGHT; y += 64) {
                if (x === 0 || y === 0 || x >= WORLD_WIDTH - 64 || y >= WORLD_HEIGHT - 64) {
                    const img = this.add.image(x + 32, y + 32, wallKey).setDepth(1);
                    this.worldGroup.add(img);
                } else {
                    const isAlt = ((x * 17 + y * 11) % 100) < 6;
                    const tileKey = isAlt ? floorAltKey : floorKey;
                    const img = this.add.image(x + 32, y + 32, tileKey).setDepth(1);
                    this.worldGroup.add(img);
                }
            }
        }

        // 2. Препятствия локации
        for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(160, WORLD_WIDTH - 160);
            const ry = Phaser.Math.Between(160, WORLD_HEIGHT - 160);
            const img = this.add.image(rx, ry, obstacleKey).setDepth(5);
            this.worldGroup.add(img);
        }
        for (let i = 0; i < 20; i++) {
            const bx = Phaser.Math.Between(140, WORLD_WIDTH - 140);
            const by = Phaser.Math.Between(140, WORLD_HEIGHT - 140);
            const prop = this.add.image(bx, by, brazierKey).setDepth(5);
            this.worldGroup.add(prop);
            this.tweens.add({
                targets: prop,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 300 + Math.random() * 250,
                yoyo: true,
                repeat: -1
            });
        }

        // Менеджер пулов объектов
        this.poolManager = new PoolManager(this);
        this.dropPool = this.poolManager;

        // Интерактивные бочки
        this.createBarrels(WORLD_WIDTH, WORLD_HEIGHT);

        // Игрок 1 (Слева: WASD / Джойстик 1)
        this.player1 = new Player(this, WORLD_WIDTH / 2 - 100, WORLD_HEIGHT / 2, this.hero1Id, 1);
        this.player = this.player1;
        
        // Игрок 2 (Справа: Стрелки / Джойстик 2)
        this.player2 = new Player(this, WORLD_WIDTH / 2 + 100, WORLD_HEIGHT / 2, this.hero2Id, 2);

        // Системы оружия для обоих игроков
        this.weaponSystem1 = new WeaponSystem(this, this.player1);
        this.weaponSystem2 = new WeaponSystem(this, this.player2);
        this.weaponSystem = this.weaponSystem1;

        this.waveSpawner = new WaveSpawner(this);
        this.revivalAltars = [];

        // Коллизии снарядов с врагами
        this.physics.add.overlap(this.poolManager.projectileGroup, this.poolManager.enemyGroup, (proj, enemy) => {
            if (proj.active && enemy.active) proj.onHitEnemy(enemy);
        });

        // Коллизии снарядов с бочками
        this.physics.add.overlap(this.poolManager.projectileGroup, this.barrelGroup, (proj, barrel) => {
            if (proj.active && barrel.active) this.breakBarrel(barrel);
        });

        // Урон игрокам от врагов
        this.physics.add.overlap([this.player1, this.player2], this.poolManager.enemyGroup, (player, enemy) => {
            if (player.active && enemy.active) player.takeDamage(enemy.damage);
        });

        // Урон игрокам от вражеских снарядов
        this.physics.add.overlap([this.player1, this.player2], this.poolManager.enemyBulletGroup, (player, bullet) => {
            if (player.active && bullet.active) {
                player.takeDamage(bullet.damage);
                bullet.expire();
            }
        });

        // Стрелки-указатели на боссов и сундуки
        this.indicatorGraphics = this.add.graphics().setScrollFactor(0).setDepth(90);
        this.hudGroup.add(this.indicatorGraphics);
        this.indicatorTexts = [];

        // 3. Настройка Split-Screen камер
        this.setupSplitScreenCameras(width, height);

        // 4. Создание раздельного HUD интерфейса
        this.createCoopHUD();

        // 5. Подключение мобильных джойстиков и проверка ориентации
        this.setupCoopTouchJoysticks();

        // 6. Горячие клавиши для быстрого выбора улучшений
        this.setupLevelUpHotkeys();

        // Обработка поворота экрана и ресайза
        const handleResize = (gameSize) => {
            this.layoutSplitScreen(gameSize.width, gameSize.height);
            this.checkMobileOrientation();
        };
        this.scale.on('resize', handleResize);
        this.boundOrientationHandler = () => this.checkMobileOrientation();
        window.addEventListener('orientationchange', this.boundOrientationHandler);
        window.addEventListener('resize', this.boundOrientationHandler);

        this.events.once('shutdown', () => this.cleanupScene());
        this.events.once('destroy', () => this.cleanupScene());

        // ESC для паузы
        this.input.keyboard.on('keydown-ESC', () => this.openPause());

        // Квест на игру в Co-op
        QuestManager.checkProgress(this, 'coop', 1);

        // Плавное появление экрана и боевая музыка
        this.cameras.main.fadeIn(600, 0, 0, 0);
        if (this.cam2) this.cam2.fadeIn(600, 0, 0, 0);
        window.Sound.playBattleBGM();

        // Эффект появления обоих героев
        this.createCoopSpawnEffect(this.player1.x, this.player1.y, 0x38bdf8);
        this.createCoopSpawnEffect(this.player2.x, this.player2.y, 0xa855f7);
    }

    setupSplitScreenCameras(width, height) {
        const { WORLD_WIDTH, WORLD_HEIGHT } = CONFIG.GAME;
        const halfW = Math.floor(width / 2);

        // Камера 1 (Игрок 1, Левая половина)
        this.cameras.main.setViewport(0, 0, halfW, height);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player1, true, 0.08, 0.08);

        // Камера 2 (Игрок 2, Правая половина)
        if (!this.cam2) {
            this.cam2 = this.cameras.add(halfW, 0, width - halfW, height);
        } else {
            this.cam2.setViewport(halfW, 0, width - halfW, height);
        }
        this.cam2.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cam2.startFollow(this.player2, true, 0.08, 0.08);

        // Камера 3 (HUD оверлей на весь экран)
        if (!this.hudCam) {
            this.hudCam = this.cameras.add(0, 0, width, height);
        } else {
            this.hudCam.setViewport(0, 0, width, height);
        }
        this.hudCam.setScroll(0, 0);

        this.applyCameraIgnores();
    }

    applyCameraIgnores() {
        if (!this.hudCam) return;

        // Мировые камеры 1 и 2 игнорируют все HUD элементы
        if (this.hudGroup) {
            const hudChildren = this.hudGroup.getChildren();
            if (hudChildren.length > 0) {
                this.cameras.main.ignore(hudChildren);
                if (this.cam2) this.cam2.ignore(hudChildren);
            }
        }

        // HUD камера игнорирует мировые элементы
        if (this.worldGroup) {
            const worldChildren = this.worldGroup.getChildren();
            if (worldChildren.length > 0) this.hudCam.ignore(worldChildren);
        }
        if (this.barrelGroup) {
            const barrelChildren = this.barrelGroup.getChildren();
            if (barrelChildren.length > 0) this.hudCam.ignore(barrelChildren);
        }
        if (this.poolManager) {
            const enemies = this.poolManager.enemyGroup ? this.poolManager.enemyGroup.getChildren() : [];
            const projectiles = this.poolManager.projectileGroup ? this.poolManager.projectileGroup.getChildren() : [];
            const enemyBullets = this.poolManager.enemyBulletGroup ? this.poolManager.enemyBulletGroup.getChildren() : [];
            const drops = this.poolManager.dropGroup ? this.poolManager.dropGroup.getChildren() : [];

            if (enemies.length > 0) this.hudCam.ignore(enemies);
            if (projectiles.length > 0) this.hudCam.ignore(projectiles);
            if (enemyBullets.length > 0) this.hudCam.ignore(enemyBullets);
            if (drops.length > 0) this.hudCam.ignore(drops);
        }
        if (this.player1) {
            this.hudCam.ignore(this.player1);
            if (this.player1.shadow) this.hudCam.ignore(this.player1.shadow);
            if (this.player1.hpBarBg) this.hudCam.ignore(this.player1.hpBarBg);
            if (this.player1.hpBarFill) this.hudCam.ignore(this.player1.hpBarFill);
        }
        if (this.player2) {
            this.hudCam.ignore(this.player2);
            if (this.player2.shadow) this.hudCam.ignore(this.player2.shadow);
            if (this.player2.hpBarBg) this.hudCam.ignore(this.player2.hpBarBg);
            if (this.player2.hpBarFill) this.hudCam.ignore(this.player2.hpBarFill);
        }
    }

    createCoopHUD() {
        const { width, height } = this.scale;
        const halfW = Math.floor(width / 2);
        const lang = window.SaveManager.data.lang || 'ru';
        const h1 = CONFIG.HEROES[this.hero1Id] || CONFIG.HEROES.knight;
        const h2 = CONFIG.HEROES[this.hero2Id] || CONFIG.HEROES.archer;

        // 1. Неоновый светящийся разделитель Split-Screen
        this.divider = this.add.rectangle(halfW, height / 2, 3, height, 0x38bdf8, 0.85).setDepth(200);
        this.dividerGlow = this.add.rectangle(halfW, height / 2, 8, height, 0x00f5d4, 0.3).setDepth(199);
        this.hudGroup.add(this.divider);
        this.hudGroup.add(this.dividerGlow);

        this.tweens.add({
            targets: this.dividerGlow,
            alpha: 0.5,
            scaleX: 1.4,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 2. Центральный блок (Таймер, Киллы, Пауза)
        this.timerBg = this.add.rectangle(halfW, 26, 110, 32, 0x0f172a, 0.9).setDepth(201);
        this.timerBg.setStrokeStyle(1.5, 0x38bdf8);
        this.timerIcon = this.add.image(halfW - 35, 26, 'ui_clock').setScale(0.7).setDepth(202);
        this.timerText = this.add.text(halfW + 8, 26, '10:00', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '16px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(202);

        this.killsIcon = this.add.image(halfW - 20, 50, 'ui_skull').setScale(0.65).setDepth(202);
        this.killsText = this.add.text(halfW + 5, 50, '0', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '13px', fontStyle: 'bold', color: '#f87171'
        }).setOrigin(0, 0.5).setDepth(202);

        this.pauseBtn = this.add.rectangle(halfW + 75, 26, 28, 28, 0x1e293b, 0.9).setInteractive({ useHandCursor: true }).setDepth(201);
        this.pauseBtn.setStrokeStyle(1.5, 0x38bdf8);
        this.pauseIcon = this.add.image(halfW + 75, 26, 'ui_pause').setScale(0.65).setDepth(202);
        this.pauseBtn.on('pointerdown', () => this.openPause());

        this.hudGroup.add(this.timerBg);
        this.hudGroup.add(this.timerIcon);
        this.hudGroup.add(this.timerText);
        this.hudGroup.add(this.killsIcon);
        this.hudGroup.add(this.killsText);
        this.hudGroup.add(this.pauseBtn);
        this.hudGroup.add(this.pauseIcon);

        // 3. Игрок 1 HUD (Левая половина)
        this.p1PanelBg = this.add.rectangle(12, 10, Math.min(halfW - 90, 310), 66, 0x090d16, 0.85).setOrigin(0, 0).setDepth(200);
        this.p1PanelBg.setStrokeStyle(1.5, 0x0284c7);
        this.hudGroup.add(this.p1PanelBg);

        this.p1Header = this.add.text(20, 16, `1P: ${h1.name[lang].toUpperCase()}`, {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#38bdf8', letterSpacing: 0.5
        }).setDepth(202);
        this.p1LvlText = this.add.text(140, 16, 'LVL 1', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '12px', fontStyle: 'bold', color: '#00f5d4'
        }).setDepth(202);
        this.hudGroup.add(this.p1Header);
        this.hudGroup.add(this.p1LvlText);

        // P1 HP Bar
        this.p1HpBg = this.add.rectangle(20, 34, 125, 10, 0x020617, 0.9).setOrigin(0, 0.5).setDepth(201);
        this.p1HpBg.setStrokeStyle(1, 0x1e293b);
        this.p1HpFill = this.add.rectangle(20, 34, 125, 8, 0x22c55e).setOrigin(0, 0.5).setDepth(202);
        this.p1HpText = this.add.text(82, 34, '120/120 HP', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '9px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(203);
        this.hudGroup.add(this.p1HpBg);
        this.hudGroup.add(this.p1HpFill);
        this.hudGroup.add(this.p1HpText);

        // P1 XP Bar
        this.p1XpBg = this.add.rectangle(20, 48, 125, 8, 0x020617, 0.9).setOrigin(0, 0.5).setDepth(201);
        this.p1XpBg.setStrokeStyle(1, 0x1e293b);
        this.p1XpFill = this.add.rectangle(20, 48, 0, 6, 0xa855f7).setOrigin(0, 0.5).setDepth(202);
        this.p1XpText = this.add.text(82, 48, 'XP: 0/5', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '8px', fontStyle: 'bold', color: '#e9d5ff'
        }).setOrigin(0.5).setDepth(203);
        this.hudGroup.add(this.p1XpBg);
        this.hudGroup.add(this.p1XpFill);
        this.hudGroup.add(this.p1XpText);

        this.p1InventoryGroup = this.add.group();
        this.hudGroup.add(this.p1InventoryGroup);

        // 4. Игрок 2 HUD (Правая половина)
        const p2StartX = halfW + 85;
        this.p2PanelBg = this.add.rectangle(p2StartX, 10, Math.min(width - p2StartX - 12, 310), 66, 0x090d16, 0.85).setOrigin(0, 0).setDepth(200);
        this.p2PanelBg.setStrokeStyle(1.5, 0x9333ea);
        this.hudGroup.add(this.p2PanelBg);

        this.p2Header = this.add.text(p2StartX + 8, 16, `2P: ${h2.name[lang].toUpperCase()}`, {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#c084fc', letterSpacing: 0.5
        }).setDepth(202);
        this.p2LvlText = this.add.text(p2StartX + 128, 16, 'LVL 1', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '12px', fontStyle: 'bold', color: '#00f5d4'
        }).setDepth(202);
        this.hudGroup.add(this.p2Header);
        this.hudGroup.add(this.p2LvlText);

        // P2 HP Bar
        this.p2HpBg = this.add.rectangle(p2StartX + 8, 34, 125, 10, 0x020617, 0.9).setOrigin(0, 0.5).setDepth(201);
        this.p2HpBg.setStrokeStyle(1, 0x1e293b);
        this.p2HpFill = this.add.rectangle(p2StartX + 8, 34, 125, 8, 0x22c55e).setOrigin(0, 0.5).setDepth(202);
        this.p2HpText = this.add.text(p2StartX + 70, 34, '90/90 HP', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '9px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(203);
        this.hudGroup.add(this.p2HpBg);
        this.hudGroup.add(this.p2HpFill);
        this.hudGroup.add(this.p2HpText);

        // P2 XP Bar
        this.p2XpBg = this.add.rectangle(p2StartX + 8, 48, 125, 8, 0x020617, 0.9).setOrigin(0, 0.5).setDepth(201);
        this.p2XpBg.setStrokeStyle(1, 0x1e293b);
        this.p2XpFill = this.add.rectangle(p2StartX + 8, 48, 0, 6, 0xa855f7).setOrigin(0, 0.5).setDepth(202);
        this.p2XpText = this.add.text(p2StartX + 70, 48, 'XP: 0/5', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '8px', fontStyle: 'bold', color: '#e9d5ff'
        }).setOrigin(0.5).setDepth(203);
        this.hudGroup.add(this.p2XpBg);
        this.hudGroup.add(this.p2XpFill);
        this.hudGroup.add(this.p2XpText);

        this.p2InventoryGroup = this.add.group();
        this.hudGroup.add(this.p2InventoryGroup);

        // 5. Полоса здоровья босса (скрыта по умолчанию)
        this.bossBarBg = this.add.rectangle(halfW, 85, 320, 14, 0x1f2937, 0.9).setDepth(201).setVisible(false);
        this.bossBarFill = this.add.rectangle(halfW - 155, 85, 310, 10, 0xef4444).setOrigin(0, 0.5).setDepth(202).setVisible(false);
        this.bossNameText = this.add.text(halfW, 72, '', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#ffd166'
        }).setOrigin(0.5).setDepth(202).setVisible(false);

        this.hudGroup.add(this.bossBarBg);
        this.hudGroup.add(this.bossBarFill);
        this.hudGroup.add(this.bossNameText);

        this.updateInventoryHUD();
    }

    layoutSplitScreen(width, height) {
        this.setupSplitScreenCameras(width, height);

        const halfW = Math.floor(width / 2);
        if (this.divider) {
            this.divider.setPosition(halfW, height / 2).setSize(3, height);
            this.dividerGlow.setPosition(halfW, height / 2).setSize(8, height);
        }

        if (this.timerBg) {
            this.timerBg.setPosition(halfW, 26);
            this.timerIcon.setPosition(halfW - 35, 26);
            this.timerText.setPosition(halfW + 8, 26);
            this.killsIcon.setPosition(halfW - 20, 50);
            this.killsText.setPosition(halfW + 5, 50);
            this.pauseBtn.setPosition(halfW + 75, 26);
            this.pauseIcon.setPosition(halfW + 75, 26);
        }

        if (this.p1PanelBg) {
            this.p1PanelBg.setSize(Math.min(halfW - 90, 310), 66);
        }

        const p2StartX = halfW + 85;
        if (this.p2PanelBg) {
            this.p2PanelBg.setPosition(p2StartX, 10).setSize(Math.min(width - p2StartX - 12, 310), 66);
            this.p2Header.setPosition(p2StartX + 8, 16);
            this.p2LvlText.setPosition(p2StartX + 128, 16);
            this.p2HpBg.setPosition(p2StartX + 8, 34);
            this.p2HpFill.setPosition(p2StartX + 8, 34);
            this.p2HpText.setPosition(p2StartX + 70, 34);
            this.p2XpBg.setPosition(p2StartX + 8, 48);
            this.p2XpFill.setPosition(p2StartX + 8, 48);
            this.p2XpText.setPosition(p2StartX + 70, 48);
        }

        if (this.bossBarBg) {
            this.bossBarBg.setPosition(halfW, 85);
            this.bossBarFill.setPosition(halfW - 155, 85);
            this.bossNameText.setPosition(halfW, 72);
        }

        this.updateInventoryHUD();
        this.applyCameraIgnores();
    }

    setupCoopTouchJoysticks() {
        const joyContainer = document.getElementById('joystick-coop-container');
        const singleJoy = document.getElementById('joystick-zone');
        if (singleJoy) singleJoy.style.display = 'none';

        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
        if (!isTouch || !joyContainer) return;

        joyContainer.style.display = 'block';
        this.checkMobileOrientation();

        const p1Base = document.getElementById('joystick-coop-p1-base');
        const p1Knob = document.getElementById('joystick-coop-p1-knob');
        const p2Base = document.getElementById('joystick-coop-p2-base');
        const p2Knob = document.getElementById('joystick-coop-p2-knob');

        let p1TouchId = null;
        let p2TouchId = null;

        const maxDist = 42;

        const handleTouchStart = (e) => {
            const width = window.innerWidth;
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.clientX < width / 2 && p1TouchId === null) {
                    p1TouchId = touch.identifier;
                    updateP1Joystick(touch);
                } else if (touch.clientX >= width / 2 && p2TouchId === null) {
                    p2TouchId = touch.identifier;
                    updateP2Joystick(touch);
                }
            }
        };

        const handleTouchMove = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === p1TouchId) {
                    updateP1Joystick(touch);
                } else if (touch.identifier === p2TouchId) {
                    updateP2Joystick(touch);
                }
            }
        };

        const handleTouchEnd = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === p1TouchId) {
                    p1TouchId = null;
                    this.joystickVector1 = { x: 0, y: 0 };
                    if (p1Knob) p1Knob.style.transform = 'translate(0px, 0px)';
                } else if (touch.identifier === p2TouchId) {
                    p2TouchId = null;
                    this.joystickVector2 = { x: 0, y: 0 };
                    if (p2Knob) p2Knob.style.transform = 'translate(0px, 0px)';
                }
            }
        };

        const updateP1Joystick = (touch) => {
            if (!p1Base) return;
            const rect = p1Base.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }

            this.joystickVector1 = {
                x: dist > 5 ? dx / maxDist : 0,
                y: dist > 5 ? dy / maxDist : 0
            };

            if (p1Knob) p1Knob.style.transform = `translate(${dx}px, ${dy}px)`;
        };

        const updateP2Joystick = (touch) => {
            if (!p2Base) return;
            const rect = p2Base.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > maxDist) {
                dx = (dx / dist) * maxDist;
                dy = (dy / dist) * maxDist;
            }

            this.joystickVector2 = {
                x: dist > 5 ? dx / maxDist : 0,
                y: dist > 5 ? dy / maxDist : 0
            };

            if (p2Knob) p2Knob.style.transform = `translate(${dx}px, ${dy}px)`;
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('touchcancel', handleTouchEnd, { passive: false });

        this.touchCleanup = () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }

    checkMobileOrientation() {
        const overlay = document.getElementById('rotate-device-overlay');
        if (!overlay) return;

        const isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
        const isPortrait = window.innerHeight > window.innerWidth;

        if (isMobile && isPortrait) {
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }

    setupLevelUpHotkeys() {
        this.input.keyboard.on('keydown', (event) => {
            const key = event.key ? event.key.toLowerCase() : '';
            const code = event.code || '';

            // P1 Hotkeys: 1, 2, 3 / Digit1, Digit2, Digit3 / Numpad1, Numpad2, Numpad3
            if (key === '1' || code === 'Digit1' || code === 'Numpad1') this.selectP1Upgrade(0);
            else if (key === '2' || code === 'Digit2' || code === 'Numpad2') this.selectP1Upgrade(1);
            else if (key === '3' || code === 'Digit3' || code === 'Numpad3') this.selectP1Upgrade(2);

            // P2 Hotkeys: 7, 8, 9 / J, K, L / Digit7, Digit8, Digit9 / KeyJ, KeyK, KeyL
            else if (key === '7' || key === 'j' || key === 'о' || code === 'Digit7' || code === 'KeyJ' || code === 'Numpad7') this.selectP2Upgrade(0);
            else if (key === '8' || key === 'k' || key === 'л' || code === 'Digit8' || code === 'KeyK' || code === 'Numpad8') this.selectP2Upgrade(1);
            else if (key === '9' || key === 'l' || key === 'д' || code === 'Digit9' || code === 'KeyL' || code === 'Numpad9') this.selectP2Upgrade(2);
        });
    }

    // ==========================================
    // REAL-TIME LEVEL UP СИСТЕМА (БЕЗ ПАУЗЫ ИГРЫ)
    // ==========================================
    showLevelUpOverlay(player) {
        if (player === this.player1) {
            if (this.isP1LevelingUp) {
                this.p1LevelUpQueue++;
                return;
            }
            this.showP1LevelUpMenu();
        } else if (player === this.player2) {
            if (this.isP2LevelingUp) {
                this.p2LevelUpQueue++;
                return;
            }
            this.showP2LevelUpMenu();
        }
    }

    showP1LevelUpMenu() {
        this.isP1LevelingUp = true;
        const { width, height } = this.scale;
        const halfW = Math.floor(width / 2);
        const centerX = halfW / 2;
        const upgrades = UpgradeManager.getAvailableUpgrades(this.player1);
        this.p1CurrentOptions = upgrades;

        if (this.p1LevelCards) {
            this.p1LevelCards.forEach(c => {
                this.hudGroup.remove(c);
                if (c && c.destroy) c.destroy();
            });
        }
        this.p1LevelCards = [];

        // 1. Затемняющий полупрозрачный фон на левую половину экрана
        const backdrop = this.add.rectangle(centerX, height / 2, halfW, height, 0x000000, 0.85)
            .setInteractive().setDepth(180);
        this.hudGroup.add(backdrop);
        this.p1LevelCards.push(backdrop);

        // 2. Заголовок и подзаголовок
        const titleY = Math.max(38, height / 2 - 170);
        const titleTxt = this.add.text(centerX, titleY, `1P: ПОВЫШЕНИЕ УРОВНЯ`, {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '19px', fontStyle: 'bold', color: '#00f5d4', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(242);

        const subTxt = this.add.text(centerX, titleY + 22, `Уровень ${this.player1.level} • Выберите улучшение`, {
            fontFamily: CONFIG.FONTS.UI, fontSize: '11px', fontStyle: 'bold', color: '#94a3b8'
        }).setOrigin(0.5).setDepth(242);

        this.hudGroup.add(titleTxt);
        this.hudGroup.add(subTxt);
        this.p1LevelCards.push(titleTxt, subTxt);

        // 3. Карточки улучшений
        const cardW = Math.min(halfW - 28, 380);
        const cardH = 78;
        const spacing = 10;
        const startY = height / 2 - 70;

        upgrades.forEach((upg, idx) => {
            const cy = startY + (idx * (cardH + spacing));
            let borderColor = upg.isSuper ? 0xffd166 : (upg.isNew ? 0xa855f7 : 0x38bdf8);

            const cardBg = this.add.rectangle(centerX, cy, cardW, cardH, upg.isSuper ? 0x240938 : 0x0f172a, 0.96)
                .setInteractive({ useHandCursor: true }).setDepth(245);
            cardBg.setStrokeStyle(1.8, borderColor);

            // Иконка в рамке слева
            const iconBg = this.add.rectangle(centerX - cardW / 2 + 34, cy, 48, 48, 0x1e293b, 0.95).setDepth(246);
            iconBg.setStrokeStyle(1.5, borderColor);

            const icon = this.add.image(centerX - cardW / 2 + 34, cy, upg.icon).setScale(0.82).setDepth(247);
            if (upg.isSuper) icon.setTint(0xffd166);

            // Тег, название и описание
            const tagText = upg.isSuper ? '[ЭВОЛЮЦИЯ]' : (upg.isNew ? '[НОВОЕ]' : `УРОВЕНЬ ${upg.level}`);
            const tagColor = upg.isSuper ? '#ffd166' : (upg.isNew ? '#c084fc' : '#38bdf8');
            const textStartX = centerX - cardW / 2 + 66;

            const tag = this.add.text(textStartX, cy - cardH / 2 + 10, tagText, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: '10px', fontStyle: 'bold', color: tagColor
            }).setDepth(247);

            const name = this.add.text(textStartX, cy - cardH / 2 + 24, upg.name, {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '13px', fontStyle: 'bold', color: '#ffffff'
            }).setDepth(247);

            const desc = this.add.text(textStartX, cy + 3, upg.desc, {
                fontFamily: CONFIG.FONTS.BODY, fontSize: '10px', color: '#94a3b8', wordWrap: { width: cardW - 105 }
            }).setDepth(247);

            // Бейдж горячей клавиши
            const keyBadge = this.add.rectangle(centerX + cardW / 2 - 20, cy - cardH / 2 + 16, 26, 20, 0x1e293b, 0.95).setDepth(247);
            keyBadge.setStrokeStyle(1, 0x38bdf8);
            const keyTxt = this.add.text(centerX + cardW / 2 - 20, cy - cardH / 2 + 16, `${idx + 1}`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: '11px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0.5).setDepth(248);

            this.hudGroup.add(cardBg);
            this.hudGroup.add(iconBg);
            this.hudGroup.add(icon);
            this.hudGroup.add(tag);
            this.hudGroup.add(name);
            this.hudGroup.add(desc);
            this.hudGroup.add(keyBadge);
            this.hudGroup.add(keyTxt);

            this.p1LevelCards.push(cardBg, iconBg, icon, tag, name, desc, keyBadge, keyTxt);

            // Ховер эффекты
            cardBg.on('pointerover', () => {
                cardBg.fillColor = 0x1e293b;
                cardBg.setScale(1.02);
            });
            cardBg.on('pointerout', () => {
                cardBg.fillColor = upg.isSuper ? 0x240938 : 0x0f172a;
                cardBg.setScale(1.0);
            });
            cardBg.on('pointerdown', () => this.selectP1Upgrade(idx));
        });

        this.applyCameraIgnores();
    }

    selectP1Upgrade(index) {
        if (!this.isP1LevelingUp || !this.p1CurrentOptions || !this.p1CurrentOptions[index]) return;
        const upgrade = this.p1CurrentOptions[index];
        UpgradeManager.applyUpgrade(this.player1, upgrade);
        window.Sound.playPowerup();

        if (this.p1LevelCards) {
            this.p1LevelCards.forEach(c => {
                this.hudGroup.remove(c);
                if (c && c.destroy) c.destroy();
            });
            this.p1LevelCards = [];
        }
        this.isP1LevelingUp = false;
        this.updateInventoryHUD();

        if (this.p1LevelUpQueue > 0) {
            this.p1LevelUpQueue--;
            this.time.delayedCall(150, () => this.showP1LevelUpMenu());
        }
    }

    showP2LevelUpMenu() {
        this.isP2LevelingUp = true;
        const { width, height } = this.scale;
        const halfW = Math.floor(width / 2);
        const centerX = halfW + (width - halfW) / 2;
        const upgrades = UpgradeManager.getAvailableUpgrades(this.player2);
        this.p2CurrentOptions = upgrades;

        if (this.p2LevelCards) {
            this.p2LevelCards.forEach(c => {
                this.hudGroup.remove(c);
                if (c && c.destroy) c.destroy();
            });
        }
        this.p2LevelCards = [];

        // 1. Затемняющий полупрозрачный фон на правую половину экрана
        const backdrop = this.add.rectangle(centerX, height / 2, width - halfW, height, 0x000000, 0.85)
            .setInteractive().setDepth(180);
        this.hudGroup.add(backdrop);
        this.p2LevelCards.push(backdrop);

        // 2. Заголовок и подзаголовок
        const titleY = Math.max(38, height / 2 - 170);
        const titleTxt = this.add.text(centerX, titleY, `2P: ПОВЫШЕНИЕ УРОВНЯ`, {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '19px', fontStyle: 'bold', color: '#c084fc', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(242);

        const subTxt = this.add.text(centerX, titleY + 22, `Уровень ${this.player2.level} • Выберите улучшение`, {
            fontFamily: CONFIG.FONTS.UI, fontSize: '11px', fontStyle: 'bold', color: '#94a3b8'
        }).setOrigin(0.5).setDepth(242);

        this.hudGroup.add(titleTxt);
        this.hudGroup.add(subTxt);
        this.p2LevelCards.push(titleTxt, subTxt);

        // 3. Карточки улучшений
        const cardW = Math.min(halfW - 28, 380);
        const cardH = 78;
        const spacing = 10;
        const startY = height / 2 - 70;
        const hotkeyLabels = ['7/J', '8/K', '9/L'];

        upgrades.forEach((upg, idx) => {
            const cy = startY + (idx * (cardH + spacing));
            let borderColor = upg.isSuper ? 0xffd166 : (upg.isNew ? 0xa855f7 : 0x38bdf8);

            const cardBg = this.add.rectangle(centerX, cy, cardW, cardH, upg.isSuper ? 0x240938 : 0x0f172a, 0.96)
                .setInteractive({ useHandCursor: true }).setDepth(245);
            cardBg.setStrokeStyle(1.8, borderColor);

            // Иконка в рамке слева
            const iconBg = this.add.rectangle(centerX - cardW / 2 + 34, cy, 48, 48, 0x1e293b, 0.95).setDepth(246);
            iconBg.setStrokeStyle(1.5, borderColor);

            const icon = this.add.image(centerX - cardW / 2 + 34, cy, upg.icon).setScale(0.82).setDepth(247);
            if (upg.isSuper) icon.setTint(0xffd166);

            // Тег, название и описание
            const tagText = upg.isSuper ? '[ЭВОЛЮЦИЯ]' : (upg.isNew ? '[НОВОЕ]' : `УРОВЕНЬ ${upg.level}`);
            const tagColor = upg.isSuper ? '#ffd166' : (upg.isNew ? '#c084fc' : '#38bdf8');
            const textStartX = centerX - cardW / 2 + 66;

            const tag = this.add.text(textStartX, cy - cardH / 2 + 10, tagText, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: '10px', fontStyle: 'bold', color: tagColor
            }).setDepth(247);

            const name = this.add.text(textStartX, cy - cardH / 2 + 24, upg.name, {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '13px', fontStyle: 'bold', color: '#ffffff'
            }).setDepth(247);

            const desc = this.add.text(textStartX, cy + 3, upg.desc, {
                fontFamily: CONFIG.FONTS.BODY, fontSize: '10px', color: '#94a3b8', wordWrap: { width: cardW - 105 }
            }).setDepth(247);

            // Бейдж горячей клавиши
            const keyBadge = this.add.rectangle(centerX + cardW / 2 - 20, cy - cardH / 2 + 16, 26, 20, 0x1e293b, 0.95).setDepth(247);
            keyBadge.setStrokeStyle(1, 0xa855f7);
            const keyTxt = this.add.text(centerX + cardW / 2 - 20, cy - cardH / 2 + 16, hotkeyLabels[idx], {
                fontFamily: CONFIG.FONTS.MONO, fontSize: '10px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0.5).setDepth(248);

            this.hudGroup.add(cardBg);
            this.hudGroup.add(iconBg);
            this.hudGroup.add(icon);
            this.hudGroup.add(tag);
            this.hudGroup.add(name);
            this.hudGroup.add(desc);
            this.hudGroup.add(keyBadge);
            this.hudGroup.add(keyTxt);

            this.p2LevelCards.push(cardBg, iconBg, icon, tag, name, desc, keyBadge, keyTxt);

            // Ховер эффекты
            cardBg.on('pointerover', () => {
                cardBg.fillColor = 0x1e293b;
                cardBg.setScale(1.02);
            });
            cardBg.on('pointerout', () => {
                cardBg.fillColor = upg.isSuper ? 0x240938 : 0x0f172a;
                cardBg.setScale(1.0);
            });
            cardBg.on('pointerdown', () => this.selectP2Upgrade(idx));
        });

        this.applyCameraIgnores();
    }

    selectP2Upgrade(index) {
        if (!this.isP2LevelingUp || !this.p2CurrentOptions || !this.p2CurrentOptions[index]) return;
        const upgrade = this.p2CurrentOptions[index];
        UpgradeManager.applyUpgrade(this.player2, upgrade);
        window.Sound.playPowerup();

        if (this.p2LevelCards) {
            this.p2LevelCards.forEach(c => {
                this.hudGroup.remove(c);
                if (c && c.destroy) c.destroy();
            });
            this.p2LevelCards = [];
        }
        this.isP2LevelingUp = false;
        this.updateInventoryHUD();

        if (this.p2LevelUpQueue > 0) {
            this.p2LevelUpQueue--;
            this.time.delayedCall(150, () => this.showP2LevelUpMenu());
        }
    }

    createCoopSpawnEffect(x, y, color = 0x00f5d4) {
        const ring = this.add.circle(x, y, 40, color, 0.7).setDepth(25);
        this.worldGroup.add(ring);
        this.tweens.add({
            targets: ring,
            scale: 2.0,
            alpha: 0,
            duration: 650,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
    }

    createEnemyDeathEffect(x, y, enemyType) {
        let color = 0x55a630;
        if (enemyType === 'bat') color = 0x7b2cbf;
        else if (enemyType === 'skeleton') color = 0xe2e8f0;
        else if (enemyType === 'skull' || enemyType === 'fire_elem') color = 0xf97316;
        else if (enemyType === 'ghost' || enemyType === 'necro_mage') color = 0x00f5d4;
        else if (enemyType === 'orc') color = 0x15803d;

        for (let i = 0; i < 7; i++) {
            const angle = (Math.PI * 2 / 7) * i + (Math.random() - 0.5) * 0.4;
            const speed = 40 + Math.random() * 60;
            const p = this.add.circle(x, y, 3 + Math.random() * 2, color).setDepth(25);
            this.worldGroup.add(p);
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

    getNearestActivePlayer(fromX = null, fromY = null) {
        const p1Active = this.player1 && this.player1.active;
        const p2Active = this.player2 && this.player2.active;
        if (p1Active && !p2Active) return this.player1;
        if (!p1Active && p2Active) return this.player2;
        if (!p1Active && !p2Active) return null;

        if (fromX !== null && fromY !== null) {
            const d1 = Phaser.Math.Distance.Between(fromX, fromY, this.player1.x, this.player1.y);
            const d2 = Phaser.Math.Distance.Between(fromX, fromY, this.player2.x, this.player2.y);
            return d1 <= d2 ? this.player1 : this.player2;
        }

        return this.player1;
    }

    damageArea(x, y, radius, damage, isCrit = false, isPoison = false, knockback = 0) {
        if (!this.poolManager || !this.poolManager.enemyGroup) return;
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
        if (!this.poolManager || !this.poolManager.enemyGroup) return;
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
        if (!this.poolManager || !this.poolManager.enemyGroup) return null;
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
        if (!this.poolManager || !this.poolManager.enemyGroup) return [];
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
        if (!this.poolManager || !this.poolManager.enemyGroup) return [];
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
        const size = isCrit ? '20px' : '14px';
        const stroke = isCrit ? '#7f1d1d' : '#000000';
        const strokeThick = isCrit ? 4 : 3;
        const textVal = isCrit ? `КРИТ ${amount}!` : `${amount}`;

        if (isCrit) {
            // Золотой звездный взрыв при критическом ударе
            const starFlash = this.add.circle(x, y, 14, 0xffd166, 0.7).setDepth(34);
            this.worldGroup.add(starFlash);
            this.tweens.add({
                targets: starFlash,
                radius: 30,
                alpha: 0,
                duration: 200,
                ease: 'Cubic.easeOut',
                onComplete: () => starFlash.destroy()
            });

            for (let i = 0; i < 5; i++) {
                const spk = this.add.circle(x, y, 3, i % 2 === 0 ? 0xffd166 : 0xff7b00).setDepth(34);
                this.worldGroup.add(spk);
                const a = (i * Math.PI * 2) / 5 + (Math.random() - 0.5) * 0.4;
                const dist = 24 + Math.random() * 16;
                this.tweens.add({
                    targets: spk,
                    x: x + Math.cos(a) * dist,
                    y: y + Math.sin(a) * dist,
                    scale: 0.2,
                    alpha: 0,
                    duration: 250,
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
        this.worldGroup.add(txt);

        this.tweens.add({
            targets: txt,
            y: y - (isCrit ? 45 : 28),
            alpha: 0,
            scale: isCrit ? 1.4 : 1.0,
            duration: isCrit ? 600 : 420,
            ease: isCrit ? 'Back.easeOut' : 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });
    }

    attractAllGems() {
        if (!this.poolManager || !this.poolManager.dropGroup) return;
        this.poolManager.dropGroup.children.iterate((drop) => {
            if (drop && drop.active) {
                drop.attracted = true;
            }
        });
    }

    showFloatingText(x, y, message, color = 0x00f5d4) {
        const colorStr = typeof color === 'number' ? '#' + color.toString(16).padStart(6, '0') : color;
        const txt = this.add.text(x, y, message, {
            fontFamily: CONFIG.FONTS.TITLE,
            fontSize: '18px',
            fontStyle: 'bold',
            color: colorStr,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(40);
        this.worldGroup.add(txt);

        this.tweens.add({
            targets: txt,
            y: y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });
    }

    openChest(isEvolution = 0) {
        const target = this.getNearestActivePlayer();
        if (target) {
            this.showLevelUpOverlay(target);
        }
    }

    updateGoldHUD() {
        this.goldEarned = (this.player1 ? this.player1.goldCollected : 0) + (this.player2 ? this.player2.goldCollected : 0);
    }

    getTargetPlayer() {
        return this.getNearestActivePlayer();
    }

    update(time, delta) {
        if (!this.gameActive) return;

        this.gameTimeSec += delta / 1000;
        const remainingSec = Math.max(0, CONFIG.GAME.GAME_DURATION_SEC - Math.floor(this.gameTimeSec));
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        if (this.timerText) {
            this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }

        // Обновление индивидуального HUD
        this.updatePlayerHUDStats();

        // Обновление игроков
        if (this.player1 && this.player1.active) this.player1.update(time, delta);
        if (this.player2 && this.player2.active) this.player2.update(time, delta);

        this.weaponSystem1.update(time, delta);
        this.weaponSystem2.update(time, delta);
        this.waveSpawner.update(time, delta);

        // Обновление алтарей воскрешения
        this.updateRevivalAltars(delta);

        // Обновление стрелок-указателей
        this.updateOffscreenIndicators();

        // Обновление полоски босса
        if (this.currentBoss && this.currentBoss.active) {
            const bossHpPercent = Math.max(0, this.currentBoss.hp / this.currentBoss.maxHp);
            this.bossBarFill.width = 310 * bossHpPercent;
        } else if (this.bossBarBg && this.bossBarBg.visible) {
            this.bossBarBg.setVisible(false);
            this.bossBarFill.setVisible(false);
            this.bossNameText.setVisible(false);
            this.currentBoss = null;
        }

        // Ближайший активный игрок для врагов
        const target = this.getNearestActivePlayer();
        if (target) {
            this.poolManager.updateAll(time, delta, target);
        } else {
            // Оба погибли
            this.onBothPlayersDied();
        }
    }

    updatePlayerHUDStats() {
        // P1 Stats
        if (this.player1) {
            if (this.p1LvlText) this.p1LvlText.setText(`LVL ${this.player1.level}`);
            const hpRatio = Math.max(0, Math.min(1, this.player1.hp / this.player1.stats.maxHp));
            if (this.p1HpFill) this.p1HpFill.width = 125 * hpRatio;
            if (this.p1HpText) this.p1HpText.setText(`${Math.round(this.player1.hp)}/${this.player1.stats.maxHp} HP`);

            const xpRatio = Math.max(0, Math.min(1, this.player1.xp / this.player1.nextLevelXp));
            if (this.p1XpFill) this.p1XpFill.width = 125 * xpRatio;
            if (this.p1XpText) this.p1XpText.setText(`XP: ${Math.floor(this.player1.xp)}/${Math.round(this.player1.nextLevelXp)}`);
        }

        // P2 Stats
        if (this.player2) {
            if (this.p2LvlText) this.p2LvlText.setText(`LVL ${this.player2.level}`);
            const hpRatio = Math.max(0, Math.min(1, this.player2.hp / this.player2.stats.maxHp));
            if (this.p2HpFill) this.p2HpFill.width = 125 * hpRatio;
            if (this.p2HpText) this.p2HpText.setText(`${Math.round(this.player2.hp)}/${this.player2.stats.maxHp} HP`);

            const xpRatio = Math.max(0, Math.min(1, this.player2.xp / this.player2.nextLevelXp));
            if (this.p2XpFill) this.p2XpFill.width = 125 * xpRatio;
            if (this.p2XpText) this.p2XpText.setText(`XP: ${Math.floor(this.player2.xp)}/${Math.round(this.player2.nextLevelXp)}`);
        }
    }

    onBothPlayersDied() {
        this.gameActive = false;
        this.physics.pause();
        if (window.Sound) {
            window.Sound.stopBGM();
            window.Sound.playDeath();
        }

        this.cameras.main.flash(500, 255, 255, 255);
        if (this.cam2) this.cam2.flash(500, 255, 255, 255);

        const deathVignette = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x880000, 0)
            .setDepth(300);
        this.hudGroup.add(deathVignette);
        this.tweens.add({ targets: deathVignette, fillAlpha: 0.45, duration: 700 });

        this.time.delayedCall(1300, () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            if (this.cam2) this.cam2.fadeOut(600, 0, 0, 0);
            this.time.delayedCall(650, () => {
                this.scene.start('GameOverScene', {
                    isVictory: false,
                    timeSec: Math.floor(this.gameTimeSec),
                    kills: this.kills,
                    gold: this.goldEarned,
                    level: Math.max(this.player1.level, this.player2.level)
                });
            });
        });
    }

    updateRevivalAltars(delta) {
        if (!this.revivalAltars || this.revivalAltars.length === 0) return;

        const activePlayer = this.getNearestActivePlayer();
        if (!activePlayer) return;

        for (let i = this.revivalAltars.length - 1; i >= 0; i--) {
            const altar = this.revivalAltars[i];
            altar.circle.rotation += 0.025;

            const dist = Phaser.Math.Distance.Between(activePlayer.x, activePlayer.y, altar.tombstone.x, altar.tombstone.y);
            if (dist <= 75) {
                altar.timer += delta / 1000;
                const pct = Math.min(100, Math.floor((altar.timer / altar.maxTime) * 100));
                altar.text.setText(`ВОСКРЕШЕНИЕ: ${pct}%`);
                altar.text.setColor('#00f5d4');

                if (altar.timer >= altar.maxTime) {
                    this.revivePlayer(altar.player, altar);
                }
            } else {
                altar.timer = Math.max(0, altar.timer - (delta / 1000) * 0.5);
                altar.text.setText('СТОЙТЕ В КРУГЕ ДЛЯ ВОСКРЕШЕНИЯ');
                altar.text.setColor('#ffd166');
            }
        }
    }

    spawnRevivalAltar(player) {
        const circle = this.add.sprite(player.x, player.y, 'fx_revive_circle').setDepth(3);
        const tomb = this.add.sprite(player.x, player.y - 10, 'prop_tombstone').setDepth(6);
        const txt = this.add.text(player.x, player.y - 45, 'СТОЙТЕ В КРУГЕ ДЛЯ ВОСКРЕШЕНИЯ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '11px', fontStyle: 'bold', color: '#ffd166', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(25);

        this.worldGroup.add(circle);
        this.worldGroup.add(tomb);
        this.worldGroup.add(txt);

        this.revivalAltars.push({
            player: player,
            tombstone: tomb,
            circle: circle,
            text: txt,
            timer: 0,
            maxTime: 3.5
        });
    }

    revivePlayer(player, altar) {
        player.x = altar.tombstone.x;
        player.y = altar.tombstone.y;
        player.setActive(true);
        player.setVisible(true);
        player.hp = Math.round(player.stats.maxHp * 0.5);
        player.isInvulnerable = true;
        player.invulnTime = 2500;

        player.hpBarBg = this.add.rectangle(player.x, player.y - 24, 36, 6, 0x000000, 0.7).setDepth(20);
        player.hpBarFill = this.add.rectangle(player.x - 18, player.y - 24, 36, 4, 0x00f5d4, 1).setDepth(21);
        player.hpBarFill.setOrigin(0, 0.5);

        this.showFloatingText(player.x, player.y - 30, 'НАПАРНИК ВОСКРЕШЁН!', 0x00f5d4);
        window.Sound.playLevelUp();

        altar.tombstone.destroy();
        altar.circle.destroy();
        altar.text.destroy();
        this.revivalAltars = this.revivalAltars.filter(a => a !== altar);
        this.applyCameraIgnores();
    }

    onPlayerDied(player) {
        const otherPlayer = (player === this.player1) ? this.player2 : this.player1;
        this.showFloatingText(player.x, player.y, 'ПАЛ В БОЮ!', 0xef4444);

        if (otherPlayer && otherPlayer.active) {
            this.spawnRevivalAltar(player);
        }
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

        window.Sound.playHit();
        for (let i = 0; i < 6; i++) {
            const chip = this.add.rectangle(barrel.x + (Math.random() - 0.5) * 16, barrel.y + (Math.random() - 0.5) * 16, 4, 4, 0x8b5a2b);
            this.worldGroup.add(chip);
            this.tweens.add({
                targets: chip,
                x: chip.x + (Math.random() - 0.5) * 60,
                y: chip.y + (Math.random() - 0.5) * 60,
                alpha: 0,
                duration: 350,
                onComplete: () => chip.destroy()
            });
        }

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

    triggerHitstop(durationMs = 45) {
        if (this.isHitstopActive) return;
        this.isHitstopActive = true;
        this.physics.world.timeScale = 0.05;
        this.time.delayedCall(durationMs, () => {
            this.physics.world.timeScale = 1.0;
            this.isHitstopActive = false;
        });
    }

    openPause() {
        if (!this.gameActive) return;
        this.scene.pause();
        this.scene.launch('PauseScene', { player: this.player1, player2: this.player2, sceneKey: 'CoopGameScene' });
        this.scene.bringToTop('PauseScene');
    }

    onEnemyKilled(enemy) {
        this.kills++;
        if (this.killsText) this.killsText.setText(`${this.kills}`);
        if (this.player1) this.player1.kills++;

        QuestManager.checkProgress(this, 'kills', 1);

        if (enemy.isBoss) {
            QuestManager.checkProgress(this, 'boss', 1);

            let remainingBoss = false;
            this.poolManager.enemyGroup.children.iterate((e) => {
                if (e && e.active && e.isBoss && e !== enemy) remainingBoss = true;
            });

            if (!remainingBoss) {
                this.time.delayedCall(1200, () => {
                    if (this.gameActive) {
                        window.Sound.playBattleBGM();
                    }
                });
            }
        }

        if (enemy.isBoss && enemy.enemyType === 'dark_overlord') {
            this.time.delayedCall(1000, () => {
                this.scene.start('GameOverScene', {
                    isVictory: true,
                    timeSec: Math.floor(this.gameTimeSec),
                    kills: this.kills,
                    gold: this.goldEarned,
                    level: Math.max(this.player1.level, this.player2.level)
                });
            });
        }
    }

    showBossAlert(bossId) {
        window.Sound.playBossBGM();
        const { width } = this.scale;
        const alertBg = this.add.rectangle(width / 2, 95, width, 40, 0xef4444, 0.75).setDepth(210);
        const alertTxt = this.add.text(width / 2, 95, 'ВНИМАНИЕ: ПРИБЛИЖАЕТСЯ БОСС!', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '16px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(211);

        this.hudGroup.add(alertBg);
        this.hudGroup.add(alertTxt);

        this.tweens.add({
            targets: [alertBg, alertTxt], alpha: 0, duration: 2500,
            onComplete: () => { alertBg.destroy(); alertTxt.destroy(); }
        });
    }

    updateOffscreenIndicators() {
        this.indicatorGraphics.clear();
        this.indicatorTexts.forEach(t => t.destroy());
        this.indicatorTexts = [];

        const cam = this.cameras.main;
        const viewRect = new Phaser.Geom.Rectangle(cam.scrollX, cam.scrollY, cam.width, cam.height);

        // Индикаторы боссов
        this.poolManager.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active && enemy.isBoss) {
                if (!Phaser.Geom.Rectangle.Contains(viewRect, enemy.x, enemy.y)) {
                    this.drawPointer(enemy.x, enemy.y, 'ui_boss_skull', 0xef4444);
                }
            }
        });

        // Индикаторы сундуков
        this.poolManager.dropGroup.children.iterate((item) => {
            if (item && item.active && item.dropType === 'chest') {
                if (!Phaser.Geom.Rectangle.Contains(viewRect, item.x, item.y)) {
                    this.drawPointer(item.x, item.y, 'ui_chest_pointer', 0xffd166);
                }
            }
        });
    }

    drawPointer(targetX, targetY, iconKey, color) {
        const cam = this.cameras.main;
        const padding = 35;
        const minX = padding;
        const maxX = cam.width - padding;
        const minY = padding + 55;
        const maxY = cam.height - padding;

        const screenTargetX = targetX - cam.scrollX;
        const screenTargetY = targetY - cam.scrollY;

        const clampedX = Phaser.Math.Clamp(screenTargetX, minX, maxX);
        const clampedY = Phaser.Math.Clamp(screenTargetY, minY, maxY);

        const angle = Phaser.Math.Angle.Between(clampedX, clampedY, screenTargetX, screenTargetY);

        this.indicatorGraphics.lineStyle(2, color, 0.9);
        this.indicatorGraphics.fillStyle(color, 0.85);

        const arrowLen = 14;
        const tipX = clampedX + Math.cos(angle) * arrowLen;
        const tipY = clampedY + Math.sin(angle) * arrowLen;
        const leftX = clampedX + Math.cos(angle + 2.5) * (arrowLen * 0.6);
        const leftY = clampedY + Math.sin(angle + 2.5) * (arrowLen * 0.6);
        const rightX = clampedX + Math.cos(angle - 2.5) * (arrowLen * 0.6);
        const rightY = clampedY + Math.sin(angle - 2.5) * (arrowLen * 0.6);

        this.indicatorGraphics.beginPath();
        this.indicatorGraphics.moveTo(tipX, tipY);
        this.indicatorGraphics.lineTo(leftX, leftY);
        this.indicatorGraphics.lineTo(rightX, rightY);
        this.indicatorGraphics.closePath();
        this.indicatorGraphics.fillPath();
        this.indicatorGraphics.strokePath();

        const distWorld = Math.round(Phaser.Math.Distance.Between(this.player1.x, this.player1.y, targetX, targetY) / 32);
        const distText = this.add.text(clampedX, clampedY + 12, `${distText || distWorld}m`, {
            fontFamily: CONFIG.FONTS.MONO, fontSize: '9px', fontStyle: 'bold', color: '#ffffff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(91);
        this.indicatorTexts.push(distText);
        this.hudGroup.add(distText);
    }

    showFloatingText(x, y, message, color = 0xffffff) {
        const txt = this.add.text(x, y, message, {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '13px', fontStyle: 'bold', color: `#${color.toString(16).padStart(6, '0')}`,
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(200);
        this.worldGroup.add(txt);

        this.tweens.add({
            targets: txt,
            y: y - 35,
            alpha: 0,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 850,
            ease: 'Cubic.easeOut',
            onComplete: () => txt.destroy()
        });
    }

    updateGoldHUD() {
        this.goldEarned = (this.player1 ? this.player1.goldCollected : 0) + (this.player2 ? this.player2.goldCollected : 0);
    }

    updateInventoryHUD() {
        if (this.p1InventoryGroup) this.p1InventoryGroup.clear(true, true);
        if (this.p2InventoryGroup) this.p2InventoryGroup.clear(true, true);
        
        // P1 инвентарь (под панелью P1)
        if (this.player1 && this.p1InventoryGroup) {
            let startX = 150;
            let startY = 38;
            Object.entries(this.player1.weapons).forEach(([id, lvl]) => {
                const config = CONFIG.WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 20, 20, 0x0f172a, 0.9).setDepth(201).setStrokeStyle(1, 0x0284c7);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.4).setDepth(202);
                const lvlBadge = this.add.text(startX + 8, startY + 8, `${lvl}`, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: '8px', fontStyle: 'bold', color: '#ffd166', stroke: '#000', strokeThickness: 2
                }).setOrigin(1, 1).setDepth(203);
                this.p1InventoryGroup.add(bg);
                this.p1InventoryGroup.add(icon);
                this.p1InventoryGroup.add(lvlBadge);
                startX += 23;
            });
            this.player1.superWeapons.forEach(id => {
                const config = CONFIG.SUPER_WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 22, 22, 0x1e1b4b, 0.95).setDepth(201).setStrokeStyle(1.5, 0xf59e0b);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.44).setDepth(202).setTint(0xffd166);
                this.p1InventoryGroup.add(bg);
                this.p1InventoryGroup.add(icon);
                startX += 25;
            });
        }

        // P2 инвентарь (под панелью P2)
        if (this.player2 && this.p2InventoryGroup) {
            const halfW = Math.floor(this.scale.width / 2);
            let startX = halfW + 225;
            let startY = 38;
            Object.entries(this.player2.weapons).forEach(([id, lvl]) => {
                const config = CONFIG.WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 20, 20, 0x0f172a, 0.9).setDepth(201).setStrokeStyle(1, 0xa855f7);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.4).setDepth(202);
                const lvlBadge = this.add.text(startX + 8, startY + 8, `${lvl}`, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: '8px', fontStyle: 'bold', color: '#ffd166', stroke: '#000', strokeThickness: 2
                }).setOrigin(1, 1).setDepth(203);
                this.p2InventoryGroup.add(bg);
                this.p2InventoryGroup.add(icon);
                this.p2InventoryGroup.add(lvlBadge);
                startX += 23;
            });
            this.player2.superWeapons.forEach(id => {
                const config = CONFIG.SUPER_WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 22, 22, 0x1e1b4b, 0.95).setDepth(201).setStrokeStyle(1.5, 0xf59e0b);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.44).setDepth(202).setTint(0xffd166);
                this.p2InventoryGroup.add(bg);
                this.p2InventoryGroup.add(icon);
                startX += 25;
            });
        }

        this.applyCameraIgnores();
    }

    setCurrentBoss(boss) {
        this.currentBoss = boss;
        if (!boss) return;
        const config = CONFIG.BOSSES[boss.enemyType];
        const lang = window.SaveManager.data.lang || 'ru';
        const bossName = config ? (typeof config.name === 'object' ? config.name[lang] || config.name.ru : config.name) : 'БОСС';
        if (this.bossNameText) {
            this.bossNameText.setText(`[ ${bossName.toUpperCase()} ]`);
        }
        if (this.bossBarBg) this.bossBarBg.setVisible(true);
        if (this.bossBarFill) this.bossBarFill.setVisible(true);
        if (this.bossNameText) this.bossNameText.setVisible(true);
        window.Sound.playBossBGM();
    }

    cleanupScene() {
        const joyContainer = document.getElementById('joystick-coop-container');
        if (joyContainer) joyContainer.style.display = 'none';

        const overlay = document.getElementById('rotate-device-overlay');
        if (overlay) overlay.style.display = 'none';

        if (this.touchCleanup) this.touchCleanup();
        if (this.boundOrientationHandler) {
            window.removeEventListener('orientationchange', this.boundOrientationHandler);
            window.removeEventListener('resize', this.boundOrientationHandler);
        }
    }
}

window.CoopGameScene = CoopGameScene;
