/* w3's helpers for the amendment re-test (24 Sep 26) — Unpublish, undo/redo across a publish, the lifecycle
   boundaries and the two roles. Builds on am-lib.mjs (which builds on ../lib.mjs). Everything here drives the
   app's OWN controls: the Logout button (or the phone drawer's), the login form, the role badge (or the
   drawer's "View as member"), the Undo/Redo buttons, the view page's version picker. Reads of the engine are
   for the evidence table only. Every script prints PASS/FAIL per check, so re-running it IS the re-walk. */
import { mkdirSync } from 'node:fs'
import { go, login } from './am-lib.mjs'
export * from './am-lib.mjs'
/* w3's OWN picture folder, used by the `shot` below — never the shared lib's SHOTS, which is fixed when
   that module first loads and so depends on import order. */
export const W3SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
mkdirSync(W3SHOTS, { recursive: true })
export async function shot(page, name, locator) {
  const file = `${W3SHOTS}/${name}.png`
  if (locator) await locator.screenshot({ path: file })
  else await page.screenshot({ path: file, fullPage: false })
  return file
}

export const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
export const W = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } }

/** A PASS/FAIL recorder. `note` lines are observations, not verdicts. */
export function checker(tag) {
  const rows = []
  const check = (id, ok, detail = '') => {
    const line = `${ok ? 'PASS' : 'FAIL'} [${tag}] ${id}${detail ? ' — ' + detail : ''}`
    rows.push(line); console.log(line); return ok
  }
  const note = (id, detail) => { const line = `NOTE [${tag}] ${id} — ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`; rows.push(line); console.log(line.slice(0, 1600)) }
  const summary = () => {
    const f = rows.filter(r => r.startsWith('FAIL')).length, p = rows.filter(r => r.startsWith('PASS')).length
    console.log(`SUMMARY [${tag}] ${p} pass, ${f} fail`)
    return { pass: p, fail: f, rows }
  }
  return { check, note, summary }
}

/** Record every toast the app shows from now on (the one #toastEl, whose text is replaced per message). */
export async function watchToasts(page) {
  await page.evaluate(() => {
    if (window.__w3obs) return
    window.__w3toasts = []
    /* every time the app SETS the toast's text a new text node replaces the old one (a childList mutation on
       #toastEl) — even when the message is the same as the last, which is exactly the case a repeated refusal
       produces, so nothing is de-duplicated here */
    window.__w3obs = new MutationObserver(ms => {
      const t = document.getElementById('toastEl'); if (!t) return
      for (const m of ms) if (m.type === 'childList' && m.target === t) { const s = (t.textContent || '').trim(); if (s) window.__w3toasts.push(s) }
    })
    window.__w3obs.observe(document.body, { childList: true, subtree: true })
  })
}
/** The toasts seen since the last call (and clears the list). */
export async function toasts(page) {
  return page.evaluate(() => { const t = window.__w3toasts || []; window.__w3toasts = []; return t })
}

/** Reload the page the way a person does, sign back in, and re-arm the helpers a reload loses. */
export async function reload(page, who = 'a') {
  await page.reload()
  await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
  if (await page.locator('#luser').count()) await login(page, who)
  await page.waitForTimeout(500)
  await watchToasts(page)
}

const isPhone = async (page) => (await page.evaluate(() => window.innerWidth)) < 820

/** Log out through the app's own button (the phone drawer's on a phone). */
export async function logout(page) {
  if (await isPhone(page)) {
    await page.locator('#burger').click(); await page.waitForTimeout(400)
    await page.locator('#drawerLogout').click()
  } else await page.locator('#logout').click()
  await page.waitForSelector('#luser', { timeout: 8000 })
  await page.waitForTimeout(300)
}
/** Sign in through the login form (who 'a' = admin ad/a, 'm' = member us/us). */
export async function signIn(page, who) { await login(page, who); await watchToasts(page) }

/** The admin's "View as member" flip and back: the role badge on a desktop, the drawer's button on a phone. */
export async function flipRole(page) {
  if (await isPhone(page)) {
    await page.locator('#burger').click(); await page.waitForTimeout(400)
    const b = page.locator('#drawerRole'); const label = (await b.innerText()).trim(); await b.click(); await page.waitForTimeout(500); return label
  }
  const b = page.locator('#roleBadge'); const label = (await b.innerText()).trim(); await b.click(); await page.waitForTimeout(500); return label
}
export async function roleNow(page) {
  return page.evaluate(() => ({ badge: (document.querySelector('#roleBadge') || {}).innerText || '', page: window.CURPAGE,
    editTab: !!document.querySelector('#topnav a[data-page="editsched"]:not([hidden])') }))
}

/** Which Undo/Redo is on screen: the board's own pair, the top bar's (edit page only), or the Leave War's. */
async function histBtn(page, which) {
  const cands = which === 'undo' ? ['#schedBoard #sbUndo', '#undoBtn', '[data-testid="lw-undo"]'] : ['#schedBoard #sbRedo', '#redoBtn', '[data-testid="lw-redo"]']
  for (const s of cands) { const l = page.locator(s + ':visible').first(); if (await l.count()) return { sel: s, loc: l } }
  return null
}
export async function undoState(page) {
  const u = await histBtn(page, 'undo'), r = await histBtn(page, 'redo')
  const rd = async (x) => x ? { where: x.sel, title: await x.loc.getAttribute('title'), disabled: await x.loc.isDisabled() } : null
  return { undo: await rd(u), redo: await rd(r) }
}
/** Press Undo / Redo on whichever surface is showing; returns the state before, and the toasts it raised. */
export async function pressHist(page, which) {
  const b = await histBtn(page, which)
  if (!b) return { pressed: false, why: 'no ' + which + ' button on screen' }
  const title = await b.loc.getAttribute('title'), disabled = await b.loc.isDisabled()
  if (disabled) return { pressed: false, why: 'disabled', title }
  await toasts(page)
  await b.loc.click(); await page.waitForTimeout(900)
  return { pressed: true, where: b.sel, title, toasts: await toasts(page) }
}

/** The view page's reading of day di (go there first): head, tag, picker, bar, stamps, marks. */
export async function viewDay(page, di) {
  if ((await page.evaluate(() => window.CURPAGE)) !== 'viewsched') await go(page, 'viewsched')
  return page.evaluate(i => {
    const s = document.querySelector(`#vWeek .day[data-day="${i}"]`)
    if (!s) return null
    const txt = e => (e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : '')
    return {
      cls: s.className.replace(/\s+/g, ' ').trim(),
      tag: txt(s.querySelector('.verchip')), nys: !!s.querySelector('.nysmark'), pending: txt(s.querySelector('.dpend')),
      stamp: txt(s.querySelector('.dbeak')), bar: txt(s.querySelector('.dprev-bar')),
      picker: [...s.querySelectorAll('select.dver option')].map(o => (o.selected ? '*' : '') + o.text),
      pickerKind: s.querySelector('select[data-vwork]') ? 'vwork' : s.querySelector('select[data-dver]') ? 'dver' : 'none',
      pend: s.querySelectorAll('[data-alp]').length, issued: [...s.querySelectorAll('[data-alc]')].filter(e => !e.classList.contains('verchip')).length,
      writers: s.querySelectorAll('[data-unpub],[data-alpub],[data-beak],select[data-sign],[data-planmenu],[data-daytplopen]').length,
      head: txt(s.querySelector('.day-head')).slice(0, 200),
    }
  }, di)
}
/** Choose the view page's issued / working entry for a published day through its own select. */
export async function pickView(page, di, v) {
  const sel = page.locator(`#vWeek select[data-vwork="${di}"]`).first()
  if (!(await sel.count())) return false
  await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await sel.selectOption(v); await page.waitForTimeout(600); return true
}
/** Text of a cell on the view page / edit week by its data-txt key (the typed value a person reads). */
export async function cellText(page, root, key) {
  return page.evaluate(([r, k]) => { const e = document.querySelector(`${r} [data-txt="${k}"]`); return e ? (e.innerText || e.value || '').trim() : null }, [root, key])
}

/** Open the day panel (ⓘ) of day di on the current page and read it, then close it. */
export async function dayInfo(page, di, name) {
  const b = page.locator(`.dinfobtn[data-dayinfo="${di}"]:visible`).first()
  if (!(await b.count())) return 'NO ⓘ BUTTON'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(600)
  const t = await page.evaluate(() => { const m = document.querySelector('#dayPop'); return m ? (m.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 700) : 'NO PANEL' })
  if (name) await shot(page, name)
  await closePops(page)
  return t
}
export async function closePops(page) {
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  if (await page.locator('#dayPop:visible, .wmenu:visible').count()) { await page.mouse.click(3, 300); await page.waitForTimeout(300) }
  const hx = page.locator('#histModal:visible #histClose').first(); if (await hx.count()) { await hx.click(); await page.waitForTimeout(300) }
}

/** Press a Leave War cell and choose a code from its sheet (a bid, as the person or an admin makes one). */
export async function lwBid(page, cs, iso, code = 'OIL') {
  if ((await page.evaluate(() => window.CURPAGE)) !== 'leavewar') { await go(page, 'leavewar'); await page.waitForTimeout(1200) }
  const mon = page.locator(`[data-testid="month-${new Date(iso).toLocaleString('en', { month: 'short' }).toUpperCase()}"]`)
  if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1000) }
  const pid = await page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)
  const el = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  const bx = await el.boundingBox(); if (!bx) return 'no cell'
  await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up(); await page.waitForTimeout(900)
  const b = page.locator('[class*=sheet] button:visible').filter({ hasText: new RegExp('^' + code + '$') }).first()
  if (!(await b.count())) { await page.keyboard.press('Escape'); return 'no ' + code + ' in the sheet' }
  await b.click(); await page.waitForTimeout(900)
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  return page.evaluate(([p, d]) => { const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`); return c ? (c.innerText || '').trim() : 'none' }, [pid, iso])
}
/** The Leave War cells of the named people on a date — the money, read off the grid. */
export async function lwRead(page, names, iso = '2026-07-18') {
  await go(page, 'leavewar'); await page.waitForTimeout(1000)
  const mon = page.locator(`[data-testid="month-${new Date(iso).toLocaleString('en', { month: 'short' }).toUpperCase()}"]`)
  if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1000) }
  return page.evaluate(([ns, d]) => {
    const P = window.PEOPLE, out = {}
    for (const n of ns) { const id = Object.keys(P).find(k => P[k].cs === n); const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      out[n] = c ? (c.innerText || '').trim() || '(empty)' : 'NO CELL' }
    return out
  }, [names, iso])
}
/** A picture of the Leave War with a man's cell on a date in the middle of the screen (the money, seen). */
export async function lwShot(page, name, cs, iso = '2026-07-18') {
  await go(page, 'leavewar'); await page.waitForTimeout(900)
  const mon = page.locator(`[data-testid="month-${new Date(iso).toLocaleString('en', { month: 'short' }).toUpperCase()}"]`)
  if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(900) }
  const pid = await page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)
  const el = page.locator(`[data-testid="cell-${pid}-${iso}"]`).first()
  if (await el.count()) { await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(500) }
  await shot(page, name)
}
/** Open the plans menu of day di and tap the row whose text matches `re` (an issued version → a preview). */
export async function menuPick(page, di, re) {
  const root = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = page.locator(`${root} [data-planmenu="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(500)
  const rows = await page.evaluate(() => [...document.querySelectorAll('.wm')].filter(e => e.offsetWidth || e.offsetHeight).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  const it = page.locator('.wm:visible').filter({ hasText: re }).first()
  if (!(await it.count())) { await closePops(page); return { rows, picked: false } }
  await it.click(); await page.waitForTimeout(700)
  return { rows, picked: true }
}
/** Open the plans menu of day di and LOOK at an issued version: only the "Issued · read-only" rows
    (data-planpv) are candidates, because the live row's caption also names the issued version
    ("… differences from Original go out as AL1") and a plain text match would tap the live row. */
export async function menuLook(page, di, re) {
  const root = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = page.locator(`${root} [data-planmenu="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(500)
  const rows = await page.evaluate(() => [...document.querySelectorAll('.wm')].filter(e => e.offsetWidth || e.offsetHeight).map(e => (e.dataset.planpv != null ? '[look] ' : '') + e.innerText.replace(/\s+/g, ' ').trim()))
  const it = page.locator('.wm[data-planpv]:visible').filter({ hasText: re }).first()
  if (!(await it.count())) { await closePops(page); return { rows, picked: false } }
  await it.click(); await page.waitForTimeout(700)
  return { rows, picked: true }
}
/** The Unpublish button of day di on the current surface. */
export async function unpubBtn(page, di) {
  const root = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = page.locator(`${root} [data-unpub="${di}"]:visible`).first()
  if (!(await b.count())) return null
  return { text: (await b.innerText()).trim(), title: await b.getAttribute('title') }
}
/** Tap Unpublish ONCE (never a second tap here) and report what the button and the toasts say after. */
export async function tapUnpub(page, di) {
  const root = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const b = page.locator(`${root} [data-unpub="${di}"]:visible`).first()
  if (!(await b.count())) return { tapped: false }
  await toasts(page)
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(900)
  return { tapped: true, after: await unpubBtn(page, di), toasts: await toasts(page) }
}
/** Sign one role on day di with the n-th offered name (the real select). */
export async function signRole(page, di, role, pick = 0) {
  const root = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const sel = page.locator(`${root} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
  if (!(await sel.count())) return 'NO SELECT'
  const opts = await sel.locator('option').evaluateAll(os => os.map(o => ({ v: o.value, t: o.text })).filter(o => o.v))
  if (!opts.length) return 'NO NAMES'
  const o = opts[Math.min(pick, opts.length - 1)]
  await sel.selectOption(o.v); await page.waitForTimeout(300)
  return o.t
}
/** Change week the way a person does: the week chips on a desktop, the calendar ("Jump to a date") on a phone. */
export async function changeWeek(page, iso) {
  const [y, m, d] = iso.split('-')
  if (!(await isPhone(page))) {
    const b = page.locator(`.page.on .wk[data-wk="${d}/${m}/${y}"]:visible`).first()
    if (await b.count()) { await b.click(); await page.waitForTimeout(1000); return 'week chip' }
  }
  const c = page.locator('.page.on .wk-cal:visible, .page.on .filt-cal:visible').first()
  if (!(await c.count())) return 'NO CALENDAR BUTTON'
  await c.click(); await page.waitForTimeout(500)
  await page.locator(`#weekCal [data-wcal="${iso}"]`).click(); await page.waitForTimeout(1100)
  return 'calendar'
}
export const weekNow = (page) => page.evaluate(() => (window.DATES || [])[0])
/** Open the Edit history list (the top bar's button on the edit page) and read it. */
export async function histList(page, name) {
  const b = page.locator('#histBtn:visible').first()
  if (!(await b.count())) return { open: false }
  await b.click(); await page.waitForTimeout(600)
  const r = await page.evaluate(() => { const m = document.querySelector('#histModal'); if (!m || m.hidden) return null
    const body = m.querySelector('#histBody'), br = body ? body.getBoundingClientRect() : null
    /* a line whose text runs past the list's right edge is cut off on screen (the list clips it) */
    const clipped = br ? [...m.querySelectorAll('#histBody .hl-row')].filter(r => [...r.children].some(c => c.getBoundingClientRect().right > br.right + 1))
      .map(r => (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 90)) : []
    return { clipped, rows: [...m.querySelectorAll('#histBody .hl-row')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()),
      empty: (m.querySelector('.hl-empty') || {}).innerText || '', foot: (m.querySelector('.hl-foot') || {}).innerText || '',
      count: (m.querySelector('.hl-count') || {}).innerText || '' } })
  if (name) await shot(page, name)
  await closePops(page)
  return { open: !!r, ...(r || {}) }
}
/** Go to a page through the app's own navigation: the top bar's tabs on a desktop, the drawer on a phone. */
export async function navTo(page, p) {
  if (await isPhone(page)) {
    await page.locator('#burger').click(); await page.waitForTimeout(400)
    await page.locator(`#drawerNav a[data-page="${p}"]`).click()
  } else await page.locator(`#topnav a[data-page="${p}"]`).click()
  await page.waitForFunction(q => window.CURPAGE === q, p, { timeout: 8000 }); await page.waitForTimeout(500)
}
/** Every published day's head on the edit week, in one line each (for before/after comparisons). */
export async function allHeads(page) {
  const { head } = await import('./am-lib.mjs')
  const out = {}
  for (let di = 0; di < 7; di++) { const h = await head(page, di); out[di] = h ? `${h.tag}|${(h.selector || '').replace(/\s+/g, ' ')}|${(h.pending || '').replace(/\s+/g, ' ')}|${h.nys ? 'NYS' : ''}|${h.signState}|${h.unpub ? h.unpub.text : '-'}|${h.alpub ? h.alpub.text : '-'}|${h.beak ? h.beak.text : '-'}` : null }
  return out
}
export { go }
