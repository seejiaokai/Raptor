/* W6 — R30 for the MEMBER: on View-only Sched's working draft of published Friday the head reads "1 pending" (seen in
   w6-06). Is it the pending list (D169 — members see the changes, from View-only Sched, by opening the working copy)?
   Tap it, read what opens, and tap its line. Desktop and phone. Reads and taps only.
   Usage (from raptor-port/): node scripts/handpass/ab/w6-07-member-pending.mjs */
process.env.AB_WHO = 'rewalk/w6'
const L = await import('./ab-lib.mjs')
const W4 = await import('./w4-lib.mjs')
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor--claude-worktrees-absence-record-d147-af6a50/88ce3848-856b-4e60-84e4-7a09da4979d8/scratchpad/w6'
const R = L.resultBook('W6-member-pending', `${L.ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-w6-07-member-pending.txt`)
for (const ph of [false, true]) {
  const tag = `${ph ? 'phone' : 'desktop'}-member`
  const o = await W4.openW4({ phone: ph, who: 'a', state: `${SCR}/world.json` })
  const page = o.page
  await L.relogin(page, 'm')
  await L.go(page, 'viewsched'); await page.waitForTimeout(400)
  const day = '#vWeek .day[data-day="4"]'
  await page.locator(`#vWeek select[data-vwork="4"]:visible`).first().selectOption('working'); await page.waitForTimeout(700)
  await L.frame(page, day)
  const chip = await page.evaluate(d => { const c = document.querySelector(`${d} .dpend`); return c ? { tag: c.tagName, pendlist: c.getAttribute('data-pendlist'), text: c.innerText.trim(), title: c.title } : null }, day)
  let list = null
  if (chip && chip.pendlist != null) {
    const sel = `${day} [data-pendlist="4"]`
    if (ph) await W4.fingerTap(page, sel); else await page.locator(sel).first().click()
    await page.waitForTimeout(500)
    list = await page.evaluate(() => { const b = document.querySelector('#pendList'); return b ? { text: b.innerText.replace(/\s+/g, ' ').slice(0, 300), items: [...b.querySelectorAll('.pl-item')].map(e => (e.tagName === 'BUTTON' ? '[tap] ' : '[still] ') + e.innerText.replace(/\s+/g, ' ').trim()) } : null })
  }
  await L.shot(page, `w6-${tag}-R30-05-member-working-draft-pending`)
  R.note(`${tag}-chip`, chip)
  R.note(`${tag}-list`, list)
  /* D169 (members see the changes, from View-only Sched's working copy) is DECIDED and filed as the one changes window,
     `[DRAFT-PENDING]` — not built. Recorded, not judged: today the member's "N pending" is a label. */
  R.note(`${tag}-R30-member`, { asBuilt: chip && chip.pendlist == null ? 'a plain label, not the list' : 'the list', chip, list, filed: '[DRAFT-PENDING] (D169)' })
  R.note(`${tag}-errors`, o.errors.slice(0, 5))
  await o.browser.close()
}
R.save()
