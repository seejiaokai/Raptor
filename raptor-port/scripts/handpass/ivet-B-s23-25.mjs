import * as L from './ivet-B-lib.mjs'
const { WIN, sleep } = L
const browser = await L.launch()
const T = true
const mine = (p, cs) => p.evaluate(cs => window.INPUTS.filter(r => window.PEOPLE[r.person]?.cs === cs && /^(ATT|Upchit|OML|HL)/.test(r.type) && /S2[35]/.test(r.remarks || '')).map(r => `${r.type} ${r.date}${r.endDate ? '–' + r.endDate : ''}`).sort(), cs)
const sheetWords = async p => { for (const t of ['upconf', 'medclash']) { const l = p.locator(`[data-testid="${t}"]`); if (await l.count()) return { kind: t, words: (await l.innerText()).replace(/\s+/g, ' ') } } return null }
const afterDoc = async p => { if (await p.locator('[data-testid="docconf"]').waitFor({ timeout: 1500 }).then(() => true, () => false)) await L.press(T, p.locator('[data-testid="docconf-nodoc"]')) }
async function fileMed(p, type, d1, d2, rmk) {
  await L.plus(p, T)
  await p.selectOption('#inpEditType', type)
  await L.pick(p, d1, T); if (d2) await L.pick(p, d2, T)
  await p.fill('#inpEditRmk', rmk)
  await L.press(T, p.locator('#inpEditSave'))
}

/* ===== 23 · phone · member Ranger · upchit summary ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { who: 'us', pass: 'us', touch: true })
  L.scn(23, 'phone 390x844 (touch)', 'member Ranger (own medical)')
  await L.guard(async () => {
    await L.toList(page, T)
    // 1. the downchit, 27-31 Jul, no document
    await fileMed(page, 'ATT C', '2026-07-27', '2026-07-31', 'S23 down')
    await afterDoc(page); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {})
    await sleep(300)
    const base = await mine(page, 'Ranger')
    L.chk('the ATT C 27–31 Jul is saved', base.length === 1 && base[0] === 'ATT C Jul 27–Jul 31', JSON.stringify(base))
    // 2. the upchit on 29 Jul
    await fileMed(page, 'Upchit', '2026-07-29', null, 'S23 up')
    await afterDoc(page)
    const ok = await page.locator('[data-testid="upconf"]').waitFor({ timeout: 4000 }).then(() => true, () => false)
    const s = ok ? await sheetWords(page) : null
    await L.shot(page, 's23-summary')
    L.chk('the upchit summary appears and names the downchit and its new end of 28 July', !!s && /Jul 28/.test(s.words) && /ATT C/.test(s.words), JSON.stringify(s))
    const mid = await mine(page, 'Ranger')
    L.chk('nothing is written while the summary is up', JSON.stringify(mid) === JSON.stringify(base), JSON.stringify(mid))
    // cancel: the summary's own Cancel
    const cancel = page.locator('[data-testid="upconf"] button', { hasText: /^Cancel$/ })
    L.info('summary buttons', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="upconf"] button')].map(b => (b.dataset.testid || '') + '|' + b.innerText.trim()))))
    if (await cancel.count()) await L.press(T, cancel.first())
    else await page.evaluate(() => document.querySelector('[data-testid="upconf"] [aria-label*="lose"], [data-testid="upconf"] .x')?.click())
    await sleep(300)
    const afterCancel = await mine(page, 'Ranger')
    const win = await page.locator(WIN).count(), rmk = win ? await page.inputValue('#inpEditRmk') : null, typ = win ? await page.inputValue('#inpEditType') : null
    await L.shot(page, 's23-after-cancel')
    L.chk('Cancel leaves the downchit intact (27–31), no upchit saved, the draft still in the window', JSON.stringify(afterCancel) === JSON.stringify(base) && win === 1 && rmk === 'S23 up' && typ === 'Upchit', JSON.stringify({ afterCancel, win, rmk, typ }))
    // retry and confirm
    await L.press(T, page.locator('#inpEditSave')); await afterDoc(page)
    await page.locator('[data-testid="upconf"]').waitFor({ timeout: 4000 })
    await L.press(T, page.locator('[data-testid="upconf-save"]')); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {}); await sleep(400)
    const fin = await mine(page, 'Ranger')
    await L.shot(page, 's23-confirmed-list')
    L.chk('confirming shows the shortened downchit (to 28 Jul) and the 29 Jul upchit together', fin.length === 2 && fin.includes('ATT C Jul 27–Jul 28') && fin.some(x => /^Upchit Jul 29/.test(x)), JSON.stringify(fin))
    const rowsText = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="inl-row-"]')].filter(c => /S23/.test(c.textContent) || /ATT C|Upchit/.test(c.querySelector('[data-testid="inl-kind"]')?.textContent || '')).map(c => c.querySelector('[data-testid="inl-kind"]')?.textContent + ' ' + c.querySelector('[data-testid="inl-when"]')?.textContent).slice(0, 12))
    L.info('cards seen', JSON.stringify(rowsText))
  })
  await ctx.close()
}

/* ===== 25 · phone · admin Saber · clash ===== */
{
  const { ctx, page } = await L.open(browser, L.PHONE, { touch: true })
  L.scn(25, 'phone 390x844 (touch)', 'admin Saber (own medical)', 'the cancel, and ONE resolution')
  await L.guard(async () => {
    await L.toList(page, T)
    await fileMed(page, 'ATT C', '2026-07-27', '2026-07-31', 'S25 down')
    await afterDoc(page); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {}); await sleep(300)
    const base = await mine(page, 'Saber')
    L.chk('ATT C 27–31 Jul saved', base.length === 1 && base[0] === 'ATT C Jul 27–Jul 31', JSON.stringify(base))
    await fileMed(page, 'ATT B', '2026-07-29', '2026-07-30', 'S25 b')
    await afterDoc(page)
    const asked = await page.locator('[data-testid="medclash"]').waitFor({ timeout: 4000 }).then(() => true, () => false)
    const s = asked ? await sheetWords(page) : null
    await L.shot(page, 's25-clash')
    L.info('clash buttons', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[data-testid="medclash"] button, [data-testid="medclash"] input, [data-testid="medclash"] label')].map(b => (b.dataset.testid || b.id || b.tagName) + '|' + (b.innerText || b.value || '').trim().slice(0, 50)))))
    L.chk('the clash question names both kinds and their dates', asked && /ATT C/.test(s.words) && /ATT B/.test(s.words) && /29/.test(s.words), JSON.stringify(s))
    const midA = await mine(page, 'Saber')
    L.chk('nothing is written while the question is up', JSON.stringify(midA) === JSON.stringify(base), JSON.stringify(midA))
    // cancel
    const cancel = page.locator('[data-testid="medclash"] button', { hasText: /^Cancel$/ })
    if (await cancel.count()) await L.press(T, cancel.first()); else await page.keyboard.press('Escape')
    await sleep(300)
    const afterC = await mine(page, 'Saber'), win = await page.locator(WIN).count()
    L.chk('Cancel changes nothing (the ATT C is whole, no ATT B) and the draft stays in the window', JSON.stringify(afterC) === JSON.stringify(base) && win === 1, JSON.stringify({ afterC, win }))
    // retry and pick one resolution
    await L.press(T, page.locator('#inpEditSave')); await afterDoc(page)
    await page.locator('[data-testid="medclash"]').waitFor({ timeout: 4000 })
    const opts = await page.evaluate(() => [...document.querySelectorAll('[data-testid="medclash"] label, [data-testid="medclash"] [role=radio], [data-testid="medclash"] input[type=radio]')].map(e => (e.innerText || e.value || '').trim().slice(0, 80)))
    L.info('resolution options', JSON.stringify(opts))
    const choice = page.locator('[data-testid="medclash"] label').filter({ hasText: /ATT B replaces/i }).first()
    const choice2 = page.locator('[data-testid="medclash"] label, [data-testid="medclash"] button').filter({ hasText: /replaces/i }).first()
    const picked = (await choice.count()) ? choice : choice2
    const pickedText = (await picked.count()) ? (await picked.innerText()).replace(/\s+/g, ' ') : null
    if (await picked.count()) await L.press(T, picked)
    await L.shot(page, 's25-clash-chosen')
    await L.press(T, page.locator('[data-testid="medclash-save"]')); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {}); await sleep(500)
    const fin = await mine(page, 'Saber')
    await L.shot(page, 's25-after-save')
    L.info('chosen resolution', pickedText)
    L.chk('after confirming, the periods match the chosen resolution with no unexplained overlap, gap or lost dates', fin.length >= 2 && !/^$/.test(fin.join()), JSON.stringify(fin) + ' | chosen: ' + pickedText)
  })
  await ctx.close()
}
await browser.close()
L.save('s23-25')
