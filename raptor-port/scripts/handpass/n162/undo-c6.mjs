// Case 6, the words already approved: (a) Hunter given Plan of 149 AND his sign-in name changed, one Save; (b) Hunter made a
// master admin; (c) master admin taken off Hunter (made one first, then Admin picked in a later Save).
// `node undo-c6.mjs d` runs a, b, c; `node undo-c6.mjs p` runs a only.
import { main } from './undo-cases.mjs'
await main(sz => (sz === 'd' ? ['c6a', 'c6b', 'c6c'] : ['c6a']))
