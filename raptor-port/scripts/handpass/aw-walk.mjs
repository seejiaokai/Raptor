/* [ALL-AVAIL-WINDOW] — THE FULL-TIER WALK (bug-check-order §7), 23 Sep 26.
   The real production bundle, the everything-Saturday built through the app's
   own controls (fixture.mjs) plus the owner's own D38 case, driven through
   every roll-call surface of the counter's window and the orders that matter,
   at desktop and then phone width in the SAME world. Pictures go to
   docs/img/handpass/2026-09-23-allavail-window/; results print as one JSON so
   the evidence sheet can quote them. A step that throws is recorded and the
   walk goes on — a failed step is a finding, not a reason to stop looking.

   Run: HP_SHOTS=<pictures dir> node scripts/handpass/aw-walk.mjs
   (the build served on :4173 — `npm run build`, then the raptor-walk preview) */
import { open, go, board, tap, type, put, shot, oilMode, publish } from './lib.mjs'
import { buildSaturday } from './fixture.mjs'

const DI = 5
const R = {}
const step = async (name, fn) => {
  try { R[name] = await fn() } catch (e) { R[name] = { THREW: String(e && e.message || e).slice(0, 300) } }
}

const { browser, page, errors } = await open({ width: 1440, height: 900 })

/* the window as a person reads it — and whether it is ON TOP where it sits */
const win = () => page.evaluate(() => {
  const w = document.querySelector('.availwin:not([hidden])')
  if (!w) return { open: false }
  const r = w.getBoundingClientRect()
  const at = (el) => { if (!el) return false; const b = el.getBoundingClientRect()
    const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); return !!h && w.contains(h) }
  const P = window.PEOPLE
  return {
    open: true,
    title: (w.querySelector('.win-ttl')?.childNodes[0]?.textContent || '').trim(),
    sub: (w.querySelector('.win-ttl small')?.textContent || '').trim(),
    tabs: [...w.querySelectorAll('.win-tab')].map(t => (t.textContent || '').trim() + (t.classList.contains('on') ? ' [on]' : '')),
    one: (w.querySelector('.win-one')?.textContent || '').trim(),
    rows: [...w.querySelectorAll('.rpuck')].map(x => ({ id: x.dataset.awp, cs: (P[x.dataset.awp] || {}).cs,
      flag: x.classList.contains('clash') ? 'RED' : x.classList.contains('flagged') ? 'AMBER' : '',
      why: (x.querySelector('.rwhy')?.textContent || '').slice(0, 110),
      switch: !!x.querySelector('[data-oilp]') })),
    lost: (w.querySelector('.win-lost')?.textContent || '').trim(),
    from: (w.querySelector('.win-from')?.textContent || '').trim(),
    foot: (w.querySelector('.win-foot')?.textContent || '').trim(),
    rect: { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
    onTop: { bar: at(w.querySelector('.win-ttl')), body: at(w.querySelector('.win-body')) },
  }
})
/* the chip of a row, found by the row's own id — never by position */
const itemOf = (kind, match) => page.evaluate(([k, m]) => {
  const d = window.DAYS[5]
  const rows = k === 'ground' ? d.ground : k === 'prog' ? d.allhands : k === 'duty' ? d.dutywaves[0].rows : []
  const r = rows.find(x => (x.prog || x.role || '') === m)
  return r && r.rid ? `r:${r.rid}` : null
}, [kind, match])
const openChip = async (item, where = '#schedBoard') => {
  const sel = `${where} [data-oilsent="${item}"]:visible`
  const c = page.locator(sel).first()
  await c.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  await c.click({ timeout: 4000 })
  await page.waitForTimeout(350)
  return win()
}
const tapMan = async (id) => {
  await page.locator(`.availwin .rpuck[data-awp="${id}"] .puck`).first().click({ timeout: 4000 })
  await page.waitForTimeout(350)
}
const closeWin = async () => { if (await page.locator('.availwin:not([hidden]) .win-x').count()) { await page.click('.availwin .win-x'); await page.waitForTimeout(250) } }
const toastText = () => page.evaluate(() => { const t = document.getElementById('toastEl'); return t && t.style.opacity !== '0' ? t.textContent : '' })
const selLit = (id) => page.evaluate(i => document.querySelectorAll(`#schedBoard .puck.sel[data-person="${i}"], #eWeek .puck.sel[data-person="${i}"]`).length, id)

/* ---- 0. the everything-Saturday, through the app's own controls ---------- */
await step('0-build', async () => {
  const log = await buildSaturday(page, DI)
  /* THE OWNER'S OWN CASE (D36 + D38): COBRA lands 15:30, so Ridge and Grit are
     free from dekit at 16:00 — and an ALL AVAIL ops brief at 16:00 sits inside
     their 15:30–17:30 debrief. They must appear, FLAGGED. */
  await tap(page, `[data-gradd="${DI}"]`)
  const gi = await page.evaluate(() => window.DAYS[5].ground.length - 1)
  await type(page, `[data-bfld="gr:${DI}.${gi}.prog"]`, 'OPS BRIEF')
  await type(page, `[data-bfld="gr:${DI}.${gi}.str"]`, '16:00')
  await type(page, `[data-bfld="gr:${DI}.${gi}.end"]`, '17:00')
  log.push('OPS BRIEF ' + await put(page, `[data-fill="g:${DI}.${gi}.+"]`, ['allavail']))
  /* and a placeholder on the SDO desk's extras line, so a duty desk is walked */
  log.push('SDO extras ' + await put(page, `[data-fill="d:${DI}.0.0.+"]`, ['allavail']))
  return log.filter(l => /FAILED/.test(l)).length ? log : 'all placed'
})
const OPS = await itemOf('ground', 'OPS BRIEF')
const FAM = await itemOf('prog', 'FAMILY DAY')
const SDO = await itemOf('duty', 'SDO')
R.items = { OPS, FAM, SDO }

/* ---- 1. the board, desktop: S1 on top, S2 the debrief flag --------------- */
await step('1-board-ops', async () => { const w = await openChip(OPS); await shot(page, '01-desk-board-ops-window'); return w })
await step('2-tap-flagged-man', async () => {
  const w0 = await win()
  const flagged = (w0.rows || []).find(r => r.flag)
  if (!flagged) return { note: 'no flagged man to tap', rows: w0.rows }
  await tapMan(flagged.id)
  const w = await win()
  const lit = await selLit(flagged.id)
  await shot(page, '02-desk-tap-flagged-selects')
  return { tapped: flagged.cs, foot: w.foot, litOnBoard: lit }
})
await step('3-drag-then-edit-behind', async () => {
  const b = await page.locator('.availwin .win-ttl').boundingBox()
  await page.mouse.move(b.x + 8, b.y + 6); await page.mouse.down()
  await page.mouse.move(b.x - 300, b.y + 120, { steps: 6 }); await page.mouse.up()
  const moved = (await win()).rect
  /* he goes on editing BEHIND it (D38): type into the SDO desk's remarks */
  await type(page, `[data-bfld="dr:${DI}.0.0.rmk"], [data-bfld="dr:${DI}.0.0.rmks"]`, 'walk check').catch(() => {})
  const after = await win()
  await shot(page, '03-desk-dragged-and-edited-behind')
  return { moved, after: after.rect, stillOpen: after.open }
})
/* re-walk after the final reads: F1 — a row whose end is cleared behind the
   window says WHY nobody is worked out, never "no puck any more" */
await step('3b-end-cleared-behind', async () => {
  const gi = await page.evaluate(() => window.DAYS[5].ground.findIndex(x => x.prog === 'OPS BRIEF'))
  await type(page, `[data-bfld="gr:${DI}.${gi}.end"]`, '')
  const w = await win()
  await shot(page, '03b-desk-end-cleared-window-says-why')
  await type(page, `[data-bfld="gr:${DI}.${gi}.end"]`, '17:00')
  const back = await win()
  return { lost: w.lost, one: w.one, backRows: (back.rows || []).length }
})
await step('4-close-reopen-corner', async () => {
  await closeWin()
  const w = await openChip(OPS)
  return { rect: w.rect }
})
await step('5-programme-and-desk', async () => {
  await closeWin()
  const a = await openChip(FAM); await shot(page, '05a-desk-programme-window'); await closeWin()
  const b = await openChip(SDO); await shot(page, '05b-desk-duty-extras-window'); await closeWin()
  return { programme: { title: a.title, n: (a.rows || []).length, one: a.one }, desk: { title: b.title, n: (b.rows || []).length, one: b.one } }
})

/* ---- 2. the earn mode: the window IS the door (D38/D65), S6, S7 --------- */
await step('6-mode-on-earn-tab', async () => {
  await oilMode(page, true)
  const w = await openChip(OPS)
  await shot(page, '06-desk-mode-earn-tab')
  return { tabs: w.tabs, switchable: (w.rows || []).filter(r => r.switch).length, rows: (w.rows || []).length }
})
await step('7-switch-one-off', async () => {
  const w0 = await win()
  const man = (w0.rows || []).find(r => r.switch)
  if (!man) return 'no switchable man'
  const selBefore = await page.evaluate(() => window.SELID || null)
  await tapMan(man.id)
  const w = await win()
  const hist = await page.evaluate(() => window.elogRows(5).slice(0, 3).map(r => r.lbl))
  const selAfter = await page.evaluate(() => window.SELID || null)
  await shot(page, '07-desk-switched-off-history')
  return { man: man.cs, foot: w.foot, history: hist, selectedBefore: selBefore, selectedAfter: selAfter }
})
await step('8-masked-row-refusal', async () => {
  await closeWin()
  await tap(page, `[data-oilitem="${OPS}"]`)
  const w = await openChip(OPS)
  const man = (w.rows || [])[0]
  const before = await page.evaluate(() => JSON.stringify(window.DAYS[5].oild || {}))
  if (man) await tapMan(man.id)
  const t = await toastText()
  const after = await page.evaluate(() => JSON.stringify(window.DAYS[5].oild || {}))
  await shot(page, '08-desk-masked-refusal-toast')
  await closeWin()
  await tap(page, `[data-oilitem="${OPS}"]`)          // the row back on
  return { toast: t, wrote: before !== after }
})

/* ---- 3. publish; the issued face; a version's earn half is read-only ---- */
await step('9-publish', async () => {
  await oilMode(page, false)
  await closeWin()
  return publish(page, DI)
})
await step('10-view-page-closes-and-issued-face', async () => {
  await openChip(OPS)
  await go(page, 'viewsched')
  const closedByPage = !(await win()).open
  const vchip = await page.locator(`#vWeek .day[data-day="${DI}"] [data-oilsent="${OPS}"]`).count()
  let w = null
  if (vchip) { w = await openChip(OPS, `#vWeek .day[data-day="${DI}"]`); await shot(page, '10-desk-viewpage-issued-window') }
  await go(page, 'editsched')
  const closedBack = !(await win()).open
  return { closedByPage, vchip, window: w && { title: w.title, n: (w.rows || []).length, from: w.from, flagged: (w.rows || []).filter(r => r.flag).map(r => r.cs + ':' + r.flag) }, closedBack }
})

/* ---- 4. S14: the row deleted behind it, then Undo ------------------------ */
await step('11-row-deleted-then-undo', async () => {
  await board(page, DI)
  await openChip(FAM)
  const pi = await page.evaluate(() => window.DAYS[5].allhands.findIndex(x => x.prog === 'FAMILY DAY'))
  await tap(page, `[data-pdel="${DI}.${pi}"]`)
  const gone = await win()
  await shot(page, '11a-desk-row-deleted-window-says-so')
  await page.click('#sbUndo'); await page.waitForTimeout(500)
  const back = await win()
  await shot(page, '11b-desk-undo-brings-it-back')
  await closeWin()
  return { gone: { open: gone.open, lost: gone.lost, one: gone.one }, back: { open: back.open, n: (back.rows || []).length, lost: back.lost } }
})

/* ---- 5. D66: a week change and a logout close it ------------------------- */
await step('12-week-change-closes', async () => {
  await openChip(OPS)
  const wk = page.locator('#schedBoard [data-sbweek="1"]:visible').first()
  if (!(await wk.count())) return 'no week arrow on the board'
  await wk.click(); await page.waitForTimeout(700)
  const closed = !(await win()).open
  await page.locator('#schedBoard [data-sbweek="-1"]:visible').first().click().catch(() => {})
  await page.waitForTimeout(700)
  return { closed }
})

/* ---- 6. the PHONE, same world ------------------------------------------- */
await step('13-phone-bottom-panel', async () => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.waitForTimeout(500)
  await board(page, DI)
  const w = await openChip(OPS)
  await shot(page, '13-phone-window-bottom-panel')
  return { rect: w.rect, onTop: w.onTop, rows: (w.rows || []).length, flagged: (w.rows || []).filter(r => r.flag).map(r => r.cs) }
})
await step('14-phone-tap-and-toast', async () => {
  await oilMode(page, true).catch(() => {})
  await closeWin()
  await tap(page, `[data-oilitem="${OPS}"]`).catch(() => {})
  const w = await openChip(OPS)
  const man = (w.rows || [])[0]
  if (man) await tapMan(man.id)
  const t = await toastText()
  const toastOnTop = await page.evaluate(() => { const t = document.getElementById('toastEl'); if (!t) return null
    const b = t.getBoundingClientRect(); const h = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
    return { visible: t.style.opacity !== '0', z: getComputedStyle(t).zIndex, overWindow: !!document.querySelector('.availwin')?.contains(h) ? 'window on top' : 'toast on top' } })
  await shot(page, '14-phone-masked-toast-over-window')
  await tap(page, `[data-oilitem="${OPS}"]`).catch(() => {})
  await oilMode(page, false).catch(() => {})
  return { toast: t, toastOnTop }
})
await step('15-logout-closes', async () => {
  await closeWin()
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(400)
  await board(page, DI)
  await openChip(OPS)
  await page.evaluate(() => document.getElementById('logout')?.click())
  await page.waitForTimeout(500)
  await page.fill('#luser', 'us'); await page.fill('#lpass', 'us')
  await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(900)
  return { memberSeesWindow: (await win()).open }
})

R.errors = errors.slice(0, 20)
console.log(JSON.stringify(R, null, 1))
await browser.close()
