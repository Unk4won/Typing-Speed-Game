// src/types.ts
export type AppState = 'home' | 'game' | 'finish';

export interface FinishProps {
  wpm: number;
  accuracy: number;
  score: number;
  onRestartGame: () => void;
  onGoHome: () => void;
}