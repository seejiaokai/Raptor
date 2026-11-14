/* pdl-w2-lib v2 — shared helpers for walker W2 (published-day logic settings). Env HP_URL / HP_SHOTS must be set BEFORE import. */
import { writeFileSync } from 'node:fs'
export const X = await import('../rcf/rcf-w1-lib.mjs')
export const W2 = await import('../rcf/rcf-w2-lib.mjs')
export const { L, sleep, check, note, norm, RESULTS } = X
export const SHOTS = process.env.HP_SHOTS
export const pic = (page, name) => page.screenshot({ path: `${SHOTS}/${name}.png` }).then(() => name + '.png')

export async function toWeek(page, iso) {
  await L.go(page, 'editsched'); await sleep(500)
  await page.locator('.wk-cal:visible, .filt-cal:visible').first().click(); await sleep(500)
  const sel = `#weekCal [data-iso="${iso}"]`
  const month = iso.slice(0, 7)
  for (let i = 0; i < 8 && !(await page.locator(sel).count()); i++) {
    const shown = await page.evaluate(() => [...document.querySelectorAll('#weekCal [data-iso]')].map(e => e.getAttribute('data-iso')))
    const dir = shown.length && shown[shown.length - 1].slice(0, 7) < month ? 'next' : 'prev'
    await page.locator(`#weekCal [data-testid="wcal-${dir}"]`).first().click(); await sleep(400)
  }
  await page.locator(sel).first().click(); await sleep(1200)
  await L.go(page, 'editsched'); await sleep(500)
  const r = await page.evaluate(() => ({ week: window.CURWEEK, mon: window.DAYS[0].dt }))
  console.log('week ->', JSON.stringify(r))
  return r
}
/* Logic page: set a setting (key = data-lgset), returns {before, after}. phone => tap */
export async function setLogic(w, key, val) {
  const page = w.page
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator(`#lgBody input[data-lgset="${key}"]:visible`).count())) { await X.press(w, '#lgEdit', { scope: 'page' }); await sleep(400) }
  const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded()
  if (val != null) { await inp.fill(String(val)); await inp.press('Tab'); await sleep(500) }
  return { before, after: await inp.inputValue() }
}
/* a flying line on a new wave of day di: fields + seat (board must be open) */
export async function flight(w, di, { cs = 'VL', msn = 'BFM', to = '1200', ld = '1300', who = null, br = null } = {}) {
  const gi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.cs"]`, cs)
  await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.msn"]`, msn)
  if (to) await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.to"]`, to)
  if (ld) await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.ld"]`, ld)
  if (br) await X.typeIn(w, `[data-bfld="ff:${di}.${gi}.0.br"]`, br)
  let seatR = null
  if (who) seatR = await X.seatPhoneAware(w, `[data-slot="${di}.${gi}.0.0.p"]`, who)
  return { gi, seatR }
}
/* a ground row on day di (board open): prog, str, end, man */
export async function ground(w, di, { prog = 'BRIEFING', str = '1200', end = '1230', who = null } = {}) {
  const page = w.page
  const n0 = await page.evaluate(d => window.DAYS[d].ground.length, di)
  await X.press(w, `[data-gradd="${di}"]`); await sleep(400)
  const ri = n0
  await X.typeIn(w, `[data-bfld="gr:${di}.${ri}.prog"]`, prog)
  if (str) await X.typeIn(w, `[data-bfld="gr:${di}.${ri}.str"]`, str)
  if (end) await X.typeIn(w, `[data-bfld="gr:${di}.${ri}.end"]`, end)
  let put = null
  if (who) put = await L.put(page, `[data-fill="g:${di}.${ri}.+"]`, [who])
  return { ri, put }
}
/* type an in-time line (contenteditable) of wave gi on day di; returns the stored lines */
export async function setInTime(w, di, gi, text) {
  const page = w.page
  await X.press(w, `[data-itadd="${di}|${gi}"]`)
  const idx = await page.evaluate(([d, g]) => window.DAYS[d].waves[g].intimes.length - 1, [di, gi])
  const el = page.locator(`#schedBoard [data-itline="${di}|${gi}|${idx}"]:visible`).first()
  await el.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(text, { delay: 10 })
  await page.keyboard.press('Tab'); await sleep(400)
  return page.evaluate(([d, g]) => JSON.stringify(window.DAYS[d].waves[g].intimes), [di, gi])
}
const ringWord = r => { const c = r.cls.split(' '); return c.includes('hard') ? 'RED' : c.includes('note') ? 'note' : r.warn ? 'AMBER' : 'plain' }
/* READ every surface for day di / man id. Pictures: <tag>-edit, <tag>-view, <tag>-board. Leaves the board open on day di (if board). */
export async function snapshot(w, di, id, tag, { board = true } = {}) {
  const page = w.page
  const out = {}
  await L.closeBoard(page)
  await L.go(page, 'editsched'); await sleep(500)
  const es = await X.stripItems(page, '#eWeek', di)
  out.edit = { head: es.head, items: es.items, rings: id ? (await W2.ring(page, id, `#eWeek .day[data-day="${di}"]`)).map(r => r.where + ':' + ringWord(r)) : [], tag: await page.evaluate(d => { const s = document.querySelector(`#eWeek .day[data-day="${d}"] .day-head`); return s ? s.innerText.replace(/\s+/g, ' ').trim() : '' }, di) }
  await pic(page, `${tag}-edit`)
  await L.go(page, 'viewsched'); await sleep(500)
  const vs = await X.stripItems(page, '#vWeek', di)
  out.view = { head: vs.head, items: vs.items, rings: id ? (await W2.ring(page, id, `#vWeek .day[data-day="${di}"]`)).map(r => r.where + ':' + ringWord(r)) : [], tag: await page.evaluate(d => { const s = document.querySelector(`#vWeek .day[data-day="${d}"] .day-head`); return s ? s.innerText.replace(/\s+/g, ' ').trim() : '' }, di) }
  await pic(page, `${tag}-view`)
  if (board) {
    await L.board(page, di); await sleep(600)
    const bw = await X.boardWarn(page, w)
    out.board = { head: bw.head, items: bw.items, rings: id ? (await W2.ring(page, id, '#schedBoard')).map(r => r.where + ':' + ringWord(r)) : [] }
    await pic(page, `${tag}-board`)
  }
  console.log('SNAP', tag, JSON.stringify(out))
  return out
}
export const surfaces = o => ['edit', 'view', 'board'].filter(k => o[k])
export const hit = (o, re) => surfaces(o).filter(k => o[k].items.some(t => re.test(t)))
export function finish(w, extra = {}) {
  writeFileSync(SHOTS + '/results.json', JSON.stringify({ results: RESULTS, errors: w.errors, ...extra }, null, 1))
  console.log('ERRORS', JSON.stringify(w.errors))
}
