/* xo — W3: O1 (a two-day Duty's OIL question), O2 (a saved Duty's changed end time), then in a second world O3 (the List's "OIL?" chip)
   and O4 (a weekday made a public holiday: the day's one list).   node xo.mjs desk|phone */
import { L, inputsCal, openAdd, fillForm, headOf, judgeHead, rowOut, part } from './lib.mjs'
const size = process.argv[2] || 'desk'
console.log('xo.mjs - W3 O1 O2 O3 O4 - ' + size)
const S = `[${size}]`
const sheetFacts = (p, accent) => p.evaluate(accent => {
  const s = document.querySelector('[data-testid="oilconf"]')
  const ans = [...s.querySelectorAll('.upconf-seg')], row = ans[0] && ans[0].parentElement, rs = row ? getComputedStyle(row) : null
  const h = s.querySelector('.upconf-h'), picked = ans.find(a => a.getAttribute('aria-pressed') === 'true'), ps = picked ? getComputedStyle(picked) : null
  const main = s.querySelector('[data-testid="oilconf-save"]'), ms = getComputedStyle(main)
  return { heading: h ? h.textContent.replace(/\s+/g, ' ').trim() : null, answers: ans.map(a => a.textContent.trim()), rowClass: row ? row.className : null, rowBg: rs ? rs.backgroundColor : null, rowBorder: rs ? rs.borderBottomWidth : null, wornSeg: !!s.querySelector('.seg'), boxed: !!s.querySelector('.upconf-left'),
    buttons: [s.querySelector('[data-testid="oilconf-cancel"]').textContent.trim(), main.textContent.trim()],
    picked: picked ? { text: picked.textContent.trim(), bg: ps.backgroundColor, edge: ps.borderTopColor, ink: ps.color } : null, mainBg: ms.backgroundColor, accent,
    text: s.innerText.replace(/\s+/g, ' ').slice(0, 400) }
}, accent)
const ACC = p => p.evaluate(() => { const i = document.createElement('i'); i.style.color = 'var(--accent)'; document.body.append(i); const c = getComputedStyle(i).color; i.remove(); return c })
const hideToast = (p, on) => p.evaluate(on => { const t = document.querySelector('#toastEl'); if (t) t.style.display = on ? 'none' : '' }, on)
const clear = async p => { await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(300) }
const same = (a, b) => a === b

/* ============ world 1: O1, O2 ============ */
{
  const w = await L.world(size); const p = w.page
  try {
    const ACCENT = await ACC(p)
    await inputsCal(w, '2026-07-18')
    await part(w, `O1 two-day Duty question ${S}`, 'question', 'heading, three flat answers, picked look, calendar, Back/Add', async () => {
      await openAdd(w, '2026-07-18')
      await fillForm(w, { type: 'Duty', person: 'bane', start: '09:00', end: '17:00' })
      await p.locator('#inpEdCal [data-cal="2026-07-19"]').click()
      console.log('   form dates:', await p.locator('#inpEditPop .rc-read').innerText())
      await w.press('#inpEditSave')
      await p.waitForSelector('[data-testid="oilconf"]', { timeout: 8000 }); await L.sleep(500); await clear(p)
      let f = await sheetFacts(p, ACCENT)
      console.log('   sheet:', f.text)
      rowOut(`O1 two-day Duty question ${S}`, 'the heading', 'This input covers 2 non-working days (weekend / PH)', f.heading, f.heading === 'This input covers 2 non-working days (weekend / PH)')
      rowOut(`O1 two-day Duty question ${S}`, 'the three answers', 'All days · Only some days… · No OIL', f.answers.join(' · '), f.answers.join('|') === 'All days|Only some days…|No OIL')
      rowOut(`O1 two-day Duty question ${S}`, 'flat under the sentence', 'no darker patch or line behind them (no .seg, no box, transparent ground, no bottom line)', JSON.stringify({ rowClass: f.rowClass, rowBg: f.rowBg, rowBorder: f.rowBorder, wornSeg: f.wornSeg, boxed: f.boxed }), /rgba\(0, 0, 0, 0\)|transparent/.test(f.rowBg) && f.rowBorder === '0px' && !f.wornSeg && !f.boxed)
      rowOut(`O1 two-day Duty question ${S}`, 'the foot buttons', 'Back and Add', f.buttons.join(' / '), f.buttons.join('/') === 'Back/Add')
      await hideToast(p, true); await L.pic(w, `o01-${size}-two-day-duty-question`)
      await w.press('[data-testid="oil-all"]'); await L.sleep(250)
      f = await sheetFacts(p, ACCENT)
      rowOut(`O1 two-day Duty question ${S}`, 'the picked answer', 'a cyan edge and cyan words on a dark ground (not a solid cyan fill)', JSON.stringify(f.picked) + ' accent ' + ACCENT, !!f.picked && f.picked.edge === ACCENT && f.picked.ink === ACCENT && f.picked.bg !== ACCENT)
      await L.pic(w, `o01-${size}-all-days-picked`)
      await w.press('[data-testid="oil-some"]'); await L.sleep(400)
      const cal = await p.evaluate(() => { const s = document.querySelector('[data-testid="oilconf"]'); const c = s.querySelector('.rangecal, [class*="cal"], [data-testid*="cal"], [data-testid*="oil-day"]'); const r = c ? c.getBoundingClientRect() : null; return c ? { cls: String(c.className), id: c.getAttribute('data-testid'), w: Math.round(r.width), h: Math.round(r.height), inside: Math.round(s.querySelector('.airpop-box').getBoundingClientRect().width) } : null })
      rowOut(`O1 two-day Duty question ${S}`, '"Only some days…" opens a small calendar', 'a small calendar in the question', JSON.stringify(cal), !!cal && cal.w < cal.inside)
      await L.pic(w, `o01-${size}-only-some-days-calendar`)
      await hideToast(p, false)
      await w.press('[data-testid="oil-all"]'); await L.sleep(200)
      await w.press('[data-testid="oilconf-save"]')
      await p.waitForSelector('#inpEditPop', { state: 'hidden', timeout: 8000 }); await L.sleep(400)
      await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
    })
    /* O2 — a saved weekend Duty: change its end time, save */
    await part(w, `O2 saved Duty, end time changed ${S}`, 'question', 'Back and Save', async () => {
      /* a one-day weekend Duty, 09:00-12:00, answered Yes; then its end time is changed to 18:00 (a half day becomes a full day) */
      await openAdd(w, '2026-07-25')
      await fillForm(w, { type: 'Duty', person: 'bane', start: '09:00', end: '12:00' })
      await w.press('#inpEditSave'); await p.waitForSelector('[data-testid="oilconf"]'); await L.sleep(300)
      await w.press('[data-testid="oil-yes"]'); await w.press('[data-testid="oilconf-save"]')
      await p.waitForSelector('#inpEditPop', { state: 'hidden', timeout: 8000 }); await L.sleep(400)
      await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
      await p.locator('[data-icday="2026-07-25"]').focus(); await p.keyboard.press('Enter')
      await p.waitForSelector('[data-testid="win-inputsday"]')
      await w.press(p.locator('[data-testid^="idy-row"]').filter({ hasText: 'Ranger' }).locator('[data-testid^="idy-open"]').first()); await p.waitForSelector('[data-testid="win-inputedit"]'); await L.sleep(500)
      await p.fill('#inpEditPop #inpEditEnd', '18:00'); await L.sleep(200)
      console.log('   end box now:', await p.inputValue('#inpEditPop #inpEditEnd'))
      await w.press('#inpEditSave'); await L.sleep(800)
      console.log('   after Save: toast', await p.evaluate(() => document.querySelector('#toastEl')?.textContent), '· sheets', await p.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"],[data-testid="upconf"],[data-testid="medclash"],[data-testid="docconf"]')].map(e => e.getAttribute('data-testid')).join(',') || 'none'), '· form open', await p.locator('#inpEditPop').count())
      await L.pic(w, `o02-${size}-after-save-probe`)
      await p.waitForSelector('[data-testid="oilconf"]', { timeout: 8000 }); await L.sleep(500); await clear(p)
      const f = await sheetFacts(p, ACCENT)
      console.log('   O2 sheet:', f.text)
      rowOut(`O2 saved Duty, end time changed ${S}`, 'the foot buttons', 'Back and Save', f.buttons.join(' / ') + ' · heading: ' + f.heading, f.buttons.join('/') === 'Back/Save')
      await hideToast(p, true); await L.pic(w, `o02-${size}-saved-duty-question`); await hideToast(p, false)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(300)
    })
  } finally { await L.close(w) }
}

/* ============ world 2: O3, O4 ============ */
{
  const w = await L.world(size); const p = w.page
  try {
    const ACCENT = await ACC(p)
    const DAYS = ['2026-07-21', '2026-07-22']                 // two weekdays, two inputs each
    await inputsCal(w, DAYS[0])
    await part(w, `fixture ${S}`, 'two weekdays with two inputs each', 'four saved inputs', async () => {
      for (const d of DAYS) for (const [type, title] of [['Training', 'Range brief'], ['Meeting', 'Staff brief']]) {
        await openAdd(w, d)
        await fillForm(w, { type, person: 'bane', start: '09:00', end: '10:00', title })
        await w.press('#inpEditSave')
        await L.sleep(600)
        await p.waitForSelector('#inpEditPop', { state: 'hidden', timeout: 8000 })
        await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300)
      }
      console.log('   inputs on the 21st / 22nd:', await p.evaluate(d => d.map(x => document.querySelectorAll(`[data-icday="${x}"] .ib-bar`).length), DAYS))
    })
    const declare = async iso => {
      await p.locator('[data-testid="win-days-x"]').click().catch(() => {}); await L.sleep(300)
      await w.press('#inGear'); await w.press('[data-testid="iset-days"]')
      await p.waitForSelector('[data-testid="win-days"]')
      const x = p.locator('[data-testid="win-inputsset-x"]'); if (await x.count()) await x.evaluate(e => e.click())
      await L.sleep(300)
      if (await p.locator('[data-testid="days-tabs"]').count()) await w.press('[data-testid="days-tab-holidays"]')
      await w.press('[data-testid="hol-add"]'); await L.sleep(300)
      await p.locator('[data-testid="hol-name"]').fill('Range Day'); await p.locator('[data-testid="hol-short"]').fill('RD')
      for (let i = 0; i < 24; i++) {
        const [name, year] = (await p.locator('[data-testid="holcal-month"]').innerText()).trim().toLowerCase().split(/\s+/)
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        const dd = (+iso.slice(0, 4)) * 12 + (+iso.slice(5, 7) - 1) - (+year * 12 + months.findIndex(m => name.startsWith(m)))
        if (!dd) break
        await w.press(`[data-testid="${dd > 0 ? 'holcal-next-month' : 'holcal-prev-month'}"]`); await L.sleep(120)
      }
      await w.press(`[data-testid="holcal-day-${iso}"]`)
      await w.press('[data-testid="hol-save"]'); await L.sleep(800)
      await p.locator('[data-testid="win-days-x"]').click().catch(() => {}); await L.sleep(500)
    }
    /* first holiday: the list opens; leave it unanswered (✕) so the inputs stay unanswered for O3 */
    await part(w, `O3 the List's OIL? chip ${S}`, 'question', 'Back and Save', async () => {
      await declare(DAYS[0])
      console.log('   after holiday on the 21st — the day list is open:', await p.locator('[data-testid="odl"], [data-testid^="odl-"]').count())
      await w.press('[data-testid="odl-later"]'); await L.sleep(500)
      await p.locator('[data-testid="win-days-x"]').click().catch(() => {}); await L.sleep(400)
      await L.go(w, 'inputs')
      if (w.phone) { /* the List on a phone: the switch between Calendar and List */ }
      if (await p.locator('#inListBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inListBtn')
      await p.waitForSelector('[data-oilask]', { timeout: 8000 })
      const chip = p.locator('[data-oilask]:visible').first()
      console.log('   visible chips:', await p.locator('[data-oilask]:visible').count())
      console.log('   OIL? chips:', await p.locator('[data-oilask]').count(), '· chip text:', (await chip.innerText()).trim())
      await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
      console.log('   chip probe:', JSON.stringify(await chip.evaluate(e => { const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { box: [r.x, r.y, r.width, r.height].map(Math.round), top: t ? t.tagName + '.' + String(t.className).slice(0, 40) + ' ' + (t.closest('[data-testid]') || {}).getAttribute?.('data-testid') : null, odl: document.querySelectorAll('[data-testid="odl-later"]').length } })))
      await L.pic(w, `o03-${size}-probe`)
      await w.press(chip)
      await p.waitForSelector('[data-testid="oilconf"]', { timeout: 8000 }); await L.sleep(500); await clear(p)
      const f = await sheetFacts(p, ACCENT)
      console.log('   O3 sheet:', f.text)
      rowOut(`O3 the List's OIL? chip ${S}`, 'the question opens; its foot buttons', 'Back and Save', f.buttons.join(' / ') + ' · heading: ' + (f.heading || '(none)'), f.buttons.join('/') === 'Back/Save')
      await hideToast(p, true); await L.pic(w, `o03-${size}-list-chip-question`); await hideToast(p, false)
      await w.press('[data-testid="oilconf-cancel"]'); await L.sleep(300)
    })
    /* second holiday: its one list; pick Yes on one, No on the other */
    await part(w, `O4 the day's one list ${S}`, 'two picked buttons', 'the same outline look on both', async () => {
      await L.go(w, 'inputs')
      if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
      await declare(DAYS[1])
      await p.waitForSelector('[data-testid^="odl-"]', { timeout: 8000 }); await L.sleep(500); await clear(p)
      const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="odl-"]')].map(e => e.getAttribute('data-testid')))
      console.log('   list test ids:', ids.join(' '))
      const yes = p.locator('[data-testid^="odl-yes-"]'), no = p.locator('[data-testid^="odl-no-"]')
      console.log('   yes buttons:', await yes.count(), ' no buttons:', await no.count())
      await w.press(yes.nth(0)); await w.press(no.nth(1)); await L.sleep(300)
      const looks = await p.evaluate(accent => [...document.querySelectorAll('[data-testid^="odl-yes-"], [data-testid^="odl-no-"]')].map(b => { const s = getComputedStyle(b); return { id: b.getAttribute('data-testid'), pressed: b.getAttribute('aria-pressed'), cls: b.className, bg: s.backgroundColor, edge: s.borderTopColor, ink: s.color } }), ACCENT)
      console.log('   looks:', JSON.stringify(looks))
      const pk = looks.filter(l => l.pressed === 'true')
      rowOut(`O4 the day's one list ${S}`, 'the two picked buttons', 'both picked buttons wear the SAME look: a cyan edge and cyan words on a dark ground; neither solid cyan, neither grey-filled', JSON.stringify(pk) + ' accent ' + ACCENT, pk.length === 2 && pk.every(l => l.edge === ACCENT && l.ink === ACCENT && l.bg !== ACCENT) && pk[0].bg === pk[1].bg)
      await hideToast(p, true); await L.pic(w, `o04-${size}-day-list-two-picked`); await hideToast(p, false)
    })
  } finally { await L.close(w) }
}
