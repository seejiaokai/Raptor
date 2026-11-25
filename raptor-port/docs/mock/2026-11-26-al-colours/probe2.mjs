/* Scores whole seven-colour sequences given on the command line: every pair, normal / worst-of-three.
   node probe2.mjs '#FFE815,#94ABFF,...' */
import { contrast, de00, worst } from './colour.mjs'
const TAKEN = { cyan: '#3BC6E8', red: '#F0555F', amber: '#E5A83B', green: '#57C97A', purple: '#B24DEA', blue: '#3673DD', text: '#F1F4F7', text2: '#B6C0CB' }
for (const arg of process.argv.slice(2)) {
  const s = arg.split(',')
  console.log(arg)
  let mn = 1e9, mw = 1e9
  s.forEach((a, i) => {
    const row = s.map((b, j) => i === j ? '    -' : (de00(a, b).toFixed(0) + '/' + worst(a, b).toFixed(0)).padStart(6)).join('')
    s.forEach((b, j) => { if (j > i) { mn = Math.min(mn, de00(a, b)); mw = Math.min(mw, worst(a, b)) } })
    const near = Object.entries(TAKEN).map(([n, t]) => [n, de00(a, t)]).sort((x, y) => x[1] - y[1])[0]
    console.log(' AL' + (i + 1), a, row, ' cr', contrast(a, '#20262E').toFixed(1), ' nearest spent:', near[0], near[1].toFixed(0))
  })
  console.log(' min normal', mn.toFixed(1), 'min worst', mw.toFixed(1))
}
