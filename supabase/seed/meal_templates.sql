-- ==============================================================================
-- Fitvora Seed: 20261121000004_meal_templates_seed.sql
-- Authentic Indian Home-Food Meal Templates with Household Measures
-- ==============================================================================

INSERT INTO public.meal_templates (
    title,
    meal_type,
    diet_category,
    ingredients,
    default_portion,
    preparation_notes,
    regional_tags,
    allergen_tags,
    approx_calories,
    approx_protein_g,
    alternatives
) VALUES
-- BREAKFAST
(
    'Vegetable Poha with Roasted Peanuts',
    'breakfast',
    'vegetarian',
    '[{"name": "Flattened rice (poha)", "quantity": "60", "unit": "g"}, {"name": "Onion & green peas", "quantity": "50", "unit": "g"}, {"name": "Roasted peanuts", "quantity": "15", "unit": "g"}, {"name": "Mustard seeds & curry leaves", "quantity": "1", "unit": "tsp"}, {"name": "Lemon juice", "quantity": "1", "unit": "tsp"}]'::jsonb,
    '1 medium bowl (approx. 200g)',
    'Lightly tempered with mustard seeds and curry leaves. Squeeze fresh lemon before eating.',
    ARRAY['maharashtrian', 'pan_indian'],
    ARRAY['peanuts'],
    310,
    7.5,
    '[{"title": "Vegetable Upma with 1 boiled egg or paneer cubes", "portion": "1 medium bowl"}, {"title": "Oats Cheela with mint chutney", "portion": "2 small cheelas"}]'::jsonb
),
(
    'Besan Chilla with Mint Coriander Chutney',
    'breakfast',
    'vegetarian',
    '[{"name": "Gram flour (besan)", "quantity": "70", "unit": "g"}, {"name": "Finely chopped tomatoes & onions", "quantity": "40", "unit": "g"}, {"name": "Coriander & green chillies", "quantity": "1", "unit": "tbsp"}, {"name": "Mint chutney", "quantity": "2", "unit": "tbsp"}]'::jsonb,
    '2 medium chillas + 2 tbsp chutney',
    'Cook on non-stick tawa with 1 tsp cold-pressed mustard or groundnut oil.',
    ARRAY['north_indian'],
    ARRAY['gluten'],
    280,
    14.0,
    '[{"title": "Moong Dal Cheela with paneer stuffing", "portion": "2 medium cheelas"}, {"title": "Sprouted Methi Thepla with curd", "portion": "2 thin theplas + 1/2 katori curd"}]'::jsonb
),
(
    'Steamed Idli with Sambhar and Coconut Chutney',
    'breakfast',
    'vegetarian',
    '[{"name": "Fermented rice & urad dal idlis", "quantity": "3", "unit": "pcs"}, {"name": "Vegetable sambhar (drumstick, pumpkin, tomato)", "quantity": "1", "unit": "medium bowl"}, {"name": "Fresh coconut chutney", "quantity": "1", "unit": "tbsp"}]'::jsonb,
    '3 standard idlis + 1 katori sambhar + 1 tbsp chutney',
    'Fermented batter aids digestion and gut health. Sambhar enriched with toor dal.',
    ARRAY['south_indian'],
    ARRAY['mustard'],
    290,
    9.0,
    '[{"title": "Rava Dosa with vegetable sambhar", "portion": "1 medium dosa"}, {"title": "Poha with curd", "portion": "1 bowl"}]'::jsonb
),
(
    'Paneer Bhurji with 2 Phulkas',
    'breakfast',
    'vegetarian',
    '[{"name": "Fresh homemade paneer", "quantity": "80", "unit": "g"}, {"name": "Whole wheat phulkas (no ghee)", "quantity": "2", "unit": "pcs"}, {"name": "Onion, tomato, bell pepper", "quantity": "60", "unit": "g"}]'::jsonb,
    '1 katori bhurji + 2 standard phulkas',
    'Sauté paneer with cumin, turmeric, and fresh vegetables for rich vegetarian morning protein.',
    ARRAY['north_indian'],
    ARRAY['dairy', 'gluten'],
    360,
    18.5,
    '[{"title": "Tofu Bhurji with 2 Phulkas (dairy-free)", "portion": "1 katori + 2 phulkas"}, {"title": "Egg Bhurji with 2 Phulkas", "portion": "2 eggs + 2 phulkas"}]'::jsonb
),
(
    'Boiled Eggs with 2 Multigrain Toasts & Cucumber Slices',
    'breakfast',
    'eggetarian',
    '[{"name": "Boiled eggs", "quantity": "2", "unit": "whole"}, {"name": "Multigrain bread", "quantity": "2", "unit": "slices"}, {"name": "Sliced cucumber & tomato with chaat masala", "quantity": "100", "unit": "g"}]'::jsonb,
    '2 boiled eggs + 2 slices toast + cucumber salad',
    'Season eggs with crushed black pepper and a pinch of roasted jeera.',
    ARRAY['pan_indian'],
    ARRAY['eggs', 'gluten'],
    320,
    19.0,
    '[{"title": "2-Egg Veggie Omelette with 1 roti", "portion": "1 omelette + 1 roti"}, {"title": "Paneer sandwich (whole wheat)", "portion": "1 sandwich"}]'::jsonb
),

-- LUNCH
(
    'Dal Tadka, 2 Whole Wheat Phulkas & Bhindi Sabzi',
    'lunch',
    'vegetarian',
    '[{"name": "Yellow toor dal", "quantity": "1", "unit": "katori (150g)"}, {"name": "Phulkas (whole wheat)", "quantity": "2", "unit": "pcs"}, {"name": "Bhindi (okra) dry sabzi", "quantity": "1", "unit": "katori"}, {"name": "Kachumber salad (cucumber, onion, lemon)", "quantity": "1", "unit": "katori"}]'::jsonb,
    '1 katori dal + 2 phulkas + 1 katori sabzi + fresh salad',
    'Staple everyday Indian home lunch. Balance of complex carbs, protein, and dietary fiber.',
    ARRAY['north_indian', 'central_indian'],
    ARRAY['gluten'],
    390,
    14.5,
    '[{"title": "Moong Dal with 2 Phulkas & Lauki Sabzi", "portion": "1 katori dal + 2 roti + 1 katori sabzi"}, {"title": "Mix Veg Curry with 1 katori brown rice & dal", "portion": "Standard plate"}]'::jsonb
),
(
    'Rajma Masala with Steamed Basmati Rice & Cucumber Raita',
    'lunch',
    'vegetarian',
    '[{"name": "Cooked red kidney beans (rajma)", "quantity": "1.5", "unit": "katoris"}, {"name": "Steamed white or brown rice", "quantity": "1", "unit": "katori (150g)"}, {"name": "Curd raita with cucumber & roasted cumin", "quantity": "1/2", "unit": "katori"}]'::jsonb,
    '1.5 katori rajma + 1 katori rice + 1/2 katori raita',
    'Classic comfort pairing. Rajma provides plant-based iron and sustained glycemic response.',
    ARRAY['north_indian'],
    ARRAY['dairy'],
    420,
    16.0,
    '[{"title": "Chole (Chickpeas) with 2 Phulkas and salad", "portion": "1 katori chole + 2 phulkas"}, {"title": "Black Eyed Peas (Lobia) with Rice", "portion": "1 katori lobia + 1 katori rice"}]'::jsonb
),
(
    'Homestyle Chicken Curry with 2 Phulkas & Kachumber Salad',
    'lunch',
    'non_vegetarian',
    '[{"name": "Skinless chicken curry (onion-tomato gravy)", "quantity": "150", "unit": "g"}, {"name": "Whole wheat phulkas", "quantity": "2", "unit": "pcs"}, {"name": "Kachumber salad with lemon", "quantity": "1", "unit": "katori"}]'::jsonb,
    '3-4 pcs chicken in light curry + 2 phulkas + fresh salad',
    'Cooked without cream or butter; uses whole spices (cinnamon, cloves, cardamom).',
    ARRAY['pan_indian'],
    ARRAY['gluten'],
    440,
    31.0,
    '[{"title": "Fish Curry (Rohu or Pomfret) with 1 katori rice", "portion": "1 bowl curry + 1 katori rice"}, {"title": "Egg Curry with 2 Phulkas", "portion": "2 eggs in curry + 2 phulkas"}]'::jsonb
),
(
    'South Indian Curd Rice with Mild Tadka & Sprouted Moong Salad',
    'lunch',
    'vegetarian',
    '[{"name": "Soft cooked rice with fresh curd", "quantity": "1.5", "unit": "katoris"}, {"name": "Mustard, curry leaf, and ginger tadka", "quantity": "1", "unit": "tsp"}, {"name": "Sprouted moong salad", "quantity": "1/2", "unit": "katori"}]'::jsonb,
    '1.5 katori curd rice + 1/2 katori sprouted moong',
    'Probiotic-rich and cooling for digestion. Excellent for active workdays.',
    ARRAY['south_indian'],
    ARRAY['dairy', 'mustard'],
    350,
    13.0,
    '[{"title": "Lemon Rice with 1 katori dal & salad", "portion": "1 bowl rice + 1 katori dal"}, {"title": "Dahi Poha with pomegranate seeds", "portion": "1 bowl"}]'::jsonb
),

-- SNACKS
(
    'Roasted Chana with Spiced Chaas (Buttermilk)',
    'evening_snack',
    'vegetarian',
    '[{"name": "Dry roasted chana with skin", "quantity": "35", "unit": "g (1 handful)"}, {"name": "Chilled buttermilk with roasted cumin & mint", "quantity": "200", "unit": "ml (1 glass)"}]'::jsonb,
    '1 handful roasted chana + 1 tall glass chaas',
    'Crunchy, satiating evening bridge snack that curbs sweet cravings before dinner.',
    ARRAY['pan_indian'],
    ARRAY['dairy'],
    160,
    8.5,
    '[{"title": "Makhana (Foxnuts) lightly roasted in 1/2 tsp ghee", "portion": "1 big bowl (30g)"}, {"title": "Sprouted Chana Chaat with lemon", "portion": "1/2 katori"}]'::jsonb
),
(
    'Sprouted Moong Chaat with Pomegranate & Lime',
    'evening_snack',
    'vegetarian',
    '[{"name": "Steamed sprouted green moong", "quantity": "1", "unit": "katori (100g)"}, {"name": "Finely chopped cucumber & tomato", "quantity": "40", "unit": "g"}, {"name": "Pomegranate seeds", "quantity": "1", "unit": "tbsp"}, {"name": "Chaat masala & lemon juice", "quantity": "1", "unit": "tsp"}]'::jsonb,
    '1 medium katori (approx. 150g)',
    'High enzyme and micronutrient count. Steam sprouts for 3 minutes for easy digestion.',
    ARRAY['pan_indian'],
    ARRAY[]::text[],
    145,
    8.0,
    '[{"title": "Boiled Chickpea salad with lime", "portion": "1/2 katori"}, {"title": "Cucumber carrot sticks with hummus", "portion": "1 bowl"}]'::jsonb
),

-- DINNER
(
    'Moong Dal Khichdi with 1 Katori Fresh Curd',
    'dinner',
    'vegetarian',
    '[{"name": "Yellow moong dal and rice (1:1 ratio)", "quantity": "1.5", "unit": "katoris"}, {"name": "Desi cow ghee", "quantity": "1/2", "unit": "tsp"}, {"name": "Plain fresh homemade curd", "quantity": "1", "unit": "katori (100g)"}]'::jsonb,
    '1.5 katori warm khichdi + 1 katori curd',
    'Light, restorative, and complete amino acid profile. Perfect for restorative night sleep.',
    ARRAY['pan_indian'],
    ARRAY['dairy'],
    370,
    15.0,
    '[{"title": "Dalia Khichdi (Broken wheat & vegetables) with curd", "portion": "1.5 katoris + 1 katori curd"}, {"title": "Brown Rice Moong Dal Pulao with Raita", "portion": "1.5 katoris"}]'::jsonb
),
(
    'Palak Paneer with 2 Multigrain Phulkas & Beetroot Salad',
    'dinner',
    'vegetarian',
    '[{"name": "Fresh spinach purée with paneer cubes", "quantity": "1", "unit": "katori (150g)"}, {"name": "Multigrain phulkas (wheat, jowar, ragi)", "quantity": "2", "unit": "pcs"}, {"name": "Sliced beetroot & carrot with lemon", "quantity": "1", "unit": "katori"}]'::jsonb,
    '1 katori palak paneer + 2 multigrain phulkas + salad',
    'Rich in plant iron, folate, and slow-release casein protein.',
    ARRAY['north_indian'],
    ARRAY['dairy', 'gluten'],
    410,
    18.0,
    '[{"title": "Matar Paneer with 2 Phulkas", "portion": "1 katori + 2 phulkas"}, {"title": "Methi Paneer with 2 Jowar rotis", "portion": "1 katori + 2 rotis"}]'::jsonb
),
(
    'Ghar Ki Lauki (Bottle Gourd) Sabzi with 2 Phulkas & Arhar Dal',
    'dinner',
    'vegetarian',
    '[{"name": "Lauki cooked with cumin and tomatoes", "quantity": "1", "unit": "katori"}, {"name": "Light arhar (toor) dal", "quantity": "1", "unit": "katori"}, {"name": "Whole wheat phulkas", "quantity": "2", "unit": "pcs"}]'::jsonb,
    '1 katori lauki + 1 katori dal + 2 phulkas',
    'Gentle on gut and liver before sleep; prevents morning water retention.',
    ARRAY['north_indian', 'central_indian'],
    ARRAY['gluten'],
    340,
    12.5,
    '[{"title": "Tinda or Turai (Ridge Gourd) Sabzi with 2 Phulkas & Dal", "portion": "1 katori sabzi + 1 katori dal + 2 phulkas"}, {"title": "Pumpkin Sabzi with 2 Phulkas & Moong Dal", "portion": "Standard plate"}]'::jsonb
),
(
    'High-Protein Soya Chunk Vegetable Pulao with Mint Raita',
    'dinner',
    'vegetarian',
    '[{"name": "Basmati rice cooked with whole spices", "quantity": "1", "unit": "katori (150g)"}, {"name": "Soya chunks (boiled & sautéed)", "quantity": "40", "unit": "g dry"}, {"name": "French beans, carrots, peas", "quantity": "50", "unit": "g"}, {"name": "Low-fat curd raita with mint", "quantity": "1", "unit": "katori"}]'::jsonb,
    '1.5 katori soya pulao + 1 katori mint raita',
    'Lean vegetarian protein power plate with high dietary fiber and minimal saturated fat.',
    ARRAY['pan_indian'],
    ARRAY['dairy'],
    395,
    25.0,
    '[{"title": "Paneer & Pea Pulao with Raita", "portion": "1.5 katoris pulao + 1 katori raita"}, {"title": "Egg Pulao (2 eggs) with Kachumber", "portion": "1.5 katoris"}]'::jsonb
)
ON CONFLICT DO NOTHING;
