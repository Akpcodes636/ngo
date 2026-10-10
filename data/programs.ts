import { type SiteImage } from "./images";

export type Program = {
  slug: string;
  icon: "book-open" | "heart-handshake" | "activity" | "users" | "hand-heart" | "stethoscope";
  title: string;
  shortDescription: string;
  description: string;
  image: SiteImage;
};

export const programs: Program[] = [
  {
    slug: "preventive-health-education",
    icon: "book-open",
    title: "Preventive Health Education",
    shortDescription:
      "Health education sessions that help older adults understand healthy ageing and take proactive steps toward their wellbeing.",
    description:
      "Through accessible, community-based sessions, we help older adults and their families understand the fundamentals of healthy ageing from recognizing early warning signs to understanding common age-related conditions. Our goal is to replace uncertainty with practical knowledge, so people can make informed decisions about their health long before a crisis occurs.",
    image: { src: "/image/gallery-1.jpg", alt: "A healthcare worker leading a health education session with older adults" }
  },
  {
    slug: "community-health-outreach",
    icon: "users",
    title: "Community Health Outreach",
    shortDescription:
      "Community-based activities that connect older adults with health information, screening opportunities and support.",
    description:
      "We take health information directly into communities — meeting older adults where they already gather. These outreach activities create opportunities for screening referrals, health conversations and connection, helping to close the gap between older adults and the health information and services they need.",
    image: {src:"/image/gallery-2.jpg", alt: "A community health outreach event with older adults and volunteers"}
  },
  {
    slug: "self-care-healthy-ageing",
    icon: "activity",
    title: "Self-Care & Healthy Ageing",
    shortDescription:
      "Practical education around nutrition, physical activity, medication awareness, emotional wellbeing and healthy daily routines.",
    description:
      "Healthy ageing is built through daily habits. We equip older adults with practical, easy-to-apply guidance on nutrition, safe physical activity, medication awareness and emotional wellbeing — helping them build sustainable routines that support long-term independence and quality of life.",
    image: {src:"/image/gallery-3.jpg", alt: "Older adults participating in a self-care and healthy ageing workshop"}
  },
  {
    slug: "elderly-support-care",
    icon: "hand-heart",
    title: "Elderly Support & Care",
    shortDescription:
      "Building community networks that help older adults feel connected, valued and supported.",
    description:
      "Isolation is one of the quiet challenges of ageing. We work to build supportive community networks around older adults — connecting them with peers, volunteers and local support systems so that no one has to navigate ageing alone.",
    image: {src:"/image/gallery-4.jpg", alt: "A group of older adults and volunteers engaging in a community support activity"},
  },
  {
    slug: "caregiver-education",
    icon: "heart-handshake",
    title: "Caregiver Education",
    shortDescription:
      "Supporting families and caregivers with knowledge and practical resources for caring for older adults.",
    description:
      "Family members and caregivers are often the first line of support for older adults, yet they rarely receive formal guidance. We provide practical education and resources to help caregivers navigate the physical, emotional and logistical realities of caring for an older loved one with confidence.",
    image: {src:"/image/gallery-5.jpg", alt: "A caregiver learning about elderly care best practices in a workshop"},
  },
  {
    slug: "health-screening-awareness",
    icon: "stethoscope",
    title: "Health Screening & Awareness",
    shortDescription:
      "Promoting early awareness and preventive approaches through community outreach and health-focused initiatives.",
    description:
      "Early awareness saves lives. Through community-focused initiatives, we promote the importance of regular health checks and help connect older adults with screening opportunities and health information — encouraging a proactive, rather than reactive, approach to health.",
    image: {src:"/image/gallery-6.jpg", alt: "Older adults participating in a health screening event"},
  },
];

export const approachSteps = [
  {
    title: "Educate",
    description:
      "We provide practical knowledge about healthy ageing and preventive health.",
  },
  {
    title: "Prevent",
    description:
      "We encourage proactive health and self-care practices.",
  },
  {
    title: "Connect",
    description:
      "We build supportive networks around older adults.",
  },
  {
    title: "Empower",
    description:
      "We help older adults make informed choices and maintain independence and dignity.",
  },
] as const;
