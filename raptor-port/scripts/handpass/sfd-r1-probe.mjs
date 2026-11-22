// sfd-r1 probe: how the next-week preview draws a man's puck (read only; no state set through the bridge).
import './sfd-r1-env.mjs'
const L = await import('./sfd-w1-lib.mjs')
const { SIZES, mk, world, signIn, go, sleep } = L
console.log('sfd-r1-probe v1')
const W = mk('probe', SIZES.d)
const { b, p } = await world(SIZES.d, W, '2026-07-15T09:00:00')
await signIn(p, 'ad', 'a'); await go(p, 'editsched'); await sleep(500)
const r = await p.evaluate(() => {
  const peeks = [...document.querySelectorAll('#eWeek section.day.peek')]
  const d = peeks[0]
  if (!d) return { n: 0, other: [...document.querySelectorAll('[class*="peek"]')].slice(0, 5).map(e => e.tagName + '.' + e.className) }
  const hexes = [...d.querySelectorAll('*')].filter(e => e.children.length === 0 && /^Hex$/.test((e.textContent || '').trim())).map(e => ({ tag: e.tagName, cls: e.className, par: e.parentElement.outerHTML.slice(0, 300) }))
  return { n: peeks.length, cls: d.className, attrs: [...d.attributes].map(a => a.name + '=' + a.value), hexes: hexes.slice(0, 3), anyPerson: d.querySelectorAll('[data-person]').length }
})
console.log(JSON.stringify(r, null, 1))
await b.close()
