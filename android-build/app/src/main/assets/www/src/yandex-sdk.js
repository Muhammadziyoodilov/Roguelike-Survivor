/**
 * Yandex Games SDK Wrapper & Safe Fallback Bridge
 */
class YandexSDKWrapper {
    constructor() {
        this.ysdk = null;
        this.player = null;
        this.lb = null;
        this.isInitialized = false;
        this.isMock = false;
        this.lastFullscreenTime = 0;
        this.fullscreenCooldownMs = 120000; // 2 минуты кулдаун между обычными рекламами
    }

    async init() {
        if (this.isInitialized) return;
        
        const isLocal = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.protocol === 'file:';

        if (!isLocal && typeof YaGames !== 'undefined') {
            try {
                this.ysdk = await YaGames.init();
                console.log('[Yandex SDK] SDK успешно инициализирован');
                
                // Инициализация игрока для облачных сохранений
                try {
                    this.player = await this.ysdk.getPlayer({ scopes: false });
                    console.log('[Yandex SDK] Player авторизован');
                } catch (e) {
                    console.log('[Yandex SDK] Гостевой режим Player');
                }

                // Инициализация лидерборда
                try {
                    if (this.ysdk.leaderboards) {
                        this.lb = this.ysdk.leaderboards;
                    } else if (this.ysdk.getLeaderboards) {
                        this.lb = await this.ysdk.getLeaderboards();
                    }
                } catch (e) {
                    console.log('[Yandex SDK] Лидерборды недоступны');
                }

                // Уведомление о готовности игры
                if (this.ysdk.features && this.ysdk.features.LoadingAPI) {
                    this.ysdk.features.LoadingAPI.ready();
                }

                this.isInitialized = true;
                return;
            } catch (err) {
                console.warn('Ошибка инициализации Yandex SDK, переключаемся в Mock:', err);
            }
        }
        
        // Mock fallback для локальной разработки
        this.isMock = true;
        this.isInitialized = true;
        console.log('[Yandex SDK] Запущен в Mock-режиме (локально)');
    }

    gameplayStart() {
        if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
            try {
                this.ysdk.features.GameplayAPI.start();
                console.log('[Yandex SDK] GameplayAPI: start');
            } catch (e) {}
        }
    }

    gameplayStop() {
        if (this.ysdk && this.ysdk.features && this.ysdk.features.GameplayAPI) {
            try {
                this.ysdk.features.GameplayAPI.stop();
                console.log('[Yandex SDK] GameplayAPI: stop');
            } catch (e) {}
        }
    }

    getLang() {
        if (this.ysdk && this.ysdk.environment && this.ysdk.environment.i18n) {
            const lang = this.ysdk.environment.i18n.lang;
            if (lang.startsWith('ru') || lang.startsWith('be') || lang.startsWith('uk')) return 'ru';
        }
        return 'ru'; // По умолчанию русский
    }

    showFullscreenAdv(onClose) {
        const now = Date.now();
        if (now - this.lastFullscreenTime < this.fullscreenCooldownMs && !this.isMock) {
            if (onClose) onClose(false);
            return;
        }

        if (this.isMock || !this.ysdk) {
            console.log('[Mock Adv] Полноэкранная реклама показана');
            if (onClose) setTimeout(() => onClose(true), 300);
            return;
        }

        // Глушим звук на время рекламы
        const wasMuted = window.Sound.isMuted;
        window.Sound.isMuted = true;
        window.Sound.stopBGM();

        this.ysdk.adv.showFullscreenAdv({
            callbacks: {
                onClose: (wasShown) => {
                    this.lastFullscreenTime = Date.now();
                    window.Sound.isMuted = wasMuted;
                    if (!wasMuted) window.Sound.startBGM();
                    if (onClose) onClose(wasShown);
                },
                onError: (error) => {
                    console.warn('Ошибка полноэкранной рекламы:', error);
                    window.Sound.isMuted = wasMuted;
                    if (onClose) onClose(false);
                }
            }
        });
    }

    showRewardedVideo(onReward, onClose) {
        if (this.isMock || !this.ysdk) {
            console.log('[Mock Rewarded] Реклама с вознаграждением просмотрена!');
            if (onReward) onReward();
            if (onClose) setTimeout(() => onClose(true), 400);
            return;
        }

        const wasMuted = window.Sound.isMuted;
        window.Sound.isMuted = true;
        window.Sound.stopBGM();

        this.ysdk.adv.showRewardedVideo({
            callbacks: {
                onOpen: () => {
                    console.log('Rewarded видео открыто');
                },
                onRewarded: () => {
                    console.log('Награда получена!');
                    if (onReward) onReward();
                },
                onClose: () => {
                    window.Sound.isMuted = wasMuted;
                    if (!wasMuted) window.Sound.startBGM();
                    if (onClose) onClose(true);
                },
                onError: (error) => {
                    console.warn('Ошибка Rewarded видео:', error);
                    window.Sound.isMuted = wasMuted;
                    if (onClose) onClose(false);
                }
            }
        });
    }

    async saveData(data) {
        // Всегда сохраняем в LocalStorage
        try {
            localStorage.setItem('survivor_10m_save', JSON.stringify(data));
        } catch (e) {}

        // Если доступен Yandex Player - сохраняем в облако
        if (this.player) {
            try {
                await this.player.setData(data, true);
                console.log('[Yandex SDK] Прогресс сохранен в облако Яндекс');
            } catch (e) {
                console.warn('Не удалось сохранить в облако Яндекс:', e);
            }
        }
    }

    async loadData() {
        let localData = null;
        try {
            const raw = localStorage.getItem('survivor_10m_save');
            if (raw) localData = JSON.parse(raw);
        } catch (e) {}

        if (this.player) {
            try {
                const cloudData = await this.player.getData();
                if (cloudData && Object.keys(cloudData).length > 0) {
                    return cloudData;
                }
            } catch (e) {
                console.warn('Ошибка загрузки из облака Яндекс:', e);
            }
        }

        return localData;
    }

    setLeaderboardScore(score) {
        if (this.lb) {
            this.lb.setLeaderboardScore('best_score', score).catch(() => {});
        }
    }
}

window.YandexSDK = new YandexSDKWrapper();
