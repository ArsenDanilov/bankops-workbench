const VISUAL_CAP_MULTIPLIER = 1.5;

export interface AmountBaselinePresentation {
  currentPosition: number;
  medianPosition: number;
  rangeStartPosition: number;
  rangeEndPosition: number;
  isOffScale: boolean;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export const createAmountBaselinePresentation = (
  current: number,
  median: number,
  typicalMinimum: number,
  typicalMaximum: number,
): AmountBaselinePresentation => {
  const visualMaximum = Math.max(typicalMaximum * VISUAL_CAP_MULTIPLIER, 1);
  const positionFor = (value: number) =>
    clampPercent((value / visualMaximum) * 100);

  return {
    currentPosition: positionFor(current),
    medianPosition: positionFor(median),
    rangeStartPosition: positionFor(typicalMinimum),
    rangeEndPosition: positionFor(typicalMaximum),
    isOffScale: current > visualMaximum,
  };
};
