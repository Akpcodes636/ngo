// ----------------------------------------------------------------------------
// IMPACT DATA
// ----------------------------------------------------------------------------
// IMPORTANT: The organization has not yet published verified statistics.
// The figures below are clearly marked placeholders ("00+") and must be
// replaced with real, reported numbers before publishing. This shape is
// designed to later be swapped for a CMS/database-backed fetch without
// changing any component.
// ----------------------------------------------------------------------------

export type ImpactStat = {
  value: string;
  label: string;
  isPlaceholder: boolean;
};

export const impactStats: ImpactStat[] = [
  { value: "00+", label: "Older Adults Reached", isPlaceholder: true },
  { value: "00+", label: "Community Outreach Activities", isPlaceholder: true },
  { value: "00+", label: "Health Education Sessions", isPlaceholder: true },
  { value: "00+", label: "Volunteers & Partners", isPlaceholder: true },
];

export type ImpactGoal = {
  title: string;
  description: string;
};

export const futureGoals: ImpactGoal[] = [
  {
    title: "Expand Community Outreach",
    description:
      "Reach more older adults across additional communities with preventive health education and outreach activities.",
  },
  {
    title: "Strengthen Caregiver Networks",
    description:
      "Grow our caregiver education program to reach more families supporting older loved ones.",
  },
  {
    title: "Build Healthcare Partnerships",
    description:
      "Partner with healthcare providers and screening services to expand access to preventive care.",
  },
  {
    title: "Deepen Community Support Systems",
    description:
      "Establish lasting peer and volunteer support networks that keep older adults connected and valued.",
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  isPlaceholder: boolean;
};

// PLACEHOLDER testimonials — replace with real, consented quotes from
// program participants, families, volunteers or partners.
export const testimonials: Testimonial[] = [
  {
    quote:
      "[Placeholder testimonial — to be replaced with a real quote from a program participant.]",
    name: "Program Participant",
    role: "Community Member",
    isPlaceholder: true,
  },
  {
    quote:
      "[Placeholder testimonial — to be replaced with a real quote from a family caregiver.]",
    name: "Family Caregiver",
    role: "Caregiver Education Program",
    isPlaceholder: true,
  },
  {
    quote:
      "[Placeholder testimonial — to be replaced with a real quote from a volunteer or partner.]",
    name: "Community Volunteer",
    role: "Outreach Volunteer",
    isPlaceholder: true,
  },
];
