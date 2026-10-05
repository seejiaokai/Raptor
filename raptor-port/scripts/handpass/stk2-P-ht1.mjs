/* Walker P re-walk: H-T1 — Edit Schedule (then the Scheduler Board), Monday, desktop 1440x900. Click into a flying line's take-off box, change it by five minutes,
   press Tab, and keep pressing Tab through TEN more boxes changing nothing. After each Tab: the box with the caret; whether the box just left is still attached to the page;
   the new caret box's vertical position straight after and 300 ms later, and whether that very box is still attached and still has the caret. One change saved (one Undo step). */
import * as R from './stk2-P-run.mjs'
import * as W from './dbrA-W1-lib.mjs'
const { S, finish, nav, openBoard, boxList, clickBox, caret, label, sleep, pic, scopeSel, typeNow, seqN } = R
const PART = 'ht1'
for (const surf of ['week', 'board']) {
  await S(PART, 'H-T1-' + surf, `${surf === 'week' ? 'Edit Schedule week' : 'Scheduler Board'}, Monday: clicked into VL's take-off box (12:40), changed it by five minutes (12:45), pressed Tab, then Tab through ten more boxes typing nothing; after each Tab read the caret box, whether the box just left is still attached, the caret box's top straight after and 300 ms later`, {}, async page => {
    if (surf === 'week') await nav(page, 'editsched'); else await openBoard(page, 0)
    const scope = surf === 'week' ? scopeSel('week', 0) : scopeSel('board', 0)
    const list = await boxList(page, scope); const ix = list.findIndex(b => b.key === 'ff:0.0.0.to')
    const orig = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].to)
    const n0 = await seqN(page)
    await clickBox(page, scope, ix)
    const cur = (await page.evaluate(() => { const e = document.activeElement; return e.value !== undefined ? e.value : e.innerText }))
    // five minutes later
    const [hh, mm] = String(cur).split(':').map(Number); const t5 = String(hh).padStart(2, '0') + ':' + String(mm + 5).padStart(2, '0')
    await typeNow(page, t5)
    await page.evaluate(() => { window.__prev = document.activeElement })
    const rows = []
    for (let k = 0; k < 11; k++) {
      await page.evaluate(() => { window.__prev = document.activeElement; const r = window.__prev.getBoundingClientRect(); window.__prevTop = r.top })
      await page.keyboard.press('Tab')
      await sleep(25)
      const a = await page.evaluate(() => {
        const e = document.activeElement; const r = e ? e.getBoundingClientRect() : null
        window.__cur = e
        const key = e ? ['data-txt', 'data-bfld', 'data-inp', 'data-ifld', 'data-itline', 'data-bombs', 'data-area', 'data-atime'].map(k => e.hasAttribute(k) ? k.slice(5) + '=' + e.getAttribute(k) : null).find(Boolean) : null
        return { key: key || (e ? e.tagName : null), top: r ? Math.round(r.top * 10) / 10 : null, prevAttached: window.__prev ? window.__prev.isConnected : null, sameAsBefore: e === window.__prev, scrollY: Math.round(scrollY) }
      })
      await sleep(300)
      const b = await page.evaluate(() => { const e = document.activeElement; const r = e ? e.getBoundingClientRect() : null; return { top: r ? Math.round(r.top * 10) / 10 : null, curAttached: window.__cur ? window.__cur.isConnected : null, stillCaret: document.activeElement === window.__cur, scrollY: Math.round(scrollY) } })
      rows.push({ n: k + 1, key: a.key, prevBoxStillAttached: a.prevAttached, topAfter: a.top, top300: b.top, moved: a.top === null || b.top === null ? null : Math.round(Math.abs(b.top - a.top) * 10) / 10, caretBoxReplaced: !(b.curAttached && b.stillCaret), scrollMove: Math.abs(b.scrollY - a.scrollY) })
    }
    const pics = [await pic(page, `H-T1-${surf}-after-11-tabs`)]
    const n1 = await seqN(page)
    const saved = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].to)
    // one undo step: press the top bar's Undo once, the time returns; a second press has nothing from this run
    const undoSel = surf === 'week' ? '#undoBtn' : '#undoBtn, #sbUndo'
    let undo1 = null, undo2 = null
    const d1 = await W.door(page, surf === 'week' ? 'top' : 'board', 'undo')
    undo1 = await page.evaluate(() => window.DAYS[0].waves[0].formations[0].to)
    const d2 = await W.door(page, surf === 'week' ? 'top' : 'board', 'undo')
    undo2 = { first: d1, second: d2, afterSecond: await page.evaluate(() => window.DAYS[0].waves[0].formations[0].to) }
    pics.push(await pic(page, `H-T1-${surf}-after-undo`))
    const maxMove = Math.max(...rows.map(r => r.moved || 0))
    return { checks: [
      ['the take-off box changed by five minutes (' + orig + ' → ' + t5 + ') and saved', saved === t5 || String(saved).replace(':', '') === t5.replace(':', ''), { orig, saved, t5 }],
      ['every Tab landed in a box (a typing box, not the page or a bar): the eleven stops', rows.every(r => r.key && /=/.test(r.key)), rows.map(r => r.key).join(' > ')],
      ['no box just left was removed from the page (all still attached)', rows.every(r => r.prevBoxStillAttached === true), rows.filter(r => r.prevBoxStillAttached !== true).map(r => r.n)],
      ['no box under the caret was replaced (the caret box after each Tab is still attached and still has the caret 300 ms later)', rows.every(r => !r.caretBoxReplaced), rows.filter(r => r.caretBoxReplaced).map(r => r.n + ':' + r.key)],
      ['the caret box moved no more than 2 px in the 300 ms after each Tab; the page did not scroll', maxMove <= 2 && rows.every(r => r.scrollMove === 0), { maxMove, scrolls: rows.filter(r => r.scrollMove).map(r => r.n + ':' + r.scrollMove), tops: rows.map(r => r.topAfter + '→' + r.top300).join(' ') }],
      ['exactly one change saved (command count +1)', n1 === n0 + 1, { commands: n1 - n0 }],
      ['one Undo step takes the time back to ' + orig + ' and leaves Undo with nothing more', String(undo1).replace(':', '') === String(orig).replace(':', '') && (undo2.second.present && undo2.second.disabled === true), { undo1, undo2 }],
    ], pics }
  })
}
await finish(PART)
