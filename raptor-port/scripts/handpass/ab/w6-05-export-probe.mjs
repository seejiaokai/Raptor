/* W6 — probe: where the schedule's export buttons sit on View-only Sched for the member (a click timed out): they
   belong to the Edit Schedule page — is that page drawn for a member? Reads and pictures only. */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const who = process.argv[2] || 'm'
const o = await W4.openW4({ phone: false, who: 'a', state: `${SCR}/world.json` })
const page = o.page
if (who === 'm') await L.relogin(page, 'm')
await L.go(page, 'viewsched')
await page.evaluate(() => window.scrollTo(0, 0))
const info = await page.evaluate(() => {
  const pe = document.getElementById('page-editsched'), pv = document.getElementById('page-viewsched')
  const box = e => { if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { top: Math.round(b.top), h: Math.round(b.height), display: cs.display, vis: cs.visibility, ov: cs.overflow, hidden: e.hidden } }
  return { edit: box(pe), view: box(pv), docH: document.documentElement.scrollHeight, vh: innerHeight, CURPAGE: window.CURPAGE,
    buttons: [...document.querySelectorAll('#exportSched, #exportPdf')].map(e => ({ id: e.id, top: Math.round(e.getBoundingClientRect().top), anc: [...(function* (x) { while (x) { yield x; x = x.parentElement } })(e)].slice(0, 6).map(a => a.tagName + (a.id ? '#' + a.id : '') + '.' + String(a.className).slice(0, 20) + '[' + getComputedStyle(a).display + ']').join(' < ') })) }
})
console.log(JSON.stringify(info, null, 1))
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.waitForTimeout(400)
await L.shot(page, `w6-desktop-${who}-viewsched-bottom`)
await o.browser.close()
