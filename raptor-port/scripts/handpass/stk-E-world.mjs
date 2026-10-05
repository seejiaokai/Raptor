/* Walker E — build the "everything Saturday" through the app's controls (fixture.mjs) plus a personal input from the board,
   then keep the browser's storage as a file in the scratchpad so later scripts begin from it (same origin). HP_PHONE=1 for the phone. */
import { mkdirSync } from 'node:fs'
import * as E from './stk-E-lib.mjs'
import { buildSaturday, fileInputFromBoard } from './fixture.mjs'
const phone = !!process.env.HP_PHONE
const SZ = phone ? 'phone' : 'desktop'
const STATE = process.env.E_STATE_DIR + `/world-${SZ}.json`
const { browser, ctx, page, errors } = await E.world({ size: phone ? E.PHONE : E.DESK, phone })
const t0 = Date.now()
const log = await buildSaturday(page, 5)
console.log('fixture log', log.join(' | '))
const bad = log.filter(l => /FAILED/.test(l))
let inp = null
try { inp = await fileInputFromBoard(page, 5, { person: 'ignite', type: 'Training', st: '11:00', en: '12:00', oil: 'yes' }) } catch (e) { inp = 'input failed ' + e.message }
console.log('input', JSON.stringify(inp))
await E.pic(page, `world-${SZ}-saturday-board`)
await E.sleep(1500)
await ctx.storageState({ path: STATE })
console.log('saved state', STATE, 'seconds', Math.round((Date.now() - t0) / 1000), 'failed puts:', bad.length ? bad : 'none', 'errors', errors.slice(0, 5))
await browser.close()
