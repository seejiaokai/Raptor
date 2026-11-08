/* Chat 29 walk, parts F and H (8 Nov 26). ONLY=F,H1,H2... ; KEEP=1 SHOT_START=n */
import { freshFolder, open, go, press, shot, shotOf, step, sleep, results, errors } from './chat29-lib.mjs'
console.log('chat29-walk3 v1 F-H')
if (!process.env.KEEP) freshFolder()
const PDF = 'C:/Users/User/AppData/Local/Temp/claude/79c2a66160e79596/ac15b142-00e9-4f70-9a96-99d4ee2f1d47/scratchpad/small.pdf'
const T = (page, id) => page.locator(`[data-testid="${id}"]`)
const W = '[data-testid="win-inputedit"]'
const popOpen = p => p.locator('#inTypePop').count()

/* ---------- F ---------- */
{
  const h = await open({ width: 1536, height: 864 }), p = h.page
  await go(p, 'inputs'); await press(h, '#inMedBtn'); await sleep(500); await press(h, '#medNew'); await p.waitForSelector(W); await sleep(800)
  await step('F1', '? opens the card; press outside closes it', async () => {
    await press(h, '#inTypeHelp'); await sleep(500)
    const n1 = await popOpen(p), pic1 = await shot(p, 'F1-type-help-card-open')
    await p.mouse.click(700, 700); await sleep(500)
    const n2 = await popOpen(p), win = await p.locator(W).count()
    return { ok: n1 === 1 && n2 === 0 && win === 1, note: `card after ?: ${n1}; after pressing outside: ${n2}; window still open: ${win}`, pics: [pic1, await shot(p, 'F1-after-press-outside')] }
  })
  await step('F2', '? then Escape: card closes, window stays', async () => {
    await press(h, '#inTypeHelp'); await sleep(500); const n1 = await popOpen(p)
    await p.keyboard.press('Escape'); await sleep(500)
    const n2 = await popOpen(p), win = await p.locator(W).count()
    return { ok: n1 === 1 && n2 === 0 && win === 1, note: `card after ?: ${n1}; after Escape: ${n2}; window open: ${win}`, pics: [await shot(p, 'F2-after-escape')] }
  })
  await step('F3', '? open, then Add with a missing document: card closes when the question appears; stays closed after', async () => {
    await T(p, 'inpEdCal-day-2026-07-20').click({ force: true }).catch(() => {}); await sleep(300)
    await press(h, '#inTypeHelp'); await sleep(500); const n1 = await popOpen(p)
    const add = p.locator(W + ' button', { hasText: /^Add$/ }).first()
    await add.focus(); await p.keyboard.press('Enter'); await sleep(900)
    const n2 = await popOpen(p), q = await p.getByText('No medical document', { exact: false }).count()
    const front = await p.evaluate(() => { const m = [...document.querySelectorAll('div')].filter(e => /^No medical document/.test((e.textContent || '').trim()) && e.getBoundingClientRect().width > 100 && e.getBoundingClientRect().width < 600).sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width).slice(-1)[0]; if (!m) return 'no question'; const r = m.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return m.contains(e) ? 'question in front' : 'something covers the question: ' + (e && e.className) })
    const pic1 = await shot(p, 'F3-question-up-card-gone')
    await p.getByText('No medical document').first().locator('xpath=ancestor::*[.//button][1]').locator('button').first().click().catch(async () => { await p.keyboard.press('Escape') }); await sleep(600)
    const q2 = await p.getByText('No medical document', { exact: false }).count(), n3 = await popOpen(p), win = await p.locator(W).count()
    const pic2 = await shot(p, 'F3-question-closed-card-stays-closed')
    await press(h, '#inTypeHelp'); await sleep(500); const n4 = await popOpen(p)
    return { ok: n1 === 1 && n2 === 0 && q === 1 && front === 'question in front' && q2 === 0 && n3 === 0 && win === 1 && n4 === 1, note: `card open before Add: ${n1}; with question showing: card ${n2}, question sheets ${q}, ${front}; after closing the question: question ${q2}, card ${n3}, window ${win}; ? pressed again: card ${n4}`, pics: [pic1, pic2, await shot(p, 'F3-card-reopened-by-question-mark')] }
  })
  await step('F4', 'card closes by itself when the window closes', async () => {
    await p.keyboard.press('Escape'); await sleep(400)
    await p.keyboard.press('Escape'); await sleep(500)
    const n = await popOpen(p), win = await p.locator(W).count()
    return { ok: n === 0, note: `after two Escapes: card ${n}, window ${win}`, pics: [await shot(p, 'F4-after-escapes')] }
  })
  await h.browser.close()
}

/* ---------- H ---------- */
const ring = async (p, sel) => p.evaluate(s => { const out = []; for (const e of document.querySelectorAll(s)) { const c = getComputedStyle(e); const cls = typeof e.className === 'string' ? e.className : ''; if (/fresh|innew|just|added|ring/i.test(cls) || e.hasAttribute('data-fresh')) out.push(`${e.tagName}.${cls.slice(0, 40)} shadow=${c.boxShadow.slice(0, 50)} outline=${c.outlineColor}`) } return out.slice(0, 3).join(' ; ') || 'none' }, sel)
for (const phone of [false, true]) {
  const tag = phone ? 'phone' : '1536'
  const h = await open(phone ? { width: 390, height: 844, phone: true } : { width: 1536, height: 864 }), p = h.page
  const id = `H1-${tag}`
  await step(id, `Inputs page, file + edit + delete one input (${tag})`, async () => {
    const notes = [], pics = []
    await go(p, 'inputs'); await press(h, '#inListBtn'); await sleep(400)
    await press(h, '#inRangeBtn'); await sleep(300); await press(h, '#inRangeAll'); await sleep(500)
    const rows0 = await p.locator('#inBody tr, .in-card, [data-testid^="in-row"]').count()
    await press(h, '#inNew'); await p.waitForSelector(W); await sleep(700)
    await T(p, 'inpEdCal-day-2026-07-22').click({ force: true }); await sleep(300)
    pics.push(await shot(p, `${id}-form-filled`))
    await p.locator(W + ' button', { hasText: /^Add$/ }).last().click(); await sleep(600)
    pics.push(await shot(p, `${id}-question-after-add`))
    const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { notes.push('question: No document, answered No document'); await press(h, 'button:has-text("No document")'); await sleep(500) }
    pics.push(await shot(p, `${id}-right-after-add`))
    const r1 = await ring(p, '#inBody tr, .in-card, .icard, [data-testid^="in-row"]'); notes.push(`ring after Add: ${r1}; windows ${await p.locator(W).count()}`)
    const q = await p.locator('.modal:not([hidden])').count(); notes.push(`question sheets ${q}`)
    const rows1 = await p.locator('#inBody tr, .in-card, [data-testid^="in-row"]').count(); notes.push(`rows ${rows0} -> ${rows1}`)
    const row = p.locator('tr.innew, .icard.innew').first()
    notes.push(`new row found ${await row.count()}`)
    if (await row.count()) {
      await row.scrollIntoViewIfNeeded(); pics.push(await shot(p, `${id}-new-row-in-view`))
      await (phone ? row.tap() : row.locator('.in-open').first().click()); await sleep(800)
      const rem = p.locator(W + ' input[type="text"], ' + W + ' [data-testid="inp-remarks"], ' + W + ' #inpEdRemarks').first()
      const remN = await p.locator(W + ' input').count(); notes.push(`window inputs ${remN}`)
      pics.push(await shot(p, `${id}-opened-to-edit`))
      const rm = p.locator(W + ' .field, ' + W).locator('input:not([type]), input[type="text"]').first()
      await rm.fill('walk remark'); await sleep(200)
      await p.locator(W + ' button', { hasText: /^Save$/ }).first().click(); await sleep(700)
      pics.push(await shot(p, `${id}-after-save`))
      const txt = await p.locator('tr, .icard').filter({ hasText: /walk remark/ }).first().innerText().catch(() => '')
      notes.push(`row text after save has remark: ${/walk remark/.test(txt)}`)
      // calendar shows it
      await press(h, '#inCalBtn'); await sleep(600)
      for (let i = 0; i < 12; i++) { const m = await p.locator('#inpCal .ic-mon').innerText(); if (/JULY/i.test(m)) break; const mi = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'].findIndex(x => m.toUpperCase().startsWith(x)); await press(h, mi < 6 ? '#icNext' : '#icPrev'); await sleep(450) }
      const bar = await p.locator('#inpCal .ib-bar', { hasText: /Saber/ }).count(), barAny = await p.locator('#inpCal [data-icday="2026-07-22"]').getAttribute('aria-label', { timeout: 3000 }).catch(() => 'cell not found')
      notes.push(`calendar July: bars of Saber ${bar}; 22 Jul cell says "${barAny}"`)
      pics.push(await shot(p, `${id}-calendar-shows-it`))
      await press(h, '#inListBtn'); await sleep(500)
      const row2 = p.locator('tr, .icard').filter({ hasText: /walk remark/ }).first()
      await (phone ? row2.tap() : row2.locator('.in-open').first().click()); await sleep(800)
      await p.locator(W + ' button', { hasText: /^Delete$/ }).first().click(); await sleep(800)
      const left = await p.locator('tr, .icard').filter({ hasText: /walk remark/ }).count()
      notes.push(`after Delete: rows holding the walk remark ${left}; windows ${await p.locator(W).count()}`)
      pics.push(await shot(p, `${id}-after-delete`))
      return { ok: /ring after Add: (?!none)/.test(notes.join(' || ')) && /remark: true/.test(notes.join()) && left === 0, note: notes.join(' || '), pics }
    }
    return { ok: false, note: notes.join(' || '), pics }
  })
  await h.browser.close()
}
for (const phone of [false, true]) {
  const tag = phone ? 'phone' : '1536'
  const h = await open(phone ? { width: 390, height: 844, phone: true } : { width: 1536, height: 864 }), p = h.page
  const id = `H2-${tag}`
  await step(id, `Medical tab, file a medical with a PDF (${tag})`, async () => {
    const notes = [], pics = []
    await go(p, 'inputs'); await press(h, '#inMedBtn'); await p.waitForSelector('#medView .medsec'); await sleep(500)
    const n0 = await p.locator('.medcard').count()
    await press(h, '#medNew'); await p.waitForSelector(W); await sleep(800)
    await T(p, 'inpEdCal-day-2026-07-13').click({ force: true }); await sleep(300)
    await T(p, 'inpEdCal-day-2026-07-14').click({ force: true }); await sleep(300)
    await p.locator(W + ' .docfield input[type=file]').first().setInputFiles(PDF); await sleep(700)
    pics.push(await shot(p, `${id}-form-filled-with-pdf`))
    notes.push(`file inputs ${await p.locator(W + ' .docfield input[type=file]').count()}`)
    await p.locator(W + ' button', { hasText: /^Add$/ }).last().click(); await sleep(600)
    pics.push(await shot(p, `${id}-right-after-add`))
    const q = await p.locator('.modal:not([hidden])').filter({ hasText: /./ }).count(); notes.push(`question sheets ${q}`)
    const n1 = await p.locator('.medcard').count(); notes.push(`cards ${n0} -> ${n1}`)
    const r = await ring(p, '.medcard'); notes.push(`ring: ${r}; windows ${await p.locator(W).count()}`)
    const card = p.locator('.medcard', { hasText: /Saber/ }).first(); notes.push(`new card (Saber) found ${await card.count()}`)
    if (await card.count()) { await card.scrollIntoViewIfNeeded(); const b = await card.boundingBox(), vp = p.viewportSize(); notes.push(`card box y ${Math.round(b.y)} of ${vp.height}`); pics.push(await shot(p, `${id}-new-card-in-sight`)) }
    // as-of
    await press(h, '#medCalBtn'); await sleep(500); pics.push(await shot(p, `${id}-asof-calendar-open`))
    await press(h, '[data-medday="2026-07-08"]'); await sleep(600)
    const asof = await p.locator('#medCalBtn').innerText(); notes.push(`as-of button now "${asof.replace(/\n/g, ' ')}"; cards ${await p.locator('.medcard').count()}`)
    pics.push(await shot(p, `${id}-asof-8-jul`))
    await press(h, '#medToday'); await sleep(600)
    notes.push(`after Today: "${(await p.locator('#medCalBtn').innerText()).replace(/\n/g, ' ')}"; cards ${await p.locator('.medcard').count()}`)
    pics.push(await shot(p, `${id}-back-to-today`))
    return { ok: n1 === n0 + 1 && !/ring: none/.test(notes.join(' ')), note: notes.join(' || '), pics }
  })
  await h.browser.close()
}
console.log('\nERRORS (' + errors.length + ')'); for (const e of errors) console.log('  ' + e)
console.log(JSON.stringify(results.map(r => [r.id, r.ok])))
