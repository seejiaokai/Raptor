/* [UI-CONSISTENCY-LOOK] round 2 (D1124) — the pictures put to him: each mismatch ringed on the real app, and beside it
   the recommended look DRAWN on the running app (a style or a class changed in the page, nothing saved). Desktop
   1536 × 864 (his PC), phone 402 × 874 (touch). Every picture is real except the ones named "-proposed".
   The pattern is round 1's bsw-consistency-look.mjs.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/cr2-look.mjs → <folder>/ */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PHONE = { width: 402, height: 874 }
const ONLY = process.env.CR2_ONLY || ''   // e.g. "q11" to redo one question's pictures
const want = q => !ONLY || ONLY.split(',').includes(q)
async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGE ERROR', e.message))
  await page.goto(BASE + '/'); await login(page, 'a')
  await page.addStyleTag({ content: '.toast,.snack,[role=status].toast{display:none!important}' })
  return { ctx, page }
}
/* ring each selector's box (amber, numbered) — drawn over the page, not part of it */
async function ring(page, marks) {
  await page.evaluate(marks => {
    document.querySelectorAll('.zz-ring').forEach(e => e.remove())
    for (const [sel, n] of marks) {
      const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)
      if (!els.length) throw new Error('ring: nothing at ' + sel)
      const rs = els.map(e => e.getBoundingClientRect())
      const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top)), r = Math.max(...rs.map(r => r.right)), b = Math.max(...rs.map(r => r.bottom))
      const d = document.createElement('div'); d.className = 'zz-ring'
      d.style.cssText = `position:fixed;left:${l - 4}px;top:${t - 4}px;width:${r - l + 8}px;height:${b - t + 8}px;border:3px solid #ffb020;border-radius:10px;z-index:99999;pointer-events:none`
      if (n) { const s = document.createElement('span'); s.textContent = n; s.style.cssText = 'position:absolute;left:-3px;' + (t < 30 ? 'bottom:-24px;' : 'top:-24px;') + 'background:#ffb020;color:#000;font:800 13px/20px sans-serif;padding:0 7px;border-radius:6px'; d.appendChild(s) }
      document.body.appendChild(d)
    }
  }, marks)
}
const unring = page => page.evaluate(() => document.querySelectorAll('.zz-ring').forEach(e => e.remove()))
/* a strip of the page: from y to y+h (page pixels), the full width or a part */
const strip = (page, name, y, h, vp, x = 0, w = vp.width) => page.screenshot({ path: `${OUT}/${name}.png`, clip: { x, y: Math.max(0, y), width: w, height: h } })
const boxOf = (page, sel) => page.evaluate(sel => {
  const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)
  if (!els.length) return null
  const rs = els.map(e => e.getBoundingClientRect())
  return { x: Math.min(...rs.map(r => r.left)), y: Math.min(...rs.map(r => r.top)), r: Math.max(...rs.map(r => r.right)), b: Math.max(...rs.map(r => r.bottom)) }
}, sel)
const press = async (page, sel, touch) => { const l = page.locator(sel).first(); if (touch) await l.tap(); else await l.click(); await sleep(450) }
/* The Tracker's buttons whose mark is a typed character (ⓘ ✎ ☰ ⇪ ⌃ 🗺) — an iPhone draws several as coloured emoji, and
   none is the app's own line icon. Each gets the class zz-g so it can be ringed. */
const GLYPHS = ['ⓘ', '✎', '☰', '⇪', '⌃', '^', '🗺']
async function tagGlyphs(page) {
  return page.evaluate(G => {
    const out = []
    for (const b of document.querySelectorAll('#page-tracker button')) {
      if (!b.getBoundingClientRect().width) continue
      const t = b.textContent.trim()
      if (G.some(g => t.startsWith(g))) { b.classList.add('zz-g'); out.push(t) }
    }
    return out
  }, GLYPHS)
}
/* the proposed look: each character swapped for the app's line icon (Lucide shapes, as src/ui/icons.tsx draws them) */
async function iconify(page) {
  await page.evaluate(() => {
    const S = '<svg class="zz-ic" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-3px">'
    const ICON = {
      'ⓘ': S + '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      '✎': S + '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
      '☰': S + '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
      '⇪': S + '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
      '⌃': S + '<path d="m18 15-6-6-6 6"/></svg>', '^': S + '<path d="m18 15-6-6-6 6"/></svg>',
      '🗺': S + '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15"/><path d="M15 6v15"/></svg>',
    }
    for (const b of document.querySelectorAll('#page-tracker button.zz-g')) {
      const t = b.textContent.trim(); const g = Object.keys(ICON).find(k => t.startsWith(k)); if (!g) continue
      const rest = t.slice(g.length).trim()
      /* a menu button keeps its own arrow (▾) after the word */
      const arrow = b.querySelector('.caret, .arr'); b.innerHTML = ICON[g] + (rest ? '<span style="margin-left:6px">' + rest.replace(/[▾▼]\s*$/, '').trim() + '</span>' : '') + (/[▾▼]\s*$/.test(rest) ? '<span style="margin-left:4px;font-size:9px">▾</span>' : '')
      void arrow
    }
  })
  await sleep(200)
}
async function openBoard(page) {
  await go(page, 'editsched'); await sleep(400)
  await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(600)
}

{ /* ---- the desktop ---- */
  const { ctx, page } = await world(PC, false)

  if (want('q14')) { /* Quals while editing: Done (blue) beside Edit quals (blue at rest) */
    await go(page, 'quals'); await sleep(400); await press(page, '#qEdit', false)
    const b = await boxOf(page, '.qbar')
    await ring(page, [['#qSave', '1'], ['#qEditQuals', '2']]); await strip(page, 'q14-quals-editing-today', b.y - 30, b.b - b.y + 50, PC, 0, 900); await unring(page)
    /* proposed: Edit quals plain until pressed (as ✎ Edit is), so Done is the one blue */
    await page.evaluate(() => document.querySelector('#qEditQuals').classList.remove('primary'))
    await ring(page, [['#qSave', '1'], ['#qEditQuals', '2']]); await strip(page, 'q14-quals-editing-proposed', b.y - 30, b.b - b.y + 50, PC, 0, 900); await unring(page)
    /* and once Edit quals is pressed (unchanged: "✕ Edit quals", plain) */
    await press(page, '#qEditQuals', false)
    await ring(page, [['#qSave', '1'], ['#qEditQuals', '2']]); await strip(page, 'q14-quals-inside-today', b.y - 30, b.b - b.y + 50, PC, 0, 900); await unring(page)
    await press(page, '#qSave', false)
    /* Logic's pair, for comparison */
    await go(page, 'logic'); await sleep(400); await press(page, '#lgEdit', false)
    const lb = await boxOf(page, '#lgDone')
    await ring(page, [['#lgDone', '']]); await strip(page, 'q14-logic-editing', lb.y - 30, lb.b - lb.y + 60, PC, 0, 900); await unring(page)
    await press(page, '#lgDone', false)
  }

  if (want('q13')) { /* Undo / Redo: the top bar's arrows (D1126) against the Scheduler Board's own bar, in words */
    await go(page, 'editsched'); await sleep(400)
    await ring(page, [['#undoBtn,#redoBtn,#histBtn,#fastSync', '1']]).catch(() => ring(page, [['#undoBtn,#redoBtn,#fastSync', '1']]))
    await strip(page, 'q13-editsched-topbar', 0, 100, PC); await unring(page)
    await openBoard(page)
    const bb = await boxOf(page, '#sbUndo,#sbRedo')
    await ring(page, [['#sbUndo,#sbRedo,#sbHist,#sbSync', '2']]); await strip(page, 'q13-board-today', 0, bb.b + 20, PC); await unring(page)
    /* proposed: the board's Undo, Redo, History and sync drawn as the top bar draws them to 1599 — the icons only, the
       names on hover, the sync pill its dot */
    await page.addStyleTag({ content: '#sbUndo .bl,#sbRedo .bl,#sbHist .bl{display:none!important} #sbUndo,#sbRedo,#sbHist{width:34px;min-width:0!important;padding-left:0!important;padding-right:0!important;justify-content:center} #sbSync .synclbl,#sbSyncLbl{display:none!important} #sbSync .dot{margin:0}' })
    await sleep(200)
    await ring(page, [['#sbUndo,#sbRedo,#sbHist,#sbSync', '2']]); await strip(page, 'q13-board-proposed', 0, bb.b + 20, PC); await unring(page)
    await page.evaluate(() => document.querySelector('#sbDone')?.click()); await sleep(400)
    await page.evaluate(() => document.querySelectorAll('style').forEach(s => { if (s.textContent.includes('#sbUndo .bl')) s.remove() }))
  }

  if (want('q5')) { /* the Highlight control three ways */
    await go(page, 'editsched'); await sleep(400)
    const wk = await boxOf(page, '#page-editsched .hl-lab')
    await ring(page, [['#page-editsched .hl-lab', '1']]); await strip(page, 'q5-week-today', wk.y - 40, wk.b - wk.y + 80, PC); await unring(page)
    await openBoard(page)
    const bd = await boxOf(page, '#sbHl')
    await ring(page, [['#sbHl', '2']]); await strip(page, 'q5-board-today', bd.y - 30, bd.b - bd.y + 60, PC)
    await unring(page); await press(page, '#sbHl', false)
    const bo = await boxOf(page, '#schedBoard .hlrow, #schedBoard .hl-gtab')
    await ring(page, [['#sbHl', '2']]); await strip(page, 'q5-board-open', bd.y - 30, (bo ? bo.b : bd.b) - bd.y + 60, PC); await unring(page)
    await press(page, '#sbHl', false)
    /* proposed: on a desktop the board does as the week does — the toggle (which folds nothing at this width) goes, and
       the highlighter mark leads the CAT / TYPE / QUALS row as a quiet label */
    await page.evaluate(() => {
      const b = document.querySelector('#sbHl'); const svg = b.querySelector('svg').cloneNode(true); b.style.display = 'none'
      const lab = document.createElement('span'); lab.className = 'lab hl-lab zz-lab'; lab.title = 'Highlight'; lab.appendChild(svg)
      const strip = document.querySelector('#sbHlStrip'); strip.insertBefore(lab, strip.firstChild)
    })
    await sleep(200)
    await ring(page, [['.zz-lab', '2']]); await strip(page, 'q5-board-proposed', bd.y - 30, (bo ? bo.b : bd.b) - bd.y + 60, PC); await unring(page)
    await page.evaluate(() => { document.querySelector('.zz-lab')?.remove(); document.querySelector('#sbHl').style.display = '' })
    await page.evaluate(() => document.querySelector('#sbDone')?.click()); await sleep(400)
    await go(page, 'inputs'); await sleep(400); await press(page, '#inSansMode', false)
    const sc = await boxOf(page, '[data-testid=sc-hl]')
    await ring(page, [['[data-testid=sc-hl]', '3']]); await strip(page, 'q5-sans-today', sc.y - 30, sc.b - sc.y + 60, PC); await unring(page)
    await press(page, '#inPendingMode, #inInputsMode, [data-mode=inputs]', false).catch(() => {})
  }

  if (want('q11')) { /* the Tracker's emoji icons and its own button look */
    await go(page, 'tracker'); await sleep(900)
    const hb = await boxOf(page, '#page-tracker header, #page-tracker .hdr, #page-tracker #hdr')
    console.log('tracker header box', JSON.stringify(hb))
    const glyphs = await tagGlyphs(page)
    console.log('tracker glyph buttons:', glyphs.join(' | '))
    await ring(page, [['.zz-g', '']]); await strip(page, 'q11-tracker-today', hb.y - 2, hb.b - hb.y + 40, PC, 0, 1100); await unring(page)
    await iconify(page)
    await ring(page, [['.zz-g', '']]); await strip(page, 'q11-tracker-proposed', hb.y - 2, hb.b - hb.y + 40, PC, 0, 1100); await unring(page)
  }
  await ctx.close()
}
{ /* ---- the phone ---- */
  const { ctx, page } = await world(PHONE, true)
  if (want('q14')) {
    await go(page, 'quals'); await sleep(400); await press(page, '#qEdit', true)
    const b = await boxOf(page, '.qbar')
    await ring(page, [['#qSave', '1'], ['#qEditQuals', '2']]); await strip(page, 'q14-phone-quals-editing-today', b.y - 30, b.b - b.y + 60, PHONE); await unring(page)
    await page.evaluate(() => document.querySelector('#qEditQuals').classList.remove('primary'))
    await ring(page, [['#qSave', '1'], ['#qEditQuals', '2']]); await strip(page, 'q14-phone-quals-editing-proposed', b.y - 30, b.b - b.y + 60, PHONE); await unring(page)
    await press(page, '#qSave', true)
  }
  if (want('q11')) {
    await go(page, 'tracker'); await sleep(900)
    await tagGlyphs(page)
    await ring(page, [['.zz-g', '1'], ['#viewtabs', '2']]).catch(e => console.log('q11 phone ring', e.message))
    await strip(page, 'q11-phone-tracker-today', 0, 330, PHONE); await unring(page)
    /* proposed: the line icons, and the three view tabs one joined box as the Inputs / SANS / Medical tabs are */
    await iconify(page)
    await page.addStyleTag({ content: `#page-tracker #viewtabs{gap:2px!important;padding:3px!important;border:1px solid var(--edge)!important;border-radius:11px!important;background:var(--panel)!important}
      #page-tracker #viewtabs>button{border-color:transparent!important;background:transparent!important}
      #page-tracker #viewtabs>button.active{border-color:var(--accent)!important;background:var(--panel-2)!important}
      #page-tracker #viewtabs>button .zz-ic{width:17px;height:17px;vertical-align:-3px;margin-right:6px}` })
    await sleep(200)
    await ring(page, [['.zz-g', '1'], ['#viewtabs', '2']]).catch(e => console.log('q11 phone ring', e.message))
    await strip(page, 'q11-phone-tracker-proposed', 0, 330, PHONE); await unring(page)
    /* the app's own joined tabs on a phone, for comparison: the Inputs tabs */
    await go(page, 'inputs'); await sleep(500)
    await ring(page, [['.inputs-tabs', '']]); await strip(page, 'q11-phone-inputs-tabs', 0, 200, PHONE); await unring(page)
  }
  await ctx.close()
}
await browser.close()
console.log('done')
