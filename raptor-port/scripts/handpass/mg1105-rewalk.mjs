// The member / guest check — the re-walk of what the fix touched (5 Nov 26): on the build WITH the fix (243e02c8f), a
// stranger asks for access through the real form, at both sizes, and the change-log batch saved with his request is read
// back from the browser's storage: it names his role, never his sign-in name; his request itself still names him (the
// admins read it on Admin → Users); and the guest page still opens.
// Usage (from raptor-port/): WALK_DIR=<frozen dist of the fix> MG_OUT=<folder> node scripts/handpass/mg1105-rewalk.mjs
import * as L from './mg1105-lib.mjs'
const { check } = L
for (const size of ['desktop', 'phone']) {
  const { page, tap } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(300)
  await L.signOut(page)
  await L.signIn(page, 'kite@mail', 'x')
  await page.fill('#accCs', 'Kite'); await page.fill('#accIni', 'KT')
  await page.selectOption('#accSeat', await page.locator('#accSeat option').evaluateAll(os => os.map(o => o.value).find(Boolean)))
  if (await page.locator('#accCat').count()) await page.selectOption('#accCat', await page.locator('#accCat option').evaluateAll(os => os.map(o => o.value).find(Boolean)))
  if (tap) await page.locator('#accSend').tap(); else await page.click('#accSend')
  await page.waitForTimeout(900)
  const got = await page.evaluate(() => {
    const out = { batches: [], request: null }
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i), v = localStorage.getItem(k)
      if (k.startsWith('raptor:changes/')) { try { const b = JSON.parse(v); if (b.type === 'access.request') out.batches.push(b) } catch {} }
      if (k.startsWith('raptor:settings/accessreq:')) out.request = v
    }
    return out
  })
  check(`RW-${size}-1`, 'the stranger\'s request is saved and names him (for the admins)', !!got.request && got.request.includes('kite@mail'), got.request && got.request.slice(0, 120))
  check(`RW-${size}-2`, 'its change-log batch names the role "pending", never his sign-in name', got.batches.length === 1 && got.batches[0].actorId === 'pending' && !JSON.stringify(got.batches[0]).includes('kite'), got.batches)
  await L.shot(page, `RW-${size}`, 'waiting-after-fix')
  if (tap) await page.locator('#accGuest').tap(); else await page.click('#accGuest')
  await page.waitForTimeout(800)
  check(`RW-${size}-3`, 'View the schedule still opens the guest page', await page.locator('#guestApp').isVisible(), true)
  await L.shot(page, `RW-${size}`, 'guest-after-fix')
}
await L.finish('rewalk')
