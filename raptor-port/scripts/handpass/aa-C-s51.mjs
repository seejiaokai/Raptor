// S51 - member and guest readers keep issued and working faces separate (phone 390x844, touch)
const C = await import('./aa-C-lib.mjs')
const { world, shot, sleep, go, fileInput, pubSat, closeBoard, editWeek, face, fs, cr, crS, signDay, pidOf, reanswer, closeWins, L } = C
const say = (k, v) => console.log(k, '::', typeof v === 'string' ? v : JSON.stringify(v))
const SAT = '2026-07-18', SUN = '2026-07-19', RMK = 'S51 event'
const w = await world({ width: 390, height: 844, mobile: true }); const { page } = w
const ranger = await pidOf(page, 'Ranger'), saber = await pidOf(page, 'Saber')
const day = async (sel, di) => page.evaluate(([s, i]) => { const d = document.querySelector(`${s} .day[data-day="${i}"]`); if (!d) return null
  return { tag: (d.querySelector('.verchip') || {}).innerText || '', text: d.innerText.replace(/\s+/g, ' ').slice(0, 0), pucks: [...d.querySelectorAll('.puck.allavail')].map(e => e.innerText.trim()), counts: [...d.querySelectorAll('.oilcount')].map(e => e.innerText.trim()),
    rows: [...d.querySelectorAll('.pl-row')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /event|S51/i.test(t)), selects: [...d.querySelectorAll('select')].map(s => s.className + ':' + [...s.options].map(o => (o.selected ? '*' : '') + o.text).join('/')), bar: [...d.querySelectorAll('.dprev-bar')].map(b => b.innerText.replace(/\s+/g, ' ')).join(' / ') } }, [sel, di])
try {
  await fileInput(page, { iso: SAT, kind: 'Event', person: 'allavail', s: '09:00', e: '12:00', rmk: RMK, oil: 'yes' })
  await fileInput(page, { iso: SUN, kind: 'Event', person: 'all', s: '09:00', e: '12:00', rmk: 'S51 sunday', oil: 'yes' })
  say('0 recs', await page.evaluate(() => window.INPUTS.filter(i => /S51/.test(i.remarks)).map(i => [i.type, i.person, i.date])))
  await go(page, 'editsched'); await pubSat(page, 5); await closeBoard(page)
  say('1 issued', fs(await face(page, 5))); say('1 credits (HO)', crS(await cr(page, SAT)))
  // change the working crowd (leave for Ranger) and the answer (No)
  await fileInput(page, { iso: SAT, kind: 'LL', person: ranger, rmk: 'S51 leave' })
  await reanswer(page, SAT, RMK, 'no')
  await go(page, 'editsched'); say('2 working face', fs(await face(page, 5))); say('2 credits (issued ½ still)', crS(await cr(page, SAT)))
  await shot(page, 'S51-01-admin-working')
  // the guest switch
  await go(page, 'admin'); await sleep(600)
  if (!(await page.locator('#admGuestView:visible').count())) { await page.getByText('Sign-in and roster').first().click(); await sleep(700) }
  const sw = page.locator('#admGuestView'); if (!(await sw.isChecked())) { await sw.check(); await sleep(400) }
  say('3 guest switch on', await sw.isChecked()); await shot(page, 'S51-02-guest-switch')
  // member: in place
  await page.evaluate(([r]) => { window.raptorRole('member'); window.raptorMe(r) }, [ranger]); await sleep(500)
  await go(page, 'viewsched'); await sleep(700)
  say('4 member Sat (issued default)', await day('#vWeek', 5)); await shot(page, 'S51-03-member-issued')
  const vw = page.locator('#vWeek .day[data-day="5"] select[data-vwork]').first()
  if (await vw.count()) {
    const val = await vw.evaluate(s => [...s.options].find(o => /Working/.test(o.text)).value)
    await vw.selectOption(val); await sleep(700)
    say('4 member Sat (working draft)', await day('#vWeek', 5)); await shot(page, 'S51-04-member-working')
    await vw.selectOption(await vw.evaluate(s => [...s.options][0].value)); await sleep(500)
  } else say('4 member: no working picker', 'absent')
  say('4 member Sun (unpublished)', await day('#vWeek', 6)); await shot(page, 'S51-05-member-sun')
  await page.evaluate(([s]) => { window.raptorMe(s); window.raptorRole('admin') }, [saber]); await sleep(400)
  // guest: sign out, sign in as a new account, request access, sign in again -> waiting view
  await L.go(page, 'editsched')
  let out = page.locator('button', { hasText: /^Logout$/ }).first()
  if (!(await out.isVisible().catch(() => false))) { await page.locator('#burger').click(); await sleep(500); out = page.locator('button:visible', { hasText: /^Logout$/ }).first() }
  await out.click(); await sleep(900)
  const signIn = async (n, p) => { await page.waitForSelector('#luser'); await page.fill('#luser', n); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]'); await sleep(900) }
  await signIn('guesty@mail', 'x')
  if (await page.locator('#accCs').count()) { await page.fill('#accCs', 'G'); await page.fill('#accIni', 'GUEST'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C'); await page.click('#accSend'); await sleep(500)
    await page.locator('#accOut, #guestOut, #logout').first().click().catch(() => {}); await sleep(700); await signIn('guesty@mail', 'x') }
  say('5 guest app drawn', await page.locator('#guestApp').count()); await shot(page, 'S51-06-guest-first')
  // some builds offer a button into the guest view on the waiting screen
  const gb = page.locator('button', { hasText: /guest view|view the schedule|view only/i }).first()
  if (!(await page.locator('#guestApp .day').count()) && await gb.count()) { await gb.click(); await sleep(700) }
  say('5 guest days', await page.locator('#guestApp .day').count())
  for (const di of [5, 6]) { say(`5 guest day ${di}`, await page.evaluate(i => { const d = document.querySelector(`#guestApp .day[data-day="${i}"]`); if (!d) return null
    return { tag: (d.querySelector('.verchip') || {}).innerText || '', pucks: [...d.querySelectorAll('.puck.allavail')].map(e => e.innerText.trim()), counts: [...d.querySelectorAll('.oilcount')].map(e => e.innerText.trim()), rows: [...d.querySelectorAll('.pl-row')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /event|S51/i.test(t)), selects: d.querySelectorAll('select').length, buttons: [...d.querySelectorAll('button')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 8), bar: [...d.querySelectorAll('.dprev-bar')].map(b => b.innerText.replace(/\s+/g, ' ')).join('/') } }, di)) }
  const d5 = page.locator('#guestApp .day[data-day="5"]').first()
  if (await d5.count()) { await d5.scrollIntoViewIfNeeded(); await shot(page, 'S51-07-guest-sat') }
  // tap the visible counts
  const cnt = page.locator('#guestApp .oilcount:visible')
  say('5 guest count elements', await cnt.count())
  if (await cnt.count()) { await cnt.first().scrollIntoViewIfNeeded(); await cnt.first().tap(); await sleep(700); say('5 guest after tap on count', await page.evaluate(() => ({ win: !!document.querySelector('.availwin'), oilp: document.querySelectorAll('.availwin [data-oilp]').length, tabs: [...document.querySelectorAll('.availwin button')].map(b => b.innerText.trim()), text: (document.querySelector('.availwin') || {}).innerText ? document.querySelector('.availwin').innerText.replace(/\s+/g, ' ').slice(0, 160) : null }))); await shot(page, 'S51-08-guest-count') }
  const pk = page.locator('#guestApp .puck.allavail:visible')
  if (await pk.count()) { await pk.first().tap(); await sleep(500); say('5 guest after tap on puck', await page.evaluate(() => ({ editor: !!document.querySelector('#inpEditPop:not([hidden])'), win: !!document.querySelector('.availwin'), oilconf: !!document.querySelector('[data-testid="oilconf"]') }))) }
  say('5 guest editor/working/pending controls', await page.evaluate(() => ({ vwork: document.querySelectorAll('#guestApp select[data-vwork]').length, dver: document.querySelectorAll('#guestApp select[data-dver]').length, pend: document.querySelectorAll('#guestApp [data-pendlist]').length, edit: document.querySelectorAll('#guestApp [data-slot], #guestApp [data-inpedit], #guestApp [data-oilp]').length })))
} catch (e) { say('STOPPED', e.message.split('\n')[0]); await shot(page, 'S51-ZZ-stopped') }
say('errors', w.errors); await w.browser.close()
