import type { Metadata } from "next";
import { MessageCircle, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/ContactForm";
import { AnimateIn } from "@/components/AnimateIn";
import { contact, socialLinks } from "@/data/site";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  XSocialIcon,
} from "@/components/icons/SocialIcons";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Healthy Golden Years Initiative — for partnerships, volunteering, media enquiries or general questions about our elderly health programs.",
};

const iconMap = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: XSocialIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-forest-900 py-20 sm:py-28">
        <Container>
          <SectionHeading
            level="h1"
            eyebrow="Contact"
            title="We'd Love to Hear From You."
            description="Whether you're a partner, volunteer, donor or simply curious about our work — reach out."
            tone="light"
            className="max-w-2xl"
          />
        </Container>
      </section>

      <section className="bg-cream py-20 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-5 lg:gap-16">
          <AnimateIn animation="fade-left" className="space-y-8 lg:col-span-2">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-forest-700 text-gold-300">
                <MessageCircle size={22} aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-forest-800">WhatsApp</h3>
                <p className="mt-1 text-stone-warm">{contact.whatsapp}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-forest-700 text-gold-300">
                <Phone size={22} aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-forest-800">Phone</h3>
                <p className="mt-1 text-stone-warm">{contact.phone}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-forest-700 text-gold-300">
                <MapPin size={22} aria-hidden />
              </span>
              <div>
                <h3 className="font-semibold text-forest-800">Address</h3>
                <p className="mt-1 text-stone-warm">
                  {contact.addressLine1}
                  <br />
                  {contact.addressLine2}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-forest-800">Follow Us</h3>
              <ul className="mt-3 flex gap-3">
                {socialLinks.map((s) => {
                  const Icon = iconMap[s.icon as keyof typeof iconMap];
                  return (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        aria-label={s.label}
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-forest-200 text-forest-700 transition-colors hover:border-forest-600 hover:text-forest-900"
                      >
                        <Icon size={18} aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </AnimateIn>

          <AnimateIn animation="fade-right" delay={100} className="rounded-lg border border-forest-100 bg-white p-7 shadow-sm sm:p-10 lg:col-span-3">
            <ContactForm />
          </AnimateIn>
        </Container>
      </section>
    </>
  );
}
