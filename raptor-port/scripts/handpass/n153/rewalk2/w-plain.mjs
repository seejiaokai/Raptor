// w-plain - the re-walk of the second fix round, the plain-user round: open and save an input, a bell line with no draft, a chart
// edit made and saved, Undo of it, picks between the squadrons. SZ=d|pc. Every step is a press; the page is only read.
import { finish, closeAll, picsFor, step, go, mk, signIn, logout, ask, hasEv, addEvent, T, hit } from '../rewalk/rlib.mjs'
import { where, wait, note, check, pic, press, pickSq, shut } from '../rewalk/rb-lib.mjs'
import { bell } from '../walk/jc-lib.mjs'
const SZ = process.env.SZ || 'd', tag = `w-plain-${SZ}`
console.log('w-plain v1', SZ, process.env.MQ_PORT)
picsFor(tag)
const WIN = '.floatwin.inpedwin'
const tapIt = async (s, loc) => { const l = typeof loc === 'string' ? s.page.locator(loc).filter({ visible: true }).first() : loc; if (s.desk) await l.click(); else await l.tap(); await s.page.waitForTimeout(300) }
const winShown = s => s.page.locator('#inpEditPop').filter({ visible: true }).count().then(n => n > 0)
const rmk = s => s.page.locator('#inpEditRmk').filter({ visible: true }).first().inputValue().catch(() => null)
const stored = (s, unit, needle) => s.page.evaluate(([u, n]) => { const pre = `raptor:tracker/u${u}@`; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(pre) && !k.includes(':lay') && (localStorage.getItem(k) || '').includes(n)) return k.slice(pre.length) } return null }, [unit, needle])
try {
  await step('plain', async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a')
    /* 1. a new input for Hunter, saved (it also puts a line on his bell); then opened again and its remark changed and saved */
    await go(s, 'inputs'); await shut(s); await wait(s, 350)
    if (await page.locator('#inMemberMode').filter({ visible: true }).count()) await tapIt(s, '#inMemberMode')
    await tapIt(s, '#inListBtn'); await wait(s, 250); await tapIt(s, '#inNew')
    const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
    await page.selectOption('#inpEditPerson', v)
    const day = () => page.locator(`${WIN} button[aria-label^="Tue 8 Dec 2026"]`).first()
    for (let i = 0; i < 8 && !(await day().count()); i++) await tapIt(s, page.locator(`${WIN} button[aria-label="Next month"]`).first())
    await tapIt(s, day()); await page.fill('#inpEditRmk', 'rw2 plain'); await pic(s, '01-new-input'); await tapIt(s, '#inpEditSave'); await wait(s, 450)
    for (let i = 0; i < 3; i++) { const nd = page.locator('button', { hasText: /^No document$/ }).filter({ visible: true }); if (await nd.count()) await tapIt(s, nd.first()); if ((await ask(s)).msg) await tapIt(s, '#dlgOk') }
    check('the new input saved, its window closed', !(await winShown(s)), await winShown(s)); await pic(s, '02-saved')
    const row = page.locator('#inBody tr[data-iid], #inList [data-iid]', { hasText: 'rw2 plain' }).filter({ visible: true }).first()
    check('its row is in the list', (await row.count()) > 0, await row.count())
    const op = row.locator('[data-testid="in-open"]'); await tapIt(s, (await op.count()) ? op.first() : row); await wait(s, 500)
    check('opened again with its remark', (await rmk(s)) === 'rw2 plain', await rmk(s))
    await page.locator('#inpEditRmk').filter({ visible: true }).first().fill('rw2 plain edited'); await pic(s, '03-edited'); await tapIt(s, '#inpEditSave'); await wait(s, 500)
    for (let i = 0; i < 2; i++) if ((await ask(s)).msg) await tapIt(s, '#dlgOk')
    const row2 = page.locator('#inBody tr[data-iid], #inList [data-iid]', { hasText: 'rw2 plain edited' }).filter({ visible: true })
    check('the edit saved and shows in the list', !(await winShown(s)) && (await row2.count()) > 0, await row2.count()); await pic(s, '04-edit-saved')
    /* 2. Hunter, no draft anywhere: the bell line opens the input's own window at once */
    await logout(s); await signIn(s, 'ad2', 'a2'); await wait(s, 500)
    for (let i = 0; i < 4 && !(await bell.isOpen(s)); i++) { await tapIt(s, page.locator('#notifyBell').filter({ visible: true }).first()); await wait(s, 250) }
    await pic(s, '05-bell')
    const line = page.locator('[data-testid="bell-list"] .bl-line').filter({ hasText: /8 Dec/ }).first()
    check('his bell carries the line', (await line.count()) > 0, (await bell.lines(s)).slice(0, 2))
    await tapIt(s, line); await wait(s, 700)
    const q = await ask(s), w = await where(s); await pic(s, '06-line-opened')
    check('the line opens his input with no question, on his Inputs', !q.msg && await winShown(s) && w.page === 'page-inputs' && (await rmk(s)) === 'rw2 plain edited', { q: q.msg, w, rmk: await rmk(s) })
    check('no band on it', !(await page.locator('[data-testid="inped-moveband"]').filter({ visible: true }).count()), null)
    await tapIt(s, '#inpEditCancel'); await wait(s, 400)
    await logout(s); await signIn(s, 'ad', 'a')
    /* 3. a chart edit made and saved; then Undo */
    await go(s, 'tracker'); await shut(s); await wait(s, 1800)
    check('a ball added', await addEvent(s, 'RW2P'), 'RW2P')
    let t = await T(s); await pic(s, '07-chart-edit'); check('marked unsaved', t.dirty, t.saveStat)
    await hit(s, '#saveChanges', 900)
    t = await T(s); await pic(s, '08-saved'); check('Save changes: saved', !t.dirty && !!(await stored(s, '142', 'RW2P')), { dirty: t.dirty, stat: t.saveStat })
    const u = await s.page.evaluate(() => { const b = document.getElementById('trUndoBtn'); return b ? { on: !b.disabled, title: b.title } : null })
    note('the Undo button after Save changes', JSON.stringify(u))
    if (!u?.on) {
      note('an added ball, once saved by Save changes, has no Undo: as the Tracker rulings have it (an undo before the save)')
      /* the chart edit that Undo does take: a ball moved (it saves itself), then Undo */
      const { ready, hold } = await import('../rewalk/ra-lib.mjs')
      const { arrange } = await import('../rewalk/rlib.mjs')
      const b = await ready(s, 'ball'); const before = await s.page.locator(b.sel).first().getAttribute('transform')
      const h = await hold(s, b.x, b.y); await h.move(b.x + 40, b.y + 30); await h.up(); await wait(s, 600)
      const moved = await s.page.locator(b.sel).first().getAttribute('transform'); await pic(s, '09a-ball-moved')
      check('a ball moved, saved by itself', moved !== before && !(await T(s)).dirty, { before, moved, stat: (await T(s)).saveStat })
      await hit(s, '#trUndoBtn', 900)
      const back = await s.page.locator(b.sel).first().getAttribute('transform'), t9 = await T(s); await pic(s, '09b-move-undone')
      check('Undo puts the ball back', back === before, { before, back, dirty: t9.dirty, stat: t9.saveStat })
      if (t9.dirty) { await hit(s, '#saveChanges', 900) }
      await arrange(s, false); await wait(s, 300)
      t = await T(s); check('saved after the Undo', !t.dirty, t.saveStat)
    } else {
    await hit(s, '#trUndoBtn', 900)
    t = await T(s); const gone = !(await hasEv(s, 'RW2P')); await pic(s, '09-undone')
    note('after Undo', JSON.stringify({ gone, dirty: t.dirty, stat: t.saveStat, stored: await stored(s, '142', 'RW2P') }))
    check('Undo takes the ball off the chart', gone, { dirty: t.dirty, stat: t.saveStat })
    if (t.dirty) { await hit(s, '#saveChanges', 900); t = await T(s) }
    check('after Undo (and its save, where asked) the saved chart has no ball', !(await stored(s, '142', 'RW2P')) && !t.dirty, { stat: t.saveStat })
    }
    /* 4. picks between the squadrons */
    await pickSq(s, '149'); await shut(s); await wait(s, 900); let t1 = await T(s); await pic(s, '10-on-149')
    check('picked 149, no question', /^149/.test(t1.sq || '') && !(await ask(s)).msg, t1.sq)
    await pickSq(s, '142'); await shut(s); await wait(s, 900); t1 = await T(s); await pic(s, '11-back-on-142')
    check('back on 142, no question', /^142/.test(t1.sq || '') && !(await ask(s)).msg, t1.sq)
    await s.ctx.close()
  })
} finally { finish(tag); await closeAll() }
