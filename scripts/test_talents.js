const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const executablePath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

async function testTalents() {
    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto('http://localhost:4545', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Click on УСИЛЕНИЯ tab in bottom bar (x=577, y=675)
    await page.mouse.click(577, 675);
    await new Promise(r => setTimeout(r, 800));

    const outPath = path.resolve(__dirname, '..', 'screenshot_talents.png');
    await page.screenshot({ path: outPath });
    console.log('[TALENTS CAPTURED]', outPath);

    await browser.close();
}

testTalents();
