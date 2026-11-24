// trk-probe-users v1 — for 2b's one-tab form: with 149 picked and an unsaved chart edit, can Hunter reach his own row in
// Admin → Users? Reads the rows the Users list draws and whether Hunter's (prowler) is there and pressable.
//   node raptor-port/scripts/handpass/n162/trk-probe-users.mjs d|p
import { SZ, mk, run, fact, press, go, hunterOn149, addEvent, shots, where } from './trk-lib.mjs'
await run('trk-probe-users', async () => {
  const s = await mk()
  await hunterOn149(s)
  await addEvent(s, 'TRKU')
  await go(s, 'admin')
  if (await s.page.locator('.adm-back:visible').count()) await press(s, '.adm-back', 'Admin back')
  const c = s.page.locator('#page-admin button.adm-cat', { has: s.page.locator('.adm-cat-l', { hasText: /^Users/ }) })
  fact(`probe.${SZ}.usersTile`, await c.count())
  if (await c.count()) await press(s, c.first(), 'Users tile')
  fact(`probe.${SZ}.where`, await where(s))
  fact(`probe.${SZ}.rows`, await s.page.evaluate(() => [...document.querySelectorAll('[data-person]')].map(e => { const b = e.getBoundingClientRect(); return `${e.dataset.person}:${b.width > 0 && b.height > 0 ? 'drawn' : 'not-drawn'}` })))
  fact(`probe.${SZ}.prowlerTap`, await s.page.evaluate(() => { const t = document.querySelector('[data-person="prowler"] .acc-tap'); if (!t) return 'absent'; const b = t.getBoundingClientRect(); return { box: [b.left, b.top, b.width, b.height].map(Math.round), disabled: !!t.disabled, text: t.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) } }))
  await shots(s, `trk-probe-users-${SZ}`, '[data-person="prowler"]')
  await s.ctx.close()
})
