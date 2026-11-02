import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text, useCursor, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import { lightWash, paintPlaceholder } from './textures'
import { FONT_SERIF, FONT_SERIF_ITALIC, GOLD, IVORY, INK } from './theme'

const BORDER = 0.14 // gold moulding width
const MAT = 0.07 // cream passe-partout

let washTex
const getWash = () => (washTex ??= lightWash())

function useCoverTexture(tex, [w, h]) {
  return useMemo(() => {
    const t = tex.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    const img = t.image
    const ia = img.width / img.height
    const fa = w / h
    if (ia > fa) {
      t.repeat.set(fa / ia, 1)
      t.offset.set((1 - fa / ia) / 2, 0)
    } else {
      t.repeat.set(1, ia / fa)
      t.offset.set(0, (1 - ia / fa) / 2)
    }
    t.needsUpdate = true
    return t
  }, [tex, w, h])
}

function ImageCanvas({ src, size }) {
  const tex = useCoverTexture(useTexture(src), size)
  return <CanvasSurface map={tex} size={size} />
}

function PlaceholderCanvas({ exhibit, size }) {
  const tex = useMemo(() => paintPlaceholder(exhibit, size), [exhibit, size])
  return <CanvasSurface map={tex} size={size} />
}

function CanvasSurface({ map, size: [w, h] }) {
  return (
    <mesh position-z={0.052}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        map={map}
        emissiveMap={map}
        emissive="#ffffff"
        emissiveIntensity={0.4}
        roughness={0.85}
      />
    </mesh>
  )
}

/** A framed work: gold frame, mat, picture lamp, wall wash and label plaque. */
export function Framed({ exhibit, size, active, onSelect, plaque = true }) {
  const [w, h] = size
  const frame = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  useFrame((_, dt) => {
    easing.damp(frame.current, 'emissiveIntensity', hovered || active ? 0.22 : 0, 0.2, dt)
  })

  const ow = w + MAT * 2 + BORDER * 2
  const oh = h + MAT * 2 + BORDER * 2

  return (
    <group
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
      {/* warm pool of light on the wall */}
      <mesh position={[0, 0.35, 0.004]} raycast={() => null}>
        <planeGeometry args={[ow * 1.9, oh * 1.9]} />
        <meshBasicMaterial map={getWash()} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* moulding — outer gold box with a darker inner lip */}
      <mesh position-z={0.03} castShadow>
        <boxGeometry args={[ow, oh, 0.07]} />
        <meshStandardMaterial ref={frame} color={GOLD} metalness={1} roughness={0.32} emissive={GOLD} emissiveIntensity={0} />
      </mesh>
      <mesh position-z={0.07}>
        <boxGeometry args={[w + MAT * 2 + 0.05, h + MAT * 2 + 0.05, 0.016]} />
        <meshStandardMaterial color="#7a5a26" metalness={1} roughness={0.4} />
      </mesh>
      <mesh position-z={0.08}>
        <planeGeometry args={[w + MAT * 2, h + MAT * 2]} />
        <meshStandardMaterial color={IVORY} roughness={0.9} />
      </mesh>
      <group position-z={0.032}>
        {exhibit.image ? <ImageCanvas src={exhibit.image} size={size} /> : <PlaceholderCanvas exhibit={exhibit} size={size} />}
      </group>

      {/* brass picture lamp */}
      <group position={[0, oh / 2 + 0.12, 0.18]}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.035, 0.035, Math.min(ow * 0.55, 1.4), 24]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.03, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, Math.min(ow * 0.5, 1.3), 12]} />
          <meshBasicMaterial color="#fff1d6" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.05, -0.09]} rotation-x={0.9}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
          <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
        </mesh>
      </group>

      {plaque && <Plaque exhibit={exhibit} position={[ow / 2 + 0.42, -0.35, 0.015]} />}
    </group>
  )
}

export function Plaque({ exhibit, position, width = 0.56 }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width, 0.3, 0.012]} />
        <meshStandardMaterial color={IVORY} roughness={0.7} />
      </mesh>
      <Text
        font={FONT_SERIF}
        fontSize={0.042}
        color={INK}
        maxWidth={width - 0.08}
        anchorX="left"
        anchorY="top"
        position={[-width / 2 + 0.04, 0.11, 0.008]}
        lineHeight={1.05}
      >
        {exhibit.title}
      </Text>
      <Text
        font={FONT_SERIF_ITALIC}
        fontSize={0.026}
        color="#5b5148"
        maxWidth={width - 0.08}
        anchorX="left"
        anchorY="bottom"
        position={[-width / 2 + 0.04, -0.11, 0.008]}
        lineHeight={1.2}
      >
        {`${exhibit.year}\n${exhibit.medium}`}
      </Text>
    </group>
  )
}
