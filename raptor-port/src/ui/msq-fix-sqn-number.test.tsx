// @vitest-environment jsdom
/* THE "142" FAMILY (the walk of 21 Nov 26 — W1, W4, W5): the top bar's small squadron number read "142" for Kestrel, 149's
   only admin, at any hour, and for Ranger after his move; Kestrel's Quals export was named "142-LoX-ALL.csv" and his
   schedule CSV "142-schedule.csv" though they hold 149's; the print's title and heading the same. The batch plan
   (docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4 "What shows 142 today"; D2184 R29, first half): the
   mark, the print and the schedule CSV read the schedule in view's number, Quals' LoX the page's own squadron's. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act } from '@testing-library/react'
import { useMsqWorld, signInAs, moveMan, pastMidnight, PID } from '../test-support/msq-world'
import { TalonMark } from './icons'
import * as exp from './export'
import { schedPrintHTML } from './printpdf'

useMsqWorld()
afterEach(() => cleanup())

const markNum = (c: HTMLElement) => c.querySelector('.mark .k')?.textContent

describe('the top bar\'s squadron number is the schedule in view\'s', () => {
  it('Kestrel, 149\'s admin, reads 149; Saber reads 142', () => {
    signInAs('kestrel')
    const a = render(<TalonMark />)
    expect(markNum(a.container)).toBe('149')
    a.unmount()
    signInAs('saber')
    expect(markNum(render(<TalonMark />).container)).toBe('142')
  })
  it('Ranger, moved to 149 from tomorrow: 142 today, 149 after midnight with no reload', () => {
    moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    const { container } = render(<TalonMark />)
    expect(markNum(container)).toBe('142')
    act(() => { pastMidnight() })
    expect(markNum(container)).toBe('149')
  })
})

describe('the export files and the print carry the squadron they hold', () => {
  it('Kestrel\'s schedule CSV, Quals export and print name 149', () => {
    signInAs('kestrel')
    expect((exp as any).schedCsvName()).toBe('149-schedule.csv')
    expect((exp as any).loxCsvName('ALL')).toBe('149-LoX-ALL.csv')
    const html = schedPrintHTML(exp.schedRows(), 'wk')
    expect(html).toContain('149 — Flying Programme')
    expect(html).toContain('<title>149 Flying Programme')
    expect(html).not.toContain('142')
  })
  it('(control) Hunter\'s name 142', () => {
    signInAs('hunter')
    expect((exp as any).schedCsvName()).toBe('142-schedule.csv')
    expect((exp as any).loxCsvName('FCP')).toBe('142-LoX-FCP.csv')
    expect(schedPrintHTML(exp.schedRows(), 'wk')).toContain('142 — Flying Programme')
  })
})
