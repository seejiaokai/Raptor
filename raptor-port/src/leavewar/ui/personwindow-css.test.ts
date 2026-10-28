// @vitest-environment node — reads two stylesheets off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* ON A PHONE, WITH APPROVALS' SLIM BAR UP, THE PERSON WINDOW STILL STANDS UNDER THE TOP BAR (the fresh read of the M5a
   fixes, finding 2, 29 Oct 26). The walk's #7 held the phone window's top under the bar through its height; approvals.css's
   phone rule for every window above the slim bar is weightier (an id, five classes) and set a height of its own, so a tall
   person window stood at about 35 again, over the bar. jsdom lays nothing out, so this pins the stylesheet's half — the
   rule is there, inside the phone block, weightier than approvals.css's, with the height that centres the window at the
   bar's foot + 8 — and the browser test of the same name measures it on screen. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (f: string) => readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')
const pw = read('./personwindow.css')
const ap = read('./approvals.css')

const PW_SEL = '&:has([data-testid="appr-slim"].ph) .bidsheet[data-testid="person-window"]:not(.full):not(.fullpage)'
const AP_SEL = '&:has([data-testid="appr-slim"].ph) .bidsheet:not(.full):not(.fullpage)'

/** Classes, attributes and pseudo-classes in a selector (the `#page-leavewar` both are nested in is the same id for each). */
const weight = (sel: string) => (sel.replace(/:(has|not)\(/g, '(').match(/\.[\w-]+|\[[^\]]+\]/g) || []).length

describe('the phone person window under the top bar while the slim bar is up', () => {
  it('approvals.css still has the rule this one must out-weigh', () => {
    expect(ap.includes(AP_SEL)).toBe(true)
  })
  it('the person window has its own rule, inside the phone block, weightier than approvals.css’s', () => {
    const phone = pw.slice(pw.indexOf('@media (max-width: 700px)'))
    const at = phone.indexOf(PW_SEL)
    expect(at).toBeGreaterThan(-1)
    expect(phone.slice(0, at).includes('}\n  }')).toBe(false)   // still inside that @media block
    expect(weight(PW_SEL)).toBeGreaterThan(weight(AP_SEL))
  })
  it('its height centres it at the bar’s foot + 8, between top 12 and the slim bar’s 64 + safe area', () => {
    const phone = pw.slice(pw.indexOf('@media (max-width: 700px)'))
    const body = phone.slice(phone.indexOf(PW_SEL)).match(/\{([^{}]*)\}/)![1]!.replace(/\s+/g, ' ')
    expect(body).toContain('max-height: calc(100dvh - 2 * (var(--topbar-h, 0px) + 8px) - 52px - env(safe-area-inset-bottom, 0px))')
    expect(body).toContain('max-height: calc(100vh - 2 * (var(--topbar-h, 0px) + 8px) - 52px)')
  })
})
