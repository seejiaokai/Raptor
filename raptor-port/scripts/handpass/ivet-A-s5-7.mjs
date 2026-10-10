// WALKER A — scenarios 5, 6, 7 (a member filing for others; the gear's setting). Worlds opened WITHOUT ?fresh=1 so they survive the second sign-in.
import * as L from './ivet-A-lib.mjs'
const { WIN } = L
async function scen(n, size, role, fn) {
  try { const r = await fn(); L.record(n, size, role, r.status || (r.ok ? 'PASS' : 'FAIL'), r.said, r.pics || []) }
  catch (e) { L.record(n, size, role, 'ERROR', 'script stopped: ' + String(e.message || e).split('\n').slice(0, 4).join(' ⏎ '), []) }
}
/* Saber, in a persisted world: the setting on/off, one saved change (an input of his own), then a reload as Ranger */
async function adminPrep(viewport, touch, on, tag) {
  const { ctx, page } = await L.open(viewport, 'ad', 'a', touch, false)
  const now = await L.setMemberFile(page, touch, on)
  await L.toList(page, touch); await L.plus(page, touch)
  await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-08-03', touch)
  await page.fill('#inpEditRmk', `${tag} Saber own`)
  await page.locator('#inpEditSave').click({ trial: false }).catch(() => {})
  await page.locator(WIN).waitFor({ state: 'hidden' }).catch(() => {})
  return { ctx, page, now }
}
const personOptions = page => page.evaluate(() => [...(document.querySelector('#inpEditPerson')?.options || [])].map(o => o.value))

/* ---------- 5: phone, Ranger, setting on ---------- */
await scen(5, 'phone 390x844', 'member Ranger (Saber set the setting)', async () => {
  const T = true
  const { ctx, page, now } = await adminPrep(L.PHONE, T, true, 'S5')
  const kept = await page.evaluate(() => window.INPUTS.filter(r => /S5 Saber own/.test(r.remarks || '')).length)
  await L.reloadAs(page, 'us', 'us')
  const persisted = await page.evaluate(() => window.INPUTS.filter(r => /S5 Saber own/.test(r.remarks || '')).length)
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty')
  const opts = (await personOptions(page)).length
  await page.selectOption('#inpEditPerson', await L.csId(page, 'Echo'))
  await L.pick(page, '2026-07-27', T)
  if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').tap()
  await page.fill('#inpEditStart', '10:00'); await page.fill('#inpEditEnd', '11:00'); await page.fill('#inpEditRmk', 'S5 first remark')
  const p1 = await L.shot(page, 'S5-phone-echo-draft')
  const had = await L.ids(page)
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const made = await L.newest(page, had)
  await L.everyone(page, T)
  const row = made[0] && await L.rowOf(page, made[0].iid)
  const p2 = await L.shot(page, 'S5-phone-echo-saved')
  await L.openSaved(page, T, made[0].iid)
  const w1 = await L.winState(page)
  const p3 = await L.shot(page, 'S5-phone-echo-reopened')
  await page.fill('#inpEditRmk', 'S5 changed remark')
  const canSave = await page.locator('#inpEditSave').count()
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const after = await page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r && { cs: window.PEOPLE[r.person]?.cs, by: window.PEOPLE[r.by]?.cs, rmk: r.remarks, type: r.type } }, made[0].iid)
  const ok = now === true && kept === 1 && persisted === 1 && made.length === 1 && made[0].cs === 'Echo' && made[0].byCs === 'Ranger' && made[0].type === 'Duty' && !!row && /By Ranger/.test(row.by) && row.name === 'Echo'
    && /Ranger/.test(w1.placed) && w1.who === 'Echo' && canSave === 1 && !!after && after.cs === 'Echo' && after.by === 'Ranger' && after.rmk === 'S5 changed remark'
  await ctx.close()
  return { ok, said: `setting on (box ${now}); Saber's saved input survived the second sign-in (${persisted}); Ranger's Person list offered ${opts} choices; saved ${JSON.stringify(made.map(m => ({ for: m.cs, by: m.byCs, t: m.type, d: m.date, s: m.s, e: m.e })))}; card ${JSON.stringify(row)}; reopened: person ${w1.who}, "${w1.placed}", Save present ${canSave}; after the change ${JSON.stringify(after)}`, pics: [p1, p2, p3] }
})

/* ---------- 6: desktop, Ranger, setting switched OFF after he filed ---------- */
await scen(6, 'desktop 1440x900', 'member Ranger (Saber set the setting)', async () => {
  const T = false
  const { ctx, page } = await adminPrep(L.DESK, T, true, 'S6')
  await L.reloadAs(page, 'us', 'us')
  /* set-up as Ranger with the setting on: an Echo duty (28 Jul) and his own meeting (29 Jul) */
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', await L.csId(page, 'Echo')); await L.pick(page, '2026-07-28', T)
  await page.fill('#inpEditRmk', 'S6 echo duty')
  let had = await L.ids(page); await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const echo = (await L.newest(page, had))[0]
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-07-29', T); await page.fill('#inpEditRmk', 'S6 ranger own')
  had = await L.ids(page); await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const own = (await L.newest(page, had))[0]
  /* Saber switches the setting off */
  await L.reloadAs(page, 'ad', 'a')
  const off = await L.setMemberFile(page, T, false)
  await L.reloadAs(page, 'us', 'us')
  const still = await page.evaluate(() => window.INPUTS.filter(r => /S6 (echo duty|ranger own)/.test(r.remarks || '')).length)
  await L.toList(page, T); await L.plus(page, T)
  const out = {}
  for (const t of ['Duty', 'Meeting', 'Event']) {
    await page.selectOption('#inpEditType', t)
    out[t] = await page.evaluate(() => ({ list: !!document.querySelector('#inpEditPerson'), n: document.querySelector('#inpEditPerson')?.options.length ?? 0, fixed: document.querySelector('#inpEditPersonFixed')?.textContent || '', several: !!document.querySelector('[data-testid="pp-several"]'), ph: !!document.querySelector('#inpEditPerson optgroup[data-ph]'), why: document.querySelector('[data-testid="pp-why"]')?.innerText.replace(/\s+/g, ' ') || '' }))
  }
  const p1 = await L.shot(page, 'S6-desk-new-after-off')
  await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
  await L.everyone(page, T)
  await L.openSaved(page, T, echo.iid)
  const wE = await L.winState(page); const p2 = await L.shot(page, 'S6-desk-echo-after-off')
  const eBtn = await page.evaluate(() => ({ save: document.querySelectorAll('#inpEditSave').length, del: document.querySelectorAll('#inpEditDel').length }))
  await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
  await L.openSaved(page, T, own.iid)
  const wO = await L.winState(page); const p3 = await L.shot(page, 'S6-desk-own-after-off')
  const oBtn = await page.evaluate(() => ({ save: document.querySelectorAll('#inpEditSave').length, del: document.querySelectorAll('#inpEditDel').length }))
  await page.fill('#inpEditRmk', 'S6 ranger own changed'); await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const ownAfter = await page.evaluate(iid => window.INPUTS.find(r => r.iid === iid)?.remarks, own.iid)
  const restricted = ['Duty', 'Meeting', 'Event'].every(t => !out[t].several && !out[t].ph && out[t].n <= 1)
  const ok = off === false && still === 2 && restricted && eBtn.save === 0 && eBtn.del === 0 && /can change this/.test(wE.ro) && oBtn.save === 1 && ownAfter === 'S6 ranger own changed'
  await ctx.close()
  return { ok, said: `Echo duty by Ranger filed (${echo.cs}/${echo.byCs}) and his own meeting; Saber's box now ${off}; both inputs still present (${still}); Ranger's new window per kind ${JSON.stringify(out)}; Echo's duty reopened: Save ${eBtn.save}, Delete ${eBtn.del}, words "${wE.ro}"; his own reopened: Save ${oBtn.save}, Delete ${oBtn.del}, changed remark saved: ${ownAfter}`, pics: [p1, p2, p3] }
})

/* ---------- 7: phone, Ranger, setting on ---------- */
await scen(7, 'phone 390x844', 'member Ranger (setting on)', async () => {
  const T = true
  const { ctx, page } = await adminPrep(L.PHONE, T, true, 'S7')
  await L.reloadAs(page, 'us', 'us')
  const echoId = await L.csId(page, 'Echo'), rangerId = await L.csId(page, 'Ranger')
  await L.toList(page, T); await L.plus(page, T)
  /* (a) a NEW Duty draft for Echo, turned to LL, valid dates, Add */
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', echoId)
  await page.selectOption('#inpEditType', 'LL')
  const wLL = await L.winState(page)
  await L.pick(page, '2026-08-04', T)
  const before = await L.count(page)
  await L.clearToast(page); await page.locator('#inpEditSave').tap(); await page.waitForTimeout(400)
  const refusedA = await L.toast(page)
  const afterA = await L.count(page)
  const wA = await L.winState(page)
  const llAny = await page.evaluate(() => window.INPUTS.filter(r => r.type === 'LL' && /Aug 4/.test(r.date)).length)
  const p1 = await L.shot(page, 'S7-phone-new-LL-for-echo')
  /* (b) a saved Echo Duty, reopened, turned to LL, Save */
  await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200)
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty'); await page.selectOption('#inpEditPerson', echoId); await L.pick(page, '2026-08-05', T)
  await page.fill('#inpEditRmk', 'S7 echo duty')
  const had = await L.ids(page); await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const echo = (await L.newest(page, had))[0]
  await L.everyone(page, T)
  await L.openSaved(page, T, echo.iid)
  await page.selectOption('#inpEditType', 'LL')
  const wB0 = await L.winState(page)
  const nB = await L.count(page)
  await L.clearToast(page); await page.locator('#inpEditSave').tap(); await page.waitForTimeout(400)
  const refusedB = await L.toast(page)
  const wB = await L.winState(page)
  const p2 = await L.shot(page, 'S7-phone-saved-duty-to-LL')
  const orig = await page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r && { cs: window.PEOPLE[r.person]?.cs, type: r.type, date: r.date } }, echo.iid)
  const nB2 = await L.count(page)
  const ranger = await page.evaluate(id => window.INPUTS.filter(r => r.person === id && r.type === 'LL').length, rangerId)
  const refusedOk = r => /yourself|only/i.test(r)
  const ok = refusedOk(refusedA) && afterA === before && llAny === 0 && refusedOk(refusedB) && nB2 === nB && orig && orig.type === 'Duty' && orig.cs === 'Echo' && ranger === 0
  await ctx.close()
  return { ok, said: `(a) new draft Echo/Duty->LL: window then showed person "${wLL.who}", words "${wLL.why.replace(/\s+/g, ' ').slice(0, 100)}"; Add said "${refusedA}", inputs ${before}->${afterA}, window open ${wA.open}, person still "${wA.who}"; (b) saved Echo duty turned to LL then Save said "${refusedB}", person in window "${wB0.who}", inputs ${nB}->${nB2}, original now ${JSON.stringify(orig)}; LLs for Ranger: ${ranger}`, pics: [p1, p2] }
})

await L.finish('docs/handpass/parts/ivet-A-part2.json')
