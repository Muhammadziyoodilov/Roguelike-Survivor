/**
 * Coop Game Scene - Совместное выживание для двоих игроков на одной клавиатуре!
 * Полная поддержка боевых систем, воскрешения, адаптивности и анимаций
 */
class CoopGameScene extends Phaser.Scene {
    constructor() {
        super('CoopGameScene');
    }

    init(data) {
        this.hero1Id = (data && (data.hero1 || data.heroId1)) ? (data.hero1 || data.heroId1) : 'knight';
        this.hero2Id = (data && (data.hero2 || data.heroId2)) ? (data.hero2 || data.heroId2) : 'archer';
        this.selectedMapId = (data && data.mapId) || window.SaveManager.data.selectedMap || 'dark_castle';
        this.mapConfig = (CONFIG.MAPS && CONFIG.MAPS[this.selectedMapId]) ? CONFIG.MAPS[this.selectedMapId] : CONFIG.MAPS.dark_castle;
        
        this.gameTimeSec = 0;
        this.kills = 0;
        this.goldEarned = 0;
        this.gameActive = true;
        this.currentBoss = null;
        this.isHitstopActive = false;
    }

    create() {
        const { WORLD_WIDTH, WORLD_HEIGHT } = CONFIG.GAME;

        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        const floorKey = this.mapConfig.tileFloor || 'tile_floor_castle';
        const floorAltKey = this.mapConfig.tileFloorAlt || 'tile_floor_castle_alt';
        const wallKey = this.mapConfig.tileWall || 'tile_wall_castle';
        const obstacleKey = this.mapConfig.tileObstacle || 'tile_pillar_castle';
        const brazierKey = this.mapConfig.propBrazier || 'prop_brazier_castle';

        // 1. Тайлы пола (Чистый темный фон)
        for (let x = 0; x < WORLD_WIDTH; x += 64) {
            for (let y = 0; y < WORLD_HEIGHT; y += 64) {
                if (x === 0 || y === 0 || x >= WORLD_WIDTH - 64 || y >= WORLD_HEIGHT - 64) {
                    this.add.image(x + 32, y + 32, wallKey).setDepth(1);
                } else {
                    const isAlt = ((x * 17 + y * 11) % 100) < 6;
                    const tileKey = isAlt ? floorAltKey : floorKey;
                    this.add.image(x + 32, y + 32, tileKey).setDepth(1);
                }
            }
        }

        // 2. Препятствия локации
        for (let i = 0; i < 30; i++) {
            const rx = Phaser.Math.Between(160, WORLD_WIDTH - 160);
            const ry = Phaser.Math.Between(160, WORLD_HEIGHT - 160);
            this.add.image(rx, ry, obstacleKey).setDepth(5);
        }
        for (let i = 0; i < 20; i++) {
            const bx = Phaser.Math.Between(140, WORLD_WIDTH - 140);
            const by = Phaser.Math.Between(140, WORLD_HEIGHT - 140);
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

        // Менеджер пулов
        this.poolManager = new PoolManager(this);
        this.dropPool = this.poolManager;

        // Интерактивные бочки
        this.createBarrels(WORLD_WIDTH, WORLD_HEIGHT);

        // Игрок 1 (WASD)
        this.player1 = new Player(this, WORLD_WIDTH / 2 - 80, WORLD_HEIGHT / 2, this.hero1Id, 1);
        this.player = this.player1;
        
        // Игрок 2 (Стрелочки)
        this.player2 = new Player(this, WORLD_WIDTH / 2 + 80, WORLD_HEIGHT / 2, this.hero2Id, 2);

        // Две системы оружия
        this.weaponSystem1 = new WeaponSystem(this, this.player1);
        this.weaponSystem2 = new WeaponSystem(this, this.player2);
        this.weaponSystem = this.weaponSystem1;

        this.waveSpawner = new WaveSpawner(this);
        this.revivalAltars = [];

        // Коллизии снарядов
        this.physics.add.overlap(this.poolManager.projectileGroup, this.poolManager.enemyGroup, (proj, enemy) => {
            if (proj.active && enemy.active) proj.onHitEnemy(enemy);
        });

        // Коллизии с бочками
        this.physics.add.overlap(this.poolManager.projectileGroup, this.barrelGroup, (proj, barrel) => {
            if (proj.active && barrel.active) this.breakBarrel(barrel);
        });

        this.physics.add.overlap([this.player1, this.player2], this.poolManager.enemyGroup, (player, enemy) => {
            if (player.active && enemy.active) player.takeDamage(enemy.damage);
        });

        this.physics.add.overlap([this.player1, this.player2], this.poolManager.enemyBulletGroup, (player, bullet) => {
            if (player.active && bullet.active) {
                player.takeDamage(bullet.damage);
                bullet.expire();
            }
        });

        // Стрелки-указатели
        this.indicatorGraphics = this.add.graphics().setScrollFactor(0).setDepth(90);
        this.indicatorTexts = [];

        // Камера
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        // HUD
        this.createCoopHUD();

        // Обработка поворота экрана и ресайза
        const handleResize = (gameSize) => {
            if (!this.cameras || !this.cameras.main) return;
            this.cameras.main.setSize(gameSize.width, gameSize.height);
            if (typeof this.layoutCoopHUD === 'function') {
                this.layoutCoopHUD(gameSize.width, gameSize.height);
            }
        };
        this.scale.on('resize', handleResize);
        this.events.once('shutdown', () => this.scale.off('resize', handleResize));
        this.events.once('destroy', () => this.scale.off('resize', handleResize));

        // Клавиша ESC для паузы
        this.input.keyboard.on('keydown-ESC', () => this.openPause());

        // Квест на игру в Co-op
        QuestManager.checkProgress(this, 'coop', 1);

        // Плавное появление экрана и боевая музыка
        this.cameras.main.fadeIn(600, 0, 0, 0);
        window.Sound.playBattleBGM();

        // Эффект появления обоих героев
        this.createCoopSpawnEffect(this.player1.x, this.player1.y, 0x38bdf8);
        this.createCoopSpawnEffect(this.player2.x, this.player2.y, 0xa855f7);
    }

    createCoopSpawnEffect(x, y, color = 0x00f5d4) {
        const ring = this.add.circle(x, y, 40, color, 0.7).setDepth(25);
        this.tweens.add({
            targets: ring,
            scale: 2.0,
            alpha: 0,
            duration: 650,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });
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

    createCoopHUD() {
        const { width, height } = this.scale;
        const lang = window.SaveManager.data.lang || 'ru';
        const h1 = CONFIG.HEROES[this.hero1Id] || CONFIG.HEROES.knight;
        const h2 = CONFIG.HEROES[this.hero2Id] || CONFIG.HEROES.archer;

        // Таймер обратного отсчета по центру
        this.timerBg = this.add.rectangle(width / 2, 35, 130, 36, 0x0f172a, 0.85).setScrollFactor(0).setDepth(100);
        this.timerBg.setStrokeStyle(2, 0x38bdf8);
        this.timerIcon = this.add.image(width / 2 - 40, 35, 'ui_clock').setScrollFactor(0).setScale(0.85).setDepth(101);
        this.timerText = this.add.text(width / 2 + 10, 35, '10:00', {
            fontFamily: "'Rajdhani', monospace",
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(101);

        // Игрок 1 (WASD)
        this.p1Header = this.add.text(20, 18, `1P: ${h1.name[lang].toUpperCase()}`, { fontFamily: "'Cinzel', serif", fontSize: '12px', fontStyle: 'bold', color: '#38bdf8' }).setScrollFactor(0).setDepth(101);
        this.p1LvlText = this.add.text(20, 34, 'LVL 1', { fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontStyle: 'bold', color: '#00f5d4' }).setScrollFactor(0).setDepth(101);

        // Игрок 2 (Стрелки)
        this.p2Header = this.add.text(width - 20, 18, `2P: ${h2.name[lang].toUpperCase()}`, { fontFamily: "'Cinzel', serif", fontSize: '12px', fontStyle: 'bold', color: '#a78bfa' }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);
        this.p2LvlText = this.add.text(width - 20, 34, 'LVL 1', { fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontStyle: 'bold', color: '#00f5d4' }).setOrigin(1, 0).setScrollFactor(0).setDepth(101);

        // Общие киллы
        this.killsIcon = this.add.image(width / 2 - 25, 68, 'ui_skull').setScrollFactor(0).setScale(0.75).setDepth(101);
        this.killsText = this.add.text(width / 2 + 5, 68, '0', { fontFamily: "'Rajdhani', sans-serif", fontSize: '15px', fontStyle: 'bold', color: '#f87171' }).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101);

        // Кнопка Паузы
        this.pauseBtn = this.add.rectangle(width / 2 + 95, 35, 34, 34, 0x1e293b, 0.9).setScrollFactor(0).setInteractive({ useHandCursor: true }).setDepth(100);
        this.pauseBtn.setStrokeStyle(1.5, 0x38bdf8);
        this.pauseIcon = this.add.image(width / 2 + 95, 35, 'ui_pause').setScrollFactor(0).setScale(0.8).setDepth(101);
        this.pauseBtn.on('pointerdown', () => this.openPause());

        // Полоса здоровья босса (скрыта по умолчанию)
        this.bossBarBg = this.add.rectangle(width / 2, 95, 360, 16, 0x1f2937, 0.9).setScrollFactor(0).setDepth(100).setVisible(false);
        this.bossBarFill = this.add.rectangle(width / 2 - 175, 95, 350, 12, 0xef4444).setScrollFactor(0).setOrigin(0, 0.5).setDepth(101).setVisible(false);
        this.bossNameText = this.add.text(width / 2, 80, '', {
            fontFamily: "'Cinzel', serif",
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffd166'
        }).setScrollFactor(0).setOrigin(0.5).setDepth(101).setVisible(false);

        // Группы инвентаря
        this.p1InventoryGroup = this.add.group();
        this.p2InventoryGroup = this.add.group();
        this.updateInventoryHUD();
    }

    layoutCoopHUD(width, height) {
        if (!this.timerBg) return;

        this.timerBg.setPosition(width / 2, 35);
        this.timerIcon.setPosition(width / 2 - 40, 35);
        this.timerText.setPosition(width / 2 + 10, 35);

        this.p2Header.setPosition(width - 20, 18);
        this.p2LvlText.setPosition(width - 20, 34);

        this.killsIcon.setPosition(width / 2 - 25, 68);
        this.killsText.setPosition(width / 2 + 5, 68);

        this.pauseBtn.setPosition(width / 2 + 95, 35);
        this.pauseIcon.setPosition(width / 2 + 95, 35);

        if (this.bossBarBg) {
            this.bossBarBg.setPosition(width / 2, 95);
            this.bossBarFill.setPosition(width / 2 - 175, 95);
            this.bossNameText.setPosition(width / 2, 80);
        }

        this.updateInventoryHUD();
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

    getTargetPlayer() {
        return this.getNearestActivePlayer();
    }

    update(time, delta) {
        if (!this.gameActive) return;

        this.gameTimeSec += delta / 1000;
        const remainingSec = Math.max(0, CONFIG.GAME.GAME_DURATION_SEC - Math.floor(this.gameTimeSec));
        const mins = Math.floor(remainingSec / 60);
        const secs = remainingSec % 60;
        this.timerText.setText(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);

        // Обновление уровней в HUD
        if (this.player1 && this.p1LvlText) this.p1LvlText.setText(`LVL ${this.player1.level}`);
        if (this.player2 && this.p2LvlText) this.p2LvlText.setText(`LVL ${this.player2.level}`);

        // Обновление игроков
        if (this.player1 && this.player1.active) this.player1.update(time, delta);
        if (this.player2 && this.player2.active) this.player2.update(time, delta);

        this.weaponSystem1.update(time, delta);
        this.weaponSystem2.update(time, delta);
        this.waveSpawner.update(time, delta);

        // Обновление алтарей воскрешения
        this.updateRevivalAltars(delta);

        // Обновление стрелок-указателей на боссов и сундуки
        this.updateOffscreenIndicators();

        // Обновление полоски здоровья босса
        if (this.currentBoss && this.currentBoss.active) {
            const bossHpPercent = Math.max(0, this.currentBoss.hp / this.currentBoss.maxHp);
            this.bossBarFill.width = 350 * bossHpPercent;
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
            
            // Центрирование камеры
            if (this.player1 && this.player1.active && this.player2 && this.player2.active) {
                const midX = (this.player1.x + this.player2.x) / 2;
                const midY = (this.player1.y + this.player2.y) / 2;
                this.cameras.main.centerOn(midX, midY);
            } else {
                this.cameras.main.centerOn(target.x, target.y);
            }
        } else {
            // Оба погибли
            this.gameActive = false;
            this.physics.pause();
            if (window.Sound) {
                window.Sound.stopBGM();
                window.Sound.playDeath();
            }

            this.cameras.main.flash(500, 255, 255, 255);
            this.cameras.main.shake(500, 0.025);

            const deathVignette = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x880000, 0)
                .setScrollFactor(0)
                .setDepth(200);
            this.tweens.add({ targets: deathVignette, fillAlpha: 0.45, duration: 700 });

            this.time.delayedCall(1300, () => {
                this.cameras.main.fadeOut(600, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
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
            fontFamily: 'sans-serif',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffd166',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(25);

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

    showLevelUpOverlay(player) {
        this.scene.pause();
        this.scene.launch('UpgradeScene', { player: player, sceneKey: 'CoopGameScene' });
        this.scene.bringToTop('UpgradeScene');
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
                // Возврат к боевой музыке после победы над всеми боссами
                this.time.delayedCall(1200, () => {
                    if (this.gameActive) {
                        window.Sound.playBattleBGM();
                    }
                });
            }
        }

        if (enemy.isBoss && enemy.enemyType === 'dark_overlord') {
            // ПОБЕДА!
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
        const alertBg = this.add.rectangle(width / 2, 100, width, 50, 0xef4444, 0.7).setScrollFactor(0);
        const alertTxt = this.add.text(width / 2, 100, 'ВНИМАНИЕ: ПРИБЛИЖАЕТСЯ БОСС!', {
            fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5);

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
        const activeP = this.getNearestActivePlayer() || this.player1;
        const dist = Math.round(Phaser.Math.Distance.Between(activeP.x, activeP.y, targetX, targetY) / 10);
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
                        enemy.takeDamage(damage, Math.random() < critChance, knockback, centerAngle);
                    }
                }
            }
        });
    }

    getClosestEnemy(x, y) {
        let closest = null;
        let minDist = Infinity;
        this.poolManager.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active) {
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
                if (dist <= maxDist) enemies.push({ enemy, dist });
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
            color: '#' + color.toString(16).padStart(6, '0')
        }).setOrigin(0.5);

        this.tweens.add({ targets: txt, y: y - 40, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
    }

    spawnEnemyBullet(x, y, angle, damage) {
        return this.poolManager.spawnEnemyBullet(x, y, angle, damage);
    }

    attractAllGems() {
        this.poolManager.dropGroup.children.iterate((drop) => {
            if (drop && drop.active) drop.attracted = true;
        });
    }

    openChest(isEvolution = 0) {
        const activeP = this.getNearestActivePlayer() || this.player1;
        this.scene.pause();
        this.scene.launch('UpgradeScene', { player: activeP, isChest: true, forceEvolution: isEvolution === 1, sceneKey: 'CoopGameScene' });
        this.scene.bringToTop('UpgradeScene');
    }

    showTsunamiAlert(index, title, subtitle, color = 0x00f5d4) {
        const { width, height } = this.scale;
        
        const waveFlash = this.add.rectangle(width / 2, height / 2, width, height, color, 0.25).setScrollFactor(0);
        this.tweens.add({ targets: waveFlash, alpha: 0, duration: 900, onComplete: () => waveFlash.destroy() });

        const banner = this.add.rectangle(width / 2, height / 2 - 80, width, 84, 0x0f172a, 0.92).setScrollFactor(0);
        banner.setStrokeStyle(3, color);

        const titleText = this.add.text(width / 2, height / 2 - 95, title, {
            fontFamily: 'sans-serif', fontSize: '24px', fontStyle: 'bold',
            color: '#' + color.toString(16).padStart(6, '0'), stroke: '#000000', strokeThickness: 5
        }).setScrollFactor(0).setOrigin(0.5);

        const subText = this.add.text(width / 2, height / 2 - 65, subtitle, {
            fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#ffffff'
        }).setScrollFactor(0).setOrigin(0.5);

        this.tweens.add({
            targets: [banner, titleText, subText], scaleX: 1.04, scaleY: 1.04, duration: 350, yoyo: true, repeat: 3,
            onComplete: () => {
                this.tweens.add({
                    targets: [banner, titleText, subText], alpha: 0, duration: 600,
                    onComplete: () => { banner.destroy(); titleText.destroy(); subText.destroy(); }
                });
            }
        });
    }

    updateGoldHUD() {
        this.goldEarned = (this.player1 ? this.player1.goldCollected : 0) + (this.player2 ? this.player2.goldCollected : 0);
    }

    updateInventoryHUD() {
        if (this.p1InventoryGroup) this.p1InventoryGroup.clear(true, true);
        if (this.p2InventoryGroup) this.p2InventoryGroup.clear(true, true);
        
        // P1 инвентарь (слева под LVL)
        if (this.player1 && this.p1InventoryGroup) {
            let startX = 20;
            let startY = 58;
            Object.entries(this.player1.weapons).forEach(([id, lvl]) => {
                const config = CONFIG.WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 22, 22, 0x0f172a, 0.85).setScrollFactor(0).setDepth(100).setStrokeStyle(1, 0x0284c7);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.45).setScrollFactor(0).setDepth(101);
                this.p1InventoryGroup.add(bg);
                this.p1InventoryGroup.add(icon);
                startX += 26;
            });
            this.player1.superWeapons.forEach(id => {
                const config = CONFIG.SUPER_WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 24, 24, 0x0f172a, 0.9).setScrollFactor(0).setDepth(100).setStrokeStyle(1.5, 0xf59e0b);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.5).setScrollFactor(0).setDepth(101).setTint(0xffd166);
                this.p1InventoryGroup.add(bg);
                this.p1InventoryGroup.add(icon);
                startX += 28;
            });
        }

        // P2 инвентарь (справа под LVL)
        if (this.player2 && this.p2InventoryGroup) {
            let startX = this.scale.width - 20;
            let startY = 58;
            Object.entries(this.player2.weapons).forEach(([id, lvl]) => {
                const config = CONFIG.WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 22, 22, 0x0f172a, 0.85).setScrollFactor(0).setDepth(100).setStrokeStyle(1, 0xa855f7);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.45).setScrollFactor(0).setDepth(101);
                this.p2InventoryGroup.add(bg);
                this.p2InventoryGroup.add(icon);
                startX -= 26;
            });
            this.player2.superWeapons.forEach(id => {
                const config = CONFIG.SUPER_WEAPONS[id];
                if (!config) return;
                const bg = this.add.rectangle(startX, startY, 24, 24, 0x0f172a, 0.9).setScrollFactor(0).setDepth(100).setStrokeStyle(1.5, 0xf59e0b);
                const icon = this.add.image(startX, startY, config.icon).setScale(0.5).setScrollFactor(0).setDepth(101).setTint(0xffd166);
                this.p2InventoryGroup.add(bg);
                this.p2InventoryGroup.add(icon);
                startX -= 28;
            });
        }
    }

    showRedMinuteWarning() {
        const { width, height } = this.scale;
        const alertBg = this.add.rectangle(width / 2, height / 2, width, height, 0xd90429, 0.35).setScrollFactor(0).setDepth(90);
        const alertTxt = this.add.text(width / 2, height / 2, 'КРАСНАЯ МИНУТА: ВЫЖИВАЙТЕ!', {
            fontFamily: 'sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setScrollFactor(0).setOrigin(0.5).setDepth(91);

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
        window.Sound.playSiren();
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
}

window.CoopGameScene = CoopGameScene;
