// sah-w10-lib — walker w10's helpers (hiding across publication, shared filings, edits, the take-back line), 23 Nov 26,
// chat 152. Built on asp-w2-lib (world, sign-in, board, Post out, publish, ALL AVAIL window, Quals, archive) and sud-w5-lib
// (crew lists, armed seats, + Commitment) and sud-w6-lib's bell reader. window.* is only READ here (and window.go, the
// recipes' own page switch). Import './sah-w10-env.mjs' first.
import './sah-w10-env.mjs'
import path from 'node:path'
import { writeFileSync, mkdirSync } from 'node:fs'
const L = await import('./asp-w2-lib.mjs')
const W5 = await import('./sud-w5-lib.mjs')
const S = W5.S
export { L, W5, S }
const { sleep, J } = L
export const RANGER = 'bane', HEX = 'rocky'
export const OUT = L.OUT
export const clean = s => String(s || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
export const tid = (p, id) => p.locator(`[data-testid="${id}"]`)
export const ISO = { 13: '2026-07-13', 16: '2026-07-16', 17: '2026-07-17', 18: '2026-07-18', 19: '2026-07-19', 20: '2026-07-20', 21: '2026-07-21', 22: '2026-07-22' }

/* run one scenario at one size in a fresh context (a fresh store); Saber signed in; the clock installed before load */
export async function run(name, szKey, fn, when = '2026-07-15T09:00:00') {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, ctx, p } = await L.world(sz, W, when)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today (page clock), Saber signed in", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
  /* each scenario's results saved as it ends (a run stopped part-way keeps what it finished) */
  writeFileSync(path.join(OUT, `results-${name}-${sz.name}.json`), JSON.stringify(L.results.filter(r => r.scn === name && r.size === sz.name), null, 1))
}
/* Edit Schedule: a day card's own state read off the screen — its "N pending" chip, "Not yet signed", its SIGNED line —
   and the AMENDMENTS panel's words (run 1's shared reader returned 0 pending while the card showed "2 pending") */
export async function dayState(p, W, dayName, tag) {
  await closeAll(p, W); await L.go(p, 'editsched')
  const r = await p.evaluate(dn => {
    const vis = e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 }
    const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
    const head = [...document.querySelectorAll('#eWeek *')].find(e => e.children.length === 0 && t(e) === dn)
    let card = head
    while (card && card.parentElement && !/SIGN-OFF/i.test(card.textContent || '')) card = card.parentElement
    const amend = [...document.querySelectorAll('*')].filter(e => vis(e) && /^AMENDMENTS/i.test(t(e)) && t(e).length < 400).sort((a, b) => t(a).length - t(b).length)[0]
    if (!card) return { card: 'no card', amend: amend ? t(amend) : '' }
    const pend = [...card.querySelectorAll('*')].filter(e => e.children.length === 0 && /^\d+ pending$/.test(t(e)))[0]
    const ct = t(card)
    const k = ct.indexOf('SIGNED')
    return { pending: pend ? t(pend) : 'none', notSigned: /Not yet signed/.test(ct), signedLine: k >= 0 ? ct.slice(k, k + 80) : '', y: card.getBoundingClientRect().top + window.scrollY, x: card.getBoundingClientRect().left, amend: amend ? t(amend) : '' }
  }, dayName)
  if (r.y != null) await p.evaluate(y => window.scrollTo(0, Math.max(0, y - 140)), r.y)
  await sleep(300)
  return { ...r, pic: tag ? await W.pic(p, tag) : '' }
}
export function save(name) {
  writeFileSync(path.join(OUT, `results-${name}.json`), JSON.stringify(L.results, null, 1))
}

/* ---- people and the clock ---- */
export async function as(p, W, user, pass) {
  await closeAll(p, W)
  if (await p.locator('#luser:visible').count()) { await L.signIn(p, user, pass) }
  else { await L.signOut(p, W); await L.signIn(p, user, pass) }
  return clean(await p.locator('#roleBadge').first().textContent().catch(() => ''))
}
export async function closeAll(p, W) {
  if (await p.locator('[data-testid="bell-list"]').count()) { await p.keyboard.press('Escape'); await sleep(300) }
  const x = p.locator('[data-testid="win-sansday-x"]:visible').first(); if (await x.count()) { await W.press(p, x, 'sansday-x'); await sleep(300) }
  const ix = p.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await ix.count()) { await W.press(p, ix, 'inpedit-x'); await sleep(300) }
  const go = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await go.count()) { await W.press(p, go, 'discard'); await sleep(300) }
  for (const s of ['[data-testid="postout-cancel"]:visible', '[data-testid="bid-cancel"]:visible']) if (await p.locator(s).count()) { await W.press(p, s, 'sheet-x'); await sleep(300) }
  await L.closeBoard(p, W)
}
export async function reload(p, user, pass) {
  await p.reload(); await sleep(1500)
  if (await p.locator('#luser:visible').count()) await L.signIn(p, user, pass)
  await p.waitForSelector('#vWeek .day, #eWeek .day', { state: 'attached', timeout: 15000 }).catch(() => {})
}
export async function moveClock(p, W, when, user = 'ad', pass = 'a') {
  await p.clock.setSystemTime(new Date(when))
  await reload(p, user, pass)
  return L.today(p)
}
export const rec = (p, id) => p.evaluate(id => { const q = window.PEOPLE[id]; return q ? { san: !!q.san, sanFrom: q.sanFrom || null, archived: !!q.archived } : 'no record' }, id)
/* what a man holds on each day of the loaded week (read only) */
export const holds = (p, id) => p.evaluate(id => (window.DAYS || []).map(d => {
  const out = []
  const walk = (o, path) => { if (o == null) return; if (typeof o === 'string') { if (o === id) out.push(path); return } if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return } if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k) }
  walk(d, '')
  return d.dt + ': ' + (out.join(' ') || 'nothing')
}).join(' | '), id)

/* ---- the Leave War posting (the posted-out sheet, from his cell on the posting date) ---- */
export async function sheet(p, W, id, cellIso, tag) {
  const c = (await L.lwCell(p, W, id, cellIso)).cell
  if (!c) return { kind: 'NO CELL' }
  await W.press(p, c, 'cell-' + cellIso); await sleep(400)
  let kind = 'none'
  if (await p.locator('[data-testid="postout-sheet"]:visible').count()) kind = 'posted-out sheet'
  else if (await p.locator('[data-testid="bid-more"]:visible').count()) {
    await W.press(p, '[data-testid="bid-more"]:visible', 'more'); await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
    kind = (await p.locator('[data-testid="postout-sheet"]:visible').count()) ? 'bid window → ⋯ → Post out → posted-out sheet' : 'bid window → ⋯ → Post out (a new posting sheet)'
  }
  const line = clean(await p.locator('[data-testid="postout-line"]:visible, [data-testid="po-line"]:visible').first().textContent().catch(() => ''))
  const pic = tag ? await W.pic(p, tag + '-sheet') : ''
  return { kind, line, pic }
}
export async function sheetClose(p, W) {
  for (const s of ['[data-testid="postout-cancel"]:visible', '[data-testid="bid-cancel"]:visible']) if (await p.locator(s).count()) { await W.press(p, s, 'sheet-x'); break }
  await sleep(400)
}
/* the posting's date moved (picked in the sheet's own date box — committed at once), the sheet closed by its ✕ */
export async function movePo(p, W, id, cellIso, toIso, tag) {
  const s = await sheet(p, W, id, cellIso, tag)
  if (s.kind !== 'posted-out sheet') return { ok: false, ...s }
  await W.press(p, '[data-testid="postout-date"]:visible', 'po-date')
  const d = p.locator(`[data-iso="${toIso}"]:visible`).first()
  if (await d.count()) await W.press(p, d, 'po-day-' + toIso)
  await sleep(700)
  const line = clean(await p.locator('[data-testid="postout-line"]:visible').first().textContent().catch(() => ''))
  const err = clean(await p.locator('[data-testid="postout-err"]:visible').first().textContent().catch(() => ''))
  const pic = await W.pic(p, tag + '-moved')
  await sheetClose(p, W)
  return { ok: true, kind: s.kind, before: s.line, line, err, rec: await rec(p, id), pic: s.pic + ', ' + pic }
}
export async function undoPo(p, W, id, cellIso, tag) {
  const s = await sheet(p, W, id, cellIso, tag)
  if (s.kind !== 'posted-out sheet') return { ok: false, ...s }
  await W.press(p, '[data-testid="postout-undo"]:visible', 'po-undo'); await sleep(800)
  const err = clean(await p.locator('[data-testid="postout-err"]:visible').first().textContent().catch(() => ''))
  const pic = await W.pic(p, tag + '-undone')
  await sheetClose(p, W)
  return { ok: true, kind: s.kind, before: s.line, err, rec: await rec(p, id), pic: s.pic + ', ' + pic }
}
/* the outcome chip SANS tapped (on → off: no outcome; off → on: SANS) */
export async function sansChip(p, W, id, cellIso, tag) {
  const s = await sheet(p, W, id, cellIso, tag)
  if (s.kind !== 'posted-out sheet') return { ok: false, ...s }
  await W.press(p, '[data-testid="postout-sans"]:visible', 'po-sans'); await sleep(800)
  const line = clean(await p.locator('[data-testid="postout-line"]:visible').first().textContent().catch(() => ''))
  const err = clean(await p.locator('[data-testid="postout-err"]:visible').first().textContent().catch(() => ''))
  const chips = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="postout-"]')].filter(e => e.getBoundingClientRect().width > 0 && e.tagName === 'BUTTON').map(e => e.dataset.testid.replace('postout-', '') + (e.getAttribute('aria-pressed') === 'true' || e.classList.contains('on') ? '[on]' : '')).join(' '))
  const pic = await W.pic(p, tag + '-chip')
  await sheetClose(p, W)
  return { ok: true, before: s.line, line, err, chips, rec: await rec(p, id), pic: s.pic + ', ' + pic }
}

/* ---- the SANS calendar: the month's cell and the opened day, read ---- */
export async function sansTab(p, W, iso) { return W5.sansTab(p, W, iso) }
export const monthCell = (p, iso) => p.evaluate(iso => {
  const c = document.querySelector(`[data-testid="sc-day-${iso}"]`); if (!c) return 'no cell'
  const t = s => { const e = c.querySelector(`[data-testid="sc-${s}-${iso}"]`); return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : '' }
  return { need: t('need'), f: t('f'), o: t('o'), a: t('a'), cls: c.className.replace(/\s+/g, ' ') }
}, iso)
export const dayRows = p => p.evaluate(() => {
  const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0)
  if (!w) return null
  const P = window.PEOPLE, t = e => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''
  const rows = [...w.querySelectorAll('.sd-row')].map(r => {
    const pk = r.querySelector('[data-person]')
    const id = pk ? pk.getAttribute('data-person') : (r.dataset.testid || '').split('~')[1] || '?'
    return { who: (P[id] || {}).cs || id, iid: r.dataset.popiid, letters: t(r.querySelector('[data-testid="sd-letters"]')), hours: t(r.querySelector('[data-testid="sd-hours"]')), rmk: t(r.querySelector('.sd-rmk')), placed: t(r.querySelector('[data-testid="sd-placed"]')), why: t(r.querySelector('[data-testid="sd-why"]')) }
  })
  const add = w.querySelector('[data-testid="sd-add"]')
  return { rows, add: add ? (add.disabled ? 'greyed' : 'enabled') : 'none', addwhy: t(w.querySelector('[data-testid="sd-addwhy"]')), empty: t(w.querySelector('[data-testid="sd-empty"]')), text: t(w).slice(0, 300) }
})
export const rowsLine = d => d ? (d.rows.length ? d.rows.map(r => `${r.who}[${r.letters} ${r.hours}${r.rmk ? ' "' + r.rmk + '"' : ''}${r.placed ? ' ' + r.placed : ''}${r.why ? ' why:' + r.why : ''}]`).join(' ') : 'no lines' + (d.empty ? ` ("${d.empty}")` : '')) : 'no window'
/* the SANS month on `iso`, its cell read, the day opened and read, pictured; left open (closed at the next step) */
export async function sansRead(p, W, iso, tag) {
  await closeAll(p, W)
  const month = await W5.sansTab(p, W, iso)
  const cell = await monthCell(p, iso)
  const c = p.locator(`[data-testid="sc-day-${iso}"]`).first()
  await c.scrollIntoViewIfNeeded().catch(() => {})
  if (W.isPhone) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } })
  await p.waitForSelector('[data-testid="win-sansday"]', { timeout: 6000 }).catch(() => {})
  await sleep(500)
  const day = await dayRows(p)
  const pic = await W.pic(p, tag)
  return { month, cell, day, pic, has: who => !!(day && day.rows.some(r => r.who === who)), n: day ? day.rows.length : -1 }
}
export const cellLine = c => typeof c === 'object' ? `need ${c.need} · F ${c.f} · O ${c.o} · A ${c.a}${/is-before/.test(c.cls) ? ' · faded' : ''}` : c

/* "+ Commitment" from a SANS day: who (a person id, an array of ids for several, or null = the signed-in man himself);
   kinds ['fly','oft','amt']; span 'all' or ['09:00','12:00']; endIso to make a run of days (a tap on the window's own
   calendar); remarks. Returns the input made (the difference of ids), the refusal words if any. */
export async function file(p, W, iso, who, kinds, span, tag, o = {}) {
  await closeAll(p, W)
  await W5.sansDay(p, W, iso)
  const add = p.locator('[data-testid="win-sansday"] [data-testid="sd-add"]').first()
  if (await add.isDisabled().catch(() => true)) return { made: null, refused: 'the + Commitment button is greyed: ' + clean(await tid(p, 'sd-addwhy').first().textContent().catch(() => '')), pic: await W.pic(p, tag + '-greyed') }
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await W.press(p, add, 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 6000 })
  if (Array.isArray(who)) {
    await W.press(p, '[data-testid="pp-several"]:visible', 'pp-several'); await sleep(300)
    for (let i = 0; i < 3; i++) {
      const on = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck.on')].map(e => e.dataset.pp))
      const flip = [...on.filter(x => !who.includes(x)), ...who.filter(x => !on.includes(x))]
      if (!flip.length) break
      for (const id of flip) {
        const b = p.locator(`#inpEditPop .pp-puck[data-pp="${id}"]`).first()
        if (!(await b.count())) return { made: null, refused: 'NOT OFFERED in the picker: ' + id, pic: await W.pic(p, tag + '-noperson') }
        await W.press(p, b, 'pp-' + id)
      }
    }
  } else if (who) {
    const opts = await p.locator('#inpEditPerson option').evaluateAll(os => os.map(o => o.value)).catch(() => [])
    if (!opts.includes(who)) return { made: null, refused: 'NOT OFFERED in the Person box: ' + who + ' (offered ' + opts.join(',') + ')', pic: await W.pic(p, tag + '-noperson') }
    await p.selectOption('#inpEditPerson', who); await sleep(200)
  }
  for (const k of ['fly', 'oft', 'amt']) {
    const label = { fly: 'Fly', oft: 'OFT', amt: 'AMT' }[k]
    const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
    if ((await cb.isChecked()) !== kinds.includes(k)) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(150) }
  }
  if (Array.isArray(span)) {
    await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
    await p.fill('#inpEditStart', span[0]); await p.fill('#inpEditEnd', span[1])
  }
  if (o.rmk) await p.fill('#inpEditRmk', o.rmk)
  if (o.endIso) {
    const d = p.locator(`[data-testid="inpEdCal-day-${o.endIso}"]`).first()
    if (await d.count()) { await d.scrollIntoViewIfNeeded().catch(() => {}); await W.press(p, d, 'cal-' + o.endIso) }
    await sleep(300)
  }
  const read = clean(await p.locator('#inpEditPop .rc-read').first().textContent().catch(() => ''))
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(400) }
  const after = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const iid = after.filter(x => !before.includes(x))[0] || null
  const toast = iid ? '' : await L.toastSaid(p)
  const refused = iid ? '' : (toast ? 'toast: "' + toast + '" · ' : '') + clean(await p.evaluate(() => { const w = document.querySelector('[data-testid="win-inputedit"]'); if (!w) return 'the window closed, nothing made'; return [...w.querySelectorAll('[role="alert"], .inped-err, .inped-bad, .note.warn')].map(e => e.textContent).join(' | ') || 'window still open, no words found' }))
  const made = iid ? await inp(p, iid) : null
  const pic = await W.pic(p, tag + '-saved')
  if (!iid) { const x = p.locator('[data-testid="win-inputedit-x"]:visible').first(); if (await x.count()) { await W.press(p, x, 'inpedit-x'); const g = p.locator('[data-testid="inped-escask-go"]:visible').first(); if (await g.count()) await W.press(p, g, 'discard') } }
  return { iid, made, refused, read, pic: pic0 + ', ' + pic }
}
export const inp = (p, iid) => p.evaluate(i => { const r = (window.INPUTS || []).find(x => x.iid === i); if (!r) return null; return { iid: r.iid, people: JSON.stringify(r.people || r.person || r.who).slice(0, 60), date: r.date, endDate: r.endDate || null, sans: r.sans, allday: r.allday, s: r.s || r.str || r.start, e: r.e || r.end, remarks: r.remarks || '', by: r.by } }, iid)
export const sansInputs = p => p.evaluate(() => (window.INPUTS || []).filter(r => /SANS/i.test(String(r.type)) && /bane|rocky/.test(JSON.stringify(r.people || r.person || ''))).map(r => ({ iid: r.iid, people: JSON.stringify(r.people || r.person).slice(0, 50), date: r.date, endDate: r.endDate || null })))

/* ---- the bell (sud-w6-lib's reader, every line's words) ---- */
export const bellLines = p => p.evaluate(() => {
  const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
  if (!list) return null
  const t = e => e ? (e.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim() : ''
  return [...list.querySelectorAll('.bl-line')].map(e => ({ id: (e.dataset.testid || '').replace('bell-line-', ''), unread: e.classList.contains('unread'), text: t(e.querySelector('.bl-main')), struck: [...e.querySelectorAll('.bl-struck')].map(t).join(' / '), more: t(e.querySelector('[data-testid="bell-more-words"]')) }))
})
export async function bell(p, W, tag) {
  await closeAll(p, W)
  const lit = await p.evaluate(() => { const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? b.classList.contains('on') : 'no bell' })
  await W.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 6000 }).catch(() => {})
  await sleep(350)
  const lines = (await bellLines(p)) || []
  const pic = tag ? await W.pic(p, tag) : ''
  const sans = lines.filter(l => /SANS/.test(l.text))
  return { lit, lines, sans, pic }
}
export const bellWords = b => `lit ${b.lit} · ${b.lines.length} lines · SANS: ${b.sans.map(l => `${l.unread ? '[unread]' : '[read]'} "${l.text}"${l.struck ? ' struck:"' + l.struck + '"' : ''}`).join(' || ') || 'none'}`
/* a line tapped (it is then read), the SANS page it opened read */
export async function bellTap(p, W, l, tag) {
  const loc = p.locator(`[data-testid="bell-line-${l.id}"]`).first()
  const bb = await loc.boundingBox()
  if (W.isPhone) { await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await sleep(60); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-${tag}-line-now-phone.png`) }) }
  else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
  await sleep(1100)
  const got = await p.evaluate(() => { const t = e => e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : ''; const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); return { page: window.CURPAGE, month: t(document.querySelector('[data-testid="sc-month"]')), win: w ? t(w).slice(0, 60) : 'none' } })
  return { ...got, pic: await W.pic(p, tag + '-tapped') }
}

/* ---- the crew lists ---- */
export async function boardCrewOf(p, W, di, id, tag) {
  await L.openBoard(p, W, di)
  await W5.boardDrawer(p, W, true)
  const c = await W5.crewOf(p, '#schedBoard', id)
  const pc = await W5.clip(p, W, p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).first(), tag)
  const full = await W.pic(p, tag)
  await W5.boardDrawer(p, W, false)
  return { c, pic: [pc, full].filter(Boolean).join(', ') }
}
export async function weekCrewOf(p, W, dow, id, tag) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const day = await S.crewPanelTo(p, W, dow)
  const c = await W5.crewOf(p, '.ros-body', id)
  const pc = await W5.clip(p, W, p.locator(`.ros-body .rpuck[data-person="${id}"]`).first(), tag)
  const full = await W.pic(p, tag)
  await S.crewPanelClose(p, W)
  return { day, c, pic: [pc, full].filter(Boolean).join(', ') }
}
/* where he stands in a crew list: 'SANS Avail' / a column / absent; the words printed under his name */
export const crewWhere = c => c && c.pucks ? (c.pucks.filter(x => x.shown).map(x => `${x.where}${x.struck ? ' (struck)' : ''}${x.printed ? ' "' + x.printed + '"' : ''}`).join(' + ') || (c.pucks.length ? 'in the list but not shown' : 'not in the list')) : J(c)
export const inSansAvail = c => !!(c && c.pucks && c.pucks.some(x => x.shown && x.where === 'SANS Avail'))
/* the week shown on Edit Schedule (sud-w6-lib's recipe): the week strip on a desktop, "Jump to a date" on a phone */
export async function gotoWeek(p, W, mondayIso) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const wk = `${mondayIso.slice(8, 10)}/${mondayIso.slice(5, 7)}/${mondayIso.slice(0, 4)}`
  if ((await p.evaluate(() => window.CURWEEK)) === wk) return wk
  const seg = p.locator(`#weekSegE [data-wk="${wk}"]:visible`).first()
  if (await seg.count()) await W.press(p, seg, 'wk-' + mondayIso)
  else {
    await W.press(p, p.locator('.filt-cal:visible, .wk-cal:visible').first(), 'jump-cal')
    await tid(p, 'wcal').first().waitFor({ timeout: 6000 })
    for (let i = 0; i < 24; i++) {
      const m = await tid(p, 'wcal').first().getAttribute('data-month')
      const diff = (+mondayIso.slice(0, 4) * 12 + +mondayIso.slice(5, 7)) - (+m.slice(0, 4) * 12 + +m.slice(5, 7))
      if (!diff) break
      await W.press(p, tid(p, diff > 0 ? 'wcal-next' : 'wcal-prev').first(), 'wcal-step'); await sleep(300)
    }
    await W.press(p, tid(p, 'wcal-day-' + mondayIso).first(), 'wcal-day')
  }
  await sleep(1200)
  return p.evaluate(() => window.CURWEEK)
}
export { sleep, J }
