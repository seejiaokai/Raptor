/* xc — W3: X6 (medical-clash question) with T1 and O5, X7 (document viewer).   node xc.mjs desk|phone
   Fixture: ATT C 13-15 Jul for Ranger (no document); then ATT B 14-16 Jul for Ranger, which overlaps. For X7 a small picture is
   attached to an HL entry (20-21 Jul) for Quill-like second man 'vandal'? — no: for Ranger again, 27 Jul (no overlap). */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { L, inputsCal, openAdd, fillForm, headOf, judgeHead, rowOut, part } from './lib.mjs'
import { tabRound, t1rows } from './lib2.mjs'
const size = process.argv[2] || 'desk'
console.log('xc.mjs - W3 X6 X7 T1 O5 - ' + size)
const HERE = dirname(fileURLToPath(import.meta.url))
/* a 2x2 red PNG, written under this script's own folder */
const PNG = resolve(HERE, 'tiny.png')
writeFileSync(PNG, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR4nGP8z8Dwn4EIwDiqEAAmzAL/4zrFSQAAAABJRU5ErkJggg==', 'base64'))
const w = await L.world(size)
const p = w.page
const S = `[${size}]`
const head = async (scope, id, name) => {
  await p.evaluate(() => window.clearToast && window.clearToast()); await L.sleep(300)
  const h = await headOf(w, scope), j = judgeHead(h)
  rowOut(`${id} ${name} ${S}`, 'head', "the ✕ in the head's top-right corner (right edge within 20px of the head's), not following the title; nothing in the head overlaps", j.saw, j.ok)
}
const hideToast = on => p.evaluate(on => { const t = document.querySelector('#toastEl'); if (t) t.style.display = on ? 'none' : '' }, on)
const closeDay = async () => { await p.locator('[data-testid="win-inputsday-x"]').click().catch(() => {}); await L.sleep(300) }
try {
  await inputsCal(w, '2026-07-13')
  /* the first entry */
  await openAdd(w, '2026-07-13')
  await fillForm(w, { type: 'ATT C', person: 'bane', allday: true })
  await p.locator('#inpEdCal [data-cal="2026-07-15"]').click()
  await w.press('#inpEditSave')
  await p.waitForSelector('[data-testid="docconf"]'); await w.press('[data-testid="docconf-nodoc"]')
  await p.waitForSelector('#inpEditPop', { state: 'hidden' }); await L.sleep(300); await closeDay()
  /* X6 — the overlapping second entry */
  await part(w, `X6 medical-clash question ${S}`, 'head', 'the ✕ in the corner', async () => {
    await openAdd(w, '2026-07-14')
    await fillForm(w, { type: 'ATT B', person: 'bane', allday: true })
    await p.locator('#inpEdCal [data-cal="2026-07-16"]').click()
    await w.press('#inpEditSave')
    await p.waitForSelector('[data-testid="docconf"]', { timeout: 8000 }); await w.press('[data-testid="docconf-nodoc"]')
    await p.waitForSelector('[data-testid="medclash"]', { timeout: 8000 }); await L.sleep(500)
    await head('[data-testid="medclash"]', 'X6', 'medical-clash question')
    console.log('   clash sheet reads:', (await p.locator('[data-testid="medclash"]').innerText()).replace(/\s+/g, ' '))
    await hideToast(true); await L.pic(w, `x06-${size}-medical-clash`)
    const seg = await p.evaluate(() => [...document.querySelectorAll('[data-testid="medclash"] .seg')].map(e => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); return { bg: c.backgroundColor, padding: c.padding, borderBottom: `${c.borderBottomWidth} ${c.borderBottomStyle} ${c.borderBottomColor}`, w: Math.round(r.width), h: Math.round(r.height), btns: [...e.querySelectorAll('button')].map(b => b.textContent) } }))
    console.log('   O5 clash .seg', JSON.stringify(seg))
    L.row(`O5 medical-clash question answer buttons ${S}`, 'the .seg wrapper (record, no PASS/FAIL)', 'computed background-color, padding, border-bottom of the element wrapping each pair', JSON.stringify(seg), seg.length ? 'RECORD' : 'NOT WALKED')
    const sb = await p.locator('[data-testid="medclash"] .seg').first().boundingBox()
    if (sb) await L.pic(w, `o05-${size}-clash-answer-buttons-close-up`, { clip: { x: Math.max(0, sb.x - 60), y: Math.max(0, sb.y - 40), width: Math.min(w.S.w - Math.max(0, sb.x - 60), sb.width + 120), height: sb.height + 80 } })
    await hideToast(false)
    if (!w.phone) t1rows(`X6 medical-clash question ${S}`, await tabRound(w, '[data-testid="medclash"]'))
    await p.keyboard.press('Escape'); await L.sleep(400)
  })
  /* leave the clash sheet and the form */
  await p.evaluate(() => { document.querySelectorAll('[data-testid="medclash"] .x').forEach(b => b.click()) }); await L.sleep(300)
  await p.locator('#inpEditCancel').click().catch(() => {}); await L.sleep(300)
  await p.locator('[data-testid="win-inputedit-x"]').click().catch(() => {}); await L.sleep(300)
  await closeDay()
  /* X7 — attach a picture to a medical entry, then open it */
  await part(w, `X7 document viewer ${S}`, 'head', 'the ✕ in the corner', async () => {
    await openAdd(w, '2026-07-27')
    await fillForm(w, { type: 'HL', person: 'bane', allday: true })
    await p.setInputFiles('#inpEditPop input[type=file]', PNG); await L.sleep(500)
    console.log('   document chip:', await p.locator('#inpEditPop .docchip').count())
    await w.press('#inpEditSave')
    await p.waitForSelector('#inpEditPop', { state: 'hidden', timeout: 8000 }); await L.sleep(400)
    console.log('   sheets after save:', await p.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"],[data-testid="upconf"],[data-testid="medclash"],[data-testid="docconf"]')].map(e => e.getAttribute('data-testid')).join(',') || 'none'))
    await w.press('[data-testid^="idy-open"]')
    await p.waitForSelector('[data-testid="win-inputedit"]'); await L.sleep(500)
    await w.press('[data-testid="inped-docview"]')
    await p.waitForSelector('#docViewPop:not([hidden])'); await L.sleep(600)
    await head('#docViewPop', 'X7', 'document viewer')
    console.log('   viewer reads:', (await p.locator('#docViewPop').innerText()).replace(/\s+/g, ' ').slice(0, 160), '| image:', await p.locator('#docViewPop .docview-img').count())
    await hideToast(true); await L.pic(w, `x07-${size}-document-viewer`); await hideToast(false)
    await p.locator('#docViewClose').click(); await L.sleep(300)
  })
} finally { await L.close(w) }
