// @vitest-environment jsdom
/* Security pin: a recorded sign-off callsign is interpolated into the AL tag's
   hover tooltip inside a dangerouslySetInnerHTML block. Callsigns are editable
   (QualsPage renameCallsign only trims + checks uniqueness — quotes and markup
   pass), so an un-escaped title lets a callsign like  A" onmouseover=alert(1)
   break out of the attribute and become live markup. The value must be escaped
   at render time so already-saved names are handled too. Same family as the two
   unescaped sinks found 6 Aug 26. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ALPanel } from './ALPanel'
import { initStore, notify } from '../state/store'
import { SCHED } from '../engine/publish'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root

beforeAll(() => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
})
afterAll(() => {
  act(() => root.unmount())
  host.remove()
})

describe('ALPanel sign-off tooltip', () => {
  it('escapes a callsign carrying attribute-breakout markup', () => {
    const evil = 'A" onmouseover="alert(1)'
    // a published AL signed off by a person whose callsign carries markup.
    // alDays() falls back to rec.days when keys are empty; alCount() reads n0.
    SCHED.als.length = 0
    SCHED.als.push({
      n: 1, n0: 1, keys: [], days: [0],
      sign: { 0: { cur: evil, sked: '', plan: '', appr: '' } },
    } as any)

    act(() => { root.render(<ALPanel />); notify() })

    const tag = host.querySelector('.al-tag') as HTMLElement
    expect(tag, 'the AL tag rendered').toBeTruthy()
    // the callsign survives as DATA inside the title, not as markup: no stray
    // event-handler attribute was parsed out of the string.
    expect(host.querySelector('[onmouseover]')).toBeNull()
    expect(tag.getAttribute('onmouseover')).toBeNull()
    // and the full callsign, quote included, is preserved in the tooltip text.
    expect(tag.getAttribute('title')).toContain(evil)
  })
})
