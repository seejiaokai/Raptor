/* G3.4 — [ABSENCE-SMALL-SEEN] 4: a member opening ANOTHER man's input gets the window read only (no Delete, no Save,
   "Only Tally or an admin can change this." — W1-F3), but its locked fields were drawn exactly as live ones: the same
   boxes, the same dropdown arrows, so nothing but the line at the foot said they could not be changed (the re-test's
   W1). Walked as the member (us = Ranger) at a desktop and a phone: another man's input — its fields read as values,
   not boxes (no box, no arrow, no hand cursor); the control — his OWN input — keeps its live boxes.
   Usage: node sf-g4-readonly.mjs [outdir-suffix] */
const OUT = 'g4-readonly' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const { open, go, check, note, summary } = L
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

async function july(page) {
  await go(page, 'inputs')
  await page.waitForSelector('#inCalBtn')
  await page.selectOption('#inFPerson', 'all').catch(() => {}); await page.waitForTimeout(300)
  await page.locator('#inCalBtn').click(); await page.waitForSelector('#inpCal')
  for (let i = 0; i < 24; i++) {
    const cur = (await page.locator('#inpCal .ic-mon').textContent()).trim()
    if (cur === 'July 2026') break
    const [m, y] = cur.split(' '); const at = `${y}-${String(MONTHS.indexOf(m) + 1).padStart(2, '0')}`
    await page.locator(at < '2026-07' ? '#icNext' : '#icPrev').click(); await page.waitForTimeout(300)
  }
}
/* the window's fields: what a person sees of each — a box (background, border), an arrow, the cursor */
const fields = page => page.evaluate(() => {
  const body = document.querySelector('#inpEditPop .inped-body')
  const els = body ? [...body.querySelectorAll('select, input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea')].filter(e => e.offsetWidth) : []
  return {
    inert: !!(body && body.hasAttribute('inert')),
    ro: (document.querySelector('#inpEditPop [data-testid="inped-ro"]')?.textContent || '').trim(),
    fields: els.map(e => { const s = getComputedStyle(e); return { tag: e.tagName.toLowerCase(), bg: s.backgroundColor, border: s.borderTopColor, bw: s.borderTopWidth, appearance: s.appearance, cursor: s.cursor } }),
  }
})
const boxed = f => !/rgba\(0, 0, 0, 0\)|transparent/.test(f.bg) || (parseFloat(f.bw) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(f.border))
async function openChip(page, iso, mine) {
  const iid = await page.evaluate(({ iso, mine }) => {
    const chips = [...document.querySelectorAll(`#inpCal [data-icday="${iso}"] [data-iid], #inpCal [data-iid]`)]
    const pick = chips.find(c => { const r = window.INPUTS.find(x => x.iid === c.getAttribute('data-iid')); return r && (mine ? r.person === 'bane' : r.person !== 'bane') && c.offsetWidth })
    return pick ? pick.getAttribute('data-iid') : null
  }, { iso, mine })
  if (!iid) return null
  const c = page.locator(`#inpCal [data-iid="${iid}"]:visible`).first()
  await c.scrollIntoViewIfNeeded(); await c.click(); await page.waitForTimeout(500)
  if (!(await page.locator('#inpEditPop:not([hidden])').count())) {           // a day popover first: its row opens it
    const row = page.locator(`[data-iid="${iid}"]:visible`).last(); if (await row.count()) { await row.click(); await page.waitForTimeout(500) }
  }
  return iid
}
const close = page => page.locator('#inpEditPop #inpEditCancel').click({ timeout: 1500 }).catch(() => {})

for (const [label, size] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
  const { browser, page, errors } = await open({ ...size, who: 'm' })
  await july(page)
  /* ANOTHER man's input */
  const other = await openChip(page, '2026-07-24', false)
  const o = await fields(page)
  note(`${label} another man's input`, JSON.stringify({ other, o }))
  await page.locator('#inpEditPop .airpop-box').screenshot({ path: `${process.env.HP_SHOTS}/g4-${label}-other.png` }).catch(() => {})
  check(`G4a ${label}: another man's input opens read only`, o.inert && /can change this/.test(o.ro), JSON.stringify(o))
  check(`G4b ${label}: its locked fields read as values — no box, no arrow`, o.fields.length > 0 && o.fields.every(f => !boxed(f) && (f.tag !== 'select' || f.appearance === 'none')), JSON.stringify(o.fields))
  check(`G4c ${label}: and no hand or text cursor over them`, o.fields.every(f => f.cursor === 'default'), JSON.stringify(o.fields.map(f => f.cursor)))
  await close(page)
  /* THE CONTROL — his own input keeps its live boxes */
  const own = await openChip(page, '2026-07-16', true)
  const m = await fields(page)
  note(`${label} his own input`, JSON.stringify({ own, m }))
  await page.locator('#inpEditPop .airpop-box').screenshot({ path: `${process.env.HP_SHOTS}/g4-${label}-own.png` }).catch(() => {})
  check(`G4d ${label}: his own input keeps its live boxes`, !m.inert && m.fields.length > 0 && m.fields.every(boxed), JSON.stringify(m.fields))
  await close(page)
  check(`${label}: no console errors`, errors.length === 0, errors.join(' | ').slice(0, 300))
  await browser.close()
}
process.exitCode = summary('sf-g4-readonly') ? 1 : 0
