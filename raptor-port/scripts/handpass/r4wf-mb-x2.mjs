// r4wf-mb-x2 — merge walk, Share B, X2: Tab off the day's last box on Ranger's row of a shared overseas duty (Hex +
// Ranger, 08:00–12:00, Sat 18 Jul — a day with no other Unavailable row), Ranger the LAST Unavailable row; Start 0900 Tab, End 1100 Tab,
// Remark "own" Tab; read the focus; Tab once more. Control: a one-man duty (Ranger alone).
// EXPECTED (brief): RECORD where the focus is after each Tab; FAIL only if merged is worse than main (focus on the page
// body where main keeps it on a control), or the remark is not on Ranger's own duty.
//   VAR=shared|solo  WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=desk ENG=chromium node scripts/handpass/r4wf-mb-x2.mjs
import { L, J, sleep, add, done, world, readOn, boardOn, boxSel, pic, heldRows, clickNow, BUILD, TAG } from './r4wf-mb-lib.mjs'
const VAR = process.env.VAR || 'shared'
console.log('r4wf-mb-x2 v2 (Sat 18 Jul)', BUILD, TAG, VAR)
const steps = [], pics = [], notes = []
const focusAt = p => p.evaluate(() => {
  const a = document.activeElement; if (!a || a === document.body) return { at: 'body' }
  const row = a.closest('[data-inprow]'), sec = a.closest('#sbBoard > [data-secmove]')
  return { at: a.getAttribute('data-ifld') || a.getAttribute('data-bfld') || a.tagName + (a.id ? '#' + a.id : '') + '.' + String(a.className).slice(0, 30) + ' "' + (a.textContent || '').trim().slice(0, 20) + '"', acc: a.getAttribute('data-acc'), row: row?.getAttribute('data-inprow') || null, rowWho: row ? [...row.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+') : null, section: sec?.getAttribute('data-secmove') || (a.closest('#schedBoard') ? 'board, outside sections' : 'outside the board') }
})
const unavOrder = p => p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].map(r => (r.querySelector('.inpedit')?.textContent.trim() || '?') + ' ' + [...r.querySelectorAll('.seat [data-person] .nm')].map(e => e.textContent.trim()).join('+')))
try {
  const w = await world(); const p = w.page
  const people = VAR === 'solo' ? [L.RANGER] : [L.HEX, L.RANGER]
  /* Sat 18 Jul has no Unavailable row of its own (probe2): the duty is then the last thing on the list */
  const before = await L.ids(p)
  const iid = await L.fileInput(w, TAG, '2026-07-18', { type: 'OD', people, from: '08:00', to: '12:00' })
  if (!iid) throw new Error('duty not filed; new ids ' + J((await L.ids(p)).filter(x => !before.includes(x))))
  notes.push('the duty filed 08:00–12:00 on Sat 18 Jul')
  await boardOn(w, 5)
  const inUnav = await p.locator(`#sbBoard > [data-secmove$=".unav"] [data-inprow^="${iid}"]`).count()
  if (!inUnav) {
    const acc = p.locator(`#schedBoard [data-inprow^="${iid}"] .accb:not(.undo)`).first()
    notes.push('not under Unavailable on filing; accept buttons ' + J(await p.locator(`#schedBoard [data-inprow^="${iid}"] .accb`).allTextContents()))
    if (!(await acc.count())) throw new Error('the duty is not under Unavailable and offers no accept')
    await acc.click(); await sleep(800); await p.mouse.click(3, 3); await sleep(500)
  }
  const order = await unavOrder(p); notes.push('Unavailable rows, top to bottom: ' + J(order))
  const lastSec = await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove]')].map(s => s.getAttribute('data-secmove')).at(-1))
  notes.push('last section: ' + lastSec + '; Ranger last row: ' + /Ranger$/.test(order.at(-1) || ''))
  const look = async label => { const r = await readOn(p, 'Jul 18', label); const o = { ...r, focus: await focusAt(p), held: await heldRows(p) }; steps.push(o); return o }
  await look('ready')
  pics.push(await pic(w, 'x2-0-ready'))
  const rs = await boxSel(p, 'Ranger', 'str')
  await clickNow(w, rs); await sleep(250)
  for (const [f, v] of [['str', '0900'], ['end', '1100'], ['rmks', 'own']]) {
    if (f !== 'str') { const cur = await p.evaluate(() => document.activeElement?.getAttribute('data-ifld') || ''); if (!cur.endsWith('.' + f)) { notes.push(`before ${f}: focus was ${cur}, clicked Ranger's ${f}`); await clickNow(w, await boxSel(p, 'Ranger', f)); await sleep(250) } }
    await p.keyboard.press('Control+A'); await p.keyboard.type(v); await p.keyboard.press('Tab'); await sleep(650)
    await look(`${f} ${v}, Tab`)
    pics.push(await pic(w, `x2-${f}-tab`))
  }
  await p.keyboard.press('Tab'); await sleep(650)
  await look('Tab once more')
  pics.push(await pic(w, 'x2-tab-more'))
  await p.mouse.click(3, 3); await sleep(700)
  await look('caret left')
  const s = steps.at(-1).store
  const own = s.filter(x => /^OD Ranger Jul 18 540-660 "own"/.test(x))
  const rowBtns = await p.evaluate(() => [...document.querySelectorAll('#sbBoard > [data-secmove$=".unav"] [data-inprow]')].filter(r => /Ranger|Hex/.test(r.innerText)).map(r => r.getAttribute('data-inprow') + ': ' + [...r.querySelectorAll('button')].filter(b => b.offsetWidth).map(b => b.textContent.trim() + (b.tabIndex < 0 ? '(tabindex ' + b.tabIndex + ')' : '')).join('/')))
  notes.push('buttons on the two men\'s rows after the caret left: ' + J(rowBtns))
  const hexOk = VAR === 'solo' || s.filter(x => /^OD Hex Jul 18 480-720 ""/.test(x)).length === 1
  add(`X2-${VAR}`, 'RECORD', { remarkOnHisOwnDuty: own.length === 1, hexOk, notes, focus: steps.map(x => ({ step: x.step, focus: x.focus, store: x.store, screen: x.screen, held: x.held })) }, pics)
} catch (e) { add(`X2-${VAR}`, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 300) + ' ' + J({ notes, steps: steps.map(x => ({ step: x.step, focus: x.focus, store: x.store })) }).slice(0, 3000), pics) }
await done('x2-' + VAR)
