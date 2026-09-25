/* The HOST's walk of the three situations Fable's code read named as un-walked (evidence sheet §7), on the production
   build, written as assertions of the RIGHT behaviour so a PASS means correct (bug-check order §5).
   1. Unpublish the Original, then re-publish it with DIFFERENT signers → the "Signed ORIG" line names the NEW four,
      on the edit week, the board and View-only Sched; while unpublished there is no Signed line and no seal (D95, D102,
      D111; the 18 Sep 26 unpublish ruling: it comes back as the same label).
   2. Undo straight after a publish → the day is back to unpublished (Undo of a publish IS an unpublish, owner 18 Sep 26,
      which clears the sign-offs to be signed again), no Signed line, no seal;
      Redo → published again, the Signed line names the same four (the one undo; D95).
   3. A parked plan as the working copy with the pending list open (D99, D100, D103): the list closes when the plans
      menu opens; each plan's list shows ITS OWN change only, and agrees with the count; a tap stays on the page.
   Usage (from raptor-port/, a preview on 4173): node scripts/handpass/am/hr-04-fable-three.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
process.env.HP_SHOTS = `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/rewalk-fable3/${W}`
const L = await import('./w2-lib.mjs')
const W1 = await import('./w1-lib.mjs')
const { openHi, editWeek, board, closeBoard, signDay, publishDay, unpublish, head, go, check, note, summary, altPlan, planMenuItems, menuClose, editText } = L
const { toastSpy, toasts, norm } = W1
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
const shot = (page, name) => page.screenshot({ path: `${process.env.HP_SHOTS}/${name}.png` })
const names = s => Object.values(s).filter(x => x && !/NO /.test(x))

async function signedLine(page, di, where = 'week') {
  if (where === 'view') {
    await go(page, 'viewsched'); await page.waitForTimeout(400)
    const t = await page.evaluate(i => { const e = document.querySelector(`#vWeek .day[data-day="${i}"] .signedln`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '' }, di)
    await go(page, 'editsched'); await page.waitForTimeout(400); return t
  }
  if (where === 'board') {
    await board(page, di)
    const t = await page.evaluate(() => { const e = [...document.querySelectorAll('#schedBoard .signedln')].find(x => x.offsetWidth); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '' })
    await closeBoard(page); return t
  }
  await editWeek(page)
  return page.evaluate(i => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] .signedln`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '' }, di)
}
const seal = (page, di) => page.evaluate(i => { const c = document.querySelector(`#eWeek .day[data-day="${i}"] .verchip`); return c ? { text: c.innerText.trim(), orig: c.classList.contains('orig') } : null }, di)
const signsNow = async (page, di) => (await head(page, di)).signs
async function openList(page, di) {
  await editWeek(page)
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-pendlist="${di}"]:visible`).first()
  if (!(await b.count())) return null
  await b.evaluate(e => e.scrollIntoView({ block: 'center' })); await b.click(); await page.waitForTimeout(500)
  return page.evaluate(() => ({ head: (document.querySelector('#pendList .pl-head')?.innerText || '').replace(/\s+/g, ' '),
    rows: [...document.querySelectorAll('#pendList .pl-item')].map(e => e.innerText.replace(/\s+/g, ' ').trim()) }))
}
const listOpen = page => page.evaluate(() => { const b = document.querySelector('#pendList'); return !!(b && b.offsetWidth) })
const num = s => { const m = /(\d+)/.exec(String(s || '')); return m ? +m[1] : 0 }

let { browser, page, errors } = await openHi({ ...SIZE, dpr: 1, state: null })
await toastSpy(page)

/* ---- 1. unpublish the Original, re-publish with different signers ---- */
try {
  await editWeek(page)
  const s1 = await signDay(page, 0, 0); await publishDay(page, 0); await toasts(page)
  const L1 = await signedLine(page, 0)
  note('1-first', `signed ${JSON.stringify(s1)} → "${L1}", seal ${JSON.stringify(await seal(page, 0))}`)
  const u = await unpublish(page, 0); await toasts(page)
  const hu = await head(page, 0), Lu = await signedLine(page, 0), su = await seal(page, 0)
  await shot(page, '1-a-unpublished')
  check('1-a unpublished: no Signed line, no ORIG seal', u.pressed && !Lu && !(su && su.orig), `unpublish ${JSON.stringify(u)}; tag ${JSON.stringify(su)}, line "${Lu}", signs ${hu.signs.join('|')}`)
  const s2 = await signDay(page, 0, 3); const p2 = await publishDay(page, 0); await toasts(page)
  const L2 = await signedLine(page, 0), B2 = await signedLine(page, 0, 'board'), V2 = await signedLine(page, 0, 'view'), s2e = await seal(page, 0)
  await editWeek(page); await shot(page, '1-b-republished')
  const want = names(s2), old = names(s1).filter(n => !want.includes(n))
  const has = t => want.every(n => t.includes(n)) && old.every(n => !t.includes(n))
  check('1-b re-published: the seal is ORIG again', p2.pressed && s2e && s2e.orig && /ORIG/.test(s2e.text), JSON.stringify(s2e))
  check('1-c the Signed line names the NEW four on the week, the board and View-only Sched', has(L2) && has(B2) && has(V2),
    `new ${JSON.stringify(want)} (old-only ${JSON.stringify(old)}) — week "${L2}" · board "${B2}" · view "${V2}"`)
} catch (e) { check('1-crash', false, String(e && e.stack || e)) }

/* ---- 2. undo straight after a publish, then redo ---- */
try {
  await editWeek(page)
  const s = await signDay(page, 1, 1); const before = await signsNow(page, 1)
  await publishDay(page, 1); await toasts(page)
  const Lp = await signedLine(page, 1), sp = await seal(page, 1)
  const ul = await page.evaluate(() => document.querySelector('#undoBtn')?.title || '')
  note('2-published', `signed ${JSON.stringify(s)}; seal ${JSON.stringify(sp)}; line "${Lp}"; undo reads "${ul}"`)
  await page.locator('#undoBtn').click(); await page.waitForTimeout(900)
  const tu = await toasts(page)
  const hu = await head(page, 1), Lu = await signedLine(page, 1), su = await seal(page, 1)
  await shot(page, '2-a-after-undo')
  /* the owner's 18 Sep 26 ruling (undo-contract.md §Publish boundary; memory undo-of-publish-semantics): Undo of a
     published day IS an unpublish, and an unpublish CLEARS the day's sign-offs — they are signed again before it goes
     out. Unchanged by this batch (no undo or unpublish file differs from main). */
  const blankSigns = hu.signs.every(x => !x || /name/.test(x))
  check('2-a Undo = unpublish: back to unpublished, sign-offs cleared to sign again, no Signed line, no seal', !Lu && !(su && su.orig) && blankSigns && !!hu.beak,
    `toast ${JSON.stringify(tu)}; tag ${JSON.stringify(su)}; line "${Lu}"; signs ${hu.signs.join('|')} (before publish ${before.join('|')}); publish button ${JSON.stringify(hu.beak)}`)
  await page.locator('#redoBtn').click(); await page.waitForTimeout(900)
  const tr = await toasts(page)
  const Lr = await signedLine(page, 1), sr = await seal(page, 1)
  await shot(page, '2-b-after-redo')
  check('2-b Redo: published again, the Signed line names the same four', sr && sr.orig && Lr === Lp && names(s).every(n => Lr.includes(n)), `toast ${JSON.stringify(tr)}; tag ${JSON.stringify(sr)}; line "${Lr}" (was "${Lp}")`)
} catch (e) { check('2-crash', false, String(e && e.stack || e)) }

/* ---- 3. a parked plan as the working copy, with the pending list open ---- */
try {
  await editWeek(page)
  const key = await page.evaluate(() => { const e = [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].find(x => x.offsetWidth && /^(gr|dr|fr|ap|sr):/.test(x.dataset.txt)); return e ? e.dataset.txt : null })
  note('3-cell', `the remark cell used: ${key}`)
  const made = await altPlan(page, 0); await toasts(page)
  const hB = await head(page, 0)
  note('3-plans', `+ Alt Plan: ${made}; selector "${norm(hB.selector)}", pending "${norm(hB.pending)}"`)
  await editText(page, key, 'PLANB EDIT'); await toasts(page)
  const cB = norm((await head(page, 0)).pending), lB = await openList(page, 0)
  await shot(page, '3-a-planB-list')
  check('3-a Plan B: the count and the list agree, the list names Plan B\'s change', num(cB) === 1 && lB && lB.rows.length === 1 && /PLANB EDIT/.test(lB.rows[0]), `"${cB}" · ${JSON.stringify(lB)}`)
  const items = await planMenuItems(page, 0)
  const closed = !(await listOpen(page))
  check('3-b the list closes when the plans menu opens', closed, `list open after opening the menu: ${!closed}; menu ${JSON.stringify(items.map(i => i.text))}`)
  const other = page.locator('.wavemenu .wm[data-plansel]:visible').first()
  const toName = (await other.count()) ? (await other.innerText()).replace(/\s+/g, ' ').trim() : null
  if (toName) { await other.click(); await page.waitForTimeout(900) } else await menuClose(page)
  const hA = await head(page, 0)
  note('3-switched', `to "${toName}": selector "${norm(hA.selector)}", pending "${norm(hA.pending)}"`)
  check('3-c the parked plan (the day as issued) reads nothing pending, and no list is left open', !!toName && !num(hA.pending) && !(await listOpen(page)), `pending "${norm(hA.pending)}"`)
  await editText(page, key, 'PLANA EDIT'); await toasts(page)
  const cA = norm((await head(page, 0)).pending), lA = await openList(page, 0)
  await shot(page, '3-d-planA-list')
  check('3-d Plan A: its own change only, the count and the list agree', num(cA) === 1 && lA && lA.rows.length === 1 && /PLANA EDIT/.test(lA.rows[0]) && !/PLANB/.test(lA.rows.join(' ')), `"${cA}" · ${JSON.stringify(lA)}`)
  const line = page.locator('#pendList [data-plix]').first()
  if (await line.count()) {
    await line.click(); await page.waitForTimeout(700)
    const j = await page.evaluate(() => ({ board: !!(document.querySelector('#schedBoard') && document.querySelector('#schedBoard').offsetWidth), page: window.CURPAGE, flash: [...document.querySelectorAll('.chgflash')].map(e => e.dataset.txt || e.className.slice(0, 30)) }))
    check('3-e a tap goes to the change and stays on Edit Schedule', !j.board && j.page === 'editsched' && j.flash.includes(key), JSON.stringify(j))
  } else check('3-e the line is a tap', false, 'no tappable line')
  await planMenuItems(page, 0)
  const back = page.locator('.wavemenu .wm[data-plansel]:visible').first()
  if (await back.count()) { await back.click(); await page.waitForTimeout(900) } else await menuClose(page)
  const cB2 = norm((await head(page, 0)).pending), lB2 = await openList(page, 0)
  check('3-f back on Plan B: its own change again', num(cB2) === 1 && lB2 && /PLANB EDIT/.test(lB2.rows.join(' ')) && !/PLANA/.test(lB2.rows.join(' ')), `"${cB2}" · ${JSON.stringify(lB2)}`)
  await page.keyboard.press('Escape')
} catch (e) { check('3-crash', false, String(e && e.stack || e)) }
check('ERR', !errors.length, errors.length ? JSON.stringify(errors.slice(0, 6)) : 'browser error list empty')
await browser.close()
summary('hr-04 ' + W)
