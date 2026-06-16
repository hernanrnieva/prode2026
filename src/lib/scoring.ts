// Scoring rules for the Prode. See /reglas for the player-facing explanation.
//
// Points for a match = base + extra:
//   base  : 5 if the predicted outcome (home win / draw / away win) is right, else 0
//   extra : max(0, EXTRA_CAP - goalsOff), where goalsOff is the total goal
//           difference from the real score across both teams
// Max 10 (exact score), min 0. The two parts are independent.

export const BASE_POINTS = 5;
export const EXTRA_CAP = 5;

type Score = { homeScore: number; awayScore: number };

function outcome({ homeScore, awayScore }: Score): -1 | 0 | 1 {
  return Math.sign(homeScore - awayScore) as -1 | 0 | 1;
}

export function basePoints(prediction: Score, actual: Score): number {
  return outcome(prediction) === outcome(actual) ? BASE_POINTS : 0;
}

export function extraPoints(prediction: Score, actual: Score): number {
  const goalsOff =
    Math.abs(prediction.homeScore - actual.homeScore) +
    Math.abs(prediction.awayScore - actual.awayScore);
  return Math.max(0, EXTRA_CAP - goalsOff);
}

export function isExactScore(prediction: Score, actual: Score): boolean {
  return (
    prediction.homeScore === actual.homeScore &&
    prediction.awayScore === actual.awayScore
  );
}

export function computePoints(prediction: Score, actual: Score): number {
  return basePoints(prediction, actual) + extraPoints(prediction, actual);
}
