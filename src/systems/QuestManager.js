/**
 * Quest & Achievements Manager - Система достижений и наград для удержания игроков
 */
class QuestManager {
    static get QUESTS() {
        return {
            survive_1m: { id: 'survive_1m', name: { ru: 'Первый бой', en: 'First Battle' }, desc: { ru: 'Продержаться 1 минуту', en: 'Survive 1 minute' }, reward: 100, iconKey: 'ui_clock', target: 60, type: 'time' },
            survive_5m: { id: 'survive_5m', name: { ru: 'Опытный боец', en: 'Veteran' }, desc: { ru: 'Продержаться 5 минут', en: 'Survive 5 minutes' }, reward: 300, iconKey: 'ui_shield', target: 300, type: 'time' },
            survive_10m: { id: 'survive_10m', name: { ru: 'Триумф Арены', en: 'Arena Triumph' }, desc: { ru: 'Выжить все 10 минут и победить Повелителя Тьмы', en: 'Survive all 10 minutes and defeat Dark Overlord' }, reward: 1000, iconKey: 'ui_trophy', target: 600, type: 'time' },
            slayer_100: { id: 'slayer_100', name: { ru: 'Истребитель', en: 'Slayer' }, desc: { ru: 'Убить 100 монстров суммарно', en: 'Kill 100 monsters total' }, reward: 150, iconKey: 'ui_skull', target: 100, type: 'kills' },
            slayer_1000: { id: 'slayer_1000', name: { ru: 'Гроза Нечисти', en: 'Bane of Evil' }, desc: { ru: 'Убить 1,000 монстров суммарно', en: 'Kill 1,000 monsters total' }, reward: 500, iconKey: 'ui_swords', target: 1000, type: 'kills' },
            first_evolution: { id: 'first_evolution', name: { ru: 'Алхимик Оружия', en: 'Weapon Alchemist' }, desc: { ru: 'Собрать своё первое Супер-Оружие (Эволюцию)', en: 'Create your first Super Weapon Evolution' }, reward: 400, iconKey: 'ui_star', target: 1, type: 'evolution' },
            first_boss: { id: 'first_boss', name: { ru: 'Победитель Боссов', en: 'Boss Conqueror' }, desc: { ru: 'Одолеть любого босса цунами', en: 'Defeat any tsunami boss' }, reward: 250, iconKey: 'ui_boss_skull', target: 1, type: 'boss' },
            coop_match: { id: 'coop_match', name: { ru: 'Командный дух', en: 'Team Spirit' }, desc: { ru: 'Сыграть 1 матч в режиме на двоих', en: 'Play 1 match in Co-op mode' }, reward: 200, iconKey: 'ui_coop', target: 1, type: 'coop' }
        };
    }

    static checkProgress(scene, type, value = 1) {
        const data = window.SaveManager.data;
        if (!data.quests) data.quests = {};
        if (!data.questProgress) data.questProgress = {};

        let unlockedAny = false;

        Object.values(this.QUESTS).forEach((q) => {
            if (data.quests[q.id]) return; // уже выполнено

            if (q.type === type) {
                if (type === 'kills') {
                    data.questProgress.totalKills = (data.questProgress.totalKills || 0) + value;
                    if (data.questProgress.totalKills >= q.target) {
                        this.unlockQuest(scene, q.id);
                        unlockedAny = true;
                    }
                } else if (type === 'time') {
                    if (value >= q.target) {
                        this.unlockQuest(scene, q.id);
                        unlockedAny = true;
                    }
                } else if (type === 'evolution' || type === 'boss' || type === 'coop') {
                    this.unlockQuest(scene, q.id);
                    unlockedAny = true;
                }
            }
        });

        if (unlockedAny) {
            window.SaveManager.save();
        }
    }

    static unlockQuest(scene, questId) {
        const q = this.QUESTS[questId];
        if (!q) return;

        const data = window.SaveManager.data;
        data.quests[questId] = true;
        data.gold += q.reward;
        window.SaveManager.save();

        // Звук получения ачивки
        if (window.Sound && window.Sound.playLevelUp) {
            window.Sound.playLevelUp();
        }

        // Всплывающее уведомление на экране (Toast)
        if (scene && scene.add) {
            this.showToast(scene, q);
        }
    }

    static showToast(scene, quest) {
        const { width, height } = scene.scale;
        const lang = window.SaveManager.data.lang || 'ru';
        const targetY = height - 42;

        const toastBg = scene.add.rectangle(width / 2, height + 60, 440, 50, 0x0f172a, 0.95).setScrollFactor(0).setDepth(300);
        toastBg.setStrokeStyle(2, 0xffd166);

        const trophyIcon = scene.add.image(width / 2 - 180, height + 60, 'ui_trophy').setScrollFactor(0).setDepth(301);
        const toastText = scene.add.text(width / 2 + 10, height + 60, `ДОСТИЖЕНИЕ: ${quest.name[lang]} (+${quest.reward} ЗОЛ.)`, {
            fontFamily: CONFIG.FONTS.TITLE,
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#ffd166',
            stroke: '#000',
            strokeThickness: 3
        }).setScrollFactor(0).setOrigin(0.5).setDepth(301);

        if (scene.hudGroup) {
            scene.hudGroup.add(toastBg);
            scene.hudGroup.add(trophyIcon);
            scene.hudGroup.add(toastText);
            if (typeof scene.applyCameraIgnores === 'function') {
                scene.applyCameraIgnores();
            }
        }

        scene.tweens.add({
            targets: [toastBg, trophyIcon, toastText],
            y: targetY,
            duration: 400,
            ease: 'Back.easeOut',
            onComplete: () => {
                scene.time.delayedCall(3000, () => {
                    scene.tweens.add({
                        targets: [toastBg, trophyIcon, toastText],
                        y: height + 60,
                        alpha: 0,
                        duration: 400,
                        onComplete: () => {
                            toastBg.destroy();
                            trophyIcon.destroy();
                            toastText.destroy();
                        }
                    });
                });
            }
        });
    }
}

window.QuestManager = QuestManager;
