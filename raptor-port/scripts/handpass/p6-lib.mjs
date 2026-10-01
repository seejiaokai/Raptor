/* [DB-READINESS] group A phase 6 (a), (b), (d) — the FULL check's walk driver (30 Sep 26, D467).

   Built on the group walk's driver (dbrA-lib.mjs: every row a step wrote named by its change-log batch; a reload gives the
   state back and writes nothing) and walker W1's gestures (dbrA-W1-lib.mjs). Two things are added here:
   - THE CLOCK is fixed (Wed 15 Jul 26, 09:00) — a delete's cutoff is the later of its date and today (D304), and the demo
     weeks are July; with the real date every demo day would lie before it.
   - SCREEN FACTS: each step records what the screen said (the day heads, the pending lists, the OIL switches, the warnings)
     into `facts`; the same script runs against this branch AND the build just before phase 6 (commit 0d1a5e18), and
     p6-compare.mjs lays the two side by side — phase 6 promised that nothing on screen changes, so any difference is a
     finding or one of the plan's §8 two.
   Env: HP_URL (the served build), HP_SHOTS (pictures), HP_OUT (the JSON), HP_TAG ('p6' or 'base'). */
import { writeFileSync } from 'node:fs'
export const TAG = process.env.HP_TAG || 'p6'
export const TODAY = new Date(2026, 6, 15, 9, 0, 0)
export async function boot() {
  const L = await import('./dbrA-lib.mjs')
  const W = await import('./dbrA-W1-lib.mjs')
  return { L, W }
}
export const facts = {}
export function fact(k, v) { facts[k] = v; console.log(`FACT  ${k} = ${JSON.stringify(v).slice(0, 300)}`) }
export function saveFacts(path) { writeFileSync(path, JSON.stringify({ tag: TAG, facts }, null, 1)) }

/* open a fresh world (its own context — its own storage) at the fixed date, signed in */
export async function world(L, { phone = !!process.env.HP_PHONE, who = 'a' } = {}) {
  const browser = await L.launch()
  const ctx = await L.context(browser, { phone })
  await ctx.clock.setFixedTime(TODAY)
  const errors = []
  const p = await L.page(ctx, errors)
  await L.signIn(p, who)
  return { browser, ctx, p, errors }
}

/* a request filed through the Inputs page's own form, with times (fileReq in the W2 driver files all-day only) */
export async function fileTimed(L, p, { person, type, iso, from, to, remarks }) {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  if (await p.locator('#icClose:visible').count()) { await p.locator('#icClose').click(); await L.sleep(300) }
  const before = await p.evaluate(() => window.INPUTS.map(x => x.iid))
  if (person && await p.locator('#inPerson').count()) await p.selectOption('#inPerson', person)
  await p.selectOption('#inType', type)
  const cal = '#inCal'
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const p2 = n => String(n).padStart(2, '0')
  const walk = async (d) => {
    for (let i = 0; i < 40 && !(await p.locator(`${cal} [data-cal="${d}"]`).count()); i++) {
      const [m, y] = (await p.locator(`${cal} .rc-mon`).first().textContent()).trim().split(/\s+/)
      const at = `${y}-${p2(MONS.indexOf(m.slice(0, 3)) + 1)}`
      await p.locator(`${cal} button[aria-label="${at < d.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
      await L.sleep(80)
    }
    await p.locator(`${cal} [data-cal="${d}"]`).first().click(); await L.sleep(140)
  }
  await walk(iso)
  if ((await p.locator('#inDates').textContent()).includes('→')) await walk(iso)
  if (await p.locator('#inAllday').count()) { if (await p.locator('#inAllday').isChecked()) await p.locator('#inAllday').click() }
  if (from != null && await p.locator('#inStartT').count()) { await p.locator('#inStartT').fill(from); await p.locator('#inStartT').blur() }
  if (to != null && await p.locator('#inEndT').count()) { await p.locator('#inEndT').fill(to); await p.locator('#inEndT').blur() }
  await p.locator('#inRemarks').fill(remarks || '')
  await p.locator('#inAdd').click()
  await L.sleep(700)
  for (let i = 0; i < 3; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { await nodoc.click(); await L.sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await L.sleep(600); continue }
    break
  }
  return p.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid)[0] || null }, before)
}
/* the request's ✎ editor on the Inputs page: change its person, save (answers the OIL / document asks) */
export async function handOver(L, p, iid, to) {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  const btn = p.locator('#inRangeBtn')
  if ((await btn.getAttribute('aria-expanded')) !== 'true') { await btn.click(); await L.sleep(250) }
  await p.locator('#inRangeAll').click(); await L.sleep(350)
  const pen = p.locator(`#inBody tr[data-iid="${iid}"] [data-edit]`).first()
  if (!(await pen.count())) return 'no pencil on the row'
  await pen.scrollIntoViewIfNeeded(); await pen.click(); await L.sleep(400)
  const sel = p.locator('#inBody tr.ined [data-ed="person"]').first()
  if (!(await sel.count())) return 'no person box in the editor'
  await sel.selectOption(to)
  await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700)
  for (let i = 0; i < 2; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await L.sleep(500) }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await L.sleep(600) }
  }
  return 'saved'
}
/* the OIL Earn mode on the open board: its pucks (who, item, on) */
export async function oilPucks(p) {
  return p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilp]')].filter(e => e.offsetParent !== null)
    .map(e => ({ who: e.dataset.oilp, item: e.dataset.oilitem, on: e.classList.contains('on') && !e.classList.contains('off') })))
}
export async function oilIsOn(p) { return p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !!b && [...b.querySelectorAll('[data-oilitem]')].some(e => e.offsetParent !== null) }) }
export async function oilButton(L, p) {
  const b = p.locator('#sbOil:visible, #schedBoard [data-oilmode]:visible').first()
  if (!(await b.count())) return 'NO OIL BUTTON'
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await L.sleep(700)
  return 'pressed'
}
export async function oilTap(L, p, who, item) {
  const x = p.locator(`#schedBoard [data-oilp="${who}"][data-oilitem="${item}"]:visible`).first()
  if (!(await x.count())) return 'no such puck'
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(120); await x.click(); await L.sleep(600)
  return 'tapped'
}
/* the stored day row and the request row, parsed */
export async function stored(p, key) { return p.evaluate(k => { const v = localStorage.getItem('raptor:' + k); try { return v == null ? null : JSON.parse(v) } catch (e) { return v } }, key) }
/* every warning line on screen for a day of the edit week / board (the checks list text) */
export async function warnText(p, di) {
  return p.evaluate(i => {
    const b = document.querySelector('#schedBoard')
    const scope = b && b.offsetWidth ? b : document.querySelector(`#eWeek .day[data-day="${i}"]`)
    return scope ? [...scope.querySelectorAll('.wline, .warnrow, .chk-item, [data-warn]')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 40) : null
  }, di)
}

/* an all-day request over a range (from → to), filed through the Inputs page's own form */
export async function fileRange(L, p, { person, type, fromIso, toIso, remarks }) {
  if ((await p.evaluate(() => window.CURPAGE)) !== 'inputs') await L.go(p, 'inputs')
  await p.waitForSelector('#inRangeBtn', { timeout: 8000 })
  if (await p.locator('#icClose:visible').count()) { await p.locator('#icClose').click(); await L.sleep(300) }
  const before = await p.evaluate(() => window.INPUTS.map(x => x.iid))
  if (person && await p.locator('#inPerson').count()) await p.selectOption('#inPerson', person)
  await p.selectOption('#inType', type)
  const cal = '#inCal'
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const p2 = n => String(n).padStart(2, '0')
  const walk = async (d) => {
    for (let i = 0; i < 40 && !(await p.locator(`${cal} [data-cal="${d}"]`).count()); i++) {
      const [m, y] = (await p.locator(`${cal} .rc-mon`).first().textContent()).trim().split(/\s+/)
      const at = `${y}-${p2(MONS.indexOf(m.slice(0, 3)) + 1)}`
      await p.locator(`${cal} button[aria-label="${at < d.slice(0, 7) ? 'Next' : 'Previous'} month"]`).first().click()
      await L.sleep(80)
    }
    await p.locator(`${cal} [data-cal="${d}"]`).first().click(); await L.sleep(140)
  }
  await walk(fromIso)
  if ((await p.locator('#inDates').textContent()).includes('→')) await walk(fromIso)
  if (toIso && toIso !== fromIso) await walk(toIso)
  if (await p.locator('#inSpan').count()) await p.locator('#inSpan [data-span="all"]').click().catch(() => {})
  else if (await p.locator('#inAllday').count()) { if (!(await p.locator('#inAllday').isChecked())) await p.locator('#inAllday').click() }
  await p.locator('#inRemarks').fill(remarks || '')
  await p.locator('#inAdd').click()
  await L.sleep(700)
  for (let i = 0; i < 3; i++) {
    const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nodoc.count()) { await nodoc.click(); await L.sleep(500); continue }
    const conf = p.locator('[data-testid="oilconf"]:visible')
    if (await conf.count()) { await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await L.sleep(600); continue }
    break
  }
  return p.evaluate(ids => { const s = new Set(ids); return window.INPUTS.filter(x => !s.has(x.iid)).map(x => x.iid)[0] || null }, before)
}
/* a Personal Inputs card's button on the OPEN BOARD of day di (dest 'g' → Ground / Accept, 'u' → Unavail, 'x' Undo) for
   request iid — the panel folds to one line by default; its header opens it, as a person does */
export async function accBtn(L, p, di, iid, dest) {
  await W_boardOn(p, di)
  const fold = p.locator(`#schedBoard [data-pitog="${di}"]:visible`).first()
  const sel = `#schedBoard .accb[data-acc="${dest}"][data-accd="${di}"][data-acck="${iid}"]`
  if (!(await p.locator(sel).count()) && await fold.count()) { await fold.click(); await L.sleep(400) }
  const b = p.locator(sel).first()
  if (!(await b.count())) return 'no such button'
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150)
  await b.click(); await L.sleep(700)
  return 'pressed'
}
/* the ✕ on a request's landed ground row, on the open board of day di — takes it off the programme (acc 'r') */
export async function dropLanded(L, p, di, iid) {
  await W_boardOn(p, di)
  const ri = await p.evaluate(([d, i]) => (window.DAYS[d].ground || []).findIndex(r => r.src === i), [di, iid])
  if (ri < 0) return 'no landed row'
  const x = p.locator(`#schedBoard [data-grdel="${di}.${ri}"]:visible`).first()
  if (!(await x.count())) return 'no ✕'
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await x.click(); await L.sleep(700)
  return 'removed'
}
async function W_boardOn(p, di) {
  const open = await p.evaluate(() => (document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth ? window.SBDAY : null))
  if (open === di) return
  if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') { await p.evaluate(() => window.go('editsched')); await p.waitForTimeout(500) }
  await p.evaluate(d => window.openScheduler(d), di)
  await p.waitForSelector('#schedBoard', { timeout: 8000 }); await p.waitForTimeout(600)
}
/* the Amendments panel (Edit Schedule): its line and the clear-marks button */
export async function alPanel(p) {
  return p.evaluate(() => {
    const a = document.querySelector('#alPanel'), d = document.querySelector('#alDrop')
    return { line: a ? (a.querySelector('.al-pend')?.innerText || '').trim() : null, drop: d ? { disabled: d.disabled, title: d.title } : null,
      days: a ? [...a.querySelectorAll('.al-pubdays > *')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).slice(0, 8) : [] }
  })
}
/* the pending / changes list a day's count opens (the one changes window), its lines */
export async function changesList(L, p, di) {
  const c = p.locator(`#eWeek .day[data-day="${di}"] .dpend`).first()
  if (!(await c.count())) return null
  await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await c.click(); await L.sleep(600)
  const tabs = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); return w ? [...w.querySelectorAll('.win-tab')].map(t => t.innerText.replace(/\s+/g, ' ').trim()) : null })
  const out = p.locator('.chgwin:not([hidden]) .win-tab', { hasText: 'To go out' }).first()
  if (await out.count()) { await out.click(); await L.sleep(300) }
  const lines = await p.evaluate(() => { const w = document.querySelector('.chgwin:not([hidden])'); if (!w) return null; const body = w.querySelector('.cw-list, .win-body, .cw-body') || w; return body.innerText.split(/\n/).map(t => t.trim()).filter(Boolean).slice(0, 40) })
  const x = p.locator('.chgwin:not([hidden]) .win-x').first()
  if (await x.count()) { await x.click().catch(() => {}); await L.sleep(300) }
  return { tabs, lines }
}
