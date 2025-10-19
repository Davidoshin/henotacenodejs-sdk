/**
 * Henotace AI SDK for Node.js
 * Official SDK for the Henotace AI API
 */

import axios, { AxiosInstance } from 'axios';
import { 
  ApiResponse,
  ErrorResponse,
  StorageConnector,
  SessionChat,
  SDKConfig,
  TutorInit,
  LogLevel,
  Logger,
  ClassworkGenerationRequest,
  ClassworkGenerationResponse,
  ClassworkData
} from './types';
import { createLogger, ConsoleLogger } from './logger';

export type HenotaceConfig = SDKConfig;

export class HenotaceAI {
  private client: AxiosInstance;
  private config: HenotaceConfig;
  private storage: StorageConnector | null;
  private logger: Logger;

  constructor(config: HenotaceConfig) {
    this.config = {
      baseUrl: 'https://api.djtconcept.ng',
      timeout: 30000,
      retries: 3,
      ...config
    };

    // Initialize logger
    const loggingConfig = this.config.logging || {};
    const logLevel = loggingConfig.level ?? LogLevel.INFO;
    const logEnabled = loggingConfig.enabled ?? true;
    this.logger = loggingConfig.logger || createLogger(logLevel, logEnabled);

    this.logger.info('Initializing Henotace AI SDK', {
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      retries: this.config.retries,
      logLevel: LogLevel[logLevel],
      logEnabled
    });

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        'User-Agent': '@henotace/ai-sdk/1.0.0'
      }
    });

    this.setupInterceptors();
    this.storage = config.storage || null;
    // Seed global defaults into a special pseudo-tutor for auto-apply later
    if (config.defaultPersona || config.defaultUserProfile || config.defaultMetadata) {
      // no-op here; applied at send-time if tutor values are not set
    }
  }

  private handleError(error: any): never {
    // Robust network error detection across different error shapes
    const errMessage = String(error?.message || error || '');
    const respDataString = error?.response && error.response.data ? JSON.stringify(error.response.data) : '';
    
    this.logger.error('SDK Error occurred', {
      message: errMessage,
      code: error?.code,
      status: error?.response?.status,
      responseData: error?.response?.data
    });

    if (error?.code === 'NETWORK_ERROR' || errMessage.includes('Network Error') || respDataString.includes('Network Error')) {
      const msg = error?.message || 'Network Error';
      throw new Error(`Network Error: ${msg}`);
    }

    // Now handle HTTP response status codes (only when a response is present)
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid API key. Please check your credentials.');
    } else if (error.response && error.response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response && error.response.status === 500) {
      throw new Error('Internal server error. Please try again later.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug('HTTP Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        this.logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('HTTP Response', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          this.logger.warn('Authentication failed - invalid API key');
          throw new Error('Invalid API key. Please check your credentials.');
        }

        if (error.response?.status === 429) {
          // Rate limit exceeded - don't retry immediately
          const retryAfter = error.response.headers['retry-after'] || 60;
          this.logger.warn('Rate limit exceeded', { retryAfter });
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.client(originalRequest);
        }

        if (error.response?.status >= 500 && originalRequest._retryCount < this.config.retries!) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          this.logger.warn('Server error - retrying request', {
            attempt: originalRequest._retryCount,
            maxRetries: this.config.retries,
            status: error.response.status
          });
          
          await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
          return this.client(originalRequest);
        }

        this.logger.error('Response error', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        return Promise.reject(this.handleError(error));
      }
    );
  }


  /**
   * Check API status - raw response
   */
  async getStatus(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
    this.logger.debug('Checking API status');
    try {
      const response = await this.client.get('/api/external/status/');
      this.logger.info('API status check successful', response.data);
      return response.data;
    } catch (error: any) {
      this.logger.error('API status check failed', error);
      // If this looks like a plain network error, throw a matching message
      if (error && (String(error.message || '').includes('Network Error') || error.code === 'NETWORK_ERROR')) {
        throw new Error(`Network Error: ${error.message || 'Network Error'}`);
      }
      this.handleError(error);
    }
  }

  /**
   * Check API status - boolean convenience
   */
  async getStatusOk(): Promise<boolean> {
    try {
      const res = await this.getStatus();
      return !!res?.success && res?.data?.status === 'ok';
    } catch {
      return false;
    }
  }

  // Removed: session creation and session-bound chat are no longer part of the SDK

  // unified chat completion using tutor prompts from views_tutor.py
  private async completeChat(payload: { history: { role: 'user' | 'assistant'; content: string }[]; input: string; preset?: string; subject?: string; topic?: string }): Promise<{ ai_response: string }> {
    this.logger.debug('Starting chat completion', {
      inputLength: payload.input.length,
      historyLength: payload.history.length,
      subject: payload.subject,
      topic: payload.topic,
      preset: payload.preset
    });

    try {
      // Convert history to the format expected by the tutor prompt endpoint
      const chatHistory = payload.history.map(msg => ({
        sender: msg.role === 'user' ? 'student' : 'tutor',
        message: msg.content
      }));

      const response = await this.client.post('/api/external/working/chat/completion/', {
        history: chatHistory,
        input: payload.input,
        subject: payload.subject || 'general',
        topic: payload.topic || 'general',
        preset: payload.preset || 'tutor_default'
      });
      const data = response.data;
      const aiResponse = data?.data?.ai_response || '';
      
      this.logger.debug('Chat completion successful', {
        responseLength: aiResponse.length,
        subject: payload.subject,
        topic: payload.topic
      });

      return { ai_response: aiResponse };
    } catch (error: any) {
      this.logger.error('Chat completion failed', {
        input: payload.input,
        subject: payload.subject,
        topic: payload.topic,
        error: error.message
      });
      this.handleError(error);
    }
  }


  /**
   * Storage convenience passthroughs
   */
  async listStudents() { if (!this.storage) return []; return this.storage.listStudents(); }
  async upsertStudent(student: any) { if (!this.storage) return; return this.storage.upsertStudent(student); }
  async deleteStudent(studentId: string) { if (!this.storage) return; return this.storage.deleteStudent(studentId); }
  async listTutors(studentId: string) { if (!this.storage) return []; return this.storage.listTutors(studentId); }
  async upsertTutor(studentId: string, tutor: any) { if (!this.storage) return; return this.storage.upsertTutor(studentId, tutor); }
  async deleteTutor(studentId: string, tutorId: string) { if (!this.storage) return; return this.storage.deleteTutor(studentId, tutorId); }
  async listChats(studentId: string, tutorId: string) { if (!this.storage) return []; return this.storage.listChats(studentId, tutorId); }

  // Removed non-chat endpoints from SDK per simplified scope

  /**
   * Set a custom base URL (useful for testing)
   */
  setBaseUrl(url: string): void {
    this.config.baseUrl = url;
    this.client.defaults.baseURL = url;
  }

  /**
   * Get the current configuration
   */
  getConfig(): HenotaceConfig {
    return { ...this.config };
  }

  /**
   * Get the logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Generate context-aware classwork based on chat conversation
   */
  async generateClasswork(request: ClassworkGenerationRequest): Promise<ClassworkGenerationResponse> {
    this.logger.info('Generating classwork', {
      subject: request.subject,
      topic: request.topic,
      classLevel: request.class_level,
      questionCount: request.question_count,
      difficulty: request.difficulty,
      hasContext: !!request.context,
      hasChatHistory: !!request.chat_history?.length
    });

    try {
      // Use the enhanced chat completion endpoint for classwork generation
      const response = await this.client.post('/api/external/working/chat/completion/', {
        history: request.chat_history || [],
        input: `Generate ${request.question_count || 5} practice questions for ${request.subject} on ${request.topic}`,
        subject: request.subject,
        topic: request.topic,
        generate_classwork: true,
        question_count: request.question_count || 5,
        difficulty: request.difficulty || 'medium',
        preset: 'tutor_default'
      }, {
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      this.logger.info('Classwork generated successfully', {
        success: response.data.success,
        questionCount: response.data.data?.classwork?.questions?.length || 0
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Classwork generation failed', {
        error: error.message,
        subject: request.subject,
        topic: request.topic
      });

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: `Classwork generation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Save classwork to the database
   */
  async saveClasswork(classworkData: ClassworkData): Promise<ApiResponse<{ classwork_id: string; session_id: string }>> {
    this.logger.info('Saving classwork', {
      studentId: classworkData.student_id,
      subject: classworkData.subject,
      topic: classworkData.topic,
      questionCount: classworkData.questions.length,
      totalPoints: classworkData.total_points
    });

    try {
      // Prepare the request payload
      const payload = {
        student_id: classworkData.student_id,
        subject: classworkData.subject,
        topic: classworkData.topic,
        class_level: classworkData.class_level,
        questions: classworkData.questions,
        total_points: classworkData.total_points,
        context: classworkData.context || '',
        chat_history: classworkData.chat_history || []
      };

      this.logger.debug('Classwork save payload', payload);

      // Call the save classwork endpoint
      const response = await this.client.post('/api/external/ai-tutor/save-classwork-questions/', payload, {
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      this.logger.info('Classwork saved successfully', {
        success: response.data.success,
        classworkId: response.data.data?.classwork_id
      });

      return response.data;
    } catch (error: any) {
      this.logger.error('Classwork save failed', {
        error: error.message,
        studentId: classworkData.student_id,
        subject: classworkData.subject
      });

      if (error.response?.data) {
        return error.response.data;
      }

      return {
        success: false,
        message: `Classwork save failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Generate and save classwork in one operation
   */
  async generateAndSaveClasswork(request: ClassworkGenerationRequest & { student_id: string }): Promise<ClassworkGenerationResponse> {
    this.logger.info('Generating and saving classwork', {
      studentId: request.student_id,
      subject: request.subject,
      topic: request.topic
    });

    try {
      // First generate the classwork
      const generationResult = await this.generateClasswork(request);
      
      if (!generationResult.success || !generationResult.data?.classwork) {
        return generationResult;
      }

      // Then save it to the database
      const classworkData: ClassworkData = {
        ...generationResult.data.classwork,
        student_id: request.student_id
      };

      const saveResult = await this.saveClasswork(classworkData);
      
      if (!saveResult.success) {
        return {
          success: false,
          message: `Classwork generated but save failed: ${saveResult.message}`,
          timestamp: new Date().toISOString()
        };
      }

      // Return the combined result
      return {
        success: true,
        data: {
          classwork: classworkData,
          session_id: saveResult.data?.session_id
        },
        message: 'Classwork generated and saved successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      this.logger.error('Generate and save classwork failed', {
        error: error.message,
        studentId: request.student_id,
        subject: request.subject
      });

      return {
        success: false,
        message: `Generate and save classwork failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Lightweight Tutor instance to run parallel chat sessions without resetting global context
 */
export class Tutor {
  private sdk: HenotaceAI;
  private studentId: string;
  private tutorId: string;
  private persistentContext: string[] = [];
  private persona: string | null = null;
  private userProfile: Record<string, any> | null = null;
  private metadata: Record<string, any> | null = null;
  private subject: string = 'general';
  private topic: string = 'general';
  private logger: Logger;
  // Checkpoint compression settings
  private compression: { maxTurns: number; maxSummaryChars: number; checkpointEvery: number } = {
    maxTurns: 12,            // keep last N turns verbatim
    maxSummaryChars: 1200,   // cap summary length
    checkpointEvery: 10      // summarize every K turns
  };
  // sessionId removed: chats are storage-managed and backend receives history only

  constructor(sdk: HenotaceAI, studentId: string, tutorId: string, subject?: string, topic?: string) {
    this.sdk = sdk;
    this.studentId = studentId;
    this.tutorId = tutorId;
    this.subject = subject || 'general';
    this.topic = topic || 'general';
    this.logger = sdk.getLogger();
    
    this.logger.debug('Tutor instance created', {
      studentId: this.studentId,
      tutorId: this.tutorId,
      subject: this.subject,
      topic: this.topic
    });
  }

  setContext(context: string | string[]): void {
    this.persistentContext = Array.isArray(context) ? context : [context];
    // Persist to storage if available
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (storage) {
      (async () => {
        const tutors = await storage.listTutors(this.studentId);
        const existing = tutors.find(t => t.id === this.tutorId);
        const name = existing?.name || this.tutorId;
        const subject = existing?.subject || { id: 'unknown', name: 'unknown', topic: '' } as any;
        await storage.upsertTutor(this.studentId, { id: this.tutorId, name, subject, chats: existing?.chats || [], context: this.persistentContext } as any);
      })().catch(() => {});
    }
  }

  setPersona(persona: string): void {
    this.persona = persona;
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (storage) {
      (async () => {
        const tutors = await storage.listTutors(this.studentId);
        const existing = tutors.find(t => t.id === this.tutorId);
        const name = existing?.name || this.tutorId;
        const subject = existing?.subject || { id: 'unknown', name: 'unknown', topic: '' } as any;
        await storage.upsertTutor(this.studentId, { id: this.tutorId, name, subject, chats: existing?.chats || [], context: existing?.context || this.persistentContext, persona } as any);
      })().catch(() => {});
    }
  }

  setUserProfile(profile: Record<string, any>): void {
    this.userProfile = profile;
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (storage) {
      (async () => {
        const tutors = await storage.listTutors(this.studentId);
        const existing = tutors.find(t => t.id === this.tutorId);
        const name = existing?.name || this.tutorId;
        const subject = existing?.subject || { id: 'unknown', name: 'unknown', topic: '' } as any;
        await storage.upsertTutor(this.studentId, { id: this.tutorId, name, subject, chats: existing?.chats || [], context: existing?.context || this.persistentContext, persona: existing?.persona, userProfile: profile } as any);
      })().catch(() => {});
    }
  }

  setMetadata(metadata: Record<string, any>): void {
    this.metadata = metadata;
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (storage) {
      (async () => {
        const tutors = await storage.listTutors(this.studentId);
        const existing = tutors.find(t => t.id === this.tutorId);
        const name = existing?.name || this.tutorId;
        const subject = existing?.subject || { id: 'unknown', name: 'unknown', topic: '' } as any;
        await storage.upsertTutor(this.studentId, { id: this.tutorId, name, subject, chats: existing?.chats || [], context: existing?.context || this.persistentContext, persona: existing?.persona, userProfile: existing?.userProfile, metadata } as any);
      })().catch(() => {});
    }
  }

  // Configure compression policy per tutor
  setCompression(options: Partial<{ maxTurns: number; maxSummaryChars: number; checkpointEvery: number }>): void {
    this.compression = { ...this.compression, ...options };
  }

  // Naive text summary builder (can be swapped for LLM/server summary later)
  private buildSummaryFrom(chats: SessionChat[], maxChars: number): string {
    const lines = chats.map(c => `${c.isReply ? 'AI' : 'User'}: ${c.message}`);
    let summary = lines.join('\n');
    if (summary.length > maxChars) summary = summary.slice(0, maxChars - 3) + '...';
    return summary;
  }

  // Auto-compress when turns exceed thresholds or hit checkpoint intervals
  private async autoCompressIfNeeded(storage: StorageConnector): Promise<void> {
    const chats = await storage.listChats(this.studentId, this.tutorId);
    if (!chats.length) return;
    const shouldCheckpoint = chats.length % this.compression.checkpointEvery === 0;
    const exceedsWindow = chats.length > this.compression.maxTurns * 2; // rough heuristic
    if (shouldCheckpoint || exceedsWindow) {
      await this.compressHistory();
    }
  }

  // Summarize older turns and keep a rolling window of the most recent messages
  async compressHistory(): Promise<void> {
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (!storage) return;
    const chats = await storage.listChats(this.studentId, this.tutorId);
    if (!chats.length) return;
    const keep = this.compression.maxTurns;
    if (chats.length <= keep) return;
    const older = chats.slice(0, Math.max(0, chats.length - keep));
    const recent = chats.slice(-keep);
    const summaryChunk = this.buildSummaryFrom(older, this.compression.maxSummaryChars);
    // Merge summary into tutor metadata
    const tutors = await storage.listTutors(this.studentId);
    const existing = tutors.find(t => t.id === this.tutorId);
    const existingMeta = (existing?.metadata || {}) as Record<string, any>;
    const accumulated = existingMeta.summary ? `${existingMeta.summary}\n---\n${summaryChunk}` : summaryChunk;
    const updatedMeta = { ...existingMeta, summary: accumulated };
    const name = existing?.name || this.tutorId;
    const subject = existing?.subject || { id: 'unknown', name: 'unknown', topic: '' } as any;
    await storage.upsertTutor(this.studentId, {
      id: this.tutorId,
      name,
      subject,
      chats: existing?.chats || [],
      context: existing?.context || this.persistentContext,
      persona: existing?.persona,
      userProfile: existing?.userProfile,
      metadata: updatedMeta
    } as any);
    await storage.replaceChats(this.studentId, this.tutorId, recent);
  }

  async send(message: string, opts?: { context?: string | string[]; preset?: string }): Promise<string> {
    this.logger.debug('Tutor send message', {
      studentId: this.studentId,
      tutorId: this.tutorId,
      messageLength: message.length,
      hasContext: !!opts?.context,
      preset: opts?.preset
    });

    // Build history from storage and use unified completion endpoint
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (storage) {
      // Compress on checkpoints / over window
      await this.autoCompressIfNeeded(storage);
      const chats = await storage.listChats(this.studentId, this.tutorId);
      history = chats.map(c => ({ role: c.isReply ? 'assistant' : 'user', content: c.message }));
      this.logger.debug('Loaded chat history', { historyLength: history.length });
    }
    // RAG-style context injection
    const ephemeral = opts?.context ? (Array.isArray(opts.context) ? opts.context : [opts.context]) : [];
    const mergedContext = [...this.persistentContext, ...ephemeral].filter(Boolean);
    if (mergedContext.length) {
      const clipped = mergedContext.slice(0, 5); // simple budget: top 5 snippets
      const contextBlock = ['[CONTEXT]', ...clipped.map(sn => (sn || '').toString())].join('\n');
      history.push({ role: 'assistant', content: contextBlock });
      this.logger.debug('Added context to history', { contextSnippets: clipped.length });
    }
    // Persona + user profile + metadata injection as context header
    // Auto-apply SDK defaults when tutor-specific values not set
    const sdkConfig: any = (this.sdk as any)['config'] || {};
    const persona = this.persona || sdkConfig.defaultPersona || null;
    const userProfile = this.userProfile || sdkConfig.defaultUserProfile || null;
    const metadata = this.metadata || sdkConfig.defaultMetadata || null;

    const headerParts: string[] = [];
    if (persona) headerParts.push(`[PERSONA] ${persona}`);
    if (userProfile) headerParts.push(`[USER] ${JSON.stringify(userProfile).slice(0, 1000)}`);
    if (metadata) headerParts.push(`[META] ${JSON.stringify(metadata).slice(0, 1000)}`);
    if (headerParts.length) {
      history.push({ role: 'assistant', content: headerParts.join('\n') });
      this.logger.debug('Added persona/profile/metadata to history', { 
        hasPersona: !!persona,
        hasUserProfile: !!userProfile,
        hasMetadata: !!metadata
      });
    }

    const completion = await (this.sdk as any).completeChat({ 
      history, 
      input: message, 
      preset: opts?.preset || sdkConfig.defaultPreset || 'tutor_default',
      subject: this.subject,
      topic: this.topic
    });
    const ai = completion?.ai_response || '';
    
    this.logger.info('Tutor response generated', {
      studentId: this.studentId,
      tutorId: this.tutorId,
      responseLength: ai.length,
      subject: this.subject,
      topic: this.topic
    });

    if (storage) {
      const now = Date.now();
      await storage.appendChat(this.studentId, this.tutorId, { message, isReply: false, timestamp: now } as SessionChat);
      if (ai) await storage.appendChat(this.studentId, this.tutorId, { message: ai, isReply: true, timestamp: now + 1 } as SessionChat);
      this.logger.debug('Chat history updated in storage');
    }
    return ai;
  }

  async history(): Promise<SessionChat[]> {
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (!storage) return [];
    return storage.listChats(this.studentId, this.tutorId);
  }

  get ids() {
    return { studentId: this.studentId, tutorId: this.tutorId };
  }

  /**
   * Generate classwork based on current chat conversation
   */
  async generateClassworkFromChat(request: {
    subject: string;
    topic: string;
    class_level?: string;
    question_count?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }): Promise<ClassworkGenerationResponse> {
    this.logger.info('Generating classwork from chat history', {
      studentId: this.studentId,
      tutorId: this.tutorId,
      subject: request.subject,
      topic: request.topic
    });

    try {
      // Get chat history from storage
      const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
      let chatHistory: any[] = [];
      
      if (storage) {
        const chats = await storage.listChats(this.studentId, this.tutorId);
        chatHistory = chats.map(c => ({
          session_id: this.tutorId,
          user_message: c.isReply ? '' : c.message,
          ai_response: c.isReply ? c.message : '',
          timestamp: new Date(c.timestamp || Date.now()).toISOString()
        }));
      }

      // Generate classwork using the main SDK method
      const result = await this.sdk.generateAndSaveClasswork({
        ...request,
        student_id: this.studentId,
        chat_history: chatHistory,
        context: `Generated from tutoring session with ${this.tutorId}`
      });

      this.logger.info('Classwork generated from chat', {
        success: result.success,
        questionCount: result.data?.classwork?.questions?.length || 0
      });

      return result;
    } catch (error: any) {
      this.logger.error('Failed to generate classwork from chat', {
        error: error.message,
        studentId: this.studentId,
        tutorId: this.tutorId
      });

      return {
        success: false,
        message: `Failed to generate classwork from chat: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Factory to create a Tutor, initialize storage records, and create a backend session
 */
export async function createTutor(sdk: HenotaceAI, init: TutorInit): Promise<Tutor> {
  const logger = sdk.getLogger();
  const studentId = init.studentId;
  const tutorId = init.tutorId || `tutor_${Date.now().toString(36)}`;
  const tutorName = init.tutorName || tutorId;

  logger.info('Creating tutor', {
    studentId,
    tutorId,
    tutorName,
    subject: init.subject?.name,
    topic: init.subject?.topic,
    gradeLevel: init.grade_level,
    language: init.language
  });

  // Ensure storage entries
  if ((sdk as any)['storage']) {
    const storage: StorageConnector = (sdk as any)['storage'];
    await storage.upsertStudent({ id: studentId, tutors: [] } as any);
    await storage.upsertTutor(studentId, { id: tutorId, name: tutorName, subject: init.subject, chats: [] } as any);
    logger.debug('Storage entries created/updated');
  }

  // No backend session needed; we rely on storage-managed history + chat/completion
  const t = new Tutor(sdk, studentId, tutorId, init.subject?.name, init.subject?.topic);
  // Load any previously saved context from storage
  if ((sdk as any)['storage']) {
    const storage: StorageConnector = (sdk as any)['storage'];
    const tutors = await storage.listTutors(studentId);
    const existing = tutors.find(x => x.id === tutorId);
    if (existing?.context?.length) {
      t.setContext(existing.context);
      logger.debug('Loaded existing context from storage', { contextLength: existing.context.length });
    }
  }
  if (init.language || init.grade_level || init.subject?.topic) {
    // Optionally seed persistent context with tutor metadata
    const meta: string[] = [];
    if (init.language) meta.push(`Language: ${init.language}`);
    if (init.grade_level) meta.push(`Grade Level: ${init.grade_level}`);
    if (init.subject?.topic) meta.push(`Topic: ${init.subject.topic}`);
    if (meta.length) {
      t.setContext(meta);
      logger.debug('Set initial context from tutor metadata', { metaLength: meta.length });
    }
  }
  
  logger.info('Tutor created successfully', { studentId, tutorId });
  return t;
}

export async function createTutors(sdk: HenotaceAI, inits: TutorInit[]): Promise<Tutor[]> {
  const tutors: Tutor[] = [];
  for (const init of inits) {
    tutors.push(await createTutor(sdk, init));
  }
  return tutors;
}

// Export types
export * from './types';

// Export connectors
export { default as InMemoryConnector } from './connectors/inmemory';

// Export logger utilities
export { ConsoleLogger, NoOpLogger, createLogger } from './logger';

// Default export
export default HenotaceAI;
