// Case 2: Hunter holding Plan of 149 made a Member AND his sign-in name changed, one Save. `node undo-c2.mjs d|p`
import { main } from './undo-cases.mjs'
await main(() => ['c2'])
