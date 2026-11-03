// W3 / S18 (F3, state table T3): the input window's own calendar. Desktop and phone, admin. Every write through the app's controls.
import * as L from './isr-A-lib.mjs'
import { sleep } from './ibc-w3-lib.mjs'
const { say, check, note, notWalked, tid, press, shot, text } = L
console.log('ibc-w3-s18 v1')
const SIZE = process.env.SIZE || 'desktop'
const P = 'S18'
const { ctx, page, tap } = await L.session(SIZE)
const days = ['2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18']
const st = () => page.evaluate(ds => {
  const rc = document.querySelector('#inpEditPop .rc-read')
  const cell = i => document.querySelector(`#inpEdCal [data-iso="${i}"]`)
  const mark = ds.map(i => { const c = cell(i); if (!c) return i.slice(8) + ':absent'; const cls = String(c.className).split(/\s+/).filter(x => /sel|on|in|run|from|to|pick|range|start|end|wait|fin/.test(x)).join('.'); return i.slice(8) + ':' + (cls || '-') + (c.getAttribute('aria-label') || '').replace(/^.*?(, picked|, today)?$/, '$1') }).join(' ')
  const root = document.querySelector('#inpEdCal [data-testid="inpEdCal"]') || document.querySelector('#inpEdCal .dcal')
  return { read: rc && rc.textContent, marks: mark, rootCls: root && String(root.className), month: root && root.getAttribute('data-month') }
}, days)
const tapDay = async (iso) => { await press(page, tap, `#inpEdCal [data-iso="${iso}"]`); await sleep(500) }
const toast = () => L.toastText(page)
const inputsLen = () => page.evaluate(() => window.INPUTS.length)
async function openListNew() {
  await L.go(page, 'inputs')
  if (await page.locator('#inListBtn').count()) { await press(page, tap, '#inListBtn'); await sleep(400) }
  await press(page, tap, '#inNew'); await page.locator('#inpEditPop #inpEditType').waitFor(); await sleep(500)
}
async function closeWin() {
  if (await tid(page, 'oilconf').count()) { await page.keyboard.press('Escape'); await sleep(300) }
  if (await tid(page, 'win-inputedit-x').count()) { await press(page, tap, '[data-testid="win-inputedit-x"]'); await sleep(400) }
  if (await tid(page, 'discard-keep').count()) await press(page, tap, '[data-testid="discard-keep"]')
}
const month = async (iso) => { for (let i = 0; i < 40 && !(await page.locator(`#inpEdCal [data-iso="${iso}"]`).count()); i++) await L.winMonth(page, tap, iso) }
try {
  /* row 1 · nothing picked (List "+ Input") */
  await openListNew()
  let s = await st(); note(`${P}.1 ${SIZE}`, `opened from the List's + Input: ${JSON.stringify(s)}`)
  await month('2026-07-14'); s = await st(); note(`${P}.1 ${SIZE}`, `July shown: ${JSON.stringify(s)}`)
  await shot(page, `${P}-1`, SIZE, 'nothing-picked')
  const n0 = await inputsLen()
  await press(page, tap, '#inpEditSave'); await sleep(600)
  const t0 = await toast(); const open0 = await page.locator('#inpEditPop #inpEditType').count()
  check(`${P}.1 ${SIZE}`, 'Save with nothing picked is refused with "Pick a start date…" and nothing is saved', /Pick a start date/i.test(t0 || '') && (await inputsLen()) === n0 && open0 > 0, { toast: t0, saved: (await inputsLen()) - n0, windowOpen: open0 })
  await shot(page, `${P}-1`, SIZE, 'save-refused')
  await tapDay('2026-07-14'); s = await st()
  note(`${P}.1 ${SIZE}`, `tap 14 first: ${JSON.stringify(s)}`)
  check(`${P}.1 ${SIZE}`, 'first tap sets the start (line reads Jul 14)', /Jul 14/.test(s.read || ''), s.read)
  await shot(page, `${P}-1`, SIZE, 'start-14-waiting')

  /* row 2 · start set, waiting (14): same day, later, earlier */
  await tapDay('2026-07-14'); s = await st()
  note(`${P}.2 ${SIZE}`, `tap 14 again: ${JSON.stringify(s)}`)
  check(`${P}.2 ${SIZE}`, 'a tap on the same day stays 14, still waiting (line reads Jul 14 only)', /^Jul 14$/.test((s.read || '').trim()), s.read)
  await shot(page, `${P}-2`, SIZE, 'same-day-again')
  await tapDay('2026-07-16'); s = await st()
  check(`${P}.2 ${SIZE}`, 'then a tap on 16 gives 14 → 16', /Jul 14 → Jul 16/.test(s.read || ''), s.read)
  note(`${P}.2 ${SIZE}`, `after 14, 14, 16: ${JSON.stringify(s)}`)
  await shot(page, `${P}-2`, SIZE, '14-14-16')
  /* row 3 · range finished: tap 14 / later / earlier */
  await tapDay('2026-07-14'); s = await st()
  check(`${P}.3 ${SIZE}`, 'finished range 14→16, a tap on 14: a new start 14', /^Jul 14$/.test((s.read || '').trim()), s.read)
  await shot(page, `${P}-3`, SIZE, 'finished-then-tap-14')
  await tapDay('2026-07-16'); await tapDay('2026-07-18'); s = await st()
  check(`${P}.3 ${SIZE}`, 'finished 14→16, a tap on 18: a new start 18 (not 14→18)', /^Jul 18$/.test((s.read || '').trim()), s.read)
  await tapDay('2026-07-16'); await tapDay('2026-07-17'); s = await st()
  note(`${P}.3 ${SIZE}`, `16, 17 -> finished 16→17: ${JSON.stringify(s.read)}`)
  await tapDay('2026-07-13'); s = await st()
  check(`${P}.3 ${SIZE}`, 'finished 16→17, a tap on the earlier 13: a new start 13', /^Jul 13$/.test((s.read || '').trim()), s.read)
  /* row 2 again: earlier day while waiting */
  await tapDay('2026-07-15'); await tapDay('2026-07-13'); s = await st()
  check(`${P}.2 ${SIZE}`, 'start 15 waiting, a tap on the earlier 13: a new start 13, waiting', /^Jul 13$/.test((s.read || '').trim()), s.read)
  await shot(page, `${P}-2`, SIZE, 'start-15-then-earlier-13')
  /* Save with start only waiting -> one-day */
  await tapDay('2026-07-14')  // 13 waiting -> 14 would finish 13→14; start fresh
  s = await st(); note(`${P}.2 ${SIZE}`, `13 then 14: ${JSON.stringify(s.read)}`)
  await closeWin(); await sleep(300)
  /* Save with a waiting start only: a one-day input */
  await openListNew(); await month('2026-07-14')
  await page.selectOption('#inpEditType', 'OL').catch(() => {})
  await tapDay('2026-07-14'); await tapDay('2026-07-14'); s = await st()
  const n1 = await inputsLen()
  const ids1 = await page.evaluate(() => window.INPUTS.map(r => String(r.iid)))
  await press(page, tap, '#inpEditSave'); await sleep(700)
  if (await tid(page, 'oilconf').count()) { await press(page, tap, '[data-testid="oil-yes"]').catch(() => {}); await press(page, tap, '[data-testid="oilconf-save"]').catch(() => {}); await sleep(500) }
  if (await tid(page, 'docconf-nodoc').count()) { await press(page, tap, '[data-testid="docconf-nodoc"]'); await sleep(400) }
  const made = await page.evaluate(b => window.INPUTS.filter(r => !b.includes(String(r.iid))).map(r => ({ iid: String(r.iid), type: r.type, date: r.date, endDate: r.endDate, people: r.people && r.people.map(e => e.p), person: r.person })), ids1)
  note(`${P}.2 ${SIZE}`, `Save with 14 waiting (read ${JSON.stringify(s.read)}): INPUTS ${n1} -> ${await inputsLen()}; the new record: ${JSON.stringify(made.slice(-1))}`)
  await shot(page, `${P}-2`, SIZE, 'save-with-14-waiting')
  const newIid = (made.slice(-1)[0] || {}).iid
  await closeWin()
  if (!newIid || (await inputsLen()) !== n1 + 1) notWalked(`${P}.4 ${SIZE}`, 'premise: the one-day OL was not saved, so no existing one-day input to open')
  else {
    /* row 4 · an existing one-day input opened: tap same / later / earlier; Save with nothing changed */
    const openIt = async () => {
      await L.go(page, 'inputs'); if (await page.locator('#inListBtn').count()) { await press(page, tap, '#inListBtn'); await sleep(500) }
      const row = page.locator(`#inBody [data-iid="${newIid}"] .in-open, #inList [data-iid="${newIid}"] .in-open, .icard[data-iid="${newIid}"]`).first()
      if (await row.count()) { await row.scrollIntoViewIfNeeded(); await press(page, tap, row); await sleep(600) }
      return (await page.locator('#inpEditPop #inpEditType').count()) > 0
    }
    const ok = await openIt()
    if (!ok) { const ids = await page.evaluate(() => [...document.querySelectorAll('#page-inputs [data-iid],#page-inputs [data-in],#page-inputs [data-input]')].slice(0, 3).map(e => e.outerHTML.slice(0, 120))); notWalked(`${P}.4 ${SIZE}`, `premise: could not open the saved input from the List (${JSON.stringify(ids)})`) }
    else {
      await month('2026-07-14'); s = await st(); note(`${P}.4 ${SIZE}`, `existing one-day input opened: ${JSON.stringify(s)}`)
      await shot(page, `${P}-4`, SIZE, 'existing-open')
      const nb = await inputsLen()
      await tapDay('2026-07-14'); s = await st()
      check(`${P}.4 ${SIZE}`, 'a tap on its own day stays 14', /^Jul 14$/.test((s.read || '').trim()), s.read)
      await tapDay('2026-07-16'); s = await st()
      note(`${P}.4 ${SIZE}`, `tap 14 then 16 on an existing one-day input (record's own table row: extends 14→16): ${JSON.stringify(s.read)}`)
      await shot(page, `${P}-4`, SIZE, 'existing-14-then-16')
      await closeWin(); await sleep(300)
      /* reopen, change nothing, Save -> closes, no stamp */
      if (await openIt()) {
        const before = await page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === i); return r && { mod: r.mod, modBy: r.modBy, modAt: r.modAt } }, newIid)
        await press(page, tap, '#inpEditSave'); await sleep(600)
        const after = await page.evaluate(i => { const r = window.INPUTS.find(x => String(x.iid) === i); return r && { mod: r.mod, modBy: r.modBy, modAt: r.modAt } }, newIid)
        const closed = (await page.locator('#inpEditPop #inpEditType').count()) === 0
        check(`${P}.4 ${SIZE}`, 'Save with nothing changed closes the window and stamps nothing', closed && JSON.stringify(before) === JSON.stringify(after), { closed, before, after })
        await shot(page, `${P}-4`, SIZE, 'save-unchanged')
      } else notWalked(`${P}.4b ${SIZE}`, 'premise: could not reopen the input')
    }
  }
  /* D1298 interplay: the window waiting for its end, a date tapped on the month BEHIND it */
  await L.toInputsCal(page, tap); await L.incalMonth(page, tap, 2026, 7); await L.openDay(page, '2026-07-14')
  await press(page, tap, '#icPopAdd'); await page.locator('#inpEditPop #inpEditType').waitFor(); await sleep(500)
  await tapDay('2026-07-14')
  const w0 = await st()
  const nb6 = await inputsLen()
  const behind = await page.evaluate(() => {
    const c = document.querySelector('#inpCal [data-icday="2026-07-24"]'); if (!c) return null
    c.scrollIntoView({ block: 'center' })
    const r = c.getBoundingClientRect(); const px = r.left + 10, py = r.top + 10; const e = document.elementFromPoint(px, py); window.__pt = { x: px, y: py }
    return { box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], top: e && (e.closest('[data-icday]') ? 'the date ' + e.closest('[data-icday]').getAttribute('data-icday') : e.tagName + '.' + String(e.className).slice(0, 30)) }
  })
  note(`${P}.6 ${SIZE}`, `window waiting (14 picked) ${JSON.stringify(w0.read)}; the date 24 Jul behind: ${JSON.stringify(behind)}`)
  if (!behind || !/the date 2026-07-24/.test(behind.top || '')) notWalked(`${P}.6 ${SIZE}`, `premise: the date 24 Jul behind the window is not what stands on top there (${JSON.stringify(behind)})`)
  else {
    const lit0 = await page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].filter(e => /is-open|sel|pick/.test(String(e.className))).map(e => e.getAttribute('data-icday') + ':' + e.className.toString().slice(0, 50)))
    const pt = await page.evaluate(() => window.__pt); if (tap) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y); await sleep(600)
    const w1 = await st()
    const lit1 = await page.evaluate(() => [...document.querySelectorAll('#inpCal [data-icday]')].filter(e => /is-open|sel|pick/.test(String(e.className))).map(e => e.getAttribute('data-icday') + ':' + e.className.toString().slice(0, 50)))
    note(`${P}.6 ${SIZE}`, `after the tap behind: window line ${JSON.stringify(w1.read)}; page dates lit before ${JSON.stringify(lit0)} after ${JSON.stringify(lit1)}; windows open: ${await page.evaluate(() => [...document.querySelectorAll('[data-testid^="win-"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.getAttribute('data-testid')))}; records ${nb6} -> ${await inputsLen()}; the day window behind now reads: ${JSON.stringify(((await text(page, '[data-testid="win-inputsday"]')) || '').slice(0, 40))}`)
    await shot(page, `${P}-6`, SIZE, 'tap-behind-24')
  }
  await closeWin(); await sleep(300)
  if (await tid(page, 'win-inputsday-x').count()) await press(page, tap, '[data-testid="win-inputsday-x"]')
  /* the List's own date filter: 14, 14 is one day (must stay) */
  await L.go(page, 'inputs'); if (await page.locator('#inListBtn').count()) { await press(page, tap, '#inListBtn'); await sleep(400) }
  const db = page.locator('#inRangeBtn, [data-testid="in-range"], #inDates').first()
  if (!(await db.count())) { const b = await page.evaluate(() => [...document.querySelectorAll('#page-inputs button')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.id + '|' + (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 24)).slice(0, 25)); notWalked(`${P}.5 ${SIZE}`, `premise: the list's dates button was not found by its usual ids; buttons: ${JSON.stringify(b)}`) }
  else {
    await press(page, tap, db); await sleep(500)
    const cal = page.locator('#inRangePop')
    if (!(await cal.count())) notWalked(`${P}.5 ${SIZE}`, 'premise: the list dates pop-up did not open')
    else {
      for (let i = 0; i < 20; i++) { const m = await page.locator('#inRangePop [data-testid="inRangeCal"], #inRangePop .dcal').first().getAttribute('data-month').catch(() => null); if (!m || m === '2026-07') break; await press(page, tap, '#inRangePop button[aria-label="' + (m < '2026-07' ? 'Next' : 'Previous') + ' month"]') }
      const sel = '#inRangePop [data-iso="2026-07-14"]'
      await press(page, tap, sel); await press(page, tap, sel); await sleep(400)
      const read = await text(page, '#inRangePop .rc-read')
      check(`${P}.5 ${SIZE}`, 'the dates of the List: a tap on 14 then 14 again is the one day 14', /14 Jul → 14 Jul|^14 Jul$/.test((read || '').trim()), read)
      await shot(page, `${P}-5`, SIZE, 'list-dates-14-14')
    }
  }
} catch (e) { say(`ERROR ${P} ${SIZE}: ${e.message.split('\n').slice(0, 3).join(' / ')} @ ${(e.stack.split('\n').find(l => l.includes('ibc-w3-s18')) || '').trim()}`); await shot(page, P, SIZE, 'error').catch(() => {}) }
await ctx.close()
await L.finish(`s18-${SIZE}`)
