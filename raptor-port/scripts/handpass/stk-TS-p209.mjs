/* P2-09 — custom default wording on Logic (desktop). */
import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic, row } = S
const { browser, p, errors } = await world()
await L.go(p, 'logic')
await p.locator('#lgEdit').click(); await S.sleep(500)
const inputs = await p.evaluate(() => [...document.querySelectorAll('#page-logic input, #page-logic textarea, #page-logic select')].map(e => ({ lbl: e.getAttribute('aria-label') || '', set: e.dataset.lgset || '', kind: e.dataset.lgkind || '', type: e.type, id: e.id })))
const labels = [...new Set(inputs.map(i => i.lbl).filter(Boolean))]
const sets = [...new Set(inputs.map(i => i.set).filter(Boolean))]
const words = labels.filter(l => /word|text|rally|in-time|report/i.test(l))
const pageText = await p.evaluate(() => document.querySelector('#page-logic').innerText)
const wordHits = pageText.split('\n').filter(l => /words|IN TIME \+ WX|reportText|60 characters|blank restores/i.test(l))
console.log('labels with word/text/rally/in-time/report:', JSON.stringify(words)); console.log('data-lgset keys:', sets.join(',')); console.log('page lines about words:', JSON.stringify(wordHits))
await S.picAt(p, '#page-logic [data-lgset="reportLead"]', 'p209-1-logic-nominal-report-row-edit-mode')
// search "rally" with the page's own search box
await p.locator('#lgSearch').fill('rally'); await S.sleep(500)
await pic(p, 'p209-2-logic-search-rally')
const hits = await p.evaluate(() => [...document.querySelectorAll('#page-logic .lgrule')].filter(x => x.offsetParent).map(x => x.innerText.replace(/\s+/g, ' ').slice(0, 160)))
console.log('rules shown for "rally":', JSON.stringify(hits))
// the button's fill on a fresh wave: the only wording the app offers
await S.toWeek(p)
row('P2-09', 'Logic page, Edit rules mode: read every box (labels, keys), read the page text for any words/wording setting, searched the rules for "rally", looked at the "Nominal report before T/O" row',
  `The row beside the nominal report holds ONE box (Nominal report before T/O); there is no box for the words the button fills in. Labels containing word/text/rally/in-time/report: ${JSON.stringify(words)}. Setting keys on the page: ${sets.join(', ')}. Page lines mentioning the words setting: ${JSON.stringify(wordHits)}. Search "rally" shows rules: ${JSON.stringify(hits).slice(0, 600)}. The button's own fill on this build is always "<clock>H: IN TIME + WX/NOTAMS" (P2-08).`,
  'NOT WALKED (setting absent on this build — see findings)', ['p209-1-logic-nominal-report-row-edit-mode', 'p209-2-logic-search-rally'])
console.log('errors', errors)
S.savePart('p209', { errors, labels, sets, wordHits, hits })
await browser.close()
