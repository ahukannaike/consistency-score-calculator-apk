import { DailyProfitOption } from '../types';

/**
 * Generates practical, intelligent daily profit options to reach the target consistency score.
 * Ensures all daily profit options stay at or below the trader's current highest profitable day.
 */
export function generateDailyProfitOptions(
  additionalProfitNeeded: number,
  bestTradingDay: number
): DailyProfitOption[] {
  if (additionalProfitNeeded <= 0 || bestTradingDay <= 0) {
    return [];
  }

  const fastestDays = Math.max(1, Math.ceil(additionalProfitNeeded / bestTradingDay));
  
  // The average daily profit required for the fastest valid path
  const fastestDailyProfit = Number(
    Math.min(bestTradingDay, additionalProfitNeeded / fastestDays).toFixed(2)
  );

  // Generate a range of practical day targets from conservative to fastest
  const targetDaysSet = new Set<number>();
  targetDaysSet.add(fastestDays);

  if (fastestDays === 1) {
    [2, 3, 5, 8, 10, 15, 20].forEach((d) => targetDaysSet.add(d));
  } else if (fastestDays <= 3) {
    [fastestDays + 1, fastestDays + 2, fastestDays + 4, fastestDays + 7, fastestDays + 11, fastestDays + 17]
      .filter((d) => d <= 30)
      .forEach((d) => targetDaysSet.add(d));
  } else if (fastestDays <= 7) {
    [
      fastestDays + 1,
      fastestDays + 3,
      Math.round(fastestDays * 1.5),
      Math.round(fastestDays * 2),
      Math.round(fastestDays * 3),
    ].forEach((d) => targetDaysSet.add(d));
  } else {
    [
      Math.round(fastestDays * 1.25),
      Math.round(fastestDays * 1.5),
      Math.round(fastestDays * 2),
      Math.round(fastestDays * 2.5),
      Math.round(fastestDays * 3),
    ].forEach((d) => targetDaysSet.add(d));
  }

  // Also check standard round dollar increments ($25, $50, $75, $100, $150, $200, $250, $300, $400, $500, $750, $1000)
  const standardPaces = [25, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1500, 2000];
  for (const pace of standardPaces) {
    if (pace < bestTradingDay && pace < additionalProfitNeeded) {
      const days = Math.ceil(additionalProfitNeeded / pace);
      if (days >= fastestDays && days <= 40) {
        targetDaysSet.add(days);
      }
    }
  }

  // Convert sorted day targets into distinct daily profit options
  const rawDays = Array.from(targetDaysSet).sort((a, b) => b - a); // Descending days = Ascending daily profit
  const optionsMap = new Map<number, DailyProfitOption>();

  for (const days of rawDays) {
    let dailyProfit = Number((additionalProfitNeeded / days).toFixed(2));
    
    // Safety clamp to not exceed bestTradingDay
    if (dailyProfit > bestTradingDay) {
      dailyProfit = bestTradingDay;
    }

    if (dailyProfit <= 0) continue;

    const calculatedDays = Math.ceil(additionalProfitNeeded / dailyProfit);
    const isFastest = calculatedDays === fastestDays;

    // Avoid duplicate day entries
    if (!optionsMap.has(calculatedDays)) {
      optionsMap.set(calculatedDays, {
        dailyProfit,
        daysNeeded: calculatedDays,
        isFastest,
      });
    }
  }

  // Ensure fastest valid option is definitely included
  if (!optionsMap.has(fastestDays)) {
    optionsMap.set(fastestDays, {
      dailyProfit: fastestDailyProfit,
      daysNeeded: fastestDays,
      isFastest: true,
    });
  }

  // Convert to array and sort ascending by dailyProfit / descending by days
  let finalOptions = Array.from(optionsMap.values()).sort((a, b) => a.dailyProfit - b.dailyProfit);

  // Mark the single fastest valid path
  const minDays = Math.min(...finalOptions.map((o) => o.daysNeeded));
  finalOptions = finalOptions.map((opt) => ({
    ...opt,
    isFastest: opt.daysNeeded === minDays,
  }));

  // Limit to 5-7 clean options so it's readable and not cluttered
  if (finalOptions.length > 7) {
    // Keep fastest, lowest, and evenly distributed middle options
    const fastestOpt = finalOptions[finalOptions.length - 1];
    const lowestOpt = finalOptions[0];
    const middleCount = 4;
    const step = (finalOptions.length - 2) / (middleCount + 1);
    const selected: DailyProfitOption[] = [lowestOpt];
    
    for (let i = 1; i <= middleCount; i++) {
      const idx = Math.round(i * step);
      if (idx > 0 && idx < finalOptions.length - 1) {
        selected.push(finalOptions[idx]);
      }
    }
    selected.push(fastestOpt);
    
    // Deduplicate and re-sort
    const seen = new Set<number>();
    finalOptions = selected.filter((o) => {
      if (seen.has(o.daysNeeded)) return false;
      seen.add(o.daysNeeded);
      return true;
    }).sort((a, b) => a.dailyProfit - b.dailyProfit);
  }

  return finalOptions;
}
