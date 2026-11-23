// sah-w9-lib — walker w9's helpers for the FULL check of claude/allavail-sans-postout-141 (D2340, D2341, D2342, D2346):
// the hiding of SANS availability, cause by cause, with Astra's reader sweep (S6–S10). 23 Nov 26, chat 152.
// Built on asp-w2-lib (clock, sign-in, board, ALL AVAIL window, Post out, Admin → Users), sud-w5-lib (SANS day, crew
// reads, board drawer), sud-w6-lib (week switch, posted-out sheet) and sfd-w1-lib (crew panel, Quals tick).
// window.* is only READ here (window.go is the recipes' own page switch). Import './sah-w9-env.mjs' first.
import { writeFileSync, appendFileSync } from 'node:fs'
import path from 'node:path'
const L = await import('./asp-w2-lib.mjs')
const S = await import('./sfd-w1-lib.mjs')
const W5 = await import('./sud-w5-lib.mjs')
const W6 = await import('./sud-w6-lib.mjs')
export { L, S, W5, W6 }
export const { sleep, J } = L
export const R = 'bane'           // Ranger (member us/us, FCP pilot)
export const OUT = L.OUT
const clean = s => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
export const MONDAY = iso => { const d = new Date(iso + 'T12:00:00'); const k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return d.toISOString().slice(0, 10) }
export const DI = iso => { const d = new Date(iso + 'T12:00:00'); return (d.getDay() + 6) % 7 }
const DOW = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const LOG = path.join(OUT, 'raw.log')
export const raw = (...a) => { try { appendFileSync(LOG, a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ') + '\n') } catch {} }

/* one scenario at one size in a fresh context, signed in as Saber */
export async function run(name, szKey, fn, when = '2026-07-15T09:00:00') {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, ctx, p } = await L.world(sz, W, when)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today (read)", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests through the scenario', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
}

/* sign in as another person on the same browser storage (windows closed first) */
export async function as(p, W, user, pass) {
  await W5.closeSansWin(p, W); await W5.bellClose(p); await L.closeBoard(p, W)
  await L.signOut(p, W)
  await L.signIn(p, user, pass)
  return clean(await p.locator('#roleBadge').first().innerText().catch(() => ''))
}
export const moveClock = (p, W, when, user = 'ad', pass = 'a') => W5.moveClock(p, W, when, user, pass)

/* ---- the filing: Saber, Inputs → SANS → start day → + Commitment → Ranger, kinds, span, remark, end day, Add ---- */
export async function file(p, W, start, end, kinds, span, rmk, step, who = R) {
  await W5.sansDay(p, W, start)
  const add = p.locator('[data-testid="win-sansday"] [data-testid="sd-add"]').first()
  if (await add.isDisabled().catch(() => true)) return { ok: false, why: '+ Commitment greyed: ' + clean(await p.locator('[data-testid="sd-addwhy"]').first().innerText().catch(() => '')), pic: await W.pic(p, step + '-add-off') }
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await W.press(p, add, 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(300)
  if (who && await p.locator('#inpEditPerson').count()) { await p.selectOption('#inpEditPerson', who); await sleep(200) }
  for (const k of ['fly', 'oft', 'amt']) {
    const label = { fly: 'Fly', oft: 'OFT', amt: 'AMT' }[k]
    const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
    if ((await cb.isChecked()) !== kinds.includes(k)) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(150) }
  }
  if (Array.isArray(span)) {
    await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
    await p.fill('#inpEditStart', span[0]); await p.fill('#inpEditEnd', span[1])
  } else {
    const on = await p.locator('#inpEditSpan [data-span="all"]').getAttribute('aria-pressed').catch(() => 'true')
    if (on !== 'true') await W.press(p, '#inpEditSpan [data-span="all"]', 'span-all')
  }
  if (rmk) { await p.locator('#inpEditRmk').fill(rmk); await sleep(100) }
  if (end && end !== start) {
    const d = p.locator(`[data-testid="inpEdCal-day-${end}"]`).first()
    await W.press(p, d, 'cal-end')
  }
  const read = clean(await p.locator('#inpEditPop .rc-read').first().innerText().catch(() => ''))
  const pic0 = await W.pic(p, step + '-form')
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click(); await sleep(500) }
  const err = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop [role="alert"], #inpEditPop .inped-err, #inpEditPop .inped-bad, #inpEditPop .note.warn')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).join(' | '))
  const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const iid = after.filter(x => !before.includes(x))[0] || null
  const rec = iid ? await recOf(p, iid) : null
  const pic = await W.pic(p, step + '-saved')
  if (await p.locator('#inpEditPop:visible').count()) { const c = p.locator('#inpEditCancel:visible').first(); if (await c.count()) await W.press(p, c, 'cancel') }
  /* the day's window stays open after the save; on a phone it covers the month: closed by its ✕, as a person does */
  await W5.closeSansWin(p, W)
  return { ok: !!iid, iid, rec, read, err, pic: pic0 + ', ' + pic }
}
/* the saved record (read only): who, dates, offer, hours, remark, filer */
export const recOf = (p, iid) => p.evaluate(i => { const r = (window.INPUTS || []).find(x => x.iid === i); if (!r) return null; return { who: r.person || (r.people || []).map(x => x.p || x).join(','), type: r.type, date: r.date, end: r.endDate || null, sans: r.sans, allday: !!r.allday, s: r.s ?? null, e: r.e ?? null, rmk: r.remarks || '', by: r.by || r.placedBy || r.filer || null, at: r.at || r.placedAt || null } }, iid)
export const sansInputsOf = (p, id = R) => p.evaluate(id => (window.INPUTS || []).filter(r => /sans/i.test(r.type) && JSON.stringify(r.people || r.person || '').includes(id)).map(r => r.iid), id)

/* ---- reader 1: the SANS month — F / O / A rows and the still-needed pair of each date ---- */
export async function monthRead(p, W, isos, step) {
  await W5.sansTab(p, W, isos[0])
  const r = await p.evaluate(isos => Object.fromEntries(isos.map(iso => {
    /* each drawn part's own words, apart ("F 1 0", never "F10") */
    const t = s => { const e = document.querySelector(`[data-testid="${s}"]`); if (!e) return null; const leaves = [...e.querySelectorAll('*')].filter(x => !x.children.length); return (leaves.length ? leaves.map(x => (x.textContent || '').trim()).filter(Boolean).join(' ') : (e.textContent || '')).replace(/\s+/g, ' ').trim() }
    const c = document.querySelector(`[data-testid="sc-day-${iso}"]`)
    return [iso, { f: t('sc-f-' + iso), o: t('sc-o-' + iso), a: t('sc-a-' + iso), need: t('sc-need-' + iso), cls: c ? c.className : 'none' }]
  })), isos)
  const pic = await W.pic(p, step + '-month')
  return { r, pic }
}
/* the F/O/A row's two figures (pilots, WSOs) from "F 2 0" */
export const fig = s => { const m = String(s || '').match(/(\d+)\s+(\d+)/); return m ? [+m[1], +m[2]] : null }

/* ---- reader 2: a SANS day opened — Ranger's row (by the input's id) and the figures ---- */
export async function dayRead(p, W, iso, iids, step) {
  await W5.sansDay(p, W, iso)
  const r = await p.evaluate(([iids, id]) => {
    const win = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0)
    if (!win) return { win: false }
    const t = e => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''
    const rows = [...win.querySelectorAll('[data-popiid]')]
    const mine = rows.filter(e => iids.includes(e.dataset.popiid))
    const named = rows.filter(e => (e.querySelector('[data-person]') || {}).dataset?.person === id || (e.querySelector('.sd-open')?.getAttribute('aria-label') || '').startsWith('Ranger,'))
    const grp = e => { const s = e.closest('.sd-group'); return s ? t(s.querySelector('.sd-gh')) : '(no group)' }
    return {
      win: true, title: t(win.querySelector('.fw-title, h2, .win-ttl')).slice(0, 40),
      mine: mine.map(e => ({ grp: grp(e), letters: t(e.querySelector('[data-testid="sd-letters"]')), hours: t(e.querySelector('[data-testid="sd-hours"]')), why: t(e.querySelector('[data-testid="sd-why"]')), rmk: t(e.querySelector('.sd-rmk')), placed: t(e.querySelector('[data-testid="sd-placed"]')) })),
      rangerRows: named.length,
      groups: [...win.querySelectorAll('.sd-gh')].map(t),
      fP: t(win.querySelector('[data-testid="sd-sans-P"]')) || t(win.querySelectorAll('[data-testid^="sd-sans-"]')[0]),
      needP: t(win.querySelectorAll('[data-testid^="sd-need-"]')[0]), availP: t(win.querySelectorAll('[data-testid^="sd-avail-"]')[0]),
      empty: !!win.querySelector('[data-testid="sd-empty"]'),
    }
  }, [iids, R])
  const pic = await W.pic(p, step + '-day-' + iso.slice(8))
  await W5.closeSansWin(p, W)
  return { r, pic }
}

/* ---- reader 3: the Inputs page's List — no SANS row for him by design; his ordinary inputs counted ---- */
export async function inputsRead(p, W, iids, step) {
  await L.go(p, 'inputs')
  const inp = p.locator('#inMemberMode:visible').first()
  if (await inp.count()) await W.press(p, inp, 'inputs-tab')
  const lb = p.locator('#inListBtn:visible').first()
  if (await lb.count()) await W.press(p, lb, 'list')
  await sleep(500)
  const r = await p.evaluate(iids => {
    const rows = [...document.querySelectorAll('#inBody [data-iid], #inList [data-iid]')].filter(e => e.getBoundingClientRect().width > 0)
    return { rows: rows.length, sansRows: rows.filter(e => iids.includes(e.dataset.iid)).length, rangerRows: rows.filter(e => /Ranger/.test(e.textContent || '')).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70)) }
  }, iids)
  const pic = await W.pic(p, step + '-inputs-list')
  return { r, pic }
}

/* ---- reader 4 & 5: Ranger's crew-list puck — where it stands, the SANS badge and remark beside it, the printed reason ---- */
export const crewRead = (p, root) => p.evaluate(([root, id]) => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.left < window.innerWidth - 4 && r.right > 4 }
  const Rt = document.querySelector(root)
  if (!Rt) return { root: 'none' }
  const all = [...Rt.querySelectorAll(`.rpuck[data-person="${id}"]`)].filter(e => !e.closest('.availwin'))
  const sansHead = (Rt.querySelector('.rsans .rh2') || {}).textContent || ''
  return {
    n: all.length, sansHead: sansHead.trim(), day: ((Rt.querySelector('.er-dayname') || {}).textContent || '').trim(),
    pucks: all.map(e => {
      const rw = e.querySelector('.rwhy'), row = e.closest('.rsans-row')
      return {
        shown: vis(e), where: e.closest('.rsans') ? 'SANS Avail' : e.closest('.rcol') ? ((e.closest('.rcol').querySelector('.rh') || {}).innerText || 'col').replace(/\s+/g, ' ').trim() : '?',
        badge: row ? ((row.querySelector('.rsans-b') || {}).textContent || '') : '', rmk: row ? ((row.querySelector('.rsans-r') || {}).textContent || '') : '',
        title: e.getAttribute('title') || '', why: e.getAttribute('data-why') || '', printed: rw && vis(rw) ? (rw.textContent || '').trim() : '',
        struck: /(^|\s)no(\s|$)/.test(e.className),
      }
    }),
  }
}, [root, R])
export const crewWords = c => c && c.pucks ? c.pucks.map(x => `[${x.where}${x.shown ? '' : ' (hidden)'}${x.struck ? ', struck' : ''}]${x.badge ? ' badge "' + x.badge + '"' : ''}${x.rmk ? ' rmk "' + x.rmk + '"' : ''}${x.printed ? ' printed "' + x.printed + '"' : ''}${x.title && !x.printed ? ' title "' + x.title.slice(0, 80) + '"' : ''}`).join(' ') + (c.sansHead ? ` · head "${c.sansHead}"` : '') : J(c)
export const firstShown = c => (c && c.pucks || []).find(x => x.shown) || (c && c.pucks || [])[0] || null

async function clipAround(p, W, loc, step, pad = 50) {
  const l = typeof loc === 'string' ? p.locator(loc).first() : loc
  if (!(await l.count())) return ''
  await l.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })).catch(() => {})
  await sleep(250)
  const bb = await l.boundingBox().catch(() => null)
  if (!bb) return ''
  const vp = p.viewportSize()
  const x = Math.max(0, bb.x - pad * 3), y = Math.max(0, bb.y - pad)
  const w = Math.min(vp.width - x, bb.width + pad * 7), h = Math.min(vp.height - y, bb.height + pad * 2)
  if (w < 4 || h < 4) return ''
  const f = path.join(OUT, `${W.scn}-${step}-clip-${W.sz.name}.png`)
  await p.screenshot({ path: f, clip: { x, y, width: w, height: h } })
  return path.basename(f)
}
/* Edit Schedule's crew panel stepped to the day (week loaded first) */
export async function weekCrew(p, W, iso, step) {
  await L.closeBoard(p, W)
  await W6.gotoWeek(p, W, MONDAY(iso))
  const day = await S.crewPanelTo(p, W, DOW[DI(iso)])
  const c = await crewRead(p, '.ros-body')
  const pc = await clipAround(p, W, p.locator(`.ros-body .rpuck[data-person="${R}"]`).first(), step + '-week')
  await S.crewPanelClose(p, W)
  return { day, c, pic: pc }
}
/* the Scheduler Board's crew list of the day */
export async function boardCrew(p, W, iso, step) {
  await L.closeBoard(p, W)
  await W6.gotoWeek(p, W, MONDAY(iso))
  await L.openBoard(p, W, DI(iso))
  await W5.boardDrawer(p, W, true)
  const c = await crewRead(p, '#schedBoard')
  const pc = await clipAround(p, W, p.locator(`#schedBoard .rpuck[data-person="${R}"]:visible`).first(), step + '-board')
  await W5.boardDrawer(p, W, false)
  return { c, pic: pc }
}
/* reader 6: a seat armed on the board, Ranger's crew puck read */
export async function armed(p, W, iso, sel, step) {
  await L.closeBoard(p, W)
  await W6.gotoWeek(p, W, MONDAY(iso))
  await L.openBoard(p, W, DI(iso))
  const zone = p.locator(L.B(sel)).first()
  if (!(await zone.count())) return { armed: null, c: null, pic: await W.pic(p, step + '-nozone') }
  await zone.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250)
  const addz = zone.locator('.addz').first()
  const ab = (await addz.count()) ? await addz.boundingBox() : null
  const zb = await zone.boundingBox()
  const pos = ab && zb ? { x: ab.x - zb.x + ab.width / 2, y: ab.y - zb.y + ab.height / 2 } : undefined
  if (W.isPhone) { await zone.tap({ position: pos }); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${step}-arm-now-phone.png`) }).catch(() => {}) }
  else await zone.click({ position: pos })
  await sleep(500)
  const a = await p.evaluate(() => window.ARM && window.ARM.key)
  await W5.boardDrawer(p, W, true)
  const c = await crewRead(p, '#schedBoard')
  const pc = await clipAround(p, W, p.locator(`#schedBoard .rpuck[data-person="${R}"]:visible`).first(), step + '-armed')
  await W5.disarm(p, W)
  return { armed: a, c, pic: pc }
}
/* reader 7: the ALL AVAIL window of a row (by its id), Ranger's place in it */
export async function allAvail(p, W, iso, rid, step) {
  await L.closeBoard(p, W)
  await W6.gotoWeek(p, W, MONDAY(iso))
  await L.openBoard(p, W, DI(iso))
  const r = await L.readCount(p, W, rid, '#schedBoard', R)
  const pic = await W.pic(p, step + '-allavail')
  await L.closeWin(p, W)
  return { r, pic }
}
/* reader 9: the warning list — every warning naming Ranger (window.WARN READ only) */
export const warnRead = p => p.evaluate(() => {
  const all = (window.WARN && window.WARN.all) || []
  return { n: all.length, ranger: all.filter(w => /Ranger|bane/.test(JSON.stringify(w))).map(w => (w.msg || w.text || w.m || JSON.stringify(w)).toString().replace(/\s+/g, ' ').slice(0, 140)) }
})
/* reader 10: Ranger's bell (signed in as him), every line read whole */
export async function bellRead(p, W, step) {
  const who = await as(p, W, 'us', 'us')
  if (!/Ranger/i.test(who)) { const pic = await W.pic(p, step + '-ranger-signin'); await as(p, W, 'ad', 'a'); return { who, lines: [], pic } }
  const sel = (await p.locator('#notifyBell:visible').count()) ? '#notifyBell:visible' : '.bellbtn:visible'
  const lit = await p.evaluate(() => { const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? b.classList.contains('on') : 'no bell' })
  await W.press(p, sel, 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  await sleep(400)
  const lines = await p.evaluate(() => [...document.querySelectorAll('[data-testid="bell-list"] .bl-line')].map(e => ({
    unread: e.classList.contains('unread'),
    name: ((e.querySelector('.bl-name') || {}).textContent || '').trim(), day: ((e.querySelector('.bl-day') || {}).textContent || '').trim(),
    struck: [...e.querySelectorAll('.bl-struck')].map(s => (s.textContent || '').trim()).join(' / '),
    what: [...e.querySelectorAll('.bl-what')].map(s => (s.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()).join(' ‖ '),
  })))
  const pic = await W.pic(p, step + '-bell')
  await W5.bellClose(p)
  await as(p, W, 'ad', 'a')
  return { who, lit, lines, sans: lines.filter(l => /SANS/.test(l.name + ' ' + l.what)), pic }
}
export const bellWords = b => b.sans && b.sans.length ? b.sans.map(l => `${l.unread ? '[unread] ' : '[read] '}"${l.name}"${l.day ? ' · "' + l.day + '"' : ''}${l.struck ? ' · struck "' + l.struck + '"' : ''} · "${l.what}"`).join(' + ') : `no SANS line (${(b.lines || []).length} lines)`

/* the posted-out sheet of Ranger, opened from his cell on `cellIso` (the cell itself, or the bid window's ⋯ → Post out) */
export async function sheet(p, W, cellIso, step) {
  const c = (await L.lwCell(p, W, R, cellIso)).cell
  if (!c) return { kind: 'NO CELL' }
  await W.press(p, c, 'cell-' + cellIso); await sleep(400)
  let kind = 'none'
  if (await p.locator('[data-testid="postout-sheet"]:visible').count()) kind = 'posted-out sheet (the cell)'
  else if (await p.locator('[data-testid="bid-more"]:visible').count()) {
    await W.press(p, '[data-testid="bid-more"]:visible', 'more'); await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
    kind = (await p.locator('[data-testid="postout-sheet"]:visible').count()) ? 'bid window → ⋯ → Post out → posted-out sheet' : 'bid window → ⋯ → Post out (a new posting)'
  }
  return { kind, ...(await sheetState(p)), pic: await W.pic(p, step + '-sheet') }
}
export const sheetState = p => p.evaluate(() => {
  const t = s => { const e = [...document.querySelectorAll(`[data-testid="${s}"]`)].find(x => x.getBoundingClientRect().width > 0); return e ? (e.innerText || e.value || '').replace(/\s+/g, ' ').trim() : '' }
  const chips = [...document.querySelectorAll('[data-testid^="postout-"].pchip, [data-testid^="po-"].pchip')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid + (e.getAttribute('aria-pressed') === 'true' ? '[on]' : ''))
  return { line: t('postout-line') || t('po-line'), date: t('postout-date'), err: t('postout-err') || t('post-err'), blocked: t('postout-blocked'), locked: t('postout-locked'), chips: chips.join(' ') }
})
export async function sheetClose(p, W) {
  for (const s of ['[data-testid="postout-cancel"]:visible', '[data-testid="bid-cancel"]:visible']) if (await p.locator(s).count()) { await W.press(p, s, 'sheet-x'); break }
  await sleep(400)
}
/* the date box of the open posted-out sheet moved to `iso` (the app's own date calendar) */
export async function sheetDate(p, W, iso, step) {
  await W.press(p, '[data-testid="postout-date"]:visible', 'po-date')
  const day = p.locator(`[data-iso="${iso}"]:visible`).first()
  if (!(await day.count())) return { ok: false, why: 'no such day in the calendar', pic: await W.pic(p, step + '-noday') }
  await W.press(p, day, 'po-day'); await sleep(700)
  return { ok: true, ...(await sheetState(p)), pic: await W.pic(p, step + '-moved') }
}
export const rangerRec = p => p.evaluate(id => { const q = window.PEOPLE[id]; return q ? { san: !!q.san || !!(q.quals && q.quals.san), sanFrom: q.sanFrom || null, archived: !!q.archived } : 'none' }, R)

/* ---- the board fixtures ---- */
export async function wave(p, W, iso, cs, to, ld) {
  await L.closeBoard(p, W); await W6.gotoWeek(p, W, MONDAY(iso))
  return W5.addWave(p, W, DI(iso), cs, to, ld)
}
export async function sim(p, W, iso, kind, label, a, b) {
  await L.closeBoard(p, W); await W6.gotoWeek(p, W, MONDAY(iso))
  return W5.addSim(p, W, DI(iso), kind, label, a, b)
}
export async function aaRow(p, W, iso, name, a, b) {
  await L.closeBoard(p, W); await W6.gotoWeek(p, W, MONDAY(iso))
  await L.openBoard(p, W, DI(iso))
  return L.progRow(p, W, DI(iso), name, a, b)
}

/* ===== THE READER SWEEP (Astra's table, S6–S10) =====
   cfg: { days: [iso], iids: [filing ids], expect: { iso: { shown: bool, letters: 'F/O/A' } }, base (the active sweep's
   month figures), aa: [{ iso, rid }], seats: [{ iso, sel, nm, judge(printed, shown) }], bell: fn(b) → [ok, want] | null,
   skipBell: reason } */
export async function sweep(p, W, tag, cfg) {
  const out = { month: null, days: {}, inputs: null, week: {}, board: {}, seats: [], aa: [], warn: null, bell: null }
  const st = tag
  /* 1 the SANS month */
  const m = await monthRead(p, W, cfg.days, st)
  out.month = m.r
  for (const iso of cfg.days) {
    const e = cfg.expect[iso], x = m.r[iso], letters = (e.letters || '').split('/').filter(Boolean)
    if (cfg.base) {
      const b = cfg.base[iso]
      const want = { f: fig(b.f), o: fig(b.o), a: fig(b.a) }
      if (!e.shown) for (const k of ['f', 'o', 'a']) if (letters.includes(k.toUpperCase()) && want[k]) want[k] = [want[k][0] - 1, want[k][1]]
      const got = { f: fig(x.f), o: fig(x.o), a: fig(x.a) }
      const ok = e.rec ? 'REC' : ['f', 'o', 'a'].every(k => J(got[k]) === J(want[k]))
      W.rec(`${st}-month-${iso.slice(8)}`, `SANS month, ${iso}: Ranger ${e.shown ? 'counted' : 'NOT counted'} (F/O/A pilots ${e.shown ? 'as active' : 'one fewer for each offered letter'})`, ok, `got F "${x.f}" O "${x.o}" A "${x.a}" need "${x.need}" {${x.cls}} · want F ${J(want.f)} O ${J(want.o)} A ${J(want.a)} · active was F "${b.f}" O "${b.o}" A "${b.a}" need "${b.need}"`, m.pic)
    } else W.rec(`${st}-month-${iso.slice(8)}`, `SANS month, ${iso} (the active figures, read)`, null, `F "${x.f}" O "${x.o}" A "${x.a}" need "${x.need}" {${x.cls}}`, m.pic)
  }
  /* 2 each SANS day opened */
  for (const iso of cfg.days) {
    const e = cfg.expect[iso]
    const d = await dayRead(p, W, iso, cfg.iids, st)
    out.days[iso] = d.r
    const has = d.r.mine && d.r.mine.length
    const agree = fig(m.r[iso].f) ? String(fig(m.r[iso].f)[0]) === d.r.fP : 'n/a'
    const ok = e.rec ? 'REC' : d.r.win && (e.shown ? has === 1 && (!e.letters || d.r.mine[0].letters.replace(/ · /g, '/') === e.letters) : !has && !d.r.rangerRows) && agree === true
    W.rec(`${st}-day-${iso.slice(8)}`, `SANS day ${iso} opened: Ranger's offer ${e.shown ? 'listed' + (e.letters ? ' (' + e.letters + ')' : '') : 'ABSENT from every group'}; its "SANS committed to fly" pilots agree with the month's F`, ok, `his rows ${J(d.r.mine)} (rows naming Ranger: ${d.r.rangerRows}) · groups ${J(d.r.groups)} · committed-to-fly P "${d.r.fP}" (month F ${m.r[iso].f}) · avail P "${d.r.availP}" · still needed P "${d.r.needP}"${d.r.empty ? ' · "No commitments yet."' : ''}`, d.pic)
  }
  /* 3 the Inputs list */
  const ir = await inputsRead(p, W, cfg.iids, st)
  out.inputs = ir.r
  W.rec(`${st}-inputs`, 'Inputs → List: no row for his SANS filing (by design); his ordinary inputs still listed', ir.r.sansRows === 0 && ir.r.rows > 0, `rows ${ir.r.rows} · SANS-filing rows ${ir.r.sansRows} · rows naming Ranger: ${J(ir.r.rangerRows)}`, ir.pic)
  /* 4 & 5 the crew lists */
  for (const iso of cfg.days) {
    const e = cfg.expect[iso]
    for (const [k, fn] of [['week', weekCrew], ['board', boardCrew]]) {
      const c = await fn(p, W, iso, `${st}-${iso.slice(8)}`)
      out[k][iso] = c.c
      const x = firstShown(c.c)
      const inSans = !!x && x.where === 'SANS Avail'
      const ok = e.rec ? 'REC' : (!x && !e.shown && e.absentOk) ? true : !!x && (e.shown ? inSans && (!e.letters || x.badge.startsWith(e.letters)) : (e.sansNoFiling ? inSans && !x.badge : !inSans && !x.badge))
      const want = e.shown ? `under SANS Avail with badge "${e.letters || '…'}"` : e.sansNoFiling ? 'under SANS Avail with NO badge (SANS that day, the filing hidden)' : 'NOT under SANS Avail, no badge (an ordinary pilot that day)'
      W.rec(`${st}-${k}-${iso.slice(8)}`, `${k === 'week' ? 'Edit Schedule crew panel' : 'Scheduler Board crew list'}, ${iso}: Ranger ${want}`, ok, `${c.day ? 'panel day "' + c.day + '" · ' : ''}${crewWords(c.c)}`, c.pic)
    }
  }
  /* 6 armed seats */
  for (const s of (cfg.seats || [])) {
    const a = await armed(p, W, s.iso, s.sel, `${st}-${s.id}`)
    const x = firstShown(a.c) || {}
    const [ok, want] = a.armed ? s.judge(x.printed || '', cfg.expect[s.iso].shown, x) : ['NW', '']
    W.rec(`${st}-${s.id}`, `${s.iso} ${s.nm} armed (${a.armed}): ${want}`, ok, `printed "${x.printed || ''}" · data-why "${x.why || ''}" · ${crewWords(a.c)}`, a.pic)
    out.seats.push({ id: s.id, armed: a.armed, x })
  }
  /* 7 the ALL AVAIL window */
  for (const a of (cfg.aa || [])) {
    const r = await allAvail(p, W, a.iso, a.rid, `${st}-${a.iso.slice(8)}`)
    out.aa.push(r.r)
    W.rec(`${st}-aa-${a.iso.slice(8)}`, `${a.iso} ALL AVAIL window (${a.nm}): Ranger's membership (RECORD — Astra: follows his dated status, not the hidden offer)`, 'REC', `chip "${r.r.chip}" · ${r.r.win && typeof r.r.win === 'object' ? `${r.r.win.n} people, Ranger ${r.r.win.has ? 'IN' : 'out'}${r.r.win.san ? ' (purple line)' : ''}${r.r.win.why ? ' "' + r.r.win.why + '"' : ''}${r.r.win.flag ? ' ' + r.r.win.flag : ''}` : J(r.r.win)}`, r.pic)
  }
  await L.closeBoard(p, W)
  /* 9 the warning list */
  out.warn = await warnRead(p)
  W.rec(`${st}-warn`, 'warning list (read): warnings naming Ranger — none may rest only on a hidden offer', !out.warn.ranger.some(w => /SANS/.test(w)) ? (out.warn.ranger.length ? 'REC' : true) : 'REC', `${out.warn.n} warnings in all · naming Ranger: ${J(out.warn.ranger)}`)
  /* 10 his bell */
  if (cfg.skipBell) W.rec(`${st}-bell`, "Ranger's bell", 'NW', cfg.skipBell)
  else if (cfg.bell) {
    const b = await bellRead(p, W, st)
    out.bell = b
    const [ok, want] = cfg.bell(b)
    W.rec(`${st}-bell`, `Ranger's bell (signed in as him, us): ${want}`, ok, `signed in "${b.who}" · bell lit ${b.lit} · ${bellWords(b)}`, b.pic)
  }
  raw(W.scn, W.sz.name, st, out)
  return out
}
