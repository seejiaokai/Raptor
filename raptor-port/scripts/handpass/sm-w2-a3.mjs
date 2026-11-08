// W2 fixture 3: state2 + week 20 Jul loaded and its Tuesday published, so a saved row of next week exists (S4).
import * as L from './sm-lib.mjs'
import { writeFileSync, readFileSync } from 'node:fs'
console.log('sm-w2-a3 v1')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const state = JSON.parse(readFileSync(SCR + '/w2-state2.json', 'utf8'))
const W = await L.launch('pc', { origin: ORIGIN, state })
const { page } = W
await L.signIn(W); await L.goEdit(W)
await page.locator('[data-wk="20/07/2026"]').filter({ visible: true }).first().click(); await L.sleep(1500)
console.log('pub', JSON.stringify(await L.publishDay(W, 1))); await L.closeBoard(W)
const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => /weeks\//.test(k)))
console.log('keys', JSON.stringify(keys))
writeFileSync(SCR + '/w2-state3.json', JSON.stringify(await W.ctx.storageState()))
writeFileSync(SCR + '/w2-keys3.json', JSON.stringify(keys))
console.log('errs', JSON.stringify(W.errs))
await L.closeAll(W)
console.log('DONE')
