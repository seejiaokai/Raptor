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

/* the original */
await sign(1)
await sec().locator(`[data-beak="${DI}"]`).click(); await K.wait(p, 900)
K.log('published', JSON.stringify(await state()), '|', await note())
if (!(await state()).orig) throw new Error('the day did not publish')

/* AL1: SODB re-timed, VL's take-off, a duty desk's holder */
await change('AL1 staged', [[`ap:${DI}.0.str`, '1800'], [`ap:${DI}.0.end`, '2000'], [`ff:${DI}.0.0.to`, '1250']], [[`d:${DI}.0.1`, 'vinci']])
await publishAL(1)
/* AL2: a programme name, a flight remark, the name on a programme row */
await change('AL2 staged', [[`ap:${DI}.1.prog`, 'MET NOTAM BRIEF'], [`fr:${DI}.0.0.0`, '1B: BFM-7'], [`ap:${DI}.1.str`, '0814']], [[`a:${DI}.3.0`, 'prowler']])
await publishAL(2)
/* AL3: WPNS & TACTICS SYNC re-timed, RU's landing, a WSO */
await change('AL3 staged', [[`ap:${DI}.3.str`, '1700'], [`ap:${DI}.3.end`, '2000'], [`ff:${DI}.0.1.ld`, '1515']], [[`${DI}.0.1.0.w`, 'shrek']])
await publishAL(3)
/* AL4, left waiting: two programme pucks, a time, a name, a pilot */
await change('AL4 staged', [[`ap:${DI}.5.str`, '1500'], [`ap:${DI}.6.prog`, 'INTEL + THREAT UPDATE'], [`ff:${DI}.1.0.to`, '1950']], [[`a:${DI}.4.0`, 'mamba'], [`a:${DI}.2.0`, 'chaps'], [`${DI}.1.1.1.p`, 'razer']])
const marks = async () => p.evaluate(di => {
  const s = document.querySelector(`#eWeek section.day[data-day="${di}"]`), out = {}
  for (const e of s.querySelectorAll('[data-alc],[data-aln]')) { const k = (e.hasAttribute('data-aln') ? 'waiting AL' + e.getAttribute('data-aln') : 'out AL' + e.getAttribute('data-alc')) + ' ' + (e.classList.contains('seat') ? 'puck' : e.classList.contains('verchip') ? 'day tag' : 'text'); out[k] = (out[k] || 0) + 1 }
  return out
}, DI)
K.fact('stage', 'desktop', 'marks on Edit Schedule, AL4 waiting', await marks())
K.log('saved', await K.saveState(d.ctx, 'alc-waiting'))
await publishAL(4)
K.fact('stage', 'desktop', 'marks on Edit Schedule, all out', await marks())
K.log('saved', await K.saveState(d.ctx, 'alc-out'))
if (p.errs.length) K.log('ERRORS', p.errs.join(' | '))
await d.b.close()
