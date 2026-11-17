// Pictures of the OIL tracker's award editor today and as proposed (D2150). Run against a local vite preview on 4191.
// node oil.mjs <outdir>
import { createRequire } from 'module'
const require = createRequire('C:/Users/User/projects/Raptor/.claude/worktrees/beautiful-merkle-20a6b2/raptor-port/package.json')
const { chromium, devices } = require('@playwright/test')
const OUT = process.argv[2]

/* THE PROPOSED LAYOUT, injected over the real editor: one fixed grid of four columns —
   line 1: amount · AM · PM · date; line 2: reason (under amount, AM, PM) · given-by (under the date);
   line 3: Save · Cancel · Delete. The AM / PM pair always stands in its place: when the amount is not a half day,
   a clone of the real pair stands greyed and unpressable (option 1) or its place is kept empty (option 2).
   Delete holds the width of "Really delete?" so arming it moves nothing. */
const CSS = `
#page-leavewar .oil-edit.mock { display:grid !important; grid-template-columns: 56px 52px 52px minmax(0,1fr); gap:6px; align-items:center; }
#page-leavewar .oil-edit.mock > * { min-width:0; }
#page-leavewar .oil-edit.mock > .oil-num { grid-column:1; grid-row:1; width:auto; }
#page-leavewar .oil-edit.mock > button[data-testid$="-am"], #page-leavewar .oil-edit.mock > .mock-am { grid-column:2; grid-row:1; }
#page-leavewar .oil-edit.mock > button[data-testid$="-pm"], #page-leavewar .oil-edit.mock > .mock-pm { grid-column:3; grid-row:1; }
#page-leavewar .oil-edit.mock > .oil-dateread { grid-column:4; grid-row:1; padding-left:6px; }
#page-leavewar .oil-edit.mock > .oil-text:not(.given) { grid-column:1 / 3; grid-row:2; min-width:0; width:auto; }
#page-leavewar .oil-edit.mock > .oil-text.given { grid-column:3 / 5; grid-row:2; min-width:0; width:auto; }
#page-leavewar .oil-edit.mock > .acts { grid-column:1 / 5; grid-row:3; width:auto; flex-wrap:nowrap; }
#page-leavewar .oil-edit.mock > .note { grid-column:1 / 5; grid-row:4; }
#page-leavewar .oil-edit.mock .acts > button:last-child { min-width: var(--delw); }
#page-leavewar .oil-edit.mock > .mock-off { opacity:.38; pointer-events:none; }
#page-leavewar .oil-edit.mock > .mock-empty { visibility:hidden; }
`

async function open(ctx) {
  const page = await ctx.newPage()
  await page.goto('http://localhost:4191/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForTimeout(1500)
  await page.locator('[data-testid="oil-tracker"]').first().click()
  await page.waitForTimeout(1200)
  await page.addStyleTag({ content: CSS })
  const e = page.locator('[data-testid^="oil-entry-"]', { hasText: '18 Apr' }).first()
  await e.scrollIntoViewIfNeeded(); await e.click(); await page.waitForTimeout(500)
  return page
}

async function shoot(page, name) {
  const box = await page.locator('.oil-edit').first().boundingBox()
  const pad = 14
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 } })
}

// lay the proposed grid over the editor as it stands now
const prep = (page, pair, opt) => page.evaluate(([pair, opt]) => {
  const ed = document.querySelector('.oil-edit'); ed.classList.add('mock')
  const del = ed.querySelector('[data-testid^="oil-del-"]')
  const probe = del.cloneNode(true); probe.textContent = 'Really delete?'; probe.style.position = 'absolute'; probe.style.visibility = 'hidden'
  del.parentElement.appendChild(probe); ed.style.setProperty('--delw', probe.getBoundingClientRect().width + 'px'); probe.remove()
  ed.querySelectorAll('.mock-am, .mock-pm').forEach(n => n.remove())
  if (!ed.querySelector('[data-testid$="-am"]')) {
    const t = document.createElement('div'); t.innerHTML = pair
    const [am, pm] = [...t.children]
    for (const [n, c] of [[am, 'mock-am'], [pm, 'mock-pm']]) {
      n.removeAttribute('data-testid'); n.classList.remove('on'); n.setAttribute('aria-pressed', 'false')
      n.classList.add(c, opt === 'o1' ? 'mock-off' : 'mock-empty')
    }
    ed.querySelector('.oil-num').after(am, pm)
  }
}, [pair, opt])

async function run(ctx, dev) {
  let page = await open(ctx)
  // TODAY
  await shoot(page, `${dev}-today-half`)
  const pair = await page.evaluate(() => [...document.querySelectorAll('.oil-edit > button[data-testid^="oil-edit-half"]')].map(b => b.outerHTML).join(''))
  await page.fill('[data-testid="oil-edit-amt"]', '1'); await page.waitForTimeout(300)
  await shoot(page, `${dev}-today-one`)
  await page.click('[data-testid^="oil-del-"]'); await page.waitForTimeout(200)
  await shoot(page, `${dev}-today-one-armed`)
  await page.close()
  // PROPOSED
  for (const opt of ['o1', 'o2']) {
    page = await open(ctx)
    await prep(page, pair, opt); await page.waitForTimeout(200)
    await shoot(page, `${dev}-${opt}-half`)
    await page.fill('[data-testid="oil-edit-amt"]', '1'); await page.waitForTimeout(250)
    await prep(page, pair, opt); await page.waitForTimeout(200)
    await shoot(page, `${dev}-${opt}-one`)
    await page.click('[data-testid^="oil-del-"]'); await page.waitForTimeout(200)
    await prep(page, pair, opt); await page.waitForTimeout(150)
    await shoot(page, `${dev}-${opt}-one-armed`)
    await page.close()
  }
}

const browser = await chromium.launch()
{ const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 }); await run(ctx, 'desk'); await ctx.close() }
{ const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 }); await run(ctx, 'phone'); await ctx.close() }
await browser.close()
console.log('done')
