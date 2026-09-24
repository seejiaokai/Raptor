/* w2-04 — PLANS × "LOAD ONTO WORKING COPY", both orders (S11, Astra 9): switch plan then load a version;
   load a version then switch plan; the two-tap confirm on a plan; each plan keeps its own content and its
   own sign-offs; the viewer stays on AL1 throughout.
   Rules: AM6, AM12, AM26, AM27, AM28, AM11, AM23; engine-rules §Drafts (the stow-then-load switch).
   Usage: node w2-04-plans-load.mjs [desktop|phone]   (default both) */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { open, editWeek, go, check, note, summary, installToasts, takeToasts, h, bookDay, lookAt, switchTo, altPlan, pvBar, pvTap,
  viewDay, clip, screen, signDay, editText, STATE, DESK, PHONE } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const ORIG_NOTE = 'EP: ENGINE FIRE ON TAKE OFF', AL1_NOTE = 'MON NOTE — AL1'

for (const w of which) {
  const W = w === 'phone' ? PHONE : DESK, P = w === 'phone' ? 'p' : 'd'
  console.log(`\n##### S11 / Astra 9 — ${w} #####`)
  const { browser, page, errors } = await open({ ...W, state: STATE })
  await installToasts(page); await editWeek(page)
  const toKey = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].map(e => e.dataset.txt).find(k => /^ff:0\.\d+\.\d+\.to$/.test(k)))
  const content = () => page.evaluate(k => ({ note: (document.querySelector('#eWeek [data-txt="dn:0.0"]') || {}).innerText?.trim(), to: (document.querySelector(`#eWeek [data-txt="${k}"]`) || {}).innerText?.trim() }), toKey)
  const signed = hd => hd.signs.filter(s => s && !/— name —/.test(s)).length
  const viewer = async () => { await go(page, 'viewsched'); const v = await viewDay(page, 0); const n = await page.evaluate(() => document.querySelector('#vWeek .day[data-day="0"]').innerText.includes('MON NOTE — AL1')); await go(page, 'editsched'); return { pick: v.picker && v.picker.opts[0], tag: v.tag, al1Note: n } }

  /* setup: Mon back at AL1 content (discard the fixture's pending time), then "+ Alt Plan" → A (= AL1) and B (live) */
  await lookAt(page, 0, /^AL1/); await pvTap(page, 0, 'data-restore'); await pvTap(page, 0, 'data-restore')
  let hd = await h(page, 0)
  check(`${P}.setup Mon at AL1 content, nothing pending`, !hd.pending && hd.tag === 'AL1', JSON.stringify({ pend: hd.pending, tag: hd.tag }))
  const c0 = await content()
  await altPlan(page, 0); await takeToasts(page)
  await editText(page, toKey, '08:15')
  hd = await h(page, 0)
  check(`${P}.setup Plan B live, its take-off changed → "1 pending"`, /Plan B/.test(hd.selector) && /1\s*pending/.test(hd.pending), `${hd.selector.trim()} ${hd.pending}`)
  await signDay(page, 0)
  hd = await h(page, 0)
  check(`${P}.setup Plan B signed → "Published at AL1 · 1 change to publish — Publish AL2"`, signed(hd) === 4 && /1 change to publish/.test(hd.signState), hd.signState)
  const bSigns = hd.signs.join('|')

  /* ---- A: switch to Plan A (never signed; = AL1) ---- */
  await switchTo(page, 0, /Plan A/)
  let t = await takeToasts(page); hd = await h(page, 0); let c = await content()
  check(`${P}.S11-A switch to Plan A: toast "… · matches AL1 — nothing pending"`, t.some(x => /Switched to "Plan A" — this is now the live Monday · matches AL1 — nothing pending/.test(x)), JSON.stringify(t))
  check(`${P}.S11-A/AM12 Plan A shows its OWN (empty) sign-offs, nothing pending, tag AL1`, signed(hd) === 0 && !hd.pending && hd.tag === 'AL1', JSON.stringify({ signs: hd.signs, pend: hd.pending, tag: hd.tag }))
  check(`${P}.A9 Plan A holds AL1's content (note "${AL1_NOTE}", take-off ${c0.to})`, c.note === AL1_NOTE && c.to === c0.to, JSON.stringify(c))
  /* A: look at the Original and load it — one tap (nothing to discard) */
  await lookAt(page, 0, /^Original/)
  let bar = await pvBar(page, 0)
  check(`${P}.S11-A the Original preview offers a plain "Load onto working copy" (Plan A has nothing to discard)`, bar && bar.load === 'Load onto working copy', JSON.stringify(bar))
  await pvTap(page, 0, 'data-restore')
  t = await takeToasts(page); hd = await h(page, 0); c = await content()
  check(`${P}.S11-A/AM6 one tap loads the Original onto Plan A: "Monday: Original loaded onto the working copy — viewers still see AL1 until you publish"`,
    t.some(x => /^Monday: Original loaded onto the working copy — viewers still see AL1 until you publish$/.test(x)), JSON.stringify(t))
  check(`${P}.S11-A Plan A now carries the Original's note, "1 pending" (differs from AL1), tag still AL1, selector still Plan A`,
    c.note === ORIG_NOTE && /1\s*pending/.test(hd.pending) && hd.tag === 'AL1' && /Plan A/.test(hd.selector), JSON.stringify({ c, pend: hd.pending, tag: hd.tag, sel: hd.selector.trim() }))
  await clip(page, `${P}-50-S11-planA-after-load-original`, '#eWeek .day[data-day="0"] .day-head', { pad: 8, extraH: 170 })
  /* the Edit history records the load */
  if (w === 'desktop') {
    await page.locator('#histBtn').click(); await page.waitForTimeout(700)
    const hist = await page.evaluate(() => { const m = [...document.querySelectorAll('.modal:not([hidden])')].find(x => /history/i.test(x.innerText)); return m ? m.innerText.replace(/\s+/g, ' ') : 'NO HISTORY' })
    check(`${P}.S11-A the Edit history has the line "Monday: Original loaded onto the working copy — viewers still see AL1 until you publish"`, /Original loaded onto the working copy — viewers still see AL1 until you publish/.test(hist), hist.slice(0, 300))
    note(`${P}.S11 history (plan switches / loads)`, hist.slice(0, 700))
    await screen(page, `${P}-51-S11-edit-history`)
    await page.keyboard.press('Escape'); await page.waitForTimeout(300)
    const x = page.locator('.modal:not([hidden]) .x:visible').first(); if (await x.count()) { await x.click(); await page.waitForTimeout(300) }
  }
  let vw = await viewer()
  check(`${P}.S11-A/AM6 the viewer still sees "AL1 — as issued" with AL1's note`, vw.pick === '*AL1 — as issued' && vw.al1Note, JSON.stringify(vw))

  /* ---- B: switch to Plan B (signed, take-off 08:15) ---- */
  await switchTo(page, 0, /Plan B/)
  t = await takeToasts(page); hd = await h(page, 0); c = await content()
  check(`${P}.S11-B switch to Plan B: toast "… · 1 difference from AL1 pending"`, t.some(x => /Switched to "Plan B" — this is now the live Monday · 1 difference from AL1 pending/.test(x)), JSON.stringify(t))
  check(`${P}.S11-B/AM12 Plan B's own sign-offs come back GREEN (4 names), "1 change to publish"`, signed(hd) === 4 && hd.signs.join('|') === bSigns && /1 change to publish/.test(hd.signState), JSON.stringify({ signs: hd.signs, st: hd.signState }))
  check(`${P}.A9 Plan B kept its own content (take-off 08:15, AL1's note)`, c.to === '08:15' && c.note === AL1_NOTE, JSON.stringify(c))
  /* back to A: the loaded Original is still there */
  await switchTo(page, 0, /Plan A/)
  t = await takeToasts(page); hd = await h(page, 0); c = await content()
  check(`${P}.A9 back on Plan A: the loaded Original content stayed (note "${ORIG_NOTE}"), A still unsigned`, c.note === ORIG_NOTE && signed(hd) === 0 && /1\s*pending/.test(hd.pending), JSON.stringify({ c, signs: hd.signs, pend: hd.pending }))
  check(`${P}.S11 the toast agrees with the head ("1 difference")`, t.some(x => /1 difference from AL1 pending/.test(x)), JSON.stringify(t))

  /* ---- C: on Plan B, the two-tap confirm ---- */
  await switchTo(page, 0, /Plan B/); await takeToasts(page)
  await lookAt(page, 0, /^AL1/)
  await pvTap(page, 0, 'data-restore')
  bar = await pvBar(page, 0)
  check(`${P}.S11-C on Plan B (1 edit) Load arms: "Discard 1 edit & load — confirm" / "Keep editing"`, bar && bar.load === 'Discard 1 edit & load — confirm' && bar.keep === 'Keep editing', JSON.stringify(bar))
  await clip(page, `${P}-52-S11-planB-armed`, '#eWeek .day[data-day="0"] .day-head', { pad: 8, extraH: 110 })
  await pvTap(page, 0, 'data-restcancel')
  bar = await pvBar(page, 0); c = await content().catch(() => ({}))
  check(`${P}.S11-C "Keep editing" clears the arm and loads nothing`, bar && bar.load === 'Load onto working copy' && !bar.keep, JSON.stringify(bar))
  await pvTap(page, 0, 'data-restore')
  bar = await pvBar(page, 0)
  check(`${P}.S11-C tap Load again → armed again`, bar && bar.keep === 'Keep editing', JSON.stringify(bar))
  await pvTap(page, 0, 'data-golive')
  hd = await h(page, 0); c = await content()
  check(`${P}.S11-C "← Back to live copy" drops the preview and the arm; Plan B still has its edit (08:15)`, !(await pvBar(page, 0)) && /Plan B/.test(hd.selector) && c.to === '08:15', JSON.stringify({ sel: hd.selector.trim(), c }))
  await lookAt(page, 0, /^AL1/)
  bar = await pvBar(page, 0)
  check(`${P}.S11-C re-opening the preview: not armed`, bar && bar.load === 'Load onto working copy', JSON.stringify(bar))

  /* ---- Astra 9 branch A: on B, load AL1 (two taps) — only B changes ---- */
  await pvTap(page, 0, 'data-restore'); await pvTap(page, 0, 'data-restore')
  t = await takeToasts(page); hd = await h(page, 0); c = await content()
  check(`${P}.A9 the confirmed load replaces Plan B's edit: toast "… AL1 loaded onto the working copy … · 1 unpublished edit replaced"`, t.some(x => /AL1 loaded onto the working copy — viewers still see AL1 until you publish · 1 unpublished edit replaced/.test(x)), JSON.stringify(t))
  check(`${P}.A9 Plan B is now AL1's content, nothing pending, selector still Plan B`, c.to === c0.to && c.note === AL1_NOTE && !hd.pending && /Plan B/.test(hd.selector), JSON.stringify({ c, pend: hd.pending, sel: hd.selector.trim() }))
  note(`${P}.A9 Plan B's sign-offs after its content was replaced`, `${signed(hd)} names · "${hd.signState}"`)
  await switchTo(page, 0, /Plan A/); await takeToasts(page)
  c = await content(); hd = await h(page, 0)
  check(`${P}.A9 Plan A untouched by the load on B (still the Original's note, 1 pending)`, c.note === ORIG_NOTE && /1\s*pending/.test(hd.pending), JSON.stringify({ c, pend: hd.pending }))
  await switchTo(page, 0, /Plan B/); await takeToasts(page)
  c = await content()
  check(`${P}.A9 back on Plan B: AL1's content`, c.to === c0.to && c.note === AL1_NOTE, JSON.stringify(c))
  vw = await viewer()
  check(`${P}.A9/AM6 through all of it the viewer stayed on "AL1 — as issued"`, vw.pick === '*AL1 — as issued' && vw.al1Note && vw.tag === 'AL1', JSON.stringify(vw))
  const bk = await bookDay(page, 0)
  check(`${P}.A9 the book: still issued at AL1, plans A and B (B live)`, bk.cur === '2026-07-13#1' && bk.plans.join('|') === 'Plan A|Plan B*', JSON.stringify({ cur: bk.cur, plans: bk.plans }))
  check(`${P}.no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('w2-04-plans-load') ? 1 : 0
