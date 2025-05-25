export interface KraepelinRow {
  numbers: number[];
}

export interface KraepelinAnswer {
  answers: (number | null)[]; // Use null for unanswered
  timeTaken: number; // Time in milliseconds
}

export interface KraepelinTestState {
  testId: string;
  currentRowIndex: number;
  rows: KraepelinRow[];
  userAnswers: KraepelinAnswer[];
  startTime: number; // Timestamp when the test started
  currentRowStartTime: number; // Timestamp when the current row started
  isCompleted: boolean;
}

export interface StartTestResponse {
  testId: string;
  firstRow: KraepelinRow;
  currentRowIndex: number;
  startTime: number;
}

export interface SubmitAnswerRequest {
  testId: string;
  rowIndex: number;
  answers: (number | null)[];
  timeTaken: number;
}

export interface SubmitAnswerResponse {
  success: boolean;
  message?: string;
  nextRow?: KraepelinRow;
  currentRowIndex?: number;
  isCompleted: boolean;
  result?: KraepelinTestState; // Full state or summary on completion
}

export interface KraepelinResults {
  // Placeholder for calculated results
  speed?: number;
  consistency?: number;
  endurance?: number;
  // Add other relevant result metrics here
}