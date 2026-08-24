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

    // --- HEROES (МИНИМАЛИСТИЧНЫЙ АУТЕНТИЧНЫЙ ПИКСЕЛЬ-АРТ) ---
    static createKnight() {
        this.createCanvas('hero_knight', 32, 32, (ctx) => {
            ctx.clearRect(0, 0, 32, 32);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            // Развевающийся алый плащ за спиной
            p(4, 15, '#7f1d1d', 4, 15);
            p(3, 19, '#991b1b', 3, 10);
            p(5, 17, '#dc2626', 2, 11);

            // Королевский щит (Левая рука)
            p(2, 16, '#0b0f19', 6, 9); // Контур
            p(3, 17, '#f59e0b', 4, 7); // Золотой обод
            p(4, 18, '#1e3a8a', 2, 5); // Синее поле
            p(4, 19, '#38bdf8', 2, 3); // Сапфировый герб
            p(4, 20, '#ffffff', 2, 1);

            // Золотой плюмаж и алое перо
            p(15, 0, '#ef4444', 2, 4);
            p(14, 1, '#f59e0b', 4, 3);
            p(15, 3, '#fef08a', 2, 2);

            // Шлем (Купол и полированная сталь)
            p(12, 3, '#0b0f19', 8, 2);
            p(10, 4, '#0b0f19', 12, 10);
            p(11, 4, '#cbd5e1', 10, 9);
            p(12, 4, '#f1f5f9', 3, 4);
            p(17, 4, '#94a3b8', 4, 9);
            
            // Забрало и светящиеся бирюзовые глаза
            p(11, 8, '#090d16', 10, 3);
            p(13, 9, '#38bdf8', 2, 1);
            p(17, 9, '#38bdf8', 2, 1);
            p(14, 9, '#ffffff', 1, 1);
            p(18, 9, '#ffffff', 1, 1);

            // Золотые наплечники
            p(7, 13, '#0b0f19', 5, 4);
            p(8, 14, '#f59e0b', 3, 3);
            p(8, 14, '#fef08a', 2, 1);

            p(20, 13, '#0b0f19', 5, 4);
            p(21, 14, '#f59e0b', 3, 3);
            p(22, 14, '#fef08a', 2, 1);

            // Латы и крестоносный нагрудник
            p(10, 13, '#0b0f19', 12, 10);
            p(11, 14, '#94a3b8', 10, 8);
            p(11, 14, '#cbd5e1', 4, 8);
            
            // Золотой крест на кирасе
            p(15, 14, '#f59e0b', 2, 8);
            p(12, 16, '#f59e0b', 8, 2);
            p(15, 15, '#fef08a', 2, 3);
            p(13, 16, '#fef08a', 6, 1);

            // Ремень с золотой пряжкой
            p(10, 22, '#78350f', 12, 2);
            p(15, 22, '#fde047', 2, 2);

            // Рунический меч (Правая рука)
            p(24, 18, '#78350f', 2, 4); // Рукоять
            p(22, 17, '#f59e0b', 6, 2); // Гарда
            p(24, 22, '#f59e0b', 2, 2); // Навершие
            p(24, 2, '#0b0f19', 2, 15);  // Контур клинка
            p(24, 3, '#e2e8f0', 2, 14);  // Стальное лезвие
            p(25, 3, '#ffffff', 1, 13);  // Заточка / Блик
            p(24, 6, '#38bdf8', 1, 8);   // Руническое свечение

            // Поножи и сапоги
            p(11, 24, '#0b0f19', 4, 7);
            p(17, 24, '#0b0f19', 4, 7);
            p(12, 25, '#94a3b8', 3, 5);
            p(18, 25, '#94a3b8', 3, 5);
            p(12, 25, '#cbd5e1', 1, 4);
            p(18, 25, '#cbd5e1', 1, 4);

            // Стальные сабатоны (Стопы)
            p(10, 29, '#475569', 5, 3);
            p(17, 29, '#475569', 5, 3);
            p(11, 30, '#cbd5e1', 3, 1);
            p(18, 30, '#cbd5e1', 3, 1);
        });
    }

    static createArcher() {
        this.createCanvas('hero_archer', 32, 32, (ctx) => {
            ctx.clearRect(0, 0, 32, 32);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            // Колчан и стрелы за плечом
            p(7, 5, '#78350f', 4, 13);
            p(6, 3, '#fde047', 2, 3);
            p(8, 1, '#fde047', 2, 4);
            p(9, 3, '#ffffff', 1, 2);

            // Изумрудный капюшон
            p(12, 2, '#064e3b', 8, 2);
            p(10, 4, '#064e3b', 12, 10);
            p(11, 4, '#059669', 10, 8);
            p(12, 4, '#10b981', 4, 4);

            // Золотое перо в капюшоне
            p(18, 0, '#f59e0b', 3, 4);
            p(19, 0, '#fef08a', 2, 2);

            // Лицо эльфа
            p(12, 9, '#fed7aa', 8, 4);
            p(11, 9, '#fbb066', 1, 3);
            
            // Светящиеся изумрудные глаза
            p(13, 10, '#22c55e', 2, 1);
            p(17, 10, '#22c55e', 2, 1);
            p(13, 10, '#ffffff', 1, 1);
            p(17, 10, '#ffffff', 1, 1);

            // Плащ и охотничий колет
            p(9, 13, '#064e3b', 14, 10);
            p(10, 14, '#047857', 12, 8);
            p(11, 15, '#10b981', 5, 6);

            // Кожаный ремень через плечо с пряжкой
            p(10, 14, '#78350f', 2, 2);
            p(12, 16, '#78350f', 2, 2);
            p(14, 18, '#78350f', 2, 2);
            p(16, 20, '#78350f', 2, 2);
            p(13, 17, '#fde047', 2, 2);

            // Пояс
            p(10, 22, '#78350f', 12, 2);
            p(15, 22, '#f59e0b', 2, 2);

            // Изогнутый золотой композитный лук (Правая рука)
            p(26, 5, '#d97706', 2, 2);
            p(25, 7, '#f59e0b', 2, 4);
            p(24, 11, '#fbbf24', 2, 8);
            p(25, 19, '#f59e0b', 2, 4);
            p(26, 23, '#d97706', 2, 2);

            // Тетива и сияющая стрела
            p(27, 6, '#38bdf8', 1, 18);
            p(20, 15, '#ffffff', 9, 1);
            p(28, 14, '#fde047', 2, 3);
            p(19, 14, '#38bdf8', 2, 3);

            // Ноги и сапоги следопыта
            p(11, 24, '#064e3b', 4, 5);
            p(17, 24, '#064e3b', 4, 5);
            p(11, 28, '#78350f', 4, 4);
            p(17, 28, '#78350f', 4, 4);
            p(11, 29, '#b45309', 4, 1);
            p(17, 29, '#b45309', 4, 1);
        });
    }

    static createMage() {
        this.createCanvas('hero_mage', 32, 32, (ctx) => {
            ctx.clearRect(0, 0, 32, 32);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            // Остроконечная фиолетовая шляпа мага
            p(15, 0, '#581c87', 2, 3);
            p(14, 3, '#6b21a8', 4, 3);
            p(13, 6, '#7c3aed', 6, 3);
            p(10, 9, '#581c87', 12, 2);
            p(8, 10, '#3b0764', 16, 2);

            // Золотая лента с рубином на шляпе
            p(11, 8, '#f59e0b', 10, 2);
            p(15, 8, '#ef4444', 2, 2);
            p(15, 8, '#fca5a5', 1, 1);

            // Лицо и горящие сапфировые глаза
            p(12, 11, '#fed7aa', 8, 3);
            p(13, 11, '#00f5d4', 2, 1);
            p(17, 11, '#00f5d4', 2, 1);
            p(13, 11, '#ffffff', 1, 1);
            p(17, 11, '#ffffff', 1, 1);

            // Седая борода архимага
            p(11, 13, '#f8fafc', 10, 4);
            p(12, 17, '#e2e8f0', 8, 3);
            p(13, 20, '#cbd5e1', 6, 3);
            p(14, 23, '#94a3b8', 4, 2);

            // Аметистово-алая мантия
            p(9, 14, '#3b0764', 14, 15);
            p(8, 21, '#2e1065', 16, 8);
            p(10, 15, '#be123c', 4, 13);
            p(18, 15, '#be123c', 4, 13);
            p(11, 16, '#dc2626', 2, 11);
            p(19, 16, '#dc2626', 2, 11);

            // Огненный посох (Правая рука)
            p(25, 7, '#78350f', 2, 22);
            p(24, 5, '#f59e0b', 4, 3);

            // Пылающая сфера пламени
            p(23, 0, '#991b1b', 6, 6);
            p(24, 1, '#ea580c', 4, 4);
            p(25, 2, '#facc15', 2, 2);
            p(25, 2, '#ffffff', 1, 1);

            // Искры магии огня
            p(22, 1, '#f97316', 1, 1);
            p(29, 0, '#fde047', 1, 1);
            p(26, -1, '#ef4444', 1, 1);
            p(30, 3, '#fb923c', 1, 1);

            // Подол мантии
            p(7, 29, '#1e1b4b', 18, 2);
            p(9, 30, '#0f172a', 14, 2);
        });
    }

    static createNinja() {
        this.createCanvas('hero_ninja', 32, 32, (ctx) => {
            ctx.clearRect(0, 0, 32, 32);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            // Развевающаяся алая лента повязки
            p(3, 7, '#e11d48', 7, 2);
            p(1, 9, '#be123c', 5, 2);
            p(0, 11, '#9f1239', 3, 2);

            // Маска и капюшон шиноби
            p(11, 3, '#090d16', 10, 10);
            p(12, 4, '#1e293b', 8, 8);

            // Алая повязка на лоб
            p(10, 6, '#e11d48', 12, 2);
            p(15, 5, '#94a3b8', 2, 3);
            p(15, 5, '#e2e8f0', 1, 1);

            // Неоновые бирюзовые глаза
            p(13, 8, '#00f5d4', 2, 1);
            p(17, 8, '#00f5d4', 2, 1);
            p(13, 8, '#ffffff', 1, 1);
            p(17, 8, '#ffffff', 1, 1);

            // Теневой доспех
            p(9, 13, '#090d16', 14, 10);
            p(10, 14, '#1e293b', 12, 8);
            p(12, 14, '#334155', 8, 6);

            // Серебряная эмблема на груди
            p(15, 15, '#cbd5e1', 2, 4);
            p(13, 16, '#e2e8f0', 6, 2);
            p(15, 16, '#ffffff', 2, 1);

            // Парные катаны за спиной
            p(6, 2, '#94a3b8', 2, 15);
            p(5, 14, '#e11d48', 3, 2);
            p(24, 2, '#94a3b8', 2, 15);
            p(24, 14, '#e11d48', 3, 2);

            // Четырехконечный сюрикен в руке
            p(25, 16, '#0f172a', 6, 6);
            p(26, 15, '#cbd5e1', 4, 8);
            p(24, 17, '#cbd5e1', 8, 4);
            p(27, 18, '#38bdf8', 2, 2);
            p(27, 18, '#ffffff', 1, 1);

            // Пояс
            p(10, 22, '#be123c', 12, 2);

            // Таби и поножи
            p(11, 24, '#0f172a', 4, 5);
            p(17, 24, '#0f172a', 4, 5);
            p(11, 28, '#1e293b', 4, 3);
            p(17, 28, '#1e293b', 4, 3);
            p(10, 30, '#090d16', 5, 2);
            p(17, 30, '#090d16', 5, 2);
        });
    }

    static createNecromancer() {
        const drawNecro = (ctx) => {
            ctx.clearRect(0, 0, 32, 32);
            const p = (x, y, color, w = 1, h = 1) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, h);
            };

            // Эфирные души / зеленые огоньки вокруг
            p(3, 12, '#34d399', 2, 2);
            p(4, 11, '#a7f3d0', 1, 1);
            p(28, 20, '#10b981', 2, 2);
            p(29, 19, '#6ee7b7', 1, 1);

            // Капюшон темного культа
            p(11, 2, '#180828', 10, 11);
            p(12, 3, '#2e1065', 8, 9);
            p(13, 3, '#4c1d95', 4, 4);

            // Костяная маска-череп
            p(12, 7, '#f8fafc', 8, 7);
            p(13, 13, '#cbd5e1', 6, 2);

            // Глазницы со светящимся токсичным пламенем
            p(13, 9, '#090d16', 2, 2);
            p(17, 9, '#090d16', 2, 2);
            p(13, 9, '#10b981', 1, 1);
            p(17, 9, '#10b981', 1, 1);
            p(13, 10, '#a7f3d0', 1, 1);
            p(17, 10, '#a7f3d0', 1, 1);

            // Рваная мантия лича
            p(9, 13, '#180828', 14, 16);
            p(10, 14, '#2e1065', 12, 14);
            p(12, 15, '#3b0764', 8, 10);

            // Костяной амулет-ребра
            p(13, 15, '#cbd5e1', 6, 1);
            p(12, 17, '#cbd5e1', 8, 1);
            p(13, 19, '#cbd5e1', 6, 1);
            p(15, 16, '#10b981', 2, 3);

            // Древняя костяная коса душ (Правая рука)
            p(25, 4, '#475569', 2, 25);
            p(24, 2, '#cbd5e1', 4, 4);
            
            // Изогнутое лезвие косы
            p(25, 0, '#f8fafc', 7, 3);
            p(28, 2, '#34d399', 4, 3);
            p(30, 5, '#10b981', 2, 3);
            p(31, 7, '#059669', 1, 2);

            // Призрачный рваный подол (Парение)
            p(8, 28, '#090314', 4, 3);
            p(13, 27, '#090314', 6, 4);
            p(20, 28, '#090314', 4, 3);
            p(10, 29, '#10b981', 2, 2);
            p(18, 30, '#10b981', 2, 2);
        };

        this.createCanvas('hero_necromancer', 32, 32, drawNecro);
        this.createCanvas('hero_necro', 32, 32, drawNecro);
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

    // --- ICONS ---
    static createIcons() {
        const createSquareIcon = (key, baseColor, isSuper, symbolDraw) => {
            this.createCanvas(key, 48, 48, (ctx) => {
                // Тёмный обсидиановый контейнер со скруглёнными углами
                ctx.fillStyle = '#090d16';
                ctx.beginPath();
                ctx.roundRect(1, 1, 46, 46, 8);
                ctx.fill();

                // Внутренняя цветная пластина с градиентом
                const grad = ctx.createLinearGradient(4, 4, 44, 44);
                grad.addColorStop(0, baseColor);
                grad.addColorStop(1, '#0f172a');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(3, 3, 42, 42, 7);
                ctx.fill();

                // Верхний стеклянный блик (Gloss)
                const gloss = ctx.createLinearGradient(0, 3, 0, 22);
                gloss.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
                gloss.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
                ctx.fillStyle = gloss;
                ctx.beginPath();
                ctx.roundRect(4, 4, 40, 18, [6, 6, 2, 2]);
                ctx.fill();

                // Металлическая окантовка (Золотая для эволюций, серебряная для базовых)
                ctx.strokeStyle = isSuper ? '#ffd166' : '#475569';
                ctx.lineWidth = isSuper ? 2 : 1.5;
                ctx.beginPath();
                ctx.roundRect(2, 2, 44, 44, 8);
                ctx.stroke();

                // Отрисовка символа
                symbolDraw(ctx);
            });
        };

        // 1. БАЗОВОЕ ОРУЖИЕ
        createSquareIcon('icon_sword', '#1e40af', false, (ctx) => {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(24, 7); ctx.lineTo(27, 12); ctx.lineTo(27, 30); ctx.lineTo(21, 30); ctx.lineTo(21, 12); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(23, 10, 2, 20);
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(16, 30, 16, 3);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(22, 33, 4, 8);
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(24, 42, 3, 0, Math.PI * 2); ctx.fill();
        });

        createSquareIcon('icon_bow', '#166534', false, (ctx) => {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.arc(20, 24, 15, -Math.PI * 0.45, Math.PI * 0.45);
            ctx.stroke();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(22, 10); ctx.lineTo(22, 38);
            ctx.stroke();
            // Стрела
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(12, 23, 22, 2);
            ctx.beginPath(); ctx.moveTo(34, 24); ctx.lineTo(28, 20); ctx.lineTo(28, 28); ctx.closePath(); ctx.fill();
        });

        createSquareIcon('icon_fireball', '#991b1b', false, (ctx) => {
            const rad = ctx.createRadialGradient(24, 24, 2, 24, 24, 14);
            rad.addColorStop(0, '#ffffff');
            rad.addColorStop(0.3, '#fef08a');
            rad.addColorStop(0.7, '#f97316');
            rad.addColorStop(1, '#dc2626');
            ctx.fillStyle = rad;
            ctx.beginPath();
            ctx.arc(24, 24, 14, 0, Math.PI * 2);
            ctx.fill();
        });

        createSquareIcon('icon_shuriken', '#581c87', false, (ctx) => {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.moveTo(24, 6); ctx.lineTo(27, 21); ctx.lineTo(42, 24); ctx.lineTo(27, 27);
            ctx.lineTo(24, 42); ctx.lineTo(21, 27); ctx.lineTo(6, 24); ctx.lineTo(21, 21);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.beginPath(); ctx.arc(24, 24, 4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 1.5; ctx.stroke();
        });

        createSquareIcon('icon_lightning', '#0369a1', false, (ctx) => {
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.moveTo(27, 6); ctx.lineTo(15, 23); ctx.lineTo(25, 23);
            ctx.lineTo(19, 42); ctx.lineTo(33, 21); ctx.lineTo(23, 21);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.stroke();
        });

        createSquareIcon('icon_poison', '#15803d', false, (ctx) => {
            ctx.fillStyle = '#84cc16';
            ctx.beginPath(); ctx.arc(20, 26, 9, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(28, 22, 10, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(22, 16, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ecfccb';
            ctx.beginPath(); ctx.arc(26, 20, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(18, 25, 2, 0, Math.PI * 2); ctx.fill();
        });

        // 2. СУПЕР-ОРУЖИЕ (ЭВОЛЮЦИИ)
        createSquareIcon('icon_super_blade', '#1e3a8a', true, (ctx) => {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(22, 6, 4, 36);
            ctx.fillRect(6, 22, 36, 4);
            ctx.fillStyle = '#fef08a';
            ctx.beginPath(); ctx.arc(24, 24, 7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
        });

        createSquareIcon('icon_super_bow', '#065f46', true, (ctx) => {
            ctx.strokeStyle = '#34d399'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(18, 24, 15, -Math.PI * 0.45, Math.PI * 0.45); ctx.stroke();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(18, 22, 22, 4);
            ctx.fillRect(18, 14, 18, 3);
            ctx.fillRect(18, 30, 18, 3);
        });

        createSquareIcon('icon_super_meteor', '#7f1d1d', true, (ctx) => {
            const rad = ctx.createRadialGradient(24, 24, 3, 24, 24, 16);
            rad.addColorStop(0, '#ffffff');
            rad.addColorStop(0.3, '#fef08a');
            rad.addColorStop(0.7, '#f97316');
            rad.addColorStop(1, '#7f1d1d');
            ctx.fillStyle = rad;
            ctx.beginPath(); ctx.arc(24, 24, 15, 0, Math.PI * 2); ctx.fill();
        });

        createSquareIcon('icon_super_shuriken', '#581c87', true, (ctx) => {
            ctx.fillStyle = '#c084fc';
            ctx.fillRect(21, 6, 6, 36);
            ctx.fillRect(6, 21, 36, 6);
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(24, 24, 8, 0, Math.PI * 2); ctx.fill();
        });

        createSquareIcon('icon_super_lightning', '#0c4a6e', true, (ctx) => {
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.moveTo(29, 5); ctx.lineTo(13, 24); ctx.lineTo(26, 24);
            ctx.lineTo(17, 43); ctx.lineTo(35, 19); ctx.lineTo(22, 19);
            ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
        });

        createSquareIcon('icon_super_poison', '#14532d', true, (ctx) => {
            ctx.fillStyle = '#a3e635';
            ctx.beginPath(); ctx.arc(24, 24, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#4ade80';
            ctx.beginPath(); ctx.arc(24, 24, 8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(24, 24, 3, 0, Math.PI * 2); ctx.fill();
        });

        // 3. ПАССИВНЫЕ НАВЫКИ И ТАЛАНТЫ
        createSquareIcon('icon_might', '#991b1b', false, (ctx) => {
            // Меч силы
            ctx.fillStyle = '#fca5a5';
            ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(28, 14); ctx.lineTo(28, 30); ctx.lineTo(20, 30); ctx.lineTo(20, 14); ctx.closePath(); ctx.fill();
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(16, 30, 16, 4);
            ctx.fillStyle = '#78350f';
            ctx.fillRect(22, 34, 4, 8);
        });

        createSquareIcon('icon_boots', '#15803d', false, (ctx) => {
            // Крылатый сапог ветра
            ctx.fillStyle = '#86efac';
            ctx.beginPath();
            ctx.moveTo(14, 14); ctx.lineTo(26, 14); ctx.lineTo(26, 26); ctx.lineTo(36, 30); ctx.lineTo(36, 36); ctx.lineTo(14, 36); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5; ctx.stroke();
        });

        createSquareIcon('icon_magnet', '#0369a1', false, (ctx) => {
            // Магнит
            ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 6;
            ctx.beginPath(); ctx.arc(24, 22, 11, Math.PI, 0, false); ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, 22, 6, 8);
            ctx.fillRect(22, 22, 6, 8);
        });

        createSquareIcon('icon_vitality', '#be123c', false, (ctx) => {
            // Рунический крест жизни
            ctx.fillStyle = '#fda4af';
            ctx.fillRect(20, 10, 8, 28);
            ctx.fillRect(10, 20, 28, 8);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.strokeRect(20, 10, 8, 28); ctx.strokeRect(10, 20, 28, 8);
        });

        createSquareIcon('icon_gloves', '#86198f', false, (ctx) => {
            // Перчатки ловкости
            ctx.fillStyle = '#f0abfc';
            ctx.beginPath(); ctx.roundRect(14, 14, 20, 22, 6); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.fillRect(10, 18, 8, 8);
        });

        createSquareIcon('icon_clover', '#15803d', false, (ctx) => {
            // 4-листный клевер удачи
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(19, 18, 6, 0, Math.PI * 2); ctx.arc(29, 18, 6, 0, Math.PI * 2);
            ctx.arc(19, 28, 6, 0, Math.PI * 2); ctx.arc(29, 28, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(24, 24); ctx.lineTo(24, 38); ctx.stroke();
        });

        createSquareIcon('icon_heart', '#991b1b', false, (ctx) => {
            // Регенерация (Сердце)
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(24, 38);
            ctx.bezierCurveTo(12, 26, 10, 14, 24, 14);
            ctx.bezierCurveTo(38, 14, 36, 26, 24, 38);
            ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.fillRect(18, 18, 4, 4);
        });

        createSquareIcon('icon_coin', '#b45309', false, (ctx) => {
            // Золото (Мешок с монетами)
            ctx.fillStyle = '#ffd166';
            ctx.beginPath(); ctx.arc(24, 24, 15, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#d97706'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#78350f'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('$', 24, 24);
        });

        createSquareIcon('icon_revive', '#0f766e', false, (ctx) => {
            // Второе дыхание (Крест возрождения)
            ctx.fillStyle = '#2dd4bf';
            ctx.beginPath(); ctx.arc(24, 24, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(21, 13, 6, 22);
            ctx.fillRect(13, 21, 22, 6);
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

    // --- CLEAN UI VECTOR BADGES ---
    static createUIIcons() {
        // UI Skull Icon (Череп)
        this.createCanvas('ui_skull', 22, 22, (ctx) => {
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(11, 9, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(8, 14, 6, 6);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(7, 8, 3, 4);
            ctx.fillRect(12, 8, 3, 4);
            ctx.fillRect(9, 17, 1, 3);
            ctx.fillRect(12, 17, 1, 3);
        });

        // UI Coin Icon (Монета)
        this.createCanvas('ui_coin', 22, 22, (ctx) => {
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            ctx.arc(11, 11, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#b45309';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('$', 8, 15);
        });

        // UI Gem Icon (Кристалл душ)
        this.createCanvas('ui_gem', 24, 24, (ctx) => {
            ctx.fillStyle = '#9333ea';
            ctx.beginPath();
            ctx.moveTo(12, 3);
            ctx.lineTo(20, 9);
            ctx.lineTo(12, 21);
            ctx.lineTo(4, 9);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#d8b4fe';
            ctx.beginPath();
            ctx.moveTo(12, 3);
            ctx.lineTo(16, 9);
            ctx.lineTo(12, 17);
            ctx.lineTo(8, 9);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // UI Clock Icon (Часы)
        this.createCanvas('ui_clock', 22, 22, (ctx) => {
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(11, 12, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(9, 2, 4, 3);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(11, 12); ctx.lineTo(11, 7);
            ctx.moveTo(11, 12); ctx.lineTo(14, 12);
            ctx.stroke();
        });

        // UI Heart Icon (Сердце)
        this.createCanvas('ui_heart', 22, 22, (ctx) => {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.moveTo(11, 19);
            ctx.bezierCurveTo(4, 13, 3, 5, 11, 5);
            ctx.bezierCurveTo(19, 5, 18, 13, 11, 19);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(7, 7, 2, 2);
        });

        // UI Trophy Icon (Кубок / Квесты)
        this.createCanvas('ui_trophy', 22, 22, (ctx) => {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(6, 4); ctx.lineTo(16, 4); ctx.lineTo(14, 13); ctx.lineTo(8, 13); ctx.closePath();
            ctx.fill();
            ctx.fillRect(10, 13, 2, 4);
            ctx.fillRect(7, 17, 8, 3);
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(4, 5, 14, 7);
        });

        // UI Book Icon (Книга рецептов)
        this.createCanvas('ui_book', 22, 22, (ctx) => {
            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.roundRect(4, 3, 14, 16, 2);
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(10, 3, 3, 8); // закладка
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(6, 14, 10, 2);
        });

        // UI Star Icon (Таланты)
        this.createCanvas('ui_star', 22, 22, (ctx) => {
            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(11, 11, 9, 0, Math.PI * 2);
            ctx.fill();

            // 5-лучевая звезда через vector path
            ctx.fillStyle = '#ffd166';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = 11 + Math.cos(a) * 6;
                const y = 11 + Math.sin(a) * 6;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        });

        // UI Play Icon
        this.createCanvas('ui_play', 22, 22, (ctx) => {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(7, 4); ctx.lineTo(18, 11); ctx.lineTo(7, 18); ctx.closePath();
            ctx.fill();
        });

        // UI Co-op Icon
        this.createCanvas('ui_coop', 22, 22, (ctx) => {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(8, 7, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(4, 12, 8, 7);

            ctx.fillStyle = '#a855f7';
            ctx.beginPath();
            ctx.arc(15, 7, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(11, 12, 8, 7);
        });

        // UI Pause Icon
        this.createCanvas('ui_pause', 22, 22, (ctx) => {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(6, 4, 4, 14);
            ctx.fillRect(12, 4, 4, 14);
        });

        // UI Sound On / Off Icons
        this.createCanvas('ui_sound_on', 22, 22, (ctx) => {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(4, 8); ctx.lineTo(8, 8); ctx.lineTo(12, 4); ctx.lineTo(12, 18); ctx.lineTo(8, 14); ctx.lineTo(4, 14); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(12, 11, 5, -Math.PI * 0.3, Math.PI * 0.3);
            ctx.stroke();
        });

        this.createCanvas('ui_sound_off', 22, 22, (ctx) => {
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.moveTo(4, 8); ctx.lineTo(8, 8); ctx.lineTo(12, 4); ctx.lineTo(12, 18); ctx.lineTo(8, 14); ctx.lineTo(4, 14); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(3, 3); ctx.lineTo(19, 19);
            ctx.stroke();
        });

        // UI Settings Gear (Шестеренка)
        this.createCanvas('ui_settings', 24, 24, (ctx) => {
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.arc(12, 12, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#94a3b8';
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const x1 = 12 + Math.cos(angle) * 5;
                const y1 = 12 + Math.sin(angle) * 5;
                const x2 = 12 + Math.cos(angle) * 9;
                const y2 = 12 + Math.sin(angle) * 9;
                ctx.beginPath();
                ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(12, 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // UI Stats Chart (График лидерборда)
        this.createCanvas('ui_chart', 24, 24, (ctx) => {
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(4, 13, 4, 8);
            ctx.fillRect(10, 8, 4, 13);
            ctx.fillRect(16, 3, 4, 18);
        });

        // UI Socials: Discord, VK, YouTube
        this.createCanvas('ui_discord', 24, 24, (ctx) => {
            ctx.fillStyle = '#5865f2';
            ctx.beginPath();
            ctx.roundRect(2, 2, 20, 20, 5);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(8, 12, 2.5, 0, Math.PI*2);
            ctx.arc(16, 12, 2.5, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(7, 16); ctx.quadraticCurveTo(12, 18, 17, 16);
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
        });

        this.createCanvas('ui_vk', 24, 24, (ctx) => {
            ctx.fillStyle = '#0077ff';
            ctx.beginPath();
            ctx.roundRect(2, 2, 20, 20, 5);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('VK', 4, 16);
        });

        this.createCanvas('ui_youtube', 24, 24, (ctx) => {
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.roundRect(2, 4, 20, 16, 4);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(9, 7); ctx.lineTo(16, 12); ctx.lineTo(9, 17); ctx.closePath();
            ctx.fill();
        });

        // UI Quest Badges (Круглые цветные бейджи для заданий)
        this.createCanvas('ui_badge_skull', 32, 32, (ctx) => {
            ctx.fillStyle = '#0c4a6e';
            ctx.beginPath(); ctx.arc(16, 16, 15, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath(); ctx.arc(16, 14, 7, 0, Math.PI*2); ctx.fill();
            ctx.fillRect(13, 19, 6, 4);
            ctx.fillStyle = '#0c4a6e';
            ctx.fillRect(12, 13, 3, 3); ctx.fillRect(17, 13, 3, 3);
        });

        this.createCanvas('ui_badge_chest', 32, 32, (ctx) => {
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath(); ctx.arc(16, 16, 15, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(8, 12, 16, 10);
            ctx.fillStyle = '#67e8f9';
            ctx.fillRect(8, 9, 16, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(15, 14, 2, 3);
        });

        this.createCanvas('ui_badge_xp', 32, 32, (ctx) => {
            ctx.fillStyle = '#064e3b';
            ctx.beginPath(); ctx.arc(16, 16, 15, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('XP', 16, 16);
        });

        // UI Battle Pass Rank 15 Hex Badge
        this.createCanvas('ui_badge_rank15', 38, 38, (ctx) => {
            ctx.fillStyle = '#581c87';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const x = 19 + Math.cos(a) * 17;
                const y = 19 + Math.sin(a) * 17;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#e9d5ff';
            ctx.beginPath();
            ctx.moveTo(19, 8); ctx.lineTo(26, 16); ctx.lineTo(19, 28); ctx.lineTo(12, 16); ctx.closePath();
            ctx.fill();
        });

        // UI 3D Card: Gem (Усиления)
        this.createCanvas('ui_3d_gem_card', 44, 44, (ctx) => {
            ctx.fillStyle = '#7e22ce';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const x = 22 + Math.cos(a) * 19;
                const y = 22 + Math.sin(a) * 19;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#d8b4fe';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.moveTo(22, 9); ctx.lineTo(31, 19); ctx.lineTo(22, 33); ctx.lineTo(13, 19); ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(22, 9); ctx.lineTo(27, 19); ctx.lineTo(22, 28); ctx.closePath();
            ctx.fill();
        });

        // UI 3D Card: Book (Коллекция)
        this.createCanvas('ui_3d_book_card', 44, 44, (ctx) => {
            ctx.fillStyle = '#92400e';
            ctx.beginPath();
            ctx.roundRect(8, 7, 28, 30, 3);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(11, 10, 11, 24);
            ctx.fillRect(22, 10, 11, 24);

            ctx.fillStyle = '#d97706';
            ctx.fillRect(20, 7, 4, 30);

            ctx.fillStyle = '#ef4444';
            ctx.fillRect(21, 28, 2, 12);
        });

        // UI 3D Card: Shield (Таблицы Лидеров)
        this.createCanvas('ui_3d_shield_card', 44, 44, (ctx) => {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.moveTo(22, 5); ctx.lineTo(36, 10); ctx.lineTo(32, 30); ctx.lineTo(22, 39); ctx.lineTo(12, 30); ctx.lineTo(8, 10); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.moveTo(22, 9); ctx.lineTo(31, 13); ctx.lineTo(28, 27); ctx.lineTo(22, 34); ctx.lineTo(16, 27); ctx.lineTo(13, 13); ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(22, 20, 5, 0, Math.PI*2);
            ctx.fill();
        });

        // UI Hex Avatar (PLAYER_01)
        this.createCanvas('ui_avatar_hex', 52, 52, (ctx) => {
            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                const x = 26 + Math.cos(a) * 23;
                const y = 26 + Math.sin(a) * 23;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Теневой рыцарь внутри
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.arc(26, 24, 14, 0, Math.PI*2);
            ctx.fill();

            // Светящиеся глаза
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(21, 23, 3, 1.5, 0.2, 0, Math.PI*2);
            ctx.ellipse(31, 23, 3, 1.5, -0.2, 0, Math.PI*2);
            ctx.fill();
        });

        // UI Boss Horn Skull
        this.createCanvas('ui_boss_skull', 26, 26, (ctx) => {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(13, 12, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(10, 19, 6, 5);
            ctx.beginPath();
            ctx.moveTo(6, 7); ctx.lineTo(2, 2); ctx.lineTo(9, 5); ctx.closePath();
            ctx.moveTo(20, 7); ctx.lineTo(24, 2); ctx.lineTo(17, 5); ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(9, 11, 3, 3);
            ctx.fillRect(14, 11, 3, 3);
        });

        // UI Chest
        this.createCanvas('ui_chest', 26, 24, (ctx) => {
            ctx.fillStyle = '#854d0e';
            ctx.fillRect(2, 8, 22, 14);
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(2, 4, 22, 6);
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 4, 22, 18);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(11, 10, 4, 4);
        });

        // UI Crossed Swords (Скрещенные мечи)
        this.createCanvas('ui_swords', 26, 26, (ctx) => {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(4, 4); ctx.lineTo(22, 22);
            ctx.moveTo(22, 4); ctx.lineTo(4, 22);
            ctx.stroke();

            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(2, 8); ctx.lineTo(8, 2);
            ctx.moveTo(24, 8); ctx.lineTo(18, 2);
            ctx.stroke();
        });

        // UI Shield (Щит героя)
        this.createCanvas('ui_shield', 24, 24, (ctx) => {
            ctx.fillStyle = '#6366f1';
            ctx.beginPath();
            ctx.moveTo(12, 2);
            ctx.lineTo(21, 5);
            ctx.lineTo(18, 16);
            ctx.lineTo(12, 22);
            ctx.lineTo(6, 16);
            ctx.lineTo(3, 5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#a5b4fc';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(11, 6, 2, 8);
            ctx.fillRect(8, 9, 8, 2);
        });

        // UI Scroll (Свиток заданий)
        this.createCanvas('ui_scroll', 24, 24, (ctx) => {
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.roundRect(4, 4, 16, 16, 3);
            ctx.fill();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#92400e';
            ctx.fillRect(7, 8, 10, 2);
            ctx.fillRect(7, 12, 8, 2);
            ctx.fillRect(7, 16, 6, 2);
        });

        // UI Hourglass (Песочные часы)
        this.createCanvas('ui_hourglass', 22, 22, (ctx) => {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.moveTo(4, 3); ctx.lineTo(18, 3); ctx.lineTo(12, 11); ctx.lineTo(18, 19); ctx.lineTo(4, 19); ctx.lineTo(10, 11); ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#bae6fd';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#ffd166';
            ctx.fillRect(10, 14, 4, 4);
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

        // 11. STAT BAR ICONS (Миниатюрные стильные иконки для параметров)
        this.createCanvas('stat_icon_hp', 18, 18, (ctx) => {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(6, 6, 5, Math.PI, 0, false);
            ctx.arc(12, 6, 5, Math.PI, 0, false);
            ctx.lineTo(9, 16);
            ctx.closePath();
            ctx.fill();
        });

        this.createCanvas('stat_icon_spd', 18, 18, (ctx) => {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.moveTo(11, 2); ctx.lineTo(4, 10); ctx.lineTo(9, 10); ctx.lineTo(7, 16); ctx.lineTo(14, 8); ctx.lineTo(9, 8); ctx.closePath();
            ctx.fill();
        });

        this.createCanvas('stat_icon_dmg', 18, 18, (ctx) => {
            ctx.fillStyle = '#f97316';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(3, 15); ctx.lineTo(13, 5); ctx.stroke();
            ctx.fillStyle = '#f97316';
            ctx.fillRect(11, 3, 4, 4);
            ctx.fillRect(2, 14, 3, 3);
        });

        this.createCanvas('stat_icon_crit', 18, 18, (ctx) => {
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const a = (i * Math.PI) / 2;
                const x = 9 + Math.cos(a) * 8;
                const y = 9 + Math.sin(a) * 8;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(8, 8, 2, 2);
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

