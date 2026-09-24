/* w1 · S36 (Fable) — eight ALs on one day: the colours of AL1…AL8 on the version tag, the solid issued mark,
   the dotted pending mark and the preview bar. Everything week, TUESDAY, eight rounds of
   change the note → sign → Publish AL<n>.
   RIGHT behaviour: AM22 the tag is coloured by its number — AL1 cyan, AL2 amber, AL3 green, AL4 white, AL5 purple,
   AL6 pink, AL7 orange (the register names no colour past AL7); the tag, the marks and the preview bar use ONE
   palette so they never disagree (AM19/AM22). Recorded: whether AL8 can be told apart from AL7.
   Usage: node w1-s36-eight.mjs [desktop|phone] */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w1'
const L = await import('./w1-lib.mjs')
const { open, editWeek, signDay, publishAL, editText, planMenuItems, planMenuLook, STATE, WIDTHS, widthArg, checker, toastSpy, toasts,
  headN, shotUnion } = L
const DI = 1, NOTE = 'dn:1.0', DAY = `#eWeek .day[data-day="${DI}"]`
const WANT = { 1: 'rgb(59, 198, 232)', 2: 'rgb(229, 194, 74)', 3: 'rgb(61, 232, 107)', 4: 'rgb(255, 255, 255)', 5: 'rgb(179, 136, 255)', 6: 'rgb(255, 127, 196)', 7: 'rgb(229, 135, 43)' }
const col = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e)
  return { alc: c.getPropertyValue('--alc').trim(), bg: c.backgroundColor, deco: c.textDecorationColor, outline: c.outlineColor, style: c.textDecorationStyle || c.outlineStyle } }, sel)
const toRgb = (hex) => { if (!hex || !/^#/.test(hex)) return hex; let h = hex.slice(1); if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16); return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})` }

for (const w of widthArg()) {
  const C = checker('S36 ' + w)
  const { browser, page, errors } = await open({ ...WIDTHS[w], state: STATE })
  await toastSpy(page)
  await editWeek(page)
  const table = []
  for (let n = 1; n <= 8; n++) {
    await editText(page, NOTE, `TUE NOTE — ROUND ${n}`)
    const dotted = await col(page, `${DAY} [data-txt="${NOTE}"][data-alp]`)
    const aln = await page.evaluate(s => document.querySelector(s)?.getAttribute('data-aln'), `${DAY} [data-txt="${NOTE}"]`)
    if (n >= 7) await shotUnion(page, `s36-${w}-dotted-al${n}`, [`${DAY} .day-head`, `${DAY} [data-txt="${NOTE}"]`])
    await signDay(page, DI)
    const p = await publishAL(page, DI)
    const h = await headN(page, DI)
    const tag = await col(page, `${DAY} .verchip`)
    const solid = await col(page, `${DAY} [data-txt="${NOTE}"][data-alc]`)
    table.push({ n, pressed: p.pressed, tag: h.tag, tagBg: tag?.bg, solidAlc: toRgb(solid?.alc), solidDeco: solid?.deco, dottedAln: aln, dottedAlc: toRgb(dotted?.alc), dottedDeco: dotted?.deco })
    await toasts(page)
    if (n >= 7) await shotUnion(page, `s36-${w}-issued-al${n}`, [`${DAY} .day-head`, `${DAY} [data-txt="${NOTE}"]`])
  }
  for (const r of table) C.log(`AL${r.n}`, r)
  /* judged on what is PAINTED — the tag's fill and each mark's underline colour */
  for (const r of table.filter(x => x.n <= 7)) C.check(`S36.AL${r.n}`, r.tag === `AL${r.n}` && r.tagBg === WANT[r.n] && r.solidDeco === WANT[r.n] && r.dottedDeco === WANT[r.n],
    `AL${r.n}: the tag, the solid mark and the dotted mark are all the register's colour — AM22/AM19`, { tag: r.tagBg, solid: r.solidDeco, dotted: r.dottedDeco, want: WANT[r.n] })
  const a7 = table[6], a8 = table[7]
  C.check('S36.AL8a', a8.tag === 'AL8' && a8.tagBg === a8.solidDeco && a8.solidDeco === a8.dottedDeco, 'AL8: the tag, the solid mark and the dotted mark AGREE with each other — AM19/AM22 (one palette)', { tag: a8.tagBg, solid: a8.solidDeco, dotted: a8.dottedDeco })
  C.note('S36.AL8b', 'AL7 and AL8 can NOT be told apart by colour — both orange (the register names no colour past AL7)', { al7: a7.tagBg, al8: a8.tagBg })
  // the preview bar for AL7 and AL8
  for (const v of ['AL7', 'AL8']) {
    await planMenuItems(page, DI); await planMenuLook(page, new RegExp('^' + v + '(?!\\d)'))   // the row reads "AL7read-only…", so no word boundary after the number
    const bar = await page.evaluate(s => { const b = document.querySelector(`${s} .dprev-bar`); if (!b) return null; const c = getComputedStyle(b); return { text: b.innerText.replace(/\s+/g, ' ').slice(0, 60), alc: c.getPropertyValue('--alc').trim(), border: c.borderTopColor } }, DAY)
    C.log(`preview bar ${v}`, bar)
    C.check(`S36.bar.${v}`, bar && toRgb(bar.alc) === (v === 'AL7' ? a7.tagBg : a8.tagBg), `the preview bar of ${v} is tinted the same colour as its tag — AM22`, bar)
    await shotUnion(page, `s36-${w}-preview-${v.toLowerCase()}`, [`${DAY} .day-head`, `${DAY} .dprev-bar`])
    const back = page.locator(`#eWeek [data-golive="${DI}"]:visible`).first(); if (await back.count()) { await back.click(); await page.waitForTimeout(500) }
  }
  C.check('S36.z', !errors.length, 'no console errors', errors)
  C.summary()
  await browser.close()
}
