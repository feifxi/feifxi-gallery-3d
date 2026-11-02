import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { easing } from 'maath'
import { OVERVIEW } from './layout'

const goal = new THREE.Vector3()
const look = new THREE.Vector3()
const tangent = new THREE.Vector3()

export const isNarrow = (w) => w < 820

/** Where to stand so a work of `size` fills the free part of the screen. */
function viewFor(stop, camera, size) {
  const v = stop.view
  if (v.position) return { position: v.position, target: v.target, tangent: v.tangent }
  const [w, h] = stop.size
  const narrow = isNarrow(size.width)
  const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  // part of the screen left for the painting once the label card is shown
  const freeW = narrow ? 1 : 1 - Math.min(440, size.width * 0.4) / size.width
  const freeH = narrow ? 0.52 : 1
  const aspect = (size.width * freeW) / (size.height * freeH)
  const pad = 2.05
  const d = Math.max((h * pad) / (2 * t * freeH), (w * pad) / (2 * t * aspect * freeH))
  const dist = THREE.MathUtils.clamp(d, 3, narrow ? 10.5 : 8)
  const [nx, ny, nz] = v.normal
  const [tx, ty, tz] = v.target
  return {
    position: [tx + nx * dist, ty - 0.05, tz + nz * dist],
    target: v.target,
    tangent: v.tangent,
  }
}

export function CameraRig({ stops, active }) {
  const { camera, size } = useThree()
  const lookAt = useRef(new THREE.Vector3(...OVERVIEW.target))
  const off = useRef({ x: 0, y: 0 })

  useFrame((state, dt) => {
    const stop = active >= 0 ? stops[active] : null
    const view = stop ? viewFor(stop, camera, size) : OVERVIEW
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
    easing.damp3(camera.position, goal, 0.55, dt)
    easing.damp3(lookAt.current, look, 0.45, dt)
    camera.lookAt(lookAt.current)

    // slide the image aside to make room for the museum label
    const narrow = isNarrow(size.width)
    const ox = stop && !narrow ? Math.min(440, size.width * 0.4) / 2 : 0
    const oy = stop && narrow ? size.height * 0.22 : 0
    easing.damp(off.current, 'x', ox, 0.4, dt)
    easing.damp(off.current, 'y', oy, 0.4, dt)
    camera.setViewOffset(size.width, size.height, off.current.x, off.current.y, size.width, size.height)
  })

  return null
}
