// W1 — S07 (the unsaved-work question by every way out; Inputs page window, desktop + phone) and S08 (question up, then another window in front). v1
import * as L from './ibc-w1-lib.mjs'
const { sleep, tid, press, shot, mark, unmark, row, act, wins, rect, hitOf } = L
console.log('ibc-w1-s07 v1')
L.startRun('keep')
const browser = await L.launch()

const listOpen = async (w) => {
  await L.inputsCal(w, 2026, 7)
  await w.page.evaluate(() => window.scrollTo(0, 0))
  await press(w, '#inListBtn'); await sleep(500)
  await press(w, '#inRangeBtn'); await sleep(300); await press(w, '#inRangeAll'); await sleep(500)
}
/* the n-th list row's open button that is on screen and not covered (so a press behind a window can be aimed at one) */
const openables = page => page.evaluate(() => [...document.querySelectorAll('[data-testid="in-open"], [data-testid="inl-open"]')].map((b, i) => { const r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return null; const x = r.left + r.width / 2, y = r.top + r.height / 2; if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return null; const h = document.elementFromPoint(x, y); return { i, own: !!h && (h === b || b.contains(h)), at: [Math.round(x), Math.round(y)] } }).filter(Boolean))
const openRow = async (w, nth) => {
  const b = w.page.locator('[data-testid="in-open"], [data-testid="inl-open"]').nth(nth)
  await b.scrollIntoViewIfNeeded()
  await press(w, b); await tid(w.page, 'win-inputedit').waitFor(); await sleep(500)
}
const type = async (w, text) => { const r = w.page.locator('#inpEdit #inpEditRmk, #inpEditRmk').first(); await r.scrollIntoViewIfNeeded(); await r.fill(text); await sleep(200) }
const snap = async w => ({ wins: await wins(w.page), active: await act(w.page), escask: await tid(w.page, 'inped-escask').count(), swapask: await tid(w.page, 'inped-swap').count(), askWords: await w.page.evaluate(() => [...document.querySelectorAll('.inped-ask')].map(e => (e.textContent || '').replace(/\s+/g, ' ').trim())) })
const remarksOf = page => page.evaluate(() => window.INPUTS.map(r => String(r.remarks || '')).filter(x => /walker/.test(x)).length)
const clean = async w => { for (let i = 0; i < 3; i++) { if (await tid(w.page, 'inped-escask-go').count()) await tid(w.page, 'inped-escask-go').click({ force: true }); if (await tid(w.page, 'inped-swap-go').count()) await tid(w.page, 'inped-swap-go').click({ force: true }); await L.closeWins(w); await sleep(200) } }

async function s07(size) {
  const w = await L.session(browser, size)
  const p = w.page, T = `S07-${size}`
  try {
    await listOpen(w)
    const nrows = await p.locator('[data-testid="in-open"], [data-testid="inl-open"]').count()
    row(`S07-0-${size}`, `${size}: Inputs -> List`, 'rows listed', { rows: nrows }, nrows > 2 ? 'PASS' : 'NOT WALKED premise — too few rows')
    if (nrows < 3) { await w.ctx.close(); return }
    /* a. Escape */
    await openRow(w, 0); await type(w, 'walker typing'); const k0 = await snap(w)
    await shot(p, `${T}-a0-typed`)
    await p.keyboard.press('Escape'); await sleep(400)
    const a = await snap(w)
    row(`S07a-${size}`, `${size}: open an input from the List, type in Remarks, Escape (keys were ${JSON.stringify(k0.active)})`, 'the question "This input has unsaved changes. Close it and lose them?" (F2)', a, a.escask === 1 && /Close it and lose them/.test(a.askWords.join(' ')) ? 'PASS' : 'FAIL', `${T}-a1-escape.png`)
    await shot(p, `${T}-a1-escape`)
    await p.keyboard.press('Escape'); await sleep(400)
    const a2 = await snap(w)
    row(`S07a2-${size}`, `${size}: Escape again on the question`, 'Keep editing: question gone, window open, typing kept', { ...a2, remarksField: await p.locator('#inpEditRmk').inputValue().catch(() => null) }, a2.escask === 0 && a2.wins.includes('win-inputedit') ? 'PASS' : 'FAIL')
    /* Keep editing button / Discard and close */
    await p.keyboard.press('Escape'); await sleep(300)
    await press(w, tid(p, 'inped-escask-stay')); await sleep(300)
    const a3 = await snap(w)
    row(`S07a3-${size}`, `${size}: Escape, then press "Keep editing"`, 'question gone, window open, typing kept', { ...a3, remarksField: await p.locator('#inpEditRmk').inputValue().catch(() => null) }, a3.escask === 0 && a3.wins.includes('win-inputedit') ? 'PASS' : 'FAIL')
    await p.keyboard.press('Escape'); await sleep(300)
    await press(w, tid(p, 'inped-escask-go')); await sleep(400)
    const a4 = await snap(w)
    row(`S07a4-${size}`, `${size}: Escape, then "Discard and close"`, 'window closes, nothing saved', { ...a4, savedWithWalker: await remarksOf(p) }, !a4.wins.includes('win-inputedit') && (await remarksOf(p)) === 0 ? 'PASS' : 'FAIL')
    await clean(w)
    /* b. the window's cross */
    await openRow(w, 0); await type(w, 'walker typing')
    await press(w, tid(p, 'win-inputedit-x')); await sleep(400)
    const b = await snap(w)
    row(`S07b-${size}`, `${size}: type, press the window's cross`, 'RECORD (does it ask?)', { ...b, savedWithWalker: await remarksOf(p) }, 'RECORDED', `${T}-b-cross.png`)
    await shot(p, `${T}-b-cross`)
    await clean(w)
    /* c. Cancel */
    await openRow(w, 0); await type(w, 'walker typing')
    await press(w, '#inpEditCancel'); await sleep(400)
    const c = await snap(w)
    row(`S07c-${size}`, `${size}: type, press Cancel`, 'RECORD (does it ask?)', { ...c, savedWithWalker: await remarksOf(p) }, 'RECORDED', `${T}-c-cancel.png`)
    await shot(p, `${T}-c-cancel`)
    await clean(w)
    /* d. tap a different input behind (the swap question) */
    await openRow(w, 0); await type(w, 'walker typing')
    const cand = (await openables(p)).filter(x => x.i !== 0 && x.own)
    if (!cand.length) row(`S07d-${size}`, `${size}: press another input on the page behind`, 'the swap question', { openables: await openables(p), window: await rect(p, '[data-testid="win-inputedit"]') }, 'NOT WALKED premise — no other row is uncovered behind the window')
    else {
      await p.locator('[data-testid="in-open"], [data-testid="inl-open"]').nth(cand[0].i).click({ force: false }).catch(async () => { await p.mouse.click(cand[0].at[0], cand[0].at[1]) })
      await sleep(500)
      const d = await snap(w)
      row(`S07d-${size}`, `${size}: typed; press the open button of another row behind the window`, 'the swap question "This input has unsaved changes. Open …\'s input and lose them?"', d, d.swapask === 1 ? 'PASS' : 'FAIL', `${T}-d-swap.png`)
      await shot(p, `${T}-d-swap`)
      /* Escape on the swap question */
      await p.keyboard.press('Escape'); await sleep(400)
      const d2 = await snap(w)
      row(`S07d2-${size}`, `${size}: Escape on the swap question`, 'RECORD (Keep editing?)', d2, 'RECORDED')
    }
    await clean(w)
    /* e. page tab */
    await openRow(w, 0); await type(w, 'walker typing')
    if (!w.touch) await p.locator('#topnav >> text=Edit Schedule').first().click(); else await L.go(p, 'editsched')
    await sleep(700)
    const e = await snap(w)
    row(`S07e-${size}`, `${size}: typed; press the Edit Schedule tab`, 'RECORD (it becomes the schedule pop-up with the typing)', { ...e, page: await p.evaluate(() => window.CURPAGE), rmkNow: await p.locator('#inpEditRmk').inputValue().catch(() => null) }, 'RECORDED', `${T}-e-page-tab.png`)
    await shot(p, `${T}-e-page-tab`)
    await clean(w)
    /* f. sign out */
    await listOpen(w)
    await openRow(w, 0); await type(w, 'walker typing')
    await p.evaluate(() => document.getElementById('logout').click()); await sleep(800)
    const f = { loginShown: await p.locator('#luser').isVisible().catch(() => false), wins: await wins(p), saved: null }
    row(`S07f-${size}`, `${size}: typed; sign out`, 'RECORD', f, 'RECORDED', `${T}-f-signout.png`)
    await shot(p, `${T}-f-signout`)
  } catch (e) { L.say(`ERROR s07 ${size}: ${e.stack}`); await shot(p, `s07-${size}-error`).catch(() => {}) }
  await w.ctx.close()
}

/* S08 — the question up, then another window in front */
async function s08() {
  const w = await L.session(browser, 'desktop')
  const p = w.page, T = 'S08-desktop'
  try {
    await listOpen(w)
    await press(w, '#inCalBtn'); await sleep(400)
    await L.openIcDay(w, '2026-07-15')
    const open = p.locator('[data-testid="idy-open"]').first()
    await press(w, open); await tid(p, 'win-inputedit').waitFor(); await sleep(400)
    await type(w, 'walker typing')
    await p.keyboard.press('Escape'); await sleep(400)
    const q = await snap(w)
    row('S08-1', 'day -> input window, typed, Escape', 'the question is up', q, q.escask === 1 ? 'PASS' : 'NOT WALKED premise — no question')
    /* ⚙ settings in front, pressed with the mouse (the gear may be behind the day window: scroll nothing, press it) */
    const g = await hitOf(p, '#inGear')
    await p.locator('#inGear').click({ force: true }); await sleep(500)
    const s1 = await snap(w)
    row('S08-2', 'press the month gear with the question up', 'Inputs settings opens in front', { ...s1, gearHit: g }, s1.wins.includes('win-inputsset') ? 'PASS' : 'NOT WALKED premise — settings did not open')
    await shot(p, `${T}-1-settings-in-front-of-question`)
    if (s1.wins.includes('win-inputsset')) {
      await p.keyboard.press('Escape'); await sleep(400)
      const s2 = await snap(w)
      row('S08-3', 'Escape (keys: ' + JSON.stringify(s1.active) + ')', 'settings closes; the question stays', s2, (!s2.wins.includes('win-inputsset') && s2.escask === 1) ? 'PASS' : 'FAIL', `${T}-2-after-escape.png`)
      await shot(p, `${T}-2-after-escape`)
    }
    await clean(w)
    /* the keyboard in the List's search box behind + Escape with the question up */
    await press(w, '#inListBtn'); await sleep(400)
    await openRow(w, 0); await type(w, 'walker typing')
    await p.keyboard.press('Escape'); await sleep(400)
    const q2 = await snap(w)
    const search = p.locator('input[type=search], input[placeholder*="Search"], .inputs-search input').first()
    if (await search.count() && q2.escask === 1) {
      await search.focus(); await search.fill('zz'); await sleep(200)
      const k = await snap(w)
      await p.keyboard.press('Escape'); await sleep(400)
      const s3 = await snap(w)
      row('S08-4', 'question up; keys in the List search box (typed zz); Escape', 'RECORD (delete question answers wherever the keys are; this one yields to a text box?)', { before: k, after: s3, searchValue: await search.inputValue() }, 'RECORDED', `${T}-3-search-box-escape.png`)
      await shot(p, `${T}-3-search-box-escape`)
    } else row('S08-4', 'keys in the List search box with the question up', 'RECORD', { q2, searchFound: await search.count() }, 'NOT WALKED premise')
  } catch (e) { L.say(`ERROR s08: ${e.stack}`); await shot(p, 's08-error').catch(() => {}) }
  await w.ctx.close()
}
await s07('desktop')
await s07('phone')
await s08()
await browser.close()
L.finishRun('s07')
