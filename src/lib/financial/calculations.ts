export interface FinancialInput {
  marketValue: number;
  maxBid: number;
  estimatedSaleValue: number;
  renovationCost: number;
  legalCost: number;
  itbiCost: number;
  registrationCost: number;
  evictionCost: number;
}

export interface FinancialOutput {
  estimatedProfit: number;
  roiPercent: number;
  safetyMargin: number;
  breakEvenValue: number;
  totalCost: number;
}

export function calculateFinancialAnalysis(input: FinancialInput): FinancialOutput {
  const totalCost =
    input.maxBid +
    input.renovationCost +
    input.legalCost +
    input.itbiCost +
    input.registrationCost +
    input.evictionCost;

  const estimatedProfit = input.estimatedSaleValue - totalCost;
  const roiPercent = totalCost > 0 ? (estimatedProfit / totalCost) * 100 : 0;
  const safetyMargin =
    input.marketValue > 0
      ? ((input.marketValue - input.maxBid) / input.marketValue) * 100
      : 0;
  const breakEvenValue = totalCost;

  return {
    estimatedProfit,
    roiPercent,
    safetyMargin,
    breakEvenValue,
    totalCost,
  };
}
