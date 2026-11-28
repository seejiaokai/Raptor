// trk-2c v1 — case 2c and item 1's second half: one ordinary person alone (no second person, no member view), on his own
// squadron's Tracker, pressing the everyday things — open, grade a ball, add an event, ✓ Save changes, switch the chart.
// Every set of words the corner beside ✓ Save changes draws is caught as it changes (a watcher on the page, read only), and
// whether "This change could not be saved." ever shows. Saber (ad/a, an admin of 142) and Ranger (us/us, a member).
//   node raptor-port/scripts/handpass/n162/trk-2c.mjs d|p [saber,ranger]
import { SZ, mk, run, fact, fail, log, press, go, signIn, trackerReady, addEvent, dlg, waitNoDlg, bar, barFacts, shots, frames } from './trk-lib.mjs'
const WHO = (process.argv[3] || 'saber,ranger').split(',')
const ACCT = { saber: ['ad', 'a'], ranger: ['us', 'us'] }
console.log('trk-2c v1', SZ, WHO.join(','))

/* a watcher that notes every text the corner shows (drawn, not hidden), in order */
const watch = s => s.page.evaluate(() => {
  window.__stat = []
  const read = () => { const e = document.getElementById('saveStat'); const t = e && !e.hidden && e.getBoundingClientRect().width > 0 ? e.textContent : ''; const last = window.__stat[window.__stat.length - 1]; if (t !== (last ? last.t : undefined)) window.__stat.push({ t, at: Math.round(performance.now()) }) }
  read(); new MutationObserver(read).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'class'] })
})
const seen = s => s.page.evaluate(() => { const v = window.__stat.map(x => x.t); window.__stat = window.__stat.slice(-1); return v })

async function ballPress(s) {
  if (!s.desk) { const fl = s.page.locator('#page-tracker button', { hasText: 'Flow chart' }).filter({ visible: true }); if (await fl.count()) await press(s, fl.first(), 'Flow chart') }
  const id = await s.page.evaluate(() => [...document.querySelectorAll('#flowSvg .ball')].map(b => b.dataset.id).find(Boolean))
  if (!id) fail('no ball on the chart')
  const b = s.page.locator(`#flowSvg .ball[data-id="${id}"]`).first()
  await b.scrollIntoViewIfNeeded().catch(() => {})
  const r = await b.boundingBox(); if (!r) fail(`ball ${id} not drawn`)
  const x = r.x + r.width / 2, y = r.y + r.height / 2
  if (s.desk) await s.page.mouse.click(x, y); else await s.page.touchscreen.tap(x, y)
  await s.page.waitForFunction(() => { const p = document.getElementById('pop'); return p && p.style.visibility !== 'hidden' && p.getBoundingClientRect().width > 0 }, null, { timeout: 5000 }).catch(() => fail(`the pop-up did not open on ${id}`))
  const g = s.page.locator('#pop .opts button[data-g]').filter({ visible: true })
  const words = await g.allTextContents(); log('grade buttons', words.join(' | '))
  const pick = s.page.locator('#pop .opts button[data-g="dco"]').filter({ visible: true })
  await press(s, (await pick.count()) ? pick.first() : g.first(), `grade on ${id}`)
  if ((await dlg(s)).up) { fact(`2c.${SZ}.gradeQuestion`, (await dlg(s)).msg); await press(s, '#dlgOk', 'OK'); await waitNoDlg(s) }
  return id
}

await run('trk-2c', async () => {
  for (const who of WHO) {
    log(`--- 2c ${who} (${SZ})`)
    const s = await mk(); const [u, p] = ACCT[who] || fail(`unknown person ${who}`)
    await signIn(s, u, p)
    await go(s, 'tracker'); await trackerReady(s)
    await watch(s)
    const all = []
    const rec = async tag => { const v = await seen(s); all.push(...v); fact(`2c.${SZ}.${who}.${tag}.cornerTexts`, v); const b = await bar(s); fact(`2c.${SZ}.${who}.${tag}.visibleText`, b.visibleText); fact(`2c.${SZ}.${who}.${tag}.fullText`, b.fullText); return b }
    await rec('open')
    const id = await ballPress(s); fact(`2c.${SZ}.${who}.gradedBall`, id)
    await s.page.waitForFunction(() => { const e = document.getElementById('saveStat'); return !!e && /saved/.test(e.textContent) }, null, { timeout: 5000 }).catch(() => log('no "saved" after the grade within 5 s'))
    await rec('afterGrade')
    await s.page.keyboard.press('Escape'); await frames(s)
    await addEvent(s, 'TRKC'); await rec('afterAddEvent')
    await press(s, '#saveChanges', '✓ Save changes')
    await s.page.waitForFunction(() => !document.querySelector('#saveChanges'), null, { timeout: 10000 }).catch(() => fail('✓ Save changes still drawn after the press'))
    await s.page.waitForFunction(() => /saved/.test(document.getElementById('saveStat')?.textContent || ''), null, { timeout: 5000 }).catch(() => {})
    const b = await rec('afterSave'); barFacts(`2c.${SZ}.${who}.afterSave.bar`, b)
    await shots(s, `trk-2c-${who}-${SZ}-aftersave`, '#page-tracker header .saveslot')
    const opts = await s.page.evaluate(() => [...document.querySelectorAll('#sylSel option')].map(o => ({ v: o.value, t: o.textContent.trim(), on: o.selected })))
    const to = opts.find(o => !o.on)
    if (to) { await s.page.locator('#sylSel').filter({ visible: true }).first().selectOption(to.v); await s.page.waitForFunction(t => (document.getElementById('saveStat')?.textContent || '').includes(t), to.t, { timeout: 8000 }).catch(() => {}); await rec('afterSwitchChart') }
    fact(`2c.${SZ}.${who}.notSavedEverShown`, all.some(t => /could not be saved/.test(t)))
    await s.ctx.close()
  }
})
