'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProfileFormProps {
  initialData: {
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    timezone: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialData.firstName);
  const [lastName, setLastName] = useState(initialData.lastName || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [timezone, setTimezone] = useState(initialData.timezone || 'Asia/Kolkata');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || null,
          phone: phone.trim() || null,
          timezone,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to update profile');
      } else {
        setSuccess('Profile updated successfully!');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-xs">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="text-base font-bold text-[#1A2E1C]">Contact & Account Details</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Manage your personal information and local notification timezone
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#2FAF37] shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={initialData.email}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              Contact support if you need to transfer your account to another email.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
                <option value="Europe/London">Europe/London (GMT - UTC+00:00)</option>
                <option value="America/New_York">America/New_York (EST - UTC-05:00)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST - UTC-08:00)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 px-5 text-xs h-9"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
