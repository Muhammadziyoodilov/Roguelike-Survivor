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

        this.add.text(width / 2, isPortrait ? 50 : 70, titleText, {
            fontFamily: "'Cinzel', serif",
            fontSize: isPortrait ? '26px' : '36px',
            fontStyle: 'bold',
            color: titleColor,
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);

        // Панель статистики
        const cardW = isPortrait ? Math.min(width - 30, 380) : 480;
        const cardH = isPortrait ? 220 : 230;
        const cardY = isPortrait ? height / 2 - 40 : height / 2 - 30;

        const statBg = this.add.rectangle(width / 2, cardY, cardW, cardH, 0x0f172a);
        statBg.setStrokeStyle(2, 0x334155);

        const mins = Math.floor(this.timeSec / 60);
        const secs = this.timeSec % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        const leftX = width / 2 - cardW / 2 + 35;
        let startY = cardY - cardH / 2 + 30;
        const rowStep = isPortrait ? 44 : 45;

        // 1. Время
        this.add.image(leftX, startY, 'ui_clock');
        this.add.text(leftX + 25, startY, `Время:  ${timeStr} / 10:00`, {
            fontFamily: "'Rajdhani', sans-serif", fontSize: isPortrait ? '16px' : '18px', fontStyle: 'bold', color: '#f8fafc'
        }).setOrigin(0, 0.5);
        startY += rowStep;

        // 2. Убийства
        this.add.image(leftX, startY, 'ui_skull');
        this.add.text(leftX + 25, startY, `Убито монстров:  ${this.kills}`, {
            fontFamily: "'Rajdhani', sans-serif", fontSize: isPortrait ? '16px' : '18px', fontStyle: 'bold', color: '#f8fafc'
        }).setOrigin(0, 0.5);
        startY += rowStep;

        // 3. Уровень
        this.add.image(leftX, startY, 'ui_star');
        this.add.text(leftX + 25, startY, `Уровень героя:  LVL ${this.level}`, {
            fontFamily: "'Rajdhani', sans-serif", fontSize: isPortrait ? '16px' : '18px', fontStyle: 'bold', color: '#f8fafc'
        }).setOrigin(0, 0.5);
        startY += rowStep;

        // 4. Золото
        this.add.image(leftX, startY, 'ui_coin');
        this.add.text(leftX + 25, startY, `Получено золота:  +${earnedGold}`, {
            fontFamily: "'Rajdhani', sans-serif", fontSize: isPortrait ? '16px' : '18px', color: '#ffd166', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // Кнопка: Удвоить золото за видео
        const dBtnY = isPortrait ? height * 0.72 : height / 2 + 130;
        const btnW = isPortrait ? Math.min(width - 40, 320) : 320;

        const doubleBtn = this.add.image(width / 2, dBtnY, 'btn_unlock_gold').setDisplaySize(btnW, 46).setInteractive({ useHandCursor: true });
        const doubleText = this.add.text(width / 2, dBtnY, `УДВОИТЬ ЗОЛОТО (+${earnedGold})`, {
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: isPortrait ? '15px' : '16px',
            fontStyle: 'bold',
            color: '#ffffff'
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

        // Кнопка: В главное меню
        const mBtnY = isPortrait ? height * 0.84 : height - 55;
        const menuBtn = this.add.image(width / 2, mBtnY, 'btn_coop_bg').setDisplaySize(btnW, 46).setInteractive({ useHandCursor: true });
        this.add.text(width / 2, mBtnY, 'В ГЛАВНОЕ МЕНЮ', {
            fontFamily: "'Cinzel', serif",
            fontSize: isPortrait ? '14px' : '16px',
            fontStyle: 'bold',
            color: '#ffffff',
            letterSpacing: 1
        }).setOrigin(0.5);

        menuBtn.on('pointerdown', () => {
            window.YandexSDK.showFullscreenAdv(() => {
                this.scene.start('MenuScene');
            });
        });
    }
}

window.GameOverScene = GameOverScene;
