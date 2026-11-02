import { Component, Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import { keepGoing, step } from './frame'
import { Plaque, useSelectable } from './Exhibit'
import { Sculpture as Bust } from './Sculpture'
import { GOLD, TRIM } from './theme'
import { asset } from '../asset'

// a museum pedestal: about 1 m tall, so a heroic-scale figure stands above the visitors
const PLINTH = { w: 1.95, d: 1.36, h: 1.0 }

/** If the model can't load, quietly show the procedural bust instead. */
class Fallback extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function Model({ src, height, rotation }) {
  const { scene } = useGLTF(asset(src))
  // keep the node transforms: the compressed mesh is quantized and relies on them
  const statue = useMemo(() => {
    const root = scene.clone(true)
    const marble = new THREE.MeshStandardMaterial({ color: '#f3efe8', roughness: 0.32, metalness: 0 })
    root.traverse((o) => {
      if (o.isMesh) {
        o.material = marble
        o.castShadow = true
        o.receiveShadow = true
      }
    })
    return root
  }, [scene])
  // the converted model is 1 unit tall with its feet at the origin
  return <primitive object={statue} scale={height} rotation-y={rotation} position-y={0.004} />
}

function Face({ src, position, rotation, size }) {
  const tex = useTexture(asset(src))
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[size, size * 1.2]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.05} roughness={0.6} />
    </mesh>
  )
}

/**
 * A full-size statue scan on a low plinth. Configure in data.js → centerpiece.statue:
 *   { model, height, rotation, face: { position, rotation, size } }
 */
function StatueOnPlinth({ exhibit, position, active, onSelect }) {
  const cfg = exhibit.statue
  const [hovered, handlers] = useSelectable(onSelect)
  const halo = useRef()
  useFrame((state, dt) => keepGoing(state, easing.damp(halo.current, 'opacity', hovered || active ? 0.5 : 0.25, 0.25, step(dt))))

  return (
    <group position={position} {...handlers}>
      {/* low marble plinth with a gilt band */}
      <mesh position-y={0.05} receiveShadow>
        <boxGeometry args={[PLINTH.w + 0.14, 0.1, PLINTH.d + 0.14]} />
        <meshStandardMaterial color="#cdbf9f" roughness={0.5} />
      </mesh>
      <mesh position-y={PLINTH.h / 2 + 0.05} castShadow receiveShadow>
        <boxGeometry args={[PLINTH.w, PLINTH.h - 0.1, PLINTH.d]} />
        <meshStandardMaterial color={TRIM} roughness={0.4} />
      </mesh>
      <mesh position-y={PLINTH.h - 0.04}>
        <boxGeometry args={[PLINTH.w + 0.06, 0.04, PLINTH.d + 0.06]} />
        <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
      </mesh>
      <Plaque exhibit={exhibit} position={[0, PLINTH.h * 0.48, PLINTH.d / 2 + 0.007]} width={0.7} />

      <group position-y={PLINTH.h}>
        <Model src={cfg.model} height={cfg.height ?? 1.75} rotation={cfg.rotation ?? 0} />
        {cfg.face?.image && <Face src={cfg.face.image} position={cfg.face.position} rotation={cfg.face.rotation ?? [0, 0, 0]} size={cfg.face.size ?? 0.26} />}
      </group>

      <mesh rotation-x={-Math.PI / 2} position-y={0.012} raycast={() => null}>
        <circleGeometry args={[2.0, 64]} />
        <meshBasicMaterial ref={halo} color="#ffcf8a" transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <spotLight
        position={[0.8, 6.2, 2]}
        angle={0.38}
        penumbra={0.9}
        intensity={80}
        distance={13}
        decay={1.4}
        color="#ffe2b8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
    </group>
  )
}

export function Centerpiece(props) {
  const bust = <Bust {...props} />
  if (!props.exhibit.statue?.model) return bust
  return (
    <Fallback fallback={bust}>
      <Suspense fallback={bust}>
        <StatueOnPlinth {...props} />
      </Suspense>
    </Fallback>
  )
}
