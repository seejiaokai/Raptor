// jc-s54 - S54: the Inputs filter. On a phone the button's look and small number follow what is set; on a desktop the three boxes stand on the page.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts, go, shut, as } from './jlib.mjs'
const SZ = process.env.SZ || 'p'
console.log('jc-s54 v1', SZ)
picsFor('jc-s54-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const read = s => s.page.evaluate(() => {
  const b = document.querySelector('#inFiltersBtn'); const shown = e => !!e && e.getBoundingClientRect().width > 0
  const c = b && getComputedStyle(b); const dot = b ? [...b.querySelectorAll('span')].find(x => /^\d+$/.test(x.textContent.trim())) : null
  return { btnShown: shown(b), bg: c?.backgroundColor, color: c?.color, border: c?.borderTopColor, n: dot ? dot.textContent.trim() : null, aria: b?.getAttribute('aria-label'), panelShown: shown(document.querySelector('#inFPerson')), summary: document.querySelector('#inFilterSummary span')?.textContent ?? null, rows: [...document.querySelectorAll('[data-iid]')].filter(e => e.getBoundingClientRect().height > 0).length, person: document.querySelector('#inFPerson')?.value, type: document.querySelector('#inFType')?.value, search: document.querySelector('#inFSearch')?.value }
})
const tapIt = async (s, sel) => { const l = s.page.locator(sel).filter({ visible: true }).first(); if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(240) }
const toList = async s => { await go(s, 'inputs'); await shut(s); await s.page.waitForTimeout(350); await tapIt(s, '#inListBtn'); await s.page.waitForTimeout(250) }
async function openP(s) { if (!(await read(s)).panelShown) await tapIt(s, '#inFiltersBtn'); await s.page.waitForTimeout(150) }
async function closeP(s) { if ((await read(s)).panelShown) await tapIt(s, '#inFiltersBtn'); await s.page.waitForTimeout(150) }
async function phoneRound(s, tag) {
  const { page } = s
  let OFF
  await step(`${tag} off`, async () => {
    await toList(s); let r = await read(s); rec(`${tag} as it opens`, r); await pic(s, `${tag}-0-as-it-opens`)
    /* a member's Inputs opens on his own name: a filter that really is on. Taken off by the page's own Clear filters, so the
       unlit look can be read from the same screen */
    if (r.n) { check(`${tag} the lit look at opening matches a set filter`, r.summary && r.n === '1', { n: r.n, summary: r.summary }); await tapIt(s, '#inFiltersClear'); await page.waitForTimeout(260); r = await read(s); rec(`${tag} after Clear filters`, r) }
    OFF = r; rec(`${tag} off`, r); check(`${tag} button drawn`, r.btnShown, r.btnShown); await pic(s, `${tag}-1-off`)
    await openP(s); const o = await read(s); check(`${tag} opening with nothing set stays unlit`, o.bg === OFF.bg && o.n === null, { bg: o.bg, n: o.n }); await pic(s, `${tag}-2-open-empty`); await closeP(s)
  })
  const person = await page.evaluate(() => [...document.querySelector('#inFPerson').options].filter(o => !/ALL|Everyone/.test(o.textContent) && o.value !== 'all').map(o => o.value)[1])
  const type = await page.evaluate(() => [...document.querySelector('#inFType').options].map(o => o.value).find(v => v !== 'all'))
  const lit = (r, n, what) => { check(`${tag} ${what}: pale blue`, r.bg !== OFF.bg && r.color !== OFF.color, { bg: r.bg, color: r.color }); check(`${tag} ${what}: count ${n}`, r.n === String(n), r.n) }
  const unlit = (r, what) => { check(`${tag} ${what}: unlit, no number`, r.bg === OFF.bg && r.color === OFF.color && r.n === null, { bg: r.bg, n: r.n }) }
  await step(`${tag} Person, Type and Search one at a time`, async () => {
    await openP(s); await page.selectOption('#inFPerson', person); await page.waitForTimeout(240); let r = await read(s); lit(r, 1, 'Person'); rec(`${tag} Person alone`, { rows: r.rows, summary: r.summary }); await pic(s, `${tag}-3-person`)
    await page.selectOption('#inFPerson', { index: 0 }); await page.waitForTimeout(220); unlit(await read(s), 'Person cleared')
    await page.selectOption('#inFType', type); await page.waitForTimeout(240); r = await read(s); lit(r, 1, 'Type'); rec(`${tag} Type alone`, { rows: r.rows, summary: r.summary })
    await page.selectOption('#inFType', 'all'); await page.waitForTimeout(220); unlit(await read(s), 'Type cleared')
    await page.fill('#inFSearch', 'a'); await page.waitForTimeout(260); r = await read(s); lit(r, 1, 'Search'); rec(`${tag} Search alone`, { rows: r.rows, summary: r.summary })
    await page.fill('#inFSearch', ''); await page.waitForTimeout(220); unlit(await read(s), 'Search cleared')
  })
  await step(`${tag} together, closed and reopened, cleared`, async () => {
    await page.selectOption('#inFPerson', person); await page.selectOption('#inFType', type); await page.fill('#inFSearch', 'a'); await page.waitForTimeout(260)
    let r = await read(s); lit(r, 3, 'all three'); rec(`${tag} all three`, { rows: r.rows, summary: r.summary }); await closeP(s); r = await read(s); lit(r, 3, 'three, closed'); await pic(s, `${tag}-4-three-closed`)
    await openP(s); r = await read(s); check(`${tag} kept after reopening`, r.person === person && r.type === type && r.search === 'a', { p: r.person, t: r.type, q: r.search })
    await page.selectOption('#inFType', 'all'); await page.waitForTimeout(220); r = await read(s); lit(r, 2, 'one cleared')
    await tapIt(s, '#inFiltersClear'); await page.waitForTimeout(220); r = await read(s); unlit(r, 'Clear filters'); check(`${tag} Clear filters empties the boxes`, r.person !== person && r.search === '' && r.type === 'all', r); await closeP(s)
  })
  await step(`${tag} around the calendar and the settings`, async () => {
    await openP(s); await page.selectOption('#inFPerson', person); await page.waitForTimeout(200); await closeP(s); const w = await read(s); lit(w, 1, 'before the calendar')
    await tapIt(s, '#inCalBtn'); await page.waitForTimeout(300); await pic(s, `${tag}-5-calendar`); const c = await read(s); lit(c, 1, 'on the calendar view')
    const at = await page.evaluate(() => { const b = document.querySelector('#inFiltersBtn'); const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { top: r.top, hit: !!e && (b === e || b.contains(e)) } }); check(`${tag} the button not covered on the calendar`, at.hit, at)
    const gear = page.locator('#inGear').filter({ visible: true })
    if (await gear.count()) {
      await tapIt(s, '#inGear'); await page.waitForTimeout(350); await pic(s, `${tag}-6-settings`); const g = await read(s); rec(`${tag} with settings open`, { n: g.n })
      await page.keyboard.press('Escape'); await page.waitForTimeout(350); const a = await read(s); lit(a, 1, 'after settings closed')
    } else note(`${tag}: no gear for this person`)
    await tapIt(s, '#inListBtn'); await page.waitForTimeout(250); const v = await read(s); lit(v, 1, 'back on the list')
    await openP(s); await tapIt(s, '#inFiltersClear'); await closeP(s); unlit(await read(s), 'cleared at the end')
  })
}
try {
  const s = await newPage(SZ); await signIn(s, 'ad', 'a')
  if (s.desk) {
    await step('S54 desktop keeps its boxes on the page', async () => {
      await toList(s); const r = await read(s); rec('S54 desktop', r)
      check('S54 desktop: no filter button drawn', !r.btnShown, r.btnShown); check('S54 desktop: the boxes stand on the page', r.panelShown, r.panelShown); await pic(s, 'd-1-boxes')
      const person = await s.page.evaluate(() => [...document.querySelector('#inFPerson').options].filter(o => !/ALL|Everyone/.test(o.textContent) && o.value !== 'all').map(o => o.value)[1])
      await s.page.selectOption('#inFPerson', person); await s.page.waitForTimeout(240); const one = await read(s); rec('S54 desktop Person alone', { rows: one.rows, summary: one.summary })
      check('S54 desktop summary names the filter', !!one.summary, one.summary); await pic(s, 'd-2-person')
      await s.page.selectOption('#inFPerson', { index: 0 }); await s.page.waitForTimeout(200)
    })
  } else {
    await phoneRound(s, 'S54admin')
    await as(s, 'us', 'us'); await phoneRound(s, 'S54member')
  }
  await s.ctx.close()
} finally { finish('jc-s54-' + SZ); await closeAll() }
