// W2 scenarios 1, 2, 13 (and 14's pictures for 1 and 2) — one context per size. VERSION 1
// usage: node s12.mjs desktop|phone
import { openWorld, tools, adminCategory, adminBack } from './lib.mjs'
const WHICH = process.argv[2] || 'desktop'
const CS = WHICH === 'desktop' ? 'Wraith' : 'Specter'
const INI = WHICH === 'desktop' ? 'WR' : 'SP'
console.log(`s12 VERSION 1 — ${WHICH} callsign ${CS}`)
const w = await openWorld(WHICH)
const { page, TOUCH } = w
const t = tools(w, `${WHICH}-s12`)
const px = `s12-${WHICH}`
const today = t.addDays(0)
const in10 = t.addDays(10), in21 = t.addDays(21)
console.log(`today ${today}, in10 ${in10}, in21 ${in21}`)
const lc = CS.toLowerCase()

async function lwLook(label, dates) {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(800)
  await page.evaluate(() => window.lwSetRole && window.lwSetRole('admin')); await page.waitForTimeout(300)
  const mon = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][+today.slice(5, 7) - 1]
  if (await page.locator(`[data-testid="month-${mon}"]`).count()) { await t.press(`[data-testid="month-${mon}"]`); await page.waitForTimeout(600) }
  const pid = await page.evaluate(c => { const e = [...document.querySelectorAll('span.cs')].find(x => x.textContent.trim().toLowerCase() === c); const r = e && e.closest('tr'); const m = r && /^row-(.+)$/.exec(r.getAttribute('data-testid') || ''); return m ? m[1] : null }, lc)
  console.log(`  ${label}: his person id on the war: ${pid}`)
  const row = page.locator(`[data-testid="cell-${pid}-${today}"]`)
  console.log(`  ${label}: his cell for today exists: ${await row.count()}`)
  const out = {}
  for (const d of dates) {
    out[d] = await page.evaluate(([c, d]) => { const e = document.querySelector(`[data-testid="cell-${c}-${d}"]`); if (!e) return null; const cs = getComputedStyle(e); return { cls: e.className, txt: (e.innerText || '').trim().slice(0, 40), bg: cs.backgroundColor, title: e.getAttribute('title') || e.getAttribute('aria-label') || '' } }, [pid, d])
    console.log(`   ${d}: ${JSON.stringify(out[d])}`)
  }
  if (await row.count()) { await row.first().scrollIntoViewIfNeeded(); await page.waitForTimeout(300) }
  return out
}

// ---------- scenario 1
await adminCategory(page, '^Users')
await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
await page.fill('#accAddCs', CS); await page.fill('#accAddIni', INI)
await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
const before = await t.text('#accAddPostIn'), beforeVal = await t.val('#accAddPostIn')
console.log(`S1 Post in reads before: "${before.replace(/\s+/g, ' ')}" data-value ${beforeVal}`)
await t.press('#accAddPostIn')
const c1 = await t.cardOnTop('Post in (add)')
await t.shot('s1-postin-open')
const iso1 = in10
const c1m = c1.month
console.log(`calendar month ${c1m}; picking ${iso1}`)
await t.pick(iso1)
const after = await t.text('#accAddPostIn'), afterVal = await t.val('#accAddPostIn')
const gone = !(await t.vis('[data-testid="dcal-card"]'))
console.log(`S1 Post in after: "${after.replace(/\s+/g, ' ')}" data-value ${afterVal}; calendar gone ${gone}`)
await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
await t.shot('s1-postin-picked')
await t.press('#accAdd'); await page.waitForTimeout(500)
const added = await page.locator('#accList').innerText().then(s => s.includes(CS))
const toast = await page.evaluate(() => (document.querySelector('.toast, #toast, [role=status]') || {}).innerText || '')
console.log(`S1 added: roster list contains ${CS}: ${added}; toast: ${toast}`)
await t.shot('s1-added')
const todayWords = await page.evaluate(d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), today)
console.log(`today in words: ${todayWords}`)
t.rec('1', WHICH, (before.includes(todayWords.replace(',', '')) || beforeVal === today) && afterVal === iso1 && added && c1.wholly && c1.onTop ? 'PASS' : 'CHECK', `before="${before.replace(/\s+/g,' ')}" (${beforeVal}); card wholly=${c1.wholly} onTop=${c1.onTop}; after="${after.replace(/\s+/g,' ')}" (${afterVal}); calendar gone=${gone}; added=${added}`, `${WHICH}-s1-postin-open.png / s1-postin-picked.png`)

// Leave War look
const lw1 = await lwLook('LW after add', [today, t.addDays(5), t.addDays(9), in10, t.addDays(11)])
await t.shot('s1-leavewar-row')

// ---------- scenario 2
await adminCategory(page, '^Users')
await page.fill('#accFind', CS); await page.waitForTimeout(300)
await page.locator('#accList .acc-main', { hasText: CS }).first().scrollIntoViewIfNeeded()
await t.press(`#accList .acc-main:has-text("${CS}")`)
await t.shot('s2-edit-open')
await page.locator('#accEdArchive').scrollIntoViewIfNeeded()
await t.press('#accEdArchive'); await page.waitForTimeout(500)
await t.shot('s2-archived')
console.log('S2 archive pressed; roster list contains him still:', await page.locator('#accList').innerText().then(s => s.includes(CS)))
await page.fill('#accFind', '').catch(() => {})
if (await page.locator('#accArchToggle').count()) {
  if ((await page.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') await t.press('#accArchToggle')
}
await page.waitForTimeout(300)
await t.press(`#accArchList .acc-main:has-text("${CS}")`)
await page.locator('#accArPostIn').scrollIntoViewIfNeeded()
const b2 = await t.text('#accArPostIn'), b2v = await t.val('#accArPostIn')
console.log(`S2 Restore Post in before: "${b2.replace(/\s+/g, ' ')}" (${b2v})`)
await t.shot('s2-restore-form')
await t.press('#accArPostIn')
const c2 = await t.cardOnTop('Post in (restore)')
await t.shot('s2-restore-calendar-open')
// the date three weeks on may be in next month — use next arrow if needed
if (!(await t.vis(`[data-testid="dcal-day-${in21}"]`))) { await t.press('[data-testid="dcal-next"]') }
await t.pick(in21)
const a2 = await t.text('#accArPostIn'), a2v = await t.val('#accArPostIn')
console.log(`S2 Restore Post in after: "${a2.replace(/\s+/g, ' ')}" (${a2v}); gone ${!(await t.vis('[data-testid="dcal-card"]'))}`)
await page.locator('#accArPostIn').scrollIntoViewIfNeeded()
await t.shot('s2-restore-picked')
await t.press('#accArRestore'); await page.waitForTimeout(600)
const restored = await page.locator('#accList').innerText().then(s => s.includes(CS))
console.log(`S2 restored: roster contains ${CS}: ${restored}`)
await t.shot('s2-restored')
t.rec('2', WHICH, (b2v === today) && a2v === in21 && restored ? 'PASS' : 'CHECK', `Restore Post in before="${b2.replace(/\s+/g,' ')}" (${b2v}); card wholly=${c2.wholly} onTop=${c2.onTop}; after="${a2.replace(/\s+/g,' ')}" (${a2v}); restored=${restored}`, `${WHICH}-s2-restore-calendar-open.png / s2-restore-picked.png`)
const lw2 = await lwLook('LW after restore', [today, in10, t.addDays(15), t.addDays(20), in21, t.addDays(22)])
await t.shot('s2-leavewar-row')

// ---------- scenario 13: reload
await page.reload(); await page.waitForSelector('#luser', { timeout: 5000 }).then(async () => { console.log('  (sign-in asked after reload)'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]') }).catch(() => {})
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await adminCategory(page, '^Users')
await page.fill('#accFind', CS); await page.waitForTimeout(300)
const still = await page.locator('#accList').innerText().then(s => s.includes(CS))
console.log(`S13 after reload: roster contains ${CS}: ${still}`)
const lw3 = await lwLook('LW after reload', [today, in10, t.addDays(15), t.addDays(20), in21, t.addDays(22)])
await t.shot('s13-leavewar-after-reload')
const same = JSON.stringify(lw3) === JSON.stringify(lw2)
console.log(`S13 Leave War cells same as before reload: ${same}`)
t.rec('13', WHICH, still && same ? 'PASS' : 'CHECK', `after reload roster has ${CS}=${still}; his Leave War cells identical to before=${same}`, `${WHICH}-s13-leavewar-after-reload.png`)

console.log('RESULTS', JSON.stringify(t.results, null, 1))
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
