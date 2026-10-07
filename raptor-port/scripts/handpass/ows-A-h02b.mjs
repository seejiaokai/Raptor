/* walker A — H-02 follow-up at phone width: which rows carry the nominal report and OIL words, and is the OIL text one the desktop also has */
import * as A from './ows-A-lib.mjs'
const { frame, sleep, pic } = A
await frame('H02b', async ({ p }) => {
  await A.L.go(p, 'logic'); await sleep(600)
  const rows = await p.evaluate(() => [...document.querySelectorAll('.lgrule')].map((e, i) => ({ i, vis: e.offsetParent !== null, text: e.innerText.replace(/\s+/g, ' ').trim() })))
  console.log('width', await p.evaluate(() => innerWidth), 'rows', rows.length)
  for (const r of rows.filter(r => /nominal|report/i.test(r.text.slice(0, 300)))) console.log('ROW', r.i, r.vis, r.text.slice(0, 420))
  const key = rows.filter(r => /published day keeps|keeps the OIL/i.test(r.text))
  console.log('rows with "keeps the OIL":', key.map(r => r.i))
  const oil = rows.find(r => /weekend or public holiday earns OIL/i.test(r.text))
  console.log('OIL row full:', oil && oil.text)
  console.log('lgrule classes', await p.evaluate(() => [...new Set([...document.querySelectorAll('.lgrule')].map(e => e.className))]))
  console.log('mobile layout markers', await p.evaluate(() => ({ ua: navigator.userAgent.slice(0, 80), coarse: matchMedia('(pointer: coarse)').matches, w: innerWidth })))
  const idx = rows.find(r => /nominal report to the squadron|nominal report/i.test(r.text))
  await p.evaluate(i => { const e = document.querySelectorAll('.lgrule')[i]; if (e) e.scrollIntoView({ block: 'start' }) }, idx ? idx.i : 0); await sleep(300)
  await pic(p, 'H02b-phone-first-nominal-match')
})
