"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { navLinks, site } from "@/data/site";
import { logo } from "@/data/images";
import { Container } from "./ui/Container";
import { Button } from "./ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-forest-100 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
      <Container className="flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md"
          aria-label={`${site.name} — Home`}
        >
          <Image
            src={logo.src}
            alt={logo.alt}
            width={52}
            height={52}
            className="h-12 w-12 rounded-full object-cover sm:h-14 sm:w-14"
            priority
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-lg font-semibold text-forest-800">
              Healthy Golden Years
            </span>
            <span className="text-xs font-medium uppercase tracking-wide text-gold-600">
              Initiative
            </span>
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 lg:flex"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "relative py-1 text-[15px] font-semibold transition-colors",
                  isActive
                    ? "text-forest-800"
                    : "text-forest-700/80 hover:text-forest-800"
                )}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-gold-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/donate" variant="primary" size="md">
            Donate
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-forest-800 transition-colors hover:bg-forest-50 lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} aria-hidden /> : <Menu size={24} aria-hidden />}
        </button>
      </Container>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 top-20 z-30 bg-black/30 lg:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-down drawer */}
      <div
        id="mobile-menu"
        className={clsx(
          "absolute inset-x-0 top-full z-40 overflow-hidden bg-cream shadow-lg transition-all duration-250 ease-in-out lg:hidden",
          open ? "max-h-[calc(100dvh-5rem)] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav
          aria-label="Mobile"
          className="flex flex-col divide-y divide-forest-100 px-5 py-3"
          onClick={() => setOpen(false)}
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-3 py-4 text-[15px] font-semibold transition-colors",
                  isActive
                    ? "text-forest-800"
                    : "text-forest-700/80 hover:text-forest-800"
                )}
              >
                {isActive && (
                  <span className="h-5 w-0.5 rounded-full bg-gold-500" aria-hidden />
                )}
                <span className={isActive ? "" : "pl-1.5"}>{link.label}</span>
              </Link>
            );
          })}
          <div className="py-5">
            <Button href="/donate" variant="primary" size="md" className="w-full justify-center">
              Donate
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
