/* The login page — markup mirrored 1:1 from the reference (same classes,
   same ids, same copy), behaviour through the store's session state.
   [ACCOUNTS] (26 Sep 26): the card stands for the defence-mail sign-in (D166 (2)) —
   the username plays the defence mail address, the password the organisation's
   (Microsoft checks both at the database step; the app never keeps a password).
   state/accounts.ts signIn turns what was typed into one of: in, as that callsign;
   his account switched off; on no list (ask for access); or asked and waiting (D204 —
   the guest view a switch once opened to a person waiting is removed, D2239). The card
   itself is unchanged (the 7 Aug 26 "login page stays simple"). */
import { useEffect, useReducer, useRef, useState } from 'react'
import { signIn, sessionFor } from '../state/accounts'
import { resetSession, notify, setPage } from '../state/store'
import { takeReopen } from './pagedownload'
import { SaveBand, useBandUp } from './SaveStatus'
import { saveSettling, saveRefused, onSaveStatus } from '../storage/savewait'
import { reloadOwed, keepNameForReload, signedInHere } from './logout'
import { peekKeptName, dropKeptName } from './signinhold'

/* the words of the held sign-in (his D2205, D2322 — pictures 10, f6b, f6a) */
const HELD_WAITING = 'Waiting for the last change on this page to save.'
const HELD_NOT_YET = 'The last change has not saved yet — check the connection. Sign in waits until it saves.'
const KEPT_SAVED = 'Saved. Press Sign in again.'

export function Login() {
  /* the page after the owed reload: his name kept (ui/signinhold.ts — read, thrown away at the press of Sign in), with
     "Saved. Press Sign in again." until he presses it */
  const [user, setUser] = useState(() => peekKeptName() || '')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')
  const [kept, setKept] = useState(() => !!peekKeptName())
  /* A SIGN-IN HELD WHILE THE LAST CHANGE ON THIS PAGE SAVES (batch 1's second half §8 — step G; his D2205 M2, D2322;
     picture 10): on a shared computer the last person signed out with a change still waiting; signing in now would save
     it under the next person's name. So the press is held — "Signing in…", greyed, one line under it — until it lands:
     then the sign-out's owed reload runs first (ui/logout.ts — it gives him a fresh Tracker), his typed name kept for the
     card after it, never the password; with no reload owed, he is signed in by himself. A refused save turns the line to
     "not saved yet"; the "Not saved" band above keeps its Retry. */
  const [held, setHeld] = useState(false)
  const typed = useRef({ user: '', pass: '' })
  const [, redraw] = useReducer((n: number) => n + 1, 0)
  /* a save that failed shows here too, across the top, the page moved down under it (D1657); a browser's "Not kept" band the same (D1901) */
  const bandUp = useBandUp()

  const enter = (u: string, p: string) => {
    const r = signIn(u, p)
    if (r.kind === 'bad') { setErr('Incorrect username or password.'); return }
    setErr('')
    /* someone signed in on this page: no reload is owed to it any more */
    signedInHere()
    /* resetSession (state/store.ts), not the bare setSession — a login must land
       the incoming session on a clean view, not whatever page/selection/preview
       the PREVIOUS session (on a shared browser) left behind. */
    resetSession(sessionFor(r))
    /* after Retry on a failed page download reloaded the app, its page reopens by itself (D1635): read once, thrown away;
       only someone let into the app goes there — the access screens keep their own first screen */
    const back = takeReopen()
    if (back && r.kind === 'ok') setPage(back)
    notify()
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (held) return
    setKept(false); dropKeptName()
    /* a wrong name or password is said at once, never held */
    if (signIn(user, pass).kind === 'bad') { setErr('Incorrect username or password.'); return }
    if (saveSettling()) {
      setErr('')
      typed.current = { user, pass }
      keepNameForReload(user)
      setHeld(true)
      return
    }
    keepNameForReload('')
    enter(user, pass)
  }
  /* while held: every change of the saver redraws the line, and its landing ends the hold */
  useEffect(() => {
    if (!held) return
    const off = onSaveStatus(() => {
      if (saveSettling()) { redraw(); return }
      off()
      setHeld(false)
      /* the sign-out's reload is owed: it runs (or has run) — never sign in on a page about to go. The card shows what the
         page after it will (picture f6a) — his name, the password empty, "Saved. Press Sign in again." — so a reload held
         back (a "Leave site?" answered Stay) never leaves him waiting: one more press signs him in here */
      if (reloadOwed()) { setPass(''); setKept(true); return }
      keepNameForReload('')
      enter(typed.current.user, typed.current.pass)
    })
    return off
  }, [held])

  return (
    <div className={'login' + (bandUp ? ' band-up' : '')} id="login">
      <SaveBand screen />
      <div className="login-wrap">
        {/* the squadron eyebrow ("142") was removed at the owner's ask
            (8 Sep 26); the .lb-unit CSS is left in place, unused, harmless */}
        {/* the mark: a raptor in the stoop, wings swept, tail split */}
        <div className="lb-mark">
          <svg className="lb-glyph" viewBox="0 -2 60 64" role="img" aria-label="TALON"><path d="M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z" /></svg>
          <span className="lb-word">TALON</span>
        </div>
        {/* the name it stands for (D1590, D1606): Training, Availability, Leave & Ops Nexus */}
        <div className="lb-sub"><b>T</b>raining · <b>A</b>vailability<br />
          <b>L</b>eave &amp; <b>O</b>ps <b>N</b>exus</div>

        <form className="login-card" id="loginForm" onSubmit={submit}>
          {/* each label names its box (React Doctor label-has-associated-control, 6 Nov 26): a screen reader reads
              "Username" on the box, and a press on the word puts the caret there; nothing drawn changes */}
          <label htmlFor="luser">Username</label>
          {/* eslint-disable-next-line react-doctor/no-autofocus -- the sign-in card is the whole page and the username its first box: the caret waits there so a person types straight away, as the app has always opened (the 7 Aug 26 "login page stays simple") */}
          <input id="luser" autoComplete="username" placeholder="username" autoFocus
            value={user} onChange={e => setUser(e.target.value)} />
          {/* the page after the owed reload (picture f6a): one line under the kept name */}
          {kept && <p className="lnote kept" id="lkept">{KEPT_SAVED}</p>}
          <label htmlFor="lpass">Password</label>
          <input id="lpass" type="password" autoComplete="current-password" placeholder="password"
            value={pass} onChange={e => setPass(e.target.value)} />
          <div className="err" id="lerr">{err}</div>
          <button className="go" type="submit" disabled={held}>{held ? 'Signing in…' : 'Sign in'}</button>
          {/* held (pictures 10, f6b): one line under the button, "not saved yet" once a save was refused */}
          {held && <p className="lnote" id="lheld" role="status">{saveRefused() ? HELD_NOT_YET : HELD_WAITING}</p>}
          {/* the demo-credentials hint (a/a · user/user) is deliberately NOT
              printed here any more (owner, 24 Aug 26 — "can u not show the
              admin and user login on the front page?"). The accounts
              themselves are unchanged — this hides the reminder from the
              public page, it does not secure the prototype auth. */}
        </form>

        <details className="login-build">
          <summary>build <b id="bstamp">29JUL·B55</b></summary>
          <div className="bt"><b>React port</b>. The single-file reference (build 29JUL·B55) is being ported engine-first: the validation engine, the amendment machinery and the state store are across with their regression assertions; the screens are arriving surface by surface, each rendered from the same markup builders the reference uses so the page you see is the page the 728-assertion suite verifies.</div>
        </details>
      </div>
    </div>
  )
}
