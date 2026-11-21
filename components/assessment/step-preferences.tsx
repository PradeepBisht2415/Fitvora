import * as React from 'react';
import { type PreferencesData } from '@/lib/validation/assessment-schema';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface StepPreferencesProps {
  data: PreferencesData;
  onChange: (data: Partial<PreferencesData>) => void;
  errors?: Record<string, string>;
}

const COMMON_ALLERGIES = [
  { id: 'peanuts', label: 'Peanuts (Mungfali)' },
  { id: 'gluten', label: 'Gluten / Wheat' },
  { id: 'dairy', label: 'Dairy / Lactose' },
  { id: 'mustard', label: 'Mustard (Sarson)' },
  { id: 'soy', label: 'Soy / Soya' },
  { id: 'tree_nuts', label: 'Tree Nuts (Almonds, Cashews)' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'shellfish', label: 'Fish / Shellfish' },
];

export function StepPreferences({
  data,
  onChange,
}: StepPreferencesProps) {
  const [dislikeInput, setDislikeInput] = React.useState('');

  const toggleAllergy = (id: string) => {
    const current = data.allergies || [];
    if (current.includes(id)) {
      onChange({ allergies: current.filter((item) => item !== id) });
    } else {
      onChange({ allergies: [...current, id] });
    }
  };

  const addDislike = () => {
    const trimmed = dislikeInput.trim();
    if (trimmed && !data.dislikes?.includes(trimmed)) {
      onChange({ dislikes: [...(data.dislikes || []), trimmed] });
      setDislikeInput('');
    }
  };

  const removeDislike = (item: string) => {
    onChange({ dislikes: (data.dislikes || []).filter((d) => d !== item) });
  };

  return (
    <Card className="border-border-soft shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-forest-green">Food & Taste Preferences</CardTitle>
        <CardDescription>
          No boring salads. We customize around your regional cuisine and favorite comfort foods.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Diet Type */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Dietary Category <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              { id: 'vegetarian', label: 'Vegetarian', desc: 'Dal, paneer, curd, veggies, grains' },
              { id: 'eggetarian', label: 'Eggetarian', desc: 'Vegetarian plus whole eggs' },
              { id: 'non_vegetarian', label: 'Non-Vegetarian', desc: 'Chicken, fish, eggs, and mutton' },
            ].map((diet) => (
              <button
                key={diet.id}
                type="button"
                onClick={() =>
                  onChange({ diet_type: diet.id as PreferencesData['diet_type'] })
                }
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  data.diet_type === diet.id
                    ? 'border-forest-green bg-pale-green text-forest-green shadow-sm ring-1 ring-forest-green'
                    : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                }`}
              >
                <div className="font-bold text-sm">{diet.label}</div>
                <div className="text-xs text-muted-text mt-0.5">{diet.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Regional Style */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Regional Cooking Preference <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { id: 'north_indian', label: 'North Indian', sub: 'Roti, Rajma, Sabzi, Paneer' },
              { id: 'south_indian', label: 'South Indian', sub: 'Idli, Dosa, Sambhar, Rasam' },
              { id: 'maharashtrian', label: 'Maharashtrian', sub: 'Poha, Bhakri, Usal, Pithla' },
              { id: 'gujarati', label: 'Gujarati', sub: 'Khichdi, Kadhi, Thepla, Shaak' },
              { id: 'bengali', label: 'Bengali', sub: 'Bhaat, Dal, Machher Jhol, Sabzi' },
              { id: 'pan_indian', label: 'Pan-Indian / Mixed', sub: 'Varied comfort staples' },
            ].map((reg) => (
              <button
                key={reg.id}
                type="button"
                onClick={() =>
                  onChange({
                    regional_preference: reg.id as PreferencesData['regional_preference'],
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  data.regional_preference === reg.id
                    ? 'border-forest-green bg-pale-green text-forest-green shadow-sm ring-1 ring-forest-green'
                    : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                }`}
              >
                <div className="font-bold text-xs">{reg.label}</div>
                <div className="text-[10px] text-muted-text mt-0.5">{reg.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Setup */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            How are your meals prepared? <span className="text-destructive">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { id: 'cooks_at_home', label: 'I Cook Myself', desc: 'Simple quick recipes' },
              { id: 'family_cooks', label: 'Family Kitchen', desc: 'Adapts to family meals' },
              { id: 'cook_or_maid', label: 'Cook / Maid', desc: 'Clear ingredient instructions' },
              { id: 'tiffin_or_mess', label: 'Tiffin / Mess', desc: 'Select from available options' },
            ].map((setup) => (
              <button
                key={setup.id}
                type="button"
                onClick={() =>
                  onChange({
                    cooking_access: setup.id as PreferencesData['cooking_access'],
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all ${
                  data.cooking_access === setup.id
                    ? 'border-forest-green bg-pale-green text-forest-green shadow-sm ring-1 ring-forest-green'
                    : 'border-border-soft bg-white text-dark-text hover:bg-pale-green/20'
                }`}
              >
                <div className="font-bold text-xs">{setup.label}</div>
                <div className="text-[10px] text-muted-text mt-0.5">{setup.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Food Allergies */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Known Food Allergies <span className="text-xs text-muted-text font-normal">(Select any that apply)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map((allergy) => {
              const isSelected = data.allergies?.includes(allergy.id);
              return (
                <button
                  key={allergy.id}
                  type="button"
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                    isSelected
                      ? 'bg-destructive text-white border-destructive'
                      : 'bg-white text-dark-text border-border-soft hover:bg-red-50'
                  }`}
                >
                  {isSelected ? `✓ ${allergy.label}` : `+ ${allergy.label}`}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-text">
            Ingredients matching your allergies will be automatically flagged and excluded from your plans.
          </p>
        </div>

        {/* Dislikes / Foods to Avoid */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-dark-text">
            Foods You Dislike <span className="text-xs text-muted-text font-normal">(e.g. Karela, Baingan, Capsicum)</span>
          </label>
          <div className="flex gap-2">
            <Input
              value={dislikeInput}
              onChange={(e) => setDislikeInput(e.target.value)}
              placeholder="Type an ingredient and press Add"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDislike();
                }
              }}
            />
            <button
              type="button"
              onClick={addDislike}
              className="px-4 py-2 bg-pale-green border border-forest-green/20 rounded-xl text-xs font-bold text-forest-green hover:bg-pale-green-dark"
            >
              Add
            </button>
          </div>
          {data.dislikes && data.dislikes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {data.dislikes.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-dark-text text-xs border border-slate-200"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeDislike(item)}
                    className="text-muted-text hover:text-destructive font-bold text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
