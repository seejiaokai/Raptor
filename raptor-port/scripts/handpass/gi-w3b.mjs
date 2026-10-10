// W3 scenarios 4-6 (desktop)   node scripts/handpass/gi-w3b.mjs 4 5a 5b 6a 6b
import * as L from './gi-w3-lib.mjs'
const { world, counts, fmt, shot, shotSec, shotHead, shotWin, save, retime, undoOnce, redoOnce, reload, toWeek, toBoard, press, errs, DESK, ritual } = L
const only = process.argv.slice(2)
const want = k => !only.length || only.includes(k)
const log = (...a) => console.log(...a)
const is = (c, v) => c.n.every(x => x === v) && c.agree
const rowPucks = async p => (await L.rowInfo(p, 'week'))[0]?.pucks
const view = async p => { if (await p.locator('a[data-page="viewsched"]:visible').count()) await L.toView(p); else { await p.evaluate(() => window.go('viewsched')); await p.waitForTimeout(800) } }
const togo = async (p, label, rec) => { const c = await counts(p, { keepWin: false }); rec.counts.push([label, fmt(c)]); log('  ', label, fmt(c)); rec.lines[label] = c.lines; return c }

async function s4() {
  const rec = { n: 4, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  await togo(page, 'clean', rec)
  rec.addToast = await L.dragAdd(page, 'Anvil'); rec.did.push('dragged Anvil from the crew list onto Hunter\'s puck on the week')
  rec.pucksAfterAdd = await rowPucks(page); log('  pucks', JSON.stringify(rec.pucksAfterAdd), 'toast:', rec.addToast)
  rec.tags = await L.allTags(page); log('  tags', JSON.stringify(rec.tags))
  rec.tagStyle = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day:not(.peek) .seat[data-alp]')].map(s => { const c = getComputedStyle(s, '::after'); return { who: s.querySelector('.nm')?.textContent, content: c.content, bg: c.backgroundColor, border: c.border || (c.borderTopWidth + ' ' + c.borderTopStyle + ' ' + c.borderTopColor), color: c.color } }))
  log('  tagStyle', JSON.stringify(rec.tagStyle))
  const a1 = await togo(page, 'Anvil added', rec); rec.addOK = is(a1, 1)
  rec.pics.push(await shotSec(page, 's4-desk-row-anvil-added', 'week'))
  rec.pics.push(await shotHead(page, 's4-desk-head-1pending'))
  // sign and publish AL1 through the sign-off line
  const pub1 = await L.signAndPublish(page, L.DI); rec.did.push('signed the four boxes and pressed Publish AL1 on the board: ' + JSON.stringify(pub1))
  log('  publish', JSON.stringify(pub1))
  const a2 = await togo(page, 'after Publish AL1', rec)
  rec.amendAfter = a2.c
  rec.pics.push(await shotHead(page, 's4-desk-head-after-al1'))
  await toWeek(page)
  await page.locator('#eWeek .day:not(.peek)').nth(2).scrollIntoViewIfNeeded()
  rec.pics.push(await L.shotAmend(page, 's4-desk-amendments-box'))
  rec.pucksEdit = await rowPucks(page)
  await view(page)
  rec.viewOnly = JSON.stringify((await L.rowInfo(page, 'vweek'))[0]?.pucks); log('  view-only pucks', rec.viewOnly)
  rec.pics.push(await shotSec(page, 's4-desk-viewonly-row', 'vweek'))
  const rr = await ritual(page, false, rec)
  const five = (JSON.parse(rec.viewOnly || '[]') || []).length === 5
  rec.verdict = (is(a1, 1) && a1.agree && is(a2, 0) && five && /AL1/.test(a2.c) && rec.pucksAfterAdd.filter(x => /alp/.test(x)).length === 1 && /^Anvil \[alp/.test(rec.pucksAfterAdd.find(x => /alp/.test(x)) || '')) ? 'PASS' : 'FAIL'
  save('s4', { rec, a1, a2, rr }); await ctx.close()
}

async function s5(order) {
  const rec = { n: 5, order, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  if (order === 'a') {
    await retime(page, '14:30'); rec.did.push('typed 14:30 over the start box')
    const c1 = await togo(page, 're-time', rec)
    rec.addToast = await L.dragAdd(page, 'Blade'); rec.did.push('dragged Blade from the crew list onto Hunter\'s puck')
  } else {
    rec.addToast = await L.dragAdd(page, 'Blade'); rec.did.push('dragged Blade from the crew list onto Hunter\'s puck')
    const c1 = await togo(page, 'Blade added', rec)
    await retime(page, '14:30'); rec.did.push('typed 14:30 over the start box')
  }
  rec.pucks = await rowPucks(page); log('  pucks', JSON.stringify(rec.pucks))
  const c2 = await counts(page, { keepWin: true }); rec.counts.push(['both done', fmt(c2)]); log('  both', fmt(c2)); rec.lines.both = c2.lines
  rec.pics.push(await shotWin(page, `s5${order}-desk-togo`).catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300)
  rec.pics.push(await shotSec(page, `s5${order}-desk-row`, 'week'))
  rec.pics.push(await shotHead(page, `s5${order}-desk-head`))
  const rr = await ritual(page, false, rec)
  rec.pucksAfterReload = await rowPucks(page); log('  pucks after reload', JSON.stringify(rec.pucksAfterReload))
  rec.verdict = is(c2, 2) && /^Blade \[alp/.test(rec.pucks.find(x => /^Blade/.test(x)) || '') ? 'PASS' : 'FAIL'
  save('s5' + order, { rec, c2, rr }); await ctx.close()
}

async function s6a() {
  const rec = { n: 6, part: 'a', did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  await toBoard(page)
  const idx = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].findIndex(r => /range safety brief/i.test((r.querySelector('textarea.ain, input.ain') || {}).value || '')))
  const r = page.locator('#schedBoard .sb-panel.grnd .sb-arow').nth(idx)
  await r.scrollIntoViewIfNeeded(); await r.locator('[data-grdel]').first().click(); await page.waitForTimeout(900)
  rec.did.push('pressed ✕ on the one row on the board'); rec.toast = await L.toastText(page); log('  toast', rec.toast)
  rec.pics.push(await shotSec(page, 's6a-desk-board-after-x', 'board'))
  const c1 = await togo(page, 'row taken off (✕)', rec)
  await L.closeAny(page)
  await L.lookAt(page, 'Original')
  rec.look = await L.pressLoad(page); log('  look', JSON.stringify(rec.look))
  rec.pics.push(await shotHead(page, 's6a-desk-look-discard'))
  rec.discardN = (/Discard (\d+) edit/i.exec(JSON.stringify(rec.look.after)) || [])[1]
  // leave the look through its own "Keep editing"
  const keep = page.locator('.dprev-cancel').first(); if (await keep.count()) await keep.click().catch(() => {}); await page.waitForTimeout(500); await L.lookAt(page, 'Live working copy').catch(e => log('  exit look failed', String(e).slice(0, 80))); rec.did.push('left the look with Keep editing, then chose Live working copy from the plan menu')
  const rr = await ritual(page, false, rec)
  rec.verdict = is(c1, 1) && rec.discardN === '1' ? 'PASS' : 'FAIL'
  save('s6a', { rec, c1, rr }); await ctx.close()
}
async function s6b() {
  const rec = { n: 6, part: 'b', did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  await retime(page, '14:30'); rec.did.push('typed 14:30 over the start box')
  const c1 = await togo(page, 're-time only', rec)
  await L.lookAt(page, 'Original')
  rec.look = await L.pressLoad(page); log('  look', JSON.stringify(rec.look))
  rec.pics.push(await shotHead(page, 's6b-desk-look-retime-only'))
  rec.discardN = (/Discard (\d+) edit/i.exec(JSON.stringify(rec.look.after)) || [])[1] ?? 'no Discard button'
  const keep = page.locator('.dprev-cancel').first(); if (await keep.count()) await keep.click().catch(() => {}); await page.waitForTimeout(500); await L.lookAt(page, 'Live working copy').catch(e => log('  exit look failed', String(e).slice(0, 80))); rec.did.push('left the look with Keep editing, then chose Live working copy from the plan menu')
  const rr = await ritual(page, false, rec)
  rec.verdict = is(c1, 1) && (rec.discardN === '0' || rec.discardN === 'no Discard button') ? 'PASS?' : 'FAIL'
  save('s6b', { rec, c1, rr }); await ctx.close()
}

const run = async (k, f) => { if (!want(k)) return; try { await f() } catch (e) { console.log('SCENARIO', k, 'CRASHED', String(e.stack || e).split('\n').slice(0, 5).join(' | ')) } }
await run('4', s4)
await run('5a', () => s5('a'))
await run('5b', () => s5('b'))
await run('6a', s6a)
await run('6b', s6b)
console.log('errs', errs)
process.exit(0)
