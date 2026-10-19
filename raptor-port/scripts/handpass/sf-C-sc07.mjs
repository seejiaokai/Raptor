import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, sleep, shot, rec, go, errors, chipLine, warnLines, switchRole, fileInput, toastNow, puckAt } = L
const S = '7'
const b = await launch()
const KINDS = [['LL', 'local leave'], ['OL', 'overseas leave'], ['ATT C', 'medical (ATT C)']]
const ring = pk => !!pk && /\b(warn|hard|boxred)\b/.test(pk.cls)
async function world(p) {
  await go(p, 'editsched')
  await p.evaluate(() => window.addWave(5, 'avalon')); await sleep(500)
  await openBoard(p, 5)
  const a = await bPut(p, 5, 0, 0, 0, 'p', ['stiff'])
  const r = await bPut(p, 5, 0, 0, 2, 'p', ['bane'])
  return [a, r]
}
const leaveWords = w => w.filter(x => /Ranger/.test(x))
for (const [type, name] of KINDS) {
  const { p } = await ctxOpen(b, {})
  const seats = await world(p)
  await closeBoard(p)
  await switchRole(p, 'u')
  const f = await fileInput(p, { type, iso: '2026-07-18', remarks: 'SF walk ' + type })
  const toast = await toastNow(p)
  await shot(p, `7-${type.replace(' ', '')}-1-member-list`)
  const memberList = await p.evaluate(() => document.querySelector('#page-inputs').innerText.replace(/\s+/g, ' ').slice(0, 500))
  rec(S, `member files ${name} for Sat 18 Jul through Inputs`, 'the request is saved; the member is told in words', { iid: f.iid, prompts: f.prompts, toast, memberList }, f.iid ? 'PASS' : 'NOT WALKED', `C-7-${type.replace(' ', '')}-1-member-list.png`)
  await switchRole(p, 'a')
  await openBoard(p, 5)
  const wA = await warnLines(p), pkA = await puckAt(p, '5.0.0.2.p')
  await shot(p, `7-${type.replace(' ', '')}-2-standing`)
  rec(S, `${name}: AVALON standing by, Ranger on SPARE`, type === 'LL' ? 'no warning on his row (standby allowance)' : 'RECORD against today\'s standby rule', { seats, w: leaveWords(wA), all: wA.slice(0, 6), puck: pkA && pkA.cls }, type === 'LL' ? (leaveWords(wA).length === 0 && !ring(pkA) ? 'PASS' : 'FAIL') : 'RECORD', `C-7-${type.replace(' ', '')}-2-standing.png`)
  await bType(p, bf(5, 0, 0, 'rl'), '18:30')
  const wB = await warnLines(p), pkB = await puckAt(p, '5.0.0.2.p'), cB = await chipLine(p)
  await shot(p, `7-${type.replace(' ', '')}-3-flying`)
  rec(S, `${name}: type the AVALON R`, 'a leave / absence warning on his row, in the list and on his puck', { w: leaveWords(wB), puck: pkB && pkB.cls, title: pkB && pkB.title, chips: cB }, leaveWords(wB).length > 0 && ring(pkB) ? 'PASS' : 'FAIL', `C-7-${type.replace(' ', '')}-3-flying.png`)
  await bType(p, bf(5, 0, 0, 'rl'), '')
  const wC = await warnLines(p), pkC = await puckAt(p, '5.0.0.2.p')
  await shot(p, `7-${type.replace(' ', '')}-4-cleared`)
  rec(S, `${name}: clear R`, type === 'LL' ? 'the warning goes' : 'RECORD (should be the same as standing by before)', { w: leaveWords(wC), puck: pkC && pkC.cls }, type === 'LL' ? (leaveWords(wC).length === 0 ? 'PASS' : 'FAIL') : 'RECORD', `C-7-${type.replace(' ', '')}-4-cleared.png`)
  await p.context().close()
}
// the reverse: R typed first, then the member files local leave
{
  const { p } = await ctxOpen(b, {})
  const seats = await world(p)
  await bType(p, bf(5, 0, 0, 'rl'), '18:30')
  const w0 = await warnLines(p)
  await closeBoard(p)
  await switchRole(p, 'u')
  const f = await fileInput(p, { type: 'LL', iso: '2026-07-18', remarks: 'SF walk after R' })
  const toast = await toastNow(p)
  await shot(p, '7-rev-1-member-list')
  const memberList = await p.evaluate(() => document.querySelector('#page-inputs').innerText.replace(/\s+/g, ' ').slice(0, 600))
  // the Inputs calendar for that day: open the month of July? (the calendar opens on Oct 2026) - open the day via calendar button
  rec(S, 'AVALON R typed first, then the member files local leave for Sat', 'RECORD what the member is told', { iid: f.iid, prompts: f.prompts, toast, memberList }, f.iid ? 'RECORD' : 'NOT WALKED', 'C-7-rev-1-member-list.png')
  await switchRole(p, 'a')
  await openBoard(p, 5)
  const w1 = await warnLines(p), pk1 = await puckAt(p, '5.0.0.2.p')
  await shot(p, '7-rev-2-scheduler')
  rec(S, 'then the scheduler opens Saturday', 'the leave-on-a-flying-seat warning shows on Ranger', { w0, w1, puck: pk1 && pk1.cls }, w1.some(x => /Ranger/.test(x)) ? 'PASS' : 'FAIL', 'C-7-rev-2-scheduler.png')
  await p.context().close()
}
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
