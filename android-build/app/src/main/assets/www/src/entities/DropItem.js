/**
 * Drop Item Entity - Кристаллы опыта, монеты, сундуки, зелья и магниты
 */
class DropItem extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'gem_small');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setDepth(8);
        this.body.setCircle(10);
        this.active = false;
        this.visible = false;
        this.itemType = 'gem_small';
        this.value = 1;
        this.attracted = false;
        this.speed = 0;
        this.baseY = 0;
        this.floatOffset = 0;
    }

    spawn(x, y, type, value = 1) {
        let normalizedTexture = type;
        if (type === 'coin') normalizedTexture = 'pickup_coin';
        else if (type === 'potion') normalizedTexture = 'pickup_potion';
        else if (type === 'magnet') normalizedTexture = 'pickup_magnet';
        else if (type === 'chest') normalizedTexture = 'pickup_chest';

        this.setPosition(x, y);
        this.setDepth(8);
        this.itemType = normalizedTexture;
        this.value = value;
        this.setTexture(normalizedTexture);
        this.setActive(true);
        this.setVisible(true);
        this.body.reset(x, y);
        this.attracted = false;
        this.speed = 0;
        this.baseY = y;
        this.floatOffset = Math.random() * Math.PI * 2;

        // Эффект появления
        this.setScale(0.1);
        this.scene.tweens.add({
            targets: this,
            scale: 1.0,
            duration: 180,
            ease: 'Back.easeOut'
        });
    }

    update(time, delta, defaultPlayer) {
        if (!this.active) return;

        // В Co-op режиме выбираем ближайшего активного игрока
        let player = defaultPlayer;
        if (this.scene.player1 && this.scene.player2) {
            const p1 = this.scene.player1.active ? this.scene.player1 : null;
            const p2 = this.scene.player2.active ? this.scene.player2 : null;
            if (p1 && p2) {
                const d1 = Phaser.Math.Distance.Between(this.x, this.y, p1.x, p1.y);
                const d2 = Phaser.Math.Distance.Between(this.x, this.y, p2.x, p2.y);
                player = d1 < d2 ? p1 : p2;
            } else {
                player = p1 || p2;
            }
        }

        if (!player || !player.active) return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

        // Притягивание магнитом
        if (dist <= player.stats.magnetRadius || this.attracted) {
            this.attracted = true;
            this.speed = Math.min(this.speed + delta * 2.0, 750);
            
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.x += Math.cos(angle) * this.speed * (delta / 1000);
            this.y += Math.sin(angle) * this.speed * (delta / 1000);

            // Сбор предмета
            if (dist < 28) {
                this.collect(player);
            }
        }
    }

    collect(player) {
        if (!this.active) return;
        this.setActive(false);
        this.setVisible(false);

        if (this.itemType.startsWith('gem_')) {
            const xpMulti = (this.scene.mapConfig && this.scene.mapConfig.xpMultiplier) ? this.scene.mapConfig.xpMultiplier : 1.0;
            player.addXp(this.value * xpMulti);
            window.Sound.playGem();
        } else if (this.itemType === 'pickup_coin' || this.itemType === 'coin') {
            const goldMulti = (this.scene.mapConfig && this.scene.mapConfig.goldMultiplier) ? this.scene.mapConfig.goldMultiplier : 1.0;
            player.addGold(Math.round(this.value * goldMulti));
            window.Sound.playCoin();
        } else if (this.itemType === 'pickup_potion' || this.itemType === 'potion') {
            player.heal(35);
            window.Sound.playCoin();
        } else if (this.itemType === 'pickup_magnet' || this.itemType === 'magnet') {
            this.scene.attractAllGems();
            window.Sound.playLevelUp();
        } else if (this.itemType === 'pickup_chest' || this.itemType === 'chest') {
            this.scene.openChest(this.value);
            window.Sound.playChest();
        } else if (this.itemType === 'powerup_bomb') {
            window.Sound.playBomb();
            this.scene.cameras.main.shake(450, 0.025);
            this.scene.cameras.main.flash(350, 255, 255, 255);
            this.scene.showFloatingText(player.x, player.y - 40, '[ СВЯТАЯ БОМБА! ]', 0xffd166);
            
            // Взрыв всех монстров на экране
            this.scene.poolManager.enemyGroup.children.iterate((enemy) => {
                if (enemy && enemy.active && !enemy.isBoss) {
                    enemy.takeDamage(9999, true);
                }
            });
        } else if (this.itemType === 'powerup_freeze') {
            window.Sound.playFreeze();
            this.scene.showFloatingText(player.x, player.y - 40, '[ ЗАМОРОЗКА ВРЕМЕНИ! ]', 0x38bdf8);
            this.scene.poolManager.enemyGroup.children.iterate((enemy) => {
                if (enemy && enemy.active && enemy.freeze) {
                    enemy.freeze(4500);
                }
            });
        } else if (this.itemType === 'powerup_rage') {
            window.Sound.playRage();
            this.scene.showFloatingText(player.x, player.y - 40, '[ РЕЖИМ ЯРОСТИ x2! ]', 0xef4444);
            if (player.activateRage) {
                player.activateRage(6000);
            }
        }
    }
}

window.DropItem = DropItem;
