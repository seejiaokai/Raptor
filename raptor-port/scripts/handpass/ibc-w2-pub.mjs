// W2: S03, S05, S06 — "Make public" on published days. Run per the brief (port 4396).
import { L, pubDay, face, editWeek, showDay, closeBoard, toGoOut, closeChg, sleep, npub, dayKeys, typeNote, head, pressPub, viewNotes, undoTitle, reloadIn } from './ibc-w2-lib.mjs'
const { check, note, shot } = L
console.log('ibc-w2-pub v1')
const { page } = await L.session('desktop')
const W3 = 'Brief 0700 main room'

/* ---------- S03 — Wed 15 Jul (di 2): note typed, ORIG published scheduler-only ---------- */
{
  const DI = 2
  await typeNote(page, 'pn', DI, W3)
  const p = await pubDay(page, false, DI)
  note('S03', `published: ${JSON.stringify(p)}`)
  const f0 = await face(page, DI)
  check('S03', 'premise: ORIG, nothing pending, signed', f0 && f0.tag === 'ORIG' && !f0.pend.length && !/Not yet/.test(f0.nys), f0)
  const h0 = await head(page, 'pn', DI)
  note('S03', `before: header/button/tooltip ${JSON.stringify(h0)}`)
  await pressPub(page, 'pn', DI)
  const toast = await L.toastText(page), nts = await L.notes(page)
  note('S03', `toast after Make public: ${JSON.stringify(toast)}; notes seen: ${JSON.stringify(nts)}`)
  const h1 = await head(page, 'pn', DI)
  note('S03', `after: ${JSON.stringify(h1)}`)
  const f1 = await face(page, DI)
  note('S03', `face after: ${JSON.stringify(f1)}`)
  check('S03', 'EXPECTED day reads 1 pending and sign-offs fall (Not yet signed)', f1.pend.join(' ').includes('1 pending') && /Not yet signed/.test(f1.nys), f1)
  await shot(page, 'S03', 'desktop', 'week-after-public')
  const vn = await viewNotes(page, DI)
  check('S03', 'EXPECTED view-only still shows NO note before the AL', vn && !vn.notes.some(t => t.includes(W3)), vn)
  await shot(page, 'S03', 'desktop', 'view-before-AL')
  const tgo = await toGoOut(page, DI, ['S03', 'desktop', 'to-go-out'])
  note('S03', `To go out: ${JSON.stringify(tgo.text)}`)
  check('S03', 'EXPECTED To go out lists the note', /note/i.test(tgo.text) && /public/i.test(tgo.text), tgo.text)
  note('S03', 'RECORD (EXPECTED says label/toast/tooltip must not claim it is on view-only already): toast=' + JSON.stringify(toast) + ' label=' + JSON.stringify(h1 && h1.btn) + ' tooltip=' + JSON.stringify(h1 && h1.title))
  await closeChg(page)
  /* board copy */
  await L.go(page, 'editsched')
  await page.locator(`#eWeek [data-sbday="${DI}"]:visible`).first().click(); await page.waitForSelector('#schedBoard'); await sleep(700)
  const bh = await page.evaluate(i => { const b = document.querySelector(`#schedBoard [data-notepub="pn:${i}"]`); const h = b && b.closest('.sb-nh'); return b ? { head: h ? (h.textContent || '').replace(/\s+/g, ' ').trim() : null, btn: b.textContent.trim(), title: b.title, on: b.classList.contains('on') } : null }, DI)
  note('S03', `Board toggle state: ${JSON.stringify(bh)}`)
  await shot(page, 'S03', 'desktop', 'board-public')
  await closeBoard(page)
  const p2 = await pubDay(page, false, DI)
  note('S03', `AL published: ${JSON.stringify(p2)}`)
  const f2 = await face(page, DI)
  check('S03', 'EXPECTED after AL: 0 pending', f2 && !f2.pend.length, f2)
  const v2 = await viewNotes(page, DI)
  check('S03', 'EXPECTED view-only shows "Notes · Brief 0700"', v2 && v2.notes.some(t => t.includes(W3)), v2)
  await shot(page, 'S03', 'desktop', 'view-after-AL')
}

/* ---------- S05 — Thu 16 Jul (di 3): EMPTY Sims note on a published day ---------- */
{
  const DI = 3
  const p = await pubDay(page, false, DI)
  const f0 = await face(page, DI)
  check('S05', 'premise: ORIG nothing pending signed', f0 && f0.tag === 'ORIG' && !f0.pend.length && !/Not yet/.test(f0.nys), f0)
  const h0 = await head(page, 'sn', DI)
  note('S05', `sims note header before: ${JSON.stringify(h0)}; day note keys ${JSON.stringify(await dayKeys(page, DI))}`)
  if (!h0 || !h0.btn) L.notWalked('S05', 'premise: no Make public toggle on the empty Sims note: ' + JSON.stringify(h0))
  else {
    await pressPub(page, 'sn', DI)
    note('S05', `toast: ${JSON.stringify(await L.toastText(page))}; npub ${JSON.stringify(await npub(page, DI))}`)
    const f1 = await face(page, DI)
    note('S05', `face after: ${JSON.stringify(f1)}`)
    await shot(page, 'S05', 'desktop', 'after-public-empty')
    const tgo = await toGoOut(page, DI, ['S05', 'desktop', 'to-go-out'])
    note('S05', `To go out: ${JSON.stringify(tgo.text)}`)
    await closeChg(page)
    await pressPub(page, 'sn', DI)
    const f2 = await face(page, DI)
    note('S05', `face after tapping back: ${JSON.stringify(f2)} (sign-offs restored? nys="${f2.nys}")`)
    note('S05', `note header after back: ${JSON.stringify(await head(page, 'sn', DI))}`)
    await shot(page, 'S05', 'desktop', 'after-back')
  }
}

/* ---------- S06 — Fri 17 Jul (di 4): public and back, undo, reload, edit text ---------- */
{
  const DI = 4
  await typeNote(page, 'pn', DI, 'Fri brief 0800')
  await pubDay(page, false, DI)
  const f0 = await face(page, DI)
  check('S06', 'premise: ORIG nothing pending signed', f0 && f0.tag === 'ORIG' && !f0.pend.length && !/Not yet/.test(f0.nys), f0)
  const h0 = await head(page, 'pn', DI)
  note('S06', `note box/class scheduler-only: ${JSON.stringify(h0)}`)
  await pressPub(page, 'pn', DI)
  const f1 = await face(page, DI)
  check('S06', '(1) Make public -> 1 pending, sign-offs fall', f1.pend.join(' ').includes('1 pending') && /Not yet signed/.test(f1.nys), f1)
  const h1 = await head(page, 'pn', DI)
  note('S06', `note box when public+pending: ${JSON.stringify(h1)}`)
  await shot(page, 'S06', 'desktop', '1-public')
  await pressPub(page, 'pn', DI)
  const f2 = await face(page, DI)
  check('S06', '(2) tap again -> 0 pending, sign-offs back', !f2.pend.length && !/Not yet/.test(f2.nys), f2)
  const tgo = await toGoOut(page, DI, ['S06', 'desktop', '2-back-to-go-out'])
  note('S06', `(2) To go out: ${JSON.stringify(tgo.text)}`); await closeChg(page)
  const h2 = await head(page, 'pn', DI)
  check('S06', '(2) note pending colour gone: box class same as before (scheduler-only)', h2 && h0 && h2.boxCls === h0.boxCls && h2.boxParentCls === h0.boxParentCls, { before: h0, after: h2 })
  await shot(page, 'S06', 'desktop', '2-back')
  /* (3) via Undo */
  await pressPub(page, 'pn', DI)
  const fa = await face(page, DI); note('S06', `(3) re-public face: ${JSON.stringify(fa)}`)
  await page.locator('#undoBtn').click(); await sleep(600)
  const f3 = await face(page, DI)
  check('S06', '(3) Undo -> 0 pending, sign-offs back, npub gone', !f3.pend.length && !/Not yet/.test(f3.nys) && (await npub(page, DI)) === null, { f3, npub: await npub(page, DI), notes: await L.notes(page) })
  const h3 = await head(page, 'pn', DI)
  note('S06', `(3) note box after Undo: ${JSON.stringify(h3)}`)
  await shot(page, 'S06', 'desktop', '3-after-undo')
  /* (4) reload after public */
  await pressPub(page, 'pn', DI)
  await reloadIn(page)
  const f4 = await face(page, DI)
  check('S06', '(4) reload: still 1 pending and public in working copy', f4.pend.join(' ').includes('1 pending') && JSON.stringify(await npub(page, DI)) === '["pn"]', { f4, npub: await npub(page, DI) })
  /* (5) edit text while public */
  const box = page.locator(`#eWeek .blknote.ed[data-txt="pn:${DI}"]`).first()
  await showDay(page, DI); await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await box.click(); await page.keyboard.press('End'); await page.keyboard.type(' extra'); await page.locator('#eWeek').evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(500)
  const f5 = await face(page, DI)
  note('S06', `(5) after text edit face: ${JSON.stringify(f5)}`)
  const tg5 = await toGoOut(page, DI, ['S06', 'desktop', '5-to-go-out'])
  note('S06', `(5) To go out: ${JSON.stringify(tg5.text)} lines ${JSON.stringify(tg5.lines)}`); await closeChg(page)
  await pubDay(page, false, DI)
  const v5 = await viewNotes(page, DI)
  check('S06', '(5) publish -> view-only shows new text', v5 && v5.notes.some(t => t.includes('Fri brief 0800 extra')), v5)
  await shot(page, 'S06', 'desktop', '5-view')
}
await page.context().close()
await L.finish('pub')
