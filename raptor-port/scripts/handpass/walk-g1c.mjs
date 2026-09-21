/* G1 part three — the controls that SURVIVE into the mode: can they actually be
   operated?  Sign-off, Publish, Unpublish, the plans selector, the row grips,
   the LATE chip, the input accept/undo buttons, the wave ✕. */
import { open, board, tap, shot, oilMode, readDay } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const di = 5
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const R = {}

/* what does the board's FAMILY DAY row show OUTSIDE the mode? */
R.familyRow = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const row = [...root.querySelectorAll('.sb-arow, tr, .sb-row')].find(r => /FAMILY DAY/.test(r.innerText || ''))
  if (!row) return null
  return {
    text: (row.innerText || '').replace(/\n+/g, ' | ').slice(0, 160),
    pucks: [...row.querySelectorAll('[data-person]')].map(p => ({ who: p.dataset.person, txt: (p.innerText || '').trim(), cls: p.className.slice(0, 44), title: (p.getAttribute('title') || '').slice(0, 70) })),
    chip: row.querySelector('.oilcount') ? row.querySelector('.oilcount').innerText : null,
  }
})
const famBox = page.locator('#schedBoard').locator('text=FAMILY DAY').first()
await famBox.scrollIntoViewIfNeeded().catch(() => {})
await shot(page, 'G-G1-06-family-day-row-board')

/* ---- INTO THE MODE on the UNPUBLISHED day ---- */
await oilMode(page, true)

/* 1. sign all four from inside the mode */
R.signInMode = await (async () => {
  const sels = page.locator('#schedBoard [data-sign]:visible')
  const n = await sels.count()
  const before = await page.evaluate(() => (document.querySelector('#schedBoard [data-beak]') || {}).disabled)
  for (let i = 0; i < n; i++) {
    const opts = await sels.nth(i).locator('option').evaluateAll(os => os.map(o => o.value).filter(v => v && v !== '—'))
    if (opts.length) await sels.nth(i).selectOption(opts[Math.min(i, opts.length - 1)]).catch(() => {})
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => {
    const b = document.querySelector('#schedBoard [data-beak]')
    return { text: b ? b.innerText.trim() : null, disabled: b ? !!b.disabled : null, vals: [...document.querySelectorAll('#schedBoard [data-sign]')].map(s => s.value) }
  })
  return { selects: n, beakDisabledBefore: before, after, stillInMode: await page.evaluate(() => !!document.querySelector('#schedBoard [data-oilitem]')) }
})()
await shot(page, 'G-G1-07-signed-inside-mode')

/* 2. press Publish day from inside the mode */
R.publishFromInside = await (async () => {
  const b = page.locator('#schedBoard [data-beak]:visible').first()
  if (!await b.count()) return { beak: 'absent' }
  const dis = await b.isDisabled()
  if (dis) return { beak: 'disabled' }
  await b.click()
  await page.waitForTimeout(1200)
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible()) { await ok.click(); await page.waitForTimeout(1000) }
  return await page.evaluate(() => ({
    version: ((document.querySelector('#schedBoard .verchip') || {}).innerText || '').trim(),
    stillInMode: !!document.querySelector('#schedBoard [data-oilitem]'),
    barsDrawn: document.querySelectorAll('#schedBoard .oilbar-fo, #schedBoard .oilbar-ho').length,
    daybar: ((document.querySelector('#schedBoard .daybar') || {}).innerText || '').replace(/\n+/g, ' | '),
  }))
})()
await shot(page, 'G-G1-08-published-from-inside-mode')

/* 3. the plans selector, pressed inside the mode */
R.plansMenu = await (async () => {
  const b = page.locator('#schedBoard [data-planmenu]:visible').first()
  if (!await b.count()) return { found: false }
  await b.click()
  await page.waitForTimeout(600)
  const seen = await page.evaluate(() => {
    const cands = [...document.querySelectorAll('.plansheet, .planpop, [class*=plan]')].filter(e => e.offsetParent && (e.innerText || '').length < 600 && /plan|working copy/i.test(e.innerText || ''))
    return cands.map(e => (e.innerText || '').replace(/\n+/g, ' | ').slice(0, 200)).slice(0, 4)
  })
  await shot(page, 'G-G1-09-plans-menu-in-mode')
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)
  return { found: true, menus: seen }
})()

/* 4. drag a row grip inside the mode — does the row move? */
R.gripDrag = await (async () => {
  const before = await readDay(page, di)
  const g = page.locator('#schedBoard span.sb-grip:visible').nth(2)
  if (!await g.count()) return { grips: 0 }
  const a = await g.boundingBox()
  if (!a) return { grips: 'no box' }
  await page.mouse.move(a.x + 5, a.y + 5)
  await page.mouse.down()
  await page.mouse.move(a.x + 5, a.y + 120, { steps: 12 })
  await page.waitForTimeout(250)
  const dragging = await page.evaluate(() => document.body.className)
  await page.mouse.up()
  await page.waitForTimeout(600)
  const after = await readDay(page, di)
  return { grips: await page.locator('#schedBoard span.sb-grip:visible').count(), bodyClassDuringDrag: dragging, moved: JSON.stringify(before.ground) !== JSON.stringify(after.ground) || JSON.stringify(before.duties) !== JSON.stringify(after.duties) || JSON.stringify(before.waves) !== JSON.stringify(after.waves) }
})()
await shot(page, 'G-G1-10-after-grip-drag-in-mode')

/* 5. the LATE chip and the input accept/UNDO buttons inside the mode */
R.lateAndAcc = await page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  const grab = sel => [...root.querySelectorAll(sel)].filter(e => e.offsetParent)
    .map(e => ({ text: (e.innerText || '').trim().slice(0, 18), title: (e.getAttribute('title') || '').slice(0, 80), dis: !!e.disabled }))
  return { late: grab('[data-lateoff]'), acc: grab('[data-acc],[data-accd],[data-acck]'), woff: grab('[data-woff]'), ifld: grab('[data-ifld]').length }
})
R.pressLate = await (async () => {
  const c = page.locator('#schedBoard [data-lateoff]:visible').first()
  if (!await c.count()) return 'none'
  const b4 = await c.getAttribute('class')
  await c.click({ force: true }).catch(() => {})
  await page.waitForTimeout(500)
  const after = await page.locator('#schedBoard [data-lateoff]:visible').first().getAttribute('class').catch(() => null)
  return { before: b4, after, changed: b4 !== after }
})()

/* 6. the input row's own time boxes inside the mode — can they be typed into? */
R.ifldType = await (async () => {
  const f = page.locator('#schedBoard [data-ifld]:visible').first()
  if (!await f.count()) return 'none'
  const before = await f.inputValue().catch(() => null)
  await f.click({ force: true }).catch(() => {})
  await f.fill('05:00').catch(() => {})
  await f.blur().catch(() => {})
  await page.waitForTimeout(600)
  const after = await page.locator('#schedBoard [data-ifld]:visible').first().inputValue().catch(() => null)
  return { before, after, tookTheEdit: before !== after }
})()
await shot(page, 'G-G1-11-input-fields-in-mode')

R.errors = errors.slice(0, 10)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-g1c.json', JSON.stringify(R, null, 1))
console.log('FAMILY DAY row on the board (outside the mode):'); console.log(JSON.stringify(R.familyRow, null, 1))
console.log('SIGN inside the mode:', JSON.stringify(R.signInMode))
console.log('PUBLISH from inside the mode:', JSON.stringify(R.publishFromInside))
console.log('PLANS menu in the mode:', JSON.stringify(R.plansMenu))
console.log('GRIP drag in the mode:', JSON.stringify(R.gripDrag))
console.log('LATE / accept / wave-✕ / input boxes in the mode:', JSON.stringify(R.lateAndAcc))
console.log('pressing the LATE chip in the mode:', JSON.stringify(R.pressLate))
console.log('typing into an input row box in the mode:', JSON.stringify(R.ifldType))
console.log('errors:', R.errors)
await browser.close()
