/* TEMPORARY — [TAP-JUMP-SWEEP] (D2030): press every control the app shows, up to two presses deep, and measure whether the
   control just pressed moved on the screen. Not committed as a test; its findings go to the list for him. */
import { test, type Browser, type Page } from '@playwright/test'
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { go, login } from '../../e2e/app'

const OUT = process.env.PICS_OUT!
const BUDGET = Number(process.env.SWEEP_MS || 9 * 60_000)
const MAXLEN = 2

type Item = { sig: string; x: number; y: number; w: number; h: number }

/* runs in the page */
function listClickables(): Item[] {
  const seen = new Set<Element>()
  const out: { el: Element; group: string; key: string }[] = []
  const all = document.querySelectorAll<HTMLElement>('body *')
  for (const el of all) {
    const tag = el.tagName
    if (tag === 'SELECT' || tag === 'OPTION' || (tag === 'INPUT' && ['file', 'text', 'number', 'date', 'password', 'search'].includes((el as HTMLInputElement).type))) continue
    if (tag === 'TEXTAREA') continue
    let hit = tag === 'BUTTON' || tag === 'SUMMARY' || (tag === 'INPUT') || el.hasAttribute('onclick') || ['button', 'tab', 'switch', 'checkbox', 'menuitem', 'option'].includes(el.getAttribute('role') || '')
    if (!hit) {
      const cs = getComputedStyle(el)
      if (cs.cursor === 'pointer' && (!el.parentElement || getComputedStyle(el.parentElement).cursor !== 'pointer')) hit = true
    }
    if (!hit) continue
    if ((el as HTMLButtonElement).disabled) continue
    if (el.closest('[hidden], [inert]')) continue
    /* an element inside one already taken is the same control */
    let p = el.parentElement, inside = false
    while (p) { if (seen.has(p)) { inside = true; break } p = p.parentElement }
    if (inside) continue
    const r = el.getBoundingClientRect()
    if (r.width < 4 || r.height < 4) continue
    const cs = getComputedStyle(el)
    if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none') continue
    seen.add(el)
    const cls = typeof el.className === 'string' ? el.className.split(/\s+/).filter(c => c && !['on', 'active', 'sel', 'open', 'lit', 'armed', 'cur'].includes(c)).sort().join('.') : ''
    const tid = (el.getAttribute('data-testid') || el.id || '').replace(/\d+/g, '#')
    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').replace(/\d+/g, '#').slice(0, 24)
    out.push({ el, group: `${tag}.${cls}`, key: tid || txt })
  }
  const perGroup = new Map<string, Set<string>>()
  const perKey = new Map<string, number>()
  const res: Item[] = []
  const w = window as unknown as { __els: Element[] }
  w.__els = []
  for (const o of out) {
    const g = perGroup.get(o.group) ?? new Set<string>()
    perGroup.set(o.group, g)
    const k = `${o.group}|${o.key}`
    const n = perKey.get(k) ?? 0
    if (n >= 1) continue                    // one of each named control…
    if (!g.has(o.key) && g.size >= 8) continue   // …and eight kinds of a look at most
    g.add(o.key); perKey.set(k, n + 1)
    const r = o.el.getBoundingClientRect()
    w.__els.push(o.el)
    res.push({ sig: k, x: r.x, y: r.y, w: r.width, h: r.height })
    if (res.length >= 90) break
  }
  return res
}

/* runs in the page: bring control i into view and say where to press */
function aim(i: number): { x: number; y: number; ok: boolean; r: number[] } {
  const w = window as unknown as { __els: Element[]; __t: Element; __mut: number; __mo?: MutationObserver; __sc: number[] }
  const el = w.__els[i] as HTMLElement
  let r = el.getBoundingClientRect()
  const vh = window.innerHeight, vw = window.innerWidth
  if (r.top < 0 || r.bottom > vh || r.left < 0 || r.right > vw) { el.scrollIntoView({ block: 'center', inline: 'center' }); r = el.getBoundingClientRect() }
  const x = r.left + r.width / 2, y = r.top + r.height / 2
  const at = document.elementFromPoint(x, y)
  const ok = !!at && (el.contains(at) || at.contains(el)) && x > 0 && y > 0 && x < vw && y < vh
  w.__t = el
  w.__mut = 0
  w.__mo?.disconnect()
  w.__mo = new MutationObserver(m => { w.__mut += m.length })
  w.__mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
  w.__sc = [window.scrollX, window.scrollY]
  return { x, y, ok, r: [r.left, r.top, r.width, r.height] }
}

/* runs in the page: after the press */
function after(p: { x: number; y: number }) {
  const w = window as unknown as { __t: HTMLElement; __mut: number; __sc: number[] }
  const el = w.__t
  const live = el.isConnected && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
  const r = el.getBoundingClientRect()
  const at = document.elementFromPoint(p.x, p.y)
  const under = at ? `${at.tagName}.${typeof at.className === 'string' ? at.className : ''}#${at.getAttribute('data-testid') || at.id || ''}:${(at.textContent || '').trim().slice(0, 30)}` : ''
  const uc = at?.closest('button, [role=button], input, [onclick], a[href]')
  return { live, r: [r.left, r.top, r.width, r.height], same: !!at && (el.contains(at) || at.contains(el)), under, underClick: !!uc && uc !== el && !uc.contains(el), mut: w.__mut, sc: [window.scrollX - w.__sc[0]!, window.scrollY - w.__sc[1]!], txt: (el.textContent || '').trim().slice(0, 40) }
}

type Scene = { name: string; who: 'a' | 'user'; to: Parameters<typeof go>[1] }
const SCENES: Scene[] = [
  { name: 'sched-viewsched', who: 'a', to: 'viewsched' }, { name: 'sched-editsched', who: 'a', to: 'editsched' },
  { name: 'sched-inputs', who: 'a', to: 'inputs' }, { name: 'sched-quals', who: 'a', to: 'quals' },
  { name: 'sched-logic', who: 'a', to: 'logic' }, { name: 'sched-leavewar', who: 'a', to: 'leavewar' },
  { name: 'sched-tracker', who: 'a', to: 'tracker' },
  { name: 'member-viewsched', who: 'user', to: 'viewsched' }, { name: 'member-inputs', who: 'user', to: 'inputs' },
  { name: 'member-leavewar', who: 'user', to: 'leavewar' }, { name: 'member-tracker', who: 'user', to: 'tracker' },
]

async function fresh(browser: Browser, sc: Scene, opts: object): Promise<Page> {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  page.on('dialog', d => { void d.dismiss().catch(() => {}) })
  await login(page, sc.who)
  await go(page, sc.to)
  await page.waitForTimeout(500)
  return page
}

async function press(page: Page, i: number) {
  const a = await page.evaluate(aim, i)
  if (!a.ok) return null
  await page.waitForTimeout(60)
  const a2 = await page.evaluate(aim, i)          // after any scroll into view has settled
  if (!a2.ok) return null
  await page.mouse.click(a2.x, a2.y)
  await page.waitForTimeout(480)
  return a2
}

for (const sc of SCENES) {
  test(`sweep ${sc.name}`, async ({ browser }, info) => {
    test.setTimeout(BUDGET + 120_000)
    const proj = info.project.name
    const dir = `${OUT}/${sc.name}-${proj}`
    mkdirSync(dir, { recursive: true })
    const log = `${dir}/findings.jsonl`
    writeFileSync(log, '')
    const opts = { ...info.project.use, baseURL: info.project.use.baseURL } as object
    const t0 = Date.now()
    let measured = 0, nfind = 0
    const queue: { path: { i: number; sig: string }[]; known: string[] }[] = [{ path: [], known: [] }]
    const doneStates = new Set<string>()
    while (queue.length && Date.now() - t0 < BUDGET) {
      const node = queue.shift()!
      let page: Page | null = null
      const open = async (): Promise<Item[] | null> => {
        if (page) await page.context().close().catch(() => {})
        page = await fresh(browser, sc, opts)
        for (const st of node.path) {
          const l = await page.evaluate(listClickables)
          if (l[st.i]?.sig !== st.sig) return null
          if (!await press(page, st.i)) return null
        }
        return page.evaluate(listClickables)
      }
      let list = await open().catch(() => null)
      if (!list) { if (page) await (page as Page).context().close().catch(() => {}); continue }
      const stateKey = list.map(l => l.sig).join('§')
      if (doneStates.has(stateKey)) { await page!.context().close().catch(() => {}); continue }
      doneStates.add(stateKey)
      const known = new Set(node.known)
      const targets = list.map((l, i) => ({ ...l, i })).filter(l => node.path.length === 0 || !known.has(l.sig))
      let dirty = false
      for (const t of targets) {
        if (Date.now() - t0 > BUDGET) break
        try {
          if (dirty) { list = await open(); if (!list) break; dirty = false }
          if (list[t.i]?.sig !== t.sig) continue
          const before = await page!.screenshot({ type: 'jpeg', quality: 55 })
          const a = await press(page!, t.i)
          if (!a) continue
          const r = await page!.evaluate(after, { x: a.x, y: a.y })
          measured++
          const dx = r.r[0]! - a.r[0]!, dy = r.r[1]! - a.r[1]!
          const moved = r.live && (Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5)
          const resized = r.live && (Math.abs(r.r[2]! - a.r[2]!) > 1.5 || Math.abs(r.r[3]! - a.r[3]!) > 1.5)
          const covered = r.live && !moved && !r.same && r.underClick   // only when another control now sits under the finger
          if (moved || resized || covered) {
            nfind++
            const id = `${String(nfind).padStart(3, '0')}`
            writeFileSync(`${dir}/${id}-a.jpg`, before)
            await page!.screenshot({ path: `${dir}/${id}-b.jpg`, type: 'jpeg', quality: 55 })
            appendFileSync(log, JSON.stringify({ id, kind: moved ? 'moved' : resized ? 'resized' : 'covered', path: node.path.map(p => p.sig), sig: t.sig, txt: r.txt, at: [Math.round(a.x), Math.round(a.y)], dx: Math.round(dx * 10) / 10, dy: Math.round(dy * 10) / 10, dw: Math.round((r.r[2]! - a.r[2]!) * 10) / 10, dh: Math.round((r.r[3]! - a.r[3]!) * 10) / 10, under: r.under, underClick: r.underClick, scroll: r.sc }) + '\n')
          }
          if (r.mut > 0 || r.sc[0] || r.sc[1]) {
            dirty = true
            if (node.path.length < MAXLEN) {
              const now = await page!.evaluate(listClickables)
              const had = new Set(list.map(l => l.sig))
              if (now.some(n => !had.has(n.sig))) queue.push({ path: [...node.path, { i: t.i, sig: t.sig }], known: list.map(l => l.sig) })
            }
          }
        } catch { dirty = true }
      }
      if (page) await (page as Page).context().close().catch(() => {})
    }
    writeFileSync(`${dir}/summary.json`, JSON.stringify({ scene: sc.name, proj, measured, findings: nfind, left: queue.length, states: doneStates.size, ms: Date.now() - t0 }))
  })
}
