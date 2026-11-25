// G — the end-time guard rail (his rule of 25 Nov 26): a day cannot be published, or signed off, while any item on it has a
// start and no end; each empty end box is outlined in red from the moment the start is typed; only Publish and the four
// sign-off boxes are refused, Publish saying how many items have no end time.
//
// Staging, through the app's own controls on the DESKTOP (typing never happens on the phone, which zooms to a typed box):
// Thursday saved as a day template and applied to Saturday 18 Jul (Templates); Hunter put on wave 1 VL's front seat and
// Ranger on its back seat (a tap on the seat, a tap on the name); VL's landing cleared; Ridge put on the SXO desk and its
// END cleared. The store is then handed to the phone (the browser's saved state), so both sizes picture the same day.
// Thursday's template also brings the demo's AMT sim lines BRIEF 11:00 and DEBRIEF 12:30, each typed with a start and no
// end: they are items of the rule as recorded, so they are drawn outlined too, and counted (a QUESTION in drafts.md).
//
// The proposed red edge is ONE class added to the empty end boxes the app drew, `gw-noend`, with the exact rule below:
// the shape of the app's own resting mark on a take-off / landing pair (`.badtm`: a 1px inset edge on the week's cell, the
// border of the board's box) in the app's warning red (`--hard`, #F0555F) — the red the app already puts on these same
// boxes when their warning is tapped (`.badtm.wfoc`) and on the Logic page's refused value box (`.lgin.bad`).
//
// The refusal note: no control refuses Publish or a sign-off box with a note today (a greyed "Publish day" says why only in
// its hover words; a press on it does nothing). So the refusal is raised through the app's own note with its built
// 'blocked' kind (the grey "Blocked:" note, D1667–D1669) and the drafted words, as the 5 Nov 26 refusal drawings raised the
// notes no control reached. The real publish is pressed first and its real note pictured as "today".
//
// Run from raptor-port/, against the live build served on a free port:  GW_URL=http://localhost:4791/ node docs/mock/2026-11-25-guardrail-wording/draw-g.mjs
import * as K from './kit.mjs'

export const W = {
  /* the items named the way the warning list names them: the line's name, then its start */
  items: ['VL SAT (T/O 12:45)', 'SXO 08:00', 'AMT BRIEF 11:00', 'AMT DEBRIEF 12:30'],
  g3named: n => `Blocked: ${n.length} items have no end time: ${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}. Saturday was not published.`,
  g3count: n => `Blocked: ${n.length} items have no end time, each outlined in red. Saturday was not published.`,
  g4: n => `Blocked: ${n.length} items have no end time, each outlined in red. Type their ends, then sign.`,
}
const NOEND_CSS = `.gw-noend{box-shadow:inset 0 0 0 1px var(--hard)!important;border-radius:4px}
input.tm.gw-noend{border-color:var(--hard)!important;box-shadow:none!important}`

async function stage(p) {
  await K.go(p, 'editsched')
  const open = async di => { const t = p.locator(`[data-daytplopen="${di}"]`); await t.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.wait(p, 300); await t.click(); await K.wait(p, 600) }
  await open(3)
  await p.getByText('Save this day as a template').click(); await K.wait(p, 600)
  await p.getByRole('button', { name: 'Done' }).click(); await K.wait(p, 400)
  await open(5)
  await p.locator('[data-daytplpick="dt1"]').click(); await K.wait(p, 800)
  const put = async (slot, who) => {
    const seat = p.locator(`#eWeek [data-slot="${slot}"], #eWeek [data-fill="${slot}.+"]`).filter({ visible: true }).first()
    await seat.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.wait(p, 200)
    await seat.click(); await K.wait(p, 500)
    const chip = p.locator(`#eRoster .rpuck[data-person="${who}"]`).first()
    await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await chip.click(); await K.wait(p, 600)
    await p.keyboard.press('Escape'); await K.wait(p, 300)
  }
  await put('5.0.0.0.p', 'prowler')
  await put('5.0.0.0.w', 'bane')
  await K.setTxt(p, '#eWeek [data-txt="ff:5.0.0.ld"]', '')
  await put('d:5.0.1', 'razer')
  await K.setTxt(p, '#eWeek [data-txt="dr:5.0.1.end"]', '')
  const st = await p.evaluate(() => { const d = window.DAYS[5], f = d.waves[0].formations[0], r = d.dutywaves[0].rows[1]
    return { vl: { to: f.to, ld: f.ld, p: f.aircraft[0].p, w: f.aircraft[0].w }, sxo: { id: r.id, str: r.str, end: r.end }, amt: d.sims.amt.map(s => s.label + ' ' + s.str + '-' + s.end) } })
  if (st.vl.p !== 'prowler' || st.vl.ld !== '' || st.sxo.id !== 'razer' || st.sxo.end !== '') throw new Error('staging did not land: ' + JSON.stringify(st))
  return st
}

/* every empty end box on Saturday whose start is typed, as the app drew it — the week's spans or the board's boxes */
const findNoEnd = (p, root) => p.evaluate(root => {
  const vis = e => e.getBoundingClientRect().width > 0
  const val = e => (e.tagName === 'INPUT' ? e.value : e.textContent).trim()
  const out = []
  const attr = root === '#schedBoard' ? 'data-bfld' : 'data-txt'
  for (const e of document.querySelectorAll(`${root} [${attr}]`)) {
    if (!vis(e)) continue
    const k = e.getAttribute(attr)
    const m = /^(?:(ff|dr|sr|gr|pr|ar):)?(5\.[^ ]*?)\.(ld|end)$/.exec(k); if (!m) continue
    if (root !== '#schedBoard' && !m[1]) continue
    const sk = k.replace(/\.(ld|end)$/, m[3] === 'ld' ? '.to' : '.str')
    const s = document.querySelector(`${root} [${attr}="${sk}"]`)
    if (val(e) === '' && s && val(s) !== '') { e.setAttribute('data-gwne', k); out.push(k + ' (start ' + val(s) + ')') }
  }
  return out
}, root)

async function weekDay5(p, sz) {
  await K.go(p, 'editsched')
  if (K.isPhone(sz)) {
    /* the phone's week shows one day at a time: bring Saturday to the front by its own day arrows */
    for (let i = 0; i < 8; i++) {
      const front = await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day')].find(e => { const r = e.getBoundingClientRect(); return r.left >= -5 && r.left < 60 && r.width > 0 }); return d ? d.getAttribute('data-day') : null })
      if (front === '5') break
      const nx = p.locator('#eWeek .wk-next:visible, [data-daynav="next"]:visible, .dnav-next:visible').first()
      if (await nx.count()) { await nx.click(); await K.wait(p, 700) } else {
        await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); d && d.scrollIntoView({ inline: 'start' }) }); await K.wait(p, 700); break
      }
    }
  }
}

async function run(key, statePath) {
  const { b, ctx, p, sz } = await K.world(key, statePath)
  await K.signIn(p)
  await p.addStyleTag({ content: NOEND_CSS })
  let st = null
  let saved = null
  if (!statePath) { st = await stage(p); K.fact('G', sz.name, 'staged Saturday', st); saved = await K.saveState(ctx, 'g-staged') }
  await weekDay5(p, sz)
  await K.hideNote(p)

  /* ---------- G1 / G2 on Edit Schedule's week ---------- */
  const ne = await findNoEnd(p, '#eWeek')
  K.fact('G', sz.name, 'week: empty end boxes with a start (today)', ne)
  const front = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < innerWidth }).map(e => e.getAttribute('data-day')))
  K.fact('G', sz.name, 'days in view', front)
  const scrollTo = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); e && e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, sel)
  /* G1: the flight */
  const LD = '#eWeek [data-txt="ff:5.0.0.ld"]', TO = '#eWeek [data-txt="ff:5.0.0.to"]', SEATP = '#eWeek [data-slot="5.0.0.0.p"]', SEATW = '#eWeek [data-slot="5.0.0.0.w"]'
  await scrollTo(LD); await K.wait(p, 400); await K.neutral(p)
  const g1sels = [LD, TO, SEATP, SEATW, '#eWeek [data-txt="ff:5.0.0.cs"]']
  await K.markEl(p, LD, '1')
  await K.shot(p, sz, 'g1-today', g1sels, 26)
  await p.evaluate(() => document.querySelectorAll('[data-gwne]').forEach(e => e.classList.add('gw-noend')))
  await K.ringsOff(p); await K.shot(p, sz, 'g1-proposed', g1sels, 26)
  await K.unmark(p)
  /* G2: the duty desk */
  const END = '#eWeek [data-txt="dr:5.0.1.end"]', STR = '#eWeek [data-txt="dr:5.0.1.str"]', DESK = '#eWeek [data-slot="d:5.0.1"]', ROLE = '#eWeek [data-txt="dr:5.0.1.role"]'
  await p.evaluate(() => document.querySelectorAll('.gw-noend').forEach(e => e.classList.remove('gw-noend')))
  await scrollTo(END); await K.wait(p, 400)
  await K.markEl(p, END, '2')
  const g2sels = [END, STR, DESK, ROLE, '#eWeek [data-txt="dr:5.0.0.role"]', '#eWeek [data-txt="dr:5.0.2.end"]']
  await K.shot(p, sz, 'g2-today', g2sels, 22)
  await p.evaluate(() => document.querySelectorAll('[data-gwne]').forEach(e => e.classList.add('gw-noend')))
  await K.ringsOff(p); await K.shot(p, sz, 'g2-proposed', g2sels, 22)
  await K.unmark(p)
  /* the demo's own AMT sim lines, typed with a start and no end (the QUESTION) */
  await p.evaluate(() => document.querySelectorAll('.gw-noend').forEach(e => e.classList.remove('gw-noend')))
  const SB = '#eWeek [data-txt="sr:5.amt.0.end"]', SD = '#eWeek [data-txt="sr:5.amt.2.end"]'
  await scrollTo(SB); await K.wait(p, 400)
  await K.markEl(p, SB, '3'); await K.markEl(p, SD, '4')
  const gssels = [SB, SD, '#eWeek [data-txt="sr:5.amt.0.label"]', '#eWeek [data-txt="sr:5.amt.1.end"]', '#eWeek [data-txt="sr:5.amt.2.label"]']
  await K.shot(p, sz, 'g2b-sims-today', gssels, 22)
  await p.evaluate(() => document.querySelectorAll('[data-gwne]').forEach(e => e.classList.add('gw-noend')))
  await K.ringsOff(p); await K.shot(p, sz, 'g2b-sims-proposed', gssels, 22)
  await K.unmark(p)
  await p.evaluate(() => document.querySelectorAll('.gw-noend').forEach(e => e.classList.remove('gw-noend')))

  /* ---------- G4: a sign-off box (proposed first: nothing is signed by it) ---------- */
  const SIGN = '#eWeek [data-signbar="5"]', BEAK = '#eWeek [data-beak="5"]', DOW = '#eWeek .dow[data-crewday="5"], #eWeek .dow[data-dayinfo="5"]'
  await p.evaluate(sel => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'end' }); window.scrollBy(0, 60) }, SIGN); await K.wait(p, 400)
  const beakToday = await p.evaluate(sel => { const e = document.querySelector(sel); return e ? { disabled: e.disabled, title: e.title, text: e.textContent } : null }, BEAK)
  K.fact('G3', sz.name, 'Publish day before signing (today)', beakToday)
  /* today's refusal of Publish for another reason: the greyed button and its hover words, drawn under it by the script
     (a browser never paints hover words) */
  await K.markEl(p, BEAK, '1')
  await p.evaluate(([sel, words]) => { const e = document.querySelector(sel), r = e.getBoundingClientRect(), d = document.createElement('div'); d.id = 'gw-hover'
    d.textContent = 'Hover words (drawn by the script): ' + words; Object.assign(d.style, { position: 'fixed', left: Math.max(4, Math.min(r.left, innerWidth - 330)) + 'px', top: (r.bottom + 8) + 'px', maxWidth: '320px', background: '#ffe066', color: '#111', font: '12px/1.3 system-ui,sans-serif', padding: '4px 6px', borderRadius: '3px', zIndex: 2147483646 }); document.body.appendChild(d) }, [BEAK, beakToday.title])
  await K.shot(p, sz, 'g3-today-greyed', [DOW, BEAK, SIGN, '#gw-hover'], 12)
  await p.evaluate(() => document.getElementById('gw-hover')?.remove()); await K.unmark(p)

  /* G4 proposed: the box pressed stays empty, the grey "Blocked:" note says why; the four boxes outlined meanwhile */
  await p.evaluate(() => document.querySelectorAll('[data-gwne]').forEach(e => e.classList.add('gw-noend')))
  const n = W.items
  await p.evaluate(m => window.toast(m, 'blocked'), W.g4(n)); await K.wait(p, 300); await K.holdNote(p)
  const face = await p.evaluate(() => document.getElementById('toastEl').dataset.face || '')
  if (face !== 'blocked') throw new Error('the note did not take the blocked face')
  await K.markEl(p, `${SIGN} select[data-sign="cur"]`, '4', { nth: 0 })
  await p.evaluate(sel => document.querySelector(sel).closest('.sgn').setAttribute('data-gwtag', '4'), `${SIGN} select[data-sign="cur"]`)
  await p.evaluate(sel => { const s = document.querySelector(sel); s.classList.remove('gwm'); s.removeAttribute('data-gwtag'); s.closest('.sgn').classList.add('gwm') }, `${SIGN} select[data-sign="cur"]`)
  await K.markEl(p, '#toastEl', '', { inset: false })
  await K.shot(p, sz, 'g4-proposed', [DOW, SIGN, '#toastEl'], 12)
  await K.unmark(p); await K.hideNote(p)
  await p.evaluate(() => document.querySelectorAll('.gw-noend').forEach(e => e.classList.remove('gw-noend')))

  /* ---------- G3 proposed: Publish pressed (greyed, as it stays while a box is refused) ---------- */
  await p.locator(BEAK).click({ force: true }).catch(() => {}); await K.wait(p, 400)
  K.fact('G3', sz.name, 'a press on the greyed Publish day (today): the note says', await K.noteText(p) || '(nothing)')
  await p.evaluate(() => document.querySelectorAll('[data-gwne]').forEach(e => e.classList.add('gw-noend')))
  for (const [nm, words] of [['g3-proposed-named', W.g3named(n)], ['g3-proposed-count', W.g3count(n)]]) {
    await p.evaluate(m => window.toast(m, 'blocked'), words); await K.wait(p, 300); await K.holdNote(p)
    await K.markEl(p, BEAK, '3'); await K.markEl(p, '#toastEl', '')
    await K.shot(p, sz, nm, [DOW, BEAK, SIGN, '#toastEl'], 12)
    await K.unmark(p); await K.hideNote(p)
  }
  await p.evaluate(() => document.querySelectorAll('.gw-noend').forEach(e => e.classList.remove('gw-noend')))

  /* ---------- today, for real: sign the four (CUR CK first, pictured), then Publish day ---------- */
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = p.locator(`${SIGN} select[data-sign="${role}"]`).first()
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await K.wait(p, 500)
    if (await p.locator('[data-testid="win-oilday"]').count()) throw new Error('an OIL list opened at ' + role)
    if (role === 'cur') {
      await K.hideNote(p); await K.neutral(p)
      await p.evaluate(sel => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'end' }); window.scrollBy(0, 60) }, SIGN); await K.wait(p, 300)
      await p.evaluate(sel => document.querySelector(sel).closest('.sgn').classList.add('gwm'), `${SIGN} select[data-sign="cur"]`)
      await p.evaluate(sel => document.querySelector(sel).closest('.sgn').setAttribute('data-gwtag', '4'), `${SIGN} select[data-sign="cur"]`)
      K.fact('G4', sz.name, 'CUR CK picked (today): the box reads', K.clean(await p.locator(`${SIGN} .sgn`).first().innerText()))
      await K.shot(p, sz, 'g4-today', [DOW, SIGN], 12)
      await K.unmark(p)
    }
  }
  const beakSigned = await p.evaluate(sel => { const e = document.querySelector(sel); return e ? { disabled: e.disabled, title: e.title } : null }, BEAK)
  K.fact('G3', sz.name, 'Publish day once the four are signed (today)', beakSigned)
  /* does a change after signing take the signatures back today? (the order the rule has to work in) */
  await p.locator(BEAK).click(); await K.wait(p, 900)
  const note = await K.holdNote(p)
  K.fact('G3', sz.name, 'Publish day pressed with a landing and an END blank (today): the note', note)
  if (!/published/i.test(note || '')) throw new Error('not published')
  await K.markEl(p, '#toastEl', '')
  await K.shot(p, sz, 'g3-today', [DOW, SIGN, '#toastEl'], 12)
  await K.unmark(p); await K.hideNote(p)
  const after = await p.evaluate(() => ({ approved: window.dayApproved(5), warn: window.WARN.all.filter(w => w.di === 5).map(w => w.code + ': ' + w.msg) }))
  K.fact('G3', sz.name, 'after the real publish', after)

  /* ---------- the Scheduler Board's boxes, the same day (desktop and phone) ---------- */
  await K.go(p, 'editsched'); await weekDay5(p, sz)
  const sb = p.locator('#eWeek [data-sbday="5"]').filter({ visible: true }).first()
  if (await sb.count()) {
    await sb.evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'center' }) }); await sb.click()
    await p.locator('#schedBoard .sb-sec').first().waitFor({ state: 'attached' }); await K.wait(p, 700); await K.hideNote(p)
    const bne = await findNoEnd(p, '#schedBoard')
    K.fact('G', sz.name, 'board: empty end boxes with a start', bne)
    const bLD = "#schedBoard [data-bfld=\"ff:5.0.0.ld\"]"
    if (await p.locator(bLD).count()) {
      await p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); e && e.scrollIntoView({ block: 'center' }) }, bLD); await K.wait(p, 400); await K.neutral(p)
      const row = await p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); const r = e.closest('.sb-line, .sb-row, .sb-frow, .sb-fm') || e.parentElement.parentElement; r.setAttribute('data-gwrow', '1'); return r.className }, bLD)
      K.fact('G', sz.name, 'board flight row', row)
      await K.markEl(p, bLD, '1')
      const BSELS = K.isPhone(sz) ? ['[data-gwrow]', bLD] : [bLD, '#schedBoard [data-bfld="ff:5.0.0.to"]', '#schedBoard [data-slot="5.0.0.0.p"]']
      await K.shot(p, sz, 'g1-today-board', BSELS, 30)
      await p.evaluate(() => document.querySelectorAll('#schedBoard [data-gwne]').forEach(e => e.classList.add('gw-noend')))
      await K.ringsOff(p); await K.shot(p, sz, 'g1-proposed-board', BSELS, 30)
      await K.unmark(p)
    }
  }
  if (p.errs.length) K.fact('G', sz.name, 'page errors', p.errs)
  await b.close()
  return saved
}

/* the desktop stages and hands its store to the phone; the phone signs in again on the same store */
const only = (process.env.GW_ONLY || 'd,p').split(',')
/* GW_FROM=1 picks up the store an earlier desktop run left in the scratch folder */
let state = process.env.GW_FROM ? `${K.STATE}/g-staged.json` : null
if (only.includes('d')) state = await run('d', null)
if (only.includes('p')) {
  if (!state) throw new Error('the phone needs the desktop store: run d first or give GW_FROM')
  await run('p', state)
}
K.saveFacts('g')
K.log('done')
