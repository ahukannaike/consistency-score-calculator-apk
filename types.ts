export interface CalculationInputs {
  profitTarget: string; // Optional
  consistencyLimit: string;
  totalProfit: string;
  bestTradingDay: string;
}

export interface CalculationResult {
  consistencyScore: number;
  isPassed: boolean;
  consistencyLimit: number;
  totalProfit: number;
  bestTradingDay: number;
  maxAllowedBestDay: number;
  requiredTotalProfit: number;
  additionalProfitNeeded: number;
  dailyProfitCap: number;
  minimumDaysNeeded: number;
  profitTarget: number | null;
  profitTargetProgress: number | null;
  projectedConsistencyScore?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: {
    profitTarget?: string;
    consistencyLimit?: string;
    totalProfit?: string;
    bestTradingDay?: string;
    general?: string;
  };
  warnings: {
    consistencyLimit?: string;
  };
}

export interface DailyProfitOption {
  dailyProfit: number;
  daysNeeded: number;
  isFastest: boolean;
}

