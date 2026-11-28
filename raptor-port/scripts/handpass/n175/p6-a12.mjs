// p6-a12 - P6 case A12 (the code read's row A12): "… is already taken" on 149 for a callsign only 142 uses. Desktop.
// No set-up. Kestrel (149's admin) signs in: Admin → Users → "Add a person": Callsign "Ranger" (a 142 man; no 149 man
// has it) typed → the add button pressed: what the screen says, whether anyone was added. Then the same with "Ranger2"
// (a callsign nobody has), as a control, and Cancel-free: whether it adds.
//   node raptor-port/scripts/handpass/n175/p6-a12.mjs d
// Pictures: p6-a12-d-1-taken (the message ringed)
import { mk, closeAll, FACT, signIn, wait, vis, hit, shot, scratch, barSq, usersTab, typeIn, toastNow, SEC } from './p6-lib.mjs'
const SZ = 'd', k = `p6.a12.${SZ}`, P = `p6-a12-${SZ}`
const said = s => s.page.evaluate(() => [...document.querySelectorAll('#accAddBlock .od-err, #accAddBlock .cs-long, #accAddBlock [role=alert], #accAddBlock .adm-note, #accAddBlock .acc-err')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.textContent.trim()))
const rowsNamed = (s, n) => s.page.evaluate(n => [...document.querySelectorAll('#accList [data-person]')].map(e => e.innerText.replace(/\s+/g, ' ').trim().slice(0, 50)).filter(t => new RegExp('^' + n + '\\b').test(t)), n)
try {
  console.log('p6-a12 v1', SZ)
  const s = await mk(SZ)
  try {
    await signIn(s, 'ad9', 'a9')
    await usersTab(s)
    await typeIn(s, '#accAddCs', 'Ranger')
    await hit(s, '#accAdd', 800)
    FACT(`${k}.1.ranger`, { squadron: await barSq(s), toast: await s.page.evaluate(() => document.getElementById('toastEl')?.innerText.trim() ?? ''), toastShown: await toastNow(s), notes: await said(s), listRanger: await rowsNamed(s, 'Ranger') })
    await shot(s, `${P}-1-taken`, ['#toastEl', '#accAddCs', '.topbar .mark'], ['#toastEl', '#accAddBlock'], 16)
    await wait(s, 2500)
    await typeIn(s, '#accAddCs', 'Rangerx')
    await hit(s, '#accAdd', 800)
    FACT(`${k}.2.control`, { toast: await toastNow(s), listRangerx: await rowsNamed(s, 'Rangerx') })
    await scratch(s, SEC, `${P}-2-control`)
  } catch (e) { FACT(`${k}.error`, String(e).split('\n')[0].slice(0, 200)); await scratch(s, SEC, P + '-error').catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
} catch (e) { console.error('FAILED', String(e).split('\n')[0]); process.exitCode = 1 } finally { await closeAll() }
