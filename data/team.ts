// Leadership and partner data for Healthy Golden Years Initiative.

// ── Founder ──────────────────────────────────────────────────────────────────

export type Founder = {
  name: string;
  credentials: string;
  role: string;
  bio: string[];
  qualifications: string[];
  certifications: { issuer: string; courses: string[] }[];
  quote: string;
};

export const founder: Founder = {
  name: "Juliet Ugbomeh",
  credentials: "RN, BNSc, RPHN",
  role: "Founder & Executive Director",
  bio: [
    "Juliet Ugbomeh is a dedicated nurse, public health professional, and humanitarian born on 12 June 1990 in Benin City, Edo State, Nigeria. Her journey in healthcare was born out of a deep passion for humanity and a desire to make a meaningful difference in the lives of people — particularly those who are vulnerable and often overlooked.",
    "After completing her Registered Nurse (RN) qualification at the School of Nursing and Midwifery, Lafia in 2013, Juliet began her professional career at Guinea Savanna Medical Centre, Abuja. Determined to advance her knowledge, she went on to earn her Bachelor of Nursing Science (BNSc) and Registered Public Health Nurse (RPHN) qualification from Ebonyi State University, graduating in 2019.",
    "During the COVID-19 pandemic, Juliet served as a frontline nurse at the Federal Medical Centre, Delta State, working with the Centre for Communicable Diseases — a period that deepened her understanding of the particular vulnerabilities faced by older people. She has since worked at Asaba Specialist Hospital (Delta State), St. Raphael Medical Centre (Lagos), and currently serves with the Lagos State Health Service Commission.",
    "Throughout her career, Juliet has witnessed the realities faced by older people: loneliness, limited access to healthcare, neglect, financial difficulties, and the erosion of dignity and independence. These experiences crystallised a conviction that growing older should never mean losing one's worth or right to compassionate care — and that conviction is the foundation of Healthy Golden Years Initiative.",
  ],
  qualifications: [
    "Registered Nurse (RN)",
    "Bachelor of Nursing Science (BNSc)",
    "Registered Public Health Nurse (RPHN)",
    "Master of Public Health (MPH)",
  ],
  certifications: [
    {
      issuer: "La Plage Metaverse",
      courses: [
        "International Executive Certificate in Healthcare Delivery",
        "Elder Care and Gerontology",
        "Nursing Administration",
        "Leadership and Professional Development",
        "Healthcare Team Leadership and Supervision",
      ],
    },
    {
      issuer: "IHI Open School",
      courses: ["Quality Improvement in Healthcare", "Leadership in Health"],
    },
  ],
  quote:
    "Caring for humanity is not just my profession — it is my calling. Every elderly person deserves to live their golden years with dignity, love, care and hope.",
};

// ── Other Leadership ──────────────────────────────────────────────────────────

export type LeaderPlaceholder = {
  role: string;
  note: string;
};

export const leadershipPlaceholders: LeaderPlaceholder[] = [
  {
    role: "Programs Lead",
    note: "Leadership profile to be published upon confirmation.",
  },
  {
    role: "Community Outreach Lead",
    note: "Leadership profile to be published upon confirmation.",
  },
];

// ── Partners ──────────────────────────────────────────────────────────────────

export type PartnerPlaceholder = {
  name: string;
  image: string;
};

export const partnerPlaceholders: PartnerPlaceholder[] = [
  { name: "Healthcare Partner", image: "/image/images.jpg" },
  { name: "Community Partner", image: "/image/images.jpg" },
  { name: "Corporate Partner", image: "/image/images.jpg" },
  { name: "Development Partner", image: "/image/images.jpg" },
];
