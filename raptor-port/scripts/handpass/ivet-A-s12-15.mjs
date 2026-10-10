// WALKER A — scenarios 12, 13, 14, 15 (a posted-out man, the two-tap dates, the span buttons, overnight and missing hours).
import * as L from './ivet-A-lib.mjs'
const { WIN } = L
async function scen(n, size, role, fn) {
  try { const r = await fn(); L.record(n, size, role, r.status || (r.ok ? 'PASS' : 'FAIL'), r.said, r.pics || []) }
  catch (e) { L.record(n, size, role, 'ERROR', 'script stopped: ' + String(e.message || e).split('\n').slice(0, 4).join(' ⏎ '), []) }
}
async function adminPrep(viewport, touch, on, tag) {
  const { ctx, page } = await L.open(viewport, 'ad', 'a', touch, false)
  const now = await L.setMemberFile(page, touch, on)
  await L.toList(page, touch); await L.plus(page, touch)
  await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-08-03', touch)
  await page.fill('#inpEditRmk', `${tag} Saber own`)
  await page.locator('#inpEditSave').click().catch(() => {})
  await page.locator(WIN).waitFor({ state: 'hidden' }).catch(() => {})
  return { ctx, page, now }
}
const span = page => page.evaluate(() => document.querySelector('#inpEditSpan [aria-pressed="true"]')?.getAttribute('data-span') || null)
const hoursState = page => page.evaluate(() => { const s = document.querySelector('#inpEditStart'), e = document.querySelector('#inpEditEnd'); const vis = x => !!x && x.getClientRects().length > 0; return { sVis: vis(s), eVis: vis(e), s: s?.value ?? null, e: e?.value ?? null, dis: !!s?.disabled || !!s?.readOnly } })
const recOf = (page, iid) => page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r && { t: r.type, d: r.date, ed: r.endDate, allday: r.allday, half: r.half || null, s: r.s, e: r.e, rmk: r.remarks } }, iid)

/* ---------- 12: desktop, Saber then Ranger ---------- */
await scen(12, 'desktop 1440x900', 'admin Saber, then member Ranger', async () => {
  const T = false
  const { ctx, page } = await adminPrep(L.DESK, T, true, 'S12')
  const pics = []
  const pid = await L.csId(page, 'Ridge')
  /* Admin -> Users -> Archive, through the screen as the host's walk did */
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  if (!(await page.locator('#accList:visible').count())) { await page.getByText('Sign-in and roster').first().click(); await page.waitForTimeout(600) }
  await page.locator(`#accList [data-person="${pid}"]`).first().click(); await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Archive', exact: true }).first().click(); await page.waitForTimeout(700)
  const archived = await page.evaluate(pid => !!window.PEOPLE[pid].archived, pid)
  pics.push(await L.shot(page, 'S12-desk-admin-users-archived'))
  if (!archived) return { status: 'NOT RUN', ok: false, said: 'the Archive press on Admin -> Users did not archive Ridge', pics }
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Meeting')
  const group = await page.evaluate(() => { const g = document.querySelector('#inpEditPerson optgroup[label="Posted out / archived"]'); return g ? [...g.querySelectorAll('option')].map(o => o.textContent) : null })
  await page.selectOption('#inpEditPerson', pid); await L.pick(page, '2026-08-05', T); await page.fill('#inpEditRmk', 'S12 ridge')
  pics.push(await L.shot(page, 'S12-desk-archived-picked'))
  const had = await L.ids(page); await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const made = await L.newest(page, had)
  await L.openSaved(page, T, made[0].iid)
  const w = await L.winState(page); pics.push(await L.shot(page, 'S12-desk-archived-reopened'))
  await page.locator('#inpEditCancel').click()
  /* Ranger */
  await L.reloadAs(page, 'us', 'us')
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Meeting')
  const rg = await page.evaluate(pid => ({ group: !!document.querySelector('#inpEditPerson optgroup[label="Posted out / archived"]'), hasRidge: [...document.querySelectorAll('#inpEditPerson option')].some(o => o.value === pid), n: document.querySelectorAll('#inpEditPerson option').length }), pid)
  pics.push(await L.shot(page, 'S12-desk-ranger-picker'))
  const ok = !!group && group.includes('Ridge') && made.length === 1 && made[0].person === pid && made[0].type === 'Meeting' && w.who === 'Ridge' && !rg.group && !rg.hasRidge
  await ctx.close()
  return { ok, said: `Ridge archived on Admin -> Users (${archived}); admin's "Posted out / archived" group lists ${JSON.stringify(group)}; saved ${JSON.stringify(made.map(m => ({ cs: m.cs, t: m.type, d: m.date, by: m.byCs })))}; reopened window person "${w.who}", read "${w.read}"; Ranger's Person list: group ${rg.group}, Ridge listed ${rg.hasRidge}, ${rg.n} options`, pics }
})

/* ---------- 13: phone, admin ---------- */
await scen(13, 'phone 390x844', 'admin Saber', async () => {
  const T = true
  const { ctx, page } = await L.open(L.PHONE, 'ad', 'a', T)
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'LL')
  const read = async () => ({ read: (await L.winState(page)).read, rmk: await page.inputValue('#inpEditRmk'), sel: await page.locator('#inpEdCal .rc-d.s, #inpEdCal .rc-d.e, #inpEdCal .rc-d.in, #inpEdCal .rc-d.sel').count() })
  const seq = []
  await L.pick(page, '2026-07-27', T); seq.push(['27', await read()])
  await L.pick(page, '2026-07-29', T); seq.push(['29', await read()]); const pA = await L.shot(page, 'S13-phone-27-29')
  await L.pick(page, '2026-07-29', T); seq.push(['again 29', await read()])
  await L.pick(page, '2026-07-27', T); seq.push(['27 (backwards)', await read()]); const pB = await L.shot(page, 'S13-phone-backwards')
  await L.pick(page, '2026-07-30', T); seq.push(['30', await read()]); const pC = await L.shot(page, 'S13-phone-27-30')
  const had = await L.ids(page)
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const made = await L.newest(page, had)
  const rec = made[0] && await recOf(page, made[0].iid)
  const ok = seq[0][1].read === 'Jul 27' && seq[1][1].read === 'Jul 27 → Jul 29' && seq[1][1].rmk === 'till 29 Jul' && seq[2][1].read === 'Jul 29' && seq[3][1].read === 'Jul 27' && seq[4][1].read === 'Jul 27 → Jul 30' && seq[4][1].rmk === 'till 30 Jul' && made.length === 1 && rec.d === 'Jul 27' && rec.ed === 'Jul 30' && rec.rmk === 'till 30 Jul'
  await ctx.close()
  return { ok, said: `${JSON.stringify(seq)}; saved ${JSON.stringify(rec)}`, pics: [pA, pB, pC] }
})

/* ---------- 14: desktop, Ranger ---------- */
await scen(14, 'desktop 1440x900', 'member Ranger', async () => {
  const T = false
  const { ctx, page } = await L.open(L.DESK, 'us', 'us', T)
  await L.toList(page, T)
  const out = []; const pics = []
  const cases = [['all', '2026-08-03', null], ['am', '2026-08-04', null], ['pm', '2026-08-05', null], ['custom', '2026-08-06', ['09:15', '11:45']]]
  for (const [sp, date, hrs] of cases) {
    await L.plus(page, T)
    await page.selectOption('#inpEditType', 'LL'); await L.pick(page, date, T)
    await page.locator(`#inpEditSpan [data-span="${sp}"]`).click()
    if (hrs) { await page.fill('#inpEditStart', hrs[0]); await page.fill('#inpEditEnd', hrs[1]) }
    const draft = { span: await span(page), hours: await hoursState(page) }
    const had = await L.ids(page); await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    const made = await L.newest(page, had)
    if (!made[0]) { out.push({ sp, draft, saved: null }); if (await page.locator(WIN).count()) await page.locator('#inpEditCancel').click(); pics.push(await L.shot(page, `S14-desk-${sp}-notsaved`)); continue }
    const rec = await recOf(page, made[0].iid)
    await L.everyone(page, T)
    await L.openSaved(page, T, made[0].iid)
    const re = { span: await span(page), hours: await hoursState(page) }
    pics.push(await L.shot(page, `S14-desk-${sp}-reopened`))
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    out.push({ sp, draft, rec, re })
  }
  /* an AM draft switched to Duty */
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'LL'); await L.pick(page, '2026-08-07', T); await page.locator('#inpEditSpan [data-span="am"]').click()
  await page.selectOption('#inpEditType', 'Duty')
  const duty = { span: await span(page), hours: await hoursState(page), allday: (await L.winState(page)).allday }
  pics.push(await L.shot(page, 'S14-desk-AM-to-Duty'))
  const had = await L.ids(page); await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const dmade = await L.newest(page, had); const drec = dmade[0] && await recOf(page, dmade[0].iid)
  const good = (o, sp, s, e) => o.saved !== null && o.rec && o.re && o.re.span === sp && (s === null ? true : o.rec.s === s && o.rec.e === e)
  const allD = out[0], amD = out[1], pmD = out[2], cuD = out[3]
  const ok = allD.rec && allD.rec.allday === true && allD.re.span === 'all' && !allD.re.hours.sVis && amD.rec && amD.re.span === 'am' && amD.re.hours.s === '00:00' && amD.re.hours.e === '12:00' && pmD.rec && pmD.re.span === 'pm' && pmD.re.hours.s === '12:01' && pmD.re.hours.e === '23:59' && cuD.rec && cuD.re.span === 'custom' && cuD.re.hours.s === '09:15' && cuD.re.hours.e === '11:45' && duty.span === null && !!drec && !drec.half
  await ctx.close()
  return { ok, said: `${JSON.stringify(out)}; AM draft switched to Duty ${JSON.stringify(duty)}, saved ${JSON.stringify(drec)}`, pics }
})

/* ---------- 15: phone, Ranger ---------- */
await scen(15, 'phone 390x844', 'member Ranger', async () => {
  const T = true
  const { ctx, page } = await L.open(L.PHONE, 'us', 'us', T)
  await L.toList(page, T)
  const res = {}; const pics = []
  /* a: overnight Duty */
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty'); await L.pick(page, '2026-08-10', T)
  if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').tap()
  await page.fill('#inpEditStart', '22:00'); await page.fill('#inpEditEnd', '02:00')
  let had = await L.ids(page); await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  let made = await L.newest(page, had)
  if (await page.locator(WIN).count()) { res.dutyNotSaved = await L.toast(page); pics.push(await L.shot(page, 'S15-phone-duty-overnight-notsaved')) }
  else { await L.everyone(page, T); await L.openSaved(page, T, made[0].iid); res.duty = { rec: await recOf(page, made[0].iid), start: await page.inputValue('#inpEditStart'), end: await page.inputValue('#inpEditEnd') }; pics.push(await L.shot(page, 'S15-phone-duty-overnight-reopened')); await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200) }
  /* b, c: equal and missing */
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty'); await L.pick(page, '2026-08-12', T)
  if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').tap()
  await page.fill('#inpEditStart', '10:00'); await page.fill('#inpEditEnd', '10:00')
  let n0 = await L.count(page); await L.clearToast(page); await page.locator('#inpEditSave').tap(); await page.waitForTimeout(400)
  res.equal = { toast: await L.toast(page), made: (await L.count(page)) - n0, open: (await L.winState(page)).open }
  pics.push(await L.shot(page, 'S15-phone-equal-hours'))
  await page.fill('#inpEditStart', ''); await page.fill('#inpEditEnd', '11:00')
  await L.clearToast(page); await page.locator('#inpEditSave').tap(); await page.waitForTimeout(400)
  res.missing = { toast: await L.toast(page), made: (await L.count(page)) - n0 }
  pics.push(await L.shot(page, 'S15-phone-missing-time'))
  /* d: overnight Custom leave */
  await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200)
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'LL'); await L.pick(page, '2026-08-13', T)
  await page.locator('#inpEditSpan [data-span="custom"]').tap()
  await page.fill('#inpEditStart', '22:00'); await page.fill('#inpEditEnd', '02:00')
  had = await L.ids(page); await L.clearToast(page); await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  made = await L.newest(page, had)
  if (!made[0]) { res.leaveNotSaved = await L.toast(page); pics.push(await L.shot(page, 'S15-phone-leave-overnight-notsaved')) }
  else { await L.everyone(page, T); await L.openSaved(page, T, made[0].iid); res.leave = { rec: await recOf(page, made[0].iid), span: await span(page), start: await page.inputValue('#inpEditStart'), end: await page.inputValue('#inpEditEnd') }; pics.push(await L.shot(page, 'S15-phone-leave-overnight-reopened')) }
  const ok = !!res.duty && res.duty.start === '22:00' && res.duty.end === '02:00' && /^Give the input a start and end that are not the same time.?$/.test(res.equal.toast) && res.equal.made === 0 && /^Give the input a start and end time, or tick All day.?$/.test(res.missing.toast) && res.missing.made === 0 && !!res.leave && res.leave.span === 'custom' && res.leave.start === '22:00' && res.leave.end === '02:00'
  await ctx.close()
  return { ok, said: JSON.stringify(res), pics }
})

await L.finish('docs/handpass/parts/ivet-A-part4.json')
