import type { Topic } from "./curriculum";

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Lesson = {
  title: string;
  objectives: string[];
  content: string;
  examples: { question: string; solution: string }[];
  summary: string[];
  quiz: QuizQuestion[];
};

export type LessonResponse = { topic: Topic; lesson: Lesson };

export type Solution = {
  problem: string;
  concepts: string[];
  steps: { title: string; content: string }[];
  answer: string;
  tip: string;
};
