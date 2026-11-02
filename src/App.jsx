import { useCallback, useEffect, useMemo, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { centerpiece, finale, owner, sections } from './data'
import { buildLayout } from './scene/layout'
import { Experience } from './scene/Experience'

const pad = (n) => String(n).padStart(2, '0')

function Intro({ ready, onEnter }) {
  const { progress } = useProgress()
  return (
    <div className="intro">
      <div className="intro__frame">
        <p className="eyebrow">{owner.established} · Admission free</p>
        <h1 className="intro__title">
          <span>The</span> {owner.collection.replace(/^The /, '')}
        </h1>
        <div className="rule" />
        <p className="intro__tagline">{owner.tagline}</p>
        <button className="btn btn--solid" onClick={onEnter} disabled={!ready}>
          {ready ? 'Enter the Gallery' : `Hanging the paintings… ${Math.round(Math.min(progress, 99))}%`}
        </button>
        <p className="intro__note">Best enjoyed with a cup of tea and low expectations</p>
      </div>
    </div>
  )
}

function Label({ stop, index, total, onClose }) {
  const { exhibit, section } = stop
  return (
    <aside className="label" key={exhibit.id}>
      <button className="label__close" onClick={onClose} aria-label="Step back">
        ×
      </button>
      <p className="eyebrow">
        {section.numeral && `${section.numeral} · `}
        {section.title}
        <span className="label__no">No. {pad(index + 1)} / {pad(total)}</span>
      </p>
      <h2 className="label__title">{exhibit.title}</h2>
      <p className="label__meta">
        {owner.name}, {exhibit.year}
      </p>
      <p className="label__medium">{exhibit.medium}</p>
      <div className="rule rule--left" />
      <p className="label__desc">{exhibit.description}</p>
      {exhibit.tags?.length > 0 && (
        <ul className="tags">
          {exhibit.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
      {exhibit.links?.length > 0 && (
        <div className="links">
          {exhibit.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
              {l.label} <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      )}
    </aside>
  )
}

function Catalogue({ stops, onPick, onClose }) {
  const groups = []
  stops.forEach((s, i) => {
    const last = groups[groups.length - 1]
    if (last && last.section === s.section) last.items.push([s, i])
    else groups.push({ section: s.section, items: [[s, i]] })
  })
  return (
    <div className="catalogue" onClick={onClose}>
      <div className="catalogue__inner" onClick={(e) => e.stopPropagation()}>
        <button className="label__close" onClick={onClose} aria-label="Close catalogue">
          ×
        </button>
        <p className="eyebrow">Catalogue of the collection</p>
        <h2 className="catalogue__title">{owner.collection}</h2>
        <div className="rule" />
        {groups.map((g) => (
          <section key={g.section.title} className="catalogue__group">
            <h3>
              {g.section.numeral && <span>{g.section.numeral}</span>} {g.section.title}
            </h3>
            <ol>
              {g.items.map(([s, i]) => (
                <li key={s.exhibit.id}>
                  <button onClick={() => onPick(i)}>
                    <span className="catalogue__no">{pad(i + 1)}</span>
                    <span className="catalogue__name">{s.exhibit.title}</span>
                    <span className="catalogue__dots" />
                    <span className="catalogue__year">{s.exhibit.year}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const layout = useMemo(() => buildLayout({ sections, centerpiece, finale }), [])
  const { stops } = layout
  // deep links: /#project-1 opens that work, /#hall skips the intro
  const initial = useMemo(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return null
    return id === 'hall' ? -1 : stops.findIndex((s) => s.exhibit.id === id)
  }, [stops])
  const [entered, setEntered] = useState(initial !== null)
  const [active, setActive] = useState(initial ?? -1)
  const [catalogue, setCatalogue] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    // painted placeholders use the web fonts, so wait for them
    Promise.all([
      document.fonts.load('italic 500 40px "Cormorant Garamond"'),
      document.fonts.load('500 20px Inter'),
    ]).finally(() => setFontsReady(true))
  }, [])

  const go = useCallback(
    (dir) => setActive((a) => (a < 0 ? (dir > 0 ? 0 : stops.length - 1) : (a + dir + stops.length) % stops.length)),
    [stops.length],
  )

  useEffect(() => {
    if (!entered) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1)
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1)
      else if (e.key === 'Escape') catalogue ? setCatalogue(false) : setActive(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered, go, catalogue])

  useEffect(() => {
    if (!entered) return
    const hash = active >= 0 ? `#${stops[active].exhibit.id}` : ''
    window.history.replaceState(null, '', hash || window.location.pathname)
  }, [active, entered, stops])

  const stop = active >= 0 ? stops[active] : null

  return (
    <>
      {fontsReady && <Experience layout={layout} active={entered ? active : -1} onSelect={(i) => entered && setActive(i)} onReady={() => setSceneReady(true)} />}
      <div className="vignette" />
      <div className="grain" />

      {!entered && <Intro ready={sceneReady} onEnter={() => setEntered(true)} />}

      {entered && (
        <div className="hud">
          <header className="brand">
            <span className="brand__mark">✦</span>
            <div>
              <div className="brand__name">{owner.collection}</div>
              <div className="brand__sub">{owner.established}</div>
            </div>
          </header>

          <div className="hud__actions">
            {stop && (
              <button className="btn btn--ghost btn--back" onClick={() => setActive(-1)}>
                Step back
              </button>
            )}
            <button className="btn btn--ghost" onClick={() => setCatalogue(true)}>
              Catalogue
            </button>
          </div>

          <nav className={`tour ${stop ? 'tour--focus' : ''}`}>
            {stop ? (
              <>
                <button className="tour__arrow" onClick={() => go(-1)} aria-label="Previous work">
                  ←
                </button>
                <span className="tour__where">
                  <em>No. {pad(active + 1)}</em> {stop.section.title}
                </span>
                <button className="tour__arrow" onClick={() => go(1)} aria-label="Next work">
                  →
                </button>
              </>
            ) : (
              <>
                <button className="btn btn--solid" onClick={() => setActive(0)}>
                  Begin the tour
                </button>
                <span className="tour__hint">or click any work · ← → to stroll · Esc to step back</span>
              </>
            )}
          </nav>

          {stop && <Label stop={stop} index={active} total={stops.length} onClose={() => setActive(-1)} />}
        </div>
      )}

      {catalogue && (
        <Catalogue
          stops={stops}
          onClose={() => setCatalogue(false)}
          onPick={(i) => {
            setCatalogue(false)
            setActive(i)
          }}
        />
      )}
    </>
  )
}
