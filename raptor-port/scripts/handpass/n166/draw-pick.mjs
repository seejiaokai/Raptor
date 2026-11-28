// draw-pick - [MSQ-PICK-GUARD] step 2, pictures 1-3 and 7: the refusal note (R1, R2) and the refresh note F2.
//  p1 (desktop): Saber, an Input window open with typed words, the bar's squadron picker pressed for 149.
//     TODAY: the pick pressed through (step 1's way). AFTER: the picker pressed and its list opened, then closed again as
//     the built guard would (the pick did not happen) - the window as it was - and the note R1.
//  p2 (desktop): the same window, the name badge (the member-view switch) pressed. TODAY pressed through; AFTER nothing
//     changes and the note R2 (the badge is one press, so nothing is pressed in the drawing).
//  p3 (phone 402x874): Leave War's My leave open, ☰ → its squadron list → 149. TODAY pressed through; AFTER ☰ and its list
//     opened, the list and the menu closed again as the guard would, and the note R1.
//  p7 (desktop): F2 drawn over an Input window with typed words (no TODAY: this build cannot notice another tab's change).
//   node raptor-port/scripts/handpass/n166/draw-pick.mjs        (ONLY=p1,p2,p3,p7)
// Each picture in a fresh browser of its own. Pictures: drawn/p<n>-<d|p>-<today|after>[-crop].png
import { mk, closeAll, FACT, signIn, go, shut, windowsNow, reachPick, reachView, barSq, roleNow, wait, covered } from './lib.mjs'
import { hit, vis, openInput, inputWin, shot, blocked, refreshCard } from './draw-lib.mjs'
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean)
const want = k => !ONLY.length || ONLY.includes(k)
const R1 = 'Blocked: close the open window, then pick 149.'
const R2 = 'Blocked: close the open window, then switch to the member view.'
const F2 = { title: 'Your access has changed', body: 'An admin changed what you can do here. Refresh and sign in again to carry on. Anything you hadn\'t saved is lost.' }
const listRows = (s, sel) => s.page.evaluate(sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()), sel)
const state = async s => ({ squadron: await barSq(s), role: (await roleNow(s)).badge || (await roleNow(s)).menuLine, window: await inputWin(s) })

async function run(key, fn) {
  const s = await mk(/-p-/.test(key) ? '402x874' : 'd')
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 200)); process.exitCode = 1 } finally { await s.ctx.close().catch(() => {}) }
}

/* the picker pressed and its list opened, then closed again by the picker itself - the pick does not happen */
async function pickerOpenedAndClosed(s, key) {
  await hit(s, '#sqnMenuBtn', 400)
  FACT(`${key}.listOpened`, await listRows(s, '#sqnMenu .sqm-row'))
  await hit(s, '#sqnMenuBtn', 400)
  const left = await listRows(s, '#sqnMenu .sqm-row')
  if (left.length) { await s.page.keyboard.press('Escape'); await wait(s, 300) }
  FACT(`${key}.listClosed`, !(await listRows(s, '#sqnMenu .sqm-row')).length)
}

if (want('p1')) {
  await run('p1-d-today', async s => {
    await signIn(s, 'ad', 'a'); const o = await openInput(s, 0); FACT('p1.d.today.opened', o)
    FACT('p1.d.today.press', await reachPick(s, 149, 'bar')); await wait(s, 700)
    FACT('p1.d.today.after', await state(s))
    await shot(s, 'p1-d-today'); await shot(s, 'p1-d-today-crop', ['.inpedwin'])
  })
  await run('p1-d-after', async s => {
    await signIn(s, 'ad', 'a'); const o = await openInput(s, 0); FACT('p1.d.after.opened', o)
    await pickerOpenedAndClosed(s, 'p1.d.after')
    await blocked(s, 'p1.d.after', R1)
    FACT('p1.d.after.state', await state(s))
    await shot(s, 'p1-d-after'); await shot(s, 'p1-d-after-crop', ['#toastEl', '.inpedwin'])
  })
}
if (want('p2')) {
  await run('p2-d-today', async s => {
    await signIn(s, 'ad', 'a'); FACT('p2.d.today.opened', await openInput(s, 0))
    FACT('p2.d.today.press', await reachView(s)); await wait(s, 700)
    FACT('p2.d.today.after', await state(s))
    FACT('p2.d.today.footer', await s.page.evaluate(() => [...document.querySelectorAll('.inpedwin *')].filter(e => !e.children.length && /Only .* can change this/.test(e.textContent)).map(e => e.textContent.trim())[0] || null))
    await shot(s, 'p2-d-today'); await shot(s, 'p2-d-today-crop', ['.inpedwin', '#roleBadge'])
  })
  await run('p2-d-after', async s => {
    await signIn(s, 'ad', 'a'); FACT('p2.d.after.opened', await openInput(s, 0))
    FACT('p2.d.after.badge', { words: (await roleNow(s)).badge, covered: await covered(s, '#roleBadge') })
    await blocked(s, 'p2.d.after', R2)
    FACT('p2.d.after.state', await state(s))
    await shot(s, 'p2-d-after'); await shot(s, 'p2-d-after-crop', ['#toastEl', '.inpedwin', '#roleBadge'])
  })
}
const myLeave = async s => { await go(s, 'leavewar'); await s.page.waitForSelector('[data-testid="my-leave"]', { timeout: 15000 }); await hit(s, '[data-testid="my-leave"]', 800) }
const sheetSel = '.bidsheet, .floatwin, [role=dialog]'
if (want('p3')) {
  await run('p3-p-today', async s => {
    await signIn(s, 'ad', 'a'); await myLeave(s); FACT('p3.p.today.window', (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)))
    FACT('p3.p.today.press', await reachPick(s, 149, 'menu')); await wait(s, 700)
    FACT('p3.p.today.after', { squadron: await barSq(s), windows: (await windowsNow(s)).map(w => ({ what: w.what, words: w.words.slice(0, 140), buttons: w.buttons })) })
    await shot(s, 'p3-p-today'); await shot(s, 'p3-p-today-crop', [sheetSel, '.topbar'])
  })
  await run('p3-p-after', async s => {
    await signIn(s, 'ad', 'a'); await myLeave(s)
    FACT('p3.p.after.window', (await windowsNow(s)).map(w => w.what + ': ' + w.words.slice(0, 80)))
    FACT('p3.p.after.burger', await covered(s, '#burger'))
    await hit(s, '#burger', 400)
    if (!(await s.page.locator('#drawerSqnList').count())) await hit(s, '#drawerSqnBtn', 400)
    FACT('p3.p.after.listOpened', await listRows(s, '#drawerSqnList .sqm-row'))
    await shut(s)
    FACT('p3.p.after.menuClosed', !(await s.page.evaluate(() => document.querySelector('#drawer')?.classList.contains('open'))))
    await s.page.locator('h1, h2, .bs-title, .sheet-title').filter({ visible: true }).first().evaluate(e => e.blur && e.blur()).catch(() => {})
    await blocked(s, 'p3.p.after', R1)
    FACT('p3.p.after.state', { squadron: await barSq(s), windows: (await windowsNow(s)).map(w => w.what) })
    await shot(s, 'p3-p-after'); await shot(s, 'p3-p-after-crop', ['#toastEl', sheetSel, '.topbar'])
  })
}
if (want('p7')) {
  await run('p7-d-after', async s => {
    await signIn(s, 'ad', 'a'); FACT('p7.d.after.opened', await openInput(s, 0))
    FACT('p7.d.after.under', await state(s))
    await refreshCard(s, 'p7.d.after', F2)
    await shot(s, 'p7-d-after'); await shot(s, 'p7-d-after-crop', ['#n166card'], 60)
  })
}
await closeAll()
void vis
