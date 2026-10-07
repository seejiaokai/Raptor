/* L-04 — a reporting line on a wave with no take-off yet. RECORD. */
import * as G from './stk-G-lib.mjs'
import { tap, type, put } from './lib.mjs'
const { L, W } = G
const TAG = process.env.HP_PHONE ? 'ph' : 'dk'
const w = await G.world()
const p = w.p
const D = 5
const out = []
const ID = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [v.cs, k])))
const pick = (txt, n) => { const m = txt.match(new RegExp('WORK HOURS.*?' + n + ' ([0-9h]+)')); return m ? m[1] : null }

async function state(label, { who = null, insights = false } = {}) {
  const r = { label }
  r.intimes = await p.evaluate(() => window.DAYS[5].waves[0] ? window.DAYS[5].waves[0].intimes.slice() : null)
  r.header = await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-go-h .asd'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
  r.lineText = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .intimes .itline')].map(e => e.innerText.trim()))
  r.feedback = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-reporting-feedback]')].map(e => e.innerText.trim()))
  /* the Available-crew panel's wave bands — open it if folded, read every group heading */
  r.avail = await p.evaluate(() => {
    const t = e => (e.innerText || '').replace(/\s+/g, ' ').trim()
    const h = [...document.querySelectorAll('#schedBoard .ap-h, #schedBoard [data-avtog]')].map(t)
    const g = [...document.querySelectorAll('#schedBoard .ap-grp')].map(t)
    return { heads: h, groups: g }
  })
  /* the warning list: open the board's panel so every line is read */
  await G.boardOpenFoldSafe?.(p)
  r.warns = await G.warnLines(p, D)
  r.pics = [await G.pic(p, `L04-${label}-board`)]
  if (insights) {
    await G.insightsOpen(p)
    const t = await G.insightsRead(p)
    r.figs = Object.fromEntries(['Reaper'].map(n => [n, pick(t.text, n)]))
    r.reaperAnywhere = (t.text.match(/.{0,60}Reaper.{0,60}/g) || [])
    r.rowsWithReaper = t.rows.filter(x => /Reaper/.test(x))
    r.nWorkRows = t.rows.length
    r.pics.push(await G.pic(p, `L04-${label}-insights`))
    await G.insightsClose(p)
  }
  console.log('STATE', label, JSON.stringify(r))
  out.push(r)
  return r
}

await G.boardOn(p, D)
await G.insightsOpen(p)
const base = await G.insightsRead(p)
const baseline = { Reaper: pick(base.text, 'Reaper') }
console.log('BASELINE', JSON.stringify(baseline))
await G.insightsClose(p)
console.log('BASE-REAPER', JSON.stringify(base.text.match(/.{0,60}Reaper.{0,60}/g)))
await state('0-before-wave')
await G.addWave(p, D)
await state('1-empty-wave')
await G.tapSel(p, `#schedBoard [data-itadd="${D}|0"]`)
await G.sleep(500)
await state('2-line-minted')
/* type 0800 at the front of the new line and leave the box */
const el = p.locator(`#schedBoard .intimes[data-intimes="${D}|0"] .itline`).first()
await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
await el.click()
await p.keyboard.press('Home')
await p.keyboard.type('0800', { delay: 30 })
await el.evaluate(e => e.blur())
await G.sleep(600)
const r3 = await state('3-0800-at-front')
/* variant: with a space after the clock, in case the glued form is simply not a clock */
await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
await el.click(); await p.keyboard.press('Home'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight')
await p.keyboard.type(' ', { delay: 30 })
await el.evaluate(e => e.blur())
await G.sleep(600)
await state('4-0800-space')
/* a person on the (blank) line */
console.log('seat', await put(p, `[data-slot="${D}.0.0.0.p"]`, [ID.Reaper]))
await state('5-person-on-blank-line', { insights: true })
/* take-off and landing */
await type(p, `[data-bfld="ff:${D}.0.0.to"]`, '11:00')
await type(p, `[data-bfld="ff:${D}.0.0.ld"]`, '12:00')
await state('6-with-takeoff-landing', { insights: true })
console.log('errors', w.errors)
G.rec('L-04-' + TAG, 'raw', out, 'RAW')
G.save('L04-' + TAG, { baseline, out, errors: w.errors })
await w.browser.close()
