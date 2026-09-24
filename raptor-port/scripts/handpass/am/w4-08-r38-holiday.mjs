/* w4 · Astra rank 38 — a holiday declared on an ALREADY-PUBLISHED ordinary day.
   Tuesday 14 Jul is issued as its Original (an ordinary weekday: it earns nothing). Declare it a public
   holiday on the Leave War's event row (PH), WITHOUT republishing: the day must say it now earns and must be
   republished, and nobody is credited yet. Then sign + Publish AL1: the credits land.
   Rules: AM47/D2 (only the issued schedule earns, both directions — a holiday declared after publication
   waits for a republication and the day says so), AM46 (the latest published version pays), AM25.
   Usage: node w4-08-r38-holiday.mjs [desktop|phone] */
const w = process.argv[2] || 'desktop'
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4'
const L = await import('./w4-lib.mjs')
const { open, STATE, PHONE, DESK, lwOpen, lwShot, editWeek, head, signDay, publishAL, shot, toastNow, clearToast, checker, go, frame,
  alPanel, viewDay, book } = L
const { browser, page, errors } = await open({ ...(w === 'phone' ? PHONE : DESK), state: STATE })
const { ck, note, summary } = checker('R38 ' + w)
const TUE = 1, ISO = '2026-07-14'
const pic = s => `r38-${w}-${s}`

/** Every man's Tuesday box on the war. */
async function tueBoxes() {
  await lwOpen(page, ISO)
  return page.evaluate(d => {
    const o = {}
    for (const r of document.querySelectorAll('[data-testid^="row-"]')) {
      const id = r.getAttribute('data-testid').slice(4)
      const c = document.querySelector(`[data-testid="cell-${id}-${d}"]`)
      o[id] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() : '#'
    }
    return o
  }, ISO)
}
/** The day's warning strip on a surface, opened, as the scheduler reads it. */
async function strip(sel, di) {
  const s = page.locator(`${sel} [data-daywarn="${di}"]:visible`).first()
  if (!(await s.count())) return 'NO STRIP'
  const open = await page.locator(`${sel} [data-dwbox="${di}"].open`).count()
  if (!open) { await s.evaluate(e => e.scrollIntoView({ block: 'center' })); await s.click(); await page.waitForTimeout(400) }
  return page.evaluate(([q, i]) => [...document.querySelectorAll(`${q} [data-dwbox="${i}"] .witem`)].map(e => e.innerText.replace(/\s+/g, ' ').trim()), [sel, di])
}

const crew = await page.evaluate(() => { const s = new Set(); const d = window.DAYS[1]; d.waves.forEach(w => w.formations.forEach(f => f.aircraft.forEach(a => { if (a.p) s.add(a.p); if (a.w) s.add(a.w) }))); (d.dutywaves || []).forEach(b => b.rows.forEach(r => r.id && s.add(r.id))); return [...s] })
note('who works Tuesday (flying lines and desks)', crew)
const b0 = await tueBoxes()
await lwShot(page, pic('1-lw-before'), crew[0], ISO)
note('Tuesday boxes before (the crew)', Object.fromEntries(crew.map(id => [id, b0[id]])))

/* ---- declare the holiday on the war's event row ---- */
const ev = page.locator(`[data-testid="event-0-${ISO}"]`).first()
ck('the war draws an event row cell for 14 Jul', (await ev.count()) > 0, 'present', await ev.count())
await ev.scrollIntoViewIfNeeded(); await ev.click(); await page.waitForTimeout(600)
const txt = page.locator('[data-testid="event-text"]').first()
await txt.fill('PH'); await page.waitForTimeout(200)
const tags = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-tag"], .evkind, .evtag')].map(e => (e.innerText || '').trim() + (e.getAttribute('aria-pressed') === 'true' || e.classList.contains('on') ? '*' : '')))
note('event sheet tags', tags)
await shot(page, pic('2-event-sheet'))
await page.locator('[data-testid="event-apply"]').first().click(); await page.waitForTimeout(900)
await lwShot(page, pic('3-lw-ph-declared'), crew[0], ISO)
const phDay = await page.evaluate(d => { const h = document.querySelector(`[data-testid="head-${d}"]`); return h ? h.className + ' ' + h.innerText.replace(/\s+/g, ' ') : 'NO HEAD' }, ISO)
note('the war\'s 14 Jul head after the PH', phDay)

/* ---- nothing credited yet (AM47) ---- */
const b1 = await tueBoxes()
const early = crew.filter(id => b1[id] !== b0[id] && /FO|HO/.test(b1[id]))
ck('AM47: no credit lands before the day is republished', early.length === 0, 'no FO*/HO* on 14 Jul', early.map(id => id + ':' + b1[id]))

/* ---- the day says it must be republished ---- */
await editWeek(page)
const h1 = await head(page, TUE)
const p1 = await alPanel(page)
const s1 = await strip('#eWeek', TUE)
note('Tuesday on the edit week after the PH', { head: h1, panel: p1, warnings: s1 })
await frame(page, `#eWeek .day[data-day="${TUE}"]`)
await shot(page, pic('4-edit-after-ph'))
const says = ls => ls !== 'NO STRIP' && ls.some(l => /started earning OIL after it was published/i.test(l))
if (says(s1)) ck('AM47: the day says it started earning and must be published again', true, 'the advisory', s1)
else {
  /* THE LAG TEST: look again after a moment, then after a reload */
  await page.waitForTimeout(1500)
  const s1b = await strip('#eWeek', TUE)
  await page.reload(); await L.login(page); await editWeek(page)
  const s1c = await strip('#eWeek', TUE)
  await frame(page, `#eWeek .day[data-day="${TUE}"]`)
  await shot(page, pic('4b-edit-after-reload'))
  note('the warning list re-read', { after1500ms: s1b, afterReload: s1c })
  ck('AM47: the day says it started earning and must be published again (without a reload)', false,
    '"This day started earning OIL after it was published — publish it again so the OIL lands", as soon as the PH is declared',
    says(s1c) ? 'absent until the page is RELOADED, then shown — LAGGED UNTIL A RELOAD' : 'absent even after a reload')
}
ck('the day reads pending (what it earns changed)', /pending/.test(h1.pending || ''), 'N pending', h1.pending)
if (w === 'desktop') note('AM25 — the panel line for Tuesday', p1)
const v1 = await viewDay(page, TUE)
const vs1 = await strip('#vWeek', TUE)
note('the view page\'s issued Tuesday', { tag: v1.tag, warnings: vs1 })
await frame(page, `#vWeek .day[data-day="${TUE}"]`)
await shot(page, pic('5-view-after-ph'))

/* ---- sign + Publish AL1: the credits land ---- */
await editWeek(page)
note('sign', await signDay(page, TUE))
await clearToast(page)
const pub = await publishAL(page, TUE)
note('Publish AL1', { ...pub, toast: await toastNow(page) })
ck('Publish AL1 went out', pub.pressed === true, 'pressed', pub)
const b2 = await tueBoxes()
await lwShot(page, pic('6-lw-after-al1'), crew[0], ISO)
const landed = crew.filter(id => /FO|HO/.test(b2[id] || ''))
note('Tuesday boxes after AL1 (the crew)', Object.fromEntries(crew.map(id => [id, b2[id]])))
ck('AM46: the republished holiday credits the men who worked it', landed.length > 0, 'FO*/HO* for the crew', `${landed.length} of ${crew.length}`)
await editWeek(page)
const s2 = await strip('#eWeek', TUE)
ck('the republish advisory is gone after AL1', !s2.some?.(l => /started earning OIL after it was published/i.test(l)), 'gone', s2)

note('book', await book(page))
ck('no console errors', errors.length === 0, 'none', errors)
summary()
await browser.close()
