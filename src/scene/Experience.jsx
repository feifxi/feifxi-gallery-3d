import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, Preload, useProgress } from '@react-three/drei'
import { Hall } from './Hall'
import { Framed } from './Exhibit'
import { Centerpiece } from './Statue'
import { Bench, ChronicleRail, Stanchions, Trophy, TrophyLight } from './Displays'
import { CameraRig } from './CameraRig'
import { FOG } from './theme'

function Ready({ onReady }) {
  useEffect(() => onReady(), [onReady])
  return null
}

function Progress({ onProgress }) {
  const { progress } = useProgress()
  useEffect(() => onProgress?.(progress), [progress, onProgress])
  return null
}

/*
 * Quality ladder, best first. A phone or small laptop starts a few rungs down;
 * if frames still take too long while moving, we step down one rung at a time.
 * The mirror floor is the last thing to go: it is most of the mood.
 */
const DEVICE_DPR = Math.min(window.devicePixelRatio || 1, 2)
const LADDER = [
  { dpr: DEVICE_DPR, reflect: true },
  { dpr: Math.min(DEVICE_DPR, 1.5), reflect: true },
  { dpr: Math.min(DEVICE_DPR, 1.25), reflect: true },
  { dpr: 1, reflect: true },
  { dpr: 1, reflect: false },
]
const modest =
  window.matchMedia?.('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4 || (navigator.deviceMemory ?? 8) <= 4
const START = modest ? 1 : 0

/** Watches real frame times (only while things move — idle gaps are ignored) and steps down if slow. */
function AdaptiveQuality({ rung, setRung }) {
  const samples = useRef([])
  useFrame((_, dt) => {
    if (dt > 0.1) return // the canvas was resting, not struggling
    const s = samples.current
    s.push(dt)
    if (s.length < 90) return
    const sorted = [...s].sort((a, b) => a - b)
    const median = sorted[s.length >> 1]
    samples.current = []
    if (median > 1 / 45 && rung < LADDER.length - 1) setRung(rung + 1)
  })
  return null
}

/** Renders one exhibit in whatever form its section calls for. */
function Stop({ stop, active, slide, onSelect }) {
  const props = { exhibit: stop.exhibit, active, onSelect }
  switch (stop.kind) {
    case 'sculpture':
      return <Centerpiece {...props} position={stop.position} />
    case 'trophy':
      return <Trophy {...props} position={stop.position} rotation={stop.rotation} />
    case 'frame':
      return (
        <group position={stop.position} rotation={stop.rotation}>
          <Framed {...props} size={stop.size} slides={stop.slides} slide={slide} variant={stop.variant} />
        </group>
      )
    default:
      return null // e.g. a salon wall: only a viewpoint
  }
}

export function Experience({ layout, active, slide, onSelect, onReady, onProgress, panelOpen = true }) {
  const { stops, sectionMarks, endZ, rails, wings, arches, finale } = layout
  const [rung, setRung] = useState(START)
  const quality = LADDER[rung]
  return (
    <Canvas
      shadows
      frameloop="demand"
      dpr={quality.dpr}
      camera={{ fov: 42, near: 0.1, far: 200, position: [0, 2.6, 9.5] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => onSelect(-1)}
    >
      <color attach="background" args={[FOG]} />
      <fog attach="fog" args={[FOG, 40, 170]} />

      <ambientLight intensity={0.35} color="#ffe6c7" />
      <hemisphereLight args={['#fff1dc', '#2a0f10', 0.55]} />

      {/* studio reflections for the gold — generated locally, no HDR download */}
      <Environment resolution={256} frames={1}>
        {/* a warm, dim room all around, so metals never reflect pure black */}
        <mesh scale={50}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#4a2a1e" side={THREE.BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={3} color="#fff0d8" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[4, 40, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9a8" position={[-6, 3, 0]} rotation-y={Math.PI / 2} scale={[40, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd9a8" position={[6, 3, 0]} rotation-y={-Math.PI / 2} scale={[40, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 3, 8]} scale={3} />
      </Environment>

      <Suspense fallback={null}>
        <Hall endZ={endZ} sectionMarks={sectionMarks} wings={wings} arches={arches} reflect={quality.reflect} />
        {rails.map((r) => (
          <ChronicleRail key={r.start} {...r} />
        ))}
        <Stanchions z={finale.z + 2.2} />
        <Bench position={[0, 0, finale.z + 6]} />
        <TrophyLight trophies={stops.filter((s) => s.kind === 'trophy')} />
        {stops.map((stop, i) => (
          <Stop key={stop.exhibit.id} stop={stop} active={active === i} slide={active === i ? slide : 0} onSelect={() => onSelect(active === i ? -1 : i)} />
        ))}
        <Preload all />
        <Ready onReady={onReady} />
      </Suspense>

      <CameraRig stops={stops} active={active} panelOpen={panelOpen} />
      <AdaptiveQuality rung={rung} setRung={setRung} />
      <Progress onProgress={onProgress} />
    </Canvas>
  )
}
