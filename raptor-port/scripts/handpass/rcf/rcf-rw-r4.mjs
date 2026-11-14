console.log('rcf-rw-r4 v1 — R4: the Logic page two changed lines, desktop and phone 402')
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const HERE = dirname(fileURLToPath(import.meta.url))
const RUN = process.env.RUN || 'r4a'
process.env.HP_URL ||= 'http://localhost:4292'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/rewalk/' + RUN)
const { mkdirSync } = await import('node:fs')
mkdirSync(process.env.HP_SHOTS, { recursive: true })
const R = await import('./rcf-rw-lib.mjs')
const { W, sleep, check, PASSIF } = R
const browser = await W.launch()
const nrm = s => String(s || '').replace(/[\s ]+/g, ' ').trim()

for (const phone of [false, true]) {
  const tag = phone ? 'p' : 'd'
  const { page } = await W.world(browser, { phone })
  console.log('BUNDLE', await R.bundle(page))
  /* Logic: through the top bar's page name, or the side menu on a phone */
  const link = page.locator('a[data-page="logic"]:visible').first()
  if (!(await link.count())) {
    const burger = page.locator('#menuBtn:visible, .hamb:visible, [data-menu]:visible, #navToggle:visible').first()
    console.log('no Logic link visible; menu button count', await burger.count())
    if (await burger.count()) { await burger.tap(); await sleep(400) }
  }
  if (phone) await page.locator('a[data-page="logic"]').first().evaluate(e => e.click()); else await page.locator('a[data-page="logic"]:visible').first().click()
  await page.waitForSelector('#page-logic.on'); await sleep(600)
  /* open every fold */
  const nf = await page.evaluate(() => { const ds = [...document.querySelectorAll('#page-logic details')]; ds.forEach(d => { d.open = true }); return ds.length })
  await sleep(400)
  console.log(`[${tag}] folds opened`, nf)
  const find = async (frag, shotName, id) => {
    const info = await page.evaluate(frag => {
      const els = [...document.querySelectorAll('#page-logic *')].filter(e => e.getBoundingClientRect().width > 0 && (e.innerText || '').replace(/[\s ]+/g, ' ').includes(frag))
      /* the smallest: no child also contains it */
      const small = els.filter(e => !els.some(o => o !== e && e.contains(o)))
      return small.map((e, i) => { e.setAttribute('data-rwfind', frag.slice(0, 6) + i); return { sel: `[data-rwfind="${frag.slice(0, 6) + i}"]`, text: (e.innerText || '').replace(/[\s ]+/g, ' ').trim(), cls: e.className, tag: e.tagName } })
    }, frag)
    console.log(`[${tag}] "${frag}" found in`, info.length, 'element(s)')
    if (info.length) {
      const l = page.locator(info[0].sel).first()
      await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
      const b = await l.boundingBox(); const vp = page.viewportSize()
      const pad = 10
      const x = Math.max(0, b.x - pad), y = Math.max(0, b.y - pad)
      await page.screenshot({ path: `${process.env.HP_SHOTS}/${shotName}-${tag}.png`, clip: { x, y, width: Math.min(vp.width - x, b.width + 2 * pad), height: Math.min(vp.height - y, b.height + 2 * pad) } })
    }
    return info[0]
  }
  const a = await find('so his rest clears', 'r4-1-tight-turn', 'a')
  PASSIF(`R4.1 [${tag}] the tight-turn line ends "…is later, so his rest clears."`, !!a && /is later, so his rest clears\.$/.test(a.text), a ? a.text : 'NOT FOUND', `r4-1-tight-turn-${tag}.png`)
  const b = await find('A row that flies', 'r4-2-row-flies', 'b')
  PASSIF(`R4.2 [${tag}] the "row that flies" line reads "A row that flies has its clashes and turns checked as a sortie's are, counts as a jet…"`, !!b && /A row that flies has its clashes and turns checked as a sortie.s are, counts as a jet/.test(b.text), b ? b.text : 'NOT FOUND', `r4-2-row-flies-${tag}.png`)
  /* the old wording must be gone */
  const old = await page.evaluate(() => /A standby row that flies/.test(document.querySelector('#page-logic').innerText.replace(/[\s ]+/g, ' ')))
  check(`R4.3 [${tag}] the old "A standby row that flies" wording`, old ? 'FAIL' : 'PASS', old ? 'still on the page' : 'not on the page')
  await page.screenshot({ path: `${process.env.HP_SHOTS}/r4-0-logic-${tag}.png` })
  await page.close()
}
R.finish()
await browser.close()
