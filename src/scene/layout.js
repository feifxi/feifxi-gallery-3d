// Turns the collection into positions in the hall + camera stops for the tour.

export const HALL = {
  width: 12,
  height: 6.5,
  slot: 5, // distance between paintings along a wall
  gap: 4, // extra space where a new section begins
  entranceZ: 11,
}

const DEFAULT_ASPECT = 0.8

/** Frame size in metres, keeping things in a dignified range. */
export function frameSize(exhibit, maxH = 1.7, maxW = 2.6) {
  const a = exhibit.aspect ?? DEFAULT_ASPECT
  let h = maxH
  let w = h * a
  if (w > maxW) {
    w = maxW
    h = w / a
  }
  return [w, h]
}

export function buildLayout({ sections, centerpiece, finale }) {
  const half = HALL.width / 2
  const stops = []
  const sectionMarks = []

  stops.push({
    kind: 'sculpture',
    exhibit: centerpiece,
    section: { numeral: '', title: 'The Rotunda' },
    position: [0, 0, 0],
    size: [1.3, 1.6],
    view: { position: [1.4, 2.0, 3.4], target: [0, 1.8, 0], tangent: [1, 0, -0.4] },
  })

  let z = -7
  sections.forEach((section) => {
    sectionMarks.push({ section, z })
    z -= HALL.gap
    for (let i = 0; i < section.exhibits.length; i += 2) {
      for (let side = 0; side < 2; side++) {
        const exhibit = section.exhibits[i + side]
        if (!exhibit) continue
        const left = side === 0
        const x = left ? -half : half
        const size = frameSize(exhibit)
        stops.push({
          kind: 'wall',
          exhibit,
          section,
          size,
          position: [left ? x + 0.02 : x - 0.02, 2.4, z],
          rotation: [0, left ? Math.PI / 2 : -Math.PI / 2, 0],
          view: {
            normal: [left ? 1 : -1, 0, 0],
            target: [x, 2.4, z],
            tangent: [0, 0, left ? -1 : 1],
          },
        })
      }
      z -= HALL.slot
    }
  })

  const endZ = z + HALL.slot - 5
  const finaleSize = frameSize(finale, 2.3, 3.6)
  stops.push({
    kind: 'wall',
    exhibit: finale,
    section: { numeral: '', title: 'The Gift Shop' },
    size: finaleSize,
    position: [0, 2.75, endZ + 0.02],
    rotation: [0, 0, 0],
    view: { normal: [0, 0, 1], target: [0, 2.75, endZ], tangent: [1, 0, 0] },
  })

  return { stops, sectionMarks, endZ }
}

export const OVERVIEW = {
  position: [0, 2.6, 9.5],
  target: [0, 1.7, -20],
  tangent: [1, 0, 0],
}
