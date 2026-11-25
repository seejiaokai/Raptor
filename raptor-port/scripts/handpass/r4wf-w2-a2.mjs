// r4wf second walk, task A, part 2 (25 Nov 26) — W9 (a row taken off another section while a value is half typed),
// W10's re-ordered day (Personal Inputs dragged above the Ground Programme by its grip, then typing with Tab), W5 (a)'s
// Undo / Redo of that drag (the caret cannot be kept through the press — see r4wf-w2-a.mjs KEEP). Each line asserts the
// RIGHT behaviour, or says RECORD.
//   WR4_OUT=<dir> WR4_NEW=<build> SZ=desk|phone ENG=chromium|webkit ONLY=<order,…> node scripts/handpass/r4wf-w2-a2.mjs
import * as L from './wr4-lib.mjs'
const { newPage, signIn, go, sleep, bundleOf, log, finish, facts } = L
const J = JSON.stringify
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', tag = `${SZ}-${ENG}`
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const res = []
const add = (id, verdict, what, pic = '') => { res.push([id, verdict, what, pic]); console.log('RESULT', id, '|', verdict, '|', String(what).slice(0, 900), '|', pic) }
let W = null
const P = () => W.page
const pic = async name => { const f = `a2-${tag}-${name}.png`; await P().screenshot({ path: `${process.env.WR4_OUT}/${f}` }); return f }
async function world() { if (W) await W.ctx.close().catch(() => {}); W = await newPage(SZ, undefined, L.NEW_DIR, ENG); await signIn(W, 'ad'); log(tag, 'bundle ' + await bundleOf(P())); return W }
const tapOrClick = async loc => { const l = loc.first(); await l.scrollIntoViewIfNeeded(); if (W.tap) await l.tap(); else await l.click(); await sleep(300) }
async function board(di) { await go(P(), 'editsched'); await P().evaluate(d => window.openScheduler(d), di); await sleep(900) }
async function openPI() {
  const shut = await P().evaluate(() => { const s = document.querySelector('#sbBoard > [data-secmove$=".inputs"]'); return s ? ![...s.querySelectorAll('[data-ifld]')].some(e => e.getBoundingClientRect().height > 0) : false })
  if (shut) { const t = P().locator('#schedBoard [data-pitog]').first(); if (await t.count()) await tapOrClick(t) }
}
const secs = () => P().evaluate(() => [...document.querySelectorAll('#sbBoard > *')].map(e => e.getAttribute('data-secmove') || e.className.split(' ').slice(0, 2).join('.')))
const once = s => new Set(s).size === s.length
const gkOf = (di, iid) => P().evaluate(([di, id]) => { const ri = (window.DAYS[di].ground || []).findIndex(r => r.src === id); return ri < 0 ? null : `gr:${di}.${ri}` }, [di, iid])
const val = sel => P().evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 2); return e ? (e.value ?? e.textContent) : null }, sel)
async function typeTab(sel, v) {
  const b = P().locator(sel).first(); await b.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(150)
  if (W.tap) await b.tap(); else await b.click(); await sleep(200)
  await P().keyboard.press('Control+A'); await P().keyboard.type(v)
  await P().evaluate(() => { window.__w2tops = new Map(); for (const e of document.querySelectorAll('#schedBoard input, #schedBoard textarea')) window.__w2tops.set(e, e.getBoundingClientRect().top) })
  await P().keyboard.press('Tab'); await sleep(550)
  return P().evaluate(() => { const a = document.activeElement; const t0 = window.__w2tops.get(a); return { focus: (a?.getAttribute('data-ifld') || a?.getAttribute('data-bfld') || a?.tagName) + (a?.closest('#schedBoard') ? '@board' : ''), moved: t0 == null ? 'new node or none' : Math.round((a.getBoundingClientRect().top - t0) * 10) / 10 } })
}
async function order(name, fn) { if (ONLY.length && !ONLY.includes(name)) return; try { await fn() } catch (e) { add(`${name} ${tag}`, 'ERROR', e.message.split('\n')[0].slice(0, 300)); await pic(`${name}-error`).catch(() => {}) } }

/* W9 — two inputs on the Ground Programme; "xyz" typed in the LOWER one's Ground Programme remarks (not left); Reject
   pressed on the UPPER one under Personal Inputs. EXPECTED (sourced): "xyz" ends on the row it was typed in, once. */
await order('W9', async () => {
  await world()
  const up = await L.fileInput(W, tag, L.WED, { type: 'Training', people: [L.RANGER], from: '06:00', to: '07:00', title: 'Upper brief' })
  const lo = await L.fileInput(W, tag, L.WED, { type: 'Training', people: [L.RANGER], from: '07:10', to: '07:50', title: 'Lower brief' })
  await board(2); await openPI()
  const gl = await gkOf(2, lo)
  const r = P().locator(`#schedBoard [data-bfld="${gl}.rmks"]`).first(); await r.evaluate(el => el.scrollIntoView({ block: 'center' }))
  if (W.tap) await r.tap(); else await r.click(); await sleep(200)
  await P().keyboard.type('xyz')
  const f0 = await pic('W9-typed')
  const rej = P().locator(`#sbBoard > [data-secmove$=".inputs"] [data-ifld^="${up}"]`).first().locator('xpath=ancestor::*[contains(@class,"sb-arow") or self::tr][1]').locator('button').filter({ hasText: /Reject/i })
  if (!(await rej.count())) return add(`W9 ${tag}`, 'NOT WALKED', 'no Reject button on the upper input\'s Personal Inputs row')
  const top = await rej.first().evaluate(el => Math.round(el.getBoundingClientRect().top))
  if (W.tap) await rej.first().tap(); else await rej.first().click()
  const f1 = await pic('W9-after-reject'); await sleep(600)
  await P().mouse.click(3, 3).catch(() => {}); await sleep(500)
  const recs = await P().evaluate(([a, b]) => [a, b].map(id => { const r = window.INPUTS.find(x => String(x.iid) === String(id)); return r ? { title: r.title, acc: r.acc, rej: r.rej ?? r.rejected ?? null, remarks: r.remarks } : null }), [up, lo])
  const glNow = await gkOf(2, lo)   // the upper's row gone, the lower's Ground Programme row moves up one place
  const xyzRows = (await P().evaluate(() => [...document.querySelectorAll('#schedBoard input, #schedBoard textarea')].filter(e => /xyz/.test(e.value)).map(e => e.getAttribute('data-bfld') || e.getAttribute('data-ifld'))))
  const day = await P().evaluate(() => (window.DAYS[2].ground || []).filter(g => /xyz/.test(JSON.stringify(g))).map(g => ({ src: g.src, prog: g.prog, rmks: g.rmks })))
  add(`W9 ${tag} "xyz" half typed in the lower input's Ground Programme remarks, Reject pressed on the upper — "xyz" once, on the lower row`, xyzRows.every(k => k.startsWith(glNow + ".") || k.startsWith(lo + ".")) && day.length <= 1 && (!day.length || day[0].src === lo) ? 'RECORD (sourced part holds)' : 'FAIL', J({ rejectAt: top, inputs: recs, boxesHoldingXyz: xyzRows, groundRowsHoldingXyz: day }), `${f0}, ${f1}, ${await pic('W9-settled')}`)
})
/* W10 + W5 (a) — Personal Inputs dragged by its grip above the Ground Programme ("Set as default" declined); W1's
   start / end typed with Tab; then the Board's Undo and Redo of the drag (no caret: the press takes it) */
await order('W10d', async () => {
  await world()
  const iid = await L.fileInput(W, tag, L.WED, { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
  await board(2); await openPI()
  const s0 = await secs()
  const grip = P().locator('#sbBoard > [data-secmove$=".inputs"] .secgrip').first()
  const tgt = P().locator('#sbBoard > [data-secmove$=".ground"]').first()
  await tgt.evaluate(el => el.scrollIntoView({ block: 'center' })); await sleep(300)
  const a = await grip.boundingBox(), b = await tgt.boundingBox()
  if (!a || !b) return add(`W10d ${tag}`, 'NOT WALKED', 'grip or target not on screen')
  await P().mouse.move(a.x + a.width / 2, a.y + a.height / 2); await P().mouse.down()
  for (let i = 1; i <= 14; i++) await P().mouse.move(a.x + a.width / 2, a.y + (b.y + 6 - a.y) * i / 14)
  await P().mouse.up(); await sleep(700)
  const asked = P().getByRole('button', { name: /^(No|Not now|Just this day|Only this day|Keep)/i })
  if (await asked.count()) { await asked.first().click().catch(() => {}); await sleep(400) }
  const s1 = await secs(); const f1 = await pic('W10d-dragged')
  const moved = s1.indexOf('2.inputs') < s1.indexOf('2.ground')
  add(`W10d ${tag} Personal Inputs dragged above the Ground Programme by its grip`, moved && once(s1) ? 'PASS' : (moved ? 'FAIL' : 'NOT MADE'), J({ before: s0, after: s1 }), f1)
  if (!moved) return
  await openPI()
  const gk = await gkOf(2, iid)
  const steps = []
  for (const [f, v, want] of [['str', '0900', '09:00'], ['end', '1130', '11:30']]) {
    const m = await typeTab(`#schedBoard [data-ifld="${iid}.${f}"]`, v)
    const g = await val(`#schedBoard [data-bfld="${gk}.${f}"]`), s = await secs()
    steps.push({ f, typed: v, ground: g, caret: m, once: once(s), order: s.join(' ') })
  }
  const ok = steps.every(s => s.once && s.caret.focus.endsWith('@board')) && steps[0].ground === '09:00' && steps[1].ground === '11:30'
  add(`W10d ${tag} the re-ordered day: start 0900 and end 1130 typed with Tab — the Ground Programme row reads each at once, each section once`, ok ? 'PASS' : 'FAIL', J(steps), await pic('W10d-typed'))
  /* W5 (a): Undo and Redo of the drag, pressed (the caret first put back in a box, which the press takes) */
  await P().mouse.click(3, 3).catch(() => {}); await sleep(400)
  const undo = P().locator('#sbUndo'), redo = P().locator('#sbRedo')
  const seq = []
  for (let i = 0; i < 3; i++) { if (await undo.isEnabled().catch(() => false)) { await tapOrClick(undo); await sleep(600); seq.push({ undo: i + 1, secs: await secs() }) } }
  const fu = await pic('W5a-after-undos')
  for (let i = 0; i < 3; i++) { if (await redo.isEnabled().catch(() => false)) { await tapOrClick(redo); await sleep(600); seq.push({ redo: i + 1, secs: await secs() }) } }
  const fr = await pic('W5a-after-redos')
  add(`W5a ${tag} Undo three times, then Redo three times, after the drag and the two times: each section once at every step`, seq.length && seq.every(x => once(x.secs)) ? 'PASS' : 'FAIL', J(seq.map(x => ({ ...x, secs: x.secs.join(' ') }))), `${fu}, ${fr}`)
})
/* W11 (frozen) — a day with an issued version: the plans selector's read-only row pressed (the frozen look), a box
   tried; back to live by the selector; a time typed and Tab on the live day */
await order('W11f', async () => {
  await world()
  let di = -1
  for (let d = 0; d < 7 && di < 0; d++) {
    await board(d)
    const m = P().locator('#schedBoard [data-planmenu]:visible').first()
    if (!(await m.count())) continue
    await tapOrClick(m)
    if (await P().locator('[data-planpv]:visible').count()) di = d; else { await P().keyboard.press('Escape'); await sleep(300) }
  }
  if (di < 0) {
    /* none issued: Wednesday published through the Board (the four sign-offs, Publish day), then a live change made */
    await P().keyboard.press('Escape'); await sleep(300)
    await board(2)
    for (const role of ['cur', 'sked', 'plan', 'appr']) {
      const sel = P().locator(`#schedBoard select[data-sign="${role}"][data-signday="2"]:visible`).first()
      if (!(await sel.count())) continue
      const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
      await sel.selectOption(opts[0]); await sleep(250)
    }
    const pub = P().locator('#schedBoard [data-beak="2"]:visible').first()
    if (!(await pub.count()) || await pub.isDisabled()) return add(`W11f ${tag}`, 'NOT WALKED', 'no issued version in the week, and Publish day could not be pressed on Wed 15 Jul')
    await tapOrClick(pub); await sleep(800)
    const ok = P().getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
    if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(700) }
    await L.answerAsks(W)
    log(tag, 'published Wed: ' + J(await L.shownToast(P())))
    const k = await P().evaluate(() => [...document.querySelectorAll('#sbBoard input[data-bfld^="gr:"][data-bfld$=".str"]')].find(e => e.getBoundingClientRect().width > 0)?.getAttribute('data-bfld'))
    if (k) await typeTab(`#schedBoard [data-bfld="${k}"]`, '0555')
    await P().mouse.click(3, 3).catch(() => {}); await sleep(400)
    const m = P().locator('#schedBoard [data-planmenu]:visible').first(); await tapOrClick(m)
    if (await P().locator('[data-planpv]:visible').count()) di = 2
  }
  if (di < 0) return add(`W11f ${tag}`, 'NOT WALKED', 'no day of the week has an issued version to look at, and publishing Wed gave none')
  const ver = await P().locator('[data-planpv]:visible').first().getAttribute('data-planpv')
  await tapOrClick(P().locator('[data-planpv]:visible').first()); await sleep(600)
  const frozen = await P().evaluate(() => ({ dprev: [...(window.DPREV || [])], boxes: [...document.querySelectorAll('#sbBoard input, #sbBoard textarea, #sbBoard [contenteditable="true"]')].filter(e => e.getBoundingClientRect().width > 0 && !e.readOnly && !e.disabled && e.type !== 'checkbox').length }))
  const f1 = await pic('W11f-frozen')
  /* a box tried on the frozen look: the first visible time box, typed into */
  const tb = P().locator('#sbBoard input:visible').first()
  let typed = null
  if (await tb.count()) { const v0 = await tb.inputValue().catch(() => null); await tb.click({ timeout: 3000 }).catch(() => {}); await P().keyboard.type('1234'); await P().keyboard.press('Tab'); await sleep(400); typed = { before: v0, after: await tb.inputValue().catch(() => null) } }
  /* back to live */
  const m = P().locator('#schedBoard [data-planmenu]:visible').first(); await tapOrClick(m)
  const live = P().locator('[data-plangolive]:visible').first(); if (await live.count()) await tapOrClick(live); else await P().keyboard.press('Escape')
  await sleep(600)
  const liveBoxes = await P().evaluate(() => [...document.querySelectorAll('#sbBoard input[data-bfld$=".str"]')].filter(e => e.getBoundingClientRect().width > 0 && !e.readOnly).map(e => e.getAttribute('data-bfld')))
  let liveSave = null
  if (liveBoxes.length) {
    const k = liveBoxes[0]
    const r = await typeTab(`#schedBoard [data-bfld="${k}"]`, '0610')
    liveSave = { box: k, now: await val(`#schedBoard [data-bfld="${k}"]`), caret: r }
  }
  const f2 = await pic('W11f-live-again')
  const ok = frozen.boxes === 0 && (!typed || typed.before === typed.after) && liveSave && liveSave.now === '06:10' && liveSave.caret.focus.endsWith('@board')
  add(`W11f ${tag} day ${di}: issued version ${ver} looked at from the plans selector — no box takes typing; back to live, 0610 typed and Tab saves`, ok ? 'PASS' : 'FAIL', J({ frozen, typedOnFrozen: typed, liveSave }), `${f1}, ${f2}`)
})
/* OTHER — the other places that should show a change made on the Board: an input's start, end and remark typed under
   Personal Inputs with Tab; the Board closed by ✓ Done; the week's rows; the Inputs page's day window; the bell, as the
   scheduler and as Ranger. RECORD each, beside main's; EXPECTED (the saved input): 09:00–11:30 "bring kit" everywhere */
await order('OTHER', async () => {
  await world()
  const iid = await L.fileInput(W, tag, L.WED, { type: 'Training', people: [L.RANGER], from: '08:00', to: '10:00', title: 'Range brief' })
  await board(2); await openPI()
  for (const [f, v] of [['str', '0900'], ['end', '1130'], ['rmks', 'bring kit']]) await typeTab(`#schedBoard [data-ifld="${iid}.${f}"]`, v)
  const gk = await gkOf(2, iid)
  const onBoard = { ground: [await val(`#schedBoard [data-bfld="${gk}.str"]`), await val(`#schedBoard [data-bfld="${gk}.end"]`), await val(`#schedBoard [data-bfld="${gk}.rmks"]`)] }
  await P().mouse.click(3, 3).catch(() => {}); await sleep(300)
  await tapOrClick(P().locator('#sbDone:visible').first()); await sleep(700)
  const week = await P().evaluate(([gk, id]) => { const t = s => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0) || document.querySelector(s); return e ? (e.value ?? e.textContent).trim() : null }; return { ground: [t(`#eWeek [data-txt="${gk}.str"]`), t(`#eWeek [data-txt="${gk}.end"]`), t(`#eWeek [data-txt="${gk}.rmks"]`)], inputRow: [t(`#eWeek [data-inp="${id}.str"]`), t(`#eWeek [data-inp="${id}.end"]`)] } }, [gk, iid])
  const fw = await pic('OTHER-week')
  await L.openDay(W, L.WED)
  const card = await P().evaluate(id => (document.querySelector(`[data-testid="win-inputsday"] [data-iid="${id}"], [data-testid="win-inputsday"] [data-popiid="${id}"]`)?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 160), iid)
  const fi = await pic('OTHER-inputs-day')
  if (await P().locator('[data-testid="win-inputsday-x"]').count()) await tapOrClick(P().locator('[data-testid="win-inputsday-x"]'))
  const bellAd = (await L.openBell(W)).slice(0, 4).map(l => `${l.name} ${l.day} / ${l.what}`)
  const fb = await pic('OTHER-bell-scheduler')
  await P().keyboard.press('Escape').catch(() => {}); await sleep(300)
  W = await L.handOver(W, SZ, 'us')
  const bellUs = (await L.openBell(W)).slice(0, 4).map(l => `${l.name} ${l.day} / ${l.what}`)
  const fu = await pic('OTHER-bell-ranger')
  const rec = await L.recOf(P(), iid)
  const ok = onBoard.ground.join() === '09:00,11:30,bring kit' && rec.s === 540 && rec.e === 690 && /bring kit/.test(rec.remarks || '')
  add(`OTHER ${tag} the input changed on the Board (09:00–11:30 "bring kit") — the Board's row, the week, the Inputs page, the bell (RECORD each)`, ok ? 'PASS (stored and on the Board); the rest RECORD' : 'FAIL', J({ onBoard, week, inputsDayCard: card, bellScheduler: bellAd, bellRanger: bellUs, stored: [rec.s, rec.e, rec.remarks] }), `${fw}, ${fi}, ${fb}, ${fu}`)
})
facts.results = res
await finish()
console.log('errors:', facts.errors.length, J(facts.errors.slice(0, 6)))
