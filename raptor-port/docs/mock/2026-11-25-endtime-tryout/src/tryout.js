/* The end-time try-out (not the app). The day is Edit Schedule's Thursday 16 Jul as the app drew it (capture.mjs);
   this script stages the rows the try-out needs, then plays the rule: a day cannot be signed off or published while an
   item with a person on it is missing a time. Every look it switches on — the version tag, the Signed line, "N pending",
   "Not yet signed", Publish AL1, the amendment marks — is the app's own markup, copied from the captured states. */
(function () {
  'use strict'
  var DI = 3, DOW = 'Thursday', DOW3 = 'Thu'
  var day = document.querySelector('#eWeek section.day')
  var DEFAULTS = { a: 'grey', b: 'block', c: 'grey' }   // round 3: the page's recommendations (J 2, H 1, the same on a published day)
  var ROLES = [['cur', 'CUR CK', false], ['sked', 'SKED CK', true], ['plan', 'PLANNED BY', true], ['appr', 'APPROVED BY', true]]
  var NAMES = { cur: ['Ace', 'Anvil', 'Basher', 'Blade'], sked: ['Anvil', 'Basher', 'Bolt', 'Cinch'], plan: ['Anvil', 'Basher', 'Bolt', 'Cinch'], appr: ['Anvil', 'Basher', 'Bolt', 'Cinch'] }
  var TICK = '<svg class="vtick" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><circle cx="6" cy="6" r="6"></circle><path d="M3.3 6.2l1.8 1.8 3.6-3.8"></path></svg>'

  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)) }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
  function plural(n, one, many) { return n === 1 ? one : many }

  /* ---------------- 1. stage the rows ---------------- */
  function txt(key) { return day.querySelector('[data-txt="' + key + '"]') }
  function setT(key, v) { var e = txt(key); if (e) e.textContent = v }
  function stage() {
    var w = day.querySelector('.dwbox'); if (w) w.remove()   // the captured warning list described the demo day, not this one
    setT('ff:' + DI + '.0.0.to', '')                          // VL: crew on, take-off empty, landing 14:10
    setT('ff:' + DI + '.0.0.ld', '14:10')
    setT('dr:' + DI + '.0.1.str', ''); setT('dr:' + DI + '.0.1.end', '')   // SXO, Anvil on it, no times
    setT('sr:' + DI + '.oft.0.str', '')                       // the OFT EP-4 sim, no START
    var lab = txt('sr:' + DI + '.oft.0.label'); if (lab) lab.textContent = 'EP-4'

    /* the Common Programme: SQN PT 15:00 with ALL AVAIL and no end; DINNER WITH CMD 18:30, nobody on it, no end */
    var ah = day.querySelector('.allhands'), tmpl = ah.querySelector('.ah-row'), noteH = ah.querySelector('.blknote-h')
    function progRow(i, name, str, pplHTML) {
      var r = tmpl.cloneNode(true)
      $$('[data-txt]', r).forEach(function (e) { e.setAttribute('data-txt', e.getAttribute('data-txt').replace(/^ap:\d+\.\d+\./, 'ap:' + DI + '.' + i + '.')) })
      r.querySelector('[data-txt$=".prog"]').textContent = name
      r.querySelector('[data-txt$=".str"]').textContent = str
      r.querySelector('[data-txt$=".end"]').textContent = ''
      var ppl = r.querySelector('.ppl'); ppl.className = 'ppl' + (pplHTML ? ' one' : ' '); ppl.setAttribute('data-fill', 'a:' + DI + '.' + i + '.+')
      ppl.innerHTML = (pplHTML || '') + '<span class="addz" aria-hidden="true">+ add</span>'
      ah.insertBefore(r, noteH)
    }
    progRow(2, 'SQN PT', '15:00', '<span class="seat" data-slot="a:' + DI + '.2.0" data-drag="1"><span class="puck allavail sm" tabindex="0" data-person="allavail" title="ALL AVAIL"><span class="nm">ALL AVAIL</span></span><span class="oilcount" tabindex="-1" title="22 with nothing else on at that time — tap to see them">22</span></span>')
    progRow(3, 'DINNER WITH CMD', '18:30', '')

    /* Duties: a Standard block just placed — one blank line, no one on it, no times */
    var duty = day.querySelector('.sec-duty'), dNote = duty.querySelector('.blknote-h')
    var sub = document.createElement('div'); sub.className = 'pl-sub'
    sub.innerHTML = '<span class="ntx txed" contenteditable="true" spellcheck="false" data-txt="dl:' + DI + '.2">Standard</span>'
    duty.insertBefore(sub, dNote)
    var blank = duty.querySelector('.pl-row').cloneNode(true)
    $$('[data-txt]', blank).forEach(function (e) { e.setAttribute('data-txt', e.getAttribute('data-txt').replace(/^dr:\d+\.\d+\.\d+\./, 'dr:' + DI + '.2.0.')); e.textContent = '' })
    var bp = blank.querySelector('.ppl'); bp.className = 'ppl '; bp.innerHTML = '<span class="addz" aria-hidden="true">+ add</span>'
    duty.insertBefore(blank, dNote)

    /* Unavailable: a whole-day ATTACH request — an Attach lands under Unavailable by itself (D1372, D1374) */
    var un = day.querySelector('.sec-unav'), ur = un && un.querySelector('[data-inprow]')
    if (ur) {
      var a = ur.cloneNode(true)
      a.setAttribute('data-inprow', 'try-attach')
      a.querySelector('.inpedit').textContent = 'ATTACH'
      a.querySelector('.seat').innerHTML = '<span class="puck sm" tabindex="0" data-person="prowler" title="Hunter · IP · instructor pilot"><span class="nm">Hunter</span><span class="role q-ins">IP</span></span>'
      var rk = a.querySelector('[data-inp$=".rmks"]'); if (rk) rk.textContent = 'HQ staff work'
      var till = a.querySelector('.rk-till'); if (till) till.remove()
      ur.parentNode.insertBefore(a, ur)
    }

    /* only the time boxes take typing here; every other box and button of the app is drawn but inert */
    $$('[contenteditable="true"]', day).forEach(function (e) { if (!isTimeBox(e)) { e.setAttribute('contenteditable', 'false'); e.setAttribute('data-et-inert', '') } })
    $$('button', day).forEach(function (b) { b.setAttribute('data-et-inert', ''); b.tabIndex = -1 })
  }
  function isTimeBox(e) { var k = e.getAttribute('data-txt') || ''; return /^(ff|dr|sr|gr|ap):/.test(k) && /\.(str|end|to|ld|rl|br)$/.test(k) }

  /* ---------------- 2. the items the rule reads ---------------- */
  /* an item: its time boxes that must both be typed, whether a person is on it, and whether it is never counted */
  function items() {
    var out = []
    function hasPeople(el) { return !!(el && el.querySelector('.puck, .itxt')) }
    // flying lines: take-off and landing, crew on the line's seats
    $$('[data-txt^="ff:"][data-txt$=".to"]', day).forEach(function (to) {
      var p = to.getAttribute('data-txt').slice(3, -3), ld = txt('ff:' + p + '.ld')
      var people = $$('[data-slot^="' + p.replace(/^/, '') + '."] .puck', day).length > 0
      out.push({ name: 'flight ' + p, boxes: [to, ld], people: people, never: false })
    })
    // list rows: duties, sims, ground; and the Common Programme
    $$('.pl-row, .ah-row', day).forEach(function (r) {
      if (r.hasAttribute('data-inprow')) return            // Unavailable: leave and whole-day requests are never counted
      var s = r.querySelector('[data-txt$=".str"]'), e = r.querySelector('[data-txt$=".end"]')
      if (!s || !e) return
      var key = s.getAttribute('data-txt'), never = false
      var lab = r.querySelector('[data-txt$=".label"]')
      if (/^sr:\d+\.amt\./.test(key) && lab && /^(BRIEF|DEBRIEF)$/i.test(lab.textContent.trim())) never = true   // the AMT block's own brief and debrief
      out.push({ name: key.replace(/\.str$/, ''), boxes: [s, e], people: hasPeople(r.querySelector('.ppl')), never: never })
    })
    return out
  }
  function filled(b) { return b && b.textContent.trim() !== '' }
  /* the boxes that block, in page order */
  function missingBoxes() {
    var boxes = [], n = 0
    items().forEach(function (it) {
      if (it.never) return
      var anyTime = it.boxes.some(filled)
      var counts = it.people || (S.set.b === 'block' && anyTime)   // a completely blank line never counts
      if (!counts) return
      var miss = it.boxes.filter(function (b) { return b && !filled(b) })
      if (miss.length) { n++; boxes = boxes.concat(miss) }
    })
    boxes.sort(function (x, y) { return x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1 })
    return { n: n, boxes: boxes }
  }

  /* ---------------- 3. state ---------------- */
  var S, START = {}
  function fresh() {
    return { set: { a: DEFAULTS.a, b: DEFAULTS.b, c: DEFAULTS.c }, published: false, ver: 0, signs: { cur: '', sked: '', plan: '', appr: '' },
      signedBy: null, pressed: false, base: {}, issued: {} }
  }
  function timeBoxes() { return $$('[data-txt]', day).filter(isTimeBox) }
  function values() { var v = {}; timeBoxes().forEach(function (b) { v[b.getAttribute('data-txt')] = b.textContent.trim() }); return v }
  function pendingKeys() { if (!S.published) return []; var v = values(); return Object.keys(v).filter(function (k) { return (S.base[k] || '') !== v[k] }) }
  function allSigned() { return ROLES.every(function (r) { return !!S.signs[r[0]] }) }
  function toSign() { return ROLES.filter(function (r) { return !S.signs[r[0]] }).length }
  function verLabel(v) { return v === 0 ? 'Original' : 'AL' + v }
  function verChip(v, title) { return v === 0 ? '<span class="verchip orig" title="' + title + '">' + TICK + 'ORIG</span>' : '<span class="verchip" data-alc="' + v + '" title="' + title + '">AL' + v + '</span>' }

  /* ---------------- 4. draw ---------------- */
  function render() {
    var m = missingBoxes(), pend = pendingKeys(), nextAL = S.ver + 1, signed = allSigned()
    var red = S.set.a === 'red' || S.pressed || (S.published && S.set.c === 'red')
    timeBoxes().forEach(function (b) { b.classList.remove('et-miss', 'et-red') })
    m.boxes.forEach(function (b) { b.classList.add('et-miss'); if (red) b.classList.add('et-red') })

    /* the amendment marks, as the app draws them: dotted while waiting, solid with its tag once out */
    timeBoxes().forEach(function (b) {
      var k = b.getAttribute('data-txt')
      b.removeAttribute('data-alp'); b.removeAttribute('data-aln'); b.removeAttribute('data-alc'); b.removeAttribute('title')
      if (pend.indexOf(k) >= 0) { b.setAttribute('data-alp', nextAL); b.setAttribute('data-aln', nextAL); b.title = 'Edited — goes out as AL' + nextAL }
      else if (S.issued[k]) { b.setAttribute('data-alc', S.issued[k]); b.title = 'Changed at AL' + S.issued[k] }
    })

    day.classList.toggle('dok', S.published)
    /* the day head: version tag, the working-copy marker, the count, Publish */
    var nys = S.published && pend.length ? (signed
      ? '<span class="nysmark pub" title="All four have signed this working copy — it has not been published yet; the published schedule stays as-is until you publish">Not yet published</span>'
      : '<span class="nysmark" title="This working copy has edits that have not been signed and published yet — the published schedule stays as-is until you publish">Not yet signed</span>') : ''
    day.querySelector('.dhver').innerHTML = (S.published ? verChip(S.ver, DOW + ' is issued as ' + (S.ver === 0 ? 'the Original' : 'AL' + S.ver))
      : '<span class="verchip draft" title="' + DOW + ' is still a working draft — not yet published">DRAFT</span>') + nys
    var h = ''
    if (S.published && pend.length) h += '<button class="dpend dpendbtn" data-et-pend aria-haspopup="dialog" title="See the ' + pend.length + ' ' + plural(pend.length, 'change', 'changes') + ' waiting to go out as AL' + nextAL + ' on ' + DOW + '">' + pend.length + '&nbsp;pending</button>'
    h += '<button class="dinfobtn" data-et-inert tabindex="-1" title="' + DOW + ' — approval, AL versions, advisories">i</button>'
    /* Publish: locked until the four have signed, as built. While a time is missing it stays pressable, so the press can be refused. */
    var canPress = signed || m.n > 0, lockedCls = signed ? '' : ' locked et-lock'
    if (!S.published) h += '<button class="dbeak' + lockedCls + '" data-et-publish' + (canPress ? '' : ' disabled') + ' title="' + (signed ? 'Publish ' + DOW + ' — approve this day only' : 'Sign off ' + ROLES.filter(function (r) { return !S.signs[r[0]] }).map(function (r) { return r[1] }).join(', ') + ' before publishing ' + DOW) + '">Publish day</button>'
    else if (pend.length) h += '<button class="dbeak dalpub' + lockedCls + '" data-et-publish' + (canPress ? '' : ' disabled') + ' title="' + (signed ? 'Publish AL' + nextAL + ' — ' + pend.length + ' ' + plural(pend.length, 'change', 'changes') + ' on ' + DOW + ' only' : 'Sign off ' + ROLES.filter(function (r) { return !S.signs[r[0]] }).map(function (r) { return r[1] }).join(', ') + ' before publishing AL' + nextAL) + '">Publish AL' + nextAL + '</button>'
    if (S.published) h += '<button class="dbeak dunpub" data-et-inert tabindex="-1" title="Unpublish is not part of this try-out">Unpublish</button>'
    day.querySelector('.dstat').innerHTML = h

    /* the Signed line under the head, once published */
    var sl = day.querySelector('.signedln')
    if (S.published) {
      if (!sl) { sl = document.createElement('div'); sl.className = 'signedln'; day.querySelector('.day-head').after(sl) }
      sl.innerHTML = '<span class="sl-h">Signed</span>' + verChip(S.ver, 'Signed as ' + (S.ver === 0 ? 'the Original' : 'AL' + S.ver))
        + ROLES.map(function (r) { return '<span class="sl-n" title="' + r[1] + '"><i>' + r[1].replace(' BY', '') + '</i>' + esc(S.signedBy[r[0]]) + '</span>' }).join('')
    } else if (sl) sl.remove()

    /* the sign-off panel */
    var so = day.querySelector('.signoff.day-sign'), any = ROLES.some(function (r) { return !!S.signs[r[0]] })
    var focusKey = document.activeElement && so.contains(document.activeElement) && document.activeElement.getAttribute('data-sign')
    var state
    if (m.n) state = '<button type="button" class="so-state no et-count" data-et-count title="Go to the first missing time"><span class="et-n">' + m.n + ' ' + plural(m.n, 'item', 'items') + ' missing a time</span> · ' + toSign() + ' to sign</button>'
    else if (!signed) state = '<span class="so-state no">' + toSign() + ' to sign</span>'
    else if (!S.published) state = '<span class="so-state yes">Signed — this day can be published</span>'
    else state = '<span class="so-state yes">' + (pend.length ? 'Published at ' + verLabel(S.ver) + ' · ' + pend.length + ' ' + plural(pend.length, 'change', 'changes') + ' to publish — Publish AL' + nextAL : 'Published at ' + verLabel(S.ver) + ' — no changes to publish') + '</span>'
    so.innerHTML = '<span class="so-h">Sign-off</span>' + ROLES.map(function (r) {
      var k = r[0], v = S.signs[k]
      return '<div class="sgn' + (v ? ' on' : '') + (r[2] ? ' sch' : '') + (m.n ? ' et-block' : '') + '" data-et-sgn="' + k + '" title="' + r[1] + (r[2] ? ' — appointed schedulers only' : '') + (v ? ' — ' + esc(v) : '') + '">'
        + '<span class="k">' + r[1] + '</span><span class="v">' + esc(v || '— name —') + '</span>'
        + '<select data-sign="' + k + '" aria-label="' + r[1] + ' — ' + DOW + '"><option value="">— name —</option>'
        + NAMES[k].map(function (n) { return '<option value="' + n + '"' + (n === v ? ' selected' : '') + '>' + n + '</option>' }).join('') + '</select></div>'
    }).join('') + (any ? '<button class="so-clear" data-et-clear>Clear</button>' : '') + state
    if (focusKey) { var f = so.querySelector('select[data-sign="' + focusKey + '"]'); if (f) f.focus() }
  }

  /* ---------------- 5. the passing note (the app's toast, ui/toast.ts, with its "Blocked:" face) ---------------- */
  var toastT = null
  function phone() { return window.matchMedia('(max-width:620px)').matches }
  function toast(msg, kind) {
    var t = document.getElementById('toastEl')
    if (!t) {
      t = document.createElement('div'); t.id = 'toastEl'
      t.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:540;pointer-events:none;background:var(--panel-2);border:1px solid var(--edge-2);color:var(--ink);padding:10px 16px;border-radius:10px;font-size:12.5px;box-shadow:0 20px 50px -20px rgba(0,0,0,.8);transition:opacity .22s ease'
      t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t)
    }
    var blocked = kind === 'blocked'
    if (blocked) {
      t.dataset.face = 'blocked'
      var i = msg.indexOf(':'), lead = msg.slice(0, i + 1), rest = msg.slice(i + 1).trim()
      var sign = document.createElement('span'); sign.className = 'bk-sign'; sign.setAttribute('aria-hidden', 'true')
      var words = document.createElement('span'); words.className = 'bk-words'
      var b = document.createElement('b'); b.textContent = lead; words.appendChild(b)
      var r = document.createElement('span'); r.className = 'bk-rest'; r.textContent = ' ' + rest; words.appendChild(r)
      t.replaceChildren(sign, words)
    } else { delete t.dataset.face; t.textContent = msg }
    var ph = phone()
    if (ph) t.dataset.wide = '1'; else delete t.dataset.wide
    t.style.left = ph ? '12px' : '50%'; t.style.right = ph ? '12px' : ''; t.style.transform = ph ? 'none' : 'translateX(-50%)'
    t.style.textAlign = ph ? 'center' : ''; t.style.bottom = '26px'
    t.style.borderColor = 'var(--edge-2)'; t.style.color = 'var(--ink)'; t.style.opacity = '1'
    try {
      if (t.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var shift = ph ? '' : 'translateX(-50%) '
        t.animate([{ transform: shift + 'translateY(8px)' }, { transform: shift ? 'translateX(-50%)' : 'none' }], { duration: 200, easing: 'cubic-bezier(.22,.61,.36,1)' })
      }
    } catch (e) { /* motion is decoration */ }
    var hold = Math.min(12000, Math.max(blocked ? 4200 : 2600, msg.length * 60 + 1200))
    if (toastT) clearTimeout(toastT)
    toastT = setTimeout(function () { t.style.opacity = '0' }, hold)
  }

  /* ---------------- 6. the refusals ---------------- */
  function refuse(what) {
    var n = missingBoxes().n
    S.pressed = true
    var lead = n === 1 ? 'Blocked: 1 item is missing a time, outlined in red.' : 'Blocked: ' + n + ' items are missing a time, each outlined in red.'
    var tail = what === 'sign' ? (n === 1 ? ' Type the missing time, then sign.' : ' Type the missing times, then sign.') : (S.published ? ' AL' + (S.ver + 1) + ' was not published.' : ' ' + DOW + ' was not published.')
    render()
    toast(lead + tail, 'blocked')
  }

  /* ---------------- 7. typing a time ---------------- */
  function normTime(s) {
    s = s.replace(/\s+/g, '')
    if (s === '') return ''
    var m = /^(\d{1,2}):?(\d{2})$/.exec(s)
    if (!m) return null
    var h = +m[1], mi = +m[2]
    if (h > 23 || mi > 59) return null
    return (h < 10 ? '0' : '') + h + ':' + m[2]
  }
  var before = null, typed = false
  day.addEventListener('focusin', function (e) {
    var b = e.target; if (!b.matches || !b.matches('[contenteditable="true"]') || !isTimeBox(b)) return
    before = b.textContent; typed = false
    /* one tap then typing replaces the time (D1047): the whole time is picked on the way in — unless a key has already
       landed, which a fast typist's first digit can */
    setTimeout(function () { if (document.activeElement !== b || typed) return; var r = document.createRange(); r.selectNodeContents(b); var s = getSelection(); s.removeAllRanges(); s.addRange(r) }, 0)
  })
  day.addEventListener('keydown', function (e) {
    var b = e.target; if (!b.matches || !b.matches('[contenteditable="true"]')) return
    if (e.key === 'Enter') { e.preventDefault(); b.blur() }
    else if (e.key === 'Escape') { e.preventDefault(); b.textContent = before == null ? b.textContent : before; b.blur() }
  })
  day.addEventListener('input', function (e) { if (isTimeBox(e.target)) { typed = true; render() } })
  day.addEventListener('focusout', function (e) {
    var b = e.target; if (!b.matches || !b.matches('[contenteditable="true"]') || !isTimeBox(b)) return
    var v = normTime(b.textContent)
    if (v === null) { b.textContent = before || ''; toast('Type a time, like 1540 or 15:40.'); render(); return }
    b.textContent = v
    if (v !== (before || '').trim()) S.signs = { cur: '', sked: '', plan: '', appr: '' }   // a change clears the four sign-offs
    before = null
    render()
  })

  /* ---------------- 8. sign-off, Publish, the count line ---------------- */
  day.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentNode
    var sg = t.closest('[data-et-sgn]')
    if (sg && sg.classList.contains('et-block')) { e.preventDefault(); refuse('sign'); return }
    if (t.closest('[data-et-clear]')) { S.signs = { cur: '', sked: '', plan: '', appr: '' }; render(); return }
    var pb = t.closest('[data-et-publish]')
    if (pb) {
      if (missingBoxes().n) { refuse('publish'); return }
      if (!allSigned()) return
      publish(); return
    }
    if (t.closest('[data-et-count]')) {
      var bx = missingBoxes().boxes; if (!bx.length) return
      /* each tap goes to the next empty box in turn (round 3, question G) */
      S.countTap = ((S.countTap == null ? -1 : S.countTap) + 1) % bx.length
      var first = bx[S.countTap]
      first.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      first.focus({ preventScroll: true })
      return
    }
    if (t.closest('[data-et-pend]')) {
      var k = pendingKeys()[0], el = k && txt(k); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  })
  day.addEventListener('keydown', function (e) {
    var s = e.target; if (!s.matches || !s.matches('select[data-sign]')) return
    if (missingBoxes().n && ['Enter', ' ', 'ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(e.key) >= 0) { e.preventDefault(); refuse('sign') }
  })
  day.addEventListener('mousedown', function (e) {
    var s = e.target; if (s.matches && s.matches('select[data-sign]') && missingBoxes().n) { e.preventDefault(); refuse('sign') }
  })
  day.addEventListener('change', function (e) {
    var s = e.target; if (!s.matches || !s.matches('select[data-sign]')) return
    if (missingBoxes().n) { s.value = ''; refuse('sign'); return }
    S.pressed = true
    S.signs[s.getAttribute('data-sign')] = s.value
    render()
  })
  function publish() {
    var pend = pendingKeys(), appr = S.signs.appr
    if (!S.published) { S.published = true; S.ver = 0; toast(DOW + ' published and approved') }
    else {
      if (!pend.length) return
      S.ver += 1
      pend.forEach(function (k) { S.issued[k] = S.ver })
      toast('Published AL' + S.ver + ' · ' + pend.length + ' ' + plural(pend.length, 'item', 'items') + ' on ' + DOW3 + ' only · approved by ' + appr)
    }
    S.base = values(); S.signedBy = S.signs; S.signs = { cur: '', sked: '', plan: '', appr: '' }; S.pressed = false
    render()
  }

  /* ---------------- 9. the settings strip ---------------- */
  function drawSettings() {
    $$('[data-set]').forEach(function (b) {
      var on = S.set[b.getAttribute('data-set')] === b.getAttribute('data-val')
      b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false')
    })
  }
  document.querySelector('.tt-strip').addEventListener('click', function (e) {
    var b = e.target.closest('[data-set]')
    if (b) { S.set[b.getAttribute('data-set')] = b.getAttribute('data-val'); drawSettings(); render(); return }
    if (e.target.closest('#ttReset')) reset()
  })
  function reset() {
    S = fresh()
    timeBoxes().forEach(function (b) { b.textContent = START[b.getAttribute('data-txt')] || '' })
    var t = document.getElementById('toastEl'); if (t) t.style.opacity = '0'
    drawSettings(); render()
  }

  stage()
  START = values()
  S = fresh()
  drawSettings(); render()
  /* for the try-out's own walk (walk.mjs) */
  window.__tryout = { state: function () { return S }, missing: function () { return missingBoxes() } }
})()
