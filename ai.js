export function generateAIResponse(
  expenses,
  budget
) {

  if (!expenses.length) {
    return "👋 Add expenses to get insights.";
  }

  let total = expenses.reduce(
    (a, b) => a + b.amount,
    0
  );

  let food = expenses
    .filter(e => e.category === "Food")
    .reduce((a, b) => a + b.amount, 0);

  let travel = expenses
    .filter(e => e.category === "Travel")
    .reduce((a, b) => a + b.amount, 0);

  if (budget > 0 && total > budget) {
    return "⚠ You are overspending!";
  }

  if (food > total * 0.4) {
    return "🍔 Food spending is too high.";
  }

  if (travel > total * 0.4) {
    return "✈ Travel spending is high.";
  }

  return "✅ Financial health looks good.";
}