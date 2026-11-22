// frf-w3 — walker w3: the OIL question at the sign-off (OIL F2 — his D2294, D2296, D2297, D2299), both sizes.
// Run from raptor-port/ against the served build:  TS_URL=http://localhost:4313/ ONLY=a,b SIZE=desktop node scripts/handpass/frf-w3.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import * as L from './frf-w3-lib.mjs'
console.log('frf-w3 v4', new Date().toISOString())
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const SIZE_KEYS = process.env.SIZE ? [process.env.SIZE] : ['desktop', 'phone']
const R = []
const res = (sc, sz, step, pass, note) => { R.push({ sc, size: sz.name, step, pass, note }); console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : 'NOTE'} ${sc} ${sz.name} ${step} — ${note}`) }
const LIST = '[data-testid="win-oilday"]'
const TRAIN = { type: 'Training', allday: false, s: 480, e: 1020, date: 'Jul 18', yr: 2026, remarks: '', acc: 'g' }

/* THE FIXTURE: Saturday's Training with no OIL answer. The filing window insists on an answer for an admin AND for the
   member (both walked: the Save stays disabled until Yes or No is picked), so no real door leaves a plain weekend's
   input unanswered; the record is filed through the bridge's own filing command (writeInputs), the shape the real
   window wrote in the explore run minus its `oil` answer. (F2-h makes the state through real doors: a weekday made a
   holiday, its list left for Later.) */
async function plant(p, who, iid, extra = {}) {
  await p.evaluate(([who, iid, T, extra]) => { const w = window; w.fileInput({ ...T, people: [{ p: who }], iid, ...extra }); w.afterSchedMutate() }, [who, iid, TRAIN, extra])
  return p.evaluate(who => window.PEOPLE[who].cs, who)
}
async function world(sz, n = 1) {
  const o = await L.open(sz); await L.login(o.p, 'ad')
  const ids = ['bane', await o.p.evaluate(() => Object.keys(window.PEOPLE).find(k => k !== 'bane' && window.PEOPLE[k].seat && !window.PEOPLE[k].gnd && window.PEOPLE[k].cs))]
  const cs = []
  for (let i = 0; i < n; i++) cs.push(await plant(o.p, ids[i], `w3-t${i + 1}`))
  const open = await o.p.evaluate(() => window.INPUTS.filter(r => r.date === 'Jul 18' && /^w3-/.test(r.iid)).map(r => JSON.stringify(r.oil || {})))
  if (open.length !== n || open.some(x => x !== '{}')) throw new Error('fixture did not land ' + JSON.stringify(open))
  return { ...o, cs, ids }
}
const xOf = async p => (await p.locator(`${LIST} [data-testid="win-oilday-x"]`).count()) ? `${LIST} [data-testid="win-oilday-x"]` : `${LIST} .win-x`
async function publish(p, sz, where = 'board') {
  const root = where === 'board' ? '#schedBoard' : '#eWeek'
  /* the first publish is "Publish day"; an amendment's is "Publish AL<n>" */
  const sel = (await p.locator(`${root} [data-alpub="${L.SAT_DI}"]`).count()) ? `${root} [data-alpub="${L.SAT_DI}"]` : `${root} [data-beak="${L.SAT_DI}"]`
  await p.locator(sel).first().scrollIntoViewIfNeeded().catch(() => {})
  await L.press(p, sz, sel); await p.waitForTimeout(350)
  return L.toastText(p)
}
async function lwCell(p, sz, who) {
  await L.go(p, 'leavewar'); await p.waitForTimeout(800)
  const jul = p.locator('[data-testid="month-JUL"]').first(); if (await jul.count()) { await jul.click().catch(() => {}); await p.waitForTimeout(600) }
  const cell = p.locator(`[data-testid="cell-${who}-${L.SAT}"]`).first()
  if (!(await cell.count())) return 'no cell'
  await cell.scrollIntoViewIfNeeded().catch(() => {})
  const t = (await cell.innerText()).trim()
  return (/\b(FO|HO)\b/.exec(t) || ['(blank: ' + t + ')'])[0]
}

/* amber = red high, green middling, blue low (the plain note is near-white) */
const amber = c => { const m = /rgba?\((\d+), (\d+), (\d+)/.exec(c || ''); return !!m && +m[1] > 200 && +m[2] > 120 && +m[2] < 210 && +m[3] < 120 }
const S = {}
/* F2-a — Save */
S.a = async sz => {
  const { b, p, cs, ids } = await world(sz)
  await L.openBoard(p)
  await L.pickSign(p, 'board', 'cur', 0)
  if (sz.tap) await p.screenshot({ path: path.join(L.SHOTS, `a-1-pick-tap-${sz.name}.png`) })
  await p.waitForTimeout(300)
  const h = await L.heldFacts(p), behind = await L.boxShows(p, 'board', 'cur'), sg = JSON.parse(await L.signs(p))
  await L.shot(p, sz, 'a-1-list')
  res('F2-a', sz, '1 list opens, nothing written', !!h && h.held && h.label === 'CUR CK' && behind.v === '— name —' && !sg.cur, JSON.stringify({ held: h, behind, cur: sg.cur }))
  res('F2-a', sz, '1 painted marks', h && h.border === 'dotted' && (h.after === 'none' || h.after === 'normal') && h.beside === 'waiting for your answer', `border ${h && h.border}, ::after ${h && h.after}, beside "${h && h.beside}"`)
  res('F2-a', sz, '1 foot', h && h.foot === `Later: ${h.name} signs, but nobody on it earns OIL.`, `"${h && h.foot}"`)
  await L.press(p, sz, `${LIST} [data-testid="odl-yes-w3-t1"]`); await p.waitForTimeout(200)
  await L.tapShot(p, sz, `${LIST} [data-testid="odl-save"]`, 'a-2-saved')
  const t = await L.toastText(p), up = await L.listUp(p), cur = await L.boxShows(p, 'board', 'cur'), sg2 = JSON.parse(await L.signs(p))
  res('F2-a', sz, '2 Save: note, list closes, CUR CK signed green', t && /OIL answered for 1 input/.test(t.text) && !up && cur.on && cur.v !== '— name —' && !!sg2.cur, JSON.stringify({ toast: t && t.text, up, cur, sg: sg2.cur }))
  for (const [role, nth] of [['sked', 0], ['plan', 1], ['appr', 2]]) {
    await L.pickSign(p, 'board', role, nth)
    const u = await L.listUp(p), s = JSON.parse(await L.signs(p))
    res('F2-a', sz, `3 ${role} signs at once`, !u && !!s[role], `list up ${u}, written "${s[role]}"`)
  }
  await L.shot(p, sz, 'a-3-signed')
  const pt = await publish(p, sz)
  await L.shot(p, sz, 'a-4-published')
  const ok = await p.evaluate(() => window.dayApproved(5))
  res('F2-a', sz, '4 publish note plain', ok && pt && /Saturday.*published and approved/.test(pt.text) && !/OIL/.test(pt.text) && !amber(pt.color), JSON.stringify({ approved: ok, toast: pt }))
  const c = await lwCell(p, sz, ids[0]); await L.shot(p, sz, 'a-5-leavewar')
  res('F2-a', sz, '5 Leave War FO', c === 'FO', `cell reads ${c}`)
  await L.openInpDay(p, sz, L.SAT)
  const tag = await L.cardOilTag(p, 'w3-t1'); await L.shot(p, sz, 'a-6-inputs-card')
  res('F2-a', sz, '6 card has no OIL? tag', tag === false, `tag ${tag}`)
  await L.done(b)
}
/* F2-b — Later */
S.b = async sz => {
  const { b, p, cs, ids } = await world(sz)
  await L.openBoard(p)
  await L.pickSign(p, 'board', 'plan', 1)
  const h = await L.heldFacts(p); await L.shot(p, sz, 'b-1-list')
  res('F2-b', sz, '1 list opens for PLANNED BY', h && h.held && h.label === 'PLANNED BY', JSON.stringify(h))
  await L.tapShot(p, sz, `${LIST} [data-testid="odl-later"]`, 'b-2-later')
  const sg = JSON.parse(await L.signs(p)), up = await L.listUp(p), ans = await p.evaluate(() => JSON.stringify(window.INPUTS.find(r => r.iid === 'w3-t1').oil || {}))
  res('F2-b', sz, '2 Later: name signed, no answer', !!sg.plan && !up && ans === '{}', JSON.stringify({ plan: sg.plan, up, oil: ans }))
  for (const [role, nth] of [['cur', 0], ['sked', 0], ['appr', 2]]) {
    await L.pickSign(p, 'board', role, nth)
    const u = await L.listUp(p), s = JSON.parse(await L.signs(p))
    res('F2-b', sz, `3 ${role} signs with no list`, !u && !!s[role], `list up ${u}, written "${s[role]}"`)
  }
  const pt = await publish(p, sz); await L.shot(p, sz, 'b-4-published')
  const want = `Saturday 18 Jul published and approved. ${cs[0]}’s Training has no OIL answer, so nobody on it earns OIL.`
  res('F2-b', sz, '4 publish note names the input (amber)', pt && pt.text.trim() === want && amber(pt.color), JSON.stringify({ got: pt, want }))
  const c = await lwCell(p, sz, ids[0]); await L.shot(p, sz, 'b-5-leavewar')
  res('F2-b', sz, '5 no FO/HO on the Leave War', !/^(FO|HO)$/.test(c), `cell reads ${c}`)
  await L.openInpDay(p, sz, L.SAT)
  const tag = await L.cardOilTag(p, 'w3-t1'); await L.shot(p, sz, 'b-6-inputs-card')
  res('F2-b', sz, '6 card still wears OIL?', tag === true, `tag ${tag}`)
  await L.done(b)
}
/* F2-c — ✕ and Escape */
S.c = async sz => {
  const { b, p } = await world(sz)
  await L.openBoard(p)
  await L.pickSign(p, 'board', 'cur', 0)
  res('F2-c', sz, '1 list up', await L.listUp(p), '')
  await L.tapShot(p, sz, await xOf(p), 'c-1-closed-x')
  let sg = JSON.parse(await L.signs(p)), bx = await L.boxShows(p, 'board', 'cur')
  res('F2-c', sz, '1 ✕ signs nothing', !(await L.listUp(p)) && !sg.cur && bx.v === '— name —', JSON.stringify({ sg, bx }))
  await L.pickSign(p, 'board', 'sked', 0)
  let h = await L.heldFacts(p); await L.shot(p, sz, 'c-2-asks-again')
  res('F2-c', sz, '2 next box asks again, holding SKED CK', h && h.held && h.label === 'SKED CK' && !!h.name, JSON.stringify(h))
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); await L.shot(p, sz, 'c-3-escaped')
  sg = JSON.parse(await L.signs(p)); bx = await L.boxShows(p, 'board', 'sked')
  res('F2-c', sz, '3 Escape signs nothing', !(await L.listUp(p)) && !sg.sked && bx.v === '— name —', JSON.stringify({ sg, bx }))
  await L.pickSign(p, 'board', 'appr', 2)
  h = await L.heldFacts(p); await L.shot(p, sz, 'c-4-asks-third')
  res('F2-c', sz, '4 asks again after Escape (APPROVED BY)', h && h.held && h.label === 'APPROVED BY', JSON.stringify(h))
  await L.done(b)
}
/* F2-d — every door: four boxes × board / Edit Schedule's week; Clear; the empty option */
S.d = async sz => {
  const LBL = { cur: 'CUR CK', sked: 'SKED CK', plan: 'PLANNED BY', appr: 'APPROVED BY' }
  for (const where of ['board', 'week']) {
    const { b, p } = await world(sz)
    if (where === 'board') await L.openBoard(p); else { await L.go(p, 'editsched'); await p.waitForTimeout(400) }
    for (const role of ['cur', 'sked', 'plan', 'appr']) {
      const v = await L.pickSign(p, where, role, role === 'plan' ? 1 : role === 'appr' ? 2 : 0)
      const h = await L.heldFacts(p), sg = JSON.parse(await L.signs(p))
      await L.shot(p, sz, `d-${where}-${role}`)
      res('F2-d', sz, `${where} ${role} first press`, h && h.held && h.label === LBL[role] && !sg[role] && h.border === 'dotted', JSON.stringify({ label: h && h.label, name: h && h.name, border: h && h.border, written: sg[role] }))
      await p.keyboard.press('Escape'); await p.waitForTimeout(300)
    }
    /* Clear and the empty option: sign two by Later first, then clear */
    await L.pickSign(p, where, 'cur', 0); await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(300)
    await L.pickSign(p, where, 'sked', 0)
    const before = JSON.parse(await L.signs(p))
    await p.locator(where === 'board' ? `#schedBoard [data-signclear="${L.SAT_DI}"]` : `#eWeek [data-signclear="${L.SAT_DI}"]`).first().scrollIntoViewIfNeeded().catch(() => {})
    await L.press(p, sz, where === 'board' ? `#schedBoard [data-signclear="${L.SAT_DI}"]` : `#eWeek [data-signclear="${L.SAT_DI}"]`); await p.waitForTimeout(400)
    const after = JSON.parse(await L.signs(p)); await L.shot(p, sz, `d-${where}-clear`)
    res('F2-d', sz, `${where} Clear: no list, names cleared`, !!before.cur && !!before.sked && !after.cur && !after.sked && !(await L.listUp(p)), JSON.stringify({ before, after }))
    /* the empty option, after a new input re-arms the question (Later's memory covers only the first) */
    await L.pickSign(p, where, 'cur', 0)
    const pre = JSON.parse(await L.signs(p)).cur
    const s = p.locator(L.signSel(where, 'cur')).first(); await s.selectOption(''); await p.waitForTimeout(350)
    const post = JSON.parse(await L.signs(p)).cur
    res('F2-d', sz, `${where} empty "— name —" option: no list, name cleared`, !!pre && !post && !(await L.listUp(p)), JSON.stringify({ pre, post }))
    await L.done(b)
  }
}

/* F2-e — two unanswered inputs */
S.e = async sz => {
  const { b, p, cs } = await world(sz, 2)
  await L.openBoard(p)
  await L.pickSign(p, 'board', 'cur', 0)
  let h = await L.heldFacts(p); await L.shot(p, sz, 'e-1-two')
  res('F2-e', sz, '1 two listed, foot says "them"', h && h.count === '2 to answer' && h.foot === `Later: ${h.name} signs, but nobody on them earns OIL.`, JSON.stringify({ count: h && h.count, foot: h && h.foot }))
  await L.press(p, sz, `${LIST} [data-testid="odl-yes-w3-t1"]`); await p.waitForTimeout(200)
  await L.press(p, sz, `${LIST} [data-testid="odl-save"]`); await p.waitForTimeout(400)
  let sg = JSON.parse(await L.signs(p)); const t = await L.toastText(p); await L.shot(p, sz, 'e-2-saved-one')
  res('F2-e', sz, '2 one answered, Save: name signed', !!sg.cur && !(await L.listUp(p)), JSON.stringify({ sg, toast: t && t.text }))
  /* CHANGED 22 Nov 26 (chat 139): the fresh Opus read's finding 1, fixed at 5c44b1342 — what a Save leaves unpicked is
     left as Later leaves it (oilsign.ts leaveOpen), so the next box no longer asks: it signs at once, and the publish
     note names the one left. Before that fix this step expected the list to ask again for the one left. */
  await L.pickSign(p, 'board', 'sked', 0)
  await L.shot(p, sz, 'e-3-next-signs-at-once')
  res('F2-e', sz, '3 next box signs at once (the unpicked was left as Later)', !(await L.listUp(p)) && !!JSON.parse(await L.signs(p)).sked, await L.signs(p))
  for (const [role, nth] of [['plan', 1], ['appr', 2]]) {
    await L.pickSign(p, 'board', role, nth)
    res('F2-e', sz, `4 ${role} signs at once`, !(await L.listUp(p)) && !!JSON.parse(await L.signs(p))[role], '')
  }
  const pt = await publish(p, sz); await L.shot(p, sz, 'e-5-published')
  res('F2-e', sz, '5 publish note names only the one left', pt && pt.text.includes(`${cs[1]}’s Training has no OIL answer`) && !pt.text.includes(`${cs[0]}’s`), JSON.stringify(pt))
  await L.done(b)
}
/* F2-f — the page behind and the other doors */
S.f = async sz => {
  { // behind the held list
    const { b, p } = await world(sz)
    await L.openBoard(p)
    await L.pickSign(p, 'board', 'cur', 0)
    /* another window: History */
    await L.press(p, sz, '#sbHist'); await p.waitForTimeout(500)
    let h = await L.heldFacts(p); await L.shot(p, sz, 'f-1-history-open')
    res('F2-f', sz, '1 History opened behind: list and hold stay', !!h && h.held, JSON.stringify({ held: h && h.held, name: h && h.name }))
    await L.press(p, sz, '#sbHist'); await p.waitForTimeout(300)
    /* change day on the board */
    if (await p.locator('#sbPrevDay').isVisible()) await L.press(p, sz, '#sbPrevDay'); else await L.press(p, sz, '[data-sbtab="4"]')
    await p.waitForTimeout(600)
    h = await L.heldFacts(p); const day = await p.evaluate(() => (document.getElementById('sbDay') || {}).textContent)
    await L.shot(p, sz, 'f-2-day-changed')
    res('F2-f', sz, '2 day changed with the list up', null, JSON.stringify({ boardDay: day, listUp: await L.listUp(p), held: h && h.held, title: h && h.title }))
    if (await L.listUp(p)) {
      await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(400)
      const sg = JSON.parse(await L.signs(p)); await L.shot(p, sz, 'f-3-later-from-friday')
      res('F2-f', sz, '3 Later pressed while the board shows Friday', null, `Saturday's signs now ${JSON.stringify(sg)}; Friday's ${await L.signs(p, 4)}`)
    }
    await L.done(b)
  }
  { // change week with the list up
    const { b, p } = await world(sz)
    await L.openBoard(p)
    await L.pickSign(p, 'board', 'sked', 0)
    const wk = p.locator('[data-sbweek="1"]').filter({ visible: true })
    if (await wk.count()) await wk.first().click(); else { await L.press(p, sz, '#sbNextDay'); await p.waitForTimeout(500); await L.press(p, sz, '#sbNextDay') }
    await p.waitForTimeout(800)
    const h = await L.heldFacts(p), date = await p.evaluate(() => (document.getElementById('sbDate') || {}).textContent)
    await L.shot(p, sz, 'f-4-week-changed')
    res('F2-f', sz, '4 week changed with the list up', null, JSON.stringify({ boardDate: date, listUp: await L.listUp(p), held: h && h.held, title: h && h.title, rows: h && h.count }))
    if (await L.listUp(p)) {
      const later = p.locator(`${LIST} [data-testid="odl-later"]`)
      if (await later.count()) { await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(400) }
      else if (await p.locator(`${LIST} [data-testid="odl-close"]`).count()) { await L.press(p, sz, `${LIST} [data-testid="odl-close"]`); await p.waitForTimeout(400) }
      const s = await p.evaluate(() => ({ di5: JSON.stringify(window.signOf(5)), day: (document.getElementById('sbDate') || {}).textContent }))
      await L.shot(p, sz, 'f-5-later-other-week')
      res('F2-f', sz, '5 Later/Close in the other week: written where?', null, JSON.stringify(s))
    }
    await L.done(b)
  }
  { // the input's card inside the list, answered in its own window, then back
    const { b, p } = await world(sz)
    await L.openBoard(p)
    await L.pickSign(p, 'board', 'cur', 0)
    await L.press(p, sz, `${LIST} [data-testid="odl-w3-t1"], ${LIST} .icard`); await p.waitForTimeout(800)
    const page = await p.evaluate(() => window.CURPAGE), inpWin = await p.locator('#inpEditPop').isVisible().catch(() => false)
    await L.shot(p, sz, 'f-6-card-opened')
    res('F2-f', sz, '6 card opens the input\'s own window on Inputs', page === 'inputs' && inpWin, JSON.stringify({ page, inpWin, listUp: await L.listUp(p) }))
    const ans = p.locator('#inpEditPop button', { hasText: /Answer|Change/ })
    if (await ans.count()) {
      await ans.first().click(); await p.waitForTimeout(300)
      await L.press(p, sz, '[data-testid="oil-yes"]'); await L.press(p, sz, '[data-testid="oilconf-save"]'); await p.waitForTimeout(300)
      if (await p.locator('#inpEditSave').isVisible().catch(() => false)) { await L.press(p, sz, '#inpEditSave'); await p.waitForTimeout(400) }
      const oil = await p.evaluate(() => JSON.stringify(window.INPUTS.find(r => r.iid === 'w3-t1').oil || {}))
      const h = await L.heldFacts(p); await L.shot(p, sz, 'f-7-answered-there')
      res('F2-f', sz, '7 answered in its window; the list now', null, JSON.stringify({ oil, listUp: await L.listUp(p), held: h && h.held, count: h && h.count, foot: h && h.foot }))
      await L.openBoard(p); await p.waitForTimeout(300)
      const h2 = await L.heldFacts(p); await L.shot(p, sz, 'f-8-back-on-board')
      const close = p.locator(`${LIST} [data-testid="odl-close"]`)
      let after = null
      if (await close.count()) { await L.press(p, sz, `${LIST} [data-testid="odl-close"]`); await p.waitForTimeout(300); after = await L.signs(p) }
      res('F2-f', sz, '8 back: held box hidden, Close signs nothing', h2 ? (!h2.held && after && !JSON.parse(after).cur) : null, JSON.stringify({ h2, after }))
      await L.pickSign(p, 'board', 'cur', 0)
      res('F2-f', sz, '9 now answered: the box signs at once', !(await L.listUp(p)) && !!JSON.parse(await L.signs(p)).cur, await L.signs(p))
    } else res('F2-f', sz, '7 no Answer… button in the input window', null, await p.evaluate(() => [...document.querySelectorAll('#inpEditPop button')].map(b => b.textContent).join(' | ')))
    await L.done(b)
  }
  { // a published version loaded back: the list opens with no held box
    const { b, p } = await world(sz)
    await L.openBoard(p)
    await L.pickSign(p, 'board', 'cur', 0); await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(300)
    for (const [r, n] of [['sked', 0], ['plan', 1], ['appr', 2]]) await L.pickSign(p, 'board', r, n)
    await publish(p, sz)
    const ri = await p.evaluate(() => window.DAYS[5].ground.findIndex(g => String(g.src) === 'w3-t1'))
    await L.press(p, sz, `#schedBoard [data-grdel="5.${ri}"]`); await p.waitForTimeout(400)
    await L.press(p, sz, '#schedBoard [data-planmenu="5"]'); await p.waitForTimeout(300)
    const pv = p.locator('[data-planpv]').filter({ visible: true }).first(), ver = await pv.getAttribute('data-planpv'); await pv.click(); await p.waitForTimeout(400)
    const load = `#schedBoard button[data-restore="5"][data-rver="${ver}"]`
    await L.press(p, sz, load); await p.waitForTimeout(300); if (await p.locator(load).count()) { await L.press(p, sz, load); await p.waitForTimeout(400) }
    const h = await L.heldFacts(p); await L.shot(p, sz, 'f-9-loaded-back')
    res('F2-f', sz, '10 version loaded back: list opens, no held box', !!h && !h.held, JSON.stringify(h))
    await L.done(b)
  }
}
/* F2-g — a published day, a second unanswered input after it, signing for the amendment */
S.g = async sz => {
  const { b, p, cs, ids } = await world(sz)
  await L.openBoard(p)
  await L.pickSign(p, 'board', 'cur', 0); await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(300)
  for (const [r, n] of [['sked', 0], ['plan', 1], ['appr', 2]]) await L.pickSign(p, 'board', r, n)
  const p1 = await publish(p, sz)
  res('F2-g', sz, '1 published with Later', await p.evaluate(() => window.dayApproved(5)), JSON.stringify(p1 && p1.text))
  const cs2 = await plant(p, ids[1], 'w3-t2'); await p.waitForTimeout(500)
  const miss = await p.evaluate(() => window.signMissing(5)); await L.shot(p, sz, 'g-2-pending')
  res('F2-g', sz, '2 second input: day pending, sign-offs fall', miss.length === 4, JSON.stringify(miss))
  await L.pickSign(p, 'board', 'cur', 0)
  const h = await L.heldFacts(p); await L.shot(p, sz, 'g-3-asks-again')
  const rows = await p.evaluate(() => [...document.querySelectorAll('[data-testid="win-oilday"] [data-testid^="odl-yes-"]')].map(x => x.getAttribute('data-testid')))
  res('F2-g', sz, '3 first press asks once more', !!h && h.held, JSON.stringify({ count: h && h.count, rows, foot: h && h.foot }))
  if (h) { await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(300) }
  for (const [r, n] of [['sked', 0], ['plan', 1], ['appr', 2]]) {
    await L.pickSign(p, 'board', r, n)
    res('F2-g', sz, `4 ${r} signs at once`, !(await L.listUp(p)), JSON.parse(await L.signs(p))[r])
  }
  const p2 = await publish(p, sz); await L.shot(p, sz, 'g-5-amendment')
  res('F2-g', sz, '5 amendment note keeps its OIL sentence', p2 && /has no OIL answer|have no OIL answer/.test(p2.text) && amber(p2.color), JSON.stringify(p2))
  await L.done(b)
}
/* F2-h — a public holiday made through the Inputs gear (all real doors), the bell's line, and Undo / Redo */
S.h = async sz => {
  const FRI = '2026-07-17', FRI_DI = 4
  const { b, p } = await L.open(sz); await L.login(p, 'ad')
  const f = await L.fileInput(p, sz, FRI, { type: 'Training', person: 'bane', from: '08:00', to: '17:00' })
  await L.closeInpDay(p)
  res('F2-h', sz, '0 a weekday Training filed, not asked', !f.asked && !!f.iid, JSON.stringify(f))
  await L.go(p, 'inputs')
  await L.press(p, sz, '#inGear'); await L.press(p, sz, '[data-testid="iset-days"]')
  if (await p.locator('[data-testid="days-tab-holidays"]').count()) await L.press(p, sz, '[data-testid="days-tab-holidays"]')
  await L.press(p, sz, '[data-testid="hol-add"]'); await L.press(p, sz, '[data-testid="hol-kind-ph"]')
  await p.fill('[data-testid="hol-name"]', 'National Day')
  for (let i = 0; i < 14 && !(await p.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await L.press(p, sz, '[data-testid="holcal-prev"]')
  for (let i = 0; i < 40 && !(await p.locator(`[data-testid="holcal-day-${FRI}"]`).count()); i++) await L.press(p, sz, '[data-testid="holcal-next"]')
  await L.press(p, sz, `[data-testid="holcal-day-${FRI}"]`); await L.press(p, sz, '[data-testid="hol-save"]'); await p.waitForTimeout(600)
  let h = await L.heldFacts(p); await L.shot(p, sz, 'h-1-holiday-list')
  res('F2-h', sz, '1 holiday saved: list opens by itself, no held box', !!h && !h.held, JSON.stringify(h))
  await L.press(p, sz, `${LIST} [data-testid="odl-later"]`); await p.waitForTimeout(300)
  await p.locator('[data-testid="win-inputsset-x"]').evaluate(e => e.click()).catch(() => {})
  await p.locator('[data-testid="win-days"] .win-x').evaluate(e => e.click()).catch(() => {})
  await p.locator('.bellbtn:visible').first().click(); await p.waitForTimeout(300)
  const line = p.locator('[data-testid="bell-list"] .bl-line').first()
  if (await line.count()) {
    await line.click(); await p.waitForTimeout(500)
    h = await L.heldFacts(p); await L.shot(p, sz, 'h-2-bell-list')
    res('F2-h', sz, '2 the bell\'s line opens the list, no held box', !!h && !h.held, JSON.stringify(h))
    if (h) { await p.keyboard.press('Escape'); await p.waitForTimeout(300) }
  } else res('F2-h', sz, '2 bell line', null, 'no bell line to open')
  await L.openBoard(p, FRI_DI)
  await L.pickSign(p, 'board', 'cur', 0, FRI_DI)
  h = await L.heldFacts(p); await L.shot(p, sz, 'h-3-sign-on-holiday')
  res('F2-h', sz, '3 sign-off on the holiday asks, subtitle names the holiday', !!h && h.held && /National Day/.test(h.sub || h.title), JSON.stringify(h))
  await L.press(p, sz, `${LIST} [data-testid="odl-yes-${f.iid}"]`); await L.press(p, sz, `${LIST} [data-testid="odl-save"]`); await p.waitForTimeout(400)
  const st = async () => p.evaluate(([iid, di]) => ({ cur: window.signOf(di).cur, oil: JSON.stringify(window.INPUTS.find(r => r.iid === iid).oil || {}) }), [f.iid, FRI_DI])
  const s0 = await st()
  res('F2-h', sz, '4 Save: answered and signed', !!s0.cur && s0.oil !== '{}', JSON.stringify(s0))
  const seq = []
  for (const btn of ['#sbUndo', '#sbUndo', '#sbRedo', '#sbRedo']) {
    await L.press(p, sz, btn); await p.waitForTimeout(400)
    seq.push({ btn, ...(await st()), toast: ((await L.toastText(p)) || {}).text, listUp: await L.listUp(p) })
  }
  await L.shot(p, sz, 'h-5-after-redo')
  res('F2-h', sz, '5 Undo: name first, then the answers; Redo back', !seq[0].cur && seq[0].oil !== '{}' && !seq[1].cur && seq[1].oil === '{}' && seq[3].cur && seq[3].oil !== '{}', JSON.stringify(seq))
  await L.done(b)
}
/* F2-i — the board's bar and the phone's middle */
S.i = async sz => {
  const { b, p } = await world(sz)
  await L.openBoard(p)
  await L.pickSign(p, 'board', 'cur', 0)
  await p.waitForTimeout(400)
  const g = await p.evaluate(() => {
    const w = document.querySelector('[data-testid="win-oilday"]').getBoundingClientRect(), bar = document.querySelector('#schedBoard .sb-top').getBoundingClientRect()
    const on = id => { const e = document.getElementById(id); if (!e) return 'absent'; const r = e.getBoundingClientRect(); if (!r.width) return 'hidden'; const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e === hit || e.contains(hit) }
    const btn = t => { const e = document.querySelector(`[data-testid="win-oilday"] [data-testid="${t}"]`).getBoundingClientRect(); return { top: e.top, bottom: e.bottom } }
    const vv = window.visualViewport ? { h: visualViewport.height, top: visualViewport.offsetTop } : null
    return { win: { top: w.top, bottom: w.bottom, left: w.left, right: w.right, h: w.height }, barBottom: bar.bottom, ih: innerHeight, iw: innerWidth, vv, done: on('sbDone'), bell: on('sbBell'), later: btn('odl-later'), save: btn('odl-save') }
  })
  await L.shot(p, sz, 'i-1-geometry')
  res('F2-i', sz, '1 list below the board\'s bar; Done and bell pressable', g.win.top >= g.barBottom - 0.5 && g.done === true && g.bell === true, JSON.stringify(g))
  const inScreen = g.save.bottom <= g.ih + 0.5 && g.later.bottom <= g.ih + 0.5 && g.win.top >= 0
  if (sz.tap) {
    const mid = Math.abs((g.win.top + g.win.bottom) / 2 - (g.barBottom + g.ih) / 2), midScreen = Math.abs((g.win.top + g.win.bottom) / 2 - g.ih / 2)
    res('F2-i', sz, '2 phone: in the middle, no taller than the screen less 24px, Save/Later in sight', inScreen && g.win.h <= g.ih - 24 + 0.5, JSON.stringify({ h: g.win.h, max: g.ih - 24, offMidScreen: midScreen.toFixed(1), offMidBelowBar: mid.toFixed(1), inScreen }))
  } else res('F2-i', sz, '2 desktop: Save/Later in sight', inScreen, '')
  await L.done(b)
}

for (const k of SIZE_KEYS) {
  const sz = L.SIZES[k]
  for (const [name, fn] of Object.entries(S)) {
    if (ONLY.length && !ONLY.includes(name)) continue
    try { await fn(sz) } catch (e) { res('F2-' + name, sz, 'NOT WALKED', null, String(e && e.message || e).slice(0, 300)) }
  }
}
writeFileSync(path.join(L.SHOTS, `results-${ONLY.join('') || 'all'}-${SIZE_KEYS.join('')}.json`), JSON.stringify({ R, errs: L.errs }, null, 1))
console.log('errors seen:', L.errs.length ? L.errs.join('\n') : 'none')
