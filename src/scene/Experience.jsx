import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, Preload } from '@react-three/drei'
import { Hall } from './Hall'
import { Framed } from './Exhibit'
import { Sculpture } from './Sculpture'
import { CameraRig } from './CameraRig'
import { FOG } from './theme'

function Ready({ onReady }) {
  useEffect(() => onReady(), [onReady])
  return null
}

export function Experience({ layout, active, onSelect, onReady }) {
  const { stops, sectionMarks, endZ } = layout
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ fov: 42, near: 0.1, far: 120, position: [0, 2.6, 9.5] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => onSelect(-1)}
    >
      <color attach="background" args={[FOG]} />
      <fog attach="fog" args={[FOG, 30, 115]} />

      <ambientLight intensity={0.35} color="#ffe6c7" />
      <hemisphereLight args={['#fff1dc', '#2a0f10', 0.55]} />

      {/* studio reflections for the gold — generated locally, no HDR download */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff0d8" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[4, 40, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9a8" position={[-6, 3, 0]} rotation-y={Math.PI / 2} scale={[40, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9a8" position={[6, 3, 0]} rotation-y={-Math.PI / 2} scale={[40, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 3, 8]} scale={3} />
      </Environment>

      <Suspense fallback={null}>
        <Hall endZ={endZ} sectionMarks={sectionMarks} />
        {stops.map((stop, i) =>
          stop.kind === 'sculpture' ? (
            <Sculpture key={stop.exhibit.id} exhibit={stop.exhibit} position={stop.position} active={active === i} onSelect={() => onSelect(i)} />
          ) : (
            <group key={stop.exhibit.id} position={stop.position} rotation={stop.rotation}>
              <Framed exhibit={stop.exhibit} size={stop.size} active={active === i} onSelect={() => onSelect(active === i ? -1 : i)} />
            </group>
          ),
        )}
        <Preload all />
        <Ready onReady={onReady} />
      </Suspense>

      <CameraRig stops={stops} active={active} />
    </Canvas>
  )
}
