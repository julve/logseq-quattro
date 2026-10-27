import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
let server, browser;
before(async () => {
  server = spawn(process.execPath, ['scripts/serve.mjs']);
  await new Promise((resolve, reject) => {
    server.stdout.once('data', resolve);
    server.once('error', reject);
    server.once('exit', code => reject(new Error(`Server exited: ${code}`)));
  });
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); server?.kill(); });
const contrast = (a, b) => {
  const luminance = c => c.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
};
for (const mode of ['light', 'dark']) {
  test(`${mode}: fonts, tokens, text contrast, editing and links`, async () => {
    const page = await browser.newPage();
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (!r.url().startsWith('http://127.0.0.1:4173/')) external.push(r.url()); });
    await page.goto('http://127.0.0.1:4173/');
    if (mode === 'dark') await page.locator('#theme-toggle').click();
    // Model the higher-specificity Radix defaults in upstream colors.css,
    // loaded before custom.css, including a nondefault accent selection.
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = 'html[data-theme=dark][data-color=logseq]{--background:192 100% 11%;--lx-gray-01:#002b36}html[data-color=blue] body{--lx-accent-11:blue;--primary:200 97% 37%}';
      document.head.prepend(style);
    });
    await page.evaluate(async () => {
      await Promise.all(['400', 'italic 400', '700', 'italic 700'].map(face => document.fonts.load(`${face} 16px \"iA Writer Quattro S\"`)));
      await document.fonts.ready;
    });
    const state = await page.evaluate(() => {
      const c = getComputedStyle(document.body);
      const rgb = v => v.match(/\d+/g).slice(0, 3).map(Number);
      return {
        bg: c.backgroundColor, fg: rgb(c.color), background: rgb(c.backgroundColor),
        muted: rgb(getComputedStyle(document.querySelector('.property-key')).color),
        font: getComputedStyle(document.querySelector('.page')).fontFamily,
        loaded: [...document.fonts].filter(f => f.status === 'loaded').length,
        rootBg: getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
      };
    });
    assert.equal(state.bg, mode === 'light' ? 'rgb(245, 245, 245)' : 'rgb(23, 23, 23)');
    assert.match(state.font, /iA Writer Quattro S/);
    assert.equal(state.loaded, 4);
    assert.ok(contrast(state.fg, state.background) >= 7);
    assert.ok(contrast(state.muted, state.background) >= 4.5);
    assert.notEqual(state.rootBg, '192 100% 11%');
    await page.locator('#editor').fill('A newly connected thought.');
    assert.equal(await page.locator('#editor').inputValue(), 'A newly connected thought.');
    await page.locator('.form-checkbox').first().check();
    assert.equal(await page.locator('.form-checkbox').first().isChecked(), true);
    await page.locator('a.page-ref').first().click();
    assert.equal(new URL(page.url()).hash, '#library');
    await page.evaluate(() => document.documentElement.dataset.color = 'blue');
    assert.notEqual(await page.locator('body').evaluate(el => getComputedStyle(el).getPropertyValue('--lx-accent-11').trim()), 'blue');
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    await page.screenshot({ path: `test-results/${mode}.png`, fullPage: true });
    await page.close();
  });
  test(`${mode}: narrow layout does not overflow`, async () => {
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto('http://127.0.0.1:4173/');
    if (mode === 'dark') await page.locator('#theme-toggle').click();
    await page.evaluate(async () => {
      await Promise.all(['400', 'italic 400', '700', 'italic 700'].map(face => document.fonts.load(`${face} 16px \"iA Writer Quattro S\"`)));
      await document.fonts.ready;
    });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('#editor').fill('Still editable on mobile.');
    await page.screenshot({ path: `test-results/${mode}-mobile.png`, fullPage: true });
    await page.close();
  });
}
test('distribution is reproducible and has no external imports', () => {
  const built = readFileSync('custom.css', 'utf8');
  assert.ok(built.endsWith(['src/fonts.css', 'src/theme.css'].map(f => readFileSync(f, 'utf8')).join('\n')));
  assert.doesNotMatch(built, /@import|url\(["']?https?:/);
});
