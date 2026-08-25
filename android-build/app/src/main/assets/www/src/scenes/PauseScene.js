/**
 * Pause Scene - Меню паузы с просмотром текущего билда, характеристик и рецептов эволюций
 * Полная адаптивность под вертикальную и горизонтальную ориентацию
 */
class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    init(data) {
        this.parentSceneKey = data.sceneKey || 'GameScene';
        this.player = data.player;
        this.player2 = data.player2 || null;
    }

    create() {
        const { width, height } = this.scale;
        const lang = window.SaveManager.data.lang || 'ru';
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        if (window.Sound && window.Sound.setPauseDucking) {
            window.Sound.setPauseDucking(true);
        }

        // Тёмный полупрозрачный фон с виньеткой
        this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive();

        // Заголовок
        const titleY = isCompact ? 18 : (isPortrait ? 28 : 36);
        this.add.text(width / 2, titleY, 'ПАУЗА И СТАТИСТИКА', {
            fontFamily: CONFIG.FONTS.TITLE,
            fontSize: isCompact ? '16px' : (isPortrait ? '20px' : '24px'),
            fontStyle: 'bold',
            color: '#ffd166',
            letterSpacing: 2
        }).setOrigin(0.5);

        // Панель характеристик и билда
        const panelY = isCompact ? (height / 2 - 10) : (isPortrait ? (height / 2 - 38) : (height / 2 - 15));
        this.createBuildPanel(width / 2, panelY, lang, isPortrait, isCompact);

        // Нижние кнопки
        this.createButtons(width / 2, height, lang, isPortrait, isCompact);

        // Клавиша ESC возобновляет игру
        this.input.keyboard.on('keydown-ESC', () => this.resumeGame());

        // Обработка поворота экрана и ресайза
        const onResize = () => {
            if (this.scene.isActive('PauseScene')) {
                this.scene.restart({
                    player: this.player,
                    player2: this.player2,
                    sceneKey: this.parentSceneKey
                });
            }
        };
        this.scale.on('resize', onResize);
        this.events.once('shutdown', () => this.scale.off('resize', onResize));
        this.events.once('destroy', () => this.scale.off('resize', onResize));
    }

    createBuildPanel(x, y, lang, isPortrait, isCompact) {
        const p = this.player;
        const heroCfg = CONFIG.HEROES[p.heroId] || CONFIG.HEROES.knight;

        if (isPortrait) {
            // --- ВЕРТИКАЛЬНЫЙ РЕЖИМ ---
            const panelW = Math.min(this.scale.width - 24, 400);
            const panelH = Math.min(this.scale.height - 180, 480);

            const bg = this.add.rectangle(x, y, panelW, panelH, 0x0b1120, 0.96);
            bg.setStrokeStyle(1.5, 0x334155);

            let curY = y - panelH / 2 + 22;
            this.add.text(x, curY, `${heroCfg.name[lang].toUpperCase()} (УР. ${p.level})`, {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '15px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0.5);

            curY += 24;
            const stats = [
                `HP: ${Math.round(p.hp)}/${p.stats.maxHp}  •  Скорость: ${p.stats.speed}  •  Броня: ${p.stats.armor || 0}`,
                `Урон: +${Math.round((p.stats.damageMulti - 1) * 100)}%  •  Крит: ${Math.round(p.stats.critChance * 100)}%  •  Золото: ${p.goldCollected || 0}`
            ];
            stats.forEach((s) => {
                this.add.text(x, curY, s, { fontFamily: CONFIG.FONTS.BODY, fontSize: '11px', color: '#cbd5e1' }).setOrigin(0.5);
                curY += 16;
            });

            curY += 12;
            this.add.text(x - panelW / 2 + 18, curY, 'ОРУЖИЕ И ЭВОЛЮЦИИ:', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#38bdf8'
            });
            curY += 20;

            Object.entries(p.weapons).forEach(([wId, lvl]) => {
                const wep = CONFIG.WEAPONS[wId];
                if (!wep) return;
                const status = p.superWeapons.includes(wep.evolution) ? '[ЭВОЛЮЦИЯ]' : `Ур. ${lvl}/${wep.maxLevel}`;
                this.add.image(x - panelW / 2 + 28, curY, wep.icon).setScale(0.46);
                this.add.text(x - panelW / 2 + 46, curY, `${wep.name[lang]} — ${status}`, {
                    fontFamily: CONFIG.FONTS.UI, fontSize: '12px', fontStyle: 'bold', color: '#ffffff'
                }).setOrigin(0, 0.5);
                curY += 22;
            });

            curY += 8;
            this.add.text(x - panelW / 2 + 18, curY, 'ПАССИВНЫЕ НАВЫКИ:', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#c084fc'
            });
            curY += 20;

            if (Object.keys(p.passives).length === 0) {
                this.add.text(x - panelW / 2 + 18, curY, 'Нет активных пассивок', { fontFamily: CONFIG.FONTS.BODY, fontSize: '11px', color: '#64748b' });
            } else {
                Object.entries(p.passives).forEach(([pId, lvl]) => {
                    const pas = CONFIG.PASSIVES[pId];
                    if (!pas) return;
                    this.add.image(x - panelW / 2 + 28, curY, pas.icon).setScale(0.44);
                    this.add.text(x - panelW / 2 + 46, curY, `${pas.name[lang]} — Ур. ${lvl}/${pas.maxLevel}`, {
                        fontFamily: CONFIG.FONTS.BODY, fontSize: '12px', color: '#e2e8f0'
                    }).setOrigin(0, 0.5);
                    curY += 22;
                });
            }
        } else {
            // --- ГОРИЗОНТАЛЬНЫЙ РЕЖИМ (2 СТИЛЬНЫЕ КАРТОЧКИ) ---
            const cardW = isCompact ? Math.min(380, (this.scale.width - 40) / 2) : 420;
            const cardH = isCompact ? Math.min(275, this.scale.height - 75) : 360;

            // 1. ЛЕВАЯ КАРТОЧКА: ГЕРОЙ И СТАТИСТИКА
            const leftX = x - (cardW / 2 + (isCompact ? 8 : 15));
            const leftBg = this.add.rectangle(leftX, y, cardW, cardH, 0x0b1120, 0.96);
            leftBg.setStrokeStyle(1.5, 0x334155);

            // Пьедестал и герой
            const pedY = isCompact ? (y - cardH / 2 + 40) : (y - 90);
            this.add.image(leftX - (isCompact ? 95 : 135), pedY + 15, 'hero_pedestal_glow').setScale(isCompact ? 0.5 : 0.7);
            this.add.sprite(leftX - (isCompact ? 95 : 135), pedY, `hero_${p.heroId}`).setDisplaySize(isCompact ? 48 : 68, isCompact ? 48 : 68);

            this.add.text(leftX - (isCompact ? 50 : 75), pedY - (isCompact ? 14 : 20), heroCfg.name[lang].toUpperCase(), {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '14px' : '18px', fontStyle: 'bold', color: '#ffd166'
            });

            this.add.text(leftX - (isCompact ? 50 : 75), pedY + (isCompact ? 6 : 4), `УРОВЕНЬ ${p.level}`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '11px' : '13px', fontStyle: 'bold', color: '#38bdf8'
            });

            // Визуальные шкалы статов
            const statsData = [
                { icon: 'stat_icon_hp', label: 'HP', val: `${Math.round(p.hp)}/${p.stats.maxHp}`, ratio: Math.min(1.0, p.hp / p.stats.maxHp), color: 0xef4444 },
                { icon: 'stat_icon_spd', label: 'СКОР.', val: `${p.stats.speed}`, ratio: Math.min(1.0, p.stats.speed / 240), color: 0xfacc15 },
                { icon: 'stat_icon_dmg', label: 'УРОН', val: `+${Math.round((p.stats.damageMulti - 1) * 100)}%`, ratio: Math.min(1.0, p.stats.damageMulti / 2.0), color: 0xf97316 },
                { icon: 'stat_icon_crit', label: 'КРИТ', val: `${Math.round(p.stats.critChance * 100)}%`, ratio: Math.min(1.0, p.stats.critChance / 0.5), color: 0xc084fc }
            ];

            const barStartY = isCompact ? (y - cardH / 2 + 82) : (y - 45);
            const barSpacing = isCompact ? 20 : 24;
            const barWidth = isCompact ? (cardW - 160) : 170;

            statsData.forEach((st, sIdx) => {
                const sy = barStartY + (sIdx * barSpacing);
                this.add.image(leftX - cardW / 2 + (isCompact ? 20 : 30), sy + (isCompact ? 4 : 8), st.icon).setScale(isCompact ? 0.65 : 0.8);
                this.add.text(leftX - cardW / 2 + (isCompact ? 34 : 45), sy, st.label, {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '10px' : '11px', fontStyle: 'bold', color: '#94a3b8'
                });
                this.add.text(leftX + cardW / 2 - (isCompact ? 16 : 24), sy, st.val, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: '#ffffff'
                }).setOrigin(1, 0);

                const barX = leftX - cardW / 2 + (isCompact ? 90 : 130);
                this.add.rectangle(barX + barWidth / 2, sy + 6, barWidth, isCompact ? 4 : 6, 0x1e293b).setStrokeStyle(1, 0x334155);
                const fillW = Math.max(2, barWidth * st.ratio);
                this.add.rectangle(barX, sy + 6, fillW, isCompact ? 4 : 6, st.color).setOrigin(0, 0.5);
            });

            // Доп статы (Убийства, золото, броня)
            const extraY = isCompact ? (y + cardH / 2 - 32) : (y + cardH / 2 - 40);
            this.add.rectangle(leftX, extraY, cardW - (isCompact ? 20 : 30), isCompact ? 32 : 44, 0x0f172a, 0.9).setStrokeStyle(1, 0x1e293b);

            this.add.image(leftX - cardW / 2 + 30, extraY, 'ui_skull').setScale(isCompact ? 0.55 : 0.7);
            this.add.text(leftX - cardW / 2 + 45, extraY, `УБИТО: ${p.kills || 0}`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: '#f87171'
            }).setOrigin(0, 0.5);

            this.add.image(leftX - 12, extraY, 'ui_coin').setScale(isCompact ? 0.55 : 0.7);
            this.add.text(leftX + 2, extraY, `ЗОЛОТО: ${p.goldCollected || 0}`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0, 0.5);

            this.add.text(leftX + cardW / 2 - 20, extraY, `БРОНЯ: ${p.stats.armor || 0}`, {
                fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: '#38bdf8'
            }).setOrigin(1, 0.5);

            // 2. ПРАВАЯ КАРТОЧКА: АКТИВНЫЙ БИЛД
            const rightX = x + (cardW / 2 + (isCompact ? 8 : 15));
            const rightBg = this.add.rectangle(rightX, y, cardW, cardH, 0x0b1120, 0.96);
            rightBg.setStrokeStyle(1.5, 0x334155);

            this.add.text(rightX - cardW / 2 + 16, y - cardH / 2 + (isCompact ? 14 : 20), 'АКТИВНОЕ ОРУЖИЕ:', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '14px', fontStyle: 'bold', color: '#38bdf8', letterSpacing: 1
            });

            let wepY = y - cardH / 2 + (isCompact ? 36 : 50);
            const wepSpacing = isCompact ? 26 : 36;
            Object.entries(p.weapons).forEach(([wId, lvl]) => {
                const wep = CONFIG.WEAPONS[wId];
                if (!wep) return;
                const isEvolved = p.superWeapons.includes(wep.evolution);
                const hasRequired = (p.passives && p.passives[wep.requiredPassive] > 0);

                const slotBg = this.add.rectangle(rightX, wepY, cardW - (isCompact ? 24 : 36), isCompact ? 22 : 32, isEvolved ? 0x1e1b4b : 0x0f172a, 0.9);
                slotBg.setStrokeStyle(1, isEvolved ? 0xffd166 : 0x1e293b);

                this.add.image(rightX - cardW / 2 + (isCompact ? 24 : 38), wepY, wep.icon).setScale(isCompact ? 0.42 : 0.55);

                this.add.text(rightX - cardW / 2 + (isCompact ? 40 : 58), wepY, wep.name[lang], {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: isEvolved ? '#ffd166' : '#ffffff'
                }).setOrigin(0, 0.5);

                const statusStr = isEvolved ? 'ЭВОЛЮЦИЯ' : (lvl >= wep.maxLevel ? (hasRequired ? 'ГОТОВ ✦' : 'МАКС УР. 5') : `Ур. ${lvl}/5`);
                const statusColor = isEvolved ? '#ffd166' : (hasRequired && lvl >= 5 ? '#34d399' : '#94a3b8');

                this.add.text(rightX + cardW / 2 - (isCompact ? 20 : 30), wepY, statusStr, {
                    fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: statusColor
                }).setOrigin(1, 0.5);

                wepY += wepSpacing;
            });

            const pasTitleY = wepY + (isCompact ? 4 : 10);
            this.add.text(rightX - cardW / 2 + 16, pasTitleY, 'ПАССИВНЫЕ НАВЫКИ:', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '14px', fontStyle: 'bold', color: '#c084fc', letterSpacing: 1
            });

            let pasY = pasTitleY + (isCompact ? 20 : 30);
            const pasSpacing = isCompact ? 24 : 32;
            if (Object.keys(p.passives).length === 0) {
                this.add.text(rightX - cardW / 2 + 16, pasY, 'Нет активных навыков', {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '10px' : '12px', color: '#64748b'
                });
            } else {
                Object.entries(p.passives).forEach(([pId, lvl]) => {
                    const pas = CONFIG.PASSIVES[pId];
                    if (!pas) return;

                    const slotBg = this.add.rectangle(rightX, pasY, cardW - (isCompact ? 24 : 36), isCompact ? 20 : 28, 0x0f172a, 0.9);
                    slotBg.setStrokeStyle(1, 0x1e293b);

                    this.add.image(rightX - cardW / 2 + (isCompact ? 24 : 38), pasY, pas.icon).setScale(isCompact ? 0.38 : 0.48);

                    this.add.text(rightX - cardW / 2 + (isCompact ? 40 : 58), pasY, pas.name[lang], {
                        fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '10px' : '11px', fontStyle: 'bold', color: '#e2e8f0'
                    }).setOrigin(0, 0.5);

                    this.add.text(rightX + cardW / 2 - (isCompact ? 20 : 30), pasY, `Ур. ${lvl}/5`, {
                        fontFamily: CONFIG.FONTS.MONO, fontSize: isCompact ? '10px' : '12px', fontStyle: 'bold', color: '#38bdf8'
                    }).setOrigin(1, 0.5);

                    pasY += pasSpacing;
                });
            }
        }
    }

    createButtons(x, height, lang, isPortrait, isCompact) {
        if (isPortrait) {
            // --- 2x2 СЕТКА КНОПОК ДЛЯ ПОРТРЕТНОГО РЕЖИМА СМАРТФОНА ---
            const btnW = Math.min(165, (this.scale.width - 36) / 2);
            const btnH = 38;
            const row1Y = height - 76;
            const row2Y = height - 30;
            const leftColX = x - btnW / 2 - 6;
            const rightColX = x + btnW / 2 + 6;

            // Ряд 1: Продолжить + Рецепты
            const resumeBtn = this.add.image(leftColX, row1Y, 'btn_battle_green').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
            this.add.text(leftColX, row1Y, 'ПРОДОЛЖИТЬ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            resumeBtn.on('pointerdown', () => this.resumeGame());

            const evoBtn = this.add.image(rightColX, row1Y, 'btn_play_bg').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
            this.add.text(rightColX, row1Y, 'РЕЦЕПТЫ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            evoBtn.on('pointerdown', () => this.openEvolutionBookModal(lang));

            // Ряд 2: Звук + В меню
            const soundBtn = this.add.rectangle(leftColX, row2Y, btnW, btnH, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
            soundBtn.setStrokeStyle(1.5, 0x334155);
            const soundText = this.add.text(leftColX, row2Y, window.Sound.isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            soundBtn.on('pointerdown', () => {
                const isMuted = window.Sound.toggleMute();
                soundText.setText(isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ');
                soundBtn.setStrokeStyle(1.5, isMuted ? 0xef4444 : 0x38bdf8);
            });

            const menuBtn = this.add.rectangle(rightColX, row2Y, btnW, btnH, 0x991b1b, 0.95).setInteractive({ useHandCursor: true });
            menuBtn.setStrokeStyle(1.5, 0xfca5a5);
            this.add.text(rightColX, row2Y, 'В МЕНЮ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: '12px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            menuBtn.on('pointerdown', () => {
                this.scene.stop(this.parentSceneKey);
                this.scene.stop('PauseScene');
                this.scene.start('MenuScene');
            });
        } else {
            // --- ГОРИЗОНТАЛЬНЫЙ РЯД КНОПОК ---
            const y = height - (isCompact ? 22 : 36);
            const btnW = isCompact ? 140 : 185;
            const btnH = isCompact ? 32 : 44;
            const spacing = isCompact ? 10 : 20;
            const totalW = btnW * 4 + spacing * 3;
            const startX = x - totalW / 2 + btnW / 2;

            const resumeBtn = this.add.image(startX, y, 'btn_battle_green').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
            this.add.text(startX, y, 'ПРОДОЛЖИТЬ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '14px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            resumeBtn.on('pointerdown', () => this.resumeGame());

            const evoBtn = this.add.image(startX + (btnW + spacing), y, 'btn_play_bg').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
            this.add.text(startX + (btnW + spacing), y, 'РЕЦЕПТЫ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '14px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            evoBtn.on('pointerdown', () => this.openEvolutionBookModal(lang));

            const soundBtn = this.add.rectangle(startX + (btnW + spacing) * 2, y, btnW, btnH, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
            soundBtn.setStrokeStyle(1.5, 0x334155);
            const soundText = this.add.text(startX + (btnW + spacing) * 2, y, window.Sound.isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '14px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            soundBtn.on('pointerdown', () => {
                const isMuted = window.Sound.toggleMute();
                soundText.setText(isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ');
                soundBtn.setStrokeStyle(1.5, isMuted ? 0xef4444 : 0x38bdf8);
            });

            const menuBtn = this.add.rectangle(startX + (btnW + spacing) * 3, y, btnW, btnH, 0x991b1b, 0.95).setInteractive({ useHandCursor: true });
            menuBtn.setStrokeStyle(1.5, 0xfca5a5);
            this.add.text(startX + (btnW + spacing) * 3, y, 'В МЕНЮ', {
                fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '11px' : '14px', fontStyle: 'bold', color: '#fff'
            }).setOrigin(0.5);
            menuBtn.on('pointerdown', () => {
                this.scene.stop(this.parentSceneKey);
                this.scene.stop('PauseScene');
                this.scene.start('MenuScene');
            });
        }
    }

    openEvolutionBookModal(lang) {
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        const isPortrait = height > width;
        const isCompact = !isPortrait && height < 520;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive();
        backdrop.on('pointerdown', () => modalGroup.destroy(true));
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 16, 420) : (isCompact ? Math.min(width - 16, 780) : Math.min(width - 40, 940));
        const modalH = isPortrait ? Math.min(height - 16, 600) : (isCompact ? Math.min(height - 16, 370) : Math.min(height - 20, 540));

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96);
        modalBg.setStrokeStyle(2, 0x0284c7);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + (isCompact ? 36 : 50), modalW - 40, 1, 0x334155);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'РЕЦЕПТЫ ЭВОЛЮЦИИ СУПЕР-ОРУЖИЯ', {
            fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '13px' : (isPortrait ? '15px' : '20px'), fontStyle: 'bold', color: '#38bdf8', letterSpacing: 1.5
        }).setOrigin(0.5);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - (isCompact ? 20 : 28), height / 2 - modalH / 2 + (isCompact ? 18 : 28), 'btn_close_circle').setDisplaySize(isCompact ? 24 : 32, isCompact ? 24 : 32).setInteractive({ useHandCursor: true });
        xBtn.on('pointerdown', () => modalGroup.destroy(true));
        modalGroup.add(xBtn);

        const evolutions = Object.values(CONFIG.WEAPONS).map(w => ({
            wep: w.id,
            pas: w.requiredPassive,
            sup: w.evolution
        }));

        let startY = height / 2 - modalH / 2 + (isCompact ? 48 : 68);
        const availableH = modalH - (isCompact ? 60 : 85);
        const rowSpacing = Math.min(isCompact ? 44 : (isPortrait ? 76 : 72), availableH / evolutions.length);
        const rowH = rowSpacing - 4;

        evolutions.forEach((evo) => {
            const w = CONFIG.WEAPONS[evo.wep];
            const p = CONFIG.PASSIVES[evo.pas];
            const s = CONFIG.SUPER_WEAPONS[evo.sup];
            if (!w || !p || !s) return;

            const rowBg = this.add.rectangle(width / 2, startY + rowH / 2, modalW - (isCompact ? 20 : 40), rowH, 0x0f172a, 0.95);
            rowBg.setStrokeStyle(1.5, 0x1e293b);
            modalGroup.add(rowBg);

            const rowMidY = startY + rowH / 2;

            if (isPortrait) {
                const wepIcon = this.add.image(width / 2 - modalW / 2 + 30, rowMidY, w.icon).setScale(0.55);
                modalGroup.add(wepIcon);

                const plus = this.add.text(width / 2 - modalW / 2 + 58, rowMidY, '+', {
                    fontFamily: 'sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#94a3b8'
                }).setOrigin(0.5);
                modalGroup.add(plus);

                const pasIcon = this.add.image(width / 2 - modalW / 2 + 86, rowMidY, p.icon).setScale(0.55);
                modalGroup.add(pasIcon);

                const arrow = this.add.text(width / 2 - modalW / 2 + 116, rowMidY, '➔', {
                    fontSize: '14px', color: '#ffd166'
                }).setOrigin(0.5);
                modalGroup.add(arrow);

                const supIcon = this.add.image(width / 2 - modalW / 2 + 144, rowMidY, s.icon).setScale(0.55).setTint(0xffd166);
                modalGroup.add(supIcon);

                const supText = this.add.text(width / 2 - modalW / 2 + 168, rowMidY - 7, s.name[lang].toUpperCase(), {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: '11px', fontStyle: 'bold', color: '#ffd166'
                });
                modalGroup.add(supText);

                const compText = this.add.text(width / 2 - modalW / 2 + 168, rowMidY + 7, `${w.name[lang]} + ${p.name[lang]}`, {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: '9px', color: '#94a3b8'
                });
                modalGroup.add(compText);
            } else {
                // 1. Базовое оружие
                const wepLeftX = isCompact ? (width / 2 - modalW / 2 + 25) : (width / 2 - 345);
                const wepIcon = this.add.image(wepLeftX, rowMidY, w.icon).setScale(isCompact ? 0.48 : 0.65);
                modalGroup.add(wepIcon);
                
                const wepText = this.add.text(wepLeftX + (isCompact ? 18 : 30), rowMidY - (isCompact ? 6 : 8), w.name[lang], {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '10px' : '13px', fontStyle: 'bold', color: '#ffffff'
                });
                const wepLvl = this.add.text(wepLeftX + (isCompact ? 18 : 30), rowMidY + (isCompact ? 5 : 8), 'Макс. Ур. 5', {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '8px' : '11px', color: '#f59e0b'
                });
                modalGroup.add(wepText);
                modalGroup.add(wepLvl);

                // Плюс
                const plusX = isCompact ? (wepLeftX + 115) : (width / 2 - 175);
                const plus = this.add.text(plusX, rowMidY, '+', {
                    fontFamily: 'sans-serif', fontSize: isCompact ? '14px' : '20px', fontStyle: 'bold', color: '#94a3b8'
                }).setOrigin(0.5);
                modalGroup.add(plus);

                // 2. Пассивка
                const pasLeftX = isCompact ? (plusX + 25) : (width / 2 - 135);
                const pasIcon = this.add.image(pasLeftX, rowMidY, p.icon).setScale(isCompact ? 0.48 : 0.65);
                modalGroup.add(pasIcon);
                
                const pasText = this.add.text(pasLeftX + (isCompact ? 18 : 30), rowMidY - (isCompact ? 6 : 8), p.name[lang], {
                    fontFamily: CONFIG.FONTS.UI, fontSize: isCompact ? '10px' : '13px', fontStyle: 'bold', color: '#ffffff'
                });
                const pasLvl = this.add.text(pasLeftX + (isCompact ? 18 : 30), rowMidY + (isCompact ? 5 : 8), 'Любой уровень', {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '8px' : '11px', color: '#38bdf8'
                });
                modalGroup.add(pasText);
                modalGroup.add(pasLvl);

                // Стрелка крафта
                const arrowX = isCompact ? (pasLeftX + 115) : (width / 2 + 55);
                const arrow = this.add.text(arrowX, rowMidY, '➔', {
                    fontSize: isCompact ? '14px' : '20px', fontStyle: 'bold', color: '#ffd166'
                }).setOrigin(0.5);
                modalGroup.add(arrow);

                // 3. Блок супер-оружия (Эволюция)
                const supBoxW = isCompact ? (modalW - (arrowX + 20) - 20) : 270;
                const supCenterX = isCompact ? (arrowX + 15 + supBoxW / 2) : (width / 2 + 250);
                const supBg = this.add.rectangle(supCenterX, rowMidY, supBoxW, isCompact ? (rowH - 4) : 56, 0x1e1b4b);
                supBg.setStrokeStyle(1.5, 0xffd166);
                modalGroup.add(supBg);

                const supIcon = this.add.image(supCenterX - supBoxW / 2 + (isCompact ? 16 : 24), rowMidY, s.icon).setScale(isCompact ? 0.5 : 0.68).setTint(0xffd166);
                modalGroup.add(supIcon);

                const supText = this.add.text(supCenterX - supBoxW / 2 + (isCompact ? 34 : 52), rowMidY - (isCompact ? 7 : 11), s.name[lang].toUpperCase(), {
                    fontFamily: CONFIG.FONTS.TITLE, fontSize: isCompact ? '9px' : '11px', fontStyle: 'bold', color: '#ffd166'
                });
                const supDesc = this.add.text(supCenterX - supBoxW / 2 + (isCompact ? 34 : 52), rowMidY + (isCompact ? 4 : 5), s.desc ? s.desc[lang] : 'Супер-Оружие', {
                    fontFamily: CONFIG.FONTS.BODY, fontSize: isCompact ? '8px' : '9.5px', color: '#e2e8f0', wordWrap: { width: supBoxW - (isCompact ? 40 : 60) }, lineSpacing: 1
                });
                modalGroup.add(supText);
                modalGroup.add(supDesc);
            }

            startY += rowSpacing;
        });
    }

    resumeGame() {
        if (window.Sound && window.Sound.setPauseDucking) {
            window.Sound.setPauseDucking(false);
        }
        this.scene.stop('PauseScene');
        this.scene.resume(this.parentSceneKey);
    }
}

window.PauseScene = PauseScene;
