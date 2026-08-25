/**
 * MapSwiperModal.js
 * Интерактивное 3D модальное окно выбора арены на базе библиотеки Swiper.js
 */
class MapSwiperModal {
    static mapList = ['dark_castle', 'cursed_forest', 'infernal_abyss', 'frozen_citadel'];
    static currentHeroId = 'knight';
    static swiperInstance = null;
    static menuScene = null;
    static modalEl = null;
    static heroTagEl = null;
    static startBtnEl = null;
    static backBtnEl = null;
    static closeBtnEl = null;
    static swiperEl = null;
    static isEventsBound = false;

    static init(menuScene) {
        this.menuScene = menuScene;
        this.modalEl = document.getElementById('map-swiper-modal');
        this.heroTagEl = document.getElementById('swiper-selected-hero');
        this.startBtnEl = document.getElementById('swiper-start-battle-btn');
        this.backBtnEl = document.getElementById('swiper-btn-heroes');
        this.closeBtnEl = document.getElementById('swiper-btn-close');
        this.swiperEl = document.querySelector('.arena-swiper');

        if (!this.isEventsBound) {
            this.setupEventListeners();
            this.isEventsBound = true;
        }
    }

    static setupEventListeners() {
        if (this.backBtnEl) {
            this.backBtnEl.onclick = () => {
                if (window.Sound && window.Sound.playShoot) window.Sound.playShoot();
                this.close();
                if (this.menuScene && this.menuScene.openHeroSelectModal) {
                    this.menuScene.openHeroSelectModal();
                }
            };
        }

        if (this.closeBtnEl) {
            this.closeBtnEl.onclick = () => {
                if (window.Sound && window.Sound.playShoot) window.Sound.playShoot();
                this.close();
            };
        }

        if (this.startBtnEl) {
            this.startBtnEl.onclick = () => {
                this.handleStartBattle();
            };
        }

        // Закрытие по клику на фон
        if (this.modalEl) {
            this.modalEl.addEventListener('click', (e) => {
                if (e.target === this.modalEl) {
                    this.close();
                }
            });
        }

        // Поддержка клавиш клавиатуры (ESC / Enter / Arrows)
        window.addEventListener('keydown', (e) => {
            if (!this.isOpen()) return;
            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'Enter') {
                this.handleStartBattle();
            }
        });
    }

    static initSwiperIfNeeded(initialIndex = 0) {
        if (typeof Swiper === 'undefined') {
            console.warn('[MapSwiperModal] Swiper.js not loaded!');
            return;
        }

        if (this.swiperInstance) {
            this.swiperInstance.destroy(true, true);
            this.swiperInstance = null;
        }

        const isMobilePortrait = window.innerHeight > window.innerWidth;

        this.swiperInstance = new Swiper('.arena-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            initialSlide: initialIndex,
            speed: 400,
            coverflowEffect: {
                rotate: isMobilePortrait ? 10 : 20,
                stretch: 0,
                depth: isMobilePortrait ? 120 : 200,
                modifier: 1,
                slideShadows: true,
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            on: {
                slideChange: () => {
                    if (window.Sound && window.Sound.playShoot) {
                        window.Sound.playShoot();
                    }
                    this.updateButtonState();
                }
            }
        });
    }

    static open(selectedHeroId) {
        if (!this.modalEl) {
            this.modalEl = document.getElementById('map-swiper-modal');
            this.heroTagEl = document.getElementById('swiper-selected-hero');
            this.startBtnEl = document.getElementById('swiper-start-battle-btn');
            this.backBtnEl = document.getElementById('swiper-btn-heroes');
            this.closeBtnEl = document.getElementById('swiper-btn-close');
            this.swiperEl = document.querySelector('.arena-swiper');
            if (!this.isEventsBound) {
                this.setupEventListeners();
                this.isEventsBound = true;
            }
        }

        this.currentHeroId = selectedHeroId || (window.SaveManager && window.SaveManager.data.selectedHero) || 'knight';
        const lang = (window.SaveManager && window.SaveManager.data.lang) || 'ru';
        const heroCfg = (typeof CONFIG !== 'undefined' && CONFIG.HEROES && CONFIG.HEROES[this.currentHeroId]) ? CONFIG.HEROES[this.currentHeroId] : (CONFIG.HEROES.knight || { name: { ru: 'Рыцарь', en: 'Knight' } });

        if (this.heroTagEl) {
            this.heroTagEl.innerHTML = `⚔️ ГЕРОЙ: <b>${heroCfg.name[lang].toUpperCase()}</b>`;
        }

        // Обновляем рекорды и состояние замков на слайдах
        this.updateSlidesData();

        if (this.modalEl) {
            this.modalEl.style.display = 'flex';
            this.modalEl.classList.remove('modal-closing');
            this.modalEl.classList.add('modal-opening');
        }

        const selectedMap = (window.SaveManager && window.SaveManager.data.selectedMap) || 'dark_castle';
        let initialIdx = this.mapList.indexOf(selectedMap);
        if (initialIdx < 0) initialIdx = 0;

        // Инициализируем Swiper
        setTimeout(() => {
            this.initSwiperIfNeeded(initialIdx);
            this.updateButtonState();
        }, 30);
    }

    static updateSlidesData() {
        const lang = (window.SaveManager && window.SaveManager.data.lang) || 'ru';

        this.mapList.forEach(mId => {
            const mapCfg = CONFIG.MAPS[mId];
            if (!mapCfg) return;

            const isUnlocked = window.SaveManager ? window.SaveManager.isMapUnlocked(mId) : true;
            const recordSec = window.SaveManager ? window.SaveManager.getMapRecord(mId) : 0;
            const mins = Math.floor(recordSec / 60);
            const secs = recordSec % 60;
            const recordStr = recordSec >= 600 ? 'ПОБЕДА (10:00)' : `РЕКОРД: ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

            // Обновляем плашку рекорда
            const recEl = document.getElementById(`rec-${mId}`);
            if (recEl) {
                recEl.textContent = `🏆 ${recordStr}`;
                if (recordSec > 0) {
                    recEl.classList.add('has-record');
                } else {
                    recEl.classList.remove('has-record');
                }
            }

            // Обновляем оверлей замка
            const lockEl = document.getElementById(`lock-${mId}`);
            const slideEl = document.querySelector(`.swiper-slide[data-map-id="${mId}"]`);
            if (lockEl && slideEl) {
                if (isUnlocked) {
                    lockEl.style.display = 'none';
                    slideEl.classList.remove('is-locked');
                } else {
                    lockEl.style.display = 'flex';
                    slideEl.classList.add('is-locked');
                    const reqName = CONFIG.MAPS[mapCfg.requiredMap] ? CONFIG.MAPS[mapCfg.requiredMap].name[lang] : 'предыдущей арене';
                    const lockTextEl = lockEl.querySelector('.lock-text');
                    if (lockTextEl) {
                        lockTextEl.textContent = `ВЫЖИВИТЕ 5 МИН В "${reqName.toUpperCase()}"`;
                    }
                }
            }
        });
    }

    static updateButtonState() {
        if (!this.swiperInstance || !this.startBtnEl) return;

        const activeIdx = this.swiperInstance.activeIndex;
        const currentMapId = this.mapList[activeIdx] || 'dark_castle';
        const mapCfg = CONFIG.MAPS[currentMapId];
        const isUnlocked = window.SaveManager ? window.SaveManager.isMapUnlocked(currentMapId) : true;
        const lang = (window.SaveManager && window.SaveManager.data.lang) || 'ru';

        const btnLabel = this.startBtnEl.querySelector('.btn-label');

        if (isUnlocked) {
            this.startBtnEl.classList.remove('btn-locked');
            this.startBtnEl.disabled = false;
            if (btnLabel) {
                btnLabel.innerHTML = '⚔️ СТАРТ БИТВЫ! ⚔️';
            }
        } else {
            this.startBtnEl.classList.add('btn-locked');
            this.startBtnEl.disabled = false;
            const reqName = CONFIG.MAPS[mapCfg.requiredMap] ? CONFIG.MAPS[mapCfg.requiredMap].name[lang] : 'предыдущей арене';
            if (btnLabel) {
                btnLabel.innerHTML = `🔒 ВЫЖИВИТЕ 5 МИН В "${reqName.toUpperCase()}"`;
            }
        }
    }

    static handleStartBattle() {
        if (!this.swiperInstance) return;

        const activeIdx = this.swiperInstance.activeIndex;
        const currentMapId = this.mapList[activeIdx] || 'dark_castle';
        const isUnlocked = window.SaveManager ? window.SaveManager.isMapUnlocked(currentMapId) : true;

        if (!isUnlocked) {
            const activeSlide = this.swiperInstance.slides[activeIdx];
            if (activeSlide) {
                activeSlide.classList.add('shake-anim');
                setTimeout(() => activeSlide.classList.remove('shake-anim'), 500);
            }
            if (window.Sound && window.Sound.playHit) {
                window.Sound.playHit();
            }
            return;
        }

        if (window.SaveManager) {
            window.SaveManager.data.selectedMap = currentMapId;
            window.SaveManager.data.selectedHero = this.currentHeroId;
            window.SaveManager.save();
        }

        this.close();

        if (this.menuScene && this.menuScene.startBattleTransition) {
            this.menuScene.startBattleTransition('GameScene', {
                heroId: this.currentHeroId,
                hero: this.currentHeroId,
                mapId: currentMapId
            });
        }
    }

    static close() {
        if (!this.modalEl) return;
        this.modalEl.classList.remove('modal-opening');
        this.modalEl.classList.add('modal-closing');
        setTimeout(() => {
            this.modalEl.style.display = 'none';
            this.modalEl.classList.remove('modal-closing');
            if (this.swiperInstance) {
                this.swiperInstance.destroy(true, true);
                this.swiperInstance = null;
            }
        }, 200);
    }

    static isOpen() {
        return this.modalEl && this.modalEl.style.display !== 'none';
    }
}

window.MapSwiperModal = MapSwiperModal;
