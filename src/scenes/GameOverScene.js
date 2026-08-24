/**
 * Game Over & Victory Scene - Результаты забега, удвоение золота за рекламу и возврат в меню
 * Полная адаптивность под вертикальную и горизонтальную ориентацию
 */
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    init(data) {
        this.isVictory = !!data.isVictory;
        this.timeSec = data.timeSec || 0;
        this.kills = data.kills || 0;
        this.gold = data.gold || 0;
        this.level = data.level || 1;
        this.heroId = data.heroId || 'knight';
        this.mapId = data.mapId || window.SaveManager.data.selectedMap || 'dark_castle';
        this.isDoubled = false;
    }

    create() {
        const { width, height } = this.scale;
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        // Закрываем любые фоновые оверлеи
        if (this.scene.isActive('UpgradeScene')) this.scene.stop('UpgradeScene');
        if (this.scene.isActive('PauseScene')) this.scene.stop('PauseScene');

        // Сохранение рекордов и прогресса карт
        window.SaveManager.recordMapRun(this.mapId, this.timeSec, this.kills);
        const earnedGold = window.SaveManager.addGold(this.gold);

        // Затемненный фон
        this.add.rectangle(width / 2, height / 2, width, height, 0x070a13, 0.95);

        // Заголовок
        const titleText = this.isVictory ? 'ПОБЕДА! ВЫЖИВШИЙ АРЕНЫ!' : 'ВЫ ПОГИБЛИ';
        const titleColor = this.isVictory ? '#ffd166' : '#ef4444';
        const titleY = isCompact ? 22 : (isPortrait ? 45 : 55);

        this.add.text(width / 2, titleY, titleText, {
            fontFamily: CONFIG.FONTS.TITLE,
            fontSize: isCompact ? '20px' : (isPortrait ? '24px' : '32px'),
            fontStyle: 'bold',
            color: titleColor,
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Панель статистики
        const cardW = isPortrait ? Math.min(width - 24, 380) : (isCompact ? Math.min(width - 40, 460) : 480);
        const cardH = isPortrait ? 200 : (isCompact ? 175 : 230);
        const cardY = isPortrait ? (height / 2 - 45) : (isCompact ? (height / 2 - 20) : (height / 2 - 25));

        const statBg = this.add.rectangle(width / 2, cardY, cardW, cardH, 0x0f172a, 0.96);
        statBg.setStrokeStyle(1.5, 0x334155);

        const mins = Math.floor(this.timeSec / 60);
        const secs = this.timeSec % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const leftX = width / 2 - cardW / 2 + (isCompact ? 25 : 35);
        let startY = cardY - cardH / 2 + (isCompact ? 22 : 30);
        const rowStep = isCompact ? 34 : (isPortrait ? 40 : 45);

        // 1. Время
        this.add.image(leftX, startY, 'ui_clock').setScale(isCompact ? 0.8 : 1.0);
        this.add.text(leftX + (isCompact ? 20 : 25), startY, `Время:  ${timeStr} / 10:00`, {
            fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '13px' : (isPortrait ? '15px' : '17px'), fontStyle: 'bold', color: '#f8fafc'
        }).setOrigin(0, 0.5);
        startY += rowStep;

        // 2. Убийства
        this.add.image(leftX, startY, 'ui_skull').setScale(isCompact ? 0.8 : 1.0);
        this.add.text(leftX + (isCompact ? 20 : 25), startY, `Убито монстров:  ${this.kills}`, {
            fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '13px' : (isPortrait ? '15px' : '17px'), fontStyle: 'bold', color: '#f8fafc'
        }).setOrigin(0, 0.5);
        startY += rowStep;

        // 3. Уровень
        this.add.image(leftX, startY, 'ui_star').setScale(isCompact ? 0.8 : 1.0);
        this.add.text(leftX + (isCompact ? 20 : 25), startY, `Уровень героя:  LVL ${this.level}`, {
            fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '13px' : (isPortrait ? '15px' : '17px'), fontStyle: 'bold', color: '#f8fafc'
        }).setOrigin(0, 0.5);
        startY += rowStep;

        // 4. Золото
        this.add.image(leftX, startY, 'ui_coin').setScale(isCompact ? 0.8 : 1.0);
        this.add.text(leftX + (isCompact ? 20 : 25), startY, `Получено золота:  +${earnedGold}`, {
            fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '13px' : (isPortrait ? '15px' : '17px'), color: '#ffd166', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Кнопки
        if (isCompact) {
            // Ландшафт на смартфонах: 2 кнопки рядом внизу
            const btnY = height - 26;
            const btnW = 220;
            const btnH = 34;

            const doubleBtn = this.add.image(width / 2 - 120, btnY, 'btn_unlock_gold').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
            const doubleText = this.add.text(width / 2 - 120, btnY, `УДВОИТЬ (+${earnedGold})`, {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            doubleBtn.on('pointerdown', () => {
                if (this.isDoubled) return;
                window.YandexSDK.showRewardedVideo(() => {
                    this.isDoubled = true;
                    window.SaveManager.addGold(this.gold);
                    window.Sound.playCoin();
                    doubleBtn.setTint(0x475569);
                    doubleText.setText('ЗОЛОТО УДВОЕНО!');
                });
            });

            const menuBtn = this.add.image(width / 2 + 120, btnY, 'btn_coop_bg').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
            this.add.text(width / 2 + 120, btnY, 'В ГЛАВНОЕ МЕНЮ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 1
            }).setOrigin(0.5);

            menuBtn.on('pointerdown', () => {
                window.YandexSDK.showFullscreenAdv(() => {
                    this.scene.start('MenuScene');
                });
            });
        } else {
            // Портрет или десктоп: 2 кнопки вертикально
            const btnW = isPortrait ? Math.min(width - 40, 320) : 320;
            const dBtnY = isPortrait ? height * 0.72 : height / 2 + 125;
            const mBtnY = isPortrait ? height * 0.84 : height - 50;

            const doubleBtn = this.add.image(width / 2, dBtnY, 'btn_unlock_gold').setDisplaySize(btnW, 44).setInteractive({ useHandCursor: true });
            const doubleText = this.add.text(width / 2, dBtnY, `УДВОИТЬ ЗОЛОТО (+${earnedGold})`, {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isPortrait ? '13px' : '15px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5);

            doubleBtn.on('pointerdown', () => {
                if (this.isDoubled) return;
                window.YandexSDK.showRewardedVideo(() => {
                    this.isDoubled = true;
                    window.SaveManager.addGold(this.gold);
                    window.Sound.playCoin();
                    doubleBtn.setTint(0x475569);
                    doubleText.setText('ЗОЛОТО УДВОЕНО!');
                });
            });

            const menuBtn = this.add.image(width / 2, mBtnY, 'btn_coop_bg').setDisplaySize(btnW, 44).setInteractive({ useHandCursor: true });
            this.add.text(width / 2, mBtnY, 'В ГЛАВНОЕ МЕНЮ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isPortrait ? '13px' : '15px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 1
            }).setOrigin(0.5);

            menuBtn.on('pointerdown', () => {
                window.YandexSDK.showFullscreenAdv(() => {
                    this.scene.start('MenuScene');
                });
            });
        }
    }
}

window.GameOverScene = GameOverScene;
