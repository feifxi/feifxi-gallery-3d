import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { OVERVIEW } from './layout'
import { step } from './frame'

const goal = new THREE.Vector3()
const look = new THREE.Vector3()
const tangent = new THREE.Vector3()

export const isNarrow = (w) => w < 820
/** Screen width taken by the info panel (keep in step with .panel in index.css). */
const PANEL = (w) => Math.min(440, w * 0.4)

/** Where to stand so a work of `size` fills the free part of the screen. */
function viewFor(stop, camera, size, panelOpen) {
  const v = stop.view
  if (v.position) {
    // fixed viewpoints were composed for desktop: step back on narrow screens
    const k = isNarrow(size.width) ? 1.7 : 1
    const position = v.position.map((p, i) => v.target[i] + (p - v.target[i]) * k)
    return { position, target: v.target, tangent: v.tangent }
  }
  const [w, h] = v.fit ?? stop.size
  const narrow = isNarrow(size.width)
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  // part of the screen left for the painting once the label card is shown
  const freeW = narrow || !panelOpen ? 1 : 1 - PANEL(size.width) / size.width
  const freeH = narrow && panelOpen ? 0.52 : 1
  const aspect = (size.width * freeW) / (size.height * freeH)
  const pad = v.pad ?? 2.05
  const d = Math.max((h * pad) / (2 * t * freeH), (w * pad) / (2 * t * aspect * freeH))
  const dist = THREE.MathUtils.clamp(d, 2.6, v.maxDist ?? 10.5)
  const [nx, ny, nz] = v.normal
  const [tx, ty, tz] = v.target
  return {
    position: [tx + nx * dist, ty - 0.05 + (v.lift ?? 0), tz + nz * dist],
    target: v.target,
    tangent: v.tangent,
  }
}

export function CameraRig({ stops, active, panelOpen = true }) {
  const { camera, size, invalidate } = useThree()
  // the parallax follows the pointer, so pointer movement needs a frame
  useEffect(() => {
    window.addEventListener('pointermove', invalidate, { passive: true })
    return () => window.removeEventListener('pointermove', invalidate)
  }, [invalidate])
  const lookAt = useRef(new THREE.Vector3(...OVERVIEW.target))
  const off = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    const dt = step(delta)
    const stop = active >= 0 ? stops[active] : null
    const view = stop ? viewFor(stop, camera, size, panelOpen) : OVERVIEW
    const { pointer } = state

    // gentle parallax so the room feels alive
    const amp = stop ? 0.12 : 0.7
    tangent.set(...view.tangent).normalize()
    goal.set(...view.position).addScaledVector(tangent, pointer.x * amp)
    goal.y += pointer.y * amp * 0.4

    // rise over the statue while travelling long distances
    const travel = camera.position.distanceTo(goal)
    goal.y += Math.min(travel * 0.07, 1.4)

    look.set(...view.target)
    let moving = easing.damp3(camera.position, goal, 0.55, dt)
    moving = easing.damp3(lookAt.current, look, 0.45, dt) || moving
    camera.lookAt(lookAt.current)

    // slide the image aside to make room for the museum label
    const narrow = isNarrow(size.width)
    const ox = stop && panelOpen && !narrow ? PANEL(size.width) / 2 : 0
    const oy = stop && panelOpen && narrow ? size.height * 0.22 : 0
    moving = easing.damp(off.current, 'x', ox, 0.4, dt) || moving
    moving = easing.damp(off.current, 'y', oy, 0.4, dt) || moving
    camera.setViewOffset(size.width, size.height, off.current.x, off.current.y, size.width, size.height)
    if (moving) state.invalidate()
  })

  return null
}
