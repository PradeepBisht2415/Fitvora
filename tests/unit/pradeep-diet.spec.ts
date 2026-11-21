import { test, expect } from '@playwright/test';
import { parseDietPlanFile } from '../../lib/parsers/word-diet-parser';

test('Full Integration Test: Pradeep diet parsed with exact 2 meals/day, correct titles and portions', async () => {
  const pradeepDietText = `
Week 1  |  Foundation
Personalized Weekly Nutrition Plan  •  Days 1–7
Client overview
| Client   | Pradeep  •  Male, 29 years   |
| Measurements   | 160 cm  |  70 kg  |  BMI 27.3 kg/m²   |
| Goal   | Weight loss  •  Target 62 kg over 12 weeks   |
| Routine   | Overnight shift  |  Wake 14:00  |  Sleep 06:00  |  Sedentary   |
| Diet   | North Indian vegetarian  |  Tiffin / mess   |
| Meal schedule   | Breakfast: 14:30  |  Dinner: 21:00  |  Exactly 2 meals   |
| Nutrition targets   | ~1,500–1,600 kcal/day  |  ~80–95 g protein/day   |
| Avoid   | Baingan, lauki/loki, “toti”, tinde; no reported food allergies   |
Estimated BMR ~1,555 kcal/day (Mifflin–St Jeor); sedentary TDEE ~1,865 kcal/day. The 8 kg/12-week goal is ambitious; actual progress varies. Protein is distributed across two substantial meals as requested. All nutrition values are approximate.
Portion key: roti = 30 g dry atta each (≈15 cm); cooked dal/beans, rice, sabzi, curd and paneer quantities are ready-to-eat weights; dry soya chunks are weighed BEFORE soaking; oil is included in meal estimates. Use plain unsweetened curd and low-fat paneer where available. Each meal is a single sitting, with listed components served together.
DAY 1  |  Monday
Breakfast — 14:30  |  Paneer-besan thali
Besan chilla: 2 (80 g dry besan + vegetables; 10 g oil); low-fat paneer stuffing 120 g; plain curd 250 g; guava 150 g
Estimated meal: 760 kcal  |  47 g protein
Dinner — 21:00  |  Rajma-rice tiffin
Rajma curry 300 g; cooked rice 180 g; 2 medium rotis; cucumber-carrot salad 150 g; plain curd 250 g; 5 g oil in curry
Estimated meal: 805 kcal  |  37 g protein
ESTIMATED DAILY TOTAL: 1,565 kcal  |  84 g protein
DAY 2  |  Tuesday
Breakfast — 14:30  |  Soya roti plate
Soya chunk curry (65 g dry soya, tomato/onion, 10 g oil); 3 medium rotis; plain curd 250 g; orange 150 g
Estimated meal: 775 kcal  |  52 g protein
Dinner — 21:00  |  Dal-paneer meal
Mixed dal 300 g; low-fat paneer bhurji 120 g (5 g oil); cooked rice 150 g; seasonal sabzi 150 g (5 g oil)
Estimated meal: 800 kcal  |  43 g protein
ESTIMATED DAILY TOTAL: 1,575 kcal  |  95 g protein
DAY 3  |  Wednesday
Breakfast — 14:30  |  Chole and curd
Chole 300 g; 3 medium rotis; plain curd 300 g; cucumber salad 150 g; 5 g oil included in chole
Estimated meal: 785 kcal  |  39 g protein
Dinner — 21:00  |  Paneer pulao plate
Low-fat paneer 160 g; vegetable pulao 280 g cooked (incl. 10 g oil); moong dal 200 g; tomato-onion salad 100 g
Estimated meal: 795 kcal  |  48 g protein
ESTIMATED DAILY TOTAL: 1,580 kcal  |  87 g protein
DAY 4  |  Thursday
Breakfast — 14:30  |  Moong chilla plate
Moong dal chilla: 3 (110 g dry moong dal, vegetables, 10 g oil); low-fat paneer 100 g; curd 250 g; apple 150 g
Estimated meal: 780 kcal  |  48 g protein
Dinner — 21:00  |  Kala chana dinner
Kala chana curry 300 g; 2 medium rotis; cooked rice 120 g; plain curd 300 g; seasonal sabzi 100 g
Estimated meal: 790 kcal  |  39 g protein
ESTIMATED DAILY TOTAL: 1,570 kcal  |  87 g protein
DAY 5  |  Friday
Breakfast — 14:30  |  Paneer roti and fruit
Low-fat paneer bhurji 170 g (10 g oil); 3 medium rotis; plain curd 200 g; papaya 200 g
Estimated meal: 775 kcal  |  49 g protein
Dinner — 21:00  |  Soya dal rice
Soya curry (55 g dry chunks; 10 g oil); arhar dal 250 g; cooked rice 170 g; 1 medium roti; cucumber 150 g
Estimated meal: 795 kcal  |  45 g protein
ESTIMATED DAILY TOTAL: 1,570 kcal  |  94 g protein
DAY 6  |  Saturday
Breakfast — 14:30  |  Daliya and chana
Vegetable daliya 350 g cooked (80 g dry broken wheat, 10 g oil); kala chana 250 g cooked; plain curd 300 g; orange 150 g
Estimated meal: 790 kcal  |  39 g protein
Dinner — 21:00  |  Paneer dal thali
Low-fat paneer tikka 160 g; masoor dal 280 g; 2 medium rotis; cooked seasonal sabzi 150 g (10 g oil)
Estimated meal: 780 kcal  |  49 g protein
ESTIMATED DAILY TOTAL: 1,570 kcal  |  88 g protein
DAY 7  |  Sunday
Breakfast — 14:30  |  Besan paneer wraps
3 medium rotis; besan vegetable filling (70 g dry besan, 5 g oil); low-fat paneer 130 g; plain curd 200 g; guava 100 g
Estimated meal: 790 kcal  |  48 g protein
Dinner — 21:00  |  Rajma-soya meal
Rajma curry 250 g; soya chunks 45 g dry in gravy (5 g oil); cooked rice 150 g; 1 medium roti; salad 150 g
Estimated meal: 785 kcal  |  43 g protein
ESTIMATED DAILY TOTAL: 1,575 kcal  |  91 g protein
Guidance & Hydration Reminders
Aim for roughly 2–2.5 L fluids daily unless a clinician advises otherwise; adjust for heat, thirst and urine color.
Because frequent urination was reported, arrange a medical review, especially with thirst, fatigue or disturbed sleep.
Limit sugary drinks, frequent fried snacks and excess added oil; no detox or fat-burning products are needed.
Walk 20–30 minutes most days as tolerated, and add basic resistance exercise twice weekly.
Keep both scheduled meals consistent and include the listed dal, curd, paneer or soya protein portions.
Protect a consistent 06:00–14:00 sleep window and limit caffeine in the hours before bedtime.
For mess meals, request measured rice/roti portions and separate dal, curd and protein-rich sides.
Check weight under similar conditions 2–3 times weekly and compare weekly averages, not single readings.
General nutrition guidance only; estimates depend on ingredients, brands and preparation. This is not a medical diagnosis or individualized clinical treatment. Seek review by a qualified healthcare professional for urinary symptoms or other health concerns.
`;

  const parsed = await parseDietPlanFile(Buffer.from(pradeepDietText), 'pradeep_diet.txt');
  expect(parsed.success).toBe(true);
  expect(parsed.meals.length).toBe(14); // Exactly 2 meals per day!

  // Check Saturday (Day 6)
  const satMeals = parsed.meals.filter((m) => m.dayOfWeek === 6);
  expect(satMeals.length).toBe(2);

  // Breakfast
  expect(satMeals[0]!.mealType).toBe('breakfast');
  expect(satMeals[0]!.scheduledTime).toBe('14:30');
  expect(satMeals[0]!.customTitle).toBe('Daliya and chana');
  expect(satMeals[0]!.customPortion).toContain('Vegetable daliya 350 g');
  expect(satMeals[0]!.approxCalories).toBe(790);
  expect(satMeals[0]!.approxProteinG).toBe(39);

  // Dinner
  expect(satMeals[1]!.mealType).toBe('dinner');
  expect(satMeals[1]!.scheduledTime).toBe('21:00');
  expect(satMeals[1]!.customTitle).toBe('Paneer dal thali');
  expect(satMeals[1]!.customPortion).toContain('Low-fat paneer tikka 160 g');
  expect(satMeals[1]!.approxCalories).toBe(780);
  expect(satMeals[1]!.approxProteinG).toBe(49);

  // Ensure NO fake cards exist
  expect(parsed.meals.some((m) => m.customTitle.includes('Estimated meal'))).toBe(false);
  expect(parsed.meals.some((m) => m.customTitle.includes('ESTIMATED DAILY TOTAL'))).toBe(false);
  expect(parsed.meals.some((m) => m.customTitle === 'Saturday')).toBe(false);

  // Check Guidance
  expect(parsed.guidanceNotes).toContain('2–2.5 L fluids');
  expect(parsed.guidanceNotes).toContain('frequent urination');
  expect(parsed.guidanceNotes).toContain('06:00–14:00 sleep window');
});

test('Integration Test: Real uploaded DOCX parses to exact 14 meals with correct values', async () => {
  const fs = await import('fs');
  const path = await import('path');
  const docxPath = 'C:/Users/bisht/.gemini/antigravity/brain/f037c96f-33cc-406c-b140-ae9710549e10/.user_uploaded/media_1795263127434_e3feb49b.docx';

  if (!fs.existsSync(docxPath)) {
    console.log('DOCX file not found at path, skipping docx test');
    return;
  }

  const buffer = fs.readFileSync(docxPath);
  const parsed = await parseDietPlanFile(buffer, 'Fitvora_Pradeep_Week_1_Diet_Plan.docx');

  expect(parsed.success).toBe(true);
  expect(parsed.meals.length).toBe(14); // Exactly 14 meals!

  for (let d = 0; d < 7; d++) {
    const dayMeals = parsed.meals.filter((m) => m.dayOfWeek === d);
    expect(dayMeals.length).toBe(2);
    expect(dayMeals[0]!.mealType).toBe('breakfast');
    expect(dayMeals[0]!.scheduledTime).toBe('14:30');
    expect(dayMeals[1]!.mealType).toBe('dinner');
    expect(dayMeals[1]!.scheduledTime).toBe('21:00');
  }

  // Ensure no fake cards
  expect(parsed.meals.some((m) => m.customTitle.includes('Estimated meal'))).toBe(false);
  expect(parsed.meals.some((m) => m.customTitle.includes('ESTIMATED DAILY TOTAL'))).toBe(false);
});

