/* Walker W2's helpers — the medical cascade (26 Sep 26, [HUMAN-RETEST] the absence record).
   Everything here drives the app's OWN controls (the Inputs calendar's chips by a real pointer, the Inputs table's
   ✎ editor, the confirm sheets' own buttons, the Edit Schedule Unavailable row's arm-then-tap, the top-bar Undo /
   Redo, a real reload). Reads of window.* are for the evidence table only — nothing here writes through window.
   Import AFTER setting process.env.AB_WHO (ab-lib reads it at import). */
import * as L from './ab-lib.mjs'
const { go, shot, inputsView, closeBoard, login } = L

export const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* ---------------------------------------------------------------- what the medical record holds (evidence only) */
/** One man's medical and leave rows, as stored, compact: "HL Jul 20–Jul 24". */
export async function medRows(page, person) {
  return page.evaluate(p => window.INPUTS.filter(x => x.person === p)
    .map(x => `${x.type} ${x.date}${x.endDate ? '–' + x.endDate : ''}${x.allday === false ? ` ${String(Math.floor(x.s / 60)).padStart(2, '0')}:${String(x.s % 60).padStart(2, '0')}-${String(Math.floor(x.e / 60)).padStart(2, '0')}:${String(x.e % 60).padStart(2, '0')}` : ''}${x.remarks ? ' "' + String(x.remarks).slice(0, 40) + '"' : ''}`)
    .sort(), person)
}
export const iidsOf = (page, person, type) => page.evaluate(([p, t]) => window.INPUTS.filter(x => x.person === p && (!t || x.type === t)).map(x => x.iid), [person, type])
export const csOf = (page) => page.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, p]) => [k, p.cs])))

/* ---------------------------------------------------------------- the confirm sheets on screen */
/** Which of the save-time sheets is up, and what it says / offers. */
export async function confirmNow(page) {
  return page.evaluate(() => {
    const vis = e => !!e && !!(e.offsetWidth || e.offsetHeight)
    const t = e => (e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : '')
    const o = {}
    for (const id of ['medclash', 'upconf', 'docconf', 'oilconf']) { const e = document.querySelector(`[data-testid="${id}"]`); if (vis(e)) o[id] = t(e).slice(0, 600) }
    const ed = document.getElementById('inpEditPop'); if (ed && !ed.hidden && vis(ed.querySelector('.airpop-box'))) o.editor = t(ed.querySelector('#inpEditTitle'))
    o.buttons = [...document.querySelectorAll('[data-testid="medclash"] button, [data-testid="upconf"] button')].filter(vis).map(b => (b.getAttribute('data-testid') || '') + ':' + t(b) + (b.disabled ? '(off)' : ''))
    return o
  })
}
export const anyConfirm = (c) => !!(c.medclash || c.upconf || c.docconf || c.oilconf)

/* ---------------------------------------------------------------- the Inputs calendar */
/** Open the Inputs calendar and page it to `ym` ('2026-07') through its own ‹ / › buttons. */
export async function calTo(page, ym) {
  if (await page.locator('#schedBoard:visible').count()) await closeBoard(page)
  await inputsView(page, 'cal')
  await page.waitForSelector('#inpCal .ic-mon', { timeout: 8000 })
  const atOf = (mon) => { const [m, y] = mon.trim().split(/\s+/); const i = MONS.findIndex(x => x.toLowerCase() === m.slice(0, 3).toLowerCase()); return `${y}-${String(i + 1).padStart(2, '0')}` }
  for (let i = 0; i < 30; i++) {
    const at = atOf(await page.locator('#inpCal .ic-mon').first().innerText())
    if (at === ym) break
    await page.locator(at < ym ? '#icNext' : '#icPrev').click()
    await page.waitForTimeout(250)
  }
  await page.waitForTimeout(300)
  return (await page.locator('#inpCal .ic-mon').first().innerText()).trim()
}
/** The chips a calendar day shows (callsign + code), and a "+N more". */
export async function calDay(page, iso) {
  return page.evaluate(d => {
    const c = document.querySelector(`#inpCal [data-icday="${d}"]`)
    if (!c) return 'NO CELL'
    return [...c.querySelectorAll('.ic-chip[data-iid]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim() + '#' + e.dataset.iid)
      .concat([...c.querySelectorAll('.ic-more')].map(e => e.innerText.trim()))
  }, iso)
}
/** Picture the calendar rows holding these days. */
export async function calShot(page, name) { return shot(page, name) }

/** Drag the chip of input `iid` from the day cell it sits in (`fromIso`) to `toIso`, with a real MOUSE: press, move
    past the 4px arm threshold, travel in steps, release over the target day. Returns where the pointer went. */
export async function calDragMouse(page, iid, fromIso, toIso) {
  const chip = page.locator(`#inpCal [data-icday="${fromIso}"] .ic-chip[data-iid="${iid}"]`).first()
  if (!(await chip.count())) return { dragged: false, why: `no chip ${iid} on ${fromIso}` }
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(200)
  const a = await chip.boundingBox()
  const cell = page.locator(`#inpCal [data-icday="${toIso}"]`).first()
  const b = await cell.boundingBox()
  if (!a || !b) return { dragged: false, why: 'no box' }
  const x0 = a.x + a.width / 2, y0 = a.y + a.height / 2
  const x1 = b.x + b.width / 2, y1 = b.y + Math.min(b.height - 6, 16)
  await page.mouse.move(x0, y0); await page.mouse.down()
  await page.mouse.move(x0 + 7, y0 + 3, { steps: 2 })
  await page.mouse.move(x1, y1, { steps: 14 })
  await page.waitForTimeout(120)
  const over = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const d = e && e.closest('[data-icday]'); return d ? d.dataset.icday : null }, [x1, y1])
  await page.mouse.up()
  await page.waitForTimeout(700)
  return { dragged: true, over }
}
/** The same drag by a FINGER (CDP touch events at the phone width): touch down, hold past the 180ms pick-up, slide,
    lift. A mouse click is not a finger — the calendar arms a touch only on a hold. */
export async function calDragTouch(page, iid, fromIso, toIso) {
  const chip = page.locator(`#inpCal [data-icday="${fromIso}"] .ic-chip[data-iid="${iid}"]`).first()
  if (!(await chip.count())) return { dragged: false, why: `no chip ${iid} on ${fromIso}` }
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  const a = await chip.boundingBox()
  const b = await page.locator(`#inpCal [data-icday="${toIso}"]`).first().boundingBox()
  if (!a || !b) return { dragged: false, why: 'no box' }
  const cdp = await page.context().newCDPSession(page)
  const t = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints })
  const x0 = a.x + a.width / 2, y0 = a.y + a.height / 2
  const x1 = b.x + b.width / 2, y1 = b.y + Math.min(b.height - 6, 14)
  await t('touchStart', [{ x: x0, y: y0, id: 1 }])
  await page.waitForTimeout(320)                              // past the 180ms hold
  const armed = await page.evaluate(() => document.body.classList.contains('ic-dragging'))
  for (let i = 1; i <= 14; i++) { await t('touchMove', [{ x: x0 + (x1 - x0) * i / 14, y: y0 + (y1 - y0) * i / 14, id: 1 }]); await page.waitForTimeout(18) }
  await page.waitForTimeout(120)
  const over = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const d = e && e.closest('[data-icday]'); return d ? d.dataset.icday : null }, [x1, y1])
  await t('touchEnd', [])
  await page.waitForTimeout(800)
  await cdp.detach().catch(() => {})
  return { dragged: true, armed, over }
}
export const ghostLeft = (page) => page.evaluate(() => ({ ghosts: document.querySelectorAll('.ic-ghost').length, dragging: document.body.classList.contains('ic-dragging') }))

/* ---------------------------------------------------------------- the Inputs table's ✎ editor (the edit WINDOW) */
/** Open the table's in-place editor on `iid` (the table must show its date — inputsWindow first). */
export async function tableEdit(page, iid) {
  const pen = page.locator(`#inBody tr[data-iid="${iid}"] [data-edit]`).first()
  if (!(await pen.count())) return false
  await pen.click(); await page.waitForTimeout(400)
  return !!(await page.locator(`#inBody tr.ined[data-iid="${iid}"]`).count())
}
/** In the open editor, pick a new date range on its own calendar (a single day = pick it twice). */
export async function tablePickDates(page, fromIso, toIso) {
  const cal = '#inedCal'
  const walk = async (iso) => {
    for (let i = 0; i < 30 && !(await page.locator(`${cal} [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator(`${cal} .rc-mon`).first().innerText()).trim().split(/\s+/)
      const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
      await page.locator(`${cal} button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
      await page.waitForTimeout(80)
    }
    await page.locator(`${cal} [data-cal="${iso}"]`).first().click(); await page.waitForTimeout(150)
  }
  /* the picker's rule: with a start and no end, a later day makes a RANGE; a day with both set begins a fresh one */
  await walk(fromIso)
  const read = async () => (await page.locator('#inBody tr.ined .rc-read').first().innerText()).trim()
  let r = await read()
  if (r.includes('→') || !r) { await walk(fromIso); r = await read() }
  if (toIso && toIso !== fromIso) { await walk(toIso); r = await read() }
  return r
}
export async function tableSave(page) {
  await page.locator('#inBody tr.ined [data-save]').first().click(); await page.waitForTimeout(700)
}
export async function tableCancel(page) {
  const x = page.locator('#inBody tr.ined [data-cancel]').first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(400) }
}

/* ---------------------------------------------------------------- the confirm sheets' own buttons */
export async function medClashPick(page, i, which /* 'new' | 'old' */) {
  const row = page.locator(`[data-testid="medclash-${i}"] button.upconf-seg`)
  const n = await row.count()
  if (!n) return false
  await row.nth(which === 'new' ? 0 : Math.min(1, n - 1)).click(); await page.waitForTimeout(200)
  return true
}
export async function medClashTail(page, i, which /* 'remove' | 'keep' */) {
  const b = page.locator(`[data-testid="medclash-tail-${i}"] button.upconf-seg`).nth(which === 'remove' ? 0 : 1)
  if (!(await b.count())) return false
  await b.click(); await page.waitForTimeout(200); return true
}
export async function confirmSave(page) {
  const b = page.locator('[data-testid="medclash-save"]:visible, [data-testid="upconf-save"]:visible').first()
  if (!(await b.count())) return { pressed: false, why: 'no save' }
  if (await b.isDisabled()) return { pressed: false, why: 'disabled' }
  await b.click(); await page.waitForTimeout(700); return { pressed: true }
}
export async function confirmCancel(page) {
  const b = page.locator('[data-testid="medclash"] button.abtn.ghost:visible, [data-testid="upconf"] button.abtn.ghost:visible').first()
  if (!(await b.count())) return false
  await b.click(); await page.waitForTimeout(500); return true
}
export async function upchitPick(page, i, which /* 'keep' | 'remove' */) {
  const b = page.locator(`[data-testid="upconf-left-${i}"] button.upconf-seg`).nth(which === 'keep' ? 0 : 1)
  if (!(await b.count())) return false
  await b.click(); await page.waitForTimeout(200); return true
}

/* ---------------------------------------------------------------- undo / redo / reload */
async function histBtn(page, which) {
  const cands = which === 'undo' ? ['#schedBoard #sbUndo', '#undoBtn', '[data-testid="lw-undo"]'] : ['#schedBoard #sbRedo', '#redoBtn', '[data-testid="lw-redo"]']
  for (const s of cands) { const l = page.locator(s + ':visible').first(); if (await l.count()) return { sel: s, loc: l } }
  return null
}
/** Press Undo / Redo where a person finds it: the Edit Schedule top bar for an admin (the Inputs page has none),
    the Leave War's own pair for a member. Returns the button's title (what it says it will undo). */
export async function hist(page, which, where = 'editsched') {
  if (await page.locator('#schedBoard:visible').count()) await closeBoard(page)
  if ((await page.evaluate(() => window.CURPAGE)) !== where) {
    if (where === 'leavewar') await L.lwOpen(page, '2026-07-20'); else await go(page, where)
  }
  await page.waitForTimeout(300)
  const b = await histBtn(page, which)
  if (!b) return { pressed: false, why: 'no ' + which + ' button on ' + where }
  const title = await b.loc.getAttribute('title'), disabled = await b.loc.isDisabled()
  if (disabled) return { pressed: false, why: 'disabled', title }
  await b.loc.click(); await page.waitForTimeout(900)
  return { pressed: true, where: b.sel, title }
}
/** Reload the page the way a person does and sign back in if the app asks. */
export async function reload(page, who = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  await page.waitForTimeout(800)
  if (await page.locator('#luser:visible').count()) await login(page, who)
  await page.waitForTimeout(600)
  await L.toastSpy(page)
}

/* ---------------------------------------------------------------- the war, read after every step */
/** The man's war row over the dates, his every-figure sheet, and the medical view's counts — one read. */
export async function warRead(page, id, isos) {
  await L.lwOpen(page, isos[0])
  const run = await L.rowRun(page, id, isos)
  const figs = await L.figures(page, id)
  return { run, figs }
}

/* ---------------------------------------------------------------- filing a medical through the Inputs page form */
/** File through the real Inputs form (ab-lib fileInput answers the certificate ask "No document"), then answer the
    medical sheets the way the caller says: ans.choices — per clash 'new' | 'old'; ans.tails — per clash 'remove' |
    'keep'; ans.up — per later entry 'keep' | 'remove'; ans.cancel — press Cancel instead. Returns the sheet it saw and
    the ids of the rows the save made. */
export async function fileMed(page, f, ans = {}) {
  const before = await page.evaluate(() => window.INPUTS.map(x => x.iid))
  /* the calendar and the Medical view are full-screen over the form: back to the list first */
  await toList(page)
  const r = await L.fileInput(page, f)
  const seen = await confirmNow(page)
  if (seen.medclash || seen.upconf) {
    if (ans.cancel) await confirmCancel(page)
    else {
      if (seen.medclash) {
        for (const [i, ch] of (ans.choices || []).entries()) if (ch) await medClashPick(page, i, ch)
        for (const [i, tl] of (ans.tails || []).entries()) if (tl) await medClashTail(page, i, tl)
      }
      if (seen.upconf) for (const [i, ch] of (ans.up || []).entries()) if (ch) await upchitPick(page, i, ch)
      seen.save = await confirmSave(page)
    }
  }
  const fresh = await page.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid) }, before)
  return { asked: r.asked, sheet: seen, iids: fresh, iid: fresh[0] || null, added: fresh.length }
}

/* ---------------------------------------------------------------- the Unavailable row on Edit Schedule */
/** The Unavailable row of input `iid` on day di of the edit week: its seat (the arm / drop target) and its type
    button (the edit window's door). */
export async function unavRow(page, di, iid) {
  await L.editWeek(page)
  const seat = page.locator(`#eWeek .day[data-day="${di}"] .sec-unav [data-inpseat="${iid}"]:visible`).first()
  const edit = page.locator(`#eWeek .day[data-day="${di}"] .sec-unav [data-inpedit="${iid}"]:visible`).first()
  return { seat, edit, has: !!(await seat.count()), hasEdit: !!(await edit.count()) }
}
/** Arm the Unavailable row's person (tap its seat), then tap `pid` in the crew palette — the arm-then-tap reassign. */
export async function reassignByTap(page, di, iid, pid) {
  const u = await unavRow(page, di, iid)
  if (!u.has) return { done: false, why: 'no Unavailable seat drawn for ' + iid }
  await u.seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await u.seat.click(); await page.waitForTimeout(400)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null).catch(() => null)
  let rp = page.locator(`.rpuck[data-person="${pid}"]:visible`).first()
  let opened = null
  if (!(await rp.count())) {
    /* the crew palette may be folded away — open it through its own toggle */
    const tog = page.locator('.ros-tab:visible').first()
    if (await tog.count()) { opened = tog; await tog.click(); await page.waitForTimeout(400) }
    rp = page.locator(`.rpuck[data-person="${pid}"]:visible`).first()
  }
  if (!(await rp.count())) return { done: false, armed, why: 'no palette puck for ' + pid }
  await rp.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await rp.click(); await page.waitForTimeout(700)
  /* a person closes the crew drawer again once the name is placed (on a phone it covers the top bar) */
  const drawerOpen = await page.evaluate(() => document.body.classList.contains('ros-open'))
  if (drawerOpen) { const tab = page.locator('.ros-tab:visible').first(); if (await tab.count()) { await tab.click().catch(() => {}); await page.waitForTimeout(400) } }
  return { done: true, armed, drawerWasOpen: drawerOpen, drawerNow: await page.evaluate(() => document.body.classList.contains('ros-open')) }
}

/** The war's manning counts on one date (every count row's figure) — bodies away read as a change between reads. */
export async function manning(page, iso) {
  await L.lwOpen(page, iso)
  return page.evaluate(d => Object.fromEntries([...document.querySelectorAll(`[data-testid^="count-"][data-testid$="-${d}"]`)]
    .map(e => [e.getAttribute('data-testid').replace(`-${d}`, ''), (e.innerText || '').replace(/\s+/g, ' ').trim()])), iso)
}
/** Everything the war says about one man over some dates, plus the manning on each — the "same before and after" read. */
export async function warFull(page, id, isos) {
  const w = await warRead(page, id, isos)
  const man = {}
  for (const d of isos) man[d.slice(5)] = await manning(page, d)
  return { ...w, man }
}

/* ---------------------------------------------------------------- medical documents */
import { mkdirSync as _mk, writeFileSync as _wf } from 'node:fs'
import { tmpdir as _tmp } from 'node:os'
import { deflateSync as _defl } from 'node:zlib'
/** Three small certificate files (two pictures, one PDF) written to the temp folder, for the upload control. */
export function makeDocs() {
  const dir = `${_tmp()}/w2-docs`.split(String.fromCharCode(92)).join('/'); _mk(dir, { recursive: true })
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0 }
  const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]) }
  const png = (w, h, rgb) => { const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3, band = ((x >> 4) + (y >> 4)) % 2; raw[o] = band ? rgb[0] : 255; raw[o + 1] = band ? rgb[1] : 255; raw[o + 2] = band ? rgb[2] : 255 }
    const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', _defl(raw)), chunk('IEND', Buffer.alloc(0))]) }
  _wf(`${dir}/mc-certificate.png`, png(240, 160, [200, 40, 40]))
  _wf(`${dir}/mc-followup.png`, png(240, 160, [40, 90, 200]))
  _wf(`${dir}/mc-letter.pdf`, '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 55>>stream\nBT /F1 18 Tf 30 100 Td (W2 test medical certificate) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n')
  return { png: `${dir}/mc-certificate.png`, png2: `${dir}/mc-followup.png`, pdf: `${dir}/mc-letter.pdf` }
}
/** What the document viewer shows: its title, the pager, the picture/PDF, the footer buttons. */
export async function docViewNow(page) {
  return page.evaluate(() => {
    const p = document.getElementById('docViewPop')
    if (!p || p.hidden) return { open: false }
    const t = e => (e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : '')
    return { open: true, title: t(p.querySelector('#docViewTitle')), sub: t(p.querySelector('.docview-sub')), count: t(p.querySelector('.docview-count')),
      img: !!p.querySelector('img.docview-img'), pdf: !!p.querySelector('iframe.docview-frame'), none: t(p.querySelector('.docview-none')),
      foot: [...p.querySelectorAll('.airpop-foot button')].map(b => b.id + ':' + t(b)) }
  })
}
/** The Medical button's two badges and the Medical view's three sections (card per person, their lines). */
export async function medView(page) {
  await toList(page)
  const badge = await page.evaluate(() => [...document.querySelectorAll('#inMedBtn .medcount')].map(e => (e.classList.contains('pend') ? 'amber ' : 'red ') + e.innerText.trim()))
  await L.inputsView(page, 'med')
  const secs = await page.evaluate(() => [...document.querySelectorAll('#medView .medsec')].map(s => ({
    h: (s.querySelector('.medsec-h') || {}).innerText?.replace(/\s+/g, ' ').trim(),
    cards: [...s.querySelectorAll('.medcard')].map(c => c.innerText.replace(/\s+/g, ' ').trim() + '#' + c.dataset.medcard) })))
  return { badge, secs }
}

/** Back to the Inputs LIST: leave the calendar through its ✕ and the Medical view through ITS ✕ (#medClose) — both
    are full-screen over the form (ab-lib's inputsView knows only the calendar's). */
export async function toList(page) {
  await L.inputsView(page, 'list')
  for (const x of ['#medClose', '#icClose']) if (await page.locator(`${x}:visible`).count()) { await page.locator(x).click(); await page.waitForTimeout(400) }
}
