/**
 * Player Entity - Логика героя, управление, инвентарь оружия/пассивок и прокачка
 */
class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, heroId = 'knight', playerIndex = 1) {
        const heroConfig = CONFIG.HEROES[heroId] || CONFIG.HEROES.knight;
        super(scene, x, y, `hero_${heroId}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.heroId = heroId;
        this.playerIndex = playerIndex;
        this.setDisplaySize(44, 44);
        this.body.setSize(24, 24);
        this.body.setOffset(this.width / 2 - 12, this.height / 2 - 12);
        this.body.setCollideWorldBounds(true);
        this.setDepth(15);

        // Переменные анимации
        this.walkTimer = 0;
        this.dustTimer = 0;
        this.animPhase = Math.random() * 100;
        this.currentWalkFrame = 0;

        // Мягкая динамическая тень под ногами
        this.shadow = scene.add.image(x, y + 16, 'hero_shadow').setDepth(14);

        // Статы с учетом купленных талантов
        this.stats = window.SaveManager.getEffectiveStats(heroId);
        this.hp = this.stats.maxHp;
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = 5;
        this.goldCollected = 0;
        this.kills = 0;
        this.isInvulnerable = false;
        this.invulnTime = 0;
        this.isRaged = false;
        this.rageTimer = 0;
        this.freeRevives = this.stats.freeRevives || 0;

        // Инвентарь
        this.weapons = {}; // { sword: 1 }
        this.passives = {}; // { might: 1 }
        this.superWeapons = []; // ['storm_blade']

        // Добавляем стартовое оружие героя
        this.weapons[heroConfig.weapon] = 1;

        // Управление
        this.initControls();
        
        // Визуальная шкала здоровья над головой
        this.hpBarBg = scene.add.rectangle(x, y - 24, 36, 6, 0x000000, 0.7).setDepth(20);
        this.hpBarFill = scene.add.rectangle(x - 18, y - 24, 36, 4, 0x00f5d4, 1).setDepth(21);
        this.hpBarFill.setOrigin(0, 0.5);
    }

    initControls() {
        const keyboard = this.scene.input.keyboard;
        const isCoop = this.scene.scene.key === 'CoopGameScene';

        if (this.playerIndex === 1) {
            if (isCoop) {
                // В режиме на двоих Игрок 1 управляется ТОЛЬКО WASD
                this.keys = keyboard.addKeys({
                    up: Phaser.Input.Keyboard.KeyCodes.W,
                    down: Phaser.Input.Keyboard.KeyCodes.S,
                    left: Phaser.Input.Keyboard.KeyCodes.A,
                    right: Phaser.Input.Keyboard.KeyCodes.D
                });
            } else {
                // В одиночном режиме доступны и WASD, и Стрелочки
                this.keys = keyboard.addKeys({
                    up: Phaser.Input.Keyboard.KeyCodes.W,
                    down: Phaser.Input.Keyboard.KeyCodes.S,
                    left: Phaser.Input.Keyboard.KeyCodes.A,
                    right: Phaser.Input.Keyboard.KeyCodes.D,
                    upAlt: Phaser.Input.Keyboard.KeyCodes.UP,
                    downAlt: Phaser.Input.Keyboard.KeyCodes.DOWN,
                    leftAlt: Phaser.Input.Keyboard.KeyCodes.LEFT,
                    rightAlt: Phaser.Input.Keyboard.KeyCodes.RIGHT
                });
            }
        } else {
            // Игрок 2 в Co-op управляется ТОЛЬКО Стрелочками
            this.keys = keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT
            });
        }
    }

    update(time, delta) {
        if (!this.active) return;

        this.handleMovement(time, delta);
        this.handleRegen(delta);

        // Обновление позиции тени под ногами
        if (this.shadow) {
            this.shadow.setPosition(this.x, this.y + 16);
        }

        if (this.isInvulnerable) {
            this.invulnTime -= delta;
            this.alpha = (Math.floor(time / 60) % 2 === 0) ? 0.3 : 1.0;
            if (this.invulnTime <= 0) {
                this.isInvulnerable = false;
                this.alpha = 1.0;
            }
        }

        // Таймер действия Зелья Ярости
        if (this.isRaged) {
            this.rageTimer -= delta;
            if (this.rageTimer <= 0) {
                this.isRaged = false;
                this.clearTint();
                this.recalculatePassiveStats();
            }
        }

        // Обновление полоски HP над головой
        this.hpBarBg.setPosition(this.x, this.y - 30);
        this.hpBarFill.setPosition(this.x - 18, this.y - 30);
        const hpPercent = Math.max(0, this.hp / this.stats.maxHp);
        this.hpBarFill.width = 36 * hpPercent;

        // Спецэффект Чумной Ауры и Сверхновой
        this.updateAuraFX(delta);
    }

    handleMovement(time, delta) {
        let vx = 0;
        let vy = 0;

        // Клавиатура
        if (this.keys.left.isDown || (this.keys.leftAlt && this.keys.leftAlt.isDown)) vx -= 1;
        if (this.keys.right.isDown || (this.keys.rightAlt && this.keys.rightAlt.isDown)) vx += 1;
        if (this.keys.up.isDown || (this.keys.upAlt && this.keys.upAlt.isDown)) vy -= 1;
        if (this.keys.down.isDown || (this.keys.downAlt && this.keys.downAlt.isDown)) vy += 1;

        // Экранный тач-джойстик (только для Player 1)
        if (this.playerIndex === 1 && this.scene.joystickVector) {
            if (this.scene.joystickVector.x !== 0 || this.scene.joystickVector.y !== 0) {
                vx = this.scene.joystickVector.x;
                vy = this.scene.joystickVector.y;
            }
        }

        if (vx !== 0 && vy !== 0) {
            const length = Math.sqrt(vx * vx + vy * vy);
            vx /= length;
            vy /= length;
        }

        const currentSpeed = this.stats.speed;
        this.body.setVelocity(vx * currentSpeed, vy * currentSpeed);

        const isMoving = (vx !== 0 || vy !== 0);

        if (isMoving) {
            if (vx < 0) this.flipX = true;
            else if (vx > 0) this.flipX = false;

            this.walkTimer += delta * (currentSpeed / 100);
            this.dustTimer += delta;

            // Смена кадров шагов ходьбы
            const stepCycle = Math.floor(this.walkTimer / 160) % 2;
            const walkTextureKey = `hero_${this.heroId}_walk_${stepCycle}`;
            if (this.scene.textures.exists(walkTextureKey)) {
                if (this.texture.key !== walkTextureKey) this.setTexture(walkTextureKey);
            } else {
                const baseKey = `hero_${this.heroId}`;
                if (this.texture.key !== baseKey) this.setTexture(baseKey);
            }

            // Динамический наклон тела и подпрыгивание при беге
            const bob = Math.abs(Math.sin(this.walkTimer * 0.018)) * 2;
            const tilt = (vx !== 0 ? Math.sign(vx) * 3 : 0) + Math.sin(this.walkTimer * 0.018) * 2;
            this.setAngle(tilt);

            const scalePulse = Math.sin(this.walkTimer * 0.018) * 0.035;
            this.setScale(1.0 + scalePulse, 1.0 - scalePulse);

            // Клубы пыли из-под ног
            if (this.dustTimer > 200) {
                this.dustTimer = 0;
                this.createFootstepDust(vx, vy);
            }

            if (this.shadow) {
                this.shadow.setScale(1.0 - bob * 0.05, 1.0 - bob * 0.05);
            }
        } else {
            // В покое: Idle-дыхание и возврат базовой текстуры
            const baseKey = `hero_${this.heroId}`;
            if (this.texture.key !== baseKey) this.setTexture(baseKey);

            this.animPhase += delta * 0.0035;
            const breath = Math.sin(this.animPhase) * 0.03;
            
            this.setAngle(0);
            this.setScale(1.0 - breath, 1.0 + breath);

            if (this.shadow) {
                this.shadow.setScale(1.0 - breath * 0.4, 1.0 - breath * 0.4);
            }
        }
    }

    createFootstepDust(vx, vy) {
        if (!this.scene || !this.scene.add) return;
        const dustX = this.x - (vx * 10) + (Math.random() - 0.5) * 6;
        const dustY = this.y + 15 + (Math.random() - 0.5) * 4;
        const dust = this.scene.add.circle(dustX, dustY, 2.5 + Math.random() * 1.5, 0x94a3b8, 0.4).setDepth(13);
        this.scene.tweens.add({
            targets: dust,
            scale: 0.2,
            alpha: 0,
            y: dustY - 6,
            duration: 250 + Math.random() * 100,
            ease: 'Cubic.easeOut',
            onComplete: () => dust.destroy()
        });
    }

    handleRegen(delta) {
        if (this.stats.hpRegen > 0 && this.hp < this.stats.maxHp) {
            this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.hpRegen * (delta / 1000));
        }
    }

    takeDamage(amount) {
        if (!this.active || this.isInvulnerable) return;

        const effectiveDamage = Math.max(1, amount - (this.stats.armor || 0));
        this.hp -= effectiveDamage;
        this.isInvulnerable = true;
        this.invulnTime = 400; // 0.4 сек неуязвимости

        window.Sound.playHit();
        this.scene.cameras.main.shake(120, 0.008);

        if (this.hp <= 0) {
            this.hp = 0;
            this.onDeath();
        }
    }

    heal(amount) {
        this.hp = Math.min(this.stats.maxHp, this.hp + amount);
        this.scene.showFloatingText(this.x, this.y - 20, `+${amount} HP`, 0x00f5d4);
    }

    addXp(amount) {
        this.xp += amount;
        if (this.xp >= this.nextLevelXp) {
            this.levelUp();
        }
    }

    levelUp() {
        this.xp -= this.nextLevelXp;
        this.level++;
        this.nextLevelXp = Math.round(this.nextLevelXp * 1.35 + 3);
        window.Sound.playLevelUp();
        this.scene.showLevelUpOverlay(this);
    }

    addGold(amount) {
        this.goldCollected += amount;
        this.scene.updateGoldHUD();
    }

    addWeapon(weaponId) {
        if (this.weapons[weaponId]) {
            this.weapons[weaponId] = Math.min(5, this.weapons[weaponId] + 1);
        } else {
            this.weapons[weaponId] = 1;
        }
        if (this.scene && this.scene.updateInventoryHUD) {
            this.scene.updateInventoryHUD();
        }
    }

    addPassive(passiveId) {
        if (this.passives[passiveId]) {
            this.passives[passiveId] = Math.min(5, this.passives[passiveId] + 1);
        } else {
            this.passives[passiveId] = 1;
        }
        this.recalculatePassiveStats();
        if (this.scene && this.scene.updateInventoryHUD) {
            this.scene.updateInventoryHUD();
        }
    }

    evolveWeapon(weaponId, superId) {
        delete this.weapons[weaponId];
        this.superWeapons.push(superId);
        if (this.scene && this.scene.updateInventoryHUD) {
            this.scene.updateInventoryHUD();
        }
        QuestManager.checkProgress(this.scene, 'evolution', 1);
        window.Sound.playChest();
    }

    activateRage(durationMs = 6000) {
        this.isRaged = true;
        this.rageTimer = durationMs;
        this.setTint(0xff3333);
        this.recalculatePassiveStats();
    }

    recalculatePassiveStats() {
        // Сбрасываем статы до базы героя + мета таланты
        this.stats = window.SaveManager.getEffectiveStats(this.heroId);

        // Применяем коэффициенты от пассивок
        Object.entries(this.passives).forEach(([id, level]) => {
            const config = CONFIG.PASSIVES[id];
            if (!config) return;
            const bonuses = config.bonusPerLevel;
            if (bonuses.damageMulti) this.stats.damageMulti += bonuses.damageMulti * level;
            if (bonuses.speed) this.stats.speed += bonuses.speed * level;
            if (bonuses.magnetRadius) this.stats.magnetRadius += bonuses.magnetRadius * level;
            if (bonuses.maxHp) {
                const addedHp = bonuses.maxHp * level;
                this.stats.maxHp += addedHp;
                this.hp += addedHp;
            }
            if (bonuses.attackSpeedMulti) this.stats.attackSpeedMulti += bonuses.attackSpeedMulti * level;
            if (bonuses.critChance) this.stats.critChance += bonuses.critChance * level;
        });

        // Бонус от Зелья Ярости
        if (this.isRaged) {
            this.stats.attackSpeedMulti += 1.0;
            this.stats.speed = Math.round(this.stats.speed * 1.35);
        }
    }

    updateAuraFX(delta) {
        const hasSuperNova = this.superWeapons.includes('plague_nova');
        const hasAura = (this.weapons && this.weapons.poison_aura > 0);

        if (hasSuperNova || hasAura) {
            const textureKey = hasSuperNova ? 'fx_plague_nova_ring' : 'fx_poison_ring';
            const baseDiameter = hasSuperNova ? 280 : 240;
            
            // Получаем актуальный радиус оружия из конфига
            let currentRadius = 90;
            if (hasSuperNova) {
                currentRadius = (CONFIG.SUPER_WEAPONS && CONFIG.SUPER_WEAPONS.plague_nova) ? CONFIG.SUPER_WEAPONS.plague_nova.radius : 260;
            } else {
                const lvlIdx = Math.min((this.weapons.poison_aura || 1) - 1, 4);
                currentRadius = (CONFIG.WEAPONS && CONFIG.WEAPONS.poison_aura) ? CONFIG.WEAPONS.poison_aura.levels[lvlIdx].radius : 90;
            }

            // Дополнительная светящаяся заливка области ауры
            if (!this.auraGraphics) {
                this.auraGraphics = this.scene.add.graphics().setDepth(4);
            }
            this.auraGraphics.clear();
            this.auraGraphics.setVisible(true);

            // Пульсация
            this.auraPulse = (this.auraPulse || 0) + (delta / 350);
            const pulseRadius = currentRadius + Math.sin(this.auraPulse) * 4;

            if (hasSuperNova) {
                // Сверхновая (Фиолетово-неоновая)
                this.auraGraphics.fillStyle(0x7209b7, 0.18 + Math.sin(this.auraPulse) * 0.05);
                this.auraGraphics.fillCircle(this.x, this.y, pulseRadius);
                this.auraGraphics.lineStyle(3, 0x00f5d4, 0.7);
                this.auraGraphics.strokeCircle(this.x, this.y, pulseRadius);
            } else {
                // Обычная Чумная Аура (Ядовито-зеленая)
                this.auraGraphics.fillStyle(0x38b000, 0.16 + Math.sin(this.auraPulse) * 0.04);
                this.auraGraphics.fillCircle(this.x, this.y, pulseRadius);
                this.auraGraphics.lineStyle(3, 0x70e000, 0.65);
                this.auraGraphics.strokeCircle(this.x, this.y, pulseRadius);
            }

            // Вращающийся спрайт с пузырями
            if (!this.auraSprite) {
                this.auraSprite = this.scene.add.sprite(this.x, this.y, textureKey).setDepth(5);
            } else if (this.auraSprite.texture.key !== textureKey) {
                this.auraSprite.setTexture(textureKey);
            }

            this.auraSprite.setVisible(true);
            this.auraSprite.setPosition(this.x, this.y);
            this.auraSprite.rotation += hasSuperNova ? 0.03 : 0.015;

            const targetScale = (currentRadius * 2) / baseDiameter;
            this.auraSprite.setScale(targetScale);
            this.auraSprite.alpha = 0.85;
        } else {
            if (this.auraSprite) this.auraSprite.setVisible(false);
            if (this.auraGraphics) this.auraGraphics.clear().setVisible(false);
        }
    }

    onDeath() {
        if (this.freeRevives > 0) {
            this.freeRevives--;
            this.hp = Math.round(this.stats.maxHp * 0.6);
            this.isInvulnerable = true;
            this.invulnTime = 2000;
            this.scene.showFloatingText(this.x, this.y - 30, 'ВТОРОЕ ДЫХАНИЕ!', 0xffd166);
            window.Sound.playLevelUp();
            return;
        }

        if (this.auraSprite) {
            this.auraSprite.destroy();
            this.auraSprite = null;
        }
        if (this.auraGraphics) {
            this.auraGraphics.destroy();
            this.auraGraphics = null;
        }
        if (this.shadow) {
            this.shadow.destroy();
            this.shadow = null;
        }

        this.setActive(false);
        this.hpBarBg.destroy();
        this.hpBarFill.destroy();
        this.scene.onPlayerDied(this);
    }
}

window.Player = Player;
