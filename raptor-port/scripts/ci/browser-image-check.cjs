/* The browser jobs' check of Playwright's image, on GitHub (geometry and tracker in .github/workflows/deploy.yml).
   They run inside Playwright's own image since 12 Nov 26 ([CI-BROWSER-DEPS-DOWNLOAD] - the workflow's note above the
   geometry job says why). Two modes, two steps, each under the shell's `timeout`:

   --check  A GATE, run after `npm ci`. Fails the job when:
            - the image is not the one for the installed Playwright: the image's own record of its version
              (/ms-playwright/.docker-info, written by Playwright's `mark-docker-image` when the image is built) must
              equal the playwright-core version npm ci installed. Comparing browser builds would not do: two Playwright
              versions often share one Chromium build (1.62.0 and 1.62.1 do). Without this, a bump of @playwright/test
              with the old image tag fails every test with Playwright's advice to install a browser - the download
              from Ubuntu's servers the image replaced;
            - the browser the tests launch does not start: a default headless launch (Chromium's headless shell, not
              the full Chromium) within 20 s;
            - the runner's own fonts, lent to the container by the job's container.volumes, are not there or hold no
              font: Docker makes a missing folder an empty one without a word, and the tests would then measure text
              in other letters.
   --fonts  FOR THE LOG ONLY (its step only warns if it fails or runs out of time): the time zone and language as
            Node and Chromium see them, the font folders the runner lent, and the font Chromium actually draws each
            family the app names in, read over its DevTools protocol (CSS.getPlatformFontsForNode - the "Rendered
            Fonts" of the Elements panel). The app loads no font, so every measuring test draws in these.

   CommonJS (.cjs) so it runs as a plain `node` script under the package's "type": "module". */
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('@playwright/test')

const LENT = '/usr/local/share/fonts/runner'
const mode = process.argv[2]

function installedVersion() {
  const file = path.join(__dirname, '..', '..', 'node_modules', 'playwright-core', 'package.json')
  return JSON.parse(fs.readFileSync(file, 'utf8')).version
}

// every font file under a folder, following the folder tree (not links out of it)
function fontFiles(dir) {
  const out = []
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p)
      else if (/\.(ttf|otf|ttc|pfb|pcf(\.gz)?)$/i.test(e.name)) out.push(p)
    }
  }
  walk(dir)
  return out
}

function fail(msg) {
  console.log(`::error::${msg}`)
  process.exitCode = 1
}

async function check() {
  const version = installedVersion()
  let info = null
  try {
    info = JSON.parse(fs.readFileSync('/ms-playwright/.docker-info', 'utf8'))
  } catch {
    // left null: reported below
  }
  if (!info || info.driverVersion !== version) {
    fail(
      `This job's container image is ${info ? `Playwright ${info.driverVersion} (${info.dockerImageName})` : 'not a Playwright image (no /ms-playwright/.docker-info)'}, ` +
        `but npm ci installed Playwright ${version}. Set the image of BOTH browser jobs (geometry, tracker) in ` +
        `.github/workflows/deploy.yml to the Playwright ${version} image of the same Ubuntu release.`,
    )
    return
  }
  console.log(`Image ${info.dockerImageName} is Playwright ${version}, as installed.`)

  let browser
  try {
    browser = await chromium.launch({ timeout: 20_000 })
    console.log(`The browser the tests launch starts: Chromium ${browser.version()}.`)
  } catch (e) {
    fail(`The browser the tests launch did not start: ${e && e.message}`)
  } finally {
    if (browser) await browser.close().catch(() => {})
  }

  let files = []
  try {
    files = fontFiles(LENT)
  } catch {
    // left empty: reported below
  }
  if (!files.length) {
    fail(
      `The runner's fonts are not lent to the container: ${LENT} is missing or holds no font. The browser tests ` +
        `would measure text in other letters than the bare runner's. Check the job's container.volumes line.`,
    )
    return
  }
  console.log(`The runner lent ${files.length} font files at ${LENT}.`)
}

// Each family as the app's stylesheets name it (the commonest stacks), plus the generic families they fall to.
const FAMILIES = [
  ['sans-serif', 'sans-serif'],
  ['monospace', 'monospace'],
  ['system-ui', 'system-ui'],
  ['the board and headings', "'Barlow Condensed','Inter Tight',sans-serif"],
  ['the body text', "'Inter Tight',sans-serif"],
  ['the body text (some)', "'Inter Tight',system-ui,sans-serif"],
  ['the times and codes', "'JetBrains Mono',monospace"],
  ['the sign-in card', "'Segoe UI',system-ui,-apple-system,Arial,sans-serif"],
]

async function fonts() {
  const nodeSide = Intl.DateTimeFormat().resolvedOptions()
  console.log(`Node: time zone ${nodeSide.timeZone}, language ${nodeSide.locale}, TZ=${process.env.TZ || '(unset)'}, LANG=${process.env.LANG || '(unset)'}`)

  // the folders the runner lent, two levels down (truetype/dejavu, ...), with their font counts
  const counts = {}
  for (const f of fontFiles(LENT)) {
    const key = path.relative(LENT, path.dirname(f)).split(path.sep).slice(0, 2).join('/')
    counts[key] = (counts[key] || 0) + 1
  }
  console.log(`The runner's fonts: ${Object.entries(counts).map(([k, n]) => `${k} ${n}`).join(', ') || 'none'}`)

  let browser
  try {
    browser = await chromium.launch({ timeout: 20_000 })
    const page = await browser.newPage()
    await page.setContent(
      FAMILIES.map(([, f], i) => `<p id="f${i}" style="font-family:${f}">Abg 0123 WAVE wave ✎ ☰</p>`).join(''),
    )
    const pageSide = await page.evaluate(() => ({
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      lang: navigator.language,
    }))
    console.log(`Chromium ${browser.version()}: time zone ${pageSide.zone}, language ${pageSide.lang}; it draws:`)
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('DOM.enable')
    await cdp.send('CSS.enable')
    const { root } = await cdp.send('DOM.getDocument')
    for (let i = 0; i < FAMILIES.length; i++) {
      const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: `#f${i}` })
      const { fonts: used } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId })
      const drawn = used.map((f) => `${f.familyName} (${f.glyphCount} glyphs)`).join(', ') || 'nothing reported'
      console.log(`  ${FAMILIES[i][0].padEnd(24)} ${FAMILIES[i][1].padEnd(52)} -> ${drawn}`)
    }
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
}

;(mode === '--check' ? check() : mode === '--fonts' ? fonts() : Promise.reject(new Error('use --check or --fonts')))
  .catch((e) => {
    const msg = String((e && e.message) || e)
    // the read-out only warns (its step says so too); the gate, or a wrong mode, fails
    if (mode === '--fonts') {
      console.log(`::warning::The font read-out failed (the tests still run): ${msg}`)
      process.exitCode = 1
    } else fail(msg)
  })
