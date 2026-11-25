// J and K — his two questions of 25 Nov 26 on the time guard rail: "Will it be irritating to the user planning the
// schedule that it keeps seeing red? Also will view schedule see the red too?"
//
// Drawn on the REAL running app with kit.mjs, on the same staged Thursday 16 Jul as draw-no-start.mjs (VL's take-off
// cleared, the SXO desk's START and END cleared, the first OFT EP-4's START cleared, the AMT BRIEF and DEBRIEF given
// ends). Every frame adds only ONE class to empty time boxes the app drew:
//   look 1, `gw-notime` — the app's resting `.badtm` edge in its warning red, `--hard` (as draw-no-start.mjs);
//   look 2, `gw-quiet`  — the same 1px edge in the app's muted grey, `--ink-3`;
// and, for look 2's sign-off panel, words put in front of the app's own "4 to sign" line (as draw-fable.mjs drew G).
// K is View-only Sched as the app draws the same draft day today, nothing added: only pink marks.
// Run from raptor-port/, against the build served on a free port:
//   GW_URL=http://localhost:4796/ node docs/mock/2026-11-25-guardrail-wording/draw-jk.mjs
import * as K from './kit.mjs'
import path from 'node:path'
import { mkdirSync, renameSync } from 'node:fs'
const OUT = path.join(K.IMG, 'jk'); mkdirSync(OUT, { recursive: true })
const CSS = `.gw-notime{box-shadow:inset 0 0 0 1px var(--hard)!important;border-radius:4px}
input.tm.gw-notime{border-color:var(--hard)!important;box-shadow:none!important}
.gw-quiet{box-shadow:inset 0 0 0 1px var(--ink-3)!important;border-radius:4px}
input.tm.gw-quiet{border-color:var(--ink-3)!important;box-shadow:none!important}`
const DI = 3
const TO = `#eWeek [data-txt="ff:${DI}.0.0.to"]`, LD = `#eWeek [data-txt="ff:${DI}.0.0.ld"]`, CS = `#eWeek [data-txt="ff:${DI}.0.0.cs"]`
const SEATP = `#eWeek [data-slot="${DI}.0.0.0.p"]`, SEATW = `#eWeek [data-slot="${DI}.0.0.0.w"]`
const DSTR = `#eWeek [data-txt="dr:${DI}.0.1.str"]`, DEND = `#eWeek [data-txt="dr:${DI}.0.1.end"]`, DROLE = `#eWeek [data-txt="dr:${DI}.0.1.role"]`, DESK = `#eWeek [data-slot="d:${DI}.0.1"]`
const SSTR = `#eWeek [data-txt="sr:${DI}.oft.0.str"]`, SEND = `#eWeek [data-txt="sr:${DI}.oft.0.end"]`, SLAB = `#eWeek [data-txt="sr:${DI}.oft.0.label"]`
const SIGN = `#eWeek [data-signbar="${DI}"]`, BEAK = `#eWeek [data-beak="${DI}"]`, DOW = `#eWeek .dow[data-crewday="${DI}"], #eWeek .dow[data-dayinfo="${DI}"]`
const BOXES = [TO, DSTR, DEND, SSTR]

async function shot(p, sz, name, sels, pad) {
  const f = await K.shot(p, sz, name, sels, pad)
  renameSync(path.join(K.IMG, f), path.join(OUT, f))
}
const cls = (p, c) => p.evaluate(([sels, c]) => { document.querySelectorAll('.gw-notime,.gw-quiet').forEach(e => e.classList.remove('gw-notime', 'gw-quiet')); if (c) sels.forEach(s => [...document.querySelectorAll(s)].forEach(e => e.classList.add(c))) }, [BOXES, c])
const scrollTo = (p, sel) => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); e && e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, sel)

async function stageWorld() {
  const { b, ctx, p } = await K.world('d')
  await K.signIn(p)
  await K.go(p, 'editsched')
  await K.setTxt(p, TO, ''); await K.setTxt(p, DEND, ''); await K.setTxt(p, DSTR, ''); await K.setTxt(p, SSTR, '')
  await K.setTxt(p, `#eWeek [data-txt="sr:${DI}.amt.0.end"]`, '1130')
  await K.setTxt(p, `#eWeek [data-txt="sr:${DI}.amt.2.end"]`, '1300')
  const st = await p.evaluate(di => { const d = window.DAYS[di], f = d.waves[0].formations[0], r = d.dutywaves[0].rows[1], s = d.sims.oft[0]
    return { to: f.to, ld: f.ld, desk: [r.id, r.str, r.end], oft: [s.str, s.end] } }, DI)
  if (st.to !== '' || st.ld === '' || st.desk[1] !== '' || st.desk[2] !== '' || st.oft[0] !== '' || st.oft[1] === '') throw new Error('staging did not land: ' + JSON.stringify(st))
  K.fact('JK', 'desktop', 'staged Thursday', st)
  const f = await K.saveState(ctx, 'jk-staged')
  await b.close()
  return f
}

async function run(key, statePath) {
  const { b, p, sz } = await K.world(key, statePath)
  await K.signIn(p)
  await p.addStyleTag({ content: CSS })
  await K.weekDay(p, sz, DI); await K.hideNote(p)

  const parts = [
    ['flight', TO, [TO, LD, CS, SEATP, SEATW], 24],
    ['desk', DSTR, [DSTR, DEND, DROLE, DESK, `#eWeek [data-txt="dr:${DI}.0.0.role"]`, `#eWeek [data-txt="dr:${DI}.0.2.end"]`], 22],
    ['sim', SSTR, [SSTR, SEND, SLAB, `#eWeek [data-slot="s:${DI}.oft.0.p"]`, `#eWeek [data-slot="s:${DI}.oft.0.w"]`], 22],
  ]
  for (const [name, at, sels, pad] of parts) {
    await scrollTo(p, at); await K.wait(p, 400); await K.neutral(p)
    await cls(p, 'gw-notime'); await shot(p, sz, `j1-red-${name}`, sels, pad)
    await cls(p, 'gw-quiet'); await shot(p, sz, `j2-quiet-${name}`, sels, pad)
    await cls(p, null)
  }

  /* look 2's always-there count: words in front of the app's own "4 to sign" (as G was drawn) */
  await p.evaluate(sel => { document.querySelector(sel).scrollIntoView({ block: 'center' }) }, SIGN); await K.wait(p, 400)
  const was = await p.evaluate(sel => { const e = document.querySelector(sel + ' .so-state'); const t = e.textContent.trim(); e.innerHTML = '<span style="color:var(--hard)">3 items missing a time</span> · ' + t; e.classList.add('gwm'); return t }, SIGN)
  K.fact('JK', sz.name, 'the sign-off line today', was)
  await shot(p, sz, 'j2-count-line', [BEAK, SIGN], 12)
  await K.unmark(p)

  /* ---------- K: View-only Sched, the same draft day as the app draws it today ---------- */
  if (key === 'p') {
    await K.go(p, 'viewsched')
    await p.evaluate(di => { const d = document.querySelector(`#vWeek .day[data-day="${di}"]`); d.scrollIntoView({ block: 'start', inline: 'start' }) }, DI); await K.wait(p, 700)
    const day = `#vWeek .day[data-day="${DI}"]`
    const seen = await p.evaluate(day => {
      const d = document.querySelector(day), f = d.querySelector('.form'), row = [...d.querySelectorAll('.pl-row')].find(r => r.querySelector('.ntx')?.textContent.trim() === 'SXO')
      f.querySelector('.fcell.ld').setAttribute('data-kto', '1'); row.setAttribute('data-kdesk', '1'); f.setAttribute('data-kform', '1')
      return { chip: d.querySelector('.verchip')?.textContent, to: f.querySelector('.fcell.ld').innerHTML, desk: row.innerHTML.slice(0, 200) }
    }, day)
    K.fact('JK', sz.name, 'View-only Sched, Thursday as drawn today', seen)
    await p.evaluate(day => document.querySelector(day + ' [data-kform]').scrollIntoView({ block: 'center' }), day); await K.wait(p, 400)
    await K.markEl(p, `${day} [data-kto]`, 'no outline here')
    await shot(p, sz, 'k-view-flight', [`${day} [data-kform] .csmsn`, `${day} [data-kto]`, `${day} [data-slot="${DI}.0.0.0.w"]`], 24)
    await K.unmark(p)
    await p.evaluate(day => document.querySelector(day + ' [data-kdesk]').scrollIntoView({ block: 'center' }), day); await K.wait(p, 400)
    await K.markEl(p, `${day} [data-kdesk] .t-s`, 'no outline here')
    await shot(p, sz, 'k-view-desk', [`${day} [data-kdesk]`], 30)
    await K.unmark(p)
    /* the day's head, to show it is View-only Sched's DRAFT day */
    await p.evaluate(day => { document.querySelector(day).scrollIntoView({ block: 'start' }); window.scrollTo(0, 0) }, day); await K.wait(p, 400)
    await shot(p, sz, 'k-view-head', [`${day} .day-head`], 10)
  }
  if (p.errs.length) K.fact('JK', sz.name, 'page errors', p.errs)
  await b.close()
}

const state = await stageWorld()
await run('d', state)
await run('p', state)
K.saveFacts('jk'); renameSync(path.join(K.IMG, 'facts-jk.json'), path.join(OUT, 'facts-jk.json'))
K.log('done')
