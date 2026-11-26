/* Stages Monday 13 Jul of the demo week for the AL colours page, through the app's own writes and its own sign-off and
   publish buttons, on a desktop: the day published, then four amendments, each changing a time, a puck and (AL2, AL4) a
   programme name. Two stores are saved for every later picture and capture:
     waiting — AL1, AL2 and AL3 are out and AL4's changes are still waiting
     out     — AL4 published too
   Run from raptor-port/ against a preview of the existing build (nothing here builds):
     GW_URL=http://localhost:4817/ GW_STATE=<a scratch folder> node docs/mock/2026-11-26-al-colours/stage.mjs */
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const DI = 0
const d = await K.world('d')
const p = d.p
await K.signIn(p)
await K.go(p, 'editsched')
const sec = () => p.locator(`#eWeek section.day[data-day="${DI}"]`)
const note = () => p.evaluate(() => { const t = document.getElementById('toastEl'); return t ? t.textContent.trim() : '' })
const state = () => p.evaluate(di => ({ als: (window.SCHED.als || []).filter(a => +a.di === di).length, orig: !!(window.SCHED.orig || {})[di], pend: window.pendCount() }), DI)

async function sign(pick) {
  for (const k of ['cur', 'sked', 'plan', 'appr']) {
    const sel = sec().locator(`select[data-sign="${k}"]`)
    const v = await sel.evaluate((s, pick) => (s.options[pick] || s.options[1]).value, pick)
    await sel.selectOption(v); await K.wait(p, 250)
  }
}
async function change(label, texts, seats) {
  await p.evaluate(([texts, seats]) => {
    for (const [k, v] of texts) window.txtSet(k, v)
    for (const [k, v] of seats) window.fillSlot(k, v)
    window.afterSchedMutate()
  }, [texts, seats])
  await K.wait(p, 700)
  K.log(label, JSON.stringify(await state()))
}
async function publishAL(n) {
  await sign(1 + (n % 2))
  await sec().locator(`[data-alpub="${DI}"]`).click(); await K.wait(p, 900)
  const s = await state(); K.log('published AL' + n, JSON.stringify(s), '|', await note())
  if (s.als !== n) throw new Error(`AL${n} did not go out: ` + JSON.stringify(s))
}

/* the parts of a flying line that no text key reaches (an area, an area's time, an in-time line, a store) are changed as a
   scheduler changes them: typed into their own box on Edit Schedule's week, or their chip pressed */
async function typeIn(sel, text, how = 'Enter') {
  const el = sec().locator(sel).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text)
  if (how === 'Enter') await p.keyboard.press('Enter')
  await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await K.wait(p, 500)
}
async function press(sel) { const el = sec().locator(sel).first(); await el.scrollIntoViewIfNeeded(); await el.click(); await K.wait(p, 500) }

/* the original */
await sign(1)
await sec().locator(`[data-beak="${DI}"]`).click(); await K.wait(p, 900)
K.log('published', JSON.stringify(await state()), '|', await note())
if (!(await state()).orig) throw new Error('the day did not publish')

/* AL1: SODB re-timed · VL's rally, brief and take-off (the board's stacked R/B and TO/LD) · RU's mission · a duty desk's
   times and its holder · an OFT's times and its WSO · a ground row's start · VL's area */
await change('AL1 staged', [[`ap:${DI}.0.str`, '1800'], [`ap:${DI}.0.end`, '2000'], [`ff:${DI}.0.0.to`, '1250'], [`ff:${DI}.0.0.rl`, '1015'], [`ff:${DI}.0.0.br`, '1045'],
  [`ff:${DI}.0.1.msn`, 'ACM'], [`dr:${DI}.0.0.str`, '0630'], [`dr:${DI}.0.0.end`, '1330'], [`sr:${DI}.oft.0.str`, '0815'], [`sr:${DI}.oft.0.end`, '0945'], [`gr:${DI}.2.str`, '1045']],
  [[`s:${DI}.oft.1.w`, 'salsa']])
await typeIn(`[data-area="${DI}.0.0"]`, 'EAST · SOUTH')
await publishAL(1)
/* AL2: a programme name and its start · a flight remark over its stores chips, and a store taken off · a night remark ·
   the AMT BOX's start and remark · the free-text sim crew · a wave's label · a duty role · RU's area time */
await change('AL2 staged', [[`ap:${DI}.1.prog`, 'MET NOTAM BRIEF'], [`fr:${DI}.0.0.0`, '1B: BFM-7'], [`ap:${DI}.1.str`, '0814'], [`fr:${DI}.1.0.1`, '2A: DT / OCU-2'],
  [`sr:${DI}.amt.1.str`, '1145'], [`sr:${DI}.amt.1.rmks`, '2 X 4-SHIP // 2TK TPOD 9M'], [`sr:${DI}.oft.2.who`, 'EXT SQN + 145'], [`wl:${DI}.1`, 'WAVE 2 NIGHT'], [`dr:${DI}.0.2.role`, 'OPS-O (AM)']],
  [[`a:${DI}.3.0`, 'prowler'], [`d:${DI}.0.1`, 'vinci']])
await press(`.stchip[data-store="${DI}.0.0.1.tk2"]`)
await typeIn(`[data-atime="${DI}.0.1"]`, '1340-1515')
await publishAL(2)
/* AL3: WPNS & TACTICS SYNC re-timed · RU's landing and a WSO · an in-time line · the AMT BRIEF's start, an OFT's name and
   remark, an AMT seat · a duty end and a duty block's label · a two-line programme name · a ground remark */
await change('AL3 staged', [[`ap:${DI}.3.str`, '1700'], [`ap:${DI}.3.end`, '2000'], [`ff:${DI}.0.1.ld`, '1515'], [`sr:${DI}.amt.0.str`, '1115'], [`sr:${DI}.oft.3.label`, 'EP-7'],
  [`sr:${DI}.oft.3.rmks`, 'B: SEFE / IF'], [`dr:${DI}.0.2.end`, '1430'], [`dl:${DI}.1`, '2nd wave (night)'], [`ap:${DI}.9.prog`, 'CMD ENGAGEMENT @ CREW ROOM (ALL SQN PERS)'], [`gr:${DI}.7.rmks`, 'Desk / staff work, HQ']],
  [[`${DI}.0.1.0.w`, 'shrek'], [`s:${DI}.amt.1.pax.2`, 'ipman']])
await typeIn(`[data-itline="${DI}|0|1"]`, '10:50H: FIRST WAVE RU IN TIME + WX/NOTAMS', 'blur')
await publishAL(3)
/* AL4, left waiting: programme pucks, a time and a name · a night take-off, brief and pilot · a remark over its chips and a
   store · an area · a sim's two times, its remark and one of its crew · the AMT DEBRIEF's start · a duty start and holder */
await change('AL4 staged', [[`ap:${DI}.5.str`, '1500'], [`ap:${DI}.6.prog`, 'INTEL + THREAT UPDATE'], [`ff:${DI}.1.0.to`, '1950'], [`ff:${DI}.1.1.br`, '1750'], [`fr:${DI}.0.1.1`, '2A: BFM-ADD 2'],
  [`sr:${DI}.oft.4.str`, '1715'], [`sr:${DI}.oft.4.end`, '1845'], [`sr:${DI}.oft.1.rmks`, 'A: SA(S)-4 // BRIEF 30 PRIOR'], [`sr:${DI}.amt.2.str`, '1245'], [`dr:${DI}.1.0.str`, '1230'], [`dr:${DI}.0.1.end`, '']],
  [[`a:${DI}.4.0`, 'mamba'], [`a:${DI}.2.0`, 'chaps'], [`${DI}.1.1.1.p`, 'razer'], [`s:${DI}.oft.4.pax.1`, 'pike'], [`d:${DI}.1.1`, 'krait']])
await press(`.stchip[data-store="${DI}.1.0.0.nav"]`)
await typeIn(`[data-area="${DI}.1.1"]`, 'WEST · NORTH')
const marks = async () => p.evaluate(di => {
  const s = document.querySelector(`#eWeek section.day[data-day="${di}"]`), out = {}
  for (const e of s.querySelectorAll('[data-alc],[data-aln]')) { const k = (e.hasAttribute('data-aln') ? 'waiting AL' + e.getAttribute('data-aln') : 'out AL' + e.getAttribute('data-alc')) + ' ' + (e.classList.contains('seat') ? 'puck' : e.classList.contains('verchip') ? 'day tag' : e.className.split(' ')[0] || e.tagName) ; out[k] = (out[k] || 0) + 1 }
  return out
}, DI)
K.fact('stage', 'desktop', 'marks on Edit Schedule, AL4 waiting', await marks())
K.log('saved', await K.saveState(d.ctx, 'alc-waiting'))
/* the missing-time scenes (the end-time rule beside the amendment marks): the 2nd wave's OPS-O END emptied on the published
   day (m3: its box empty, waiting), then typed again as 22:15 (m4); the 1st wave's SXO END stays empty through both. Then
   the SXO END goes back to what was published and AL4 goes out, so "all out" holds no empty box and the OPS-O END is AL4's. */
await change('m3 staged', [[`dr:${DI}.1.2.end`, '']], [])
K.log('saved', await K.saveState(d.ctx, 'alc-m3'))
await change('m4 staged', [[`dr:${DI}.1.2.end`, '2215']], [])
K.log('saved', await K.saveState(d.ctx, 'alc-m4'))
await change('SXO END back', [[`dr:${DI}.0.1.end`, '1300']], [])
await publishAL(4)
K.fact('stage', 'desktop', 'marks on Edit Schedule, all out', await marks())
K.log('saved', await K.saveState(d.ctx, 'alc-out'))
if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
await d.b.close()
/* the draft day of the missing-time scenes: a fresh store, the 1st wave's SXO desk with its holder and no times */
const f = await K.world('d')
await K.signIn(f.p); await K.go(f.p, 'editsched')
await f.p.evaluate(di => { window.txtSet(`dr:${di}.0.1.str`, ''); window.txtSet(`dr:${di}.0.1.end`, ''); window.afterSchedMutate() }, DI)
await K.wait(f.p, 600)
K.log('saved', await K.saveState(f.ctx, 'alc-draft'))
await f.b.close()
