/* walker A — H-02: the Logic page's own words for the nominal report and the OIL row; the page's search. Desktop or phone. */
import * as A from './ows-A-lib.mjs'
const { judge, frame, sleep, pic } = A
const PH = !!process.env.HP_PHONE
const T = 'H02' + (PH ? 'ph' : '')
await frame(T, async ({ p }) => {
  await A.L.go(p, 'logic'); await sleep(500)
  /* rows as painted */
  const rows = await p.evaluate(() => [...document.querySelectorAll('.lgrule')].map((e, i) => ({ i, text: e.innerText.replace(/\s+/g, ' ').trim(), vis: e.offsetParent !== null, cls: e.className })))
  const nom = rows.find(r => /nominal report/i.test(r.text) && /OIL/.test(r.text) && /counts its/.test(r.text))
  const oil = rows.find(r => /weekend or public holiday earns OIL/i.test(r.text))
  const nomOK = nom && /A flying line with no In-time \/ Rally entered counts its OIL day from this time/.test(nom.text)
  const oilOK = oil && /day runs from|from the line.s entered In-time \/ Rally|entered In-time \/ Rally/.test(oil.text) && /A published day keeps the OIL it went out with/.test(oil.text) && /SC spare/i.test(oil.text) && /AVALON/.test(oil.text) && /BB/.test(oil.text) && /unless an admin switches/i.test(oil.text)
  /* the nominal row on screen */
  const nomIdx = nom ? nom.i : -1, oilIdx = oil ? oil.i : -1
  const scrollTo = async idx => { await p.evaluate(i => { const e = document.querySelectorAll('.lgrule')[i]; if (e) e.scrollIntoView({ block: 'start' }) }, idx); await sleep(300) }
  await scrollTo(nomIdx); const f1 = await pic(p, T + '-nominal-row')
  /* clipped words: any text box wider than its container, or an element cut off */
  const clip = i => p.evaluate(idx => { const e = document.querySelectorAll('.lgrule')[idx]; if (!e) return null
    const bad = []; for (const c of e.querySelectorAll('*')) { if (c.scrollWidth > c.clientWidth + 1 && getComputedStyle(c).overflowX !== 'visible') bad.push(c.className || c.tagName) }
    const r = e.getBoundingClientRect(); return { right: Math.round(r.right), vw: innerWidth, overflowPage: document.documentElement.scrollWidth > innerWidth + 1, hiddenOverflow: bad.slice(0, 5) } }, i)
  const cl1 = await clip(nomIdx)
  /* the OIL row: it is under the "why" fold? read the whole text and the .why visibility */
  await scrollTo(oilIdx); const f2 = await pic(p, T + '-oil-row')
  const cl2 = await clip(oilIdx)
  const whyVis = await p.evaluate(idx => { const e = document.querySelectorAll('.lgrule')[idx]; const w = e && e.querySelector('.why'); return w ? { display: getComputedStyle(w).display, shown: w.offsetParent !== null, h: w.getBoundingClientRect().height } : null }, oilIdx)
  /* the search */
  const sb = p.locator('input[type="search"], #lgSearch, input[placeholder*="search"]').first()
  const hasSearch = await sb.count()
  let found = null, f3 = null
  if (hasSearch) { await sb.scrollIntoViewIfNeeded(); await sb.click(); await sb.fill('published day keeps'); await sleep(700)
    found = await p.evaluate(() => [...document.querySelectorAll('.lgrule')].filter(e => e.offsetParent !== null).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 110)))
    const c = await p.locator('.lgrule:visible').first(); if (await c.count()) await c.scrollIntoViewIfNeeded(); await sleep(300); f3 = await pic(p, T + '-search-published-day-keeps')
    const cnt = await p.evaluate(() => document.body.innerText.match(/\d+ of \d+ rules/) ? document.body.innerText.match(/\d+ of \d+ rules[^\n]*/)[0] : '') ; console.log(T, 'count line:', cnt) }
  const foundOil = found && found.some(t => /weekend or public holiday earns OIL/i.test(t))
  judge(T + '.1', 'Logic page: the Nominal-report row, the OIL row, and the search box' + (PH ? ' (phone)' : ''), [
    ['nominal row says: a flying line with no In-time / Rally entered counts its OIL day from that time', !!nomOK, nom && nom.text.slice(0, 330)],
    ['OIL row says: day runs from the line\'s entered In-time / Rally; a published day keeps the OIL it went out with; SC spare / AVALON / BB earn nothing unless switched on in OIL Earn', !!oilOK, oil && oil.text.slice(0, 200)],
    ['no clipped words on the nominal row', !!cl1 && !cl1.overflowPage && cl1.hiddenOverflow.length === 0, cl1],
    ['no clipped words on the OIL row', !!cl2 && !cl2.overflowPage && cl2.hiddenOverflow.length === 0, { cl2, whyVis }],
    ['the page\'s search finds the OIL row on "published day keeps"', !!foundOil, found],
  ], [f1, f2, f3].filter(Boolean))
  console.log(T, 'nominal:', nom && nom.text.slice(0, 700)); console.log(T, 'oil (first 1500):', oil && oil.text.slice(0, 1500)); console.log(T, 'whyVis', JSON.stringify(whyVis), 'search hits', JSON.stringify(found))
})
