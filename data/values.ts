export type CoreValue = {
  title: string;
  description: string;
  icon: "heart" | "handshake" | "users" | "shield-check" | "sparkles";
};

export const coreValues: CoreValue[] = [
  {
    title: "Compassion",
    description: "We treat older adults with love, kindness and respect.",
    icon: "heart",
  },
  {
    title: "Empathy",
    description:
      "We understand that ageing is a journey we will all experience, and we strive to treat every older person with the dignity we would want for ourselves.",
    icon: "handshake",
  },
  {
    title: "Community",
    description:
      "We build strong support networks that help older adults remain connected, supported and valued.",
    icon: "users",
  },
  {
    title: "Prevention",
    description:
      "We believe proactive health education and self-care can help people maintain wellbeing and independence as they age.",
    icon: "sparkles",
  },
  {
    title: "Integrity",
    description:
      "We serve with transparency, accountability and responsible stewardship of every resource entrusted to us.",
    icon: "shield-check",
  },
];
