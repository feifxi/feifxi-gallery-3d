import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, Text } from '@react-three/drei'
import { HALL } from './layout'
import { floorTiles } from './textures'
import { CEILING, FLOOR, FONT_SERIF, FONT_SERIF_ITALIC, GOLD, TRIM, WAINSCOT, WALL } from './theme'

/** One long side wall with wainscoting, chair rail and crown moulding. */
function SideWall({ side, length, centerZ }) {
  const x = (side * HALL.width) / 2
  const inward = -side // +1 on left wall, -1 on right
  const H = HALL.height
  const at = (depth) => x + inward * depth
  return (
    <group>
      <mesh position={[x, H / 2, centerZ]} rotation-y={(inward * Math.PI) / 2}>
        <planeGeometry args={[length, H]} />
        <meshStandardMaterial color={WALL} roughness={0.92} />
      </mesh>
      {/* wainscot panel */}
      <mesh position={[at(0.03), 0.55, centerZ]}>
        <boxGeometry args={[0.06, 1.1, length]} />
        <meshStandardMaterial color={WAINSCOT} roughness={0.6} />
      </mesh>
      {/* chair rail */}
      <mesh position={[at(0.06), 1.12, centerZ]}>
        <boxGeometry args={[0.08, 0.06, length]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.35} />
      </mesh>
      {/* skirting */}
      <mesh position={[at(0.05), 0.09, centerZ]}>
        <boxGeometry args={[0.1, 0.18, length]} />
        <meshStandardMaterial color={TRIM} roughness={0.5} />
      </mesh>
      {/* frieze + crown */}
      <mesh position={[at(0.02), H - 0.55, centerZ]}>
        <boxGeometry args={[0.04, 0.03, length]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      <mesh position={[at(0.12), H - 0.14, centerZ]}>
        <boxGeometry args={[0.24, 0.28, length]} />
        <meshStandardMaterial color={TRIM} roughness={0.55} />
      </mesh>
    </group>
  )
}

function EndWall({ z, facing }) {
  const H = HALL.height
  const W = HALL.width
  return (
    <group position-z={z} rotation-y={facing === 'back' ? Math.PI : 0}>
      <mesh position-y={H / 2}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={WALL} roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.55, 0.03]}>
        <boxGeometry args={[W, 1.1, 0.06]} />
        <meshStandardMaterial color={WAINSCOT} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.12, 0.06]}>
        <boxGeometry args={[W, 0.06, 0.08]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[0, H - 0.14, 0.12]}>
        <boxGeometry args={[W, 0.28, 0.24]} />
        <meshStandardMaterial color={TRIM} roughness={0.55} />
      </mesh>
    </group>
  )
}

function SectionTitle({ section, z, style }) {
  const half = HALL.width / 2 - 0.03
  const modern = style === 'modern'
  const [mark, title] = modern ? [MODERN.ink, MODERN.inkSoft] : [GOLD, TRIM]
  return [-1, 1].map((side) => (
    <group key={side} position={[side * half, 3.35, z]} rotation-y={(-side * Math.PI) / 2}>
      <Text font={FONT_SERIF} fontSize={0.6} color={mark} letterSpacing={0.08} anchorY="bottom" position-y={0.12}>
        {section.numeral}
      </Text>
      <mesh>
        <planeGeometry args={[1.2, 0.014]} />
        <meshBasicMaterial color={mark} />
      </mesh>
      <Text font={FONT_SERIF_ITALIC} fontSize={0.34} color={title} anchorY="top" position-y={-0.12} maxWidth={2.8} textAlign="center">
        {section.title}
      </Text>
    </group>
  ))
}

/*
 * Ceiling lamps. Every real-time light is paid for by every pixel of every lit surface,
 * so instead of one light per lamp, a small pool of lights follows your gaze: each frame
 * the nearest lamps get a light, faded by distance so nothing ever pops on or off.
 * Only lamps within FADE[1] can be lit, and with lamps 9 m apart at most POOL of them fit.
 */
const POOL = 4
const FADE = [12, 18]
const LAMP = { classic: { intensity: 28, color: new THREE.Color('#ffd8a6') }, modern: { intensity: 16, color: new THREE.Color('#fff7ee') } }
const focus = new THREE.Vector3()
const ahead = new THREE.Vector3()

function LampPool({ lamps }) {
  const lights = useRef([])
  useFrame(({ camera }) => {
    camera.getWorldDirection(ahead)
    focus.copy(camera.position).addScaledVector(ahead, 12)
    const nearest = lamps
      .map((lamp) => [lamp, Math.abs(lamp.z - focus.z)])
      .sort((a, b) => a[1] - b[1])
      .slice(0, POOL)
    lights.current.forEach((light, i) => {
      const [lamp, d] = nearest[i] ?? [{ z: 0, style: 'classic' }, Infinity]
      const kind = LAMP[lamp.style]
      light.position.z = lamp.z
      light.color.copy(kind.color)
      light.intensity = kind.intensity * (1 - THREE.MathUtils.smoothstep(d, FADE[0], FADE[1]))
    })
  })
  return Array.from({ length: POOL }, (_, i) => (
    <pointLight key={i} ref={(el) => (lights.current[i] = el)} position={[0, HALL.height - 1.1, 0]} intensity={0} distance={18} decay={1.6} color="#ffd8a6" />
  ))
}

/* ── the classic picture gallery: oxblood walls, beamed ceiling, skylight, runner ── */
function ClassicWing({ from, to }) {
  const length = from - to
  const centerZ = (from + to) / 2
  const H = HALL.height
  const beams = []
  for (let z = from - 2.5; z > to + 1; z -= 5) beams.push(z)
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, centerZ]}>
        <planeGeometry args={[2.2, length - 3]} />
        <meshStandardMaterial color="#3d0f12" roughness={1} />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.008, centerZ]}>
          <planeGeometry args={[0.06, length - 3]} />
          <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.5} />
        </mesh>
      ))}
      <SideWall side={-1} length={length} centerZ={centerZ} />
      <SideWall side={1} length={length} centerZ={centerZ} />
      <mesh rotation-x={Math.PI / 2} position={[0, H, centerZ]}>
        <planeGeometry args={[HALL.width, length]} />
        <meshStandardMaterial color={CEILING} roughness={0.9} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, H - 0.02, centerZ]}>
        <planeGeometry args={[3.2, length - 1.5]} />
        <meshBasicMaterial color="#fff2dc" toneMapped={false} />
      </mesh>
      {beams.map((z) => (
        <mesh key={z} position={[0, H - 0.2, z]}>
          <boxGeometry args={[HALL.width, 0.4, 0.35]} />
          <meshStandardMaterial color={TRIM} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/* ── the modern wing: white walls, pale polished concrete, black track lights ── */
export const MODERN = { wall: '#f1eee8', floor: '#cdc8bf', ceiling: '#f4f2ee', track: '#161514', ink: '#24211e', inkSoft: '#5c554d' }

function ModernWing({ from, to }) {
  const length = from - to
  const centerZ = (from + to) / 2
  const H = HALL.height
  const cans = []
  for (let z = from - 1.4; z > to + 0.8; z -= 2.4) cans.push(z)
  return (
    <group>
      {/* pale concrete laid over the reflective floor: the reflections soften, as on a real gallery floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, centerZ]}>
        <planeGeometry args={[HALL.width, length]} />
        <meshStandardMaterial color={MODERN.floor} roughness={0.32} metalness={0.05} transparent opacity={0.86} />
      </mesh>
      {[-1, 1].map((side) => {
        const x = (side * HALL.width) / 2
        return (
          <group key={side}>
            <mesh position={[x, H / 2, centerZ]} rotation-y={(-side * Math.PI) / 2}>
              <planeGeometry args={[length, H]} />
              {/* a touch of self-light keeps the white clean under the hall's warm red ambience */}
              <meshStandardMaterial color={MODERN.wall} roughness={0.95} emissive={MODERN.wall} emissiveIntensity={0.28} />
            </mesh>
            {/* shadow-gap skirting */}
            <mesh position={[x - side * 0.02, 0.05, centerZ]}>
              <boxGeometry args={[0.04, 0.1, length]} />
              <meshStandardMaterial color="#d9d4cb" roughness={0.8} />
            </mesh>
            {/* track rail with spot cans aimed at the wall */}
            <mesh position={[side * 3.6, H - 0.04, centerZ]}>
              <boxGeometry args={[0.05, 0.04, length - 0.6]} />
              <meshStandardMaterial color={MODERN.track} roughness={0.5} />
            </mesh>
            {cans.map((z) => (
              <group key={z} position={[side * 3.6, H - 0.2, z]} rotation-z={side * 0.65}>
                <mesh>
                  <cylinderGeometry args={[0.065, 0.055, 0.22, 16]} />
                  <meshStandardMaterial color={MODERN.track} roughness={0.45} metalness={0.3} />
                </mesh>
                <mesh position-y={-0.111} rotation-x={Math.PI / 2}>
                  <circleGeometry args={[0.05, 16]} />
                  <meshBasicMaterial color="#fff6e8" toneMapped={false} side={THREE.DoubleSide} />
                </mesh>
              </group>
            ))}
          </group>
        )
      })}
      <mesh rotation-x={Math.PI / 2} position={[0, H, centerZ]}>
        <planeGeometry args={[HALL.width, length]} />
        <meshStandardMaterial color={MODERN.ceiling} roughness={0.9} emissive={MODERN.ceiling} emissiveIntensity={0.3} />
      </mesh>
      {/* a recessed light slot down the middle */}
      <mesh rotation-x={Math.PI / 2} position={[0, H - 0.01, centerZ]}>
        <planeGeometry args={[0.35, length - 1.2]} />
        <meshBasicMaterial color="#fffaf0" toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ── a stone archway between wings ── */
const OPENING = { halfWidth: 3.2, springY: 3.0 } // arch top at 6.2 m

function Arch({ z }) {
  const geometry = useMemo(() => {
    const W = HALL.width / 2
    const { halfWidth: r, springY } = OPENING
    const shape = new THREE.Shape()
    shape.moveTo(-W, 0)
    shape.lineTo(-r, 0)
    shape.lineTo(-r, springY)
    shape.absarc(0, springY, r, Math.PI, 0, true)
    shape.lineTo(r, 0)
    shape.lineTo(W, 0)
    shape.lineTo(W, HALL.height)
    shape.lineTo(-W, HALL.height)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false, curveSegments: 48 })
  }, [])
  const { halfWidth: r, springY } = OPENING
  return (
    <group position-z={z - 0.4}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={TRIM} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* gilt archivolt and keystone on both faces */}
      {[-0.01, 0.81].map((dz) => (
        <group key={dz} position-z={dz}>
          <mesh position-y={springY}>
            <torusGeometry args={[r + 0.12, 0.05, 8, 64, Math.PI]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
          </mesh>
          <mesh position-y={springY + r + 0.16}>
            <boxGeometry args={[0.36, 0.42, 0.06]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Hall({ endZ, sectionMarks, wings, arches, reflect = true }) {
  const length = HALL.entranceZ - endZ
  const centerZ = (HALL.entranceZ + endZ) / 2

  const tiles = useMemo(() => {
    const t = floorTiles()
    t.repeat.set(HALL.width / 3, length / 3)
    return t
  }, [length])

  // one lamp every 9 m; each takes the light of the wing it hangs in
  const lamps = useMemo(() => {
    const out = []
    for (let z = HALL.entranceZ - 5; z > endZ + 2; z -= 9) {
      const wing = wings.find((w) => z <= w.from && z >= w.to)
      out.push({ z, style: wing?.style ?? 'classic' })
    }
    return out
  }, [endZ, wings])

  return (
    <group>
      {/* polished stone floor, one mirror for the whole hall */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[HALL.width, length]} />
        {reflect ? (
          <MeshReflectorMaterial
            map={tiles}
            color={FLOOR}
            blur={[400, 120]}
            resolution={256}
            mixBlur={1}
            mixStrength={14}
            mirror={0.6}
            depthScale={1}
            minDepthThreshold={0.6}
            maxDepthThreshold={1.4}
            roughness={0.75}
            metalness={0.4}
          />
        ) : (
          // polished stone without the mirror pass: catches the warm room in its sheen
          <meshStandardMaterial map={tiles} color={FLOOR} roughness={0.5} metalness={0.05} envMapIntensity={0.5} />
        )}
      </mesh>

      {wings.map((w) => (w.style === 'modern' ? <ModernWing key={w.from} {...w} /> : <ClassicWing key={w.from} {...w} />))}
      {arches.map((z) => (
        <Arch key={z} z={z} />
      ))}
      <EndWall z={endZ} facing="front" />
      <EndWall z={HALL.entranceZ} facing="back" />

      <LampPool lamps={lamps} />

      {sectionMarks.map(({ section, z, style }) => (
        <SectionTitle key={section.numeral} section={section} z={z} style={style} />
      ))}
    </group>
  )
}
