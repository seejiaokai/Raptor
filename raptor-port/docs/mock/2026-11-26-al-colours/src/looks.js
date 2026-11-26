/* The looks' small script, shared by the pictures of the real app (shoot.mjs injects it) and the try-out page.
   ALX.palette(list)  writes the colour of each amendment (list[1]..list[7]; 8 and later take the 7th, as the app does)
   ALX.look(root, {look, puck})  sets the look's classes on a root element
   ALX.key(day)  adds the recommendation's key line under a day's signed line, from the marks that day shows */
window.ALX = (() => {
  const TODAY = ['', '#3BC6E8', '#E5C24A', '#3DE86B', '#FFFFFF', '#B388FF', '#FF7FC4', '#E5872B']
  const NEW = ['', '#FFE815', '#8FA6FF', '#4FEBC8', '#FF9548', '#EDC4FF', '#9FB07A', '#6FB0B2']
  const NAMES = { '#FFE815': 'Lemon', '#8FA6FF': 'Periwinkle', '#4FEBC8': 'Mint', '#FF9548': 'Orange', '#EDC4FF': 'Lilac', '#9FB07A': 'Sage', '#6FB0B2': 'Teal',
    '#3BC6E8': 'Cyan', '#E5C24A': 'Yellow', '#3DE86B': 'Green', '#FFFFFF': 'White', '#B388FF': 'Purple', '#FF7FC4': 'Pink', '#E5872B': 'Dark orange' }
  function palette(list) {
    /* Each AL's colour is a variable on <html> (--alx1..--alx7) that looks.css's fixed rules read. The first version wrote
       a new <style> element here instead: on the published page the host's security rules block a style added by a
       script, so "Proposed" kept showing today's colours on his screen (26 Nov 26). Setting a variable is never blocked. */
    const root = document.documentElement.style
    for (let n = 1; n <= 7; n++) root.setProperty('--alx' + n, list[n])
  }
  function look(root, { look = 'a', puck = 'chip' } = {}) {
    root.classList.remove('alx-b', 'alx-c', 'alx-pk-chip', 'alx-pk-tab', 'alx-pk-num', 'alx-pk-name', 'alx-pk-none')
    if (look !== 'a') root.classList.add('alx-' + look)
    root.classList.add('alx-pk-' + puck)
  }
  function key(day) {
    day.querySelectorAll('.alx-key').forEach(k => k.remove())
    const out = new Set(), wait = new Set()
    day.querySelectorAll('[data-alc]:not(.verchip)').forEach(e => out.add(+e.getAttribute('data-alc')))
    day.querySelectorAll('[data-aln]').forEach(e => wait.add(+e.getAttribute('data-aln')))
    if (!out.size && !wait.size) return null
    const k = document.createElement('div'); k.className = 'alx-key'; k.setAttribute('role', 'note')
    const all = [...new Set([...out, ...wait])].sort((a, b) => a - b)
    k.setAttribute('aria-label', 'Changes on this day: ' + all.map(n => 'AL' + n + (wait.has(n) && !out.has(n) ? ' waiting' : '')).join(', '))
    k.innerHTML = '<span>Changed in</span>' + all.map(n => `<span class="alx-k${wait.has(n) && !out.has(n) ? ' w' : ''}" data-alc="${n}">AL${n}</span>`).join('')
    const after = day.querySelector('.signedln') || day.querySelector('.day-head')
    if (after) after.insertAdjacentElement('afterend', k)
    return k
  }
  return { TODAY, NEW, NAMES, palette, look, key }
})()
