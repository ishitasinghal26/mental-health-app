type Session = {
  date: string;
};

export function calculateStreak(history: Session[]): number {
  if (!history.length) return 0;

  const days = new Set(
    history.map((s) => new Date(s.date).toDateString())
  );

  let streak = 0;
  let current = new Date();

  while (true) {
    const day = current.toDateString();

    if (days.has(day)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else break;
  }

  return streak;
}
