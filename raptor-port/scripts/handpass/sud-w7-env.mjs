// Walker w7 (D2338 walk, chat 147): sets the w2 helpers' server and picture folder BEFORE they load (walk-scripts §6).
// One run, one folder: RUN names the sub-folder under w7/.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../..')
process.env.W2_URL ||= 'http://localhost:4397/'
process.env.W2_OUT ||= path.join(ROOT, 'docs/img/handpass/2026-11-23-sans-unfiled/w7', process.env.RUN || 'scratch')
/* sfd-w1-lib (the crew panel's readers) reads its own pair: point it at the same server and folder */
process.env.W1_URL ||= process.env.W2_URL
process.env.W1_OUT ||= process.env.W2_OUT
export const DUMP = 'D:/raptor-work/c147-walk/w7'
