/**
 * Upgrade Scene - Окно выбора способностей при Level Up и открытии сундуков
 * Адаптируется под горизонтальную и вертикальную ориентацию экрана
 */
class UpgradeScene extends Phaser.Scene {
    constructor() {
        super('UpgradeScene');
    }

    init(data) {
        this.player = data.player;
        this.isChest = !!data.isChest;
        this.forceEvolution = !!data.forceEvolution;
        this.callingSceneKey = data.sceneKey || 'GameScene';
    }

    create() {
        const { width, height } = this.scale;
        const lang = window.SaveManager.data.lang || 'ru';

        // Приглушаем музыку на время выбора карточки
        if (window.Sound && window.Sound.setPauseDucking) {
            window.Sound.setPauseDucking(true);
        }

        // Затемняющий фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85).setInteractive();

        // Заголовок окна
        const headerText = this.isChest ? 'СУНДУК С СОКРОВИЩАМИ' : 'ПОВЫШЕНИЕ УРОВНЯ';
        const headerColor = this.isChest ? '#ffd166' : '#00f5d4';

        this.add.text(width / 2, height > width ? 45 : 55, headerText, {
            fontFamily: "'Cinzel', serif",
            fontSize: height > width ? '24px' : '30px',
            fontStyle: 'bold',
            color: headerColor,
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);

        // Джекпот сундука (1x, 3x, 5x)
        if (this.isChest) {
            const roll = Math.random();
            if (roll < 0.05) {
                this.jackpotCount = 5;
                window.Sound.playJackpot();
                this.player.addGold(300);
                const banner = this.add.text(width / 2, height > width ? 75 : 90, 'ЗОЛОТОЙ ДЖЕКПОТ x5 (+300 ЗОЛОТА)!', {
                    fontFamily: 'sans-serif', fontSize: height > width ? '13px' : '16px', fontStyle: 'bold', color: '#ffd166', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
                this.tweens.add({ targets: banner, scale: 1.08, yoyo: true, repeat: -1, duration: 400 });
            } else if (roll < 0.25) {
                this.jackpotCount = 3;
                window.Sound.playJackpot();
                const banner = this.add.text(width / 2, height > width ? 75 : 90, 'СЕРЕБРЯНЫЙ ДЖЕКПОТ x3!', {
                    fontFamily: 'sans-serif', fontSize: height > width ? '13px' : '16px', fontStyle: 'bold', color: '#38bdf8', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
                this.tweens.add({ targets: banner, scale: 1.06, yoyo: true, repeat: -1, duration: 400 });
            } else {
                this.jackpotCount = 1;
            }
        }

        // Индикатор героя
        const heroConfig = CONFIG.HEROES[this.player.heroId] || CONFIG.HEROES.knight;
        let playerLabel = '';
        if (this.callingSceneKey === 'CoopGameScene') {
            playerLabel = this.player.playerIndex === 2 ? `[ ИГРОК 2: ${heroConfig.name[lang]} ] ` : `[ ИГРОК 1: ${heroConfig.name[lang]} ] `;
        }

        if (!this.jackpotCount || this.jackpotCount === 1) {
            this.add.text(width / 2, height > width ? 75 : 90, `${playerLabel}Выберите улучшение для героя`, {
                fontFamily: 'sans-serif',
                fontSize: height > width ? '13px' : '15px',
                fontStyle: 'bold',
                color: '#94a3b8'
            }).setOrigin(0.5);
        }

        this.renderCards(width, height);
    }

    renderCards(width, height) {
        if (this.cardsGroup) this.cardsGroup.destroy(true);
        this.cardsGroup = this.add.group();

        const upgrades = UpgradeManager.getAvailableUpgrades(this.player);
        const isPortrait = height > width;

        if (isPortrait) {
            // --- ВЕРТИКАЛЬНАЯ ОРИЕНТАЦИЯ (ПОРТРЕТ) ---
            const cardWidth = Math.min(width - 40, 380);
            const cardHeight = 110;
            const spacing = 15;
            const startY = 160;

            upgrades.forEach((upg, i) => {
                const cardY = startY + i * (cardHeight + spacing);
                let borderColor = upg.isSuper ? 0xffd166 : (upg.isNew ? 0xa855f7 : 0x38bdf8);

                const cardBg = this.add.rectangle(width / 2, cardY, cardWidth, cardHeight, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
                cardBg.setStrokeStyle(2, borderColor);
                this.cardsGroup.add(cardBg);

                // Иконка слева
                const iconBg = this.add.rectangle(width / 2 - cardWidth / 2 + 45, cardY, 60, 60, 0x1e293b);
                iconBg.setStrokeStyle(1.5, borderColor);
                const icon = this.add.image(width / 2 - cardWidth / 2 + 45, cardY, upg.icon).setScale(1.1);
                this.cardsGroup.add(iconBg);
                this.cardsGroup.add(icon);

                // Текст справа от иконки
                let tagText = upg.isSuper ? '[ЭВОЛЮЦИЯ]' : (upg.isNew ? '[НОВОЕ]' : `УРОВЕНЬ ${upg.level}`);
                let tagColor = upg.isSuper ? '#ffd166' : (upg.isNew ? '#c084fc' : '#38bdf8');
                const tag = this.add.text(width / 2 - cardWidth / 2 + 90, cardY - 32, tagText, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', fontStyle: 'bold', color: tagColor
                });
                this.cardsGroup.add(tag);

                const name = this.add.text(width / 2 - cardWidth / 2 + 90, cardY - 14, upg.name, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
                    wordWrap: { width: cardWidth - 100 }
                });
                this.cardsGroup.add(name);

                const desc = this.add.text(width / 2 - cardWidth / 2 + 90, cardY + 14, upg.desc, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: '#94a3b8',
                    wordWrap: { width: cardWidth - 100 }
                });
                this.cardsGroup.add(desc);

                cardBg.on('pointerdown', () => this.selectUpgrade(upg));
            });
        } else {
            // --- ГОРИЗОНТАЛЬНАЯ ОРИЕНТАЦИЯ (ЛАНДШАФТ) ---
            const cardWidth = Math.min(300, (width - 120) / upgrades.length);
            const cardHeight = Math.min(340, height - 180);
            const spacing = 30;
            const totalWidth = (upgrades.length * cardWidth) + ((upgrades.length - 1) * spacing);
            const startX = (width - totalWidth) / 2 + (cardWidth / 2);
            const centerY = height / 2 + 25;

            upgrades.forEach((upg, i) => {
                const cardX = startX + (i * (cardWidth + spacing));
                let borderColor = upg.isSuper ? 0xffd166 : (upg.isNew ? 0xa855f7 : 0x38bdf8);

                const cardBg = this.add.rectangle(cardX, centerY, cardWidth, cardHeight, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
                cardBg.setStrokeStyle(2.5, borderColor);
                this.cardsGroup.add(cardBg);

                let tagText = upg.isSuper ? '[ЭВОЛЮЦИЯ]' : (upg.isNew ? '[НОВОЕ]' : `УРОВЕНЬ ${upg.level}`);
                let tagColor = upg.isSuper ? '#ffd166' : (upg.isNew ? '#c084fc' : '#38bdf8');
                const tag = this.add.text(cardX, centerY - cardHeight / 2 + 24, tagText, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontStyle: 'bold', color: tagColor
                }).setOrigin(0.5);
                this.cardsGroup.add(tag);

                const iconBg = this.add.rectangle(cardX, centerY - cardHeight / 4, 70, 70, 0x1e293b);
                iconBg.setStrokeStyle(2, borderColor);
                const icon = this.add.image(cardX, centerY - cardHeight / 4, upg.icon).setScale(1.2);
                this.cardsGroup.add(iconBg);
                this.cardsGroup.add(icon);

                const name = this.add.text(cardX, centerY + 25, upg.name, {
                    fontFamily: "'Cinzel', serif", fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
                    align: 'center', wordWrap: { width: cardWidth - 25 }
                }).setOrigin(0.5);
                this.cardsGroup.add(name);

                const desc = this.add.text(cardX, centerY + 85, upg.desc, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', color: '#cbd5e1',
                    align: 'center', wordWrap: { width: cardWidth - 30 }
                }).setOrigin(0.5);
                this.cardsGroup.add(desc);

                cardBg.on('pointerover', () => {
                    this.tweens.add({ targets: [cardBg, iconBg, icon, name, desc, tag], scale: 1.04, duration: 100 });
                    cardBg.setStrokeStyle(3.5, 0x38bdf8);
                });

                cardBg.on('pointerout', () => {
                    this.tweens.add({ targets: [cardBg, iconBg, icon, name, desc, tag], scale: 1.0, duration: 100 });
                    cardBg.setStrokeStyle(2.5, borderColor);
                });

                cardBg.on('pointerdown', () => this.selectUpgrade(upg));
            });
        }

        // Кнопка Реролла (Reroll)
        const rerollBtn = this.add.rectangle(width / 2, height - 38, 220, 40, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
        rerollBtn.setStrokeStyle(1.5, 0x6366f1);
        const rerollText = this.add.text(width / 2, height - 38, '🎲  ЗАМЕНИТЬ (REROLL)', {
            fontFamily: "'Cinzel', serif", fontSize: '13px', fontStyle: 'bold', color: '#c084fc', letterSpacing: 1
        }).setOrigin(0.5);

        rerollBtn.on('pointerdown', () => {
            window.YandexSDK.showRewardedVideo(() => {
                this.renderCards(width, height);
                window.Sound.playCoin();
            });
        });

        this.cardsGroup.add(rerollBtn);
        this.cardsGroup.add(rerollText);
    }

    selectUpgrade(upg) {
        UpgradeManager.applyUpgrade(this.player, upg);
        window.Sound.playCoin();

        if (this.jackpotCount && this.jackpotCount > 1) {
            this.jackpotCount--;
            const { width, height } = this.scale;
            this.renderCards(width, height);
            return;
        }

        if (window.Sound && window.Sound.setPauseDucking) {
            window.Sound.setPauseDucking(false);
        }

        const callingScene = this.scene.get(this.callingSceneKey);
        if (callingScene && callingScene.updateInventoryHUD) {
            callingScene.updateInventoryHUD();
        }

        this.scene.stop('UpgradeScene');
        this.scene.resume(this.callingSceneKey);
    }
}

window.UpgradeScene = UpgradeScene;
