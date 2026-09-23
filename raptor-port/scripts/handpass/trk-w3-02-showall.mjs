/* w3 item 2 — Show All (R65, R100): grouped by event code, number order
   inside each group (ST-9 before ST-10), the course's first families first;
   typing a code shows that family alone; a plain word searches names and crew;
   desktop ☰ Show All on the bar vs the phone's Show All TAB (title "All
   events", one short line). */
import { open, shot, save, log, DESK, PHONE } from './trk-lib.mjs'
import { sleep, pickFrom } from './trk-w3-lib.mjs'

const L = log()
/* the list as drawn, group by group */
const groups = page => page.evaluate(() => {
  const out = []; let g = null
  for (const el of document.querySelectorAll('#saBody > *')) {
    if (el.classList.contains('saphase')) { g = { cat: el.textContent.trim(), ids: [] }; out.push(g) }
    else if (el.classList.contains('sarow') && g) g.ids.push(el.querySelector('.sid').textContent.trim())
  }
  return out
})
/* an independent natural-order check: split into text / number runs */
const nat = (a, b) => {
  const A = a.match(/\d+|\D+/g) || [], B = b.match(/\d+|\D+/g) || []
  for (let i = 0; i < Math.min(A.length, B.length); i++) {
    const x = A[i], y = B[i]
    if (/^\d/.test(x) && /^\d/.test(y)) { if (+x !== +y) return +x - +y } else if (x !== y) return x < y ? -1 : 1
  }
  return A.length - B.length
}
const outOfOrder = gs => gs.flatMap(g => g.ids.slice(1).map((id, i) => nat(g.ids[i], id) > 0 ? `${g.cat}: ${g.ids[i]} before ${id}` : null).filter(Boolean))
/* groups where a one-digit number sits beside a two-digit one — where ST-9 vs ST-10 is actually exercised */
const mixed = gs => gs.filter(g => { const n = g.ids.map(id => (id.match(/-(\d+)/) || [])[1]).filter(Boolean); return n.some(x => x.length === 1 && !x.startsWith('0')) && n.some(x => x.length >= 2) }).map(g => `${g.cat}[${g.ids.slice(0, 12).join(',')}${g.ids.length > 12 ? '…' : ''}]`)
const shown = page => page.evaluate(() => [...document.querySelectorAll('#saBody .sarow')].map(r => ({ id: r.querySelector('.sid').textContent.trim(), text: r.innerText.replace(/\s+/g, ' ').slice(0, 160) })))
async function typeFilter(page, text, touch = false) {
  const b = await page.locator('#saSearch').boundingBox()
  if (touch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.click('#saSearch')
  await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace')
  await page.keyboard.type(text, { delay: 20 }); await sleep(350)
}

/* ---------------- desktop ---------------- */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'a' })
  L.ok('desk: ☰ Show All is on the bar', await page.locator('#showAllBtn').isVisible(), '')
  L.ok('desk: the phone\'s Show All tab is not drawn', !(await page.locator('#showAllTab').isVisible()), '')
  for (const chart of [/^2026/, /^2024/, /^Tx 2026/, /^A\/G/]) {
    await pickFrom(page, '#sylSel', chart)
    await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(300)
    const gs = await groups(page)
    const bad = outOfOrder(gs)
    const name = await page.locator('#sylSel option:checked').innerText()
    L.ok(`desk ${name}: every group in number order`, !bad.length, bad.length ? bad.slice(0, 6).join(' · ') : `${gs.length} groups, ${gs.reduce((t, g) => t + g.ids.length, 0)} rows`)
    L.note(`desk ${name}: group order`, gs.map(g => g.cat).join(' '))
    L.note(`desk ${name}: groups where ST-9-vs-ST-10 is exercised`, mixed(gs).join(' | ') || 'none (all zero-padded)')
    if (/^2026/.test(name)) await shot(page, 'w3-02-desk-showall-2026')
    if (/^Tx/.test(name)) await shot(page, 'w3-02-desk-showall-tx')
    await page.click('#saClose'); await sleep(250)
  }
  await pickFrom(page, '#sylSel', /^2026/)
  await page.click('#showAllBtn'); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(300)
  /* a code */
  await typeFilter(page, 'ST')
  let r = await shown(page)
  L.ok('desk: typing "ST" shows the ST family alone', r.length > 0 && r.every(x => /^ST-/.test(x.id)), `${r.length} rows: ${r.map(x => x.id).join(',')}`)
  L.ok('desk: …in number order', !outOfOrder([{ cat: 'ST', ids: r.map(x => x.id) }]).length, '')
  await shot(page, 'w3-02-desk-filter-ST')
  await typeFilter(page, 'acg')
  r = await shown(page)
  L.ok('desk: typing "acg" (lower case) shows the ACG family', r.length > 0 && r.every(x => /^ACG-/.test(x.id)), `${r.length} rows: ${r.slice(0, 20).map(x => x.id).join(',')}`)
  /* a word in a NAME */
  await typeFilter(page, 'Welcome')
  r = await shown(page)
  L.ok('desk: a word ("Welcome") searches the names', r.some(x => x.id === 'ST-01'), r.map(x => x.id + ' «' + x.text.slice(0, 60) + '»').join(' | '))
  await shot(page, 'w3-02-desk-filter-word')
  /* a word in the CREW */
  await typeFilter(page, 'FSI')
  r = await shown(page)
  L.ok('desk: a crew word ("FSI") finds rows whose crew says so', r.length > 0 && r.every(x => /FSI/i.test(x.text)), `${r.length} rows, e.g. ${r.slice(0, 5).map(x => x.id).join(',')}`)
  /* no match */
  await typeFilter(page, 'zzqq')
  L.ok('desk: a search that matches nothing says so', (await page.locator('#saBody').innerText()).includes('No matches'), (await page.locator('#saBody').innerText()).slice(0, 60))
  await page.keyboard.press('Escape'); await sleep(250)
  L.ok('desk: Escape closes Show All', !(await page.locator('#showAllPanel').isVisible().catch(() => false)), '')
  L.note('desk errors', errors.join(' | ') || 'none')
  await browser.close()
}

/* ---------------- phone ---------------- */
{
  const { browser, page, errors } = await open({ size: PHONE, who: 'a', touch: true })
  L.ok('phone: ☰ Show All is NOT on the bar', !(await page.locator('#showAllBtn').isVisible()), '')
  const t = await page.locator('#showAllTab').boundingBox()
  L.ok('phone: the Show All tab is there', !!t, JSON.stringify(t))
  await page.touchscreen.tap(t.x + t.width / 2, t.y + t.height / 2); await page.waitForSelector('#showAllPanel', { state: 'visible' }); await sleep(400)
  const hd = await page.evaluate(() => { const h = document.querySelector('#showAllPanel h2'); const r = h.getBoundingClientRect(); const lh = parseFloat(getComputedStyle(h).lineHeight) || parseFloat(getComputedStyle(h).fontSize) * 1.2; return { text: h.innerText.trim(), h: Math.round(r.height), lineH: Math.round(lh) } })
  L.ok('phone: its title reads "All events" on one short line', hd.text === 'All events' && hd.h <= hd.lineH * 1.5, JSON.stringify(hd))
  const gs = await groups(page)
  L.ok('phone: same grouping, number order', !outOfOrder(gs).length && gs.length > 3, gs.slice(0, 8).map(g => g.cat).join(' '))
  await shot(page, 'w3-02-phone-showall')
  await typeFilter(page, 'ACG', true)
  const r = await shown(page)
  L.ok('phone: typing "ACG" shows that family', r.length > 0 && r.every(x => /^ACG-/.test(x.id)), `${r.length} rows`)
  await shot(page, 'w3-02-phone-filter-ACG')
  const c = await page.locator('#saClose').boundingBox()
  await page.touchscreen.tap(c.x + c.width / 2, c.y + c.height / 2); await sleep(300)
  L.ok('phone: Close shuts it', !(await page.locator('#showAllPanel').isVisible().catch(() => false)), '')
  L.note('phone errors', errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-02-showall', { rows: L.rows })
