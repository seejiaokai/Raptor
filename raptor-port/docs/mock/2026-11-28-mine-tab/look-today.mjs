// Chat 195, 28 Nov 26 — his question: "assuming u just gonna add Mine to my current app, where u gonna put it".
// Step 1: picture today's Inputs page and Leave War tops as a member (Ranger), both sizes, and list their tab rows.
// Run from raptor-port/: node docs/mock/2026-11-28-mine-tab/look-today.mjs --size d|p
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
process.env.RC_LIB = '1'
const R = await import('../2026-11-27-war-window-states/rollcall-today.mjs')
const { PW, PHONE, sleep, signIn } = R
const IMG = path.join(HERE, 'img')
const b = await PW.chromium.launch()
const ctx = await b.newContext(PHONE
  ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
  : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
const errs = []; p.on('pageerror', e => errs.push(String(e)))
await signIn(p, 'us', 'us')
const sz = PHONE ? 'phone' : 'desktop'
for (const page of ['inputs', 'leavewar']) {
  await p.evaluate(pg => window.go(pg), page); await sleep(page === 'leavewar' ? 3000 : 1200)
  await p.screenshot({ path: `${IMG}/today-${page}-${sz}.png` })
  const tabs = await p.evaluate(() => [...document.querySelectorAll('[role=tab], .tabs button, .tab, nav button')]
    .filter(e => e.offsetParent).map(e => `${e.tagName}.${e.className} | ${e.textContent.trim().slice(0, 30)}`).slice(0, 30))
  console.log(page, JSON.stringify(tabs, null, 1))
}
// Step 2: the proposal drawn on the real Inputs page — a "Mine" tab first in its tab row (Mine · Inputs · SANS · Medical),
// cloned from the app's own Inputs tab (its icon swapped for a person mark), lit as the page opens on it for a member;
// outlined dashed yellow as new (D1222). Nothing under src changes.
await p.evaluate(pg => window.go(pg), 'inputs'); await sleep(1200)
await p.evaluate(phone => {
  const tabs = [...document.querySelectorAll('button.intab')].filter(e => e.offsetParent)
  const first = tabs[0]
  const mine = first.cloneNode(true)
  // the lit look rides aria-selected: the new Mine tab lit, the real Inputs tab unlit, as SANS is
  mine.setAttribute('aria-selected', 'true'); first.setAttribute('aria-selected', 'false')
  const icon = mine.querySelector('svg')
  if (icon) icon.outerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>'
  for (const n of mine.childNodes) if (n.nodeType === 3 && n.textContent.trim()) n.textContent = 'Mine'
  const lab = [...mine.querySelectorAll('span')].find(s => s.textContent.trim() === 'Inputs'); if (lab) lab.textContent = 'Mine'
  mine.style.outline = '3px dashed #ffd400'; mine.style.outlineOffset = '-1px'
  first.parentNode.insertBefore(mine, first)
  // on a phone four tabs drop their icons, as the Leave War's four tabs already do on a narrow phone
  // (leavewar/ui/balances.css), so Medical's badges stay inside the row
  if (phone) for (const t of first.parentNode.querySelectorAll('button.intab svg')) t.style.display = 'none'
}, PHONE)
await sleep(300)
await p.screenshot({ path: `${IMG}/mine-inputs-${sz}.png` })
const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
console.log('sideways scroll after adding the tab:', wide)
console.log(errs.length ? 'errors: ' + errs.join(' | ') : 'no errors')
await b.close()
