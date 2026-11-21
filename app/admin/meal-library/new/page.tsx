'use client';

import React from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { MealTemplateForm } from '@/components/admin/meal-template-form';
import { ArrowLeft } from 'lucide-react';

export default function NewMealTemplatePage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <Link
            href="/admin/meal-library"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A2E1C]">
              New Indian Meal Template
            </h1>
            <p className="text-xs text-[#1A2E1C]/70 mt-0.5">
              Create a reusable recipe template with ingredients, household portions, and alternative swaps
            </p>
          </div>
        </div>

        <MealTemplateForm />
      </main>
    </div>
  );
}
