// shr-a-a10 — share A, A10 (Astra S13, O-S10, F-S13): the kinds, one pass each, filed through the app's own doors, then
// typed on Ranger's Board row on Wed 15 Jul: start 0900 Tab, end 1100 Tab, remark Tab, caret away.
// KIND=allday | am | od3 | cse3 | attach | other | moved
// EXPECTED: Ranger alone changed each time, his own input of the SAME kind, span, "To"; the second change on his own;
// RECORD anything about an OIL question (none should open).
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk ENG=chromium KIND=allday node scripts/handpass/shr-a-a10.mjs
import { L, J, sleep, add, done, world, openBoard, read, boxSel, rowSel, typeIn, pressAt, pic, away, note, TAG } from './shr-a-lib.mjs'
const KIND = process.env.KIND || 'allday'
console.log('shr-a-a10 v1', TAG, KIND)
const SPEC = {
  allday: { type: 'LL', day: L.WED }, am: { type: 'LL', day: L.WED, span: 'am' },
  od3: { type: 'OD', day: '2026-07-13', last: L.WED }, cse3: { type: 'CSE', day: '2026-07-13', last: L.WED },
  attach: { type: 'Attach', day: L.WED, to: 'Base North' }, other: { type: 'Other', day: L.WED, goes: 'u' },
  moved: { type: 'Appointment', day: L.WED, from: '08:00', to_: '10:00', move: true },
}[KIND]
const full = p => p.evaluate(() => window.INPUTS.filter(r => (r.people || []).some(x => x.p === 'bane' || x.p === 'rocky') && ['Jul 13', 'Jul 14', 'Jul 15'].includes(r.date)).map(r => ({ iid: r.iid, type: r.type, title: r.title, to: r.to ?? r.dest ?? r.attTo, date: r.date, endDate: r.endDate, allday: r.allday, half: r.half, s: r.s, e: r.e, remarks: r.remarks, people: (r.people || []).map(x => x.p), oil: r.oil ?? r.oilAns, goes: r.goes ?? r.lane ?? r.acc })))
const oilOpen = p => p.locator('[data-testid="oilconf"]:visible').count()
const steps = [], pics = [], checks = [], oil = []
const chk = (n, ok, seen) => checks.push(`${ok ? 'ok' : 'WRONG'} ${n}: ${seen}`)
try {
  const w = await world(); const p = w.page
  /* file it through the Inputs page's own window */
  await L.openDay(w, SPEC.day)
  const before = await L.ids(p)
  await L.press(w, '#icPopAdd'); await p.locator('#inpEditPop #inpEditType').waitFor()
  await p.selectOption('#inpEditPop #inpEditType', SPEC.type); await sleep(300)
  await L.press(w, '#inpEditPop [data-testid="pp-several"]')
  for (const id of [L.RANGER, L.HEX]) if ((await p.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await L.press(w, `#inpEditPop [data-pp="${id}"]`)
  const lit = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (![L.RANGER, L.HEX].includes(id)) await L.press(w, `#inpEditPop [data-pp="${id}"]`)
  if (SPEC.span) await L.press(w, `#inpEditSpan [data-span="${SPEC.span}"]`)
  if (SPEC.from) { const ad = p.locator('#inpEditPop #inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.click(); await p.fill('#inpEditPop #inpEditStart', SPEC.from); await p.fill('#inpEditPop #inpEditEnd', SPEC.to_) }
  if (SPEC.to) await p.fill('#inpEditPop #inpEditTo', SPEC.to)
  if (SPEC.goes) await L.press(w, `#inpEditPop [data-testid="inpEdit-goes-${SPEC.goes}"]`)
  if (SPEC.last) await L.press(w, `#inpEditPop [data-testid="inpEdCal-day-${SPEC.last}"]`)
  const winSays = await p.evaluate(() => (document.querySelector('#inpEditPop')?.innerText || '').split('\n').slice(0, 2).join(' | '))
  await L.press(w, '#inpEditSave')
  const asked = await L.answerAsks(w)
  if (await p.locator('[data-testid="win-inputsday-x"]').count()) await L.press(w, '[data-testid="win-inputsday-x"]')
  const made = (await L.ids(p)).filter(x => !before.includes(x))
  steps.push({ step: `filed ${KIND} (${SPEC.type}) — the window said "${winSays}"; questions asked at Save: ${J(asked)}; new inputs ${J(made)}`, full: await full(p) })
  if (made.length !== 1) throw new Error('the fixture did not file one input: ' + J(made))
  const iid = made[0]
  const rec0 = (await full(p)).find(r => r.iid === iid)
  if (SPEC.last) chk('the fixture spans Mon 13 – Wed 15', rec0.date === 'Jul 13' && rec0.endDate === 'Jul 15', J(rec0))
  await openBoard(w)
  if (SPEC.move) {
    /* a commitment a scheduler moves onto the Unavailable list — the Board's own door on its Personal Inputs line */
    if (!(await p.locator(`#sbBoard [data-inprow^="${iid}"]`).filter({ visible: true }).count())) await pressAt(w, '#sbBoard [data-pitog]')
    const btns = await p.evaluate(i => [...document.querySelectorAll(`#sbBoard [data-inprow^="${i}"] button`)].filter(b => b.offsetWidth).map(b => `${b.className}|${b.getAttribute('data-acc')}|${b.textContent.trim()}|${b.title}`), iid)
    steps.push({ step: 'the commitment\'s line offers: ' + J(btns) })
    let mv = p.locator(`#sbBoard [data-inprow^="${iid}"] button`, { hasText: /UNAVAIL/i }).first()
    if (!(await mv.count())) {
      /* filed by the admin it stands on the Ground Programme: its Reject takes it to Personal Inputs, whose line offers → UNAVAIL */
      await p.locator(`#sbBoard [data-inprow^="${iid}"] .accb[data-acc="x"]`).first().click(); await sleep(800)
      steps.push({ step: 'Reject on its Ground Programme line: note "' + await note(p) + '"' })
      if (!(await p.locator(`#sbBoard > [data-secmove$=".inputs"] [data-inprow^="${iid}"]`).filter({ visible: true }).count())) await pressAt(w, '#sbBoard [data-pitog]')
      steps.push({ step: 'its Personal Inputs line offers: ' + J(await p.evaluate(i => [...document.querySelectorAll(`#sbBoard [data-inprow^="${i}"] button`)].filter(b => b.offsetWidth).map(b => `${b.className}|${b.getAttribute('data-acc')}|${b.textContent.trim()}`), iid)) })
      mv = p.locator(`#sbBoard [data-inprow^="${iid}"] button`, { hasText: /UNAVAIL/i }).first()
    }
    if (!(await mv.count())) throw new Error('no "→ UNAVAIL" on the commitment\'s line: ' + J(btns))
    await mv.click(); await sleep(800); await L.answerAsks(w)
    steps.push({ step: 'moved to Unavailable: note "' + await note(p) + '"', full: await full(p) })
  }
  steps.push(await read(p, 'on the Board'))
  if (steps.at(-1).screen.filter(x => /Ranger|Hex/.test(x)).length < 2) throw new Error('Ranger and Hex are not two rows under Unavailable: ' + J(steps.at(-1).screen))
  const seq = KIND === 'am' ? [['end', '1000'], ['rmks', 'am-own']] : [['str', '0900'], ['end', '1100'], ['rmks', `${KIND}-own`]]
  if (KIND === 'allday') seq.push(['str', ''])
  for (const [f, v] of seq) {
    await typeIn(w, await boxSel(p, 'Ranger', f), v, 'Tab')
    const o = await oilOpen(p); if (o) { oil.push(`after ${f} ${v}: an OIL question opened`); pics.push(await pic(w, `a10-${KIND}-oil`, ['[data-testid="oilconf"]'])) }
    const r = await read(p, `${f} ${v || '(cleared)'} Tab`); steps.push({ ...r, full: await full(p), note: await note(p) })
  }
  pics.push(await pic(w, `a10-${KIND}-caret-in`))
  await away(w); const last = await read(p, 'caret left'); steps.push({ ...last, full: await full(p) }); pics.push(await pic(w, `a10-${KIND}-caret-left`))
  const F = steps.at(-1).full
  const hex = F.filter(r => r.people.includes('rocky')), ran = F.filter(r => r.people.includes('bane'))
  chk('Hex untouched: still on the original input, as filed', hex.length === 1 && hex[0].iid === iid && J({ ...hex[0], people: 0, remarks: 0 }) === J({ ...rec0, people: 0, remarks: 0, ...(SPEC.move ? { goes: hex[0].goes } : {}) }) && !hex[0].remarks, J(hex[0]) + ' was ' + J(rec0))
  chk('Ranger alone on an input of his own, the SAME kind, title, "To", dates', ran.length === 1 && ran[0].iid !== iid && ran[0].people.length === 1 && ran[0].type === rec0.type && ran[0].title === rec0.title && ran[0].to === rec0.to && ran[0].date === rec0.date && ran[0].endDate === rec0.endDate, J(ran[0]))
  const ownIds = new Set(steps.slice(-seq.length - 1).flatMap(s => (s.full || []).filter(r => r.people.join() === 'bane').map(r => r.iid)))
  chk('every change after the first on that same input of his', ownIds.size === 1, J([...ownIds]))
  const wantTimes = KIND === 'allday' ? ran[0]?.allday === true : KIND === 'am' ? ran[0]?.e === 600 : ran[0]?.s === 540 && ran[0]?.e === 660
  chk('his times as typed', wantTimes && ran[0].remarks === `${KIND}-own`, J(ran[0]))
  chk('screen = store at every read', steps.filter(s => s.agree).every(s => !s.agree.bad.length), J(steps.filter(s => s.agree).map(s => s.agree.bad)))
  add(`A10-${KIND}`, checks.every(c => c.startsWith('ok')) ? 'PASS' : 'FAIL', { fixture: iid, checks, oil, steps }, pics)
  add(`A10-${KIND}-oil`, 'RECORDED', oil.length ? oil.join('; ') : 'no OIL question opened at any Tab')
  if (KIND === 'am' || KIND === 'allday') add(`A10-${KIND}-labels`, 'RECORDED', `rows after each step: ${J(steps.filter(s => s.screen).map(s => s.step + ': ' + s.screen.join(' / ')))}; half in store: Ranger ${J(ran[0]?.half)}, Hex ${J(hex[0]?.half)}`)
} catch (e) { add(`A10-${KIND}`, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J({ checks, steps }).slice(0, 3000), pics) }
await done('a10' + KIND)
