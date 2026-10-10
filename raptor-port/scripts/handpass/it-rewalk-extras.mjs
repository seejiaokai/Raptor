// THE RE-WALK'S EXTRAS for [INPUT-OWN-TITLE] (docs/handpass/2026-10-09-input-title-check.md §5.3, §5.6): the walkers'
// finds that the host's own walk (it-host-walk.mjs) does not drive, each re-driven on the fixed build as an assertion of
// the RIGHT behaviour — and two finds the host had to place (is it this change's, or older?) by driving the same
// gesture with a draft that has nothing to do with a title.
//
//   node scripts/handpass/it-rewalk-extras.mjs <out dir>          (LOOK_URL=http://localhost:4180/ by default)
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = process.argv[2] || 'docs/img/handpass/2026-10-09-input-title-check/rewalk'
mkdirSync(OUT, { recursive: true })
const URL = (process.env.LOOK_URL || 'http://localhost:4180/') + '?fresh=1'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const LONG = '1234567890123456789012345678901234567890'
let bad = 0, n = 0
const errs = []
const say = (ok, name, detail = '') => { n++; if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`) }
const step = async (name, fn) => { try { const r = await fn(); say(r === undefined ? true : !!r.ok, name, r && r.detail) } catch (e) { say(false, name, String(e.message || e).split('\n').slice(0, 5).join(' ⏎ ').slice(0, 500)) } }
async function open(viewport, touch = false) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)) })
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
  return { ctx, page }
}
async function month(p, y, m) {
  for (let i = 0; i < 60; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
    if (!d) return
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
}
const DAYWIN = '[data-testid="win-inputsday"]', WIN = '[data-testid="win-inputedit"]'
const press = (p, loc, touch) => touch ? loc.tap() : loc.click()
async function openNew(p, iso, touch = false) {
  await p.evaluate(() => window.go('inputs'))
  await month(p, +iso.slice(0, 4), +iso.slice(5, 7))
  if (!(await p.locator(DAYWIN).count())) { const c = p.locator(`#inpCal [data-icday="${iso}"]`); if (touch) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } }) }
  await press(p, p.locator('#icPopAdd'), touch)
  await p.locator(WIN).waitFor()
}
const save = async (p, touch) => {
  await press(p, p.locator('#inpEditSave'), touch)
  const sheet = p.locator('[data-testid="oilconf"]')
  if (await sheet.waitFor({ timeout: 900 }).then(() => true, () => false)) { await press(p, sheet.locator('[data-testid="oil-no"]'), touch); await press(p, sheet.locator('[data-testid="oilconf-save"]'), touch) }
  await p.waitForTimeout(350)
}
/* the board's Personal Inputs card of the 40-character title: the name ends inside its own cell, clear of the label */
const cardOf = p => p.evaluate(LONG => {
  const card = [...document.querySelectorAll('#schedBoard .inprow')].find(r => (r.textContent || '').includes(LONG.slice(0, 20)))
  if (!card) return null
  card.scrollIntoView({ block: 'center' })
  const name = card.querySelector('.inpty'), tag = card.querySelector('.nm-kind'), late = card.querySelector('.latechip, .latetag')
  const q = e => e.getBoundingClientRect()
  return { clear: !tag || q(name).right <= q(tag).left + 1, clearLate: !late || !tag || q(tag).right <= q(late).left + 1, cut: name.scrollWidth > name.clientWidth, ellipsis: getComputedStyle(name).textOverflow, tag: tag && tag.textContent, inside: q(card).right <= innerWidth + 1 }
}, LONG)

for (const [what, viewport, touch] of [['a desktop', { width: 1440, height: 900 }, false], ['a phone', { width: 390, height: 844 }, true]]) {
  const { ctx, page } = await open(viewport, touch)
  await step(`X1 ${what}: the board's Personal Inputs card of a 40-character title — the name ends in its own cell (an ellipsis), clear of its kind and of LATE`, async () => {
    await openNew(page, '2026-07-15', touch)
    await page.selectOption('#inpEditType', 'Event')
    await page.fill('#inpEditOwnTitle', LONG + 'EXTRA')
    const kept = await page.inputValue('#inpEditOwnTitle')
    await save(page, touch)
    if (await page.locator(DAYWIN).count()) await page.keyboard.press('Escape')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(400)
    await press(page, page.locator('#eWeek [data-sbday="2"]:visible').first(), touch).catch(() => page.locator('#eWeek [data-sbday="2"]').first().click())
    await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500)
    if (!(await cardOf(page))) { await press(page, page.locator('#schedBoard [data-pitog]').first(), touch); await page.waitForTimeout(400) }
    const d = await cardOf(page)
    await page.waitForTimeout(200); await page.screenshot({ path: join(OUT, `x1-${touch ? 'phone' : 'desktop'}-board-card-40.png`) })
    return { ok: kept === LONG && !!d && d.clear && d.clearLate && d.ellipsis === 'ellipsis' && d.tag === 'Event' && d.inside, detail: `the box kept ${kept.length} characters · ${JSON.stringify(d)}` }
  })
  await step(`X2 ${what}: the board's row of that title in OIL Earn is not on a working day — on the board with the mode off the row keeps its kind under the name box`, async () => {
    const d = await page.evaluate(LONG => {
      const r = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')].find(r => { const f = r.querySelector('[data-bfld$=".prog"]'); return f && (f.value || f.textContent || '').trim() === LONG })
      return r ? { tag: r.querySelector('.sb-nmk .nm-kind')?.textContent || '' } : null
    }, LONG)
    return { ok: !!d && d.tag === 'Event', detail: JSON.stringify(d) }
  })
  await ctx.close()
}

/* W1 — Saturday's board in OIL Earn keeps the kind under the titled row's name */
{
  const { ctx, page } = await open({ width: 1440, height: 900 })
  await step('X3 Saturday’s board, OIL Earn ON: the titled row’s name cell is the switch, and its kind still stands under it; OFF again, the same', async () => {
    await openNew(page, '2026-07-18')
    await page.selectOption('#inpEditType', 'Event'); await page.fill('#inpEditOwnTitle', 'Weekend exercise')
    await page.locator('#inpEditSave').click()
    const sheet = page.locator('[data-testid="oilconf"]'); await sheet.waitFor()
    await sheet.locator('[data-testid="oil-yes"]').click(); await sheet.locator('[data-testid="oilconf-save"]').click(); await page.waitForTimeout(350)
    if (await page.locator(DAYWIN).count()) await page.keyboard.press('Escape')
    await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(400)
    await page.locator('#eWeek [data-sbday="5"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await page.waitForTimeout(500)
    const read = () => page.evaluate(() => {
      const r = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')].find(r => /WEEKEND EXERCISE/.test(r.textContent || ''))
      if (!r) return null
      r.scrollIntoView({ block: 'center' })
      /* its cells against an UNTITLED row's in the same mode (the mode itself takes every row's controls away) */
      const other = [...document.querySelectorAll('#schedBoard .sb-arow.c6r')].find(x => x !== r && !x.querySelector('.nm-kind') && !x.classList.contains('inprow'))
      return { tag: r.querySelector('.sb-nmk .nm-kind')?.textContent || '', sw: !!r.querySelector('.oilitem'), kids: r.children.length, otherKids: other ? other.children.length : r.children.length }
    })
    const off = await read()
    await page.locator('#sbOil').click(); await page.waitForTimeout(600)
    const on = await read()
    await page.waitForTimeout(150); await page.screenshot({ path: join(OUT, 'x3-board-oil-earn-kind.png') })
    await page.locator('#sbOil').click(); await page.waitForTimeout(400)
    return { ok: !!off && off.tag === 'Event' && !off.sw && off.kids === off.otherKids && !!on && on.tag === 'Event' && on.sw && on.kids === on.otherKids, detail: `off ${JSON.stringify(off)} · on ${JSON.stringify(on)}` }
  })
  /* walker A's extra: Enter in a NEW input's Title box saved it and a blank "New input" window opened again. Placed by
     driving the SAME key in the Remarks box, which carries the same Enter rule and is not this change's */
  await step('X4 placing a find — Enter in a new input’s Title box, and Enter in its Remarks box: do both leave a second "New input" window open?', async () => {
    const after = async sel => {
      await openNew(page, '2026-07-16')
      await page.selectOption('#inpEditType', 'Meeting')
      await page.locator(sel).click(); await page.keyboard.type('x'); await page.keyboard.press('Enter'); await page.waitForTimeout(600)
      const open = await page.locator(WIN).count()
      if (open) { await page.locator('#inpEditCancel').click().catch(() => {}); await page.waitForTimeout(200) }
      return open
    }
    const viaRemarks = await after('#inpEditRmk'), viaTitle = await after('#inpEditOwnTitle')
    return { ok: viaTitle === viaRemarks, detail: `a window open after Enter — in Remarks: ${viaRemarks}; in Title: ${viaTitle} (the same either way: the Title box behaves as the Remarks box always has)` }
  })
  await ctx.close()
}
/* walker A's #9 on a phone: the "Unsaved changes" question hidden behind the day's window. Placed by driving it with a
   REMARKS-only draft: if it is hidden there too, it is the windows' layering, older than the title */
{
  const { ctx, page } = await open({ width: 390, height: 844 }, true)
  await step('X5 placing a find — a phone, an unsaved REMARKS draft, another input’s card tapped: is the "Unsaved changes" question on top?', async () => {
    await openNew(page, '2026-07-15', true); await page.selectOption('#inpEditType', 'Meeting'); await page.fill('#inpEditRmk', 'first'); await save(page, true)
    await openNew(page, '2026-07-15', true); await page.selectOption('#inpEditType', 'Training'); await page.fill('#inpEditRmk', 'second'); await save(page, true)
    const cards = page.locator(`${DAYWIN} [data-testid="idy-open"]`)
    await cards.nth(0).tap(); await page.locator(WIN).waitFor()
    await page.fill('#inpEditRmk', 'an unsaved remark')
    /* the other input's card, behind the window: tapped where it shows, if it shows */
    const other = await cards.nth(1).boundingBox()
    await page.touchscreen.tap(other.x + 20, other.y + 12); await page.waitForTimeout(500)
    const q = await page.evaluate(() => {
      const el = [...document.querySelectorAll('body *')].find(e => /Unsaved changes/.test(e.textContent || '') && e.children.length < 6 && e.offsetParent !== null)
      if (!el) return { raised: false }
      const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return { raised: true, onTop: !!hit && (hit === el || el.contains(hit) || hit.contains(el)) }
    })
    await page.screenshot({ path: join(OUT, 'x5-phone-unsaved-remarks-draft.png') })
    return { ok: true, detail: `with a remarks-only draft: ${JSON.stringify(q)} — recorded, not judged here (see the sheet's §5.3)` }
  })
  await ctx.close()
}
await browser.close()
console.log(`\n${n - bad} of ${n} PASS${errs.length ? ' · errors: ' + JSON.stringify([...new Set(errs)].slice(0, 6)) : ' · no console or page error'}`)
process.exit(bad ? 1 : 0)
