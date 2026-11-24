// sah-w8-lib — walker w8's helpers for the FULL check of claude/allavail-sans-postout-141 (D2340 filing ahead, D2342 the
// bell's words, D2346 the fade), 23 Nov 26, chat 152. Built on sud-w6-lib / asp-w2-lib (the clock, the sign-in, the board,
// the Post out sheet) and sud-w5-lib's SANS calendar recipe. window.* is only READ here (and window.go, the recipes' own
// page switch, which a person reaches by the page names). Import './sah-w8-env.mjs' first.
import './sah-w8-env.mjs'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
const L = await import('./sud-w6-lib.mjs')
export { L }
export const { sleep, J } = L
export const RANGER = 'bane', HEX = 'rocky'
export const STATE = 'D:/raptor-work/c152-walk/w8/state'
mkdirSync(STATE, { recursive: true })
export const OUT = L.OUT
mkdirSync(path.join(OUT, 'taps'), { recursive: true })
const clean = s => String(s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
export { clean }

/* the phone in Chromium (CDP fingers) — only where WebKit cannot hold-and-drag (walk-scripts §4) */
export const PC = { name: 'phone-chromium', eng: chromium, launch: L.SIZES.d.launch, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 } }

/* sign out (if anyone is in) and in as `user`; closes a SANS day window / the bell / the board first */
export async function as(p, W, user, pass) {
  await p.waitForSelector('#luser:visible, #vWeek .day, #eWeek .day', { timeout: 20000 }).catch(() => {})
  await closeInp(p, W); await sansX(p, W); await bellShut(p); await L.closeBoard(p, W)
  if (!(await p.locator('#luser:visible').count())) await L.signOut(p, W)
  await L.signIn(p, user, pass)
  return clean(await p.locator('#roleBadge').first().textContent().catch(() => ''))
}

/* ---- the bell ---- */
export async function bellRead(p, W, tag) {
  const lit = await p.evaluate(() => { const b = [...document.querySelectorAll('.bellbtn')].find(e => e.getBoundingClientRect().width > 0); return b ? b.classList.contains('on') : 'no bell' })
  if (!(await p.locator('[data-testid="bell-list"]').count())) await W.press(p, '.bellbtn:visible', 'bell')
  await p.waitForSelector('[data-testid="bell-list"]', { timeout: 6000 }).catch(() => {})
  await sleep(350)
  const lines = await p.evaluate(() => {
    const t = e => e ? (e.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : ''
    const list = [...document.querySelectorAll('[data-testid="bell-list"]')].find(e => e.getBoundingClientRect().width > 0)
    if (!list) return null
    return [...list.querySelectorAll('.bl-line')].map(e => {
      /* the words as drawn: the bold first part, then each line under it, a space between (they are separate blocks) */
      const r = e.getBoundingClientRect()
      return { id: (e.dataset.testid || '').replace('bell-line-', ''), unread: e.classList.contains('unread'), text: [...e.querySelectorAll('.bl-t, .bl-what')].map(t).filter(Boolean).join(' '), struck: [...e.querySelectorAll('s, .bl-struck')].map(t).filter(Boolean), more: t(e.querySelector('[data-testid="bell-more-words"]')), ago: t(e.querySelector('.bl-ago')), w: Math.round(r.width), right: Math.round(r.right) }
    })
  })
  const pic = tag ? await W.pic(p, tag + '-bell') : ''
  /* his SANS-days lines: the reminder (its id sansdue:…) and the take-back (its words struck, "You're SANS from …") */
  const sans = (lines || []).filter(l => /^sansdue/.test(l.id) || l.struck.some(s => /^You're SANS from/.test(s)))
  return { lit, lines: lines || [], sans, due: sans.filter(l => l.id.startsWith('sansdue')), back: sans.filter(l => !l.id.startsWith('sansdue')), pic }
}
export const bellWords = b => `lit ${b.lit} · ${b.lines.length} lines · SANS: ${b.sans.map(l => `${l.unread ? '[unread]' : '[read]'} ${l.id} "${l.text}"${l.struck.length ? ' struck[' + l.struck.join(' | ') + ']' : ''}${l.ago ? ' age "' + l.ago + '"' : ''}`).join(' || ') || 'none'}`
export async function bellShut(p, how = 'escape', W) {
  if (!(await p.locator('[data-testid="bell-list"]').count())) return 'was closed'
  if (how === 'escape') await p.keyboard.press('Escape')
  else if (how === 'bell') await W.press(p, '.bellbtn:visible', 'bell-again')
  else { const vp = p.viewportSize(); if (W && W.isPhone) await p.touchscreen.tap(20, vp.height - 30); else await p.mouse.click(20, vp.height - 30) }
  await sleep(450)
  return (await p.locator('[data-testid="bell-list"]').count()) ? 'still open' : 'closed'
}
/* a bell line tapped; what it opened */
export async function bellTap(p, W, id, tag) {
  const l = p.locator(`[data-testid="bell-line-${id}"]`).first()
  await l.waitFor({ state: 'visible', timeout: 6000 })
  const bb = await l.boundingBox()
  const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2
  let now = ''
  if (W.isPhone) { await p.touchscreen.tap(x, y); await sleep(40); now = `${W.scn}-${tag}-line-now-phone.png`; await p.screenshot({ path: path.join(OUT, 'taps', now) }) }
  else await p.mouse.click(x, y)
  await sleep(1200)
  const r = await sansPage(p)
  return { ...r, pic: await W.pic(p, tag + '-tapped') + (now ? ', taps/' + now : '') }
}

/* ---- the SANS calendar ---- */
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
export const sansPage = p => p.evaluate(() => {
  const t = e => e ? (e.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : ''
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  const win = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(vis)
  let w = null
  if (win) {
    const r = win.getBoundingClientRect(), add = win.querySelector('[data-testid="sd-add"]')
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + Math.min(r.height / 2, 60))
    w = { ttl: t(win.querySelector('.win-ttl')), box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], inScreen: r.top >= -1 && r.left >= -1 && r.top < innerHeight - 40, topIsWin: !!(top && win.contains(top)),
      add: add ? (add.disabled ? 'greyed' : 'enabled') : 'none', addwhy: t(win.querySelector('[data-testid="sd-addwhy"]')),
      list: t(win.querySelector('[data-testid="sd-list"]')).slice(0, 300), iids: [...win.querySelectorAll('[data-popiid]')].map(e => e.dataset.popiid),
      sansP: t(win.querySelector('[data-testid="sd-sans-p"]')), sansW: t(win.querySelector('[data-testid="sd-sans-w"]')) }
  }
  return { page: window.CURPAGE, cal: vis(document.querySelector('[data-testid="sanscal"]')), month: t(document.querySelector('[data-testid="sc-month"]')), win: w }
})
export async function openSans(p, W) {
  await L.go(p, 'inputs')
  await p.waitForSelector('#inSansMode', { timeout: 10000 })
  await W.press(p, '#inSansMode', 'sans-tab')
  await p.locator('[data-testid="sanscal"]').first().waitFor({ timeout: 8000 }); await sleep(400)
}
export async function sansGoto(p, W, iso) {
  const at = async () => { const [m, y] = clean(await p.locator('[data-testid="sc-month"]').first().textContent()).toLowerCase().split(/\s+/); return +y * 12 + MONTHS.findIndex(x => x.startsWith(m.slice(0, 3))) }
  for (let i = 0; i < 24; i++) {
    const d = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) - await at()
    if (!d) break
    await W.press(p, `[data-testid="sc-${d > 0 ? 'next' : 'prev'}"]`, 'sc-step'); await sleep(450)
  }
  await sleep(350)
  return clean(await p.locator('[data-testid="sc-month"]').first().textContent())
}
/* one day's cell as drawn: its classes, the fade, what a screen reader hears, the figures */
export const cellRead = (p, iso) => p.evaluate(iso => {
  const c = document.querySelector(`[data-testid="sc-day-${iso}"]`)
  if (!c) return null
  const cs = getComputedStyle(c), kid = c.firstElementChild
  const figs = [...c.querySelectorAll('.sc-row')].map(r => (r.textContent || '').replace(/\s+/g, '')).join(' ')
  return { before: c.classList.contains('is-before'), cls: c.className, bg: cs.backgroundColor, bgImg: cs.backgroundImage, kidOpacity: kid ? getComputedStyle(kid).opacity : null, aria: c.getAttribute('aria-label') || '', figs }
}, iso)
export const cellsBefore = (p, from, to) => p.evaluate(([a, b]) => [...document.querySelectorAll('[data-testid^="sc-day-"]')].filter(c => { const d = c.dataset.icday; return d >= a && d <= b }).filter(c => c.classList.contains('is-before')).map(c => c.dataset.icday.slice(8)), [from, to])
export async function sansX(p, W, how = 'x') {
  if (!(await p.locator('[data-testid="win-sansday"]:visible').count())) return 'none open'
  if (how === 'x') await W.press(p, '[data-testid="win-sansday-x"]:visible', 'sansday-x')
  else if (how === 'esc') await p.keyboard.press('Escape')
  await sleep(450)
  return (await p.locator('[data-testid="win-sansday"]:visible').count()) ? 'still open' : 'closed'
}
export async function sansDay(p, W, iso) {
  /* on a phone the open day stands tall over the month (D648): a person closes it by its ✕ before tapping another date */
  if (W.isPhone) await sansX(p, W)
  await sansGoto(p, W, iso)
  const c = p.locator(`[data-testid="sc-day-${iso}"]`).first()
  await c.scrollIntoViewIfNeeded()
  if (W.isPhone) { await c.tap({ position: { x: 8, y: 8 } }); await sleep(40); await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-day-${iso}-now-phone.png`) }) }
  else await c.click({ position: { x: 8, y: 8 } })
  await p.locator('[data-testid="win-sansday"]').first().waitFor({ timeout: 6000 }).catch(() => {})
  await sleep(500)
  return sansPage(p)
}

/* ---- "+ Commitment" and the input window ---- */
export const inpOpen = p => p.locator('#inpEditPop:visible').count()
export async function closeInp(p, W) {
  if (!(await inpOpen(p))) return
  const c = p.locator('#inpEditCancel:visible').first()
  if (await c.count()) await W.press(p, c, 'inp-cancel'); else await p.keyboard.press('Escape')
  await sleep(400)
  const go = p.locator('[data-testid="inped-escask-go"]:visible')
  if (await go.count()) { await W.press(p, go, 'discard'); await sleep(300) }
}
/* what the open window holds: the person (box or fixed), several-people switch, its picked pucks, the ticks, the dates */
export const inpRead = p => p.evaluate(() => {
  const t = e => e ? (e.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim() : ''
  const w = document.querySelector('#inpEditPop'); if (!w) return null
  const sel = w.querySelector('#inpEditPerson')
  return {
    person: sel ? sel.value + ':' + t(sel.options[sel.selectedIndex]) : 'fixed ' + t(w.querySelector('#inpEditPersonFixed')),
    options: sel ? [...sel.options].map(o => t(o)) : [],
    several: (() => { const s = w.querySelector('[data-testid="pp-several"]'); return s ? s.getAttribute('aria-checked') : 'no switch' })(),
    picked: [...w.querySelectorAll('.pp-puck.on')].map(e => e.dataset.pp),
    groups: [...w.querySelectorAll('.pp-group')].map(g => (g.dataset.ppgroup || '?') + ':' + [...g.querySelectorAll('.pp-puck[data-pp]')].filter(e => ['bane', 'rocky'].includes(e.dataset.pp)).map(e => e.dataset.pp + (e.classList.contains('on') ? '*' : '') + (e.disabled || e.getAttribute('aria-disabled') === 'true' ? '(off)' : '')).join(',')).filter(s => !/:$/.test(s)),
    why: t(w.querySelector('[data-testid="pp-why"]')), count: t(w.querySelector('[data-testid="pp-count"]')),
    type: t(w.querySelector('#inpEditTypeFixed')) || (w.querySelector('#inpEditType') ? w.querySelector('#inpEditType').value : ''),
    ticks: [...w.querySelectorAll('#inpEditSans label')].map(l => t(l) + (l.querySelector('input').checked ? '✓' : '')).join(' '),
    dates: [...w.querySelectorAll('[data-testid^="inpEdCal-day-"][aria-pressed="true"], [data-testid^="inpEdCal-day-"].is-on, [data-testid^="inpEdCal-day-"].is-in, [data-testid^="inpEdCal-day-"].is-start, [data-testid^="inpEdCal-day-"].is-end')].map(e => e.dataset.iso.slice(5)).filter((v, i, a) => a.indexOf(v) === i),
    title: t(document.querySelector('#inpEditTitle')) || t(w.closest('.floatwin') && w.closest('.floatwin').querySelector('.win-ttl')),
    ro: t(w.querySelector('[data-testid="inped-ro"]')), save: !!w.querySelector('#inpEditSave'), del: !!w.querySelector('#inpEditDel'),
  }
})
/* the boxes set to exactly `kinds` ('f','o','a'), All day pressed */
export async function setKinds(p, W, kinds) {
  for (const [k, label] of [['f', 'Fly'], ['a', 'AMT'], ['o', 'OFT']]) {
    const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
    if (!(await cb.count())) continue
    if ((await cb.isChecked()) !== kinds.includes(k)) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(200) }
  }
  const all = p.locator('#inpEditSpan [data-span="all"]')
  if (await all.count() && (await all.getAttribute('aria-pressed')) !== 'true') await W.press(p, all, 'span-all')
}
/* the person picked: one id in the Person box, or several by the switch and their pucks */
export async function setWho(p, W, who) {
  if (Array.isArray(who)) {
    const sw = p.locator('#inpEditPop [data-testid="pp-several"]:visible').first()
    if (!(await sw.count())) return 'no several-people switch'
    if ((await sw.getAttribute('aria-checked')) !== 'true') await W.press(p, sw, 'pp-several')
    await sleep(300)
    for (let i = 0; i < 3; i++) {
      const on = await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck.on')].map(e => e.dataset.pp))
      const flip = [...on.filter(x => !who.includes(x)), ...who.filter(x => !on.includes(x))]
      if (!flip.length) return 'picked ' + who.join('+')
      for (const id of flip) {
        const b = p.locator(`#inpEditPop .pp-puck[data-pp="${id}"]`).first()
        if (!(await b.count())) return 'no puck for ' + id
        await W.press(p, b, 'pp-' + id)
      }
    }
    return 'picked? ' + (await p.evaluate(() => [...document.querySelectorAll('#inpEditPop .pp-puck.on')].map(e => e.dataset.pp))).join('+')
  }
  if (who) {
    if (!(await p.locator('#inpEditPerson').count())) return 'no Person box (fixed)'
    const has = await p.evaluate(id => [...document.querySelectorAll('#inpEditPerson option')].some(o => o.value === id), who)
    if (!has) return 'not offered: ' + who
    await p.selectOption('#inpEditPerson', who); await sleep(250)
    return 'picked ' + who
  }
  return 'as it came'
}
/* a date pressed on the window's own calendar */
export async function tapWinDate(p, W, iso) {
  const d = p.locator(`#inpEditPop [data-testid="inpEdCal-day-${iso}"]`).first()
  if (!(await d.count())) return 'no such date'
  await W.press(p, d, 'win-date-' + iso.slice(8)); await sleep(300)
  return 'pressed'
}
/* Add/Save pressed: what it said (the passing note), whether the window stayed, what was made (by the ids before/after) */
export async function saveInp(p, W, tag) {
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  await W.press(p, '#inpEditSave:visible', 'inp-save')
  let said = ''
  for (let i = 0; i < 6 && !said; i++) { said = clean(await p.locator('#toastEl').first().textContent().catch(() => '')); if (!said) await sleep(120) }
  await sleep(500)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click(); await sleep(400) }
  const stayed = !!(await inpOpen(p))
  const pic = await W.pic(p, tag + '-saved')
  const made = await p.evaluate(b => (window.INPUTS || []).filter(r => !b.includes(r.iid)).map(r => ({ iid: r.iid, who: r.person || (r.people || []).map(x => x.p || x).join('+'), type: r.type, date: r.date, end: r.end || r.endDate || null, yr: r.yr, sans: r.sans, allday: r.allday })), before)
  return { said, stayed, made, pic }
}
/* the whole filing from a day's "+ Commitment" */
export async function fileOn(p, W, iso, { who = null, kinds = ['f'], date = null, tag = 'file', keep = false } = {}) {
  const pg = await sansDay(p, W, iso)
  if (!pg.win) return { ok: false, why: 'no day window', pic: await W.pic(p, tag + '-nowin') }
  if (pg.win.add !== 'enabled') return { ok: false, greyed: true, why: `+ Commitment ${pg.win.add}: "${pg.win.addwhy}"`, pic: await W.pic(p, tag + '-greyed') }
  await W.press(p, '[data-testid="win-sansday"] [data-testid="sd-add"]', 'sd-add')
  await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(400)
  const opened = await inpRead(p)
  const whoSet = await setWho(p, W, who)
  await setKinds(p, W, kinds)
  let dateSet = ''
  if (date) { for (const d of [].concat(date)) dateSet += (await tapWinDate(p, W, d)) + ' ' + d.slice(5) + '; ' }
  const form = await inpRead(p)
  const formPic = await W.pic(p, tag + '-form')
  const s = await saveInp(p, W, tag)
  const after = s.stayed ? await inpRead(p) : null
  if (s.stayed && !keep) await closeInp(p, W)
  return { ok: s.made.length > 0 && !s.stayed, opened, whoSet, dateSet, form, ...s, after, pic: formPic + ', ' + s.pic }
}
/* a commitment opened from its day's list */
export async function openLine(p, W, iso, iid, tag) {
  const pg = await sansDay(p, W, iso)
  const row = p.locator(`[data-testid="win-sansday"] [data-popiid="${iid}"] [data-testid="sd-open"]`).first()
  if (!(await row.count())) return { ok: false, why: 'no such line on the day', list: pg.win && pg.win.list, pic: await W.pic(p, tag + '-noline') }
  await W.press(p, row, 'sd-open')
  await p.waitForSelector('#inpEditPop', { timeout: 5000 }).catch(() => {}); await sleep(400)
  return { ok: true, r: await inpRead(p), pic: await W.pic(p, tag + '-open') }
}

/* ---- the posting (the Leave War) ---- */
export const rec = (p, id) => p.evaluate(id => { const q = window.PEOPLE[id]; return q ? { san: !!q.san, sanFrom: q.sanFrom || null, archived: !!q.archived } : 'no record' }, id)
/* the posted-out sheet of `id` opened by a tap on his PO cell (or the bid window → ⋯ → Post out) */
export async function poSheet(p, W, id, iso, tag) {
  const c = (await L.lwCell(p, W, id, iso)).cell
  if (!c) return { kind: 'NO CELL' }
  await W.press(p, c, 'cell-' + iso); await sleep(450)
  let kind = 'none'
  if (await p.locator('[data-testid="postout-sheet"]:visible').count()) kind = 'posted-out sheet'
  else if (await p.locator('[data-testid="bid-more"]:visible').count()) {
    await W.press(p, '[data-testid="bid-more"]:visible', 'more'); await W.press(p, '[data-testid="bid-postout"]:visible', 'postout')
    kind = (await p.locator('[data-testid="postout-sheet"]:visible').count()) ? 'bid window → ⋯ → Post out (posted-out sheet)' : 'bid window → ⋯ → Post out (new posting)'
  }
  const line = clean(await p.locator('[data-testid="postout-line"]:visible, [data-testid="po-line"]:visible').first().textContent().catch(() => ''))
  return { kind, line, pic: await W.pic(p, tag + '-sheet') }
}
export async function poClose(p, W) {
  for (const s of ['[data-testid="postout-cancel"]:visible', '[data-testid="bid-cancel"]:visible']) if (await p.locator(s).count()) { await W.press(p, s, 'sheet-x'); break }
  await sleep(450)
}
/* the PO from date moved on the open posted-out sheet, through its own date box */
export async function poMove(p, W, iso) {
  await W.press(p, '[data-testid="postout-date"]:visible', 'po-date')
  const d = p.locator(`[data-iso="${iso}"]:visible`).first()
  if (!(await d.count())) return 'no date ' + iso
  await W.press(p, d, 'po-day-' + iso.slice(8)); await sleep(700)
  return clean(await p.locator('[data-testid="postout-line"]:visible').first().textContent().catch(() => '')) + ' ' + clean(await p.locator('[data-testid="postout-err"]:visible').first().textContent().catch(() => ''))
}
export async function poUndo(p, W) {
  await W.press(p, '[data-testid="postout-undo"]:visible', 'po-undo'); await sleep(900)
}

/* ---- the schedule's crew lists (a man's puck and its note) ---- */
export const crewNote = (p, root, id) => p.evaluate(([root, id]) => {
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  const R = document.querySelector(root); if (!R) return { root: 'none' }
  const day = ((R.querySelector('.er-dayname') || {}).textContent || '').trim()
  return { day, pucks: [...R.querySelectorAll(`.rpuck[data-person="${id}"]`)].filter(e => !e.closest('.availwin')).map(e => ({ shown: vis(e), where: e.closest('.rsans') ? 'SANS Avail' : 'crew', struck: /(^|\s)no(\s|$)/.test(e.className), title: e.getAttribute('title') || '', why: e.getAttribute('data-why') || '', rwhy: ((e.querySelector('.rwhy') || {}).textContent || '').trim() })) }
}, [root, id])
export const noteWords = c => c && c.pucks ? c.pucks.map(x => `[${x.where}${x.shown ? '' : ' hidden'}${x.struck ? ', struck' : ''}] ${[x.title, x.why, x.rwhy].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' | ')}`).join(' ; ') : J(c)
export async function crewTo(p, W, dow) {
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (!shown) await W.press(p, '#rosTab', 'crew-tab')
  }
  const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  for (let i = 0; i < 8; i++) {
    const cur = clean(await p.locator('.ros-body .er-dayname').first().textContent().catch(() => '')).toLowerCase()
    if (cur.startsWith(dow)) return cur
    await W.press(p, `.ros-body [data-crewstep="${order.indexOf(dow) > order.indexOf(cur.slice(0, 3)) ? 1 : -1}"]`, 'crewstep'); await sleep(300)
  }
  return 'not reached'
}
export async function crewShut(p, W) {
  if (W.isPhone) {
    const shown = await p.evaluate(() => { const b = document.querySelector('.ros-body'); if (!b) return false; const r = b.getBoundingClientRect(); return r.width > 40 && r.left < window.innerWidth - 40 })
    if (shown && await p.locator('#rosTab:visible').count()) await W.press(p, '#rosTab', 'crew-tab-close')
  }
}

/* ---- a drag across the month's dates: a mouse on a desktop; a finger held then dragged (CDP, Chromium) on a phone ---- */
export async function dragDays(p, W, a, b) {
  if (W.isPhone) await sansX(p, W)   // the open day stands over the month on a phone: closed by its ✕ first
  await sansGoto(p, W, a)
  const box = async iso => { const l = p.locator(`[data-testid="sc-day-${iso}"]`).first(); await l.scrollIntoViewIfNeeded(); return l.boundingBox() }
  const A = await box(a), Bx = await box(b)
  const ax = A.x + A.width / 2, ay = A.y + A.height / 2, bx = Bx.x + Bx.width / 2, by = Bx.y + Bx.height / 2
  let held = null
  if (W.touchCdp) {
    const cdp = await p.context().newCDPSession(p)
    const tp = (x, y) => [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: 1 }]
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp(ax, ay) })
    await sleep(600)
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: tp(ax + (bx - ax) * i / 8, ay + (by - ay) * i / 8) }); await sleep(40) }
    await sleep(120)
    held = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-picked')].map(e => e.dataset.icday.slice(8)))
    await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-drag-${a.slice(8)}-${b.slice(8)}-held-phone.png`) })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  } else {
    await p.mouse.move(ax, ay); await p.mouse.down(); await sleep(80)
    for (let i = 1; i <= 8; i++) { await p.mouse.move(ax + (bx - ax) * i / 8, ay + (by - ay) * i / 8); await sleep(30) }
    await sleep(80)
    held = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-picked')].map(e => e.dataset.icday.slice(8)))
    await p.screenshot({ path: path.join(OUT, 'taps', `${W.scn}-drag-${a.slice(8)}-${b.slice(8)}-held-desktop.png`) })
    await p.mouse.up()
  }
  await sleep(700)
  return { opened: !!(await inpOpen(p)), r: await inpRead(p), picked: held }
}
/* the keys: focus a date, Shift + arrows, Enter */
export async function keysRun(p, W, from, steps) {
  await sansGoto(p, W, from)
  await p.locator(`[data-testid="sc-day-${from}"]`).first().focus(); await sleep(150)
  for (let i = 0; i < Math.abs(steps); i++) { await p.keyboard.press(steps > 0 ? 'Shift+ArrowRight' : 'Shift+ArrowLeft'); await sleep(120) }
  const picked = await p.evaluate(() => [...document.querySelectorAll('.sc-day.is-picked')].map(e => e.dataset.icday.slice(8)))
  await p.keyboard.press('Enter'); await sleep(700)
  return { picked, opened: !!(await inpOpen(p)), r: await inpRead(p) }
}

/* ---- the world, through the app's controls, as Saber on Wed 15 Jul ---- */
/* what a man holds on each day of the loaded week (read only) */
export const holds = (p, id) => p.evaluate(id => (window.DAYS || []).map(d => {
  const hits = []
  const walk = (o, path) => { if (o == null) return; if (typeof o === 'string') { if (o === id) hits.push(path); return } if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path + '[' + i + ']')); return } if (typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k) }
  walk(d, '')
  return d.dt + ':' + (hits.join(' ') || '-')
}).join(' | '), id)
export async function row(p, W, wkMon, di, name, a, b, id) {
  const cw = await L.gotoWeek(p, W, wkMon)
  await L.openBoard(p, W, di)
  const g = await L.groundRow(p, W, di, name, a, b, id)
  await L.closeBoard(p, W)
  return { cw, ok: !!(g.row && J(g.row.who || '').includes(id)), row: g.row }
}
