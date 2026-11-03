// Inputs seen-again recheck, walker A (3 Nov 26): A1-A10 on the built app at LOOK_URL (default http://localhost:4241/).
//   node scripts/handpass/isr-A.mjs        (empties its picture folder first; writes results-all.txt there)
import * as L from './isr-A-lib.mjs'
import a1 from './isr-A-a1.mjs'
import { a2, a3, a4 } from './isr-A-a2.mjs'
import a5 from './isr-A-a5.mjs'
import a5drag from './isr-A-a5drag.mjs'
import a6 from './isr-A-a6.mjs'
import a7 from './isr-A-a7.mjs'
import { a8, a9 } from './isr-A-a8.mjs'
import a10 from './isr-A-a10.mjs'
console.log('isr-A v1 against', L.URL)
L.clean()
for (const [name, fn] of [['A1', a1], ['A2', a2], ['A3', a3], ['A4', a4], ['A5', a5], ['A5 drag', a5drag], ['A6', a6], ['A7', a7], ['A8', a8], ['A9', a9], ['A10', a10]]) {
  try { await fn() } catch (e) { L.say(`ERROR ${name} (whole find): ${e.message.split('\n')[0]}`) }
}
await L.finish('all')
