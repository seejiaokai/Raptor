// v0b — a probe of v0's lead: the ☰ menu's squadron list reads open, yet the picture shows no rows. Where is it drawn?
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, grant, finish, note, facts } from './vlib.mjs'
console.log('v0b-probe-list v1')
picsFor('v0b-' + (process.env.SZ || 'p'))
await serve()
try {
  const s = await newPage(process.env.SZ || 'p')
  await signIn(s, 'ad', 'a')
  await step('grant', () => grant(s, 'bane', '149', 'view'))
  await as(s, 'us', 'us')
  await step('probe', async () => {
    await openMenu(s)
    await press(s, '#drawerSqnBtn', '01-mark')
    facts.geom = await s.page.evaluate(() => {
      const l = document.querySelector('#drawerSqnList')
      if (!l) return 'no list'
      const cs = getComputedStyle(l), b = l.getBoundingClientRect()
      const rows = [...l.querySelectorAll('.sqm-row')].map(r => { const rb = r.getBoundingClientRect(); const at = document.elementFromPoint(rb.left + rb.width / 2, rb.top + rb.height / 2); return { box: [rb.left, rb.top, rb.width, rb.height].map(Math.round), atMid: at ? `${at.tagName}.${at.className}` : null } })
      const pan = document.querySelector('#drawer .drawer-panel').getBoundingClientRect()
      const anc = []; let p = l.offsetParent; while (p) { anc.push(`${p.tagName}#${p.id}.${p.className}`); p = p.offsetParent; if (anc.length > 3) break }
      return { box: [b.left, b.top, b.width, b.height].map(Math.round), position: cs.position, top: cs.top, display: cs.display, z: cs.zIndex, vis: cs.visibility, op: cs.opacity, overflowPanel: getComputedStyle(document.querySelector('#drawer .drawer-panel')).overflow, panel: [pan.left, pan.top, pan.width, pan.height].map(Math.round), offsetParents: anc, rows }
    })
    note(JSON.stringify(facts.geom))
    await pic(s, '02-list-open')
    await s.page.evaluate(() => document.querySelector('#drawer .drawer-panel').scrollTo(0, 0))
  })
  await s.ctx.close()
} finally { finish('v0b'); await stop() }
