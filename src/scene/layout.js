// Turns the collection into positions in the hall + camera stops for the tour.
//
// The hall runs from the entrance (+z) towards the back wall (−z).
// Each section is a "zone" along it; every zone starts with its title on the walls.

export const HALL = {
  width: 12,
  height: 6.5,
  entranceZ: 11,
}

const HALF = HALL.width / 2
const ZONE_GAP = 4 // title → first object
const DEFAULT_ASPECT = 0.8

/** Frame content size in metres, keeping things in a dignified range. */
export function frameSize(aspect = DEFAULT_ASPECT, maxH = 1.7, maxW = 2.6) {
  let h = maxH
  let w = h * aspect
  if (w > maxW) {
    w = maxW
    h = w / aspect
  }
  return [w, h]
}

/** A thing hung flat on a side wall, looking into the hall. */
function onWall(side, z, y) {
  const x = side < 0 ? -HALF : HALF
  return {
    position: [x - side * 0.02, y, z],
    rotation: [0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0],
    view: { normal: [-side, 0, 0], target: [x, y, z], tangent: [0, 0, side < 0 ? -1 : 1] },
  }
}

/** A free-standing object near a side wall, seen from the aisle. */
function nearWall(side, z, y, lift = 0.5) {
  const x = side * (HALF - 1.3)
  return {
    position: [x, 0, z],
    rotation: [0, side < 0 ? Math.PI / 2 : -Math.PI / 2, 0],
    view: { normal: [-side, 0, 0], target: [x, y, z], tangent: [0, 0, side < 0 ? -1 : 1], lift },
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2025-06' → 'Jun 2025', '2023' → '2023', 'present' → 'Present' */
export function formatDate(d) {
  if (!d) return ''
  if (String(d).toLowerCase() === 'present') return 'Present'
  const [y, m] = String(d).split('-')
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y
}

/*
 * How big each kind of work may hang. Images keep their own shape: a frame grows to the
 * image's aspect ratio until it hits maxW or maxH (metres). The wall is 6.5 m tall with
 * the chair rail at 1.1 m, so works hang between roughly 1.3 m and 4 m.
 * `extra` is the mat + moulding around the image on each side (see STYLES in Exhibit.jsx).
 */
export const HANG = {
  chronicle: { maxH: 1.7, maxW: 2.4, y: 2.45, aspect: 4 / 3, extra: 0.16 },
  certificate: { maxH: 1.5, maxW: 2.1, y: 2.45, aspect: Math.SQRT2, extra: 0.16 },
  canvas: { maxH: 2.8, maxW: 4.4, y: 2.9, aspect: 16 / 10, extra: 0 }, // frameless, in the modern wing
  grand: { maxH: 4.0, maxW: 8.4, y: 3.35, aspect: 1.6, extra: 0.51 },
}
const PLAQUE = 0.8 // the label beside each frame
const GAP = 1.2 // clear wall between neighbours
const RAIL_GAP = 0.45 // timeline rail above the tallest frame
const DATE_H = 0.75 // medallion + date text above the rail

/** The image size for a work: its real shape (if loaded) fitted into the hang limits. */
function sizeFor(variant, src, fallbackAspect, aspects) {
  const h = HANG[variant]
  return frameSize(aspects?.[src] ?? fallbackAspect ?? h.aspect, h.maxH, h.maxW)
}

/** A camera view that frames the work, its plaque and what hangs above it (the picture lamp, or the timeline's date). */
function frameView(base, [w, h], extra, { above = 0.4 } = {}) {
  const ow = w + extra * 2
  const oh = h + extra * 2
  const bottom = base.target[1] - oh / 2 - 0.3 // room for the tour bar at the bottom of the screen
  const top = base.target[1] + oh / 2 + above
  return {
    ...base,
    target: [base.target[0], (bottom + top) / 2, base.target[2]],
    // close enough that the picture fills the view; the plaque may sit at the edge (the label card has it all)
    fit: [ow + 0.5, top - bottom],
    pad: 1.06,
  }
}

/**
 * `aspects` maps image paths to width / height, measured once the images load,
 * so frames always match the pictures you put in.
 */
export function buildLayout(data, aspects = {}) {
  const { about, education, certificates, experience, trophies, projects, masterpiece, owner } = data
  const stops = []
  const sectionMarks = []
  const rails = []
  let z = -8

  // The hall is a run of wings: the classic picture gallery, then a white modern wing
  // for the projects, then back to grandeur for the finale. An archway marks each change.
  const wings = []
  const arches = []
  let wing = { style: 'classic', from: HALL.entranceZ }
  const enterWing = (style) => {
    wings.push({ ...wing, to: z })
    arches.push(z)
    wing = { style, from: z }
  }

  const startZone = (section) => {
    sectionMarks.push({ section, z, style: wing.style })
    z -= ZONE_GAP
  }
  /** Reserve wall space for a work `width` wide (plus its plaque) and return its centre. */
  const place = (width) => {
    const centre = z - width / 2
    z -= width + PLAQUE + GAP
    return centre
  }

  /* ── the statue: about, contact, skills ───────────────── */
  stops.push({
    kind: 'sculpture',
    exhibit: { ...about, title: about.artwork, by: owner.name },
    section: { numeral: '', title: 'The Rotunda' },
    position: [0, 0, 0],
    size: [2, 3.4],
    view: { position: [2.7, 2.7, 6.2], target: [0, 2.2, 0], tangent: [1, 0, -0.4] },
  })

  // Every section keeps all its works on ONE wall, so the camera glides along it
  // instead of swinging across the room; the next section takes the other wall.
  let wall = 1
  const nextWall = () => (wall = -wall)

  /* ── a timeline: a gilt rail with dates, works hung beneath it ── */
  const timeline = (section) => {
    if (!section.entries.length) return
    startZone(section)
    const side = nextWall()
    const hang = HANG.chronicle
    const entries = [...section.entries].sort((a, b) => String(a.start).localeCompare(String(b.start)))
    const sized = entries.map((e) => [e, sizeFor('chronicle', e.image, e.aspect, aspects)])
    // one rail height for the whole section, just above its tallest frame
    const tallest = Math.max(...sized.map(([, [, h]]) => h))
    const railY = hang.y + tallest / 2 + hang.extra + RAIL_GAP
    const start = z + 1.2
    const markers = []
    sized.forEach(([e, size]) => {
      const centre = place(size[0] + hang.extra * 2)
      const top = hang.y + size[1] / 2 + hang.extra
      markers.push({ z: centre, label: formatDate(e.start), drop: railY - top })
      const spot = onWall(side, centre, hang.y)
      stops.push({
        kind: 'frame',
        variant: 'chronicle',
        exhibit: { ...e, year: [formatDate(e.start), formatDate(e.end)].filter(Boolean).join(' – '), by: e.org },
        section,
        size,
        ...spot,
        view: frameView(spot.view, size, hang.extra, { above: railY - top + DATE_H }),
      })
    })
    rails.push({ side, start, end: z + GAP, y: railY, markers })
    z -= 1
  }

  timeline(education)

  /* ── II · certificates, hung like diplomas in a row ───── */
  if (certificates?.items.length) {
    startZone(certificates)
    const side = nextWall()
    const hang = HANG.certificate
    const items = [...certificates.items].sort((a, b) => String(a.date).localeCompare(String(b.date)))
    items.forEach((c) => {
      const size = sizeFor('certificate', c.image, c.aspect, aspects)
      const spot = onWall(side, place(size[0] + hang.extra * 2), hang.y)
      stops.push({
        kind: 'frame',
        variant: 'certificate',
        exhibit: { ...c, by: c.org, year: [formatDate(c.date), c.score].filter(Boolean).join(' · ') },
        section: certificates,
        size,
        ...spot,
        view: frameView(spot.view, size, hang.extra),
      })
    })
    z -= 1
  }

  timeline(experience)

  /* ── IV · trophies, in a row of plinths along one wall ── */
  if (trophies.items.length) {
    startZone(trophies)
    const side = nextWall()
    trophies.items.forEach((t) => {
      stops.push({
        kind: 'trophy',
        exhibit: { ...t, by: t.award },
        section: trophies,
        size: [1.2, 1.6],
        ...nearWall(side, z, 1.5, 0.35),
      })
      z -= 3.2
    })
    z -= 1
  }

  /* ── V · projects: the modern wing, frameless canvases cycling through screenshots ── */
  if (projects.items.length) {
    enterWing('modern')
    z -= 2.5
    startZone(projects)
    const side = nextWall()
    const hang = HANG.canvas
    projects.items.forEach((p) => {
      const slides = p.images?.length ? p.images : [null, null, null]
      // the frame takes the shape of the first screenshot; others are matted to fit
      const size = sizeFor('canvas', slides[0], p.aspect, aspects)
      const spot = onWall(side, place(size[0] + hang.extra * 2), hang.y)
      stops.push({
        kind: 'frame',
        variant: 'canvas',
        exhibit: p,
        slides,
        section: projects,
        size,
        ...spot,
        view: frameView(spot.view, size, hang.extra),
      })
    })
  }

  /* ── the grand masterpiece on the back wall of its own classic room ── */
  if (wing.style !== 'classic') {
    z -= 0.5
    enterWing('classic')
    z -= 13
  } else z -= 4
  const endZ = z
  wings.push({ ...wing, to: endZ })
  const grand = HANG.grand
  stops.push({
    kind: 'frame',
    variant: 'grand',
    exhibit: masterpiece,
    section: { numeral: '', title: 'The Grand Gallery' },
    size: sizeFor('grand', masterpiece.image, masterpiece.aspect, aspects),
    position: [0, grand.y, endZ + 0.02],
    rotation: [0, 0, 0],
    view: { normal: [0, 0, 1], target: [0, grand.y - 0.05, endZ], tangent: [1, 0, 0], pad: 1.4, maxDist: 12 },
  })

  for (const s of stops) s.tour ??= true

  return {
    stops,
    sectionMarks,
    endZ,
    rails,
    wings,
    arches,
    finale: { z: endZ },
  }
}

// a three-quarter view from the entrance: the statue to one side, the masterpiece in sight at the end
export const OVERVIEW = {
  position: [2.3, 3.2, 10.5],
  target: [0.4, 2.5, -20],
  tangent: [1, 0, 0],
}
