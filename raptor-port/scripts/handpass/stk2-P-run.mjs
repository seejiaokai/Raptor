/* Walker P of the re-walk (6 Oct 26): one fresh browser world per scenario + the scenario runner.
   Env: HP_URL (my server), HP_SHOTS, HP_OUT, STK_STATE (a saved Saturday world, made by stk2-P-build.mjs). */
import * as H from './stk2-P-lib.mjs'
export * from './stk2-P-lib.mjs'
const { lib, row, pic, savePart } = H
let cur = null
export const ALLERR = []
export const W = { page: null }
export async function closeWorld() {
  if (cur) { for (const e of cur.errors) ALLERR.push(e); await cur.browser.close().catch(() => {}); cur = null; W.page = null }
}
export async function newWorld(opts = {}) {
  await closeWorld()
  cur = await lib.open({ width: 1440, height: 900, who: 'a', fresh: false, ...opts })
  cur.page.setDefaultTimeout(9000)
  W.page = cur.page
  return cur.page
}
/* run one scenario in its own fresh world. fn(page) -> {checks:[[text, ok, detail]], pics, verdict?} */
export async function S(part, id, did, opts, fn) {
  let page
  try {
    page = await newWorld(opts)
    const r = await fn(page)
    const bad = r.checks.filter(c => !c[1])
    row(id, did, r.checks.map(c => `${c[1] ? '✓' : '✗'} ${c[0]}${c[2] !== undefined ? ' [' + (typeof c[2] === 'string' ? c[2] : JSON.stringify(c[2])).slice(0, 420) + ']' : ''}`).join(' · '), r.verdict || (bad.length ? 'FAIL' : 'PASS'), r.pics || [])
  } catch (e) {
    const p = page ? await pic(page, 'ERR-' + id) : null
    row(id, did, 'ERROR ' + String(e.message || e).slice(0, 600), 'NOT WALKED (script error)', p ? [p] : [])
  }
  savePart(part)
}
export async function finish(part) {
  await closeWorld()
  row('ERRORS-' + part, 'console / page errors / 4xx across the worlds of ' + part, ALLERR.length ? ALLERR.join(' || ').slice(0, 1500) : 'none', ALLERR.length ? 'FINDING' : 'PASS')
  savePart(part, { errors: ALLERR })
}
export const typeNow = async (page, txt) => { await page.keyboard.press('Control+A'); await page.keyboard.type(txt, { delay: 8 }) }
export const kk = c => (c.kind || c.tag) + ':' + c.key
export const seqN = page => page.evaluate(() => window.commandStreamLen())
