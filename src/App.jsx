import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import * as collection from './data'
import { buildLayout } from './scene/layout'
import { asset } from './asset'
// three.js is most of the download: fetch it while the intro is already on screen
const loadScene = () => import('./scene/Experience')
loadScene()
const Experience = lazy(() => loadScene().then((m) => ({ default: m.Experience })))

const { owner } = collection
const pad = (n) => String(n).padStart(2, '0')

/** Every picture the hall will hang (the first slide decides a project frame's shape). */
const imagePaths = () =>
  [
    ...collection.education.entries.map((e) => e.image),
    ...collection.certificates.items.map((c) => c.image),
    ...collection.experience.entries.map((e) => e.image),
    ...collection.projects.items.map((p) => p.images?.[0]),
    collection.masterpiece.image,
  ].filter(Boolean)

/** Measures images (width / height) so every frame is cut to fit its picture. A missing image just gets the default shape. */
function useImageAspects() {
  const [aspects, setAspects] = useState(null)
  useEffect(() => {
    const paths = [...new Set(imagePaths())]
    Promise.all(
      paths.map(
        (src) =>
          new Promise((done) => {
            const img = new Image()
            img.onload = () => done([src, img.naturalWidth / img.naturalHeight])
            img.onerror = () => done([src, undefined])
            img.src = asset(src)
          }),
      ),
    ).then((pairs) => setAspects(Object.fromEntries(pairs.filter(([, a]) => a))))
  }, [])
  return aspects
}

function Intro({ ready, progress, onEnter }) {
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

/* ── the info panel ─────────────────────────────────────────
 * The hall is the luxury; the panel is the tool: dark glass, plain type,
 * a sticky header and footer, and it folds down to a title bar when you just want to look.
 */

const Icon = {
  prev: <path d="M10 3 5 8l5 5" />,
  next: <path d="m6 3 5 5-5 5" />,
  fold: <path d="m4 6 4 4 4-4" />,
  unfold: <path d="m4 10 4-4 4 4" />,
  close: <path d="m4 4 8 8M12 4l-8 8" />,
  out: <path d="M6 4h6v6M12 4 5 11" />,
}
const Svg = ({ d }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
)

/** 'mailto:a@b.com' → 'a@b.com', 'https://www.github.com/x' → 'github.com/x' */
const pretty = (href) => href.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

function Panel({ kicker, count, title, sub, folded, setFolded, onClose, footer, className = '', children }) {
  return (
    <aside className={`panel ${folded ? 'is-folded' : ''} ${className}`} aria-label={title}>
      <header className="panel__head">
        <div className="panel__bar">
          <span className="panel__kicker">{kicker}</span>
          {count && <span className="panel__count">{count}</span>}
          <button className="panel__tool" onClick={() => setFolded((f) => !f)} aria-expanded={!folded} aria-label={folded ? 'Show details' : 'Hide details'}>
            <Svg d={folded ? Icon.unfold : Icon.fold} />
          </button>
          <button className="panel__tool" onClick={onClose} aria-label="Step back">
            <Svg d={Icon.close} />
          </button>
        </div>
        <h2 className="panel__title" onClick={() => folded && setFolded(false)}>
          {title}
        </h2>
        {sub && !folded && <p className="panel__sub">{sub}</p>}
      </header>
      {!folded && (
        <>
          <div className="panel__body">{children}</div>
          {footer && <footer className="panel__foot">{footer}</footer>}
        </>
      )}
    </aside>
  )
}

function Slides({ count, slide, setSlide }) {
  if (count < 2) return null
  return (
    <div className="slides" role="group" aria-label="Screenshots">
      <button onClick={() => setSlide((s) => (s - 1 + count) % count)} aria-label="Previous image">
        <Svg d={Icon.prev} />
      </button>
      <div className="slides__dots">
        {Array.from({ length: count }, (_, i) => (
          <button key={i} className={i === slide ? 'is-on' : ''} onClick={() => setSlide(i)} aria-label={`Image ${i + 1}`} />
        ))}
      </div>
      <span className="slides__count">
        {String(slide + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </span>
      <button onClick={() => setSlide((s) => (s + 1) % count)} aria-label="Next image">
        <Svg d={Icon.next} />
      </button>
    </div>
  )
}

function Links({ links }) {
  if (!links?.length) return null
  return links.map((l, i) => (
    <a key={l.href} className={`link-btn ${i === 0 ? 'link-btn--primary' : ''}`} href={l.href} target="_blank" rel="noreferrer">
      {l.label} <Svg d={Icon.out} />
    </a>
  ))
}

const Chips = ({ items }) =>
  items?.length > 0 && (
    <ul className="chips">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  )

const TABS = ['About', 'Skills', 'Contact']

/** The statue's panel: who you are, what you work with, how to reach you — one tab at a time. */
function AboutLabel({ exhibit, folded, setFolded, onClose }) {
  const [tab, setTab] = useState('About')
  return (
    <Panel
      className="panel--about"
      kicker="The Rotunda · About"
      title={owner.name}
      sub={exhibit.role}
      folded={folded}
      setFolded={setFolded}
      onClose={onClose}
      footer={<Links links={exhibit.links} />}
    >
      <div className="segmented" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="tabpanel" key={tab} role="tabpanel">
        {tab === 'About' && (
          <>
            <p className="panel__quote">{exhibit.artwork}</p>
            <dl className="facts">
              <div>
                <dt>Based in</dt>
                <dd>{exhibit.location}</dd>
              </div>
            </dl>
            <p className="panel__desc">{exhibit.profile}</p>
            {exhibit.credit && <p className="panel__credit">{exhibit.credit}</p>}
          </>
        )}

        {tab === 'Skills' && (
          <dl className="skills">
            {exhibit.skills.map((g) => (
              <div key={g.group}>
                <dt>{g.group}</dt>
                <dd>
                  <Chips items={g.items} />
                </dd>
              </div>
            ))}
          </dl>
        )}

        {tab === 'Contact' && (
          <ul className="contact">
            {exhibit.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noreferrer">
                  <span>{l.label}</span>
                  <code>{pretty(l.href)}</code>
                  <Svg d={Icon.out} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  )
}

function Label({ stop, number, total, slide, setSlide, folded, setFolded, onClose }) {
  const { exhibit, section } = stop
  if (stop.kind === 'sculpture') return <AboutLabel exhibit={exhibit} folded={folded} setFolded={setFolded} onClose={onClose} />
  return (
    <Panel
      key={exhibit.id}
      kicker={`${section.numeral ? `${section.numeral} · ` : ''}${section.title}`}
      count={number > 0 ? `${pad(number)}/${pad(total)}` : null}
      title={exhibit.title}
      sub={exhibit.by ?? owner.name}
      folded={folded}
      setFolded={setFolded}
      onClose={onClose}
      footer={exhibit.links?.length ? <Links links={exhibit.links} /> : null}
    >
      {exhibit.year && <p className="panel__when">{exhibit.year}</p>}
      <Slides count={stop.slides?.length ?? 0} slide={slide} setSlide={setSlide} />
      {exhibit.description && <p className="panel__desc">{exhibit.description}</p>}
      {exhibit.details?.length > 0 && (
        <ul className="details">
          {exhibit.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      <Chips items={exhibit.tags} />
      {exhibit.medium && <p className="panel__quote">“{exhibit.medium}”</p>}
      {exhibit.credit && <p className="panel__credit">{exhibit.credit}</p>}
    </Panel>
  )
}

function Catalogue({ stops, tour, onPick, onClose }) {
  const groups = []
  stops.forEach((s, i) => {
    const zone = s.zone ?? s.section
    const last = groups[groups.length - 1]
    if (last && last.section === zone) last.items.push([s, i])
    else groups.push({ section: zone, items: [[s, i]] })
  })
  return (
    <div className="catalogue" onClick={onClose}>
      <div className="catalogue__inner" onClick={(e) => e.stopPropagation()}>
        <button className="catalogue__close" onClick={onClose} aria-label="Close catalogue">
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
                    <span className="catalogue__no">{tour.includes(i) ? pad(tour.indexOf(i) + 1) : '·'}</span>
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
  const aspects = useImageAspects()
  // the layout never depends on the images loading (ids and order are the same either way)
  const layout = useMemo(() => buildLayout(collection, aspects ?? {}), [aspects])
  const { stops } = layout
  const tour = useMemo(() => stops.flatMap((s, i) => (s.tour ? [i] : [])), [stops])
  // deep links: /#project-1 opens that work, /#hall skips the intro
  const initial = useMemo(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return null
    return id === 'hall' ? -1 : stops.findIndex((s) => s.exhibit.id === id)
  }, [stops])
  const [entered, setEntered] = useState(initial !== null)
  const [active, setActive] = useState(initial ?? -1)
  const [catalogue, setCatalogue] = useState(false)
  const [slide, setSlide] = useState(0)
  const [fontsReady, setFontsReady] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const [progress, setProgress] = useState(0)
  // the panel can fold down to its title bar; the choice sticks as you stroll
  const [folded, setFolded] = useState(false)

  useEffect(() => {
    // painted placeholders use the web fonts, so wait for them
    Promise.all([
      document.fonts.load('italic 500 40px "Cormorant Garamond"'),
      document.fonts.load('500 20px Inter'),
    ]).finally(() => setFontsReady(true))
  }, [])

  // the tour visits every stop except individual salon frames
  const go = useCallback(
    (dir) =>
      setActive((a) => {
        if (a < 0) return dir > 0 ? tour[0] : tour[tour.length - 1]
        if (dir > 0) return tour.find((i) => i > a) ?? tour[0]
        return tour.findLast((i) => i < a) ?? tour[tour.length - 1]
      }),
    [tour],
  )

  // project slides: start from the first, then advance gently on their own
  const slideCount = active >= 0 ? (stops[active].slides?.length ?? 0) : 0
  useEffect(() => setSlide(0), [active])
  useEffect(() => {
    if (slideCount < 2) return
    const t = setInterval(() => setSlide((s) => (s + 1) % slideCount), 5000)
    return () => clearInterval(t)
  }, [slideCount, slide])

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
      {fontsReady && aspects && (
        <Suspense fallback={null}>
          <Experience
            layout={layout}
            active={entered ? active : -1}
            slide={slide}
            onSelect={(i) => entered && setActive(i)}
            onReady={() => setSceneReady(true)}
            onProgress={setProgress}
            panelOpen={!folded}
          />
        </Suspense>
      )}
      <div className={`vignette ${stop?.variant === 'canvas' ? 'vignette--light' : ''}`} />
      <div className="grain" />

      {!entered && <Intro ready={sceneReady} progress={progress} onEnter={() => setEntered(true)} />}

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
                  {stop.tour && <em>No. {pad(tour.indexOf(active) + 1)}</em>} {(stop.zone ?? stop.section).title}
                </span>
                <button className="tour__arrow" onClick={() => go(1)} aria-label="Next work">
                  →
                </button>
              </>
            ) : (
              <>
                <button className="btn btn--solid" onClick={() => setActive(tour[0])}>
                  Begin the tour
                </button>
                <span className="tour__hint">or click any work · ← → to stroll · Esc to step back</span>
              </>
            )}
          </nav>

          {stop && (
            <Label
              stop={stop}
              number={stop.tour ? tour.indexOf(active) + 1 : 0}
              total={tour.length}
              slide={slide}
              setSlide={setSlide}
              folded={folded}
              setFolded={setFolded}
              onClose={() => setActive(-1)}
            />
          )}
        </div>
      )}

      {catalogue && (
        <Catalogue
          stops={stops}
          tour={tour}
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
