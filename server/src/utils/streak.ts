export function calculateStreak(history: any[]) {
  if (!history || history.length === 0) return 0;

  const days = [
    ...new Set(
      history.map((s) =>
        new Date(s.date).toDateString()
      )
    ),
  ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  let current = new Date();

  for (let i = 0; i < days.length; i++) {
    const d = new Date(days[i]);

    if (d.toDateString() === current.toDateString()) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else if (
      i === 0 &&
      d.toDateString() ===
        new Date(current.setDate(current.getDate() - 1)).toDateString()
    ) {
      
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
