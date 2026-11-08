// W2 fixture 2: healthy world with Wed published, Bolt LL 15, Quill LL 19-20 Jul, Bolt HL 19-20 Jul; weeks 20 and 27 Jul visited so their rows exist.
import * as L from './sm-lib.mjs'
import { writeFileSync } from 'node:fs'
console.log('sm-w2-a2 v2')
const ORIGIN = 'http://localhost:4393'
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/e63929f0a8c01089/bf4e1ab0-4906-4138-afef-e67911a71441/scratchpad'
const W = await L.launch('pc', { origin: ORIGIN })
const { page } = W
await L.signIn(W)
console.log('pub', JSON.stringify(await L.publishDay(W, 2))); await L.closeBoard(W)
for (const o of [{ who: 'Bolt', type: 'LL', iso: '2026-07-15' }, { who: 'Quill', type: 'LL', iso: '2026-07-19', iso2: '2026-07-20' }, { who: 'Bolt', type: 'HL', iso: '2026-07-19', iso2: '2026-07-20' }]) {
  const r = await L.fileInput(W, o); console.log('file', o.who, o.type, r && r.iid)
}
await L.goEdit(W)
for (const wk of ['20/07/2026', '27/07/2026']) {
  const b = page.locator(`[data-wk="${wk}"]`).filter({ visible: true }).first()
  await b.click(); await L.sleep(1500)
  console.log('week', wk, await page.evaluate(() => (document.querySelector('#weekSegE .on,#weekSeg .on,[data-wk].on,[data-wk].act') || {}).textContent))
}
const keys = await page.evaluate(() => Object.keys(localStorage).filter(k => /weeks\//.test(k)))
console.log('keys', JSON.stringify(keys))
writeFileSync(SCR + '/w2-state2.json', JSON.stringify(await W.ctx.storageState()))
writeFileSync(SCR + '/w2-keys2.json', JSON.stringify(keys))
console.log('errs', JSON.stringify(W.errs))
await L.closeAll(W)
console.log('DONE')
