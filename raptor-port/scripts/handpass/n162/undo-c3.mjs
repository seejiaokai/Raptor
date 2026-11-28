// Case 3: Hunter as seeded (an admin of 142, no Plan or View of another squadron) made a Member AND his sign-in name
// changed, one Save. `node undo-c3.mjs d|p`
import { main } from './undo-cases.mjs'
await main(() => ['c3'])
