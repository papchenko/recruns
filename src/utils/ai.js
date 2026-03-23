export const calculateTDEE = (weight, activity) => {
  const base = weight * 22;
  const factor = activity === "high" ? 1.7 : activity === "medium" ? 1.5 : 1.3;
  return Math.round(base * factor);
};

export const calculateMacros = (tdee, goal) => {
  let calories = tdee;
  if (goal === "lose") calories -= 400;
  if (goal === "gain") calories += 300;

  return {
    calories,
    protein: Math.round((calories * 0.3) / 4),
    fat: Math.round((calories * 0.25) / 9),
    carbs: Math.round((calories * 0.45) / 4),
  };
};

export const detectPlateau = (entries) => {
  if (entries.length < 5) return false;
  const last = entries.slice(-5).map((e) => e.weight);
  return Math.max(...last) - Math.min(...last) < 0.3;
};

export const detectWater = (entries) => {
  if (entries.length < 3) return false;
  const last = entries.slice(-3).map((e) => e.weight);
  return last[2] > last[1] && last[1] > last[0];
};

export const buildAI = (entries, week) => {
  if (!entries.length || !week) return null;

  const current = entries.at(-1).weight;
  const tdee = calculateTDEE(current, week.activityLevel);
  const macros = calculateMacros(tdee, week.goal);

  let message = "Good progress";

  if (detectWater(entries)) message = "Water retention";
  else if (detectPlateau(entries)) message = "Plateau — reduce calories";

  return { macros, message };
};