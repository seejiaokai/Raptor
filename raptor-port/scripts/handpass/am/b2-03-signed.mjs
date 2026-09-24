/* Walker B2, item 3 (D95, D102) — the "Signed ALn" line. 25 Sep 26.
   Friday of the everything-week (a DRAFT day, live working copy) is published as the Original signed by four people
   (the first name each select offers), then changed on the board and published as AL1 signed by four OTHER people (the
   fourth name each select offers), then changed again and HALF-signed for AL2 by two more (the sixth name). All
   through the app's own selects, Publish day, Publish AL1 and a drag. Then: which four each surface names. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b2'
const L = await import('./b2-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishDay, publishAL, go, STATE, dragOnto, check, note, summary,
  viewPick, head, lookAt, pvTap, planMenuItems, menuClose, menuSwitch, altPlan, pvBar } = L
const SHOTS = process.env.HP_SHOTS
const SCR = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad'
const DI = 4
const allErrors = []
const line = (page, rootSel) => page.evaluate(sel => {
  const r = document.querySelector(sel); if (!r) return { none: 'no root ' + sel }
  const l = [...r.querySelectorAll('.signedln')].find(e => e.offsetWidth || e.offsetHeight)
  if (!l) return null
  return { text: l.innerText.replace(/\s+/g, ' ').trim(), tag: (l.querySelector('.verchip') || {}).innerText || '',
    names: [...l.querySelectorAll('.sl-n')].map(n => n.lastChild ? n.lastChild.textContent : ''),
    roles: [...l.querySelectorAll('.sl-n i')].map(i => getComputedStyle(i).display === 'none' ? '(hidden)' : i.innerText) }
}, rootSel)
const WEEK = `#eWeek .day[data-day="${DI}"]`, VIEW = `#vWeek .day[data-day="${DI}"]`, BOARD = '#schedBoard'
async function signSome(page, roles, pick) {
  const r = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of roles) {
    const sel = page.locator(`${r} select[data-sign="${role}"][data-signday="${DI}"]:visible`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[Math.min(pick, opts.length - 1)]); await page.waitForTimeout(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  return out
}
async function shotOf(page, name, rootSel) {
  const l = page.locator(`${rootSel} .signedln:visible`).first()
  const tgt = (await l.count()) ? l : page.locator(`${rootSel} .day-head:visible, ${rootSel} .board-sign:visible`).first()
  if (!(await tgt.count())) return
  await tgt.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(250)
  const b = await tgt.boundingBox(); if (!b) return
  const vw = page.viewportSize().width
  await page.screenshot({ path: `${SHOTS}/${name}.png`, clip: { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 70), width: Math.min(vw - Math.max(0, b.x - 8), b.width + 16), height: b.height + 110 } })
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const { browser, ctx, page, errors } = await openHi({ width: 1440, height: 900, state: STATE, dpr: 1 })
await editWeek(page)
/* a DRAFT day: no line anywhere */
check('draft day (Fri, before publishing) | no Signed line on the week', !(await line(page, WEEK)), JSON.stringify(await line(page, WEEK)))
check('draft day (Wed) | no Signed line on the week', !(await line(page, '#eWeek .day[data-day="2"]')))
const orig = await signDay(page, DI, 0)
console.log('ORIG signers', JSON.stringify(orig), JSON.stringify(await publishDay(page, DI)))
const O4 = [orig.cur, orig.sked, orig.plan, orig.appr]
console.log('head', JSON.stringify(await head(page, DI)))
let l = await line(page, WEEK)
check('Original published | the week names the Original\'s four', l && /ORIG/.test(l.tag) && same(l.names, O4), JSON.stringify(l))
/* a change, then AL1 by four OTHER people */
await board(page, DI)
const k1 = await page.evaluate(di => (document.querySelector(`#schedBoard .seat[data-slot^="g:${di}."]`) || document.querySelector(`#schedBoard .seat[data-slot^="${di}."]`) || {}).dataset?.slot, DI)
console.log('change 1 on', k1, '→', await dragOnto(page, k1, 'Vapor'))
const al1 = await signDay(page, DI, 3)
console.log('AL1 signers', JSON.stringify(al1), JSON.stringify(await publishAL(page, DI)))
const A4 = [al1.cur, al1.sked, al1.plan, al1.appr]
check('the two versions were signed by different people', !same(O4, A4), `ORIG ${O4} · AL1 ${A4}`)
/* a second change, and the next issue HALF-signed by two more */
const k2 = await page.evaluate(([di, k1]) => [...document.querySelectorAll(`#schedBoard .seat[data-slot]`)].map(e => e.dataset.slot).filter(k => /^[a-z]:/.test(k) && k.split(':')[1].startsWith(di + '.') && k !== k1)[0], [DI, k1])
console.log('change 2 on', k2, '→', await dragOnto(page, k2, 'Hunter'))
const half = await signSome(page, ['cur', 'sked'], 6)
console.log('half-signed AL2', JSON.stringify(half), JSON.stringify(await head(page, DI)))
l = await line(page, BOARD)
check('board strip | names AL1\'s four, not the half-signed boxes', l && l.tag === 'AL1' && same(l.names, A4), JSON.stringify(l))
await shotOf(page, 'b2-03-board-signed-al1', BOARD)
await closeBoard(page)
await editWeek(page)
l = await line(page, WEEK)
check('edit week | names AL1\'s four (the version the working copy sits on), not the live boxes', l && l.tag === 'AL1' && same(l.names, A4) && !l.names.includes(half.cur), JSON.stringify(l))
check('edit week (desktop) | role labels shown', l && l.roles.length === 4 && l.roles.every(r => r !== '(hidden)'), l && l.roles.join(','))
await shotOf(page, 'b2-03-week-signed-al1', WEEK)
/* previewing the Original (the plans menu): the Original's four, on the week and the board strip */
const looked = await lookAt(page, DI, /Original/)
l = await line(page, WEEK)
check('edit week, previewing the Original | names the Original\'s four', looked && l && /ORIG/.test(l.tag) && same(l.names, O4), `looked=${looked} ${JSON.stringify(l)}`)
await shotOf(page, 'b2-03-week-preview-orig', WEEK)
await pvTap(page, DI, 'data-golive')
await board(page, DI)
await planMenuItems(page, DI)
const lookedB = await page.locator('.wavemenu .wm[data-planpv]:visible').filter({ hasText: /Original/ }).count()
if (lookedB) { await page.locator('.wavemenu .wm[data-planpv]:visible').filter({ hasText: /Original/ }).first().click(); await page.waitForTimeout(700) } else await menuClose(page)
l = await line(page, BOARD)
check('board, previewing the Original | the strip names the Original\'s four', lookedB && l && /ORIG/.test(l.tag) && same(l.names, O4), `looked=${lookedB} ${JSON.stringify(l)}`)
await shotOf(page, 'b2-03-board-preview-orig', BOARD)
await pvTap(page, DI, 'data-golive')
/* a parked plan: on a PUBLISHED day the plans menu has no parked-plan preview — a tap on a plan SWITCHES to it (its
   row reads "tap to make it the live day"), and the working copy then sits on the same published version, so its line
   is right to stay. The one parked-plan PREVIEW the app draws is View-only Sched's drafts picker on an unpublished day
   (Wednesday: Plan A / Plan B) — checked below, on the view page. */
await closeBoard(page); await editWeek(page)
console.log('Fri head now', JSON.stringify(await head(page, DI)))
/* View-only Sched, admin: the issued face and the working-draft peek */
await go(page, 'viewsched'); await page.waitForTimeout(600)
l = await line(page, VIEW)
check('View-only Sched (admin) issued face | names AL1\'s four', l && l.tag === 'AL1' && same(l.names, A4), JSON.stringify(l))
await shotOf(page, 'b2-03-view-admin-issued', VIEW)
await viewPick(page, DI, 'working')
l = await line(page, VIEW)
check('View-only Sched (admin) working-draft peek | names the published version\'s (AL1) four', l && l.tag === 'AL1' && same(l.names, A4), JSON.stringify(l))
await shotOf(page, 'b2-03-view-admin-peek', VIEW)
await viewPick(page, DI, 'issued')
check('View-only Sched | a draft day (Wed) has no line', !(await line(page, '#vWeek .day[data-day="2"]')))
{ const sel = page.locator('#vWeek select[data-dver="2"]').first()
  if (await sel.count()) {
    const v = await sel.evaluate(s => [...s.options].map(o => o.value).find(x => x.startsWith('d:')))
    await sel.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sel.selectOption(v); await page.waitForTimeout(600)
    const bar = await page.evaluate(() => { const b = document.querySelector('#vWeek .day[data-day="2"] .dprev-bar'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : '' })
    check('View-only Sched | previewing a parked plan (Wed, drafts picker) shows no Signed line', !!bar && !(await line(page, '#vWeek .day[data-day="2"]')), 'bar: ' + bar)
    await shotOf(page, 'b2-03-view-parked-plan', '#vWeek .day[data-day="2"]')
    await sel.selectOption('live'); await page.waitForTimeout(400)
  } else note('parked plan preview', 'no drafts picker on Wednesday') }
await ctx.storageState({ path: `${SCR}/b2-world-signed.json` })
allErrors.push(...errors)
await browser.close()

/* the member */
{
  const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: `${SCR}/b2-world-signed.json`, dpr: 1, who: 'm' })
  await go(page, 'viewsched'); await page.waitForTimeout(600)
  let l = await line(page, VIEW)
  check('View-only Sched (member) issued face | names AL1\'s four', l && l.tag === 'AL1' && same(l.names, A4), JSON.stringify(l))
  await shotOf(page, 'b2-03-view-member-issued', VIEW)
  if (await page.locator(`#vWeek select[data-vwork="${DI}"]`).count()) {
    await viewPick(page, DI, 'working'); l = await line(page, VIEW)
    check('View-only Sched (member) working-draft peek | names AL1\'s four', l && l.tag === 'AL1' && same(l.names, A4), JSON.stringify(l))
    await viewPick(page, DI, 'issued')
  } else note('member peek', 'no working-draft selector for the member')
  allErrors.push(...errors)
  await browser.close()
}
/* the phone: names only */
{
  const { browser, page, errors } = await openHi({ width: 390, height: 844, state: `${SCR}/b2-world-signed.json`, dpr: 3 })
  await editWeek(page)
  let l = await line(page, WEEK)
  check('phone edit week | names only (no role labels), AL1\'s four', l && l.roles.every(r => r === '(hidden)') && same(l.names, A4), JSON.stringify(l))
  await shotOf(page, 'b2-03-phone-week', WEEK)
  await board(page, DI)
  l = await line(page, BOARD)
  check('phone board strip | names only, AL1\'s four', l && l.roles.every(r => r === '(hidden)') && same(l.names, A4), JSON.stringify(l))
  await shotOf(page, 'b2-03-phone-board', BOARD)
  await closeBoard(page)
  await go(page, 'viewsched'); await page.waitForTimeout(600)
  l = await line(page, VIEW)
  check('phone View-only Sched | names only, AL1\'s four', l && l.roles.every(r => r === '(hidden)') && same(l.names, A4), JSON.stringify(l))
  await shotOf(page, 'b2-03-phone-view', VIEW)
  allErrors.push(...errors)
  await browser.close()
}
check('no browser errors (every context)', allErrors.length === 0, allErrors.join(' | '))
summary('b2-03')
