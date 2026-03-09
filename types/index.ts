export type QuestionType = "mc" | "tf" | "fitb" | "matching";

export interface Question {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface Level {
  id: string;
  title: string;
  description: string;
  keyTopics: string[];
  completed?: boolean;
  xpEarned?: number;
  questions?: Question[];
}

export interface Unit {
  id: string;
  title: string;
  levels: Level[];
}

export interface Course {
  id: string;
  name: string;
  subject: string;
  sourceText: string;
  units: Unit[];
  createdAt: number;
}

export interface ClaudeCourseResponse {
  courseName: string;
  units: {
    unitTitle: string;
    levels: {
      levelId: string;
      title: string;
      description: string;
      keyTopics: string[];
    }[];
  }[];
}

export interface ClaudeQuestionsResponse {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}
