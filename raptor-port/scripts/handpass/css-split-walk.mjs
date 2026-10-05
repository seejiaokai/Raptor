/* CSS-SPLIT-BY-SCREEN: production-bundle walk through actual UI doors.
   CSS_WALK_RUN is a fresh evidence name; baseline and after use the same controls.
   No fixture/state injection and no app stylesheet overrides. */
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { buildSaturday } from './fixture.mjs'

const base = process.env.HP_URL || 'http://localhost:4230'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname))
const run = process.env.CSS_WALK_RUN
assert.ok(run && /^[a-z0-9-]+$/.test(run), 'Choose a fresh CSS_WALK_RUN')
const out = `docs/handpass/css-split/${run}`
assert.ok(!existsSync(out) || process.env.CSS_WALK_RESUME === '1', 'Never overwrite a previous walk')
mkdirSync(out, { recursive: true })
const report = process.env.CSS_WALK_RESUME === '1' ? JSON.parse(readFileSync(`${out}/result.json`,'utf8')) : { base, run, pictures: [], surfaces: [], orders: [], errors: [], limitations: ['Chromium phone emulation, not a physical phone.'] }
if(report.failure){(report.previousFailures ||= []).push(report.failure);delete report.failure;delete report.status}
const flush = () => writeFileSync(`${out}/result.json`, JSON.stringify(report, null, 2))
const chrome = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(chrome) ? { executablePath: chrome } : {}) })
const settle = page => page.waitForTimeout(250)
async function hit(page, selector) {
  const loc = typeof selector === 'string' ? page.locator(selector).first() : selector
  await loc.waitFor({ state: 'visible' }); await loc.scrollIntoViewIfNeeded()
  assert.ok(await loc.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return h === e || e.contains(h) }), `Covered target: ${selector}`)
  await loc.click(); await settle(page)
}
async function login(page, user = 'ad', pass = 'a') {
  await page.locator('#luser').fill(user); await page.locator('#lpass').fill(pass)
  await hit(page, '#loginForm button[type=submit]')
}
async function nav(page, to) {
  if (await page.locator('#burger').isVisible()) {
    await hit(page, '#burger'); await hit(page, `#drawerNav [data-page="${to}"]`)
  } else await hit(page, `#topnav [data-page="${to}"]`)
  await page.locator(`#page-${to}.on`).waitFor(); await settle(page)
}
async function logout(page) {
  if (await page.locator('#accOut').isVisible()) await hit(page, '#accOut')
  else if (await page.locator('#burger').isVisible()) { await hit(page, '#burger'); await hit(page, '#drawerLogout') }
  else await hit(page, '#logout')
  await page.locator('#login').waitFor()
}
async function shot(page, name, root = 'body') {
  const path = `${out}/${name}.png`
  if(report.pictures.includes(path))return // Resume keeps the original captured evidence.
  await page.screenshot({ path, fullPage: false, animations: 'disabled' })
  // One sample per tag/class group: colours, layout and stacking, including pseudos.
  // Volatile text, clocks and element counts are deliberately not CSS evidence.
  const styles = await page.locator(root).evaluate(root => {
    const props = ['display','position','z-index','color','background-color','border-color','border-width','border-radius','font-family','font-size','font-weight','line-height','padding','margin','gap','grid-template-columns','flex-direction','flex-wrap','overflow-x','overflow-y','max-height','min-height','box-shadow','opacity','pointer-events','visibility','touch-action','white-space']
    const groups = new Map()
    for (const e of [root, ...root.querySelectorAll('*')]) {
      const r = e.getBoundingClientRect()
      if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue
      const key = e.tagName + '.' + [...e.classList].sort().join('.')
      if (groups.has(key)) continue
      const s = getComputedStyle(e), values = Object.fromEntries(props.map(p => [p, s.getPropertyValue(p)]))
      for (const pseudo of ['::before','::after']) { const ps = getComputedStyle(e,pseudo); if (ps.content !== 'none') values[pseudo] = [ps.content, ps.color, ps.backgroundColor, ps.position, ps.zIndex] }
      groups.set(key, values)
    }
    return Object.fromEntries([...groups].sort(([a],[b]) => a.localeCompare(b)))
  })
  report.pictures.push(path); report.surfaces.push({ name, root, viewport: page.viewportSize(), styles }); flush()
  console.log('PICTURE', name)
}
async function modal(page, name, open, root, close) {
  await hit(page, open); await page.locator(root).waitFor({ state: 'visible' }); await shot(page, name, root)
  await hit(page, close); await page.locator(root).waitFor({ state: 'hidden' })
}
async function role(page) {
  if (await page.locator('#burger').isVisible()) { await hit(page, '#burger'); await hit(page, '#drawerRole') }
  else await hit(page, '#roleBadge')
}

try {
  for (const [kind,width,height] of [['desktop',1600,900],['phone',390,844]]) {
    if(report.pictures.includes(`${out}/${kind}-guest-schedule.png`))continue
    const ctx = await browser.newContext({ viewport: { width,height } }), page = await ctx.newPage()
    page.on('pageerror', e => report.errors.push(`${kind}: ${e.message}`))
    page.on('console', m => { if (m.type() === 'error') report.errors.push(`${kind}: ${m.text()}`) })
    await page.goto(base + '/?fresh=1'); await shot(page, `${kind}-sign-in`, '#login')
    await login(page); await page.locator('#vWeek .day').first().waitFor({ state:'attached' })
    const accessOnly=report.pictures.includes(`${out}/${kind}-member-drawer.png`)
    if(!accessOnly){
    console.log('FIXTURE', kind); report.orders.push({ name:`${kind}-everything-day`, facts:await buildSaturday(page) })
    await hit(page, '#sbDone'); await page.locator('#schedBoard').waitFor({ state:'hidden' })
    for (const to of ['viewsched','editsched','inputs','quals','logic','leavewar','tracker','help','admin']) {
      await nav(page,to); await shot(page,`${kind}-admin-${to}`,`#page-${to}`)
      // Reach the lower part as well; viewport pictures stay readable.
      if (['logic','quals','help','leavewar'].includes(to)) {
        await page.locator(`#page-${to}`).evaluate(e => { const s = e.querySelector('.lw-scroll, .logic-body, .qual-body'); if (s) s.scrollTop=s.scrollHeight; window.scrollTo(0,document.body.scrollHeight) })
        await settle(page); await shot(page,`${kind}-admin-${to}-lower`,`#page-${to}`); await page.evaluate(()=>window.scrollTo(0,0))
      }
    }
    for (const [i,cat] of ['users','config','data'].entries()) {
      if (width<701 && i) await hit(page,'.adm-back')
      await hit(page,page.locator('.adm-cat').nth(i)); await shot(page,`${kind}-admin-${cat}`,`#adm${cat[0].toUpperCase()+cat.slice(1)}`)
      if (cat==='config') for (const [label,open,root,close] of [
        ['duty-templates','#admDutyTpl','#tplModal','#tplClose'],['day-templates','#admDayTpl','#daytplModal','#daytplClose'],['wave-templates','#admWaveTpl','#waveTplModal','#waveTplClose']
      ]) await modal(page,`${kind}-${label}`,open,root,close)
    }
    await nav(page,'inputs')
    await hit(page,'#inRangeBtn'); await shot(page,`${kind}-inputs-period`,'#inRangePop'); await hit(page,'#inRangeAll')
    if (await page.locator('[data-edit]:visible').count()) {
      await hit(page,'[data-edit]:visible'); await shot(page,`${kind}-input-inline-editor`,'#page-inputs'); await hit(page,'[data-cancel]:visible')
    }
    await hit(page,'#inCalBtn'); await shot(page,`${kind}-inputs-calendar`,'#inpCal'); await hit(page,'#icClose')
    await hit(page,'#inMedBtn'); await shot(page,`${kind}-medical`,'#medView'); await hit(page,'#medCalBtn'); await shot(page,`${kind}-medical-calendar`,'#medView'); await hit(page,'[data-medday].on'); await hit(page,'#medClose')
    await nav(page,'viewsched')
    if (width<701) {
      await hit(page,'#burger'); await shot(page,`${kind}-drawer`,'#drawer'); await hit(page,'#drawerPickWeek')
    } else await hit(page,'#weekSeg .wk-cal')
    await shot(page,`${kind}-week-calendar`,'#weekCal'); await hit(page,'#weekCal .x')
    if (width<701) { await hit(page,'#burger'); await hit(page,'#drawerInsights') } else await hit(page,'#insightBtn')
    await shot(page,`${kind}-week-insights`,'#insightModal'); await hit(page,'#insightClose')
    await nav(page,'editsched'); await hit(page,'#eWeek [data-sbday="5"]:visible'); await shot(page,`${kind}-board`,'#schedBoard')
    if (width<821) { await hit(page,'#sbMore'); await shot(page,`${kind}-board-more`,'#schedBoard'); await hit(page,'#sbMoreWide') }
    if(width<821)await shot(page,`${kind}-board-wide`,'#schedBoard')
    if (width<821) { await hit(page,'#sbMore'); await hit(page,'#sbMoreWide'); await hit(page,'#sbHl'); await shot(page,`${kind}-board-highlight`,'#schedBoard'); await hit(page,'#sbMore'); await hit(page,'#sbMoreInsights') }
    else await hit(page,'#sbInsights')
    await shot(page,`${kind}-board-insights`,'#insightModal'); await hit(page,'#insightClose')
    await modal(page,`${kind}-traffic`,'#sbBoard [data-air]:visible','#airpop','#airClose')
    await hit(page,'#sbHist'); await shot(page,`${kind}-changes`,'#schedBoard'); await hit(page,'.chgwin .win-x')
    const oilDoor=width<821?'#sbBoard [data-oilmode="5"]':'#sbOil'
    await hit(page,oilDoor); await shot(page,`${kind}-oil-board`,'#schedBoard'); await hit(page,oilDoor)
    await hit(page,'#sbDone')
    await role(page)
    for (const to of ['viewsched','inputs','quals','logic','leavewar','tracker','help']) { await nav(page,to); await shot(page,`${kind}-member-${to}`,`#page-${to}`) }
    if(width<701){await hit(page,'#burger');assert.equal(await page.locator('#drawerNav [data-page=admin]').count(),0);assert.equal(await page.locator('#drawerNav [data-page=editsched]').count(),0);await shot(page,`${kind}-member-drawer`,'#drawer');await hit(page,'#drawerRole')}
    else {assert.equal(await page.locator('#topnav [data-page=admin]').isVisible(),false);assert.equal(await page.locator('#topnav [data-page=editsched]').isVisible(),false);await role(page)}
    }
    // Access lifecycle and guest are set up through production account controls.
    await nav(page,'admin'); if(width<701)await hit(page,page.locator('.adm-cat').first())
    await page.locator('#admGuestView').setChecked(false)
    await hit(page,page.locator('.acc-row[data-acct] .acc-main').filter({hasText:'us'}).first()); await hit(page,'#accEdOnOff')
    await logout(page); await login(page,'us','us'); await page.locator('#accessOff').waitFor(); await shot(page,`${kind}-suspended`,'#accessOff'); await logout(page)
    await login(page,`csswalk-${kind}@example.test`,'any'); await page.locator('#accessRequest').waitFor(); await shot(page,`${kind}-request-access`,'#accessRequest')
    await page.locator('#accCs').fill('CSS WALK'); await page.locator('#accSeat').selectOption('GND'); await hit(page,'#accSend'); await page.locator('#accessWaiting').waitFor(); await shot(page,`${kind}-waiting-access`,'#accessWaiting'); await logout(page)
    await login(page); await nav(page,'admin'); if(width<701)await hit(page,page.locator('.adm-cat').first()); await page.locator('#admGuestView').setChecked(true)
    await logout(page); await login(page,`csswalk-${kind}@example.test`,'any')
    if(await page.locator('#accGuest').isVisible())await hit(page,'#accGuest')
    await page.locator('#vWeek').waitFor(); await shot(page,`${kind}-guest-schedule`,'#page-viewsched')
    report.orders.push({name:`${kind}-account-and-role-doors`,status:'PASS'})
    await ctx.close(); flush()
  }
  assert.deepEqual(report.errors,[],'Browser errors')
  report.status='PASS'; flush()
} catch(e) {report.status='FAIL';report.failure=String(e);flush();throw e}
finally {await browser.close()}

if (process.env.CSS_WALK_COMPARE) {
  const before=JSON.parse(readFileSync(`docs/handpass/css-split/${process.env.CSS_WALK_COMPARE}/result.json`,'utf8'))
  const differences=[]
  assert.deepEqual(report.surfaces.map(s=>s.name),before.surfaces.map(s=>s.name),'Same complete surface list')
  for(let i=0;i<report.surfaces.length;i++) {
    const a=before.surfaces[i],b=report.surfaces[i]
    if(JSON.stringify(a.styles)!==JSON.stringify(b.styles))differences.push(b.name)
  }
  writeFileSync(`${out}/style-comparison.json`,JSON.stringify({before:before.run,after:run,differences},null,2))
  if(differences.length){report.status='FAIL';report.failure='Computed styles changed: '+differences.join(', ');flush()}
  assert.deepEqual(differences,[],'Computed styles changed')
}
