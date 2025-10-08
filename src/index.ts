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
  TutorInit
} from './types';

export type HenotaceConfig = SDKConfig;

export class HenotaceAI {
  private client: AxiosInstance;
  private config: HenotaceConfig;
  private storage: StorageConnector | null;

  constructor(config: HenotaceConfig) {
    this.config = {
      baseUrl: 'https://api.djtconcept.ng',
      timeout: 30000,
      retries: 3,
      ...config
    };

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
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your credentials.');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 500) {
      throw new Error('Internal server error. Please try again later.');
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      throw new Error(`Network Error: ${error.message}`);
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Henotace SDK] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Henotace SDK] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[Henotace SDK] Response: ${response.status} ${response.statusText}`);
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          throw new Error('Invalid API key. Please check your credentials.');
        }

        if (error.response?.status === 429) {
          // Rate limit exceeded - don't retry immediately
          const retryAfter = error.response.headers['retry-after'] || 60;
          console.log(`[Henotace SDK] Rate limited. Retrying after ${retryAfter} seconds`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          return this.client(originalRequest);
        }

        if (error.response?.status >= 500 && originalRequest._retryCount < this.config.retries!) {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
          console.log(`[Henotace SDK] Retrying request (${originalRequest._retryCount}/${this.config.retries})`);
          
          await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
          return this.client(originalRequest);
        }

        console.error('[Henotace SDK] Response error:', error.response?.data || error.message);
        return Promise.reject(this.handleError(error));
      }
    );
  }


  /**
   * Check API status - raw response
   */
  async getStatus(): Promise<ApiResponse<{ status: string; message: string; timestamp: string }>> {
    try {
      const response = await this.client.get('/api/external/status/');
      return response.data;
    } catch (error: any) {
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

  // unified chat completion; replaces session-bound chat API usage
  private async completeChat(payload: { history: { role: 'user' | 'assistant'; content: string }[]; input: string; preset?: string }): Promise<{ ai_response: string }> {
    try {
      const response = await this.client.post('/api/external/working/chat/completion/', {
        history: payload.history,
        input: payload.input,
        preset: payload.preset || 'tutor_default'
      });
      const data = response.data;
      return { ai_response: data?.data?.ai_response || '' };
    } catch (error: any) {
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
  // Checkpoint compression settings
  private compression: { maxTurns: number; maxSummaryChars: number; checkpointEvery: number } = {
    maxTurns: 12,            // keep last N turns verbatim
    maxSummaryChars: 1200,   // cap summary length
    checkpointEvery: 10      // summarize every K turns
  };
  // sessionId removed: chats are storage-managed and backend receives history only

  constructor(sdk: HenotaceAI, studentId: string, tutorId: string) {
    this.sdk = sdk;
    this.studentId = studentId;
    this.tutorId = tutorId;
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
    // Build history from storage and use unified completion endpoint
    let history: { role: 'user' | 'assistant'; content: string }[] = [];
    const storage: StorageConnector | null = (this.sdk as any)['storage'] || null;
    if (storage) {
      // Compress on checkpoints / over window
      await this.autoCompressIfNeeded(storage);
      const chats = await storage.listChats(this.studentId, this.tutorId);
      history = chats.map(c => ({ role: c.isReply ? 'assistant' : 'user', content: c.message }));
    }
    // RAG-style context injection
    const ephemeral = opts?.context ? (Array.isArray(opts.context) ? opts.context : [opts.context]) : [];
    const mergedContext = [...this.persistentContext, ...ephemeral].filter(Boolean);
    if (mergedContext.length) {
      const clipped = mergedContext.slice(0, 5); // simple budget: top 5 snippets
      const contextBlock = ['[CONTEXT]', ...clipped.map(sn => (sn || '').toString())].join('\n');
      history.push({ role: 'assistant', content: contextBlock });
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
    }

    const completion = await (this.sdk as any).completeChat({ history, input: message, preset: opts?.preset || sdkConfig.defaultPreset || 'tutor_default' });
    const ai = completion?.ai_response || '';
    if (storage) {
      const now = Date.now();
      await storage.appendChat(this.studentId, this.tutorId, { message, isReply: false, timestamp: now } as SessionChat);
      if (ai) await storage.appendChat(this.studentId, this.tutorId, { message: ai, isReply: true, timestamp: now + 1 } as SessionChat);
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
}

/**
 * Factory to create a Tutor, initialize storage records, and create a backend session
 */
export async function createTutor(sdk: HenotaceAI, init: TutorInit): Promise<Tutor> {
  const studentId = init.studentId;
  const tutorId = init.tutorId || `tutor_${Date.now().toString(36)}`;
  const tutorName = init.tutorName || tutorId;

  // Ensure storage entries
  if ((sdk as any)['storage']) {
    const storage: StorageConnector = (sdk as any)['storage'];
    await storage.upsertStudent({ id: studentId, tutors: [] } as any);
    await storage.upsertTutor(studentId, { id: tutorId, name: tutorName, subject: init.subject, chats: [] } as any);
  }

  // No backend session needed; we rely on storage-managed history + chat/completion
  const t = new Tutor(sdk, studentId, tutorId);
  // Load any previously saved context from storage
  if ((sdk as any)['storage']) {
    const storage: StorageConnector = (sdk as any)['storage'];
    const tutors = await storage.listTutors(studentId);
    const existing = tutors.find(x => x.id === tutorId);
    if (existing?.context?.length) {
      t.setContext(existing.context);
    }
  }
  if (init.language || init.grade_level || init.subject?.topic) {
    // Optionally seed persistent context with tutor metadata
    const meta: string[] = [];
    if (init.language) meta.push(`Language: ${init.language}`);
    if (init.grade_level) meta.push(`Grade Level: ${init.grade_level}`);
    if (init.subject?.topic) meta.push(`Topic: ${init.subject.topic}`);
    if (meta.length) t.setContext(meta);
  }
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

// Default export
export default HenotaceAI;
