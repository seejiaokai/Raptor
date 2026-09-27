/* The absence-record re-test — HOST H3 (26 Sep 26): a save that fails ([S4-HUNT-REST] 5; old plan H1–H2; Fable S33,
   M9; Astra 15). The browser's storage is made to refuse writes, the way a full store would — an ENVIRONMENT fault,
   injected by patching Storage.setItem in the page (the app's own state is still made through its own controls). The
   change is one multi-part command: the admin files leave for Ranger on the Inputs page over Ranger's own pending
   bid, which removes the bid's clashing part and leaves Ranger a notice (B6) — three records, one group.
   The promise (src/storage/postman.ts, browser.ts): the header says "Not saved — Retry" while a group has failed; a
   retry lands the WHOLE group; a group whose journal was written but whose records were cut off half-way is finished
   at the next boot; never half a group, never a double.
   Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/ab-h3-storage-faults.mjs */
process.env.AB_WHO = 'host/h3'
const L = await import('./ab-lib.mjs')
const { openHi, login } = await import('../am/w2-lib.mjs')
const { lwOpen, bidOn, fileInput, inputsOf, lwCell, tapCell, closeSheets, shot, resultBook, ROOT, toastSpy, toasts } = L
const R = resultBook('H3', `${ROOT}/docs/handpass/parts/2026-09-26-absence-h3.txt`)
const P = 'bane'   // Ranger
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)) } }
const saveStat = page => page.evaluate(() => { const s = document.querySelector('.savestat'); return s ? s.innerText.replace(/\s+/g, ' ').trim() : 'saved (no indicator)' })
async function waitSaved(page, ms = 20000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (!(await page.locator('.savestat').count())) return true; await page.waitForTimeout(250) } return false }
/* 'all' — every write refused; 'records' — the journal is written, then the first record lands and the rest are refused */
async function fault(page, mode) {
  await page.evaluate(m => {
    if (!window.__origSet) window.__origSet = Storage.prototype.setItem
    window.__fault = m; window.__recs = 0
    Storage.prototype.setItem = function (k, v) {
      const f = window.__fault
      if (f === 'all' && String(k).startsWith('raptor:')) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      if (f === 'records' && String(k).startsWith('raptor:') && k !== 'raptor:__txn') { if (window.__recs++ >= 1) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError') }
      return window.__origSet.call(this, k, v)
    }
  }, mode)
}
async function reopen(page) {
  await page.reload()
  await page.waitForTimeout(800)
  if (await page.locator('#luser:visible').count()) await login(page, 'a')
  await page.waitForTimeout(600)
}
/* what the war and the Inputs say about Ranger on a date: his box and mark, whether his LL input is there, the bid/notice lines */
async function read(page, iso) {
  await lwOpen(page, iso)
  const cell = await lwCell(page, P, iso)
  const t = await tapCell(page, P, iso)
  await closeSheets(page)
  const day = `Jul ${+iso.slice(8)}`
  const inp = (await inputsOf(page, P)).filter(x => x.type === 'LL' && (x.date === day))
  return { box: cell.box, mark: cell.mark, sheet: t.open, lines: t.lines, text: (t.text || '').slice(0, 220), inputs: inp.length }
}
async function world(iso) {
  const w = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
  await toastSpy(w.page)
  await lwOpen(w.page, iso)
  const b = await bidOn(w.page, P, iso, 'LL')
  await waitSaved(w.page)
  return { ...w, bid: b }
}

/* FS1 — every write refused, then the store recovers: the retry lands the whole group */
await step('FS1', async () => {
  const iso = '2026-07-22'
  const { browser, page, bid } = await world(iso)
  const before = await read(page, iso)
  await fault(page, 'all')
  const f = await fileInput(page, { person: P, type: 'LL', from: iso, remarks: 'H3 FS1' })
  await page.waitForTimeout(800)
  const stat = await saveStat(page)
  await shot(page, 'h3-FS1-not-saved')
  R.ck('FS1-says-not-saved', /Not saved/i.test(stat), 'the header says "Not saved — Retry" while the store refuses', { stat, bid: bid.placed, before, filed: f.added })
  await fault(page, 'none')
  const ok = await waitSaved(page, 40000)
  R.ck('FS1-retry-lands', ok, 'once the store takes writes again the retry lands on its own (the indicator goes)', await saveStat(page))
  await reopen(page)
  const after = await read(page, iso)
  R.ck('FS1-whole-group-after-reload', after.inputs === 1 && /LL/.test(after.box) && !after.lines.some(l => /bid, not decided/i.test(l)),
    'after a reload: the leave is there, the bid gone, the notice there (the whole group)', after)
  await shot(page, 'h3-FS1-after-reload')
  await browser.close()
})

/* FS2 — every write refused, and the page is closed while it still refuses: none of the group, never half */
await step('FS2', async () => {
  const iso = '2026-07-23'
  const { browser, page } = await world(iso)
  await fault(page, 'all')
  await fileInput(page, { person: P, type: 'LL', from: iso, remarks: 'H3 FS2' })
  await page.waitForTimeout(800)
  R.note('FS2-stat', await saveStat(page))
  await reopen(page)   // the patch dies with the page; nothing of the group was ever written
  const after = await read(page, iso)
  const whole = after.inputs === 1 && !after.lines.some(l => /bid, not decided/i.test(l))
  const none = after.inputs === 0 && (after.lines.some(l => /bid, not decided/i.test(l)) || /LL/.test(after.box))
  R.ck('FS2-all-or-nothing', whole || none, 'after closing on a failed save: either the whole change or none of it — never the leave without the bid removal, never the removal without the leave', after)
  await shot(page, 'h3-FS2-after-reload')
  await browser.close()
})

/* FS3 — the journal is written, then the records are cut off half-way: the next boot finishes the group */
await step('FS3', async () => {
  const iso = '2026-07-24'
  const { browser, page } = await world(iso)
  await fault(page, 'records')
  await fileInput(page, { person: P, type: 'LL', from: iso, remarks: 'H3 FS3' })
  await page.waitForTimeout(800)
  R.note('FS3-stat', await saveStat(page))
  const journal = await page.evaluate(() => localStorage.getItem('raptor:__txn') ? 'journal left' : 'no journal')
  R.note('FS3-journal', journal)
  await reopen(page)
  const after = await read(page, iso)
  R.ck('FS3-boot-finishes', after.inputs === 1 && !after.lines.some(l => /bid, not decided/i.test(l)), 'the next boot finishes the half-written group: the leave there, the bid gone', after)
  await reopen(page)
  const again = await read(page, iso)
  R.ck('FS3-no-double', again.inputs === 1, 'opening again doubles nothing', again)
  await shot(page, 'h3-FS3-after-second-reload')
  await browser.close()
})
R.save()
