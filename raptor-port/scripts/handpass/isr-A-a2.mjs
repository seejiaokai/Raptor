// A2 (Escape with the window behind pressed to the front), A3 (the input window's calendar: a tap on the picked day, then another),
// A4 (a year with no Leave War period — what the Inputs page says).
import * as L from './isr-A-lib.mjs'
const { say, check, note, notWalked, tid, press, shot, mark, unmark, text } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const wins = page => page.evaluate(() => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' }
  const out = []
  for (const [k, sel] of [['day', '[data-testid="win-inputsday"]'], ['editor', '[data-testid="win-inputedit"]'], ['OIL question', '[data-testid="oilconf"]']]) { const e = document.querySelector(sel); if (e && vis(e)) out.push(k + (e.classList.contains('front') ? '(front)' : '')) }
  for (const e of document.querySelectorAll('[role=dialog], .airpop, .sheet')) if (vis(e) && !e.matches('[data-testid="win-inputsday"],[data-testid="win-inputedit"],[data-testid="oilconf"]')) out.push('other: ' + (e.getAttribute('data-testid') || e.getAttribute('aria-label') || e.className.toString().slice(0, 30)) + ' :: ' + (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90))
  return out
})
const active = page => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName.toLowerCase()}#${a.id || ''}.${String(a.className).slice(0, 30)}` : null })
export async function a2() {
  for (const size of ['desktop', 'phone']) {
    const { ctx, page, tap } = await L.session(size)
    try {
      await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-18')
      await press(page, tap, '#icPopAdd'); await page.locator('#inpEditPop #inpEditType').waitFor(); await sleep(300)
      await page.locator('#inpEditRmk').click(); await page.keyboard.type('draft A2'); await sleep(200)
      const w0 = await wins(page), a0 = await active(page)
      const day = page.locator('[data-testid="win-inputsday"]')
      const db = await day.boundingBox(), eb = await page.locator('[data-testid="win-inputedit"]').boundingBox()
      if (!tap) { // a desktop editor stands over the day window: move it aside by its own grip, as a person would
        const g = await page.locator('[data-testid="win-inputedit"] .win-grip').first().boundingBox()
        await page.mouse.move(g.x + g.width / 2, g.y + g.height / 2); await page.mouse.down(); await page.mouse.move(g.x - 250, g.y + 40, { steps: 8 }); await page.mouse.up(); await sleep(400)
      }
      // press the day window where the editor does not cover it: a point whose top element is the day window itself
      const pt = await page.evaluate(() => { const d = document.querySelector('[data-testid="win-inputsday"]'); const r = d.getBoundingClientRect(); for (let y = r.top + 6; y < r.bottom - 4; y += 12) for (let x = r.left + 6; x < r.right - 4; x += 12) { const e = document.elementFromPoint(x, y); if (e && d.contains(e) && !e.closest('button,input,select,textarea,[role=button]')) return { x, y, el: String(e.className).slice(0, 40) } } return null })
      if (!pt) { notWalked(`A2 ${size}`, 'no spot of the day window is left uncovered by the editor to press'); await ctx.close(); continue }
      if (tap) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y)
      await sleep(500)
      const w1 = await wins(page), a1 = await active(page)
      await shot(page, 'A2', size, 'day-pressed-to-front')
      // the focus the first Escape meets: put it back into the Remarks box (the bug's own precondition — keyboard still in the box)
      const refocus = await page.evaluate(() => { const r = document.getElementById('inpEditRmk'); if (r) { r.focus(); return document.activeElement === r } return false })
      const w1b = await wins(page), a1b = await active(page)
      note(`A2 ${size}`, `windows before the press ${JSON.stringify(w0)} focus ${a0}; after pressing the day window's title ${JSON.stringify(w1)} focus ${a1}; focus put back into Remarks (${refocus}) -> windows ${JSON.stringify(w1b)} focus ${a1b}; boxes day ${JSON.stringify(db)} editor ${JSON.stringify(eb)}`)
      await page.keyboard.press('Escape'); await sleep(700)
      const w2 = await wins(page)
      const draft = await page.evaluate(() => { const r = document.getElementById('inpEditRmk'); return r ? r.value : null })
      await shot(page, 'A2', size, 'after-escape')
      say(`A2 ${size} after ONE Escape: windows ${JSON.stringify(w2)}; Remarks draft still there: ${JSON.stringify(draft)}`)
      const editorOpen = w2.some(x => x.startsWith('editor')), dayOpen = w2.some(x => x.startsWith('day'))
      check('A2', `${size} Escape (focus still in Remarks, the day window in front) closes only the window in front — the editor and its draft stay`, editorOpen && draft === 'draft A2', { windows: w2, draft, dayOpen })
    } catch (e) { say(`ERROR A2 ${size}: ${e.message.split('\n')[0]}`); await shot(page, 'A2', size, 'error').catch(() => {}) }
    await ctx.close()
  }
}
export async function a3() {
  for (const size of ['desktop', 'phone']) {
    const { ctx, page, tap } = await L.session(size)
    try {
      await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-14')
      const read = () => page.evaluate(() => ({ line: (document.querySelector('#inpEditPop .rc-read') || {}).textContent, till: (document.querySelector('[data-testid="inped-till"]') || {}).textContent, picked: [...document.querySelectorAll('#inpEdCal [data-iso]')].filter(b => b.getAttribute('aria-pressed') === 'true' || b.classList.contains('on') || b.classList.contains('sel') || b.classList.contains('in')).map(b => b.getAttribute('data-iso')) }))
      const open = async () => { await press(page, tap, '#icPopAdd'); await page.locator('#inpEditPop #inpEditType').waitFor(); await sleep(300) }
      const close = async () => { await press(page, tap, '[data-testid="win-inputedit-x"]').catch(() => {}); await sleep(300); if (await tid(page, 'oilconf').count()) await page.keyboard.press('Escape'); await sleep(300) }
      // sequence 1: one tap on another day -> a range
      await open()
      const s0 = await read()
      await press(page, tap, '#inpEdCal [data-iso="2026-07-16"]'); await sleep(300)
      const s1 = await read()
      await shot(page, 'A3', size, 'seq1-one-tap-on-16')
      await close()
      // sequence 2: a tap on the already-picked day (14), then a tap on another (16)
      await open()
      await press(page, tap, '#inpEdCal [data-iso="2026-07-14"]'); await sleep(700)
      const t1 = await read()
      await press(page, tap, '#inpEdCal [data-iso="2026-07-16"]'); await sleep(300)
      const t2 = await read()
      await mark(page, '#inpEditPop .rc-read'); await shot(page, 'A3', size, 'seq2-tap-picked-then-16-marked')
      say(`A3 ${size} opened: ${JSON.stringify(s0)}; seq1 (tap 16): ${JSON.stringify(s1)}; seq2 after tap on picked 14: ${JSON.stringify(t1)}, then tap 16: ${JSON.stringify(t2)}`)
      const gave = (r) => (r.line || '')
      check('A3', `${size} a tap on the picked day then a tap on another gives the same as a single tap on that other (range 14-16)`, gave(s1) === gave(t2) && /14.*16|Jul 14 → Jul 16/.test(gave(s1)), { single: gave(s1), twoTaps: gave(t2) })
      await close()
    } catch (e) { say(`ERROR A3 ${size}: ${e.message.split('\n')[0]}`); await shot(page, 'A3', size, 'error').catch(() => {}) }
    await ctx.close()
  }
}
export async function a4() {
  for (const size of ['desktop', 'phone']) {
    const { ctx, page, tap } = await L.session(size)
    try {
      const iso = '2029-03-10'   // a Saturday, three years past the demo's Leave War periods
      const dow = await page.evaluate(i => new Date(i + 'T12:00:00Z').getUTCDay(), iso)
      const [who] = await L.freeMen(page, 1)
      await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2029, 3)
      const heading = await page.locator('#inpCal .ic-mon').innerText()
      await L.openDay(page, iso)
      const dayText0 = await text(page, '[data-testid="win-inputsday"]')
      await shot(page, 'A4', size, 'day-window-no-period')
      await press(page, tap, '#icPopAdd'); await page.locator('#inpEditPop #inpEditType').waitFor()
      await page.selectOption('#inpEditPop #inpEditType', 'Duty'); await page.selectOption('#inpEditPop #inpEditPerson', who)
      const ad = page.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click()
      await page.fill('#inpEditPop #inpEditStart', '09:00'); await page.fill('#inpEditPop #inpEditEnd', '12:00')
      const winTxt = await text(page, '[data-testid="win-inputedit"]')
      const n0 = await page.evaluate(() => window.INPUTS.length)
      await press(page, tap, '#inpEditSave'); await sleep(700)
      const asked = await tid(page, 'oilconf').count()
      const q = asked ? await text(page, '[data-testid="oilconf"]') : null
      if (asked) { await mark(page, '[data-testid="oilconf"]'); await shot(page, 'A4', size, 'oil-question-asked-marked'); await unmark(page, '[data-testid="oilconf"]') }
      if (asked) { await press(page, tap, '[data-testid="oil-yes"]'); await press(page, tap, '[data-testid="oilconf-save"]'); await sleep(500) }
      const saved = (await page.evaluate(() => window.INPUTS.length)) === n0 + 1
      const oilRec = await page.evaluate(() => { const r = window.INPUTS[window.INPUTS.length - 1]; return r && { date: r.date, yr: r.yr, type: r.type, oil: r.oil } })
      await shot(page, 'A4', size, 'after-yes-day-window')
      const page_ = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '))
      const mentions = (page_.match(/[^.]{0,60}(no period|period is missing|no Leave War period|Leave War period|Create the 2029|2029 period)[^.]{0,60}/gi) || []).slice(0, 4)
      say(`A4 ${size} ${iso} is weekday ${dow} (6 = Saturday), calendar on ${heading.trim()}; the question asked: ${!!asked} ${JSON.stringify((q || '').slice(0, 220))}; the Duty saved: ${saved} OIL ${JSON.stringify(oilRec)}; the Inputs page mentions of a missing period: ${JSON.stringify(mentions)}; window words: ${JSON.stringify((winTxt || '').slice(0, 200))}`)
      check('A4', `${size} a weekend in a year with no period: the Inputs page says the period is missing (instead of asking the OIL question and saving)`, mentions.length > 0 && !asked, { asked: !!asked, saved, mentions })
    } catch (e) { say(`ERROR A4 ${size}: ${e.message.split('\n')[0]}`); await shot(page, 'A4', size, 'error').catch(() => {}) }
    await ctx.close()
  }
}
if (process.argv[1].endsWith('isr-A-a2.mjs')) { const only = process.argv[2]; if (!only || only === 'a2') await a2(); if (!only || only === 'a3') await a3(); if (!only || only === 'a4') await a4(); await L.finish('a234') }
