const fs = require('fs')
const f = 'C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/scripts/handpass/bta-B-s25c.mjs'
let s = fs.readFileSync(f, 'utf8')
// seat Wed too in the leave-war world
const i = s.indexOf('async function leaveWar()')
let head = s.slice(0, i), tail = s.slice(i)
tail = tail.replace("await Q.seatDays(p, [TU]); await T.blankRow(p, 'duty', TU)", "await Q.seatDays(p, [TU, 2]); await T.blankRow(p, 'duty', TU)")
// the move step, before the removal section
const marker = "    /* removal */"
const step = [
  "    /* change: move the approved leave to Wednesday */",
  "    const s3b = await lw('3b-before-move')",
  "    const mv = await pressSheet('⇄Move')",
  "    const wcell = p.locator('[data-testid=\"cell-split-2026-07-15\"]')",
  "    await wcell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)",
  "    await wcell.click().catch(() => {}); await sleep(900)",
  "    const afterMv = await p.evaluate(() => { const e = document.querySelector('.bidsheet'); return e ? e.innerText.replace(/\s+/g, ' ').slice(0, 260) : '(no sheet)' })",
  "    await pic(p, 's25c-lw-after-move')",
  "    await closeSheet()",
  "    const toastLw = await T.W.toasts ? '' : ''",
  "    await L.go(p, 'editsched'); const l3t = await Q.readDay(p, TU, 'l3b', { noPics: false }); const l3w = await Q.readDay(p, 2, 'l3b', { noPics: false })",
  "    t.add('S25c.L3b', `the approved cell tapped: ${mv}; then Wednesday's cell tapped (the screen then: ${afterMv}); his inputs: ${JSON.stringify(await T.recAll(p))}`, `${Q.shortDay(TU, l3t)} || ${Q.shortDay(2, l3w)}`, 'RECORDED', [s3b.shot, ...l3t.s.pics, ...l3w.s.pics])",
  ""
].join('\n')
tail = tail.replace(marker, step + marker)
fs.writeFileSync(f, head + tail)
console.log('ok')
