// Central site configuration: organization identity, navigation, contact
// placeholders and social links. Update contact details here once the
// organization provides verified information — placeholders are marked
// clearly and must not be treated as real until replaced.

export const site = {
  name: "Healthy Golden Years Initiative",
  shortName: "Healthy Golden Years",
  tagline:
    "Promoting Health, Dignity and Better Living for Elderly and Vulnerable People",
  mission:
    "To promote preventive health and self-care practices among older adults, empowering them to live healthier, independent and dignified lives.",
  vision:
    "A society where elderly persons enjoy healthy ageing, supported by knowledge, community care and preventive health services.",
  url: "https://www.healthygoldenyears.org",
  locale: "en_NG",
  founded: "2026",
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Programs", href: "/programs" },
  // { label: "Impact", href: "/impact" },
  { label: "Gallery", href: "/gallery" },
  { label: "Get Involved", href: "/get-involved" },
] as const;

export const footerLinks = [
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  // { label: "Impact", href: "/impact" },
  { label: "Gallery", href: "/gallery" },
  { label: "Get Involved", href: "/get-involved" },
  { label: "Donate", href: "/donate" },
  { label: "Contact", href: "/contact" },
] as const;

export const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Safeguarding Policy", href: "/safeguarding-policy" },
  { label: "Transparency", href: "/donate#transparency" },
] as const;

export const contact = {
  // email: "[TO BE PROVIDED]",
  phone: "08031642580",
  addressLine1: "Ijede",
  addressLine2: "Lagos 104102, Nigeria",
  whatsapp: "[TO BE PROVIDED]",
} as const;

// PLACEHOLDER — replace with verified/live social profile URLs.
export const socialLinks = [
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "X (Twitter)", href: "#", icon: "twitter" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "YouTube", href: "#", icon: "youtube" },
] as const;

// PLACEHOLDER — replace with verified bank details before going live.
export const bankTransfer = {
  accountName: "[TO BE PROVIDED]",
  bankName: "[TO BE PROVIDED]",
  accountNumber: "[TO BE PROVIDED]",
} as const;

export const donationAmountsNGN = [5000, 10000, 25000, 50000, 100000] as const;
