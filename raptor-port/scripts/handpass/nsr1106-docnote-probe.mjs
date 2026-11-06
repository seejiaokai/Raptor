// [NOTSAVED-REFUSAL-LOOK] the walk's side question: on the phone run (WebKit) the document note was heard in a scene that
// added no document. When does it come, and on which engine? Reads the notes heard from the start, at each step.
// Usage (from raptor-port/): WALK_DIR=dist MG_OUT=<folder> node scripts/handpass/nsr1106-docnote-probe.mjs
import * as L from './mg1105-lib.mjs'
for (const size of ['desktop', 'phone']) {
  const { page } = await L.open(size)
  const at = async (step) => L.note(`${size} ${step}`, await page.evaluate(() => window.__notes.slice()))
  await at('sign-in screen')
  await L.signIn(page, 'us', 'us'); await at('signed in')
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(1500); await at('leave war')
  await page.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await page.waitForTimeout(500); await at('lwSetRole admin')
  await page.locator('[data-testid="lw-tab-balances"]').first().click().catch(() => {}); await page.waitForTimeout(800); await at('balances')
  await page.context().close()
}
console.log('errors', L.errs)
process.exit(0)
