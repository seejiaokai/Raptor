const fs = require('fs')
const f = 'C:/Users/User/projects/Raptor/.claude/worktrees/rulings-slim-d391-078ad2/raptor-port/scripts/handpass/bta-B-s25d.mjs'
let s = fs.readFileSync(f, 'utf8')
const a = s.indexOf('const panel = async')
const b = s.indexOf('const typeIn')
const neu = [
  "const readLive = async p => { const b = await B.readBoard(p); return { mine: (b.lines || []).filter(x => x.text.includes(CSN)).map(x => x.text.replace(/ ✕| ↺/g, '').slice(0, 130)), head: b.head } }",
  "const panel = async (p, tag, first = false) => {",
  "  /* read 1: straight away, the board never left */",
  "  const live = first ? null : await readLive(p)",
  "  const liveShot = first ? null : await pic(p, `s25d-${tag}-live`)",
  "  /* read 2: leave the board and open it again */",
  "  await B.toEdit(p).catch(() => {})",
  "  await K.boardTo(p, TUE); await sleep(400)",
  "  await B.boardOpenFold(p)",
  "  const r = await readLive(p)",
  "  const pk = await C.painted(p, '#schedBoard', ID)",
  "  return { mine: r.mine, head: r.head, live, pk, shot: await pic(p, `s25d-${tag}-board`), liveShot }",
  "}",
  ""
].join('\n')
s = s.slice(0, a) + neu + s.slice(b)
s = s.replace("const say = x => `the board's warning panel", "const say = x => `${x.live ? 'read straight away without leaving the board: ' + JSON.stringify(x.live.mine) + ' (heading \"' + x.live.head + '\"); ' : ''}after leaving the board and opening it again: the board's warning panel")
s = s.replace("const d1 = await panel(p, 'd1')", "const d1 = await panel(p, 'd1', true)")
// verdicts must also hold for the live read
s = s.replace(/d(\d)\.mine\.length === (\d)/g, (m, n, c) => `d${n}.mine.length === ${c} && (!d${n}.live || d${n}.live.mine.length === ${c})`)
s = s.replace("d4.mine.length === 2 && d4.mine.every(x => /Board two/.test(x))", "d4.mine.length === 2 && d4.mine.every(x => /Board two/.test(x)) && d4.live.mine.every(x => /Board two/.test(x)) && d4.live.mine.length === 2")
fs.writeFileSync(f, s)
console.log('ok')
