import { browser, fresh, go, shot, box, sign, errors } from './lib.mjs'
const page = await fresh()
await go(page, 'editsched')
const signs = () => page.$$eval('#eWeek select[data-sign][data-signday="0"]', a => a.map(s => s.options[s.selectedIndex].text))
const st = () => page.evaluate(() => { const s = document.querySelector('#eWeek .day[data-day="0"]'); return [s.querySelector('.dhver')?.innerText.replace(/\s+/g,' '), s.querySelector('.dpend')?.innerText, s.querySelector('[data-alpub="0"]')?.disabled] })
const drag = async (pid, fill) => {
  const src = page.locator(`#eRoster .rpuck[data-person="${pid}"]`).first(), cell = page.locator(`#eWeek [data-fill="${fill}"]`).first()
  const sb = await src.boundingBox(), cb = await cell.boundingBox()
  console.log('drag', pid, JSON.stringify(sb), JSON.stringify(cb))
  await page.mouse.move(sb.x + 5, sb.y + 5); await page.mouse.down(); await page.mouse.move(sb.x + 15, sb.y + 15, { steps: 3 })
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2, { steps: 12 }); await page.mouse.up(); await page.waitForTimeout(800)
}
await sign(page, 0); await page.click('button[data-beak="0"]'); await page.waitForTimeout(900)
await drag('beams', 'a:0.0.+'); console.log(await st())
await sign(page, 0); console.log('signed', await signs(), await st())
await drag('boosh', 'a:0.0.+'); console.log('after 2nd edit', await signs(), await st())
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200)
// pending chip click: what opens?
await page.click('#eWeek .day[data-day="0"] .dpend'); await page.waitForTimeout(700)
console.log('pending chip opens', await page.evaluate(() => { const w = document.querySelector('.chgwin'); return w && !w.hidden ? [...w.querySelectorAll('.win-tab, .win-tab.on, .cw-day.on')].map(x => (x.classList.contains('on')?'*':'') + x.innerText.replace(/\s+/g,' ')).join(' | ') : 'none' }))
await shot(page, 'p11-pendingchip')
console.log(errors)
await browser.close()
