/* rcb2-w2 S12 — OIL settings. CASE=A: threshold changed, amount and times unchanged. CASE=B: default rally changed, amount stays FO but times change.
   CASE=C: setting changed BEFORE first publication, then sign + publish. Saturday 08:00-16:00 flight (rally 09:00? the default rally gives the day), Bane.
   usage: CASE=A|B|C [PHONE=1] node rcb2-w2-s12.mjs */
const PHONE = process.env.PHONE === '1'
const CASE = process.env.CASE || 'B'
process.env.RCB2_RUN ||= 's12' + CASE + '-' + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, sleep, SAT } = X
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const ISO = '2026-07-18'
async function setKey(key, val) {
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator(`#lgBody input[data-lgset="${key}"]:visible`).count())) { const e = page.locator('#lgEdit:visible').first(); if (await e.count()) { await X.press(w, '#lgEdit'); await sleep(400) } }
  const inp = page.locator(`#lgBody input[data-lgset="${key}"]`).first()
  if (!(await inp.count())) return { ok: false }
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded(); await inp.fill(val); await inp.press('Tab'); await sleep(700)
  const after = await inp.inputValue()
  await X.pic(w, `s12${CASE}-logic-${key}-${P}`)
  const note = await page.evaluate(() => (document.querySelector('#lgBody') || document.body).innerText.replace(/\s+/g, ' ').match(/[0-9]+ settings? [^.]*\.[^.]*\.[^.]*\.[^.]*\./)?.[0] || '')
  return { ok: true, before, after, note }
}
const sat = () => X.board(w, SAT)
const state = async (tag) => {
  await sat(); await sleep(800)
  const s = await page.evaluate(() => ({
    pend: [...document.querySelectorAll('.dpendbtn')].filter(e => e.offsetWidth && /pending/.test(e.innerText)).map(e => e.innerText.trim()),
    ver: (document.querySelector('#schedBoard .verchip') || {}).innerText || '',
    sign: [...document.querySelectorAll('#schedBoard .sb-sign select')].filter(e => e.offsetWidth).length,
    toSign: ((document.body.innerText.match(/[0-9] to sign[^\n]*/) || [''])[0]),
    publishBtn: [...document.querySelectorAll('button')].filter(e => e.offsetWidth && /^Publish/.test(e.innerText)).map(e => e.innerText.trim()),
  }))
  await X.pic(w, `s12${CASE}-${tag}-board-${P}`)
  return s
}
const listText = async () => {
  const b = page.locator('.dpendbtn:has-text("pending"):visible').first()
  if (!(await b.count())) return null
  await X.press(w, '.dpendbtn:has-text("pending")'); await sleep(500)
  const t = await page.evaluate(() => [...document.querySelectorAll('div,section,aside')].filter(e => e.offsetWidth && /^Changes . Saturday/.test(e.innerText || '') && (e.innerText || '').length < 900).map(e => e.innerText.replace(/\s+/g, ' ').trim()).sort((a, b) => a.length - b.length)[0] || null)
  await X.pic(w, `s12${CASE}-pendinglist-${P}`)
  await page.keyboard.press('Escape'); await sleep(300)
  return t
}
const mkFlight = async () => { await sat(); await X.flight(w, SAT, '08:00', '16:00') }
const lw = async (tag) => { await X.closeBoard(w).catch(() => {}); const c = await L.lwCell(page, ['bane'], ISO); await X.pic(w, `s12${CASE}-${tag}-leavewar-${P}`); return c }

if (CASE === 'C') {
  const s1 = await setKey('reportLead', '2h50'); say('set', JSON.stringify(s1))
  await mkFlight()
  const pr = await L.publish(page, SAT); say('publish', JSON.stringify(pr))
  const st = await state('after-publish'); say('state', JSON.stringify(st))
  X.row('S12 C', size, 'setting changed (default rally 2h50) before first publication, then sign + publish', 'published ORIG; no pending / "setting changed" item', JSON.stringify({ pr, st }), pr.published && st.pend.length === 0 ? 'PASS' : 'FAIL', `s12C-after-publish-board-${P}.png`)
  await X.closeBoard(w)
  X.row('S12 C', size, 'Leave War cell after the first publication', 'FO', JSON.stringify(await lw('c')), 'RECORDED', `s12C-c-leavewar-${P}.png`)
} else {
  await mkFlight()
  const pr = await L.publish(page, SAT); say('publish', JSON.stringify(pr))
  const st0 = await state('published'); await X.closeBoard(w)
  const lw0 = await lw('0'); say('LW0', JSON.stringify(lw0))
  X.row('S12 ' + CASE, size, 'Saturday 08:00-16:00 published', 'published ORIG, four signatures, credit FO', JSON.stringify({ pr, st0, lw0 }), pr.published && /FO/.test(JSON.stringify(lw0)) ? 'PASS' : 'FAIL', `s12${CASE}-published-board-${P}.png`)
  const s1 = CASE === 'A' ? await setKey('oilFullMin', '5h30') : await setKey('reportLead', '2h50')
  say('set', JSON.stringify(s1))
  X.row('S12 ' + CASE, size, CASE === 'A' ? 'Full day of OIL 6h01 -> 5h30 (Ranger day is 9h: still FO)' : 'default rally 3h -> 2h50 (day stays FO, worked times change)', 'Logic accepts', JSON.stringify(s1), s1.ok ? 'PASS' : 'FAIL', `s12${CASE}-logic-${CASE === 'A' ? 'oilFullMin' : 'reportLead'}-${P}.png`)
  const st1 = await state('after-change'); say('state', JSON.stringify(st1))
  const lt = await listText(); say('list', JSON.stringify(lt)); await X.closeBoard(w)
  const lw1 = await lw('1')
  const wantPend = CASE === 'B'
  const ok = wantPend ? (st1.pend.length > 0 && /FO/.test(JSON.stringify(lw1))) : (st1.pend.length === 0 && /FO/.test(JSON.stringify(lw1)))
  X.row('S12 ' + CASE, size, 'open the published Saturday after the change', wantPend ? 'pending; sign-offs lost; credit still FO' : 'no pending; signatures kept', JSON.stringify({ st0: { sign: st0.sign, toSign: st0.toSign }, st1, lt, lw1 }), ok ? 'PASS' : 'FAIL', `s12${CASE}-after-change-board-${P}.png`)
  if (lt) X.row('S12 ' + CASE, size, 'pending list wording (his look card)', 'RECORD', lt, 'RECORDED', `s12${CASE}-pendinglist-${P}.png`)
}
await X.fin(w)
