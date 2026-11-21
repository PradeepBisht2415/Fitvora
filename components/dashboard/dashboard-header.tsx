'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-browser';
import { Button } from '@/components/ui/button';
import {
  UtensilsCrossed,
  CreditCard,
  LogOut,
  Sparkles,
  ClipboardCheck,
  User,
  TrendingUp,
  MessageSquare,
  Shield,
  Eye,
} from 'lucide-react';

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const asMember = searchParams.get('asMember');

  // Memoize supabase client so it doesn't re-instantiate on every render
  const supabase = React.useMemo(() => createClient(), []);

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [memberInfo, setMemberInfo] = React.useState<{ name: string; email: string } | null>(null);
  const [supportBadgeCount, setSupportBadgeCount] = React.useState(0);

  const fetchBadge = React.useCallback(() => {
    fetch(`/api/support/badge-count${asMember ? `?asMember=${asMember}` : ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.count === 'number') {
          setSupportBadgeCount(data.count);
        }
      })
      .catch((err) => console.error('Error fetching member support badge:', err));
  }, [asMember]);

  React.useEffect(() => {
    fetchBadge();
    const interval = setInterval(fetchBadge, 20000);
    const onRead = () => fetchBadge();
    window.addEventListener('fitvora:support-read', onRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener('fitvora:support-read', onRead);
    };
  }, [fetchBadge]);

  React.useEffect(() => {
    let isMounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!isMounted || !data.user) {
        if (isMounted) setIsAdmin(false);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!isMounted) return;
      const userIsAdmin = profile?.role === 'admin';
      setIsAdmin(userIsAdmin);

      // If admin is previewing a client, load client details for banner
      if (userIsAdmin && asMember) {
        const { data: clientData } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', asMember)
          .maybeSingle();

        if (isMounted && clientData) {
          const name = [clientData.first_name, clientData.last_name].filter(Boolean).join(' ') || 'Member';
          setMemberInfo({ name, email: clientData.email });
        }
      }
    }).catch(err => {
      console.warn('Could not verify user role:', err);
    });

    return () => {
      isMounted = false;
    };
  }, [supabase, asMember]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { label: 'Overview', href: '/dashboard', icon: Sparkles },
    { label: '7-Day Plan', href: '/dashboard/meal-plan', icon: UtensilsCrossed },
    { label: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
    { label: 'Check-ins', href: '/dashboard/check-in', icon: ClipboardCheck },
    { label: 'Support', href: '/dashboard/support', icon: MessageSquare },
    { label: 'Subscription', href: '/dashboard/subscription', icon: CreditCard },
    { label: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <>
      {/* Admin Impersonation / Client Preview Header */}
      {isAdmin && asMember && (
        <div className="bg-[#075B2B] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald-300 shrink-0" />
            <span>
              <strong>Admin Client View:</strong> Viewing portal as{' '}
              <span className="font-bold underline">
                {memberInfo ? `${memberInfo.name} (${memberInfo.email})` : asMember}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/members/${asMember}`}
              className="rounded bg-white/20 hover:bg-white/30 px-2.5 py-1 text-xs font-semibold text-white transition-colors"
            >
              Open Member Desk &rarr;
            </Link>
            <Link
              href="/admin"
              className="rounded bg-white px-2.5 py-1 text-xs font-bold text-[#075B2B] hover:bg-emerald-50 transition-colors shadow-xs"
            >
              Exit to Admin Portal &times;
            </Link>
          </div>
        </div>
      )}

      {/* Admin Preview Header without specific client */}
      {isAdmin && !asMember && (
        <div className="bg-[#075B2B] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-emerald-300 shrink-0" />
            <span>
              <strong>Admin Mode:</strong> Viewing Member Portal (Live Experience Preview).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/members"
              className="rounded bg-white/20 hover:bg-white/30 px-2.5 py-1 text-xs font-semibold text-white transition-colors"
            >
              Select Client to Preview &rarr;
            </Link>
            <Link
              href="/admin"
              className="rounded bg-white px-2.5 py-1 text-xs font-bold text-[#075B2B] hover:bg-emerald-50 transition-colors shadow-xs"
            >
              Exit to Admin Portal &times;
            </Link>
          </div>
        </div>
      )}

      {/* Member Portal Header */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href={asMember ? `/dashboard?asMember=${asMember}` : '/dashboard'} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#075B2B] text-white font-extrabold text-base shadow-xs">
                F
              </span>
              <span className="font-extrabold tracking-tight text-xl text-[#075B2B]">
                Fitvora
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  asMember
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {asMember ? 'Client View' : 'Member'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const itemHref = asMember ? `${item.href}?asMember=${asMember}` : item.href;
                return (
                  <Link
                    key={item.href}
                    href={itemHref}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#EAF8E7] text-[#075B2B]'
                        : 'text-[#1A2E1C]/70 hover:bg-gray-100 hover:text-[#1A2E1C]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.href === '/dashboard/support' && supportBadgeCount > 0 && (
                      <span
                        className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#075B2B] px-1 text-[10px] font-bold text-white shadow-xs animate-in fade-in"
                        title={`${supportBadgeCount} unread message${supportBadgeCount > 1 ? 's' : ''}`}
                      >
                        {supportBadgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#075B2B] hover:bg-emerald-100 transition-colors shadow-xs"
                title="Go to Admin Portal"
              >
                <Shield className="h-3.5 w-3.5 text-[#2FAF37]" />
                <span>Admin Portal</span>
              </Link>
            )}
            <Link href="/" className="text-xs text-gray-500 hover:text-[#075B2B] hidden sm:inline">
              Public Site
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-gray-200 text-xs text-gray-700 hover:bg-gray-100 h-8"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-emerald-50 px-2 py-1.5 justify-around bg-emerald-50/30">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const itemHref = asMember ? `${item.href}?asMember=${asMember}` : item.href;
            return (
              <Link
                key={item.href}
                href={itemHref}
                className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-[10px] font-semibold transition-colors ${
                  isActive
                    ? 'text-[#075B2B]'
                    : 'text-[#1A2E1C]/60 hover:text-[#1A2E1C]'
                }`}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {item.href === '/dashboard/support' && supportBadgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-[#075B2B] px-0.5 text-[8px] font-bold text-white">
                      {supportBadgeCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>
    </>
  );
}
