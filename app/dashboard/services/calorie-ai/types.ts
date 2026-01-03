export interface Macronutrients {
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface AnalysisResult {
  foodName: string;
  description: string;
  calories: number;
  macros: Macronutrients;
  servingSize: string;
  thoughtProcess?: string; // Added based on your backend schema
  confidenceScore?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}