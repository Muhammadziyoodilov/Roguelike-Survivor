/**
 * Weapon System - Управление уникальными авто-атаками, кулдаунами, супер-оружием
 * и уникальными критическими эффектами для КАЖДОГО типа оружия
 */
class WeaponSystem {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.timers = {};
        this.poisonTickTimer = 0;
        this.orbitalBlades = [];
    }

    update(time, delta) {
        if (!this.player || !this.player.active) return;

        const atkSpeedMulti = this.player.stats.attackSpeedMulti || 1.0;

        // Обычные оружия
        Object.entries(this.player.weapons).forEach(([weaponId, level]) => {
            if (!this.timers[weaponId]) this.timers[weaponId] = 0;
            this.timers[weaponId] += delta;

            const config = CONFIG.WEAPONS[weaponId];
            const levelData = config.levels[level - 1];
            const effectiveCooldown = (levelData.cooldown / atkSpeedMulti) * 1000;

            if (this.timers[weaponId] >= effectiveCooldown) {
                this.timers[weaponId] = 0;
                this.fireWeapon(weaponId, levelData);
            }
        });

        // Супер-оружия (Эволюции)
        this.player.superWeapons.forEach((superId) => {
            if (!this.timers[superId]) this.timers[superId] = 0;
            this.timers[superId] += delta;

            const config = CONFIG.SUPER_WEAPONS[superId];
            const effectiveCooldown = (config.cooldown / atkSpeedMulti) * 1000;

            if (this.timers[superId] >= effectiveCooldown) {
                this.timers[superId] = 0;
                this.fireSuperWeapon(superId, config);
            }
        });

        // Постоянная аура яда
        if (this.player.weapons.poison_aura) {
            this.poisonTickTimer += delta;
            if (this.poisonTickTimer >= 350) {
                this.poisonTickTimer = 0;
                const levelData = CONFIG.WEAPONS.poison_aura.levels[this.player.weapons.poison_aura - 1];
                const crit = this.player.stats.critChance;
                const isCrit = Math.random() < crit;
                const dmg = (levelData.damage * this.player.stats.damageMulti) * (isCrit ? 2.0 : 1.0);
                this.scene.damageArea(this.player.x, this.player.y, levelData.radius, dmg, isCrit, true);
            }
        }
    }

    fireWeapon(weaponId, data) {
        const p = this.player;
        const dmgMulti = p.stats.damageMulti;
        const crit = p.stats.critChance;
        const angle = p.flipX ? Math.PI : 0;

        // 1. МЕЧ (Sword) -> Динамическое прицеливание, мгновенный взмах, 360° вихрь на 5 ур.
        if (weaponId === 'sword') {
            const isCrit = Math.random() < crit;
            const finalDamage = (data.damage * dmgMulti) * (isCrit ? 2.2 : 1.0);

            // Ищем ближайшего врага для интеллектуального прицеливания взмаха
            const nearest = this.scene.getClosestEnemy(p.x, p.y);
            let targetAngle = p.flipX ? Math.PI : 0;
            if (nearest && Phaser.Math.Distance.Between(p.x, p.y, nearest.x, nearest.y) <= 350) {
                targetAngle = Phaser.Math.Angle.Between(p.x, p.y, nearest.x, nearest.y);
            }

            // Уровень 5 или круговой вихрь: ПОЛНЫЙ КРУГОВОЙ ВЗМАХ 360° ВОКРУГ ГЕРОЯ!
            if (data.isWhirlwind) {
                window.Sound.playDashSlash();
                const radius = 175 * data.area;
                
                // Вращающийся 360° вихрь
                const whirlwind = this.scene.add.sprite(p.x, p.y, 'fx_whirlwind_360')
                    .setScale(data.area * 1.4)
                    .setTint(isCrit ? 0xffd166 : 0x38bdf8)
                    .setDepth(26);
                whirlwind.rotation = targetAngle;
                
                this.scene.tweens.add({
                    targets: whirlwind,
                    rotation: targetAngle + Math.PI * 2,
                    scale: data.area * 1.8,
                    alpha: 0,
                    duration: 220,
                    onComplete: () => whirlwind.destroy()
                });

                // Радиальные искры по кругу
                for (let i = 0; i < (isCrit ? 12 : 8); i++) {
                    const a = (i * Math.PI * 2) / (isCrit ? 12 : 8);
                    const spk = this.scene.add.circle(p.x, p.y, 3, isCrit ? 0xffd166 : 0x00f5d4).setDepth(27);
                    this.scene.tweens.add({
                        targets: spk,
                        x: p.x + Math.cos(a) * (radius * 0.9),
                        y: p.y + Math.sin(a) * (radius * 0.9),
                        alpha: 0,
                        duration: 250,
                        onComplete: () => spk.destroy()
                    });
                }

                if (isCrit) this.scene.cameras.main.shake(140, 0.01);
                this.scene.damageArea(p.x, p.y, radius, finalDamage, isCrit, false, data.knockback * (isCrit ? 1.6 : 1.2));
            } else {
                // Уровни 1-4: Широкий быстрый взмах клинка (180° - 300°)
                const arcAngle = (data.arc || 0.55) * Math.PI;
                const radius = (120 + (data.area - 1) * 60) * data.area;

                if (isCrit) {
                    // Крит: Рывок вперед + Золотой Мега-Взмах
                    const dashDist = 55;
                    const dx = Math.cos(targetAngle) * dashDist;
                    const dy = Math.sin(targetAngle) * dashDist;
                    const targetX = Phaser.Math.Clamp(p.x + dx, 80, CONFIG.GAME.WORLD_WIDTH - 80);
                    const targetY = Phaser.Math.Clamp(p.y + dy, 80, CONFIG.GAME.WORLD_HEIGHT - 80);

                    // Призрачный шлейф
                    const ghost = this.scene.add.sprite(p.x, p.y, p.texture.key).setAlpha(0.6).setTint(0x38bdf8).setDepth(20);
                    ghost.setFlipX(p.flipX);
                    this.scene.tweens.add({ targets: ghost, alpha: 0, scale: 1.15, duration: 200, onComplete: () => ghost.destroy() });
                    p.x = targetX;
                    p.y = targetY;

                    window.Sound.playDashSlash();
                    this.scene.cameras.main.shake(100, 0.007);

                    const slashX = p.x + Math.cos(targetAngle) * 35;
                    const slashY = p.y + Math.sin(targetAngle) * 35;
                    const slash = this.scene.add.sprite(slashX, slashY, 'fx_slash').setScale(data.area * 1.6).setTint(0xffd166).setDepth(25);
                    slash.rotation = targetAngle;
                    this.scene.tweens.add({
                        targets: slash,
                        scale: data.area * 2.0,
                        alpha: 0,
                        duration: 180,
                        onComplete: () => slash.destroy()
                    });

                    this.scene.damageCone(p.x, p.y, radius * 1.25, targetAngle, finalDamage, 1.0, data.knockback * 1.5, arcAngle * 1.2);
                } else {
                    window.Sound.playSlash();
                    const slashX = p.x + Math.cos(targetAngle) * 28;
                    const slashY = p.y + Math.sin(targetAngle) * 28;
                    const slash = this.scene.add.sprite(slashX, slashY, 'fx_slash').setScale(data.area * 1.25).setDepth(25);
                    slash.rotation = targetAngle;
                    this.scene.tweens.add({
                        targets: slash,
                        scale: data.area * 1.5,
                        alpha: 0,
                        duration: 150,
                        onComplete: () => slash.destroy()
                    });

                    // Для уровней 3-4 делаем двойной взмах (обратный удар)
                    if (data.count >= 2) {
                        this.scene.time.delayedCall(80, () => {
                            if (!p.active) return;
                            const backAngle = targetAngle + Math.PI * 0.85;
                            const slash2 = this.scene.add.sprite(p.x + Math.cos(backAngle) * 25, p.y + Math.sin(backAngle) * 25, 'fx_slash')
                                .setScale(data.area * 1.15)
                                .setTint(0x38bdf8)
                                .setDepth(25);
                            slash2.rotation = backAngle;
                            this.scene.tweens.add({ targets: slash2, scale: data.area * 1.4, alpha: 0, duration: 140, onComplete: () => slash2.destroy() });
                            this.scene.damageCone(p.x, p.y, radius, backAngle, finalDamage * 0.85, 0.0, data.knockback, arcAngle);
                        });
                    }

                    this.scene.damageCone(p.x, p.y, radius, targetAngle, finalDamage, 0.0, data.knockback, arcAngle);
                }
            }
        }
        // 2. ЛУК (Bow) -> Крит: Сверхзвуковые стрелы с пробитием и лазерным лучом
        else if (weaponId === 'bow') {
            const targets = this.scene.getClosestEnemies(p.x, p.y, data.count, 600);
            targets.forEach((target, i) => {
                this.scene.time.delayedCall(i * 60, () => {
                    if (!p.active) return;
                    window.Sound.playShoot();
                    const arrowAngle = target ? Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y) : (p.flipX ? Math.PI : 0);
                    this.scene.poolManager.spawnProjectile(p.x, p.y, arrowAngle, {
                        type: 'arrow',
                        damage: data.damage * dmgMulti,
                        critChance: crit,
                        speed: data.speed,
                        pierce: data.pierce
                    });
                });
            });
        }
        // 3. ФАЕРБОЛ (Fireball) -> Крит: Пылающая сфера x2 + огненная ударная волна
        else if (weaponId === 'fireball') {
            const target = this.scene.getClosestEnemy(p.x, p.y);
            for (let i = 0; i < data.count; i++) {
                this.scene.time.delayedCall(i * 120, () => {
                    if (!p.active) return;
                    window.Sound.playShoot();
                    const fbAngle = target ? Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y) + (i - (data.count - 1)/2) * 0.2 : Math.random() * Math.PI * 2;
                    this.scene.poolManager.spawnProjectile(p.x, p.y, fbAngle, {
                        type: 'fireball',
                        damage: data.damage * dmgMulti,
                        critChance: crit,
                        speed: data.speed,
                        radius: data.radius
                    });
                });
            }
        }
        // 4. СЮРИКЕН (Shuriken) -> Крит: Гигантский вихревой сюрикен + веер мини-лезвий
        else if (weaponId === 'shuriken') {
            for (let i = 0; i < data.count; i++) {
                const shAngle = (Math.PI * 2 / data.count) * i + Math.random() * 0.3;
                this.scene.poolManager.spawnProjectile(p.x, p.y, shAngle, {
                    type: 'shuriken',
                    damage: data.damage * dmgMulti,
                    critChance: crit,
                    speed: data.speed,
                    bounces: data.bounces,
                    pierce: 99
                });
            }
            window.Sound.playShoot();
        }
        // 5. МОЛНИЯ (Lightning) -> Крит: Мега-разряд с неба + Звук ШАНДАРААХ + Электрический кратер + Цепные молнии
        else if (weaponId === 'lightning') {
            const targets = this.scene.getRandomEnemies(p.x, p.y, data.count, 550);
            targets.forEach((target) => {
                const isCrit = Math.random() < crit;
                if (isCrit) {
                    window.Sound.playThunderCrit();
                    this.scene.cameras.main.shake(160, 0.012);

                    // Мега-разряд с неба
                    const bolt = this.scene.add.sprite(target.x, target.y - 120, 'proj_lightning').setScale(2.5, 3.8).setTint(0x38bdf8).setDepth(30);
                    this.scene.tweens.add({ targets: bolt, alpha: 0, duration: 280, onComplete: () => bolt.destroy() });

                    // Электрический кратер и взрывная волна
                    const circle = this.scene.add.circle(target.x, target.y, 25, 0x00f5d4, 0.75).setDepth(29);
                    this.scene.tweens.add({ targets: circle, radius: 180, alpha: 0, duration: 320, onComplete: () => circle.destroy() });

                    // Искры цепных молний
                    for (let i = 0; i < 8; i++) {
                        const spark = this.scene.add.circle(target.x, target.y, 3, 0xffffff).setDepth(31);
                        const spkAngle = Math.random() * Math.PI * 2;
                        this.scene.tweens.add({
                            targets: spark,
                            x: target.x + Math.cos(spkAngle) * 85,
                            y: target.y + Math.sin(spkAngle) * 85,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => spark.destroy()
                        });
                    }

                    target.takeDamage(data.damage * dmgMulti * 2.5, true);
                    this.scene.damageArea(target.x, target.y, 180, data.damage * dmgMulti * 1.5, true);
                } else {
                    window.Sound.playShoot();
                    this.scene.poolManager.spawnProjectile(target.x, target.y - 25, 0, {
                        type: 'lightning',
                        damage: data.damage * dmgMulti,
                        critChance: 0
                    });
                    target.takeDamage(data.damage * dmgMulti, false);
                }
            });
        }
        // 6. ЧУМНАЯ АУРА (Poison Aura) -> Крит: Токсичный разрыв (Toxic Rupture) + брызги кислоты
        else if (weaponId === 'poison_aura') {
            const isCrit = Math.random() < crit;
            const finalDmg = (data.damage * dmgMulti) * (isCrit ? 2.0 : 1.0);
            this.scene.damageArea(p.x, p.y, data.radius * (isCrit ? 1.3 : 1.0), finalDmg, isCrit, true);
            
            if (isCrit) {
                const pulse = this.scene.add.sprite(p.x, p.y, 'fx_toxic_pulse').setTint(0x70e000).setDepth(15);
                pulse.setScale((data.radius * 2) / 200 * 1.1);
                pulse.alpha = 1.0;
                this.scene.tweens.add({
                    targets: pulse,
                    scale: (data.radius * 2) / 200 * 1.6,
                    alpha: 0,
                    duration: 320,
                    onComplete: () => pulse.destroy()
                });

                for (let i = 0; i < 10; i++) {
                    const drop = this.scene.add.circle(p.x, p.y, 4, 0x38b000).setDepth(16);
                    const dropAngle = Math.random() * Math.PI * 2;
                    this.scene.tweens.add({
                        targets: drop,
                        x: p.x + Math.cos(dropAngle) * (data.radius * 1.1),
                        y: p.y + Math.sin(dropAngle) * (data.radius * 1.1),
                        alpha: 0,
                        duration: 350,
                        onComplete: () => drop.destroy()
                    });
                }
            } else {
                const pulse = this.scene.add.sprite(p.x, p.y, 'fx_toxic_pulse').setDepth(15);
                pulse.setScale((data.radius * 2) / 200 * 0.85);
                pulse.alpha = 0.8;
                this.scene.tweens.add({
                    targets: pulse,
                    scale: (data.radius * 2) / 200 * 1.15,
                    alpha: 0,
                    duration: 240,
                    onComplete: () => pulse.destroy()
                });
            }
        }
    }

    fireSuperWeapon(superId, config) {
        const p = this.player;
        const dmgMulti = p.stats.damageMulti;
        const crit = p.stats.critChance;

        if (superId === 'storm_blade') {
            const isCrit = Math.random() < crit;
            const finalDamage = (config.damage * dmgMulti) * (isCrit ? 2.5 : 1.0);
            const stormRadius = 210 * config.area;

            window.Sound.playDashSlash();

            // 360° Штормовой циклон вокруг героя
            const storm = this.scene.add.sprite(p.x, p.y, 'fx_storm_blade')
                .setScale(config.area * 1.1)
                .setTint(isCrit ? 0xffd166 : 0x00f5d4)
                .setDepth(26);
            storm.rotation = Math.random() * Math.PI * 2;
            
            this.scene.tweens.add({
                targets: storm,
                rotation: storm.rotation + Math.PI * 1.5,
                scale: config.area * 1.4,
                alpha: 0,
                duration: 200,
                onComplete: () => storm.destroy()
            });

            // Электрические дуги и удары молний по 3-5 случайным целям
            const nearby = this.scene.getRandomEnemies(p.x, p.y, isCrit ? 5 : 3, stormRadius);
            nearby.forEach(e => {
                const bolt = this.scene.add.sprite(e.x, e.y - 40, 'proj_lightning').setScale(1.2, 1.8).setTint(0x38bdf8).setDepth(28);
                this.scene.tweens.add({ targets: bolt, alpha: 0, duration: 180, onComplete: () => bolt.destroy() });
                e.takeDamage(finalDamage * 0.5, isCrit, config.knockback * 1.5);
            });

            if (isCrit) {
                this.scene.cameras.main.shake(120, 0.009);
                window.Sound.playThunderCrit();
            }

            this.scene.damageArea(p.x, p.y, stormRadius, finalDamage, isCrit, false, config.knockback * 1.6);
        }
        else if (superId === 'endless_barrage') {
            for (let i = 0; i < config.count; i++) {
                this.scene.time.delayedCall(i * 35, () => {
                    if (!p.active) return;
                    window.Sound.playShoot();
                    const target = this.scene.getClosestEnemy(p.x, p.y);
                    const baseAngle = target ? Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y) : (p.flipX ? Math.PI : 0);
                    const angle = baseAngle + (Math.random() - 0.5) * 0.3;
                    this.scene.poolManager.spawnProjectile(p.x, p.y, angle, {
                        type: 'super_arrow',
                        damage: config.damage * dmgMulti,
                        critChance: crit,
                        speed: config.speed,
                        pierce: config.pierce
                    });
                });
            }
        }
        else if (superId === 'meteor') {
            for (let i = 0; i < config.count; i++) {
                this.scene.time.delayedCall(i * 150, () => {
                    const target = this.scene.getRandomEnemy(p.x, p.y, 600);
                    const spawnX = target ? target.x : p.x + (Math.random() - 0.5) * 400;
                    const spawnY = target ? target.y : p.y + (Math.random() - 0.5) * 400;
                    
                    this.scene.poolManager.spawnProjectile(spawnX, spawnY - 300, Math.PI / 2, {
                        type: 'meteor',
                        damage: config.damage * dmgMulti,
                        critChance: crit,
                        speed: 700,
                        radius: config.radius
                    });
                });
            }
        }
        else if (superId === 'blade_vortex') {
            for (let i = 0; i < config.count; i++) {
                const angle = (Math.PI * 2 / config.count) * i;
                this.scene.poolManager.spawnProjectile(p.x, p.y, angle, {
                    type: 'super_shuriken',
                    damage: config.damage * dmgMulti,
                    critChance: crit,
                    speed: config.speed,
                    bounces: config.bounces,
                    pierce: 99
                });
            }
        }
        else if (superId === 'zeus_wrath') {
            const targets = this.scene.getRandomEnemies(p.x, p.y, config.count, 700);
            targets.forEach((target) => {
                const isCrit = Math.random() < crit;
                if (isCrit) {
                    window.Sound.playThunderCrit();
                    this.scene.cameras.main.shake(180, 0.015);

                    const bolt = this.scene.add.sprite(target.x, target.y - 120, 'proj_lightning').setScale(3.0, 4.2).setTint(0x00f5d4).setDepth(30);
                    this.scene.tweens.add({ targets: bolt, alpha: 0, duration: 280, onComplete: () => bolt.destroy() });

                    const circle = this.scene.add.circle(target.x, target.y, 30, 0x38bdf8, 0.8).setDepth(29);
                    this.scene.tweens.add({ targets: circle, radius: 220, alpha: 0, duration: 350, onComplete: () => circle.destroy() });

                    target.takeDamage(config.damage * dmgMulti * 2.5, true);
                    this.scene.damageArea(target.x, target.y, 220, config.damage * dmgMulti * 1.6, true);
                } else {
                    window.Sound.playShoot();
                    this.scene.poolManager.spawnProjectile(target.x, target.y - 25, 0, {
                        type: 'lightning',
                        damage: config.damage * dmgMulti,
                        critChance: 0
                    });
                    target.takeDamage(config.damage * dmgMulti, false);
                }
            });
        }
        else if (superId === 'plague_nova') {
            const isCrit = Math.random() < crit;
            const finalDmg = (config.damage * dmgMulti) * (isCrit ? 2.2 : 1.0);
            this.scene.damageArea(p.x, p.y, config.radius * (isCrit ? 1.25 : 1.0), finalDmg, isCrit, true, 220);
            
            const pulse = this.scene.add.sprite(p.x, p.y, 'fx_toxic_pulse').setTint(isCrit ? 0xff0054 : 0x00f5d4).setDepth(16);
            pulse.setScale((config.radius * 2) / 200 * (isCrit ? 1.1 : 0.85));
            pulse.alpha = 1.0;
            this.scene.tweens.add({
                targets: pulse,
                scale: (config.radius * 2) / 200 * (isCrit ? 1.6 : 1.25),
                alpha: 0,
                duration: 300,
                onComplete: () => pulse.destroy()
            });
        }
    }

    updatePlayerWeapons() {}
}

window.WeaponSystem = WeaponSystem;
