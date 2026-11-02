/**
 * ─────────────────────────────────────────────────────────────
 *  THE COLLECTION — edit this file to curate your museum.
 * ─────────────────────────────────────────────────────────────
 *
 *  Every exhibit is written like a real museum wall label:
 *
 *    title        Name of the work
 *    year         When it happened ("2024", "2022 – 2024")
 *    medium       The "materials". Make it pompous: "TypeScript on canvas"
 *    description  The curator's note
 *    tags         Optional list (skills, tech, awards…)
 *    links        Optional [{ label, href }]
 *    image        Optional path inside /public, e.g. "/art/my-meme.jpg".
 *                 Without one, an elegant placeholder canvas is painted.
 *    aspect       Optional width / height of the frame (default 0.8).
 *                 Images are cropped to fit ("cover").
 */

export const owner = {
  name: 'Feifxi',
  collection: 'The Feifxi Collection',
  tagline: 'A permanent exhibition of works, skills & questionable memes',
  established: 'Est. 2026',
}

/** The statue in the rotunda. `face` = a transparent PNG of your face, e.g. "/art/face.png" */
export const centerpiece = {
  id: 'bust',
  title: 'Bust of the Artist',
  year: '2026',
  medium: 'Carrara marble, unearned confidence',
  description:
    'Commissioned by the artist, of the artist, for the artist. Scholars agree the resemblance is uncanny. Please do not touch — it is load-bearing ego.',
  tags: ['About me', 'Full-stack developer'],
  face: null,
}

export const sections = [
  {
    id: 'skills',
    numeral: 'I',
    title: 'Hall of Skills',
    exhibits: [
      {
        id: 'frontend',
        title: 'Study of the Frontend',
        year: 'Ongoing',
        medium: 'React, TypeScript & CSS on canvas',
        description:
          'A meticulous study of components, state and the eternal struggle of centering a div.',
        tags: ['React', 'TypeScript', 'Three.js', 'Tailwind'],
      },
      {
        id: 'backend',
        title: 'The Backend, Unseen',
        year: 'Ongoing',
        medium: 'Node.js, SQL, mild sleep deprivation',
        description: 'Like all great foundations, nobody looks at it until it breaks.',
        tags: ['Node.js', 'PostgreSQL', 'REST', 'Docker'],
      },
      {
        id: 'tools',
        title: 'Still Life with Terminal',
        year: 'Ongoing',
        medium: 'Git, Linux, coffee',
        description: 'The tools of the trade, arranged in the classical manner.',
        tags: ['Git', 'Linux', 'Figma', 'CI/CD'],
        aspect: 1.25,
      },
    ],
  },
  {
    id: 'academic',
    numeral: 'II',
    title: 'The Academic Wing',
    exhibits: [
      {
        id: 'degree',
        title: 'Portrait of a Bachelor',
        year: '2021 – 2025',
        medium: 'Ink on diploma, four years of lectures',
        description: 'B.Sc. in Computer Science — Your University. Replace me with your real degree.',
        tags: ['GPA 3.xx', 'Computer Science'],
      },
      {
        id: 'thesis',
        title: 'The Thesis',
        year: '2025',
        medium: 'LaTeX on paper',
        description: 'Your senior project or thesis. 87 pages, 3 readers, 1 of them was my mom.',
        tags: ['Research'],
        aspect: 1.2,
      },
    ],
  },
  {
    id: 'experience',
    numeral: 'III',
    title: 'Gallery of Experience',
    exhibits: [
      {
        id: 'job-1',
        title: 'The Internship',
        year: '2024',
        medium: 'Pull requests on production',
        description: 'Software Engineer Intern at Company Name. What you built, shipped and learned.',
        tags: ['React', 'Node.js'],
      },
      {
        id: 'job-2',
        title: 'Junior, Ascending',
        year: '2025 – Present',
        medium: 'Jira tickets on oak',
        description: 'Your current role. Impact, numbers, the good stuff.',
        tags: ['Full-stack'],
        aspect: 1.25,
      },
    ],
  },
  {
    id: 'competitions',
    numeral: 'IV',
    title: 'The Trophy Room',
    exhibits: [
      {
        id: 'hackathon',
        title: 'The Hackathon at Dawn',
        year: '2024',
        medium: '36 hours, energy drinks on canvas',
        description: '1st place at Some Hackathon. What you built in a weekend that impressed the judges.',
        tags: ['🥇 Winner'],
      },
      {
        id: 'contest',
        title: 'Allegory of the Algorithm',
        year: '2023',
        medium: 'C++ under time pressure',
        description: 'Finalist in a programming contest. Replace with yours.',
        tags: ['Finalist'],
      },
    ],
  },
  {
    id: 'projects',
    numeral: 'V',
    title: 'Modern Works',
    exhibits: [
      {
        id: 'project-1',
        title: 'This Very Museum',
        year: '2026',
        medium: 'React Three Fiber on WebGL',
        description: 'A 3D portfolio disguised as a museum, disguised as a joke. You are standing in it.',
        tags: ['React', 'Three.js'],
        links: [{ label: 'Source code', href: 'https://github.com/' }],
        aspect: 1.4,
      },
      {
        id: 'project-2',
        title: 'Untitled App No. 2',
        year: '2025',
        medium: 'Next.js & PostgreSQL',
        description: 'Short description of a project you are proud of.',
        tags: ['Next.js', 'PostgreSQL'],
        links: [{ label: 'Live demo', href: 'https://example.com' }],
      },
      {
        id: 'project-3',
        title: 'The Side Project',
        year: '2024',
        medium: 'Weekend & good intentions',
        description: 'Every artist has an unfinished masterpiece. This is mine.',
        tags: ['Python'],
      },
    ],
  },
]

/** The large work on the far wall — contact & CV. */
export const finale = {
  id: 'contact',
  title: 'Exit Through the Gift Shop',
  year: 'Open daily',
  medium: 'Email, CV & social media',
  description:
    'Thank you for visiting. Souvenirs available below: one slightly-used developer, available for hire.',
  tags: ['Open to work'],
  links: [
    { label: 'Email', href: 'mailto:you@example.com' },
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/' },
    { label: 'Download CV', href: '/cv.pdf' },
  ],
  aspect: 1.5,
}
