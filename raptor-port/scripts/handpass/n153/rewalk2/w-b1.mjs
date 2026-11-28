// w-b1 - the re-walk of the second fix round, item 2 (B1). Saber files an input for Hunter on 142; Hunter with Plan of 149 picks 149,
// makes a chart edit, switches to the member view, opens the bell and presses the "You were added" line. SZ=d|pc.
import { finish, closeAll, picsFor, step, go, mk, signIn, grant, logout, ask, hasEv } from '../rewalk/rlib.mjs'
import { Q, answerable, shortQ, where, savedBoth, savedDiff, answerQ, heldDraft, SAVE, DISCARD, STAY, roleSwitch, wait, note, check, pic, press, pickSq, shut } from '../rewalk/rb-lib.mjs'
import { bell } from '../walk/jc-lib.mjs'
const SZ = process.env.SZ || 'd', tag = `w-b1-${SZ}`
console.log('w-b1 v1', SZ, process.env.MQ_PORT)
picsFor(tag)
const WIN = '.floatwin.inpedwin'
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(300) }
const winShown = s => s.page.locator('#inpEditPop').filter({ visible: true }).count().then(n => n > 0)
async function saberFilesForHunter(s) {
  const { page } = s
  await go(s, 'inputs'); await shut(s); await wait(s, 350)
  if (await page.locator('#inMemberMode').filter({ visible: true }).count()) await tapIt(s, '#inMemberMode')
  await tapIt(s, '#inListBtn'); await wait(s, 250); await tapIt(s, '#inNew')
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
  await page.selectOption('#inpEditPerson', v)
  const day = () => page.locator(`${WIN} button[aria-label^="Tue 8 Dec 2026"]`).first()
  for (let i = 0; i < 8 && !(await day().count()); i++) await tapIt(s, page.locator(`${WIN} button[aria-label="Next month"]`).first())
  await tapIt(s, day()); await page.fill('#inpEditRmk', 'rw2 for hunter'); await tapIt(s, '#inpEditSave'); await wait(s, 450)
  for (let i = 0; i < 3; i++) {
    const nd = page.locator('button', { hasText: /^No document$/ }).filter({ visible: true }); if (await nd.count()) await tapIt(s, nd.first())
    if ((await ask(s)).msg) await tapIt(s, '#dlgOk')
  }
  check('set-up: Saber filed the input and its window closed', !(await winShown(s)), await winShown(s))
}
async function world() {
  const s = await mk(SZ)
  await signIn(s, 'ad', 'a')
  check('set-up: Saber gave Hunter Plan of 149', await grant(s, 'prowler', '149', 'plan'), 'prowler plan 149')
  await saberFilesForHunter(s)
  await logout(s); await signIn(s, 'ad2', 'a2')
  await go(s, 'tracker'); await shut(s); await wait(s, 1800)
  await pickSq(s, '149'); await shut(s); await wait(s, 1100)
  return s
}
const bellBtn = s => s.page.locator('#notifyBell').filter({ visible: true }).first()
async function openList(s) { for (let i = 0; i < 4 && !(await bell.isOpen(s)); i++) { await tapIt(s, bellBtn(s)); await wait(s, 250) } return bell.isOpen(s) }
const theLine = s => s.page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /8 Dec/ }).first()
const look = s => s.page.evaluate(() => {
  const shown = e => !!e && e.getBoundingClientRect().width > 1
  const b = document.querySelector('[data-testid="inped-moveband"]'), sv = document.querySelector('#inpEditSave'), r = document.querySelector('#inpEditRmk')
  const dead = e => !e ? null : e.matches(':disabled') || e.readOnly === true || !!e.closest('[inert]') || getComputedStyle(e).pointerEvents === 'none' || e.getAttribute('aria-disabled') === 'true'
  return { band: shown(b) ? b.textContent.replace(/\s+/g, ' ').trim() : null, saveOff: sv ? dead(sv) : null, remarkOff: shown(r) ? dead(r) : 'no box', rmk: r?.value ?? null }
})
try {
  await step('B1', async () => {
    const s = await world()
    await heldDraft(s, 'RW2B'); const saved0 = await savedBoth(s); await pic(s, '01-held-draft-member')
    check('the bell list opens in the member view', await openList(s), await bell.isOpen(s))
    note('lines', JSON.stringify((await bell.lines(s)).slice(0, 5))); await pic(s, '02-bell-open')
    check('his bell carries the "You were added" line', (await theLine(s).count()) > 0 && /You were added/.test(await theLine(s).innerText()), (await bell.lines(s)).slice(0, 2))
    await tapIt(s, theLine(s)); await wait(s, 700)
    let q = await Q(s), w = await where(s); await pic(s, '03-question')
    note('after the line', JSON.stringify(shortQ(q)), JSON.stringify(w))
    check('asked, in the words', /Save them before switching to 142\?/.test(q.msg || ''), q.msg)
    check('the question is seen and answerable', answerable(q), shortQ(q))
    check('no window opens under the question', !(await winShown(s)), await winShown(s))
    check('still on 149 while asked', w.sq.startsWith('149'), w)
    await answerQ(s, STAY, '04-stay'); q = await Q(s); w = await where(s); note('after Stay', JSON.stringify(w))
    check('Stay: question gone, on 149', !q.up && w.sq.startsWith('149'), { q: shortQ(q), w })
    check('Stay: no window', !(await winShown(s)), await winShown(s))
    check('Stay: nothing written', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))
    if (await bell.isOpen(s)) await bell.close(s)
    await wait(s, 300)
    check('the bell list opens again', await openList(s), await bell.isOpen(s)); await pic(s, '05-bell-again')
    await tapIt(s, theLine(s)); await wait(s, 700)
    q = await Q(s); await pic(s, '06-asked-again')
    check('the line asks again, still no window', /Save them before switching to 142\?/.test(q.msg || '') && answerable(q) && !(await winShown(s)), shortQ(q))
    await answerQ(s, DISCARD, '07-discard'); await wait(s, 700)
    q = await Q(s); w = await where(s); const win = await winShown(s), L = await look(s); await pic(s, '08-landed')
    note('after Discard', JSON.stringify(w), 'window', win, JSON.stringify(L))
    check('Discard: on 142, on his Inputs', !q.up && w.sq.startsWith('142') && w.page === 'page-inputs', { q: shortQ(q), w })
    check('Discard: the ordinary window for that line', win && L.rmk === 'rw2 for hunter', { win, rmk: L.rmk })
    check('Discard: no untrue band, not locked', !L.band && L.saveOff === false, L)
    check('Discard: nothing written', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))
    await tapIt(s, '#inpEditCancel'); await wait(s, 400)
    check('the window closes by its Cancel', !(await winShown(s)), await winShown(s)); await pic(s, '09-closed')
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
