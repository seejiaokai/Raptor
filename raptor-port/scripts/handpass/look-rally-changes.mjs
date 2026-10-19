/* LOOK — [RALLY-BOX-CHANGES] (D1035-D1037, 19 Oct 26): pictures of the live rally box for the questions put to him.
   Nothing is built. The script signs in at his iPhone's width (402, three times its density), adds an SC, an AVALON and
   a BB wave to Monday on the Scheduler Board, and photographs: the flying formation's faint suggestions; one tap on the
   R box as it looks today; the same tap with the two candidate marks drawn on the page; and the three standby waves.
   Run: HP_URL=http://localhost:4181 node scripts/handpass/look-rally-changes.mjs
   Pictures: docs/img/handpass/2026-10-19-rally-changes/ */
import { existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..')
const BASE = process.env.HP_URL || 'http://localhost:4181'
const OUT = resolve(ROOT, 'docs/img/handpass/2026-10-19-rally-changes')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const LAUNCH = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const sleep = ms => new Promise(r => setTimeout(r, ms))
const errors = []

const MARK = () => {
  window.__mk = {
    clear() { document.querySelectorAll('.mk-mark').forEach(n => n.remove()) },
    mark(r, color, label, pad = 3) {
      const d = document.createElement('div'); d.className = 'mk-mark'
      Object.assign(d.style, { position: 'fixed', left: (r.left - pad) + 'px', top: (r.top - pad) + 'px', width: (r.width + pad * 2) + 'px', height: (r.height + pad * 2) + 'px', border: `2px dashed ${color}`, borderRadius: '5px', zIndex: 99999, pointerEvents: 'none', boxSizing: 'border-box' })
      if (label) {
        const l = document.createElement('div'); l.textContent = label
        Object.assign(l.style, { position: 'absolute', right: '-2px', bottom: '100%', marginBottom: '2px', background: color, color: '#000', font: '700 10px system-ui', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap' })
        d.appendChild(l)
      }
      document.body.appendChild(d)
    },
  }
}

async function open(browser) {
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: 'dark' })
  const p = await ctx.newPage()
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  p.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
  await p.goto(BASE + '/')
  await p.waitForSelector('#luser', { state: 'visible', timeout: 8000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 })
  await p.addStyleTag({ content: '*{scroll-behavior:auto !important} #toastEl{display:none !important}' })
  await p.evaluate(() => window.go('editsched')); await sleep(600)
  await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await sleep(900)
  await p.evaluate(MARK)
  return { ctx, p }
}

const shot = (p, name) => p.screenshot({ path: resolve(OUT, name + '.png') })

/* scroll the board so the element sits about a third down the screen */
const bring = (p, sel) => p.evaluate(sel => {
  const el = typeof sel === 'string' ? document.querySelector(sel) : sel
  el.scrollIntoView({ block: 'center' })
}, sel)

const browser = await chromium.launch(LAUNCH)
try {
  const { ctx, p } = await open(browser)
  /* 1 — the first flying formation with an empty R box: its faint suggestions */
  const rk = await p.evaluate(() => {
    const r = [...document.querySelectorAll('#schedBoard input.tm.sugbox')].find(i => /\.rl$/.test(i.dataset.bfld || '') && !i.value)
    return r ? r.dataset.bfld : null
  })
  if (!rk) throw new Error('no empty R box with a suggestion')
  console.log('R box', rk)
  const rsel = `#schedBoard input[data-bfld="${rk}"]`
  const bsel = `#schedBoard input[data-bfld="${rk.replace(/\.rl$/, '.br')}"]`
  await bring(p, rsel); await sleep(300)
  await p.evaluate(({ rsel, bsel }) => {
    __mk.clear()
    const r = document.querySelector(rsel).getBoundingClientRect(); const b = document.querySelector(bsel).getBoundingClientRect()
    __mk.mark({ left: r.left, top: r.top, width: r.width, height: b.bottom - r.top }, '#FF8A00', 'worked out — faint', 4)
  }, { rsel, bsel })
  await shot(p, '01-faint-suggestions')
  /* 2 — one tap on the R box, as it is today */
  await p.evaluate(() => __mk.clear())
  await p.tap(rsel); await sleep(500)
  await p.evaluate(rsel => { const r = document.querySelector(rsel).getBoundingClientRect(); __mk.mark(r, '#FF8A00', 'taken — today', 5) }, rsel)
  await shot(p, '02-taken-today')
  /* 3 — proposal A: the time in the ordinary white at once, and the app's one just-added ring on the box */
  await p.evaluate(rsel => {
    __mk.clear(); const i = document.querySelector(rsel)
    const s = document.createElement('style'); s.id = 'mkA'
    s.textContent = `${rsel}{color:var(--text,#fff) !important;-webkit-text-fill-color:currentColor;box-shadow:inset 0 0 0 2px #1E86FF !important}`
    document.head.appendChild(s); i.blur()
  }, rsel)
  await sleep(200); await shot(p, '03-proposed-ring')
  /* 4 — proposal B: a short flash of the box's fill */
  await p.evaluate(rsel => {
    document.getElementById('mkA').textContent = `${rsel}{color:var(--text,#fff) !important;background:rgba(30,134,255,.45) !important}`
  }, rsel)
  await sleep(200); await shot(p, '04-proposed-flash')
  await p.evaluate(() => document.getElementById('mkA').remove())
  await ctx.close()

  /* 5 — SC, AVALON and BB added to Monday, as they are today */
  const b = await open(browser)
  for (const k of ['sc', 'avalon', 'bb']) { await b.p.evaluate(k => window.addWave(0, k), k); await sleep(500) }
  const heads = await b.p.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length === 0 && /^(SC|AVALON|BB)$/.test(e.textContent.trim()) && e.offsetWidth).map(e => e.tagName + '.' + e.className))
  console.log('standby heads', JSON.stringify(heads))
  for (const [k, n] of [['SC', '05'], ['AVALON', '06'], ['BB', '07']]) {
    const ok = await b.p.evaluate(k => {
      const h = [...document.querySelectorAll('#schedBoard *')].filter(e => e.children.length === 0 && e.textContent.trim() === k && e.offsetWidth).pop()
      if (!h) return false
      h.scrollIntoView({ block: 'start' }); const sc = [...document.querySelectorAll('#schedBoard *')].find(e => e.contains(h) && e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY)); if (sc) sc.scrollTop -= 70
      return true
    }, k)
    if (!ok) { console.log('no head for', k); continue }
    await sleep(300); await shot(b.p, `${n}-${k.toLowerCase()}-today`)
    /* the proposal: an R box above B, as on a flying line — marked where it would sit, and the worked-out brief to go */
    await b.p.evaluate(k => {
      __mk.clear()
      for (let gi = 0; gi < 12; gi++) {
        const w = window.findGo('0|' + gi); if (!w || !w.standalone || !(k === 'SC' ? ['SC', 'AVALON'] : [k]).includes((w.label || '').toUpperCase())) continue
        const br = document.querySelector(`#schedBoard [data-bfld="ff:0.${gi}.0.br"]`), to = document.querySelector(`#schedBoard [data-bfld="ff:0.${gi}.0.to"]`)
        if (!br || !to) continue
        const rb = br.getBoundingClientRect(), rt = to.getBoundingClientRect()
        __mk.mark({ left: rb.left, top: rt.top, width: rb.width, height: rt.height }, '#1E86FF', 'new R box', 2)
        if (br.placeholder || br.getAttribute('data-ph')) __mk.mark(rb, '#FF8A00', 'worked out — to hide', 2)
      }
    }, k)
    await sleep(150); await shot(b.p, `${n}b-${k.toLowerCase()}-proposed`)
  }
  await b.ctx.close()
} finally {
  await browser.close()
  if (errors.length) console.log('PAGE ERRORS', errors.slice(0, 5))
}
