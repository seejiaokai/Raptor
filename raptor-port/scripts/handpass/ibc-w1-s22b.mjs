// W1 — S22a redone with the keys put in the search box WITHOUT a press; T1 picker; S23c (a carried planning note). v1
import * as L from './ibc-w1-lib.mjs'
const { sleep, tid, press, shot, row, act, wins } = L
console.log('ibc-w1-s22b v1')
L.startRun('keep')
const browser = await L.launch()
const mk = async () => { const w = await L.session(browser, 'desktop'); await L.inputsCal(w, 2026, 7); await sleep(400); return w }
const ask = page => tid(page, 'idy-ask').count()
{
  const w = await mk(); const p = w.page
  try {
    await L.openIcDay(w, '2026-07-15')
    await p.locator('[data-testid="idy-open"]').first().focus(); await p.keyboard.press('Delete'); await sleep(300)
    const a0 = await ask(p)
    /* keys to the search box by the keyboard only: Shift+Tab / Tab until it holds them */
    let reached = false
    for (let i = 0; i < 80 && !reached; i++) { await p.keyboard.press('Shift+Tab'); const a = await act(p); if (a && a.id === 'inFSearch') reached = true }
    const k = { reached, active: await act(p), askNow: await ask(p), wins: await wins(p) }
    if (!reached) { await p.locator('#inFSearch').focus(); k.note = 'Tab order did not reach the box; focused programmatically'; k.active = await act(p); k.askNow = await ask(p) }
    await p.keyboard.type('zz'); await sleep(150)
    await p.keyboard.press('Escape'); await sleep(400)
    const e = { ask: await ask(p), wins: await wins(p), value: await p.locator('#inFSearch').inputValue(), active: await act(p) }
    row('S22a2', 'delete question up (' + a0 + '); keys moved into the List search box without a press, typed zz; Escape', 'Keep, wherever the keys are (F6): question gone, day open', { beforeEscape: k, after: e }, (a0 === 1 && k.askNow === 1) ? (e.ask === 0 && e.wins.includes('win-inputsday') ? 'PASS' : 'FAIL') : 'NOT WALKED premise — the question was not still up when the box held the keys', 'S22a2.png')
    await shot(p, 'S22a2')
    await L.closeWins(w)
    /* picker */
    await L.openIcDay(w, '2026-07-15')
    await p.locator('#icAddPuck').click(); await sleep(400)
    const ppl = p.locator('#icNewNotePpl')
    if (await ppl.count()) {
      await ppl.click(); await sleep(500)
      const up = await p.locator('#icPickCancel').count()
      const h0 = { wins: await wins(p), active: await act(p) }
      await p.keyboard.press('Escape'); await sleep(400)
      const h1 = { wins: await wins(p), pickerAfter: await p.locator('#icPickCancel').count(), noteComposerOpen: await p.locator('.ic-poppuck-edit').count() }
      row('T1-picker2', 'day open; + Note, then the note "add people" button; picker up; Escape', 'the picker closes (as Cancel); the day stays', { pickerUp: up, before: h0, after: h1 }, up && !h1.pickerAfter && h1.wins.includes('win-inputsday') ? 'PASS' : (up ? 'FAIL' : 'NOT WALKED premise — picker did not open'), 'T1-picker2.png')
      await shot(p, 'T1-picker2')
    } else row('T1-picker2', 'people picker from the new note', 'picker closes', 'no #icNewNotePpl after + Note', 'NOT WALKED premise')
  } catch (e) { L.say(`ERROR s22b: ${e.stack}`); await shot(p, 's22b-error').catch(() => {}) }
  await w.ctx.close()
}
/* S23c: carry a planning note */
{
  const w = await mk(); const p = w.page
  try {
    await L.openIcDay(w, '2026-07-15')
    for (const txt of ['walker note one', 'walker note two']) {
      await p.locator('#icAddPuck').click(); await sleep(300)
      const box = p.locator('.ic-poppuck-edit').first()
      await box.fill(txt); await p.keyboard.press('Enter'); await sleep(500)
    }
    const notes = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [class*="ic-pk"], [data-testid="win-inputsday"] [class*="puck"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => ({ cls: e.className.toString().slice(0, 40), txt: (e.textContent || '').trim().slice(0, 30), id: e.getAttribute('data-pkid') || e.getAttribute('data-note') || null, h: Math.round(e.getBoundingClientRect().height) })).slice(0, 20))
    row('S23c-0', 'create two day notes via + Note', 'two notes listed', notes, notes.length >= 2 ? 'RECORDED' : 'NOT WALKED premise — notes not made')
    await shot(p, 'S23c-notes')
    const nb = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .ic-sechandle')].map(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, txt: (e.parentElement.textContent || '').trim().slice(0, 20) } }))
    row('S23c-1', 'the two note drag handles (the six dots at the left of each note)', 'RECORD', nb, nb.length >= 2 ? 'RECORDED' : 'NOT WALKED premise — fewer than two notes')
    if (nb.length >= 2) {
      const order = () => p.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] .ic-poppuck.ic-note')].map(e => (e.textContent || '').trim().slice(0, 25)))
      const st = () => p.evaluate(() => ({ body: document.body.className, ghostsOrBars: [...document.querySelectorAll('[class*="ghost"], .pk-drag, [class*="landing"], [class*="drop-bar"], .ic-sec-drag, .is-dragging')].map(e => e.className.toString().slice(0, 30)) }))
      const before = await order()
      await p.mouse.move(nb[1].x, nb[1].y); await p.mouse.down(); await p.mouse.move(nb[0].x, nb[0].y - 10, { steps: 12 }); await sleep(300)
      const mid = { st: await st(), wins: await wins(p) }
      await shot(p, 'S23c-carrying-note')
      await p.keyboard.press('Escape'); await sleep(400)
      const e1 = { st: await st(), wins: await wins(p), order: await order() }
      await p.mouse.up(); await sleep(500)
      const winsAfter = await wins(p)
      if (!winsAfter.includes('win-inputsday')) await L.openIcDay(w, '2026-07-15')
      const after = await order()
      row('S23c', 'carry the second note up over the first, Escape, release', 'note back, order unchanged (premise: something was carried)', { before, mid, afterEscape: e1, dayWindowClosedByEscape: !winsAfter.includes('win-inputsday'), orderAfterReopeningDay: after }, (JSON.stringify(before) === JSON.stringify(after) && winsAfter.includes('win-inputsday')) ? 'PASS' : 'FAIL', 'S23c-after-release.png')
      await shot(p, 'S23c-after-release')
    }
  } catch (e) { L.say(`ERROR s23c: ${e.stack}`); await shot(p, 's23c-error').catch(() => {}) }
  await w.ctx.close()
}
await browser.close()
L.finishRun('s22b')
