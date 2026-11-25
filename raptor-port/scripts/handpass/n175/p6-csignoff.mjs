// p6-csignoff - P6 case C-signoff (the code read's row C3): 149's schedule, the sign-off boxes SKED CK, PLANNED BY,
// APPROVED BY (and CUR CK) - is Hunter (142's, Plan of 149) offered? a master admin (Saber)? Desktop.
// SET-UP by presses (Saber, on 142): Admin → Users: Hunter's row → "Access to 149" Plan → Save  = state "plan";
// then Quals → Edit → Hunter's Scheduler cell pressed → Done  = state "plan+sched" (the boxes offer only men carrying the
// Scheduler tick). For each state, a fresh browser: Kestrel (149's own admin) signs in on 149, Edit Schedule: each box of
// the first day drawn, its offered names; Hunter and Saber looked for. Then Kestrel opens SKED CK of that day (a press).
//   node raptor-port/scripts/handpass/n175/p6-csignoff.mjs d
// Pictures: p6-csignoff-<state>-d-1-boxes (the first day's boxes ringed)
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, shot, scratch, barSq, give, tick, saveState, SEC } from './p6-lib.mjs'
const SZ = 'd'
const boxes = s => s.page.evaluate(() => {
  const sel = [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0)
  const di = sel[0]?.getAttribute('data-signday')
  return sel.filter(e => e.getAttribute('data-signday') === di).map(e => {
    const names = [...e.options].map(o => o.text.trim()).filter(t => t && !/^[—–-]+$/.test(t))
    return { box: e.getAttribute('aria-label'), offered: names, hunter: names.some(n => /\bHunter\b/.test(n)), saber: names.some(n => /\bSaber\b/.test(n)), groups: [...e.querySelectorAll('optgroup')].map(g => g.label) }
  })
})
try {
  console.log('p6-csignoff v1', SZ)
  const st = {}
  { const s = await mk('d')
    try {
      await signIn(s, 'ad', 'a')
      FACT('p6.csignoff.setup.hunterPlan149', await give(s, 'prowler', '149', 'plan')); st.plan = await saveState(s, 'csign-plan')
      FACT('p6.csignoff.setup.hunterSchedTick', await tick(s, 'prowler', 'sched')); st['plan+sched'] = await saveState(s, 'csign-plansched')
    } finally { await s.ctx.close().catch(() => {}) } }
  for (const v of ['plan', 'plan+sched']) {
    const k = `p6.csignoff.${v}.${SZ}`, P = `p6-csignoff-${v.replace('+', '-')}-${SZ}`
    const s = await mk(SZ, { storageState: st[v] })
    try {
      await signIn(s, 'ad9', 'a9')
      await go(s, 'editsched'); await wait(s, 1200)
      FACT(`${k}.1.boxes`, { squadron: await barSq(s), boxes: await boxes(s) })
      await s.page.evaluate(() => { const sel = [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0); const di = sel[0]?.getAttribute('data-signday'); const p = sel[0]?.parentElement?.parentElement; if (p) p.setAttribute('data-n175ring', '1') })
      await shot(s, `${P}-1-boxes`, ['[data-n175ring]', '.topbar .mark'], null, 30)
      await s.page.evaluate(() => document.querySelectorAll('[data-n175ring]').forEach(e => e.removeAttribute('data-n175ring')))
      /* the demo's week is July 2026, before his Plan began (given today): "Jump to a date" → December → Mon 7 Dec */
      await hit(s, vis(s, 'button.wk-cal'), 700)
      for (let i = 0; i < 8; i++) { const t = await s.page.evaluate(() => document.querySelector('#weekCal')?.innerText.slice(0, 40) || ''); if (/December 2026/.test(t)) break; await hit(s, vis(s, '#weekCal button[aria-label="Next month"]').first(), 250) }
      await hit(s, vis(s, '#weekCal button').filter({ hasText: /^7$/ }).first(), 1200)
      FACT(`${k}.2.boxes7Dec`, { squadron: await barSq(s), week: await s.page.evaluate(() => [...document.querySelectorAll('.wk.on, .wk[aria-current], .wk.cur')].map(e => e.textContent.trim()).slice(0, 3)), boxes: await boxes(s) })
      await s.page.evaluate(() => { const sel = [...document.querySelectorAll('select[data-sign]')].filter(e => e.getBoundingClientRect().width > 0); const p = sel[0]?.parentElement?.parentElement; if (p) p.setAttribute('data-n175ring', '1') })
      await shot(s, `${P}-2-boxes-7dec`, ['[data-n175ring]', '.topbar .mark'], null, 30)
    } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
  }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
