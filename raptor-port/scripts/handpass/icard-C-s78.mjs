import * as L from './icard-C-lib.mjs'
const { sleep } = L
const w = await L.world('phone', 'ad')
const p = w.page
const parts = [], pics = []
let verdict = 'PASS'
const fail = m => { verdict = 'FAIL'; parts.push('FAIL: ' + m) }
const tid = id => p.locator(`[data-testid="${id}"]`)
const fmt = r => r ? `${r.date} yr ${r.yr} s ${r.s}-${r.e} oil ${JSON.stringify(r.oil)}` : 'GONE'
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
try {
  // a period through the Leave War's own New period sheet
  await L.go(p, 'leavewar'); await sleep(1200)
  await tid('war-new').tap(); await tid('war-sheet').waitFor(); await sleep(400)
  await tid('war-name').fill('JAN 27')
  for (let i = 0; i < 24; i++) {
    const [m, y] = (await tid('war-month').textContent()).trim().toLowerCase().split(/\s+/)
    const d = 2027 * 12 + 0 - (+y * 12 + MONTHS.indexOf(m))
    if (!d) break
    await (d > 0 ? tid('war-next-month') : tid('war-prev-month')).tap()
  }
  await tid('war-day-2027-01-01').tap(); await tid('war-day-2027-01-31').tap()
  pics.push(await L.pic(w, '78-1-new-period-sheet'))
  const sel = await tid('war-selection').innerText().catch(() => '')
  await tid('war-create').tap(); await sleep(800)
  const prob = await tid('war-problem').innerText().catch(() => '')
  parts.push(`created a Leave War period JAN 27 through the sheet (selection "${sel}", problem "${prob}")`)
  await sleep(300)
  if (await tid('war-sheet').count()) { parts.push('NOTE: the sheet refused because 2027 is already covered by the demo period JAN - DEC 27 (so the precondition was already met); cancelled the sheet'); await tid('war-cancel').tap(); await sleep(300) }
  // file a 2027 weekend commitment
  const ev = await L.fileNew(w, { iso: '2027-01-09', type: 'Duty', s: '09:00', e: '12:00', oil: 'yes' })
  parts.push(`filed a Duty on Sat 9 Jan 2027: OIL question ${ev.asked ? ev.head.slice(0, 120) : 'none'}`)
  pics.push(await L.pic(w, '78-2-after-filing'))
  const rec = await L.recBy(p, { type: 'Duty', date: 'Jan 9 2027' })
  parts.push('saved: ' + fmt(rec))
  if (!rec || !rec.oil || !Object.keys(rec.oil).every(k => k.startsWith('2027-'))) fail('saved record is not 2027 / its OIL key is not 2027: ' + fmt(rec))
  // list heading and reopen
  await L.toList(w)
  const heads = await p.evaluate(() => [...document.querySelectorAll('#inList [data-testid="inl-day"]')].map(h => h.textContent.replace(/\s+/g, ' ')).filter(t => /2027|Jan/i.test(t)))
  parts.push('list headings mentioning 2027/Jan: ' + JSON.stringify(heads))
  const card = p.locator(`#inList [data-testid="inl-row-${rec.iid}"]`)
  await card.scrollIntoViewIfNeeded()
  pics.push(await L.pic(w, '78-3-list-2027'))
  if (!heads.some(h => /2027/.test(h))) fail('the list heading carries no year for the 2027 day: ' + JSON.stringify(heads))
  await card.tap(); await L.win(p).waitFor(); await sleep(300)
  const calHead = await p.locator(`${L.WIN} #inpEdCal`).innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 40)).catch(() => '')
  const winTtl = (await L.winFacts(p)).ttl
  parts.push(`reopened: window title "${winTtl}"; its calendar head "${calHead}"`)
  if (!/2027/.test(calHead)) fail('the window calendar does not stand on 2027: ' + calHead)
  const line = await L.calTap(w, '2027-01-10')
  const s = await L.saveWin(w)
  parts.push(`tapped 10 Jan 2027 (line "${line}"); Save asked: ${s.asked ? s.head.slice(0, 200) : 'nothing'}`)
  pics.push(await L.pic(w, '78-4-question-2027'))
  if (s.asked) await L.answerOil(w, 'yes'); await sleep(500)
  const r2 = await L.recId(p, rec.iid)
  parts.push('after the move: ' + fmt(r2))
  if (!r2 || r2.date !== 'Jan 10 2027' || !Object.keys(r2.oil || {}).length || !Object.keys(r2.oil).every(k => k.startsWith('2027-01-10'))) fail('the move lost the year / OIL key: ' + fmt(r2))
  if (s.asked && !/JAN/i.test(s.head)) fail('the OIL question does not name the January date: ' + s.head.slice(0, 120))
  await L.closeWins(p)
  await L.toList(w)
  const heads2 = await p.evaluate(() => [...document.querySelectorAll('#inList [data-testid="inl-day"]')].map(h => h.textContent.replace(/\s+/g, ' ')).filter(t => /2027/i.test(t)))
  parts.push('list headings with 2027 after the move: ' + JSON.stringify(heads2))
  const u = await L.undo(w); const rU = await L.recId(p, rec.iid)
  const rd = await L.redo(w); const rR = await L.recId(p, rec.iid)
  parts.push(`Undo ${u}: ${fmt(rU)}; Redo ${rd}: ${fmt(rR)}`)
  if (!rU || rU.date !== 'Jan 9 2027') fail('Undo lost the year')
  L.row(78, 'phone 390x844', 'Admin (Saber)', verdict, parts.join(' || '), pics)
} catch (e) {
  console.log('ERR', e)
  pics.push(await L.pic(w, '78-err'))
  L.row(78, 'phone 390x844', 'Admin (Saber)', 'NOT RUN', 'script stopped: ' + String(e).slice(0, 500) + ' || ' + parts.join(' || '), pics)
}
await L.finish(w)
