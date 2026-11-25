// p6-a9 - P6 case A9 (the code read's row A9) for a PLAN holder: the "Welcome back" card's "Check my quals" on 149.
// SET-UP by presses (Saber, master admin, desktop, on 142): Admin → Users: Hunter's row → Archive (→ OK); the Archived
// fold → Hunter → Restore (so his next sign-in shows "Welcome back"); then Hunter's row → "Access to 149" Plan → Save
// (given after the restore - P5 found a restore does not carry an access line back).
// Then, in a fresh browser: Hunter signs in, picks 149 (top-bar picker; ☰ list on a phone): the card's words; "Check my
// quals" pressed: the bar, the page, whether his own row is on the page, what is outlined.
//   node raptor-port/scripts/handpass/n175/p6-a9.mjs <d|p>
// Pictures: p6-a9-<d|p>-1-card-on149, p6-a9-<d|p>-2-after-press
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, reachPick, barSq, pageOn, give, usersTab, saveState, state, toastNow, covered, SEC, via } from './p6-lib.mjs'
const SZ = process.argv[2] || 'd'
const k = `p6.a9.${SZ}`, P = `p6-a9-${SZ}`
const card = s => s.page.evaluate(() => { const e = [...document.querySelectorAll('#welcomeBack')].find(x => x.getBoundingClientRect().width > 0); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null })
async function setup() {
  const s = await mk('d'); const { page } = s
  try {
    await signIn(s, 'ad', 'a')
    await usersTab(s)
    await hit(s, page.locator('[data-person="prowler"] .acc-tap').first(), 700)
    await hit(s, '#accEdArchive', 900); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 700)
    FACT('p6.a9.setup.archived', await toastNow(s))
    if (await vis(s, '#accArchToggle[aria-expanded="false"]').count()) await hit(s, '#accArchToggle', 500)
    await hit(s, vis(s, '#accArchList .acc-tap').filter({ hasText: /Hunter/ }).first(), 700)
    await hit(s, '#accArRestore', 900); if (await vis(s, '#dlgOk').count()) await hit(s, '#dlgOk', 700)
    FACT('p6.a9.setup.restored', await toastNow(s))
    FACT('p6.a9.setup.hunterPlan149', await give(s, 'prowler', '149', 'plan'))
    return await saveState(s, 'a9')
  } finally { await s.ctx.close().catch(() => {}) }
}
try {
  console.log('p6-a9 v1', SZ)
  const st = await setup()
  const s = await mk(SZ, { storageState: st })
  try {
    await signIn(s, 'ad2', 'a2')
    FACT(`${k}.0.signedIn`, { ...(await state(s)), card: await card(s) })
    const p = await reachPick(s, 149, via(s)); FACT(`${k}.1.pick149`, { pressed: !!p.pressed, rows: p.listRows, ...(await state(s)), card: await card(s) })
    await shot(s, `${P}-1-card-on149`, ['#welcomeBack', s.desk ? '#sqnMenuBtn' : '.topbar .mark'], null, 24)
    const cov = await covered(s, '#welcomeCheck'); FACT(`${k}.2.control`, { control: 'Check my quals', covered: cov })
    if (cov === 'free') {
      await hit(s, '#welcomeCheck', 1200)
      const quals = await s.page.evaluate(() => {
        const p = document.querySelector('#page-quals'); if (!p || !p.classList.contains('on')) return 'Quals not in view'
        const rows = [...p.querySelectorAll('tr')].filter(r => r.getBoundingClientRect().height > 0 && /\bHunter\b/.test(r.innerText))
        const names = [...p.querySelectorAll('tbody tr')].filter(r => r.getBoundingClientRect().height > 0).map(r => (r.innerText || '').split(/\s+/)[0]).slice(0, 14)
        const focus = [...p.querySelectorAll('.outline, [data-focus], .focus, .qfocus, .ringed, .q-ring')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 60))
        return { hunterRowOnPage: rows.length > 0, firstNames: names, outlined: focus }
      })
      FACT(`${k}.3.afterPress`, { ...(await state(s)), card: await card(s), quals })
      await shot(s, `${P}-2-after-press`, [s.desk ? '#sqnMenuBtn' : '.topbar .mark', '#toastEl'], null, 24)
    }
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
