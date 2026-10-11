// W3 scenarios 1-3 (desktop, then the phone)   node scripts/handpass/gi-w3a.mjs 1d 2d 3d 1p 2p 3p
import * as L from './gi-w3-lib.mjs'
const { world, counts, fmt, shot, shotSec, shotHead, shotWin, save, retime, undoOnce, redoOnce, reload, toWeek, press, errs, DESK, PHONE, ritual } = L
const only = process.argv.slice(2)
const want = k => !only.length || only.includes(k)
const log = (...a) => console.log(...a)
const allOne = c => c.n.every(x => x === c.n[0]) && c.agree
const is = (c, v) => c.n.every(x => x === v)

async function toView(p) { if (await p.locator('a[data-page="viewsched"]:visible').count()) await L.toView(p); else { await p.evaluate(() => window.go('viewsched')); await p.waitForTimeout(800) } }

async function s1(vp, touch, tag) {
  const rec = { n: 1, size: tag, did: [], pics: [], counts: [] }
  const { ctx, page, pub } = await world(vp, touch); rec.pub = pub
  const c0 = await counts(page, { touch }); rec.counts.push(['clean', fmt(c0)]); log('S1', tag, 'CLEAN', fmt(c0))
  rec.pics.push(await shotHead(page, `s1-${tag}-head-clean`))
  const val = await retime(page, '14:30', touch); rec.did.push(`typed 14:30 over the start box of the one row (box now reads ${val})`)
  const c1 = await counts(page, { touch }); rec.counts.push(['after re-time', fmt(c1)]); log('S1', tag, 'AFTER RETIME', fmt(c1))
  rec.lines = c1.lines
  rec.pics.push(await shotHead(page, `s1-${tag}-head-retimed`))
  rec.pics.push(await shotSec(page, `s1-${tag}-row-retimed`, 'week'))
  rec.rowWeek = JSON.stringify(await L.rowInfo(page, 'week'))
  await toView(page)
  rec.viewOnly = JSON.stringify(await L.rowInfo(page, 'vweek'))
  rec.pics.push(await shotSec(page, `s1-${tag}-viewonly-row`, 'vweek'))
  log('S1 view-only row', rec.viewOnly)
  const rr = await ritual(page, touch, rec)
  rec.verdict = (is(c0, 0) && c0.agree) && (is(c1, 1) && c1.agree) && /"14:00"/.test(rec.viewOnly) && /\["14:00","15:00"\]/.test(rec.viewOnly) ? 'PASS' : 'FAIL'
  save(`s1-${tag}`, { rec, c0, c1, rr }); await ctx.close(); return rec
}

async function s2(vp, touch, tag) {
  const rec = { n: 2, size: tag, did: [], pics: [], counts: [] }
  const { ctx, page, pub } = await world(vp, touch); rec.pub = pub
  await retime(page, '14:30', touch); rec.did.push('typed 14:30 over the start box')
  await toWeek(page)
  // real press on the day's "1 pending"
  const bb = page.locator('#eWeek .day:not(.peek)').nth(L.DI).locator('.dstat .dpend').first()
  await bb.scrollIntoViewIfNeeded(); await press(touch, bb); await page.waitForTimeout(800)
  rec.did.push('pressed the day head\'s "1 pending"')
  const tab = page.locator('.chgwin .win-tab', { hasText: /To go out/ }).first()
  await press(touch, tab); await page.waitForTimeout(500); rec.did.push('opened the To go out tab')
  rec.title = await page.evaluate(() => document.querySelector('.chgwin .win-ttl')?.innerText.replace(/\s+/g, ' ').trim())
  rec.head = await page.evaluate(() => document.querySelector('.chgwin .cw-out .pl-head')?.innerText.replace(/\s+/g, ' ').trim())
  rec.lines = await page.evaluate(() => [...document.querySelectorAll('.chgwin .cw-out .pl-item')].map(i => ({ where: i.querySelector('.pl-where')?.innerText, who: i.querySelector('.pl-who')?.innerText.replace(/\n/g, ' '), names: i.querySelector('.pl-names')?.innerText, chg: i.querySelector('.pl-chg')?.innerText })))
  log('S2 title:', rec.title, '| head:', rec.head, '| lines:', JSON.stringify(rec.lines))
  rec.pics.push(await shotWin(page, `s2-${tag}-togo`))
  // tap the line -> the schedule goes to the one row
  const item = page.locator('.chgwin .cw-out .pl-item').first()
  await press(touch, item); await page.waitForTimeout(350)
  rec.flash = await page.evaluate(() => { const rows = [...document.querySelectorAll('#eWeek .day:not(.peek)')][2].querySelectorAll('.sec-grnd .pl-row'); const r = [...rows].find(r => /range safety brief/i.test(r.querySelector('.nm .ntx')?.textContent || '')); if (!r) return 'row not found'; const b = r.getBoundingClientRect(); const flashed = [r, ...r.querySelectorAll('*')].filter(e => /flash|land|hl|pulse|jump/i.test((e.className || '').toString())).map(e => e.className.toString().slice(0, 40)); return { inView: b.top >= 0 && b.bottom <= innerHeight && b.right > 0 && b.left < innerWidth, top: Math.round(b.top), bottom: Math.round(b.bottom), left: Math.round(b.left), flashed } })
  log('S2 after tap', JSON.stringify(rec.flash))
  rec.pics.push(await shot(page, `s2-${tag}-after-tap`))
  // All changes tab (on a phone a tap on a change shrinks the window to a slim bar: Show brings it back)
  { const show = page.locator('.chgwin .cw-barbtn').first(); if (await show.count() && await show.isVisible()) { await press(touch, show); await page.waitForTimeout(500); rec.did.push('pressed Show on the slim bar') } }
  const all = page.locator('.chgwin .win-tab', { hasText: /All changes/ }).first()
  await press(touch, all); await page.waitForTimeout(600)
  rec.allItems = await page.evaluate(() => [...document.querySelectorAll('.chgwin .cw-body > *')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' || ').slice(0, 1500))
  rec.allMatches = await page.evaluate(() => [...document.querySelectorAll('.chgwin .cw-body button, .chgwin .cw-body .pl-item, .chgwin .cw-body .cw-item, .chgwin .cw-body [data-plix]')].filter(e => /range safety brief/i.test(e.innerText)).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  log('S2 all changes items about the input:', JSON.stringify(rec.allMatches))
  rec.pics.push(await shotWin(page, `s2-${tag}-allchanges`))
  await press(touch, page.locator('.chgwin .win-x').first()); await page.waitForTimeout(300)
  const c1 = await counts(page, { touch }); rec.counts.push(['with window', fmt(c1)])
  const rr = await ritual(page, touch, rec)
  rec.verdict = '(judge below)'
  save(`s2-${tag}`, { rec, c1, rr }); await ctx.close(); return rec
}

async function s3(vp, touch, tag) {
  const rec = { n: 3, size: tag, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(vp, touch); rec.pub = pub
  const step = async (label, c) => { rec.counts.push([label, fmt(c)]); log('S3', tag, label, fmt(c)); return c }
  await retime(page, '14:30', touch)
  const a1 = await step('re-time', await counts(page, { touch }))
  rec.res = {}
  rec.res.retime = is(a1, 1) && a1.agree
  // act A: Undo the re-time
  rec.undoRetime = await undoOnce(page, touch)
  const a2 = await step('undo the re-time', await counts(page, { touch })); rec.res.undoRetime = is(a2, 0) && a2.agree
  // act B: take Tally off by dragging his puck off the row
  await toWeek(page)
  const t = await L.dragOffRow(page, 'Tally', touch); rec.did.push('dragged Tally\'s puck off the row to empty page: ' + JSON.stringify(t))
  log('  tally drag', JSON.stringify(t), 'row:', JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks), 'toast:', await L.toastText(page))
  rec.tallyRow = JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks)
  const b1 = await step('Tally taken off', await counts(page, { touch, keepWin: true }))
  rec.lines.tally = b1.lines
  rec.pics.push(await shotWin(page, `s3-${tag}-tally-togo`).catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300)
  rec.res.tally = is(b1, 1) && b1.agree
  // act C: Hunter too (right-click on desktop; the same drag on a phone)
  let h
  if (!touch) {
    const loc = L.rowPuckLoc(page, 'Hunter'); const bx = await L.boxOf(loc)
    await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2, { button: 'right' }); await page.waitForTimeout(700)
    h = { how: 'right-click on his puck' }
  } else { h = await L.dragOffRow(page, 'Hunter', touch); h.how = 'touch hold-drag off the row' }
  rec.did.push('took Hunter off: ' + JSON.stringify(h))
  log('  hunter', JSON.stringify(h), 'row:', JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks), 'toast:', await L.toastText(page))
  rec.hunterRow = JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks)
  const b2 = await step('Hunter taken off too', await counts(page, { touch, keepWin: true }))
  rec.lines.both = b2.lines
  rec.pics.push(await shotWin(page, `s3-${tag}-both-togo`).catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300)
  rec.pics.push(await shotSec(page, `s3-${tag}-row-both-off`, 'week'))
  rec.res.both = is(b2, 2) && b2.agree
  // ritual: Undo once, Redo, then Undo both, Redo both, reload
  rec.undo = await undoOnce(page, touch); const u1 = await step('ritual: Undo once', await counts(page, { touch }))
  rec.row_u = JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks)
  rec.redo = await redoOnce(page, touch); const r1 = await step('ritual: Redo', await counts(page, { touch }))
  rec.undo2 = await undoOnce(page, touch); await undoOnce(page, touch); const u2 = await step('Undo both', await counts(page, { touch }))
  rec.row_u2 = JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks)
  rec.res.undoBoth = is(u2, 0) && u2.agree
  await redoOnce(page, touch); await redoOnce(page, touch); const r2 = await step('Redo both', await counts(page, { touch }))
  await reload(page); const x = await step('after reload', await counts(page, { touch }))
  rec.row_x = JSON.stringify((await L.rowInfo(page, 'week'))[0]?.pucks)
  rec.verdict = Object.values(rec.res).every(Boolean) && is(u1, 1) && is(r1, 2) && is(r2, 2) && is(x, 2) ? 'PASS' : 'FAIL'
  save(`s3-${tag}`, { rec, a1, a2, b1, b2, u1, r1, u2, r2, x }); await ctx.close(); return rec
}

const run = async (k, f, vp, touch, tag) => { if (!want(k)) return; try { await f(vp, touch, tag) } catch (e) { console.log('SCENARIO', k, 'CRASHED', String(e.stack || e).split('\n').slice(0, 5).join(' | ')) } }
await run('1d', s1, DESK, false, 'desk')
await run('2d', s2, DESK, false, 'desk')
await run('3d', s3, DESK, false, 'desk')
await run('1p', s1, PHONE, true, 'phone')
await run('2p', s2, PHONE, true, 'phone')
await run('3p', s3, PHONE, true, 'phone')
console.log('errs', errs)
process.exit(0)
