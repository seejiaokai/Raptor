/* The browser jobs' first step on GitHub (geometry and tracker in .github/workflows/deploy.yml), run inside
   Playwright's own image since 12 Nov 26 ([CI-BROWSER-DEPS-DOWNLOAD] - the workflow's note above the geometry job
   says why the jobs moved there).

   1. A GATE: the image must hold the browser of the Playwright version npm ci just installed. Playwright's Docker
      page warns that a mismatched image "will be unable to locate browser executables"; without this check a bump of
      @playwright/test with the old image tag fails every test with Playwright's own advice to run
      `npx playwright install` - which on a bare runner is the very download from Ubuntu's servers the image replaced.
      So the job stops here, once, with the line to change.
   2. FOR THE LOG ONLY: which font Chromium actually draws each family the app names in (the app loads no font, so
      every measuring test draws in the machine's own - see gates-and-deploy.md on DejaVu Sans), read from Chromium
      itself over its DevTools protocol (CSS.getPlatformFontsForNode, the "Rendered Fonts" of the Elements panel).
      It proves the runner's fonts lent to the container are the ones in use. A failure here only warns: the tests
      themselves are the gate on measurements.

   CommonJS (.cjs) so it runs as a plain `node` script under the package's "type": "module". */
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('@playwright/test')

const version = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', '..', 'node_modules', '@playwright', 'test', 'package.json'), 'utf8'),
).version
const exe = chromium.executablePath()
if (!fs.existsSync(exe)) {
  console.log(
    `::error::This job's container image holds no browser for Playwright ${version} (looked for ${exe}). ` +
      `Set the image of BOTH browser jobs (geometry, tracker) in .github/workflows/deploy.yml to ` +
      `mcr.microsoft.com/playwright:v${version}-noble.`,
  )
  process.exit(1)
}
console.log(`Playwright ${version}: the image holds its browser (${exe}).`)

// The runner's own fonts, lent read-only by the job's container.volumes (empty or absent = not lent).
const lent = '/usr/local/share/fonts/runner'
let lentList = 'not there'
try {
  lentList = fs.readdirSync(lent).join(', ') || 'empty'
} catch {
  // left as 'not there'
}
console.log(`The runner's fonts at ${lent}: ${lentList}`)

// Each family as the app's stylesheets name it (the commonest stacks), plus the generic families they fall to.
const families = [
  ['sans-serif', 'sans-serif'],
  ['monospace', 'monospace'],
  ['system-ui', 'system-ui'],
  ['the board and headings', "'Barlow Condensed','Inter Tight',sans-serif"],
  ['the body text', "'Inter Tight',sans-serif"],
  ['the times and codes', "'JetBrains Mono',monospace"],
  ['the sign-in card', "'Segoe UI',system-ui,-apple-system,Arial,sans-serif"],
]

;(async () => {
  let browser
  try {
    browser = await chromium.launch()
    const page = await browser.newPage()
    await page.setContent(
      families.map(([, f], i) => `<p id="f${i}" style="font-family:${f}">Abg 0123 WAVE wave</p>`).join(''),
    )
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
    const { root } = await cdp.send('DOM.getDocument')
    const nodeSide = Intl.DateTimeFormat().resolvedOptions()
    const pageSide = await page.evaluate(() => ({
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lang: navigator.language,
    }))
    console.log(`Time zone and language: Node ${nodeSide.timeZone} / ${nodeSide.locale}, Chromium ${pageSide.zone} / ${pageSide.lang}`)
    console.log(`Chromium ${browser.version()} draws:`)
    for (let i = 0; i < families.length; i++) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `#f${i}` })
      const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
      const drawn = fonts.map((f) => `${f.familyName} (${f.glyphCount} glyphs)`).join(', ') || 'nothing reported'
      console.log(`  ${families[i][0].padEnd(24)} ${families[i][1].padEnd(52)} -> ${drawn}`)
    }
  } catch (e) {
    console.log(`::warning::The font read-out failed (the tests still run and are the gate): ${e && e.message}`)
  } finally {
    if (browser) await browser.close()
  }
})()
