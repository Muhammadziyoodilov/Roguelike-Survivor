/**
 * 10 Minutes Survivor: Hero Arena - Конфигурация и База данных
 */

const CONFIG = {
    GAME: {
        WIDTH: 1280,
        HEIGHT: 720,
        WORLD_WIDTH: 3000,
        WORLD_HEIGHT: 3000,
        GAME_DURATION_SEC: 600, // 10 минут (600 секунд)
    },

    FONTS: {
        TITLE: "'Montserrat', sans-serif",
        UI: "'Montserrat', sans-serif",
        BODY: "'Inter', sans-serif",
        MONO: "'JetBrains Mono', monospace"
    },
    
    HEROES: {
        knight: {
            id: 'knight',
            name: { ru: 'Рыцарь', en: 'Knight' },
            desc: { ru: 'Сбалансированный воин с мечом и повышенной броней', en: 'Balanced warrior with high armor and sword' },
            icon: 'hero_knight',
            weapon: 'sword',
            baseStats: {
                hp: 120,
                maxHp: 120,
                speed: 180,
                armor: 2,
                damageMulti: 1.0,
                attackSpeedMulti: 1.0,
                critChance: 0.05,
                magnetRadius: 100,
                hpRegen: 0
            },
            price: 0,
            color: 0x3a86ff
        },
        archer: {
            id: 'archer',
            name: { ru: 'Лучник', en: 'Archer' },
            desc: { ru: 'Быстрый стрелок с высоким шансом критического удара', en: 'Swift marksman with high critical strike chance' },
            icon: 'hero_archer',
            weapon: 'bow',
            baseStats: {
                hp: 90,
                maxHp: 90,
                speed: 210,
                armor: 0,
                damageMulti: 1.05,
                attackSpeedMulti: 1.15,
                critChance: 0.15,
                magnetRadius: 110,
                hpRegen: 0
            },
            price: 300,
            color: 0x38b000
        },
        mage: {
            id: 'mage',
            name: { ru: 'Маг Огня', en: 'Fire Mage' },
            desc: { ru: 'Наносит сокрушительный урон по площади взрывами', en: 'Deals massive area damage with explosive fireballs' },
            icon: 'hero_mage',
            weapon: 'fireball',
            baseStats: {
                hp: 85,
                maxHp: 85,
                speed: 175,
                armor: 0,
                damageMulti: 1.25,
                attackSpeedMulti: 0.9,
                critChance: 0.08,
                magnetRadius: 120,
                hpRegen: 0
            },
            price: 800,
            color: 0xff006e
        },
        ninja: {
            id: 'ninja',
            name: { ru: 'Ниндзя', en: 'Ninja' },
            desc: { ru: 'Молниеносные атаки сюрикенами с рикошетом', en: 'Lightning fast attacks with ricocheting shurikens' },
            icon: 'hero_ninja',
            weapon: 'shuriken',
            baseStats: {
                hp: 95,
                maxHp: 95,
                speed: 220,
                armor: 1,
                damageMulti: 0.95,
                attackSpeedMulti: 1.35,
                critChance: 0.12,
                magnetRadius: 100,
                hpRegen: 0
            },
            price: 1500,
            color: 0x8338ec
        },
        necromancer: {
            id: 'necromancer',
            name: { ru: 'Некромант', en: 'Necromancer' },
            desc: { ru: 'Окутан постоянной ядовитой аурой, похищающей жизненную силу врагов', en: 'Surrounded by permanent toxic aura absorbing enemy life' },
            icon: 'hero_necromancer',
            weapon: 'poison_aura',
            baseStats: {
                hp: 110,
                maxHp: 110,
                speed: 185,
                armor: 1,
                damageMulti: 1.15,
                attackSpeedMulti: 1.05,
                critChance: 0.10,
                magnetRadius: 140,
                hpRegen: 0.5
            },
            price: 2500,
            color: 0x7209b7
        }
    },

    WEAPONS: {
        sword: {
            id: 'sword',
            name: { ru: 'Меч Героя', en: 'Hero Sword' },
            desc: { ru: 'Молниеносный рассекающий взмах клинком (круговой вихрь на 5 ур.)', en: 'Lightning fast arc slash (full 360 whirlwind at lvl 5)' },
            icon: 'icon_sword',
            maxLevel: 5,
            evolution: 'storm_blade',
            requiredPassive: 'might',
            levels: [
                { damage: 35, cooldown: 0.70, area: 1.15, knockback: 200, count: 1, arc: 0.55 },
                { damage: 50, cooldown: 0.60, area: 1.30, knockback: 220, count: 1, arc: 0.65 },
                { damage: 70, cooldown: 0.50, area: 1.45, knockback: 250, count: 2, arc: 0.80 },
                { damage: 95, cooldown: 0.42, area: 1.65, knockback: 280, count: 2, arc: 0.95 },
                { damage: 135, cooldown: 0.35, area: 1.90, knockback: 320, count: 3, arc: 1.0, isWhirlwind: true }
            ]
        },
        bow: {
            id: 'bow',
            name: { ru: 'Быстрый Лук', en: 'Rapid Bow' },
            desc: { ru: 'Стреляет быстрыми пронзающими стрелами в ближайших врагов', en: 'Fires fast piercing arrows at closest foes' },
            icon: 'icon_bow',
            maxLevel: 5,
            evolution: 'endless_barrage',
            requiredPassive: 'gloves',
            levels: [
                { damage: 18, cooldown: 0.9, speed: 480, pierce: 1, count: 1 },
                { damage: 24, cooldown: 0.8, speed: 520, pierce: 2, count: 2 },
                { damage: 32, cooldown: 0.7, speed: 560, pierce: 2, count: 2 },
                { damage: 42, cooldown: 0.6, speed: 600, pierce: 3, count: 3 },
                { damage: 55, cooldown: 0.45, speed: 650, pierce: 4, count: 4 }
            ]
        },
        fireball: {
            id: 'fireball',
            name: { ru: 'Огненный Шар', en: 'Fireball' },
            desc: { ru: 'Запускает магматический шар с мощным взрывом по площади', en: 'Launches explosive fireball dealing large AoE damage' },
            icon: 'icon_fireball',
            maxLevel: 5,
            evolution: 'meteor',
            requiredPassive: 'vitality',
            levels: [
                { damage: 45, cooldown: 2.0, radius: 70, speed: 300, count: 1 },
                { damage: 65, cooldown: 1.8, radius: 85, speed: 320, count: 1 },
                { damage: 90, cooldown: 1.6, radius: 100, speed: 350, count: 2 },
                { damage: 125, cooldown: 1.4, radius: 120, speed: 380, count: 2 },
                { damage: 175, cooldown: 1.1, radius: 145, speed: 420, count: 3 }
            ]
        },
        shuriken: {
            id: 'shuriken',
            name: { ru: 'Сюрикены', en: 'Shurikens' },
            desc: { ru: 'Острые сюрикены, рикошетящие между монстрами', en: 'Sharp stars that bounce between multiple enemies' },
            icon: 'icon_shuriken',
            maxLevel: 5,
            evolution: 'blade_vortex',
            requiredPassive: 'boots',
            levels: [
                { damage: 15, cooldown: 1.1, bounces: 3, speed: 400, count: 2 },
                { damage: 22, cooldown: 1.0, bounces: 4, speed: 440, count: 2 },
                { damage: 30, cooldown: 0.85, bounces: 5, speed: 480, count: 3 },
                { damage: 40, cooldown: 0.75, bounces: 6, speed: 520, count: 3 },
                { damage: 54, cooldown: 0.6, bounces: 7, speed: 560, count: 4 }
            ]
        },
        lightning: {
            id: 'lightning',
            name: { ru: 'Посох Молний', en: 'Lightning Staff' },
            desc: { ru: 'Призывает удары молний с неба по случайным врагам', en: 'Calls thunder strikes from above on random targets' },
            icon: 'icon_lightning',
            maxLevel: 5,
            evolution: 'zeus_wrath',
            requiredPassive: 'clover',
            levels: [
                { damage: 40, cooldown: 1.8, count: 2, chain: 1 },
                { damage: 60, cooldown: 1.6, count: 3, chain: 2 },
                { damage: 85, cooldown: 1.4, count: 4, chain: 2 },
                { damage: 120, cooldown: 1.2, count: 5, chain: 3 },
                { damage: 165, cooldown: 0.95, count: 6, chain: 4 }
            ]
        },
        poison_aura: {
            id: 'poison_aura',
            name: { ru: 'Чумная Аура', en: 'Poison Aura' },
            desc: { ru: 'Постоянное ядовитое облако вокруг игрока, наносящее урон каждую секунду', en: 'Permanent toxic cloud around player dealing damage per sec' },
            icon: 'icon_poison',
            maxLevel: 5,
            evolution: 'plague_nova',
            requiredPassive: 'magnet',
            levels: [
                { damage: 12, interval: 0.5, radius: 90 },
                { damage: 18, interval: 0.45, radius: 110 },
                { damage: 26, interval: 0.4, radius: 130 },
                { damage: 36, interval: 0.35, radius: 155 },
                { damage: 50, interval: 0.3, radius: 180 }
            ]
        }
    },

    SUPER_WEAPONS: {
        storm_blade: {
            id: 'storm_blade',
            name: { ru: 'Клинок Бури', en: 'Storm Blade' },
            desc: { ru: 'Непрекращающийся смертоносный вихрь клинков молний вокруг героя', en: 'Continuous deadly lightning cyclone of blades surrounding the hero' },
            icon: 'icon_super_blade',
            damage: 150,
            cooldown: 0.22,
            area: 2.3,
            knockback: 380
        },
        endless_barrage: {
            id: 'endless_barrage',
            name: { ru: 'Бесконечный Шквал', en: 'Infinite Barrage' },
            desc: { ru: 'Пулемётный веер световых стрел, пронзающих всё насквозь', en: 'Machine-gun stream of energy arrows piercing all foes' },
            icon: 'icon_super_bow',
            damage: 85,
            cooldown: 0.2,
            speed: 800,
            count: 6,
            pierce: 99
        },
        meteor: {
            id: 'meteor',
            name: { ru: 'Метеоритный Апокалипсис', en: 'Meteor Apocalypse' },
            desc: { ru: 'Гигантские метеориты сотрясают арену, сжигая толпы монстров', en: 'Giant meteors smash the arena incinerating entire hordes' },
            icon: 'icon_super_meteor',
            damage: 320,
            cooldown: 0.8,
            radius: 200,
            count: 4
        },
        blade_vortex: {
            id: 'blade_vortex',
            name: { ru: 'Омега-Сюрикены', en: 'Omega Shurikens' },
            desc: { ru: 'Огромные светящиеся диски безостановочно вращаются по спирали', en: 'Giant glowing discs spiral outward annihilating everything' },
            icon: 'icon_super_shuriken',
            damage: 95,
            cooldown: 0.4,
            speed: 600,
            bounces: 15,
            count: 8
        },
        zeus_wrath: {
            id: 'zeus_wrath',
            name: { ru: 'Гнев Зевса', en: 'Zeus Wrath' },
            desc: { ru: 'Шквал небесных молний бьёт по всем видимым врагам без перерыва', en: 'Relentless barrage of celestial lightning strikes all foes' },
            icon: 'icon_super_lightning',
            damage: 240,
            cooldown: 0.5,
            count: 12,
            chain: 6
        },
        plague_nova: {
            id: 'plague_nova',
            name: { ru: 'Чумная Сверхновая', en: 'Plague Supernova' },
            desc: { ru: 'Пульсирующие волны антиматерии замораживают и растворяют врагов', en: 'Pulsing antimatter waves freeze and melt enemies into gold' },
            icon: 'icon_super_poison',
            damage: 90,
            interval: 0.2,
            radius: 260
        }
    },

    PASSIVES: {
        might: {
            id: 'might',
            name: { ru: 'Сила Героя', en: 'Hero Might' },
            desc: { ru: '+12% к общему урону за уровень', en: '+12% total damage per level' },
            icon: 'icon_might',
            maxLevel: 5,
            bonusPerLevel: { damageMulti: 0.12 }
        },
        boots: {
            id: 'boots',
            name: { ru: 'Сапоги Ветра', en: 'Wind Boots' },
            desc: { ru: '+8% к скорости бега за уровень', en: '+8% movement speed per level' },
            icon: 'icon_boots',
            maxLevel: 5,
            bonusPerLevel: { speed: 18 }
        },
        magnet: {
            id: 'magnet',
            name: { ru: 'Сфера Притяжения', en: 'Attraction Orb' },
            desc: { ru: '+30% к радиусу сбора кристаллов', en: '+30% crystal pickup radius' },
            icon: 'icon_magnet',
            maxLevel: 5,
            bonusPerLevel: { magnetRadius: 40 }
        },
        vitality: {
            id: 'vitality',
            name: { ru: 'Камень Жизни', en: 'Life Stone' },
            desc: { ru: '+25 к максимальному здоровью и мгновенное лечение', en: '+25 Max HP and instant healing' },
            icon: 'icon_vitality',
            maxLevel: 5,
            bonusPerLevel: { maxHp: 25 }
        },
        gloves: {
            id: 'gloves',
            name: { ru: 'Перчатки Ловкости', en: 'Swift Gloves' },
            desc: { ru: '+12% к скорости всех атак (снижение кулдауна)', en: '+12% attack speed (reduced cooldown)' },
            icon: 'icon_gloves',
            maxLevel: 5,
            bonusPerLevel: { attackSpeedMulti: 0.12 }
        },
        clover: {
            id: 'clover',
            name: { ru: 'Клевер Удачи', en: 'Lucky Clover' },
            desc: { ru: '+8% шанс критического удара (х2 урон)', en: '+8% critical strike chance (x2 damage)' },
            icon: 'icon_clover',
            maxLevel: 5,
            bonusPerLevel: { critChance: 0.08 }
        }
    },

    TALENTS: {
        damage: { id: 'damage', name: { ru: 'Урон', en: 'Damage' }, desc: { ru: '+4% к общему урону за уровень', en: '+4% total damage per level' }, icon: 'icon_might', max: 10, baseCost: 100, costStep: 75, stat: 'damageMulti', step: 0.04 },
        hp: { id: 'hp', name: { ru: 'Здоровье', en: 'Health' }, desc: { ru: '+10 к макс. здоровью за уровень', en: '+10 max HP per level' }, icon: 'icon_vitality', max: 10, baseCost: 100, costStep: 75, stat: 'maxHp', step: 10 },
        speed: { id: 'speed', name: { ru: 'Скорость', en: 'Speed' }, desc: { ru: '+8 к скорости бега за уровень', en: '+8 move speed per level' }, icon: 'icon_boots', max: 5, baseCost: 150, costStep: 100, stat: 'speed', step: 8 },
        magnet: { id: 'magnet', name: { ru: 'Магнит', en: 'Magnet' }, desc: { ru: '+20 к радиусу сбора за уровень', en: '+20 pickup radius per level' }, icon: 'icon_magnet', max: 5, baseCost: 150, costStep: 100, stat: 'magnetRadius', step: 20 },
        regen: { id: 'regen', name: { ru: 'Регенерация', en: 'Regen' }, desc: { ru: '+0.4 HP регенерации в секунду', en: '+0.4 HP regen per sec' }, icon: 'icon_heart', max: 5, baseCost: 250, costStep: 150, stat: 'hpRegen', step: 0.4 },
        greed: { id: 'greed', name: { ru: 'Золото', en: 'Greed' }, desc: { ru: '+8% к золоту за уровень', en: '+8% gold earned per level' }, icon: 'icon_coin', max: 10, baseCost: 100, costStep: 80, stat: 'greed', step: 0.08 },
        revive: { id: 'revive', name: { ru: 'Второе дыхание', en: 'Revive' }, desc: { ru: '+1 бесплатное воскрешение в матче', en: '+1 free revive per run' }, icon: 'icon_revive', max: 1, baseCost: 2000, costStep: 0, stat: 'freeRevives', step: 1 }
    },

    ENEMIES: {
        // --- Карта 1: Тёмный Замок ---
        slime: { id: 'slime', name: 'Слизень', hp: 16, speed: 70, damage: 6, xp: 1, goldChance: 0.05, size: 28, color: 0x55a630 },
        bat: { id: 'bat', name: 'Летучая мышь', hp: 10, speed: 150, damage: 5, xp: 1, goldChance: 0.03, size: 22, color: 0x9d4edd },
        skeleton: { id: 'skeleton', name: 'Скелет-воин', hp: 40, speed: 85, damage: 10, xp: 2, goldChance: 0.08, size: 32, color: 0xe0e1dd },
        skull: { id: 'skull', name: 'Череп-камикадзе', hp: 22, speed: 170, damage: 25, xp: 2, goldChance: 0.1, size: 26, isExplosive: true, color: 0xff0054 },
        necro_mage: { id: 'necro_mage', name: 'Темный Маг', hp: 65, speed: 65, damage: 12, xp: 4, goldChance: 0.15, size: 34, isRanged: true, color: 0x560bad },
        orc: { id: 'orc', name: 'Бронированный Орк', hp: 140, speed: 60, damage: 18, xp: 6, goldChance: 0.2, size: 40, color: 0x2b9348 },
        ghost: { id: 'ghost', name: 'Призрак', hp: 55, speed: 110, damage: 12, xp: 4, goldChance: 0.1, size: 30, isGhost: true, color: 0x4cc9f0 },
        fire_elem: { id: 'fire_elem', name: 'Огненный Элементаль', hp: 110, speed: 90, damage: 16, xp: 7, goldChance: 0.25, size: 36, color: 0xf77f00 },

        // --- Карта 2: Проклятый Лес ---
        spider: { id: 'spider', name: 'Ядовитый Паук', hp: 25, speed: 125, damage: 8, xp: 2, goldChance: 0.06, size: 26, color: 0x16a34a },
        wolf: { id: 'wolf', name: 'Теневой Волк', hp: 45, speed: 160, damage: 12, xp: 3, goldChance: 0.09, size: 32, color: 0x334155 },
        treant: { id: 'treant', name: 'Проклятый Энт', hp: 160, speed: 50, damage: 22, xp: 6, goldChance: 0.2, size: 44, color: 0x15803d },
        witch: { id: 'witch', name: 'Лесная Ведьма', hp: 80, speed: 75, damage: 15, xp: 5, goldChance: 0.18, size: 34, isRanged: true, color: 0x84cc16 },

        // --- Карта 3: Пылающие Недра ---
        imp: { id: 'imp', name: 'Огненный Бес', hp: 30, speed: 135, damage: 10, xp: 2, goldChance: 0.08, size: 26, isRanged: true, color: 0xf97316 },
        hellhound: { id: 'hellhound', name: 'Адская Гончая', hp: 60, speed: 175, damage: 16, xp: 4, goldChance: 0.12, size: 34, color: 0xd97706 },
        lavagolem: { id: 'lavagolem', name: 'Магматический Голем', hp: 220, speed: 55, damage: 26, xp: 8, goldChance: 0.25, size: 46, color: 0xd00000 },

        // --- Карта 4: Ледяная Пустошь ---
        frostwisp: { id: 'frostwisp', name: 'Ледяной Огонёк', hp: 20, speed: 140, damage: 8, xp: 2, goldChance: 0.07, size: 24, isGhost: true, color: 0x38bdf8 },
        frostwraith: { id: 'frostwraith', name: 'Призрак Вьюги', hp: 75, speed: 115, damage: 15, xp: 5, goldChance: 0.15, size: 34, isRanged: true, color: 0x0ea5e9 },
        icegolem: { id: 'icegolem', name: 'Ледяной Страж', hp: 240, speed: 60, damage: 28, xp: 9, goldChance: 0.28, size: 48, color: 0xbae6fd }
    },

    BOSSES: {
        // --- Боссы Карты 1: Тёмный Замок ---
        king_slime: { id: 'king_slime', name: 'Королевский Слизень', hp: 1400, speed: 65, damage: 25, xp: 60, size: 70, color: 0x38b000, hasChest: true },
        necromancer: { id: 'necromancer', name: 'Верховный Некромант', hp: 3500, speed: 75, damage: 35, xp: 140, size: 68, color: 0x480ca8, hasEvolutionChest: true },
        orc_titan: { id: 'orc_titan', name: 'Орочий Вождь-Титан', hp: 6000, speed: 70, damage: 45, xp: 220, size: 78, color: 0x1b4332, hasEvolutionChest: true },
        fire_golem: { id: 'fire_golem', name: 'Огненный Голем', hp: 10000, speed: 75, damage: 55, xp: 350, size: 85, color: 0xd00000, hasEvolutionChest: true },
        dark_overlord: { id: 'dark_overlord', name: 'ПОВЕЛИТЕЛЬ ТЬМЫ (ФИНАЛ)', hp: 22000, speed: 90, damage: 70, xp: 1200, size: 105, color: 0x10002b, isFinal: true },

        // --- Боссы Карты 2: Проклятый Лес ---
        spore_queen: { id: 'spore_queen', name: 'Королева Спор', hp: 1600, speed: 70, damage: 28, xp: 70, size: 72, color: 0x22c55e, hasChest: true },
        alpha_wolf: { id: 'alpha_wolf', name: 'Теневой Альфа-Волк', hp: 3800, speed: 110, damage: 38, xp: 150, size: 74, color: 0x065f46, hasEvolutionChest: true },
        elder_treant: { id: 'elder_treant', name: 'Древний Энт', hp: 7500, speed: 55, damage: 50, xp: 240, size: 84, color: 0x15803d, hasEvolutionChest: true },
        forest_witch: { id: 'forest_witch', name: 'Верховная Ведьма Леса', hp: 11500, speed: 80, damage: 60, xp: 400, size: 80, color: 0x84cc16, hasEvolutionChest: true },
        forest_avatar: { id: 'forest_avatar', name: 'ДУХ ПРОКЛЯТОЙ ЧАЩИ (ФИНАЛ)', hp: 24000, speed: 95, damage: 75, xp: 1300, size: 108, color: 0x064e3b, isFinal: true },

        // --- Боссы Карты 3: Пылающие Недра ---
        imp_warlord: { id: 'imp_warlord', name: 'Владыка Бесов', hp: 1800, speed: 85, damage: 30, xp: 80, size: 68, color: 0xf97316, hasChest: true },
        cerberus: { id: 'cerberus', name: 'Цербер Преисподней', hp: 4200, speed: 115, damage: 42, xp: 170, size: 76, color: 0xd97706, hasEvolutionChest: true },
        hellforge_titan: { id: 'hellforge_titan', name: 'Титан Кузни Ада', hp: 8500, speed: 65, damage: 55, xp: 260, size: 86, color: 0xef4444, hasEvolutionChest: true },
        volcano_dragon: { id: 'volcano_dragon', name: 'Вулканический Дракон', hp: 13000, speed: 85, damage: 65, xp: 450, size: 92, color: 0xb91c1c, hasEvolutionChest: true },
        infernal_overlord: { id: 'infernal_overlord', name: 'ВЛАДЫКА ПЕПЛА (ФИНАЛ)', hp: 26000, speed: 95, damage: 80, xp: 1400, size: 110, color: 0x7f1d1d, isFinal: true },

        // --- Боссы Карты 4: Ледяная Пустошь ---
        frost_mother: { id: 'frost_mother', name: 'Мать Вьюги', hp: 2000, speed: 80, damage: 32, xp: 90, size: 70, color: 0x38bdf8, hasChest: true },
        frost_lord: { id: 'frost_lord', name: 'Владыка Мороза', hp: 4600, speed: 85, damage: 45, xp: 190, size: 78, color: 0x0284c7, hasEvolutionChest: true },
        glacial_colossus: { id: 'glacial_colossus', name: 'Ледяной Колосс', hp: 9500, speed: 60, damage: 60, xp: 280, size: 88, color: 0x0ea5e9, hasEvolutionChest: true },
        frost_drake: { id: 'frost_drake', name: 'Дракон Вечной Мерзлоты', hp: 14500, speed: 90, damage: 70, xp: 500, size: 94, color: 0x06b6d4, hasEvolutionChest: true },
        frost_monarch: { id: 'frost_monarch', name: 'КОРОЛЬ ВЕЧНОЙ СТУЖИ (ФИНАЛ)', hp: 28000, speed: 100, damage: 85, xp: 1500, size: 112, color: 0x082f49, isFinal: true }
    },

    MAPS: {
        dark_castle: {
            id: 'dark_castle',
            order: 1,
            name: { ru: 'Тёмный Замок', en: 'Dark Castle' },
            desc: { ru: 'Древняя каменная крипта с полчищами нежити и орков', en: 'Ancient stone crypt with hordes of undead and orcs' },
            icon: 'map_dark_castle',
            tileFloor: 'tile_floor_castle',
            tileFloorAlt: 'tile_floor_castle_alt',
            tileWall: 'tile_wall_castle',
            tileObstacle: 'tile_pillar_castle',
            propBrazier: 'prop_brazier_castle',
            ambientParticle: 'dungeon_dust',
            goldMultiplier: 1.0,
            xpMultiplier: 1.0,
            unlockRequirementSec: 0,
            waves: [
                { sec: 0, interval: 850, count: 3, types: ['slime', 'bat'] },
                { sec: 120, interval: 750, count: 4, types: ['slime', 'bat', 'skeleton'] },
                { sec: 240, interval: 650, count: 5, types: ['skeleton', 'skull', 'necro_mage'] },
                { sec: 360, interval: 550, count: 6, types: ['orc', 'ghost', 'skeleton'] },
                { sec: 480, interval: 450, count: 7, types: ['fire_elem', 'orc', 'necro_mage'] },
                { sec: 570, interval: 250, count: 9, types: ['fire_elem', 'orc', 'skull', 'bat', 'necro_mage'] }
            ],
            tsunamis: [
                { sec: 120, title: 'ЦУНАМИ #1: ИЗУМРУДНЫЙ ПОТОК!', subtitle: 'БОСС: КОРОЛЕВСКИЙ СЛИЗЕНЬ', color: 0x38b000, bossId: 'king_slime', monsterTypes: ['slime', 'bat'], floodCount: 35, multiplier: 1.1 },
                { sec: 240, title: 'ЦУНАМИ #2: ПРИЛИВ НЕЖИТИ!', subtitle: 'БОСС: ВЕРХОВНЫЙ НЕКРОМАНТ', color: 0x7209b7, bossId: 'necromancer', monsterTypes: ['skeleton', 'skull', 'necro_mage'], floodCount: 45, multiplier: 1.3 },
                { sec: 360, title: 'ЦУНАМИ #3: ОРОЧЬЯ ЛАВИНА!', subtitle: 'БОСС: ОРОЧИЙ ВОЖДЬ-ТИТАН', color: 0x2b9348, bossId: 'orc_titan', monsterTypes: ['orc', 'ghost', 'skeleton'], floodCount: 50, multiplier: 1.5 },
                { sec: 480, title: 'ЦУНАМИ #4: ОГНЕННЫЙ ШТОРМ!', subtitle: 'БОСС: ОГНЕННЫЙ ГОЛЕМ', color: 0xd00000, bossId: 'fire_golem', monsterTypes: ['fire_elem', 'necro_mage', 'orc'], floodCount: 60, multiplier: 1.8 },
                { sec: 570, title: 'ФИНАЛЬНОЕ ЦУНАМИ: АПОКАЛИПСИС ТЬМЫ!', subtitle: 'ФИНАЛЬНЫЙ БОСС: ПОВЕЛИТЕЛЬ ТЬМЫ', color: 0xff0054, bossId: 'dark_overlord', monsterTypes: ['fire_elem', 'orc', 'ghost', 'skull', 'necro_mage'], floodCount: 80, multiplier: 2.2 }
            ]
        },
        cursed_forest: {
            id: 'cursed_forest',
            order: 2,
            name: { ru: 'Проклятый Лес', en: 'Cursed Forest' },
            desc: { ru: 'Окутанная туманом чаща, где рыщут теневые волки и древние энты', en: 'Fog-shrouded grove haunted by shadow wolves, spiders and treants' },
            icon: 'map_cursed_forest',
            tileFloor: 'tile_floor_forest',
            tileFloorAlt: 'tile_floor_forest_alt',
            tileWall: 'tile_wall_forest',
            tileObstacle: 'tile_tree_forest',
            propBrazier: 'prop_mushrooms_forest',
            ambientParticle: 'forest_spores',
            goldMultiplier: 1.15,
            xpMultiplier: 1.15,
            unlockRequirementSec: 300,
            requiredMap: 'dark_castle',
            waves: [
                { sec: 0, interval: 800, count: 3, types: ['spider', 'slime'] },
                { sec: 120, interval: 700, count: 4, types: ['spider', 'wolf'] },
                { sec: 240, interval: 600, count: 5, types: ['wolf', 'treant', 'bat'] },
                { sec: 360, interval: 500, count: 6, types: ['treant', 'witch', 'spider'] },
                { sec: 480, interval: 400, count: 7, types: ['witch', 'wolf', 'treant'] },
                { sec: 570, interval: 220, count: 9, types: ['witch', 'treant', 'wolf', 'spider'] }
            ],
            tsunamis: [
                { sec: 120, title: 'ЦУНАМИ #1: НАШЕСТВИЕ ПАУКОВ!', subtitle: 'БОСС: КОРОЛЕВА СПОР', color: 0x22c55e, bossId: 'spore_queen', monsterTypes: ['spider', 'slime'], floodCount: 40, multiplier: 1.2 },
                { sec: 240, title: 'ЦУНАМИ #2: СТАЯ ТЕНЕВЫХ ВОЛКОВ!', subtitle: 'БОСС: АЛЬФА-ВОЛК', color: 0x065f46, bossId: 'alpha_wolf', monsterTypes: ['wolf', 'bat'], floodCount: 48, multiplier: 1.4 },
                { sec: 360, title: 'ЦУНАМИ #3: ПРОБУЖДЕНИЕ ДЕРЕВЬЕВ!', subtitle: 'БОСС: ДРЕВНИЙ ЭНТ', color: 0x15803d, bossId: 'elder_treant', monsterTypes: ['treant', 'spider'], floodCount: 55, multiplier: 1.6 },
                { sec: 480, title: 'ЦУНАМИ #4: ВЕДЬМИН ШАБАШ!', subtitle: 'БОСС: ЛЕСНАЯ ВЕДЬМА', color: 0x84cc16, bossId: 'forest_witch', monsterTypes: ['witch', 'wolf', 'treant'], floodCount: 65, multiplier: 1.9 },
                { sec: 570, title: 'ФИНАЛЬНОЕ ЦУНАМИ: ДРЕВНИЙ ХРАНИТЕЛЬ!', subtitle: 'ФИНАЛЬНЫЙ БОСС: ДУХ ПРОКЛЯТОЙ ЧАЩИ', color: 0x10b981, bossId: 'forest_avatar', monsterTypes: ['witch', 'treant', 'wolf', 'spider'], floodCount: 85, multiplier: 2.3 }
            ]
        },
        infernal_abyss: {
            id: 'infernal_abyss',
            order: 3,
            name: { ru: 'Пылающие Недра', en: 'Infernal Abyss' },
            desc: { ru: 'Раскаленный вулкан с реками магмы. Бонус: +20% ЗОЛОТА!', en: 'Volcanic magma hellscape. Bonus: +20% GOLD!' },
            icon: 'map_infernal_abyss',
            tileFloor: 'tile_floor_inferno',
            tileFloorAlt: 'tile_floor_inferno_alt',
            tileWall: 'tile_wall_inferno',
            tileObstacle: 'tile_pillar_inferno',
            propBrazier: 'prop_magma_inferno',
            ambientParticle: 'lava_embers',
            goldMultiplier: 1.35,
            xpMultiplier: 1.25,
            unlockRequirementSec: 300,
            requiredMap: 'cursed_forest',
            waves: [
                { sec: 0, interval: 750, count: 4, types: ['imp', 'skull'] },
                { sec: 120, interval: 650, count: 5, types: ['imp', 'hellhound'] },
                { sec: 240, interval: 550, count: 6, types: ['hellhound', 'lavagolem', 'fire_elem'] },
                { sec: 360, interval: 450, count: 7, types: ['lavagolem', 'imp', 'fire_elem'] },
                { sec: 480, interval: 380, count: 8, types: ['lavagolem', 'hellhound', 'fire_elem'] },
                { sec: 570, interval: 200, count: 10, types: ['lavagolem', 'hellhound', 'imp', 'fire_elem'] }
            ],
            tsunamis: [
                { sec: 120, title: 'ЦУНАМИ #1: РОЙ БЕСОВ!', subtitle: 'БОСС: ВЛАДЫКА БЕСОВ', color: 0xf97316, bossId: 'imp_warlord', monsterTypes: ['imp', 'skull'], floodCount: 45, multiplier: 1.25 },
                { sec: 240, title: 'ЦУНАМИ #2: ПСЫ ПРЕИСПОДНЕЙ!', subtitle: 'БОСС: ЦЕРБЕР-МУТАНТ', color: 0xd97706, bossId: 'cerberus', monsterTypes: ['hellhound', 'imp'], floodCount: 52, multiplier: 1.45 },
                { sec: 360, title: 'ЦУНАМИ #3: ЛАВОВЫЙ ВСПЛЕСК!', subtitle: 'БОСС: ТИТАН КУЗНИ', color: 0xef4444, bossId: 'hellforge_titan', monsterTypes: ['lavagolem', 'fire_elem'], floodCount: 60, multiplier: 1.7 },
                { sec: 480, title: 'ЦУНАМИ #4: МЕТЕОРНЫЙ ШТОРМ!', subtitle: 'БОСС: ВУЛКАНИЧЕСКИЙ ДРАКОН', color: 0xb91c1c, bossId: 'volcano_dragon', monsterTypes: ['lavagolem', 'hellhound', 'fire_elem'], floodCount: 70, multiplier: 2.0 },
                { sec: 570, title: 'ФИНАЛЬНОЕ ЦУНАМИ: ПОВЕЛИТЕЛЬ ПЕПЛА!', subtitle: 'ФИНАЛЬНЫЙ БОСС: ВЛАДЫКА ПРЕИСПОДНЕЙ', color: 0xff0000, bossId: 'infernal_overlord', monsterTypes: ['lavagolem', 'hellhound', 'imp', 'fire_elem'], floodCount: 90, multiplier: 2.5 }
            ]
        },
        frozen_citadel: {
            id: 'frozen_citadel',
            order: 4,
            name: { ru: 'Ледяная Пустошь', en: 'Frozen Citadel' },
            desc: { ru: 'Замерзшая крепость вечной мерзлоты. Бонус: +25% ОПЫТА!', en: 'Frozen glacier fortress of eternal frost. Bonus: +25% EXP!' },
            icon: 'map_frozen_citadel',
            tileFloor: 'tile_floor_frost',
            tileFloorAlt: 'tile_floor_frost_alt',
            tileWall: 'tile_wall_frost',
            tileObstacle: 'tile_pillar_frost',
            propBrazier: 'prop_crystal_frost',
            ambientParticle: 'snow_blizzard',
            goldMultiplier: 1.3,
            xpMultiplier: 1.45,
            unlockRequirementSec: 300,
            requiredMap: 'infernal_abyss',
            waves: [
                { sec: 0, interval: 700, count: 4, types: ['frostwisp', 'bat'] },
                { sec: 120, interval: 600, count: 5, types: ['frostwisp', 'frostwraith'] },
                { sec: 240, interval: 500, count: 6, types: ['frostwraith', 'icegolem', 'ghost'] },
                { sec: 360, interval: 420, count: 7, types: ['icegolem', 'frostwraith', 'frostwisp'] },
                { sec: 480, interval: 350, count: 8, types: ['icegolem', 'frostwraith', 'ghost'] },
                { sec: 570, interval: 180, count: 10, types: ['icegolem', 'frostwraith', 'frostwisp', 'ghost'] }
            ],
            tsunamis: [
                { sec: 120, title: 'ЦУНАМИ #1: СНЕЖНЫЕ ВИХРИ!', subtitle: 'БОСС: МАТЬ ВЬЮГИ', color: 0x38bdf8, bossId: 'frost_mother', monsterTypes: ['frostwisp', 'bat'], floodCount: 45, multiplier: 1.3 },
                { sec: 240, title: 'ЦУНАМИ #2: ПРИЗРАКИ СТУЖИ!', subtitle: 'БОСС: ВЛАДЫКА МОРОЗА', color: 0x0284c7, bossId: 'frost_lord', monsterTypes: ['frostwraith', 'ghost'], floodCount: 55, multiplier: 1.5 },
                { sec: 360, title: 'ЦУНАМИ #3: ЛЕДЯНАЯ СТЕНА!', subtitle: 'БОСС: ЛЕДЯНОЙ КОЛОСС', color: 0x0ea5e9, bossId: 'glacial_colossus', monsterTypes: ['icegolem', 'frostwraith'], floodCount: 65, multiplier: 1.75 },
                { sec: 480, title: 'ЦУНАМИ #4: АБСОЛЮТНЫЙ НОЛЬ!', subtitle: 'БОСС: ЛЕДЯНОЙ ДРАКОН', color: 0x06b6d4, bossId: 'frost_drake', monsterTypes: ['icegolem', 'frostwraith', 'frostwisp'], floodCount: 75, multiplier: 2.1 },
                { sec: 570, title: 'ФИНАЛЬНОЕ ЦУНАМИ: ВЕЧНАЯ ЗИМА!', subtitle: 'ФИНАЛЬНЫЙ БОСС: КОРОЛЬ ВЕЧНОЙ СТУЖИ', color: 0xa5f3fc, bossId: 'frost_monarch', monsterTypes: ['icegolem', 'frostwraith', 'frostwisp', 'ghost'], floodCount: 95, multiplier: 2.6 }
            ]
        }
    }
};

window.CONFIG = CONFIG;
