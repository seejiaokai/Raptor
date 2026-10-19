/* BREAK TESTS — [STANDBY-WEEK-B] (D1083, D1084). Each wire of the change is undone in turn, the test that should catch
   it is run, and the file is put back byte for byte. A break whose test stays green is a wire with no test.
   Run from raptor-port/: node scripts/handpass/breaks-standby-week-b.mjs   (the browser break, B4, needs the gate lock —
   it builds; run with BREAK_E2E=1 and E2E_PORT set to a free port, inside `gatelock.mjs exec`.) */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const BREAKS = [
  ['B1 the week draws START, not B, under R', 'src/ui/html.ts',
    "${ted(fp+'.rl',f.rl,ed,'rl','span')}${ted(fp+'.br',f.br,ed,'','b')}", "${ted(fp+'.rl',f.rl,ed,'rl','span')}${ted(fp+'.to',f.to,ed,'ntx','span')}",
    'npx vitest run src/ui/brieftime-ui.test.tsx -t RB10'],
  ['B1b the week draws no START above END', 'src/ui/html.ts',
    "<div class=\"fcell ld${badCls}\"${badAtt} style=\"${spans}\">${ted(fp+'.to',f.to,ed,'tox','span')}${ted(fp+'.ld',f.ld,ed,'ntx')}</div>`;", "<div class=\"fcell ld${badCls}\"${badAtt} style=\"${spans}\">${sa?'':ted(fp+'.to',f.to,ed,'tox','span')}${ted(fp+'.ld',f.ld,ed,'ntx')}</div>`;",
    'npx vitest run src/ui/brieftime-ui.test.tsx -t RB10'],
  ['B2 the peek draws no B', 'src/ui/peek.ts',
    "<span class=\"rl\">${esc(f.rl || '')}</span><b>${esc(f.br || '')}</b></div>`", "<span class=\"rl\">${esc(f.rl || '')}</span><span>${esc(f.to || '')}</span></div>`",
    'npx vitest run src/ui/brieftime-ui.test.tsx -t "next-week peek"'],
  ['B2b the peek keeps the old heading', 'src/ui/peek.ts',
    '<span class="c-c">${SA_TIME_HEAD[0]}</span><span class="c-c sa-se">${SA_TIME_HEAD[1]}</span>', '<span class="c-c">R<br>START</span><span class="c-c">END</span>',
    'npx vitest run src/ui/brieftime-ui.test.tsx -t "next-week peek"'],
  ['B3 the changes window still calls a standby B the board\'s alone', 'src/ui/histbubble.ts',
    "  if (/^ap:.*\\.sub$/.test(k)) return 'week'\n  return null",
    "  if (/^ap:.*\\.sub$/.test(k)) return 'week'\n  const m = /^ff:(\\d+)\\.(\\d+)\\.\\d+\\.br$/.exec(k)\n  if (m) { const d: any = (DAYS as any)[+m[1]!], w = d && (d.waves || [])[+m[2]!]; if (w && w.standalone) return 'board' }\n  return null",
    'npx vitest run src/ui/histjump.test.tsx'],
  ['B6 the board heads a standby wave TO / LD (D1085)', 'src/ui/board.ts',
    "<span>${sa ? 'START' : 'TO'}</span><span>${sa ? 'END' : 'LD'}</span>", '<span>TO</span><span>LD</span>',
    'npx vitest run src/ui/brieftime-ui.test.tsx -t "Scheduler Board"'],
]
if (process.env.ONLY) BREAKS.splice(0, BREAKS.length, ...BREAKS.filter(b => b[0].startsWith(process.env.ONLY)))
if (process.env.BREAK_E2E) BREAKS.push(['B4 the phone heading at its old size', 'src/ui/scheduler/09-week-responsive.css',
  '  .cols.formcols .sa-se{font-size:7px;letter-spacing:0;padding:3px 1px}\n', '',
  `npx playwright test e2e/rallybox.spec.ts --project=raptor -g "a standby line reads"`])
if (process.env.BREAK_E2E) BREAKS.push(["B5 read only, an empty START holds no line (the code read's F1)", 'src/ui/scheduler/03-week.css',
  ".form .ld > span:first-child:not(.txed):empty::before{content:'\\a0'}\n", '',
  `npx playwright test e2e/rallybox.spec.ts --project=raptor -g "empty START keeps its line"`])

let silent = 0
for (const [name, file, from, to, cmd] of BREAKS) {
  const was = readFileSync(file, 'utf8')
  if (!was.includes(from)) { console.log(`?? ${name}: the wire was not found in ${file} — the break was not made`); silent++; continue }
  writeFileSync(file, was.replace(from, () => to))
  let red = false
  try { execSync(cmd, { stdio: 'pipe' }) } catch { red = true }
  writeFileSync(file, was)
  if (readFileSync(file, 'utf8') !== was) throw new Error('could not put ' + file + ' back')
  console.log(`${red ? 'RED  ' : 'GREEN'} ${name}  (${cmd})`)
  if (!red) silent++
}
console.log(silent ? `${silent} break(s) caught by nothing` : 'every break caught')
process.exit(silent ? 1 : 0)
