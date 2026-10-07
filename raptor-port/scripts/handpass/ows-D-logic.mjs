import * as D from './ows-D-lib.mjs'
const { world, sleep, L, P } = D
const { browser, p, errors } = await world()
await L.go(p, 'logic'); await sleep(700)
const t = await D.pageText(p, 'body')
const re = /[^.]{0,200}\b(earn|OIL)[^.]{0,260}\./gi
const hits = [...new Set((t.match(re) || []).map(s => s.trim()))].filter(s => /(SC SPARE|AVALON|BB|standby|spare)/i.test(s))
console.log(JSON.stringify(hits, null, 1))
await P(p, 'logic-page')
await browser.close()
