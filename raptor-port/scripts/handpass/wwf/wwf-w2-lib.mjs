/* wwf w2 lib (16 Nov 26) — the w2 walker's own helpers, built on the proven www-lib route.
   init(run, phone) sets the frozen build + picture folder, then loads the shared driver. */
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = dirname(fileURLToPath(import.meta.url))
export async function init(run, phone = false) {
  process.env.WWW_DIST ||= 'C:/Users/User/AppData/Local/Temp/walk-fd8c40f40'
  process.env.WWW_BUNDLE ||= 'index-B9-7bbV4.js'
  process.env.WWW_WHO = 'w2'
  process.env.WWW_RUN = run
  process.env.HP_SHOTS = resolve(HERE, '../../../docs/img/handpass/2026-11-16-warn-words-followups', 'w2', run)
  const X = await import('../www/www-lib.mjs')
  return X
}
export const MONDAY_WK = '27/07/2026'   // an empty week; its Monday follows 26 Jul (day 6 of week 20 Jul)
export const SUNDAY_WK = '20/07/2026'
export const nrm = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
export async function gotoWeek(X, w, dmy, pageId) {
  const { page } = w
  if (pageId) await X.L.go(page, pageId)
  if (w.phone) {
    // the phone shows no week chips (a day strip instead): set-up only, the chip is clicked by script
    await page.evaluate(d => document.querySelector(`.wk[data-wk="${d}"]`).click(), dmy)
  } else {
    const b = page.locator(`.wk[data-wk="${dmy}"]:visible`).first()
    await b.waitFor({ state: 'visible', timeout: 8000 })
    await b.click()
  }
  await X.sleep(900)
  return page.evaluate(() => document.querySelector('.wk.on:last-of-type, .wk.on')?.dataset.wk)
}
export async function reload(X, w, who = 'a') {
  const { page } = w
  await page.reload()
  await X.sleep(800)
  if (await page.locator('#luser').count()) await X.L.login(page, who)
  await X.sleep(600)
}
/** make an SC Shift (or plain) desk on the board of day di; first row str/end typed; people seated on its + */
export async function makeDesk(X, w, di, { tpl = 'sc', str = '20:00', end = '', people = [], row = 0, role = null } = {}) {
  const { page } = w
  await X.board(w, di)
  const wi = await page.evaluate(d => (window.DAYS[d].dutywaves || []).length, di)
  await X.press(w, `[data-dwadd="${di}"]`, { scope: 'board' }); await X.sleep(300)
  await X.press(w, `[data-blktpl="${tpl}"]`); await X.sleep(400)
  const base = `${di}.${wi}.${row}`
  if (role != null) await X.typeIn(w, `[data-bfld="dr:${base}.role"]`, role)
  if (str != null) await X.typeIn(w, `[data-bfld="dr:${base}.str"]`, str)
  await X.typeIn(w, `[data-bfld="dr:${base}.end"]`, end)
  const seated = []
  for (const p of people) seated.push(await X.seat(w, `[data-fill="d:${base}.+"]`, p))
  const r = await page.evaluate(([d, i, rw]) => { const b = window.DAYS[d].dutywaves[i]; const x = b.rows[rw]; return { label: b.label, sa: b.sa, role: x.role, str: x.str, end: x.end, who: JSON.stringify(x.id) + '/' + JSON.stringify(x.more || null) } }, [di, wi, row])
  X.say('desk', JSON.stringify(r), 'seat results', seated.join(','))
  return { wi, base, r, seated }
}
export async function setEnd(X, w, di, wi, row, v) {
  await X.board(w, di)
  await X.typeIn(w, `[data-bfld="dr:${di}.${wi}.${row}.end"]`, v)
}
export async function shot(X, w, name, loc) { return X.pic(w, name, loc) }
/** a flight with a front and a rear man and an optional B; returns wave index */
export async function flight2(X, w, di, { to, ld, br = '', front, rear }) {
  const wi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  if (ld) await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.ld"]`, ld)
  if (br) await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.br"]`, br)
  const out = []
  if (front) out.push(await X.seat(w, `[data-slot="${di}.${wi}.0.0.p"]`, front))
  if (rear) out.push(await X.seat(w, `[data-slot="${di}.${wi}.0.0.w"]`, rear))
  const f = await w.page.evaluate(([d, g]) => { const x = window.DAYS[d].waves[g].formations[0]; const a = x.aircraft[0]; return { to: x.to, ld: x.ld, br: x.br, p: window.PEOPLE[a.p]?.cs, w: window.PEOPLE[a.w]?.cs } }, [di, wi])
  X.say('flight2', JSON.stringify(f), out.join(','))
  return wi
}
export const crew = l => /crew rest/i.test(l)
/** the roster picker's reading for a man with a seat armed: class + title of his puck in #sbRoster */
export async function pickerRead(X, w, di, armSel, ids, tag = '') {
  const { page } = w
  await X.board(w, di)
  await X.ensureRoster(w)
  await X.press(w, armSel, { scope: 'board' }); await X.sleep(300)
  const r = await page.evaluate(ids => ids.map(id => { const e = document.querySelector(`#sbRoster .rpuck[data-person="${id}"]`); return e ? { id, cls: e.className, title: e.getAttribute('title') || '', txt: (e.innerText || '').replace(/\s+/g, ' ').trim() } : { id, missing: true } }), ids)
  await X.pic(w, 'picker-' + tag + armSel.replace(/\W+/g, '_').slice(0, 30))
  await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
  await page.keyboard.press('Escape').catch(() => {})
  await X.closeRoster(w)
  await X.closeBoard(w)
  return r
}
function nrm2(s) { return String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() }
