'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Eye, Users, Filter, RefreshCw, FileText } from 'lucide-react';
import type { AdminMemberRow } from '@/lib/admin/members-query';

export type { AdminMemberRow };

interface MemberTableProps {
  initialMembers: AdminMemberRow[];
}

export function MemberTable({ initialMembers }: MemberTableProps) {
  const [members, setMembers] = useState<AdminMemberRow[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.members)) {
          setMembers(data.members);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh members:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || m.lifecycleStatus === statusFilter;

      // Tier filter
      const matchesTier =
        tierFilter === 'all' || m.tier === tierFilter;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [members, searchQuery, statusFilter, tierFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-[#1A2E1C] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="registered">Registered</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Tier Select */}
          <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-[#1A2E1C] focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="normal">Normal Plan (₹499)</option>
              <option value="premium">Premium Plan (₹999)</option>
              <option value="none">No Plan</option>
            </select>
          </div>

          {/* Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 border-gray-200 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-2xs"
            title="Refresh members list from database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-[#075B2B]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Table Content */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={members.length === 0 ? 'Zero Registered Members' : 'No Members Match Filters'}
          description={
            members.length === 0
              ? 'As users register accounts, take intake assessments, or claim subscriptions, they will automatically appear in this directory.'
              : 'Try clearing your search query or adjusting your status and tier filters.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EAF8E7]/50 text-gray-700 uppercase tracking-wider text-[11px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Member</th>
                  <th className="py-3 px-4 font-semibold">Contact</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold">Lifecycle Status</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filteredMembers.map((member) => (
                  <tr key={member.userId} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1A2E1C]">
                      <div className="flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.isLead && (
                          <span className="rounded bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wide">
                            Intake Lead
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#1A2E1C]">{member.email}</div>
                      {member.phone ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <a
                            href={`tel:${member.phone}`}
                            className="font-semibold text-xs text-[#075B2B] hover:underline"
                            title="Call candidate"
                          >
                            📞 +91 {member.phone}
                          </a>
                          <a
                            href={`https://wa.me/91${member.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold hover:bg-emerald-200"
                            title="Open WhatsApp chat"
                          >
                            WhatsApp
                          </a>
                        </div>
                      ) : (
                        <div className="text-[11px] text-gray-400">No phone recorded</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {member.tier === 'premium' ? (
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-800 font-semibold">
                          Premium (₹999)
                        </Badge>
                      ) : member.tier === 'normal' ? (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold">
                          Normal (₹499)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500">
                          {member.subscriptionStatus || 'No Plan'}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={member.lifecycleStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-gray-500">
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {member.isLead && member.assessmentId ? (
                          <Link href={`/admin/assessments/${member.assessmentId}`}>
                            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs border-emerald-300 bg-emerald-50 text-[#075B2B] hover:bg-emerald-100 font-bold flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>View Intake</span>
                            </Button>
                          </Link>
                        ) : (
                          <>
                            <Link
                              href={`/dashboard?asMember=${member.userId}`}
                              className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-[#075B2B] hover:bg-emerald-100 transition-colors shadow-2xs"
                              title={`View live dashboard as client ${member.name}`}
                            >
                              <Eye className="h-3 w-3 text-[#2FAF37]" />
                              <span>Client Dashboard</span>
                            </Link>
                            <Link href={`/admin/members/${member.userId}`}>
                              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs border-gray-200 text-gray-700 hover:bg-gray-100">
                                View Desk
                              </Button>
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
