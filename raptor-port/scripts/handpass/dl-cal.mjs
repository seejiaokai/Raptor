/* THE DESIGN LOOK — the one date calendar, at both sizes. FIRST WRITTEN (13 Oct 26) to record what the look FOUND; SINCE
   THE SMALL FIXES WERE BUILT (14 Oct 26 — [LOOK-13OCT-SMALL-FIXES], owner D830) every note that observed a finding is a
   CHECK of the fixed behaviour (docs/walk-scripts.md §6), so running it on the new build IS the re-walk: each line ends
   `works`, `FAIL — <what was seen>`, or `NOT WALKED — <why the script could not act>`. What it checks, measured on the
   page: L8 (a date that cannot be picked is faint and plain, today and the standing-out weekday too), L9 (a phone's
   card names its box), L11 (a run's sentence is the plain ink), L12 (the faint dates' strength), L13 (the keyboard's
   place in the lists is a ring, and the title's ring goes round its words), L17 (a weekend inside a run is full
   strength), K1–K4 (Home / End, Shift + Page, into and out of the lists) — beside the keys that already worked.
   A picture at every step (dl-lib.mjs; DL_SHOTS names the folder).
   NOT here, by his ruling: Escape with the lists open still closes the whole calendar (step two's key set).
   node scripts/handpass/dl-cal.mjs [phone|desk] */
import * as L from './dl-lib.mjs'
import { calSays, check, contrast, drawn, kbOn, months, notWalked, over, part, parts, plus, same, showMonth, tok, weekday } from './dl-check.mjs'
const size = process.argv[2] || 'desk'
console.log(`dl-cal.mjs — the re-walk of the small fixes (written 14 Oct 26) · ${size} · pictures and keyboard.json → ${L.SHOTS}`)
const w = await L.world(size)
const p = w.page
const K = size
const CAL = `Date calendar [${K}]`, LISTS = `Month-and-year lists [${K}]`, BOX = `Date box [${K}]`
const INK = await tok(w, '--ink'), INK3 = await tok(w, '--ink-3'), ACCENT = await tok(w, '--accent')
const day = iso => `[data-testid="dcal-day-${iso}"]`
const at = () => p.evaluate(() => document.activeElement?.getAttribute('data-iso') || '')
const closeCal = async () => { if (w.phone) await p.touchscreen.tap(8, 8); else await p.keyboard.press('Escape'); await L.sleep(450) }
let today = '', from0 = ''

try {
  /* 1 — "Every Thursday": the two date boxes, and the calendar over both windows */
  await L.openCalendarWindow(w)
  await w.press('[data-testid="days-wd-3"]')
  await p.waitForSelector('[data-testid="win-every"]')
  await L.sleep(300)
  await L.pic(w, `cal-${K}-1-every-form`)
  from0 = await p.locator('[data-testid="every-from"]').getAttribute('data-value')
  await w.press('[data-testid="every-from"]')
  await p.waitForSelector('[data-testid="dcal-card"]')
  await L.sleep(450)
  today = (await calSays(w)).today
  console.log(`   the calendar is on ${(await calSays(w)).month}; today ${today}; From holds ${from0}`)

  /* L9 — on a phone the card says which date it is for; on a desktop the panel hangs under its own box and says nothing */
  await part(CAL, 'L9', async () => {
    const name = await drawn(w, '[data-testid="dcal-name"]')
    if (w.phone) {
      const card = await drawn(w, '[data-testid="dcal-card"]'), title = await drawn(w, '[data-testid="dcal-title"]')
      const first = await p.evaluate(() => document.querySelector('[data-testid="dcal-card"]')?.firstElementChild?.getAttribute('data-testid') || '')
      check(CAL, 'L9 — the card names its box', 'one line of small capitals at the top of the card: "FROM"', name ? `"${name.text}" drawn ${name.transform}, ${name.w}×${name.h} at the card's top (first in the card: ${first}); the title starts ${Math.round(title.y - name.b)}px under it; one line: ${!name.cut && name.h <= 20}` : 'no line on the card',
        !!name && name.text === 'From' && name.transform === 'uppercase' && first === 'dcal-name' && name.b <= title.y + 0.5 && name.y >= card.y && name.h <= 20)
    } else check(CAL, 'L9 — a desktop panel carries no such line', 'no name line: the panel hangs under its own box', name ? `a line "${name.text}"` : 'no line', !name)
  })
  /* D824 — the picked date is the plain bright disc: no ring after a tap or a click */
  await part(CAL, 'D824', async () => {
    const d = await drawn(w, `${day(from0)} b`)
    check(CAL, 'D824 — the picked date, opened by a click or a tap', 'the bright disc, no ring round it', d ? `${day(from0)} — ${d.ring}; disc ${d.bg}` : 'the picked date is not on screen', !!d && d.ring === 'no ring' && same(d.bg, ACCENT))
  })
  await L.pic(w, `cal-${K}-2-calendar-open`)
  if (!w.phone) await L.pic(w, `cal-${K}-2c-calendar-close-up`, { around: '[data-testid="dcal-card"]', pad: 60 })

  if (!w.phone) {
    /* THE KEYBOARD, on the desktop — every key is pressed for real and what it did is read off the page */
    const month = async () => (await calSays(w)).month
    await part(CAL, 'the keys on the dates', async () => {
      const a0 = await at()
      check(CAL, 'opens with the keyboard on…', 'the picked date', `the keyboard is on ${a0 || await kbOn(w)}; the box holds ${from0}`, a0 === from0)
      await p.keyboard.press('ArrowRight'); const a1 = await at()
      await p.keyboard.press('ArrowDown'); const a2 = await at()
      await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowUp'); const a3 = await at()
      check(CAL, 'Arrow keys', 'a day right, a week down, a day left and a week up — back where it began', `${a0} → right ${a1} → down ${a2} → left, up ${a3}`, a1 === plus(a0, 1) && a2 === plus(a1, 7) && a3 === a0)
      const ring = await drawn(w, `${day(a3)} b`)
      check(CAL, 'D824 — the ring while the keyboard is on a date', 'the app’s cyan ring, 2px, round the date the keyboard is on', ring ? ring.ring : 'that date is not on screen', !!ring && /^solid 2px/.test(ring.ring) && same(ring.ring.replace(/^solid 2px /, ''), ACCENT))
      await L.pic(w, `cal-${K}-3-keyboard-on-a-date`, { around: '[data-testid="dcal-card"]', pad: 24 })
      const m0 = await month()
      await p.keyboard.press('PageDown'); const m1 = await month(); const f1 = await at()
      await p.keyboard.press('PageUp'); const m2 = await month(); const f2 = await at()
      check(CAL, 'Page Up / Page Down', 'the same day a month on, and back', `${a3} in ${m0} → PageDown ${f1} in ${m1} → PageUp ${f2} in ${m2}`, f1 === months(a3, 1) && m1 === f1.slice(0, 7) && f2 === months(f1, -1) && m2 === m0)
      /* K1 */
      const h0 = await at()
      await p.keyboard.press('Home'); const h1 = await at()
      await p.keyboard.press('End'); const h2 = await at()
      check(CAL, 'K1 — Home / End', 'Home: the Monday of that week; End: its Sunday', `on ${h0} (weekday ${weekday(h0)}, 0 = Monday): Home → ${h1}, then End → ${h2}; the calendar on ${await month()}`, h1 === plus(h0, -weekday(h0)) && h2 === plus(h1, 6))
      /* K2 */
      const y0 = await at()
      await p.keyboard.press('Shift+PageDown'); const y1 = await at(); const ym1 = await month()
      await p.keyboard.press('Shift+PageUp'); const y2 = await at(); const ym2 = await month()
      check(CAL, 'K2 — Shift + Page Down / Up', 'the same day a YEAR on, and back (Page alone stays a month)', `${y0} → Shift+PageDown ${y1} (calendar on ${ym1}) → Shift+PageUp ${y2} (calendar on ${ym2})`, y1 === months(y0, 12) && ym1 === y1.slice(0, 7) && y2 === months(y1, -12) && ym2 === y2.slice(0, 7))
      /* the Tab order inside the card: the dates are ONE stop */
      const start = await at(), stops = []
      for (let i = 0; i < 5; i++) { await p.keyboard.press('Tab'); stops.push(await kbOn(w)) }
      const inside = await p.evaluate(() => !!document.activeElement?.closest('[data-testid="dcal-card"]'))
      check(CAL, 'Tab, five times', 'round inside the card: the title → Today → the two arrows → back on the date it left', `from ${start}: ${stops.join(' | ')}; still inside the card: ${inside}`, inside && stops.join('|') === ['dcal-title', 'dcal-today', 'dcal-prev', 'dcal-next', `dcal-day-${start}`].join('|'))
      const t0 = await at(); await p.keyboard.press('t'); const t1 = await at()
      check(CAL, 'a key for today', 'none: "t" moves nothing — the Today button is one Tab from the title', `"t" on ${t0} → ${t1}`, !!t0 && t1 === t0)
    })

    await part(LISTS, 'the title and the lists', async () => {
      /* L13 — the title's ring, with the keyboard brought to it by Tab */
      await p.locator('[data-testid="dcal-grid"] button[tabindex="0"]').focus()
      await p.keyboard.press('Tab')
      const on = await kbOn(w)
      const title = await drawn(w, '[data-testid="dcal-title"]'), words = await drawn(w, '[data-testid="dcal-title"] .dcal-tw')
      check(LISTS, 'L13 — the title’s ring', 'round its words only (the app’s cyan, 2px); the title itself keeps its fixed room of ten letters’ width', on !== 'dcal-title' ? `the keyboard is on ${on}, not the title` : `the title ${title.w}px wide (${(title.w / title.fontSize).toFixed(2)} × its ${title.fontSize}px letters), its own ring: ${title.ring}; the words "${words && words.text}" ${words && words.w}px wide, their ring: ${words && words.ring}`,
        on === 'dcal-title' && !!words && title.ring === 'no ring' && /^solid 2px/.test(words.ring) && same(words.ring.replace(/^solid 2px /, ''), ACCENT) && words.w <= title.w - 7.5 && Math.abs(title.w / title.fontSize - 10) < 0.1)
      await L.pic(w, `cal-${K}-3b-title-ring`, { around: '[data-testid="dcal-card"]', pad: 24 })
      /* K3 */
      await p.keyboard.press('Enter')
      await p.waitForSelector('[data-testid="dcal-lists"]')
      await L.sleep(350)
      const afterOpen = await kbOn(w)
      check(LISTS, 'K3 — Enter on the title', 'the lists open with the keyboard IN the month list', `the lists are open; the keyboard is on ${afterOpen}`, afterOpen === 'dcal-months')
      /* L13 — the keyboard's place is a ring round the list, never a cyan word */
      const ringOf = async which => {
        const ring = await drawn(w, '[data-testid="dcal-lists"]', '::after'), lists = await drawn(w, '[data-testid="dcal-lists"]'), col = await drawn(w, `[data-testid="dcal-${which}"]`)
        const mo = await drawn(w, '[data-testid="dcal-months"] .dcal-opt.is-at'), yr = await drawn(w, '[data-testid="dcal-years"] .dcal-opt.is-at')
        const l = ring.left, r = lists.w - ring.right
        return {
          saw: `ring ${ring.content === 'none' ? 'not drawn' : ring.ring}, from ${l}px to ${r}px across the lists; the ${which} list runs ${Math.round((col.x - lists.x) * 10) / 10}px to ${Math.round((col.r - lists.x) * 10) / 10}px; "${mo.text}" is ${mo.color} (weight ${mo.weight}), "${yr.text}" is ${yr.color} (weight ${yr.weight}); the plain ink is ${INK}`,
          ok: ring.content !== 'none' && /^solid 2px/.test(ring.ring) && same(ring.ring.replace(/^solid 2px /, ''), ACCENT) && Math.abs(l - (col.x - lists.x)) <= 1.5 && Math.abs(r - (col.r - lists.x)) <= 1.5 && same(mo.color, INK) && same(yr.color, INK) && mo.weight === '800' && yr.weight === '800',
        }
      }
      const rm = await ringOf('months')
      check(LISTS, 'L13 — the keyboard in the month list', 'the app’s cyan ring round the MONTH list; the chosen month and year both the plain ink, heavy — neither cyan', rm.saw, rm.ok)
      await L.pic(w, `cal-${K}-4-lists-open`, { around: '[data-testid="dcal-card"]', pad: 24 })
      const mm0 = await month(); await p.keyboard.press('ArrowDown'); await L.sleep(500); const mm1 = await month()
      await p.keyboard.press('ArrowUp'); await L.sleep(500); const mm2 = await month()
      const nextM = `${mm0.slice(0, 4)}-${String((+mm0.slice(5) % 12) + 1).padStart(2, '0')}`
      check(LISTS, 'Arrow Up / Down in a list', 'the month after, and back (the months go round; the year is the other list’s)', `${mm0} → down ${mm1} → up ${mm2}`, mm1 === nextM && mm2 === mm0)
      await p.keyboard.press('Tab')
      const onYears = await kbOn(w), ry = await ringOf('years')
      check(LISTS, 'L13 — the keyboard in the year list', 'the ring moves to the YEAR list; both words still the plain ink', `after Tab the keyboard is on ${onYears}; ${ry.saw}`, onYears === 'dcal-years' && ry.ok)
      await L.pic(w, `cal-${K}-5-lists-keyboard`, { around: '[data-testid="dcal-card"]', pad: 24 })
      /* READ ONLY ONCE ANY SCROLLING WOULD HAVE SETTLED (14 Oct 26). The first cut read the year 450ms after the key: a
         list the browser scrolls by End takes about 750ms to stop and be read as a choice, so "nothing moved" was true
         of every reading and false of the app — End chose 2086. The next key then raced it (one run in four). */
      const hm0 = await month(); await p.keyboard.press('End'); await L.sleep(1300); const hm1 = await month(); await p.keyboard.press('Shift+PageDown'); await L.sleep(1300); const hm2 = await month()
      await p.keyboard.press('PageDown'); await L.sleep(1300); const hm3 = await month(); await p.keyboard.press('Space'); await L.sleep(1300); const hm4 = await month(); await p.keyboard.press('Home'); await L.sleep(1300); const hm5 = await month()
      check(LISTS, 'Home / End / Page keys in a list', 'not the lists’ keys: nothing moves (the arrows move a list)', `${hm0} → End ${hm1} → Shift+PageDown ${hm2} → PageDown ${hm3} → Space ${hm4} → Home ${hm5} (each read 1.3s after its key); the lists ${(await p.locator('[data-testid="dcal-lists"]').count()) ? 'still open' : 'CLOSED'}`, hm1 === hm0 && hm2 === hm0 && hm3 === hm0 && hm4 === hm0 && hm5 === hm0 && (await p.locator('[data-testid="dcal-lists"]').count()) === 1)
      /* K4 — a year on, then Enter */
      await p.keyboard.press('ArrowDown'); await L.sleep(500)
      const chosen = await month()
      await p.keyboard.press('Enter'); await L.sleep(350)
      const listsStill = await p.locator('[data-testid="dcal-lists"]').count(), back = await month(), onDate = await at()
      const stop = await p.evaluate(() => document.activeElement?.getAttribute('tabindex') || '')
      const want = from0.slice(0, 7) === chosen ? from0 : today.slice(0, 7) === chosen ? today : `${chosen}-01`
      check(LISTS, 'K4 — Enter in a list', 'the lists close onto the dates of the month chosen, the keyboard on that month’s one stop (the picked date, else today, else the 1st)', `chose ${chosen} in the year list; after Enter the lists are ${listsStill ? 'STILL OPEN' : 'closed'}, the calendar on ${back}, the keyboard on ${onDate || await kbOn(w)} (tab stop: ${stop === '0'})`, chosen === `${+hm0.slice(0, 4) + 1}${hm0.slice(4)}` && !listsStill && back === chosen && onDate === want && stop === '0')
      await L.pic(w, `cal-${K}-5b-back-on-the-dates`, { around: '[data-testid="dcal-card"]', pad: 24 })
    })

    await part(CAL, 'Escape, and a pick by keys', async () => {
      /* Escape closes the calendar first, the window second; the keyboard returns to the box */
      await p.keyboard.press('Escape'); await L.sleep(300)
      const calGone = !(await p.locator('[data-testid="dcal-card"]').count()), winStill = await p.locator('[data-testid="win-every"]').count()
      check(CAL, 'Escape', 'closes the calendar only; the window behind stays; the keyboard is back on the box', `calendar ${calGone ? 'closed' : 'OPEN'}, window ${winStill ? 'still open' : 'CLOSED'}, keyboard on ${await kbOn(w)}`, calGone && !!winStill && (await kbOn(w)) === 'every-from')
      /* open by keyboard, pick by keyboard */
      await p.locator('[data-testid="every-from"]').focus()
      await p.keyboard.press('Space'); await L.sleep(300)
      const opened = await p.locator('[data-testid="dcal-card"]').count()
      const v0 = await p.locator('[data-testid="every-from"]').getAttribute('data-value')
      await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await L.sleep(300)
      const v1 = await p.locator('[data-testid="every-from"]').getAttribute('data-value')
      check(BOX, 'Space on the box, a week down, then Enter on the date', 'opens; picks the date a week on; closes; the keyboard is back on the box', `opened ${!!opened}; ${v0} → ${v1}; calendar ${(await p.locator('[data-testid="dcal-card"]').count()) ? 'OPEN' : 'closed'}; keyboard on ${await kbOn(w)}`, !!opened && v1 === plus(v0, 7) && !(await p.locator('[data-testid="dcal-card"]').count()) && (await kbOn(w)) === 'every-from')
      await L.pic(w, `cal-${K}-6-box-focused`, { around: '[data-testid="win-every"]', pad: 12 })
    })
  } else {
    /* the phone: the lists — a finger shows no keyboard's place: no ring, and both words the plain ink (L13) */
    await part(LISTS, 'the lists on a phone', async () => {
      await w.press('[data-testid="dcal-title"]')
      await p.waitForSelector('[data-testid="dcal-lists"]')
      await L.sleep(400)
      const ring = await drawn(w, '[data-testid="dcal-lists"]', '::after')
      const mo = await drawn(w, '[data-testid="dcal-months"] .dcal-opt.is-at'), yr = await drawn(w, '[data-testid="dcal-years"] .dcal-opt.is-at')
      check(LISTS, 'L13 — the lists opened by a finger', 'the chosen month and year both the plain ink, heavy; no ring (a ring is a keyboard’s)', `"${mo.text}" ${mo.color} (weight ${mo.weight}), "${yr.text}" ${yr.color} (weight ${yr.weight}); the plain ink is ${INK}; ring ${ring.content === 'none' ? 'not drawn' : ring.ring}`, same(mo.color, INK) && same(yr.color, INK) && mo.weight === '800' && yr.weight === '800' && ring.content === 'none')
      await L.pic(w, `cal-${K}-4-lists-open`)
      await w.press('[data-testid="dcal-title"]')
      await L.sleep(300)
    })
    await closeCal()
  }

  /* 2 — "Until", where a date before the start may not be picked: the faint dates (L8, L12), and its card's name (L9).
     Today must be BEFORE the start for it to be one of them: the start is moved a week on where it is not. */
  await part(CAL, 'Until', async () => {
    if (await p.locator('[data-testid="dcal-card"]').count()) await closeCal()
    let from = await p.locator('[data-testid="every-from"]').getAttribute('data-value')
    if (!(today < from)) {
      const later = plus(from, 7)
      await w.press('[data-testid="every-from"]'); await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(450)
      if (await showMonth(w, later.slice(0, 7))) { await w.press(day(later)); await L.sleep(450) }
      from = await p.locator('[data-testid="every-from"]').getAttribute('data-value')
    }
    if (!(await p.locator('[data-testid="every-until"]').count())) { await w.press('[data-testid="every-until-date"]'); await L.sleep(300) }
    if (!(await p.locator('[data-testid="every-until"]').count()) || !(today < from)) return notWalked(CAL, 'L8, L12 — the faint dates under Until', 'dates before the start are faint', `the Until box is ${(await p.locator('[data-testid="every-until"]').count()) ? 'there' : 'NOT there'}; today ${today}, the start ${from}`)
    await w.press('[data-testid="every-until"]')
    await p.waitForSelector('[data-testid="dcal-card"]'); await L.sleep(450)
    const says = await calSays(w)
    console.log(`   Until's calendar is on ${says.month}; its first date ${says.min}; today ${says.today}`)
    if (w.phone) {
      const name = await drawn(w, '[data-testid="dcal-name"]')
      check(CAL, 'L9 — Until’s card', 'its line reads "UNTIL" — the window’s own word over the box (aloud the box is still "The date it ends")', name ? `"${name.text}" drawn ${name.transform}; the box says aloud "${await p.locator('[data-testid="every-until"]').getAttribute('aria-label')}"` : 'no line on the card', !!name && name.text === 'Until' && name.transform === 'uppercase' && /^The date it ends: /.test(await p.locator('[data-testid="every-until"]').getAttribute('aria-label') || ''))
    }
    /* today's month, by the Today icon */
    await w.press('[data-testid="dcal-today"]'); await L.sleep(300)
    const card = parts((await drawn(w, '[data-testid="dcal-card"]')).bg)
    /* L8 — today that cannot be picked: its disc kept, its number faint and plain */
    const t = await drawn(w, `${day(today)} b`), tb = await drawn(w, day(today))
    const tc = t ? parts(t.color) : null
    check(CAL, 'L8 — today, where it cannot be picked', 'keeps its soft disc (it still marks today); its number is the quiet ink at the faint dates’ strength — not bright cyan, not heavy; it takes no tap', t ? `${today}: classes "${tb.cls}", switched off: ${tb.disabled}; disc ${t.bg}; number ${t.color} (the quiet ink is ${INK3}, the accent ${ACCENT}), weight ${t.weight}, whole-date strength ${t.opacity}` : `today (${today}) is not on the month shown (${(await calSays(w)).month})`,
      !!t && /is-out/.test(tb.cls) && /is-today/.test(tb.cls) && tb.disabled && parts(t.bg).a > 0.05 && t.weight === '500' && t.opacity === '1' && !same(t.color, ACCENT) && Math.abs(tc.a - 0.55) <= 0.03 && same(`rgb(${tc.r}, ${tc.g}, ${tc.b})`, INK3, 2))
    /* L12 — a plain faint date: one step stronger, still plainly fainter than a weekend date */
    const plainSel = '[data-testid="dcal-grid"] .dcal-d.is-out:not(.is-today):not(.is-mk):not(.is-sel)'
    const weSel = '[data-testid="dcal-grid"] .dcal-d.is-we:not(.is-out):not(.is-today):not(.is-mk):not(.is-sel):not(.is-in)'
    const f = await drawn(w, `${plainSel} b`), fb = await drawn(w, plainSel), we = await drawn(w, `${weSel} b`)
    if (!f) notWalked(CAL, 'L12 — the faint dates', 'about 2.7 to 1 against the card', `no plain date that cannot be picked is on ${(await calSays(w)).month}`)
    else {
      const ratio = contrast(over(parts(f.color), card, +f.opacity), card)
      const weRatio = we ? contrast(over(parts(we.color), card, +we.opacity), card) : null
      check(CAL, 'L12 — the faint dates', 'the quiet ink at .55 — about 2.7 to 1 against the card (it was about 2.0) — plain weight, and still under half a weekend date’s strength', `date "${fb.text}": ${f.color} at strength ${f.opacity}, weight ${f.weight} → ${ratio.toFixed(2)} to 1 against the card; ${we ? `a weekend date that may be picked: ${we.color} at ${we.opacity} → ${weRatio.toFixed(2)} to 1` : 'no weekend date that may be picked is on this month'}`,
        same(f.color, INK3) && f.opacity === '0.55' && f.weight === '500' && ratio > 2.5 && ratio < 2.9 && (!we || weRatio > ratio * 2))
    }
    /* L8 — the weekday that stands out, on a date that cannot be picked: not bold, not full ink */
    const mkOut = '[data-testid="dcal-grid"] .dcal-d.is-out.is-mk:not(.is-today):not(.is-sel)'
    await L.pic(w, `cal-${K}-7-until-faint-dates`, w.phone ? {} : { around: '[data-testid="dcal-card"]', pad: 60 })
    if (!(await p.locator(mkOut).count())) { await w.press('[data-testid="dcal-prev"]'); await L.sleep(300); console.log(`   no Thursday before the start on today's month — turned to ${(await calSays(w)).month}`) }
    const m = await drawn(w, `${mkOut} b`), mb = await drawn(w, mkOut)
    if (!m) notWalked(CAL, 'L8 — the standing-out weekday, where it cannot be picked', 'plain and quiet', `no Thursday that cannot be picked is on ${(await calSays(w)).month}`)
    else {
      await L.pic(w, `cal-${K}-7b-until-thursdays-before-the-start`, w.phone ? {} : { around: '[data-testid="dcal-card"]', pad: 60 })
      /* the premise: a Thursday that MAY be picked is heavy and full ink — the start itself is one */
      await showMonth(w, from.slice(0, 7))
      const live = await drawn(w, `${day(from)} b`)
      check(CAL, 'L8 — the standing-out weekday, where it cannot be picked', 'plain weight and the quiet ink at the faint dates’ strength — while a Thursday that may be picked stays heavy and full ink', `Thursday "${mb.text}" before the start: ${m.color} at ${m.opacity}, weight ${m.weight}; the start itself (${from}): ${live ? `${live.color}, weight ${live.weight}` : 'not on screen'}; the plain ink is ${INK}`,
        m.weight === '500' && same(m.color, INK3) && m.opacity === '0.55' && !!live && live.weight === '800' && same(live.color, INK))
    }
    await closeCal()
  })

  /* 3 — Admin → Data: the run of dates drawn inside its form (L11, L17). The run is a Friday to the Monday after it, so
     the two dates INSIDE it are a Saturday and a Sunday. */
  await part(CAL, 'the run in Admin', async () => {
    await p.evaluate(() => { document.querySelectorAll('[data-testid$="-x"]').forEach(b => b.click()) })
    await L.adminPanel(w, 'Data')
    await p.locator('#admWipeDate').scrollIntoViewIfNeeded()
    await p.selectOption('#admWipeMode', 'range')
    await p.waitForSelector('#admWipeRun')
    const { month: mon, today: now } = await calSays(w, 'admWipeRun')
    const y = +mon.slice(0, 4), mo = +mon.slice(5), last = new Date(Date.UTC(y, mo, 0)).getUTCDate()
    const iso = d => `${mon}-${String(d).padStart(2, '0')}`
    /* the first Friday whose four days hold in the month — and do not hold TODAY, which wears its own colour */
    let fri = 0
    for (let d = 1; d + 3 <= last && !fri; d++) if (weekday(iso(d)) === 4 && !(now >= iso(d) && now <= iso(d + 3))) fri = d
    if (!fri) return notWalked(CAL, 'L11, L17 — the run in Admin', 'a Friday-to-Monday run on the month shown', `no such run clear of today on ${mon}`)
    const rd = d => `[data-testid="admWipeRun-day-${iso(d)}"]`
    await w.press(rd(fri)); await w.press(rd(fri + 3))
    await L.sleep(300)
    await p.locator('#admWipeRun').evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
    const run = await p.locator('#admWipeRun').evaluate(e => `${e.getAttribute('data-from')} to ${e.getAttribute('data-to')}`)
    if (run !== `${iso(fri)} to ${iso(fri + 3)}`) return notWalked(CAL, 'L11, L17 — the run in Admin', `a run from ${iso(fri)} to ${iso(fri + 3)}`, `the form holds "${run}"`)
    const sat = await drawn(w, `${rd(fri + 1)} b`), sun = await drawn(w, `${rd(fri + 2)} b`), satB = await drawn(w, rd(fri + 1)), sunB = await drawn(w, rd(fri + 2))
    /* the premise: a weekend date OUTSIDE the run is still the quiet ink */
    const outSel = '[data-testid="admWipeRun-grid"] .dcal-d.is-we:not(.is-in):not(.is-today):not(.is-sel)'
    const outside = await drawn(w, `${outSel} b`), outsideB = await drawn(w, outSel)
    check(CAL, 'L17 — a weekend inside a picked run', 'the Saturday and the Sunday inside the run are the plain ink at full strength, as every date in it is — a weekend date outside it stays quiet', `run ${run}: Saturday ${iso(fri + 1)} ${sat.color} at ${sat.opacity} (classes "${satB.cls}"), Sunday ${iso(fri + 2)} ${sun.color} at ${sun.opacity} (classes "${sunB.cls}"); outside it, ${outside ? `the weekend date "${outsideB.text}" is ${outside.color}` : 'no weekend date to compare'}; the plain ink ${INK}, the quiet ink ${INK3}`,
      /is-we/.test(satB.cls) && /is-in/.test(satB.cls) && /is-we/.test(sunB.cls) && /is-in/.test(sunB.cls) && same(sat.color, INK) && same(sun.color, INK) && sat.opacity === '1' && sun.opacity === '1' && (!outside || same(outside.color, INK3)))
    const foot = await drawn(w, '[data-testid="admWipeRun-foot"]')
    check(CAL, 'L11 — the sentence under a run', 'the plain ink, bold — not cyan: it is not a button', foot ? `"${foot.text}" is ${foot.color}, weight ${foot.weight}; the plain ink ${INK}, the accent ${ACCENT}` : 'no sentence under the run', !!foot && / to /.test(foot.text) && same(foot.color, INK) && foot.weight === '700')
    await L.pic(w, `cal-${K}-8-admin-run-in-form`, w.phone ? {} : { around: '#admWipeRun', pad: 110 })
  })
} finally { await L.close(w) }
