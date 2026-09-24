/* The HOST's re-walk of fixes F1–F5 (evidence sheet §3/§12), written as assertions of the RIGHT
   behaviour so a PASS means correct (bug-check order §5 "the re-walk"). Builds its own world
   through the app's own controls on a fresh (persisting) context.
   Usage: HP_URL=http://localhost:4176 node hr-01-fixes.mjs [desktop|phone] */
const W = process.argv[2] || 'desktop'
const SIZE = W === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 }
process.env.HP_SHOTS = `C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/rewalk/${W}`
const L = await import('./am-lib.mjs')
const { open, editWeek, board, closeBoard, signDay, publishDay, publishAL, unpublish, head, marks, editText, shot, go, planMenuItems, toastText } = L
const { browser, page, errors } = await open({ ...SIZE })
let pass = 0, fail = 0
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  [${W}] ${name}${ok ? '' : '  — got ' + JSON.stringify(got)}`) }
const infoCount = async (di) => {
  await page.locator(`#eWeek [data-dayinfo="${di}"]:visible`).first().click()
  await page.waitForTimeout(500)
  const t = await page.evaluate(() => (document.querySelector('#dayPop .dip-pend') || {}).textContent || '')
  await page.mouse.click(3, 300); await page.waitForTimeout(300)
  return t ? parseInt(t, 10) : 0
}
const count = (s) => (s ? parseInt(s, 10) : 0)

await editWeek(page)
// ---- F4 (+F2): the phantom mark after Unpublish; the ⓘ count agrees with the head -------------
await signDay(page, 0); await publishDay(page, 0)
const keys = await page.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] [data-txt]')].map(e => e.dataset.txt))
const tKey = keys.find(k => /^ff:0\.\d+\.\d+\.to$/.test(k))
const was = await page.evaluate(k => document.querySelector(`#eWeek [data-txt="${k}"]`).innerText.trim(), tKey)
await editText(page, tKey, '13:10'); await editText(page, 'dn:0.0', 'AL1 NOTE')
await signDay(page, 0); await publishAL(page, 0)
check('F4 setup: AL1 issued', (await head(page, 0)).tag === 'AL1', await head(page, 0))
await editText(page, tKey, was)                       // put the time back to the Original's value
await unpublish(page, 0)
const h4 = await head(page, 0)
const m4 = await marks(page, '#eWeek .day[data-day="0"]')
check('F4 tag back to ORIG', h4.tag === 'ORIG', h4.tag)
check('F4 the time cell carries NO dotted mark (it equals the Original)', !m4.pending.some(x => x.text === was), m4.pending)
check('F4 the note is still dotted (it differs)', m4.pending.some(x => /AL1 NOTE/.test(x.text)), m4.pending)
check('F4 head reads 1 pending', count(h4.pending) === 1, h4.pending)
check('F2 the ⓘ panel agrees with the head', (await infoCount(0)) === count(h4.pending), await infoCount(0))
await shot(page, 'hr-f4-after-unpublish', page.locator('#eWeek .day[data-day="0"]'))

// ---- F1: "Not yet signed" on the board as on the week ----------------------------------------
const wk = await head(page, 0)
check('F1 the week head shows "Not yet signed"', wk.nys === true, wk)
await board(page, 0)
const bh = await head(page, 0)
check('F1 the board shows "Not yet signed" too', bh.nys === true, bh)
await shot(page, 'hr-f1-board')
await closeBoard(page)

// ---- F3: Discard marks only when it can clear (desktop only — the panel is hidden on a phone) --
if (W === 'desktop') {
  await editWeek(page)
  const b = page.locator('#alDrop')
  check('F3 Discard is disabled with only published-day changes', await b.isDisabled(), await b.isDisabled())
  await editText(page, 'dn:2.0', 'WED DRAFT WORK')
  check('F3 Discard is enabled once a draft day has a mark', !(await b.isDisabled()), await b.isDisabled())
  await b.click(); await page.waitForTimeout(500)
  const t3 = await toastText(page)
  const h0 = await head(page, 0)
  check('F3 the published day keeps its change', count(h0.pending) === 1, h0.pending)
  check('F3 the toast says what it cleared', /Cleared 1 draft mark/.test(t3), t3)
  await shot(page, 'hr-f3-discard')
}

// ---- F5: an armed Load clears on a page change --------------------------------------------------
await editWeek(page)
await planMenuItems(page, 0)
/* the issued rows carry data-planpv; the live row's caption ALSO names the Original ("differences
   from Original go out as AL1"), so a text match alone taps the wrong row */
await page.locator('.wm[data-planpv]:visible').filter({ hasText: /^Original/ }).first().click(); await page.waitForTimeout(600)
const load = page.locator('#eWeek [data-restore="0"]:visible').first()
await load.click(); await page.waitForTimeout(500)
const armed = await load.innerText().catch(() => '')
check('F5 setup: Load arms its confirm (edits would be discarded)', /confirm/i.test(armed), armed)
await go(page, 'viewsched'); await go(page, 'editsched')
const after = await page.locator('#eWeek [data-restore="0"]:visible').first().innerText().catch(() => 'NO BUTTON')
check('F5 after a page change the Load button asks again', !/confirm/i.test(after), after)
await shot(page, 'hr-f5-after-nav', page.locator('#eWeek .day[data-day="0"]'))

check('no console errors', errors.length === 0, errors)
console.log(`${W}: ${pass} PASS, ${fail} FAIL`)
await browser.close()
