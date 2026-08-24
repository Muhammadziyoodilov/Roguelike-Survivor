/**
 * Enemy Entity - Монстры, элита и боссы с AI преследования и уникальными атаками
 */
class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'enemy_slime');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(10);
        this.active = false;
        this.visible = false;
        this.enemyType = 'slime';
        this.hp = 10;
        this.maxHp = 10;
        this.damage = 5;
        this.speed = 80;
        this.xpValue = 1;
        this.goldChance = 0.05;
        this.isBoss = false;
        this.isExplosive = false;
        this.isRanged = false;
        this.shootTimer = 0;
        this.knockbackTime = 0;
        this.animTimer = 0;
    }

    spawn(x, y, typeId, multiplier = 1.0) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(10);
        this.enemyType = typeId;
        this.animTimer = Math.random() * 100;
        
        const isBoss = CONFIG.BOSSES[typeId] !== undefined;
        const config = isBoss ? CONFIG.BOSSES[typeId] : (CONFIG.ENEMIES[typeId] || CONFIG.ENEMIES.slime);
        
        this.isBoss = isBoss;
        this.setTexture(isBoss ? `boss_${typeId}` : `enemy_${typeId}`);
        
        // Масштабирование характеристик со временем
        this.maxHp = Math.round(config.hp * multiplier);
        this.hp = this.maxHp;
        this.damage = Math.round(config.damage * (1 + (multiplier - 1) * 0.5));
        this.speed = config.speed;
        this.xpValue = config.xp || (isBoss ? 50 : 1);
        this.goldChance = config.goldChance !== undefined ? config.goldChance : (isBoss ? 1.0 : 0.08);
        this.isExplosive = !!config.isExplosive;
        this.isRanged = !!config.isRanged;
        this.isEnraged = false;
        this.isFrozen = false;
        this.freezeTimer = 0;
        this.shootTimer = 0;
        this.knockbackTime = 0;

        this.body.setCircle(config.size / 2);
        this.setScale(1.0);
        this.clearTint();
        this.body.reset(x, y);
    }

    update(time, delta, targetPlayer) {
        if (!this.active || !targetPlayer || !targetPlayer.active) return;

        this.animTimer += delta * 0.008;

        // Если монстр заморожен
        if (this.isFrozen) {
            this.freezeTimer -= delta;
            this.body.setVelocity(0, 0);
            if (this.freezeTimer <= 0) {
                this.isFrozen = false;
                this.clearTint();
            }
            return;
        }

        // Если в нокдауне от удара меча
        if (this.knockbackTime > 0) {
            this.knockbackTime -= delta;
            return;
        }

        const dist = Phaser.Math.Distance.Between(this.x, this.y, targetPlayer.x, targetPlayer.y);
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetPlayer.x, targetPlayer.y);

        this.flipX = targetPlayer.x < this.x;
        this.setScale(1.0);
        this.setAngle(0);

        if (this.isRanged && dist < 320 && dist > 140) {
            this.body.setVelocity(0, 0);
            this.shootTimer += delta;
            if (this.shootTimer > 2200) {
                this.shootTimer = 0;
                if (this.scene.spawnEnemyBullet) {
                    this.scene.spawnEnemyBullet(this.x, this.y, angle, this.damage);
                } else if (this.scene.poolManager) {
                    this.scene.poolManager.spawnEnemyBullet(this.x, this.y, angle, this.damage);
                }
            }
        } else {
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        }

        if (this.isExplosive && dist < 35) {
            targetPlayer.takeDamage(this.damage);
            this.die(false);
        }
    }

    freeze(durationMs = 4500) {
        if (!this.active || this.isBoss) return;
        this.isFrozen = true;
        this.freezeTimer = durationMs;
        this.setTint(0x67e8f9); // ледяной голубой
    }

    takeDamage(amount, isCrit = false, knockback = 0, sourceAngle = 0) {
        if (!this.active) return;

        this.hp -= amount;

        // Всплывающие стилизованные цифры урона
        this.scene.showDamageText(this.x, this.y - 15, Math.round(amount), isCrit);
        window.Sound.playHit();

        // Hitstop (микро-замирание при критах для сочности)
        if (isCrit && this.scene.triggerHitstop) {
            this.scene.triggerHitstop(45);
        }

        // Фаза ярости у боссов при HP < 30%
        if (this.isBoss && !this.isEnraged && (this.hp / this.maxHp <= 0.3)) {
            this.isEnraged = true;
            this.speed = Math.round(this.speed * 1.35);
            this.damage = Math.round(this.damage * 1.25);
            this.scene.showFloatingText(this.x, this.y - 45, '[ ФАЗА ЯРОСТИ! ]', 0xef4444);
            this.scene.cameras.main.shake(350, 0.018);
            window.Sound.playBossWarning();
        }

        // Нокбек от оружия
        if (knockback > 0 && !this.isBoss) {
            this.knockbackTime = 120;
            this.scene.physics.velocityFromRotation(sourceAngle, knockback, this.body.velocity);
        }

        // Hit Flash (белая вспышка на 60мс)
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(60, () => {
            if (this.active) {
                if (this.isEnraged) this.setTint(0xff3333);
                else if (this.isFrozen) this.setTint(0x67e8f9);
                else this.clearTint();
            }
        });

        if (this.hp <= 0) {
            this.die(true);
        }
    }

    die(dropLoot = true) {
        if (!this.active) return;
        this.setActive(false);
        this.setVisible(false);
        this.body.setVelocity(0, 0);

        this.scene.onEnemyKilled(this);

        // Оставляем следы на полу (декали)
        if (Math.random() < 0.35 && !this.isBoss) {
            const decalKey = (this.enemyType === 'slime') ? 'fx_slime_splat' : 'fx_blood_splat';
            const decal = this.scene.add.image(this.x, this.y, decalKey).setDepth(1);
            this.scene.time.delayedCall(3500, () => {
                this.scene.tweens.add({
                    targets: decal,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => decal.destroy()
                });
            });
        }

        // Эпическая смерть босса: золотая ударная волна и фонтан искр
        if (this.isBoss) {
            if (this.scene.triggerHitstop) this.scene.triggerHitstop(80);
            this.scene.cameras.main.shake(400, 0.02);

            // Расходящаяся золотая ударная волна
            const shockwave = this.scene.add.circle(this.x, this.y, 20, 0xffd166, 0.7).setDepth(8);
            this.scene.tweens.add({
                targets: shockwave,
                radius: 220,
                alpha: 0,
                duration: 500,
                onComplete: () => shockwave.destroy()
            });

            // Фонтан золотых искр
            for (let i = 0; i < 20; i++) {
                const spark = this.scene.add.rectangle(this.x, this.y, 5, 5, 0xffd166).setDepth(9);
                const angle = Math.random() * Math.PI * 2;
                const spd = Phaser.Math.Between(100, 260);
                this.scene.tweens.add({
                    targets: spark,
                    x: spark.x + Math.cos(angle) * spd,
                    y: spark.y + Math.sin(angle) * spd,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => spark.destroy()
                });
            }
        }

        if (dropLoot) {
            // Спавн кристаллов опыта
            let gemType = 'gem_small';
            let gemVal = this.xpValue || 1;
            if (this.xpValue >= 20) {
                gemType = 'gem_large';
                gemVal = this.xpValue;
            } else if (this.xpValue >= 4) {
                gemType = 'gem_med';
                gemVal = this.xpValue;
            }
            this.scene.poolManager.spawnDrop(this.x, this.y, gemType, gemVal);

            // Дроп золотых монет
            if (Math.random() < this.goldChance) {
                const coinAmount = this.isBoss ? Phaser.Math.Between(50, 150) : Phaser.Math.Between(3, 10);
                this.scene.poolManager.spawnDrop(this.x + Phaser.Math.Between(-15, 15), this.y + Phaser.Math.Between(-15, 15), 'pickup_coin', coinAmount);
            }

            const r = Math.random();
            if (r < 0.015) {
                this.scene.poolManager.spawnDrop(this.x - 10, this.y, 'pickup_potion', 35);
            } else if (r < 0.025) {
                this.scene.poolManager.spawnDrop(this.x - 10, this.y, 'pickup_magnet', 1);
            }

            // Дроп сундука с босса
            if (this.isBoss) {
                const config = CONFIG.BOSSES[this.enemyType];
                this.scene.poolManager.spawnDrop(this.x, this.y, 'pickup_chest', config && config.hasEvolutionChest ? 1 : 0);
            }
        }
    }
}

window.Enemy = Enemy;
