/* [DB-READINESS] phase 7 — WALKER A, part 5b: two pictures the first pass of the other rooms did not frame.
   R3b the next-week peek, with its PERSONAL row on screen, and a tap on its placeholder;
   A26b the Leave War after the Saturday is published: a crowd man's empty cell beside the SDO's credit. */
import { boot, world, fileTimed } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import { lwCell } from './lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await W.toastSpy(p)

A.scen('R3b', 'next week\'s Monday (20 Jul): timed Personal (Ranger) with ALL AVAIL, placed on that week\'s board; back to 13 Jul; the peek column on View-only Sched and on Edit Schedule, its PERSONAL row brought on screen; a tap on the placeholder')
try {
  const iid3 = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: '2026-07-20', from: '10:00', to: '11:00', remarks: 'P7 R3 peek' })
  await W.toEdit(L, p)
  await p.locator('[data-wk]:visible', { hasText: 'Jul 20' }).first().click(); await L.sleep(1500)
  await W.boardOn(p, 0)
  const put = await A.place(S, p, 0, await A.rowIdx(p, 0, iid3), 'extras', 'allavail')
  A.ok('ALL AVAIL placed on Mon 20 Jul', put.took, put)
  const n = (await A.chips(p, '#schedBoard', iid3)).map(c => c.txt).join('/')
  A.said(`on its own week the chip reads ${n}`)
  await W.boardOff(p); await W.toEdit(L, p)
  await p.locator('[data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await L.sleep(1500)
  A.data('loaded week: ' + await p.evaluate(() => window.CURWEEK))
  for (const [surf, pg, nm] of [['#vWeek', 'viewsched', 'View-only Sched'], ['#eWeek', 'editsched', 'Edit Schedule']]) {
    await L.go(p, pg)
    const pk = await p.evaluate(s => {
      const peeks = [...document.querySelectorAll(`${s} .day.peek`)]
      const ph = peeks.map(q => q.querySelector('.puck.allavail')).find(Boolean)
      if (ph) {
        const day = ph.closest('.day'); const sc = day.closest('.week') || day.parentElement
        if (sc && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = Math.max(0, day.offsetLeft - 300)
        ph.scrollIntoView({ block: 'center', inline: 'nearest' })
      }
      const r = ph ? ph.getBoundingClientRect() : null
      const cs = ph ? getComputedStyle(ph) : null
      const seat = ph && ph.closest('.seat')
      return { n: peeks.length, chips: peeks.reduce((a, q) => a + q.querySelectorAll('.oilcount').length, 0), drawn: !!ph,
        onScreen: !!r && r.width > 2 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
        seatHtml: seat ? seat.outerHTML.slice(0, 300) : (ph ? ph.parentElement.outerHTML.slice(0, 300) : null), pointer: cs ? cs.pointerEvents : null,
        head: ph ? (ph.closest('.day').innerText || '').replace(/\s+/g, ' ').slice(0, 60) : null }
    }, surf)
    await L.sleep(400)
    A.said(`${nm}: ${pk.n} peek columns ("${pk.head}"); the placeholder is drawn ${pk.drawn}, on screen ${pk.onScreen}; count chips in the peek ${pk.chips}`)
    A.ok(`PEEK (${nm}): the ALL AVAIL puck is drawn on the peek's Personal row and NO count chip beside it`, pk.n > 0 && pk.drawn && pk.chips === 0, pk)
    await A.pic(L, p, `R3b-peek-${pg}`)
    const w0 = await p.evaluate(() => window.CURWEEK)
    const pt = await p.evaluate(s => { const ph = [...document.querySelectorAll(`${s} .day.peek .puck.allavail`)][0]; if (!ph) return null; const r = ph.getBoundingClientRect(); return { x: r.right + 10, y: r.top + r.height / 2, px: r.left + r.width / 2 } }, surf)
    if (pt) {
      /* a tap just right of the puck — where the chip would be */
      await p.mouse.click(pt.x, pt.y); await L.sleep(900)
      const w = await A.win(p); const w1 = await p.evaluate(() => window.CURWEEK)
      A.said(`${nm}: a tap where the chip would stand (right of the puck): ALL AVAIL window open ${w.open}; the loaded week ${w0} → ${w1}; toasts ${JSON.stringify(await W.toasts(p))}`)
      A.ok(`PEEK (${nm}): no ALL AVAIL window opens from the peek`, !w.open)
      if (w1 !== w0) { await A.pic(L, p, `R3b-peek-${pg}-after-tap`); await W.toEdit(L, p); await p.locator('[data-wk]:visible', { hasText: 'Jul 13' }).first().click(); await L.sleep(1500) }
    }
  }
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'R3b-X-error').catch(() => {}) }

A.scen('A26b', 'Saturday — timed Personal (Ranger) with ALL AVAIL, signed and published; the Leave War grid: the SDO (Fable) and a crowd man on Sat 18 Jul, in one picture')
try {
  const iid = await fileTimed(L, p, { person: A.RANGER, type: 'Personal', iso: A.ISO[A.SAT], from: '10:00', to: '11:00', remarks: 'P7 A26b' })
  await W.boardOn(p, A.SAT)
  A.ok('ALL AVAIL placed', (await A.place(S, p, A.SAT, await A.rowIdx(p, A.SAT, iid), 'extras', 'allavail')).took)
  const w = await A.openChip(p, '#schedBoard', iid); await A.closeWin(p)
  await W.boardOff(p); await W.toEdit(L, p); await W.showDay(p, A.SAT)
  await W.signDay(p, A.SAT); const pub = await W.publishDay(p, A.SAT)
  A.ok('published', pub.pressed && /ORIG/.test((await W.head(p, A.SAT)).tag))
  /* crowd men standing next to Fable on the grid, so one picture holds both */
  const cells = await lwCell(p, ['plasma', ...w.ids], A.ISO[A.SAT])
  const credited = Object.entries(cells).filter(([k, v]) => v !== 'NO CELL DRAWN' && /FO|HO/.test(v.text || '')).map(([k, v]) => `${k}=${v.text}`)
  A.data(`Leave War 18 Jul: of Fable + the ${w.ids.length} crowd men, the cells carrying FO / HO: ${JSON.stringify(credited)}; cells not drawn: ${Object.values(cells).filter(v => v === 'NO CELL DRAWN').length}`)
  A.ok('LEAVE WAR: of the whole crowd, nobody wears FO / HO on 18 Jul — only the SDO (Fable) does', credited.length === 1 && /^Fable=/.test(credited[0]), credited)
  await p.evaluate(d => { const c = document.querySelector(`[data-testid="cell-plasma-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, A.ISO[A.SAT]); await L.sleep(500)
  await A.pic(L, p, 'A26b-leavewar-fable-and-crowd')
} catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, 'A26b-X-error').catch(() => {}) }
A.ok('no console error, page error or 4xx (whole world)', errors.length === 0, errors.slice(0, 5))
A.saveRows(process.env.HP_OUT.replace(/\.json$/, '-walk5b.json'), { errors })
await browser.close()
