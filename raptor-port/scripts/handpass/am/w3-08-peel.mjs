/* w3-08 — Astra 31 (only the LATEST version can be withdrawn; peel AL2, then AL1, then the Original) and Astra 32
   (Unpublish with no OIL clash is ONE tap — a weekday, and a weekend whose credits nobody has spent), at desktop
   AND phone. Register: AM34 (only the most recent version comes off), AM37c (what each Unpublish does to the day:
   the AL's changes back to pending, the version under it current again; the Original → a plain draft; the button
   only for the latest, never while an older version is being looked at), AM3/AM35 (the ⓘ list and the viewer
   agree with the tag at every step).
   Usage: node w3-08-peel.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, W, checker, watchToasts, toasts, editWeek, head, book, signDay, publishAL, shot, viewDay, dayInfo, menuLook,
  unpubBtn, tapUnpub, lwRead } = L
const which = process.argv[2] ? [process.argv[2]] : ['desktop', 'phone']
const brief = h => h ? `${h.tag} | ${(h.pending || '-').replace(/\s+/g, ' ')} | ${h.signState} | ${h.alpub ? h.alpub.text : h.beak ? h.beak.text : '-'} | ${h.unpub ? h.unpub.text + ' [' + h.unpub.title + ']' : 'no Unpublish'}` : 'null'

for (const w of which) {
  const { check, note, summary } = checker('w3-08 ' + w)
  const P = s => `w3-08-${w}-${s}`
  const { browser, page, errors } = await open({ ...W[w], state: STATE })
  await watchToasts(page)
  const dayShot = async (s, di, root = '#eWeek') => {
    const d = page.locator(`${root} .day[data-day="${di}"]`).first()
    await d.evaluate(e => { e.scrollIntoView({ block: 'start', inline: 'start' }); window.scrollBy(0, -(window.innerWidth < 820 ? 64 : 150)) }); await page.waitForTimeout(350)
    await shot(page, P(s))
  }
  /* the tag, the ⓘ list and the viewer, read together */
  const agree = async (label) => {
    await editWeek(page)
    const h = await head(page, 0)
    const di = await dayInfo(page, 0)
    const v = await viewDay(page, 0)
    await editWeek(page)
    const als = (di.match(/AL VERSIONS COVERING MONDAY (.*?) WHAT THIS DAY/) || [])[1] || ''
    note(`${label}: tag / ⓘ / viewer`, { head: brief(h), dayinfo: als, viewer: v.picker[0] || v.pickerKind })
    return { h, als, v }
  }
  try {
    /* ---- build Original → AL1 → AL2 on Monday ---- */
    await editWeek(page)
    await signDay(page, 0)
    const p2 = await publishAL(page, 0)
    note('Monday AL2 published', { p2, toasts: await toasts(page) })
    const s0 = await agree('at AL2')
    check('setup: Monday stands at AL2 (Original, AL1, AL2 issued)', s0.h.tag === 'AL2' && /AL1.*AL2/.test(s0.als) && s0.v.picker[0] === '*AL2 — as issued', `${s0.h.tag} | ${s0.als} | ${s0.v.picker[0]}`)
    check('AM37c: the Unpublish button names the latest version (AL2)', s0.h.unpub && /pull AL2 back/.test(s0.h.unpub.title), s0.h.unpub && s0.h.unpub.title)
    /* ---- "target AL1 directly": the only door to an older version is a read-only look, and Unpublish is not there ---- */
    const lk = await menuLook(page, 0, /^AL1/)
    const hv = await head(page, 0)
    const ub = await unpubBtn(page, 0)
    note('looking at AL1', { lk, head: brief(hv), unpublishButton: ub })
    check('Astra31/AM37c: while AL1 is being looked at, no Unpublish is offered (an older version cannot be targeted)', lk.picked && !ub, JSON.stringify({ picked: lk.picked, ub }))
    await dayShot('a-looking-at-al1-no-unpublish', 0)
    const bk = page.locator('#eWeek [data-golive="0"]:visible').first(); if (await bk.count()) { await bk.click(); await page.waitForTimeout(500) }
    /* ---- peel AL2 ---- */
    await tapUnpub(page, 0)
    const s1 = await agree('after peeling AL2')
    check('Astra31/AM34: the first Unpublish takes AL2 off; AL1 is current again', s1.h.tag === 'AL1' && s1.v.picker[0] === '*AL1 — as issued', `${s1.h.tag} | ${s1.v.picker[0]}`)
    check('AM37c: AL2\'s change is back to pending, to go out as AL2 again', /1\s+pending/.test(s1.h.pending) && s1.h.alpub && /AL2/.test(s1.h.alpub.text), brief(s1.h))
    check('AM3: the ⓘ now lists AL1 only (never a version the tag does not name)', /AL1/.test(s1.als) && !/AL2/.test(s1.als), s1.als)
    check('AM37c: the button now names AL1', s1.h.unpub && /pull AL1 back/.test(s1.h.unpub.title), s1.h.unpub && s1.h.unpub.title)
    await dayShot('b-after-peeling-al2', 0)
    /* ---- peel AL1 ---- */
    await tapUnpub(page, 0)
    const s2 = await agree('after peeling AL1')
    check('Astra31/AM34: the second Unpublish takes AL1 off; the Original is current', s2.h.tag === 'ORIG' && s2.v.picker[0] === '*Original — as issued', `${s2.h.tag} | ${s2.v.picker[0]}`)
    check('AM37c: both changes are pending, to go out as AL1', /2\s+pending/.test(s2.h.pending) && s2.h.alpub && /AL1/.test(s2.h.alpub.text), brief(s2.h))
    check('AM3/S21: the ⓘ lists no amendment', /No amendment has touched this day yet/.test(s2.als), s2.als)
    check('AM37c: the button now names the Original', s2.h.unpub && /pull Original back/.test(s2.h.unpub.title), s2.h.unpub && s2.h.unpub.title)
    await dayShot('c-after-peeling-al1', 0)
    /* ---- peel the Original ---- */
    await tapUnpub(page, 0)
    const s3 = await agree('after peeling the Original')
    check('Astra31/AM37c: the third Unpublish takes the Original off — Monday is a plain draft', s3.h.tag === 'DRAFT' && s3.h.beak && /Publish day/.test(s3.h.beak.text) && !s3.h.unpub, brief(s3.h))
    note('the view page on the draft Monday', s3.v)
    check('AM31: the view page shows a draft (no issued face, no "as issued" choice)', s3.v.pickerKind !== 'vwork', s3.v.pickerKind + ' ' + (s3.v.picker || []).join(' / '))
    await dayShot('d-after-peeling-the-original', 0)
    note('book after the peel', await book(page))

    /* ---- Astra 32: a weekend with nobody's credit spent → ONE tap (Sunday) ---- */
    const lw0 = await lwRead(page, ['Dash'], '2026-07-19')
    await editWeek(page)
    const u = await tapUnpub(page, 6)
    const h6 = await head(page, 6)
    const lw1 = await lwRead(page, ['Dash'], '2026-07-19')
    note('Sunday unpublish', { tap: u, head: brief(h6), dashBefore: lw0, dashAfter: lw1 })
    check('Astra32: a weekend whose credits nobody has spent unpublishes on ONE tap (no warning)', h6.tag === 'DRAFT' && !(u.toasts || []).some(t => /Heads up/.test(t)), `${h6.tag} ${JSON.stringify(u.toasts)}`)
    check('AM46: Sunday\'s credit leaves the Leave War with it', /[FH]O/.test(lw0.Dash) && !/[FH]O/.test(lw1.Dash), `${JSON.stringify(lw0)} → ${JSON.stringify(lw1)}`)
  } catch (e) { check('script ran to the end', false, String(e && e.stack || e).slice(0, 700)); await shot(page, P('zz-crash')).catch(() => {}) }
  check('no console errors during the walk', errors.length === 0, JSON.stringify(errors).slice(0, 400))
  summary()
  await browser.close()
}
