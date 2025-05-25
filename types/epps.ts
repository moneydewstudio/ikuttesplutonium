// EPPS Dimensions based on Murray's theory
export type EPPSDimension = 
  | 'Achievement'
  | 'Deference'
  | 'Order'
  | 'Exhibition'
  | 'Autonomy'
  | 'Affiliation'
  | 'Intraception'
  | 'Succorance'
  | 'Dominance'
  | 'Abasement'
  | 'Nurturance'
  | 'Change'
  | 'Endurance'
  | 'Heterosexuality'
  | 'Aggression';

// EPPS Question structure
export interface EPPSQuestion {
  id: number;
  pair: [
    { label: 'A'; text: string; },
    { label: 'B'; text: string; }
  ];
  dimensions: {
    A: EPPSDimension;
    B: EPPSDimension;
  };
}

// EPPS Answer structure
export interface EPPSAnswer {
  questionId: number;
  selectedLabel: 'A' | 'B';
  timestamp: number;
}

// EPPS Result structure
export interface EPPSResult {
  testId: string;
  userId?: string;
  startTime: number;
  endTime: number;
  answers: EPPSAnswer[];
  dimensionScores: Record<EPPSDimension, number>;
  interpretations: Record<EPPSDimension, 'high' | 'medium' | 'low'>;
  batch: {
    current: number;
    total: number;
    questionsPerBatch: number;
  };
}
