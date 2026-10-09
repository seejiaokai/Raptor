import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDate, readDayWin, press, isTouch, lwMonth } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const size = process.argv[2] || 'desk'
const L = (...a) => console.log(size, ...a)
async function audit(page, tag) {
  const ISO = '2026-07-15'
  await backToSans(page, size)
  L(tag, 'SANS month read:', JSON.stringify(await readDate(page, ISO)), '| gear', await tid(page, 'sc-gear').count())
  if (!(await tid(page, 'win-sansday').count())) { await press(size, cell(page, ISO), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor() }
  await page.waitForTimeout(300)
  const w = await readDayWin(page)
  L(tag, 'day reads:', w.work.slice(0, 90), '| add disabled', await tid(page, 'sd-add').isDisabled(), '| why:', await tid(page, 'sd-addwhy').innerText().catch(() => null), '| Calendar… (sd-days)', await tid(page, 'sd-days').count())
  await shot(page, `h08-${size}-${tag}-sansday`)
  await tid(page, 'win-sansday-x').click().catch(() => {})
  // the Inputs tab's tools
  await page.evaluate(() => window.go('inputs')); await page.click('#inMemberMode'); await page.waitForTimeout(500)
  L(tag, 'INPUTS tools:', await page.evaluate(() => [...document.querySelectorAll('#inpCal button, .ic-tools button, #page-inputs button, .inputs-tools button')].filter(b => b.offsetParent).map(b => (b.id || b.getAttribute('data-testid') || b.className.split(' ')[0]) + ':' + (b.getAttribute('aria-label') || b.innerText.replace(/\s+/g, ' ').trim()).slice(0, 18)).slice(0, 30).join(' | ')))
  await shot(page, `h08-${size}-${tag}-inputs`)
  // the Leave War
  await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid="row-slipway"]'); await page.waitForTimeout(400)
  const iso = '2026-07-27'; await lwMonth(page, iso)
  const rc = tid(page, 'req-p-' + iso); await rc.waitFor({ state: 'attached' }); await rc.scrollIntoViewIfNeeded(); await page.waitForTimeout(200)
  await press(size, rc); await page.waitForTimeout(400)
  L(tag, 'LW Required cell tapped -> editor box', await tid(page, 'fly-edit-input').count(), 'pad', await tid(page, 'fly-pad').count(), 'working', await tid(page, 'fly-working').count(), (await tid(page, 'fly-working').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 80))
  await page.keyboard.type('55').catch(() => {}); await page.keyboard.press('Enter').catch(() => {}); await page.waitForTimeout(300)
  L(tag, '  typed 55 -> Required cell now reads:', (await rc.innerText().catch(() => '?')).trim(), '| flyAnswer req', JSON.stringify(await page.evaluate(i => window.flyAnswer(i).req, iso)))
  await shot(page, `h08-${size}-${tag}-lw-req`)
  await page.keyboard.press('Escape').catch(() => {})
  const nm = tid(page, 'fly-name-avail-p'); await nm.scrollIntoViewIfNeeded().catch(() => {}); await press(size, nm).catch(e => L('name tap err', String(e).slice(0, 80))); await page.waitForTimeout(400)
  L(tag, 'LW Available name tapped -> counter-form', await tid(page, 'counter-form').count(), '| settings gear', await tid(page, 'settings-open').count(), '| working', await tid(page, 'fly-working').count())
  await shot(page, `h08-${size}-${tag}-lw-name`)
  await page.keyboard.press('Escape').catch(() => {})
  // the Logic page
  await page.evaluate(() => window.go('logic')); await page.waitForTimeout(800)
  const rows = await page.evaluate(() => { const out = []; for (const re of [/A member.s input is due/, /has a deadline of its own/, /Members may file duties and commitments/]) { const e = [...document.querySelectorAll('*')].filter(x => re.test(x.textContent) && x.children.length < 20).sort((a, b) => a.textContent.length - b.textContent.length)[0]; if (!e) { out.push({ re: String(re), found: false }); continue } let r = e; for (let i = 0; i < 4 && r.parentElement && r.querySelectorAll('button').length === 0; i++) r = r.parentElement; out.push({ re: String(re).slice(1, 24), text: e.textContent.replace(/\s+/g, ' ').slice(0, 110), buttons: [...r.querySelectorAll('button')].map(b => b.innerText.trim()).slice(0, 4) }) } return out })
  L(tag, 'LOGIC rows:', JSON.stringify(rows))
  await shot(page, `h08-${size}-${tag}-logic`)
}
{
  const { ctx, page, errors } = await world(browser, size, 'us')
  L('--- Ranger (member, not SANS): is SANS?', await page.evaluate(() => { const P = window.PEOPLE; const id = Object.keys(P).find(k => P[k].cs === 'Ranger'); return P[id].san })) 
  await audit(page, 'ranger')
  console.log(errors.join('|')); await ctx.close()
}
{
  const { ctx, page, errors } = await world(browser, size, 'ad')
  await press(size, page.locator('#roleBadge')).catch(async () => { await page.evaluate(() => document.querySelector('#roleBadge').click()) })
  await page.waitForTimeout(500)
  L('--- Saber member view: badge says', await page.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText))
  await audit(page, 'sabermember')
  console.log(errors.join('|')); await ctx.close()
}
await browser.close()
