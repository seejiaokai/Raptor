// draw-s1-add - section 1, ledger row 1.14: "+ Add a person" in Admin → Users' TOP row and its form opened there (his
// D2652 N13 i: the search, Filter and "+ Add a person" one row at the very top, above "Waiting for access", the form
// opening under that row, the foot block gone; D2655 D1 the form and its Cancel; D2644 / N11 the pair measured from the
// app's own Save · Cancel on an opened row). The core's step 1b builds only this (plan §18.3): the rest of the page is
// today's - no jumps, today's order (the Admin → Users section adds those, §19.12).
// The page's own parts moved, nothing drawn by hand: the search row (.od-findrow) moved to the top of the Users pane;
// n176's addButton (cloned from Filter) beside Filter on a desktop, full width under the row on a phone; the page's own
// "Add a person" block moved under it, its heading hidden, its one wide button replaced by the measured pair.
// Hunter (142's admin, Plan of 149, View of 150 - n176's world) on 149: the Home squadron box would offer 149 and 142.
//  add-d / add-p          the recommended answer to NQ2: the form adds to the squadron in view - no Home squadron box
//  add-home-d / add-home-p  the other answer: the box kept, as built today
// Teal rings: the new button and the opened form (the search and Filter are today's, moved up to the top row).
//   node raptor-port/scripts/handpass/n191/draw-s1-add.mjs     (ONLY=add-d,add-p,add-home-d,add-home-p)
import { mk, closeAll, FACT, wait, hit, usersTab, reachPick, barSq, world, want, as, W, addButton, rowFootRef, footLikeRow, typeInto, boxOf, words, S1, tring, sshot, TMP1 } from './draw-s1-lib.mjs'
async function run(key, sz, fn) {
  const s = await mk(sz, { storageState: await world() })
  try { await fn(s) } catch (e) { FACT(`${key}.error`, String(e).split('\n')[0].slice(0, 300)); process.exitCode = 1; await s.page.screenshot({ path: `${TMP1}/${key}-error.png` }).catch(() => {}) } finally { await s.ctx.close().catch(() => {}) }
}
for (const [key, keepHome] of [['add', false], ['add-home', true]]) for (const sz of ['d', 'p']) if (want(`${key}-${sz}`)) await run(`${key}-${sz}`, sz, async s => {
  const k = `s1.${key}.${sz}`
  await as(s, 'hunter'); await reachPick(s, 149, s.desk ? 'bar' : 'menu'); await wait(s, 700)
  await usersTab(s); await wait(s, 500)
  FACT(`${k}.squadron`, await barSq(s))
  FACT(`${k}.today.order`, await words(s, '#admUsers > h4.adm-sub, #admUsers .od-head h4, #admUsers .od-head .adm-sub'))
  const ref = await rowFootRef(s, hit, 'osp9'); await s.page.evaluate(() => scrollTo(0, 0)); await wait(s, 200)
  FACT(`${k}.rowFootRef`, { gapBetween: ref.gapBetween, gapAbove: ref.gapAbove, save: ref.boxes.save, cancel: ref.boxes.cancel })
  const btn = await addButton(s, { ...W, addButton: S1.addButton }); FACT(`${k}.button`, btn)
  /* THE TOP ROW and THE FORM under it */
  const laid = await s.page.evaluate(({ save, cancel, keepHome, desk }) => {
    const q = sel => document.querySelector(sel)
    const users = q('#admUsers'), fr = q('.od-findrow'), add = q('#n176add')
    const bar = document.createElement('div'); bar.id = 's1bar'; bar.appendChild(fr)
    Object.assign(fr.style, { flex: 'none', width: '100%', margin: '0' })
    const sb = fr.querySelector('.searchbox'); if (sb) Object.assign(sb.style, { flex: '1 1 0', marginLeft: '0', minWidth: '0' })   /* the search takes the row, as round 6's j6 drew it */
    users.insertBefore(bar, users.firstChild)
    if (!desk) { bar.appendChild(add) }
    add.classList.add('on')
    const blk = q('#accAddBlock'); const sep = blk.previousElementSibling; if (sep && sep.tagName === 'HR') sep.style.display = 'none'
    blk.querySelector('h4.adm-sub').style.display = 'none'
    bar.insertAdjacentElement('afterend', blk)
    blk.style.marginTop = '10px'; blk.style.marginBottom = '18px'
    const home = q('#accAddHome'); let homeField = null
    if (home) { homeField = home.closest('label') || home.parentElement; if (homeField === blk) homeField = home; if (!keepHome) homeField.style.display = 'none' }
    blk.querySelector('#accAdd').style.display = 'none'
    const acts = document.createElement('div'); acts.className = 'acc-acts'; acts.id = 'n176acts'
    const a = document.createElement('button'); a.className = 'abtn primary'; a.type = 'button'; a.textContent = save; a.id = 'n176save'
    const c = document.createElement('button'); c.className = 'abtn'; c.type = 'button'; c.textContent = cancel; c.id = 'n176cancel'
    acts.append(a, c); blk.appendChild(acts)
    const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
    const next = blk.nextElementSibling
    return { home: home ? { offered: [...home.options].map(o => o.textContent), shown: keepHome, field: homeField.tagName + '.' + homeField.className } : 'no Home squadron box on this page', bar: r(bar), form: r(blk), afterForm: next ? (next.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) : null, footBlockLeft: !!users.querySelector(':scope > #accAddBlock:last-child') }
  }, { save: S1.addSave, cancel: S1.addCancel, keepHome, desk: s.desk })
  FACT(`${k}.laid`, laid)
  FACT(`${k}.typed`, await typeInto(s, '#accAddCs', 'Nova'))
  await s.page.evaluate(() => document.activeElement?.blur?.())
  FACT(`${k}.foot`, await footLikeRow(s, ref))
  await s.page.evaluate(desk => { if (desk) { scrollTo(0, 0); return } const h = document.querySelector('#s1bar').getBoundingClientRect(), bar = document.querySelector('.topbar').getBoundingClientRect(); scrollBy(0, h.top - bar.bottom - 10) }, s.desk); await wait(s, 300)
  const bar = await boxOf(s, '#s1bar'), form = await boxOf(s, '#accAddBlock')
  FACT(`${k}.onScreen`, { bar, form, pair: await words(s, '#n176acts button'), screenH: s.H, formFoot: form.y + form.h })
  const btnNow = await boxOf(s, '#n176add')
  const r1 = (await tring(s, btnNow, 'the new button')).ring, r2 = (await tring(s, form, 'the form')).ring
  await sshot(s, `${key}-${sz}`, [bar, r1, r2], 12)
})
await closeAll()
