import { CalculationInputs, CalculationResult, ValidationResult } from '../types';

/**
 * Parses user string input into a sanitized number.
 * Supports numbers with commas (e.g. 2,500.50).
 */
export function parseNumberInput(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const sanitized = value.replace(/,/g, '').trim();
  const parsed = Number(sanitized);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Formats a number as a standard USD currency string ($X,XXX.XX)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a percentage value (XX.XX%)
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Validates the inputs according to the prop firm calculation rules.
 */
export function validateInputs(inputs: CalculationInputs): ValidationResult {
  const errors: ValidationResult['errors'] = {};
  const warnings: ValidationResult['warnings'] = {};

  const totalProfit = parseNumberInput(inputs.totalProfit);
  const consistencyLimit = parseNumberInput(inputs.consistencyLimit);
  const bestTradingDay = parseNumberInput(inputs.bestTradingDay);
  const profitTarget = parseNumberInput(inputs.profitTarget);

  // Total Profit validation
  if (totalProfit === null) {
    errors.totalProfit = 'Please enter your total profit.';
  } else if (totalProfit <= 0) {
    errors.totalProfit = 'Total Profit must be greater than zero ($0.00).';
  }

  // Consistency Limit validation
  if (consistencyLimit === null) {
    errors.consistencyLimit = 'Please enter the consistency limit percentage.';
  } else if (consistencyLimit <= 0) {
    errors.consistencyLimit = 'Consistency Limit must be greater than 0%.';
  } else if (consistencyLimit > 100) {
    warnings.consistencyLimit = 'Consistency limit is above 100%. Most prop firms enforce limits between 15% and 50%.';
  }

  // Best Trading Day validation
  if (bestTradingDay === null) {
    errors.bestTradingDay = 'Please enter your highest-profit trading day.';
  } else if (bestTradingDay < 0) {
    errors.bestTradingDay = 'Current Best Trading Day cannot be negative.';
  } else if (totalProfit !== null && totalProfit > 0 && bestTradingDay > totalProfit) {
    errors.bestTradingDay = 'Current Best Trading Day cannot exceed Total Profit.';
  }

  // Optional Profit Target validation
  if (inputs.profitTarget.trim() !== '') {
    if (profitTarget === null || profitTarget <= 0) {
      errors.profitTarget = 'Profit Target must be a positive number if provided.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculates consistency scores, requirements, and projections based on validated inputs.
 */
export function calculateConsistencyScore(inputs: CalculationInputs): CalculationResult | null {
  const validation = validateInputs(inputs);
  if (!validation.isValid) return null;

  const totalProfit = parseNumberInput(inputs.totalProfit)!;
  const consistencyLimit = parseNumberInput(inputs.consistencyLimit)!;
  const bestTradingDay = parseNumberInput(inputs.bestTradingDay)!;
  const rawProfitTarget = parseNumberInput(inputs.profitTarget);
  const profitTarget = (rawProfitTarget !== null && rawProfitTarget > 0) ? rawProfitTarget : null;

  // Consistency Score formula: Best Trading Day ÷ Total Profit × 100
  const consistencyScore = (bestTradingDay / totalProfit) * 100;

  // Minimum total profit required purely to satisfy the Consistency Limit
  const profitForConsistency = bestTradingDay / (consistencyLimit / 100);

  // Required Final Profit is the greater of:
  // 1. The user's Profit Target (if specified)
  // 2. The minimum total profit required to satisfy the Consistency Limit
  // 3. The current total profit (if already at or above both)
  let requiredTotalProfit = profitForConsistency;
  if (profitTarget !== null) {
    requiredTotalProfit = Math.max(profitTarget, profitForConsistency);
  }
  requiredTotalProfit = Math.max(requiredTotalProfit, totalProfit);

  // Additional Profit Needed = Required Final Profit − Current Total Profit
  const additionalProfitNeeded = Math.max(0, requiredTotalProfit - totalProfit);

  // Pass rule: The trader is ready/passing ONLY when BOTH conditions are satisfied:
  // 1. Current consistency score is at or below the consistency limit
  // 2. Current total profit has reached the profit target (if specified)
  // 3. No additional profit is required
  const isConsistencyMet = consistencyScore <= consistencyLimit + 1e-9;
  const isTargetMet = profitTarget === null || totalProfit >= profitTarget - 1e-9;
  const isPassed = isConsistencyMet && isTargetMet && additionalProfitNeeded <= 1e-9;

  // Maximum Allowed Best Day = Total Profit × Consistency Limit ÷ 100
  const maxAllowedBestDay = totalProfit * (consistencyLimit / 100);

  // Daily Profit Cap = Current Best Trading Day
  const dailyProfitCap = bestTradingDay;

  // Minimum Days Needed = ceiling(Additional Profit Needed ÷ Current Best Trading Day)
  let minimumDaysNeeded = 0;
  if (additionalProfitNeeded > 0 && dailyProfitCap > 0) {
    minimumDaysNeeded = Math.ceil(additionalProfitNeeded / dailyProfitCap);
  }

  // Profit Target Progress
  let profitTargetProgress: number | null = null;
  if (profitTarget !== null && profitTarget > 0) {
    profitTargetProgress = (totalProfit / profitTarget) * 100;
  }

  // Projected Consistency Score at Target (Required Final Profit)
  const finalProjectedProfit = totalProfit + additionalProfitNeeded;
  const projectedConsistencyScore = finalProjectedProfit > 0
    ? (bestTradingDay / finalProjectedProfit) * 100
    : consistencyScore;

  return {
    consistencyScore,
    isPassed,
    consistencyLimit,
    totalProfit,
    bestTradingDay,
    maxAllowedBestDay,
    requiredTotalProfit,
    additionalProfitNeeded,
    dailyProfitCap,
    minimumDaysNeeded,
    profitTarget,
    profitTargetProgress,
    projectedConsistencyScore,
  };
}
