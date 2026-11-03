// A10 — OIL Earn mode on a phone: a long item name cut on one line where the same row wraps with the mode off.
import * as L from './isr-A-lib.mjs'
import * as P from './isr-A-pub.mjs'
const { say, check, note, notWalked, tid, press, shot } = L
const sleep = ms => new Promise(r => setTimeout(r, ms))
const TITLE = 'Annual squadron sports afternoon and family open house'
export default async function a10() {
  for (const size of ['phone', 'desktop']) {
    const { ctx, page, tap } = await L.session(size)
    try {
      const [who] = await L.freeMen(page, 1, [5])
      const iid = await L.fileOn(page, tap, '2026-07-18', { type: 'Event', people: [who], from: '09:00', to: '12:00', title: TITLE })
      if (!iid) { notWalked(`A10 ${size}`, 'the long-titled Event was not filed'); await ctx.close(); continue }
      await P.editWeek(page)
      await page.locator('#eWeek [data-sbday="5"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
      await page.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await sleep(700)
      const read = () => page.evaluate(() => {
        const row = [...document.querySelectorAll('#schedBoard .sb-arow.gr-frominput')].find(r => r.getBoundingClientRect().height > 0 && /annual squadron/i.test((r.textContent || '') + [...r.querySelectorAll('textarea,input')].map(x => x.value).join(' ')))
        const card = [...document.querySelectorAll('#schedBoard .sbi-ty.inpty')].find(r => r.getBoundingClientRect().height > 0 && /annual squadron/i.test(r.textContent || ''))
        const nm = row && row.querySelector('.sb-nmk')
        const el = nm && nm.firstElementChild
        const d = e => { if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { tag: e.tagName, cls: String(e.className).slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), scrollW: e.scrollWidth, clientW: e.clientWidth, scrollH: e.scrollHeight, clientH: e.clientHeight, ws: cs.whiteSpace, to: cs.textOverflow, text: String(e.value || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 70) } }
        return { rowName: d(el), rowNameBox: d(nm), card: d(card) }
      })
      const pics = async (mode) => {
        for (const [what, sel] of [['row', '#schedBoard .sb-arow.gr-frominput .sb-nmk'], ['card', '#schedBoard .sbi-ty.inpty']]) {
          const ok = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().height > 0 && /annual squadron/i.test((x.textContent || '') + [...x.querySelectorAll('textarea,input')].map(y => y.value).join(' '))); if (!e) return false; e.scrollIntoView({ block: 'center' }); e.style.outline = '3px solid #ff3b6b'; e.style.outlineOffset = '2px'; return true }, sel)
          await sleep(250); if (ok) await shot(page, 'A10', size, `oil-earn-${mode}-${what}-marked`)
          await page.evaluate(sel => { for (const e of document.querySelectorAll(sel)) e.style.removeProperty('outline') }, sel)
        }
      }
      if (await page.locator('#schedBoard [data-pitog]:visible').count() && !(await page.locator('#schedBoard .pinp .sb-arow:visible, #schedBoard .pinp .sbi-row:visible').count())) { await page.locator('#schedBoard [data-pitog]:visible').first().click(); await sleep(600) }
      const off = await read(); await pics('OFF')
      // OIL Earn on
      const btn = page.locator('#schedBoard button:visible', { hasText: 'OIL Earn' }).first()
      if (!(await btn.count())) { notWalked(`A10 ${size}`, 'no OIL Earn button visible'); await shot(page, 'A10', size, 'no-oil-button'); await ctx.close(); continue }
      await press(page, tap, btn); await sleep(800)
      const on = await read(); await pics('ON')
      say(`A10 ${size} mode OFF ${JSON.stringify(off)} | mode ON ${JSON.stringify(on)}`)
      if (!off.rowName || !on.rowName) { notWalked(`A10 ${size}`, `the programme row's name not found in both states (off ${!!off.rowName}, on ${!!on.rowName})`); await ctx.close(); continue }
      const cut = d => d.scrollW > d.clientW + 2 || d.scrollH > d.clientH + 3
      check('A10', `${size}: the programme row's long name is wraps (not cut, not nowrap) with OIL Earn ON as with it OFF`, !cut(off.rowName) && !cut(on.rowName) && off.rowName.ws !== 'nowrap' && on.rowName.ws !== 'nowrap', { off: off.rowName, on: on.rowName })
      note('A10', `${size} Personal Inputs card name: OFF ${JSON.stringify(off.card)} ON ${JSON.stringify(on.card)}`)
    } catch (e) { say(`ERROR A10 ${size}: ${e.message.split('\n')[0]}`); await shot(page, 'A10', size, 'error').catch(() => {}) }
    await ctx.close()
  }
}
if (process.argv[1].endsWith('isr-A-a10.mjs')) { await a10(); await L.finish('a10') }
