/* THE COMPLEX DAY (his ask of 26 Nov 26: "a more complex AL with these and more missing time outlines"). Stages, through the
   app's own writes and its own sign-off and publish buttons, on a desktop:
     Monday 13 Jul  published, then amended SIX times with several changes each in every section (programme, flying waves
                    with remarks, stores, areas and an in-time line, duties, every kind of sim row, ground, a request filed
                    under Unavailable and one under Personal Inputs, and pucks), one programme row changed in two different
                    amendments (AL2 its times, AL5 its name), and AL7 left waiting with two times EMPTIED (a desk's END on
                    a row whose holder changed in AL2, and a night flight's take-off on a formation changed in AL5);
     Tuesday 14 Jul never published: a flight with no take-off, a desk with no START, a desk with no END, a sim with no
                    start, and a ground row holding ALL AVAIL with no end (the draft, grey outlines; no amendments).
   Saved stores: cx-waiting (AL7 waiting), cx-out (the two times typed back, AL7 published).
   Run from raptor-port/ against a preview of the existing build (nothing here builds):
     GW_URL=http://localhost:4817/ GW_STATE=<a scratch folder> node docs/mock/2026-11-26-al-colours/stage2.mjs */
const K = await import('../2026-11-25-guardrail-wording/kit.mjs')
const DI = 0, TU = 1
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
async function change(label, texts, seats, inputs = []) {
  const bad = await p.evaluate(([texts, seats, inputs]) => {
    const bad = []
    for (const [k, v] of texts) { try { window.txtSet(k, v) } catch (e) { bad.push(k + ': ' + e.message) } }
    for (const [k, v] of seats) { try { window.fillSlot(k, v) } catch (e) { bad.push(k + ': ' + e.message) } }
    for (const row of inputs) { try { window.fileInput(row) } catch (e) { bad.push('input: ' + e.message) } }
    window.afterSchedMutate()
    return bad
  }, [texts, seats, inputs])
  await K.wait(p, 700)
  K.log(label, JSON.stringify(await state()), bad.length ? 'REFUSED ' + bad.join(' | ') : '')
}
async function publishAL(n) {
  await sign(1 + (n % 2))
  await sec().locator(`[data-alpub="${DI}"]`).click(); await K.wait(p, 900)
  const s = await state(); K.log('published AL' + n, JSON.stringify(s), '|', await note())
  if (s.als !== n) throw new Error(`AL${n} did not go out: ` + JSON.stringify(s))
}
async function typeIn(sel, text, how = 'Enter') {
  const el = sec().locator(sel).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text)
  if (how === 'Enter') await p.keyboard.press('Enter')
  await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur()); await K.wait(p, 500)
}
async function press(sel) { const el = sec().locator(sel).first(); await el.scrollIntoViewIfNeeded(); await el.click(); await K.wait(p, 500) }

/* Tuesday, the draft: times emptied on rows that hold people, and ALL AVAIL put on a ground row with no end */
await p.evaluate(di => {
  for (const k of [`ff:${di}.0.0.to`, `dr:${di}.0.0.str`, `dr:${di}.0.1.end`, `sr:${di}.oft.0.str`, `gr:${di}.0.end`]) window.txtSet(k, '')
  try { window.fillSlot(`g:${di}.0.+`, 'allavail') } catch (e) { console.log('ALL AVAIL refused: ' + e.message) }
  window.afterSchedMutate()
}, TU)
await K.wait(p, 600)

/* Monday: the original */
await sign(1)
await sec().locator(`[data-beak="${DI}"]`).click(); await K.wait(p, 900)
K.log('published', JSON.stringify(await state()), '|', await note())
if (!(await state()).orig) throw new Error('the day did not publish')

await change('AL1 staged', [[`ap:${DI}.0.str`, '1800'], [`ap:${DI}.0.end`, '2000'], [`ff:${DI}.0.0.to`, '1250'], [`ff:${DI}.0.0.rl`, '1015'], [`ff:${DI}.0.0.br`, '1045'],
  [`dr:${DI}.0.0.str`, '0630'], [`dr:${DI}.0.0.end`, '1330'], [`sr:${DI}.oft.0.str`, '0815'], [`sr:${DI}.oft.0.end`, '0945'], [`gr:${DI}.2.str`, '1045']],
  [[`s:${DI}.oft.1.w`, 'salsa']])
await typeIn(`[data-area="${DI}.0.0"]`, 'EAST · SOUTH')
await publishAL(1)

await change('AL2 staged', [[`ap:${DI}.1.prog`, 'MET NOTAM BRIEF'], [`ap:${DI}.1.str`, '0814'], [`ap:${DI}.3.str`, '1700'], [`ap:${DI}.3.end`, '2000'], [`fr:${DI}.0.0.0`, '1B: BFM-7'],
  [`sr:${DI}.amt.1.str`, '1145'], [`sr:${DI}.amt.1.rmks`, '2 X 4-SHIP // 2TK TPOD 9M'], [`wl:${DI}.1`, 'WAVE 2 NIGHT'], [`dr:${DI}.0.2.role`, 'OPS-O (AM)']],
  [[`a:${DI}.3.0`, 'prowler'], [`d:${DI}.0.1`, 'vinci']],
  [{ person: 'bane', date: 'Jul 13', allday: true, type: 'OL', remarks: 'Overseas leave', mod: '2026-07-13' }])
await press(`.stchip[data-store="${DI}.0.0.1.tk2"]`)
await typeIn(`[data-atime="${DI}.0.1"]`, '1340-1515')
await publishAL(2)

await change('AL3 staged', [[`ff:${DI}.0.1.ld`, '1515'], [`ff:${DI}.0.1.msn`, 'ACM'], [`sr:${DI}.amt.0.str`, '1115'], [`sr:${DI}.oft.3.label`, 'EP-7'], [`sr:${DI}.oft.3.rmks`, 'B: SEFE / IF'],
  [`dr:${DI}.0.2.end`, '1430'], [`dl:${DI}.1`, '2nd wave (night)'], [`gr:${DI}.7.rmks`, 'Desk / staff work, HQ'], [`ap:${DI}.4.end`, '1445']],
  [[`${DI}.0.1.0.w`, 'shrek'], [`s:${DI}.amt.1.pax.2`, 'ipman']])
await typeIn(`[data-itline="${DI}|0|1"]`, '10:50H: FIRST WAVE RU IN TIME + WX/NOTAMS', 'blur')
await publishAL(3)

await change('AL4 staged', [[`ap:${DI}.5.str`, '1500'], [`ap:${DI}.6.prog`, 'INTEL + THREAT UPDATE'], [`ff:${DI}.1.0.to`, '1950'], [`fr:${DI}.0.1.1`, '2A: BFM-ADD 2'],
  [`sr:${DI}.oft.4.str`, '1715'], [`sr:${DI}.oft.4.end`, '1845'], [`dr:${DI}.1.0.str`, '1230'], [`gr:${DI}.6.end`, '1115']],
  [[`a:${DI}.4.0`, 'mamba'], [`d:${DI}.1.1`, 'krait']])
await press(`.stchip[data-store="${DI}.1.0.0.nav"]`)
await typeIn(`[data-area="${DI}.1.1"]`, 'WEST · NORTH')
await publishAL(4)

/* AL5: the WPNS row again (its times went out in AL2, its name now) */
await change('AL5 staged', [[`ap:${DI}.3.prog`, 'WPNS + TACTICS SYNC (ALL IPs)'], [`ap:${DI}.9.prog`, 'CMD ENGAGEMENT @ CREW ROOM (ALL SQN PERS)'], [`ff:${DI}.1.1.br`, '1750'], [`ff:${DI}.1.1.rl`, '1720'],
  [`sr:${DI}.oft.1.rmks`, 'A: SA(S)-4 // BRIEF 30 PRIOR'], [`sr:${DI}.amt.2.str`, '1245'], [`gr:${DI}.3.str`, '1215'], [`dr:${DI}.1.2.end`, '2200']],
  [[`${DI}.1.1.1.p`, 'razer']],
  [{ person: 'taipan', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Appointment', remarks: 'Dental appt', mod: '2026-07-13' }])
await publishAL(5)

await change('AL6 staged', [[`ap:${DI}.7.end`, '1830'], [`ap:${DI}.2.prog`, 'FLIGHT SAFETY BRIEF'], [`ff:${DI}.1.0.msn`, 'BFM-9'], [`fr:${DI}.1.0.1`, '2A: DT / OCU-2'], [`sr:${DI}.oft.2.str`, '1345'],
  [`sr:${DI}.oft.0.rmks`, 'A: IEPE / EP-5'], [`gr:${DI}.5.str`, '1415'], [`gr:${DI}.5.end`, '1545'], [`gr:${DI}.4.rmks`, 'Bring logbooks'], [`dr:${DI}.1.1.str`, '1315'], [`dr:${DI}.1.1.end`, '2145']],
  [[`a:${DI}.2.0`, 'chaps'], [`s:${DI}.oft.4.pax.1`, 'pike']])
await typeIn(`[data-atime="${DI}.1.0"]`, '1955-2105')
await publishAL(6)

/* AL7, left waiting: changes in every section, and two times emptied */
await change('AL7 staged', [[`ap:${DI}.2.str`, '0845'], [`ap:${DI}.8.prog`, 'DINNER WITH CMD (MESS)'], [`ff:${DI}.0.0.ld`, '1420'], [`fr:${DI}.1.1.0`, '2B: NIGHT INT // NVG'], [`sr:${DI}.oft.3.str`, '1515'], [`sr:${DI}.oft.3.end`, '1645'],
  [`sr:${DI}.amt.1.end`, '1245'], [`gr:${DI}.1.end`, '1130'], [`gr:${DI}.0.rmks`, 'Room 2'], [`dr:${DI}.0.2.str`, '0615'], [`wl:${DI}.0`, 'WAVE 1 DAY'],
  [`dr:${DI}.0.1.end`, ''], [`ff:${DI}.1.1.to`, '']],
  [[`a:${DI}.5.0`, 'vinci'], [`d:${DI}.1.2`, 'mamba'], [`${DI}.0.0.0.p`, 'pike'], [`s:${DI}.oft.0.p`, 'razer']],
  [{ person: 'krait', date: 'Jul 13', allday: false, s: 900, e: 960, type: 'Appointment', remarks: 'Medical / PHA', mod: '2026-07-13' }])
await press(`.stchip[data-store="${DI}.0.1.0.tk2"]`)
const marks = async () => p.evaluate(di => {
  const s = document.querySelector(`#eWeek section.day[data-day="${di}"]`), out = {}
  for (const e of s.querySelectorAll('[data-alc],[data-aln]')) { const k = (e.hasAttribute('data-aln') ? 'waiting AL' + e.getAttribute('data-aln') : 'out AL' + e.getAttribute('data-alc')) + ' ' + (e.classList.contains('seat') ? 'puck' : e.classList.contains('verchip') ? 'day tag' : 'words'); out[k] = (out[k] || 0) + 1 }
  return out
}, DI)
K.fact('stage2', 'desktop', 'marks on Edit Schedule, AL7 waiting', await marks())
K.fact('stage2', 'desktop', 'empty boxes', await p.evaluate(() => [...document.querySelectorAll('#eWeek [data-txt]')].filter(e => /^(ff|dr|sr|gr):[01]\..*\.(to|str|end)$/.test(e.getAttribute('data-txt')) && !e.textContent.trim()).map(e => e.getAttribute('data-txt')).join(' ')))
K.log('saved', await K.saveState(d.ctx, 'cx-waiting'))
await change('times typed back', [[`dr:${DI}.0.1.end`, '1315'], [`ff:${DI}.1.1.to`, '1930']], [])
await publishAL(7)
K.fact('stage2', 'desktop', 'marks on Edit Schedule, all out', await marks())
K.log('saved', await K.saveState(d.ctx, 'cx-out'))
if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
await d.b.close()
