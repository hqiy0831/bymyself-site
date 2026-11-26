// Seeds the browser-mock app with fictional demo data and captures product screenshots.
const { chromium } = require(process.argv[2]);
const out = process.argv[3];
const fs = require('fs');
const seedSrc = fs.readFileSync(process.argv[4], 'utf8').replace(/^\/\/.*\n/, '');
const BASE = 'http://localhost:5190/';
const CLEAN = `
  a[href="#/dev/gallery"] { display: none !important; }
  *:focus, *:focus-visible { outline: none !important; box-shadow: none !important; }
  * { caret-color: transparent !important; }
`;

(async () => {
  const b = await chromium.launch();
  for (const scheme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, locale: 'zh-CN', timezoneId: 'Asia/Shanghai', colorScheme: scheme });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto(BASE);
    await p.waitForTimeout(2500);
    console.log(scheme, await p.evaluate(`(${seedSrc})()`));
    const shot = async (route, name, prep) => {
      await p.goto(BASE + '#/' + route);
      await p.waitForTimeout(1600);
      await p.addStyleTag({ content: CLEAN });
      if (prep) await prep();
      await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
      await p.mouse.move(1279, 799);
      await p.waitForTimeout(700);
      await p.screenshot({ path: `${out}/${name}-${scheme}.jpg`, type: 'jpeg', quality: 86 });
    };
    await p.reload();
    await p.waitForTimeout(2000);
    await shot('present', 'present');
    await shot('past', 'past');
    await shot('future', 'future');
    await shot('timeline', 'timeline', async () => {
      await p.evaluate(() => { const el = [...document.querySelectorAll('*')].find((e) => e.textContent.trim() === '今天' && e.children.length === 0); el && el.scrollIntoView({ block: 'start' }); });
      await p.waitForTimeout(600);
      await p.mouse.wheel(0, -230);
    });
    await shot('review', 'review');
    await shot('search', 'search', async () => {
      const input = p.locator('input[type="search"], input').first();
      await input.fill('江边');
      await p.waitForTimeout(1200);
    });
    console.log(scheme, 'errors:', JSON.stringify(errs.slice(0, 3)));
    await ctx.close();
  }
  await b.close();
})();
