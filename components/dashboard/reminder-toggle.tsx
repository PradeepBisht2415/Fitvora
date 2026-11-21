'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';

export function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch('/api/member/reminders')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setEnabled(Boolean(data.enabled));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching reminder settings:', err);
        setLoading(false);
      });
  }, []);

  const handleToggle = async () => {
    setUpdating(true);
    const nextState = !enabled;
    try {
      const res = await fetch('/api/member/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState }),
      });

      if (res.ok) {
        setEnabled(nextState);
      }
    } catch (err) {
      console.error('Failed to update reminders:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Loading reminder preferences...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-[#FFFDF7] p-4">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
            enabled ? 'bg-emerald-100 text-[#075B2B]' : 'bg-gray-100 text-gray-400'
          }`}
        >
          {enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#1A2E1C]">Meal Schedule Reminders</h4>
          <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
            Receive respectful notifications 30 minutes before your scheduled meals. Quiet hours (10 PM to 7 AM) are strictly respected.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={updating}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? 'bg-[#075B2B]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
