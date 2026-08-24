/**
 * Projectile Entity - Снаряды, стрелы, фаерболы, сюрикены, молнии и орбитальные вихри
 * с уникальными визуальными и физическими эффектами критических ударов
 */
class Projectile extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'proj_arrow');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(20);
        this.active = false;
        this.visible = false;
        this.damage = 10;
        this.critChance = 0.05;
        this.isCritShot = false;
        this.speed = 400;
        this.pierce = 1;
        this.bounces = 0;
        this.lifespan = 2000;
        this.hitEnemies = new Set();
        this.projType = 'arrow';
        this.target = null;
        this.orbitRadius = 0;
        this.orbitAngle = 0;
        this.player = null;
        this.trailTimer = 0;
    }

    fire(x, y, angle, options = {}) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.setDepth(20);
        this.hitEnemies.clear();
        this.clearTint();

        this.projType = options.type || 'arrow';
        this.damage = options.damage || 15;
        this.critChance = options.critChance || 0.05;
        this.speed = options.speed || 450;
        this.pierce = options.pierce || 1;
        this.bounces = options.bounces || 0;
        this.radius = options.radius || 30;
        this.lifespan = options.lifespan || 2500;
        this.player = options.player || null;
        this.orbitRadius = options.orbitRadius || 0;
        this.orbitAngle = options.orbitAngle || 0;
        this.trailTimer = 0;

        // Расчет критического выстрела на старте
        this.isCritShot = Math.random() < this.critChance;

        // Настройка визуала и физики
        if (this.projType === 'arrow' || this.projType === 'super_arrow') {
            this.setTexture('proj_arrow');
            const baseScale = (this.projType === 'super_arrow' ? 1.5 : 1.0);
            this.setScale(this.isCritShot ? baseScale * 1.6 : baseScale);
            if (this.isCritShot) {
                this.setTint(0xffd166); // Золотая горящая стрела
                this.pierce += 4;       // Пробивает сквозь толпу
                this.speed *= 1.25;     // Сверхзвуковая скорость
            }
            this.rotation = angle;
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        } else if (this.projType === 'fireball' || this.projType === 'meteor') {
            this.setTexture('proj_fireball');
            const baseScale = (this.projType === 'meteor' ? 2.5 : 1.2);
            this.setScale(this.isCritShot ? baseScale * 1.8 : baseScale);
            if (this.isCritShot) {
                this.setTint(0xff3300);
                this.radius *= 1.75;
            }
            this.rotation = angle;
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        } else if (this.projType === 'shuriken' || this.projType === 'super_shuriken') {
            this.setTexture('proj_shuriken');
            const baseScale = (this.projType === 'super_shuriken' ? 2.0 : 1.2);
            this.setScale(this.isCritShot ? baseScale * 1.6 : baseScale);
            if (this.isCritShot) {
                this.setTint(0xa855f7); // Фиолетово-неоновое свечение
            }
            this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
        } else if (this.projType === 'orbital_blade') {
            this.setTexture('fx_slash');
            this.setScale(options.isSuper ? 1.8 : 1.2);
            this.body.setVelocity(0, 0);
        } else if (this.projType === 'lightning') {
            this.setTexture('proj_lightning');
            this.setScale(1.5);
            this.body.setVelocity(0, 0);
            this.lifespan = 250;
        }
    }

    update(time, delta) {
        if (!this.active) return;

        this.lifespan -= delta;
        if (this.lifespan <= 0) {
            this.expire();
            return;
        }

        // Шлейф частиц для крит-стрел и фаерболов
        if (this.isCritShot && (this.projType.includes('arrow') || this.projType.includes('fireball') || this.projType.includes('meteor'))) {
            this.trailTimer += delta;
            if (this.trailTimer >= 60) {
                this.trailTimer = 0;
                const spark = this.scene.add.circle(this.x, this.y, 3, this.projType.includes('arrow') ? 0xffd166 : 0xff7700).setDepth(22);
                this.scene.tweens.add({
                    targets: spark,
                    alpha: 0,
                    scale: 0.2,
                    duration: 200,
                    onComplete: () => spark.destroy()
                });
            }
        }

        // Вращение для сюрикенов
        if (this.projType.includes('shuriken')) {
            this.rotation += this.isCritShot ? 0.45 : 0.25;
        }

        // Орбитальное движение вокруг героя
        if (this.projType === 'orbital_blade' && this.player && this.player.active) {
            this.orbitAngle += delta * 0.005;
            this.x = this.player.x + Math.cos(this.orbitAngle) * this.orbitRadius;
            this.y = this.player.y + Math.sin(this.orbitAngle) * this.orbitRadius;
            this.rotation = this.orbitAngle + Math.PI / 2;
        }
    }

    onHitEnemy(enemy) {
        if (!this.active || this.hitEnemies.has(enemy)) return;
        this.hitEnemies.add(enemy);

        const isCrit = this.isCritShot || (Math.random() < this.critChance);
        const finalDamage = isCrit ? this.damage * 2.2 : this.damage;

        // 1. Фаербол и Метеорит -> Взрыв по площади
        if (this.projType === 'fireball' || this.projType === 'meteor') {
            this.explode(finalDamage, isCrit);
            return;
        }

        // 2. Стрела (Лук) -> Крит искры
        if (this.projType.includes('arrow') && isCrit) {
            for (let i = 0; i < 5; i++) {
                const spk = this.scene.add.circle(enemy.x, enemy.y, 2.5, 0xffd166).setDepth(26);
                const a = Math.random() * Math.PI * 2;
                this.scene.tweens.add({
                    targets: spk,
                    x: enemy.x + Math.cos(a) * 45,
                    y: enemy.y + Math.sin(a) * 45,
                    alpha: 0,
                    duration: 220,
                    onComplete: () => spk.destroy()
                });
            }
        }

        // 3. Сюрикен -> Крит: Blade Burst (Взрыв микро-лезвий вокруг цели)
        if (this.projType.includes('shuriken') && isCrit) {
            for (let i = 0; i < 4; i++) {
                const blade = this.scene.add.sprite(enemy.x, enemy.y, 'proj_shuriken').setScale(0.7).setTint(0x00f5d4).setDepth(25);
                const burstAngle = (Math.PI * 2 / 4) * i;
                this.scene.tweens.add({
                    targets: blade,
                    x: enemy.x + Math.cos(burstAngle) * 75,
                    y: enemy.y + Math.sin(burstAngle) * 75,
                    rotation: blade.rotation + 4,
                    alpha: 0,
                    duration: 260,
                    onComplete: () => blade.destroy()
                });
            }
            this.scene.damageArea(enemy.x, enemy.y, 85, this.damage * 0.6, false);
        }

        enemy.takeDamage(finalDamage, isCrit);

        // Рикошет для сюрикенов
        if (this.bounces > 0) {
            this.bounces--;
            const nextTarget = this.scene.getClosestEnemy(this.x, this.y, enemy);
            if (nextTarget) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, nextTarget.x, nextTarget.y);
                this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
                return;
            }
        }

        // Пронзание (pierce)
        this.pierce--;
        if (this.pierce <= 0 && this.projType !== 'orbital_blade') {
            this.expire();
        }
    }

    explode(damage, isCrit) {
        this.scene.damageArea(this.x, this.y, this.radius, damage, isCrit, false, isCrit ? 260 : 120);
        window.Sound.playExplosion();

        if (isCrit) {
            this.scene.cameras.main.shake(150, 0.01);

            // Двойная огненная ударная волна
            const outerBoom = this.scene.add.circle(this.x, this.y, 15, 0xff0054, 0.65).setDepth(24);
            this.scene.tweens.add({
                targets: outerBoom,
                radius: this.radius * 1.15,
                alpha: 0,
                duration: 280,
                onComplete: () => outerBoom.destroy()
            });

            const innerBoom = this.scene.add.circle(this.x, this.y, 10, 0xffd166, 0.85).setDepth(25);
            this.scene.tweens.add({
                targets: innerBoom,
                radius: this.radius * 0.75,
                alpha: 0,
                duration: 220,
                onComplete: () => innerBoom.destroy()
            });
        } else {
            const boom = this.scene.add.circle(this.x, this.y, 10, 0xff7700, 0.7).setDepth(24);
            this.scene.tweens.add({
                targets: boom,
                radius: this.radius,
                alpha: 0,
                duration: 200,
                onComplete: () => boom.destroy()
            });
        }

        this.expire();
    }

    expire() {
        this.setActive(false);
        this.setVisible(false);
        this.body.setVelocity(0, 0);
    }
}

window.Projectile = Projectile;
