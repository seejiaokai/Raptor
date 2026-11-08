// W2 part A: build healthy world (published Wed, Bolt LL filed), save state; then S10 on U at PC and phone.
import * as L from './sm-lib.mjs'
import { writeFileSync } from 'node:fs'
console.log('sm-w2-a v1', L.DIST)
const OUT = L.outDir('w2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const res = {}
const step = async (k, fn) => { try { res[k] = await fn(); console.log(k, JSON.stringify(res[k])) } catch (e) { res[k] = { err: e.message.split('\n')[0] }; console.log(k, 'ERR', res[k].err) } }

const W = await L.launch('pc', { origin: ORIGIN })
await L.signIn(W)
await step('pub', () => L.publishDay(W, 2))
await L.closeBoard(W)
await step('file', async () => { const r = await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' }); return r && { iid: r.iid } })
const keys = await W.page.evaluate(() => Object.keys(localStorage).filter(k => /weeks\//.test(k)))
console.log('weekkeys', JSON.stringify(keys))
const state = await W.ctx.storageState()
writeFileSync(SCR + '/w2-state.json', JSON.stringify(state))
const key2 = await L.weekRowKey(W.page, 2)
writeFileSync(SCR + '/w2-key.json', JSON.stringify({ key2, keys }))
console.log('key2', JSON.stringify(key2), 'errs', JSON.stringify(W.errs))
await L.closeAll(W)
console.log('DONE')
