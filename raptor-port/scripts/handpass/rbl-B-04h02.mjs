/* H-02 — the Logic page, group "Crew rest": the new row, found by the page's search on "take-off"; readable, not clipped.
   Env HP_PHONE=1 for 390x844. */
import * as K from './rbl-B-lib.mjs'
const { B, W, L, R, pic, picEl, sleep } = K
const sz = B.PHONE ? 'phone' : 'desktop'
const ID = `H02-${sz}`
K.cleanPics(['h02'])
const { browser, p, errors } = await K.fresh()
async function rows() {
  return p.evaluate(() => {
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const out = []
    for (const g of document.querySelectorAll('#page-logic .lggrp')) {
      out.push({ g: (g.querySelector('h2,h3,.lgh,.lg-gh') || {}).innerText || '', n: g.querySelectorAll('.lgrow, .lg-row, [data-lgrow]').length })
    }
    return out
  })
}
try {
  await L.go(p, 'logic'); await sleep(400)
  const full = await p.evaluate(() => { const r = document.querySelector('#page-logic') || document.body; return { cls: r.className, id: r.id, kids: [...r.children].slice(0, 8).map(e => e.tagName + '.' + e.className + '#' + e.id) } })
  console.log('LOGIC ROOT', JSON.stringify(full))
  /* the full Crew rest group, as painted, with the search empty */
  const grp = await p.evaluate(() => {
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const hs = [...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /^Crew rest$/.test((e.innerText || '').trim()))
    return hs.map(h => ({ tag: h.tagName, cls: h.className, parent: h.parentElement ? h.parentElement.className : '', next: h.parentElement ? t(h.parentElement).slice(0, 200) : '' }))
  })
  console.log('GROUP HEADS', JSON.stringify(grp).slice(0, 1500))
  const s = p.locator('#lgSearch')
  await s.click(); await s.fill(''); await p.keyboard.type('take-off', { delay: 30 }); await sleep(600)
  const found = await p.evaluate(() => {
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const vis = e => e.offsetParent !== null && getComputedStyle(e).display !== 'none'
    const page = document.querySelector('#page-logic') || document.body
    const rowsAll = [...page.querySelectorAll('.lgrule')].filter(vis)
    return { n: rowsAll.length, rows: rowsAll.map(e => ({ cls: e.className, text: t(e), sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight })), body: t(page).slice(0, 1800), docOverflowX: document.documentElement.scrollWidth > innerWidth + 1, vw: innerWidth }
  })
  const shot1 = await B.pic(p, 'h02-search-take-off')
  console.log(JSON.stringify(found).slice(0, 3000))
  const rowN = found.rows.find(r => /no take-off yet/i.test(r.text))
  const txt = rowN ? rowN.text : '(the new row was not among the rows the search showed)'
  const hasRow = !!rowN && /not measured/i.test(txt) && /Brief/.test(txt) && /In-time \/ Rally/.test(txt) && /earlier/i.test(txt) && /neither breaks crew rest nor hides a breach/i.test(txt)
  /* is every word of the new row inside its box? check descendants overflow */
  const clip = await p.evaluate(() => {
    const page = document.querySelector('#page-logic') || document.body
    const bad = []
    for (const e of page.querySelectorAll('*')) {
      if (e.offsetParent === null) continue
      const cs = getComputedStyle(e)
      if ((cs.overflowX === 'hidden' || cs.overflowX === 'clip' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 1 && (e.innerText || '').length > 20) bad.push({ cls: String(e.className).slice(0, 40), sw: e.scrollWidth, cw: e.clientWidth, text: (e.innerText || '').slice(0, 60) })
    }
    const el = [...page.querySelectorAll('*')].filter(e => e.offsetParent !== null && e.children.length === 0 && /no take-off yet/i.test(e.innerText || ''))[0]
    let r = null, inView = null
    if (el) { const b = el.getBoundingClientRect(); r = [Math.round(b.left), Math.round(b.right), Math.round(b.top), Math.round(b.bottom)]; inView = b.left >= 0 && b.right <= innerWidth + 1 }
    return { bad, rowRect: r, withinWidth: inView, vw: innerWidth, dox: document.documentElement.scrollWidth > innerWidth + 1 }
  })
  console.log('CLIP', JSON.stringify(clip))
  /* the row itself, as a picture (scrolled to) */
  const elp = p.locator('#page-logic >> text=/no take-off yet/i').first()
  let shot2 = null
  if (await elp.count()) { await elp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); shot2 = await B.pic(p, 'h02-row') }
  R(`${ID}.1`, `${sz}: Logic page, typed "take-off" in the search box`,
    `rows shown ${found.n}; text mentions "no take-off yet" / "not measured" / Brief / In-time / Rally / earlier: ${hasRow}; clipped boxes: ${JSON.stringify(clip.bad)}; row rect ${JSON.stringify(clip.rowRect)} within width ${clip.withinWidth}; page scrolls sideways: ${clip.dox}; the row, word for word: "${txt}"`,
    hasRow && !clip.bad.length && clip.withinWidth !== false && !clip.dox ? 'PASS' : 'FAIL', [shot1, shot2].filter(Boolean))
  /* the whole Crew rest group, search cleared then searched "crew rest" */
  await s.fill(''); await p.keyboard.type('crew rest', { delay: 30 }); await sleep(600)
  const g2 = await p.evaluate(() => {
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const page = document.querySelector('#page-logic') || document.body
    return { body: t(page).slice(0, 6000), dox: document.documentElement.scrollWidth > innerWidth + 1 }
  })
  const shot3 = await B.pic(p, 'h02-search-crew-rest')
  const must = ['Aircrew flying today must have', 'If the nominal', 'Rest is measured off the last commitment', "A shift's own start time is its report time", 'A flying line with no take-off yet', 'An SC SPARE carries no crew rest']
  const present = must.map(m => [m, g2.body.includes(m)])
  const bad = /undefined|NaN|Infinity|\[object/.test(g2.body)
  R(`${ID}.2`, `${sz}: searched "crew rest": the group's six rows`, `row openings present: ${JSON.stringify(present)}; stray "undefined/NaN" text: ${bad}; page scrolls sideways: ${g2.dox}`,
    present.every(x => x[1]) && !bad && !g2.dox ? 'PASS' : 'FAIL', [shot3])
  await s.fill('')
} catch (e) { R(`${ID}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 'h02-X')]) }
R(`${ID}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('h02')
