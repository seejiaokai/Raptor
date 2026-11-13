/* rcsb-w2-common v1 — W2's shared steps (13 Nov 26): the warning names and the crew-rest sentence.
   Import AFTER HP_URL / HP_SHOTS are set by the caller (sub = the scenario's picture folder). Writes only under HP_SHOTS. */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
export const SHOTROOT = resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w2')
export function setShots(sub) {
  process.env.HP_URL ||= 'http://localhost:4193'
  process.env.HP_SHOTS = SHOTROOT + '/' + sub
}
export async function load() {
  const R = await import('../rcsb-lib.mjs')
  const I = await import('../../rcf/rcf-w3-inp.mjs')
  const W = await import('../../rcf/rcf-w2-lib.mjs')
  return { R, I, W, X: R.X, L: R.L, sleep: R.sleep, row: R.row }
}
export const j = o => JSON.stringify(o)
export const clean = s => String(s || '').replace(/[\s ]+/g, ' ').trim()

/* press anything: a tap on a phone, a click otherwise */
export async function hit(w, loc) { if (w.phone) await loc.tap(); else await loc.click() }

/* file an Inputs-page entry for one man on one day through the real window; returns what it filed */
export async function fileInput(w, { I, sleep }, iso, id, typeVal, pic = null) {
  const page = w.page
  await (await import('../rcsb-lib.mjs')).L.go(page, 'inputs'); await sleep(700)
  const n0 = await page.evaluate(() => window.INPUTS.length)
  await I.openDay(page, iso)
  await page.locator('#icPopAdd').click(); await page.waitForSelector('#inpEditPerson'); await sleep(300)
  await page.selectOption('#inpEditPerson', id)
  const opts = await page.locator('#inpEditType option').evaluateAll(os => os.map(o => o.value + '=' + o.textContent.trim()))
  await page.selectOption('#inpEditType', typeVal)
  if (pic) await page.screenshot({ path: `${process.env.HP_SHOTS}/${pic}.png` })
  await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(800)
  const nodoc = []
  for (let k = 0; k < 3; k++) {
    const nd = page.locator('[data-testid="docconf-nodoc"]')
    if (await nd.count() && await nd.first().isVisible()) { nodoc.push('doc question answered "no document"'); await nd.first().click(); await sleep(700) } else break
  }
  const n1 = await page.evaluate(() => window.INPUTS.length)
  // eslint-disable-next-line react-doctor/no-json-parse-stringify-clone -- a walk script's read of one saved input out of the page: only what JSON carries can cross from the browser anyway
  const last = await page.evaluate(() => { const r = window.INPUTS[window.INPUTS.length - 1]; return r && JSON.parse(JSON.stringify(r)) })
  return { added: n1 - n0, opts, nodoc, last }
}

/* a ground row on the board day di: prog, start, end; returns its index */
export async function addGround(w, { X, L, sleep }, di, prog, str, end) {
  const page = w.page
  const rid0 = await page.evaluate(d => window.DAYS[d].ground.map(g => g.rid), di)
  await X.press(w, `[data-gradd="${di}"]`)
  const gi = await page.evaluate(([d, r]) => window.DAYS[d].ground.findIndex(g => !r.includes(g.rid)), [di, rid0])
  await X.typeIn(w, `[data-bfld="gr:${di}.${gi}.prog"]`, prog)
  await X.typeIn(w, `[data-bfld="gr:${di}.${gi}.str"]`, str)
  await X.typeIn(w, `[data-bfld="gr:${di}.${gi}.end"]`, end)
  return gi
}
