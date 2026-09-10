export interface RecommendedMeal {
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  meal_name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fats: number;
}

export function generateRecommendedMeals(
  targetCalories: number = 2200,
  foodPreference: string = "Non-Vegetarian",
  goal: string = "General Fitness",
  allergies: string[] = []
): RecommendedMeal[] {
  const isVeg = foodPreference === "Vegetarian";
  const isVegan = foodPreference === "Vegan";

  // Calorie Distribution: Breakfast 25%, Lunch 35%, Dinner 25%, Snacks 15%
  const bCals = Math.round(targetCalories * 0.25);
  const lCals = Math.round(targetCalories * 0.35);
  const dCals = Math.round(targetCalories * 0.25);
  const sCals = Math.round(targetCalories * 0.15);

  let breakfastName = "Scrambled Eggs (3) with Whole Grain Toast & Avocado";
  let lunchName = "Grilled Chicken Breast with Brown Rice and Steamed Broccoli";
  let dinnerName = "Baked Salmon Fillet with Quinoa and Roasted Asparagus";
  let snackName = "Greek Yogurt with Mixed Berries and Almonds";

  if (isVegan) {
    breakfastName = "Tofu Scramble with Spinach, Nutritional Yeast & Sprouted Bread";
    lunchName = "Lentil & Chickpea Buddha Bowl with Tahini Dressing & Sweet Potato";
    dinnerName = "Tempeh Stir-fry with Edamame, Soba Noodles & Sesame Greens";
    snackName = "Chia Seed Pudding with Coconut Milk, Walnuts & Blueberries";
  } else if (isVeg) {
    breakfastName = "Oatmeal Bowl with Whey/Plant Protein, Chia Seeds & Banana";
    lunchName = "Paneer & Vegetable Quinoa Bowl with Spiced Chickpeas";
    dinnerName = "Lentil Dal with Brown Rice, Sautéed Greens & Greek Yogurt";
    snackName = "Cottage Cheese / Paneer cubes with Roasted Almonds";
  }

  // Adjust for allergies if mentioned
  const allergyLower = allergies.map((a) => a.toLowerCase());
  if (allergyLower.includes("dairy") && !isVegan) {
    breakfastName = breakfastName.replace("Greek Yogurt", "Almond Yogurt").replace("Cottage Cheese", "Hummus & Carrots");
    snackName = "Hummus with Cucumber, Celery & Pumpkin Seeds";
  }
  if (allergyLower.includes("nuts")) {
    snackName = snackName.replace("Almonds", "Pumpkin Seeds").replace("Walnuts", "Sunflower Seeds");
  }

  return [
    {
      meal_type: "Breakfast",
      meal_name: breakfastName,
      calories: bCals,
      protein: Math.round((bCals * 0.25) / 4),
      carbohydrates: Math.round((bCals * 0.45) / 4),
      fats: Math.round((bCals * 0.3) / 9)
    },
    {
      meal_type: "Lunch",
      meal_name: lunchName,
      calories: lCals,
      protein: Math.round((lCals * 0.35) / 4),
      carbohydrates: Math.round((lCals * 0.4) / 4),
      fats: Math.round((lCals * 0.25) / 9)
    },
    {
      meal_type: "Dinner",
      meal_name: dinnerName,
      calories: dCals,
      protein: Math.round((dCals * 0.35) / 4),
      carbohydrates: Math.round((dCals * 0.35) / 4),
      fats: Math.round((dCals * 0.3) / 9)
    },
    {
      meal_type: "Snacks",
      meal_name: snackName,
      calories: sCals,
      protein: Math.round((sCals * 0.25) / 4),
      carbohydrates: Math.round((sCals * 0.45) / 4),
      fats: Math.round((sCals * 0.3) / 9)
    }
  ];
}
