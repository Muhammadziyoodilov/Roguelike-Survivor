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

        if (window.Sound && window.Sound.setPauseDucking) {
            window.Sound.setPauseDucking(true);
        }

        // Тёмный полупрозрачный фон с виньеткой
        this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.92).setInteractive();

        // Заголовок
        this.add.text(width / 2, isPortrait ? 32 : 40, 'ПАУЗА И СТАТИСТИКА', {
            fontFamily: "'Cinzel', serif",
            fontSize: isPortrait ? '22px' : '26px',
            fontStyle: 'bold',
            color: '#ffd166',
            letterSpacing: 2
        }).setOrigin(0.5);

        // Панель характеристик и билда
        this.createBuildPanel(width / 2, height / 2 - (isPortrait ? 25 : 15), lang, isPortrait);

        // Нижние кнопки
        this.createButtons(width / 2, height, lang, isPortrait);

        // Клавиша ESC возобновляет игру
        this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    }

    createBuildPanel(x, y, lang, isPortrait) {
        const p = this.player;
        const heroCfg = CONFIG.HEROES[p.heroId] || CONFIG.HEROES.knight;
        const romanLevels = ['I', 'II', 'III', 'IV', 'V'];

        if (isPortrait) {
            // --- ВЕРТИКАЛЬНЫЙ РЕЖИМ ---
            const panelW = Math.min(this.scale.width - 30, 400);
            const panelH = Math.min(this.scale.height - 160, 480);

            const bg = this.add.rectangle(x, y, panelW, panelH, 0x0b1120, 0.96);
            bg.setStrokeStyle(2, 0x334155);

            let curY = y - panelH / 2 + 25;
            this.add.text(x, curY, `${heroCfg.name[lang].toUpperCase()} (УР. ${p.level})`, {
                fontFamily: "'Cinzel', serif", fontSize: '18px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0.5);

            curY += 28;
            const stats = [
                `HP: ${Math.round(p.hp)}/${p.stats.maxHp}  •  Скорость: ${p.stats.speed}  •  Броня: ${p.stats.armor || 0}`,
                `Урон: +${Math.round((p.stats.damageMulti - 1) * 100)}%  •  Крит: ${Math.round(p.stats.critChance * 100)}%  •  Золото: ${p.goldCollected || 0}`
            ];
            stats.forEach((s) => {
                this.add.text(x, curY, s, { fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: '#cbd5e1' }).setOrigin(0.5);
                curY += 18;
            });

            curY += 14;
            this.add.text(x - panelW / 2 + 20, curY, 'ОРУЖИЕ И ЭВОЛЮЦИИ:', {
                fontFamily: "'Cinzel', serif", fontSize: '13px', fontStyle: 'bold', color: '#38bdf8'
            });
            curY += 22;

            Object.entries(p.weapons).forEach(([wId, lvl]) => {
                const wep = CONFIG.WEAPONS[wId];
                if (!wep) return;
                const status = p.superWeapons.includes(wep.evolution) ? '[ЭВОЛЮЦИЯ]' : `Ур. ${lvl}/${wep.maxLevel}`;
                this.add.image(x - panelW / 2 + 30, curY, wep.icon).setScale(0.5);
                this.add.text(x - panelW / 2 + 50, curY, `${wep.name[lang]} — ${status}`, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontStyle: 'bold', color: '#ffffff'
                }).setOrigin(0, 0.5);
                curY += 24;
            });

            curY += 10;
            this.add.text(x - panelW / 2 + 20, curY, 'ПАССИВНЫЕ НАВЫКИ:', {
                fontFamily: "'Cinzel', serif", fontSize: '13px', fontStyle: 'bold', color: '#c084fc'
            });
            curY += 22;

            if (Object.keys(p.passives).length === 0) {
                this.add.text(x - panelW / 2 + 20, curY, 'Нет активных пассивок', { fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: '#64748b' });
            } else {
                Object.entries(p.passives).forEach(([pId, lvl]) => {
                    const pas = CONFIG.PASSIVES[pId];
                    if (!pas) return;
                    this.add.image(x - panelW / 2 + 30, curY, pas.icon).setScale(0.5);
                    this.add.text(x - panelW / 2 + 50, curY, `${pas.name[lang]} — Ур. ${lvl}/${pas.maxLevel}`, {
                        fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', color: '#e2e8f0'
                    }).setOrigin(0, 0.5);
                    curY += 24;
                });
            }
        } else {
            // --- ГОРИЗОНТАЛЬНЫЙ РЕЖИМ (2 СТИЛЬНЫЕ КАРТОЧКИ) ---
            const cardW = 420;
            const cardH = 360;

            // 1. ЛЕВАЯ КАРТОЧКА: ГЕРОЙ И СТАТИСТИКА
            const leftX = x - 225;
            const leftBg = this.add.rectangle(leftX, y, cardW, cardH, 0x0b1120, 0.96);
            leftBg.setStrokeStyle(1.5, 0x334155);

            // Пьедестал и герой
            this.add.image(leftX - 135, y - 90, 'hero_pedestal_glow').setScale(0.7);
            this.add.sprite(leftX - 135, y - 110, `hero_${p.heroId}`).setDisplaySize(68, 68);

            this.add.text(leftX - 75, y - 130, heroCfg.name[lang].toUpperCase(), {
                fontFamily: "'Cinzel', serif", fontSize: '18px', fontStyle: 'bold', color: '#ffd166'
            });

            this.add.text(leftX - 75, y - 106, `УРОВЕНЬ ${p.level}`, {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontStyle: 'bold', color: '#38bdf8'
            });

            // Визуальные шкалы статов
            const statsData = [
                { icon: 'stat_icon_hp', label: 'ЗДОРОВЬЕ', val: `${Math.round(p.hp)} / ${p.stats.maxHp}`, ratio: Math.min(1.0, p.hp / p.stats.maxHp), color: 0xef4444 },
                { icon: 'stat_icon_spd', label: 'СКОРОСТЬ', val: `${p.stats.speed}`, ratio: Math.min(1.0, p.stats.speed / 240), color: 0xfacc15 },
                { icon: 'stat_icon_dmg', label: 'УРОН', val: `+${Math.round((p.stats.damageMulti - 1) * 100)}%`, ratio: Math.min(1.0, p.stats.damageMulti / 2.0), color: 0xf97316 },
                { icon: 'stat_icon_crit', label: 'КРИТ. ШАНС', val: `${Math.round(p.stats.critChance * 100)}%`, ratio: Math.min(1.0, p.stats.critChance / 0.5), color: 0xc084fc }
            ];

            const barStartY = y - 45;
            statsData.forEach((st, sIdx) => {
                const sy = barStartY + (sIdx * 24);
                this.add.image(leftX - 180, sy + 8, st.icon).setScale(0.8);
                this.add.text(leftX - 165, sy, st.label, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', fontStyle: 'bold', color: '#94a3b8'
                });
                this.add.text(leftX + 180, sy, st.val, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', fontStyle: 'bold', color: '#ffffff'
                }).setOrigin(1, 0);

                // Трек
                this.add.rectangle(leftX + 25, sy + 6, 170, 6, 0x1e293b).setStrokeStyle(1, 0x334155);
                const fillW = Math.max(4, 170 * st.ratio);
                this.add.rectangle(leftX - 60, sy + 6, fillW, 6, st.color).setOrigin(0, 0.5);
            });

            // Доп статы
            const extraY = y + 70;
            this.add.rectangle(leftX, extraY + 25, cardW - 30, 48, 0x0f172a, 0.9).setStrokeStyle(1, 0x1e293b);

            this.add.image(leftX - 145, extraY + 25, 'ui_skull').setScale(0.7);
            this.add.text(leftX - 130, extraY + 25, `УБИТО: ${p.kills || 0}`, {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontStyle: 'bold', color: '#f87171'
            }).setOrigin(0, 0.5);

            this.add.image(leftX - 25, extraY + 25, 'ui_coin').setScale(0.7);
            this.add.text(leftX - 10, extraY + 25, `ЗОЛОТО: ${p.goldCollected || 0}`, {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontStyle: 'bold', color: '#ffd166'
            }).setOrigin(0, 0.5);

            this.add.text(leftX + 115, extraY + 25, `БРОНЯ: ${p.stats.armor || 0}`, {
                fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontStyle: 'bold', color: '#38bdf8'
            }).setOrigin(0, 0.5);

            // 2. ПРАВАЯ КАРТОЧКА: АКТИВНЫЙ БИЛД
            const rightX = x + 225;
            const rightBg = this.add.rectangle(rightX, y, cardW, cardH, 0x0b1120, 0.96);
            rightBg.setStrokeStyle(1.5, 0x334155);

            this.add.text(rightX - cardW / 2 + 20, y - cardH / 2 + 20, 'АКТИВНОЕ ОРУЖИЕ:', {
                fontFamily: "'Cinzel', serif", fontSize: '14px', fontStyle: 'bold', color: '#38bdf8', letterSpacing: 1
            });

            let wepY = y - cardH / 2 + 50;
            Object.entries(p.weapons).forEach(([wId, lvl]) => {
                const wep = CONFIG.WEAPONS[wId];
                if (!wep) return;
                const isEvolved = p.superWeapons.includes(wep.evolution);
                const hasRequired = (p.passives && p.passives[wep.requiredPassive] > 0);

                const slotBg = this.add.rectangle(rightX, wepY, cardW - 36, 32, isEvolved ? 0x1e1b4b : 0x0f172a, 0.9);
                slotBg.setStrokeStyle(1, isEvolved ? 0xffd166 : 0x1e293b);

                this.add.image(rightX - cardW / 2 + 38, wepY, wep.icon).setScale(0.55);

                const nameText = this.add.text(rightX - cardW / 2 + 58, wepY - 7, wep.name[lang], {
                    fontFamily: "'Cinzel', serif", fontSize: '12px', fontStyle: 'bold', color: isEvolved ? '#ffd166' : '#ffffff'
                });

                const statusStr = isEvolved ? 'ЭВОЛЮЦИЯ' : (lvl >= wep.maxLevel ? (hasRequired ? 'ГОТОВ К СИНТЕЗУ ✦' : 'МАКС УР. 5') : `Ур. ${lvl}/5`);
                const statusColor = isEvolved ? '#ffd166' : (hasRequired && lvl >= 5 ? '#34d399' : '#94a3b8');

                this.add.text(rightX + cardW / 2 - 30, wepY, statusStr, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', fontStyle: 'bold', color: statusColor
                }).setOrigin(1, 0.5);

                wepY += 36;
            });

            this.add.text(rightX - cardW / 2 + 20, y + 25, 'ПАССИВНЫЕ НАВЫКИ:', {
                fontFamily: "'Cinzel', serif", fontSize: '14px', fontStyle: 'bold', color: '#c084fc', letterSpacing: 1
            });

            let pasY = y + 55;
            if (Object.keys(p.passives).length === 0) {
                this.add.text(rightX - cardW / 2 + 20, pasY + 10, 'Нет активных пассивных способностей', {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', color: '#64748b'
                });
            } else {
                Object.entries(p.passives).forEach(([pId, lvl]) => {
                    const pas = CONFIG.PASSIVES[pId];
                    if (!pas) return;

                    const slotBg = this.add.rectangle(rightX, pasY, cardW - 36, 28, 0x0f172a, 0.9);
                    slotBg.setStrokeStyle(1, 0x1e293b);

                    this.add.image(rightX - cardW / 2 + 38, pasY, pas.icon).setScale(0.48);

                    this.add.text(rightX - cardW / 2 + 58, pasY - 7, pas.name[lang], {
                        fontFamily: "'Cinzel', serif", fontSize: '11px', fontStyle: 'bold', color: '#e2e8f0'
                    });

                    this.add.text(rightX + cardW / 2 - 30, pasY, `Ур. ${lvl}/5`, {
                        fontFamily: "'Rajdhani', sans-serif", fontSize: '12px', fontStyle: 'bold', color: '#38bdf8'
                    }).setOrigin(1, 0.5);

                    pasY += 32;
                });
            }
        }
    }

    createButtons(x, height, lang, isPortrait) {
        const y = height - (isPortrait ? 40 : 45);
        const btnW = isPortrait ? 85 : 180;
        const btnH = isPortrait ? 36 : 46;

        const resumeBtn = this.add.image(x - (isPortrait ? 135 : 280), y, 'btn_battle_green').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
        this.add.text(x - (isPortrait ? 135 : 280), y, 'ПРОДОЛЖИТЬ', {
            fontFamily: "'Cinzel', serif", fontSize: isPortrait ? '11px' : '15px', fontStyle: 'bold', color: '#fff'
        }).setOrigin(0.5);
        resumeBtn.on('pointerdown', () => this.resumeGame());

        const evoBtn = this.add.image(x - (isPortrait ? 45 : 90), y, 'btn_play_bg').setDisplaySize(btnW, btnH).setInteractive({ useHandCursor: true });
        this.add.text(x - (isPortrait ? 45 : 90), y, 'РЕЦЕПТЫ', {
            fontFamily: "'Cinzel', serif", fontSize: isPortrait ? '11px' : '15px', fontStyle: 'bold', color: '#fff'
        }).setOrigin(0.5);
        evoBtn.on('pointerdown', () => this.openEvolutionBookModal(lang));

        const soundBtn = this.add.rectangle(x + (isPortrait ? 45 : 100), y, isPortrait ? btnW : 140, btnH, 0x0f172a, 0.95).setInteractive({ useHandCursor: true });
        soundBtn.setStrokeStyle(1.5, 0x334155);
        const soundText = this.add.text(x + (isPortrait ? 45 : 100), y, window.Sound.isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ', {
            fontFamily: "'Cinzel', serif", fontSize: isPortrait ? '11px' : '14px', fontStyle: 'bold', color: '#fff'
        }).setOrigin(0.5);
        soundBtn.on('pointerdown', () => {
            const isMuted = window.Sound.toggleMute();
            soundText.setText(isMuted ? 'ЗВУК: ВЫКЛ' : 'ЗВУК: ВКЛ');
            soundBtn.setStrokeStyle(1.5, isMuted ? 0xef4444 : 0x38bdf8);
        });

        const menuBtn = this.add.rectangle(x + (isPortrait ? 135 : 270), y, isPortrait ? btnW : 140, btnH, 0x991b1b, 0.95).setInteractive({ useHandCursor: true });
        menuBtn.setStrokeStyle(1.5, 0xfca5a5);
        this.add.text(x + (isPortrait ? 135 : 270), y, 'В МЕНЮ', {
            fontFamily: "'Cinzel', serif", fontSize: isPortrait ? '11px' : '14px', fontStyle: 'bold', color: '#fff'
        }).setOrigin(0.5);
        menuBtn.on('pointerdown', () => {
            this.scene.stop(this.parentSceneKey);
            this.scene.stop('PauseScene');
            this.scene.start('MenuScene');
        });
    }

    openEvolutionBookModal(lang) {
        const { width, height } = this.scale;
        const modalGroup = this.add.group();
        const isPortrait = height > width;

        const backdrop = this.add.rectangle(width / 2, height / 2, width, height, 0x030712, 0.94).setInteractive();
        backdrop.on('pointerdown', () => modalGroup.destroy(true));
        modalGroup.add(backdrop);

        const modalW = isPortrait ? Math.min(width - 20, 420) : Math.min(width - 40, 940);
        const modalH = isPortrait ? Math.min(height - 20, 600) : Math.min(height - 20, 540);

        const modalBg = this.add.rectangle(width / 2, height / 2, modalW, modalH, 0x0b1120, 0.96);
        modalBg.setStrokeStyle(2, 0x0284c7);
        modalGroup.add(modalBg);

        const headerLine = this.add.rectangle(width / 2, height / 2 - modalH / 2 + 50, modalW - 60, 1, 0x334155);
        modalGroup.add(headerLine);

        const title = this.add.text(width / 2, height / 2 - modalH / 2 + 28, 'РЕЦЕПТЫ ЭВОЛЮЦИИ СУПЕР-ОРУЖИЯ', {
            fontFamily: "'Cinzel', serif", fontSize: isPortrait ? '15px' : '20px', fontStyle: 'bold', color: '#38bdf8', letterSpacing: 2
        }).setOrigin(0.5);
        modalGroup.add(title);

        const xBtn = this.add.image(width / 2 + modalW / 2 - 28, height / 2 - modalH / 2 + 28, 'btn_close_circle').setInteractive({ useHandCursor: true });
        xBtn.on('pointerdown', () => modalGroup.destroy(true));
        modalGroup.add(xBtn);

        const evolutions = Object.values(CONFIG.WEAPONS).map(w => ({
            wep: w.id,
            pas: w.requiredPassive,
            sup: w.evolution
        }));

        let startY = height / 2 - modalH / 2 + 68;
        const availableH = modalH - 85;
        const rowSpacing = Math.min(isPortrait ? 76 : 72, availableH / evolutions.length);
        const rowH = rowSpacing - 6;

        evolutions.forEach((evo) => {
            const w = CONFIG.WEAPONS[evo.wep];
            const p = CONFIG.PASSIVES[evo.pas];
            const s = CONFIG.SUPER_WEAPONS[evo.sup];
            if (!w || !p || !s) return;

            const rowBg = this.add.rectangle(width / 2, startY + rowH / 2, modalW - 40, rowH, 0x0f172a, 0.95);
            rowBg.setStrokeStyle(1.5, 0x1e293b);
            modalGroup.add(rowBg);

            const rowMidY = startY + rowH / 2;

            if (isPortrait) {
                const textStr = `${w.name[lang]} (Lv.5) + ${p.name[lang]}\n-> ${s.name[lang].toUpperCase()}`;
                const rowText = this.add.text(width / 2, rowMidY, textStr, {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '13px', fontStyle: 'bold', color: '#00f5d4', align: 'center'
                }).setOrigin(0.5);
                modalGroup.add(rowText);
            } else {
                // 1. Блок базового оружия
                const wepIcon = this.add.image(width / 2 - 345, rowMidY, w.icon).setScale(0.65);
                modalGroup.add(wepIcon);
                const wepText = this.add.text(width / 2 - 315, rowMidY - 8, w.name[lang], {
                    fontFamily: "'Cinzel', serif", fontSize: '13px', fontStyle: 'bold', color: '#ffffff'
                });
                const wepLvl = this.add.text(width / 2 - 315, rowMidY + 8, 'Макс. Ур. 5', {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: '#f59e0b'
                });
                modalGroup.add(wepText);
                modalGroup.add(wepLvl);

                // Плюс
                const plus = this.add.text(width / 2 - 175, rowMidY, '+', {
                    fontFamily: 'sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#94a3b8'
                }).setOrigin(0.5);
                modalGroup.add(plus);

                // 2. Блок пассивки
                const pasIcon = this.add.image(width / 2 - 135, rowMidY, p.icon).setScale(0.65);
                modalGroup.add(pasIcon);
                const pasText = this.add.text(width / 2 - 105, rowMidY - 8, p.name[lang], {
                    fontFamily: "'Cinzel', serif", fontSize: '13px', fontStyle: 'bold', color: '#ffffff'
                });
                const pasLvl = this.add.text(width / 2 - 105, rowMidY + 8, 'Любой уровень', {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '11px', color: '#38bdf8'
                });
                modalGroup.add(pasText);
                modalGroup.add(pasLvl);

                // Стрелка крафта
                const arrow = this.add.text(width / 2 + 55, rowMidY, '➔', {
                    fontSize: '20px', fontStyle: 'bold', color: '#ffd166'
                }).setOrigin(0.5);
                modalGroup.add(arrow);

                // 3. Блок супер-оружия (Эволюция)
                const supBg = this.add.rectangle(width / 2 + 255, rowMidY, 260, 52, 0x1e1b4b);
                supBg.setStrokeStyle(1.5, 0xffd166);
                modalGroup.add(supBg);

                const supIcon = this.add.image(width / 2 + 150, rowMidY, s.icon).setScale(0.7).setTint(0xffd166);
                modalGroup.add(supIcon);

                const supText = this.add.text(width / 2 + 180, rowMidY - 9, s.name[lang].toUpperCase(), {
                    fontFamily: "'Cinzel', serif", fontSize: '12px', fontStyle: 'bold', color: '#ffd166'
                });
                const supDesc = this.add.text(width / 2 + 180, rowMidY + 7, s.desc ? s.desc[lang] : 'Супер-Оружие', {
                    fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', color: '#e2e8f0', wordWrap: { width: 180 }
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
