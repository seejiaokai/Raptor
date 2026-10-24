// M3 walk, walker B, part 6 — scenario 19 (the reload world, no ?fresh=1: every file and remark of 12, 14 and 15 still there after a reload)
// Run: node scripts/handpass/lw-m3-walk-b6.mjs   (SIZES=desk,phone env to narrow)
import { L, T, switchTo, setDoc, placeLeave, sleep, makeRunner, finish, chips, winText, rowHasFile, placeRange, inputsList, listRows, toWar } from './lw-m3-walk-b-h.mjs'
console.log('lw-m3-walk-b6 v1 — build addf330a5 on :4302')
const run = makeRunner(null)
const SIZES = process.env.SIZES ? process.env.SIZES.split(',') : ['desk', 'phone']
const URL_REAL = 'http://localhost:4302/'   // no ?fresh=1: the browser keeps the world
async function signInReal(w, who, today = '2026-01-05') {
  const { page } = w
  const [u, p] = who === 'admin' ? ['ad', 'a'] : ['us', 'us']
  await page.waitForSelector('#luser'); await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  if (who === 'member') await page.evaluate(t => window.lwSetMemberToday(t), today)
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForSelector(`[data-testid="row-${who === 'admin' ? 'stiff' : 'bane'}"]`)
  await sleep(w, 900)
}
const readMember = async w => {
  const out = {}
  await L.gotoMonth(w, 'JAN')
  await L.openCell(w, 'bane', '2026-01-14'); await sleep(w, 400)
  out.jan14 = { chips: await chips(w), remark: await w.page.locator(T('bid-remarks')).inputValue().catch(() => null), win: ((await winText(w)) || '').slice(0, 60) }
  await L.shot(w, `s19-${w.tagFor}-jan14`); w.pics.push(`s19-${w.tagFor}-jan14.png`)
  await L.closeAny(w)
  await L.gotoMonth(w, 'MAR')
  await L.openCell(w, 'bane', '2026-03-10'); await sleep(w, 400)
  out.mar10 = { id: (await L.sheetDump(w.page))?.id, chips: await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="closed-doc-row"] *')].filter(e => e.children.length === 0 && e.textContent.trim()).map(e => e.textContent.trim())), remark: await w.page.locator(T('closed-remarks')).inputValue().catch(() => null) }
  await L.shot(w, `s19-${w.tagFor}-mar10`); w.pics.push(`s19-${w.tagFor}-mar10.png`)
  await L.closeAny(w)
  return out
}
const readAdmin = async w => {
  const out = {}
  await inputsList(w, 'Ranger')
  const rows = await listRows(w)
  const r = rows.find(x => /20 Jan/.test(x.text) && /LL/.test(x.text))
  out.row = r ? r.text.replace(/\s+/g, ' ') : null
  out.hasFile = r ? await rowHasFile(w, r) : false
  out.remarkOnRow = /rmk19/.test(r?.text || '')
  await L.shot(w, `s19-${w.tagFor}-inputs`); w.pics.push(`s19-${w.tagFor}-inputs.png`)
  // open the file: the bytes must have survived
  if (r) {
    if (r.clip) await w.page.locator(`[data-iid="${r.iid}"] .rclip`).click()
    else { await w.page.locator(`[data-iid="${r.iid}"] [data-testid="inl-open"]`).first().click(); await sleep(w, 800); await w.page.locator('.inped-doc').first().click().catch(() => {}) }
    await sleep(w, 1000)
    out.img = await w.page.evaluate(() => { const i = [...document.querySelectorAll('img')].filter(e => e.getBoundingClientRect().width > 100).pop(); return i ? { w: i.naturalWidth, h: i.naturalHeight } : null })
    await L.shot(w, `s19-${w.tagFor}-viewer`); w.pics.push(`s19-${w.tagFor}-viewer.png`)
    await w.page.keyboard.press('Escape'); await sleep(w, 400)
  }
  return out
}

for (const size of SIZES) {
  console.log(`\n=== ${size} chromium (the reload world) ===`)
  const tag = `${size}-cr`
  const w = await L.newCtx(size)
  w.tagFor = tag; w.pics = []
  await run(19, size, w, async (w, S) => {
    await w.page.goto(URL_REAL)
    await w.page.waitForSelector('#luser')
    S.say('opened without ?fresh=1: ' + w.page.url())
    // ---- build the world through the app's own controls
    await signInReal(w, 'admin')
    await L.gotoMonth(w, 'JAN')
    S.ok(await placeRange(w, '2026-01-20', '2026-01-20', { remark: 'rmk19', doc: 'walk-b.png' }), '15: admin placed an approved LL with a file and a remark on 20 Jan')
    await switchTo(w, 'member')
    await L.gotoMonth(w, 'JAN')
    await L.openCell(w, 'bane', '2026-01-14')
    await setDoc(w)
    const rb = w.page.locator(T('bid-remarks')); await rb.fill('mem19'); await rb.press('Enter'); await sleep(w, 200)
    S.ok(await placeLeave(w, 'LL'), '12: member placed a pending LL with a file and the remark "mem19" on 14 Jan')
    await L.gotoMonth(w, 'MAR')
    await L.openCell(w, 'bane', '2026-03-10')
    S.ok(await placeLeave(w, 'LL'), '14: member placed a pending LL on 10 Mar')
    await switchTo(w, 'admin')
    await L.press(w, T('open-chip')); await sleep(w, 500)
    await L.press(w, T('od-month-2026-03')); await sleep(w, 500)
    await L.press(w, T('open-dates-close')); await sleep(w, 400)
    await switchTo(w, 'member')
    await L.gotoMonth(w, 'MAR')
    await L.openCell(w, 'bane', '2026-03-10'); await sleep(w, 400)
    S.ok((await L.sheetDump(w.page))?.id === 'closed-note', '14: 10 Mar is now closed for him (the closed-day note opens)')
    await setDoc(w, 'walk-b.pdf', '[data-testid="closed-doc-row"]')
    const rm = w.page.locator(T('closed-remarks')); await rm.fill('closed19'); await rm.press('Enter'); await sleep(w, 500)
    await L.closeAny(w)
    // ---- before the reload
    w.tagFor = tag + '-before'
    const mBefore = await readMember(w)
    S.say('member, before the reload: ' + JSON.stringify(mBefore))
    S.ok(mBefore.jan14.chips.some(t => /walk-b\.pdf/.test(t)) && mBefore.jan14.remark === 'mem19' && mBefore.mar10.chips.some(t => /walk-b\.pdf/.test(t)) && mBefore.mar10.remark === 'closed19', 'before the reload the member sees all four (12, 14)')
    await switchTo(w, 'admin')
    const aBefore = await readAdmin(w)
    S.say('admin, before the reload: ' + JSON.stringify(aBefore))
    S.ok(aBefore.hasFile && aBefore.remarkOnRow && aBefore.img?.w === 240, 'before the reload the admin sees the Inputs row with its file and remark, and the file opens (15)')
    await sleep(w, 1500)
    // ---- the reload
    await w.page.reload(); await w.page.waitForSelector('#luser'); await sleep(w, 800)
    S.say('reloaded; the sign-in page is back: ' + w.page.url())
    await signInReal(w, 'member')
    w.tagFor = tag + '-after'
    const mAfter = await readMember(w)
    S.say('member, after the reload: ' + JSON.stringify(mAfter))
    S.ok(mAfter.jan14.chips.some(t => /walk-b\.pdf/.test(t)), '12: after the reload the pending bid on 14 Jan still has its file: ' + JSON.stringify(mAfter.jan14.chips))
    S.ok(mAfter.jan14.remark === 'mem19', '12: and its remark: "' + mAfter.jan14.remark + '"')
    S.ok(mAfter.mar10.id === 'closed-note' && mAfter.mar10.chips.some(t => /walk-b\.pdf/.test(t)), '14: after the reload the closed-day bid on 10 Mar still has its file: ' + JSON.stringify(mAfter.mar10))
    S.ok(mAfter.mar10.remark === 'closed19', '14: and its remark: "' + mAfter.mar10.remark + '"')
    await switchTo(w, 'admin')
    const aAfter = await readAdmin(w)
    S.say('admin, after the reload: ' + JSON.stringify(aAfter))
    S.ok(aAfter.hasFile, '15: after the reload the approved leave\'s Inputs row still has its file: ' + aAfter.row)
    S.ok(aAfter.remarkOnRow, '15: and its remark "rmk19": ' + aAfter.row)
    S.ok(aAfter.img?.w === 240, '15: and the file still opens as the same picture (240 wide): ' + JSON.stringify(aAfter.img))
  })
  finish('b6-' + tag)
  await L.closeBrowser()
}
