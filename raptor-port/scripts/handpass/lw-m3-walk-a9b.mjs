// Walker A, scenario 9 extra: the Inputs window's Custom duration — no "How much of the day" anywhere; the picker's group says Duration.
import * as L from './lw-m3-walk-a-lib.mjs'
console.log('lw-m3-walk-a9b v1')
const w = await L.newCtx('desktop')
const P = w.page
await L.signInPlain(w, 'admin')
await L.inputsList(w)
await L.press(w, L.T('in-new')); await P.waitForTimeout(700)
await P.getByText('Custom', { exact: true }).first().click(); await P.waitForTimeout(600)
await L.shot(w, 's9-dk-05-inputs-custom')
const t = await P.evaluate(() => { const t = document.body.innerText; const i = t.indexOf('New input'); return t.slice(i).replace(/\s+/g, ' ') })
console.log('has "How much of the day":', /how much of the day/i.test(t), '| has "Duration":', /duration/i.test(t), '|', t.slice(t.indexOf('DURATION') > -1 ? t.indexOf('DURATION') : t.indexOf('Duration'), 400 + t.indexOf('Duration')).slice(0, 260))
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
