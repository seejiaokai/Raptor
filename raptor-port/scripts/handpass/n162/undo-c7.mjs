// Case 7: Hunter made a Member and saved, then made an Admin again in a later Save; the words for that second Save's Undo.
// `node undo-c7.mjs d|p`
import { main } from './undo-cases.mjs'
await main(() => ['c7'])
