import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
let names
const state = async (date) => { const rs = await L.recAll(p, { type: 'Duty', date }); return rs.map(r => `${names[r.person]}:${r.oil ? JSON.stringify(r.oil) : 'null'}`).sort().join(' ; ') }
const oilPart = () => p.locator(L.WIN).evaluate(w => Array.from(w.querySelectorAll('.inped-oil, .inped-oil-own, [data-testid^="oil-"]')).map(e => e.closest('div').innerText.replace(/\s+/g, ' ')).filter((x, i, a) => a.indexOf(x) === i).join(' // '))
async function rangerAnswers(label, text, how) {
  await L.switchUser(w, 'us')
  await p.locator('#notifyBell').tap(); await sleep(700)
  pics.push(await L.pic(w, `69-${label}-bell`))
  const q = await L.oilText(p)
  parts.push(`${label}: Ranger tapped the bell: ${q ? 'OIL question: ' + q.slice(0, 120) : 'no question opened; visible: ' + (await p.evaluate(() => [...document.querySelectorAll('.floatwin,.airpop')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 200)).join(' || ')))}`)
  if (!q) { fail(label + ': the bell did not lead to Ranger\'s OIL question'); return false }
  await L.answerOil(w, how); await sleep(500)
  return true
}
try {
  names = await p.evaluate(() => { const o = {}; for (const [k, v] of Object.entries(window.PEOPLE)) o[k] = v.cs; return o })
  // ---- part 1: Ace (first alphabetically), Ranger, Saber
  await L.fileNew(w, { iso: '2026-07-22', type: 'Duty', title: 'First shared', several: ['Ace', 'Ranger', 'Saber'], s: '09:00', e: '12:00' })
  await L.declareHoliday(w, '2026-07-22', 'Test holiday', 'TH'); await L.closeWins(p)
  parts.push('P1 Saber filed a shared weekday Duty Wed 22 Jul for Ace, Ranger, Saber, then declared 22 Jul a public holiday: ' + await state('Jul 22'))
  await rangerAnswers('P1', 'Ace, Ranger, Saber', 'yes')
  parts.push('P1 after Ranger answered: ' + await state('Jul 22'))
  await L.closeWins(p)
  await L.switchUser(w, 'ad')
  await L.openByText(w, 'First shared')
  const f = await L.winFacts(p)
  parts.push(`P1 Saber reopens the shared entry: unanswered line ${f.unanswered}, Answer… ${f.answer}, group Change… ${f.revise}, own OIL line: ${(await p.locator('[data-testid="oil-revise-own"], [data-testid="oil-answer-own"]').count())}; OIL part: ${await oilPart()}`)
  await p.locator('.inped-oil').first().scrollIntoViewIfNeeded().catch(() => {}); pics.push(await L.pic(w, '69-P1-saber-window'))
  const ctl = p.locator('[data-testid="oil-answer"]')
  if (!(await ctl.count())) fail('P1: Saber has no way to answer the remaining OIL questions (no Answer…)')
  else {
    await ctl.scrollIntoViewIfNeeded(); await ctl.tap(); await sleep(500)
    const q = await L.oilText(p)
    parts.push('P1 Answer… opens: ' + (q || '').slice(0, 200))
    pics.push(await L.pic(w, '69-P1-saber-question'))
    await L.answerOil(w, 'yes'); await sleep(500)
    parts.push('P1 after Saber answers Yes: ' + await state('Jul 22'))
    const rs = await L.recAll(p, { type: 'Duty', date: 'Jul 22' })
    if (!rs.every(r => r.oil && Object.values(r.oil).some(v => v > 0))) fail('P1: not everyone credited after the filer answered: ' + await state('Jul 22'))
  }
  await L.closeWins(p)
  // ---- part 2: Ranger is first alphabetically of Ranger, Saber
  await L.fileNew(w, { iso: '2026-07-23', type: 'Duty', title: 'Second shared', several: ['Ranger', 'Saber'], s: '09:00', e: '12:00' })
  await L.declareHoliday(w, '2026-07-23', 'Test holiday two', 'T2'); await L.closeWins(p)
  parts.push('P2 Saber filed a shared Duty Thu 23 Jul for Ranger, Saber, declared 23 Jul a holiday: ' + await state('Jul 23'))
  await rangerAnswers('P2', 'Ranger, Saber', 'no')
  parts.push('P2 after the first-named participant (Ranger) answered No: ' + await state('Jul 23'))
  await L.closeWins(p)
  await L.switchUser(w, 'ad')
  await L.openByText(w, 'Second shared')
  const f2 = await L.winFacts(p)
  parts.push(`P2 Saber reopens: unanswered line ${f2.unanswered}, Answer… ${f2.answer}, group Change… ${f2.revise}; OIL part: ${await oilPart()}`)
  await p.locator('.inped-oil').first().scrollIntoViewIfNeeded().catch(() => {}); pics.push(await L.pic(w, '69-P2-saber-window'))
  parts.push('P2 window OIL controls: own-line buttons ' + await p.locator('[data-testid="oil-revise-own"], [data-testid="oil-answer-own"]').count() + '; the window text around OIL: ' + (await p.locator(L.WIN).evaluate(w => { const t = w.innerText.replace(/s+/g, ' '); const i = t.indexOf('OIL'); return t.slice(Math.max(0, i - 10), i + 200) })))
  if (!(await p.locator('[data-testid="oil-answer"]').count())) {
    fail('P2: Saber (unanswered) has no Answer… — the window shows the group as answered because the first participant (Ranger) answered: ' + await oilPart())
    const ch = p.locator('[data-testid="oil-revise"]')
    if (await ch.count()) {
      await ch.scrollIntoViewIfNeeded(); await ch.tap(); await sleep(500)
      parts.push('P2 Change… opens: ' + ((await L.oilText(p)) || '').slice(0, 220))
      pics.push(await L.pic(w, '69-P2-change-question'))
      await L.answerOil(w, 'yes'); await sleep(500)
      parts.push('P2 after Saber answers via Change… Yes: ' + await state('Jul 23'))
    }
  } else {
    await p.locator('[data-testid="oil-answer"]').scrollIntoViewIfNeeded(); await p.locator('[data-testid="oil-answer"]').tap(); await sleep(500)
    parts.push('P2 Answer… opens: ' + ((await L.oilText(p)) || '').slice(0, 200))
    await L.answerOil(w, 'yes'); await sleep(500)
    parts.push('P2 after Saber answers Yes: ' + await state('Jul 23'))
  }
  await L.closeWins(p)
  const u = await L.undo(w); parts.push('Undo (Saber\'s last answer) ' + u + ': ' + await state('Jul 23'))
  const r = await L.redo(w); parts.push('Redo ' + r + ': ' + await state('Jul 23'))
  L.row(69, 'phone 390x844', 'Admin (Saber) set up, Member (Ranger) answering, Admin checking', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '69-err'))
  L.row(69, 'phone 390x844', 'Admin/Member', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 400) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
