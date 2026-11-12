/* rcsb-w1-s6 v1 — S6 (the Logic page's strip, D2015): one setting, two, reset; the member's strip. [pc|phone]
   usage (from raptor-port/): node scripts/handpass/rcsb/w1/rcsb-w1-s6.mjs [pc|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'pc'
process.env.HP_URL ||= 'http://localhost:4193'
process.env.HP_SHOTS ||= resolve(HERE, '../../../../docs/img/handpass/2026-11-13-rules-check-small-batch/w1/s6-' + KIND)
rmSync(process.env.HP_SHOTS, { recursive: true, force: true })
console.log('rcsb-w1-s6 v1', KIND, process.env.HP_SHOTS)
const C = await import('./rcsb-w1-common.mjs')
const { R, X, L, sleep, row, j, W4 } = C
const w = await R.world(KIND)
const { page } = w
const ONE = '1 setting changed from the squadron standard. Days not yet published use it now. A published day keeps the settings it was published with, for its checks and its OIL, until its next amendment is published.'
const TWO = '2 settings changed from the squadron standard. Days not yet published use them now. A published day keeps the settings it was published with, for its checks and its OIL, until its next amendment is published.'
const stripNow = () => page.evaluate(() => { const e = document.querySelector('#lgOff'); return e && !e.hidden && e.offsetWidth ? e.innerText.replace(/[\s ]+/g, ' ').trim() : '(strip hidden)' })
const oldWords = () => page.evaluate(() => /printed B and its OIL/i.test(document.body.innerText.replace(/[\s ]+/g, ' ')))
const stripPicture = async name => { await L.go(page, 'logic'); await sleep(600); const el = page.locator('#lgOff:visible').first(); if (await el.count()) { await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(250) } ; await R.shot(page, name + '-page'); return X.pic(page, name, '#lgOff', { pad: 10 }) }
const full = async name => { await page.screenshot({ path: `${R.SHOTS}/${name}.png`, fullPage: false }) }
const out = {}
// one setting
const a = await R.setLogic(w, 'oilFullMin', '5h', 'a-one-editing')
out.one = { box: a.after, vconf: a.vconf, strip: a.strip, exact: a.strip === ONE }
await stripPicture('s6-admin-one')
out.oldOne = await oldWords()
console.log('one', j(out.one), 'oldWords', out.oldOne)
row('S6 admin one', a.strip === ONE ? 'PASS' : 'FAIL', `strip: "${a.strip}"; old words present: ${out.oldOne}`, 's6-admin-one.png')
// member sees one
await W4.relogin(page, 'm'); await sleep(800)
await L.go(page, 'logic'); await sleep(700)
const mOne = await stripNow()
await stripPicture('s6-member-one')
const mOld = await oldWords()
console.log('member one', mOne, 'old', mOld)
row('S6 member one', mOne === ONE + ' Only an admin can change them.' ? 'PASS' : 'FAIL', `strip: "${mOne}"; old words: ${mOld}`, 's6-member-one.png')
// back to admin, second setting
await W4.relogin(page, 'a'); await sleep(800)
const b = await R.setLogic(w, 'debrief', '1h30', 'b-two-editing')
out.two = { box: b.after, vconf: b.vconf, strip: b.strip }
await stripPicture('s6-admin-two')
const bOld = await oldWords()
console.log('two', j(out.two), 'old', bOld)
row('S6 admin two', b.strip === TWO ? 'PASS' : 'FAIL', `strip: "${b.strip}"; debrief box "${b.after}", app value ${b.vconf}; old words: ${bOld}`, 's6-admin-two.png')
await W4.relogin(page, 'm'); await sleep(800)
await L.go(page, 'logic'); await sleep(700)
const mTwo = await stripNow()
await stripPicture('s6-member-two')
const mOld2 = await oldWords()
console.log('member two', mTwo, 'old', mOld2)
row('S6 member two', mTwo === TWO + ' Only an admin can change them.' ? 'PASS' : 'FAIL', `strip: "${mTwo}"; old words: ${mOld2}`, 's6-member-two.png')
// reset
await W4.relogin(page, 'a'); await sleep(800)
await L.go(page, 'logic'); await sleep(700)
const rst = page.getByRole('button', { name: /Reset to standard/i }).first()
console.log('reset button count', await rst.count())
await rst.scrollIntoViewIfNeeded(); if (w.phone) await rst.tap(); else await rst.click(); await sleep(800)
const after = await stripNow()
const v = await page.evaluate(() => ({ o: window.VCONF.oilFullMin, d: window.VCONF.debrief }))
await full('s6-admin-after-reset')
console.log('after reset', after, j(v))
row('S6 reset', after === '(strip hidden)' ? 'PASS' : 'FAIL', `after Reset to standard: strip "${after}"; app values ${j(v)}`, 's6-admin-after-reset.png')
R.finish(w, 's6-' + KIND)
await w.browser.close()
