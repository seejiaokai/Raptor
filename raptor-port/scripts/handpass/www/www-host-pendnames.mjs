/* www host (16 Nov 26): the pending list names the people on its warning rows (the blind Opus read's F1), by the route
   the re-walk's brief missed — a published day whose own face moves: Ranger's CAT changed on Quals after publishing.
   usage: [PHONE=1] node scripts/handpass/www/www-host-pendnames.mjs  (WWW_DIST / WWW_BUNDLE set to the frozen build) */
const PHONE = process.env.PHONE === '1'
process.env.WWW_WHO = 'host'
process.env.WWW_RUN ||= 'pendnames-' + (PHONE ? 'p' : 'd')
const X = await import('./www-lib.mjs')
const { say, sleep, FRI } = X
const P = PHONE ? 'p' : 'd'

async function frFlight(w, di, to, man, msn) {
  const wi = await X.addWave(w, di, '')
  await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.to"]`, to)
  await X.typeIn(w, `[data-bfld="ff:${di}.${wi}.0.msn"]`, msn)
  return X.seat(w, `[data-slot="${di}.${wi}.0.0.p"]`, man)
}
async function signAndPublish(w, di) {
  const page = w.page
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`#schedBoard select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    await sel.selectOption(opts[0]); await sleep(250); out[role] = 'ok'
  }
  for (const attr of ['data-beak', 'data-alpub']) {
    const b = page.locator(`#schedBoard [${attr}="${di}"]:visible`).first()
    if (await b.count()) { await b.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await b.tap(); else await b.click(); await sleep(900); break }
  }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await sleep(900) }
  return out
}
const head = (w) => w.page.evaluate(() => {
  const s = document.querySelector('#schedBoard'); if (!s) return null
  const t = q => ((s.querySelector(q) || {}).innerText || '').replace(/\s+/g, ' ').trim()
  return { tag: t('.verchip'), pending: t('.dpend') }
})

const w = await X.open({ phone: PHONE })
const { page } = w
await X.board(w, FRI)
say('seat', await frFlight(w, FRI, '12:00', 'bane', 'FRI FLT'))
say('signs', JSON.stringify(await signAndPublish(w, FRI)))
say('after publish', JSON.stringify(await head(w)))
await X.pic(w, `h5-a-published-${P}`)
await X.closeBoard(w)

/* Quals: Edit, Ranger's CAT to OCU (an OCU pilot alone in a jet raises "OCU with no IP"), Done */
if (PHONE) { await X.press(w, '#navBurger, .navburger, [aria-label="Menu"]'); await sleep(500) }
await X.press(w, 'a[data-page="quals"]'); await sleep(900)
await X.press(w, '#qEdit'); await sleep(500)
const sel = page.locator('select[data-lvl="bane"]:visible').first()
say('CAT box found', await sel.count())
await sel.selectOption('OCU'); await sleep(500)
await X.pic(w, `h5-b-quals-ocu-${P}`)
await X.press(w, '#qSave'); await sleep(600)

/* back to the board's Friday: the pending list */
if (PHONE) { await X.press(w, '#navBurger, .navburger, [aria-label="Menu"]'); await sleep(500) }
await X.press(w, 'a[data-page="editsched"]'); await sleep(900)
await X.board(w, FRI)
say('head now', JSON.stringify(await head(w)))
await X.press(w, '.dpend', { scope: 'board', after: `h5-c-open-after-tap-${P}` }); await sleep(900)
const items = await page.evaluate(() => [...document.querySelectorAll('.chgwin .pl-item, .chgwin .pl-row, .chgwin li')]
  .filter(e => e.getBoundingClientRect().width > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean))
say('PENDING LIST', JSON.stringify(items, null, 1))
await X.pic(w, `h5-d-pending-${P}`)
const named = items.some(s => /Ranger — OCU with no IP/.test(s))
say(named ? 'PASS: the warning row leads with "Ranger — "' : 'FAIL: no row "Ranger — OCU with no IP"')
await X.fin(w)
