import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setMemberTodayForTests } from '../engine'
import { closeDates, getState, initStore, openDates, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { StageBar } from './Chrome'
import { Matrix } from './Matrix'

/* ONE CHIP, ONE MOVE (owner, D262, 27 Sep 26): the window's Move no longer reads a date box — it picks the chip up
   into the grid's move mode, and a click on a day lands it. A person's click comes a beat after the Move (the move
   ignores clicks for its first moments — a double-click on Move must land nothing). */
async function moveTo(testid: string) {
  fireEvent.click(screen.getByTestId('decide-shift'))
  await act(async () => { await new Promise(r => setTimeout(r, 420)) })
  fireEvent.click(screen.getByTestId(testid))
}

/* THE STAGES WENT (owner, D1177, 21 Oct 26): what was "bidding closed" is now every day of the period closed for
   bidding — the admin's closing in the "Open for bidding" window. The seed's war opens 1 Jan – 31 Mar. */
function closeAll() {
  act(() => { const p = getState().period; closeDates(p.start, p.end) })
}

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with NO counters (D669); these tests are about counters, so they make the old eleven — testkit
  /* deciding is an admin activity, and opening or closing the dates is admin-only — so the file runs as an admin; the
     member-view cases set 'member' themselves after the admin has closed the dates */
  setRole('admin')
})

// Seed: ASICS has a pending half day of LL on 2026-01-23.
const PENDING = 'cell-asics-2026-01-23'

/** The words of the one-day window's Decide row, in order (D1158: Approve · Refuse — Ack is gone). */
/* the admin's answers — Approve · Refuse — at the head of round 3's one row of actions (D1330), Move and Delete after them */
const decideRow = () => [...screen.getByTestId('decide-approve').parentElement!.querySelectorAll('button.approve, button.refuse')].map(b => b.textContent)

describe('deciding a bid', () => {
  it('offers the SAME answers while bidding is still open', () => {
    /* MOVED 21 Sep 26. The decision used to appear only once bidding closed,
       so the same input answered to different controls depending on which day
       of the cycle you clicked it. Owner: "enable it in all Stage on leave
       war". An admin can Approve, Refuse or Move from the first day of
       bidding — what is open decides what the SQUADRON may do, never what the
       admin running it may do (D1177: he decides at any time). Ack went (D1158). */
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('decide-ack')).toBeNull()
    expect(decideRow()).toEqual(['Approve', 'Refuse'])
    expect(screen.getByTestId('decide-approve')).toBeTruthy()
    expect(screen.getByTestId('decide-refuse')).toBeTruthy()
    expect(screen.getByTestId('decide-shift')).toBeTruthy()
  })

  it('keeps the leave buttons once bidding has closed — ONE window, open or closed', () => {
    /* MOVED 21 Sep 26, the other half of the same ruling. Deciding used to
       REPLACE the window with a smaller one, so an admin who wanted to change
       what was asked for had to reopen the war. He keeps both: the decision at
       the top, what was asked for below it. */
    closeAll()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.getByTestId('decide-approve')).toBeTruthy()
    expect(screen.getByTestId('bid-LL')).toBeTruthy()
    expect(screen.getByTestId('bid-clear')).toBeTruthy()
  })

  it('approves a pending bid once closed', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-approve'))
    expect(getState().states.asics['2026-01-23']?.state).toBe('approved')
  })

  /* WAS "acknowledges a pending bid without moving the counts". Ack is gone (D1158, 21 Oct 26): a bid simply waits
     until it is decided. What stands is the waiting itself — the window on a pending bid offers Approve · Refuse and
     nothing that records "seen"; the bid stays pending and the man stays out of the counts (the worst case) until an
     answer comes. */
  it('a pending bid simply waits — no Ack, and the counts stay as they are (D1158)', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    const before = screen.getByTestId('count-opsp-2026-01-23').textContent
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('decide-ack')).toBeNull()
    expect(decideRow()).toEqual(['Approve', 'Refuse'])
    expect(screen.getByTestId('decide-approve').getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByTestId('decide-refuse').getAttribute('aria-pressed')).toBe('false')
    expect(getState().states.asics['2026-01-23']?.state).toBe('pending')
    expect(screen.getByTestId('count-opsp-2026-01-23').textContent).toBe(before)
  })

  /* WAS "still offers every control on a bid already acknowledged". Ack is gone (D1158); the same point — a decided
     bid is never a dead end, every answer stays live on it — is pinned on a bid already REFUSED. */
  it('still offers every control on a bid already refused', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-refuse'))
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.getByTestId('decide-refuse').getAttribute('aria-pressed')).toBe('true')
    expect(decideRow()).toEqual(['Approve', 'Refuse'])
    expect(screen.getByTestId('decide-shift')).toBeTruthy()
    fireEvent.click(screen.getByTestId('decide-approve'))
    expect(getState().states.asics['2026-01-23']?.state).toBe('approved')
  })

  it('refuses a pending bid, and the man returns to the counts', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    const before = screen.getByTestId('count-opsp-2026-01-23').textContent
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-refuse'))
    expect(getState().states.asics['2026-01-23']?.state).toBe('refused')
    expect(screen.getByTestId('count-opsp-2026-01-23').textContent).not.toBe(before)
  })

  it('closes the sheet once a decision is made', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-approve'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })

  // A decision can be changed after the dates have closed — the point of
  // showing the counts move is that management can try one and look.
  it('lets a decision be changed while the dates are closed', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-refuse'))
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-approve'))
    expect(getState().states.asics['2026-01-23']?.state).toBe('approved')
  })

  it('offers nothing on a cell nobody bid for', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    // PIPPER is on a course: not a bid, so there is nothing to decide.
    fireEvent.click(screen.getByTestId('cell-pipper-2026-01-12'))
    expect(screen.queryByTestId('decide-approve')).toBeNull()
    // And an empty cell has nothing to decide either.
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.queryByTestId('decide-approve')).toBeNull()
  })

  /* WAS "keeps the admin decision once the period is published" (owner, 27 Aug 26 — "if leave war is published, the
     admin can still have these functions"). The published stage went (D1177); what it pinned stands as "the admin
     decides at any time": a bid on a day closed for bidding, while OTHER days of the same period are still open, gets
     the decision and the leave buttons, and an empty closed day still gets the picker. */
  it('keeps the admin decision on a day closed while other days stay open', () => {
    act(() => { closeDates('2026-01-01', '2026-01-31') })   // January closed, February and March still open
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.getByTestId('decide-approve')).toBeTruthy()
    expect(screen.getByTestId('decide-refuse')).toBeTruthy()
    // …and the leave buttons stay with them (owner, 21 Sep 26): an input NOT yet approved is still the admin's to change.
    expect(screen.getByTestId('bid-LL')).toBeTruthy()
    fireEvent.click(screen.getByTestId('cell-dusk-2026-01-14'))
    expect(screen.getByTestId('bid-LL')).toBeTruthy()
  })

  // The precedence that had to be got right: an admin on a closed day satisfies
  // both canEdit and canDecide. Deciding wins where there is a bid to decide,
  // and the picker still opens where there is not — so a closed day can
  // still have leave added to it without a second control.
  it('gives an admin the decision on a bid and the picker on an empty cell', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.getByTestId('decide-approve')).toBeTruthy()
    expect(screen.getByTestId('bid-LL')).toBeTruthy()      // one window, both halves
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('bid-LL')).toBeTruthy()
    // An EMPTY day still offers no decision: there is nothing there to answer.
    expect(screen.queryByTestId('decide-approve')).toBeNull()
  })
})

/* ONE WINDOW FOR AN INPUT, OPEN OR CLOSED (owner, 21 Sep 26). Three answers —
   Approve, Refuse, Move (Ack went, D1158) — plus what was asked for, on the same window
   whatever is open. His old exception — an input approved AND published was
   finished paperwork, remarks only — went with the published stage (D1177:
   nothing is frozen; the admin puts back, moves or deletes approved leave at
   any time). */
describe('the one input window', () => {
  const PENDING = 'cell-asics-2026-01-23'

  it('moves an input from ONE click — no drag-select needed', async () => {
    /* His words: "even a single click on an input, i should be able to click
       on a move button to move the input just like how i drag and select and
       click on move". */
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    await moveTo('cell-asics-2026-01-26')
    expect(getState().grid.asics['2026-01-23']).toBeFalsy()
    expect(getState().grid.asics['2026-01-26']).toBeTruthy()
  })

  it('says WHY when a move cannot land, rather than doing nothing', async () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    // 24 Feb already holds ASICS's pending OIL bid (acknowledged until Ack went, D1158) — the day is taken
    await moveTo('cell-asics-2026-02-24')
    expect(screen.getByTestId('move-banner').textContent).toContain('already booked')
  })

  /* WAS "an APPROVED input on a PUBLISHED war offers remarks and nothing else". Replaced by D1177 (nothing frozen; the
     admin decides at any time) and the scenario designer's S6: an ADMIN's tap on approved leave opens the window that
     changes it — the decision shown, Refuse, Move, Delete — never a remarks-only sheet that would hide those. Whatever
     is open: here with every date closed. (Its "Ack to put it back to a bid" went with Ack, D1158: the other answer,
     Refuse, is what the window offers to change it.) */
  it('an APPROVED input opens the decide window for an admin, never a remarks-only sheet', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-approve'))
    closeAll()
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('remarks-sheet')).toBeNull()
    expect(screen.getByTestId('decide-approve').getAttribute('aria-pressed')).toBe('true')
    expect(screen.queryByTestId('decide-ack')).toBeNull()
    expect(decideRow()).toEqual(['Approve', 'Refuse'])
    expect(screen.getByTestId('decide-shift')).toBeTruthy()
    expect(screen.getByTestId('bid-clear')).toBeTruthy()
    // …and changing the decision works from there (D1158: Refuse, where it was Ack)
    fireEvent.click(screen.getByTestId('decide-refuse'))
    expect(getState().states.asics['2026-01-23']?.state).toBe('refused')
  })

  /* WAS "the admin's Note on one approved leave opens its remarks" (M1's code read, L6). HIS D1307: the window on an approved
     leave shows its Remarks and Document at once — "Note" went; the decide row stays beside them */
  it('the admin’s window on one approved leave shows its Remarks and Document at once — no Note', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('decide-note')).toBeNull()
    fireEvent.click(screen.getByTestId('decide-approve'))
    closeAll()
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('decide-note')).toBeNull()
    expect(screen.getByTestId('bid-remarks')).toBeTruthy()
    expect(screen.getByTestId('bid-doc-row')).toBeTruthy()
    expect(screen.getByTestId('decide-approve').className).toContain('lit')
  })

  it('an input NOT yet approved on a closed day is still the admin’s to change', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(decideRow()).toEqual(['Approve', 'Refuse'])   // where it checked Ack (D1158)
    expect(screen.getByTestId('decide-shift')).toBeTruthy()
    expect(screen.getByTestId('bid-LL')).toBeTruthy()
    expect(screen.getByTestId('bid-clear')).toBeTruthy()
  })

  /* WAS "offers NO decision in DRAFT" (Astra, 21 Sep 26: a control the store then refused). The draft stage went
     (D1177) and with it the refusal: the admin decides at any time, so with NOTHING open — a new period, before he has
     opened a day — the decisions are offered, and the store takes them (the control-that-does-nothing case is pinned by
     the write landing). Move stays (D331). */
  it('offers the decisions with NOTHING open — the admin decides at any time', () => {
    setRole('admin')
    closeAll()
    expect(getState().period.open).toEqual([])
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(decideRow()).toEqual(['Approve', 'Refuse'])   // where it checked Ack (D1158)
    expect(screen.getByTestId('decide-shift')).toBeTruthy()
    fireEvent.click(screen.getByTestId('decide-refuse'))
    expect(getState().states.asics['2026-01-23']?.state).toBe('refused')
  })

  it('a MEMBER gets no decisions on anybody’s input, their own included', () => {
    closeAll()
    setRole('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('decide-approve')).toBeNull()
    expect(screen.queryByTestId('decide-shift')).toBeNull()
  })
})

/* WAS "moving the period on" — the stage strip's forward control (stage-advance / stage-now). The stages went (D1177);
   the strip carries ONE chip, the open dates, whose tap opens the "Open for bidding" window. Its month buttons are how
   the admin opens and closes a whole month (D1168). The window's own tests: window.test.tsx. */
describe('opening and closing the dates from the strip', () => {
  it('closes a month from the open chip, and the chip says what is left open', () => {
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Mar')
    fireEvent.click(screen.getByTestId('open-chip'))
    fireEvent.click(screen.getByTestId('od-month-2026-01'))
    expect(getState().period.open).toEqual([{ from: '2026-02-01', to: '2026-03-31' }])
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Feb – 31 Mar')
  })

  it('reads "Bidding closed" once every open month is closed', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('open-chip'))
    for (const m of ['01', '02', '03']) fireEvent.click(screen.getByTestId(`od-month-2026-${m}`))
    expect(getState().period.open).toEqual([])
    expect(screen.getByTestId('open-chip').textContent).toBe('Bidding closed')
  })
})

// The workflow the owner described: on a closed day the sheet is view-only for
// the squadron while the admin account keeps working.
describe('the edit lock', () => {
  /* the file default is admin (opening and closing dates is admin-only); these
     MEMBER-lockout cases close as the admin, then drop to member for the
     assertion — the days close by an admin's hand, and the member is what the
     lock is being tested on */
  it('lets a member edit while the day is open', () => {
    act(() => setRole('member'))
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  it('locks a member out of everything once bidding closes — his tap says why instead', () => {
    closeAll()                        // admin closes every date
    act(() => setRole('member'))
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    // never a dead tap: the closed note (D1176)
    expect(screen.getByTestId('closed-note')).toBeTruthy()
    fireEvent.click(screen.getByTestId('closed-note-close'))
    // Not merely unable to bid — unable to decide either. A member watching
    // this screen sees the outcome, never the buttons.
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.queryByTestId('decide-approve')).toBeNull()
  })

  /* WAS "keeps a member locked out at published" — the published stage went (D1177). Replaced by the lock that is new
     with it: a member never bids on a day before today, even inside an open stretch (D1211); an admin may. */
  it('keeps a member off a day before today, even inside the open dates', () => {
    setMemberTodayForTests('2026-02-12')
    act(() => setRole('member'))
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(screen.getByTestId('closed-note')).toBeTruthy()
    fireEvent.click(screen.getByTestId('closed-note-close'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-13'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    fireEvent.click(screen.getByTestId('bid-cancel'))
    act(() => setRole('admin'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })

  // The admin is the one who can still correct the sheet after closing it —
  // that is the whole reason the lock is role-shaped rather than a date flag
  // that stops everybody.
  it('lets an admin still edit a cell after bidding has closed', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(getState().grid.dusk['2026-02-11']).toBe('LL')
  })

  it('follows the role switch without a reload', () => {
    closeAll()                        // admin closes every date
    act(() => setRole('member'))
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    act(() => setRole('admin'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })
})

describe('a cell Raptor owns', () => {
  // Seed: TATA's OIL on 9 Jan came in through Raptor's input tab.
  const RAPTOR = 'cell-tata-2026-01-09'

  it('opens a sheet that explains itself rather than offering a picker', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(RAPTOR))
    expect(screen.getByTestId('raptor-sheet')).toBeTruthy()
    expect(screen.queryByTestId('bid-LL')).toBeNull()
    expect(screen.queryByTestId('bid-clear')).toBeNull()
  })

  it('offers no decision to an admin once bidding has closed', () => {
    closeAll()
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(RAPTOR))
    expect(screen.getByTestId('raptor-sheet')).toBeTruthy()
    expect(screen.queryByTestId('decide-approve')).toBeNull()
    expect(screen.queryByTestId('decide-refuse')).toBeNull()
  })

  // A member who cannot edit anything still deserves to be told why that
  // cell is green and why nothing here will change it — never the closed note.
  it('explains itself to a locked-out member too', () => {
    closeAll()
    act(() => setRole('member'))
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(RAPTOR))
    expect(screen.getByTestId('raptor-sheet')).toBeTruthy()
    expect(screen.queryByTestId('closed-note')).toBeNull()
  })

  /* look F (D1175): green is OIL's KIND (`k-oil`) and filled is approved (`s-a`) — where it was the one class `appr` */
  it('paints green, and marks where it came from', () => {
    render(<Matrix />)
    const chip = screen.getByTestId(RAPTOR).querySelector('.c')!
    expect(chip.classList.contains('k-oil')).toBe(true)
    expect(chip.classList.contains('s-a')).toBe(true)
    expect(chip.classList.contains('raptor')).toBe(true)
  })
})

describe('shifting a bid', () => {
  beforeEach(() => {
    closeAll()
    setRole('admin')
  })

  /* CHANGED by D1177's reading ("the dotted 'moved' mark shows on any move of a leave already approved"): a bid that
     only waits stores NO trail when it moves — the old `shiftedFrom: '2026-01-23'` was the closed stage's. */
  it('moves the bid and leaves it pending on the new date, with no trail', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    await moveTo('cell-asics-2026-01-30')
    expect(getState().grid.asics?.['2026-01-23']).toBeUndefined()
    expect(getState().grid.asics['2026-01-30']).toBe('*LL')
    expect(getState().states.asics['2026-01-30']).toEqual({ state: 'pending', source: 'bid' })
    expect(screen.getByTestId('cell-asics-2026-01-30').querySelector('.c')!.className).not.toContain('moved')
  })

  it('marks an APPROVED leave’s move so the trail is visible on the grid', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-approve'))
    fireEvent.click(screen.getByTestId(PENDING))
    await moveTo('cell-asics-2026-01-30')
    expect(getState().states.asics['2026-01-30']).toEqual({
      state: 'approved', source: 'bid', shiftedFrom: '2026-01-23',
    })
    expect(screen.getByTestId('cell-asics-2026-01-30').querySelector('.c')!.className).toContain('moved')
  })

  it('says why, rather than doing nothing, when the destination is taken', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    // ASICS already has LL on 2026-01-08.
    await moveTo('cell-asics-2026-01-08')
    expect(screen.getByTestId('move-banner').textContent).toContain('already booked')
    expect(getState().grid.asics['2026-01-23']).toBe('*LL')
  })

  /* REVERSED 27 Sep 26 by D262 ("the move button should be enabled ... The calendar can be removed"): Move used to be
     greyed until a date was typed, and the date box bounded the move to the war. It is never greyed now, and the war's
     bound is the grid itself — a move lands only on a day the grid draws, inside the war (moveCells' own rule). */
  it('can be moved at once — Move is never greyed out, and there is no date to type', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    expect(screen.getByTestId('decide-shift').hasAttribute('disabled')).toBe(false)
    expect(screen.queryByTestId('shift-date')).toBeNull()
  })

  /* WAS "keeps the trail when the moved bid is then approved". A bid moved while it waited has no trail to keep
     (D1177's reading — only an approved leave's move is marked), so approving it afterwards marks nothing either. */
  it('a bid moved while pending carries no trail once it is approved', async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    await moveTo('cell-asics-2026-01-30')
    fireEvent.click(screen.getByTestId('cell-asics-2026-01-30'))
    fireEvent.click(screen.getByTestId('decide-approve'))
    expect(getState().states.asics['2026-01-30']).toEqual({ state: 'approved', source: 'bid' })
  })
})

/* WAS "the moved mark waits for bidding to close" (owner, 27 Aug 26 — the dotted edge was noise while bidding was open
   and meaningful only once closed). Replaced by D1177's reading: the mark shows on ANY move of a leave already approved,
   whatever is open, and opening or closing dates neither draws nor hides it. */
describe('the moved mark follows an approved leave’s move, whatever is open', () => {
  const MOVED = 'cell-asics-2026-01-30'
  const moveApproved = async () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(PENDING))
    fireEvent.click(screen.getByTestId('decide-approve'))
    fireEvent.click(screen.getByTestId(PENDING))
    await moveTo(MOVED)
  }
  it('draws the moved edge while the days are open', async () => {
    await moveApproved()
    expect(screen.getByTestId(MOVED).querySelector('.c')!.className).toContain('moved')
  })
  it('keeps it when the dates are closed and opened again', async () => {
    await moveApproved()
    closeAll()
    expect(screen.getByTestId(MOVED).querySelector('.c')!.className).toContain('moved')
    act(() => { openDates('2026-01-01', '2026-03-31') })
    expect(screen.getByTestId(MOVED).querySelector('.c')!.className).toContain('moved')
  })
})

// Owner, 10 Aug 26: "as an admin I can open bidding again after closing it" — now from the open chip's window (D1177).
describe('reopening the dates from the strip', () => {
  it('offers a member no controls — the window reads only', () => {
    closeAll()                        // an admin closes the dates…
    act(() => setRole('member'))      // …the member can read them, never change them
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('open-chip'))
    expect((screen.getByTestId('od-month-2026-02') as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByTestId('od-more')).toBeNull()
    fireEvent.click(screen.getByTestId('od-month-2026-02'))
    expect(getState().period.open).toEqual([])
  })

  it('gives an admin a way back to bidding', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('open-chip'))
    fireEvent.click(screen.getByTestId('od-month-2026-02'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-01-31' }, { from: '2026-03-01', to: '2026-03-31' }])
    fireEvent.click(screen.getByTestId('od-month-2026-02'))
    expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
  })

  /* "names the stage it returns to" and "offers nothing at draft" are DELETED: there are no stages to name and no draft
     to stop at (D1177). The chip naming the open dates replaces the first (above). */

  // The point of the whole change: after reopening, the squadron can bid
  // again. Asserted through the matrix rather than the open list, because
  // the dates are only interesting for what they let people do.
  it('lets a member bid again once an admin has reopened', () => {
    act(() => setRole('admin'))
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('open-chip'))
    fireEvent.click(screen.getByTestId('od-month-2026-02'))
    render(<Matrix />)
    act(() => setRole('member'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    fireEvent.click(screen.getByTestId('closed-note-close'))

    act(() => setRole('admin'))
    fireEvent.click(screen.getByTestId('od-month-2026-02'))
    act(() => setRole('member'))
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
  })
})
