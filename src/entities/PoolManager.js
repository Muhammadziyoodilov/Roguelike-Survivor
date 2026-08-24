/**
 * Pool Manager - Высокопроизводительный пул объектов для 60 FPS
 */
class PoolManager {
    constructor(scene) {
        this.scene = scene;

        // Пул монстров
        this.enemyGroup = scene.physics.add.group({
            classType: Enemy,
            maxSize: 350,
            runChildUpdate: false
        });

        // Пул снарядов игрока
        this.projectileGroup = scene.physics.add.group({
            classType: Projectile,
            maxSize: 250,
            runChildUpdate: false
        });

        // Пул предметов (кристаллы, монеты)
        this.dropGroup = scene.physics.add.group({
            classType: DropItem,
            maxSize: 400,
            runChildUpdate: false
        });

        // Пул снарядов врагов
        this.enemyBulletGroup = scene.physics.add.group({
            classType: Projectile,
            maxSize: 100,
            runChildUpdate: false
        });
    }

    spawnEnemy(x, y, typeId, multiplier = 1.0) {
        let enemy = this.enemyGroup.getFirstDead(false);
        if (!enemy) {
            enemy = new Enemy(this.scene);
            this.enemyGroup.add(enemy);
        }
        enemy.spawn(x, y, typeId, multiplier);
        return enemy;
    }

    spawnProjectile(x, y, angle, options) {
        let proj = this.projectileGroup.getFirstDead(false);
        if (!proj) {
            proj = new Projectile(this.scene);
            this.projectileGroup.add(proj);
        }
        proj.fire(x, y, angle, options);
        return proj;
    }

    spawnDrop(x, y, type, value) {
        let item = this.dropGroup.getFirstDead(false);
        if (!item) {
            item = new DropItem(this.scene);
            this.dropGroup.add(item);
        }
        item.spawn(x, y, type, value);
        return item;
    }

    spawn(x, y, type, value) {
        return this.spawnDrop(x, y, type, value);
    }

    spawnEnemyBullet(x, y, angle, damage) {
        let bullet = this.enemyBulletGroup.getFirstDead(false);
        if (!bullet) {
            bullet = new Projectile(this.scene);
            this.enemyBulletGroup.add(bullet);
        }
        bullet.fire(x, y, angle, {
            type: 'fireball',
            damage: damage,
            speed: 240,
            lifespan: 3000
        });
        return bullet;
    }

    updateAll(time, delta, player) {
        // Обновление живых монстров
        this.enemyGroup.children.iterate((enemy) => {
            if (enemy && enemy.active) {
                enemy.update(time, delta, player);
            }
        });

        // Обновление снарядов
        this.projectileGroup.children.iterate((proj) => {
            if (proj && proj.active) {
                proj.update(time, delta);
            }
        });

        // Обновление снарядов врагов
        this.enemyBulletGroup.children.iterate((bullet) => {
            if (bullet && bullet.active) {
                bullet.update(time, delta);
            }
        });

        // Обновление дропа
        this.dropGroup.children.iterate((drop) => {
            if (drop && drop.active) {
                drop.update(time, delta, player);
            }
        });
    }
}

window.PoolManager = PoolManager;
