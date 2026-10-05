/* Walker S (the Codex stack re-walk, 6 Oct 26) — shared helpers. Copied from stk2-N-klib / wh-lib recipes.
   Everything a step DOES goes through the app's own controls; window.* only to get to a place and to READ. */
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import * as H from './wh-lib.mjs'
export { H }
export const { L, W } = H
export const sleep = L.sleep
export const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const p2 = n => String(n).padStart(2, '0')
export const PICS = { saved: 0 }
export async function pic(p, name, opts = {}) { const f = await H.pic(p, name, opts); PICS.saved++; return f }

export function addRows(rows) {
  const OUT = process.env.HP_OUT; if (!OUT) return
  mkdirSync(dirname(OUT), { recursive: true })
  let all = { rows: [] }
  if (existsSync(OUT)) { try { all = JSON.parse(readFileSync(OUT, 'utf8')) } catch { all = { rows: [] } } }
  if (!all.rows) all.rows = []
  for (const r of rows) { all.rows = all.rows.filter(x => !(x.id === r.id && x.part === r.part)); all.rows.push(r) }
  writeFileSync(OUT, JSON.stringify(all, null, 1))
}
export const ROWS = []
export function note(id, part, did, saw, verdict, pics = []) {
  ROWS.push({ id, part, did, saw, verdict, pics })
  console.log(`== ${verdict}  ${id}/${part} — ${did}\n     saw: ${String(saw).slice(0, 1800)}`)
}
export function flush() { addRows(ROWS); console.log('rows saved:', ROWS.length, 'pics saved this run:', PICS.saved) }

/* ---- the Inputs page form ---- */
async function walkCal(p, iso) {
  const cal = '#inCal'
  for (let i = 0; i < 40 && !(await p.locator(`${cal} [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await p.locator(`${cal} .rc-mon`).first().textContent()).trim().split(/\s+/)
    const at = `${y}-${p2(MONS.indexOf(m.slice(0, 3)) + 1)}`
    await p.locator(`${cal} button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
    await sleep(80)
  }
  await p.locator(`${cal} [data-cal="${iso}"]`).first().click(); await sleep(140)
}
export async function toInputs(p) {
  if (await p.locator('#schedBoard:visible').count()) await W.boardOff(p)
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  if (await p.locator('#icClose:visible').count()) { await p.locator('#icClose').click(); await sleep(300) }
}
export async function fileOpen(p, { person, type, iso, toIso, from, to, remarks, span }) {
  await toInputs(p)
  const before = await p.evaluate(() => window.INPUTS.map(x => x.iid))
  if (person && await p.locator('#inPerson').count()) await p.selectOption('#inPerson', { label: person }).catch(() => p.selectOption('#inPerson', person))
  await p.selectOption('#inType', type)
  await walkCal(p, iso)
  if ((await p.locator('#inDates').textContent()).includes('→')) await walkCal(p, iso)
  if (toIso && toIso !== iso) await walkCal(p, toIso)
  if (from != null) {
    if (await p.locator('#inAllday').count()) { if (await p.locator('#inAllday').isChecked()) await p.locator('#inAllday').click() }
    else if (await p.locator('#inSpan [data-span="custom"]').count()) await p.locator('#inSpan [data-span="custom"]').click()
    if (await p.locator('#inStartT').count()) { await p.locator('#inStartT').fill(from); await p.locator('#inStartT').blur() }
    if (to != null && await p.locator('#inEndT').count()) { await p.locator('#inEndT').fill(to); await p.locator('#inEndT').blur() }
  } else if (await p.locator('#inSpan').count()) await p.locator(`#inSpan [data-span="${span || 'all'}"]`).click().catch(() => {})
  await p.locator('#inRemarks').fill(remarks || '')
  await p.locator('#inAdd').click()
  await sleep(700)
  return { before }
}
export const newIid = (p, before) => p.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid)[0] || null }, before)
export async function answerAsks(p, { oil = 'Yes' } = {}) {
  const asked = []
  for (let i = 0; i < 4; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { asked.push('doc'); await nodoc.click(); await sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) {
      asked.push('oil')
      await conf.locator('button').filter({ hasText: new RegExp('^' + oil) }).first().click().catch(() => {})
      await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {})
      await sleep(600); continue
    }
    break
  }
  return asked
}
export const winOpen = (p, testid) => p.locator(`[data-testid="${testid}"]:visible`).count().then(n => n > 0)
export function errList(errors) { return errors.filter(e => !/quota/i.test(e)) }

/* click a box at its centre with the real mouse after scrolling it to the middle */
export async function clickBox(p, sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250)
  const b = await el.boundingBox()
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(250)
  return b
}
