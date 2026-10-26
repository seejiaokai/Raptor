// W1 walk — the Leave War small fixes, Item 7: the Post out sheet's date asks before a delete (D1102). VERSION 1
// Run: node scripts/handpass/lws/w1.mjs desktop|phone   (scenario list: docs/handpass/parts/lws/scenarios.md)
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openWorld, tools, ROOT } from './w1-lib.mjs'

const which = process.argv[2] || 'desktop'
const ONLY = (process.env.W1_ONLY || '').split(',').filter(Boolean)
console.log('w1.mjs VERSION 1', which)
const w = await openWorld(which)
const t = tools(w, `w1-${which}`)
const { page, ctx, errors } = w
const PH = which === 'phone'
const H = 'rocky', HC = 'Hex', X = 'sufa', XC = 'Grit', TORCH = 'ignite'
const D0 = t.addDays(0), DM1 = t.addDays(-1), DP1 = t.addDays(1), D10 = t.addDays(10), D11 = t.addDays(11), D20 = t.addDays(20)
console.log('today', D0, 'D10', D10)
const run = id => !ONLY.length || ONLY.includes(String(id))

// ---------------------------------------------------------------- helpers
const SB = '[data-testid="postout-sheet"]'
async function ensureCell(id, iso) {
  const sel = `[data-testid="cell-${id}-${iso}"]`
  if (!(await page.locator(sel).count())) { await t.press(`[data-testid="month-${t.monthOf(iso)}"]`); await page.waitForTimeout(600) }
  for (let i = 0; i < 30 && !(await page.locator(sel).count()); i++) await page.waitForTimeout(150)
  if (!(await page.locator(sel).count())) {
    const other = t.monthOf(t.addDays(-40)); await t.press(`[data-testid="month-${other}"]`); await page.waitForTimeout(500)
    await t.press(`[data-testid="month-${t.monthOf(iso)}"]`); await page.waitForTimeout(700)
    for (let i = 0; i < 30 && !(await page.locator(sel).count()); i++) await page.waitForTimeout(150)
  }
  if (!(await page.locator(sel).count())) throw new Error('no cell ' + sel + ' ' + JSON.stringify(await page.evaluate(i => { const r = document.querySelector('tr[data-testid="row-' + i + '"]'); return { row: !!r, cells: r ? r.querySelectorAll('[data-testid^="cell-"]').length : null, first: r ? r.querySelector('[data-testid^="cell-"]')?.getAttribute('data-testid') : null, rows: document.querySelectorAll('tr[data-testid^="row-"]').length } }, id)))
  await page.locator(sel).first().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  return sel
}
async function tapCell(id, iso) { const sel = await ensureCell(id, iso); await t.press(sel); await page.waitForTimeout(450) }
async function leaveWar() { await t.go('leavewar'); await page.waitForTimeout(500) }
async function openPO(id = H, iso = D10) {
  if (await t.vis(SB)) await closePO()
  await tapCell(id, iso)
  for (let i = 0; i < 20 && !(await t.vis(SB)); i++) await page.waitForTimeout(150)
  if (!(await t.vis(SB))) throw new Error('Post out sheet did not open for ' + id + ' ' + iso)
}
async function chipOn(sel) { return page.locator(sel).first().evaluate(e => ({ cls: e.className, pressed: e.getAttribute('aria-pressed'), on: /\b(on|sel|selected|active|pressed)\b/.test(e.className) || e.getAttribute('aria-pressed') === 'true' || /✓/.test(e.textContent) })).catch(() => null) }
async function st() {
  const sheet = await t.vis(SB)
  if (!sheet) return { sheet: false }
  const go = (await t.vis('[data-testid="postout-delete-go"]')) ? await t.text('[data-testid="postout-delete-go"]') : null
  const c = {}
  for (const k of ['overseas', 'delete', 'sans']) { const r = await chipOn(`[data-testid="postout-${k}"]`); c[k] = r ? r.on : null }
  return { sheet, date: await t.val('[data-testid="postout-date"]'), box: await t.text('[data-testid="postout-date"]'), line: await t.text('[data-testid="postout-line"]'), go, chips: c,
    err: (await t.vis('[data-testid="postout-err"]')) ? await t.text('[data-testid="postout-err"]') : null, blocked: (await t.vis('[data-testid="postout-blocked"]')) ? await t.text('[data-testid="postout-blocked"]') : null }
}
const brief = s => JSON.stringify({ date: s.date, box: s.box, line: s.line, go: s.go, chips: s.chips, err: s.err })
const outcomeOf = s => !s.sheet ? 'no-sheet' : /delet/i.test(s.line || '') ? 'Delete' : /suspend/i.test(s.line || '') ? 'Overseas' : /SANS/.test(s.line || '') ? 'SANS' : 'unknown(' + s.line + ')'
const hexState = () => page.evaluate(() => { const p = window.PEOPLE.rocky; return p ? { cs: p.cs, deleted: !!p.deleted, archived: !!p.archived } : null })
const hexRow = () => page.locator(`tr[data-testid="row-${H}"]`).count()
async function pickPO(iso) { // the Post out sheet's own date box
  const on = await t.pickDate('[data-testid="postout-date"]', iso)
  if (PH && (!on || !on.wholly)) console.log('  NOTE phone calendar not wholly on screen', JSON.stringify(on))
  await page.waitForTimeout(350)
  return on
}
async function closePO() {
  if (await t.vis('[data-testid="dcal-card"]')) { await page.keyboard.press('Escape'); await page.waitForTimeout(250) }
  if (await t.vis('[data-testid="postout-cancel"]')) {
    try { await page.locator('[data-testid="postout-cancel"]').first().click({ timeout: 4000 }) } catch { await page.locator('[data-testid="postout-cancel"]').first().evaluate(e => e.click()) }
    await page.waitForTimeout(300)
  }
}
async function adminUsers() {
  if (await t.vis(SB)) await closePO()
  await t.go('admin')
  for (let i = 0; i < 4 && (await page.evaluate(() => window.CURPAGE)) !== 'admin'; i++) await t.go('admin')
  if ((await page.evaluate(() => window.CURPAGE)) !== 'admin') throw new Error('could not reach Admin')
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(450)
}
async function adminHex() { // the Hex line of Admin → Users (active list), and whether he is in Archived
  await adminUsers()
  await page.fill('#accFind', 'Hex').catch(() => {}); await page.waitForTimeout(300)
  const act = await page.evaluate(() => [...document.querySelectorAll('#accList .acc-main')].map(e => e.innerText.replace(/\n/g, ' | ')).filter(x => /^Hex\b/.test(x)))
  let arch = null
  const tg = page.locator('#accArchToggle')
  if (await tg.count()) {
    if ((await tg.getAttribute('aria-expanded')) !== 'true') await t.press('#accArchToggle')
    arch = await page.evaluate(() => [...document.querySelectorAll('#accArchList .acc-main')].map(e => e.innerText.replace(/\n/g, ' | ')).filter(x => /^Hex\b/.test(x)))
  }
  const people = await page.evaluate(() => { const m = (document.querySelector('#page-admin')?.innerText || '').match(/PEOPLE[^0-9]{1,6}([0-9]+)/i); return m ? +m[1] : null })
  return { act, arch, people }
}
const rec = (id, verdict, seen, pic = '') => t.rec(id, which, verdict, seen, pic)
async function scenario(id, fn) {
  if (!run(id)) return
  console.log(`\n== scenario ${id} (${which})`)
  try { await fn() } catch (e) {
    console.log(String(e.stack).split(String.fromCharCode(10)).slice(0, 8).join(' // '))
    rec(id, 'NOT WALKED', 'script stopped: ' + String(e).split(String.fromCharCode(10))[0].slice(0, 240))
    try { await t.shot(`s${id}-error`) } catch {}
    try { await closePO() } catch {}
  }
}
async function ask(iso = D0) { // open the sheet fresh? no — assumes sheet up; picks a date and returns the state
  await pickPO(iso); return st()
}
const asked = s => !!s.go && /Tap again to delete Hex/.test(s.go)

// ---------------------------------------------------------------- the fixture: a Delete posting on Hex dated today + 10
async function makeFixture() {
  await t.go('leavewar')
  await tapCell(H, D10)
  await t.press('[data-testid="bid-postout"]'); await t.press('[data-testid="po-delete"]')
  console.log('fixture: po-date', await t.val('[data-testid="po-date"]'), '| confirm reads', await t.text('[data-testid="po-confirm"]'))
  await t.press('[data-testid="po-confirm"]')
  const armedTxt = await t.text('[data-testid="po-confirm"]'); console.log('fixture: armed reads', armedTxt)
  await t.press('[data-testid="po-confirm"]'); await page.waitForTimeout(600)
  const fx = await hexState(); console.log('fixture: Hex', JSON.stringify(fx), 'row', await hexRow())
  if (!fx || fx.deleted) throw new Error('fixture failed: Hex gone')
}
await makeFixture()
await openPO()
let s0 = await st(); console.log('fixture sheet:', brief(s0))
await t.shot('fixture-sheet')
if (!(s0.date === D10)) throw new Error('fixture: the sheet reads ' + s0.date + ' not ' + D10)
console.log('chip classes', JSON.stringify(await Promise.all(['overseas', 'delete', 'sans'].map(k => chipOn(`[data-testid="postout-${k}"]`)))))
await closePO()

// ---------------------------------------------------------------- scenario 1
await scenario(1, async () => {
  await openPO()
  let s = await st()
  const pre = s.date === D10 && !s.go && outcomeOf(s) === 'Delete'
  console.log('  start:', brief(s), 'pre-ok', pre)
  await pickPO(D0); s = await st()
  const picAsk = await t.shot('s1-asked')
  const okAsk = s.date === D0 && asked(s) && /21 Oct/.test(s.box) && (s.line || '').length > 0
  const alive = await hexState()
  console.log('  asked:', brief(s), 'Hex', JSON.stringify(alive))
  await closePO()
  await openPO(); const s2 = await st()
  const picRe = await t.shot('s1-reopened')
  const okRe = s2.date === D10 && !s2.go
  const ah = await adminHex()
  const picAdm = await t.shot('s1-admin-users')
  console.log('  admin Hex:', JSON.stringify(ah))
  const okAdm = ah.act.length === 1 && /post/i.test(ah.act[0]) && /delete/i.test(ah.act[0])
  rec(1, pre && okAsk && !alive.deleted && okRe && okAdm ? 'PASS' : 'FAIL',
    `before: date ${s.date === undefined ? '?' : ''}start ${D10} no ask (pre ${pre}); picked today: box "${s.box}" data-value ${s.date}, line "${s.line}", button "${s.go}", Hex deleted=${alive.deleted}; after ✕ and reopen: date ${s2.date}, ask ${s2.go}; Admin → Users Hex line (people count ${ah.people}): ${JSON.stringify(ah.act)}, archived list: ${JSON.stringify(ah.arch)}`,
    `${picAsk}, ${picRe}, ${picAdm}`)
  await leaveWar()
})

// ---------------------------------------------------------------- scenario 11 (a): leave the page while asked
await scenario('11a', async () => {
  await openPO(); await pickPO(D0); let s = await st()
  const wasAsked = asked(s)
  await t.shot('s11a-asked')
  await t.go('editsched'); await page.waitForTimeout(500)
  await leaveWar()
  s = await st()
  const pic = await t.shot('s11a-back')
  const hs = await hexState()
  let after = 'sheet gone after return'
  let ok = !hs.deleted
  if (s.sheet) { after = 'sheet still up: ' + brief(s); ok = ok && !s.go && s.date === D10 }
  // one tap on the page title must not delete
  await page.locator('[data-testid="period-label"]').first().click({ force: true, timeout: 2000 }).catch(() => {}); await page.waitForTimeout(400)
  const hs2 = await hexState()
  // reopen to see the stored posting
  if (await t.vis(SB)) await closePO()
  await openPO(); const s3 = await st(); await closePO()
  ok = ok && wasAsked && !hs2.deleted && s3.date === D10 && !s3.go
  rec('11a', ok ? 'PASS' : 'FAIL', `asked with today: ${wasAsked}; after leaving the page and coming back: ${after}; Hex deleted=${hs2.deleted}; reopened: date ${s3.date}, ask ${s3.go}`, `s11a-asked, ${pic}`)
  await leaveWar()
})

// ---------------------------------------------------------------- scenario 2
await scenario(2, async () => {
  await openPO(); let s = await st()
  await pickPO(DM1); s = await st()
  const pic1 = await t.shot('s2-yesterday-asked')
  const askedY = s.date === DM1 && asked(s)
  console.log('  yesterday:', brief(s))
  await pickPO(DP1); s = await st()
  const pic2 = await t.shot('s2-tomorrow-saved')
  const hs = await hexState()
  const okT = s.date === DP1 && !s.go && !hs.deleted
  console.log('  tomorrow:', brief(s))
  const ah = await adminHex(); const pic3 = await t.shot('s2-admin-tomorrow')
  const tagT = ah.act.length === 1 && /delete/i.test(ah.act[0])
  console.log('  admin:', JSON.stringify(ah.act))
  await leaveWar(); await openPO(H, t.addDays(2)); const sT = await st()
  // put it back to today + 10
  await pickPO(D10); const sB = await st(); const pic4 = await t.shot('s2-back-to-d10')
  const okB = sB.date === D10 && !sB.go
  await closePO()
  rec(2, askedY && okT && tagT && okB ? 'PASS' : 'FAIL',
    `yesterday: box "${t.addDays(-1)}" -> sheet date ${sT ? '' : ''}asked=${askedY}; tomorrow: data-value ${s.date}, box "${s.box}", line "${s.line}", ask ${s.go}, Hex deleted=${hs.deleted}; Admin → Users: ${JSON.stringify(ah.act)}; reopened sheet after tomorrow saved: ${sT.date}; put back: ${sB.date}, ask ${sB.go}`, `${pic1}, ${pic2}, ${pic3}, ${pic4}`)
  await leaveWar()
})

// ---------------------------------------------------------------- scenario 3
await scenario(3, async () => {
  await openPO(); let s = await st()
  const before = brief(s)
  const undoBefore = await page.locator('#undoBtn').evaluate(e => e.disabled).catch(() => null)
  await pickPO(D10); s = await st()
  const pic = await t.shot('s3-same-date')
  const calClosed = !(await t.vis('[data-testid="dcal-card"]'))
  rec(3, s.date === D10 && !s.go && brief(s) === before && calClosed ? 'PASS' : 'FAIL', `calendar opened and ${D10} pressed (calendar closed afterwards: ${calClosed}); sheet before ${before}; after ${brief(s)}`, pic)
  await closePO()
})

// ---------------------------------------------------------------- scenario 5 (the ask-and-pick part; the confirming tap is run in the phone world)
await scenario(5, async () => {
  await openPO(); await pickPO(D0); let s = await st()
  const a1 = asked(s)
  await pickPO(DM1); s = await st()
  const pic = await t.shot('s5-asked-yesterday')
  const ok = s.date === DM1 && asked(s) && a1
  console.log('  after picking yesterday:', brief(s))
  await closePO(); await openPO(); const s2 = await st(); await closePO()
  rec(5, ok && s2.date === D10 && !s2.go ? 'PASS' : 'FAIL', `asked with today (${a1}); then yesterday: box "${s.box}", data-value ${s.date}, ask "${s.go}"; backed out with ✕ and reopened: ${s2.date}, ask ${s2.go}. (the confirming tap is in the phone run)`, pic)
})

// ---------------------------------------------------------------- scenario 6
await scenario(6, async () => {
  await openPO(); await pickPO(D0); let s = await st()
  const a1 = asked(s)
  await pickPO(D20); s = await st()
  const pic = await t.shot('s6-future-while-asked')
  const hs = await hexState()
  const ah = await adminHex()
  console.log('  after picking today+20:', brief(s), 'Hex', JSON.stringify(hs), 'admin', JSON.stringify(ah.act))
  const saved = s.date === D20 && !s.go && !hs.deleted
  rec(6, a1 && saved ? 'PASS' : 'FAIL', `asked with today (${a1}); then picked ${D20} (today + 20): box "${s.box}", data-value ${s.date}, ask "${s.go}", Hex deleted=${hs.deleted}, Admin → Users: ${JSON.stringify(ah.act)} — the future date IS saved with no ask and no delete`, pic)
  await leaveWar(); if (!(await t.vis(SB))) await openPO(H, D20); await pickPO(D10); const sb = await st(); console.log('  put back:', brief(sb)); await closePO()
})

// ---------------------------------------------------------------- scenario 7: a chip while asked
let s7a = null
await scenario('7a', async () => {
  await openPO(); await pickPO(D0); let s = await st(); const a1 = asked(s)
  await t.press('[data-testid="postout-overseas"]'); await page.waitForTimeout(400); s = await st()
  const pic = await t.shot('s7a-overseas-while-asked')
  const ok1 = a1 && !s.go && s.date === D10 && outcomeOf(s) === 'Delete'
  console.log('  after Overseas tap while asked:', brief(s), outcomeOf(s))
  await t.press('[data-testid="postout-overseas"]'); await page.waitForTimeout(500); const s2 = await st()
  const pic2 = await t.shot('s7a-overseas-second-tap')
  const ok2 = s2.date === D10 && !s2.go && outcomeOf(s2) === 'Overseas'
  console.log('  second Overseas tap:', brief(s2), outcomeOf(s2))
  rec('7a', ok1 && ok2 ? 'PASS' : 'FAIL', `asked with today (${a1}); first Overseas tap: ask gone=${!s.go}, box ${s.date}, outcome still ${outcomeOf(s)} (line "${s.line}"); second tap: date ${s2.date}, outcome ${outcomeOf(s2)} (line "${s2.line}")`, `${pic}, ${pic2}`)
})

// ---------------------------------------------------------------- scenario 11 (b): Delete chip armed (stored outcome Overseas), leave the page
await scenario('11b', async () => {
  if (!(await t.vis(SB))) await openPO()
  let s = await st()
  if (outcomeOf(s) !== 'Overseas') throw new Error('stored outcome is not Overseas: ' + outcomeOf(s))
  await t.press('[data-testid="postout-delete"]'); await page.waitForTimeout(350); s = await st()
  const armedNow = asked(s)
  const pic1 = await t.shot('s11b-delete-armed')
  console.log('  Delete chip armed:', brief(s))
  await t.go('editsched'); await page.waitForTimeout(500); await leaveWar()
  s = await st()
  const pic2 = await t.shot('s11b-back')
  let after = 'sheet gone after return'; let ok = true
  if (s.sheet) { after = 'sheet still up: ' + brief(s); ok = !s.go }
  const hs = await hexState()
  if (await t.vis(SB)) await closePO()
  await openPO(); const s3 = await st()
  console.log('  reopened:', brief(s3))
  ok = ok && armedNow && !hs.deleted && !s3.go && outcomeOf(s3) === 'Overseas'
  rec('11b', ok ? 'PASS' : 'FAIL', `Delete chip tapped on an Overseas posting: "Tap again" showed=${armedNow}; after leaving the page and returning: ${after}; Hex deleted=${hs.deleted}; reopened: outcome ${outcomeOf(s3)}, ask ${s3.go}`, `${pic1}, ${pic2}`)
  // restore the Delete outcome (date is in the future, so this saves and deletes nothing yet)
  await t.press('[data-testid="postout-delete"]'); await page.waitForTimeout(300)
  if (await t.vis('[data-testid="postout-delete-go"]')) await t.press('[data-testid="postout-delete-go"]')
  await page.waitForTimeout(500); const sr = await st(); console.log('  restored Delete:', brief(sr), outcomeOf(sr))
  if (outcomeOf(sr) !== 'Delete') console.log('  WARNING Delete outcome not restored')
  await closePO()
})

// ---------------------------------------------------------------- scenario 7 (b, c): the selected Delete chip and SANS back out
await scenario('7bc', async () => {
  await openPO(); let s = await st()
  if (outcomeOf(s) !== 'Delete') throw new Error('outcome is ' + outcomeOf(s))
  await pickPO(D0); s = await st(); const a1 = asked(s)
  await t.press('[data-testid="postout-delete"]'); await page.waitForTimeout(400); s = await st()
  const pic1 = await t.shot('s7b-delete-chip-while-asked')
  const okB = a1 && !s.go && s.date === D10 && outcomeOf(s) === 'Delete'
  console.log('  Delete chip while asked:', brief(s))
  await pickPO(D0); s = await st(); const a2 = asked(s)
  await t.press('[data-testid="postout-sans"]'); await page.waitForTimeout(400); s = await st()
  const pic2 = await t.shot('s7c-sans-while-asked')
  const okC = a2 && !s.go && s.date === D10 && outcomeOf(s) === 'Delete'
  console.log('  SANS chip while asked:', brief(s))
  await closePO()
  rec('7bc', okB && okC ? 'PASS' : 'FAIL', `selected Delete chip while asked: ask gone, date back to ${D10}, outcome still Delete -> ${okB}; SANS while asked: ask gone, date ${s.date}, outcome ${outcomeOf(s)} -> ${okC}`, `${pic1}, ${pic2}`)
})

// ---------------------------------------------------------------- scenario 9: Undo post out while asked
await scenario(9, async () => {
  await openPO(); await pickPO(D0); let s = await st(); const a1 = asked(s)
  await t.press('[data-testid="postout-undo"]'); await page.waitForTimeout(600)
  const hs = await hexState()
  const sheetGone = !(await t.vis(SB))
  await ensureCell(H, D10)
  const struck = await page.locator(`[data-testid="cell-${H}-${D10}"]`).first().evaluate(e => /\bgone\b/.test(e.className))
  const pic1 = await t.shot('s9-after-undo-post-out')
  const ah = await adminHex(); console.log('  admin after undo post out:', JSON.stringify(ah.act))
  const tagGone = ah.act.length === 1 && !/post|delete/i.test(ah.act[0])
  await leaveWar()
  // the top-bar Undo (D350: it does not take back a posting)
  const undoOn = await page.locator('#undoBtn').evaluate(e => !e.disabled).catch(() => null)
  const undoTitle = await page.locator('#undoBtn').getAttribute('title').catch(() => null)
  const pic2 = await t.shot('s9-topbar-undo')
  console.log('  top-bar Undo enabled:', undoOn, 'title:', undoTitle)
  // rebuild the Delete posting through the leave sheet, for the scenarios after this one
  await leaveWar(); await makeFixture(); await openPO(); const sRe = await st(); await closePO()
  console.log('  rebuilt:', brief(sRe))
  const ok = a1 && sheetGone && !hs.deleted && !struck && tagGone
  rec(9, ok ? 'PASS' : 'FAIL', `asked with today (${a1}); Undo post out: sheet gone=${sheetGone}, his day ${D10} still struck=${struck}, Hex deleted=${hs.deleted}, Admin → Users line "${ah.act[0]}" (no posting tag); the top-bar Undo is ${undoOn ? 'enabled' : 'DISABLED'} afterwards — its tooltip: "${undoTitle}" (so the scenario's "top-bar Undo puts the posting back" cannot be walked: by D350 a posting is not undone there); Delete posting rebuilt for the next scenarios: date ${sRe.date}, outcome ${outcomeOf(sRe)}`, `${pic1}, ${pic2}`)
  await leaveWar()
})

// ---------------------------------------------------------------- scenario 14: another man while asked (desktop)
// the other man is Ryder (xray), posted out on the same day as Hex with the non-destructive outcome Overseas
const Y = 'xray', YC = 'Ryder'
await scenario(14, async () => {
  if (PH) { rec(14, 'NOT WALKED', 'desktop only'); return }
  await leaveWar()
  await tapCell(Y, D10)
  await t.press('[data-testid="bid-postout"]'); await t.press('[data-testid="po-overseas"]')
  const yDate = await t.val('[data-testid="po-date"]'); const yBtn = await t.text('[data-testid="po-confirm"]')
  await t.press('[data-testid="po-confirm"]'); await page.waitForTimeout(600)
  const yTag = await page.locator(`[data-testid="cell-${Y}-${D10}"]`).first().evaluate(e => e.className)
  console.log('  Ryder posted out (Overseas) from', yDate, 'button', yBtn, 'cell class', yTag)
  await openPO(); await pickPO(D0); let s = await st(); const a1 = asked(s)
  const ycell = `[data-testid="cell-${Y}-${D10}"]`
  await ensureCell(Y, D10)
  const box = await page.locator(ycell).first().boundingBox()
  const covered = await page.evaluate(([x, y, sel]) => { const e = document.elementFromPoint(x, y); const c = document.querySelector(sel); return !c.contains(e) }, [box.x + box.width / 2, box.y + box.height / 2, ycell])
  const pic0 = await t.shot('s14-hex-asked')
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(450)
  const afterFirst = await st()
  const pic1 = await t.shot('s14-after-first-tap')
  console.log('  covered by scrim:', covered, '| sheet up after first tap:', afterFirst.sheet)
  await t.press(ycell); await page.waitForTimeout(500)
  const s2 = await st(); const pic2 = await t.shot('s14-ryder-sheet')
  console.log('  Ryder sheet:', brief(s2))
  const outY = outcomeOf(s2)
  await t.press('[data-testid="postout-delete"]'); await page.waitForTimeout(350)
  const s3 = await st(); const pic3 = await t.shot('s14-ryder-delete-armed')
  console.log('  Ryder Delete armed:', brief(s3))
  const hs = await hexState(); const ys = await page.evaluate(() => window.PEOPLE.xray)
  const namesHim = !!s3.go && /Tap again to delete Ryder/.test(s3.go) && !/Hex/.test(s3.go)
  await closePO()
  rec(14, a1 && covered && !afterFirst.sheet && s2.sheet && !s2.go && namesHim && !hs.deleted && !ys.deleted ? 'PASS' : 'FAIL',
    `Ryder posted out (${outY}) on ${yDate}; Hex's sheet asked with today (${a1}); Ryder's struck day lay under the scrim (${covered}); first tap: Hex's sheet closed (sheet up after: ${afterFirst.sheet}); second tap opened Ryder's sheet, date ${s2.date}, ask at open ${s2.go}; tapped Delete there: button reads "${s3.go}" (names Ryder, not Hex: ${namesHim}); Hex deleted=${hs.deleted}; Ryder deleted=${!!ys.deleted}`, `${pic0}, ${pic1}, ${pic2}, ${pic3}`)
  // take Ryder's posting off again so later scenarios keep one posted-out man
  await leaveWar(); await tapCell(Y, D10)
  if (await t.vis(SB)) { await t.press('[data-testid="postout-undo"]'); await page.waitForTimeout(500) }
  await leaveWar()
})

// ---------------------------------------------------------------- scenario 19: a member (second page, same world)
await scenario(19, async () => {
  const p2 = await ctx.newPage()
  const e2 = []
  p2.on('pageerror', e => e2.push('pageerror ' + String(e).slice(0, 200)))
  p2.on('console', m => { if (m.type() === 'error') e2.push('console ' + m.text().slice(0, 200)) })
  await p2.setViewportSize({ width: w.W, height: w.H })
  await p2.goto(process.env.HP_URL || 'http://localhost:4292/')
  await p2.fill('#luser', 'us'); await p2.fill('#lpass', 'us'); await p2.click('#loginForm button[type=submit]')
  await p2.waitForSelector('#vWeek .day', { state: 'attached' }); await p2.waitForTimeout(500)
  await p2.evaluate(() => window.go('leavewar')); await p2.waitForTimeout(900)
  const viewer = await p2.evaluate(() => document.querySelector('#roleBadge')?.textContent.trim())
  const seen = await p2.evaluate(() => ({ torch: !!window.PEOPLE.ignite, hexPO: !!document.querySelector('tr[data-testid="row-rocky"] .polast') }))
  const press2 = async sel => { const l = p2.locator(sel).first(); if (PH) await l.tap(); else await l.click(); await p2.waitForTimeout(350) }
  const mon = async iso => { await press2(`[data-testid="month-${t.monthOf(iso)}"]`); await p2.waitForTimeout(700) }
  await mon(D10)
  const hc = `[data-testid="cell-${H}-${D10}"]`
  await p2.locator(hc).first().scrollIntoViewIfNeeded()
  const hStruck = await p2.locator(hc).first().evaluate(e => /\bgone\b/.test(e.className))
  await press2(hc); await p2.waitForTimeout(400)
  const anyPO = async () => p2.evaluate(() => ({ sheet: !!document.querySelector('[data-testid="postout-sheet"]'), chips: !!document.querySelector('[data-testid^="postout-"]'), poBtn: [...document.querySelectorAll('[data-testid]')].filter(e => /postout|po-delete|bid-postout|sel-postout/.test(e.getAttribute('data-testid')) && e.getBoundingClientRect().width > 0).map(e => e.getAttribute('data-testid')), shown: [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && !/^(cell|row|month|dcal|req|avail|fly|ev)/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid')).slice(-14) }))
  const a = await anyPO()
  await p2.screenshot({ path: resolve(ROOT, `docs/img/handpass/2026-10-21-leavewar-small/w1/w1-${which}-s19-member-tap-hex.png`) })
  console.log('  member tapped Hex struck day: struck=', hStruck, JSON.stringify(a))
  await p2.keyboard.press('Escape'); await p2.mouse.click(5, 5).catch(() => {}); await p2.waitForTimeout(300)
  // his own row: Ranger (bane) — a drag over 3 days, no PO row
  const own = `[data-testid="cell-bane-${D0}"]`
  await mon(D0)
  await p2.locator(own).first().scrollIntoViewIfNeeded()
  const b1 = await p2.locator(own).first().boundingBox()
  const cellW = b1.width
  let dragNote = ''
  if (!PH) {
    await p2.mouse.move(b1.x + b1.width / 2, b1.y + b1.height / 2); await p2.mouse.down()
    for (let i = 1; i <= 3; i++) { await p2.mouse.move(b1.x + b1.width / 2 + cellW * i / 3 * 2, b1.y + b1.height / 2, { steps: 4 }); await p2.waitForTimeout(60) }
    await p2.mouse.up(); await p2.waitForTimeout(500)
  } else {
    const cdp = await ctx.newCDPSession(p2)
    const x0 = b1.x + b1.width / 2, y0 = b1.y + b1.height / 2
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] }); await p2.waitForTimeout(450)
    for (let i = 1; i <= 6; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + cellW * i / 3, y: y0 }] }); await p2.waitForTimeout(40) }
    await p2.waitForTimeout(120); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p2.waitForTimeout(600)
  }
  const sel = await p2.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /^(sel|bid|po)/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid')))
  await p2.screenshot({ path: resolve(ROOT, `docs/img/handpass/2026-10-21-leavewar-small/w1/w1-${which}-s19-member-drag.png`) })
  console.log('  member drag selection controls:', JSON.stringify(sel), dragNote)
  const noPO = !sel.some(x => /postout|po-/.test(x))
  const ok = !a.sheet && a.poBtn.length === 0 && noPO && sel.length > 0
  rec(19, ok ? 'PASS' : 'FAIL', `signed in as us (member), same world; Hex's struck day ${D10} (struck=${hStruck}) tapped: Post out sheet ${a.sheet}, PO controls ${JSON.stringify(a.poBtn)}; his own row dragged over days: controls shown ${JSON.stringify(sel)} (no PO among them=${noPO}); page errors ${JSON.stringify(e2)}`, `w1-${which}-s19-member-tap-hex, w1-${which}-s19-member-drag`)
  await p2.close()
})

// ---------------------------------------------------------------- scenario 20: the other two Post out doors
async function drag(a, b, hold = false) { // from cell a to cell b (selectors) on the admin page
  const ba = await page.locator(a).first().boundingBox(), bb = await page.locator(b).first().boundingBox()
  const x0 = ba.x + ba.width / 2, y0 = ba.y + ba.height / 2, x1 = bb.x + bb.width / 2, y1 = bb.y + bb.height / 2
  if (!PH) {
    await page.mouse.move(x0, y0); await page.mouse.down()
    for (let i = 1; i <= 6; i++) { await page.mouse.move(x0 + (x1 - x0) * i / 6, y0 + (y1 - y0) * i / 6, { steps: 3 }); await page.waitForTimeout(50) }
    await page.waitForTimeout(100); await page.mouse.up(); await page.waitForTimeout(500)
  } else {
    const cdp = await ctx.newCDPSession(page)
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] }); await page.waitForTimeout(450)
    for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * i / 8, y: y0 + (y1 - y0) * i / 8 }] }); await page.waitForTimeout(40) }
    await page.waitForTimeout(120); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(600)
  }
}
await scenario(20, async () => {
  // --- the one-day sheet's PO
  await leaveWar()
  await tapCell(X, D0)
  await t.press('[data-testid="bid-postout"]'); await t.press('[data-testid="po-delete"]')
  const d0 = await t.val('[data-testid="po-date"]')
  const conf = '[data-testid="po-confirm"]'
  await t.press(conf); let c = await t.text(conf); const armed1 = /Tap again to delete Grit/.test(c)
  const pic1 = await t.shot('s20a-leave-sheet-armed')
  console.log('  one-day sheet: po-date', d0, 'armed reads', c)
  await t.pickDate('[data-testid="po-date"]', D20); c = await t.text(conf); const dis1 = c === 'Post out'
  const pic2 = await t.shot('s20a-after-date-change'); console.log('  after date change:', c)
  await t.press(conf); c = await t.text(conf); const armed2 = /Tap again/.test(c)
  await t.press('[data-testid="po-overseas"]'); c = await t.text(conf); const dis2 = c === 'Post out'
  const pic3 = await t.shot('s20a-after-chip-change'); console.log('  after chip change:', c)
  await t.press('[data-testid="po-delete"]'); await t.press(conf); c = await t.text(conf); const armed3 = /Tap again to delete Grit/.test(c)
  await t.go('editsched'); await page.waitForTimeout(500); await leaveWar()
  const up = await t.vis(conf); c = up ? await t.text(conf) : '(sheet gone)'
  const pic4 = await t.shot('s20a-after-page-leave'); console.log('  after leaving the page and coming back:', c, 'sheet up', up)
  const takenBack = !up || c === 'Post out'
  const xs = await page.evaluate(() => window.PEOPLE.sufa)
  if (up) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  rec('20a', armed1 && dis1 && armed2 && dis2 && armed3 && takenBack && !xs.deleted ? 'PASS' : 'FAIL',
    `one-day sheet PO on ${XC}, Delete: Post out arms "${armed1 ? 'Tap again to delete Grit' : '?'}"; date change disarms=${dis1}; re-armed=${armed2}; chip change disarms=${dis2}; re-armed=${armed3}; after leaving the page and coming back the button reads "${c}" (sheet still up: ${up}); Grit deleted=${!!xs.deleted}`, `${pic1}, ${pic2}, ${pic3}, ${pic4}`)

  // --- the drag selection's PO
  await leaveWar()
  await ensureCell(X, D0); await ensureCell(X, D0)
  const c0 = `[data-testid="cell-${X}-${D0}"]`, c2 = `[data-testid="cell-${X}-${t.addDays(2)}"]`
  await drag(c0, c2)
  const selIds = () => page.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.getBoundingClientRect().width > 0 && /^(sel|bid|po|postout)/.test(e.getAttribute('data-testid'))).map(e => e.getAttribute('data-testid')))
  let ids = await selIds(); const pic5 = await t.shot('s20b-selection-sheet')
  console.log('  drag selection controls:', JSON.stringify(ids))
  if (!ids.includes('sel-postout')) throw new Error('no sel-postout after drag: ' + JSON.stringify(ids))
  await t.press('[data-testid="sel-postout"]'); await t.press('[data-testid="sel-po-delete"]')
  const sconf = '[data-testid="sel-po-confirm"]'
  await t.press(sconf); c = await t.text(sconf); const sarmed1 = /Tap again to delete Grit/.test(c)
  const pic6 = await t.shot('s20b-selection-armed'); console.log('  selection armed reads', c)
  await t.pickDate('[data-testid="sel-po-date"]', D20); c = await t.text(sconf); const sdis1 = c === 'Post out'; console.log('  after date change', c)
  await t.press(sconf); c = await t.text(sconf); const sarmed2 = /Tap again/.test(c)
  await t.press('[data-testid="sel-po-overseas"]').catch(() => {}); c = await t.text(sconf); const sdis2 = c === 'Post out'; console.log('  after chip change', c)
  await t.press('[data-testid="sel-po-delete"]'); await t.press(sconf); c = await t.text(sconf); const sarmed3 = /Tap again to delete Grit/.test(c)
  await t.go('editsched'); await page.waitForTimeout(500); await leaveWar()
  const sup = await t.vis(sconf); c = sup ? await t.text(sconf) : '(sheet gone)'
  const pic7 = await t.shot('s20b-after-page-leave'); console.log('  selection after leaving page:', c, 'sheet up', sup)
  const stBack = !sup || c === 'Post out'
  const xs2 = await page.evaluate(() => window.PEOPLE.sufa)
  if (sup) { await page.keyboard.press('Escape'); await page.waitForTimeout(300) }
  rec('20b', sarmed1 && sdis1 && sarmed2 && sdis2 && sarmed3 && stBack && !xs2.deleted ? 'PASS' : 'FAIL',
    `drag selection PO on ${XC}: armed="${sarmed1}", date change disarms=${sdis1}, re-armed=${sarmed2}, chip change disarms=${sdis2}, re-armed=${sarmed3}; after leaving the page and coming back the button reads "${c}" (sheet still up: ${sup}); Grit deleted=${!!xs2.deleted}`, `${pic5}, ${pic6}, ${pic7}`)

  // --- two men selected: PO must not be offered
  await leaveWar(); await ensureCell(X, D0)
  await drag(c0, `[data-testid="cell-${H}-${t.addDays(1)}"]`)
  ids = await selIds(); const pic8 = await t.shot('s20c-two-men-selected')
  console.log('  two-men selection controls:', JSON.stringify(ids))
  rec('20c', ids.length > 0 && !ids.includes('sel-postout') ? 'PASS' : 'FAIL', `dragged from ${XC} ${D0} to Hex ${t.addDays(1)}: controls shown ${JSON.stringify(ids)} — PO offered: ${ids.includes('sel-postout')}`, pic8)
  await page.keyboard.press('Escape'); await page.waitForTimeout(300)
})

// ---------------------------------------------------------------- scenario 17: a refused date (earlier than the post-in), on a man added for it (Probey, post-in in 3 days)
// (a first try on Hex, who has no post-in date of his own, showed no refusal at all: the delete ran — see the report)
await scenario(17, async () => {
  const N = 'Probey', D3 = t.addDays(3)
  await adminUsers()
  await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
  await page.fill('#accAddCs', N); await page.fill('#accAddIni', 'PB')
  await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
  await t.pickDate('#accAddPostIn', D3)
  await t.press('#accAdd'); await page.waitForTimeout(600)
  const nid = await t.idOf(N)
  console.log('  added', N, 'id', nid, 'post-in', D3)
  if (!nid) throw new Error('person not added')
  await leaveWar()
  await tapCell(nid, D10)
  await t.press('[data-testid="bid-postout"]'); await t.press('[data-testid="po-delete"]')
  await t.press('[data-testid="po-confirm"]'); await t.press('[data-testid="po-confirm"]'); await page.waitForTimeout(600)
  await openPO(nid, D10); let s = await st(); const before = brief(s); console.log('  Probey sheet:', before)
  await pickPO(DM1); s = await st(); const asked1 = !!s.go && /Tap again to delete Probey/.test(s.go)
  const pic1 = await t.shot('s17-asked-before-post-in'); console.log('  picked', DM1, brief(s))
  await t.press('[data-testid="postout-delete-go"]'); await page.waitForTimeout(700)
  const s2 = await st(); const pic2 = await t.shot('s17-after-tap'); console.log('  after tap:', brief(s2))
  const ps = await page.evaluate(i => ({ deleted: !!window.PEOPLE[i]?.deleted, archived: !!window.PEOPLE[i]?.archived, exists: !!window.PEOPLE[i] }), nid)
  const refused = s2.sheet && !!s2.err && s2.date === D10 && !ps.deleted
  rec(17, refused ? 'PASS' : 'FAIL', `${N} added with post-in ${D3}, posted out Delete on ${D10}; picked yesterday (${DM1}, before his post-in): ask shown ${asked1} ("${s.go}"), box "${s.box.split(String.fromCharCode(10))[0]}"; after the tap: sheet ${s2.sheet ? 'still up' : 'closed'}, refusal sentence "${s2.err}", box ${s2.date}, ask now "${s2.go}"; ${N} deleted=${ps.deleted} archived=${ps.archived}`, `${pic1}, ${pic2}`)
  if (await t.vis(SB)) await closePO()
  await leaveWar()
})

// ---------------------------------------------------------------- scenario 4 (last): confirm the delete
// desktop: ask with today, tap (scenario 4). phone: ask with today, then yesterday, tap (scenario 5's confirming tap, with 4's downstream).
await scenario(PH ? '4+5' : 4, async () => {
  await leaveWar()
  const login = async (u, p) => {
    const p2 = await ctx.newPage(); await p2.goto(process.env.HP_URL || 'http://localhost:4292/')
    await p2.fill('#luser', u); await p2.fill('#lpass', p); await p2.click('#loginForm button[type=submit]')
    await p2.waitForTimeout(1500)
    const ok = (await p2.locator('#vWeek .day').count()) > 0
    const msg = await p2.evaluate(() => (document.querySelector('#loginForm')?.parentElement?.innerText || '').slice(0, 200).replace(/\n/g, ' '))
    await p2.close(); return { ok, msg }
  }
  const pre = await login('hex', 'hex'); console.log('  sign-in before:', JSON.stringify(pre))
  await leaveWar()
  await openPO(); let s = await st(); if (outcomeOf(s) !== 'Delete' || s.date !== D10) throw new Error('not ready: ' + brief(s))
  await pickPO(D0); s = await st(); const a0 = asked(s) && s.date === D0
  const pic0 = await t.shot('s4-asked-today')
  let target = D0
  if (PH) { await pickPO(DM1); s = await st(); target = DM1 }
  const a2 = asked(s) && s.date === target
  const pic1 = await t.shot('s4-asked-final')
  console.log('  asked with', target, ':', brief(s))
  await t.press('[data-testid="postout-delete-go"]'); await page.waitForTimeout(900)
  const sheetGone = !(await t.vis(SB))
  const hs = await hexState()
  const rowOct = await hexRow()
  const classes = await page.evaluate(([id, a]) => { const out = {}; for (const iso of a) { const c = document.querySelector(`[data-testid="cell-${id}-${iso}"]`); out[iso.slice(5)] = c ? c.className.trim() : 'no cell' } return out }, [H, [t.addDays(-3), t.addDays(-2), DM1, D0, DP1, t.addDays(3)]])
  const pic2 = await t.shot('s4-after-delete'); console.log('  after tap: sheet gone', sheetGone, 'Hex', JSON.stringify(hs), 'row in OCT view', rowOct, JSON.stringify(classes))
  await t.press('[data-testid="month-NOV"]'); await page.waitForTimeout(1200)
  const rowNov = await hexRow(); const pic2b = await t.shot('s4-war-november'); console.log('  row in NOV view', rowNov)
  const ah = await adminHex(); const pic3 = await t.shot('s4-admin-users'); console.log('  admin:', JSON.stringify(ah))
  const gone = ah.act.length === 0 && (!ah.arch || ah.arch.length === 0)
  const post = await login('hex', 'hex'); console.log('  sign-in after:', JSON.stringify(post))
  await t.go('editsched'); await page.waitForTimeout(700)
  const sched = await page.evaluate(() => ({ rocky: (JSON.stringify(window.DAYS).match(/"rocky"/g) || []).length, week: window.DAYS.map(d => d.dt).join(',') }))
  const puck = await page.evaluate(() => [...document.querySelectorAll('#eWeek .puck, #vWeek .puck')].filter(e => /Hex/.test(e.textContent)).length)
  const pic4 = await t.shot('s4-schedule-week'); console.log('  schedule:', JSON.stringify(sched), 'Hex pucks on screen', puck)
  await leaveWar()
  const undoOn = await page.locator('#undoBtn').evaluate(e => !e.disabled).catch(() => null)
  const redoOn = await page.locator('#redoBtn').evaluate(e => !e.disabled).catch(() => null)
  if (undoOn) { await t.press('#undoBtn'); await page.waitForTimeout(700) }
  const hs2 = await hexState(); const ah2 = await adminHex(); const pic5 = await t.shot('s4-after-undo')
  console.log('  after Undo (enabled', undoOn, ', redo', redoOn, '): Hex', JSON.stringify(hs2), JSON.stringify(ah2))
  const ok = a0 && a2 && sheetGone && hs && hs.deleted && rowNov === 0 && gone && !post.ok && hs2 && hs2.deleted && ah2.act.length === 0
  rec(PH ? '4+5' : 4, ok ? 'PASS' : 'FAIL', `asked with today (${a0})${PH ? ', then yesterday (' + a2 + ')' : ''}; tapped "Tap again to delete Hex": sheet gone=${sheetGone}, Hex flags deleted=${hs && hs.deleted} archived=${hs && hs.archived}; his row on the war: October ${rowOct ? 'still drawn' : 'gone'}, November ${rowNov ? 'drawn' : 'gone'}; cell classes around the date ${JSON.stringify(classes)}; Admin → Users (people count ${ah.people}) active ${JSON.stringify(ah.act)}, archived ${JSON.stringify(ah.arch)}; sign-in before ${pre.ok}, after ${post.ok}; schedule week ${sched.week}: Hex id occurrences ${sched.rocky}, pucks reading Hex on the Edit Schedule page ${puck}; top-bar Undo ${undoOn ? 'enabled and pressed' : 'disabled (nothing to undo)'}: Hex deleted=${hs2 && hs2.deleted}, Admin → Users ${JSON.stringify(ah2.act)}`, `${pic0}, ${pic1}, ${pic2}, ${pic2b}, ${pic3}, ${pic4}, ${pic5}`)
})

// ---------------------------------------------------------------- finish
console.log('\n--- ' + which + ' results')
for (const r of t.results) console.log(`${r.id}\t${r.size}\t${r.verdict}\t${r.seen}`)
console.log('errors', JSON.stringify(errors))
writeFileSync(resolve(ROOT, `docs/handpass/parts/lws/w1-results-${which}${process.env.W1_TAG || ""}.json`), JSON.stringify({ results: t.results, errors }, null, 1))
await w.browser.close()
