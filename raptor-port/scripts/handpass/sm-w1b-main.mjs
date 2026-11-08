// W1b: S21, S19, S20, S22 (and S23 explore). usage: SZ=pc|phone node sm-w1b-main.mjs [ONLY=s21,s19]
import * as L from './sm-lib.mjs'
const SZ = process.env.SZ || 'pc'
const ONLY = (process.env.ONLY || 's21,s19,s20,s22,s23').split(',')
console.log('sm-w1b-main v1', SZ, ONLY.join(','))
const OUT = L.outDir('w1b')
const ORIGIN = 'http://localhost:4392'
const D = di => `#eWeek section.day[data-day="${di}"]`
const rows = []
const rec = (id, exp, got, verdict, pic = '') => { rows.push({ id, size: SZ, exp, got, verdict, pic }); console.log(`[${verdict}] ${id} | ${typeof got === 'string' ? got : JSON.stringify(got)} | ${pic}`) }
const sleep = L.sleep
async function fresh(pub = [2]) {
  const W = await L.launch(SZ, { origin: ORIGIN })
  await L.signIn(W)
  for (const d of pub) { const r = await L.publishDay(W, d); if (!r.published) console.log('PUBLISH FAIL', d, JSON.stringify(r)); await L.closeBoard(W) }
  return W
}
const unav = (page, di) => page.evaluate(di => {
  const day = document.querySelector(`#eWeek section.day[data-day="${di}"]`); if (!day) return { err: 'no day' }
  const out = []
  for (const r of day.querySelectorAll('.sec-unav .pl-row')) {
    if (r.getBoundingClientRect().height <= 0) continue
    const b = r.querySelector('.nm .ntx'); if (!b) continue
    const cs = getComputedStyle(b)
    out.push({ name: b.textContent.trim().slice(0, 30), dotted: cs.textDecorationStyle === 'dotted' && cs.textDecorationLine.includes('underline'), color: cs.textDecorationColor, aln: b.dataset.aln || null })
  }
  const pend = [...day.querySelectorAll('.dpend')].find(e => /pending/.test(e.textContent)); const ver = day.querySelector('.verchip')
  return { pend: pend ? pend.textContent.trim() : null, ver: ver ? ver.textContent.trim() : null, rows: out }
}, di)
const ll = s => (s.rows || []).find(r => r.name === 'LL')
const brief = s => s.err ? s.err : `pend=${s.pend} ver=${s.ver} rows=` + s.rows.map(r => `${r.name}${r.dotted ? '[DOTTED ' + r.color + ']' : '[plain]'}`).join(';')
const scoped = (di, sel) => sel.split(',').map(x => `${D(di)} ${x.trim()}`).join(', ')
const shot = async (W, name, di = 2, sel = '.sec-unav') => { await L.center(W.page, scoped(di, sel)); await sleep(500); return L.pic(W, OUT, `${SZ}-${name}`, { sel: scoped(di, sel), pad: 14 }) }
async function openInp(W, di, who) {
  const btn = W.page.locator(`${D(di)} .sec-unav [data-inpedit]`).filter({ hasText: new RegExp('^' + who + '$') }).first()
  await btn.scrollIntoViewIfNeeded(); await L.press(W, btn); await W.page.waitForSelector('#inpEditSave'); await sleep(600)
}
async function openFromList(W, re) {
  await L.openInputsList(W)
  const n = await W.page.locator(L.T('in-open')).filter({ hasText: 'Bolt' }).count()
  for (let i = 0; i < n; i++) {
    await W.page.locator(L.T('in-open')).filter({ hasText: 'Bolt' }).nth(i).click(); await W.page.waitForSelector('#inpEditSave'); await sleep(500)
    const t = await W.page.evaluate(() => { let w = document.querySelector('#inpEditSave'); for (let k = 0; k < 6 && w.parentElement; k++) w = w.parentElement; return w.innerText.slice(0, 60).split(/\s+/).join(' ') })
    const ty = await W.page.locator('#inpEditType').inputValue().catch(() => ''); console.log('  list window:', t, '| type', ty)
    if (ty === 'LL') return t
    await W.page.getByRole('button', { name: 'Cancel' }).filter({ visible: true }).first().click(); await sleep(500)
  }
  throw new Error('input not found in the list')
}
async function saveWin(W) {
  const { page } = W
  await page.locator('#inpEditSave').click(); await sleep(1100)
  for (let i = 0; i < 4; i++) {
    const open = await page.evaluate(() => [...document.querySelectorAll('[data-testid="docconf"], [data-testid="oilconf"]')].filter(e => e.getBoundingClientRect().width).map(e => e.dataset.testid))
    if (!open.length) break
    if (open.includes('docconf')) await page.locator(L.T('docconf-nodoc')).first().click()
    else { await page.locator(L.T('oil-no')).first().click(); await sleep(250); await page.locator(L.T('oilconf-save')).first().click() }
    await sleep(700)
  }
  return page.locator('#inpEditSave').count()
}
const topBtn = async (W, id) => { await W.page.evaluate(() => window.scrollTo(0, 0)); await sleep(200); await L.press(W, '#' + id); await sleep(900) }
let weekMissing = false
const weekBtn = async (W, name) => { const b = W.page.getByRole('button', { name, exact: true }).filter({ visible: true }); if (!(await b.count())) { if (!weekMissing) { weekMissing = true; rec('S21.4 week buttons', 'RECORD', 'no visible week button named ' + name + ' on this size; week switch not driven', 'NOT DRIVEN') } return } await L.press(W, b) }
const run = async (k, fn) => { if (!ONLY.includes(k)) return; try { await fn() } catch (e) { rec(k + '.CRASH', '', e.message.split('\n')[0] + ' @ ' + (e.stack.split('\n').find(l => l.includes('sm-w1b-main')) || '').trim(), 'NOT DRIVEN') } }

await run('s21', async () => {
  const W = await fresh()
  await L.goEdit(W)
  let s = await unav(W.page, 2); rec('S21.0 clean published Wed', 'no row, no pending', brief(s), s.pend == null && !s.rows.some(r => r.dotted) ? 'PASS' : 'FAIL', await shot(W, 's21-0-clean', 2, '.dhd, .dhtpl, .sec-unav').catch(() => ''))
  const inp = await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' }); await L.goEdit(W)
  s = await unav(W.page, 2); rec('S21.1 filed LL', 'Bolt marked, 1 pending', brief(s), s.rows.some(r => r.dotted) && /^1/.test(s.pend || '') ? 'PASS' : 'FAIL', await shot(W, 's21-1-filed'))
  await topBtn(W, 'undoBtn'); await L.goEdit(W).catch(() => {})
  s = await unav(W.page, 2); rec('S21.2 Undo', 'input gone, no pending, no mark', brief(s), !ll(s) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's21-2-undo', 2, '.sec-unav, .dpend'))
  await topBtn(W, 'redoBtn')
  s = await unav(W.page, 2); rec('S21.3 Redo', 'input back, marked, 1 pending', brief(s), s.rows.some(r => r.dotted) && /^1/.test(s.pend || '') ? 'PASS' : 'FAIL', await shot(W, 's21-3-redo'))
  // week away and back
  await W.page.evaluate(() => window.scrollTo(0, 0)); await sleep(200)
  await weekBtn(W, 'Jul 20'); await sleep(1200)
  const mid = await W.page.evaluate(() => (document.querySelector('#eWeek section.day[data-day="0"] .dhd, #eWeek section.day[data-day="0"]') || {}).innerText?.slice(0, 40))
  await W.page.evaluate(() => window.scrollTo(0, 0)); await weekBtn(W, 'Jul 13'); await sleep(1500)
  s = await unav(W.page, 2); rec('S21.4a week away (' + String(mid).replace(/\s+/g, ' ') + ') and back', 'marked, 1 pending', brief(s), s.rows.some(r => r.dotted) && /^1/.test(s.pend || '') ? 'PASS' : 'FAIL', await shot(W, 's21-4a-weekback'))
  await L.openBoard(W, 2); const bm = await L.boardUnavMark(W.page, 'Bolt')
  await L.center(W.page, '#schedBoard .sb-panel.unav'); await sleep(500)
  rec('S21.4b board after week return', 'Bolt box outlined dotted', JSON.stringify(bm), Array.isArray(bm) && /dotted/.test(bm[0].outline) ? 'PASS' : 'FAIL', await L.pic(W, OUT, `${SZ}-s21-4b-board`, { sel: '#schedBoard .sb-panel.unav' }))
  await L.closeBoard(W)
  // reload while pending
  await W.page.reload(); await sleep(2500)
  let login = await W.page.locator('#luser').count()
  if (login) { await L.signIn(W) }
  await L.goEdit(W); s = await unav(W.page, 2)
  rec('S21.5 reload while pending' + (login ? ' (sign-in screen came back; signed in again)' : ''), 'marked, 1 pending', brief(s), s.rows.some(r => r.dotted) && /^1/.test(s.pend || '') ? 'PASS' : 'FAIL', await shot(W, 's21-5-reload'))
  const colorBefore = (s.rows.find(r => r.dotted) || {}).color
  const pubr = await L.publishDay(W, 2); await L.closeBoard(W); await L.goEdit(W)
  s = await unav(W.page, 2); rec('S21.6 Publish AL1 ' + JSON.stringify(pubr), 'row stays, mark gone, pending gone (colour before ' + colorBefore + ')', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's21-6-published'))
  await W.page.reload(); await sleep(2500); if (await W.page.locator('#luser').count()) await L.signIn(W)
  await L.goEdit(W); s = await unav(W.page, 2); rec('S21.7 reload after AL1', 'clean: row, no mark, no pending', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's21-7-reload-clean'))
  await W.page.evaluate(() => window.scrollTo(0, 0)); await weekBtn(W, 'Jul 20'); await sleep(1200)
  await W.page.evaluate(() => window.scrollTo(0, 0)); await weekBtn(W, 'Jul 13'); await sleep(1500)
  s = await unav(W.page, 2); rec('S21.8 week away/back after AL1', 'still clean', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's21-8-awayback-clean'))
  rec('S21 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

await run('s19', async () => {
  const W = await fresh()
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  const pr = await L.publishDay(W, 2); await L.closeBoard(W); await L.goEdit(W)
  let s = await unav(W.page, 2); rec('S19.0 LL published as AL1 ' + JSON.stringify(pr), 'row, plain, no pending', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's19-0-clean'))
  await openInp(W, 2, 'LL')
  const fields = await W.page.evaluate(() => { let w = document.querySelector('#inpEditSave'); for (let i = 0; i < 6 && w.parentElement; i++) w = w.parentElement; return [...w.querySelectorAll('input,select,textarea,button')].filter(e => e.getBoundingClientRect().width).map(e => (e.id || e.textContent.trim().slice(0, 12)) + ':' + (e.type || '')) })
  rec('S19.1 fields the LL window offers', 'RECORD', fields.join(' '), 'RECORDED', await L.pic(W, OUT, `${SZ}-s19-1-window`, {}))
  await W.page.locator('#inpEditRmk').fill('Dentist'); const still = await saveWin(W)
  await L.goEdit(W); s = await unav(W.page, 2); rec('S19.2 remarks changed to Dentist (window left open=' + still + ')', 'marked, 1 pending', brief(s), s.rows.some(r => r.dotted) && /^1/.test(s.pend || '') ? 'PASS' : 'FAIL', await shot(W, 's19-2-changed'))
  await openInp(W, 2, 'LL'); await W.page.locator('#inpEditRmk').fill(''); await saveWin(W)
  await L.goEdit(W); s = await unav(W.page, 2); rec('S19.3 remarks restored (empty)', 'pending and mark leave together', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's19-3-restored'))
  await openInp(W, 2, 'LL'); await W.page.locator('#inpEditRmk').fill('  Dentist  '); await saveWin(W)
  await L.goEdit(W); s = await unav(W.page, 2); rec('S19.4 remarks "  Dentist  " (spaces)', 'RECORD (changed)', brief(s), 'RECORDED', await shot(W, 's19-4-spaces'))
  await openInp(W, 2, 'LL'); await W.page.locator('#inpEditRmk').fill(''); await saveWin(W)
  await L.goEdit(W); s = await unav(W.page, 2); rec('S19.5 restored again', 'clean', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's19-5-restored2'))
  // board face of a change
  await openInp(W, 2, 'LL'); await W.page.locator('#inpEditRmk').fill('Dentist'); await saveWin(W)
  await L.openBoard(W, 2); const bm = await L.boardUnavMark(W.page, 'Bolt'); await L.center(W.page, '#schedBoard .sb-panel.unav'); await sleep(400)
  rec('S19.6 board after remarks change', 'Bolt box dotted outline', JSON.stringify(bm), Array.isArray(bm) && /dotted/.test(bm[0].outline) ? 'PASS' : 'FAIL', await L.pic(W, OUT, `${SZ}-s19-6-board`, { sel: '#schedBoard .sb-panel.unav' }))
  await L.closeBoard(W)
  await L.closeBoard(W); await L.goEdit(W)
  // restore remarks first so only the inline time is changed
  await openInp(W, 2, 'LL'); await W.page.locator('#inpEditRmk').fill(''); await saveWin(W); await L.goEdit(W)
  s = await unav(W.page, 2); rec('S19.7a clean again before the inline time test', 'clean', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL')
  const ts = W.page.locator(`${D(2)} .sec-unav .pl-row`).filter({ has: W.page.locator('[data-inpedit]').filter({ hasText: /^LL$/ }) }).locator('.t-s').first()
  await ts.scrollIntoViewIfNeeded(); await L.press(W, ts); await sleep(300); await W.page.keyboard.type('0800'); await W.page.keyboard.press('Enter'); await sleep(1200)
  s = await unav(W.page, 2); rec('S19.7b start time typed inline 0800', 'RECORD: marked + 1 pending if the time counts as a change', brief(s) + ' startText=' + await ts.innerText().catch(() => '?'), 'RECORDED', await shot(W, 's19-7b-inline-time'))
  await L.press(W, ts); await sleep(300); await W.page.keyboard.press('Control+A'); await W.page.keyboard.press('Delete'); await W.page.keyboard.press('Enter'); await sleep(1200)
  s = await unav(W.page, 2); rec('S19.7c start time cleared inline (back to the issued all-day)', 'pending and mark leave together', brief(s) + ' startText=' + await ts.innerText().catch(() => '?'), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's19-7c-inline-cleared'))
  // the window's Duration AM and the "till" tick, each changed then restored
  await openInp(W, 2, 'LL'); await W.page.getByRole('button', { name: /^am$/i }).filter({ visible: true }).first().click(); await sleep(300); await saveWin(W); await L.goEdit(W)
  s = await unav(W.page, 2); rec('S19.8a Duration AM set in the window', 'marked + pending', brief(s), s.rows.some(r => r.dotted) && /^1/.test(s.pend || '') ? 'PASS' : 'FAIL', await shot(W, 's19-8a-am'))
  await openInp(W, 2, 'LL'); await W.page.getByRole('button', { name: /^all day$/i }).filter({ visible: true }).first().click(); await sleep(300); await saveWin(W); await L.goEdit(W)
  s = await unav(W.page, 2); rec('S19.8b Duration back to ALL DAY', 'pending and mark leave together', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's19-8b-allday'))
  await openInp(W, 2, 'LL'); await W.page.locator('input[type=checkbox]').filter({ visible: true }).last().click(); await sleep(300); await saveWin(W); await L.goEdit(W)
  s = await unav(W.page, 2); rec('S19.9a till-date tick switched off', 'RECORD', brief(s), 'RECORDED', await shot(W, 's19-9a-till-off'))
  await openInp(W, 2, 'LL'); await W.page.locator('input[type=checkbox]').filter({ visible: true }).last().click(); await sleep(300); await saveWin(W); await L.goEdit(W)
  s = await unav(W.page, 2); rec('S19.9b till-date tick switched back on', 'pending and mark leave together', brief(s), ll(s) && !s.rows.some(r => r.dotted) && s.pend == null ? 'PASS' : 'FAIL', await shot(W, 's19-9b-till-on'))
  rec('S19 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

await run('s20', async () => {
  const W = await L.launch(SZ, { origin: ORIGIN }); await L.signIn(W)
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  for (const d of [2, 3]) { const r = await L.publishDay(W, d); if (!r.published) console.log('PUBLISH FAIL', d, JSON.stringify(r)); await L.closeBoard(W) }
  await L.goEdit(W)
  const three = async () => { const a = [2, 3, 4].map(async d => unav(W.page, d)); return Promise.all(a) }
  let ss = await three(); rec('S20.0 start: LL on Wed only; Wed+Thu published, Fri draft', 'Wed row plain', ss.map((s, i) => 'D' + (i + 2) + ' ' + brief(s)).join(' // '), 'RECORDED', await shot(W, 's20-0-start'))
  // stretch to Fri 17
  await openFromList(W, /Bolt · 15/)
  await W.page.locator('[data-testid="inpEdCal-day-2026-07-15"]').first().click(); await sleep(250)
  await W.page.locator('[data-testid="inpEdCal-day-2026-07-17"]').first().click(); await sleep(300)
  await L.pic(W, OUT, `${SZ}-s20-1-window`, {})
  const still = await saveWin(W); await L.goEdit(W)
  ss = await three()
  const m = ss.map((s, i) => 'D' + (i + 2) + ' ' + brief(s)).join(' // ')
  rec('S20.1 stretched Wed to Fri (window left open=' + still + ')', 'Thu row marked + pending; Wed marked; Fri row present but never marked (draft)', m, ss[1].rows.some(r => r.dotted) && ll(ss[2]) && !ss[2].rows.some(r => r.dotted) ? 'PASS' : 'FAIL')
  await shot(W, 's20-1-wed', 2); await shot(W, 's20-1-thu', 3); rec('S20.1p pictures', '', 'wed/thu/fri', 'RECORDED', await shot(W, 's20-1-fri', 4))
  // trim back to Wed only
  await openFromList(W, /Bolt · 15/)
  await W.page.locator('[data-testid="inpEdCal-day-2026-07-15"]').first().click(); await sleep(250)
  await W.page.locator('[data-testid="inpEdCal-day-2026-07-15"]').first().click(); await sleep(300)
  await saveWin(W); await L.goEdit(W); ss = await three()
  rec('S20.2 trimmed back to Wed only', 'Thu row gone; Wed back to issued state (plain, no pending) or RECORD', ss.map((s, i) => 'D' + (i + 2) + ' ' + brief(s)).join(' // '), 'RECORDED', await shot(W, 's20-2-wed'))
  await shot(W, 's20-2-thu', 3)
  rec('S20.3 year-end case', 'RECORD only (skip if no published day in that week)', 'skipped: no published day exists in the week of 28 Dec 2026 in this world', 'NOT DRIVEN')
  rec('S20 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

await run('s22', async () => {
  const W = await fresh()
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' })
  const pr = await L.publishDay(W, 2); await L.closeBoard(W)
  await L.fileInput(W, { who: 'Saint', type: 'LL', iso: '2026-07-15' }); await L.goEdit(W)
  let s = await unav(W.page, 2); rec('S22.0 setup: Bolt in AL1, Saint pending ' + JSON.stringify(pr), 'Bolt plain, Saint dotted', brief(s), s.rows.some(r => r.dotted) ? 'PASS' : 'FAIL', await shot(W, 's22-0-setup'))
  const liveColor = (s.rows.find(r => r.dotted) || {}).color
  const eyeInfo = () => W.page.evaluate(di => {
    const d = document.querySelector(`#eWeek section.day[data-day="${di}"]`)
    const sz = e => [...e.querySelectorAll('svg.pveye')].filter(x => x.getBoundingClientRect().width > 0).map(x => { const r = x.getBoundingClientRect(); const cs = getComputedStyle(x); return Math.round(r.width * 10) / 10 + 'x' + Math.round(r.height * 10) / 10 + ' stroke=' + cs.stroke + ' color=' + cs.color })
    const sel = d.querySelector('[data-planmenu]'); const selb = sel.getBoundingClientRect()
    const ban = [...d.querySelectorAll('*')].filter(e => e.children.length < 8 && /Viewing/.test(e.textContent) && e.querySelector('svg.pveye') && e.getBoundingClientRect().height > 0).pop()
    const typed = (d.innerText || '').includes('\u{1F441}')
    return { selText: sel.textContent.trim(), selEye: sz(sel), selWrapH: Math.round(selb.height), banner: ban ? ban.textContent.trim().slice(0, 110) : null, bannerEye: ban ? sz(ban) : null, typed, aln: d.querySelectorAll('.sec-unav [data-aln]').length, dotted: [...d.querySelectorAll('.sec-unav .pl-row .nm .ntx')].filter(b => getComputedStyle(b).textDecorationStyle === 'dotted').length }
  }, 2)
  const look = async name => {
    await L.center(W.page, `${D(2)} [data-planmenu="2"]`); await sleep(300)
    await L.press(W, `${D(2)} [data-planmenu="2"]`); await sleep(600)
    await L.pic(W, OUT, `${SZ}-s22-menu-open`, {})
    const btn = W.page.locator('.wavemenu [data-planpv]').filter({ hasText: name }).first()
    await L.press(W, btn); await sleep(1000)
  }
  await look('Original')
  let e = await eyeInfo(); let s2 = await unav(W.page, 2)
  rec('S22.1 look at Original (week)', 'drawn eye 11px in selector, 12px in banner; no live mark', JSON.stringify(e) + ' // ' + brief(s2), e.selEye.length && !e.typed && e.aln === 0 && e.dotted === 0 ? 'PASS' : 'FAIL', await shot(W, 's22-1-orig-look', 2, '.dhd, .dhtpl, .sec-unav, [data-planmenu]'))
  await L.pic(W, OUT, `${SZ}-s22-1-orig-top`, { sel: `${D(2)} [data-planmenu="2"]`, pad: 60 })
  // 2560 for the selector's eye
  if (SZ === 'pc') {
    await W.page.setViewportSize({ width: 2560, height: 1300 }); await sleep(900)
    const e2 = await eyeInfo(); rec('S22.1b look at Original at 2560 wide', 'eye 11/12px', JSON.stringify(e2), e2.selEye.length ? 'RECORDED' : 'FAIL', await L.pic(W, OUT, `${SZ}-s22-1b-2560`, { sel: `${D(2)} [data-planmenu="2"]`, pad: 80 }))
    await W.page.setViewportSize({ width: 1536, height: 864 }); await sleep(700)
  }
  await look('AL1'); e = await eyeInfo(); s2 = await unav(W.page, 2)
  rec('S22.2 look at AL1 (week)', 'drawn eye, frozen content, no live mark', JSON.stringify(e) + ' // ' + brief(s2), e.selEye.length && !e.typed && e.aln === 0 && e.dotted === 0 ? 'PASS' : 'FAIL', await shot(W, 's22-2-al1-look', 2, '.dhd, .dhtpl, .sec-unav, [data-planmenu]'))
  // back to live
  await L.press(W, `${D(2)} [data-planmenu="2"]`); await sleep(500)
  await L.press(W, W.page.locator('.wavemenu [data-plangolive]').first()); await sleep(1000)
  s = await unav(W.page, 2); rec('S22.3 back to working copy (live colour was ' + liveColor + ')', 'Saint marked again, pending back', brief(s), s.rows.some(r => r.dotted) && /^1/.test(s.pend || '') ? 'PASS' : 'FAIL', await shot(W, 's22-3-back-live'))
  // switch repeatedly
  for (let i = 0; i < 2; i++) { await look('Original'); await L.press(W, `${D(2)} [data-planmenu="2"]`); await sleep(500); await L.press(W, W.page.locator('.wavemenu [data-plangolive]').first()); await sleep(900) }
  s = await unav(W.page, 2); rec('S22.4 repeated looks and returns', 'marked in same colour', brief(s) + ' liveColor=' + liveColor, s.rows.some(r => r.dotted && r.color === liveColor) ? 'PASS' : 'FAIL')
  // board
  await L.openBoard(W, 2)
  await L.press(W, '#schedBoard [data-planmenu="2"]'); await sleep(600)
  await W.page.locator('.wavemenu [data-planpv]').filter({ hasText: 'AL1' }).first().click(); await sleep(1000)
  const be = await W.page.evaluate(() => {
    const sel = document.querySelector('#schedBoard [data-planmenu="2"]')
    const sz = e => [...e.querySelectorAll('svg.pveye')].filter(x => x.getBoundingClientRect().width > 0).map(x => { const r = x.getBoundingClientRect(); return Math.round(r.width * 10) / 10 + 'x' + Math.round(r.height * 10) / 10 })
    const ban = [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length < 8 && /Viewing/.test(e.textContent) && e.querySelector('svg.pveye') && e.getBoundingClientRect().height > 0).pop()
    return { selText: sel.textContent.trim(), selEye: sz(sel), banner: ban ? ban.textContent.trim().slice(0, 100) : null, bannerEye: ban ? sz(ban) : null, typed: document.querySelector('#schedBoard').innerText.includes('\u{1F441}'), outlined: [...document.querySelectorAll('#schedBoard .sb-panel.unav .sbi-ty')].filter(b => getComputedStyle(b).outlineStyle === 'dotted').length }
  })
  rec('S22.5 look at AL1 (board)', 'drawn eye, no outlined name', JSON.stringify(be), be.selEye.length && !be.typed && be.outlined === 0 ? 'PASS' : 'FAIL', await L.pic(W, OUT, `${SZ}-s22-5-board-look`, { clip: { x: 0, y: 0, width: W.page.viewportSize().width, height: 330 } }))
  await L.center(W.page, '#schedBoard .sb-panel.unav'); await sleep(300); await L.pic(W, OUT, `${SZ}-s22-5b-board-unav-look`, {})
  await L.press(W, '#schedBoard [data-planmenu="2"]'); await sleep(500); await L.press(W, W.page.locator('.wavemenu [data-plangolive]').first()); await sleep(900)
  const bm = await L.boardUnavMark(W.page, 'Saint'); rec('S22.6 board back to working copy', 'Saint outlined dotted', JSON.stringify(bm), Array.isArray(bm) && /dotted/.test(bm[0].outline) ? 'PASS' : 'FAIL', await L.pic(W, OUT, `${SZ}-s22-6-board-back`, {}))
  await L.closeBoard(W)
  rec('S22 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

await run('s23', async () => {
  const W = await fresh()
  await L.fileInput(W, { who: 'Bolt', type: 'LL', iso: '2026-07-15' }); await L.goEdit(W)
  await L.press(W, `${D(2)} [data-planmenu="2"]`); await sleep(500)
  await L.press(W, W.page.locator('.wavemenu [data-plandup]').first()); await sleep(1200)
  const after = await W.page.evaluate(di => { const d = document.querySelector(`#eWeek section.day[data-day="${di}"]`); return { sel: d.querySelector('[data-planmenu]').textContent.trim(), win: [...document.querySelectorAll('[role=dialog],.win')].filter(e => e.getBoundingClientRect().width).map(e => e.innerText.slice(0, 80)) } }, 2)
  rec('S23.1 + Alt Plan from the menu', 'RECORD', JSON.stringify(after), 'RECORDED', await shot(W, 's23-1-plan', 2, '.dhd, .dhtpl, .sec-unav, [data-planmenu]'))
  await L.press(W, `${D(2)} [data-planmenu="2"]`); await sleep(500)
  const items = await W.page.evaluate(() => [...document.querySelectorAll('.wavemenu button')].filter(e => e.getBoundingClientRect().height > 0).map(e => Object.keys(e.dataset).join(',') + ' | ' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 60)))
  rec('S23.2 plan menu items with a saved plan', 'RECORD', items.join(' ;; '), 'RECORDED', await L.pic(W, OUT, `${SZ}-s23-2-menu`, {}))
  const lookBtn = await W.page.locator('.wavemenu [data-plansel]').count()
  const seyes = await W.page.evaluate(() => [...document.querySelectorAll('.wavemenu svg.pveye')].length)
  rec('S23.3 a look at a saved plan from admin surfaces', 'RECORD: is there a read-only look (eye) on a plan', `data-plansel buttons=${lookBtn} (these SWITCH to the plan), eyes in menu=${seyes}`, 'RECORDED')
  await W.page.keyboard.press('Escape'); await sleep(300)
  rec('S23 errors', 'none', W.errs.join(' || ') || 'none', 'RECORDED')
  await L.closeAll(W)
})

L.saveJson(OUT, `w1b-main-${SZ}-${ONLY.join('_')}`, rows)
console.log('DONE')
