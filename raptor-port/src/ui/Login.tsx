/* The login page — markup mirrored 1:1 from the reference (same classes,
   same ids, same copy), behaviour through the store's session state.
   [ACCOUNTS] (26 Sep 26): the card stands for the defence-mail sign-in (D166 (2)) —
   the username plays the defence mail address, the password the organisation's
   (Microsoft checks both at the database step; the app never keeps a password).
   state/accounts.ts signIn turns what was typed into one of: in, as that callsign;
   his account switched off; on no list (ask for access); asked and waiting; or, with
   the admin's guest switch on, the published week as a guest (D204). The card
   itself is unchanged (the 7 Aug 26 "login page stays simple"). */
import { useState } from 'react'
import { signIn, sessionFor } from '../state/accounts'
import { resetSession, notify } from '../state/store'

export function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [err, setErr] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const r = signIn(user, pass)
    if (r.kind === 'bad') { setErr('Incorrect username or password.'); return }
    setErr('')
    /* resetSession (state/store.ts), not the bare setSession — a login must land
       the incoming session on a clean view, not whatever page/selection/preview
       the PREVIOUS session (on a shared browser) left behind. */
    resetSession(sessionFor(r))
    notify()
  }

  return (
    <div className="login" id="login">
      <div className="login-wrap">
        {/* the squadron eyebrow ("142") was removed at the owner's ask
            (8 Sep 26); the .lb-unit CSS is left in place, unused, harmless */}
        {/* the mark: a raptor in the stoop, wings swept, tail split */}
        <div className="lb-mark">
          <svg className="lb-glyph" viewBox="0 -2 60 64" role="img" aria-label="RAPTOR"><path d="M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z" /></svg>
          <span className="lb-word">RAPTOR</span>
        </div>
        <div className="lb-sub"><b>R</b>eadiness · <b>A</b>vailability · <b>P</b>lanning<br />
          <b>T</b>racking &amp; <b>O</b>ps <b>R</b>eporting</div>

        <form className="login-card" id="loginForm" onSubmit={submit}>
          <label>Username</label>
          <input id="luser" autoComplete="username" placeholder="username" autoFocus
            value={user} onChange={e => setUser(e.target.value)} />
          <label>Password</label>
          <input id="lpass" type="password" autoComplete="current-password" placeholder="password"
            value={pass} onChange={e => setPass(e.target.value)} />
          <div className="err" id="lerr">{err}</div>
          <button className="go" type="submit">Sign in</button>
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
