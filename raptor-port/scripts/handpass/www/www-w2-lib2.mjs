/* www w2 helpers 2: Insights, filtered warnings, a window closer, Logic. Imports www-w2-lib.mjs */
export * from './www-w2-lib.mjs'
import { X } from './www-w2-lib.mjs'

/** Insights: open (desktop #insightBtn / #sbInsights; phone via the more menu), screenshot, return its text lines */
export async function insightsLines(w, tag) {
  const page = w.page, P = w.P
  const onBoard = await page.locator('#schedBoard').count()
  const btn = onBoard ? page.locator('#schedBoard #sbInsights:visible, #schedBoard button:visible:text-is("Insights")').first() : page.locator('#insightBtn:visible').first()
  if (await btn.count()) { await btn.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await btn.tap(); else await btn.click() }
  else {
    const more = page.locator('#editSchedMore:visible, #viewSchedMore:visible, #schedBoard [id*="More"]:visible').first()
    if (await more.count()) { if (w.phone) await more.tap(); else await more.click(); await X.sleep(400) }
    const mi = page.locator('[id$="MoreInsights"]:visible').first()
    if (await mi.count()) { if (w.phone) await mi.tap(); else await mi.click() }
  }
  await X.sleep(900)
  await page.screenshot({ path: `${X.SHOTS}/${tag}-insights-${P}.png` })
  const txt = await page.evaluate(() => {
    const el = [...document.querySelectorAll('[class*="insight"], [id*="nsight"]')].filter(e => e.getBoundingClientRect().width > 200).sort((a, b) => b.innerText.length - a.innerText.length)[0]
    return el ? el.innerText : 'NO INSIGHTS WINDOW'
  })
  return txt.split(/\r?\n/).map(s => s.replace(/[\s ]+/g, ' ').trim()).filter(Boolean)
}
export async function closeInsights(w) {
  const page = w.page
  const x = page.locator('[class*="insight"] button:visible, [id*="nsight"] button:visible').filter({ hasText: /^(✕|×|Close)$/ }).first()
  if (await x.count()) { if (w.phone) await x.tap(); else await x.click() } else await page.keyboard.press('Escape')
  await X.sleep(500)
}
/** board warnings filtered by names (the double-turn aggregate and the all-clear line kept) */
export async function bwf(w, re = /Ranger|Ace|Torch/) {
  return (await X.boardWarn(w)).filter(l => re.test(l) || /double turning|No conflicts/.test(l))
}
/** close the avail window by its ✕ */
export async function closeAvail(w) {
  const x = w.page.locator('.availwin:visible button:has-text("✕")').first()
  if (await x.count()) { if (w.phone) await x.tap(); else await x.click(); await X.sleep(300) }
}
/** sign four, publish the day (copied from rcb2-w1-lib, as W1's) */
export async function signAndPublish(w, di) {
  const page = w.page
  const r0 = (await page.locator('#schedBoard:visible').count()) ? '#schedBoard' : '#eWeek'
  const out = {}
  for (const role of ['cur', 'sked', 'plan', 'appr']) {
    const sel = page.locator(`${r0} select[data-sign="${role}"][data-signday="${di}"]:visible`).first()
    if (!(await sel.count())) { out[role] = 'NO SELECT'; continue }
    const opts = await sel.locator('option').evaluateAll(os => os.map(o => o.value).filter(Boolean))
    if (!opts.length) { out[role] = 'NO NAMES'; continue }
    await sel.selectOption(opts[0]); await X.sleep(250)
    out[role] = await sel.evaluate(s => s.options[s.selectedIndex]?.text || '')
  }
  let which = null
  for (const attr of ['data-beak', 'data-alpub']) {
    const b = page.locator(`${r0} [${attr}="${di}"]:visible`).first()
    if (await b.count()) { which = attr; if (await b.isDisabled()) return { pressed: false, why: 'disabled ' + (await b.getAttribute('title')), signs: out }
      await b.evaluate(e => e.scrollIntoView({ block: 'center' })); if (w.phone) await b.tap(); else await b.click(); await X.sleep(900); break }
  }
  if (!which) return { pressed: false, why: 'no publish button', signs: out }
  const ok = page.getByRole('button', { name: /^(Publish|Yes|Confirm)/ }).first()
  if (await ok.count() && await ok.isVisible().catch(() => false)) { await ok.click(); await X.sleep(900) }
  return { pressed: true, which, signs: out }
}
export const chipRead =(w, k) => w.page.evaluate(s => { const e = document.querySelector(`#schedBoard [data-slot="${s}"] .oilcount`); return e ? e.innerText.trim() : null }, k)
