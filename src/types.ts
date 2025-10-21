/**
 * TypeScript types for Henotace AI SDK
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
}

export interface TutoringSession {
  session_id: string;
  student_id: string;
  subject: string;
  grade_level: string;
  topic?: string;
  language: string;
  created_at: string;
}

export interface ChatMessage {
  session_id: string;
  user_message: string;
  ai_response: string;
  context?: string;
  timestamp: string;
}

export interface AssessmentData {
  student_id: string;
  assignment_type: string;
  subject: string;
  questions: Question[];
  answers: Answer[];
}

export interface ClassworkData {
  student_id: string;
  subject: string;
  topic: string;
  class_level: string;
  questions: Question[];
  total_points: number;
  context?: string;
  chat_history?: ChatMessage[];
}

export interface ClassworkGenerationRequest {
  subject: string;
  topic: string;
  class_level?: string;
  question_count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  context?: string;
  chat_history?: ChatMessage[];
}

export interface ChatCustomization {
  author_name?: string;
  language?: string;
  personality?: string;
  teaching_style?: string;
  branding?: Record<string, any>;
}

export interface EnhancedChatCompletionRequest {
  history: { role: 'user' | 'assistant'; content: string }[];
  input: string;
  subject?: string;
  topic?: string;
  preset?: string;
  author_name?: string;
  language?: string;
  personality?: string;
  teaching_style?: string;
  branding?: Record<string, any>;
}

export interface ClassworkGenerationResponse {
  success: boolean;
  data?: {
    classwork: ClassworkData;
    session_id?: string;
  };
  message?: string;
  timestamp: string;
}

export interface Question {
  id: number;
  question: string;
  correct_answer: string;
  points: number;
}

export interface Answer {
  question_id: number;
  submitted_answer: string;
}

export interface ContentGenerationRequest {
  content_type: string;
  subject: string;
  grade_level: string;
  topic: string;
  requirements?: string;
}

export interface EduGameQuestions {
  game_id: number;
  questions: GameQuestion[];
  total_questions: number;
  retrieved_at: string;
}

export interface GameQuestion {
  id: number;
  question: string;
  choices: string[];
  correct_answer: string;
  points: number;
  difficulty: string;
}

export interface EduGameSubmission {
  game_id: number;
  student_id: string;
  answers: GameAnswer[];
}

export interface GameAnswer {
  question_id: number;
  answer: string;
}

export interface SystemStatus {
  status: string;
  message: string;
  timestamp: string;
}

export interface AssessmentResult {
  student_id: string;
  assignment_type: string;
  subject: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  grade: string;
  feedback: string;
  graded_at: string;
}

export interface ContentGenerationResult {
  content_type: string;
  subject: string;
  grade_level: string;
  topic: string;
  generated_content: string;
  requirements: string;
  generated_at: string;
}

export interface EduGameResult {
  game_id: number;
  student_id: string;
  total_questions: number;
  correct_answers: number;
  total_score: number;
  accuracy_percentage: number;
  grade: string;
  feedback: string;
  submitted_at: string;
}

/**
 * Session storage domain model (client-managed)
 */
export interface SessionChat {
  message: string;
  isReply: boolean;
  timestamp?: number;
}

export interface SessionSubject {
  id: string;
  name: string;
  topic: string;
}

export interface SessionTutor {
  id: string;
  name: string;
  subject: SessionSubject;
  chats: SessionChat[];
  context?: string[];
  persona?: string;
  userProfile?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SessionStudent {
  id: string;
  name?: string;
  tutors: SessionTutor[];
}

export interface SessionStorageSchema {
  students: SessionStudent[];
}

/**
 * Storage connector abstraction
 */
export interface StorageConnector {
  // Root
  getAll(): Promise<SessionStorageSchema>;
  setAll(schema: SessionStorageSchema): Promise<void>;

  // Collections
  listStudents(): Promise<SessionStudent[]>;
  upsertStudent(student: SessionStudent): Promise<void>;
  deleteStudent(studentId: string): Promise<void>;

  listTutors(studentId: string): Promise<SessionTutor[]>;
  upsertTutor(studentId: string, tutor: SessionTutor): Promise<void>;
  deleteTutor(studentId: string, tutorId: string): Promise<void>;

  listChats(studentId: string, tutorId: string): Promise<SessionChat[]>;
  appendChat(studentId: string, tutorId: string, chat: SessionChat): Promise<void>;
  replaceChats(studentId: string, tutorId: string, chats: SessionChat[]): Promise<void>;
}

/**
 * Log levels for SDK logging
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger interface for custom logging implementations
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * SDK config
 */
export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  storage?: StorageConnector;
  // Developer-experience defaults (auto-injected into chats)
  defaultPersona?: string;
  defaultPreset?: string; // falls back to 'tutor_default'
  defaultUserProfile?: Record<string, any>;
  defaultMetadata?: Record<string, any>;
  // Logging configuration
  logging?: {
    enabled?: boolean;
    level?: LogLevel;
    logger?: Logger;
  };
}

export interface TutorInit {
  studentId: string;
  tutorId?: string;
  tutorName?: string;
  subject: SessionSubject; // id, name, topic
  grade_level?: string;
  language?: string;
}
