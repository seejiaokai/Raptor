import * as L from './ivet-B-lib.mjs'
const { WIN, sleep } = L
const browser = await L.launch()
const T = false
const mine = p => p.evaluate(() => window.INPUTS.filter(r => window.PEOPLE[r.person]?.cs === 'Ranger' && /S30/.test(r.remarks || '')).map(r => `${r.type} ${r.date}${r.endDate ? '–' + r.endDate : ''}`).sort())
const afterDoc = async p => { if (await p.locator('[data-testid="docconf"]').waitFor({ timeout: 1500 }).then(() => true, () => false)) await p.locator('[data-testid="docconf-nodoc"]').click() }
async function fileMed(p, type, d1, d2, rmk) {
  await L.plus(p, T)
  await p.selectOption('#inpEditType', type)
  await L.pick(p, d1, T); if (d2) await L.pick(p, d2, T)
  await p.fill('#inpEditRmk', rmk)
  await p.locator('#inpEditSave').click()
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const undo = async p => { await p.locator('#undoBtn').click(); await sleep(450) }
const redo = async p => { await p.locator('#redoBtn').click(); await sleep(500) }

const { ctx, page } = await L.open(browser, L.DESK, { who: 'us', pass: 'us' })
L.scn(30, 'desktop 1440x900', 'member Ranger (own filings)', 'undo/redo after a 23-type filing (upchit), a 25-type filing (clash) and a hidden-by-filter save')
await L.guard(async () => {
  await L.toList(page, T)
  /* a · the upchit filing (as 23) */
  await fileMed(page, 'ATT C', '2026-07-27', '2026-07-31', 'S30 down'); await afterDoc(page); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {}); await sleep(300)
  const s0 = await mine(page)
  await fileMed(page, 'Upchit', '2026-07-29', null, 'S30 up'); await afterDoc(page)
  await page.locator('[data-testid="upconf"]').waitFor({ timeout: 4000 })
  await page.locator('[data-testid="upconf-save"]').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {}); await sleep(400)
  const s1 = await mine(page)
  L.chk('(setup) the upchit filing shortened the downchit and added the upchit', s0.length === 1 && s1.length === 2 && s1.includes('ATT C Jul 27–Jul 28'), JSON.stringify({ s0, s1 }))
  await undo(page)
  const s2 = await mine(page)
  await L.shot(page, 's30-a-undo')
  L.chk('Undo takes back the WHOLE upchit filing: the upchit goes and the downchit is whole again (27–31)', same(s2, s0), JSON.stringify(s2))
  await redo(page)
  const s3 = await mine(page)
  const up = await page.evaluate(() => { const r = window.INPUTS.find(x => /S30 up/.test(x.remarks || '')); const tr = r && document.querySelector(`#inBody tr[data-iid="${r.iid}"]`); return tr ? { lit: tr.classList.contains('innew'), top: Math.round(tr.getBoundingClientRect().top) } : null })
  await L.shot(page, 's30-a-redo')
  L.chk('Redo restores both together (downchit to 28 Jul, upchit 29 Jul) and the upchit row is in view and lit', same(s3, s1) && !!up && up.lit, JSON.stringify({ s3, up }))

  /* b · the clash filing (as 25) */
  await sleep(6500)
  await fileMed(page, 'ATT C', '2026-08-24', '2026-08-28', 'S30 c'); await afterDoc(page); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {}); await sleep(300)
  const c0 = (await mine(page)).filter(x => /Aug/.test(x))
  await fileMed(page, 'ATT B', '2026-08-26', '2026-08-27', 'S30 b'); await afterDoc(page)
  await page.locator('[data-testid="medclash"]').waitFor({ timeout: 4000 })
  await page.locator('[data-testid="medclash"] button', { hasText: /replaces/ }).first().click()
  await page.locator('[data-testid="medclash-save"]').click(); await page.locator(WIN).waitFor({ state: 'hidden', timeout: 4000 }).catch(() => {}); await sleep(400)
  const c1 = (await mine(page)).filter(x => /Aug/.test(x))
  L.chk('(setup) the clash filing split the periods', c1.length >= 2 && c1.some(x => /^ATT B Aug 26/.test(x)), JSON.stringify({ c0, c1 }))
  await undo(page)
  const c2 = (await mine(page)).filter(x => /Aug/.test(x))
  await L.shot(page, 's30-b-undo')
  L.chk('Undo takes back the WHOLE clash filing: no ATT B, the ATT C 24–28 Aug is whole again', same(c2, c0), JSON.stringify(c2))
  await redo(page)
  const c3 = (await mine(page)).filter(x => /Aug/.test(x))
  await L.shot(page, 's30-b-redo')
  L.chk('Redo restores the same periods as the first time', same(c3, c1), JSON.stringify(c3))

  /* c · a save hidden by a filter, then Undo / Redo */
  await sleep(6500)
  await page.fill('#inFSearch', 'zz-no-match')
  const had = await L.ids(page)
  await L.plus(page, T); await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-07-21', T); await page.fill('#inpEditRmk', 'S30 hidden')
  await page.locator('#inpEditSave').click(); await page.locator(WIN).waitFor({ state: 'hidden' }); await sleep(400)
  const made = await L.newest(page, had)
  const r1 = made[0] && await L.rowOf(page, made[0].iid)
  L.chk('(setup) the save under the hiding search is revealed and lit', !!r1 && r1.lit && r1.at === 0, JSON.stringify(r1 && { at: r1.at, lit: r1.lit }))
  await sleep(6500)
  const dark = await page.locator('#inBody tr.innew').count()
  await undo(page)
  const gone = made[0] ? (await page.evaluate(i => !window.INPUTS.find(r => r.iid === i), made[0].iid)) : false
  await redo(page)
  const r2 = made[0] && await L.rowOf(page, made[0].iid)
  await L.shot(page, 's30-c-redo-hidden')
  L.chk('Undo removes it; Redo brings it back REVEALED (first, in view) and LIT although the search still hides it', dark === 0 && gone && !!r2 && r2.lit && r2.at === 0 && r2.onScreen && (await page.inputValue('#inFSearch')) === 'zz-no-match', JSON.stringify({ dark, gone, r2: r2 && { at: r2.at, lit: r2.lit, onScreen: r2.onScreen } }))
  await page.fill('#inFSearch', '')

  /* d · the next fresh + Input; and List/Calendar stays */
  const listOn = await page.locator('#inListBtn[aria-pressed="true"]').count()
  L.chk('the List choice stayed on the List through every Undo and Redo', listOn === 1, String(listOn))
  await L.plus(page, T)
  const f = await page.evaluate(() => ({ read: document.querySelector('#inpEditPop .rc-read')?.textContent, type: document.querySelector('#inpEditType')?.value, rmk: document.querySelector('#inpEditRmk')?.value, title: document.querySelector('#inpEditOwnTitle')?.value || '', who: document.querySelector('#inpEditPersonFixed')?.textContent || document.querySelector('#inpEditPerson')?.selectedOptions[0]?.textContent, chips: document.querySelectorAll('[data-testid="win-inputedit"] .docchip').length, hint: document.querySelectorAll('[data-testid="win-inputedit"] .inped-hint').length }))
  await L.shot(page, 's30-d-fresh-window')
  L.chk('a fresh "+ Input": no date picked, no carried title / remark / attachment, no paragraph; kind "Training" (the brief; the scenario text says Duty), person Ranger', f.read === 'pick a start date' && f.rmk === '' && (f.title === '' || f.title === f.type) && f.chips === 0 && f.hint === 0 && f.type === 'Training' && f.who === 'Ranger', JSON.stringify(f))
  await page.locator('#inpEditCancel').click()
})
await ctx.close()
await browser.close()
L.save('s30')
