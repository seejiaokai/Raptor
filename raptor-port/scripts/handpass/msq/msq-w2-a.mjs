/* msq-w2-a v1 — W2: T1 (undo), T2 (Logic) in one desktop world. usage: node scripts/handpass/msq/msq-w2-a.mjs */
process.env.MSQ_WHO = 'w2'
process.env.MSQ_RUN = 'a3-d'
const X = await import('./msq-lib.mjs')
const U = await import('./msq-w1-util.mjs')
const { say, sleep, row } = X
say('msq-w2-a v1 desktop')
const w = await X.open({ phone: false, user: 'ad9' })
const { page } = w
const swap = async user => { const r = await X.signOut(w); await X.login(page, user); return r }
const safe = async (label, fn) => { try { return await fn() } catch (e) { say('ERR', label, String(e.message).split('\n')[0]); return null } }
async function addGround(name, who, di) {
  await X.W.board(w, di); await sleep(600)
  await X.W.press(w, `[data-gradd="${di}"]`, { scope: 'board' }); await sleep(600)
  const n = (await U.groundNames(page, di)).length - 1
  await X.W.typeIn(w, `[data-bfld="gr:${di}.${n}.prog"]`, name)
  const id = await U.pidOf(page, who)
  const r = await X.W.seat(w, `[data-fill="g:${di}.${n}.+"]`, id)
  say('ground add', name, who, r, JSON.stringify(await U.groundNames(page, di)))
  return r
}
const btn = async id => page.evaluate(i => { const b = document.querySelector('#' + i); return b ? { disabled: b.disabled, aria: b.getAttribute('aria-disabled') } : null }, id)
const isDis = s => !!s && (s.disabled === true || s.aria === 'true')

// ---------- T1
await X.L.go(page, 'editsched'); await sleep(800)
const g00 = await U.groundNames(page, 4)
say('Fri17 ground before', JSON.stringify(g00))
await addGround('W2 UNDO', 'Kestrel', 4)
await X.W.closeBoard(w); await sleep(600)
await X.L.go(page, 'editsched'); await sleep(800)
const gAdd = await U.groundNames(page, 4)
await X.pic(w, 't1-01-after-add')
say('after add', JSON.stringify(gAdd), 'undo', JSON.stringify(await btn('undoBtn')))
let presses = 0, gone = !gAdd.includes('W2 UNDO'), seq = []
while (!gone && presses < 4) {
  await page.locator('#undoBtn').click(); presses++; await sleep(900)
  const g = await U.groundNames(page, 4)
  seq.push(JSON.stringify(g))
  await X.pic(w, `t1-02-undo-${presses}`)
  gone = !g.includes('W2 UNDO')
}
row('T1', 'desktop', 'ad9 adds ground row "W2 UNDO" with Kestrel on Fri 17, presses top bar Undo one at a time', 'goes within 4 presses (RECORD count)', `presses: ${presses}; ground after each: ${seq.join(' -> ')}; gone: ${gone}; start: ${JSON.stringify(gAdd)}`, gone ? 'PASS' : 'FAIL', 't1-01-after-add.png, t1-02-undo-*.png')
await page.locator('#redoBtn').click(); await sleep(900)
const gRedo = await U.groundNames(page, 4)
await X.pic(w, 't1-03-after-redo')
row('T1', 'desktop', 'ad9 presses Redo once', 'RECORD whether it comes back', `ground: ${JSON.stringify(gRedo)}; W2 UNDO back: ${gRedo.includes('W2 UNDO')}`, 'RECORD', 't1-03-after-redo.png')
if (!gRedo.includes('W2 UNDO')) {
  await page.locator('#redoBtn').click().catch(() => {}); await sleep(700)
}
if (!(await U.groundNames(page, 4)).includes('W2 UNDO')) { say('re-adding W2 UNDO'); await addGround('W2 UNDO', 'Kestrel', 4); await X.W.closeBoard(w); await sleep(600); await X.L.go(page, 'editsched') }
say('ground now', JSON.stringify(await U.groundNames(page, 4)))
await X.pic(w, 't1-04-left-there')
await swap('ad'); await X.L.go(page, 'editsched'); await sleep(800)
const adU = await btn('undoBtn')
await X.pic(w, 't1-05-ad-undo-state')
row('T1', 'desktop', 'ad signs in; reads Undo button', 'greyed (disabled)', JSON.stringify(adU) + `; 142 Fri17 ground: ${JSON.stringify(await U.groundNames(page, 4))}`, isDis(adU) ? 'PASS' : 'FAIL', 't1-05-ad-undo-state.png')
await swap('ad9'); await X.L.go(page, 'editsched'); await sleep(800)
const g9 = await U.groundNames(page, 4), u9 = await btn('undoBtn')
await X.pic(w, 't1-06-ad9-back')
row('T1', 'desktop', 'ad9 signs in again', 'W2 UNDO still on Fri 17; Undo greyed', `ground: ${JSON.stringify(g9)}; undo: ${JSON.stringify(u9)}`, g9.includes('W2 UNDO') && isDis(u9) ? 'PASS' : 'FAIL', 't1-06-ad9-back.png')

// ---------- T2
const logicVals = async () => page.evaluate(() => [...document.querySelectorAll('input')].filter(e => e.offsetWidth > 1 && !['searchE', 'lgSearch'].includes(e.id)).slice(0, 8).map(e => {
  let p = e.parentElement, t = ''
  for (let i = 0; i < 5 && p; i++, p = p.parentElement) { if (p.innerText && /\n/.test(p.innerText.trim())) { t = p.innerText.trim().split('\n')[0]; break } }
  return t + '=' + e.value
}))
const readLogic = async () => {
  await page.getByRole('button', { name: /^\W*Edit\W*$/ }).first().click(); await sleep(700)
  const v = await logicVals()
  await page.getByRole('button', { name: /^\s*Done\s*$/ }).first().click(); await sleep(600)
  return v
}
await X.L.go(page, 'logic'); await sleep(1200)
await X.pic(w, 't2-01-ad9-logic')
await page.getByRole('button', { name: /^\W*Edit\W*$/ }).first().click(); await sleep(700)
const v0 = await logicVals(); say('149 logic before', JSON.stringify(v0))
const ix = v0.findIndex(s => /Long work day/.test(s))
const box = page.locator('input:visible:not(#searchE):not(#lgSearch)').nth(ix)
const orig = await box.inputValue()
await box.click(); await box.fill('13h'); await box.press('Enter'); await sleep(500)
await page.keyboard.press('Tab'); await sleep(500)
say('typed; question?', (await U.bodyText(page)).slice(0, 200))
await X.pic(w, 't2-02-ad9-changed')
const v1 = await logicVals(); say('149 logic after', JSON.stringify(v1))
await safe('done', async () => { await page.getByRole('button', { name: /^\s*Done\s*$/ }).first().click(); await sleep(800) })
await X.pic(w, 't2-03-ad9-after-done')
const v1b = await readLogic()
row('T2', 'desktop', `ad9 Logic: Long work day ${orig} -> 13h, Done`, 'shows new value', `before: ${JSON.stringify(v0)}; after: ${JSON.stringify(v1b)}`, v1b.some(s => /Long work day=13h/.test(s)) ? 'PASS' : 'FAIL', 't2-02-ad9-changed.png, t2-03-ad9-after-done.png')
await swap('ad'); await X.L.go(page, 'logic'); await sleep(1200)
const vA = await readLogic()
await X.pic(w, 't2-04-ad-logic')
row('T2', 'desktop', 'ad (142) opens Logic', `Long work day still ${orig}`, JSON.stringify(vA), vA.some(s => new RegExp('Long work day=' + orig).test(s)) ? 'PASS' : 'FAIL', 't2-04-ad-logic.png')
await swap('ad9'); await X.L.go(page, 'logic'); await sleep(1200)
const v9 = await readLogic()
await X.pic(w, 't2-05-ad9-logic-again')
row('T2', 'desktop', 'ad9 opens Logic again', 'Long work day 13h', JSON.stringify(v9), v9.some(s => /Long work day=13h/.test(s)) ? 'PASS' : 'FAIL', 't2-05-ad9-logic-again.png')
await page.getByRole('button', { name: /^\W*Edit\W*$/ }).first().click(); await sleep(700)
const box2 = page.locator('input:visible:not(#searchE):not(#lgSearch)').nth(ix)
await box2.click(); await box2.fill(orig); await box2.press('Enter'); await sleep(500); await page.keyboard.press('Tab'); await sleep(400)
await safe('done2', async () => { await page.getByRole('button', { name: /^\s*Done\s*$/ }).first().click(); await sleep(800) })
const v9b = await readLogic()
await X.pic(w, 't2-06-ad9-restored')
say('149 restored', JSON.stringify(v9b))
row('T2', 'desktop', `ad9 puts Long work day back to ${orig}`, 'restored', JSON.stringify(v9b), 'RECORD', 't2-06-ad9-restored.png')
await X.fin(w)
