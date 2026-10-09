// WALKER A — scenarios 16, 17, 18, 19 (the "?" card, titles and remarks, the weekend OIL question).
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
const recOf = (page, iid) => page.evaluate(iid => { const r = window.INPUTS.find(x => x.iid === iid); return r && { t: r.type, title: r.title, d: r.date, ed: r.endDate, allday: r.allday, s: r.s, e: r.e, rmk: r.remarks, oil: r.oil || null } }, iid)

/* the help card, driven: opens, reads, scrolls to its end, and three ways to close */
async function helpRound(page, T, tag, pics) {
  const out = {}
  await page.fill('#inpEditRmk', `${tag} typed words`)
  await L.press(T, page.locator('#inTypeHelp')); await page.locator('#inTypePop').waitFor()
  const card = await page.evaluate(() => {
    const pop = document.querySelector('#inTypePop'), win = document.querySelector('[data-testid="win-inputedit"]').getBoundingClientRect(), p = pop.getBoundingClientRect()
    const kinds = [...document.querySelector('#inpEditType').options].map(o => o.value); const t = pop.textContent
    const rows = [...pop.querySelectorAll('.tylegend-r')]
    return { head: /What each type means/.test(t), groups: ['Leave', 'Medical', 'Duty'].filter(g => new RegExp(g).test(t)), kindsMissing: kinds.filter(k => !t.includes(k)), attb: /no flying — may still stand a duty/.test(t), inside: p.left >= win.left - 0.5 && p.right <= win.right + 0.5, nRows: rows.length, last: rows.length ? rows[rows.length - 1].textContent.replace(/\s+/g, ' ').slice(0, 90) : '' }
  })
  out.card = card
  if (await page.locator('#inTypePop .tylegend-r').count()) await page.locator('#inTypePop .tylegend-r').last().scrollIntoViewIfNeeded()
  out.lastReachable = await page.evaluate(() => { const rows = document.querySelectorAll('#inTypePop .tylegend-r'); const f = document.querySelector('#inpEditPop .airpop-foot'); if (!rows.length || !f) return null; const r = rows[rows.length - 1].getBoundingClientRect(), fb = f.getBoundingClientRect(); return { aboveFoot: r.bottom <= fb.top + 0.5, inView: r.top >= 0 && r.bottom <= innerHeight } })
  out.addReached = await page.evaluate(() => { const s = document.querySelector('#inpEditSave').getBoundingClientRect(); const hit = document.elementFromPoint(s.left + s.width / 2, s.top + s.height / 2); return !!hit?.closest('#inpEditSave') })
  pics.push(await L.shot(page, `S16-${tag}-card-end`))
  /* 1: the "?" again */
  await page.locator('#inTypeHelp').scrollIntoViewIfNeeded(); await L.press(T, page.locator('#inTypeHelp')); await page.waitForTimeout(200)
  out.byHelp = { card: await page.locator('#inTypePop').count(), win: await page.locator(WIN).count(), rmk: await page.inputValue('#inpEditRmk') }
  /* 2: a press elsewhere in the form */
  await L.press(T, page.locator('#inTypeHelp')); await page.locator('#inTypePop').waitFor()
  await page.locator('#inpEditRmk').scrollIntoViewIfNeeded(); await L.press(T, page.locator('#inpEditRmk')); await page.waitForTimeout(250)
  out.byPress = { card: await page.locator('#inTypePop').count(), win: await page.locator(WIN).count(), rmk: await page.inputValue('#inpEditRmk') }
  /* 3: Escape */
  await page.locator('#inTypeHelp').scrollIntoViewIfNeeded(); await L.press(T, page.locator('#inTypeHelp')); await page.locator('#inTypePop').waitFor()
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
  out.byEsc = { card: await page.locator('#inTypePop').count(), win: await page.locator(WIN).count(), rmk: await page.inputValue('#inpEditRmk') }
  pics.push(await L.shot(page, `S16-${tag}-after-escape`))
  const good = card.head && card.groups.length === 3 && !card.kindsMissing.length && card.attb && card.inside && out.lastReachable && out.lastReachable.aboveFoot && out.addReached
    && out.byHelp.card === 0 && out.byHelp.win === 1 && out.byPress.card === 0 && out.byPress.win === 1 && out.byEsc.card === 0 && out.byEsc.win === 1 && out.byEsc.rmk === `${tag} typed words`
  return { good, out }
}

/* ---------- 16: desktop, admin ---------- */
await scen(16, 'desktop 1440x900', 'admin Saber', async () => {
  const T = false
  const { ctx, page } = await L.open(L.DESK, 'ad', 'a', T)
  const pics = []
  await L.toList(page, T); await L.plus(page, T)
  const a = await helpRound(page, T, 'new', pics)
  await page.locator('#inpEditCancel').click(); await page.waitForTimeout(200)
  /* an editable saved input */
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-08-06', T); await page.fill('#inpEditRmk', 'S16 saved')
  const had = await L.ids(page); await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const made = await L.newest(page, had)
  await L.openSaved(page, T, made[0].iid)
  const b = await helpRound(page, T, 'saved', pics)
  await ctx.close()
  return { ok: a.good && b.good, said: `new input: ${JSON.stringify(a.out)}; saved input: ${JSON.stringify(b.out)}`, pics }
})

/* ---------- 17: phone, admin ---------- */
await scen(17, 'phone 390x844', 'admin Saber', async () => {
  const T = true
  const { ctx, page } = await L.open(L.PHONE, 'ad', 'a', T)
  const pics = [], res = {}
  await L.toList(page, T)
  const card = (iid) => page.evaluate(iid => { const c = document.querySelector(`[data-testid="inl-row-${iid}"]`); if (!c) return null; const g = id => c.querySelector(`[data-testid="${id}"]`)?.textContent ?? null; return { kind: g('inl-kind'), title: g('inl-title'), rmk: g('inl-rmk'), who: g('inl-who'), text: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 140) } }, iid)
  for (const [kind, date, title, rmk] of [['Event', '2026-08-14', 'A17 sports afternoon', 'Bring trainers'], ['Other', '2026-08-17', 'A17 other thing', 'Bring trainers']]) {
    await L.plus(page, T)
    await page.selectOption('#inpEditType', kind)
    const dflt = await page.inputValue('#inpEditOwnTitle')
    await L.pick(page, date, T)
    await page.fill('#inpEditOwnTitle', title); await page.fill('#inpEditRmk', rmk)
    const had = await L.ids(page); await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    const made = await L.newest(page, had)
    const rec = made[0] && await recOf(page, made[0].iid)
    const c1 = made[0] && await card(made[0].iid)
    await L.openSaved(page, T, made[0].iid)
    const w = await L.winState(page)
    pics.push(await L.shot(page, `S17-phone-${kind}-reopened`))
    await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200)
    res[kind] = { defaultTitle: dflt, saved: rec, card: c1, reopened: { type: w.type, title: w.title2, rmk: w.rmk }, iid: made[0]?.iid }
  }
  /* Event -> LL: no title box */
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Event'); await page.fill('#inpEditOwnTitle', 'A17 draft title')
  await page.selectOption('#inpEditType', 'LL')
  res.eventToLL = { titleBox: await page.locator('#inpEditOwnTitle').count() }
  pics.push(await L.shot(page, 'S17-phone-Event-to-LL'))
  await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200)
  /* clearing a commitment's title */
  await L.openSaved(page, T, res.Event.iid)
  await page.fill('#inpEditOwnTitle', '')
  await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  res.cleared = { toast: await L.toast(page), win: await page.locator(WIN).count(), saved: await recOf(page, res.Event.iid), card: await card(res.Event.iid) }
  pics.push(await L.shot(page, 'S17-phone-title-cleared'))
  const e = res.Event, o = res.Other
  const ok = e.saved.title === 'A17 sports afternoon' && e.saved.t === 'Event' && e.saved.rmk === 'Bring trainers' && e.reopened.title === 'A17 sports afternoon' && e.reopened.type === 'Event' && e.reopened.rmk === 'Bring trainers'
    && o.saved.title === 'A17 other thing' && o.saved.t === 'Other' && o.saved.rmk === 'Bring trainers' && o.reopened.title === 'A17 other thing' && o.reopened.rmk === 'Bring trainers'
    && e.card && e.card.rmk === 'Bring trainers' && !/Event/.test(e.card.rmk) && o.card && o.card.rmk === 'Bring trainers' && res.eventToLL.titleBox === 0 && !!res.cleared.card && /Event/i.test((res.cleared.card.kind || '') + (res.cleared.card.title || '')) && res.cleared.win === 0
  await ctx.close()
  return { ok, said: JSON.stringify(res), pics }
})

/* ---------- 18: desktop, member ---------- */
await scen(18, 'desktop 1440x900', 'member Ranger', async () => {
  const T = false
  const { ctx, page } = await L.open(L.DESK, 'us', 'us', T)
  const pics = []
  await L.toList(page, T); await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty'); await L.pick(page, '2026-07-18', T)
  if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').click()
  await page.fill('#inpEditStart', '06:00'); await page.fill('#inpEditEnd', '18:00'); await page.fill('#inpEditRmk', 'S18 weekend')
  const n0 = await L.count(page)
  const res = {}
  for (const round of ['first', 'retry']) {
    await page.locator('#inpEditSave').click()
    const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor({ timeout: 4000 })
    res[round] = { words: (await sheet.innerText()).replace(/\s+/g, ' ').slice(0, 260) }
    pics.push(await L.shot(page, `S18-desk-oil-question-${round}`))
    await sheet.locator('button', { hasText: /^Cancel$/ }).click(); await page.waitForTimeout(300)
    res[round].after = { n: (await L.count(page)) - n0, win: await page.locator(WIN).count(), rmk: await page.inputValue('#inpEditRmk'), type: await page.inputValue('#inpEditType'), read: (await L.winState(page)).read, sheetGone: await page.locator('[data-testid="oilconf"]').count() === 0 }
  }
  const ok = ['first', 'retry'].every(r => /Ranger/.test(res[r].words) && /18 Jul|Jul 18|Sat/i.test(res[r].words) && res[r].after.n === 0 && res[r].after.win === 1 && res[r].after.rmk === 'S18 weekend' && res[r].after.sheetGone)
  await ctx.close()
  return { ok, said: JSON.stringify(res), pics }
})

/* ---------- 19: phone, member, setting on ---------- */
await scen(19, 'phone 390x844', 'member Ranger (setting on)', async () => {
  const T = true
  const { ctx, page } = await adminPrep(L.PHONE, T, true, 'S19')
  await L.reloadAs(page, 'us', 'us')
  const pics = [], res = {}
  await L.toList(page, T)
  const oilWords = async () => (await page.locator('[data-testid="oilconf"]').innerText()).replace(/\s+/g, ' ').slice(0, 300)
  /* Yes on Sat 18, No on Sun 19, then a two-person Saturday */
  for (const [label, date, ans] of [['yes', '2026-07-18', 'yes'], ['no', '2026-07-19', 'no']]) {
    await L.plus(page, T)
    await page.selectOption('#inpEditType', 'Duty'); await L.pick(page, date, T)
    if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').tap()
    await page.fill('#inpEditStart', '06:00'); await page.fill('#inpEditEnd', '18:00'); await page.fill('#inpEditRmk', `S19 ${label}`)
    const had = await L.ids(page)
    await page.locator('#inpEditSave').tap(); await page.locator('[data-testid="oilconf"]').waitFor({ timeout: 4000 })
    const words = await oilWords(); pics.push(await L.shot(page, `S19-phone-${label}-question`))
    await L.answerOil(page, T, ans); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    const made = await L.newest(page, had)
    const rec = made[0] && await recOf(page, made[0].iid)
    await L.everyone(page, T)
    let reopened = null
    if (made[0]) {
      const cardText = await page.evaluate(iid => { const c = document.querySelector(`[data-testid="inl-row-${iid}"]`); return c ? { text: c.textContent.replace(/\s+/g, ' ').trim().slice(0, 120), oilChip: c.querySelectorAll('[data-oilrev]').length } : null }, made[0].iid)
      await L.openSaved(page, T, made[0].iid)
      const winOil = await page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputedit"] *')].filter(e => e.children.length === 0 && /\bOIL\b/i.test(e.textContent) && !/option/i.test(e.tagName)).map(e => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 80)).slice(0, 4))
      const shotName = await L.shot(page, `S19-phone-${label}-reopened`)
      reopened = { card: cardText, windowOil: winOil, shot: shotName }
      pics.push(shotName)
      await page.locator('#inpEditCancel').tap(); await page.waitForTimeout(200)
    }
    res[label] = { words, rec, reopened }
  }
  /* a two-person weekend duty: Ranger + Echo, Sat 1 Aug */
  await L.plus(page, T)
  await page.selectOption('#inpEditType', 'Duty')
  await L.press(T, page.locator(`${WIN} [data-testid="pp-several"]`)); await L.press(T, page.locator(`${WIN} [data-pp="${await L.csId(page, 'Echo')}"]`))
  await L.pick(page, '2026-08-01', T)
  if (await page.locator('#inpEditAllday').isChecked()) await page.locator('#inpEditAllday').tap()
  await page.fill('#inpEditStart', '06:00'); await page.fill('#inpEditEnd', '18:00'); await page.fill('#inpEditRmk', 'S19 two')
  const had = await L.ids(page)
  await page.locator('#inpEditSave').tap(); await page.locator('[data-testid="oilconf"]').waitFor({ timeout: 4000 })
  const sheetTxt = await oilWords()
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"] button')].map(b => (b.getAttribute('data-testid') || '') + '=' + b.textContent.trim().slice(0, 30)))
  pics.push(await L.shot(page, 'S19-phone-two-question'))
  await L.answerOil(page, T, 'yes'); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
  const made = await L.newest(page, had)
  res.two = { words: sheetTxt, buttons: opts, saved: made.map(m => ({ cs: m.cs, oil: m.oil, by: m.byCs, grp: !!m.grp })) }
  const y = res.yes.rec, n = res.no.rec
  const ok = !!y && !!n && JSON.stringify(y.oil) !== JSON.stringify(n.oil) && res.two.saved.length === 2 && res.two.saved.every(s => s.oil && Object.values(s.oil)[0] === 1) && /Ranger/.test(res.yes.words) && /18 Jul|Jul 18|Sat/i.test(res.yes.words)
  await ctx.close()
  return { ok, said: JSON.stringify(res), pics }
})

await L.finish('docs/handpass/parts/ivet-A-part5.json')
