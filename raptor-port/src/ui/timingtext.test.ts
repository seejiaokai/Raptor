/* THE TIMING READOUT'S WORDS ([APP-SPEED] step 1 — owner D2481, D2483; the words Fable's review gave the mock-up of
   24 Nov 26, adopted whole). Every figure reads one way only: the start-up times are points on one clock ("at"), the
   sign-in is a length ("took"); a figure a browser does not give says so by name, never a blank or a 0; a time under a
   twentieth of a second never reads "0.0 s". */
import { describe, expect, it } from 'vitest'
import { TAB_BEHIND, browserOf, copyText, filesOf, kb, notGiven, readoutSections, secs, stamp, type TimingView } from './timingtext'

const view = (over: Partial<TimingView> = {}): TimingView => ({
  site: 300, app: 812, first: { screen: 'signin', t: 840 }, signin: 1700,
  pages: [
    { name: 'View-only Sched', first: false, ms: 912, downloaded: 0 },
    { name: 'Leave War', first: true, ms: 1084, downloaded: 140_288 },
    { name: 'Edit Schedule', first: true, ms: 806, downloaded: 0 },
  ],
  freezes: { supported: true, n: 14, total: 3240, max: 610 },
  files: { supported: true, n: 14, bytes: 831_488, kept: 0, asked: 0 },
  env: { browser: { name: 'Edge', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 240_000 },
  ...over,
})
const rowsOf = (v: TimingView) => readoutSections(v).flatMap(s => s.rows.map(r => [r.label + (r.tag ? ' ' + r.tag : ''), r.value]))

describe('the figures, in words', () => {
  it('a time is in seconds to one place, and anything under a twentieth of a second reads "under 0.1 s"', () => {
    expect(secs(912)).toBe('0.9 s')
    expect(secs(1700)).toBe('1.7 s')
    expect(secs(12_345)).toBe('12.3 s')
    expect(secs(49)).toBe('under 0.1 s')
    expect(secs(0)).toBe('under 0.1 s')
    expect(secs(50)).toBe('0.1 s')
  })
  it('a size is in KB, or MB from 1,000 KB', () => {
    expect(kb(140_288)).toBe('137 KB')
    expect(kb(831_488)).toBe('812 KB')
    expect(kb(2_400_000)).toBe('2.3 MB')
  })
  it('a missing figure names the browser that does not give it', () => {
    expect(notGiven('Safari')).toBe('not given by Safari')
    expect(notGiven(null)).toBe('not given by this browser')
  })
  it('knows the browser from its own description of itself — Edge before Chrome, Safari only when nothing else claims it', () => {
    expect(browserOf('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.70')).toEqual({ name: 'Edge', version: '131' })
    expect(browserOf('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')).toEqual({ name: 'Chrome', version: '131' })
    expect(browserOf('Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1')).toEqual({ name: 'Safari', version: '18' })
    expect(browserOf('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0')).toEqual({ name: 'Firefox', version: '133' })
    expect(browserOf('something else')).toEqual({ name: null, version: null })
  })
  it('the date stamp reads the app\'s way, day month year, then the clock', () => {
    expect(stamp(new Date(2026, 10, 24, 14, 5))).toBe('24 Nov 26 14:05')
  })
})

describe('the window\'s three sections, as the mock-up shows them', () => {
  it('reads every row of the approved mock-up word for word', () => {
    const s = readoutSections(view())
    expect(s.map(x => x.head)).toEqual(['Start-up, from opening the address', 'Pages opened, newest first', 'This computer'])
    expect(rowsOf(view())).toEqual([
      ['Site answered', 'at 0.3 s'],
      ['App loaded', 'at 0.8 s'],
      ['Sign-in shown', 'at 0.8 s'],
      ['Sign in pressed → week shown', 'took 1.7 s'],
      ['View-only Sched opened before', '0.9 s'],
      ['Leave War first time · downloaded 137 KB', '1.1 s'],
      ['Edit Schedule first time', '0.8 s'],
      ['Brief freezes', '14 · 3.2 s in all'],
      ['Longest freeze', '0.6 s'],
      ['App files used', '14 · 812 KB'],
      ['Kept from an earlier visit', '0 of 14'],
      ['Processor · memory', '4 cores · 8 GB or more'],
      ['Screen · browser', '1366×768 · Edge'],
    ])
    // the sign-in is a different clock: set apart by its own gap
    expect(s[0].rows.find(r => r.label.startsWith('Sign in pressed'))!.gap).toBe(true)
  })
  it('before the sign-in, and with no page opened, says so rather than leaving a blank', () => {
    const v = view({ signin: null, pages: [], first: { screen: 'signin', t: 840 } })
    const s = readoutSections(v)
    expect(s[0].rows.find(r => r.label.startsWith('Sign in pressed'))!.value).toBe('not yet')
    expect(s[1].rows).toEqual([])
    expect(s[1].empty).toBe('No page opened yet')
  })
  /* the walk of 24 Nov 26 (chat 164, W24): opened in a tab behind another, "Sign-in shown at 36.3 s" — not this
     computer's speed. The site's answer is the network's, which a tab not in front does not delay, and the sign-in is
     pressed in the tab itself: both keep their figures. The words a fresh Fable's (D2441) */
  it('a tab not in front before its first screen: the app\'s load and the first screen say why there is no figure', () => {
    const r = rowsOf(view({ behind: true }))
    expect(r.slice(0, 4)).toEqual([['Site answered', 'at 0.3 s'], ['App loaded', TAB_BEHIND], ['Sign-in shown', TAB_BEHIND], ['Sign in pressed → week shown', 'took 1.7 s']])
    expect(TAB_BEHIND).toBe('not timed, tab not in front')
    expect(copyText(view({ behind: true }), new Date(2026, 10, 24, 9, 5))).toContain('  Sign-in shown: ' + TAB_BEHIND)
  })
  it('a start that showed no sign-in card says "not shown", never a time', () => {
    const s = readoutSections(view({ first: { screen: 'week', t: 900 } }))
    expect(s[0].rows.find(r => r.label === 'Sign-in shown')!.value).toBe('not shown')
  })
  it('no freezes reads "none"; a browser that does not report them (Safari) says so by name', () => {
    expect(rowsOf(view({ freezes: { supported: true, n: 0, total: 0, max: 0 } })).filter(r => /freeze/i.test(r[0]))).toEqual([['Brief freezes', 'none'], ['Longest freeze', 'none']])
    const safari = view({ freezes: { supported: false, n: 0, total: 0, max: 0 }, env: { ...view().env, browser: { name: 'Safari', version: '18' }, memGB: null } })
    const r = rowsOf(safari)
    expect(r.filter(x => /freeze/i.test(x[0]))).toEqual([['Brief freezes', 'not given by Safari'], ['Longest freeze', 'not given by Safari']])
    expect(r.find(x => x[0] === 'Processor · memory')![1]).toBe('4 cores · memory not given by Safari')
  })
  it('memory under 8 GB is given as it is; 8 is the most a browser reports, so it reads "8 GB or more"', () => {
    expect(rowsOf(view({ env: { ...view().env, memGB: 4 } })).find(x => x[0] === 'Processor · memory')![1]).toBe('4 cores · 4 GB')
  })
  it('files kept from an earlier visit are counted; a browser that cannot tell says so', () => {
    expect(rowsOf(view({ files: { supported: true, n: 14, bytes: 831_488, kept: 12, asked: 2 } })).find(x => x[0] === 'Kept from an earlier visit')![1]).toBe('12 of 14')
    expect(rowsOf(view({ files: { supported: false, n: 14, bytes: 831_488, kept: 0, asked: 0 }, env: { ...view().env, browser: { name: 'Safari', version: '17' } } })).find(x => x[0] === 'Kept from an earlier visit')![1]).toBe('not given by Safari')
  })
  it('a page that needed no download carries no size', () => {
    expect(rowsOf(view()).find(x => x[0].startsWith('Edit Schedule'))![0]).toBe('Edit Schedule first time')
  })
})

describe('Copy all', () => {
  it('reads on its own in a chat: what it is and when, that it is this computer only, then every row in the same words', () => {
    const t = copyText(view(), new Date(2026, 10, 24, 14, 5))
    const lines = t.split('\n')
    expect(lines[0]).toBe('TALON timing, 24 Nov 26 14:05, this computer\'s clock')
    expect(lines[1]).toBe('This computer\'s speed only. Nothing about any person, nothing saved.')
    expect(t).toContain('\nStart-up, from opening the address\n  Site answered: at 0.3 s\n')
    expect(t).toContain('  Sign in pressed → week shown: took 1.7 s\n')
    expect(t).toContain('\nPages opened, newest first\n  View-only Sched, opened before: 0.9 s\n  Leave War, first time · downloaded 137 KB: 1.1 s\n')
    expect(t).toContain('  Screen · browser: 1366×768 · Edge 131\n')
    // for the developer, beside the window's rows: how long it was open, the browser window, the display scale (never
    // called "zoom" — both readers, F7), the screen in its own pixels, and the files asked about again
    expect(t).toContain('  App open for: 4 min\n')
    expect(t).toContain('  Browser window: 1366×657 page units\n')
    expect(t).toContain('  Display scale: 100% (the screen\'s own scaling and the browser\'s zoom together)\n')
    expect(t).toContain('  Screen in its own pixels: 1366×768 (if the browser\'s zoom is 100%)\n')
    expect(t).toContain('  Asked the site again before using a kept file: 0 of 14')
    expect(t).not.toMatch(/\d% zoom/)
  })
  it('his 125% screen: the scale is named for what it is, and the screen given in its own pixels', () => {
    const t = copyText(view({ env: { ...view().env, screen: '1536×864', scale: 1.25 } }), new Date(2026, 10, 24, 14, 5))
    expect(t).toContain('  Display scale: 125% (the screen\'s own scaling and the browser\'s zoom together)\n')
    expect(t).toContain('  Screen in its own pixels: 1920×1080 (if the browser\'s zoom is 100%)\n')
  })
  it('a start-up point under a twentieth of a second reads "under 0.1 s", never "at under 0.1 s"', () => {
    expect(rowsOf(view({ site: 12 }))[0]).toEqual(['Site answered', 'under 0.1 s'])
  })
  it('a browser that gives the files but not their size says so, never "0 KB"', () => {
    expect(rowsOf(view({ files: { supported: false, n: 14, bytes: 0, kept: 0, asked: 0 }, env: { ...view().env, browser: { name: 'Safari', version: '15' } } })).find(x => x[0] === 'App files used')![1]).toBe('14 · size not given by Safari')
  })
  it('names no person: nothing in it but page names, times, sizes and the computer', () => {
    const t = copyText(view(), new Date(2026, 10, 24, 14, 5))
    for (const w of ['Saber', 'admin', 'Warden', '@']) expect(t).not.toContain(w)
  })
})

/* THE WALK OF 24 NOV 26 (chat 164, W14): on a reload every file was asked about again and the site answered "unchanged"
   — as Vercel answers a return visit — and the window read "Kept from an earlier visit: 0 of 15" and "App files used:
   15 · 4 KB". Chromium reports such a file with no body (0) and only its answer's header (about 300 bytes), under an
   ordinary status. Those files were kept; their size the browser does not give. */
describe('the app\'s files, as the browser reports them', () => {
  const e = (transferSize: number, encodedBodySize: number) => ({ transferSize, encodedBodySize })
  it('a first visit: every file came down the line — none kept, the sizes added', () => {
    expect(filesOf([e(230_883, 230_583), e(7782, 7482)])).toEqual({ supported: true, n: 2, bytes: 238_065, kept: 0, asked: 0, sized: true })
  })
  it('asked again and told "unchanged": kept, asked about, its size not given — never counted as 300 bytes', () => {
    const f = filesOf([e(300, 0), e(300, 0), e(300, 0)])
    expect(f).toEqual({ supported: true, n: 3, bytes: 0, kept: 3, asked: 3, sized: false })
    const rows = rowsOf(view({ files: f, env: { ...view().env, browser: { name: 'Chrome', version: '151' } } }))
    expect(rows.find(x => x[0] === 'App files used')![1]).toBe('3 · size not given by Chrome')
    expect(rows.find(x => x[0] === 'Kept from an earlier visit')![1]).toBe('3 of 3')
  })
  it('used from the browser\'s own memory without asking: kept, its size known', () => {
    expect(filesOf([e(0, 5000), e(400, 0)])).toEqual({ supported: true, n: 2, bytes: 5000, kept: 2, asked: 1, sized: false })
  })
  it('a browser that gives no sizes at all (no transfer figure) cannot tell', () => {
    expect(filesOf([{} as any, {} as any]).supported).toBe(false)
  })
})
