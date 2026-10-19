console.log('B s16 v1 (member us/us on a phone: View-only Sched and the read-only board)')
import { launch, open, sleep, shot, elShot, tap, tapFixed, rec, wk, finish, errors } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(800)
await tap(p, wk(p, 3, 'ff:3.0.0.rl')); await p.keyboard.type('0930')
await tap(p, p.locator('#eWeek .day[data-day="3"] .day-head'), { block: 'start' }); await sleep(500)
const saved = await p.evaluate(() => window.DAYS[3].waves[0].formations[0].rl)
console.log('admin typed R saved:', saved)
/* sign out and in as the member, same browser storage */
await tapFixed(p, p.locator('#burger'), 500)
await tapFixed(p, p.locator('button:visible', { hasText: /^Logout$/ }).first(), 900)
await p.waitForSelector('#luser', { state: 'visible', timeout: 10000 })
await p.fill('#luser', 'us'); await p.fill('#lpass', 'us'); await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(900)
await p.addStyleTag({ content: '*{scroll-behavior:auto !important} *{caret-color:transparent !important}' })
const who = await p.evaluate(() => ({ role: document.getElementById('roleBadge')?.textContent?.trim(), page: window.CURPAGE, rlStillThere: window.DAYS[3].waves[0].formations[0].rl }))
console.log('member session:', JSON.stringify(who))
await p.evaluate(() => window.go('viewsched')); await sleep(900)
const view = await p.evaluate(() => { const day = document.querySelector('#vWeek .day[data-day="3"]'); return [...day.querySelectorAll('.go:not(.sa) .form')].slice(0, 2).map(f => { const r = f.querySelector('.bto .rl'); return { r: r && r.textContent, rEditable: r && r.getAttribute('contenteditable'), rBefore: r && getComputedStyle(r, '::before').content, b: f.querySelector('.bto b')?.textContent } }) })
rec('S16a', 'member (us), View-only Sched, Thu wave 1 at 402', 'VL typed R 09:30 shows; RU empty R shows no faint suggestion; not editable', view, view[0].r === '09:30' && view[1].r === '' && view[1].rEditable !== 'true' && (!view[1].rBefore || view[1].rBefore === 'none' || view[1].rBefore.replace(/["s00a0]/g, '') === '') ? 'PASS' : 'FAIL', await elShot(p, '#vWeek .day[data-day="3"] .go', 'B16a-member-view'))
/* a finger tap on the empty R does nothing: no toast, no write, no focus */
const rb = p.locator('#vWeek .day[data-day="3"] .go:not(.sa) .form').nth(1).locator('.bto .rl')
const before = await p.evaluate(() => ({ rl: window.DAYS[3].waves[0].formations[1].rl || '', undoDisabled: document.getElementById('undoBtn')?.disabled }))
await tap(p, rb); await sleep(500)
const after = await p.evaluate(() => ({ rl: window.DAYS[3].waves[0].formations[1].rl || '', undoDisabled: document.getElementById('undoBtn')?.disabled, shownR: [...document.querySelectorAll('#vWeek .day[data-day="3"] .go:not(.sa) .form')][1]?.querySelector('.bto .rl')?.textContent, active: document.activeElement?.tagName, toast: [...document.querySelectorAll('.toast,#toast,[class*=toast]')].filter(e => e.offsetParent !== null && e.textContent.trim()).map(e => e.textContent.trim().slice(0, 60)), text: document.querySelector('#vWeek .day[data-day="3"] .go:not(.sa) .form:nth-of-type(2) .bto .rl')?.textContent }))
rec('S16b', 'member: finger tap on the empty R (RU)', 'nothing placed, nothing saved, no toast', { before, after }, !after.rl && after.toast.length === 0 && after.shownR === '' && after.undoDisabled === before.undoDisabled ? 'PASS' : 'FAIL', await elShot(p, '#vWeek .day[data-day="3"] .go', 'B16b-member-tap'))
/* the read-only board */
const opened = await p.evaluate(d => { try { window.openScheduler(d); return true } catch (e) { return 'threw ' + e.message } }, 3)
await sleep(1200)
const boardInfo = await p.evaluate(() => {
  const sb = document.getElementById('schedBoard')
  if (!sb || sb.offsetParent === null) return { open: false, page: window.CURPAGE }
  const line = [...document.querySelectorAll('#sbBoard .sb-line')][0]
  const rl = line && line.querySelector('[data-bfld$=".rl"]')
  const r = [...document.querySelectorAll('#sbBoard .sb-line')].map(l => { const x = l.querySelector('[data-bfld$=".rl"]'); return x ? { cs: l.querySelector('[data-bfld$=".cs"]')?.value, rl: x.value, ph: x.placeholder, ro: x.readOnly || x.disabled, tag: x.tagName } : null }).filter(Boolean).slice(0, 3)
  return { open: true, lines: r }
})
rec('S16c', 'member: open the read-only board (Thu)', 'typed R 09:30 shown on the first VL line; empty R has no suggestion; boxes not editable', boardInfo, boardInfo.open ? 'RECORD' : 'NOT WALKED', await shot(p, 'B16c-member-board'))
if (boardInfo.open) {
  const R = p.locator('#sbBoard [data-bfld$=".rl"]').nth(2)
  const v0 = await R.evaluate(e => e.value)
  await tap(p, R); await sleep(400)
  const v1 = await R.evaluate(e => ({ value: e.value, rl: window.DAYS[3].waves[0].formations[1].rl, toast: [...document.querySelectorAll('.toast,#toast,[class*=toast]')].filter(e => e.offsetParent !== null && e.textContent.trim()).map(e => e.textContent.trim().slice(0, 60)) }))
  rec('S16d', 'member: finger tap on the empty R in the read-only board', 'nothing placed, no toast', { before: v0, after: v1 }, v1.value === '' && !v1.rl && v1.toast.length === 0 ? 'PASS' : 'FAIL', await shot(p, 'B16d-member-board-tap'))
}
await ctx.close()
await b.close()
await finish('s16')
