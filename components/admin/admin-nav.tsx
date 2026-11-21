'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  Users,
  CreditCard,
  ArrowLeft,
  UtensilsCrossed,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react';

function AdminNavContent() {
  const pathname = usePathname();

  const links = [
    { label: 'Intake Triage', href: '/admin/assessments', icon: ClipboardList },
    { label: 'Members', href: '/admin/members', icon: Users },
    { label: 'Meal Library', href: '/admin/meal-library', icon: UtensilsCrossed },
    { label: 'Check-Ins', href: '/admin/check-ins', icon: ClipboardCheck },
    { label: 'Support', href: '/admin/support', icon: MessageSquare },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  ];

  return (
    <header className="border-b border-border-soft bg-white px-4 py-3 sm:px-6 lg:px-8 sticky top-0 z-40 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#075B2B] hover:opacity-80 p-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2FAF37]">
              Founder Admin Portal
            </span>
            <h1 className="text-lg font-extrabold text-[#1A2E1C]">Fitvora Operations</h1>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#EAF8E7] text-[#075B2B]'
                    : 'text-[#1A2E1C]/70 hover:bg-gray-100 hover:text-[#1A2E1C]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function AdminNav() {
  return (
    <Suspense fallback={<header className="border-b border-border-soft bg-white h-14" />}>
      <AdminNavContent />
    </Suspense>
  );
}
