/**
 * Save Manager - Управление мета-прогрессией, золотом, талантами и персонажами
 */
class SaveManager {
    constructor() {
        this.data = {
            gold: 0,
            unlockedHeroes: ['knight'],
            selectedHero: 'knight',
            unlockedMaps: ['dark_castle'],
            selectedMap: 'dark_castle',
            mapRecords: {
                dark_castle: 0,
                cursed_forest: 0,
                infernal_abyss: 0,
                frozen_citadel: 0
            },
            talents: {
                damage: 0,
                hp: 0,
                speed: 0,
                magnet: 0,
                regen: 0,
                greed: 0,
                revive: 0
            },
            stats: {
                totalKills: 0,
                bestTimeSec: 0,
                totalRuns: 0
            },
            quests: {},
            questProgress: {
                totalKills: 0
            },
            lang: 'ru'
        };
        this.isLoaded = false;
    }

    async init() {
        const loaded = await window.YandexSDK.loadData();
        if (loaded) {
            this.data = { ...this.data, ...loaded };
            if (!this.data.unlockedHeroes || !this.data.unlockedHeroes.includes('knight')) {
                this.data.unlockedHeroes = ['knight'];
            }
            if (!this.data.unlockedMaps || !this.data.unlockedMaps.includes('dark_castle')) {
                this.data.unlockedMaps = ['dark_castle'];
            }
            if (!this.data.selectedMap) this.data.selectedMap = 'dark_castle';
            if (!this.data.mapRecords) {
                this.data.mapRecords = { dark_castle: 0, cursed_forest: 0, infernal_abyss: 0, frozen_citadel: 0 };
            }
            if (!this.data.quests) this.data.quests = {};
            if (!this.data.questProgress) this.data.questProgress = { totalKills: 0 };
        }
        this.data.lang = window.YandexSDK.getLang();
        this.isLoaded = true;
    }

    async save() {
        await window.YandexSDK.saveData(this.data);
    }

    addGold(amount) {
        const greedLevel = this.data.talents.greed || 0;
        const greedBonus = 1 + (greedLevel * CONFIG.TALENTS.greed.step);
        const finalGold = Math.floor(amount * greedBonus);
        this.data.gold += finalGold;
        this.save();
        return finalGold;
    }

    getTalentLevel(id) {
        return this.data.talents[id] || 0;
    }

    getTalentCost(id) {
        const config = CONFIG.TALENTS[id];
        const currentLevel = this.getTalentLevel(id);
        if (currentLevel >= config.max) return null;
        return config.baseCost + (currentLevel * config.costStep);
    }

    buyTalent(id) {
        const cost = this.getTalentCost(id);
        if (cost === null || this.data.gold < cost) return false;
        
        this.data.gold -= cost;
        this.data.talents[id] = (this.data.talents[id] || 0) + 1;
        this.save();
        return true;
    }

    upgradeTalent(id) {
        return this.buyTalent(id);
    }

    isHeroUnlocked(heroId) {
        return this.data.unlockedHeroes.includes(heroId);
    }

    unlockHero(heroId) {
        const config = CONFIG.HEROES[heroId];
        if (!config || this.isHeroUnlocked(heroId)) return true;
        
        if (this.data.gold < config.price) return false;
        
        this.data.gold -= config.price;
        this.data.unlockedHeroes.push(heroId);
        this.save();
        return true;
    }

    getEffectiveStats(heroId) {
        const hero = CONFIG.HEROES[heroId] || CONFIG.HEROES.knight;
        const stats = { ...hero.baseStats };
        const talents = this.data.talents;

        // Применяем таланты
        stats.damageMulti += (talents.damage || 0) * CONFIG.TALENTS.damage.step;
        stats.maxHp += (talents.hp || 0) * CONFIG.TALENTS.hp.step;
        stats.hp = stats.maxHp;
        stats.speed += (talents.speed || 0) * CONFIG.TALENTS.speed.step;
        stats.magnetRadius += (talents.magnet || 0) * CONFIG.TALENTS.magnet.step;
        stats.hpRegen += (talents.regen || 0) * CONFIG.TALENTS.regen.step;
        stats.freeRevives = (talents.revive || 0);

        return stats;
    }

    recordRun(timeSec, kills) {
        if (!this.data.stats) {
            this.data.stats = { totalKills: 0, bestTimeSec: 0, totalRuns: 0 };
        }
        this.data.stats.totalRuns = (this.data.stats.totalRuns || 0) + 1;
        this.data.stats.totalKills = (this.data.stats.totalKills || 0) + kills;
        if (timeSec > (this.data.stats.bestTimeSec || 0)) {
            this.data.stats.bestTimeSec = timeSec;
            window.YandexSDK.setLeaderboardScore(timeSec);
        }
        this.save();
    }

    isMapUnlocked(mapId) {
        if (!this.data.unlockedMaps) this.data.unlockedMaps = ['dark_castle'];
        return this.data.unlockedMaps.includes(mapId);
    }

    unlockMap(mapId) {
        if (!this.data.unlockedMaps) this.data.unlockedMaps = ['dark_castle'];
        if (!this.data.unlockedMaps.includes(mapId)) {
            this.data.unlockedMaps.push(mapId);
            this.save();
            return true;
        }
        return false;
    }

    getMapRecord(mapId) {
        if (!this.data.mapRecords) this.data.mapRecords = {};
        return this.data.mapRecords[mapId] || 0;
    }

    recordMapRun(mapId, timeSec, kills) {
        this.recordRun(timeSec, kills);
        if (!this.data.mapRecords) this.data.mapRecords = {};
        if (timeSec > (this.data.mapRecords[mapId] || 0)) {
            this.data.mapRecords[mapId] = timeSec;
        }

        // Проверяем разблокировку следующих карт (при выживании от 5 минут / 300 сек)
        if (timeSec >= 300) {
            if (mapId === 'dark_castle') this.unlockMap('cursed_forest');
            else if (mapId === 'cursed_forest') this.unlockMap('infernal_abyss');
            else if (mapId === 'infernal_abyss') this.unlockMap('frozen_citadel');
        }
        this.save();
    }

    getBestScore() {
        if (!this.data || !this.data.stats) {
            return { kills: 0, bestTimeSec: 0, totalRuns: 0 };
        }
        return {
            kills: this.data.stats.totalKills || 0,
            bestTimeSec: this.data.stats.bestTimeSec || 0,
            totalRuns: this.data.stats.totalRuns || 0
        };
    }
}

window.SaveManager = new SaveManager();
