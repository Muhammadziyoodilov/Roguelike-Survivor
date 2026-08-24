const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4545;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg'
};

function getAssetManifest() {
    const manifest = { audio: {}, sprites: {} };
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) return manifest;

    // Scan audio
    const audioDir = path.join(assetsDir, 'audio');
    if (fs.existsSync(audioDir)) {
        fs.readdirSync(audioDir).forEach(f => {
            const ext = path.extname(f).toLowerCase();
            if (['.mp3', '.ogg', '.wav'].includes(ext)) {
                const key = path.basename(f, ext);
                manifest.audio[key] = `assets/audio/${f}`;
            }
        });
    }

    // Scan sprites
    const spritesDir = path.join(assetsDir, 'sprites');
    if (fs.existsSync(spritesDir)) {
        const subdirs = ['heroes', 'enemies', 'bosses', 'weapons', 'pickups', 'environment'];
        subdirs.forEach(sub => {
            const subPath = path.join(spritesDir, sub);
            if (fs.existsSync(subPath)) {
                fs.readdirSync(subPath).forEach(f => {
                    const ext = path.extname(f).toLowerCase();
                    if (['.png', '.jpg', '.svg'].includes(ext)) {
                        const key = path.basename(f, ext);
                        manifest.sprites[key] = `assets/sprites/${sub}/${f}`;
                    }
                });
            }
        });
    }

    return manifest;
}

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];

    if (url === '/api/assets') {
        const manifest = getAssetManifest();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(JSON.stringify(manifest));
        return;
    }

    let filePath = path.join(__dirname, url === '/' ? 'index.html' : url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('404 File Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
            res.end(content, 'utf-8');
        }
    });
});

// Update manifest.json on start
try {
    const manifest = getAssetManifest();
    fs.writeFileSync(path.join(__dirname, 'assets', 'manifest.json'), JSON.stringify(manifest, null, 2));
} catch(e) {}

server.listen(PORT, () => {
    console.log(`\n[SERVER] Сервер игры запущен!`);
    console.log(`[SERVER] Открой в браузере: http://localhost:${PORT}\n`);
});
