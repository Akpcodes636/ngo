import type { Metadata } from "next";
import Image from "next/image";
import { BookOpen, Users, Activity, HandHeart, FileText, ShieldCheck, Landmark, ClipboardList } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { DonationForm } from "@/components/DonationForm";
import { donateHeroImage } from "@/data/images";
import { bankTransfer } from "@/data/site";

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Healthy Golden Years Initiative's preventive health education, community outreach and elderly support programs in Nigeria.",
};

const supportAreas = [
  {
    icon: BookOpen,
    title: "Preventive Health Education",
    description:
      "Helping fund community sessions that teach older adults how to protect their health before problems arise.",
  },
  {
    icon: Users,
    title: "Community Outreach",
    description:
      "Bringing health information and support directly into neighborhoods and community gatherings.",
  },
  {
    icon: Activity,
    title: "Self-Care Programs",
    description:
      "Supporting practical resources on nutrition, activity and wellbeing that help older adults stay independent.",
  },
  {
    icon: HandHeart,
    title: "Support for Older Adults",
    description:
      "Strengthening the community and caregiver networks that keep older adults connected and cared for.",
  },
];

const transparencyItems = [
  { icon: FileText, title: "Annual Reports", note: "To be published" },
  { icon: ClipboardList, title: "Financial Reports", note: "To be published" },
  { icon: Activity, title: "Impact Reports", note: "To be published" },
  { icon: Landmark, title: "Registration Information", note: "To be provided" },
  { icon: ShieldCheck, title: "Safeguarding Policy", note: "To be published" },
];

export default function DonatePage() {
  return (
    <>
      <section className="bg-forest-900 py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            level="h1"
            eyebrow="Donate"
            title="Help Us Build Healthier Golden Years."
            description="Your support helps us expand preventive health education, community outreach, self-care resources and support for older adults and vulnerable people."
            tone="light"
          />
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg">
            <Image
              src="/image/donate.jpg"
              alt={donateHeroImage.alt}
              width={500}
              height={500}
              className="object-cover w-full h-full"
            />
          </div>
        </Container>
      </section>

      {/* DONATION FORM + BANK TRANSFER */}
      <section className="bg-cream py-20 sm:py-24">
        <Container className="grid gap-8 lg:grid-cols-5 lg:gap-16">
          <div className="rounded-lg border border-forest-100 bg-white p-7 shadow-sm sm:p-10 lg:col-span-3">
            <h2 className="text-2xl font-semibold text-forest-800">
              Make a Donation
            </h2>
            <div className="mt-8">
              <DonationForm />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg border-2 border-gold-300 bg-gold-50 p-7 sm:p-8">
              <h2 className="text-xl font-semibold text-forest-800">
                Bank Transfer
              </h2>
              <p className="mt-2 text-[15px] text-stone-warm">
                Prefer a direct transfer? Use the details below.
              </p>
              <dl className="mt-6 space-y-4 text-[15px]">
                <div>
                  <dt className="font-semibold text-forest-800">Account Name</dt>
                  <dd className="text-stone-warm">{bankTransfer.accountName}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-800">Bank</dt>
                  <dd className="text-stone-warm">{bankTransfer.bankName}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-forest-800">Account Number</dt>
                  <dd className="text-stone-warm">{bankTransfer.accountNumber}</dd>
                </div>
              </dl>
              <p className="mt-6 text-xs text-stone-warm">
                Bank details will be published once verified by the
                organization. Please contact us to confirm before making a
                transfer.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* WHERE YOUR SUPPORT GOES */}
      <section className="bg-forest-800 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Where Your Support Goes"
            title="Every Donation Expands Our Reach."
            description="We do not publish exact percentage breakdowns until independently verified — but here is how your support helps our work grow."
            align="center"
            tone="light"
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {supportAreas.map((area) => (
              <div
                key={area.title}
                className="rounded-lg border border-white/10 bg-white/5 p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-gold-500 text-forest-900">
                  <area.icon size={22} aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {area.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-sage-light">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* TRANSPARENCY */}
      <section id="transparency" className="scroll-mt-24 bg-cream py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Transparency"
            title="Your Trust Matters."
            description="We are committed to responsible stewardship of every resource entrusted to us. The documents below will be published as they become available."
            align="center"
            className="mx-auto"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {transparencyItems.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border-2 border-dashed border-forest-200 bg-white p-6 text-center"
              >
                <item.icon className="mx-auto text-forest-600" size={28} aria-hidden />
                <h3 className="mt-3 text-sm font-semibold text-forest-800">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-stone-warm">{item.note}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
