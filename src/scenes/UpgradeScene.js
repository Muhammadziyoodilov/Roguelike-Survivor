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
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        // Приглушаем музыку на время выбора карточки
        if (window.Sound && window.Sound.setPauseDucking) {
            window.Sound.setPauseDucking(true);
        }

        // Затемняющий фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.88).setInteractive();

        // Заголовок окна
        const headerText = this.isChest ? 'СУНДУК С СОКРОВИЩАМИ' : 'ПОВЫШЕНИЕ УРОВНЯ';
        const headerColor = this.isChest ? '#ffd166' : '#00f5d4';
        const headerY = isCompact ? 22 : (isPortrait ? 40 : 50);

        this.add.text(width / 2, headerY, headerText, {
            fontFamily: CONFIG.FONTS.TITLE,
            fontSize: isCompact ? '18px' : (isPortrait ? '22px' : '28px'),
            fontStyle: 'bold',
            color: headerColor,
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Джекпот сундука (1x, 3x, 5x)
        const subY = isCompact ? 40 : (isPortrait ? 66 : 80);
        if (this.isChest) {
            const roll = Math.random();
            if (roll < 0.05) {
                this.jackpotCount = 5;
                window.Sound.playJackpot();
                this.player.addGold(300);
                const banner = this.add.text(width / 2, subY, 'ЗОЛОТОЙ ДЖЕКПОТ x5 (+300 ЗОЛОТА)!', {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '11px' : (isPortrait ? '12px' : '15px'), fontStyle: 'bold', color: '#ffd166', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5);
                this.tweens.add({ targets: banner, scale: 1.08, yoyo: true, repeat: -1, duration: 400 });
            } else if (roll < 0.25) {
                this.jackpotCount = 3;
                window.Sound.playJackpot();
                const banner = this.add.text(width / 2, subY, 'СЕРЕБРЯНЫЙ ДЖЕКПОТ x3!', {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '11px' : (isPortrait ? '12px' : '15px'), fontStyle: 'bold', color: '#38bdf8', stroke: '#000', strokeThickness: 3
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
            this.add.text(width / 2, subY, `${playerLabel}Выберите улучшение для героя`, {
                fontFamily: CONFIG.FONTS.UI,
                fontSize: isCompact ? '11px' : (isPortrait ? '12px' : '14px'),
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
        const isCompact = !isPortrait && height < 520;

        if (isPortrait) {
            // --- ВЕРТИКАЛЬНАЯ ОРИЕНТАЦИЯ (ПОРТРЕТ) ---
            const cardWidth = Math.min(width - 32, 380);
            const cardHeight = Math.min(105, (height - 180) / upgrades.length - 12);
            const spacing = 12;
            const startY = Math.min(135, height * 0.18) + (cardHeight / 2);

            upgrades.forEach((upg, i) => {
                const cardY = startY + i * (cardHeight + spacing);
                let borderColor = upg.isSuper ? 0xffd166 : (upg.isNew ? 0xa855f7 : 0x38bdf8);

                const cardBg = this.add.rectangle(width / 2, cardY, cardWidth, cardHeight, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
                cardBg.setStrokeStyle(2, borderColor);
                this.cardsGroup.add(cardBg);

                // Иконка слева
                const iconSize = Math.min(50, cardHeight - 16);
                const iconBg = this.add.rectangle(width / 2 - cardWidth / 2 + iconSize / 2 + 16, cardY, iconSize, iconSize, 0x1e293b);
                iconBg.setStrokeStyle(1.5, borderColor);
                const icon = this.add.image(width / 2 - cardWidth / 2 + iconSize / 2 + 16, cardY, upg.icon).setScale(0.9);
                this.cardsGroup.add(iconBg);
                this.cardsGroup.add(icon);

                // Текст справа от иконки
                let tagText = upg.isSuper ? '[ЭВОЛЮЦИЯ]' : (upg.isNew ? '[НОВОЕ]' : `УРОВЕНЬ ${upg.level}`);
                let tagColor = upg.isSuper ? '#ffd166' : (upg.isNew ? '#c084fc' : '#38bdf8');
                const textStartX = width / 2 - cardWidth / 2 + iconSize + 28;

                const tag = this.add.text(textStartX, cardY - cardHeight / 2 + 14, tagText, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: '11px', fontStyle: 'bold', color: tagColor
                });
                this.cardsGroup.add(tag);

                const name = this.add.text(textStartX, cardY - cardHeight / 2 + 28, upg.name, {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
                    wordWrap: { width: cardWidth - iconSize - 40 }
                });
                this.cardsGroup.add(name);

                const desc = this.add.text(textStartX, cardY + 8, upg.desc, {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: '11px', color: '#94a3b8',
                    wordWrap: { width: cardWidth - iconSize - 40 }
                });
                this.cardsGroup.add(desc);

                cardBg.on('pointerdown', () => this.selectUpgrade(upg));
            });
        } else {
            // --- ГОРИЗОНТАЛЬНАЯ ОРИЕНТАЦИЯ (ЛАНДШАФТ) ---
            const cardWidth = Math.min(isCompact ? 220 : 280, (width - (isCompact ? 40 : 100)) / upgrades.length);
            const cardHeight = Math.min(isCompact ? 225 : 330, height - (isCompact ? 100 : 150));
            const spacing = isCompact ? 14 : 26;
            const totalWidth = (upgrades.length * cardWidth) + ((upgrades.length - 1) * spacing);
            const startX = (width - totalWidth) / 2 + (cardWidth / 2);
            const centerY = isCompact ? (height / 2 + 12) : (height / 2 + 20);

            upgrades.forEach((upg, i) => {
                const cardX = startX + (i * (cardWidth + spacing));
                let borderColor = upg.isSuper ? 0xffd166 : (upg.isNew ? 0xa855f7 : 0x38bdf8);

                const cardBg = this.add.rectangle(cardX, centerY, cardWidth, cardHeight, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
                cardBg.setStrokeStyle(2, borderColor);
                this.cardsGroup.add(cardBg);

                let tagText = upg.isSuper ? '[ЭВОЛЮЦИЯ]' : (upg.isNew ? '[НОВОЕ]' : `УРОВЕНЬ ${upg.level}`);
                let tagColor = upg.isSuper ? '#ffd166' : (upg.isNew ? '#c084fc' : '#38bdf8');
                const tag = this.add.text(cardX, centerY - cardHeight / 2 + (isCompact ? 14 : 20), tagText, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '11px' : '13px', fontStyle: 'bold', color: tagColor
                }).setOrigin(0.5);
                this.cardsGroup.add(tag);

                const iconBoxSize = isCompact ? 46 : 64;
                const iconY = centerY - cardHeight / 2 + (isCompact ? 52 : 74);
                const iconBg = this.add.rectangle(cardX, iconY, iconBoxSize, iconBoxSize, 0x1e293b);
                iconBg.setStrokeStyle(1.5, borderColor);
                const icon = this.add.image(cardX, iconY, upg.icon).setScale(isCompact ? 0.75 : 1.1);
                this.cardsGroup.add(iconBg);
                this.cardsGroup.add(icon);

                const nameY = centerY - cardHeight / 2 + (isCompact ? 95 : 138);
                const name = this.add.text(cardX, nameY, upg.name, {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : '15px', fontStyle: 'bold', color: '#ffffff',
                    align: 'center', wordWrap: { width: cardWidth - 16 }
                }).setOrigin(0.5);
                this.cardsGroup.add(name);

                const descY = centerY - cardHeight / 2 + (isCompact ? 135 : 195);
                const desc = this.add.text(cardX, descY, upg.desc, {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '10px' : '12px', color: '#cbd5e1',
                    align: 'center', wordWrap: { width: cardWidth - 18 }, lineSpacing: 1
                }).setOrigin(0.5, 0);
                this.cardsGroup.add(desc);

                cardBg.on('pointerover', () => {
                    this.tweens.add({ targets: [cardBg, iconBg, icon, name, desc, tag], scale: 1.03, duration: 80 });
                    cardBg.setStrokeStyle(3, 0x38bdf8);
                });

                cardBg.on('pointerout', () => {
                    this.tweens.add({ targets: [cardBg, iconBg, icon, name, desc, tag], scale: 1.0, duration: 80 });
                    cardBg.setStrokeStyle(2, borderColor);
                });

                cardBg.on('pointerdown', () => this.selectUpgrade(upg));
            });
        }

        // Кнопка Реролла (Reroll)
        const btnY = height - (isCompact ? 20 : 32);
        const rerollBtn = this.add.rectangle(width / 2, btnY, isCompact ? 200 : 250, isCompact ? 30 : 38, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
        rerollBtn.setStrokeStyle(1.5, 0x6366f1);
        const rerollText = this.add.text(width / 2, btnY, '🎲  ЗАМЕНИТЬ (REROLL)', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '13px', fontStyle: 'bold', color: '#c084fc', letterSpacing: 1
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
