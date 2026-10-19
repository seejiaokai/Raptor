// Walker B — B1 (Duty templates Start) and B2 (Wave templates T/O). VERSION 1
import { launch, runBox, runControl } from './kbs-B-lib.mjs'
const size = process.argv[2] || 'desktop'
const only = process.argv[3] || ''
console.log('kbs-B-duty VERSION 1', size)
const A = await launch(size)
const { page } = A
await A.go('admin')

const openDuty = async () => {
  if (await page.locator('#tplClose').isVisible().catch(() => false)) return
  await page.evaluate(() => document.getElementById('admDutyTpl').click()); await page.waitForTimeout(500)
}
const closeDuty = async () => { await page.evaluate(() => document.getElementById('tplClose').click()); await page.waitForTimeout(400) }
const openWave = async () => {
  if (await page.locator('#waveTplClose').isVisible().catch(() => false)) return
  await page.evaluate(() => document.getElementById('admWaveTpl').click()); await page.waitForTimeout(500)
}
const closeWave = async () => { await page.evaluate(() => document.getElementById('waveTplClose').click()); await page.waitForTimeout(400) }

if (!only || only === 'B1') {
  await runBox(A, {
    id: 'B1', slug: 'duty-start', name: 'Admin → Duty templates → first role (SDO) Start time',
    ensure: openDuty,
    loc: A => A.page.locator('input.tm:visible').first(),
    prev: A => A.page.locator('input.tm:visible').first().locator('xpath=preceding::input[1]'),
    prior: '0700', typed: '0800',
    expectText1: 'box holds only "0800"',
    expectLeave: '08:00', expectText2: 'shows 08:00 after leaving',
    persist: async A => { await closeDuty(); await openDuty(); return await A.val(A.page.locator('input.tm:visible').first()) },
    persistDid: 'closed the Duty templates window and opened it again',
    expectTextPersist: 'first Start still 08:00',
  })
  await openDuty()
  await runControl(A, { id: 'B1', name: 'Duty templates — the template name box (not on the list)', ensure: openDuty, loc: A => A.page.locator('input.tpl-name:visible').first(), prev: A => A.page.locator('.tpl-tab:visible').last(), prior: 'Standard' })
  await closeDuty()
}
if (!only || only === 'B2') {
  await openWave()
  const nb = A.page.locator('button:has-text("+ New wave template")').first()
  if (await nb.isVisible().catch(() => false)) { await nb.click(); await page.waitForTimeout(500) }
  await runBox(A, {
    id: 'B2', slug: 'wave-to', name: 'Admin → Wave templates (+ New wave template) → T/O',
    ensure: async A => { await openWave() },
    loc: A => A.page.locator('input.tm[placeholder="T/O"]:visible').first(),
    prev: A => A.page.locator('input.wmsn:visible').first(),
    prior: '0900', typed: '1000',
    expectText1: 'box holds only "1000"',
    expectLeave: '10:00', expectText2: 'shows 10:00 after leaving',
    persist: async A => {
      await closeWave(); await openWave()
      if (!(await A.page.locator('input.tm[placeholder="T/O"]:visible').count())) { await A.page.locator('.tpl-tab:has-text("New wave")').first().click().catch(() => {}); await A.page.waitForTimeout(400) }
      return await A.val(A.page.locator('input.tm[placeholder="T/O"]:visible').first())
    },
    persistDid: 'closed the Wave templates window, opened it again (and its tab)',
    expectTextPersist: 'T/O still 10:00',
  })
}
console.log('errors', A.errors)
await A.close()
