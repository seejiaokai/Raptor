// RX2 exploration 1: build the unanswered input of two on a desktop world (not fresh), carry its storage to a phone world.
import { open, shot, errs, browser, saveRes, toMonth, openDay, dayCardText, sleep } from './or-RX2-lib.mjs'
import { makeUnanswered } from './or-RX2-fix.mjs'
const { ctx, page } = await open('ad', 'a', { fresh: false })
const r = await makeUnanswered(page)
console.log(JSON.stringify(r, null, 1))
const state = await ctx.storageState({ indexedDB: true })
console.log('state keys', Object.keys(state), (state.origins || []).map(o => [o.origin, (o.localStorage || []).length, (o.indexedDB || []).length]))
await ctx.close()
const ph = await open('ad', 'a', { fresh: false, viewport: { width: 390, height: 844 }, touch: true, dsf: 2, state }).catch(e => ({ err: String(e).slice(0, 200) }))
console.log(ph.err || 'phone opened')
if (ph.page) {
  console.log(await ph.page.evaluate(() => window.INPUTS.map(x => x.iid + ' ' + x.title + ' ' + x.date)))
  await ph.ctx.close()
}
console.log('ERRS', errs.join('\n'))
await browser.close()
