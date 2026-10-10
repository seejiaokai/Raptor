import * as L from './ivet-B-lib.mjs'
const { WIN, sleep } = L
const browser = await L.launch()

/* ===== 20 · desktop · admin Saber · ATT C and OML, no document ===== */
{
  const { ctx, page } = await L.open(browser, L.DESK, { fresh: true })
  const T = false
  L.scn(20, 'desktop 1440x900', 'admin Saber (own input)', 'ATT C and OML only')
  await L.guard(async () => {
    await L.toList(page, T)
    const dates = { 'ATT C': ['2026-08-03', '2026-08-04'], 'OML': ['2026-08-10', '2026-08-11'] }
    for (const [type, [d1, d2]] of Object.entries(dates)) {
      const tag = type.replace(' ', '')
      await L.plus(page, T)
      await page.selectOption('#inpEditType', type)
      await L.pick(page, d1, T); await L.pick(page, d2, T)
      const before = await L.count(page), had = await L.ids(page)
      await page.locator('#inpEditSave').click(); await sleep(400)
      const asked = await page.locator('[data-testid="docconf"]').count()
      const words = asked ? (await page.locator('[data-testid="docconf"]').innerText()).replace(/\s+/g, ' ') : ''
      const during = await L.count(page)
      await L.shot(page, `s20-${tag}-docquestion`)
      L.chk(`${type}: Add asks the document question before anything is saved`, asked === 1 && during === before, words)
      await page.locator('[data-testid="docconf-nodoc"]').click()
      await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
      await sleep(300)
      const made = await L.newest(page, had)
      const row = made[0] && await L.rowOf(page, made[0].iid)
      L.chk(`${type}: "No document" saves it, right kind and dates, no document attached`, made.length === 1 && made[0].type === type && made[0].cs === 'Saber' && made[0].date === (type === 'OML' ? 'Aug 10' : 'Aug 3') && made[0].endDate === (type === 'OML' ? 'Aug 11' : 'Aug 4') && made[0].docs === 0, JSON.stringify(made[0]))
      await L.shot(page, `s20-${tag}-saved-list`)
      // the window must not claim a document exists
      if (made[0]) {
        await page.locator(`#inBody tr[data-iid="${made[0].iid}"] [data-testid="in-open"]`).click(); await page.locator(WIN).waitFor()
        const w = await page.evaluate(() => ({ chips: document.querySelectorAll('[data-testid="win-inputedit"] .docchip, [data-testid="win-inputedit"] [data-doc], [data-testid="win-inputedit"] .docfield a').length, text: document.querySelector('[data-testid="win-inputedit"] .docfield')?.innerText.replace(/\s+/g, ' ') || '', allText: /certificate attached|1 document|2 document/i.test(document.querySelector('[data-testid="win-inputedit"]').innerText) }))
        await L.shot(page, `s20-${tag}-reopened`)
        L.chk(`${type}: the reopened window does not claim a document`, w.chips === 0 && !w.allText, JSON.stringify(w))
        const clip = await page.locator(`#inBody tr[data-iid="${made[0].iid}"] .rclip`).count()
        L.chk(`${type}: the row shows no paperclip`, clip === 0, 'clips ' + clip)
        await page.locator('#inpEditCancel').click()
      }
    }
  })
  await ctx.close()
}

/* ===== 21 · phone · admin Saber · Upload route ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { fresh: true, touch: true })
  const T = true
  L.scn(21, 'phone 390x844 (touch)', 'admin Saber (own input)')
  await L.guard(async () => {
    const pdf = L.makePdf('s21-cert-1.pdf', 'one'), pdf2 = L.makePdf('s21-cert-2.pdf', 'two')
    await L.toList(page, T)
    // route 1: Add first -> Upload -> attach -> Add
    await L.plus(page, T)
    await page.selectOption('#inpEditType', 'ATT C')
    await L.pick(page, '2026-08-17', T); await L.pick(page, '2026-08-18', T)
    await page.fill('#inpEditRmk', 'S21 remark kept')
    const before = await L.count(page), had = await L.ids(page)
    await page.locator('#inpEditSave').tap(); await sleep(400)
    await page.locator('[data-testid="docconf"]').waitFor({ timeout: 4000 })
    await L.shot(page, 's21-r1-question')
    await page.locator('[data-testid="docconf-upload"]').tap(); await sleep(400)
    const st = { n: await L.count(page), win: await page.locator(WIN).count(), type: await page.inputValue('#inpEditType'), rmk: await page.inputValue('#inpEditRmk'), q: await page.locator('[data-testid="docconf"]').count(), read: await page.locator('#inpEditPop .rc-read').textContent() }
    await L.shot(page, 's21-r1-after-upload-press')
    L.chk('Upload returns to the intact draft (nothing saved, type, remark and dates kept)', st.n === before && st.win === 1 && st.type === 'ATT C' && st.rmk === 'S21 remark kept' && st.q === 0 && /Aug 17/.test(st.read), JSON.stringify(st))
    await L.attach(page, pdf)
    const att = await page.evaluate(() => document.querySelector('[data-testid="win-inputedit"] .docfield')?.innerText.replace(/\s+/g, ' ') + ' | ' + document.querySelector('[data-testid="win-inputedit"] .docfield')?.parentElement?.innerText.replace(/\s+/g, ' ').slice(0, 200))
    await L.shot(page, 's21-r1-attached')
    L.chk('the attachment appears in the window before saving', /s21-cert-1|1 doc|\.pdf/i.test(att), att)
    await page.locator('#inpEditSave').tap(); await sleep(500)
    const loop = await page.locator('[data-testid="docconf"]').count()
    await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    await sleep(300)
    const made = await L.newest(page, had)
    L.chk('Add again saves with no second document question (no loop)', loop === 0 && made.length === 1 && made[0].type === 'ATT C' && made[0].docs === 1, JSON.stringify({ loop, made }))
    await L.shot(page, 's21-r1-saved-list')
    // opening the document from its normal viewing control: the phone's card has none; the Medical tab's card does
    {
      const cardCtl = await page.evaluate(iid => { const c = document.querySelector(`[data-testid="inl-row-${iid}"]`); return c ? c.querySelectorAll('.rclip, [data-docview]').length : -1 }, made[0].iid)
      L.info('the list card for the saved input has a paperclip/document control', String(cardCtl))
      // file a second medical entry (for Ranger, current as of the app's 13 Jul) with a document, to see it in the Medical tab
      const hadM = await L.ids(page)
      await L.plus(page, T)
      await page.selectOption('#inpEditType', 'ATT C'); await page.selectOption('#inpEditPerson', await L.csId(page, 'Ranger'))
      await L.pick(page, '2026-07-13', T); await L.pick(page, '2026-07-14', T)
      await L.attach(page, pdf)
      await page.locator('#inpEditSave').tap(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
      await sleep(300)
      const madeM = await L.newest(page, hadM)
      await page.locator('#inMedBtn').tap(); await sleep(1500)
      const card = page.locator(`[data-medcard="${madeM[0]?.iid}"]`)
      L.chk('the Medical tab lists the saved medical entry with its document control', (await card.count()) === 1, `docs ${madeM[0]?.docs}`)
      if (await card.count()) {
        const title = await card.getAttribute('title')
        await card.tap(); await sleep(900)
        await L.shot(page, 's21-r1-document-open')
        const open = await page.evaluate(() => ({ iframe: document.querySelectorAll('iframe, embed, object').length, wins: [...document.querySelectorAll('[data-testid^="win-"]')].map(w => w.dataset.testid), words: [...document.querySelectorAll('[data-testid^="win-"], .docview, [role=dialog]')].map(w => w.innerText.replace(/\s+/g, ' ').slice(0, 160)).join(' || ') }))
        L.chk('tapping the card opens the document (a viewer comes up)', open.iframe > 0 || open.wins.length > 0, JSON.stringify({ title, ...open }))
        await page.keyboard.press('Escape'); await sleep(300)
      }
    }
    // route 2: the document attached BEFORE the first Add
    await page.keyboard.press('Escape'); await L.toList(page, T, false)
    await L.plus(page, T)
    await page.selectOption('#inpEditType', 'ATT C')
    await L.pick(page, '2026-08-24', T); await L.pick(page, '2026-08-25', T)
    await L.attach(page, pdf2)
    const had2 = await L.ids(page)
    await L.shot(page, 's21-r2-attached-before')
    await page.locator('#inpEditSave').tap(); await sleep(500)
    const loop2 = await page.locator('[data-testid="docconf"]').count()
    await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    await sleep(300)
    const made2 = await L.newest(page, had2)
    L.chk('attached before the first Add: no document question, saved with 1 document', loop2 === 0 && made2.length === 1 && made2[0].docs === 1, JSON.stringify({ loop2, made2 }))
    await L.shot(page, 's21-r2-saved')
  })
  await ctx.close()
}
await browser.close()
L.save('s20-21')
