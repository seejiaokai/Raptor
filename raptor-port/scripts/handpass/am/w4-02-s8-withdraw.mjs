/* w4 · S8 (Fable) — the "Withdraw — confirm" warning on Unpublish, when a published weekend's OIL
   credits are already bid against on the Leave War (AM37). Three parts, each through the app's own doors.

   A. SATURDAY, UNTOUCHED — does the warning fire when nothing draws on the day's credits? Two credited men
      (Wisp, Outlaw) are already below zero for reasons of their own; read their tracker lines, then tap
      Unpublish once. Also Astra rank 33 / Fable §5-8: leave the page with the warning armed, come back, and
      tap once — does it withdraw without warning again?
   B. SUNDAY, DASH — the real case. Dash is the only man Sunday credits (FO*, one day). Spend his OIL to
      exactly zero with bids on 3–6 Aug, so the bids draw on Sunday's credit; tap Unpublish → the warning
      and "Withdraw — confirm"; confirm → the credit goes; republish → it comes back.
   C. THE NARROWER CASE (Fable §5-9 / Q5) — give Dash a hand award dated 22 Jul, so his balance would stay
      at zero without Sunday's credit while the bids still draw on it (oldest credit first). Tap Unpublish:
      RECORDED, NOT JUDGED — the question of what "bid against" means is his (Q5).
   Usage: node w4-02-s8-withdraw.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, lwOpen, lwCell, lwOilFig, lwCloseSheet, lwShot, lwBid, lwAward, lwTracker, editWeek, head,
  signDay, publishDay, unpublish, shot, toastNow, clearToast, checker, go, frame, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('S8 ' + w)
const SUN = 6, SUNISO = '2026-07-19', D = 'spaceman'   // Dash
const pic = s => `s8-${w}-${s}`

/** One tap on Unpublish, and what the day says straight after. */
async function tapUnpublish(di, label) {
  await editWeek(page)
  await clearToast(page)
  const r = await unpublish(page, di, { confirm: false })
  const h = await head(page, di)
  const t = await toastNow(page)
  await frame(page, `#eWeek .day[data-day="${di}"]`)
  await shot(page, pic(label))
  return { pressed: r.pressed, label: r.label, toast: t, after: { tag: h.tag, unpub: h.unpub?.text || '', unpubTitle: h.unpub?.title || '' } }
}

/* ============ A. Saturday, untouched ============================================================ */
await lwOpen(page)
const wisp = await lwTracker(page, 'shrek', pic('A1-tracker-wisp'))
const outlaw = await lwTracker(page, 'casper', pic('A2-tracker-outlaw'))
note('A: Wisp on the OIL tracker', wisp)
note('A: Outlaw on the OIL tracker', outlaw)
const a1 = await tapUnpublish(5, 'A3-sat-first-tap')
note('A: Saturday — first tap on Unpublish', a1)
const armed = /confirm/i.test(a1.after.unpub)
/* AM37 promises the warning when the day's credits "are already bid against". The tracker spends the
   OLDEST credit first and (with no expiry set) a later credit backs an earlier debit: Wisp's Saturday half
   day is used up by the OIL he took on 14 Jul, Outlaw's by his opening debt — neither row lists a Saturday
   credit with anything left. So Saturday's credits ARE already spent, and the warning is right to fire. */
ck('A: Wisp\'s and Outlaw\'s Saturday credits are already spent (no "18 Jul … left" on the tracker)', !/18 Jul/.test(wisp.text || '') && !/18 Jul/.test(outlaw.text || ''),
  'no Saturday credit with anything left', { wisp: wisp.text, outlaw: outlaw.text })
ck('A: so the first tap warns and arms "Withdraw — confirm" (AM37)', armed && /bid against/i.test(a1.toast || '') && a1.after.tag === 'ORIG',
  'toast "Heads up … bid against …", "Withdraw — confirm", day still ORIG', a1)
if (armed) {
  /* Astra rank 33 / Fable §5-8: an armed warning should not survive leaving the page */
  await lwOpen(page)
  await go(page, 'editsched')
  const a2 = await tapUnpublish(5, 'A4-sat-tap-after-leaving-and-returning')
  note('A: after leaving the page armed and coming back — one tap', a2)
  ck('A: the armed warning is cancelled by leaving the page (Astra 33 / Fable §5-8 — no register line; minor)', /confirm/i.test(a2.after.unpub) || a2.after.tag === 'ORIG',
    'the first tap back warns again (the day stays published)', a2.after.tag + ' · ' + a2.after.unpub + ' · ' + a2.toast)
  if (a2.after.tag !== 'ORIG') {
    /* it withdrew — put Saturday back so parts B and C start from the everything week */
    await signDay(page, 5); const rp = await publishDay(page, 5)
    note('A: Saturday republished to restore the week', rp)
  } else {
    /* still armed (it re-warned): leave it published — a second tap would withdraw it */
    await go(page, 'viewsched'); await go(page, 'editsched')
  }
}

/* ============ B. Sunday and Dash — a real bid against the credit ================================ */
await lwOpen(page, SUNISO)
const b0 = { box: (await lwCell(page, D, SUNISO)).box, fig: (await lwOilFig(page, D)).oil }
await lwCloseSheet(page)
note('B: Dash before', b0)
ck('B: Sunday credits Dash a full day', /^FO\*$/.test(b0.box), 'FO*', b0.box)
const bids = []
await lwOpen(page, '2026-08-03')
for (const [iso, portion] of [['2026-08-03', 'full'], ['2026-08-04', 'full'], ['2026-08-05', 'full'], ['2026-08-06', 'am']]) {
  const r = await lwBid(page, D, iso, 'OIL', { portion })
  bids.push({ iso, portion, ...r, box: (await lwCell(page, D, iso)).box })
}
note('B: Dash\'s OIL bids', bids)
ck('B: four OIL bids placed', bids.every(b => b.placed), 'all placed', bids.map(b => b.iso + ':' + (b.placed ? b.box : 'NO ' + b.why)).join(' '))
await lwShot(page, pic('B1-dash-bids'), D, '2026-08-04')
const b1 = (await lwOilFig(page, D)).oil
await lwCloseSheet(page)
ck('B: the bids take Dash\'s OIL to zero', String(b1) === '0', '0', b1)
const tr1 = await lwTracker(page, D, pic('B2-tracker-dash-at-zero'))
note('B: Dash on the tracker', tr1)

const b2 = await tapUnpublish(SUN, 'B3-sun-first-tap')
note('B: Sunday — first tap', b2)
ck('B: first tap warns and arms "Withdraw — confirm" (AM37)', /confirm/i.test(b2.after.unpub) && /bid against/i.test(b2.toast || '') && b2.after.tag === 'ORIG',
  'toast "Heads up … bid against …", button "Withdraw — confirm", day still ORIG', b2)
const b3 = await tapUnpublish(SUN, 'B4-sun-second-tap')
note('B: Sunday — second tap', b3)
ck('B: second tap withdraws (day back to a draft)', b3.after.tag === 'DRAFT', 'DRAFT', b3.after.tag)
await lwOpen(page, SUNISO)
const b4 = { sun: await lwCell(page, D, SUNISO), fig: (await lwOilFig(page, D)).oil }
await lwCloseSheet(page)
await lwShot(page, pic('B5-lw-after-withdraw'), D, SUNISO)
await lwOpen(page, '2026-08-03')
b4.aug = {}
for (const iso of ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06']) b4.aug[iso] = await lwCell(page, D, iso)
await lwShot(page, pic('B6-lw-aug-after-withdraw'), D, '2026-08-04')
note('B: the war after the withdrawal', b4)
ck('B: Sunday\'s credit is withdrawn with the day (D142)', b4.sun.box === '', 'empty box', b4.sun.box)
ck('B: Dash\'s balance goes below zero', String(b4.fig) === '-1' || String(b4.fig) === '−1', '-1', b4.fig)
note('B: what the war shows on the bids now (Fable: "the clash ! in the gap")', Object.fromEntries(Object.entries(b4.aug).map(([k, v]) => [k, v.box + (v.mark ? ' mark ' + v.mark : '') + (v.title ? ' · ' + v.title : '')])))
await editWeek(page)
note('B: re-sign Sunday', await signDay(page, SUN))
const b5 = await publishDay(page, SUN)
note('B: republish Sunday', { ...b5, toast: await toastNow(page), head: await head(page, SUN) })
await lwOpen(page, SUNISO)
const b6 = { sun: (await lwCell(page, D, SUNISO)).box, fig: (await lwOilFig(page, D)).oil }
await lwCloseSheet(page)
await lwShot(page, pic('B7-lw-after-republish'), D, SUNISO)
ck('B: republishing restores the credit and the balance', b6.sun === 'FO*' && String(b6.fig) === '0', 'FO* · 0', b6)

/* ============ C. the narrower case — the bids still draw on Sunday, but an award would cover them == */
await lwOpen(page, '2026-07-22')
const c0 = await lwAward(page, D, '2026-07-22', '1', 'w4 narrow case')
note('C: hand award to Dash on Wed 22 Jul', c0)
const c1 = { box: (await lwCell(page, D, '2026-07-22')).box, fig: (await lwOilFig(page, D)).oil }
await lwCloseSheet(page)
await lwShot(page, pic('C1-lw-award'), D, '2026-07-22')
note('C: Dash after the award', c1)
const tr2 = await lwTracker(page, D, pic('C2-tracker-dash-award'))
note('C: Dash on the tracker — which credits the August OIL used (oldest first)', tr2)
const c2 = await tapUnpublish(SUN, 'C3-sun-first-tap-with-award')
note('C: Sunday — first tap with the award in place (Q5: recorded, not judged)', c2)
await lwOpen(page, SUNISO)
const c3 = { sun: (await lwCell(page, D, SUNISO)).box, fig: (await lwOilFig(page, D)).oil }
await lwCloseSheet(page)
await lwShot(page, pic('C4-lw-after-one-tap'), D, SUNISO)
note('C: the war after that one tap', c3)
const tr3 = await lwTracker(page, D, pic('C5-tracker-dash-after-one-tap'))
note('C: Dash on the tracker after the withdrawal — what now backs the August OIL', tr3)

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
