'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { AdminNav } from '@/components/admin/admin-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Plus,
  Search,
  UtensilsCrossed,
  Filter,
  Flame,
  Dna,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { MealTemplate } from '@/types/database.types';

function MealLibraryContent() {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [slotFilter, setSlotFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/meal-templates')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setTemplates(data.templates || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.regional_tags?.some((r) => r.toLowerCase().includes(q)) ||
        t.allergen_tags?.some((a) => a.toLowerCase().includes(q));

      const matchesSlot = slotFilter === 'all' || t.meal_type === slotFilter;
      const matchesDiet = dietFilter === 'all' || t.diet_category === dietFilter;

      return matchesSearch && matchesSlot && matchesDiet;
    });
  }, [templates, search, slotFilter, dietFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A2E1C]">Indian Meal Library</h1>
          <p className="text-xs text-[#1A2E1C]/70 mt-1">
            Reusable home-cooked meal templates with exact portion measures and alternative swaps
          </p>
        </div>

        <Link href="/admin/meal-library/new">
          <Button className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 font-medium text-xs shadow-xs">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Meal Template
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by meal name, regional tag, or allergen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-[#1A2E1C] placeholder:text-gray-400 focus:border-[#075B2B] focus:outline-none focus:ring-1 focus:ring-[#075B2B]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Meal Slot Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-[#1A2E1C] focus:outline-none"
            >
              <option value="all">All Meal Slots</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="evening_snack">Evening Snack</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          {/* Diet Category Filter */}
          <div className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-[#1A2E1C] focus:outline-none"
            >
              <option value="all">All Diet Types</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="eggetarian">Eggetarian</option>
              <option value="non_vegetarian">Non-Vegetarian</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Meal Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B] mx-auto"></div>
          <p className="mt-2 text-xs text-gray-500">Loading Indian meal templates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No Meal Templates Found"
          description="Try broadening your search query or clear your meal slot filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((meal) => (
            <Card
              key={meal.id}
              className="bg-white border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge
                    variant="outline"
                    className="capitalize text-[10px] font-semibold border-emerald-200 bg-emerald-50 text-emerald-800"
                  >
                    {meal.meal_type.replace('_', ' ')}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${
                      meal.diet_category === 'non_vegetarian'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : meal.diet_category === 'eggetarian'
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {meal.diet_category.replace('_', ' ')}
                  </Badge>
                </div>

                <CardTitle className="text-base font-bold text-[#1A2E1C] leading-snug">
                  {meal.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3 pt-3 text-xs flex-1">
                {/* Default portion */}
                <div className="bg-gray-50/80 rounded-lg p-2.5 border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold block">
                    Portion
                  </span>
                  <p className="font-semibold text-gray-800 mt-0.5">{meal.default_portion}</p>
                </div>

                {/* Macro breakdown */}
                <div className="flex items-center gap-4 text-gray-600">
                  {meal.approx_calories && (
                    <div className="flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span>{meal.approx_calories} kcal</span>
                    </div>
                  )}
                  {meal.approx_protein_g && (
                    <div className="flex items-center gap-1">
                      <Dna className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{meal.approx_protein_g}g protein</span>
                    </div>
                  )}
                </div>

                {/* Regional and allergen badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {meal.regional_tags?.map((reg) => (
                    <span
                      key={reg}
                      className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100"
                    >
                      {reg}
                    </span>
                  ))}
                  {meal.allergen_tags?.map((allg) => (
                    <span
                      key={allg}
                      className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 border border-red-100"
                    >
                      ⚠ {allg}
                    </span>
                  ))}
                </div>
              </CardContent>

              <div className="border-t border-gray-100 p-3 bg-gray-50/50 rounded-b-xl flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  {Array.isArray(meal.alternatives) ? meal.alternatives.length : 0} swaps
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  <Clock className="inline h-3 w-3 mr-0.5" />
                  Ready
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MealLibraryPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075B2B] mx-auto"></div>
              <p className="mt-2 text-xs text-gray-500">Loading meal library...</p>
            </div>
          }
        >
          <MealLibraryContent />
        </Suspense>
      </main>
    </div>
  );
}
