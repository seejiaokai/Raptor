/* exploratory: Duty block, Sim block, Common Programme item boxes */
import * as K from './rbl-A-lib.mjs'
const { B, W, X, MON, TUE } = K
const { browser, p, errors } = await K.fresh()
await K.boardTo(p, MON)
const keysOf = async pre => p.evaluate(pr => [...document.querySelectorAll('#schedBoard [data-bfld], #schedBoard [data-fill], #schedBoard [data-rolepick]')].map(e => e.dataset.bfld ? 'bfld=' + e.dataset.bfld : e.dataset.fill ? 'fill=' + e.dataset.fill : 'rolepick=' + e.dataset.rolepick).filter(k => pr.some(x => k.includes(x))), pre)
console.log('BEFORE duty keys', JSON.stringify(await keysOf(['d:', 'dl:', 'dr:'])).slice(0, 700))
const clickAdd = async sel => { const b = p.locator(`#schedBoard ${sel}`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await K.sleep(700) }
console.log('duty counts', await p.evaluate(() => ({ dw: window.DAYS[0].dutyBlocks ? window.DAYS[0].dutyBlocks.length : null, keys: Object.keys(window.DAYS[0]) })))
await clickAdd('[data-sradd]')
console.log('after sim row: keys', JSON.stringify(await keysOf(['sr:', 's:'])).slice(0, 900))
await clickAdd('[data-padd="0"]')
console.log('after programme item: keys', JSON.stringify(await keysOf(['ap:', 'a:'])).slice(0, 900))
await clickAdd('[data-dradd]')
console.log('after duty row: keys', JSON.stringify(await keysOf(['dl:', 'dr:', 'd:'])).slice(0, 900))
console.log('DAY0 dump', JSON.stringify(await p.evaluate(() => { const d = window.DAYS[0]; return { keys: Object.keys(d), sims: JSON.stringify(d.sims || d.sim || null).slice(0, 300), prog: JSON.stringify(d.prog || d.programme || d.ap || null).slice(0, 300), duties: JSON.stringify(d.duties || d.duty || null).slice(0, 400) } })))
console.log('errors', errors)
await browser.close()
