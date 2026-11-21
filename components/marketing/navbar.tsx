'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/weight-loss', label: 'Weight Loss' },
  { href: '/weight-gain', label: 'Weight Gain' },
  { href: '/plans', label: 'Plans & Pricing' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-soft bg-warm-cream/95 backdrop-blur supports-[backdrop-filter]:bg-warm-cream/80">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-green text-white shadow-sm">
            <Leaf className="h-5 w-5 fill-pale-green text-pale-green" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-forest-green">
              Fitvora
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-text">
              Home Food Wellness
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-semibold transition-colors hover:text-forest-green',
                  isActive
                    ? 'text-forest-green underline underline-offset-8 decoration-2'
                    : 'text-muted-text'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3.5 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-semibold text-forest-green">
              Sign In
            </Button>
          </Link>
          <Link href="/assessment">
            <Button variant="fresh" size="default" className="shadow-sm font-bold">
              Start My Journey
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/assessment">
            <Button variant="fresh" size="sm" className="text-xs font-bold px-3">
              Start
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-soft bg-white text-dark-text hover:bg-pale-green/40 focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border-soft bg-warm-cream px-4 pt-3 pb-6 md:hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-base font-semibold transition-colors',
                  pathname === link.href
                    ? 'bg-pale-green text-forest-green'
                    : 'text-dark-text hover:bg-pale-green/50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border-soft flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link href="/assessment" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="fresh" className="w-full justify-center font-bold">
                  Start My Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
