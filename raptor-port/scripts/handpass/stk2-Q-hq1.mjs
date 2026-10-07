/* H-Q1 — a second formation's Remarks box while the first formation's question is open (re-walk, walker Q).
   SURF = week (Edit Schedule, Tue 14 Jul, desktop) | board (Scheduler Board, Wed 15 Jul, desktop) | phone (week, 390x844, Tue 14 Jul)
   Controls only; window.* reads state. */
import * as C from './stk2-Q-lib.mjs'
const { L, W } = C
const J = x => JSON.stringify(x)
const SURF = process.env.SURF || 'week'
const DI = SURF === 'board' ? 2 : (process.env.DI ? +process.env.DI : 1)
const w = await C.world({ phone: SURF === 'phone' }); const p = w.p
const ROOT = SURF === 'board' ? '#schedBoard' : '#eWeek'
const ATTR = SURF === 'board' ? 'data-bfld' : 'data-txt'
const pics = [], checks = [], log = []
const tag = SURF
const empty = async () => {
  /* click on a spot of empty page: the first spot on a grid whose element is not a control, a text box, a puck or a question */
  const pt = await p.evaluate(() => {
    const bad = 'input,textarea,select,button,a,[contenteditable],[data-role-ui],[data-txt],[data-bfld],[data-slot],.puck,[draggable="true"],label,[data-sbday],[data-wvadd],[tabindex]'
    for (let y = 120; y < innerHeight - 20; y += 23) for (let x = 40; x < innerWidth - 20; x += 31) {
      const e = document.elementFromPoint(x, y); if (!e || e === document.documentElement) continue
      if (e.closest(bad)) continue
      const cs = getComputedStyle(e); if (cs.cursor === 'pointer' || cs.cursor === 'text' || cs.cursor === 'grab') continue
      return { x, y, el: (e.className && String(e.className).slice(0, 40)) || e.tagName }
    }
    return null
  })
  if (!pt) throw new Error('no empty spot to click')
  await p.mouse.click(pt.x, pt.y); await C.sleep(600)
  return pt
}
const info = async (A, B, label) => {
  const r = await p.evaluate(([root, attr, A, B]) => {
    const rect = e => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] }
    const keyed = [...document.querySelectorAll(`${root} [${attr}]`)].filter(e => e.offsetParent !== null && /^fr:/.test(e.getAttribute(attr)))
    const under = e => { const er = e.getBoundingClientRect(); let best = null, bd = 1e9; for (const k of keyed) { const kr = k.getBoundingClientRect(); const d = er.top - kr.bottom; if (d > -4 && d < bd && kr.right > er.left + 2 && kr.left < er.right - 2) { bd = d; best = k } } return best ? best.getAttribute(attr) : null }
    const vis = e => !!(e.offsetWidth || e.offsetHeight)
    const qs = [...document.querySelectorAll('.mission-role-question')].filter(vis).map(e => ({ text: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 120), box: rect(e), under: under(e) }))
    const chs = [...document.querySelectorAll('[data-role-choose]')].filter(vis).map(e => ({ text: e.innerText.trim(), box: rect(e), under: under(e), html: e.outerHTML.slice(0, 160) }))
    const ui = [...document.querySelectorAll('[data-role-ui]')].filter(vis).length
    const bx = k => { const e = [...document.querySelectorAll(`${root} [${attr}="${k}"]`)].find(x => x.offsetParent !== null); return e ? { box: rect(e), text: (e.value ?? e.textContent).trim(), focused: document.activeElement === e } : null }
    return { questions: qs, buttons: chs, nUi: ui, boxA: bx(A), boxB: bx(B), active: document.activeElement ? (document.activeElement.getAttribute(attr) || document.activeElement.tagName) : null }
  }, [ROOT, ATTR, A, B])
  r.pic = await C.pic(p, `hq1-${tag}-${label}`); pics.push(r.pic)
  log.push(`${label}: ${J({ q: r.questions, b: r.buttons, nUi: r.nUi, active: r.active })}`)
  return r
}
try {
  await C.tracking(p, true)
  if (SURF === 'board') await C.board(p, DI); else { await C.toWeek(p, DI) }
  /* the two formations: VL in the first wave, and the line whose Remarks reads RED AIR */
  const fx = await p.evaluate(di => {
    const d = DAYS[di]; const out = { A: null, B: null }
    const f0 = d.waves[0].formations
    const vi = f0.findIndex(f => f.cs === 'VL')
    out.A = { g: 0, f: vi, ai: 0, cs: 'VL', key: `fr:${di}.0.${vi}.0`, crew: f0[vi].aircraft.flatMap(a => [a.p, a.w]).filter(Boolean).map(id => PEOPLE[id] && PEOPLE[id].cs), msn: f0[vi].msn, rmk: f0[vi].aircraft.map(a => a.rmks) }
    for (let g = 0; g < d.waves.length; g++) for (let f = 0; f < d.waves[g].formations.length; f++) { const F = d.waves[g].formations[f]; const ai = F.aircraft.findIndex(a => a.rmks === 'RED AIR'); if (ai >= 0 && !out.B) out.B = { g, f, ai, cs: F.cs, key: `fr:${di}.${g}.${f}.${ai}`, crew: F.aircraft.flatMap(a => [a.p, a.w]).filter(Boolean).map(id => PEOPLE[id] && PEOPLE[id].cs), msn: F.msn, rmk: F.aircraft.map(a => a.rmks) } }
    return out
  }, DI)
  log.push(`formations ${J(fx)}`)
  const A = fx.A.key, B = fx.B.key
  const crewA = [...new Set(fx.A.crew)], crewB = [...new Set(fx.B.crew)]
  const box = key => p.locator(`${ROOT} [${ATTR}="${key}"]:visible`).first()
  /* 1: type DS FOR RU into VL's Remarks, click on empty page */
  const a = box(A)
  await a.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await a.click()
  if (SURF === 'board') { await a.fill(''); await p.keyboard.type('DS FOR RU', { delay: 8 }) } else { await p.keyboard.press('Control+A'); await p.keyboard.type('DS FOR RU', { delay: 8 }) }
  const pt = await empty()
  log.push(`empty click at ${J(pt)}`)
  const s1 = await info(A, B, '1-VL-question')
  /* 2: click into RU's Remarks (RED AIR) */
  const b = box(B)
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await C.sleep(250)
  await b.click(); await C.sleep(700)
  const s2 = await info(A, B, '2-RU-box-selected')
  /* 3: press the button drawn under RU */
  const ch = p.locator('[data-role-choose]:visible').first()
  const chText = (await ch.count()) ? (await ch.innerText()).trim() : 'NO BUTTON'
  if (await ch.count()) { await ch.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await ch.click(); await C.sleep(600) }
  const s3 = await info(A, B, '3-after-RU-button')
  /* 4: Blue */
  const bl = p.locator('[data-role-side="blue"]:visible').first()
  if (await bl.count()) { await bl.evaluate(e => e.scrollIntoView({ block: 'nearest' })); await bl.click(); await C.sleep(600) }
  const s4 = await info(A, B, '4-after-Blue')
  /* Insights */
  let ins
  if (SURF === 'board') ins = await C.insightsRead(p); else ins = await C.insightsRead(p)
  pics.push(ins.pic)
  const mixA = C.mixOf(ins, ...crewA), mixB = C.mixOf(ins, ...crewB)
  log.push(`Insights: VL crew ${mixA} || RU crew ${mixB}`)
  /* 5: VL's Remarks selected again: its button */
  const a2 = box(A)
  await a2.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await a2.click(); await C.sleep(700)
  const s5 = await info(A, B, '5-VL-box-selected-again')
  const vlStored = await p.evaluate(([di, g, f]) => DAYS[di].waves[g].formations[f].aircraft.map(x => x.rmks), [DI, fx.A.g, fx.A.f])
  const ruStored = await p.evaluate(([di, g, f]) => DAYS[di].waves[g].formations[f].aircraft.map(x => x.rmks), [DI, fx.B.g, fx.B.f])
  log.push(`stored Remarks: VL ${J(vlStored)} RU ${J(ruStored)}; chooseText ${J(chText)}`)
  const fp = k => k ? String(k).split('.').slice(0, 3).join('.') : null
const pre = key => fp(key)
  checks.push(['1: after "DS FOR RU" in VL and a click on empty page one question opens, under VL', s1.questions.length === 1 && /VL/.test(s1.questions[0].text) && fp(s1.questions[0].under) === pre(A), J(s1.questions)])
  checks.push(['2: with VL\'s question open, RU\'s Remarks shows ONE "Choose mission role" button under RU, and VL\'s question is still there (one question, one button)', s2.questions.length === 1 && /VL/.test(s2.questions[0].text) && s2.buttons.length === 1 && /Choose mission role/.test(s2.buttons[0].text) && fp(s2.buttons[0].under) === pre(B), J({ q: s2.questions, b: s2.buttons })])
  checks.push(['3: pressing RU\'s button leaves exactly ONE question on screen, RU\'s', s3.questions.length === 1 && /RU/.test(s3.questions[0].text) && !/VL:/.test(s3.questions[0].text) && fp(s3.questions[0].under) === pre(B), J({ q: s3.questions, b: s3.buttons })])
  checks.push(['4a: Blue answers RU only — no question left on screen', s4.questions.length === 0, J(s4.questions)])
  const split = m => !/-b\/-r/.test(m)
  checks.push(['4b: Insights: RU\'s crew bars split Blue/Red; VL\'s crew still total-only (VL unanswered)', split(mixB) && /-b\/-r/.test(mixA) && !crewA.some(n => crewB.includes(n)), J({ ru: mixB, vl: mixA })])
  checks.push(['5: VL\'s Remarks selected again: its button reads "Choose mission role" (not Change)', s5.buttons.some(x => /^Choose/.test(x.text) && fp(x.under) === pre(A)) && !s5.buttons.some(x => /Change/.test(x.text) && fp(x.under) === pre(A)), J({ b: s5.buttons, q: s5.questions })])
  const bad = checks.filter(c => !c[1])
  C.row(`H-Q1(${SURF}${SURF === 'phone' ? ' 390x844' : ''}, day ${DI})`, `Logic tracking On; ${SURF === 'board' ? 'Scheduler Board' : 'Edit Schedule week'}, day ${DI}: typed "DS FOR RU" in VL's Remarks (first wave) and clicked empty page (question under VL, not answered); clicked into the Remarks of the ${fx.B.cs} line (RED AIR); pressed the button under it; pressed Blue; Insights; VL's Remarks selected again`,
    checks.map(c => `${c[1] ? 'OK' : 'NOT OK'} ${c[0]} [${String(c[2]).slice(0, 600)}]`).join(' || ') + ' || LOG: ' + log.join(' ;; '), bad.length ? 'FAIL' : 'PASS', pics)
} catch (e) { C.row(`H-Q1(${SURF})`, 'aborted', String(e.stack || e).slice(0, 900) + ' LOG ' + log.join(' ;; '), 'FAIL', [await C.pic(p, 'hq1-error')]) }
console.log('ERRORS', J(C.ERR))
C.save('hq1-' + SURF)
await w.browser.close()
