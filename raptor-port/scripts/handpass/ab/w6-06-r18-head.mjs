/* W6 — R18, the pictures of what the working draft SAYS: published Friday's head on View-only Sched, as issued and as
   the working draft, for the admin and the member, at both widths (the walk's own pictures frame the Unavailable rows).
   Usage (from raptor-port/): node scripts/handpass/ab/w6-06-r18-head.mjs */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const R = L.resultBook('W6-R18-head', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w6-06-r18-head.txt`)
for (const [ph, who] of [[false, 'a'], [true, 'a'], [false, 'm'], [true, 'm']]) {
  const tag = `${ph ? 'phone' : 'desktop'}-${who === 'a' ? 'admin' : 'member'}`
  const o = await W4.openW4({ phone: ph, who: 'a', state: `${SCR}/world.json` })
  const page = o.page
  if (who === 'm') await L.relogin(page, 'm')
  await L.go(page, 'viewsched'); await page.waitForTimeout(400)
  const day = '#vWeek .day[data-day="4"]'
  /* the head's words WITHOUT the version picker's own options (it lists "Working draft — not issued" in both states) */
  const head = async () => page.evaluate(d => { const s = document.querySelector(d); const h = (s.querySelector('.day-head') || s).cloneNode(true); h.querySelectorAll('select').forEach(x => x.remove())
    return { head: h.textContent.replace(/\s+/g, ' ').trim().slice(0, 200), picked: (s.querySelector('select[data-vwork]') || {}).selectedOptions?.[0]?.text || '', bar: (s.querySelector('.dprev-bar') || {}).innerText?.replace(/\s+/g, ' ') || '' } }, day)
  await L.frame(page, day)
  const h0 = await head()
  await L.shot(page, `w6-${tag}-R18-03-head-as-issued`)
  const sel = page.locator(`#vWeek select[data-vwork="4"]:visible`).first()
  await sel.selectOption('working'); await page.waitForTimeout(700)
  await L.frame(page, day)
  const h1 = await head()
  await L.shot(page, `w6-${tag}-R18-04-head-working-draft`)
  R.ck(`${tag}-R18-head`, !/Working draft/.test(h0.head + h0.bar) && /Working draft/.test(h1.head + h1.bar) && /not issued/.test(h1.bar), 'as issued the head carries no draft words; the working draft says "Viewing Working draft — not issued · the issued schedule is Original"', { h0, h1 })
  R.note(`${tag}-errors`, o.errors.slice(0, 5))
  await o.browser.close()
}
R.save()
