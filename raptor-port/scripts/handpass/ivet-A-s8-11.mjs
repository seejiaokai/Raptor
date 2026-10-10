// WALKER A — scenarios 8, 9, 10, 11 (shared inputs, leave and medical for several, the placeholders).
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
const pressedPucks = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [data-pp]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => window.PEOPLE[b.getAttribute('data-pp')]?.cs).sort())
const sev = async (page, T) => { await L.press(T, page.locator(`${WIN} [data-testid="pp-several"]`)) }
const puck = async (page, T, id) => { await L.press(T, page.locator(`${WIN} [data-pp="${id}"]`)) }

/* ---------- 8: desktop, admin ---------- */
await scen(8, 'desktop 1440x900', 'admin Saber', async () => {
  const T = false
  const { ctx, page } = await L.open(L.DESK, 'ad', 'a', T)
  const id = cs => L.csId(page, cs)
  await L.toList(page, T)
  const runs = []
  const pics = []
  async function run(label, firstPerson, add, date) {
    await L.plus(page, T)
    await page.selectOption('#inpEditType', 'Meeting')
    if (firstPerson !== 'Saber') await page.selectOption('#inpEditPerson', await id(firstPerson))
    await sev(page, T)
    const initial = await pressedPucks(page)
    for (const cs of add) await puck(page, T, await id(cs))
    await L.pick(page, date, T); await page.fill('#inpEditRmk', `S8 ${label}`)
    const want = await pressedPucks(page)
    pics.push(await L.shot(page, `S8-desk-${label}-picked`))
    const had = await L.ids(page)
    await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    const made = await L.newest(page, had)
    const row = made[0] && await L.rowOf(page, made[0].iid)
    pics.push(await L.shot(page, `S8-desk-${label}-saved`))
    await L.openSaved(page, T, made.map(m => m.iid))
    const back = await pressedPucks(page); const w = await L.winState(page)
    pics.push(await L.shot(page, `S8-desk-${label}-reopened`))
    await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    const got = made.map(m => m.cs).sort()
    const once = new Set(got).size === got.length
    runs.push({ label, initial, want, got, once, grp: new Set(made.map(m => m.grp)).size, by: [...new Set(made.map(m => m.byCs))], rowName: row?.name, reopened: back, ok: JSON.stringify(got) === JSON.stringify(want) && once && new Set(made.map(m => m.grp)).size === 1 && made.every(m => m.byCs === 'Saber') && JSON.stringify(back) === JSON.stringify(want) })
  }
  await run('two-without-filer', 'Ranger', ['Echo'], '2026-08-03')
  await run('four-with-filer', 'Saber', ['Wisp', 'Ace', 'Ranger'], '2026-08-04')
  await run('four-without-filer', 'Wisp', ['Ace', 'Vapor', 'Echo'], '2026-08-05')
  const ok = runs.every(r => r.ok) && runs[0].got.length === 2 && runs[1].got.length === 4 && runs[2].got.length === 4 && !runs[0].got.includes('Saber') && runs[1].got.includes('Saber') && !runs[2].got.includes('Saber')
  await ctx.close()
  return { ok, said: JSON.stringify(runs) + ' (the "member setting on" part is not needed by an admin; not touched)', pics }
})

/* ---------- 9: phone, both in turn ---------- */
await scen(9, 'phone 390x844', 'admin Saber, then member Ranger (setting on)', async () => {
  const T = true
  const { ctx, page } = await adminPrep(L.PHONE, T, true, 'S9')
  const id = cs => L.csId(page, cs)
  const pics = []
  const res = {}
  /* Saber: a two-person LL */
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'LL')
  const seeSev = await page.locator(`${WIN} [data-testid="pp-several"]`).count()
  await sev(page, T); await puck(page, T, await id('Echo'))
  await L.pick(page, '2026-08-10', T)
  let had = await L.ids(page)
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  if (await page.locator('[data-testid="oilconf"]').count()) await L.answerOil(page, T, 'no')
  let made = await L.newest(page, had)
  res.adminLL = { several: seeSev, saved: made.map(m => `${m.cs} ${m.type} ${m.date}`), grp: new Set(made.map(m => m.grp)).size }
  pics.push(await L.shot(page, 'S9-phone-admin-LL-saved'))
  /* Saber: Meeting for two, then ATT C */
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Meeting')
  await sev(page, T); await puck(page, T, await id('Wisp'))
  await L.pick(page, '2026-08-11', T)
  const before = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] [data-pp]')].filter(b => b.getAttribute('aria-pressed') === 'true').length)
  await page.selectOption('#inpEditType', 'ATT C')
  const afterSw = await L.winState(page)
  const pk = await pressedPucks(page)
  pics.push(await L.shot(page, 'S9-phone-admin-meeting-to-ATTC'))
  const n0 = await L.count(page)
  await L.clearToast(page)
  await page.locator('#inpEditSave').tap(); await page.waitForTimeout(500)
  const tt = await L.toast(page)
  const q = { doc: await page.locator('[data-testid="docconf"]').count(), clash: await page.locator('[data-testid="medclash"]').count() }
  if (q.doc) { await page.locator('[data-testid="docconf-nodoc"]').tap(); await page.waitForTimeout(500) }
  const n1 = await L.count(page)
  const savedAfter = await page.evaluate(() => window.INPUTS.filter(r => r.type === 'ATT C').map(r => `${window.PEOPLE[r.person]?.cs} ${r.date}`))
  pics.push(await L.shot(page, 'S9-phone-admin-ATTC-after-add'))
  res.adminMed = { pressedBeforeSwitch: before, afterSwitch: { who: afterSw.who, several: afterSw.several, why: afterSw.why.replace(/\s+/g, ' ') }, pressedAfter: pk, toast: tt, questions: q, count: `${n0}->${n1}`, attc: savedAfter, windowStillOpen: (await L.winState(page)).open }
  if (await page.locator(WIN).count()) { await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200) }
  /* Ranger */
  await L.reloadAs(page, 'us', 'us')
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty'); await sev(page, T); await puck(page, T, await id('Echo'))
  await page.selectOption('#inpEditType', 'LL')
  const rl = await L.winState(page); const rpk = await pressedPucks(page)
  pics.push(await L.shot(page, 'S9-phone-member-two-then-LL'))
  await L.pick(page, '2026-08-12', T)
  const rn0 = await L.count(page); await L.clearToast(page)
  await page.locator('#inpEditSave').tap(); await page.waitForTimeout(500)
  const rt = await L.toast(page); const rn1 = await L.count(page)
  const rLL = await page.evaluate(() => window.INPUTS.filter(r => r.type === 'LL').map(r => `${window.PEOPLE[r.person]?.cs} ${r.date}`))
  res.memberLL = { who: rl.who, several: rl.several, why: rl.why.replace(/\s+/g, ' ').slice(0, 120), pressed: rpk, toast: rt, count: `${rn0}->${rn1}`, allLL: rLL }
  /* Ranger: Meeting for two, then ATT C */
  await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200)
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Meeting'); await sev(page, T); await puck(page, T, await id('Echo'))
  await L.pick(page, '2026-08-13', T)
  await page.selectOption('#inpEditType', 'ATT C')
  const ma = await L.winState(page); const mpk = await pressedPucks(page)
  pics.push(await L.shot(page, 'S9-phone-member-meeting-to-ATTC'))
  const mn0 = await L.count(page); await L.clearToast(page)
  await page.locator('#inpEditSave').tap(); await page.waitForTimeout(500)
  const mt = await L.toast(page)
  const mq = { doc: await page.locator('[data-testid="docconf"]').count() }
  if (mq.doc) { await page.locator('[data-testid="docconf-nodoc"]').tap(); await page.waitForTimeout(500) }
  const mn1 = await L.count(page)
  const mAtt = await page.evaluate(() => window.INPUTS.filter(r => r.type === 'ATT C').map(r => `${window.PEOPLE[r.person]?.cs} ${r.date}`))
  pics.push(await L.shot(page, 'S9-phone-member-ATTC-after-add'))
  res.memberMed = { who: ma.who, several: ma.several, why: ma.why.replace(/\s+/g, ' ').slice(0, 120), pressed: mpk, toast: mt, questions: mq, count: `${mn0}->${mn1}`, attc: mAtt }
  await ctx.close()
  const ok = res.adminLL.saved.length === 2 && res.adminLL.grp === 1 && n1 - n0 <= 1 && res.memberLL.count.split('->')[0] === res.memberLL.count.split('->')[1] && !res.memberLL.allLL.some(x => /Ranger|Echo/.test(x) && /Aug 12/.test(x))
  return { status: ok ? 'PASS' : 'FAIL', ok, said: JSON.stringify(res), pics }
})

/* ---------- 10: desktop, Ranger, setting on ---------- */
await scen(10, 'desktop 1440x900', 'member Ranger (setting on)', async () => {
  const T = false
  const { ctx, page } = await adminPrep(L.DESK, T, true, 'S10')
  await L.reloadAs(page, 'us', 'us')
  const pics = []
  await L.toList(page, T)
  const cases = [['Duty', 'allavail', '2026-07-27', 'S10 duty', null], ['Event', 'all', '2026-07-28', 'S10 event', 'S10 sports'], ['Training', 'allavail', '2026-07-29', 'S10 training', 'S10 training title'], ['Meeting', 'all', '2026-07-30', 'S10 meeting', 'S10 meeting title'], ['Appointment', 'allavail', '2026-07-31', 'S10 appt', 'S10 appt title'], ['Other', 'all', '2026-08-03', 'S10 other', 'S10 other title']]
  const out = []
  for (const [t, who, date, rmk, title] of cases) {
    await L.plus(page, T)
    await page.selectOption('#inpEditType', t); await page.selectOption('#inpEditPerson', who)
    await L.pick(page, date, T)
    if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').click()
    await page.fill('#inpEditStart', '09:30'); await page.fill('#inpEditEnd', '10:45')
    if (title) await page.fill('#inpEditOwnTitle', title)
    await page.fill('#inpEditRmk', rmk)
    const had = await L.ids(page)
    await L.clearToast(page)
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(500)
    if (await page.locator('[data-testid="oilconf"]').count()) await L.answerOil(page, T, 'no')
    const stillOpen = await page.locator(WIN).count()
    const tt = await L.toast(page)
    const made = await L.newest(page, had)
    const rec = { t, who, saved: made.length, person: made[0]?.person, by: made[0]?.byCs, title: made[0]?.title, s: made[0]?.s, e: made[0]?.e, grp: made[0]?.grp || null, stillOpen, toast: tt }
    if (made[0]) {
      await L.everyone(page, T)
      await L.openSaved(page, T, made[0].iid)
      const w = await L.winState(page)
      rec.reopen = { whoValue: w.whoValue, who: w.who, type: w.type, title: w.title2, start: w.start, end: w.end, placed: w.placed.slice(0, 50) }
      if (t === 'Event' || t === 'Duty') pics.push(await L.shot(page, `S10-desk-${t}-reopened`))
      await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
    } else { pics.push(await L.shot(page, `S10-desk-${t}-not-saved`)); if (await page.locator(WIN).count()) await page.locator('#inpEditCancel').click() }
    out.push(rec)
  }
  /* placeholder vs Everyone in the filter */
  await L.toList(page, T)
  const filterOpts = await page.evaluate(() => [...document.querySelectorAll('#inFPerson option')].filter(o => /all|every/i.test(o.value + ' ' + o.textContent)).map(o => `${o.value}=${o.textContent}`))
  const rowsNames = await page.evaluate(() => [...document.querySelectorAll('#inBody tr')].filter(t => /S10/.test(t.textContent)).map(t => t.querySelector('[data-label="Name"]').textContent.trim()))
  await page.selectOption('#inFPerson', 'ph:allavail').catch(() => {})
  const filterValue = await page.locator('#inFPerson').inputValue()
  const nShown = await page.locator('#inBody tr').count()
  pics.push(await L.shot(page, 'S10-desk-list-placeholders'))
  const ok = out.every(o => o.saved === 1 && o.reopen && o.reopen.who === (o.who === 'all' ? 'ALL' : 'ALL AVAIL') && o.by === 'Ranger' && o.reopen.start === '09:30' && o.reopen.end === '10:45' && !o.grp && (!['Event', 'Training', 'Meeting', 'Appointment', 'Other'].includes(o.t) || o.reopen.title === o.title))
  await ctx.close()
  return { ok, said: `${JSON.stringify(out)}; Person filter's placeholder entries ${JSON.stringify(filterOpts)}; names on the rows ${JSON.stringify(rowsNames)}; filter set to ALL AVAIL took value "${filterValue}" and showed ${nShown} rows`, pics }
})

/* ---------- 11: phone, Ranger, setting on ---------- */
await scen(11, 'phone 390x844', 'member Ranger (setting on)', async () => {
  const T = true
  const { ctx, page } = await adminPrep(L.PHONE, T, true, 'S11')
  await L.reloadAs(page, 'us', 'us')
  const pics = [], res = {}
  await L.toList(page, T); await L.plus(page, T)
  for (const ph of ['allavail', 'all']) {
    await page.selectOption('#inpEditType', ph === 'all' ? 'Event' : 'Duty'); await page.selectOption('#inpEditPerson', ph)
    await L.pick(page, '2026-08-17', T); await L.pick(page, '2026-08-19', T)
    await page.fill('#inpEditRmk', `S11 ${ph} words`)
    const n0 = await L.count(page); await L.clearToast(page)
    await page.locator('#inpEditSave').tap(); await page.waitForTimeout(500)
    const t1 = await L.toast(page); const w1 = await L.winState(page)
    pics.push(await L.shot(page, `S11-phone-${ph}-two-days`))
    /* one day, an unsupported kind */
    await L.pick(page, '2026-08-17', T); await L.pick(page, '2026-08-17', T).catch(() => {})
    const dateRead = (await L.winState(page)).read
    await page.selectOption('#inpEditType', 'LL')
    const w2 = await L.winState(page)
    pics.push(await L.shot(page, `S11-phone-${ph}-to-LL`))
    await L.clearToast(page)
    await page.locator('#inpEditSave').tap(); await page.waitForTimeout(500)
    const t2 = await L.toast(page); const w3 = await L.winState(page)
    const n1 = await L.count(page)
    pics.push(await L.shot(page, `S11-phone-${ph}-LL-refused`))
    /* the several-people switch while a placeholder is selected */
    await page.selectOption('#inpEditType', 'Meeting')
    const w4a = await L.winState(page)
    const hasSev = await page.locator(`${WIN} [data-testid="pp-several"]`).count()
    let afterSev = null
    if (hasSev) { await sev(page, T); afterSev = await L.winState(page); afterSev.pk = await pressedPucks(page); afterSev.sel = await page.evaluate(() => document.querySelector('#inpEditPerson')?.value ?? null) }
    pics.push(await L.shot(page, `S11-phone-${ph}-several`))
    res[ph] = { twoDays: { toast: t1, count: `${n0}`, person: w1.whoValue, type: w1.type, rmk: w1.rmk, open: w1.open }, oneDay: dateRead, toLL: { person: w2.whoValue, who: w2.who, why: w2.why.replace(/\s+/g, ' ').slice(0, 100) }, LLadd: { toast: t2, person: w3.whoValue, open: w3.open, saved: n1 === n0 }, meeting: { person: w4a.whoValue, severalSwitch: hasSev, afterSev: afterSev && { who: afterSev.who, why: afterSev.why.replace(/\s+/g, ' ').slice(0, 120), pressed: afterSev.pk, sel: afterSev.sel } } }
    await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200)
    if (await page.locator('[data-testid="inped-swap-go"]').count()) await page.locator('[data-testid="inped-swap-go"]').tap()
    await page.waitForTimeout(200)
    await L.plus(page, T)
  }
  const bad = await page.evaluate(() => window.INPUTS.filter(r => /S11 (allavail|all) words/.test(r.remarks || '')).length)
  await ctx.close()
  const ok = ['allavail', 'all'].every(p => /one day/i.test(res[p].twoDays.toast) && res[p].LLadd.saved && !!res[p].LLadd.toast) && bad === 0
  return { ok, said: JSON.stringify(res) + ` saved S11 inputs: ${bad}`, pics }
})

await L.finish('docs/handpass/parts/ivet-A-part3.json')
