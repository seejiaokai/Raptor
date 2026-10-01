/* p7 walker C — probe 18: a Post In after a Post Out — what the Post in button does, by each way in, for each posting. */
import { boot, world } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L } = await boot()
const sheet = p => p.evaluate(() => { const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].filter(e => e.offsetWidth); const s = d[d.length - 1]; return s ? (s.getAttribute('data-testid') || '') + ' :: ' + s.innerText.replace(/\s+/g, ' ').trim().slice(-330) : 'no sheet' })
const close = async p => { for (let i = 0; i < 4; i++) { const x = p.locator('.bidsheet[role="dialog"] button.x:visible').last(); if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) } else break } }
const tap = async (p, id, iso) => { const c = p.locator(`[data-testid="cell-${id}-${iso}"]`).first(); await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300); await c.click(); await L.sleep(500) }
const cells = (p, id, ds) => p.evaluate(([id, ds]) => ds.map(d => { const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`); return d.slice(5) + ':' + (c ? (c.innerText.trim() || '·') + (/gone/.test(c.className) ? '(away)' : '') : 'none') }).join(' '), [id, ds])
const DS = ['2026-07-17', '2026-07-20', '2026-07-24', '2026-07-27', '2026-07-28', '2026-07-29', '2026-08-03']
for (const [outcome, way] of [['sans', 'place']]) {
  const { browser, p, errors } = await world(L); await C.toastSpy(p)
  await L.go(p, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]', { timeout: 15000 }); await L.sleep(800)
  await p.locator('[data-testid="month-JUL"]:visible').first().click(); await L.sleep(900)
  const ID = 'slash'
  await tap(p, ID, '2026-07-20'); await p.click('[data-testid="bid-postout"]'); await L.sleep(300)
  if ((await p.getAttribute(`[data-testid="po-${outcome}"]`, 'aria-pressed')) !== 'true') { await p.click(`[data-testid="po-${outcome}"]`); await L.sleep(250) }
  await p.click('[data-testid="po-confirm"]'); await L.sleep(900); await close(p); await L.settle(p)
  console.log(`\n[${outcome} / PI by ${way}] after the Post Out:`, await cells(p, ID, DS), await C.toasts(p))
  if (way === 'place') { await tap(p, ID, '2026-07-28'); await p.click('[data-testid="postout-place"]'); await L.sleep(500) } else await tap(p, ID, '2026-07-17')
  console.log('  sheet:', await sheet(p))
  if (await p.locator('[data-testid="bid-postin"]:visible').count()) { await p.click('[data-testid="bid-postin"]'); await L.sleep(400) }
  const d = p.locator('[data-testid="pi-date"]'); if (await d.count()) { await d.fill('2026-07-28'); await d.blur().catch(() => {}); await L.sleep(300) }
  const b = p.locator('[data-testid="pi-confirm"]')
  console.log('  Post in button:', (await b.count()) ? { disabled: await b.isDisabled(), title: await b.getAttribute('title'), date: await d.inputValue().catch(() => null) } : 'ABSENT', '| sheet:', await sheet(p))
  if (await b.count() && !(await b.isDisabled())) { await b.click(); await L.sleep(1000) }
  console.log('  after pressing Post in — sheet:', await sheet(p), '| toasts', await C.toasts(p))
  await close(p); await L.settle(p)
  console.log('  boxes:', await cells(p, ID, DS))
  console.log('  stored profile:', await p.evaluate(() => { const v = localStorage.getItem('raptor:leavewar/profile:slash'); try { const j = JSON.parse(v); return JSON.stringify({ from: j.post && j.post.from, to: j.post && j.post.to, keys: Object.keys(j), past: j.past || j.stints || null }) } catch (e) { return v } }), '| other rows:', await p.evaluate(() => Object.keys(localStorage).filter(k => /leavewar\/(post|past)/.test(k)).map(k => k.slice(7) + '=' + localStorage.getItem(k).slice(0, 200))))
  await L.shot(p, `probe18-${outcome}-${way}`)
  console.log('  errors', errors)
  await browser.close()
}
