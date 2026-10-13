/* THE WALK OF THE LEFTOVERS BATCH ([BATCH-14OCT-LEFTOVERS] — owner D849, D851, D854; the sheet
   docs/handpass/2026-10-14-leftovers.md). Assertions of the RIGHT behaviour on the built app, with pictures: a PASS
   means correct, so running it again on a fixed build IS the re-walk (docs/bug-check-order.md §5).

     A  the just-added mark in place of "Input added" / "Input updated": the opened day's card, the month's bar, the
        List's row (a desktop) or card (a phone); what a screen reader is told; where the keyboard is left; the mark gone
        after its six seconds; a reader who asked for less motion; a member; and where the note is STILL said — a save
        made from the schedule, a SANS commitment;
     B  the cancelled input's window: the CX tag and its reason follow the title, a long reason is cut before the title;
     C  the upchit and medical-clash questions: their answers flat;
     D  the Scheduler Board: Done says nothing; a puck put on an input's row and taken off says nothing; a warning still does.

   usage (the build served on DL_BASE):
     DL_BASE=http://localhost:4174 DL_SHOTS=docs/img/handpass/2026-10-14-leftovers node scripts/handpass/lo-walk.mjs [phone|desk] [A|B|C|D ...] */
import { L, inputsCal, openAdd, fillForm, headOf, rowOut, part } from './tb/w3/lib.mjs'

const SIZE = process.argv[2] === 'desk' ? 'desk' : 'phone'
const ONLY = process.argv.slice(3)
const want = k => !ONLY.length || ONLY.includes(k)
const T = SIZE
const BLUE = '30, 134, 255'

/** what the passing note says right now ('' while none is showing) */
const noteNow = p => p.evaluate(() => { const t = document.getElementById('toastEl'); return t && +getComputedStyle(t).opacity > 0.5 ? (t.textContent || '') : '' })
/** watch for `ms`: every different thing the note said while it was showing */
async function notesFor(p, ms) {
  const seen = []
  for (let t = 0; t < ms; t += 60) { const n = await noteNow(p); if (n && !seen.includes(n)) seen.push(n); await L.sleep(60) }
  return seen
}
/** the mark on what `sel` finds: is it worn, is it PAINTED (the blue box in the computed style), is it in view at its head, middle and foot */
const markOf = (p, sel) => p.evaluate(([sel, BLUE]) => {
  const el = document.querySelector(sel)
  if (!el) return { found: false }
  /* a table row's box is drawn on its CELLS: every one of them must wear it */
  const cells = el.tagName === 'TR' ? [...el.querySelectorAll(':scope > td')] : [el]
  const st = getComputedStyle(cells[0])
  const b = el.getBoundingClientRect(), x = b.left + b.width / 2, in1 = Math.min(3, b.height / 4)
  const at = [b.top + in1, b.top + b.height / 2, b.bottom - in1].map(y => { const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h)) })
  return { found: true, innew: el.classList.contains('innew'), fresh: el.getAttribute('data-fresh'), shadow: st.boxShadow, painted: cells.every(c => getComputedStyle(c).boxShadow.includes(BLUE)), anim: st.animationName,
    inView: at.every(Boolean), box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] }
}, [sel, BLUE])
const said = p => p.evaluate(() => (document.getElementById('srSay') || {}).textContent || '')
const closeDay = async p => { const x = p.locator('[data-testid="win-inputsday-x"]'); if (await x.count()) await x.first().evaluate(e => e.click()); await L.sleep(300) }
const newestId = p => p.evaluate(() => String(window.INPUTS[0].iid))

/* ---------------------------------------------------------------------------------------------------------- A */
async function marks(w, { reduced = false, tag = '' } = {}) {
  const p = w.page, sfx = `${T}${tag}`
  await inputsCal(w, '2026-07-13')

  /* A1 — a new input filed from an opened day */
  await part(w, `A ${sfx}`, 'A1 the opened day: a new input', 'card marked, painted, in view; no note; a screen reader told "Input added"', async () => {
    await openAdd(w, '2026-07-14')
    await fillForm(w, { type: 'Meeting', person: 'bane', start: '09:00', end: '10:00', title: 'Safety meeting' })
    await w.press('#inpEditSave')
    await p.waitForSelector('[data-testid="win-inputsday"] .icard.innew', { timeout: 5000 })
    const id = await newestId(p), sel = `[data-testid="idy-row-${id}"]`
    const m0 = await markOf(p, sel)
    await L.pic(w, `A1-day-added-${sfx}`)
    const notes = await notesFor(p, 1500)
    const m = await markOf(p, sel), sr = await said(p), focus = await L.focusOf(w)
    const barsLit = await p.evaluate(id => [...document.querySelectorAll(`.ib-bar[data-iid="${id}"]`)].some(b => b.classList.contains('innew')), id)
    rowOut(`A ${sfx}`, 'A1 the opened day: a new input', 'card marked, painted, in view; no note; a screen reader told "Input added"',
      `mark ${JSON.stringify(m0)}; notes seen in 1.5s: ${JSON.stringify(notes)}; sr: "${sr}"; keyboard on: ${focus}; the bar behind lit: ${barsLit}; still marked after 1.5s: ${m.innew}`,
      m0.innew && m0.fresh === id && m0.painted && m0.inView && !notes.length && sr === 'Input added' && !barsLit && (reduced ? m0.anim === 'none' : m0.anim === 'inflash'))
    w.A1 = { id, sel }
  })

  /* A2 — the same input changed */
  await part(w, `A ${sfx}`, 'A2 the opened day: the input changed', 'card marked again; no "Input updated"; a screen reader told it', async () => {
    const { id, sel } = w.A1
    await L.sleep(reduced ? 300 : 6300)                      // its first six seconds are over
    const gone = await markOf(p, sel)
    await L.pic(w, `A2a-day-mark-gone-${sfx}`)
    await w.press(`${sel} [data-testid="idy-open"]`)
    await p.waitForSelector('#inpEditPop #inpEditRmk', { timeout: 6000 })
    await p.locator('#inpEditPop #inpEditRmk').first().fill('Bring the new checklist')
    await w.press('#inpEditSave')
    await p.waitForFunction(id => { const r = window.INPUTS.find(x => String(x.iid) === id); return r && r.remarks === 'Bring the new checklist' }, id)
    await p.waitForSelector(`${sel}.innew`, { timeout: 5000 })
    const m = await markOf(p, sel)
    await L.pic(w, `A2-day-updated-${sfx}`)
    const notes = await notesFor(p, 1500), sr = await said(p)
    rowOut(`A ${sfx}`, 'A2 the opened day: the input changed', 'card marked again; no "Input updated"; a screen reader told it',
      `after six seconds the first mark was ${reduced ? '(not waited for)' : (gone.innew ? 'STILL ON' : 'gone')}, painted ${gone.painted}; changed: ${JSON.stringify(m)}; notes: ${JSON.stringify(notes)}; sr: "${sr}"`,
      (reduced || (!gone.innew && !gone.painted)) && m.innew && m.painted && m.inView && !notes.length && sr === 'Input updated')
  })

  /* A3 — the month with no day open: the bar */
  await part(w, `A ${sfx}`, 'A3 the month, no day open: its bar', 'the bar marked and painted; no note; no day opens', async () => {
    const { id } = w.A1
    await closeDay(p)
    await L.sleep(reduced ? 300 : 6300)
    /* its window, from the month: a press on its bar where a bar takes one, else its day's card */
    const bar = p.locator(`.ib-bar[data-iid="${id}"]`).first()
    await w.press(bar); await L.sleep(500)
    let how = 'a press on the bar'
    if (!(await p.locator('#inpEditPop #inpEditRmk').count())) {
      how = 'the bar opened its day; its card there, then the day closed with the window up'
      await p.waitForSelector(`[data-testid="idy-row-${id}"]`, { timeout: 4000 })
      await w.press(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`)
      await p.waitForSelector('#inpEditPop #inpEditRmk', { timeout: 6000 })
      await closeDay(p)
    }
    await p.locator('#inpEditPop #inpEditRmk').first().fill('Room 2')
    await w.press('#inpEditSave')
    await p.waitForSelector(`.ib-bar.innew[data-iid="${id}"]`, { timeout: 5000 })
    const m = await markOf(p, `.ib-bar.innew[data-iid="${id}"]`)
    await L.pic(w, `A3-month-bar-${sfx}`)
    const b = await p.locator(`.ib-bar.innew[data-iid="${id}"]`).first().boundingBox()
    if (b) await L.pic(w, `A3-month-bar-close-${sfx}`, { clip: { x: Math.max(0, b.x - 60), y: Math.max(0, b.y - 40), width: Math.min(w.S.w - Math.max(0, b.x - 60), b.width + 120), height: b.height + 80 } })
    const notes = await notesFor(p, 1500), open = await p.locator('.ib-day.is-open').count()
    rowOut(`A ${sfx}`, 'A3 the month, no day open: its bar', 'the bar marked and painted; no note; no day opens',
      `opened by ${how}; bar ${JSON.stringify(m)}; notes: ${JSON.stringify(notes)}; days open: ${open}`,
      m.innew && m.painted && m.inView && !notes.length && open === 0)
  })

  /* A4 — the List */
  await part(w, `A ${sfx}`, 'A4 the List: a new input', 'the row (a desktop) or card (a phone) marked, painted, in view; no note', async () => {
    await w.press('#inListBtn'); await L.sleep(400)
    await w.press('#inNew')
    await p.waitForSelector('#inpEditPop #inpEditType')
    await fillForm(w, { type: 'Appointment', person: 'pike', start: '13:00', end: '14:00' })
    await w.press('#inpEdCal [data-cal="2026-07-16"]')
    await w.press('#inpEditSave')
    await p.waitForSelector('#inBody tr.innew, #inList .icard.innew', { timeout: 5000 })
    const id = await newestId(p)
    const sel = w.phone ? `#inList [data-iid="${id}"]` : `#inBody tr[data-iid="${id}"]`
    await L.sleep(750)                                        // the page comes to the row
    const m = await markOf(p, sel)
    await L.pic(w, `A4-list-added-${sfx}`)
    const notes = await notesFor(p, 1500), sr = await said(p)
    rowOut(`A ${sfx}`, 'A4 the List: a new input', 'the row (a desktop) or card (a phone) marked, painted, in view; no note',
      `${JSON.stringify(m)}; notes: ${JSON.stringify(notes)}; sr: "${sr}"`, m.innew && m.fresh === id && m.painted && m.inView && !notes.length && sr === 'Input added')
    w.A4 = { id, sel }
  })

  /* A5 — a refusal is still said (nothing saved: no mark, the sentence) */
  await part(w, `A ${sfx}`, 'A5 a save refused still says why', 'the refusal\'s own sentence; no mark', async () => {
    await w.press('#inNew')
    await p.waitForSelector('#inpEditPop #inpEditType')
    await w.press('#inpEditSave')
    await L.sleep(350)
    const n = await noteNow(p)
    await L.pic(w, `A5-refused-${sfx}`)
    rowOut(`A ${sfx}`, 'A5 a save refused still says why', 'the refusal\'s own sentence; no mark', `note: "${n}"; the window still open: ${await p.locator('#inpEditPop #inpEditType').count() > 0}`, /Pick a start date/.test(n))
    await p.locator('[data-testid="win-inputedit-x"], #inpEditClose').first().evaluate(e => e.click()); await L.sleep(300)
    const sw = p.locator('[data-testid="inped-swap-go"], [data-testid="inped-leave-go"]'); if (await sw.count()) await sw.first().evaluate(e => e.click())
  })
}

/* A6 — the note is STILL said from the schedule; A7 — a SANS commitment (no mark is drawn there) */
async function stillSaid(w) {
  const p = w.page
  await part(w, `A ${T}`, 'A6 a save made from the Scheduler Board', 'its note is said as before — the Inputs page\'s mark is not there', async () => {
    await L.go(w, 'editsched')
    await p.locator('#eWeek [data-sbday="1"]').first().evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }); e.click() })
    await p.waitForSelector('#schedBoard .sb-sec', { state: 'attached' }); await L.sleep(600)
    await p.locator('#schedBoard [data-inpadd="1.g"]').first().evaluate(e => e.click())
    await p.waitForSelector('#inpEditPop #inpEditType')
    await p.selectOption('#inpEditPop #inpEditType', 'Meeting')
    await w.press('#inpEditSave')
    await L.sleep(400)
    const n = await noteNow(p)
    await L.pic(w, `A6-board-note-${T}`)
    rowOut(`A ${T}`, 'A6 a save made from the Scheduler Board', 'its note is said as before — the Inputs page\'s mark is not there', `note: "${n}"`, n === 'Input added to the Ground Programme')
    const id = await newestId(p)
    w.boardInput = id
  })
}

/* ---------------------------------------------------------------------------------------------------------- D */
async function board(w) {
  const p = w.page
  /* the input's row on the Ground Programme: found by what it IS (the day's own record names the input it came from) */
  const rowOfInput = id => p.evaluate(id => {
    const ri = window.DAYS[1].ground.findIndex(g => String(g.src) === id)
    const ppl = ri < 0 ? null : document.querySelector(`#schedBoard .ppl[data-fill="g:1.${ri}.+"]`)
    return ppl ? { fill: ppl.dataset.fill, people: [...ppl.querySelectorAll('[data-person]')].map(e => e.dataset.person) } : null
  }, id)
  /* a finger or a mouse AT the row's "+ add" (the words are drawn; the row's own box takes the press), then at the man
     in the crew list — on a phone the list is the drawer an armed place brings in */
  const pressAt = async (x, y) => { if (w.phone) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y) }
  const centre = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, innerWidth, innerHeight] }, sel)
  const bring = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (e) e.scrollIntoView({ block: 'center' }) }, sel)
  const armAdd = async fill => {
    const sel = `#schedBoard .ppl[data-fill="${fill}"] .addz`
    await bring(sel); await L.sleep(250)
    const at = await centre(sel)
    await pressAt(at[0], at[1]); await L.sleep(500)
    return p.evaluate(() => window.ARM && window.ARM.key)
  }
  const pickMan = async who => {
    const sel = `#sbRoster .rpuck[data-person="${who}"]`
    await bring(sel); await L.sleep(300)
    const at = await centre(sel)
    if (!at || at[0] < 0 || at[0] > at[2] || at[1] < 0 || at[1] > at[3]) throw new Error(`the crew list is off the screen (${at && at.slice(0, 2).map(Math.round)}) — nothing to tap`)
    await pressAt(at[0], at[1])
  }
  await part(w, `D ${T}`, 'D1 a puck put on an input\'s row', 'he is on the row; no "added to" note', async () => {
    if (!w.boardInput) throw new Error('no input on the board from A6')
    const id = w.boardInput
    const before = await rowOfInput(id)
    if (!before) throw new Error('the input\'s row is not on the board')
    /* arm the row's "+ add", then tap a man in the crew list (the phone's own way; a desktop's too) */
    const free = await p.evaluate(have => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')].map(e => e.dataset.person).filter(x => !have.includes(x) && x !== 'allavail' && x !== 'all')[0], before.people)
    await L.sleep(4600)                                       // the note of the save before has gone
    const armed = await armAdd(before.fill)
    await L.pic(w, `D0-armed-${T}`)
    await pickMan(free)
    const notes = await notesFor(p, 1200)
    const after = await rowOfInput(id)
    await L.pic(w, `D1-puck-added-${T}`)
    rowOut(`D ${T}`, 'D1 a puck put on an input\'s row', 'he is on the row; no "added to" note',
      `armed ${armed}; ${free} put on; the row before ${JSON.stringify(before.people)}, after ${JSON.stringify(after && after.people)}; notes: ${JSON.stringify(notes)}`,
      !!after && after.people.includes(free) && !notes.some(n => /added to/.test(n)) && !notes.length)
    w.put = free
  })
  await part(w, `D ${T}`, 'D2 the same man put on again', 'refused, and it says why — a warning still shows', async () => {
    const id = w.boardInput, row = await rowOfInput(id)
    await armAdd(row.fill)
    await pickMan(w.put)
    await L.sleep(350)
    const n = await noteNow(p)
    await L.pic(w, `D2-already-on-${T}`)
    await p.keyboard.press('Escape')
    rowOut(`D ${T}`, 'D2 the same man put on again', 'refused, and it says why — a warning still shows', `note: "${n}"`, /already on/i.test(n))
    await L.sleep(4500)
  })
  await part(w, `D ${T}`, 'D3 his puck taken off the row', 'he is off the row; no "taken out of" note; Undo brings him back', async () => {
    const id = w.boardInput
    const row = await rowOfInput(id)
    await p.evaluate(([fill, who]) => {
      const puck = document.querySelector(`#schedBoard .ppl[data-fill="${fill}"] [data-person="${who}"]`)
      puck.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    }, [row.fill, w.put])
    const notes = await notesFor(p, 1200)
    const after = await rowOfInput(id)
    await L.pic(w, `D3-puck-taken-off-${T}`)
    await p.evaluate(() => (document.querySelector('#sbUndo') || document.querySelector('#undoBtn')).click()); await L.sleep(500)
    const back = await rowOfInput(id)
    rowOut(`D ${T}`, 'D3 his puck taken off the row', 'he is off the row; no "taken out of" note; Undo brings him back',
      `after ${JSON.stringify(after && after.people)}; notes: ${JSON.stringify(notes)}; after Undo ${JSON.stringify(back && back.people)}`,
      !!after && !after.people.includes(w.put) && !notes.length && !!back && back.people.includes(w.put))
  })
  await part(w, `D ${T}`, 'D4 the board\'s Done', 'the board closes; no "Schedule updated"', async () => {
    await L.sleep(3000)
    await p.evaluate(() => document.querySelector('#sbDone').click())
    const notes = await notesFor(p, 1200)
    const hidden = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return !b || b.hidden || getComputedStyle(b).display === 'none' })
    await L.pic(w, `D4-board-done-${T}`)
    rowOut(`D ${T}`, 'D4 the board\'s Done', 'the board closes; no "Schedule updated"', `the board hidden: ${hidden}; notes: ${JSON.stringify(notes)}`, hidden && !notes.length)
  })
}

/* ---------------------------------------------------------------------------------------------------------- B */
async function cancelled(w) {
  const p = w.page
  const head = () => p.evaluate(() => {
    const win = document.querySelector('[data-testid="win-inputedit"]'), bar = win && win.querySelector('.win-bar')
    if (!bar) return { error: 'no window bar' }
    const r = n => Math.round(n * 10) / 10
    const ttl = bar.querySelector('.win-ttl'), mark = bar.querySelector('[data-testid="inped-cx"]'), x = bar.querySelector('.win-x'), why = bar.querySelector('.icx-why'), tag = bar.querySelector('.icx')
    const g = document.createRange(); g.selectNodeContents(ttl); const tr = g.getBoundingClientRect()
    const mr = mark.getBoundingClientRect(), xr = x.getBoundingClientRect(), br = bar.getBoundingClientRect(), tgr = tag.getBoundingClientRect()
    return { title: ttl.textContent, titleCut: ttl.scrollWidth > ttl.clientWidth + 1, titleR: r(tr.right), tagL: r(tgr.left), gap: r(tgr.left - tr.right), markR: r(mr.right), xL: r(xr.left), xR: r(xr.right), barR: r(br.right),
      why: why ? why.textContent : '', whyCut: why ? why.scrollWidth > why.clientWidth + 1 : false, whyColor: why ? getComputedStyle(why).color : '', inTools: !!mark.closest('.win-tools'),
      order: [...bar.children].map(c => String(c.className).split(' ')[0]) }
  })
  for (const [k, cxr, word] of [['B1', 'Range closed', 'a short reason'], ['B2', 'Range closed for the whole week by the range safety officer after the storm', 'a long reason']]) {
    await part(w, `B ${T}`, `${k} the cancelled input's window — ${word}`, 'the CX tag and the reason follow the title; the ✕ in the corner; nothing overlaps', async () => {
      await inputsCal(w, '2026-07-13')
      const id = `lo-cx-${k}-${T}`
      await p.evaluate(([id, cxr]) => window.fileInput({ iid: id, person: 'pike', type: 'Training', title: 'Range brief', date: 'Jul 15', yr: 2026, allday: false, s: 540, e: 600, cx: true, cxr }), [id, cxr])
      await L.sleep(300)
      await p.locator('[data-icday="2026-07-15"]').focus(); await p.keyboard.press('Enter')
      await p.waitForSelector(`[data-testid="idy-row-${id}"]`)
      await w.press(`[data-testid="idy-row-${id}"] [data-testid="idy-open"]`)
      await p.waitForSelector('[data-testid="win-inputedit"] [data-testid="inped-cx"]', { timeout: 6000 })
      await L.sleep(350)
      const h = await head(), hh = await headOf(w, '[data-testid="win-inputedit"]')
      await L.pic(w, `${k}-cx-window-${T}`, { around: '[data-testid="win-inputedit"] .win-bar', pad: 40 })
      if (k === 'B1') await L.pic(w, `${k}-cx-window-whole-${T}`)
      const ok = !h.error && !h.inTools && h.order.join(',') === 'win-grip,win-ttl,win-mark,win-x' && h.gap >= 0 && h.gap <= 16 && h.markR <= h.xL + 0.5 && !h.titleCut
        && h.barR - h.xR <= 20 && (hh.over || []).length === 0 && (k === 'B1' ? !h.whyCut && h.why === cxr : h.whyCut)
      rowOut(`B ${T}`, `${k} the cancelled input's window — ${word}`, 'the CX tag and the reason follow the title; the ✕ in the corner; nothing overlaps',
        `${JSON.stringify(h)}; overlaps: ${JSON.stringify(hh.over)}`, ok)
      await p.locator('[data-testid="win-inputedit-x"]').first().evaluate(e => e.click()); await L.sleep(250)
      await closeDay(p)
      await p.evaluate(id => { const i = window.INPUTS.findIndex(x => String(x.iid) === id); if (i >= 0) window.fileInput && window.INPUTS.splice(i, 1) }, id)
    })
  }
}

/* ---------------------------------------------------------------------------------------------------------- C */
async function sheets(w) {
  const p = w.page
  const noDoc = async () => { await p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 }); await L.sleep(300); await w.press('[data-testid="docconf-nodoc"]') }
  async function fileMed(type, from, to) {
    await openAdd(w, from)
    await fillForm(w, { type, person: 'bane', allday: true })
    if (to !== from) await p.locator(`#inpEdCal [data-cal="${to}"]`).click()
    await w.press('#inpEditSave')
  }
  const ans = (scope, rowSel) => p.evaluate(([scope, rowSel]) => {
    const root = document.querySelector(scope)
    if (!root) return { error: 'no sheet ' + scope }
    const row = root.querySelector(rowSel), a = row && row.querySelector('.upconf-ans')
    if (!a) return { error: 'no answers in ' + rowSel, seg: !!root.querySelector('.seg') }
    const st = getComputedStyle(a), r = a.getBoundingClientRect(), rr = row.getBoundingClientRect(), words = row.querySelector('span:not(.upconf-ans)').getBoundingClientRect()
    const btns = [...a.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return { t: b.textContent, l: Math.round(q.left), r: Math.round(q.right), top: Math.round(q.top), h: Math.round(q.height) } })
    return { seg: !!root.querySelector('.seg'), bg: st.backgroundColor, lineUnder: st.borderBottomWidth, pad: st.padding, ansTop: Math.round(r.top), wordsBottom: Math.round(words.bottom), wordsTop: Math.round(words.top),
      rowRight: Math.round(rr.right - parseFloat(getComputedStyle(row).paddingRight)), lastRight: btns.length ? btns[btns.length - 1].r : null, btns }
  }, [scope, rowSel])
  await inputsCal(w, '2026-07-13')
  await part(w, `C ${T}`, 'C1 the medical-clash question', 'its two answers flat — no patch, no line — on a line of their own at the right', async () => {
    await fileMed('ATT C', '2026-07-13', '2026-07-15'); await noDoc()
    await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(7000); await closeDay(p)
    await fileMed('ATT B', '2026-07-14', '2026-07-16')
    await Promise.race([p.waitForSelector('[data-testid="medclash"]', { timeout: 8000 }), p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 })])
    if (await p.locator('[data-testid="docconf"]').count()) { await w.press('[data-testid="docconf-nodoc"]'); await p.waitForSelector('[data-testid="medclash"]', { timeout: 8000 }) }
    await L.sleep(450)
    const a = await ans('[data-testid="medclash"]', '[data-testid="medclash-0"]')
    await L.pic(w, `C1-medclash-${T}`, { around: '[data-testid="medclash"] .airpop-box', pad: 30 })
    const flat = !a.error && !a.seg && /rgba\(0, 0, 0, 0\)|transparent/.test(a.bg) && a.lineUnder === '0px' && a.pad === '0px'
    rowOut(`C ${T}`, 'C1 the medical-clash question', 'its two answers flat — no patch, no line — on a line of their own at the right',
      JSON.stringify(a), flat && a.ansTop >= a.wordsBottom && Math.abs(a.lastRight - a.rowRight) <= 2 && a.btns.length === 2)
    /* an answer picked, then the sheet put away */
    await w.press('[data-testid="medclash-0"] .upconf-ans button'); await L.sleep(200)
    await L.pic(w, `C1b-medclash-picked-${T}`, { around: '[data-testid="medclash"] .airpop-box', pad: 30 })
    await p.locator('[data-testid="medclash"] .airpop-foot .abtn.ghost').click(); await L.sleep(300)
    await p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {}); await L.sleep(300)
    const sw = p.locator('[data-testid="inped-swap-go"], [data-testid="inped-leave-go"]'); if (await sw.count()) await sw.first().click().catch(() => {})
    await closeDay(p)
  })
  await part(w, `C ${T}`, 'C2 the upchit question', 'Keep / Remove flat at the right of the entry\'s box — no patch, no line', async () => {
    await fileMed('ATT B', '2026-07-17', '2026-07-18'); await noDoc()
    await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300); await closeDay(p)
    await openAdd(w, '2026-07-14')
    await p.selectOption('#inpEditPop #inpEditType', 'Upchit'); await p.selectOption('#inpEditPop #inpEditPerson', 'bane'); await L.sleep(300)
    await w.press('#inpEditSave')
    await Promise.race([p.waitForSelector('[data-testid="upconf"]', { timeout: 8000 }), p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 })])
    if (await p.locator('[data-testid="docconf"]').count()) { await w.press('[data-testid="docconf-nodoc"]'); await p.waitForSelector('[data-testid="upconf"]', { timeout: 8000 }) }
    await L.sleep(450)
    const a = await ans('[data-testid="upconf"]', '[data-testid="upconf-left-0"]')
    await L.pic(w, `C2-upchit-${T}`, { around: '[data-testid="upconf"] .airpop-box', pad: 30 })
    const flat = !a.error && !a.seg && /rgba\(0, 0, 0, 0\)|transparent/.test(a.bg) && a.lineUnder === '0px' && a.pad === '0px'
    rowOut(`C ${T}`, 'C2 the upchit question', 'Keep / Remove flat at the right of the entry\'s box — no patch, no line',
      JSON.stringify(a), flat && Math.abs(a.lastRight - a.rowRight) <= 2 && a.btns.length === 2 && a.btns[0].top === a.btns[1].top)
    await w.press('[data-testid="upconf-left-0"] .upconf-ans button'); await L.sleep(200)
    await L.pic(w, `C2b-upchit-picked-${T}`, { around: '[data-testid="upconf"] .airpop-box', pad: 30 })
    await p.locator('[data-testid="upconf"] .airpop-foot .abtn.ghost').click(); await L.sleep(300)
  })
}

/* ------------------------------------------------------------------------------------------------------- run */
const w = await L.world(SIZE)
try {
  if (want('A')) { await marks(w); await stillSaid(w) }
  if (want('D')) { if (!w.boardInput) await stillSaid(w); await board(w) }
  if (want('B')) await cancelled(w)
  if (want('C')) await sheets(w)
} finally { await L.close(w) }

/* a reader who asked for less motion, and a member — each in a world of its own */
if (want('A') || want('R')) {
  const r = await L.world(SIZE)
  try { await r.page.emulateMedia({ reducedMotion: 'reduce' }); await marks(r, { reduced: true, tag: '-lessmotion' }) } finally { await L.close(r) }
}
if (want('A') || want('M')) {
  const m = await L.world(SIZE, { who: ['us', 'us'] })
  try {
    const p = m.page
    await part(m, `A ${T}-member`, 'A8 a member files his own input from a day', 'card marked, painted, in view; no note', async () => {
      await inputsCal(m, '2026-07-13')
      await openAdd(m, '2026-07-14')
      await p.selectOption('#inpEditPop #inpEditType', 'Appointment')
      await p.fill('#inpEditPop #inpEditStart', '15:00'); await p.fill('#inpEditPop #inpEditEnd', '16:00')
      await m.press('#inpEditSave')
      await p.waitForSelector('[data-testid="win-inputsday"] .icard.innew', { timeout: 5000 })
      const id = await newestId(p), mk = await markOf(p, `[data-testid="idy-row-${id}"]`)
      await L.pic(m, `A8-member-day-added-${T}`)
      const notes = await notesFor(p, 1500)
      rowOut(`A ${T}-member`, 'A8 a member files his own input from a day', 'card marked, painted, in view; no note', `${JSON.stringify(mk)}; notes: ${JSON.stringify(notes)}`, mk.innew && mk.painted && mk.inView && !notes.length)
    })
  } finally { await L.close(m) }
}
