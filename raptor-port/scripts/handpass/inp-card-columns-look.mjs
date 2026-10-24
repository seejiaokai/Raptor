// [INP-CARD-COLUMNS] (his D1305, 24 Oct 26): the Inputs list's cards on a phone, TODAY beside two ways of lining up the
// marks at a card's top right (LATE, "No document", the hours) — each one stylesheet or one move laid over the real page and
// named on the picture (D1222). The build of claude/lw-m3-placing-leave served at 4311. Usage: node inp-card-columns-look.mjs
import * as L from './lw-m3-follow-lib.mjs'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const OUT = path.resolve('docs/img/handpass/2026-10-24-inp-card-columns')
mkdirSync(OUT, { recursive: true })
const clip = { x: 0, y: 140, width: 402, height: 560 }
const shot = (P, name) => P.screenshot({ path: path.join(OUT, name + '.png'), scale: 'device', clip })
const label = (P, text) => P.evaluate(text => {
  document.querySelectorAll('.mock-lab').forEach(e => e.remove())
  const d = document.createElement('div'); d.className = 'mock-lab'; d.textContent = text
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', bottom: '180px', zIndex: 99999, background: '#0b3b46', color: '#bff3ff', border: '1px solid #38c6e4', borderRadius: '7px', padding: '5px 9px', font: '600 11px system-ui, sans-serif', pointerEvents: 'none' })
  document.body.appendChild(d)
}, text)

/* A — three columns, every card the same: LATE (or OIL?) · the document · the hours, each column its own width, an empty
   one keeping its room. The marks themselves unchanged. */
const A = `
#inList .icard-corner { display: grid !important; grid-template-columns: 3.7em 7.4em 5.6em; column-gap: .6em; align-items: center; }
#inList .icard-corner > * { grid-row: 1; }
#inList .icard-corner .sd-late, #inList .icard-corner .oiltag { grid-column: 1; justify-self: end; }
#inList .icard-corner .icard-nodoc, #inList .icard-corner .icard-doc { grid-column: 2; justify-self: end; }
#inList .icard-corner .icard-hrs { grid-column: 3; justify-self: end; }`
/* B — two columns on the top line (LATE · the hours); "No document" moves to the card's second line, at its right end,
   where "By Saber" stands — a card with no second line gains one. */
const B = `
#inList .icard-corner { display: grid !important; grid-template-columns: 38px 64px; column-gap: 6px; align-items: center; }
#inList .icard-corner > * { grid-row: 1; }
#inList .icard-corner .sd-late, #inList .icard-corner .oiltag { grid-column: 1; justify-self: end; }
#inList .icard-corner .icard-hrs { grid-column: 2; justify-self: end; }
#inList .mock-docline { display: flex; justify-content: flex-end; }`
const moveDoc = P => P.evaluate(() => {
  for (const c of document.querySelectorAll('#inList .icard')) {
    const nd = c.querySelector('.icard-corner .icard-nodoc'); if (!nd) continue
    let words = c.querySelector('.icard-words')
    if (!words) { words = document.createElement('div'); words.className = 'icard-words mock-docline'; c.appendChild(words) }
    nd.style.marginLeft = 'auto'; words.appendChild(nd)
  }
})
const wide = P => P.addStyleTag({ content: '#inList .icard { font-size: 114% } #inList .icard-hrs, #inList .icard-nodoc, #inList .sd-late, #inList .icard-who, #inList .icard-kind { font-size: 1.14em !important }' })

for (const [name, css, move, big] of [['today', '', false, false], ['a', A, false, false], ['b', B, true, false], ['a-wide', A, false, true], ['today-wide', '', false, true]]) {
  const w = await L.newCtx('phone'); const P = w.page
  await L.signIn(w, 'admin')
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(700)
  await P.click('#inListBtn'); await P.waitForTimeout(400)
  await P.click('#inRangeBtn'); await P.waitForTimeout(300); await P.click('#inRangeAll'); await P.waitForTimeout(700)
  if (css) await P.addStyleTag({ content: css })
  if (move) await moveDoc(P)
  if (big) await wide(P)
  await P.waitForTimeout(200)
  const text = {
    today: 'Today: each mark stands where the words before it end',
    a: 'Drawn in (A): three columns: LATE · document · hours, the same place on every card',
    b: 'Drawn in (B): LATE · hours on the top line; "No document" on the second line, at the right',
    'a-wide': 'A with an iPhone\'s wider letters (about 1.14×)',
    'today-wide': 'Today with an iPhone\'s wider letters (about 1.14×)',
  }[name]
  await label(P, text)
  /* every mark of a kind at one x, card to card — measured */
  const xs = await P.evaluate(() => {
    const col = sel => [...new Set([...document.querySelectorAll(`#inList ${sel}`)].filter(e => e.getBoundingClientRect().top < 700).map(e => Math.round(e.getBoundingClientRect().right)))]
    const h = [...document.querySelectorAll('#inList .icard')].slice(0, 10).map(c => Math.round(c.getBoundingClientRect().height))
    return { late: col('.sd-late'), nodoc: col('.icard-nodoc'), hrs: col('.icard-hrs'), heights: h }
  })
  console.log(name, JSON.stringify(xs))
  await shot(P, name)
  await w.ctx.close()
}
await L.closeBrowser()
