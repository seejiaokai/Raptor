/* S14b — is Edit Schedule's own Ctrl+Z alive, before and after the Tracker has been visited?  node scripts/handpass/trk1105-walk-s14b.mjs */
import { open, navTo, mark, mk, sleep, shot } from './trk1105-walk-lib.mjs'
console.log('trk1105-walk-s14b v1')
const L = mk('S14b')
const es = page => page.evaluate(() => { const u = document.getElementById('undoBtn'); return u ? { off: u.disabled, title: u.title } : null })
async function trial(page, txt, label) {
  await navTo(page, 'editsched'); await sleep(600)
  await page.locator('.txed:visible').first().click(); await page.keyboard.type(txt); await page.keyboard.press('Tab'); await sleep(900)
  const before = await es(page)
  await page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
  const prevented = await page.evaluate(() => new Promise(res => { const h = e => { setTimeout(() => res({ defaultPrevented: e.defaultPrevented, target: e.target.tagName }), 0) }; document.addEventListener('keydown', h, { once: true, capture: false }); window.__k = h }))
    .catch(() => null)
  return before
}
const { browser, page } = await open({ tracker: false })
// A: never visited the Tracker
await navTo(page, 'editsched'); await sleep(600)
await page.locator('.txed:visible').first().click(); await page.keyboard.type('walkA'); await page.keyboard.press('Tab'); await sleep(900)
const a0 = await es(page)
await page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
await page.keyboard.press('Control+z'); await sleep(700)
const a1 = await es(page)
L.ok('Ctrl+Z on Edit Schedule BEFORE the Tracker was ever opened', 'D', 'admin', a0.off === false && a1.off === true, `before ${JSON.stringify(a0)} after ${JSON.stringify(a1)}`)
// B: visit the Tracker, mark, leave, repeat
await navTo(page, 'tracker'); await page.waitForSelector('#flowSvg .ball'); await sleep(500)
await mark(page, 'ST-02', 'dco', false)
await navTo(page, 'editsched'); await sleep(600)
await page.locator('.txed:visible').first().click(); await page.keyboard.type('walkB'); await page.keyboard.press('Tab'); await sleep(900)
const b0 = await es(page)
await page.evaluate(() => { const a = document.activeElement; if (a && a.blur) a.blur() })
const ev = await page.evaluate(() => new Promise(res => { document.addEventListener('keydown', e => setTimeout(() => res({ key: e.key, ctrl: e.ctrlKey, defaultPrevented: e.defaultPrevented, target: e.target.tagName + '#' + e.target.id }), 0), { once: true }); window.__ready = true; setTimeout(() => res('no keydown seen'), 3000) }).catch(e => String(e)), null)
await page.keyboard.press('Control+z'); await sleep(900)
const b1 = await es(page)
await shot(page, 'S14b-after-visit')
L.ok('Ctrl+Z on Edit Schedule AFTER the Tracker has been visited (hidden, kept mounted)', 'D', 'admin', b0.off === false && b1.off === true, `before ${JSON.stringify(b0)} after ${JSON.stringify(b1)}`)
await browser.close()
L.save('S14b')
