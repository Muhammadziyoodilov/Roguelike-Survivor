/**
 * Menu Scene - AAA Dark Fantasy Main Menu & Hero Hub
 * В точном соответствии с референсом:
 * - Hero Squad Key Art на главном экране (Повелитель Тьмы + отряд героев)
 * - Стеклянные панели (Glassmorphism), мягкие неоновые градиенты и 3D-ассеты
 * - Клик на PLAY открывает интерактивный экран выбора героя перед боем
 * - Ежедневные задания, Сезонный боевой пропуск и баннер новостей
 * - 4 нижние 3D карточки: Бесплатный сундук, Усиления, Коллекция, Таблицы лидеров
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
        this.heroesList = ['knight', 'archer', 'mage', 'ninja', 'necromancer'];
        this.currentHeroIdx = 0;
        this.isTransitioning = false;
        this.currentModal = null;
    }

    create() {
        const { width, height } = this.scale;
        const isPortrait = height > width;
        const lang = window.SaveManager.data.lang || 'ru';

        // 1. Атмосферный фон замка и отряда героев
        this.createAtmosphericBackground(width, height);

        // 2. Верхняя шапка (Мини-кнопки, Ресурсы, Профиль)
        this.createTopBarHeader(width, height, isPortrait, lang);

        if (isPortrait) {
            this.createPortraitLayout(width, height, lang);
        } else {
            this.createLandscapeLayout(width, height, lang);
        }

        // 3. Нижняя панель вкладок (4 3D-карточки)
        this.createBottomTabBar(width, height, isPortrait, lang);

        // 4. Звук и плавный старт
        window.Sound.playMenuBGM();
        this.cameras.main.fadeIn(400, 0, 0, 0);
        this.isTransitioning = false;

        // Обработка ресайза
        const onResize = () => {
            if (this.scene.isActive('MenuScene')) {
                if (this.currentModal) this.currentModal.destroy(true);
                this.scene.restart();
            }
        };
        this.scale.on('resize', onResize);
        this.events.once('shutdown', () => this.scale.off('resize', onResize));
        this.events.once('destroy', () => this.scale.off('resize', onResize));
    }

    createAtmosphericBackground(width, height) {
        if (this.textures.exists('menu_bg')) {
            const bg = this.add.image(width / 2, height / 2, 'menu_bg');
            const scaleX = width / bg.width;
            const scaleY = height / bg.height;
            bg.setScale(Math.max(scaleX, scaleY)).setDepth(0);
        } else {
            this.add.rectangle(width / 2, height / 2, width, height, 0x070913).setDepth(0);
        }

        // Мягкое виньетирование по бокам для четкости интерфейса
        this.add.rectangle(width / 2, height / 2, width, height, 0x050714, 0.28).setDepth(1);

        // Парящие магические искры
        for (let i = 0; i < 20; i++) {
            const ember = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(height / 2, height),
                Phaser.Math.Between(1.5, 3),
                Math.random() < 0.6 ? 0xa855f7 : 0xff7700,
                0.7
            ).setDepth(2);

            this.tweens.add({
                targets: ember,
                y: ember.y - Phaser.Math.Between(140, 280),
                x: ember.x + Phaser.Math.Between(-50, 50),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000)
            });
        }
    }

    createTopBarHeader(width, height, isPortrait, lang) {
        const headerY = isPortrait ? 28 : 34;
        const iconSize = isPortrait ? 32 : 36;
        const leftStartX = isPortrait ? 25 : 45;

        // ЛЕВАЯ ЧАСТЬ: Настройки, Трофеи, Статистика
        const topActions = [
            { icon: 'ui_settings', action: () => this.openSettingsModal() },
            { icon: 'ui_trophy', action: () => this.openAchievementsModal() },
            { icon: 'ui_chart', action: () => this.openLeaderboardModal() }
        ];

        topActions.forEach((item, idx) => {
            const x = leftStartX + (idx * (iconSize + 8));
            const btn = this.add.rectangle(x, headerY, iconSize, iconSize, 0x0f172a, 0.9).setInteractive({ useHandCursor: true }).setDepth(10);
            btn.setStrokeStyle(1.5, 0x334155);
            btn.on('pointerover', () => btn.setStrokeStyle(1.5, 0x818cf8));
            btn.on('pointerout', () => btn.setStrokeStyle(1.5, 0x334155));
            btn.on('pointerdown', item.action);

            this.add.image(x, headerY, item.icon).setScale(0.8).setDepth(11);
        });

        // ПРАВАЯ ЧАСТЬ: Золото, Кристаллы и Профиль PLAYER_01
        const rightStartX = width - (isPortrait ? 20 : 30);
        const isCompact = !isPortrait && height < 520;

        if (!isPortrait && !isCompact) {
            // ДЕСКТОП: 1. Профиль игрока PLAYER_01
            const profW = 210;
            const profX = rightStartX - profW / 2;
            const profBg = this.add.rectangle(profX, headerY, profW, 46, 0x0f172a, 0.95).setDepth(10);
            profBg.setStrokeStyle(1.5, 0x6366f1);

            // Аватар в фиолетовом шестиугольнике
            this.add.image(profX - profW / 2 + 24, headerY, 'ui_avatar_hex').setDisplaySize(38, 38).setDepth(12);

            // Бейдж уровня 25 под аватаром
            const lvlBadge = this.add.rectangle(profX - profW / 2 + 24, headerY + 16, 20, 12, 0x581c87).setDepth(13);
            lvlBadge.setStrokeStyle(1, 0xc084fc);
            this.add.text(profX - profW / 2 + 24, headerY + 16, '25', {
                fontFamily: 'sans-serif', fontSize: '8px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5).setDepth(14);

            this.add.text(profX - 22, headerY - 11, 'PLAYER_01', {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '15px', fontStyle: 'bold', color: '#ffffff'
            }).setDepth(11);

            // Шкала опыта
            const xpBarW = 120;
            const xpBarX = profX - 22 + xpBarW / 2;
            const xpBarY = headerY + 10;
            this.add.rectangle(xpBarX, xpBarY, xpBarW, 14, 0x3b0764).setDepth(11);
            this.add.rectangle(profX - 22, xpBarY, xpBarW * 0.65, 14, 0xa855f7).setOrigin(0, 0.5).setDepth(12);
            this.add.text(xpBarX, xpBarY, '4 250 / 7 500 XP', {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5).setDepth(13);

            // 2. Кристаллы Душ (Gems)
            const gemsX = profX - profW / 2 - 80;
            const gemsBg = this.add.rectangle(gemsX, headerY, 115, 36, 0x0f172a, 0.95).setDepth(10);
            gemsBg.setStrokeStyle(1.5, 0xa855f7);
            this.add.image(gemsX - 42, headerY, 'ui_gem').setScale(0.85).setDepth(11);
            this.add.text(gemsX - 20, headerY, '2 860', {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '17px', fontStyle: 'bold', color: '#e9d5ff'
            }).setOrigin(0, 0.5).setDepth(11);
            this.add.text(gemsX + 44, headerY, '+', {
                fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#c084fc'
            }).setOrigin(0.5).setDepth(11);

            // 3. Золотые монеты
            const goldX = gemsX - 135;
            const goldBg = this.add.rectangle(goldX, headerY, 125, 36, 0x0f172a, 0.95).setDepth(10);
            goldBg.setStrokeStyle(1.5, 0xf59e0b);
            this.add.image(goldX - 45, headerY, 'ui_coin').setScale(0.9).setDepth(11);
            this.goldText = this.add.text(goldX - 22, headerY, `${window.SaveManager.data.gold}`, {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '17px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0, 0.5).setDepth(11);
            this.add.text(goldX + 46, headerY, '+', {
                fontFamily: 'sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#fbbf24'
            }).setOrigin(0.5).setDepth(11);
        } else if (isCompact) {
            // КОМПАКТНЫЙ ЛАНДШАФТ (Смартфоны) - Золото и Кристаллы по центру экрана (x = width / 2)
            const midX = width / 2;
            const goldX = midX - 62;
            const goldBg = this.add.rectangle(goldX, headerY, 110, 30, 0x0f172a, 0.95).setDepth(10);
            goldBg.setStrokeStyle(1.5, 0xf59e0b);
            this.add.image(goldX - 38, headerY, 'ui_coin').setScale(0.75).setDepth(11);
            this.goldText = this.add.text(goldX - 18, headerY, `${window.SaveManager.data.gold}`, {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0, 0.5).setDepth(11);

            const gemsX = midX + 62;
            const gemsBg = this.add.rectangle(gemsX, headerY, 105, 30, 0x0f172a, 0.95).setDepth(10);
            gemsBg.setStrokeStyle(1.5, 0xa855f7);
            this.add.image(gemsX - 36, headerY, 'ui_gem').setScale(0.7).setDepth(11);
            this.add.text(gemsX - 16, headerY, '2 860', {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '14px', fontStyle: 'bold', color: '#e9d5ff'
            }).setOrigin(0, 0.5).setDepth(11);
        } else {
            // ПОРТРЕТНЫЙ РЕЖИМ
            const goldX = rightStartX - 60;
            const goldBg = this.add.rectangle(goldX, headerY, 115, 34, 0x0f172a, 0.95).setDepth(10);
            goldBg.setStrokeStyle(1.5, 0xf59e0b);
            this.add.image(goldX - 40, headerY, 'ui_coin').setScale(0.8).setDepth(11);
            this.goldText = this.add.text(goldX - 20, headerY, `${window.SaveManager.data.gold}`, {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '16px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0, 0.5).setDepth(11);
        }
    }

    createLandscapeLayout(width, height, lang) {
        const isCompact = height < 520;
        const leftColX = isCompact ? Math.min(180, width * 0.22) : Math.min(260, width * 0.20);
        const leftTopY = isCompact ? 50 : 115;

        // 3D Логотип
        if (this.textures.exists('ui_logo_crest')) {
            const logoW = isCompact ? 160 : 270;
            const logoH = isCompact ? 80 : 135;
            const logo = this.add.image(leftColX, leftTopY + (isCompact ? 5 : 15), 'ui_logo_crest').setDisplaySize(logoW, logoH).setDepth(10);
            this.tweens.add({
                targets: logo,
                y: logo.y - 3,
                duration: 2200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // КНОПКА #1: PLAY (ОДИНОЧНЫЙ РЕЖИМ)
        const playBtnY = leftTopY + (isCompact ? 68 : 125);
        const playBtnW = isCompact ? 180 : 270;
        const playBtnH = isCompact ? 46 : 64;
        const playBtn = this.add.image(leftColX, playBtnY, 'btn_play_bg').setDisplaySize(playBtnW, playBtnH).setInteractive({ useHandCursor: true }).setDepth(10);

        this.tweens.add({
            targets: playBtn,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.add.image(leftColX - (isCompact ? 68 : 100), playBtnY, 'ui_swords').setScale(isCompact ? 0.7 : 0.95).setDepth(11);
        this.add.text(leftColX - (isCompact ? 45 : 68), playBtnY - (isCompact ? 9 : 12), 'PLAY', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '16px' : '22px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(11);
        this.add.text(leftColX - (isCompact ? 45 : 68), playBtnY + (isCompact ? 10 : 13), 'ОДИНОЧНЫЙ РЕЖИМ', {
            fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: '700', color: '#e9d5ff', letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(11);

        playBtn.on('pointerdown', () => this.openHeroSelectModal());

        // КНОПКА #2: CO-OP (РЕЖИМ НА ДВОИХ)
        const coopBtnY = playBtnY + (isCompact ? 50 : 74);
        const coopBtn = this.add.image(leftColX, coopBtnY, 'btn_coop_bg').setDisplaySize(playBtnW, isCompact ? 42 : 56).setInteractive({ useHandCursor: true }).setDepth(10);

        this.add.image(leftColX - (isCompact ? 68 : 100), coopBtnY, 'ui_coop').setScale(isCompact ? 0.7 : 0.95).setDepth(11);
        this.add.text(leftColX - (isCompact ? 45 : 68), coopBtnY - (isCompact ? 8 : 10), 'CO-OP', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '15px' : '20px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(11);
        this.add.text(leftColX - (isCompact ? 45 : 68), coopBtnY + (isCompact ? 9 : 12), 'РЕЖИМ НА ДВОИХ', {
            fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: '700', color: '#bae6fd', letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(11);

        coopBtn.on('pointerdown', () => this.openCoopModal());

        // Стеклянные кнопки подменю слева
        const menuItems = [
            { iconKey: 'ui_shield', title: 'ВЫБОР ГЕРОЯ', badge: '!', color: 0xef4444, action: () => this.openHeroSelectModal() },
            { iconKey: 'ui_trophy', title: 'ВЫБОР КАРТЫ', badge: '', color: 0, action: () => this.openMapSelectModal() },
            { iconKey: 'ui_star', title: 'УЛУЧШЕНИЯ', badge: '', color: 0, action: () => this.openTalentsModal() },
            { iconKey: 'ui_chest', title: 'КОЛЛЕКЦИЯ', badge: '', color: 0, action: () => this.openEvolutionModal() },
            { iconKey: 'ui_scroll', title: 'ЗАДАНИЯ', badge: '3', color: 0x0284c7, action: () => this.openAchievementsModal() }
        ];

        const subSpacing = isCompact ? 25 : 42;
        const subStartY = coopBtnY + (isCompact ? 34 : 54);

        menuItems.forEach((item, idx) => {
            const itemY = subStartY + (idx * subSpacing);
            const btn = this.add.image(leftColX, itemY, 'btn_glass_sub').setDisplaySize(playBtnW, isCompact ? 24 : 36).setInteractive({ useHandCursor: true }).setDepth(10);
            btn.on('pointerover', () => btn.setTint(0xc4b5fd));
            btn.on('pointerout', () => btn.clearTint());
            btn.on('pointerdown', item.action);

            this.add.image(leftColX - (isCompact ? 72 : 110), itemY, item.iconKey).setScale(isCompact ? 0.6 : 0.8).setDepth(11);
            this.add.text(leftColX - (isCompact ? 54 : 85), itemY, item.title, {
                fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '10px' : '13px', fontStyle: '800', color: '#cbd5e1', letterSpacing: 1
            }).setOrigin(0, 0.5).setDepth(11);

            if (item.badge) {
                this.add.circle(leftColX + (isCompact ? 75 : 115), itemY, isCompact ? 7 : 9, item.color).setDepth(11);
                this.add.text(leftColX + (isCompact ? 75 : 115), itemY, item.badge, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '8px' : '10px', fontStyle: 'bold', color: '#ffffff'
                }).setOrigin(0.5).setDepth(12);
            }
        });



        // === ПРАВАЯ КОЛОНКА: Виджеты ===
        const rightColX = isCompact ? Math.max(width - 130, width * 0.84) : Math.max(width - 200, width * 0.82);
        this.createRightWidgets(rightColX, leftTopY, lang, isCompact, height);
    }

    createRightWidgets(rightColX, topY, lang, isCompact, height) {
        const questBoxW = isCompact ? 220 : 280;

        // 1. ВИДЖЕТ ЕЖЕДНЕВНЫХ ЗАДАНИЙ
        const questBoxH = isCompact ? 140 : 195;
        const questBoxY = topY + (isCompact ? 40 : 75);

        const qBox = this.add.rectangle(rightColX, questBoxY, questBoxW, questBoxH, 0x0f172a, 0.95).setDepth(10);
        qBox.setStrokeStyle(1.5, 0x334155);

        this.add.text(rightColX - questBoxW / 2 + 12, questBoxY - questBoxH / 2 + (isCompact ? 12 : 16), 'ЕЖЕДНЕВНЫЕ ЗАДАНИЯ', {
            fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '11px' : '13px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(11);

        this.add.image(rightColX + questBoxW / 2 - 50, questBoxY - questBoxH / 2 + (isCompact ? 12 : 16), 'ui_hourglass').setScale(isCompact ? 0.5 : 0.65).setDepth(11);
        this.add.text(rightColX + questBoxW / 2 - 12, questBoxY - questBoxH / 2 + (isCompact ? 12 : 16), '18:45:12', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#94a3b8'
        }).setOrigin(1, 0.5).setDepth(11);

        const questsData = isCompact ? [
            { badgeKey: 'ui_badge_skull', title: 'Убейте 2000 врагов', cur: 1250, max: 2000, reward: '200' },
            { badgeKey: 'ui_badge_chest', title: 'Откройте 3 сундука', cur: 1, max: 3, reward: '100' }
        ] : [
            { badgeKey: 'ui_badge_skull', title: 'Убейте 2000 врагов', cur: 1250, max: 2000, reward: '200' },
            { badgeKey: 'ui_badge_chest', title: 'Откройте 3 сундука', cur: 1, max: 3, reward: '100' },
            { badgeKey: 'ui_badge_xp', title: 'Выживите в 2 матчах', cur: 1, max: 2, reward: '150' }
        ];

        const rowStep = isCompact ? 32 : 38;
        const rowStartOffsetY = isCompact ? 36 : 46;

        questsData.forEach((q, idx) => {
            const rowY = questBoxY - questBoxH / 2 + rowStartOffsetY + (idx * rowStep);
            const rowBg = this.add.rectangle(rightColX, rowY, questBoxW - 14, isCompact ? 26 : 32, 0x1e293b, 0.85).setDepth(11);
            rowBg.setStrokeStyle(1, 0x334155);

            this.add.image(rightColX - questBoxW / 2 + 18, rowY, q.badgeKey).setDisplaySize(isCompact ? 18 : 24, isCompact ? 18 : 24).setDepth(12);

            this.add.text(rightColX - questBoxW / 2 + 34, rowY - (isCompact ? 5 : 6), q.title, {
                fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0, 0.5).setDepth(12);

            const barW = isCompact ? 75 : 105;
            const pct = Math.min(1, q.cur / q.max);
            this.add.rectangle(rightColX - questBoxW / 2 + 34 + barW / 2, rowY + (isCompact ? 5 : 7), barW, 3, 0x0f172a).setDepth(12);
            this.add.rectangle(rightColX - questBoxW / 2 + 34, rowY + (isCompact ? 5 : 7), barW * pct, 3, 0x38bdf8).setOrigin(0, 0.5).setDepth(13);

            this.add.text(rightColX + questBoxW / 2 - 28, rowY, q.reward, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(1, 0.5).setDepth(12);
            this.add.image(rightColX + questBoxW / 2 - 16, rowY, 'ui_coin').setScale(isCompact ? 0.5 : 0.65).setDepth(12);
        });

        // Кнопка ВСЕ ЗАДАНИЯ
        const allQBtnH = isCompact ? 20 : 24;
        const allQBtn = this.add.rectangle(rightColX, questBoxY + questBoxH / 2 - (isCompact ? 14 : 18), questBoxW - 20, allQBtnH, 0x1e1b4b, 0.95).setInteractive({ useHandCursor: true }).setDepth(11);
        allQBtn.setStrokeStyle(1, 0x6366f1);
        this.add.text(rightColX, questBoxY + questBoxH / 2 - (isCompact ? 14 : 18), 'ВСЕ ЗАДАНИЯ', {
            fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#a5b4fc', letterSpacing: 1
        }).setOrigin(0.5).setDepth(12);
        allQBtn.on('pointerdown', () => this.openAchievementsModal());

        // 2. ВИДЖЕТ СЕЗОНА (БОЕВОЙ ПРОПУСК)
        const seasonY = questBoxY + questBoxH / 2 + (isCompact ? 36 : 55);
        const sBoxH = isCompact ? 50 : 76;
        const sBox = this.add.rectangle(rightColX, seasonY, questBoxW, sBoxH, 0x0f172a, 0.95).setDepth(10);
        sBox.setStrokeStyle(1.5, 0x6366f1);

        this.add.text(rightColX - questBoxW / 2 + 12, seasonY - (isCompact ? 14 : 24), 'СЕЗОН 1: ТЬМА НАСТУПАЕТ', {
            fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '12px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0, 0.5).setDepth(11);

        this.add.text(rightColX + questBoxW / 2 - 12, seasonY - (isCompact ? 14 : 24), '24 Д', {
            fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '9px' : '10px', fontStyle: 'bold', color: '#94a3b8'
        }).setOrigin(1, 0.5).setDepth(11);

        const bpW = isCompact ? 80 : 100;
        this.add.rectangle(rightColX - 10, seasonY + (isCompact ? 8 : 8), bpW, 6, 0x1e1b4b).setDepth(11);
        this.add.rectangle(rightColX - 10 - bpW / 2, seasonY + (isCompact ? 8 : 8), bpW * 0.65, 6, 0xa855f7).setOrigin(0, 0.5).setDepth(12);

        const bpBtn = this.add.rectangle(rightColX + questBoxW / 2 - 28, seasonY + 8, isCompact ? 44 : 56, isCompact ? 18 : 24, 0x7c3aed).setInteractive({ useHandCursor: true }).setDepth(11);
        this.add.text(rightColX + questBoxW / 2 - 28, seasonY + 8, 'БОНУС', {
            fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '8px' : '10px', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(12);
        bpBtn.on('pointerdown', () => this.openAchievementsModal());

        // 3. ВИДЖЕТ НОВОСТЕЙ (показываем только на экранах высотой >= 520px)
        if (height >= 520) {
            const newsY = seasonY + 88;
            const newsBox = this.add.rectangle(rightColX, newsY, questBoxW, 84, 0x0f172a, 0.95).setDepth(10);
            newsBox.setStrokeStyle(1.5, 0x334155);

            this.add.text(rightColX - questBoxW / 2 + 15, newsY - 26, 'НОВОСТИ', {
                fontFamily: CONFIG.FONTS.UI, fontSize: '11px', fontStyle: 'bold', color: '#94a3b8'
            }).setOrigin(0, 0.5).setDepth(11);

            this.add.text(rightColX - questBoxW / 2 + 15, newsY - 6, 'РЕЖИМ НА ДВОИХ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '13px', fontStyle: 'bold', color: '#38bdf8'
            }).setOrigin(0, 0.5).setDepth(11);

            this.add.text(rightColX - questBoxW / 2 + 15, newsY + 20, 'УЖЕ ДОСТУПЕН!', {
                fontFamily: CONFIG.FONTS.UI, fontSize: '10px', fontStyle: 'bold', color: '#94a3b8'
            }).setOrigin(0, 0.5).setDepth(11);

            this.add.image(rightColX + questBoxW / 2 - 40, newsY, 'ui_coop').setDisplaySize(44, 44).setDepth(11);
        }
    }

    createBottomTabBar(width, height, isPortrait, lang) {
        const isCompact = !isPortrait && height < 520;
        const barY = height - (isCompact ? 25 : (isPortrait ? 35 : 45));
        const tabs = [
            { iconKey: 'ui_chest_gold', title: isCompact ? 'СУНДУК' : 'БЕСПЛАТНЫЙ\nСУНДУК', badge: '1', action: () => this.claimFreeChest() },
            { iconKey: 'ui_3d_gem_card', title: 'УСИЛЕНИЯ', badge: '', action: () => this.openTalentsModal() },
            { iconKey: 'ui_3d_book_card', title: 'КОЛЛЕКЦИЯ', badge: '', action: () => this.openEvolutionModal() },
            { iconKey: 'ui_3d_shield_card', title: isCompact ? 'ЛИДЕРЫ' : 'ТАБЛИЦЫ\nЛИДЕРОВ', badge: '', action: () => this.openLeaderboardModal() }
        ];

        const tabSpacing = isPortrait ? Math.min(85, (width - 40) / 4) : (isCompact ? 100 : 135);
        const totalW = tabSpacing * (tabs.length - 1);
        const startX = width / 2 - totalW / 2;

        tabs.forEach((tab, idx) => {
            const tx = startX + (idx * tabSpacing);
            const btnW = isPortrait ? 75 : (isCompact ? 90 : 115);
            const btnH = isPortrait ? 44 : (isCompact ? 36 : 52);

            const tabBg = this.add.image(tx, barY, 'card_tab_glass').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true }).setDepth(10);
            tabBg.on('pointerover', () => tabBg.setTint(0xc4b5fd));
            tabBg.on('pointerout', () => tabBg.clearTint());
            tabBg.on('pointerdown', tab.action);

            this.add.image(tx, barY - (isCompact ? 6 : (isPortrait ? 6 : 10)), tab.iconKey).setDisplaySize(isCompact ? 20 : 28, isCompact ? 20 : 28).setDepth(11);

            this.add.text(tx, barY + (isCompact ? 8 : (isPortrait ? 12 : 14)), tab.title, {
                fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '8px' : (isPortrait ? '9px' : '10px'), fontStyle: 'bold', color: '#94a3b8', align: 'center'
            }).setOrigin(0.5).setDepth(11);

            if (tab.badge) {
                this.add.circle(tx + btnW / 2 - 8, barY - btnH / 2 + 8, isCompact ? 5 : 7, 0xef4444).setDepth(12);
                this.add.text(tx + btnW / 2 - 8, barY - btnH / 2 + 8, tab.badge, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '7px' : '9px', fontStyle: 'bold', color: '#fff'
                }).setOrigin(0.5).setDepth(13);
            }
        });
    }

    createPortraitLayout(width, height, lang) {
        const centerX = width / 2;

        if (this.textures.exists('ui_logo_crest')) {
            this.add.image(centerX, 90, 'ui_logo_crest').setDisplaySize(220, 110).setDepth(10);
        }

        const playY = height * 0.65;
        const playBtn = this.add.image(centerX, playY, 'btn_play_bg').setDisplaySize(Math.min(width - 40, 320), 62).setInteractive({ useHandCursor: true }).setDepth(10);

        this.add.image(centerX - 95, playY, 'ui_swords').setScale(0.9).setDepth(11);
        this.add.text(centerX - 65, playY - 11, 'PLAY', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '22px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(11);
        this.add.text(centerX - 65, playY + 12, 'ОДИНОЧНЫЙ РЕЖИМ', {
            fontFamily: CONFIG.FONTS.UI, fontSize: '11px', fontStyle: '700', color: '#e9d5ff', letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(11);

        playBtn.on('pointerdown', () => this.openHeroSelectModal());

        const coopY = playY + 72;
        const coopBtn = this.add.image(centerX, coopY, 'btn_coop_bg').setDisplaySize(Math.min(width - 40, 320), 56).setInteractive({ useHandCursor: true }).setDepth(10);

        this.add.image(centerX - 95, coopY, 'ui_coop').setScale(0.9).setDepth(11);
        this.add.text(centerX - 65, coopY - 9, 'CO-OP', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '20px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 2
        }).setOrigin(0, 0.5).setDepth(11);
        this.add.text(centerX - 65, coopY + 11, 'РЕЖИМ НА ДВОИХ', {
            fontFamily: CONFIG.FONTS.UI, fontSize: '11px', fontStyle: '700', color: '#bae6fd', letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(11);

        coopBtn.on('pointerdown', () => this.openCoopModal());

        const mapY = coopY + 60;
        const mapBtn = this.add.image(centerX, mapY, 'btn_glass_sub').setDisplaySize(Math.min(width - 40, 320), 44).setInteractive({ useHandCursor: true }).setDepth(10);
        this.add.image(centerX - 95, mapY, 'ui_trophy').setScale(0.8).setDepth(11);
        this.add.text(centerX - 65, mapY, 'ВЫБОР КАРТЫ (АРЕНЫ)', {
            fontFamily: CONFIG.FONTS.UI, fontSize: '13px', fontStyle: '800', color: '#38bdf8', letterSpacing: 1
        }).setOrigin(0, 0.5).setDepth(11);
        mapBtn.on('pointerdown', () => this.openMapSelectModal());
    }

    claimFreeChest() {
        window.Sound.playChest();
        const goldGain = 150;
        window.SaveManager.addGold(goldGain);
        if (this.goldText) this.goldText.setText(`${window.SaveManager.data.gold}`);

        const { width, height } = this.scale;
        const alert = this.add.text(width / 2, height / 2 - 50, `+${goldGain} ЗОЛОТА ИЗ СУНДУКА!`, {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: '22px', fontStyle: 'bold', color: '#ffd166', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(1500);

        this.tweens.add({
            targets: alert,
            y: alert.y - 60,
            alpha: 0,
            scale: 1.2,
            duration: 1500,
            onComplete: () => alert.destroy()
        });
    }

    startBattleTransition(sceneKey, data) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        window.Sound.playLevelUp();
        window.Sound.fadeOutBGM(500);

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(sceneKey, data);
        });
    }

    closeCurrentModal() {
        if (this.heroCardGroup) {
            this.heroCardGroup.destroy(true);
            this.heroCardGroup = null;
        }
        if (this.mapCardGroup) {
            this.mapCardGroup.destroy(true);
            this.mapCardGroup = null;
        }
        if (this.coopPicksGroup) {
            this.coopPicksGroup.destroy(true);
            this.coopPicksGroup = null;
        }
        if (this.currentModal) {
            this.currentModal.destroy(true);
            this.currentModal = null;
        }
    }

    // --- МОДАЛЬНОЕ ОКНО ВЫБОРА ГЕРОЯ (ПРИ КЛИКЕ НА PLAY) ---
    openHeroSelectModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const lang = window.SaveManager.data.lang || 'ru';
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        // Синхронизируем индекс с сохраненным героем
        const savedHero = window.SaveManager.data.selectedHero || 'knight';
        const savedIdx = this.heroesList.indexOf(savedHero);
        if (savedIdx >= 0) this.currentHeroIdx = savedIdx;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 400) : (isCompact ? Math.min(width - 16, 820) : Math.min(width - 40, 940));
        const modalH = isPortrait ? Math.min(height - 16, 640) : (isCompact ? Math.min(height - 16, 370) : Math.min(height - 20, 540));

        // Главный фрейм окна с золотой каймой и свечением
        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0xd97706);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'ВЫБЕРИТЕ ГЕРОЯ ДЛЯ БОЯ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '14px' : (isPortrait ? '16px' : '20px'), fontStyle: 'bold', color: '#ffd166', letterSpacing: 1.5
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        // Круглая кнопка закрытия
        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const cardGroup = this.add.group();
        this.heroCardGroup = cardGroup;

        const renderHeroCards = () => {
            cardGroup.clear(true, true);
            const currentHeroId = this.heroesList[this.currentHeroIdx];
            const currentHeroCfg = CONFIG.HEROES[currentHeroId];

            // 1. ЛЕНТА ГЕРОЕВ (Слева или сверху)
            const heroCount = this.heroesList.length;
            const heroCardW = isPortrait ? Math.min(64, (modalW - 40) / heroCount) : (isCompact ? 115 : 140);
            const heroCardH = isPortrait ? 68 : (isCompact ? 46 : 76);
            const stepX = (modalW - 30) / heroCount;
            const startX = isPortrait ? (width / 2 - (modalW - 30) / 2 + stepX / 2) : (width / 2 - modalW / 2 + (isCompact ? 68 : 95));
            const startY = isPortrait ? (height / 2 - modalH / 2 + 75) : (height / 2 - (isCompact ? 110 : 160));

            this.heroesList.forEach((hId, idx) => {
                const isSelected = idx === this.currentHeroIdx;
                const isUnlocked = window.SaveManager.isHeroUnlocked(hId);
                const hx = isPortrait ? startX + (idx * stepX) : startX;
                const hy = isPortrait ? startY : startY + (idx * (heroCardH + (isCompact ? 6 : 12)));

                const onSelect = () => {
                    this.currentHeroIdx = idx;
                    if (isUnlocked) {
                        window.SaveManager.data.selectedHero = hId;
                        window.SaveManager.save();
                    }
                    window.Sound.playShoot();
                    renderHeroCards();
                };

                // Фон карточки героя
                const hCard = this.add.rectangle(hx, hy, heroCardW, heroCardH, isSelected ? 0x1e1b4b : (isUnlocked ? 0x0f172a : 0x090d16), 0.95).setInteractive({ useHandCursor: true }).setDepth(1002);
                hCard.setStrokeStyle(isSelected ? 2 : 1, isSelected ? 0xffd166 : (isUnlocked ? 0x334155 : 0x1e293b));
                hCard.on('pointerdown', onSelect);
                cardGroup.add(hCard);

                // Спрайт героя
                const spr = this.add.sprite(isPortrait ? hx : hx - (isCompact ? 32 : 40), isPortrait ? hy - 10 : hy, `hero_${hId}`)
                    .setDisplaySize(isPortrait ? 34 : (isCompact ? 34 : 46), isPortrait ? 34 : (isCompact ? 34 : 46)).setInteractive({ useHandCursor: true }).setDepth(1003);
                spr.on('pointerdown', onSelect);
                cardGroup.add(spr);

                // Имя героя
                if (!isPortrait) {
                    const nameT = this.add.text(hx - (isCompact ? 10 : 10), hy - (isCompact ? 8 : 12), CONFIG.HEROES[hId].name[lang], {
                        fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '11px' : '13px', fontStyle: 'bold', color: isSelected ? '#ffd166' : (isUnlocked ? '#f1f5f9' : '#64748b')
                    }).setInteractive({ useHandCursor: true }).setDepth(1003);
                    nameT.on('pointerdown', onSelect);
                    cardGroup.add(nameT);

                    const classT = this.add.text(hx - (isCompact ? 10 : 10), hy + (isCompact ? 6 : 4), isUnlocked ? 'ДОСТУПЕН' : `${CONFIG.HEROES[hId].price} ЗОЛ.`, {
                        fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: isUnlocked ? '#34d399' : '#f59e0b'
                    }).setInteractive({ useHandCursor: true }).setDepth(1003);
                    classT.on('pointerdown', onSelect);
                    cardGroup.add(classT);
                } else {
                    const nameT = this.add.text(hx, hy + 20, CONFIG.HEROES[hId].name[lang], {
                        fontFamily: CONFIG.FONTS.UI, fontSize: '9px', fontStyle: 'bold', color: isSelected ? '#ffd166' : (isUnlocked ? '#e2e8f0' : '#64748b')
                    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1003);
                    nameT.on('pointerdown', onSelect);
                    cardGroup.add(nameT);
                }

                if (!isUnlocked) {
                    spr.setTint(0x475569);
                }
            });

            // 2. ДЕТАЛЬНАЯ ВИТРИНА ГЕРОЯ (Справа или снизу)
            const detailX = isPortrait ? width / 2 : width / 2 + (isCompact ? 68 : 100);
            const detailY = isPortrait ? (height / 2 + modalH / 2 - (modalH - 130) / 2 - 10) : (height / 2 + (isCompact ? 14 : 15));
            const detailW = isPortrait ? (modalW - 24) : (isCompact ? (modalW - 150) : 560);
            const detailH = isPortrait ? (modalH - 135) : (isCompact ? (modalH - 50) : 400);

            const dPanel = this.add.rectangle(detailX, detailY, detailW, detailH, 0x0f172a, 0.95).setDepth(1002);
            dPanel.setStrokeStyle(1.5, 0x1e293b);
            cardGroup.add(dPanel);

            // Пьедестал и герой
            const stageX = isPortrait ? detailX - detailW / 2 + 55 : (isCompact ? detailX - detailW / 2 + 55 : detailX - 170);
            const stageY = isPortrait ? detailY - detailH / 2 + 65 : (isCompact ? detailY - 30 : detailY - 40);

            const pedestal = this.add.image(stageX, stageY + (isCompact ? 35 : 55), 'hero_pedestal_glow').setScale(isCompact ? 0.7 : (isPortrait ? 0.8 : 0.95)).setDepth(1003);
            cardGroup.add(pedestal);

            const spriteSize = isCompact ? 64 : (isPortrait ? 76 : 100);
            const bigSprite = this.add.sprite(stageX, stageY, `hero_${currentHeroId}`).setDisplaySize(spriteSize, spriteSize).setDepth(1004);
            cardGroup.add(bigSprite);

            this.tweens.add({
                targets: bigSprite,
                y: stageY - 6,
                scaleY: bigSprite.scaleY * 1.05,
                scaleX: bigSprite.scaleX * 0.96,
                duration: 1100,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Заголовок и описание
            const infoX = isPortrait ? detailX - detailW / 2 + 115 : (isCompact ? detailX - detailW / 2 + 120 : detailX - 70);
            const infoTopY = detailY - detailH / 2 + (isCompact ? 12 : 20);

            const heroName = this.add.text(infoX, infoTopY, currentHeroCfg.name[lang].toUpperCase(), {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '16px' : (isPortrait ? '18px' : '22px'), fontStyle: 'bold', color: '#ffd166', letterSpacing: 1
            }).setDepth(1003);
            cardGroup.add(heroName);

            const descWrapW = isPortrait ? (detailW - 130) : (isCompact ? (detailW - 135) : 330);
            const heroDesc = this.add.text(infoX, infoTopY + (isCompact ? 22 : 28), currentHeroCfg.desc[lang], {
                fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '10px' : '11px', color: '#94a3b8', wordWrap: { width: descWrapW }
            }).setDepth(1003);
            cardGroup.add(heroDesc);

            // Стартовое оружие (Бейдж)
            const wepCfg = CONFIG.WEAPONS[currentHeroCfg.weapon];
            const wepBoxW = isPortrait ? (detailW - 24) : (isCompact ? (detailW - 135) : 330);
            const wepBoxY = isPortrait ? (detailY - detailH / 2 + 130) : (infoTopY + (isCompact ? 56 : 72));
            const wepBoxCenterX = isPortrait ? detailX : (infoX + wepBoxW / 2);

            if (wepCfg) {
                const wepBox = this.add.rectangle(wepBoxCenterX, wepBoxY, wepBoxW, isCompact ? 28 : 34, 0x1e293b, 0.9).setDepth(1003);
                wepBox.setStrokeStyle(1, 0x334155);
                cardGroup.add(wepBox);

                const wepIcon = this.add.image(wepBoxCenterX - wepBoxW / 2 + 16, wepBoxY, wepCfg.icon).setScale(isCompact ? 0.45 : 0.55).setDepth(1004);
                cardGroup.add(wepIcon);

                const wepLabel = this.add.text(wepBoxCenterX - wepBoxW / 2 + 36, wepBoxY - (isCompact ? 6 : 8), `ОРУЖИЕ: ${wepCfg.name[lang].toUpperCase()}`, {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#38bdf8'
                }).setDepth(1004);
                cardGroup.add(wepLabel);

                const wepDesc = this.add.text(wepBoxCenterX - wepBoxW / 2 + 36, wepBoxY + (isCompact ? 4 : 5), wepCfg.desc[lang], {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '8px' : '10px', color: '#cbd5e1', wordWrap: { width: wepBoxW - 45 }
                }).setDepth(1004);
                cardGroup.add(wepDesc);
            }

            // Визуальные шкалы характеристик (Stat Progress Bars)
            const bStats = currentHeroCfg.baseStats;
            const statsData = [
                { icon: 'stat_icon_hp', label: 'HP', val: `${bStats.hp}`, ratio: Math.min(1.0, bStats.hp / 160), color: 0xef4444 },
                { icon: 'stat_icon_spd', label: 'СКОРОСТЬ', val: `${bStats.speed}`, ratio: Math.min(1.0, bStats.speed / 240), color: 0xfacc15 },
                { icon: 'stat_icon_dmg', label: 'УРОН', val: `${bStats.damageMulti}x`, ratio: Math.min(1.0, bStats.damageMulti / 1.5), color: 0xf97316 },
                { icon: 'stat_icon_crit', label: 'КРИТ', val: `${Math.round(bStats.critChance * 100)}%`, ratio: Math.min(1.0, bStats.critChance / 0.25), color: 0xc084fc }
            ];

            const barStartX = isPortrait ? (detailX - detailW / 2 + 14) : infoX;
            const barStartY = isPortrait ? (detailY - detailH / 2 + 160) : (wepBoxY + (isCompact ? 22 : 30));
            const barW = isPortrait ? (detailW - 130) : (isCompact ? (detailW - 250) : 240);
            const barSpacing = isCompact ? 18 : (isPortrait ? 20 : 24);

            statsData.forEach((st, sIdx) => {
                const sy = barStartY + (sIdx * barSpacing);

                const stIcon = this.add.image(barStartX + 6, sy + 6, st.icon).setScale(isCompact ? 0.7 : 0.85).setDepth(1004);
                cardGroup.add(stIcon);

                const stLabel = this.add.text(barStartX + 18, sy, st.label, {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#94a3b8'
                }).setDepth(1004);
                cardGroup.add(stLabel);

                const trackX = barStartX + 75;
                const trackW = Math.max(30, barW);
                const track = this.add.rectangle(trackX + trackW / 2, sy + 5, trackW, isCompact ? 4 : 6, 0x1e293b).setDepth(1003);
                track.setStrokeStyle(1, 0x334155);
                cardGroup.add(track);

                const fillW = Math.max(3, trackW * st.ratio);
                const fill = this.add.rectangle(trackX, sy + 5, fillW, isCompact ? 4 : 6, st.color).setOrigin(0, 0.5).setDepth(1004);
                cardGroup.add(fill);

                const stVal = this.add.text(trackX + trackW + 8, sy, st.val, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '11px', fontStyle: 'bold', color: '#ffffff'
                }).setOrigin(0, 0).setDepth(1004);
                cardGroup.add(stVal);
            });

            // Индикатор выбранной карты
            const currentMapId = window.SaveManager.data.selectedMap || 'dark_castle';
            const currentMapCfg = (CONFIG.MAPS && CONFIG.MAPS[currentMapId]) ? CONFIG.MAPS[currentMapId] : CONFIG.MAPS.dark_castle;
            const isUnlocked = window.SaveManager.isHeroUnlocked(currentHeroId);
            const actionBtnY = detailY + detailH / 2 - (isCompact ? 22 : 28);
            const mapBarY = actionBtnY - (isCompact ? 28 : 34);
            const barFullW = Math.min(detailW - 24, 360);

            const mapBar = this.add.rectangle(detailX, mapBarY, barFullW, isCompact ? 22 : 26, 0x1e293b, 0.95).setInteractive({ useHandCursor: true }).setDepth(1003);
            mapBar.setStrokeStyle(1, 0x0ea5e9);
            cardGroup.add(mapBar);

            const mapIcon = this.add.image(detailX - barFullW / 2 + 14, mapBarY, 'ui_trophy').setScale(isCompact ? 0.5 : 0.6).setDepth(1004);
            cardGroup.add(mapIcon);

            const mapNameText = this.add.text(detailX - barFullW / 2 + 26, mapBarY, `АРЕНА: ${currentMapCfg.name[lang].toUpperCase()}`, {
                fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#38bdf8'
            }).setOrigin(0, 0.5).setDepth(1004);
            cardGroup.add(mapNameText);

            const changeMapText = this.add.text(detailX + barFullW / 2 - 8, mapBarY, 'СМЕНИТЬ ›', {
                fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(1, 0.5).setDepth(1004);
            cardGroup.add(changeMapText);

            mapBar.on('pointerdown', () => this.openMapSelectModal());

            if (isUnlocked) {
                const battleBtn = this.add.image(detailX, actionBtnY, 'btn_battle_gold_epic').setDisplaySize(Math.min(barFullW, 260), isCompact ? 34 : 44).setInteractive({ useHandCursor: true }).setDepth(1003);
                const battleTxt = this.add.text(detailX, actionBtnY, 'В БОЙ!', {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '16px' : '20px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 3, letterSpacing: 2
                }).setOrigin(0.5).setDepth(1004);

                battleBtn.on('pointerdown', () => {
                    window.SaveManager.data.selectedHero = currentHeroId;
                    window.SaveManager.save();
                    this.closeCurrentModal();
                    this.startBattleTransition('GameScene', { heroId: currentHeroId, hero: currentHeroId, mapId: window.SaveManager.data.selectedMap || 'dark_castle' });
                });

                cardGroup.add(battleBtn);
                cardGroup.add(battleTxt);
            } else {
                const buyBtn = this.add.image(detailX, actionBtnY, 'btn_unlock_gold').setDisplaySize(Math.min(barFullW, 260), isCompact ? 34 : 44).setInteractive({ useHandCursor: true }).setDepth(1003);
                const buyTxt = this.add.text(detailX, actionBtnY, `РАЗБЛОКИРОВАТЬ (${currentHeroCfg.price} ЗОЛ.)`, {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : '14px', fontStyle: 'bold', color: '#ffffff', stroke: '#000000', strokeThickness: 3
                }).setOrigin(0.5).setDepth(1004);

                buyBtn.on('pointerdown', () => {
                    if (window.SaveManager.unlockHero(currentHeroId, currentHeroCfg.price)) {
                        window.Sound.playJackpot();
                        window.SaveManager.data.selectedHero = currentHeroId;
                        window.SaveManager.save();
                        if (this.goldText) this.goldText.setText(`${window.SaveManager.data.gold}`);
                        renderHeroCards();
                    } else {
                        this.cameras.main.shake(150, 0.005);
                    }
                });

                cardGroup.add(buyBtn);
                cardGroup.add(buyTxt);
            }
        };

        renderHeroCards();
    }

    // --- МОДАЛЬНОЕ ОКНО ТАЛАНТОВ (ТАЛАНТЫ И УСИЛЕНИЯ) ---
    // --- МОДАЛЬНОЕ ОКНО ТАЛАНТОВ И УСИЛЕНИЙ ---
    openTalentsModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const lang = window.SaveManager.data.lang || 'ru';
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 400) : (isCompact ? Math.min(width - 16, 820) : Math.min(width - 40, 860));
        const modalH = isPortrait ? Math.min(height - 16, 640) : (isCompact ? Math.min(height - 16, 370) : Math.min(height - 20, 520));

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0xa855f7);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'ДЕРЕВО ТАЛАНТОВ И УСИЛЕНИЙ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '13px' : (isPortrait ? '15px' : '20px'), fontStyle: 'bold', color: '#c084fc', letterSpacing: 1.5
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const talents = Object.entries(CONFIG.TALENTS);
        const totalRows = isPortrait ? talents.length : Math.ceil(talents.length / 2);
        const availableHeight = modalH - (isCompact ? 55 : 85);
        const rowSpacing = Math.min(isCompact ? 48 : (isPortrait ? 60 : 76), availableHeight / totalRows);
        const itemH = isCompact ? 42 : (isPortrait ? 52 : 64);

        talents.forEach(([id, talent], idx) => {
            const col = isPortrait ? 0 : idx % 2;
            const row = isPortrait ? idx : Math.floor(idx / 2);
            
            const colSpacing = isCompact ? (modalW / 2 - 10) : 400;
            const tx = isPortrait ? width / 2 : (width / 2 - colSpacing / 2 + (col * colSpacing));
            const ty = height / 2 - modalH / 2 + (isCompact ? 56 : 85) + (row * rowSpacing);
            const itemW = isPortrait ? (modalW - 24) : (modalW / 2 - (isCompact ? 18 : 26));

            // Тёмная стеклянная карточка таланта
            const itemBg = this.add.rectangle(tx, ty, itemW, itemH, 0x0f172a, 0.95).setDepth(1002);
            itemBg.setStrokeStyle(1.5, 0x1e293b);
            modalGroup.add(itemBg);

            // Иконка таланта
            const iconRadius = isCompact ? 15 : 18;
            const iconBg = this.add.circle(tx - itemW / 2 + (isCompact ? 20 : 26), ty, iconRadius, 0x1e293b).setDepth(1003);
            iconBg.setStrokeStyle(1.5, 0x7e22ce);
            modalGroup.add(iconBg);

            const icon = this.add.image(tx - itemW / 2 + (isCompact ? 20 : 26), ty, talent.icon).setScale(isCompact ? 0.55 : 0.7).setDepth(1004);
            modalGroup.add(icon);

            const curLvl = window.SaveManager.getTalentLevel(id);
            const cost = window.SaveManager.getTalentCost(id);

            // Название и уровень
            const textLeftX = tx - itemW / 2 + (isCompact ? 44 : 54);
            const name = this.add.text(textLeftX, ty - (isCompact ? 13 : 16), talent.name[lang], {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '13px', fontStyle: 'bold', color: '#f8fafc'
            }).setDepth(1003);
            modalGroup.add(name);

            // Описание
            const descText = talent.desc ? talent.desc[lang] : `+${talent.step} за уровень`;
            const desc = this.add.text(textLeftX, ty - (isCompact ? 2 : 2), descText, {
                fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '9px' : '11px', color: '#94a3b8'
            }).setDepth(1003);
            modalGroup.add(desc);

            // Pip-индикаторы прогресса (Сегментные ромбы)
            const pipCount = Math.min(10, talent.max);
            let pipsStr = '';
            for (let p = 0; p < pipCount; p++) {
                pipsStr += (p < curLvl) ? '◆ ' : '◇ ';
            }
            const pipsText = this.add.text(textLeftX, ty + (isCompact ? 9 : 12), `${pipsStr} (${curLvl}/${talent.max})`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: curLvl >= talent.max ? '#ffd166' : '#38bdf8'
            }).setDepth(1003);
            modalGroup.add(pipsText);

            if (curLvl >= talent.max) {
                const maxBadgeW = isCompact ? 54 : 68;
                const maxBadge = this.add.rectangle(tx + itemW / 2 - maxBadgeW / 2 - 8, ty, maxBadgeW, isCompact ? 22 : 28, 0x1e1b4b).setDepth(1003);
                maxBadge.setStrokeStyle(1.5, 0xffd166);
                modalGroup.add(maxBadge);

                const maxText = this.add.text(tx + itemW / 2 - maxBadgeW / 2 - 8, ty, 'МАКС', {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: '#ffd166'
                }).setOrigin(0.5).setDepth(1004);
                modalGroup.add(maxText);
            } else {
                const btnW = isCompact ? 62 : 74;
                const btnH = isCompact ? 24 : 30;
                const upBtn = this.add.rectangle(tx + itemW / 2 - btnW / 2 - 8, ty, btnW, btnH, 0xd97706).setInteractive({ useHandCursor: true }).setDepth(1003);
                upBtn.setStrokeStyle(1.5, 0xfef08a);
                
                const coinIcon = this.add.image(tx + itemW / 2 - btnW + 12, ty, 'ui_coin').setScale(isCompact ? 0.55 : 0.7).setDepth(1004);
                const costText = this.add.text(tx + itemW / 2 - btnW / 2 + 6, ty, `${cost}`, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '11px' : '13px', fontStyle: 'bold', color: '#ffffff'
                }).setOrigin(0.5).setDepth(1004);

                upBtn.on('pointerdown', () => {
                    if (window.SaveManager.upgradeTalent(id)) {
                        window.Sound.playCoin();
                        if (this.goldText) this.goldText.setText(`${window.SaveManager.data.gold}`);
                        this.openTalentsModal();
                    } else {
                        this.cameras.main.shake(150, 0.005);
                    }
                });

                modalGroup.add(upBtn);
                modalGroup.add(coinIcon);
                modalGroup.add(costText);
            }
        });
    }

    // --- МОДАЛЬНОЕ ОКНО РЕЖИМА НА ДВОИХ (CO-OP) ---
    openCoopModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const lang = window.SaveManager.data.lang || 'ru';
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const availableHeroes = this.heroesList.filter(id => window.SaveManager.isHeroUnlocked(id));
        let p1Idx = 0;
        let p2Idx = Math.min(1, availableHeroes.length - 1);

        const modalW = isPortrait ? Math.min(width - 16, 400) : (isCompact ? Math.min(width - 16, 820) : Math.min(width - 40, 840));
        const modalH = isPortrait ? Math.min(height - 16, 640) : (isCompact ? Math.min(height - 16, 370) : Math.min(height - 20, 520));

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0x0284c7);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'ВЫБОР ГЕРОЕВ ДЛЯ РЕЖИМА НА ДВОИХ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : (isPortrait ? '14px' : '19px'), fontStyle: 'bold', color: '#38bdf8', letterSpacing: 1.5
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const renderCoopPicks = () => {
            if (this.coopPicksGroup) this.coopPicksGroup.destroy(true);
            this.coopPicksGroup = this.add.group();

            const h1 = availableHeroes[p1Idx];
            const h2 = availableHeroes[p2Idx];
            const c1 = CONFIG.HEROES[h1];
            const c2 = CONFIG.HEROES[h2];

            const panelW = isPortrait ? (modalW - 24) : (modalW / 2 - (isCompact ? 16 : 24));
            const panelH = isPortrait ? Math.min(180, (modalH - 165) / 2) : (isCompact ? modalH - 100 : 330);

            // ИГРОК 1 (Слева или сверху)
            const p1X = isPortrait ? width / 2 : width / 2 - panelW / 2 - (isCompact ? 6 : 12);
            const p1Y = isPortrait ? (height / 2 - modalH / 2 + 52 + panelH / 2) : (height / 2 + (isCompact ? 4 : 10));

            const p1Card = this.add.rectangle(p1X, p1Y, panelW, panelH, 0x0f172a, 0.95).setDepth(1002);
            p1Card.setStrokeStyle(1.5, 0x0284c7);
            this.coopPicksGroup.add(p1Card);

            const p1Header = this.add.text(p1X, p1Y - panelH / 2 + (isCompact ? 14 : 18), 'ИГРОК 1 (WASD)', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : '15px', fontStyle: 'bold', color: '#38bdf8', letterSpacing: 1
            }).setOrigin(0.5).setDepth(1003);
            this.coopPicksGroup.add(p1Header);

            const p1Pedestal = this.add.image(p1X, p1Y + (isCompact ? 28 : 40), 'hero_pedestal_glow').setScale(isCompact ? 0.65 : 0.85).setDepth(1003);
            this.coopPicksGroup.add(p1Pedestal);

            const sprSize = isCompact ? 60 : (isPortrait ? 65 : 85);
            const p1Sprite = this.add.sprite(p1X, p1Y - (isCompact ? 6 : 10), `hero_${h1}`).setDisplaySize(sprSize, sprSize).setDepth(1004);
            this.coopPicksGroup.add(p1Sprite);

            const p1Name = this.add.text(p1X, p1Y + panelH / 2 - (isCompact ? 28 : 34), c1.name[lang].toUpperCase(), {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '13px' : '15px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5).setDepth(1003);
            this.coopPicksGroup.add(p1Name);

            const p1Wep = this.add.text(p1X, p1Y + panelH / 2 - (isCompact ? 12 : 16), `Оружие: ${CONFIG.WEAPONS[c1.weapon].name[lang]}`, {
                fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '10px' : '11px', color: '#94a3b8'
            }).setOrigin(0.5).setDepth(1003);
            this.coopPicksGroup.add(p1Wep);

            const p1Left = this.add.text(p1X - panelW / 2 + 18, p1Y, '◀', { fontSize: isCompact ? '18px' : '22px', color: '#38bdf8' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1004);
            p1Left.on('pointerdown', () => {
                p1Idx = (p1Idx - 1 + availableHeroes.length) % availableHeroes.length;
                window.Sound.playShoot();
                renderCoopPicks();
            });
            this.coopPicksGroup.add(p1Left);

            const p1Right = this.add.text(p1X + panelW / 2 - 18, p1Y, '▶', { fontSize: isCompact ? '18px' : '22px', color: '#38bdf8' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1004);
            p1Right.on('pointerdown', () => {
                p1Idx = (p1Idx + 1) % availableHeroes.length;
                window.Sound.playShoot();
                renderCoopPicks();
            });
            this.coopPicksGroup.add(p1Right);

            // ИГРОК 2 (Справа или снизу)
            const p2X = isPortrait ? width / 2 : width / 2 + panelW / 2 + (isCompact ? 6 : 12);
            const p2Y = isPortrait ? (p1Y + panelH + 10) : (height / 2 + (isCompact ? 4 : 10));

            const p2Card = this.add.rectangle(p2X, p2Y, panelW, panelH, 0x0f172a, 0.95).setDepth(1002);
            p2Card.setStrokeStyle(1.5, 0xa855f7);
            this.coopPicksGroup.add(p2Card);

            const p2Header = this.add.text(p2X, p2Y - panelH / 2 + (isCompact ? 14 : 18), 'ИГРОК 2 (СТРЕЛКИ)', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : '15px', fontStyle: 'bold', color: '#c084fc', letterSpacing: 1
            }).setOrigin(0.5).setDepth(1003);
            this.coopPicksGroup.add(p2Header);

            const p2Pedestal = this.add.image(p2X, p2Y + (isCompact ? 28 : 40), 'hero_pedestal_glow').setScale(isCompact ? 0.65 : 0.85).setDepth(1003);
            this.coopPicksGroup.add(p2Pedestal);

            const p2Sprite = this.add.sprite(p2X, p2Y - (isCompact ? 6 : 10), `hero_${h2}`).setDisplaySize(sprSize, sprSize).setDepth(1004);
            this.coopPicksGroup.add(p2Sprite);

            const p2Name = this.add.text(p2X, p2Y + panelH / 2 - (isCompact ? 28 : 34), c2.name[lang].toUpperCase(), {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '13px' : '15px', fontStyle: 'bold', color: '#ffffff'
            }).setOrigin(0.5).setDepth(1003);
            this.coopPicksGroup.add(p2Name);

            const p2Wep = this.add.text(p2X, p2Y + panelH / 2 - (isCompact ? 12 : 16), `Оружие: ${CONFIG.WEAPONS[c2.weapon].name[lang]}`, {
                fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '10px' : '11px', color: '#94a3b8'
            }).setOrigin(0.5).setDepth(1003);
            this.coopPicksGroup.add(p2Wep);

            const p2Left = this.add.text(p2X - panelW / 2 + 18, p2Y, '◀', { fontSize: isCompact ? '18px' : '22px', color: '#a855f7' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1004);
            p2Left.on('pointerdown', () => {
                p2Idx = (p2Idx - 1 + availableHeroes.length) % availableHeroes.length;
                window.Sound.playShoot();
                renderCoopPicks();
            });
            this.coopPicksGroup.add(p2Left);

            const p2Right = this.add.text(p2X + panelW / 2 - 18, p2Y, '▶', { fontSize: isCompact ? '18px' : '22px', color: '#a855f7' }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(1004);
            p2Right.on('pointerdown', () => {
                p2Idx = (p2Idx + 1) % availableHeroes.length;
                window.Sound.playShoot();
                renderCoopPicks();
            });
            this.coopPicksGroup.add(p2Right);
        };

        renderCoopPicks();

        // Кнопка СТАРТ CO-OP
        const startBtnY = height / 2 + modalH / 2 - (isCompact ? 22 : 30);
        const startBtn = this.add.image(width / 2, startBtnY, 'btn_coop_bg').setDisplaySize(isCompact ? 200 : 250, isCompact ? 32 : 44).setInteractive({ useHandCursor: true }).setDepth(1003);
        const startTxt = this.add.text(width / 2, startBtnY, 'НАЧАТЬ СОВМЕСТНЫЙ БОЙ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : '15px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 1.5
        }).setOrigin(0.5).setDepth(1004);

        startBtn.on('pointerdown', () => {
            const h1 = availableHeroes[p1Idx];
            const h2 = availableHeroes[p2Idx];
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').catch(() => {});
            }
            if (this.coopPicksGroup) this.coopPicksGroup.destroy(true);
            this.closeCurrentModal();
            this.startBattleTransition('CoopGameScene', { hero1Id: h1, hero2Id: h2 });
        });

        modalGroup.add(startBtn);
        modalGroup.add(startTxt);
    }

    // --- МОДАЛЬНОЕ ОКНО ДОСТИЖЕНИЙ ---
    openAchievementsModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const lang = window.SaveManager.data.lang || 'ru';
        const quests = QuestManager.QUESTS;
        const userQuests = window.SaveManager.data.quests || {};
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 400) : (isCompact ? Math.min(width - 16, 820) : Math.min(width - 40, 840));
        const modalH = isPortrait ? Math.min(height - 16, 620) : (isCompact ? Math.min(height - 16, 370) : Math.min(height - 20, 500));

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0xd97706);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'ДОСТИЖЕНИЯ И НАГРАДЫ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '14px' : (isPortrait ? '16px' : '21px'), fontStyle: 'bold', color: '#ffd166', letterSpacing: 1.5
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const questList = Object.values(quests);
        const availableH = modalH - (isCompact ? 55 : 80);
        const rowSpacing = Math.min(isCompact ? 40 : (isPortrait ? 52 : 48), availableH / questList.length);
        const rowH = rowSpacing - (isCompact ? 4 : 6);

        let startY = height / 2 - modalH / 2 + (isCompact ? 50 : 68);

        questList.forEach((q) => {
            const isDone = !!userQuests[q.id];

            const rowBg = this.add.rectangle(width / 2, startY + rowH / 2, modalW - (isCompact ? 24 : 40), rowH, isDone ? 0x064e3b : 0x0f172a, 0.95).setDepth(1002);
            rowBg.setStrokeStyle(1, isDone ? 0x10b981 : 0x1e293b);
            modalGroup.add(rowBg);

            const iconImg = this.add.image(width / 2 - modalW / 2 + (isCompact ? 24 : 36), startY + rowH / 2, q.iconKey || 'ui_trophy').setScale(isCompact ? 0.6 : (isPortrait ? 0.75 : 0.85)).setDepth(1003);
            modalGroup.add(iconImg);

            const textLeftX = width / 2 - modalW / 2 + (isCompact ? 44 : 60);
            const nameText = this.add.text(textLeftX, startY + (isCompact ? 2 : 4), q.name[lang], {
                fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '11px' : (isPortrait ? '12px' : '14px'), fontStyle: 'bold', color: isDone ? '#34d399' : '#f8fafc'
            }).setDepth(1003);
            modalGroup.add(nameText);

            const descText = this.add.text(textLeftX, startY + (isCompact ? 16 : 20), q.desc[lang], {
                fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '9px' : (isPortrait ? '10px' : '11px'), color: '#94a3b8'
            }).setDepth(1003);
            modalGroup.add(descText);

            const statusText = this.add.text(width / 2 + modalW / 2 - (isCompact ? 20 : 30), startY + rowH / 2, isDone ? 'ВЫПОЛНЕНО ✓' : `+${q.reward} ЗОЛ.`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : (isPortrait ? '12px' : '14px'), fontStyle: 'bold', color: isDone ? '#34d399' : '#ffd166'
            }).setOrigin(1, 0.5).setDepth(1003);
            modalGroup.add(statusText);

            startY += rowSpacing;
        });
    }

    // --- МОДАЛЬНОЕ ОКНО ЭВОЛЮЦИЙ (КНИГА РЕЦЕПТОВ С ИКОНКАМИ) ---
    openEvolutionModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const lang = window.SaveManager.data.lang || 'ru';
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 400) : (isCompact ? Math.min(width - 16, 820) : Math.min(width - 40, 940));
        const modalH = isPortrait ? Math.min(height - 16, 640) : (isCompact ? Math.min(height - 16, 370) : Math.min(height - 20, 540));

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0x0284c7);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'РЕЦЕПТЫ ЭВОЛЮЦИИ СУПЕР-ОРУЖИЯ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : (isPortrait ? '13px' : '20px'), fontStyle: 'bold', color: '#38bdf8', letterSpacing: 1.2
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const evolutions = Object.values(CONFIG.WEAPONS).map(w => ({
            wep: w.id,
            pas: w.requiredPassive,
            sup: w.evolution
        }));

        let startY = height / 2 - modalH / 2 + (isCompact ? 48 : 68);
        const availableH = modalH - (isCompact ? 56 : 85);
        const rowSpacing = Math.min(isCompact ? 48 : (isPortrait ? 82 : 72), availableH / evolutions.length);
        const rowH = rowSpacing - (isCompact ? 4 : 6);

        evolutions.forEach((evo) => {
            const w = CONFIG.WEAPONS[evo.wep];
            const p = CONFIG.PASSIVES[evo.pas];
            const s = CONFIG.SUPER_WEAPONS[evo.sup];
            if (!w || !p || !s) return;

            const rowBg = this.add.rectangle(width / 2, startY + rowH / 2, modalW - (isCompact ? 20 : 40), rowH, 0x0f172a, 0.95).setDepth(1002);
            rowBg.setStrokeStyle(1.5, 0x1e293b);
            modalGroup.add(rowBg);

            const rowMidY = startY + rowH / 2;

            if (isPortrait) {
                // Красивые иконки + название в Portrait
                const wepIcon = this.add.image(width / 2 - modalW / 2 + 35, rowMidY, w.icon).setScale(0.5).setDepth(1003);
                modalGroup.add(wepIcon);

                const plus = this.add.text(width / 2 - modalW / 2 + 65, rowMidY, '+', {
                    fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#94a3b8'
                }).setOrigin(0.5).setDepth(1003);
                modalGroup.add(plus);

                const pasIcon = this.add.image(width / 2 - modalW / 2 + 95, rowMidY, p.icon).setScale(0.5).setDepth(1003);
                modalGroup.add(pasIcon);

                const arrow = this.add.text(width / 2 - modalW / 2 + 125, rowMidY, '➔', {
                    fontSize: '14px', color: '#ffd166'
                }).setOrigin(0.5).setDepth(1003);
                modalGroup.add(arrow);

                const supIcon = this.add.image(width / 2 - modalW / 2 + 155, rowMidY, s.icon).setScale(0.55).setTint(0xffd166).setDepth(1003);
                modalGroup.add(supIcon);

                const supText = this.add.text(width / 2 - modalW / 2 + 180, rowMidY - 7, s.name[lang].toUpperCase(), {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: '11px', fontStyle: 'bold', color: '#ffd166'
                }).setDepth(1003);
                modalGroup.add(supText);

                const compText = this.add.text(width / 2 - modalW / 2 + 180, rowMidY + 7, `${w.name[lang]} + ${p.name[lang]}`, {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: '9px', color: '#94a3b8'
                }).setDepth(1003);
                modalGroup.add(compText);
            } else {
                // 1. Базовое оружие
                const wepLeftX = isCompact ? (width / 2 - modalW / 2 + 25) : (width / 2 - 345);
                const wepIcon = this.add.image(wepLeftX, rowMidY, w.icon).setScale(isCompact ? 0.48 : 0.65).setDepth(1003);
                modalGroup.add(wepIcon);
                
                const wepText = this.add.text(wepLeftX + (isCompact ? 18 : 30), rowMidY - (isCompact ? 6 : 8), w.name[lang], {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '10px' : '13px', fontStyle: 'bold', color: '#ffffff'
                }).setDepth(1003);
                const wepLvl = this.add.text(wepLeftX + (isCompact ? 18 : 30), rowMidY + (isCompact ? 5 : 8), 'Макс. Ур. 5', {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '8px' : '11px', color: '#f59e0b'
                }).setDepth(1003);
                modalGroup.add(wepText);
                modalGroup.add(wepLvl);

                // Плюс
                const plusX = isCompact ? (wepLeftX + 115) : (width / 2 - 175);
                const plus = this.add.text(plusX, rowMidY, '+', {
                    fontFamily: 'sans-serif', fontSize: isCompact ? '14px' : '20px', fontStyle: 'bold', color: '#94a3b8'
                }).setOrigin(0.5).setDepth(1003);
                modalGroup.add(plus);

                // 2. Пассивка
                const pasLeftX = isCompact ? (plusX + 25) : (width / 2 - 135);
                const pasIcon = this.add.image(pasLeftX, rowMidY, p.icon).setScale(isCompact ? 0.48 : 0.65).setDepth(1003);
                modalGroup.add(pasIcon);
                
                const pasText = this.add.text(pasLeftX + (isCompact ? 18 : 30), rowMidY - (isCompact ? 6 : 8), p.name[lang], {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '10px' : '13px', fontStyle: 'bold', color: '#ffffff'
                }).setDepth(1003);
                const pasLvl = this.add.text(pasLeftX + (isCompact ? 18 : 30), rowMidY + (isCompact ? 5 : 8), 'Любой уровень', {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '8px' : '11px', color: '#38bdf8'
                }).setDepth(1003);
                modalGroup.add(pasText);
                modalGroup.add(pasLvl);

                // Стрелка крафта
                const arrowX = isCompact ? (pasLeftX + 115) : (width / 2 + 55);
                const arrow = this.add.text(arrowX, rowMidY, '➔', {
                    fontSize: isCompact ? '14px' : '20px', fontStyle: 'bold', color: '#ffd166'
                }).setOrigin(0.5).setDepth(1003);
                modalGroup.add(arrow);

                // 3. Блок супер-оружия (Эволюция)
                const supBoxW = isCompact ? (modalW - (arrowX + 20) - 20) : 270;
                const supCenterX = isCompact ? (arrowX + 15 + supBoxW / 2) : (width / 2 + 250);
                const supBg = this.add.rectangle(supCenterX, rowMidY, supBoxW, isCompact ? (rowH - 4) : 56, 0x1e1b4b).setDepth(1002);
                supBg.setStrokeStyle(1.5, 0xffd166);
                modalGroup.add(supBg);

                const supIcon = this.add.image(supCenterX - supBoxW / 2 + (isCompact ? 16 : 24), rowMidY, s.icon).setScale(isCompact ? 0.5 : 0.68).setTint(0xffd166).setDepth(1003);
                modalGroup.add(supIcon);

                const supText = this.add.text(supCenterX - supBoxW / 2 + (isCompact ? 34 : 52), rowMidY - (isCompact ? 7 : 11), s.name[lang].toUpperCase(), {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#ffd166'
                }).setDepth(1003);
                const supDesc = this.add.text(supCenterX - supBoxW / 2 + (isCompact ? 34 : 52), rowMidY + (isCompact ? 4 : 5), s.desc ? s.desc[lang] : 'Супер-Оружие', {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '8px' : '9.5px', color: '#e2e8f0', wordWrap: { width: supBoxW - (isCompact ? 40 : 60) }, lineSpacing: 1
                }).setDepth(1003);
                modalGroup.add(supText);
                modalGroup.add(supDesc);
            }

            startY += rowSpacing;
        });
    }

    // --- МОДАЛЬНОЕ ОКНО НАСТРОЕК ---
    openSettingsModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 380) : (isCompact ? Math.min(width - 16, 440) : 480);
        const modalH = isPortrait ? Math.min(height - 16, 340) : (isCompact ? Math.min(height - 16, 280) : 320);

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0x6366f1);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'НАСТРОЙКИ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '15px' : '20px', fontStyle: 'bold', color: '#c084fc', letterSpacing: 2
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const soundBtn = this.add.rectangle(width / 2, height / 2 + (isCompact ? 10 : 12), isCompact ? 220 : 260, isCompact ? 40 : 48, 0x0f172a, 0.95).setInteractive({ useHandCursor: true }).setDepth(1002);
        soundBtn.setStrokeStyle(1.5, 0x38bdf8);
        const soundTxt = this.add.text(width / 2, height / 2 + (isCompact ? 10 : 12), window.Sound.isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '14px' : '16px', fontStyle: 'bold', color: '#ffffff', letterSpacing: 1
        }).setOrigin(0.5).setDepth(1003);

        soundBtn.on('pointerdown', () => {
            const isMuted = window.Sound.toggleMute();
            soundTxt.setText(isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ');
            soundBtn.setStrokeStyle(1.5, isMuted ? 0xef4444 : 0x38bdf8);
        });

        modalGroup.add(soundBtn);
        modalGroup.add(soundTxt);
    }

    // --- МОДАЛЬНОЕ ОКНО ЛИДЕРБОРДА ---
    openLeaderboardModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 420) : (isCompact ? Math.min(width - 16, 620) : 620);
        const modalH = isPortrait ? Math.min(height - 16, 520) : (isCompact ? Math.min(height - 16, 370) : 440);

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0xf59e0b);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'ТАБЛИЦА ЛИДЕРОВ АРЕНЫ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '13px' : '18px', fontStyle: 'bold', color: '#ffd166', letterSpacing: 1.5
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const leaders = [
            { rank: '1', name: 'DARK_SLAYER', time: '10:00', kills: 4820 },
            { rank: '2', name: 'SHADOW_NINJA', time: '10:00', kills: 4210 },
            { rank: '3', name: 'MAGE_SUPREME', time: '09:42', kills: 3890 },
            { rank: '4', name: 'PLAYER_01 (ВЫ)', time: '07:15', kills: 2450 },
            { rank: '5', name: 'STORM_ARCHER', time: '06:30', kills: 1890 }
        ];

        leaders.forEach((l, idx) => {
            const ly = height / 2 - 75 + (idx * 46);
            const isMe = idx === 3;
            const rowBg = this.add.rectangle(width / 2, ly, modalW - 40, 38, isMe ? 0x1e1b4b : 0x0f172a, 0.95).setDepth(1002);
            rowBg.setStrokeStyle(1.5, isMe ? 0xffd166 : 0x1e293b);
            modalGroup.add(rowBg);

            const rankT = this.add.text(width / 2 - modalW / 2 + 35, ly, `#${l.rank}`, {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '14px', fontStyle: 'bold', color: idx < 3 ? '#ffd166' : '#94a3b8'
            }).setOrigin(0, 0.5).setDepth(1003);
            modalGroup.add(rankT);

            const nameT = this.add.text(width / 2 - modalW / 2 + 85, ly, l.name, {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '14px', fontStyle: 'bold', color: isMe ? '#ffd166' : '#f8fafc'
            }).setOrigin(0, 0.5).setDepth(1003);
            modalGroup.add(nameT);

            const scoreT = this.add.text(width / 2 + modalW / 2 - 35, ly, `${l.kills} УБИЙСТВ  •  ${l.time}`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: '13px', fontStyle: 'bold', color: '#38bdf8'
            }).setOrigin(1, 0.5).setDepth(1003);
            modalGroup.add(scoreT);
        });
    }

    // --- МОДАЛЬНОЕ ОКНО ВЫБОРА КАРТЫ (АРЕНЫ) ---
    openMapSelectModal() {
        this.closeCurrentModal();
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        this.currentModal = modalGroup;
        const lang = window.SaveManager.data.lang || 'ru';
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive().setDepth(1000);
        backdrop.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 400) : (isCompact ? Math.min(width - 16, 820) : Math.min(width - 40, 960));
        const modalH = isPortrait ? Math.min(height - 16, 680) : (isCompact ? Math.min(height - 16, 370) : Math.min(height - 20, 560));

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96).setInteractive().setDepth(1001);
        modalBg.setStrokeStyle(2, 0x0ea5e9);
        modalGroup.add(modalBg);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'ВЫБОР КАРТЫ (АРЕНЫ)', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '14px' : (isPortrait ? '16px' : '22px'), fontStyle: 'bold', color: '#38bdf8', letterSpacing: 1.5
        }).setOrigin(0.5).setDepth(1002);
        modalGroup.add(title);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 52), modalW - 40, 1, 0x334155).setDepth(1002);
        modalGroup.add(headerLine);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true }).setDepth(1003);
        xBtn.on('pointerdown', () => this.closeCurrentModal());
        modalGroup.add(xBtn);

        const mapList = ['dark_castle', 'cursed_forest', 'infernal_abyss', 'frozen_citadel'];
        const cardGroup = this.add.group();
        this.mapCardGroup = cardGroup;

        const renderMapCards = () => {
            cardGroup.clear(true, true);
            const currentSelectedMap = window.SaveManager.data.selectedMap || 'dark_castle';

            const cardW = isPortrait ? (modalW - 24) : ((modalW - 40) / 4 - (isCompact ? 6 : 12));
            const cardH = isPortrait ? Math.min(130, (modalH - 90) / 4 - 8) : (isCompact ? modalH - 55 : 420);

            mapList.forEach((mId, idx) => {
                const mapCfg = CONFIG.MAPS[mId];
                if (!mapCfg) return;

                const isUnlocked = window.SaveManager.isMapUnlocked(mId);
                const isSelected = currentSelectedMap === mId;
                const recordSec = window.SaveManager.getMapRecord(mId);
                const mins = Math.floor(recordSec / 60);
                const secs = recordSec % 60;
                const recordStr = recordSec >= 600 ? 'ПОБЕДА (10:00)' : `РЕКОРД: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                let cx, cy;
                if (isPortrait) {
                    const stepY = (modalH - 80) / 4;
                    cx = width / 2;
                    cy = height / 2 - modalH / 2 + 55 + (stepY * idx) + (cardH / 2);
                } else {
                    const totalCardsW = (cardW + (isCompact ? 8 : 16)) * 4 - (isCompact ? 8 : 16);
                    const startX = width / 2 - totalCardsW / 2 + cardW / 2;
                    cx = startX + (idx * (cardW + (isCompact ? 8 : 16)));
                    cy = height / 2 + (isCompact ? 16 : 25);
                }

                // Фоновая панель карточки
                const cardBg = this.add.rectangle(cx, cy, cardW, cardH, isSelected ? 0x0c2547 : (isUnlocked ? 0x0f172a : 0x080c16), 0.95)
                    .setInteractive({ useHandCursor: isUnlocked }).setDepth(1002);
                cardBg.setStrokeStyle(isSelected ? 2.5 : 1, isSelected ? 0x38bdf8 : (isUnlocked ? 0x334155 : 0x1e293b));
                cardGroup.add(cardBg);

                if (isUnlocked) {
                    cardBg.on('pointerdown', () => {
                        window.SaveManager.data.selectedMap = mId;
                        window.SaveManager.save();
                        window.Sound.playShoot();
                        renderMapCards();
                    });
                }

                if (!isPortrait) {
                    // Горизонтальный вид карточки
                    const previewH = isCompact ? 68 : 105;
                    const previewW = cardW - 20;
                    const preview = this.add.image(cx, cy - cardH / 2 + (isCompact ? 42 : 65), mapCfg.icon).setDisplaySize(previewW, previewH).setDepth(1003);
                    cardGroup.add(preview);
                    if (!isUnlocked) preview.setTint(0x334155);

                    // Название карты
                    const mTitle = this.add.text(cx, cy - cardH / 2 + (isCompact ? 88 : 130), mapCfg.name[lang], {
                        fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '12px' : '15px', fontStyle: 'bold', color: isSelected ? '#38bdf8' : (isUnlocked ? '#ffffff' : '#64748b')
                    }).setOrigin(0.5).setDepth(1003);
                    cardGroup.add(mTitle);

                    // Описание
                    const descY = cy - cardH / 2 + (isCompact ? 116 : 170);
                    const mDesc = this.add.text(cx, descY, mapCfg.desc[lang], {
                        fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '9px' : '11px', color: '#94a3b8', align: 'center', lineSpacing: 2, wordWrap: { width: cardW - 14 }
                    }).setOrigin(0.5).setDepth(1003);
                    cardGroup.add(mDesc);

                    // Рекорд
                    const recY = cy + cardH / 2 - (isCompact ? 40 : 55);
                    const recText = this.add.text(cx, recY, recordStr, {
                        fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: recordSec > 0 ? '#ffd166' : '#64748b'
                    }).setOrigin(0.5).setDepth(1003);
                    cardGroup.add(recText);

                    // Кнопка действия
                    const btnY = cy + cardH / 2 - (isCompact ? 18 : 25);
                    const btnW = cardW - (isCompact ? 16 : 24);
                    const btnH = isCompact ? 24 : 34;

                    if (isUnlocked) {
                        const selBtn = this.add.rectangle(cx, btnY, btnW, btnH, isSelected ? 0x0284c7 : 0x1e293b).setInteractive({ useHandCursor: true }).setDepth(1003);
                        selBtn.setStrokeStyle(1.5, isSelected ? 0x38bdf8 : 0x475569);
                        cardGroup.add(selBtn);

                        const selText = this.add.text(cx, btnY, isSelected ? 'ВЫБРАНО' : 'ВЫБРАТЬ', {
                            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '10px' : '13px', fontStyle: 'bold', color: '#ffffff'
                        }).setOrigin(0.5).setDepth(1004);
                        cardGroup.add(selText);

                        selBtn.on('pointerdown', () => {
                            window.SaveManager.data.selectedMap = mId;
                            window.SaveManager.save();
                            window.Sound.playShoot();
                            renderMapCards();
                        });
                    } else {
                        const lockBox = this.add.rectangle(cx, btnY, btnW, btnH, 0x111827).setDepth(1003);
                        lockBox.setStrokeStyle(1, 0x374151);
                        cardGroup.add(lockBox);

                        const lockText = this.add.text(cx, btnY, isCompact ? '[ ВЫЖИВИТЕ 5 МИН ]' : '[ ЗАКРЫТО ]\nВЫЖИВИТЕ 5 МИН', {
                            fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#ef4444', align: 'center', lineSpacing: 1
                        }).setOrigin(0.5).setDepth(1004);
                        cardGroup.add(lockText);
                    }
                } else {
                    // Вертикальный компактный вид в Portrait
                    const preview = this.add.image(cx - cardW / 2 + 50, cy, mapCfg.icon).setDisplaySize(72, 48).setDepth(1003);
                    cardGroup.add(preview);
                    if (!isUnlocked) preview.setTint(0x334155);

                    const titleX = cx - cardW / 2 + 96;
                    const mTitle = this.add.text(titleX, cy - 30, mapCfg.name[lang], {
                        fontFamily: CONFIG.FONTS.TITLE, fontSize: '13px', fontStyle: 'bold', color: isSelected ? '#38bdf8' : (isUnlocked ? '#ffffff' : '#64748b')
                    }).setDepth(1003);
                    cardGroup.add(mTitle);

                    const mDesc = this.add.text(titleX, cy - 10, mapCfg.desc[lang], {
                        fontFamily: CONFIG.FONTS.BODY, fontSize: '9px', color: '#94a3b8', lineSpacing: 1, wordWrap: { width: cardW - 180 }
                    }).setDepth(1003);
                    cardGroup.add(mDesc);

                    const recText = this.add.text(titleX, cy + 24, recordStr, {
                        fontFamily: CONFIG.FONTS.MONO, fontSize: '10px', fontStyle: 'bold', color: recordSec > 0 ? '#ffd166' : '#64748b'
                    }).setDepth(1003);
                    cardGroup.add(recText);

                    // Кнопка / статус справа
                    const btnX = cx + cardW / 2 - 42;
                    if (isUnlocked) {
                        const selBtn = this.add.rectangle(btnX, cy, 68, 28, isSelected ? 0x0284c7 : 0x1e293b).setInteractive({ useHandCursor: true }).setDepth(1003);
                        selBtn.setStrokeStyle(1, isSelected ? 0x38bdf8 : 0x475569);
                        cardGroup.add(selBtn);

                        const selText = this.add.text(btnX, cy, isSelected ? 'ВЫБРАНО' : 'ВЫБРАТЬ', {
                            fontFamily: CONFIG.FONTS.TITLE, fontSize: '9px', fontStyle: 'bold', color: '#ffffff'
                        }).setOrigin(0.5).setDepth(1004);
                        cardGroup.add(selText);

                        selBtn.on('pointerdown', () => {
                            window.SaveManager.data.selectedMap = mId;
                            window.SaveManager.save();
                            window.Sound.playShoot();
                            renderMapCards();
                        });
                    } else {
                        const lockBox = this.add.rectangle(btnX, cy, 68, 28, 0x111827).setDepth(1003);
                        lockBox.setStrokeStyle(1, 0xef4444);
                        cardGroup.add(lockBox);

                        const lockText = this.add.text(btnX, cy, 'ЗАКРЫТО', {
                            fontFamily: CONFIG.FONTS.UI, fontSize: '9px', fontStyle: 'bold', color: '#ef4444'
                        }).setOrigin(0.5).setDepth(1004);
                        cardGroup.add(lockText);
                    }
                }
            });
        };

        renderMapCards();
    }
}

window.MenuScene = MenuScene;
