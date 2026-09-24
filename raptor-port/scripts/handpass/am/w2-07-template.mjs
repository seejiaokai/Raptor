/* w2-07 — A DAY TEMPLATE APPLIED TO A PUBLISHED DAY (S25): the two-pick confirm when the day has unpublished
   edits, the confirm re-armed by a navigation between the picks, the pending count after the apply (the
   difference from the ISSUED version, AM20/AM23), the issued marks, and Undo.
   Also the identity case: a day's own template applied back onto it — the content equals the issued version,
   so by AM20 ("a pending mark means differs from what was issued, not was touched") nothing should be pending.
   Usage: node w2-07-template.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, check, note, summary, installToasts, takeToasts, h, bookDay, clip, screen, panelText, undoLabel, STATE, DESK, PHONE } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']

async function tplOpen(page, di) {
  const b = page.locator(`#eWeek .day[data-day="${di}"] [data-daytplopen="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await page.waitForTimeout(500)
  return page.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? m.innerText.replace(/\s+/g, ' ') : '' })
}
async function tplPick(page, re) { const it = page.locator('.wavemenu [data-daytplpick]:visible').filter({ hasText: re }).first(); await it.click(); await page.waitForTimeout(800) }
const issuedMarks = (page, di) => page.evaluate(i => [...document.querySelectorAll(`#eWeek .day[data-day="${i}"] [data-alc]`)].filter(e => !e.classList.contains('verchip')).length, di)
const content = (page, di, toKey) => page.evaluate(([i, k]) => ({ note: (document.querySelector(`#eWeek [data-txt="dn:${i}.0"]`) || {}).innerText?.trim(), to: (document.querySelector(`#eWeek [data-txt="${k}"]`) || {}).innerText?.trim() }), [di, toKey])

for (const w of which) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### S25 — ${w} #####`)
  const { browser, page, errors } = await open({ ...W, state: STATE })
  await installToasts(page); await editWeek(page)
  const monTo = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].map(e => e.dataset.txt).find(k => /^ff:0\.\d+\.\d+\.to$/.test(k)))
  /* save Tuesday (Original, nothing pending) as a template */
  await tplOpen(page, 1)
  await page.locator('.wavemenu [data-daytplsave]').click(); await page.waitForTimeout(700)
  let t = await takeToasts(page)
  const tname = (t.find(x => /Saved as/.test(x)) || '').match(/"(.+)"/)?.[1] || 'Template 1'
  check(`${P}.S25 Tue saved as a template ("${tname}")`, t.some(x => /Saved as/.test(x)), JSON.stringify(t))
  const x = page.locator('#daytplClose'); if (await x.count() && await x.isVisible()) { await x.click(); await page.waitForTimeout(400) }

  if (w === 'desktop') {
    /* identity: apply Tue's own template back onto Tue (published, nothing pending → no confirm) */
    await tplOpen(page, 1); await tplPick(page, new RegExp(tname))
    t = await takeToasts(page); let hd = await h(page, 1)
    const pt = await panelText(page)
    note('d.S25 identity: Tue\'s own template applied back onto Tue', `head "${hd.pending}" · toast ${JSON.stringify(t)} · panel "${(pt.match(/Tue ·[^A]*/) || [''])[0].trim()}"`)
    check('d.S25/AM20 applying a day\'s own unchanged content back onto it leaves nothing pending (content = the issued version)', !hd.pending, `head "${hd.pending}" · ${(pt.match(/Tue ·[^A]*/) || [''])[0].trim()}`)
    await clip(page, 'd-80-S25-tue-own-template-applied', '#eWeek .day[data-day="1"] .day-head', { pad: 8, extraH: 120 })
    await page.locator('#undoBtn').click(); await page.waitForTimeout(700); await takeToasts(page)
    hd = await h(page, 1)
    check('d.S25 Undo takes the template back off Tue (nothing pending)', !hd.pending, hd.pending)
  }

  /* Monday: AL1 + one unpublished edit — the first pick only ARMS */
  const c0 = await content(page, 0, monTo); let hd0 = await h(page, 0)
  await tplOpen(page, 0); await tplPick(page, new RegExp(tname))
  t = await takeToasts(page); let hd = await h(page, 0); let c = await content(page, 0, monTo)
  check(`${P}.S25 first pick on published Mon (unpublished edits) ARMS: "…replaces your unpublished edits on Monday — open Templates and pick it again to confirm"`,
    t.some(x => /replaces your unpublished edits on Mon(day)? — open Templates and pick it again to confirm/.test(x)), JSON.stringify(t))
  check(`${P}.S25 …and changes nothing yet`, hd.pending === hd0.pending && c.to === c0.to && c.note === c0.note, JSON.stringify({ pend: hd.pending, c }))
  await screen(page, `${P}-81-S25-mon-template-first-pick-armed`)
  /* a navigation between the two picks re-arms (P2-REV2-07) */
  await go(page, 'viewsched'); await go(page, 'editsched')
  await tplOpen(page, 0); await tplPick(page, new RegExp(tname))
  t = await takeToasts(page); c = await content(page, 0, monTo)
  check(`${P}.S25 after a page change the next pick ARMS again instead of applying`, t.some(x => /pick it again to confirm/.test(x)) && c.to === c0.to, JSON.stringify(t))
  /* the confirming pick applies */
  await tplOpen(page, 0); await tplPick(page, new RegExp(tname))
  t = await takeToasts(page); hd = await h(page, 0); c = await content(page, 0, monTo)
  check(`${P}.S25 the confirming pick applies: "Applied "${tname}" to Monday's working draft — publish AL2 to issue it"`,
    t.some(x => new RegExp(`Applied "${tname}" to Mon(day)?'s working draft — publish AL2 to issue it`).test(x)), JSON.stringify(t))
  check(`${P}.S25 the working copy now carries Tue's content; the tag still AL1 (the issued version is untouched)`, c.note !== c0.note && hd.tag === 'AL1', JSON.stringify({ c, tag: hd.tag }))
  const alc = await issuedMarks(page, 0)
  const pt = await panelText(page)
  note(`${P}.S25 after the apply`, `head "${hd.pending}" · issued (solid) marks left on Mon: ${alc} · panel "${(pt.match(/Mon ·[^A]*/) || [''])[0].trim()}" · signState "${hd.signState}"`)
  await clip(page, `${P}-82-S25-mon-template-applied`, '#eWeek .day[data-day="0"] .day-head', { pad: 8, extraH: 200 })
  /* the pending count must be the difference from AL1 — the head, the ⓘ and the panel agree */
  const n = +((hd.pending.match(/(\d+)/) || [0, 0])[1])
  const info = await L.dayInfo(page, 0)
  const infoN = +((info.match(/(\d+) unpublished edit/) || [0, -1])[1])
  check(`${P}.S25/AM23 the head's "N pending" and the ⓘ panel's "N unpublished edits" agree`, n > 0 && infoN === n, `head ${n} · ⓘ ${infoN}`)
  if (w === 'desktop') {
    const panelN = +(((pt.match(/Mon · (\d+) change/) || [0, -1])[1]))
    check('d.S25/AM23 …and the Amendments panel agrees', panelN === n, `panel ${panelN} · head ${n}`)
    await page.locator('#undoBtn').click(); await page.waitForTimeout(800); await takeToasts(page)
    hd = await h(page, 0); c = await content(page, 0, monTo)
    check('d.S25 Undo puts Monday back exactly (AL1 + the one unpublished edit)', hd.pending === hd0.pending && c.to === c0.to && c.note === c0.note && (await issuedMarks(page, 0)) >= 1, JSON.stringify({ pend: hd.pending, c }))
  }
  check(`${P}.S25: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('w2-07-template') ? 1 : 0
