/* [OIL-WORK-START] walker A — shared helpers on top of stk-A-lib (itself on wh-lib / dbrA-W1-lib). Every fixture goes
   through the app's own controls; window.* only READS (bug-check order §7.7). */
import * as S from './stk-A-lib.mjs'
export * from './stk-A-lib.mjs'
const { W, L, pic, sleep } = S

export const letters = c => (/\b(HO|FO)\b/.exec((c && c.text) || '') || [])[1] || ((c && c.text) || '').replace(/\s+/g, ' ').trim().slice(0, 20) || '(blank)'

/* the Leave War cell + the OIL tracker row + the war's own record, for a man and a date */
export async function oilOf(p, id, iso, name, { shots = true } = {}) {
  await S.lwOpenMonth(p, 'JUL')
  const cell = await S.lwCellOf(p, id, iso)
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [id, iso]); await sleep(300)
  const picCell = shots ? await pic(p, name + '-cell') : null
  const row = await S.oilRow(p, id)
  const picRow = shots ? await pic(p, name + '-tracker') : null
  await S.closeOil(p)
  const rec = await p.evaluate(([i, d]) => { try { const st = window.lwState ? window.lwState() : null; const w = st && st.wars && st.wars[0]; const l = w && w.recs && w.recs[i] && w.recs[i][d]; return l ? l.filter(r => r.oil === 'auto').map(r => `${r.code} ${(r.spans || []).map(s => s.join('-')).join(',')}`).join(' | ') : '' } catch (e) { return 'n/a' } }, [id, iso])
  const bal = (/(-?\d+(?:\.\d+)?)\s*left/.exec(row) || [])[1]
  return { cell, letters: letters(cell), row, rec, bal: bal === undefined ? null : +bal, pics: [picCell, picRow].filter(Boolean) }
}
/* the worked times on a tracker row: every "hh:mm–hh:mm" printed after the date's source words */
export const spansOf = row => (String(row).match(/\d\d:\d\d\s*[–-]\s*\d\d:\d\d/g) || []).map(s => s.replace(/\s/g, '').replace('-', '–'))

/* the day: head (tag, signs), the WAITING chip only, the To go out list, the Amendments box */
export async function dayState(p, di, name, { shots = true, list = true } = {}) {
  await S.toWeek(p); await W.showDay(p, di)
  const head = await S.dayHead(p, di)
  head.pending = await p.evaluate(i => { const c = document.querySelector(`#eWeek .day[data-day="${i}"] .dpend:not(.dnew):not(.dchg)`); return c && c.offsetParent !== null ? c.innerText.replace(/\s+/g, ' ').trim() : '' }, di)
  const picHead = shots ? await pic(p, name + '-day') : null
  const pics = [picHead].filter(Boolean)
  let lst = ''
  const chip = p.locator(`#eWeek .day[data-day="${di}"] .dpend:not(.dnew):not(.dchg)`).first()
  if (list && await chip.count() && await chip.isVisible()) {
    await chip.click(); await sleep(600)
    lst = await p.evaluate(() => { const e = document.querySelector('.pl-list'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no list drawn)' })
    if (shots) pics.push(await pic(p, name + '-togoout'))
    const x = p.locator('[data-chgclose]:visible, .chgwin [aria-label="Close"]:visible, .chgwin .win-x:visible').first()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(300) } else { await p.keyboard.press('Escape'); await sleep(300) }
  }
  const al = await S.alPanel(p)
  return { head, list: lst, pend: (/\d+/.exec(head.pending || '') || ['0'])[0], al: al && al.text ? al.text.slice(0, 200) : '', pics }
}
export const signsWords = h => (h && h.signs || []).map(s => (!s || /name/i.test(s)) ? '–' : s).join('/') + (h && h.nys ? ' + chip "' + h.nys + '"' : ' + no Not-yet-signed chip') + (h && h.alpub ? ' + button "' + h.alpub + '"' : '')
/* a PUBLISHED day's four selects are the NEXT amendment's, blank before and after; its sign-offs "stand" while there is no
   "Not yet signed" chip and fall when the chip shows. An unpublished day's selects hold the names. */
const isPub = h => !!h && /ORIG|AL\s*\d/.test(h.tag || '')
export const signFell = h => isPub(h) ? !!h.nys : W.signsEmpty(h)
export const signStand = h => isPub(h) ? !h.nys : W.signsFull(h)

/* View-only Sched: the man's puck on the published day */
export async function faceOf(p, di, id, name) {
  await S.toWeek(p); await S.L.go(p, 'viewsched'); await sleep(500); await W.showDay(p, di, '#vWeek')
  const face = await p.evaluate(([i, who]) => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null
    const pk = [...d.querySelectorAll(`[data-person="${who}"]`)].find(e => e.offsetParent !== null)
    return { tag: (d.querySelector('.verchip') || {}).innerText || '', puck: pk ? pk.className : '(no puck)', title: pk ? pk.getAttribute('title') || '' : '' } }, [di, id])
  const f = name ? await pic(p, name + '-viewonly') : null
  return { face, edge: face && /oilbar-fo/.test(face.puck) ? 'FO edge' : face && /oilbar-ho/.test(face.puck) ? 'HO edge' : face && /oilbar/.test(face.puck) ? 'edge?' : 'no edge', pic: f }
}

export async function lgRead(p) { return p.evaluate(() => ({ lead: window.VCONF.reportLead, debrief: window.VCONF.debrief, full: window.VCONF.oilFullMin })) }

/* a Saturday flying line with one man; returns where */
export async function satLine(p, { cs = 'VIPER', to = '10:00', ld = '11:15', p1 = 'bane', di = 5 } = {}) {
  await S.L.go(p, 'editsched'); await sleep(400)
  return S.addFlyingWave(p, di, { cs, to, ld, p1 })
}
export async function logicReset(p) {
  await W.boardOff(p); await S.L.go(p, 'logic')
  const ed = p.locator('#lgEdit'); if (await ed.count() && await ed.isVisible()) { await ed.click(); await sleep(400) }
  const b = p.getByRole('button', { name: /reset to standard/i }).first()
  const n = await b.count()
  if (!n) return 'no Reset button'
  await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(700)
  /* a confirm may follow */
  const c = p.locator('button:visible', { hasText: /^(confirm|yes|reset)/i }).first()
  let confirmed = ''
  if (await c.count()) { confirmed = (await c.innerText()).trim(); await c.click().catch(() => {}); await sleep(600) }
  return 'pressed' + (confirmed ? ' + ' + confirmed : '')
}
/* the top bar's Undo / Redo (the app's own) */
export const undo = p => W.door(p, 'top', 'undo')
export const redo = p => W.door(p, 'top', 'redo')

/* a compact line of what the screen said */
export function say(o, d) {
  const parts = []
  if (o) parts.push(`cell ${o.letters}; tracker row "${(o.row || '').slice(0, 130)}"; worked ${spansOf(o.row).join(', ') || '–'}; balance ${o.bal}; war record "${o.rec || ''}"`)
  if (d) parts.push(`day tag ${d.head && d.head.tag}; pending chip "${d.head && d.head.pending}"; sign-offs ${signsWords(d.head)}; list "${(d.list || '').slice(0, 330)}"`)
  return parts.join(' || ')
}

/* ---------- builders & the scenario frame (walker A) ---------- */
/* a Saturday (or any day) flying line for one man, with an optional typed In-time / Rally line, through the board's own controls */
export async function flyLine(p, { di = 5, cs = 'VIPER', to = '12:00', ld = '13:00', report = null, p1 = 'bane', w1 = null } = {}) {
  await S.L.go(p, 'editsched'); await sleep(400)
  const w = await S.addFlyingWave(p, di, { cs, to, ld, p1, w1 })
  if (report) { await S.addItBtn(p, di, w.wi); await S.setItLine(p, di, w.wi, 0, report) }
  return w
}
/* a bundle: the Leave War + tracker for the man, and the day */
export async function snap(p, di, id, iso, name, o = {}) {
  const lw = await oilOf(p, id, iso, name, { shots: o.shots !== false })
  const d = await dayState(p, di, name, { shots: o.shots !== false, list: o.list !== false })
  return { lw, d, pics: [...lw.pics, ...d.pics] }
}
export const sayS = s => say(s.lw, s.d)
export const hasW = (s, re) => re.test(s.d.list)
export const spans = s => spansOf(s.lw.row)
export const credits = (row, dateRe = /18 Jul|19 Jul/g) => ((String(row).match(dateRe)) || []).length
/* sign one role's select on the visible surface (week or board); returns what it shows */
export async function signRole(p, di, role, pick = 0) {
  const r = (await p.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const sel = p.locator(`${r} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
  if (!(await sel.count())) return 'NO SELECT'
  await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' }))
  const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
  await sel.selectOption(opts[Math.min(pick, opts.length - 1)]); await sleep(300)
  return sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
}
/* the four selects' words, as the week shows them */
export async function selWords(p, di) {
  await S.toWeek(p); await W.showDay(p, di)
  return p.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] select[data-sign]`)].map(s => (s.options[s.selectedIndex] ? s.options[s.selectedIndex].text : '').replace(/\s+/g, ' ')).join(' / '), di)
}
/* a scenario frame: a fresh world, caught errors, NOT WALKED on a throw */
export async function frame(id, fn) {
  const w = await S.world()
  try { await fn(w) } catch (e) {
    S.row(id, 'the script stopped', String(e && e.stack || e).slice(0, 700), 'NOT WALKED', [])
    try { await pic(w.p, id + '-stopped') } catch {}
  }
  console.log(id, 'ERRORS', JSON.stringify(w.errors))
  S.savePart(id, { errors: w.errors })
  await w.browser.close()
}
export const BASE_HP = process.env.HP_URL
