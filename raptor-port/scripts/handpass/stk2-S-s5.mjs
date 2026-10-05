import * as X from './stk2-Q-fx.mjs'
import * as F from './stk2-Q-flib.mjs'
import * as K from './stk2-S-lib.mjs'
const { sleep } = F
const { browser, p, errors } = await F.open('desk', 'a')
const pic = (name, clip) => K.pic(p, name, clip ? { clip } : {})
/* a click on empty page: scan for a spot where nothing a person could press lies */
async function clickEmpty() {
  const pt = await p.evaluate(() => {
    const bad = 'button,a,input,textarea,select,[contenteditable],[data-txt],[data-bfld],[data-slot],[data-fill],.puck,[tabindex],[data-role-choose],.mission-role-question,label,summary'
    for (let y = 8; y < innerHeight - 8; y += 14) for (let x = innerWidth - 12; x > 8; x -= 23) {
      const e = document.elementFromPoint(x, y); if (!e || e.closest(bad)) continue
      if (e === document.documentElement) continue
      return [x, y, (e.id || String(e.className) || e.tagName).toString().slice(0, 30)]
    }
    return null
  })
  if (!pt) return 'no empty spot'
  await p.mouse.click(pt[0], pt[1]); await sleep(400)
  return pt
}
/* what is drawn for the role: the button(s), the question, where they sit */
const roleUI = () => p.evaluate(() => {
  const vis = e => e.getBoundingClientRect().width > 0
  const btn = [...document.querySelectorAll('[data-role-choose]')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { txt: e.innerText.trim(), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } })
  const q = [...document.querySelectorAll('.mission-role-question')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { txt: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 120), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] } })
  return { btn, q }
})
const boxOf = key => p.evaluate(k => { const e = [...document.querySelectorAll(`[data-txt="${k}"],[data-bfld="${k}"]`)].find(x => x.offsetParent !== null); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }, key)
const csOf = ids => p.evaluate(a => a.map(i => window.PEOPLE[i] ? window.PEOPLE[i].cs : i), ids)
const trk = await X.tracking(p, true)
console.log('tracking on:', trk)

async function surface(surf, di, gi, fi, label) {
  const k0 = `fr:${di}.${gi}.${fi}.0`, k1 = `fr:${di}.${gi}.${fi}.1`
  const crew = await p.evaluate(([d, g, f]) => window.DAYS[d].waves[g].formations[f].aircraft.flatMap(a => [a.p, a.w]).filter(Boolean), [di, gi, fi])
  const names = await csOf(crew)
  console.log(label, 'crew', names)
  if (surf === 'week') { await F.go(p, 'editsched') } else { await X.board(p, di) }
  await sleep(500)
  // type DS FOR RU into the first aircraft's Remarks, click empty page
  await X.typeIn(p, surf, k0, 'DS FOR RU')
  const spot = await clickEmpty()
  let q1 = await roleUI()
  const p1 = await pic(`${label}-1-after-typing-click-empty`)
  let later = 'no question appeared'
  if (q1.q.length) { await X.later(p); later = 'pressed Later'; }
  const afterLater = await roleUI()
  // click into the first aircraft's Remarks
  const el0 = p.locator(X.boxSel(surf, k0)).first()
  await el0.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  const b0 = await el0.boundingBox(); await p.mouse.click(b0.x + b0.width / 2, b0.y + b0.height / 2); await sleep(400)
  const ui0 = await roleUI(), act0 = await X.active(p)
  const p2 = await pic(`${label}-2-in-first-remarks`)
  // straight into the second aircraft's Remarks
  const el1 = p.locator(X.boxSel(surf, k1)).first()
  await el1.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  const b1 = await el1.boundingBox(); await p.mouse.click(b1.x + b1.width / 2, b1.y + b1.height / 2); await sleep(500)
  const ui1 = await roleUI(), act1 = await X.active(p), box1 = await boxOf(k1)
  const p3 = await pic(`${label}-3-in-second-remarks`)
  // press the button
  let pressed = 'no button', q2 = null, nq = 0
  if (ui1.btn.length) {
    const bb = ui1.btn[0].box
    await p.mouse.click(bb[0] + bb[2] / 2, bb[1] + bb[3] / 2); await sleep(500)
    pressed = 'pressed "' + ui1.btn[0].txt + '"'
    q2 = await roleUI(); nq = q2.q.length
  }
  const p4 = await pic(`${label}-4-question-open`)
  // Blue
  let blue = 'no Blue button'
  const bl = p.locator('[data-role-side="blue"]:visible').first()
  if (await bl.count()) { await bl.click(); await sleep(600); blue = 'pressed Blue' }
  const act2 = await X.active(p), ui2 = await roleUI()
  const p5 = await pic(`${label}-5-after-blue`)
  // insights
  const ins = await X.insights(p, { door: surf === 'week' ? 'desk' : 'board', all: true })
  const rows = ins.secs.flatMap(s => s.rows.map(r => ({ sec: s.h.slice(0, 20), ...r }))).filter(r => names.includes(r.nm))
  const p6 = await pic(`${label}-6-insights`)
  await X.insightsClose(p)
  const logLines = await p.evaluate(() => window.ELOG.rows.filter(r => r.fld === 'mission-role').map(r => JSON.stringify(r).slice(0, 160)))
  const ok1 = ui1.btn.length > 0 && act1.k === k1
  const ok2 = nq === 1
  const ok3 = act2.k === k1
  const ok4 = rows.some(r => r.blue != null && +r.blue >= 1)
  return { label, k0, k1, crew: names, spot, q1: q1.q, later, afterLater, ui0, act0, ui1, act1, box1, pressed, nq, q2: q2 && q2.q, blue, act2, ui2, rows: rows.map(r => `${r.sec} ${r.nm}: blue ${r.blue} red ${r.red} :: ${r.txt.slice(0, 80)}`), logLines, ok: { button_with_caret_in_second: ok1, one_question: ok2, caret_back: ok3, blue_recorded: ok4 }, pics: [p1, p2, p3, p4, p5, p6] }
}
const W5 = await surface('week', 0, 0, 1, 'S5-week')
console.log(JSON.stringify(W5, null, 1))
const B5 = await surface('board', 3, 1, 1, 'S5-board')
console.log(JSON.stringify(B5, null, 1))
for (const [r, name] of [[W5, 'Edit Schedule week (Mon, RU formation, BFM)'], [B5, 'Scheduler Board (Thu, 2nd wave RU formation, BFM)']]) {
  K.note('S-5', r.label, `tracking On; ${name}: typed "DS FOR RU" in the first aircraft's Remarks, clicked empty page (${JSON.stringify(r.spot)}), question: ${r.later}; clicked into first Remarks, then straight into the second Remarks; pressed the button; pressed Blue`,
    `question right after the first edit: ${JSON.stringify(r.q1)}; in first Remarks: button ${JSON.stringify(r.ui0.btn)} caret ${JSON.stringify(r.act0)}; straight into second Remarks: caret ${JSON.stringify(r.act1)}, button ${JSON.stringify(r.ui1.btn)}, question ${JSON.stringify(r.ui1.q)}; button -> ${r.pressed}; questions open: ${r.nq} ${JSON.stringify(r.q2)}; Blue -> ${r.blue}; caret after Blue: ${JSON.stringify(r.act2)}; role UI after: ${JSON.stringify(r.ui2)}; Insights rows for the crew (${r.crew.join(', ')}): ${JSON.stringify(r.rows)}; mission-role change lines ${JSON.stringify(r.logLines)}`,
    Object.values(r.ok).every(Boolean) ? 'PASS' : 'FAIL (' + Object.entries(r.ok).filter(([, v]) => !v).map(([k]) => k).join(', ') + ')', r.pics)
}
console.log('errors', K.errList(errors))
K.flush()
await browser.close()
