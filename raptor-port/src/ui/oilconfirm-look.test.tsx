// @vitest-environment jsdom
/* THE OIL QUESTION'S WORDS, LOOK AND KEYS ([LOOK-13OCT-SMALL-FIXES] — the design look of 13 Oct 26, owner D830; the
   words D837 and D839, 14 Oct 26: docs/superpowers/briefs/2026-10-13-wording-recheck.md, the second table and List 3
   row 10). One test per finding the sheet itself carries:
     L1  the answers sit flat under the question — no `.seg` (the week strip's rule), no boxed row;
     L3  the reason and the question are ONE ordinary sentence, not a heading in capitals;
     L4  at an input's own save the two buttons read Back / Save, or Back / Add — never "Cancel";
     L5  a picked answer takes the outline look (`.on-pick`), never the main button's solid fill (`.on-keep`);
     L2, K7  the first answer takes the keyboard as the sheet opens, and the ✕ is the LAST Tab stop;
     and the bar that stays: L7, K8, K9 — the keyboard goes to "Answer OIL" when it appears, Escape on it closes it.
   The sheet is drawn alone (it takes everything by props); the bar through the app's own state. What only a real
   browser can show — the ✕ in the corner, the ring, the flat row on screen — is the check's walk. */
import { describe, it, expect, afterEach } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { OilConfirm } from './OilConfirm'
import { OilBar, OilBand } from './OilWaitSheet'
import { OILBAR, setOilBar } from '../state/view'
import { notify } from '../state/store'

let root: Root | null = null, host: HTMLElement | null = null
const mount = async (el: React.ReactElement) => {
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root!.render(el) })
}
afterEach(async () => {
  await act(async () => { root?.unmount() })
  host?.remove(); root = null; host = null
  setOilBar(null)
})
const $ = (s: string) => document.querySelector(s) as HTMLElement | null
const tid = (t: string) => $(`[data-testid="${t}"]`)
const text = (t: string) => (tid(t)?.textContent || '').replace(/\s+/g, ' ').trim()
const tab = async (shift = false) => { await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: shift, bubbles: true, cancelable: true })) }) }
const sheet = (over: Partial<Parameters<typeof OilConfirm>[0]> = {}) => (
  <OilConfirm who="Tally" typeLabel="Range brief" plan={[{ iso: '2026-07-18', amt: 0.5 }]} prev={{}}
    onSave={() => {}} onCancel={() => {}} {...over} />
)

describe('the OIL question — the words of record (D837, D839)', () => {
  it('the title joins its name with a colon, never a dash', async () => {
    await mount(sheet())
    expect($('[data-testid="oilconf"] .airpop-head b')!.textContent).toBe('OIL: Tally, Range brief')
  })
  it('L3 — the reason and the question are one ordinary sentence: the day with its weekday, then what kind of day', async () => {
    await mount(sheet())
    expect(text('oilconf-ask')).toBe('This input falls on Sat 18 Jul, a non-working day (weekend/PH). Does it deserve HO, half a day of OIL?')
    expect($('[data-testid="oilconf"] .upconf-h'), 'no heading in capitals above the one-day question').toBeNull()
  })
  it('a full day asks for FO in the same sentence', async () => {
    await mount(sheet({ plan: [{ iso: '2026-07-19', amt: 1 }] }))
    expect(text('oilconf-ask')).toBe('This input falls on Sun 19 Jul, a non-working day (weekend/PH). Does it deserve FO, a full day of OIL?')
    expect(tid('oil-yes')!.textContent).toBe('Yes: credit FO')
  })
  it('the answers read "Yes: credit HO" and "No OIL"', async () => {
    await mount(sheet())
    expect(tid('oil-yes')!.textContent).toBe('Yes: credit HO')
    expect(tid('oil-no')!.textContent).toBe('No OIL')
  })
  it('the small print: "the day", "published work the same day", and what is raised is named — the credit', async () => {
    await mount(sheet())
    expect($('[data-testid="oilconf"] .oilconf-note')!.textContent).toBe('The credit lands on the Leave War as an HO cell and moves the OIL balance. Hours count start to finish for the day, so published work the same day can raise the credit.')
  })
  it('the several-days form keeps the words it had (not on the page he approved — D808)', async () => {
    await mount(sheet({ plan: [{ iso: '2026-07-18', amt: 1 }, { iso: '2026-07-19', amt: 1 }] }))
    expect($('[data-testid="oilconf"] .upconf-h')!.textContent).toBe('This input covers 2 non-working days (weekend / PH)')
    expect($('[data-testid="oilconf"] .oilconf-what')!.textContent).toBe('Each confirmed day earns FO — a full day of OIL. Which days does it deserve?')
    expect([tid('oil-all'), tid('oil-some'), tid('oil-none')].map(b => b!.textContent)).toEqual(['All days', 'Only some days…', 'No OIL'])
  })
})

describe('the OIL question — its look (L1, L4, L5)', () => {
  it('L1 — the answers sit in a row of the sheet’s own: no `.seg` wrapper and no boxed row round them', async () => {
    for (const plan of [[{ iso: '2026-07-18', amt: 0.5 as const }], [{ iso: '2026-07-18', amt: 1 as const }, { iso: '2026-07-19', amt: 1 as const }]]) {
      await mount(sheet({ plan }))
      const first = $('[data-testid="oilconf"] .upconf-seg')!
      expect(first.parentElement!.className, `${plan.length} day(s)`).toBe('oilconf-answers')
      expect($('[data-testid="oilconf"] .seg'), 'the week strip’s class is not worn').toBeNull()
      expect($('[data-testid="oilconf"] .upconf-left'), 'no boxed row').toBeNull()
      await act(async () => { root!.unmount() }); host!.remove(); root = null; host = null
    }
  })
  it('L4 — at an input’s own save the buttons read Back / Save; a new input’s form names its own: Back / Add', async () => {
    await mount(sheet())
    expect(tid('oilconf-cancel')!.textContent).toBe('Back')
    expect(tid('oilconf-save')!.textContent).toBe('Save')
    await act(async () => { root!.render(sheet({ yesLabel: 'Add' })) })
    expect([tid('oilconf-cancel')!.textContent, tid('oilconf-save')!.textContent]).toEqual(['Back', 'Add'])
  })
  it('a change that waits on the question keeps its own two buttons ("Don’t swap" / "Swap")', async () => {
    await mount(sheet({ lead: 'Swapping Tally and Ranger', noLabel: 'Don’t swap', yesLabel: 'Swap' }))
    expect([tid('oilconf-cancel')!.textContent, tid('oilconf-save')!.textContent]).toEqual(['Don’t swap', 'Swap'])
  })
  it('L5 — a picked answer takes the outline look and says so to a screen reader; the main button stays the one solid one', async () => {
    await mount(sheet())
    const yes = tid('oil-yes')!, no = tid('oil-no')!
    expect(yes.getAttribute('aria-pressed')).toBe('false')
    await act(async () => { yes.click() })
    expect(yes.className).toBe('upconf-seg on-pick')
    expect(yes.getAttribute('aria-pressed')).toBe('true')
    expect(no.className).toBe('upconf-seg')
    await act(async () => { no.click() })
    expect(no.className, 'a picked No wears the same look').toBe('upconf-seg on-pick')
    expect(yes.className).toBe('upconf-seg')
    expect($('[data-testid="oilconf"] .on-keep'), 'never the solid fill').toBeNull()
    expect(tid('oilconf-save')!.className).toBe('abtn primary')
  })
})

describe('the OIL question — the keyboard (L2, K7)', () => {
  it('K7 — as it opens the keyboard is on the first answer, and nothing is picked by that', async () => {
    await mount(sheet())
    expect(document.activeElement).toBe(tid('oil-yes'))
    expect((tid('oilconf-save') as HTMLButtonElement).disabled, 'still unanswered').toBe(true)
  })
  it('K7 — the several-days form the same: on "All days"', async () => {
    await mount(sheet({ plan: [{ iso: '2026-07-18', amt: 1 }, { iso: '2026-07-19', amt: 1 }] }))
    expect(document.activeElement).toBe(tid('oil-all'))
  })
  it('L2 — the ✕ is the LAST stop: Tab from the last button reaches it, Tab from it comes round to the first answer', async () => {
    await mount(sheet())
    const x = $('[data-testid="oilconf"] .airpop-head .x')!
    await act(async () => { tid('oil-yes')!.click() })            // "Save" is live, so it is a stop
    tid('oilconf-save')!.focus()
    await tab()
    expect(document.activeElement, 'after the main button comes the ✕').toBe(x)
    await tab()
    expect(document.activeElement, 'and round to the first answer').toBe(tid('oil-yes'))
  })
  it('L2 — backwards: Shift+Tab from the first answer goes to the ✕, and from the ✕ to the last button', async () => {
    await mount(sheet())
    const x = $('[data-testid="oilconf"] .airpop-head .x')!
    expect(document.activeElement).toBe(tid('oil-yes'))
    await tab(true)
    expect(document.activeElement).toBe(x)
    await tab(true)
    expect(document.activeElement, 'Save is off while unanswered, so the last live button is the left-hand one').toBe(tid('oilconf-cancel'))
  })
  it('a Tab between two of the sheet’s own controls is left to the browser (nothing is taken over but the steps round the ✕)', async () => {
    await mount(sheet())
    tid('oil-yes')!.focus()
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    await act(async () => { document.dispatchEvent(ev) })
    expect(ev.defaultPrevented).toBe(false)
  })
})

describe('the bar that stays — the keyboard (L7, K8, K9)', () => {
  const wait: any = { kind: 'swap', places: [], ask: () => 'done' }
  const raise = async () => { await act(async () => { setOilBar({ text: 'Not swapped — OIL not answered', wait }); notify() }) }
  it('K8 — when the bar appears the keyboard goes to "Answer OIL"', async () => {
    await mount(<OilBar />)
    expect(tid('oilbar')).toBeNull()
    await raise()
    expect(tid('oilbar-text')!.textContent).toBe('Not swapped — OIL not answered')
    expect(document.activeElement).toBe(tid('oilbar-answer'))
  })
  it('K9 — Escape with the keyboard on the bar closes it, as OK does', async () => {
    await mount(<OilBar />)
    await raise()
    await act(async () => { tid('oilbar-answer')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(tid('oilbar')).toBeNull()
    expect(OILBAR).toBeNull()
  })
  /* ONE BAR ON SCREEN (D831): under a full-screen surface's own bar while that surface is in front — and then the top
     bar's copy is not drawn at all, so there is never a second "Answer OIL" to tab to */
  it('a full-screen surface carries the bar under its own bar, and the top bar’s copy stands down while it does', async () => {
    await mount(<><div className="topbar"><OilBar /></div><div className="sb-top"><OilBand active={true} /></div></>)
    await raise()
    const bars = [...document.querySelectorAll('[data-testid="oilbar"]')]
    expect(bars).toHaveLength(1)
    expect(bars[0]!.className, 'in the surface’s own flow').toBe('oilband')
    expect(bars[0]!.closest('.sb-top')).toBeTruthy()
    expect(document.activeElement, 'and that one has the keyboard').toBe(bars[0]!.querySelector('[data-testid="oilbar-answer"]'))
  })
  it('…and with that surface closed (still drawn, not in front) the top bar carries it', async () => {
    await mount(<><div className="topbar"><OilBar /></div><div className="sb-top"><OilBand active={false} /></div></>)
    await raise()
    const bars = [...document.querySelectorAll('[data-testid="oilbar"]')]
    expect(bars).toHaveLength(1)
    expect(bars[0]!.className).toBe('oilband is-top')
    expect(bars[0]!.closest('.topbar')).toBeTruthy()
  })
  it('the bar is its words and its two buttons, as ruled — and nothing else', async () => {
    await mount(<div className="topbar"><OilBar /></div>)
    await raise()
    expect([...tid('oilbar')!.children].map(k => [k.tagName, k.textContent])).toEqual([['SPAN', 'Not swapped — OIL not answered'], ['BUTTON', 'Answer OIL'], ['BUTTON', 'OK']])
    expect(tid('oilbar')!.getAttribute('role')).toBe('status')
  })
  it('Escape with the keyboard anywhere else is not the bar’s to take: it stays', async () => {
    await mount(<OilBar />)
    await raise()
    const box = document.createElement('input'); document.body.appendChild(box); box.focus()
    await act(async () => { box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(tid('oilbar'), 'still up').toBeTruthy()
    box.remove()
  })
})
