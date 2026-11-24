// w-t - the re-walk of the second fix round, the Tracker items 3-6. SZ=d|pc ITEMS=3a,3b,4,5,6
// 3a/3b: a press held, Undo, the press let go, a ball added, a pick answered Save them: the ball saved on 142 (a ball; a link's end handle)
// 4: a drag held into the member view (Plan of 149, an unsaved edit): no hidden box, Logout and a pick still ask
// 5: Discard from + Add course keeps the editor and drops Connect's first ball
// 6: an Export abandoned by a pick while its file is written (the test stand-in for the file): nothing committed, no message
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, check, ask, hit, addEvent, hasEv, arrange, shut, tool, note, pickSq, press } from '../rewalk/rlib.mjs'
import { chartPrint, samePrint, inEditor, ready, hold, mousePress, ballPoint, trackerSaved, layoutDiff } from '../rewalk/ra-lib.mjs'
import { hunterOn149, Q, answerable, shortQ, where, roleSwitch } from '../rewalk/rb-lib.mjs'
const SZ = process.env.SZ || 'd', ITEMS = (process.env.ITEMS || '3a,3b,4,5,6').split(',')
console.log('w-t v1', SZ, ITEMS, process.env.MQ_PORT)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const stored = (s, unit, needle) => s.page.evaluate(([u, n]) => { const pre = `raptor:tracker/u${u}@`; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(pre) && (localStorage.getItem(k) || '').includes(n)) return k.slice(pre.length) } return null }, [unit, needle])
const undoNow = async s => { if (s.desk) { await s.page.keyboard.press('Control+z'); await wait(s, 400); return 'Ctrl+Z' } return (await mousePress(s, '#trUndoBtn')) ? 'Undo pressed by a second pointer' : 'Undo NOT reachable' }

for (const it of ITEMS) {
  const run = `w-t${it}-${SZ}`
  picsFor(run)
  if (it === '3a' || it === '3b') await step(run, async () => {
    const s = await mk(SZ)
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800); if (!s.desk) await shut(s)
    /* one plain ball move first, so Undo has a step to take */
    const b0 = await ready(s, 'ball'); check(`${run} set-up: a ball in reach`, !!b0, b0)
    { const h = await hold(s, b0.x, b0.y); await h.move(b0.x + 30, b0.y + 20); await h.up(); await wait(s, 500) }
    const kind = it === '3a' ? 'ball' : 'endhandle'
    const g = await ready(s, kind); check(`${run} set-up: the ${kind} grip in reach`, !!g, g)
    if (!g) { await s.ctx.close(); return }
    await pic(s, '01-before-press')
    const h = await hold(s, g.x, g.y); await h.move(g.x + 25, g.y + 25)
    const how = await undoNow(s); log(run, 'undo', how)
    await pic(s, '02-held-after-undo')
    await h.move(g.x + 50, g.y + 40); await h.up(); await wait(s, 500)
    await pic(s, '03-released')
    await arrange(s, false); await wait(s, 300)
    const added = await addEvent(s, `RW3${it[1].toUpperCase()}`)
    check(`${run}: the ball added`, added, added)
    const t = await T(s); await pic(s, '04-added')
    note('bar after the add', JSON.stringify({ dirty: t.dirty, saveStat: t.saveStat }))
    await pickSq(s, '149'); await wait(s, 400)
    const q = await ask(s); await pic(s, '05-question'); log('question', q)
    check(`${run}: the pick asks Save them`, /Save them before switching to 149\?/.test(q.msg || ''), q.msg)
    if (q.msg) await hit(s, '#dlgOk', 1200)
    if (!s.desk) await shut(s)
    const t2 = await T(s), q2 = await ask(s); await pic(s, '06-after-save-them')
    check(`${run}: on 149, no question left`, /^149/.test(t2.sq || '') && !q2.msg, { sq: t2.sq, q2 })
    const key = await stored(s, '142', `RW3${it[1].toUpperCase()}`)
    check(`${run}: the added ball is saved on 142`, !!key, key)
    check(`${run}: and not on 149`, !(await stored(s, '149', `RW3${it[1].toUpperCase()}`)), null)
    await pickSq(s, '142'); await wait(s, 900); if (!s.desk) await shut(s)
    const back = await hasEv(s, `RW3${it[1].toUpperCase()}`), t3 = await T(s); await pic(s, '07-back-on-142')
    check(`${run}: back on 142 the ball is on the chart, nothing unsaved`, back && !t3.dirty, { back, dirty: t3.dirty, sq: t3.sq })
    await s.ctx.close()
  })
  if (it === '4') await step(run, async () => {
    const s = await hunterOn149(SZ)
    const made = await addEvent(s, 'RW4'); check(`${run} set-up: an unsaved edit on 149 by Plan`, made, made)
    const g = await ready(s, 'bend'); check(`${run} set-up: a line's bend square in reach`, !!g, g)
    if (!g) { await s.ctx.close(); return }
    await pic(s, '01-before-press')
    const h = await hold(s, g.x, g.y); await h.move(g.x + 20, g.y + 30)
    let how
    if (s.desk) {
      let n = 0; for (; n < 90; n++) { await s.page.keyboard.press('Shift+Tab'); if (await s.page.evaluate(() => document.activeElement?.id) === 'roleBadge') break }
      if (await s.page.evaluate(() => document.activeElement?.id) !== 'roleBadge') await s.page.evaluate(() => document.getElementById('roleBadge').focus())
      await s.page.keyboard.press('Enter'); await wait(s, 700); how = `keyboard: Shift+Tab x${n + 1}, Enter on the role chip`
    } else {
      how = (await mousePress(s, '#burger')) && (await mousePress(s, '#drawerRole')) ? 'a second pointer: ☰, the role line' : 'role switch NOT reachable'
      await wait(s, 600)
    }
    log(run, how)
    await pic(s, '02-member-held')
    await h.move(g.x + 40, g.y + 50); await h.up(); await wait(s, 800)
    if (!s.desk) await shut(s)
    const w = await where(s), q = await Q(s), hidden = await s.page.evaluate(() => { const d = document.querySelector('#dlgModal'); if (!d) return null; const r = d.getBoundingClientRect(); return { box: [r.left, r.top, r.width, r.height].map(Math.round), msg: document.querySelector('#dlgMsg')?.textContent.trim() } })
    await pic(s, '03-released')
    check(`${run}: in the member view after the release`, /Back to the admin view/.test(w.role || '') || /Member/.test(w.badge || ''), w)
    check(`${run}: no question box at all (hidden or seen)`, !hidden, hidden)
    /* Logout: asks, seen; Stay */
    if (s.desk) await press(s, '#logout'); else { await press(s, '#burger'); await wait(s, 300); await press(s, '#drawerLogout') }
    await wait(s, 600)
    let q2 = await Q(s); await pic(s, '04-logout-asked')
    check(`${run}: Logout works: it asks, seen and answerable`, /Save them before logging out\?/.test(q2.msg || '') && answerable(q2), shortQ(q2))
    if (q2.up) { await hit(s, '#dlgCancel', 600) }
    if (!s.desk) await shut(s)
    await pickSq(s, '142'); await wait(s, 500)
    q2 = await Q(s); await pic(s, '05-pick-asked')
    check(`${run}: a pick works: it asks, seen and answerable`, /Save them before switching to 142\?/.test(q2.msg || '') && answerable(q2), shortQ(q2))
    if (q2.up) await hit(s, '#dlgCancel', 600)
    if (!s.desk) await shut(s)
    const w2 = await where(s); await pic(s, '06-stayed')
    check(`${run}: Stay keeps him on 149, signed in`, w2.sq.startsWith('149') && !w2.signedOut, w2)
    await s.ctx.close()
  })
  if (it === '5') await step(run, async () => {
    const s = await mk(SZ)
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800); if (!s.desk) await shut(s)
    await arrange(s, true); await wait(s, 300); const clean = await chartPrint(s); await arrange(s, false); await wait(s, 300)
    const a0 = await trackerSaved(s, '142')
    check(`${run} set-up: ball X added`, await addEvent(s, 'RW5X'), 'RW5X')
    const a1 = await trackerSaved(s, '142'); note('saved records the adding of X wrote', JSON.stringify(layoutDiff(a0, a1)))
    await arrange(s, true); await wait(s, 300); await tool(s, 'Connect'); await wait(s, 200)
    const xb = await s.page.locator('#flowSvg .ball', { hasText: 'RW5X' }).first().boundingBox()
    if (s.desk) await s.page.mouse.click(xb.x + xb.width / 2, xb.y + xb.height / 2); else await s.page.touchscreen.tap(xb.x + xb.width / 2, xb.y + xb.height / 2)
    await wait(s, 300); await pic(s, '01-connect-from-X')
    await hit(s, '#courseMenuBtn', 220); await hit(s, '#addCourse', 450)
    const a = await ask(s); await pic(s, '02-question')
    check(`${run}: + Add course asks about the unsaved edits`, /unsaved flow edits/.test(a.msg || ''), a.msg)
    await hit(s, '#dlgOk', 700)
    const n = await ask(s); await pic(s, '03-name-box')
    check(`${run}: after OK the name box`, /New course/i.test(n.msg || ''), n.msg)
    await hit(s, '#dlgCancel', 600)
    check(`${run}: still in Edit chart layout`, await inEditor(s), await inEditor(s))
    const b = await ballPoint(s); check(`${run}: ball B in reach`, !!b, b)
    const before = await chartPrint(s)
    if (s.desk) await s.page.mouse.click(b.x, b.y); else await s.page.touchscreen.tap(b.x, b.y)
    await wait(s, 500)
    const after = await chartPrint(s), t = await T(s); await pic(s, '04-after-B')
    check(`${run}: B gained no prerequisite (the links as saved)`, after.e === before.e && after.edges === clean.edges && after.e === clean.e, { before: before.edges, after: after.edges, clean: clean.edges })
    check(`${run}: the chart not marked unsaved`, !t.dirty, { dirty: t.dirty, stat: t.saveStat })
    check(`${run}: no saved record changed by the Discard, the Cancel and the click on B`, layoutDiff(a1, await trackerSaved(s, '142')).length === 0, layoutDiff(a1, await trackerSaved(s, '142')))
    await s.ctx.close()
  })
  if (it === '6') await step(run, async () => {
    const s = await mk(SZ); const { page } = s
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800); if (!s.desk) await shut(s)
    /* the stand-in: the picker answers at once; the file's write is held open by this script */
    const door = () => page.evaluate(() => {
      window.__f = { asked: 0, created: 0, wrote: 0, closed: 0, aborted: 0 }
      window.__pickSaveForTests = name => { window.__f.asked++; return Promise.resolve({ name, createWritable: async () => { window.__f.created++; return { write: t => new Promise(res => { window.__releaseWrite = () => { window.__f.wrote++; res() } }), close: async () => { window.__f.closed++ }, abort: async () => { window.__f.aborted++ } } } }) }
    })
    const f = () => page.evaluate(() => ({ ...window.__f }))
    await door()
    const a0 = await trackerSaved(s, '142')
    await hit(s, '#fileMenuBtn', 250); await hit(s, '#exportBtn', 450); await pic(s, '01-export-window'); await hit(s, '#copyOk', 500)
    const f0 = await f(); await pic(s, '02-writing')
    check(`${run}: the file is being written (stand-in)`, f0.created === 1 && f0.wrote === 0, f0)
    /* the pick while it writes: the size's own door, or the keys where the window covers it */
    const free = await page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(n => n.getBoundingClientRect().width > 1); if (!e) return 'none'; const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return t && (t === e || e.contains(t)) ? 'free' : `covered by ${t?.tagName}#${t?.id}` }, s.desk ? '#sqnMenuBtn' : '#burger')
    log('pick control', free)
    if (free === 'free') { await pickSq(s, '149'); if (!s.desk) await shut(s) }
    else {
      /* the Export window's shade covers the squadron control (as in the first re-walk): the pick by the keys */
      await page.evaluate(() => document.getElementById('sqnMenuBtn').focus())
      await page.keyboard.press('Enter'); await wait(s, 220)
      for (let i = 0; i < 8; i++) { const at = await page.evaluate(() => document.activeElement?.querySelector?.('.sqm-num')?.textContent.trim() ?? null); if (at === '149') break; await page.keyboard.press('ArrowDown'); await wait(s, 60) }
      await page.keyboard.press('Enter'); log('the pick by the keys: the window covers the control')
    }
    await wait(s, 600)
    const t1 = await T(s); await pic(s, '03-on-149-writing')
    check(`${run}: on 149 while the file is written`, /^149/.test(t1.sq || ''), { sq: t1.sq, free })
    await page.evaluate(() => window.__releaseWrite && window.__releaseWrite()); await wait(s, 1000)
    const f1 = await f(), q = await ask(s), t = await T(s); await pic(s, '04-after-write-ends')
    check(`${run}: no file committed (no close; aborted)`, f1.closed === 0 && f1.aborted >= 1, f1)
    check(`${run}: no success message`, !/Exported as/.test(q.msg || '') && !q.msg, q)
    check(`${run}: nothing saved by it`, layoutDiff(a0, await trackerSaved(s, '142')).length === 0, null)
    /* control: a fresh Export here, nothing picked: written and told */
    await door(); await hit(s, '#fileMenuBtn', 250); await hit(s, '#exportBtn', 450); await hit(s, '#copyOk', 500)
    await page.evaluate(() => window.__releaseWrite && window.__releaseWrite()); await wait(s, 1000)
    const f2 = await f(), q2 = await ask(s); await pic(s, '05-control-export')
    check(`${run}: control: with no pick the file is committed and told`, f2.closed === 1 && /Exported as/.test(q2.msg || ''), { f2, msg: q2.msg })
    await s.ctx.close()
  })
}
finish(`w-t-${SZ}-${ITEMS.join('')}`); await closeAll()
