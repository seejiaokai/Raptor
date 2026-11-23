// r-p1 (chat 151, the re-walk) — a copy of p1-ranger-phone.mjs, changed only where fix 4 consumed its premise: one press outside
// the menu now closes only an open list, so each "close the menu" is made by presses outside until it is closed. The
// shade's own behaviour (and scenarios 17, 18 on the new flow) is walked by r-shade.mjs.
// p1 — phone (WebKit 402 × 874, touch): Astra's scenarios 13, 3, 4, 5 (phone), 17, 18 as Ranger, and 6 as Osprey.
// World: fresh demo data; Saber gives Ranger View of 149 (after 13) and Osprey View of 142, by Admin → Users presses.
import { serve, stop, newPage, signIn, as, step, rec, pic, picsFor, press, openMenu, closeMenuOutside, menuPick, go, grant, finish, note, facts, PICS } from './vlib.mjs'
import { shutMenu } from './r-lib.mjs'
console.log('r-p1-ranger-phone v1 (chat 151: the menu shut by as many outside presses as it takes — fix 4)')
picsFor('r-p1')
await serve()
try {
  const s = await newPage('p')
  const { page } = s
  await signIn(s, 'us', 'us')
  await step('S13 one squadron', async () => {
    await openMenu(s, 's13-01-open')
    await rec(s, 's13-a-menu'); await pic(s, 's13-01-menu')
    await press(s, '.drawer-sqn .mark', 's13-02-tap-mark')
    await rec(s, 's13-b-after-tap-mark'); await pic(s, 's13-02-after-tap-mark')
    await closeMenuOutside(s, 's13-03-close')
    await rec(s, 's13-c-closed')
    await openMenu(s, 's13-04-reopen')
    await rec(s, 's13-d-reopened'); await pic(s, 's13-04-reopened')
    await shutMenu(s)
  })
  await as(s, 'ad', 'a')
  await step('grants', async () => { await grant(s, 'bane', '149', 'view'); await grant(s, 'osp9', '142', 'view') })
  await as(s, 'us', 'us')
  await step('S3 pick inside the menu', async () => {
    await rec(s, 's3-a-start')
    await openMenu(s, 's3-01-open'); await pic(s, 's3-01-menu')
    await press(s, '#drawerSqnBtn', 's3-02-tap-mark')
    await rec(s, 's3-b-list-open'); await pic(s, 's3-02-list-open')
    /* the rows are drawn where the person cannot see them: the menu scrolled to its foot to picture where they are */
    await page.locator('#drawerSqnList .sqm-row').first().scrollIntoViewIfNeeded()
    await rec(s, 's3-c-scrolled-to-list'); await pic(s, 's3-03-menu-scrolled-to-list')
    await press(s, page.locator('#drawerSqnList .sqm-row[data-unit]', { has: page.locator('.sqm-num', { hasText: /^149$/ }) }).first(), 's3-04-pick149')
    await rec(s, 's3-d-after-pick'); await pic(s, 's3-04-after-pick-149')
    await page.evaluate(() => document.querySelector('#drawer .drawer-panel').scrollTo(0, 0))
    await pic(s, 's3-05-after-pick-panel-top')
  })
  await step('S4 home without reopening', async () => {
    await menuPick(s, '142', 's4-01')
    await rec(s, 's4-a-after-pick142'); await pic(s, 's4-01-after-pick-142')
    await press(s, '#drawerNav a[data-page="inputs"]', 's4-02-inputs')
    await rec(s, 's4-b-after-inputs'); await pic(s, 's4-02-inputs')
  })
  await step('S5 phone two pages work', async () => {
    await menuPick(s, '149', 's5-00')
    await rec(s, 's5-a-149'); await pic(s, 's5-00-149-picked')
    await press(s, '#drawerNav a[data-page="help"]', 's5-01-help')
    await rec(s, 's5-b-help'); await pic(s, 's5-01-help')
    await openMenu(s, 's5-02-open'); await rec(s, 's5-c-menu-on-help'); await pic(s, 's5-02-menu-on-help')
    await press(s, '#drawerNav a[data-page="viewsched"]', 's5-03-viewsched')
    await rec(s, 's5-d-viewsched'); await pic(s, 's5-03-viewsched')
    await go(s, 'help', 's5-04-help-again')
    await rec(s, 's5-e-help-again'); await pic(s, 's5-04-help-again')
    await go(s, 'viewsched')
  })
  await step('S17 outside presses', async () => {
    await openMenu(s)
    await press(s, '#drawerSqnBtn', 's17-01-mark')
    await rec(s, 's17-a-list-open')
    await page.touchscreen.tap(170, 640); await page.waitForTimeout(60); await page.screenshot({ path: `${PICS}/s17-02-tap-inside-blank-justtapped.png` })
    await page.waitForTimeout(450)
    await rec(s, 's17-b-after-tap-inside-blank'); await pic(s, 's17-02-after-tap-inside-blank')
    await press(s, '#drawerSqnBtn', 's17-03-mark-again')
    await rec(s, 's17-c-list-again')
    await closeMenuOutside(s, 's17-04-outside')
    await rec(s, 's17-d-after-outside'); await pic(s, 's17-04-after-outside')
    await shutMenu(s)   // chat 151: the second press outside (fix 4), so S18 starts from a closed menu as it did
  })
  await step('S18 close and reopen', async () => {
    await rec(s, 's18-a-start')
    await openMenu(s, 's18-01-open'); await rec(s, 's18-b-open'); await pic(s, 's18-01-menu')
    await press(s, '#drawerSqnBtn', 's18-02-mark'); await rec(s, 's18-c-list')
    await shutMenu(s); await rec(s, 's18-d-closed')
    await openMenu(s, 's18-03-reopen'); await rec(s, 's18-e-reopened'); await pic(s, 's18-03-reopened')
    await shutMenu(s)
  })
  await as(s, 'us9', 'us9')
  await step('S6 Osprey home is 149', async () => {
    await rec(s, 's6-a-start')
    await openMenu(s); await rec(s, 's6-b-menu-149'); await pic(s, 's6-01-menu-on-149')
    await menuPick(s, '142', 's6-02'); await rec(s, 's6-c-142'); await pic(s, 's6-02-after-pick-142')
    await menuPick(s, '149', 's6-03'); await rec(s, 's6-d-back-149'); await pic(s, 's6-03-after-pick-149')
    await shutMenu(s)
  })
  await s.ctx.close()
} finally { finish('r-p1'); await stop() }
