/**
 * 10 Minutes Survivor: Hero Arena - Точка входа в игру
 */
window.addEventListener('load', () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const config = {
        type: Phaser.AUTO,
        parent: 'game-container',
        width: CONFIG.GAME.WIDTH,
        height: CONFIG.GAME.HEIGHT,
        pixelArt: false,
        antialias: true,
        antialiasGL: true,
        roundPixels: false,
        resolution: dpr,
        scale: {
            mode: Phaser.Scale.RESIZE,
            width: '100%',
            height: '100%',
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [
            BootScene,
            MenuScene,
            GameScene,
            PauseScene,
            UpgradeScene,
            GameOverScene,
            CoopGameScene
        ]
    };

    const game = new Phaser.Game(config);
    window.game = game;

    // Автоматическая пауза звука при потере фокуса вкладки или сворачивании
    window.addEventListener('blur', () => {
        if (window.Sound) window.Sound.stopBGM();
    });

    window.addEventListener('focus', () => {
        if (window.Sound && !window.Sound.isMuted) window.Sound.startBGM();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (window.Sound) window.Sound.stopBGM();
        } else {
            if (window.Sound && !window.Sound.isMuted) window.Sound.startBGM();
        }
    });
});
