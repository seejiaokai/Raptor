/* [WARN-HIDE-KEPT] walk — walker C's own helpers, on top of wh-lib. Reads what a person sees; every write is a control. */
import * as H from './wh-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
export { H, W2 }
const { L, W } = H
export const WK1 = '13/07/2026', WK2 = '20/07/2026'
export const HEX = ['hex', 'x']

/* change week through the week chips of the page that is up (Edit Schedule: #weekSegE, View-only Sched: #weekSeg) */
export async function toWeek(p, wk) {
  if ((await p.evaluate(() => window.CURWEEK)) !== wk) {
    const c = p.locator(`[data-wk="${wk}"]:visible`).first()
    if (await c.count()) { await c.click(); await L.sleep(1000) }
    else {
      /* a phone has no week chips: the calendar button ("Jump to a date") → tap that week's Monday (July 2026 is up) */
      const cal = p.locator('[aria-label="Jump to a date"]:visible').first()
      if (!(await cal.count())) return 'no week chip and no calendar button for ' + wk
      await cal.click(); await L.sleep(500)
      const day = String(+wk.slice(0, 2))
      const hit = await p.evaluate(d => { const t = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim() === 'Jump to a date' && e.offsetParent !== null); if (!t) return 'no calendar opened'; let box = t.parentElement; while (box && !/JUL 2026/i.test(box.innerText || '')) box = box.parentElement; if (!box) return 'the calendar is not on July 2026'; const b = [...box.querySelectorAll('button')].find(x => (x.innerText || '').trim() === d); if (!b) return 'no day ' + d; b.setAttribute('data-whc-day', d); return 'ok' }, day)
      if (hit !== 'ok') return hit
      await p.locator(`[data-whc-day="${day}"]`).first().click(); await L.sleep(1200)
    }
  }
  return p.evaluate(() => window.CURWEEK)
}
/* the day's bar, the line matching `re`, and a man's pucks on that day — as painted */
export async function see(p, surf, di, re, pid = null) {
  const had = await H.openList(p, surf, di)
  let list = await H.readList(p, surf, di)
  let line = (list.lines || []).find(l => re.test(l.text)) || null
  /* a long list: bring the line into the window before judging its button (a person scrolls to it) */
  if (line && line.btnTop === 'off-screen') {
    await p.evaluate(([s, i, x]) => { const e = document.querySelector(`${s} .day[data-day="${i}"] .witem[data-wix="${x}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [surf, di, line.ix]); await L.sleep(250)
    list = await H.readList(p, surf, di); line = (list.lines || []).find(l => re.test(l.text)) || null
  }
  const m = /(\d+) issues?/.exec(list.bar || '')
  const n = m ? +m[1] : /No issues/i.test(list.bar || '') ? 0 : null
  const pk = pid ? await H.pucks(p, `${surf} .day[data-day="${di}"]`, pid) : []
  return { had, bar: list.bar, barCls: list.barCls, n, line, nLines: (list.lines || []).length, lines: list.lines || [], pucks: pk, flagged: H.flagged(pk) }
}
/* a short sentence of what `see` saw */
export const say = s => `bar "${s.bar}" · line ${s.line ? `${s.line.struck ? 'STRUCK' : 'plain'} btn "${s.line.btn}"${s.line.btn ? (s.line.btnTop === true ? ' (topmost)' : ' (NOT topmost: ' + s.line.btnTop + ')') : ''}` : 'ABSENT'} · pucks ${s.pucks.length} / flagged ${s.flagged.length}${s.flagged.length ? ' [' + s.flagged.map(x => x.where + ':' + (x.sev || '') + (x.chip ? ' ' + x.chip : '') + (x.dot ? ' dot' : '') + (x.dash ? ' dash' : '') + (x.red ? ' red' : '')).join(', ') + ']' : ''}`
/* the standard checks: a hidden line (struck, ↺ or no button), n issues, no flag */
export const hiddenChecks = (s, n, { button = '↺', label = '' } = {}) => [
  [`${label}bar reads ${n === 0 ? 'No issues' : n + ' issue(s)'}`, s.n === n, s.bar],
  [`${label}the line is still in the list`, !!s.line],
  [`${label}the line is painted struck`, !!s.line && s.line.struck],
  [`${label}its button is "${button || 'none'}"`, !!s.line && s.line.btn === button, s.line ? s.line.btn : ''],
  ...(button ? [[`${label}the button is the thing a finger lands on`, !!s.line && s.line.btnTop === true, s.line ? String(s.line.btnTop) : '']] : []),
  ...(s.pucks.length ? [[`${label}his pucks carry no flag`, s.flagged.length === 0, s.flagged.map(x => x.cls).join(' | ')]] : []),
]
export const shownChecks = (s, n, { button = '✕', label = '', flag = true } = {}) => [
  [`${label}bar reads ${n} issue(s)`, s.n === n, s.bar],
  [`${label}the line is painted plain (not struck)`, !!s.line && !s.line.struck],
  [`${label}its button is "${button || 'none'}"`, !!s.line && s.line.btn === button, s.line ? s.line.btn : ''],
  ...(flag && s.pucks.length ? [[`${label}his pucks carry the flag`, s.flagged.length > 0, s.pucks.map(x => x.cls).join(' | ')]] : []),
]
/* a picture with the line in the middle of the window */
export async function picLine(p, surf, di, ix, name) {
  await p.evaluate(([s, i, x]) => { const e = document.querySelector(`${s} .day[data-day="${i}"] .witem[data-wix="${x}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, [surf, di, ix])
  await L.sleep(250)
  return H.pic(p, name)
}
/* sign out through the app's own button, then in as `who` */
export async function reSign(p, who) { await L.settle(p); await W2.signOut(p); await L.signIn(p, who, { goto: false }) }
/* the schedule rows a step wrote (everything but the change-log batches and the history lines) */
export const schedRows = d => [...d.put, ...d.del].filter(k => !/^settings\/elog/.test(k))
export async function wrote(p, fn) { await L.settle(p, 500); const a = await L.rows(p); const r = await fn(); await L.settle(p); const b = await L.rows(p); const d = L.diff(a, b); return { r, d, sched: schedRows(d), after: b } }
/* the newest lines of the change history as stored (who, what) — read only */
export async function histTail(p, n = 4) { return p.evaluate(k => ((window.ELOG && window.ELOG.rows) || []).slice(-k).map(l => JSON.stringify(l).slice(0, 260)), n) }
/* ---------- the guest ---------- */
/* the admin turns on "Let people waiting for access view the schedule" (Admin → Users) */
export async function guestSwitchOn(p) {
  await W2.usersPane(p)
  const sw = p.locator('#admGuestView')
  if (!(await sw.count())) return 'no guest switch'
  await sw.evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (!(await sw.isChecked())) { await sw.click(); await L.sleep(500) }
  await L.settle(p)
  return (await sw.isChecked()) ? 'on' : 'off'
}
/* sign in with a name the app does not know; ask for access through its own form the first time; "View the schedule" */
export async function guestIn(p, name = 'walkguest') {
  await L.settle(p)
  await W2.cardSignIn(p, name, 'x'); await L.sleep(800)
  if (await p.locator('#accSend:visible').count()) {
    await p.fill('#accCs', 'Walker'); await p.fill('#accIni', 'WK')
    await p.selectOption('#accSeat', 'FCP'); await L.sleep(150); await p.selectOption('#accCat', 'C'); await L.sleep(150)
    await p.click('#accSend'); await L.sleep(1000)
  }
  const v = p.locator('#accGuest:visible')
  if (!(await v.count())) return 'no "View the schedule" button — the guest view is not offered'
  await v.click(); await L.sleep(1200)
  return (await p.locator('#guestApp:visible').count()) ? 'in' : 'the guest view did not open'
}
/* what the guest's page holds for a day: a man's pucks as painted, and any issues bar / hide button anywhere */
export async function guestSee(p, di, pid) {
  await W.showDay(p, di, '#vWeek')
  const pk = await H.pucks(p, `#guestApp .day[data-day="${di}"]`, pid)
  const doors = await p.evaluate(() => ({ bars: [...document.querySelectorAll('[data-daywarn], [data-dwbox]')].filter(e => e.offsetParent !== null).length, btns: [...document.querySelectorAll('[data-woff]')].filter(e => e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden').length, note: (document.querySelector('#guestNote') || {}).innerText || '', tag: [...document.querySelectorAll('#guestApp .day[data-day] .verchip')].map(e => e.innerText.trim()) }))
  return { pucks: pk, flagged: H.flagged(pk), ...doors }
}
/* the admin's member view, through his name badge (on a phone it is in the ☰ drawer) */
export async function badge(p) {
  let b = p.locator('#roleBadge:visible').first()
  if (!(await b.count())) { const bg = p.locator('#burger:visible'); if (await bg.count()) { await bg.click(); await L.sleep(350) } b = p.locator('#roleBadge:visible, #drawerRole:visible, [data-roleview]:visible').first() }
  if (!(await b.count())) return { pressed: false }
  const before = (await b.innerText()).trim()
  await b.click(); await L.sleep(900)
  const after = await p.evaluate(() => [...document.querySelectorAll('#roleBadge, #drawerRole, [data-roleview]')].map(e => (e.innerText || '').trim()).filter(Boolean).join(' / '))
  await p.keyboard.press('Escape').catch(() => {}); await L.sleep(200)
  return { pressed: true, before, after }
}
/* does the page offer any way to hide or flag again, or to reach Edit Schedule */
export const doors = p => p.evaluate(() => ({ woff: [...document.querySelectorAll('[data-woff]')].filter(e => e.offsetParent !== null && getComputedStyle(e).visibility !== 'hidden').length, editTab: [...document.querySelectorAll('[data-go="editsched"]')].some(e => e.offsetParent !== null), page: window.CURPAGE }))
/* ---------- a second scheduler ---------- */
/* Admin → Users: Hex's own row → Role "Admin — schedules and manages" → Save (the app's own controls) */
export async function makeHexAdmin(p) {
  await W2.usersPane(p)
  await W2.openPersonRow(p, 'rocky')
  await p.selectOption('#accEdRole', 'admin'); await L.sleep(150)
  await p.click('#accEdSave'); await L.sleep(600); await L.settle(p)
  return p.evaluate(() => (document.querySelector('#accList [data-person="rocky"]') || {}).innerText.replace(/\s+/g, ' '))
}
/* a second tab of the same browser (the same storage), signed in as someone else */
export async function secondPage(ctx, errors, who, label = 'B') {
  const q = await L.page(ctx, errors, label)
  await L.signIn(q, who)
  return q
}
/* the changes window (the top bar's clock; on the board its own History button): "All changes", as a person reads it */
export async function changesText(p, { by = 'Item', tab = /^All changes/ } = {}) {
  if (!(await p.locator('.chgwin:visible').count())) {
    const b = p.locator('#schedBoard:visible #sbHist, #histBtn:visible').first()
    if (!(await b.count())) return { none: 'no changes button' }
    await b.click(); await L.sleep(700)
    if (!(await p.locator('.chgwin:visible').count())) return { none: 'no changes window opened' }
  }
  const win = p.locator('.chgwin:visible').first()
  const all = win.locator('button, [role=tab]').filter({ hasText: tab }).first()
  if (await all.count()) { await all.click(); await L.sleep(350) }
  const g = win.locator('button').filter({ hasText: new RegExp('^' + by + '$') }).first()
  if (await g.count()) { await g.click(); await L.sleep(350) }
  const text = await win.evaluate(e => e.innerText.replace(/[ \t]+/g, ' ').replace(/\n+/g, ' ⏎ ').slice(0, 4000))
  return { text }
}
export async function closeChanges(p) {
  if (!(await p.locator('.chgwin:visible').count())) return
  const b = p.locator('#histBtn:visible').first()
  if (await b.count()) { await b.click(); await L.sleep(300) }
  if (await p.locator('.chgwin:visible').count()) { await p.keyboard.press('Escape'); await L.sleep(300) }
}
/* ---------- the week's edge ---------- */
/* the owner's own case: on Sunday 19 Jul, through the board's duty panel — "+ Row" on the duty block, Ranger (bane) put
   on it from the crew list, its role and times typed (till 23:00). He flies next Monday's first wave. */
export async function lateSundayDuty(p, end = '2300') {
  await W.boardOn(p, 6); await L.sleep(300)
  const n0 = await p.locator('#schedBoard .sb-panel.duty [data-move^="mv:d.6.0."]').count()
  const add = p.locator('#schedBoard [data-dradd="6.0"]').first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await L.sleep(500)
  const n1 = await p.locator('#schedBoard .sb-panel.duty [data-move^="mv:d.6.0."]').count()
  const ri = n1 - 1
  /* arm the new row's people box (its "+ add"), then tap Ranger in the board's crew list */
  await p.locator(`#schedBoard [data-move="mv:d.6.0.${ri}"] .ppl`).first().click(); await L.sleep(300)
  const armed = await p.evaluate(() => (window.ARM && window.ARM.key) || null)
  const pk = p.locator('#sbRoster .rpuck[data-person="bane"]:visible').first()
  await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(100); await pk.click(); await L.sleep(500)
  await p.keyboard.press('Escape'); await L.sleep(150)
  const put = { armed }
  await W.boardText(p, `dr:6.0.${ri}.role`, 'LATE DUTY')
  await W.boardText(p, `dr:6.0.${ri}.str`, '1500')
  await W.boardText(p, `dr:6.0.${ri}.end`, end)
  const row = await p.evaluate(i => { const r = document.querySelector(`#schedBoard [data-move="mv:d.6.0.${i}"]`); return r ? { role: r.querySelector('[data-bfld$=".role"]').value, str: r.querySelector('[data-bfld$=".str"]').value, end: r.querySelector('[data-bfld$=".end"]').value, who: [...r.querySelectorAll('[data-person]')].map(e => e.dataset.person) } : null }, ri)
  await L.settle(p)
  await W.boardOff(p)
  return { rowsBefore: n0, rowsAfter: n1, put, row }
}
/* Sunday as painted: Ranger's pucks there, and the words of Sunday's list (a "Breaks Monday" trace line) */
export async function sundayLook(p, surf, pid = 'bane') {
  await W.showDay(p, 6, surf)
  const had = await H.openList(p, surf, 6)
  const pk = await H.pucks(p, `${surf} .day[data-day="6"]`, pid)
  const box = await p.evaluate(s => { const b = document.querySelector(`${s} .day[data-day="6"] [data-dwbox="6"]`); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '' }, surf)
  const dot = pk.some(x => x.dot), cr = pk.some(x => /^(R|CR)$/i.test(String(x.chip).trim()))
  return { had, pucks: pk, dot, cr, chip: pk.map(x => x.chip).join(','), cls: pk.map(x => x.cls).join(' | '), box, breaks: /Breaks Monday/i.test(box) }
}
export const sundaySay = s => `Ranger's Sunday puck: ${s.pucks.length ? (s.dot ? 'DOTTED' : 'no dotted mark') + ', chip "' + s.chip + '"' : 'not drawn'} · Sunday's list ${s.breaks ? 'has a "Breaks Monday" line' : 'has no "Breaks Monday" line'}`
/* a picture of Sunday with Ranger's puck in the window */
export async function picSunday(p, surf, name, pid = 'bane') {
  await p.evaluate(([s, who]) => { const e = [...document.querySelectorAll(`${s} .day[data-day="6"] .puck[data-person="${who}"]`)].find(x => x.offsetParent !== null); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, [surf, pid]); await L.sleep(300)
  return H.pic(p, name)
}
/* ---------- the next-week preview (desktop only: to the right of Sunday) ---------- */
/* the preview's Monday: is it drawn, and its red time boxes as painted (the box's own outline / shadow / border) */
export async function peekLook(p, surf) {
  await p.evaluate(s => { const pk = document.querySelector(`${s} .day.peek[data-peek-day="0"]`); if (pk) { const sc = pk.closest('.week') || pk.parentElement; if (sc) sc.scrollLeft = sc.scrollWidth; const b = pk.querySelector('.fcell.badtm') || pk; b.scrollIntoView({ block: 'center', inline: 'nearest' }) } }, surf)
  await L.sleep(350)
  return p.evaluate(s => {
    const pk = document.querySelector(`${s} .day.peek[data-peek-day="0"]`)
    if (!pk || pk.offsetParent === null) return { drawn: false, n: 0, cells: [] }
    const paint = e => { const c = getComputedStyle(e); return `outline ${c.outlineStyle} ${c.outlineColor} ${c.outlineWidth} · border ${c.borderTopStyle} ${c.borderTopColor} ${c.borderTopWidth} · shadow ${c.boxShadow.slice(0, 50)}` }
    const plain = pk.querySelector('.fcell.bto:not(.badtm)')
    const cells = [...pk.querySelectorAll('.fcell.badtm')].map(e => ({ txt: e.innerText.replace(/\s+/g, ' ').trim(), paint: paint(e), onScreen: (() => { const r = e.getBoundingClientRect(); return r.width > 0 && r.left >= 0 && r.right <= innerWidth })() }))
    return { drawn: true, head: pk.innerText.replace(/\s+/g, ' ').slice(0, 60), n: cells.length, cells, plainPaint: plain ? paint(plain) : '', differs: cells.length ? cells.every(c => plain && c.paint !== paint(plain)) : null }
  }, surf)
}
/* the red time boxes on the loaded week's own Monday */
export const weekRed = (p, surf, di = 0) => p.evaluate(([s, i]) => [...document.querySelectorAll(`${s} .day[data-day="${i}"] .fcell.badtm`)].filter(e => e.offsetParent !== null).length, [surf, di])
export function done(name, errors, extra = {}) { H.savePart(name, { errors, ...extra }); console.log('ERRORS', JSON.stringify(errors)) }
