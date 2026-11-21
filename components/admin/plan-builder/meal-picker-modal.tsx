'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, UtensilsCrossed, Check, Flame, Dna } from 'lucide-react';
import type { MealTemplate } from '@/types/database.types';

interface MealPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: MealTemplate) => void;
  targetMealType?: string;
}

export function MealPickerModal({
  isOpen,
  onClose,
  onSelect,
  targetMealType,
}: MealPickerModalProps) {
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState(targetMealType || 'all');

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.regional_tags?.some((r) => r.toLowerCase().includes(q)) ||
        t.allergen_tags?.some((a) => a.toLowerCase().includes(q));

      const matchesType =
        selectedType === 'all' || t.meal_type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [templates, search, selectedType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/70">
          <div>
            <h3 className="text-base font-bold text-[#1A2E1C] flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-[#075B2B]" />
              Select Meal from Library
            </h3>
            <p className="text-xs text-gray-500">
              Pick an authentic Indian recipe with pre-balanced macros and portion measures
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="border-b border-gray-100 p-4 bg-white flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, regional tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-[#075B2B]"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700"
          >
            <option value="all">All Meal Types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="evening_snack">Evening Snack</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#075B2B] mx-auto mb-2"></div>
              Loading meal templates...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 italic">
              No matching recipes found in library.
            </div>
          ) : (
            filtered.map((meal) => (
              <div
                key={meal.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 p-3.5 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200">
                      {meal.meal_type.replace('_', ' ')}
                    </Badge>
                    <span className="font-bold text-[#1A2E1C] text-sm">
                      {meal.title}
                    </span>
                  </div>

                  <p className="text-gray-600">
                    <span className="font-medium text-gray-700">Portion:</span> {meal.default_portion}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-gray-500 text-[11px]">
                    {meal.approx_calories && (
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-500" />
                        {meal.approx_calories} kcal
                      </span>
                    )}
                    {meal.approx_protein_g && (
                      <span className="flex items-center gap-1">
                        <Dna className="h-3 w-3 text-emerald-600" />
                        {meal.approx_protein_g}g protein
                      </span>
                    )}
                    {meal.allergen_tags && meal.allergen_tags.length > 0 && (
                      <span className="text-red-600 font-medium">
                        Contains: {meal.allergen_tags.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onSelect(meal);
                    onClose();
                  }}
                  className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 h-8 text-xs shrink-0"
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Select Meal
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
