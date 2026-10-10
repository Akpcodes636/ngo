// ============================================================================
// CENTRALIZED IMAGE CONFIGURATION
// ----------------------------------------------------------------------------
// Every photograph used across the website is declared here, in one place,
// so the organization can replace this initial online photography with its
// own images later WITHOUT touching any component code. Each entry carries
// accessible alt text and a source/credit for attribution, since the
// current photography is sourced from Pexels for this initial build.
//
// To swap an image: change only the `src` (and `credit`/`sourceUrl` if
// relevant) below. Components read from this file and never hardcode URLs.
// ============================================================================

export type SiteImage = {
  src: string;
  alt: string;
  credit?: string;
  sourceUrl?: string;
};

export type GalleryCategory =
  | "Community Outreach"
  | "Health & Wellness"
  | "Older Adults"
  | "Volunteers"
  | "Community Events"
  | "Education"
  | "Partnerships";

export type GalleryImage = SiteImage & {
  id: string;
  category: GalleryCategory;
  caption: string;
  location?: string;
  date?: string;
};

const pexels = (id: number, w = 1600): string =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&q=80`;

const pexelsSource = (id: number): string => `https://www.pexels.com/photo/${id}/`;

export const logo: SiteImage = {
  src: "/image/logo.jpg",
  alt: "Healthy Golden Years Initiative logo — an elderly man and woman beside a heart and leaf symbol",
};

export const heroImages: SiteImage[] = [
  {
    // Replace with your own image: drop a file into public/image/ and update the src below
    src: "/image/hero.jpg",
    alt: "Healthcare workers assisting an elderly man during a community health outreach in ijede, lagos,Nigeria",
  },
  {
    src: pexels(37285163),
    alt: "Healthcare professionals engaging with villagers during a rural community outreach in Gombe, Nigeria",
    credit: "Adamu Galadima / Pexels",
    sourceUrl: pexelsSource(37285163),
  },
];

export const whyWeExistImage: SiteImage = {
  // Replace with your own image: drop a file into public/image/ and update the src below
  src: "/image/why-we-exist.jpg",
  alt: "Portrait of an elderly Nigerian woman in traditional attire, Ife, Nigeria",
};

export const aboutImages = {
  ourStory: {
    src: pexels(17077447),
    alt: "An elderly man in traditional Nigerian clothing at a local market",
    credit: "2xman Yef / Pexels",
    sourceUrl: pexelsSource(17077447),
  } as SiteImage,
  whoWeServe: {
    src: pexels(27599431),
    alt: "An elderly woman holding a young child, both dressed in traditional African clothing",
    credit: "Henri Dubuc / Pexels",
    sourceUrl: pexelsSource(27599431),
  } as SiteImage,
};

export const galleryHomepagePreviewIds = [
  "gallery-outreach-1",
  "gallery-outreach-2",
  "gallery-outreach-3",
  "gallery-outreach-4",
  "gallery-wellness-2",
  "gallery-wellness-3",
];

export const galleryImages: GalleryImage[] = [
  {
    id: "gallery-outreach-1",
    // Replace with your own image: drop a file into public/image/ and update the src below
    src: "/image/gallery-1.jpg",
    alt: "Healthcare workers assisting an elderly man during a community health outreach in ijede, lagos,Nigeria",
    category: "Community Outreach",
    caption: "Community Health Outreach",
    location: "ijede, lagos,Nigeria",
  },
  {
    id: "gallery-outreach-2",
    src: "/image/community-1.jpg",
    alt: "Healthcare professionals engaging with villagers during a rural community outreach",
    category: "Community Outreach",
    caption: "Bringing Health Information to Rural Communities",
    location: "Gombe, Nigeria",
    credit: "Adamu Galadima / Pexels",
    sourceUrl: pexelsSource(37285163),
  },
  {
    id: "gallery-outreach-3",
    src:"/image/community-2.jpg",
    alt: "Community members collecting relief and support supplies outdoors",
    category: "Community Outreach",
    caption: "Community Outreach",
    credit: "Lagos Food Bank / Pexels",
    sourceUrl: pexelsSource(8042425),
  },
  {
    id: "gallery-outreach-4",
    src:"/image/community-3.jpg",
    alt: "Volunteers working together",
    category: "Community Outreach",
    caption: "Volunteers working together",
    credit: "Lagos Food Bank / Pexels",
    sourceUrl: pexelsSource(6472487),
  },
  {
    id: "gallery-wellness-1",
    src:"/image/community-3.jpg",
    alt: "An outdoor community health checkup for an elderly resident",
    category: "Health & Wellness",
    caption: "Preventive Health Checkup",
    location: "ijede, lagos,Nigeria",
    credit: "MK Photoz / Pexels",
    sourceUrl: pexelsSource(33127869),
  },
  {
    id: "gallery-wellness-2",
     src:"/image/community-4.jpg",
    alt: "A healthcare worker checking the blood pressure of an elderly woman",
    category: "Health & Wellness",
    caption: "Health Awareness",
    credit: "Lagos Food Bank / Pexels",
    sourceUrl: pexelsSource(8248433),
  },
  {
    id: "gallery-wellness-3",
     src:"/image/community-5.jpg",
    alt: "A smiling healthcare professional in a lab coat holding a stethoscope",
    category: "Health & Wellness",
    caption: "Supporting Healthy Ageing Through Community",
    credit: "Carmel Nsenga / Pexels",
    sourceUrl: pexelsSource(19218034),
  },
  {
    id: "gallery-elders-1",
    // Replace with your own image: drop a file into public/image/ and update the src below
    src: "/image/elder.jpg",
    alt: "Portrait of an elderly Nigerian woman in traditional attire",
    category: "Older Adults",
    caption: "Wisdom and Dignity in Every Face",
  },
  {
    id: "gallery-elders-2",
    src: "/image/donate.jpg",
    alt: "Portrait of an elderly Nigerian woman in traditional attire and headdress",
    category: "Older Adults",
    caption: "A Portrait of Quiet Strength",
    credit: "Oluwasegun Ajayi / Pexels",
    sourceUrl: pexelsSource(36859767),
  },
  {
    id: "gallery-elders-3",
    src: "/image/elders.jpg",
    alt: "An elderly man in traditional Nigerian attire celebrating at a community event",
    category: "Older Adults",
    caption: "Celebrating Life and Community",
    credit: "Detty Images / Pexels",
    sourceUrl: pexelsSource(37834194),
  },
  {
    id: "gallery-elders-4",
    src: "/image/elders-3.jpg",
    alt: "A thoughtful elderly man wearing a patterned cap",
    category: "Older Adults",
    caption: "Every Elder Has a Story",
    credit: "Dokunayano / Pexels",
    sourceUrl: pexelsSource(39106826),
  },
  {
    id: "gallery-volunteers-1",
    src: "/image/volunter-2.jpg",
    alt: "A volunteer guiding children during an outdoor community activity",
    category: "Volunteers",
    caption: "Volunteers Giving Their Time",
    credit: "Lagos Food Bank / Pexels",
    sourceUrl: pexelsSource(9090746),
  },
  {
    id: "gallery-volunteers-2",
    src: pexels(6647030),
    alt: "A volunteer preparing a mobility walker for an elderly client",
    category: "Volunteers",
    caption: "Preparing to Support an Elder",
    credit: "RDNE Stock Project / Pexels",
    sourceUrl: pexelsSource(6647030),
  },
  {
    id: "gallery-volunteers-3",
    src: "/image/volunteers-3.jpg",
    alt: "A volunteer distributing community supplies",
    category: "Volunteers",
    caption: "Hands That Serve the Community",
    credit: "Official Design Africa / Pexels",
    sourceUrl: pexelsSource(35043644),
  },
  {
    id: "gallery-events-1",
    src: pexels(34479480),
    alt: "A lively community engagement gathering",
    category: "Community Events",
    caption: "Community Wellness Day",
    location: "ijede, lagos,Nigeria",
    credit: "MK Photoz / Pexels",
    sourceUrl: pexelsSource(34479480),
  },
  {
    id: "gallery-events-2",
    src: pexels(33107901),
    alt: "A community engagement meeting with residents",
    category: "Community Events",
    caption: "Building Stronger Community Connections",
    location: "ijede, lagos,Nigeria",
    credit: "MK Photoz / Pexels",
    sourceUrl: pexelsSource(33107901),
  },
  {
    id: "gallery-education-1",
    src: pexels(8248290),
    alt: "A healthcare worker giving a health education lecture to a group of older women",
    category: "Education",
    caption: "Practical Knowledge for Healthy Ageing",
    credit: "Lagos Food Bank / Pexels",
    sourceUrl: pexelsSource(8248290),
  },
  {
    id: "gallery-education-2",
    src: pexels(33132346),
    alt: "A healthcare professional attending to a resident during a health education visit",
    category: "Education",
    caption: "Health Education, Shared in Community",
    location: "ijede, lagos,Nigeria",
    credit: "MK Photoz / Pexels",
    sourceUrl: pexelsSource(33132346),
  },
  {
    id: "gallery-partnerships-1",
    src: pexels(30677598),
    alt: "A group of professionals sharing a handshake during a partnership meeting",
    category: "Partnerships",
    caption: "Partnering for Community Health",
    credit: "NinthGrid / Pexels",
    sourceUrl: pexelsSource(30677598),
  },
  {
    id: "gallery-partnerships-2",
    src: pexels(30677596),
    alt: "Business partners in discussion during a community health partnership meeting",
    category: "Partnerships",
    caption: "Stronger Together — Community and Healthcare Partners",
    credit: "NinthGrid / Pexels",
    sourceUrl: pexelsSource(30677596),
  },
];

export const programImages = {
  preventiveHealthEducation: {
    src: pexels(8248290),
    alt: "A healthcare worker leading a health education session with a group of older women",
    credit: "Lagos Food Bank / Pexels",
    sourceUrl: pexelsSource(8248290),
  } as SiteImage,
  communityHealthOutreach: {
    src: pexels(33127869),
    alt: "An outdoor community health checkup for an elderly resident",
    credit: "MK Photoz / Pexels",
    sourceUrl: pexelsSource(33127869),
  } as SiteImage,
  selfCareHealthyAgeing: {
    src: pexels(8172941),
    alt: "Older adults engaging in outdoor group exercise in a park",
    credit: "RDNE Stock Project / Pexels",
    sourceUrl: pexelsSource(8172941),
  } as SiteImage,
  elderlySupportCare: {
    src: pexels(4483669),
    alt: "A caregiver spending time with an older adult in a community care setting",
    credit: "Denis Ngai / Pexels",
    sourceUrl: pexelsSource(4483669),
  } as SiteImage,
  caregiverEducation: {
    src: pexels(7551608),
    alt: "A caregiver assisting an elderly man with gentle exercises at home",
    credit: "Kampus Production / Pexels",
    sourceUrl: pexelsSource(7551608),
  } as SiteImage,
  healthScreeningAwareness: {
    src: pexels(8248433),
    alt: "A healthcare worker checking the blood pressure of an elderly woman",
    credit: "Lagos Food Bank / Pexels",
    sourceUrl: pexelsSource(8248433),
  } as SiteImage,
};

export const impactImage: SiteImage = {
  src: pexels(39106826),
  alt: "A thoughtful elderly man wearing a patterned cap, representing the people behind every statistic",
  credit: "Dokunayano / Pexels",
  sourceUrl: pexelsSource(39106826),
};

export const getInvolvedImage: SiteImage = {
  src: pexels(9090746),
  alt: "Volunteers working together with community members at an outreach event",
  credit: "Lagos Food Bank / Pexels",
  sourceUrl: pexelsSource(9090746),
};

export const donateHeroImage: SiteImage = {
  src: pexels(4483669),
  alt: "An older adult receiving warm support and care from a community caregiver",
  credit: "Denis Ngai / Pexels",
  sourceUrl: pexelsSource(4483669),
};
