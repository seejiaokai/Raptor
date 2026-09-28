/* C — [ALLAVAIL-OPEN-ROW], D360 (owner, 28 Sep 26: "need to say something like no oil worked out due end time to the
   admin"). On the everything-week's published Saturday the Common Programme's FAMILY DAY carries an ALL AVAIL puck. Its
   END time is cleared the way a scheduler clears it (the week's own box), then:
   C1 the count chip still shows, and its tap opens the window titled with the assumed hour, listing as many men as the
      chip counted; C2 in OIL Earn mode the window's OIL half and the row's switch say "No OIL worked out — this row has
      no end time"; C3 the phone: the chip and the bottom panel's title; C4 its START cleared too: the chip is a "?" of
      its own ("No start time — …") and its tap opens the window on the reason.
   Written as the RIGHT behaviour: on `main` C1–C4 fail (no chip at all). Usage: node sf-c-openrow.mjs [outdir-suffix] */
const OUT = 'c-openrow' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, go, editWeek, board, closeBoard, oilMode, screen, check, note, summary, SF_STATE, DESK, PHONE } = L
const DI = 5

/* the FAMILY DAY row's boxes on the edit week — found by what the row says, never by position */
const rowKeys = page => page.evaluate(di => {
  const prog = [...document.querySelectorAll(`#eWeek [data-txt^="ap:${di}."][data-txt$=".prog"]`)].find(e => /FAMILY DAY/.test(e.textContent || ''))
  if (!prog) return null
  const base = prog.getAttribute('data-txt').replace(/\.prog$/, '')
  return { str: base + '.str', end: base + '.end' }
}, DI)
const chipOn = (page, scope) => page.evaluate(({ scope, di }) => {
  const c = [...document.querySelectorAll(`${scope} .oilcount[data-oilday="${di}"]`)].find(e => e.offsetWidth && /FAMILY DAY/.test((e.closest('.ah-row, .sb-arow, .pl-row') || {}).textContent || ''))
  return c ? { text: c.textContent.trim(), title: c.getAttribute('title'), nostart: c.classList.contains('nostart'), item: c.dataset.oilsent } : null
}, { scope, di: DI })
const tapChip = async (page, scope) => {
  const item = (await chipOn(page, scope))?.item
  if (!item) return false
  const c = page.locator(`${scope} .oilcount[data-oilsent="${item}"]:visible`).first()
  await c.scrollIntoViewIfNeeded(); const b = await c.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
  await page.waitForTimeout(600); return true
}
const winRead = page => page.evaluate(() => {
  const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && x.offsetWidth)
  if (!w) return null
  const sm = w.querySelector('.win-ttl small'), tt = w.querySelector('.win-ttl')
  /* are the when-line's words all on screen — not clipped by the title's one-line box? */
  const smallCut = !!sm && (sm.scrollWidth > sm.clientWidth + 1 || sm.getBoundingClientRect().right > tt.getBoundingClientRect().right + 0.5)
  return { smallCut, title: (w.querySelector('.win-ttl')?.textContent || '').trim(), rows: w.querySelectorAll('.rpuck').length,
    lost: (w.querySelector('.win-lost')?.textContent || '').trim(), hint: (w.querySelector('.win-foot .hint')?.textContent || '').trim(),
    tab: (w.querySelector('.win-tab.on')?.textContent || '').trim() }
})
const closeWin = page => page.locator('.availwin:not([hidden]) .win-x').first().click({ timeout: 1500 }).catch(() => {})
/* clear a week box the way a person does — select it all and press Backspace (typing an empty string types nothing) */
async function clearBox(page, key) {
  const el = page.locator(`#eWeek [data-txt="${key}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await el.click()
  await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await el.evaluate(e => e.blur()); await page.waitForTimeout(700)
  return page.evaluate(k => (document.querySelector(`#eWeek [data-txt="${k}"]`)?.textContent || '').trim(), key)
}

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
await editWeek(page)
const keys = await rowKeys(page)
note('FAMILY DAY boxes', JSON.stringify(keys))
check('setup: the Saturday carries FAMILY DAY with its ALL AVAIL', !!keys && !!(await chipOn(page, '#eWeek')), JSON.stringify(await chipOn(page, '#eWeek')))
const before = await chipOn(page, '#eWeek')
note('the chip before, with both times', JSON.stringify(before))

/* C1 — its END cleared, as a scheduler clears it */
note('C1 the end box after clearing', JSON.stringify(await clearBox(page, keys.end)))
const c1 = await chipOn(page, '#eWeek')
note('C1 the week\'s chip after the end is cleared', JSON.stringify(c1))
check('C1a the count chip still shows on the week', !!c1 && /^\d+$/.test(c1.text), JSON.stringify(c1))
await board(page, DI)
const b1 = await chipOn(page, '#schedBoard')
check('C1b and on the board', !!b1 && /^\d+$/.test(b1.text), JSON.stringify(b1))
await tapChip(page, '#schedBoard')
const w1 = await winRead(page)
await screen(page, 'c1-desktop-window-assumed-hour')
note('C1 the window', JSON.stringify(w1))
check('C1c its title names the assumed hour', !!w1 && /no end time, an hour assumed/.test(w1.title), JSON.stringify(w1))
check('C1e and the words are all on screen at the window\'s default width — not cut', !!w1 && !w1.smallCut, JSON.stringify(w1))
check('C1d it lists as many men as the chip counted', !!w1 && !!b1 && w1.rows === +b1.text && !w1.lost, JSON.stringify({ w1, b1 }))
await closeWin(page)

/* C2 — where OIL is decided */
note('C2 OIL Earn on', JSON.stringify(await oilMode(page, true)))
const sw = await page.evaluate(() => {
  const c = [...document.querySelectorAll('#schedBoard .oilitem')].find(e => e.offsetWidth && /FAMILY DAY/.test(e.textContent || ''))
  return c ? c.getAttribute('title') : null
})
check('C2a the row\'s switch in OIL Earn says no OIL is worked out, and why', sw === 'No OIL worked out — this row has no end time', String(sw))
await tapChip(page, '#schedBoard')
const w2 = await winRead(page)
await screen(page, 'c2-desktop-oil-half')
note('C2 the window in OIL Earn', JSON.stringify(w2))
check('C2b the window opens on "Who earns OIL" and says the same sentence', !!w2 && /Who earns OIL/.test(w2.tab) && w2.hint === 'No OIL worked out — this row has no end time.', JSON.stringify(w2))
check('C2c and nobody is counted as earning', !!w2 && /\b0 of \d+/.test(w2.tab), JSON.stringify(w2 && w2.tab))
await closeWin(page)
await oilMode(page, false)
await closeBoard(page)

/* C3 — the phone */
await page.setViewportSize(PHONE); await page.waitForTimeout(700)
await board(page, DI)
const b3 = await chipOn(page, '#schedBoard')
check('C3a the phone board shows the chip', !!b3 && /^\d+$/.test(b3.text), JSON.stringify(b3))
await tapChip(page, '#schedBoard')
const w3 = await winRead(page)
await screen(page, 'c3-phone-window')
check('C3b the phone panel\'s title names the assumed hour', !!w3 && /an hour assumed/.test(w3.title), JSON.stringify(w3))
check('C3c and its words are all on screen', !!w3 && !w3.smallCut, JSON.stringify(w3))
await closeWin(page); await closeBoard(page)
await page.setViewportSize(DESK); await page.waitForTimeout(700)

/* C4 — its START cleared too */
await go(page, 'editsched'); await page.waitForTimeout(400)
note('C4 the start box after clearing', JSON.stringify(await clearBox(page, keys.str)))
const c4 = await chipOn(page, '#eWeek')
note('C4 the chip with no start', JSON.stringify(c4))
check('C4a a "?" of its own, with the row\'s reason', !!c4 && c4.text === '?' && c4.nostart && /^No start time/.test(c4.title), JSON.stringify(c4))
await tapChip(page, '#eWeek')
const w4 = await winRead(page)
await screen(page, 'c4-desktop-no-start')
check('C4b its tap opens the window on the reason', !!w4 && /no usable start and end times/.test(w4.lost), JSON.stringify(w4))
await closeWin(page)

check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('sf-c-openrow') ? 1 : 0
