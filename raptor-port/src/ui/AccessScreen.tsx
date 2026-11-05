/* THE ACCESS SCREENS ([ACCOUNTS], D204, 26 Sep 26) — what someone signed in without
   access sees, in the sign-in card's own look (siblings of ui/Login.tsx, same classes).

   Owner, D204: "both ways, waiting screen and the guest view option?" — a new user joins
   either way: the admin adds him first, or he signs in with his defence mail, finds he
   is on no list, and asks, giving only his callsign and name (the sign-in already gives
   the defence mail, which cannot be faked); the admin is notified (a badge on the Admin
   tab), approves, sets member or admin and links him to a puck. While waiting he sees
   the waiting screen.

   Three screens, chosen from the session (state/auth.ts — every state after a
   successful sign-in is a session, never the system actor, Astra R1-4):
   - role 'pending', no request yet  → REQUEST ACCESS: what the admin's New person form asks
     ([ACCOUNTS-NEW-PERSON], D214) — "Displayed callsign/name" (D222; 14 letters, said when
     over — D226), initials (asked, never required — D225), pilot / WSO / personnel (D220),
     CAT — then "Request access";
   - role 'pending', request waiting → WAITING: since D1650 / D1656 (5 Nov 26) a pass with what he asked — his
     callsign large, his initials, seat and CAT, "Waiting for an admin" — and under its tear line the three steps, the
     read-only line and its two buttons, "Signed in as …" small at the foot;
   - role 'off'                      → SWITCHED OFF: "Ask an admin".
   Every one has Sign out, through the ONE logout (ui/logout.ts). The words read as
   the database-era app will (25 Aug 26: production copy, no demo caveats). */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SESSION } from '../state/auth'
import { roleOf } from '../state/perms'
import { requestAccess, requestByName, guestEntry, sessionFor } from '../state/accounts'
import { SEATS, catsFor, seatLabel, MAX_CS, MAX_INITIALS, SIGNUP_CALLSIGN_LABEL, CS_TOO_LONG } from '../state/roster-add'
import { notify, resetSession } from '../state/store'
import { logOut } from './logout'
import { useVersion } from './useStore'
import { SaveBand, useSaveFailed } from './SaveStatus'

const CLAWS = 'M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z'

function Mark() {
  return (
    <div className="lb-mark">
      <svg className="lb-glyph" viewBox="0 -2 60 64" role="img" aria-label="TALON"><path d={CLAWS} /></svg>
      <span className="lb-word">TALON</span>
    </div>
  )
}

/* HIS CALLSIGN, LARGE, ON ONE LINE (the member / guest build's walk, 5 Nov 26 - walker A's S4): a callsign may be 14
   letters (D226), and at the pass's 30px a long one broke in the middle of the name - a name breaking is an outright
   fault (D1426). So the name is set smaller, a pixel at a time, until it fits its line, never below 16px; a name that
   still does not fit there (the widest letters, the narrowest phone) breaks rather than run out of the card. Measured
   again when the screen's width changes. Pinned by e2e/geometry.spec.ts "the pass sets a 14-letter callsign…". */
const CS_MAX = 30, CS_MIN = 16
function PassCallsign({ cs }: { cs: string }) {
  const el = useRef<HTMLHeadingElement>(null)
  useLayoutEffect(() => {
    const n = el.current
    if (!n) return
    const fit = () => {
      n.classList.remove('pass-cs-wrap')
      let size = CS_MAX
      n.style.fontSize = `${size}px`
      while (n.scrollWidth > n.clientWidth + 0.5 && size > CS_MIN) { size -= 1; n.style.fontSize = `${size}px` }
      if (n.scrollWidth > n.clientWidth + 0.5) n.classList.add('pass-cs-wrap')
    }
    fit()
    /* again whenever the card's width changes, not only the window's (the code read, 5 Nov 26: a scroll bar coming with
       the band narrows the card with no resize); the fit is the same for the same width, so it settles at once */
    let w = n.parentElement?.clientWidth ?? 0
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      const now = n.parentElement?.clientWidth ?? 0
      if (now !== w) { w = now; fit() }
    })
    if (n.parentElement) ro?.observe(n.parentElement)
    window.addEventListener('resize', fit)
    return () => { window.removeEventListener('resize', fit); ro?.disconnect() }
  }, [cs])
  return <h2 className="pass-cs" id="accAsked" ref={el}>{cs}</h2>
}

/* the pass itself (D1650, D1656, D1664) — its own piece, so the screen's choice of card stays simple */
function WaitingPass({ req, failed, name, signOut }: { req: any, failed: boolean, name: string, signOut: React.ReactNode }) {
  const fields: [string, string][] = ([['Initials', req.ini], ['Seat', req.seat === 'GND' ? 'Personnel' : seatLabel(req.seat)], ['CAT', req.cat]] as [string, any][])
    .filter(([, v]) => !!String(v || '').trim()).map(([k, v]) => [k, String(v)])
  return (
    <div className="login-card acc-card acc-pass">
      <div className="pass-top">
        <div className="pass-row">
          <svg className="pass-claws" viewBox="0 -2 60 64" aria-hidden="true"><path d={CLAWS} /></svg>
          {/* NOT SENT YET WHILE IT IS NOT SAVED (owner D1664, 5 Nov 26 - "As recommended"; drawn
              docs/mock/2026-11-05-member-guest-build/img/Q1-pass-proposed-*.png): with the failed-save band up, his request
              may be the very thing not saved, so the pass never says it went (D1657) - the mark and the first step read
              "Not sent yet" in the band's amber, the second step not yet his; once the save lands the look is back by itself */}
          <span className={'pass-state' + (failed ? ' unsent' : '')}><i aria-hidden="true" />{failed ? 'Not sent yet' : 'Waiting for an admin'}</span>
        </div>
        <PassCallsign cs={req.cs} />
        {fields.length > 0 && <dl className="pass-fields">{fields.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
      </div>
      <div className="pass-tear" aria-hidden="true" />
      <div className="pass-foot">
        <ol className="pass-steps">
          {failed
            ? <li className="unsent"><span className="pass-dot" aria-hidden="true">!</span>Not sent yet</li>
            : <li className="done"><span className="pass-dot"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.4l2.3 2.3 4.7-5" /></svg></span>Request sent</li>}
          {failed
            ? <li><span className="pass-dot" />An admin approves</li>
            : <li className="now" aria-current="step"><span className="pass-dot" />An admin approves</li>}
          <li><span className="pass-dot" />You're on the schedule</li>
        </ol>
        {/* D221 — with the admin's guest switch on, straight into the guest view */}
        {guestEntry() && <>
          <p className="acc-p">Meanwhile you can look at the schedule, read only.</p>
          <button type="button" className="go" id="accGuest" onClick={() => { const g = guestEntry(); if (g) { resetSession(sessionFor(g)); notify() } }}>View the schedule</button>
        </>}
        {signOut}
        <p className="pass-who">Signed in as <b id="accName">{name}</b></p>
      </div>
    </div>
  )
}

export function AccessScreen() {
  useVersion()
  const [cs, setCs] = useState('')
  const [ini, setIni] = useState('')
  const [seat, setSeat] = useState('')
  const [cat, setCat] = useState('')
  const [err, setErr] = useState('')
  /* a refusal is about what was sent: once he changes a field, it goes (the walk, 26 Sep 26 — "Pick pilot, WSO or
     personnel" stayed up after he had picked) */
  useEffect(() => { setErr('') }, [cs, ini, seat, cat])
  const name = String((SESSION && SESSION.name) || '')
  /* a save that failed shows on these screens too, across the top, the screen moved down under it (owner D1657): his
     request may be the very thing that did not save, and the waiting screen must not read as if it had gone */
  const failed = useSaveFailed()
  const screen = (id: string, card: React.ReactNode) => (
    <div className={'login' + (failed ? ' band-up' : '')} id={id}>
      <SaveBand screen />
      <div className="login-wrap"><Mark />{card}</div>
    </div>
  )
  const off = roleOf() === 'off'
  const req = requestByName(name)
  const signOut = <button type="button" className="acc-out" id="accOut" onClick={() => { void logOut() }}>Sign out</button>
  const who = <p className="acc-who">Signed in as <b id="accName">{name}</b></p>

  if (off) return screen('accessOff',
    <div className="login-card acc-card">
      {/* D285 "suspended"; D300 each thing said once — the heading says what, the line what to do */}
      <h2 className="acc-h">Your access is suspended</h2>
      {who}
      <p className="acc-p">Ask an admin to enable it when you’re back.</p>
      {signOut}
    </div>)

  /* THE SCREEN AFTER ASKING (owner D1650, D1654, D1656, 5 Nov 26 — "A combination of both", then "My fade looks good. The
     rest as recommended"; the drawing docs/mock/2026-11-05-access-wait/img/C-diag-phone.png, C-desk.png): look B's pass on
     top — the claws, a "Waiting for an admin" mark, his callsign large, his initials, seat and CAT — then, under a tear
     line, look A's three steps (request sent, an admin approves, you're on the schedule), the read-only line and its two
     buttons, and "Signed in as …" small at the foot. The heading, the sentence and the week strip of the two looks went:
     the mark and the steps say the same. The blue fade from the top left lies over the whole card, one surface, thinning
     out across the tear (D1654, his lesson 82). What he did not give (initials are never required — D225; personnel hold
     no CAT) is left out of the pass rather than shown blank. Nothing glows (D887): the claws are the card's own small mark. */
  if (req) return screen('accessWaiting', <WaitingPass req={req} failed={failed} name={name} signOut={signOut} />)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const bad = requestAccess({ cs, ini, seat, cat })
    if (bad) { setErr(bad); return }
    setErr('')
    notify()
  }
  return screen('accessRequest',
        <form className="login-card acc-card" id="accForm" onSubmit={submit}>
          <h2 className="acc-h">Request access</h2>
          {who}
          <p className="acc-p">You're not on the squadron's list yet. Tell the admins who you are and they'll give you access.</p>
          {/* no maxLength on this box (D226): a longer name is SAID, never quietly cut */}
          <label htmlFor="accCs">{SIGNUP_CALLSIGN_LABEL}</label>
          <input id="accCs" autoComplete="off" placeholder="callsign or name" autoFocus
            value={cs} onChange={e => setCs(e.target.value)} />
          {cs.trim().length > MAX_CS && <div className="cs-long" id="accCsLong">{CS_TOO_LONG}</div>}
          <label htmlFor="accIni">Initials</label>
          <input id="accIni" autoComplete="off" placeholder="initials" maxLength={MAX_INITIALS}
            value={ini} onChange={e => setIni(e.target.value)} />
          <label htmlFor="accSeat">Pilot, WSO or personnel</label>
          <select id="accSeat" value={seat}
            onChange={e => { const v = e.target.value; setSeat(v); if (!catsFor(v).includes(cat)) setCat('') }}>
            <option value="">Pick…</option>
            {SEATS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          {/* personnel hold no CAT (26 Aug 26); a seat change that the CAT cannot follow puts it back to Pick… */}
          {seat !== 'GND' && <>
            <label htmlFor="accCat">CAT</label>
            <select id="accCat" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="">Pick…</option>
              {(seat ? catsFor(seat) : []).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </>}
          <div className="err" id="accErr">{err}</div>
          <button className="go" type="submit" id="accSend">Request access</button>
          {signOut}
        </form>)
}
