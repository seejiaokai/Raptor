/* Walker w4 — the money (OIL on the Leave War) and inputs landing on a published day
   ([HUMAN-RETEST] the amendment system, 24 Sep 26). Helpers on top of am-lib.mjs.

   Everything here drives the app's OWN controls (the Leave War cells and sheets, the month
   strip, the person sheet, the Inputs page form, the export buttons). Reads of window.* are
   for the evidence table only — nothing here writes through window (brief §The rules of the walk).

   OIL is earned leave — time off banked — never pay (D25). */
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
export * from './am-lib.mjs'
import { go, shot } from './am-lib.mjs'

export const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
export const PHONE = { width: 390, height: 844 }
export const DESK = { width: 1440, height: 900 }
export const SAT = 5
export const SATISO = '2026-07-18'
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** PASS / FAIL book-keeping: every check prints one line, so re-running a script IS the re-walk. */
export function checker(tag) {
  const rows = []
  const ck = (id, ok, expected, observed) => {
    const line = `${ok ? 'PASS' : 'FAIL'}  [${tag}] ${id} — expected: ${expected} | observed: ${typeof observed === 'string' ? observed : JSON.stringify(observed)}`
    rows.push({ id, ok, expected, observed, line })
    console.log(line.slice(0, 1200))
    return ok
  }
  const note = (id, observed) => {
    const line = `NOTE  [${tag}] ${id} — ${typeof observed === 'string' ? observed : JSON.stringify(observed)}`
    rows.push({ id, ok: null, observed, line })
    console.log(line.slice(0, 1400))
  }
  const summary = () => {
    const f = rows.filter(r => r.ok === false)
    console.log(`\n[${tag}] ${rows.filter(r => r.ok === true).length} PASS · ${f.length} FAIL · ${rows.filter(r => r.ok === null).length} NOTE`)
    for (const r of f) console.log('   FAIL ' + r.id)
    return rows
  }
  return { ck, note, summary, rows }
}

/** The app's toast is #toastEl, class-less, faded (never removed) — read it only while visible. */
export async function toastNow(page) {
  return page.evaluate(() => {
    const el = document.getElementById('toastEl')
    if (!el) return null
    const t = (el.textContent || '').trim()
    return t && getComputedStyle(el).opacity !== '0' ? t : null
  })
}
/** Blank the toast so the next read is the next message, not a stale one. */
export async function clearToast(page) {
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
}

/* ---------------------------------------------------------------- the Leave War */

/** Open the Leave War page and bring the month of `iso` on screen through the month strip. */
export async function lwOpen(page, iso = SATISO) {
  await go(page, 'leavewar')
  await page.waitForSelector('[data-testid^="row-"]', { timeout: 15000 })
  await page.waitForTimeout(600)
  /* the figures drawer (desktop) folds away so the grid is what we read */
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await page.waitForTimeout(300) }
  const m = page.locator(`[data-testid="month-${MON[+iso.slice(5, 7) - 1]}"]:visible`).first()
  if (await m.count()) { await m.click(); await page.waitForTimeout(900) }
  const head = page.locator(`[data-testid="head-${iso}"]`)
  await head.waitFor({ state: 'attached', timeout: 8000 }).catch(() => {})
  await page.waitForTimeout(400)
}

/** What a man's day box says on the war: the box text, the clash mark, the box's own title. */
export async function lwCell(page, id, iso = SATISO) {
  if (!(await page.locator(`[data-testid="cell-${id}-${iso}"]`).count()) && (await page.locator('[data-testid^="row-"]').count())) await lwOpen(page, iso)
  return page.evaluate(([p, d]) => {
    const c = document.querySelector(`[data-testid="cell-${p}-${d}"]`)
    if (!c) return { box: 'NO CELL DRAWN' }
    const chip = c.querySelector('.c')
    const mk = document.querySelector(`[data-testid="mark-${p}-${d}"]`)
    return { box: ((chip || c).innerText || '').replace(/\s+/g, ' ').trim(), mark: mk ? (mk.innerText || '').trim() : '',
      title: (c.getAttribute('title') || (chip && chip.getAttribute('title')) || '').slice(0, 160),
      cls: String((chip || c).className).slice(0, 60) }
  }, [id, iso])
}

/** Several men's boxes on one date. */
export async function lwCells(page, ids, iso = SATISO) {
  const o = {}
  for (const id of ids) o[id] = await lwCell(page, id, iso)
  return o
}

/** The balance column beside the man's row (whatever counter the column shows) — what a person
    reads at a glance — and the counter it shows. */
export async function lwBalCol(page, id) {
  return page.evaluate(p => {
    const b = document.querySelector(`[data-testid="bal-${p}"]`)
    const cn = document.querySelector('[data-testid="counter-name"]')
    return { counter: cn ? cn.innerText.trim() : '?', bal: b ? (b.innerText || '').replace(/\s+/g, ' ').trim() : 'NO BAL CELL' }
  }, id)
}

/** The man's OIL figure, read from his callsign's "every figure" sheet (it computes afresh when it
    opens). Opened by tapping the callsign, closed by its ✕ — the app's own doors. */
export async function lwOilFig(page, id) {
  const who = page.locator(`[data-testid="person-${id}"]:visible`).first()
  if (!(await who.count())) return { oil: 'NO PERSON CELL' }
  await who.scrollIntoViewIfNeeded()
  await who.click()
  await page.waitForTimeout(500)
  const r = await page.evaluate(() => {
    const f = document.querySelector('[data-testid="pfig-oil"]')
    const all = [...document.querySelectorAll('[data-testid^="pfig-"]')].filter(e => /^pfig-[a-z]+$/.test(e.getAttribute('data-testid')) && e.getAttribute('data-testid') !== 'pfig-close')
    return { oil: f ? ((f.querySelector('.fb') || f).innerText || '').replace(/\s+/g, ' ').trim() : 'NO OIL FIGURE',
      oilRow: f ? (f.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80) : '',
      figs: all.map(e => e.getAttribute('data-testid').slice(5) + '=' + ((e.querySelector('.fb') || e).innerText || '').replace(/\s+/g, ' ').trim().slice(0, 12)).join(' ') }
  })
  return r
}
export async function lwCloseSheet(page) {
  const x = page.locator('[data-testid="pfig-close"]:visible, [data-testid="bid-cancel"]:visible, [data-testid="daylist-close"]:visible').first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(400) }
  for (let i = 0; i < 3 && await page.locator('[data-testid="sheet-scrim"]').count(); i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
}

/** Photograph the war around one man's box: his row and the date column, with the sticky head. */
export async function lwShot(page, name, id, iso = SATISO) {
  if (!(await page.locator(`[data-testid="cell-${id}-${iso}"]`).count()) && (await page.locator('[data-testid^="row-"]').count())) await lwOpen(page, iso)
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  if (!(await c.count())) return shot(page, name)
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(350)
  return shot(page, name)
}

/** Tap a man's box and report what opens (the bid sheet or the tap list), with its lines. */
export async function lwTap(page, id, iso = SATISO) {
  /* on a phone the grid draws a rolling window of months, and opening a man's figure sheet has been seen to
     carry the grid back to January (w4 finding) — bring the month back through the strip before tapping */
  if (!(await page.locator(`[data-testid="cell-${id}-${iso}"]`).count())) await lwOpen(page, iso)
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  await c.scrollIntoViewIfNeeded()
  await c.click()
  await page.waitForTimeout(600)
  return page.evaluate(() => {
    const list = document.querySelector('[data-testid="daylist-sheet"]')
    const bid = document.querySelector('[data-testid="bid-picker"]')
    const lines = [...document.querySelectorAll('[data-testid="daylist"] li')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim())
    return { opened: list ? 'daylist' : bid ? 'bid-picker' : 'nothing',
      lines, head: bid ? (bid.querySelector('.bidsheet-hd') || bid).innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : '',
      msg: ((document.querySelector('[data-testid="daylist-msg"]') || {}).innerText || '').trim() }
  })
}

/** Place a whole-day bid of leave `type` (LL, OIL…) on one man's day through the bid sheet.
    The sheet asks before taking a balance below zero — a second tap on the same leave is the yes. */
export async function lwBid(page, id, iso, type = 'LL', { confirmNegative = true, portion = 'full' } = {}) {
  const t = await lwTap(page, id, iso)
  let sheet = page.locator('[data-testid="bid-picker"]')
  if (t.opened === 'daylist') {
    /* a day that already holds something opens the tap list; its "change" door leads to the sheet */
    const more = page.locator('[data-testid="daylist-sheet"] button').filter({ hasText: /bid|change|leave|add/i }).first()
    if (await more.count()) { await more.click(); await page.waitForTimeout(500) }
  }
  if (!(await sheet.count())) return { placed: false, why: 'no bid sheet opened (' + t.opened + ')', tap: t }
  const por = page.locator(`[data-testid="portion-${portion}"]`)
  if (await por.count()) { await por.click(); await page.waitForTimeout(150) }
  const b = page.locator(`[data-testid="bid-${type}"]`).first()
  if (!(await b.count())) { await lwCloseSheet(page); return { placed: false, why: 'no bid-' + type + ' chip', tap: t } }
  await b.click()
  await page.waitForTimeout(500)
  let note = ((await page.locator('[data-testid="span-note"]').allInnerTexts()).join(' ') || '').trim()
  if (note && /Tap the same leave again/i.test(note) && confirmNegative) {
    await b.click(); await page.waitForTimeout(500)
  }
  const still = await sheet.count()
  if (still) { const n2 = ((await page.locator('[data-testid="span-note"]').allInnerTexts()).join(' ') || '').trim(); await lwCloseSheet(page); return { placed: false, why: n2 || note || 'sheet stayed open', tap: t } }
  return { placed: true, askedFirst: note || null, tap: t }
}

/* ---------------------------------------------------------------- the schedule side */

/** Bring an element to the top of the screen, just BELOW the sticky top bar, the way a person scrolls to
    it — so a picture of a day shows its head (tag, pending chip, buttons) rather than the bar over it. */
export async function frame(page, sel, { center = false } = {}) {
  const el = page.locator(sel).first()
  if (!(await el.count())) return false
  await el.evaluate((e, c) => e.scrollIntoView({ block: c ? 'center' : 'start', inline: 'center' }), center)
  if (!center) await page.evaluate(s => {
    const e = document.querySelector(s)
    const bars = [...document.querySelectorAll('.topbar, header, .sb-top, #sbTop')].filter(b => getComputedStyle(b).position === 'sticky' || getComputedStyle(b).position === 'fixed')
    const cover = bars.reduce((m, b) => Math.max(m, b.getBoundingClientRect().bottom), 0)
    const top = e.getBoundingClientRect().top
    if (top < cover + 8) {
      /* scroll whichever box actually scrolls: the window, or the nearest scrolling ancestor */
      let p = e.parentElement
      while (p && !(p.scrollHeight > p.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement
      ;(p || window).scrollBy(0, top - cover - 10)
    }
  }, sel)
  await page.waitForTimeout(250)
  return true
}

/** The Amendments panel's text (desktop only — it is hidden at phone width, Fable §5-4). */
export async function alPanel(page) {
  return page.evaluate(() => {
    const p = document.querySelector('#alPanel')
    if (!p) return 'NOT ON PAGE'
    if (!(p.offsetWidth || p.offsetHeight)) return 'HIDDEN at this width'
    return (p.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 600)
  })
}

/** The view-only page's picture of day di: head line, tag, picker, the Unavailable list, flags. */
export async function viewDay(page, di) {
  await go(page, 'viewsched')
  await page.waitForTimeout(300)
  return page.evaluate(i => {
    const s = document.querySelector(`#vWeek .day[data-day="${i}"]`)
    if (!s) return null
    const txt = e => (e ? (e.innerText || '').replace(/\s+/g, ' ').trim() : '')
    /* the Unavailable list prints in the day's tail block; find the heading and read what follows */
    const unav = [...s.querySelectorAll('.unav, [class*=unavail], .dsec, section, .blk')].find(e => /Unavailable/i.test((e.querySelector('h3,h4,.sech,.blk-h,.dsec-h') || {}).innerText || ''))
    const unavTxt = unav ? txt(unav) : (() => { const t = txt(s); const k = t.indexOf('Unavailable'); return k >= 0 ? t.slice(k, k + 400) : 'NO UNAVAILABLE BLOCK' })()
    return { head: txt(s.querySelector('.day-head')), cls: s.className, tag: txt(s.querySelector('.verchip')),
      picker: [...s.querySelectorAll('select option')].map(o => (o.selected ? '*' : '') + o.text),
      bar: txt(s.querySelector('.dprev-bar')), unavail: unavTxt.slice(0, 500),
      warn: txt(s.querySelector('.dwarn, .warnlist, [class*=warn]')).slice(0, 300) }
  }, di)
}

/** Every flag the day's warning list shows on the current surface (week day card). */
export async function dayWarnings(page, sel) {
  return page.evaluate(s => {
    const root = document.querySelector(s)
    if (!root) return 'NO ROOT'
    return [...root.querySelectorAll('.wrow, .warn li, li.w, [data-daywarn], .dwarn li, .wlist li')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 20)
  }, sel)
}

export { go, shot }

/** Grant OIL by hand on one day (the bid sheet's "+OIL" → Days → "Give FO"), the admin's award (D79). */
export async function lwAward(page, id, iso, days = '1', why = 'w4 award') {
  const t = await lwTap(page, id, iso)
  if (t.opened !== 'bid-picker') { await lwCloseSheet(page); return { given: false, why: 'opened ' + t.opened, tap: t } }
  const plus = page.locator('[data-testid="bid-oil"]')
  if (!(await plus.count())) { await lwCloseSheet(page); return { given: false, why: 'no +OIL button' } }
  await plus.click(); await page.waitForTimeout(250)
  await page.locator('[data-testid="oil-why"]').fill(why)
  await page.locator('[data-testid="oil-days"]').fill(String(days))
  const give = page.locator('[data-testid="oil-give"]')
  const label = (await give.innerText()).trim()
  await give.click(); await page.waitForTimeout(500)
  const err = await page.locator('[data-testid="oil-err"]').allInnerTexts()
  const still = await page.locator('[data-testid="bid-picker"]').count()
  if (still) await lwCloseSheet(page)
  return { given: !still, label, err: err.join(' ') }
}

/** The OIL tracker's row for one man — his balance and every ledger line the tracker prints for him. */
export async function lwTracker(page, id, shotName) {
  await page.locator('[data-testid="oil-tracker"]:visible').first().click()
  await page.waitForTimeout(1300)
  const r = await page.evaluate(p => {
    const row = document.querySelector(`[data-testid="oil-row-${p}"]`) || [...document.querySelectorAll('[data-testid^="oil-row-"]')].find(e => e.getAttribute('data-oilrow') === p)
    if (!row) return { bal: 'NO ROW' }
    row.scrollIntoView({ block: 'center' })
    const b = row.querySelector(`[data-testid="oil-bal-${p}"]`)
    return { bal: b ? b.textContent.trim() : '?', text: (row.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 700),
      entries: [...row.querySelectorAll('[data-testid^="oil-entry-"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }
  }, id)
  if (shotName) await shot(page, shotName)
  const x = page.locator('[data-testid="oil-close"]:visible').first()
  if (await x.count()) { await x.click(); await page.waitForTimeout(400) } else { await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
  return r
}

/* ---------------------------------------------------------------- the Inputs page */
const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** File one input through the REAL Inputs page form, the way a person does (e2e/step4-leavewar.spec.ts
    fileOnInputsPage, the same steps). An admin picks the person; a member files for himself. Answers the
    medical-certificate and OIL questions if they appear (no certificate; OIL as asked). */
export async function fileInput(page, f) {
  await go(page, 'inputs')
  await page.waitForSelector('#inAdd')
  if (f.person && await page.locator('#inPerson').count()) await page.selectOption('#inPerson', f.person)
  await page.selectOption('#inType', f.type)
  const walkTo = async (iso) => {
    for (let i = 0; i < 36 && !(await page.locator(`#inCal [data-cal="${iso}"]`).count()); i++) {
      const [m, y] = (await page.locator('#inCal .rc-mon').first().textContent()).trim().split(/\s+/)
      const at = `${y}-${String(MONS.indexOf(m.slice(0, 3)) + 1).padStart(2, '0')}`
      await page.locator(`#inCal button[aria-label="${at < iso.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
      await page.waitForTimeout(80)
    }
    await page.locator(`#inCal [data-cal="${iso}"]`).first().click()
    await page.waitForTimeout(120)
  }
  await walkTo(f.from)
  if ((await page.locator('#inDates').textContent()).includes('→')) await walkTo(f.from)
  if (f.to && f.to !== f.from) await walkTo(f.to)
  if (await page.locator('#inSpan').count()) {
    await page.locator(`#inSpan [data-span="${f.span || 'all'}"]`).click()
    if (f.span === 'custom') { await page.locator('#inStartT').fill(f.start); await page.locator('#inEndT').fill(f.end) }
  } else if (await page.locator('#inAllday').count()) {
    const want = !f.start
    if ((await page.locator('#inAllday').isChecked()) !== want) await page.locator('#inAllday').click()
    if (f.start) { await page.locator('#inStartT').fill(f.start); await page.locator('#inEndT').fill(f.end) }
  }
  if (f.remarks) await page.locator('#inRemarks').fill(f.remarks)
  await page.evaluate(() => { const t = document.getElementById('toastEl'); if (t) t.textContent = '' })
  const before = await page.evaluate(() => window.INPUTS.length)
  await page.locator('#inAdd').click()
  await page.waitForTimeout(700)
  const asked = []
  for (let i = 0; i < 3; i++) {
    const nodoc = page.locator('[data-testid="docconf-nodoc"]')
    if (await nodoc.count()) { asked.push('certificate'); await nodoc.click(); await page.waitForTimeout(500); continue }
    const conf = page.locator('[data-testid="oilconf"]')
    if (await conf.count() && await conf.isVisible()) {
      asked.push('oil')
      await conf.locator('button').filter({ hasText: f.oil === 'no' ? /^No OIL/ : /^Yes/ }).first().click().catch(() => {})
      await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {})
      await page.waitForTimeout(600); continue
    }
    break
  }
  const after = await page.evaluate(() => window.INPUTS.length)
  const toast = await page.evaluate(() => { const el = document.getElementById('toastEl'); return el ? (el.textContent || '').trim() : '' })
  const iid = await page.evaluate(n => { const r = window.INPUTS[window.INPUTS.length - 1]; return window.INPUTS.length > n && r ? (r.iid || r.id || null) : null }, before)
  return { added: after - before, asked, toast, iid }
}

/** Log out through the top bar's own Logout (or the phone drawer's) and sign in as `who` ('a' | 'm'). */
export async function relogin(page, who) {
  const { login } = await import('./am-lib.mjs')
  const lo = page.locator('#logout:visible').first()
  if (await lo.count()) await lo.click()
  else {
    const menu = page.locator('.hamb:visible, #hamb:visible, button[aria-label*="menu" i]:visible').first()
    if (await menu.count()) { await menu.click(); await page.waitForTimeout(400) }
    const lo2 = page.getByRole('button', { name: /Log ?out/i }).first()
    await lo2.click()
  }
  await page.waitForTimeout(600)
  await login(page, who)
}

/** The Unavailable block of a day card (week or view page): each row's type and person, or "Nil". */
export async function readUnav(page, daySel) {
  return page.evaluate(s => {
    const d = document.querySelector(s)
    if (!d) return 'NO DAY'
    const b = d.querySelector('.sec-unav')
    if (!b) return 'NO UNAVAILABLE BLOCK'
    if (b.querySelector('.pl-nil')) return 'Nil'
    return [...b.querySelectorAll('.pl-row')].map(r => ((r.querySelector('.nm') || {}).innerText || '').trim() + ':' + ((r.querySelector('[data-person]') || {}).dataset?.person || '?'))
  }, daySel)
}
/** The Personal Inputs block of a day card: each row's type, person and its accept control. */
export async function readPinp(page, daySel) {
  return page.evaluate(s => {
    const d = document.querySelector(s)
    if (!d) return 'NO DAY'
    const b = d.querySelector('.sec-inp, .pinp')
    if (!b) return 'NO PERSONAL INPUTS BLOCK'
    return [...b.querySelectorAll('.pl-row, .sb-arow, .sbi-row')].map(r => ((r.querySelector('.nm, .ntx') || {}).innerText || '').trim() + ':' + ((r.querySelector('[data-person]') || {}).dataset?.person || '?') + ':' + [...r.querySelectorAll('[data-acc]')].map(x => x.innerText.trim()).join('/'))
  }, daySel)
}
/** Every ground-programme row of a day card on the current surface: its title and person. */
export async function readGround(page, daySel) {
  return page.evaluate(s => {
    const d = document.querySelector(s)
    if (!d) return 'NO DAY'
    return [...d.querySelectorAll('[data-txt^="gr:"][data-txt$=".prog"], [data-bfld^="gr:"][data-bfld$=".prog"], .gp-row .nm, .gr-row .ntx')]
      .map(e => (e.innerText || e.value || '').trim()).filter(Boolean)
  }, daySel)
}

/** THE PHONE'S WAY TO TAKE A MAN OFF A SEAT: pick his puck up and put it down on his own row's text (its
    callsign / role box). drag.ts: "a SEAT puck only lands on a seat or a crew cell — a drop on the row's
    title / timings / remarks falls through and takes it off the seat". Dropping on empty space above can land
    on ANOTHER seat and swap (a driver artefact, seen on Monday's stacked flying lines). */
export async function dragOffSeat(page, seatSel) {
  const seat = page.locator(seatSel).first()
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(200)
  const target = await seat.evaluate(e => {
    const row = e.closest('.sb-line, .sb-arow, .ah-row, .pl-row, .fl-row, tr') || e.parentElement
    const f = row && [...row.querySelectorAll('input[data-bfld], [data-txt]')].find(x => !x.closest('.seat') && !x.closest('[data-fill]') && (x.offsetWidth || x.offsetHeight))
    if (!f) return null
    const r = f.getBoundingClientRect()
    return { x: r.left + Math.min(20, r.width / 2), y: r.top + r.height / 2, what: f.dataset.bfld || f.dataset.txt }
  })
  const b = await seat.boundingBox()
  const x0 = b.x + b.width / 2, y0 = b.y + b.height / 2
  const to = target || { x: x0, y: y0 - 300, what: 'nothing found — 300px up' }
  await page.mouse.move(x0, y0); await page.mouse.down()
  for (let i = 1; i <= 12; i++) { await page.mouse.move(x0 + (to.x - x0) * i / 12, y0 + (to.y - y0) * i / 12); await page.waitForTimeout(30) }
  await page.mouse.up()
  await page.waitForTimeout(600)
  return to.what
}
