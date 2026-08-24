const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

async function testPlay() {
    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('http://localhost:4545', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Click on PLAY button (x=220, y=240)
    await page.mouse.click(220, 240);
    await new Promise(r => setTimeout(r, 1000));

    const outPath = path.resolve(__dirname, '..', 'screenshot_heroselect.png');
    await page.screenshot({ path: outPath });
    console.log('[HERO SELECT CAPTURED]', outPath);

    await browser.close();
}

testPlay();
