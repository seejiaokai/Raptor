// r4wf-ma-x1 — merge walk, walker A, X1 (Fable's rank 1): an Undo under the caret after a visit to another section.
// SUB=a   Ranger End 1000 Tab; tap a Ground Programme remark box; tap Hex's Start; Undo keeping the caret; 0900 Tab; blank.
// SUB=a2  the same with blank space tapped in place of the Ground box.
// SUB=b   as a, but the caret goes into RANGER's Start before Undo.
// SUB=c   a's first four steps, then Hex's puck, then Outlaw on the crew list.
// SUB=d   three men: cut Ranger (End 1000), cut Hex (End 1100), Ground box, caret into Outlaw's Start, Undo, 0900 Tab.
// KEEP=tap|js — how the Undo is pressed (a real tap / element.click()).
//   WR4_OUT=<dir> WR4_NEW=<build> SHR_BUNDLE=<bundle> SZ=phone ENG=webkit SUB=a KEEP=tap node scripts/handpass/r4wf-ma-x1.mjs
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
const SUB = process.env.SUB || 'a'
console.log('r4wf-ma-x1 v1', A.TAG, 'SUB', SUB, 'KEEP', process.env.KEEP || 'tap', 'bundle', A.EXPECT_BUNDLE)
const steps = [], pics = [], notes = []
const ID = `X1${SUB}`
let ids
const rd = async (label, extra = {}) => { const r = { ...(await A.read(A_P, label, ids)), note: await A.note(A_P), ...extra }; steps.push(r); return r }
let A_P
const shared = s => s.filter(x => /^LL (Ranger\+Hex|Hex\+Ranger) /.test(x))
try {
  const w = await A.world(); const p = w.page; A_P = p
  const outlaw = await A.idOf(p, 'Outlaw'); A.NAMES[outlaw] = 'Outlaw'
  ids = ['bane', 'rocky', outlaw]
  const people = SUB === 'd' ? [L.RANGER, L.HEX, outlaw] : [L.RANGER, L.HEX]
  const iid = await A.fixture(w, people, { from: '08:00', to: '17:00' })
  await A.openBoard(w)
  await rd('filed')
  pics.push(await A.pic(w, `${ID}-0-filed`))
  /* 1. Ranger's End 1000, Tab */
  await A.typeIn(w, await A.boxSel(p, 'Ranger', 'end'), '1000', 'Tab', 'r-end-tap')
  await rd('Ranger End 1000, Tab')
  if (SUB === 'd') {
    await A.typeIn(w, await A.boxSel(p, 'Hex', 'end'), '1100', 'Tab', 'h-end-tap')
    await rd('Hex End 1100, Tab')
  }
  pics.push(await A.pic(w, `${ID}-1-cut`))
  /* 2. the visit: a Ground Programme remark box, or blank space */
  if (SUB === 'a2') { await A.away(w); await rd('blank space tapped') }
  else { const g = await A.groundRmks(p); await A.tapBox(w, g, 'ground-tap'); await rd(`Ground Programme remark box tapped (${g.match(/"(.+)"/)[1]})`) }
  pics.push(await A.pic(w, `${ID}-2-visit`))
  /* 3. the caret into a box of the held list */
  const who3 = SUB === 'b' ? 'Ranger' : SUB === 'd' ? 'Outlaw' : 'Hex'
  const box3 = await A.boxSel(p, who3, 'str')
  await A.tapBox(w, box3, `${who3}-str-tap`)
  await rd(`${who3}'s Start tapped (${box3.match(/"(.+)"/)[1]})`)
  /* 4. Undo, keeping the caret */
  const k = await A.keepPress(w, '#sbUndo', `${ID}-undo`)
  await rd('Undo pressed', { keep: k })
  pics.push(await A.pic(w, `${ID}-4-after-undo`))
  const afterUndo = steps.at(-1)
  let pre = ''
  if (!k.kept && SUB === 'c') pre = '(caret lost at Undo; the puck tap needs none) '
  else if (!k.kept && process.env.CONT) {
    /* the press could not keep the caret: the rest walked anyway, the caret put back by a fresh tap on the same man's Start */
    pre = 'COULD NOT BE MADE (caret lost at Undo); continued with a fresh tap → '
    const again = await A.boxSel(p, who3, 'str'); await A.tapBox(w, again, `${who3}-str-retap`)
    await rd(`caret put back: ${who3}'s Start tapped again (${again.match(/"(.+)"/)[1]})`)
  }
  if (!k.kept && !process.env.CONT && SUB !== 'c') {
    A.res(ID, 'COULD NOT BE MADE (this try)', { keep: k, steps }, pics)
  } else if (SUB === 'c') {
    /* Hex's puck, then Outlaw on the crew list */
    const row = await A.rowSel(p, 'Hex')
    await A.pressAt(w, `${row} .seat [data-person="rocky"]`, 'hex-puck')
    const arm = await p.evaluate(() => [...document.querySelectorAll('.ros-arm')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
    const ring = await p.evaluate(() => [...document.querySelectorAll('#sbBoard [data-inprow]')].filter(r => r.querySelector('.armed, .picked, [aria-pressed="true"].puck, .seat.armed')).map(r => r.getAttribute('data-inprow')))
    await rd('Hex\'s puck tapped', { arm, ring })
    pics.push(await A.pic(w, `${ID}-5-armed`, ['body']))
    const tgt = p.locator(`#sbRoster .rpuck[data-person="${outlaw}"]`).filter({ visible: true }).first()
    if (!(await tgt.count())) throw new Error('Outlaw not on the crew list after the puck tap; arm ' + J(arm))
    await tgt.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
    const bb = await tgt.boundingBox()
    if (w.tap) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
    const said = await L.catchToast(p, /instead|Outlaw|replac/i, 3000); await L.releaseToast(p)
    notes.push(said)
    await sleep(600)
    await rd('Outlaw tapped on the crew list', { said })
    pics.push(await A.pic(w, `${ID}-6-after-outlaw`))
    await A.away(w); await rd('blank tapped')
    pics.push(await A.pic(w, `${ID}-7-caret-left`))
    const s = steps.at(-1).store
    const ok = s.some(x => /^LL (Ranger\+Outlaw|Outlaw\+Ranger) Jul 15 480-1020/.test(x)) && !s.some(x => /Hex/.test(x) && /Outlaw|Ranger/.test(x)) && !s.some(x => /^LL Hex /.test(x))
    const rangerReplaced = s.some(x => /^LL (Hex\+Outlaw|Outlaw\+Hex) /.test(x))
    A.res(ID, pre + (rangerReplaced ? 'FAIL' : ok ? 'PASS' : 'RECORD'), { said, afterUndo: afterUndo.store, final: s, steps }, pics)
  } else {
    /* 5. type 0900, Tab; tap blank */
    await p.keyboard.press('Control+A'); await p.keyboard.type('0900')
    await rd('0900 typed (not left)')
    await p.keyboard.press('Tab'); await sleep(700)
    const said = await A.note(p)
    await rd('Tab', { said })
    pics.push(await A.pic(w, `${ID}-5-after-0900-tab`))
    await A.away(w); await rd('blank tapped')
    pics.push(await A.pic(w, `${ID}-6-caret-left`))
    const cards = await A.inputsDay(w)
    steps.push({ step: 'Inputs page, Wed 15 Jul', cards })
    pics.push(await A.pic(w, `${ID}-7-inputs-day`, ['[data-testid="win-inputsday"]']))
    const s = steps.at(-2).store, u = afterUndo.store
    const undoOk = u.length === 1 && shared(u).length === 1 && / 480-1020 /.test(u[0])
    let v, why
    if (SUB === 'a' || SUB === 'a2') {
      const hexOwn = s.filter(x => /^LL Hex Jul 15 540-1020/.test(x)).length === 1, rOwn = s.filter(x => /^LL Ranger Jul 15 480-1020/.test(x)).length === 1
      const bad = shared(s).some(x => / 540-/.test(x))
      const refused = s.length === 1 && shared(s).length === 1 && / 480-1020/.test(s[0])
      v = !undoOk ? 'FAIL' : bad ? 'FAIL' : (hexOwn && rOwn && s.length === 2) ? 'PASS' : refused ? 'RECORD (nothing saved — refusal? see note/box)' : 'RECORD'
      why = { undoOk, hexOwn, rOwn, bad, refused }
    } else if (SUB === 'b') {
      const rOwn = s.filter(x => /^LL Ranger Jul 15 540-1020/.test(x)).length === 1, hOwn = s.filter(x => /^LL Hex Jul 15 480-1020/.test(x)).length === 1
      const bad = shared(s).some(x => / 540-/.test(x))
      v = !undoOk ? 'FAIL' : bad ? 'FAIL' : (rOwn && hOwn && s.length === 2) ? 'PASS' : 'RECORD'
      why = { undoOk, rOwn, hOwn, bad }
    } else {
      /* d: after Undo Hex rejoins Outlaw; 0900 must reach Outlaw alone */
      const oOwn = s.filter(x => /^LL Outlaw Jul 15 540-1020/.test(x)).length === 1
      const bad = s.some(x => /(Hex|Ranger)/.test(x) && / 540-/.test(x))
      v = bad ? 'FAIL' : oOwn ? 'PASS' : 'RECORD'
      why = { oOwn, bad, afterUndo: u }
    }
    A.res(ID, pre + v, { why, said, cards, steps }, pics)
  }
  await w.ctx.close()
} catch (e) { A.res(ID, 'NOT WALKED', 'error: ' + e.message.split('\n')[0].slice(0, 400) + ' ' + J(steps).slice(0, 3000), pics) }
await A.fin(`x1${SUB}-${process.env.KEEP || 'tap'}`)
