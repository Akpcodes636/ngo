import Image from "next/image";
import Link from "next/link";
import { Container } from "./ui/Container";
import { site, footerLinks, legalLinks, contact, socialLinks } from "@/data/site";
import { logo } from "@/data/images";
import { NewsletterForm } from "./NewsletterForm";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  YoutubeIcon,
  XSocialIcon,
} from "./icons/SocialIcons";

const iconMap = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  twitter: XSocialIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
};

export function Footer() {
  return (
    <footer className="bg-forest-900 text-sage-light">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="font-display text-lg font-semibold text-white">
              Healthy Golden Years Initiative
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sage-light/90">
            {site.tagline}
          </p>
          <ul className="mt-6 flex gap-3">
            {socialLinks.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap];
              return (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold-400 hover:text-gold-400"
                  >
                    <Icon size={18} aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label="Footer" className="lg:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold-300">
            Explore
          </h3>
          <ul className="mt-4 space-y-3">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[15px] text-sage-light/90 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="text-[15px] text-sage-light/90 hover:text-white"
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="lg:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold-300">
            Contact
          </h3>
          <ul className="mt-4 space-y-3 text-[15px] text-sage-light/90">
            <li>{contact.phone}</li>
            <li>{contact.phone}</li>
            <li>
              {contact.addressLine1}
              <br />
              {contact.addressLine2}
            </li>
          </ul>
          <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-gold-300">
            Legal
          </h3>
          <ul className="mt-4 space-y-3">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[15px] text-sage-light/90 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-1">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gold-300">
            Stay Connected
          </h3>
          <p className="mt-4 text-[15px] text-sage-light/90">
            Get occasional updates on our programs and community outreach.
          </p>
          <NewsletterForm />
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-center text-sm text-sage-light/70 sm:flex-row sm:text-left">
          <p>© 2026 Healthy Golden Years Initiative. All rights reserved.</p>
          <p>Registered Nonprofit Organization — Nigeria</p>
        </Container>
      </div>
    </footer>
  );
}
