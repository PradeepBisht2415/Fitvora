import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShoppingBag, Check } from 'lucide-react';

export function GroceryOverview() {
  const stapleCategories = [
    {
      category: 'Dals & Lentils',
      items: ['Yellow Toor Dal (Arhar)', 'Yellow Moong Dal (Split)', 'Whole Green Moong', 'Rajma (Red Kidney Beans)', 'Roasted Chana'],
    },
    {
      category: 'Grains & Flours',
      items: ['Whole Wheat Atta (Phulkas)', 'Poha (Thick Flattened Rice)', 'Basmati Rice', 'Besan (Gram Flour)', 'Multigrain / Jowar Atta'],
    },
    {
      category: 'Dairy & Proteins',
      items: ['Fresh Homemade Paneer (200g)', 'Homemade Curd / Dahi (1kg)', 'Chaas (Buttermilk)', 'Eggs (1-2 dozen if eggetarian)', 'Soya Chunks'],
    },
    {
      category: 'Fresh Vegetables & Produce',
      items: ['Bhindi (Okra)', 'Lauki (Bottle Gourd)', 'Palak (Spinach)', 'Cucumbers, Tomatoes & Onions', 'Fresh Coriander, Mint & Lemons'],
    },
  ];

  return (
    <Card className="bg-white border-emerald-100 shadow-xs print:border-none print:shadow-none">
      <CardHeader className="pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs font-bold text-[#075B2B]">
          <ShoppingBag className="h-4 w-4" />
          <span>Weekly Grocery Checklist</span>
        </div>
        <CardTitle className="text-base font-bold text-[#1A2E1C]">
          Indian Kitchen Staples for Your 7-Day Plan
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Everything on your plan uses standard ingredients available at your local kirana or sabzi mandi
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {stapleCategories.map((cat, idx) => (
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
      </CardContent>
    </Card>
  );
}
