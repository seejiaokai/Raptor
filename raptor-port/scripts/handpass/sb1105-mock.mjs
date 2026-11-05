// The "Not saved" band — two nicer looks (his idea, 5 Nov 26), drawn ON the real frozen build; nothing here is built.
// The band is made real (the browser refuses to save, then a setting is changed on Admin), then Edit Schedule is opened
// and its top bar pictured at his iPhone's 402 × 874 and his PC's 1536: today, then each look laid over the real band.
//   1 — the strip: a drawn warning sign, "Not saved" in bold and "keep this page open" quieter, read from the left; Retry a
//       solid amber button at the right; the amber wash fading across the band.
//   2 — the pill: the band stays plain; one amber pill in its middle holds the sign, the words and Retry.
// Both keep the band's height, its place under the bar and its amber line (D587, D841), and add no glow (D887).
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node scripts/handpass/sb1105-mock.mjs
import * as L from './aw1105-lib.mjs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '../../docs/mock/2026-11-05-save-band/img')
mkdirSync(OUT, { recursive: true })

const SIGN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M8 1.6 15 14H1z' fill='none' stroke='%23E5C24A' stroke-width='1.6' stroke-linejoin='round'/%3E%3Cpath d='M8 6v3.6' stroke='%23E5C24A' stroke-width='1.6' stroke-linecap='round'/%3E%3Ccircle cx='8' cy='11.7' r='.95' fill='%23E5C24A'/%3E%3C/svg%3E") center/16px 16px no-repeat`

const LOOK1 = `
.topbar > .savestat.failed{justify-content:space-between;color:var(--ink);
  background:linear-gradient(90deg,rgba(229,194,74,.20),rgba(229,194,74,.06) 55%,rgba(229,194,74,.03)),var(--bg)}
.topbar > .savestat.failed .sv-msg{display:flex;align-items:center;gap:9px;font-weight:500;color:var(--ink-2)}
.topbar > .savestat.failed .sv-msg b{color:#F2D46B;font-weight:700}
.topbar > .savestat.failed .sv-sign{width:16px;height:16px;flex:0 0 16px;background:${SIGN}}
.topbar > .savestat.failed button{background:#E5C24A;color:#1F1803;border-color:#E5C24A;font-weight:700}
`
const LOOK2 = `
.topbar > .savestat.failed{justify-content:center;background:var(--bg);color:var(--ink)}
.topbar > .savestat.failed .sv-pill{display:inline-flex;align-items:center;gap:9px;height:26px;padding:0 4px 0 11px;
  border:1px solid rgba(229,194,74,.5);border-radius:999px;background:rgba(229,194,74,.12)}
.topbar > .savestat.failed .sv-msg{display:flex;align-items:center;gap:8px;font-weight:500;color:var(--ink-2)}
.topbar > .savestat.failed .sv-msg b{color:#F2D46B;font-weight:700}
.topbar > .savestat.failed .sv-sign{width:15px;height:15px;flex:0 0 15px;background:${SIGN}}
.topbar > .savestat.failed button{height:20px;padding:0 11px;border-radius:999px;background:#E5C24A;color:#1F1803;border:0;font-weight:700}
`
/* the band's words, split so "Not saved" can lead: the same words, the dash gone */
const SPLIT = () => {
  const m = document.querySelector('.topbar > .savestat.failed .sv-msg')
  m.innerHTML = '<span class="sv-sign" aria-hidden="true"></span><b>Not saved</b><span>keep this page open</span>'
}
const PILL = () => {
  const band = document.querySelector('.topbar > .savestat.failed')
  const msg = band.querySelector('.sv-msg'), btn = band.querySelector('button')
  const pill = document.createElement('span'); pill.className = 'sv-pill'
  band.insertBefore(pill, msg); pill.appendChild(msg); pill.appendChild(btn)
}

async function shot(page, size, name, tag) {
  await page.evaluate(t => { document.querySelectorAll('.aw-tag').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'aw-tag'; d.textContent = t
    Object.assign(d.style, { position: 'fixed', right: '10px', bottom: '10px', zIndex: '99999', background: '#ff3b6b', color: '#fff', font: '700 12px/1 system-ui,sans-serif', padding: '6px 8px', borderRadius: '5px' }); document.body.appendChild(d) }, tag)
  const bar = await page.locator('.topbar').boundingBox()
  const h = Math.round(bar.y + bar.height + 140)
  /* the tag at the picture's foot, inside the cut */
  await page.evaluate(h => { const t = document.querySelector('.aw-tag'); t.style.bottom = 'auto'; t.style.top = (h - 34) + 'px' }, h)
  await page.screenshot({ path: join(OUT, `${name}-${size === 'desktop' ? 'desk' : 'phone'}.png`), clip: { x: 0, y: 0, width: size === 'desktop' ? 1536 : 402, height: h } })
}

for (const size of ['phone', 'desktop']) {
  const { page } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  await L.refuse(page, true)
  await page.locator('#admGuestView').click(); await page.waitForTimeout(1500)
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
  await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 })
  await shot(page, size, 'today', 'TODAY')
  const s1 = await page.addStyleTag({ content: LOOK1 })
  await page.evaluate(SPLIT)
  await shot(page, size, 'look1', '1 — the strip')
  await s1.evaluate(el => el.remove())
  await page.addStyleTag({ content: LOOK2 })
  await page.evaluate(PILL)
  await shot(page, size, 'look2', '2 — the pill')
  await page.context().close()
}
console.log('done', L.errs.length ? L.errs : 'no browser errors')
process.exit(0)
