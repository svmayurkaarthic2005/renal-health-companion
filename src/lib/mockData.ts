import { HealthPlan, DayPlan } from '@/types/health';

export function generateMockPlan(prompt: string): HealthPlan {
  const today = new Date();
  
  const shoppingItems = [
    'Oatmeal', 'Bananas', 'Rice', 'Chicken breast', 
    'Leafy greens', 'Carrots', 'Applesauce', 'Herbal tea',
    'Low-fat yogurt', 'Whole grain bread'
  ];

  const days: DayPlan[] = Array.from({ length: 3 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    return {
      id: crypto.randomUUID(),
      dayNumber: i + 1,
      date: date.toISOString(),
      meals: {
        breakfast: getMealForDay(i, 'breakfast'),
        lunch: getMealForDay(i, 'lunch'),
        dinner: getMealForDay(i, 'dinner'),
      },
      sleep: i === 0 ? 'Bed by 10PM' : 'Bed by 9PM',
      activity: getActivityForDay(i),
      bp: { systolic: 120, diastolic: 80 },
      completed: false,
    };
  });

  return {
    id: crypto.randomUUID(),
    prompt,
    intro: `A healthy eating plan often requires a diet that is gentle on the digestive system. Avoiding spicy, fatty, and heavy foods can help. Instead, focus on bland, easily digestible foods that can help soothe the stomach and aid recovery.`,
    shoppingItems: shoppingItems.slice(0, 8 + Math.floor(Math.random() * 3)),
    days,
    createdAt: new Date().toISOString(),
  };
}

function getMealForDay(dayIndex: number, mealType: 'breakfast' | 'lunch' | 'dinner'): string {
  const meals = {
    breakfast: [
      'Oatmeal with banana slices',
      'Plain yogurt with applesauce',
      'Smoothie with banana and ginger',
    ],
    lunch: [
      'Plain chicken salad with leafy greens',
      'Grilled chicken with leafy greens',
      'Light vegetable soup with plain crackers',
    ],
    dinner: [
      'Steamed rice with boiled carrots and chicken',
      'Whole grain toast with scrambled eggs',
      'Herbal tea with saltines',
    ],
  };

  return meals[mealType][dayIndex % meals[mealType].length];
}

function getActivityForDay(dayIndex: number): string {
  const activities = [
    '15 min gentle yoga',
    '20 min light walk',
    '15 min breathing exercises',
  ];
  return activities[dayIndex % activities.length];
}
