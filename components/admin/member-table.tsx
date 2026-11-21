'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Eye, Users, Filter } from 'lucide-react';
import type { MembershipStatus } from '@/types/database.types';

export interface AdminMemberRow {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  tier: 'normal' | 'premium' | 'none';
  lifecycleStatus: MembershipStatus;
  joinedAt: string | null;
  subscriptionStatus?: string | null;
}

interface MemberTableProps {
  initialMembers: AdminMemberRow[];
}

export function MemberTable({ initialMembers }: MemberTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((m) => {
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
  }, [initialMembers, searchQuery, statusFilter, tierFilter]);

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
        </div>
      </div>

      {/* Table Content */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={initialMembers.length === 0 ? 'Zero Registered Members' : 'No Members Match Filters'}
          description={
            initialMembers.length === 0
              ? 'Fitvora launches with zero real members. As approved assessment leads claim invitations and complete payment, they will appear here.'
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
                      {member.name}
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
                          None
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
                      <Link href={`/admin/members/${member.userId}`}>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs border-emerald-200 text-[#075B2B] hover:bg-emerald-50">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </Link>
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
