// W2.1, W2.2, W2.8, W2.9 on the fresh world. SIZE=phone|pc, ONLY=w21,w22,w28,w29
import { newWorld, openBoard, oilOn, sleep, close, shot, setField, fieldVal, tapSpec, tag, wrapCls, selCount, toast, VERSION } from './oeb-w2-lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs'
const size = process.env.SIZE || 'pc'
const only = (process.env.ONLY || 'w21,w22,w28,w29').split(',')
console.log(VERSION, 'fresh', size)
const OUT = 'C:/Users/User/AppData/Local/Temp/claude/ba46d636af5eaefe/e324d8f6-0c85-4339-be37-1d188075a056/scratchpad/res'
mkdirSync(OUT, { recursive: true })
const res = {}
const FABLE = { cs: 'Fable', key: 'dr:5.0.0' }
const sdoEnd = page => page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].end)
const sdoStr = page => page.evaluate(() => window.DAYS[5].dutywaves[0].rows[0].str ?? window.DAYS[5].dutywaves[0].rows[0].start)

async function scen(id, fn) {
  if (!only.includes(id)) return
  const w = await newWorld(size, 'fresh')
  try { await openBoard(w); res[id] = await fn(w); res[id].errors = w.errors } catch (e) { res[id] = { error: e.message } }
  console.log(id, JSON.stringify(res[id]))
  await close(w)
}
const pic = (id) => `${id}-${size}`

await scen('w21', async w => {
  const v = await setField(w, 'dr:5.0.0.end', '')
  const end = await sdoEnd(w.page)
  await oilOn(w, true)
  const t = await tapSpec(w, FABLE, 'w21-' + size + '-tap-fable')
  return { endAfterClear: end, tap: t }
})
await scen('w22', async w => {
  await setField(w, 'dr:5.0.0.str', '')
  await setField(w, 'dr:5.0.0.end', '')
  const st = [await sdoStr(w.page), await sdoEnd(w.page)]
  await oilOn(w, true)
  const t = await tapSpec(w, FABLE, 'w22-' + size + '-tap-fable')
  return { startEnd: st, tap: t }
})
await scen('w28', async w => {
  // outside the mode
  const before = await tag(w.page, FABLE)
  const t = await tapSpec(w, FABLE, 'w28-' + size + '-tap-fable-oil-off')
  const selClasses = await w.page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.sel')].map(p => p.textContent.trim()))
  return { before, tap: t, selPucks: selClasses }
})
await scen('w29', async w => {
  await oilOn(w, true)
  const before = await tag(w.page, FABLE)
  await shot(w, 'w29-' + size + '-before')
  const t1 = await tapSpec(w, FABLE, 'w29-' + size + '-tap1')
  const c1 = await tag(w.page, FABLE)
  await sleep(2500)
  const t2 = await tapSpec(w, FABLE, 'w29-' + size + '-tap2')
  const c2 = await tag(w.page, FABLE)
  await shot(w, 'w29-' + size + '-after-second')
  return { before, t1, afterTap1: c1, t2, afterTap2: c2 }
})
writeFileSync(`${OUT}/fresh-${size}.json`, JSON.stringify(res, null, 1))
