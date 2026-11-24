// rb-i2 v1 - item 2: the held draft is kept and asked about. (a) a real bell line opening one of his own pages, pressed in the
// member view over the draft; (b) Logout in the member view: Stay, Discard, Save. SZ=d|p|pc. ONLY=a|b|c to run one flow.
import { finish, closeAll, picsFor, step, hasEv, go, mk, signIn, grant, logout, as, ask } from './rlib.mjs'
import { Q, answerable, shortQ, where, savedBoth, savedDiff, answerQ, heldDraft, hunterOn149, SAVE, DISCARD, STAY, roleSwitch, wait, note, check, pic, press, pickSq, shut } from './rb-lib.mjs'
import { bell } from '../walk/jc-lib.mjs'
const SZ = process.env.SZ || 'd', ONLY = process.env.ONLY || ''
const tag = `rb-i2-${SZ}${ONLY ? '-' + ONLY : ''}`
console.log('rb-i2 v5', SZ, ONLY, process.env.MQ_PORT)
picsFor(tag)
const WIN = '.floatwin.inpedwin'
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(300) }
/* the input's window as drawn: on the Inputs page a floating window, on any other page the same form centred (#inpEditPop) */
const winShown = s => s.page.locator('#inpEditPop').filter({ visible: true }).count().then(n => n > 0)

/* Saber files an input for Hunter on 142 by the Inputs page: that puts a line on Hunter's bell */
async function saberFilesForHunter(s) {
  const { page } = s
  await go(s, 'inputs'); await shut(s); await wait(s, 350)
  if (await page.locator('#inMemberMode').filter({ visible: true }).count()) await tapIt(s, '#inMemberMode')
  await tapIt(s, '#inListBtn'); await wait(s, 250); await tapIt(s, '#inNew')
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
  await page.selectOption('#inpEditPerson', v)
  const day = () => page.locator(`${WIN} button[aria-label^="Tue 8 Dec 2026"]`).first()
  for (let i = 0; i < 8 && !(await day().count()); i++) await tapIt(s, page.locator(`${WIN} button[aria-label="Next month"]`).first())
  await tapIt(s, day()); await page.fill('#inpEditRmk', 'rb2 for hunter'); await tapIt(s, '#inpEditSave'); await wait(s, 450)
  for (let i = 0; i < 3; i++) {
    const nd = page.locator('button', { hasText: /^No document$/ }).filter({ visible: true }); if (await nd.count()) await tapIt(s, nd.first())
    if ((await ask(s)).msg) await tapIt(s, '#dlgOk')
  }
  check('set-up: Saber filed the input and its window closed', !(await winShown(s)), await winShown(s))
}
/* Hunter's world with that line on his bell */
async function worldWithLine() {
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
async function openList(s) {
  for (let i = 0; i < 4 && !(await bell.isOpen(s)); i++) { await tapIt(s, bellBtn(s)); await wait(s, 250) }
  return bell.isOpen(s)
}
const theLine = s => s.page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /8 Dec/ }).first()
const logoutPress = async (s, name) => {
  if (s.desk) return press(s, '#logout', name)
  await press(s, '#burger'); await wait(s, 300)
  return press(s, '#drawerLogout', name)
}
/* a sign-in on the card itself, no page load: what was in memory stays in memory, as for a person */
async function cardSignIn(s, user, pass) {
  await s.page.waitForSelector('#luser'); await s.page.fill('#luser', user); await s.page.fill('#lpass', pass)
  await s.page.click('#loginForm button[type=submit]'); await s.page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 }); await wait(s, 900)
}
const kept = async (s, name) => { await roleSwitch(s, 'to-admin'); await wait(s, 600); await go(s, 'tracker'); await shut(s); await wait(s, 1300); const w = await where(s); const has = await hasEv(s, name); return { has, w } }

try {
  if (!ONLY || ONLY === 'a') await step('(a) a real bell line over the held draft', async () => {
    const s = await worldWithLine()
    await heldDraft(s, 'RB2A'); const saved0 = await savedBoth(s); await pic(s, 'a01-held')
    check('the bell list opens in the member view', await openList(s), await bell.isOpen(s))
    const lines = await bell.lines(s); note('lines', JSON.stringify(lines.slice(0, 5))); await pic(s, 'a02-bell-open')
    check('his bell carries the line of the input', (await theLine(s).count()) > 0, lines.slice(0, 2))
    await tapIt(s, theLine(s)); await wait(s, 700)
    let q = await Q(s), w = await where(s); note('after the line', JSON.stringify(shortQ(q)), JSON.stringify(w)); await pic(s, 'a03-after-line')
    check('the line asks first, in the words', /Save them before switching to 142\?/.test(q.msg || ''), q.msg)
    check('the question is seen and answerable', answerable(q), shortQ(q))
    check('he has not moved to the other squadron while asked', w.sq.startsWith('149'), w)
    check('the page of the line (its input window) has not opened before he answers', !(await winShown(s)), { win: await winShown(s) })

    await answerQ(s, STAY, 'a04-stay'); q = await Q(s); w = await where(s); note('after Stay', JSON.stringify(w))
    check('Stay: question gone, still on 149', !q.up && w.sq.startsWith('149'), { q: shortQ(q), w })
    const left = await winShown(s); check('Stay: no window of the line left open over the page', !left, { win: left })
    if (left) {
      const cover = await s.page.evaluate(() => { const c = [...document.querySelectorAll('#roleBadge,#burger')].find(e => e.getBoundingClientRect().width > 0); if (!c) return null; const r = c.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { chip: c.id, free: t === c || c.contains(t), at: t ? `${t.tagName}.${String(t.className).slice(0, 40)}` : null } })
      note('with that window up, the role chip or menu:', JSON.stringify(cover))
      await tapIt(s, '#inpEditCancel'); await wait(s, 400); const q2 = await Q(s); note('Cancel on the window', JSON.stringify(shortQ(q2)))
      if (q2.up) await tapIt(s, '#' + q2.btns[q2.btns.length - 1].id)
      await wait(s, 300); check('that window closes by its Cancel', !(await winShown(s)), await winShown(s)); await pic(s, 'a04b-window-closed')
    }
    if (await bell.isOpen(s)) await bell.close(s)
    const k = await kept(s, 'RB2A'); await pic(s, 'a05-draft-kept')
    check('after Stay the draft is still on 149 in the admin view', k.has && k.w.sq.startsWith('149'), k)
    check('nothing written so far', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))

    await roleSwitch(s, 'a06-to-member'); await wait(s, 500)
    check('the bell list opens again', await openList(s), await bell.isOpen(s))
    await tapIt(s, theLine(s)); await wait(s, 700)
    q = await Q(s); await pic(s, 'a06-asked-again')
    check('the line asks again', /Save them before switching to 142\?/.test(q.msg || '') && answerable(q), shortQ(q))
    await answerQ(s, DISCARD, 'a07-discard'); await wait(s, 500)
    q = await Q(s); w = await where(s); const win = await winShown(s); note('after Discard', JSON.stringify(w), 'window', win); await pic(s, 'a07-landed')
    check('Discard: he lands on 142 and the line opens his page', !q.up && w.sq.startsWith('142') && (win || w.page === 'page-inputs'), { q: shortQ(q), w, win })
    check('nothing written by the Discard', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))
    await s.ctx.close()
  })

  /* the window the line left open after Stay: what do its own Save and Delete reach, with the page on 149? */
  if (ONLY === 'e') await step('(a2) the window left open after Stay: its Save', async () => {
    const s = await worldWithLine()
    await heldDraft(s, 'RB2E'); const saved0 = await savedBoth(s)
    const where2 = () => s.page.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); const v = localStorage.getItem(k) || ''; if (v.includes('rb2 ')) out.push(k + ' => ' + (v.match(/rb2 [a-z0-9 ]+/g) || []).join(',')) } return out })
    note('the remark is stored at', JSON.stringify(await where2()))
    await openList(s); await tapIt(s, theLine(s)); await wait(s, 700); await pic(s, 'e01-question')
    await answerQ(s, STAY, 'e02-stay')
    check('the window is up after Stay', await winShown(s), await winShown(s))
    await s.page.fill('#inpEditRmk', 'rb2 edited over 149'); await pic(s, 'e03-typed')
    await tapIt(s, '#inpEditSave'); await wait(s, 700)
    const q = await Q(s), w = await where(s); note('after its Save', JSON.stringify(shortQ(q)), JSON.stringify(w), 'window', await winShown(s)); await pic(s, 'e04-after-save')
    if (q.up) { await tapIt(s, '#' + q.btns[q.btns.length - 1].id); await wait(s, 400) }
    note('the remark is now stored at', JSON.stringify(await where2()))
    check('still on 149 with the chart records unwritten', w.sq.startsWith('149') && savedDiff(saved0, await savedBoth(s)).length === 0, { w, diff: savedDiff(saved0, await savedBoth(s)) })
    if (await winShown(s)) { await tapIt(s, '#inpEditCancel'); await wait(s, 400) }
    const k = await kept(s, 'RB2E'); await pic(s, 'e05-draft')
    check('the draft survives', k.has && k.w.sq.startsWith('149'), k)
    await s.ctx.close()
  })

  /* what the window says once Discard has taken him to 142: against the same line pressed with no draft (the control) */
  if (ONLY === 'f') for (const draft of [false, true]) await step(`(a3) the line's window on 142, ${draft ? 'after Discard over a draft' : 'control: no draft'}`, async () => {
    const t = draft ? 'f2' : 'f1'
    const s = await worldWithLine()
    if (draft) await heldDraft(s, 'RB2F'); else { await roleSwitch(s, 'f1-to-member'); await wait(s, 500) }
    const rec = () => s.page.evaluate(() => { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith('raptor:inputs/')) continue; const v = localStorage.getItem(k) || ''; if (v.includes('rb2 ')) { const o = JSON.parse(v); const f = {}; for (const n of Object.keys(o)) if (/unit|^u$|sq|rmk|remark|person|^pid$|^who$/i.test(n)) f[n] = o[n]; return f } } return null })
    const look = () => s.page.evaluate(() => {
      const shown = e => !!e && e.getBoundingClientRect().width > 1
      const b = document.querySelector('[data-testid="inped-moveband"]'), sv = document.querySelector('#inpEditSave'), r = document.querySelector('#inpEditRmk')
      const dead = e => !e ? null : e.matches(':disabled') || e.readOnly === true || !!e.closest('[inert]') || getComputedStyle(e).pointerEvents === 'none' || e.getAttribute('aria-disabled') === 'true'
      return { band: shown(b) ? b.textContent.replace(/\s+/g, ' ').trim() : null, saveOff: sv ? dead(sv) : null, remarkOff: shown(r) ? dead(r) : 'no box' }
    })
    note(t, 'the input is stored as', JSON.stringify(await rec()))
    await openList(s); await tapIt(s, theLine(s)); await wait(s, 700)
    if (draft) { await pic(s, `${t}-01-question`); await answerQ(s, DISCARD, `${t}-02-discard`); await wait(s, 500) }
    let w = await where(s), L = await look(); await pic(s, `${t}-03-window-on-142`); note(t, 'on', JSON.stringify(w), 'window', JSON.stringify(L))
    check(`${t}: he is on 142 with the input's window`, w.sq.startsWith('142') && await winShown(s), { sq: w.sq, page: w.page, win: await winShown(s) })
    check(`${t}: the window does not say the input is another squadron's, and is not locked`, !L.band && L.saveOff === false, L)
    if (L.band) {
      /* the greyed Save pressed by its point, as a person would: does it write, or say anything? */
      const r0 = await rec(), box = await s.page.locator('#inpEditSave').first().boundingBox()
      if (box) { const x = box.x + box.width / 2, y = box.y + box.height / 2; const top = await s.page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}#${e.id}` : null }, [x, y]); if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y); await wait(s, 500); note(t, 'Save pressed under the band; at its point', top, 'window still', await winShown(s), 'stored', JSON.stringify(await rec()), 'unchanged', JSON.stringify(r0) === JSON.stringify(await rec())); await pic(s, `${t}-03b-save-pressed`) }
      if (!(await winShown(s))) { await s.ctx.close(); return }
      await tapIt(s, s.page.locator('[data-testid="inped-moveband"] button', { hasText: /^Close$/ }).first()); await wait(s, 500)
      const after = await where(s); note(t, 'after the band Close', JSON.stringify(after), 'window', await winShown(s)); await pic(s, `${t}-04-band-closed`)
      await openList(s); await tapIt(s, theLine(s)); await wait(s, 700)
      L = await look(); await pic(s, `${t}-05-line-again`); note(t, 'the line pressed again', JSON.stringify(L))
      check(`${t}: pressed again on 142 the window is the ordinary one`, await winShown(s) && !L.band && L.saveOff === false, L)
    }
    await s.ctx.close()
  })

  if (!ONLY || ONLY === 'b') await step('(b) Logout in the member view: Stay, then Discard', async () => {
    const s = await hunterOn149(SZ)
    await heldDraft(s, 'RB2B'); const saved0 = await savedBoth(s); await pic(s, 'b01-held')
    await logoutPress(s, 'b02-logout'); await wait(s, 600)
    let q = await Q(s), w = await where(s); note('at Logout', JSON.stringify(shortQ(q)), JSON.stringify(w)); await pic(s, 'b02-asked')
    check('Logout asks, in the words', /Save them before logging out\?/.test(q.msg || ''), q.msg)
    check('the question is seen and answerable', answerable(q), shortQ(q))
    check('still signed in while asked', !w.signedOut, w)
    await answerQ(s, STAY, 'b03-stay'); q = await Q(s); w = await where(s); note('after Stay', JSON.stringify(w))
    check('Stay: still signed in on 149', !q.up && !w.signedOut && w.sq.startsWith('149'), { q: shortQ(q), w })
    await logoutPress(s, 'b04-logout2'); await wait(s, 600); q = await Q(s); await pic(s, 'b04-asked-again')
    check('Logout asks again after Stay', /Save them before logging out\?/.test(q.msg || '') && answerable(q), shortQ(q))
    await answerQ(s, DISCARD, 'b05-discard'); await wait(s, 500)
    w = await where(s); note('after Discard', JSON.stringify(w)); await pic(s, 'b05-signed-out')
    check('Discard: signed out', w.signedOut, w)
    check('nothing written by the Discard', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))
    await cardSignIn(s, 'ad2', 'a2'); await wait(s, 500)
    w = await where(s); note('signed in again', JSON.stringify(w))
    if (!w.sq.startsWith('149')) { await pickSq(s, '149'); await shut(s); await wait(s, 1000) }
    await go(s, 'tracker'); await shut(s); await wait(s, 1500); w = await where(s); await pic(s, 'b06-149-after-signin')
    check('after signing in again the edit is gone from 149', w.sq.startsWith('149') && !(await hasEv(s, 'RB2B')), { w, has: await hasEv(s, 'RB2B') })
    await s.ctx.close()
  })

  if (!ONLY || ONLY === 'c') await step('(b) Logout in the member view: Save them', async () => {
    const s = await hunterOn149(SZ)
    await heldDraft(s, 'RB2C'); const saved0 = await savedBoth(s); await pic(s, 'c01-held')
    await logoutPress(s, 'c02-logout'); await wait(s, 600)
    let q = await Q(s); await pic(s, 'c02-asked')
    check('Logout asks', /Save them before logging out\?/.test(q.msg || '') && answerable(q), shortQ(q))
    await answerQ(s, SAVE, 'c03-save'); q = await Q(s); let w = await where(s); note('after Save them', JSON.stringify(shortQ(q)), JSON.stringify(w))
    check('Save them shows "This change could not be saved."', /This change could not be saved\./.test(q.msg || ''), q.msg)
    check('the refusal is seen and answerable', answerable(q), shortQ(q))
    check('still signed in behind the refusal', !w.signedOut, w)
    check('nothing written', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))
    await answerQ(s, q.btns[0] ? '#' + q.btns[0].id : SAVE, 'c04-ok'); await wait(s, 400)
    q = await Q(s); w = await where(s); note('after OK', JSON.stringify(shortQ(q)), JSON.stringify(w))
    check('after OK: no question, signed in, on 149', !q.up && !w.signedOut && w.sq.startsWith('149'), { q: shortQ(q), w })
    check('still nothing written', savedDiff(saved0, await savedBoth(s)).length === 0, savedDiff(saved0, await savedBoth(s)))
    const k = await kept(s, 'RB2C'); await pic(s, 'c05-draft-kept')
    check('the draft is still on 149 in the admin view', k.has && k.w.sq.startsWith('149'), k)
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
