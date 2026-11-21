import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import type { MealTemplate } from '@/types/database.types';
import { z } from 'zod';

const createTemplateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  meal_type: z.enum([
    'breakfast',
    'morning_snack',
    'lunch',
    'evening_snack',
    'dinner',
    'post_dinner',
  ] as const),
  diet_category: z.enum(['vegetarian', 'eggetarian', 'non_vegetarian'] as const),
  default_portion: z.string().min(2, 'Portion is required'),
  preparation_notes: z.string().optional().nullable(),
  regional_tags: z.array(z.string()).default([]),
  allergen_tags: z.array(z.string()).default([]),
  approx_calories: z.number().int().positive().optional().nullable(),
  approx_protein_g: z.number().positive().optional().nullable(),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.string().min(1),
      unit: z.string().min(1),
    })
  ).default([]),
  alternatives: z.array(
    z.object({
      title: z.string().min(1),
      portion: z.string().min(1),
    })
  ).default([]),
});

// Built-in seed templates for zero-latency instant access in development/sandbox
const DEFAULT_MEAL_TEMPLATES: Omit<MealTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'Vegetable Poha with Roasted Peanuts',
    meal_type: 'breakfast',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Flattened rice (poha)', quantity: '60', unit: 'g' },
      { name: 'Onion & green peas', quantity: '50', unit: 'g' },
      { name: 'Roasted peanuts', quantity: '15', unit: 'g' },
      { name: 'Mustard seeds & curry leaves', quantity: '1', unit: 'tsp' },
      { name: 'Lemon juice', quantity: '1', unit: 'tsp' },
    ],
    default_portion: '1 medium bowl (approx. 200g)',
    preparation_notes: 'Lightly tempered with mustard seeds and curry leaves. Squeeze fresh lemon before eating.',
    regional_tags: ['maharashtrian', 'pan_indian'],
    allergen_tags: ['peanuts'],
    approx_calories: 310,
    approx_protein_g: 7.5,
    alternatives: [
      { title: 'Vegetable Upma with 1 boiled egg or paneer cubes', portion: '1 medium bowl' },
      { title: 'Oats Cheela with mint chutney', portion: '2 small cheelas' },
    ],
    is_active: true,
  },
  {
    title: 'Besan Chilla with Mint Coriander Chutney',
    meal_type: 'breakfast',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Gram flour (besan)', quantity: '70', unit: 'g' },
      { name: 'Finely chopped tomatoes & onions', quantity: '40', unit: 'g' },
      { name: 'Coriander & green chillies', quantity: '1', unit: 'tbsp' },
      { name: 'Mint chutney', quantity: '2', unit: 'tbsp' },
    ],
    default_portion: '2 medium chillas + 2 tbsp chutney',
    preparation_notes: 'Cook on non-stick tawa with 1 tsp cold-pressed mustard or groundnut oil.',
    regional_tags: ['north_indian'],
    allergen_tags: ['gluten'],
    approx_calories: 280,
    approx_protein_g: 14.0,
    alternatives: [
      { title: 'Moong Dal Cheela with paneer stuffing', portion: '2 medium cheelas' },
      { title: 'Sprouted Methi Thepla with curd', portion: '2 thin theplas + 1/2 katori curd' },
    ],
    is_active: true,
  },
  {
    title: 'Steamed Idli with Sambhar and Coconut Chutney',
    meal_type: 'breakfast',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Fermented rice & urad dal idlis', quantity: '3', unit: 'pcs' },
      { name: 'Vegetable sambhar (drumstick, pumpkin, tomato)', quantity: '1', unit: 'medium bowl' },
      { name: 'Fresh coconut chutney', quantity: '1', unit: 'tbsp' },
    ],
    default_portion: '3 standard idlis + 1 katori sambhar + 1 tbsp chutney',
    preparation_notes: 'Fermented batter aids digestion and gut health. Sambhar enriched with toor dal.',
    regional_tags: ['south_indian'],
    allergen_tags: ['mustard'],
    approx_calories: 290,
    approx_protein_g: 9.0,
    alternatives: [
      { title: 'Rava Dosa with vegetable sambhar', portion: '1 medium dosa' },
      { title: 'Poha with curd', portion: '1 bowl' },
    ],
    is_active: true,
  },
  {
    title: 'Paneer Bhurji with 2 Phulkas',
    meal_type: 'breakfast',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Fresh homemade paneer', quantity: '80', unit: 'g' },
      { name: 'Whole wheat phulkas (no ghee)', quantity: '2', unit: 'pcs' },
      { name: 'Onion, tomato, bell pepper', quantity: '60', unit: 'g' },
    ],
    default_portion: '1 katori bhurji + 2 standard phulkas',
    preparation_notes: 'Sauté paneer with cumin, turmeric, and fresh vegetables for rich morning vegetarian protein.',
    regional_tags: ['north_indian'],
    allergen_tags: ['dairy', 'gluten'],
    approx_calories: 360,
    approx_protein_g: 18.5,
    alternatives: [
      { title: 'Tofu Bhurji with 2 Phulkas (dairy-free)', portion: '1 katori + 2 phulkas' },
      { title: 'Egg Bhurji with 2 Phulkas', portion: '2 eggs + 2 phulkas' },
    ],
    is_active: true,
  },
  {
    title: 'Boiled Eggs with 2 Multigrain Toasts & Cucumber Slices',
    meal_type: 'breakfast',
    diet_category: 'eggetarian',
    ingredients: [
      { name: 'Boiled eggs', quantity: '2', unit: 'whole' },
      { name: 'Multigrain bread', quantity: '2', unit: 'slices' },
      { name: 'Sliced cucumber & tomato with chaat masala', quantity: '100', unit: 'g' },
    ],
    default_portion: '2 boiled eggs + 2 slices toast + cucumber salad',
    preparation_notes: 'Season eggs with crushed black pepper and a pinch of roasted jeera.',
    regional_tags: ['pan_indian'],
    allergen_tags: ['eggs', 'gluten'],
    approx_calories: 320,
    approx_protein_g: 19.0,
    alternatives: [
      { title: '2-Egg Veggie Omelette with 1 roti', portion: '1 omelette + 1 roti' },
      { title: 'Paneer sandwich (whole wheat)', portion: '1 sandwich' },
    ],
    is_active: true,
  },
  {
    title: 'Dal Tadka, 2 Whole Wheat Phulkas & Bhindi Sabzi',
    meal_type: 'lunch',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Yellow toor dal', quantity: '1', unit: 'katori (150g)' },
      { name: 'Phulkas (whole wheat)', quantity: '2', unit: 'pcs' },
      { name: 'Bhindi (okra) dry sabzi', quantity: '1', unit: 'katori' },
      { name: 'Kachumber salad (cucumber, onion, lemon)', quantity: '1', unit: 'katori' },
    ],
    default_portion: '1 katori dal + 2 phulkas + 1 katori sabzi + fresh salad',
    preparation_notes: 'Staple everyday Indian home lunch. Balance of complex carbs, protein, and dietary fiber.',
    regional_tags: ['north_indian', 'central_indian'],
    allergen_tags: ['gluten'],
    approx_calories: 390,
    approx_protein_g: 14.5,
    alternatives: [
      { title: 'Moong Dal with 2 Phulkas & Lauki Sabzi', portion: '1 katori dal + 2 roti + 1 katori sabzi' },
      { title: 'Mix Veg Curry with 1 katori brown rice & dal', portion: 'Standard plate' },
    ],
    is_active: true,
  },
  {
    title: 'Rajma Masala with Steamed Basmati Rice & Cucumber Raita',
    meal_type: 'lunch',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Cooked red kidney beans (rajma)', quantity: '1.5', unit: 'katoris' },
      { name: 'Steamed white or brown rice', quantity: '1', unit: 'katori (150g)' },
      { name: 'Curd raita with cucumber & roasted cumin', quantity: '1/2', unit: 'katori' },
    ],
    default_portion: '1.5 katori rajma + 1 katori rice + 1/2 katori raita',
    preparation_notes: 'Classic comfort pairing. Rajma provides plant-based iron and sustained glycemic response.',
    regional_tags: ['north_indian'],
    allergen_tags: ['dairy'],
    approx_calories: 420,
    approx_protein_g: 16.0,
    alternatives: [
      { title: 'Chole (Chickpeas) with 2 Phulkas and salad', portion: '1 katori chole + 2 phulkas' },
      { title: 'Black Eyed Peas (Lobia) with Rice', portion: '1 katori lobia + 1 katori rice' },
    ],
    is_active: true,
  },
  {
    title: 'Homestyle Chicken Curry with 2 Phulkas & Kachumber Salad',
    meal_type: 'lunch',
    diet_category: 'non_vegetarian',
    ingredients: [
      { name: 'Skinless chicken curry (onion-tomato gravy)', quantity: '150', unit: 'g' },
      { name: 'Whole wheat phulkas', quantity: '2', unit: 'pcs' },
      { name: 'Kachumber salad with lemon', quantity: '1', unit: 'katori' },
    ],
    default_portion: '3-4 pcs chicken in light curry + 2 phulkas + fresh salad',
    preparation_notes: 'Cooked without cream or butter; uses whole spices (cinnamon, cloves, cardamom).',
    regional_tags: ['pan_indian'],
    allergen_tags: ['gluten'],
    approx_calories: 440,
    approx_protein_g: 31.0,
    alternatives: [
      { title: 'Fish Curry (Rohu or Pomfret) with 1 katori rice', portion: '1 bowl curry + 1 katori rice' },
      { title: 'Egg Curry with 2 Phulkas', portion: '2 eggs in curry + 2 phulkas' },
    ],
    is_active: true,
  },
  {
    title: 'Roasted Chana with Spiced Chaas (Buttermilk)',
    meal_type: 'evening_snack',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Dry roasted chana with skin', quantity: '35', unit: 'g (1 handful)' },
      { name: 'Chilled buttermilk with roasted cumin & mint', quantity: '200', unit: 'ml (1 glass)' },
    ],
    default_portion: '1 handful roasted chana + 1 tall glass chaas',
    preparation_notes: 'Crunchy, satiating evening bridge snack that curbs sweet cravings before dinner.',
    regional_tags: ['pan_indian'],
    allergen_tags: ['dairy'],
    approx_calories: 160,
    approx_protein_g: 8.5,
    alternatives: [
      { title: 'Makhana (Foxnuts) lightly roasted in 1/2 tsp ghee', portion: '1 big bowl (30g)' },
      { title: 'Sprouted Chana Chaat with lemon', portion: '1/2 katori' },
    ],
    is_active: true,
  },
  {
    title: 'Moong Dal Khichdi with 1 Katori Fresh Curd',
    meal_type: 'dinner',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Yellow moong dal and rice (1:1 ratio)', quantity: '1.5', unit: 'katoris' },
      { name: 'Desi cow ghee', quantity: '1/2', unit: 'tsp' },
      { name: 'Plain fresh homemade curd', quantity: '1', unit: 'katori (100g)' },
    ],
    default_portion: '1.5 katori warm khichdi + 1 katori curd',
    preparation_notes: 'Light, restorative, and complete amino acid profile. Perfect for restorative night sleep.',
    regional_tags: ['pan_indian'],
    allergen_tags: ['dairy'],
    approx_calories: 370,
    approx_protein_g: 15.0,
    alternatives: [
      { title: 'Dalia Khichdi (Broken wheat & vegetables) with curd', portion: '1.5 katoris + 1 katori curd' },
      { title: 'Brown Rice Moong Dal Pulao with Raita', portion: '1.5 katoris' },
    ],
    is_active: true,
  },
  {
    title: 'Palak Paneer with 2 Multigrain Phulkas & Beetroot Salad',
    meal_type: 'dinner',
    diet_category: 'vegetarian',
    ingredients: [
      { name: 'Fresh spinach purée with paneer cubes', quantity: '1', unit: 'katori (150g)' },
      { name: 'Multigrain phulkas (wheat, jowar, ragi)', quantity: '2', unit: 'pcs' },
      { name: 'Sliced beetroot & carrot with lemon', quantity: '1', unit: 'katori' },
    ],
    default_portion: '1 katori palak paneer + 2 multigrain phulkas + salad',
    preparation_notes: 'Rich in plant iron, folate, and slow-release casein protein.',
    regional_tags: ['north_indian'],
    allergen_tags: ['dairy', 'gluten'],
    approx_calories: 410,
    approx_protein_g: 18.0,
    alternatives: [
      { title: 'Matar Paneer with 2 Phulkas', portion: '1 katori + 2 phulkas' },
      { title: 'Methi Paneer with 2 Jowar rotis', portion: '1 katori + 2 rotis' },
    ],
    is_active: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mealType = searchParams.get('meal_type');
    const dietCategory = searchParams.get('diet_category');
    const query = searchParams.get('search')?.toLowerCase().trim();

    const adminSupabase = createAdminClient();
    let dbTemplates: MealTemplate[] = [];

    try {
      let req = adminSupabase
        .from('meal_templates')
        .select('*')
        .eq('is_active', true)
        .order('title', { ascending: true });

      if (mealType && mealType !== 'all') {
        req = req.eq('meal_type', mealType as MealTemplate['meal_type']);
      }
      if (dietCategory && dietCategory !== 'all') {
        req = req.eq('diet_category', dietCategory as MealTemplate['diet_category']);
      }

      const { data, error } = await req;
      if (!error && data && data.length > 0) {
        dbTemplates = data as MealTemplate[];
      }
    } catch {
      // Fallback to built-in seed if table not queried
    }

    // If database returned 0 templates, serve defaults
    let results: MealTemplate[] = dbTemplates;
    if (results.length === 0) {
      results = DEFAULT_MEAL_TEMPLATES.map((t, idx) => ({
        ...t,
        id: `template_seed_${idx + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      if (mealType && mealType !== 'all') {
        results = results.filter((t) => t.meal_type === mealType);
      }
      if (dietCategory && dietCategory !== 'all') {
        results = results.filter((t) => t.diet_category === dietCategory);
      }
    }

    if (query) {
      results = results.filter((t) => {
        return (
          t.title.toLowerCase().includes(query) ||
          t.regional_tags.some((r) => r.toLowerCase().includes(query)) ||
          t.allergen_tags.some((a) => a.toLowerCase().includes(query))
        );
      });
    }

    return NextResponse.json({ templates: results });
  } catch (error) {
    console.error('Error fetching meal templates:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve meal templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Admin role required.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const payload = validation.data;

    const { data: newTemplate, error: insertError } = await adminSupabase
      .from('meal_templates')
      .insert({
        title: payload.title,
        meal_type: payload.meal_type,
        diet_category: payload.diet_category,
        default_portion: payload.default_portion,
        preparation_notes: payload.preparation_notes || null,
        regional_tags: payload.regional_tags,
        allergen_tags: payload.allergen_tags,
        approx_calories: payload.approx_calories || null,
        approx_protein_g: payload.approx_protein_g || null,
        ingredients: payload.ingredients,
        alternatives: payload.alternatives,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert meal template error:', insertError);
      return NextResponse.json(
        { error: 'Database error saving meal template' },
        { status: 500 }
      );
    }

    await adminSupabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'meal_template_created',
      entity_type: 'meal_template',
      entity_id: newTemplate.id,
      metadata: {
        title: payload.title,
        meal_type: payload.meal_type,
      },
    });

    return NextResponse.json({ success: true, template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error('Create meal template API exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
