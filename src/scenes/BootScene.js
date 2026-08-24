/**
 * Boot Scene - Чистая загрузка всех аудио файлов, фонов и спрайтов
 * Автоматическая обработка прозрачности (Alpha Keying) для сгенерированных артов
 * Ожидание загрузки Google Fonts для безупречной типографики
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        const { width, height } = this.scale;

        // Полоса загрузки
        const barBg = this.add.rectangle(width / 2, height / 2, 400, 24, 0x1a202c);
        const barFill = this.add.rectangle(width / 2 - 195, height / 2, 0, 18, 0x00f5d4);
        barFill.setOrigin(0, 0.5);

        this.add.text(width / 2, height / 2 - 50, '10 MINUTES SURVIVOR', {
            fontFamily: CONFIG.FONTS.TITLE,
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        const loadingText = this.add.text(width / 2, height / 2 + 40, 'Загрузка ассетов и шрифтов...', {
            fontFamily: CONFIG.FONTS.UI,
            fontSize: '16px',
            color: '#a0aec0'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            barFill.width = 390 * value;
        });

        // --- 1. ВСЕ 16 MP3 АУДИО ФАЙЛОВ ---
        const audioKeys = [
            'bgm_main', 'bgm_menu', 'bgm_boss',
            'sfx_slash', 'sfx_shoot', 'sfx_hit', 'sfx_levelup',
            'sfx_coin', 'sfx_gem', 'sfx_chest', 'sfx_jackpot',
            'sfx_bomb', 'sfx_freeze', 'sfx_rage', 'sfx_boss', 'sfx_death'
        ];
        audioKeys.forEach((key) => {
            this.load.audio(key, `assets/audio/${key}.mp3`);
        });

        // --- 2. ГРАФИЧЕСКИЕ АССЕТЫ ИНТЕРФЕЙСА И ФОНА ---
        this.load.image('menu_bg', 'assets/sprites/environment/menu_bg.jpg');
        this.load.image('ui_podium', 'assets/sprites/environment/ui_podium.jpg');
        this.load.image('ui_logo_crest', 'assets/sprites/environment/ui_logo_crest.jpg');
        this.load.image('ui_avatar', 'assets/sprites/environment/ui_avatar.jpg');
        this.load.image('ui_chest_gold', 'assets/sprites/environment/ui_chest_gold.jpg');
    }

    async create() {
        // 1. Генерация процедурных пиксель-арт героев, тайлов, иконок и FX
        TextureGenerator.generateAll(this);

        // 2. Автоматическое удаление черных фонов (Alpha Keying) для фоновых элементов
        const transparentAssets = [
            { key: 'ui_podium', isCircle: false },
            { key: 'ui_logo_crest', isCircle: false },
            { key: 'ui_avatar', isCircle: true },
            { key: 'ui_chest_gold', isCircle: false }
        ];

        transparentAssets.forEach(item => {
            TextureGenerator.makeTextureTransparent(this, item.key, item.isCircle);
        });

        // 3. Инициализация звука и сохранений
        window.Sound.init();
        await window.YandexSDK.init();
        await window.SaveManager.init();

        // 4. Ожидание полной готовности Google Fonts перед рендерингом меню
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        this.scene.start('MenuScene');
    }
}

window.BootScene = BootScene;
