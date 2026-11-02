import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useCursor, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import { keepGoing, step } from './frame'
import { marble } from './textures'
import { GOLD } from './theme'
import { Plaque } from './Exhibit'
import { asset } from '../asset'

function Face({ src }) {
  const tex = useTexture(asset(src))
  return (
    <mesh position={[0, 2.02, 0.19]}>
      <planeGeometry args={[0.42, 0.52]} />
      <meshStandardMaterial map={tex} transparent roughness={0.6} alphaTest={0.05} />
    </mesh>
  )
}

/**
 * A classical bust on a plinth. Drop a transparent PNG of your face in
 * /public and set `centerpiece.face` — it gets stuck on like a
 * cardboard cut-out, which is exactly as dignified as it sounds.
 */
export function Sculpture({ exhibit, position, active, onSelect }) {
  const map = useMemo(() => marble(), [])
  const [socle, torso] = useMemo(() => {
    const lathe = (pts) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 64)
    return [
      lathe([[0, 0], [0.2, 0], [0.2, 0.03], [0.16, 0.05], [0.1, 0.09], [0.1, 0.13], [0, 0.13]]),
      lathe([[0, 0], [0.12, 0], [0.2, 0.05], [0.26, 0.15], [0.28, 0.27], [0.26, 0.37], [0.2, 0.44], [0.11, 0.48], [0, 0.49]]),
    ]
  }, [])
  const [hovered, setHovered] = useState(false)
  const halo = useRef()
  useCursor(hovered)

  useFrame((state, dt) => keepGoing(state, easing.damp(halo.current, 'opacity', hovered || active ? 0.5 : 0.25, 0.25, step(dt))))

  const stone = <meshStandardMaterial map={map} color="#f4f0e8" roughness={0.28} metalness={0} />

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* plinth */}
      <mesh position-y={0.06} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.12, 1.0]} />
        {stone}
      </mesh>
      <mesh position-y={0.62} castShadow receiveShadow>
        <boxGeometry args={[0.72, 1.0, 0.72]} />
        {stone}
      </mesh>
      <mesh position-y={1.16} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.08, 0.9]} />
        {stone}
      </mesh>
      <mesh position={[0, 0.66, 0.364]}>
        <boxGeometry args={[0.5, 0.012, 0.004]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>

      {/* bust: lathe-turned socle + torso, then neck, head and a noble nose */}
      <mesh position-y={1.2} geometry={socle} castShadow>
        {stone}
      </mesh>
      <mesh position-y={1.33} geometry={torso} scale={[1.3, 0.92, 0.62]} castShadow>
        {stone}
      </mesh>
      <mesh position-y={1.82} castShadow>
        <cylinderGeometry args={[0.085, 0.105, 0.2, 32]} />
        {stone}
      </mesh>
      <mesh position={[0, 2.02, 0.01]} scale={[0.145, 0.19, 0.165]} castShadow>
        <sphereGeometry args={[1, 64, 48]} />
        {stone}
      </mesh>
      <mesh position={[0, 2.01, 0.165]} rotation-x={0.3} scale={[0.022, 0.05, 0.026]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        {stone}
      </mesh>

      {/* laurel wreath, because of course */}
      <group position-y={2.13} rotation-x={-0.15}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.158, 0.008, 8, 48]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
        </mesh>
        {Array.from({ length: 22 }, (_, i) => {
          const a = (i / 22) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.162, 0.012 * (i % 2 ? 1 : -1), Math.sin(a) * 0.162]}
              rotation={[0, -a, i % 2 ? 0.6 : -0.6]}
              scale={[0.042, 0.016, 0.006]}
            >
              <sphereGeometry args={[1, 10, 6]} />
              <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
            </mesh>
          )
        })}
      </group>

      {exhibit.face && <Face src={exhibit.face} />}

      {/* soft halo of light on the floor */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.012} raycast={() => null}>
        <circleGeometry args={[1.5, 64]} />
        <meshBasicMaterial ref={halo} color="#ffcf8a" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      <spotLight position={[0, 6, 1.5]} angle={0.32} penumbra={0.9} intensity={70} distance={12} decay={1.4} color="#ffe2b8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />

      <group position={[0, 0.82, 0.37]}>
        <Plaque exhibit={exhibit} position={[0, 0, 0]} width={0.52} />
      </group>
    </group>
  )
}
