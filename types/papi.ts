export interface PapiQuestion {
  id: number;
  pair: [
    { label: 'A'; text: string },
    { label: 'B'; text: string }
  ];
  dimensions: {
    A: PapiDimension;
    B: PapiDimension;
  };
}

export type PapiDimension = 
  | 'Dominance'
  | 'Conformity'
  | 'Empathy'
  | 'Vigor'
  | 'Stability'
  | 'Responsibility'
  | 'Sociability'
  | 'Self-Control'
  | 'Leadership'
  | 'Initiative'
  | 'Independence';

export interface PapiAnswer {
  questionId: number;
  selectedLabel: 'A' | 'B';
  timestamp: number;
}

export interface PapiResult {
  userId?: string;
  testId: string;
  startTime: number;
  endTime: number;
  answers: PapiAnswer[];
  dimensionScores: Record<PapiDimension, number>;
  normalizedScores: Record<PapiDimension, number>;
}
