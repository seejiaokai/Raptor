import * as K from './stk2-N-klib.mjs'
import * as P6 from './p6-lib.mjs'
const { L, W, H } = K
const stateOf = p => p.evaluate(() => ({ elog: window.ELOG.rows.length, cmds: window.commandStreamLen() }))
/* the way a person clicks into a box: bring it into view (the page scrolls; a focused box stays focused), then press the mouse on its own middle */
async function clickBox(p, sel) {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await K.sleep(200)
  const b = await el.boundingBox()
  const ok = await el.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && (h === e || e.contains(h)) })
  if (!ok) throw new Error('something lies over ' + sel)
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await K.sleep(250)
  return b
}
/* click on empty page: find a spot with no control under it, inside the viewport */
async function clickEmpty(p) {
  const pt = await p.evaluate(() => {
    for (const [x, y] of [[8, 450], [1430, 450], [8, 300], [1430, 600], [700, 880]]) {
      const e = document.elementFromPoint(x, y)
      if (e && !e.closest('[contenteditable],input,select,button,a,[data-txt],[data-inp]')) return [x, y, e.tagName + '.' + (e.className || '')]
    }
    return null
  })
  if (!pt) throw new Error('no empty spot')
  await p.mouse.click(pt[0], pt[1]); await K.sleep(400)
  return pt
}
async function typeInto(p, sel, text) {
  const b = await clickBox(p, sel)
  await p.keyboard.press('Control+A')
  await p.keyboard.type(text, { delay: 10 })
  return b
}
const txt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.innerText.trim() : null }, sel)
const TO = '#eWeek [data-txt="ff:0.0.0.to"]', AT = '#eWeek [data-atime="0.0.0"]'
const TO2 = '#eWeek [data-txt="ff:0.0.1.to"]', AT2 = '#eWeek [data-atime="0.0.1"]'
const TO3 = '#eWeek [data-txt="ff:0.1.0.to"]'

/* ================= (a) unpublished Monday ================= */
{
  const { browser, p, errors } = await H.world({ who: 'a', phone: false })
  await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(600)
  const s0 = await stateOf(p)
  const before = { to: await txt(p, TO), at: await txt(p, AT) }
  await typeInto(p, TO, '1255')
  const bAt = await clickBox(p, AT)       // straight into the Area time box
  const mid = { to: await txt(p, TO), at: await txt(p, AT), focus: await p.evaluate(() => (document.activeElement.dataset.atime || document.activeElement.dataset.txt || document.activeElement.tagName)) }
  const pc1 = await K.pic(p, 'L10a-in-area-box')
  const empty = await clickEmpty(p)
  const after = { to: await txt(p, TO), at: await txt(p, AT), model: await p.evaluate(() => { const f = window.DAYS[0].waves[0].formations[0]; return { to: f.to, atime: f.atime ?? null } }) }
  const s1 = await stateOf(p)
  const lastLines = await p.evaluate(n => window.ELOG.rows.slice(-n).map(r => JSON.stringify(r).slice(0, 200)), s1.elog - s0.elog || 1)
  const pc2 = await K.pic(p, 'L10a-after-click-away')
  const ok = after.at === '1255-1405' && after.model.atime === null
  K.note('L-10', 'a-unpublished', 'Edit Schedule Mon, VL formation: clicked take-off (12:40), Ctrl+A, typed 1255, real click on its Area time box, then real click on empty page',
    `before: take-off ${before.to}, area time ${before.at}; while in area box: take-off ${mid.to}, area ${mid.at}, caret in ${mid.focus}; after click away: take-off ${after.to}, area time ${after.at}, stored area time override ${after.model.atime}; edit-history rows ${s0.elog}->${s1.elog}, command stream ${s0.cmds}->${s1.cmds}; new history rows: ${lastLines.join(' || ')}`,
    ok ? 'PASS' : 'FAIL', [pc1, pc2])
  console.log('errors a:', K.errList(errors))
  await browser.close()
}

/* ================= (a) published Monday ================= */
{
  const { browser, p, errors } = await H.world({ who: 'a', phone: false })
  await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="0"]'); await L.sleep(600)
  await W.toastSpy(p)
  const signs = await W.signDay(p, 0)
  const pub = await W.publishDay(p, 0)
  await L.sleep(800)
  const h0 = await W.head(p, 0)
  console.log('published', JSON.stringify(pub), JSON.stringify(h0))
  const s0 = await stateOf(p)
  // control: plain change of another formation's take-off, left by blur
  await typeInto(p, TO3, '2000')
  await p.evaluate(() => document.activeElement.blur()); await K.sleep(500)
  const hC = await W.head(p, 0)
  const sC = await stateOf(p)
  // the case: take-off then straight into the Area time box
  await typeInto(p, TO2, '1355')
  await clickBox(p, AT2)
  const hMid = await W.head(p, 0)
  const atMid = await txt(p, AT2)
  await clickEmpty(p)
  const hA = await W.head(p, 0)
  const atA = await txt(p, AT2), toA = await txt(p, TO2)
  const model = await p.evaluate(() => { const f = window.DAYS[0].waves[0].formations[1]; return { to: f.to, atime: f.atime ?? null } })
  const sA = await stateOf(p)
  const pc = await K.pic(p, 'L10a-published-after')
  const chg = await P6.changesList(L, p, 0)
  const pc2 = await K.pic(p, 'L10a-published-changes')
  K.note('L-10', 'a-published', 'Monday signed (four names) and published; then control: wave 2 formation 1 take-off 19:45 -> 2000 left by blur; then formation 2 take-off 13:40 -> 1355 and a real click straight into its Area time box, then click on empty page',
    `after publish head: ${JSON.stringify({ tag: h0.tag, pending: h0.pending, signed: h0.signed })}; after the control change: pending "${hC.pending}"; while in the area box: pending "${hMid.pending}", area time "${atMid}"; after click away: pending "${hA.pending}", take-off ${toA}, area time ${atA}, stored area override ${model.atime}; sign-off line "${hA.signed}", signs ${JSON.stringify(hA.signs)}; history rows ${s0.elog}->${sC.elog}->${sA.elog}; changes window (To go out): ${JSON.stringify(chg && chg.lines)}`,
    (atA === '1355-1505' && model.atime === null) ? 'PASS' : 'FAIL', [pc, pc2])
  console.log('errors a2:', K.errList(errors))
  await browser.close()
}

/* ================= (b) a request shown on two days ================= */
{
  const { browser, p, errors } = await H.world({ who: 'a', phone: false })
  await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="2"]'); await L.sleep(600)
  const iid = await p.evaluate(() => window.INPUTS.find(x => x.person === 'pike' && x.type === 'OD').iid)
  const R2 = `#eWeek .day[data-day="2"] [data-inp="${iid}.rmks"]`, R3 = `#eWeek .day[data-day="3"] [data-inp="${iid}.rmks"]`, R4 = `#eWeek .day[data-day="4"] [data-inp="${iid}.rmks"]`
  const old = await txt(p, R2)
  const s0 = await stateOf(p)
  await typeInto(p, R2, 'NEW REMARK b1')
  const bx = await clickBox(p, R3)      // straight into the same remark on the next day
  const mid = { d2: await txt(p, R2), d3: await txt(p, R3) }
  const pc1 = await K.pic(p, 'L10b-into-second')
  await clickEmpty(p)
  const after = { d2: await txt(p, R2), d3: await txt(p, R3), d4: await txt(p, R4), model: await p.evaluate(i => window.INPUTS.find(x => x.iid === i).remarks, iid) }
  const s1 = await stateOf(p)
  const pc2 = await K.pic(p, 'L10b-after')
  K.note('L-10', 'b-two-days', `pike OD Jul 15-17 shown on Wed, Thu, Fri: Wed's remark box typed "NEW REMARK b1" (was "${old}"), real click straight into Thu's remark box, then click on empty page`,
    `while in Thu's box: Wed shows "${mid.d2}", Thu shows "${mid.d3}"; after click away: Wed "${after.d2}", Thu "${after.d3}", Fri "${after.d4}", stored remark "${after.model}"; history rows ${s0.elog}->${s1.elog}, commands ${s0.cmds}->${s1.cmds}`,
    (after.d2 === 'NEW REMARK b1' && after.d3 === 'NEW REMARK b1' && after.model === 'NEW REMARK b1') ? 'PASS' : 'FAIL', [pc1, pc2])
  // variant: the other direction (second box then first)
  await typeInto(p, R3, 'NEW REMARK b2')
  await clickBox(p, R4)
  await clickEmpty(p)
  const a2 = { d2: await txt(p, R2), d3: await txt(p, R3), d4: await txt(p, R4), model: await p.evaluate(i => window.INPUTS.find(x => x.iid === i).remarks, iid) }
  const pc3 = await K.pic(p, 'L10b-variant-after')
  K.note('L-10', 'b-variant', 'same again: Thu typed "NEW REMARK b2", click straight into Fri, click away',
    `Wed "${a2.d2}", Thu "${a2.d3}", Fri "${a2.d4}", stored "${a2.model}"`, (a2.d2 === 'NEW REMARK b2' && a2.d3 === 'NEW REMARK b2' && a2.d4 === 'NEW REMARK b2') ? 'PASS' : 'FAIL', [pc3])
  console.log('errors b:', K.errList(errors))
  await browser.close()
}

/* ================= (c) Ground + Personal Inputs ================= */
{
  const { browser, p, errors } = await H.world({ who: 'a', phone: false })
  await L.go(p, 'editsched'); await p.waitForSelector('#eWeek .day[data-day="1"]'); await L.sleep(600)
  const iid = await p.evaluate(() => window.INPUTS.find(x => x.person === 'salsa' && x.type === 'Appointment').iid)
  // open the day's Personal Inputs (it is folded) with its own header
  const hd = p.locator('#eWeek .day[data-day="1"] [data-pitog="1"]').first()
  await hd.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await hd.click(); await K.sleep(500)
  const PI = `#eWeek .day[data-day="1"] [data-inp="${iid}.rmks"]`
  const GR = '#eWeek [data-txt="gr:1.3.rmks"]'
  const old = { pi: await txt(p, PI), gr: await txt(p, GR) }
  const s0 = await stateOf(p)
  await typeInto(p, PI, 'NEW REMARK c1')
  await clickBox(p, GR)
  const mid = { pi: await txt(p, PI), gr: await txt(p, GR) }
  const pc1 = await K.pic(p, 'L10c-into-ground')
  await clickEmpty(p)
  const after = { pi: await txt(p, PI), gr: await txt(p, GR), model: await p.evaluate(i => window.INPUTS.find(x => x.iid === i).remarks, iid), grm: await p.evaluate(() => window.DAYS[1].ground[3].rmks) }
  const s1 = await stateOf(p)
  const pc2 = await K.pic(p, 'L10c-after')
  K.note('L-10', 'c-ground', `salsa's Appointment (Tue 14 Jul, accepted to Ground, also in Personal Inputs): Personal Inputs remark typed "NEW REMARK c1" (was "${old.pi}"; ground row showed "${old.gr}"), real click straight into the Ground row's Remarks, then click on empty page`,
    `while in the Ground box: Personal Inputs shows "${mid.pi}", Ground shows "${mid.gr}"; after click away: Personal Inputs "${after.pi}", Ground "${after.gr}", stored request remark "${after.model}", stored ground row remark "${after.grm}"; history rows ${s0.elog}->${s1.elog}, commands ${s0.cmds}->${s1.cmds}`,
    (after.pi === 'NEW REMARK c1' && after.gr === 'NEW REMARK c1' && after.model === 'NEW REMARK c1') ? 'PASS' : 'FAIL', [pc1, pc2])
  console.log('errors c:', K.errList(errors))
  await browser.close()
}
K.flush()
