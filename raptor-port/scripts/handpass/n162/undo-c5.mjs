// Case 5: Ranger (a member) made an admin, nothing else. `node undo-c5.mjs d|p`
import { main } from './undo-cases.mjs'
await main(() => ['c5'])
