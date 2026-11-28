// draw-r6-posting-today - round 6, the posting sheet as it is TODAY (chat 188's fresh Fable through the design skill,
// 26 Nov 26; brief docs/superpowers/briefs/2026-11-26-msq-r6-posting-sheet-brief.md, his D2648). Nothing is drawn here:
// the real Leave War's sheet is opened by a person's presses (Hunter, 142's admin: Cinch's Mon 14 Dec → ⋯ → Post out;
// the same → Post in), pictured, measured and closed with nothing posted. Pictures p6-{d,p}-today-{postout,postin}.
//   node raptor-port/scripts/handpass/n176/draw-r6-posting-today.mjs
import { run, as, FACT, wait, hit, shot, box, closeAll, go, TMP, r5bWorld } from './draw-r5b-lib.mjs'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
const R6 = resolve(TMP, 'r6-users-state.json')
const ST = existsSync(R6) ? R6 : await r5bWorld()
export async function openDay(s, pid = 'snap', day = '2026-12-14') {
  await go(s, 'leavewar'); await wait(s, 2500)
  const cell = s.page.locator(`[data-testid="cell-${pid}-${day}"]`).first()
  await cell.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await wait(s, 500)
  const cb = await cell.boundingBox()
  if (s.desk) await s.page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2); else await s.page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2)
  await wait(s, 800)
}
const facts = s => s.page.evaluate(() => {
  const d = [...document.querySelectorAll('.bidsheet[role="dialog"]')].pop(); if (!d) return null
  const r = e => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) } }
  const st = e => { const c = getComputedStyle(e); return `${c.fontSize}/${c.fontWeight} ${c.color} bg ${c.backgroundColor} bd ${c.borderTopWidth} ${c.borderTopColor} r ${c.borderTopLeftRadius} pad ${c.paddingTop} ${c.paddingRight} ls ${c.letterSpacing} ${c.fontFamily.slice(0, 40)}` }
  return {
    sheet: r(d), sheetLook: st(d), rows: [...d.children].map(e => ({ cls: e.className, box: r(e), words: e.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) })),
    parts: [...d.querySelectorAll('.bidsheet-row.postout *, .bidsheet-hd *')].filter(e => e.children.length === 0 || e.tagName === 'BUTTON').map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 40), words: e.textContent.trim().slice(0, 50), box: r(e), look: st(e) })).filter(p => p.box.w > 0).slice(0, 40),
  }
})
try {
  for (const sz of ['d', 'p']) for (const which of ['postout', 'postin']) await run(`p6.today.${which}.${sz}`, sz, async s => {
    const k = `p6-${sz}-today-${which}`
    await as(s, 'hunter'); await openDay(s)
    await hit(s, '[data-testid="bid-more"]', 500); await hit(s, `[data-testid="bid-${which}"]`, 700)
    const f = await facts(s); FACT(`${k}.sheet`, { sheet: f?.sheet, rows: f?.rows })
    writeFileSync(resolve(TMP, `${k}-parts.json`), JSON.stringify(f, null, 1))
    await s.page.evaluate(() => document.activeElement?.blur())
    await shot(s, k, [await box(s, '.bidsheet[role="dialog"]')], 16)
    await s.page.keyboard.press('Escape'); await wait(s, 400)
    FACT(`${k}.closedNothingPosted`, { sheets: await s.page.locator('.bidsheet[role="dialog"]:visible').count() })
  }, { state: ST })
} finally { await closeAll() }
