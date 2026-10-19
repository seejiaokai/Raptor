import { launch, proveBundle, phone, shot, wait, scrollTo, weekTo, navTo } from './sf-B-lib.mjs'
import { buildSat } from './sf-B-lib2.mjs'
console.log('sf-B-s16b v1')
await proveBundle()
const browser = await launch()
const rec = (id, ok, note) => console.log(ok === true ? 'PASS' : ok === false ? 'FAIL' : 'RECORD', id, '::', note)
try {
  const { ctx, page: p, errors } = await phone(browser, 'a')
  await buildSat(p)
  await p.evaluate(() => window.addWave(5, '')); await wait(p, 400)
  await p.evaluate(() => window.go('editsched')); await wait(p, 700)
  await weekTo(p, ctx, 5)
  const read = root => p.evaluate(root => [...document.querySelectorAll(root + ' .day')[5].querySelectorAll('[data-txt^="ff:"], input.tm, .tm')].filter(e => e.offsetParent).map(e => ({ k: e.getAttribute('data-txt') || '', tag: e.tagName, ph: e.placeholder || '', val: e.value !== undefined ? e.value : '', text: (e.innerText || '').trim().slice(0, 12), cls: String(e.className).slice(0, 30) })).slice(0, 40), root)
  const wk = await read('#eWeek')
  const rb = wk.filter(x => /\.(rl|br)$/.test(x.k))
  console.log('week R/B boxes', rb.length, JSON.stringify(rb.slice(0, 6)))
  const dashes = rb.filter(x => /^[–—-]$/.test((x.ph || x.val || x.text).trim()))
  rec('16-8', null, `Edit Schedule week (phone), Saturday: ${rb.length} R/B boxes of the waves, ${dashes.length} show a dash as placeholder/text (kinds: ${JSON.stringify([...new Set(rb.map(x => x.tag + '/' + x.cls))])}) — the brief names the board only for the faint dash`)
  await scrollTo(p, p.locator('#eWeek .day:nth-child(6) .go').first(), 220); await shot(p, 'B-16-7-week-dash')
  await navTo(p, 'viewsched'); await weekTo(p, ctx, 5, '#vWeek', 112)
  const vw = await p.evaluate(() => { const d = document.querySelectorAll('#vWeek .day')[5]; return [...d.querySelectorAll('.go')].map(g => (g.innerText || '').replace(/\s+/g, ' ').slice(0, 110)) })
  rec('16-9', null, `View-only Sched Saturday wave heads: ${JSON.stringify(vw)}`)
  console.log('errors', JSON.stringify(errors))
} finally { await browser.close() }
