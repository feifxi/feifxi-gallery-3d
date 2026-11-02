import { useMemo } from 'react'
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

function SectionTitle({ section, z }) {
  const half = HALL.width / 2 - 0.03
  return [-1, 1].map((side) => (
    <group key={side} position={[side * half, 3.35, z]} rotation-y={(-side * Math.PI) / 2}>
      <Text font={FONT_SERIF} fontSize={0.6} color={GOLD} letterSpacing={0.08} anchorY="bottom" position-y={0.12}>
        {section.numeral}
      </Text>
      <mesh>
        <planeGeometry args={[1.2, 0.014]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>
      <Text font={FONT_SERIF_ITALIC} fontSize={0.34} color={TRIM} anchorY="top" position-y={-0.12} maxWidth={2.8} textAlign="center">
        {section.title}
      </Text>
    </group>
  ))
}

export function Hall({ endZ, sectionMarks }) {
  const length = HALL.entranceZ - endZ
  const centerZ = (HALL.entranceZ + endZ) / 2
  const H = HALL.height

  const tiles = useMemo(() => {
    const t = floorTiles()
    t.repeat.set(HALL.width / 3, length / 3)
    return t
  }, [length])

  const beams = useMemo(() => {
    const out = []
    for (let z = HALL.entranceZ - 2.5; z > endZ + 1; z -= 5) out.push(z)
    return out
  }, [endZ])

  const lamps = useMemo(() => {
    const out = []
    for (let z = HALL.entranceZ - 5; z > endZ + 2; z -= 9) out.push(z)
    return out
  }, [endZ])

  return (
    <group>
      {/* polished stone floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[HALL.width, length]} />
        <MeshReflectorMaterial
          map={tiles}
          color={FLOOR}
          blur={[400, 120]}
          resolution={512}
          mixBlur={1}
          mixStrength={14}
          mirror={0.6}
          depthScale={1}
          minDepthThreshold={0.6}
          maxDepthThreshold={1.4}
          roughness={0.75}
          metalness={0.4}
        />
      </mesh>

      {/* runner carpet down the middle */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, centerZ - 1]}>
        <planeGeometry args={[2.2, length - 6]} />
        <meshStandardMaterial color="#3d0f12" roughness={1} />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.008, centerZ - 1]}>
          <planeGeometry args={[0.06, length - 6]} />
          <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      <SideWall side={-1} length={length} centerZ={centerZ} />
      <SideWall side={1} length={length} centerZ={centerZ} />
      <EndWall z={endZ} facing="front" />
      <EndWall z={HALL.entranceZ} facing="back" />

      {/* ceiling, coffer beams and a frosted skylight */}
      <mesh rotation-x={Math.PI / 2} position={[0, H, centerZ]}>
        <planeGeometry args={[HALL.width, length]} />
        <meshStandardMaterial color={CEILING} roughness={0.9} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, H - 0.02, centerZ]}>
        <planeGeometry args={[3.2, length - 2]} />
        <meshBasicMaterial color="#fff2dc" toneMapped={false} />
      </mesh>
      {beams.map((z) => (
        <mesh key={z} position={[0, H - 0.2, z]}>
          <boxGeometry args={[HALL.width, 0.4, 0.35]} />
          <meshStandardMaterial color={TRIM} roughness={0.6} />
        </mesh>
      ))}

      {lamps.map((z) => (
        <pointLight key={z} position={[0, H - 1.1, z]} intensity={28} distance={18} decay={1.6} color="#ffd8a6" />
      ))}

      {sectionMarks.map(({ section, z }) => (
        <SectionTitle key={section.id} section={section} z={z} />
      ))}
    </group>
  )
}
