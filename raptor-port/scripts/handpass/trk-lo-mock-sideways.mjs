/* [TRK-EDIT-SIDEWAYS] — the mock-up (28 Sep 26). Two ways to give Edit chart layout
   room on a sideways phone (844×390), drawn ON THE REAL APP: the production bundle,
   signed in, Edit chart layout opened through its own menu, then a throwaway style
   (and, for the fold, a throwaway button) laid on top — nothing here is product code.
   The pictures go to the owner to pick one (the house rule: a picture before product
   code for a visual change).

     HP_URL=http://localhost:4175 HP_SHOTS=<dir> node scripts/handpass/trk-lo-mock-sideways.mjs
*/
import { open, shot } from './trk-lib.mjs'

const SIDE = { width: 844, height: 390 }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const tap = async (page, sel) => { await page.locator(sel).first().click(); await sleep(250) }

async function editing() {
  const w = await open({ size: SIDE, touch: true })
  const { page } = w
  await tap(page, '#sylMenuBtn'); await tap(page, '#arrangeBtn'); await sleep(500)
  return w
}
const boardH = page => page.evaluate(() => Math.round(document.getElementById('board').getBoundingClientRect().height))

/* TODAY — for the left-hand side of the comparison */
{
  const { browser, page } = await editing()
  console.log('today: chart height', await boardH(page))
  await shot(page, 'mock-0-today')
  await browser.close()
}

/* WAY 1 — the strip is ONE row that scrolls sideways, a "more ›" edge on its right,
   the double-click note and the hint line gone while the screen is short; the
   Flow / Info / Show All tabs step aside while editing (both ways) */
{
  const { browser, page } = await editing()
  await page.addStyleTag({ content: `
    #page-tracker .arrtools.on{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start;padding:5px 34px 5px 8px;position:relative;scrollbar-width:none}
    #page-tracker .arrtools.on::-webkit-scrollbar{display:none}
    #page-tracker .arrtools .arrnote{display:none}
    #page-tracker .arrtools button{flex:0 0 auto;padding:4px 8px;font-size:12px}
    #page-tracker .arrhintwrap{display:none!important}
    #page-tracker .viewtabs{display:none!important}
    #mockMore{position:absolute;right:0;top:0;bottom:0;width:40px;display:flex;align-items:center;justify-content:flex-end;padding-right:8px;
      background:linear-gradient(90deg,rgba(21,24,31,0),var(--panel2,#1b1f27) 60%);color:#3BC6E8;font-weight:700;font-size:15px;pointer-events:none}
  ` })
  await page.evaluate(() => {
    const strip = document.getElementById('arrTools')
    /* the hint line under the strip, whatever its id — the element whose text starts "Move:" */
    for (const el of document.querySelectorAll('#page-tracker div')) if (/^Move: drag a ball/.test(el.textContent || '') && el.children.length === 0) el.style.display = 'none'
    const wrap = document.createElement('div'); wrap.style.position = 'relative'
    strip.parentNode.insertBefore(wrap, strip); wrap.appendChild(strip)
    const m = document.createElement('div'); m.id = 'mockMore'; m.textContent = '›'; wrap.appendChild(m)
  })
  await sleep(300)
  console.log('way 1: chart height', await boardH(page))
  await shot(page, 'mock-1-one-row')
  await browser.close()
}

/* WAY 2 — the strip FOLDS to one row: the tool in use, Fit, and "Tools ▾"; the
   button opens the whole strip over the chart (a tap outside closes it) */
{
  const { browser, page } = await editing()
  await page.addStyleTag({ content: `
    #page-tracker .arrtools.on{display:none}
    #page-tracker .arrhintwrap{display:none!important}
    #page-tracker .viewtabs{display:none!important}
    #page-tracker .arrtools.on.mockopen{display:flex;position:absolute;left:8px;right:8px;z-index:40;border:1px solid var(--line,#2a303b);border-radius:10px;box-shadow:0 12px 30px rgba(0,0,0,.6)}
    #page-tracker .arrtools.on.mockopen .arrnote{display:none}
    #mockFold{display:flex;gap:6px;align-items:center;padding:5px 8px;background:var(--panel2,#1b1f27);border-bottom:1px solid var(--line,#2a303b)}
    #mockFold button{padding:4px 10px;font-size:12px}
    #mockFold .sp{flex:1}
  ` })
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('#page-tracker div')) if (/^Move: drag a ball/.test(el.textContent || '') && el.children.length === 0) el.style.display = 'none'
    const strip = document.getElementById('arrTools')
    const fold = document.createElement('div'); fold.id = 'mockFold'
    fold.innerHTML = '<button class="primary">✋ Move</button><span class="mini" style="color:#8a93a3;font-size:11px">drag a ball · drag empty space to pan</span><span class="sp"></span><button>⤢ Fit</button><button id="mockTools" style="border-color:#3BC6E8;color:#3BC6E8">Tools ▾</button>'
    strip.parentNode.insertBefore(fold, strip)
  })
  await sleep(300)
  console.log('way 2 folded: chart height', await boardH(page))
  await shot(page, 'mock-2-folded')
  await page.evaluate(() => document.getElementById('arrTools').classList.add('mockopen'))
  await sleep(300)
  await shot(page, 'mock-3-folded-open')
  await browser.close()
}
