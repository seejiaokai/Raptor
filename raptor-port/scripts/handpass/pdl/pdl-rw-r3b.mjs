/* pdl-rw-r3b v1 — R3 extra: the FULL words of the published Tuesday's crew-rest line on View-only, Edit Schedule and the board after Crew rest 12h -> 11h,
   plus a picture of the Edit Schedule warning list open. Same fixture as pdl-w1-s4 (Mon lands 20:00, Tue VL 12:00 B blank, Vandal). */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
process.env.HP_URL = 'http://localhost:4292'
process.env.HP_SHOTS = resolve(HERE, '../../../docs/img/handpass/2026-11-12-published-day-logic-settings/rewalk/r3b')
console.log('pdl-rw-r3b v1', process.env.HP_SHOTS)
const P = await import('./pdl-w1-lib.mjs')
const { X, W, L, sleep, row } = P
const w = await X.world('desktop')
const { page } = w
const man = w.ID('Vandal')
await P.openBoard(w, 0); console.log('Mon', JSON.stringify(await P.line(w, 0, { to: '19:00', ld: '20:00', who: man }))); await L.closeBoard(page)
await P.openBoard(w, 1); console.log('Tue', JSON.stringify(await P.line(w, 1, { to: '12:00', ld: '13:00', who: man }))); await L.closeBoard(page)
await P.openBoard(w, 1)
const sp = await X.signAndPublish(w, 1)
console.log('publish', JSON.stringify({ p: sp.p, tag: sp.h && sp.h.tag }))
await L.closeBoard(page)
await L.go(page, 'logic'); await sleep(600)
if (!(await page.locator('#lgBody input[data-lgset="crewRest"]:visible').count())) { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(500) }
const inp = page.locator('#lgBody input[data-lgset="crewRest"]').first()
await inp.fill('11h'); await inp.press('Tab'); await sleep(600)
await X.press(w, '#lgDone', { scope: 'page' }); await sleep(500)
console.log('VCONF.crewRest', await page.evaluate(() => VCONF.crewRest))
const vandal = items => items.filter(t => /Vandal/.test(t))
for (const s of ['view', 'edit']) {
  await L.go(page, s === 'edit' ? 'editsched' : 'viewsched'); await sleep(600)
  const root = s === 'edit' ? '#eWeek' : '#vWeek'
  const st = await X.stripItems(page, root, 1)
  console.log('FULL', s, JSON.stringify(vandal(st.items)))
  /* open the strip if it is folded, then picture the Tuesday strip */
  const strip = page.locator(`${root} .day[data-day="1"]`).first()
  await strip.evaluate(e => e.scrollIntoView({ block: 'start', inline: 'center' })); await sleep(400)
  await page.screenshot({ path: `${P.SHOTS}/r3b-${s}-tue-after-11h.png` })
}
await P.openBoard(w, 1); await sleep(400)
const wl = await W.warnList(page)
console.log('FULL board', JSON.stringify(vandal(wl.lines.map(l => l.text))))
await page.screenshot({ path: `${P.SHOTS}/r3b-board-tue-after-11h.png` })
await L.closeBoard(page)
console.log('ERRORS', JSON.stringify(w.errors))
await w.browser.close()
