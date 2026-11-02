# The Feifxi Collection

A 3D portfolio disguised as a very serious museum. React + React Three Fiber, frontend only.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ — deploy anywhere (Vercel, Netlify, GitHub Pages)
```

## Curating the museum

| What | Where |
|---|---|
| All content (skills, academic, experience, competitions, projects, contact) | `src/data.js` |
| Your images / memes | drop into `public/art/`, then `image: '/art/file.jpg'` in `data.js` |
| Your face on the bust | transparent PNG → `centerpiece.face: '/art/face.png'` |
| Wall colour & palette | `src/scene/theme.js` |
| CV for the "Gift Shop" | `public/cv.pdf` |

Exhibits without an `image` get a generated abstract placeholder painting.
Sections are laid out down the hall automatically, so adding or removing exhibits just works.

**Deep links:** `/#project-1` opens that exhibit directly (the id from `data.js`); `/#hall` skips the intro.
**Controls:** click a work · ← → to stroll · Esc to step back · *Catalogue* for a plain list.
