import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const iteration = process.argv[2] || 'iter1';
const outDir = path.resolve('screenshots', iteration);
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  console.log(`Starting visual inspection capture: ${iteration}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: fs.existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-gl=angle',
      '--use-angle=metal',
      '--enable-webgl',
      '--enable-unsafe-webgpu'
    ],
    defaultViewport: {
      width: 1920,
      height: 1080
    }
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.error(`[BROWSER ERROR] ${text}`);
    } else {
      console.log(`[BROWSER ${msg.type()}] ${text}`);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.error(`[PAGE ERROR STACK] ${err.stack || err}`);
  });

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });

  console.log('Waiting for Tashan 3D app to be ready...');
  await page.waitForFunction(() => {
    return window.__tashanApp && window.__tashanApp.player && window.__tashanApp.player.colliderMesh;
  }, { timeout: 15000 });

  // Hide loading screen in case it is still transitioning
  await page.evaluate(() => {
    const screen = document.getElementById('loading-screen');
    if (screen) {
      screen.style.display = 'none';
    }
  });

  // Give 1.5s for initial HDRI / IBL and N8AO convergence
  await new Promise(r => setTimeout(r, 1500));

  const views = [
    { key: 'portal', name: '1_portal_exterior.png' },
    { key: 'courtyard', name: '2_courtyard_wide.png' },
    { key: 'arcade', name: '3_arcade_corridor.png' },
    { key: 'balcony', name: '4_upper_balcony.png' },
    { key: 'stairs', name: '5_stairs_detail.png' }
  ];

  for (const v of views) {
    console.log(`Capturing view: ${v.key} -> ${v.name}`);
    await page.evaluate((viewKey) => {
      if (window.__tashanApp) {
        window.__tashanApp.switchView(viewKey);
      }
    }, v.key);

    // Wait 1.2s for camera lerp/settle and frame rendering
    await new Promise(r => setTimeout(r, 1200));

    const shotPath = path.join(outDir, v.name);
    await page.screenshot({ path: shotPath, type: 'png' });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  await browser.close();

  console.log('\n--- Capture Completed ---');
  console.log(`Total console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors found:\n' + consoleErrors.join('\n'));
    process.exit(1);
  } else {
    console.log('Zero console errors verified.');
  }
}

run().catch(err => {
  console.error('Capture script failed:', err);
  process.exit(1);
});
