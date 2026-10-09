// Walker C, script 2 — scenario 34 (Ranger, desktop), the Ranger/Saber halves of 35, and the phone comparisons for 35, 36, 37
import * as L from './ivet-C-lib.mjs'
import { readFileSync } from 'node:fs'
const keep = JSON.parse(readFileSync(L.SCR + '/ivet-C-1-keep.json', 'utf8'))
const GR = [
  { n: 2, ppl: ['Wisp', 'Ace'] }, { n: 4, ppl: ['Zulu', 'Blade', 'Hex', 'Cinch'] },
  { n: 9, ppl: ['Vapor', 'Ranger', 'Echo', 'Drifter', 'Kraken', 'Basher', 'Static', 'Ghost', 'Anvil'] },
  { n: 14, ppl: ['Widget', 'Otter', 'Marlin', 'Nomad', 'Torch', 'Piston', 'Reaper', 'Ridge', 'Trident', 'Vandal', 'Comet', 'Cobra', 'Bolt', 'Forge'] },
]
const rowsNow = p => p.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => ({ iid: t.getAttribute('data-iid'), name: t.querySelector('[data-label="Name"]').textContent, text: t.innerText.replace(/\s+/g, ' ') })))

/* ---------------- 34: Ranger, desktop ---------------- */
let { ctx, page } = await L.openState('desk-saber', L.DESK, 'us', 'us', false)
await L.step('34', 'desktop', 'Ranger', async () => {
  await L.toList(page, false)
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(250)
  const total = (await rowsNow(page)).length
  const problems = [], notes = [], pics = []
  for (const g of GR) {
    const last = [...g.ppl].sort((a, b) => a.localeCompare(b)).at(-1)
    const pid = await L.csId(page, last)
    await page.selectOption('#inFPerson', pid); await page.waitForTimeout(300)
    const rows = await rowsNow(page)
    const exp = await page.evaluate(pid => { const s = new Set(); for (const r of window.INPUTS) if (r.person === pid && !/SANS/.test(r.type)) s.add(r.grp || r.iid); return s.size }, pid)
    const mine = rows.find(r => r.text.includes('C32 g' + g.n))
    const want = [...g.ppl].sort((a, b) => a.localeCompare(b)).join(', ')
    if (!mine) problems.push(`g${g.n}: group not visible with Person=${last}`)
    else if (mine.name !== want) problems.push(`g${g.n}: row names "${mine.name}" not all of "${want}"`)
    if (rows.length !== exp) problems.push(`g${g.n} Person=${last}: ${rows.length} rows shown, ${exp} expected`)
    const stray = rows.filter(r => !r.text.includes('C32 g' + g.n)).filter(r => !r.name.split(', ').includes(last))
    if (stray.length) problems.push(`g${g.n}: other rows not involving ${last}: ${stray.map(r => r.name).join('/')}`)
    pics.push(await L.shot(page, `34-desk-person-${last}`))
    await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(250)
    const back = (await rowsNow(page)).length
    if (back !== total) problems.push(`g${g.n}: clearing the Person filter shows ${back} rows, not ${total}`)
    await page.fill('#inFSearch', last); await page.waitForTimeout(300)
    const srows = await rowsNow(page)
    const smine = srows.find(r => r.text.includes('C32 g' + g.n))
    if (!smine) problems.push(`g${g.n}: search "${last}" hides the group`)
    else if (smine.name !== want) problems.push(`g${g.n}: search "${last}" shows names "${smine.name}"`)
    const sstray = srows.filter(r => !r.text.toLowerCase().includes(last.toLowerCase()))
    if (sstray.length) problems.push(`g${g.n}: search "${last}" also shows rows without it: ${sstray.map(r => r.name).join('/')}`)
    pics.push(await L.shot(page, `34-desk-search-${last}`))
    await page.fill('#inFSearch', ''); await page.waitForTimeout(250)
    const back2 = (await rowsNow(page)).length
    if (back2 !== total) problems.push(`g${g.n}: clearing the search shows ${back2} rows, not ${total}`)
    notes.push(`${last}: Person filter ${rows.length} rows (group "${mine?.name.length > 60 ? mine.name.slice(0, 60) + '…' : mine?.name}"), search ${srows.length} rows`)
  }
  L.rec('34', 'desktop', 'Ranger', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `list started at ${total} rows; for each group the Person filter set to its last name (Wisp/Zulu/Vapor/Widget) and a search for it left that group as ONE row with all its names, unrelated rows filtered out, and both clears restored ${total}. ${notes.join(' ; ')}`, pics.slice(0, 8))
})

/* ---------------- 35 (Ranger's half) ---------------- */
await L.step('35b', 'desktop', 'Ranger', async () => {
  await L.toList(page, false)
  await page.selectOption('#inFPerson', 'all')
  const self = await L.fileInput(page, { type: 'Meeting', person: 'Ranger', from: '2026-08-05', title: 'C35 Ranger self', rmk: 'C35 Ranger self' }, false)
  await page.fill('#inFSearch', 'C35'); await page.waitForTimeout(300)
  const a = await L.deskRow(page, self[0].iid), b = await L.deskRow(page, keep.m35.forR.iid), c = await L.deskRow(page, keep.m35.self.iid)
  const pic = await L.shot(page, '35-desk-ranger-reads')
  await page.locator(`#inBody tr[data-iid="${keep.m35.forR.iid}"] [data-testid="in-open"]`).click(); await page.locator(L.WIN).waitFor()
  const stamp = await page.locator('[data-testid="inped-placed"]').textContent()
  const pic2 = await L.shot(page, '35-desk-ranger-window-stamp')
  await page.locator('#inpEditCancel').click()
  await page.fill('#inFSearch', '')
  keep.m35.ranger = { selfBy: a.by, forRangerBy: b.by, saberSelfBy: c.by, stamp, selfIid: self[0].iid, pics: [pic, pic2] }
  console.log('35b', JSON.stringify(keep.m35.ranger))
})
await L.saveState(ctx, 'desk-ranger')
await ctx.close()

/* ---------------- 35 as Saber, reading Ranger's own input ---------------- */
;({ ctx, page } = await L.openState('desk-ranger', L.DESK, 'ad', 'a', false))
await L.step('35c', 'desktop', 'Saber', async () => {
  await L.toList(page, false)
  await page.fill('#inFSearch', 'C35'); await page.waitForTimeout(300)
  const a = await L.deskRow(page, keep.m35.ranger.selfIid), b = await L.deskRow(page, keep.m35.forR.iid), c = await L.deskRow(page, keep.m35.self.iid)
  const pic = await L.shot(page, '35-desk-saber-rereads')
  await page.locator(`#inBody tr[data-iid="${keep.m35.ranger.selfIid}"] [data-testid="in-open"]`).click(); await page.locator(L.WIN).waitFor()
  const stampSelf = await page.locator('[data-testid="inped-placed"]').count() ? await page.locator('[data-testid="inped-placed"]').textContent() : '(none)'
  await page.locator('#inpEditCancel').click()
  const s = keep.m35
  const ok = s.saber.selfBy === '' && s.saber.otherBy === 'By Saber' && /Placed by Saber for Ranger · /.test(s.saber.stamp) &&
    s.ranger.selfBy === '' && s.ranger.forRangerBy === 'By Saber' && s.ranger.saberSelfBy === '' && /Placed by Saber for Ranger · /.test(s.ranger.stamp) &&
    a.by === '' && b.by === 'By Saber' && c.by === ''
  L.rec('35', 'desktop (+ phone comparison below)', 'Saber and Ranger', ok ? 'PASS' : 'FAIL',
    `AS SABER: his own input By="${s.saber.selfBy}", the one he filed for Ranger By="${s.saber.otherBy}", window stamp "${s.saber.stamp}"; Ranger's own input By="${a.by}". AS RANGER: his own By="${s.ranger.selfBy}", Saber's for him By="${s.ranger.forRangerBy}", Saber's own input By="${s.ranger.saberSelfBy}", window stamp "${s.ranger.stamp}"; Saber's re-read of Ranger-filed own stamp "${stampSelf}". Phone: ${keep.m35.phone || '(see 35p)'}`,
    [...s.saber.pics, ...s.ranger.pics, pic])
  await page.fill('#inFSearch', '')
})
await ctx.close()

/* ---------------- phone comparison (Saber), by touch ---------------- */
;({ ctx, page } = await L.openState('desk-ranger', L.PHONE, 'ad', 'a', true))
await L.step('35p', 'phone', 'Saber', async () => {
  await L.toList(page, true)
  const filt = async q => { await page.locator('#inFiltersBtn').tap(); await page.fill('#inFSearch', q); await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(300) }
  await filt('C35')
  const cards = {}
  for (const [k, iid] of Object.entries({ saberSelf: keep.m35.self.iid, forRanger: keep.m35.forR.iid, rangerSelf: keep.m35.ranger.selfIid })) cards[k] = await L.phoneCard(page, iid)
  const pic = await L.shot(page, '35-phone-cards')
  await filt('C36')
  const incl = (await L.phoneCard(page, (await page.evaluate(() => window.INPUTS.find(r => r.title === 'C36 incl')?.iid)))), excl = await L.phoneCard(page, await page.evaluate(() => window.INPUTS.find(r => r.title === 'C36 excl')?.iid))
  const pic36 = await L.shot(page, '36-phone-cards')
  await filt('C37')
  const av = await L.phoneCard(page, keep.m37.av[0].iid), al = await L.phoneCard(page, keep.m37.al[0].iid)
  const pic37 = await L.shot(page, '37-phone-cards')
  await filt('')
  const out = { saberSelf: cards.saberSelf?.by, forRanger: cards.forRanger?.by, rangerSelf: cards.rangerSelf?.by, incl: incl?.by, excl: excl?.by, av: av?.by, al: al?.by, avText: av?.text, alText: al?.text }
  console.log('35p', JSON.stringify(out), JSON.stringify(cards.forRanger))
  keep.m35.phone = `phone cards: Saber's own By="${out.saberSelf}", for Ranger By="${out.forRanger}", Ranger's own By="${out.rangerSelf}"; C36 groups By="${out.incl}"/"${out.excl}"; ALL AVAIL card By="${out.av}", ALL card By="${out.al}"`
  L.rec('35p/36p/37p', 'phone', 'Saber', 'RECORDED', keep.m35.phone + `. Cards: ${JSON.stringify({ forRanger: cards.forRanger?.text, incl: incl?.text, av: av?.text, al: al?.text })}`, [pic, pic36, pic37])
})
await ctx.close()
L.savePartial('2')
console.log('errors:', L.errs)
await L.browser.close()
