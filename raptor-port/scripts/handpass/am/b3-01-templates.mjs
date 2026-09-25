/* b3-01 — ITEM 4 (D96): a day template is refused on a PUBLISHED day, at every door, with the reason on screen;
   saving a template from a published day still works; a tap on a refused template changes nothing and says why; a
   DRAFT day takes a template as before. Doors: the edit week's Templates button (desktop + phone) and the board's
   Templates button (desktop; the phone board hides it). Walker B3, 25 Sep 26 — assertions of the RIGHT behaviour.
   Usage (from raptor-port/): node scripts/handpass/am/b3-01-templates.mjs [desktop|phone] */
process.env.HP_SHOTS = process.env.HP_REWALK || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-25-amendment-batch/b3'   // HP_REWALK: the re-walk's own folder, so the first walk's pictures stay
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, board, closeBoard, check, note, summary, installToasts, takeToasts, head, screen, STATE, DESK, PHONE, RESULTS } = L
import { writeFileSync } from 'node:fs'
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const MSG = dow => `${dow} is published — a template can't be applied to a published day. Edit the working copy, or Unpublish it first.`

const menuText = page => page.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? m.innerText.replace(/\s+/g, ' ').trim() : '' })
const menuRows = page => page.evaluate(() => {
  const m = [...document.querySelectorAll('.wavemenu')].pop(); if (!m) return null
  return { note: (m.querySelector('.wm-refuse') || {}).innerText || '', noteVis: !!(m.querySelector('.wm-refuse') || {}).offsetWidth,
    picks: [...m.querySelectorAll('[data-daytplpick]')].map(b => ({ t: b.innerText.split('\n')[0], dis: b.disabled, title: b.title })),
    save: !!m.querySelector('[data-daytplsave]') }
})
/* a digest of a day's content — what a template would replace */
const dig = (page, di) => page.evaluate(i => JSON.stringify(window.DAYS[i]).length + ':' + JSON.stringify(window.DAYS[i]).slice(0, 80), di)
async function weekTplOpen(page, di) {
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-daytplopen="${di}"]:visible`).first()
  if (!(await b.count())) return false
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(500)
  return true
}
async function closeMenu(page) { if (await page.locator('.wavemenu').count()) { await page.keyboard.press('Escape'); await page.waitForTimeout(200) } if (await page.locator('.wavemenu').count()) { await page.mouse.click(5, page.viewportSize().height - 5); await page.waitForTimeout(300) } }
async function closeTplModal(page) { const x = page.locator('#daytplClose:visible'); if (await x.count()) { await x.click(); await page.waitForTimeout(400) } }

for (const w of which) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### item 4 — ${w} #####`)
  const { browser, page, errors } = await openHi({ ...W, state: STATE, dpr: w === 'phone' ? 3 : 1 })
  await installToasts(page); await editWeek(page)

  /* 1. SAVE a published day (Tue, ORIG, nothing pending) as a template — saving stays open (D96) */
  check(`${P}.T1 Tue is published (ORIG) — the fixture`, (await head(page, 1)).tag.includes('ORIG'), (await head(page, 1)).tag)
  await weekTplOpen(page, 1)
  let rows = await menuRows(page)
  check(`${P}.T1 the week's Templates menu on published Tue offers "+ Save this day as a template"`, rows && rows.save, JSON.stringify(rows))
  await page.locator('.wavemenu [data-daytplsave]:visible').click(); await page.waitForTimeout(700)
  let t = await takeToasts(page)
  const tname = (t.find(x => /Saved as/.test(x)) || '').match(/"(.+)"/)?.[1] || ''
  check(`${P}.T1 saving a template FROM a published day works ("Saved as …")`, !!tname, JSON.stringify(t))
  await closeTplModal(page)

  /* 2. the WEEK's door on a published day: Tue (nothing pending) and Mon (AL1 + a pending edit) */
  for (const [di, dow] of [[1, 'Tuesday'], [0, 'Monday']]) {
    const d0 = await dig(page, di), h0 = await head(page, di)
    await weekTplOpen(page, di)
    rows = await menuRows(page)
    const txt = await menuText(page)
    check(`${P}.T2 ${dow} (published ${h0.tag}${h0.pending ? ', ' + h0.pending : ''}): every template is drawn DISABLED`, rows && rows.picks.length > 0 && rows.picks.every(r => r.dis), JSON.stringify(rows && rows.picks))
    check(`${P}.T2 ${dow}: the reason is ON SCREEN in the menu, in the one sentence`, rows && rows.noteVis && rows.note.trim() === MSG(dow), JSON.stringify(rows && rows.note))
    check(`${P}.T2 ${dow}: saving is still offered on the published day`, rows && rows.save, '')
    await screen(page, `${P}-T2-${dow.slice(0, 3).toLowerCase()}-week-templates-refused`)
    /* a tap on the disabled row: nothing changes; the reason is what the screen says */
    const pick = page.locator('.wavemenu [data-daytplpick]:visible').first()
    const box = await pick.boundingBox()
    if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(500)
    t = await takeToasts(page)
    const menuStill = await page.locator('.wavemenu').count()
    const d1 = await dig(page, di), h1 = await head(page, di)
    check(`${P}.T2 ${dow}: a tap on a refused template changes NOTHING (same day, same count)`, d1 === d0 && h1.pending === h0.pending && h1.tag === h0.tag, JSON.stringify({ pend: [h0.pending, h1.pending], same: d1 === d0 }))
    check(`${P}.T2 ${dow}: …and the only thing said is why (the menu's note stays up, or a toast says the sentence; nothing else)`,
      (menuStill && rows.noteVis && t.length === 0) || (t.length && t.every(x => x === MSG(dow))), JSON.stringify({ menuStill, toasts: t }))
    await screen(page, `${P}-T2-${dow.slice(0, 3).toLowerCase()}-after-tap-disabled`)
    await closeMenu(page)
  }

  /* 3. the BOARD's door on a published day (desktop board; a phone board hides Templates — noted) */
  await board(page, 1)
  const sbTpl = page.locator('#schedBoard #sbTpl:visible')
  if (await sbTpl.count()) {
    const d0 = await dig(page, 1)
    await sbTpl.click(); await page.waitForTimeout(500)
    rows = await menuRows(page)
    check(`${P}.T3 the BOARD's Templates on published Tue: every template disabled, the reason on screen`, rows && rows.picks.every(r => r.dis) && rows.noteVis && rows.note.trim() === MSG('Tuesday'), JSON.stringify(rows))
    check(`${P}.T3 the board's menu still offers saving`, rows && rows.save, '')
    await screen(page, `${P}-T3-board-templates-refused`)
    const pick = page.locator('.wavemenu [data-daytplpick]:visible').first()
    const box = await pick.boundingBox(); if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(500); t = await takeToasts(page)
    check(`${P}.T3 the board: a tap on the refused row changes nothing`, (await dig(page, 1)) === d0, JSON.stringify(t))
    await closeMenu(page)
  } else {
    const any = await page.locator('#schedBoard #sbTpl').count()
    note(`${P}.T3 the board's Templates button`, any ? 'present in the DOM but hidden on this width (the phone board hides the day controls) — the phone reaches templates from the week only' : 'not drawn on this board')
    await screen(page, `${P}-T3-board-no-templates-button`)
  }
  await closeBoard(page); await editWeek(page)

  /* 4. a DRAFT day (Fri) takes a template as before */
  const f0 = await dig(page, 4), hf0 = await head(page, 4)
  check(`${P}.T4 Fri is a draft — the fixture`, hf0.tag.includes('DRAFT'), hf0.tag)
  await weekTplOpen(page, 4)
  rows = await menuRows(page)
  check(`${P}.T4 draft Fri: the templates are ENABLED and no refusal note is drawn`, rows && rows.picks.length && rows.picks.every(r => !r.dis) && !rows.note, JSON.stringify(rows))
  await page.locator('.wavemenu [data-daytplpick]:visible').filter({ hasText: new RegExp(tname) }).first().click(); await page.waitForTimeout(800)
  t = await takeToasts(page)
  const f1 = await dig(page, 4), hf1 = await head(page, 4)
  check(`${P}.T4 draft Fri: picking the template APPLIES it (the day's content changes; a toast names it)`, f1 !== f0 && t.some(x => x.includes(tname)), JSON.stringify({ toasts: t, changed: f1 !== f0 }))
  check(`${P}.T4 draft Fri stays a DRAFT (no amendment tag appears)`, hf1.tag.includes('DRAFT'), hf1.tag)
  await screen(page, `${P}-T4-fri-draft-template-applied`)
  /* Undo takes it back (one step) */
  if (await page.locator('#undoBtn:visible').count()) {
    await page.locator('#undoBtn').click(); await page.waitForTimeout(700); await takeToasts(page)
    check(`${P}.T4 Undo takes the template back off the draft day`, (await dig(page, 4)) === f0, '')
  }

  /* 5. desktop only: the sentence's advice holds — after Unpublish, the day takes a template again */
  if (w === 'desktop') {
    const u = await L.unpublish(page, 1)
    await takeToasts(page)
    const hu = await head(page, 1)
    note('d.T5 Unpublish Tue', JSON.stringify({ u, tag: hu.tag, beak: hu.beak }))
    await weekTplOpen(page, 1)
    rows = await menuRows(page)
    check('d.T5 after Unpublish (the sentence\'s advice), Tue\'s templates are enabled again', rows && rows.picks.every(r => !r.dis) && !rows.note, JSON.stringify(rows))
    await closeMenu(page)
  }
  check(`${P}.T: no browser errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
const f = summary('b3-01-templates')
writeFileSync('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/7d4383dd-dbce-43e3-9712-03047ba69337/scratchpad/b3-01.json', JSON.stringify(RESULTS, null, 1))
process.exitCode = f ? 1 : 0
