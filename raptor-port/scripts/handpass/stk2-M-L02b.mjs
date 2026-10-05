/* L-02 — new words for the button, and the RULES MODIFIED stamp. */
import * as G from './stk2-M-lib.mjs'
const { L } = G
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const w = await G.world()
const p = w.p
const out = []

async function stamp(label, pages = ['viewsched', 'editsched', 'logic']) {
  const r = { label }
  for (const pg of pages) {
    await L.go(p, pg)
    await p.evaluate(() => window.scrollTo(0, 0))
    await G.sleep(300)
    r[pg] = await p.evaluate(pg => {
      const q = id => document.querySelector(id)
      const ban = [...document.querySelectorAll('.schedbanner')].filter(e => e.offsetParent !== null || e.getClientRects().length)
      const afters = ban.map(e => ({ id: e.id, after: getComputedStyle(e, '::after').content, disp: getComputedStyle(e, '::after').display, vis: !!(e.offsetWidth || e.offsetHeight) }))
      const lgOff = q('#lgOff')
      return {
        bodyFlag: document.body.classList.contains('page-rules-off'),
        banners: afters,
        lgOff: lgOff ? { hidden: lgOff.hidden, shown: !!(lgOff.offsetWidth || lgOff.offsetHeight), text: (lgOff.innerText || '').replace(/\s+/g, ' ').trim() } : null,
        lgCount: q('#lgCount') ? q('#lgCount').innerText.replace(/\s+/g, ' ').trim() : null,
        reset: q('#lgReset') ? { hidden: q('#lgReset').hidden } : null,
      }
    }, pg)
    r[pg + '_pic'] = await G.pic(p, `L02b-${label}-${pg}`)
  }
  console.log('STAMP', label, JSON.stringify(r))
  out.push(r)
  return r
}

await stamp('1-fresh')
/* the words */
await G.logicEditOn(p)
const box = await G.logicSet(p, 'reportText', 'RALLY')
console.log('reportText box now:', box, 'VCONF.reportText=', await G.vconf(p, 'reportText'))
await G.pic(p, 'L02b-2-logic-words-typed')
await G.logicDone(p)
await stamp('3-after-words')
/* the member, in place */
await p.evaluate(() => window.raptorRole('member'))
await G.sleep(500)
await stamp('4-member-in-place-after-words')
await p.evaluate(() => window.raptorRole('admin'))
await G.sleep(400)
/* a NUMBER rule */
await G.logicEditOn(p)
const n = await G.logicSet(p, 'briefLead', '3h')
console.log('briefLead box', n, await G.vconf(p, 'briefLead'))
await G.logicDone(p)
await stamp('5-after-number-rule-briefLead-13h')
await p.evaluate(() => window.raptorRole('member')); await G.sleep(400)
await stamp('6-member-in-place-after-number-rule', ['logic', 'viewsched'])
await p.evaluate(() => window.raptorRole('admin')); await G.sleep(400)
/* reset to standard through the app's button */
await L.go(p, 'logic')
const rst = p.locator('#lgReset')
console.log('reset button hidden?', await rst.evaluate(e => e.hidden))
if (await rst.isVisible()) { await rst.click(); await G.sleep(600) }
await stamp('7-after-reset')
/* the words back to standard? words stay RALLY after reset? record */
console.log('reportText after reset:', await G.vconf(p, 'reportText'), 'briefLead', await G.vconf(p, 'briefLead'))
/* reload as the real member */
await p.reload(); await L.signIn(p, 'm', { goto: false })
await stamp('8-reload-as-member', ['viewsched', 'logic'])
console.log('errors', w.errors)
G.rec('L-02-' + TAG, 'raw', out, 'RAW')
G.save('L02b-' + TAG, { out, errors: w.errors })
await w.browser.close()
