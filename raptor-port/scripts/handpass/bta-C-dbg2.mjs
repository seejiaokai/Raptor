import * as X from './bta-C-lib.mjs'
const { K } = X
const { browser, p } = await K.fresh()
const r = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([k, v]) => v.seat === 'FCP' && v.quals && !v.pers).map(([k, v]) => `${k}/${v.cs}/${v.q} daar=${v.quals.daar} naar=${v.quals.naar} scD=${v.quals.scDay} scN=${v.quals.scNight}`))
console.log(r.join('\n'))
await browser.close()
