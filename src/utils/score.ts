import type { ReviewScore } from '../types';

export const PASS_THRESHOLD = 70;

const WEIGHTS = {
  team: 0.20,
  market: 0.25,
  product: 0.25,
  business: 0.20,
  funding: 0.10
};

export function calculateWeightedScore(scores: ReviewScore): number {
  const weighted =
    scores.team * WEIGHTS.team +
    scores.market * WEIGHTS.market +
    scores.product * WEIGHTS.product +
    scores.business * WEIGHTS.business +
    scores.funding * WEIGHTS.funding;
  return Math.round(weighted * 100) / 100;
}

export function isPassingScore(score: number): boolean {
  return score >= PASS_THRESHOLD;
}

export function calculateDemoTotalScore(
  team: number,
  market: number,
  product: number,
  value: number
): number {
  return team + market + product + value;
}
