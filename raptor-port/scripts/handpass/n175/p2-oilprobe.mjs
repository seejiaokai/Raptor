// p2-oilprobe - finding the controls only (not a case): Saber files a duty input for Hunter on a Saturday on 142, and what
// the screen asks on its Save; then Hunter's bell.
import { writeFileSync } from 'node:fs'
import { mk, closeAll, FACT, signIn, go, wait, vis, hit, scratch, windowsNow, toastNow, tmpDir } from './lib.mjs'
const s = await mk('d'); const { page } = s
try {
  await signIn(s, 'ad', 'a')
  await go(s, 'inputs'); await wait(s, 500)
  if (await vis(s, '#inListBtn[aria-pressed="false"]').count()) await hit(s, '#inListBtn')
  await hit(s, '#inNew', 600)
  console.log('TYPES', await page.evaluate(() => [...document.querySelector('#inpEditType')?.options || []].map(o => o.value + '|' + o.textContent)))
  const v = await page.evaluate(() => [...document.querySelector('#inpEditPerson').options].find(x => /Hunter/.test(x.textContent))?.value)
  await page.selectOption('#inpEditPerson', v)
  const ty = await page.evaluate(() => [...document.querySelector('#inpEditType').options].find(o => /^Duty/i.test(o.textContent))?.value)
  console.log('TYPE PICK', ty); if (ty) await page.selectOption('#inpEditType', ty)
  const day = () => page.locator('.floatwin.inpedwin button[aria-label^="Sat 12 Dec 2026"]').first()
  for (let i = 0; i < 12 && !(await day().count()); i++) await hit(s, page.locator('.floatwin.inpedwin button[aria-label="Next month"]').first(), 250)
  await hit(s, day()); await page.fill('#inpEditRmk', 'n175 oil for hunter')
  console.log('WIN', JSON.stringify(await windowsNow(s)))
  await hit(s, '#inpEditSave', 700)
  for (let i = 0; i < 4; i++) {
    console.log('AFTER SAVE', i, JSON.stringify((await windowsNow(s)).map(w => w.what + ' :: ' + w.words.slice(0, 160) + ' || ' + w.buttons.join(' / '))), await toastNow(s))
    if (process.env.X && i === 0) {
      const x = page.locator('[role=dialog], .airpop, #pop').filter({ hasText: /^OIL:/ }).filter({ visible: true }).locator('button').filter({ hasText: /^✕$/ })
      console.log('OIL X count', await x.count()); if (await x.count()) { await hit(s, x.first(), 600); console.log('AFTER X', JSON.stringify((await windowsNow(s)).map(w => w.what + ' :: ' + w.words.slice(0, 100))), await toastNow(s)); if (await vis(s, '#inpEditCancel').count()) { await hit(s, '#inpEditCancel', 500); console.log('AFTER CANCEL', JSON.stringify((await windowsNow(s)).map(w => w.what + ' :: ' + w.words.slice(0, 100)))) } }
      break
    }
    await scratch(s, 'p2', 'oilprobe-' + i)
    const nd = vis(s, 'button').filter({ hasText: /^No document$/ }); if (await nd.count()) { await hit(s, nd.first()); continue }
    if (await vis(s, '#dlgOk').count()) { await hit(s, '#dlgOk'); continue }
    break
  }
  writeFileSync(tmpDir('p2') + '/oilprobe-state.json', JSON.stringify(await s.ctx.storageState()))
} finally { await s.ctx.close() }
const h = await mk('d', { storageState: tmpDir('p2') + '/oilprobe-state.json' })
try {
  await signIn(h, 'ad2', 'a2')
  console.log('HUNTER BELL ON', await h.page.evaluate(() => document.querySelector('#notifyBell')?.className))
  await hit(h, '#notifyBell', 900)
  console.log('HUNTER AFTER BELL', JSON.stringify((await windowsNow(h)).map(w => w.words.slice(0, 200) + ' || ' + w.buttons.join(' / '))), await toastNow(h))
  await scratch(h, 'p2', 'oilprobe-hunter')
} finally { await closeAll() }
