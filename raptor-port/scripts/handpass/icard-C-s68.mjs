import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('desk', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const oil = async iid => (await L.recId(p, iid)).oil
const oilPart = () => p.locator(L.WIN).evaluate(w => { const o = w.querySelector('.inped-oil'); return o ? o.innerText.replace(/\s+/g, ' ') : null })
try {
  await L.openNew(w, '2026-07-17')
  await p.selectOption('#inpEditType', 'Duty')
  const line = await L.calTap(w, '2026-07-18')
  await L.setTimes(p, '09:00', '11:00')
  const s = await L.saveWin(w)
  parts.push(`Saber filed a Duty Fri 17 - Sat 18 Jul 09:00-11:00 (line "${line}"); save asked: ${s.asked ? s.head.slice(0, 220) : 'nothing'}`)
  pics.push(await L.pic(w, '68-1-oil-question-filing'))
  // answer: yes for Saturday
  if (s.asked) await L.answerOil(w, 'yes')
  const rec = await L.recBy(p, { type: 'Duty', date: 'Jul 17' })
  parts.push(`saved: ${rec.date}>${rec.endDate} oil ${JSON.stringify(rec.oil)}`)
  await L.closeWins(p)
  const herr = await L.declareHoliday(w, '2026-07-17', 'Test holiday', 'TH')
  parts.push(`declared Fri 17 Jul a public holiday (err "${herr}")`)
  await L.closeWins(p)
  await L.openFromList(w, rec.iid)
  const o1 = await oilPart()
  const f = await L.winFacts(p)
  parts.push(`window OIL part: "${o1}"; Change… ${f.revise}; Answer… ${f.answer}; unanswered line ${f.unanswered}`)
  pics.push(await L.pic(w, '68-2-window-oil'))
  const ctl = p.locator('[data-testid="oil-answer"], [data-testid="oil-revise"]').first()
  if (!(await ctl.count())) { fail('no OIL control in the window'); }
  else {
    await ctl.scrollIntoViewIfNeeded(); await ctl.click(); await sleep(500)
    const q = await L.oilText(p)
    pics.push(await L.pic(w, '68-3-oil-question'))
    parts.push('OIL question: ' + q)
    const qi = await p.locator('[data-testid="oilconf"]').evaluate(e => ({ btns: [...e.querySelectorAll('button')].map(b => (b.dataset.testid || '') + ':' + b.innerText.trim()), pressed: [...e.querySelectorAll('[aria-pressed="true"]')].map(b => b.dataset.testid || b.innerText.trim()), dates: (e.innerText.match(/\b1[78] Jul\b/g) || []) }))
    parts.push('question controls: ' + JSON.stringify(qi))
    if (!/2 NON-WORKING DAYS/i.test(q || '')) fail('question does not say it covers 2 non-working days: ' + q)
    await p.locator('[data-testid="oil-some"]').click(); await sleep(400)
    const q2 = await L.oilText(p)
    const days = await p.locator('[data-testid="oilconf"] .oc-ask').evaluateAll(es => es.map(c => ({ t: c.textContent.trim(), sel: c.classList.contains('sel'), attr: c.getAttribute('data-cal') || c.getAttribute('data-d') || '' })))
    parts.push('Only some days: ' + q2.slice(0, 300) + ' | day controls ' + JSON.stringify(days))
    pics.push(await L.pic(w, '68-4-only-some'))
    if (!(days.length === 2 && days.some(d => d.t === '17' && !d.sel) && days.some(d => d.t === '18' && d.sel))) fail('Only some days does not offer Fri 17 (unmarked) and Sat 18 (marked): ' + JSON.stringify(days))
    // tick Friday
    const fri = p.locator('[data-testid="oilconf"] .oc-ask').filter({ hasText: /^17$/ }).first()
    await fri.click(); await sleep(300)
    pics.push(await L.pic(w, '68-5-friday-ticked'))
    await p.locator('[data-testid="oilconf-save"]').click(); await sleep(600)
    const after = await oil(rec.iid)
    parts.push('after ticking Friday and Save: oil ' + JSON.stringify(after))
    if (!(after['2026-07-17'] > 0 && after['2026-07-18'] > 0)) fail('both days not credited: ' + JSON.stringify(after))
    if (!(await L.win(p).count())) await L.openFromList(w, rec.iid)
    parts.push('window OIL part now: ' + await oilPart())
    pics.push(await L.pic(w, '68-6-window-after'))
    await p.keyboard.press('Escape')
    // Undo / Redo of the answer
    await L.closeWins(p)
    const u = await L.undo(w); const aU = await oil(rec.iid)
    const r = await L.redo(w); const aR = await oil(rec.iid)
    parts.push('Undo ' + u + ': oil ' + JSON.stringify(aU) + '; Redo ' + r + ': oil ' + JSON.stringify(aR))
    if (!(aU['2026-07-17'] === undefined || !aU['2026-07-17']) || !(aU['2026-07-18'] > 0)) fail('Undo of the Friday answer wrong: ' + JSON.stringify(aU))
    if (!(aR['2026-07-17'] > 0 && aR['2026-07-18'] > 0)) fail('Redo wrong: ' + JSON.stringify(aR))
  }
  L.row(68, 'desktop 1440x900', 'Admin (Saber)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '68-err'))
  L.row(68, 'desktop 1440x900', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
