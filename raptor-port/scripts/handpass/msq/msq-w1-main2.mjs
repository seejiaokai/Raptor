/* msq-w1-main2 v1 — S4 to S8 in one desktop world. usage: node scripts/handpass/msq/msq-w1-main2.mjs */
process.env.MSQ_WHO = 'w1'
process.env.MSQ_RUN = 'main2-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-w1-main2 v1 desktop')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
const swap = async user => { await X.signOut(w); await X.login(page, user) }
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
const hasT = async s => (await U.bodyText(page)).includes(s)

// ---- setup: publish days. 149 Fri17; 142 Wed15 + Thu16
await X.W.board(w, 4); const p149 = await X.L.publish(page, 4); say('PUB 149 Fri17', JSON.stringify(p149)); await X.W.closeBoard(w)
await swap('ad')
await X.W.board(w, 2); const p142a = await X.L.publish(page, 2); say('PUB 142 Wed15', JSON.stringify(p142a)); await X.W.closeBoard(w)
await X.W.board(w, 3); const p142b = await X.L.publish(page, 3); say('PUB 142 Thu16', JSON.stringify(p142b)); await X.W.closeBoard(w)
row('S5', 'desktop', 'setup: ad9 publishes 149 Fri 17 Jul; ad publishes 142 Wed 15 and Thu 16 Jul', 'RECORD published days', `149: ${JSON.stringify(p149)}; 142: ${JSON.stringify(p142a)} ${JSON.stringify(p142b)}`, 'RECORD', '')

// ---- S4: us9 files a leave in Dec 2026
await swap('us9')
await X.L.go(page, 'inputs'); await sleep(1200)
await safe('list', async () => { await page.getByRole('button', { name: /^\s*List/ }).first().click(); await sleep(700) })
await safe('new', async () => { await page.getByRole('button', { name: /\+ Input/ }).first().click(); await sleep(900) })
await X.pic(w, 's4-01-us9-new-input')
const pickers = await page.evaluate(() => [...document.querySelectorAll('select,input')].filter(e => e.offsetWidth > 0).map(e => (e.id || e.name || e.placeholder || e.tagName) + ':' + (e.tagName === 'SELECT' ? [...e.options].map(o => o.text).join('/') : e.value)).slice(0, 20))
say('NEW INPUT FIELDS', JSON.stringify(pickers))
await safe('type', async () => { await page.locator('#inpEditType').selectOption({ label: 'Other' }) })
await sleep(500)
await safe('month', async () => { for (let i = 0; i < 12; i++) { if (await page.locator('[data-iso="2026-12-10"]').count()) break; await page.getByRole('button', { name: '›' }).last().click(); await sleep(250) } })
await safe('day', async () => { await page.locator('[data-iso="2026-12-10"]').first().click(); await sleep(500) })
await X.pic(w, 's4-02-us9-filled')
await safe('add', async () => { await page.getByRole('button', { name: /^\s*Add\s*$/ }).first().click(); await sleep(1000) })
await X.pic(w, 's4-03-us9-after-add')
const tUs9 = await U.bodyText(page)
say('US9 text has Dec 10:', /10 Dec|Dec 10|Thu 10/.test(tUs9), 'Other:', /Other/.test(tUs9))
row('S4', 'desktop', 'us9 adds a leave / Other on Thu 10 Dec 2026', 'RECORD it is filed', 'after add the list reads: ' + tUs9.slice(0, 300), 'RECORD', 's4-02-us9-filled.png, s4-03-us9-after-add.png')
for (const u of ['us', 'ad', 'ad9']) {
  if (u !== 'ad9') { await swap(u) } else { await swap('ad9') }
  await X.L.go(page, 'inputs'); await sleep(1200)
  await safe('list', async () => { await page.getByRole('button', { name: /^\s*List/ }).first().click(); await sleep(700) })
  await safe('alldates', async () => { await page.getByRole('button', { name: /→/ }).first().click(); await sleep(600); await X.pic(w, `s4-03b-${u}-datepop`); await page.getByRole('button', { name: /All dates/ }).first().click(); await sleep(800) })
  const t = await U.bodyText(page)
  await X.pic(w, `s4-04-${u}-inputs`)
  const sees = /Osprey/.test(t) && /10 Dec|Dec 10|Thu 10/.test(t)
  const exp = u === 'ad9' ? 'sees the new input' : 'does not see it'
  row('S4', 'desktop', `${u} opens Inputs list`, exp, `Osprey+10 Dec seen: ${sees}; text: ${t.slice(0, 250)}`, (u === 'ad9') === sees ? 'PASS' : 'FAIL', `s4-04-${u}-inputs.png`)
}

// ---- S5: holiday form sentences as ad9
async function openHolForm() {
  await X.L.go(page, 'leavewar'); await sleep(2200)
  await page.locator('[data-testid="settings-open"]').click(); await sleep(600)
  await page.locator('[data-testid="settings-days"]').click(); await sleep(900)
  await page.locator('[data-testid="hol-add"]').click(); await sleep(700)
}
async function gotoMonth(iso) { for (let i = 0; i < 14; i++) { if (await page.locator(`[data-testid="holcal-day-${iso}"]`).count()) return; await page.locator('[data-testid="holcal-prev"]').click(); await sleep(200) } }
async function pick(a, b) { await gotoMonth(a); await page.locator(`[data-testid="holcal-day-${a}"]`).click(); await sleep(300); if (b && b !== a) await page.locator(`[data-testid="holcal-day-${b}"]`).click(); await sleep(500) }
const formTxt = async () => (await U.bodyText(page)).replace(/.*Dates/, '')
const sentence = t => (t.match(/This puts[^.]*\.[^.]*\./) || ['(no sentence)'])[0]
for (const [id, a, b, exp] of [
  ['a', '2026-07-15', '2026-07-15', "This puts a published day out of date: 142's Wed 15 Jul. Publish it again so OIL is earned."],
  ['b', '2026-07-15', '2026-07-16', "This puts published days out of date: 142's Wed 15 Jul and Thu 16 Jul. Publish them again so OIL is earned."],
  ['c', '2026-07-15', '2026-07-17', "142's Wed 15 Jul and Thu 16 Jul; 149's Fri 17 Jul"]]) {
  await swap('ad9')
  await safe('form' + id, async () => {
    await openHolForm(); await page.locator('[data-testid="hol-kind-ph"]').click(); await page.locator('[data-testid="hol-name"]').fill('W5 test'); await pick(a, b)
    await X.pic(w, `s5-${id}-form`)
    const s = sentence(await formTxt())
    const ok = id === 'c' ? s.includes("142's Wed 15 Jul and Thu 16 Jul") && s.includes("149's Fri 17 Jul") && s.includes('; ') : s === exp
    row('S5', 'desktop', `ad9 Holidays + Add, Public holiday, dates ${a}..${b}, not saved`, exp, s, ok ? 'PASS' : 'FAIL', `s5-${id}-form.png`)
    if (id === 'c') {
      await page.locator('[data-testid="hol-kind-off"]').click(); await sleep(500); await X.pic(w, 's5-d-offday')
      const s2 = sentence(await formTxt())
      row('S5', 'desktop', '(d) same dates, kind switched to Off day', 'RECORD whether the sentence goes', s2, 'RECORD', 's5-d-offday.png')
    }
    await page.locator('[data-testid="hol-cancel"]').click(); await sleep(600)
    await X.pic(w, `s5-${id}-after-cancel`)
  })
}

// ---- S6
await swap('ad9')
await safe('s6', async () => {
  await openHolForm(); await page.locator('[data-testid="hol-kind-ph"]').click(); await page.locator('[data-testid="hol-name"]').fill('W149 PH'); await page.locator('[data-testid="hol-short"]').fill('WPH'); await pick('2026-12-09', '2026-12-09')
  await X.pic(w, 's6-01-ad9-form')
  await page.locator('[data-testid="hol-save"]').click(); await sleep(1200)
  await X.pic(w, 's6-02-ad9-after-save')
  const t = await U.bodyText(page)
  row('S6', 'desktop', 'ad9 saves public holiday W149 PH on Wed 9 Dec 2026', 'RECORD what the app says', t.slice(0, 300) + ' | has W149 PH: ' + t.includes('W149 PH'), 'RECORD', 's6-01-ad9-form.png, s6-02-ad9-after-save.png')
})
await X.L.go(page, 'leavewar'); await sleep(2200)
await X.pic(w, 's6-03-ad9-grid')
const g9 = await U.bodyText(page); say('149 grid has WPH:', g9.includes('WPH'))
await swap('ad'); await X.L.go(page, 'leavewar'); await sleep(2200)
await X.pic(w, 's6-04-ad-grid')
const g2 = await U.bodyText(page)
row('S6', 'desktop', "ad looks at 142's Leave War grid for Wed 9 Dec", 'shows the same holiday (WPH / W149 PH)', `WPH: ${g2.includes('WPH')}; W149 PH: ${g2.includes('W149 PH')}`, g2.includes('WPH') || g2.includes('W149 PH') ? 'PASS' : 'FAIL', 's6-04-ad-grid.png')
await safe('s6b', async () => {
  await page.locator('[data-testid="settings-open"]').click(); await sleep(600); await page.locator('[data-testid="settings-days"]').click(); await sleep(900)
  const lt = await U.bodyText(page); await X.pic(w, 's6-05-ad-holiday-list')
  say('AD HOLIDAY LIST has W149 PH:', lt.includes('W149 PH'))
  await page.locator('[data-testid="hol-add"]').click(); await sleep(600)
  await page.locator('[data-testid="hol-kind-off"]').click(); await page.locator('[data-testid="hol-name"]').fill('W142 OFF'); await page.locator('[data-testid="hol-short"]').fill('WOF'); await pick('2026-12-11', '2026-12-11')
  await X.pic(w, 's6-06-ad-off-form')
  await page.locator('[data-testid="hol-save"]').click(); await sleep(1200)
  await X.pic(w, 's6-07-ad-after-off')
  row('S6', 'desktop', 'ad adds Off day W142 OFF on Fri 11 Dec; reads the holiday list for W149 PH', 'RECORD', `list shows W149 PH: ${lt.includes('W149 PH')}; after save text: ${(await U.bodyText(page)).slice(0, 200)}`, 'RECORD', 's6-05-ad-holiday-list.png, s6-07-ad-after-off.png')
})
await swap('ad9'); await X.L.go(page, 'leavewar'); await sleep(2200)
await X.pic(w, 's6-08-ad9-grid-after-off')
const g3 = await U.bodyText(page)
row('S6', 'desktop', "ad9 looks at 149's grid after ad added Off day W142 OFF", 'does NOT show W142 OFF / WOF', `WOF: ${g3.includes('WOF')}; W142 OFF: ${g3.includes('W142 OFF')}; WPH still: ${g3.includes('WPH')}`, !g3.includes('WOF') && !g3.includes('W142 OFF') ? 'PASS' : 'FAIL', 's6-08-ad9-grid-after-off.png')

// ---- S7 bell
const bellSel = '#bellBtn, [data-testid*="bell" i], button[aria-label*="ell" i], button[aria-label*="otif" i], button[title*="ell" i], button[title*="otif" i]'
for (const u of ['ad', 'ad2', 'ad9']) {
  await swap(u); await sleep(600)
  await safe('bell' + u, async () => {
    const n = await page.locator(bellSel).count(); say('BELL count', u, n)
    await page.locator(bellSel).first().click(); await sleep(900)
    await X.pic(w, `s7-${u}-bell`)
    const t = await U.bodyText(page)
    row('S7', 'desktop', `${u} opens the bell`, 'RECORD every line; no other squadron\'s input line', t.slice(0, 600), 'RECORD', `s7-${u}-bell.png`)
    await page.keyboard.press('Escape'); await sleep(300)
  })
}

// ---- S8
await swap('ad9')
await X.L.go(page, 'editsched'); await sleep(600)
await page.reload(); await sleep(2500)
await safe('relog', async () => { if (await page.locator('#luser').count()) await X.login(page, 'ad9') })
await X.L.go(page, 'editsched'); await sleep(1000)
await X.pic(w, 's8-01-ad9-after-reload')
const tr = await U.bodyText(page)
const g149 = await safe('gr', () => U.groundNames(page, 2))
say('RELOAD ground Wed15', JSON.stringify(g149))
row('S8', 'desktop', 'ad9 reloads the page', 'W149 GROUND present or world intact; holiday still there', `signed in: ${!(await page.locator('#luser').count())}; Wed15 ground rows: ${JSON.stringify(g149)}`, 'RECORD', 's8-01-ad9-after-reload.png')
await X.L.go(page, 'leavewar'); await sleep(2200); await X.pic(w, 's8-02-ad9-grid-after-reload')
row('S8', 'desktop', 'ad9 reload: grid still shows holiday WPH', 'still there', `WPH: ${(await U.bodyText(page)).includes('WPH')}`, (await U.bodyText(page)).includes('WPH') ? 'PASS' : 'FAIL', 's8-02-ad9-grid-after-reload.png')
const p2 = await w.ctx.newPage()
await p2.goto(page.url()); await sleep(2500)
await safe('p2', async () => {
  await X.login(p2, 'ad'); await X.L.go(p2, 'leavewar'); await sleep(2200)
  const t2 = (await U.bodyText(p2))
  await p2.screenshot({ path: X.SHOTS + '/s8-03-second-tab-ad-grid.png' }).catch(() => {})
  row('S8', 'desktop', 'second tab, same storage: sign in as ad, Leave War', "142's world as left: WPH shown (shared), WOF shown", `WPH: ${t2.includes('WPH')}; WOF: ${t2.includes('WOF')}`, 'RECORD', 's8-03-second-tab-ad-grid.png')
})
await p2.close().catch(() => {})
await X.fin(w)
