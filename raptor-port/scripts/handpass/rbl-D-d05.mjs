/* D-05 — the Logic page's row. Search "times", then "crew rest". Env HP_PHONE=1 for the phone. */
import * as K from './rbl-D-lib.mjs'
const { B, W, L, R, sleep } = K
const sz = K.PHONE ? 'phone' : 'desktop'
const ID = `D-05-${sz}`
const WANT = 'A flying line with no times yet is not measured: it neither breaks crew rest nor hides a breach another line raises. Whatever it does carry is still read — a typed Brief, its wave\'s In-time / Rally or an SC line\'s typed B as the report, and a typed landing as the end of that day, debrief included — and anything scheduled earlier that day still starts his day.'
const norm = s => s.replace(/\s+/g, ' ').replace(/[–—]/g, '—').trim()
const { browser, p, errors } = await K.fresh()
async function paintedRows() {
  return p.evaluate(() => {
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const vis = e => e.offsetParent !== null && getComputedStyle(e).display !== 'none'
    const page = document.querySelector('#page-logic') || document.body
    const rows = [...page.querySelectorAll('.lgrule')].filter(vis).map(e => ({ text: t(e), sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, r: (() => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right)] })() }))
    const bad = []
    for (const e of page.querySelectorAll('*')) {
      if (e.offsetParent === null) continue
      const cs = getComputedStyle(e)
      if ((cs.overflowX === 'hidden' || cs.overflowX === 'clip' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 1 && (e.innerText || '').length > 20) bad.push({ cls: String(e.className).slice(0, 40), sw: e.scrollWidth, cw: e.clientWidth, text: (e.innerText || '').slice(0, 60) })
    }
    return { rows, bad, dox: document.documentElement.scrollWidth > innerWidth + 1, vw: innerWidth, body: t(page) }
  })
}
const tappable = async () => (await p.locator('#lgSearch').count()) > 0
try {
  await L.go(p, 'logic'); await sleep(500)
  // the whole page's words, with the search empty: is the forbidden phrase anywhere (also text in hidden groups)
  const whole = await p.evaluate(() => { const page = document.querySelector('#page-logic') || document.body; return { inner: (page.innerText || ''), content: (page.textContent || '') } })
  const forbiddenEmpty = /not the end of the day before/i.test(whole.inner + ' ' + whole.content)
  const s = p.locator('#lgSearch')
  await s.click(); await s.fill(''); await p.keyboard.type('times', { delay: 30 }); await sleep(700)
  const a = await paintedRows()
  const hit = a.rows.find(r => /no times yet/i.test(r.text))
  const el = p.locator('#page-logic .lgrule', { hasText: /no times yet/i }).first()
  if (await el.count()) { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300) }
  const shotA = await B.pic(p, 'd05-search-times')
  const hitText = hit ? norm(hit.text) : ''
  // the row's words after its heading (the row may carry a lead label); compare containing
  const exact = hitText.includes(norm(WANT))
  const fits = hit ? (hit.sw <= hit.cw + 1) : null
  const inWidth = hit ? (hit.r[0] >= 0 && hit.r[1] <= a.vw + 1) : null
  R(`${ID}.1`, `${sz}: Logic page, typed "times" in the search box`,
    `rows shown ${a.rows.length}; the row found: "${hitText}"; word for word as EXPECTED: ${exact}; row box scrollWidth ${hit && hit.sw} / clientWidth ${hit && hit.cw}; within window width: ${inWidth}; clipped boxes: ${JSON.stringify(a.bad)}; page scrolls sideways: ${a.dox}`,
    hit && exact && !a.bad.length && inWidth && !a.dox ? 'PASS' : 'FAIL', [shotA])
  // "crew rest"
  await s.fill(''); await p.keyboard.type('crew rest', { delay: 30 }); await sleep(700)
  const b = await paintedRows()
  const hit2 = b.rows.find(r => /no times yet/i.test(r.text))
  const el2 = p.locator('#page-logic .lgrule', { hasText: /no times yet/i }).first()
  if (await el2.count()) { await el2.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300) }
  const shotB = await B.pic(p, 'd05-search-crew-rest-row')
  const t2 = hit2 ? norm(hit2.text) : ''
  const underCrewRest = await p.evaluate(() => {
    const page = document.querySelector('#page-logic') || document.body
    const row = [...page.querySelectorAll('.lgrule')].find(e => /no times yet/i.test(e.innerText || ''))
    if (!row) return null
    const g = row.closest('.lggrp, section, .lg-group, [data-lggrp]')
    const h = g ? (g.querySelector('h2,h3,.lgh,.lg-gh,.lggh') || {}).innerText : null
    // fall back: nearest preceding heading-ish element
    let e = row, found = null
    while (e && !found) { let s = e.previousElementSibling; while (s && !found) { if (/^H[1-6]$/.test(s.tagName) || /lggh|lgh|lg-gh|grp/i.test(s.className)) found = s.innerText; s = s.previousElementSibling } e = e.parentElement }
    return { groupHead: h, near: found }
  })
  R(`${ID}.2`, `${sz}: searched "crew rest" — the row sits under Crew rest`, `row found: ${!!hit2}; its group heading: ${JSON.stringify(underCrewRest)}; word for word as EXPECTED: ${t2.includes(norm(WANT))}; page scrolls sideways: ${b.dox}; clipped boxes: ${JSON.stringify(b.bad)}; rows shown ${b.rows.length}`,
    hit2 && t2.includes(norm(WANT)) && !b.dox && !b.bad.length && /crew rest/i.test(JSON.stringify(underCrewRest)) ? 'PASS' : (hit2 && t2.includes(norm(WANT)) && !b.dox && !b.bad.length ? 'PARTIAL' : 'FAIL'), [shotB])
  // the forbidden phrase, anywhere (search cleared => whole page; also with each search above)
  await s.fill(''); await sleep(500)
  const whole2 = await p.evaluate(() => { const page = document.querySelector('#page-logic') || document.body; return { inner: page.innerText || '', content: page.textContent || '' } })
  const f2 = /not the end of the day before/i.test(whole2.inner + ' ' + whole2.content)
  const f3 = /end of the day before/i.test(whole2.inner + ' ' + whole2.content)
  // also search the phrase through the page's own search
  await s.click(); await p.keyboard.type('end of the day before', { delay: 20 }); await sleep(600)
  const c = await paintedRows()
  await s.fill(''); await sleep(300)
  R(`${ID}.3`, `${sz}: the words "not the end of the day before" anywhere on the Logic page (full text, empty search; and the page's own search on "end of the day before")`,
    `whole page text contains "not the end of the day before": ${forbiddenEmpty || f2}; contains "end of the day before": ${f3}; the page's search on that phrase shows ${c.rows.length} rows${c.rows.length ? ': ' + c.rows.map(r => r.text.slice(0, 80)).join(' || ') : ''}`,
    !(forbiddenEmpty || f2) && c.rows.length === 0 ? 'PASS' : 'FAIL', [])
} catch (e) { R(`${ID}.X`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, 'd05-X')]) }
R(`${ID}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
B.savePart('d05')
