import * as THREE from 'three'

const PALETTES = [
  ['#1c2f3f', '#3f5f73', '#c9a45c', '#efe4cc'], // prussian & gold
  ['#3a1d1a', '#8a3b2b', '#d9a35b', '#f1e3c4'], // terracotta
  ['#1f2a22', '#4d6b4f', '#c2b280', '#ece3cf'], // sage
  ['#2b2233', '#6a4c74', '#d6a86b', '#f0e6d6'], // aubergine
  ['#2a2522', '#6d6259', '#b8975a', '#ede6da'], // umber
]

function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

function rng(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function finish(canvas) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** A quiet abstract "painting" for exhibits without an image yet. */
export function paintPlaceholder(exhibit, [w, h]) {
  const H = 1024
  const W = Math.round(H * (w / h))
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  const r = rng(hash(exhibit.id))
  const [deep, mid, gold, cream] = PALETTES[hash(exhibit.id) % PALETTES.length]

  const bg = g.createLinearGradient(0, 0, W * 0.3, H)
  bg.addColorStop(0, mid)
  bg.addColorStop(1, deep)
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)

  // soft colour fields, Rothko-ish
  for (let i = 0; i < 3; i++) {
    g.globalAlpha = 0.18 + r() * 0.2
    g.fillStyle = [cream, gold, mid][i]
    const bh = H * (0.18 + r() * 0.22)
    const by = H * (0.12 + i * 0.27) + r() * 20
    g.filter = 'blur(18px)'
    g.fillRect(W * 0.1, by, W * 0.8, bh)
  }
  g.filter = 'none'

  // a single golden orb or arc
  g.globalAlpha = 0.85
  g.strokeStyle = gold
  g.lineWidth = 6
  g.beginPath()
  const cx = W * (0.3 + r() * 0.4)
  const cy = H * (0.3 + r() * 0.2)
  g.arc(cx, cy, H * (0.1 + r() * 0.08), 0, Math.PI * 2)
  g.stroke()

  // canvas grain
  g.globalAlpha = 0.06
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() > 0.5 ? '#fff' : '#000'
    g.fillRect(r() * W, r() * H, 2, 2)
  }

  // title, set like a print
  g.globalAlpha = 0.92
  g.fillStyle = cream
  g.textAlign = 'center'
  g.font = `italic 500 ${Math.round(H * 0.058)}px "Cormorant Garamond", Georgia, serif`
  wrap(g, exhibit.title, W / 2, H * 0.74, W * 0.78, H * 0.07)
  g.globalAlpha = 0.55
  g.font = `500 ${Math.round(H * 0.022)}px Inter, sans-serif`
  g.fillText('— YOUR IMAGE HERE —'.split('').join(String.fromCharCode(8202)), W / 2, H * 0.9)

  return finish(c)
}

function wrap(g, text, x, y, maxW, lh) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (g.measureText(t).width > maxW && line) {
      lines.push(line)
      line = w
    } else line = t
  }
  lines.push(line)
  lines.forEach((l, i) => g.fillText(l, x, y + (i - (lines.length - 1) / 2) * lh))
}

/** Warm pool of light that a picture lamp throws on the wall. */
export function lightWash() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(128, 70, 0, 128, 128, 140)
  grad.addColorStop(0, 'rgba(255,214,160,0.9)')
  grad.addColorStop(0.45, 'rgba(255,190,130,0.35)')
  grad.addColorStop(1, 'rgba(255,170,110,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  return finish(c)
}

/** Subtle veining for marble. */
export function marble(size = 512) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.fillStyle = '#f2eee7'
  g.fillRect(0, 0, size, size)
  const r = rng(7)
  for (let i = 0; i < 26; i++) {
    g.strokeStyle = `rgba(120,110,100,${0.05 + r() * 0.12})`
    g.lineWidth = 0.5 + r() * 2
    g.beginPath()
    let x = r() * size
    let y = 0
    g.moveTo(x, y)
    while (y < size) {
      x += (r() - 0.5) * 40
      y += 10 + r() * 30
      g.lineTo(x, y)
    }
    g.stroke()
  }
  const t = finish(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Polished stone floor: large dark tiles with fine joints. One tile per texture repeat. */
export function floorTiles() {
  const s = 512
  const c = document.createElement('canvas')
  c.width = c.height = s
  const g = c.getContext('2d')
  const r = rng(11)
  const half = s / 2
  const tones = ['#2a221d', '#1b1512', '#1b1512', '#2a221d']
  tones.forEach((t, i) => {
    const x = (i % 2) * half
    const y = Math.floor(i / 2) * half
    g.fillStyle = t
    g.fillRect(x, y, half, half)
    for (let k = 0; k < 14; k++) {
      g.strokeStyle = `rgba(200,180,150,${0.02 + r() * 0.05})`
      g.lineWidth = 0.5 + r() * 1.5
      g.beginPath()
      let px = x + r() * half
      let py = y
      g.moveTo(px, py)
      while (py < y + half) {
        px += (r() - 0.5) * 30
        py += 8 + r() * 20
        g.lineTo(Math.min(Math.max(px, x), x + half), Math.min(py, y + half))
      }
      g.stroke()
    }
  })
  g.strokeStyle = 'rgba(195,154,78,0.35)'
  g.lineWidth = 2
  for (let i = 0; i <= 2; i++) {
    g.beginPath(); g.moveTo(i * half, 0); g.lineTo(i * half, s); g.stroke()
    g.beginPath(); g.moveTo(0, i * half); g.lineTo(s, i * half); g.stroke()
  }
  const t = finish(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}
