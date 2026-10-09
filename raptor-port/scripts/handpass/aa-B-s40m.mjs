import { world, fileInput, pic, sleep, go, openBoard, openCount, tabTo, savePart } from './aa-B-lib.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
async function run(name, act) {
  const w = await world('desk'); w.tag = 's40n' + name; const { page } = w
  const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S40n', s: '09:00', e: '12:00', oil: 'yes' })
  await openBoard(page, 5); await openCount(page, f.rec.iid)
  const st = async () => ({ win: await page.locator('.availwin:visible').count(), login: await page.locator('#luser:visible').count(), page: await page.evaluate(() => window.CURPAGE), week: await page.evaluate(() => window.CURWEEK) })
  const b = await st(); await act(page, w)
  await sleep(900); const a = await st(); say(name, 'before', JSON.stringify(b), 'after', JSON.stringify(a)); out[name] = { b, a }
  await pic(w, 'after'); await w.browser.close()
}
await run('logout', async p => { await p.locator('#schedBoard').getByRole('button', { name: /Done/ }).first().click(); await sleep(500); await p.getByRole('button', { name: /Logout/ }).first().click(); await sleep(600); const c = p.getByRole('button', { name: /^(Log ?out|Yes|Confirm|Sign out)/ }).first(); if (await c.count() && await c.isVisible().catch(() => false)) await c.click() })
savePart('s40n2-run', { out, log })
