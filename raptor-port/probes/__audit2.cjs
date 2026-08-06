/* Sweep the surfaces the first pass missed: the day board and the three
   secondary pages, desktop and phone. Reports only what looks wrong. */
const { chromium } = require('playwright')
const DESK = { width: 1500, height: 950 }, PHONE = { width: 390, height: 844 }
const out = []
const flag = (where, what) => out.push(`[${where}] ${what}`)

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  for (const [vpName, vp] of [['desktop', DESK], ['phone', PHONE]]) {
    const ctx = await b.newContext({ viewport: vp })
    const p = await ctx.newPage()
    const errs = []
    p.on('pageerror', e => errs.push('page error: ' + e.message))
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 110)) })
    await p.goto('http://localhost:4173/')
    await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
    await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(1000)

    const scan = async (where, root) => {
      const r = await p.evaluate((root) => {
        const res = { spill: [], off: [], empty: [] }
        const host = document.querySelector(root)
        if (!host) return { missing: true, ...res }
        const hb = host.getBoundingClientRect()
        for (const el of host.querySelectorAll('*')) {
          const cs = getComputedStyle(el)
          if (cs.display === 'none' || cs.visibility === 'hidden') continue
          const r0 = el.getBoundingClientRect()
          if (!el.children.length && el.clientWidth > 0) {
            const over = el.scrollWidth - el.clientWidth
            /* the puck name is deliberately clipped and faded; everything else
               that overflows is a layout fault */
            if (over > 1 && !el.classList.contains('nm'))
              res.spill.push(`${(el.className || el.tagName).toString().split(' ')[0]} +${over}px "${(el.textContent || '').trim().slice(0, 24)}"`)
          }
          if (r0.width > 0 && (r0.right > hb.right + 2 || r0.left < hb.left - 2))
            res.off.push(`${(el.className || el.tagName).toString().split(' ')[0]} escapes its panel`)
        }
        return res
      }, root)
      if (r.missing) return flag(where, `panel ${root} did not render`)
      ;[...new Set(r.spill)].slice(0, 6).forEach(s => flag(where, 'overflows: ' + s))
      ;[...new Set(r.off)].slice(0, 4).forEach(s => flag(where, s))
      const pageOver = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (pageOver > 0) flag(where, `page scrolls sideways by ${pageOver}px`)
    }

    /* the day board */
    await p.evaluate(() => go('editsched')); await p.waitForTimeout(600)
    await p.evaluate(() => openScheduler(1)); await p.waitForTimeout(900)
    await scan(`${vpName}/board`, '#schedBoard')
    await p.evaluate(() => closeScheduler && closeScheduler()); await p.waitForTimeout(500)

    /* the secondary pages */
    for (const pg of ['inputs', 'quals', 'logic']) {
      await p.evaluate(s => go(s), pg); await p.waitForTimeout(800)
      const shown = await p.evaluate(() => {
        const vis = [...document.querySelectorAll('main, .page, [id$="Page"], #inWrap, #qWrap, #lgBody')]
          .filter(e => e.getBoundingClientRect().height > 40)
        return vis.length ? (vis[0].id || vis[0].className || 'body') : null
      })
      if (!shown) { flag(`${vpName}/${pg}`, 'page rendered nothing tall enough to be visible'); continue }
      await scan(`${vpName}/${pg}`, 'body')
    }
    if (errs.length) [...new Set(errs)].slice(0, 5).forEach(e => flag(vpName, e))
    await ctx.close()
  }
  await b.close()
  console.log(out.length ? out.join('\n') : 'CLEAN — nothing flagged')
})()
