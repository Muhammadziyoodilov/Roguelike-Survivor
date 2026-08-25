/**
 * Procedural Texture Generator
 * Generates all game sprites, icons, and visual FX on HTML5 Canvas dynamically
 */
class TextureGenerator {
    static generateAll(scene) {
        this.scene = scene;
        
        // 1. Тайлы пола, стен, препятствий и превью для 4 карт
        this.createAllFloorTiles();
        this.createAllObstacleTiles();
        this.createMapPreviews();
        
        // 2. Герои (минималистичный пиксель-арт)
        this.createHeroShadow();
        this.createKnight();
        this.createArcher();
        this.createMage();
        this.createNinja();
        this.createNecromancer();
        
        // 3. Монстры всех 4 локаций
        this.createAllEnemies();
        
        // 4. Боссы всех 4 локаций
        this.createAllBosses();
        
        // 5. Снаряды и спецэффекты
        this.createProjectiles();
        
        // 6. Дроп и бонусы
        this.createPickups();
        this.createPowerupsAndDecals();
        
        // 7. Пропсы и арена
        this.createPropsAndFX();

        // 8. Иконки и стекло-UI
        this.createIcons();
        this.createUIIcons();
        this.createGlassUIComponents();
    }

    static createCanvas(key, width, height, drawFn) {
        if (this.scene.textures.exists(key)) return;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFn(ctx, width, height);
        this.scene.textures.addCanvas(key, canvas);
    }

    // --- TILES & ARENA ДЛЯ 4 КАРТ ---
    static createAllFloorTiles() {
        // === КАРТА 1: ТЁМНЫЙ ЗАМОК (ТЕМНЫЙ СЛАНЕЦ БЕЗ ВИЗУАЛЬНОГО ШУМА) ===
        const drawCastleFloor = (ctx, isAlt) => {
            ctx.fillStyle = '#0b0f19';
            ctx.fillRect(0, 0, 64, 64);

            // Плита 1 (Верх-лево)
            ctx.fillStyle = '#131b2e';
            ctx.fillRect(2, 2, 28, 28);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(2, 2, 28, 1);
            ctx.fillRect(2, 2, 1, 28);

            // Плита 2 (Верх-право)
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(34, 2, 28, 28);
            ctx.fillStyle = '#1c283d';
            ctx.fillRect(34, 2, 28, 1);
            ctx.fillRect(34, 2, 1, 28);

            // Плита 3 (Низ-лево)
            ctx.fillStyle = '#11192b';
            ctx.fillRect(2, 34, 28, 28);
            ctx.fillStyle = '#1c283d';
            ctx.fillRect(2, 34, 28, 1);
            ctx.fillRect(2, 34, 1, 28);

            // Плита 4 (Низ-право)
            ctx.fillStyle = '#141d30';
            ctx.fillRect(34, 34, 28, 28);
            ctx.fillStyle = '#223049';
            ctx.fillRect(34, 34, 28, 1);
            ctx.fillRect(34, 34, 1, 28);

            // Швы между плитами
            ctx.fillStyle = '#060913';
            ctx.fillRect(30, 0, 4, 64);
            ctx.fillRect(0, 30, 64, 4);

            // Тонкие выветренные каменные трещины
            ctx.fillStyle = '#24324a';
            ctx.fillRect(8, 12, 6, 1);
            ctx.fillRect(42, 45, 8, 1);

            if (isAlt) {
                // Тонкий приглушенный древний рунический узор (без ярких кричащих кругов)
                ctx.strokeStyle = '#22324e';
                ctx.lineWidth = 1;
                ctx.strokeRect(10, 10, 44, 44);
                ctx.fillStyle = '#2b3f63';
                ctx.fillRect(31, 31, 2, 2);
            }
        };

        this.createCanvas('tile_floor_castle', 64, 64, (ctx) => drawCastleFloor(ctx, false));
        this.createCanvas('tile_floor_castle_alt', 64, 64, (ctx) => drawCastleFloor(ctx, true));
        this.createCanvas('tile_floor', 64, 64, (ctx) => drawCastleFloor(ctx, false));
        this.createCanvas('tile_floor_rune', 64, 64, (ctx) => drawCastleFloor(ctx, true));

        // Стена замка
        const drawCastleWall = (ctx) => {
            ctx.fillStyle = '#080d1a';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(2, 2, 60, 28);
            ctx.fillRect(2, 34, 28, 28);
            ctx.fillRect(34, 34, 28, 28);
            ctx.fillStyle = '#334155';
            ctx.fillRect(2, 2, 60, 2);
            ctx.fillRect(2, 34, 28, 2);
            ctx.fillRect(34, 34, 28, 2);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(2, 28, 60, 2);
            ctx.fillRect(2, 60, 28, 2);
            ctx.fillRect(34, 60, 28, 2);
        };
        this.createCanvas('tile_wall_castle', 64, 64, drawCastleWall);
        this.createCanvas('tile_wall', 64, 64, drawCastleWall);

        // === КАРТА 2: ПРОКЛЯТЫЙ ЛЕС (МШИСТАЯ ПОЧВА И КОРНИ) ===
        const drawForestFloor = (ctx, isAlt) => {
            ctx.fillStyle = '#071510';
            ctx.fillRect(0, 0, 64, 64);

            // Тонкие переходы глубокого лесного мха
            ctx.fillStyle = '#0b1f18';
            ctx.fillRect(4, 4, 56, 56);
            ctx.fillStyle = '#0e261e';
            ctx.fillRect(12, 8, 40, 20);
            ctx.fillRect(8, 36, 48, 20);

            // Тонкие вкрапления темной листвы
            ctx.fillStyle = '#123026';
            ctx.fillRect(16, 12, 10, 8);
            ctx.fillRect(36, 40, 12, 8);

            // Еле заметные тонкие темные корешки
            ctx.fillStyle = '#050f0b';
            ctx.fillRect(0, 31, 64, 2);
            ctx.fillRect(31, 0, 2, 64);

            if (isAlt) {
                // Светящиеся биолюминесцентные лесные споры
                ctx.fillStyle = '#10b981';
                ctx.fillRect(20, 24, 2, 2);
                ctx.fillRect(44, 46, 2, 2);
                ctx.fillStyle = '#6ee7b7';
                ctx.fillRect(21, 25, 1, 1);
            }
        };
        this.createCanvas('tile_floor_forest', 64, 64, (ctx) => drawForestFloor(ctx, false));
        this.createCanvas('tile_floor_forest_alt', 64, 64, (ctx) => drawForestFloor(ctx, true));

        // Стена леса (непроходимые терновые заросли)
        this.createCanvas('tile_wall_forest', 64, 64, (ctx) => {
            ctx.fillStyle = '#03100b';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#06281b';
            ctx.fillRect(2, 2, 60, 60);
            ctx.fillStyle = '#0a422d';
            ctx.beginPath();
            ctx.arc(20, 20, 16, 0, Math.PI * 2);
            ctx.arc(44, 44, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#10b981';
            ctx.fillRect(18, 18, 4, 4);
            ctx.fillRect(42, 42, 4, 4);
        });

        // === КАРТА 3: ПЫЛАЮЩИЕ НЕДРА (ВУЛКАНИЧЕСКИЙ БАЗАЛЬТ И МАГМА) ===
        const drawInfernoFloor = (ctx, isAlt) => {
            ctx.fillStyle = '#120505';
            ctx.fillRect(0, 0, 64, 64);

            // Базальтовые плиты
            ctx.fillStyle = '#1c0909';
            ctx.fillRect(2, 2, 28, 28);
            ctx.fillStyle = '#180808';
            ctx.fillRect(34, 2, 28, 28);
            ctx.fillStyle = '#190808';
            ctx.fillRect(2, 34, 28, 28);
            ctx.fillStyle = '#220c0c';
            ctx.fillRect(34, 34, 28, 28);

            // Швы со следами лавового жара
            ctx.fillStyle = '#3f0c0c';
            ctx.fillRect(30, 0, 4, 64);
            ctx.fillRect(0, 30, 64, 4);

            if (isAlt) {
                // Тонкая трещина раскаленной магмы
                ctx.fillStyle = '#991b1b';
                ctx.fillRect(14, 12, 18, 2);
                ctx.fillRect(28, 14, 2, 14);
                ctx.fillStyle = '#ea580c';
                ctx.fillRect(16, 12, 14, 1);
                ctx.fillRect(28, 15, 1, 11);
                ctx.fillStyle = '#fef08a';
                ctx.fillRect(22, 12, 4, 1);
            }
        };
        this.createCanvas('tile_floor_inferno', 64, 64, (ctx) => drawInfernoFloor(ctx, false));
        this.createCanvas('tile_floor_inferno_alt', 64, 64, (ctx) => drawInfernoFloor(ctx, true));

        // Стена недр (раскаленный обсидиан)
        this.createCanvas('tile_wall_inferno', 64, 64, (ctx) => {
            ctx.fillStyle = '#0f0303';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#260a0a';
            ctx.fillRect(2, 2, 60, 60);
            ctx.fillStyle = '#450a0a';
            ctx.fillRect(6, 6, 24, 24);
            ctx.fillRect(34, 34, 24, 24);
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(12, 14, 12, 3);
            ctx.fillRect(40, 42, 12, 3);
        });

        // === КАРТА 4: ЛЕДЯНАЯ ПУСТОШЬ (ГЛАЦИАЛЬНЫЙ ЛЁД И КРИСТАЛЛЫ) ===
        const drawFrostFloor = (ctx, isAlt) => {
            ctx.fillStyle = '#06101e';
            ctx.fillRect(0, 0, 64, 64);

            // Ледяные замерзшие плиты
            ctx.fillStyle = '#0c1b30';
            ctx.fillRect(2, 2, 28, 28);
            ctx.fillStyle = '#0e2038';
            ctx.fillRect(34, 2, 28, 28);
            ctx.fillStyle = '#0a172a';
            ctx.fillRect(2, 34, 28, 28);
            ctx.fillStyle = '#102440';
            ctx.fillRect(34, 34, 28, 28);

            // Кристаллические морозные швы
            ctx.fillStyle = '#08172c';
            ctx.fillRect(30, 0, 4, 64);
            ctx.fillRect(0, 30, 64, 4);

            // Морозные узоры
            ctx.fillStyle = '#183459';
            ctx.fillRect(6, 12, 8, 1);
            ctx.fillRect(40, 48, 8, 1);

            if (isAlt) {
                // Морозный кристаллический символ
                ctx.fillStyle = '#0284c7';
                ctx.fillRect(28, 20, 8, 8);
                ctx.fillStyle = '#38bdf8';
                ctx.fillRect(30, 22, 4, 4);
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(31, 23, 2, 2);
            }
        };
        this.createCanvas('tile_floor_frost', 64, 64, (ctx) => drawFrostFloor(ctx, false));
        this.createCanvas('tile_floor_frost_alt', 64, 64, (ctx) => drawFrostFloor(ctx, true));

        // Стена ледника (монолитный вечный лёд)
        this.createCanvas('tile_wall_frost', 64, 64, (ctx) => {
            ctx.fillStyle = '#040d1a';
            ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#0b203c';
            ctx.fillRect(2, 2, 60, 60);
            ctx.fillStyle = '#143865';
            ctx.fillRect(4, 4, 26, 26);
            ctx.fillRect(34, 34, 26, 26);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(6, 6, 22, 2);
            ctx.fillRect(36, 36, 22, 2);
        });
    }

    static createAllObstacleTiles() {
        // --- Препятствия Карты 1 (Замок): Колонна и Факел ---
        this.createCanvas('tile_pillar_castle', 48, 64, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.ellipse(24, 60, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e293b'; ctx.fillRect(4, 48, 40, 12);
            ctx.fillStyle = '#334155'; ctx.fillRect(10, 14, 28, 34);
            ctx.fillStyle = '#1e293b'; ctx.fillRect(4, 6, 40, 10);
            ctx.fillStyle = '#0284c7'; ctx.fillRect(21, 24, 6, 14);
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(22, 26, 4, 10);
        });
        this.createCanvas('tile_pillar', 48, 64, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.ellipse(24, 60, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e293b'; ctx.fillRect(4, 48, 40, 12);
            ctx.fillStyle = '#334155'; ctx.fillRect(10, 14, 28, 34);
            ctx.fillStyle = '#1e293b'; ctx.fillRect(4, 6, 40, 10);
        });

        this.createCanvas('prop_brazier_castle', 36, 48, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.beginPath(); ctx.ellipse(18, 44, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e293b'; ctx.fillRect(14, 22, 8, 22);
            ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.moveTo(6, 20); ctx.lineTo(30, 20); ctx.lineTo(24, 30); ctx.lineTo(12, 30); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(18, 4); ctx.lineTo(28, 20); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(11, 20); ctx.lineTo(18, 8); ctx.lineTo(25, 20); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.moveTo(14, 20); ctx.lineTo(18, 12); ctx.lineTo(22, 20); ctx.closePath(); ctx.fill();
        });
        this.createCanvas('prop_brazier', 36, 48, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.beginPath(); ctx.ellipse(18, 44, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e293b'; ctx.fillRect(14, 22, 8, 22);
            ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.moveTo(8, 20); ctx.lineTo(18, 4); ctx.lineTo(28, 20); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.moveTo(11, 20); ctx.lineTo(18, 8); ctx.lineTo(25, 20); ctx.closePath(); ctx.fill();
        });

        // --- Препятствия Карты 2 (Лес): Древнее Дерево и Грибы ---
        this.createCanvas('tile_tree_forest', 48, 64, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.ellipse(24, 60, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#451a03'; ctx.fillRect(16, 20, 16, 38);
            ctx.fillStyle = '#064e3b';
            ctx.beginPath(); ctx.arc(24, 20, 22, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#059669';
            ctx.beginPath(); ctx.arc(24, 16, 16, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#34d399';
            ctx.beginPath(); ctx.arc(20, 12, 6, 0, Math.PI * 2); ctx.fill();
        });

        this.createCanvas('prop_mushrooms_forest', 36, 48, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath(); ctx.ellipse(18, 44, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#047857'; ctx.fillRect(10, 28, 4, 14); ctx.fillRect(22, 24, 5, 18);
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(12, 28, 10, Math.PI, 0); ctx.fill();
            ctx.beginPath(); ctx.arc(24, 24, 12, Math.PI, 0); ctx.fill();
            ctx.fillStyle = '#a7f3d0';
            ctx.fillRect(10, 22, 3, 3); ctx.fillRect(22, 17, 4, 4);
        });

        // --- Препятствия Карты 3 (Недра): Базальтовый пилон и Гейзер магмы ---
        this.createCanvas('tile_pillar_inferno', 48, 64, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.ellipse(24, 60, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1f0707'; ctx.fillRect(6, 10, 36, 48);
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(10, 14, 28, 40);
            ctx.fillStyle = '#dc2626'; ctx.fillRect(20, 16, 8, 36);
            ctx.fillStyle = '#f97316'; ctx.fillRect(22, 20, 4, 28);
            ctx.fillStyle = '#fef08a'; ctx.fillRect(23, 24, 2, 16);
        });

        this.createCanvas('prop_magma_inferno', 36, 48, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.beginPath(); ctx.ellipse(18, 44, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#450a0a';
            ctx.beginPath(); ctx.arc(18, 36, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#dc2626';
            ctx.beginPath(); ctx.arc(18, 36, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f97316';
            ctx.beginPath(); ctx.arc(18, 36, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.beginPath(); ctx.arc(18, 36, 3, 0, Math.PI * 2); ctx.fill();
        });

        // --- Препятствия Карты 4 (Пустошь): Ледяной монолит и Кристалл ---
        this.createCanvas('tile_pillar_frost', 48, 64, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.beginPath(); ctx.ellipse(24, 60, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0c223d'; ctx.fillRect(8, 12, 32, 46);
            ctx.fillStyle = '#0369a1'; ctx.fillRect(12, 14, 24, 42);
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(16, 16, 16, 38);
            ctx.fillStyle = '#e0f2fe'; ctx.fillRect(20, 20, 8, 30);
        });

        this.createCanvas('prop_crystal_frost', 36, 48, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.beginPath(); ctx.ellipse(18, 44, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0284c7';
            ctx.beginPath(); ctx.moveTo(18, 6); ctx.lineTo(28, 40); ctx.lineTo(8, 40); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.moveTo(18, 6); ctx.lineTo(24, 40); ctx.lineTo(12, 40); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.moveTo(18, 6); ctx.lineTo(20, 40); ctx.lineTo(16, 40); ctx.closePath(); ctx.fill();
        });
    }

    // --- ПРЕВЬЮ КАРТ ДЛЯ МЕНЮ ВЫБОРА ---
    static createMapPreviews() {
        // Карта 1: Тёмный Замок
        this.createCanvas('map_dark_castle', 160, 100, (ctx, w, h) => {
            ctx.fillStyle = '#0b0f19'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#1e293b'; ctx.fillRect(4, 4, w - 8, h - 8);
            ctx.fillStyle = '#334155';
            ctx.fillRect(10, 10, w - 20, 2); ctx.fillRect(10, 50, w - 20, 2);
            ctx.fillRect(50, 10, 2, 40); ctx.fillRect(110, 10, 2, 40);
            ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(w / 2, 40, 14, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(w / 2, 38, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(w / 2, 36, 3, 0, Math.PI * 2); ctx.fill();
        });

        // Карта 2: Проклятый Лес
        this.createCanvas('map_cursed_forest', 160, 100, (ctx, w, h) => {
            ctx.fillStyle = '#041a12'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#062c1e'; ctx.fillRect(4, 4, w - 8, h - 8);
            ctx.fillStyle = '#14532d';
            ctx.beginPath(); ctx.arc(35, 45, 20, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(125, 40, 22, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#10b981';
            ctx.beginPath(); ctx.arc(80, 55, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(95, 62, 4, 0, Math.PI * 2); ctx.fill();
        });

        // Карта 3: Пылающие Недра
        this.createCanvas('map_infernal_abyss', 160, 100, (ctx, w, h) => {
            ctx.fillStyle = '#180a0a'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#2b0f0f'; ctx.fillRect(4, 4, w - 8, h - 8);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(10, 80); ctx.bezierCurveTo(60, 40, 100, 60, 150, 20); ctx.lineTo(150, 40); ctx.bezierCurveTo(100, 80, 60, 60, 10, 100); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.moveTo(15, 85); ctx.bezierCurveTo(60, 45, 100, 65, 145, 25); ctx.lineTo(145, 33); ctx.bezierCurveTo(100, 73, 60, 53, 15, 93); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(80, 55, 5, 0, Math.PI * 2); ctx.fill();
        });

        // Карта 4: Ледяная Пустошь
        this.createCanvas('map_frozen_citadel', 160, 100, (ctx, w, h) => {
            ctx.fillStyle = '#081324'; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#0d223f'; ctx.fillRect(4, 4, w - 8, h - 8);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.moveTo(40, 70); ctx.lineTo(50, 25); ctx.lineTo(60, 70); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(100, 75); ctx.lineTo(112, 20); ctx.lineTo(124, 75); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#e0f2fe';
            ctx.beginPath(); ctx.moveTo(70, 72); ctx.lineTo(80, 35); ctx.lineTo(90, 72); ctx.closePath(); ctx.fill();
        });
    }

    // --- HEROES (ВЫСОКОДЕТАЛИЗИРОВАННЫЙ АУТЕНТИЧНЫЙ ПИКСЕЛЬ-АРТ 36x36 + КАДРЫ ХОДЬБЫ) ---
    static createHeroShadow() {
        this.createCanvas('hero_shadow', 32, 14, (ctx) => {
            ctx.clearRect(0, 0, 32, 14);
            const grad = ctx.createRadialGradient(16, 7, 2, 16, 7, 14);
            grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
            grad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(16, 7, 15, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    static createKnight() {
        const drawKnight = (ctx, frame = 0) => {
            ctx.clearRect(0, 0, 36, 36);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            const legOffset = (frame === 1) ? 1 : ((frame === 2) ? -1 : 0);
            const armOffset = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);
            const capeWave = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);

            // 1. СЛОЙ 1: Развевающийся алый плащ за спиной
            p(5 + capeWave, 16, '#450a0a', 5, 16);
            p(4 + capeWave, 18, '#7f1d1d', 6, 14);
            p(3 + capeWave, 21, '#991b1b', 7, 10);
            p(4 + capeWave, 20, '#dc2626', 4, 10);
            p(5 + capeWave, 22, '#ef4444', 2, 7);

            // 2. СЛОЙ 2: Королевский щит (Левая рука)
            const shY = 16 + armOffset;
            p(2, shY, '#090d16', 7, 12);       // Внешний темный контур
            p(3, shY + 1, '#d97706', 5, 10);   // Золотой обод
            p(4, shY + 2, '#f59e0b', 3, 8);    // Светлое золото
            p(4, shY + 3, '#1e3a8a', 3, 6);    // Королевский синий фон
            p(4, shY + 4, '#0284c7', 3, 4);    // Лазурный отблеск
            p(5, shY + 5, '#ffffff', 1, 2);    // Белый гербовый крест

            // 3. СЛОЙ 3: Плюмаж и алое перо на шлеме
            p(17, 1, '#dc2626', 3, 4);
            p(16, 2, '#ef4444', 4, 3);
            p(18, 0, '#f87171', 2, 3);
            p(16, 4, '#d97706', 5, 2);
            p(17, 4, '#fef08a', 3, 1);

            // 4. СЛОЙ 4: Шлем крестоносца (Стальной купол и забрало)
            p(13, 5, '#090d16', 11, 11);       // Контур головы
            p(14, 6, '#334155', 9, 9);         // Глубокая тень стали
            p(15, 6, '#64748b', 7, 8);         // Базовая полированная сталь
            p(15, 6, '#cbd5e1', 3, 4);         // Блик света на куполе
            p(16, 6, '#ffffff', 1, 3);         // Точка максимального блеска

            // Забрало с Т-образной прорезью и сиянием глаз
            p(14, 10, '#020617', 9, 3);        // Прорезь забрала
            p(16, 11, '#00f5d4', 2, 1);        // Бирюзовые светящиеся глаза
            p(20, 11, '#00f5d4', 2, 1);
            p(17, 11, '#ffffff', 1, 1);        // Блик в глазах
            p(21, 11, '#ffffff', 1, 1);
            p(16, 13, '#020617', 5, 2);        // Вертикальная вентиляция забрала

            // 5. СЛОЙ 5: Золотые наплечники с рубинами
            p(9, 15, '#090d16', 5, 5);         // Левый наплечник
            p(10, 16, '#d97706', 4, 4);
            p(10, 16, '#f59e0b', 3, 3);
            p(11, 16, '#fef08a', 1, 1);

            p(23, 15, '#090d16', 5, 5);        // Правый наплечник
            p(23, 16, '#d97706', 4, 4);
            p(24, 16, '#f59e0b', 3, 3);
            p(25, 16, '#fef08a', 1, 1);

            // 6. СЛОЙ 6: Кираса, нагрудник и золотой крест
            p(12, 16, '#090d16', 13, 10);      // Контур торса
            p(13, 16, '#475569', 11, 9);       // Сталь кирасы
            p(14, 17, '#94a3b8', 9, 7);
            p(14, 17, '#cbd5e1', 3, 6);        // Блик на ребре кирасы

            // Золотой рыцарский крест на груди
            p(17, 16, '#d97706', 3, 8);
            p(14, 18, '#d97706', 9, 3);
            p(18, 17, '#f59e0b', 1, 6);
            p(15, 19, '#f59e0b', 7, 1);
            p(18, 18, '#fef08a', 1, 2);        // Центр креста

            // Ремень с золотой пряжкой
            p(12, 25, '#78350f', 13, 3);
            p(17, 25, '#f59e0b', 3, 3);
            p(18, 26, '#fef08a', 1, 1);

            // 7. СЛОЙ 7: Рунический меч света (Правая рука)
            const swY = 2 + armOffset;
            p(28, swY + 18, '#78350f', 2, 4);  // Кожаная рукоять
            p(28, swY + 22, '#f59e0b', 2, 2);  // Золотое навершие
            p(25, swY + 17, '#090d16', 8, 2);  // Контур гарды
            p(26, swY + 17, '#f59e0b', 6, 2);  // Золотая гарда
            p(28, swY + 16, '#fef08a', 2, 1);

            // Клинок меча с руническим свечением
            p(28, swY, '#090d16', 2, 17);      // Контур клинка
            p(28, swY + 1, '#cbd5e1', 2, 15);  // Стальное полотно
            p(29, swY + 1, '#ffffff', 1, 15);  // Острая грань / блеск
            p(28, swY + 4, '#38bdf8', 1, 10);  // Руническая гравировка
            p(28, swY + 6, '#00f5d4', 1, 5);   // Неоновое ядро руны

            // 8. СЛОЙ 8: Поножи и сабатоны (Ноги)
            const leftLegY = 27 + legOffset;
            const rightLegY = 27 - legOffset;

            // Левая нога
            p(13, leftLegY, '#090d16', 4, 7);
            p(14, leftLegY, '#475569', 3, 5);
            p(14, leftLegY, '#cbd5e1', 1, 4);
            p(12, leftLegY + 5, '#1e293b', 5, 3); // Сабатон
            p(13, leftLegY + 6, '#94a3b8', 4, 1);

            // Правая нога
            p(19, rightLegY, '#090d16', 4, 7);
            p(20, rightLegY, '#475569', 3, 5);
            p(20, rightLegY, '#cbd5e1', 1, 4);
            p(19, rightLegY + 5, '#1e293b', 5, 3);
            p(20, rightLegY + 6, '#94a3b8', 4, 1);
        };

        this.createCanvas('hero_knight', 36, 36, (ctx) => drawKnight(ctx, 0));
        this.createCanvas('hero_knight_walk_0', 36, 36, (ctx) => drawKnight(ctx, 1));
        this.createCanvas('hero_knight_walk_1', 36, 36, (ctx) => drawKnight(ctx, 2));
    }

    static createArcher() {
        const drawArcher = (ctx, frame = 0) => {
            ctx.clearRect(0, 0, 36, 36);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            const legOffset = (frame === 1) ? 1 : ((frame === 2) ? -1 : 0);
            const armOffset = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);
            const capeWave = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);

            // 1. Колчан и золотые стрелы за плечом
            p(7, 5, '#090d16', 6, 16);
            p(8, 6, '#78350f', 4, 14);
            p(9, 7, '#b45309', 2, 12);
            p(7, 2, '#d97706', 2, 4);          // Перья стрелы 1
            p(9, 0, '#f59e0b', 2, 5);          // Перья стрелы 2
            p(11, 2, '#fef08a', 2, 4);         // Перья стрелы 3
            p(10, 1, '#ffffff', 1, 2);

            // Изумрудный плащ за спиной
            p(6 + capeWave, 17, '#064e3b', 5, 14);
            p(7 + capeWave, 19, '#059669', 4, 11);
            p(8 + capeWave, 21, '#10b981', 2, 8);

            // 2. Изумрудный капюшон следопыта
            p(13, 3, '#090d16', 11, 11);
            p(14, 4, '#064e3b', 9, 9);
            p(15, 4, '#059669', 7, 7);
            p(16, 4, '#10b981', 3, 3);
            p(18, 1, '#d97706', 3, 4);          // Золотое перо в капюшоне
            p(19, 0, '#fef08a', 2, 3);
            p(20, 0, '#ffffff', 1, 1);

            // Лицо эльфа
            p(14, 10, '#fde68a', 8, 4);
            p(13, 10, '#f59e0b', 1, 3);
            
            // Светящиеся изумрудные глаза
            p(15, 11, '#059669', 2, 2);
            p(19, 11, '#059669', 2, 2);
            p(15, 11, '#22c55e', 2, 1);
            p(19, 11, '#22c55e', 2, 1);
            p(16, 11, '#ffffff', 1, 1);
            p(20, 11, '#ffffff', 1, 1);

            // 3. Охотничий кожаный колет и ремень
            p(12, 15, '#090d16', 13, 10);
            p(13, 15, '#064e3b', 11, 9);
            p(14, 16, '#047857', 9, 7);
            p(15, 17, '#10b981', 4, 5);

            // Перевязь колчана через грудь с золотой пряжкой
            p(13, 16, '#78350f', 2, 2);
            p(15, 18, '#78350f', 2, 2);
            p(17, 20, '#78350f', 2, 2);
            p(19, 22, '#78350f', 2, 2);
            p(16, 19, '#f59e0b', 2, 2);
            p(16, 19, '#fef08a', 1, 1);

            // Пояс следопыта
            p(12, 24, '#78350f', 13, 3);
            p(17, 24, '#f59e0b', 3, 3);

            // 4. Изогнутый золотой композитный лук (Правая рука)
            const bowY = 5 + armOffset;
            p(29, bowY, '#090d16', 3, 2);
            p(28, bowY + 2, '#d97706', 2, 4);
            p(27, bowY + 6, '#f59e0b', 2, 8);
            p(28, bowY + 14, '#d97706', 2, 4);
            p(29, bowY + 18, '#090d16', 3, 2);
            p(28, bowY + 7, '#fef08a', 1, 6);    // Золотая гравировка

            // Тетива и наложенная магическая стрела
            p(30, bowY + 1, '#38bdf8', 1, 18);
            p(21, bowY + 10, '#ffffff', 10, 1);
            p(31, bowY + 9, '#f59e0b', 2, 3);   // Оперение
            p(20, bowY + 9, '#00f5d4', 3, 3);   // Магический наконечник
            p(19, bowY + 10, '#ffffff', 2, 1);

            // 5. Ноги и кожаные сапоги
            const leftLegY = 27 + legOffset;
            const rightLegY = 27 - legOffset;

            p(13, leftLegY, '#090d16', 4, 7);
            p(14, leftLegY, '#064e3b', 3, 4);
            p(13, leftLegY + 4, '#78350f', 4, 4);
            p(14, leftLegY + 4, '#b45309', 3, 1);

            p(19, rightLegY, '#090d16', 4, 7);
            p(20, rightLegY, '#064e3b', 3, 4);
            p(19, rightLegY + 4, '#78350f', 4, 4);
            p(20, rightLegY + 4, '#b45309', 3, 1);
        };

        this.createCanvas('hero_archer', 36, 36, (ctx) => drawArcher(ctx, 0));
        this.createCanvas('hero_archer_walk_0', 36, 36, (ctx) => drawArcher(ctx, 1));
        this.createCanvas('hero_archer_walk_1', 36, 36, (ctx) => drawArcher(ctx, 2));
    }

    static createMage() {
        const drawMage = (ctx, frame = 0) => {
            ctx.clearRect(0, 0, 36, 36);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            const floatY = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);
            const hemWave = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);

            // 1. Остроконечная шляпа архимага
            p(17, 0 + floatY, '#3b0764', 3, 3);
            p(16, 3 + floatY, '#581c87', 5, 3);
            p(15, 6 + floatY, '#6b21a8', 7, 3);
            p(14, 9 + floatY, '#7c3aed', 9, 3);
            p(10, 11 + floatY, '#090d16', 17, 4);  // Поля шляпы
            p(11, 12 + floatY, '#3b0764', 15, 2);

            // Золотая лента с пылающим рубином
            p(13, 9 + floatY, '#d97706', 11, 2);
            p(14, 9 + floatY, '#f59e0b', 9, 1);
            p(17, 8 + floatY, '#ef4444', 3, 3);
            p(18, 8 + floatY, '#fca5a5', 1, 1);

            // 2. Лицо, горящие глаза и седая борода
            p(14, 13 + floatY, '#fed7aa', 9, 3);
            p(15, 13 + floatY, '#00f5d4', 2, 2); // Сапфировые глаза
            p(20, 13 + floatY, '#00f5d4', 2, 2);
            p(16, 13 + floatY, '#ffffff', 1, 1);
            p(21, 13 + floatY, '#ffffff', 1, 1);

            // Длинная борода мудреца
            p(13, 15 + floatY, '#090d16', 11, 12);
            p(14, 15 + floatY, '#f8fafc', 9, 5);
            p(15, 20 + floatY, '#e2e8f0', 7, 4);
            p(16, 24 + floatY, '#cbd5e1', 5, 3);
            p(17, 27 + floatY, '#94a3b8', 3, 2);

            // 3. Аметистово-алая мантия архимага
            p(11, 16 + floatY, '#090d16', 15, 16);
            p(12, 16 + floatY, '#2e1065', 13, 15);
            p(13, 17 + floatY, '#4c1d95', 11, 13);
            p(14, 18 + floatY, '#be123c', 4, 11);
            p(20, 18 + floatY, '#be123c', 4, 11);
            p(15, 19 + floatY, '#dc2626', 2, 9);
            p(21, 19 + floatY, '#dc2626', 2, 9);

            // 4. Огненный посох (Правая рука)
            p(29, 6 + floatY, '#090d16', 2, 26);
            p(29, 7 + floatY, '#78350f', 2, 24);
            p(28, 5 + floatY, '#f59e0b', 4, 3);
            p(27, 3 + floatY, '#d97706', 6, 2);

            // Пылающая плазменная сфера
            p(26, 0 + floatY, '#991b1b', 8, 8);
            p(27, 1 + floatY, '#ea580c', 6, 6);
            p(28, 2 + floatY, '#facc15', 4, 4);
            p(29, 3 + floatY, '#ffffff', 2, 2);

            // Парящие искры пламени
            p(25, 2 + floatY, '#f97316', 1, 1);
            p(34, 1 + floatY, '#fde047', 1, 1);
            p(30, -1 + floatY, '#ef4444', 1, 1);
            p(35, 4 + floatY, '#fb923c', 1, 1);

            // 5. Подол мантии (Парение над землей)
            p(10 + hemWave, 31 + floatY, '#090d16', 17, 3);
            p(11 + hemWave, 31 + floatY, '#1e1b4b', 15, 2);
            p(13 + hemWave, 32 + floatY, '#7c3aed', 11, 1);
        };

        this.createCanvas('hero_mage', 36, 36, (ctx) => drawMage(ctx, 0));
        this.createCanvas('hero_mage_walk_0', 36, 36, (ctx) => drawMage(ctx, 1));
        this.createCanvas('hero_mage_walk_1', 36, 36, (ctx) => drawMage(ctx, 2));
    }

    static createNinja() {
        const drawNinja = (ctx, frame = 0) => {
            ctx.clearRect(0, 0, 36, 36);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            const legOffset = (frame === 1) ? 1 : ((frame === 2) ? -1 : 0);
            const armOffset = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);
            const ribbonWave = (frame === 1) ? -2 : ((frame === 2) ? 2 : 0);

            // 1. Развевающаяся алая лента повязки за спиной
            p(4 + ribbonWave, 8, '#9f1239', 7, 2);
            p(2 + ribbonWave, 10, '#be123c', 7, 2);
            p(0 + ribbonWave, 12, '#e11d48', 5, 2);
            p(1 + ribbonWave, 14, '#f43f5e', 3, 2);

            // Парные катаны за спиной
            p(8, 2, '#090d16', 2, 17);
            p(8, 3, '#cbd5e1', 1, 14);
            p(7, 16, '#be123c', 3, 2);        // Красная рукоять 1

            p(26, 2, '#090d16', 2, 17);
            p(27, 3, '#cbd5e1', 1, 14);
            p(26, 16, '#be123c', 3, 2);       // Красная рукоять 2

            // 2. Маска и капюшон шиноби
            p(13, 4, '#090d16', 11, 10);
            p(14, 5, '#1e293b', 9, 8);
            p(15, 5, '#334155', 7, 4);

            // Алая повязка на лоб с металлическим протектором
            p(12, 7, '#e11d48', 13, 3);
            p(16, 7, '#cbd5e1', 5, 2);
            p(18, 7, '#ffffff', 1, 1);

            // Неоновые бирюзовые глаза
            p(15, 10, '#00f5d4', 2, 2);
            p(20, 10, '#00f5d4', 2, 2);
            p(16, 10, '#ffffff', 1, 1);
            p(21, 10, '#ffffff', 1, 1);

            // 3. Теневой доспех шиноби
            p(12, 15, '#090d16', 13, 10);
            p(13, 15, '#1e293b', 11, 9);
            p(14, 16, '#334155', 9, 7);

            // Серебряная эмблема клана на груди
            p(17, 16, '#cbd5e1', 3, 5);
            p(15, 18, '#cbd5e1', 7, 2);
            p(18, 18, '#ffffff', 1, 1);

            // Алый пояс оби
            p(12, 24, '#be123c', 13, 3);
            p(17, 24, '#e11d48', 3, 3);

            // 4. Огромный хромированный сюрикен в руке (Правая рука)
            const shY = 16 + armOffset;
            p(28, shY, '#090d16', 8, 8);
            p(29, shY + 1, '#cbd5e1', 6, 6);
            p(31, shY - 2, '#cbd5e1', 2, 12);
            p(27, shY + 2, '#cbd5e1', 10, 2);
            p(31, shY + 2, '#00f5d4', 2, 2);   // Неоновое ядро сюрикена
            p(31, shY + 2, '#ffffff', 1, 1);

            // 5. Поножи и таби (Ноги)
            const leftLegY = 27 + legOffset;
            const rightLegY = 27 - legOffset;

            p(13, leftLegY, '#090d16', 4, 7);
            p(14, leftLegY, '#1e293b', 3, 5);
            p(12, leftLegY + 5, '#090d16', 5, 3);

            p(19, rightLegY, '#090d16', 4, 7);
            p(20, rightLegY, '#1e293b', 3, 5);
            p(19, rightLegY + 5, '#090d16', 5, 3);
        };

        this.createCanvas('hero_ninja', 36, 36, (ctx) => drawNinja(ctx, 0));
        this.createCanvas('hero_ninja_walk_0', 36, 36, (ctx) => drawNinja(ctx, 1));
        this.createCanvas('hero_ninja_walk_1', 36, 36, (ctx) => drawNinja(ctx, 2));
    }

    static createNecromancer() {
        const drawNecro = (ctx, frame = 0) => {
            ctx.clearRect(0, 0, 36, 36);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            const floatY = (frame === 1) ? -1 : ((frame === 2) ? 1 : 0);
            const wispWave = (frame === 1) ? 2 : ((frame === 2) ? -2 : 0);

            // 1. Парящие изумрудные души и призрачные огни
            p(4 + wispWave, 12 + floatY, '#10b981', 3, 3);
            p(5 + wispWave, 11 + floatY, '#6ee7b7', 2, 2);
            p(5 + wispWave, 12 + floatY, '#ffffff', 1, 1);

            p(30 - wispWave, 21 + floatY, '#059669', 3, 3);
            p(31 - wispWave, 20 + floatY, '#34d399', 2, 2);
            p(31 - wispWave, 21 + floatY, '#a7f3d0', 1, 1);

            // 2. Капюшон темного культа
            p(13, 3 + floatY, '#090d16', 11, 11);
            p(14, 4 + floatY, '#180828', 9, 9);
            p(15, 4 + floatY, '#2e1065', 7, 7);
            p(16, 4 + floatY, '#4c1d95', 4, 3);

            // Костяная маска-череп
            p(14, 8 + floatY, '#f8fafc', 9, 8);
            p(15, 14 + floatY, '#cbd5e1', 7, 3);

            // Глазницы со светящимся токсичным зеленым пламенем
            p(15, 10 + floatY, '#020617', 2, 2);
            p(20, 10 + floatY, '#020617', 2, 2);
            p(15, 10 + floatY, '#10b981', 2, 1);
            p(20, 10 + floatY, '#10b981', 2, 1);
            p(16, 10 + floatY, '#a7f3d0', 1, 1);
            p(21, 10 + floatY, '#a7f3d0', 1, 1);

            // 3. Рваная мантия лича и костяной амулет-ребра
            p(11, 16 + floatY, '#090d16', 15, 15);
            p(12, 16 + floatY, '#180828', 13, 14);
            p(13, 17 + floatY, '#2e1065', 11, 12);
            p(14, 18 + floatY, '#3b0764', 9, 10);

            // Ребра-амулет
            p(15, 17 + floatY, '#cbd5e1', 7, 1);
            p(14, 19 + floatY, '#cbd5e1', 9, 1);
            p(15, 21 + floatY, '#cbd5e1', 7, 1);
            p(17, 18 + floatY, '#10b981', 3, 3); // Магический изумруд души
            p(18, 19 + floatY, '#ffffff', 1, 1);

            // 4. Древняя костяная коса душ (Правая рука)
            p(29, 5 + floatY, '#090d16', 2, 28);
            p(29, 6 + floatY, '#475569', 2, 26);
            p(28, 3 + floatY, '#cbd5e1', 4, 4);

            // Массивное костяное изогнутое лезвие косы
            p(29, 0 + floatY, '#090d16', 7, 4);
            p(29, 1 + floatY, '#f8fafc', 7, 3);
            p(32, 3 + floatY, '#34d399', 4, 3);
            p(34, 6 + floatY, '#10b981', 2, 4);
            p(35, 9 + floatY, '#059669', 1, 3);
            p(30, 2 + floatY, '#ffffff', 4, 1);   // Заточка косы

            // 5. Призрачный рваный подол (Парение в воздухе)
            p(10, 30 + floatY, '#090314', 5, 4);
            p(16, 29 + floatY, '#090314', 6, 5);
            p(22, 30 + floatY, '#090314', 5, 4);
            p(12, 32 + floatY, '#10b981', 3, 2);
            p(19, 32 + floatY, '#10b981', 3, 2);
        };

        this.createCanvas('hero_necromancer', 36, 36, (ctx) => drawNecro(ctx, 0));
        this.createCanvas('hero_necromancer_walk_0', 36, 36, (ctx) => drawNecro(ctx, 1));
        this.createCanvas('hero_necromancer_walk_1', 36, 36, (ctx) => drawNecro(ctx, 2));

        // Алиасы для обратной совместимости
        this.createCanvas('hero_necro', 36, 36, (ctx) => drawNecro(ctx, 0));
        this.createCanvas('hero_necro_walk_0', 36, 36, (ctx) => drawNecro(ctx, 1));
        this.createCanvas('hero_necro_walk_1', 36, 36, (ctx) => drawNecro(ctx, 2));
    }

    // --- ВСЕ МОНСТРЫ ДЛЯ 4 ЛОКАЦИЙ ---
    static createAllEnemies() {
        // 1. Слизень
        this.createCanvas('enemy_slime', 28, 28, (ctx) => {
            ctx.fillStyle = '#55a630'; ctx.beginPath(); ctx.arc(14, 14, 12, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.fillRect(9, 10, 4, 4); ctx.fillRect(17, 10, 4, 4);
            ctx.fillStyle = '#000000'; ctx.fillRect(11, 11, 2, 2); ctx.fillRect(19, 11, 2, 2);
            ctx.fillStyle = '#aacc00'; ctx.fillRect(10, 5, 5, 3);
        });

        // 2. Летучая мышь
        this.createCanvas('enemy_bat', 24, 24, (ctx) => {
            ctx.fillStyle = '#7b2cbf';
            ctx.beginPath(); ctx.moveTo(12, 12); ctx.lineTo(2, 4); ctx.lineTo(6, 16); ctx.lineTo(12, 14); ctx.lineTo(18, 16); ctx.lineTo(22, 4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#3c096c'; ctx.fillRect(10, 8, 4, 8);
            ctx.fillStyle = '#ff0054'; ctx.fillRect(10, 9, 1, 1); ctx.fillRect(13, 9, 1, 1);
        });

        // 3. Скелет
        this.createCanvas('enemy_skeleton', 32, 32, (ctx) => {
            ctx.fillStyle = '#e0e1dd'; ctx.fillRect(11, 4, 10, 9);
            ctx.fillStyle = '#1b263b'; ctx.fillRect(13, 7, 2, 3); ctx.fillRect(17, 7, 2, 3);
            ctx.fillStyle = '#778da9'; ctx.fillRect(14, 13, 4, 12); ctx.fillRect(10, 15, 12, 2); ctx.fillRect(11, 19, 10, 2);
            ctx.fillStyle = '#9a8c98'; ctx.fillRect(24, 10, 3, 16);
        });

        // 4. Череп-камикадзе
        this.createCanvas('enemy_skull', 26, 26, (ctx) => {
            ctx.fillStyle = '#ff0054'; ctx.beginPath(); ctx.arc(13, 13, 11, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffb703'; ctx.fillRect(6, 2, 4, 4); ctx.fillRect(16, 2, 4, 4);
            ctx.fillStyle = '#03071e'; ctx.fillRect(8, 10, 3, 4); ctx.fillRect(15, 10, 3, 4); ctx.fillRect(10, 18, 6, 2);
        });

        // 5. Темный Маг
        this.createCanvas('enemy_necro_mage', 34, 34, (ctx) => {
            ctx.fillStyle = '#480ca8'; ctx.fillRect(10, 6, 14, 22);
            ctx.fillStyle = '#f72585'; ctx.fillRect(12, 10, 10, 3);
            ctx.fillStyle = '#00f5d4'; ctx.beginPath(); ctx.arc(26, 16, 5, 0, Math.PI*2); ctx.fill();
        });

        // 6. Орк
        this.createCanvas('enemy_orc', 40, 40, (ctx) => {
            ctx.fillStyle = '#2d6a4f'; ctx.fillRect(10, 8, 20, 24);
            ctx.fillStyle = '#6c757d'; ctx.fillRect(6, 8, 8, 8); ctx.fillStyle = '#f8f9fa'; ctx.fillRect(4, 6, 4, 4);
            ctx.fillStyle = '#d8f3dc'; ctx.fillRect(14, 18, 3, 4); ctx.fillRect(23, 18, 3, 4);
            ctx.fillStyle = '#ff0054'; ctx.fillRect(15, 13, 3, 2); ctx.fillRect(22, 13, 3, 2);
        });

        // 7. Призрак
        this.createCanvas('enemy_ghost', 30, 30, (ctx) => {
            ctx.fillStyle = 'rgba(76, 201, 240, 0.75)';
            ctx.beginPath(); ctx.arc(15, 12, 12, Math.PI, 0); ctx.lineTo(27, 26); ctx.lineTo(21, 20); ctx.lineTo(15, 26); ctx.lineTo(9, 20); ctx.lineTo(3, 26); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#03045e'; ctx.fillRect(10, 10, 3, 4); ctx.fillRect(17, 10, 3, 4);
        });

        // 8. Огненный Элементаль
        this.createCanvas('enemy_fire_elem', 36, 36, (ctx) => {
            ctx.fillStyle = '#f77f00'; ctx.beginPath(); ctx.arc(18, 18, 14, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fcbf49'; ctx.beginPath(); ctx.arc(18, 18, 8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#d62828'; ctx.fillRect(12, 14, 3, 3); ctx.fillRect(21, 14, 3, 3);
        });

        // --- МОНСТРЫ КАРТЫ 2: ПРОКЛЯТЫЙ ЛЕС ---
        // 9. Ядовитый Паук (Spider)
        this.createCanvas('enemy_spider', 28, 28, (ctx) => {
            ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(14, 14, 8, 0, Math.PI*2); ctx.fill();
            // Лапы
            ctx.strokeStyle = '#166534'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(8, 10); ctx.lineTo(2, 6); ctx.moveTo(8, 14); ctx.lineTo(1, 14); ctx.moveTo(8, 18); ctx.lineTo(2, 22);
            ctx.moveTo(20, 10); ctx.lineTo(26, 6); ctx.moveTo(20, 14); ctx.lineTo(27, 14); ctx.moveTo(20, 18); ctx.lineTo(26, 22);
            ctx.stroke();
            // Ядовитые глаза
            ctx.fillStyle = '#22c55e'; ctx.fillRect(11, 10, 2, 2); ctx.fillRect(15, 10, 2, 2);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(12, 14, 4, 2);
        });

        // 10. Теневой Волк (Wolf)
        this.createCanvas('enemy_wolf', 32, 32, (ctx) => {
            ctx.fillStyle = '#1e293b'; ctx.fillRect(8, 12, 18, 14);
            // Морда и уши
            ctx.fillStyle = '#0f172a'; ctx.fillRect(4, 10, 8, 8); ctx.fillRect(4, 4, 3, 6); ctx.fillRect(8, 4, 3, 6);
            // Глаза
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(5, 11, 2, 2);
            // Хвост
            ctx.fillStyle = '#334155'; ctx.fillRect(26, 12, 4, 6);
        });

        // 11. Проклятый Энт (Treant)
        this.createCanvas('enemy_treant', 44, 44, (ctx) => {
            ctx.fillStyle = '#451a03'; ctx.fillRect(12, 8, 20, 28);
            ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(22, 12, 12, 0, Math.PI*2); ctx.fill();
            // Светящиеся глазницы в коре
            ctx.fillStyle = '#22c55e'; ctx.fillRect(16, 18, 4, 4); ctx.fillRect(24, 18, 4, 4);
            ctx.fillStyle = '#78350f'; ctx.fillRect(6, 14, 6, 16); ctx.fillRect(32, 14, 6, 16);
        });

        // 12. Лесная Ведьма (Witch)
        this.createCanvas('enemy_witch', 34, 34, (ctx) => {
            ctx.fillStyle = '#064e3b'; ctx.fillRect(10, 10, 14, 20);
            // Остроконечная шляпа
            ctx.fillStyle = '#042f2e'; ctx.beginPath(); ctx.moveTo(6, 12); ctx.lineTo(28, 12); ctx.lineTo(17, 2); ctx.closePath(); ctx.fill();
            // Зеленый посох
            ctx.fillStyle = '#78350f'; ctx.fillRect(26, 6, 3, 24);
            ctx.fillStyle = '#84cc16'; ctx.beginPath(); ctx.arc(27, 6, 5, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#a3e635'; ctx.fillRect(13, 14, 3, 2); ctx.fillRect(18, 14, 3, 2);
        });

        // --- МОНСТРЫ КАРТЫ 3: ПЫЛАЮЩИЕ НЕДРА ---
        // 13. Огненный Бес (Imp)
        this.createCanvas('enemy_imp', 28, 28, (ctx) => {
            ctx.fillStyle = '#dc2626'; ctx.fillRect(8, 8, 12, 14);
            // Рожки и крылья
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(8, 3, 3, 5); ctx.fillRect(17, 3, 3, 5);
            ctx.fillStyle = '#991b1b'; ctx.fillRect(2, 8, 6, 8); ctx.fillRect(20, 8, 6, 8);
            // Желтые глаза и огонь в руке
            ctx.fillStyle = '#facc15'; ctx.fillRect(10, 10, 2, 2); ctx.fillRect(16, 10, 2, 2);
            ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(22, 18, 4, 0, Math.PI*2); ctx.fill();
        });

        // 14. Адская Гончая (Hellhound)
        this.createCanvas('enemy_hellhound', 34, 34, (ctx) => {
            ctx.fillStyle = '#450a0a'; ctx.fillRect(8, 12, 20, 14);
            // Огненная грива
            ctx.fillStyle = '#ea580c'; ctx.fillRect(6, 6, 12, 8); ctx.fillRect(16, 8, 6, 6);
            ctx.fillStyle = '#facc15'; ctx.fillRect(8, 10, 3, 2);
            // Клыки
            ctx.fillStyle = '#fef08a'; ctx.fillRect(4, 16, 3, 3);
        });

        // 15. Магматический Голем (Lava Golem)
        this.createCanvas('enemy_lavagolem', 46, 46, (ctx) => {
            ctx.fillStyle = '#1c1917'; ctx.fillRect(10, 8, 26, 30);
            // Лавовые прожилки
            ctx.fillStyle = '#ef4444'; ctx.fillRect(14, 12, 4, 20); ctx.fillRect(22, 18, 10, 4); ctx.fillRect(26, 22, 4, 12);
            ctx.fillStyle = '#f59e0b'; ctx.fillRect(15, 14, 2, 16);
            // Глаза
            ctx.fillStyle = '#fef08a'; ctx.fillRect(14, 10, 4, 3); ctx.fillRect(24, 10, 4, 3);
        });

        // --- МОНСТРЫ КАРТЫ 4: ЛЕДЯНАЯ ПУСТОШЬ ---
        // 16. Ледяной Огонёк (Frost Wisp)
        this.createCanvas('enemy_frostwisp', 24, 24, (ctx) => {
            ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(12, 12, 10, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(12, 12, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(12, 12, 3, 0, Math.PI*2); ctx.fill();
        });

        // 17. Призрак Вьюги (Frost Wraith)
        this.createCanvas('enemy_frostwraith', 34, 34, (ctx) => {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
            ctx.beginPath(); ctx.arc(17, 12, 12, Math.PI, 0); ctx.lineTo(29, 28); ctx.lineTo(22, 22); ctx.lineTo(17, 28); ctx.lineTo(12, 22); ctx.lineTo(5, 28); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#082f49'; ctx.fillRect(12, 11, 3, 4); ctx.fillRect(19, 11, 3, 4);
            ctx.fillStyle = '#e0f2fe'; ctx.fillRect(13, 12, 1, 2); ctx.fillRect(20, 12, 1, 2);
        });

        // 18. Ледяной Страж (Ice Golem)
        this.createCanvas('enemy_icegolem', 48, 48, (ctx) => {
            ctx.fillStyle = '#075985'; ctx.fillRect(12, 8, 24, 32);
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(10, 12, 8, 12); ctx.fillRect(30, 12, 8, 12); ctx.fillRect(16, 20, 16, 16);
            ctx.fillStyle = '#e0f2fe'; ctx.fillRect(18, 12, 4, 3); ctx.fillRect(26, 12, 4, 3);
        });
    }

    // --- ВСЕ БОССЫ ДЛЯ 4 ЛОКАЦИЙ ---
    static createAllBosses() {
        // === БОССЫ КАРТЫ 1: ТЁМНЫЙ ЗАМОК ===
        // Королевский Слизень
        this.createCanvas('boss_king_slime', 70, 70, (ctx) => {
            ctx.fillStyle = '#38b000'; ctx.beginPath(); ctx.arc(35, 38, 30, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(20, 16); ctx.lineTo(20, 2); ctx.lineTo(27, 10); ctx.lineTo(35, 0); ctx.lineTo(43, 10); ctx.lineTo(50, 2); ctx.lineTo(50, 16); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ef233c'; ctx.fillRect(33, 8, 4, 4);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(22, 28, 8, 8); ctx.fillRect(40, 28, 8, 8);
            ctx.fillStyle = '#000000'; ctx.fillRect(25, 30, 4, 4); ctx.fillRect(43, 30, 4, 4);
        });

        // Верховный Некромант
        this.createCanvas('boss_necromancer', 68, 68, (ctx) => {
            ctx.fillStyle = 'rgba(114, 9, 183, 0.4)'; ctx.beginPath(); ctx.arc(34, 34, 32, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#240046'; ctx.fillRect(18, 14, 32, 46);
            ctx.fillStyle = '#e0e1dd'; ctx.fillRect(24, 12, 20, 18);
            ctx.fillStyle = '#00f5d4'; ctx.fillRect(27, 18, 5, 5); ctx.fillRect(36, 18, 5, 5);
            ctx.fillStyle = '#6c757d'; ctx.fillRect(52, 4, 5, 56);
            ctx.fillStyle = '#f72585'; ctx.fillRect(49, 2, 11, 10);
        });

        // Орочий Вождь-Титан
        this.createCanvas('boss_orc_titan', 78, 78, (ctx) => {
            ctx.fillStyle = '#2d6a4f'; ctx.fillRect(16, 18, 46, 52);
            ctx.fillStyle = '#495057'; ctx.fillRect(20, 26, 38, 30);
            ctx.fillStyle = '#1b4332'; ctx.fillRect(24, 10, 30, 18);
            ctx.fillStyle = '#ff0054'; ctx.fillRect(28, 14, 6, 4); ctx.fillRect(44, 14, 6, 4);
            ctx.fillStyle = '#7f4f24'; ctx.fillRect(66, 6, 6, 64);
            ctx.fillStyle = '#adb5bd'; ctx.fillRect(56, 10, 26, 18);
        });

        // Огненный Голем
        this.createCanvas('boss_fire_golem', 85, 85, (ctx) => {
            ctx.fillStyle = '#370617'; ctx.fillRect(15, 15, 55, 60);
            ctx.fillStyle = '#f77f00'; ctx.fillRect(25, 20, 6, 45); ctx.fillRect(45, 30, 8, 35);
            ctx.fillStyle = '#ffd166'; ctx.fillRect(26, 22, 8, 4); ctx.fillRect(46, 22, 8, 4);
        });

        // Повелитель Тьмы (Финал Карты 1)
        this.createCanvas('boss_dark_overlord', 105, 105, (ctx) => {
            ctx.fillStyle = 'rgba(239, 35, 60, 0.25)'; ctx.beginPath(); ctx.arc(52, 52, 50, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#03071e'; ctx.fillRect(25, 25, 55, 65);
            ctx.fillStyle = '#d90429';
            ctx.beginPath(); ctx.moveTo(25, 25); ctx.lineTo(5, 5); ctx.lineTo(35, 20); ctx.fill();
            ctx.beginPath(); ctx.moveTo(80, 25); ctx.lineTo(100, 5); ctx.lineTo(70, 20); ctx.fill();
            ctx.fillStyle = '#ff0054'; ctx.fillRect(36, 40, 10, 6); ctx.fillRect(58, 40, 10, 6);
            ctx.fillStyle = '#ffb703'; ctx.beginPath(); ctx.arc(52, 65, 12, 0, Math.PI*2); ctx.fill();
        });

        // === БОССЫ КАРТЫ 2: ПРОКЛЯТЫЙ ЛЕС ===
        // Королева Спор
        this.createCanvas('boss_spore_queen', 72, 72, (ctx) => {
            ctx.fillStyle = '#065f46'; ctx.beginPath(); ctx.arc(36, 40, 28, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(36, 32, 22, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#34d399'; ctx.fillRect(24, 22, 6, 6); ctx.fillRect(42, 22, 6, 6); ctx.fillRect(33, 14, 6, 6);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(26, 36, 6, 4); ctx.fillRect(40, 36, 6, 4);
        });

        // Теневой Альфа-Волк
        this.createCanvas('boss_alpha_wolf', 74, 74, (ctx) => {
            ctx.fillStyle = '#0f172a'; ctx.fillRect(16, 20, 42, 36);
            ctx.fillStyle = '#0284c7'; ctx.fillRect(10, 12, 18, 18); ctx.fillRect(10, 4, 6, 12); ctx.fillRect(22, 4, 6, 12);
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(12, 16, 5, 4);
            ctx.fillStyle = '#0284c7'; ctx.fillRect(56, 22, 10, 16);
        });

        // Древний Энт
        this.createCanvas('boss_elder_treant', 84, 84, (ctx) => {
            ctx.fillStyle = '#291205'; ctx.fillRect(20, 16, 44, 56);
            ctx.fillStyle = '#14532d'; ctx.beginPath(); ctx.arc(42, 20, 26, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#22c55e'; ctx.fillRect(28, 28, 8, 6); ctx.fillRect(48, 28, 8, 6);
            ctx.fillStyle = '#451a03'; ctx.fillRect(6, 24, 14, 38); ctx.fillRect(64, 24, 14, 38);
        });

        // Верховная Ведьма Леса
        this.createCanvas('boss_forest_witch', 80, 80, (ctx) => {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'; ctx.beginPath(); ctx.arc(40, 40, 38, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#064e3b'; ctx.fillRect(22, 20, 36, 50);
            ctx.fillStyle = '#042f2e'; ctx.beginPath(); ctx.moveTo(12, 24); ctx.lineTo(68, 24); ctx.lineTo(40, 4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#84cc16'; ctx.fillRect(30, 30, 6, 5); ctx.fillRect(44, 30, 6, 5);
            ctx.fillStyle = '#a3e635'; ctx.beginPath(); ctx.arc(65, 20, 10, 0, Math.PI*2); ctx.fill();
        });

        // Дух Проклятой Чащи (Финал Карты 2)
        this.createCanvas('boss_forest_avatar', 108, 108, (ctx) => {
            ctx.fillStyle = 'rgba(5, 150, 105, 0.35)'; ctx.beginPath(); ctx.arc(54, 54, 52, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#064e3b'; ctx.fillRect(26, 28, 56, 68);
            // Рога оленя-хранителя
            ctx.fillStyle = '#d97706';
            ctx.beginPath(); ctx.moveTo(30, 28); ctx.lineTo(10, 8); ctx.lineTo(25, 20); ctx.lineTo(8, 2); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(78, 28); ctx.lineTo(98, 8); ctx.lineTo(83, 20); ctx.lineTo(100, 2); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#34d399'; ctx.fillRect(38, 42, 10, 6); ctx.fillRect(60, 42, 10, 6);
            ctx.fillStyle = '#6ee7b7'; ctx.beginPath(); ctx.arc(54, 68, 14, 0, Math.PI*2); ctx.fill();
        });

        // === БОССЫ КАРТЫ 3: ПЫЛАЮЩИЕ НЕДРА ===
        // Владыка Бесов
        this.createCanvas('boss_imp_warlord', 68, 68, (ctx) => {
            ctx.fillStyle = '#991b1b'; ctx.fillRect(18, 16, 32, 40);
            ctx.fillStyle = '#450a0a'; ctx.fillRect(16, 6, 8, 12); ctx.fillRect(44, 6, 8, 12);
            ctx.fillStyle = '#facc15'; ctx.fillRect(24, 22, 6, 4); ctx.fillRect(38, 22, 6, 4);
            ctx.fillStyle = '#f97316'; ctx.fillRect(54, 8, 6, 52); ctx.fillRect(48, 8, 18, 6);
        });

        // Цербер Преисподней
        this.createCanvas('boss_cerberus', 76, 76, (ctx) => {
            ctx.fillStyle = '#450a0a'; ctx.fillRect(16, 24, 44, 38);
            // 3 головы
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(8, 12, 16, 16); ctx.fillRect(30, 8, 16, 16); ctx.fillRect(52, 12, 16, 16);
            ctx.fillStyle = '#f97316'; ctx.fillRect(12, 16, 4, 3); ctx.fillRect(36, 12, 4, 3); ctx.fillRect(58, 16, 4, 3);
        });

        // Титан Кузни Ада
        this.createCanvas('boss_hellforge_titan', 86, 86, (ctx) => {
            ctx.fillStyle = '#292524'; ctx.fillRect(18, 16, 50, 58);
            ctx.fillStyle = '#ea580c'; ctx.fillRect(26, 24, 8, 40); ctx.fillRect(52, 24, 8, 40); ctx.fillRect(30, 40, 26, 8);
            ctx.fillStyle = '#fef08a'; ctx.fillRect(28, 20, 8, 4); ctx.fillRect(50, 20, 8, 4);
        });

        // Вулканический Дракон
        this.createCanvas('boss_volcano_dragon', 92, 92, (ctx) => {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; ctx.beginPath(); ctx.arc(46, 46, 44, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#7f1d1d'; ctx.fillRect(24, 24, 44, 52);
            // Крылья дракона
            ctx.fillStyle = '#b91c1c';
            ctx.beginPath(); ctx.moveTo(24, 30); ctx.lineTo(2, 10); ctx.lineTo(16, 50); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(68, 30); ctx.lineTo(90, 10); ctx.lineTo(76, 50); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#fef08a'; ctx.fillRect(34, 34, 8, 6); ctx.fillRect(50, 34, 8, 6);
        });

        // Владыка Пепла (Финал Карты 3)
        this.createCanvas('boss_infernal_overlord', 110, 110, (ctx) => {
            ctx.fillStyle = 'rgba(220, 38, 38, 0.4)'; ctx.beginPath(); ctx.arc(55, 55, 54, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#1c1917'; ctx.fillRect(26, 26, 58, 70);
            ctx.fillStyle = '#dc2626';
            ctx.beginPath(); ctx.moveTo(26, 26); ctx.lineTo(6, 4); ctx.lineTo(38, 20); ctx.fill();
            ctx.beginPath(); ctx.moveTo(84, 26); ctx.lineTo(104, 4); ctx.lineTo(72, 20); ctx.fill();
            ctx.fillStyle = '#f97316'; ctx.fillRect(38, 40, 10, 6); ctx.fillRect(62, 40, 10, 6);
            ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(55, 68, 16, 0, Math.PI*2); ctx.fill();
        });

        // === БОССЫ КАРТЫ 4: ЛЕДЯНАЯ ПУСТОШЬ ===
        // Мать Вьюги
        this.createCanvas('boss_frost_mother', 70, 70, (ctx) => {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)'; ctx.beginPath(); ctx.arc(35, 35, 32, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#0369a1'; ctx.fillRect(20, 16, 30, 44);
            ctx.fillStyle = '#e0f2fe'; ctx.fillRect(26, 24, 6, 4); ctx.fillRect(38, 24, 6, 4);
        });

        // Владыка Мороза
        this.createCanvas('boss_frost_lord', 78, 78, (ctx) => {
            ctx.fillStyle = '#0c4a6e'; ctx.fillRect(18, 16, 42, 50);
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(14, 18, 12, 14); ctx.fillRect(52, 18, 12, 14);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(28, 24, 6, 4); ctx.fillRect(44, 24, 6, 4);
        });

        // Ледяной Колосс
        this.createCanvas('boss_glacial_colossus', 88, 88, (ctx) => {
            ctx.fillStyle = '#075985'; ctx.fillRect(18, 16, 52, 60);
            ctx.fillStyle = '#38bdf8'; ctx.fillRect(24, 24, 12, 40); ctx.fillRect(52, 24, 12, 40);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(28, 22, 8, 4); ctx.fillRect(52, 22, 8, 4);
        });

        // Дракон Вечной Мерзлоты
        this.createCanvas('boss_frost_drake', 94, 94, (ctx) => {
            ctx.fillStyle = 'rgba(14, 165, 233, 0.35)'; ctx.beginPath(); ctx.arc(47, 47, 45, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#0369a1'; ctx.fillRect(26, 24, 42, 54);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.moveTo(26, 30); ctx.lineTo(4, 10); ctx.lineTo(16, 52); ctx.closePath(); ctx.fill();
            ctx.beginPath(); ctx.moveTo(68, 30); ctx.lineTo(90, 10); ctx.lineTo(78, 52); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#e0f2fe'; ctx.fillRect(34, 34, 8, 6); ctx.fillRect(52, 34, 8, 6);
        });

        // Король Вечной Стужи (Финал Карты 4)
        this.createCanvas('boss_frost_monarch', 112, 112, (ctx) => {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)'; ctx.beginPath(); ctx.arc(56, 56, 54, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#082f49'; ctx.fillRect(26, 26, 60, 72);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.moveTo(26, 26); ctx.lineTo(8, 6); ctx.lineTo(36, 22); ctx.fill();
            ctx.beginPath(); ctx.moveTo(86, 26); ctx.lineTo(104, 6); ctx.lineTo(76, 22); ctx.fill();
            ctx.fillStyle = '#e0f2fe'; ctx.fillRect(38, 40, 10, 6); ctx.fillRect(64, 40, 10, 6);
            ctx.fillStyle = '#bae6fd'; ctx.beginPath(); ctx.arc(56, 68, 16, 0, Math.PI*2); ctx.fill();
        });
    }

    // --- PROJECTILES ---
    static createProjectiles() {
        // Arrow
        this.createCanvas('proj_arrow', 24, 8, (ctx) => {
            ctx.fillStyle = '#b08968';
            ctx.fillRect(0, 3, 18, 2);
            ctx.fillStyle = '#e0e1dd';
            ctx.beginPath();
            ctx.moveTo(24, 4);
            ctx.lineTo(18, 0);
            ctx.lineTo(18, 8);
            ctx.fill();
        });

        // Fireball
        this.createCanvas('proj_fireball', 20, 20, (ctx) => {
            ctx.fillStyle = '#f77f00';
            ctx.beginPath();
            ctx.arc(10, 10, 9, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#fcbf49';
            ctx.beginPath();
            ctx.arc(10, 10, 5, 0, Math.PI*2);
            ctx.fill();
        });

        // Shuriken
        this.createCanvas('proj_shuriken', 16, 16, (ctx) => {
            ctx.fillStyle = '#ced4da';
            ctx.fillRect(6, 0, 4, 16);
            ctx.fillRect(0, 6, 16, 4);
            ctx.fillStyle = '#495057';
            ctx.beginPath();
            ctx.arc(8, 8, 3, 0, Math.PI*2);
            ctx.fill();
        });

        // Dynamic Crescent Slash Arc (Взмах клинка)
        this.createCanvas('fx_slash', 100, 100, (ctx) => {
            const grad = ctx.createRadialGradient(50, 50, 10, 50, 50, 48);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.85)');
            grad.addColorStop(0.8, 'rgba(14, 165, 233, 0.5)');
            grad.addColorStop(1, 'rgba(2, 132, 199, 0)');

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(50, 50, 40, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(50, 50, 40, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();

            // Огненные/магические искры по дуге
            ctx.fillStyle = '#ffd166';
            for (let i = -3; i <= 3; i++) {
                const a = (i * Math.PI) / 8;
                const sx = 50 + Math.cos(a) * 44;
                const sy = 50 + Math.sin(a) * 44;
                ctx.fillRect(sx - 2, sy - 2, 4, 4);
            }
        });

        // 360 Whirlwind Cleave (Круговой вихрь меча 5 уровня)
        this.createCanvas('fx_whirlwind_360', 160, 160, (ctx) => {
            const radGrad = ctx.createRadialGradient(80, 80, 20, 80, 80, 78);
            radGrad.addColorStop(0, 'rgba(255, 209, 102, 0.05)');
            radGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
            radGrad.addColorStop(0.85, 'rgba(245, 158, 11, 0.7)');
            radGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
            ctx.fillStyle = radGrad;

            // Двойные вращающиеся лезвия
            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(80, 80, 68, 0, Math.PI * 0.85);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(80, 80, 68, Math.PI, Math.PI * 1.85);
            ctx.stroke();

            // Внутренний ореол
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(80, 80, 56, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Storm Blade Cyclone (Эволюция: Клинок Бури)
        this.createCanvas('fx_storm_blade', 200, 200, (ctx) => {
            const radGrad = ctx.createRadialGradient(100, 100, 20, 100, 100, 98);
            radGrad.addColorStop(0, 'rgba(6, 182, 212, 0.1)');
            radGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.4)');
            radGrad.addColorStop(0.9, 'rgba(0, 245, 212, 0.8)');
            radGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
            ctx.fillStyle = radGrad;

            // Тройные штормовые лезвия
            ctx.strokeStyle = '#00f5d4';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            for (let b = 0; b < 3; b++) {
                const startA = (b * Math.PI * 2) / 3;
                ctx.beginPath();
                ctx.arc(100, 100, 84, startA, startA + Math.PI * 0.5);
                ctx.stroke();
            }

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(100, 100, 84, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Lightning Bolt
        this.createCanvas('proj_lightning', 24, 60, (ctx) => {
            ctx.fillStyle = '#4cc9f0';
            ctx.beginPath();
            ctx.moveTo(14, 0);
            ctx.lineTo(4, 28);
            ctx.lineTo(14, 28);
            ctx.lineTo(8, 60);
            ctx.lineTo(20, 24);
            ctx.lineTo(12, 24);
            ctx.closePath();
            ctx.fill();
        });

        // Poison Aura Ring (Красивая вращающаяся чумная аура)
        this.createCanvas('fx_poison_ring', 240, 240, (ctx) => {
            const radGrad = ctx.createRadialGradient(120, 120, 20, 120, 120, 118);
            radGrad.addColorStop(0, 'rgba(56, 176, 0, 0.05)');
            radGrad.addColorStop(0.5, 'rgba(112, 224, 0, 0.22)');
            radGrad.addColorStop(0.85, 'rgba(56, 176, 0, 0.45)');
            radGrad.addColorStop(1, 'rgba(204, 255, 51, 0.8)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(120, 120, 116, 0, Math.PI * 2);
            ctx.fill();

            // Внешнее ядовитое кольцо
            ctx.strokeStyle = '#70e000';
            ctx.lineWidth = 4;
            ctx.setLineDash([12, 8]);
            ctx.stroke();

            // Ядовитые пузыри по орбите
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const bx = 120 + Math.cos(angle) * 95;
                const by = 120 + Math.sin(angle) * 95;
                ctx.fillStyle = '#ccff33';
                ctx.beginPath();
                ctx.arc(bx, by, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(bx - 2, by - 2, 2, 2);
            }
        });

        // Plague Nova Super Ring (Фиолетово-зеленая сверхновая антиматерии)
        this.createCanvas('fx_plague_nova_ring', 280, 280, (ctx) => {
            const radGrad = ctx.createRadialGradient(140, 140, 30, 140, 140, 138);
            radGrad.addColorStop(0, 'rgba(114, 9, 183, 0.1)');
            radGrad.addColorStop(0.6, 'rgba(114, 9, 183, 0.35)');
            radGrad.addColorStop(0.9, 'rgba(0, 245, 212, 0.55)');
            radGrad.addColorStop(1, 'rgba(247, 37, 133, 0.9)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(140, 140, 136, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#00f5d4';
            ctx.lineWidth = 5;
            ctx.setLineDash([16, 8]);
            ctx.stroke();

            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const bx = 140 + Math.cos(angle) * 115;
                const by = 140 + Math.sin(angle) * 115;
                ctx.fillStyle = '#f72585';
                ctx.beginPath();
                ctx.arc(bx, by, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#00f5d4';
                ctx.fillRect(bx - 2, by - 2, 4, 4);
            }
        });

        // Toxic Pulse Shockwave
        this.createCanvas('fx_toxic_pulse', 200, 200, (ctx) => {
            ctx.strokeStyle = '#70e000';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(100, 100, 92, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = '#ccff33';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    // --- PICKUPS ---
    static createPickups() {
        // Gem Small (Blue)
        this.createCanvas('gem_small', 14, 14, (ctx) => {
            ctx.fillStyle = '#3a86ff';
            ctx.beginPath();
            ctx.moveTo(7, 0); ctx.lineTo(14, 7); ctx.lineTo(7, 14); ctx.lineTo(0, 7);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(4, 4, 3, 3);
        });

        // Gem Medium (Green)
        this.createCanvas('gem_med', 18, 18, (ctx) => {
            ctx.fillStyle = '#38b000';
            ctx.beginPath();
            ctx.moveTo(9, 0); ctx.lineTo(18, 9); ctx.lineTo(9, 18); ctx.lineTo(0, 9);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ccff33';
            ctx.fillRect(6, 5, 4, 4);
        });

        // Gem Large (Red)
        this.createCanvas('gem_large', 22, 22, (ctx) => {
            ctx.fillStyle = '#ef233c';
            ctx.beginPath();
            ctx.moveTo(11, 0); ctx.lineTo(22, 11); ctx.lineTo(11, 22); ctx.lineTo(0, 11);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffb703';
            ctx.fillRect(7, 6, 5, 5);
        });

        // Gold Coin
        this.createCanvas('pickup_coin', 16, 16, (ctx) => {
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            ctx.arc(8, 8, 7, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#ffb703';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('$', 5, 11);
        });

        // Treasure Chest
        this.createCanvas('pickup_chest', 32, 28, (ctx) => {
            ctx.fillStyle = '#6f4e37';
            ctx.fillRect(4, 8, 24, 18);
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(2, 4, 28, 6);
            ctx.fillRect(14, 12, 4, 6);
        });

        // Health Potion
        this.createCanvas('pickup_potion', 18, 22, (ctx) => {
            ctx.fillStyle = '#d90429';
            ctx.fillRect(4, 8, 10, 12);
            ctx.fillStyle = '#adb5bd';
            ctx.fillRect(7, 4, 4, 4);
        });

        // Magnet
        this.createCanvas('pickup_magnet', 22, 22, (ctx) => {
            ctx.strokeStyle = '#ef233c';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(11, 11, 8, Math.PI, 0, false);
            ctx.stroke();
            ctx.fillStyle = '#4cc9f0';
            ctx.fillRect(3, 11, 4, 6);
            ctx.fillRect(15, 11, 4, 6);
        });
    }

    // --- PROPS & ARENA FX ---
    static createPropsAndFX() {
        // Wooden Barrel (Разбиваемая бочка с золотом/зельями)
        this.createCanvas('prop_barrel', 32, 36, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(16, 32, 12, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Деревянный корпус
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(4, 4, 24, 28);

            // Стальные обручи
            ctx.fillStyle = '#495057';
            ctx.fillRect(4, 8, 24, 4);
            ctx.fillRect(4, 22, 24, 4);

            // Заклепки
            ctx.fillStyle = '#ced4da';
            ctx.fillRect(6, 9, 2, 2);
            ctx.fillRect(15, 9, 2, 2);
            ctx.fillRect(24, 9, 2, 2);
            ctx.fillRect(6, 23, 2, 2);
            ctx.fillRect(15, 23, 2, 2);
            ctx.fillRect(24, 23, 2, 2);

            // Деревянные доски
            ctx.fillStyle = '#5c3a1e';
            ctx.fillRect(10, 4, 2, 28);
            ctx.fillRect(20, 4, 2, 28);
        });

        // Надгробие для павшего напарника в Co-op
        this.createCanvas('prop_tombstone', 28, 34, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.beginPath();
            ctx.ellipse(14, 30, 12, 4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Каменная плита
            ctx.fillStyle = '#6c757d';
            ctx.fillRect(4, 6, 20, 24);

            // Крест на могиле
            ctx.fillStyle = '#343a40';
            ctx.fillRect(12, 10, 4, 12);
            ctx.fillRect(8, 13, 12, 4);
        });

        // Круг воскрешения (Revival Altar FX)
        this.createCanvas('fx_revive_circle', 120, 120, (ctx) => {
            const radGrad = ctx.createRadialGradient(60, 60, 10, 60, 60, 58);
            radGrad.addColorStop(0, 'rgba(0, 245, 212, 0.4)');
            radGrad.addColorStop(0.7, 'rgba(255, 209, 102, 0.25)');
            radGrad.addColorStop(1, 'rgba(0, 245, 212, 0.8)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(60, 60, 56, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 3;
            ctx.setLineDash([8, 6]);
            ctx.stroke();

            // Рунический крест в центре
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(57, 40, 6, 40);
            ctx.fillRect(40, 57, 40, 6);
        });
    }

    // --- ICON GENERATION ДЛЯ КАРТОЧЕК НАВЫКОВ, СУПЕР-ОРУЖИЯ И ПАССИВОК ---
    static createIcons() {
        const createSquareIcon = (key, baseColor, isSuper, symbolDraw) => {
            this.createCanvas(key, 48, 48, (ctx) => {
                // 1. Внешняя глубокая темная рамка
                ctx.fillStyle = '#060913';
                ctx.beginPath();
                ctx.roundRect(0, 0, 48, 48, 8);
                ctx.fill();

                // 2. Внутренняя цветная пластина с насыщенным градиентом
                const grad = ctx.createLinearGradient(0, 0, 48, 48);
                grad.addColorStop(0, baseColor);
                grad.addColorStop(0.65, '#0f172a');
                grad.addColorStop(1, '#020617');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(2, 2, 44, 44, 6);
                ctx.fill();

                // 3. Фоновая пиксельная текстура / сетка
                ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
                for (let px = 4; px < 44; px += 4) {
                    for (let py = 4; py < 44; py += 4) {
                        if ((px + py) % 8 === 0) ctx.fillRect(px, py, 2, 2);
                    }
                }

                // 4. Верхний стеклянный блик (Gloss)
                const gloss = ctx.createLinearGradient(0, 2, 0, 20);
                gloss.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
                gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                ctx.fillStyle = gloss;
                ctx.beginPath();
                ctx.roundRect(3, 3, 42, 16, [5, 5, 2, 2]);
                ctx.fill();

                // 5. Металлическая окантовка (Золотая для эволюций, неоновая/серебряная для базовых)
                ctx.strokeStyle = isSuper ? '#ffd166' : (baseColor === '#1e40af' ? '#38bdf8' : (baseColor === '#581c87' ? '#c084fc' : '#64748b'));
                ctx.lineWidth = isSuper ? 2.5 : 1.5;
                ctx.beginPath();
                ctx.roundRect(2, 2, 44, 44, 6);
                ctx.stroke();

                if (isSuper) {
                    // Золотые уголки для супер-оружия
                    ctx.fillStyle = '#fef08a';
                    ctx.fillRect(1, 1, 4, 2); ctx.fillRect(1, 1, 2, 4);
                    ctx.fillRect(43, 1, 4, 2); ctx.fillRect(45, 1, 2, 4);
                    ctx.fillRect(1, 45, 4, 2); ctx.fillRect(1, 43, 2, 4);
                    ctx.fillRect(43, 45, 4, 2); ctx.fillRect(45, 43, 2, 4);
                }

                // 6. Отрисовка уникального пиксель-арт символа
                symbolDraw(ctx);
            });
        };

        // 1. БАЗОВОЕ ОРУЖИЕ
        // --- Меч Героя (Кованый клинок с золотой гардой и синим свечением) ---
        createSquareIcon('icon_sword', '#1e40af', false, (ctx) => {
            // Лезвие (45 градусов)
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(36, 10); ctx.lineTo(39, 13); ctx.lineTo(26, 26); ctx.lineTo(23, 23); ctx.closePath();
            ctx.fill();
            // Тень лезвия
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(39, 13); ctx.lineTo(26, 26); ctx.lineTo(24, 28); ctx.lineTo(23, 23); ctx.closePath();
            ctx.fill();
            // Острие
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(37, 9, 3, 3);
            // Магическая синяя кромка
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(32, 14, 2, 2); ctx.fillRect(28, 18, 2, 2);
            // Гарда (Золото)
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            ctx.moveTo(18, 28); ctx.lineTo(28, 18); ctx.lineTo(30, 20); ctx.lineTo(20, 30); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#d97706';
            ctx.fillRect(23, 23, 3, 3);
            // Рукоять (Кожа)
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.moveTo(19, 29); ctx.lineTo(13, 35); ctx.lineTo(15, 37); ctx.lineTo(21, 31); ctx.closePath();
            ctx.fill();
            // Навершие (Рубин в золоте)
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(12, 38, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath(); ctx.arc(12, 38, 2, 0, Math.PI * 2); ctx.fill();
        });

        // --- Быстрый Лук (Изящный эльфийский лук с бирюзовой стрелой) ---
        createSquareIcon('icon_bow', '#166534', false, (ctx) => {
            // Древко лука
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(18, 24, 16, -Math.PI * 0.42, Math.PI * 0.42);
            ctx.stroke();
            // Золотые наконечники лука
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(27, 8, 3, 3);
            ctx.fillRect(27, 37, 3, 3);
            // Тетива
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(28, 9); ctx.lineTo(19, 24); ctx.lineTo(28, 39);
            ctx.stroke();
            // Стрела (Древко)
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(11, 23, 24, 2);
            // Наконечник стрелы (Светящийся кристалл)
            ctx.fillStyle = '#00f5d4';
            ctx.beginPath(); ctx.moveTo(38, 24); ctx.lineTo(32, 20); ctx.lineTo(34, 24); ctx.lineTo(32, 28); ctx.closePath(); ctx.fill();
            // Оперение
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(9, 21, 3, 2); ctx.fillRect(9, 25, 3, 2);
        });

        // --- Огненный Шар (Яростная пылающая плазменная сфера) ---
        createSquareIcon('icon_fireball', '#991b1b', false, (ctx) => {
            // Внешнее огненное кольцо
            const rad = ctx.createRadialGradient(24, 24, 2, 24, 24, 16);
            rad.addColorStop(0, '#ffffff');
            rad.addColorStop(0.25, '#fef08a');
            rad.addColorStop(0.55, '#f97316');
            rad.addColorStop(0.85, '#dc2626');
            rad.addColorStop(1, 'rgba(153, 27, 27, 0)');
            ctx.fillStyle = rad;
            ctx.beginPath(); ctx.arc(24, 24, 16, 0, Math.PI * 2); ctx.fill();

            // Ядро фаербола
            ctx.fillStyle = '#fef08a';
            ctx.beginPath(); ctx.arc(23, 23, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(22, 22, 4, 0, Math.PI * 2); ctx.fill();

            // Огненные языки и искры вокруг
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(34, 14, 3, 3);
            ctx.fillRect(12, 32, 3, 3);
            ctx.fillRect(32, 30, 2, 2);
            ctx.fillRect(14, 12, 2, 2);
        });

        // --- Сюрикены (4-конечная сюрикен-звезда ниндзя) ---
        createSquareIcon('icon_shuriken', '#581c87', false, (ctx) => {
            // Лопасти сюрикена
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(24, 6); ctx.lineTo(27, 21); ctx.lineTo(42, 24); ctx.lineTo(27, 27);
            ctx.lineTo(24, 42); ctx.lineTo(21, 27); ctx.lineTo(6, 24); ctx.lineTo(21, 21);
            ctx.closePath();
            ctx.fill();

            // Теневые грани лопастей
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(24, 6); ctx.lineTo(24, 24); ctx.lineTo(42, 24); ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(24, 42); ctx.lineTo(24, 24); ctx.lineTo(6, 24); ctx.closePath(); ctx.fill();

            // Неоновая фиолетовая подсветка лезвий
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Центральное отверстие
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.arc(24, 24, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // --- Посох Молний (Искрящийся громовой посох с золотой молнией) ---
        createSquareIcon('icon_lightning', '#0369a1', false, (ctx) => {
            // Электрический разряд молнии
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.moveTo(28, 6); ctx.lineTo(15, 23); ctx.lineTo(26, 23);
            ctx.lineTo(18, 42); ctx.lineTo(34, 20); ctx.lineTo(24, 20);
            ctx.closePath();
            ctx.fill();

            // Белая центральная плазма молнии
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(27, 9); ctx.lineTo(18, 22); ctx.lineTo(26, 22); ctx.lineTo(21, 38);
            ctx.stroke();

            // Электрические искры
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(11, 14, 2, 2);
            ctx.fillRect(36, 16, 2, 2);
            ctx.fillRect(12, 32, 2, 2);
            ctx.fillRect(32, 34, 2, 2);
        });

        // --- Чумная Аура (Ядовитый алхимический череп в зеленом дыму) ---
        createSquareIcon('icon_poison', '#15803d', false, (ctx) => {
            // Ядовитое облако
            ctx.fillStyle = '#84cc16';
            ctx.beginPath(); ctx.arc(19, 26, 10, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(29, 23, 11, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(23, 16, 8, 0, Math.PI * 2); ctx.fill();

            // Токсичные пузырьки
            ctx.fillStyle = '#ecfccb';
            ctx.beginPath(); ctx.arc(27, 19, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(17, 24, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(22, 30, 2, 0, Math.PI * 2); ctx.fill();

            // Череп яда в центре
            ctx.fillStyle = '#064e3b';
            ctx.beginPath(); ctx.arc(24, 22, 6, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(22, 26, 4, 3);
            ctx.fillStyle = '#a3e635';
            ctx.fillRect(22, 21, 2, 2); ctx.fillRect(25, 21, 2, 2);
        });

        // 2. СУПЕР-ОРУЖИЕ (ЭВОЛЮЦИИ)
        // --- Клинок Бури (Парные золотые клинки в вихре молний) ---
        createSquareIcon('icon_super_blade', '#1e3a8a', true, (ctx) => {
            // Силовой вихрь
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.arc(24, 24, 16, 0, Math.PI * 1.6); ctx.stroke();

            // Скрещенные клинки
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(10, 10); ctx.lineTo(38, 38); ctx.lineTo(36, 40); ctx.lineTo(8, 12); ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(38, 10); ctx.lineTo(10, 38); ctx.lineTo(8, 36); ctx.lineTo(36, 8); ctx.closePath(); ctx.fill();

            // Золотое ядро энергии
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(24, 24, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(24, 24, 3.5, 0, Math.PI * 2); ctx.fill();
        });

        // --- Бесконечный Шквал (Эпический лук с 3 лазерными стрелами) ---
        createSquareIcon('icon_super_bow', '#065f46', true, (ctx) => {
            // Тройной лук
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 3.5;
            ctx.beginPath(); ctx.arc(17, 24, 16, -Math.PI * 0.45, Math.PI * 0.45); ctx.stroke();

            // 3 лазерные золотые стрелы
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(16, 23, 25, 2);
            ctx.fillRect(16, 15, 21, 2);
            ctx.fillRect(16, 31, 21, 2);

            // Наконечники
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(39, 22, 4, 4);
            ctx.fillRect(35, 14, 4, 4);
            ctx.fillRect(35, 30, 4, 4);
        });

        // --- Метеоритный Апокалипсис (Гигантский пылающий метеорит) ---
        createSquareIcon('icon_super_meteor', '#7f1d1d', true, (ctx) => {
            const rad = ctx.createRadialGradient(24, 24, 3, 24, 24, 18);
            rad.addColorStop(0, '#ffffff');
            rad.addColorStop(0.25, '#fef08a');
            rad.addColorStop(0.6, '#ea580c');
            rad.addColorStop(0.9, '#991b1b');
            rad.addColorStop(1, 'rgba(127, 29, 29, 0)');
            ctx.fillStyle = rad;
            ctx.beginPath(); ctx.arc(24, 24, 18, 0, Math.PI * 2); ctx.fill();

            // Кратеры и магма
            ctx.fillStyle = '#450a0a';
            ctx.beginPath(); ctx.arc(21, 21, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(29, 26, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fde047';
            ctx.fillRect(20, 20, 2, 2); ctx.fillRect(28, 25, 2, 2);
        });

        // --- Омега-Сюрикены (8-лучевой силовой диск с фиолетовой плазмой) ---
        createSquareIcon('icon_super_shuriken', '#581c87', true, (ctx) => {
            ctx.fillStyle = '#c084fc';
            ctx.fillRect(21, 6, 6, 36);
            ctx.fillRect(6, 21, 36, 6);

            // Диагональные лезвия
            ctx.beginPath();
            ctx.moveTo(12, 12); ctx.lineTo(36, 36); ctx.lineTo(34, 38); ctx.lineTo(10, 14); ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(36, 12); ctx.lineTo(12, 36); ctx.lineTo(10, 34); ctx.lineTo(34, 10); ctx.closePath(); ctx.fill();

            // Золотое ядро Омега
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(24, 24, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(24, 24, 3, 0, Math.PI * 2); ctx.fill();
        });

        // --- Гнев Зевса (Золотой трезубец громовержца в каскаде молний) ---
        createSquareIcon('icon_super_lightning', '#0c4a6e', true, (ctx) => {
            // Молния
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.moveTo(30, 5); ctx.lineTo(13, 24); ctx.lineTo(26, 24);
            ctx.lineTo(17, 43); ctx.lineTo(36, 19); ctx.lineTo(23, 19);
            ctx.closePath(); ctx.fill();

            // Золотой трезубец поверх
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(22, 10, 4, 28);
            ctx.fillRect(14, 12, 20, 3);
            ctx.fillRect(14, 8, 3, 7);
            ctx.fillRect(31, 8, 3, 7);
            ctx.fillRect(22, 6, 4, 6);
        });

        // --- Чумная Сверхновая (Радиоактивная звезда антиматерии) ---
        createSquareIcon('icon_super_poison', '#14532d', true, (ctx) => {
            // Внешнее токсичное сияние
            const rad = ctx.createRadialGradient(24, 24, 4, 24, 24, 18);
            rad.addColorStop(0, '#ffffff');
            rad.addColorStop(0.3, '#bef264');
            rad.addColorStop(0.7, '#22c55e');
            rad.addColorStop(1, 'rgba(20, 83, 45, 0)');
            ctx.fillStyle = rad;
            ctx.beginPath(); ctx.arc(24, 24, 18, 0, Math.PI * 2); ctx.fill();

            // Токсичная звезда
            ctx.fillStyle = '#15803d';
            ctx.beginPath(); ctx.arc(24, 24, 9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(24, 24, 4, 0, Math.PI * 2); ctx.fill();
        });

        // 3. ПАССИВНЫЕ НАВЫКИ И ТАЛАНТЫ
        // --- Сила Героя (Меч силы / Рубиновый кулак) ---
        createSquareIcon('icon_might', '#991b1b', false, (ctx) => {
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath(); ctx.moveTo(24, 7); ctx.lineTo(29, 13); ctx.lineTo(29, 31); ctx.lineTo(19, 31); ctx.lineTo(19, 13); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(15, 31, 18, 4);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(22, 35, 4, 8);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath(); ctx.arc(24, 43, 3, 0, Math.PI * 2); ctx.fill();
        });

        // --- Сапоги Ветра (Крылатый сапог Гермеса) ---
        createSquareIcon('icon_boots', '#15803d', false, (ctx) => {
            ctx.fillStyle = '#86efac';
            ctx.beginPath();
            ctx.moveTo(13, 14); ctx.lineTo(25, 14); ctx.lineTo(25, 26); ctx.lineTo(37, 30); ctx.lineTo(37, 37); ctx.lineTo(13, 37); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.stroke();

            // Крыло
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(15, 18); ctx.lineTo(7, 10); ctx.lineTo(16, 12); ctx.lineTo(9, 6); ctx.lineTo(20, 10);
            ctx.closePath(); ctx.fill();
        });

        // --- Сфера Притяжения (Электромагнит) ---
        createSquareIcon('icon_magnet', '#0369a1', false, (ctx) => {
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.arc(24, 22, 11, Math.PI, 0, false); ctx.stroke();
            // Полюса магнита
            ctx.fillStyle = '#ef4444'; ctx.fillRect(10, 22, 6, 9);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(22, 22, 6, 9);
            // Магнитные силовые линии
            ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(24, 33, 5, Math.PI, 0, false); ctx.stroke();
        });

        // --- Камень Жизни (Кристалл здоровья) ---
        createSquareIcon('icon_vitality', '#be123c', false, (ctx) => {
            ctx.fillStyle = '#fda4af';
            ctx.beginPath();
            ctx.moveTo(24, 7); ctx.lineTo(37, 20); ctx.lineTo(24, 41); ctx.lineTo(11, 20); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();

            // Святой белый крест в центре кристалла
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(22, 14, 4, 14);
            ctx.fillRect(17, 19, 14, 4);
        });

        // --- Перчатки Ловкости ---
        createSquareIcon('icon_gloves', '#86198f', false, (ctx) => {
            ctx.fillStyle = '#f0abfc';
            ctx.beginPath(); ctx.roundRect(14, 14, 20, 22, 6); ctx.fill();
            ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.stroke();
            // Пальцы перчатки
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(16, 8, 3, 7); ctx.fillRect(21, 6, 3, 9); ctx.fillRect(26, 7, 3, 8); ctx.fillRect(31, 10, 3, 5);
        });

        // --- Клевер Удачи (4-листный золотой клевер) ---
        createSquareIcon('icon_clover', '#15803d', false, (ctx) => {
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(18, 17, 6.5, 0, Math.PI * 2); ctx.arc(30, 17, 6.5, 0, Math.PI * 2);
            ctx.arc(18, 29, 6.5, 0, Math.PI * 2); ctx.arc(30, 29, 6.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(24, 24); ctx.lineTo(24, 40); ctx.stroke();
            // Блик
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(17, 16, 2, 0, Math.PI * 2); ctx.fill();
        });

        // --- Регенерация (Сердце) ---
        createSquareIcon('icon_heart', '#991b1b', false, (ctx) => {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(24, 39);
            ctx.bezierCurveTo(10, 26, 8, 13, 24, 13);
            ctx.bezierCurveTo(40, 13, 38, 26, 24, 39);
            ctx.fill();
            ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#ffffff'; ctx.fillRect(17, 17, 4, 4);
        });

        // --- Золото / Жадность ---
        createSquareIcon('icon_coin', '#b45309', false, (ctx) => {
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(24, 24, 15, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.fillStyle = '#78350f'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('$', 24, 24);
        });

        // --- Второе Дыхание (Крест Воскрешения) ---
        createSquareIcon('icon_revive', '#0f766e', false, (ctx) => {
            ctx.fillStyle = '#2dd4bf';
            ctx.beginPath(); ctx.arc(24, 24, 16, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#99f6e4'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(21, 12, 6, 24);
            ctx.fillRect(12, 21, 24, 6);
        });
    }

    // --- POWER-UPS & DECALS ---
    static createPowerupsAndDecals() {
        // 1. Holy Bomb (Святая бомба - очистка экрана)
        this.createCanvas('powerup_bomb', 26, 26, (ctx) => {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(13, 23, 10, 3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(13, 13, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Череп на бомбе
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 10, 6, 5);
            ctx.fillRect(11, 15, 4, 3);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(11, 11, 2, 2);
            ctx.fillRect(14, 11, 2, 2);

            // Горящий фитиль
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(18, 3, 4, 4);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(20, 2, 2, 2);
        });

        // 2. Time Freeze (Песочные часы / Заморозка)
        this.createCanvas('powerup_freeze', 26, 26, (ctx) => {
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.moveTo(6, 4); ctx.lineTo(20, 4); ctx.lineTo(13, 13); ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, 22); ctx.lineTo(20, 22); ctx.lineTo(13, 13); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(12, 12, 2, 2);
            ctx.fillRect(11, 18, 4, 3);
        });

        // 3. Rage Elixir (Зелье ярости - удвоенная скорость)
        this.createCanvas('powerup_rage', 24, 28, (ctx) => {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(8, 8); ctx.lineTo(16, 8); ctx.lineTo(22, 24); ctx.lineTo(2, 24); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(9, 3, 6, 6); // пробка
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(6, 14, 3, 6);
        });

        // 4. Пятна крови и слизи на полу
        this.createCanvas('fx_slime_splat', 32, 24, (ctx) => {
            ctx.fillStyle = 'rgba(85, 166, 48, 0.45)';
            ctx.beginPath();
            ctx.ellipse(16, 12, 14, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(112, 224, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(12, 10, 5, 0, Math.PI * 2);
            ctx.arc(20, 14, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        this.createCanvas('fx_blood_splat', 32, 24, (ctx) => {
            ctx.fillStyle = 'rgba(153, 27, 27, 0.45)';
            ctx.beginPath();
            ctx.ellipse(16, 12, 14, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(220, 38, 38, 0.6)';
            ctx.beginPath();
            ctx.arc(14, 11, 5, 0, Math.PI * 2);
            ctx.arc(22, 13, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // --- HIGH-DEFINITION VECTOR SVG & AAA POLISHED UI ICONS (Lucide/React-Icons inspired) ---
    static createUIIcons() {
        // UI Skull Icon (Череп убийств / Босс)
        this.createCanvas('ui_skull', 36, 36, (ctx) => {
            // Мягкое неоновое свечение черепа
            ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
            ctx.shadowBlur = 6;

            // Черепная коробка
            const grad = ctx.createLinearGradient(0, 4, 0, 32);
            grad.addColorStop(0, '#f8fafc');
            grad.addColorStop(0.7, '#cbd5e1');
            grad.addColorStop(1, '#94a3b8');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.arc(18, 15, 12, Math.PI * 0.8, Math.PI * 0.2, false);
            ctx.lineTo(24, 25);
            ctx.lineTo(21, 29);
            ctx.lineTo(15, 29);
            ctx.lineTo(12, 25);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Глазницы
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(14, 16, 3.5, 4.5, -0.2, 0, Math.PI * 2);
            ctx.ellipse(22, 16, 3.5, 4.5, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Зловещие красные зрачки
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(14, 16, 1.5, 0, Math.PI * 2);
            ctx.arc(22, 16, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Носовая полость
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.moveTo(18, 19); ctx.lineTo(16.5, 23); ctx.lineTo(19.5, 23); ctx.closePath();
            ctx.fill();

            // Зубные швы
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(15.5, 26); ctx.lineTo(15.5, 29);
            ctx.moveTo(18, 25); ctx.lineTo(18, 29);
            ctx.moveTo(20.5, 26); ctx.lineTo(20.5, 29);
            ctx.stroke();
        });

        // UI Coin Icon (3D Золотая монета)
        this.createCanvas('ui_coin', 36, 36, (ctx) => {
            // Внешний золотой обод
            const rimGrad = ctx.createLinearGradient(4, 4, 32, 32);
            rimGrad.addColorStop(0, '#fef08a');
            rimGrad.addColorStop(0.5, '#f59e0b');
            rimGrad.addColorStop(1, '#b45309');
            ctx.fillStyle = rimGrad;
            ctx.beginPath();
            ctx.arc(18, 18, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Внутреннее поле монеты
            const innerGrad = ctx.createRadialGradient(15, 15, 2, 18, 18, 12);
            innerGrad.addColorStop(0, '#fef08a');
            innerGrad.addColorStop(0.6, '#fbbf24');
            innerGrad.addColorStop(1, '#d97706');
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(18, 18, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Тисненная 4-конечная звезда
            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.moveTo(18, 10);
            ctx.quadraticCurveTo(18, 18, 26, 18);
            ctx.quadraticCurveTo(18, 18, 18, 26);
            ctx.quadraticCurveTo(18, 18, 10, 18);
            ctx.quadraticCurveTo(18, 18, 18, 10);
            ctx.closePath();
            ctx.fill();

            // Центр звезды
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(18, 18, 2, 0, Math.PI * 2);
            ctx.fill();

            // Диагональный блик (Gloss)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.ellipse(14, 12, 6, 2.5, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Gem Icon (Алмаз / Кристалл душ)
        this.createCanvas('ui_gem', 36, 36, (ctx) => {
            ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
            ctx.shadowBlur = 8;

            // Верхняя грань
            const crownGrad = ctx.createLinearGradient(8, 6, 28, 14);
            crownGrad.addColorStop(0, '#f0abfc');
            crownGrad.addColorStop(0.5, '#c084fc');
            crownGrad.addColorStop(1, '#9333ea');
            ctx.fillStyle = crownGrad;
            ctx.beginPath();
            ctx.moveTo(18, 4);
            ctx.lineTo(29, 12);
            ctx.lineTo(7, 12);
            ctx.closePath();
            ctx.fill();

            // Нижний павильон кристалла
            const pavGrad = ctx.createLinearGradient(18, 12, 18, 32);
            pavGrad.addColorStop(0, '#a855f7');
            pavGrad.addColorStop(0.7, '#7e22ce');
            pavGrad.addColorStop(1, '#581c87');
            ctx.fillStyle = pavGrad;
            ctx.beginPath();
            ctx.moveTo(7, 12);
            ctx.lineTo(29, 12);
            ctx.lineTo(18, 32);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;

            // Центральная грань (Highlight facet)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.moveTo(18, 4);
            ctx.lineTo(23, 12);
            ctx.lineTo(18, 32);
            ctx.lineTo(13, 12);
            ctx.closePath();
            ctx.fill();

            // Контурные ребра
            ctx.strokeStyle = '#f5d0fe';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(18, 4); ctx.lineTo(29, 12); ctx.lineTo(18, 32); ctx.lineTo(7, 12); ctx.closePath();
            ctx.moveTo(7, 12); ctx.lineTo(29, 12);
            ctx.moveTo(18, 4); ctx.lineTo(18, 32);
            ctx.stroke();

            // Точечный сверкающий блик
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(15, 9, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Clock Icon (Часы / Таймер - Lucide Clock)
        this.createCanvas('ui_clock', 36, 36, (ctx) => {
            // Корпус хронометра
            const grad = ctx.createLinearGradient(0, 4, 0, 32);
            grad.addColorStop(0, '#1e293b');
            grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(18, 19, 14, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Верхняя заводная головка
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.roundRect(15, 2, 6, 4, 2);
            ctx.fill();

            // Циферблатные риски (12, 3, 6, 9)
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(17.5, 8, 1, 3);
            ctx.fillRect(17.5, 27, 1, 3);
            ctx.fillRect(7, 18.5, 3, 1);
            ctx.fillRect(26, 18.5, 3, 1);

            // Стрелки на 10:10
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(18, 19); ctx.lineTo(18, 11); // Часовая
            ctx.moveTo(18, 19); ctx.lineTo(23, 15); // Минутная
            ctx.stroke();

            // Центральная заклепка
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(18, 19, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Heart Icon (Рубиновое сердце - Lucide Heart)
        this.createCanvas('ui_heart', 36, 36, (ctx) => {
            ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
            ctx.shadowBlur = 8;

            const grad = ctx.createRadialGradient(14, 12, 2, 18, 18, 16);
            grad.addColorStop(0, '#fda4af');
            grad.addColorStop(0.3, '#f43f5e');
            grad.addColorStop(0.7, '#e11d48');
            grad.addColorStop(1, '#881337');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(18, 30);
            ctx.bezierCurveTo(6, 21, 4, 9, 12, 6);
            ctx.bezierCurveTo(16, 4.5, 17.5, 7, 18, 9);
            ctx.bezierCurveTo(18.5, 7, 20, 4.5, 24, 6);
            ctx.bezierCurveTo(32, 9, 30, 21, 18, 30);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffe4e6';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Глянцевый полумесяц
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.ellipse(12, 10, 4, 2, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Trophy Icon (Золотой кубок - Lucide Trophy)
        this.createCanvas('ui_trophy', 36, 36, (ctx) => {
            ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
            ctx.shadowBlur = 8;

            const gold = ctx.createLinearGradient(6, 4, 30, 32);
            gold.addColorStop(0, '#fef08a');
            gold.addColorStop(0.3, '#f59e0b');
            gold.addColorStop(0.7, '#d97706');
            gold.addColorStop(1, '#92400e');
            ctx.fillStyle = gold;

            // Чаша кубка
            ctx.beginPath();
            ctx.moveTo(10, 6);
            ctx.lineTo(26, 6);
            ctx.lineTo(24, 18);
            ctx.bezierCurveTo(23, 23, 13, 23, 12, 18);
            ctx.closePath();
            ctx.fill();

            // Ручки кубка
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(8, 12, 4.5, Math.PI * 0.5, Math.PI * 1.6);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(28, 12, 4.5, -Math.PI * 0.6, Math.PI * 0.5);
            ctx.stroke();

            // Ножка и постамент
            ctx.fillStyle = '#b45309';
            ctx.fillRect(16, 21, 4, 6);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.roundRect(11, 27, 14, 5, 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Сверкающая звездочка на чаше
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(15, 11, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Book Icon (Гримуар / Коллекция - Lucide BookOpen)
        this.createCanvas('ui_book', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(4, 6, 32, 30);
            grad.addColorStop(0, '#0284c7');
            grad.addColorStop(0.5, '#0369a1');
            grad.addColorStop(1, '#075985');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.roundRect(6, 6, 24, 24, 4);
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Страницы
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(10, 9, 16, 18);

            // Закладка-лента
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(15, 6); ctx.lineTo(19, 6); ctx.lineTo(19, 18); ctx.lineTo(17, 15); ctx.lineTo(15, 18); ctx.closePath();
            ctx.fill();

            // Золотые уголки
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(6, 6); ctx.lineTo(12, 6); ctx.lineTo(6, 12); ctx.closePath();
            ctx.moveTo(30, 6); ctx.lineTo(24, 6); ctx.lineTo(30, 12); ctx.closePath();
            ctx.moveTo(6, 30); ctx.lineTo(12, 30); ctx.lineTo(6, 24); ctx.closePath();
            ctx.moveTo(30, 30); ctx.lineTo(24, 30); ctx.lineTo(30, 24); ctx.closePath();
            ctx.fill();
        });

        // UI Star Icon (Звезда талантов - Lucide Sparkles)
        this.createCanvas('ui_star', 36, 36, (ctx) => {
            ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
            ctx.shadowBlur = 8;

            const grad = ctx.createRadialGradient(18, 18, 2, 18, 18, 16);
            grad.addColorStop(0, '#fef9c3');
            grad.addColorStop(0.3, '#fde047');
            grad.addColorStop(0.7, '#eab308');
            grad.addColorStop(1, '#a16207');
            ctx.fillStyle = grad;

            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const innerA = outerA + (2 * Math.PI) / 10;
                const ox = 18 + Math.cos(outerA) * 14;
                const oy = 18 + Math.sin(outerA) * 14;
                const ix = 18 + Math.cos(innerA) * 6;
                const iy = 18 + Math.sin(innerA) * 6;
                if (i === 0) ctx.moveTo(ox, oy);
                else ctx.lineTo(ox, oy);
                ctx.lineTo(ix, iy);
            }
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // UI Play Icon (Play Button Triangle)
        this.createCanvas('ui_play', 36, 36, (ctx) => {
            ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
            ctx.shadowBlur = 8;

            const grad = ctx.createLinearGradient(10, 8, 28, 26);
            grad.addColorStop(0, '#34d399');
            grad.addColorStop(0.5, '#10b981');
            grad.addColorStop(1, '#047857');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(12, 7);
            ctx.lineTo(28, 18);
            ctx.lineTo(12, 29);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#a7f3d0';
            ctx.lineWidth = 1.5;
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Внутренний глянец
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.moveTo(13, 9); ctx.lineTo(23, 16); ctx.lineTo(13, 18); ctx.closePath();
            ctx.fill();
        });

        // UI Co-op Icon (Два героя - Lucide Users)
        this.createCanvas('ui_coop', 36, 36, (ctx) => {
            // Герой 1 (Синий)
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(13, 12, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(13, 27, 9, Math.PI * 1.1, Math.PI * 1.9);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5; ctx.stroke();

            // Герой 2 (Фиолетовый)
            ctx.fillStyle = '#7e22ce';
            ctx.beginPath();
            ctx.arc(23, 13, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(23, 27, 8.5, Math.PI * 1.1, Math.PI * 1.9);
            ctx.fill();
            ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.5; ctx.stroke();
        });

        // UI Pause Icon (Две вертикальные полосы)
        this.createCanvas('ui_pause', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 8, 0, 28);
            grad.addColorStop(0, '#7dd3fc');
            grad.addColorStop(1, '#0284c7');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.roundRect(9, 7, 6, 22, 3);
            ctx.roundRect(21, 7, 6, 22, 3);
            ctx.fill();

            ctx.strokeStyle = '#e0f2fe';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // UI Sound On & Off (Динамик и волны - Lucide Volume2 & VolumeX)
        this.createCanvas('ui_sound_on', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 6, 0, 30);
            grad.addColorStop(0, '#7dd3fc');
            grad.addColorStop(1, '#0369a1');
            ctx.fillStyle = grad;

            // Корпус динамика
            ctx.beginPath();
            ctx.moveTo(6, 13);
            ctx.lineTo(12, 13);
            ctx.lineTo(19, 7);
            ctx.lineTo(19, 29);
            ctx.lineTo(12, 23);
            ctx.lineTo(6, 23);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Волны звука
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(19, 18, 6, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(19, 18, 11, -Math.PI * 0.35, Math.PI * 0.35);
            ctx.stroke();
        });

        this.createCanvas('ui_sound_off', 36, 36, (ctx) => {
            ctx.fillStyle = '#64748b';
            ctx.beginPath();
            ctx.moveTo(6, 13);
            ctx.lineTo(12, 13);
            ctx.lineTo(19, 7);
            ctx.lineTo(19, 29);
            ctx.lineTo(12, 23);
            ctx.lineTo(6, 23);
            ctx.closePath();
            ctx.fill();

            // Красный крест выключения звука
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(23, 13); ctx.lineTo(31, 23);
            ctx.moveTo(31, 13); ctx.lineTo(23, 23);
            ctx.stroke();
        });

        // UI Settings Gear (Шестеренка настроек - Lucide Settings)
        this.createCanvas('ui_settings', 36, 36, (ctx) => {
            ctx.shadowColor = 'rgba(129, 140, 248, 0.4)';
            ctx.shadowBlur = 6;

            const grad = ctx.createLinearGradient(4, 4, 32, 32);
            grad.addColorStop(0, '#cbd5e1');
            grad.addColorStop(0.5, '#94a3b8');
            grad.addColorStop(1, '#475569');
            ctx.fillStyle = grad;

            // 8 зубьев шестерни
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const x1 = 18 + Math.cos(angle - 0.2) * 15;
                const y1 = 18 + Math.sin(angle - 0.2) * 15;
                const x2 = 18 + Math.cos(angle + 0.2) * 15;
                const y2 = 18 + Math.sin(angle + 0.2) * 15;
                const x3 = 18 + Math.cos(angle + 0.28) * 11;
                const y3 = 18 + Math.sin(angle + 0.28) * 11;
                const x4 = 18 + Math.cos(angle + Math.PI/4 - 0.28) * 11;
                const y4 = 18 + Math.sin(angle + Math.PI/4 - 0.28) * 11;
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x3, y3);
                ctx.lineTo(x4, y4);
            }
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Центральное отверстие
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(18, 18, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#818cf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // UI Stats Chart (График таблицы лидеров - Lucide BarChart3)
        this.createCanvas('ui_chart', 36, 36, (ctx) => {
            // 3 нарастающих столбика
            const colors = [
                { f: '#38bdf8', s: '#7dd3fc', h: 10, x: 6 },
                { f: '#818cf8', s: '#a5b4fc', h: 18, x: 15 },
                { f: '#c084fc', s: '#e879f9', h: 25, x: 24 }
            ];

            colors.forEach(b => {
                ctx.fillStyle = b.f;
                ctx.beginPath();
                ctx.roundRect(b.x, 30 - b.h, 6.5, b.h, [3, 3, 1, 1]);
                ctx.fill();
                ctx.strokeStyle = b.s;
                ctx.lineWidth = 1.2;
                ctx.stroke();
            });

            // Восходящая стрелка тренда
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(6, 22); ctx.lineTo(15, 14); ctx.lineTo(26, 6);
            ctx.lineTo(31, 6); ctx.lineTo(31, 11);
            ctx.stroke();
        });

        // UI Quest Badges (Круглые цветные бейджи для заданий)
        this.createCanvas('ui_badge_skull', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 36, 36);
            grad.addColorStop(0, '#0c4a6e'); grad.addColorStop(1, '#082f49');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(18, 18, 16, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.arc(18, 16, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillRect(15, 21, 6, 4);
            ctx.fillStyle = '#082f49';
            ctx.fillRect(14, 15, 3, 3); ctx.fillRect(19, 15, 3, 3);
        });

        this.createCanvas('ui_badge_chest', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 36, 36);
            grad.addColorStop(0, '#1e1b4b'); grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(18, 18, 16, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#818cf8';
            ctx.beginPath(); ctx.roundRect(9, 14, 18, 12, 2); ctx.fill();
            ctx.fillStyle = '#c7d2fe';
            ctx.fillRect(9, 11, 18, 4);
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(16, 16, 4, 4);
        });

        this.createCanvas('ui_badge_xp', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 36, 36);
            grad.addColorStop(0, '#064e3b'); grad.addColorStop(1, '#022c22');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(18, 18, 16, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#34d399';
            ctx.font = '900 13px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('XP', 18, 18);
        });

        // UI Battle Pass Rank 15 Hex Badge
        this.createCanvas('ui_badge_rank15', 40, 40, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 40, 40);
            grad.addColorStop(0, '#581c87'); grad.addColorStop(1, '#2e1065');
            ctx.fillStyle = grad;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const x = 20 + Math.cos(a) * 18;
                const y = 20 + Math.sin(a) * 18;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#f5d0fe';
            ctx.beginPath();
            ctx.moveTo(20, 8); ctx.lineTo(28, 18); ctx.lineTo(20, 31); ctx.lineTo(12, 18); ctx.closePath();
            ctx.fill();
        });

        // UI 3D Card: Gem (Усиления)
        this.createCanvas('ui_3d_gem_card', 48, 48, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 48, 48);
            grad.addColorStop(0, '#7e22ce'); grad.addColorStop(1, '#3b0764');
            ctx.fillStyle = grad;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const x = 24 + Math.cos(a) * 21;
                const y = 24 + Math.sin(a) * 21;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#d8b4fe'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.moveTo(24, 10); ctx.lineTo(34, 21); ctx.lineTo(24, 36); ctx.lineTo(14, 21); ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(24, 10); ctx.lineTo(29, 21); ctx.lineTo(24, 31); ctx.closePath();
            ctx.fill();
        });

        // UI 3D Card: Book (Коллекция)
        this.createCanvas('ui_3d_book_card', 48, 48, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 48, 48);
            grad.addColorStop(0, '#92400e'); grad.addColorStop(1, '#451a03');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(8, 7, 32, 34, 4);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(12, 11, 12, 26);
            ctx.fillRect(24, 11, 12, 26);

            ctx.fillStyle = '#d97706';
            ctx.fillRect(22, 7, 4, 34);

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(23, 31, 2, 13);
        });

        // UI 3D Card: Shield (Таблицы Лидеров)
        this.createCanvas('ui_3d_shield_card', 48, 48, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 48, 48);
            grad.addColorStop(0, '#b45309'); grad.addColorStop(1, '#78350f');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(24, 6); ctx.lineTo(39, 11); ctx.lineTo(35, 33); ctx.lineTo(24, 43); ctx.lineTo(13, 33); ctx.lineTo(9, 11); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(24, 11); ctx.lineTo(34, 15); ctx.lineTo(31, 30); ctx.lineTo(24, 38); ctx.lineTo(17, 30); ctx.lineTo(14, 15); ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(24, 22, 5.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Hex Avatar (PLAYER_01)
        this.createCanvas('ui_avatar_hex', 56, 56, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 56, 56);
            grad.addColorStop(0, '#1e1b4b'); grad.addColorStop(1, '#0f172a');
            ctx.fillStyle = grad;
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const x = 28 + Math.cos(a) * 25;
                const y = 28 + Math.sin(a) * 25;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2.5; ctx.stroke();

            // Теневой рыцарь внутри
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.arc(28, 26, 15, 0, Math.PI * 2);
            ctx.fill();

            // Светящиеся глаза
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.ellipse(22, 25, 3.5, 1.8, 0.2, 0, Math.PI * 2);
            ctx.ellipse(34, 25, 3.5, 1.8, -0.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Boss Horn Skull
        this.createCanvas('ui_boss_skull', 36, 36, (ctx) => {
            ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
            ctx.shadowBlur = 8;

            const grad = ctx.createLinearGradient(0, 4, 0, 32);
            grad.addColorStop(0, '#ef4444'); grad.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.arc(18, 17, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(14, 26, 8, 7);

            // Рога
            ctx.beginPath();
            ctx.moveTo(9, 10); ctx.quadraticCurveTo(2, 2, 4, 16); ctx.closePath();
            ctx.moveTo(27, 10); ctx.quadraticCurveTo(34, 2, 32, 16); ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(12, 15, 4, 4);
            ctx.fillRect(20, 15, 4, 4);
        });

        // UI Chest (Сундук сокровищ)
        this.createCanvas('ui_chest', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 6, 0, 30);
            grad.addColorStop(0, '#a16207'); grad.addColorStop(1, '#713f12');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.roundRect(4, 12, 28, 18, 3);
            ctx.fill();

            // Крышка сундука
            ctx.fillStyle = '#ca8a04';
            ctx.beginPath();
            ctx.roundRect(3, 6, 30, 8, 3);
            ctx.fill();

            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(3, 6, 30, 24);

            // Золотой замок
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(18, 18, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(18, 18, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Crossed Swords (Скрещенные мечи - Lucide Swords)
        this.createCanvas('ui_swords', 36, 36, (ctx) => {
            // Меч 1
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(6, 6); ctx.lineTo(30, 30);
            ctx.stroke();

            // Меч 2
            ctx.beginPath();
            ctx.moveTo(30, 6); ctx.lineTo(6, 30);
            ctx.stroke();

            // Гарды
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(4, 11); ctx.lineTo(11, 4);
            ctx.moveTo(32, 11); ctx.lineTo(25, 4);
            ctx.stroke();
        });

        // UI Shield (Щит героя - Lucide Shield)
        this.createCanvas('ui_shield', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 3, 0, 33);
            grad.addColorStop(0, '#6366f1'); grad.addColorStop(1, '#3730a3');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(18, 3);
            ctx.lineTo(31, 7);
            ctx.lineTo(27, 24);
            ctx.lineTo(18, 33);
            ctx.lineTo(9, 24);
            ctx.lineTo(5, 7);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#a5b4fc';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Геральдический крест
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(16.5, 9, 3, 14);
            ctx.fillRect(11, 14, 14, 3);
        });

        // UI Scroll (Свиток заданий - Lucide Scroll)
        this.createCanvas('ui_scroll', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 6, 0, 30);
            grad.addColorStop(0, '#fef3c7'); grad.addColorStop(1, '#fde68a');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.roundRect(6, 6, 24, 24, 4);
            ctx.fill();

            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.8;
            ctx.stroke();

            // Линии рун
            ctx.fillStyle = '#92400e';
            ctx.fillRect(10, 12, 16, 2.5);
            ctx.fillRect(10, 17, 13, 2.5);
            ctx.fillRect(10, 22, 10, 2.5);
        });

        // UI Hourglass (Песочные часы - Lucide Hourglass)
        this.createCanvas('ui_hourglass', 36, 36, (ctx) => {
            const grad = ctx.createLinearGradient(0, 4, 0, 32);
            grad.addColorStop(0, '#0284c7'); grad.addColorStop(1, '#0369a1');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(6, 5); ctx.lineTo(30, 5); ctx.lineTo(18, 18); ctx.lineTo(30, 31); ctx.lineTo(6, 31); ctx.lineTo(18, 18); ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Светящийся песок
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(14, 22, 8, 6);
        });
    }

    static createGlassUIComponents() {
        // 1. PLAY BUTTON (Rich Arcane Purple Gradient + Glossy Pill)
        this.createCanvas('btn_play_bg', 260, 64, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 0, 64);
            grad.addColorStop(0, '#7e22ce');
            grad.addColorStop(0.5, '#6b21a8');
            grad.addColorStop(1, '#581c87');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(2, 2, 256, 60, 16);
            ctx.fill();

            // Inner border glow
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Top gloss
            const gloss = ctx.createLinearGradient(0, 4, 0, 28);
            gloss.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
            ctx.fillStyle = gloss;
            ctx.beginPath();
            ctx.roundRect(4, 4, 252, 24, [14, 14, 4, 4]);
            ctx.fill();
        });

        // 2. CO-OP BUTTON (Celestial Cyan Gradient + Glossy Pill)
        this.createCanvas('btn_coop_bg', 260, 56, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 0, 56);
            grad.addColorStop(0, '#0284c7');
            grad.addColorStop(0.5, '#0369a1');
            grad.addColorStop(1, '#075985');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(2, 2, 256, 52, 14);
            ctx.fill();

            // Inner border glow
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Top gloss
            const gloss = ctx.createLinearGradient(0, 3, 0, 24);
            gloss.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
            ctx.fillStyle = gloss;
            ctx.beginPath();
            ctx.roundRect(4, 3, 252, 20, [12, 12, 4, 4]);
            ctx.fill();
        });

        // 3. SUBMENU GLASS BUTTON (Dark Obsidian Glass)
        this.createCanvas('btn_glass_sub', 260, 36, (ctx) => {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.beginPath();
            ctx.roundRect(1, 1, 258, 34, 10);
            ctx.fill();

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.beginPath();
            ctx.moveTo(12, 2); ctx.lineTo(248, 2);
            ctx.stroke();
        });

        // 4. BATTLE GREEN CTA BUTTON
        this.createCanvas('btn_battle_green', 240, 46, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 0, 46);
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(0.6, '#059669');
            grad.addColorStop(1, '#047857');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(2, 2, 236, 42, 12);
            ctx.fill();

            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2;
            ctx.stroke();

            const gloss = ctx.createLinearGradient(0, 3, 0, 20);
            gloss.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
            ctx.fillStyle = gloss;
            ctx.beginPath();
            ctx.roundRect(4, 3, 232, 16, [10, 10, 3, 3]);
            ctx.fill();
        });

        // 5. UNLOCK GOLD CTA BUTTON
        this.createCanvas('btn_unlock_gold', 240, 46, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 0, 46);
            grad.addColorStop(0, '#f59e0b');
            grad.addColorStop(0.6, '#d97706');
            grad.addColorStop(1, '#b45309');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(2, 2, 236, 42, 12);
            ctx.fill();

            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.stroke();

            const gloss = ctx.createLinearGradient(0, 3, 0, 20);
            gloss.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
            gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
            ctx.fillStyle = gloss;
            ctx.beginPath();
            ctx.roundRect(4, 3, 232, 16, [10, 10, 3, 3]);
            ctx.fill();
        });

        // 6. CARD TAB GLASS (Bottom Navigation Bar)
        this.createCanvas('card_tab_glass', 110, 54, (ctx) => {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
            ctx.beginPath();
            ctx.roundRect(2, 2, 106, 50, 12);
            ctx.fill();

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.beginPath();
            ctx.moveTo(10, 3); ctx.lineTo(100, 3);
            ctx.stroke();
        });

        // 7. WIDGET GLASS PANEL
        this.createCanvas('panel_glass_widget', 275, 200, (ctx) => {
            ctx.fillStyle = 'rgba(11, 15, 25, 0.94)';
            ctx.beginPath();
            ctx.roundRect(2, 2, 271, 196, 14);
            ctx.fill();

            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.beginPath();
            ctx.moveTo(14, 3); ctx.lineTo(261, 3);
            ctx.stroke();
        });

        // 8. CIRCULAR FROSTED CLOSE BUTTON (Ruby Glass with Gold Rim)
        this.createCanvas('btn_close_circle', 34, 34, (ctx) => {
            const grad = ctx.createRadialGradient(17, 17, 2, 17, 17, 16);
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
            grad.addColorStop(0.7, 'rgba(185, 28, 28, 0.92)');
            grad.addColorStop(1, 'rgba(127, 29, 29, 0.98)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(17, 17, 15, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Крестик
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(11, 11); ctx.lineTo(23, 23);
            ctx.moveTo(23, 11); ctx.lineTo(11, 23);
            ctx.stroke();
        });

        // 9. HERO PEDESTAL GLOW (Магический светящийся рунический пьедестал)
        this.createCanvas('hero_pedestal_glow', 160, 50, (ctx) => {
            // Внешнее свечение
            const glow = ctx.createRadialGradient(80, 25, 10, 80, 25, 75);
            glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
            glow.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(80, 25, 78, 22, 0, 0, Math.PI * 2);
            ctx.fill();

            // Каменная плита пьедестала
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.ellipse(80, 25, 64, 16, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(80, 25, 64, 16, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Внутренний рунический овал
            ctx.strokeStyle = 'rgba(255, 209, 102, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(80, 25, 46, 10, 0, 0, Math.PI * 2);
            ctx.stroke();
        });

        // 10. EPIC GOLD CTA BUTTON (В БОЙ / КУПИТЬ)
        this.createCanvas('btn_battle_gold_epic', 260, 52, (ctx) => {
            const grad = ctx.createLinearGradient(0, 0, 0, 52);
            grad.addColorStop(0, '#f59e0b');
            grad.addColorStop(0.3, '#d97706');
            grad.addColorStop(0.7, '#b45309');
            grad.addColorStop(1, '#78350f');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(2, 2, 256, 48, 14);
            ctx.fill();

            // Двойная золотая окантовка
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Внутренний металлический блеск (Gloss)
            const gloss = ctx.createLinearGradient(0, 3, 0, 24);
            gloss.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
            gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
            ctx.fillStyle = gloss;
            ctx.beginPath();
            ctx.roundRect(4, 3, 252, 20, [12, 12, 4, 4]);
            ctx.fill();
        });

        // 11. HIGH-DEFINITION STAT BAR ICONS (Lucide / React-Icons styled vector badges)
        this.createCanvas('stat_icon_hp', 32, 32, (ctx) => {
            const grad = ctx.createRadialGradient(13, 11, 2, 16, 16, 14);
            grad.addColorStop(0, '#fca5a5');
            grad.addColorStop(0.3, '#ef4444');
            grad.addColorStop(0.8, '#b91c1c');
            grad.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(16, 27);
            ctx.bezierCurveTo(5, 19, 3, 8, 10, 5.5);
            ctx.bezierCurveTo(14, 4, 15.5, 6.5, 16, 8);
            ctx.bezierCurveTo(16.5, 6.5, 18, 4, 22, 5.5);
            ctx.bezierCurveTo(29, 8, 27, 19, 16, 27);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#fee2e2';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Глянец
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(11, 9, 3.5, 1.8, -Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
        });

        this.createCanvas('stat_icon_spd', 32, 32, (ctx) => {
            // Золотая молния / Сапог скорости
            const grad = ctx.createLinearGradient(8, 4, 24, 28);
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.5, '#eab308');
            grad.addColorStop(1, '#ca8a04');
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(19, 3);
            ctx.lineTo(8, 15);
            ctx.lineTo(15, 15);
            ctx.lineTo(11, 29);
            ctx.lineTo(24, 14);
            ctx.lineTo(17, 14);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        });

        this.createCanvas('stat_icon_dmg', 32, 32, (ctx) => {
            // Огненный клинок урона
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(7, 25); ctx.lineTo(25, 7);
            ctx.stroke();

            // Пламя на клинке
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(22, 10, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(17, 15, 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Гарда
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(6, 19); ctx.lineTo(13, 26);
            ctx.stroke();
        });

        this.createCanvas('stat_icon_crit', 32, 32, (ctx) => {
            // Прицел / Мишень критического удара
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(16, 16, 10, 0, Math.PI * 2);
            ctx.stroke();

            // Перекрестие
            ctx.strokeStyle = '#f5d0fe';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(16, 3); ctx.lineTo(16, 9);
            ctx.moveTo(16, 23); ctx.lineTo(16, 29);
            ctx.moveTo(3, 16); ctx.lineTo(9, 16);
            ctx.moveTo(23, 16); ctx.lineTo(29, 16);
            ctx.stroke();

            // Красная точка попадания в яблочко
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(16, 16, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(15, 15, 1, 0, Math.PI * 2);
            ctx.fill();
        });

        this.createCanvas('stat_icon_atkspeed', 32, 32, (ctx) => {
            // Скорость атаки (Двойные искры)
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(12, 4); ctx.lineTo(6, 16); ctx.lineTo(12, 16); ctx.lineTo(8, 28); ctx.lineTo(18, 14); ctx.lineTo(12, 14); ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#818cf8';
            ctx.beginPath();
            ctx.moveTo(22, 6); ctx.lineTo(17, 16); ctx.lineTo(21, 16); ctx.lineTo(18, 26); ctx.lineTo(26, 15); ctx.lineTo(22, 15); ctx.closePath();
            ctx.fill();
        });

        this.createCanvas('stat_icon_area', 32, 32, (ctx) => {
            // Магнит / Радиус действия
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.arc(16, 18, 9, Math.PI, 0, false);
            ctx.stroke();

            // Полюса магнита
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(5, 18, 4.5, 6);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(22.5, 18, 4.5, 6);
        });

        this.createCanvas('stat_icon_regen', 32, 32, (ctx) => {
            // Регенерация (Изумрудное сердце с крестом)
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(12, 12, 7, 0, Math.PI * 2);
            ctx.arc(20, 12, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(6, 15); ctx.lineTo(26, 15); ctx.lineTo(16, 27); ctx.closePath();
            ctx.fill();

            // Белый крест исцеления
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(14.5, 9, 3, 10);
            ctx.fillRect(11, 12.5, 10, 3);
        });

        this.createCanvas('stat_icon_luck', 32, 32, (ctx) => {
            // Удача (4-листный клевер)
            ctx.fillStyle = '#22c55e';
            const leaves = [{x:11, y:11}, {x:21, y:11}, {x:11, y:21}, {x:21, y:21}];
            leaves.forEach(l => {
                ctx.beginPath();
                ctx.arc(l.x, l.y, 4.5, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(16, 16); ctx.quadraticCurveTo(14, 28, 9, 29);
            ctx.stroke();
        });
    }

    /**
     * Алгоритм автоматического удаления черного фона (Alpha Keying) для сгенерированных артов
     */
    static makeTextureTransparent(scene, key, isCircle = false) {
        if (!scene.textures.exists(key)) return;
        const srcImg = scene.textures.get(key).getSourceImage();
        if (!srcImg) return;

        const canvas = document.createElement('canvas');
        canvas.width = srcImg.width || 512;
        canvas.height = srcImg.height || 512;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(srcImg, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) / 2;

        const cornerBrightness = [
            (data[0] + data[1] + data[2]) / 3,
            (data[(w - 1) * 4] + data[(w - 1) * 4 + 1] + data[(w - 1) * 4 + 2]) / 3,
            (data[(h - 1) * w * 4] + data[(h - 1) * w * 4 + 1] + data[(h - 1) * w * 4 + 2]) / 3,
            (data[((h - 1) * w + w - 1) * 4] + data[((h - 1) * w + w - 1) * 4 + 1] + data[((h - 1) * w + w - 1) * 4 + 2]) / 3
        ];
        const avgCorner = (cornerBrightness[0] + cornerBrightness[1] + cornerBrightness[2] + cornerBrightness[3]) / 4;
        const isDarkBg = avgCorner < 128;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];

                if (isCircle) {
                    const dist = Math.hypot(x - cx, y - cy);
                    if (dist > radius - 2) {
                        data[idx + 3] = 0;
                        continue;
                    } else if (dist > radius - 8) {
                        data[idx + 3] = Math.floor(data[idx + 3] * ((radius - 2 - dist) / 6));
                    }
                }

                if (isDarkBg) {
                    const maxVal = Math.max(r, g, b);
                    if (maxVal <= 24) {
                        data[idx + 3] = 0;
                    } else if (maxVal < 60) {
                        const alphaRatio = (maxVal - 24) / 36;
                        data[idx + 3] = Math.floor(data[idx + 3] * alphaRatio);
                    }
                } else {
                    const minVal = Math.min(r, g, b);
                    if (minVal >= 235) {
                        data[idx + 3] = 0;
                    } else if (minVal > 200) {
                        const alphaRatio = (235 - minVal) / 35;
                        data[idx + 3] = Math.floor(data[idx + 3] * alphaRatio);
                    }
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
        scene.textures.remove(key);
        scene.textures.addCanvas(key, canvas);
    }
}

window.TextureGenerator = TextureGenerator;

