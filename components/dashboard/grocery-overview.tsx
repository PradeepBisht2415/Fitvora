import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShoppingBag, Check } from 'lucide-react';
import type { DietPlanMeal } from '@/types/database.types';

export interface GroceryMealInput {
  custom_title?: string | null;
  custom_portion?: string | null;
  custom_alternatives?: unknown;
}

interface GroceryOverviewProps {
  meals?: GroceryMealInput[];
}

interface GroceryItemDef {
  category: string;
  name: string;
  match: RegExp;
}

const STAPLE_CATALOG: GroceryItemDef[] = [
  // Dals & Lentils
  { category: 'Dals & Lentils', name: 'Moong Dal (Yellow / Green)', match: /moong dal/i },
  { category: 'Dals & Lentils', name: 'Rajma (Red Kidney Beans)', match: /rajma/i },
  { category: 'Dals & Lentils', name: 'Chole (Chickpeas)', match: /chole|chickpea/i },
  { category: 'Dals & Lentils', name: 'Kala Chana (Black Chickpeas)', match: /kala chana/i },
  { category: 'Dals & Lentils', name: 'Chana Dal (Bengal Gram)', match: /chana dal/i },
  { category: 'Dals & Lentils', name: 'Masoor Dal (Red Lentils)', match: /masoor dal/i },
  { category: 'Dals & Lentils', name: 'Yellow Toor Dal (Arhar)', match: /toor dal|arhar/i },
  { category: 'Dals & Lentils', name: 'Roasted Chana', match: /roasted chana/i },
  { category: 'Dals & Lentils', name: 'Mixed Beans / Mixed Dal', match: /bean curry|mixed dal|mixed bean/i },

  // Grains & Flours
  { category: 'Grains & Flours', name: 'Whole Wheat Atta (Rotis / Phulkas)', match: /roti|phulka|atta|chapati/i },
  { category: 'Grains & Flours', name: 'Besan (Gram Flour)', match: /besan/i },
  { category: 'Grains & Flours', name: 'Rice (Basmati / White / Brown)', match: /\brice\b|khichdi/i },
  { category: 'Grains & Flours', name: 'Daliya (Broken Wheat)', match: /daliya/i },
  { category: 'Grains & Flours', name: 'Poha (Flattened Rice)', match: /poha/i },
  { category: 'Grains & Flours', name: 'Suji / Rava (Upma)', match: /upma|suji|rava/i },
  { category: 'Grains & Flours', name: 'Oats (Rolled / Steel Cut)', match: /oats/i },
  { category: 'Grains & Flours', name: 'Quinoa', match: /quinoa/i },
  { category: 'Grains & Flours', name: 'Whole Wheat / Brown Bread', match: /bread|toast/i },
  { category: 'Grains & Flours', name: 'Multigrain / Jowar Atta', match: /jowar|bajra|multigrain/i },

  // Dairy & Proteins
  { category: 'Dairy & Proteins', name: 'Fresh Paneer', match: /paneer/i },
  { category: 'Dairy & Proteins', name: 'Fresh Curd / Dahi', match: /curd|dahi/i },
  { category: 'Dairy & Proteins', name: 'Chaas (Buttermilk)', match: /chaas|buttermilk/i },
  { category: 'Dairy & Proteins', name: 'Milk (Toned / Skimmed)', match: /\bmilk\b/i },
  { category: 'Dairy & Proteins', name: 'Soya Chunks', match: /soy|soya/i },
  { category: 'Dairy & Proteins', name: 'Tofu', match: /tofu/i },
  { category: 'Dairy & Proteins', name: 'Eggs (Whole / Whites)', match: /\beggs?\b|omelet|boiled egg/i },
  { category: 'Dairy & Proteins', name: 'Peanuts / Groundnuts', match: /peanut/i },
  { category: 'Dairy & Proteins', name: 'Chicken (Breast / Curry Cut)', match: /chicken/i },
  { category: 'Dairy & Proteins', name: 'Fish / Seafood', match: /fish|prawn|salmon/i },
  { category: 'Dairy & Proteins', name: 'Mutton / Lean Meat', match: /mutton|lamb|meat/i },

  // Fresh Vegetables & Fruits
  { category: 'Fresh Produce & Fruits', name: 'Seasonal Sabzi / Mixed Vegetables', match: /sabzi|vegetable|veggie/i },
  { category: 'Fresh Produce & Fruits', name: 'Fresh Salad (Cucumbers & Tomatoes)', match: /salad|cucumber|tomato/i },
  { category: 'Fresh Produce & Fruits', name: 'Bhindi (Okra) & Green Beans', match: /bhindi|beans/i },
  { category: 'Fresh Produce & Fruits', name: 'Palak (Spinach)', match: /palak|spinach/i },
  { category: 'Fresh Produce & Fruits', name: 'Lauki (Bottle Gourd)', match: /lauki|ghiya/i },
  { category: 'Fresh Produce & Fruits', name: 'Broccoli & Cauliflower', match: /broccoli|gobi|cauliflower/i },
  { category: 'Fresh Produce & Fruits', name: 'Capsicum & Bell Peppers', match: /capsicum|bell pepper/i },
  { category: 'Fresh Produce & Fruits', name: 'Mushrooms', match: /mushroom/i },
  { category: 'Fresh Produce & Fruits', name: 'Fresh Mint & Coriander (Chutney)', match: /mint|chutney|coriander/i },
  { category: 'Fresh Produce & Fruits', name: 'Fresh Seasonal Fruits (Orange, Guava, Apple, Banana)', match: /fruit|orange|guava|apple|banana|papaya|pomegranate/i },

  // Healthy Snacks, Seeds & Essentials
  { category: 'Healthy Snacks & Seeds', name: 'Roasted Makhana (Fox Nuts)', match: /makhana/i },
  { category: 'Healthy Snacks & Seeds', name: 'Almonds & Walnuts', match: /almond|walnut|badam|akhrot/i },
  { category: 'Healthy Snacks & Seeds', name: 'Chia Seeds / Flax Seeds', match: /chia|flax|pumpkin seed/i },
  { category: 'Healthy Snacks & Seeds', name: 'Sprouts (Moong / Chana)', match: /sprout/i },
  { category: 'Healthy Snacks & Seeds', name: 'Coconut Water', match: /coconut water/i },
  { category: 'Healthy Snacks & Seeds', name: 'Pure Desi Ghee / Olive Oil', match: /ghee|olive oil/i },
];

export function deriveGroceryListFromMeals(
  meals?: GroceryMealInput[]
): { category: string; items: string[] }[] {
  if (!meals || meals.length === 0) return [];

  const combinedText = meals
    .map((m) => {
      const alts = Array.isArray(m.custom_alternatives)
        ? (m.custom_alternatives as { title: string }[]).map((a) => a.title).join(' ')
        : '';
      return `${m.custom_title || ''} ${m.custom_portion || ''} ${alts}`;
    })
    .join(' ')
    .toLowerCase();

  const categoryMap = new Map<string, string[]>();

  for (const item of STAPLE_CATALOG) {
    if (item.match.test(combinedText)) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item.name);
    }
  }

  return Array.from(categoryMap.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

export function GroceryOverview({ meals }: GroceryOverviewProps) {
  const dynamicCategories = deriveGroceryListFromMeals(meals);

  return (
    <Card className="bg-white border-emerald-100 shadow-xs print:border-none print:shadow-none">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs font-bold text-[#075B2B]">
          <ShoppingBag className="h-4 w-4" />
          <span>Weekly Grocery Checklist</span>
        </div>
        <CardTitle className="text-base font-bold text-[#1A2E1C]">
          Weekly Ingredients for Your Diet Plan
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Only ingredients specifically required for your weekly schedule from your diet plan document
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 text-xs">
        {dynamicCategories.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-xs italic">
            No ingredients recorded for this schedule.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dynamicCategories.map((cat, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-2">
                <h4 className="font-bold text-[#1A2E1C] border-b border-gray-200 pb-1 text-xs">
                  {cat.category}
                </h4>
                <ul className="space-y-1 text-gray-700">
                  {cat.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-1.5">
                      <Check className="h-3.5 w-3.5 text-[#2FAF37] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
