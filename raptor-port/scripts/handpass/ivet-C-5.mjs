// Walker C, script 5 — 44 (admin, filed on desktop), 45 (admin, filed on phone), 46 (member, desktop), 48 (admin, desktop)
import * as L from './ivet-C-lib.mjs'
import { readPhone, readDesk, stored, norm } from './ivet-C-4lib.mjs'
const D27 = ['2026-07-27', '2026-07-28']

/* ================= 44 ================= */
{
  const { ctx, page } = await L.open(L.DESK, 'ad', 'a', false, { fresh: false })
  await L.step('44', 'desktop filed; phone list + opened day on phone and desktop', 'Saber', async () => {
    await L.toList(page, false)
    const cases = [
      { cs: 'Ace', rmk: 'Bring ID till 29 Jul', want: 'Bring ID' },
      { cs: 'Blade', rmk: 'till 29 Jul bring ID', want: 'bring ID' },
      { cs: 'Cinch', rmk: 'Bring ID till 29 Jul report to desk', want: 'Bring ID report to desk' },
    ]
    for (const c of cases) {
      const m = await L.fileInput(page, { type: 'Training', person: c.cs, from: '2026-07-27', to: '2026-07-29', rmk: c.rmk }, false)
      if (m.length !== 1) throw new Error('not saved: ' + c.cs + ' ' + await L.toast(page))
      c.iid = m[0].iid; c.saved = (await stored(page, c.iid)).remarks
    }
    const dk = {}, ph = {}
    for (const c of cases) dk[c.cs] = await readDesk(page, { iid: c.iid, days: D27 }, `44-${c.cs}`)
    const dtw = await L.twin(ctx, L.PHONE, 'ad', 'a', true)
    for (const c of cases) ph[c.cs] = await readPhone(dtw.page, { iid: c.iid, days: D27 }, `44-${c.cs}`)
    // all three together on the phone list, for the picture
    await L.toList(dtw.page, true)
    const aft = {}; for (const c of cases) aft[c.cs] = (await stored(dtw.page, c.iid)).remarks
    await dtw.ctx.close()
    const problems = [], lines = []
    for (const c of cases) {
      const P = ph[c.cs], K = dk[c.cs]
      const got = [P.card?.rmk, P.days[D27[0]]?.rmk, P.days[D27[1]]?.rmk, K.days[D27[0]]?.rmk, K.days[D27[1]]?.rmk]
      if (c.saved !== c.rmk) problems.push(`${c.cs}: saved remark "${c.saved}" is not what was typed "${c.rmk}"`)
      got.forEach((g, i) => { if (norm(g) !== c.want) problems.push(`${c.cs}: surface ${['phone list', 'phone day 27', 'phone day 28', 'desktop day 27', 'desktop day 28'][i]} reads "${g}", expected "${c.want}"`) })
      const corners = [P.card?.when, P.days[D27[0]]?.when, K.days[D27[0]]?.when]
      if (corners.some(w => !/(^|· )till 29 Jul$/.test(w || ''))) problems.push(`${c.cs}: corner ${corners.join(' / ')}`)
      if (norm(K.row?.rmk).replace(/^LATE ?/, '') !== c.rmk) problems.push(`${c.cs}: desktop Remarks cell reads "${K.row?.rmk}" not "${c.rmk}"`)
      if (K.win !== c.rmk) problems.push(`${c.cs}: window Remarks box "${K.win}" not "${c.rmk}"`)
      if (aft[c.cs] !== c.rmk) problems.push(`${c.cs}: saved remark changed to "${aft[c.cs]}"`)
      lines.push(`typed "${c.rmk}" → cards read "${got[0]}"`)
    }
    L.rec('44', 'desktop filed; phone list + opened day on phone and desktop', 'Saber', problems.length ? 'FAIL' : 'PROVISIONAL', problems.length ? problems.join('; ') : lines.join(' | ') + ' ; desktop cell and window box keep the full typed remark; (look at pictures)', cases.flatMap(c => [...ph[c.cs].pics, ...dk[c.cs].pics]).slice(0, 14))
  })
  L.savePartial('5a')
  await ctx.close()
}

/* ================= 45 ================= */
{
  const { ctx, page } = await L.open(L.PHONE, 'ad', 'a', true, { fresh: false })
  await L.step('45', 'phone filed; phone list + opened day on phone and desktop', 'Saber', async () => {
    await L.toList(page, true)
    const cases = [
      { cs: 'Ace', rmk: 'Submit form till 28 Jul', want: 'Submit form till 28 Jul' },
      { cs: 'Blade', rmk: 'Submit form till 29 Jul 2027', want: 'Submit form till 29 Jul 2027' },
    ]
    for (const c of cases) {
      const m = await L.fileInput(page, { type: 'Training', person: c.cs, from: '2026-07-27', to: '2026-07-29', rmk: c.rmk }, true)
      if (m.length !== 1) throw new Error('not saved: ' + c.cs + ' ' + await L.toast(page))
      c.iid = m[0].iid; c.saved = (await stored(page, c.iid)).remarks
    }
    const ph = {}, dk = {}
    for (const c of cases) ph[c.cs] = await readPhone(page, { iid: c.iid, days: D27 }, `45-${c.cs}`)
    const aft = {}; for (const c of cases) aft[c.cs] = (await stored(page, c.iid)).remarks
    const dtw = await L.twin(ctx, L.DESK, 'ad', 'a', false)
    for (const c of cases) dk[c.cs] = await readDesk(dtw.page, { iid: c.iid, days: D27 }, `45-${c.cs}`)
    await dtw.ctx.close()
    const problems = [], lines = []
    for (const c of cases) {
      const P = ph[c.cs], K = dk[c.cs]
      const got = [P.card?.rmk, P.days[D27[0]]?.rmk, P.days[D27[1]]?.rmk, K.days[D27[0]]?.rmk, K.days[D27[1]]?.rmk]
      got.forEach((g, i) => { if (norm(g) !== c.want) problems.push(`${c.cs}: ${['phone list', 'phone day 27', 'phone day 28', 'desktop day 27', 'desktop day 28'][i]} reads "${g}", expected "${c.want}"`) })
      const corners = [P.card?.when, P.days[D27[0]]?.when, K.days[D27[0]]?.when]
      if (corners.some(w => !/(^|· )till 29 Jul$/.test(w || ''))) problems.push(`${c.cs}: corner ${corners.join(' / ')}`)
      if (c.saved !== c.rmk || aft[c.cs] !== c.rmk) problems.push(`${c.cs}: saved remark "${c.saved}" → after reading "${aft[c.cs]}"`)
      if (K.win !== c.rmk) problems.push(`${c.cs}: window Remarks box "${K.win}"`)
      lines.push(`"${c.rmk}": corner "${P.card?.when}", cards read "${got[0]}", saved after reading "${aft[c.cs]}"`)
    }
    L.rec('45', 'phone filed; phone list + opened day on phone and desktop', 'Saber', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : lines.join(' | '), cases.flatMap(c => [...ph[c.cs].pics.slice(0, 2), ...dk[c.cs].pics.slice(0, 1)]))
  })
  L.savePartial('5b')
  await ctx.close()
}

/* ================= 46 ================= */
{
  const { ctx, page } = await L.open(L.DESK, 'us', 'us', false, { fresh: false })
  await L.step('46', 'desktop filed; phone list + opened day on phone and desktop', 'Ranger (member)', async () => {
    await L.toList(page, false)
    const had = await L.ids(page)
    await L.plus(page, false)
    await page.selectOption('#inpEditType', 'LL')
    await L.pick(page, '2026-12-30', false); await L.pick(page, '2027-01-02', false)
    const auto = await page.inputValue('#inpEditRmk'); const read = await page.locator('#inpEditPop .rc-read').textContent()
    const typed = 'Family trip ' + auto
    await page.fill('#inpEditRmk', typed)
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(500)
    const t = await L.toast(page)
    await page.locator(L.WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    const made = await L.newest(page, had)
    if (made.length !== 1) { const pic = await L.shot(page, '46-desk-refused'); throw new Error(`the leave was not saved (toast "${t}", window ${await page.locator(L.WIN).count()}) ${pic}`) }
    const it = { iid: made[0].iid, days: ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02'] }
    const sv = await stored(page, it.iid)
    const dk = await readDesk(page, it, '46')
    const aft = await stored(page, it.iid)
    const dtw = await L.twin(ctx, L.PHONE, 'us', 'us', true)
    const ph = await readPhone(dtw.page, it, '46')
    await dtw.ctx.close()
    console.log('46', JSON.stringify({ auto, read, sv, made: made[0], phoneCard: ph.card, phoneDays: ph.days, deskDays: dk.days, row: dk.row?.rmkFull, win: dk.win }))
    const problems = []
    const till = /till 2 Jan( 2027)?$/.exec(typed)?.[0] || ''
    for (const iso of it.days.slice(0, 3)) {
      const P = ph.days[iso], K = dk.days[iso]
      for (const [lbl, c] of [['phone', P], ['desktop', K]]) {
        if (!c) { problems.push(`${lbl} day ${iso}: no card`); continue }
        if (!/2 Jan/.test(c.when || '') || (iso < '2027' && !/2027/.test(c.when || ''))) problems.push(`${lbl} day ${iso}: corner "${c.when}" does not name January 2027`)
        if (norm(c.rmk) !== 'Family trip') problems.push(`${lbl} day ${iso}: remark "${c.rmk}" (expected "Family trip")`)
      }
    }
    if (!ph.card || !/2 Jan/.test(ph.card.when || '') || norm(ph.card.rmk) !== 'Family trip') problems.push(`phone list card corner "${ph.card?.when}" remark "${ph.card?.rmk}"`)
    const last = dk.days['2027-01-02'], lastP = ph.days['2027-01-02']
    if (!last || /till/.test(last.when || '') || norm(last.rmk) !== norm(typed)) problems.push(`last day (desktop): corner "${last?.when}" remark "${last?.rmk}" expected whole "${typed}"`)
    if (!lastP || /till/.test(lastP.when || '') || norm(lastP.rmk) !== norm(typed)) problems.push(`last day (phone): corner "${lastP?.when}" remark "${lastP?.rmk}"`)
    if (norm((dk.row?.rmk || '').replace(/^LATE ?/, '')) !== norm(typed)) problems.push(`desktop Remarks cell "${dk.row?.rmkFull}"`)
    if (dk.win !== typed) problems.push(`window Remarks box "${dk.win}" expected "${typed}"`)
    if (sv.remarks !== aft.remarks || sv.remarks !== typed) problems.push(`saved remark "${sv.remarks}" → "${aft.remarks}"`)
    L.rec('46', 'desktop filed; phone list + opened day on phone and desktop', 'Ranger (member)', problems.length ? 'FAIL' : 'PROVISIONAL', problems.length ? problems.join('; ') : `own LL 30 Dec 2026–2 Jan 2027, automatic words were "${auto}", saved remark "${sv.remarks}"; December days' corner "${dk.days['2026-12-30']?.when}" remark "${dk.days['2026-12-30']?.rmk}"; phone list corner "${ph.card.when}" remark "${ph.card.rmk}"; last day corner "${last.when}" remark whole; desktop cell and window keep every word (look at pictures)`, [...dk.pics.slice(0, 6), ...ph.pics.slice(0, 5)])
    // the same with the year left out of the saved wording, when the app wrote it with the year
    if (/2027/.test(auto)) console.log('NOTE auto text includes the year')
  })
  L.savePartial('5c')
  await ctx.close()
}

/* ================= 48 ================= */
{
  const { ctx, page } = await L.open(L.DESK, 'ad', 'a', false, { fresh: false })
  await L.step('48', 'desktop filed + edited; phone list + opened day on phone and desktop', 'Saber', async () => {
    await L.toList(page, false)
    const made = await L.fileInput(page, { type: 'Meeting', people: ['Ace', 'Blade'], from: '2026-07-27', to: '2026-07-29', title: 'C48 meeting', rmk: 'Bring ID till 29 Jul' }, false)
    if (made.length !== 2) throw new Error('shared input not saved as two: ' + made.length + ' ' + await L.toast(page))
    const grp = made[0].grp
    const before = await page.evaluate(g => window.INPUTS.filter(r => r.grp === g).map(r => ({ cs: window.PEOPLE[r.person].cs, end: r.endDate, rmk: r.remarks })), grp)
    // reopen through the desktop row, change the end to 30 Jul, save
    const trIid = await page.evaluate(g => { const tr = [...document.querySelectorAll('#inBody tr[data-iid]')].find(t => window.INPUTS.find(x => x.iid === t.getAttribute('data-iid'))?.grp === g); return tr?.getAttribute('data-iid') }, grp)
    await page.locator(`#inBody tr[data-iid="${trIid}"] [data-testid="in-open"]`).click(); await page.locator(L.WIN).waitFor()
    const hint = await page.locator(`${L.WIN} .inped-hint`).textContent().catch(() => '')
    await L.pick(page, '2026-07-27', false); await L.pick(page, '2026-07-30', false)
    const boxMid = await page.inputValue('#inpEditRmk')
    const pStart = await L.shot(page, '48-desk-window-30jul')
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(400)
    for (let k = 0; k < 3; k++) { if (await page.locator('[data-testid="oilconf"]').count()) await L.answerOil(page, false, 'no'); else break; await page.waitForTimeout(300) }
    await page.locator(L.WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    const after = await page.evaluate(g => window.INPUTS.filter(r => r.grp === g).map(r => ({ cs: window.PEOPLE[r.person].cs, end: r.endDate, rmk: r.remarks })), grp)
    const it = { iid: made[0].iid, days: ['2026-07-28', '2026-07-29', '2026-07-30'] }
    const dk = await readDesk(page, it, '48')
    const dtw = await L.twin(ctx, L.PHONE, 'ad', 'a', true)
    const ph = await readPhone(dtw.page, it, '48')
    await dtw.ctx.close()
    console.log('48', JSON.stringify({ before, after, hint, boxMid, phoneCard: ph.card, phoneDays: ph.days, deskDays: dk.days, row: dk.row?.rmkFull, win: dk.win }))
    const problems = []
    if (!after.every(r => r.end === 'Jul 30') || after.length !== 2) problems.push(`records after save: ${JSON.stringify(after)}`)
    if (!after.every(r => r.rmk === 'Bring ID till 30 Jul')) problems.push(`saved remarks after: ${after.map(r => r.rmk).join(' / ')}`)
        if (dk.win !== 'Bring ID till 30 Jul') problems.push(`reopened window box "${dk.win}"`)
    if (!/Bring ID till 30 Jul/.test(dk.row?.rmk || '')) problems.push(`desktop cell "${dk.row?.rmkFull}"`)
    for (const iso of ['2026-07-28', '2026-07-29']) for (const [lbl, c] of [['phone', ph.days[iso]], ['desktop', dk.days[iso]]]) {
      if (!c || !/(^|· )till 30 Jul$/.test(c.when || '') || norm(c.rmk) !== 'Bring ID') problems.push(`${lbl} day ${iso}: corner "${c?.when}" remark "${c?.rmk}"`)
    }
    for (const [lbl, c] of [['phone', ph.days['2026-07-30']], ['desktop', dk.days['2026-07-30']]]) if (!c || /till/.test(c.when || '') || norm(c.rmk) !== 'Bring ID till 30 Jul') problems.push(`${lbl} last day 30: corner "${c?.when}" remark "${c?.rmk}"`)
    if (!ph.card || !/(^|· )till 30 Jul$/.test(ph.card.when || '') || norm(ph.card.rmk) !== 'Bring ID') problems.push(`phone list card corner "${ph.card?.when}" remark "${ph.card?.rmk}"`)
    if (ph.nCards !== 1) problems.push(`phone list shows ${ph.nCards} cards for the shared input`)
    const stale = [ph.card?.text, ...Object.values(ph.days).map(c => c?.text), ...Object.values(dk.days).map(c => c?.text)].filter(t => /29 Jul/.test(t || ''))
    if (stale.length) problems.push('a card still says 29 Jul: ' + stale.join(' | '))
    L.rec('48', 'desktop filed + edited; phone list + opened day on phone and desktop', 'Saber', problems.length ? 'FAIL' : 'PASS', problems.length ? problems.join('; ') : `two-person Meeting 27–29 Jul "Bring ID till 29 Jul" (window line "${hint}"); after moving the end to 30 Jul both records end Jul 30 with remark "Bring ID till 30 Jul"; days 28 and 29 corner "till 30 Jul" remark "Bring ID" (phone and desktop); day 30 corner "${dk.days['2026-07-30'].when}" remark whole; phone list card corner "${ph.card.when}"; no card says 29 Jul. (In the open saved window the Remarks box still read "${boxMid}" after the new end was picked and before Save; reopened it read "${dk.win}".)`, [pStart, ...dk.pics.slice(0, 4), ...ph.pics.slice(0, 3)])
  })
  L.savePartial('5d')
  await ctx.close()
}
console.log('errors:', L.errs)
await L.browser.close()
