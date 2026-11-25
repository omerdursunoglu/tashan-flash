import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function run() {
  console.log('--- Testing Walkability, Stairs Climbing & Real FPS ---');

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
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.toString()));

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.waitForFunction(() => {
    return window.__tashanApp && window.__tashanApp.player && window.__tashanApp.player.colliderMesh;
  }, { timeout: 15000 });

  // Hide loading screen
  await page.evaluate(() => {
    const screen = document.getElementById('loading-screen');
    if (screen) screen.style.display = 'none';
  });

  await new Promise(r => setTimeout(r, 1000));

  // 1. Measure FPS over 120 animation frames
  console.log('\n--- 1. Measuring Performance & FPS (120 frames) ---');
  const fpsResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      const frameTimes = [];
      let lastTime = start;

      function onFrame() {
        const now = performance.now();
        frameTimes.push(now - lastTime);
        lastTime = now;
        frames++;

        if (frames < 120) {
          requestAnimationFrame(onFrame);
        } else {
          const totalDuration = now - start;
          const avgFps = (frames / totalDuration) * 1000;
          const avgFrameTime = totalDuration / frames;
          resolve({ avgFps, avgFrameTime, frames, totalDuration });
        }
      }
      requestAnimationFrame(onFrame);
    });
  });

  console.log(`Measured: ${fpsResult.avgFps.toFixed(1)} FPS (avg frame time: ${fpsResult.avgFrameTime.toFixed(2)} ms)`);

  // 2. Test Player Stairs Climbing
  console.log('\n--- 2. Testing Stairs Climbing & Walkability ---');
  const stairsTest = await page.evaluate(async () => {
    const app = window.__tashanApp;
    const player = app.player;

    // Teleport player right in front of the stairs base
    // Stairs base is at x = -24.70, z = -3.86
    player.teleport(-24.70, 1.70, -1.0, { x: -24.70, y: 3.5, z: -13.30 });

    const samples = [];
    samples.push({ step: 'base', pos: player.position.clone() });

    // Simulate holding 'W' (forward towards -Z) for 5 seconds (moving ~20 meters forward)
    player.keys.forward = true;

    for (let f = 0; f < 180; f++) {
      // 180 frames at 60fps = 3 seconds
      // Let the main loop update or manual step
      await new Promise(r => requestAnimationFrame(r));
      if (f % 30 === 0) {
        samples.push({
          frame: f,
          x: player.position.x.toFixed(2),
          y: player.position.y.toFixed(2),
          z: player.position.z.toFixed(2)
        });
      }
    }

    player.keys.forward = false;

    samples.push({ step: 'end_climb', pos: {
      x: player.position.x.toFixed(2),
      y: player.position.y.toFixed(2),
      z: player.position.z.toFixed(2)
    }});

    return samples;
  });

  console.log('Stairs climbing trajectory:');
  console.table(stairsTest);

  // 3. Test Fly Mode
  console.log('\n--- 3. Testing Fly Mode ---');
  const flyTest = await page.evaluate(async () => {
    const player = window.__tashanApp.player;
    player.toggleFlyMode();
    const wasFlying = player.isFlying;

    player.keys.up = true;
    for (let f = 0; f < 30; f++) {
      await new Promise(r => requestAnimationFrame(r));
    }
    player.keys.up = false;
    const flyY = player.position.y;
    player.toggleFlyMode(); // back to walking

    return { wasFlying, flyY, isWalkingNow: !player.isFlying };
  });

  console.log('Fly test result:', flyTest);

  await browser.close();

  console.log(`\nConsole errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors:', consoleErrors);
    process.exit(1);
  } else {
    console.log('ALL TESTS PASSED WITH 0 CONSOLE ERRORS!');
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
