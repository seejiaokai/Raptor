// The member / guest build's one question (5 Nov 26): under a failed save the pass still ticks "Request sent" and reads
// "Waiting for an admin", with the "Not saved" band above it. Drawn ON the real frozen build — nothing here is built:
// today beside the recommended answer (step 1 and the mark read "Not sent yet" in the band's amber until the save lands),
// at his iPhone's 402 × 874 (WebKit) and his PC's 1536 (Chromium), the place marked, cut to the card.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> MG_OUT=<folder> node scripts/handpass/mgb-mock-q1.mjs
import * as L from './mg1105-lib.mjs'
import { join } from 'node:path'
console.log('[mgb-mock-q1 v1]')

const MARK = `.q1-mark{outline:3px dashed #ff3b6b !important;outline-offset:3px}
.q1-tag{position:fixed;z-index:99999;background:#ff3b6b;color:#fff;font:700 12px/1 system-ui,sans-serif;padding:6px 8px;border-radius:5px}`
const PROPOSED = `
#accessWaiting .pass-state.q1-warn{color:#E5C24A;border-color:rgba(229,194,74,.55)}
#accessWaiting .pass-state.q1-warn i{background:#E5C24A}
#accessWaiting .pass-steps li.q1-warn{color:#F2D46B;font-weight:600}
#accessWaiting .pass-steps li.q1-warn .pass-dot{background:transparent;border-color:#E5C24A;color:#E5C24A;font:800 12px/1 system-ui,sans-serif}
#accessWaiting .pass-steps li.q1-warn + li::before{background:var(--edge-2)}
#accessWaiting .pass-steps li.q1-warn + li{color:var(--ink-3);font-weight:400}
#accessWaiting .pass-steps li.q1-warn + li .pass-dot{border-style:solid;border-color:var(--edge-2)}
#accessWaiting .pass-steps li.q1-warn + li .pass-dot::after{display:none}`

async function tag(page, text, sel) {
  await page.evaluate(([t, s]) => {
    document.querySelectorAll('.q1-tag').forEach(x => x.remove())
    const r = document.querySelector(s).getBoundingClientRect()
    const d = document.createElement('div'); d.className = 'q1-tag'; d.textContent = t
    d.style.left = Math.max(6, r.left) + 'px'; d.style.top = Math.max(42, r.top - 30) + 'px'; document.body.appendChild(d)
  }, [text, sel])
}
async function cut(page, size, name) {
  const c = await page.locator('#accessWaiting .login-card').boundingBox()
  const x = size === 'desktop' ? Math.round(c.x - 60) : 0, w = size === 'desktop' ? Math.round(c.width + 120) : 402
  await page.screenshot({ path: join(L.OUT, `${name}-${size === 'desktop' ? 'desk' : 'phone'}.png`), clip: { x, y: 0, width: w, height: Math.round(c.y + c.height + 20) } })
}

for (const size of ['phone', 'desktop']) {
  const { page, tap, ctx } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  await page.locator('.adm-cat').filter({ hasText: 'Users' }).first().click(); await page.waitForTimeout(400)
  if (!(await page.locator('#admGuestView').isChecked())) await page.locator('#admGuestView').click()
  await page.waitForTimeout(400)
  await L.signOut(page)
  await L.signIn(page, 'kite', 'x')
  await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', 'Kite'); await page.fill('#accIni', 'KT')
  await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C')
  await L.refuse(page, true)
  if (tap) await page.locator('#accSend').tap(); else await page.locator('#accSend').click()
  await page.waitForSelector('.saveband.is-screen', { timeout: 8000 })
  await page.mouse.move(2, 600)
  await page.addStyleTag({ content: MARK + PROPOSED })
  /* today */
  await page.evaluate(() => { document.querySelector('#accessWaiting .pass-steps li').classList.add('q1-mark'); document.querySelector('#accessWaiting .pass-state').classList.add('q1-mark') })
  await tag(page, 'TODAY: says sent while "Not saved"', '#accessWaiting .pass-state')
  await cut(page, size, 'Q1-pass-today')
  /* proposed: until the save lands, the mark and step 1 say it is not sent yet, in the band's amber */
  await page.evaluate(() => {
    const st = document.querySelector('#accessWaiting .pass-state'); st.classList.add('q1-warn'); st.lastChild.textContent = 'Not sent yet'
    const li = document.querySelector('#accessWaiting .pass-steps li'); li.className = 'q1-warn q1-mark'
    li.querySelector('.pass-dot').innerHTML = '!'; li.lastChild.textContent = 'Not sent yet'
  })
  await tag(page, 'PROPOSED: "Not sent yet" until it saves', '#accessWaiting .pass-state')
  await cut(page, size, 'Q1-pass-proposed')
  L.note(`Q1-${size}`, 'drawn')
  await ctx.close()
}
console.log('errors:', L.errs.length ? L.errs : 'none')
process.exit(0)
