// WALKER A — scenarios 1, 2, 3, 4 (design vet walk, 10 Oct 26). Each in its own fresh world.
import * as L from './ivet-A-lib.mjs'
const { WIN, press } = L
async function scen(n, size, role, fn) {
  try { const r = await fn(); L.record(n, size, role, r.ok ? 'PASS' : 'FAIL', r.said, r.pics || []) }
  catch (e) { L.record(n, size, role, 'ERROR', 'script stopped: ' + String(e.message || e).split('\n').slice(0, 4).join(' ⏎ '), []) }
}

/* 1 — phone, admin */
await scen(1, 'phone 390x844', 'admin Saber', async () => {
  const { ctx, page } = await L.open(L.PHONE, 'ad', 'a', true)
  const T = true
  await L.toList(page, T, false)
  const pre = await page.evaluate(() => {
    const add = document.querySelector('#inNew'), range = document.querySelector('#inRangeBtn')
    const a = add.getBoundingClientRect(), r = range.getBoundingClientRect()
    const row = add.parentElement
    const kids = [...row.children].map(c => c.id || c.className)
    return { nNew: document.querySelectorAll('#inNew').length, word: add.textContent.trim(), filled: getComputedStyle(add).backgroundColor, leftOfDates: a.right <= r.left + 1 || a.bottom <= r.top + 1, first: row.firstElementChild === add || kids.indexOf('inNew') <= kids.indexOf('inRangeBtn'), kids,
      form: document.querySelectorAll('.inbar, .ingrid, #inAdd, #inRemarks').length }
  })
  const p1 = await L.shot(page, 'S1-phone-list')
  await L.plus(page, T)
  const w = await L.winState(page)
  const picked = await page.locator('#inpEdCal .rc-d.s, #inpEdCal .rc-d.e').count()
  const p2 = await L.shot(page, 'S1-phone-window')
  const ok = pre.nNew === 1 && pre.word === '+ Input' && pre.leftOfDates && pre.form === 0 && w.read === 'pick a start date' && w.who === 'Saber' && w.type === 'Training' && w.saveWord === 'Add' && w.hints === 0 && picked === 0
  await ctx.close()
  return { ok, said: `list tools row ${JSON.stringify(pre)}; window: ${JSON.stringify({ read: w.read, who: w.who, type: w.type, save: w.saveWord, hints: w.hints, picked })}. (Astra's text says the fresh kind is Duty; the ruling list in the brief says Training — Training is what the screen shows.)`, pics: [p1, p2] }
})

/* 2 — desktop, member */
await scen(2, 'desktop 1440x900', 'member Ranger', async () => {
  const { ctx, page } = await L.open(L.DESK, 'us', 'us', false)
  const T = false
  await L.toList(page, T); await L.plus(page, T)
  const groups = await page.evaluate(() => [...document.querySelectorAll('#inpEditType optgroup')].map(g => g.label + ': ' + [...g.querySelectorAll('option')].map(o => o.value).join(',')))
  const noSans = await page.evaluate(() => ![...document.querySelectorAll('#inpEditType option')].some(o => /sans|avail/i.test(o.value + o.textContent)))
  const view = async (t) => {
    await page.selectOption('#inpEditType', t); await page.waitForTimeout(150)
    return page.evaluate(() => { const q = s => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0 }
      return { span: q('#inpEditSpan'), title: q('#inpEditOwnTitle'), allday: q('#inpEditAllday'), start: q('#inpEditStart'), doc: /Document/.test(document.querySelector('#inpEditPop .inped-body').innerText), person: document.querySelector('#inpEditPerson') ? 'list' : (document.querySelector('#inpEditPersonFixed')?.textContent || '?') } })
  }
  const v = {}
  v.LL = await view('LL'); const p1 = await L.shot(page, 'S2-desk-LL')
  v.ATTC = await view('ATT C'); const p2 = await L.shot(page, 'S2-desk-ATTC')
  v.Duty = await view('Duty'); const p3 = await L.shot(page, 'S2-desk-Duty')
  /* switching: LL -> AM -> Duty keeps no half-day; ATT C -> Meeting asks for no document */
  await page.selectOption('#inpEditType', 'LL'); await L.pick(page, '2026-07-27', T)
  await page.locator('#inpEditSpan [data-span="am"]').click()
  await page.selectOption('#inpEditType', 'Duty')
  const afterAm = await L.winState(page)
  const p4 = await L.shot(page, 'S2-desk-AM-then-Duty')
  const had = await L.ids(page)
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(500)
  const madeA = await L.newest(page, had)
  const oilA = await page.locator('[data-testid="oilconf"]').count()
  await plus2()
  async function plus2() { if (await page.locator(WIN).count()) { await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200) } }
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'ATT C'); await L.pick(page, '2026-07-28', T)
  await page.selectOption('#inpEditType', 'Meeting')
  const docRow = await page.evaluate(() => /Document/.test(document.querySelector('#inpEditPop .inped-body').innerText))
  const had2 = await L.ids(page)
  await page.locator('#inpEditSave').click(); await page.waitForTimeout(500)
  const docQ = await page.locator('[data-testid="docconf"]').count()
  const madeB = await L.newest(page, had2)
  const p5 = await L.shot(page, 'S2-desk-ATTC-then-Meeting')
  const ok = groups.length === 3 && /^Leave/.test(groups[0]) && /^Medical/.test(groups[1]) && /^Duty & other/.test(groups[2]) && noSans
    && v.LL.span && !v.LL.title && !v.LL.doc && v.ATTC.span && v.ATTC.doc && !v.ATTC.title && v.Duty.title && v.Duty.start && !v.Duty.span && !v.Duty.doc
    && !afterAm.help === false && afterAm.span === null && madeA.length === 1 && madeA[0].type === 'Duty' && !madeA[0].half && !docRow && docQ === 0 && madeB.length === 1 && madeB[0].type === 'Meeting' && madeB[0].docs === 0
  await ctx.close()
  return { ok, said: `groups ${JSON.stringify(groups)}; no SANS kind: ${noSans}; controls ${JSON.stringify(v)}; AM draft switched to Duty: span control ${afterAm.span}, hours ${afterAm.start}-${afterAm.end}, saved ${JSON.stringify(madeA.map(m => ({ t: m.type, half: m.half, allday: m.allday, s: m.s, e: m.e })))} oil question ${oilA}; ATT C switched to Meeting: document row ${docRow}, document question ${docQ}, saved ${JSON.stringify(madeB.map(m => ({ t: m.type, docs: m.docs })))}`, pics: [p1, p2, p3, p4, p5] }
})

/* 3 — phone, member */
await scen(3, 'phone 390x844', 'member Ranger', async () => {
  const { ctx, page } = await L.open(L.PHONE, 'us', 'us', true)
  const T = true
  await L.toList(page, T); await L.plus(page, T)
  const had = await L.ids(page)
  await page.selectOption('#inpEditType', 'Meeting')
  await L.pick(page, '2026-07-27', T)
  if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').tap()
  await page.fill('#inpEditStart', '10:00'); await page.fill('#inpEditEnd', '11:00')
  await page.fill('#inpEditOwnTitle', 'A3 briefing'); await page.fill('#inpEditRmk', 'Bring ID')
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden' })
  const made = await L.newest(page, had)
  const row = made[0] && await L.rowOf(page, made[0].iid)
  const p1 = await L.shot(page, 'S3-phone-saved-lit')
  await page.waitForTimeout(7000)
  const p1b = await L.shot(page, 'S3-phone-saved-settled')
  const lateLit = made[0] && (await L.rowOf(page, made[0].iid))?.lit
  await L.openSaved(page, T, made[0].iid)
  const w = await L.winState(page)
  const p2 = await L.shot(page, 'S3-phone-reopened')
  const ok = made.length === 1 && made[0].cs === 'Ranger' && made[0].type === 'Meeting' && made[0].title === 'A3 briefing' && made[0].remarks === 'Bring ID' && made[0].date === 'Jul 27' && made[0].s === 600 && made[0].e === 660 && !!row && row.lit && row.onScreen
    && w.who === 'Ranger' && w.type === 'Meeting' && w.title2 === 'A3 briefing' && w.rmk === 'Bring ID' && w.start === '10:00' && w.end === '11:00' && w.read === 'Jul 27'
  await ctx.close()
  return { ok, said: `saved ${JSON.stringify(made.map(m => ({ cs: m.cs, t: m.type, title: m.title, rmk: m.remarks, d: m.date, s: m.s, e: m.e })))}; card right after save ${JSON.stringify(row)}; lit six seconds later: ${lateLit}; reopened window ${JSON.stringify({ who: w.who, type: w.type, title: w.title2, rmk: w.rmk, start: w.start, end: w.end, read: w.read })}`, pics: [p1, p1b, p2] }
})

/* 4 — desktop, admin */
await scen(4, 'desktop 1440x900', 'admin Saber', async () => {
  const { ctx, page } = await L.open(L.DESK, 'ad', 'a', false)
  const T = false
  await L.toList(page, T); await L.plus(page, T)
  const before = await L.count(page)
  const out = []
  const pics = []
  const cases = [['Duty', 'stiff', 'duty words'], ['ATT C', 'stiff', 'attc words'], ['Upchit', 'stiff', 'upchit words'], ['Duty', 'allavail', 'allavail words']]
  for (const [t, who, words] of cases) {
    await page.selectOption('#inpEditType', t); await page.selectOption('#inpEditPerson', who)
    await page.fill('#inpEditRmk', words)
    await L.clearToast(page)
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(350)
    const toastTxt = await L.toast(page)
    const q = await page.locator('[data-testid="oilconf"], [data-testid="docconf"], [data-testid="upconf"], [data-testid="medclash"]').count()
    const w = await L.winState(page)
    out.push({ t, who: w.whoValue, type: w.type, rmk: w.rmk, toast: toastTxt, questions: q, open: w.open })
    pics.push(await L.shot(page, `S4-desk-${t.replace(' ', '')}-${who}`))
  }
  const after = await L.count(page)
  const ok = after === before && out.every(o => /^Pick a start date on the calendar first\.?$/.test(o.toast) && o.questions === 0 && o.open && o.type === o.t && /words/.test(o.rmk || '')) && out[3].who === 'allavail'
  await ctx.close()
  return { ok, said: `nothing saved: ${after === before} (${before}->${after}); ${JSON.stringify(out)}`, pics }
})

await L.finish('docs/handpass/parts/ivet-A-part1.json')
