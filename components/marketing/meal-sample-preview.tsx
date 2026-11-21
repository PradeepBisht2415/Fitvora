import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function MealSamplePreview() {
  const sampleMeals = [
    {
      type: 'Breakfast',
      time: '8:30 AM',
      title: 'Vegetable Poha with Roasted Peanuts',
      portion: '1 medium bowl (180g) + 1 cup green tea',
      approxCals: '~280 kcal',
      macros: '8g Protein • 44g Carbs • 8g Fat',
      tag: 'Vegetarian',
    },
    {
      type: 'Lunch',
      time: '1:30 PM',
      title: 'Dal Tadka, 2 Phulkas & Bhindi Masala',
      portion: '1 cup dal + 2 small phulkas + 1 cup sabzi + 100g curd',
      approxCals: '~460 kcal',
      macros: '18g Protein • 64g Carbs • 14g Fat',
      tag: 'High Satiety',
    },
    {
      type: 'Evening Snack',
      time: '5:30 PM',
      title: 'Roasted Chana & Masala Buttermilk',
      portion: '30g dry roasted chana + 1 glass chaas (200ml)',
      approxCals: '~140 kcal',
      macros: '8g Protein • 18g Carbs • 3g Fat',
      tag: 'Gut Friendly',
    },
    {
      type: 'Dinner',
      time: '8:30 PM',
      title: 'Moong Dal Khichdi with Kachumber Salad',
      portion: '1 medium bowl khichdi (1.5 cup) + 1 bowl cucumber tomato salad',
      approxCals: '~380 kcal',
      macros: '14g Protein • 58g Carbs • 9g Fat',
      tag: 'Easy Digestion',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white/60 border-t border-border-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-fresh-green">
            Representative Meal Samples
          </span>
          <h2 className="text-3xl font-extrabold text-forest-green sm:text-4xl">
            Real Home Food, Sensibly Portioned
          </h2>
          <p className="text-sm text-muted-text">
            Every household cooks differently. Below is an illustrative sample of how familiar
            daily Indian dishes are arranged for satiety and energy balance.
          </p>
          <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
            * Representative examples. Actual portions and alternatives are customized individually.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleMeals.map((meal) => (
            <Card
              key={meal.type}
              className="border-border-soft hover:border-forest-green/40 transition-all flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                    {meal.type}
                  </Badge>
                  <span className="text-xs font-semibold text-muted-text">
                    {meal.time}
                  </span>
                </div>
                <CardTitle className="text-base text-forest-green pt-2 leading-snug">
                  {meal.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <div className="text-xs text-dark-text bg-pale-green/40 p-2.5 rounded-xl border border-pale-green-dark">
                  <strong className="block text-forest-green text-[10px] uppercase tracking-wider">
                    Portion:
                  </strong>
                  {meal.portion}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-text border-t border-border-soft pt-2">
                  <span className="font-bold text-forest-green">{meal.approxCals}</span>
                  <span>{meal.macros}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
