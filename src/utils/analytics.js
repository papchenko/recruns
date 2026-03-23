export const formatChartData = (entries) => {
  return entries.map((e) => ({
    date: new Date(e.createdAt?.seconds * 1000).toLocaleDateString(),
    weight: e.weight,
  }));
};

export const groupByWeeks = (entries) => {
  const weeks = [];
  for (let i = 0; i < entries.length; i += 7) {
    weeks.push(entries.slice(i, i + 7));
  }
  return weeks;
};

export const calculateWeeklyStats = (entries) => {
  return groupByWeeks(entries).map((week, i) => {
    if (week.length < 2) return null;

    const start = week[0].weight;
    const end = week.at(-1).weight;
    const change = +(end - start).toFixed(2);

    return {
      week: i + 1,
      change,
      type:
        change > 0 ? "gain" : change < 0 ? "loss" : "stable",
    };
  }).filter(Boolean);
};