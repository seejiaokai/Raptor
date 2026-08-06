/* A broad visual + rules sweep of the production bundle, desktop and phone,
   across the view week, the edit week and the board. Reports only things that
   look WRONG — silence is the pass condition. */
const { chromium } = require('playwright')
const DESK = { width: 1500, height: 950 }, PHONE = { width: 390, height: 844 }

const findings = []
const flag = (area, what) => findings.push(`[${area}] ${what}`)

;(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
  for (const [vpName, vp] of [['desktop', DESK], ['phone', PHONE]]) {
    const ctx = await b.newContext({ viewport: vp })
    const p = await ctx.newPage()
    const errs = []
    p.on('pageerror', e => errs.push('page error: ' + e.message))
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 120)) })
    p.on('response', r => { if (r.status() >= 400) errs.push(`HTTP ${r.status()} ${r.url().slice(-60)}`) })

    await p.goto('http://localhost:4173/')
    await p.fill('#luser', 'a'); await p.fill('#lpass', 'a')
    await p.click('#loginForm button[type=submit]'); await p.waitForTimeout(1000)

    for (const [page, root] of [['viewsched', '#vWeek'], ['editsched', '#eWeek']]) {
      await p.evaluate(s => go(s), page); await p.waitForTimeout(800)

      /* 1. text spilling out of its own box */
      const spill = await p.evaluate((root) => {
        const out = []
        for (const el of document.querySelectorAll(`${root} *`)) {
          if (el.children.length) continue                       // leaves only
          const over = el.scrollWidth - el.clientWidth
          if (over > 1 && el.clientWidth > 0)
            out.push(`${el.className || el.tagName} +${over}px "${(el.textContent || '').slice(0, 28)}"`)
        }
        return [...new Set(out)].slice(0, 8)
      }, root)
      spill.forEach(s => flag(`${vpName}/${page}`, 'text overflows its box: ' + s))

      /* 2. anything painted outside its own day column */
      const outside = await p.evaluate((root) => {
        const out = []
        for (const day of document.querySelectorAll(`${root} .day[data-day]`)) {
          const d = day.getBoundingClientRect()
          for (const el of day.querySelectorAll('.puck, .lchip, .witem, .form-area, .rmkcell')) {
            const r = el.getBoundingClientRect()
            if (r.width === 0) continue
            if (r.left < d.left - 2 || r.right > d.right + 2)
              out.push(`day ${day.dataset.day}: ${el.className.split(' ')[0]} sticks out`)
          }
        }
        return [...new Set(out)].slice(0, 6)
      }, root)
      outside.forEach(s => flag(`${vpName}/${page}`, s))

      /* 3. the page must never gain a sideways scroll */
      const pageOver = await p.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (pageOver > 0) flag(`${vpName}/${page}`, `the whole page scrolls sideways by ${pageOver}px`)

      /* 4. RULES: a ring with no chip, a chip with no warning to open */
      const rules = await p.evaluate((root) => {
        const out = []
        for (const pk of document.querySelectorAll(`${root} .puck[data-person]`)) {
          const id = pk.dataset.person
          const dayEl = pk.closest('.day[data-day]'); if (!dayEl) continue
          const di = +dayEl.dataset.day
          const ringed = /\b(warn|boxred|boxdash)\b/.test(pk.className)
          const chip = pk.querySelector('.lchip')
          if (ringed && !chip) out.push(`day ${di} ${id}: ringed but captions nothing`)
          if (chip && !ringed && !/boxdot/.test(pk.className))
            out.push(`day ${di} ${id}: chip "${chip.textContent}" with no ring`)
          if (chip) {
            const own = (WARN.byDay[di]?.warns || []).some(w => (w.who || []).includes(id))
            const traced = !!(WARN.trace && WARN.trace[di] && WARN.trace[di][id])
            if (!own && !traced) out.push(`day ${di} ${id}: chip "${chip.textContent}" opens nothing`)
          }
        }
        return [...new Set(out)].slice(0, 10)
      }, root)
      rules.forEach(s => flag(`${vpName}/${page}`, s))

      /* 5. the day's issue count vs the list it opens */
      const counts = await p.evaluate((root) => {
        const out = []
        for (const box of document.querySelectorAll(`${root} .dwbox`)) {
          const di = +box.dataset.dwbox
          const printed = +(box.querySelector('.daywarn b')?.textContent || '').replace(/\D+/g, '')
          const real = (WARN.byDay[di]?.warns || []).length
          if (printed !== real) out.push(`day ${di}: header says ${printed} issues, engine has ${real}`)
        }
        return out
      }, root)
      counts.forEach(s => flag(`${vpName}/${page}`, s))
    }

    /* 6. warnings whose anchor no longer resolves, and empty/duplicate warnings */
    const engine = await p.evaluate(() => {
      const out = [], seen = new Set()
      for (const g of WARN.byDay) for (const w of (g?.warns || [])) {
        if (!w.who || !w.who.length) out.push(`${w.code} on day ${g.di} names nobody`)
        if (!w.msg) out.push(`${w.code} on day ${g.di} has no message`)
        const k = w.code + '|' + (w.who || []).join(',') + '|' + g.di
        if (seen.has(k)) out.push(`duplicate: ${w.code} for ${w.who} on day ${g.di}`)
        seen.add(k)
      }
      return [...new Set(out)].slice(0, 10)
    })
    engine.forEach(s => flag('engine', s))

    if (errs.length) [...new Set(errs)].slice(0, 6).forEach(e => flag(vpName, e))
    await ctx.close()
  }
  await b.close()
  console.log(findings.length ? findings.join('\n') : 'CLEAN — nothing flagged')
})()
