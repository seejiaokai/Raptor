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
   - role 'pending', request waiting → WAITING: what he asked, "an admin will answer it";
   - role 'off'                      → SWITCHED OFF: "Ask an admin".
   Every one has Sign out, through the ONE logout (ui/logout.ts). The words read as
   the database-era app will (25 Aug 26: production copy, no demo caveats). */
import { useEffect, useState } from 'react'
import { SESSION } from '../state/auth'
import { roleOf } from '../state/perms'
import { requestAccess, requestByName, requestSummary, guestEntry, sessionFor } from '../state/accounts'
import { SEATS, catsFor, MAX_CS, MAX_INITIALS, SIGNUP_CALLSIGN_LABEL, CS_TOO_LONG } from '../state/roster-add'
import { notify, resetSession } from '../state/store'
import { logOut } from './logout'
import { useVersion } from './useStore'

function Mark() {
  return (
    <div className="lb-mark">
      <svg className="lb-glyph" viewBox="0 -2 60 64" role="img" aria-label="RAPTOR"><path d="M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z" /></svg>
      <span className="lb-word">RAPTOR</span>
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
  const off = roleOf() === 'off'
  const req = requestByName(name)
  const signOut = <button type="button" className="acc-out" id="accOut" onClick={() => { void logOut() }}>Sign out</button>
  const who = <p className="acc-who">Signed in as <b id="accName">{name}</b></p>

  if (off) return (
    <div className="login" id="accessOff">
      <div className="login-wrap"><Mark />
        <div className="login-card acc-card">
          {/* D285 "suspended"; D300 each thing said once — the heading says what, the line what to do */}
          <h2 className="acc-h">Your access is suspended</h2>
          {who}
          <p className="acc-p">Ask an admin to enable it when you’re back.</p>
          {signOut}
        </div>
      </div>
    </div>
  )

  if (req) return (
    <div className="login" id="accessWaiting">
      <div className="login-wrap"><Mark />
        <div className="login-card acc-card">
          <h2 className="acc-h">Your request is with the admins</h2>
          {who}
          <p className="acc-p" id="accAsked">You asked for access as <b>{req.cs}</b>{requestSummary(req) ? ` (${requestSummary(req)})` : ''}. You'll be able to sign in as soon as an admin approves it.</p>
          {/* D221 — with the admin's guest switch on, straight into the guest view */}
          {guestEntry() && <>
            <p className="acc-p">Meanwhile you can look at the schedule, read only.</p>
            <button type="button" className="go" id="accGuest" onClick={() => { const g = guestEntry(); if (g) { resetSession(sessionFor(g)); notify() } }}>View the schedule</button>
          </>}
          {signOut}
        </div>
      </div>
    </div>
  )

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const bad = requestAccess({ cs, ini, seat, cat })
    if (bad) { setErr(bad); return }
    setErr('')
    notify()
  }
  return (
    <div className="login" id="accessRequest">
      <div className="login-wrap"><Mark />
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
        </form>
      </div>
    </div>
  )
}
