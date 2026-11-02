/**
 * ─────────────────────────────────────────────────────────────
 *  THE COLLECTION — edit this file to curate your museum.
 * ─────────────────────────────────────────────────────────────
 *
 *  The hall, from entrance to back wall:
 *
 *    about        the statue at the entrance: who you are, contact, skills
 *    education    I   · a timeline
 *    experience   II  · a timeline
 *    trophies     III · cups on pedestals
 *    projects     IV  · big frames with screenshot slides
 *    masterpiece  the giant meme on the back wall
 *
 *  Common fields: title, medium (the pompous "materials" line),
 *  description, details: [], tags: [], links: [{ label, href }].
 *  Images go in /public/art/ and are referenced as '/art/name.jpg';
 *  anything without one gets a generated placeholder painting.
 *  Dates are 'YYYY-MM' (or just 'YYYY'); `end` can be 'present'.
 */

export const owner = {
  name: 'Suchai Cholchaipaisal',
  collection: 'The Feifxi Collection',
  tagline: 'A permanent exhibition of works, skills & questionable memes',
  established: 'Est. 2026',
}

/* ── The statue at the entrance: everything important about you ── */
export const about = {
  id: 'about',
  artwork: 'The Discus Thrower (Self-Portrait)', // shown on the plinth plaque
  year: 'c. 450 BC – 2026',
  medium: 'Marble, Java, Go and unearned confidence',
  role: 'Information Technology student · Software engineer',
  location: 'Bangkok, Thailand',
  profile:
    'Information Technology student passionate about software development and scalable applications. Experienced in Java Spring Boot, Golang and Next.js, with projects spanning real-time chat apps and e-commerce platforms. Seeking a software engineering internship to apply technical skills in real-world environments.',
  links: [
    { label: 'Email', href: 'mailto:suchai.cholchaipaisal@gmail.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/suchai-cholchaipaisal' },
    { label: 'GitHub', href: 'https://github.com/feifxi' },
    // { label: 'Download CV', href: '/cv.pdf' },  ← put your CV in /public and uncomment
  ],
  skills: [
    { group: 'Frontend', items: ['React', 'Next.js', 'Vue.js', 'JavaScript', 'TypeScript'] },
    { group: 'Backend', items: ['Java · Spring Boot', 'JPA / Hibernate', 'Go · Gin, Fiber, GORM', 'Node.js · Express', 'Prisma'] },
    { group: 'Databases', items: ['MySQL', 'PostgreSQL', 'MongoDB'] },
    { group: 'DevOps & Tools', items: ['Git', 'Docker', 'Nginx'] },
    { group: 'Testing', items: ['Postman', 'Playwright'] },
    { group: 'Other', items: ['REST API design', 'WebSockets'] },
  ],
  credit: 'Statue scan: SMK – National Gallery of Denmark (KAS1549), public domain',
  statue: {
    model: '/models/discobolus.glb',
    height: 2.4, // metres; the Roman marble is ~1.55 m, museum halls use heroic-scale casts
    rotation: 0,
    face: null, // { image: '/art/face.png', position: [x, y, z], size: 0.26 }
  },
  face: null, // used by the fallback bust if the statue can't load
}

/* ── I · Education ────────────────────────────────────────── */
export const education = {
  numeral: 'I',
  title: 'The Academic Wing',
  entries: [
    {
      // MOCK
      id: 'high-school',
      start: '2017',
      end: '2023',
      title: 'Science–Mathematics Programme',
      org: 'Your High School',
      medium: 'Calculus, chalk dust and a first "Hello, World"',
      description: 'Where the obsession with computers began.',
      details: ['Joined the computer club and built a first website.', 'Represented the school in a regional science fair.'],
      tags: ['Science–Math'],
    },
    {
      id: 'kmutt',
      start: '2023',
      end: '2027',
      title: 'B.Sc. Information Technology',
      org: "King Mongkut's University of Technology Thonburi",
      medium: 'Lectures, deadlines and instant noodles',
      description: 'Bangkok, Thailand. Currently in 3rd year, expected to graduate in 2027.',
      details: [
        'GPAX 3.79',
        'Coursework: Software Engineering, Data Structures & Algorithms, Database Systems, Computer Networks, DevOps, Security',
      ],
      tags: ['GPAX 3.79', 'Expected 2027'],
    },
    {
      // MOCK
      id: 'exchange',
      start: '2026-01',
      end: '2026-05',
      title: 'Exchange Semester, Computer Science',
      org: 'A Partner University',
      medium: 'Passport stamps on transcript',
      description: 'One semester abroad studying distributed systems and HCI.',
      details: ['Coursework: Distributed Systems, Human–Computer Interaction.', 'Team project with students from four countries.'],
      tags: ['Distributed Systems', 'HCI'],
    },
  ],
}

/* ── II · Certificates & tests — hung like diplomas, newest last ── */
// `date` is 'YYYY-MM' or 'YYYY'; `score` is optional (shown on the certificate and the label)
export const certificates = {
  numeral: 'II',
  title: 'The Hall of Diplomas',
  items: [
    {
      // MOCK
      id: 'cert-cloud',
      date: '2024-11',
      title: 'Microsoft Azure Fundamentals',
      org: 'Microsoft (AZ-900)',
      medium: 'Exam paper and cloud-shaped dreams',
      description: 'Core cloud concepts, Azure services, security and pricing.',
      tags: ['Azure', 'Cloud'],
      // links: [{ label: 'Verify credential', href: 'https://learn.microsoft.com/...' }],
    },
    {
      // MOCK: put your real test here (IELTS, TOEIC, TOEFL…)
      id: 'english-test',
      date: '2025-03',
      title: 'IELTS Academic',
      org: 'British Council',
      score: 'Overall Band 7.0',
      medium: 'Four skills, one very quiet exam room',
      description: 'Listening 7.5 · Reading 7.0 · Writing 6.5 · Speaking 7.0',
      tags: ['English', 'Band 7.0'],
    },
  ],
}

/* ── III · Working experience ──────────────────────────────── */
export const experience = {
  numeral: 'III',
  title: 'Gallery of Experience',
  entries: [
    {
      // MOCK
      id: 'student-club',
      start: '2023-10',
      end: '2024-05',
      title: 'Web Developer, Student Club',
      org: 'KMUTT IT Student Club',
      medium: 'Volunteer hours and free pizza',
      description: 'Built and maintained the club website and event registration system.',
      details: ['Built an event registration site used by 600+ students.', 'Set up GitHub Actions to deploy on every merge.'],
      tags: ['Next.js', 'Firebase'],
    },
    {
      // MOCK
      id: 'teaching-assistant',
      start: '2024-08',
      end: '2024-12',
      title: 'Teaching Assistant, Web Programming',
      org: 'KMUTT School of IT',
      medium: 'Office hours and 200 ungraded labs',
      description: 'Helped first-year students through their first web projects.',
      details: ['Ran weekly lab sessions for 40 students.', 'Wrote auto-graded exercises for HTML, CSS and JavaScript.'],
      tags: ['Teaching', 'JavaScript'],
    },
    {
      id: 'zettamerge',
      start: '2025-02',
      end: '2025-03',
      title: 'Freelance Frontend Developer',
      org: 'Zettamerge',
      medium: 'Figma frames, rendered in React',
      description: 'Turned dashboard designs into working, connected product screens.',
      details: [
        'Developed dashboard UI from Figma designs using React with TypeScript.',
        'Integrated frontend components with backend APIs to deliver fully functional features.',
      ],
      tags: ['React', 'TypeScript', 'Figma'],
    },
    {
      id: 'scb',
      start: '2025-06',
      end: 'present',
      title: 'Part-time Software Engineer',
      org: 'Siam Commercial Bank (SCB)',
      medium: 'Legacy code, lovingly moved to the cloud',
      description: 'Working with senior engineers on frontend, backend and cloud migration.',
      details: [
        'Contributed to the migration of legacy on-premise applications to cloud-native microservices on Microsoft Azure.',
        'Implemented frontend and backend features assigned by senior engineers.',
        'Developed a batch reporting system with Java Spring Boot that generates automated reports and sends emails.',
        'Took part in team meetings, progress updates and code reviews via Microsoft Teams and Git/GitLab.',
      ],
      tags: ['Java', 'Spring Boot', 'Azure', 'Microservices'],
    },
  ],
}

/* ── IV · Trophies — place 1/2/3 = gold/silver/bronze, anything else = laurel ── */
// MOCK — all of these are example data: replace with your real competitions (or remove them).
export const trophies = {
  numeral: 'IV',
  title: 'The Trophy Room',
  items: [
    {
      id: 'hackathon',
      place: 1,
      award: '1st Place',
      title: 'Example Hackathon',
      year: '2025',
      medium: '36 hours, energy drinks on canvas',
      description: 'Out of 80 teams. What you built in a weekend that impressed the judges.',
      tags: ['Hackathon'],
    },
    {
      id: 'contest',
      place: 2,
      award: '2nd Place',
      title: 'Example Programming Contest',
      year: '2024',
      medium: 'Code under time pressure',
      description: 'Five problems, three hours, one keyboard.',
      tags: ['Algorithms'],
    },
    {
      id: 'ctf',
      place: 3,
      award: '3rd Place',
      title: 'Example Capture the Flag',
      year: '2024',
      medium: 'Hex dumps and suspicion',
      description: 'University CTF: web exploitation and reverse engineering challenges.',
      tags: ['Security'],
    },
    {
      id: 'finalist',
      place: 0,
      award: 'Finalist',
      title: 'Example Innovation Challenge',
      year: '2023',
      medium: 'Pitch deck and optimism',
      description: 'Every finalist badge is a gold medal in a parallel universe.',
    },
    {
      id: 'scholarship',
      place: 0,
      award: 'Scholarship',
      title: 'Example Academic Scholarship',
      year: '2023',
      medium: 'Good grades, framed',
      description: 'Awarded for academic performance.',
    },
  ],
}

/* ── V · Projects — `images` become slides inside one big frame ── */
export const projects = {
  numeral: 'V',
  title: 'Modern Masterpieces',
  items: [
    {
      id: 'realtime-chat',
      title: 'Real-time Chat Application',
      year: 'MERN Stack · Socket.IO',
      medium: 'MongoDB, Express, React, Node.js',
      description: 'A real-time messaging app in the spirit of Facebook Messenger.',
      details: [
        'Integrated Socket.IO for real-time messaging and online status tracking.',
        'Designed authentication, message storage and a responsive UI that works across devices.',
      ],
      tags: ['MongoDB', 'Express', 'React', 'Node.js', 'Socket.IO'],
      links: [{ label: 'GitHub', href: 'https://github.com/feifxi/mern-realtime-chat-app' }],
      images: [], // e.g. ['/art/chat-1.png', '/art/chat-2.png']
      aspect: 16 / 10,
    },
    {
      id: 'mobile-shop',
      title: 'Mobile Shop E-commerce Platform',
      year: 'Vue.js · Spring Boot · Docker',
      medium: 'Vue.js, Java Spring Boot, Docker',
      description: 'An e-commerce platform for mobile phones, with product listings, a shopping cart and authentication.',
      details: [
        'Built authentication with Spring Security.',
        'Implemented backend REST APIs with Spring Boot and deployed them with Docker on a private university VM.',
      ],
      tags: ['Vue.js', 'Spring Boot', 'Spring Security', 'Docker'],
      links: [{ label: 'GitHub', href: 'https://github.com/feifxi/MS-3-ITBMS' }],
      images: [],
      aspect: 16 / 10,
    },
    {
      id: 'this-museum',
      title: 'This Very Museum',
      year: 'React Three Fiber · WebGL',
      medium: 'React, Three.js and a marble statue from Denmark',
      description: 'A 3D portfolio disguised as a museum, disguised as a joke. You are standing in it.',
      tags: ['React', 'Three.js', 'WebGL'],
      links: [{ label: 'GitHub', href: 'https://github.com/feifxi' }],
      images: [],
      aspect: 16 / 10,
    },
    {
      // MOCK
      id: 'url-shortener',
      title: 'Go URL Shortener',
      year: 'Go · Fiber · Redis',
      medium: 'Go, Fiber, Redis, PostgreSQL',
      description: 'A fast URL shortener with click analytics and rate limiting.',
      details: ['Handles 5k requests per second on a single small VM.', 'Redis cache in front of PostgreSQL for hot links.'],
      tags: ['Go', 'Fiber', 'Redis', 'PostgreSQL'],
      links: [{ label: 'GitHub', href: 'https://github.com/feifxi' }],
      images: [],
      aspect: 16 / 10,
    },
    {
      // MOCK
      id: 'e2e-suite',
      title: 'End-to-end Test Suite',
      year: 'Playwright · GitHub Actions',
      medium: 'Playwright, TypeScript, patience',
      description: 'Automated browser tests for a web app, running on every pull request.',
      details: ['120 tests across three browsers, run in parallel in CI.', 'Visual regression snapshots for key pages.'],
      tags: ['Playwright', 'TypeScript', 'CI/CD'],
      links: [{ label: 'GitHub', href: 'https://github.com/feifxi' }],
      images: [],
      aspect: 16 / 10,
    },
  ],
}

/* ── The grand finale: one enormous meme on the back wall ─── */
// The base image is painted with `overlays` on top:
//   face  — set `image` to a transparent PNG of your face, e.g. '/art/face.png'
//           (until then a dashed "YOUR FACE" oval marks the spot)
//   spark — the orange spark standing in for God's face
// `at` = [x, y] position as a fraction of the image, `size` = fraction of its height.
export const masterpiece = {
  id: 'masterpiece',
  title: 'The Creation of a Developer',
  year: 'c. 1512 – 2026',
  medium: 'After Michelangelo. Fresco, ceiling paint and a pull request',
  description:
    'The crown jewel of the collection. At the moment of creation, the AI reaches out to the developer — or is it the other way round? Kept behind velvet ropes for its own protection.',
  credit: 'Base image: Michelangelo, The Creation of Adam (c. 1512), Sistine Chapel. Public domain, via Wikimedia Commons',
  image: '/art/creation-of-adam.jpg',
  aspect: 2400 / 1089,
  overlays: [
    { type: 'face', image: null, at: [0.112, 0.405], size: 0.2, rotate: -6 },
    { type: 'spark', at: [0.585, 0.215], size: 0.3 },
  ],
}
