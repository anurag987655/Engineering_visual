export type Level = "intro" | "core" | "advanced";

export type Subject = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  symbol: string;
  chapterIds: string[];
};

export type Chapter = {
  id: string;
  slug: string;
  subjectId: string;
  title: string;
  summary: string;
  order: number;
  outcomes: string[];
  lessonIds: string[];
};

export type LessonMeta = {
  id: string;
  slug: string;
  subjectId: string;
  chapterId: string;
  title: string;
  summary: string;
  level: Level;
  readingTime: number;
  author: string;
  updated: string;
  objectives: string[];
  keywords: string[];
  prerequisites: string[];
  outline: { id: string; label: string }[];
  playgrounds: string[];
  order: number;
};

export type LearningPath = {
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: string;
  lessonIds: string[];
};

/* ------------------------------------------------------------------ */
/* Chapters                                                            */
/* ------------------------------------------------------------------ */

export const chapters: Chapter[] = [
  /* Engineering — Electromagnetism (IOE Electronics, Communication &
     Information Engineering). Only Electric Fields is authored so far;
     the rest are placeholders so the structure is ready to grow. */
  {
    id: "eng-em-vector-algebra",
    slug: "vector-algebra",
    subjectId: "engineering",
    title: "Vector Algebra & Coordinate Systems",
    summary:
      "The mathematical language of fields: vector operations, gradients, divergence, curl, and the coordinate systems used throughout electromagnetics.",
    order: 1,
    outcomes: [
      "Add, subtract, and multiply vectors",
      "Work fluently in Cartesian, cylindrical, and spherical coordinates",
      "Use the del operator for gradient, divergence, and curl",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-electrostatics",
    slug: "electrostatics",
    subjectId: "engineering",
    title: "Electrostatics: Coulomb's Law",
    summary:
      "The force between charges at rest and the concept of electric field intensity.",
    order: 2,
    outcomes: [
      "State Coulomb's law in vector form",
      "Distinguish charge distributions: point, line, surface, volume",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-electric-fields",
    slug: "electric-fields",
    subjectId: "engineering",
    title: "Electric Fields",
    summary:
      "How point charges fill the space around them with a vector field, and how superposition makes many charges tractable.",
    order: 3,
    outcomes: [
      "Describe the electric field produced by point charges",
      "Apply superposition to compute a total field",
      "Read field lines and vector fields",
    ],
    lessonIds: ["electric-field"],
  },
  {
    id: "eng-em-energy-potential",
    slug: "energy-and-potential",
    subjectId: "engineering",
    title: "Energy & Electric Potential",
    summary:
      "Work done moving a charge, potential, and the relationship between the electric field and potential.",
    order: 4,
    outcomes: [
      "Define electric potential and potential difference",
      "Relate the field to the gradient of potential",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-fields-in-matter",
    slug: "fields-in-matter",
    subjectId: "engineering",
    title: "Fields in Matter",
    summary:
      "Conductors, dielectrics, polarization, and boundary conditions at material interfaces.",
    order: 5,
    outcomes: [
      "Describe behaviour of conductors in electrostatic fields",
      "Apply boundary conditions for electric fields",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-magnetostatics",
    slug: "magnetostatics",
    subjectId: "engineering",
    title: "Magnetostatics",
    summary:
      "The Biot–Savart law, Ampère's circuital law, and the magnetic field of steady currents.",
    order: 6,
    outcomes: [
      "Apply the Biot–Savart law to simple geometries",
      "Use Ampère's law for symmetric current distributions",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-maxwell",
    slug: "maxwells-equations",
    subjectId: "engineering",
    title: "Maxwell's Equations",
    summary:
      "The four equations that unify electricity and magnetism, in integral and differential form.",
    order: 7,
    outcomes: [
      "State Maxwell's equations in both forms",
      "Interpret displacement current",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-waves",
    slug: "electromagnetic-waves",
    subjectId: "engineering",
    title: "Electromagnetic Waves",
    summary:
      "Wave propagation, the wave equation, polarization, and reflection at boundaries.",
    order: 8,
    outcomes: [
      "Derive the wave equation from Maxwell's equations",
      "Describe uniform plane wave propagation",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-transmission-lines",
    slug: "transmission-lines",
    subjectId: "engineering",
    title: "Transmission Lines",
    summary:
      "Telegrapher's equations, characteristic impedance, standing waves, and impedance matching.",
    order: 9,
    outcomes: [
      "Compute characteristic impedance",
      "Interpret the reflection coefficient and standing-wave ratio",
    ],
    lessonIds: [],
  },
  {
    id: "eng-em-waveguides",
    slug: "waveguides",
    subjectId: "engineering",
    title: "Waveguides",
    summary:
      "Guided propagation of electromagnetic waves in rectangular waveguides and resonant cavities.",
    order: 10,
    outcomes: [
      "Distinguish TE and TM modes",
      "Explain cutoff frequency",
    ],
    lessonIds: [],
  },

  /* Mathematics — structure for future topics. Only Sequences & Series
     has an authored lesson so far. */
  {
    id: "math-sequences-series",
    slug: "sequences-and-series",
    subjectId: "mathematics",
    title: "Sequences & Series",
    summary:
      "Convergence, infinite series, and the geometric series as a foundational tool.",
    order: 1,
    outcomes: [
      "Define convergence of a sequence and a series",
      "Derive and apply the geometric series formula",
      "Use the ratio test to decide convergence",
    ],
    lessonIds: ["geometric-series"],
  },
  {
    id: "math-calculus",
    slug: "calculus",
    subjectId: "mathematics",
    title: "Calculus",
    summary:
      "Limits, derivatives, integrals, and their applications.",
    order: 2,
    outcomes: [],
    lessonIds: [],
  },
  {
    id: "math-linear-algebra",
    slug: "linear-algebra",
    subjectId: "mathematics",
    title: "Linear Algebra",
    summary:
      "Vectors, matrices, linear transformations, eigenvalues, and eigenvectors.",
    order: 3,
    outcomes: [],
    lessonIds: [],
  },
  {
    id: "math-differential-equations",
    slug: "differential-equations",
    subjectId: "mathematics",
    title: "Differential Equations",
    summary:
      "First- and second-order equations, systems, and methods of solution.",
    order: 4,
    outcomes: [],
    lessonIds: [],
  },
  {
    id: "math-probability",
    slug: "probability",
    subjectId: "mathematics",
    title: "Probability",
    summary:
      "Random variables, distributions, expectation, and statistical reasoning.",
    order: 5,
    outcomes: [],
    lessonIds: [],
  },
  {
    id: "math-complex-analysis",
    slug: "complex-analysis",
    subjectId: "mathematics",
    title: "Complex Analysis",
    summary:
      "Complex numbers, analytic functions, contour integration, and residues.",
    order: 6,
    outcomes: [],
    lessonIds: [],
  },
];

/* ------------------------------------------------------------------ */
/* Subjects                                                            */
/* ------------------------------------------------------------------ */

export const subjects: Subject[] = [
  {
    id: "engineering",
    slug: "engineering",
    title: "Engineering",
    tagline: "Systems, fields, and signals.",
    description:
      "Applied mathematics and physics for engineers. Starting with electromagnetism, following the IOE Electronics, Communication & Information Engineering curriculum.",
    symbol: "∿",
    chapterIds: chapters
      .filter((chapter) => chapter.subjectId === "engineering")
      .sort((a, b) => a.order - b.order)
      .map((chapter) => chapter.id),
  },
  {
    id: "mathematics",
    slug: "mathematics",
    title: "Mathematics",
    tagline: "The language underneath everything.",
    description:
      "From series and calculus to linear algebra, differential equations, probability, and complex analysis — built for intuition first.",
    symbol: "∑",
    chapterIds: chapters
      .filter((chapter) => chapter.subjectId === "mathematics")
      .sort((a, b) => a.order - b.order)
      .map((chapter) => chapter.id),
  },
];

/* ------------------------------------------------------------------ */
/* Lessons                                                             */
/* ------------------------------------------------------------------ */

export const lessons: LessonMeta[] = [
  {
    id: "geometric-series",
    slug: "geometric-series",
    subjectId: "mathematics",
    chapterId: "math-sequences-series",
    title: "The Geometric Series",
    summary:
      "The infinite series you can sum in one step — and the surprising range of problems, from finance to macroeconomics, that depend on it.",
    level: "intro",
    readingTime: 12,
    author: "Engineering Visual",
    updated: "2026-10-13",
    objectives: [
      "Explain what a geometric series is in terms of its first term and common ratio",
      "Derive the partial-sum formula by subtraction",
      "Determine convergence from the common ratio and the ratio test",
      "Apply the sum formula to present-value and multiplier problems",
    ],
    keywords: [
      "geometric series",
      "common ratio",
      "partial sum",
      "convergence",
      "ratio test",
      "perpetuity",
      "present value",
      "Keynesian multiplier",
      "sequences",
      "series",
    ],
    prerequisites: [],
    outline: [
      { id: "definition", label: "Definition" },
      { id: "sum-of-the-series", label: "Sum of the series" },
      { id: "convergence", label: "Convergence" },
      { id: "the-ratio-test", label: "The ratio test" },
      { id: "applications", label: "Applications" },
      { id: "practice-problems", label: "Practice problems" },
    ],
    playgrounds: ["geometric-series-convergence"],
    order: 1,
  },
  {
    id: "electric-field",
    slug: "electric-field",
    subjectId: "engineering",
    chapterId: "eng-em-electric-fields",
    title: "The Electric Field, Made Visible",
    summary:
      "Charge is invisible, yet its influence fills the space around it. Build the electric field of point charges by hand in a live playground.",
    level: "intro",
    readingTime: 9,
    author: "Engineering Visual",
    updated: "2026-10-13",
    objectives: [
      "Describe the electric field as a vector defined at every point",
      "Use superposition to add the fields of several charges",
      "Interpret field lines and vector fields",
      "Recognise the inverse-square dependence of the field",
    ],
    keywords: [
      "electric field",
      "point charge",
      "Coulomb's law",
      "superposition",
      "field lines",
      "vector field",
      "electromagnetism",
    ],
    prerequisites: ["eng-em-vector-algebra"],
    outline: [
      { id: "what-is-a-field", label: "What is a field?" },
      { id: "interactive-playground", label: "Interactive playground" },
      { id: "the-mathematics", label: "The mathematics" },
      { id: "in-code", label: "In code" },
    ],
    playgrounds: ["electric-field"],
    order: 1,
  },
];

/* ------------------------------------------------------------------ */
/* Learning paths                                                      */
/* ------------------------------------------------------------------ */

export const paths: LearningPath[] = [
  {
    id: "path-mathematics-foundations",
    slug: "mathematics-foundations",
    title: "Mathematics Foundations",
    description:
      "Build the core toolkit for quantitative work, one intuition-first lesson at a time.",
    audience: "Students starting out in mathematics or refreshing the fundamentals.",
    lessonIds: ["geometric-series"],
  },
  {
    id: "path-electromagnetism-foundations",
    slug: "electromagnetism-foundations",
    title: "Electromagnetism Foundations",
    description:
      "Follow the engineering electromagnetism sequence from the field concept upwards.",
    audience: "Electronics, communication, and information engineering students.",
    lessonIds: ["electric-field"],
  },
];
