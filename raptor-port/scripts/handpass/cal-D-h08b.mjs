import { chromium, launchOptions, world, shot, tid, press, lwMonth } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const L = (...a) => console.log(size, ...a)
const logicRows = () => page2.evaluate(() => { const out = []; for (const re of [/A member.s input is due/, /has a deadline of its own/, /Members may file duties and commitments/]) { const cands = [...document.querySelectorAll('*')].filter(x => re.test(x.textContent)); const e = cands.sort((a, b) => a.textContent.length - b.textContent.length)[0]; let r = e; while (r && r.parentElement && !(r.matches && r.matches('li, tr, .lgrow, [class*=lg-row], [class*=lgr]'))) { r = r.parentElement; if (r.textContent.length > 2000) break } out.push({ cls: r && r.className, btns: r ? [...r.querySelectorAll('button, a.abtn, [role=button]')].map(b => b.innerText.trim() + '|' + (b.getAttribute('data-open') || b.className)) : null, len: r && r.textContent.length }) } return out })
let page2
for (const who of ['ad', 'us']) {
  const { ctx, page, errors } = await world(browser, size, who); page2 = page
  await page.evaluate(() => window.go('logic')); await page.waitForTimeout(900)
  L(who, 'LOGIC rows', JSON.stringify(await logicRows()))
  await shot(page, `h08b-${size}-${who}-logic`)
  if (who === 'us') {
    // Leave War: tap an Available cell (the working), a Required cell, the Available name
    await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-slipway"]'); await page.waitForTimeout(400)
    const iso = '2026-07-27'; await lwMonth(page, iso)
    const ac = tid(page, 'avail-p-' + iso); await ac.waitFor({ state: 'attached' }); await ac.scrollIntoViewIfNeeded(); await press(size, ac); await page.waitForTimeout(400)
    L(who, 'LW Available cell tapped -> working', (await tid(page, 'fly-working').innerText().catch(() => 'NONE')).replace(/\s+/g, ' ').slice(0, 120))
    const nm = tid(page, 'fly-name-avail-p'); L(who, 'name element', await nm.evaluate(e => e.tagName + ' ' + e.className + ' pe=' + getComputedStyle(e).pointerEvents + ' disabled=' + e.disabled).catch(() => 'none'))
    await shot(page, `h08b-${size}-${who}-lwavail`)
  }
  console.log(errors.join('|')); await ctx.close()
}
await browser.close()
