// draw-trk-probe v1 — which pages the member view offers Hunter (149 picked, the Tracker edit held), and whether the
// Tracker's cover can be reached: on 149, and after "Discard"-free ways back to 142 are not taken. Read only.
//   node raptor-port/docs/mock/2026-11-24-msq-night-questions/draw-trk-probe.mjs desk|phone
import { SZ, mk, run, fact, press, roleSwitch, hunterOn149, addEvent, where, shut } from '../../../scripts/handpass/n162/trk-lib.mjs'
await run('draw-trk-probe', async () => {
  const s = await mk()
  await hunterOn149(s); await addEvent(s, 'TRKA')
  fact(`${SZ}.admin.tabs`, await s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page], #drawerNav a[data-page]')].filter(a => !a.hidden).map(a => a.dataset.page)))
  await roleSwitch(s)
  await s.page.waitForFunction(() => /Back to the admin view/.test((document.querySelector('#roleBadge')?.getAttribute('title') || '') + (document.querySelector('#drawerRole')?.textContent || '')), null, { timeout: 10000 })
  fact(`${SZ}.member.where`, await where(s))
  fact(`${SZ}.member.tabs`, await s.page.evaluate(() => [...document.querySelectorAll('#topnav a[data-page], #drawerNav a[data-page]')].map(a => `${a.dataset.page}:${a.hidden ? 'hidden' : (a.getBoundingClientRect().width > 0 ? 'shown' : 'not-drawn')}`)))
  fact(`${SZ}.member.coverInDom`, await s.page.evaluate(() => { const b = document.querySelector('[data-testid="trk-cover-band"]'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : null }))
  if (!s.desk) { await press(s, '#burger', '☰'); fact(`${SZ}.member.drawerItems`, await s.page.evaluate(() => [...document.querySelectorAll('#drawerNav a[data-page]')].filter(a => !a.hidden && a.getBoundingClientRect().width > 0).map(a => a.textContent.trim()))); await shut(s) }
  await s.ctx.close()
})
