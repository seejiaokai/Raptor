/* THE DESIGN LOOK — the Tracker's date boxes (the side panel's, the full failures list's rows, the marking pop-up's Done
   on / Failed on), at both sizes. FIRST WRITTEN (13 Oct 26) to record what the look FOUND; SINCE THE SMALL FIXES WERE
   BUILT (14 Oct 26 — [LOOK-13OCT-SMALL-FIXES], owner D830) every note that observed a finding is a CHECK of the fixed
   behaviour (docs/walk-scripts.md §6): each line ends `works`, `FAIL — <what was seen>`, or `NOT WALKED — <why the
   script could not act>`. What it checks, measured on the page: L14 (a day after today is faint and takes no tap in
   Last Flown ×2, Done on, Failed on and the failures list's rows — and is still offered in Upchit), L15 (a date no
   mark carries yet is dim), L16 (one width for the side panel's column on a desktop), L9 (a phone's card names its
   box), K12 (Delete / Backspace takes a box's date off, and the Tracker's own Delete — which deletes what is selected
   on a chart being arranged — does nothing to the chart). A picture at every step.
   THE REFUSAL OF A DAY AFTER TODAY (D374) IS NOT WALKED HERE ANY MORE: such a day can no longer be picked on these
   boxes' calendars, so no step can reach the refusal's line through the screen. It stays as the safety net and is
   carried by the unit tests (src/tracker/leftovers.test.tsx — the store's own refusals, and `pickAhead`, which reaches
   the line through the box with the clock moved).
   The "Until" calendar's faint dates, which this script once pictured, are dl-cal.mjs's.
   NOT in this batch, by his ruling (jobs of their own): the keyboard INSIDE the marking pop-up (K6) — its lines here
   say OPEN, not FAIL, while it is as the look found it.
   node scripts/handpass/dl-trk.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
import { calSays, check, drawn, kbOn, notWalked, part, plus, pressAt, same, showMonth, tok } from './dl-check.mjs'
const size = process.argv[2] || 'desk'
console.log(`dl-trk.mjs — the re-walk of the small fixes (written 14 Oct 26) · ${size} · pictures and keyboard.json → ${L.SHOTS}`)
const w = await L.world(size)
const p = w.page
const K = size
const BOX = `Tracker's date box [${K}]`, POP = `Tracker's marking pop-up [${K}]`
const day = iso => `[data-testid="dcal-day-${iso}"]`
const cardUp = () => p.locator('[data-testid="dcal-card"]').count()
const closeCal = async () => { if (w.phone) await p.touchscreen.tap(8, 8); else await p.keyboard.press('Escape'); await L.sleep(450) }
const valueOf = sel => p.locator(sel).first().getAttribute('data-value')
const view = async which => { if (!w.phone) return; const b = p.locator(`#page-tracker button[data-view="${which}"]`); if (await b.count()) { await b.tap(); await L.sleep(400) } }

/* A BOX THAT REFUSES A DAY AFTER TODAY OFFERS NONE (L14). Opens the box, reads what its calendar says of itself, turns
   to tomorrow's month by the calendar's own heading, presses tomorrow for real (by its place on the screen — it takes
   no press, so the proof that the press happened is what lay under the finger), and reads that nothing changed. */
async function offersNoDayAfterToday(surface, label, boxSel, warnSel, picName, cardName) {
  await part(surface, `L14 — ${label}`, async () => {
    const box = p.locator(boxSel).first()
    await box.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
    const v0 = await box.getAttribute('data-value')
    await w.press(box); await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(450)
    const says = await calSays(w), tomorrow = plus(says.today, 1)
    if (w.phone && cardName) {
      const name = await drawn(w, '[data-testid="dcal-name"]')
      check(surface, `L9 — the card over ${label}`, `its line names the box: ${cardName}`, name ? `"${name.text}" drawn ${name.transform}` : 'no line on the card', !!name && cardName.test(name.text) && name.transform === 'uppercase')
    }
    await showMonth(w, says.today.slice(0, 7))
    const td = await drawn(w, day(says.today))
    await showMonth(w, tomorrow.slice(0, 7))
    const tm = await drawn(w, day(tomorrow)), tmb = await drawn(w, `${day(tomorrow)} b`)
    const under = await pressAt(w, day(tomorrow))
    const stillUp = await cardUp()
    const v1 = await box.getAttribute('data-value')
    const warn = await p.evaluate(([b, ws]) => { const e = document.querySelector(b); const x = ws ? document.querySelector(ws) : e && e.closest('.trdatebox') && e.closest('.trdatebox').querySelector('.datewarn'); return x ? (x.textContent || '') : '' }, [boxSel, warnSel || ''])
    check(surface, `L14 — ${label}: a day after today`, 'the last day offered is the squadron’s today; tomorrow is faint and takes no tap; nothing is saved and nothing is refused (today itself may be picked)',
      `the calendar says today ${says.today}, last day ${says.max}; today’s date switched off: ${td ? td.disabled : 'not on screen'}; tomorrow (${tomorrow}): ${tm ? `classes "${tm.cls}", switched off: ${tm.disabled}, drawn at strength ${tmb.opacity}` : 'not on screen'}; a press on it landed on ${under}; after it the calendar is ${stillUp ? 'still up' : 'GONE'}, the box holds "${v1}" (before: "${v0}"), refusal line: "${warn}"`,
      says.max === says.today && !!td && !td.disabled && !!tm && tm.disabled && /is-out/.test(tm.cls) && tmb.opacity === '0.55' && under === `dcal-day-${tomorrow}` && !!stillUp && v1 === v0 && warn === '')
    await L.pic(w, picName)
    if (await cardUp()) await closeCal()
  })
}

try {
  /* 1 — the side panel's boxes */
  await L.go(w, 'tracker')
  await p.waitForSelector('#flowSvg .ball', { state: 'attached', timeout: 20000 })
  await view('info')
  const INK = await tok(w, '--ink', '#page-tracker .tr-root'), MUTED = await tok(w, '--muted', '#page-tracker .tr-root')
  const up = p.locator('#upchit')
  await up.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  await L.pic(w, `trk-${K}-1-side-panel-boxes`)
  const column = ['#lastSyll', '#lastCurr', '#upchit']
  const widths = async () => { const o = {}; for (const s of column) { const d = await drawn(w, s); o[s] = d ? d.w : null } return o }
  const empty = await widths(), emptyValues = []
  for (const s of column) emptyValues.push(await valueOf(s))

  /* Upchit is a PLANNED day (D374): every day is offered. Then today is picked into it, so its ✕ shows. */
  let today = ''
  await part(BOX, 'Upchit', async () => {
    await w.press('#upchit')
    await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(450)
    const says = await calSays(w); today = says.today
    const tomorrow = plus(today, 1)
    if (w.phone) {
      const name = await drawn(w, '[data-testid="dcal-name"]')
      check(BOX, 'L9 — the card over Upchit', 'its line names the box: "UPCHIT DATE"', name ? `"${name.text}" drawn ${name.transform}` : 'no line on the card', !!name && name.text === 'Upchit date' && name.transform === 'uppercase')
    }
    await L.pic(w, `trk-${K}-2-calendar-over-tracker`)
    await showMonth(w, tomorrow.slice(0, 7))
    const tm = await drawn(w, day(tomorrow))
    check(BOX, 'L14 — Upchit, a planned day', 'no last date: tomorrow is offered like any other day', `the calendar says last day ${says.max}; tomorrow (${tomorrow}): ${tm ? `classes "${tm.cls}", switched off: ${tm.disabled}` : 'not on screen'}`, says.max === null && !!tm && !tm.disabled && !/is-out/.test(tm.cls))
    await showMonth(w, today.slice(0, 7))
    await w.press(day(today))
    await L.sleep(500)
  })
  await up.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
  await L.pic(w, `trk-${K}-3-box-with-cross`, { around: '#upchit', pad: w.phone ? 90 : 70 })

  /* L16 — one width for the column, empty or filled (a desktop); a phone's two-across grid is as it was */
  await part(BOX, 'L16', async () => {
    if (!today || (await valueOf('#upchit')) !== today) return notWalked(BOX, 'L16 — the side panel’s column of date boxes', 'one width, empty and filled', `Upchit was not filled with today: it holds "${await valueOf('#upchit')}"`)
    const filled = await widths()
    const rule = await drawn(w, '#page-tracker .curGrid .field .trdatebox')
    const txt = await drawn(w, '#upchit .datebox-txt'), x = await drawn(w, '#upchit ~ .trdate-x'), ub = await drawn(w, '#upchit')
    const saw = `empty (${emptyValues.map(v => `"${v}"`).join(', ')}): ${column.map(s => `${s} ${empty[s]}px`).join(', ')}; with Upchit holding "${await valueOf('#upchit')}": ${column.map(s => `${s} ${filled[s]}px`).join(', ')}; Upchit reads "${txt && txt.text}" (cut: ${txt && txt.cut}), its ✕ ends ${x ? Math.round((ub.r - x.r) * 10) / 10 : '?'}px inside the box's right edge; the column's least width is set to ${rule && rule.minWidth}`
    const all = [...column.map(s => empty[s]), ...column.map(s => filled[s])]
    if (!w.phone) check(BOX, 'L16 — the side panel’s column of date boxes', 'one width for the three boxes, the same empty and filled, wide enough for a full date with its ✕ (never under the 128px a filled box had)', saw,
      (await valueOf('#upchit')) === today && all.every(v => v != null && Math.abs(v - all[0]) <= 0.5) && all[0] >= 128 && !!txt && !txt.cut && !!x && x.r <= ub.r + 0.5 && !!rule && rule.minWidth === '144px')
    else check(BOX, 'L16 — a phone is as it was', 'the desktop’s one width does not reach a phone: each box takes its column of the two-across grid, and a full date is not cut', saw, !!rule && rule.minWidth !== '144px' && !!txt && !txt.cut)
  })

  /* L14 — the two Last Flown boxes */
  await offersNoDayAfterToday(BOX, 'Last Flown (Syllabus)', '#lastSyll', '', `trk-${K}-3b-last-flown-syllabus-no-day-after-today`, /^Last Flown \(Syllabus\)$/)
  await offersNoDayAfterToday(BOX, 'Last Flown (Currency)', '#lastCurr', '', `trk-${K}-3c-last-flown-currency-no-day-after-today`, /^Last Flown \(Currency\)$/)

  if (!w.phone) {
    /* K12 — the keys on a box that holds a date */
    const fillByKeys = async () => { await up.focus(); await L.sleep(450); await p.keyboard.press('Enter'); await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(300); await p.keyboard.press('Enter'); await L.sleep(450); return valueOf('#upchit') }
    await part(BOX, 'K12', async () => {
      await up.focus()
      const v0 = await valueOf('#upchit')
      await p.keyboard.press('Delete'); await L.sleep(450)
      check(BOX, 'K12 — Delete on a box that holds a date', 'takes the date off, as its ✕ does; the keyboard stays on the box', `"${v0}" → "${await valueOf('#upchit')}"; keyboard on ${await kbOn(w)}`, !!v0 && (await valueOf('#upchit')) === '' && (await kbOn(w)) === '#upchit')
      const v2 = await fillByKeys()
      await p.keyboard.press('Backspace'); await L.sleep(450)
      check(BOX, 'K12 — Backspace on a box that holds a date', 'the same: the date is taken off and the keyboard stays on the box', `filled again by keys with "${v2}" → "${await valueOf('#upchit')}"; keyboard on ${await kbOn(w)}`, !!v2 && (await valueOf('#upchit')) === '' && (await kbOn(w)) === '#upchit')
      /* the ✕, one Tab away, still does it */
      const v3 = await fillByKeys()
      await p.keyboard.press('Tab')
      const onX = await L.focusOf(w), isX = await p.evaluate(() => !!document.activeElement?.classList.contains('trdate-x'))
      await L.pic(w, `trk-${K}-4-keyboard-on-cross`, { around: '#upchit', pad: 70 })
      await p.keyboard.press('Enter'); await L.sleep(450)
      check(BOX, 'Tab onto the ✕, then Enter', 'the ✕ is the next stop, with a ring; Enter takes the date off and the keyboard returns to the box', `after Tab the keyboard is on ${onX}; "${v3}" → "${await valueOf('#upchit')}"; keyboard on ${await kbOn(w)}`, isX && !/NO RING/.test(onX) && !!v3 && (await valueOf('#upchit')) === '' && (await kbOn(w)) === '#upchit')
    })

    /* K12 — the key is the BOX's. The Tracker's own Delete deletes what is selected on a chart being arranged: pressed
       on a date box it must do nothing to the chart. The premise is proved last: the same key pressed on the page
       DOES raise the chart's "Delete …?" question (it is answered Cancel). */
    await part(BOX, 'K12 and the chart', async () => {
      const KEY = 'K12 — Delete on a date box while the chart is being arranged'
      const WANT = 'the box’s own date is taken off; the chart is untouched and asks no "Delete …?" question'
      const arranging = () => p.evaluate(() => !!document.querySelector('#page-tracker .tr-root.arranging'))
      const arrange = async on => {
        if ((await arranging()) === on) return true
        if (!(await p.locator('#arrangeBtn').isVisible().catch(() => false))) { await p.click('#sylMenuBtn').catch(() => {}); await L.sleep(150) }
        await p.click('#arrangeBtn').catch(() => {}); await L.sleep(400)
        return (await arranging()) === on
      }
      const v0 = await fillByKeys()
      if (!(await arrange(true))) return notWalked(BOX, KEY, WANT, 'the chart did not go into its arranging mode')
      await p.click('#selectAllBtn').catch(() => {}); await L.sleep(250)
      const balls = () => p.locator('#flowSvg .ball').count()
      const asked = () => p.locator('#dlgModal').count()
      if (!(await up.isVisible().catch(() => false))) { await arrange(false); return notWalked(BOX, KEY, WANT, 'the side panel’s Upchit box is not on screen while the chart is arranged') }
      const n0 = await balls()
      await up.focus()
      await p.keyboard.press('Delete'); await L.sleep(450)
      const v1 = await valueOf('#upchit'), q1 = await asked(), n1 = await balls()
      await p.keyboard.press('Backspace'); await L.sleep(350)
      const q2 = await asked(), n2 = await balls()
      await L.pic(w, `trk-${K}-4b-delete-on-a-box-while-arranging`)
      /* the premise */
      await p.evaluate(() => { const e = document.activeElement; if (e && e.blur) e.blur() })
      await p.keyboard.press('Delete'); await L.sleep(450)
      const q3 = await asked(), msg = q3 ? ((await p.locator('#dlgMsg').textContent()) || '').replace(/\s+/g, ' ').trim().slice(0, 80) : ''
      if (q3) { if (await p.locator('#dlgCancel').count()) await p.click('#dlgCancel'); else await p.keyboard.press('Escape'); await L.sleep(300) }
      const n3 = await balls()
      const saw = `${n0} events on the chart, all selected; Delete on Upchit ("${v0}" → "${v1}"): question asked ${!!q1}, events ${n1}; Backspace on the box now empty: question asked ${!!q2}, events ${n2}; the same key pressed on the page: ${q3 ? `the chart asks "${msg}" (answered Cancel)` : 'no question'}, events ${n3}`
      if (!q3) notWalked(BOX, KEY, WANT, `the premise did not hold — ${saw}`)
      else check(BOX, KEY, WANT, saw, !!v0 && v1 === '' && !q1 && !q2 && n1 === n0 && n2 === n0 && n3 === n0)
      await arrange(false)
    })
  }

  /* 2 — the marking pop-up: a tap on a ball */
  await view('flow')
  const openPop = async () => {
    const ball = p.locator('#flowSvg .ball').first()
    await ball.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await L.sleep(300)
    const bb = await ball.boundingBox()
    if (w.phone) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
    await L.sleep(600)
    return p.locator('#popDoneDate').count()
  }
  const words = sel => drawn(w, `${sel} .datebox-txt`)
  const doneLabel = async () => ((await p.locator('#popDoneRow .mini').first().textContent()) || '').trim()
  if (await openPop()) {
    await L.pic(w, `trk-${K}-5-marking-pop-up`)
    /* L15 — nothing marked, Fails 0: both dates are only where a mark WOULD land */
    await part(POP, 'L15 before a mark', async () => {
      const d = await drawn(w, '#popDoneDate'), f = await drawn(w, '#popFailDate'), dt = await words('#popDoneDate'), ft = await words('#popFailDate')
      const fails = ((await p.locator('#failCount').textContent()) || '').trim()
      check(POP, 'L15 — before anything is marked', 'Done on and Failed on both show their date in the dim colour of an empty box; no word changes; Failed on is there at Fails 0', `"${await doneLabel()}": "${dt.text}" drawn ${dt.color} (dim class: ${/is-notyet/.test(d.cls)}); Fails ${fails}, Failed on: "${ft.text}" drawn ${ft.color} (dim class: ${/is-notyet/.test(f.cls)}); the dim colour is ${MUTED}, the plain ink ${INK}`,
        /^Done on \(when marked\)/.test(await doneLabel()) && fails === '0' && /is-notyet/.test(d.cls) && /is-notyet/.test(f.cls) && same(dt.color, MUTED) && same(ft.color, MUTED) && !!dt.text && !!ft.text)
    })
    /* L14 — neither date offers a day after today */
    await offersNoDayAfterToday(POP, 'Done on', '#popDoneDate', '#popDoneWarn', `trk-${K}-6-pop-up-calendar`, /^Done on$/)
    await offersNoDayAfterToday(POP, 'Failed on', '#popFailDate', '#popFailWarn', `trk-${K}-6b-pop-up-failed-on-calendar`, /^Failed on$/)
    await part(POP, 'the pop-up stays', async () => {
      check(POP, 'the pop-up after its calendars were looked at', 'still open: closing a calendar closes the calendar only', `the pop-up is ${(await p.locator('#popDoneDate').count()) ? 'open' : 'CLOSED'}`, (await p.locator('#popDoneDate').count()) === 1)
    })
    /* L15 — a failure recorded on the day in the box: that date is a record now */
    await part(POP, 'L15 after +', async () => {
      await w.press('#popFailPlus'); await L.sleep(500)
      const f = await drawn(w, '#popFailDate'), ft = await words('#popFailDate'), d = await drawn(w, '#popDoneDate'), dt = await words('#popDoneDate')
      const fails = ((await p.locator('#failCount').textContent()) || '').trim()
      check(POP, 'L15 — after + records a failure', 'Failed on turns the plain ink (a failure is on that day); Done on is still dim (the event is not done)', `Fails ${fails}; Failed on "${ft.text}" drawn ${ft.color} (dim class: ${/is-notyet/.test(f.cls)}); Done on "${dt.text}" drawn ${dt.color} (dim class: ${/is-notyet/.test(d.cls)}); the plain ink ${INK}, the dim colour ${MUTED}`,
        fails === '1' && !/is-notyet/.test(f.cls) && same(ft.color, INK) && /is-notyet/.test(d.cls) && same(dt.color, MUTED))
      await L.pic(w, `trk-${K}-5b-pop-up-after-a-failure`)
    })
    /* L15 — the grade: the pop-up closes; opened again, Done on is the day the mark has */
    await part(POP, 'L15 after a grade', async () => {
      await w.press(p.locator('#pop .opts button').filter({ hasText: /^DCO$/ })); await L.sleep(600)
      const closed = !(await p.locator('#popDoneDate').count())
      if (!(await openPop())) return notWalked(POP, 'L15 — after the event is marked done', 'Done on turns the plain ink', `after DCO the pop-up was ${closed ? 'closed' : 'still open'} and a tap on the same event did not open it again`)
      const d = await drawn(w, '#popDoneDate'), dt = await words('#popDoneDate')
      check(POP, 'L15 — after the event is marked done', 'Done on turns the plain ink (a mark carries the day) and its label reads "Done on"', `"${await doneLabel()}": "${dt.text}" drawn ${dt.color} (dim class: ${/is-notyet/.test(d.cls)}); the plain ink ${INK}`, /^Done on(?! \(when marked\))/.test(await doneLabel()) && !/is-notyet/.test(d.cls) && same(dt.color, INK))
      await L.pic(w, `trk-${K}-5c-pop-up-after-a-grade`)
    })

    if (!w.phone) {
      /* THE KEYBOARD INSIDE THE POP-UP — K6, a job of its own, not in this batch: OPEN while it is as the look found it */
      await part(POP, 'the keyboard in the pop-up (K6)', async () => {
        if (!(await p.locator('#popDoneDate').count()) && !(await openPop())) return notWalked(POP, 'the keyboard in the pop-up', 'the pop-up open', 'the pop-up did not open')
        const insidePop = () => p.evaluate(() => !!document.activeElement?.closest('#pop'))
        const first = await L.focusOf(w), in0 = await insidePop()
        L.row(POP, 'opens with the keyboard on…', 'something inside the pop-up', first, in0 ? 'works' : `OPEN — K6, not in this batch: the keyboard is on ${first.split(' · ')[0]}`)
        const stops = []
        for (let i = 0; i < 10; i++) { await p.keyboard.press('Tab'); stops.push((await L.focusOf(w)).split(' · ')[0]) }
        const in1 = await insidePop()
        L.row(POP, 'Tab, ten times', 'goes round INSIDE the pop-up', stops.join('  |  ') + ` · still inside: ${in1}`, in1 ? 'works' : 'OPEN — K6, not in this batch: Tab leaves the pop-up')
        await p.locator('#popDoneDate').focus(); await p.keyboard.press('Enter'); await L.sleep(350)
        const calUp = await cardUp()
        await p.keyboard.press('Escape'); await L.sleep(300)
        const calGone = !(await cardUp()), popStill = await p.locator('#popDoneDate').count()
        check(POP, 'Enter on "Done on", then Escape', 'the calendar opens; Escape closes the calendar only, and the keyboard is back on the box', `opened ${!!calUp}; after Escape: calendar ${calGone ? 'closed' : 'OPEN'}, pop-up ${popStill ? 'still open' : 'CLOSED'}; keyboard on ${await kbOn(w)}`, !!calUp && calGone && !!popStill && (await kbOn(w)) === '#popDoneDate')
        await p.keyboard.press('Escape'); await L.sleep(300)
        const popGone = !(await p.locator('#popDoneDate').count()), onBall = await p.evaluate(() => !!document.activeElement?.closest('.ball'))
        L.row(POP, 'Escape again', 'closes the pop-up; the keyboard returns to the event that opened it', `pop-up ${popGone ? 'closed' : 'OPEN'}; keyboard on ${await L.focusOf(w)}`, !popGone ? 'FAIL — the pop-up stayed open' : onBall ? 'works' : 'OPEN — K6, not in this batch: the pop-up closes and the keyboard is left on nothing')
      })
    }
    const closeBtn = p.locator('#pop .opts button').filter({ hasText: /^Close$/ })
    if (await closeBtn.count()) { await w.press(closeBtn); await L.sleep(300) }
  } else notWalked(POP, 'the marking pop-up', 'a tap on an event opens it', 'the marking pop-up did not open')

  /* 3 — the full failures list: its rows are "Failed on" days too, and refuse a day after today the same way (D374) —
     the failure recorded above is its row */
  await view('info')
  await part(BOX, 'the failures list', async () => {
    const title = p.locator('#failTitle')
    if (!(await title.count())) return notWalked(BOX, 'L14 — a row of the full failures list', 'the list opens from the Failures title', 'no Failures title on the side panel')
    await title.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200)
    await w.press(title); await L.sleep(400)
    const rowBox = '#failLog .frow button.datebox'
    if (!(await p.locator(rowBox).count())) return notWalked(BOX, 'L14 — a row of the full failures list', 'the failure recorded in the pop-up has a row', `the list is ${(await p.locator('#failLog').count()) ? 'open with no row' : 'not open'}`)
    await L.pic(w, `trk-${K}-7-failures-list`)
  })
  if (await p.locator('#failLog .frow button.datebox').count()) {
    await offersNoDayAfterToday(BOX, 'a row of the full failures list', '#failLog .frow button.datebox', '', `trk-${K}-7b-failures-list-no-day-after-today`, / failed on$/)
    if (await p.locator('#failLogClose').count()) { await w.press('#failLogClose'); await L.sleep(300) }
  }
} finally { await L.close(w) }
