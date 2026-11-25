// The fresh Fable reader's redraws of 25 Nov 26 (the round-2 page's red team), on the same kit and the same staged
// Saturday as draw-g.mjs / draw-f.mjs (their stores in the scratch folder, saved under http://localhost:4791).
// Pictures go to img/fable/. Every frame changes only words of an element the app drew, or adds the one class
// `gw-noend` (draw-g.mjs's red edge) to boxes the app drew. Labels with a pink ground are the drawing's, not the app's.
//
// What it draws:
//   fb-c1 / fb-c2   the red outline again, the label placed beside the box so the take-off / START stays readable
//   fb-c3           PROPOSAL (new, a question for him): the sign-off panel's own status line says what is missing,
//                   before anything is pressed — "2 end times missing · 4 to sign"
//   fb-c4           the refused sign-off with the words to build ("Type the end times, then sign.") and that line
//   fb-e3           a landing typed "TBD", outlined (point E3, not drawn before) — desktop
//   fb-f2 / f5 / f6 the three sentences whose pictures showed an earlier draft, with the words to build;
//                   fb-f5-alt is this reader's plainer wording, put to him as a choice
//   facts-fable.json  what the run read off the screen, with a count of every start-with-no-end box in the demo week
//
// Run from raptor-port/:  GW_URL=http://localhost:4791/ node docs/mock/2026-11-25-guardrail-wording/draw-fable.mjs
import * as K from './kit.mjs'
import path from 'node:path'
import { mkdirSync, renameSync, existsSync } from 'node:fs'

const OUT = path.join(K.IMG, 'fable'); mkdirSync(OUT, { recursive: true })
const keep = (sz, name) => renameSync(path.join(K.IMG, `${name}-${sz.name}.png`), path.join(OUT, `${name}-${sz.name}.png`))
const shot = async (p, sz, name, sels, pad) => { await K.shot(p, sz, name, sels, pad); keep(sz, name) }

const NOEND_CSS = `.gw-noend{box-shadow:inset 0 0 0 1px var(--hard)!important;border-radius:4px}
input.tm.gw-noend{border-color:var(--hard)!important;box-shadow:none!important}
#fb-lab{position:fixed;z-index:2147483647;background:#ff2d95;color:#fff;font:700 10px/14px system-ui,'Segoe UI',sans-serif;padding:0 5px;border-radius:7px;pointer-events:none;white-space:nowrap}`

const W = {
  sign: n => `Blocked: ${n} items have no end time, each outlined in red. Type the end times, then sign.`,
  f2: 'Earned off the published schedule. Change the schedule and publish the day again, and the OIL follows.',
  f5: 'Warning hidden: no flag, not counted. It returns only if the man or either item is a different one.',
  f5alt: 'Warning hidden: no flag, not counted. It stays hidden while the same man is on the same two items, even if their times change.',
  f6: 'Every input closes the man for the hours it covers, from the moment it is filed. It closes nothing once a scheduler takes it off the programme, cancels it (CX) or marks it information only.',
}

/* a pink label to the RIGHT of the element, level with it (never over the start time above it or the row below) */
const labelUnder = (p, sel, words) => p.evaluate(([sel, words]) => {
  document.getElementById('fb-lab')?.remove()
  const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); if (!e) throw new Error('labelUnder: no ' + sel)
  const b = e.getBoundingClientRect(), t = document.createElement('span'); t.id = 'fb-lab'; t.textContent = words; document.body.appendChild(t)
  t.style.left = Math.max(2, Math.min(b.right + 6, innerWidth - t.offsetWidth - 2)) + 'px'; t.style.top = (b.top + (b.height - t.offsetHeight) / 2) + 'px'
}, [sel, words])
const labelOff = p => p.evaluate(() => document.getElementById('fb-lab')?.remove())

/* every empty end box on Saturday whose start is typed (draw-g.mjs's finder) */
const findNoEnd = p => p.evaluate(() => {
  const val = e => (e.tagName === 'INPUT' ? e.value : e.textContent).trim(), out = []
  for (const e of document.querySelectorAll('#eWeek [data-txt]')) {
    if (!e.getBoundingClientRect().width) continue
    const k = e.getAttribute('data-txt'), m = /^([a-z]+):(5\.[^ ]*?)\.(ld|end)$/.exec(k); if (!m) continue
    const s = document.querySelector(`#eWeek [data-txt="${k.replace(/\.(ld|end)$/, m[3] === 'ld' ? '.to' : '.str')}"]`)
    if (val(e) === '' && s && val(s) !== '') { e.setAttribute('data-gwne', k); out.push(k + ' (start ' + val(s) + ')') }
  }
  return out
})
/* the whole demo week: every box the rule would outline, by day and by kind of row (read from the app's own model) */
const survey = p => p.evaluate(() => {
  const t = v => String(v == null ? '' : v).trim(), isT = v => /^\d{1,2}:?\d{2}$/.test(t(v)), out = {}
  const add = (di, kind, name) => { (out[di] = out[di] || []).push(kind + ': ' + name) }
  ;(window.DAYS || []).forEach((d, di) => {
    ;(d.waves || []).forEach(w => (w.formations || []).forEach(f => { if (f.cx) return; if (isT(f.to) && !isT(f.ld)) add(di, w.kind && w.kind !== 'fly' ? 'standby/other wave line' : 'flight', (f.cs || '?') + ' T/O ' + f.to + (t(f.ld) ? ' LD "' + f.ld + '"' : ''))
      if (isT(f.str) && !isT(f.end)) add(di, 'standby line', (f.cs || '?') + ' START ' + f.str) }))
    ;(d.dutywaves || []).forEach(w => (w.rows || []).forEach(r => { if (r && !r.cx && isT(r.str) && !isT(r.end)) add(di, 'duty desk', (r.role || '?') + ' ' + r.str) }))
    for (const k of Object.keys(d.sims || {})) (d.sims[k] || []).forEach(s => { if (s && !s.cx && isT(s.str) && !isT(s.end)) add(di, 'sim (' + k + ')', (s.label || '?') + ' ' + s.str) })
    ;(d.ground || []).forEach(g => { if (g && !g.cx && isT(g.str) && !isT(g.end)) add(di, g.src ? 'ground row from an input' : 'ground row', (g.what || g.label || g.title || '?') + ' ' + g.str) })
    ;(d.allhands || []).forEach(x => { if (x && !x.cx && isT(x.str) && !isT(x.end)) add(di, 'programme row', (x.what || x.label || x.title || '?') + ' ' + x.str) })
  })
  return out
})

async function run(key) {
  const st = path.join(K.STATE, 'g-staged.json')
  if (!existsSync(st)) throw new Error('no staged Saturday in the scratch folder: run draw-g.mjs first')
  const { b, p, sz } = await K.world(key, st)
  await K.signIn(p)
  await p.addStyleTag({ content: NOEND_CSS })
  const staged = await p.evaluate(() => { const d = window.DAYS[5], f = d.waves[0].formations[0], r = d.dutywaves[0].rows[1]; return { to: f.to, ld: f.ld, sxo: r.str + '-' + r.end } })
  K.fact('FB', sz.name, 'the staged Saturday as this build reads it', staged)
  if (staged.ld !== '' || !/^0?8:?00-$/.test(staged.sxo)) throw new Error('the staged day did not load: ' + JSON.stringify(staged))
  if (key === 'd') K.fact('FB', sz.name, 'the demo week (with the staged Saturday): every start with no end, by day', await survey(p))

  await K.go(p, 'editsched')
  if (K.isPhone(sz)) { await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="5"]'); d && d.scrollIntoView({ inline: 'start' }) }); await K.wait(p, 800) }
  await K.hideNote(p)
  const ne = await findNoEnd(p)
  K.fact('FB', sz.name, 'Saturday: empty end boxes with a start', ne)
  const scrollTo = sel => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); e && e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, sel)
  const on = () => p.evaluate(() => document.querySelectorAll('[data-gwne]').forEach(e => { if (!/^sr:5\.amt\./.test(e.getAttribute('data-gwne'))) e.classList.add('gw-noend') }))

  /* fb-c1: the flight, the label under the box */
  const LD = '#eWeek [data-txt="ff:5.0.0.ld"]', TO = '#eWeek [data-txt="ff:5.0.0.to"]'
  await scrollTo(LD); await K.wait(p, 400); await K.neutral(p); await on()
  await labelUnder(p, LD, 'no landing typed')
  await shot(p, sz, 'fb-c1-landing', [LD, TO, '#eWeek [data-slot="5.0.0.0.p"]', '#eWeek [data-slot="5.0.0.0.w"]', '#eWeek [data-txt="ff:5.0.0.cs"]', '#fb-lab'], 22)
  /* fb-c2: the desk */
  const END = '#eWeek [data-txt="dr:5.0.1.end"]'
  await scrollTo(END); await K.wait(p, 400)
  await labelUnder(p, END, 'no END typed')
  await shot(p, sz, 'fb-c2-desk', [END, '#eWeek [data-txt="dr:5.0.1.str"]', '#eWeek [data-slot="d:5.0.1"]', '#eWeek [data-txt="dr:5.0.1.role"]', '#eWeek [data-txt="dr:5.0.0.role"]', '#eWeek [data-txt="dr:5.0.2.end"]', '#fb-lab'], 20)
  await labelOff(p)

  /* fb-c3: the sign-off panel's own status line says it, before any press */
  const SIGN = '#eWeek [data-signbar="5"]', BEAK = '#eWeek [data-beak="5"]', DOW = '#eWeek .dow[data-crewday="5"], #eWeek .dow[data-dayinfo="5"]'
  await p.evaluate(sel => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'end' }); window.scrollBy(0, 60) }, SIGN); await K.wait(p, 400)
  const was = await p.evaluate(sel => { const e = document.querySelector(sel + ' .so-state'); return e ? e.textContent.trim() : null }, SIGN)
  K.fact('FB', sz.name, 'the sign-off status line today', was)
  if (!was) throw new Error('no status line in the sign-off panel')
  await p.evaluate(sel => { const e = document.querySelector(sel + ' .so-state'); e.innerHTML = '<span style="color:var(--hard)">2 end times missing</span> · ' + e.textContent.trim() }, SIGN)
  await K.markEl(p, SIGN + ' .so-state', '')
  await shot(p, sz, 'fb-c3-status-line', [DOW, BEAK, SIGN], 12)
  /* fb-c4: the refused sign-off, the words to build, with that line */
  await p.evaluate(m => window.toast(m, 'blocked'), W.sign(2)); await K.wait(p, 300); await K.holdNote(p)
  await K.markEl(p, '#toastEl', '')
  await shot(p, sz, 'fb-c4-sign-refused', [DOW, BEAK, SIGN, '#toastEl'], 12)
  await K.unmark(p); await K.hideNote(p)

  /* fb-f5: the note after a conflict is hidden — the words to build, then this reader's plainer wording */
  for (const [nm, words] of [['fb-f5-note', W.f5], ['fb-f5-alt-note', W.f5alt]]) {
    await p.evaluate(m => window.toast(m), words); await K.wait(p, 300); await K.holdNote(p)
    await shot(p, sz, nm, ['#toastEl'], 14); await K.hideNote(p); await K.wait(p, 200)
  }

  /* fb-e3: a landing typed "TBD" (desktop types; the phone never does) */
  if (key === 'd') {
    try {
      await K.setTxt(p, LD, 'TBD')
      const v = await p.evaluate(() => window.DAYS[5].waves[0].formations[0].ld)
      K.fact('FB', sz.name, 'the landing after typing TBD', v)
      if (/tbd/i.test(v)) {
        await scrollTo(LD); await K.wait(p, 400); await K.neutral(p)
        await p.evaluate(sel => document.querySelector(sel).classList.add('gw-noend'), LD)
        await labelUnder(p, LD, 'TBD counts as no landing')
        await shot(p, sz, 'fb-e3-tbd', [LD, TO, '#eWeek [data-slot="5.0.0.0.p"]', '#eWeek [data-slot="5.0.0.0.w"]', '#eWeek [data-txt="ff:5.0.0.cs"]', '#fb-lab'], 22)
        await labelOff(p)
      }
    } catch (e) { K.fact('FB', sz.name, 'TBD not drawn', String(e.message || e)) }
  }

  /* fb-f6: the Logic page's line, the words to build */
  await K.go(p, 'logic')
  const found = await p.evaluate(() => {
    const e = [...document.querySelectorAll('#page-logic *')].find(e => e.children.length === 0 && /^Every input closes the man/.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 0)
    if (!e) return null
    e.setAttribute('data-gwf6', 'line'); let row = e; for (let i = 0; i < 6 && row && !/An input closes its hours/.test(row.textContent || ''); i++) row = row.parentElement
    if (row) row.setAttribute('data-gwf6row', '1'); e.scrollIntoView({ block: 'center' }); return e.textContent.trim()
  })
  K.fact('FB', sz.name, 'the Logic line today', found)
  if (found) {
    await K.wait(p, 400)
    await p.evaluate(w => { document.querySelector('[data-gwf6="line"]').textContent = w }, W.f6)
    await K.markEl(p, '[data-gwf6="line"]', '')
    await shot(p, sz, 'fb-f6-logic-line', ['[data-gwf6row]', '[data-gwf6="line"]'], 14)
    await K.unmark(p)
  }
  if (p.errs.length) K.fact('FB', sz.name, 'page errors', p.errs)
  await b.close()
}

/* fb-f2: Hunter's OIL card on the Leave War, from draw-f.mjs's published Saturday, the words to build */
async function f2(key) {
  const st = path.join(K.STATE, 'f2-staged.json')
  if (!existsSync(st)) { K.fact('FB-F2', key, 'not drawn', 'no f2-staged.json'); return }
  const { b, p, sz } = await K.world(key, st)
  try {
    await K.signIn(p, 'ad', 'a')
    await K.go(p, 'leavewar')
    await p.waitForSelector('[data-testid^="row-"]', { timeout: 20000 }); await K.wait(p, 900)
    const bar = p.locator('[data-testid="figures-toggle"]')
    if ((await bar.count()) && (await bar.getAttribute('aria-expanded')) === 'true') { await bar.click(); await K.wait(p, 300) }
    const m = p.locator('[data-testid="month-july"]').filter({ visible: true }).first()
    if (await m.count()) { await m.click(); await K.wait(p, 900) }
    const cell = p.locator('[data-testid="cell-prowler-2026-07-18"]').first()
    await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await K.wait(p, 400)
    await cell.click(); await K.wait(p, 900)
    const where = await p.evaluate(() => {
      const ns = [...document.querySelectorAll('[data-testid="raptor-note"]')].filter(e => e.getBoundingClientRect().width > 0)
      const e = ns[ns.length - 1]; if (!e) return null
      e.setAttribute('data-gwf2', 'note'); const row = e.closest('.bidsheet-row'); row && row.setAttribute('data-gwf2', 'row')
      const sheet = e.closest('.bidsheet, [role="dialog"], [data-testid^="win-"]') || e.parentElement.parentElement.parentElement
      sheet.setAttribute('data-gwf2', 'sheet'); e.scrollIntoView({ block: 'center' }); return e.textContent.trim()
    })
    K.fact('FB-F2', sz.name, 'the card today', where)
    if (where) {
      await K.wait(p, 300); await K.neutral(p); await K.hideNote(p)
      await p.evaluate(w => { document.querySelector('[data-gwf2="note"]').textContent = w }, W.f2)
      await K.markEl(p, '[data-gwf2="note"]', '')
      await shot(p, sz, 'fb-f2-oil-card', ['[data-gwf2="sheet"]', '[data-gwf2="row"]'], 8)
    }
  } catch (e) { K.fact('FB-F2', sz.name, 'not drawn', String(e.message || e)) }
  await b.close()
}

const only = (process.env.GW_ONLY || 'd,p').split(',')
for (const k of only) { await run(k); await f2(k) }
K.saveFacts('fable')
renameSync(path.join(K.IMG, 'facts-fable.json'), path.join(OUT, 'facts-fable.json'))
