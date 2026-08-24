const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const executablePath = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

async function capture(url = 'http://localhost:4545', outFile = 'screenshot.png', delayMs = 2500) {
    console.log(`[CAPTURE] Launching browser via ${executablePath}...`);
    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const errors = [];
    page.on('console', msg => console.log(`[BROWSER LOG] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => errors.push(err.toString()));

    console.log(`[CAPTURE] Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log(e.message));

    await new Promise(r => setTimeout(r, delayMs));

    const outPath = path.resolve(__dirname, '..', outFile);
    await page.screenshot({ path: outPath });
    console.log(`[CAPTURE] Screenshot successfully saved to ${outPath}`);

    if (errors.length > 0) {
        console.error('[CAPTURE ERRORS]', errors);
    }

    await browser.close();
}

const args = process.argv.slice(2);
capture(args[0] || 'http://localhost:4545', args[1] || 'screenshot.png', parseInt(args[2] || '2500', 10));
