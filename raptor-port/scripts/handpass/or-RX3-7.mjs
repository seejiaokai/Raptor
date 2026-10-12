// RX3-7: the changes window and History ACROSS A RELOAD (RW2-1's steps), then as Ranger.
import * as L from './or-RX3-lib.mjs'
const { j } = L
const out = {}
const { ctx, page: p } = await L.open('ad', 'a')
const mt = (await L.fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: L.ISO, to: L.ISO, timed: ['09:00', '10:00'], title: 'Range brief' }))[0]
const iid = mt.iid
console.log('filed', j(mt))
out.add = await L.addOntoRow(p, 'Tally', iid); console.log('Tally added:', out.add)
out.off = await L.takeOffRow(p, 'Hunter', iid); console.log('Hunter off:', out.off)
// type 11:00 in the end box
await L.toWeek(p)
const ri = await L.rowIdx(p, L.DI, iid)
await L.scrollToSec(p, 'ground')
const e = L.day(p).locator(`[data-txt="gr:${L.DI}.${ri}.end"]`)
await e.scrollIntoViewIfNeeded(); await e.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('11:00'); await e.evaluate(x => x.blur()); await p.waitForTimeout(600)
out.inputsBefore = await L.inputOf(p, iid); console.log('INPUTS before reload:', j(out.inputsBefore))
// open the changes window, All changes, Wed
out.before = await L.openHistoryAllChanges(p, 'Wed'); console.log('BEFORE RELOAD window:', j(out.before))
await L.shot(p, 'rx3-7-1-before-reload')
// RELOAD
out.signedAgain = await L.reload(p)
console.log('RELOADED; the page asked to sign in again:', out.signedAgain)
out.inputsAfter = await L.inputOf(p, iid); console.log('INPUTS after reload:', j(out.inputsAfter))
out.after = await L.openHistoryAllChanges(p, 'Wed'); console.log('AFTER RELOAD window:', j(out.after))
await L.shot(p, 'rx3-7-2-after-reload')
// tap the "added" line, then the "taken out" line
await L.scrollToSec(p, 'ground')
for (const label of ['added', 'taken out']) {
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500)
  const l = p.locator('.chgwin .cw-l', { hasText: new RegExp('15 Jul · ' + label) }).first()
  const cnt = await p.locator('.chgwin .cw-l', { hasText: new RegExp('15 Jul · ' + label) }).count()
  if (!cnt) { console.log('no line for', label); out['tap_' + label] = { missing: true }; continue }
  const txt = (await l.innerText()).replace(/\s+/g, ' ')
  const m2 = await L.toastMark(p)
  await l.click(); await p.waitForTimeout(300)
  const f = await L.flash(p)
  const nm = await L.shot(p, 'rx3-7-3-tap-' + label.replace(' ', ''))
  console.log('TAP', label, JSON.stringify(txt), '-> toast:', await L.toastsSince(p, m2), '| flash:', j(f))
  out['tap_' + label] = { txt, flash: f, pic: nm }
}
// sign out and sign in as Ranger
await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
await L.signOut(p)
await L.signIn(p, 'us', 'us')
console.log('now signed in as Ranger; page:', await p.evaluate(() => window.CURPAGE))
out.rangerPages = await p.evaluate(() => [...document.querySelectorAll('nav a[data-page], a[data-page]')].filter(a => a.offsetParent).map(a => a.getAttribute('data-page')))
console.log('Ranger can see pages:', j(out.rangerPages))
await p.evaluate(() => window.go('editsched')).catch(() => {}); await p.waitForTimeout(800)
out.rangerPage = await p.evaluate(() => window.CURPAGE)
out.histBtn = await p.locator('#histBtn').count() ? await p.locator('#histBtn').isVisible() : 'no #histBtn'
console.log('Ranger: page', out.rangerPage, '| #histBtn:', out.histBtn)
await L.shot(p, 'rx3-7-4-ranger-page')
if (out.histBtn === true) {
  out.ranger = await L.openHistoryAllChanges(p, 'Wed'); console.log('RANGER window:', j(out.ranger))
  await L.shot(p, 'rx3-7-5-ranger-window')
}
// where can Ranger see changes? probe the view-only schedule and the bell
await L.toView(p)
out.rangerView = await p.evaluate(() => ({ top: [...document.querySelectorAll('.topbar button, #topbar button, header button, .topbtns button')].filter(b => b.offsetParent).map(b => b.id + '|' + (b.getAttribute('aria-label') || b.title || b.textContent).trim().slice(0, 30)), chg: [...document.querySelectorAll('#vWeek button, #vWeek .dpend, #vWeek [class*=hist], #vWeek [class*=chg]')].filter(b => b.offsetParent && /chang|pend|hist/i.test(b.className + b.textContent + (b.title || ''))).map(b => b.className + '|' + b.textContent.trim().slice(0, 30)), histAny: !!document.querySelector('#histBtn') }))
console.log('RANGER view-only probe:', j(out.rangerView))
await L.shot(p, 'rx3-7-6-ranger-view-only')
await p.evaluate(() => window.scrollTo(0, 0))
const vb = p.locator('#vWeek .day:not(.peek)').nth(2).locator('.dpendbtn').first()
console.log('Ranger: chip on Wed:', (await vb.count()) ? (await vb.innerText()).trim() : 'none')
if (await vb.count()) {
  await vb.scrollIntoViewIfNeeded(); await vb.click(); await p.waitForTimeout(800)
  out.rangerWin0 = await L.winRead(p); console.log('RANGER window (first tab):', j(out.rangerWin0))
  await L.shot(p, 'rx3-7-8-ranger-window-first')
  const allt = p.locator('.chgwin .win-tab', { hasText: 'All changes' })
  if (await allt.count()) { await allt.first().click(); await p.waitForTimeout(500); const dw = p.locator('.chgwin .cw-day', { hasText: 'Wed' }); if (await dw.count()) { await dw.first().click(); await p.waitForTimeout(500) } }
  out.rangerWin = await L.winRead(p); console.log('RANGER window (All changes / Wed):', j(out.rangerWin))
  await L.shot(p, 'rx3-7-9-ranger-window-all')
  const l = p.locator('.chgwin .cw-l', { hasText: /15 Jul � added/ }).first()
  if (await l.count()) { await p.evaluate(() => window.scrollTo(0, 0)); await l.click(); await p.waitForTimeout(300); out.rangerTap = await L.flash(p); console.log('RANGER tap "added":', j(out.rangerTap), '| toast:', await L.toast(p)); await L.shot(p, 'rx3-7-10-ranger-tap-added') }
  await p.locator('.chgwin .win-x').first().click().catch(() => {}); await p.waitForTimeout(300)
}
const bell = p.locator('#notifyBell:visible').first()
if (await bell.count()) { await bell.click(); await p.waitForTimeout(600); out.rangerBell = await p.evaluate(() => { const l = document.querySelector('.bell-list'); return l ? [...l.querySelectorAll('.bl-line, .bl-empty')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) : 'no list' }); console.log('RANGER bell:', j(out.rangerBell)); await L.shot(p, 'rx3-7-7-ranger-bell') }
console.log('ERRORS', L.errs.join(' | ') || 'none')
L.saveRes('7', out)
await ctx.close(); await L.browser.close()
