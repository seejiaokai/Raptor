/* [DB-READINESS] group A FULL walk — walker W2 (requests, people, the planning calendar, accounts, the change history).
   Helpers on top of the shared driver (./dbrA-lib.mjs). Import AFTER setting HP_URL / HP_SHOTS / HP_OUT (the driver
   reads them at import). Every gesture goes through the app's OWN controls (the Inputs page form and table, the month
   calendar's popover and picker, Quals, Admin → Users, the Leave War's sheets, the changes window, Admin → Data); the
   localhost probe bridge is used only to get to a place and to READ state for the evidence table. */
import * as L from './dbrA-lib.mjs'
export { L }
export const sleep = L.sleep
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const p2 = n => String(n).padStart(2, '0')
const d0 = new Date()
export const TODAY = `${d0.getFullYear()}-${p2(d0.getMonth() + 1)}-${p2(d0.getDate())}`
export const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}` }

/* ---------------------------------------------------------------- the step table */
export const TABLE = []
let WIDTH = 'desktop'
export const setWidth = w => { WIDTH = w }
const short = a => {
  if (!a) return '(no audit)'
  const f = xs => xs.length > 6 ? xs.slice(0, 6).join(', ') + ` … (+${xs.length - 6})` : xs.join(', ')
  return `put ${a.put.length}${a.put.length ? ' [' + f(a.put) + ']' : ''} · del ${a.del.length}${a.del.length ? ' [' + f(a.del) + ']' : ''} · batches ${a.batches.map(b => `${b.type}/${b.n}`).join(' ') || 'none'}`
}
export const auditText = short
export async function pic(page, name, opts = {}) {
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.style.zIndex = '99999' }).catch(() => {})
  await L.shot(page, name, opts).catch(e => console.log('shot failed', name, e.message))
  return name + '.png'
}

/* One walk step: the gesture through L.step (the rows it wrote, named by its batch, `expect` pinned), a check of what
   the screen must show (`check`), a picture; then (unless reload:false) L.reloadCompare, the screen read again after the
   reload (`after`, run inside an L.step that must write nothing unless `afterExpect` says otherwise), a picture. */
export async function W(page, o) {
  const n0 = L.results.length
  let a = null
  try { a = await L.step(page, `${o.id} ${o.what}`, o.fn, o.expect || null) }
  catch (e) { L.check(`${o.id} ${o.what} — the gesture ran`, false, String(e && e.message || e).split('\n')[0].slice(0, 400)) }
  const pics = []
  if (o.check) {
    try { const x = await o.check(a); L.check(`${o.id} — ${x.what}`, x.ok, x.detail ?? '') }
    catch (e) { L.check(`${o.id} — the screen check ran`, false, String(e && e.message || e).split('\n')[0].slice(0, 400)) }
  }
  const focus = async () => { if (!o.focus) return; try { const sel = typeof o.focus === 'function' ? await o.focus() : o.focus; if (sel) { const el = page.locator(sel).first(); if (await el.count()) { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250) } } } catch { } }
  if (o.shot !== false) { await focus(); pics.push(await pic(page, `${o.id}-a`)) }
  let said = ''
  if (o.reload !== false && a) {
    try {
      /* A PRISTINE loaded week (never saved — the settled rule "pristine weeks are not stored") has its rows' hidden ids
         (`rid`, never printed) minted afresh at every load, so they differ after any reload: recomputed, not something
         the person made. Ignored ONLY while the loaded week has no stored week row — once it is saved its ids must
         come back exactly. */
      const pristine = await page.evaluate(() => { const k = 'raptor:weeks/' + String(window.CURWEEK).replace(/\//g, '-'); return localStorage.getItem(k) == null })
      const ign = [...(o.ignore || []), ...(pristine ? [/^\.hist\.d\.\d+\..*\.rid: /] : [])]
      const rc = await L.reloadCompare(page, o.id, o.who || 'a', { page: o.pg || null, ignore: ign })
      await toastSpy(page)   // a reload drops the page's toast watcher — put it back
      if (pristine) {
        /* the driver's own difference list stops at ~40 entries, so on a pristine week the fresh ids could crowd a real
           difference out of it: compare again with every hidden row id set aside — nothing else may differ */
        const strip = x => JSON.parse(JSON.stringify(x, (k, v) => (k === 'rid' ? undefined : v)))
        const d = L.stateDiff(strip(rc.s1), strip(rc.s2))
        L.check(`${o.id} — (pristine week) with the fresh hidden row ids set aside, the reload gives back everything else exactly`, !d.length, d.length ? d.slice(0, 12).join(' || ') : 'same')
      }
      if (o.after) {
        let x = null
        await L.step(page, `${o.id} reading the screen after the reload`, async () => { x = await o.after() }, o.afterExpect || { none: true })
        if (x) { L.check(`${o.id} — after the reload: ${x.what}`, x.ok, x.detail ?? ''); said = x.said || x.what }
      }
    } catch (e) { L.check(`${o.id} — the reload ran`, false, String(e && e.message || e).split('\n')[0].slice(0, 400)) }
    await focus()
    pics.push(await pic(page, `${o.id}-b`))
  }
  const rs = L.results.slice(n0)
  const row = { step: o.id, width: o.width || WIDTH, what: o.what, afterReload: said, rows: short(a), pass: rs.every(r => r.ok), fails: rs.filter(r => !r.ok).map(r => `${r.name}: ${r.detail}`.slice(0, 600)), pics }
  TABLE.push(row)
  console.log(`== ${row.pass ? 'PASS' : 'FAIL'} ${row.step} — ${row.what} :: ${row.rows}`)
  return { a, row }
}
export function save(extra = {}) { return L.save({ table: TABLE, ...extra }) }

/* ---------------------------------------------------------------- the rows, by collection */
export function byCollection(r) {
  const o = {}
  for (const k of Object.keys(r)) { const [c, id = ''] = k.split('/'); const sub = c === 'weeks' ? (id.includes(':is:') ? 'is' : id.includes(':rx:') ? 'rx' : id.includes('#') ? 'day' : 'week') : (id.split(':')[0].length < id.length ? id.split(':')[0] : '(one)'); const n = `${c}/${sub}`; o[n] = (o[n] || 0) + 1 }
  return o
}
export const batchList = r => Object.keys(r).filter(k => k.startsWith('changes/')).map(k => { try { const b = JSON.parse(r[k]); return { key: k, type: b.type, actorId: b.actorId, n: (b.items || []).length, items: b.items } } catch { return { key: k, bad: true } } })

/* ---------------------------------------------------------------- toasts */
export async function toastSpy(page) {
  await page.evaluate(() => {
    if (window.__w2t) return
    window.__w2t = []
    new MutationObserver(ms => { for (const m of ms) {
      const el = document.getElementById('toastEl'); if (!el) continue
      if (m.target === el || el.contains(m.target)) { const t = (el.textContent || '').trim(); if (t && window.__w2t[window.__w2t.length - 1] !== t) window.__w2t.push(t) }
    } }).observe(document.body, { childList: true, subtree: true, characterData: true })
  }).catch(() => {})
}
export async function toasts(page) { return page.evaluate(() => { const a = window.__w2t || []; window.__w2t = []; return a }).catch(() => []) }

/* ---------------------------------------------------------------- the Inputs page */
export async function closeBoard(page) {
  if (await page.locator('#schedBoard:visible').count()) { const x = page.locator('#sbDone:visible').first(); if (await x.count()) await x.click(); else await page.keyboard.press('Escape'); await sleep(500) }
}
export async function inputsList(page) {
  await closeBoard(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(page, 'inputs')
  await page.waitForSelector('#inRangeBtn', { timeout: 8000 })
  if (await page.locator('#icClose:visible').count()) { await page.locator('#icClose').click(); await sleep(400) }
}
/* the table's window set to the whole list, through its own 📅 button → "All" (the ids of the rows it draws, in order) */
export async function inputsAll(page) {
  await inputsList(page)
  /* always re-picked: a pick in the filter bar is the person arranging the table, and it releases the rows a fresh add
     pinned to the top (the page's own rule) — so the order read is the table's own order */
  const btn = page.locator('#inRangeBtn')
  if ((await btn.getAttribute('aria-expanded')) !== 'true') { await btn.click(); await sleep(300) }
  await page.locator('#inRangeAll').click(); await sleep(400)
  return listOrder(page)
}
export const listOrder = page => page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => t.dataset.iid))
export const inputRow = (page, iid) => page.evaluate(i => { const x = window.INPUTS.find(r => r.iid === i); return x ? { iid: x.iid, person: x.person, type: x.type, date: x.date, endDate: x.endDate || '', remarks: x.remarks || '', ord: x.ord } : null }, iid)
export const rowText = (page, iid) => page.evaluate(i => { const t = document.querySelector(`#inBody tr[data-iid="${i}"]`); return t ? t.innerText.replace(/\s+/g, ' ').trim() : null }, iid)

async function walkCal(page, cal, iso) {
  for (let i = 0; i < 40 && !(await page.locator(`${cal} [data-cal="${iso}"]`).count()); i++) {
    const [m, y] = (await page.locator(`${cal} .rc-mon`).first().textContent()).trim().split(/\s+/)
    const at = `${y}-${p2(MONS.indexOf(m.slice(0, 3)) + 1)}`
    await page.locator(`${cal} button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
    await sleep(80)
  }
  await page.locator(`${cal} [data-cal="${iso}"]`).first().click()
  await sleep(140)
}
/* File a request through the Inputs page's own form; answers the certificate ask "No document" and an OIL ask "Yes";
   returns the ids of the rows it made (a clash sheet is left open for the caller when `leaveSheet`) */
export async function fileReq(page, f) {
  await inputsList(page)
  const before = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  if (f.person && await page.locator('#inPerson').count()) await page.selectOption('#inPerson', f.person)
  await page.selectOption('#inType', f.type)
  await walkCal(page, '#inCal', f.from)
  if ((await page.locator('#inDates').textContent()).includes('→')) await walkCal(page, '#inCal', f.from)
  if (f.to && f.to !== f.from) await walkCal(page, '#inCal', f.to)
  if (await page.locator('#inSpan').count()) await page.locator(`#inSpan [data-span="${f.span || 'all'}"]`).click()
  else if (await page.locator('#inAllday').count()) { if (!(await page.locator('#inAllday').isChecked())) await page.locator('#inAllday').click() }
  await page.locator('#inRemarks').fill(f.remarks || '')
  await page.locator('#inAdd').click()
  await sleep(600)
  const asked = []
  for (let i = 0; i < 3; i++) {
    const nodoc = page.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await sleep(500); continue }
    const conf = page.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) {
      asked.push('oil')
      await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {})
      await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {})
      await sleep(600); continue
    }
    break
  }
  const clash = await page.locator('[data-testid="medclash"]:visible').count()
  const iids = await page.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid) }, before)
  return { asked, clash: !!clash, iids, iid: iids[0] || null }
}
/* the clash sheet: per clash 'new' (the new entry wins the day) or 'old' (the standing one keeps it), then Save */
export async function clashAnswer(page, choices) {
  for (const [i, ch] of choices.entries()) {
    const row = page.locator(`[data-testid="medclash-${i}"] button.upconf-seg`)
    const n = await row.count()
    if (n) await row.nth(ch === 'new' ? 0 : Math.min(1, n - 1)).click()
    await sleep(200)
  }
  const b = page.locator('[data-testid="medclash-save"]:visible').first()
  if (!(await b.count())) return 'no save on the clash sheet'
  if (await b.isDisabled()) return 'the clash sheet\'s save is disabled'
  await b.click(); await sleep(700)
  return 'saved'
}
/* the table row's ✎ editor */
export async function openEdit(page, iid) {
  await inputsAll(page)
  const pen = page.locator(`#inBody tr[data-iid="${iid}"] [data-edit]`).first()
  if (!(await pen.count())) return false
  await pen.scrollIntoViewIfNeeded(); await pen.click(); await sleep(400)
  return !!(await page.locator(`#inBody tr.ined[data-iid="${iid}"]`).count())
}
export async function editRemarks(page, iid, text) {
  if (!(await openEdit(page, iid))) return 'no editor opened'
  await page.locator(`#inBody tr.ined [data-ed="remarks"]`).fill(text)
  await page.locator('#inBody tr.ined [data-save]').first().click(); await sleep(700)
  return 'saved'
}
export async function redate(page, iid, fromIso, toIso) {
  if (!(await openEdit(page, iid))) return 'no editor opened'
  const cal = '#inedCal'
  await walkCal(page, cal, fromIso)
  const read = async () => (await page.locator('#inBody tr.ined .rc-read').first().innerText()).trim()
  if ((await read()).includes('→')) await walkCal(page, cal, fromIso)
  if (toIso && toIso !== fromIso) await walkCal(page, cal, toIso)
  const r = await read()
  await page.locator('#inBody tr.ined [data-save]').first().click(); await sleep(700)
  for (let i = 0; i < 2; i++) {
    const nodoc = page.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await sleep(500) }
    const conf = page.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600) }
  }
  return r
}
export async function delReq(page, iid) {
  await inputsAll(page)
  const x = page.locator(`#inBody tr[data-iid="${iid}"] .rmx`).first()
  if (!(await x.count())) return 'no ✕ on the row'
  await x.scrollIntoViewIfNeeded(); await x.click(); await sleep(500)
  return (await page.locator(`#inBody tr[data-iid="${iid}"]`).count()) ? 'still listed' : 'gone'
}

/* ---------------------------------------------------------------- the month calendar (the planning calendar) */
export async function calTo(page, ym) {
  await inputsList(page)
  if (!(await page.locator('#inpCal:visible').count())) { await page.locator('#inCalBtn').click(); await sleep(600) }
  await page.waitForSelector('#inpCal .ic-mon', { timeout: 8000 })
  const MF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  for (let i = 0; i < 30; i++) {
    const [m, y] = (await page.locator('#inpCal .ic-mon').first().innerText()).trim().split(/\s+/)
    const at = `${y}-${p2(MF.findIndex(x => x.toLowerCase() === m.toLowerCase()) + 1)}`
    if (at === ym) break
    await page.locator(at < ym ? '#icNext' : '#icPrev').click(); await sleep(250)
  }
  await sleep(250)
}
export async function calDayOpen(page, iso) {
  await calTo(page, iso.slice(0, 7))
  if (await page.locator('.ic-pop:visible').count()) { await page.locator('#icPopClose').click(); await sleep(250) }
  const c = page.locator(`#inpCal [data-icday="${iso}"] .ic-num`).first()
  await c.scrollIntoViewIfNeeded(); await c.click(); await sleep(400)
  return !!(await page.locator('.ic-pop:visible').count())
}
export async function calDayClose(page) { if (await page.locator('#icPopClose:visible').count()) { await page.locator('#icPopClose').click(); await sleep(300) } }
/* + Pucks on a day → tick the people → ✓ Add */
export async function addPucks(page, iso, pids) {
  if (!(await calDayOpen(page, iso))) return 'the day did not open'
  await page.locator('#icAddPucks').click(); await sleep(400)
  for (const id of pids) { const b = page.locator(`[data-pickp="${id}"]`).first(); if (!(await b.count())) return 'no puck ' + id + ' in the picker'; await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(120) }
  await page.locator('#icPickOk').click(); await sleep(500)
  return 'added'
}
export async function dayTitle(page, iso, text) {
  if (!(await calDayOpen(page, iso))) return 'the day did not open'
  const t = page.locator('#icRmkEdit')
  await t.fill(text); await t.press('Enter'); await sleep(300)
  await t.blur().catch(() => {}); await sleep(300)
  return 'typed'
}
export const calCell = (page, iso) => page.evaluate(d => {
  const c = document.querySelector(`#inpCal [data-icday="${d}"]`)
  if (!c) return null
  return { title: (c.querySelector('.ic-rmk') || {}).textContent || '', pucks: [...c.querySelectorAll('.ic-pks')].map(r => [...r.querySelectorAll('.ic-pk')].map(e => e.textContent.trim()).join('+')) }
}, iso)
export const planOf = (page, iso) => page.evaluate(d => { const s = JSON.parse(window.histSnap()); return { pp: (s.pp || []).filter(x => x.date === d).map(x => ({ id: x.id, ids: x.ids, kind: x.kind, text: x.text, ord: x.ord ?? x.sortIndex })), dm: (s.dm || {})[d] || null } }, iso)

/* ---------------------------------------------------------------- sign in / out as anyone */
export async function signOut(page) {
  await closeBoard(page)
  for (const sel of ['#logout', '#accOut', '#guestOut']) {
    const l = page.locator(sel)
    if (await l.count() && await l.first().isVisible()) { await l.first().click(); await sleep(500); break }
  }
  if (!(await page.locator('#luser:visible').count())) {
    const b = page.locator('#burger'); if (await b.count() && await b.isVisible()) { await b.click(); await sleep(300); await page.click('#drawerLogout'); await sleep(500) }
  }
  await page.waitForSelector('#luser', { timeout: 15000 })
}
/* the sign-in card as a name the app does not know (or waits for) — no week to wait for */
export async function cardSignIn(page, name, pass = 'x') {
  if (!(await page.locator('#luser:visible').count())) await signOut(page)
  await page.fill('#luser', name); await page.fill('#lpass', pass)
  await page.click('#loginForm button[type=submit]')
  await sleep(800)
}

/* ---------------------------------------------------------------- Admin → Users */
export async function usersPane(page, phone = false) {
  await closeBoard(page)
  await L.go(page, 'admin')
  const t = page.locator('[data-admcat="users"]:visible, .adm-cat:has-text("Users"):visible').first()
  if (await t.count()) { await t.click(); await sleep(400) }
  await page.waitForSelector('#accAddBlock', { state: 'attached', timeout: 8000 })
}
export async function addPerson(page, { cs, ini, seat, cat, signin = '', role = null }) {
  await page.fill('#accAddCs', cs); await page.fill('#accAddIni', ini)
  await page.selectOption('#accAddSeat', seat); if (seat !== 'GND') await page.selectOption('#accAddCat', cat)
  await page.fill('#accAddName', signin); await sleep(150)
  if (signin && role) await page.selectOption('#accAddRole', role)
  await page.locator('#accAdd').scrollIntoViewIfNeeded(); await page.click('#accAdd'); await sleep(600)
}
export const usersRows = page => page.evaluate(() => [...document.querySelectorAll('#accList [data-person]')].map(r => r.dataset.person))
export const pidOf = (page, cs) => page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c) || null, cs)
export async function openPersonRow(page, pid, archived = false) {
  if (archived) { if (!(await page.locator('#accArchList').count())) { await page.click('#accArchToggle'); await sleep(300) } }
  const b = page.locator(`${archived ? '#accArchList' : '#accList'} [data-person="${pid}"] .acc-tap`).first()
  await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(350)
}
export const accountRows = r => Object.keys(r).filter(k => k.startsWith('settings/account:')).map(k => { try { return { key: k, ...JSON.parse(r[k]) } } catch { return { key: k, bad: true } } })

/* ---------------------------------------------------------------- Quals, pickers: their orders */
export async function qualsOrder(page) {
  await closeBoard(page); await L.go(page, 'quals')
  if (await page.locator('#qViewA').count()) { await page.click('#qViewA'); await sleep(300) }
  return page.evaluate(() => [...document.querySelectorAll('#qtbl tbody td.qname[data-person]')].map(e => e.dataset.person))
}
export async function pickerOrders(page) {
  await inputsList(page)
  const inPerson = await page.evaluate(() => [...document.querySelectorAll('#inPerson option')].map(o => o.value))
  const inFPerson = await page.evaluate(() => [...document.querySelectorAll('#inFPerson option')].map(o => o.value))
  await closeBoard(page); await L.go(page, 'editsched')
  const palette = await page.evaluate(() => [...document.querySelectorAll('#eRoster .rpuck[data-person]')].map(e => e.dataset.person))
  return { inPerson, inFPerson, palette }
}

/* ---------------------------------------------------------------- the day popover's sections (notes and pucks rows) */
export const secIds = page => page.evaluate(() => [...document.querySelectorAll('.ic-pop [data-sec]')].map(e => e.getAttribute('data-sec')))
/* + Note: a new free-text section on the day */
export async function addNote(page, iso, text) {
  if (!(await calDayOpen(page, iso))) return 'the day did not open'
  await page.locator('#icAddPuck').click(); await sleep(250)
  const t = page.locator('.ic-pop input.ic-poppuck-edit').first()
  await t.fill(text); await t.press('Enter'); await sleep(200)
  await t.blur().catch(() => {}); await sleep(300)
  return 'added'
}
/* drag a section's ⠿ handle onto another section's top half (lands BEFORE it) — the popover must be open */
export async function dragSec(page, id, targetId) {
  const h = page.locator(`.ic-pop [data-sechandle="${id}"]`).first()
  const t = page.locator(`.ic-pop [data-sec="${targetId}"]`).first()
  const a = await h.boundingBox(), b = await t.boundingBox()
  if (!a || !b) return 'no handle or target drawn'
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down(); await sleep(80)
  const tx = b.x + b.width / 2, ty = b.y + Math.max(3, b.height * 0.2)
  for (let i = 1; i <= 12; i++) { await page.mouse.move(a.x + (tx - a.x) * i / 12, a.y + (ty - a.y) * i / 12); await sleep(25) }
  await page.mouse.up(); await sleep(500)
  return 'dropped'
}
export async function delSec(page, id) {
  const x = page.locator(`.ic-pop [data-ppdel="${id}"]`).first()
  if (!(await x.count())) return 'no ✕ on the section'
  await x.click(); await sleep(400); return 'deleted'
}
/* a pucks row's "+ add": tick people and ✓ Add */
export async function pkAdd(page, rowId, pids) {
  await page.locator(`.ic-pop [data-pkadd="${rowId}"]`).first().click(); await sleep(400)
  for (const id of pids) { const b = page.locator(`[data-pickp="${id}"]`).first(); if (!(await b.count())) return 'no puck ' + id; await b.scrollIntoViewIfNeeded(); await b.click(); await sleep(120) }
  await page.locator('#icPickOk').click(); await sleep(500)
  return 'added'
}
