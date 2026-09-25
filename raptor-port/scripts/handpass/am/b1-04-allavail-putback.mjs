/* Walker B1 — D103's "put it back" for a change in who is behind ALL AVAIL (b1-03 part 5 could not find the leave's
   ✕): on the saved everything-week, sign the published Saturday, file LL for Ghost (behind the FAMILY DAY ALL AVAIL
   puck) on Inputs, then delete that leave through its own ✕ on the Inputs table → the four must return.
   PASS = correct. Run from raptor-port/: node scripts/handpass/am/b1-04-allavail-putback.mjs */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b1'
const L = await import('./w2-lib.mjs')
const W = await import('./w1-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const { openHi, editWeek, signDay, head, check, note, summary, screen, STATE, go } = L
const { toastSpy, toasts, shotBox, norm } = W
const SAT = 5
const blank = a => a.every(s => !s || /name/.test(s))
const { browser, page, errors } = await openHi({ width: 1440, height: 900, dpr: 1, state: STATE })
await toastSpy(page)
try {
  await editWeek(page)
  await signDay(page, SAT, 3)
  const s1 = (await head(page, SAT)).signs
  const f = await W4.fileInput(page, { person: 'riddler', type: 'LL', from: '2026-07-18', to: '2026-07-18', remarks: 'b1 putback' })
  note('Y filed', JSON.stringify(f))
  await editWeek(page)
  const h2 = await head(page, SAT)
  note('Y after leave', `signs ${h2.signs.join('|')}, "${norm(h2.pending)}"`)
  await go(page, 'inputs'); await page.waitForTimeout(600)
  const row = page.locator('tr', { hasText: 'b1 putback' }).first()
  const n = await row.count()
  let del = 'no row'
  if (n) { await row.evaluate(e => e.scrollIntoView({ block: 'center' })); await screen(page, 'b1-y-01-inputs-row')
    const x = row.locator('.rmx').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(700); del = (await toasts(page)).join(' / ') } else del = 'row has no ✕' }
  note('Y delete', del)
  await editWeek(page)
  const h3 = await head(page, SAT)
  await shotBox(page, 'b1-y-02-sat-after-delete', `#eWeek .day[data-day="${SAT}"] .day-head`)
  check('X-5b leave deleted → the four return', /deleted/i.test(del) && h3.signs.join('|') === s1.join('|') && !norm(h3.pending), `signed ${s1.join('|')}; leave deleted (${del}); now ${h3.signs.join('|')}, pending "${norm(h3.pending)}"`)
} catch (e) { check('RUN', false, 'stopped: ' + e.message.split('\n')[0]); await screen(page, 'b1-y-ZZ-stopped') }
check('Y-ERR', !errors.length, `browser error list ${errors.length ? JSON.stringify(errors.slice(0, 6)) : 'empty'}`)
summary('B1 allavail put-back')
await browser.close()
