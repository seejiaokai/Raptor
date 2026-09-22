/* RE-WALK 3 — the two findings that turned out to be ONE: a published day that
   reopens asking for an amendment nobody made (F1), and a count chip that says
   one more than the Leave War will ever pay (F2).
   Cause: the demo's posting-out window was written onto the person and never
   saved, so the man walked back into the squadron on the next boot and every
   placeholder stood for one more man than the issued day recorded.
   This is `seat-lw-21`'s shape — publish, save the world, reopen — plus the
   membership diff and the count, so the two findings are answered in one run. */
import { open, board, publish, closeBoard, shot, STATE } from './lib.mjs'

const OUT = process.env.HP_SHOTS
const read = (page, di) => page.evaluate(i => ({
  pending: ((document.querySelector('#schedBoard .dpend') || {}).innerText || '').replace(/\s+/g, ' ').trim() || 'nothing pending',
  al: (() => { const b = document.querySelector(`#sbSignBar [data-alpub="${i}"]`); return b ? b.innerText.trim() : 'none' })(),
  signed: [...document.querySelectorAll('#sbSignBar .sb-sign select')].map(s => s.value).filter(Boolean).length,
  chips: [...document.querySelectorAll('#schedBoard .oilcount')].map(c => (c.innerText || '').trim()),
}), di)

for (const [di, what] of [[0, 'MONDAY  — a weekday, the other everything-day'],
                          [4, 'FRIDAY  — a quiet weekday'],
                          [5, 'SATURDAY — earns OIL, carries a crowd'],
                          [6, 'SUNDAY  — earns OIL']]) {
  const TMP = `${OUT}/state-rw03-day${di}.json`
  const a = await open({ state: STATE })
  await board(a.page, di)
  const p = await publish(a.page, di)
  const straight = await read(a.page, di)
  await closeBoard(a.page); await a.page.waitForTimeout(600)
  await a.page.context().storageState({ path: TMP }); await a.browser.close()

  const b = await open({ state: TMP })
  await board(b.page, di)
  const reloaded = await read(b.page, di)
  /* and WHY, if anything differs: the issued crowd against the live one */
  const diff = await b.page.evaluate(i => {
    const w = window
    const snap = w.daySnapOf(i, w.dayCurVer(i))
    const issued = snap && snap.d && snap.d.oilev
    const live = w.oilEvidenceOf(i)
    if (!issued || !live) return '(no block on this day)'
    const cs = q => (w.PEOPLE[q] || {}).cs || q
    const out = []
    for (const k of new Set([...Object.keys(issued.sent), ...Object.keys(live.sent)])) {
      const A = (issued.sent[k] || []).slice().sort(), B = (live.sent[k] || []).slice().sort()
      if (JSON.stringify(A) === JSON.stringify(B)) continue
      out.push(`${k}: issued ${A.length}, live ${B.length}, added ${B.filter(x => !A.includes(x)).map(cs).join('+') || '-'}`)
    }
    return out.length ? out.join(' · ') : 'the issued crowd and the live crowd are the same men'
  }, di)
  await shot(b.page, `RW-03-reload-day${di}`)
  await b.browser.close()

  console.log(what.padEnd(46), '| published:', String(p.version || p.why).padEnd(6),
    '| straight after:', straight.pending.padEnd(16), '| AFTER RELOAD:', reloaded.pending,
    '(' + reloaded.al + ', signatures:', reloaded.signed + ')')
  console.log('   chips before/after:', JSON.stringify(straight.chips), '/', JSON.stringify(reloaded.chips))
  console.log('   crowd:', diff)
}
