/* H-03 — the Logic page: the row under "Leave, downchit and personal inputs" about a seat with no times yet; found by the page's search on
   "no times"; readable, no clipped words, at desktop and at phone width; the warning rows above it unchanged. Run once desktop, once with HP_PHONE=1. */
import * as T from './bta-B-lib.mjs'
const { K, B, L, W, sleep, R, pic } = T
const P = T.PHONE ? 'ph' : 'dk'
const t = T.mk('h03')
const { browser, p, errors } = await K.fresh()
const group = () => p.evaluate(() => {
  const h = [...document.querySelectorAll('#lgBody h2')].find(e => /Leave, downchit and personal inputs/i.test(e.textContent))
  if (!h) return null
  const g = h.parentElement
  return { sub: (g.querySelector('.gsub') || {}).innerText || '', rows: [...g.querySelectorAll('.lgrule')].map(r => ({ tier: ((r.querySelector('.tier') || {}).innerText || '').trim(), text: (r.querySelector('.lgtxt') || r).innerText.replace(/\s+/g, ' ').trim(), shown: r.offsetParent !== null })) }
})
const clip = () => p.evaluate(() => {
  const rows = [...document.querySelectorAll('#lgBody .lgrule')].filter(r => r.offsetParent !== null && /no times/i.test(r.innerText))
  const vw = innerWidth
  return { pageScrollsSideways: document.documentElement.scrollWidth > vw + 1, vw, rows: rows.map(r => {
    const tx = r.querySelector('.lgtxt') || r; const b = tx.getBoundingClientRect(); const cs = getComputedStyle(tx)
    const kids = [...r.querySelectorAll('*')].filter(e => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible')
    return { text: tx.innerText.replace(/\s+/g, ' ').trim(), left: Math.round(b.left), right: Math.round(b.right), fitsWindow: b.left >= 0 && b.right <= vw + 1, overflow: cs.overflowX, ellipsis: cs.textOverflow, clippedParts: kids.length, rowH: Math.round(r.getBoundingClientRect().height) }
  }) }
})
try {
  await L.go(p, 'logic'); await sleep(800)
  const full = await group()
  const idx = full ? full.rows.findIndex(r => /no times yet/i.test(r.text)) : -1
  t.add(`H03-${P}.1`, 'the Logic page opened, no search: the group "Leave, downchit and personal inputs" — its rows in order', full ? `group intro "${full.sub.slice(0, 120)}"; ${full.rows.length} rows: ` + full.rows.map((r, i) => `${i + 1}. [${r.tier}] ${r.text.slice(0, 110)}`).join(' | ') : 'group not found', idx >= 0 ? 'RECORDED' : 'FAIL')
  await p.evaluate(() => { const h = [...document.querySelectorAll('#lgBody h2')].find(e => /Leave, downchit and personal inputs/i.test(e.textContent)); if (h) h.scrollIntoView({ block: 'start' }) }); await sleep(300)
  const gpic = await pic(p, 'logic-group')
  t.add(`H03-${P}.2`, 'that group scrolled to the top of the window, no search', full ? `new row is row ${idx + 1} of ${full.rows.length}; rows above it: ${full.rows.slice(0, Math.max(idx, 0)).map(r => `[${r.tier}] ${r.text.slice(0, 70)}`).join(' | ')}` : 'n/a', 'RECORDED', [gpic])

  await p.locator('#lgSearch').fill('no times'); await sleep(700)
  const count = await p.locator('#lgCount').innerText()
  const c = await clip()
  const sp = await pic(p, 'logic-search')
  const hit = c.rows.find(r => /absence/i.test(r.text))
  t.add(`H03-${P}.3`, `search box: "no times" typed (${count})`, JSON.stringify(c).slice(0, 1800), hit && /whole day/i.test(hit.text) && /part of the day|part-day|only part/i.test(hit.text) ? 'PASS' : 'FAIL', [sp])
  t.add(`H03-${P}.4`, 'the new row, word for word', hit ? hit.text : 'not found', hit ? 'RECORDED' : 'FAIL')
  t.add(`H03-${P}.5`, 'no clipped words and no sideways page scroll', `page scrolls sideways: ${c.pageScrollsSideways}; ${c.rows.map(r => `fits window ${r.fitsWindow}, overflow ${r.overflow}, ellipsis ${r.ellipsis}, clipped parts ${r.clippedParts}, height ${r.rowH}px`).join(' | ')}`, !c.pageScrollsSideways && c.rows.every(r => r.fitsWindow && r.clippedParts === 0) ? 'PASS' : 'FAIL', [sp])
  /* the row's own picture */
  const rowShot = await T.picEl(p, '#lgBody .lgrule:has-text("still checked against an absence")', `logic-row-${P}`, { pad: 10, maxH: 800 })
  t.add(`H03-${P}.6`, 'a close picture of the row', 'see picture', 'RECORDED', [rowShot])
  await p.locator('#lgSearch').fill(''); await sleep(400)
} catch (e) { R(`H03-${P}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 'h03-X')]) }
R(`H03-${P}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-h03')
