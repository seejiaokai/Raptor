// jc-f38 - S38: the Filter's look follows its state, on Admin → Users; every state measured, with a close-up beside the search box.
import { signIn, newPage, closeAll, finish, step, pic, picsFor, note, check, facts } from './jlib.mjs'
import { toUsers } from './jc-lib.mjs'
import { look, ticks, openF, closeF, tick, tap, onChipLook, SEARCH } from './jc-flib.mjs'
const SZ = process.env.SZ || 'd'
console.log('jc-f38 v1', SZ)
picsFor('jc-f38-' + SZ)
const rec = (k, v) => { facts[k] = v; note(`RECORD ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
let OFF, ONLOOK
const judge = async (s, name, n) => {
  const l = await look(s)
  const ok = n > 0
  check(`S38 ${name} label`, ok ? l.label === `Filter · ${n}` : l.label === 'Filter', l.label)
  if (ok) check(`S38 ${name} looks on`, l.filterLook.bg !== OFF.bg && l.filterLook.color !== OFF.color, l.filterLook)
  else check(`S38 ${name} looks off`, same(l.filterLook, OFF), l.filterLook)
  check(`S38 ${name} as tall as the search box`, Math.abs(l.filter.h - l.search.h) < 0.6, { filter: l.filter.h, search: l.search.h })
  return l
}
try {
  const s = await newPage(SZ); const { page } = s
  await signIn(s, 'ad', 'a'); await toUsers(s)
  await step('off', async () => {
    const l = await look(s); OFF = l.filterLook; rec('off look', l)
    await page.locator('#accFilter').scrollIntoViewIfNeeded(); await pic(s, 'f1-off', ['#accFilter', SEARCH], 30)
    check('S38 off: label', l.label === 'Filter', l.label)
    check('S38 off: as tall as the search box', Math.abs(l.filter.h - l.search.h) < 0.6, { filter: l.filter.h, search: l.search.h })
  })
  await step('open and empty is not lit', async () => {
    await openF(s); const l = await look(s); rec('open, no ticks', l.filterLook); await pic(s, 'f2-open-empty')
    check('S38 open with no tick does not look on', l.filterLook.bg === OFF.bg && l.filterLook.color === OFF.color, l.filterLook)
    check('S38 open with no tick keeps the word', l.label === 'Filter', l.label)
    await closeF(s)
  })
  for (const [group, label] of [['Seat', 'Pilots'], ['CAT', 'IP'], ['Role', 'Member'], ['Plans', 'Plans 142'], ['Squadron', '149']]) {
    await step(`one tick ${group}`, async () => {
      check(`S38 ${group} tick found`, await tick(s, label), label)
      const l = await judge(s, group, 1); rec(`${group} alone`, { label: l.label, showing: l.showing, ticks: await ticks(s) })
      await pic(s, `f3-${group}`)
      await tick(s, label); await judge(s, `${group} taken off`, 0); await closeF(s)
    })
  }
  await step('all together, closed and reopened', async () => {
    for (const x of ['Pilots', 'IP', 'Admin', 'Plans 142', '149']) await tick(s, x)
    ONLOOK = await onChipLook(s); rec('a ticked chip look', ONLOOK)
    let l = await judge(s, 'five ticks', 5); rec('five', { showing: l.showing, ticks: await ticks(s) })
    await closeF(s); l = await judge(s, 'five ticks closed', 5); rec('five closed', l); await pic(s, 'f4-five-closed')
    await page.locator('#accFilter').scrollIntoViewIfNeeded(); await pic(s, 'f4b-five-closeup', ['#accFilter', SEARCH], 24)
    await openF(s); check('S38 ticks kept after reopening', (await ticks(s)).length === 5, await ticks(s))
    await tick(s, 'Pilots'); await tick(s, 'IP'); await tick(s, 'Admin'); await tick(s, 'Plans 142')
    await judge(s, 'one left', 1); await tick(s, '149'); await judge(s, 'last tick off', 0); await closeF(s)
  })
  await step('Clear all and the showing line Clear', async () => {
    await tick(s, 'WSOs'); await tick(s, 'A'); await judge(s, 'two ticks', 2)
    await tap(s, page.locator('#accFilterClear')); await page.waitForTimeout(200)
    check('S38 Clear all: no tick', (await ticks(s)).length === 0, await ticks(s)); await judge(s, 'after Clear all', 0); await closeF(s)
    await tick(s, 'WSOs'); await closeF(s); let l = await judge(s, 'one tick closed', 1); rec('showing with one', l.showing)
    const c = page.locator('#page-admin').getByRole('button', { name: 'Clear', exact: true }).filter({ visible: true })
    if (await c.count()) { await tap(s, c.first()); await page.waitForTimeout(200); l = await judge(s, 'after the line Clear', 0); check('S38 the line Clear ends the filter', !/^Showing/.test(l.showing || ''), l.showing) } else note('no Clear in the line')
  })
  await step('search text alone', async () => {
    await page.fill(SEARCH, 'Hunt'); await page.waitForTimeout(240)
    const l = await look(s); rec('search alone', { label: l.label, showing: l.showing, look: l.filterLook }); await pic(s, 'f5-search-alone')
    check('S38 search alone leaves Filter unlit', l.label === 'Filter' && same(l.filterLook, OFF), { label: l.label, look: l.filterLook })
    check('S38 search alone keeps the height', Math.abs(l.filter.h - l.search.h) < 0.6, { f: l.filter.h, s: l.search.h })
    await page.fill(SEARCH, ''); await page.waitForTimeout(200)
  })
  await s.ctx.close()
} finally { finish('jc-f38-' + SZ); await closeAll() }
