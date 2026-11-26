/* Scores whole sequences against each other AND against every schedule colour (search2.mjs's list).
   node probe3.mjs '#F8F337,#FF95D9,...' '...' */
import { contrast, de00, worst } from './colour.mjs'
import { SCHED } from './search2.mjs'
for (const arg of process.argv.slice(2)) {
  const s = arg.split(',')
  console.log('\n' + arg)
  s.forEach((a, i) => {
    const near = Object.entries(SCHED).map(([n, c]) => [de00(a, c), n]).sort((x, y) => x[0] - y[0])
    console.log(' AL' + (i + 1), a, s.map((b, j) => i === j ? '     -' : (de00(a, b).toFixed(0) + '/' + worst(a, b).toFixed(0)).padStart(6)).join(''), ' cr', contrast(a, '#1A1F2A').toFixed(1), '| nearest:', near.slice(0, 2).map(n => n[0].toFixed(0) + ' ' + n[1].slice(0, 22)).join(' ; '))
  })
  for (const n of [2, 3, 4, s.length]) { let mn = 1e9, mw = 1e9; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { mn = Math.min(mn, de00(s[i], s[j])); mw = Math.min(mw, worst(s[i], s[j])) } console.log('  first', n, 'min ordinary', mn.toFixed(1), 'min worst', mw.toFixed(1)) }
}
