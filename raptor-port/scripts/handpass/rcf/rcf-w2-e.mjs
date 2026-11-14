console.log('rcf-w2-e v1 — W2 item 9 (plain-user round, warnings half, what fits): ⓘ / jump / hide / Reset / Undo / Redo; Friday publish with a hide + member view')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'e1'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w2/' + RUN)
const W = await import('./rcf-w2-lib.mjs')
const F = await import('./rcf-w2-fx.mjs')
const { L, sleep, check, PASSIF, shot } = W
const { DI, sortie, ground, readAll } = F
process.env.SEV = '1'
const browser = await W.launch()
const warnCrop = (page, name) => page.locator('#schedBoard .sb-warn').first().screenshot({ path: process.env.HP_SHOTS + '/' + name + '.png' }).then(() => name + '.png')
const { page, ctx } = await W.world(browser)
const bane = await W.pid(page, 'Ranger')
await W.openBoard(page, DI)
await sortie(page, { who: bane, to: '1200', ld: '1300' })
await ground(page, { who: bane })
await W.openWarnFold(page)
let o = await readAll(page, bane, 'built')
const ix = Number(F.clashLine(o).split(':')[0])
/* the top bar's buttons (names) */
const bar = await page.evaluate(() => [...document.querySelectorAll('#schedBoard button')].filter(b => b.getBoundingClientRect().width > 0 && b.getBoundingClientRect().top < 120).map(b => (b.id || '') + '|' + (b.title || b.getAttribute('aria-label') || '') + '|' + (b.innerText || '').trim().slice(0, 14)))
console.log('BAR', JSON.stringify(bar))
/* jump from the warning to its man: tap the line's text */
await page.locator(`#schedBoard .wln[data-wix="${ix}"] .wln-t`).first().click(); await sleep(500)
const lit = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck')].filter(e => /\bwfocus|\bfocus|\blit|\bwsel/.test(String(e.className))).map(e => e.className.slice(0, 80)))
console.log('jump: pucks with a focus-ish class', JSON.stringify(lit), '| scrolled', await page.evaluate(() => Math.round(window.scrollY)))
check('I9.1 (record) tap the warning line: jump to its man', 'RECORD', 'focus-ish pucks: ' + JSON.stringify(lit), 'i9-1-jump.png'); await shot(page, 'i9-1-jump')
/* ⓘ of the warning: look for an info control on the line */
const info = await page.evaluate(i => { const l = document.querySelector(`#schedBoard .wln[data-wix="${i}"]`); return l ? [...l.querySelectorAll('button, [data-wdi], [data-wix]')].map(b => b.tagName + ' ' + (b.title || '') + ' ' + Object.keys(b.dataset).join(',')).join(' ; ') : 'none' }, ix)
console.log('line controls', info)
await W.hideIx(page, DI, ix)
o = await readAll(page, bane, 'hidden')
PASSIF('I9.2 hide with ✕', /HID\+struck/.test(F.clashLine(o) || ''), JSON.stringify(F.clashLine(o)), 'i9-2-hidden.png'); await shot(page, 'i9-2-hidden')
/* Undo / Redo */
const undo = page.locator('#schedBoard button[title^="Undo"], #schedBoard #sbUndo, #schedBoard [data-undo]').first()
if (await undo.count()) {
  await undo.click(); await sleep(600)
  o = await readAll(page, bane, 'after Undo')
  PASSIF('I9.3 Undo takes the hide back (clash live and red again)', /:live/.test(F.clashLine(o) || ''), JSON.stringify(F.clashLine(o)) + ' | rings ' + o.boardRings, 'i9-3-undo.png'); await shot(page, 'i9-3-undo')
  const redo = page.locator('#schedBoard button[title^="Redo"], #schedBoard #sbRedo, #schedBoard [data-redo]').first()
  await redo.click(); await sleep(600)
  o = await readAll(page, bane, 'after Redo')
  PASSIF('I9.4 Redo hides it again', /HID/.test(F.clashLine(o) || ''), JSON.stringify(F.clashLine(o)) + ' | rings ' + o.boardRings, 'i9-4-redo.png'); await shot(page, 'i9-4-redo')
} else check('I9.3 Undo / Redo', 'NOT WALKED', 'no Undo control found by title/id: ' + JSON.stringify(bar), '')
/* bring back with ↺ Reset */
o = await readAll(page, bane, 'before reset')
const ixh = Number((o.lines.find(l => /HID/.test(l)) || '0').split(':')[0])
await W.hideIx(page, DI, ixh)
o = await readAll(page, bane, 'after Reset')
PASSIF('I9.5 ↺ Reset brings the warning back', /:live/.test(F.clashLine(o) || '') && o.boardRings.some(x => /RED/.test(x)), JSON.stringify(F.clashLine(o)) + ' | rings ' + o.boardRings, 'i9-5-reset.png'); await shot(page, 'i9-5-reset')
/* ⓘ: the day's per-warning info is the tap on the puck's chip; try the chip */
await page.close()
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify({ results: W.results, errors: W.errorsAll }, null, 1))
console.log('ERRORS', JSON.stringify(W.errorsAll.slice(0, 5)))
await browser.close()
console.log('DONE', W.results.filter(r => r.verdict === 'PASS').length + '/' + W.results.length)
