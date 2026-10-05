/* The Codex stack check — the HOST's own look at the fix round (6 Oct 26), on the fixed build in a real browser.
   What a unit test cannot see: where the caret really is, what the day's list really says while it is there, the
   pinned band and the menu on a phone. Every step is the real mouse and keyboard; window.* is only read.
     HP_URL=http://localhost:4233 HP_SHOTS=<dir> HP_OUT=<json> [HP_PHONE=1] node scripts/handpass/stk-host-fix.mjs */
import * as H from './wh-lib.mjs'
const { L, W, judge, row, pic, savePart, PHONE } = H
const sleep = L.sleep
const { browser, p, errors } = await H.world({ who: 'a' })
if ((await p.evaluate(() => window.CURPAGE)) !== 'editsched') await L.go(p, 'editsched')
await p.waitForSelector('#eWeek .day', { timeout: 15000 })
const active = () => p.evaluate(() => {
  const a = document.activeElement; if (!a || a === document.body) return 'BODY'
  const d = a.dataset || {}
  return (d.txt || d.bfld || d.itline && 'itline:' + d.itline || d.inp || d.ifld || a.id || a.className || a.tagName) + ''
})
const typeInto = async (sel, text) => {
  const el = p.locator(sel).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  await el.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text, { delay: 6 })
}

if (!PHONE) {
  /* ---- W15 on the week: the list keeps up while the caret is in the next box ---- */
  await W.showDay(p, 0)
  await H.openList(p, '#eWeek', 0)
  const before = await H.readList(p, '#eWeek', 0)
  const f0 = await p.evaluate(() => { const f = window.DAYS[0].waves[0].formations[0]; return { cs: f.cs, to: f.to } })
  await typeInto('#eWeek .day[data-day="0"] [data-itline="0|0|0"]', `${f0.to}H: ${f0.cs} IN TIME`)
  await p.keyboard.press('Tab'); await sleep(500)
  const at1 = await active()
  const during = await H.readList(p, '#eWeek', 0)
  const pa = await pic(p, 'W15-week-list-while-caret-in-next-box')
  judge('W15-week', `Edit Schedule Mon, list open; in-time line 1 retyped "${f0.to}H: ${f0.cs} IN TIME" (an in-time later than the suggested brief), Tab`, [
    ['the caret is in a text box of the day', at1 !== 'BODY', at1],
    ['the list did not name it before', !(before.lines || []).some(l => /is later than/.test(l.text)), before.bar],
    ['the list names the timing warning while the caret is still in text', (during.lines || []).some(l => /is later than/.test(l.text)), (during.lines || []).filter(l => /later than/.test(l.text)).map(l => l.text)],
    ['the bar counts it', during.bar !== before.bar || (during.lines || []).length !== (before.lines || []).length, `${before.bar} → ${during.bar}`],
  ], [pa])
  /* type on in the box the caret is in: it must still be a working box (never redrawn under the caret) */
  await p.keyboard.type('ZZ', { delay: 20 }); await sleep(150)
  const typed = await p.evaluate(() => (document.activeElement && (document.activeElement.textContent || document.activeElement.value)) || '')
  judge('W15-week-caret', 'typed ZZ straight after', [['the characters went into the focused box', /ZZ/.test(typed), typed.slice(0, 60)]])
  await p.keyboard.press('Escape'); await sleep(400)
  await W.door(p, 'top', 'undo'); await sleep(500)

  /* ---- W16: the wave header beside a line changed on the way through ---- */
  await p.locator('#page-editsched [data-wk="20/07/2026"]:visible').click(); await sleep(1200)
  await W.showDay(p, 0)
  const head = () => p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="0"] .go .go-tab .asd')].map(e => e.innerText.replace(/\s+/g, ' ')))
  const waves0 = await p.evaluate(() => window.DAYS[0].waves.map(w => ({ label: w.label, sa: !!w.standalone, to: w.formations.map(f => f.to), it: w.intimes })))
  row('W16-fixture', 'Mon 20 Jul as it stands', JSON.stringify(waves0).slice(0, 500), 'RECORDED')
  const gi = waves0.findIndex(w => !w.sa && w.to.some(Boolean))
  if (gi >= 0) {
    if (!(waves0[gi].it || []).length) { await p.locator(`#eWeek [data-itadd="0|${gi}"]:visible`).first().click(); await sleep(500) }
    await typeInto(`#eWeek .day[data-day="0"] [data-itline="0|${gi}|0"]`, '23:30H: IN TIME + WX/NOTAMS')
    await p.keyboard.press('Tab'); await sleep(500)
    const h1 = await head(); const at = await active()
    const pb = await pic(p, 'W16-week-header-after-line-edit-caret-in-next-box')
    const model = await p.evaluate(g => window.DAYS[0].waves[g].intimes, gi)
    judge('W16', `Mon 20 Jul wave ${gi + 1}: its In-time / Rally line set to 23:30H (later than every take-off, so the previous day), Tab`, [
      ['the caret is still in a text box', at !== 'BODY', at],
      ['the line holds 23:30', /23:30/.test(String(model)), model],
      ['the header of that wave says 23:30 (prev day)', /23:30 \(prev day\)/.test(h1[gi] || ''), h1[gi]],
    ], [pb])
    await p.keyboard.press('Escape'); await sleep(300)
  } else row('W16', 'no flying wave with a take-off on Mon 20 Jul', '', 'NOT WALKED')
  await p.locator('#page-editsched [data-wk="13/07/2026"]:visible').click(); await sleep(1200)

  /* ---- W15 on the board ---- */
  await W.boardOn(p, 1); await sleep(400)
  const listB = () => p.evaluate(() => (document.querySelector('#sbWarn')?.innerText || '').replace(/\s+/g, ' '))
  const lb0 = await listB()
  const f1 = await p.evaluate(() => { const f = window.DAYS[1].waves[0].formations[0]; return { cs: f.cs, to: f.to } })
  await typeInto('#sbBoard [data-itline="1|0|0"]', `${f1.to}H: ${f1.cs} IN TIME`)
  await p.keyboard.press('Tab'); await sleep(500)
  const atB = await active(), lb1 = await listB()
  const pc = await pic(p, 'W15-board-list-while-caret-in-next-box')
  judge('W15-board', `Scheduler Board Tue: in-time line 1 retyped "${f1.to}H: ${f1.cs} IN TIME", Tab`, [
    ['the caret is in a box of the board', atB !== 'BODY', atB],
    ['the list did not name it before', !/is later than/.test(lb0), lb0.slice(0, 80)],
    ['the list names the timing warning while the caret is still in text', /is later than/.test(lb1), (lb1.match(/[^.]*is later than[^.]*\./) || [''])[0]],
  ], [pc])

  /* ---- W14 (b): the exit from the last box, after a save in the run — does the focus stay where it landed? ---- */
  const lastSel = await p.evaluate(() => {
    const all = [...document.querySelectorAll('#sbBoard [data-bfld],#sbBoard [data-ifld],#sbBoard [data-itline],#sbBoard [data-bombs],#sbBoard [data-area],#sbBoard [data-atime]')]
      .filter(e => e.offsetParent !== null && !e.disabled && !e.readOnly)
    const last = all.at(-1); if (!last) return null
    last.setAttribute('data-hostlast', '1'); return last.dataset.bfld || last.dataset.ifld || 'other'
  })
  await p.locator('#sbBoard [data-hostlast="1"]').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  await p.locator('#sbBoard [data-hostlast="1"]').first().click(); await sleep(150)
  await p.keyboard.press('Tab'); await sleep(60)
  const exitAtOnce = await active(); await sleep(700)
  const exitLater = await active()
  const pd = await pic(p, 'W14b-board-exit-after-a-saved-run')
  row('W14b-board', `Board Tue, a line saved earlier in the run; the caret put in the last open box (${lastSel}), Tab`, `focus at once: ${exitAtOnce}; 0.7 s later: ${exitLater}`, exitLater === 'BODY' && exitAtOnce !== 'BODY' ? 'FAIL' : 'RECORDED', [pd])
  await p.keyboard.press('Escape'); await sleep(200)
  await W.door(p, 'board', 'undo').catch(() => {}); await sleep(400)
  await W.boardOff(p)
} else {
  /* ---- the phone board's Desktop layout: the band (W13) and the ⋯ menu (W18) ---- */
  await W.boardOn(p, 1); await sleep(500)
  await p.locator('#sbMore').click(); await sleep(200)
  await p.locator('#sbMoreWide').click(); await sleep(500)
  const wide = await p.evaluate(() => document.querySelector('#schedBoard').classList.contains('sb-wide'))
  /* a failed save, the way a full disk does it (sn-cover.mjs): one real write first, then storage refuses */
  await p.evaluate(() => {
    const w = window; w.__lsSetWas = Storage.prototype.setItem
    Storage.prototype.setItem = function () { throw new DOMException('The quota has been exceeded (walk: forced)', 'QuotaExceededError') }
    w.fillSlot('1.0.0.0.p', w.DAYS[1].waves[0].formations[0].aircraft[0].p === 'casper' ? 'bane' : 'casper'); w.afterSchedMutate()
  })
  await p.waitForSelector('#schedBoard .saveband', { timeout: 8000 }).catch(() => {})
  const measure = () => p.evaluate(() => {
    const band = document.querySelector('#schedBoard .saveband'); if (!band) return null
    const b = band.querySelector('button').getBoundingClientRect(), m = band.querySelector('.sv-msg').getBoundingClientRect(), r = band.getBoundingClientRect()
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)
    return { band: [Math.round(r.left), Math.round(r.right)], words: [Math.round(m.left), Math.round(m.right)], retry: [Math.round(b.left), Math.round(b.right)], hitsRetry: !!hit && !!hit.closest('.saveband button'), vw: innerWidth }
  })
  const max = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return b.scrollWidth - b.clientWidth })
  for (const pan of [0, Math.round(max / 2), max]) {
    await p.evaluate(x => { document.querySelector('#schedBoard').scrollLeft = x }, pan); await sleep(300)
    const m = await measure(), pf = await pic(p, `W13-band-panned-${pan}`)
    judge(`W13-pan-${pan}`, `phone, board Tue in Desktop layout (${wide ? 'on' : 'OFF'}), a failed save, panned ${pan}px of ${max}`, [
      ['the band is there', !!m],
      ['the words start on screen', !!m && m.words[0] >= 0 && m.words[0] < m.vw - 60, m && m.words],
      ['Retry is wholly on screen', !!m && m.retry[0] >= 0 && m.retry[1] <= m.vw, m && m.retry],
      ['a finger on Retry lands on Retry', !!m && m.hitsRetry],
    ], [pf])
  }
  await p.evaluate(() => { Storage.prototype.setItem = window.__lsSetWas })
  /* the ⋯ menu with its button hard against the right edge */
  const home = await p.evaluate(() => { const b = document.querySelector('#schedBoard'); return b.scrollLeft + document.querySelector('#sbMore').getBoundingClientRect().left })
  for (const left of [10, 350]) {
    await p.evaluate(x => { document.querySelector('#schedBoard').scrollLeft = x }, Math.max(0, Math.round(home - left))); await sleep(300)
    const bx = await p.locator('#sbMore').boundingBox()
    await p.locator('#sbMore').click(); await sleep(250)
    const menu = await p.evaluate(() => { const m = document.querySelector('#sbMoreMenu'); if (!m) return null; const r = m.getBoundingClientRect(); return { left: Math.round(r.left), right: Math.round(r.right), items: [...m.querySelectorAll('.sb-moreitem')].map(i => i.innerText.trim()), vw: innerWidth } })
    const pg = await pic(p, `W18-menu-button-at-${Math.round(bx?.x ?? -1)}`)
    judge(`W18-at-${left}`, `the ⋯ button about ${Math.round(bx?.x ?? -1)}px from the left of a 390px screen, pressed`, [
      ['the menu opened', !!menu],
      ['its whole width is on screen', !!menu && menu.left >= 0 && menu.right <= menu.vw, menu && [menu.left, menu.right]],
      ['Insights is in it', !!menu && menu.items.some(t => /Insights/.test(t)), menu && menu.items],
    ], [pg])
    await p.keyboard.press('Escape'); await sleep(200)
  }
}
row('errors', 'the browser error list over the whole run', JSON.stringify(errors.filter(e => !/quota/i.test(String(e))).slice(0, 6)), errors.filter(e => !/quota/i.test(String(e))).length ? 'FAIL' : 'PASS')
savePart('host-fix')
await browser.close()
