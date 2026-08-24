/**
 * Upgrade Manager - Генератор 3 случайных карт улучшений при Level Up
 */
class UpgradeManager {
    static getAvailableUpgrades(player) {
        const evolutions = [];
        const normalPool = [];
        const lang = window.SaveManager.data.lang || 'ru';

        const hasWeaponSlots = Object.keys(player.weapons).length < 4;
        const hasPassiveSlots = Object.keys(player.passives).length < 4;

        // 1. Проверка эволюций оружия в Супер-Оружие (Приоритет #1)
        Object.entries(player.weapons).forEach(([weaponId, level]) => {
            const config = CONFIG.WEAPONS[weaponId];
            if (!config) return;
            const hasRequiredPassive = (player.passives && player.passives[config.requiredPassive] > 0);
            const isAlreadySuper = player.superWeapons && player.superWeapons.includes(config.evolution);

            if (level >= 5 && hasRequiredPassive && !isAlreadySuper) {
                const superConfig = CONFIG.SUPER_WEAPONS[config.evolution];
                if (superConfig) {
                    evolutions.push({
                        type: 'evolution',
                        id: config.evolution,
                        baseWeapon: weaponId,
                        name: superConfig.name[lang],
                        desc: superConfig.desc[lang],
                        icon: superConfig.icon,
                        isSuper: true
                    });
                }
            }
        });

        // 2. Обычные оружия
        Object.entries(CONFIG.WEAPONS).forEach(([id, config]) => {
            const currentLvl = player.weapons[id] || 0;
            if (currentLvl > 0 && currentLvl < 5) {
                // Апгрейд имеющегося оружия
                normalPool.push({
                    type: 'weapon',
                    id: id,
                    level: currentLvl + 1,
                    name: config.name[lang],
                    desc: config.desc[lang],
                    icon: config.icon,
                    isNew: false
                });
            } else if (currentLvl === 0 && hasWeaponSlots && !player.superWeapons.includes(config.evolution)) {
                // Новое оружие
                normalPool.push({
                    type: 'weapon',
                    id: id,
                    level: 1,
                    name: config.name[lang],
                    desc: config.desc[lang],
                    icon: config.icon,
                    isNew: true
                });
            }
        });

        // 3. Пассивки
        Object.entries(CONFIG.PASSIVES).forEach(([id, config]) => {
            const currentLvl = player.passives[id] || 0;
            if (currentLvl > 0 && currentLvl < 5) {
                // Апгрейд имеющейся пассивки
                normalPool.push({
                    type: 'passive',
                    id: id,
                    level: currentLvl + 1,
                    name: config.name[lang],
                    desc: config.desc[lang],
                    icon: config.icon,
                    isNew: false
                });
            } else if (currentLvl === 0 && hasPassiveSlots) {
                // Новая пассивка
                normalPool.push({
                    type: 'passive',
                    id: id,
                    level: 1,
                    name: config.name[lang],
                    desc: config.desc[lang],
                    icon: config.icon,
                    isNew: true
                });
            }
        });

        // Если инвентарь заполнен до предела и нет эволюций
        if (normalPool.length === 0 && evolutions.length === 0) {
            normalPool.push({
                type: 'heal',
                id: 'heal',
                name: lang === 'ru' ? 'Полное Исцеление' : 'Full Heal',
                desc: lang === 'ru' ? 'Восстанавливает 60 HP' : 'Restores 60 HP',
                icon: 'icon_heart',
                isNew: false
            });
            normalPool.push({
                type: 'gold',
                id: 'gold',
                name: lang === 'ru' ? 'Мешок Золота' : 'Gold Pouch',
                desc: lang === 'ru' ? '+150 Золота' : '+150 Gold',
                icon: 'icon_coin',
                isNew: false
            });
        }

        // Перемешиваем обычный пул, но Эволюции ВСЕГДА гарантированно ставим в начало!
        Phaser.Utils.Array.Shuffle(normalPool);
        const finalPool = [...evolutions, ...normalPool];
        return finalPool.slice(0, 3);
    }

    static applyUpgrade(player, upgrade) {
        if (upgrade.type === 'evolution') {
            player.evolveWeapon(upgrade.baseWeapon, upgrade.id);
            if (window.QuestManager) {
                window.QuestManager.checkProgress(player.scene, 'evolution', 1);
            }
        } else if (upgrade.type === 'weapon') {
            player.addWeapon(upgrade.id);
        } else if (upgrade.type === 'passive') {
            player.addPassive(upgrade.id);
        } else if (upgrade.type === 'heal') {
            player.heal(60);
        } else if (upgrade.type === 'gold') {
            player.addGold(150);
        }
    }
}

window.UpgradeManager = UpgradeManager;
