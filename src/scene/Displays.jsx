import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { easing } from 'maath'
import { keepGoing, step } from './frame'
import { Plaque, useSelectable } from './Exhibit'
import { HALL } from './layout'
import { FONT_SERIF, GOLD, TRIM } from './theme'

/** Warm pool of light on the floor; brightens on hover. */
function Halo({ on, radius = 1.1 }) {
  const mat = useRef()
  useFrame((state, dt) => keepGoing(state, easing.damp(mat.current, 'opacity', on ? 0.45 : 0.2, 0.25, step(dt))))
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.012} raycast={() => null}>
      <circleGeometry args={[radius, 48]} />
      <meshBasicMaterial ref={mat} color="#ffcf8a" transparent opacity={0.2} depthWrite={false} />
    </mesh>
  )
}

/* ── III · Trophies ───────────────────────────────────────── */

const METALS = {
  1: { color: '#d8aa45', name: 'gold' },
  2: { color: '#cfd3d8', name: 'silver' },
  3: { color: '#b4733d', name: 'bronze' },
}

const lathe = (pts) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 48)
let CUP
const cup = () => {
  if (CUP) return CUP
  CUP = lathe([
    [0, 0.1], [0.035, 0.1], [0.03, 0.14], [0.022, 0.2], [0.03, 0.24], [0.05, 0.26],
    [0.1, 0.3], [0.14, 0.37], [0.16, 0.46], [0.165, 0.52], [0.175, 0.535], [0.165, 0.54],
  ])
  return CUP
}

function Cup({ color }) {
  const metal = <meshStandardMaterial color={color} metalness={0.9} roughness={0.26} emissive={color} emissiveIntensity={0.08} side={THREE.DoubleSide} />
  return (
    <group>
      <mesh position-y={0.05}>
        <boxGeometry args={[0.24, 0.1, 0.24]} />
        <meshStandardMaterial color="#14100e" roughness={0.3} />
      </mesh>
      <mesh position-y={0.065}>
        <boxGeometry args={[0.245, 0.015, 0.245]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      <mesh geometry={cup()} castShadow>
        {metal}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.16, 0.42, 0]} rotation-z={s < 0 ? Math.PI / 2 : -Math.PI / 2}>
          <torusGeometry args={[0.065, 0.012, 10, 24, Math.PI]} />
          {metal}
        </mesh>
      ))}
    </group>
  )
}

/** For finalists and honourable mentions: a gilded laurel wreath on a stand. */
function Laurel() {
  const leaves = useMemo(() => Array.from({ length: 18 }, (_, i) => i), [])
  return (
    <group>
      <mesh position-y={0.05}>
        <boxGeometry args={[0.24, 0.1, 0.24]} />
        <meshStandardMaterial color="#14100e" roughness={0.3} />
      </mesh>
      <mesh position-y={0.18}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      <group position-y={0.4}>
        {leaves.map((i) => {
          const side = i < 9 ? -1 : 1
          const k = i % 9
          const a = -Math.PI / 2 + side * (0.25 + k * 0.3)
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.15, Math.sin(a) * 0.15, 0]}
              rotation-z={a + (side * Math.PI) / 2 + side * 0.5}
              scale={[0.05, 0.02, 0.01]}
            >
              <sphereGeometry args={[1, 10, 6]} />
              <meshStandardMaterial color="#c59a3e" metalness={1} roughness={0.3} />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

const look = new THREE.Vector3()

export function Trophy({ exhibit, position, rotation, active, onSelect }) {
  const [hovered, handlers] = useSelectable(onSelect)
  const spin = useRef()
  const metal = METALS[exhibit.place]
  const height = { 1: 1.2, 2: 1.05, 3: 0.95 }[exhibit.place] ?? 0.95
  const scale = { 1: 1.35, 2: 1.2, 3: 1.1 }[exhibit.place] ?? 1.2

  // trophies turn slowly, but only while you are looking around the trophy room (no frames wasted otherwise)
  const here = useMemo(() => new THREE.Vector3(...position), [position])
  useFrame((state, dt) => {
    state.camera.getWorldDirection(look)
    if (look.multiplyScalar(4.3).add(state.camera.position).distanceTo(here) > 6) return
    spin.current.rotation.y += step(dt) * (hovered || active ? 0.8 : 0.25)
    state.invalidate()
  })

  return (
    <group position={position} rotation={rotation} {...handlers}>
      {/* plinth, ivory with a gilt band */}
      <mesh position-y={height / 2} castShadow>
        <boxGeometry args={[0.62, height, 0.62]} />
        <meshStandardMaterial color={TRIM} roughness={0.4} />
      </mesh>
      <mesh position-y={height - 0.03}>
        <boxGeometry args={[0.68, 0.06, 0.68]} />
        <meshStandardMaterial color={TRIM} roughness={0.4} />
      </mesh>
      <mesh position-y={0.05}>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color="#cdbf9f" roughness={0.5} />
      </mesh>
      <Text font={FONT_SERIF} fontSize={0.2} color={GOLD} position={[0, height - 0.22, 0.311]}>
        {exhibit.place >= 1 && exhibit.place <= 3 ? ['I', 'II', 'III'][exhibit.place - 1] : '✦'}
      </Text>
      <Plaque exhibit={{ ...exhibit, year: `${exhibit.award} · ${exhibit.year}` }} position={[0, height * 0.42, 0.318]} width={0.52} />

      <group ref={spin} position-y={height} scale={scale}>
        {metal ? <Cup color={metal.color} /> : <Laurel />}
      </group>
      <Halo on={hovered || active} radius={0.9} />
    </group>
  )
}

/* ── Timelines: a gilt rail with dates along one wall ───── */

export function ChronicleRail({ side, start, end, y: Y = 3.3, markers }) {
  const length = start - end
  const mid = (start + end) / 2
  const x = HALL.width / 2 - 0.03
  return (
    <group>
      <mesh position={[side * x - side * 0.02, Y, mid]}>
        <boxGeometry args={[0.04, 0.035, length]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
      {/* arrowhead pointing onwards in time */}
      <mesh position={[side * x - side * 0.03, Y, end - 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.22, 4]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.28} />
      </mesh>
      {markers.map(({ z, label, drop = 0.4 }) => {
        const wx = side * x
        return (
          <group key={z} position={[wx - side * 0.04, 0, z]} rotation-y={(-side * Math.PI) / 2}>
            <mesh position-y={Y} rotation-x={Math.PI / 2}>
              <cylinderGeometry args={[0.1, 0.1, 0.03, 32]} />
              <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
            </mesh>
            <mesh position={[0, Y, 0.017]}>
              <circleGeometry args={[0.055, 32]} />
              <meshStandardMaterial color="#5a1c22" />
            </mesh>
            {/* a thin gilt cord down to the frame */}
            <mesh position={[0, Y - drop / 2, -0.01]}>
              <boxGeometry args={[0.012, drop, 0.01]} />
              <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
            </mesh>
            <Text font={FONT_SERIF} fontSize={0.34} color={GOLD} position-y={Y + 0.36} anchorY="bottom" letterSpacing={0.04}>
              {label}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

/* ── A tufted velvet bench, for contemplating the masterpiece ── */

export function Bench({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position-y={0.36}>
        <boxGeometry args={[2.0, 0.16, 0.62]} />
        <meshStandardMaterial color="#1b2340" roughness={0.95} />
      </mesh>
      {[-0.66, 0, 0.66].flatMap((x) =>
        [-0.14, 0.14].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.445, z]}>
            <sphereGeometry args={[0.018, 8, 6]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
          </mesh>
        )),
      )}
      <mesh position-y={0.25}>
        <boxGeometry args={[2.04, 0.08, 0.66]} />
        <meshStandardMaterial color="#2a1612" roughness={0.45} />
      </mesh>
      {[-0.9, 0.9].flatMap((x) =>
        [-0.26, 0.26].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.11, z]}>
            <cylinderGeometry args={[0.03, 0.02, 0.22, 12]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
          </mesh>
        )),
      )}
    </group>
  )
}

/* ── Velvet rope barrier: brass stanchions with sagging red rope ── */

export function Stanchions({ z, span = 7, posts = 5 }) {
  const xs = Array.from({ length: posts }, (_, i) => -span / 2 + (i * span) / (posts - 1))
  const ropes = useMemo(
    () =>
      xs.slice(0, -1).map((x0, i) => {
        const x1 = xs[i + 1]
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(x0, 0.92, 0),
          new THREE.Vector3((x0 + x1) / 2, 0.62, 0),
          new THREE.Vector3(x1, 0.92, 0),
        )
        return new THREE.TubeGeometry(curve, 24, 0.022, 8, false)
      }),
    [span, posts],
  )
  return (
    <group position-z={z}>
      {xs.map((x) => (
        <group key={x} position-x={x}>
          <mesh position-y={0.02}>
            <cylinderGeometry args={[0.16, 0.18, 0.04, 24]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
          </mesh>
          <mesh position-y={0.48}>
            <cylinderGeometry args={[0.025, 0.03, 0.9, 12]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
          </mesh>
          <mesh position-y={0.96}>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {ropes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color="#7a1018" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * One display light shared by the whole trophy room: it slides to the trophy you are
 * looking at (one light instead of one per trophy keeps every surface cheaper to shade).
 */
const gaze = new THREE.Vector3()
const ahead = new THREE.Vector3()
const spot = new THREE.Vector3()
export function TrophyLight({ trophies }) {
  const light = useRef()
  useFrame(({ camera }) => {
    camera.getWorldDirection(ahead)
    gaze.copy(camera.position).addScaledVector(ahead, 4.3)
    let best = null
    let bestD = Infinity
    for (const t of trophies) {
      const d = spot.set(...t.position).distanceTo(gaze)
      if (d < bestD) [best, bestD] = [t, d]
    }
    if (!best) return
    // light sits up and in front of the trophy, towards the aisle
    const [x, , z] = best.position
    light.current.position.set(x - Math.sign(x) * 0.9, 2.4, z + 0.4)
    light.current.intensity = 5 * (1 - THREE.MathUtils.smoothstep(bestD, 1.2, 2.2))
  })
  return <pointLight ref={light} intensity={0} distance={3.2} decay={1.5} color="#fff1d6" />
}
