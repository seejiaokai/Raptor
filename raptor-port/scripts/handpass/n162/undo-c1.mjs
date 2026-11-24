// Case 1: Hunter, an admin of 142 holding Plan of 149, made a Member (the Role box alone). `node undo-c1.mjs d|p`
import { main } from './undo-cases.mjs'
await main(() => ['c1'])
