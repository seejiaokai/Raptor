// W2 part G — scenario A5 (desktop: an Other a scheduler REJECTED, opened by its member, then by the admin) and scenario 23 (a phone, member
// Ranger files his own Other, 09:00-11:00 on Mon 13 Jul, Goes to Unavailable; his war row; his bid window's row under the leaves).
// Usage (from raptor-port/): node scripts/handpass/lw-m3b-w2-g.mjs   [SETS=A5,23]  [ENGINE=chromium|webkit]
process.env.HP_URL = 'http://localhost:4180'
import * as H from './lw-m3b-w2-lib.mjs'
const { L, T, note } = H
process.env.HP_SHOTS = H.OUT
const SETS = (process.env.SETS || 'A5,23').split(',')
const ENGINE = process.env.ENGINE || 'chromium'
const TAG = ENGINE === 'webkit' ? 'gw-' : 'g-'
for (const k of SETS) H.clearPrefix(TAG + k)
console.log('lw-m3b-w2-g', H.OUT, 'sets', SETS.join(','), ENGINE)
const num = s => (s == null ? null : Number(String(s).replace(/[^\d.\-]/g, '')))
const hasBox = (cell, re) => (cell || []).some(b => re.test(b))
const sc = async (id, fn) => { console.log('-- ' + id); try { await fn() } catch (e) { note(id, '?', 'NOT DONE — ' + String(e).slice(0, 600)); L.rec(id, '?', 'NOT WALKED', 'script stopped: ' + String(e).split('\n')[0].slice(0, 300), []) } }
const EDIT = di => `#eWeek section.day[data-day="${di}"]`
const accList = (P, scope, iid) => P.evaluate(([scope, iid]) => [...document.querySelectorAll(`${scope} [data-acck="${iid}"]`)].filter(b => b.getBoundingClientRect().width > 0).map(b => b.dataset.acc + ':' + b.textContent.trim()), [scope, iid])
async function press(w, scope, iid, dest, di) {
  const P = w.page
  const sel = `${scope} [data-acc="${dest}"][data-acck="${iid}"]`
  const vis = async () => { const n = await P.locator(sel).count(); for (let i = 0; i < n; i++) if (await P.locator(sel).nth(i).isVisible()) return i; return -1 }
  let at = await vis()
  if (at < 0 && di != null) { const t = P.locator(`${scope} [data-pitog="${di}"]`).first(); if (await t.count()) { await t.scrollIntoViewIfNeeded().catch(() => {}); await t.click(); await P.waitForTimeout(500); at = await vis() } }
  if (at < 0) throw new Error(`no ${dest} button for ${iid}: have ${JSON.stringify(await accList(P, scope, iid))}`)
  const b = P.locator(sel).nth(at); await b.scrollIntoViewIfNeeded().catch(() => {})
  await b.click(); await P.waitForTimeout(1000)
}
const warSnap = async (w, who, iso) => { await H.warOpen(w, who, iso); return { cell: await H.cellBoxes(w, who, iso), avail: await H.availP(w.page, iso) } }

/* =============================== A5 =============================== */
if (SETS.includes('A5')) await sc('A5', async () => {
  const w = await H.deskCtx(); const P = w.page
  await L.signInPlain(w, 'admin')
  const ranger = await H.idOf(P, 'Ranger')
  note('A5-bridge', 'desk', 'bridge: ' + JSON.stringify(await P.evaluate(() => ({ role: typeof window.raptorRole, me: typeof window.raptorMe, lw: typeof window.lwSetRole }))))
  const ISO = '2026-07-15', DI = 2
  const base = await warSnap(w, ranger, ISO)
  const f = await H.fileInput(w, { who: 'Ranger', type: 'Other', from: ISO, remarks: 'Rejected other', tag: 'A5', beforeSave: async () => { if (!(await P.locator('#inpEditAllday').isChecked())) await L.press(w, '#inpEditAllday') } })
  const iid = f.rec.iid
  note('A5-filed', 'desk', `acc ${f.rec.acc}`)
  await H.goEdit(w)
  await press(w, EDIT(DI), iid, 'x', DI)
  const rej = await H.inputById(P, iid)
  note('A5-rejected', 'desk', `a scheduler pressed Reject: acc ${rej.acc}`)
  /* as Ranger, in place (the order §7.7) */
  await P.evaluate(() => { window.raptorRole('member'); if (window.raptorMe) window.raptorMe('bane'); window.lwSetRole('member') }); await P.waitForTimeout(500)
  await H.openInputBy(w, iid, 'list')
  const gm = await H.goesRead(P)
  note('A5-member', 'desk', 'his window: ' + JSON.stringify(gm))
  await H.pic(w, 'g-A5-member-window', [H.WIN], { pad: 6 })
  /* the buttons do nothing: press both (forced) and read again */
  for (const k of ['u', 'g']) await P.locator(T('inpEdit-goes-' + k)).click({ force: true, timeout: 3000 }).catch(() => {})
  await P.waitForTimeout(400)
  const gm2 = await H.goesRead(P)
  note('A5-member', 'desk', 'after pressing both buttons: ' + JSON.stringify(gm2))
  await H.pic(w, 'g-A5-member-after-press', [H.WIN], { pad: 6 })
  await L.press(w, '#inpEditCancel'); await P.waitForTimeout(500)
  const stillR = await H.inputById(P, iid)
  /* back as the admin */
  await P.evaluate(() => { window.raptorRole('admin'); if (window.raptorMe) window.raptorMe('stiff'); window.lwSetRole('admin') }); await P.waitForTimeout(500)
  await H.openInputBy(w, iid, 'list')
  const ga = await H.goesRead(P)
  note('A5-admin', 'desk', 'his window: ' + JSON.stringify(ga))
  await H.pic(w, 'g-A5-admin-window', [H.WIN], { pad: 6 })
  await L.press(w, T('inpEdit-goes-u')); await P.waitForTimeout(300)
  const ga2 = await H.goesRead(P)
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(1200)
  await H.answerAsks(w, 'A5-save')
  const after = await H.inputById(P, iid)
  await H.goEdit(w)
  const unav = ((await H.rowsOf(P, DI, 'sec-unav')).rows || []).filter(r => /Rejected other/.test(r.text)).map(r => r.text)
  await H.centreOn(P, [EDIT(DI) + ' .sec-unav']); await H.pic(w, 'g-A5-unavail', [EDIT(DI) + ' .sec-unav'], { pad: 6 })
  const w1 = await warSnap(w, ranger, ISO)
  await H.warPic(w, 'g-A5-war', ranger, [ISO])
  note('A5-admin', 'desk', `after Unavailable + Save: acc ${after.acc}; Unavailable rows ${JSON.stringify(unav)}; war ${JSON.stringify(w1.cell)} Available P ${base.avail} → ${w1.avail}`)
  L.rec('A5', 'desk', rej.acc === 'r' && gm.line === 'Rejected by a scheduler' && gm.g === 'false' && gm.u === 'false' && gm2.g === 'false' && gm2.u === 'false' && stillR.acc === 'r' && ga.line === 'Rejected by a scheduler' && !ga.uDisabled && after.acc === 'u' && unav.length === 1 && hasBox(w1.cell, /^OTH\|.*outlined/) ? 'PASS?' : 'FAIL?', `scheduler Reject → acc ${rej.acc}; as Ranger: window ${JSON.stringify(gm)}; after pressing both buttons ${JSON.stringify(gm2)}, acc still ${stillR.acc}; as admin: ${JSON.stringify(ga)}, after pressing Unavailable ${JSON.stringify(ga2)}; saved acc ${after.acc}; Unavailable rows ${unav.length}; war ${JSON.stringify(w1.cell)} Available P ${base.avail} → ${w1.avail}`, ['g-A5-member-window', 'g-A5-member-after-press', 'g-A5-admin-window', 'g-A5-unavail', 'g-A5-war'])
  note('errors-A5', 'desk', JSON.stringify(w.errs))
  await w.ctx.close()
})

/* =============================== 23 =============================== */
if (SETS.includes('23')) await sc('23', async () => {
  const m = ENGINE === 'webkit' ? await H.phoneCtx('webkit') : await H.phoneCtx('chromium'); const P = m.page
  await L.signInPlain(m, 'member')
  note('23-world', 'phone', `${ENGINE} · bundle ${await H.bundleName(P)} · page ${await P.evaluate(() => window.CURPAGE)}`)
  const me = 'bane', ISO = '2026-07-13'
  const base = await warSnap(m, me, ISO)
  await H.pic(m, 'g-23-war-before', [T('row-' + me)], { pad: 6 })
  /* the Inputs page's own window, as Ranger */
  await H.openInputsList(m)
  const q = TAG + '23-'
  await L.press(m, T('in-new'), q + 'tap-new-q'); await P.waitForSelector(T('win-inputedit'), { timeout: 5000 }); await P.waitForTimeout(600)
  note('23-window', 'phone', `person select: value ${await P.locator('#inpEditPerson').inputValue().catch(() => 'n/a')} disabled ${await P.locator('#inpEditPerson').isDisabled().catch(() => 'n/a')}; type options ${await P.evaluate(() => [...document.querySelectorAll('#inpEditType option')].map(o => o.value).join(','))}`)
  await P.locator('#inpEditType').selectOption('Other'); await P.waitForTimeout(400)
  const duration = await P.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] .inped-k')].map(e => e.textContent).join(' · '))
  note('23-window', 'phone', 'rows: ' + duration + ' · AM/PM offered: ' + await P.evaluate(() => /\bAM\b|\bPM\b/.test([...document.querySelectorAll('[data-testid="win-inputedit"] button')].map(b => b.textContent).join(' '))))
  await L.press(m, T('inpEdit-goes-u'), q + 'tap-goes-u-q'); await P.waitForTimeout(300)
  await P.locator('#inpEditRmk').fill('Own other')
  if (await P.locator('#inpEditAllday').count() && await P.locator('#inpEditAllday').isChecked()) { await L.press(m, '#inpEditAllday'); await P.waitForTimeout(250) }
  await P.locator('#inpEditStart').fill('09:00'); await P.locator('#inpEditEnd').fill('11:00')
  const rd = await H.pickDates(m, ISO)
  const goes = await H.goesRead(P)
  note('23-window', 'phone', `dates "${rd}"; goes ${JSON.stringify(goes)}`)
  await H.winTop(P); await H.pic(m, 'g-23-window', [T('win-inputedit')], { pad: 4 })
  const before = await H.inputsNow(P)
  await L.press(m, '#inpEditSave', q + 'tap-save-q'); await P.waitForTimeout(1300)
  const asked = await H.answerAsks(m, '23', { oil: 'no' })
  const fresh = (await H.inputsNow(P)).filter(i => !before.includes(i))
  const rec = fresh.length ? await H.inputById(P, fresh[0]) : null
  note('23-filed', 'phone', `new inputs ${fresh.length}; acc ${rec?.acc}; type ${rec?.type}; time ${rec?.s}-${rec?.e}; asked ${JSON.stringify(asked)}`)
  /* the war */
  const w1 = await warSnap(m, me, ISO)
  await H.warPic(m, 'g-23-war-after', me, [ISO])
  await L.shot(m, TAG + '23-war-after-screen')
  note('23-war', 'phone', `his cell ${JSON.stringify(w1.cell)}; Available P ${base.avail} → ${w1.avail}`)
  const topHalf = (w1.cell || []).find(b => /^OTH\|/.test(b))
  /* his bid window needs an open day: the admin opens November through the grid bar's own chip (in place — the order §7.7), then he is Ranger again */
  const NOV = '2026-11-12'
  await P.evaluate(() => { window.raptorRole('admin'); if (window.raptorMe) window.raptorMe('stiff'); window.lwSetRole('admin') }); await P.waitForTimeout(500)
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await P.evaluate(() => window.scrollTo(0, 0)); await P.waitForTimeout(200)
  await L.press(m, T('open-chip')); await P.waitForSelector(T('open-dates'), { timeout: 5000 })
  if ((await P.locator(T('od-month-2026-11')).getAttribute('aria-pressed')) !== 'true') { await L.press(m, T('od-month-2026-11')); await P.waitForTimeout(500) }
  await L.press(m, T('open-dates-close')); await P.waitForTimeout(400)
  await P.evaluate(() => { window.raptorRole('member'); if (window.raptorMe) window.raptorMe('bane'); window.lwSetRole('member') }); await P.waitForTimeout(500)
  await P.evaluate(() => window.go('leavewar')); await P.waitForTimeout(1200)
  await L.reachCell(m, me, NOV)
  const free = (await H.cellBoxes(m, me, NOV).catch(() => null)) ? NOV : null
  note('23-bid', 'phone', `November opened by the admin; Ranger's ${NOV} cell: ${JSON.stringify(await H.cellBoxes(m, me, NOV).catch(() => null))}`)
  let row = null, menu = null
  if (free) {
    await L.reachCell(m, me, free)
    await L.press(m, T(L.cellId(me, free)), q + 'tap-day-q'); await P.waitForTimeout(700)
    if (await L.vis(P, T('bid-picker'))) {
      row = await L.txt(P, T('bid-extra-row'))
      await H.pic(m, 'g-23-bid-row', [T('bid-extra-row'), T('bid-picker')], { pad: 4 })
      if (await L.vis(P, T('bid-more'))) {
        await L.press(m, T('bid-more'), q + 'tap-more-q'); await P.waitForTimeout(500)
        menu = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-more-menu"] [data-testid]')].map(e => e.dataset.testid + '=' + e.textContent.trim()))
        await H.pic(m, 'g-23-bid-more', [T('bid-more-menu'), T('bid-extra-row')], { pad: 6 })
      }
      note('23-bid', 'phone', `row "${row}"; the ⋯ holds ${JSON.stringify(menu)}; extra-row buttons ${JSON.stringify(await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-extra-row"] [data-testid]')].map(e => e.dataset.testid)))}`)
      await L.closeAny(m)
    } else note('23-bid', 'phone', 'no bid window opened on ' + free + ': ' + JSON.stringify(await L.sheetDump(P)))
  }
  const okBid = row !== null && /CSE/.test(row) && /OD/.test(row) && !/Other|OTH|UNA|OIL/i.test(row.replace(/\bOIL\b/g, 'OIL')) && menu && menu.length === 1 && /ATCH/.test(menu.join(''))
  L.rec('23', 'phone', rec?.acc === 'u' && topHalf && /\|top\|/.test(topHalf) && /outlined/.test(topHalf) && num(w1.avail) === num(base.avail) - 0.5 && okBid ? 'PASS?' : 'FAIL?', `${ENGINE}: his Other 09:00–11:00, Goes to Unavailable → acc ${rec?.acc}; his cell ${JSON.stringify(w1.cell)}; Available P ${base.avail} → ${w1.avail}; bid window row "${row}", its ⋯ holds ${JSON.stringify(menu)} (day ${free})`, ['g-23-window', 'g-23-war-before', 'g-23-war-after', 'g-23-bid-row', 'g-23-bid-more', 'g-23-tap-new-q', 'g-23-tap-goes-u-q', 'g-23-tap-save-q', 'g-23-tap-day-q', 'g-23-tap-more-q'])
  note('errors-23', 'phone', JSON.stringify(m.errs))
  await m.ctx.close()
})

H.saveLog(TAG + 'run.json')
await H.closeBrowser()
console.log('RESULTS'); for (const r of L.results) console.log(r.verdict, r.id, '|', r.said)
