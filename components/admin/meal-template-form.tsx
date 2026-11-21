'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Alternative {
  title: string;
  portion: string;
}

export function MealTemplateForm() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [mealType, setMealType] = useState<
    'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner' | 'post_dinner'
  >('lunch');
  const [dietCategory, setDietCategory] = useState<'vegetarian' | 'eggetarian' | 'non_vegetarian'>('vegetarian');
  const [defaultPortion, setDefaultPortion] = useState('');
  const [approxCalories, setApproxCalories] = useState<number | ''>('');
  const [approxProtein, setApproxProtein] = useState<number | ''>('');
  const [prepNotes, setPrepNotes] = useState('');
  const [regionalTagsInput, setRegionalTagsInput] = useState('north_indian, pan_indian');
  const [allergenTagsInput, setAllergenTagsInput] = useState('');

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '', unit: '' },
  ]);

  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { title: '', portion: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients];
    const item = updated[index];
    if (item) {
      item[field] = value;
      setIngredients(updated);
    }
  };

  const handleAddAlternative = () => {
    setAlternatives([...alternatives, { title: '', portion: '' }]);
  };

  const handleRemoveAlternative = (index: number) => {
    setAlternatives(alternatives.filter((_, i) => i !== index));
  };

  const handleUpdateAlternative = (index: number, field: keyof Alternative, value: string) => {
    const updated = [...alternatives];
    const item = updated[index];
    if (item) {
      item[field] = value;
      setAlternatives(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !defaultPortion.trim()) {
      setError('Please provide a title and default portion.');
      return;
    }

    setLoading(true);
    setError(null);

    const regionalTags = regionalTagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const allergenTags = allergenTagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const validIngredients = ingredients.filter((ing) => ing.name.trim() !== '');
    const validAlternatives = alternatives.filter((alt) => alt.title.trim() !== '');

    try {
      const res = await fetch('/api/admin/meal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          meal_type: mealType,
          diet_category: dietCategory,
          default_portion: defaultPortion.trim(),
          preparation_notes: prepNotes.trim() || null,
          approx_calories: approxCalories === '' ? null : Number(approxCalories),
          approx_protein_g: approxProtein === '' ? null : Number(approxProtein),
          regional_tags: regionalTags,
          allergen_tags: allergenTags,
          ingredients: validIngredients,
          alternatives: validAlternatives,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create template');
        setLoading(false);
      } else {
        router.push('/admin/meal-library');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while saving the meal template.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-xs text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Metadata */}
      <Card className="bg-white border-gray-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-base font-bold text-[#1A2E1C]">Basic Meal Details</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Define meal title, slot, and dietary category
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Meal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dal Tadka with 2 Phulkas & Bhindi Sabzi"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Meal Slot</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as unknown as typeof mealType)}
                className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              >
                <option value="breakfast">Breakfast</option>
                <option value="morning_snack">Morning Snack</option>
                <option value="lunch">Lunch</option>
                <option value="evening_snack">Evening Snack</option>
                <option value="dinner">Dinner</option>
                <option value="post_dinner">Post Dinner</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Diet Category</label>
              <select
                value={dietCategory}
                onChange={(e) => setDietCategory(e.target.value as unknown as typeof dietCategory)}
                className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Default Portion in Household Measures
            </label>
            <input
              type="text"
              required
              value={defaultPortion}
              onChange={(e) => setDefaultPortion(e.target.value)}
              placeholder="e.g. 1 katori dal + 2 standard phulkas + 1 katori sabzi"
              className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Approx Calories (kcal)</label>
              <input
                type="number"
                value={approxCalories}
                onChange={(e) => setApproxCalories(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 380"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Approx Protein (grams)</label>
              <input
                type="number"
                step="0.5"
                value={approxProtein}
                onChange={(e) => setApproxProtein(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 14.5"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Preparation Tips / Notes</label>
            <textarea
              rows={2}
              value={prepNotes}
              onChange={(e) => setPrepNotes(e.target.value)}
              placeholder="e.g. Sauté with 1 tsp cold pressed oil; avoid rich gravies before bedtime."
              className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Regional Tags (comma separated)</label>
              <input
                type="text"
                value={regionalTagsInput}
                onChange={(e) => setRegionalTagsInput(e.target.value)}
                placeholder="north_indian, maharashtrian"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Allergen Tags (comma separated)</label>
              <input
                type="text"
                value={allergenTagsInput}
                onChange={(e) => setAllergenTagsInput(e.target.value)}
                placeholder="peanuts, dairy, gluten, mustard"
                className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-800 focus:border-[#075B2B]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients List */}
      <Card className="bg-white border-gray-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#1A2E1C]">Ingredients</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Breakdown of staples used in this meal
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddIngredient}
            className="text-xs border-emerald-200 text-[#075B2B] h-8"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Ingredient
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-4 text-xs">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. Toor dal)"
                value={ing.name}
                onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                className="flex-2 rounded border border-gray-200 p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Qty (e.g. 1)"
                value={ing.quantity}
                onChange={(e) => handleUpdateIngredient(idx, 'quantity', e.target.value)}
                className="flex-1 rounded border border-gray-200 p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Unit (katori / pcs)"
                value={ing.unit}
                onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                className="flex-1 rounded border border-gray-200 p-2 text-xs"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alternatives List */}
      <Card className="bg-white border-gray-200 shadow-xs">
        <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#1A2E1C]">Approved Meal Alternatives</CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Equal-macro swaps members can choose
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddAlternative}
            className="text-xs border-emerald-200 text-[#075B2B] h-8"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Alternative
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-4 text-xs">
          {alternatives.map((alt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Swap meal title (e.g. Moong Dal Khichdi)"
                value={alt.title}
                onChange={(e) => handleUpdateAlternative(idx, 'title', e.target.value)}
                className="flex-2 rounded border border-gray-200 p-2 text-xs"
              />
              <input
                type="text"
                placeholder="Portion (e.g. 1.5 katori + curd)"
                value={alt.portion}
                onChange={(e) => handleUpdateAlternative(idx, 'portion', e.target.value)}
                className="flex-1 rounded border border-gray-200 p-2 text-xs"
              />
              {alternatives.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveAlternative(idx)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/meal-library')}
          className="border-gray-200"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="bg-[#075B2B] text-white hover:bg-[#075B2B]/90 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Template...
            </>
          ) : (
            'Save Meal Template'
          )}
        </Button>
      </div>
    </form>
  );
}
