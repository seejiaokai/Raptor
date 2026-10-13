/* xa — W3: X1 (OIL question), X2 (an input's own window), X9 (cancel-reason dialog), X10 (Sort all), X3 (cancelled input's window),
   X8 (Jump to a date), X11 (a day's pop-up), with T1 on X1, X9, X10.   node xa.mjs desk|phone */
import { L, inputsCal, openAdd, fillForm, headOf, judgeHead, rowOut, part } from './lib.mjs'
import { tabRound, t1rows, kb } from './lib2.mjs'
const size = process.argv[2] || 'desk'
console.log('xa.mjs - W3 X1 X2 X3 X8 X9 X10 X11 T1 - ' + size)
const w = await L.world(size)
const p = w.page
const S = `[${size}]`
const SAT = '2026-07-18'
const head = async (scope, id, name, extra) => {
  await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(350)
  const h = await headOf(w, scope)
  const j = judgeHead(h, extra ? extra(h) : true)
  rowOut(`${id} ${name} ${S}`, 'head', 'the ✕ in the head\'s top-right corner (right edge within 20px of the head\'s), not following the title; nothing in the head overlaps', j.saw, j.ok)
  return h
}
try {
  await inputsCal(w, SAT)
  await openAdd(w, SAT)
  await fillForm(w, { type: 'Training', person: 'bane', start: '09:00', end: '12:00', title: 'Range brief' })
  await w.press('#inpEditSave')
  await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(400)
  /* X1 */
  await part(w, `X1 OIL question ${S}`, 'head', 'the ✕ in the corner', async () => {
    await head('[data-testid="oilconf"]', 'X1', 'OIL question')
    await L.pic(w, `x01-${size}-oil-question`)
    if (!w.phone) { const t = await tabRound(w, '[data-testid="oilconf"]'); t1rows(`X1 OIL question ${S}`, t, { answer: true }) }
  })
  await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300)

  /* X2 — the input's own window */
  await part(w, `X2 input's own window ${S}`, 'head', 'the ✕ in the corner', async () => {
    await w.press('[data-testid^="idy-open"]')
    await p.waitForSelector('[data-testid="win-inputedit"]'); await L.sleep(500)
    await head('[data-testid="win-inputedit"]', 'X2', "input's own window")
    await L.pic(w, `x02-${size}-input-window`)
    await p.locator('[data-testid="win-inputedit-x"]').click(); await L.sleep(300)
  })
  await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)

  /* X9 — the board's cancel-reason dialog (CX on the Training's row) */
  await L.go(w, 'editsched')
  await p.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
  await p.waitForSelector('#sbBoard .sb-sec', { state: 'attached' }); await L.sleep(500)
  await part(w, `X9 cancel-reason dialog ${S}`, 'head', 'the ✕ in the corner', async () => {
    const cx = p.locator('#sbBoard [data-grcx="5.0"]')
    await cx.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
    await w.press(cx)
    await p.waitForSelector('#cxPop:not([hidden])'); await L.sleep(500)
    await head('#cxPop', 'X9', 'cancel-reason dialog')
    await L.pic(w, `x09-${size}-cancel-reason`)
    if (!w.phone) {
      /* the dialog's input takes the keyboard where it opens; read the round honestly */
      const t = await tabRound(w, '#cxPop')
      t1rows(`X9 cancel-reason dialog ${S}`, t)
      await p.locator('#cxReason').focus(); await p.keyboard.press('Tab'); await L.sleep(200)
      await L.pic(w, `x09-${size}-keyboard-on-first-chip`, { around: '#cxPop .airpop-box', pad: 20 })
    }
    await p.fill('#cxReason', 'Range closed')
    await w.press('#cxSave'); await L.sleep(700)
    console.log('   cancel dialog open after save:', await p.locator('#cxPop:not([hidden])').count())
  })

  /* X10 — Sort all */
  await part(w, `X10 Sort all dialog ${S}`, 'head', 'the ✕ in the corner', async () => {
    if (await p.locator('#cxPop:not([hidden])').count()) { await p.locator('#cxClose').click(); await L.sleep(300) }
    if (w.phone) { await w.press('#sbMore'); await L.sleep(300); await w.press('#sbMoreSort') } else await w.press('#sbSortAll')
    await p.waitForSelector('#sortAllPop:not([hidden])'); await L.sleep(500)
    await head('#sortAllPop', 'X10', 'Sort all dialog')
    await L.pic(w, `x10-${size}-sort-all`)
    if (!w.phone) { const t = await tabRound(w, '#sortAllPop'); t1rows(`X10 Sort all dialog ${S}`, t) }
    await p.locator('#sortAllCancel').click(); await L.sleep(300)
  })

  /* X3 — the cancelled input's own window */
  await part(w, `X3 cancelled input's window ${S}`, 'head', 'the ✕ in the corner; CX and its reason beside the title', async () => {
    await p.evaluate(() => { const b = document.querySelector('#sbDone') || document.querySelector('#sbClose'); b.click() }); await L.sleep(600)
    await inputsCal(w, SAT)
    await p.locator(`[data-icday="${SAT}"]`).focus(); await p.keyboard.press('Enter')
    await p.waitForSelector('[data-testid="win-inputsday"]')
    await w.press('[data-testid^="idy-open"]')
    await p.waitForSelector('[data-testid="win-inputedit"]'); await L.sleep(600)
    const cxm = await p.evaluate(() => { const c = document.querySelector('[data-testid="win-inputedit"] [data-testid="inped-cx"]'); if (!c) return null; const r = c.getBoundingClientRect(), w = document.querySelector('[data-testid="win-inputedit"] .win-ttl'); const g = document.createRange(); g.selectNodeContents(w); const t = g.getBoundingClientRect(); const x = document.querySelector('[data-testid="win-inputedit"] .win-x').getBoundingClientRect(); return { l: Math.round(r.left * 10) / 10, r: Math.round(r.right * 10) / 10, text: c.textContent, titleR: Math.round(t.right * 10) / 10, xL: Math.round(x.left * 10) / 10 } })
    console.log('   CX mark:', JSON.stringify(cxm))
    const h = await head('[data-testid="win-inputedit"]', 'X3', "cancelled input's window")
    if (!cxm) rowOut(`X3 cancelled input's window ${S}`, 'CX mark', 'the red CX mark and its reason stay beside the title', 'no CX mark in the window', false)
    else rowOut(`X3 cancelled input's window ${S}`, 'CX mark', 'the red CX mark and its reason stay beside the TITLE, not beside the ✕', `mark "${cxm.text}" ${cxm.l}-${cxm.r}; title ends ${cxm.titleR} (${Math.round((cxm.l - cxm.titleR) * 10) / 10}px before the mark); the ✕ starts ${cxm.xL} (${Math.round((cxm.xL - cxm.r) * 10) / 10}px after the mark)`, cxm.l - cxm.titleR <= 30 && cxm.l >= cxm.titleR - 0.5 && (cxm.xL - cxm.r) > (cxm.l - cxm.titleR))
    console.log('   toast now:', await p.evaluate(() => { const t = document.querySelector('#toastEl'); return t.textContent + ' op=' + getComputedStyle(t).opacity + ' cls=' + t.className }))
    await p.evaluate(() => { window.clearToast && window.clearToast(); const t = document.querySelector('#toastEl'); if (t) t.style.display = 'none' }); await L.sleep(300)
    await L.pic(w, `x03-${size}-cancelled-input-window`)
    await p.evaluate(() => { const t = document.querySelector('#toastEl'); if (t) t.style.display = '' })
    await p.locator('[data-testid="win-inputedit-x"]').click(); await L.sleep(300)
    await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
  })

  /* X8 — Jump to a date */
  await part(w, `X8 Jump to a date ${S}`, 'head', 'the Today icon just left of the ✕, both at the right', async () => {
    await L.go(w, 'editsched'); await L.sleep(300)
    const btn = p.locator('button[aria-label="Jump to a date"]:visible').first()
    await w.press(btn)
    await p.waitForSelector('#weekCal'); await L.sleep(500)
    const h = await head('#weekCal', 'X8', 'Jump to a date')
    const t = await p.evaluate(() => { const hd = document.querySelector('#weekCal .airpop-head'), td = hd.querySelector('.wc-today').getBoundingClientRect(), x = hd.querySelector('.x').getBoundingClientRect(), hr = hd.getBoundingClientRect(); return { tl: Math.round(td.left * 10) / 10, tr: Math.round(td.right * 10) / 10, xl: Math.round(x.left * 10) / 10, xr: Math.round(x.right * 10) / 10, hr: Math.round(hr.right * 10) / 10 } })
    rowOut(`X8 Jump to a date ${S}`, 'Today icon', 'the Today icon sits just left of the ✕, both at the right', `Today icon ${t.tl}-${t.tr}; ✕ ${t.xl}-${t.xr}; head right ${t.hr}; gap icon→✕ ${Math.round((t.xl - t.tr) * 10) / 10}px; icon's right edge is ${Math.round((t.hr - t.tr) * 10) / 10}px from the head's right edge`, t.tr <= t.xl + 0.5 && (t.xl - t.tr) <= 24 && (t.hr - t.tr) <= 60)
    await L.pic(w, `x08-${size}-jump-to-a-date`)
    await p.locator('#weekCal .x').click(); await L.sleep(300)
  })

  /* X11 — a day's pop-up on the week */
  await part(w, `X11 a day's pop-up ${S}`, 'head', 'the ✕ in the corner', async () => {
    await L.go(w, 'editsched'); await L.sleep(300)
    const d = p.locator('[data-dayinfo]:visible').first()
    await d.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
    await w.press(d)
    await p.waitForSelector('#dayPop:not([hidden])'); await L.sleep(500)
    await head('#dayPop', 'X11', "a day's pop-up")
    await L.pic(w, `x11-${size}-day-popup`)
    await p.locator('#dayPopClose').click(); await L.sleep(300)
  })
} finally { await L.close(w) }
