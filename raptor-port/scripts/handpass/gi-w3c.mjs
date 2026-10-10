// W3 scenarios 7-10 (desktop)   node scripts/handpass/gi-w3c.mjs 7a 7b 7c 8 9 10
import * as L from './gi-w3-lib.mjs'
const { world, counts, fmt, shot, shotSec, shotHead, shotWin, save, retime, undoOnce, redoOnce, reload, toWeek, toBoard, login, press, errs, DESK, ritual, FOUR, TITLE } = L
const only = process.argv.slice(2)
const want = k => !only.length || only.includes(k)
const log = (...a) => console.log(...a)
const is = (c, v) => c.n.every(x => x === v) && c.agree
const rowPucks = async p => (await L.rowInfo(p, 'week'))[0]?.pucks
const togo = async (p, label, rec, opts = {}) => { const c = await counts(p, opts); rec.counts.push([label, fmt(c)]); log('  ', label, fmt(c)); rec.lines[label] = c.lines; return c }
const g4BoardIdx = p => p.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].findIndex(r => /range safety brief/i.test((r.querySelector('textarea.ain, input.ain') || {}).value || '')))

async function s7a() {
  const rec = { n: 7, part: 'a-CX', did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  await toBoard(page)
  const idx = await g4BoardIdx(page)
  const r = page.locator('#schedBoard .sb-panel.grnd .sb-arow').nth(idx)
  await r.scrollIntoViewIfNeeded(); await r.locator('[data-grcx]').first().click(); await page.waitForTimeout(700)
  rec.did.push('pressed CX on the one row on the board')
  rec.modal = await page.evaluate(() => { const els = [...document.querySelectorAll('div, section, aside')].filter(e => e.offsetParent !== null && /^\s*Cancel this item/.test(e.innerText || '') && e.innerText.length < 400); els.sort((x, y) => x.innerText.length - y.innerText.length); let m = els[0]; if (!m) return 'no dialog found'; while (m && !m.querySelector('input,textarea')) m = m.parentElement; if (!m) return 'no input found'; m.setAttribute('data-gi', 'cx'); return m.innerText.replace(/\s+/g, ' ').slice(0, 200) }); log('  modal:', rec.modal)
  rec.pics.push(await shot(page, 's7a-desk-cx-question'))
  await page.locator('[data-gi="cx"] input, [data-gi="cx"] textarea').first().fill('Range closed'); await page.waitForTimeout(200)
  await page.locator('[data-gi="cx"] button', { hasText: /^Cancel line/ }).first().click(); await page.waitForTimeout(900)
  rec.did.push('typed the reason "Range closed" and pressed "Cancel line"')
  rec.rows = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(r => /range safety brief/i.test((r.querySelector('textarea.ain, input.ain') || {}).value || '')).map(r => ({ cls: r.className, val: r.querySelector('textarea.ain, input.ain').value, pucks: [...r.querySelectorAll('.ppl .puck')].map(k => k.querySelector('.nm')?.textContent.trim() + (/dim|cx|cancel|faded/i.test(k.className) ? ' (dim)' : '')) })))
  log('  board rows for the input:', JSON.stringify(rec.rows))
  rec.pics.push(await shotSec(page, 's7a-desk-board-cx', 'board'))
  const c1 = await togo(page, 'row cancelled (CX)', rec, { keepWin: true })
  rec.pics.push(await shotWin(page, 's7a-desk-togo').catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300)
  const rr = await ritual(page, false, rec)
  rec.verdict = is(c1, 1) && rec.rows.length === 1 ? 'PASS' : 'FAIL'
  save('s7a', { rec, c1, rr }); await ctx.close()
}

async function s7b() {
  const rec = { n: 7, part: 'b-delete', did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  await toBoard(page)
  const rows = () => page.evaluate(() => document.querySelectorAll('#schedBoard .pinp .sb-arow').length)
  if (!(await rows())) { await page.locator('#schedBoard [data-pitog="2"]').first().click(); await page.waitForTimeout(500) }
  const ie = page.locator('#schedBoard .sb-panel.pinp .sb-arow.inprow .inpedit', { hasText: 'Range safety brief' }).first()
  await ie.scrollIntoViewIfNeeded(); await ie.click(); await page.waitForTimeout(900)
  rec.did.push('tapped the input\'s line under Personal Inputs on the board (its window opened)')
  rec.pics.push(await shot(page, 's7b-desk-window'))
  await page.locator('#inpEditDel').click(); await page.waitForTimeout(600)
  rec.ask = await page.evaluate(() => [...document.querySelectorAll('.modal, [role=dialog], .win, [data-testid]')].filter(e => e.offsetParent !== null && /delete this input|for all/i.test(e.innerText || '')).map(e => e.innerText.replace(/\s+/g, ' ').slice(-200)).slice(-1)); log('  ask:', JSON.stringify(rec.ask))
  rec.pics.push(await shot(page, 's7b-desk-delete-ask'))
  await page.locator('[data-testid="inped-delall-yes"]').click(); await page.waitForTimeout(1000)
  rec.did.push('pressed Delete, then Delete again on the "for all" question')
  rec.toast = await L.toastText(page); log('  toast:', rec.toast)
  rec.inputsLeft = await page.evaluate(() => window.INPUTS.filter(r => r.title === 'Range safety brief').length)
  const c1 = await togo(page, 'whole input deleted', rec, { keepWin: true })
  rec.pics.push(await shotWin(page, 's7b-desk-togo').catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300)
  rec.rowAfter = JSON.stringify(await L.rowInfo(page, 'week'))
  const rr = await ritual(page, false, rec)
  rec.inputsAfterReload = await page.evaluate(() => window.INPUTS.filter(r => r.title === 'Range safety brief').length)
  rec.verdict = is(c1, 1) && rec.inputsLeft === 0 ? 'PASS' : 'FAIL'
  save('s7b', { rec, c1, rr }); await ctx.close()
}

async function s7c() {
  const rec = { n: 7, part: 'c-filed-after', did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false, { g4: false }); rec.pub = pub
  const c0 = await togo(page, 'fresh day published, nothing filed', rec)
  const filed = await L.fileG4(page); rec.did.push('filed the four-man meeting through + Input after the day was published: ' + filed.length + ' records')
  await toWeek(page)
  const c1 = await togo(page, 'G4 filed after publishing', rec, { keepWin: true })
  rec.pics.push(await shotWin(page, 's7c-desk-togo').catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300)
  rec.row = JSON.stringify(await L.rowInfo(page, 'week'))
  rec.nameMark = await page.evaluate(() => { const day = [...document.querySelectorAll('#eWeek .day:not(.peek)')][2]; const r = [...day.querySelectorAll('.sec-grnd .pl-row')].find(r => /range safety brief/i.test(r.querySelector('.nm .ntx')?.textContent || '')); if (!r) return 'no row'; const nm = r.querySelector('.nm'); const rs = getComputedStyle(r), ns = getComputedStyle(nm), nb = getComputedStyle(nm, '::after'), nbb = getComputedStyle(nm, '::before'); return { rowAttrs: r.getAttributeNames().filter(n => n.startsWith('data-')).map(n => n + '=' + r.getAttribute(n)), nmAttrs: nm.getAttributeNames().filter(n => n.startsWith('data-')).map(n => n + '=' + nm.getAttribute(n)), nmAfter: nb.content, nmBefore: nbb.content, seatTags: [...r.querySelectorAll('.seat')].map(s => s.getAttribute('data-alp') ?? '-'), nmHtml: nm.outerHTML.slice(0, 300) } })
  log('  name mark:', JSON.stringify(rec.nameMark))
  rec.pics.push(await shotSec(page, 's7c-desk-row-added', 'week'))
  rec.pics.push(await shotHead(page, 's7c-desk-head'))
  const rr = await ritual(page, false, rec)
  rec.verdict = is(c0, 0) && is(c1, 1) ? 'PASS?' : 'FAIL'
  save('s7c', { rec, c0, c1, rr }); await ctx.close()
}

async function s8() {
  const rec = { n: 8, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  // sign out, sign in as the member, open View-only Sched
  await page.getByRole('button', { name: /^Logout/ }).first().click(); await page.waitForTimeout(800)
  rec.did.push('pressed Logout')
  await login(page, 'us', 'us'); rec.did.push('signed in as us / us (Ranger)')
  await L.toView(page).catch(async () => { await page.evaluate(() => window.go('viewsched')) }); await page.waitForTimeout(500)
  rec.row = JSON.stringify(await L.rowInfo(page, 'vweek')); log('  member view-only row:', rec.row)
  rec.rowCount = await page.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; return [...d.querySelectorAll('.sec-grnd .pl-row')].filter(r => /range safety brief/i.test(r.querySelector('.nm .ntx')?.textContent || '')).length })
  rec.controls = await page.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; const r = [...d.querySelectorAll('.sec-grnd .pl-row')].find(r => /range safety brief/i.test(r.querySelector('.nm .ntx')?.textContent || '')); return { editable: r.querySelectorAll('[contenteditable=true]').length, buttons: r.querySelectorAll('button').length, inputs: r.querySelectorAll('input,select,textarea').length, draggable: r.querySelectorAll('[draggable=true]').length, fills: r.querySelectorAll('[data-fill]').length } })
  log('  controls on the row:', JSON.stringify(rec.controls))
  rec.pics.push(await shotSec(page, 's8-desk-member-viewonly-row', 'vweek'))
  rec.pics.push(await shotHead(page, 's8-desk-member-viewonly-head', 'vweek', 2, 150))
  // Undo / Redo / reload: the member's view-only page has no undo; say so
  rec.undo = (await page.locator('#undoBtn:visible').count()) ? 'an Undo button is drawn' : 'no Undo button on View-only Sched for the member (nothing to press)'
  await reload(page, 'us', 'us')
  await L.toView(page).catch(async () => { await page.evaluate(() => window.go('viewsched')) }); await page.waitForTimeout(500)
  rec.rowAfterReload = JSON.stringify(await L.rowInfo(page, 'vweek'))
  rec.verdict = rec.rowCount === 1 && /Drifter.*Hunter.*Ranger.*Tally/.test(rec.row) && rec.controls.editable === 0 && rec.controls.buttons === 0 ? 'PASS' : 'FAIL'
  save('s8', { rec }); await ctx.close()
}

async function s9() {
  const rec = { n: 9, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  await L.dragAdd(page, 'Anvil'); rec.did.push('dragged Anvil onto Hunter\'s puck')
  const pub1 = await L.signAndPublish(page, L.DI); rec.did.push('signed and published AL1: ' + JSON.stringify(pub1))
  const c1 = await togo(page, 'after AL1 went out', rec)
  rec.live = JSON.stringify(await rowPucks(page))
  await L.lookAt(page, 'Original'); rec.did.push('plan menu → Original (the 👁 look)')
  rec.look = JSON.stringify(await L.rowInfo(page, 'week')); log('  ORIG look rows:', rec.look)
  rec.lookRows = (await L.rowInfo(page, 'week')).length
  rec.pics.push(await shotSec(page, 's9-desk-look-orig-row', 'week'))
  rec.pics.push(await shotHead(page, 's9-desk-look-orig-head'))
  await L.lookAt(page, 'Live working copy')
  rec.liveAfter = JSON.stringify(await rowPucks(page))
  const rr = await ritual(page, false, rec)
  const o = (await L.rowInfo(page, 'week'))
  const lk = JSON.parse(rec.look)
  rec.verdict = rec.lookRows === 1 && lk[0].pucks.length === 4 && !/Anvil/.test(lk[0].pucks.join()) ? 'PASS' : 'FAIL'
  save('s9', { rec, c1, rr }); await ctx.close()
}

async function s10() {
  const rec = { n: 10, did: [], pics: [], counts: [], lines: {} }
  const { ctx, page, pub } = await world(DESK, false); rec.pub = pub
  await toWeek(page)
  await L.dragNameOnto(page, 'ALL AVAIL', 'Hunter'); rec.did.push('dragged ALL AVAIL from the placeholders onto Hunter\'s puck')
  rec.toast1 = await L.toastText(page); rec.row1 = JSON.stringify(await rowPucks(page)); log('  after drop:', rec.toast1, rec.row1)
  rec.pics.push(await shotSec(page, 's10-desk-row-allavail', 'week'))
  const c1 = await togo(page, 'ALL AVAIL dropped', rec)
  const pub1 = await L.signAndPublish(page, L.DI); rec.did.push('signed and published AL1: ' + JSON.stringify(pub1))
  const c2 = await togo(page, 'after AL1', rec)
  await toWeek(page)
  await L.rowPuckLoc(page, 'Hunter').click({ button: 'right' }); await page.waitForTimeout(900); rec.did.push('right-clicked Hunter\'s puck')
  rec.toast2 = await L.toastText(page); rec.row2 = JSON.stringify(await rowPucks(page)); log('  after Hunter off:', rec.toast2, rec.row2)
  const c3 = await togo(page, 'Hunter taken off', rec, { keepWin: true })
  rec.pics.push(await shotWin(page, 's10-desk-togo').catch(() => null)); await page.locator('.chgwin .win-x').first().click().catch(() => {}); await page.waitForTimeout(300)
  rec.pics.push(await shotSec(page, 's10-desk-row-hunter-off', 'week'))
  const rr = await ritual(page, false, rec)
  rec.verdict = is(c3, 1) && /ALL AVAIL came off/i.test(JSON.stringify(c3.lines)) && /Hunter/.test(JSON.stringify(c3.lines)) ? 'PASS' : 'FAIL'
  save('s10', { rec, c1, c2, c3, rr }); await ctx.close()
}

const run = async (k, f) => { if (!want(k)) return; try { await f() } catch (e) { console.log('SCENARIO', k, 'CRASHED', String(e.stack || e).split('\n').slice(0, 6).join(' | ')) } }
await run('7a', s7a); await run('7b', s7b); await run('7c', s7c); await run('8', s8); await run('9', s9); await run('10', s10)
console.log('errs', errs)
process.exit(0)
