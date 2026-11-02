import { Component, Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Text, useCursor, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import { keepGoing, step } from './frame'
import { lightWash, paintCertificate, paintPlaceholder } from './textures'
import { FONT_SERIF, FONT_SERIF_ITALIC, GOLD, IVORY, INK } from './theme'
import { asset } from '../asset'

let washTex
const getWash = () => (washTex ??= lightWash())

/** Hover + click handlers shared by every clickable thing in the hall. */
export function useSelectable(onSelect) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  return [
    hovered,
    {
      onClick: (e) => {
        e.stopPropagation()
        onSelect()
      },
      onPointerOver: (e) => {
        e.stopPropagation()
        setHovered(true)
      },
      onPointerOut: () => setHovered(false),
    },
  ]
}

/* ── frame styles ─────────────────────────────────────────── */

const STYLES = {
  default: { border: 0.14, mat: 0.07, lamp: true, wash: true, plaque: true },
  masterpiece: { border: 0.17, mat: 0.08, lamp: true, wash: true, plaque: true, outer: true },
  // a stretched canvas, no frame: for the modern wing
  canvas: { border: 0, mat: 0, lamp: false, wash: false, plaque: true, canvas: true, finish: { color: '#1c1a18', metalness: 0, roughness: 0.85 } },
  certificate: { border: 0.07, mat: 0.09, lamp: true, lampMax: 0.9, wash: true, plaque: true, finish: { color: '#121010', metalness: 0.3, roughness: 0.4 } },
  chronicle: { border: 0.1, mat: 0.06, lamp: false, wash: true, plaque: true },
  salon: { border: 0.09, mat: 0.035, lamp: false, wash: false, plaque: false },
  grand: { border: 0.32, mat: 0.13, lamp: true, lampMax: 3.4, wash: true, plaque: true, outer: true },
}

// the salon is eclectic: every frame a different finish
const SALON_FINISHES = [
  { color: GOLD, metalness: 1, roughness: 0.32 },
  { color: '#3b2416', metalness: 0.1, roughness: 0.5 }, // walnut
  { color: '#121010', metalness: 0.3, roughness: 0.4 }, // ebony
  { color: '#b7b9bd', metalness: 1, roughness: 0.3 }, // silver
  { color: '#a8772f', metalness: 1, roughness: 0.45 }, // old gilt
]
const hashId = (id) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

/* ── canvases ─────────────────────────────────────────────── */

function coverFit(tex, [w, h]) {
  const t = tex.clone()
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  const ia = t.image.width / t.image.height
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
}

/** A real image, never cropped: if its shape differs from the frame it sits matted inside it. */
function ImageSlide({ src, size: [w, h], ...props }) {
  const tex = useTexture(asset(src))
  const map = useMemo(() => {
    const t = tex.clone()
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    t.needsUpdate = true
    return t
  }, [tex])
  const ia = tex.image.width / tex.image.height
  const size = ia > w / h ? [w, w / ia] : [h * ia, h]
  return <Surface map={map} size={size} {...props} />
}

/* ── meme compositing: faces and a divine spark painted onto an artwork ── */

/** A radiant orange spark with a soft heavenly glow, drawn around (0, 0). */
function drawSpark(g, s) {
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, s * 0.75)
  glow.addColorStop(0, 'rgba(255, 248, 232, 1)')
  glow.addColorStop(0.6, 'rgba(255, 242, 220, 0.97)')
  glow.addColorStop(1, 'rgba(255, 232, 200, 0)')
  g.fillStyle = glow
  g.beginPath()
  g.arc(0, 0, s * 0.75, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#d97757'
  g.lineCap = 'round'
  const rays = 12
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2 + 0.13
    const len = s * (i % 2 ? 0.36 : 0.46) * (0.9 + ((i * 37) % 10) / 50)
    g.lineWidth = s * 0.085
    g.beginPath()
    g.moveTo(Math.cos(a) * s * 0.05, Math.sin(a) * s * 0.05)
    g.lineTo(Math.cos(a) * len, Math.sin(a) * len)
    g.stroke()
  }
}

/** Where your face will go: a dashed gilt oval. */
function drawFaceSlot(g, s) {
  g.fillStyle = 'rgba(30, 20, 14, 0.35)'
  g.beginPath()
  g.ellipse(0, 0, s * 0.38, s * 0.5, 0, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = 'rgba(232, 200, 130, 1)'
  g.lineWidth = s * 0.05
  g.setLineDash([s * 0.07, s * 0.05])
  g.beginPath()
  g.ellipse(0, 0, s * 0.38, s * 0.5, 0, 0, Math.PI * 2)
  g.stroke()
  g.setLineDash([])
  g.fillStyle = 'rgba(255, 236, 190, 1)'
  g.font = `700 ${Math.round(s * 0.12)}px Inter, sans-serif`
  g.textAlign = 'center'
  g.fillText('YOUR', 0, -s * 0.02)
  g.fillText('FACE', 0, s * 0.12)
}

/**
 * The base image with overlays painted on top. Each overlay:
 *   { type: 'face', image?, at: [x, y], size, rotate?, mirror? }  — at/size are fractions of the image
 *   { type: 'spark', at, size }
 */
function CompositeSlide({ src, overlays, ...props }) {
  const extra = overlays.filter((o) => o.image).map((o) => o.image)
  const textures = useTexture([src, ...extra].map(asset))
  const map = useMemo(() => {
    const base = textures[0].image
    const c = document.createElement('canvas')
    c.width = base.width
    c.height = base.height
    const g = c.getContext('2d')
    g.drawImage(base, 0, 0)
    let next = 1
    for (const o of overlays) {
      const s = o.size * c.height
      g.save()
      g.translate(o.at[0] * c.width, o.at[1] * c.height)
      g.rotate(((o.rotate ?? 0) * Math.PI) / 180)
      if (o.type === 'spark') drawSpark(g, s)
      else if (o.image) {
        const img = textures[next++].image
        const w = (s * img.width) / img.height
        if (o.mirror) g.scale(-1, 1)
        g.drawImage(img, -w / 2, -s / 2, w, s)
      } else drawFaceSlot(g, s)
      g.restore()
    }
    const tex = new THREE.CanvasTexture(c)
    return coverFit(tex, props.size)
  }, [textures, overlays, props.size])
  return <Surface map={map} {...props} />
}

function PlaceholderSlide({ exhibit, index, count, variant, ...props }) {
  const map = useMemo(
    () =>
      variant === 'certificate'
        ? paintCertificate(exhibit, props.size)
        : count > 1
        ? paintPlaceholder({ ...exhibit, id: `${exhibit.id}-${index}` }, props.size, `SCREENSHOT ${index + 1} OF ${count}`)
        : paintPlaceholder(exhibit, props.size),
    [exhibit, index, count, variant, props.size],
  )
  return <Surface map={map} {...props} />
}

/** One painted surface; fades in when it becomes the current slide. */
function Surface({ map, size: [w, h], visible, z }) {
  const mat = useRef()
  useFrame((state, dt) => keepGoing(state, easing.damp(mat.current, 'opacity', visible ? 1 : 0, 0.25, step(dt))))
  return (
    <mesh position-z={z}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial
        ref={mat}
        map={map}
        emissiveMap={map}
        emissive="#ffffff"
        emissiveIntensity={0.4}
        roughness={0.85}
        transparent
        opacity={visible ? 1 : 0}
      />
    </mesh>
  )
}

/** If an image can't be loaded, say which one and show the placeholder painting instead. */
class Missing extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    console.warn(`Image not found: ${this.props.src} (check the path in data.js and the file in public/)`)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* ── the frame ────────────────────────────────────────────── */

/**
 * A framed work. `slides` is a list of image paths (null = placeholder);
 * `slide` picks the one showing. Variants: default · masterpiece · chronicle · certificate · salon · grand.
 */
export function Framed({ exhibit, size, slides, slide = 0, variant = 'default', active, onSelect }) {
  const style = STYLES[variant] ?? STYLES.default
  const [w, h] = size
  const frame = useRef()
  const [hovered, handlers] = useSelectable(onSelect)
  const list = slides ?? [exhibit.image ?? null]
  const finish = style.finish ?? (variant === 'salon' ? SALON_FINISHES[hashId(exhibit.id) % SALON_FINISHES.length] : SALON_FINISHES[0])

  useFrame((state, dt) => keepGoing(state, easing.damp(frame.current, 'emissiveIntensity', hovered || active ? 0.22 : 0, 0.2, step(dt))))

  const ow = w + style.mat * 2 + style.border * 2
  const oh = h + style.mat * 2 + style.border * 2

  return (
    <group {...handlers}>
      {style.wash && (
        <mesh position={[0, 0.35, 0.004]} raycast={() => null}>
          <planeGeometry args={[ow * 1.9, oh * 1.9]} />
          <meshBasicMaterial map={getWash()} transparent opacity={style.washOpacity ?? 0.4} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {style.outer && (
        <mesh position-z={0.02}>
          <boxGeometry args={[ow + 0.12, oh + 0.12, 0.04]} />
          <meshStandardMaterial color="#7a5a26" metalness={1} roughness={0.4} />
        </mesh>
      )}
      {/* the moulding, or for a canvas, its deep stretcher sides */}
      <mesh position-z={0.03}>
        <boxGeometry args={[ow, oh, style.canvas ? 0.098 : 0.07]} />
        <meshStandardMaterial ref={frame} {...finish} emissive={GOLD} emissiveIntensity={0} />
      </mesh>
      {!style.canvas && (
        <mesh position-z={0.07}>
          <boxGeometry args={[w + style.mat * 2 + 0.05, h + style.mat * 2 + 0.05, 0.016]} />
          <meshStandardMaterial color={finish.color} metalness={finish.metalness} roughness={finish.roughness + 0.1} />
        </mesh>
      )}
      <mesh position-z={0.08}>
        <planeGeometry args={[w + style.mat * 2, h + style.mat * 2]} />
        <meshStandardMaterial color={IVORY} roughness={0.9} />
      </mesh>
      {list.map((src, i) => {
        const props = { size, visible: i === slide % list.length, z: 0.084 + i * 0.0006 }
        const placeholder = <PlaceholderSlide exhibit={exhibit} index={i} count={list.length} variant={variant} {...props} />
        if (!src) return <group key={i}>{placeholder}</group>
        // real pictures stream in on their own (the hall never waits for them),
        // and a wrong path shows the placeholder instead of breaking the museum
        return (
          <Missing key={i} src={src} fallback={placeholder}>
            <Suspense fallback={null}>
              {exhibit.overlays?.length && i === 0 ? <CompositeSlide src={src} overlays={exhibit.overlays} {...props} /> : <ImageSlide src={src} {...props} />}
            </Suspense>
          </Missing>
        )
      })}

      {style.lamp && (
        <group position={[0, oh / 2 + 0.12, 0.18]}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.035, 0.035, Math.min(ow * 0.55, style.lampMax ?? 1.4), 24]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.03, 0]} rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.012, 0.012, Math.min(ow * 0.5, (style.lampMax ?? 1.4) - 0.1), 12]} />
            <meshBasicMaterial color="#fff1d6" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0.05, -0.09]} rotation-x={0.9}>
            <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
            <meshStandardMaterial color={GOLD} metalness={1} roughness={0.3} />
          </mesh>
        </group>
      )}

      {style.plaque && <Plaque exhibit={exhibit} position={[ow / 2 + 0.42, -Math.min(0.35, oh / 2 - 0.2), 0.015]} />}
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
        {`${exhibit.year}\n${exhibit.medium ?? ''}`}
      </Text>
    </group>
  )
}
