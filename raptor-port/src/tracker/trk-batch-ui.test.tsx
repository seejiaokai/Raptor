// @vitest-environment jsdom
/* THE TRACKER BATCH (D495, 17 Oct 26) — what the chart and the side panel DO. Plan:
   docs/superpowers/plans/2026-10-17-tracker-batch-triage.md. jsdom has no layout, so where a claim is about what a person
   SEES (a name inside the card, the ring round a ball, the landing) the browser walk carries it
   (docs/handpass/2026-10-17-tracker-batch.md); these pin the rules underneath:
   - D980: the arrows' choices along the chart, the ring on the event, Enter opening the pop-up with the keyboard in it
     on the event's own grade, and the keyboard back on the chart (the same event) when the pop-up closes;
   - [TRK-WIREBOARD-REPEAT]: two balls moved in Edit chart layout, and one wheel step still zooms once;
   - [TRK-BALL-OFF-CHART-LEFT]: a ball, or a group, dropped before the chart's start stops at it;
   - D982: each Currency & flex bar's ink comes with its colour — dark on green, amber and red, white on grey;
   - [TRK-KEY-NAME-CLIP]: a name on the key gets no more room than its side of the card has. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import Pop from './components/Pop.jsx'
import SidePanel from './components/SidePanel.jsx'
import { initStore, resetSession } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const tick = () => new Promise(r => setTimeout(r, 0))
function Live({ draw }: { draw: () => any }) { useSyncExternalStore(C.subscribe, C.getVersion); return draw() }
async function render(el: any) {
  const host = document.createElement('div'); host.className = 'host'; document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => { root.render(el) })
  return { host, root }
}
const key = (el: Element, k: string, extra: any = {}) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra })) })
const ball = (id: string) => [...document.querySelectorAll('#flowSvg .ball')].find(x => (x as HTMLElement).dataset.id === id) as SVGGElement | undefined
const at = (id: string) => { const t = ball(id)!.getAttribute('transform')!; const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(t)!; return { x: +m[1] + 29, y: +m[2] + 29 } }
const scale = () => { const m = /scale\(([\d.]+)\)/.exec(document.getElementById('viewport')!.getAttribute('transform') || ''); return m ? +m[1] : NaN }
/* a mouse drag on a ball, by pointer events with screen points */
function drag(id: string, to: { x: number, y: number }) {
  const g = ball(id)!
  const ev = (type: string, x: number, y: number) => { const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }); Object.defineProperty(e, 'pointerType', { value: 'mouse' }); Object.defineProperty(e, 'pointerId', { value: 1 }); return e }
  g.dispatchEvent(ev('pointerdown', 100, 100))
  g.dispatchEvent(ev('pointermove', (100 + to.x) / 2, (100 + to.y) / 2))
  g.dispatchEvent(ev('pointermove', to.x, to.y))
  g.dispatchEvent(ev('pointerup', to.x, to.y))
}

let board: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
  await C.whenLoaded()
})
afterAll(() => { board.remove(); document.querySelectorAll('.host').forEach(h => h.remove()) })

describe('D980 — the chart by keyboard', () => {
  it('→ goes to an event that needs this one, ← back to one it needs, ↓ / ↑ to the event below / above; nowhere to go: null', () => {
    const first = C.firstEventId()
    const right = C.kbdNext(first, 'ArrowRight')
    expect(right, '→ from the first event').toBeTruthy()
    expect(C.byid[right].prereqs, 'an event that needs the first one').toContain(first)
    expect(C.kbdNext(right, 'ArrowLeft'), '← back to the one it needs').toBe(first)
    expect(C.kbdNext(first, 'ArrowLeft'), 'the first event needs nothing: ← goes nowhere').toBeNull()
    const down = C.kbdNext(first, 'ArrowDown')
    expect(down).toBeTruthy()
    const y = (id: string) => at(id).y
    expect(y(down), '↓ is below').toBeGreaterThan(y(first))
    const up = C.kbdNext(down, 'ArrowUp')
    expect(up && y(up), '↑ is above').toBeLessThan(y(down))
  })

  it('a key on the chart rings its event; Enter opens the marking pop-up with the keyboard on the event\'s own grade; Escape gives the keyboard back to the chart, the same event', async () => {
    const { host } = await render(<Live draw={() => <Pop />} />)
    board.focus()
    await key(board, 'ArrowRight')
    const id = C.kbdId
    expect(id).toBeTruthy()
    expect(ball(id)!.querySelector('.kbdring'), 'the ring round the event the keyboard is on').toBeTruthy()
    expect(ball(id)!.querySelector('.kbdring')!.getAttribute('stroke'), "the app's plain blue ring (D876)").toBe('#1E86FF')
    expect(document.querySelectorAll('#flowSvg .kbdring'), 'one ring only').toHaveLength(1)
    await key(board, 'Enter'); await act(async () => { await tick() })
    expect(C.pop && C.pop.id, 'the pop-up opens on that event').toBe(id)
    const g = C.gradeOf(C.active, id) || 0
    expect((document.activeElement as HTMLElement).dataset.g, 'the keyboard is on its grade as it is').toBe(g === 0 ? '0' : g)
    expect(ball(id)!.querySelector('.kbdring'), 'the event being marked keeps its ring while the pop-up is up').toBeTruthy()
    /* Tab stays inside the pop-up */
    const pop = document.getElementById('pop')!
    const all = [...pop.querySelectorAll('button')], last = all[all.length - 1]!; last.focus()
    await key(last, 'Tab')
    expect(document.activeElement, 'Tab from the last control goes round to the first').toBe(all[0])
    await key(all[0]!, 'Tab', { shiftKey: true })
    expect(document.activeElement, 'and Shift+Tab from the first to the last').toBe(last)
    await act(async () => { C.handleEscapeKey(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })) })
    expect(C.pop, 'Escape closes it').toBeNull()
    expect(document.activeElement, 'the keyboard is back on the chart').toBe(board)
    expect(C.kbdId).toBe(id)
    expect(ball(id)!.querySelector('.kbdring'), 'on the same event').toBeTruthy()
    host.remove()
  })

  it('a grade pressed from the keyboard closes the pop-up and the keyboard is back on the chart', async () => {
    const { host } = await render(<Live draw={() => <Pop />} />)
    board.focus(); await key(board, 'Enter'); await act(async () => { await tick() })
    const id = C.pop.id
    const btn = document.querySelector('#pop .opts button[data-g="dco"]') as HTMLButtonElement
    btn.focus()
    await act(async () => { btn.click(); await tick() })
    expect(C.pop).toBeNull()
    expect(C.gradeOf(C.active, id)).toBe('dco')
    expect(document.activeElement).toBe(board)
    host.remove()
  })

  it('a grade pressed with the MOUSE (its button holding the focus, as Chrome leaves it) gives the chart no focus and draws no ring', async () => {
    const { host } = await render(<Live draw={() => <Pop />} />)
    ;(document.activeElement as HTMLElement)?.blur?.()
    const id = C.SYL[3].id
    await act(async () => { C.openPop(id, { clientX: 5, clientY: 5 }); await tick() })
    const btn = document.querySelector('#pop .opts button[data-g="marg"]') as HTMLButtonElement
    btn.focus()
    await act(async () => { btn.click(); await tick() })
    expect(C.gradeOf(C.active, id)).toBe('marg')
    expect(document.activeElement, 'the chart is not given the focus').not.toBe(board)
    expect(document.querySelectorAll('#flowSvg .kbdring'), 'no keyboard ring').toHaveLength(0)
    host.remove()
  })

  it('in Edit chart layout the arrows are not the chart\'s, and no ring is drawn', async () => {
    board.focus(); await key(board, 'ArrowDown')
    expect(document.querySelectorAll('#flowSvg .kbdring'), 'the ring, before').toHaveLength(1)
    C.toggleArrange(); await tick()
    const was = C.kbdId
    await key(board, 'ArrowDown')
    expect(C.kbdId).toBe(was)
    expect(document.querySelectorAll('#flowSvg .kbdring')).toHaveLength(0)
    C.toggleArrange(); await tick()
  })
})

describe('[TRK-WIREBOARD-REPEAT] — balls moved in Edit chart layout, and one wheel step still zooms once', () => {
  it('after two moves a wheel step zooms ×1.16, as before any move', async () => {
    C.toggleArrange(); await tick()
    C.setTool('move')
    const wheel = () => { const svg = document.getElementById('flowSvg')!; const k0 = scale(); svg.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true })); return scale() / k0 }
    const r0 = wheel()
    const ids = C.SYL.slice(0, 2).map((e: any) => e.id)
    for (const id of ids) drag(id, { x: 140, y: 120 })
    const r2 = wheel()
    expect(r0).toBeCloseTo(1.162, 2)
    expect(r2, 'one zoom per wheel step after two moves').toBeCloseTo(r0, 2)
    C.toggleArrange(); await tick()
  })
})

describe('[TRK-BALL-OFF-CHART-LEFT] — nothing dropped before the chart\'s start', () => {
  it('a ball dropped far left of and above the chart stops with its centre at its half-width from both edges', async () => {
    C.toggleArrange(); await tick(); C.setTool('move')
    const id = C.firstEventId()
    drag(id, { x: -5000, y: -5000 })
    const p = at(id)
    expect(p.x).toBeGreaterThanOrEqual(29); expect(p.y).toBeGreaterThanOrEqual(29)
    C.toggleArrange(); await tick()
  })
  it('a picked group stops as a whole, keeping its shape', async () => {
    C.toggleArrange(); await tick(); C.setTool('select')
    const [a, b] = C.SYL.slice(2, 4).map((e: any) => e.id)
    const pa = at(a), pb = at(b)
    C.selectAllClick && C.selectAllClick()
    drag(a, { x: -9000, y: -9000 })
    const qa = at(a), qb = at(b)
    for (const e of C.SYL) { const q = at(e.id); expect(q.x).toBeGreaterThanOrEqual(29 - 0.01); expect(q.y).toBeGreaterThanOrEqual(29 - 0.01) }
    expect(Math.round(qb.x - qa.x), 'the group keeps its shape').toBe(Math.round(pb.x - pa.x))
    expect(Math.round(qb.y - qa.y)).toBe(Math.round(pb.y - pa.y))
    C.setTool('move'); C.toggleArrange(); await tick()
  })
})

describe('D982 — the Currency & flex bars\' ink comes with their colour', () => {
  it('dark words on green, amber and red; white on grey — for every bar each function returns', () => {
    const days = [null, 0, 6, 7, 13, 14, 20, 21, 30, 31, 59, 60, 119, 120, 400]
    for (const d of days) for (const f of [C.flexFor, C.landingCurrency]) {
      const b = f(d)
      expect(b.ink, `${b.txt} on ${b.color}`).toBe(b.color === 'var(--grey)' ? '#fff' : 'var(--bg)')
    }
    expect(C.flexFor(10).color, 'the colours are as they were').toBe('var(--orange)')
    expect(C.flexFor(3).txt, 'the words too').toBe('Current — no flex required')
  })
  it('the side panel draws each bar in its own ink', async () => {
    const { host } = await render(<Live draw={() => <SidePanel zoom={1} />} />)
    const bars = [...host.querySelectorAll('.flexbar')] as HTMLElement[]
    expect(bars.length).toBe(2)
    for (const b of bars) expect(b.style.color, b.textContent || '').toBe(b.style.background.includes('--grey') ? 'rgb(255, 255, 255)' : 'var(--bg)')
    host.remove()
  })
})

describe('[TRK-KEY-NAME-CLIP] — every name of the key inside the card', () => {
  it('a name on the left gets no more room than the left of the card has: its type shrinks, then narrows', () => {
    const left = C.keyFont('HIS STUDENT', 'end', 27, 19)
    expect(left.size).toBeLessThan(19)
    expect(11 * 0.68 * left.size, 'its width fits from the ring to the card\'s left edge').toBeLessThanOrEqual(27 + 95)
    expect(C.keyFont('ABC', 'end', 27, 19), 'a short name keeps its size').toEqual({ size: 19, squeeze: 0 })
    const long = C.keyFont('A VERY LONG STUDENT NAME INDEED', 'end', 27, 19)
    expect(long.size).toBe(12); expect(long.squeeze, 'too long even small: narrowed to the room').toBeGreaterThan(0)
    expect(long.squeeze).toBeLessThanOrEqual(27 + 95)
  })
  it('the key drawn with a long third name carries the smaller type on that name', () => {
    const was = C.roster.slice()
    C.roster.push({ id: 'sKEYLONG', name: 'HIS STUDENT' })
    const html = C.renderKeyBall()
    C.roster.length = 0; for (const r of was) C.roster.push(r)
    const m = /font-size="([\d.]+)"[^>]*>HIS STUDENT</.exec(html)
    expect(m, 'the name is drawn').toBeTruthy()
    expect(+m![1]).toBeLessThan(19)
  })
})

describe('D980 — the scenario designer\'s cases (17 Oct 26)', () => {
  it('a window over the chart has the keys: with the details window up the arrows walk nothing and Enter opens nothing', async () => {
    board.focus(); await key(board, 'ArrowDown')
    const was = C.kbdId
    C.openInfo(was)
    await key(board, 'ArrowDown'); await key(board, 'Enter')
    expect(C.kbdId).toBe(was)
    expect(C.pop).toBeNull()
    C.closeInfo()
  })
  it('✎ Edit details pressed from a keyboard pop-up: the keyboard leaves the chart for the window, and comes back to the same event when it closes', async () => {
    const { host } = await render(<Live draw={() => <Pop />} />)
    board.focus(); await key(board, 'Enter'); await act(async () => { await tick() })
    const id = C.pop.id
    const btn = document.getElementById('popEditInfo') as HTMLButtonElement
    btn.focus(); await act(async () => { btn.click(); await tick() })
    expect(C.infoId).toBe(id)
    expect(document.activeElement, 'not handed to the chart behind the window').not.toBe(board)
    await act(async () => { C.closeInfo(); await tick() })
    expect(document.activeElement, 'back on the chart').toBe(board)
    expect(C.kbdId).toBe(id)
    host.remove()
  })
  it('a keyboard pop-up closed by a press elsewhere takes the ring with it', async () => {
    const { host } = await render(<Live draw={() => <Pop />} />)
    board.focus(); await key(board, 'Enter'); await act(async () => { await tick() })
    ;(document.activeElement as HTMLElement).blur(); document.body.focus()
    await act(async () => { C.closePop(); await tick() })
    expect(document.querySelectorAll('#flowSvg .kbdring')).toHaveLength(0)
    host.remove()
  })
  it('the keyboard follows a search: the next arrow starts from the event found', async () => {
    C.runSearch('ST-02'); await new Promise(r => setTimeout(r, 60))
    expect(C.kbdId).toBe('ST-02')
    C.clearSearch()
  })
  it('branches: → takes the first, ← comes back, → again takes the next branch — every branch once, round to the first', () => {
    const p = C.SYL.find((e: any) => C.SYL.filter((x: any) => (x.prereqs || []).includes(e.id)).length >= 3).id
    const kids = C.SYL.filter((x: any) => (x.prereqs || []).includes(p)).map((x: any) => x.id)
    let at = p, came: any = null; const seen: string[] = []
    for (let i = 0; i <= kids.length; i++) {
      ;[at, came] = C.kbdStep(at, 'ArrowRight', came); seen.push(at)
      const [b, c2] = C.kbdStep(at, 'ArrowLeft', came); expect(b, '← comes back').toBe(p); at = b; came = c2
    }
    expect(seen.slice(0, kids.length).sort(), 'every branch, once each').toEqual(kids.slice().sort())
    expect(seen[kids.length], 'then round to the first').toBe(seen[0])
  })
  it('an event that needs several: ← takes the first, → comes back down, ← again takes the next it needs', () => {
    const x = C.SYL.find((e: any) => (e.prereqs || []).filter((p: string) => C.byid[p]).length >= 2)
    const ups = x.prereqs.filter((p: string) => C.byid[p])
    let at = x.id, came: any = null; const seen = new Set<string>()
    for (let i = 0; i < ups.length; i++) {
      ;[at, came] = C.kbdStep(at, 'ArrowLeft', came); seen.add(at)
      ;[at, came] = C.kbdStep(at, 'ArrowRight', came); expect(at, '→ comes back down').toBe(x.id)
    }
    expect([...seen].sort()).toEqual(ups.slice().sort())
  })
  it('every event of every built-in chart can be reached from its first one by the four arrows (every state walked)', async () => {
    for (const id of ['sb2024', 'sb2026', 'sbtx2026', 'sbagaa2026']) {
      if (!C.sylEntry(id)) continue
      await C.switchSyllabus(id); await C.whenLoaded(); await tick()
      const keyOf = (at: string, c: any) => at + '|' + (c ? c.from + '|' + c.key + '|' + c.back : '')
      const seen = new Set([C.firstEventId()]), states = new Set<string>(), todo: any[] = [[C.firstEventId(), null]]
      while (todo.length) {
        const [at, came] = todo.pop(); const k = keyOf(at, came); if (states.has(k)) continue; states.add(k)
        for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']) { const [n, c] = C.kbdStep(at, key, came); seen.add(n); todo.push([n, c]) }
      }
      const missed = C.SYL.map((e: any) => e.id).filter((x: string) => !seen.has(x))
      expect(missed, 'unreachable on ' + id + ' ' + JSON.stringify(missed)).toEqual([])
    }
    await C.switchSyllabus('sb2026'); await C.whenLoaded()
  })
})
